#!/usr/bin/env python3
"""
Step 1 of the props pipeline: key out the magenta and find the objects.

Gemini draws "pixel art" at full resolution with soft edges - there is no
integer pixel grid in the file - so the magenta key needs a generous tolerance
and the edges need de-fringing afterwards. Objects are then found with
connected-component labelling on a dilated mask, so a campfire's flame, logs
and stones come back as ONE object instead of fifteen.
"""
import numpy as np
from PIL import Image
from scipy import ndimage

SRC = "/home/claude/spritework/in/props.png"
OUT = "/home/claude/spritework/out"

import os
os.makedirs(OUT, exist_ok=True)


def key_magenta(path, tol=152):
    im = Image.open(path).convert("RGB")
    a = np.array(im).astype(np.float64)   # float, or (255-r)**2 overflows int16
    r, g, b = a[..., 0], a[..., 1], a[..., 2]
    # magenta = high red, high blue, low green
    dist = np.sqrt((255 - r) ** 2 + g ** 2 + (255 - b) ** 2)
    bg = dist < tol
    # shave one pixel off the silhouette: the last ring of edge pixels is
    # always part magenta, and we downscale heavily afterwards anyway
    keep = ndimage.binary_erosion(~bg, np.ones((3, 3), bool))
    alpha = np.where(keep, 255, 0).astype(np.uint8)
    return a.astype(np.uint8), alpha, bg


def defringe(rgb, alpha, bg, rounds=4):
    """Magenta bleeds into the outline pixels. Pull those back toward the
    nearest opaque colour instead of leaving a pink halo."""
    a = rgb.astype(np.float32).copy()
    opaque = alpha > 0
    for _ in range(rounds):
        r, g, b = a[..., 0], a[..., 1], a[..., 2]
        pinkish = opaque & (r > 120) & (b > 120) & (g < r * 0.75) & (g < b * 0.75)
        if not pinkish.any():
            break
        # replace each pink edge pixel with the mean of its non-pink neighbours
        clean = opaque & ~pinkish
        for c in range(3):
            ch = np.where(clean, a[..., c], 0.0)
            s = ndimage.uniform_filter(ch, size=5)
            w = ndimage.uniform_filter(clean.astype(np.float32), size=5)
            filled = np.where(w > 0.02, s / np.maximum(w, 1e-6), a[..., c])
            a[..., c] = np.where(pinkish, filled, a[..., c])
    return np.clip(a, 0, 255).astype(np.uint8)


def components(alpha, dilate=5, min_px=700):
    mask = alpha > 0
    grown = ndimage.binary_dilation(mask, np.ones((dilate, dilate), bool))
    lab, n = ndimage.label(grown)
    boxes = []
    for i in range(1, n + 1):
        sel = (lab == i) & mask
        if sel.sum() < min_px:
            continue
        ys, xs = np.where(sel)
        boxes.append((xs.min(), ys.min(), xs.max() + 1, ys.max() + 1, int(sel.sum())))
    # reading order: rows top to bottom, then left to right
    boxes.sort(key=lambda b: (b[1] // 200, b[0]))
    return boxes


if __name__ == "__main__":
    rgb, alpha, bg = key_magenta(SRC)
    rgb = defringe(rgb, alpha, bg)
    boxes = components(alpha)
    print(f"found {len(boxes)} objects")
    rgba = np.dstack([rgb, alpha])
    full = Image.fromarray(rgba, "RGBA")
    full.save(f"{OUT}/_keyed.png")

    for i, (x0, y0, x1, y1, n) in enumerate(boxes):
        crop = full.crop((x0, y0, x1, y1))
        crop.save(f"{OUT}/raw_{i:02d}.png")
        print(f"  {i:02d}  box=({x0:4d},{y0:3d})-({x1:4d},{y1:3d})  "
              f"{x1-x0:4d}x{y1-y0:3d}px  {n} opaque")
