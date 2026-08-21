// ---------------------------------------------------------------------------
// Game state: persistence, party, roster, per-student stats, leaderboard,
// run lifecycle. Everything is stored in this browser (classroom computer).
// Data is shaped so it can later be pushed to a shared backend unchanged.
// ---------------------------------------------------------------------------


function defaultState() {
  return {
    unlockedRealms: CONFIG.DEFAULT_UNLOCKED.slice(),
    teacherAutoUnlock: false,
    soundOn: true,
    ember: 0,              // meta-currency, survives a party wipe
    permanentPerks: [],
    roster: null,          // { className, students:[name,...] }
    studentStats: {},      // name -> { correct, wrong, monsters, damage, relics, teamups }
    leaderboard: [],       // completed run records
    run: null,
  };
}

let STATE = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return defaultState();
    const st = Object.assign(defaultState(), JSON.parse(raw));
    migrateRun(st);
    return st;
  } catch (e) {
    console.warn("save load failed, starting fresh", e);
    return defaultState();
  }
}

// A run saved by an older version won't have the newer fields. Fill them in
// rather than wiping a class's progress in the middle of a lesson.
function migrateRun(st) {
  const r = st.run;
  if (!r) return;
  if (!Array.isArray(r.potions)) r.potions = [];
  if (!r.shopStock)              r.shopStock = {};
  if (!Array.isArray(r.relics))  r.relics = [];
  if (!Array.isArray(r.absent))  r.absent = [];
  if (typeof r.shieldActive  !== "boolean") r.shieldActive  = false;
  if (typeof r.clarityActive !== "boolean") r.clarityActive = false;
  if (typeof r.usedLastStand  !== "boolean") r.usedLastStand  = false;
  if (typeof r.usedLastBreath !== "boolean") r.usedLastBreath = false;
  if (typeof r.usedEcho       !== "boolean") r.usedEcho       = false;
  if (!r.stats) r.stats = { correct: 0, wrong: 0, monsters: 0, teamups: 0 };
  // Older maps contain no shop rooms - harmless, they just won't appear
  // until the next run.
}

function saveState() {
  try {
    localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(STATE));
  } catch (e) {
    console.warn("save failed", e);
  }
}

function factoryReset() {
  STATE = defaultState();
  saveState();
}

// ---------------------------------------------------------------------------
// roster + student stats
// ---------------------------------------------------------------------------
function setRoster(className, students, partyName) {
  STATE.roster = {
    className: className.trim(),
    partyName: (partyName || "").trim(),
    students: students.slice(),
  };
  students.forEach(ensureStudentStats);
  saveState();
}

function ensureStudentStats(name) {
  if (!STATE.studentStats[name]) {
    STATE.studentStats[name] = {
      correct: 0, wrong: 0, monsters: 0, damage: 0, relics: 0, teamups: 0,
    };
  }
  return STATE.studentStats[name];
}

function bumpStat(name, key, by = 1) {
  if (!name) return;
  const s = ensureStudentStats(name);
  s[key] = (s[key] || 0) + by;
  saveState();
}

// Pick the next student. Avoids repeating anyone until everyone has had a
// turn (a shuffled queue), so nobody gets picked twice while others wait.
function nextStudent(exclude = null) {
  const run = STATE.run;
  if (!run || !STATE.roster || !STATE.roster.students.length) return null;
  if (!run.turnQueue || run.turnQueue.length === 0) {
    run.turnQueue = shuffle(STATE.roster.students);
  }
  let idx = 0;
  if (exclude && run.turnQueue.length > 1) {
    while (run.turnQueue[idx] === exclude && idx < run.turnQueue.length - 1) idx++;
  }
  const name = run.turnQueue.splice(idx, 1)[0];
  run.currentStudent = name;
  saveState();
  return name;
}

// Reroll = student is absent. Drop them from this session's queue entirely.
function rerollStudent() {
  const run = STATE.run;
  if (!run) return null;
  const absent = run.currentStudent;
  if (absent) {
    run.absent = run.absent || [];
    if (!run.absent.includes(absent)) run.absent.push(absent);
    run.turnQueue = (run.turnQueue || []).filter(n => n !== absent);
  }
  // rebuild the queue from present students only
  if (!run.turnQueue || run.turnQueue.length === 0) {
    const present = STATE.roster.students.filter(
      n => !(run.absent || []).includes(n));
    run.turnQueue = shuffle(present.length ? present : STATE.roster.students);
  }
  return nextStudent(absent);
}

