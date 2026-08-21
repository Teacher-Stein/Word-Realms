// ---------------------------------------------------------------------------
// Combat model: monster instances, telegraphed intents, attacks and debuffs.
//
// Design rule that governs everything here: a monster may change the STAKES
// or the PROGRESS of a fight, but must never hide or remove the correct
// answer. A student who knows the word is never punished for knowing it.
// ---------------------------------------------------------------------------

const INTENT_TEXT = {
  hit:    a => `⚔ ATTACKING — ${a.dmg} damage`,
  heavy:  a => `⚔ HEAVY BLOW — ${a.dmg} damage`,
  flurry: a => `⚡ FLURRY — ${a.hits}× ${a.dmg} damage`,
  drain:  a => a.dmg ? `💀 DRAINING — ${a.dmg} damage + ${a.shards} shards`
                     : `💀 DRAINING — steals ${a.shards} shards`,
  charge: a => `🌀 CHARGING — ${a.dmg} damage incoming`,
  guard:  () => `🛡 GUARDING — takes no damage this turn`,
  regen:  () => `❤ REGENERATING — heals 1 HP`,
};
const INTENT_CLASS = { guard: "guard", regen: "regen", charge: "charge" };

const DEBUFF_TEXT = {
  chill:  "CHILLED — next hit deals no damage",
  expose: "EXPOSED — next wrong answer costs 2",
  freeze: "FROZEN — you must Brace",
};

// ---------------------------------------------------------------------------
// building a monster for an encounter
// ---------------------------------------------------------------------------
function rollVariant() {
  if (Math.random() > CONFIG.VARIANT_CHANCE) return null;
  return pick(MONSTER_VARIANTS);
}

function makeMonster(base, isElite, isBoss = false) {
  const run = STATE.run;
  let hp = isBoss ? 0 : (isElite ? CONFIG.ELITE_HP : CONFIG.MONSTER_HP);
  const variant = (!isElite && !isBoss) ? rollVariant() : null;

  if (variant) hp = Math.max(1, hp + variant.hpBonus);
  if (isElite && hasRelic("thunder_sigil")) hp = Math.max(2, hp - 1);

  let cadence = base.cadence || 3;
  if (variant) cadence = Math.max(1, cadence + variant.cadenceBonus);
  if (hasRelic("oracle_eye")) cadence += 1;     // more warning, same number of questions

  return {
    base,
    id: base.id,
    name: variant ? `${variant.prefix} ${base.name}` : base.name,
    sprite: base.sprite,
    variant,
    isElite, isBoss,
    hp, maxHp: hp,
    cadence,
    turnsUntilAct: cadence,
    intent: null,
    charging: null,     // {dmg, turnsLeft}
    guarding: false,
    teamUpUsed: false,
    teamUpCount: 0,
    helpers: [],
    turnsTaken: 0,
    enraged: false,
    stunned: false,
  };
}

// choose what the monster will do next and show it above their head
function chooseIntent(m) {
  if (m.charging) {
    m.intent = { kind: "charge", dmg: m.charging.dmg, turns: m.charging.turnsLeft };
    return m.intent;
  }
  const pool = m.base.attacks || [{ kind: "hit", dmg: 1 }];
  const a = pick(pool);
  m.intent = Object.assign({}, a);
  if (m.enraged && typeof m.intent.dmg === "number") m.intent.dmg += 1;
  return m.intent;
}

function intentLabel(m) {
  if (!m.intent) return "";
  if (m.stunned) return "✦ STUNNED — loses its turn";
  const fn = INTENT_TEXT[m.intent.kind];
  return fn ? fn(m.intent) : "";
}

