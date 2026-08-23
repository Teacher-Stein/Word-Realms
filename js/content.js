// ---------------------------------------------------------------------------
// REALM 1 CONTENT - Unit 1 of Our World 5 (Extreme Weather).
//
// Every question is written fresh for this game (nothing copied from the
// textbook). `cover` is the curriculum item a question tests - several
// questions share a `cover` key so the same word can be asked in different
// ways without repeating the exact question. The boss fight uses `cover`
// keys to guarantee the whole unit gets tested before the realm is cleared.
//
// type: vocab | phonics | grammar   (shown as a small tag in the UI)
//
// `open` marks a question that can be ANSWERED ALOUD from the clue alone.
// This is what gates Commit, not difficulty. "Complete it: 'The ___ was so
// loud...'" works with the options hidden; "Choose the correct sentence:" is
// the options themselves, and offering a Commit on it asks a child to answer
// a question that has not been asked yet.
// ---------------------------------------------------------------------------

const REALM1_QUESTIONS = [
  // ===================== VOCABULARY 1: extreme weather =====================
  { cover:"thunder", tier:1, type:"vocab", open:true, clue:"You often hear this loud rumbling sound right after you see lightning.",
    answer:"thunder", choices:["thunder","a drought","a heat wave"] },
  { cover:"thunder", tier:2, type:"vocab", open:true, clue:"Complete it: 'The ___ was so loud that it woke the whole family up.'",
    answer:"thunder", choices:["thunder","speed","a shelter"] },

  { cover:"lightning", tier:1, type:"vocab", open:true, clue:"A bright flash of electricity that lights up the sky during a storm.",
    answer:"lightning", choices:["lightning","a blizzard","a range"] },
  { cover:"lightning", tier:2, type:"vocab", open:true, clue:"Complete it: 'If you see ___, you should go inside immediately.'",
    answer:"lightning", choices:["lightning","supplies","a plan"] },

  { cover:"flood", tier:1, type:"vocab", open:true, clue:"When a huge amount of rain makes rivers overflow and water covers the streets.",
    answer:"a flood", choices:["a flood","a sandstorm","an ice storm"] },
  { cover:"flood", tier:2, type:"vocab", open:true, clue:"Complete it: 'After three days of heavy rain, there was a ___ in the village.'",
    answer:"flood", choices:["flood","drought","heat wave"] },

  { cover:"drought", tier:1, type:"vocab", open:true, clue:"A very long period with no rain at all, so the ground gets dry and cracked.",
    answer:"a drought", choices:["a drought","a tropical storm","a tornado"] },
  { cover:"drought", tier:2, type:"vocab", open:true, clue:"Complete it: 'The farmers lost their crops because of the long ___.'",
    answer:"drought", choices:["drought","flood","blizzard"] },

  { cover:"ice storm", tier:1, type:"vocab", open:true, clue:"Freezing rain that coats everything - trees, cars, roads - in a layer of ice.",
    answer:"an ice storm", choices:["an ice storm","a heat wave","a hurricane"] },
  { cover:"ice storm", tier:2, type:"vocab", open:true, clue:"Complete it: 'The ___ covered every branch in shining ice.'",
    answer:"ice storm", choices:["ice storm","sandstorm","heat wave"] },

  { cover:"blizzard", tier:1, type:"vocab", open:true, clue:"A dangerous snowstorm with strong winds where you can barely see anything.",
    answer:"a blizzard", choices:["a blizzard","a drought","a flood"] },
  { cover:"blizzard", tier:2, type:"vocab", open:true, clue:"Complete it: 'Schools closed because a ___ buried the roads in snow.'",
    answer:"blizzard", choices:["blizzard","drought","tornado"] },

  { cover:"tropical storm", tier:1, type:"vocab", open:true, clue:"A big swirling storm with strong wind and heavy rain that forms over warm ocean water.",
    answer:"a tropical storm", choices:["a tropical storm","an ice storm","a heat wave"] },
  { cover:"tropical storm", tier:2, type:"vocab", open:true, clue:"Complete it: 'A ___ formed over the warm sea and moved toward the coast.'",
    answer:"tropical storm", choices:["tropical storm","ice storm","drought"] },

  { cover:"speed", tier:1, type:"vocab", open:true, clue:"How fast something moves - scientists measure the wind's ___ to see how dangerous a storm is.",
    answer:"speed", choices:["speed","a range","a shelter"] },
  { cover:"speed", tier:2, type:"vocab", open:true, clue:"Complete it: 'The wind ___ reached 200 kilometres per hour.'",
    answer:"speed", choices:["speed","range","drop"] },

  { cover:"hurricane", tier:1, type:"vocab", open:true, clue:"A massive spinning ocean storm with a calm 'eye' at its centre.",
    answer:"a hurricane", choices:["a hurricane","a sandstorm","a drought"] },
  { cover:"hurricane", tier:1, type:"vocab", open:false, clue:"Which storm has an 'eye' in the middle where the weather is suddenly calm?",
    answer:"a hurricane", choices:["a hurricane","a blizzard","an ice storm"] },

  { cover:"tornado", tier:1, type:"vocab", open:true, clue:"It spins in a tight twisting funnel shape and can flatten a town in seconds.",
    answer:"a tornado", choices:["a tornado","a heat wave","a flood"] },
  { cover:"tornado", tier:2, type:"vocab", open:true, clue:"Complete it: 'A ___ tore through the fields and lifted the roof off the barn.'",
    answer:"tornado", choices:["tornado","drought","heat wave"] },

  { cover:"sandstorm", tier:1, type:"vocab", open:true, clue:"Strong winds pick up sand and dust, making it hard to see or breathe outdoors.",
    answer:"a sandstorm", choices:["a sandstorm","a blizzard","an ice storm"] },
  { cover:"sandstorm", tier:2, type:"vocab", open:true, clue:"Complete it: 'If a ___ comes, close all the windows and stay inside.'",
    answer:"sandstorm", choices:["sandstorm","flood","heat wave"] },

  { cover:"range", tier:1, type:"vocab", open:true, clue:"The difference between the lowest and the highest amount, like temperatures in one day.",
    answer:"a range", choices:["a range","speed","a drop"] },
  { cover:"range", tier:2, type:"vocab", open:true, clue:"Complete it: 'Today the temperature ___ was from 18 to 32 degrees.'",
    answer:"range", choices:["range","speed","shelter"] },

  { cover:"rise", tier:1, type:"vocab", open:true, clue:"When a number, like the temperature, goes UP.",
    answer:"rise", choices:["rise","drop","range"] },
  { cover:"rise", tier:2, type:"vocab", open:true, clue:"Complete it: 'Temperatures will ___ to 40 degrees this weekend.'",
    answer:"rise", choices:["rise","drop","warn"] },

  { cover:"drop", tier:1, type:"vocab", open:true, clue:"When a number, like the temperature, goes DOWN suddenly.",
    answer:"drop", choices:["drop","rise","speed"] },
  { cover:"drop", tier:2, type:"vocab", open:true, clue:"Complete it: 'The temperature will ___ below zero tonight, so wear a coat.'",
    answer:"drop", choices:["drop","rise","range"] },

  { cover:"heat wave", tier:1, type:"vocab", open:true, clue:"Several days in a row of unusually hot weather.",
    answer:"a heat wave", choices:["a heat wave","a blizzard","a flood"] },
  { cover:"heat wave", tier:2, type:"vocab", open:true, clue:"Complete it: 'During the ___, the city opened cool rooms for elderly people.'",
    answer:"heat wave", choices:["heat wave","ice storm","blizzard"] },

  // ===================== VOCABULARY 2: emergencies =====================
  { cover:"emergency", tier:1, type:"vocab", open:true, clue:"A sudden dangerous situation that needs quick action.",
    answer:"an emergency", choices:["an emergency","a shelter","supplies"] },
  { cover:"emergency", tier:2, type:"vocab", open:true, clue:"Complete it: 'In an ___, call for help straight away.'",
    answer:"emergency", choices:["emergency","instrument","range"] },

  { cover:"plan", tier:1, type:"vocab", open:true, clue:"Steps you decide on ahead of time so you know what to do if something goes wrong.",
    answer:"a plan", choices:["a plan","a flashlight","an emergency"] },
  { cover:"plan", tier:2, type:"vocab", open:true, clue:"Complete it: 'Every family should make a storm ___ before the season starts.'",
    answer:"plan", choices:["plan","funnel","speed"] },

  { cover:"flashlight", tier:1, type:"vocab", open:true, clue:"A small handheld light - very useful when the power goes out.",
    answer:"a flashlight", choices:["a flashlight","a shelter","supplies"] },
  { cover:"flashlight", tier:2, type:"vocab", open:true, clue:"Complete it: 'When the lights went out, she grabbed a ___.'",
    answer:"flashlight", choices:["flashlight","shelter","range"] },

  { cover:"supplies", tier:1, type:"vocab", open:true, clue:"Food, water and other items you gather and keep ready in case of an emergency.",
    answer:"supplies", choices:["supplies","a plan","a shelter"] },
  { cover:"supplies", tier:2, type:"vocab", open:true, clue:"Complete it: 'They packed ___ like water, food and batteries.'",
    answer:"supplies", choices:["supplies","instruments","speed"] },

  { cover:"shelter", tier:1, type:"vocab", open:true, clue:"A safe place that protects you from dangerous weather.",
    answer:"a shelter", choices:["a shelter","a flashlight","a plan"] },
  { cover:"shelter", tier:2, type:"vocab", open:true, clue:"Complete it: 'The families waited in a storm ___ until the wind stopped.'",
    answer:"shelter", choices:["shelter","supplies","emergency"] },

  // ===================== READING: Tornado Trouble =====================
  { cover:"instruments", tier:1, type:"vocab", open:true, clue:"Scientists use these tools to measure things like wind speed and temperature.",
    answer:"instruments", choices:["instruments","funnel","warn"] },
  { cover:"instruments", tier:2, type:"vocab", open:true, clue:"Complete it: 'The weather ___ recorded the storm all night.'",
    answer:"instruments", choices:["instruments","supplies","shelters"] },

  { cover:"twisted", tier:1, type:"vocab", open:true, clue:"Bent or spun out of its normal shape.",
    answer:"twisted", choices:["twisted","warned","dropped"] },
  { cover:"twisted", tier:2, type:"vocab", open:true, clue:"Complete it: 'The strong wind ___ the metal sign into a strange shape.'",
    answer:"twisted", choices:["twisted","warned","rose"] },

  { cover:"funnel", tier:1, type:"vocab", open:true, clue:"A cone shape, wide at the top and narrow at the bottom - the shape of a tornado.",
    answer:"a funnel", choices:["a funnel","an instrument","a range"] },
  { cover:"funnel", tier:2, type:"vocab", open:true, clue:"Complete it: 'A dark ___ dropped down from the storm cloud.'",
    answer:"funnel", choices:["funnel","shelter","drought"] },

  { cover:"warn", tier:1, type:"vocab", open:true, clue:"To tell people about danger BEFORE it happens.",
    answer:"warn", choices:["warn","twist","rise"] },
  { cover:"warn", tier:2, type:"vocab", open:true, clue:"Complete it: 'Sirens ___ the town that a tornado was coming.'",
    answer:"warned", choices:["warned","twisted","dropped"] },

  // ===================== PHONICS: /θ/ and /ð/ =====================
  { cover:"phonics-theta", tier:2, type:"phonics", open:false, clue:"Which word has the SAME soft, breathy 'th' sound as 'thanks' and 'thunder'?",
    answer:"think", choices:["think","this","those"] },
  { cover:"phonics-theta", tier:2, type:"phonics", open:false, clue:"Which word uses the /θ/ sound (like in 'thought')?",
    answer:"birthday", choices:["birthday","weather","therefore"] },
  { cover:"phonics-theta", tier:2, type:"phonics", open:false, clue:"Which one does NOT have the /θ/ sound?",
    answer:"those", choices:["those","thermometer","thanks"] },

  { cover:"phonics-eth", tier:2, type:"phonics", open:false, clue:"Which word has the buzzy /ð/ sound, like 'this' and 'weather'?",
    answer:"though", choices:["though","thanks","birthday"] },
  { cover:"phonics-eth", tier:2, type:"phonics", open:false, clue:"Which word uses the /ð/ sound (your voice buzzes)?",
    answer:"therefore", choices:["therefore","think","thunder"] },
  { cover:"phonics-eth", tier:2, type:"phonics", open:false, clue:"Which one does NOT have the buzzy /ð/ sound?",
    answer:"thermometer", choices:["thermometer","those","weather"] },

  // ===================== GRAMMAR 1: be going to =====================
  { cover:"g1-question", tier:3, type:"grammar", open:false, clue:"Choose the correctly formed question:",
    answer:"Is it going to rain tomorrow?", choices:["Is it going to rain tomorrow?","Is it go to rain tomorrow?","Is it going rain tomorrow?"] },
  { cover:"g1-question", tier:3, type:"grammar", open:false, clue:"Choose the correct question about the future:",
    answer:"Are they going to check the shelter?", choices:["Are they going to check the shelter?","Are they going check the shelter?","Do they going to check the shelter?"] },

  { cover:"g1-statement", tier:3, type:"grammar", open:true, clue:"Complete it: 'I ___ listen to the weather forecast at eight o'clock.'",
    answer:"am going to", choices:["am going to","is going to","going to be"] },
  { cover:"g1-statement", tier:3, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"They are going to check the storm shelter.", choices:["They are going to check the storm shelter.","They going to check the storm shelter.","They are go to check the storm shelter."] },

  { cover:"g1-negative", tier:3, type:"grammar", open:true, clue:"Complete it: 'It ___ snow tomorrow - it's going to rain.'",
    answer:"isn't going to", choices:["isn't going to","aren't going to","doesn't going to"] },
  { cover:"g1-negative", tier:3, type:"grammar", open:false, clue:"Choose the correct negative prediction:",
    answer:"We aren't going to travel in this storm.", choices:["We aren't going to travel in this storm.","We aren't go to travel in this storm.","We don't going to travel in this storm."] },

  // ===================== GRAMMAR 2: zero conditional =====================
  { cover:"g2-form", tier:3, type:"grammar", open:false, clue:"Choose the correct zero conditional sentence:",
    answer:"If I see lightning, I go inside.", choices:["If I see lightning, I go inside.","If I saw lightning, I go inside.","If I will see lightning, I go inside."] },
  { cover:"g2-form", tier:3, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"I put on my coat if the weather is cold.", choices:["I put on my coat if the weather is cold.","I put on my coat if the weather was cold.","I will put on my coat if the weather is cold."] },

  { cover:"g2-verb", tier:3, type:"grammar", open:true, clue:"Complete it: 'If a sandstorm ___, I close all the windows.'",
    answer:"comes", choices:["comes","come","will come"] },
  { cover:"g2-verb", tier:3, type:"grammar", open:true, clue:"Complete it: 'If the temperature ___ below zero, water freezes.'",
    answer:"drops", choices:["drops","drop","will drop"] },

  { cover:"g2-meaning", tier:3, type:"grammar", open:false, clue:"Which sentence describes something that is ALWAYS true?",
    answer:"If you heat ice, it melts.", choices:["If you heat ice, it melts.","If you heat ice, it melted.","If you heated ice, it will melt."] },
  { cover:"g2-meaning", tier:3, type:"grammar", open:true, clue:"Complete it: 'If the sirens ___, everyone goes to the shelter.'",
    answer:"sound", choices:["sound","sounded","will sound"] },
];


