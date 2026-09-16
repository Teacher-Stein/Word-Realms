# Word Realms — brief for the assistant taking this over

**You are reading a handover written by the assistant who built this.** The
person you are working with is a teacher. They are not going to program. They
will describe what they want, play the result with a class, and tell you what
felt wrong. Everything technical is yours.

Read this whole file before you touch anything. It is long because it contains
the things that are not visible in the code — what was tried and rejected, what
looked fine and was broken, and which four or five decisions are load-bearing.

---

## FILL THIS IN FIRST

Ask the teacher these before you write a line, and replace this block:

```
Subject and year group : ................  (e.g. Grade 4 Science, ages 9-10)
Their syllabus/textbook: ................
Unit they want first   : ................
Class sizes            : ................
One computer or many   : ................
```

Their answers change almost every question you will write. "Grade 4 Science,
second-language English, classes of 30" is a different game from "Year 9
History, first language, classes of 12".

---

## 1. What this is

A browser-based review game for a whole class. One computer, projected on the
board. The class walks a branching dungeon map; every room asks a question from
the teacher's syllabus. One student answers at a time, except in the Chorus,
where everybody does.

Vanilla HTML/CSS/JS. **No framework, no build step, no bundler, no
dependencies.** Open `index.html` and it runs, including from `file://`. That is
a hard constraint, not a preference — it runs on locked-down school computers
with no install rights and often no internet.

It ships with three units of Grade 5 English (Our World 5) as a worked example:
Realms 1 and 2 complete with their own artwork, Realm 3 written and playable
while it borrows Realm 1's cast. Realms 4–9 are locked placeholders.

---

## 2. Your first session

Do these in order. Do not skip to writing content.

1. **Ask the fill-in questions above.**
2. **Open the game and play a run.** Ten minutes. Everything below makes more
   sense afterwards, and you cannot judge a change to a game you have not seen.
3. **Open `tools/check-content.html`** so you know what a clean bank looks like.
4. **Read `js/config.js` top to bottom.** It is all the tuning, and the comments
   explain why each number is what it is.
5. **Then propose a plan** and get agreement before building. See §9.

---

## 3. The five rules that outrank everything

These are not style preferences. Each one came from a real lesson going wrong. A
change that breaks one is wrong even if it improves the game in every other way.
If the teacher asks for something that breaks one, say so and offer an
alternative — they will almost always agree once they see why.

**RULE 1 — Nothing may reduce the number of questions asked in a LESSON.**
Review volume is the entire point. The unit is the forty-five minutes, not the
run.

*This rule was rewritten in v6.7, and the old wording is worth knowing because
it is what you will find quoted in older comments.* It used to say "nothing may
shorten a fight", and it was measured per RUN. That was wrong, and being wrong
about it cost this project three years of design space. A class does not stop
when the party wipes — they pick a new hero and keep answering until the bell.
Measured against the clock instead of the run, at 85% accuracy, questions per
lesson sit at 41–42 across a difficulty range that takes the wipe rate from
almost never to almost always. Shortening a fight simply means more, shorter
runs.

So a mechanic **may** shorten a fight. What it may not do is end the lesson
early or stop the questions coming. Two things still protect that, and both are
load-bearing:

- **The boss is made of what the class did not cover.** Its HP is the count of
  untested curriculum keys. Shorter fights leave more keys untouched, so the
  boss grows to meet them — v6.7 took it from 9.3 to 13.4 HP without anyone
  tuning it. The questions are not lost, they are moved to the finale and asked
  at tier 4. If you ever cap or flatten that, Rule 1 loses its safety net.
- **Nothing may make a run unwinnable or unplayably short.** A class that wipes
  in four rooms every time answers fewer questions per lesson, because the
  restart costs about two and a half minutes of it.

**Measure this, do not assume it.** `node tools/tests/balance_sim.js` reports
questions per *lesson* in its first table, alongside distinct curriculum items —
watch both. The lesson model rests on an estimate of ~61s per question that has
not yet been checked against a real stopwatch; if that number moves, re-run
everything. One real cost of v6.7 is visible there and is not hidden: distinct
items per lesson went from 32 to 30 out of 32.

**RULE 2 — Nothing may hide or remove the CORRECT answer.** Removing a *wrong*
option is fine and several things do it. The RISKY stake escalates to answering
blind only on questions tagged `open: true`, where the clue alone tells you what
to say. Punishing a student who knew the answer is backwards for a review game.

