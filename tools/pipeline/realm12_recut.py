#!/usr/bin/env python3
"""Re-cut Realms 1 and 2 (and the heroes) at Realm 3's resolution.

WHY THIS EXISTS. Realm 3 ships sprites cut at 176-300 true pixels; Realms 1 and
2 were cut at 88-150 and the heroes at 88. The game draws everything to roughly
the same height, so a Realm 3 machine carries 2.0-3.4x the pixels of a hero and
the party looked, in Stein's words, "pretty low quality now compared to the
monsters". Nothing needs redrawing: split_props.py keys the magenta at full
resolution and only downscales at the very end, so the detail was always in the
original sheets - it was thrown away in the last step.

HOW THE MAPPING IS DERIVED, AND WHY NOT BY HAND. realm2_art.py carries a table
of (sheet, index) -> name that was written by eye. Hand-derived indices are
exactly what produced the v7.1 bug where three Realm 3 machines wore each
other's art, and they are fragile here for a second reason: this file uses
realm3_art.read_order(), under which three of these sheets order differently
than they did when that table was written.

So nothing is hand-derived. Every shipped sprite IS one of these subjects,
already correctly named and already correctly oriented, which makes it ground
truth. Each freshly cut subject is scored against every candidate at the
candidate's own size, both ways round; the best score names the file and
recovers the flip. The mapping below was produced by tools/pipeline/../../
recut12/cut_and_match.py and every entry scored >= 0.85 with a margin over the
runner-up of >= 0.30, except the three noted.

That process also corrected two subjects the assistant had identified wrongly
by eye a week earlier - the Glass Lizard and the Tracker were swapped.
"""
import sys, glob, pathlib, types
import numpy as np
from PIL import Image
from scipy import ndimage

GAME = pathlib.Path(__file__).resolve().parents[2]
HERE = GAME/"tools"/"pipeline"
sys.path.insert(0, str(HERE))
_r2 = (HERE/"realm2_art.py").read_text().split("if __name__")[0]
ra = types.ModuleType("ra"); ra.__dict__["__file__"] = str(HERE/"realm2_art.py")
exec(compile(_r2, "realm2_art.py", "exec"), ra.__dict__)
_r3 = (HERE/"realm3_art.py").read_text()
_ns = {}
exec(compile(_r3[_r3.index("def read_order"):_r3.index("def sheet_objects")], "ro", "exec"), _ns)
read_order = _ns["read_order"]

SRC = pathlib.Path("/root/.claude/uploads/8ad730cb-4d42-52fb-bf74-48740e503753")