// ---------------------------------------------------------------------------
// TIER 4 - THE ELITE BANK
//
// Everything above tests whether a student can recognise the language. These
// test whether they can USE it: correct a mistake, reason in two steps, turn
// one form into another, or work out which word a situation calls for.
//
// Only Elites and the Boss draw from this bank, so a normal Fight room stays
// within reach of the whole class while an Elite is a genuine step up. A wrong
// answer here costs 2 hearts and a right one pays the most shards in the game.
// ---------------------------------------------------------------------------
const REALM1_ELITE_QUESTIONS = [
  // ---------------- correct the mistake ----------------
  { cover:"g2-form", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'If it will rain tomorrow, we stay inside.'",
    answer:"'will rain' should be 'rains'", choices:["'will rain' should be 'rains'","'stay' should be 'will stay'","'If' should be 'When'"] },

  { cover:"g1-negative", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'They aren't go to check the shelter.'",
    answer:"'go' should be 'going'", choices:["'go' should be 'going'","'aren't' should be 'don't'","'check' should be 'checking'"] },

  { cover:"g2-verb", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'If the temperature drop below zero, water freezes.'",
    answer:"'drop' should be 'drops'", choices:["'drop' should be 'drops'","'freezes' should be 'freeze'","'If' should be 'Because'"] },

  { cover:"g1-question", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'Is they going to warn the town?'",
    answer:"'Is' should be 'Are'", choices:["'Is' should be 'Are'","'going' should be 'go'","'warn' should be 'warning'"] },

  { cover:"g1-statement", tier:4, type:"fix it", open:true, clue:"One word is missing: 'We ___ going to pack supplies tonight.'",
    answer:"are", choices:["are","will","do"] },

  // ---------------- two-step reasoning ----------------
  { cover:"ice storm", tier:4, type:"reason", open:true, clue:"It rains all evening, then the temperature falls below zero overnight. What will cover the roads by morning?",
    answer:"a layer of ice", choices:["a layer of ice","deep sand","thick smoke"] },

  { cover:"flood", tier:4, type:"reason", open:true, clue:"Four days of heavy rain, and then the river bursts its banks into the town. What is the town facing?",
    answer:"a flood", choices:["a flood","a drought","a heat wave"] },

  { cover:"drought", tier:4, type:"reason", open:true, clue:"No rain has fallen for three months and the crops have died in the fields. What is the farmer facing?",
    answer:"a drought", choices:["a drought","a blizzard","a flood"] },

  { cover:"range", tier:4, type:"reason", open:true, clue:"The coldest hour today was 12 degrees and the warmest was 30. What was the temperature range?",
    answer:"18 degrees", choices:["18 degrees","30 degrees","42 degrees"] },

  { cover:"drop", tier:4, type:"reason", open:true, clue:"At six o'clock it was 4 degrees. By midnight it was minus two. What did the temperature do?",
    answer:"it dropped", choices:["it dropped","it rose","it stayed the same"] },

  { cover:"rise", tier:4, type:"reason", open:true, clue:"At dawn it was 22 degrees. By noon it was 38. What did the temperature do?",
    answer:"it rose", choices:["it rose","it dropped","it froze"] },

  { cover:"speed", tier:4, type:"reason", open:true, clue:"An instrument measures how fast the air is moving past it. What is it measuring?",
    answer:"wind speed", choices:["wind speed","the temperature range","the rainfall"] },

  { cover:"shelter", tier:4, type:"reason", open:true, clue:"The sirens sound and a funnel cloud is coming. Where should the family go FIRST?",
    answer:"to the storm shelter", choices:["to the storm shelter","up onto the roof","out to the car"] },

  // ---------------- odd one out ----------------
  { cover:"heat wave", tier:4, type:"apply", open:false, clue:"Which of these would NOT happen during a heat wave?",
    answer:"the roads freeze over", choices:["the roads freeze over","people stay indoors","the city opens cool rooms"] },

  { cover:"blizzard", tier:4, type:"apply", open:false, clue:"Which of these would you NOT need in a blizzard?",
    answer:"a sun hat", choices:["a sun hat","a warm coat","a flashlight"] },

  { cover:"supplies", tier:4, type:"apply", open:false, clue:"Which of these is NOT emergency supplies?",
    answer:"a birthday cake", choices:["a birthday cake","bottled water","spare batteries"] },

  { cover:"emergency", tier:4, type:"apply", open:false, clue:"Which of these is NOT an emergency?",
    answer:"choosing what to wear", choices:["choosing what to wear","a fire in the kitchen","a flood in the street"] },

  { cover:"instruments", tier:4, type:"apply", open:false, clue:"Which one does NOT measure the weather?",
    answer:"a compass", choices:["a compass","a thermometer","a wind gauge"] },

  // ---------------- transformation ----------------
  { cover:"g1-statement", tier:4, type:"apply", open:true, clue:"Say this as a plan for the future: 'We check the shelter.'",
    answer:"We are going to check the shelter.", choices:["We are going to check the shelter.","We checked the shelter.","We are checking the shelter now."] },

  { cover:"g1-question", tier:4, type:"apply", open:true, clue:"Turn this into a question: 'They are going to warn the town.'",
    answer:"Are they going to warn the town?", choices:["Are they going to warn the town?","Do they going to warn the town?","They are going to warn the town?"] },

  { cover:"g1-negative", tier:4, type:"apply", open:true, clue:"Make this negative: 'It is going to snow tonight.'",
    answer:"It isn't going to snow tonight.", choices:["It isn't going to snow tonight.","It doesn't going to snow tonight.","It is going to not snow tonight."] },

  { cover:"g2-meaning", tier:4, type:"apply", open:false, clue:"Which sentence means the same as 'Ice melts whenever you heat it'?",
    answer:"If you heat ice, it melts.", choices:["If you heat ice, it melts.","If you heated ice, it melted.","If you will heat ice, it will melt."] },

  // ---------------- inference from a scene ----------------
  { cover:"tornado", tier:4, type:"reason", open:true, clue:"The sky turned green, the wind fell silent, and a dark spinning column dropped from the cloud toward the fields. What did they see?",
    answer:"a tornado", choices:["a tornado","a heat wave","an ice storm"] },

  { cover:"hurricane", tier:4, type:"reason", open:true, clue:"The wind screamed for hours, then everything went calm and the sun came out — twenty minutes later the wind returned from the opposite direction. What passed over them?",
    answer:"the eye of a hurricane", choices:["the eye of a hurricane","a sandstorm","a drought"] },

  { cover:"sandstorm", tier:4, type:"reason", open:true, clue:"Ali could not see the end of his street, grit stung his eyes, and he shut every window in the house. What was happening outside?",
    answer:"a sandstorm", choices:["a sandstorm","a flood","a blizzard"] },

  { cover:"twisted", tier:4, type:"reason", open:true, clue:"After the storm, the metal gate was found bent round into a spiral. Which word describes the gate?",
    answer:"twisted", choices:["twisted","warned","dropped"] },

  { cover:"funnel", tier:4, type:"reason", open:true, clue:"A cloud reached down toward the ground, wide at the top and narrow at the bottom. What shape was it?",
    answer:"a funnel", choices:["a funnel","a range","a shelter"] },

  { cover:"flashlight", tier:4, type:"reason", open:true, clue:"The power is out, the phone battery is dead, and the stairs are pitch dark. Which item from the kit helps most?",
    answer:"a flashlight", choices:["a flashlight","a thermometer","a map"] },

  { cover:"thunder", tier:4, type:"reason", open:true, clue:"You see the flash first and hear the noise several seconds later. Why does the sound arrive after the light?",
    answer:"sound travels more slowly than light", choices:["sound travels more slowly than light","the thunder happens afterwards","the lightning is much closer"] },

  // ---------------- word work ----------------
  { cover:"warn", tier:4, type:"apply", open:true, clue:"'Warn' is the verb. What do you call the message that does the warning?",
    answer:"a warning", choices:["a warning","a warner","a warned"] },

  { cover:"plan", tier:4, type:"apply", open:true, clue:"In the sentence 'We plan to leave early', the word 'plan' is being used as a...",
    answer:"verb", choices:["verb","noun","adjective"] },

  { cover:"phonics-theta", tier:4, type:"phonics", open:false, clue:"Which pair BOTH use the breathy /θ/ sound?",
    answer:"thunder and thirsty", choices:["thunder and thirsty","these and those","weather and mother"] },

  { cover:"phonics-eth", tier:4, type:"phonics", open:false, clue:"Which pair BOTH use the buzzy /ð/ sound?",
    answer:"weather and those", choices:["weather and those","thanks and think","birthday and thermometer"] },

  { cover:"lightning", tier:4, type:"reason", open:true, clue:"Why is standing under the tallest tree in an open field dangerous in a storm?",
    answer:"lightning strikes the tallest thing nearby", choices:["lightning strikes the tallest thing nearby","the tree blocks the warning sirens","trees make thunder louder"] },

  { cover:"tropical storm", tier:4, type:"reason", open:true, clue:"A storm forms over warm ocean water, grows as it crosses the sea, and weakens once it reaches land. Which storm is it?",
    answer:"a tropical storm", choices:["a tropical storm","a sandstorm","a heat wave"] },

  // ---- open-response grammar, written so Commit has something to offer ----
  // Selection questions ("Choose the correct sentence") can't be answered with
  // the options hidden, so the hardest tier needed items that can.
  { cover:"g1-statement", tier:3, type:"grammar", open:true, clue:"Complete it as a plan for tonight: 'We ___ pack the emergency supplies.'",
    answer:"are going to", choices:["are going to","is going to","was going to"] },

  { cover:"g1-question", tier:3, type:"grammar", open:true, clue:"Complete the question: '___ they going to warn the town?'",
    answer:"Are", choices:["Are","Is","Do"] },

  { cover:"g1-negative", tier:3, type:"grammar", open:true, clue:"Complete it so it means NO: 'We ___ going to travel in this storm.'",
    answer:"aren't", choices:["aren't","don't","isn't"] },

  { cover:"g2-form", tier:3, type:"grammar", open:true, clue:"Complete it: 'If you ___ ice, it melts.'",
    answer:"heat", choices:["heat","heated","will heat"] },

  { cover:"g2-verb", tier:3, type:"grammar", open:true, clue:"Complete it: 'If the wind ___ stronger, we close the shutters.'",
    answer:"gets", choices:["gets","get","will get"] },

  { cover:"g2-meaning", tier:3, type:"grammar", open:true, clue:"Complete it with something always true: 'If you drop a stone in water, it ___.'",
    answer:"sinks", choices:["sinks","sank","will sink"] },

  { cover:"phonics-theta", tier:3, type:"phonics", open:true, clue:"Say the weather word that means the loud rumble after lightning. It starts with the breathy /\u03b8/ sound.",
    answer:"thunder", choices:["thunder","weather","those"] },

  { cover:"phonics-eth", tier:3, type:"phonics", open:true, clue:"Say the word for what the sky is doing today. It uses the buzzy /\u00f0/ sound in the middle.",
    answer:"weather", choices:["weather","thunder","thermometer"] },
];

