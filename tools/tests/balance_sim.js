// v6.7 balance model.
//
//   Stakes - each question is answered SAFE or RISKY. RISKY pays double shards,
//            DEALS double damage, and costs a FLAT 4 hearts when wrong (6 from
//            the tier-3/4 bank). It is the first mechanic in this game allowed
//            to shorten a fight; see the lesson model at the bottom for the
//            measurement that permitted it.
//   Clock  - the monster acts every CONFIG.MONSTER_CADENCE answers. This is the
//            counterweight: a shorter fight means fewer swings, so the cadence
//            had to come down with it or half of all fights would contain no
//            monster attack at all.
//
// EVERYTHING HERE READS FROM CONFIG. Do not hard-code a game number in this
// file. A simulator playing a different game from the browser is worse than no
// simulator, and this file has shipped that bug twice - once with starting
// shields (see shape() below) and once with the curriculum keys (see COVER).
const fs = require('fs'), vm = require('vm');
const D = __dirname + '/../../';
vm.runInThisContext(fs.readFileSync(D + 'js/config.js', 'utf8'));
vm.runInThisContext(fs.readFileSync(D + 'js/content.js', 'utf8'));

// ONE realm's curriculum keys, not every realm's.
//
// This used to regex `cover:"..."` out of the whole of content.js, which
// pooled Realm 1's 32 keys with Realm 2's 32 and produced 64. The boss's HP is
// the number of keys the class did NOT cover, so with a 64-key denominator the
// boss was pinned at its cap of 20 in every single scenario - and the effect
// that matters most in v6.7 (a shorter fight leaves more keys untouched, so
// the boss grows) was invisible in every measurement this file produced.
//
// A run happens in one realm. Read one realm's keys.
const COVER = REALMS[1].coverKeys.slice();
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
    // The BOSS keeps its own cadence. main.js overwrites the boss's clock with
    // CONFIG.BOSS_CADENCE after building it, so MONSTER_CADENCE does not reach
    // it - and this file did not know that, which meant taking the cast to
    // cadence 2 in v6.7 silently sped the boss up here and nowhere else. The
    // boss is already getting harder on its own (it is made of uncovered keys,
    // and v6.7 leaves more of them uncovered); it does not need a second rise
    // that only exists in the simulator.
    let monHp = hp,
        cad = Math.max(1, mon.bossClock || CONFIG.MONSTER_CADENCE || mon.cadence || 3),
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
      // risks often, and a risky answer is less accurate than a safe one by
      // O.riskMisjudge.
      //
      // v7.0 RAISED THAT FROM 6 POINTS TO 10, because RISKY now always means
      // saying the answer with nothing on screen. Where the number comes from:
      // a multiple choice hands a student who does NOT know a 1-in-3 guess, and
      // at 85% accuracy they are in that position 15% of the time, so the guess
      // alone is worth about 5 points. Add a little for production being harder
      // than recognition even when you half-know it, and 8-10 is the honest
      // range.
      //
      // IT MATTERS WHICH END. At 10 points a bold class wipes 88% against a
      // cautious 79% - a decision worth making either way. At 15 it is 93%
      // against 79%, and playing safe becomes strictly correct, which is the
      // v6.6 fault inverted. If the first lesson shows bold classes dying far
      // more often, the lever is the flat penalty: 4/6 down to 3/5.
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

      // v7.0: RISKY is only OFFERED where the question can be said aloud, which
      // after the clue rewrites is ~90% of the bank (it was ~30-50%, and the
      // rest of the time RISKY silently meant "same multiple choice, bigger
      // stakes"). O.blindFrac is now that availability, so a class that wants
      // to gamble can only do it when the game lets them.
      const risky = (Math.random() < O.blindFrac) && (Math.random() < O.riskRate);
      const eff = risky ? Math.max(0.05, acc - O.riskMisjudge) : acc;
      const right = Math.random() < eff;

      if (right) {
        // v6.7: a landed RISKY deals 2. This is the payoff that arrives in the
        // same second as the risk - shards only cash out at a shop several
        // rooms later, and a class deciding under pressure does not weigh a
        // reward that far away. Before this, courage had to be bribed with a
        // free shield (see STAKE_BLIND_SHIELD) and it still read as a trap.
        monHp -= risky ? (CONFIG.STAKE_RISKY_DAMAGE_DEALT || 2) : 1;
        if (risky) S.riskWins++;
        // Blind calls paid a shield until v6.7. STAKE_BLIND_SHIELD is 0 now, so
        // this contributes nothing unless somebody turns it back on - which is
        // the point of leaving it wired to the config rather than deleting it.
        if (risky && CONFIG.STAKE_BLIND_SHIELD &&
            Math.random() < O.blindFrac && shieldPaid < CONFIG.STAKE_SHIELD_CAP) {
          p.shields += CONFIG.STAKE_BLIND_SHIELD;
          shieldPaid += CONFIG.STAKE_BLIND_SHIELD;
        }
      } else {
        const tier = isE ? (Math.random() < 0.65 ? 4 : 1)
                         : (Math.random() < 0.18 ? 3 : (Math.random() < 0.5 ? 2 : 1));
        // FLAT, not a multiple of the tier cost. Multiplying could not be
        // balanced: the multiplier needed to deter a confident class was about
        // 5x, and 5x a tier-4 question is 10 of 11 hearts.
        let d = risky
          ? (tier >= 3 ? CONFIG.STAKE_RISKY_FLAT_HARD : CONFIG.STAKE_RISKY_FLAT)
          : (CONFIG.TIER_DAMAGE[tier] || 1);
        if (O.luckyCharm && !p.charmUsed) { p.charmUsed = true; d = 0; }
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
    // A Chorus room asks CHORUS_QUESTIONS of the WHOLE CLASS and cannot cost a
    // heart. It is modelled here because v6.5 paid for it out of the map's
    // `safe` and `treasure` weight, which lowered the share of fights - and a
    // change that lowers the share of fights has to be shown NOT to lower the
    // number of questions, rather than assumed not to.
    if (nn.type === 'chorus') {
      const n = CONFIG.CHORUS_QUESTIONS;
      q += n; S.chorusQ += n;
      // The room answers together, so the shard payout follows the class's
      // accuracy rather than one child's. No damage, ever.
      // Rolled PER QUESTION, not once for the room. Rolling once and
      // multiplying made a good room pay three times over and overstated the
      // shields a Chorus hands out.
      for (let i = 0; i < n; i++) {
        const lvl = Math.random() < acc - 0.1 ? 'good'
                  : Math.random() < 0.6 ? 'half' : 'poor';
        p.shields += CONFIG.CHORUS_REWARD[lvl].shields;
      }
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
      if (p.hearts <= 0) return { q, rooms, dead: true, coveredSet: covered };
    } else if (nn.type === 'treasure') q++;
    else if (nn.type === 'event') {
      // v5.8: several events are resolved by ANSWERING. Modelled as an average
      // over the bank - four of eleven ask questions (1, 1, 3 and 3 of them),
      // and a class takes the question option most of the time because it is
      // usually the better one.
      if (Math.random() < 0.36 * 0.8) { const n = Math.random() < 0.5 ? 1 : 3; q += n; S.eventQ += n; }
    }
  }
  // THE BOSS IS MADE OF WHAT THE CLASS DID NOT COVER. This is the mechanism
  // that makes v6.7 safe: RISKY shortens ordinary fights, so fewer curriculum
  // keys get touched on the way, so the boss is bigger when they arrive. The
  // questions are not lost, they are moved to the end and asked at tier 4
  // against the hardest monster in the realm. Stein spotted this before the
  // simulator did.
  const missingKeys = COVER.filter(k => !covered.has(k));
  const bossHp = Math.max(CONFIG.BOSS_MIN_QUESTIONS,
                          Math.min(missingKeys.length, CONFIG.BOSS_MAX_QUESTIONS));
  if (S.bosses !== undefined) { S.bosses++; S.bossHp += bossHp; }
  const bossQ = fight({ bossClock: CONFIG.BOSS_CADENCE,
               attacks: [{ kind: 'heavy', dmg: 2 }, { kind: 'flurry', dmg: 1, hits: 3 },
                         { kind: 'charge', dmg: 4, turns: 2 }, { kind: 'drain', dmg: 1 }] },
             bossHp, true);
  q += bossQ;
  // THE BOSS COVERS KEYS TOO, and this file did not count them - which made
  // every "distinct curriculum items" figure it has ever printed too low, in
  // exactly the scenarios where the boss matters most. The boss draws from the
  // keys the class did NOT reach on the way, so its questions are the fresh
  // ones by construction. Not counting them understated the thing the boss
  // exists to do.
  for (let i = 0; i < bossQ && i < missingKeys.length; i++) covered.add(missingKeys[i]);
  return { q, rooms, dead: p.hearts <= 0, coveredSet: covered };
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
                      riskRate: 0.30, riskMisjudge: 0.10, v52: false, moEff: 0.45, blindFrac: 0.90 }, opt);
  const cells = [];
  for (const acc of [0.95, 0.85, 0.75]) {
    const S = newStats();
    let q = 0, d = 0, r = 0; const N = 2500;
    for (let i = 0; i < N; i++) { const x = runOne(acc, S); q += x.q; r += x.rooms; if (x.dead) d++; }
    if (acc === 0.85) {
      const tot = S.wrongDmg + S.clockDmg;
      cells.push(`q ${(q/N).toFixed(0)} (ev ${(S.eventQ/N).toFixed(1)} · cho ${(S.chorusQ/N).toFixed(1)}) · q/fight ${(S.fq/S.f).toFixed(1)} · painless ${(S.fNoHeart/S.f*100).toFixed(0)}% · acts/fight ${(S.acts/(S.f+S.e)).toFixed(1)} · boss ${(S.bossHp/Math.max(1,S.bosses)).toFixed(1)}hp · wrong=${(S.wrongDmg/tot*100).toFixed(0)}% of dmg`);
    }
    cells.push(`${(acc*100)|0}%: ${(d/N*100).toFixed(0)}%`);
  }
  console.log(label.padEnd(34), cells.join('  |  '));
}

