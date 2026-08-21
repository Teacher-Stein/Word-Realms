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

# ===========================================================================
# BUILD A additions: 14 more relics, 3 weapons, 3 armours, 4 enchantments
# ===========================================================================
def _base(glow=None):
    img, d = canvas()
    if glow: glow_bg(d, glow)
    return img, d

def keen_edge():
    img,d=_base((200,220,255,50)); P=ramp((186,196,214))
    d.polygon([(30,6),(38,14),(18,40),(12,34)], fill=P["base"], outline=P["outline"])
    d.polygon([(30,6),(34,10),(16,36),(13,33)], fill=P["hi"])
    d.rectangle([8,34,18,44], fill=(120,88,52,255), outline=P["outline"])
    for i in range(3):
        d.line([(34-i*3,4+i*2),(40-i*3,10+i*2)], fill=(255,255,255,200))
    save(img,"keen_edge.png")

def riposte_ring():
    img,d=_base((150,220,255,60)); P=ramp((198,168,90))
    d.ellipse([8,8,40,40], outline=P["base"], width=6)
    d.ellipse([8,8,40,40], outline=P["outline"], width=1)
    d.ellipse([14,14,34,34], outline=P["outline"], width=1)
    d.polygon([(24,2),(29,12),(19,12)], fill=(150,220,255,255), outline=P["outline"])
    save(img,"riposte_ring.png")

def giant_slayer():
    img,d=_base((255,214,106,70)); P=ramp((160,176,200)); G=ramp((214,178,80))
    d.polygon([(24,2),(31,16),(31,34),(17,34),(17,16)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,2),(27,16),(24,34),(20,34),(21,16)], fill=P["hi"])
    d.rectangle([12,34,36,39], fill=G["base"], outline=G["outline"])
    d.rectangle([21,39,27,46], fill=(120,88,52,255), outline=P["outline"])
    d.ellipse([20,44,28,48], fill=G["base"], outline=G["outline"])
    save(img,"giant_slayer.png")

def stone_heart():
    img,d=_base((255,120,140,60)); P=ramp((150,150,166)); R=ramp((214,80,100))
    d.polygon([(24,44),(8,26),(8,16),(16,8),(24,14),(32,8),(40,16),(40,26)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(24,38),(14,26),(14,18),(20,13),(24,17)], fill=P["light"])
    d.polygon([(24,34),(17,25),(21,21),(24,24),(27,21),(31,25)], fill=R["base"])
    save(img,"stone_heart.png")

def aegis_charm():
    img,d=_base((150,214,255,66)); P=ramp((120,180,230))
    d.polygon([(24,4),(40,12),(38,30),(24,44),(10,30),(8,12)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(24,4),(24,44),(10,30),(8,12)], fill=P["light"])
    d.polygon([(24,12),(32,16),(31,27),(24,35),(17,27),(16,16)], outline=P["hi"], width=2)
    save(img,"aegis_charm.png")

def last_breath():
    img,d=_base((255,240,200,70)); P=ramp((236,232,224))
    d.ellipse([12,14,36,38], fill=P["base"], outline=P["outline"])
    d.ellipse([17,19,31,33], fill=P["hi"])
    for (x,y) in [(24,6),(14,10),(34,10)]:
        d.ellipse([x-3,y-3,x+3,y+3], fill=P["light"], outline=P["outline"])
    save(img,"last_breath.png")

def thaw_stone():
    img,d=_base((255,170,90,70)); P=ramp((198,132,86))
    d.polygon([(24,6),(38,18),(36,36),(24,44),(12,36),(10,18)],
              fill=P["base"], outline=P["outline"])
    d.polygon([(24,12),(32,20),(31,33),(24,38),(17,33),(16,20)], fill=(255,196,110,255))
    d.ellipse([20,22,28,30], fill=(255,244,200,255))
    save(img,"thaw_stone.png")

def coin_purse():
    img,d=_base((255,214,106,60)); P=ramp((132,96,64))
    d.ellipse([9,18,39,44], fill=P["base"], outline=P["outline"])
    d.pieslice([9,18,39,44], start=15, end=165, fill=P["shade"])
    d.rectangle([16,11,32,20], fill=P["shade"], outline=P["outline"])
    for (x,y) in [(20,28),(28,31),(24,36)]:
        d.ellipse([x-4,y-4,x+4,y+4], fill=(255,214,106,255), outline=(140,96,10,255))
    save(img,"coin_purse.png")