// distinct curriculum items this realm must cover before it can be cleared
const REALM1_COVER_KEYS = [...new Set(REALM1_QUESTIONS.map(q => q.cover))];

// Both banks answer to a cover key. The boss prefers the harder version when
// one exists, so the finale tests understanding rather than recall - without
// changing which curriculum items it sweeps.
function questionsForCover(cover, preferElite = false) {
  const basic = REALM1_QUESTIONS.filter(q => q.cover === cover);
  const elite = REALM1_ELITE_QUESTIONS.filter(q => q.cover === cover);
  if (preferElite && elite.length) return elite;
  return basic;
}

// ---------------------------------------------------------------------------
// Realm registry. Realm 1 fully built; 2-9 are locked placeholders showing
// the theme/name pulled from the school's syllabus.
// ---------------------------------------------------------------------------
// ---------------------------------------------------------------------------
// MONSTER ROSTER (Realm 1)
//
// `attacks` are the moves a monster can use; the game shows the chosen move
// as an INTENT above its head before it lands, so danger is always telegraphed.
//   kind: hit | heavy | flurry | drain | charge | guard | regen
//
// v5.1: cadence went back to 3. Fights are 4.6 questions now rather than 2.3,
// so a monster on a 3-turn clock still acts about 1.5 times per fight - and
// slowing it is what let wrong answers become the main threat instead of the
// timer. Their damage numbers are untouched, because the telegraph must not lie.
// `special` is a debuff it can apply. Specials NEVER hide the correct answer -
// they change stakes or progress instead, so a student is never punished for
// knowing the word.
//   chill  = your next correct answer deals no damage
//   expose = your next wrong answer costs 2 hearts instead of 1
//   freeze = your next turn becomes a forced Brace (defend, then it thaws)
// ---------------------------------------------------------------------------
const REALM1_MONSTERS = [
  { id:"wyrm",    name:"Thunderclap Wyrm",  sprite:"assets/sprites/wyrm.png",
    voice:"growl", pitch:104, size:0.72,
    taunt:"A Thunderclap Wyrm rolls out of the clouds!",
    attacks:[{kind:"hit",dmg:1},{kind:"drain",dmg:1,shards:6}], special:null, cadence:3 },

  { id:"wisp",    name:"Blizzard Wisp",     sprite:"assets/sprites/wisp.png",
    voice:"glass", pitch:246, size:0.28,
    taunt:"A Blizzard Wisp drifts into your path!",
    attacks:[{kind:"hit",dmg:1},{kind:"flurry",dmg:1,hits:2}], special:"chill", cadence:3 },

  { id:"djinn",   name:"Sandstorm Djinn",   sprite:"assets/sprites/djinn.png",
    voice:"whoosh", pitch:165, size:0.55,
    taunt:"A Sandstorm Djinn whirls up from the dust!",
    attacks:[{kind:"hit",dmg:1},{kind:"drain",dmg:1,shards:8}], special:"expose", cadence:3 },

  { id:"funnel",  name:"Funnel Sprite",     sprite:"assets/sprites/funnel.png",
    voice:"shriek", pitch:330, size:0.34,
    taunt:"A Funnel Sprite spins in, cackling!",
    attacks:[{kind:"hit",dmg:1},{kind:"flurry",dmg:1,hits:2}], special:null, cadence:3 },

  { id:"brute",   name:"Hailstone Brute",   sprite:"assets/sprites/brute.png",
    voice:"crunch", pitch:116, size:0.70,
    taunt:"A Hailstone Brute blocks the corridor!",
    attacks:[{kind:"heavy",dmg:2},{kind:"guard"}], special:null, cadence:3 },

  { id:"fang",    name:"Frost Fang",        sprite:"assets/sprites/fang.png",
    voice:"glass", pitch:196, size:0.40,
    taunt:"A Frost Fang bares its teeth!",
    attacks:[{kind:"hit",dmg:1},{kind:"heavy",dmg:2}], special:"freeze", cadence:3 },

  { id:"serpent", name:"Flood Serpent",     sprite:"assets/sprites/serpent.png",
    voice:"gurgle", pitch:147, size:0.58,
    taunt:"A Flood Serpent surges out of the water!",
    attacks:[{kind:"hit",dmg:1},{kind:"regen"}], special:null, cadence:3 },

  { id:"husk",    name:"Drought Husk",      sprite:"assets/sprites/husk.png",
    voice:"rasp", pitch:131, size:0.48,
    taunt:"A Drought Husk drags itself upright!",
    attacks:[{kind:"hit",dmg:1},{kind:"drain",dmg:0,shards:10}], special:"expose", cadence:3 },

  { id:"shimmer", name:"Heatwave Shimmer",  sprite:"assets/sprites/shimmer.png",
    voice:"wail", pitch:262, size:0.36,
    taunt:"A Heatwave Shimmer burns the air ahead!",
    attacks:[{kind:"hit",dmg:1},{kind:"charge",dmg:3,turns:2}], special:null, cadence:3 },

  { id:"crow",    name:"Tempest Crow",      sprite:"assets/sprites/crow.png",
    voice:"shriek", pitch:392, size:0.30,
    taunt:"A Tempest Crow shrieks down from the rafters!",
    attacks:[{kind:"flurry",dmg:1,hits:2},{kind:"hit",dmg:1}], special:null, cadence:3 },

  { id:"herald",  name:"Ice Storm Herald",  sprite:"assets/sprites/herald.png",
    voice:"bell", pitch:175, size:0.62,
    taunt:"An Ice Storm Herald raises its frozen blade!",
    attacks:[{kind:"heavy",dmg:2},{kind:"guard"}], special:"chill", cadence:3 },

  { id:"siren",   name:"Siren of the Gale", sprite:"assets/sprites/siren.png",
    voice:"wail", pitch:294, size:0.44,
    taunt:"The Siren of the Gale begins to shriek!",
    attacks:[{kind:"hit",dmg:1},{kind:"charge",dmg:3,turns:2}], special:"freeze", cadence:3 },
];

