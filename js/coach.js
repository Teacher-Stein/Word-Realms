// ---------------------------------------------------------------------------
// COACH MODE
//
// The game now has Momentum, Commit, Brace, Team Up, campfires, relics,
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
  momentum: {
    banner: "NEW: MOMENTUM",
    title: "Every right answer builds Momentum",
    effect: "Spend it on the four moves above the battlefield",
    desc: "Insight cuts a wrong answer. Rouse doubles your shards. Guard stops " +
          "2 damage. Rally heals a heart. You can never afford all of them — " +
          "deciding what to save for is the game.",
  },
  intent: {
    banner: "NEW: THE MONSTER'S PLAN",
    title: "It tells you what it will do, and when",
    effect: "Read the red bar under the monster",
    desc: "The dots count down to the blow. When it says NEXT TURN you can " +
          "Brace to block it, spend Guard, or take it on the chin and keep " +
          "attacking. That choice is yours.",
  },
  campfire: {
    banner: "NEW: THE CAMPFIRE",
    title: "There is time for one thing only",
    effect: "Mend hearts, Repair shields, or Sharpen",
    desc: "Shields never come back on their own, so a campfire spent healing " +
          "is a campfire not spent on armour. Argue it out — there is no " +
          "right answer, only a reason.",
  },
  commit: {
    banner: "NEW: COMMIT",
    title: "Answer with the options hidden",
    effect: "Double shards and bonus Momentum if you land it",
    desc: "Say the answer out loud with nothing on screen to choose from. " +
          "Harder than picking — which is exactly why it pays more.",
  },
  elite: {
    banner: "AN ELITE",
    title: "This one is a long fight",
    effect: "Harder questions, better rewards",
    desc: "Elites ask you to USE the language rather than recognise it, and " +
          "a wrong answer here costs three hearts. They always drop a relic.",
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
