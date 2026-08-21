#!/usr/bin/env python3
"""Original pixel-art icons for relics and potions (48x48 base, NEAREST upscale)."""
import os, math
from PIL import Image, ImageDraw

OUT = "/home/claude/dungeon-crawler/assets/items"
os.makedirs(OUT, exist_ok=True)
SCALE = 5
S = 48

def ramp(base, outline=(16, 12, 30)):
    def mix(c, t, a): return tuple(int(c[i] + (t[i]-c[i])*a) for i in range(3))
    W, B = (255,255,255), (0,0,0)
    return {"hi":mix(base,W,.62)+(255,), "light":mix(base,W,.34)+(255,),
            "base":tuple(base)+(255,), "shade":mix(base,B,.30)+(255,),
            "deep":mix(base,B,.55)+(255,), "outline":tuple(outline)+(255,)}

def canvas():
    img = Image.new("RGBA", (S, S), (0,0,0,0))
    return img, ImageDraw.Draw(img)

def save(img, name):
    img.resize((S*SCALE, S*SCALE), Image.NEAREST).save(os.path.join(OUT, name))
    print("wrote", name)

def orb(d, cx, cy, rx, ry, P):
    box=[cx-rx, cy-ry, cx+rx, cy+ry]
    d.ellipse(box, fill=P["base"], outline=P["outline"])
    d.pieslice(box, start=15, end=165, fill=P["shade"])
    hrx,hry=int(rx*.55),int(ry*.55)
    d.ellipse([cx-int(rx*.3)-hrx, cy-int(ry*.3)-hry, cx-int(rx*.3)+hrx, cy-int(ry*.3)+hry], fill=P["light"])
    d.ellipse(box, outline=P["outline"])

def glow_bg(d, col=(255,214,106,46)):
    for r,a in ((21,30),(17,44),(13,58)):
        d.ellipse([24-r,24-r,24+r,24+r], fill=col[:3]+(a,))

# ---------------------------------------------------------------- RELICS
def lucky_charm():
    img,d=canvas(); glow_bg(d); P=ramp((104,196,120))
    # four-leaf clover
    for ang in (0,90,180,270):
        rad=math.radians(ang)
        cx=24+int(8*math.cos(rad)); cy=22+int(8*math.sin(rad))
        orb(d,cx,cy,8,8,P)
    d.line([(24,28),(21,42)], fill=(96,70,36,255), width=3)
    save(img,"lucky_charm.png")

def second_wind():
    img,d=canvas(); glow_bg(d,(140,220,255,60)); P=ramp((120,200,255))
    # swirling wind spiral
    for i,r in enumerate((16,11,6)):
        d.arc([24-r,24-r,24+r,24+r], start=200+i*30, end=520+i*30,
              fill=P["base"] if i%2==0 else P["light"], width=4)
    d.polygon([(36,14),(42,18),(34,22)], fill=P["hi"], outline=P["outline"])
    save(img,"second_wind.png")

def echo_shard():
    img,d=canvas(); glow_bg(d,(160,230,255,60)); P=ramp((110,210,240))
    d.polygon([(24,4),(38,20),(30,44),(18,44),(10,20)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,4),(30,20),(24,44),(18,44),(14,20)], fill=P["light"])
    d.polygon([(24,10),(28,20),(24,30),(21,20)], fill=P["hi"])
    save(img,"echo_shard.png")

def storm_map():
    img,d=canvas(); P=ramp((214,190,140))
    d.polygon([(6,10),(18,6),(30,10),(42,6),(42,40),(30,44),(18,40),(6,44)],
              fill=P["base"], outline=P["outline"])
    d.line([(18,6),(18,40)], fill=P["shade"]); d.line([(30,10),(30,44)], fill=P["shade"])
    # dotted route + X
    for (x,y) in [(11,30),(15,26),(20,24),(25,20),(30,18)]:
        d.ellipse([x-1,y-1,x+1,y+1], fill=(150,60,50,255))
    d.line([(32,14),(38,20)], fill=(190,50,50,255), width=3)
    d.line([(38,14),(32,20)], fill=(190,50,50,255), width=3)
    save(img,"storm_map.png")

def warm_cloak():
    img,d=canvas(); P=ramp((176,88,110))
    d.polygon([(24,6),(38,16),(40,42),(8,42),(10,16)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,6),(24,42),(8,42),(10,16)], fill=P["light"])
    d.polygon([(18,6),(30,6),(28,14),(20,14)], fill=P["shade"], outline=P["outline"])
    d.ellipse([21,13,27,19], fill=(255,214,106,255), outline=P["outline"])
    save(img,"warm_cloak.png")

def thunder_sigil():
    img,d=canvas(); glow_bg(d,(255,226,108,72)); P=ramp((90,74,168))
    d.ellipse([6,6,42,42], fill=P["base"], outline=P["outline"])
    d.ellipse([11,11,37,37], outline=P["deep"], width=2)
    d.polygon([(27,10),(17,26),(24,26),(20,38),(32,20),(25,20)],
              fill=(255,226,108,255), outline=(140,96,10,255))
    save(img,"thunder_sigil.png")

def scholars_lens():
    img,d=canvas(); P=ramp((196,168,96))
    d.ellipse([6,6,34,34], fill=(150,220,240,150), outline=P["outline"], width=2)
    d.ellipse([6,6,34,34], outline=P["base"], width=4)
    d.arc([10,10,30,30], start=200, end=280, fill=(255,255,255,220), width=3)
    d.line([(31,31),(43,43)], fill=P["shade"], width=6)
    d.line([(31,31),(43,43)], fill=P["base"], width=3)
    save(img,"scholars_lens.png")