const REALM1_ELITES = [
  { id:"warden",     name:"Tempest Warden",   sprite:"assets/sprites/warden.png",
    voice:"growl", pitch:92, size:0.86,
    taunt:"The Tempest Warden bars the way. This will be a long fight!",
    attacks:[{kind:"heavy",dmg:2},{kind:"guard"},{kind:"charge",dmg:3,turns:2}],
    special:"expose", cadence:3 },

  { id:"colossus",   name:"Thunder Colossus", sprite:"assets/sprites/colossus.png",
    voice:"crunch", pitch:87, size:0.92,
    taunt:"A Thunder Colossus stomps forward. Stand ready!",
    attacks:[{kind:"heavy",dmg:2},{kind:"flurry",dmg:1,hits:3}],
    special:null, cadence:3 },

  { id:"eyewalker",  name:"The Eye-Walker",   sprite:"assets/sprites/eyewalker.png",
    voice:"whoosh", pitch:139, size:0.80,
    taunt:"The Eye-Walker drifts from the calm. It is far too quiet.",
    attacks:[{kind:"drain",dmg:1,shards:14},{kind:"regen"},{kind:"heavy",dmg:2}],
    special:"freeze", cadence:3 },

  { id:"permafrost", name:"Permafrost Titan", sprite:"assets/sprites/permafrost.png",
    voice:"crunch", pitch:78, size:0.94,
    taunt:"The Permafrost Titan cracks the floor with every step!",
    attacks:[{kind:"heavy",dmg:2},{kind:"charge",dmg:4,turns:2},{kind:"guard"}],
    special:"chill", cadence:3 },
];

// Tinted variants multiply the roster without needing more art. A variant
// keeps the base sprite but is recoloured, renamed, and acts more often.
const MONSTER_VARIANTS = [
  { id:"frenzied", prefix:"Frenzied", hue:-40, sat:1.5, cadenceBonus:-1, hpBonus:0,  shardBonus:3 },
  { id:"ancient",  prefix:"Ancient",  hue:40,  sat:0.7, cadenceBonus:0,  hpBonus:1,  shardBonus:5 },
  { id:"lesser",   prefix:"Lesser",   hue:15,  sat:0.5, cadenceBonus:1,  hpBonus:-1, shardBonus:-1 },
];

// ---------------------------------------------------------------------------
// REALM 2 — THE WILDLANDS
// Our World 5, Unit 2: "Copycat Animals" (Science)
//
// Unit outcomes this realm is built to review:
//   * describe animals
//   * compare different animals
//   * talk about how animals imitate others
//   * use classification writing
//
// Vocabulary set 1 (strategy: using a dictionary):
//   camouflage, characteristic, copy, frighten, hide, hunt, imitate, insect,
//   poisonous, predator, prey, resemble, species, spot, stripe
// Vocabulary set 2 (strategy: action verbs):
//   attack, avoid, confuse, defend, escape
// Grammar: comparisons with as ... as  ·  tag questions
// Reading strategy: scan text for information
//
// EVERY question here is original. The unit's aims and word list decide WHAT is
// tested; none of the book's own sentences, exercises or texts are reproduced.
// ---------------------------------------------------------------------------