function newStats() {
  return { f:0, fNoHeart:0, fNoAim:0, fq:0, e:0, eq:0, acts:0,
           focus:0, stunTicks:0, wrongDmg:0, clockDmg:0, riskWins:0,
           eventQ:0, chorusQ:0, bossHp:0, bosses:0 };
}

function trio(label, opt) {
  console.log('\n  ' + label);
  shape('    plays it safe        ', Object.assign({}, opt, { riskRate: 0.08, }));
  shape('    typical class',             Object.assign({}, opt, { riskRate: 0.30 }));
  shape('    bold, risks often  ',     Object.assign({}, opt, { riskRate: 0.65, }));
}


// ===========================================================================
// QUESTIONS PER LESSON — the measurement that rewrote RULE ONE.
//
// Rule 1 was written as "nothing may reduce the number of questions asked" and
// was always measured per RUN. That is the wrong denominator, and being wrong
// about it cost this game three years of design space.
//
// A class does not stop when the party wipes. They pick a hero and go again,
// and they keep answering until the bell. What matters pedagogically is how
// many questions get asked in forty-five minutes. A harder game that ends runs
// sooner does NOT automatically ask fewer of them - it asks the same number
// across more runs, and it touches slightly MORE distinct curriculum items,
// because every fresh run sweeps untested keys first.
//
// Time model, calibrated against the one figure we know: a full map is about a
// 45-minute lesson and asks ~44 questions.
//     ~61s per question, all-in (reading it out, the student answering, the
//                                narration, the animation, map choices, popups)
//     ~150s to restart after a wipe (hero select, first map, coach cards)
//
// THIS IS AN ESTIMATE AND IT IS THE WEAKEST PART OF THIS FILE. Both numbers
// come from reasoning about a lesson, not from timing one. Stein is timing a
// real lesson; when that figure lands, put it in here and re-run. If a question
// really takes 45s or 80s, every conclusion below moves.
// ===========================================================================
const LESSON = 45 * 60, T_Q = 61, T_RESTART = 150;

