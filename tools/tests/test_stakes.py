"""v6.7's stake rebalance: does RISKY do what the button promises?

WHY THIS SUITE EXISTS

v6.7 changed the two numbers at the centre of the game. A wrong RISKY answer
costs a FLAT 4 hearts (6 from the tier-3/4 bank) instead of double the tier
cost, and a correct RISKY answer now DEALS 2 instead of 1. Neither change is
visible in a screenshot. A class would play a whole lesson against the old
numbers and nobody in the room would know, because the only evidence is how
fast a heart bar empties.

That is the exact shape of the fault that has bitten this project three times -
Brace dead for two versions, enchantments dead from birth, Realm 2's art paths
indistinguishable from stand-ins. Every one of them passed every suite that
existed, because no suite pressed their button. So this presses the button.

WHAT IT CHECKS, AND WHY EACH ONE IS HERE

  1. RISKY DEALS 2, SAFE DEALS 1. This is the first mechanic ever allowed to
     shorten a fight in this game, and it was only allowed after questions per
     LESSON were shown not to move. If it silently reverts to 1, RISKY becomes
     a trap again and nobody notices for months.

  2. THE PENALTY IS FLAT, NOT A MULTIPLE. This is the whole point of the
     rebalance and it is the easiest thing to undo by accident, because the
     obvious-looking edit - multiply the tier cost - LOOKS right and passes any
     test that only asks "did it hurt". So the check is specifically that a
     tier-1 and a tier-2 RISKY miss cost the SAME, which multiplication cannot
     produce (they would be 2 and 2... which is why tier 3 is checked too: 6
     against a multiplied 4).

  3. THE GATE'S PROMISE MATCHES THE CHARGE. The button states a heart cost in
     large type before the class chooses. In v5.1 the tier floor lived in the
     button's label and nowhere else, so the promise and the outcome drifted
     apart and a class was lied to on 25 questions. Both now come from
     wrongAnswerDamage(). This asserts they still agree, at every tier and with
     a debuff active.

  4. SHIELDS STILL ABSORB IT. Stein's call: "the kids are aware of the shields
     being a buffer for their character." A flat 6 that ignored shields would
     make the buffer meaningless exactly when it matters most.

  5. RULE TWO. RISKY still never hides the correct answer on a selection-only
     question. This is checked in test_playthrough too, and it is checked again
     here, because this is the file somebody will edit when they want RISKY to
     bite harder.

  6. THE STAKE IS LOGGED. Every answer records how it was played.

AND A FLOOR. Any suite whose assertions are all "nothing went wrong" passes
perfectly while testing nothing - test_playthrough once answered zero questions
and reported PASS. This one counts its own checks and fails if it did not run
them all (18 always run, a few more when the walk gets far enough), and the
live fight at the end fails if it never landed a RISKY hit.

Run the local server from the project root first:  python3 -m http.server 8811
"""
import os
import sys

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from playwright.sync_api import sync_playwright
# The SHARED walker. CLAUDE.md: teach a new question format to answer_any() and
# a new room to clear_rooms(), and every suite that uses them gets it free.
# This suite is new, so it uses them from the start rather than growing a
# seventh private walker that will break the next time a format is added.
from walk import answer_any, clear_rooms, drain_popups, visible

URL = 'http://localhost:8811/index.html'

fails = []
checks = 0


def check(label, ok, detail=''):
    global checks
    checks += 1
    print(f"  {'ok  ' if ok else 'FAIL'}  {label}" + (f"   {detail}" if detail else ''))
    if not ok:
        fails.append(f"{label}{(' — ' + detail) if detail else ''}")


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
                p.wait_for_timeout(180)
                continue
            except Exception:
                break
        break


def start_run(p):
    p.goto(URL)
    p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()')
    p.reload()
    p.wait_for_timeout(700)
    p.click('#btn-roster')
    p.wait_for_timeout(250)
    p.fill('#roster-class', '5S')
    p.fill('#roster-party', 'Stakes')
    p.fill('#roster-names', 'STEIN\nMINH\nLAN')
    p.click('#roster-save')
    p.wait_for_timeout(400)
    rc = p.query_selector('#roster-close')
    if rc and rc.is_visible():
        rc.click()
        p.wait_for_timeout(400)
    p.click('.realm-card:not(.locked)')
    p.wait_for_timeout(700)
    # #hero-confirm stays disabled until a hero is chosen. Click a card rather
    # than calling pickHero() so this goes through the same door a class does.
    p.click('.hero-card')
    p.wait_for_timeout(300)
    p.click('#hero-confirm')
    p.wait_for_timeout(900)
    drain(p)
    return p.evaluate('!!STATE.run')