const REALM2_QUESTIONS = [
  // ===================== VOCABULARY 1: describing & hiding =================
  { cover:"camouflage", tier:1, type:"vocab", open:true, clue:"Colours or patterns on an animal that make it very hard to see against its background.",
    answer:"camouflage", choices:["camouflage","a characteristic","a species"] },
  { cover:"camouflage", tier:2, type:"vocab", open:true, clue:"Complete it: 'The moth's ___ is so good that it looks exactly like a dead leaf.'",
    answer:"camouflage", choices:["camouflage","stripe","prey"] },

  { cover:"characteristic", tier:1, type:"vocab", open:true, clue:"A feature or quality that an animal has, which helps you tell what it is.",
    answer:"a characteristic", choices:["a characteristic","a predator","camouflage"] },
  { cover:"characteristic", tier:3, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"A long neck is one characteristic of a giraffe.",
    choices:["A long neck is one characteristic of a giraffe.","A long neck is one characteristic for a giraffe.","A long neck is one characteristic to a giraffe."] },

  { cover:"copy", tier:1, type:"vocab", open:true, clue:"To do exactly the same thing as somebody or something else.",
    answer:"copy", choices:["copy","hunt","escape"] },
  { cover:"copy", tier:2, type:"vocab", open:true, clue:"Complete it: 'Baby birds learn their song by ___ing the adults around them.'",
    answer:"copy", choices:["copy","frighten","defend"] },

  { cover:"frighten", tier:1, type:"vocab", open:true, clue:"To make another creature feel afraid.",
    answer:"frighten", choices:["frighten","resemble","avoid"] },
  { cover:"frighten", tier:2, type:"vocab", open:true, clue:"Complete it: 'The caterpillar shows two huge fake eyes to ___ birds away.'",
    answer:"frighten", choices:["frighten","imitate","hide"] },

  { cover:"hide", tier:1, type:"vocab", open:true, clue:"To go somewhere you cannot be seen, or to put something where nobody will find it.",
    answer:"hide", choices:["hide","hunt","attack"] },
  { cover:"hide", tier:2, type:"vocab", open:true, clue:"Complete it: 'When the eagle appears, the small lizards ___ under the rocks.'",
    answer:"hide", choices:["hide","copy","confuse"] },

  { cover:"hunt", tier:1, type:"vocab", open:true, clue:"To chase and catch other animals for food.",
    answer:"hunt", choices:["hunt","hide","resemble"] },
  { cover:"hunt", tier:2, type:"vocab", open:true, clue:"Complete it: 'Owls ___ at night, when their prey cannot see them coming.'",
    answer:"hunt", choices:["hunt","escape","imitate"] },

  { cover:"imitate", tier:1, type:"vocab", open:true, clue:"To copy the way something else looks, sounds or behaves.",
    answer:"imitate", choices:["imitate","frighten","defend"] },
  { cover:"imitate", tier:2, type:"vocab", open:true, clue:"Complete it: 'Some harmless snakes ___ the bright colours of poisonous ones.'",
    answer:"imitate", choices:["imitate","avoid","hunt"] },
  { cover:"imitate", tier:3, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"The bird imitates the sound of a car alarm.",
    choices:["The bird imitates the sound of a car alarm.","The bird imitates to the sound of a car alarm.","The bird imitate the sound of a car alarm."] },

  { cover:"insect", tier:1, type:"vocab", open:true, clue:"A small creature with six legs and usually two pairs of wings.",
    answer:"an insect", choices:["an insect","a species","a predator"] },
  { cover:"insect", tier:2, type:"vocab", open:true, clue:"Complete it: 'A beetle is an ___, but a spider is not one.'",
    answer:"insect", choices:["insect","prey","imitate"] },

  { cover:"poisonous", tier:1, type:"vocab", open:true, clue:"Describes an animal or plant that can make you very ill if you touch or eat it.",
    answer:"poisonous", choices:["poisonous","striped","spotted"] },
  { cover:"poisonous", tier:2, type:"vocab", open:true, clue:"Complete it: 'Bright colours often warn other animals that a frog is ___.'",
    answer:"poisonous", choices:["poisonous","hidden","gentle"] },

  { cover:"predator", tier:1, type:"vocab", open:true, clue:"An animal that hunts and eats other animals.",
    answer:"a predator", choices:["a predator","prey","an insect"] },
  { cover:"predator", tier:2, type:"vocab", open:true, clue:"Complete it: 'A tiger is a ___, and a deer is usually its prey.'",
    answer:"predator", choices:["predator","species","characteristic"] },

  { cover:"prey", tier:1, type:"vocab", open:true, clue:"An animal that is hunted and eaten by another animal.",
    answer:"prey", choices:["prey","a predator","a species"] },
  { cover:"prey", tier:2, type:"vocab", open:true, clue:"Complete it: 'The rabbit is ___ for foxes, owls and eagles.'",
    answer:"prey", choices:["prey","a predator","camouflage"] },

  { cover:"resemble", tier:1, type:"vocab", open:true, clue:"To look like something else.",
    answer:"resemble", choices:["resemble","frighten","escape"] },
  { cover:"resemble", tier:2, type:"vocab", open:true, clue:"Complete it: 'The stick insect's body ___s a thin brown twig.'",
    answer:"resemble", choices:["resemble","attack","avoid"] },
  { cover:"resemble", tier:3, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"This caterpillar resembles a small green snake.",
    choices:["This caterpillar resembles a small green snake.","This caterpillar resembles to a small green snake.","This caterpillar resembles like a small green snake."] },

  { cover:"species", tier:1, type:"vocab", open:true, clue:"A group of animals or plants of the same kind that can have young together.",
    answer:"a species", choices:["a species","a characteristic","a predator"] },
  { cover:"species", tier:2, type:"vocab", open:true, clue:"Complete it: 'Scientists have found more than one ___ of butterfly in this forest.'",
    answer:"species", choices:["species","stripe","insect"] },

  { cover:"spot", tier:1, type:"vocab", open:true, clue:"A small round mark of a different colour on an animal's skin or fur.",
    answer:"a spot", choices:["a spot","a stripe","a species"] },
  { cover:"spot", tier:2, type:"vocab", open:true, clue:"Complete it: 'A leopard has ___s, and a zebra has stripes.'",
    answer:"spot", choices:["spot","stripe","prey"] },

  { cover:"stripe", tier:1, type:"vocab", open:true, clue:"A long band of colour, like the black lines on a zebra.",
    answer:"a stripe", choices:["a stripe","a spot","a characteristic"] },
  { cover:"stripe", tier:2, type:"vocab", open:true, clue:"Complete it: 'The tiger's orange and black ___s help it hide in long grass.'",
    answer:"stripe", choices:["stripe","spot","species"] },

  // ===================== VOCABULARY 2: action verbs ========================
  { cover:"attack", tier:1, type:"vocab", open:true, clue:"To start fighting or trying to hurt something.",
    answer:"attack", choices:["attack","defend","avoid"] },
  { cover:"attack", tier:2, type:"vocab", open:true, clue:"Complete it: 'Most snakes will only ___ if they feel trapped.'",
    answer:"attack", choices:["attack","escape","resemble"] },

  { cover:"avoid", tier:1, type:"vocab", open:true, clue:"To stay away from something, or to keep something from happening.",
    answer:"avoid", choices:["avoid","attack","hunt"] },
  { cover:"avoid", tier:2, type:"vocab", open:true, clue:"Complete it: 'Birds learn to ___ this butterfly because it tastes terrible.'",
    answer:"avoid", choices:["avoid","imitate","frighten"] },

  { cover:"confuse", tier:1, type:"vocab", open:true, clue:"To make somebody unable to think clearly or understand what is happening.",
    answer:"confuse", choices:["confuse","defend","hide"] },
  { cover:"confuse", tier:2, type:"vocab", open:true, clue:"Complete it: 'A zebra herd runs together to ___ the lion chasing them.'",
    answer:"confuse", choices:["confuse","copy","hunt"] },

  { cover:"defend", tier:1, type:"vocab", open:true, clue:"To protect somebody or something from attack.",
    answer:"defend", choices:["defend","attack","escape"] },
  { cover:"defend", tier:2, type:"vocab", open:true, clue:"Complete it: 'The mother elephant will ___ her calf against anything.'",
    answer:"defend", choices:["defend","avoid","imitate"] },

  { cover:"escape", tier:1, type:"vocab", open:true, clue:"To get away from a place or a dangerous situation.",
    answer:"escape", choices:["escape","attack","resemble"] },
  { cover:"escape", tier:2, type:"vocab", open:true, clue:"Complete it: 'The lizard drops its tail so it can ___ from the bird.'",
    answer:"escape", choices:["escape","defend","confuse"] },
];

