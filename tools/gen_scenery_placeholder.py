#!/usr/bin/env python3
"""
SUPERSEDED - kept for reference only. DO NOT RUN: it will overwrite the
hand-generated scenery art in assets/scenery/ with these placeholders.

Room furniture for the non-combat rooms.

The corridor is shared by every room type, so a Rest or Safe room used to be
an empty stage. These props give each of those rooms something to look at:

    bed.png       Rest room
    campfire.png  Safe Path (and the campfire checkpoints in Build B)
    chest.png     Treasure room
    stall.png     The Storm Pedlar's shop

Everything is drawn at TRUE PIXEL SIZE. The game multiplies the PNG's natural
width by SPRITE_SCALE (3) at display time, exactly like the monster and hero
sprites, so the whole game shares one pixel grid.
"""
import os
from PIL import Image, ImageDraw

OUT = "/home/claude/dungeon-crawler/assets/scenery"
os.makedirs(OUT, exist_ok=True)

INK        = (18, 12, 28, 255)
WOOD       = (112, 74, 46, 255)
WOOD_HI    = (152, 106, 68, 255)
WOOD_DK    = (66, 42, 26, 255)
LINEN      = (228, 222, 238, 255)
LINEN_SH   = (184, 176, 204, 255)
BLANKET    = (86, 66, 146, 255)
BLANKET_HI = (124, 100, 190, 255)
BLANKET_DK = (50, 36, 90, 255)
IRON       = (96, 98, 118, 255)
IRON_HI    = (146, 150, 172, 255)
GOLD       = (214, 172, 78, 255)
GOLD_HI    = (250, 226, 140, 255)
STONE      = (92, 86, 112, 255)
STONE_HI   = (132, 126, 158, 255)
STONE_DK   = (56, 50, 74, 255)
EMBER      = (188, 62, 32, 255)
FLAME_O    = (238, 122, 34, 255)
FLAME_Y    = (252, 196, 62, 255)
FLAME_W    = (255, 246, 198, 255)
CLOTH_R    = (156, 52, 66, 255)
CLOTH_R_HI = (200, 84, 96, 255)
CLOTH_C    = (226, 214, 196, 255)
CURTAIN    = (58, 44, 92, 255)


def canvas(w, h):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)


def save(img, name):
    img.save(os.path.join(OUT, name))
    print("wrote", name, img.size)


def plank(d, x0, y0, x1, y1, base=WOOD, hi=WOOD_HI, dk=WOOD_DK):
    """A wooden board: dark outline, lit top edge, shaded bottom edge."""
    d.rectangle([x0, y0, x1, y1], fill=base, outline=INK)
    d.line([(x0 + 1, y0 + 1), (x1 - 1, y0 + 1)], fill=hi)
    d.line([(x0 + 1, y1 - 1), (x1 - 1, y1 - 1)], fill=dk)


