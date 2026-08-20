# Word Realms — Our World 5 Review Crawler

A browser-based, first-person, decision-driven dungeon crawler for reviewing
Our World 5 content in class. This is the **Phase 1 build**: TV-only, no
accounts, no backend — just open it in a browser. Realm 1 (Unit 1, "The
Stormlands" / Extreme Weather) is fully playable end-to-end. Realms 2-9 show
on the map as locked/"coming soon" placeholders using the correct theme and
monster names from the syllabus, ready to be filled in the same way once
you're happy with Realm 1.

## How to run it right now (no setup)

1. Open a terminal in this folder.
2. Run a tiny local server (needed so the browser will load the image/JSON
   files correctly — double-clicking `index.html` directly can misbehave in
   some browsers):
   ```
   python3 -m http.server 8000
   ```
3. Open `http://localhost:8000` in Chrome (or any modern browser).

On the actual classroom computer, you can do the same thing — or, once you're
ready, put this on GitHub Pages and just open the link instead (see below).

## Deploying to GitHub Pages (so it's one stable link)

1. Create a new repository on your GitHub account (public or private both
   work; Pages is free either way on a personal account for public repos —
   private repos need GitHub Pages support on your plan).
2. Upload everything in this folder to that repository (drag-and-drop on
   github.com works fine, or `git push` if you're comfortable with git).
3. In the repo, go to **Settings → Pages**, set the source to the `main`
   branch (root), and save.
4. GitHub gives you a URL like `https://yourname.github.io/your-repo/` —
   that's the link to bookmark on the classroom computer.

Send me the repo name once it's created and I can walk through anything that
doesn't work first try.

## How the game works

- **Main menu**: pick a realm (only unlocked, finished realms are clickable).
- **Map screen**: a branching path of nodes from Start to the Realm Boss —
  Fight and Elite nodes are review questions, Event nodes are a story choice,
  Rest heals a heart, Treasure is a bonus question for a relic/shards, Safe
  Path skips the node with no risk and no reward. The layout is regenerated
  every run, so there's no "perfect route" to memorize.
- **Turn structure**: designed for one shared TV/projector session — call on
  a student, they make one choice (which path, or which answer), then you
  call the next student.
- **Hearts**: the whole class shares one pool. Wrong answers cost a heart.
  Hit zero and it's a true reset — new map, hearts refilled — but the run
  banks something first: either the class keeps one relic they'd collected,
  or their shards convert into **Ember**, a currency that persists across
  resets forever (shown top-right, gold coin icon).
- **The Boss**: always asks about everything from the unit that *wasn't*
  already covered earlier in that run, so nothing gets skipped for good —
  and if the class took a lot of Safe Paths, the boss fight is longer as a
  natural consequence, not an arbitrary difficulty spike.
- **Teacher Menu** (bottom-right "Teacher" button, default PIN **1234**,
  change it in `js/config.js`): unlock/lock which realms students can enter,
  toggle auto-unlock, or reset the current run.
- **Progress auto-saves** to that browser's local storage, so if a realm
  doesn't finish in one class period, reopening the page picks up exactly
  where the class left off — as long as it's the same computer/browser each
  time (see the note below).

## Important limitation to know about (Phase 1)

Progress is saved in that specific browser on that specific computer, not in
the cloud. That's fine as long as each class always plays on the same
classroom computer/TV. If you need progress to follow students across
different devices (e.g. homework at home), that's what Phase 2 (GitHub Pages
+ a small free Supabase database) is for — a separate conversation once
Phase 1 has been played with an actual class.

## Content coverage

Realm 1 covers 100% of Unit 1's material from the syllabus: all 15
Vocabulary 1 words, all 5 Vocabulary 2 words, both phonics sounds, both
grammar points (be going to / zero conditional), and the 4 reading-passage
vocabulary words. See `js/content.js` for the full question bank — every
question was written fresh for this game, not copied from the textbook.

## What's stubbed vs. built

| Realm | Unit | Status |
|---|---|---|
| 1 — The Stormlands | Extreme Weather | **Fully playable** |
| 2 — The Wildlands | Animals & Camouflage | Locked placeholder |
| 3 — The Concert Caverns | Music | Locked placeholder |
| 4 — The Void Station | Outer Space | Locked placeholder |
| 5 — The Memory Archive | Culture & Traditions | Locked placeholder |
| 6 — The Overgrowth | Plants | Locked placeholder |
| 7 — The Ember Depths | Volcanoes | Locked placeholder |
| 8 — The Landfill Ruins | Recycling & Environment | Locked placeholder |
| 9 — The Wanderlands | Vacation & Travel | Locked placeholder |

Once you've played Realm 1 with a class and we've adjusted anything that
needs adjusting, the same process (write questions in `js/content.js`,
generate monster/tile art with the scripts in `tools/`) repeats for Realms
2-9.

## Project structure

```
index.html          Screens/markup for menu, map, encounter, boss, etc.
css/style.css        All styling, including the pixel-art corridor layout
js/config.js         Teacher PIN, starting hearts, map size — tweak here
js/audio.js          Procedural chiptune sound effects (Web Audio API)
js/content.js        Realm/monster/question data (Realm 1 fully written)
js/mapgen.js         Procedural branching node-map generator
js/state.js          Save/load, hearts/shards/Ember/relics, run lifecycle
js/ui.js             Rendering (menu, map, HUD)
js/main.js           Game flow / event wiring
assets/sprites/      Original pixel-art monster sprites (PNG)
assets/tiles/        Original pixel-art dungeon tileset (PNG)
tools/gen_sprites.py Regenerates monster art (Python + Pillow)
tools/gen_tiles.py   Regenerates dungeon tileset art (Python + Pillow)
data/units.json      Raw extracted syllabus data for all 9 units (reference)
```