// --- grammar, skills and functions, same bank ---
const REALM2_GRAMMAR = [
  // ===================== GRAMMAR: comparisons with as ... as ================
  // The structure is as + adjective + as. The commonest Grade 5 errors are
  // dropping the second `as`, using `so` for the first one, and reaching for a
  // comparative form (`as bigger as`), so the distractors are exactly those.
  { cover:"as_as_equal", tier:2, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"This moth is as small as your thumbnail.",
    choices:["This moth is as small as your thumbnail.","This moth is as smaller as your thumbnail.","This moth is as small than your thumbnail."] },
  { cover:"as_as_equal", tier:2, type:"grammar", open:true, clue:"Finish it with as ... as: 'A cheetah is ___ ___ ___ a racing car over short distances.'",
    answer:"as fast as", choices:["as fast as","as faster as","so fast as"] },
  { cover:"as_as_equal", tier:3, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"Her camouflage is as good as his.",
    choices:["Her camouflage is as good as his.","Her camouflage is as well as his.","Her camouflage is as good than his."] },

  { cover:"as_as_negative", tier:2, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"A rabbit is not as heavy as a deer.",
    choices:["A rabbit is not as heavy as a deer.","A rabbit is not as heavier as a deer.","A rabbit is not so heavy than a deer."] },
  { cover:"as_as_negative", tier:3, type:"grammar", open:true, clue:"Say it the other way round. 'A python is longer than a viper.' So a viper is NOT ___ ___ ___ a python.",
    answer:"as long as", choices:["as long as","as longer as","so longer as"] },

  { cover:"as_as_meaning", tier:2, type:"grammar", open:true, clue:"'The fake snake is as poisonous as the real one.' Is the fake one MORE poisonous, LESS poisonous, or THE SAME?",
    answer:"the same", choices:["the same","more poisonous","less poisonous"] },
  { cover:"as_as_meaning", tier:3, type:"grammar", open:true, clue:"'This beetle is not as fast as that one.' Which beetle is faster — this one or that one?",
    answer:"that one", choices:["that one","this one","they are the same"] },

  // ===================== GRAMMAR: tag questions =============================
  // The rule the unit teaches: positive statement takes a negative tag, and a
  // negative statement takes a positive tag. The auxiliary in the tag has to
  // match the verb in the statement.
  { cover:"tag_positive", tier:2, type:"grammar", open:true, clue:"Add the tag: 'That insect is poisonous, ___ ___?'",
    answer:"isn't it", choices:["isn't it","is it","doesn't it"] },
  { cover:"tag_positive", tier:2, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"Owls hunt at night, don't they?",
    choices:["Owls hunt at night, don't they?","Owls hunt at night, do they?","Owls hunt at night, aren't they?"] },
  { cover:"tag_positive", tier:3, type:"grammar", open:true, clue:"Add the tag: 'The stick insect resembles a twig, ___ ___?'",
    answer:"doesn't it", choices:["doesn't it","isn't it","don't it"] },

  { cover:"tag_negative", tier:2, type:"grammar", open:true, clue:"Add the tag: 'Zebras aren't predators, ___ ___?'",
    answer:"are they", choices:["are they","aren't they","do they"] },
  { cover:"tag_negative", tier:2, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"You didn't see the camouflage, did you?",
    choices:["You didn't see the camouflage, did you?","You didn't see the camouflage, didn't you?","You didn't see the camouflage, do you?"] },
  { cover:"tag_negative", tier:3, type:"grammar", open:true, clue:"Add the tag: 'These frogs can't escape, ___ ___?'",
    answer:"can they", choices:["can they","can't they","do they"] },

  { cover:"tag_rule", tier:3, type:"grammar", open:true, clue:"If the sentence is POSITIVE, is the tag question at the end positive or negative?",
    answer:"negative", choices:["negative","positive","either one"] },
  { cover:"tag_rule", tier:3, type:"grammar", open:false, clue:"Which one has the WRONG tag?",
    answer:"The leopard has spots, hasn't the leopard?",
    choices:["The leopard has spots, hasn't the leopard?","The leopard has spots, doesn't it?","The leopard doesn't have stripes, does it?"] },

  // ===================== SKILLS & FUNCTIONS ================================
  { cover:"describe_animals", tier:2, type:"function", open:true, clue:"You want to describe a tiger's markings. Which word do you need — spots or stripes?",
    answer:"stripes", choices:["stripes","spots","species"] },
  { cover:"describe_animals", tier:3, type:"function", open:false, clue:"Choose the best description of a ladybird:",
    answer:"It is a small red insect with black spots.",
    choices:["It is a small red insect with black spots.","It is a small red insect with black stripes.","It is a small red predator with black spots."] },

  { cover:"compare_animals", tier:2, type:"function", open:true, clue:"You want to say two animals are EQUALLY good at hiding. Which structure do you use?",
    answer:"as good as", choices:["as good as","better than","the best"] },
  { cover:"compare_animals", tier:3, type:"function", open:false, clue:"Choose the sentence that compares two animals correctly:",
    answer:"A gecko is as quiet as a moth.",
    choices:["A gecko is as quiet as a moth.","A gecko is as quieter as a moth.","A gecko is quiet as a moth than."] },

  { cover:"imitation_talk", tier:2, type:"function", open:true, clue:"A harmless fly has the same yellow and black bands as a wasp. Which verb describes what the fly is doing?",
    answer:"imitating", choices:["imitating","hunting","escaping"] },
  { cover:"imitation_talk", tier:3, type:"function", open:true, clue:"Why would a harmless animal copy a poisonous one? Because predators will ___ it.",
    answer:"avoid", choices:["avoid","attack","hunt"] },

  { cover:"classification", tier:2, type:"function", open:true, clue:"In classification writing you sort animals into ___ — groups of the same kind.",
    answer:"species", choices:["species","stripes","prey"] },
  { cover:"classification", tier:3, type:"function", open:false, clue:"Which sentence belongs in a classification text?",
    answer:"Insects can be divided into several groups.",
    choices:["Insects can be divided into several groups.","I really love looking at insects.","The insect ran away quickly yesterday."] },

  { cover:"dictionary_use", tier:2, type:"function", open:true, clue:"You look up a word and the dictionary says it is a NOUN. Is it a naming word, an action word, or a describing word?",
    answer:"a naming word", choices:["a naming word","an action word","a describing word"] },
  { cover:"dictionary_use", tier:3, type:"function", open:false, clue:"Which words would you find between 'camouflage' and 'copy' in a dictionary?",
    answer:"characteristic, confuse",
    choices:["characteristic, confuse","attack, avoid","predator, species"] },

  { cover:"scan_text", tier:2, type:"function", open:true, clue:"You need ONE fact from a long text and you do not want to read every word. What is that reading skill called?",
    answer:"scanning", choices:["scanning","copying","classifying"] },
  { cover:"scan_text", tier:3, type:"function", open:false, clue:"You are scanning a text to find how many species were counted. What should your eyes look for?",
    answer:"numbers", choices:["numbers","adjectives","the title"] },
];

// ---------------------------------------------------------------------------
// ELITE BANK — tier 4.
//
// These ask students to USE Unit 2's language rather than recognise it: apply
// a rule, choose between two words that are genuinely close in meaning, or
// reason about why an animal does what it does. Every cover key in the realm
// appears here, because the Boss's health IS the count of curriculum items the
// class has not yet faced, and it draws the hard version wherever one exists.
// ---------------------------------------------------------------------------

