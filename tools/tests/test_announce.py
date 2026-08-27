"""Is the combat narration actually readable from the back of a classroom?

Stein reported the old bottom-left line twice: too small, and gone before he
could read it. Moving it is only a fix if the new banner is genuinely bigger,
genuinely centred in the arena, and genuinely held long enough — so this
measures all three rather than trusting that it looks right.

It also checks the queue: a single turn can produce several messages, and the
old line simply overwrote itself so the class only ever saw the last one.
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'
MIN_FONT_PX = 22        # anything smaller is unreadable across a classroom
MIN_DWELL_MS = 2000     # a short sentence takes about this long to read aloud

fails = []
def check(cond, msg):
    if not cond: fails.append(msg)

def vis(p, s):
    try:
        e = p.query_selector(s); return bool(e and e.is_visible())
    except Exception:
        return False

def drain(p):
    for _ in range(12):
        if p.query_selector('#popup-layer.open'):
            try: p.click('#popup-continue', timeout=900); p.wait_for_timeout(260)
            except Exception: break
        else: break

with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--no-sandbox'])
    p = b.new_page(viewport={'width': 1600, 'height': 900})
    errors = []
    p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(URL); p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()'); p.reload(); p.wait_for_timeout(500)
    p.click('#btn-roster'); p.wait_for_timeout(220)
    p.fill('#roster-class','5B0'); p.fill('#roster-party','TW')
    p.fill('#roster-names','GORD\nMINH'); p.click('#roster-save'); p.wait_for_timeout(350)
    rc = p.query_selector('#roster-close')
    if rc and rc.is_visible(): rc.click(); p.wait_for_timeout(350)
    p.click('.realm-card:not(.locked)'); p.wait_for_timeout(700)
    p.click('.hero-card'); p.wait_for_timeout(250); p.click('#hero-confirm'); p.wait_for_timeout(900)

    # reach a fight
    got = False
    for _ in range(80):
        drain(p)
        # The Chorus is a room, and a walker that does not know how to leave a
        # room parks in it until its budget runs out. v6.5 broke four separate
        # suites this way - each one keeps its own hand-rolled walker, so one
        # new room type had to be taught to all of them. See the note in
        # CLAUDE.md about giving the suites a shared walker.
        if vis(p, '#cho-judge'):
            try:
                p.click('#cho-judge .pixel-btn[data-level="good"]', timeout=1000)
                p.wait_for_timeout(350)
            except Exception:
                pass
            continue
        if vis(p, '#cho-next'):
            try:
                p.click('#cho-next', timeout=1000); p.wait_for_timeout(400)
            except Exception:
                pass
            continue
        if vis(p, '#btn-move-on'):
            try: p.click('#btn-move-on', timeout=800); p.wait_for_timeout(350)
            except Exception: pass
        if p.evaluate("!!(STATE.run && STATE.run.encounter)"):
            got = True; break
        if not p.evaluate("!!(STATE.run && STATE.run.encounter)"):
            box = p.query_selector('#enc-choices')
            if box and box.is_visible() and box.query_selector('.choice'):
                try:
                    box.query_selector_all('.choice')[0].click(timeout=1200)
                    p.wait_for_timeout(900); continue
                except Exception: pass
        if vis(p, '#enc-stake-gate'):
            try: p.click('#enc-stake-gate .sg-safe', timeout=1200); p.wait_for_timeout(280); continue
            except Exception: pass
        n = p.query_selector('.map-node.reachable')
        if n:
            try: n.click(timeout=1200); p.wait_for_timeout(900); continue
            except Exception: pass
        for s in ('#rest-mend', '#shop-leave', '#event-a', '#treasure-open'):
            if vis(p, s):
                try: p.click(s, timeout=800); p.wait_for_timeout(450)
                except Exception: pass
                break
        else:
            p.wait_for_timeout(500)
    check(got, 'never reached a fight')

    if got:
        # push a message through the same path the game uses
        p.evaluate("""() => {
          const fb = document.getElementById('enc-feedback');
          fb.className = 'enc-feedback good';
          fb.textContent = 'A clean hit! +4 shards';
        }""")
        p.wait_for_timeout(400)

        geo = p.evaluate("""() => {
          const el = document.getElementById('enc-announce');
          const cor = document.getElementById('corridor');
          if (!el || !cor) return null;
          const a = el.getBoundingClientRect(), c = cor.getBoundingClientRect();
          const cs = getComputedStyle(el);
          return {
            text: el.textContent.trim(),
            shown: el.classList.contains('show'),
            opacity: parseFloat(cs.opacity),
            font: parseFloat(cs.fontSize),
            centreOffset: Math.abs((a.left + a.width/2) - (c.left + c.width/2)),
            insideCorridor: a.top >= c.top - 2 && a.bottom <= c.bottom + 2,
            corridorW: c.width,
          };
        }""")
        check(geo is not None, 'no arena banner element')
        if geo:
            check(geo['shown'] and geo['opacity'] > 0.9,
                  f"banner not visible (shown={geo['shown']} opacity={geo['opacity']})")
            check(geo['text'] == 'A clean hit! +4 shards',
                  f"banner text wrong: {geo['text']!r}")
            check(geo['font'] >= MIN_FONT_PX,
                  f"banner font only {geo['font']:.0f}px — unreadable across a room")
            check(geo['centreOffset'] < geo['corridorW'] * 0.04,
                  f"banner is {geo['centreOffset']:.0f}px off the arena centre")
            check(geo['insideCorridor'], 'banner is outside the arena')
            print(f"   font {geo['font']:.0f}px · off-centre {geo['centreOffset']:.0f}px")

        # it must still be readable well after it appeared
        p.wait_for_timeout(MIN_DWELL_MS)
        still = p.evaluate("""() => {
          const el = document.getElementById('enc-announce');
          return { shown: el.classList.contains('show'),
                   op: parseFloat(getComputedStyle(el).opacity) };
        }""")
        check(still['shown'] and still['op'] > 0.9,
              f'banner gone after {MIN_DWELL_MS}ms — too fast to read')
        print(f"   still up after {MIN_DWELL_MS}ms: {still['shown']}")

        # the queue: four messages in a burst must all be shown, not overwritten
        p.evaluate("ANNOUNCER.clear()"); p.wait_for_timeout(300)
        p.evaluate("""() => {
          const fb = document.getElementById('enc-feedback');
          ['first message','second message','third message','fourth message']
            .forEach((t, i) => setTimeout(() => { fb.textContent = t; }, i * 40));
        }""")
        p.wait_for_timeout(500)
        pending = p.evaluate("ANNOUNCER.pending()")
        check(pending >= 2,
              f'burst of 4 left only {pending} queued — messages are being lost')
        print(f"   queued after a 4-message burst: {pending}")

        # the old bottom-left line must no longer be what the room reads from
        old = p.evaluate("""() => {
          const el = document.getElementById('enc-feedback');
          const r = el.getBoundingClientRect();
          return { w: r.width, h: r.height };
        }""")
        check(old['h'] <= 2, f"the old feedback line is still rendered ({old['h']:.0f}px tall)")

    print(f'\nFailures    : {len(fails)}')
    for f in fails: print('   !!', f)
    print(f'Page errors : {len(errors)}')
    for e in errors[:4]: print('   !!', e[:150])
    b.close()
    ok = not fails and not errors
    print('\nRESULT:', 'PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)