// ---------------------------------------------------------------------------
// run lifecycle
// ---------------------------------------------------------------------------
function startNewRun(realmId, heroId) {
  const realm = REALMS[realmId];
  const map = generateMap(realm);
  let hearts = CONFIG.START_HEARTS;
  if (STATE.permanentPerks.includes("second_wind")) hearts += 1;

  STATE.run = {
    realmId,
    heroId,
    map,
    currentNodeId: map.nodes[0].id,
    visitedNodeIds: [map.nodes[0].id],
    hearts,
    maxHearts: Math.max(CONFIG.START_HEARTS, hearts),
    shards: 0,
    relics: [],
    potions: [],          // consumable ids held by the party
    weapon: null,         // equipped gear id
    armour: null,
    enchants: {},         // slot -> enchantment id
    shields: 0,           // absorbed before hearts
    streak: 0,            // consecutive correct answers
    bestStreak: 0,
    shardMultiplier: 1,
    shieldActive: false,  // Storm Shield blocks the next hit
    clarityActive: false, // Potion of Clarity trims the next question
    shopStock: {},        // nodeId -> generated stock, so a shop is stable
    coveredKeys: [],       // curriculum items already tested this run
    usedQuestionIdx: [],   // avoid repeating the exact same question
    usedLuckyCharm: false,
    usedEcho: false,
    usedLastStand: false,  // the one sudden-death reprieve, once per run
    usedLastBreath: false, // the Last Breath relic grants a second one
    startedAt: Date.now(),
    turnQueue: null,
    currentStudent: null,
    absent: [],
    encounter: null,       // active monster fight
    boss: null,
    stats: { correct: 0, wrong: 0, monsters: 0, teamups: 0 },
  };
  saveState();
  return STATE.run;
}

function currentRealm() {
  return STATE.run ? REALMS[STATE.run.realmId] : null;
}

function markCovered(cover) {
  const run = STATE.run;
  if (run && cover && !run.coveredKeys.includes(cover)) {
    run.coveredKeys.push(cover);
  }
}

// Pick a question, preferring curriculum items not yet covered this run and
// avoiding exact repeats.
function drawQuestion(realm) {
  const run = STATE.run;
  const all = realm.questions;
  let pool = all
    .map((q, i) => ({ q, i }))
    .filter(x => !run.usedQuestionIdx.includes(x.i));
  if (pool.length === 0) {
    run.usedQuestionIdx = [];
    pool = all.map((q, i) => ({ q, i }));
  }
  const fresh = pool.filter(x => !run.coveredKeys.includes(x.q.cover));
  const chosen = pick(fresh.length ? fresh : pool);
  run.usedQuestionIdx.push(chosen.i);
  saveState();
  return chosen.q;
}

// ---------------------------------------------------------------------------
// party resources
// ---------------------------------------------------------------------------
function damage(n = 1) {
  const run = STATE.run;
  if (!run) return { blocked: false, dead: false };

  if (run.shieldActive) {                       // Storm Shield potion
    run.shieldActive = false;
    saveState();
    return { blocked: true, blockedBy: "Storm Shield", dead: false };
  }
  if (!run.usedLuckyCharm && hasRelic("lucky_charm")) {
    run.usedLuckyCharm = true;
    saveState();
    return { blocked: true, blockedBy: "Lucky Charm", dead: false };
  }

  // Shields soak damage before hearts are touched.
  let absorbed = 0;
  if (run.shields > 0) {
    absorbed = Math.min(run.shields, n);
    run.shields -= absorbed;
    n -= absorbed;
  }
  run.hearts = Math.max(0, run.hearts - n);
  saveState();
  return {
    blocked: n === 0 && absorbed > 0,
    blockedBy: absorbed > 0 ? "Shields" : null,
    absorbed, dealt: n,
    dead: run.hearts <= 0,
  };
}

// ---------------------------- shields / gear -------------------------------
function addShields(n) {
  STATE.run.shields = Math.min(99, (STATE.run.shields || 0) + n);
  saveState();
}

