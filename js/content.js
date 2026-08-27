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

  // ------------------------------------------------------------------
  // v6.2: 64 more, taking every curriculum key from 3 questions to 6.
  //
  // Why: four classes played v6.0 in one day and the teacher sat through
  // near-identical question sequences four times. The picker prefers keys
  // not yet covered this run, so with only ~3.5 questions per key every
  // run opened almost the same way. More questions PER KEY is the fix -
  // not simply more questions.
  // ------------------------------------------------------------------
  { cover:"thunder", tier:2, type:"vocab", open:true, clue:"Complete it: 'We counted the seconds between the flash and the ___ to guess how far away the storm was.'",
    answer:"thunder", choices:["thunder", "lightning", "rainfall"] },
  { cover:"thunder", tier:1, type:"phonics", open:false, clue:"Which word begins with the same 'th' sound as 'thunder'?",
    answer:"thick", choices:["thick", "tunnel", "shadow"] },
  { cover:"lightning", tier:2, type:"vocab", open:true, clue:"Complete it: 'A flash of ___ lit up the whole classroom for a second.'",
    answer:"lightning", choices:["lightning", "thunder", "drought"] },
  { cover:"lightning", tier:1, type:"apply", open:false, clue:"A lightning storm starts while you are playing in the school yard. Which is the safest thing to do?",
    answer:"go inside the building", choices:["go inside the building", "stand next to the metal flagpole", "stay in the middle of the yard"] },
  { cover:"flood", tier:2, type:"vocab", open:true, clue:"Complete it: 'The ___ water reached the top of our front steps.'",
    answer:"flood", choices:["flood", "drought", "heat wave"] },
  { cover:"flood", tier:1, type:"apply", open:false, clue:"Which of these happens during a flood?",
    answer:"water covers the roads", choices:["water covers the roads", "the wells dry up", "snow piles up on the roofs"] },
  { cover:"drought", tier:2, type:"vocab", open:true, clue:"Complete it: 'The lake dried up completely during the ___.'",
    answer:"drought", choices:["drought", "hurricane", "sandstorm"] },
  { cover:"drought", tier:2, type:"phonics", open:false, clue:"Which word rhymes with 'drought'?",
    answer:"about", choices:["about", "thought", "brought"] },
  { cover:"ice storm", tier:2, type:"vocab", open:true, clue:"Complete it: 'Our football match was cancelled because the ___ had frozen the pitch solid.'",
    answer:"ice storm", choices:["ice storm", "heat wave", "drought"] },
  { cover:"ice storm", tier:1, type:"apply", open:false, clue:"Which of these is the biggest danger the morning after an ice storm?",
    answer:"slippery roads", choices:["slippery roads", "dusty air", "dry fields"] },
  { cover:"blizzard", tier:1, type:"reason", open:true, clue:"The snow is falling sideways, the wind is howling, and you cannot even see your own gate. Which storm is outside?",
    answer:"a blizzard", choices:["a blizzard", "a sandstorm", "a tropical storm"] },
  { cover:"blizzard", tier:2, type:"vocab", open:true, clue:"Complete the weather report: 'Stay at home tonight. A ___ will bring deep snow and winds of ninety kilometres an hour.'",
    answer:"blizzard", choices:["blizzard", "drought", "heat wave"] },
  { cover:"tropical storm", tier:2, type:"vocab", open:true, clue:"Complete it: 'The ___ brought three days of rain to the coast before it died away.'",
    answer:"tropical storm", choices:["tropical storm", "drought", "blizzard"] },
  { cover:"tropical storm", tier:1, type:"vocab", open:false, clue:"Which two things does a tropical storm always bring?",
    answer:"strong wind and heavy rain", choices:["strong wind and heavy rain", "dust and dry air", "snow and ice"] },
  { cover:"speed", tier:2, type:"vocab", open:true, clue:"Complete it: 'The bus slowed down because the ___ limit on that road is forty.'",
    answer:"speed", choices:["speed", "shelter", "range"] },
  { cover:"speed", tier:1, type:"vocab", open:false, clue:"Which question does the word 'speed' answer about something that is moving?",
    answer:"How fast is it going?", choices:["How fast is it going?", "How heavy is it?", "How far away is it?"] },
  { cover:"hurricane", tier:2, type:"vocab", open:true, clue:"Complete it: 'The ___ knocked down power lines all along the coast.'",
    answer:"hurricane", choices:["hurricane", "drought", "heat wave"] },
  { cover:"hurricane", tier:1, type:"vocab", open:true, clue:"It is the strongest kind of tropical storm, and every one of them is given its own name.",
    answer:"a hurricane", choices:["a hurricane", "a blizzard", "a sandstorm"] },
  { cover:"tornado", tier:2, type:"vocab", open:true, clue:"Complete it: 'The ___ picked up a car and dropped it in the next field.'",
    answer:"tornado", choices:["tornado", "flood", "drought"] },
  { cover:"tornado", tier:1, type:"apply", open:false, clue:"A tornado warning is on the radio. Where should everyone go?",
    answer:"down to the lowest room in the house", choices:["down to the lowest room in the house", "up to the roof to watch it", "out into the open field"] },
  { cover:"sandstorm", tier:2, type:"vocab", open:true, clue:"Complete it: 'After the ___, there was a thick layer of dust on every table.'",
    answer:"sandstorm", choices:["sandstorm", "blizzard", "flood"] },
  { cover:"sandstorm", tier:1, type:"apply", open:false, clue:"Which of these would help you most if you had to walk home in a sandstorm?",
    answer:"a scarf over your nose and mouth", choices:["a scarf over your nose and mouth", "a thick winter coat", "an umbrella"] },
  { cover:"range", tier:1, type:"vocab", open:true, clue:"If a chart shows everything from the smallest number up to the biggest number, it shows the whole ___.",
    answer:"range", choices:["range", "rise", "emergency"] },
  { cover:"range", tier:2, type:"function", open:true, clue:"Complete it: 'Write down the ___ of temperatures you measured this week, from lowest to highest.'",
    answer:"range", choices:["range", "plan", "shelter"] },
  { cover:"rise", tier:1, type:"vocab", open:true, clue:"Complete it: 'Grey smoke began to ___ from the chimney into the sky.'",
    answer:"rise", choices:["rise", "drop", "warn"] },
  { cover:"rise", tier:2, type:"vocab", open:true, clue:"Complete it: 'Every morning the sun begins to ___ in the east.'",
    answer:"rise", choices:["rise", "drop", "melt"] },
  { cover:"drop", tier:1, type:"vocab", open:true, clue:"Complete it: 'A few ___ of rain landed on the window before the storm began.'",
    answer:"drops", choices:["drops", "ranges", "shelters"] },
  { cover:"drop", tier:2, type:"reason", open:true, clue:"'Rise' means to go up. Say the word that means the opposite.",
    answer:"drop", choices:["drop", "range", "twist"] },
  { cover:"heat wave", tier:1, type:"vocab", open:true, clue:"Complete it: 'The ___ lasted nine days and nobody could sleep at night.'",
    answer:"heat wave", choices:["heat wave", "thunderstorm", "snowstorm"] },
  { cover:"heat wave", tier:2, type:"reason", open:true, clue:"It is 39 degrees today, and it was 39 or higher for the last five days. What is the city having?",
    answer:"a heat wave", choices:["a heat wave", "a blizzard", "a light shower"] },
  { cover:"emergency", tier:1, type:"vocab", open:true, clue:"Complete it: 'Firefighters and ambulances are called out in every serious ___.'",
    answer:"emergency", choices:["emergency", "forecast", "instrument"] },
  { cover:"emergency", tier:2, type:"vocab", open:true, clue:"Complete it: 'The alarm rang and the teacher said it was a real ___, not a practice.'",
    answer:"emergency", choices:["emergency", "forecast", "shelter"] },
  { cover:"plan", tier:1, type:"vocab", open:true, clue:"Complete it: 'Our escape ___ shows which door to use and where to meet outside.'",
    answer:"plan", choices:["plan", "range", "shelter"] },
  { cover:"plan", tier:2, type:"reason", open:true, clue:"Before the storm season, a family decides who calls who and where they will meet. What have they made?",
    answer:"a plan", choices:["a plan", "a shelter", "a heat wave"] },
  { cover:"flashlight", tier:1, type:"vocab", open:true, clue:"Complete it: 'Put fresh batteries in the ___ so it still works during the storm.'",
    answer:"flashlight", choices:["flashlight", "shelter", "forecast"] },
  { cover:"flashlight", tier:2, type:"vocab", open:true, clue:"Complete it: 'He pointed the ___ under the bed and found the missing shoe.'",
    answer:"flashlight", choices:["flashlight", "instrument", "supply"] },
  { cover:"supplies", tier:1, type:"vocab", open:true, clue:"Complete it: 'The truck brought ___ to the village after the flood: rice, water and blankets.'",
    answer:"supplies", choices:["supplies", "instruments", "shelters"] },
  { cover:"supplies", tier:2, type:"reason", open:true, clue:"Rice, clean water, candles and batteries kept in a box ready for an emergency are all called this.",
    answer:"supplies", choices:["supplies", "instruments", "ranges"] },
  { cover:"shelter", tier:1, type:"vocab", open:true, clue:"Complete it: 'The walkers found ___ under a rock ledge when the hail started.'",
    answer:"shelter", choices:["shelter", "supplies", "instruments"] },
  { cover:"shelter", tier:2, type:"vocab", open:true, clue:"Complete it: 'Thick trees can ___ you from the rain for a short time.'",
    answer:"shelter", choices:["shelter", "warn", "twist"] },
  { cover:"instruments", tier:1, type:"vocab", open:true, clue:"Complete it: 'A thermometer and a rain gauge are two useful weather ___.'",
    answer:"instruments", choices:["instruments", "supplies", "emergencies"] },
  { cover:"instruments", tier:2, type:"vocab", open:true, clue:"Complete it: 'The scientist checked her ___ before the weather balloon went up into the clouds.'",
    answer:"instruments", choices:["instruments", "shelters", "ranges"] },
  { cover:"twisted", tier:1, type:"vocab", open:true, clue:"Complete it: 'She ___ the wet cloth in her hands to squeeze the water out.'",
    answer:"twisted", choices:["twisted", "dropped", "warned"] },
  { cover:"twisted", tier:2, type:"vocab", open:true, clue:"Complete it: 'The narrow path ___ left and right all the way up the hill.'",
    answer:"twisted", choices:["twisted", "dropped", "measured"] },
  { cover:"funnel", tier:1, type:"vocab", open:true, clue:"Complete it: 'The storm chaser filmed a grey ___ spinning across the empty field.'",
    answer:"funnel", choices:["funnel", "drought", "shelter"] },
  { cover:"funnel", tier:2, type:"vocab", open:true, clue:"Complete it: 'Weather scientists watch for a ___ cloud, because it can turn into a tornado.'",
    answer:"funnel", choices:["funnel", "tropical", "emergency"] },
  { cover:"warn", tier:1, type:"vocab", open:true, clue:"Complete it: 'Please ___ your neighbours that the river is rising tonight.'",
    answer:"warn", choices:["warn", "hide", "drop"] },
  { cover:"warn", tier:2, type:"vocab", open:true, clue:"Complete it: 'The forecast ___ us about the heat wave two days before it arrived.'",
    answer:"warned", choices:["warned", "escaped", "planned"] },
  { cover:"phonics-theta", tier:1, type:"phonics", open:false, clue:"Put your hand on your throat. Which word has the breathy 'th' with NO buzz, like 'thunder'?",
    answer:"month", choices:["month", "mother", "together"] },
  { cover:"phonics-theta", tier:2, type:"phonics", open:true, clue:"Say the number that comes after two. It begins with the breathy /θ/ sound.",
    answer:"three", choices:["three", "those", "that"] },
  { cover:"phonics-eth", tier:1, type:"phonics", open:false, clue:"Your voice buzzes in the middle of 'mother' and 'father'. Which word has that same buzzy 'th'?",
    answer:"another", choices:["another", "healthy", "nothing"] },
  { cover:"phonics-eth", tier:2, type:"phonics", open:true, clue:"Say the word for one of the soft, light things that cover a bird's wing. Its 'th' buzzes.",
    answer:"feather", choices:["feather", "thunder", "north"] },
  { cover:"g1-question", tier:2, type:"grammar", open:false, clue:"Which question about a future plan is written correctly?",
    answer:"When are you going to leave?", choices:["When are you going to leave?", "When you are going to leave?", "When do you going to leave?"] },
  { cover:"g1-question", tier:2, type:"grammar", open:true, clue:"Complete the question: 'What ___ you going to do if the power goes out?'",
    answer:"are", choices:["are", "is", "do"] },
  { cover:"g1-statement", tier:1, type:"grammar", open:false, clue:"Which sentence talks about a PLAN for the future?",
    answer:"I am going to buy a raincoat.", choices:["I am going to buy a raincoat.", "I bought a raincoat.", "I buy a raincoat every year."] },
  { cover:"g1-statement", tier:2, type:"grammar", open:true, clue:"Complete this plan: 'Tomorrow morning the scientist ___ measure the wind speed.'",
    answer:"is going to", choices:["is going to", "are going to", "going to"] },
  { cover:"g1-negative", tier:1, type:"grammar", open:false, clue:"Which sentence means the picnic will NOT happen?",
    answer:"We aren't going to have the picnic.", choices:["We aren't going to have the picnic.", "We are going to have the picnic.", "Are we going to have the picnic?"] },
  { cover:"g1-negative", tier:2, type:"grammar", open:true, clue:"Say this again with the short form of 'is not': 'It is not going to rain today.'",
    answer:"It isn't going to rain today.", choices:["It isn't going to rain today.", "It doesn't going to rain today.", "It is not go to rain today."] },
  { cover:"g2-form", tier:1, type:"grammar", open:false, clue:"Which sentence has NO mistake in it?",
    answer:"If clouds cover the sun, the air feels cooler.", choices:["If clouds cover the sun, the air feels cooler.", "If clouds will cover the sun, the air feels cooler.", "If clouds cover the sun, the air felt cooler."] },
  { cover:"g2-form", tier:2, type:"grammar", open:true, clue:"Complete it: 'If you put a paper boat in water, it always ___.'",
    answer:"floats", choices:["floats", "will float", "floated"] },
  { cover:"g2-verb", tier:1, type:"grammar", open:true, clue:"Complete it: 'If the sky turns dark, the street lights always ___ on.'",
    answer:"come", choices:["come", "comes", "will come"] },
  { cover:"g2-verb", tier:2, type:"grammar", open:true, clue:"Complete it: 'If the rivers rise too high, the village always ___ under water.'",
    answer:"goes", choices:["goes", "go", "will go"] },
  { cover:"g2-meaning", tier:1, type:"grammar", open:false, clue:"Which sentence is a general fact that is true every time?",
    answer:"If you mix blue and yellow, you get green.", choices:["If you mix blue and yellow, you get green.", "Yesterday I mixed blue and yellow.", "Tomorrow I am going to mix blue and yellow."] },
  { cover:"g2-meaning", tier:2, type:"reason", open:false, clue:"'If you leave milk in the sun, it goes bad.' What does this sentence tell us?",
    answer:"It happens every time.", choices:["It happens every time.", "It happened once last week.", "It might happen tomorrow."] },
  // ---- v6.5: spot the error -----------------------------------------------
  // The class reads a whole sentence and taps the one word that is wrong. It
  // is the closest the game gets to asking a child to PRODUCE language rather
  // than recognise it, and it is the only format where a wrong answer is still
  // in front of them afterwards to look at.
  { cover:"g1-statement", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"She is going to checks the radio tonight.", answer:"checks", fix:"check" },
  { cover:"g1-question", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Is they going to close the school?", answer:"Is", fix:"Are" },
  { cover:"g1-negative", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"They isn't going to open the road today.", answer:"isn't", fix:"aren't" },
  { cover:"g2-form", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"If the wind blow hard, the trees bend.", answer:"blow", fix:"blows" },
  { cover:"g2-verb", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"If you touched ice, your hand feels cold.", answer:"touched", fix:"touch" },
  { cover:"blizzard", tier:2, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"A blizzard brings heavy rain and strong wind for days.",
    answer:"rain", fix:"snow" },
  { cover:"drought", tier:2, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"After months with no rain the river was full and the crops died.",
    answer:"full", fix:"empty" },
  { cover:"flood", tier:2, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The river rose over its banks and the streets stayed dry.",
    answer:"dry", fix:"under water" },
  { cover:"thunder", tier:2, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"You always see lightning before you hear thunder because light travels slower.",
    answer:"slower", fix:"faster" },

  // ---- v6.5: put it in order ----------------------------------------------
  // Realm 1's two grammar points are both word-order problems, so this format
  // tests them more directly than choosing between three finished sentences.
  { cover:"g1-statement", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["We", "are going to", "close", "the shutters"] },
  { cover:"g1-negative", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["The school", "is not going to", "open", "tomorrow"] },
  { cover:"g1-question", tier:3, type:"order", format:"order", open:false,
    clue:"Put the question in the right order.",
    parts:["Is the storm", "going to", "reach", "the city"] },
  { cover:"g2-form", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["If the river rises", "the village", "floods"] },
  { cover:"g2-verb", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["If the temperature drops", "the rain", "turns to snow"] },
  { cover:"plan", tier:2, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["Every family", "should make", "a storm plan"] },
  { cover:"emergency", tier:2, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["Put the flashlight", "and the water", "in the bag"] },

  // ---- v6.5: odd one out --------------------------------------------------
  // Four options in a grid. Sorting things into a group and spotting what does
  // not belong is a different demand from completing a sentence, and it suits
  // the vocabulary keys that come in natural families.
  { cover:"ice storm", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these fall from the sky in cold weather. Tap the one that does not.",
    answer:"sand", choices:["snow", "sleet", "hail", "sand"] },
  { cover:"instruments", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these measure the weather. Tap the one that does not.",
    answer:"a telescope", choices:["a thermometer", "a rain gauge", "a wind vane", "a telescope"] },
  { cover:"emergency", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are sensible in an emergency. Tap the one that is not.",
    answer:"panic", choices:["stay calm", "follow the plan", "listen to the radio", "panic"] },
  { cover:"rise", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these describe something changing. Tap the one that does not.",
    answer:"shelter", choices:["rise", "fall", "drop", "shelter"] },
  { cover:"phonics-theta", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these have the hissy /θ/ sound. Tap the one that does not.",
    answer:"weather", choices:["think", "thumb", "thirty", "weather"] },
  { cover:"phonics-eth", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these have the buzzy /ð/ sound. Tap the one that does not.",
    answer:"thick", choices:["this", "mother", "breathe", "thick"] },
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

  // ------------------------------------------------------------------
  // v6.2: 32 more, taking every curriculum key from 3 questions to 6.
  //
  // Why: four classes played v6.0 in one day and the teacher sat through
  // near-identical question sequences four times. The picker prefers keys
  // not yet covered this run, so with only ~3.5 questions per key every
  // run opened almost the same way. More questions PER KEY is the fix -
  // not simply more questions.
  // ------------------------------------------------------------------
  { cover:"thunder", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The thunder were so loud that the windows shook.'",
    answer:"'were' should be 'was'", choices:["'were' should be 'was'", "'loud' should be 'loudly'", "'shook' should be 'shaked'"] },
  { cover:"lightning", tier:4, type:"grammar", open:true, clue:"Put the verb in the right form: 'Look! The sky ___ (flash) again — the lightning is right above us.'",
    answer:"is flashing", choices:["is flashing", "flash", "flashed"] },
  { cover:"flood", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'Last week the river flood the whole market.'",
    answer:"'flood' should be 'flooded'", choices:["'flood' should be 'flooded'", "'river' should be 'rivers'", "'whole' should be 'all'"] },
  { cover:"drought", tier:4, type:"grammar", open:true, clue:"Put the word in the right form: 'This is the ___ (dry) summer our village has ever known.'",
    answer:"driest", choices:["driest", "dryest", "more dry"] },
  { cover:"ice storm", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The ice storm was so cold that we couldn't opened the car doors.'",
    answer:"'couldn't opened' should be 'couldn't open'", choices:["'couldn't opened' should be 'couldn't open'", "'was' should be 'were'", "'cold' should be 'coldly'"] },
  { cover:"blizzard", tier:4, type:"grammar", open:true, clue:"Put the verb in the right form: 'If a blizzard ___ (come) tomorrow, the school will close.'",
    answer:"comes", choices:["comes", "will come", "came"] },
  { cover:"tropical storm", tier:4, type:"grammar", open:true, clue:"Put the word in the right form: 'A hurricane is much ___ (strong) than a tropical storm.'",
    answer:"stronger", choices:["stronger", "more strong", "strongest"] },
  { cover:"speed", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'Scientists measures the speed of the wind with a special tool.'",
    answer:"'measures' should be 'measure'", choices:["'measures' should be 'measure'", "'speed' should be 'speeds'", "'with' should be 'by'"] },
  { cover:"hurricane", tier:4, type:"grammar", open:false, clue:"Choose the correct sentence.",
    answer:"The hurricane destroyed hundreds of houses last night.", choices:["The hurricane destroyed hundreds of houses last night.", "The hurricane destroy hundreds of houses last night.", "The hurricane was destroyed hundreds of houses last night."] },
  { cover:"tornado", tier:4, type:"function", open:true, clue:"Finish the warning with the strongest word: 'A tornado is coming — everybody ___ move away from the windows now.'",
    answer:"must", choices:["must", "might", "could"] },
  { cover:"sandstorm", tier:4, type:"function", open:true, clue:"Finish the sentence with the right joining word: 'We stayed indoors all afternoon ___ the sandstorm was too thick to walk through.'",
    answer:"because", choices:["because", "but", "although"] },
  { cover:"range", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The temperatures ranges from 21 to 34 degrees.'",
    answer:"'ranges' should be 'range'", choices:["'ranges' should be 'range'", "'from' should be 'of'", "'to' should be 'and'"] },
  { cover:"rise", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The river rised very fast after the heavy rain.'",
    answer:"'rised' should be 'rose'", choices:["'rised' should be 'rose'", "'very fast' should be 'very fastly'", "'heavy' should be 'heavily'"] },
  { cover:"drop", tier:4, type:"grammar", open:true, clue:"Finish it in the correct tense: 'Yesterday the temperature ___ by twelve degrees in one hour.'",
    answer:"dropped", choices:["dropped", "drops", "dropping"] },
  { cover:"heat wave", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'Last summer there was a heat wave, so the students stayed in the shade and drink lots of water.'",
    answer:"'drink' should be 'drank'", choices:["'drink' should be 'drank'", "'was' should be 'were'", "'stayed' should be 'stay'"] },
  { cover:"emergency", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'If there will be an emergency, the alarm rings twice.'",
    answer:"'will be' should be 'is'", choices:["'will be' should be 'is'", "'rings' should be 'ring'", "'twice' should be 'two'"] },
  { cover:"plan", tier:4, type:"grammar", open:true, clue:"Finish it in the correct form: 'Last night we ___ the whole journey on a big sheet of paper.'",
    answer:"planned", choices:["planned", "planning", "plan"] },
  { cover:"flashlight", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'There is two flashlights in the emergency box.'",
    answer:"'is' should be 'are'", choices:["'is' should be 'are'", "'two' should be 'second'", "'box' should be 'boxes'"] },
  { cover:"supplies", tier:4, type:"grammar", open:true, clue:"Finish it correctly: 'Our emergency supplies ___ kept in the cupboard by the door.'",
    answer:"are", choices:["are", "is", "was"] },
  { cover:"shelter", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The village build a new shelter last year.'",
    answer:"'build' should be 'built'", choices:["'build' should be 'built'", "'a' should be 'an'", "'last year' should be 'in last year'"] },
  { cover:"instruments", tier:4, type:"grammar", open:true, clue:"Finish it with the singular form: 'A thermometer is one ___ that measures temperature.'",
    answer:"instrument", choices:["instrument", "instruments", "instrumental"] },
  { cover:"twisted", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The wind was so strong that it twist the lamp post into a curve.'",
    answer:"'twist' should be 'twisted'", choices:["'twist' should be 'twisted'", "'was' should be 'were'", "'strong' should be 'strongly'"] },
  { cover:"funnel", tier:4, type:"apply", open:true, clue:"Linh poured rice into a narrow jar through a cone-shaped tool. A tornado is named after that same shape. What is the tool called?",
    answer:"a funnel", choices:["a funnel", "an instrument", "a range"] },
  { cover:"warn", tier:4, type:"apply", open:true, clue:"The sky turned dark green, so Nam ran through the market telling everyone a storm was coming. What was Nam doing?",
    answer:"warning people", choices:["warning people", "escaping", "hiding"] },
  { cover:"phonics-theta", tier:4, type:"phonics", open:true, clue:"In this sentence, one 'th' word buzzes instead of sounding breathy: 'My brother counted three teeth.' Say that word.",
    answer:"brother", choices:["brother", "three", "teeth"] },
  { cover:"phonics-eth", tier:4, type:"fix it", open:false, clue:"A student read the word 'weather' with the same breathy 'th' as 'thanks'. What should they change?",
    answer:"make the 'th' buzz, like in 'mother'", choices:["make the 'th' buzz, like in 'mother'", "make the 'th' breathy, like in 'thin'", "say the 'th' like a 't', as in 'ten'"] },
  { cover:"g1-question", tier:4, type:"apply", open:true, clue:"Put these words in order to make a question: 'to / are / going / you / stay inside'",
    answer:"Are you going to stay inside?", choices:["Are you going to stay inside?", "You are going to stay inside?", "Are you going stay to inside?"] },
  { cover:"g1-statement", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'She are going to fill the water bottles.'",
    answer:"'are' should be 'is'", choices:["'are' should be 'is'", "'going' should be 'go'", "'fill' should be 'filling'"] },
  { cover:"g1-negative", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'He don't going to join the trip.'",
    answer:"'don't' should be 'isn't'", choices:["'don't' should be 'isn't'", "'going' should be 'go'", "'join' should be 'joining'"] },
  { cover:"g2-form", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'If you touched a hot pan, it hurts.'",
    answer:"'touched' should be 'touch'", choices:["'touched' should be 'touch'", "'hurts' should be 'hurting'", "'it' should be 'they'"] },
  { cover:"g2-verb", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'If the alarm rings, the students goes outside.'",
    answer:"'goes' should be 'go'", choices:["'goes' should be 'go'", "'rings' should be 'ring'", "'If' should be 'Unless'"] },
  { cover:"g2-meaning", tier:4, type:"apply", open:true, clue:"Say this fact as an 'if' sentence: 'Metal always gets hot when you leave it in the sun.'",
    answer:"If you leave metal in the sun, it gets hot.", choices:["If you leave metal in the sun, it gets hot.", "If you left metal in the sun, it got hot.", "If you will leave metal in the sun, it will get hot."] },
];

