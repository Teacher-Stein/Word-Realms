"""Does Brace actually block a blow?

The v5.3 bug had two halves:
  1. `defending` was captured when the question was RENDERED, but the student
     clicks Brace AFTER that - so a braced correct answer resolved as an
     ordinary attack. And advanceStudentAndAsk() clears run.bracing before the
     next question, so the flag could never survive to a later turn either.
     Brace was a dead button.
  2. Even once read live, the braced branch set turnsUntilAct = cadence and
     nextCombatTurn() then ticked it, so on a cadence-1 variant it hit 0 and
     the monster swung anyway.

Nothing caught either half because no harness had ever pressed Brace. This
drives the exact moment repeatedly: force the clock to ON THE NEXT ANSWER,
press Brace, answer correctly, and require that nothing is lost.
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'

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

def answer_correct(p):
    box = p.query_selector('#enc-choices')
    if not box or not box.is_visible(): return False
    ans = p.evaluate("STATE.run.encounter&&STATE.run.encounter.currentQ?STATE.run.encounter.currentQ.answer:null")
    for c in box.query_selector_all('.choice'):
        if c.inner_text().strip() == ans:
            try: c.click(timeout=1500); return True
            except Exception: return False
    return False

def reach_fight(p, tries=80):
    for _ in range(tries):
        drain(p)
        if vis(p, '#btn-move-on'):
            try: p.click('#btn-move-on', timeout=800); p.wait_for_timeout(350)
            except Exception: pass
        if vis(p, '#enc-stake-gate'):
            try: p.click('#enc-stake-gate .sg-safe', timeout=1500); p.wait_for_timeout(280)
            except Exception: pass
        if p.evaluate("!!(STATE.run && STATE.run.encounter)") and vis(p, '#enc-choices'):
            return True
        # A Treasure room borrows the encounter screen but leaves run.encounter
        # null, so it looks like a fight and is not one. Answer through it, or
        # the loop parks here until it runs out of tries.
        if not p.evaluate("!!(STATE.run && STATE.run.encounter)"):
            box = p.query_selector('#enc-choices')
            if box and box.is_visible() and box.query_selector('.choice'):
                try:
                    box.query_selector_all('.choice')[0].click(timeout=1200)
                    p.wait_for_timeout(900); continue
                except Exception:
                    pass
        n = p.query_selector('.map-node.reachable')
        if n:
            try: n.click(timeout=1200); p.wait_for_timeout(800); continue
            except Exception: pass
        for s in ('#rest-mend', '#shop-leave', '#event-a', '#treasure-open'):
            if vis(p, s):
                try: p.click(s, timeout=800); p.wait_for_timeout(450)
                except Exception: pass
                break
        else:
            # the totem walk takes ~1s and travelToNode now refuses clicks
            # while it is in progress, so idling briefly is normal
            p.wait_for_timeout(500)
    return False

with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--no-sandbox'])
    p = b.new_page(viewport={'width': 1600, 'height': 900})
    errors = []
    p.on('pageerror', lambda e: errors.append(str(e)))
    p.goto(URL); p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()'); p.reload(); p.wait_for_timeout(500)
    p.click('#btn-roster'); p.wait_for_timeout(250)
    p.fill('#roster-class','5B0'); p.fill('#roster-party','TW')
    p.fill('#roster-names','GORD\nMINH'); p.click('#roster-save'); p.wait_for_timeout(400)
    rc = p.query_selector('#roster-close')
    if rc and rc.is_visible(): rc.click(); p.wait_for_timeout(400)
    p.click('.realm-card:not(.locked)'); p.wait_for_timeout(800)
    p.click('.hero-card'); p.wait_for_timeout(300); p.click('#hero-confirm'); p.wait_for_timeout(900)

    tested = 0; failures = []
    # Cadence 1 is the case that broke the second half of the bug, so drive it
    # explicitly alongside the normal cadences.
    for cadence in (1, 1, 2, 3, 3, 1, 2, 3):
        if not reach_fight(p):
            failures.append('could not reach a fight'); break
        # Force the exact moment: clock about to fire, monster healthy enough
        # that the fight will not end underneath us.
        before = p.evaluate("""(cad) => {
          const run = STATE.run, m = run.encounter;
          m.cadence = cad; m.turnsUntilAct = 1; m.stunned = false;
          m.hp = m.maxHp = 6;
          run.hearts = Math.max(run.hearts, 6);
          renderIntent('monster-intent', m);
          return { hearts: run.hearts, shields: run.shields, cadence: m.cadence };
        }""", cadence)

        btn = p.query_selector('#btn-brace')
        if not (btn and btn.is_visible() and not btn.is_disabled()):
            failures.append(f'cadence {cadence}: Brace button unavailable'); continue
        btn.click(); p.wait_for_timeout(320)

        braced_flag = p.evaluate("!!(STATE.run && STATE.run.bracing)")
        if not braced_flag:
            failures.append(f'cadence {cadence}: clicking Brace did not set the flag')

        if not answer_correct(p):
            failures.append(f'cadence {cadence}: could not answer'); continue
        p.wait_for_timeout(2100); drain(p)

        after = p.evaluate("""() => {
          const run = STATE.run; if (!run) return null;
          const m = run.encounter;
          return { hearts: run.hearts, shields: run.shields,
                   until: m ? m.turnsUntilAct : null,
                   cadence: m ? m.cadence : null };
        }""")
        tested += 1
        lost_h = before['hearts'] - after['hearts']
        lost_s = before['shields'] - after['shields']
        if lost_h > 0 or lost_s > 0:
            failures.append(f"cadence {cadence}: braced + correct, still lost "
                            f"{lost_h} hearts / {lost_s} shields")
        elif after['until'] is not None and after['until'] < after['cadence']:
            failures.append(f"cadence {cadence}: clock not reset "
                            f"({after['until']} of {after['cadence']})")

    print(f'Brace scenarios driven : {tested}')
    print(f'Failures               : {len(failures)}')
    for f in failures[:8]: print('   !!', f)
    print(f'Page errors            : {len(errors)}')
    for e in errors[:3]: print('   !!', e[:140])
    b.close()
    ok = tested >= 6 and not failures and not errors
    print('\nRESULT:', 'PASS' if ok else 'FAIL')
    sys.exit(0 if ok else 1)
