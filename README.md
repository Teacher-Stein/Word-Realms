# Word Realms — Our World 5 Review Crawler

A browser-based, decision-driven dungeon crawler for reviewing Our World 5 in
class. **Version 4.2 — classroom edition.** Realm 1 (Unit 1, Extreme Weather) is
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
| `START_HEARTS` | 4 | Party hearts (the deep reserve) |
| `BASE_ROOM_SHIELDS` | 6 | Shields refreshed on entering each room (drop to 5 for a harder game) |
| `BOSS_CADENCE` | 3 | Boss acts every N student turns (lower = harder) |
| `REST_HEAL` | 3 | Hearts restored by a Rest room |
| `TIER_DAMAGE` | 1/1/2 | Hearts lost per wrong answer, by question tier |
| `SHOPS_PER_MAP` | 3 | Guaranteed shops, placed deep in the map |
| `MONSTER_HP` | 2 | Correct answers to defeat a regular monster |
| `ELITE_HP` | 5 | Correct answers to defeat an Elite |
| `TEAMUP_HP_COST` | 1 | HP the monster regains when a partner is called |
| `LAYERS_PER_REALM` | 20 | Map length — raise for longer lessons |
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
