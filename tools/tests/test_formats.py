"""Do the new question formats actually work, and do they play by the rules?

v6.5 added three ways to ask a question besides "pick one of three": spot the
error, put it in order, and odd one out. Each one is a small renderer with its
own click handling, and each one is a fresh chance to break the two things the
whole game rests on.

What this presses:

  IT CAN BE ANSWERED AT ALL. Every format, right answer and wrong answer, both
  roads. A format that renders beautifully and never calls back would look
  completely fine in a screenshot and freeze a classroom.

  IT REACHES THE TEACHING RECORD. The record hangs off renderQuestion, and each
  format finishes through its own path. One that forgot to call done() would
  quietly stop logging - and the report would look healthy while silently
  omitting every grammar question in the game, which is the half a teacher most
  needs.

  ONE QUESTION, ONE ANSWER. Ordering takes several taps to answer. It must
  still book exactly one attempt, and it must refuse a second.

  THE POTION OF CLARITY STILL DOES SOMETHING. This is the reason this suite
  exists at all. Clarity removes a wrong option - and two of the three new
  formats have no options to remove. The old code would have found nothing to
  trim, eaten the potion, and shown the class nothing. Silent, harmless-looking,
  and exactly the shape of bug that has bitten this project three times. Each
  format now owns a hint, and each one is checked here.

Run the local server from the project root first:  python3 -m http.server 8811
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'
fails = []

# Answering each format, as a student would: a sequence of clicks inside the
# choices container. Returned as JS so the whole thing runs in one evaluate.
ANSWER_RIGHT = {
    "choice": "[...document.querySelectorAll('#enc-choices .choice')]"
              ".find(c => c.textContent === Q.answer).click()",
    "odd":    "[...document.querySelectorAll('#enc-choices .choice')]"
              ".find(c => c.textContent === Q.answer).click()",
    "error":  "[...document.querySelectorAll('#enc-choices .err-word')]"
              ".find(c => c.textContent.replace(/[.,!?;:'\\\"]+$/, '') === Q.answer).click()",
    # Tap the fragments in the order the question says they belong.
    "order":  "Q.parts.forEach(t => { const c = "
              "[...document.querySelectorAll('#enc-choices .order-pool .order-chip')]"
              ".find(x => x.textContent === t); if (c) c.click(); })",
}
ANSWER_WRONG = {
    "choice": "[...document.querySelectorAll('#enc-choices .choice')]"
              ".find(c => c.textContent !== Q.answer).click()",
    "odd":    "[...document.querySelectorAll('#enc-choices .choice')]"
              ".find(c => c.textContent !== Q.answer).click()",
    "error":  "[...document.querySelectorAll('#enc-choices .err-word')]"
              ".find(c => c.textContent.replace(/[.,!?;:'\\\"]+$/, '') !== Q.answer).click()",
    # Reversed - guaranteed wrong for any question with 3+ distinct pieces.
    "order":  "Q.parts.slice().reverse().forEach(t => { const c = "
              "[...document.querySelectorAll('#enc-choices .order-pool .order-chip')]"
              ".find(x => x.textContent === t); if (c) c.click(); })",
}

IDS = "{question:'enc-question',choices:'enc-choices',feedback:'enc-feedback'}"


def start(p):
    p.goto(URL)
    p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()')
    p.reload()
    p.wait_for_timeout(700)
    p.click('#btn-roster')
    p.wait_for_timeout(250)
    p.fill('#roster-class', '5 Format')
    p.fill('#roster-party', 'Fmt')
    p.fill('#roster-names', 'ANH\nBAO')
    p.click('#roster-save')
    p.wait_for_timeout(400)
    rc = p.query_selector('#roster-close')
    if rc and rc.is_visible():
        rc.click()
        p.wait_for_timeout(400)
    p.click('.realm-card:not(.locked)')
    p.wait_for_timeout(700)
    p.click('.hero-card')
    p.wait_for_timeout(300)
    p.click('#hero-confirm')
    p.wait_for_timeout(900)
    for _ in range(8):
        if p.query_selector('#popup-layer.open'):
            p.click('#popup-continue')
            p.wait_for_timeout(200)
        else:
            break


def drive(p, fmt, how, clarity=False):
    """Render one question of this format, answer it, report what happened."""
    return p.evaluate("""([fmt, how, clarity]) => {
      const bank = REALMS[1].questions.concat(REALMS[2].questions);
      const Q = bank.find(q => (q.format || 'choice') === fmt);
      if (!Q) return { missing: true };
      window.Q = Q;
      STATE.run.clarityActive = !!clarity;
      STATE.run.answerLog = [];
      let calls = 0, got = null;
      _gatingSide = null;
      renderQuestion(Q, %IDS%, c => { calls++; got = c; });
      const hinted = document.getElementById('enc-feedback').textContent;
      const hintedNodes =
        document.querySelectorAll('#enc-choices .removed, #enc-choices .ruled-out,'
                                + ' #enc-choices .order-built .order-chip').length;
      eval(how);
      return {
        cover: Q.cover,
        calls, got,
        logged: STATE.run.answerLog.length,
        loggedCorrect: STATE.run.answerLog.map(a => a.correct),
        clarityLeft: !!STATE.run.clarityActive,
        hintText: hinted,
        hintedNodes,
        // Everything must live inside the choices container, or the stake
        // gate cannot hide it for a blind call.
        outside: document.querySelectorAll(
          '#screen-encounter .err-sentence, #screen-encounter .order-wrap'
        ).length - document.querySelectorAll(
          '#enc-choices .err-sentence, #enc-choices .order-wrap').length,
        keepsChoicesClass:
          document.getElementById('enc-choices').classList.contains('choices'),
      };
    }""".replace('%IDS%', IDS), [fmt, how, clarity])


with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--no-sandbox'])
    p = b.new_page(viewport={'width': 1366, 'height': 768})
    errs = []
    p.on('pageerror', lambda e: errs.append(str(e)))
    start(p)

    for fmt in ("choice", "odd", "error", "order"):
        for label, how, want in (("right", ANSWER_RIGHT[fmt], True),
                                 ("wrong", ANSWER_WRONG[fmt], False)):
            r = drive(p, fmt, how)
            if r.get('missing'):
                fails.append(f'{fmt}: no question of this format exists in '
                             f'either realm — the renderer is unreachable')
                continue
            print(f"  {fmt:<7} {label:<6} answered={r['got']} calls={r['calls']} "
                  f"logged={r['logged']} ({r['cover']})")
            if r['calls'] != 1:
                fails.append(f'{fmt} answered {label}: the game was told '
                             f'{r["calls"]} times, not once — a format that '
                             f'never calls back freezes the classroom')
            elif r['got'] is not want:
                fails.append(f'{fmt} answered {label}: the game was told '
                             f'"{r["got"]}" — it marked a {label} answer the '
                             f'wrong way round')
            if r['logged'] != 1:
                fails.append(f'{fmt} answered {label}: {r["logged"]} entries '
                             f'reached the teaching record, not one — the '
                             f'report would be missing this whole format')
            elif r['loggedCorrect'][0] is not want:
                fails.append(f'{fmt} answered {label}: the record says '
                             f'{r["loggedCorrect"][0]}')
            # NOTE: run.stats is deliberately NOT checked here. It is bumped
            # by the fight resolver, not by renderQuestion, and this suite
            # hands each format a bare callback. Asserting on it measured the
            # test's own stub rather than the code under test - the exact
            # "count the thing you mean, not a proxy for it" mistake that has
            # cost this project time twice. test_curriculum.py checks the log
            # against run.stats in a real run, which is where that belongs.
            if r['outside']:
                fails.append(f'{fmt}: part of it renders OUTSIDE the choices '
                             f'container, so the stake gate cannot hide it for '
                             f'a blind call — the class would see the options')
            if not r['keepsChoicesClass']:
                fails.append(f'{fmt}: the container lost its "choices" class, '
                             f'which is what `.choices.hidden` hides — a blind '
                             f'call would leave the answer on screen')

    # ---- one question, one answer -----------------------------------------
    # Ordering is answered by several taps. It must still book exactly one
    # attempt, and a further tap afterwards must do nothing at all.
    r = p.evaluate("""() => {
      const bank = REALMS[1].questions.concat(REALMS[2].questions);
      const Q = bank.find(q => q.format === 'order');
      STATE.run.answerLog = [];
      let calls = 0;
      _gatingSide = null;
      renderQuestion(Q, %IDS%, () => calls++);
      Q.parts.forEach(t => {
        const c = [...document.querySelectorAll('#enc-choices .order-pool .order-chip')]
          .find(x => x.textContent === t);
        if (c) c.click();
      });
      // and now keep tapping
      document.querySelectorAll('#enc-choices .order-chip').forEach(c => c.click());
      document.querySelectorAll('#enc-choices .order-undo').forEach(c => c.click());
      return { calls, logged: STATE.run.answerLog.length };
    }""".replace('%IDS%', IDS))
    print(f"  order   extra taps after answering: calls={r['calls']} "
          f"logged={r['logged']}")
    if r['calls'] != 1 or r['logged'] != 1:
        fails.append(f"order: tapping on after the answer booked "
                     f"{r['logged']} attempts and told the game {r['calls']} "
                     f"times — one question must be one answer")

    # ---- the undo ----------------------------------------------------------
    # A misclick on a classroom TV must not cost a heart, so the last piece can
    # be taken back. If undo were dead the format would be unforgiving in a way
    # nothing tells the class about.
    r = p.evaluate("""() => {
      const bank = REALMS[1].questions.concat(REALMS[2].questions);
      const Q = bank.find(q => q.format === 'order');
      _gatingSide = null;
      STATE.run.answerLog = [];
      renderQuestion(Q, %IDS%, () => {});
      const pool = () => document.querySelectorAll('#enc-choices .order-pool .order-chip').length;
      const start = pool();
      document.querySelector('#enc-choices .order-pool .order-chip').click();
      const afterPlace = pool();
      document.querySelector('#enc-choices .order-undo').click();
      return { start, afterPlace, afterUndo: pool(),
               logged: STATE.run.answerLog.length };
    }""".replace('%IDS%', IDS))
    print(f"  order   undo: pool {r['start']} -> {r['afterPlace']} -> "
          f"{r['afterUndo']}")
    if r['afterPlace'] != r['start'] - 1:
        fails.append('order: tapping a piece did not move it out of the pool')
    if r['afterUndo'] != r['start']:
        fails.append('order: "take back the last piece" did not put it back — '
                     'a misclick on a classroom TV would be unrecoverable')
    if r['logged']:
        fails.append('order: an unfinished sentence was booked as an answer')

    # ---- the Potion of Clarity -------------------------------------------
    # THE reason this suite exists. Clarity removes a wrong option, and two of
    # the three new formats have no options. Left alone it would have been
    # eaten with nothing on screen - a paid-for potion doing nothing, silently.
    for fmt in ("choice", "odd", "error", "order"):
        r = drive(p, fmt, ANSWER_RIGHT[fmt], clarity=True)
        helped = ("Clarity" in (r['hintText'] or "")) and r['hintedNodes'] > 0
        print(f"  {fmt:<7} clarity: helped={helped} "
              f"marked={r['hintedNodes']} “{(r['hintText'] or '')[:44]}”")
        if r['clarityLeft']:
            fails.append(f'{fmt}: the Potion of Clarity was not consumed')
        elif not helped:
            fails.append(
                f'{fmt}: the Potion of Clarity was used up and did nothing '
                f'visible — the class paid shards for it and got no help')

    if errs:
        fails.append(f'{len(errs)} page errors: {errs[0][:140]}')
    p.close()
    b.close()

print(f"\nProblems: {len(fails)}")
for f in fails:
    print('  -', f)
print('RESULT:', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
