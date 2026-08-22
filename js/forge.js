// ---------------------------------------------------------------------------
// THE EMBER FORGE
//
// Ember is banked at the end of every run - won or lost - and until now it
// bought nothing at all, which made a wipe feel purely like a loss. Here it
// buys PERMANENT upgrades for the class, so forty minutes that ended in a
// corridor still leave the room better equipped than they walked in.
//
// v5.5 — TWO THINGS WERE BADLY WRONG HERE.
//
// 1. The whole Forge cost 390 Ember and a single winning run banked ~268
//    (a Phonics Ranger banked ~400). The class bought EVERYTHING in one or two
//    lessons, and from that point Ember accumulated forever with no sink at
//    all - thousands of it by March, buying nothing. Costs are now roughly
//    tripled, so each perk is a real decision over several runs.
//
// 2. Perks were permanent across the whole YEAR. Combined with nine realms
//    that share one difficulty curve, the game got monotonically easier and
//    never got harder: a fully-perked class at 95% accuracy wiped 6% of runs
//    against 20% in week one. Perks are now scoped TO THE REALM they were
//    bought in, so every new unit starts the climb again. The Ember carries
//    over; the advantage does not.
// ---------------------------------------------------------------------------
const FORGE_PERKS = [
  { id: "quartermaster", name: "Quartermaster", cost: 120,
    icon: "assets/items/coin_purse.png",
    effect: "Every run starts with 25 Knowledge Shards",
    desc: "Someone finally wrote a packing list." },

  { id: "deep_pack", name: "Deep Pack", cost: 140,
    icon: "assets/items/potion_heal.png",
    effect: "Every run starts with an extra potion",
    desc: "There is always room for one more bottle." },

  { id: "warded", name: "Warded Kit", cost: 170,
    icon: "assets/items/aegis_charm.png",
    effect: "+2 shields at every rest point",
    desc: "Repairs that hold a little longer than they should." },

  { id: "second_wind", name: "Second Wind", cost: 190,
    icon: "assets/items/second_wind.png",
    effect: "+1 heart on every run",
    desc: "The class has learned to keep something in reserve." },

  { id: "heirloom", name: "Heirloom", cost: 240,
    icon: "assets/items/guiding_star.png",
    effect: "Every run starts with a relic",
    desc: "Passed down from a party that did not make it." },

  { id: "second_breath", name: "Second Breath", cost: 330,
    icon: "assets/items/last_breath.png",
    effect: "A second Last Stand in every run",
    desc: "Twice now, the storm has let this class back up." },
];

function perkById(id) { return FORGE_PERKS.find(p => p.id === id); }

// Which realm's perk shelf are we looking at? The run's realm while a run is
// live, otherwise the highest realm the class has unlocked - which is the one
// they are about to play.
function forgeRealmId() {
  if (STATE.run && STATE.run.realmId) return STATE.run.realmId;
  const un = STATE.unlockedRealms || [1];
  return un.reduce((a, b) => Math.max(a, b), 1);
}

function perksForRealm(realmId) {
  STATE.realmPerks = STATE.realmPerks || {};
  if (!Array.isArray(STATE.realmPerks[realmId])) STATE.realmPerks[realmId] = [];
  return STATE.realmPerks[realmId];
}

function hasPerk(id) {
  if (STATE.perksEnabled === false) return false;
  return perksForRealm(forgeRealmId()).includes(id);
}

function buyPerk(id) {
  const perk = perkById(id);
  if (!perk) return { ok: false, reason: "unknown" };
  const owned = perksForRealm(forgeRealmId());
  if (owned.includes(id)) return { ok: false, reason: "owned" };
  if (STATE.ember < perk.cost) return { ok: false, reason: "poor" };
  STATE.ember -= perk.cost;
  owned.push(id);
  saveState();
  return { ok: true, perk };
}

// Everything a perk does at the start of a run lives here, so the run
// lifecycle doesn't have to know the perk list.
function applyRunPerks(run) {
  const notes = [];
  if (hasPerk("quartermaster")) { run.shards += 25; notes.push("+25 shards"); }
  if (hasPerk("deep_pack")) {
    addPotion(pick(POTIONS).id);
    notes.push("an extra potion");
  }
  if (hasPerk("heirloom")) {
    const relic = availableRelic(["common", "uncommon"]);
    if (relic) { addRelic(relic); notes.push(relic.name); }
  }
  return notes;
}
