# Word Realms — Our World 5 Review Crawler

A browser-based, decision-driven dungeon crawler for reviewing Our World 5 in
class. **Version 5.4 — the score.** Realm 1 (Unit 1, Extreme Weather) is
fully playable; Realms 2–9 appear as locked placeholders using the correct
themes from the school syllabus.

Runs entirely in the browser. No installs, no accounts, no internet needed
once the page has loaded.

---

## Updating your GitHub Pages site

1. Open your `word-realms` repository on github.com.
2. Click **Add file → Upload files**.
3. Select everything *inside* this folder (`index.html`, `css`, `js`, `assets`,
   `data`, `tools`, `README.md`) and drag it in — not the outer folder itself.
4. Scroll down, click **Commit changes**.
5. Wait about a minute, then reload your `https://…github.io/word-realms/` link.

If a browser still shows the old version, press `Ctrl+F5` to force a refresh.

---

## What's new in v5.4 — the score

**A real soundtrack.** The old music picked random notes out of a scale on a
timer. Random notes are not a melody, which is exactly why it sounded like
wallpaper. This is a written score: chord progressions, bass lines, drum
patterns and song sections that repeat, so a class hears the same themes every
lesson and starts to know them.

Six pieces — **title, map, fight, elite, boss, campfire** — played by five
synthesized instruments: Karplus-Strong plucked strings, bowed pads, frame
drums and taiko, FM bells, and a restrained bass. Everything is generated in
the browser. Nothing is sampled and nothing is borrowed, so there is nothing
to license.

**It is mixed for a classroom television, not for headphones.** The master
chain high-passes at 85Hz because a TV speaker cannot move air below that,
lifts the mids around 2.3kHz where small speakers are efficient and where the
score has to cut through twenty-five children, and compresses gently so quiet
passages still carry. Two bugs came out of building that and both are worth
recording: the bass line was written two octaves below the root, which put it
*underneath the high-pass I had just added* — the score had no low end at all
and the Boss measured quieter than the title screen. And the ducking gain sat
*before* the compressor, so the compressor handed back most of the level the
duck had just taken away; a 10dB duck measured as 1dB. Ducking now rides the
finished mix.

**It ducks for the lesson.** The moment a question is on screen the score drops
to 30% and comes back up when the answer lands, with a short swell on a correct
one. Verified by measurement, not by trusting the flag: 0.43 peak un-ducked,
0.13 ducked, a ratio of exactly 0.30.

**Realm tinting.** One core score. Each realm shifts its root note, its musical
mode and its instrument balance — Realm 1 is D Aeolian, cold and bell-forward;
Realm 4 is Phrygian and drum-heavy. All nine are already declared, so a new
realm's music is a data edit rather than a composition job.

**`tools/tests/test_music.py`** drives all of it: every piece must produce
sound, none may clip, the Boss must be the loudest thing in the game, and
ducking must measurably drop the level rather than merely flip a flag.

---

## Fixed in v5.3.1 — Brace

**Brace never worked.** Not "worked badly" — the button did nothing, from the
day it was added. It failed in three ways at once:

The answer handler captured whether the party was defending at the moment the
question was *rendered*. But Brace is pressed *after* the question is on
screen, so the captured value was always the state from before the student
decided. A braced, correct answer was resolved as an ordinary attack and the
blow landed anyway. The flag could not survive to a later turn either, because
`advanceStudentAndAsk()` clears it before drawing the next question.

Underneath that, the braced branch reset the monster's clock to `cadence` and
then the very next line ticked it down — so on a fast variant with cadence 1 it
landed on zero and the monster swung regardless.

And because the flag was set but never cleared, the Brace button greyed out
permanently after one press.

All three are fixed: the defend state is read live when the answer lands, the
clock resets to a genuinely full one, and the flag clears on resolution.

**Why no test caught it:** no harness had ever pressed the button. Four full
automated playthroughs at four accuracy levels passed every time while a
feature did nothing at all. `tools/tests/test_brace.py` now drives the exact
moment — clock about to fire, press Brace, answer correctly, assert nothing is
lost — including the cadence-1 case that broke. The suites now live in
`tools/tests/` instead of being rebuilt from scratch each session.

