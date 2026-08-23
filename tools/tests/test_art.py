"""Does every sprite the game promises actually exist, and does it read?

This is the art half of test_reachable.py, and it exists for the same reason.
Realm 2 shipped as v5.9 with all seventeen of its sprite paths pointing at
Realm 1's storm cast as stand-ins. That was deliberate and it was documented -
but nothing in the suite could tell the difference between a deliberate
stand-in and a path someone forgot to swap, so the day the real art landed
there was no way to prove the swap was complete except by looking at it.

A static audit can prove it. This one fails if:

  * a sprite or backdrop path in content.js / ui.js is not on disk
  * a ready realm borrows art from another realm's folder (a leftover stand-in)
  * two realms share a sprite file that isn't meant to be shared
  * a sprite still has magenta in it - the chroma key silently missed
  * a sprite is wildly outside the size band the arena is built for
  * a realm's backdrop is BRIGHTER than the heroes who stand on it

That last one is not pedantry. Everywhere in Realm 1 the party is 59-75
luminance points brighter than the room, and that bright-on-dark relationship
is what makes four small figures readable from the back of a classroom on a
TV. Realm 2's sunlit forest came out of Gemini at luminance 117 against a hero
at 85, which inverts it. Nothing would have caught that by eye on a laptop.
"""
import re, sys, pathlib

try:
    import numpy as np
    from PIL import Image
except ImportError:
    print("SKIP: needs numpy + Pillow")
    sys.exit(0)

ROOT = pathlib.Path(__file__).resolve().parents[2]
JS = {p.name: p.read_text() for p in (ROOT / "js").glob("*.js")}
CONTENT, UI = JS["content.js"], JS["ui.js"]

fails, notes = [], []

# --- which realms claim to be ready ------------------------------------------
READY = set()
for m in re.finditer(r"\n  (\d+):\s*\{(.*?)\n  \},", CONTENT, re.S):
    rid, body = int(m.group(1)), m.group(2)
    if re.search(r"ready:\s*true", body):
        READY.add(rid)
if not READY:
    fails.append("could not parse any ready realm out of content.js")

# --- every sprite path referenced anywhere ------------------------------------
paths = sorted(set(re.findall(r'sprite:"([^"]+)"', CONTENT)))
for p in paths:
    if not (ROOT / p).exists():
        fails.append(f"sprite path {p} is referenced but not on disk")

# --- no ready realm may borrow another realm's art ----------------------------
# Realm 1's cast sits in assets/sprites/, every realm after it in
# assets/sprites/realmN/. A ready realm reaching outside its own folder is a
# stand-in that was never swapped.
for m in re.finditer(r"\n  (\d+):\s*\{(.*?)\n  \},", CONTENT, re.S):
    rid, body = int(m.group(1)), m.group(2)
    if rid not in READY:
        continue
    want = "assets/sprites/" if rid == 1 else f"assets/sprites/realm{rid}/"
    for sp in re.findall(r'sprite:"([^"]+)"', body):
        if not sp.startswith(want) or (rid == 1 and sp.count("/") > 2):
            fails.append(f"realm {rid} is ready but points at {sp} — "
                         f"expected something under {want}")

# realm blocks only carry the boss and the npc; the monster and elite banks are
# module-level consts, so check those by name too
for rid, const in ((1, "REALM1"), (2, "REALM2")):
    if rid not in READY:
        continue
    want = "assets/sprites/" if rid == 1 else f"assets/sprites/realm{rid}/"
    for block in (f"{const}_MONSTERS", f"{const}_ELITES"):
        m = re.search(r"const %s = \[(.*?)\n\];" % block, CONTENT, re.S)
        if not m:
            fails.append(f"could not find {block} in content.js")
            continue
        found = re.findall(r'sprite:"([^"]+)"', m.group(1))
        if not found:
            fails.append(f"{block} declares no sprites at all")
        for sp in found:
            if not sp.startswith(want) or (rid == 1 and sp.count("/") > 2):
                fails.append(f"{block} points at {sp} — expected {want}")