function lesson(acc, opt) {
  O = Object.assign({ layers: CONFIG.LAYERS_PER_REALM, shields: CONFIG.START_SHIELDS,
    hearts: CONFIG.START_HEARTS, riskRate: 0.30, riskMisjudge: 0.10,
    v52: false, moEff: 0.45, blindFrac: 0.90 }, opt);
  let totalQ = 0, wipes = 0, runs = 0, distinct = 0; const N = 1200;
  for (let i = 0; i < N; i++) {
    let t = 0, q = 0, w = 0, r = 0; const seenKeys = new Set();
    while (t < LESSON) {
      const x = runOne(acc, newStats()); r++;
      // The bell cuts the run off wherever it is. Only the questions that fit
      // inside the lesson count - a run that would have asked 40 more when
      // there are two minutes left asks two.
      const fits = Math.min(x.q, Math.floor((LESSON - t) / T_Q));
      q += fits;
      // A NEW RUN RESETS coveredKeys, so it works through the same curriculum
      // items again. Across a lesson the class answers plenty of questions but
      // meets fewer DISTINCT things - and distinct items is what the teaching
      // report is built on, so it is tracked separately rather than assumed to
      // follow the question count.
      if (fits > 0 && x.coveredSet) x.coveredSet.forEach(k => seenKeys.add(k));
      t += x.q * T_Q; if (x.dead) w++; t += T_RESTART;
    }
    totalQ += q; wipes += w; runs += r; distinct += seenKeys.size;
  }
  return { q: totalQ / N, wipes: wipes / N, runs: runs / N, keys: distinct / N };
}

