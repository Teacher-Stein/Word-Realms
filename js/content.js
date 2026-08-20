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
// ---------------------------------------------------------------------------

const REALM1_QUESTIONS = [
  // ===================== VOCABULARY 1: extreme weather =====================
  { cover:"thunder", type:"vocab", clue:"You often hear this loud rumbling sound right after you see lightning.",
    answer:"thunder", choices:["thunder","a drought","a heat wave"] },
  { cover:"thunder", type:"vocab", clue:"Complete it: 'The ___ was so loud that it woke the whole family up.'",
    answer:"thunder", choices:["thunder","speed","a shelter"] },

  { cover:"lightning", type:"vocab", clue:"A bright flash of electricity that lights up the sky during a storm.",
    answer:"lightning", choices:["lightning","a blizzard","a range"] },
  { cover:"lightning", type:"vocab", clue:"Complete it: 'If you see ___, you should go inside immediately.'",
    answer:"lightning", choices:["lightning","supplies","a plan"] },

  { cover:"flood", type:"vocab", clue:"When a huge amount of rain makes rivers overflow and water covers the streets.",
    answer:"a flood", choices:["a flood","a sandstorm","an ice storm"] },
  { cover:"flood", type:"vocab", clue:"Complete it: 'After three days of heavy rain, there was a ___ in the village.'",
    answer:"flood", choices:["flood","drought","heat wave"] },

  { cover:"drought", type:"vocab", clue:"A very long period with no rain at all, so the ground gets dry and cracked.",
    answer:"a drought", choices:["a drought","a tropical storm","a tornado"] },
  { cover:"drought", type:"vocab", clue:"Complete it: 'The farmers lost their crops because of the long ___.'",
    answer:"drought", choices:["drought","flood","blizzard"] },

  { cover:"ice storm", type:"vocab", clue:"Freezing rain that coats everything - trees, cars, roads - in a layer of ice.",
    answer:"an ice storm", choices:["an ice storm","a heat wave","a hurricane"] },
  { cover:"ice storm", type:"vocab", clue:"Complete it: 'The ___ covered every branch in shining ice.'",
    answer:"ice storm", choices:["ice storm","sandstorm","heat wave"] },

  { cover:"blizzard", type:"vocab", clue:"A dangerous snowstorm with strong winds where you can barely see anything.",
    answer:"a blizzard", choices:["a blizzard","a drought","a flood"] },
  { cover:"blizzard", type:"vocab", clue:"Complete it: 'Schools closed because a ___ buried the roads in snow.'",
    answer:"blizzard", choices:["blizzard","drought","tornado"] },

  { cover:"tropical storm", type:"vocab", clue:"A big swirling storm with strong wind and heavy rain that forms over warm ocean water.",
    answer:"a tropical storm", choices:["a tropical storm","an ice storm","a heat wave"] },
  { cover:"tropical storm", type:"vocab", clue:"Complete it: 'A ___ formed over the warm sea and moved toward the coast.'",
    answer:"tropical storm", choices:["tropical storm","ice storm","drought"] },

  { cover:"speed", type:"vocab", clue:"How fast something moves - scientists measure the wind's ___ to see how dangerous a storm is.",
    answer:"speed", choices:["speed","a range","a shelter"] },
  { cover:"speed", type:"vocab", clue:"Complete it: 'The wind ___ reached 200 kilometres per hour.'",
    answer:"speed", choices:["speed","range","drop"] },

  { cover:"hurricane", type:"vocab", clue:"A massive spinning ocean storm with a calm 'eye' at its centre.",
    answer:"a hurricane", choices:["a hurricane","a sandstorm","a drought"] },
  { cover:"hurricane", type:"vocab", clue:"Which storm has an 'eye' in the middle where the weather is suddenly calm?",
    answer:"a hurricane", choices:["a hurricane","a blizzard","an ice storm"] },

  { cover:"tornado", type:"vocab", clue:"It spins in a tight twisting funnel shape and can flatten a town in seconds.",
    answer:"a tornado", choices:["a tornado","a heat wave","a flood"] },
  { cover:"tornado", type:"vocab", clue:"Complete it: 'A ___ tore through the fields and lifted the roof off the barn.'",
    answer:"tornado", choices:["tornado","drought","heat wave"] },

  { cover:"sandstorm", type:"vocab", clue:"Strong winds pick up sand and dust, making it hard to see or breathe outdoors.",
    answer:"a sandstorm", choices:["a sandstorm","a blizzard","an ice storm"] },
  { cover:"sandstorm", type:"vocab", clue:"Complete it: 'If a ___ comes, close all the windows and stay inside.'",
    answer:"sandstorm", choices:["sandstorm","flood","heat wave"] },

  { cover:"range", type:"vocab", clue:"The difference between the lowest and the highest amount, like temperatures in one day.",
    answer:"a range", choices:["a range","speed","a drop"] },
  { cover:"range", type:"vocab", clue:"Complete it: 'Today the temperature ___ was from 18 to 32 degrees.'",
    answer:"range", choices:["range","speed","shelter"] },

  { cover:"rise", type:"vocab", clue:"When a number, like the temperature, goes UP.",
    answer:"rise", choices:["rise","drop","range"] },
  { cover:"rise", type:"vocab", clue:"Complete it: 'Temperatures will ___ to 40 degrees this weekend.'",
    answer:"rise", choices:["rise","drop","warn"] },

  { cover:"drop", type:"vocab", clue:"When a number, like the temperature, goes DOWN suddenly.",
    answer:"drop", choices:["drop","rise","speed"] },
  { cover:"drop", type:"vocab", clue:"Complete it: 'The temperature will ___ below zero tonight, so wear a coat.'",
    answer:"drop", choices:["drop","rise","range"] },

  { cover:"heat wave", type:"vocab", clue:"Several days in a row of unusually hot weather.",
    answer:"a heat wave", choices:["a heat wave","a blizzard","a flood"] },
  { cover:"heat wave", type:"vocab", clue:"Complete it: 'During the ___, the city opened cool rooms for elderly people.'",
    answer:"heat wave", choices:["heat wave","ice storm","blizzard"] },

  // ===================== VOCABULARY 2: emergencies =====================
  { cover:"emergency", type:"vocab", clue:"A sudden dangerous situation that needs quick action.",
    answer:"an emergency", choices:["an emergency","a shelter","supplies"] },
  { cover:"emergency", type:"vocab", clue:"Complete it: 'In an ___, call for help straight away.'",
    answer:"emergency", choices:["emergency","instrument","range"] },

  { cover:"plan", type:"vocab", clue:"Steps you decide on ahead of time so you know what to do if something goes wrong.",
    answer:"a plan", choices:["a plan","a flashlight","an emergency"] },
  { cover:"plan", type:"vocab", clue:"Complete it: 'Every family should make a storm ___ before the season starts.'",
    answer:"plan", choices:["plan","funnel","speed"] },

  { cover:"flashlight", type:"vocab", clue:"A small handheld light - very useful when the power goes out.",
    answer:"a flashlight", choices:["a flashlight","a shelter","supplies"] },
  { cover:"flashlight", type:"vocab", clue:"Complete it: 'When the lights went out, she grabbed a ___.'",
    answer:"flashlight", choices:["flashlight","shelter","range"] },

  { cover:"supplies", type:"vocab", clue:"Food, water and other items you gather and keep ready in case of an emergency.",
    answer:"supplies", choices:["supplies","a plan","a shelter"] },
  { cover:"supplies", type:"vocab", clue:"Complete it: 'They packed ___ like water, food and batteries.'",
    answer:"supplies", choices:["supplies","instruments","speed"] },

  { cover:"shelter", type:"vocab", clue:"A safe place that protects you from dangerous weather.",
    answer:"a shelter", choices:["a shelter","a flashlight","a plan"] },
  { cover:"shelter", type:"vocab", clue:"Complete it: 'The families waited in a storm ___ until the wind stopped.'",
    answer:"shelter", choices:["shelter","supplies","emergency"] },

  // ===================== READING: Tornado Trouble =====================
  { cover:"instruments", type:"vocab", clue:"Scientists use these tools to measure things like wind speed and temperature.",
    answer:"instruments", choices:["instruments","funnel","warn"] },
  { cover:"instruments", type:"vocab", clue:"Complete it: 'The weather ___ recorded the storm all night.'",
    answer:"instruments", choices:["instruments","supplies","shelters"] },

  { cover:"twisted", type:"vocab", clue:"Bent or spun out of its normal shape.",
    answer:"twisted", choices:["twisted","warned","dropped"] },
  { cover:"twisted", type:"vocab", clue:"Complete it: 'The strong wind ___ the metal sign into a strange shape.'",
    answer:"twisted", choices:["twisted","warned","rose"] },

  { cover:"funnel", type:"vocab", clue:"A cone shape, wide at the top and narrow at the bottom - the shape of a tornado.",
    answer:"a funnel", choices:["a funnel","an instrument","a range"] },
  { cover:"funnel", type:"vocab", clue:"Complete it: 'A dark ___ dropped down from the storm cloud.'",
    answer:"funnel", choices:["funnel","shelter","drought"] },

  { cover:"warn", type:"vocab", clue:"To tell people about danger BEFORE it happens.",
    answer:"warn", choices:["warn","twist","rise"] },
  { cover:"warn", type:"vocab", clue:"Complete it: 'Sirens ___ the town that a tornado was coming.'",
    answer:"warned", choices:["warned","twisted","dropped"] },

  // ===================== PHONICS: /θ/ and /ð/ =====================
  { cover:"phonics-theta", type:"phonics", clue:"Which word has the SAME soft, breathy 'th' sound as 'thanks' and 'thunder'?",
    answer:"think", choices:["think","this","those"] },
  { cover:"phonics-theta", type:"phonics", clue:"Which word uses the /θ/ sound (like in 'thought')?",
    answer:"birthday", choices:["birthday","weather","therefore"] },
  { cover:"phonics-theta", type:"phonics", clue:"Which one does NOT have the /θ/ sound?",
    answer:"those", choices:["those","thermometer","thanks"] },

  { cover:"phonics-eth", type:"phonics", clue:"Which word has the buzzy /ð/ sound, like 'this' and 'weather'?",
    answer:"though", choices:["though","thanks","birthday"] },
  { cover:"phonics-eth", type:"phonics", clue:"Which word uses the /ð/ sound (your voice buzzes)?",
    answer:"therefore", choices:["therefore","think","thunder"] },
  { cover:"phonics-eth", type:"phonics", clue:"Which one does NOT have the buzzy /ð/ sound?",
    answer:"thermometer", choices:["thermometer","those","weather"] },

  // ===================== GRAMMAR 1: be going to =====================
  { cover:"g1-question", type:"grammar", clue:"Choose the correctly formed question:",
    answer:"Is it going to rain tomorrow?", choices:["Is it going to rain tomorrow?","Is it go to rain tomorrow?","Is it going rain tomorrow?"] },
  { cover:"g1-question", type:"grammar", clue:"Choose the correct question about the future:",
    answer:"Are they going to check the shelter?", choices:["Are they going to check the shelter?","Are they going check the shelter?","Do they going to check the shelter?"] },

  { cover:"g1-statement", type:"grammar", clue:"Complete it: 'I ___ listen to the weather forecast at eight o'clock.'",
    answer:"am going to", choices:["am going to","is going to","going to be"] },
  { cover:"g1-statement", type:"grammar", clue:"Choose the correct sentence:",
    answer:"They are going to check the storm shelter.", choices:["They are going to check the storm shelter.","They going to check the storm shelter.","They are go to check the storm shelter."] },

  { cover:"g1-negative", type:"grammar", clue:"Complete it: 'It ___ snow tomorrow - it's going to rain.'",
    answer:"isn't going to", choices:["isn't going to","aren't going to","doesn't going to"] },
  { cover:"g1-negative", type:"grammar", clue:"Choose the correct negative prediction:",
    answer:"We aren't going to travel in this storm.", choices:["We aren't going to travel in this storm.","We aren't go to travel in this storm.","We don't going to travel in this storm."] },

  // ===================== GRAMMAR 2: zero conditional =====================
  { cover:"g2-form", type:"grammar", clue:"Choose the correct zero conditional sentence:",
    answer:"If I see lightning, I go inside.", choices:["If I see lightning, I go inside.","If I saw lightning, I go inside.","If I will see lightning, I go inside."] },
  { cover:"g2-form", type:"grammar", clue:"Choose the correct sentence:",
    answer:"I put on my coat if the weather is cold.", choices:["I put on my coat if the weather is cold.","I put on my coat if the weather was cold.","I will put on my coat if the weather is cold."] },

  { cover:"g2-verb", type:"grammar", clue:"Complete it: 'If a sandstorm ___, I close all the windows.'",
    answer:"comes", choices:["comes","come","will come"] },
  { cover:"g2-verb", type:"grammar", clue:"Complete it: 'If the temperature ___ below zero, water freezes.'",
    answer:"drops", choices:["drops","drop","will drop"] },

  { cover:"g2-meaning", type:"grammar", clue:"Which sentence describes something that is ALWAYS true?",
    answer:"If you heat ice, it melts.", choices:["If you heat ice, it melts.","If you heat ice, it melted.","If you heated ice, it will melt."] },
  { cover:"g2-meaning", type:"grammar", clue:"Complete it: 'If the sirens ___, everyone goes to the shelter.'",
    answer:"sound", choices:["sound","sounded","will sound"] },
];