# (sheet, index) -> (output path, flip). Derived by matching, not by eye.
MAP = {
  # --- heroes: every realm stands them next to its own cast -----------------
  # REDESIGNED 29/09. The old sheet (7935d624) drew them standing at
  # attention, because the prompt asked for "standing, neutral, weight even" to
  # protect the idle bob. That was an over-correction: the bob is a 14px
  # vertical lift, so the only pose it breaks is one with a foot off the
  # ground. The new sheet keeps both feet planted and puts everything above the
  # ankles in motion.
  #
  # The Wordsmith is FLIPPED. She came back facing left; the party stands on the
  # left of the arena, so she was turning away from the fight.
  ("heroes-v2",0): ("assets/heroes/wordsmith.png", True),
  ("heroes-v2",1): ("assets/heroes/knight.png",    False),
  ("heroes-v2",2): ("assets/heroes/ranger.png",    False),
  ("heroes-v2",3): ("assets/heroes/scholar.png",   False),
  # --- realm 1 --------------------------------------------------------------
  ("50c1c84a",0): ("assets/sprites/shimmer.png",    False),
  ("50c1c84a",1): ("assets/sprites/crow.png",       False),
  ("50c1c84a",2): ("assets/sprites/herald.png",     False),
  ("50c1c84a",3): ("assets/sprites/siren.png",      False),
  ("8c430c56",0): ("assets/sprites/brute.png",      False),
  ("8c430c56",1): ("assets/sprites/fang.png",       False),
  ("8c430c56",2): ("assets/sprites/serpent.png",    False),
  ("8c430c56",3): ("assets/sprites/husk.png",       False),
  ("ce9a04fa",0): ("assets/sprites/warden.png",     False),
  ("ce9a04fa",1): ("assets/sprites/colossus.png",   False),
  ("ce9a04fa",2): ("assets/sprites/eyewalker.png",  False),
  ("ce9a04fa",3): ("assets/sprites/permafrost.png", False),
  ("2227280c",0): ("assets/sprites/wyrm.png",       False),
  ("2227280c",1): ("assets/sprites/wisp.png",       False),
  ("2227280c",2): ("assets/sprites/djinn.png",      False),
  ("2227280c",3): ("assets/sprites/funnel.png",     False),
  ("a2d664d1",0): ("assets/sprites/titan.png",      False),
  ("a2d664d1",1): ("assets/sprites/chaser.png",     False),
  # --- realm 2 --------------------------------------------------------------
  ("7f680358",0): ("assets/sprites/realm2/thornhog.png",       True),
  ("7f680358",1): ("assets/sprites/realm2/hollow_fox.png",     False),
  ("7f680358",2): ("assets/sprites/realm2/driftwood_stag.png", False),
  ("7f680358",3): ("assets/sprites/realm2/moss_bear.png",      False),
  ("bcb8de83",0): ("assets/sprites/realm2/mimic_jay.png",      True),
  ("bcb8de83",1): ("assets/sprites/realm2/bramble_cat.png",    False),
  ("bcb8de83",2): ("assets/sprites/realm2/ashwing.png",        False),
  ("bcb8de83",3): ("assets/sprites/realm2/sand_burrower.png",  False),
  ("158d8e63",0): ("assets/sprites/realm2/stick_moth.png",     False),
  ("158d8e63",1): ("assets/sprites/realm2/leafback_toad.png",  False),
  ("158d8e63",2): ("assets/sprites/realm2/pebbleshell_crab.png", False),
  # 158d8e63 index 3 is a DUPLICATE crab and index 4 the old flat Glass
  # Lizard that was replaced. Both matched their targets at 0.51 and 0.35
  # against the winners' 0.94 and 0.91 - the scores name them as the rejects
  # they are, which is a nice check on the method.
  ("1f79caa3",1): ("assets/sprites/realm2/root_tyrant.png",    False),
  ("1f79caa3",2): ("assets/sprites/realm2/skin_taker.png",     False),
  ("0ed6e7b8",0): ("assets/sprites/realm2/camouflage.png",     True),
  # 0ed6e7b8 index 1 is the FIRST Tracker, drawn at realistic proportions and
  # rejected for it. It scored 0.60 against the accepted one's 0.93.
  ("89f8b794",0): ("assets/sprites/realm2/glass_lizard.png",   False),
  ("4e75a1a0",0): ("assets/sprites/realm2/tracker.png",        False),
}
# The owl and the mantis physically touch on sheet 1f79caa3 and come back as one
# object at every dilation. realm2_art.split_by_colour() seeds on green/not-green
# and takes the owl. The mantis was redrawn as a separate round-three sheet that
# was never sent, so The Patient One keeps its old cut - see the report at the end.
FUSED = ("1f79caa3", 0, "assets/sprites/realm2/watcher.png")
NO_SOURCE = "assets/sprites/realm2/patient_one.png"

# The ORIGINAL heights, as shipped up to v7.1. Hard-coded on purpose.
#
# The first version of this script computed each target by reading the file
# on disk and doubling it - which is not idempotent. Running it twice, as
# happened while widening the palette, doubled the already-doubled art and
# put the heroes at 352px and the Hurricane Titan at 600. Nothing failed; the
# game just drew everything from a four-times-too-big source, and the only
# reason it was caught is that a measurement printed naturalHeight.
#
# A script that reads its own output has no fixed point. These numbers are the
# fixed point.
ORIGINAL_H = {
  "assets/sprites/realm2/watcher.png": 132,   # the owl, split out of the fused elite
  "assets/heroes/knight.png": 88,
  "assets/heroes/ranger.png": 88,
  "assets/heroes/scholar.png": 88,
  "assets/heroes/wordsmith.png": 88,
  "assets/sprites/brute.png": 124,
  "assets/sprites/chaser.png": 88,
  "assets/sprites/colossus.png": 136,
  "assets/sprites/crow.png": 118,
  "assets/sprites/djinn.png": 106,
  "assets/sprites/eyewalker.png": 134,
  "assets/sprites/fang.png": 110,
  "assets/sprites/funnel.png": 96,
  "assets/sprites/herald.png": 120,
  "assets/sprites/husk.png": 118,
  "assets/sprites/permafrost.png": 142,
  "assets/sprites/realm2/ashwing.png": 100,
  "assets/sprites/realm2/bramble_cat.png": 108,
  "assets/sprites/realm2/camouflage.png": 150,
  "assets/sprites/realm2/driftwood_stag.png": 128,
  "assets/sprites/realm2/glass_lizard.png": 112,
  "assets/sprites/realm2/hollow_fox.png": 98,
  "assets/sprites/realm2/leafback_toad.png": 92,
  "assets/sprites/realm2/mimic_jay.png": 112,
  "assets/sprites/realm2/moss_bear.png": 134,
  "assets/sprites/realm2/pebbleshell_crab.png": 90,
  "assets/sprites/realm2/root_tyrant.png": 140,
  "assets/sprites/realm2/sand_burrower.png": 104,
  "assets/sprites/realm2/skin_taker.png": 138,
  "assets/sprites/realm2/stick_moth.png": 96,
  "assets/sprites/realm2/thornhog.png": 100,
  "assets/sprites/realm2/tracker.png": 88,
  "assets/sprites/serpent.png": 116,
  "assets/sprites/shimmer.png": 112,
  "assets/sprites/siren.png": 112,
  "assets/sprites/titan.png": 150,
  "assets/sprites/warden.png": 134,
  "assets/sprites/wisp.png": 98,
  "assets/sprites/wyrm.png": 112,
}

