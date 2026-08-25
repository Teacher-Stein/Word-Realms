"""Does a half-updated upload brick the game, or degrade gracefully?

The failure this guards against, which happened to Stein on v6.1:

  He uploaded the new files, but his browser served a CACHED index.html from
  the previous version. main.js wires 55 listeners at the top level, in order.
  v6.1 added two new buttons near the START of that list; on the old markup the
  first one was missing, `$("newpin-save").addEventListener` threw, and every
  listener below it — including the teacher menu's Unlock button — was never
  attached. The menu looked completely normal and did nothing at all. No error
  on screen, no clue what was wrong, and this is a tool used in front of a
  class.

  Whole game dead, because of one missing div.

This test serves the CURRENT javascript against the PREVIOUS version's
index.html and requires that:

  1. the teacher menu still unlocks — features whose markup is missing may stop
     working, but they may not take the rest of the game with them
  2. the page says out loud that its files are mismatched, rather than failing
     silently

Run the local server from the project root first.
"""
import sys, pathlib, re, shutil
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
URL = 'http://localhost:8811/'
fails = []


def make_stale_page():
    """The old index.html, approximated by removing everything v6.1 added."""
    src = (ROOT / "index.html").read_text()
    # strip the v6.1 markup, so this is the page a cached browser would hold
    src = re.sub(r'<button id="btn-distracted".*?</button>', '', src, flags=re.S)
    src = re.sub(r'<h3 class="inv-head">Your passphrase.*?id="newpin-note"[^>]*></div>',
                 '', src, flags=re.S)
    src = src.replace('<div class="potion-row" id="hud-potions"></div>', '')
    out = ROOT / "_stale_test.html"
    out.write_text(src)
    return out


def main():
    page_file = make_stale_page()
    try:
        with sync_playwright() as pw:
            b = pw.chromium.launch(args=['--no-sandbox'])
            p = b.new_page(viewport={'width': 1400, 'height': 900})
            errs = []
            p.on('pageerror', lambda e: errs.append(str(e)))
            p.goto(URL + '_stale_test.html')
            p.wait_for_timeout(700)
            p.evaluate('localStorage.clear()')
            p.reload(); p.wait_for_timeout(800)

            # 1. the warning must be visible
            warned = p.evaluate("!!document.getElementById('stale-warning')")
            print('stale-file warning shown:', warned)
            if not warned:
                fails.append('a page with mismatched files gave the user no warning')

            # 2. the teacher menu must still work
            p.click('#btn-teacher'); p.wait_for_timeout(300)
            p.fill('#pin-input', 'storm-tiger-lantern')
            p.click('#pin-submit'); p.wait_for_timeout(400)
            unlocked = p.evaluate(
                "getComputedStyle(document.getElementById('teacher-controls'))"
                ".display !== 'none'")
            print('teacher menu still unlocks on stale markup:', unlocked)
            if not unlocked:
                fails.append('one missing element still kills the teacher menu — '
                             'the listener chain is not actually isolated')

            # 3. and the missing ids should have been named, not swallowed
            # top-level `const` is in global lexical scope, not on window
            missing = p.evaluate(
                "typeof _missingIds !== 'undefined' ? _missingIds.length : -1")
            print('listeners skipped for missing elements:', missing)
            if missing == 0:
                fails.append('nothing was recorded as missing; the fixture may '
                             'no longer strip the v6.1 markup')

            print('page errors:', errs[:3])
            if errs:
                fails.append(f'{len(errs)} page errors on the stale page')
            b.close()
    finally:
        page_file.unlink(missing_ok=True)

    print(f'\nProblems: {len(fails)}')
    for f in fails:
        print('  -', f)
    print('RESULT:', 'PASS' if not fails else 'FAIL')
    return 1 if fails else 0


sys.exit(main())