// Shields regenerate on entering a room, if the party's kit provides them.
function refreshRoomShields() {
  const run = STATE.run;
  if (!run) return 0;
  let gain = CONFIG.BASE_ROOM_SHIELDS || 0;
  const armour = run.armour ? gearById(run.armour) : null;
  if (armour) {
    if (armour.id === "windwarden")   gain += 2;
    if (armour.id === "aegis_mantle") gain += 3;
  }
  if (run.enchants && run.enchants.armour === "ward_etch") gain += 1;
  if (hasRelic("aegis_charm")) gain += 1;
  // Shields REFRESH rather than stack - otherwise they pile up room after
  // room and the party becomes untouchable. Anything already held is kept.
  const before = run.shields || 0;
  run.shields = Math.max(before, gain);
  saveState();
  return Math.max(0, run.shields - before);
}

function equipGear(gear) {
  const run = STATE.run;
  const slot = gear.slot;
  const previous = run[slot];
  run[slot] = gear.id;
  if (previous !== gear.id) run.enchants[slot] = null;   // etching is lost
  saveState();
  return previous ? gearById(previous) : null;
}

function availableGear(slot = null) {
  const run = STATE.run;
  let pool = ALL_GEAR.filter(g => g.id !== run.weapon && g.id !== run.armour);
  if (slot) pool = pool.filter(g => g.slot === slot);
  return pool.length ? pick(pool) : null;
}

function applyEnchant(slot, enchantId) {
  STATE.run.enchants[slot] = enchantId;
  saveState();
}

// ---------------------------- streaks --------------------------------------
function bumpStreak() {
  const run = STATE.run;
  run.streak = (run.streak || 0) + 1;
  run.bestStreak = Math.max(run.bestStreak || 0, run.streak);
  saveState();
  return run.streak;
}
function resetStreak() {
  if (STATE.run) { STATE.run.streak = 0; saveState(); }
}

function heal(n = 1) {
  const run = STATE.run;
  if (!run) return;
  run.hearts = Math.min(run.maxHearts, run.hearts + n);
  saveState();
}

function addShards(n) {
  const run = STATE.run;
  let mult = run.shardMultiplier || 1;
  if (hasRelic("coin_purse")) mult += 0.25;
  const gained = Math.max(1, Math.round(n * mult));
  run.shards += gained;
  saveState();
  return gained;
}
function addEmber(n)  { STATE.ember += n; saveState(); }

function hasRelic(id) {
  return !!(STATE.run && STATE.run.relics.some(r => r.id === id));
}

function addRelic(relic) {
  STATE.run.relics.push(relic);
  if (relic.id === "second_wind") {
    STATE.run.maxHearts += 1;
    STATE.run.hearts = Math.min(STATE.run.maxHearts, STATE.run.hearts + 1);
  }
  saveState();
}

// A relic the party doesn't already hold. `rarities` narrows the pool.
function availableRelic(rarities = null) {
  const owned = STATE.run.relics.map(r => r.id);
  let pool = RELICS.filter(r => !owned.includes(r.id));
  if (rarities) {
    const narrowed = pool.filter(r => rarities.includes(r.rarity));
    if (narrowed.length) pool = narrowed;
  }
  return pool.length ? pick(pool) : null;
}

// --------------------------- potions ---------------------------------------
function addPotion(id) {
  STATE.run.potions.push(id);
  saveState();
}

function consumePotion(id) {
  const i = STATE.run.potions.indexOf(id);
  if (i === -1) return false;
  STATE.run.potions.splice(i, 1);
  saveState();
  return true;
}

// --------------------------- shop ------------------------------------------
// Stock is generated once per shop node and remembered, so re-entering or
// resuming the lesson shows the same wares.
function shopStockFor(nodeId) {
  const run = STATE.run;
  if (run.shopStock[nodeId]) return run.shopStock[nodeId];
  const owned = run.relics.map(r => r.id);
  const pool = shuffle(RELICS.filter(r => !owned.includes(r.id)));
  const relicPicks = [];
  // one better-than-common relic where possible, plus one of anything
  const fancy = pool.find(r => r.rarity !== "common");
  if (fancy) relicPicks.push(fancy);
  pool.forEach(r => {
    if (relicPicks.length < 2 && !relicPicks.includes(r)) relicPicks.push(r);
  });
  const stock = {
    relics: relicPicks.map(r => ({ id: r.id, price: relicPrice(r), sold: false })),
    potions: shuffle(POTIONS).slice(0, 3)
      .map(p => ({ id: p.id, price: p.price, sold: false })),
  };
  run.shopStock[nodeId] = stock;
  saveState();
  return stock;
}

