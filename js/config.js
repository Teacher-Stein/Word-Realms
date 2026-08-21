// ---------------------------------------------------------------------------
// Tuning. Safe to edit these numbers - everything else reads from here.
// ---------------------------------------------------------------------------
const CONFIG = {
  TEACHER_PIN: "1234",

  // --- party ---
  START_HEARTS: 4,        // lowered in v3 - potions/relics cover the gap
  MAX_HEARTS: 8,

  // --- combat ---
  MONSTER_HP: 2,          // regular Fight node
  ELITE_HP: 5,            // Elite node
  BOSS_MIN_QUESTIONS: 6,  // boss is never trivially short
  BOSS_MAX_QUESTIONS: 20, // ...nor absurdly long if the class dodged rooms
  TEAMUP_HP_COST: 1,      // asking a partner for help adds this much monster HP
  TEAMUP_ONCE_PER_MONSTER: true,

  // --- map shape (bigger + denser than v1) ---
  LAYERS_PER_REALM: 20,       // not counting Start and Boss
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
  TIER_DAMAGE: { 1: 1, 2: 1, 3: 2 },

  // --- survivability (tuned with tools/../sim: at 100% accuracy the party
  //     almost always survives; at 80% roughly 4 runs in 10 end in a wipe) ---
  BASE_ROOM_SHIELDS: 6,      // refreshed (not stacked) on entering a room
  REST_HEAL: 3,              // hearts restored by a Rest room
  BOSS_CADENCE: 4,           // boss acts every N student turns

  // --- monster behaviour ---
  VARIANT_CHANCE: 0.30,      // chance a regular monster is a tinted variant
  SPECIAL_CHANCE: 0.45,      // chance a monster applies its debuff when acting
  ENRAGE_AFTER_TURNS: 4,     // monster turns before it enrages (+1 damage)

  // --- failure ladder ---
  LAST_STAND_ENABLED: true,  // one sudden-death question at 0 hearts
  CHECKPOINT_HEARTS: 2,      // hearts restored when falling back to a campfire

  // --- streaks ---
  STREAK_GUARD: 3,          // correct answers in a row -> next attack blocked
  STREAK_BONUS: 5,          // -> shards + a potion

  // --- misc ---
  SAVE_KEY: "wordrealms_save_v2",
  DEFAULT_UNLOCKED: [1],
};
