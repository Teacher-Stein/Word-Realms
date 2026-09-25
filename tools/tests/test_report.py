"""The teaching report's unit filter (v6.9).

WHY THIS SUITE EXISTS

The record is cumulative and flat: every question a class has ever answered,
keyed by curriculum item, in one table sorted weakest-first. With two realms
that was fine. Realm 3 made it 96 possible rows, and by Realm 9 it is 288 —
at which point the answer to "what do I reteach after today's lesson" is buried
under two months of other units.

So the report now filters by unit and OPENS on the one the class last played.
None of that is visible in a screenshot, and all of it is the kind of thing that
silently stops working: a filter that quietly returns everything looks exactly
like a filter that works, until a teacher plans a lesson from the wrong numbers.

THE ONE THAT WOULD ACTUALLY HURT

A filter that drops or double-counts rows. The check below adds the per-unit row
counts back up and requires them to equal the unfiltered total, so a key that
belongs to no unit (or to two) cannot hide.

The filter is derived at READ time from each realm's `coverKeys` rather than
stored in the record. That is what makes it work on records built months before
the feature existed — and it is also why `realmsForKey` has to be right, since
nothing else knows which unit an item came from.

No walker. The record is seeded directly and the functions and buttons are
called, so this suite cannot fail for reasons unconnected to what it measures.

Run the local server from the project root first:  python3 -m http.server 8811
"""
import sys
from playwright.sync_api import sync_playwright

URL = 'http://localhost:8811/index.html'

fails = []
checks = 0


def check(label, ok, detail=''):
    global checks
    checks += 1
    print(f"  {'ok  ' if ok else 'FAIL'}  {label}" + (f"   {detail}" if detail else ''))
    if not ok:
        fails.append(f"{label}{(' — ' + detail) if detail else ''}")


