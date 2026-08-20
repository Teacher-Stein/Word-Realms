#!/usr/bin/env python3
"""
Detailed original pixel-art generator for Word Realms (Realm 1: Stormlands).

Style: small canvas + NEAREST upscale for crisp pixels, but with a 5-tone
shading ramp (hi / light / base / shade / deep), rim lighting, cast shadows,
surface texture and expressive eyes so the sprites read as characters rather
than flat blobs.

All art is original and generated procedurally here - no external assets.
"""
import os, math
from PIL import Image, ImageDraw

OUT = "/home/claude/dungeon-crawler/assets/sprites"
os.makedirs(OUT, exist_ok=True)
SCALE = 7

# ---------------------------------------------------------------------------
# palette helper: build a 5-tone ramp from a base RGB
# ---------------------------------------------------------------------------
def ramp(base, outline=(16, 12, 30)):
    r, g, b = base
    def mix(c, t, amt):
        return tuple(int(c[i] + (t[i] - c[i]) * amt) for i in range(3))
    white = (255, 255, 255)
    black = (0, 0, 0)
    return {
        "hi":      mix(base, white, 0.62) + (255,),
        "light":   mix(base, white, 0.34) + (255,),
        "base":    tuple(base) + (255,),
        "shade":   mix(base, black, 0.30) + (255,),
        "deep":    mix(base, black, 0.55) + (255,),
        "outline": tuple(outline) + (255,),
    }

def new_canvas(w, h):
    img = Image.new("RGBA", (w, h), (0, 0, 0, 0))
    return img, ImageDraw.Draw(img)

def save(img, name, scale=SCALE):
    img = img.resize((img.width * scale, img.height * scale), Image.NEAREST)
    path = os.path.join(OUT, name)
    img.save(path)
    print("wrote", name, img.size)

# ---------------------------------------------------------------------------
# drawing primitives with shading
# ---------------------------------------------------------------------------
def shaded_orb(d, cx, cy, rx, ry, pal, rim=True, light_dx=-0.38, light_dy=-0.40):
    """A shaded ellipse body: base -> shadow -> deep -> highlight -> specular."""
    box = [cx - rx, cy - ry, cx + rx, cy + ry]
    d.ellipse(box, fill=pal["base"], outline=pal["outline"])
    # lower shadow crescent
    d.pieslice(box, start=15, end=165, fill=pal["shade"])
    # deepest shadow, tucked at the very bottom
    d.pieslice([box[0] + 2, box[1] + 2, box[2] - 2, box[3] - 2],
               start=42, end=138, fill=pal["deep"])
    # main highlight, offset toward the light
    hrx, hry = int(rx * 0.56), int(ry * 0.56)
    hx = cx + int(light_dx * rx * 0.62)
    hy = cy + int(light_dy * ry * 0.62)
    d.ellipse([hx - hrx, hy - hry, hx + hrx, hy + hry], fill=pal["light"])
    # tight specular
    srx, sry = max(1, int(rx * 0.22)), max(1, int(ry * 0.22))
    d.ellipse([hx - srx, hy - sry, hx + srx, hy + sry], fill=pal["hi"])
    if rim:
        # thin rim light along the upper-left edge
        d.arc(box, start=190, end=290, fill=pal["hi"], width=1)
    d.ellipse(box, outline=pal["outline"])

