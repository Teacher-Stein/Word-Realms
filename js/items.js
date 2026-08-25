// v5.5: six relics were removed here - Guiding Star, Stone Heart, Haggler's
// Token, Scout's Chart, Study Notes and Streak Totem. Every one of them was
// dead: the id appeared in this list and NOWHERE else in the codebase, so the
// game handed a child a card with a written promise on it and then did nothing.
// Because drops are uniform, roughly every other run awarded one. The child who
// "found" Study Notes genuinely believed the question type was being shown to
// them and could not say why it wasn't. Twenty relics that work beat twenty-six
// with landmines - and any of these can come back the day it is implemented.
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

  // v5.7: this used to only waive Team Up's 1 HP cost. Team Ups are capped at
  // three per RUN, so the relic's entire lifetime value was 3 monster HP -
  // less than one extra question. It now also buys two more Team Ups, which is
  // both a bigger effect and a better one: a Team Up is an extra question and
  // two children talking about the answer.
  { id:"iron_bell",    name:"Iron Bell",       rarity:"uncommon",
    icon:"assets/items/iron_bell.png",
    desc:"One clear ring and your partner is already beside you.",
    effect:"Team Up is free, and you get 2 more this run" },

  { id:"ember_pouch",  name:"Ember Pouch",     rarity:"rare",
    icon:"assets/items/ember_pouch.png",
    desc:"Embers smoulder inside long after the run is over.",
    effect:"+50% Ember at run's end" },

  { id:"thunder_sigil",name:"Thunder Sigil",   rarity:"rare",
    icon:"assets/items/thunder_sigil.png",
    desc:"Elite monsters flinch at the sight of it.",
    effect:"Elites have 1 less HP" },

  { id:"keen_edge",    name:"Keen Edge",       rarity:"common",
    icon:"assets/items/keen_edge.png",
    desc:"A whetstone that hums when a storm is near.",
    effect:"+2 shards per monster hit" },

  { id:"riposte_ring", name:"Riposte Ring",    rarity:"uncommon",
    icon:"assets/items/riposte_ring.png",
    desc:"Strike back before the blow has finished landing.",
    effect:"Correct answers delay the monster's attack" },

  // EPIC. Deliberately breaks the "gear never shortens a fight" rule, because
  // a class that has earned it should feel it. Elites ONLY: the boss's health
  // is the count of curriculum items nobody has faced yet, so halving it would
  // end the realm with half the unit untested.
  { id:"giant_slayer", name:"Giant-Slayer",    rarity:"epic",
    icon:"assets/items/giant_slayer.png",
    desc:"Forged for things far larger than yourself.",
    effect:"Deal 2 damage to Elites (not the Boss)" },

  // ---- survival ----
  { id:"aegis_charm",  name:"Aegis Charm",     rarity:"uncommon",
    icon:"assets/items/aegis_charm.png",
    desc:"A shell of still air that reforms itself.",
    effect:"+2 shields at every rest point" },

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

  // v5.7: +20% potion drop was worthless against a party already drowning in
  // them, and worse than worthless now that potions are capped at 4. It picks
  // up shards from a felled monster instead - the currency that actually has
  // somewhere to go since the shop gained a gear row.
  { id:"magpie_eye",   name:"Magpie's Eye",    rarity:"uncommon",
    icon:"assets/items/magpie_eye.png",
    desc:"It spots the glint of something useful.",
    effect:"+6 shards from every monster you fell" },

  // ---- utility ----
  { id:"team_banner",  name:"Rally Banner",    rarity:"uncommon",
    icon:"assets/items/team_banner.png",
    desc:"Two heads. One roar.",
    effect:"Team Up may be used twice per monster" },

  { id:"storm_crown",  name:"Storm Crown",     rarity:"epic",
    icon:"assets/items/storm_crown.png",
    desc:"Worn by whoever the storm decides to spare.",
    effect:"+1 max heart and +3 shields at every rest point" },

  { id:"oracle_eye",   name:"Oracle's Eye",    rarity:"epic",
    icon:"assets/items/oracle_eye.png",
    desc:"It has already watched this fight happen once.",
    effect:"Monsters always telegraph one turn earlier" },

];

