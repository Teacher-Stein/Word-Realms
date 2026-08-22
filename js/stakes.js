// ---------------------------------------------------------------------------
// STAKES and FOCUS  (v5.3 — replaces Momentum)
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
// The two hard rules this file must never break:
//
//   1. Stakes change SHARDS EARNED and DAMAGE TAKEN. They never change damage
//      DEALT. A bigger hit is a shorter fight and a shorter fight is fewer
//      questions, and review volume is the entire point of the game.
//
//   2. RISKY only hides the options on questions tagged `open: true` — ones
//      where the clue alone tells you what to say. Nothing in this game may
//      ever hide the correct answer from a student who knows it.
// ---------------------------------------------------------------------------

const STAKE_SAFE  = "safe";
const STAKE_RISKY = "risky";

// What a stake is worth. Kept as functions so CONFIG stays the single place
// the numbers live.
function stakeShardMult(stake, blind) {
  if (stake !== STAKE_RISKY) return 1;
  return blind ? CONFIG.STAKE_BLIND_SHARDS : CONFIG.STAKE_RISKY_SHARDS;
}

function stakeDamageMult(stake) {
  return stake === STAKE_RISKY ? CONFIG.STAKE_RISKY_DAMAGE : 1;
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

// A landed BLIND call also pays a shield point, capped per fight. See the note
// in config.js: without a defensive payoff RISKY is a trap, and with one on
// every RISKY it becomes mandatory. Returns how many shields were actually
// paid so the feedback line can say so.
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
  if (correct) return blind ? " Called it blind!" : " Risk paid off!";
  return blind ? " Risked it blind — it hurts twice as much." : " Risk taken, risk lost.";
}

// ---------------------------------------------------------------------------
// FOCUS
//
// One per fight. The whole class answers the next question together — hands
// up, argue about it — and a correct answer stuns the monster's clock.
//
// Note that this makes fights LONGER, not shorter: a stunned clock means more
// questions before the party is threatened again, never fewer. That is the
// only reason it is allowed to exist.
// ---------------------------------------------------------------------------

function focusAvailable() {
  const run = STATE.run;
  return !!(CONFIG.FOCUS_ENABLED && run && !run.focusUsed);
}

function useFocus() {
  const run = STATE.run;
  if (!focusAvailable()) return false;
  run.focusUsed = true;
  run.focusArmed = true;
  saveState();
  return true;
}

function focusArmed() {
  const run = STATE.run;
  return !!(run && run.focusArmed);
}

// Consumed when the answer lands. Returns how many of the monster's ticks the
// stun is worth (0 if Focus was not armed, or the answer was wrong).
function consumeFocus(correct) {
  const run = STATE.run;
  if (!run || !run.focusArmed) return 0;
  run.focusArmed = false;
  saveState();
  return correct ? CONFIG.FOCUS_STUN_ANSWERS : 0;
}

// Fresh Focus at the start of every fight — it is a per-fight lever, not a
// per-run one, so the interesting question is "this ogre or the elite?" only
// within a fight, and no class is ever left with nothing.
function resetFocus() {
  const run = STATE.run;
  if (!run) return;
  run.focusUsed = false;
  run.focusArmed = false;
  run.stakeShieldsThisFight = 0;
  saveState();
}
