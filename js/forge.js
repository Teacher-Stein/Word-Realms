// ---------------------------------------------------------------------------
// THE EMBER FORGE
//
// Ember is banked at the end of every run - won or lost - and until now it
// bought nothing at all, which made a wipe feel purely like a loss. Here it
// buys PERMANENT upgrades for the class, so forty minutes that ended in a
// corridor still leave the room better equipped than they walked in.
//
// The pool is deliberately shallow and one-off. Perks that stacked forever
// would quietly flatten the difficulty across a term; six of them, bought
// once each, is a ceiling the class can actually reach and then feel.
// ---------------------------------------------------------------------------
const FORGE_PERKS = [
  { id: "quartermaster", name: "Quartermaster", cost: 40,
    icon: "assets/items/coin_purse.png",
    effect: "Every run starts with 25 Knowledge Shards",
    desc: "Someone finally wrote a packing list." },

  { id: "deep_pack", name: "Deep Pack", cost: 45,
    icon: "assets/items/potion_heal.png",
    effect: "Every run starts with an extra potion",
    desc: "There is always room for one more bottle." },

  { id: "warded", name: "Warded Kit", cost: 55,
    icon: "assets/items/aegis_charm.png",
    effect: "+2 shields at every rest point",
    desc: "Repairs that hold a little longer than they should." },

  { id: "second_wind", name: "Second Wind", cost: 60,
    icon: "assets/items/second_wind.png",
    effect: "+1 heart on every run",
    desc: "The class has learned to keep something in reserve." },

  { id: "heirloom", name: "Heirloom", cost: 80,
    icon: "assets/items/guiding_star.png",
    effect: "Every run starts with a relic",
    desc: "Passed down from a party that did not make it." },

  { id: "second_breath", name: "Second Breath", cost: 110,
    icon: "assets/items/last_breath.png",
    effect: "A second Last Stand in every run",
    desc: "Twice now, the storm has let this class back up." },
];

function perkById(id) { return FORGE_PERKS.find(p => p.id === id); }
function hasPerk(id) {
  return !!(STATE.perksEnabled !== false && STATE.permanentPerks.includes(id));
}

function buyPerk(id) {
  const perk = perkById(id);
  if (!perk) return { ok: false, reason: "unknown" };
  if (STATE.permanentPerks.includes(id)) return { ok: false, reason: "owned" };
  if (STATE.ember < perk.cost) return { ok: false, reason: "poor" };
  STATE.ember -= perk.cost;
  STATE.permanentPerks.push(id);
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
