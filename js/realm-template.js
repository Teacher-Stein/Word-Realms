// ===========================================================================
// A REALM TEMPLATE — copy this file, rename it, fill it in.
//
// HOW TO USE IT
//
//   1. Copy this file and rename it for your unit:  js/realm3.js
//   2. Change the 3s below to your realm number.
//   3. Replace the example questions with your own.
//   4. Add ONE line to index.html, just after the content.js line:
//
//        <script src="js/realm3.js"></script>
//
//   5. Open tools/check-content.html and fix anything it names.
//   6. Open the game. Your realm appears on the realm list.
//
// You do NOT need to touch js/content.js. If you make a typing mistake in this
// file, only your realm fails to load — the rest of the game still runs.
//
// WHAT YOU DO NOT HAVE TO MAKE
//
// This template borrows the monsters, the boss, the guide and the backdrops
// from Realm 1. That is deliberate and it is the recommended road: it turns a
// new unit from a week of work into a day or two. A Grade 5 class does not mind
// fighting a Thunderclap Wyrm about the past tense — they mind being bored.
//
// Make your own art later, once the questions are proving themselves in
// lessons. It is the expensive half and the least important one.
//
// HOW MUCH TO WRITE
//
//   32 curriculum keys           one per thing you want reviewed
//   6+ ordinary questions per key ~200 in total
//   1+ elite question per key     the harder version, used by the Boss
//   32 labels                     so the teaching report reads as English
//
// Six per key is not fussiness. At three per key, four classes in one day see
// nearly the same questions, because the game works through untested keys
// first. Six is what fixes it.
// ===========================================================================


// ---------------------------------------------------------------------------
// 1. YOUR CURRICULUM KEYS, IN PLAIN ENGLISH
//
// A key is one thing you want reviewed: one word, one grammar point, one skill.
// The key itself is a short tag you type; the label is what a teacher reads in
// the report months later, when "g2-form" means nothing to anybody.
//
// The GROUP is what makes the report worth having. One weak row is noise. Five
// weak rows that are all past tense is Monday's lesson. Put four to eight keys
// in each group.
// ---------------------------------------------------------------------------
const REALM3_LABELS = {
  // "your_key":  { label: "what a teacher reads", group: "the area it belongs to" },
  "example_word":    { label: "example word",              group: "Example vocabulary" },
  "example_grammar": { label: "example grammar point",     group: "Example grammar" },
};

// Merge them into the game's label table. Leave this line alone.
Object.assign(COVER_LABELS, REALM3_LABELS);


// ---------------------------------------------------------------------------
// 2. THE ORDINARY QUESTIONS
//
// These are what monsters ask. Recognition and vocabulary — the everyday stuff.
//
// FIELD BY FIELD
//   cover    which curriculum key this tests (must appear in the labels above)
//   tier     1 or 2 for ordinary questions. Higher tiers hurt more when wrong.
//   type     a word shown on screen: vocab, grammar, phonics, reason, fix it…
//            invent your own freely, it is only a label
//   open     THE ONE THAT MATTERS — see the warning below
//   clue     the question, exactly as the class reads it
//   answer   the correct option, spelled identically to its entry in choices
//   choices  three options including the answer
//
// ⚠ THE `open` FLAG ⚠
//
// `open: true` means "a student could say this answer out loud with nothing on
// the screen". The game uses it to offer a blind call for triple reward.
//
// So `open: true` is right for:      "Complete it: 'The storm ___ the roof.'"
// And `open: false` is right for:    "Which sentence is correct?"
//
// Get it wrong in the `true` direction and you offer a class a question that
// cannot be answered once the options vanish. That was a real bug here, in 19
// questions out of 47, and it is invisible until it happens in a lesson.
// tools/check-content.html catches the common shape of it. It cannot catch all
// of them, so think about each one.
// ---------------------------------------------------------------------------
const REALM3_QUESTIONS = [

  // ---- plain three-option questions -------------------------------------
  { cover:"example_word", tier:1, type:"vocab", open:true,
    clue:"A word meaning the opposite of 'ancient'.",
    answer:"modern", choices:["modern", "hollow", "distant"] },

  { cover:"example_word", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'The building is ___, it was finished last year.'",
    answer:"modern", choices:["modern", "ancient", "ruined"] },

  { cover:"example_grammar", tier:2, type:"grammar", open:false,
    clue:"Which sentence is correct?",
    answer:"She has lived here since 2019.",
    choices:["She has lived here since 2019.",
             "She has lived here since three years.",
             "She is living here since 2019."] },

  // ---- spot the error ----------------------------------------------------
  // The class reads a whole sentence and taps the one word that is wrong.
  // The closest this game gets to asking a child to produce language.
  //
  // TWO RULES: the wrong word must appear in the sentence spelled EXACTLY as
  // you wrote it in `answer`, and it must appear only ONCE — otherwise there
  // are two right taps and only one of them counts.
  { cover:"example_grammar", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"She have lived here since 2019.", answer:"have", fix:"has" },

  // ---- put it in order ---------------------------------------------------
  // Tap the fragments into place. Excellent for anything that is really a
  // word-order problem: tenses, questions, tags, comparatives.
  // Write `parts` in the CORRECT order — the game shuffles them.
  { cover:"example_grammar", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["She", "has lived", "here", "since 2019"] },

  // ---- odd one out -------------------------------------------------------
  // FOUR options, not three. Good for vocabulary that comes in families.
  { cover:"example_word", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these mean 'old'. Tap the one that does not.",
    answer:"modern", choices:["ancient", "antique", "aged", "modern"] },

];