SCALE = 2          # double the resolution; the game needs no change, see below


def cut(path, min_px=5000):
    rgb, alpha, bg = ra.sp.key_magenta(str(path))
    rgb = ra.sp.defringe(rgb, alpha, bg)
    full = np.dstack([rgb, alpha]); m = alpha > 0
    lab, n = ndimage.label(ndimage.binary_dilation(m, np.ones((5,5),bool)))
    cores = [(lab==i)&m for i in range(1,n+1)]
    cores = [c for c in cores if c.sum() >= min_px]
    bx = []
    for c in cores:
        ys,xs = np.where(c); bx.append((int(xs.min()),int(ys.min()),int(xs.max()),int(ys.max())))
    cores = [cores[i] for i in read_order(bx)]
    dist = np.stack([ndimage.distance_transform_edt(~c) for c in cores])
    lab_all, n_all = ndimage.label(m, np.ones((3,3),bool))
    owner = np.full(m.shape, -1, np.int16)
    for j in range(1, n_all+1):
        isl = lab_all == j
        owner[isl] = int(np.argmin([d[isl].min() for d in dist]))
    out = []
    for i in range(len(cores)):
        sel = m & (owner == i)
        ys,xs = np.where(sel)
        q = full.copy(); q[...,3] = np.where(sel, alpha, 0)
        out.append(q[ys.min():ys.max()+1, xs.min():xs.max()+1])
    return out


def quantise(rgb, alpha, P):
    h,w,_ = rgb.shape; f = rgb.reshape(-1,3)
    idx = np.empty(len(f), np.int32)
    for i in range(0,len(f),20000):
        idx[i:i+20000] = ((f[i:i+20000,None,:]-P[None,:,:])**2).sum(2).argmin(1)
    return np.dstack([P[idx].reshape(h,w,3), alpha]).astype(np.uint8), \
           np.sqrt(((P[idx]-f)**2).sum(1)).mean()


def extend(base, px, colours, min_dist):
    ex = np.unique(np.array(Image.fromarray(px.reshape(-1,1,3),"RGB")
          .quantize(colors=colours, method=Image.MEDIANCUT).convert("RGB")).reshape(-1,3),axis=0).astype(float)
    keep = [c for c in ex if ((base-c)**2).sum(1).min() > min_dist]
    return (np.vstack([base, np.array(keep)]) if keep else base), len(keep)


