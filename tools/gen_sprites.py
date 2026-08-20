#!/usr/bin/env python3
"""
Original procedural pixel-art generator for the dungeon crawler.
Bodies are drawn with simple primitives on a small low-res canvas (so edges
come out blocky/jagged on purpose), then upscaled with NEAREST for a crisp
retro pixel look. No external art assets - everything here is original.
"""
import os, math
from PIL import Image, ImageDraw

OUT_SPRITES = "/home/claude/dungeon-crawler/assets/sprites"
os.makedirs(OUT_SPRITES, exist_ok=True)
SCALE = 8

def new_canvas(w, h):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)

def save(img, path, scale=SCALE):
    img = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    img.save(path)
    print("wrote", path, img.size)

def blob(draw, cx, cy, rx, ry, fill, outline=None, taper=0.0):
    """Filled ellipse blob; taper>0 pulls the bottom inward for a 'body tapering
    to a base' look."""
    draw.ellipse([cx-rx, cy-ry, cx+rx, cy+ry], fill=fill, outline=outline)

def eyes(draw, cx, cy, gap, r, sclera, pupil, look=(0,0)):
    for sx in (-1, 1):
        ex = cx + sx*gap
        draw.ellipse([ex-r, cy-r, ex+r, cy+r], fill=sclera, outline=(20,20,30,255))
        pr = max(1, r//2)
        draw.ellipse([ex-pr+look[0], cy-pr+look[1], ex+pr+look[0], cy+pr+look[1]], fill=pupil)

# ---------------------------------------------------------------------------
# THUNDERCLAP WYRM
# ---------------------------------------------------------------------------
def make_wyrm():
    W,H = 34,34
    img, d = new_canvas(W,H)
    body = (96,128,222,255); shade=(58,84,176,255); outline=(24,20,50,255)
    # tail
    d.polygon([(17,30),(10,34),(14,26),(20,26),(24,34)], fill=shade, outline=outline)
    # main body blob
    blob(d, 17,17, 12,13, fill=body, outline=outline)
    # cloud puffs to break up silhouette
    blob(d, 8,14, 6,6, fill=body, outline=outline)
    blob(d, 26,14, 6,6, fill=body, outline=outline)
    blob(d, 17,7, 7,6, fill=body, outline=outline)
    eyes(d, 17,16, 5, 4, (255,255,255,255), (35,26,60,255))
    # mouth
    d.arc([12,20,22,26], start=20, end=160, fill=(30,40,90,255), width=2)
    # lightning crest
    d.polygon([(17,2),(14,7),(17,7),(15,12)], fill=(255,224,102,255), outline=(150,110,10,255))
    save(img, f"{OUT_SPRITES}/wyrm_storm.png")

# ---------------------------------------------------------------------------
# BLIZZARD WISP
# ---------------------------------------------------------------------------
def make_wisp():
    W,H = 26,26
    img, d = new_canvas(W,H)
    body=(230,240,255,255); shade=(180,205,240,255); outline=(90,110,150,255)
    # wispy bottom (zig-zag)
    d.polygon([(4,14),(4,22),(8,17),(11,23),(15,17),(18,23),(22,17),(22,14)], fill=body, outline=outline)
    blob(d, 13,11, 10,10, fill=body, outline=outline)
    eyes(d, 13,11, 4, 3, (140,200,255,255), (30,50,110,255))
    save(img, f"{OUT_SPRITES}/wisp_storm.png")

# ---------------------------------------------------------------------------
# SANDSTORM DJINN
# ---------------------------------------------------------------------------
def make_djinn():
    W,H = 30,34
    img, d = new_canvas(W,H)
    body=(224,178,96,255); shade=(184,132,58,255); outline=(70,46,20,255)
    # swirling scarf/tail base
    d.polygon([(15,30),(6,34),(11,24),(19,24),(24,34)], fill=shade, outline=outline)
    blob(d, 15,15, 10,11, fill=body, outline=outline)
    # spiral belly marks
    d.arc([9,10,21,22], start=200, end=520, fill=shade, width=2)
    eyes(d, 15,14, 4, 3, (255,236,160,255), (70,40,10,255))
    # small turban/flame tip
    blob(d, 15,4, 5,4, fill=body, outline=outline)
    save(img, f"{OUT_SPRITES}/djinn_storm.png")

# ---------------------------------------------------------------------------
# HURRICANE TITAN (boss) - bigger, layered vortex torso
# ---------------------------------------------------------------------------
def make_titan():
    W,H = 46,46
    img, d = new_canvas(W,H)
    body=(104,88,190,255); shade=(64,50,132,255); dark=(30,22,60,255); outline=(16,12,30,255)
    # outer stormy skirt (jagged)
    pts = [(23,44)]
    import math as m
    for i in range(9):
        ang = m.pi*(0.1+0.8*i/8)
        rad = 20 if i%2==0 else 14
        x = 23 + rad*m.cos(ang)
        y = 20 + rad*m.sin(ang)
        pts.append((x,y))
    d.polygon(pts, fill=shade, outline=outline)
    blob(d, 23,17, 15,15, fill=body, outline=outline)
    # vortex rings on torso
    for i,r in enumerate((10,7,4)):
        d.ellipse([23-r,20-r,23+r,20+r], outline=dark, width=1)
    eyes(d, 23,15, 7, 5, (255,255,255,255), (255,214,90,255))
    # crown spikes
    for sx in (-10,-4,4,10):
        d.polygon([(23+sx,4),(23+sx-3,10),(23+sx+3,10)], fill=body, outline=outline)
    save(img, f"{OUT_SPRITES}/titan_storm.png")

make_wyrm()
make_wisp()
make_djinn()
make_titan()
print("Realm 1 monster sprites generated (v2).")
