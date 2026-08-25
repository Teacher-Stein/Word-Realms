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
  stakes: {
    banner: "NEW: STAKES",
    title: "Decide how much you're putting on it",
    effect: "SAFE plays normally · RISKY doubles both ways",
    desc: "RISKY pays double shards and a mistake costs double. On some " +
          "questions it goes further: the options vanish and you say the " +
          "answer out loud for triple. Backing yourself when you KNOW is the " +
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