**RULE 3 — Real failure is wanted.** Runs are meant to be losable — the target
moved to about **one in two** in v6.7, once Rule 1 stopped forbidding it. Do not
quietly soften the difficulty, and be suspicious when a change makes things
easier as a side effect — that has happened twice and neither time was
intentional. There is no "easy mode" and there will not be one. If a class needs
it gentler, `START_HEARTS` in `config.js` is the dial, it is documented there,
and it is the teacher's to turn.

**RULE 4 — Do not reproduce anyone's textbook.** Every question here was written
from scratch to test the same curriculum item in original words. Do the same.
This is the instruction you are most likely to drift on, especially if the
teacher pastes you a textbook page.

**RULE 5 — The teacher's passphrase is secret.** Never ask for it, never write
it into a file, never log it. It is stored as a SHA-256 hash. If they offer it,
tell them not to send it.

---

## 4. How the code is laid out

| Path | What's in it |
|---|---|
| `js/config.js` | **All tuning.** Hearts, monster HP, rewards, stakes, Chorus payouts, the per-realm ramp. Change numbers here, never in the logic. |
| `js/content.js` | Realms 1–2: questions, labels, monsters, elites, bosses, guides. The biggest file. |
| `js/realm3.js` | Realm 3 (Unit 3, Music) — a whole unit in one file, via `registerRealm()`. The pattern every later realm should follow. |
| `js/realm-template.js` | Copy this to add a new unit. See §5. |
| `js/main.js` | Game flow — turns, encounters, rooms, the run loop, `renderQuestion`. |
| `js/state.js` | Save/load, the party, the roster, the teaching record, question drawing. |
| `js/combat.js` | Monster intents, damage, the attack clock. |
| `js/chorus.js` | The Chorus — whole class answers, teacher judges. |
| `js/stakes.js` | SAFE / RISKY / blind calls. |
| `js/ui.js` | Rendering, sprite sizing, backdrops, the teaching report. Game flow does **not** live here. |
| `js/coach.js` | First-time-only explanation cards. |
| `js/events.js`, `js/items.js`, `js/heroes.js`, `js/forge.js` | Events, relics/potions/gear, the four heroes, the meta-upgrade shop. |
| `js/music.js`, `js/audio.js`, `js/announce.js` | Procedural score, sound effects, the arena banner. |
| `tools/check-content.html` | Browser content checker. **The teacher's tool** — no install. |
| `tools/set-pin.html` | Browser passphrase tool. |
| `tools/content-rules.js` | The content rules, shared by the browser checker and the terminal one. |
| `tools/tests/` | Nineteen suites. See §7. |
| `tools/pipeline/` | The art pipeline: chroma key, split, downscale, palette. |

### Three structural facts that are load-bearing

**Every question in the game goes through `renderQuestion()` in `main.js`.**
That is where the teaching record is written and where the four formats
dispatch. If you add a way to ask a question, route it through there or the
record silently stops being complete.

**Every question format renders inside `#{side}-choices`.** The stake gate hides
that element to make a blind call. A format that draws anywhere else works fine
until the first RISKY press, and then shows the class the answer — a Rule 2
break in the one place the rule exists to protect.

**The save is one `localStorage` blob per browser, not per folder.** Copying the
game folder does not copy the class data; two copies on one machine share it.
The teaching record is keyed by class name; the roster, Ember and unlocks are
not, so the game assumes roughly one class per computer.

---

## 5. Adding a realm — the main job

**Do not edit `js/content.js` to add a unit.** Copy `js/realm-template.js` to
`js/realm3.js`, fill it in, and add one line to `index.html`:

```html
<script src="js/realm3.js"></script>
```

`registerRealm()` derives the cover keys and wires it up. A typo then breaks only
that realm instead of the whole game — which matters when the failure would
otherwise be a blank screen five minutes before a lesson.

**Borrow the existing art.** The template already does. Making a realm's own
cast is 18 sprites and 3 backdrops and turns a half-day job into a week. A class
does not mind fighting a Thunderclap Wyrm about the past tense.

**The full authoring spec — question shapes, the four formats, the `open` flag,
cover keys and labels — is in `docs/2-YOUR-OWN-CURRICULUM.md`.** Read it before
writing questions. It is written to be readable by the teacher too, so you can
point them at any section.

### Budget for a unit

~32 cover keys with labels · ~200 ordinary questions at 6+ per key · ~40 elite
questions at 1+ per key. About half a day of your time, reusing the art.

