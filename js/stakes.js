// ---------------------------------------------------------------------------
// STAKES  (v5.3 — replaced Momentum; Focus removed in v6.1)
//
// Why Momentum died:
//
// It was optional. In a room with twenty-five children and forty minutes,
// anything optional gets skipped. In Slay the Spire you engage with energy
// because you physically cannot act without spending it; here, answering IS
// the attack, so Momentum was a side-shop bolted onto a loop that ran fine
// without it. It was also a SHARED pool spent on an INDIVIDUAL's turn, which
// meant it belonged to nobody, and three of its four moves were defensive or
// economic — none of them felt good enough to interrupt a child who was
// mid-thought about a preposition.
//
// So the decision moves onto the question itself, where the attention already
// is. Before the options appear, the student on turn picks SAFE or RISKY.
// No pool, no decay, nothing to accumulate, nothing to forget.
//
// The rules this file must never break:
//
//   1. RISKY only hides the options on questions tagged `open: true` — ones
//      where the clue alone tells you what to say. Nothing in this game may
//      ever hide the correct answer from a student who knows it. This one is
//      absolute and is not negotiable for any amount of balance.
//
//   2. A stake must never become the obviously-correct play, in either
//      direction. If always gambling wins, or never gambling wins, there is no
//      decision on the screen and the whole mechanic is theatre. Both failure
//      modes have happened here; see config.js.
//
// WHAT CHANGED IN v6.7, AND WHY THE OLD RULE HERE IS GONE
//
// This file used to open with "stakes never change damage DEALT, because a
// bigger hit is a shorter fight and a shorter fight is fewer questions". A
// RISKY correct answer now deals 2. That is a deliberate reversal, not drift:
// questions per LESSON — the number that actually matters, because a lesson is
// time-boxed and a wiped class simply starts again — are flat at 42-43 whether
// fights are short or long. The full measurement is in config.js under
// MONSTER_CADENCE. RULE ONE in CLAUDE.md was rewritten to match.
//
// The constraint that replaced it is narrower and still real: nothing may
// reduce the questions a class answers in FORTY-FIVE MINUTES. Shortening a
// fight is now allowed. Ending the lesson early is not.
// ---------------------------------------------------------------------------

const STAKE_SAFE  = "safe";
const STAKE_RISKY = "risky";

// What a stake is worth. Kept as functions so CONFIG stays the single place
// the numbers live.
function stakeShardMult(stake, blind) {
  if (stake !== STAKE_RISKY) return 1;
  return blind ? CONFIG.STAKE_BLIND_SHARDS : CONFIG.STAKE_RISKY_SHARDS;
}

// How hard a correct answer lands. SAFE deals 1; RISKY deals 2. This is the
// half of the bargain that arrives immediately, which is what stops RISKY
// being a trap — shards cash out at a shop several rooms later, and a class
// deciding under pressure does not weigh a reward that far away.
function stakeDamageDealt(stake) {
  return stake === STAKE_RISKY ? (CONFIG.STAKE_RISKY_DAMAGE_DEALT || 2) : 1;
}

// What a WRONG answer costs, in hearts, before debuffs and gear.
//
// RISKY does not multiply the tier cost — it replaces it with a flat number.
// Multiplying was the v5.3-v6.6 design and it could not be balanced: the
// multiplier needed to deter a confident class (about 5x) turned a tier-4
// miss into 10 of 11 hearts. Flat separates "how much does gambling cost"
// from "how hard was the question", and only the first one needs to be big.
//
// Tier is the only input, so an elite or the boss charges the higher number by
// virtue of asking from the tier-4 bank rather than by being special-cased. A
// boss that falls back to a standard question on a key with no elite written
// for it charges the lower number, which is correct: the class is being asked
// an easier question and should pay the easier price.
function stakeWrongCost(q, stake) {
  const tier = (q && q.tier) || 1;
  if (stake === STAKE_RISKY) {
    return tier >= 3 ? (CONFIG.STAKE_RISKY_FLAT_HARD || 6)
                     : (CONFIG.STAKE_RISKY_FLAT || 4);
  }
  return CONFIG.TIER_DAMAGE[tier] || 1;
}

