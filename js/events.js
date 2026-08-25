// ---------------------------------------------------------------------------
// EVENTS  (v5.8)
//
// What was here before: a coin flip. "Help search the rubble?" — 62% chance of
// +4 shards, 38% chance of losing a heart, odds invisible. Measured across a
// run that was worth about 6 shards, roughly 1% of income, spread over 2.25
// rooms. It was a slot machine, and a child learns nothing from pulling a
// lever.
//
// THE RULE THAT REPLACES IT: every option states BOTH SIDES before it is
// chosen. Nothing here is a gamble on hidden odds. What makes an event
// interesting is that the right answer depends on the state the party is
// actually in — a party at 8 hearts should pay the Toll Bridge and a party at
// 3 should not — so the argument happens out loud in the room, which is the
// point.
//
// THE RULE THAT CANNOT BE BROKEN: no event may reduce the number of questions
// asked. Nothing skips a room, nothing cuts monster HP. Several events here go
// the other way and ADD questions, which is the best thing an event can do in
// a review game.
//
// Four kinds:
//   trade    — a stated cost for a stated reward
//   quiz     — resolved by ANSWERING, so it adds review volume
//   roster   — uses the fact that this is a class, not one player
//   lasting  — follows the party for the rest of the run
// ---------------------------------------------------------------------------

// How big an event is allowed to be, by how deep into the map it appears.
// A layer-3 event trades one heart; a layer-12 event trades three and pays an
// epic. Without this, an early Toll Bridge can end a run before it starts.
function eventDepth() {
  const run = STATE.run;
  if (!run || !run.map) return 0;
  const node = nodeById(run.map, run.currentNodeId);
  const layers = run.map.layerNodeIds ? run.map.layerNodeIds.length : 15;
  return node ? Math.min(1, node.layer / Math.max(1, layers - 1)) : 0;
}

// scale a cost/reward from its shallow value to its deep value
function byDepth(shallow, deep) {
  return Math.round(shallow + (deep - shallow) * eventDepth());
}

