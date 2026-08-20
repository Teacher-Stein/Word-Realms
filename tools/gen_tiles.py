#!/usr/bin/env python3
"""Original seamless pixel-art tile textures for the dungeon corridor, plus a
torch sprite. Small canvas, NEAREST upscale, per-biome palette."""
import os
from PIL import Image, ImageDraw

OUT = "/home/claude/dungeon-crawler/assets/tiles"
os.makedirs(OUT, exist_ok=True)
SCALE = 8

def save(img, path, scale=SCALE):
    img = img.resize((img.width*scale, img.height*scale), Image.NEAREST)
    img.save(path)
    print("wrote", path, img.size)

def wall_tile(name, mortar, brick_a, brick_b):
    W,H = 16,16
    img = Image.new("RGBA",(W,H),mortar)
    d = ImageDraw.Draw(img)
    # brick rows offset every other row for a running-bond pattern
    rows = [(0,0),(4,1),(8,0),(12,1)]
    bricks = [
        (0,0,7,3), (8,0,15,3),
        (0,4,3,7), (4,4,11,7), (12,4,15,7),
        (0,8,7,11), (8,8,15,11),
        (0,12,3,15), (4,12,11,15), (12,12,15,15),
    ]
    for i,(x0,y0,x1,y1) in enumerate(bricks):
        c = brick_a if i%2==0 else brick_b
        d.rectangle([x0,y0,x1,y1], fill=c)
    save(img, f"{OUT}/{name}.png")

def floor_tile(name, base, crack, dot):
    W,H = 16,16
    img = Image.new("RGBA",(W,H),base)
    d = ImageDraw.Draw(img)
    d.line([(2,2),(6,6),(4,10)], fill=crack, width=1)
    d.line([(10,3),(13,7)], fill=crack, width=1)
    d.point([(3,12),(12,12),(9,4),(6,14)], fill=dot)
    d.rectangle([0,0,15,0], fill=crack)
    d.rectangle([0,0,0,15], fill=crack)
    save(img, f"{OUT}/{name}.png")

def ceiling_tile(name, base, crack):
    W,H = 16,16
    img = Image.new("RGBA",(W,H),base)
    d = ImageDraw.Draw(img)
    d.line([(0,4),(16,4)], fill=crack, width=1)
    d.line([(5,4),(5,16)], fill=crack, width=1)
    d.line([(11,0),(11,4)], fill=crack, width=1)
    save(img, f"{OUT}/{name}.png")

def torch(name, wood, flame_out, flame_mid, flame_in):
    W,H = 14,26
    img = Image.new("RGBA",(W,H),(0,0,0,0))
    d = ImageDraw.Draw(img)
    d.rectangle([5,14,8,25], fill=wood)
    d.rectangle([3,12,10,15], fill=(70,60,50,255))
    d.polygon([(3,12),(11,12),(9,4),(7,0),(5,4)], fill=flame_out)
    d.polygon([(5,11),(9,11),(8,5),(7,2),(6,5)], fill=flame_mid)
    d.polygon([(6,10),(8,10),(7,6)], fill=flame_in)
    save(img, f"{OUT}/{name}.png")

# ---- Storm realm palette (cool purple-blue stonework) ----
wall_tile("wall_storm", (34,26,58,255), (74,58,108,255), (58,44,88,255))
floor_tile("floor_storm", (28,20,46,255), (14,10,28,255), (54,42,80,255))
ceiling_tile("ceiling_storm", (16,11,30,255), (8,5,18,255))
torch("torch", (58,40,26,255), (255,138,30,255), (255,196,60,255), (255,244,180,255))

print("Tileset generated.")