**Work in batches of about ten keys**, and check each batch before the next. Long
runs drift: the format slips, the reading level creeps up a year, and by question
150 the `open` rule has quietly been forgotten. A bad batch then costs one batch.

---

## 6. Decisions already made — do not redo these

Each of these was tried, measured, and rejected. The reasoning is worth having
before you propose the same thing.

**Shorter, punchier fights.** Rejected in v6.1, then **allowed in v6.7** — this
is the one entry on this list that was overturned, and it is here so you do not
re-reject it. The v6.1 measurement (questions per run 36 → 23) was correct; the
conclusion was not, because the run is the wrong denominator. See Rule 1. What
is still rejected is anything that shortens a fight *without* paying for it:
v6.7 had to take the monster's cadence from 3 to 2 in the same change, because
a shorter fight reaches the monster's turn less often and swings per fight had
otherwise fallen to 0.79 — half of all fights with no monster attack at all,
which is the exact fault v6.1 existed to fix.

**A permanent bonus to the monster's attack countdown** (as a hero perk).
Rejected: a permanent bonus compounds with fight length, so it is worth almost
nothing in a four-question skirmish and a great deal in a twelve-question boss —
which is where runs are actually lost. It cut the wipe rate 28 points where a
comparable perk cut it 3. The version that shipped applies to the opening
countdown only.

**Paying shields for a good Chorus.** Rejected: painless-fight rate went 70% →
85%. One shield per correct answer, in a room that cannot cost a heart, is worth
eight points of painless-fight rate. **Shields are the currency that decides
whether this game is hard.** The Chorus pays shards only.

**Matching-pairs as a question format.** Built and cut: three pairs need six rows
of text, which squeezed the arena until the monster was a thumbnail at
1366×768. The question panel and the picture share one screen; any format has to
earn its height.

**A "+50% rewards" hero perk.** Rejected: every class picked it, so the shop
economy permanently ran at 1.5× income against 1.0× prices. Perks should change
*how* a class plays, not how much it earns. Check any new perk against the Storm
Knight's three shields, not against zero.

**At-home play.** Deliberately parked. It needs type-in answers first, because a
blind call needs a room to adjudicate it.

---

## 7. Testing

**A feature with no test exercising it will ship broken and pass everything.**
This has happened four times here: Brace was dead for two versions, the
enchantment system was dead from the day it was written, the Storm Knight's perk
was dead for three versions, and Realm 2's art paths could not be told apart
from stand-ins. All of them passed every suite that existed.

**If you add a mechanic, add the test that presses its button.**

### For the teacher — no install

`tools/check-content.html`. Double-click. Validates the question bank and names
every problem in plain language. This is the one you point them at.

### For you — needs Python, Playwright and a local server

```
python3 -m http.server 8811          # from the project root, in one terminal
python3 tools/tests/test_playthrough.py
node tools/tests/check_content.js
node tools/tests/balance_sim.js
```

| Suite | Guards |
|---|---|
| `test_playthrough.py` | four accuracy levels end to end; the intent countdown matches reality; RISKY never hides a correct answer |
| `test_brace.py` | Brace actually blocks a blow, including cadence 1 |
| `test_chorus.py` | a Chorus adds questions, can never cost a heart, never pays shields, belongs to no individual student, and the boss demands one exactly once |
| `test_formats.py` | every question format can be answered, reaches the record, books exactly one attempt, and still gets help from a Potion of Clarity |
| `test_curriculum.py` | every answered question reaches the teaching record, down both roads; the record never touches anything that decides how many questions get asked |
| `test_perks.py` | each hero's perk does what its card promises, and none touches monster HP |
| `test_reachable.py` | no item exists that no code path can grant or read; every coach lesson has a trigger; every curriculum key has a label |
| `test_events.py` | every event option states both sides; no event cuts questions |
| `test_resolution.py` | the cast is big enough to read at 1366×768 and 1920×1080 |
| `test_art.py` | every sprite exists and fits; no realm borrows another's art; no backdrop is brighter than the heroes |
| `test_music.py` | every piece sounds, nothing clips, the Boss is loudest, ducking measurably drops the level |
| `test_announce.py` | the arena banner is big enough, centred and held long enough |
| `test_sheet_split.py` | no creature can leak into its neighbour's sprite |
| `test_stale_deploy.py` | a half-updated upload degrades and says so, instead of bricking the game |
| `shot_realm2.py` | walks a realm in a browser; rendered sprite aspect matches the art |
| `check_content.js` | the question banks, from a terminal |
| `test_stakes.py` | RISKY deals 2 and SAFE deals 1 in a real fight; the wrong-answer penalty is flat, not a multiple of the tier; the gate charges exactly what it promised; shields still absorb it; the stake is logged |
| `balance_sim.js` | wipe rates by accuracy, **questions per lesson**, boss growth, damage sources |