const EVENTS = [
  // =========================================================================
  // TRADES — a stated cost for a stated reward
  // =========================================================================
  {
    id: "toll_bridge", kind: "trade",
    who: "A rope bridge sags over a flooded gully.",
    text: "Someone has strung a toll box across the planks. Inside, something " +
          "glints. The crossing will cost you — the boards are rotten and the " +
          "wind is up.",
    options: () => {
      const cost = byDepth(2, 3);
      return [
        { label: "Cross the bridge",
          sub: `Lose ${cost} hearts · gain a relic`,
          tone: "danger",
          run: () => {
            damage(cost);
            const relic = availableRelic(["common", "uncommon"]);
            if (relic) addRelic(relic);
            return { banner: "ACROSS", tone: relic ? "good" : "neutral",
                     title: relic ? relic.name : "Nothing left in the box",
                     icon: relic ? relic.icon : null,
                     effect: relic ? relic.effect : "",
                     desc: `The crossing cost ${cost} hearts.` };
          } },
        { label: "Go the long way round",
          sub: "Lose nothing · gain nothing",
          run: () => ({ banner: "AROUND", tone: "neutral",
                        title: "You take the dry path",
                        effect: "No cost, no reward",
                        desc: "The toll box is still there. Someone else can pay it." }),
        },
      ];
    },
  },

  {
    id: "frozen_cache", kind: "trade",
    who: "A supply cache, frozen shut.",
    text: "Three shapes are visible through the ice. Thawing it will burn " +
          "through your shards — but you can see exactly what is in there.",
    // Only worth offering if the party can actually afford it.
    available: () => STATE.run.shards >= 20,
    options: () => {
      const cost = byDepth(20, 34);
      const picks = [];
      const seen = [];
      for (let i = 0; i < 3; i++) {
        const r = availableRelic(["common", "uncommon"]);
        if (r && !seen.includes(r.id)) { picks.push(r); seen.push(r.id); }
      }
      if (!picks.length) return null;
      return picks.map(r => ({
        label: `Thaw out the ${r.name}`,
        sub: `Costs ${cost} shards · ${r.effect}`,
        disabled: STATE.run.shards < cost,
        run: () => {
          STATE.run.shards -= cost;
          addRelic(r);
          saveState();
          return { banner: "THAWED", tone: "good", icon: r.icon, title: r.name,
                   effect: r.effect, desc: r.desc };
        },
      })).concat([{
        label: "Leave the ice alone",
        sub: "Keep your shards",
        run: () => ({ banner: "LEFT", tone: "neutral", title: "The cache stays shut",
                      effect: `You keep your ${STATE.run.shards} shards`, desc: "" }),
      }]);
    },
  },

  {
    id: "weathervane", kind: "trade",
    who: "A brass weathervane spins in dead air.",
    text: "It turns without wind, and it is pointing at you. Strip the armour " +
          "off and stand under it, and something in the party hardens for good.",
    available: () => STATE.run.shields > 0,
    options: () => [
      { label: "Stand under it",
        sub: `Lose all ${STATE.run.shields} shields · +2 maximum hearts for the run`,
        tone: "danger",
        run: () => {
          const lost = STATE.run.shields;
          STATE.run.shields = 0;
          STATE.run.maxHearts += 2;
          STATE.run.hearts += 2;
          saveState();
          return { banner: "TEMPERED", tone: "good",
                   title: "The party stands taller",
                   effect: "+2 maximum hearts, permanently this run",
                   desc: `${lost} shields blew away in the turning.` };
        } },
      { label: "Keep your armour on",
        sub: "Nothing changes",
        run: () => ({ banner: "PASSED BY", tone: "neutral",
                      title: "The vane goes on turning",
                      effect: "", desc: "" }),
      },
    ],
  },

  {
    id: "hoarders_stall", kind: "trade",
    who: "A hunched trader has laid a blanket on the stones.",
    text: "\"Not interested in coin,\" she says. \"Bring me something you are " +
          "carrying and I will find you something better.\"",
    available: () => STATE.run.relics.length > 0,
    options: () => {
      const order = { common: 0, uncommon: 1, rare: 2, epic: 3 };
      const worst = STATE.run.relics.slice()
        .sort((a, b) => (order[a.rarity] || 0) - (order[b.rarity] || 0))[0];
      const better = ["uncommon", "rare", "epic"]
        .filter(r => (order[r] || 0) > (order[worst.rarity] || 0));
      return [
        { label: `Trade away your ${worst.name}`,
          sub: better.length
            ? `Get a random ${better.join(" or ")} relic instead`
            : "You are already carrying her best — she offers a swap anyway",
          run: () => {
            STATE.run.relics = STATE.run.relics.filter(r => r.id !== worst.id);
            const got = availableRelic(better.length ? better : null);
            if (got) addRelic(got);
            saveState();
            return { banner: "TRADED", tone: "good",
                     icon: got ? got.icon : null,
                     title: got ? got.name : "She takes it and shrugs",
                     effect: got ? got.effect : "",
                     desc: `Your ${worst.name} is hers now.` };
          } },
        { label: "Keep what you have",
          sub: "Nothing changes",
          run: () => ({ banner: "DECLINED", tone: "neutral",
                        title: "She rolls up the blanket", effect: "", desc: "" }),
        },
      ];
    },
  },

  // =========================================================================
  // QUIZ — resolved by answering. These ADD questions, which is the whole
  // reason they are the most valuable kind of event in this particular game.
  // =========================================================================
  {
    id: "riddle_gate", kind: "quiz",
    who: "A sealed gate, carved over with words.",
    text: "Three locks, three words. Get all three and the gate opens on " +
          "something worth having. Get one wrong and it still opens — just on " +
          "less.",
    options: () => [
      { label: "Face the three locks",
        sub: "3 questions · all correct → a relic · otherwise shards",
        quiz: { count: 3, kind: "gate" } },
      { label: "Climb around the gate",
        sub: "No questions, no reward",
        run: () => ({ banner: "CLIMBED", tone: "neutral",
                      title: "Over the wall instead",
                      effect: "", desc: "The locks stay shut." }) },
    ],
  },

  {
    id: "lost_page", kind: "quiz",
    who: "A single page, pinned under a stone.",
    text: "It is torn from something larger, and it covers ground the party " +
          "has not been tested on yet. Learn it now and the Boss will have one " +
          "less thing to ask you.",
    // only if there IS an uncovered curriculum item left
    available: () => {
      const realm = currentRealm();
      if (!realm) return false;
      return realm.coverKeys.some(k => !STATE.run.coveredKeys.includes(k));
    },
    options: () => [
      { label: "Study the page",
        sub: "1 question · correct → marked covered, and the Boss loses a hit",
        quiz: { count: 1, kind: "page" } },
      { label: "Put it back",
        sub: "Nothing changes",
        run: () => ({ banner: "LEFT IT", tone: "neutral", title: "Back under the stone",
                      effect: "", desc: "" }) },
    ],
  },

  {
    id: "scholars_wager", kind: "quiz",
    who: "A robed figure deals three cards face down.",
    text: "\"Three questions,\" they say. \"Before you see any of them — how " +
          "many will you get right? Say a number. Be honest with yourself; I " +
          "pay for honesty, not for hope.\"",
    options: () => {
      const pot = byDepth(14, 26);
      return [3, 2, 1].map(n => ({
        label: `Wager ${n} of 3`,
        sub: `Land at least ${n} → ${pot * n} shards · fall short → nothing`,
        quiz: { count: 3, kind: "wager", target: n, pot },
      }));
    },
  },

  {
    id: "echoing_hall", kind: "quiz",
    who: "The hall repeats things back at you.",
    text: "Not everything — only the things the party got wrong on the way in. " +
          "One of them is still hanging in the air here, waiting.",
    // needs at least one miss this run
    available: () => (STATE.run.missedQs || []).length > 0,
    options: () => [
      { label: "Answer it again",
        sub: "1 question you already missed · correct → heal 2 hearts and mark it covered",
        quiz: { count: 1, kind: "echo" } },
      { label: "Walk on past",
        sub: "Nothing changes",
        run: () => ({ banner: "IGNORED", tone: "neutral", title: "The echo fades",
                      effect: "", desc: "" }) },
    ],
  },

  // =========================================================================
  // ROSTER — only possible because this is a class rather than one player
  // =========================================================================
  {
    id: "champions_trial", kind: "roster",
    who: "A ring of standing stones, worn smooth.",
    text: "The stones will only listen to someone who has not spoken much. " +
          "One question, one voice, no help from anyone.",
    available: () => STATE.roster && STATE.roster.students.length > 1,
    options: () => {
      const quiet = quietestStudent();
      return [
        { label: `Send ${quiet} into the ring`,
          sub: "1 question, answered alone · correct → a relic for the whole party",
          quiz: { count: 1, kind: "champion", who: quiet } },
        { label: "Nobody steps forward",
          sub: "Nothing changes",
          run: () => ({ banner: "SILENCE", tone: "neutral", title: "The stones wait",
                        effect: "", desc: "" }) },
      ];
    },
  },

  // =========================================================================
  // LASTING — follows the party for the rest of the run
  // =========================================================================
  {
    id: "whispering_idol", kind: "lasting",
    who: "A small idol, warm to the touch.",
    text: "It wants to be carried. It will make the party richer for the rest " +
          "of the realm — and it will make every mistake hurt more.",
    available: () => !STATE.run.idolTaken,
    options: () => [
      { label: "Take the idol",
        sub: "+50% shards for the rest of the run · every wrong answer costs 1 extra heart",
        tone: "danger",
        run: () => {
          STATE.run.idolTaken = true;
          STATE.run.shardMultiplier = (STATE.run.shardMultiplier || 1) * 1.5;
          saveState();
          return { banner: "CARRIED", tone: "good",
                   title: "The idol goes in the pack",
                   effect: "+50% shards · wrong answers cost 1 more heart",
                   desc: "A confident class should take this. A shaky one should not." };
        } },
      { label: "Leave it where it sits",
        sub: "Nothing changes",
        run: () => ({ banner: "LEFT", tone: "neutral", title: "It goes on whispering",
                      effect: "", desc: "" }) },
    ],
  },

  {
    id: "long_road", kind: "lasting",
    who: "The corridor forks. One way is much longer.",
    text: "The long road doubles back through chambers nobody has swept. More " +
          "ground, more monsters, more to find.",
    available: () => !STATE.run.longRoadTaken,
    options: () => [
      { label: "Take the long road",
        sub: "2 extra rooms on the map · gain a relic now",
        run: () => {
          STATE.run.longRoadTaken = true;
          const relic = availableRelic(["common", "uncommon"]);
          if (relic) addRelic(relic);
          const added = extendMap(2);
          saveState();
          return { banner: "THE LONG ROAD", tone: "good",
                   icon: relic ? relic.icon : null,
                   title: relic ? relic.name : "You set off",
                   effect: relic ? relic.effect : "",
                   desc: `${added} more rooms lie between you and the Boss.` };
        } },
      { label: "Take the short way",
        sub: "Straight on to the Boss",
        run: () => ({ banner: "STRAIGHT ON", tone: "neutral",
                      title: "The short way it is", effect: "", desc: "" }) },
    ],
  },
];

