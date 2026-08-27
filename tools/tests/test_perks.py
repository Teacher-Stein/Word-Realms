"""Does each hero's perk actually do the thing the card promises?

This suite exists because of a pattern that has now bitten three times. Brace
was dead for two versions. The enchantment system was dead from the day it was
written. Realm 2's art paths could not be told apart from stand-ins. All three
passed every test that existed, because no test pressed their button.

A hero perk is exactly that shape of hazard. It is one line inside a grant()
that runs once, at a screen nobody looks at twice, and if it silently does
nothing the game still plays perfectly well - it is just quietly a worse game,
and nobody finds out for six versions.

So: pick each hero, start a run, and check the claimed effect against STATE.

The Phonics Ranger gets the most attention here, for two reasons.

  1. Her perk is the only one that is not a one-time gift of an object. It is a
     change to the combat clock, which means it has to be read correctly by
     makeMonster on every single monster, and a typo would just look like
     ordinary variance.

  2. It is the perk most likely to break RULE ONE. Her bonus lengthens the
     monster's countdown, and anything that touches the monster's clock is one
     careless edit away from also touching its HP - which WOULD shorten fights
     and cut the number of questions asked. So this checks the monster's HP is
     untouched as explicitly as it checks the countdown.

Her bonus is deliberately OPENING-ONLY: the first swing of each fight is late,
then the monster settles into its normal rhythm. A permanent bonus was tried
first and balance_sim.js killed it - it compounded with fight length, so it was
worth almost nothing in a short skirmish and a great deal in a boss, which is
where runs are actually lost. The last check below is what stops anyone quietly
promoting it back to permanent: after the monster's first attack, its countdown
must reset to the plain cadence with no bonus on it.

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
    for _ in range(10):
        if p.query_selector('#popup-layer.open'):
            try:
                p.click('#popup-continue', timeout=800)
                p.wait_for_timeout(200)
                continue
            except Exception:
                break
        break


def start_run(p, hero_id):
    """Fresh save, roster, realm 1, the named hero, into the map."""
    p.goto(URL)
    p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()')
    p.reload()
    p.wait_for_timeout(700)
    p.click('#btn-roster')
    p.wait_for_timeout(250)
    p.fill('#roster-class', '5P')
    p.fill('#roster-party', 'Perks')
    p.fill('#roster-names', 'STEIN\nMINH\nLAN')
    p.click('#roster-save')
    p.wait_for_timeout(400)
    rc = p.query_selector('#roster-close')
    if rc and rc.is_visible():
        rc.click()
        p.wait_for_timeout(400)
    p.click('.realm-card:not(.locked)')
    p.wait_for_timeout(700)
    # Select THIS hero, not whichever card happens to be first on the screen.
    # pickHero() is what the card's own click handler calls, so this goes
    # through the same door a student does.
    p.evaluate("(id) => pickHero(id)", hero_id)
    p.wait_for_timeout(300)
    p.click('#hero-confirm')
    p.wait_for_timeout(900)
    drain(p)
    # And confirm the run that started is the one we asked for. Selecting the
    # wrong hero and then testing his perk would pass or fail for reasons that
    # have nothing to do with the code under test.
    return p.evaluate("(id) => !!STATE.run && STATE.run.heroId === id", hero_id)


def walk_to_fight(p, budget=150):
    """Steer toward a fight rather than wandering.

    A random walk found one about half the time, and a suite that fails for
    reasons unconnected to what it measures is worse than no suite at all.
    """
    for _ in range(budget):
        drain(p)
        if vis(p, '#btn-move-on'):
            try:
                p.click('#btn-move-on', timeout=800)
                p.wait_for_timeout(300)
            except Exception:
                pass
        # run.encounter IS the monster object - see main.js `run.encounter = m`.
        if p.evaluate("!!(STATE.run && STATE.run.encounter && "
                      "typeof STATE.run.encounter.cadence === 'number')"):
            return True
        if vis(p, '#enc-stake-gate'):
            try:
                p.click('#enc-stake-gate .sg-safe', timeout=1200)
                p.wait_for_timeout(250)
            except Exception:
                pass
            continue
        clicked = p.evaluate("""() => {
          const ns = [...document.querySelectorAll('.map-node.reachable')];
          if (!ns.length) return false;
          const fight = ns.find(n => /fight|elite/i.test(n.textContent || ''));
          (fight || ns[0]).click();
          return true;
        }""")
        if clicked:
            p.wait_for_timeout(650)
            continue
        for s in ('#rest-mend', '#shop-leave', '#event-a', '#treasure-open'):
            if vis(p, s):
                try:
                    p.click(s, timeout=800)
                    p.wait_for_timeout(400)
                except Exception:
                    pass
                break
        else:
            p.wait_for_timeout(320)
    return False


def hero_in_fight(p, hero_id, tries=3):
    """Start a run as this hero and get it into a fight.

    Retried, because a run can legitimately end without one being reachable -
    the party can be wiped by a wrong answer at a stake gate, or the walk can
    arrive at the boss having taken a lane of campfires and shops. Neither is a
    fault in the perk under test, and a suite that reports one as a failure is
    the kind of harness that costs an evening chasing a regression that was
    never there. What is NOT retried is a genuinely bad result: the checks
    below run once, on the fight this finds.
    """
    for attempt in range(tries):
        if not start_run(p, hero_id):
            continue
        if walk_to_fight(p):
            return True
        where = p.evaluate("""() => {
          const s = document.querySelector('.screen.active');
          return (s ? s.id : 'none') + ' / ' + [...document.querySelectorAll(
            'button:not([disabled])')].filter(b => b.offsetParent)
            .map(b => b.id || b.className).slice(0, 6).join(',');
        }""")
        print(f"  {hero_id:<10} attempt {attempt + 1} reached no fight "
              f"— stalled on {where}")
    return False


with sync_playwright() as pw:
    b = pw.chromium.launch(args=['--no-sandbox'])
    p = b.new_page(viewport={'width': 1366, 'height': 768})
    errs = []
    p.on('pageerror', lambda e: errs.append(str(e)))

    # ---- the three one-time gifts -----------------------------------------
    # Each of these is a single line inside a grant(). Reading STATE straight
    # after the run starts is the whole test: did the object arrive.
    GIFTS = [
        ('wordsmith', 'begins with a free relic',
         "STATE.run.relics.length >= 1"),
        ('knight', 'begins armoured with 3 shields on top of the start',
         "STATE.run.shields >= CONFIG.START_SHIELDS + 3"),
        ('scholar', 'begins with two potions',
         "STATE.run.potions.length >= 2"),
    ]
    for hero_id, claim, probe in GIFTS:
        if not start_run(p, hero_id):
            fails.append(f'{hero_id}: could not start a run as this hero')
            continue
        got = p.evaluate(f"() => !!({probe})")
        state = p.evaluate("() => ({relics: STATE.run.relics.length, "
                           "shields: STATE.run.shields, "
                           "potions: STATE.run.potions.length})")
        print(f"  {hero_id:<10} relics {state['relics']} · "
              f"shields {state['shields']} · potions {state['potions']}")
        if not got:
            fails.append(f'{hero_id}: the card says it "{claim}" and it did not '
                         f'— run started as {state}')

    # ---- the Phonics Ranger ------------------------------------------------
    # Her perk is a change to the combat clock, so it has to be caught in a
    # real fight rather than read off the run object.
    for hero_id, want_bonus in (('ranger', 1), ('knight', 0)):
        if not hero_in_fight(p, hero_id):
            fails.append(f'{hero_id}: three runs ended without reaching a '
                         f'fight, so nothing was measured')
            continue
        m = p.evaluate("""() => {
          const m = STATE.run.encounter;
          return { cadence: m.cadence, until: m.turnsUntilAct,
                   hp: m.hp, maxHp: m.maxHp, name: m.name };
        }""")
        opening = m['until'] - m['cadence']
        print(f"  {hero_id:<10} {m['name']}: cadence {m['cadence']}, "
              f"opening countdown {m['until']} (bonus {opening}), "
              f"hp {m['hp']}/{m['maxHp']}")

        if opening != want_bonus:
            fails.append(
                f"{hero_id}: the monster's opening countdown is "
                f"{m['until']} against a cadence of {m['cadence']} — a bonus "
                f"of {opening} where {want_bonus} was expected")

        # RULE ONE. Her perk touches the monster's clock, and a clock and an HP
        # pool sit four lines apart in makeMonster(). If an edit ever lets the
        # perk reach the HP as well, fights get shorter and the game asks fewer
        # questions - the one thing it must never do.
        #
        # The expected HP has to be worked out properly rather than compared to
        # CONFIG.MONSTER_HP, because variants legitimately move it: a "Lesser"
        # sprite really does have less HP, and an early version of this check
        # cried wolf over one.
        want_hp = p.evaluate("""() => {
          const m = STATE.run.encounter;
          const ramp = realmRamp();
          return CONFIG.MONSTER_HP + ramp.monsterHp
               + (m.variant ? m.variant.hpBonus : 0);
        }""")
        if m['maxHp'] != m['hp']:
            fails.append(f"{hero_id}: monster arrived pre-damaged "
                         f"({m['hp']}/{m['maxHp']})")
        if m['maxHp'] != want_hp:
            fails.append(
                f"{hero_id}: {m['name']} has {m['maxHp']}hp where the realm and "
                f"its variant call for {want_hp} — something is changing how "
                f"long a fight lasts, which changes how many questions it asks")

    # ---- the bonus must not survive the first attack ------------------------
    # This is the check that stops opening-only being quietly promoted back to
    # permanent. balance_sim.js showed a permanent version cut the wipe rate by
    # 28 points against the Knight's 3, which would make the Ranger the correct
    # pick every time all over again.
    if not fails:
        if hero_in_fight(p, 'ranger'):
            after = p.evaluate("""() => {
              const m = STATE.run.encounter;
              const before = m.turnsUntilAct;
              // Drive the clock past the monster's first action without
              // touching HP, then read where the countdown resets to.
              for (let i = 0; i < 40 && m.turnsUntilAct > 0; i++) tickMonsterClock(m);
              monsterTakeTurn(m);
              const m2 = STATE.run.encounter;
              return { before, cadence: m2.cadence, reset: m2.turnsUntilAct };
            }""")
            print(f"  ranger     opening {after['before']} → after its first "
                  f"attack the countdown resets to {after['reset']} "
                  f"(cadence {after['cadence']})")
            if after['reset'] > after['cadence']:
                fails.append(
                    f"ranger: after its first attack the countdown reset to "
                    f"{after['reset']} against a cadence of "
                    f"{after['cadence']} — her bonus is permanent, not "
                    f"opening-only, and balance_sim says that makes her the "
                    f"only sensible pick")
        else:
            fails.append('ranger: could not set up the reset check')

    if errs:
        fails.append(f'{len(errs)} page errors: {errs[0][:120]}')
    p.close()
    b.close()

print(f"\nProblems: {len(fails)}")
for f in fails:
    print('  -', f)
print('RESULT:', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
