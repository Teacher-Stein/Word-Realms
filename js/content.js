// ---------------------------------------------------------------------------
// REALM 1 CONTENT — hand-written review questions covering every vocabulary
// word, phonics pair, and grammar point from Unit 1 (Extreme Weather) of
// Our World 5, per the school's syllabus. Original clues/sentences written
// fresh for this game (not copied from the textbook).
//
// Question shape: { type, clue, answer, choices[3 incl. answer], tag }
// tag lets us guarantee full coverage in the boss fight.
// ---------------------------------------------------------------------------

const REALM1_QUESTIONS = [
  // --- Vocabulary 1: extreme weather words ---
  { tag:"v1-thunder", type:"vocab", clue:"You often hear this loud rumbling sound right after you see lightning.", answer:"thunder", choices:["thunder","a drought","a heat wave"] },
  { tag:"v1-lightning", type:"vocab", clue:"A bright flash of electricity that lights up the sky during a storm.", answer:"lightning", choices:["lightning","a blizzard","a range"] },
  { tag:"v1-flood", type:"vocab", clue:"When a huge amount of rain makes rivers overflow and water covers the streets.", answer:"a flood", choices:["a flood","a sandstorm","an ice storm"] },
  { tag:"v1-drought", type:"vocab", clue:"A very long period with no rain at all, so the ground gets dry and cracked.", answer:"a drought", choices:["a drought","a tropical storm","a tornado"] },
  { tag:"v1-icestorm", type:"vocab", clue:"Freezing rain that coats everything — trees, cars, roads — in a layer of ice.", answer:"an ice storm", choices:["an ice storm","a heat wave","a hurricane"] },
  { tag:"v1-blizzard", type:"vocab", clue:"A dangerous snowstorm with strong winds and very low visibility.", answer:"a blizzard", choices:["a blizzard","a drought","a flood"] },
  { tag:"v1-tropicalstorm", type:"vocab", clue:"A big, swirling storm with strong wind and heavy rain that forms over warm ocean water.", answer:"a tropical storm", choices:["a tropical storm","an ice storm","a heat wave"] },
  { tag:"v1-speed", type:"vocab", clue:"How fast something is moving — scientists measure this to describe how dangerous a storm is.", answer:"speed", choices:["speed","a range","a drop"] },
  { tag:"v1-hurricane", type:"vocab", clue:"A massive spinning storm from the ocean with an 'eye' of calm air at its center.", answer:"a hurricane", choices:["a hurricane","a sandstorm","a drought"] },
  { tag:"v1-tornado", type:"vocab", clue:"It spins in a tight, twisting funnel shape and can flatten a town in seconds.", answer:"a tornado", choices:["a tornado","a heat wave","a flood"] },
  { tag:"v1-sandstorm", type:"vocab", clue:"Strong winds pick up sand and dust, making it hard to see or breathe outdoors.", answer:"a sandstorm", choices:["a sandstorm","a blizzard","an ice storm"] },
  { tag:"v1-range", type:"vocab", clue:"The difference between the lowest and highest amount, like the ___ of temperatures in a day.", answer:"a range", choices:["a range","speed","a drop"] },
  { tag:"v1-rise", type:"vocab", clue:"When a number, like temperature, goes up.", answer:"rise", choices:["rise","drop","range"] },
  { tag:"v1-drop", type:"vocab", clue:"When a number, like temperature, goes down suddenly.", answer:"drop", choices:["drop","rise","speed"] },
  { tag:"v1-heatwave", type:"vocab", clue:"Several days in a row of unusually hot weather.", answer:"a heat wave", choices:["a heat wave","a blizzard","a flood"] },

  // --- Vocabulary 2: emergency words ---
  { tag:"v2-emergency", type:"vocab", clue:"A sudden, dangerous situation that needs quick action.", answer:"an emergency", choices:["an emergency","a shelter","supplies"] },
  { tag:"v2-plan", type:"vocab", clue:"Steps you decide on ahead of time so you know what to do if something goes wrong.", answer:"a plan", choices:["a plan","a flashlight","an emergency"] },
  { tag:"v2-flashlight", type:"vocab", clue:"A small handheld light, very useful when the power goes out.", answer:"a flashlight", choices:["a flashlight","a shelter","supplies"] },
  { tag:"v2-supplies", type:"vocab", clue:"Food, water, and other items you gather and keep ready in case of an emergency.", answer:"supplies", choices:["supplies","a plan","a shelter"] },
  { tag:"v2-shelter", type:"vocab", clue:"A safe place that protects you from dangerous weather.", answer:"a shelter", choices:["a shelter","a flashlight","a plan"] },

  // --- Phonics: /ð/ and /θ/ ---
  { tag:"ph-th1", type:"phonics", clue:"Which word has the SAME 'th' sound as 'thanks' and 'thunder'? (a soft, breathy /θ/, not a buzzy one)", answer:"think", choices:["think","this","those"] },
  { tag:"ph-th2", type:"phonics", clue:"Which word has the buzzy /ð/ sound, like 'this' and 'weather'?", answer:"though", choices:["though","thanks","birthday"] },

  // --- Grammar 1: future predictions with "be going to" ---
  { tag:"g1-a", type:"grammar", clue:"Choose the correctly formed prediction:", answer:"Is it going to rain tomorrow?", choices:["Is it going to rain tomorrow?","Is it go to rain tomorrow?","Is it going rain tomorrow?"] },
  { tag:"g1-b", type:"grammar", clue:"Complete it correctly: 'I ___ listen to the weather forecast at eight o'clock.'", answer:"am going to", choices:["am going to","is going to","going to be"] },
  { tag:"g1-c", type:"grammar", clue:"Which sentence correctly predicts the future using 'be going to'?", answer:"They are going to check the storm shelter.", choices:["They are going to check the storm shelter.","They going to check the storm shelter.","They are go to check the storm shelter."] },

  // --- Grammar 2: zero conditional (if + present tense) ---
  { tag:"g2-a", type:"grammar", clue:"Choose the correct zero conditional sentence:", answer:"If I see lightning, I go inside.", choices:["If I see lightning, I go inside.","If I saw lightning, I go inside.","If I will see lightning, I go inside."] },
  { tag:"g2-b", type:"grammar", clue:"Complete it: 'If a sandstorm ___, I close all the windows.'", answer:"comes", choices:["comes","come","will come"] },
  { tag:"g2-c", type:"grammar", clue:"Which sentence correctly uses the zero conditional?", answer:"I put on my coat if the weather is cold.", choices:["I put on my coat if the weather is cold.","I put on my coat if the weather was cold.","I will put on my coat if the weather is cold."] },

  // --- Reading vocab (Tornado Trouble) ---
  { tag:"r-instruments", type:"vocab", clue:"Scientists use these tools to measure things like wind speed and temperature.", answer:"instruments", choices:["instruments","funnel","warn"] },
  { tag:"r-twisted", type:"vocab", clue:"Bent or spun out of its normal shape.", answer:"twisted", choices:["twisted","warn","funnel"] },
  { tag:"r-funnel", type:"vocab", clue:"A cone shape that's wide at the top and narrow at the bottom — the shape of a tornado.", answer:"funnel", choices:["funnel","twisted","instruments"] },
  { tag:"r-warn", type:"vocab", clue:"To tell people about danger before it happens.", answer:"warn", choices:["warn","instruments","twisted"] },
];

