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
    python3 tools/tests/test_art.py           # every sprite exists, fits and reads
    python3 tools/tests/test_sheet_split.py   # no creature can leak into its neighbour
    python3 tools/tests/shot_realm2.py        # Realm 2's art in a real browser
    node    tools/tests/check_content.js      # every realm's question bank is sound
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

**check_content.js** validates every `ready` realm's question bank before a
class sees it. It catches the errors a human makes writing a hundred questions
in one sitting, all of which are invisible until a child is standing in front
of the TV: an answer that is not among its own choices, a distractor that is
the answer with an article stripped, a missing `open` flag, a tier outside 1-4,
a curriculum item with only one question, a key with no elite version, two
identical questions, and a thin blind-call pool.

The subtlest check is the `open` one, and it took two passes to get right.
A question tagged `open` must be answerable from the clue alone. The first
version flagged any clue containing "which one", which wrongly condemned
*"'Resemble' and 'imitate' are close. Which one means only to LOOK like
something?"* — perfectly answerable aloud, because the clue names both
candidates. The rule is now: flag a clue that points at the options **and** does
not contain the answer. Verified by planting a genuinely unanswerable question
and confirming it is still caught.


**test_art.py** is the art half of test_reachable.py. Realm 2 shipped in v5.9
with all seventeen sprite paths pointing at Realm 1's cast as documented
stand-ins, and nothing in the suite could tell a deliberate stand-in from a
path someone forgot to swap. This one fails if a sprite or backdrop is missing,
if a ready realm borrows another realm's art, if two realms share a file, if
the chroma key left magenta behind, if a sprite falls outside the size band the
arena is built for — or if a backdrop is BRIGHTER than the heroes standing on
it. That last check is not decoration: the party is 59-75 luminance points
brighter than the room everywhere in Realm 1, and that is what makes four small
figures readable across a classroom. Realm 2's sunlit forest arrived at
luminance 117 against a hero at 85 and inverted it. It was invisible as a
problem on a laptop and would have been obvious on a TV in week one.

**shot_realm2.py** walks Realm 2 in a real browser and photographs every
monster it meets, checking rendered aspect against the art's true aspect.
test_art.py can only prove the files are right; sprite sizing happens at
runtime in `sizeSprite()` off `naturalWidth`, which is how the Hurricane Titan
shipped 58% too wide. It requires at least four distinct monsters before it
will report PASS — an earlier draft used the wrong option selector, answered
nothing, walked one room and printed PASS with a completely empty result.

## A note on flaky harnesses

While wiring Realm 2's art in, test_brace.py failed three times in a row on a
change that touched nothing but sprite paths and a backdrop table. Two hours
went into bisecting a regression that did not exist. The cause was in the
harness: Brace is `display:none` in every non-combat room and is only re-shown
when the encounter screen renders, and the test sampled the button the instant
`reach_fight()` returned — so under CPU load it read the previous room's state.
It now waits for the button, and reports separately whether Brace never became
visible or stayed disabled.

The lesson sits next to the one above it. A test that only fails when the
machine is busy is worse than no test, because it teaches you to disbelieve the
suite. If a test fails, reproduce it on a quiet machine before believing it —
and if it passes there, fix the harness rather than shrugging.


**test_sheet_split.py** (v6.1) presses the art splitter with a synthetic sheet
containing the exact trap that shipped five contaminated sprites in v6.0: two
creatures where one has a spur lying inside the other's bounding box, plus a
deliberately detached fleck of its own. It asserts that no neighbour leaks in
AND that intentional detached pieces survive.

Auditing the finished PNGs cannot catch this, which is why the test is on the
splitter and not the output. Several creatures have floating pieces on purpose
— the Hollow Fox sheds leaves, the Ashwing trails ash — so "sprite contains an
island" is not a bug. Colour tells you nothing either: everything is quantised
to one shared palette, and a grey beak inside a green cat measured 8.1 units
from the cat's own colours against a legitimate leaf at 3.6.

The fixture also earned its keep immediately. The first fix assigned stray
pixels to the nearest creature one pixel at a time, which looked equivalent and
was not — a piece lying between two creatures got sliced down the middle, 72
pixels one way and the rest the other. Whole islands are assigned together now.

## What changed in the suite for v6.1

- `test_playthrough.py` no longer counts Focus. It now presses the **Distracted
  button** roughly once every twelve questions and fails if the question count
  on screen drops — that button must never eat the question it was pressed on.
- `balance_sim.js` no longer models Focus or streaks, and reads the monster
  clock from `CONFIG.MONSTER_CADENCE` rather than from each monster.
- `test_announce.py` needed no change despite the screen flipping, because it
  measures the banner against the arena rather than against the viewport.

The playthrough suite also caught a crash that the author introduced in this
same build: the Distracted button could land the killing blow while another
timer was already resolving one, and `handleRunDeath()` ran twice on a run that
no longer existed. That is the suite doing its job — but note that it was only
caught because a test presses that button. Nothing else would have found it.