// distinct curriculum items this realm must cover before it can be cleared
const REALM1_COVER_KEYS = [...new Set(REALM1_QUESTIONS.map(q => q.cover))];

// ---------------------------------------------------------------------------
// WHAT EACH COVER KEY ACTUALLY IS
//
// The cover keys are slugs, written to be typed quickly while authoring
// questions: "g2-form", "as_as_negative", "phonics-eth". They are perfectly
// clear at 11pm with the question in front of you and completely opaque three
// weeks later in a staff room.
//
// The teaching report is only worth having if a teacher can read a row of it
// and know what to reteach on Monday, so every key gets a plain-English name
// and a group. The group is what makes the report actionable: one weak row is
// noise, but five weak rows that are all zero conditional is a lesson.
//
// A key with no entry here is a bug, not a nuisance - it would appear in the
// report as a raw slug. test_curriculum.py fails if one is missing.
// ---------------------------------------------------------------------------
const COVER_LABELS = {
  // ---- Realm 1, Unit 1: Extreme Weather -----------------------------------
  "blizzard":        { label: "blizzard",                    group: "Extreme weather words" },
  "drought":         { label: "drought",                     group: "Extreme weather words" },
  "flood":           { label: "flood",                       group: "Extreme weather words" },
  "heat wave":       { label: "heat wave",                   group: "Extreme weather words" },
  "hurricane":       { label: "hurricane",                   group: "Extreme weather words" },
  "ice storm":       { label: "ice storm",                   group: "Extreme weather words" },
  "sandstorm":       { label: "sandstorm",                   group: "Extreme weather words" },
  "tornado":         { label: "tornado",                     group: "Extreme weather words" },
  "tropical storm":  { label: "tropical storm",              group: "Extreme weather words" },
  "lightning":       { label: "lightning",                   group: "Extreme weather words" },
  "thunder":         { label: "thunder",                     group: "Extreme weather words" },
  "funnel":          { label: "funnel",                      group: "Extreme weather words" },

  "emergency":       { label: "emergency",                   group: "Staying safe in a storm" },
  "shelter":         { label: "shelter",                     group: "Staying safe in a storm" },
  "supplies":        { label: "supplies",                    group: "Staying safe in a storm" },
  "flashlight":      { label: "flashlight",                  group: "Staying safe in a storm" },
  "plan":            { label: "plan",                        group: "Staying safe in a storm" },
  "warn":            { label: "warn",                        group: "Staying safe in a storm" },
  "instruments":     { label: "instruments",                 group: "Staying safe in a storm" },

  "range":           { label: "range",                       group: "Describing measurements" },
  "rise":            { label: "rise",                        group: "Describing measurements" },
  "drop":            { label: "drop",                        group: "Describing measurements" },
  "speed":           { label: "speed",                       group: "Describing measurements" },
  "twisted":         { label: "twisted",                     group: "Describing measurements" },

  "g1-statement":    { label: "“going to” — statements",  group: "Talking about the future" },
  "g1-negative":     { label: "“going to” — negatives",   group: "Talking about the future" },
  "g1-question":     { label: "“going to” — questions",   group: "Talking about the future" },

  "g2-form":         { label: "zero conditional — building it",  group: "Zero conditional (if + present)" },
  "g2-verb":         { label: "zero conditional — verb forms",   group: "Zero conditional (if + present)" },
  "g2-meaning":      { label: "zero conditional — what it means", group: "Zero conditional (if + present)" },

  "phonics-theta":   { label: "the hissy /θ/ — “thanks”", group: "Sounds: th" },
  "phonics-eth":     { label: "the buzzy /ð/ — “weather”", group: "Sounds: th" },

  // ---- Realm 2, Unit 2: Copycat Animals -----------------------------------
  "camouflage":      { label: "camouflage",                  group: "How animals stay hidden" },
  "hide":            { label: "hide",                        group: "How animals stay hidden" },
  "spot":            { label: "spot",                        group: "How animals stay hidden" },
  "stripe":          { label: "stripe",                      group: "How animals stay hidden" },
  "resemble":        { label: "resemble",                    group: "How animals stay hidden" },
  "imitate":         { label: "imitate",                     group: "How animals stay hidden" },
  "copy":            { label: "copy",                        group: "How animals stay hidden" },
  "confuse":         { label: "confuse",                     group: "How animals stay hidden" },

  "predator":        { label: "predator",                    group: "Hunting and escaping" },
  "prey":            { label: "prey",                        group: "Hunting and escaping" },
  "hunt":            { label: "hunt",                        group: "Hunting and escaping" },
  "attack":          { label: "attack",                      group: "Hunting and escaping" },
  "defend":          { label: "defend",                      group: "Hunting and escaping" },
  "escape":          { label: "escape",                      group: "Hunting and escaping" },
  "avoid":           { label: "avoid",                       group: "Hunting and escaping" },
  "frighten":        { label: "frighten",                    group: "Hunting and escaping" },
  "poisonous":       { label: "poisonous",                   group: "Hunting and escaping" },

  "species":         { label: "species",                     group: "Sorting and describing animals" },
  "insect":          { label: "insect",                      group: "Sorting and describing animals" },
  "characteristic":  { label: "characteristic",              group: "Sorting and describing animals" },
  "classification":  { label: "classification",              group: "Sorting and describing animals" },
  "describe_animals":{ label: "describing an animal",        group: "Sorting and describing animals" },
  "compare_animals": { label: "comparing two animals",       group: "Sorting and describing animals" },
  "imitation_talk":  { label: "talking about copying",       group: "Sorting and describing animals" },

  "as_as_equal":     { label: "as … as — saying two things match",  group: "Comparing with as … as" },
  "as_as_negative":  { label: "as … as — the negative form",        group: "Comparing with as … as" },
  "as_as_meaning":   { label: "as … as — what it means",            group: "Comparing with as … as" },

  "tag_rule":        { label: "question tags — the rule",     group: "Question tags" },
  "tag_positive":    { label: "question tags — after a positive sentence", group: "Question tags" },
  "tag_negative":    { label: "question tags — after a negative sentence", group: "Question tags" },

  "dictionary_use":  { label: "using a dictionary",           group: "Reading skills" },
  "scan_text":       { label: "scanning a text for one fact", group: "Reading skills" },
};

