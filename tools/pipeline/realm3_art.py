#!/usr/bin/env python3
"""
Realm 3 art pipeline - The Iron Orchestra.

Differs from Realm 1 and 2 in four ways, each forced by a decision taken on
25-26 September 2026 and recorded in art-generation-log.md:

  1. TWICE THE RESOLUTION. Realms 1-2 cut sprites at 88-150px and drew them at
     SPRITE_SCALE 4. Realm 3 cuts at 176-300px and draws at 2: the same size on
     a classroom TV, four times the detail. Nothing here would have been
     possible if split_props.py had downscaled early - it keys the magenta at
     full resolution and shrinks last, so the detail was always in the file.

  2. ITS OWN PALETTE, BUILT FROM ITS OWN SOURCE. realm2_art.cast_palette()
     derives colours by reading the FINISHED low-resolution sprites, which is
     circular the moment the resolution changes: it would quantise a sharp new
     cast onto 56 colours sampled from the blurry old one, flattening exactly
     the detail we just bought and dragging the workshop's brass toward Realm
     1's storm blues. Here the base is the HEROES only (they appear in every
     realm and must stay consistent) and the extension is sampled from Realm
     3's own sheets.

  3. CROPS BEFORE SPLITTING. Three sheets came back with rubbish attached -
     names burned under the subjects on sheets 1 and 12, and a row of
     unfinished white line-art duplicates on sheet 14. Every one had a clean
     band of empty rows between the good art and the bad, so a single
     horizontal crop fixes each. That is cheaper than a regeneration and is now
     the first thing to check when a sheet comes back dirty.

  4. FLIPS ARE THE RULE, NOT THE EXCEPTION. Sixteen of eighteen subjects came
     back facing away from the party. Stein called them off a numbered A/B
     board; his answers are the FLIP set below. The Tuner is NOT flipped: the
     guide renders in the monster slot but is drawn front-on facing the viewer,
     like both shipped guides, so mirroring only swaps which shoulder carries
     her ear trumpet.

Run from anywhere:  python3 tools/pipeline/realm3_art.py
"""
import os, glob, pathlib, importlib.util, types
import numpy as np
from PIL import Image
from scipy import ndimage

HERE = pathlib.Path(__file__).resolve().parent
GAME = HERE.parents[1]

# realm2_art.py does the hard parts - keying, island assignment, defringing,
# sparkle removal, the BOX shrink. Import its functions without running its
# __main__, which would go looking for Realm 2's source folder.
_src = (HERE / "realm2_art.py").read_text().split("if __name__")[0]
ra = types.ModuleType("ra"); ra.__dict__["__file__"] = str(HERE / "realm2_art.py")
exec(compile(_src, "realm2_art.py", "exec"), ra.__dict__)

SRC   = pathlib.Path("/home/claude/realm3/fixed")   # the raw sheets as sent
WORK  = pathlib.Path("/home/claude/realm3")         # cropped copies live here
DST_S = GAME / "assets" / "sprites" / "realm3"
DST_B = GAME / "assets" / "backdrops"
DST_I = GAME / "assets" / "items"

# --- sheets that need a horizontal crop before anything else ----------------
# value = keep everything ABOVE this row. See note 3.
CROP = {
    "sheet01-clockwork.png":  570,   # THE TICKER / THE JEWELBOX / ... burned in
    "sheet12-flasks.png":     600,   # HEALING DRAUGHT / POTION OF CLARITY / ...
    "sheet14-brassmetal.png": 390,   # second row of unfinished white duplicates
}

# --- the cast ---------------------------------------------------------------
# (sheet, index, output name, target height). Reading order left to right.
# Heights are the old 88-150 band doubled, then banded by depth so the class
# can see the realm getting heavier as they descend.
SPRITES = [
    ("sheet01-clockwork",   0, "ticker",        196),
    ("sheet01-clockwork",   1, "jewelbox",      180),
    ("sheet01-clockwork",   2, "keywind",       200),
    ("sheet01-clockwork",   3, "whistler",      196),
    ("sheet02-brass",       0, "bellows",       210),
    ("sheet02-brass",       1, "drummer",       220),
    ("sheet02-brass",       2, "stringer",      236),
    ("sheet02-brass",       3, "hornhead",      226),
    ("sheet03-industrial",  0, "stack",         250),
    ("sheet03-industrial",  1, "boilerdrum",    246),
    ("sheet03-industrial",  2, "siren_tower",   268),
    ("sheet03-industrial",  3, "piston",        262),
    ("sheet04-elites",      0, "conductor",     284),
    ("sheet04-elites",      1, "organ_engine",  290),
    ("sheet04-elites",      2, "first_chair",   276),
    ("sheet04-elites",      3, "feedback",      262),
    ("sheet05-boss-guide",  0, "maestro",       300),
    ("sheet05-boss-guide",  1, "tuner",         176),
]