---

## What's new in v5.3 — the clock and the wager

**Fixed: the monster's countdown was lying by one.** A "turn" in this game is
one answered question, from anybody. The countdown was being redrawn *before*
the clock ticked and then never redrawn again, so the number sitting on screen
while a student was choosing an answer was always one behind — and the red
**NEXT** warning only ever flashed up during the feedback a moment before the
blow landed, which is after the decision it was supposed to inform. It is now
redrawn after the tick, and verified: 287 readings across four accuracy levels
in automated play, all correct.

**The countdown is measured in answers, not "turns".** A ten-year-old looking
at a class roster reads "in 2 turns" as *two of my turns* and gets hit twice as
fast as they expected. It now says **AFTER 2 MORE ANSWERS** and **ON THE NEXT
ANSWER**. The Riposte Ring, which silently ate a tick a third of the time, now
says so out loud, and a successful Brace announces that it has reset the clock.

**Momentum is gone. Stakes replace it.** Momentum was optional, and in a room
with twenty-five children and forty minutes anything optional gets skipped. It
was also a shared pool spent on one student's turn, so it belonged to nobody.
The decision now sits on the question itself: before the options appear, the
student on turn picks **SAFE** or **RISKY**. RISKY pays double shards and makes
a mistake cost double, and the gate shows the real heart cost of each choice
rather than the word "double", so the gamble is an informed one. On a question
whose clue alone tells you what to say, RISKY goes further — the options vanish
and the answer is said out loud for triple shards and a shield point. It is
never offered where the options *are* the question.

That last detail matters: paying the shield on *every* RISKY made bold play
strictly safest and turned the mechanic mandatory — a class that always played
SAFE wiped 17 points more often, which is the exact trap Momentum fell into.
Restricting it to blind calls and capping it at two per fight puts the choice
back in balance.

**Focus — one per fight.** The whole class answers the next question together,
hands up, and a correct answer strikes two answers off the monster's clock. It
buys *time*, never damage, so the fight runs longer and the class gets more
questions out of it, not fewer.

**Balance held, threat moved.** The difficulty is deliberately unchanged from
v5.2 — 2,500 simulated runs per configuration put a typical class at 63% wipes
at 85% accuracy against v5.2's 65% — so a class playtest of either version
still tells you the same thing. What changed is *where* the danger comes from:
wrong answers now account for 60% of all damage taken, up from 48%. The threat
comes from not knowing, rather than from waiting.

---

## What was new in v5.2 — legibility

**Fixed: Commit was offered on questions that cannot be answered aloud.** It
was gated on how *hard* a question was, when the property that matters is
whether the clue alone tells you what to say. "Choose the correct sentence:"
is meaningless with the options hidden — the options *are* the question. That
was 19 of the 47 questions it appeared on. Every question in the bank is now
tagged open-response or selection-only, Commit is gated on that, and eight new
open-form grammar and phonics questions were written to widen the pool. It now
appears on 59 questions, all of which work.

**Floating damage numbers.** Red for damage, green for healing, blue for a
block — rising off whoever it happened to. What happens in a fight was
previously narrated in a small line at the bottom-left of the panel, which is
the last place thirty children look.

**Status chips moved out beside the fighters.** The hero's conditions sit to
the left of the hero, the monster's to the right of the monster, in the empty
space either side. The monster now has chips at all — Guarding, Enraged,
Stunned and Charging were only ever a line of text.

**Coach mode.** The first time each mechanic actually appears, the game stops
and explains that one thing, then never mentions it again — Stakes, Focus,
the intent countdown, campfires, Elites, debuffs and the shop. Marks are
per class, resettable in the Teacher Menu, and the whole thing can be switched
off for a class that already knows.