### Six lessons that each cost real time

1. **Any suite whose assertions are all "nothing went wrong" will pass while
   testing nothing.** `test_playthrough` once answered **zero questions and
   reported PASS**. Give every suite a floor: assert that it measured something.
2. **The suites each keep their own walker, and that is a standing hazard.**
   Adding one room type and three question formats broke six suites in six
   different ways, none of them in the code under test. `tools/tests/walk.py`
   holds the shared `answer_any()` and `clear_rooms()`. **Teach a new format to
   `answer_any` and a new room to `clear_rooms`**, then check the four suites
   that still carry their own copies (`test_playthrough`, `test_curriculum`,
   `test_brace`, `test_announce`).
3. **A flaky harness is worse than no harness.** Reproduce on a quiet machine
   before believing a failure — running several browser suites at once causes
   false failures. Where a run can legitimately end before reaching what a suite
   measures, retry the run and say so in the output; do not lower the assertion.
4. **Count the thing you mean, not a proxy for it.** `test_resolution` asserts
   rendered pixel heights, not scale values, because per-monster scaling makes
   the scale legitimately vary.
5. **Check invariants continuously, not once at the end.** `test_curriculum`
   samples after every answer; sampling once at the end misread a legitimate
   second run as the log dropping every answer in the game.
6. **A test that can only be satisfied by luck will fail by luck.**

---

## 8. The teaching record

Every answered question is filed against its curriculum item, kept per class,
and accumulated across lessons. Teacher Menu → *What to reteach*.

Two design facts you should not undo:

**One run is noise.** ~40 questions across 32 items is one attempt each.
Anything under four attempts is greyed out and marked *too few*. Do not "improve"
the report by removing that.

**It is class-level, not per-child, on purpose.** At 24 children and 40
questions each child answers under two. Per-child figures on a named curriculum
item would be empty for most of a term and misleading for the rest.

---

## 9. How to work with this teacher

**Propose, agree, then build.** Do not start building from a one-line request.
Say what you would do and why, and let them react. They will often spot in one
sentence that you have misunderstood the classroom.

**Their reports are usually right even when the diagnosis is wrong.** "The
monsters feel too easy" turned out to be a streak guard eating the monster's only
action per fight. Take the observation seriously, then find the actual cause.

**When several reports arrive together, look for the shared cause first.** Five
separate bug reports once turned out to be one bug. Fixing them individually
would have treated five symptoms.

**Find out why, do not patch the symptom.** One visible bug here was three
separate faults stacked; fixing only the visible one would have left it dead.

**Measure, do not assert.** Every time judgement and `balance_sim.js` disagreed
here, the simulator was right about direction. It reads pessimistic on absolute
wipe rates, so compare on **painless-fight rate** and calibrate against a build
whose real classroom behaviour is known.

**Deliver as a folder they can drop on a USB or Drive.** They are not using git.
Zip the whole project, keep `START-HERE.md` at the top level, and tell them what
changed in plain language.

---

## 10. Art, if it ever comes up

Three rules learned the hard way, all enforced by `test_art.py`:

- **Monsters face LEFT.** They stand on the right, the hero on the left.
- **Monsters are realistic; guides are drawn in the chunky hero style** (~3.5
  heads tall).
- **Every backdrop must be darker than the heroes.** The party is 26–75
  luminance points brighter than the room everywhere in the game, and that
  bright-on-dark relationship is what makes four small figures readable from the
  back of a classroom.

Each realm has its own palette extension. Pushing a forest through the storm
palette moved every colour by 27.6 RGB units and turned the moss purple.

---

## 11. If you change nothing else, keep these

- `index.html` must keep working from `file://` with no server and no internet.
- No dependencies, no build step. A teacher must be able to open a folder.
- The version number on the title screen must move when you change anything, and
  `test_stale_deploy.py` must keep passing — a half-updated copy has to degrade
  loudly rather than silently half-work in front of a class.
- Never remove the content checker from the teacher's reach.