def detailed_eye(d, cx, cy, r, iris, pupil=(18, 14, 30, 255), angry=False,
                 sclera=(255, 255, 255, 255), brow=None):
    """Eye with sclera, iris, pupil, a 1px specular glint and eyelid shadow.
    Keep r small (2-4) for menacing; larger reads as cute."""
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill=sclera,
              outline=(20, 20, 34, 255))
    iy = cy + max(0, r // 4)
    # PIL renders ellipses under ~3px across as plus/diamond shapes, so the
    # small inner parts are drawn as squares instead.
    if r <= 3:
        # blocky 2x2 pupil only - cleanest read at this size
        d.rectangle([cx - 1, iy - 1, cx, iy], fill=iris)
        d.point([(cx - 1, iy - 1)], fill=pupil)
    else:
        ir = max(2, int(round(r * 0.55)))
        d.ellipse([cx - ir, iy - ir, cx + ir, iy + ir], fill=iris)
        pr = max(1, int(round(r * 0.28)))
        if pr <= 1:
            d.rectangle([cx - 1, iy - 1, cx, iy], fill=pupil)
        else:
            d.ellipse([cx - pr, iy - pr, cx + pr, iy + pr], fill=pupil)
    # single-pixel specular glint
    d.point([(cx - max(1, r // 2), cy - max(1, r // 2))],
            fill=(255, 255, 255, 255))
    # eyelid shadow across the top of the eye
    d.arc([cx - r, cy - r, cx + r, cy + r], start=190, end=350,
          fill=(70, 62, 100, 255), width=1)
    if angry:
        bc = brow or (18, 14, 30, 255)
        # heavy angled brow, thicker toward the nose bridge
        d.line([cx - r - 1, cy - r - 3, cx + r + 1, cy - r], fill=bc, width=2)
        d.line([cx - r - 1, cy - r - 2, cx, cy - r - 1], fill=bc, width=1)

def cast_shadow(d, cx, cy, rx, ry=None):
    ry = ry or max(2, rx // 3)
    d.ellipse([cx - rx, cy - ry, cx + rx, cy + ry], fill=(0, 0, 0, 70))

def texture_specks(d, spots, color):
    for (x, y, r) in spots:
        d.ellipse([x - r, y - r, x + r, y + r], fill=color)

# ===========================================================================
# REGULAR MONSTERS (6)  - canvas 48x48
# ===========================================================================
def thunderclap_wyrm():
    W = H = 48
    img, d = new_canvas(W, H)
    P = ramp((104, 140, 235))
    cast_shadow(d, 24, 45, 15)
    # back cloud lobes (darker, behind)
    shaded_orb(d, 8, 24, 8, 7, ramp((78, 106, 190)))
    shaded_orb(d, 40, 24, 8, 7, ramp((78, 106, 190)))
    # forked tail
    d.polygon([(24, 40), (15, 47), (21, 36), (27, 36), (33, 47)],
              fill=P["shade"], outline=P["outline"])
    d.polygon([(24, 40), (19, 47), (22, 38), (24, 38)], fill=P["deep"])
    # main body
    shaded_orb(d, 24, 22, 16, 15, P)
    # cloud puff texture
    texture_specks(d, [(14, 13, 3), (32, 11, 3), (23, 8, 2), (12, 27, 2)], P["hi"])
    detailed_eye(d, 18, 22, 4, (90, 130, 220, 255))
    detailed_eye(d, 30, 22, 4, (90, 130, 220, 255))
    # mouth
    d.arc([17, 28, 31, 37], start=20, end=160, fill=P["deep"], width=2)
    # lightning crest (two-tone for glow)
    d.polygon([(24, 1), (18, 11), (24, 11), (20, 20)], fill=(196, 146, 12, 255))
    d.polygon([(24, 2), (20, 10), (24, 10), (22, 17)], fill=(255, 226, 108, 255))
    save(img, "wyrm_storm.png")

def blizzard_wisp():
    W = H = 48
    img, d = new_canvas(W, H)
    P = ramp((214, 234, 255))
    cast_shadow(d, 24, 44, 11)
    # wispy tail: layered zig-zag
    d.polygon([(10, 28), (10, 42), (15, 34), (19, 44), (24, 34),
               (29, 44), (33, 34), (38, 42), (38, 28)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(10, 30), (10, 41), (14, 34), (17, 42), (20, 34), (20, 30)],
              fill=P["shade"])
    # head
    shaded_orb(d, 24, 20, 14, 14, P)
    # frost crystal flecks
    for (x, y) in [(13, 12), (35, 14), (24, 6), (16, 27), (32, 27)]:
        d.line([x - 2, y, x + 2, y], fill=(150, 205, 255, 255))
        d.line([x, y - 2, x, y + 2], fill=(150, 205, 255, 255))
    detailed_eye(d, 19, 20, 3, (86, 160, 235, 255))
    detailed_eye(d, 29, 20, 3, (86, 160, 235, 255))
    d.arc([20, 26, 28, 31], start=205, end=335, fill=(126, 156, 200, 255), width=1)
    save(img, "wisp_storm.png")

def sandstorm_djinn():
    W = H = 48
    img, d = new_canvas(W, H)
    P = ramp((222, 176, 96))
    cast_shadow(d, 24, 45, 13)
    # swirling lower vortex
    d.polygon([(24, 42), (12, 47), (18, 32), (30, 32), (36, 47)],
              fill=P["shade"], outline=P["outline"])
    d.polygon([(24, 42), (17, 47), (20, 34), (24, 34)], fill=P["deep"])
    # body
    shaded_orb(d, 24, 22, 14, 15, P)
    # spiral sand marks across the torso
    for i, r in enumerate((11, 8, 5)):
        d.arc([24 - r, 24 - r, 24 + r, 24 + r],
              start=190 + i * 40, end=470 + i * 40, fill=P["deep"], width=1)
    detailed_eye(d, 19, 20, 3, (255, 214, 120, 255), angry=True)
    detailed_eye(d, 29, 20, 3, (255, 214, 120, 255), angry=True)
    # turban / flame tip
    shaded_orb(d, 24, 7, 6, 5, ramp((196, 148, 74)))
    save(img, "djinn_storm.png")

def hailstone_brute():
    W = H = 48
    img, d = new_canvas(W, H)
    P = ramp((150, 172, 196))
    cast_shadow(d, 24, 46, 16)
    # chunky rocky body (blocky, not round)
    d.polygon([(9, 45), (7, 24), (14, 13), (34, 13), (41, 24), (39, 45)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(9, 45), (7, 24), (14, 13), (20, 13), (18, 45)], fill=P["light"])
    d.polygon([(30, 45), (32, 16), (34, 13), (41, 24), (39, 45)], fill=P["shade"])
    d.polygon([(24, 45), (26, 30), (34, 30), (33, 45)], fill=P["deep"])
    # ice shard spikes on the shoulders
    for (bx, by) in [(12, 14), (24, 10), (36, 14)]:
        d.polygon([(bx - 3, by + 4), (bx, by - 7), (bx + 3, by + 4)],
                  fill=P["hi"], outline=P["outline"])
    # hailstone pocks
    texture_specks(d, [(15, 30, 2), (28, 22, 2), (20, 38, 2), (33, 35, 2)],
                   P["deep"])
    detailed_eye(d, 19, 22, 3, (140, 220, 255, 255), angry=True)
    detailed_eye(d, 29, 22, 3, (140, 220, 255, 255), angry=True)
    # heavy jaw
    d.rectangle([18, 30, 30, 34], fill=P["deep"])
    for x in range(19, 30, 3):
        d.polygon([(x, 30), (x + 2, 30), (x + 1, 33)], fill=P["hi"])
    save(img, "brute_storm.png")

def frost_fang():
    """Front-facing crouched ice-beast: reads far better head-on in a corridor
    than a side-view quadruped does at this resolution."""
    W = H = 48
    img, d = new_canvas(W, H)
    P = ramp((92, 158, 214))
    cast_shadow(d, 24, 46, 17)
    # hunched shoulders / haunches behind the head
    shaded_orb(d, 11, 34, 9, 9, ramp((72, 132, 188)))
    shaded_orb(d, 37, 34, 9, 9, ramp((72, 132, 188)))
    # forepaws
    for px in (9, 33):
        d.rounded_rectangle([px, 40, px + 7, 46], radius=2,
                            fill=P["shade"], outline=P["outline"])
        for cxp in range(px + 1, px + 7, 2):
            d.line([(cxp, 46), (cxp, 43)], fill=P["deep"])
    # frost spines along the back
    for (sx, sy) in [(6, 26), (24, 20), (42, 26)]:
        d.polygon([(sx - 4, sy + 6), (sx, sy - 6), (sx + 4, sy + 6)],
                  fill=P["hi"], outline=P["outline"])
    # head (large, dominant)
    shaded_orb(d, 24, 26, 15, 13, P)
    # ears
    d.polygon([(12, 18), (9, 5), (20, 15)], fill=P["shade"], outline=P["outline"])
    d.polygon([(36, 18), (39, 5), (28, 15)], fill=P["shade"], outline=P["outline"])
    d.polygon([(13, 17), (11, 9), (18, 15)], fill=P["light"])
    d.polygon([(35, 17), (37, 9), (30, 15)], fill=P["light"])
    detailed_eye(d, 18, 24, 3, (190, 240, 255, 255), angry=True)
    detailed_eye(d, 30, 24, 3, (190, 240, 255, 255), angry=True)
    # snout
    shaded_orb(d, 24, 33, 8, 6, ramp((132, 190, 230)))
    d.ellipse([22, 30, 26, 33], fill=(40, 60, 90, 255))
    # open jaw with fangs
    d.polygon([(17, 35), (31, 35), (28, 42), (20, 42)],
              fill=(46, 30, 60, 255), outline=P["outline"])
    for fx in (19, 23, 27):
        d.polygon([(fx, 35), (fx + 2, 35), (fx + 1, 39)],
                  fill=(255, 255, 255, 255))
    for fx in (21, 25):
        d.polygon([(fx, 42), (fx + 2, 42), (fx + 1, 38)],
                  fill=(235, 245, 255, 255))
    save(img, "fang_storm.png")

def heatwave_shimmer():
    """Molten wraith. Heat haze is drawn as HORIZONTAL wavy bands - vertical
    ribbons read as spider legs at this size."""
    W = H = 48
    img, d = new_canvas(W, H)
    P = ramp((238, 138, 70))
    HAZE = ramp((214, 108, 48))
    cast_shadow(d, 24, 46, 15)
    # horizontal shimmering haze bands behind the body
    for row, y in enumerate((12, 20, 28, 36, 43)):
        pts = []
        for x in range(2, 47, 3):
            pts.append((x, y + int(1.6 * math.sin(x / 3.2 + row))))
        for j in range(len(pts) - 1):
            d.line([pts[j], pts[j + 1]], fill=HAZE["shade"], width=1)
    # rising molten body: teardrop, wide at base
    d.polygon([(24, 6), (36, 26), (34, 40), (14, 40), (12, 26)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(24, 6), (18, 24), (16, 40), (14, 40), (12, 26)], fill=P["light"])
    d.polygon([(30, 22), (36, 26), (34, 40), (28, 40)], fill=P["shade"])
    d.polygon([(20, 34), (30, 34), (29, 40), (19, 40)], fill=P["deep"])
    # molten core glow
    d.ellipse([18, 22, 30, 34], fill=(255, 190, 90, 255))
    d.ellipse([21, 25, 27, 31], fill=(255, 240, 178, 255))
    # crackling ember specks
    texture_specks(d, [(16, 18, 1), (32, 20, 1), (24, 14, 1), (30, 36, 1),
                       (17, 34, 1)], (255, 240, 178, 255))
    detailed_eye(d, 19, 20, 3, (255, 120, 40, 255), angry=True,
                 sclera=(255, 232, 186, 255), brow=(120, 38, 8, 255))
    detailed_eye(d, 29, 20, 3, (255, 120, 40, 255), angry=True,
                 sclera=(255, 232, 186, 255), brow=(120, 38, 8, 255))
    save(img, "shimmer_storm.png")

# ===========================================================================
# ELITES (2) - canvas 56x56, bigger and more ornate
# ===========================================================================
def tempest_warden():
    W = H = 56
    img, d = new_canvas(W, H)
    P = ramp((124, 96, 196))
    M = ramp((196, 168, 96))  # metal trim
    cast_shadow(d, 28, 53, 19)
    # cloak / lower body
    d.polygon([(10, 52), (14, 26), (28, 18), (42, 26), (46, 52)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(10, 52), (14, 26), (24, 20), (22, 52)], fill=P["light"])
    d.polygon([(36, 52), (38, 24), (42, 26), (46, 52)], fill=P["shade"])
    # armour plates
    d.polygon([(18, 30), (28, 25), (38, 30), (38, 36), (18, 36)],
              fill=M["base"], outline=M["outline"])
    d.polygon([(18, 30), (28, 25), (28, 36), (18, 36)], fill=M["light"])
    # pauldrons
    shaded_orb(d, 12, 26, 7, 5, M)
    shaded_orb(d, 44, 26, 7, 5, M)
    # helm dome
    shaded_orb(d, 28, 15, 12, 11, P)
    # dark visor slot across the face - glowing slit eyes read as armour,
    # whereas round white eyes under a helmet look like a mascot
    d.rounded_rectangle([17, 17, 39, 24], radius=2,
                        fill=(28, 22, 48, 255), outline=M["outline"])
    for ex in (22, 34):
        d.rounded_rectangle([ex - 3, 19, ex + 3, 22], radius=1,
                            fill=(150, 220, 255, 255))
        d.point([(ex - 2, 20)], fill=(255, 255, 255, 255))
    # brow ridge over the visor
    d.polygon([(16, 17), (28, 9), (40, 17)], fill=M["base"],
              outline=M["outline"])
    d.polygon([(18, 16), (28, 10), (28, 16)], fill=M["light"])
    # crest spikes
    for sx in (-8, 0, 8):
        d.polygon([(28 + sx - 2, 9), (28 + sx, 0), (28 + sx + 2, 9)],
                  fill=M["hi"], outline=M["outline"])
    # staff
    d.rectangle([47, 12, 49, 50], fill=(120, 88, 52, 255), outline=P["outline"])
    d.ellipse([43, 4, 53, 14], fill=(150, 214, 255, 255), outline=P["outline"])
    d.ellipse([46, 7, 50, 11], fill=(255, 255, 255, 255))
    save(img, "warden_storm.png")

def thunder_colossus():
    W = H = 56
    img, d = new_canvas(W, H)
    P = ramp((72, 104, 190))
    G = ramp((240, 200, 90))
    cast_shadow(d, 28, 53, 21)
    # massive shoulders / torso
    d.polygon([(8, 52), (10, 28), (20, 20), (36, 20), (46, 28), (48, 52)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(8, 52), (10, 28), (20, 20), (24, 20), (20, 52)], fill=P["light"])
    d.polygon([(38, 52), (40, 24), (46, 28), (48, 52)], fill=P["shade"])
    # arms
    shaded_orb(d, 8, 34, 6, 9, P)
    shaded_orb(d, 48, 34, 6, 9, P)
    # chest storm-core
    d.ellipse([21, 28, 35, 42], fill=G["base"], outline=P["outline"])
    d.ellipse([24, 31, 32, 39], fill=G["hi"])
    for i in range(3):
        d.arc([18 - i * 2, 25 - i * 2, 38 + i * 2, 45 + i * 2],
              start=0, end=360, fill=P["deep"], width=1)
    # head
    shaded_orb(d, 28, 14, 10, 10, P)
    detailed_eye(d, 24, 14, 3, (255, 226, 108, 255), angry=True)
    detailed_eye(d, 32, 14, 3, (255, 226, 108, 255), angry=True)
    # horns
    d.polygon([(19, 8), (14, 0), (23, 6)], fill=P["shade"], outline=P["outline"])
    d.polygon([(37, 8), (42, 0), (33, 6)], fill=P["shade"], outline=P["outline"])
    # lightning arcs off the shoulders
    d.polygon([(6, 22), (2, 30), (6, 29), (3, 38)], fill=G["hi"])
    d.polygon([(50, 22), (54, 30), (50, 29), (53, 38)], fill=G["hi"])
    save(img, "colossus_storm.png")

# ===========================================================================
# BOSS - canvas 72x72
# ===========================================================================
def hurricane_titan():
    W = H = 72
    img, d = new_canvas(W, H)
    P = ramp((112, 92, 200))
    G = ramp((255, 214, 106))
    cast_shadow(d, 36, 69, 27)
    # outer storm skirt: jagged vortex
    pts = [(36, 70)]
    for i in range(13):
        ang = math.pi * (0.04 + 0.92 * i / 12)
        rad = 32 if i % 2 == 0 else 23
        pts.append((36 + rad * math.cos(ang), 34 + rad * math.sin(ang) * 1.05))
    d.polygon(pts, fill=P["shade"], outline=P["outline"])
    # inner skirt shading
    d.pieslice([12, 16, 60, 62], start=20, end=160, fill=P["deep"])
    # torso
    shaded_orb(d, 36, 30, 22, 21, P)
    # vortex rings
    for i, r in enumerate((17, 13, 9, 5)):
        d.ellipse([36 - r, 34 - r, 36 + r, 34 + r], outline=P["deep"], width=1)
    # storm core
    d.ellipse([31, 29, 41, 39], fill=G["base"])
    d.ellipse([33, 31, 39, 37], fill=G["hi"])
    # eyes
    detailed_eye(d, 28, 24, 5, (255, 226, 108, 255), angry=True)
    detailed_eye(d, 44, 24, 5, (255, 226, 108, 255), angry=True)
    # crown of spikes
    for sx in (-16, -8, 0, 8, 16):
        d.polygon([(36 + sx - 3, 12), (36 + sx, 1), (36 + sx + 3, 12)],
                  fill=P["light"], outline=P["outline"])
        d.polygon([(36 + sx - 1, 11), (36 + sx, 4), (36 + sx + 1, 11)],
                  fill=G["hi"])
    # lightning wings
    d.polygon([(8, 26), (0, 38), (7, 36), (2, 50)], fill=G["hi"])
    d.polygon([(64, 26), (72, 38), (65, 36), (70, 50)], fill=G["hi"])
    save(img, "titan_storm.png")

# ===========================================================================
# FRIENDLY NPC (event nodes) - canvas 48x56
# ===========================================================================
def storm_chaser():
    W, H = 48, 56
    img, d = new_canvas(W, H)
    C = ramp((96, 86, 158))   # cloak
    M = ramp((176, 140, 84))  # staff wood
    cast_shadow(d, 24, 53, 15)
    # cloak body
    d.polygon([(11, 52), (15, 28), (24, 22), (33, 28), (37, 52)],
              fill=C["base"], outline=C["outline"])
    d.polygon([(11, 52), (15, 28), (23, 23), (21, 52)], fill=C["light"])
    d.polygon([(30, 52), (31, 27), (33, 28), (37, 52)], fill=C["shade"])
    # cloak fold lines
    d.line([(20, 30), (19, 50)], fill=C["deep"])
    d.line([(28, 30), (29, 50)], fill=C["deep"])
    # hood
    shaded_orb(d, 24, 18, 12, 12, C)
    # face shadow inside hood
    d.ellipse([17, 13, 31, 27], fill=(38, 30, 60, 255))
    # friendly glowing eyes (rounded, not angry)
    detailed_eye(d, 20, 20, 3, (255, 226, 108, 255),
                 sclera=(255, 244, 200, 255))
    detailed_eye(d, 28, 20, 3, (255, 226, 108, 255),
                 sclera=(255, 244, 200, 255))
    # scarf
    d.polygon([(15, 28), (33, 28), (31, 33), (17, 33)],
              fill=(178, 92, 108, 255), outline=C["outline"])
    # lantern staff
    d.rectangle([38, 16, 40, 52], fill=M["base"], outline=C["outline"])
    d.rectangle([34, 8, 44, 18], fill=(120, 96, 60, 255), outline=C["outline"])
    d.rectangle([36, 10, 42, 16], fill=(255, 226, 140, 255))
    d.ellipse([37, 11, 41, 15], fill=(255, 255, 235, 255))
    save(img, "npc_chaser.png")

for fn in (thunderclap_wyrm, blizzard_wisp, sandstorm_djinn, hailstone_brute,
           frost_fang, heatwave_shimmer, tempest_warden, thunder_colossus,
           hurricane_titan, storm_chaser):
    fn()
print("Realm 1 sprite set complete.")