with sync_playwright() as pw:
    b = pw.chromium.launch()
    p = b.new_page(viewport={'width': 1366, 'height': 768})
    errs = []
    p.on('pageerror', lambda e: errs.append(str(e)))

    p.goto(URL)
    p.wait_for_timeout(400)
    p.evaluate('localStorage.clear()')
    p.reload()
    p.wait_for_timeout(700)

    # --- a class that has played three units, most recently Realm 3 ----------
    seeded = p.evaluate("""() => {
      setRoster('5REPORT', ['AN','BAO','CHI'], 'Reporters');
      const rec = classRecord('5REPORT');
      const put = (ids, asked, right) => ids.forEach(k => rec.items[k] = { asked, right });
      put(REALMS[1].coverKeys, 6, 3);
      put(REALMS[2].coverKeys, 5, 4);
      put(REALMS[3].coverKeys, 4, 2);
      rec.runs = 9; rec.questions = 300; rec.lastRealmId = 3;
      saveState();
      return { r1: REALMS[1].coverKeys.length,
               r2: REALMS[2].coverKeys.length,
               r3: REALMS[3].coverKeys.length,
               total: Object.keys(rec.items).length };
    }""")
    check('the seeded record holds all three units',
          seeded['total'] == seeded['r1'] + seeded['r2'] + seeded['r3'],
          str(seeded))

    # --- 1. does a key know which unit it came from? -------------------------
    print('\nwhich unit does an item belong to')
    keys = p.evaluate("""() => ({
      r1: realmsForKey(REALMS[1].coverKeys[0]),
      r3: realmsForKey(REALMS[3].coverKeys[0]),
      nonsense: realmsForKey('no-such-key-anywhere'),
      seen: realmsInRecord('5REPORT'),
    })""")
    check('a Realm 1 key reports realm 1', keys['r1'] == [1], str(keys['r1']))
    check('a Realm 3 key reports realm 3', keys['r3'] == [3], str(keys['r3']))
    check('an unknown key belongs to no unit', keys['nonsense'] == [], str(keys['nonsense']))
    check('the class shows as having met units 1, 2 and 3',
          keys['seen'] == [1, 2, 3], str(keys['seen']))

    # --- 2. the filter itself ------------------------------------------------
    print('\nthe filter')
    counts = p.evaluate("""() => ({
      all: curriculumRows('5REPORT').length,
      r1:  curriculumRows('5REPORT', 1).length,
      r2:  curriculumRows('5REPORT', 2).length,
      r3:  curriculumRows('5REPORT', 3).length,
      r3keys: curriculumRows('5REPORT', 3).map(r => r.key),
      r3only: curriculumRows('5REPORT', 3)
                .every(r => REALMS[3].coverKeys.includes(r.key)),
      groupsAll: curriculumGroups('5REPORT').length,
      groupsR3:  curriculumGroups('5REPORT', 3).length,
    })""")
    check('filtering to a unit returns fewer rows than all units',
          counts['r3'] < counts['all'], f"{counts['r3']} of {counts['all']}")
    check('every row in the Unit 3 view really is a Unit 3 item', counts['r3only'])
    # THE ONE THAT WOULD ACTUALLY HURT: a row that belongs to no unit, or to
    # two, would make a teacher's numbers wrong in a way nothing else shows.
    check('the three units add up to the unfiltered total — nothing lost or double-counted',
          counts['r1'] + counts['r2'] + counts['r3'] == counts['all'],
          f"{counts['r1']}+{counts['r2']}+{counts['r3']} vs {counts['all']}")
    check('groups are filtered too, not just rows',
          counts['groupsR3'] < counts['groupsAll'],
          f"{counts['groupsR3']} of {counts['groupsAll']}")

    # --- 3. the report opens on the unit just played -------------------------
    print('\nwhat opens')
    p.evaluate("renderCurriculum()")
    p.wait_for_timeout(300)
    opened = p.evaluate("""() => {
      const el = document.getElementById('tab-curriculum');
      const on = el.querySelector('.cur-tab.on');
      return { onTab: on ? on.textContent.trim() : null,
               tabs: [...el.querySelectorAll('.cur-tab')].map(t => t.textContent.trim()),
               tableRows: el.querySelectorAll('.cur-table tr').length - 1 };
    }""")
    check('the report opens on the unit the class last played',
          opened['onTab'] == 'Music', f"opened on {opened['onTab']!r}")
    check('there is one tab per unit met, plus All units',
          len(opened['tabs']) == 4 and opened['tabs'][-1] == 'All units',
          str(opened['tabs']))
    check('the table shows only that unit',
          opened['tableRows'] == counts['r3'],
          f"{opened['tableRows']} rows, expected {counts['r3']}")

    # --- 4. the tabs actually do something -----------------------------------
    print('\nthe tabs')
    p.evaluate("""() => [...document.querySelectorAll('.cur-tab')]
        .find(t => t.textContent.trim() === 'All units').click()""")
    p.wait_for_timeout(300)
    allview = p.evaluate("""() => {
      const el = document.getElementById('tab-curriculum');
      const on = el.querySelector('.cur-tab.on');
      return { onTab: on ? on.textContent.trim() : null,
               tableRows: el.querySelectorAll('.cur-table tr').length - 1 };
    }""")
    check('clicking All units widens the table',
          allview['tableRows'] == counts['all'],
          f"{allview['tableRows']} rows, expected {counts['all']}")
    check('the clicked tab is the one highlighted',
          allview['onTab'] == 'All units', str(allview['onTab']))

    p.evaluate("""() => [...document.querySelectorAll('.cur-tab')]
        .find(t => t.textContent.trim() === 'Extreme Weather').click()""")
    p.wait_for_timeout(300)
    r1view = p.evaluate("""() => document.getElementById('tab-curriculum')
        .querySelectorAll('.cur-table tr').length - 1""")
    check('clicking a different unit narrows it again',
          r1view == counts['r1'], f"{r1view} rows, expected {counts['r1']}")

    # --- 5. the exports follow what is on screen -----------------------------
    #
    # A teacher who has filtered to one unit and then downloads the whole year
    # has been handed the wrong file, and no way to tell until they open it.
    print('\nexports follow the filter')
    exp = p.evaluate("""() => {
      const t3 = curriculumSummaryText('5REPORT', 3);
      const tAll = curriculumSummaryText('5REPORT', null);
      const rows3 = curriculumRows('5REPORT', 3);
      // Compare the ITEM LINES, not the whole text.
      //
      // The first version of this check asked whether any Realm 1 label
      // appeared anywhere in the Unit 3 summary, and failed on the word
      // "plan" - which is a Realm 1 curriculum item AND a word in this
      // summary's own footer about lesson plans. The filter was perfect; the
      // assertion was measuring a proxy for it. Count the thing you mean.
      const listed = t3.split('\\n')
        .map(l => l.match(/^\\s*\\d+%\\s+(.+?)\\s+\\(\\d+\\/\\d+\\)/))
        .filter(Boolean).map(m => m[1]);
      const r1labels = new Set(curriculumRows('5REPORT', 1).map(r => r.label));
      return { t3Head: t3.split('\\n')[1],
               tAllHead: tAll.split('\\n')[1],
               t3NamesUnit: t3.includes('Music'),
               tAllNamesAll: tAll.includes('all units'),
               listed: listed.length,
               t3Clean: listed.length > 0 && !listed.some(l => r1labels.has(l)),
               leaked: listed.filter(l => r1labels.has(l)) };
    }""")
    check('a filtered summary names its unit in the heading',
          exp['t3NamesUnit'], exp['t3Head'])
    check('an unfiltered summary says so', exp['tAllNamesAll'], exp['tAllHead'])
    check('a Unit 3 summary lists only Unit 3 items',
          exp['t3Clean'],
          f"{exp['listed']} items listed, leaked: {exp['leaked']}")

    if errs:
        fails.append(f'{len(errs)} page errors: {errs[0][:160]}')
    p.close()
    b.close()

# The floor. Without it a suite that fell over early would report a contented
# pass, which is the fault this project has shipped more than once.
if checks < 17:
    fails.append(f'only {checks} of 17 checks ran — the suite tested almost nothing')

print(f"\nChecks run: {checks}")
print(f"Problems: {len(fails)}")
for f in fails:
    print('  -', f)
print('RESULT:', 'PASS' if not fails else 'FAIL')
sys.exit(1 if fails else 0)
