"""v5.3 regression run.

Checks, beyond "does it crash":
  1. The intent countdown matches when the monster ACTUALLY attacks. The v5.2
     bug was an off-by-one: the number on screen while a student was choosing
     was always one behind, so ON THE NEXT ANSWER never appeared during a
     question. We now read turnsUntilAct out of the live run and compare it to
     what the DOM claims, on every single question.
  2. RISKY never hides the options on a selection-only question.
  3. The Distracted button never eats the question it was pressed on.
"""
import sys, random
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'


def setup(page):
    page.goto(URL); page.wait_for_timeout(400)
    page.evaluate('localStorage.clear()'); page.reload(); page.wait_for_timeout(500)
    page.click('#btn-roster'); page.wait_for_timeout(250)
    page.fill('#roster-class', '5B0')
    page.fill('#roster-party', 'The Thunder Wolves')
    page.fill('#roster-names', 'GORD\nMINH\nLAN\nKHANH')
    page.click('#roster-save'); page.wait_for_timeout(400)
    if visible(page, '#roster-close'):
        page.click('#roster-close'); page.wait_for_timeout(400)
    page.wait_for_selector('.realm-card:not(.locked)', timeout=8000)
    page.click('.realm-card:not(.locked)'); page.wait_for_timeout(800)
    page.wait_for_selector('.hero-card', timeout=8000)
    page.click('.hero-card'); page.wait_for_timeout(350)
    page.click('#hero-confirm'); page.wait_for_timeout(1000)
    for _ in range(6):
        if visible(page, '#popup-continue'):
            page.click('#popup-continue'); page.wait_for_timeout(350)
    print('   after setup, active screen:',
          page.evaluate("[...document.querySelectorAll('.screen.active')].map(e=>e.id).join(',')"))


def visible(page, sel):
    try:
        el = page.query_selector(sel)
        return bool(el and el.is_visible())
    except Exception:
        return False


def play(page, accuracy, budget, log):
    """Answer questions until the run ends or the budget runs out."""
    rng = random.Random(int(accuracy * 1000))
    clock_checks = clock_bad = 0
    blind_on_closed = 0
    distracted_ate_question = 0
    answered = 0

    for _ in range(budget):
        # Drain the popup queue. Coach cards and reward cards stack, and any
        # one of them blocks every click underneath with a full-screen layer.
        for _ in range(10):
            if page.query_selector('#popup-layer.open'):
                try:
                    page.click('#popup-continue', timeout=900)
                    page.wait_for_timeout(300)
                    continue
                except Exception:
                    break
            break
        if visible(page, '#btn-move-on'):
            try:
                page.click('#btn-move-on', timeout=800); page.wait_for_timeout(400)
            except Exception:
                pass

        # ---- the stake gate -------------------------------------------------
        for side in ('enc', 'boss'):
            gate = f'#{side}-stake-gate'
            if visible(page, gate):
                q = page.evaluate("""(s) => {
                  const run = STATE.run;
                  const m = s==='boss' ? run.boss : run.encounter;
                  return m && m.currentQ ? {open: m.currentQ.open === true,
                                            tier: m.currentQ.tier || 1} : null;
                }""", side)
                take_risk = rng.random() < 0.45
                if take_risk:
                    try:
                        page.click(f'{gate} .sg-risky', timeout=1500)
                    except Exception:
                        continue
                    page.wait_for_timeout(280)
                    said = visible(page, f'#{side}-commit-say')
                    if said and q and not q['open']:
                        blind_on_closed += 1
                        log.append(f'  !! BLIND offered on a selection-only question')
                    if said:
                        # adjudicate the spoken answer
                        right = rng.random() < accuracy
                        try:
                            page.click(f'#{side}-commit-say .cs-yes' if right
                                       else f'#{side}-commit-say .cs-no', timeout=1500)
                            answered += 1
                        except Exception:
                            pass
                        page.wait_for_timeout(650)
                        continue
                else:
                    try:
                        page.click(f'{gate} .sg-safe', timeout=1500)
                    except Exception:
                        continue
                page.wait_for_timeout(280)

        # ---- the Distracted button ------------------------------------------
        # It must NEVER consume the question. Press it on roughly one question
        # in twelve and check the options are still there afterwards; a teacher
        # uses it mid-question and the nominated student still has to answer.
        if answered and answered % 12 == 0 and visible(page, '#btn-distracted'):
            # Compare the QUESTION, not just how many options are on screen.
            # A raw count is ambiguous: the button can legitimately land the
            # killing blow, which ends the run and empties the panel, and that
            # is not the same thing as eating the question. The bug we care
            # about is the question changing while the fight carries on.
            before = page.evaluate("""() => {
              const q = document.getElementById('enc-question');
              const n = document.querySelectorAll('#enc-choices .choice').length;
              return { q: q ? q.textContent : '', n };
            }""")
            if before['n']:
                try:
                    page.click('#btn-distracted', timeout=800)
                    page.wait_for_timeout(500)
                    for _ in range(4):
                        if page.query_selector('#popup-layer.open'):
                            page.click('#popup-continue', timeout=700)
                            page.wait_for_timeout(200)
                    after = page.evaluate("""() => {
                      const q = document.getElementById('enc-question');
                      return {
                        q: q ? q.textContent : '',
                        n: document.querySelectorAll('#enc-choices .choice').length,
                        liveFight: !!(window.STATE && STATE.run && STATE.run.encounter
                                      && STATE.run.encounter.hp > 0),
                      };
                    }""")
                    # only a problem if the fight is still going and the
                    # question moved on without anyone answering it
                    if after['liveFight'] and (after['q'] != before['q']
                                               or after['n'] < before['n']):
                        distracted_ate_question += 1
                except Exception:
                    pass

        # ---- the clock check ------------------------------------------------
        state = page.evaluate("""() => {
          const run = STATE.run; if (!run) return null;
          const boss = document.getElementById('screen-boss');
          const isBoss = boss && boss.classList.contains('active');
          const m = isBoss ? run.boss : run.encounter;
          if (!m || m.stunned) return null;
          const el = document.getElementById(isBoss ? 'boss-intent' : 'monster-intent');
          const w = el && el.querySelector('.intent-when');
          if (!w) return null;
          return { model: m.turnsUntilAct, text: w.textContent.trim() };
        }""")
        if state:
            clock_checks += 1
            t, n = state['text'], state['model']
            expect = 'ON THE NEXT ANSWER' if n <= 1 else f'AFTER {n} MORE ANSWERS'
            if not t.startswith(expect):
                clock_bad += 1
                if clock_bad <= 5:
                    log.append(f'  !! clock says "{t}" but turnsUntilAct={n}')

        # ---- answer ---------------------------------------------------------
        clicked = False
        for side in ('enc', 'boss'):
            box = page.query_selector(f'#{side}-choices')
            if not box or not box.is_visible():
                continue
            opts = [c for c in box.query_selector_all('.choice')
                    if 'locked' not in (c.get_attribute('class') or '')]
            if not opts:
                continue
            answer = page.evaluate("""(s) => {
              const run = STATE.run;
              const m = s==='boss' ? run.boss : run.encounter;
              return m && m.currentQ ? m.currentQ.answer : null;
            }""", side)
            want_right = rng.random() < accuracy
            target = None
            for c in opts:
                if (c.inner_text().strip() == answer) == want_right:
                    target = c; break
            try:
                (target or opts[0]).click(timeout=1500)
                answered += 1; clicked = True
                page.wait_for_timeout(700)
            except Exception:
                pass
            break

        if not clicked:
            # map screen? pick a reachable node
            node = page.query_selector('.map-node.reachable')
            if node:
                try:
                    node.click(timeout=1200); page.wait_for_timeout(700); continue
                except Exception:
                    pass
            for sel in ('#btn-move-on', '#rest-mend', '#shop-leave', '#event-a',
                        '#btn-continue', '#treasure-open', '#pause-resume'):
                if visible(page, sel):
                    try:
                        page.click(sel, timeout=800); page.wait_for_timeout(500)
                    except Exception:
                        pass
                    break
            else:
                page.wait_for_timeout(600)   # totem walk; travel is guarded now

        if visible(page, '#screen-gameover') or visible(page, '#screen-victory'):
            break

    return dict(answered=answered, clock_checks=clock_checks, clock_bad=clock_bad,
                blind_on_closed=blind_on_closed,
                distracted_ate_question=distracted_ate_question)


