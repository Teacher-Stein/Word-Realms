# Word Realms — Our World 5 Review Crawler

A browser-based, decision-driven dungeon crawler for reviewing Our World 5 in
class. **Version 3 — classroom edition.** Realm 1 (Unit 1, Extreme Weather) is
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

---

## Tuning the game

Everything balance-related is in `js/config.js`:

| Setting | Default | What it does |
|---|---|---|
| `START_HEARTS` | 4 | Party health at the start of a run |
| `MONSTER_HP` | 2 | Correct answers to defeat a regular monster |
| `ELITE_HP` | 5 | Correct answers to defeat an Elite |
| `TEAMUP_HP_COST` | 1 | HP the monster regains when a partner is called |
| `LAYERS_PER_REALM` | 20 | Map length — raise for longer lessons |
| `MAX_ELITES_PER_MAP` | 4 | How many long fights appear per map |
| `BOSS_MAX_QUESTIONS` | 20 | Cap on the boss gauntlet |
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
js/items.js           Relic + potion definitions
js/ui.js              Rendering (map, HUD, popups, tiles, shop)
js/main.js            Game flow, combat, animation sequencing
assets/sprites/       Original monster/NPC pixel art
assets/nodes/         Room icons (incl. shop), lantern totem, footprints
assets/items/         Relic + potion icons
assets/tiles/         Dungeon wall/floor/torch tiles
tools/gen_*.py        Scripts that regenerate the art (Python + Pillow)
data/units.json       Extracted syllabus data for all 9 units (reference)
```

All artwork and audio is original and generated by the scripts in `tools/`.
