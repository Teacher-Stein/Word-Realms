"""Drive Realm 2 in a real browser and photograph the arena.

test_art.py proves the files exist and are the right shape. It cannot prove the
browser actually renders them at the right size, because sprite sizing happens
at runtime in sizeSprite() off naturalWidth. The Hurricane Titan shipped 58%
too wide for exactly that reason and only a screenshot found it.

This walks into Realm 2, fights through several rooms, and saves a shot of each
distinct monster it meets along with the rendered-vs-natural aspect ratio.
"""
import sys, pathlib
from playwright.sync_api import sync_playwright
from walk import answer_any, clear_rooms

URL = 'http://localhost:8811/index.html'
OUT = pathlib.Path('/home/claude/realm2/shots'); OUT.mkdir(parents=True, exist_ok=True)


def visible(page, sel):
    try:
        el = page.query_selector(sel)
        return bool(el and el.is_visible())
    except Exception:
        return False


def drain(page):
    for _ in range(10):
        if page.query_selector('#popup-layer.open'):
            try:
                page.click('#popup-continue', timeout=900); page.wait_for_timeout(250)
                continue
            except Exception:
                break
        break


def main():
    fails, seen = [], {}
    with sync_playwright() as pw:
        b = pw.chromium.launch()
        page = b.new_page(viewport={'width': 1920, 'height': 1080})
        page.goto(URL); page.wait_for_timeout(400)
        page.evaluate('localStorage.clear()'); page.reload(); page.wait_for_timeout(500)
        page.click('#btn-roster'); page.wait_for_timeout(250)
        page.fill('#roster-class', '5B0')
        page.fill('#roster-party', 'The Wildlands Test')
        page.fill('#roster-names', 'GORD\nMINH\nLAN\nKHANH')
        page.click('#roster-save'); page.wait_for_timeout(400)
        if visible(page, '#roster-close'):
            page.click('#roster-close'); page.wait_for_timeout(400)

        # Realm 2 is locked until a class clears Realm 1, so unlock it the way
        # the teacher menu does before walking in.
        page.evaluate("""() => {
          if (typeof teacherUnlock === 'function') teacherUnlock(2, true);
          else if (STATE && STATE.unlockedRealms && !STATE.unlockedRealms.includes(2))
            STATE.unlockedRealms.push(2);
          if (typeof renderMenu === 'function') renderMenu();
        }""")
        page.wait_for_timeout(400)
        page.evaluate('window.enterRealm && window.enterRealm(2)')
        page.wait_for_timeout(900)
        page.wait_for_selector('.hero-card', timeout=8000)
        page.click('.hero-card'); page.wait_for_timeout(300)
        page.click('#hero-confirm'); page.wait_for_timeout(1000)
        drain(page)

        rid = page.evaluate('STATE.run && STATE.run.realmId')
        if rid != 2:
            print(f'FAIL: expected to be in realm 2, am in {rid}')
            b.close(); return 1

        # A run that wipes leaves the harness idling on the menu, which is how
        # an earlier version of this file walked one room and reported PASS.
        # Notice it and go back in.
        def restart_if_dead():
            if page.evaluate("!!(STATE.run && STATE.run.realmId === 2)"):
                return False
            drain(page)
            page.evaluate("""() => {
              if (typeof teacherUnlock === 'function') teacherUnlock(2, true);
              if (typeof renderMenu === 'function') renderMenu();
              if (window.enterRealm) window.enterRealm(2);
            }""")
            page.wait_for_timeout(800)
            if visible(page, '.hero-card'):
                page.click('.hero-card'); page.wait_for_timeout(300)
                if visible(page, '#hero-confirm'):
                    page.click('#hero-confirm'); page.wait_for_timeout(900)
            drain(page)
            return True

        # 900 rather than 700 since v6.5. The Chorus adds a room type that
        # costs several steps to walk through, and this run came in at exactly
        # the four-sprite floor - a pass, but one bad map away from a failure
        # that would have had nothing to do with the art.
        for step in range(900):
            drain(page)
            if step % 12 == 0:
                restart_if_dead()
            if clear_rooms(page):
                continue
            if visible(page, '#btn-move-on'):
                try:
                    page.click('#btn-move-on', timeout=800); page.wait_for_timeout(350)
                except Exception:
                    pass
                continue

            info = page.evaluate("""() => {
              const el = document.querySelector('#monster-sprite');
              if (!el || !el.offsetParent || !el.naturalWidth) return null;
              const r = el.getBoundingClientRect();
              const c = document.querySelector('#corridor');
              return { src: el.getAttribute('src'),
                       nat: el.naturalWidth / el.naturalHeight,
                       ren: r.width / r.height, w: r.width, h: r.height,
                       bd: c ? getComputedStyle(c).backgroundImage : '' };
            }""")
            if info and info['src'] not in seen:
                seen[info['src']] = info
                name = info['src'].rsplit('/', 1)[-1].replace('.png', '')
                page.screenshot(path=str(OUT / f'{name}.png'))
                skew = abs(info['ren'] - info['nat']) / info['nat']
                if skew > 0.02:
                    fails.append(f"{name} renders at aspect {info['ren']:.2f} but "
                                 f"its art is {info['nat']:.2f} — stretched "
                                 f"{skew*100:.0f}%")
                if 'realm2' not in info['src']:
                    fails.append(f"realm 2 arena is showing {info['src']}")
                if 'realm2_band' not in info['bd']:
                    fails.append(f"realm 2 backdrop is {info['bd'][:70]}")
                print(f"  {name:18s} {info['w']:5.0f}x{info['h']:<5.0f} "
                      f"aspect {info['ren']:.2f} vs {info['nat']:.2f}")

            # SAFE past the stake gate, then answer. The option classes here
            # are `.choice`, matching the other suites - an earlier draft of
            # this file guessed `.choice-btn`, answered nothing, and walked
            # zero rooms while cheerfully reporting no problems.
            if visible(page, '#enc-stake-gate'):
                try:
                    page.click('#enc-stake-gate .sg-safe', timeout=1500)
                    page.wait_for_timeout(260)
                except Exception:
                    pass

            # answer_any() rather than a hand-rolled `.choice` click. The
            # inline version could only answer three-option questions, so when
            # v6.5's spot-the-error and put-it-in-order arrived this walk parked
            # on the first one it met and photographed a single sprite out of
            # eight - for the whole 900-step budget. See walk.py.
            clicked = answer_any(page, 'enc') or answer_any(page, 'boss')
            page.wait_for_timeout(300 if clicked else 120)

            if not clicked:
                n = page.query_selector('.map-node.reachable')
                if n:
                    try:
                        n.click(timeout=1200); page.wait_for_timeout(800); continue
                    except Exception:
                        pass
                for s in ('#rest-mend', '#shop-leave', '#event-a', '#treasure-open'):
                    if visible(page, s):
                        try:
                            page.click(s, timeout=800); page.wait_for_timeout(450)
                        except Exception:
                            pass
                        break
                else:
                    page.wait_for_timeout(400)
            if len(seen) >= 8:
                break

        b.close()

    # One sprite is not a sample. If the walk only ever met one monster then
    # the harness stalled and its silence means nothing - say so rather than
    # printing PASS.
    MIN_SEEN = 4
    if len(seen) < MIN_SEEN:
        fails.append(f'only {len(seen)} distinct sprite(s) reached; the walk '
                     f'needs at least {MIN_SEEN} to be worth anything')

    print(f'\ndistinct sprites photographed: {len(seen)}')
    print(f'Problems: {len(fails)}')
    for f in fails:
        print('  -', f)
    print('RESULT:', 'PASS' if not fails else 'FAIL')
    return 1 if fails else 0


sys.exit(main())
