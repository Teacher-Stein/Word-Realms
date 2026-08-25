#!/usr/bin/env python3
"""
Realm 2 art pipeline. Differs from Realm 1 in three ways, all forced by what
Gemini actually returned:

  1. SEPARATE PALETTE. Realm 1's 56-colour cast palette is a storm palette -
     blues, greys, bone white. Forcing Realm 2's forest through it moved every
     colour by 27.6 RGB units on average and turned the moss purple. Realm 2
     gets its own extension: cast 56 + 45 forest colours.
  2. COLOUR-SEEDED SPLIT for the elite sheet. The owl's wing physically touches
     the mantis, so connected-component labelling returns them as one object at
     every dilation down to 1. They are separated by seeding on green/not-green
     and assigning each opaque pixel to the nearer seed.
  3. FLIPS. Four subjects came back facing right. Every monster in this game
     stands on the right of the arena and must face the hero on the left.
"""
import os, glob, pathlib, numpy as np
from PIL import Image
from scipy import ndimage
import importlib.util

# Paths are resolved from this file, not from the shell's working directory -
# the first version used "..", which from tools/pipeline/ pointed at tools/,
# so cast_palette() globbed nothing, returned an empty array, and the whole
# run died several steps later on a broadcast error that said nothing about
# the actual mistake.
HERE = pathlib.Path(__file__).resolve().parent
GAME = HERE.parents[1]

spec = importlib.util.spec_from_file_location("sp", HERE / "split_props.py")
sp = importlib.util.module_from_spec(spec); spec.loader.exec_module(sp)

# The raw Gemini sheets. They are ~18MB and are kept OUT of the game repo -
# see word-realms-realm2-art-source.zip. Unpack it beside the repo (so that
# art-source/ sits next to dungeon-crawler/) and run this to rebuild every
# Realm 2 asset from scratch.
SRC   = GAME.parent / "art-source" / "realm2"
DST_S = GAME / "assets" / "sprites" / "realm2"
DST_B = GAME / "assets" / "backdrops"

# sheet -> [(component index, output name, target height, flip?)]
SHEETS = {
  # index 3 is a duplicate Pebbleshell Crab; index 4 was the flat side-on Glass
  # Lizard, replaced by the reposed one below. Both dropped.
  "2dcba67a": [(0,"stick_moth",96,False),(1,"leafback_toad",92,False),
               (2,"pebbleshell_crab",90,False),(3,None,0,False),(4,None,0,False)],
  "fdbbbe41": [(0,"mimic_jay",112,True),(1,"bramble_cat",108,False),
               (2,"ashwing",100,False),(3,"sand_burrower",104,False)],
  "46f72b5e": [(0,"driftwood_stag",128,False),(1,"moss_bear",134,False),
               (2,"thornhog",100,True),(3,"hollow_fox",98,False)],
  # index 0 was the fused owl+mantis. The owl (the Watcher) is still taken
  # from it by colour-seeded split; the mantis was redrawn - see mantis_v2.
  "6d7705bc": [(0,"__SPLIT__",0,False),(1,"root_tyrant",140,False),
               (2,"skin_taker",138,False)],
  "6e6b1bf4": [(0,"camouflage",150,True)],
  # round two: the Glass Lizard reposed upright, and the Tracker redrawn at
  # NPC proportions. Both came back as single subjects, so index 0 is all of it.
  "lizard_v2":  [(0,"glass_lizard",112,False)],
  "tracker_v2": [(0,"tracker",88,False)],
  # round three: The Patient One redrawn. The first pass had two abdomens and
  # four hind legs; the second was anatomically right but flat cartoon line-art
  # and horizontal. This one is a mantis the forest has grown over - which is
  # the rule the whole realm follows and which the first two prompts missed.
  "mantis_v2":  [(0,"patient_one",128,False)],
}
SPLIT_H = {"watcher": 132}
BACKDROPS = {"4f90ad06":"realm2_band1","0f2ca12c":"realm2_band2","078dd144":"realm2_band3"}
WM = (0.885,0.795,0.950,0.900)

