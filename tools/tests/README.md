# Tests

Two Playwright suites and one balance model. Run a local server from the game
root first:

    python3 -m http.server 8811

Then:

    python3 tools/tests/test_playthrough.py   # four accuracy levels, end to end
    python3 tools/tests/test_brace.py         # Brace blocks a blow
    python3 tools/tests/test_music.py         # the score plays, ducks, doesn't clip
    python3 tools/tests/test_announce.py      # the arena banner is readable
    python3 tools/tests/test_reachable.py     # no item exists that nothing can grant
    python3 tools/tests/test_events.py        # every event states both sides
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

**test_music.py** measures the actual audio output rather than trusting the
engine's own flags. Every piece must make a sound, none may clip, the Boss must
be the loudest thing in the game, and ducking must measurably drop the level.

It exists because two real bugs hid behind healthy-looking state: the bass line
was written below the master high-pass (so the score had no low end and the
Boss was the *quietest* piece), and the ducking gain sat before the compressor,
which handed back most of the level the duck removed. Both would have passed
any test that only asked "is a piece selected?".

A note on measuring audio: `MUSIC.level()` reads one analyser frame, so calling
it fifteen times in a tight loop reads the same frame fifteen times. Sample
with real waits between reads, and assert the precondition — an earlier draft
of this test measured its "un-ducked" baseline while the score was still
ducked, and reported a working duck as broken.

**test_announce.py** measures whether the combat narration can actually be read
from the back of a classroom: the banner must be at least 22px, within 4% of the
arena's centre line, inside the corridor, and still on screen two seconds after
it appears. It also fires a burst of four messages and requires that they queue
rather than overwrite each other, and asserts the old bottom-left line is no
longer rendered.

The dwell assertion is the point of the test. The first version of the banner
was large and perfectly centred and still failed the brief, because it vanished
after 2.2 seconds — "I can barely read it in time" is a timing complaint, not a
size one, and only a timed check catches it.

**test_reachable.py** is a static audit — no browser needed — and it exists so
that one specific class of bug cannot come back. v5.5 deleted six relics whose
ids appeared in `items.js` and nowhere else: the game handed children cards
with written promises and then did nothing. v5.7 found the same disease in two
more systems — all four enchantments were unreachable because `applyEnchant()`
was never called from anywhere, and gear was offered 0.58 times per run and
never stocked in a shop.

It fails if any relic, enchantment, weapon, armour or potion id is never read
outside `items.js`, if any grant function exists but is never called, or if the
shop stops stocking one of its three rows. Verified by planting a deliberately
dead relic and watching it fail.

**test_events.py** enforces the rule the v5.8 rewrite exists for: **every event
option must state both its cost and its reward before it is taken.** An option
with no consequence line fails the test, because that is a hidden gamble again
— which is exactly what the old 62/38 coin-flip events were.

It also statically forbids any event from touching monster HP or moving the
party between nodes (either would reduce the number of questions asked), sets
the party up so every conditional event can be forced, and plays a Riddle Gate
end to end to confirm a quiz event really does ask the questions it advertises.
