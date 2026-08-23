"""Do the events keep their promises?

The events they replace were a hidden 62/38 coin flip worth 4 shards. The whole
point of the rewrite is that a child can weigh a trade before taking it, so the
things this test enforces are exactly the things that made the old ones bad:

  1. EVERY option states both sides — a label AND a consequence line. An option
     with no stated cost is a gamble again.
  2. No event reduces the number of questions asked. Several ADD questions;
     none may take one away.
  3. Every event is reachable and survives being played, including the ones
     that only appear under a condition (Echoing Hall needs a missed question,
     Frozen Cache needs shards).
  4. A quiz event actually asks the questions it advertises.
"""
import re, sys, pathlib
from playwright.sync_api import sync_playwright

ROOT = pathlib.Path(__file__).resolve().parents[2]
URL = 'http://localhost:8811/index.html'

fails = []
def check(cond, msg):
    if not cond: fails.append(msg)

# ---- static: nothing in events.js may shorten a fight ----------------------
src = (ROOT / "js" / "events.js").read_text()
for bad, why in [
    (r"\.hp\s*=", "an event assigns monster HP"),
    (r"\.maxHp\s*=", "an event assigns monster maxHp"),
    (r"MONSTER_HP", "an event touches MONSTER_HP"),
    (r"ELITE_HP", "an event touches ELITE_HP"),
    (r"currentNodeId\s*=", "an event moves the party, which could skip a room"),
]:
    if re.search(bad, src):
        fails.append(f"{why} — no event may reduce the questions asked")

def vis(p, s):
    try:
        e = p.query_selector(s); return bool(e and e.is_visible())
    except Exception:
        return False

def drain(p):
    for _ in range(14):
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
    p.fill('#roster-names','GORD\nMINH\nLAN'); p.click('#roster-save'); p.wait_for_timeout(350)
    rc = p.query_selector('#roster-close')
    if rc and rc.is_visible(): rc.click(); p.wait_for_timeout(350)
    p.click('.realm-card:not(.locked)'); p.wait_for_timeout(700)
    p.click('.hero-card'); p.wait_for_timeout(250); p.click('#hero-confirm'); p.wait_for_timeout(900)
    drain(p)

    ids = p.evaluate("EVENTS.map(e => e.id)")
    print(f"events defined : {len(ids)}")

    for eid in ids:
        # Give the party whatever this event needs to be offered, then force it.
        shown = p.evaluate("""(eid) => {
          const run = STATE.run;
          run.shards = 200;
          run.shields = 5;
          run.missedQs = ['weather_extreme'];
          run.eventsSeen = [];
          run.idolTaken = false;
          run.longRoadTaken = false;
          if (!run.relics.length) {
            const r = availableRelic(); if (r) addRelic(r);
          }
          const ev = EVENTS.find(e => e.id === eid);
          if (!ev) return { err: 'missing' };
          if (typeof ev.available === 'function' && !ev.available()) {
            return { err: 'unavailable even when set up for it' };
          }
          let opts;
          try { opts = ev.options(); }
          catch (e) { return { err: 'options() threw: ' + e.message }; }
          if (!opts || !opts.length) return { err: 'no options' };
          return {
            kind: ev.kind,
            who: ev.who || '',
            text: ev.text || '',
            opts: opts.map(o => ({
              label: o.label || '',
              sub: o.sub || '',
              quiz: !!o.quiz,
              hasRun: typeof o.run === 'function',
            })),
          };
        }""", eid)

        if shown.get('err'):
            fails.append(f'{eid}: {shown["err"]}')
            continue

        check(len(shown['who']) > 10, f'{eid}: no scene-setting line')
        check(len(shown['text']) > 30, f'{eid}: description too short to explain the trade')
        for o in shown['opts']:
            check(bool(o['label']), f'{eid}: an option has no label')
            # THE rule: every option must say what it costs and what it gives
            check(len(o['sub']) >= 8,
                  f'{eid}: option "{o["label"]}" does not state its consequence '
                  f'(sub={o["sub"]!r}) — that is a hidden gamble again')
            check(o['quiz'] or o['hasRun'],
                  f'{eid}: option "{o["label"]}" does nothing at all')
        print(f"  {eid:18s} {shown['kind']:8s} {len(shown['opts'])} options")

    # ---- play one full quiz event end to end ------------------------------
    p.evaluate("""() => {
      const run = STATE.run;
      run.eventsSeen = EVENTS.map(e => e.id).filter(id => id !== 'riddle_gate');
      run.hearts = run.maxHearts;
    }""")
    before = p.evaluate("STATE.run.stats.correct + STATE.run.stats.wrong")
    p.evaluate("enterEvent()"); p.wait_for_timeout(900)
    drain(p)

    gate = p.evaluate("""() => {
      const box = document.getElementById('enc-choices');
      const opts = [...box.querySelectorAll('.choice')];
      return { n: opts.length,
               first: opts.length ? opts[0].innerText.replace(/\\n/g, ' | ') : '' };
    }""")
    check(gate['n'] >= 2, f'the forced event rendered {gate["n"]} options')
    print(f"\n  forced event first option: {gate['first'][:90]}")

    # take the quiz option and answer all three
    try:
        p.query_selector_all('#enc-choices .choice')[0].click()
        p.wait_for_timeout(800)
        for _ in range(4):
            drain(p)
            box = p.query_selector('#enc-choices')
            if not (box and box.is_visible() and box.query_selector('.choice')): break
            txt = box.inner_text()
            if 'Face the three locks' in txt or 'Climb around' in txt: break
            try:
                box.query_selector_all('.choice')[0].click()
                p.wait_for_timeout(1700)
            except Exception:
                break
        drain(p)
    except Exception as e:
        fails.append(f'could not play the quiz event: {e}')

    after = p.evaluate("(STATE.run ? STATE.run.stats.correct + STATE.run.stats.wrong : 0)")
    check(after > before,
          f'a quiz event asked no questions ({before} -> {after}) — '
          f'these exist to ADD review volume')
    print(f"  questions asked by the event: {after - before}")

    print(f'\nFailures    : {len(fails)}')
    for f in fails: print('   !!', f)
    print(f'Page errors : {len(errors)}')
    for e in errors[:5]: print('   !!', e[:160])
    b.close()
    ok = not fails and not errors
    print('\nRESULT:', 'PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)