# Everywhere in Realm 1 the heroes are BRIGHTER than the room they stand in -
# hero luminance 86 against bands measuring 11-27. That bright-on-dark
# relationship is what makes the party read at the back of a classroom.
# Realm 2's sunlit band came back at luminance 117, which inverts it: the hero
# becomes the dark shape on a bright ground, the only place in the game where
# that happens. These pull the two lit bands into the same relationship the
# rest of the game uses. Band 3 is already dark and is left alone.
#
# name -> (multiply, cool-shift toward this colour, shift weight)
BAND_DIM = {
  # 0.60 was not enough: it left the sunlit band at luminance 77 against a hero
  # at 85, a separation of 8 where Realm 1's worst is 59. Technically not
  # inverted, but on a classroom TV eight points is nothing.
  "realm2_band1": (0.44, (12,18,14), 0.42),
  "realm2_band2": (0.80, (10,16,14), 0.16),
}
# what the hero-standing band of each backdrop should measure, checked below
TARGET_LUM = 70.0


def sheet_objects(fid, dilate=5, min_px=700):
    """Cut one sheet into finished, CLEAN objects.

    split_props.components() returns bounding boxes, and the obvious next move
    - crop that rectangle out of the keyed sheet - is wrong. A bounding box is
      a rectangle; a creature is not. Anything belonging to a NEIGHBOUR that
      happens to fall inside the rectangle comes along for the ride. That is
      how the Bramble Cat shipped with the Mimic Jay's beak floating beside its
      ear, and the Jay shipped with 162 pixels of the Cat's brambles.

    The fix is not to delete stray islands: several creatures here have
    detached pieces ON PURPOSE - the Hollow Fox sheds leaves, the Ashwing
    trails ash, the Sand Burrower throws up grit. Deleting small islands would
    strip exactly the details that make those three work.

    So instead every opaque pixel on the sheet is assigned to whichever
    creature it is NEAREST to. A shed leaf goes with its fox; a beak stays with
    its bird; nothing is invented and nothing intentional is lost.
    """
    rgb, alpha, bg = sp.key_magenta(f"{SRC}/{fid}.png")
    rgb = sp.defringe(rgb, alpha, bg)
    full = np.dstack([rgb, alpha])
    m = alpha > 0

    grown = ndimage.binary_dilation(m, np.ones((dilate, dilate), bool))
    lab, n = ndimage.label(grown)
    cores = [(lab == i) & m for i in range(1, n + 1)]
    cores = [c for c in cores if c.sum() >= min_px]

    # same reading order as split_props.components(): rows top to bottom,
    # then left to right - the SHEETS indices above depend on it
    def order(c):
        ys, xs = np.where(c)
        return (ys.min() // 200, xs.min())
    cores.sort(key=order)

    # Assign WHOLE ISLANDS, not individual pixels.
    #
    # Deciding per pixel looks equivalent and is not: a detached piece lying
    # between two creatures gets sliced down the middle, half going to each.
    # The synthetic fixture in tools/tests/test_sheet_split.py puts a spur
    # exactly there and per-pixel assignment split it 72 pixels one way and the
    # rest the other. A shed leaf belongs to one fox or the other; it is never
    # half of each.
    dist = np.stack([ndimage.distance_transform_edt(~c) for c in cores])
    lab_all, n_all = ndimage.label(m, np.ones((3, 3), bool))
    owner = np.full(m.shape, -1, dtype=np.int16)
    for j in range(1, n_all + 1):
        island = lab_all == j
        # closest approach from this island to each core; ties go to the first,
        # which is the leftmost core in reading order
        owner[island] = int(np.argmin([d[island].min() for d in dist]))

    objs = []
    for i in range(len(cores)):
        sel = m & (owner == i)
        ys, xs = np.where(sel)
        q = full.copy()
        q[..., 3] = np.where(sel, alpha, 0)
        objs.append(q[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    return objs


def split_by_colour(a):
    """Owl and mantis touch. Seed on green vs not-green, then nearest-seed."""
    m = a[...,3] > 0
    r,g,b = a[...,0].astype(int), a[...,1].astype(int), a[...,2].astype(int)
    green = m & (g > r+18) & (g > b+18)
    def biggest(sel):
        lab,n = ndimage.label(ndimage.binary_closing(sel, np.ones((7,7),bool)))
        return lab == int(np.argmax(ndimage.sum(sel,lab,range(1,n+1))))+1
    ms = biggest(green)
    os_ = biggest(m & ~ndimage.binary_dilation(green, np.ones((3,3),bool)))
    dm, do = ndimage.distance_transform_edt(~ms), ndimage.distance_transform_edt(~os_)
    # Only the owl is taken from this sheet now. The mantis half of the split
    # was the Patient One, and it was redrawn (mantis_v2) because the original
    # had two abdomens. Returning it here as well would produce a sprite that
    # is then silently overwritten depending on dict ordering - a trap for
    # whoever edits SHEETS next.
    out = {}
    for name, sel in (("watcher", m & (do < dm)),):
        ys, xs = np.where(sel)
        q = a.copy(); q[...,3] = np.where(sel, a[...,3], 0)
        out[name] = q[ys.min():ys.max()+1, xs.min():xs.max()+1]
    return out


def shrink(a, th):
    im = Image.fromarray(a.astype(np.uint8), "RGBA")
    f = np.array(im).astype(np.float64); al = f[...,3:4]/255.0
    pm = np.dstack([f[...,:3]*al, f[...,3]])
    tw = max(1, int(round(im.width * th/im.height)))
    s = np.array(Image.fromarray(pm.astype(np.uint8),"RGBA").resize((tw,th),Image.BOX)).astype(np.float64)
    a2 = s[...,3:4]/255.0
    return np.clip(np.where(a2>0.004, s[...,:3]/np.maximum(a2,1e-6), 0),0,255), \
           np.where(s[...,3]>=110,255,0)


def cast_palette():
    cols=set()
    for f in glob.glob(f"{GAME}/assets/sprites/*.png")+glob.glob(f"{GAME}/assets/heroes/*.png"):
        x=np.array(Image.open(f).convert("RGBA")); sel=x[...,3]>200
        for c in np.unique(x[sel][:,:3],axis=0): cols.add(tuple(int(v) for v in c))
    return np.array(sorted(cols),dtype=np.float64)


def quantise(rgb, alpha, P):
    h,w,_ = rgb.shape; f = rgb.reshape(-1,3)
    idx = np.empty(len(f), np.int32)
    for i in range(0,len(f),20000):
        idx[i:i+20000] = ((f[i:i+20000,None,:]-P[None,:,:])**2).sum(2).argmin(1)
    return np.dstack([P[idx].reshape(h,w,3), alpha]).astype(np.uint8)


def strip_sparkle(a):
    """Gemini stamps a pale lavender sparkle in the bottom-right of every
    image. On the backdrops it lands on scenery and the mirror patch below
    handles it; on the sprite sheets it lands ON a creature every time. Most of
    it quantises away at 5-6x downscale, but not all - so any surviving pale
    lavender inside the silhouette is refilled from its nearest honest
    neighbour."""
    m = a[...,3] > 0
    r,g,b = a[...,0].astype(int), a[...,1].astype(int), a[...,2].astype(int)
    lav = m & (r>170) & (b>180) & (b>=r) & (g<b-6) & (g>140)
    if not lav.any():
        return a, 0
    lav = ndimage.binary_dilation(lav, np.ones((3,3),bool)) & m
    ind = ndimage.distance_transform_edt(~(m & ~lav), return_distances=False,
                                         return_indices=True)
    out = a.copy()
    for c in range(3):
        out[...,c] = np.where(lav, a[...,c][tuple(ind)], a[...,c])
    return out, int(lav.sum())


def dewatermark(a):
    h,w = a.shape[:2]
    x0,y0,x1,y1 = int(WM[0]*w),int(WM[1]*h),int(WM[2]*w),int(WM[3]*h)
    patch = a[y0:y1, w-x1:w-x0][:, ::-1]
    out = a.copy(); bw = x1-x0
    ramp = np.clip(np.minimum(np.arange(bw), bw-1-np.arange(bw))/6.0, 0, 1)
    out[y0:y1,x0:x1] = patch*ramp[None,:,None] + out[y0:y1,x0:x1]*(1-ramp[None,:,None])
    return out


if __name__ == "__main__":
    os.makedirs(DST_S, exist_ok=True); os.makedirs(DST_B, exist_ok=True)
    raw = {}
    for fid, plan in SHEETS.items():
        objs = sheet_objects(fid)
        for idx, name, th, flip in plan:
            if name is None: continue
            crop = objs[idx]
            if name == "__SPLIT__":
                for n2, arr in split_by_colour(crop).items():
                    raw[n2] = (arr, SPLIT_H[n2], False)
            else:
                raw[name] = (crop, th, flip)

    shrunk = {n: shrink(a, th) + (flip,) for n,(a,th,flip) in raw.items()}
    cast = cast_palette()
    allpx = np.concatenate([r[s>0] for r,s,_ in shrunk.values()]).astype(np.uint8)
    ex = np.unique(np.array(Image.fromarray(allpx.reshape(-1,1,3),"RGB")
          .quantize(colors=64, method=Image.MEDIANCUT).convert("RGB")).reshape(-1,3), axis=0).astype(float)
    keep = [c for c in ex if ((cast-c)**2).sum(1).min() > 400]
    pal = np.vstack([cast, np.array(keep)])
    print(f"realm-2 palette: {len(cast)} cast + {len(keep)} forest = {len(pal)}")

    for n,(rgb,alpha,flip) in shrunk.items():
        out = quantise(rgb, alpha, pal)
        if flip: out = out[:, ::-1]
        out, wm = strip_sparkle(out)
        Image.fromarray(out,"RGBA").save(f"{DST_S}/{n}.png")
        print(f"  {n:18s} {out.shape[1]:3d}x{out.shape[0]:<3d}"
              f"{'  [flipped]' if flip else ''}{f'  [-{wm}px sparkle]' if wm else ''}")
    np.save(HERE / "realm2_palette.npy", pal)

    extras=[]
    for fid in BACKDROPS:
        a=np.array(Image.open(f"{SRC}/{fid}.png").convert("RGB"))
        extras.append(np.array(Image.fromarray(a).quantize(colors=40,method=Image.MEDIANCUT).convert("RGB")).reshape(-1,3))
    ex2=np.unique(np.concatenate(extras),axis=0).astype(float)
    k2=[c for c in ex2 if ((pal-c)**2).sum(1).min()>700]
    P=np.vstack([pal,np.array(k2)]) if k2 else pal
    print(f"backdrop palette: {len(pal)} + {len(k2)} = {len(P)}")
    hero = np.concatenate([np.array(Image.open(f))[np.array(Image.open(f))[...,3]>0][:,:3]
                           for f in glob.glob(f"{GAME}/assets/heroes/*.png")]).astype(float)
    hlum = (0.299*hero[:,0]+0.587*hero[:,1]+0.114*hero[:,2]).mean()
    print(f"hero luminance {hlum:.1f} - every band must sit below this")

    for fid,name in BACKDROPS.items():
        a=dewatermark(np.array(Image.open(f"{SRC}/{fid}.png").convert("RGB")).astype(float))
        small=np.array(Image.fromarray(a.astype(np.uint8)).resize((640,360),Image.BOX)).astype(float)
        if name in BAND_DIM:
            mul, tint, wgt = BAND_DIM[name]
            small = np.clip(small*mul + np.array(tint)*wgt, 0, 255)
        h,w,_=small.shape; f=small.reshape(-1,3); idx=np.empty(len(f),np.int32)
        for i in range(0,len(f),20000):
            idx[i:i+20000]=((f[i:i+20000,None,:]-P[None,:,:])**2).sum(2).argmin(1)
        out=P[idx].reshape(h,w,3).astype(np.uint8)
        Image.fromarray(out,"RGB").save(f"{DST_B}/{name}.png")
        # the band the party actually stands in, not the whole picture
        g=out[int(h*0.55):int(h*0.95)].reshape(-1,3).astype(float)
        blum=(0.299*g[:,0]+0.587*g[:,1]+0.114*g[:,2]).mean()
        ok = "ok" if blum < hlum else "INVERTED - hero is darker than the ground"
        print(f"  {name}  640x360   ground luminance {blum:5.1f}  "
              f"(hero +{hlum-blum:5.1f})  {ok}")