def haggle_token():
    img,d=_base((255,226,140,66)); G=ramp((226,186,86))
    d.ellipse([7,7,41,41], fill=G["base"], outline=G["outline"])
    d.ellipse([12,12,36,36], outline=G["deep"], width=2)
    d.rectangle([22,15,26,33], fill=G["deep"])
    d.rectangle([17,19,31,22], fill=G["deep"])
    d.rectangle([17,26,31,29], fill=G["deep"])
    save(img,"haggle_token.png")

def magpie_eye():
    img,d=_base((160,220,255,66))
    d.ellipse([4,14,44,34], fill=(240,244,255,255), outline=(30,30,50,255))
    d.ellipse([16,12,32,36], fill=(90,170,230,255), outline=(30,30,50,255))
    d.ellipse([20,18,28,30], fill=(20,20,40,255))
    d.ellipse([21,19,24,23], fill=(255,255,255,255))
    save(img,"magpie_eye.png")

def scouts_chart():
    img,d=_base(); P=ramp((206,186,140))
    d.polygon([(6,12),(24,7),(42,12),(42,40),(24,45),(6,40)], fill=P["base"], outline=P["outline"])
    d.line([(24,7),(24,45)], fill=P["shade"])
    for y in (18,26,34):
        d.line([(10,y),(20,y-2)], fill=P["deep"])
        d.line([(28,y-2),(38,y)], fill=P["deep"])
    d.ellipse([20,20,28,28], outline=(190,60,60,255), width=2)
    save(img,"scouts_chart.png")

def study_notes():
    img,d=_base((200,220,255,50)); P=ramp((238,236,226))
    d.rectangle([9,7,39,43], fill=P["base"], outline=P["outline"])
    d.rectangle([9,7,15,43], fill=(150,160,200,255), outline=P["outline"])
    for y in range(14,40,6):
        d.line([(19,y),(35,y)], fill=(120,124,150,255), width=2)
    d.line([(20,32),(24,37)], fill=(90,190,120,255), width=3)
    d.line([(24,37),(34,24)], fill=(90,190,120,255), width=3)
    save(img,"study_notes.png")

def team_banner():
    img,d=_base((255,214,106,50)); P=ramp((196,80,96))
    d.rectangle([22,4,26,46], fill=(120,88,52,255), outline=(50,32,16,255))
    d.polygon([(26,8),(44,12),(38,20),(44,28),(26,26)], fill=P["base"], outline=P["outline"])
    d.polygon([(22,8),(6,12),(12,20),(6,28),(22,26)], fill=P["shade"], outline=P["outline"])
    d.ellipse([20,2,28,10], fill=(255,214,106,255), outline=(140,96,10,255))
    save(img,"team_banner.png")

def streak_totem():
    img,d=_base((255,180,90,72)); P=ramp((186,120,196))
    d.polygon([(24,3),(34,14),(30,26),(18,26),(14,14)], fill=P["base"], outline=P["outline"])
    d.rectangle([19,26,29,42], fill=P["shade"], outline=P["outline"])
    d.rectangle([13,42,35,46], fill=P["deep"], outline=P["outline"])
    for i,r in enumerate((12,8,4)):
        d.arc([24-r,16-r,24+r,16+r], start=200+i*50, end=520+i*50,
              fill=(255,214,106,255), width=2)
    save(img,"streak_totem.png")

# ---- weapons ----
def storm_blade():
    img,d=_base((150,190,255,60)); P=ramp((176,196,226)); G=ramp((214,178,80))
    d.polygon([(24,2),(30,14),(30,32),(18,32),(18,14)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,2),(26,14),(24,32),(20,32),(22,14)], fill=P["hi"])
    d.rectangle([11,32,37,37], fill=G["base"], outline=G["outline"])
    d.rectangle([21,37,27,46], fill=(110,80,48,255), outline=P["outline"])
    d.polygon([(31,10),(37,18),(33,18),(36,26)], fill=(255,226,108,255))
    save(img,"storm_blade.png")

def thunder_pike():
    img,d=_base((255,226,140,60)); P=ramp((186,200,224)); G=ramp((214,178,80))
    d.rectangle([22,14,26,46], fill=(110,80,48,255), outline=(46,30,14,255))
    d.polygon([(24,1),(31,16),(24,22),(17,16)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,1),(26,16),(24,22),(21,16)], fill=P["hi"])
    d.rectangle([16,20,32,24], fill=G["base"], outline=G["outline"])
    d.polygon([(33,24),(40,32),(35,32),(39,42)], fill=(255,226,108,255))
    save(img,"thunder_pike.png")