// Who has had the fewest turns this run? Used by the Champion's Trial, which
// turns "being called on" into a reward moment for a quiet child rather than an
// exposure — and self-corrects the turn distribution while it is at it.
function quietestStudent() {
  const run = STATE.run;
  if (!STATE.roster || !STATE.roster.students.length) return "ANYONE";
  const counts = {};
  STATE.roster.students.forEach(n => {
    const s = STATE.studentStats[n] || {};
    counts[n] = (s.correct || 0) + (s.wrong || 0);
  });
  return STATE.roster.students
    .slice()
    .sort((a, b) => counts[a] - counts[b])[0];
}

// Pick an event that is actually usable right now. `available` exists so the
// game never offers a trade the party cannot make - a Frozen Cache with no
// shards, an Echoing Hall with nothing missed - which was the other thing
// wrong with a purely random bank.
function pickEvent() {
  const usable = EVENTS.filter(e => {
    if (typeof e.available === "function") {
      try { if (!e.available()) return false; } catch (err) { return false; }
    }
    const seen = (STATE.run.eventsSeen || []);
    return !seen.includes(e.id);
  });
  // If the party has already seen everything usable, allow repeats rather than
  // dropping them back to a blank room.
  const pool = usable.length ? usable
    : EVENTS.filter(e => typeof e.available !== "function" || e.available());
  return pool.length ? pick(pool) : null;
}