**Press ESC to pause.** Resume, restart the realm, jump to the Teacher Menu, or
exit — and the music stops while you settle the room. When a question is on
screen the pause menu also offers **Award this answer**, so a child who was
right for a reason the game didn't anticipate isn't marked wrong in front of
everyone. It lives behind the pause menu rather than on a hotkey so no student
can reach it.

**Download your save.** The whole term lives in one browser on one school
computer. The Teacher Menu now exports a save file and restores from one.

**Short realm.** A Teacher Menu toggle drops the map to nine rooms for a single
period instead of a double.

**Colour is never the only signal.** Correct and wrong answers carry a tick or
a cross as well as green and red.

**No roster set** now reads "ANYONE!" rather than a bare dash.

## What's new in v5.0 — the fights matter

Instrumenting v4.3 over 3,000 runs turned up something the wipe rate was
hiding: a Fight room lasted **2.3 questions**, the monster acted **0.72 times**,
and **58% of fights had no damage even aimed at the party**. The monster
telegraphed an attack and then died before its turn arrived. All the danger sat
in the six Elite and Boss rooms out of twenty-one. This build fixes the
distribution, not the difficulty.

| | v4.3 | v5.0 |
|---|---|---|
| Questions per normal fight | 2.3 | **4.6** |
| Times the monster acts per fight | 0.72 | **1.8** |
| Fights with no damage aimed at you | 58% | **7%** |
| Fights that cost no hearts | 92% | **64%** |
| Damage absorbed by shields | 84% | **62%** |
| Questions per run | 34.6 | 35.6 |

**Deeper fights, shorter map.** Monsters have 4 health (was 2), Elites 7, and
the map is 15 layers instead of 20. The lesson is the same length and asks the
same number of questions — you trade twenty shallow rooms for fifteen that
matter.

**Stakes.** Before the options appear, the student on turn decides how much
they are putting on the answer. **SAFE** plays normally. **RISKY** pays double
shards and makes a mistake cost double. The gate shows the actual heart cost of
each option, not a multiplier, and the clue is already on screen above it, so
nobody is gambling blind on the arithmetic.

This is the risk-and-reward lesson applied to every single question rather than
to an abstract meter. A student who *knows* they know it gets paid for backing
themselves; a student who is guessing learns it is fine to say so. Confidence
calibration is a real skill and it outlives Unit 1.

**Blind calls.** On a question whose clue alone tells you what to say, RISKY
goes further: the options vanish, the answer is said out loud, and the room
adjudicates. Triple shards and a shield point. Recall is a far harder test than
recognition, and this makes children volunteer for it because it is the
powerful move. It is never offered where the options *are* the question —
nothing in this game may hide the correct answer from a student who knows it.

**Focus.** One per fight. The whole class answers the next question together,
and a correct answer strikes two answers off the monster's clock.

**Nothing in the game shortens a fight.** An earlier draft had a Heavy Strike
that dealt extra damage. Simulation caught it cutting a run from 36 questions
to 25 — the exact rule this game exists to protect. Stakes move shards earned
and damage taken, never damage dealt. Focus stuns the *clock*, not the
monster's health, so it makes a fight longer and adds questions.

**Campfires replace Rest rooms.** There is time for one thing only: **Mend**
(hearts), **Repair** (shields) or **Sharpen** (a permanent extra heart for the
run). Safe Paths no longer restore shields. The damage a fight did now has to
be paid for by not doing something else.

**Brace is no longer a trap.** At 2 monster health it cost half a fight to
block one blow, so a class that never pressed it played better than one that
did. At 4 it costs a quarter of a fight against a visible countdown — a real
judgement call.

**Team Up has a price.** Three per run instead of unlimited. Its only cost used
to be one extra question, which is a thing we want, so it was free — and free
is not a decision.

**Balance.** Measured in v5.3 over 2,500 simulated runs per configuration: a
typical class wipes 19% of runs at 95% accuracy, 63% at 85% and 92% at 75%. A
class that plays everything SAFE and never touches Focus wipes 75% at 85%; a
class that goes all-in on RISKY wipes 69%. Moderate risk is the optimal line
and both extremes are punished, which is the lesson. These are simulated
figures that exclude relics, potions and shop purchases, so real classes should
do somewhat better.

