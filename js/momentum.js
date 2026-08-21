// ---------------------------------------------------------------------------
// MOMENTUM
//
// The problem this solves: a correct answer used to produce a number going
// down and nothing else. There was exactly one decision in the game (which of
// three answers) and it belonged to one student. Momentum turns every correct
// answer into a banked resource the WHOLE CLASS then has to decide what to do
// with, without costing a single question.
//
// The cap is what makes it a decision. You cannot save for everything, so
// spending on a Heavy Strike now is choosing not to have a Guard ready when
// the monster's countdown reaches zero.
// ---------------------------------------------------------------------------

const MOMENTUM_MOVES = [
  { id: "insight", name: "Insight",      cost: () => CONFIG.MO_INSIGHT,
    blurb: "Remove a wrong answer from the next question",
    icon: "assets/items/echo_shard.png" },

  { id: "rouse",   name: "Rouse",        cost: () => CONFIG.MO_ROUSE,
    blurb: "Your next correct answer pays double shards",
    icon: "assets/items/coin_purse.png" },

  { id: "guard",   name: "Guard",        cost: () => CONFIG.MO_GUARD,
    blurb: `Stop ${CONFIG.MO_GUARD_BLOCK} damage from the next attack`,
    icon: "assets/items/aegis_charm.png" },

  { id: "rally",   name: "Rally",        cost: () => CONFIG.MO_RALLY,
    blurb: "Restore one heart",
    icon: "assets/items/potion_heal.png" },
];

function moveById(id) { return MOMENTUM_MOVES.find(m => m.id === id); }

function momentum()    { return (STATE.run && STATE.run.momentum) || 0; }
function momentumCap() { return CONFIG.MOMENTUM_CAP; }

// Earned on every correct answer in a fight. Returns true if the pool moved,
// so the UI can flash the meter.
function gainMomentum(n = 1) {
  const run = STATE.run;
  if (!run) return false;
  const before = run.momentum || 0;
  run.momentum = Math.min(momentumCap(), before + n);
  saveState();
  return run.momentum !== before;
}

function canAfford(move) {
  return momentum() >= move.cost();
}

// Spend. Returns {ok, move, reason} so main.js can narrate it.
function spendMomentum(id) {
  const run = STATE.run;
  const move = moveById(id);
  if (!run || !move) return { ok: false, reason: "unknown" };
  if (!canAfford(move)) return { ok: false, reason: "poor", move };

  // Only one attack-modifier can be primed at a time, so the class can't
  // stack three Heavy Strikes onto one answer.
  if (id === "rouse" && run.moRouse) return { ok: false, reason: "already", move };
  if (id === "guard" && run.moGuard) return { ok: false, reason: "already", move };

  run.momentum -= move.cost();
  let note = move.blurb;

  if (id === "rouse") {
    run.moRouse = true;
  } else if (id === "guard") {
    run.moGuard = true;
  } else if (id === "rally") {
    const before = run.hearts;
    heal(1);
    note = run.hearts > before ? "+1 heart" : "Already at full health";
  } else if (id === "insight") {
    run.clarityActive = true;
  }
  saveState();
  return { ok: true, move, note };
}

// Called when the party lands a hit: consumes a primed Rouse. Pays in shards,
// never in damage - a bigger hit would mean a shorter fight.
function momentumShardMultiplier() {
  const run = STATE.run;
  if (!run || !run.moRouse) return 1;
  run.moRouse = false;
  saveState();
  return 2;
}

// Called when a blow is about to land: consumes a primed Guard and returns how
// much of the blow it stops. Deliberately capped - a Guard that stopped
// everything made Momentum the only thing keeping a party alive, and any class
// that didn't master it was doomed.
function momentumGuardAmount() {
  const run = STATE.run;
  if (!run || !run.moGuard) return 0;
  run.moGuard = false;
  saveState();
  return CONFIG.MO_GUARD_BLOCK;
}

// Momentum is a per-fight tempo resource, not a bank. It carries between
// rooms at half value so a good fight still leaves the party ahead, but a
// class can't hoard six Guards across the whole map for the boss.
function decayMomentum() {
  const run = STATE.run;
  if (!run) return;
  run.momentum = Math.floor((run.momentum || 0) / 2);
  run.moRouse = false;
  run.moGuard = false;
  saveState();
}