// Every tag above, used to guarantee full-unit coverage at the boss fight.
const REALM1_ALL_TAGS = REALM1_QUESTIONS.map(q => q.tag);

function questionByTag(tag) {
  return REALM1_QUESTIONS.find(q => q.tag === tag);
}

// ---------------------------------------------------------------------------
// Realm registry — Realm 1 fully built; realms 2-9 are stubbed with their
// theme/monster names from the syllabus so the map screen can show what's
// coming, but have no question bank yet (locked, "Coming soon").
// ---------------------------------------------------------------------------
const REALMS = {
  1: {
    id:1, name:"The Stormlands", theme:"Extreme Weather", palette:"storm",
    monsters:[
      { name:"Thunderclap Wyrm", sprite:"assets/sprites/wyrm_storm.png" },
      { name:"Blizzard Wisp", sprite:"assets/sprites/wisp_storm.png" },
      { name:"Sandstorm Djinn", sprite:"assets/sprites/djinn_storm.png" },
    ],
    boss:{ name:"The Hurricane Titan", sprite:"assets/sprites/titan_storm.png" },
    questions: REALM1_QUESTIONS,
    allTags: REALM1_ALL_TAGS,
    ready:true,
  },
  2:{ id:2, name:"The Wildlands", theme:"Animals & Camouflage", ready:false },
  3:{ id:3, name:"The Concert Caverns", theme:"Music", ready:false },
  4:{ id:4, name:"The Void Station", theme:"Outer Space", ready:false },
  5:{ id:5, name:"The Memory Archive", theme:"Culture & Traditions", ready:false },
  6:{ id:6, name:"The Overgrowth", theme:"Plants", ready:false },
  7:{ id:7, name:"The Ember Depths", theme:"Volcanoes", ready:false },
  8:{ id:8, name:"The Landfill Ruins", theme:"Recycling & Environment", ready:false },
  9:{ id:9, name:"The Wanderlands", theme:"Vacation & Travel", ready:false },
};