## What's new in v4.3

**The Ember Forge.** Ember was banked at the end of every run and bought
absolutely nothing. It now buys six permanent upgrades for the class — a
starting heart, starting shards, an extra potion, a starting relic, sturdier
repairs, a second Last Stand. A run that ends in a wipe still leaves the room
better equipped than it walked in, which was the whole point of banking it.
The pool is deliberately shallow and one-off so difficulty can't drift away
across a term, and the Teacher Menu can switch perks off entirely.

**Armour actually matters now.** Shields no longer refill in every room. They
persist, and are only topped up at a **Rest room** or a **Safe Path**, with the
new **Patch Kit** potion, or by wearing better armour. Starting hearts are 5
(was 4) to compensate.

**Harder questions for Elites and the Boss.** A new bank of 35 tier-4 questions
that test whether students can *use* Unit 1's language rather than recognise
it: correct the mistake, reason in two steps, transform one form into another,
work out which word a situation calls for. Every one of the 32 curriculum items
has a hard version, so the Boss now asks the demanding one wherever it exists.

**Monsters have voices.** All 17 announce themselves with their own cry —
growls, shrieks, glass, whooshes, crunches, bells — and die on a lower, slower
version of it. Still entirely synthesized; nothing licensed.

**A countdown on every telegraphed attack.** The intent banner now says how
many turns until the blow lands, with dots that tick down and go red on the
last one.

**Live status under the hero.** Chilled, Exposed, Frozen, Bracing, Guarded,
Shields and Streak all appear as chips under the hero's feet and stay there
while they are active. Debuffs used to be announced once and then vanish.

**Whose turn it is** now gets a card across the top of the screen with a chime,
rather than quietly changing a small chip.

**The storm got serious.** Lightning bolts are three times wider, forked, and
long enough to fall behind the fighters, with a full-scene white wash and
rolling thunder. A bolt cracks when an Elite or the Boss arrives.

**Gear is never equipped over your head.** Finding a weapon or armour now shows
what you're carrying alongside what you've found, with two buttons: take it, or
keep what you have.

**Potions can be used in a fight** — the student still answers their question,
so no review is lost, but the party doesn't attack that turn.

**Giant-Slayer is now EPIC** and applies to Elites only. Against the Boss it was
halving the number of curriculum items the class faced before the realm ended.
Two more epics join it: the **Storm Crown** and the **Oracle's Eye**.

**Fixed: defeated monsters got back up.** The death animation ends invisible
and holds there, but the code was stripping it on a timer, so the monster
reappeared while the reward cards were still on screen.

**More teacher resets.** Reset Current Run, **New Term** (keeps the class list,
clears everything else), **remove a single student** who has left, and Factory
Reset.

**Balance, re-measured** with the new shield rules and the elite question bank:
about 1 run in 30 ends in a wipe at perfect accuracy, 1 in 5 at 90%, and just
under half at 80%. A fully forged class does markedly better, which is what the
Ember is for.

## What's new in v4.2 (painted art)

**Painted backdrops, three per realm.** The party works through The Outer
Ruins, then The Flooded Halls, then The Eye of the Storm as it goes deeper, so
a 20-layer map no longer looks the same at the boss as it did at the entrance.
The procedural brick walls and torches are retired wherever a backdrop exists;
the animated storm and lightning still play over the top of it.

**Hand-drawn room furniture.** Bed, campfire, treasure chest, supply crates and
the Storm Pedlar's stall, each with a warm timber version for the upper realm
and a cold steel one for the flooded depths.

**Everything shares one palette.** New art is quantised into the same 57
colours the monster and hero cast already use, so the furniture, the backdrops
and the monsters read as one game rather than three.

**Both fighters now stand on the painted floor,** lower down the screen, with
the monster's nameplate, health and intent hanging into the dark foreground
strip below them.

## What's new in v4.1 (playtest fixes)