const REALM2_ELITE_QUESTIONS = [
  // ---- vocabulary used, not recognised ----
  { cover:"camouflage", tier:4, type:"vocab", open:true, clue:"An animal is brown and grey and sits still on tree bark all day. Give the ONE word for what it is using.",
    answer:"camouflage", choices:["camouflage","imitation","classification"] },
  { cover:"camouflage", tier:4, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"Its camouflage works best when it does not move.",
    choices:["Its camouflage works best when it does not move.","It's camouflage works best when it does not move.","Its camouflage work best when it does not move."] },

  { cover:"characteristic", tier:4, type:"function", open:true, clue:"Finish the classification sentence: 'One ___ of all insects is that they have six legs.'",
    answer:"characteristic", choices:["characteristic","species","camouflage"] },

  { cover:"copy", tier:4, type:"vocab", open:true, clue:"Which is closer in meaning to 'copy' — imitate, or invent?",
    answer:"imitate", choices:["imitate","invent","escape"] },

  { cover:"frighten", tier:4, type:"grammar", open:true, clue:"Put it in the past: 'The sudden noise ___ every bird out of the tree.'",
    answer:"frightened", choices:["frightened","frighten","frightens"] },

  { cover:"hide", tier:4, type:"function", open:true, clue:"A predator is close by. Does the prey animal hide, hunt, or attack?",
    answer:"hide", choices:["hide","hunt","attack"] },

  { cover:"hunt", tier:4, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"Wolves hunt in groups called packs.",
    choices:["Wolves hunt in groups called packs.","Wolves hunts in groups called packs.","Wolves are hunt in groups called packs."] },

  { cover:"imitate", tier:4, type:"function", open:true, clue:"A hoverfly has yellow and black bands but no sting. Which poisonous insect is it imitating?",
    answer:"a wasp", choices:["a wasp","a beetle","a moth"] },
  { cover:"imitate", tier:4, type:"vocab", open:true, clue:"Which word means to copy something so well that others are fooled by it?",
    answer:"imitate", choices:["imitate","resemble","confuse"] },

  { cover:"insect", tier:4, type:"function", open:true, clue:"A spider has eight legs. Using the unit's rule, is a spider an insect — yes or no?",
    answer:"no", choices:["no","yes","only sometimes"] },

  { cover:"poisonous", tier:4, type:"function", open:true, clue:"A frog is bright red and blue. What is that colouring most likely warning predators about?",
    answer:"it is poisonous", choices:["it is poisonous","it is fast","it is young"] },

  { cover:"predator", tier:4, type:"function", open:true, clue:"An eagle eats fish. In that sentence, which word describes the eagle — predator or prey?",
    answer:"predator", choices:["predator","prey","species"] },

  { cover:"prey", tier:4, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"The owl watched its prey from the branch.",
    choices:["The owl watched its prey from the branch.","The owl watched its prey's from the branch.","The owl watched it prey from the branch."] },

  { cover:"resemble", tier:4, type:"vocab", open:true, clue:"'Resemble' and 'imitate' are close. Which one means only to LOOK like something, without copying its behaviour?",
    answer:"resemble", choices:["resemble","imitate","confuse"] },

  { cover:"species", tier:4, type:"function", open:true, clue:"Two animals look different but can have young together. Are they the same species or different species?",
    answer:"the same species", choices:["the same species","different species","neither"] },

  { cover:"spot", tier:4, type:"function", open:true, clue:"Describe a leopard's markings in one word.",
    answer:"spots", choices:["spots","stripes","bands"] },

  { cover:"stripe", tier:4, type:"function", open:true, clue:"Why might a zebra's stripes help it survive in a running herd?",
    answer:"they confuse predators", choices:["they confuse predators","they frighten insects","they make it faster"] },

  // ---- action verbs, applied ----
  { cover:"attack", tier:4, type:"grammar", open:true, clue:"Put it in the past: 'The wasp ___ as soon as we touched the nest.'",
    answer:"attacked", choices:["attacked","attack","attacks"] },

  { cover:"avoid", tier:4, type:"function", open:true, clue:"Birds have learned this butterfly tastes terrible. What do they now do — avoid it, or attack it?",
    answer:"avoid it", choices:["avoid it","attack it","imitate it"] },

  { cover:"confuse", tier:4, type:"function", open:true, clue:"A squid releases a cloud of black ink. Which verb best describes the effect on the predator?",
    answer:"confuse", choices:["confuse","defend","resemble"] },

  { cover:"defend", tier:4, type:"vocab", open:true, clue:"Which pair are OPPOSITES — attack and defend, or attack and hunt?",
    answer:"attack and defend", choices:["attack and defend","attack and hunt","hide and escape"] },

  { cover:"escape", tier:4, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"The lizard escaped by dropping its tail.",
    choices:["The lizard escaped by dropping its tail.","The lizard escaped for dropping its tail.","The lizard escape by dropping its tail."] },

  // ---- as ... as, used ----
  { cover:"as_as_equal", tier:4, type:"grammar", open:true, clue:"Join them with as ... as: 'The moth is 4cm. The leaf is 4cm.' The moth is ___ ___ ___ the leaf.",
    answer:"as long as", choices:["as long as","as longer as","so long as"] },
  { cover:"as_as_equal", tier:4, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"This spider is as dangerous as it looks.",
    choices:["This spider is as dangerous as it looks.","This spider is as dangerous than it looks.","This spider is dangerous as it looks."] },

  { cover:"as_as_negative", tier:4, type:"grammar", open:true, clue:"Rewrite with 'not as ... as': 'The gecko is smaller than the iguana.' The gecko is not ___ ___ ___ the iguana.",
    answer:"as big as", choices:["as big as","as bigger as","as small as"] },
  { cover:"as_as_negative", tier:4, type:"grammar", open:false, clue:"Choose the correct sentence:",
    answer:"A moth is not as colourful as a butterfly.",
    choices:["A moth is not as colourful as a butterfly.","A moth is not as more colourful as a butterfly.","A moth is not so colourful than a butterfly."] },

  { cover:"as_as_meaning", tier:4, type:"function", open:true, clue:"'The copy is not as poisonous as the original.' Which one is MORE dangerous?",
    answer:"the original", choices:["the original","the copy","they are equal"] },
  { cover:"as_as_meaning", tier:4, type:"function", open:true, clue:"'This lizard is as still as a stone.' Is the lizard moving a lot, a little, or not at all?",
    answer:"not at all", choices:["not at all","a little","a lot"] },

  // ---- tag questions, used ----
  { cover:"tag_positive", tier:4, type:"grammar", open:true, clue:"Add the tag: 'Those beetles imitate ants, ___ ___?'",
    answer:"don't they", choices:["don't they","do they","aren't they"] },
  { cover:"tag_positive", tier:4, type:"grammar", open:true, clue:"Add the tag: 'She has seen the camouflage, ___ ___?'",
    answer:"hasn't she", choices:["hasn't she","doesn't she","isn't she"] },

  { cover:"tag_negative", tier:4, type:"grammar", open:true, clue:"Add the tag: 'The insect didn't escape, ___ ___?'",
    answer:"did it", choices:["did it","didn't it","does it"] },
  { cover:"tag_negative", tier:4, type:"grammar", open:true, clue:"Add the tag: 'They weren't hunting, ___ ___?'",
    answer:"were they", choices:["were they","weren't they","did they"] },

  { cover:"tag_rule", tier:4, type:"grammar", open:false, clue:"Which sentence uses BOTH rules correctly?",
    answer:"It's poisonous, isn't it? And it isn't harmless, is it?",
    choices:["It's poisonous, isn't it? And it isn't harmless, is it?","It's poisonous, is it? And it isn't harmless, isn't it?","It's poisonous, doesn't it? And it isn't harmless, do it?"] },
  { cover:"tag_rule", tier:4, type:"grammar", open:true, clue:"The statement uses CAN'T. Which word must the tag use?",
    answer:"can", choices:["can","can't","do"] },

  // ---- skills, applied ----
  { cover:"describe_animals", tier:4, type:"function", open:false, clue:"Choose the most complete description:",
    answer:"It is a large striped predator that hunts alone.",
    choices:["It is a large striped predator that hunts alone.","It is a large animal.","It is striped."] },

  { cover:"compare_animals", tier:4, type:"function", open:true, clue:"Compare them in one structure: a chameleon and an octopus are equally good at changing colour. A chameleon is ___ ___ ___ an octopus at hiding.",
    answer:"as good as", choices:["as good as","better than","as better as"] },

  { cover:"imitation_talk", tier:4, type:"function", open:true, clue:"A moth's wings have two huge circles that look like owl eyes. What is the moth trying to do to birds?",
    answer:"frighten them", choices:["frighten them","attract them","imitate their song"] },
  { cover:"imitation_talk", tier:4, type:"function", open:true, clue:"Which is the better description of a harmless snake with a poisonous snake's colours — it resembles it, or it hunts it?",
    answer:"it resembles it", choices:["it resembles it","it hunts it","it defends it"] },

  { cover:"classification", tier:4, type:"function", open:false, clue:"Which opening belongs in a classification text about insects?",
    answer:"There are three main groups of insect in this habitat.",
    choices:["There are three main groups of insect in this habitat.","Yesterday I caught a beautiful insect.","Insects are the best animals in the world."] },
  { cover:"classification", tier:4, type:"function", open:true, clue:"Classification writing puts things into groups. Which unit word means one of those groups?",
    answer:"species", choices:["species","characteristic","camouflage"] },

  { cover:"dictionary_use", tier:4, type:"function", open:true, clue:"Your dictionary shows 'poisonous (adj)'. Which unit word would come immediately BEFORE it alphabetically — predator or prey?",
    answer:"predator", choices:["predator","prey","resemble"] },
  { cover:"dictionary_use", tier:4, type:"function", open:false, clue:"Which list is in correct dictionary order?",
    answer:"attack, avoid, confuse, defend, escape",
    choices:["attack, avoid, confuse, defend, escape","avoid, attack, defend, confuse, escape","escape, defend, confuse, avoid, attack"] },

  { cover:"scan_text", tier:4, type:"function", open:true, clue:"The question asks WHERE the species lives. When you scan, what kind of word are you hunting for?",
    answer:"a place name", choices:["a place name","a number","a verb"] },
];


