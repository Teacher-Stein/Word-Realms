# Word Realms — Our World 5 Review Crawler

A browser-based, decision-driven dungeon crawler for reviewing Our World 5 in
class. **Version 5.8 — events worth stopping for.** Realm 1 (Unit 1, Extreme Weather) is
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

## What's new in v5.8 — events worth stopping for

**The old events were a slot machine.** "Help search the rubble?" — a 62%
chance of 4 shards against a 38% chance of losing a heart, with the odds
invisible. Across a whole run that was worth about 6 shards, roughly 1% of
income, spread over 2.25 rooms. A child learns nothing from pulling a lever.

**Eleven new events, and every option states both sides before it is chosen.**
Nothing is a gamble on hidden odds. What makes them interesting is that the
right answer depends on the state the party is actually in — a party at 8
hearts should pay the Toll Bridge and a party at 3 should not — so the argument
happens out loud in the room, which is the whole point.

They come in four kinds:

**Trades** state a cost for a reward. The **Toll Bridge** (hearts for a relic),
the **Frozen Cache** (shards for one of three relics *you can see first* —
choosing is much better than receiving), the **Weathervane** (all your shields
for +2 maximum hearts), the **Hoarder's Stall** (trade your worst relic up).

**Quiz events are resolved by answering**, which makes them the most valuable
kind in this particular game — they *add* review volume instead of moving
resources around. The **Riddle Gate** is three extra questions for a relic. The
**Lost Page** draws from a curriculum item the class has not been tested on yet,
and answering it marks it covered — which literally takes a hit off the Boss's
health bar, since the Boss's HP *is* the count of what nobody has faced. The
**Scholar's Wager** has you bet how many of the next three you will get before
seeing any of them. And the **Echoing Hall** brings back a question the class
got **wrong earlier this run** — spaced repetition disguised as a reward,
targeting exactly the material they have demonstrably not got.

**The Champion's Trial** sends the student with the *fewest turns so far* into
the ring alone, for a relic for the whole party. It turns being called on into a
reward moment for a quiet child rather than an exposure, and it self-corrects
the turn distribution while it is at it.

**Lasting effects** follow the party. The **Whispering Idol** pays +50% shards
for the rest of the run and makes every wrong answer cost one extra heart — it
scales with the class's real accuracy, so a confident class profits and a shaky
one pays for it every question. **The Long Road** grafts two extra rooms onto
the map and pays a relic: more questions, which is strictly good.

Events also scale with depth — a layer-3 Toll Bridge costs 2 hearts, a layer-12
one costs 3 — and an event is never offered if the party cannot use it (no
Frozen Cache without shards, no Echoing Hall with nothing missed). Event rooms
raised from 4 to 6 in the map weighting, so a run now walks about three.

**Verified:** `test_events.py` fails any option that does not state its
consequence, statically forbids an event from touching monster HP or moving the
party between nodes, and plays a Riddle Gate end to end to confirm it asks its
three questions. The Long Road's map surgery was checked over 400 generated
maps — the boss stays reachable, the path to it grows from 16 rooms to 18, and
no link is ever left dangling.

---

## What was new in v5.7 — rewards that lie

Every item here is a system the game advertised and then did not deliver — the
same disease as the six phantom relics removed in v5.5.

**Enchantments were completely unreachable.** All four were defined, the
inventory slot existed, three of them were read defensively in combat, and
`applyEnchant()` was written — and **nothing in the game ever called it**. The
slot was real; nothing could go in it. The campfire now offers a fourth choice,
**Etch**, competing with Mend, Repair and Sharpen — which makes an enchantment
a genuine trade rather than a free upgrade. Thorn Etch, the one with no read
side at all, is implemented: it pays the party 4 shards whenever a blow lands,
because thorns that damaged the monster would shorten the fight.

**Gear is now sold in shops.** It was offered 0.58 times per run — a 50% roll
on an elite kill, and elites are walked 1.15 times — and the shop stocked
relics and potions only. A class could go an entire realm without ever being
shown a weapon. The gear row also gives late shards somewhere to go. A tile
that would replace what you are carrying says so, and warns that the etching on
the old piece goes with it.

**Last Stands are counted, not flagged.** The Last Breath relic and the Second
Breath Forge perk both gated on the same boolean, so owning one made the other
worth exactly nothing — a rare 52-shard relic could be dead the moment a class
picked it up, with nothing saying so. They stack now.

**Safe Paths give +3 shields.** They gave nothing at all — 11% of every walk
was dead air dressed up as a reward on the map — while three separate code
comments and the README all claimed they restored shields.

**Rarity is a drop rate now, not just a price tag.** Every relic had a flat
3.8% chance on any drop, so Giant-Slayer — an epic that halves every elite
fight — was exactly as likely as a common, and one elite kill in nine handed a
class a fight-halving relic. Weighted 50/30/25/15, measured over 40,000 draws:
common 51.8%, uncommon 30.7%, rare 11.0%, **epic 6.5%** — about one run in nine
contains an epic. A first pass at 50/30/15/5 put epics at 2.5%, which is not
"you earned it", it is a lottery.