with sync_playwright() as pw:
    browser = pw.chromium.launch(args=['--no-sandbox'])
    fails = 0
    # v5.8 events ask their own questions (a Riddle Gate is three extra), so a
    # run covers less map per iteration than it used to.
    for label, acc, budget in (('near-perfect (99%)', 0.99, 90),
                               ('strong class (92%)', 0.92, 90),
                               ('typical class (82%)', 0.82, 90),
                               ('weak class (58%)', 0.58, 90)):
        page = browser.new_page(viewport={'width': 1600, 'height': 900})
        page.add_init_script("window.__errs=[]; window.addEventListener('error', e => { window.__errs.push((e.error && e.error.stack) || e.message); });")
        errors = []
        page.on('console', lambda m: errors.append(m.text) if m.type == 'error' else None)
        page.on('pageerror', lambda e: errors.append('PAGEERROR ' + str(e) + ' || STACK: ' + str(getattr(e,'stack','')) ))
        log = []
        setup(page)
        r = play(page, acc, budget, log)
        print(f'\n=== {label} ===')
        print(f'  questions answered      {r["answered"]}')
        print(f'  clock readings checked  {r["clock_checks"]}')
        print(f'  clock readings WRONG    {r["clock_bad"]}')
        print(f'  blind on closed q       {r["blind_on_closed"]}')
        print(f'  Distracted ate a Q      {r["distracted_ate_question"]}  (must be 0)')
        print(f'  console errors          {len(errors)}')
        for e in errors[:6]:
            print('    ', e[:160])
        try:
            for st in (page.evaluate('window.__errs') or [])[:2]:
                print('    STACK:', str(st)[:700])
        except Exception:
            pass
        for l in log[:8]:
            print(l)
        if (r['clock_bad'] or r['blind_on_closed'] or errors
                or r['distracted_ate_question']):
            fails += 1
        page.screenshot(path=f'/tmp/v53_{label.split()[0]}.png')
        page.close()
    browser.close()
    print('\nRESULT:', 'PASS' if fails == 0 else f'FAIL ({fails} runs with problems)')
    sys.exit(1 if fails else 0)
