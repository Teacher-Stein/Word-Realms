// ---------------------------------------------------------------------------
// Tuning. Safe to edit these numbers - everything else reads from here.
// ---------------------------------------------------------------------------
const CONFIG = {
  TEACHER_PIN: "1234",

  // --- party ---
  // v5.0: hearts are now the party's MAIN resource and shields are a thin
  // buffer, inverting v4.3 where shields quietly absorbed 84% of everything.
  // v5.1: 13 hearts made a wrong answer cost 10% of the pool, so getting one
  // wrong felt like nothing. Instrumenting the damage showed why: only 31% of
  // it came from wrong answers, the rest from the monster's clock. The fix is
  // a smaller pool AND a slower clock, so the threat comes from not knowing
  // rather than from waiting. Wrong answers are now 47% of all damage and one
  // costs about a fifth of the party.
  START_HEARTS: 9,
  MAX_HEARTS: 14,

  // --- combat ---
  // v5.0: a 2-HP monster died before its first turn arrived, so it never got
  // to use the intent it had just telegraphed. At 4 it acts 1.7 times per
  // fight and the countdown finally means something.
  MONSTER_HP: 4,          // regular Fight node
  ELITE_HP: 7,            // Elite node
  BOSS_MIN_QUESTIONS: 6,  // boss is never trivially short
  BOSS_MAX_QUESTIONS: 20, // ...nor absurdly long if the class dodged rooms
  TEAMUP_HP_COST: 1,      // asking a partner for help adds this much monster HP
  TEAMUP_ONCE_PER_MONSTER: true,

  // --- map shape (bigger + denser than v1) ---
  LAYERS_PER_REALM: 15,       // shorter map, deeper fights - same lesson length
  NODES_PER_LAYER_MIN: 3,
  NODES_PER_LAYER_MAX: 4,
  EXTRA_LINK_CHANCE: 0.55,    // chance a node gets a 2nd forward link
  THIRD_LINK_CHANCE: 0.22,    // chance of a 3rd forward link
  MAX_ELITES_PER_MAP: 4,      // elites are 5-hit commitments; keep them rare

  // --- rewards (v4: roughly tripled - the old numbers couldn't fund a shop) ---
  SHARDS_FIGHT: 7,          // per regular monster felled
  SHARDS_ELITE: 22,         // per elite felled
  SHARDS_TREASURE: 14,
  SHARDS_BOSS_HIT: 4,
  SHARDS_PER_HIT: 2,        // small trickle for every correct answer in combat
  SHARDS_TIER_BONUS: 2,     // extra per difficulty tier above 1
  POTION_DROP_CHANCE: 0.22, // monsters sometimes drop a potion
  POTION_DROP_ELITE: 0.75,
  START_POTIONS: ["potion_heal"],   // so potions are visible from turn one

  // --- shops ---
  SHOPS_PER_MAP: 3,
  SHOP_FIRST_DEPTH: 0.35,   // no shop before this fraction of the map
  SHOP_LAST_DEPTH: 0.92,

  // --- difficulty tiers: damage taken on a wrong answer ---
  // Hard questions now bite properly. Vocabulary still costs one heart; a
  // grammar or Elite question costs three of nine.
  TIER_DAMAGE: { 1: 1, 2: 1, 3: 3, 4: 3 },   // tier 4 = the Elite bank

  // --- survivability (tuned with tools/../sim: at 100% accuracy the party
  //     almost always survives; at 80% roughly 4 runs in 10 end in a wipe) ---
  // v4.3: shields NO LONGER refill in every room. They persist, and are only
  // topped up at a Rest room or Safe Path, by a potion, or by shopping. That
  // is what makes armour worth carrying. Lower this for a harder game.
  REST_SHIELDS: 7,           // campfire "Repair"
  REST_HEAL: 5,              // campfire "Mend"
  SHARPEN_HEARTS: 1,         // campfire "Sharpen" - permanent max hearts this run
  BOSS_CADENCE: 4,           // boss acts every N student turns

  // --- monster behaviour ---
  VARIANT_CHANCE: 0.30,      // chance a regular monster is a tinted variant
  SPECIAL_CHANCE: 0.45,      // chance a monster applies its debuff when acting
  ENRAGE_AFTER_TURNS: 4,     // monster turns before it enrages (+1 damage)

  // --- failure ladder ---
  LAST_STAND_ENABLED: true,  // one sudden-death question at 0 hearts, once
                             // per run - the counterweight to v4.1's faster
                             // monsters, and a genuinely tense classroom beat
  CHECKPOINT_HEARTS: 2,      // hearts restored when falling back to a campfire

  // --- momentum ---
  // Banked on every correct answer, spent instead of banked. This is the
  // decision that a correct answer now produces, instead of just a number
  // going down.
  // NOTHING here shortens a fight. An earlier draft had a Heavy Strike that
  // dealt extra damage, and it quietly cut a run from 36 questions to 25 -
  // the exact rule this game exists to protect. Every move is defensive,
  // economic or informational instead.
  MOMENTUM_CAP: 6,
  MO_INSIGHT: 1,             // remove a wrong answer from the next question
  MO_ROUSE: 2,               // next correct answer pays double shards
  MO_GUARD: 3,               // stop up to MO_GUARD_BLOCK damage
  MO_GUARD_BLOCK: 2,
  MO_RALLY: 3,               // restore a heart

  // --- commit ---
  // Offered on hard questions only: answer with NO options on screen for
  // double reward. Recall rather than recognition.
  COMMIT_ENABLED: true,
  // Commit is gated on whether a question can be ANSWERED ALOUD (q.open), not
  // on how hard it is. Tier is only a floor, so it stays a reward for the
  // harder half of the bank rather than appearing on every definition.
  COMMIT_MIN_TIER: 2,
  COMMIT_SHARD_MULT: 2,      // double shards...
  COMMIT_MOMENTUM: 2,        // ...and Momentum, but NEVER extra damage: a
                             // shorter fight is fewer questions.

  // --- team up ---
  TEAMUPS_PER_RUN: 3,        // was unlimited, which made it a non-decision

  // --- streaks ---
  STREAK_GUARD: 3,          // correct answers in a row -> next attack blocked
  STREAK_BONUS: 5,          // -> shards + a potion

  // --- misc ---
  SAVE_KEY: "wordrealms_save_v2",
  DEFAULT_UNLOCKED: [1],
};