**Two dead-weight relics fixed.** Iron Bell only waived Team Up's 1 HP cost,
and Team Ups are capped at three per run — its entire lifetime value was three
monster HP. It now grants two extra Team Ups as well, which is more questions
and more children talking. Magpie's Eye added potion drops to a party that is
now capped at four potions; it pays +6 shards per monster felled instead.

**`tools/tests/test_reachable.py`** exists so this cannot happen again. It is a
static audit that fails if any relic, enchantment, weapon, armour or potion is
never read outside `items.js`, if a grant function is defined but never called,
or if the shop stops stocking one of its rows. Verified by planting a
deliberately dead relic and watching it fail.

One more null-run crash fixed: the victory screen could fire after the run had
already been cleared.

---

## What was new in v5.6 — the room can read it

**The combat narration moved into the middle of the arena.** It used to be a
small line at the bottom left of the question panel — projected onto a TV
several metres from thirty children, in the one corner nobody is looking at,
and gone before it could be read. It is now a large banner in the centre of the
battlefield, held for nearly three seconds, colour-coded good or bad.

Two things about it are worth recording:

It is a **queue**, not a replacement. One turn can produce four messages in
quick succession — a hit, then an enrage, then a debuff — and the old line
simply overwrote itself, so the class saw the last one and never learned the
other three had happened. Each message now waits its turn, and the dwell halves
automatically when several stack up so the banner never drifts a full turn
behind the fight.

Nothing calls it directly. There are **46 places** that write to the old
feedback element, so instead of editing every one by hand — and inevitably
missing some — a MutationObserver mirrors every write into the banner. Any
message added anywhere in the game is announced automatically from now on.

**The Hurricane Titan was being stretched by 58%.** Its art is 145×150, very
nearly square, but the sprite's width was set from the pixel scale while the CSS
clamped its height with `max-height`. With an explicit width the browser clamps
the height and does *not* reduce the width to match, so the boss was rendered
into a 580×380 box — an aspect of 1.53 against a true 0.97. Widths are now
clamped against the same limit, so the proportions hold at any scale. Measured
after the fix: rendered aspect 0.97 against a natural 0.97.

**Heroes are 18% larger.** Purely cosmetic — they read small next to the
monsters they were fighting.

Four more things that were misleading the room:

- **"FROZEN — must Brace"** told the class to press a button that was disabled
  at that exact moment. Freezing already forces the defend, so it now reads
  **"BRACING — frozen in place"**.
- **Brace, Team Up and Focus stayed live** behind the victory popups. A child
  clicking Brace on a dead monster got nothing, with no explanation.
- **The streak guard blocks one damage *event*, not one attack.** On a 3-hit
  flurry it blocked one hit while claiming the whole blow had been turned
  aside. It now says so when there is more than one hit coming.
- **Stunned monsters hid their next intent** — taking the information away at
  exactly the moment the class had a free turn to plan with it. The label now
  shows the stun *and* what is coming after it.

**On the Wordsmith and the Lucky Charm:** investigated and could not reproduce a
bug. Over 3,000 rolls the grant is uniform across the 14-relic common/uncommon
pool (Lucky Charm 6.7%, expected 7.1%), the relic strip displayed the granted
relic correctly in 25 of 25 browser runs, and `damage()` gates the effect on
actually owning it. The most likely explanation is that the "Started with X"
line was announced in the old unreadable feedback text — which is exactly what
this build fixes.

Two null-run crashes were also fixed on the way through: the victory popup and
the multi-hit damage loop could both fire after a party wipe had already ended
the run.

---

## What was new in v5.5 — the audit

Two full read-only audits were run over the whole codebase — one on economy and
progression, one on combat correctness and exploits — each driving the real
game in a browser rather than reasoning about the source. What follows is what
they found. Most of it was invisible from normal play, which is the point.

### The bug you reported: "it says 3 damage and hits for 1"

Real, and it was a **telegraph** bug rather than a damage bug. Four defects
were stacked on top of each other:

The charge intent printed `N damage incoming` on **every** turn of its wind-up,
including the two turns that deal nothing at all. The clock underneath it
printed `ON THE NEXT ANSWER` — counting to the monster's next *turn*, not to
the charge's *release*. So the screen promised a big hit three separate times
and delivered it once. And the 1 damage the class saw in between was the
**wrong-answer counter-attack**, printed in exactly the same words by the same
monster, with no way for a child to tell them apart.

Now: the charge label counts its own fuse (`3 damage in 2 more turns` →
`UNLEASHING — 3 damage NOW`), the turn clock is suppressed while a charge is
winding up, and a counter-attack is worded differently from a telegraphed one.

Three more telegraphs were lying, all found by measuring what was displayed
against what was actually delivered:

