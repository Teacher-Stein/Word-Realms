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
    desc:"Once per run it whispers away a wrong answer before you choose.",
    effect:"Removes a wrong option on your first grammar question" },

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
// ---- combat ----
  { id:"keen_edge",    name:"Keen Edge",       rarity:"common",
    icon:"assets/items/keen_edge.png",
    desc:"A whetstone that hums when a storm is near.",
    effect:"+2 shards per monster hit" },

  { id:"riposte_ring", name:"Riposte Ring",    rarity:"uncommon",
    icon:"assets/items/riposte_ring.png",
    desc:"Strike back before the blow has finished landing.",
    effect:"Correct answers delay the monster's attack" },

  { id:"giant_slayer", name:"Giant-Slayer",    rarity:"rare",
    icon:"assets/items/giant_slayer.png",
    desc:"Forged for things far larger than yourself.",
    effect:"Deal 2 damage to Elites and Bosses" },

  // ---- survival ----
  { id:"stone_heart",  name:"Stone Heart",     rarity:"uncommon",
    icon:"assets/items/stone_heart.png",
    desc:"Slow, steady, and very hard to stop.",
    effect:"+2 max hearts, healed now" },

  { id:"aegis_charm",  name:"Aegis Charm",     rarity:"uncommon",
    icon:"assets/items/aegis_charm.png",
    desc:"A shell of still air that reforms itself.",
    effect:"Gain 1 shield at the start of each room" },

  { id:"last_breath",  name:"Last Breath",     rarity:"rare",
    icon:"assets/items/last_breath.png",
    desc:"One more lungful. One more step.",
    effect:"A second Last Stand this run" },

  { id:"thaw_stone",   name:"Thaw Stone",      rarity:"common",
    icon:"assets/items/thaw_stone.png",
    desc:"Warm to the touch, even in a blizzard.",
    effect:"Immune to Chill and Freeze" },

  // ---- economy ----
  { id:"coin_purse",   name:"Deep Coin Purse", rarity:"common",
    icon:"assets/items/coin_purse.png",
    desc:"Somehow there is always a little more inside.",
    effect:"+25% shards from all sources" },

  { id:"haggle_token", name:"Haggler's Token", rarity:"uncommon",
    icon:"assets/items/haggle_token.png",
    desc:"The pedlar sighs, but he takes it.",
    effect:"Shop prices reduced by a third" },

  { id:"magpie_eye",   name:"Magpie's Eye",    rarity:"uncommon",
    icon:"assets/items/magpie_eye.png",
    desc:"It spots the glint of something useful.",
    effect:"Monsters sometimes drop potions" },

  // ---- utility ----
  { id:"scouts_chart", name:"Scout's Chart",   rarity:"common",
    icon:"assets/items/scouts_chart.png",
    desc:"Someone mapped this floor before you. Bravely.",
    effect:"Reveals room types further ahead" },

  { id:"study_notes",  name:"Study Notes",     rarity:"common",
    icon:"assets/items/study_notes.png",
    desc:"Scrawled in a hurry, but the answers are right.",
    effect:"Question type shown before you choose" },

  { id:"team_banner",  name:"Rally Banner",    rarity:"uncommon",
    icon:"assets/items/team_banner.png",
    desc:"Two heads. One roar.",
    effect:"Team Up may be used twice per monster" },

  { id:"streak_totem", name:"Momentum Totem",  rarity:"rare",
    icon:"assets/items/streak_totem.png",
    desc:"It spins faster the better things are going.",
    effect:"Streak bonuses trigger one answer sooner" },

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



// ---------------------------------------------------------------------------
// GEAR - one Weapon and one Armour may be equipped at a time. Neither ever
// shortens a fight: weapons change rewards and tempo, armour absorbs damage.
// ---------------------------------------------------------------------------
const WEAPONS = [
  { id:"storm_blade",  slot:"weapon", name:"Storm-Iron Blade", rarity:"common",
    icon:"assets/items/storm_blade.png",
    desc:"Cold iron, quenched in a thundercloud.",
    effect:"+2 shards on every hit" },
  { id:"thunder_pike", slot:"weapon", name:"Thunder Pike",     rarity:"uncommon",
    icon:"assets/items/thunder_pike.png",
    desc:"Long enough to keep the big ones honest.",
    effect:"1 in 4 hits is a critical: double shards" },
  { id:"warding_stave",slot:"weapon", name:"Warding Stave",    rarity:"rare",
    icon:"assets/items/warding_stave.png",
    desc:"It hums a warning half a second before the blow.",
    effect:"1 in 3 hits stuns: cancels the next attack" },
];

const ARMOURS = [
  { id:"windwarden",   slot:"armour", name:"Windwarden Plate", rarity:"common",
    icon:"assets/items/windwarden.png",
    desc:"Layered against a gale that never stops.",
    effect:"+2 shields at the start of each room" },
  { id:"stormhide",    slot:"armour", name:"Stormhide Cloak",  rarity:"uncommon",
    icon:"assets/items/stormhide.png",
    desc:"Cut from something that survived the eye.",
    effect:"Elite and Boss damage reduced by 1" },
  { id:"aegis_mantle", slot:"armour", name:"Aegis Mantle",     rarity:"rare",
    icon:"assets/items/aegis_mantle.png",
    desc:"The storm simply declines to touch you.",
    effect:"+3 shields per room, blocks Expose" },
];

const ENCHANTMENTS = [
  { id:"frost_etch",  name:"Frost Etch",  icon:"assets/items/frost_etch.png",
    desc:"Rimed lettering along the edge.",
    effect:"Weapon: chance to cancel the monster's next attack" },
  { id:"greed_etch",  name:"Greed Etch",  icon:"assets/items/greed_etch.png",
    desc:"It counts what it cuts.",
    effect:"Weapon: +3 shards per hit" },
  { id:"ward_etch",   name:"Ward Etch",   icon:"assets/items/ward_etch.png",
    desc:"A closed circle, unbroken.",
    effect:"Armour: +1 shield per room" },
  { id:"thorn_etch",  name:"Thorn Etch",  icon:"assets/items/thorn_etch.png",
    desc:"Sharp on the inside as well as the out.",
    effect:"Armour: attackers lose shards when they hit you" },
];

const ALL_GEAR = WEAPONS.concat(ARMOURS);

function gearById(id)  { return ALL_GEAR.find(g => g.id === id); }
function enchantById(id){ return ENCHANTMENTS.find(e => e.id === id); }

const RARITY_PRICE = { common: 26, uncommon: 38, rare: 52 };

function relicById(id)  { return RELICS.find(r => r.id === id); }
function potionById(id) { return POTIONS.find(p => p.id === id); }
function itemById(id)   { return relicById(id) || potionById(id) || gearById(id) || enchantById(id); }

function relicPrice(relic) { return RARITY_PRICE[relic.rarity] || 30; }
