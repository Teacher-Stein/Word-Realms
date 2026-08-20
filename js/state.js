// ---------------------------------------------------------------------------
// Game state: persistence, party, roster, per-student stats, leaderboard,
// run lifecycle. Everything is stored in this browser (classroom computer).
// Data is shaped so it can later be pushed to a shared backend unchanged.
// ---------------------------------------------------------------------------

const RELIC_POOL = [
  { id:"lucky_charm", name:"Lucky Charm",
    desc:"The first wrong answer each realm costs no heart." },
  { id:"second_wind", name:"Second Wind",
    desc:"Start each run with 1 extra heart." },
  { id:"echo_shard",  name:"Echo Shard",
    desc:"Removes one wrong option, once per realm." },
  { id:"storm_map",   name:"Storm-Worn Map",
    desc:"Bonus shards from every Treasure room." },
  { id:"warm_cloak",  name:"Warm Cloak",
    desc:"Rest rooms heal 2 hearts instead of 1." },
];

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
    return Object.assign(defaultState(), JSON.parse(raw));
  } catch (e) {
    console.warn("save load failed, starting fresh", e);
    return defaultState();
  }
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
function setRoster(className, students) {
  STATE.roster = { className: className.trim(), students: students.slice() };
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
function startNewRun(realmId) {
  const realm = REALMS[realmId];
  const map = generateMap(realm);
  let hearts = CONFIG.START_HEARTS;
  if (STATE.permanentPerks.includes("second_wind")) hearts += 1;

  STATE.run = {
    realmId,
    map,
    currentNodeId: map.nodes[0].id,
    visitedNodeIds: [map.nodes[0].id],
    hearts,
    maxHearts: Math.max(CONFIG.START_HEARTS, hearts),
    shards: 0,
    relics: [],
    coveredKeys: [],       // curriculum items already tested this run
    usedQuestionIdx: [],   // avoid repeating the exact same question
    usedLuckyCharm: false,
    usedEcho: false,
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
  if (!run.usedLuckyCharm && run.relics.some(r => r.id === "lucky_charm")) {
    run.usedLuckyCharm = true;
    saveState();
    return { blocked: true, dead: false };
  }
  run.hearts = Math.max(0, run.hearts - n);
  saveState();
  return { blocked: false, dead: run.hearts <= 0 };
}

function heal(n = 1) {
  const run = STATE.run;
  if (!run) return;
  run.hearts = Math.min(run.maxHearts, run.hearts + n);
  saveState();
}

function addShards(n) { STATE.run.shards += n; saveState(); }
function addEmber(n)  { STATE.ember += n; saveState(); }

function addRelic(relic) {
  STATE.run.relics.push(relic);
  if (relic.id === "second_wind") {
    STATE.run.maxHearts += 1;
    STATE.run.hearts += 1;
  }
  saveState();
}

function availableRelic() {
  const owned = STATE.run.relics.map(r => r.id);
  const pool = RELIC_POOL.filter(r => !owned.includes(r.id));
  return pool.length ? pick(pool) : pick(RELIC_POOL);
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
  const emberGained = Math.round(run.shards / 2) + 5;
  addEmber(emberGained);

  STATE.leaderboard.push({
    className: STATE.roster ? STATE.roster.className : "Unnamed class",
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
