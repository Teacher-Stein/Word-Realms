// ---------------------------------------------------------------------------
// Tuning. Safe to edit these numbers - everything else reads from here.
// ---------------------------------------------------------------------------
const CONFIG = {
  TEACHER_PIN: "1234",

  // --- party ---
  START_HEARTS: 6,
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

  // --- rewards ---
  SHARDS_FIGHT: 2,
  SHARDS_ELITE: 6,
  SHARDS_TREASURE: 5,
  SHARDS_BOSS_HIT: 2,

  // --- misc ---
  SAVE_KEY: "wordrealms_save_v2",
  DEFAULT_UNLOCKED: [1],
};