**The monster's information moved underneath it.** The nameplate, health and
telegraphed intent used to sit above the sprite, where a tall monster pushed
them off the top of the screen. They now sit under the monster, and the whole
scene rescales itself if the window is too short to hold everything — on a
1080p classroom TV nothing is ever cut off.

**Rooms have furniture.** A Rest room has a bed, a Safe Path has a campfire, a
Treasure room has a chest and the Storm Pedlar has a market stall. The hero
now stands in every room, not only in fights.

**Fixed: empty rooms showed the last monster's leftovers.** Walking into a Rest
room displayed the previous monster's name and its next attack with no monster
in sight. The corridor is shared by every room type and was never being wiped.

**Fixed: a Rest room bounced straight back to the map** behind its own reward
card, so nobody ever saw the room. It now waits for the class to move on, and
the pack can be opened there the same as on a Safe Path.

**Monsters hit more often.** Every monster now acts every other student turn
(the slower half used to act every third), and the boss acts every third turn
instead of every fourth. Frenzied variants act on *every* turn.

**Last Stand.** The first time the party runs out of hearts, one student gets a
single sudden-death question, framed in red across the whole screen. Answer it
and the party gets back up with one heart and the monster reels; miss it and
the run is over. Once per run — the counterweight to the faster monsters.

**Two dead relics now do something.** *Last Breath* grants a second Last Stand.
*Echo Shard* removes a wrong option from the run's first grammar question.

**Balance, re-measured.** With the faster monsters and Last Stand together:
roughly 1 run in 9 ends in a wipe at perfect accuracy, 1 in 5 at 90%, 1 in 3 at
80% and half at 70% — and almost all of those wipes now happen at the boss
rather than halfway through the map. Question count per run is unchanged (~35).

## What's new in v4 (Build A)

**Hand-drawn sprite cast.** 12 monsters, 4 elites, a boss, an NPC and 4 playable
heroes — 22 sprites, all cleaned, palette-matched and rendered at a uniform
pixel scale so the whole cast looks like one game.

**Choose your champion.** Every run starts with a hero-select screen. The
Wordsmith opens with a free relic, the Grammar Knight starts armoured, the
Phonics Ranger earns 50% more shards, the Storm Scholar starts with potions and
gear. Your hero appears on the left of every fight and in the HUD portrait.

**Side-view combat.** Hero on the left, monster on the right, both animated —
the hero lunges when you land a hit and flinches when hit back.

**Monsters telegraph their intent** and act on their own schedule, not only when
you answer wrongly. They may attack, land a heavy blow, flurry, drain shards,
charge a devastating hit, guard, or heal themselves. Long fights make them
**enrage**.

**Brace.** Defend instead of attacking — you still answer a question, but a
correct answer blocks the incoming attack and clears any debuff rather than
damaging the monster. No review time is lost.

**Shields.** A blue buffer beside your hearts that refreshes each room and
soaks damage first. Armour and relics increase it.

**Difficulty tiers.** Vocabulary questions cost 1 heart when wrong; grammar
questions cost 2 but pay more shards.

**Streaks.** Three correct in a row blocks the next attack. Five gives shards
and a potion.

**Shops fixed.** They now appear only in the back two-thirds of the map, three
per run, so you always have shards to spend when you reach one.

**Rewards roughly tripled**, potions drop from monsters and chests, and every
party starts with a Healing Draught.

**24 relics** (was 10) plus weapons, armour and enchantments with their own
inventory slots.

**Party name** on the roster screen, shown in the HUD and on the leaderboard.

**End Run** button on the map, with a confirmation.

**Music and ambience** — a procedural storm bed with wind and a looping theme
that shifts for elites and bosses, plus separate SFX/Music toggles and a volume
slider. All synthesized; nothing licensed.

**Difficulty was tuned with a simulator** rather than guesswork. At perfect
accuracy a party survives ~93% of runs; at 80% accuracy roughly a third of runs
end in a wipe. Deaths now happen at the boss rather than partway through.

## What's new in v3

**Relics and potions have real tiles.** Every relic and potion has its own
icon, name, plain-language effect and flavour text. Open **Inventory** from the
map footer to see everything the party is carrying.