function lessonRow(label, opt) {
  const a = lesson(0.85, opt);
  console.log(label.padEnd(36),
    `${a.q.toFixed(0)} q/lesson · ${a.keys.toFixed(0)} distinct items · ` +
    `${a.runs.toFixed(1)} runs · ${a.wipes.toFixed(1)} wipes`);
}

// ---------------------------------------------------------------------------
// TARGET: about 1 run in 2 ending badly, IN A REAL CLASSROOM.
//
// The simulator reads pessimistic - it plays no potions, buys nothing, never
// Braces and never uses a Team Up. The one calibration point there is: the
// build four real classes played wiped about 1 run in 3, and that same build
// sims at 52-62%. So real is roughly 0.6x simulated, and a real 50% is a
// simulated ~83%.
//
// THAT MAPPING RESTS ON ONE DATA POINT. Treat it as a starting estimate, not a
// fact. It is why the first lesson of the new build is worth watching closely,
// and why START_HEARTS is documented in config.js as the dial to turn.
// ---------------------------------------------------------------------------
const TARGET_SIM = 83;

function tune(label, opt) {
  // A cautious class and a bold class are run separately, because the whole
  // point of v6.7 is that they should end up in roughly the SAME place. If
  // bold wipes far less, RISKY is not a gamble, it is the correct answer - and
  // a decision with a correct answer is not a decision.
  const wipes = []; let acts = 0, bhp = 0;
  for (const rr of [0.08, 0.65]) {
    O = Object.assign({ layers: CONFIG.LAYERS_PER_REALM, shields: CONFIG.START_SHIELDS,
      hearts: CONFIG.START_HEARTS, riskMisjudge: 0.10,
      v52: false, moEff: 0.45, blindFrac: 0.90 }, opt, { riskRate: rr });
    const S = newStats();
    let d = 0; const N = 2500;
    for (let i = 0; i < N; i++) { if (runOne(0.85, S).dead) d++; }
    wipes.push(d / N * 100);
    if (rr === 0.65) { acts = S.acts / (S.f + S.e); bhp = S.bossHp / Math.max(1, S.bosses); }
  }
  const a = lesson(0.85, opt);
  const mid = (wipes[0] + wipes[1]) / 2;
  const gap = Math.abs(wipes[0] - wipes[1]);
  console.log(label.padEnd(30),
    `${a.q.toFixed(0)} q/lesson · ${acts.toFixed(2)} swings · boss ${bhp.toFixed(1)}hp · ` +
    `cautious ${wipes[0].toFixed(0)}% / bold ${wipes[1].toFixed(0)}% ` +
    `(gap ${gap.toFixed(0)}${gap <= 8 ? ' ok' : ' <-- ONE SIDE IS BETTER'}` +
    `${Math.abs(mid - TARGET_SIM) <= 5 ? ', on target' : ''})`);
}

console.log('shape'.padEnd(42), 'at 85% accuracy  |  wipe rate by accuracy');

