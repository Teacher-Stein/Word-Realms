// ---------------------------------------------------------------------------
// COACH MODE
//
// The game now has Stakes, Brace, Team Up, campfires, relics,
// potions, shards, Ember and debuffs. A class meeting all of that cold on a TV
// is lost, and the teacher ends up spending the first fifteen minutes of the
// lesson explaining instead of reviewing - every time, for nine realms.
//
// So the game teaches itself: the first time a mechanic actually appears, it
// stops and explains that ONE thing, then never mentions it again. Marks are
// kept per class and can be cleared from the Teacher Menu when a new class
// starts, or switched off entirely for a class that already knows.
// ---------------------------------------------------------------------------

const COACH_LESSONS = {
  // Rewritten in v6.7. It used to say "RISKY doubles both ways", which was the
  // v5.3 mechanic and stopped being true: the penalty is now a flat number, not
  // a multiple of the question's tier. A coach card that describes a mechanic
  // the game no longer has is worse than no card, because the class believes it.
  // Rewritten in v7.0. It used to end "on SOME questions RISKY goes further:
  // the options vanish" - and that word `some` was the whole problem. One
  // student pressed RISKY and had to produce the answer from nothing; the next
  // pressed it and got a multiple choice. A class called that unfair and they
  // were right. RISKY now does one thing, so the card describes one thing.
  stakes: {
    banner: "NEW: STAKES",
    title: "Decide how much you're putting on it",
    effect: "RISKY = no options. Say it out loud.",
    desc: "SAFE keeps the three options on screen. RISKY takes them ALL away " +
          "and you say the answer out loud — your teacher decides if you got " +
          "it. It is always this, every time. Land it and you hit twice as " +
          "hard for triple shards; miss and it costs four hearts, or six on " +
          "the hardest questions. The button tells you the exact number before " +
          "you choose, so look at it. Backing yourself when you KNOW is the " +
          "skill — and knowing when you don't know is the other half of it.",
  },
  intent: {
    banner: "NEW: THE MONSTER'S PLAN",
    title: "It tells you what it will do, and when",
    effect: "Read the red bar above the monster",
    desc: "The countdown is in ANSWERS, from anybody — not just your turn. " +
          "When it says ON THE NEXT ANSWER you can Brace to block it, or take " +
          "the hit and keep attacking.",
  },
  // Brace is one of only two real tactical decisions a student makes in a
  // fight, and until v6.3 nothing in the game ever explained it. The `intent`
  // card mentions the word in its last sentence and moves on; the button just
  // sits there saying "Brace (defend)". Worse, Brace spent two versions doing
  // nothing at all (see test_brace.py), so nobody who played those builds ever
  // learned what it was for either.
  //
  // It fires when the blow is one answer away, because that is the only moment
  // the decision exists.
  brace: {
    banner: "NEW: BRACE",
    title: "The blow lands on the next answer",
    effect: "Brace, then answer correctly, and it is blocked",
    desc: "Bracing does not skip your turn — you still answer the question. " +
          "A correct answer turns the attack aside and puts the monster's " +
          "clock back to the start, so you have not lost anything except the " +
          "damage you would have dealt. Get it wrong and the blow lands " +
          "anyway. Brace when the hit is big or your hearts are low; keep " +
          "attacking when it is small.",
  },
  // Potions moved into the HUD in v6.2 after four classes never once used one.
  // Moving the button is not the same as explaining it: a class that does not
  // know the pack exists will still walk into the boss holding two full heals.
  potions: {
    banner: "NEW: THE PACK",
    title: "You are carrying something you can use",
    effect: "One item per turn · it costs your attack, not your question",
    desc: "Tap an item in the bar at the top, or Use an Item in a fight. You " +
          "still answer the question that turn, so nothing is skipped — you " +
          "just do not hit the monster. Items are for the moment things go " +
          "wrong, and a potion saved for a boss you never reach is a potion " +
          "wasted.",
  },
  // The Chorus changes what the class is being asked to DO, which is a bigger
  // change than any other room makes, and a room full of children who think one
  // person is about to answer will sit on their hands.
  chorus: {
    banner: "NEW: THE CHORUS",
    title: "This one is for everybody",
    effect: "The whole class answers at once",
    desc: "Nobody is picked and nobody loses their turn. Everyone answers " +
          "together — hands up, fingers out, or write it on a board — and your " +
          "teacher says how the room did. The storm cannot hurt you in here, " +
          "so there is nothing to lose by having a go.",
  },
  campfire: {
    banner: "NEW: THE CAMPFIRE",
    title: "There is time for one thing only",
    effect: "Mend hearts, Repair shields, or Sharpen",
    desc: "Shields never come back on their own, so a campfire spent healing " +
          "is a campfire not spent on armour. Argue it out — there is no " +
          "right answer, only a reason.",
  },
  elite: {
    banner: "AN ELITE",
    title: "This one is a long fight",
    effect: "Harder questions, better rewards",
    // "costs three hearts" was stale from v6.0 - tier 4 has cost 2 since v6.1,
    // and since v6.7 a RISKY miss here costs 6. Naming one number was wrong in
    // both directions, so it now points at the gate, which is never wrong.
    desc: "Elites ask you to USE the language rather than recognise it, they " +
          "take a long time to bring down, and going RISKY against one costs " +
          "six hearts if it misses. Read the stake buttons here. They always " +
          "drop a relic.",
  },
  debuff: {
    banner: "YOU HAVE BEEN CURSED",
    title: "Watch the chip beside your hero",
    effect: "It stays until something clears it",
    desc: "Chilled means your next hit does nothing. Exposed makes the next " +
          "mistake cost more. Frozen forces you to Brace. A correct answer " +
          "while Bracing clears any of them.",
  },
  shop: {
    banner: "THE STORM PEDLAR",
    title: "Somewhere to spend Knowledge Shards",
    effect: "Relics last the run; potions last one use",
    desc: "A Patch Kit is the only thing besides a campfire that puts shields " +
          "back. Leaving with shards in your pocket is usually a mistake.",
  },
};

function coachEnabled() {
  return STATE.coachOn !== false;
}

// Show a lesson once. Returns true if it fired.
function coach(id) {
  if (!coachEnabled()) return false;
  const lesson = COACH_LESSONS[id];
  if (!lesson) return false;
  STATE.coachSeen = STATE.coachSeen || {};
  if (STATE.coachSeen[id]) return false;
  STATE.coachSeen[id] = true;
  saveState();
  showPopup({
    banner: lesson.banner, tone: "coach",
    title: lesson.title, effect: lesson.effect, desc: lesson.desc,
    extra: "This only appears once. Teacher Menu can bring it back.",
    button: "Got it",
  });
  return true;
}

function resetCoach() {
  STATE.coachSeen = {};
  saveState();
}