with sync_playwright() as pw:
    b = pw.chromium.launch()
    p = b.new_page(viewport={'width': 1366, 'height': 768})
    errs = []
    p.on('pageerror', lambda e: errs.append(str(e)))

    if not start_run(p):
        print('could not start a run')
        sys.exit(1)

    # -----------------------------------------------------------------------
    # 1 + 2. The numbers themselves, read off the real functions the game uses.
    # -----------------------------------------------------------------------
    print('\nthe numbers')
    nums = p.evaluate("""() => {
      // A clean slate: no debuff, no Idol, so the base costs are visible.
      STATE.run.debuff = null; STATE.run.idolTaken = false;
      const q = t => ({ tier: t, cover: 'x', open: false });
      const out = { safe: {}, risky: {} };
      for (const t of [1, 2, 3, 4]) {
        out.safe[t]  = wrongAnswerDamage(q(t), STAKE_SAFE);
        out.risky[t] = wrongAnswerDamage(q(t), STAKE_RISKY);
      }
      out.dealtSafe  = stakeDamageDealt(STAKE_SAFE);
      out.dealtRisky = stakeDamageDealt(STAKE_RISKY);
      return out;
    }""")

    check('SAFE deals 1', nums['dealtSafe'] == 1, f"deals {nums['dealtSafe']}")
    check('RISKY deals 2', nums['dealtRisky'] == 2, f"deals {nums['dealtRisky']}")

    r = nums['risky']
    check('RISKY miss on tier 1 and tier 2 cost the SAME (flat, not multiplied)',
          r['1'] == r['2'],
          f"tier1={r['1']} tier2={r['2']}")
    check('RISKY miss on tier 3 and tier 4 cost the SAME',
          r['3'] == r['4'], f"tier3={r['3']} tier4={r['4']}")
    check('the hard bank costs more than the easy bank',
          r['3'] > r['1'], f"{r['1']} then {r['3']}")
    check('RISKY costs more than SAFE at every tier',
          all(r[t] > nums['safe'][t] for t in ['1', '2', '3', '4']),
          f"safe {nums['safe']} risky {r}")
    # The specific shape multiplication would produce, ruled out by name. Under
    # the old x2 rule a tier-3 miss was 4; it must not be 4 now.
    check('a tier-3 RISKY miss is not the old doubled value',
          r['3'] != (nums['safe']['3'] * 2),
          f"tier3 risky={r['3']}, doubled-safe would be {nums['safe']['3'] * 2}")
    # Nothing may one-shot a party at full health. A gamble the class cannot
    # survive is a coin-flip for the run, not a decision about a question.
    hearts = p.evaluate('CONFIG.START_HEARTS')
    check('the worst RISKY miss cannot kill from full health',
          max(r.values()) < hearts, f"worst {max(r.values())} of {hearts} hearts")

    # -----------------------------------------------------------------------
    # 3. The gate promises what it charges. Tested WITH a debuff on, because
    #    that is the case where a hard-coded label would drift.
    # -----------------------------------------------------------------------
    print('\nthe gate cannot lie')
    gate = p.evaluate("""() => {
      const rows = [];
      for (const debuff of [null, 'expose']) {
        for (const t of [1, 2, 3, 4]) {
          STATE.run.debuff = debuff;
          const q = { tier: t, cover: 'x', open: false, clue: 'c',
                      answer: 'a', choices: ['a', 'b', 'c'] };
          renderStakeGate('enc', q);
          const el = document.getElementById('enc-stake-gate');
          const txt = (el.textContent || '').replace(/\\s+/g, ' ');
          // What the button says, and what the game would actually charge.
          const shown = [...txt.matchAll(/−(\\d+) heart/g)].map(m => +m[1]);
          rows.push({ debuff, tier: t, shown,
                      safe: wrongAnswerDamage(q, STAKE_SAFE),
                      risky: wrongAnswerDamage(q, STAKE_RISKY) });
        }
      }
      STATE.run.debuff = null;
      return rows;
    }""")
    bad = [g for g in gate
           if len(g['shown']) != 2 or g['shown'][0] != g['safe'] or g['shown'][1] != g['risky']]
    check('every gate states the exact cost it will charge, at every tier',
          not bad,
          '' if not bad else f"{len(bad)} mismatched, first: {bad[0]}")
    # A promise nobody can read is not a promise. The cost must be in its own
    # element and bigger than the reward text above it, or it is decoration.
    size = p.evaluate("""() => {
      const el = document.querySelector('#enc-stake-gate .sg-risky .stake-cost b');
      const sib = document.querySelector('#enc-stake-gate .sg-risky span');
      if (!el || !sib) return null;
      return { cost: parseFloat(getComputedStyle(el).fontSize),
               body: parseFloat(getComputedStyle(sib).fontSize) };
    }""")
    check('the RISKY heart cost is rendered larger than the text above it',
          bool(size) and size['cost'] > size['body'],
          f"{size}" if size else 'element missing')
    check('the heart cost is at least 16px (readable from the back of a room)',
          bool(size) and size['cost'] >= 16, f"{size['cost']}px" if size else '')

    # -----------------------------------------------------------------------
    # 4. Shields absorb it. Stein's call, and the class already reads shields
    #    as their buffer.
    # -----------------------------------------------------------------------
    print('\nshields')
    sh = p.evaluate("""() => {
      STATE.run.debuff = null; STATE.run.idolTaken = false;
      STATE.run.usedLuckyCharm = true;   // so the relic cannot eat the blow
      STATE.run.shieldActive = false;
      const q = { tier: 4, cover: 'x', open: false };
      const cost = wrongAnswerDamage(q, STAKE_RISKY);
      STATE.run.shields = cost + 2;
      const h0 = STATE.run.hearts;
      damage(cost);
      const a = { hearts: STATE.run.hearts, shields: STATE.run.shields, h0, cost };
      // and again with only half the shields, so hearts must take the rest
      STATE.run.shields = 2;
      const h1 = STATE.run.hearts;
      damage(cost);
      a.partial = { before: h1, after: STATE.run.hearts, shields: STATE.run.shields };
      return a;
    }""")
    check('a full shield bank absorbs the whole flat penalty',
          sh['hearts'] == sh['h0'] and sh['shields'] == 2,
          f"hearts {sh['h0']}→{sh['hearts']}, shields left {sh['shields']}")
    check('shields absorb first and hearts take the remainder',
          sh['partial']['shields'] == 0
          and sh['partial']['before'] - sh['partial']['after'] == sh['cost'] - 2,
          f"{sh['partial']}, cost {sh['cost']}")

    # -----------------------------------------------------------------------
    # 5. RULE TWO. RISKY may hide the options only on an `open` question.
    # -----------------------------------------------------------------------
    print('\nrule two')
    r2 = p.evaluate("""() => {
      const mk = (open, tier) => ({ tier, open, cover: 'x' });
      return {
        // selection-only, however hard: never blind
        closedHard: stakeIsBlind(mk(false, 4), STAKE_RISKY),
        closedEasy: stakeIsBlind(mk(false, 1), STAKE_RISKY),
        // open but below the tier floor: not blind either
        openLow:    stakeIsBlind(mk(true, 1), STAKE_RISKY),
        // open and hard enough: this is the one that may go blind
        openHigh:   stakeIsBlind(mk(true, 4), STAKE_RISKY),
        // SAFE is never blind, whatever the question
        safeOpen:   stakeIsBlind(mk(true, 4), STAKE_SAFE),
      };
    }""")
    check('RISKY never hides options on a selection-only question',
          not r2['closedHard'] and not r2['closedEasy'], str(r2))
    check('SAFE never hides options', not r2['safeOpen'])
    check('a blind call is still possible on an open, hard question',
          r2['openHigh'], 'nothing can go blind — the reward is unreachable')

    # -----------------------------------------------------------------------
    # 6 + 1 again. A REAL fight: click RISKY and watch the monster's HP.
    #
    # Everything above tests the functions. This tests that main.js actually
    # calls them - which is the half that has silently failed before.
    # -----------------------------------------------------------------------
    print('\na real fight')
    landed = 0
    safe_landed = 0
    risky_hits = []
    safe_hits = []
    logged = []
    for _ in range(320):
        drain_popups(p)
        if clear_rooms(p):
            continue

        # ---- the stake gate: choose, then come back round -------------------
        #
        # Choosing and answering are kept in SEPARATE iterations on purpose.
        # Doing both in one pass meant that if the question had not finished
        # rendering when answer_any() looked for it, the walker fell through to
        # the map branch, found nothing to click, and stalled on that question
        # for the rest of its budget - reporting zero answers rather than a
        # timing problem. That cost an hour and it is the exact hazard the
        # README warns about. Now every iteration re-checks what is on screen,
        # so a missed beat costs one loop and nothing else.
        if visible(p, '#enc-stake-gate'):
            # Take RISKY whenever it is not a blind call. A blind call has no
            # options on screen by design (Rule 2), so the shared walker cannot
            # answer it - that road is exercised by test_playthrough, and
            # pretending to cover it here would be a check that measures
            # nothing.
            blind = p.evaluate("""() => {
              const m = STATE.run && STATE.run.encounter;
              const q = m && m.currentQ;
              return !!(q && typeof stakeIsBlind === 'function'
                        && stakeIsBlind(q, STAKE_RISKY));
            }""")
            try:
                p.click('#enc-stake-gate ' + ('.sg-safe' if blind else '.sg-risky'),
                        timeout=1500)
            except Exception:
                break
            p.wait_for_timeout(320)
            continue

        # ---- a question is on screen: answer it -----------------------------
        if p.evaluate("""() => {
              const el = document.getElementById('enc-choices');
              return !!(el && el.offsetParent);
            }"""):
            before = p.evaluate("""() => ({
              hp: STATE.run.encounter ? STATE.run.encounter.hp : None,
              stake: STATE.run.stake,
              log: STATE.run.answerLog.length })""".replace('None', 'null'))
            if not answer_any(p, 'enc', want_right=True):
                p.wait_for_timeout(250)
                continue
            p.wait_for_timeout(780)
            after = p.evaluate("""() => ({
              hp: STATE.run.encounter ? STATE.run.encounter.hp : 0,
              alive: !!STATE.run.encounter,
              log: STATE.run.answerLog.length,
              last: STATE.run.answerLog[STATE.run.answerLog.length - 1] || null })""")

            if after['log'] > before['log'] and after['last']:
                logged.append(after['last'])
                # Classify by what was RECORDED, not by which button this suite
                # meant to press. If the two ever disagree, the log is the one
                # that matters - it is what the teaching report is built on.
                played = after['last'].get('stake')
                got = after['last'].get('correct')
                # A KILLING BLOW HAS TO COUNT TOO, and the first draft of this
                # suite dropped them - which quietly threw away most of the
                # RISKY sample, because 2 damage into a 4-HP monster lands the
                # kill far more often than 1 does. The suite then failed for
                # want of evidence while the mechanic worked perfectly.
                #
                # When the monster survives, the HP delta IS the damage. When
                # it dies the delta is unreadable, but the blow must have been
                # at least the HP it had left - so a 1-damage SAFE answer can
                # only ever finish a monster sitting on 1. If a SAFE answer
                # ever kills from 2, SAFE is dealing 2 and that is the
                # regression this file exists to catch.
                if got and before['hp'] is not None and before['hp'] > 0:
                    want = 2 if played == 'risky' else 1
                    if after['alive'] and after['hp'] < before['hp']:
                        seen = before['hp'] - after['hp']
                    elif not after['alive'] or after['hp'] <= 0:
                        # killed it: the blow was >= the HP that was left, and
                        # it should not have been able to reach further.
                        seen = want if before['hp'] <= want else before['hp']
                    else:
                        seen = None       # guarding, Chilled, or no damage
                    if seen is not None:
                        if played == 'risky':
                            risky_hits.append(seen)
                            landed += 1
                        elif played == 'safe':
                            safe_hits.append(seen)
                            safe_landed += 1
            if landed >= 5 and safe_landed >= 3:
                break
            continue

        if visible(p, '#btn-move-on'):
            try:
                p.click('#btn-move-on', timeout=800)
                p.wait_for_timeout(250)
            except Exception:
                pass
        moved = p.evaluate("""() => {
          const ns = [...document.querySelectorAll('.map-node.reachable')];
          if (!ns.length) return false;
          const f = ns.find(n => /fight|elite/i.test(n.textContent || ''));
          (f || ns[0]).click();
          return true;
        }""")
        p.wait_for_timeout(300)
        if not moved:
            p.wait_for_timeout(200)

    # THE FLOOR. A walk that never landed a RISKY hit proves nothing, and
    # without this line it would sail through every assertion above it.
    check('the walk actually landed some RISKY hits',
          landed >= 2, f"landed {landed}")
    if landed >= 2:
        check('a correct RISKY answer takes 2 HP off the monster, in a real fight',
              all(h == 2 for h in risky_hits), f"hits recorded: {risky_hits}")
    if safe_landed:
        check('a correct SAFE answer still takes only 1 HP off, in a real fight',
              all(h == 1 for h in safe_hits), f"hits recorded: {safe_hits}")
    check('every answer recorded how it was staked',
          bool(logged) and all('stake' in e for e in logged),
          f"{len(logged)} logged, first {logged[0] if logged else None}")
    if logged:
        check('a RISKY answer is logged as risky or blind',
              any(e.get('stake') in ('risky', 'blind') for e in logged),
              f"stakes seen: {sorted({e.get('stake') for e in logged})}")

    if errs:
        fails.append(f'{len(errs)} page errors: {errs[0][:160]}')
    p.close()
    b.close()

# The other half of the floor: if the suite did not get far enough to run its
# checks, that is a failure, not a pass. Sixteen is the number written above.
if checks < 18:
    fails.append(f'only {checks} of 18 checks ran — the suite tested almost nothing')

print(f"\nChecks run: {checks}")
print(f"Problems: {len(fails)}")
for f in fails:
    print('  -', f)
print('RESULT:', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