# Stein's A/B call, 26 September 2026. Everything flips except these two.
NO_FLIP = {"ticker", "jewelbox", "tuner"}

# --- the shared item icons --------------------------------------------------
# NOT Realm 3's palette: items appear in all nine realms, so these keep the
# neutral fantasy set they were drawn in and are quantised on their own.
ICON_H = 64          # popup shows 132, shop 76, relic row 30 - see the log
ICONS = [
    ("sheet09-weapons",    ["storm_blade", "thunder_pike", "giant_slayer", "warding_stave"]),
    ("sheet10-armour",     ["windwarden", "stormhide", "aegis_mantle", "warm_cloak"]),
    ("sheet11-runes",      ["frost_etch", "greed_etch", "ward_etch", "thorn_etch"]),
    ("sheet12-flasks",     ["potion_heal", "potion_clarity", "potion_shield", "last_breath"]),
    ("sheet13-stone",      ["echo_shard", "thunder_sigil", "aegis_charm", "thaw_stone"]),
    ("sheet14-brassmetal", ["scholars_lens", "iron_bell", "riposte_ring", "storm_crown"]),
    ("sheet15-leather",    ["ember_pouch", "coin_purse", "potion_patch", "lucky_charm"]),
    ("sheet16-paper",      ["storm_map", "team_banner", "second_wind"]),
    ("sheet17-odd",        ["oracle_eye", "magpie_eye", "keen_edge"]),
]

# --- backdrops --------------------------------------------------------------
# All three passed the hero-luminance rule untouched, which has not happened
# before: ground 27.5 / 27.8 / 19.8 against heroes at 84.7, separations of
# +57 / +57 / +65. Realm 2 needed dimming in code; these need none.
BACKDROPS = {"sheet06-workfloor": "realm3_band1",
             "sheet07-assembly":  "realm3_band2",
             "sheet08-greatwork": "realm3_band3"}
BD_W, BD_H = 1280, 720      # was 640x360; a 1080p TV was upscaling 3x


# ---------------------------------------------------------------------------
# READING ORDER - and the bug that made this function necessary.
#
# realm2_art.sheet_objects() orders subjects with `(ys.min() // 200, xs.min())`:
# bucket the TOP EDGE into fixed 200-pixel bands, then sort left to right within
# a band. On a sheet of four subjects that are all roughly the same height that
# is correct, and it was correct for every Realm 2 sheet.
#
# Realm 3's clockwork sheet has a 379px Ticker beside a 279px Jewelbox. Their
# top edges are at y=174 and y=256 - three quarters of the way down the SAME
# row, but on opposite sides of the y=200 boundary. The sort therefore decided
# the sheet had two rows, read the far-right Whistler second, and handed three
# of the four machines the wrong name. The game shipped with a monster called
# Keywind wearing the Jewelbox's art, and Stein found it in a live run.
#
# The fix is to stop guessing where the rows are from a magic constant. Two
# subjects are on the same row if their vertical spans OVERLAP AT ALL, which is
# what "same row" actually means. Rows then read top to bottom and each row
# reads left to right. It needs no threshold, so there is no number to get
# wrong on the next realm.
#
# NOT applied to realm2_art.py on purpose. Three of Realm 1 and Realm 2's
# sheets order differently under this rule, and their SHEETS indices were
# hand-assigned against the old one and verified by eye at the time. Changing
# the shared function would silently re-cut shipped art. See the warning there.
def read_order(boxes):
    """boxes: list of (x0, y0, x1, y1). Returns indices in true reading order."""
    order, row, bottom = [], [], None
    for i in sorted(range(len(boxes)), key=lambda i: boxes[i][1]):
        y0, y1 = boxes[i][1], boxes[i][3]
        if row and y0 > bottom:               # starts below everything so far
            order += sorted(row, key=lambda j: boxes[j][0])
            row, bottom = [], None
        row.append(i)
        bottom = y1 if bottom is None else max(bottom, y1)
    if row:
        order += sorted(row, key=lambda j: boxes[j][0])
    return order