function markEventSeen(id) {
  const run = STATE.run;
  if (!run) return;
  run.eventsSeen = run.eventsSeen || [];
  if (!run.eventsSeen.includes(id)) run.eventsSeen.push(id);
  saveState();
}

// The Long Road physically adds rooms. It grafts new layers on just before the
// boss and rewires the links, so the extra rooms are genuinely walked rather
// than being a number in a popup.
function extendMap(n) {
  const run = STATE.run;
  const map = run && run.map;
  if (!map || !map.layerNodeIds) return 0;

  const bossId = map.bossId;
  const boss = nodeById(map, bossId);
  if (!boss) return 0;

  // the layer that currently feeds the boss
  const feeders = map.nodes.filter(nd => (nd.connectsTo || []).includes(bossId));
  if (!feeders.length) return 0;

  let nextId = map.nodes.reduce((mx, nd) => Math.max(mx, nd.id), 0) + 1;
  const types = ["fight", "treasure", "fight", "rest"];
  let added = 0;
  let prev = feeders;

  for (let i = 0; i < n; i++) {
    const layer = boss.layer + i;
    const made = [];
    for (let lane = 0; lane < 2; lane++) {
      const nd = { id: nextId++, layer, lane, type: types[(i * 2 + lane) % types.length],
                   connectsTo: [] };
      map.nodes.push(nd);
      made.push(nd);
      added++;
    }
    prev.forEach(f => {
      f.connectsTo = f.connectsTo.filter(id => id !== bossId);
      made.forEach(nd => f.connectsTo.push(nd.id));
    });
    map.layerNodeIds.splice(map.layerNodeIds.length - 1, 0, made.map(nd => nd.id));
    prev = made;
  }
  // the last new layer feeds the boss, and the boss moves back
  prev.forEach(nd => nd.connectsTo.push(bossId));
  boss.layer += n;
  saveState();
  return added;
}
