#!/usr/bin/env python3
"""
Backdrop pipeline.

Three jobs:
  1. Remove Gemini's sparkle watermark from the bottom-right corner. The
     backdrops are near-symmetric, so the cleanest patch is the mirror image
     of the same spot on the other side of the picture.
  2. Bring them down onto the game's true pixel grid. The corridor is about
     640x234 true pixels on a 1080p classroom TV (everything is drawn at 3x),
     so that is the size these are authored to.
  3. Widen 16:9 art to the corridor's much wider 2.74:1 strip. Cropping to fill
     would eat the battlements off the top, and stretching would turn the
     bricks into rectangles, so the picture keeps its shape in the middle and
     the margins are filled with edge-clamped stone fading into darkness.
"""
import os

import numpy as np
from PIL import Image

IN = "/home/claude/spritework/in"
DST = "/home/claude/dungeon-crawler/assets/backdrops"

# corridor size in TRUE pixels at 1920x1080 (the classroom TV), 3x display
OUT_W, OUT_H = 640, 234

# source file -> (output name, human name)
BANDS = {
    "bd_c.png": ("realm1_band1", "The Outer Ruins"),
    "bd_a.png": ("realm1_band2", "The Flooded Halls"),
    "bd_b.png": ("realm1_band3", "The Eye of the Storm"),
}

# generous box around the watermark, as fractions of width/height
WM = (0.885, 0.795, 0.950, 0.900)


def dewatermark(a):
    h, w, _ = a.shape
    x0, y0, x1, y1 = int(WM[0] * w), int(WM[1] * h), int(WM[2] * w), int(WM[3] * h)
    patch = a[y0:y1, w - x1:w - x0][:, ::-1]          # mirrored from the far side
    out = a.copy()
    # feather the patch in so the seam doesn't show
    bw = x1 - x0
    ramp = np.clip(np.minimum(np.arange(bw), bw - 1 - np.arange(bw)) / 6.0, 0, 1)
    m = ramp[None, :, None]
    out[y0:y1, x0:x1] = patch * m + out[y0:y1, x0:x1] * (1 - m)
    return out


def widen(small):
    """Centre the picture and fill the margins with edge-clamped stone that
    darkens toward the frame, so the room reads as continuing into shadow."""
    from scipy import ndimage
    sh, sw, _ = small.shape
    canvas = np.zeros((sh, OUT_W, 3), dtype=np.float64)
    left = (OUT_W - sw) // 2
    canvas[:, left:left + sw] = small

    # Margins are dimmed but NOT crushed to black: at 0.06 they read as
    # letterbox bars rather than as the room continuing into shadow.
    # Average the outermost dozen columns rather than clamping one of them:
    # a single column containing a torch smears into a bright horizontal
    # stripe all the way to the frame. Blur it vertically too, so what is
    # left reads as ambient glow instead of banding.
    edgeL = ndimage.gaussian_filter1d(small[:, :12].mean(axis=1), 6, axis=0)
    edgeR = ndimage.gaussian_filter1d(small[:, -12:].mean(axis=1), 6, axis=0)
    for x in range(left):
        t = x / max(1, left)                     # 0 at the frame, 1 at the art
        canvas[:, x] = edgeL * (0.32 + 0.68 * t ** 1.3)
    for i, x in enumerate(range(left + sw, OUT_W)):
        t = 1 - i / max(1, OUT_W - left - sw)
        canvas[:, x] = edgeR * (0.32 + 0.68 * t ** 1.3)
    return canvas


def quantise(rgb, palette):
    h, w, _ = rgb.shape
    flat = rgb.reshape(-1, 3)
    # chunked so a 640x234 image doesn't build a 150k x 57 distance matrix
    idx = np.empty(flat.shape[0], dtype=np.int32)
    step = 20000
    for i in range(0, flat.shape[0], step):
        d = ((flat[i:i + step, None, :] - palette[None, :, :]) ** 2).sum(axis=2)
        idx[i:i + step] = d.argmin(axis=1)
    return palette[idx].reshape(h, w, 3).astype(np.uint8)


if __name__ == "__main__":
    os.makedirs(DST, exist_ok=True)
    palette = np.load("/home/claude/spritework/palette.npy")

    # backdrops carry gradients the sprite palette has no room for, so let them
    # add their own darks on top of the shared cast palette
    extras = []
    for src in BANDS:
        a = np.array(Image.open(f"{IN}/{src}").convert("RGB"))
        q = (Image.fromarray(a).quantize(colors=40, method=Image.MEDIANCUT)
             .convert("RGB"))
        extras.append(np.array(q).reshape(-1, 3))
    ex = np.unique(np.concatenate(extras, axis=0), axis=0).astype(np.float64)
    keep = [c for c in ex if ((palette - c) ** 2).sum(axis=1).min() > 700]
    pal = np.vstack([palette, np.array(keep)]) if keep else palette
    print(f"backdrop palette: {len(palette)} cast + {len(keep)} new = {len(pal)}")

    for src, (name, human) in BANDS.items():
        a = np.array(Image.open(f"{IN}/{src}").convert("RGB")).astype(np.float64)
        a = dewatermark(a)
        h = OUT_H
        w = int(round(a.shape[1] * (h / a.shape[0])))
        small = np.array(Image.fromarray(a.astype(np.uint8)).resize((w, h), Image.BOX)
                         ).astype(np.float64)
        wide = widen(small)
        out = quantise(np.clip(wide, 0, 255), pal)
        Image.fromarray(out, "RGB").save(f"{DST}/{name}.png")
        print(f"  {name}  {OUT_W}x{OUT_H}   ({human}, art {w}px wide)")
