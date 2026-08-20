#!/usr/bin/env python3
"""
Room-style map node icons, the player's lantern totem, and footprint marks.
Each node is drawn as a small bricked dungeon chamber with a symbol inside,
so the map reads as a floorplan of rooms rather than abstract circles.
"""
import os, math
from PIL import Image, ImageDraw

OUT = "/home/claude/dungeon-crawler/assets/nodes"
os.makedirs(OUT, exist_ok=True)
SCALE = 4
S = 32  # base canvas

def new_canvas(w=S, h=S):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)

def save(img, name, scale=SCALE):
    img = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    img.save(os.path.join(OUT, name))
    print("wrote", name, img.size)

def brick_room(d, wall, wall_hi, wall_dark, floor, w=S, h=S):
    """Bricked chamber: outer wall ring with running-bond courses, dark floor."""
    # outer wall block
    d.rectangle([0, 0, w - 1, h - 1], fill=wall, outline=(12, 9, 22, 255))
    # brick courses on the wall ring (4px tall, offset alternating rows)
    for row, y in enumerate(range(1, h - 1, 4)):
        offset = 0 if row % 2 == 0 else 4
        d.line([(1, y), (w - 2, y)], fill=wall_dark)
        for x in range(1 + offset, w - 2, 8):
            d.line([(x, y), (x, min(y + 3, h - 2))], fill=wall_dark)
    # inner chamber floor
    d.rectangle([5, 5, w - 6, h - 6], fill=floor, outline=(12, 9, 22, 255))
    # floor slab lines
    d.line([(5, (h // 2)), (w - 6, (h // 2))], fill=(0, 0, 0, 40))
    d.line([((w // 2), 5), ((w // 2), h - 6)], fill=(0, 0, 0, 40))
    # top-left inner rim light
    d.line([(5, 5), (w - 6, 5)], fill=wall_hi)
    d.line([(5, 5), (5, h - 6)], fill=wall_hi)

# palettes for room types
STONE = dict(wall=(74, 58, 108, 255), wall_hi=(112, 92, 156, 255),
             wall_dark=(46, 35, 72, 255), floor=(30, 22, 48, 255))
STONE_WARM = dict(wall=(104, 74, 74, 255), wall_hi=(154, 112, 106, 255),
                  wall_dark=(66, 44, 46, 255), floor=(44, 26, 30, 255))
STONE_GOLD = dict(wall=(104, 92, 56, 255), wall_hi=(160, 142, 88, 255),
                  wall_dark=(64, 56, 32, 255), floor=(40, 34, 22, 255))
STONE_GREEN = dict(wall=(58, 96, 78, 255), wall_hi=(94, 146, 118, 255),
                   wall_dark=(34, 60, 48, 255), floor=(22, 42, 34, 255))
STONE_BLUE = dict(wall=(52, 84, 116, 255), wall_hi=(88, 132, 172, 255),
                  wall_dark=(32, 54, 76, 255), floor=(20, 38, 56, 255))

def crossed_swords(d, cx, cy, col, hilt=(196, 150, 70, 255)):
    for sgn in (1, -1):
        x1, y1 = cx - 7 * sgn, cy + 7
        x2, y2 = cx + 7 * sgn, cy - 7
        d.line([(x1, y1), (x2, y2)], fill=col, width=2)
        # blade tip highlight
        d.line([(x2, y2), (x2 - 2 * sgn, y2 + 2)], fill=(238, 244, 255, 255))
        # hilt guard
        d.line([(x1 - 2 * sgn, y1 - 2), (x1 + 2 * sgn, y1 + 1)],
               fill=hilt, width=2)

def skull(d, cx, cy, col=(238, 238, 246, 255), dark=(30, 24, 44, 255)):
    d.ellipse([cx - 7, cy - 8, cx + 7, cy + 4], fill=col, outline=dark)
    d.rectangle([cx - 4, cy + 3, cx + 4, cy + 8], fill=col, outline=dark)
    d.rectangle([cx - 5, cy - 4, cx - 2, cy - 1], fill=dark)
    d.rectangle([cx + 2, cy - 4, cx + 5, cy - 1], fill=dark)
    d.line([(cx, cy), (cx, cy + 2)], fill=dark)
    for tx in range(cx - 3, cx + 4, 3):
        d.line([(tx, cy + 4), (tx, cy + 8)], fill=dark)

def question_mark(d, cx, cy, col):
    d.arc([cx - 6, cy - 9, cx + 6, cy + 1], start=170, end=20, fill=col, width=3)
    d.line([(cx + 3, cy - 1), (cx, cy + 3)], fill=col, width=3)
    d.rectangle([cx - 1, cy + 6, cx + 1, cy + 8], fill=col)

def campfire(d, cx, cy):
    # logs
    d.line([(cx - 8, cy + 7), (cx + 8, cy + 3)], fill=(104, 72, 44, 255), width=3)
    d.line([(cx - 8, cy + 3), (cx + 8, cy + 7)], fill=(84, 56, 34, 255), width=3)
    # flame
    d.polygon([(cx, cy - 10), (cx + 6, cy + 1), (cx - 6, cy + 1)],
              fill=(255, 138, 34, 255))
    d.polygon([(cx, cy - 6), (cx + 3, cy + 1), (cx - 3, cy + 1)],
              fill=(255, 222, 122, 255))

def chest(d, cx, cy):
    d.rectangle([cx - 8, cy - 2, cx + 8, cy + 8], fill=(140, 96, 48, 255),
                outline=(50, 32, 16, 255))
    d.pieslice([cx - 8, cy - 10, cx + 8, cy + 4], start=180, end=360,
               fill=(168, 118, 60, 255), outline=(50, 32, 16, 255))
    d.rectangle([cx - 8, cy - 1, cx + 8, cy + 1], fill=(196, 158, 84, 255))
    d.rectangle([cx - 2, cy - 1, cx + 2, cy + 5], fill=(238, 200, 96, 255),
                outline=(50, 32, 16, 255))

def arrow_bypass(d, cx, cy, col):
    d.line([(cx - 8, cy + 5), (cx - 8, cy - 2)], fill=col, width=2)
    d.arc([cx - 8, cy - 8, cx + 6, cy + 2], start=180, end=350, fill=col, width=2)
    d.line([(cx + 6, cy - 2), (cx + 6, cy + 5)], fill=col, width=2)
    d.polygon([(cx + 6, cy + 8), (cx + 2, cy + 3), (cx + 10, cy + 3)], fill=col)

def portal_arch(d, cx, cy):
    d.pieslice([cx - 8, cy - 8, cx + 8, cy + 8], start=180, end=360,
               fill=(96, 210, 168, 255), outline=(20, 60, 48, 255))
    d.rectangle([cx - 8, cy, cx + 8, cy + 9], fill=(96, 210, 168, 255),
                outline=(20, 60, 48, 255))
    d.pieslice([cx - 4, cy - 4, cx + 4, cy + 4], start=180, end=360,
               fill=(226, 255, 244, 255))
    d.rectangle([cx - 4, cy, cx + 4, cy + 9], fill=(226, 255, 244, 255))

def crown(d, cx, cy, col=(255, 214, 106, 255), dark=(120, 82, 12, 255)):
    d.polygon([(cx - 9, cy + 5), (cx - 9, cy - 5), (cx - 4, cy),
               (cx, cy - 8), (cx + 4, cy), (cx + 9, cy - 5), (cx + 9, cy + 5)],
              fill=col, outline=dark)
    d.rectangle([cx - 9, cy + 5, cx + 9, cy + 8], fill=dark)

# ---------------------------------------------------------------------------
# node rooms
# ---------------------------------------------------------------------------
def make_node(name, pal, symbol_fn, big=False):
    size = 40 if big else S
    img, d = new_canvas(size, size)
    brick_room(d, w=size, h=size, **pal)
    symbol_fn(d, size // 2, size // 2)
    save(img, name)

make_node("node_start.png", STONE_GREEN, lambda d, x, y: portal_arch(d, x, y))
make_node("node_fight.png", STONE,
          lambda d, x, y: crossed_swords(d, x, y, (206, 216, 240, 255)))
make_node("node_elite.png", STONE_WARM, lambda d, x, y: (
    skull(d, x, y - 1), crown(d, x, y - 11)))
make_node("node_event.png", STONE_BLUE,
          lambda d, x, y: question_mark(d, x, y, (150, 214, 255, 255)))
make_node("node_rest.png", STONE_GREEN, lambda d, x, y: campfire(d, x, y))
make_node("node_treasure.png", STONE_GOLD, lambda d, x, y: chest(d, x, y))
make_node("node_safe.png", STONE,
          lambda d, x, y: arrow_bypass(d, x, y, (168, 196, 226, 255)))
make_node("node_boss.png", STONE_WARM, lambda d, x, y: (
    skull(d, x, y + 1, col=(255, 236, 236, 255)),
    crown(d, x, y - 12, col=(255, 120, 120, 255), dark=(120, 20, 20, 255))),
    big=True)

# ---------------------------------------------------------------------------
# player totem: a lantern on a wooden pole
# ---------------------------------------------------------------------------
def lantern():
    W, H = 22, 34
    img, d = new_canvas(W, H)
    # warm glow halo
    for r, a in ((10, 40), (7, 70), (5, 110)):
        d.ellipse([11 - r, 11 - r, 11 + r, 11 + r], fill=(255, 190, 90, a))
    # pole
    d.rectangle([9, 16, 12, 33], fill=(120, 84, 48, 255), outline=(48, 30, 16, 255))
    d.line([(10, 17), (10, 32)], fill=(160, 118, 70, 255))
    # lantern cage
    d.rectangle([4, 3, 17, 17], fill=(92, 74, 46, 255), outline=(38, 26, 14, 255))
    d.rectangle([6, 5, 15, 15], fill=(255, 206, 110, 255))
    d.rectangle([8, 7, 13, 13], fill=(255, 246, 210, 255))
    # cage bars
    d.line([(10, 5), (10, 15)], fill=(120, 92, 52, 255))
    d.line([(6, 10), (15, 10)], fill=(120, 92, 52, 255))
    # top cap + ring
    d.rectangle([3, 1, 18, 4], fill=(120, 92, 52, 255), outline=(38, 26, 14, 255))
    d.arc([8, -3, 14, 3], start=0, end=180, fill=(180, 150, 90, 255), width=2)
    save(img, "totem_lantern.png", scale=3)

# ---------------------------------------------------------------------------
# footprint mark (left/right pair, used to trail behind the totem)
# ---------------------------------------------------------------------------
def footprint():
    W, H = 10, 12
    img, d = new_canvas(W, H)
    col = (232, 214, 178, 200)
    # sole
    d.ellipse([2, 3, 8, 11], fill=col)
    # ball of foot
    d.ellipse([1, 1, 8, 6], fill=col)
    # toes
    for tx in (2, 4, 6):
        d.point([(tx, 0)], fill=col)
    save(img, "footprint.png", scale=3)

lantern()
footprint()
print("Node/room + totem art complete.")
