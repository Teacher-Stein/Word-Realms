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
  drain:  a => {
    // clamp the promise to what is actually there to steal
    const run = typeof STATE !== "undefined" ? STATE.run : null;
    const n = Math.min(a.shards || 0, run ? run.shards : (a.shards || 0));
    return a.dmg ? `💀 DRAINING — ${a.dmg} damage + ${n} shards`
                 : `💀 DRAINING — steals ${n} shards`;
  },
  // This used to read "N damage incoming" on EVERY turn of a multi-turn
  // wind-up, including the two turns that deal nothing at all. Combined with
  // the clock underneath it saying "ON THE NEXT ANSWER", the screen promised a
  // big hit three times and delivered it once - and the 1 damage the class saw
  // in between was the wrong-answer counter-attack, printed in the same words.
  // The label now counts its own fuse and only promises damage on the turn it
  // actually lands.
  charge: a => (a.turns > 0
    ? `🌀 CHARGING — ${a.dmg} damage in ${a.turns} more turn${a.turns === 1 ? "" : "s"}`
    : `🌀 UNLEASHING — ${a.dmg} damage NOW`),
  guard:  () => `🛡 RAISING GUARD — it will block your next hit`,
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

// How far into the year is this realm? Returns the extra HP and the cadence
// shift the ramp calls for. Kept in one place so a future realm cannot
// accidentally miss it.
function realmRamp() {
  const r = (STATE.run && STATE.run.realmId) || 1;
  const R = CONFIG.REALM_RAMP || {};
  return {
    monsterHp: Math.floor((r - 1) / (R.monsterHpPer || 99)),
    eliteHp:   Math.floor((r - 1) / (R.eliteHpPer || 99)),
    hearts:    Math.floor((r - 1) / (R.heartsPer || 99)),
    cadence:   (R.cadenceFrom && r >= R.cadenceFrom) ? -1 : 0,
  };
}

function makeMonster(base, isElite, isBoss = false) {
  const run = STATE.run;
  const ramp = realmRamp();
  let hp = isBoss ? 0
         : (isElite ? CONFIG.ELITE_HP + ramp.eliteHp
                    : CONFIG.MONSTER_HP + ramp.monsterHp);
  const variant = (!isElite && !isBoss) ? rollVariant() : null;

  if (variant) hp = Math.max(1, hp + variant.hpBonus);
  if (isElite && hasRelic("thunder_sigil")) hp = Math.max(2, hp - 1);

  let cadence = (base.cadence || 3) + ramp.cadence;
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
    // m.charging.dmg is the BASE damage. The enrage bonus is added here, for
    // display, and again at release - in one place each, from the same base.
    // Previously the bonus was baked into the stored value at telegraph time
    // and added a second time on release, so an enraged charge showed 4 and
    // dealt 5; and a charge that became enraged mid-wind-up showed 3 and dealt
    // 4. Both are telegraphs that lie in the player's disfavour.
    m.intent = { kind: "charge",
                 dmg: m.charging.dmg + (m.enraged ? 1 : 0),
                 turns: m.charging.turnsLeft };
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
  // Show what it will do NEXT as well as the fact that it is stunned. Hiding
  // the plan while stunned took the information away at exactly the moment the
  // class had a free turn to plan with it.
  if (m.stunned) {
    const fn = INTENT_TEXT[m.intent.kind];
    const next = fn ? fn(m.intent) : "";
    return next ? `✦ STUNNED — loses its turn · then ${next}`
                : "✦ STUNNED — loses its turn";
  }
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
      // A monster at full health used to float a green "+1" and announce that
      // it had healed, with its HP bar visibly unchanged. If there is nothing
      // to heal, say so rather than miming it.
      if (m.hp >= m.maxHp) {
        events.push({ type: "regen", full: true });
      } else {
        m.hp = Math.min(m.maxHp, m.hp + 1);
        events.push({ type: "regen" });
      }
      break;

    case "charge":
      if (!m.charging) {
        // strip the display bonus back off, so the stored value is the base
        const base = act.dmg - (m.enraged ? 1 : 0);
        m.charging = { dmg: Math.max(1, base), turnsLeft: (act.turns || 2) - 1 };
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

// Count down toward the monster's next action.
// One tick = one answered question, from anybody. Returns {acts, held}:
//   acts - the monster should take its turn right now
//   held - the Riposte Ring ate the tick, so the clock did not move. This used
//          to happen silently, which made the countdown look broken. It is now
//          reported so main.js can say so out loud.
function tickMonsterClock(m) {
  if (hasRelic("riposte_ring") && Math.random() < 0.34) {
    return { acts: false, held: true };
  }
  m.turnsUntilAct--;
  return { acts: m.turnsUntilAct <= 0, held: false };
}

// ---------------------------------------------------------------------------
// player damage output (never varies fight length by gear - always 1 hit,
// except the Giant-Slayer relic which is a deliberate exception the player
// chooses to take)
// ---------------------------------------------------------------------------
function playerDamageAgainst(m) {
  const run = STATE.run;
  if (!run || !m) return 0;
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
  // The Whispering Idol: the class chose to carry it, knowing this. It is the
  // one lasting effect in the game that makes the party WORSE at something, and
  // it scales with their real accuracy - a confident class profits, a shaky one
  // pays for it every single question.
  if (run.idolTaken) dmg += 1;
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