**The Storm Pedlar (shop).** A new room type. Spend Knowledge Shards on relics
(2 in stock, priced by rarity) or potions (3 in stock). Stock is fixed per shop,
so leaving and coming back shows the same wares.

**Three potions.** Healing Draught (+2 hearts), Potion of Clarity (removes a
wrong answer from the next question), Storm Shield (blocks the next hit).

**Safe rooms are now useful.** They're the one place the party can freely open
the pack and drink a potion before pressing on.

**Rewards are pop-up cards.** Shards, relics, potions, heals, event outcomes,
team-ups and boss kills all show a centre-screen card with an icon and a
*Continue* button. Nothing vanishes before the class has read it.

**Health lowered to 4 hearts** (was 6), with potions and relics to compensate.

**Sounds hit much harder** — every impact now carries a sub-bass thump, and
overall levels are roughly doubled.

**Fixed:** entering any room made the screen flash red and shake as if the party
had been attacked. The damage animation's CSS classes were never cleared, and a
CSS animation restarts whenever its element becomes visible again.

## What's new in v2

**Class roster and automatic student picking.** Enter your class name and
students once (Class Roster on the main menu). The game then picks a student at
random for every turn and shows their name in large text — no more nominating
manually. A **Reroll** button skips anyone who's absent and removes them from
the rotation for that session.

**Monsters have health.** Regular monsters take **2** correct answers to defeat;
Elites take **5** and drop a relic. One Fight room now spans several students'
turns.

**Team Up.** A student can call in a partner, but the monster recovers **1 HP**
while they confer — once per monster, so it can't be abused. Both students get
credit for the kill.

**Monsters fight back.** A wrong answer triggers a lunge animation, an impact
sound, a screen shake and a lost heart.

**Bigger, denser map.** Around 20 layers and 60–75 rooms per realm with multiple
branching routes, drawn as bricked dungeon chambers. The map scrolls and
auto-follows the party. A lantern totem walks between rooms leaving footprints.

**Bigger text throughout**, sized to be read from the back of a classroom.

**Leaderboards** (Classes and Warriors tabs), stored on this computer.

**Storm atmosphere** — the corridor is lit by a drifting storm gradient with
lightning that flashes across the whole scene.

**Sound** — all original, synthesized in the browser (no copyrighted audio).

**Fixes:** hearts render correctly (they were malformed), plus an explicit
**Play This Realm Again** button on the results screen and a **Factory Reset**
in the Teacher Menu.

---

## How a lesson runs