# ---------------------------------------------------------------------------
# BED - the Rest room
# ---------------------------------------------------------------------------
def make_bed():
    W, H = 66, 44
    img, d = canvas(W, H)

    # legs
    for lx in (5, 55):
        d.rectangle([lx, 31, lx + 5, 43], fill=WOOD_DK, outline=INK)
        d.line([(lx + 1, 32), (lx + 1, 42)], fill=WOOD)

    # headboard (left): two posts joined by a top rail, so it reads as
    # furniture rather than a lone stake
    d.rectangle([1, 10, 5, 34], fill=WOOD, outline=INK)
    d.rectangle([10, 10, 14, 22], fill=WOOD, outline=INK)
    plank(d, 0, 5, 15, 11)
    d.line([(2, 12), (2, 33)], fill=WOOD_HI)
    d.line([(11, 12), (11, 21)], fill=WOOD_HI)
    d.rectangle([6, 13, 9, 15], fill=WOOD_DK, outline=INK)   # cross-slat

    # footboard (right)
    d.rectangle([58, 18, 64, 34], fill=WOOD, outline=INK)
    plank(d, 56, 14, 65, 19)
    d.line([(59, 20), (59, 33)], fill=WOOD_HI)

    # frame rail under the mattress
    plank(d, 4, 27, 61, 32)

    # mattress
    d.rectangle([6, 19, 59, 28], fill=LINEN, outline=INK)
    d.line([(7, 27), (58, 27)], fill=LINEN_SH)

    # blanket over the lower half, with a turned-back cuff
    d.rectangle([27, 17, 59, 28], fill=BLANKET, outline=INK)
    d.rectangle([27, 17, 31, 28], fill=BLANKET_HI, outline=INK)
    d.line([(32, 19), (58, 19)], fill=BLANKET_HI)
    d.line([(28, 27), (58, 27)], fill=BLANKET_DK)
    for fx in range(35, 58, 6):                   # soft folds
        d.line([(fx, 21), (fx, 26)], fill=BLANKET_DK)

    # pillow
    d.rounded_rectangle([9, 13, 26, 21], radius=3, fill=LINEN, outline=INK)
    d.line([(11, 15), (23, 15)], fill=(255, 255, 255, 255))
    d.line([(11, 20), (24, 20)], fill=LINEN_SH)

    save(img, "bed.png")


# ---------------------------------------------------------------------------
# CAMPFIRE - Safe Path now, campfire checkpoints in Build B
# ---------------------------------------------------------------------------
def make_campfire():
    W, H = 42, 40
    img, d = canvas(W, H)

    # ring of stones
    stones = [(1, 30, 11, 38), (10, 32, 20, 39), (21, 32, 31, 39),
              (30, 30, 40, 38), (5, 27, 13, 33), (28, 27, 36, 33)]
    for i, (x0, y0, x1, y1) in enumerate(stones):
        d.ellipse([x0, y0, x1, y1], fill=STONE if i % 2 else STONE_DK, outline=INK)
        d.arc([x0 + 1, y0 + 1, x1 - 1, y1 - 3], 200, 340, fill=STONE_HI)

    # crossed logs
    d.line([(9, 32), (32, 24)], fill=WOOD_DK, width=4)
    d.line([(9, 31), (32, 23)], fill=WOOD, width=2)
    d.line([(10, 24), (33, 32)], fill=WOOD_DK, width=4)
    d.line([(10, 23), (33, 31)], fill=WOOD, width=2)

    # glowing embers between the logs
    for ex, ey in ((16, 29), (20, 30), (24, 28), (18, 27), (22, 26)):
        d.point((ex, ey), fill=EMBER)

    # flame - three nested teardrops, widest at the base. It sits slightly
    # higher than the logs so the crossed wood still reads underneath.
    d.polygon([(21, 1), (28, 11), (31, 19), (26, 26), (16, 26), (11, 19),
               (14, 11)], fill=FLAME_O, outline=INK)
    d.polygon([(21, 5), (26, 14), (27, 20), (22, 25), (16, 25), (13, 20),
               (17, 14)], fill=FLAME_Y)
    d.polygon([(21, 12), (24, 19), (22, 24), (18, 24), (16, 19)], fill=FLAME_W)

    # sparks drifting up
    for sx, sy in ((10, 10), (31, 8), (27, 3), (13, 5), (33, 15)):
        d.point((sx, sy), fill=FLAME_Y)

    save(img, "campfire.png")


