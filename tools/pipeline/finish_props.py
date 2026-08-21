#!/usr/bin/env python3
"""
Step 2 of the props pipeline: shrink each object down onto a real pixel grid
and force it into the same palette as the existing monster and hero cast, so
the new furniture looks like it was drawn by whoever drew the monsters.

Heights are chosen relative to the hero, who is 88 true pixels tall. Every
sprite in the game is drawn at the same scale factor, so these numbers are
what actually set how big a bed looks next to a Blizzard Wisp.
"""
import glob
import os

import numpy as np
from PIL import Image

IN = "/home/claude/spritework/out"
GAME = "/home/claude/dungeon-crawler"
DST = f"{GAME}/assets/scenery"

# raw index -> (output name, target height in TRUE pixels)
# hero = 88 true px, boss = 150, so a bed at 48 sits mid-thigh on the hero.
PLAN = {
    0: ("stall",       104),   # the Storm Pedlar's stall, torch included
    1: ("bed_cool",     46),
    2: ("chest_cool",   36),
    3: ("crates_cool",  50),
    4: ("bed",          48),
    5: ("campfire",     44),
    6: ("chest",        37),
    7: ("crates",       52),
}


def cast_palette():
    """Every colour the existing sprite cast actually uses."""
    cols = set()
    for f in glob.glob(f"{GAME}/assets/sprites/*.png") + glob.glob(f"{GAME}/assets/heroes/*.png"):
        a = np.array(Image.open(f).convert("RGBA"))
        sel = a[..., 3] > 200
        for c in np.unique(a[sel][:, :3], axis=0):
            cols.add(tuple(int(v) for v in c))
    return np.array(sorted(cols), dtype=np.float64)


def shrink(im, target_h):
    """Area-average down to the true pixel grid.

    Alpha has to be premultiplied first or the transparent black around the
    silhouette bleeds in and every object gets a dark halo.
    """
    a = np.array(im.convert("RGBA")).astype(np.float64)
    al = a[..., 3:4] / 255.0
    pm = np.dstack([a[..., :3] * al, a[..., 3]])
    scale = target_h / im.height
    tw = max(1, int(round(im.width * scale)))
    small = Image.fromarray(pm.astype(np.uint8), "RGBA").resize(
        (tw, target_h), Image.BOX)
    s = np.array(small).astype(np.float64)
    al2 = s[..., 3:4] / 255.0
    rgb = np.where(al2 > 0.004, s[..., :3] / np.maximum(al2, 1e-6), 0)
    alpha = np.where(s[..., 3] >= 110, 255, 0)      # snap back to hard edges
    return np.clip(rgb, 0, 255), alpha


def quantise(rgb, alpha, palette):
    """Nearest-colour map onto the shared palette, opaque pixels only."""
    h, w, _ = rgb.shape
    flat = rgb.reshape(-1, 3)
    d = ((flat[:, None, :] - palette[None, :, :]) ** 2).sum(axis=2)
    idx = d.argmin(axis=1)
    out = palette[idx].reshape(h, w, 3)
    return np.dstack([out, alpha]).astype(np.uint8)


if __name__ == "__main__":
    os.makedirs(DST, exist_ok=True)
    cast = cast_palette()
    print(f"cast palette: {len(cast)} colours")

    # First pass: shrink everything, and gather the colours the new art needs
    # that the cast simply doesn't have (warm timber, awning canvas).
    shrunk = {}
    swatch = []
    for i, (name, h) in PLAN.items():
        im = Image.open(f"{IN}/raw_{i:02d}.png")
        rgb, alpha = shrink(im, h)
        shrunk[i] = (name, rgb, alpha)
        sel = alpha > 0
        if sel.any():
            swatch.append(rgb[sel])
    allnew = np.concatenate(swatch, axis=0).astype(np.uint8)
    extra = np.array(
        Image.fromarray(allnew.reshape(-1, 1, 3), "RGB")
             .quantize(colors=26, method=Image.MEDIANCUT)
             .convert("RGB").getdata(), dtype=np.float64)
    extra = np.unique(extra, axis=0)

    # Drop any new colour that's already close to a cast colour, so the
    # combined palette stays tight rather than doubling up on near-identical
    # blues.
    keep = []
    for c in extra:
        if ((cast - c) ** 2).sum(axis=1).min() > 900:   # >30 units away
            keep.append(c)
    palette = np.vstack([cast] + ([np.array(keep)] if keep else []))
    print(f"added {len(keep)} new colours -> {len(palette)} total")

    for i, (name, rgb, alpha) in shrunk.items():
        out = quantise(rgb, alpha, palette)
        img = Image.fromarray(out, "RGBA")
        img.save(f"{DST}/{name}.png")
        print(f"  {name:12s} {img.width:3d}x{img.height:3d}")
    np.save("/home/claude/spritework/palette.npy", palette)