// ---------------------------------------------------------------------------
// 3. THE ELITE QUESTIONS
//
// Elites and the Boss draw from this bank. These should ask a student to USE
// the language rather than recognise it — production, not recall. An elite
// should feel different the moment it appears on screen.
//
// Aim for at least one per curriculum key. Where a key has no elite question,
// the Boss falls back to the easy version, and the finale gets easier than it
// should be without anybody noticing.
//
// Use tier 4 here.
// ---------------------------------------------------------------------------
const REALM3_ELITE_QUESTIONS = [

  { cover:"example_word", tier:4, type:"apply", open:true,
    clue:"Your friend says the library is ancient. Say the opposite in one word.",
    answer:"modern", choices:["modern", "crowded", "quiet"] },

  { cover:"example_grammar", tier:4, type:"apply", open:true,
    clue:"Complete it about yourself: 'I ___ at this school since Grade 4.'",
    answer:"have studied", choices:["have studied", "am studying", "study"] },

];


// ---------------------------------------------------------------------------
// 4. REGISTER IT
//
// Everything below borrows Realm 1's cast and scenery. Change `name` and
// `theme` to yours; leave the rest alone until you want your own art.
//
// `theme` is shown to the class on the realm list, so make it the name of the
// unit as they know it.
// ---------------------------------------------------------------------------
registerRealm({
  id: 3,                                   // <- your realm number, 3 to 9
  name: "The Concert Caverns",             // <- the place, as the class sees it
  theme: "Unit 3 — Music",                 // <- your unit

  questions:      REALM3_QUESTIONS,
  eliteQuestions: REALM3_ELITE_QUESTIONS,

  // ---- borrowed from Realm 1 --------------------------------------------
  // Swap these for your own later. Everything here is art and flavour; none of
  // it affects how many questions get asked or how hard the realm is.
  monsters: REALM1_MONSTERS,
  elites:   REALM1_ELITES,
  boss:     REALMS[1].boss,
  npc:      REALMS[1].npc,
  palette:  "storm",
  sky:      "storm",
});


// ---------------------------------------------------------------------------
// 5. WHEN YOU HAVE FINISHED
//
//   □ Open tools/check-content.html and fix everything it names.
//   □ Read a dozen of your own questions ALOUD. It catches more than any
//     checker: clumsy phrasing, an answer that is arguably two answers, a clue
//     that gives the game away.
//   □ Check every `open: true` question really can be answered with nothing on
//     the screen.
//   □ Play one full run yourself before a class sees it. Twenty minutes.
//
// The realm stays locked for the class until you unlock it in the Teacher Menu.
// ---------------------------------------------------------------------------