# ---------------------------------------------------------------------------
# CHEST - the Treasure room
# ---------------------------------------------------------------------------
def make_chest():
    W, H = 46, 36
    img, d = canvas(W, H)

    # body
    d.rectangle([3, 16, 42, 33], fill=WOOD, outline=INK)
    d.line([(4, 17), (41, 17)], fill=WOOD_HI)
    d.line([(4, 32), (41, 32)], fill=WOOD_DK)
    for px in range(9, 40, 8):                    # plank seams
        d.line([(px, 18), (px, 31)], fill=WOOD_DK)

    # domed lid
    d.pieslice([3, 4, 42, 24], 180, 360, fill=WOOD, outline=INK)
    d.rectangle([3, 14, 42, 16], fill=WOOD, outline=INK)
    d.arc([5, 6, 40, 24], 195, 345, fill=WOOD_HI)

    # iron bands
    for bx in (11, 33):
        d.rectangle([bx, 6, bx + 3, 33], fill=IRON, outline=INK)
        d.line([(bx + 1, 7), (bx + 1, 32)], fill=IRON_HI)

    # lock plate
    d.rectangle([19, 15, 26, 24], fill=GOLD, outline=INK)
    d.line([(20, 16), (25, 16)], fill=GOLD_HI)
    d.rectangle([22, 18, 23, 21], fill=INK)

    # feet
    d.rectangle([4, 32, 9, 35], fill=IRON, outline=INK)
    d.rectangle([36, 32, 41, 35], fill=IRON, outline=INK)

    save(img, "chest.png")


# ---------------------------------------------------------------------------
# STALL - the Storm Pedlar's shop
# ---------------------------------------------------------------------------
def make_stall():
    W, H = 80, 66
    img, d = canvas(W, H)

    # back curtain between the posts
    d.rectangle([9, 20, 70, 48], fill=CURTAIN, outline=INK)
    for cx in range(13, 69, 7):
        d.line([(cx, 21), (cx, 47)], fill=(44, 32, 72, 255))

    # posts
    for px in (4, 71):
        d.rectangle([px, 16, px + 4, 62], fill=WOOD, outline=INK)
        d.line([(px + 1, 17), (px + 1, 61)], fill=WOOD_HI)

    # striped awning
    d.polygon([(0, 16), (79, 16), (72, 4), (7, 4)], fill=CLOTH_C, outline=INK)
    for i, sx in enumerate(range(4, 76, 9)):
        if i % 2:
            continue
        d.polygon([(sx, 16), (sx + 9, 16), (sx + 8, 5), (sx + 1, 5)],
                  fill=CLOTH_R)
    d.line([(7, 5), (72, 5)], fill=CLOTH_R_HI)
    # scalloped hem
    for hx in range(2, 78, 6):
        d.pieslice([hx, 13, hx + 6, 21], 0, 180, fill=CLOTH_R, outline=INK)

    # counter
    plank(d, 0, 46, 79, 54)
    d.line([(1, 54), (78, 54)], fill=WOOD_DK)
    d.rectangle([6, 54, 12, 63], fill=WOOD_DK, outline=INK)
    d.rectangle([67, 54, 73, 63], fill=WOOD_DK, outline=INK)

    # wares: three bottles and a crate
    bottles = [(18, (108, 200, 128, 255)), (27, (110, 158, 230, 255)),
               (36, (216, 96, 118, 255))]
    for bx, col in bottles:
        d.rectangle([bx, 34, bx + 6, 46], fill=col, outline=INK)
        d.rectangle([bx + 2, 30, bx + 4, 35], fill=col, outline=INK)
        d.rectangle([bx + 1, 28, bx + 5, 30], fill=WOOD_DK, outline=INK)
        d.line([(bx + 1, 36), (bx + 1, 44)], fill=(255, 255, 255, 110))

    d.rectangle([49, 33, 66, 46], fill=WOOD, outline=INK)
    d.line([(50, 34), (65, 34)], fill=WOOD_HI)
    d.line([(49, 39), (66, 39)], fill=WOOD_DK)
    d.line([(57, 34), (57, 45)], fill=WOOD_DK)

    # a few coins on the counter
    for cx in range(42, 48, 3):
        d.ellipse([cx, 43, cx + 3, 46], fill=GOLD, outline=INK)

    save(img, "stall.png")


if __name__ == "__main__":
    make_bed()
    make_campfire()
    make_chest()
    make_stall()
