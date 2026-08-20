// ---------------------------------------------------------------------------
// Global config. Edit PIN / difficulty here.
// ---------------------------------------------------------------------------
const CONFIG = {
  TEACHER_PIN: "1234",
  START_HEARTS: 6,
  MAX_HEARTS: 8,
  NODES_PER_LAYER_MIN: 2,
  NODES_PER_LAYER_MAX: 3,
  LAYERS_PER_REALM: 6, // not counting start + boss
  DIFFICULTY: "standard", // "standard" or "gifted" - toggled in teacher menu
  SAVE_KEY: "wordrealms_save_v1",
  // realms unlocked by default before any teacher changes; realm 1 always open
  DEFAULT_UNLOCKED: [1],
};
