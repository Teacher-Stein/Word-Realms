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

# Coach lessons. Same disease, different system: a lesson written into
# COACH_LESSONS with no coach("id") call anywhere is a card the class will never
# see, and a coach("id") call for a lesson that does not exist is a mechanic the
# game silently declines to explain. Both look completely fine from the outside.
#
# This is how Brace went two versions with no card at all - the intent lesson
# mentions the word once and nothing else does, so nothing was missing in a way
# any test could notice.
coach_js = JS.get("coach.js", "")
m = re.search(r"const COACH_LESSONS = \{(.*?)\n\};", coach_js, re.S)
if not m:
    fails.append("could not find COACH_LESSONS in coach.js")
    lessons = set()
else:
    lessons = set(re.findall(r"^  (\w+): \{", m.group(1), re.M))
called = set(re.findall(r'coach\("([^"]+)"\)', OTHER))
for lid in sorted(lessons - called):
    fails.append(f'coach lesson "{lid}" is written but nothing ever shows it '
                 f'— the class will never read that card')
for lid in sorted(called - lessons):
    fails.append(f'the game calls coach("{lid}") but no such lesson exists '
                 f'— that mechanic is never explained')

# Every real decision the game asks a class to make needs a card. These are the
# mechanics a student clicks a button for, and a button nobody has explained is
# a button nobody presses: four classes went a whole lesson without opening the
# pack once.
for must in ("brace", "potions", "stakes", "intent"):
    if must not in lessons:
        fails.append(f'there is no coach lesson for "{must}", which is a '
                     f'button students are expected to press')

# Every curriculum key must have a human label.
#
# The teaching report is the one screen a teacher reads to decide what to
# reteach, and a row saying "g2-form  40%" is useless to anyone who was not
# holding the question bank when it was written. An unlabelled key does not
# crash anything - coverLabel() falls back to the de-slugged key - it just
# quietly makes one row of the report worse than the others, which is exactly
# the kind of fault nobody reports and nobody fixes.
content = JS.get("content.js", "")
q_keys = set(re.findall(r'cover:"([^"]+)"', content))
m = re.search(r"const COVER_LABELS = \{(.*?)\n\};", content, re.S)
if not m:
    fails.append("could not find COVER_LABELS in content.js")
    labelled = set()
else:
    labelled = set(re.findall(r'^  "([^"]+)":', m.group(1), re.M))
for k in sorted(q_keys - labelled):
    fails.append(f'curriculum key "{k}" has questions but no entry in '
                 f'COVER_LABELS — it would appear in the teaching report as a '
                 f'raw slug')
for k in sorted(labelled - q_keys):
    fails.append(f'COVER_LABELS has an entry for "{k}" but no question tests '
                 f'it — either the key was renamed or the label is a typo')

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
print(f"coach cards  : {len(lessons)}")
print(f"curriculum   : {len(q_keys)} keys, {len(labelled)} labelled")
print(f"\nFailures     : {len(fails)}")
for f in fails: print("   !!", f)
print("\nRESULT:", "PASS" if not fails else "FAIL")
sys.exit(0 if not fails else 1)