const POTIONS = [
  { id:"potion_heal",    name:"Healing Draught", price:37,
    icon:"assets/items/potion_heal.png",
    desc:"Warm and bitter. The party stands up straighter.",
    effect:"Restore 2 hearts" },

  { id:"potion_clarity", name:"Potion of Clarity", price:31,
    icon:"assets/items/potion_clarity.png",
    desc:"The wrong words blur and fade off the page.",
    effect:"Removes 1 wrong answer on the next question" },

  { id:"potion_shield",  name:"Storm Shield",    price:34,
    icon:"assets/items/potion_shield.png",
    desc:"A dome of hardened air holds for exactly one blow.",
    effect:"Blocks the next hit taken" },

  // Shields no longer refill for free in every room, so there has to be
  // something worth spending shards on between rest points.
  { id:"potion_patch",   name:"Patch Kit",       price:27,
    icon:"assets/items/potion_patch.png",
    desc:"Wire, hide and a great deal of swearing.",
    effect:"Restore 6 shields" },
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
    effect:"+3 shields at every rest point" },
  { id:"stormhide",    slot:"armour", name:"Stormhide Cloak",  rarity:"uncommon",
    icon:"assets/items/stormhide.png",
    desc:"Cut from something that survived the eye.",
    effect:"Elite and Boss damage reduced by 1" },
  { id:"aegis_mantle", slot:"armour", name:"Aegis Mantle",     rarity:"rare",
    icon:"assets/items/aegis_mantle.png",
    desc:"The storm simply declines to touch you.",
    effect:"+5 shields at every rest point, blocks Expose" },
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
    effect:"Armour: +2 shields at every rest point" },
  // v5.7: this was the one enchantment with no read side anywhere - and its
  // old wording ("attackers lose shards") described something the monsters do
  // not even have. Thorns that damaged the monster would shorten the fight and
  // are forbidden, so it pays the PARTY instead: taking a hit is worth
  // something, which is a real reason to stand and fight rather than Brace.
  { id:"thorn_etch",  name:"Thorn Etch",  icon:"assets/items/thorn_etch.png",
    desc:"Sharp on the inside as well as the out.",
    effect:"Armour: +4 shards whenever a blow lands on you" },
];

const ALL_GEAR = WEAPONS.concat(ARMOURS);

function gearById(id)  { return ALL_GEAR.find(g => g.id === id); }
function enchantById(id){ return ENCHANTMENTS.find(e => e.id === id); }

// v6.1: prices up by roughly 70%.
//
// Every one of four real classes bought EVERY item in every shop, which means
// the shop was a shopping list rather than a decision. The shelf is already
// six items (2 relics, 1 gear, 3 potions) so the problem was never stock size
// - it was that a run earns more than six items cost.
//
// The fix is on THIS side rather than on income, deliberately. Most shard
// income is the 2-per-correct-answer trickle, and that trickle is the game
// telling a child that getting it right mattered. Cutting it to balance a shop
// would weaken the exact feedback loop this game exists for. So the money
// stays and the goods cost more.
//
// Target: six on the shelf, about two affordable. Watch this in a real lesson
// - the last time this was tuned from a simulation, the simulation turned out
// to be modelling a solo player rather than a class that plays well.
const RARITY_PRICE = { common: 44, uncommon: 65, rare: 88, epic: 132 };
// Gear is priced above a relic of the same rarity: it occupies a slot, it can
// be replaced later, and it is the shard sink for a party that already has
// everything else it wants.
const GEAR_PRICE   = { common: 58, uncommon: 82, rare: 108, epic: 152 };

function relicById(id)  { return RELICS.find(r => r.id === id); }
function potionById(id) { return POTIONS.find(p => p.id === id); }
function itemById(id)   { return relicById(id) || potionById(id) || gearById(id) || enchantById(id); }

function relicPrice(relic) { return RARITY_PRICE[relic.rarity] || 30; }