- **Enrage was double-counted on a charge.** The bonus was baked into the
  stored damage at telegraph time *and* added again at release, so an enraged
  charge showed 4 and dealt 5. One that became enraged mid-wind-up showed 3 and
  dealt 4. Both lied against the player.
- **Brace did not cancel a charge.** It cleared the charge but left the intent
  saying "charge", so the monster simply started charging again and landed it
  in full a turn later — while the feedback line said "the attack is turned
  aside".
- **Guard applied one turn late.** The shield icon appeared, the class damaged
  it normally, and then they were blocked on the turn the *sword* icon was
  showing. Against a guard/heavy monster this produced three correct answers in
  a row with the health bar not moving.
- **Regen at full health** floated a green `+1` and announced a heal with the
  HP bar visibly unchanged.

### Exploits a class would have found

- **ESC → "Award this answer" had no PIN.** The code comment claimed it lived
  "behind the pause menu so no child can reach it" — but the pause menu is a
  hotkey. Three keystrokes and three clicks killed most of a monster with
  nobody answering. It now asks for the teacher PIN.
- **One question could be resolved twice.** Behind the stake gate the choices
  are hidden but still unlocked, so the award override fired a handler on an
  invisible element and the class then answered the same question again — two
  monster hits, two shard payouts, two entries in a child's score.
- **Reloading mid-fight skipped the fight and kept the rewards.** Reloading at
  0 hearts let the party walk on at 0 hearts with no death. Reloading during
  the boss **softlocked the run permanently** — stranded on a node with no
  exits. All three are resolved before the map is drawn now.
- **Double-clicking the map skipped a room, elites included.** Removing the
  `.reachable` class did not remove the click listeners.
- **Reroll marked children absent, permanently.** Ten presses greyed out the
  whole class with no way back from the game screen. It is now just "pass the
  turn"; marking a child absent belongs in the Teacher Menu.

### Things that were silently doing nothing

- **Six of the 26 relics had no implementation at all** — Guiding Star, Stone
  Heart, Haggler's Token, Scout's Chart, Study Notes, Streak Totem. The id
  appeared in the item list and nowhere else in the codebase. Because drops are
  uniform, roughly every other run handed a child a card with a written promise
  on it that the game then ignored. All six are removed; they can come back the
  day they are built.
- **Focus was frequently spent for zero effect.** It clamped the monster's
  clock to its maximum — and the clock sits at maximum at the start of every
  fight and right after every monster turn, which are exactly the moments a
  class presses a panic button. The effect was discarded and success announced
  anyway.
- **Potion of Clarity and the Echo Shard were eaten invisibly.** The question is
  rendered once before the stake gate hides it; both effects were consumed on
  that invisible render.
- **RISKY lied on 25 questions.** The tier floor lived only in the button's
  label, so on tier-1 open questions the button promised the options would stay
  and then took them away. Both promise and outcome now use one predicate.
- **Team Up gave the asker's turn and credit to their partner**, who was then
  counted twice while the child who asked for help got nothing.
- **Half of all wipes paid nothing.** The death screen rolled 50/50 between
  banking Ember and "keeping a relic" — and the relic branch did nothing at all;
  there was no field anywhere that could hold it. Worse, because the roll only
  happened when the party held relics, **carrying relics halved your reward for
  dying.**

### The economy

- **Losing paid roughly twice as much Ember as winning.** Victory paid
  `shards / 2`; death paid `shards` undivided. The optimal strategy for a class
  that wanted Forge perks was to farm the map and throw the boss fight. Death
  now pays `shards / 3` and always less than a win.
- **The whole Forge cost 390 Ember and one winning run banked about 268.** The
  class bought everything in one or two lessons, after which Ember accumulated
  forever with nothing to spend it on. Costs are roughly tripled, and **perks
  are now scoped to the realm they were bought in** — the Ember carries across
  the year, the advantage does not, so every new unit starts its own climb.
- **77% of shards earned had nothing to buy.** A run earned ~527 and could
  spend ~123. Shard rewards are halved.
- **35% of runs never saw a shop** despite three being placed, because a shop
  sat on one node of a 3–4 node layer and the party walks one node per layer.
  Every node of a shop layer is now a shop: measured 0.87 → **2.71 shops walked
  per run, and zero-shop runs from 35% to 0.1%.**
- **Potions are capped at 4.** A run was picking up 8.5 of them, 6.5 from
  streak bonuses alone, so the shop's potion row and the Deep Pack perk were
  both selling something the class was drowning in.

### Music

Ducking is now **per fight, not per question**. It drops once when a fight
starts and comes straight back up the moment the monster falls — the surge and
drop between every single question was more distracting than the score simply
sitting back. Ramps are longer for the same reason: a slow settle reads as
atmosphere, a fast one reads as a fault.

**A music volume slider now lives on the ESC pause screen**, with its own level
independent of the sound effects, and a Music On/Off button beside it. The
score keeps playing while paused, because a slider you cannot hear is useless.

---

## What was new in v5.4 — the score

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
