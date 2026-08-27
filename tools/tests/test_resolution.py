"""Does the game stay usable on a small classroom projector?

Stein teaches on 1366x768 screens and was zooming the browser in and out every
lesson to see the fight. Nothing overflowed and nothing was clipped, so no
existing test noticed: the game "fitted" perfectly. What it did instead was
shrink the entire cast to a third of its size inside a large empty arena.

Two separate faults, both invisible without measuring:

  1. fitStage() tested `st.offsetTop >= 6` to decide whether the foe fitted.
     But .combatant is `position:absolute; bottom:15%`, so offsetTop is
     whatever the browser has left over after placing it from the BOTTOM. On a
     short screen that number never rose above 6 however small the sprite got,
     so the loop stepped the scale all the way down to its floor of 1.

  2. updateStageScale() reserved a fixed 104px for the monster's info block.
     That was right when the block hung BELOW the sprite; since v6.1 it sits
     above and costs about 88. Sixteen wasted pixels sounds harmless, but the
     scale is quantised to half-steps, and it was exactly enough to drop the
     cast from scale 2 to 1.5.

So this measures the thing that actually matters - how big is the cast, really -
at both the projector resolution and a full HD screen.

Run the local server from the project root first.
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'

# 1366x768 is the classroom projector; 1920x1080 is the office desktop.
#
# The numbers are RENDERED PIXEL HEIGHTS, not scale factors. Since v6.3 each
# foe is scaled to fill the arena, so the scale value legitimately differs from
# monster to monster - a short creature gets a bigger multiplier than a tall
# one, and they arrive at a similar size on screen. Asserting on the scale
# would fail on a perfectly good frame. What actually matters, and what a
# teacher at the back of a classroom can see, is how many pixels tall the cast
# ends up.
#
#   (width, height, min monster px, min hero px)
SIZES = [(1366, 768, 150, 150), (1920, 1080, 260, 260)]

fails = []


def vis(p, s):
    try:
        e = p.query_selector(s)
        return bool(e and e.is_visible())
    except Exception:
        return False


def drain(p):
    for _ in range(8):
        if p.query_selector('#popup-layer.open'):
            try:
                p.click('#popup-continue', timeout=800); p.wait_for_timeout(220)
                continue
            except Exception:
                break
        break


def walk_to_fight(p, budget=220):
    for _ in range(budget):
        drain(p)
        if vis(p, '#btn-move-on'):
            try:
                p.click('#btn-move-on', timeout=800); p.wait_for_timeout(320)
            except Exception:
                pass
        if vis(p, '#enc-stake-gate'):
            try:
                p.click('#enc-stake-gate .sg-safe', timeout=1200)
                p.wait_for_timeout(260)
            except Exception:
                pass
        if p.evaluate("!!(STATE.run&&STATE.run.encounter)") and vis(p, '#enc-choices'):
            return True
        # STEER toward a fight rather than wandering. A random walk reached one
        # only about half the time, which made this suite fail for reasons that
        # had nothing to do with what it measures - and a test that cries wolf
        # is worse than no test at all.
        clicked = p.evaluate("""() => {
          const ns = [...document.querySelectorAll('.map-node.reachable')];
          if (!ns.length) return false;
          const fight = ns.find(n => /fight|elite/i.test(n.textContent || ''));
          (fight || ns[0]).click();
          return true;
        }""")
        if clicked:
            p.wait_for_timeout(700)
            continue
        for s in ('#rest-mend', '#shop-leave', '#event-a', '#treasure-open'):
            if vis(p, s):
                try:
                    p.click(s, timeout=800); p.wait_for_timeout(400)
                except Exception:
                    pass
                break
        else:
            p.wait_for_timeout(350)
    return False


with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--no-sandbox'])
    for W, H, min_foe, min_hero in SIZES:
        p = b.new_page(viewport={'width': W, 'height': H})
        errs = []
        p.on('pageerror', lambda e: errs.append(str(e)))
        p.goto(URL); p.wait_for_timeout(500)
        p.evaluate('localStorage.clear()'); p.reload(); p.wait_for_timeout(700)
        p.click('#btn-roster'); p.wait_for_timeout(250)
        p.fill('#roster-class', '5T'); p.fill('#roster-party', 'Res')
        p.fill('#roster-names', 'STEIN\nMINH\nLAN')
        p.click('#roster-save'); p.wait_for_timeout(400)
        rc = p.query_selector('#roster-close')
        if rc and rc.is_visible():
            rc.click(); p.wait_for_timeout(400)
        p.click('.realm-card:not(.locked)'); p.wait_for_timeout(700)
        p.click('.hero-card'); p.wait_for_timeout(300)
        p.click('#hero-confirm'); p.wait_for_timeout(900)
        drain(p)

        # Retried, because a run can legitimately end without a fight being
        # reachable - the party can be wiped at a stake gate, or the walk can
        # arrive at the boss down a lane of campfires and shops. Neither has
        # anything to do with sprite sizes, and a suite that reports one as a
        # failure is the kind of harness that costs an evening chasing a
        # regression that was never there. The measurement itself is NOT
        # retried: whatever the first real fight shows is the verdict.
        got = walk_to_fight(p)
        for attempt in range(2):
            if got:
                break
            where = p.evaluate("""() => {
              const s = document.querySelector('.screen.active');
              return s ? s.id : 'none';
            }""")
            print(f'    attempt {attempt + 1} reached no fight (stalled on '
                  f'{where}) — starting the run again')
            p.evaluate('localStorage.clear()')
            p.reload(); p.wait_for_timeout(700)
            p.click('#btn-roster'); p.wait_for_timeout(250)
            p.fill('#roster-class', '5T'); p.fill('#roster-party', 'Res')
            p.fill('#roster-names', 'STEIN\nMINH\nLAN')
            p.click('#roster-save'); p.wait_for_timeout(400)
            rc2 = p.query_selector('#roster-close')
            if rc2 and rc2.is_visible():
                rc2.click(); p.wait_for_timeout(400)
            p.click('.realm-card:not(.locked)'); p.wait_for_timeout(700)
            p.click('.hero-card'); p.wait_for_timeout(300)
            p.click('#hero-confirm'); p.wait_for_timeout(900)
            drain(p)
            got = walk_to_fight(p)
        if not got:
            fails.append(f'{W}x{H}: three runs ended without reaching a fight, '
                         f'so nothing was measured')
            p.close()
            continue

        r = p.evaluate("""() => {
          const de = document.documentElement;
          const c = document.getElementById('corridor');
          const st = document.getElementById('monster-stage');
          const m = document.getElementById('monster-sprite');
          const h = document.getElementById('hero-sprite');
          const cb = c.getBoundingClientRect(), sb = st.getBoundingClientRect();
          return {
            scale: typeof STAGE_SCALE !== 'undefined' ? STAGE_SCALE : 0,
            heroH: Math.round(h.getBoundingClientRect().height),
            monsterH: Math.round(m.getBoundingClientRect().height),
            scrollY: de.scrollHeight - de.clientHeight,
            scrollX: de.scrollWidth - de.clientWidth,
            stageAbove: Math.round(cb.top - sb.top),
            stageBelow: Math.round(sb.bottom - cb.bottom),
            arenaH: Math.round(cb.height),
          };
        }""")

        print(f"--- {W}x{H}")
        print(f"    sprite scale {r['scale']}  (informational — varies by monster)")
        print(f"    hero {r['heroH']}px · monster {r['monsterH']}px "
              f"in a {r['arenaH']}px arena")
        print(f"    page scroll x={r['scrollX']} y={r['scrollY']}")

        if r['monsterH'] < min_foe:
            fails.append(f"{W}x{H}: the monster renders {r['monsterH']}px tall, "
                         f"under the {min_foe}px a class can read across a room")
        if r['scrollX'] > 0 or r['scrollY'] > 0:
            fails.append(f"{W}x{H}: the page scrolls "
                         f"({r['scrollX']}x{r['scrollY']}px) — it must fit")
        if r['stageAbove'] > 2:
            fails.append(f"{W}x{H}: the foe is cut off the top of the arena by "
                         f"{r['stageAbove']}px")
        if r['stageBelow'] > 2:
            fails.append(f"{W}x{H}: the foe hangs {r['stageBelow']}px below the "
                         f"arena")
        # The hero has its own scale so the party does not grow and shrink as
        # different monsters walk in; this checks that scale is doing its job.
        if r['heroH'] < min_hero:
            fails.append(f"{W}x{H}: the hero renders {r['heroH']}px tall, under "
                         f"the {min_hero}px a class can read across a room")
        if errs:
            fails.append(f'{W}x{H}: {len(errs)} page errors')
        p.close()
    b.close()

print(f"\nProblems: {len(fails)}")
for f in fails:
    print('  -', f)
print('RESULT:', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