// ---------------------------------------------------------------------------
// THE CAST
//
// Every creature here is a camouflage strategy, so the monsters ARE the
// vocabulary. A Stick Moth resembles a twig; a Mimic Jay imitates; the Hollow
// Fox is barely there at all. Mechanically they lean on GUARD and CHARGE far
// more than Realm 1's storm cast, which was built on flurries and drains -
// the Stormlands hit you, the Wildlands wait for you.
// ---------------------------------------------------------------------------
// ART. The Wildlands cast lives in assets/sprites/realm2/ rather than beside
// the Realm 1 sprites, and that is deliberate: the props pipeline builds its
// shared palette by globbing assets/sprites/*.png, so if Realm 2's forest
// greens sat in that glob then every realm built after this one would quietly
// inherit them. Each realm gets its own folder and its own palette extension.
const REALM2_MONSTERS = [
  { id:"stickmoth", name:"Stick Moth", sprite:"assets/sprites/realm2/stick_moth.png",
    voice:"glass", pitch:290, size:0.30,
    taunt:"What you took for a dead twig unfolds into wings!",
    attacks:[{kind:"hit",dmg:1},{kind:"guard"}], special:null, cadence:3 },

  { id:"leafback", name:"Leafback Toad", sprite:"assets/sprites/realm2/leafback_toad.png",
    voice:"growl", pitch:150, size:0.34,
    taunt:"A mound of leaves blinks, and croaks!",
    attacks:[{kind:"hit",dmg:1},{kind:"flurry",dmg:1,hits:2}], special:null, cadence:3 },

  { id:"bramblecat", name:"Bramble Cat", sprite:"assets/sprites/realm2/bramble_cat.png",
    voice:"shriek", pitch:300, size:0.42,
    taunt:"The thorn bush uncoils and shows its teeth!",
    attacks:[{kind:"hit",dmg:1},{kind:"heavy",dmg:2}], special:"expose", cadence:3 },

  { id:"mimicjay", name:"Mimic Jay", sprite:"assets/sprites/realm2/mimic_jay.png",
    voice:"shriek", pitch:340, size:0.30,
    taunt:"The Mimic Jay calls out in somebody else's voice!",
    attacks:[{kind:"hit",dmg:1},{kind:"drain",dmg:1,shards:5}], special:"confuse", cadence:3 },

  { id:"pebbleshell", name:"Pebbleshell Crab", sprite:"assets/sprites/realm2/pebbleshell_crab.png",
    voice:"glass", pitch:220, size:0.24,
    taunt:"One of the river stones is walking sideways!",
    attacks:[{kind:"guard"},{kind:"hit",dmg:1}], special:null, cadence:3 },

  { id:"driftstag", name:"Driftwood Stag", sprite:"assets/sprites/realm2/driftwood_stag.png",
    voice:"roar", pitch:110, size:0.62,
    taunt:"The fallen branches stand up on four legs!",
    attacks:[{kind:"heavy",dmg:2},{kind:"charge",dmg:3,turns:2}], special:null, cadence:3 },

  { id:"glasslizard", name:"Glass Lizard", sprite:"assets/sprites/realm2/glass_lizard.png",
    voice:"whoosh", pitch:260, size:0.28,
    taunt:"You can see the forest straight through it!",
    attacks:[{kind:"hit",dmg:1},{kind:"guard"}], special:"chill", cadence:3 },

  { id:"ashmoth", name:"Ashwing", sprite:"assets/sprites/realm2/ashwing.png",
    voice:"whoosh", pitch:200, size:0.36,
    taunt:"Ash lifts off the burnt bark on grey wings!",
    attacks:[{kind:"flurry",dmg:1,hits:2},{kind:"hit",dmg:1}], special:"expose", cadence:3 },

  { id:"burrower", name:"Sand Burrower", sprite:"assets/sprites/realm2/sand_burrower.png",
    voice:"growl", pitch:130, size:0.34,
    taunt:"The ground erupts and something eyeless rears up!",
    attacks:[{kind:"charge",dmg:3,turns:2},{kind:"hit",dmg:1}], special:null, cadence:3 },

  { id:"thornhog", name:"Thornhog", sprite:"assets/sprites/realm2/thornhog.png",
    voice:"growl", pitch:120, size:0.40,
    taunt:"A Thornhog lowers its splintered tusks!",
    attacks:[{kind:"heavy",dmg:2},{kind:"hit",dmg:1}], special:null, cadence:3 },

  { id:"hollowfox", name:"Hollow Fox", sprite:"assets/sprites/realm2/hollow_fox.png",
    voice:"whoosh", pitch:180, size:0.44,
    taunt:"Dead leaves swirl into the shape of a fox — and two pale eyes open!",
    attacks:[{kind:"hit",dmg:1},{kind:"drain",dmg:1,shards:7}], special:"confuse", cadence:3 },

  { id:"mossbear", name:"Moss Bear", sprite:"assets/sprites/realm2/moss_bear.png",
    voice:"roar", pitch:96, size:0.70,
    taunt:"The mossy boulder rises onto its hind legs. It is not a boulder.",
    attacks:[{kind:"heavy",dmg:2},{kind:"regen"}], special:null, cadence:3 },
];

const REALM2_ELITES = [
  { id:"canopy", name:"The Watcher in the Canopy", sprite:"assets/sprites/realm2/watcher.png",
    voice:"shriek", pitch:150, size:0.84,
    taunt:"Four amber eyes open in the bark above you. It has been watching a while.",
    attacks:[{kind:"heavy",dmg:2},{kind:"guard"},{kind:"charge",dmg:3,turns:2}],
    special:"expose", cadence:3 },

  { id:"patient", name:"The Patient One", sprite:"assets/sprites/realm2/patient_one.png",
    voice:"glass", pitch:170, size:0.82,
    taunt:"What you walked past twice unfolds its forelimbs. It was waiting.",
    attacks:[{kind:"guard"},{kind:"charge",dmg:4,turns:2},{kind:"hit",dmg:2}],
    special:"chill", cadence:3 },

  { id:"roottyrant", name:"Root Tyrant", sprite:"assets/sprites/realm2/root_tyrant.png",
    voice:"roar", pitch:88, size:0.92,
    taunt:"The forest floor stands up, and it is shaped like a man.",
    attacks:[{kind:"heavy",dmg:3},{kind:"regen"},{kind:"flurry",dmg:1,hits:3}],
    special:null, cadence:3 },

  { id:"skintaker", name:"The Skin-Taker", sprite:"assets/sprites/realm2/skin_taker.png",
    voice:"shriek", pitch:130, size:0.86,
    taunt:"It is wearing a hundred animals, and it would like one more.",
    attacks:[{kind:"drain",dmg:2,shards:12},{kind:"heavy",dmg:2},{kind:"guard"}],
    special:"confuse", cadence:3 },
];

// the two standard banks are one pool as far as the game is concerned
const REALM2_ALL_QUESTIONS = REALM2_QUESTIONS.concat(REALM2_GRAMMAR);

const REALM2_COVER_KEYS = [...new Set(REALM2_ALL_QUESTIONS.map(q => q.cover))];

function questionsForCoverR2(cover, preferElite = false) {
  const basic = REALM2_ALL_QUESTIONS.filter(q => q.cover === cover);
  const elite = REALM2_ELITE_QUESTIONS.filter(q => q.cover === cover);
  if (preferElite && elite.length) return elite;
  return basic;
}

const REALMS = {
  1: {
    id: 1,
    name: "The Stormlands",
    theme: "Extreme Weather",
    palette: "storm",
    sky: "storm",
    monsters: REALM1_MONSTERS,
    elites: REALM1_ELITES,
    boss: { id:"titan", name:"The Hurricane Titan", sprite:"assets/sprites/titan.png",
    voice:"roar", pitch:73, size:1.00,
            taunt:"THE HURRICANE TITAN RISES!",
            attacks:[{kind:"heavy",dmg:2},{kind:"flurry",dmg:1,hits:3},
                     {kind:"charge",dmg:4,turns:2},{kind:"drain",dmg:1,shards:12}],
            special:"expose", cadence:3 },
    npc: { name:"The Storm Chaser", sprite:"assets/sprites/chaser.png" },
    questions: REALM1_QUESTIONS,
    eliteQuestions: REALM1_ELITE_QUESTIONS,
    coverKeys: REALM1_COVER_KEYS,
    ready: true,
  },
  2: {
    id: 2,
    name: "The Wildlands",
    theme: "Animals & Camouflage",
    unit: "Unit 2 — Copycat Animals",
    sky: "forest",
    monsters: REALM2_MONSTERS,
    elites: REALM2_ELITES,
    boss: { id:"camouflage", name:"The Great Camouflage",
            sprite:"assets/sprites/realm2/camouflage.png",
            voice:"roar", pitch:64, size:1.00,
            taunt:"THE FOREST ITSELF STANDS UP.",
            attacks:[{kind:"heavy",dmg:3},{kind:"guard"},
                     {kind:"charge",dmg:4,turns:2},{kind:"flurry",dmg:1,hits:3},
                     {kind:"drain",dmg:1,shards:10}],
            special:"confuse", cadence:3 },
    npc: { name:"The Tracker", sprite:"assets/sprites/realm2/tracker.png" },
    questions: REALM2_ALL_QUESTIONS,
    eliteQuestions: REALM2_ELITE_QUESTIONS,
    coverKeys: REALM2_COVER_KEYS,
    ready: true,
  },
  3:{ id:3, name:"The Concert Caverns",  theme:"Music",                    ready:false },
  4:{ id:4, name:"The Void Station",     theme:"Outer Space",              ready:false },
  5:{ id:5, name:"The Memory Archive",   theme:"Culture & Traditions",     ready:false },
  6:{ id:6, name:"The Overgrowth",       theme:"Plants",                   ready:false },
  7:{ id:7, name:"The Ember Depths",     theme:"Volcanoes",                ready:false },
  8:{ id:8, name:"The Landfill Ruins",   theme:"Recycling & Environment",  ready:false },
  9:{ id:9, name:"The Wanderlands",      theme:"Vacation & Travel",        ready:false },
};

// ---------------------------------------------------------------------------
// Event-node scenes: the realm's NPC, with a choice that has real stakes.
// ---------------------------------------------------------------------------
const REALM1_EVENTS = [
  {
    who: "The Storm Chaser flags you down.",
    text: "\"My instruments blew away in the wind. Help me search the rubble for them, or press on before the next front hits?\"",
    optionA: "Help search", optionB: "Press on",
  },
  {
    who: "The Storm Chaser points at the sky.",
    text: "\"That funnel cloud is forming fast. We could shelter here and wait it out, or make a run for the next chamber.\"",
    optionA: "Make a run for it", optionB: "Shelter and wait",
  },
  {
    who: "A supply crate lies half-buried.",
    text: "The Storm Chaser nudges it with her staff. \"Could be emergency supplies in there. Could be someone's trap. Your call.\"",
    optionA: "Open the crate", optionB: "Leave it alone",
  },
  {
    who: "The wind suddenly stops.",
    text: "\"We're in the eye,\" the Storm Chaser whispers. \"It's calm now, but not for long. Explore quickly, or keep moving?\"",
    optionA: "Explore the eye", optionB: "Keep moving",
  },
];