def sheet_objects(stem):
    """realm2_art.sheet_objects with the reading order corrected.

    Everything else - the magenta key, the defringe, and the nearest-island
    assignment that keeps a shed leaf with its fox - is reused unchanged from
    realm2_art.py. Only the sort is different.
    """
    from scipy import ndimage
    path = prepared(stem)
    rgb, alpha, bg = ra.sp.key_magenta(str(path))
    rgb = ra.sp.defringe(rgb, alpha, bg)
    full = np.dstack([rgb, alpha])
    m = alpha > 0

    lab, n = ndimage.label(ndimage.binary_dilation(m, np.ones((5, 5), bool)))
    cores = [(lab == i) & m for i in range(1, n + 1)]
    cores = [c for c in cores if c.sum() >= 700]

    boxes = []
    for c in cores:
        ys, xs = np.where(c)
        boxes.append((int(xs.min()), int(ys.min()), int(xs.max()), int(ys.max())))
    cores = [cores[i] for i in read_order(boxes)]

    dist = np.stack([ndimage.distance_transform_edt(~c) for c in cores])
    lab_all, n_all = ndimage.label(m, np.ones((3, 3), bool))
    owner = np.full(m.shape, -1, dtype=np.int16)
    for j in range(1, n_all + 1):
        island = lab_all == j
        owner[island] = int(np.argmin([d[island].min() for d in dist]))

    objs = []
    for i in range(len(cores)):
        sel = m & (owner == i)
        ys, xs = np.where(sel)
        q = full.copy()
        q[..., 3] = np.where(sel, alpha, 0)
        objs.append(q[ys.min():ys.max() + 1, xs.min():xs.max() + 1])
    return objs


def prepared(stem):
    """The sheet as the splitter should see it: cropped if it needs cropping."""
    f = SRC / f"{stem}.png"
    cut = CROP.get(f.name)
    if cut is None:
        return f
    WORK.mkdir(parents=True, exist_ok=True)
    out = WORK / f"cropped_{f.name}"
    im = Image.open(f)
    im.crop((0, 0, im.width, cut)).save(out)
    return out


def objects(stem):
    return sheet_objects(stem)


def hero_palette():
    """The heroes stand in every realm, so they anchor every realm's palette."""
    cols = set()
    for f in glob.glob(f"{GAME}/assets/heroes/*.png"):
        x = np.array(Image.open(f).convert("RGBA"))
        for c in np.unique(x[x[..., 3] > 200][:, :3], axis=0):
            cols.add(tuple(int(v) for v in c))
    return np.array(sorted(cols), dtype=np.float64)


def extend(base, pixels, colours, min_dist):
    """Add colours the base cannot already express."""
    ex = np.unique(np.array(
        Image.fromarray(pixels.reshape(-1, 1, 3), "RGB")
             .quantize(colors=colours, method=Image.MEDIANCUT)
             .convert("RGB")).reshape(-1, 3), axis=0).astype(float)
    keep = [c for c in ex if ((base - c) ** 2).sum(1).min() > min_dist]
    return np.vstack([base, np.array(keep)]) if keep else base, len(keep)


def quantise(rgb, alpha, P):
    h, w, _ = rgb.shape
    f = rgb.reshape(-1, 3)
    idx = np.empty(len(f), np.int32)
    for i in range(0, len(f), 20000):
        idx[i:i + 20000] = ((f[i:i + 20000, None, :] - P[None, :, :]) ** 2).sum(2).argmin(1)
    return np.dstack([P[idx].reshape(h, w, 3), alpha]).astype(np.uint8), \
           np.sqrt(((P[idx] - f) ** 2).sum(1)).mean()


def crop_to_ratio(a, ratio=BD_W / BD_H):
    """Two backdrops came back at 2.36:1. Take the middle 16:9 of them."""
    h, w, _ = a.shape
    want = int(round(h * ratio))
    if w <= want:
        return a
    x0 = (w - want) // 2
    return a[:, x0:x0 + want]


