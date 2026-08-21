// ---------------------------------------------------------------------------
// Relics (permanent for the run) and Potions (one-use consumables).
// `effect` keys are read by the game logic; nothing here runs on its own.
// ---------------------------------------------------------------------------

const RELICS = [
  { id:"lucky_charm",  name:"Lucky Charm",     rarity:"common",
    icon:"assets/items/lucky_charm.png",
    desc:"The first wrong answer in each realm costs no heart.",
    effect:"Blocks 1 hit per realm" },

  { id:"second_wind",  name:"Second Wind",     rarity:"common",
    icon:"assets/items/second_wind.png",
    desc:"The party's maximum health rises by one heart, healed immediately.",
    effect:"+1 max heart" },

  { id:"warm_cloak",   name:"Warm Cloak",      rarity:"common",
    icon:"assets/items/warm_cloak.png",
    desc:"Rest rooms are twice as restful.",
    effect:"Rest heals 2 hearts" },

  { id:"storm_map",    name:"Storm-Worn Map",  rarity:"common",
    icon:"assets/items/storm_map.png",
    desc:"Old routes marked in the margins lead to better loot.",
    effect:"+3 shards from Treasure" },

  { id:"echo_shard",   name:"Echo Shard",      rarity:"uncommon",
    icon:"assets/items/echo_shard.png",
    desc:"Once per realm it whispers away a wrong answer before you choose.",
    effect:"1 free 50/50 per realm" },

  { id:"scholars_lens",name:"Scholar's Lens",  rarity:"uncommon",
    icon:"assets/items/scholars_lens.png",
    desc:"Every chest you open holds something worth keeping.",
    effect:"Treasure always gives a relic" },

  { id:"iron_bell",    name:"Iron Bell",       rarity:"uncommon",
    icon:"assets/items/iron_bell.png",
    desc:"One clear ring and your partner is already beside you.",
    effect:"Team Up costs no monster HP" },

  { id:"ember_pouch",  name:"Ember Pouch",     rarity:"rare",
    icon:"assets/items/ember_pouch.png",
    desc:"Embers smoulder inside long after the run is over.",
    effect:"+50% Ember at run's end" },

  { id:"thunder_sigil",name:"Thunder Sigil",   rarity:"rare",
    icon:"assets/items/thunder_sigil.png",
    desc:"Elite monsters flinch at the sight of it.",
    effect:"Elites have 1 less HP" },

  { id:"guiding_star", name:"Guiding Star",    rarity:"rare",
    icon:"assets/items/guiding_star.png",
    desc:"It lights the rooms beyond the next turning.",
    effect:"See 2 layers ahead on the map" },
];

const POTIONS = [
  { id:"potion_heal",    name:"Healing Draught", price:22,
    icon:"assets/items/potion_heal.png",
    desc:"Warm and bitter. The party stands up straighter.",
    effect:"Restore 2 hearts" },

  { id:"potion_clarity", name:"Potion of Clarity", price:18,
    icon:"assets/items/potion_clarity.png",
    desc:"The wrong words blur and fade off the page.",
    effect:"Removes 1 wrong answer on the next question" },

  { id:"potion_shield",  name:"Storm Shield",    price:20,
    icon:"assets/items/potion_shield.png",
    desc:"A dome of hardened air holds for exactly one blow.",
    effect:"Blocks the next hit taken" },
];

const RARITY_PRICE = { common: 26, uncommon: 38, rare: 52 };

function relicById(id)  { return RELICS.find(r => r.id === id); }
function potionById(id) { return POTIONS.find(p => p.id === id); }
function itemById(id)   { return relicById(id) || potionById(id); }

function relicPrice(relic) { return RARITY_PRICE[relic.rarity] || 30; }
