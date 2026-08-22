# Tests

Two Playwright suites and one balance model. Run a local server from the game
root first:

    python3 -m http.server 8811

Then:

    python3 tools/tests/test_playthrough.py   # four accuracy levels, end to end
    python3 tools/tests/test_brace.py         # Brace blocks a blow
    node    tools/tests/balance_sim.js        # wipe rates, questions per run

## What each one is guarding

**test_playthrough.py** plays four full runs at 99%, 92%, 82% and 58%
accuracy. Beyond "does it crash" it checks two invariants on every question:

- the intent countdown on screen matches the monster's real `turnsUntilAct`
  (the v5.2 bug was an off-by-one that made the warning arrive after the
  decision it was meant to inform)
- RISKY never hides the options on a selection-only question — nothing in this
  game may hide the correct answer from a student who knows it

**test_brace.py** forces the exact moment the clock is about to fire, presses
Brace, answers correctly, and requires that nothing is lost. It drives cadence
1 explicitly, because that is the case that broke.

Brace was shipped broken and no automated run caught it, for one reason: no
harness had ever pressed the button. If you add a mechanic, add the test that
presses it — a suite that only exercises the happy path will pass forever
while a feature does nothing at all.

**balance_sim.js** runs 2,500 simulated runs per configuration against the real
`config.js`, `content.js` and `mapgen.js`. It reports wipe rate by accuracy,
questions per run, and what share of damage comes from wrong answers rather
than the monster's clock. Change a number in `config.js` and run this before
believing the change is an improvement.

Note that it excludes relics, potions and shop purchases, so it reads harsher
than the real game. Use it for comparing configurations, not for predicting
what one class will do.