// ---------------------------------------------------------------------------
// resolving a monster's turn
// Returns a description of what happened so main.js can animate it.
// ---------------------------------------------------------------------------
function monsterTakeTurn(m) {
  const run = STATE.run;
  m.turnsTaken++;

  if (m.stunned) {
    m.stunned = false;
    m.turnsUntilAct = m.cadence;
    chooseIntent(m);
    return { type: "stunned" };
  }

  const act = m.intent || chooseIntent(m);
  const events = [];

  switch (act.kind) {
    case "guard":
      m.guarding = true;
      events.push({ type: "guard" });
      break;

    case "regen":
      m.hp = Math.min(m.maxHp, m.hp + 1);
      events.push({ type: "regen" });
      break;

    case "charge":
      if (!m.charging) {
        m.charging = { dmg: act.dmg, turnsLeft: (act.turns || 2) - 1 };
        events.push({ type: "charging", turnsLeft: m.charging.turnsLeft });
      } else if (m.charging.turnsLeft > 0) {
        m.charging.turnsLeft--;
        events.push({ type: "charging", turnsLeft: m.charging.turnsLeft });
      } else {
        const dmg = m.charging.dmg + (m.enraged ? 1 : 0);
        m.charging = null;
        events.push({ type: "damage", dmg, label: "CRUSHING BLOW" });
      }
      break;

    case "flurry": {
      const hits = act.hits || 2;
      for (let i = 0; i < hits; i++) {
        events.push({ type: "damage", dmg: act.dmg, label: `HIT ${i + 1}/${hits}` });
      }
      break;
    }

    case "drain":
      if (act.shards) {
        const lost = Math.min(run.shards, act.shards);
        run.shards -= lost;
        events.push({ type: "drain", shards: lost });
      }
      if (act.dmg) events.push({ type: "damage", dmg: act.dmg, label: "DRAIN" });
      break;

    default:  // hit / heavy
      events.push({ type: "damage", dmg: act.dmg || 1, label: act.kind === "heavy" ? "HEAVY BLOW" : "" });
  }

  // enrage: a fight that drags becomes genuinely dangerous
  if (!m.enraged && m.turnsTaken >= CONFIG.ENRAGE_AFTER_TURNS) {
    m.enraged = true;
    events.push({ type: "enrage" });
  }

  // apply the monster's signature debuff now and then
  const special = m.base.special;
  if (special && !hasRelic("thaw_stone") && Math.random() < CONFIG.SPECIAL_CHANCE) {
    if (!(special === "expose" && run.armour === "aegis_mantle")) {
      run.debuff = special;
      events.push({ type: "debuff", debuff: special });
    }
  }

  m.turnsUntilAct = m.cadence;
  m.guarding = act.kind === "guard";
  chooseIntent(m);
  saveState();
  return { type: "acted", events };
}

// count down toward the monster's next action; true when it should act now
function tickMonsterClock(m) {
  if (hasRelic("riposte_ring") && Math.random() < 0.34) return false; // delayed
  m.turnsUntilAct--;
  return m.turnsUntilAct <= 0;
}

// ---------------------------------------------------------------------------
// player damage output (never varies fight length by gear - always 1 hit,
// except the Giant-Slayer relic which is a deliberate exception the player
// chooses to take)
// ---------------------------------------------------------------------------
function playerDamageAgainst(m) {
  const run = STATE.run;
  if (run.debuff === "chill") return 0;
  if (m.guarding) return 0;
  if (m.isElite && !m.isBoss && hasRelic("giant_slayer")) return 2;
  return 1;
}

// shards earned for landing one hit
function hitShards(q, m) {
  let n = CONFIG.SHARDS_PER_HIT;
  n += ((q && q.tier ? q.tier : 1) - 1) * CONFIG.SHARDS_TIER_BONUS;
  const run = STATE.run;
  const w = run.weapon ? gearById(run.weapon) : null;
  if (w && w.id === "storm_blade") n += 2;
  if (run.enchants && run.enchants.weapon === "greed_etch") n += 3;
  if (hasRelic("keen_edge")) n += 2;
  if (m && m.variant) n += m.variant.shardBonus;
  let crit = false;
  if (w && w.id === "thunder_pike" && Math.random() < 0.25) { n *= 2; crit = true; }
  return { amount: Math.max(1, n), crit };
}

// does this hit stun the monster?
function rollStun() {
  const run = STATE.run;
  const w = run.weapon ? gearById(run.weapon) : null;
  if (w && w.id === "warding_stave" && Math.random() < 0.34) return true;
  if (run.enchants && run.enchants.weapon === "frost_etch" && Math.random() < 0.25) return true;
  return false;
}

// damage the party takes from one incoming hit, after tier/debuff/gear
function incomingDamage(baseDmg, m) {
  const run = STATE.run;
  let dmg = baseDmg;
  const armour = run.armour ? gearById(run.armour) : null;
  if (armour && armour.id === "stormhide" && (m.isElite || m.isBoss)) dmg -= 1;
  return Math.max(0, dmg);
}

// wrong-answer damage is driven by the question's difficulty tier
function wrongAnswerDamage(q) {
  const run = STATE.run;
  const tier = q && q.tier ? q.tier : 1;
  let dmg = CONFIG.TIER_DAMAGE[tier] || 1;
  if (run.debuff === "expose") dmg += 1;
  return dmg;
}

// The voice a monster answers in. Variants shift the pitch so a Frenzied
// Wyrm doesn't sound identical to an Ancient one.
function monsterVoice(m) {
  if (!m || !m.base) return null;
  const mult = m.variant
    ? (m.variant.id === "frenzied" ? 1.22 : m.variant.id === "ancient" ? 0.82 : 1.12)
    : 1;
  return {
    voice: m.base.voice,
    pitch: (m.base.pitch || 220) * mult,
    size: m.isElite ? Math.min(1, (m.base.size || 0.5) + 0.1) : m.base.size,
  };
}

function clearDebuff() {
  if (STATE.run) { STATE.run.debuff = null; saveState(); }
}
function isFrozen() {
  return !!(STATE.run && STATE.run.debuff === "freeze");
}
