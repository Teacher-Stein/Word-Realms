// v6.1 balance model. Focus and streaks are gone; the monster's clock does
// the work instead. See config.js MONSTER_CADENCE for why.
//
//   Stakes - each question is answered SAFE or RISKY. RISKY doubles shards and
//            DOUBLES the damage a wrong answer costs. It never changes damage
//            dealt, so it cannot shorten a fight.
//   Focus  - once per FIGHT. A correct answer puts CONFIG.FOCUS_STUN_ANSWERS
//            ticks back on the monster's clock, which delays a monster action
//            and therefore LENGTHENS the fight.
//
// The thing being measured: Momentum's Guard used to absorb a chunk of the
// incoming damage. Taking it out while adding a mechanic that DOUBLES
// wrong-answer damage pushes the threat up from both directions at once, so
// hearts almost certainly have to move. This finds by how much.
const fs = require('fs'), vm = require('vm');
const D = '/home/claude/dungeon-crawler/';
vm.runInThisContext(fs.readFileSync(D + 'js/config.js', 'utf8'));
const raw = fs.readFileSync(D + 'js/content.js', 'utf8');
const COVER = [...new Set([...raw.matchAll(/cover:"([^"]+)"/g)].map(m => m[1]))];
vm.runInThisContext(raw.slice(raw.indexOf('const REALM1_MONSTERS'), raw.indexOf('const REALMS =')));
let O = {};
vm.runInThisContext(fs.readFileSync(D + 'js/mapgen.js', 'utf8'));

function atk(a, en) {
  if (a.kind === 'guard' || a.kind === 'regen' || a.kind === 'charge') return 0;
  const b = en ? 1 : 0;
  if (a.kind === 'flurry') return (a.dmg + b) * (a.hits || 2);
  return (a.dmg || 1) + b;
}

function runOne(acc, S) {
  CONFIG.LAYERS_PER_REALM = O.layers;
  const map = generateMap({ coverKeys: COVER });
  const p = { hearts: O.hearts, maxHearts: O.hearts, shields: O.shields, ls: true };

  const fight = (mon, hp, isE) => {
    // O.cadenceBonus models a hero perk or relic that lengthens the monster's
    // countdown (the Phonics Ranger's eye, the Oracle's Eye relic). It never
    // shortens a fight - the monster's HP is unchanged, so the same number of
    // correct answers is still needed to fell it. What it changes is how often
    // the monster gets to swing back, which is exactly what needs measuring.
    let monHp = hp,
        cad = Math.max(1, CONFIG.MONSTER_CADENCE || mon.cadence || 3),
        // O.cadenceFirstOnly gives the bonus to the OPENING countdown only:
        // the monster's first swing is late, then it settles into its normal
        // rhythm. That matters because a permanent bonus compounds with fight
        // length - worth little in a 4-question skirmish and a great deal in a
        // 12-question boss, which is precisely where runs are lost.
        bonus = O.cadenceBonus || 0,
        until = cad + bonus;
    let t = 0, en = false, n = 0;
    let shieldPaid = 0;                     // RISKY shields are capped per fight
    const h0 = p.hearts;
    let aimed = 0, wrongDmg = 0, clockDmg = 0;

    while (monHp > 0 && p.hearts > 0 && t < 90) {
      t++; n++;


      // Stakes policy. A class that plays it safe risks rarely; a bold class
      // risks often. Crucially children misjudge: they take RISKY on questions
      // they are LESS sure of about O.riskMisjudge of the time, so a risky
      // answer is slightly less accurate than a safe one.
      // v5.2 control mode: bank Momentum on correct answers, spend 3 on a
      // Guard that takes 2 off a telegraphed blow. No stakes at all.
      if (O.v52) {
        const right52 = Math.random() < acc;
        if (right52) { monHp -= 1; p.mo = Math.min(6, (p.mo || 0) + 1); }
        else {
          const tier = isE ? (Math.random() < 0.65 ? 4 : 1)
                           : (Math.random() < 0.18 ? 3 : (Math.random() < 0.5 ? 2 : 1));
          const d = CONFIG.TIER_DAMAGE[tier] || 1;
          aimed += d; wrongDmg += d;
          const ab = Math.min(p.shields, d); p.shields -= ab; p.hearts -= (d - ab);
        }
        if (monHp <= 0) break;
        if (--until <= 0) {
          if (t >= CONFIG.ENRAGE_AFTER_TURNS) en = true;
          const a = mon.attacks[Math.floor(Math.random() * mon.attacks.length)];
          let d = atk(a, en);
          if (a.kind === 'charge' && Math.random() < 0.5) d = a.dmg + (en ? 1 : 0);
          if (d >= 2 && (p.mo || 0) >= 3 && Math.random() < O.moEff) { p.mo -= 3; d = Math.max(0, d - 2); }
          aimed += d; clockDmg += d;
          const ab = Math.min(p.shields, d); p.shields -= ab; p.hearts -= (d - ab);
          S.acts++; until = cad + (O.cadenceFirstOnly ? 0 : bonus);
        }
        if (p.hearts <= 0 && p.ls) { p.ls = false; if (Math.random() < acc) p.hearts = 1; }
        continue;
      }

      const risky = Math.random() < O.riskRate;
      const eff = risky ? Math.max(0.05, acc - O.riskMisjudge) : acc;
      const right = Math.random() < eff;

      if (right) {
        monHp -= 1;                          // nothing ever shortens a fight
        // A landed RISKY pays in SHIELDS as well as shards. Without this,
        // bold play is strictly worse than safe play - the shards only cash
        // out at a shop several rooms later, while the doubled damage lands
        // immediately - so RISKY is a trap rather than a trade. Shields do not
        // shorten fights, so this is a legal way to pay for courage.
        // The shield is paid only for a BLIND call - RISKY on an `open`
        // question with the options hidden - not for every RISKY. Paying it on
        // all of them made RISKY quasi-mandatory: a class that always played
        // SAFE wiped 17 points more often, which is the same trap Momentum
        // fell into. ~54% of the bank can be called blind (59 of 109).
        if (risky && Math.random() < O.blindFrac && shieldPaid < O.riskShieldCap) {
          p.shields += O.riskShield; shieldPaid += O.riskShield; S.riskWins++;
        }
      } else {
        const tier = isE ? (Math.random() < 0.65 ? 4 : 1)
                         : (Math.random() < 0.18 ? 3 : (Math.random() < 0.5 ? 2 : 1));
        let d = (CONFIG.TIER_DAMAGE[tier] || 1) * (risky ? CONFIG.STAKE_RISKY_DAMAGE : 1);
        aimed += d; wrongDmg += d;
        const ab = Math.min(p.shields, d); p.shields -= ab; p.hearts -= (d - ab);
      }

      if (monHp <= 0) break;

      if (--until <= 0) {
        if (t >= CONFIG.ENRAGE_AFTER_TURNS) en = true;
        const a = mon.attacks[Math.floor(Math.random() * mon.attacks.length)];
        let d = atk(a, en);
        if (a.kind === 'charge' && Math.random() < 0.5) d = a.dmg + (en ? 1 : 0);
        aimed += d; clockDmg += d;
        const ab = Math.min(p.shields, d); p.shields -= ab; p.hearts -= (d - ab);
        S.acts++; until = cad + (O.cadenceFirstOnly ? 0 : bonus);
      }
      if (p.hearts <= 0 && p.ls) { p.ls = false; if (Math.random() < acc) p.hearts = 1; }
    }
    S.wrongDmg += wrongDmg; S.clockDmg += clockDmg;
    if (!isE) {
      S.f++; if (p.hearts >= h0) S.fNoHeart++; if (aimed === 0) S.fNoAim++; S.fq += n;
    } else { S.e++; S.eq += n; }
    return n;
  };

  let cur = map.nodes[0].id, q = 0, rooms = 0;
  const covered = new Set();
  while (true) {
    const nd = map.nodes.find(x => x.id === cur);
    if (nd.type === 'boss') break;
    cur = nd.connectsTo[Math.floor(Math.random() * nd.connectsTo.length)];
    const nn = map.nodes.find(x => x.id === cur); rooms++;
    if (nn.type === 'rest') {
      if (p.hearts <= p.maxHearts - 2) p.hearts = Math.min(p.maxHearts, p.hearts + CONFIG.REST_HEAL);
      else if (p.shields < CONFIG.REST_SHIELDS * 0.5) p.shields = CONFIG.REST_SHIELDS;
      else { p.maxHearts++; p.hearts++; }
    }
    if (nn.type === 'fight' || nn.type === 'elite') {
      const isE = nn.type === 'elite';
      const pool = isE ? REALM1_ELITES : REALM1_MONSTERS;
      const got = fight(pool[Math.floor(Math.random() * pool.length)],
                        isE ? CONFIG.ELITE_HP : CONFIG.MONSTER_HP, isE);
      q += got;
      for (let i = 0; i < got; i++) {
        const f = COVER.filter(k => !covered.has(k));
        if (f.length) covered.add(f[Math.floor(Math.random() * f.length)]);
      }
      if (p.hearts <= 0) return { q, rooms, dead: true };
    } else if (nn.type === 'treasure') q++;
    else if (nn.type === 'event') {
      // v5.8: several events are resolved by ANSWERING. Modelled as an average
      // over the bank - four of eleven ask questions (1, 1, 3 and 3 of them),
      // and a class takes the question option most of the time because it is
      // usually the better one.
      if (Math.random() < 0.36 * 0.8) { const n = Math.random() < 0.5 ? 1 : 3; q += n; S.eventQ += n; }
    }
  }
  const missing = COVER.filter(k => !covered.has(k)).length;
  q += fight({ cadence: CONFIG.BOSS_CADENCE,
               attacks: [{ kind: 'heavy', dmg: 2 }, { kind: 'flurry', dmg: 1, hits: 3 },
                         { kind: 'charge', dmg: 4, turns: 2 }, { kind: 'drain', dmg: 1 }] },
             Math.max(CONFIG.BOSS_MIN_QUESTIONS, Math.min(missing, CONFIG.BOSS_MAX_QUESTIONS)), true);
  return { q, rooms, dead: p.hearts <= 0 };
}

function shape(label, opt) {
  // Starting shields are READ FROM CONFIG, not hard-coded.
  //
  // This line said `shields: 2` for six versions while the game handed the
  // party a full campfire Repair on the first screen - 18 by v6.2. So every
  // wipe rate this file has ever reported was measured against a party nine
  // times weaker at the door than the real one, and a chunk of the "the
  // simulator reads pessimistic" folklore was simply this: it was playing a
  // different game.
  //
  // Any number in here is worthless if it is not reading the same config the
  // browser reads. Do not hard-code a starting resource again.
  O = Object.assign({ layers: CONFIG.LAYERS_PER_REALM,
                      shields: CONFIG.START_SHIELDS,
                      hearts: CONFIG.START_HEARTS,
                      riskRate: 0.30, riskMisjudge: 0.06, riskShield: 1, riskShieldCap: 2, v52: false, moEff: 0.45, blindFrac: 0.54 }, opt);
  const cells = [];
  for (const acc of [0.95, 0.85, 0.75]) {
    const S = { f:0, fNoHeart:0, fNoAim:0, fq:0, e:0, eq:0, acts:0,
                focus:0, stunTicks:0, wrongDmg:0, clockDmg:0, riskWins:0, eventQ:0 };
    let q = 0, d = 0, r = 0; const N = 2500;
    for (let i = 0; i < N; i++) { const x = runOne(acc, S); q += x.q; r += x.rooms; if (x.dead) d++; }
    if (acc === 0.85) {
      const tot = S.wrongDmg + S.clockDmg;
      cells.push(`q ${(q/N).toFixed(0)} (ev ${(S.eventQ/N).toFixed(1)}) · q/fight ${(S.fq/S.f).toFixed(1)} · painless ${(S.fNoHeart/S.f*100).toFixed(0)}% · acts/fight ${(S.acts/(S.f+S.e)).toFixed(1)} · wrong=${(S.wrongDmg/tot*100).toFixed(0)}% of dmg`);
    }
    cells.push(`${(acc*100)|0}%: ${(d/N*100).toFixed(0)}%`);
  }
  console.log(label.padEnd(34), cells.join('  |  '));
}

function trio(label, opt) {
  console.log('\n  ' + label);
  shape('    plays it safe        ', Object.assign({}, opt, { riskRate: 0.08, }));
  shape('    typical class',             Object.assign({}, opt, { riskRate: 0.30 }));
  shape('    bold, risks often  ',     Object.assign({}, opt, { riskRate: 0.65, }));
}

console.log('shape'.padEnd(42), 'at 85% accuracy  |  wipe rate by accuracy');
console.log('\n=== v5.2 CONTROL: Momentum Guard, no Stakes, 9 hearts (what Stein has now) ===');
shape('  typical class',    { hearts: 9, v52: true, moEff: 0.45 });

console.log('\n=== v6.1: Stakes only, sweeping hearts to match ===');
for (const h of [9, 11, 13, 15, 17, 19, 21]) {
  console.log('\n  ' + h + ' hearts');
  shape('    plays it safe        ', { hearts: h, riskRate: 0.08, });
  shape('    typical class',             { hearts: h, riskRate: 0.30 });
  shape('    bold, risks often  ',     { hearts: h, riskRate: 0.65, });
}

// ---------------------------------------------------------------------------
// v6.3: what does the Phonics Ranger's new perk actually cost?
//
// Her old perk (+50% shards on everything) was picked every time by every
// class, which meant the shop economy was permanently running at 1.5x income
// against 1.0x prices. The replacement lengthens the monster's countdown by
// one, the same shape as the Oracle's Eye relic.
//
// Two things to check here, and only the second is about difficulty:
//   1. Questions per run must NOT fall. The monster's HP is untouched, so it
//      should not - but rule 1 is worth measuring, not assuming.
//   2. How much easier does it make a run? A hero perk should be worth about
//      as much as three shields or two potions, not a free win.
console.log('\n=== v6.3: the Phonics Ranger, +1 to the monster countdown ===');
trio('everyone else (no bonus)', { cadenceBonus: 0 });
trio('the Phonics Ranger', { cadenceBonus: 1 });

// A perk is only "too strong" relative to the other three. The Knight's whole
// gift is +3 shields on top of the starting 6, so that is the yardstick: a hero
// perk should be worth roughly what she is worth, not several times it.
console.log('\n=== v6.3: the Ranger measured against the Knight ===');
shape('  nobody (bare start)', { riskRate: 0.30 });
shape('  the Knight (+3 shields)', { riskRate: 0.30, shields: CONFIG.START_SHIELDS + 3 });
shape('  the Ranger (+1 countdown)', { riskRate: 0.30, cadenceBonus: 1 });

console.log('\n=== v6.3: permanent bonus vs opening-only ===');
shape('  the Ranger, every countdown', { riskRate: 0.30, cadenceBonus: 1 });
shape('  the Ranger, opening only', { riskRate: 0.30, cadenceBonus: 1, cadenceFirstOnly: true });
