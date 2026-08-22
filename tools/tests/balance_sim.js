// v5.3 balance model. Momentum is gone; Stakes and Focus replace it.
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
    let monHp = hp, cad = Math.max(1, mon.cadence || 3), until = cad;
    let t = 0, en = false, n = 0;
    let focus = true;                       // one per FIGHT
    let shieldPaid = 0;                     // RISKY shields are capped per fight
    const h0 = p.hearts;
    let aimed = 0, wrongDmg = 0, clockDmg = 0;

    while (monHp > 0 && p.hearts > 0 && t < 90) {
      t++; n++;

      // Focus policy: burn it when the blow is one answer away and the party
      // is not comfortable. A class that ignores Focus has O.focusUse ~ 0.
      let focusArmed = false;
      if (focus && until <= 1 && Math.random() < O.focusUse) {
        focus = false; focusArmed = true; S.focus++;
      }

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
          S.acts++; until = cad;
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
        if (focusArmed) {
          until = Math.min(cad, until + CONFIG.FOCUS_STUN_ANSWERS);
          S.stunTicks += CONFIG.FOCUS_STUN_ANSWERS;
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
        S.acts++; until = cad;
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
  }
  const missing = COVER.filter(k => !covered.has(k)).length;
  q += fight({ cadence: CONFIG.BOSS_CADENCE,
               attacks: [{ kind: 'heavy', dmg: 2 }, { kind: 'flurry', dmg: 1, hits: 3 },
                         { kind: 'charge', dmg: 4, turns: 2 }, { kind: 'drain', dmg: 1 }] },
             Math.max(CONFIG.BOSS_MIN_QUESTIONS, Math.min(missing, CONFIG.BOSS_MAX_QUESTIONS)), true);
  return { q, rooms, dead: p.hearts <= 0 };
}

function shape(label, opt) {
  O = Object.assign({ layers: CONFIG.LAYERS_PER_REALM, shields: 2,
                      hearts: CONFIG.START_HEARTS,
                      riskRate: 0.30, riskMisjudge: 0.06, focusUse: 0.55, riskShield: 1, riskShieldCap: 2, v52: false, moEff: 0.45, blindFrac: 0.54 }, opt);
  const cells = [];
  for (const acc of [0.95, 0.85, 0.75]) {
    const S = { f:0, fNoHeart:0, fNoAim:0, fq:0, e:0, eq:0, acts:0,
                focus:0, stunTicks:0, wrongDmg:0, clockDmg:0, riskWins:0 };
    let q = 0, d = 0, r = 0; const N = 2500;
    for (let i = 0; i < N; i++) { const x = runOne(acc, S); q += x.q; r += x.rooms; if (x.dead) d++; }
    if (acc === 0.85) {
      const tot = S.wrongDmg + S.clockDmg;
      cells.push(`q ${(q/N).toFixed(0)} · q/fight ${(S.fq/S.f).toFixed(1)} · painless ${(S.fNoHeart/S.f*100).toFixed(0)}% · acts/fight ${(S.acts/(S.f+S.e)).toFixed(1)} · wrong=${(S.wrongDmg/tot*100).toFixed(0)}% of dmg`);
    }
    cells.push(`${(acc*100)|0}%: ${(d/N*100).toFixed(0)}%`);
  }
  console.log(label.padEnd(34), cells.join('  |  '));
}

function trio(label, opt) {
  console.log('\n  ' + label);
  shape('    plays safe, ignores Focus', Object.assign({}, opt, { riskRate: 0.08, focusUse: 0.05 }));
  shape('    typical class',             Object.assign({}, opt, { riskRate: 0.30, focusUse: 0.55 }));
  shape('    bold, uses Focus well',     Object.assign({}, opt, { riskRate: 0.65, focusUse: 0.90 }));
}

console.log('shape'.padEnd(42), 'at 85% accuracy  |  wipe rate by accuracy');
console.log('\n=== v5.2 CONTROL: Momentum Guard, no Stakes, 9 hearts (what Stein has now) ===');
shape('  typical class',    { hearts: 9, v52: true, moEff: 0.45 });

console.log('\n=== v5.3: Stakes + Focus, sweeping hearts to match ===');
for (const h of [9, 10, 11, 12, 13]) {
  console.log('\n  ' + h + ' hearts');
  shape('    plays safe, ignores Focus', { hearts: h, riskRate: 0.08, focusUse: 0.05 });
  shape('    typical class',             { hearts: h, riskRate: 0.30, focusUse: 0.55 });
  shape('    bold, uses Focus well',     { hearts: h, riskRate: 0.65, focusUse: 0.90 });
}