// distinct curriculum items this realm must cover before it can be cleared
const REALM1_COVER_KEYS = [...new Set(REALM1_QUESTIONS.map(q => q.cover))];

function questionsForCover(cover) {
  return REALM1_QUESTIONS.filter(q => q.cover === cover);
}

// ---------------------------------------------------------------------------
// Realm registry. Realm 1 fully built; 2-9 are locked placeholders showing
// the theme/name pulled from the school's syllabus.
// ---------------------------------------------------------------------------
const REALMS = {
  1: {
    id: 1,
    name: "The Stormlands",
    theme: "Extreme Weather",
    palette: "storm",
    sky: "storm",
    monsters: [
      { name:"Thunderclap Wyrm",  sprite:"assets/sprites/wyrm_storm.png",
        taunt:"A Thunderclap Wyrm rolls out of the clouds!" },
      { name:"Blizzard Wisp",     sprite:"assets/sprites/wisp_storm.png",
        taunt:"A Blizzard Wisp drifts into your path!" },
      { name:"Sandstorm Djinn",   sprite:"assets/sprites/djinn_storm.png",
        taunt:"A Sandstorm Djinn whirls up from the dust!" },
      { name:"Hailstone Brute",   sprite:"assets/sprites/brute_storm.png",
        taunt:"A Hailstone Brute blocks the corridor!" },
      { name:"Frost Fang",        sprite:"assets/sprites/fang_storm.png",
        taunt:"A Frost Fang bares its teeth!" },
      { name:"Heatwave Shimmer",  sprite:"assets/sprites/shimmer_storm.png",
        taunt:"A Heatwave Shimmer burns the air ahead!" },
    ],
    elites: [
      { name:"Tempest Warden",    sprite:"assets/sprites/warden_storm.png",
        taunt:"The Tempest Warden bars the way. This will be a long fight!" },
      { name:"Thunder Colossus",  sprite:"assets/sprites/colossus_storm.png",
        taunt:"A Thunder Colossus stomps forward. Stand ready!" },
    ],
    boss: { name:"The Hurricane Titan", sprite:"assets/sprites/titan_storm.png",
            taunt:"THE HURRICANE TITAN RISES!" },
    npc: { name:"The Storm Chaser", sprite:"assets/sprites/npc_chaser.png" },
    questions: REALM1_QUESTIONS,
    coverKeys: REALM1_COVER_KEYS,
    ready: true,
  },
  2:{ id:2, name:"The Wildlands",        theme:"Animals & Camouflage",     ready:false },
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
