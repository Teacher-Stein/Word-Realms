// ---------------------------------------------------------------------------
// Playable heroes. One is chosen per run on the hero-select screen.
// `grant` is applied once, right after the run is created.
// ---------------------------------------------------------------------------

const HEROES = [
  {
    id: "wordsmith",
    name: "The Wordsmith",
    sprite: "assets/heroes/wordsmith.png",
    tagline: "Ink, letters and a blade of light.",
    perk: "Begins the run with a free relic.",
    blurb: "A storm-scribe duellist. Words are sharper than steel in the " +
           "right hand.",
    grant(run) {
      const relic = availableRelic(["common", "uncommon"]);
      if (relic) addRelic(relic);
      return relic ? `Started with ${relic.name}` : "";
    },
  },
  {
    id: "knight",
    name: "The Grammar Knight",
    sprite: "assets/heroes/knight.png",
    tagline: "Storm-forged plate and an unbreakable rule.",
    perk: "Begins armoured with 3 shield points.",
    blurb: "Nothing gets past a knight who knows exactly where the full " +
           "stop goes.",
    grant(run) {
      run.shields = (run.shields || 0) + 3;
      return "Started with 3 shields";
    },
  },
  {
    id: "ranger",
    name: "The Phonics Ranger",
    sprite: "assets/heroes/ranger.png",
    tagline: "A bowstring of pure lightning.",
    // v6.3: this used to be "+50% Knowledge Shards from every source", for the
    // whole run. Two problems, and they compounded.
    //
    // It was not a choice. The other three heroes give a ONE-TIME gift - a
    // relic, three shields, two potions. Half again on every shard for fifteen
    // rooms dwarfs all of them, so picking her was simply correct, and Stein's
    // classes worked that out and picked her every time.
    //
    // Which meant the shop economy was ALWAYS running at 1.5x income against
    // prices tuned for 1.0x. The v6.1 price rise of 70% was, in practice, a 13%
    // tightening - and every class still bought out every shop.
    //
    // Heroes should change how a class plays, not how much it earns. Hers is
    // now information: she reads the storm one answer sooner than anyone else.
    perk: "Every monster's FIRST attack comes one answer later than it should.",
    blurb: "Quick, quiet, and never misses the sound she is aiming for.",
    grant(run) {
      run.rangerEye = true;
      return "Every monster's opening attack is one answer late";
    },
  },
  {
    id: "scholar",
    name: "The Storm Scholar",
    sprite: "assets/heroes/scholar.png",
    tagline: "The storm answers when she reads aloud.",
    perk: "Begins with two potions and a piece of gear.",
    blurb: "She has read every book in the Stormlands. Twice.",
    grant(run) {
      addPotion("potion_heal");
      addPotion("potion_clarity");
      const g = availableGear();
      if (g) equipGear(g);
      return g ? `Started with 2 potions and ${g.name}` : "Started with 2 potions";
    },
  },
];

function heroById(id) {
  return HEROES.find(h => h.id === id) || HEROES[0];
}

function currentHero() {
  return STATE.run && STATE.run.heroId ? heroById(STATE.run.heroId) : null;
}
