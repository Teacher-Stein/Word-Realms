"""Can a creature's neighbour leak into its sprite?

v6.0 shipped five contaminated sprites. The Bramble Cat had the Mimic Jay's
beak floating beside its ear; the Jay carried 162 pixels of the Cat's brambles.
The cause was that each creature was cut out of the sheet by its BOUNDING BOX,
and a bounding box is a rectangle while a creature is not — so anything of the
neighbour's that fell inside the rectangle came along.

Auditing the finished PNGs cannot catch this. Several creatures have detached
pieces on purpose: the Hollow Fox sheds leaves, the Ashwing trails ash, the
Sand Burrower throws up grit. "Sprite contains a floating island" is not a bug,
and colour tells you nothing either — everything is quantised to one shared
104-colour palette, so a grey beak inside a green cat measured 8.1 units away
against a legitimate leaf at 3.6.

So this presses the splitter itself with a synthetic sheet containing exactly
the trap that broke: two creatures, where creature A has a spur that sits well
inside creature B's bounding box, and a deliberately detached fleck of its own.
"""
import sys, pathlib, importlib.util

try:
    import numpy as np
    from PIL import Image
except ImportError:
    print("SKIP: needs numpy + Pillow")
    sys.exit(0)

ROOT = pathlib.Path(__file__).resolve().parents[2]
MAGENTA, RED, GREEN = (255, 0, 255), (200, 40, 40), (40, 180, 60)

fails = []


def build_sheet(path):
    """A: tall red block on the left, plus a spur and a fleck.
       B: green block on the right with an arm reaching back under A's spur.

    B's bounding box therefore spans x 190..520 — which contains A's spur at
    x 200..232. That is the trap, and it is the exact shape of the real one."""
    a = np.full((400, 600, 3), MAGENTA, dtype=np.uint8)
    a[80:320,  40:150] = RED      # A's body      (26,400 px)
    a[90:104, 200:232] = RED      # A's spur      (448 px — under B's box)
    a[200:208, 160:170] = RED     # A's fleck     (80 px — detached on purpose)
    a[60:340, 300:520] = GREEN    # B's body
    a[300:320, 190:300] = GREEN   # B's arm, reaching back under the spur
    Image.fromarray(a, "RGB").save(path)
    return a


def main():
    tmp = ROOT / "tools" / "tests" / "_split_fixture"
    tmp.mkdir(exist_ok=True)
    sheet = tmp / "fixture.png"
    raw = build_sheet(sheet)

    spec = importlib.util.spec_from_file_location(
        "r2", ROOT / "tools" / "pipeline" / "realm2_art.py")
    r2 = importlib.util.module_from_spec(spec)
    try:
        spec.loader.exec_module(r2)
    except Exception as e:                      # noqa: BLE001
        print(f"could not load realm2_art.py: {e}")
        return 1
    r2.SRC = tmp

    # --- the trap is real: B's bounding box does contain A's red -------------
    green = np.all(raw == GREEN, axis=-1)
    ys, xs = np.where(green)
    box = raw[ys.min():ys.max() + 1, xs.min():xs.max() + 1]
    if not np.any(np.all(box == RED, axis=-1)):
        fails.append("the fixture is wrong — B's bounding box has no red in it, "
                     "so this test would pass even with the old bounding-box crop")

    objs = r2.sheet_objects("fixture")
    if len(objs) != 2:
        fails.append(f"expected 2 objects from the fixture, got {len(objs)}")
        print(f"Problems: {len(fails)}")
        for f in fails:
            print("  -", f)
        print("RESULT: FAIL")
        return 1

    def counts(o):
        op = o[..., 3] > 0
        px = o[..., :3][op].astype(int)
        red = int(((px[:, 0] > 150) & (px[:, 1] < 100)).sum())
        grn = int(((px[:, 1] > 130) & (px[:, 0] < 120)).sum())
        return red, grn

    (a_red, a_green), (b_red, b_green) = counts(objs[0]), counts(objs[1])

    # --- B must carry none of A ---------------------------------------------
    if b_red > 0:
        fails.append(f"creature B carries {b_red} pixels of creature A — a "
                     f"neighbour leaked in through the bounding box")
    if a_green > 0:
        fails.append(f"creature A carries {a_green} pixels of creature B")

    # --- A must KEEP its own detached pieces --------------------------------
    # body ~26,400 + spur ~448 + fleck ~80, minus the 1px erosion the chroma
    # key applies. If the splitter deleted islands instead of assigning them,
    # A comes back with the body alone.
    if a_red < 25000:
        fails.append(f"creature A only kept {a_red} pixels — its body alone is "
                     f"~25k, so its spur and fleck were thrown away")
    from scipy import ndimage
    islands = ndimage.label(objs[0][..., 3] > 0, np.ones((3, 3), bool))[1]
    if islands < 3:
        fails.append(f"creature A came back as {islands} island(s); it should "
                     f"have 3 — body, spur and fleck. Detached pieces that "
                     f"belong to a creature must survive the split")

    print(f"objects found      : {len(objs)}")
    print(f"creature A         : {a_red} own px, {a_green} foreign px, "
          f"{islands} islands")
    print(f"creature B         : {b_green} own px, {b_red} foreign px")
    print(f"\nProblems: {len(fails)}")
    for f in fails:
        print("  -", f)
    print("RESULT:", "PASS" if not fails else "FAIL")
    return 1 if fails else 0


code = main()
import shutil
shutil.rmtree(ROOT / "tools" / "tests" / "_split_fixture", ignore_errors=True)
sys.exit(code)