# --- no two realms may share a sprite file ------------------------------------
owner = {}
for m in re.finditer(r"const REALM(\d)_(?:MONSTERS|ELITES) = \[(.*?)\n\];",
                     CONTENT, re.S):
    rid = int(m.group(1))
    for sp in re.findall(r'sprite:"([^"]+)"', m.group(2)):
        if sp in owner and owner[sp] != rid:
            fails.append(f"realms {owner[sp]} and {rid} both use {sp}")
        owner[sp] = rid

# --- the art itself -----------------------------------------------------------
# The arena is built for sprites roughly hero-height to boss-height. Something
# far outside that band is a pipeline mistake, not a style choice: the flat
# side-on Glass Lizard arrived 217x84 and read as scenery next to the party.
MIN_H, MAX_H, MAX_W = 70, 156, 215

for p in paths:
    f = ROOT / p
    if not f.exists():
        continue
    a = np.array(Image.open(f).convert("RGBA"))
    op = a[..., 3] > 0
    if not op.any():
        fails.append(f"{p} is entirely transparent")
        continue
    h, w = a.shape[:2]
    if not (MIN_H <= h <= MAX_H):
        fails.append(f"{p} is {w}x{h} — height outside the arena band "
                     f"{MIN_H}-{MAX_H}")
    if w > MAX_W:
        fails.append(f"{p} is {w}x{h} — wider than the arena allows ({MAX_W})")

    # surviving chroma key: strong magenta inside the silhouette
    r, g, b = (a[..., i].astype(int) for i in range(3))
    mag = op & (r > 180) & (b > 180) & (g < 90)
    if mag.sum() > 8:
        fails.append(f"{p} still has {int(mag.sum())} magenta pixels — the "
                     f"chroma key missed")

# --- backdrops ----------------------------------------------------------------
bd = re.search(r"const BACKDROPS = \{(.*?)\n\};", UI, re.S)
if not bd:
    fails.append("could not find the BACKDROPS table in ui.js")
else:
    table = {}
    for m in re.finditer(r"(\d+):\s*\[(.*?)\]", bd.group(1), re.S):
        table[int(m.group(1))] = re.findall(r'"([^"]+)"', m.group(2))
    for rid in sorted(READY):
        if rid not in table:
            fails.append(f"realm {rid} is ready but has no backdrops")
    for rid, files in table.items():
        if len(files) != 3:
            fails.append(f"realm {rid} has {len(files)} backdrops, expected 3")
        for p in files:
            if not (ROOT / p).exists():
                fails.append(f"backdrop {p} is referenced but not on disk")

    # the party must be brighter than the ground it stands on
    hero_px = np.concatenate([
        (lambda a: a[a[..., 3] > 0][:, :3])(np.array(Image.open(f).convert("RGBA")))
        for f in sorted((ROOT / "assets/heroes").glob("*.png"))]).astype(float)
    hlum = (0.299 * hero_px[:, 0] + 0.587 * hero_px[:, 1]
            + 0.114 * hero_px[:, 2]).mean()
    for rid, files in sorted(table.items()):
        for p in files:
            f = ROOT / p
            if not f.exists():
                continue
            a = np.array(Image.open(f).convert("RGB")).astype(float)
            g = a[int(a.shape[0] * 0.55):int(a.shape[0] * 0.95)].reshape(-1, 3)
            blum = (0.299 * g[:, 0] + 0.587 * g[:, 1] + 0.114 * g[:, 2]).mean()
            if blum >= hlum:
                fails.append(f"{p} ground luminance {blum:.0f} is brighter than "
                             f"the heroes at {hlum:.0f} — the party reads as a "
                             f"dark blob on a bright ground")
            elif hlum - blum < 20:
                fails.append(f"{p} ground luminance {blum:.0f} leaves only "
                             f"{hlum - blum:.0f} points under the heroes; "
                             f"Realm 1's worst band leaves 59")
            else:
                notes.append(f"  {p}  ground {blum:5.1f}  hero +{hlum - blum:4.1f}")

print(f"realms ready: {sorted(READY)}")
print(f"sprite paths checked: {len(paths)}")
for n in notes:
    print(n)
print(f"\nProblems: {len(fails)}")
for f in fails:
    print("  -", f)
print("RESULT:", "PASS" if not fails else "FAIL")
sys.exit(1 if fails else 0)
