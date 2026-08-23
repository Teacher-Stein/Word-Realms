"""Can every advertised item actually be obtained?

v5.5 removed six relics whose ids appeared in items.js and NOWHERE else - the
game handed children cards with written promises and then did nothing. v5.7
found the same disease in two more systems: all four enchantments were
unreachable because applyEnchant() was never called from anywhere, and gear was
offered 0.58 times per run and never stocked in a shop.

This test exists so that class of bug cannot come back. It is a STATIC audit -
no browser needed - and it fails the moment someone adds an item the game has
no way to grant or no code path that reads.
"""
import re, sys, pathlib

ROOT = pathlib.Path(__file__).resolve().parents[2]
JS = {p.name: p.read_text() for p in (ROOT / "js").glob("*.js")}
ALL = "\n".join(JS.values())
ITEMS = JS["items.js"]

fails = []

def ids_in(block_name):
    m = re.search(r"const %s = \[(.*?)\n\];" % block_name, ITEMS, re.S)
    if not m:
        fails.append(f"could not find {block_name} in items.js")
        return []
    return re.findall(r'id:"([^"]+)"', m.group(1))

# Everything outside items.js — this is where an effect has to be READ.
OTHER = "\n".join(v for k, v in JS.items() if k != "items.js")

for block, label in (("RELICS", "relic"), ("ENCHANTMENTS", "enchantment"),
                     ("WEAPONS", "weapon"), ("ARMOURS", "armour"),
                     ("POTIONS", "potion")):
    for iid in ids_in(block):
        if iid not in OTHER:
            fails.append(f'{label} "{iid}" is defined but no code outside '
                         f'items.js ever reads it — it does nothing')

# Each category must have at least one way into the party's hands.
GRANTS = {
    "relics":  ["addRelic("],
    "gear":    ["equipGear("],
    "enchants": ["applyEnchant("],
    "potions": ["addPotion("],
}
for what, needles in GRANTS.items():
    hits = [n for n in needles if OTHER.count(n) > 0]
    if not hits:
        fails.append(f"nothing in the game ever grants {what}")
    else:
        # a grant that only appears in its own definition is not a grant
        for n in needles:
            call_sites = OTHER.count(n)
            if call_sites < 2:
                fails.append(f'"{n}" appears only {call_sites}x outside '
                             f'items.js — likely defined but never called')

# The shop must stock every purchasable category.
state = JS["state.js"]
m = re.search(r"const stock = \{(.*?)\n  \};", state, re.S)
if not m:
    fails.append("could not find the shop stock object in state.js")
else:
    for row in ("relics", "gear", "potions"):
        if row + ":" not in m.group(1):
            fails.append(f'the shop does not stock "{row}"')

print(f"relics       : {len(ids_in('RELICS'))}")
print(f"enchantments : {len(ids_in('ENCHANTMENTS'))}")
print(f"gear         : {len(ids_in('WEAPONS')) + len(ids_in('ARMOURS'))}")
print(f"potions      : {len(ids_in('POTIONS'))}")
print(f"\nFailures     : {len(fails)}")
for f in fails: print("   !!", f)
print("\nRESULT:", "PASS" if not fails else "FAIL")
sys.exit(0 if not fails else 1)