// Can this question be answered with nothing on screen? Only `open` questions
// qualify — "Choose the correct sentence" is unanswerable blind, and offering
// it that way was the bug Stein caught in v5.1.
function stakeIsBlind(q, stake) {
  // The tier floor MUST be here and not only in the button's label. It lived
  // in renderStakeGate alone, so on the 25 tier-1 open questions the button
  // promised "2x shards, options stay" and then took the options away anyway.
  // One predicate, used by both the promise and the outcome.
  return stake === STAKE_RISKY && !!q && q.open === true &&
         (q.tier || 1) >= CONFIG.STAKE_MIN_TIER;
}

// Stakes are offered on every question in a fight EXCEPT while Bracing (the
// student has already committed to defending) or while Frozen (no choice to
// make). Last Stand is always played at full stakes and skips the prompt.
function stakesAvailable(q, defending) {
  if (!CONFIG.STAKES_ENABLED) return false;
  if (defending) return false;
  if (typeof isFrozen === "function" && isFrozen()) return false;
  return !!q;
}

function currentStake() {
  const run = STATE.run;
  return (run && run.stake) || STAKE_SAFE;
}

function setStake(stake) {
  const run = STATE.run;
  if (!run) return;
  run.stake = stake === STAKE_RISKY ? STAKE_RISKY : STAKE_SAFE;
  saveState();
}

// Cleared after every question so a stake is never silently inherited by the
// next one — a Last Stand or Treasure question must always start from SAFE.
function clearStake() {
  const run = STATE.run;
  if (!run) return;
  run.stake = STAKE_SAFE;
  saveState();
}

// A landed BLIND call used to pay a shield point, capped per fight. v6.7 sets
// STAKE_BLIND_SHIELD to 0 — the 2 damage a RISKY answer now deals is the
// immediate payoff that shield was standing in for, and free shields are the
// one reward this game has measured itself unable to afford. The plumbing
// stays so the number can be turned back on without rebuilding it.
// Returns how many shields were actually paid so the feedback line can say so.
function payStakeShield(blind) {
  const run = STATE.run;
  if (!run || !blind || !CONFIG.STAKE_BLIND_SHIELD) return 0;
  const paid = run.stakeShieldsThisFight || 0;
  if (paid >= CONFIG.STAKE_SHIELD_CAP) return 0;
  const n = Math.min(CONFIG.STAKE_BLIND_SHIELD, CONFIG.STAKE_SHIELD_CAP - paid);
  run.stakeShieldsThisFight = paid + n;
  addShieldTop(n);
  saveState();
  return n;
}

// A short line for the feedback bar, so the class hears why the number moved.
function stakeNote(stake, blind, correct) {
  if (stake !== STAKE_RISKY) return "";
  if (correct) return blind ? " Called it blind — double damage!" : " Risk paid off — double damage!";
  return blind ? " Risked it blind, and it hurt." : " Risk taken, risk lost.";
}

// How the answer was played, for the run log. "safe" also covers questions
// that were never gated at all — a Treasure riddle, a Last Stand — because the
// run's stake is cleared to SAFE after every question and those roads never
// set it. Nothing reports a SAFE count for that reason; what the log is for is
// counting how often a class backed itself, and how often that paid.
function stakeTag(q) {
  const stake = currentStake();
  if (stake !== STAKE_RISKY) return "safe";
  return stakeIsBlind(q, stake) ? "blind" : "risky";
}

// ---------------------------------------------------------------------------
// PER-FIGHT RESET
//
// Focus lived here until v6.1. It was removed after four classes played the
// game and nobody used it once: it stunned the monster's CLOCK, and the clock
// was barely running. See the note in config.js about MONSTER_CADENCE.
//
// What remains is the per-fight shield cap, which still needs clearing when a
// new fight starts.
// ---------------------------------------------------------------------------
function resetFocus() {
  const run = STATE.run;
  if (!run) return;
  run.stakeShieldsThisFight = 0;
  saveState();
}