def iron_bell():
    img,d=canvas(); P=ramp((186,190,200))
    d.pieslice([10,8,38,38], start=180, end=360, fill=P["base"], outline=P["outline"])
    d.rectangle([10,23,38,34], fill=P["base"], outline=P["outline"])
    d.polygon([(10,23),(24,23),(24,34),(10,34)], fill=P["light"])
    d.rectangle([8,34,40,38], fill=P["shade"], outline=P["outline"])
    d.ellipse([21,38,27,44], fill=P["deep"], outline=P["outline"])
    d.rectangle([22,4,26,9], fill=P["shade"], outline=P["outline"])
    save(img,"iron_bell.png")

def ember_pouch():
    img,d=canvas(); glow_bg(d,(255,160,70,66)); P=ramp((150,104,56))
    d.ellipse([9,16,39,44], fill=P["base"], outline=P["outline"])
    d.pieslice([9,16,39,44], start=15, end=165, fill=P["shade"])
    d.rectangle([16,10,32,18], fill=P["shade"], outline=P["outline"])
    d.line([(16,14),(32,14)], fill=(90,60,30,255), width=2)
    for (x,y,r) in [(20,26,3),(28,29,4),(23,34,3)]:
        d.ellipse([x-r,y-r,x+r,y+r], fill=(255,190,90,255))
        d.ellipse([x-1,y-1,x+1,y+1], fill=(255,246,200,255))
    save(img,"ember_pouch.png")

def guiding_star():
    img,d=canvas(); glow_bg(d,(255,240,180,80))
    pts=[]
    for i in range(10):
        a=math.radians(-90+i*36); r=19 if i%2==0 else 8
        pts.append((24+r*math.cos(a), 24+r*math.sin(a)))
    d.polygon(pts, fill=(255,226,120,255), outline=(150,110,20,255))
    d.polygon([(24,8),(29,24),(24,40),(19,24)], fill=(255,250,215,255))
    save(img,"guiding_star.png")

# ---------------------------------------------------------------- POTIONS
def potion(name, liquid, label_glyph=None):
    img,d=canvas()
    L=ramp(liquid)
    glow_bg(d, liquid+(40,))
    # flask body
    d.ellipse([10,20,38,44], fill=(214,232,244,90), outline=(60,70,90,255))
    d.pieslice([10,20,38,44], start=8, end=172, fill=L["base"])
    d.pieslice([13,24,35,42], start=20, end=160, fill=L["light"])
    # liquid surface
    d.ellipse([14,26,34,33], fill=L["light"], outline=L["shade"])
    # neck + cork
    d.rectangle([20,10,28,22], fill=(214,232,244,110), outline=(60,70,90,255))
    d.rectangle([18,5,30,11], fill=(160,116,66,255), outline=(70,46,22,255))
    # glass highlight
    d.line([(15,28),(15,38)], fill=(255,255,255,160), width=2)
    # bubbles
    for (x,y,r) in [(22,36,2),(28,39,2),(25,33,1)]:
        d.ellipse([x-r,y-r,x+r,y+r], fill=L["hi"])
    if label_glyph:
        label_glyph(d)
    save(img,name)

def heal_glyph(d):
    d.rectangle([22,35,26,43], fill=(255,255,255,230))
    d.rectangle([19,38,29,41], fill=(255,255,255,230))

def clarity_glyph(d):
    d.ellipse([20,35,28,43], outline=(255,255,255,230), width=2)
    d.line([(24,33),(24,36)], fill=(255,255,255,230), width=2)
    d.line([(24,42),(24,45)], fill=(255,255,255,230), width=2)

def shield_glyph(d):
    d.polygon([(24,33),(30,36),(29,42),(24,45),(19,42),(18,36)],
              fill=(255,255,255,220), outline=(90,110,140,255))

for f in (lucky_charm, second_wind, echo_shard, storm_map, warm_cloak,
          thunder_sigil, scholars_lens, iron_bell, ember_pouch, guiding_star):
    f()
potion("potion_heal.png",    (226, 74, 96),  heal_glyph)
potion("potion_clarity.png", (110,180,250),  clarity_glyph)
potion("potion_shield.png",  (240,190, 80),  shield_glyph)

# shop node icon (matches the room style of gen_nodes.py)
def shop_room():
    W=H=32
    img=Image.new("RGBA",(W,H),(0,0,0,0)); d=ImageDraw.Draw(img)
    wall=(96,74,116,255); wall_hi=(146,120,170,255); wall_dark=(60,44,76,255); floor=(38,26,50,255)
    d.rectangle([0,0,W-1,H-1], fill=wall, outline=(12,9,22,255))
    for row,y in enumerate(range(1,H-1,4)):
        off = 0 if row%2==0 else 4
        d.line([(1,y),(W-2,y)], fill=wall_dark)
        for x in range(1+off, W-2, 8):
            d.line([(x,y),(x,min(y+3,H-2))], fill=wall_dark)
    d.rectangle([5,5,W-6,H-6], fill=floor, outline=(12,9,22,255))
    d.line([(5,5),(W-6,5)], fill=wall_hi); d.line([(5,5),(5,H-6)], fill=wall_hi)
    # awning + coin
    d.rectangle([8,10,24,14], fill=(196,80,86,255), outline=(90,26,30,255))
    for x in range(8,25,4):
        d.polygon([(x,14),(x+4,14),(x+2,17)], fill=(236,222,214,255))
    d.ellipse([13,18,21,26], fill=(255,214,106,255), outline=(140,96,10,255))
    d.line([(17,20),(17,24)], fill=(140,96,10,255))
    img.resize((W*4,H*4), Image.NEAREST).save("/home/claude/dungeon-crawler/assets/nodes/node_shop.png")
    print("wrote node_shop.png")

shop_room()
print("Item + shop art complete.")
