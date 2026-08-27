"""Does the Chorus do what it exists to do, without breaking the rules?

The Chorus is the one room where the whole class answers at once. It exists for
RULE ONE: an ordinary question is answered by one child in twenty-four, and this
one is answered by all of them.

The four things worth pressing:

  IT ADDS QUESTIONS. The Chorus took its place on the map out of `safe` and
  `treasure`, which lowers the share of fights. If the total ever fell it would
  be a rule-one break dressed as a feature, so this counts what a Chorus room
  actually asks.

  IT CANNOT COST A HEART. Making a whole class wrong together hurt would teach
  them to dread the one room designed to get everyone answering. Not "should
  not" - CANNOT, at every one of the three judgements.

  IT REACHES THE TEACHING RECORD, AND SAYS IT WAS A CHORUS. A whole-class check
  is better evidence than one child's guess, and the report reads the levels
  back. If they were not stored, the report would silently be reading nothing.

  THE BOSS DEMANDS ONE, ONCE. At half health, and only at half health. A Chorus
  that fired every question would stall the finale; one that fired never would
  be a feature nobody ever sees.

Run the local server from the project root first:  python3 -m http.server 8811
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'
CLASS = '5 Chorus'
fails = []


def drain(p):
    for _ in range(10):
        if p.query_selector('#popup-layer.open'):
            try:
                p.click('#popup-continue', timeout=800)
                p.wait_for_timeout(200)
                continue
            except Exception:
                break
        break


def start(p):
    p.goto(URL)
    p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()')
    p.reload()
    p.wait_for_timeout(700)
    p.click('#btn-roster')
    p.wait_for_timeout(250)
    p.fill('#roster-class', CLASS)
    p.fill('#roster-party', 'Voices')
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


def run_chorus(p, levels):
    """Walk one Chorus room, judging each question at the given level."""
    p.evaluate('() => enterChorusRoom()')
    p.wait_for_timeout(500)
    drain(p)
    p.wait_for_timeout(200)
    judged = 0
    for lvl in levels:
        if not p.evaluate("() => { const j = document.getElementById('cho-judge');"
                          " return !!(j && j.offsetParent); }"):
            break
        p.click(f'#cho-judge .pixel-btn[data-level="{lvl}"]')
        p.wait_for_timeout(380)
        judged += 1
        p.click('#cho-next')
        p.wait_for_timeout(420)
    drain(p)
    p.wait_for_timeout(250)
    return judged


with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--no-sandbox'])
    p = b.new_page(viewport={'width': 1366, 'height': 768})
    errs = []
    p.on('pageerror', lambda e: errs.append(str(e)))
    start(p)

    want = p.evaluate('() => CONFIG.CHORUS_QUESTIONS')

    # ---- it cannot cost a heart, at ANY judgement --------------------------
    # Run a whole room at the worst possible outcome. If a heart can be lost
    # here at all, this is where it happens.
    before = p.evaluate("() => ({ hearts: STATE.run.hearts, "
                        "shields: STATE.run.shields, "
                        "q: STATE.run.answerLog.length })")
    judged = run_chorus(p, ['poor'] * want)
    after = p.evaluate("() => ({ hearts: STATE.run.hearts, "
                       "shields: STATE.run.shields, "
                       "q: STATE.run.answerLog.length, "
                       "screen: (document.querySelector('.screen.active')||{}).id })")
    print(f"  worst-case room: judged {judged}/{want} · hearts "
          f"{before['hearts']} -> {after['hearts']} · questions "
          f"+{after['q'] - before['q']}")

    if judged != want:
        fails.append(f'a Chorus room offered {judged} questions, not the '
                     f'{want} it is configured for')
    if after['q'] - before['q'] != want:
        fails.append(f"a Chorus room added {after['q'] - before['q']} questions "
                     f"to the record, not {want} — the whole point of the room "
                     f"is that it asks more, not fewer")
    if after['hearts'] < before['hearts']:
        fails.append(f"the class lost a heart in a Chorus ({before['hearts']} "
                     f"-> {after['hearts']}). A room that cannot be won must "
                     f"not be a room that can be lost, or a class learns to "
                     f"avoid the one place everybody answers")
    if after['screen'] != 'screen-map':
        fails.append(f"after a Chorus the game was on {after['screen']}, not "
                     f"back on the map")

    # ---- the shields rule --------------------------------------------------
    # A perfect Chorus must not hand out armour. balance_sim measured ONE shield
    # per clean answer at eight points of painless-fight rate, in a room that
    # cannot cost a heart - a quiet difficulty softening, which RULE THREE
    # forbids. This is the guard on that finding.
    pre = p.evaluate("() => STATE.run.shields")
    run_chorus(p, ['good'] * want)
    post = p.evaluate("() => STATE.run.shields")
    print(f"  perfect room: shields {pre} -> {post} (must not rise)")
    if post > pre:
        fails.append(f"a perfect Chorus handed out {post - pre} shields. It "
                     f"cannot cost a heart, so paying it in armour softens the "
                     f"whole game — balance_sim puts one shield per answer at "
                     f"eight points of painless-fight rate")

    # ---- the record, and that it knows these were choral --------------------
    run_chorus(p, ['good', 'half', 'poor'][:want])
    rec = p.evaluate("""(cls) => {
      const r = STATE.curriculum[cls];
      const withChoral = Object.entries(r.items).filter(([, i]) => i.choral);
      return {
        items: withChoral.length,
        totals: withChoral.reduce((a, [, i]) => ({
          asked: a.asked + i.choral.asked,
          good: a.good + (i.choral.good || 0),
          half: a.half + (i.choral.half || 0),
          poor: a.poor + (i.choral.poor || 0),
        }), { asked: 0, good: 0, half: 0, poor: 0 }),
        tagged: STATE.run.answerLog.filter(a => a.choral).length,
        logged: STATE.run.answerLog.length,
      };
    }""", CLASS)
    print(f"  record: {rec['items']} items carry choral data · "
          f"{rec['totals']}")
    if rec['totals']['asked'] != want * 3:
        fails.append(f"{rec['totals']['asked']} choral attempts reached the "
                     f"class record after three rooms of {want} — the report "
                     f"would be reading an incomplete picture")
    if rec['totals']['good'] < 1 or rec['totals']['poor'] < 1:
        fails.append(f"the record did not keep the three levels apart: "
                     f"{rec['totals']}")
    if rec['tagged'] != rec['logged']:
        fails.append(f"{rec['logged'] - rec['tagged']} answers this run are not "
                     f"marked as choral, but every one of them came from a "
                     f"Chorus")

    # ---- the boss demands one, once ---------------------------------------
    # Driven straight to half health rather than fought there: what matters is
    # that the Chorus fires at the threshold and never again, not how the boss
    # got to half.
    boss = p.evaluate("""() => {
      startBoss();
      const m = STATE.run.boss;
      const fired = [];
      // Walk the boss down, asking a question at each step, and note every
      // point at which the Chorus takes over.
      for (let hp = m.maxHp; hp >= 1; hp--) {
        STATE.run.boss.hp = hp;
        CHORUS = null;
        askBossQuestion();
        if (CHORUS) { fired.push(hp); finishChorus(); }
      }
      return { maxHp: m.maxHp, fired, want: CONFIG.CHORUS_BOSS_QUESTIONS,
               half: Math.ceil(m.maxHp / 2) };
    }""")
    print(f"  boss ({boss['maxHp']}hp, half = {boss['half']}): Chorus fired at "
          f"hp {boss['fired']}")
    if len(boss['fired']) != 1:
        fails.append(f"the boss Chorus fired {len(boss['fired'])} times "
                     f"(at hp {boss['fired']}). Once is the design: every "
                     f"question would stall the finale, never would be a "
                     f"feature nobody sees")
    elif boss['fired'][0] > boss['half']:
        fails.append(f"the boss Chorus fired at {boss['fired'][0]}hp, before "
                     f"the half-health mark of {boss['half']}")

    if errs:
        fails.append(f'{len(errs)} page errors: {errs[0][:140]}')
    p.close()
    b.close()

print(f"\nProblems: {len(fails)}")
for f in fails:
    print('  -', f)
print('RESULT:', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