// The report shows these, never the slug. An unlabelled key is a bug, but it
// should degrade into something readable rather than an empty cell.
function coverLabel(key) {
  const e = COVER_LABELS[key];
  return e ? e.label : String(key || "").replace(/[-_]/g, " ");
}

function coverGroup(key) {
  const e = COVER_LABELS[key];
  return e ? e.group : "Other";
}


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

  // ------------------------------------------------------------------
  // v6.2: 37 more, taking every curriculum key from 3 questions to 6.
  //
  // Why: four classes played v6.0 in one day and the teacher sat through
  // near-identical question sequences four times. The picker prefers keys
  // not yet covered this run, so with only ~3.5 questions per key every
  // run opened almost the same way. More questions PER KEY is the fix -
  // not simply more questions.
  // ------------------------------------------------------------------
  { cover:"camouflage", tier:2, type:"vocab", open:true, clue:"Complete it: 'Soldiers wear green and brown clothes to ___ themselves in the forest.'",
    answer:"camouflage", choices:["camouflage", "frighten", "hunt"] },
  { cover:"camouflage", tier:1, type:"vocab", open:false, clue:"Which of these animals is using camouflage?",
    answer:"a brown gecko resting on a brown wall", choices:["a brown gecko resting on a brown wall", "a red frog sitting on a green leaf", "a parrot singing on an open branch"] },
  { cover:"characteristic", tier:1, type:"vocab", open:false, clue:"Which of these is a characteristic of a bird?",
    answer:"it has feathers", choices:["it has feathers", "it lives near my school", "it wakes up early"] },
  { cover:"characteristic", tier:2, type:"vocab", open:true, clue:"Complete it: 'Sharp claws are a useful ___ for a cat that climbs trees.'",
    answer:"characteristic", choices:["characteristic", "camouflage", "predator"] },
  { cover:"copy", tier:1, type:"vocab", open:false, clue:"Which of these is an example of one animal copying another?",
    answer:"a harmless fly with the same yellow bands as a bee", choices:["a harmless fly with the same yellow bands as a bee", "a lizard growing a new tail", "a fish swimming into deeper water"] },
  { cover:"frighten", tier:1, type:"vocab", open:false, clue:"Which of these would frighten a small bird?",
    answer:"a cat jumping out of a bush", choices:["a cat jumping out of a bush", "a bowl of seeds on the ground", "a warm nest in a tree"] },
  { cover:"frighten", tier:2, type:"vocab", open:true, clue:"Complete it: 'The little frog puffs itself up to look bigger and ___ the snake.'",
    answer:"frighten", choices:["frighten", "resemble", "copy"] },
  { cover:"hide", tier:1, type:"vocab", open:false, clue:"Which of these animals is hiding?",
    answer:"a gecko pressed flat behind a curtain", choices:["a gecko pressed flat behind a curtain", "a tiger walking across open grass", "a bird singing on a high branch"] },
  { cover:"hunt", tier:1, type:"vocab", open:false, clue:"Which of these animals hunts other animals for its food?",
    answer:"a snake", choices:["a snake", "a cow", "a butterfly"] },
  { cover:"imitate", tier:1, type:"vocab", open:false, clue:"Which of these is an example of imitating?",
    answer:"a moth with wing patterns shaped like an owl's eyes", choices:["a moth with wing patterns shaped like an owl's eyes", "a fish swimming quickly away from a bird", "a bear sleeping through the whole winter"] },
  { cover:"insect", tier:1, type:"vocab", open:false, clue:"Which of these is an insect?",
    answer:"an ant", choices:["an ant", "a snail", "a gecko"] },
  { cover:"poisonous", tier:2, type:"vocab", open:true, clue:"Complete it: 'Some caterpillars eat ___ leaves so that birds will not touch them.'",
    answer:"poisonous", choices:["poisonous", "frightened", "hidden"] },
  { cover:"poisonous", tier:1, type:"vocab", open:false, clue:"Which of these animals is famous for being poisonous?",
    answer:"a bright yellow dart frog", choices:["a bright yellow dart frog", "a garden snail", "a small brown sparrow"] },
  { cover:"predator", tier:1, type:"vocab", open:false, clue:"Which of these animals is a predator?",
    answer:"an owl", choices:["an owl", "a rabbit", "a grasshopper"] },
  { cover:"prey", tier:1, type:"vocab", open:false, clue:"Which of these animals is usually prey, not a predator?",
    answer:"a mouse", choices:["a mouse", "a tiger", "a shark"] },
  { cover:"prey", tier:2, type:"vocab", open:true, clue:"Complete it: 'Frogs shoot out their long tongues to catch their ___, which is mostly insects.'",
    answer:"prey", choices:["prey", "predator", "camouflage"] },
  { cover:"resemble", tier:1, type:"vocab", open:true, clue:"Complete it: 'Twin sisters often ___ each other so much that new teachers mix them up.'",
    answer:"resemble", choices:["resemble", "confuse", "avoid"] },
  { cover:"resemble", tier:2, type:"vocab", open:true, clue:"Complete it: 'The young swan does not yet ___ its white parents; it is still grey and fluffy.'",
    answer:"resemble", choices:["resemble", "frighten", "defend"] },
  { cover:"species", tier:1, type:"vocab", open:true, clue:"Complete it: 'The tiger is an endangered ___; only a few thousand are left in the wild.'",
    answer:"species", choices:["species", "stripe", "escape"] },
  { cover:"species", tier:2, type:"vocab", open:true, clue:"Complete it: 'Frogs and toads may look alike, but they belong to different ___.'",
    answer:"species", choices:["species", "stripes", "insects"] },
  { cover:"spot", tier:1, type:"vocab", open:true, clue:"Complete it: 'This ladybird is red with seven small black ___s on its back.'",
    answer:"spot", choices:["spot", "stripe", "species"] },
  { cover:"spot", tier:2, type:"vocab", open:true, clue:"Complete it: 'Baby deer are born with pale ___s, but the marks fade as they grow.'",
    answer:"spot", choices:["spot", "stripe", "insect"] },
  { cover:"stripe", tier:1, type:"vocab", open:true, clue:"Complete it: 'Our team shirt has three white ___s down each sleeve.'",
    answer:"stripe", choices:["stripe", "spot", "species"] },
  { cover:"stripe", tier:2, type:"vocab", open:true, clue:"Complete it: 'You can tell this snake by the single yellow ___ running down its back.'",
    answer:"stripe", choices:["stripe", "spot", "characteristic"] },
  { cover:"attack", tier:1, type:"vocab", open:true, clue:"Complete it: 'In this game the red team will ___ while the blue team defends.'",
    answer:"attack", choices:["attack", "escape", "resemble"] },
  { cover:"attack", tier:2, type:"vocab", open:true, clue:"Complete it: 'Ants will ___ any insect that walks onto their nest.'",
    answer:"attack", choices:["attack", "imitate", "hide"] },
  { cover:"avoid", tier:1, type:"vocab", open:true, clue:"Complete it: 'Take the small road tonight to ___ the heavy traffic.'",
    answer:"avoid", choices:["avoid", "attack", "defend"] },
  { cover:"avoid", tier:2, type:"vocab", open:true, clue:"Complete it: 'Wash your hands before you eat to ___ getting sick.'",
    answer:"avoid", choices:["avoid", "escape", "confuse"] },
  { cover:"confuse", tier:1, type:"vocab", open:true, clue:"Complete it: 'All these new words ___ me — I cannot remember which is which.'",
    answer:"confuse", choices:["confuse", "defend", "escape"] },
  { cover:"confuse", tier:2, type:"vocab", open:true, clue:"Complete it: 'The false eye spots on its wings ___ the hungry bird for a moment.'",
    answer:"confuse", choices:["confuse", "imitate", "escape"] },
  { cover:"defend", tier:1, type:"vocab", open:true, clue:"Complete it: 'The goalkeeper's job is to ___ the goal.'",
    answer:"defend", choices:["defend", "attack", "escape"] },
  { cover:"defend", tier:2, type:"vocab", open:true, clue:"Complete it: 'A porcupine raises its sharp spines to ___ itself.'",
    answer:"defend", choices:["defend", "imitate", "confuse"] },
  { cover:"escape", tier:1, type:"vocab", open:true, clue:"Complete it: 'Two rabbits managed to ___ from the garden through a hole in the fence.'",
    answer:"escape", choices:["escape", "attack", "resemble"] },
  { cover:"escape", tier:2, type:"vocab", open:true, clue:"Complete it: 'Deer stay close to the trees so they can ___ quickly if there is danger.'",
    answer:"escape", choices:["escape", "attack", "confuse"] },
  { cover:"describe_animals", tier:1, type:"vocab", open:true, clue:"Complete the description: 'A giraffe has a very long ___, so it can reach the leaves at the top of the tree.'",
    answer:"neck", choices:["neck", "tail", "shell"] },
  { cover:"describe_animals", tier:2, type:"vocab", open:true, clue:"You are describing what covers an animal's body. A bird has feathers and a fish has ___.",
    answer:"scales", choices:["scales", "fur", "spots"] },
  { cover:"imitation_talk", tier:1, type:"vocab", open:true, clue:"Complete it: 'The harmless snake ___ the bright rings of a poisonous one.'",
    answer:"copies", choices:["copies", "eats", "escapes"] },
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

  // ------------------------------------------------------------------
  // v6.2: 27 more, taking every curriculum key from 3 questions to 6.
  //
  // Why: four classes played v6.0 in one day and the teacher sat through
  // near-identical question sequences four times. The picker prefers keys
  // not yet covered this run, so with only ~3.5 questions per key every
  // run opened almost the same way. More questions PER KEY is the fix -
  // not simply more questions.
  // ------------------------------------------------------------------
  { cover:"copy", tier:2, type:"grammar", open:true, clue:"Put it in the past: 'The young monkey ___ everything its mother did.'",
    answer:"copied", choices:["copied", "copyed", "copys"] },
  { cover:"hide", tier:2, type:"grammar", open:true, clue:"Put it in the past: 'The mouse ___ in the tall grass until the cat had gone.'",
    answer:"hid", choices:["hid", "hided", "hides"] },
  { cover:"hunt", tier:2, type:"grammar", open:true, clue:"Put it in the past: 'The young lion ___ with its mother for the first time.'",
    answer:"hunted", choices:["hunted", "hunt", "hunting"] },
  { cover:"imitate", tier:2, type:"grammar", open:true, clue:"Put it in the past: 'The clever bird ___ the ringtone of my phone all morning.'",
    answer:"imitated", choices:["imitated", "imitate", "imitating"] },
  { cover:"insect", tier:2, type:"grammar", open:true, clue:"Complete it with the plural: 'We counted five different ___ on one flower.'",
    answer:"insects", choices:["insects", "insect", "insectes"] },
  { cover:"predator", tier:2, type:"grammar", open:true, clue:"Complete it with the plural: 'Snakes and eagles are both ___ of small mice.'",
    answer:"predators", choices:["predators", "predator", "prey"] },
  { cover:"as_as_equal", tier:2, type:"grammar", open:true, clue:"Finish it with as ... as: 'A young buffalo is already ___ ___ ___ a grown man.'",
    answer:"as strong as", choices:["as strong as", "as stronger as", "so strong as"] },
  { cover:"as_as_equal", tier:2, type:"grammar", open:true, clue:"Finish it with as ... as: 'A bird's bones are ___ ___ ___ paper.'",
    answer:"as light as", choices:["as light as", "as light than", "as more light as"] },
  { cover:"as_as_negative", tier:2, type:"grammar", open:true, clue:"Finish it with not as ... as: 'A kitten's meow is not ___ ___ ___ a dog's bark.'",
    answer:"as loud as", choices:["as loud as", "as louder as", "so loud than"] },
  { cover:"as_as_negative", tier:2, type:"grammar", open:true, clue:"Finish it with not as ... as: 'I am not ___ ___ ___ my sister, so she reaches the top shelf for me.'",
    answer:"as tall as", choices:["as tall as", "as taller as", "as tall than"] },
  { cover:"as_as_meaning", tier:1, type:"grammar", open:true, clue:"Complete it: 'My bag is ___ heavy as yours — they weigh exactly the same.'",
    answer:"as", choices:["as", "than", "more"] },
  { cover:"as_as_meaning", tier:2, type:"reason", open:true, clue:"'A hoverfly is as harmless as a butterfly.' Can a hoverfly hurt you?",
    answer:"no, it is harmless", choices:["no, it is harmless", "yes, it is dangerous", "yes, but only at night"] },
  { cover:"tag_positive", tier:2, type:"grammar", open:true, clue:"Add the tag: 'You can see the stripes, ___ ___?'",
    answer:"can't you", choices:["can't you", "can you", "don't you"] },
  { cover:"tag_positive", tier:2, type:"grammar", open:true, clue:"Add the tag: 'The frogs were hiding, ___ ___?'",
    answer:"weren't they", choices:["weren't they", "were they", "didn't they"] },
  { cover:"tag_negative", tier:2, type:"grammar", open:true, clue:"Add the tag: 'The moth isn't poisonous, ___ ___?'",
    answer:"is it", choices:["is it", "isn't it", "does it"] },
  { cover:"tag_negative", tier:2, type:"grammar", open:true, clue:"Add the tag: 'We don't feed the animals here, ___ ___?'",
    answer:"do we", choices:["do we", "don't we", "are we"] },
  { cover:"tag_rule", tier:2, type:"grammar", open:true, clue:"A tag always ends with a pronoun. In 'The tigers are sleeping, ___ ___?' which pronoun goes in the tag?",
    answer:"they", choices:["they", "the tigers", "it"] },
  { cover:"tag_rule", tier:2, type:"grammar", open:true, clue:"The statement is 'It doesn't matter.' The tag must be positive. Which word must the tag start with?",
    answer:"does", choices:["does", "doesn't", "is"] },
  { cover:"compare_animals", tier:1, type:"function", open:true, clue:"An elephant weighs much more than a deer. Complete it: 'An elephant is ___ than a deer.'",
    answer:"heavier", choices:["heavier", "heavy", "as heavy"] },
  { cover:"compare_animals", tier:2, type:"function", open:true, clue:"You want to say one animal hides better than every other animal in the forest. Complete it: 'The chameleon is the ___ hider of all.'",
    answer:"best", choices:["best", "better", "as good"] },
  { cover:"imitation_talk", tier:2, type:"function", open:true, clue:"A caterpillar has a pattern that looks like a bird's mess on a leaf, so birds ignore it. The trick keeps the caterpillar ___.",
    answer:"safe", choices:["safe", "hungry", "noisy"] },
  { cover:"classification", tier:1, type:"function", open:true, clue:"Complete it: 'Bees, ants and beetles are all ___ of insect.'",
    answer:"types", choices:["types", "habitats", "predators"] },
  { cover:"classification", tier:2, type:"function", open:true, clue:"Complete it: 'Animals with fur that feed their babies milk all belong to the same ___.'",
    answer:"group", choices:["group", "habitat", "pattern"] },
  { cover:"dictionary_use", tier:2, type:"function", open:true, clue:"Your dictionary says: 'imitate (verb) — to copy the way something looks or sounds.' What kind of word is 'imitate'?",
    answer:"a verb", choices:["a verb", "a noun", "an adjective"] },
  { cover:"dictionary_use", tier:2, type:"function", open:true, clue:"Put these three words in dictionary order. Which comes first: wing, web, wasp?",
    answer:"wasp", choices:["wasp", "web", "wing"] },
  { cover:"scan_text", tier:1, type:"function", open:true, clue:"Scan this line: 'The tiger moth flies at night. It has six spots on each wing.' How many spots are on each wing?",
    answer:"six", choices:["six", "two", "eight"] },
  { cover:"scan_text", tier:2, type:"function", open:true, clue:"Scan this line: 'Mai feeds the rabbits every Sunday morning before school.' Which day does she feed them?",
    answer:"Sunday", choices:["Sunday", "Monday", "Saturday"] },
  // ---- v6.5: spot the error -----------------------------------------------
  // Question tags and as…as are both places where children produce almost the
  // right sentence and get one word wrong, so this format tests exactly the
  // failure they actually make.
  { cover:"tag_positive", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The frog is poisonous, isn't they?", answer:"they", fix:"it" },
  { cover:"tag_negative", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The beetles cannot swim, can't they?", answer:"can't", fix:"can" },
  { cover:"tag_rule", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"She feeds the birds, doesn't her?", answer:"her", fix:"she" },
  { cover:"as_as_equal", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"This lizard is as fast than that snake.", answer:"than", fix:"as" },
  { cover:"as_as_negative", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The baby bird is not as strong like its mother.", answer:"like", fix:"as" },
  { cover:"camouflage", tier:2, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The insect's camouflage makes it easy to see on the bark.",
    answer:"easy", fix:"hard" },
  { cover:"predator", tier:2, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The eagle is the prey and the mouse is the predator.",
    answer:"prey", fix:"predator (swap the two words round)" },
  { cover:"imitate", tier:2, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The harmless fly imitates a bee so that predators attack it.",
    answer:"attack", fix:"avoid" },

  // ---- v6.5: put it in order ----------------------------------------------
  { cover:"as_as_equal", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["This beetle", "is as heavy", "as that stone"] },
  { cover:"as_as_negative", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["A gecko", "is not as long", "as a python"] },
  { cover:"tag_positive", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["The moth", "is hiding", "isn't it"] },
  { cover:"tag_negative", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["Those frogs", "cannot climb", "can they"] },
  { cover:"describe_animals", tier:2, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["The spider", "has eight legs", "and two body parts"] },
  { cover:"compare_animals", tier:2, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["A cheetah", "runs faster", "than a lion"] },

  // ---- v6.5: odd one out --------------------------------------------------
  { cover:"insect", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are insects. Tap the one that is not.",
    answer:"a spider", choices:["an ant", "a bee", "a beetle", "a spider"] },
  { cover:"predator", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these hunt other animals. Tap the one that does not.",
    answer:"a rabbit", choices:["an owl", "a wolf", "a shark", "a rabbit"] },
  { cover:"camouflage", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these help an animal stay hidden. Tap the one that does not.",
    answer:"a loud call", choices:["stripes", "spots", "dull colours", "a loud call"] },
  { cover:"classification", tier:3, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are ways scientists sort animals. Tap the one that is not.",
    answer:"its nickname", choices:["what it eats", "where it lives", "how it moves", "its nickname"] },
  { cover:"poisonous", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these warn a predator to stay away. Tap the one that does not.",
    answer:"brown fur", choices:["bright colours", "a loud hiss", "a bad smell", "brown fur"] },
  { cover:"escape", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these help an animal get away. Tap the one that does not.",
    answer:"sleeping deeply", choices:["running fast", "jumping far", "swimming away", "sleeping deeply"] },
  { cover:"characteristic", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are characteristics of a bird. Tap the one that is not.",
    answer:"gills", choices:["feathers", "a beak", "wings", "gills"] },
  { cover:"scan_text", tier:3, type:"odd one out", format:"odd", open:false,
    clue:"Three of these help you find one fact quickly. Tap the one that does not.",
    answer:"reading every word", choices:["reading the headings", "looking for numbers", "using the index", "reading every word"] },
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

  // ------------------------------------------------------------------
  // v6.2: 32 more, taking every curriculum key from 3 questions to 6.
  //
  // Why: four classes played v6.0 in one day and the teacher sat through
  // near-identical question sequences four times. The picker prefers keys
  // not yet covered this run, so with only ~3.5 questions per key every
  // run opened almost the same way. More questions PER KEY is the fix -
  // not simply more questions.
  // ------------------------------------------------------------------
  { cover:"camouflage", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The tiger's stripes camouflages it in the long grass.'",
    answer:"'camouflages' should be 'camouflage'", choices:["'camouflages' should be 'camouflage'", "'stripes' should be 'stripe'", "'in' should be 'on'"] },
  { cover:"characteristic", tier:4, type:"grammar", open:true, clue:"Put the word in the plural: 'Six legs and two feelers are two ___ of an insect.'",
    answer:"characteristics", choices:["characteristics", "characteristic", "characteristic's"] },
  { cover:"copy", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The parrot copy the words that people say.'",
    answer:"'copy' should be 'copies'", choices:["'copy' should be 'copies'", "'words' should be 'word'", "'say' should be 'says'"] },
  { cover:"frighten", tier:4, type:"grammar", open:true, clue:"Finish it with the right form of 'frighten': 'A loud bang is very ___ for a small animal.'",
    answer:"frightening", choices:["frightening", "frighten", "frightens"] },
  { cover:"hide", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The rabbits hides in their hole when a fox comes near.'",
    answer:"'hides' should be 'hide'", choices:["'hides' should be 'hide'", "'in' should be 'on'", "'comes' should be 'coming'"] },
  { cover:"hunt", tier:4, type:"function", open:true, clue:"Fill the gap with a noun made from 'hunt': 'The tiger is a quiet and patient ___ .'",
    answer:"hunter", choices:["hunter", "hunting", "hunted"] },
  { cover:"imitate", tier:4, type:"apply", open:true, clue:"A young gibbon watches its mother swing between the branches, then does exactly the same. Give the ONE word for what the young gibbon is doing.",
    answer:"imitating", choices:["imitating", "hunting", "hiding"] },
  { cover:"insect", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'A insect has six legs and three body parts.'",
    answer:"'A' should be 'An'", choices:["'A' should be 'An'", "'six' should be 'sixth'", "'has' should be 'have'"] },
  { cover:"poisonous", tier:4, type:"grammar", open:true, clue:"Change 'poison' into the adjective: 'Do not touch that plant — it is ___ .'",
    answer:"poisonous", choices:["poisonous", "poison", "poisoned"] },
  { cover:"predator", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'A crocodile is a predator, so it hunt in the river.'",
    answer:"'hunt' should be 'hunts'", choices:["'hunt' should be 'hunts'", "'predator' should be 'prey'", "'a crocodile' should be 'the crocodile'"] },
  { cover:"prey", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'Small fish are the prey off larger fish.'",
    answer:"'off' should be 'of'", choices:["'off' should be 'of'", "'prey' should be 'preys'", "'are' should be 'is'"] },
  { cover:"resemble", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The baby owl resemble a ball of grey fur.'",
    answer:"'resemble' should be 'resembles'", choices:["'resemble' should be 'resembles'", "'a ball' should be 'ball'", "'grey' should be 'greyer'"] },
  { cover:"species", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'This bird is a rare specie from the mountains.'",
    answer:"'specie' should be 'species'", choices:["'specie' should be 'species'", "'rare' should be 'rarer'", "'a' should be 'an'"] },
  { cover:"spot", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The giraffe has big brown spot all over its neck.'",
    answer:"'spot' should be 'spots'", choices:["'spot' should be 'spots'", "'has' should be 'have'", "'big' should be 'bigger'"] },
  { cover:"stripe", tier:4, type:"grammar", open:true, clue:"Make it one word: a shirt that has stripes on it is a ___ shirt.",
    answer:"striped", choices:["striped", "stripes", "striping"] },
  { cover:"attack", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'The wasps attacked to the fruit on the table.'",
    answer:"'attacked to' should be 'attacked'", choices:["'attacked to' should be 'attacked'", "'attacked' should be 'attack'", "'the fruit' should be 'fruits'"] },
  { cover:"avoid", tier:4, type:"grammar", open:true, clue:"Finish it in the right form: 'My grandmother avoids ___ out in the rain without a coat.'",
    answer:"going", choices:["going", "to go", "go"] },
  { cover:"confuse", tier:4, type:"grammar", open:true, clue:"Finish it with the right form: 'The instructions were so ___ that nobody knew what to do.'",
    answer:"confusing", choices:["confusing", "confused", "confuse"] },
  { cover:"defend", tier:4, type:"function", open:true, clue:"Make it a noun: 'A turtle's hard shell is its best ___.'",
    answer:"defence", choices:["defence", "defend", "defender"] },
  { cover:"escape", tier:4, type:"grammar", open:true, clue:"Finish it: 'Look — the parrot has ___ from its cage!'",
    answer:"escaped", choices:["escaped", "escape", "escaping"] },
  { cover:"as_as_equal", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'A dolphin can swim as fast than a shark.'",
    answer:"'than' should be 'as'", choices:["'than' should be 'as'", "'as fast' should be 'as faster'", "'can swim' should be 'swims'"] },
  { cover:"as_as_negative", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'A rabbit does not run as fast a deer.'",
    answer:"'as fast a deer' should be 'as fast as a deer'", choices:["'as fast a deer' should be 'as fast as a deer'", "'does not run' should be 'not runs'", "'as fast' should be 'as faster'"] },
  { cover:"as_as_meaning", tier:4, type:"apply", open:true, clue:"Two lizards run at exactly the same speed. Complete it: 'This lizard runs ___ ___ ___ that one.'",
    answer:"as fast as", choices:["as fast as", "faster than", "as faster as"] },
  { cover:"tag_positive", tier:4, type:"grammar", open:true, clue:"Add the tag: 'Nam finished his poster yesterday, ___ ___?'",
    answer:"didn't he", choices:["didn't he", "doesn't he", "hasn't he"] },
  { cover:"tag_negative", tier:4, type:"grammar", open:true, clue:"Add the tag: 'Linh hasn't finished her drawing, ___ ___?'",
    answer:"has she", choices:["has she", "hasn't she", "does she"] },
  { cover:"tag_rule", tier:4, type:"fix it", open:false, clue:"The tag is wrong: 'The chameleon can change colour, can it?'",
    answer:"'can it' should be 'can't it'", choices:["'can it' should be 'can't it'", "'can it' should be 'does it'", "'can' should be 'could'"] },
  { cover:"describe_animals", tier:4, type:"fix it", open:false, clue:"One word makes this description wrong: 'The zebra is a black and white predator with stripes.'",
    answer:"'predator' should be 'animal'", choices:["'predator' should be 'animal'", "'stripes' should be 'spots'", "'black and white' should be 'brown'"] },
  { cover:"compare_animals", tier:4, type:"fix it", open:false, clue:"One part is wrong: 'A crocodile is more bigger than a lizard.'",
    answer:"'more bigger' should be 'bigger'", choices:["'more bigger' should be 'bigger'", "'bigger' should be 'big'", "'than' should be 'as'"] },
  { cover:"imitation_talk", tier:4, type:"reason", open:true, clue:"A bird sees a hoverfly with yellow and black wasp bands and flies away. Finish the reason: the bird believes the hoverfly can ___ it.",
    answer:"sting", choices:["sting", "feed", "imitate"] },
  { cover:"classification", tier:4, type:"apply", open:false, clue:"You are making a classification chart that sorts animals by how they move. Which is a good heading for one column?",
    answer:"Animals that fly", choices:["Animals that fly", "My favourite animal", "A very fast animal"] },
  { cover:"dictionary_use", tier:4, type:"apply", open:true, clue:"Your dictionary says: 'still (adjective) 1. not moving 2. quiet and calm'. In 'The lizard stayed still on the wall', which meaning is used — not moving, or quiet and calm?",
    answer:"not moving", choices:["not moving", "quiet and calm", "a kind of insect"] },
  { cover:"scan_text", tier:4, type:"apply", open:true, clue:"Scan this line: 'The green gecko sleeps in the daytime and hunts small insects after dark.' When does the gecko hunt?",
    answer:"after dark", choices:["after dark", "in the daytime", "early in the morning"] },
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
