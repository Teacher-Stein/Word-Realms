# Word Realms

A browser-based review game for Grade 5 English at Ngoi Sao Hanoi, covering the
nine units of the **Our World 5** textbook. A Slay-the-Spire-style dungeon
crawler: a branching node map, side-view combat, and a question behind every
action. It is projected onto a classroom TV from one computer and played by the
whole class together, one student answering at a time.

Vanilla HTML/CSS/JS. No framework, no build step, no bundler. Deployed as static
files to GitHub Pages. Open `index.html` and it runs.

---

## The rules that outrank everything else

These are not preferences. A change that breaks one of them is wrong even if it
makes the game better in every other way.

**1. Nothing may reduce the number of questions asked.** Review volume is the
entire point of the game. No weapon, armour, relic, event or mechanic may
shorten a fight. An early build had a Heavy Strike that hit harder and it
quietly cut a run from 36 questions to 25 — that is the failure mode to watch
for. Shields, healing and stuns are fine because they make fights *longer*.

**2. No mechanic may hide or remove the CORRECT answer.** Removing a *wrong*
option is fine. Punishing a student who knows the answer is backwards for a
review game. The RISKY stake escalates to answering blind only on questions
tagged `open: true`, where the clue alone tells you what to say — never on
selection-only questions. `test_playthrough.py` enforces this.

**3. Real failure is wanted.** Runs are meant to be losable; a victory that
cannot be lost is worth nothing. Do not quietly soften the difficulty. There is
no "easy mode" and there will not be one.

**4. Copyright.** Our World 5 content may **not** be reproduced. Every question
is original and tests the same curriculum item without copying the textbook's
wording. No RuneScape or Jagex audio — all sound is synthesised in the browser
at runtime. All art is generated and then processed through `tools/pipeline/`.

**5. The teacher PIN is secret.** It gates realm unlocking and awards. It must
never be displayed, logged, or exposed in the UI.

---

## How it is laid out

| Path | What's in it |
|---|---|
| `js/config.js` | **All tuning.** Hearts, monster HP, rewards, stakes, the per-realm difficulty ramp. Change numbers here, not in the logic. |
| `js/content.js` | Every realm: questions, monsters, elites, bosses, NPCs. The biggest file. |
| `js/main.js` | Game flow — turns, encounters, rooms, the run loop. |
| `js/combat.js` | Monster intents, damage, the attack clock. |
| `js/ui.js` | Rendering, sprite sizing, backdrops. Game flow does **not** live here. |
| `js/stakes.js` | SAFE / RISKY / blind calls and Focus. |
| `js/events.js` | Random events. |
| `js/coach.js` | The first-time-only explanation cards. |
| `js/music.js`, `js/audio.js` | The procedural score and sound effects. |
| `js/announce.js` | The arena banner. |
| `assets/sprites/` | Realm 1's cast. Later realms live in `assets/sprites/realmN/`. |
| `tools/tests/` | Sixteen suites. See below. |
| `tools/pipeline/` | The art pipeline: chroma key, split, downscale, palette. |

**Realms 1 and 2 are built and illustrated. Realms 3–9 are locked placeholders**
with the correct unit themes. Each new realm needs ~110 questions across 32
curriculum cover keys, plus 18 sprites and 3 backdrops.

---

## Testing

**A feature with no test exercising it will ship broken and pass everything.**
This has happened three times: Brace was dead for two versions, the enchantment
system was dead from the day it was written, and Realm 2's art paths could not
be told apart from deliberate stand-ins. All passed every suite that existed.

If you add a mechanic, add the test that presses its button.

Browser suites need a local server running from the project root first:

```
python3 -m http.server 8811
```

| Suite | Guards |
|---|---|
| `test_playthrough.py` | four accuracy levels end to end; the intent countdown matches reality; RISKY never hides a correct answer |
| `test_brace.py` | Brace actually blocks a blow, including cadence 1 |
| `test_music.py` | every piece sounds, nothing clips, the Boss is loudest, ducking measurably drops the level |
| `test_announce.py` | the arena banner is big enough, centred, and held long enough |
| `test_reachable.py` | no item exists that no code path can grant or read; every coach lesson has a trigger and every trigger has a lesson; every curriculum key has a human label |
| `test_events.py` | every event option states both sides; no event cuts questions |
| `test_perks.py` | each hero's perk does what its card promises, and none of them touches monster HP |
| `test_curriculum.py` | every answered question reaches the teaching record, down both roads; the record never touches anything that decides how many questions get asked |
| `test_resolution.py` | the cast is big enough to read at 1366x768 and 1920x1080 |
| `test_art.py` | every sprite exists and fits; no realm borrows another's art; no backdrop is brighter than the heroes |
| `shot_realm2.py` | walks Realm 2 in a browser, checks rendered sprite aspect against the art |
| `check_content.js` | every ready realm's question bank is sound |
| `balance_sim.js` | wipe rates by accuracy, questions per run, damage sources |

**A flaky harness is worse than no harness.** If a test fails, reproduce it on a
quiet machine before believing it — `test_brace.py` once failed three times
running because it sampled a button before the screen had rendered, and cost
hours chasing a regression that did not exist. If it passes when the machine is
idle, fix the test, do not shrug at it.

---

## Art

Each realm has its **own palette extension** and its own sprite folder. Realm
1's 56 shared colours are a storm palette; pushing a forest through it moved
every colour by 27.6 RGB units and turned the moss purple. Realm 2 adds 48
forest colours of its own.

Two rules that are easy to get wrong:

- **Monsters face LEFT** — they stand on the right of the arena, the hero on the
  left. Flipping in the pipeline is free; regenerating is not.
- **Monsters are realistic; NPCs are drawn in the hero style** (~3.5 heads
  tall). The Realm 2 guide came back at realistic proportions and had to be
  redrawn.

Backdrops must be **darker than the heroes**. The party is 26–75 luminance
points brighter than the room everywhere in the game, and that bright-on-dark
relationship is what makes four small figures readable from the back of a
classroom. `test_art.py` enforces it.

---

## Working style

Stein wants to **discuss changes before they are built**. Propose, agree, then
implement — do not start building off a one-line request. He plays the game
himself between sessions and reports what feels wrong; those reports are usually
right even when the diagnosis is not.

When something is broken, find out *why* rather than patching the symptom. The
Brace bug was three separate faults stacked on top of each other, and fixing
only the visible one would have left it dead.

Commit messages should say what changed and why, in plain language.
