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
import os
import sys
import random

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright
from walk import answer_any, clear_rooms, drain_popups

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
    runs = 1

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

        # ---- the Chorus -----------------------------------------------------
        # A room the walker did not know about is a room the walker gets stuck
        # in for the rest of its budget, and every question it would have
        # answered afterwards goes unmeasured. That is what happened when the
        # Chorus landed: the run reported "questions answered 0".
        if visible(page, '#cho-judge'):
            lvl = ('good' if rng.random() < accuracy
                   else ('half' if rng.random() < 0.5 else 'poor'))
            try:
                page.click(f'#cho-judge .pixel-btn[data-level="{lvl}"]', timeout=1200)
                answered += 1
                page.wait_for_timeout(380)
            except Exception:
                pass
            continue
        if visible(page, '#cho-next'):
            try:
                page.click('#cho-next', timeout=1200); page.wait_for_timeout(420)
            except Exception:
                pass
            continue

        # ---- the stake gate -------------------------------------------------
        for side in ('enc', 'boss'):
            gate = f'#{side}-stake-gate'
            if visible(page, gate):
                q = page.evaluate("""(s) => {
                  const run = STATE.run;
                  if (!run) return null;           // the run can end mid-walk
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

        # ---- answer ----------------------------------------------------------
        #
        # MOVED ONTO THE SHARED WALKER IN v6.7. CLAUDE.md has asked for this
        # since walk.py was written: the four suites still carrying private
        # walkers should move over the next time one of them is touched, and
        # this one has now been touched.
        #
        # It had grown its own copy of every question format, and the copy was
        # already drifting - it could answer a spot-the-error and a put-it-in-
        # order question, but only ever looked for `.choice` elements in the
        # plain case and had no idea what to do with anything else. The cost
        # showed up as wild variance: the same walk answered 31 questions on
        # one attempt and 5 on the next, which reads as a game bug and is not.
        #
        # answer_any() knows every format and lives in one file. Teach it once,
        # and this suite, test_stakes and test_perks all learn together.
        clicked = False
        for side in ('enc', 'boss'):
            box = page.query_selector(f'#{side}-choices')
            if not box or not box.is_visible():
                continue
            if answer_any(page, side, want_right=rng.random() < accuracy):
                answered += 1
                clicked = True
                page.wait_for_timeout(700)
            break

        if not clicked:
            # Not a question: a room, a card, or the map. clear_rooms() handles
            # the Chorus and anything else that needs a press before the map
            # comes back; the list below is the rooms this suite reaches that
            # are resolved by pressing exactly one button.
            if clear_rooms(page, level='good' if rng.random() < accuracy else 'half'):
                continue
            node = page.query_selector('.map-node.reachable')
            if node:
                try:
                    node.click(timeout=1200); page.wait_for_timeout(700); continue
                except Exception:
                    pass
            for sel in ('#btn-move-on', '#rest-mend', '#shop-leave', '#event-a',
                        '#btn-continue', '#treasure-open', '#pause-resume',
                        '#popup-continue', '#btn-map-back', '#enc-continue'):
                if visible(page, sel):
                    try:
                        page.click(sel, timeout=800); page.wait_for_timeout(500)
                    except Exception:
                        pass
                    break
            else:
                page.wait_for_timeout(600)   # totem walk; travel is guarded now

        # ---- the run ended: start another one --------------------------------
        #
        # This used to `break`, and until v6.7 that was nearly harmless because
        # runs rarely ended inside the budget. At the new difficulty the weak
        # class wipes in a handful of questions, so a walk that stopped at the
        # first gameover measured five questions on a good day and, once in
        # about a dozen attempts, zero - which tripped the floor and reported a
        # failure that was entirely in the harness.
        #
        # Walking on is not a workaround, it is what the game actually does: a
        # class that wipes picks a new hero and keeps answering until the bell.
        # That is the whole premise of v6.7's Rule 1, and a suite that stops at
        # the first defeat cannot see the thing the version was built around.
        if visible(page, '#screen-gameover') or visible(page, '#screen-victory'):
            runs += 1
            if runs >= 4:
                break
            started = False
            for sel in ('#btn-play-again', '#popup-continue'):
                if visible(page, sel):
                    try:
                        page.click(sel, timeout=1200)
                        page.wait_for_timeout(700)
                        started = True
                    except Exception:
                        pass
            if not started:
                break
            # back to the hero screen, if that is where it landed
            if visible(page, '.hero-card'):
                try:
                    page.click('.hero-card', timeout=1200)
                    page.wait_for_timeout(300)
                    page.click('#hero-confirm', timeout=1200)
                    page.wait_for_timeout(900)
                except Exception:
                    break
            continue

    return dict(answered=answered, clock_checks=clock_checks, clock_bad=clock_bad,
                blind_on_closed=blind_on_closed, runs=runs,
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
        print(f'  runs walked             {r["runs"]}')
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
        # A FLOOR ON THE MEASUREMENT ITSELF.
        #
        # Every check above is of the form "nothing went wrong", and a walk that
        # answers no questions passes all of them perfectly. That is exactly
        # what happened when the v6.5 formats landed: the walker could not click
        # them, answered nothing all run, and the suite reported PASS on a run
        # in which it had tested nothing at all.
        #
        # An accuracy level that never gets a question in front of it has not
        # been tested, and saying so is the whole job.
        if r['answered'] < 5:
            print(f'  !! only {r["answered"]} questions were answered — this '
                  f'run tested almost nothing')
            fails += 1
        if (r['clock_bad'] or r['blind_on_closed'] or errors
                or r['distracted_ate_question']):
            fails += 1
        page.screenshot(path=f'/tmp/v53_{label.split()[0]}.png')
        page.close()
    browser.close()
    print('\nRESULT:', 'PASS' if fails == 0 else f'FAIL ({fails} runs with problems)')
    sys.exit(1 if fails else 0)