// ---------------------------------------------------------------------------
console.log('\n=== RULE ONE: the run is the wrong denominator ===');
console.log('A lesson is time-boxed and a wiped class starts again. If questions');
console.log('per LESSON hold steady while questions per RUN fall, nothing was');
console.log('lost - the same review happened across more, shorter runs.\n');
for (const h of [15, 13, 11, 9, 7]) lessonRow(`  ${h} hearts`, { hearts: h });
console.log('\n  Read the first column, not the last. Questions per lesson barely');
console.log('  move across a range of difficulty that takes the wipe rate from');
console.log('  almost never to almost always - that is RULE ONE holding.');
console.log('  Distinct items are the honest cost: they sag by a couple at the');
console.log('  hard end, because a run that dies early sweeps fewer keys and');
console.log('  the next one starts over from the same place. Two of 32 is a');
console.log('  price worth paying; six would not be. Watch this column.');

// ---------------------------------------------------------------------------
console.log('\n=== v6.7: is the stake actually a decision? ===');
console.log('Cautious and bold must land close together. Before v6.7 they did');
console.log('not: "double both ways" is not symmetrical, because a class at 85%');
console.log('collects the upside six times for every one time it pays.\n');
tune('  as shipped', {});

// ---------------------------------------------------------------------------
console.log('\n=== v6.7: the two interactions worth watching ===');
console.log('Both of these got stronger when the numbers moved, and neither was');
console.log('changed to suit. This is the measurement, not an adjustment.\n');
// The Lucky Charm eats the FIRST wrong answer of the realm. That was worth 1-2
// hearts when a mistake cost 1-2. Against a flat 6 it can now eat over half the
// party's health in one go - the single most swingy relic in the game.
tune('  nobody', { riskRate: 0.30 });
tune('  Lucky Charm', { luckyCharm: true });
// The Phonics Ranger delays the monster's OPENING swing by one answer. At
// cadence 3 that skipped part of a swing; at cadence 2 the same +1 is a larger
// share of a shorter clock, so it should be worth proportionally more.
tune('  Phonics Ranger', { cadenceBonus: 1, cadenceFirstOnly: true });
tune('  Storm Knight (+3 shields)', { shields: CONFIG.START_SHIELDS + 3 });

// ---------------------------------------------------------------------------
console.log('\n=== v6.7: where the damage comes from ===');
console.log('The fault that nearly shipped: RISKY dealing 2 shortens fights, so');
console.log('the monster reaches its turn less often. At cadence 3 that took');
console.log('swings per fight to 0.79 - half of all fights would have had no');
console.log('monster attack at all, which is the exact fault v6.1 existed to');
console.log('fix. Cadence 2 pays for it. Both numbers, side by side:\n');
const _cad = CONFIG.MONSTER_CADENCE;
CONFIG.MONSTER_CADENCE = 3; tune('  cadence 3 (v6.6 clock)', {});
CONFIG.MONSTER_CADENCE = 2; tune('  cadence 2 (shipped)', {});
CONFIG.MONSTER_CADENCE = _cad;

// ---------------------------------------------------------------------------
console.log('\n=== the heart dial, for setting difficulty per class ===');
console.log('START_HEARTS is the only continuous control in the game. Everything');
console.log('else is integer-grained: a monster hits for 1, 2 or 3, so "15%');
console.log('weaker" rounds back to the number you started with.\n');
for (const h of [13, 12, 11, 10, 9]) {
  tune(`  ${h} hearts${h === CONFIG.START_HEARTS ? ' (shipped)' : ''}`, { hearts: h });
}

// ---------------------------------------------------------------------------
console.log('\n=== full shape, all three accuracies ===');
trio('as shipped', {});

console.log('\n=== v6.5: does the Chorus cost the game any questions? ===');
console.log('The Chorus took its map weight out of `safe` and `treasure`, which');
console.log('lowers the share of FIGHTS. The total must not fall.');
console.log('It pays NO shields, and that is load-bearing - see config.js.');
const _pay = JSON.parse(JSON.stringify(CONFIG.CHORUS_REWARD));
shape('  Chorus as shipped', { riskRate: 0.30 });
CONFIG.CHORUS_REWARD = { good:{shards:3,shields:3}, half:{shards:2,shields:3}, poor:{shards:1,shields:3} };
shape('  Chorus paying 3 shields', { riskRate: 0.30 });
CONFIG.CHORUS_REWARD = _pay;