function buyFromShop(nodeId, kind, index) {
  const run = STATE.run;
  const stock = run.shopStock[nodeId];
  if (!stock) return { ok: false, reason: "no stock" };
  const entry = stock[kind][index];
  if (!entry || entry.sold) return { ok: false, reason: "sold" };
  if (run.shards < entry.price) return { ok: false, reason: "poor" };
  run.shards -= entry.price;
  entry.sold = true;
  if (kind === "relics") addRelic(relicById(entry.id));
  else addPotion(entry.id);
  saveState();
  return { ok: true, item: itemById(entry.id), kind };
}

// ---------------------------------------------------------------------------
// end of run
// ---------------------------------------------------------------------------
function runScore() {
  const run = STATE.run;
  const minutes = Math.max(1, Math.round((Date.now() - run.startedAt) / 60000));
  const accuracy = run.stats.correct + run.stats.wrong > 0
    ? run.stats.correct / (run.stats.correct + run.stats.wrong) : 0;
  // shards + surviving hearts + accuracy, with only a light time factor so
  // classes aren't punished for discussing answers properly
  return Math.round(
    run.shards * 10 +
    run.hearts * 25 +
    accuracy * 200 +
    Math.max(0, 60 - minutes) * 2
  );
}

function clearRealm() {
  const run = STATE.run;
  const realmId = run.realmId;
  const score = runScore();
  const minutes = Math.max(1, Math.round((Date.now() - run.startedAt) / 60000));
  let emberGained = Math.round(run.shards / 2) + 5;
  if (run.relics.some(r => r.id === "ember_pouch")) {
    emberGained = Math.round(emberGained * 1.5);
  }
  addEmber(emberGained);

  STATE.leaderboard.push({
    className: STATE.roster ? STATE.roster.className : "Unnamed class",
    partyName: STATE.roster ? (STATE.roster.partyName || "") : "",
    heroId: run.heroId,
    bestStreak: run.bestStreak || 0,
    realmId,
    score,
    minutes,
    hearts: run.hearts,
    maxHearts: run.maxHearts,
    shards: run.shards,
    correct: run.stats.correct,
    wrong: run.stats.wrong,
    monsters: run.stats.monsters,
    date: new Date().toISOString().slice(0, 10),
  });
  STATE.leaderboard.sort((a, b) => b.score - a.score);
  STATE.leaderboard = STATE.leaderboard.slice(0, 50);

  if (STATE.teacherAutoUnlock && REALMS[realmId + 1] &&
      !STATE.unlockedRealms.includes(realmId + 1)) {
    STATE.unlockedRealms.push(realmId + 1);
  }
  const nextUnlocked = STATE.unlockedRealms.includes(realmId + 1);
  STATE.run = null;
  saveState();
  return { emberGained, score, minutes, nextUnlocked };
}

// Party wipe. Alternates between banking Ember and keeping one relic so a
// reset doesn't feel identical every time.
function handleRunDeath() {
  const run = STATE.run;
  const keepRelic = run.relics.length > 0 && Math.random() < 0.5;
  let outcome;
  if (keepRelic) {
    outcome = { type: "relic", relic: pick(run.relics) };
  } else {
    const gained = run.shards + run.relics.length * 3 + 2;
    addEmber(gained);
    outcome = { type: "ember", amount: gained };
  }
  STATE.run = null;
  saveState();
  return outcome;
}

function teacherUnlock(realmId, unlocked) {
  if (unlocked && !STATE.unlockedRealms.includes(realmId)) {
    STATE.unlockedRealms.push(realmId);
  } else if (!unlocked) {
    STATE.unlockedRealms = STATE.unlockedRealms.filter(r => r !== realmId);
  }
  saveState();
}
