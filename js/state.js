// ---------------------------------------------------------------------------
// Game state: persistence, hearts/shards/ember/relics, run lifecycle.
// ---------------------------------------------------------------------------

const RELIC_POOL = [
  { id:"lucky_charm", name:"Lucky Charm", desc:"The first wrong answer each realm doesn't cost a heart." },
  { id:"second_wind", name:"Second Wind", desc:"Start each run with 1 extra heart." },
  { id:"echo_shard", name:"Echo Shard", desc:"One free 50/50 hint per realm (removes one wrong choice)." },
  { id:"storm_map", name:"Storm-Worn Map", desc:"Reveals node types one layer further ahead." },
];

function defaultState() {
  return {
    unlockedRealms: CONFIG.DEFAULT_UNLOCKED.slice(),
    teacherAutoUnlock: false,
    difficulty: CONFIG.DIFFICULTY,
    ember: 0,                 // meta-currency, survives permadeath
    permanentPerks: [],       // bought with ember, persist forever
    run: null,                // active run state, or null if none
    soundOn: true,
  };
}

let STATE = loadState();

function loadState() {
  try {
    const raw = localStorage.getItem(CONFIG.SAVE_KEY);
    if (!raw) return defaultState();
    const parsed = JSON.parse(raw);
    return Object.assign(defaultState(), parsed);
  } catch (e) {
    console.warn("save load failed, starting fresh", e);
    return defaultState();
  }
}

function saveState() {
  localStorage.setItem(CONFIG.SAVE_KEY, JSON.stringify(STATE));
}

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
    maxHearts: Math.min(CONFIG.MAX_HEARTS, hearts),
    shards: 0,
    relics: [],
    usedLuckyCharm: false,
    askedTags: [],
    bossQueue: [],
    bossIndex: 0,
    log: [],
  };
  saveState();
  return STATE.run;
}

function currentRealm() {
  if (!STATE.run) return null;
  return REALMS[STATE.run.realmId];
}

function damage(n=1) {
  const run = STATE.run;
  if (!run) return;
  if (!run.usedLuckyCharm && STATE.permanentPerks.includes("lucky_charm_perk")) {
    run.usedLuckyCharm = true;
    saveState();
    return { blocked: true };
  }
  run.hearts = Math.max(0, run.hearts - n);
  saveState();
  return { blocked: false, dead: run.hearts <= 0 };
}

function heal(n=1) {
  const run = STATE.run;
  if (!run) return;
  run.hearts = Math.min(run.maxHearts, run.hearts + n);
  saveState();
}

function addShards(n) {
  STATE.run.shards += n;
  saveState();
}

function addEmber(n) {
  STATE.ember += n;
  saveState();
}

function addRelic(relic) {
  STATE.run.relics.push(relic);
  saveState();
}

// Called when hearts hit 0: true roguelike reset of THIS realm's run, but the
// class keeps something. Randomly alternates between "bank everything as
// Ember" and "keep one relic" so it doesn't feel the same every time.
function handleRunDeath() {
  const run = STATE.run;
  const keepRelic = run.relics.length > 0 && Math.random() < 0.5;
  let outcome;
  if (keepRelic) {
    const kept = pick(run.relics);
    outcome = { type: "relic", relic: kept };
  } else {
    const emberGained = run.shards + run.relics.length * 3 + 2;
    addEmber(emberGained);
    outcome = { type: "ember", amount: emberGained };
  }
  STATE.run = null;
  saveState();
  return outcome;
}

function clearRealm() {
  const run = STATE.run;
  const realmId = run.realmId;
  const emberGained = Math.round(run.shards / 2) + 5;
  addEmber(emberGained);

  if (!STATE.unlockedRealms.includes(realmId + 1) && REALMS[realmId + 1]) {
    if (STATE.teacherAutoUnlock) {
      STATE.unlockedRealms.push(realmId + 1);
    }
  }
  STATE.run = null;
  saveState();
  return { emberGained, nextUnlocked: STATE.unlockedRealms.includes(realmId + 1) };
}

function teacherUnlock(realmId, unlocked) {
  if (unlocked && !STATE.unlockedRealms.includes(realmId)) {
    STATE.unlockedRealms.push(realmId);
  } else if (!unlocked) {
    STATE.unlockedRealms = STATE.unlockedRealms.filter(r => r !== realmId);
  }
  saveState();
}
