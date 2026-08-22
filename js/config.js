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
  // v5.5: HALVED. Measured over 4,000 runs, a typical run EARNED 527 shards
  // and could only SPEND about 123 of them - 77% of all income had nothing to
  // buy. 210 of those shards were earned during the boss fight, which is after
  // the last shop by construction, so they were unspendable the moment they
  // were paid. The v4 comment below is why: the constants were tripled to
  // "fund a shop" and overshot by roughly 4x.
  SHARDS_FIGHT: 4,          // per regular monster felled
  SHARDS_ELITE: 12,         // per elite felled
  SHARDS_TREASURE: 8,
  SHARDS_BOSS_HIT: 4,
  SHARDS_PER_HIT: 2,        // small trickle for every correct answer in combat
  SHARDS_TIER_BONUS: 2,     // extra per difficulty tier above 1
  // A run acquired 8.5 potions, 6.5 of them from streak bonuses alone, so the
  // shop's potion row and the Deep Pack perk were both buying something the
  // class was already drowning in. Scarcity is what makes them worth anything.
  MAX_POTIONS: 4,
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

  // --- stakes (v5.3, replaces Momentum) ---
  // Momentum was a pool spent through a separate UI, and it was OPTIONAL, so
  // classes ignored it. The decision now sits on the question itself: before
  // the options appear, the student on turn picks SAFE or RISKY.
  //
  // Stakes move SHARDS EARNED and DAMAGE TAKEN. They never move damage DEALT.
  // An earlier system had a Heavy Strike that hit harder and it quietly cut a
  // run from 36 questions to 25 - the exact rule this game exists to protect.
  STAKES_ENABLED: true,
  STAKE_RISKY_SHARDS: 2,     // RISKY pays double...
  STAKE_RISKY_DAMAGE: 2,     // ...and a wrong answer costs double
  // On a question tagged `open: true` the clue alone tells you what to say, so
  // RISKY escalates to answering BLIND - nothing on screen to pick from. This
  // is the old Commit, folded in. It pays more because recall is harder than
  // recognition. It is never offered on selection-only questions: hiding the
  // correct answer from a student who knows it is the one thing this game
  // must never do.
  STAKE_BLIND_SHARDS: 3,
  STAKE_MIN_TIER: 2,         // blind is a reward for the harder half of the bank
  // A landed BLIND call also pays one shield point. Without this, RISKY was a
  // trap: the shards only cash out at a shop several rooms later, while the
  // doubled damage lands immediately, so a class that never risked anything
  // was strictly better off. Paying it on every RISKY overcorrected - a class
  // that always played SAFE then wiped 17 points more often, which is exactly
  // the mandatory-mechanic trap Momentum fell into. Blind calls only, capped
  // per fight, sits between the two. Shields do not shorten fights.
  STAKE_BLIND_SHIELD: 1,
  STAKE_SHIELD_CAP: 2,       // per fight

  // --- focus ---
  // One per fight. The whole class answers together and a correct answer stuns
  // the monster's clock. It stuns the CLOCK, not the monster's health - so it
  // makes a fight longer and adds questions rather than removing them.
  FOCUS_ENABLED: true,
  FOCUS_STUN_ANSWERS: 2,     // the monster's clock loses this many ticks

  // --- team up ---
  TEAMUPS_PER_RUN: 3,        // was unlimited, which made it a non-decision

  // --- streaks ---
  STREAK_GUARD: 3,          // correct answers in a row -> next attack blocked
  STREAK_BONUS: 5,          // -> shards + a potion

  // --- misc ---
  SAVE_KEY: "wordrealms_save_v2",
  DEFAULT_UNLOCKED: [1],
};
