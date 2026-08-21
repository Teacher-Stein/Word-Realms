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
    perk: "Earns 50% more Knowledge Shards from every source.",
    blurb: "Quick, quiet, and never misses the sound she is aiming for.",
    grant(run) {
      run.shardMultiplier = 1.5;
      return "Shard rewards increased by 50%";
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
