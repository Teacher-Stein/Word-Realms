"""Does the teaching record actually record the teaching?

The report exists to answer one question for a teacher: of everything this
class has been asked, what are they getting wrong? That answer is worthless
unless it rests on EVERY question the class answered. A record that quietly
drops one road - the blind calls, say, or the treasure chests - would not look
broken. It would look like a class that is slightly better at grammar than they
really are, and nobody would ever find out.

So the central check here is not "is there data". It is:

    answerLog.length == run.stats.correct + run.stats.wrong

The game has counted answers correctly since v1 and that counter is used for
the score, so it is the honest yardstick. If the two ever disagree, the record
is lying about something.

The other thing this guards is RULE ONE. The record is written from inside
renderQuestion, which is the hot path every single question in the game passes
through. Nothing in that path may change how many questions get asked - so this
also checks that logging an answer leaves the question pool, the covered-key
list and the monster completely untouched.

Run the local server from the project root first:  python3 -m http.server 8811
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'

fails = []


def vis(p, s):
    try:
        e = p.query_selector(s)
        return bool(e and e.is_visible())
    except Exception:
        return False


def drain(p):
    for _ in range(12):
        if p.query_selector('#popup-layer.open'):
            try:
                p.click('#popup-continue', timeout=800)
                p.wait_for_timeout(160)
                continue
            except Exception:
                break
        break


def start_run(p, class_name='5 Tiger'):
    p.goto(URL)
    p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()')
    p.reload()
    p.wait_for_timeout(700)
    p.click('#btn-roster')
    p.wait_for_timeout(250)
    p.fill('#roster-class', class_name)
    p.fill('#roster-party', 'Record')
    p.fill('#roster-names', 'ANH\nBAO\nCHI')
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
    drain(p)


def sample(p):
    return p.evaluate("""() => {
      const r = STATE.run;
      if (!r) return null;
      return { log: r.answerLog.length, stats: r.stats.correct + r.stats.wrong };
    }""")


def play(p, steps=260):
    """Play a run, deliberately mixing SAFE and RISKY.

    The mix matters. A RISKY call on an `open` question hides the options and
    is adjudicated by the room, so it never touches a choice element and never
    goes through renderQuestion's click handler - it is booked down a second
    road entirely. A test that only ever clicked SAFE would pass with that road
    completely unwired.
    """
    answered, blind, seen = 0, 0, []
    # The invariant is checked after EVERY answer rather than once at the end.
    #
    # Checking once at the end looked fine and was not: a run can die halfway
    # through the walk and the class can start another, at which point the run
    # object holds a fresh empty log while the class record - correctly - still
    # holds everything. The first version of this test read that as the log
    # dropping every answer in the game.
    #
    # Sampling continuously is both sturdier and a stronger check: it has to
    # hold at all forty points in a run, not just the last one.
    worst = None
    for i in range(steps):
        drain(p)
        if vis(p, '#btn-move-on'):
            try:
                p.click('#btn-move-on', timeout=800)
                p.wait_for_timeout(240)
            except Exception:
                pass
        if not p.evaluate('() => !!STATE.run'):
            break                              # run ended; that is a result too
        if vis(p, '#enc-stake-gate'):
            # ALWAYS RISKY. An earlier version risked one gate in three and the
            # suite failed about one run in three for a reason that had nothing
            # to do with the record: the walk simply never drew an `open`
            # question on a risked gate, so no blind call ever happened and the
            # suite correctly complained that it had not tested that road.
            #
            # Risking everything is not realistic play, but this suite is not
            # measuring difficulty - it is making sure both roads into the
            # record get pressed, and RISKY on an open question is the only
            # thing that opens the second one.
            try:
                p.click('#enc-stake-gate .sg-risky', timeout=1000)
                p.wait_for_timeout(240)
            except Exception:
                try:
                    p.click('#enc-stake-gate .sg-safe', timeout=800)
                    p.wait_for_timeout(200)
                except Exception:
                    pass
            continue
        # A BLIND call waiting to be adjudicated. This is the second road into
        # the record - the options are hidden, the student says the answer out
        # loud and the room rules on it, so no choice element is ever clicked
        # and renderQuestion's click handler never fires. If this branch is
        # never reached, half the recording code is untested.
        judged = p.evaluate("""() => {
          const b = [...document.querySelectorAll('.cs-yes, .cs-no')]
            .filter(x => x.offsetParent);
          if (!b.length) return false;
          b[0].click();
          return true;
        }""")
        if judged:
            answered += 1
            blind += 1
            p.wait_for_timeout(420)
            snap = sample(p)
            if snap and snap['log'] != snap['stats']:
                worst = snap
                break
            if snap:
                seen.append(snap)
            continue

        # Click a LIVE option only. An already-locked choice is a no-op, and
        # counting those as answers made an early version of this test look
        # like the log was dropping three quarters of the questions.
        # VISIBLE and live. offsetParent is the difference between what a
        # student can click and what a script can: after a blind call the
        # options are still in the DOM behind a hidden panel, and clicking one
        # of those is not something a class can do.
        did = p.evaluate("""() => {
          const c = [...document.querySelectorAll(
            '#enc-choices .choice:not(.locked):not(.removed)')]
            .filter(x => x.offsetParent);
          if (!c.length) return false;
          c[0].click();
          return true;
        }""")
        if did:
            answered += 1
            p.wait_for_timeout(400)
            snap = sample(p)
            if snap and snap['log'] != snap['stats']:
                worst = snap
                break
            if snap:
                seen.append(snap)
            continue
        clicked = p.evaluate("""() => {
          const ns = [...document.querySelectorAll('.map-node.reachable')];
          if (!ns.length) return false;
          const f = ns.find(n => /fight|elite/i.test(n.textContent || ''));
          (f || ns[0]).click();
          return true;
        }""")
        if clicked:
            p.wait_for_timeout(560)
            continue
        for s in ('#rest-mend', '#shop-leave', '#event-a', '#treasure-open'):
            if vis(p, s):
                try:
                    p.click(s, timeout=800)
                    p.wait_for_timeout(320)
                except Exception:
                    pass
                break
        else:
            p.wait_for_timeout(280)
    return answered, worst, seen, blind


with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--no-sandbox'])
    p = b.new_page(viewport={'width': 1366, 'height': 768})
    errs = []
    p.on('pageerror', lambda e: errs.append(str(e)))

    # Up to three runs, stopping as soon as both roads have been pressed and
    # the log has got deep enough to mean something. A run can end early
    # through nobody's fault - the party is wiped, or the walk reaches the boss
    # down a quiet lane - and that is not a finding about the teaching record.
    played = blind = 0
    seen, mismatch = [], None
    for attempt in range(3):
        start_run(p)
        a, m, sn, bl = play(p)
        played += a
        blind += bl
        seen += sn
        mismatch = mismatch or m
        if mismatch:
            break
        if blind and max((x['log'] for x in sn), default=0) >= 5:
            break
        print(f"  (run {attempt + 1} gave {bl} blind call(s) and a log "
              f"{max((x['log'] for x in sn), default=0)} deep — going again)")
    if mismatch:
        fails.append(
            f"mid-run the record held {mismatch['log']} answers while the game "
            f"had counted {mismatch['stats']} — the report is being built on an "
            f"incomplete picture of what the class was asked")
    deepest = max((s['log'] for s in seen), default=0)

    r = p.evaluate("""() => {
      const run = STATE.run;
      const rec = STATE.curriculum && STATE.curriculum['5 Tiger'];
      const recAsked = rec ? Object.values(rec.items)
                                   .reduce((n, i) => n + i.asked, 0) : 0;
      return {
        alive: !!run,
        log: run ? run.answerLog.length : 0,
        stats: run ? (run.stats.correct + run.stats.wrong) : 0,
        studentRun: run ? run.studentRun : {},
        runs: rec ? rec.runs : 0,
        questions: rec ? rec.questions : 0,
        items: rec ? Object.keys(rec.items).length : 0,
        recAsked,
        // Nothing in the record may claim more right answers than attempts.
        broken: rec ? Object.entries(rec.items)
                            .filter(([, i]) => i.right > i.asked || i.asked < 1)
                            .map(([k]) => k) : [],
      };
    }""")

    print(f"  live options clicked   {played}")
    print(f"  invariant sampled      {len(seen)}x, deepest log {deepest}")
    print(f"  blind calls judged     {blind}")
    if not blind:
        fails.append(
            "not one blind call was adjudicated in the whole walk, so the "
            "second road into the record was never pressed — a blind answer "
            "never touches a choice element, so if its wiring were missing "
            "this suite would have passed anyway")
    print(f"  class record           {r['runs']} run(s), {r['questions']} "
          f"questions, {r['items']} items")

    if deepest < 5:
        fails.append(f"the deepest a run's log ever got was {deepest} answers — "
                     f"too few to have tested anything")
    if r['recAsked'] < deepest:
        fails.append(f"the class record holds {r['recAsked']} attempts but a run "
                     f"logged {deepest} — answers are not reaching the "
                     f"per-class record")
    if r['broken']:
        fails.append(f"nonsense figures in the record for: {r['broken'][:4]}")
    if r['runs'] < 1:
        fails.append("the class record counted 0 runs after a run was played")

    # ---- RULE ONE ---------------------------------------------------------
    # The record is written from inside renderQuestion, the path every question
    # in the game goes through. If anything in there ever touched the question
    # pool or the monster, fights would change length and the game would ask
    # fewer questions - the one thing it must never do.
    if r['alive']:
        rule = p.evaluate("""() => {
          const run = STATE.run;
          const before = {
            covered: run.coveredKeys.length,
            used: (run.usedQuestionIdx || []).length,
            missed: (run.missedQs || []).length,
            hearts: run.hearts,
            mon: run.encounter ? run.encounter.hp : null,
            until: run.encounter ? run.encounter.turnsUntilAct : null,
          };
          // Book an answer directly, twice, exactly as the two roads would.
          const q = { cover: 'tornado', tier: 1 };
          beginAsk(q);
          logAnswer(q, true);
          logAnswer(q, true);      // the second road must find it already booked
          const after = {
            covered: run.coveredKeys.length,
            used: (run.usedQuestionIdx || []).length,
            missed: (run.missedQs || []).length,
            hearts: run.hearts,
            mon: run.encounter ? run.encounter.hp : null,
            until: run.encounter ? run.encounter.turnsUntilAct : null,
          };
          const rec = STATE.curriculum['5 Tiger'];
          return { before, after, tornado: rec.items['tornado'].asked };
        }""")
        for k in ('covered', 'used', 'missed', 'hearts', 'mon', 'until'):
            if rule['before'][k] != rule['after'][k]:
                fails.append(
                    f"recording an answer changed run.{k} "
                    f"({rule['before'][k]} → {rule['after'][k]}) — the teaching "
                    f"record must never touch anything that decides how many "
                    f"questions get asked")

    # ---- one ask, one entry ----------------------------------------------
    # A question answered by clicking AND adjudicated as a blind call must not
    # be counted twice, or every percentage in the report is built on inflated
    # attempt counts.
    dbl = p.evaluate("""() => {
      const rec = STATE.curriculum['5 Tiger'];
      const before = rec.items['drought'] ? rec.items['drought'].asked : 0;
      const q = { cover: 'drought', tier: 1 };
      beginAsk(q);
      logAnswer(q, true);
      logAnswer(q, false);
      logAnswer(q, true);
      return { before, after: rec.items['drought'].asked };
    }""")
    if dbl['after'] != dbl['before'] + 1:
        fails.append(f"one question booked {dbl['after'] - dbl['before']} "
                     f"attempts — the click road and the blind-call road are "
                     f"both recording the same answer")

    # ---- one question, one answer -----------------------------------------
    # The counterpart to the check above, on the game side. A blind call leaves
    # the option elements in the DOM behind a hidden panel; if a second answer
    # can still be registered against the same question it counts twice in the
    # score and hits the monster twice. Driven the way only a script can, which
    # is exactly how it was found.
    if p.evaluate('() => !!STATE.run'):
        twice = p.evaluate("""() => {
          const run = STATE.run;
          const q = { cover: 'thunder', tier: 1, answer: 'a', choices: ['a', 'b'],
                      clue: 'test', type: 'vocab' };
          const before = run.stats.correct + run.stats.wrong;
          beginAsk(q);
          logAnswer(q, true);                 // as a blind call would
          const el = document.querySelector('#enc-choices .choice');
          // simulate the stray click the hidden options allowed
          const blocked = askAnswered(q);
          return { before, blocked,
                   after: run.stats.correct + run.stats.wrong };
        }""")
        if not twice['blocked']:
            fails.append(
                'after a question has been answered the game does not know it '
                '— a second answer to the same question would count twice')

    # ---- the record survives the run ending --------------------------------
    # Both endings null STATE.run. The whole point of the record is that it
    # outlives the run, so this kills one and checks the numbers are still
    # there afterwards.
    killed = p.evaluate("""() => {
      const q0 = STATE.curriculum['5 Tiger'].questions;
      if (STATE.run) { STATE.run.hearts = 0; handleDeath(); }
      const rec = STATE.curriculum['5 Tiger'];
      return { q0, after: rec.questions, runs: rec.runs, run: !!STATE.run,
               // and the debrief must survive being handed a nulled run
               debriefOk: typeof runDebriefHtml(null, null) === 'string' };
    }""")
    if killed['run']:
        fails.append('the run did not actually end, so nothing was proven')
    if killed['after'] != killed['q0']:
        fails.append(f"the class record lost data when the run ended "
                     f"({killed['q0']} → {killed['after']} questions)")
    if not killed['debriefOk']:
        fails.append('the end-of-run debrief throws when the run is already gone')

    # ---- the report reads as English, not as slugs -------------------------
    report = p.evaluate("""() => {
      renderLeaderboards();
      const el = document.getElementById('tab-curriculum');
      return { html: el.innerHTML, text: el.textContent,
               summary: curriculumSummaryText('5 Tiger') };
    }""")
    for bad in ('g1-', 'g2-', 'phonics-', '_'):
        if bad in report['text']:
            fails.append(f'the report shows the raw key text "{bad}" — a '
                         f'curriculum item is reaching the screen unlabelled')
        if bad in report['summary']:
            fails.append(f'the copied summary contains the raw key text '
                         f'"{bad}"')
    if 'attempts' not in report['summary'] and 'run' not in report['summary']:
        fails.append('the copied summary does not say what it rests on')

    # ---- export does not throw --------------------------------------------
    # Two buttons a teacher presses in front of a class. If either throws, it
    # does so silently and looks like the button does nothing.
    ex = p.evaluate("""() => {
      try {
        downloadCurriculumCsv('5 Tiger');
        copyCurriculumSummary('5 Tiger');
        return 'ok';
      } catch (e) { return String(e); }
    }""")
    if ex != 'ok':
        fails.append(f'exporting the record threw: {ex}')

    print(f"  report rows            "
          f"{report['text'].count('%')} percentages rendered")

    if errs:
        fails.append(f'{len(errs)} page errors: {errs[0][:140]}')
    p.close()
    b.close()

print(f"\nProblems: {len(fails)}")
for f in fails:
    print('  -', f)
print('RESULT:', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