if __name__ == "__main__":
    DST_S.mkdir(parents=True, exist_ok=True)
    DST_B.mkdir(parents=True, exist_ok=True)

    # ---- sprites ----------------------------------------------------------
    raw = {}
    for stem in sorted({s for s, _, _, _ in SPRITES}):
        objs = objects(stem)
        for s, i, name, h in SPRITES:
            if s == stem:
                raw[name] = (objs[i], h)

    shrunk = {}
    for name, (arr, h) in raw.items():
        arr, stripped = ra.strip_sparkle(arr)
        rgb, al = ra.shrink(arr, h)
        shrunk[name] = (rgb, al)

    base = hero_palette()

    # PER SPRITE, not one pool. When the heroes were redesigned the hero base
    # went from 65 colours to 447, and a pooled extraction then found almost
    # nothing new worth keeping - the workshop gained TWO colours and the cast
    # quantised at 13.7. Sharing a quota by pixel count starves whatever is in
    # the minority; here that was every warm brass tone in the realm.
    def quota(arrs, n=24):
        out = []
        for rgb, al in arrs:
            px = rgb[al > 0].astype(np.uint8)
            if not len(px):
                continue
            out.append(np.unique(np.array(
                Image.fromarray(px.reshape(-1, 1, 3), "RGB")
                .quantize(colors=n, method=Image.MEDIANCUT)
                .convert("RGB")).reshape(-1, 3), axis=0).astype(float))
        return np.unique(np.vstack(out), axis=0)

    cand = quota(list(shrunk.values()))
    keep = [c for c in cand if ((base - c) ** 2).sum(1).min() > 250]
    pal = np.vstack([base, np.array(keep)]) if keep else base
    print(f"realm-3 cast palette: {len(base)} hero + {len(keep)} workshop = {len(pal)}")

    worst = 0.0
    for name, (rgb, al) in shrunk.items():
        out, err = quantise(rgb, al, pal)
        if name not in NO_FLIP:
            out = out[:, ::-1]
        Image.fromarray(out, "RGBA").save(DST_S / f"{name}.png")
        worst = max(worst, err)
        print(f"  {name:14s} {out.shape[1]:3d}x{out.shape[0]:3d}  "
              f"{'flipped' if name not in NO_FLIP else 'as drawn':9s}  quantise err {err:4.1f}")
    print(f"  worst quantise error {worst:.1f} (over ~12 means the palette is too small)")

    # ---- item icons -------------------------------------------------------
    icons = {}
    for stem, names in ICONS:
        objs = objects(stem)
        if len(objs) != len(names):
            raise SystemExit(f"{stem}: {len(objs)} objects but {len(names)} names")
        for o, n in zip(objs, names):
            o, _ = ra.strip_sparkle(o)
            icons[n] = ra.shrink(o, ICON_H)

    icand = quota(list(icons.values()), 16)
    ikeep = [c for c in icand if ((base - c) ** 2).sum(1).min() > 250]
    ipal = np.vstack([base, np.array(ikeep)]) if ikeep else base
    print(f"\nitem icon palette: {len(base)} + {len(ikeep)} = {len(ipal)}")
    for n, (rgb, al) in icons.items():
        out, err = quantise(rgb, al, ipal)
        Image.fromarray(out, "RGBA").save(DST_I / f"{n}.png")
    print(f"  wrote {len(icons)} icons at {ICON_H}px")

    # ---- backdrops --------------------------------------------------------
    hero = np.concatenate([
        (lambda x: x[x[..., 3] > 0][:, :3])(np.array(Image.open(f).convert("RGBA")))
        for f in glob.glob(f"{GAME}/assets/heroes/*.png")]).astype(float)
    hlum = (0.299 * hero[:, 0] + 0.587 * hero[:, 1] + 0.114 * hero[:, 2]).mean()
    print(f"\nhero luminance {hlum:.1f} - every band must sit below this")

    bpx = []
    for stem in BACKDROPS:
        a = crop_to_ratio(np.array(Image.open(SRC / f"{stem}.png").convert("RGB")).astype(float))
        bpx.append(np.array(Image.fromarray(a.astype(np.uint8))
                            .resize((BD_W, BD_H), Image.BOX)).reshape(-1, 3))
    bpal, badded = extend(pal, np.concatenate(bpx).astype(np.uint8), 128, 700)
    print(f"backdrop palette: {len(pal)} + {badded} = {len(bpal)}")

    for stem, name in BACKDROPS.items():
        a = np.array(Image.open(SRC / f"{stem}.png").convert("RGB")).astype(float)
        cropped = a.shape[1] != crop_to_ratio(a).shape[1]
        a = ra.dewatermark(crop_to_ratio(a))
        small = np.array(Image.fromarray(a.astype(np.uint8))
                         .resize((BD_W, BD_H), Image.BOX)).astype(float)
        out, _ = quantise(small, np.full(small.shape[:2], 255, np.uint8), bpal)
        Image.fromarray(out[..., :3], "RGB").save(DST_B / f"{name}.png")
        g = out[int(BD_H * 0.55):int(BD_H * 0.95), :, :3].reshape(-1, 3).astype(float)
        blum = (0.299 * g[:, 0] + 0.587 * g[:, 1] + 0.114 * g[:, 2]).mean()
        ok = "ok" if blum < hlum - 20 else "TOO BRIGHT"
        print(f"  {name}  {BD_W}x{BD_H}{'  (cropped to 16:9)' if cropped else ''}"
              f"   ground {blum:5.1f}  hero +{hlum - blum:5.1f}  {ok}")