if __name__ == "__main__":
    # target heights: exactly double what shipped, so the game renders them at
    # the same size. updateStageScale() divides by the height of the sprite on
    # screen and heroScale() now reads the hero's own height, so nothing in the
    # game has to know this happened.
    targets = {out: ORIGINAL_H[out] * SCALE for _, (out, _) in MAP.items()}
    targets[FUSED[2]] = ORIGINAL_H[FUSED[2]] * SCALE

    # The redesigned hero sheet is kept in the repo (it is small and it is the
    # one source we cannot re-request); the realm sheets stay where they landed.
    HERO_SHEET = pathlib.Path(__file__).resolve().parent / "source" / "heroes-v2.png"
    subjects = {}
    for (stem, idx), (out, flip) in MAP.items():
        subjects.setdefault(stem, None)
    for stem in list(subjects):
        subjects[stem] = cut(HERO_SHEET if stem == "heroes-v2"
                             else SRC/f"{stem}-image.png")

    cut_arrays = {}
    for (stem, idx), (out, flip) in MAP.items():
        a, _ = ra.strip_sparkle(subjects[stem][idx])
        rgb, al = ra.shrink(a, targets[out])
        cut_arrays[out] = (rgb, al, flip)
    owl = ra.split_by_colour(subjects[FUSED[0]][FUSED[1]])["watcher"]
    owl, _ = ra.strip_sparkle(owl)
    rgb, al = ra.shrink(owl, targets[FUSED[2]])
    cut_arrays[FUSED[2]] = (rgb, al, False)

    # palettes: the heroes anchor, each realm extends. Built from the NEW cuts,
    # not from the old low-resolution output - that was circular and is what
    # realm3_art.py's note warns about.
    # PER HERO, then union - not one pool.
    #
    # Pooling all four and taking 160 colours gives each hero a share
    # proportional to its PIXEL COUNT, so the Ranger's greens - a minority in a
    # party otherwise dressed in blue and steel - were quantised at an error of
    # 15 while the Knight sat at 9.9. Taking a fixed quota from each hero and
    # unioning them costs a few dozen colours and treats them equally.
    hero_keys = [k for k in cut_arrays if "/heroes/" in k]
    per = []
    for k in hero_keys:
        r, a, _ = cut_arrays[k]
        px = r[a > 0].astype(np.uint8)
        ex = np.unique(np.array(Image.fromarray(px.reshape(-1, 1, 3), "RGB")
              .quantize(colors=112, method=Image.MEDIANCUT)
              .convert("RGB")).reshape(-1, 3), axis=0).astype(float)
        per.append(ex)
    hero_px = np.concatenate([r[a>0] for k,(r,a,_) in cut_arrays.items()
                              if "/heroes/" in k]).astype(np.uint8)
    # 64 was enough for the old flat-shaded heroes. The redesigned ones are
    # far richer - more rendering on the armour, more colour in the cloth - and
    # at 64 they quantised with an error of 25, twice the 12 this file treats as
    # the ceiling. The heroes are the BASE every realm's palette extends from,
    # so starving this number starves the whole game.
    base = np.unique(np.vstack(per), axis=0)
    print(f"hero palette: {len(base)} colours")

    groups = {"realm1": [k for k in cut_arrays if k.startswith("assets/sprites/") and "/realm2/" not in k],
              "realm2": [k for k in cut_arrays if "/realm2/" in k],
              "heroes": [k for k in cut_arrays if "/heroes/" in k]}
    worst = {}
    for gname, keys in groups.items():
        if gname == "heroes":
            P = base
        else:
            # PER SPRITE, for the same reason the heroes are done per hero.
            # Pooling a realm and taking 128 colours shares them out by PIXEL
            # COUNT, so the Heatwave Shimmer - the one orange thing in a realm
            # of blues and greys - quantised at an error of 18 against a
            # hero-derived base containing no oranges at all. A fixed quota per
            # sprite guarantees every creature contributes its own colours, at
            # the cost of a few dozen palette entries.
            quota = []
            for k in keys:
                r, a, _ = cut_arrays[k]
                px = r[a > 0].astype(np.uint8)
                if not len(px):
                    continue
                quota.append(np.unique(np.array(
                    Image.fromarray(px.reshape(-1, 1, 3), "RGB")
                    .quantize(colors=24, method=Image.MEDIANCUT)
                    .convert("RGB")).reshape(-1, 3), axis=0).astype(float))
            cand = np.unique(np.vstack(quota), axis=0)
            keep = [c for c in cand if ((base - c) ** 2).sum(1).min() > 250]
            P = np.vstack([base, np.array(keep)]) if keep else base
            print(f"{gname} palette: {len(base)} hero + {len(keep)} = {len(P)}")
        for k in keys:
            rgb, al, flip = cut_arrays[k]
            out, err = quantise(rgb, al, P)
            if flip: out = out[:, ::-1]
            Image.fromarray(out, "RGBA").save(GAME/k)
            worst[k] = (out.shape[1], out.shape[0], err)

    print(f"\n{'file':44s}{'size':>12s}{'err':>7s}")
    for k in sorted(worst):
        w,h,e = worst[k]
        print(f"  {k:42s}{str(w)+'x'+str(h):>12s}{e:7.1f}")
    print(f"\nworst quantise error {max(v[2] for v in worst.values()):.1f}")
    # The Patient One's round-three sheet was never sent, so it cannot be
    # re-cut. It is instead doubled with NEAREST so it sits in the same size
    # band as everything else and the game treats it uniformly - it gains no
    # detail and looks exactly as it did, because the renderer was halving it
    # anyway. Re-cut it properly if that sheet ever turns up.
    ip = GAME/NO_SOURCE
    im = Image.open(ip).convert("RGBA")
    if im.size[1] < 150:
        im.resize((im.width*2, im.height*2), Image.NEAREST).save(ip)
    print(f"NOT re-cut (no source sheet was ever sent), nearest-doubled instead: {NO_SOURCE}")