def warding_stave():
    img,d=_base((150,214,255,72)); M=ramp((150,110,64))
    d.rectangle([22,12,26,46], fill=M["base"], outline=M["outline"])
    d.ellipse([12,2,36,26], outline=(198,168,90,255), width=4)
    d.ellipse([12,2,36,26], outline=(60,44,20,255), width=1)
    d.ellipse([18,8,30,20], fill=(150,214,255,255))
    d.ellipse([21,11,27,17], fill=(240,252,255,255))
    save(img,"warding_stave.png")

# ---- armour ----
def windwarden():
    img,d=_base((160,200,255,50)); P=ramp((150,176,210))
    d.polygon([(24,4),(40,12),(40,30),(24,44),(8,30),(8,12)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,4),(24,44),(8,30),(8,12)], fill=P["light"])
    d.line([(14,18),(34,18)], fill=P["deep"], width=2)
    d.line([(14,26),(34,26)], fill=P["deep"], width=2)
    d.ellipse([20,30,28,38], fill=(198,168,90,255), outline=P["outline"])
    save(img,"windwarden.png")

def stormhide():
    img,d=_base((190,160,255,50)); P=ramp((110,96,164))
    d.polygon([(24,6),(38,14),(42,44),(6,44),(10,14)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,6),(24,44),(6,44),(10,14)], fill=P["light"])
    d.polygon([(17,6),(31,6),(29,14),(19,14)], fill=P["shade"], outline=P["outline"])
    d.ellipse([20,13,28,21], fill=(255,214,106,255), outline=P["outline"])
    for x in (14,24,34):
        d.line([(x,26),(x,40)], fill=P["deep"])
    save(img,"stormhide.png")

def aegis_mantle():
    img,d=_base((150,214,255,80)); P=ramp((132,178,224))
    d.polygon([(24,4),(41,13),(41,31),(24,45),(7,31),(7,13)], fill=P["base"], outline=P["outline"])
    d.polygon([(24,10),(35,16),(35,29),(24,38),(13,29),(13,16)], fill=P["light"])
    d.polygon([(24,16),(30,19),(30,27),(24,32),(18,27),(18,19)], fill=(240,252,255,255))
    save(img,"aegis_mantle.png")

# ---- enchantments (small rune sigils) ----
def _etch(name, col, glyph):
    img,d=_base(col+(70,)); P=ramp(col)
    d.ellipse([6,6,42,42], fill=(24,18,40,255), outline=P["base"], width=3)
    glyph(d, P)
    save(img,name)

def frost_etch():
    def g(d,P):
        for a in range(0,360,60):
            import math
            rad=math.radians(a)
            x2=24+13*math.cos(rad); y2=24+13*math.sin(rad)
            d.line([(24,24),(x2,y2)], fill=P["hi"], width=2)
        d.ellipse([21,21,27,27], fill=(255,255,255,255))
    _etch("frost_etch.png",(150,214,255),g)

def greed_etch():
    def g(d,P):
        d.ellipse([15,13,33,35], fill=P["base"], outline=P["deep"])
        d.rectangle([22,11,26,37], fill=P["deep"])
        d.rectangle([17,17,31,20], fill=P["deep"])
    _etch("greed_etch.png",(240,200,90),g)

def ward_etch():
    def g(d,P):
        d.ellipse([13,13,35,35], outline=P["hi"], width=3)
        d.ellipse([19,19,29,29], outline=P["base"], width=2)
    _etch("ward_etch.png",(140,230,180),g)

def thorn_etch():
    def g(d,P):
        for a in (0,90,180,270):
            import math
            r=math.radians(a)
            x=24+11*math.cos(r); y=24+11*math.sin(r)
            xt=24+18*math.cos(r); yt=24+18*math.sin(r)
            d.line([(24,24),(x,y)], fill=P["base"], width=3)
            d.line([(x,y),(xt,yt)], fill=P["hi"], width=2)
    _etch("thorn_etch.png",(226,110,130),g)

for f in (keen_edge, riposte_ring, giant_slayer, stone_heart, aegis_charm,
          last_breath, thaw_stone, coin_purse, haggle_token, magpie_eye,
          scouts_chart, study_notes, team_banner, streak_totem,
          storm_blade, thunder_pike, warding_stave,
          windwarden, stormhide, aegis_mantle,
          frost_etch, greed_etch, ward_etch, thorn_etch):
    f()
print("Build A item art complete.")