1. Open the link on the classroom computer, connect the TV.
2. Set the Class Roster once (it's remembered afterwards).
3. Open Realm 1. The game names a student — they choose which room to enter.
4. In a room, the named student answers. Correct = the monster takes a hit.
   Wrong = the monster attacks and the party loses a heart.
5. After each question the game names the next student automatically.
6. Reach the Boss to finish the realm.

**Pacing:** a full run averages ~34 questions across ~21 rooms. At a realistic
classroom pace that's roughly **45–65 minutes**, so it fits a double period.
If a realm doesn't finish, just close the page — reopening on the same computer
resumes exactly where you left off.

---

## The Boss and curriculum coverage

The boss asks about every vocabulary word, phonics sound and grammar point the
class **hasn't already faced** in that run. Take lots of Safe Paths and the boss
gets correspondingly longer — skipping rooms delays content, it doesn't skip it.
(The boss is capped at 20 questions so the finale can't run absurdly long, and
has a minimum of 6 so it's never trivial.)

Realm 1 covers all 32 curriculum items from Unit 1: 15 Vocabulary 1 words,
5 Vocabulary 2 words, both phonics sounds (/θ/ and /ð/), both grammar points
(*be going to*, zero conditional) and the 4 reading words from *Tornado Trouble*.
There are ~75 questions in the bank — 2–3 different ways of asking about each
item — so rooms rarely repeat themselves.

---

## Teacher Menu

Default PIN **1234** (change it in `js/config.js`).

- Tick realms to open them for the class.
- Auto-unlock the next realm when this class clears one.
- **Reset Current Run** — clears the active realm only.
- **Factory Reset** — wipes everything: roster, warrior stats, leaderboards,
  Ember and unlocks.

---

## Known limitations

**Progress is saved in this browser on this computer.** Each classroom's
computer keeps its own roster, stats and leaderboard — they don't sync between
rooms. Cross-class leaderboards need the shared-database step we've parked for
later.

**Realms 2–9 are not built yet.** They're visible but locked.

**Very short windows shrink the sprites.** The game is built for a 1920×1080
classroom TV, where every sprite is drawn at full size. On a small laptop
screen the fight scene scales itself down so nothing is cut off.

---

## Tuning the game

Everything balance-related is in `js/config.js`:

| Setting | Default | What it does |
|---|---|---|
| `START_HEARTS` | 9 | Party hearts — the main survivability dial |
| `REST_SHIELDS` | 7 | Shields restored by a campfire **Repair** only |
| `MONSTER_HP` | 4 | Correct answers to fell a monster — the main fight-length dial |
| `STAKE_RISKY_DAMAGE` | 2 | Multiplier on a wrong answer when RISKY is taken |
| `STAKE_BLIND_SHARDS` | 3 | Shard multiplier for a blind call |
| `STAKE_MIN_TIER` | 2 | Question tier at which a blind call is offered |
| `FOCUS_STUN_ANSWERS` | 2 | Answers struck off the clock by a landed Focus |
| `BOSS_CADENCE` | 4 | Boss acts every N answers (lower = harder) |
| `REST_HEAL` | 5 | Hearts restored by a campfire **Mend** |
| `TIER_DAMAGE` | 1/1/3/3 | Hearts lost per wrong answer, by question tier (4 = Elite bank) |
| `SHOPS_PER_MAP` | 3 | Guaranteed shops, placed deep in the map |
| `ELITE_HP` | 7 | Correct answers to defeat an Elite |
| `TEAMUP_HP_COST` | 1 | HP the monster regains when a partner is called |
| `LAYERS_PER_REALM` | 15 | Map length — raise for longer lessons |
| `MAX_ELITES_PER_MAP` | 4 | How many long fights appear per map |
| `BOSS_MAX_QUESTIONS` | 20 | Cap on the boss gauntlet |
| `LAST_STAND_ENABLED` | true | One sudden-death question at 0 hearts |
| `TEACHER_PIN` | "1234" | Teacher Menu PIN |

---

## Project structure

```
index.html            All screens
css/style.css         Styling, corridor layout, animations
js/config.js          Balance settings (edit here)
js/audio.js           Procedural chiptune sound engine
js/content.js         Realm data + the Realm 1 question bank
js/mapgen.js          Procedural branching map generator
js/state.js           Save/load, roster, stats, run lifecycle
js/items.js           Relics, potions, weapons, armour, enchantments
js/heroes.js          Playable hero definitions
js/forge.js           Ember Forge perks and their run-start effects
js/stakes.js          Stakes (SAFE/RISKY), blind calls and Focus
js/coach.js           First-time explanations for each mechanic
js/combat.js          Monster instances, intents, attacks, debuffs
js/ui.js              Rendering (map, HUD, popups, tiles, shop)
js/main.js            Game flow, combat, animation sequencing
assets/sprites/       Original monster/NPC pixel art
assets/nodes/         Room icons (incl. shop), lantern totem, footprints
assets/scenery/       Bed, campfire, chest, crates and market stall
assets/backdrops/     Painted scenes, three per realm, by map depth
assets/items/         Relic, potion, gear and enchantment icons
assets/heroes/        Hero sprites
assets/tiles/         Dungeon wall/floor/torch tiles
tools/gen_*.py        Scripts that regenerate the procedural art
spritework/           Pipeline that cleans and palette-matches generated art
data/units.json       Extracted syllabus data for all 9 units (reference)
```

All artwork and audio is original and generated by the scripts in `tools/`.
