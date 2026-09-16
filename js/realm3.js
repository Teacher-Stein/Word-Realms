// ===========================================================================
// REALM 3 — THE CONCERT CAVERNS
// Our World 5, Unit 3: Music.  Built September 2026 for the November review.
//
// This realm lives in its own file rather than in content.js, which is what
// registerRealm() was added for in v6.6: a typing mistake in here stops Realm 3
// loading and leaves the rest of the game running.
//
// WHERE THE CONTENT CAME FROM
//
// The school syllabus (Grade 5, 2026-27), High Standard and Gifted tabs. Those
// two carry identical Our World content; the Gifted tab adds a separate Oxford
// Grammar strand (present perfect continuous, used to, the past perfect, future
// forms, -ing vs the infinitive). That strand is deliberately NOT in here -
// elites and the boss appear on every map, so putting it in the elite bank
// would have asked high-standard classes about structures they have not been
// taught. Gifted classes are stretched the way Realms 1 and 2 stretch them:
// tier-4 elite questions that ask a student to USE the language rather than
// recognise it.
//
//   Vocabulary 1 (16 words): a note, a chord, a melody, beat, rhythm, a violin,
//     a drum, a piano, a flute, a saxophone, a guitar, a band, practice,
//     perform, a concert, a lead singer
//   Vocabulary 2 (5 words):  hip-hop, classical, pop, jazz, rock
//   Phonics /ɔ/:             rock, pop, hip-hop, concert
//   Grammar 1:               present perfect with ever and never
//   Grammar 2:               comparative adverbs
//
// All 21 syllabus words get a key of their own. None is merged or dropped.
//
// THE LAST THREE KEYS ARE DELIBERATE REVIEW.
//
// Stein's instruction for the rest of the year: carry the earlier units'
// grammar forward, but recast in the CURRENT unit's subject rather than bolted
// on. The three chosen here are the ones that genuinely belong in a music unit:
//
//   question tags     sit straight on top of the new present perfect -
//                     "You've never heard jazz, have you?" reviews Unit 2 and
//                     drills Unit 3 in one sentence
//   zero conditional  is how instruments work - "If you blow harder, the flute
//                     sounds higher"
//   going to          is how concerts work - "The band is going to play at
//                     eight"
//
// Unit 2's `as ... as` needs no key of its own: it reappears inside the
// comparative-adverb group, because "I play as well as my brother" is one of
// the unit's own target sentences.
//
// RULE 4. Not one line of Our World 5 is reproduced here. Every question was
// written from scratch to test the same curriculum item in different words.
// ===========================================================================


// ---------------------------------------------------------------------------
// 1. THE 32 CURRICULUM KEYS
//
// The `group` is what makes the teaching report worth reading months later: one
// weak row is noise, five weak rows that are all present perfect is Monday's
// lesson.
// ---------------------------------------------------------------------------
const REALM3_LABELS = {
  // ---- Vocabulary 1, the sound itself (5) ----
  "note":         { label: "a note",        group: "Making music" },
  "chord":        { label: "a chord",       group: "Making music" },
  "melody":       { label: "a melody",      group: "Making music" },
  "beat":         { label: "beat",          group: "Making music" },
  "rhythm":       { label: "rhythm",        group: "Making music" },

  // ---- Vocabulary 1, playing it in front of people (5) ----
  "practice":     { label: "practice",      group: "Playing and performing" },
  "perform":      { label: "perform",       group: "Playing and performing" },
  "concert":      { label: "a concert",     group: "Playing and performing" },
  "band":         { label: "a band",        group: "Playing and performing" },
  "lead_singer":  { label: "a lead singer", group: "Playing and performing" },

  // ---- Vocabulary 1, the instruments (6) ----
  "violin":       { label: "a violin",      group: "Instruments" },
  "drum":         { label: "a drum",        group: "Instruments" },
  "piano":        { label: "a piano",       group: "Instruments" },
  "flute":        { label: "a flute",       group: "Instruments" },
  "saxophone":    { label: "a saxophone",   group: "Instruments" },
  "guitar":       { label: "a guitar",      group: "Instruments" },

  // ---- Vocabulary 2, the genres (5) ----
  "hip_hop":      { label: "hip-hop",       group: "Music genres" },
  "classical":    { label: "classical",     group: "Music genres" },
  "pop":          { label: "pop",           group: "Music genres" },
  "jazz":         { label: "jazz",          group: "Music genres" },
  "rock":         { label: "rock",          group: "Music genres" },

  // ---- Phonics (2) ----
  // Realm 1 had a contrasting PAIR of sounds (/θ/ against /ð/), which is what
  // made "which one is it?" questions work six times over. Unit 3 gives one
  // sound, so the second key is built out of near misses instead - words that
  // look as though they hold the sound and do not. Without that, the group runs
  // out of anything to ask by the fourth question.
  "phonics-o":     { label: "the /ɔ/ sound — “rock”",        group: "Sounds: the short o" },
  "phonics-o-not": { label: "/ɔ/ or not — listening closely", group: "Sounds: the short o" },

  // ---- Grammar 1 (3) ----
  "pp-question":   { label: "present perfect — “Have you ever …?”",   group: "Present perfect: ever & never" },
  "pp-answer":     { label: "present perfect — answering with never", group: "Present perfect: ever & never" },
  "pp-participle": { label: "present perfect — the past participle",  group: "Present perfect: ever & never" },

  // ---- Grammar 2 (3) ----
  "adv-more":      { label: "comparative adverbs — “more … than”",        group: "Comparative adverbs" },
  "adv-irregular": { label: "comparative adverbs — better and worse",     group: "Comparative adverbs" },
  "adv-equal":     { label: "comparative adverbs — “as well as”, “less often than”", group: "Comparative adverbs" },

  // ---- Carried forward from earlier units (3) ----
  "review-going-to":    { label: "“going to” — plans (Unit 1)",  group: "Review from earlier units" },
  "review-conditional": { label: "zero conditional (Unit 1)",    group: "Review from earlier units" },
  "review-tags":        { label: "question tags (Unit 2)",       group: "Review from earlier units" },
};

Object.assign(COVER_LABELS, REALM3_LABELS);


// ---------------------------------------------------------------------------
// 2. THE STANDARD QUESTION BANK — what monsters ask.
//    Six per key across 32 keys. Six is not fussiness: at three per key, four
//    classes in one day see nearly the same questions, because the game works
//    through untested keys first.
// ---------------------------------------------------------------------------
const REALM3_QUESTIONS = [

// ===================== VOCABULARY 1: making music =========================
  // ---- note ----
  { cover:"note", tier:2, type:"vocab", open:true,
    clue:"In music this is one single sound - one mark on the page, one key on the piano.",
    answer:"a note", choices:["a note","a chord","a melody"] },
  { cover:"note", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'She pressed one key on the piano and played ___ .'",
    answer:"a note", choices:["a note","a chord","a band"] },
  { cover:"note", tier:1, type:"reason", open:false,
    clue:"Which of these is only ONE sound, and not several sounds?",
    answer:"a note", choices:["a note","a chord","a melody"] },
  { cover:"note", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"A melody is made of many note played one after another.", answer:"note", fix:"notes" },
  { cover:"note", tier:2, type:"reason", open:false,
    clue:"Which sentence about a note is TRUE?",
    answer:"A note is one single sound.",
    choices:["A note is one single sound.","A note is a group of musicians.","A note is the steady count you clap."] },
  { cover:"note", tier:3, type:"reason", open:true,
    clue:"A melody is made of many of these, played one after another. What is each single one called?",
    answer:"a note", choices:["a note","a chord","a concert"] },

  // ---- chord ----
  { cover:"chord", tier:2, type:"vocab", open:true,
    clue:"Three or more notes played together at exactly the same moment.",
    answer:"a chord", choices:["a chord","a note","a melody"] },
  { cover:"chord", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'He held three guitar strings down at once and played ___ .'",
    answer:"a chord", choices:["a chord","a note","a concert"] },
  { cover:"chord", tier:2, type:"reason", open:true,
    clue:"You press three piano keys down at the same time. What do you hear?",
    answer:"a chord", choices:["a chord","a note","a band"] },
  { cover:"chord", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Three notes played together at the same time make a melody.", answer:"melody", fix:"chord" },
  { cover:"chord", tier:1, type:"reason", open:false,
    clue:"Which sentence about a chord is TRUE?",
    answer:"You play a chord when several notes sound together.",
    choices:["You play a chord when several notes sound together.","You clap a chord to keep the music steady.","A chord is the person who sings at the front."] },
  { cover:"chord", tier:3, type:"reason", open:true,
    clue:"One singer cannot sing this alone, because it needs more than one sound at the same time.",
    answer:"a chord", choices:["a chord","a note","a melody"] },

  // ---- melody ----
  { cover:"melody", tier:1, type:"vocab", open:false,
    clue:"Which word means the tune of a song - the part you hum when you forget the words?",
    answer:"a melody", choices:["a melody","a chord","a band"] },
  { cover:"melody", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'I forgot the words, but I can still hum ___ from that song.'",
    answer:"a melody", choices:["a melody","a chord","a concert"] },
  { cover:"melody", tier:2, type:"reason", open:true,
    clue:"Notes played one after another make a line of music that you can sing back. What is it called?",
    answer:"a melody", choices:["a melody","a chord","rhythm"] },
  { cover:"melody", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["The melody","of that old song","stayed","in my head"] },
  { cover:"melody", tier:2, type:"reason", open:false,
    clue:"Which sentence about a melody is TRUE?",
    answer:"A melody is notes played one after another.",
    choices:["A melody is notes played one after another.","A melody is notes played all at the same moment.","A melody is the steady count you tap with your foot."] },
  { cover:"melody", tier:3, type:"reason", open:false,
    clue:"Why can you hum a melody, but you cannot hum a chord?",
    answer:"A melody is one note after another; a chord is notes at the same time.",
    choices:["A melody is one note after another; a chord is notes at the same time.","A melody is always louder than a chord.","A melody can only be played on a piano."] },

  // ---- beat ----
  { cover:"beat", tier:2, type:"vocab", open:true,
    clue:"Steady, always the same, and you clap along one-two-three-four. It is not the pattern of long and short sounds.",
    answer:"beat", choices:["beat","rhythm","a melody"] },
  { cover:"beat", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'Tap your foot with the steady ___ : one, two, three, four.'",
    answer:"beat", choices:["beat","rhythm","words"] },
  { cover:"beat", tier:2, type:"reason", open:true,
    clue:"Complete it: 'The song starts slowly, then the ___ gets faster and everybody dances.'",
    answer:"beat", choices:["beat","a melody","a lead singer"] },
  { cover:"beat", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are people or events. Tap the one that is the steady sound you clap.",
    answer:"beat", choices:["a band","a lead singer","a concert","beat"] },
  { cover:"beat", tier:3, type:"reason", open:false,
    clue:"Which sentence is TRUE about the beat?",
    answer:"The beat is steady and you can count it.",
    choices:["The beat is steady and you can count it.","The beat is the pattern of long and short sounds.","The beat is the tune that you hum."] },
  { cover:"beat", tier:2, type:"reason", open:false,
    clue:"Why does a band listen to the drums while they play?",
    answer:"To keep the same steady beat.",
    choices:["To keep the same steady beat.","To learn the words of the song.","To buy tickets for the concert."] },

  // ---- rhythm ----
  { cover:"rhythm", tier:2, type:"vocab", open:true,
    clue:"Some sounds are long and some are short, and that pattern is this. The steady count under it is the beat.",
    answer:"rhythm", choices:["rhythm","beat","a chord"] },
  { cover:"rhythm", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'The dancers moved with the ___ of long and short drum sounds.'",
    answer:"rhythm", choices:["rhythm","beat","a band"] },
  { cover:"rhythm", tier:3, type:"reason", open:false,
    clue:"Which sentence is TRUE about rhythm?",
    answer:"Rhythm is the pattern of long and short sounds.",
    choices:["Rhythm is the pattern of long and short sounds.","Rhythm is the steady count that you clap.","Rhythm is a group of musicians on a stage."] },
  { cover:"rhythm", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Clap the beat of long and short sounds that the drum is playing.", answer:"beat", fix:"rhythm" },
  { cover:"rhythm", tier:3, type:"reason", open:true,
    clue:"Two songs have the same steady beat, but their long and short sounds are different. What is different?",
    answer:"rhythm", choices:["rhythm","beat","a concert"] },
  { cover:"rhythm", tier:2, type:"vocab", open:true,
    clue:"Which word describes clapping short, short, long - short, short, long?",
    answer:"rhythm", choices:["rhythm","beat","a note"] },

  // ---- practice ----
  { cover:"practice", tier:2, type:"vocab", open:true,
    clue:"Doing something again and again so that you get better at it. Musicians do this every day at home.",
    answer:"practice", choices:["practice","perform","a concert"] },
  { cover:"practice", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'Band ___ starts at four o'clock in the music room.'",
    answer:"practice", choices:["practice","perform","rhythm"] },
  { cover:"practice", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'She will ___ this song every day until she can play it perfectly.'",
    answer:"practice", choices:["practice","perform","forget"] },
  { cover:"practice", tier:2, type:"reason", open:false,
    clue:"Why does a band practice before a concert?",
    answer:"So they can play the songs well.",
    choices:["So they can play the songs well.","So the concert can finish faster.","So the tickets can cost more."] },
  { cover:"practice", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["We practice","the new song","in the music room","every Tuesday"] },
  { cover:"practice", tier:3, type:"grammar", open:false,
    clue:"Which sentence is correct?",
    answer:"I practice the violin every morning.",
    choices:["I practice the violin every morning.","I practice the violin yesterday morning.","I am practice the violin every morning."] },

  // ---- perform ----
  { cover:"perform", tier:2, type:"vocab", open:true,
    clue:"This verb means to play or sing in front of an audience.",
    answer:"perform", choices:["perform","practice","a concert"] },
  { cover:"perform", tier:2, type:"vocab", open:false,
    clue:"Complete it: 'Our class will ___ two songs for the parents on Friday.'",
    answer:"perform", choices:["perform","practice","listen"] },
  { cover:"perform", tier:2, type:"reason", open:true,
    clue:"Musicians practice at home. What do they do on the stage, with an audience watching?",
    answer:"perform", choices:["perform","practice","rhythm"] },
  { cover:"perform", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"The band will practice three songs on the stage in front of the whole school.", answer:"practice", fix:"perform" },
  { cover:"perform", tier:2, type:"reason", open:false,
    clue:"Which sentence is TRUE?",
    answer:"Musicians perform when an audience is watching and listening.",
    choices:["Musicians perform when an audience is watching and listening.","Musicians perform alone at home to get better.","Musicians perform by writing notes on paper."] },
  { cover:"perform", tier:3, type:"vocab", open:true,
    clue:"Complete it: 'After months of practice, the young pianist was finally ready to ___ .'",
    answer:"perform", choices:["perform","practice","forget"] },

  // ---- concert ----
  { cover:"concert", tier:1, type:"vocab", open:false,
    clue:"Which word means an event where people buy tickets and listen to musicians play?",
    answer:"a concert", choices:["a concert","a band","practice"] },
  { cover:"concert", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'We went to ___ at the theater and heard our favorite band play.'",
    answer:"a concert", choices:["a concert","a melody","a note"] },
  { cover:"concert", tier:2, type:"reason", open:false,
    clue:"Which sentence about a concert is TRUE?",
    answer:"A concert is an event where musicians play for an audience.",
    choices:["A concert is an event where musicians play for an audience.","A concert is one single sound in music.","A concert is the pattern of long and short sounds."] },
  { cover:"concert", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["The concert","starts","on Saturday evening","at seven o'clock"] },
  { cover:"concert", tier:2, type:"reason", open:false,
    clue:"Which of these is an EVENT, and not a person or a sound?",
    answer:"a concert", choices:["a concert","a lead singer","a note"] },
  { cover:"concert", tier:3, type:"reason", open:true,
    clue:"The band practiced all week. On Saturday they played for five hundred people. What was Saturday?",
    answer:"a concert", choices:["a concert","practice","rhythm"] },

  // ---- band ----
  { cover:"band", tier:1, type:"vocab", open:false,
    clue:"Four friends play guitar, drums and keyboard together and sing rock songs. What are they?",
    answer:"a band", choices:["a band","a concert","a melody"] },
  { cover:"band", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'My brother plays the drums in ___ with three of his friends.'",
    answer:"a band", choices:["a band","a melody","a note"] },
  { cover:"band", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are sounds in music. Tap the one that is a group of people.",
    answer:"a band", choices:["a note","a chord","a melody","a band"] },
  { cover:"band", tier:2, type:"reason", open:false,
    clue:"Which sentence about a band is TRUE?",
    answer:"A band is a group of musicians who play together.",
    choices:["A band is a group of musicians who play together.","A band is the steady count that you clap.","A band is one sound on a piano."] },
  { cover:"band", tier:3, type:"reason", open:false,
    clue:"Why do the people in a band practice together and not only at home?",
    answer:"So they can play at the same time as each other.",
    choices:["So they can play at the same time as each other.","So each one can play a different song.","So they do not need to buy tickets."] },
  { cover:"band", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'Five musicians formed ___ and played their first concert in June.'",
    answer:"a band", choices:["a band","a chord","practice"] },

  // ---- lead_singer ----
  { cover:"lead_singer", tier:1, type:"vocab", open:false,
    clue:"In a band, this person stands at the front and sings the main part of the songs.",
    answer:"a lead singer", choices:["a lead singer","a band","a melody"] },
  { cover:"lead_singer", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'Mai is ___ in a rock band, and her brother plays the drums.'",
    answer:"a lead singer", choices:["a lead singer","a concert","a chord"] },
  { cover:"lead_singer", tier:2, type:"reason", open:false,
    clue:"Which sentence about a lead singer is TRUE?",
    answer:"A lead singer sings the main part at the front of a band.",
    choices:["A lead singer sings the main part at the front of a band.","A lead singer is a pattern of long and short sounds.","A lead singer is an event with tickets."] },
  { cover:"lead_singer", tier:2, type:"vocab", open:true,
    clue:"The guitar player and the drummer are in the band too. Who sings the main part?",
    answer:"a lead singer", choices:["a lead singer","a band","a concert"] },
  { cover:"lead_singer", tier:3, type:"reason", open:false,
    clue:"Why does a band with five musicians usually have only one lead singer?",
    answer:"Because one person sings the main part at the front.",
    choices:["Because one person sings the main part at the front.","Because a band can have only five people.","Because a lead singer must play the drums."] },
  { cover:"lead_singer", tier:2, type:"vocab", open:true,
    clue:"Complete it: 'The band needs ___ , because nobody in the group wants to sing.'",
    answer:"a lead singer", choices:["a lead singer","a concert","rhythm"] },

// ===================== VOCABULARY 1: the instruments ======================
  // ---- violin ----
  { cover:"violin", tier:1, type:"vocab", open:true,
    clue:"The small wooden instrument with strings that you hold under your chin and play with a bow.",
    answer:"a violin", choices:["a violin","a guitar","a drum"] },
  { cover:"violin", tier:2, type:"reason", open:false,
    clue:"Which sentence is true about a violin?",
    answer:"You move a bow across its strings to make a sound.",
    choices:["You move a bow across its strings to make a sound.","You blow into it and press small metal keys.","You hit it with two wooden sticks."] },
  { cover:"violin", tier:2, type:"vocab", open:true,
    clue:"Every evening Huong takes out her bow and plays for her grandmother. What is she playing?",
    answer:"a violin", choices:["a violin","a drum","a piano"] },
  { cover:"violin", tier:2, type:"reason", open:true,
    clue:"Which family of instruments does a violin belong to?",
    answer:"strings", choices:["strings","percussion","keyboard"] },
  { cover:"violin", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Lan play the violin every Saturday morning.", answer:"play", fix:"plays" },
  { cover:"violin", tier:2, type:"reason", open:false,
    clue:"Which group of musicians always has violins in it?",
    answer:"an orchestra", choices:["an orchestra","a rock band","a jazz band"] },

  // ---- drum ----
  { cover:"drum", tier:1, type:"vocab", open:true,
    clue:"The round instrument you play by hitting it with sticks or with your hands.",
    answer:"a drum", choices:["a drum","a flute","a violin"] },
  { cover:"drum", tier:2, type:"vocab", open:true,
    clue:"The song has a strong beat because Hung is hitting ___ at the back of the band.",
    answer:"a drum", choices:["a drum","a piano","a flute"] },
  { cover:"drum", tier:1, type:"vocab", open:false,
    clue:"Which of these instruments belongs to the percussion family?",
    answer:"a drum", choices:["a drum","a flute","a violin"] },
  { cover:"drum", tier:2, type:"reason", open:false,
    clue:"Why does a rock band need a drum?",
    answer:"It keeps the beat, so everyone plays at the same speed.",
    choices:["It keeps the beat, so everyone plays at the same speed.","It plays the highest notes in the song.","It is the only instrument with strings."] },
  { cover:"drum", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these have strings. Tap the one that does not.",
    answer:"a drum", choices:["a violin","a guitar","a harp","a drum"] },
  { cover:"drum", tier:3, type:"grammar", open:false,
    clue:"Which sentence is correct?",
    answer:"He has played the drum since he was six.",
    choices:["He has played the drum since he was six.","He is playing the drum since he was six.","He play the drum since he was six."] },

  // ---- piano ----
  { cover:"piano", tier:1, type:"vocab", open:false,
    clue:"Which instrument has black and white keys that you press with your fingers?",
    answer:"a piano", choices:["a piano","a guitar","a drum"] },
  { cover:"piano", tier:2, type:"vocab", open:true,
    clue:"Mai sits down, lifts the lid and presses the white keys. What is she playing?",
    answer:"a piano", choices:["a piano","a flute","a violin"] },
  { cover:"piano", tier:1, type:"vocab", open:false,
    clue:"Which of these instruments belongs to the keyboard family?",
    answer:"a piano", choices:["a piano","a saxophone","a drum"] },
  { cover:"piano", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["My brother","has played","the piano","for three years"] },
  { cover:"piano", tier:2, type:"reason", open:false,
    clue:"Why can a piano play many notes at the same time?",
    answer:"Because you can press several keys together with your ten fingers.",
    choices:["Because you can press several keys together with your ten fingers.","Because it has only one long string inside it.","Because you blow into two holes at the same time."] },
  { cover:"piano", tier:2, type:"reason", open:false,
    clue:"Which of these can a piano do?",
    answer:"Make a sound when you press its keys.",
    choices:["Make a sound when you press its keys.","Make a sound when you blow air into it.","Make a sound when you pull a bow across it."] },

  // ---- flute ----
  { cover:"flute", tier:1, type:"vocab", open:true,
    clue:"The long thin instrument you hold sideways and blow across a small hole near one end.",
    answer:"a flute", choices:["a flute","a saxophone","a guitar"] },
  { cover:"flute", tier:2, type:"vocab", open:true,
    clue:"You hold this instrument sideways and blow across a hole near one end. What is it?",
    answer:"a flute", choices:["a flute","a guitar","a drum"] },
  { cover:"flute", tier:1, type:"vocab", open:false,
    clue:"Which of these instruments belongs to the wind family?",
    answer:"a flute", choices:["a flute","a violin","a drum"] },
  { cover:"flute", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["Lan","plays the flute","in the school band on Friday","every week"] },
  { cover:"flute", tier:2, type:"reason", open:false,
    clue:"In which group of musicians would you most often hear a flute?",
    answer:"an orchestra", choices:["an orchestra","a rock band","a sports team"] },
  { cover:"flute", tier:2, type:"reason", open:false,
    clue:"Which sentence describes a flute?",
    answer:"You blow across a hole in the side, and it has no strings.",
    choices:["You blow across a hole in the side, and it has no strings.","It is made of wood and it has four strings.","It is round and you hit it with your hands."] },

  // ---- saxophone ----
  { cover:"saxophone", tier:1, type:"vocab", open:true,
    clue:"The curved brass instrument you blow through a reed mouthpiece, often heard in jazz.",
    answer:"a saxophone", choices:["a saxophone","a flute","a violin"] },
  { cover:"saxophone", tier:2, type:"vocab", open:true,
    clue:"In the jazz band, Nam stands at the front and blows into ___.",
    answer:"a saxophone", choices:["a saxophone","a piano","a drum"] },
  { cover:"saxophone", tier:2, type:"vocab", open:true,
    clue:"Which brass instrument is curved like the letter J, with small keys you press while you blow?",
    answer:"a saxophone", choices:["a saxophone","a violin","a drum"] },
  { cover:"saxophone", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these belong to the string family. Tap the one you play by blowing.",
    answer:"a saxophone", choices:["a violin","a guitar","a cello","a saxophone"] },
  { cover:"saxophone", tier:3, type:"grammar", open:false,
    clue:"Which sentence is correct?",
    answer:"She has played the saxophone for two years.",
    choices:["She has played the saxophone for two years.","She is playing the saxophone since two years.","She plays the saxophone for two years ago."] },
  { cover:"saxophone", tier:2, type:"reason", open:false,
    clue:"Why do jazz bands often use a saxophone?",
    answer:"Because it can play long, smooth notes that sound warm.",
    choices:["Because it can play long, smooth notes that sound warm.","Because it keeps the beat with two wooden sticks.","Because it has six strings that you can strum."] },

  // ---- guitar ----
  { cover:"guitar", tier:1, type:"vocab", open:true,
    clue:"The wooden instrument with six strings that you strum or pluck with your fingers.",
    answer:"a guitar", choices:["a guitar","a violin","a piano"] },
  { cover:"guitar", tier:2, type:"vocab", open:true,
    clue:"At the concert Minh strummed six strings and the crowd cheered. What was he playing?",
    answer:"a guitar", choices:["a guitar","a flute","a piano"] },
  { cover:"guitar", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"My brother's guitar has six string.", answer:"string", fix:"strings" },
  { cover:"guitar", tier:1, type:"vocab", open:true,
    clue:"A wooden instrument with strings, but you strum it with your fingers instead of using a bow.",
    answer:"a guitar", choices:["a guitar","a drum","a flute"] },
  { cover:"guitar", tier:2, type:"reason", open:false,
    clue:"Why can a guitar play many different notes?",
    answer:"Because you press the strings in different places while you pluck them.",
    choices:["Because you press the strings in different places while you pluck them.","Because it has black and white keys under the strings.","Because you blow harder or softer into the hole."] },
  { cover:"guitar", tier:2, type:"reason", open:false,
    clue:"Which instrument would you most likely see a rock band playing on stage?",
    answer:"a guitar", choices:["a guitar","a violin","a flute"] },

// ============== VOCABULARY 2: genres, and the /ɔ/ sound ===================
  // ---- hip_hop ----
  { cover:"hip_hop", tier:1, type:"vocab", open:false,
    clue:"Which kind of music has words that are spoken quickly over a strong beat, not sung?",
    answer:"hip-hop", choices:["hip-hop","classical","jazz"] },
  { cover:"hip_hop", tier:2, type:"reason", open:false,
    clue:"Tam writes rhymes and speaks them over a beat he made on his computer. What kind of music is that?",
    answer:"hip-hop", choices:["hip-hop","classical","jazz"] },
  { cover:"hip_hop", tier:2, type:"vocab", open:false,
    clue:"Which is TRUE about hip-hop?",
    answer:"The words are spoken in time with the beat.", choices:["The words are spoken in time with the beat.","It is always played by a large orchestra.","It has no beat and no words at all."] },
  { cover:"hip_hop", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these belong with hip-hop. Tap the one that does not.",
    answer:"an orchestra", choices:["a strong beat","rhymes","spoken words","an orchestra"] },
  { cover:"hip_hop", tier:2, type:"vocab", open:false,
    clue:"Complete it: 'My cousin can ___ very fast — he never sings, he only speaks the words.'",
    answer:"rap", choices:["rap","hum","whistle"] },
  { cover:"hip_hop", tier:2, type:"reason", open:false,
    clue:"In hip-hop, which matters most to the listener?",
    answer:"the words and the beat", choices:["the words and the beat","the sixty violins","the quiet piano"] },

  // ---- classical ----
  { cover:"classical", tier:1, type:"vocab", open:true,
    clue:"Name the kind of music you hear when a large orchestra of violins plays music written hundreds of years ago.",
    answer:"classical", choices:["classical","hip-hop","rock"] },
  { cover:"classical", tier:2, type:"reason", open:false,
    clue:"Mai's uncle plays the violin in an orchestra of sixty musicians. What kind of music does he play?",
    answer:"classical", choices:["classical","hip-hop","pop"] },
  { cover:"classical", tier:2, type:"vocab", open:false,
    clue:"Which instrument would you expect in classical music but NOT in hip-hop?",
    answer:"a violin", choices:["a violin","a microphone","a computer"] },
  { cover:"classical", tier:2, type:"vocab", open:false,
    clue:"Which is TRUE about classical music?",
    answer:"Most of it was written hundreds of years ago.", choices:["Most of it was written hundreds of years ago.","It is always sung by one singer with a guitar.","Its words are always spoken, never sung."] },
  { cover:"classical", tier:3, type:"order", format:"order", open:false,
    clue:"Put the question in the right order.",
    parts:["Have you ever","been to","a classical concert","before?"] },
  { cover:"classical", tier:2, type:"vocab", open:false,
    clue:"Which list contains ONLY things you would find in a classical orchestra?",
    answer:"violins, flutes and drums", choices:["violins, flutes and drums","violins, computers and drums","guitars, flutes and computers"] },

  // ---- pop ----
  { cover:"pop", tier:1, type:"vocab", open:false,
    clue:"Which kind of music is short for 'popular music' — short, catchy songs that everybody knows?",
    answer:"pop", choices:["pop","jazz","classical"] },
  { cover:"pop", tier:2, type:"reason", open:false,
    clue:"Every song in the shop is short and catchy, and the shoppers sing along. What kind of music is it?",
    answer:"pop", choices:["pop","classical","jazz"] },
  { cover:"pop", tier:2, type:"vocab", open:false,
    clue:"Nam likes loud electric guitars and heavy drums. His sister likes short songs everybody knows. What does his sister like?",
    answer:"pop", choices:["pop","rock","classical"] },
  { cover:"pop", tier:2, type:"vocab", open:false,
    clue:"Which is TRUE about pop music?",
    answer:"It is made to be liked by as many people as possible.", choices:["It is made to be liked by as many people as possible.","It is always played by an orchestra with no singer.","Its words are always spoken, never sung."] },
  { cover:"pop", tier:1, type:"reason", open:false,
    clue:"Why is this kind of music called 'pop'?",
    answer:"because it is popular with a lot of people", choices:["because it is popular with a lot of people","because the singers pop balloons on the stage","because it must always be played quietly"] },
  { cover:"pop", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Do you like listen to pop music on the radio?", answer:"listen", fix:"listening" },

  // ---- jazz ----
  { cover:"jazz", tier:1, type:"vocab", open:true,
    clue:"Name the kind of music where the musicians improvise — they make up new notes while they are playing.",
    answer:"jazz", choices:["jazz","classical","pop"] },
  { cover:"jazz", tier:1, type:"vocab", open:false,
    clue:"Which instrument is most famous in jazz?",
    answer:"a saxophone", choices:["a saxophone","a violin","a computer"] },
  { cover:"jazz", tier:2, type:"reason", open:false,
    clue:"The band plays the same song differently every night, because each musician invents new notes. What kind of music is it?",
    answer:"jazz", choices:["jazz","classical","hip-hop"] },
  { cover:"jazz", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are kinds of music. Tap the one that is not.",
    answer:"a concert", choices:["jazz","rock","pop","a concert"] },
  { cover:"jazz", tier:2, type:"vocab", open:false,
    clue:"Which is TRUE about jazz?",
    answer:"Musicians often make up new notes while they play.", choices:["Musicians often make up new notes while they play.","Every musician plays exactly the same notes every night.","Nobody uses an instrument, only voices."] },
  { cover:"jazz", tier:3, type:"reason", open:false,
    clue:"In classical music every note is written down first. What is different about jazz?",
    answer:"the musicians often invent notes as they play", choices:["the musicians often invent notes as they play","the musicians never use any instruments","the musicians only speak the words"] },

  // ---- rock ----
  { cover:"rock", tier:1, type:"vocab", open:false,
    clue:"Which kind of music is famous for loud electric guitars and heavy drums?",
    answer:"rock", choices:["rock","classical","jazz"] },
  { cover:"rock", tier:2, type:"reason", open:false,
    clue:"The guitars are so loud that the floor shakes and the whole crowd jumps. What kind of music is the band playing?",
    answer:"rock", choices:["rock","classical","jazz"] },
  { cover:"rock", tier:2, type:"vocab", open:false,
    clue:"Which instrument would you expect to hear LOUDEST in rock music?",
    answer:"an electric guitar", choices:["an electric guitar","a violin","a flute"] },
  { cover:"rock", tier:2, type:"vocab", open:false,
    clue:"Which is TRUE about rock music?",
    answer:"It is usually played by a band with guitars and drums.", choices:["It is usually played by a band with guitars and drums.","It is usually played by an orchestra of eighty musicians.","Its words are usually spoken quickly, never sung."] },
  { cover:"rock", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Rock music are louder than classical music.", answer:"are", fix:"is" },
  { cover:"rock", tier:2, type:"vocab", open:false,
    clue:"Which list contains ONLY kinds of music?",
    answer:"rock, jazz and pop", choices:["rock, jazz and pop","rock, jazz and a guitar","rock, a concert and a drum"] },

  // ---- phonics-o ----
  { cover:"phonics-o", tier:1, type:"phonics", open:false,
    clue:"Say them out loud. Which word has the SAME vowel sound as 'rock'?",
    answer:"pop", choices:["pop","note","phone"] },
  { cover:"phonics-o", tier:2, type:"phonics", open:false,
    clue:"Which word has the same short o sound as 'pop'?",
    answer:"stop", choices:["stop","home","music"] },
  { cover:"phonics-o", tier:2, type:"phonics", open:false,
    clue:"Say them out loud. Which word does NOT have the short o sound?",
    answer:"phone", choices:["phone","clock","drop"] },
  { cover:"phonics-o", tier:2, type:"phonics", open:false,
    clue:"Which word rhymes with 'rock'?",
    answer:"clock", choices:["clock","rope","rain"] },
  { cover:"phonics-o", tier:2, type:"phonics", open:false,
    clue:"In the word 'hip-hop', which part holds the short o sound?",
    answer:"the 'hop' part", choices:["the 'hop' part","the 'hip' part","both parts"] },
  { cover:"phonics-o", tier:3, type:"phonics", open:false,
    clue:"Which pair of words BOTH have the short o sound?",
    answer:"box and top", choices:["box and top","box and note","phone and top"] },

  // ---- phonics-o-not ----
  { cover:"phonics-o-not", tier:2, type:"phonics", open:false,
    clue:"The letter o can trick you. Which word does NOT have the short o sound of 'rock'?",
    answer:"note", choices:["note","shop","stop"] },
  { cover:"phonics-o-not", tier:2, type:"phonics", open:false,
    clue:"The spelling looks right, but listen carefully. Which word does NOT have the short o sound of 'pop'?",
    answer:"piano", choices:["piano","drop","clock"] },
  { cover:"phonics-o-not", tier:2, type:"phonics", open:false,
    clue:"All three are written with the letter o. Which one does NOT sound like the o in 'hop'?",
    answer:"phone", choices:["phone","top","shop"] },
  { cover:"phonics-o-not", tier:2, type:"phonics", open:false,
    clue:"All three are written with the letter o, but only one sounds like 'rock'. Which one?",
    answer:"shop", choices:["shop","world","who"] },
  { cover:"phonics-o-not", tier:3, type:"odd one out", format:"odd", open:false,
    clue:"Three of these have the short o sound of 'rock'. The spelling will trick you — tap the one that does not.",
    answer:"work", choices:["pop","clock","top","work"] },
  { cover:"phonics-o-not", tier:3, type:"phonics", open:false,
    clue:"Nam reads 'note' in his music book and says it sounds just like 'not'. Is he right?",
    answer:"No — 'not' has the short o and 'note' does not.", choices:["No — 'not' has the short o and 'note' does not.","Yes — the two words sound exactly the same.","Yes — the letter o always makes one sound."] },

// ========== GRAMMAR 1 & 2: present perfect, comparative adverbs ===========
  // ---- pp-question ----
  { cover:"pp-question", tier:2, type:"grammar", open:false,
    clue:"Complete this question in the present perfect: '___ you ever played the piano on a stage?'",
    answer:"Have", choices:["Have","Did","Do"] },
  { cover:"pp-question", tier:3, type:"order", format:"order", open:false,
    clue:"Put the question in the right order.",
    parts:["Have you","ever","heard","a saxophone?"] },
  { cover:"pp-question", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Has your brother ever play in a rock band?", answer:"play", fix:"played" },
  { cover:"pp-question", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'Has your brother ever ___ in a band?'",
    answer:"played", choices:["played","play","playing"] },
  { cover:"pp-question", tier:1, type:"grammar", open:false,
    clue:"Which word means 'at any time in your whole life' in a present perfect question?",
    answer:"ever", choices:["ever","never","yet"] },
  { cover:"pp-question", tier:3, type:"grammar", open:false,
    clue:"Nam wants to ask Mai about her whole life so far. Which question is correct?",
    answer:"Have you ever sung in a concert?", choices:["Have you ever sung in a concert?","Have you sung ever in a concert?","You have ever sung in a concert?"] },

  // ---- pp-answer ----
  { cover:"pp-answer", tier:1, type:"grammar", open:false,
    clue:"Your teacher asks: 'Have you ever played the guitar?' You have. How do you answer?",
    answer:"Yes, I have.", choices:["Yes, I have.","Yes, I did.","Yes, I do."] },
  { cover:"pp-answer", tier:2, type:"grammar", open:false,
    clue:"A friend asks: 'Have you ever been to a jazz concert?' You have not. How do you answer?",
    answer:"No, I haven't.", choices:["No, I haven't.","No, I didn't.","No, I don't."] },
  { cover:"pp-answer", tier:2, type:"grammar", open:false,
    clue:"Somebody asks: 'Has your brother ever played the drums?' He has not. Answer for him.",
    answer:"No, he hasn't.", choices:["No, he hasn't.","No, he didn't.","No, he doesn't."] },
  { cover:"pp-answer", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"Have you ever heard hip-hop? Yes, I did.", answer:"did", fix:"have" },
  { cover:"pp-answer", tier:3, type:"grammar", open:false,
    clue:"Complete it: 'No, I ___ been to a concert before.'",
    answer:"have never", choices:["have never","haven't never","has never"] },
  { cover:"pp-answer", tier:2, type:"reason", open:false,
    clue:"Why is 'Yes, I did.' a wrong answer to 'Have you ever played the violin?'",
    answer:"The question uses 'have', so the answer must use 'have' too.", choices:["The question uses 'have', so the answer must use 'have' too.","The question is about music, so you must say 'play'.","'Did' can only be used with the word 'never'."] },

  // ---- pp-participle ----
  { cover:"pp-participle", tier:2, type:"grammar", open:true,
    clue:"Complete it with the past participle of 'sing': 'Have you ever ___ in front of your class?'",
    answer:"sung", choices:["sung","sang","singed"] },
  { cover:"pp-participle", tier:2, type:"grammar", open:true,
    clue:"Complete it with the past participle of 'listen': 'Have you ever ___ to jazz on the radio?'",
    answer:"listened", choices:["listened","listen","listening"] },
  { cover:"pp-participle", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"My brother has never took his guitar to school.", answer:"took", fix:"taken" },
  { cover:"pp-participle", tier:3, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are past participles. Tap the word that is not.",
    answer:"sang", choices:["sung","heard","taken","sang"] },
  { cover:"pp-participle", tier:3, type:"grammar", open:false,
    clue:"Lan is at the concert right now. Complete it: 'Lan has ___ to the concert.'",
    answer:"gone", choices:["gone","been","went"] },
  { cover:"pp-participle", tier:2, type:"grammar", open:false,
    clue:"Tam went to a jazz concert and came home again. Complete it: 'Tam has ___ to a jazz concert.'",
    answer:"been", choices:["been","gone","going"] },

  // ---- adv-more ----
  { cover:"adv-more", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'The lead singer sings more ___ than anybody in the chorus.'",
    answer:"beautifully", choices:["beautifully","beautiful","beautifuller"] },
  { cover:"adv-more", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"She plays the violin more careful than her sister.", answer:"careful", fix:"carefully" },
  { cover:"adv-more", tier:3, type:"grammar", open:false,
    clue:"Nam practices every day. His sister practices once a week. Which sentence is correct?",
    answer:"Nam practices more often than his sister.", choices:["Nam practices more often than his sister.","Nam practices more often as his sister.","Nam practices more oftener than his sister."] },
  { cover:"adv-more", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["Nam","sings","more loudly","than his brother"] },
  { cover:"adv-more", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'Tam listens to every note, so he practices more ___ than I do.'",
    answer:"carefully", choices:["carefully","careful","carefuller"] },
  { cover:"adv-more", tier:2, type:"reason", open:false,
    clue:"Why is 'He sings more loudly his brother does' wrong?",
    answer:"The word 'than' is missing.", choices:["The word 'than' is missing.","'Loudly' is not a real word.","'More' must always come after the verb."] },

  // ---- adv-irregular ----
  { cover:"adv-irregular", tier:2, type:"grammar", open:true,
    clue:"Complete it with the comparative of 'well': 'Mai plays the violin ___ than her brother.'",
    answer:"better", choices:["better","gooder","more good"] },
  { cover:"adv-irregular", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'Tam sings very ___ — everybody loves listening to him.'",
    answer:"well", choices:["well","good","best"] },
  { cover:"adv-irregular", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"My sister plays the flute gooder than me.", answer:"gooder", fix:"better" },
  { cover:"adv-irregular", tier:2, type:"grammar", open:true,
    clue:"Complete it with the comparative of 'badly': 'He played the drums ___ than last week.'",
    answer:"worse", choices:["worse","worser","more worse"] },
  { cover:"adv-irregular", tier:2, type:"reason", open:false,
    clue:"'Well' and 'badly' do not use 'more'. What are their comparative forms?",
    answer:"better and worse", choices:["better and worse","weller and worser","more well and more bad"] },
  { cover:"adv-irregular", tier:3, type:"grammar", open:false,
    clue:"Which sentence is correct?",
    answer:"She is a good singer and she sings well.", choices:["She is a good singer and she sings well.","She is a well singer and she sings good.","She is a good singer and she sings good."] },

  // ---- adv-equal ----
  { cover:"adv-equal", tier:2, type:"grammar", open:true,
    clue:"Complete it: 'I play the guitar as well ___ my brother — we are exactly the same.'",
    answer:"as", choices:["as","than","that"] },
  { cover:"adv-equal", tier:1, type:"reason", open:false,
    clue:"Lan says: 'I play the piano as well as Nam.' What does that mean?",
    answer:"They play equally well.", choices:["They play equally well.","Lan plays better than Nam.","Nam plays better than Lan."] },
  { cover:"adv-equal", tier:2, type:"reason", open:false,
    clue:"Tam practices the drums less often than Mai. Who practices more?",
    answer:"Mai", choices:["Mai","Tam","They practice the same amount."] },
  { cover:"adv-equal", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"She sings as well than her sister does.", answer:"than", fix:"as" },
  { cover:"adv-equal", tier:3, type:"grammar", open:false,
    clue:"Complete it: 'Mai practices every day but Nam practices once a week, so Nam practices ___ than Mai.'",
    answer:"less often", choices:["less often","lesser often","less more often"] },
  { cover:"adv-equal", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["He","practices the piano","less often","than his brother"] },

// ============ CARRIED FORWARD: going to, zero conditional, tags ===========
  // ---- review-going-to ----
  { cover:"review-going-to", tier:1, type:"grammar", open:false,
    clue:"Which question is correct?",
    answer:"Is she going to perform tonight?",
    choices:["Is she going to perform tonight?","Does she going to perform tonight?","Is she going to performs tonight?"] },

  { cover:"review-going-to", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'My brother ___ going to bring his guitar to the concert.'",
    answer:"is", choices:["is","are","does"] },

  { cover:"review-going-to", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'The musicians are going to ___ a new song at eight o'clock.'",
    answer:"play", choices:["play","plays","played"] },

  { cover:"review-going-to", tier:2, type:"grammar", open:false,
    clue:"The drummer has no plan to play today. Which sentence says that?",
    answer:"He isn't going to play today.",
    choices:["He isn't going to play today.","He aren't going to play today.","He didn't play today."] },

  { cover:"review-going-to", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"My sister is going to plays the piano at the concert.",
    answer:"plays", fix:"play" },

  { cover:"review-going-to", tier:3, type:"order", format:"order", open:false,
    clue:"Put the question in the right order.",
    parts:["Are","the musicians","going to practice","this afternoon?"] },

  // ---- review-conditional ----
  { cover:"review-conditional", tier:1, type:"reason", open:false,
    clue:"Which sentence tells us something that is ALWAYS true?",
    answer:"If you hit a drum harder, it sounds louder.",
    choices:["If you hit a drum harder, it sounds louder.","Yesterday he hit the drum harder.","Tonight he is going to hit the drum harder."] },

  { cover:"review-conditional", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'If you press three keys together, you ___ a chord.'",
    answer:"hear", choices:["hear","hears","heard"] },

  { cover:"review-conditional", tier:2, type:"odd one out", format:"odd", open:false,
    clue:"Three of these are true every time. Tap the one that happened only once.",
    answer:"She sang very loudly at the concert last night.",
    choices:["If you hit a drum, it makes a sound.","If you blow a flute, it makes a sound.","If you sing loudly, people hear you.","She sang very loudly at the concert last night."] },

  { cover:"review-conditional", tier:3, type:"grammar", open:false,
    clue:"Which sentence means the same as 'If you blow across the hole, the flute makes a sound'?",
    answer:"A flute makes a sound if you blow across the hole.",
    choices:["A flute makes a sound if you blow across the hole.","If a flute makes a sound, you blow across the hole.","A flute makes a sound, so you blow across the hole."] },

  { cover:"review-conditional", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"If you press the key, the piano make a sound.",
    answer:"make", fix:"makes" },

  { cover:"review-conditional", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'If the singer ___ louder, everyone hears the words.'",
    answer:"sings", choices:["sings","sing","will sing"] },

  // ---- review-tags ----
  { cover:"review-tags", tier:1, type:"grammar", open:false,
    clue:"Complete it: 'You've heard this song before, ___?'",
    answer:"haven't you", choices:["haven't you","didn't you","don't you"] },

  { cover:"review-tags", tier:2, type:"grammar", open:true,
    clue:"Complete it: 'You've never played jazz, ___ ___?'",
    answer:"have you", choices:["have you","haven't you","did you"] },

  { cover:"review-tags", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'Your brother plays the guitar, ___?'",
    answer:"doesn't he", choices:["doesn't he","doesn't your brother","isn't he"] },

  { cover:"review-tags", tier:2, type:"grammar", open:false,
    clue:"Complete it: 'She hasn't played the violin, ___?'",
    answer:"has she", choices:["has she","hasn't she","does she"] },

  { cover:"review-tags", tier:3, type:"fix it", format:"error", open:false,
    clue:"One word is wrong. Tap the mistake.",
    sentence:"They practiced all day yesterday, haven't they?",
    answer:"haven't", fix:"didn't" },

  { cover:"review-tags", tier:3, type:"order", format:"order", open:false,
    clue:"Put the sentence in the right order.",
    parts:["We've","sung","this song before,","haven't we?"] },

];


// ---------------------------------------------------------------------------
// 3. THE ELITE BANK — Elites and the Boss draw from here.
//    These ask a student to USE the language rather than recognise it. This is
//    also where a gifted class gets stretched, which is why the Oxford Grammar
//    strand is not needed in the realm proper.
// ---------------------------------------------------------------------------
const REALM3_ELITE_QUESTIONS = [
  // ---- note ----
  { cover:"note", tier:4, type:"say it", open:true,
    clue:"Your friend says: 'I sang one long chord at the end of the song.' Say the sentence correctly.",
    answer:"I sang one long note at the end of the song.",
    choices:["I sang one long note at the end of the song.","I sang one long beat at the end of the song.","I sang one long rhythm at the end of the song."] },

  // ---- chord ----
  { cover:"chord", tier:4, type:"reason", open:true,
    clue:"Finish this in your own words: 'A note is one single sound, but a chord is ___ .'",
    answer:"several notes played at the same time",
    choices:["several notes played at the same time","one sound played very loudly","the steady count you clap with your hands"] },

  // ---- melody ----
  { cover:"melody", tier:4, type:"reason", open:false,
    clue:"Your friend asks how a melody is different from a chord. Which answer is right?",
    answer:"A melody is notes one after another; a chord is notes together.",
    choices:["A melody is notes one after another; a chord is notes together.","A melody is notes together; a chord is notes one after another.","A melody and a chord are both the steady count you clap."] },

  // ---- beat ----
  { cover:"beat", tier:4, type:"say it", open:true,
    clue:"Your friend says: 'Clap the rhythm with me - one, two, three, four.' Say the sentence correctly.",
    answer:"Clap the beat with me - one, two, three, four.",
    choices:["Clap the beat with me - one, two, three, four.","Clap the melody with me - one, two, three, four.","Clap the concert with me - one, two, three, four."] },

  // ---- rhythm ----
  { cover:"rhythm", tier:4, type:"reason", open:true,
    clue:"Finish this in your own words: 'The beat stays the same all the way through, but the rhythm is ___ .'",
    answer:"the pattern of long and short sounds",
    choices:["the pattern of long and short sounds","the steady count that you clap","the group of musicians on the stage"] },

  // ---- practice ----
  { cover:"practice", tier:4, type:"say it", open:true,
    clue:"Your friend says: 'I must perform this song many times at home before the concert.' Say it correctly.",
    answer:"I must practice this song many times at home before the concert.",
    choices:["I must practice this song many times at home before the concert.","I must perform this song many times at home before the concert.","I must practice this concert many times at home before the song."] },

  // ---- perform ----
  { cover:"perform", tier:4, type:"grammar", open:true,
    clue:"Your friend says: 'Last night our band perform at the school concert.' Say the sentence correctly.",
    answer:"Last night our band performed at the school concert.",
    choices:["Last night our band performed at the school concert.","Last night our band performs at the school concert.","Last night our band performing at the school concert."] },

  // ---- concert ----
  { cover:"concert", tier:4, type:"grammar", open:true,
    clue:"Your friend says: 'I go to a concert last Saturday.' Say the sentence correctly.",
    answer:"I went to a concert last Saturday.",
    choices:["I went to a concert last Saturday.","I gone to a concert last Saturday.","I going to a concert last Saturday."] },

  // ---- band ----
  { cover:"band", tier:4, type:"apply", open:true,
    clue:"Your friend says: 'My brother play in a band.' Say it correctly.",
    answer:"My brother plays in a band.",
    choices:["My brother plays in a band.","My brother play in a band.","My brother is play in a band."] },

  // ---- lead_singer ----
  { cover:"lead_singer", tier:4, type:"say it", open:true,
    clue:"Your friend says: 'Mai is the lead player of our band and she sings every song.' Say it correctly.",
    answer:"Mai is the lead singer of our band and she sings every song.",
    choices:["Mai is the lead singer of our band and she sings every song.","Mai is the lead melody of our band and she sings every song.","Mai is the lead concert of our band and she sings every song."] },

  // ---- violin ----
  { cover:"violin", tier:4, type:"fix it", open:true,
    clue:"Your friend says: 'I am playing the violin since I was seven.' Say it correctly.",
    answer:"I have played the violin since I was seven.",
    choices:["I have played the violin since I was seven.","I am playing the violin since seven years.","I was playing the violin since I am seven."] },
  { cover:"violin", tier:4, type:"reason", open:false,
    clue:"Say it in one sentence: 'The violin is small. The piano is big.'",
    answer:"The violin is smaller than the piano.",
    choices:["The violin is smaller than the piano.","The violin is more small than the piano.","The violin is the smallest than the piano."] },

  // ---- drum ----
  { cover:"drum", tier:4, type:"grammar", open:true,
    clue:"Make a yes/no question: 'Tan plays the drum in the school band.'",
    answer:"Does Tan play the drum in the school band?",
    choices:["Does Tan play the drum in the school band?","Does Tan plays the drum in the school band?","Is Tan play the drum in the school band?"] },
  { cover:"drum", tier:4, type:"reason", open:false,
    clue:"Put the two instruments in their right families. Which sentence is correct?",
    answer:"A drum is percussion, but a piano is a keyboard instrument.",
    choices:["A drum is percussion, but a piano is a keyboard instrument.","A drum is a string instrument, but a piano is percussion.","A drum and a piano both belong to the wind family."] },

  // ---- piano ----
  { cover:"piano", tier:4, type:"grammar", open:true,
    clue:"Nam has played the piano for six years. Ask how long.",
    answer:"How long has Nam played the piano?",
    choices:["How long has Nam played the piano?","How long Nam has played the piano?","How long does Nam played the piano?"] },

  // ---- flute ----
  { cover:"flute", tier:4, type:"fix it", open:true,
    clue:"Your friend says: 'I never play the flute before.' Say it correctly.",
    answer:"I have never played the flute before.",
    choices:["I have never played the flute before.","I have never play the flute before.","I am never playing the flute before."] },

  // ---- saxophone ----
  { cover:"saxophone", tier:4, type:"fix it", open:true,
    clue:"Your friend says: 'I am wanting to learn the saxophone.' Say it correctly.",
    answer:"I want to learn the saxophone.",
    choices:["I want to learn the saxophone.","I am want to learn the saxophone.","I wanting to learn the saxophone."] },

  // ---- guitar ----
  { cover:"guitar", tier:4, type:"apply", open:true,
    clue:"Say it in one sentence using 'better than': 'Minh plays the guitar well. His sister plays it very well.'",
    answer:"His sister plays the guitar better than Minh.",
    choices:["His sister plays the guitar better than Minh.","His sister plays the guitar more better than Minh.","His sister plays the guitar more well than Minh."] },

  // ---- hip_hop ----
  { cover:"hip_hop", tier:4, type:"apply", open:false,
    clue:"A student wrote: 'In hip-hop the words are sing very fast.' Which correction is right?",
    answer:"the words are spoken very fast", choices:["the words are spoken very fast","the words are sing very fastly","the words is spoken very fast"] },

  // ---- classical ----
  { cover:"classical", tier:4, type:"reason", open:false,
    clue:"Explain the biggest difference between a classical orchestra and a rock band.",
    answer:"an orchestra has far more musicians and no electric guitars", choices:["an orchestra has far more musicians and no electric guitars","an orchestra plays only music written last year","a rock band never uses any drums"] },
  { cover:"classical", tier:4, type:"vocab", open:true,
    clue:"Say the word for the large group of more than sixty musicians who play classical music together.",
    answer:"an orchestra", choices:["an orchestra","a band","a chorus"] },

  // ---- pop ----
  { cover:"pop", tier:4, type:"apply", open:true,
    clue:"Make a yes/no question: 'Mai listens to pop music every day.'",
    answer:"Does Mai listen to pop music every day?", choices:["Does Mai listen to pop music every day?","Does Mai listens to pop music every day?","Do Mai listen to pop music every day?"] },

  // ---- jazz ----
  { cover:"jazz", tier:4, type:"apply", open:false,
    clue:"Complete it: 'Jazz musicians ___ — they invent new notes while they are playing.'",
    answer:"improvise", choices:["improvise","imitate","repeat"] },
  { cover:"jazz", tier:4, type:"apply", open:true,
    clue:"Your friend says: 'Jazz is more better than pop.' Say it correctly.",
    answer:"Jazz is better than pop.", choices:["Jazz is better than pop.","Jazz is more good than pop.","Jazz is the more better than pop."] },

  // ---- rock ----
  { cover:"rock", tier:4, type:"apply", open:true,
    clue:"Say it in one sentence using 'more loudly': 'The rock band played loudly. The jazz band was quiet.'",
    answer:"The rock band played more loudly than the jazz band.",
    choices:["The rock band played more loudly than the jazz band.","The rock band played more loud than the jazz band.","The rock band played loudlier than the jazz band."] },

  // ---- phonics-o ----
  { cover:"phonics-o", tier:4, type:"phonics", open:false,
    clue:"Which sentence has THREE words with the short o sound of 'rock'?",
    answer:"Stop the rock band.", choices:["Stop the rock band.","Take a note home.","Who plays the piano?"] },
  { cover:"phonics-o", tier:4, type:"phonics", open:false,
    clue:"A student says 'top' and 'note' have the same vowel sound. Why is he wrong?",
    answer:"'Top' has the short o; in 'note' the o says its own name.", choices:["'Top' has the short o; in 'note' the o says its own name.","He is right — the two sound the same.","'Top' has no vowel sound at all."] },

  // ---- phonics-o-not ----
  { cover:"phonics-o-not", tier:4, type:"phonics", open:false,
    clue:"Only ONE of these music words holds the short o sound of 'rock'. Which one?",
    answer:"concert", choices:["concert","piano","phone"] },

  // ---- pp-question ----
  { cover:"pp-question", tier:4, type:"apply", open:true,
    clue:"Turn this into a present perfect question with 'ever': 'Mai has played in a band.'",
    answer:"Has Mai ever played in a band?", choices:["Has Mai ever played in a band?","Have Mai ever played in a band?","Has Mai played ever in a band?"] },
  { cover:"pp-question", tier:4, type:"apply", open:true,
    clue:"You want to know if Nam has heard hip-hop at any time in his life. Ask him.",
    answer:"Have you ever heard hip-hop?", choices:["Have you ever heard hip-hop?","Did you ever heard hip-hop?","Have you heard ever hip-hop?"] },

  // ---- pp-answer ----
  { cover:"pp-answer", tier:4, type:"apply", open:true,
    clue:"A friend asks: 'Have you ever been to a concert?' You have not, not once. Give the full answer.",
    answer:"No, I have never been to a concert.", choices:["No, I have never been to a concert.","No, I haven't never been to a concert.","No, I didn't never go to a concert."] },
  { cover:"pp-answer", tier:4, type:"fix it", open:false,
    clue:"A student wrote: 'Have you ever sang in a chorus? Yes, I did.' Two things are wrong. Fix both.",
    answer:"Have you ever sung in a chorus? Yes, I have.", choices:["Have you ever sung in a chorus? Yes, I have.","Have you ever sang in a chorus? Yes, I have.","Have you ever sung in a chorus? Yes, I did."] },

  // ---- pp-participle ----
  { cover:"pp-participle", tier:4, type:"apply", open:true,
    clue:"Complete it with the past participle of 'write': 'My teacher has ___ a new song for our chorus.'",
    answer:"written", choices:["written","wrote","writed"] },
  { cover:"pp-participle", tier:4, type:"reason", open:false,
    clue:"Lan is at the concert now. Tam came home an hour ago. Which sentence is correct?",
    answer:"Lan has gone to the concert and Tam has been to the concert.", choices:["Lan has gone to the concert and Tam has been to the concert.","Lan has been to the concert and Tam has gone to the concert.","Lan has went to the concert and Tam has gone to the concert."] },

  // ---- adv-more ----
  { cover:"adv-more", tier:4, type:"apply", open:true,
    clue:"Your friend says: 'She plays the piano more carefuller than me.' Say it correctly.",
    answer:"She plays the piano more carefully than me.", choices:["She plays the piano more carefully than me.","She plays the piano more careful than me.","She plays the piano carefuller than me."] },
  { cover:"adv-more", tier:4, type:"apply", open:true,
    clue:"Make one sentence using 'more slowly': 'The band played slowly. The other band played very fast.'",
    answer:"The band played more slowly than the other band.", choices:["The band played more slowly than the other band.","The band played more slow than the other band.","The band played more slowlier than the other band."] },

  // ---- adv-irregular ----
  { cover:"adv-irregular", tier:4, type:"apply", open:true,
    clue:"Your friend says: 'He plays the drums more better than me.' Say it correctly.",
    answer:"He plays the drums better than me.", choices:["He plays the drums better than me.","He plays the drums more good than me.","He plays the drums more well than me."] },
  { cover:"adv-irregular", tier:4, type:"reason", open:false,
    clue:"'Mai is a good singer.' 'Mai sings well.' Why does one use 'good' and the other 'well'?",
    answer:"'Good' describes the singer; 'well' describes how she sings.", choices:["'Good' describes the singer; 'well' describes how she sings.","'Good' is for people and 'well' is for instruments.","They mean the same, so you can swap them."] },

  // ---- adv-equal ----
  { cover:"adv-equal", tier:4, type:"apply", open:true,
    clue:"Mai and Nam play the flute equally well. Say that using 'as well as'.",
    answer:"Mai plays the flute as well as Nam.", choices:["Mai plays the flute as well as Nam.","Mai plays the flute as well than Nam.","Mai plays the flute so well as Nam."] },
  { cover:"adv-equal", tier:4, type:"apply", open:true,
    clue:"Tam practices twice a week. Lan practices every day. Say that using 'less often than'.",
    answer:"Tam practices less often than Lan.", choices:["Tam practices less often than Lan.","Tam practices lesser often than Lan.","Tam practices less often as Lan."] },

  // ---- review-going-to ----
  { cover:"review-going-to", tier:4, type:"fix it", open:false,
    clue:"One part is wrong: 'Does she going to sing at the concert?'",
    answer:"'Does' should be 'Is'",
    choices:["'Does' should be 'Is'","'going' should be 'go'","'sing' should be 'sings'"] },

  { cover:"review-going-to", tier:4, type:"grammar", open:false,
    clue:"Your friend says: 'The drummers is going to played first.' Which sentence is correct?",
    answer:"The drummers are going to play first.",
    choices:["The drummers are going to play first.","The drummers are going to played first.","The drummers is going to play first."] },

  // ---- review-conditional ----
  { cover:"review-conditional", tier:4, type:"grammar", open:false,
    clue:"Your friend says: 'If you blows into the flute, it make a sound.' Which sentence is correct?",
    answer:"If you blow into the flute, it makes a sound.",
    choices:["If you blow into the flute, it makes a sound.","If you blows into the flute, it makes a sound.","If you blow into the flute, it will makes a sound."] },

  { cover:"review-conditional", tier:4, type:"fix it", open:false,
    clue:"One part is wrong: 'If the drummer hit the drum hard, everyone hears it.'",
    answer:"'hit' should be 'hits'",
    choices:["'hit' should be 'hits'","'hears' should be 'hear'","'hard' should be 'hardly'"] },

  // ---- review-tags ----
  { cover:"review-tags", tier:4, type:"grammar", open:true,
    clue:"Finish the tag: 'Your friends haven't seen the concert, ___ ___?'",
    answer:"have they", choices:["have they","haven't they","did they"] },

  { cover:"review-tags", tier:4, type:"fix it", open:false,
    clue:"One part is wrong: 'You've played in a band before, didn't you?'",
    answer:"'didn't you' should be 'haven't you'",
    choices:["'didn't you' should be 'haven't you'","'played' should be 'play'","'before' should be 'already'"] },

  { cover:"review-tags", tier:4, type:"grammar", open:false,
    clue:"Which sentence is correct?",
    answer:"Your sister hasn't heard the song, has she?",
    choices:["Your sister hasn't heard the song, has she?","Your sister hasn't heard the song, hasn't she?","Your sister hasn't heard the song, does she?"] },

];


// ---------------------------------------------------------------------------
// 4. REGISTER IT
//
// ART: THIS REALM IS CURRENTLY BORROWING REALM 1'S CAST, AND SAYS SO.
//
// `artBorrowedFrom` is not decoration. Realm 2's art paths once could not be
// told apart from deliberate stand-ins, and test_art.py exists because of it -
// but that test reads content.js, and a realm registered from its own file
// slips past it entirely. A borrowed cast that nobody declared would therefore
// be invisible twice over.
//
// So the borrow is declared here, test_art.py reads this field, and it prints a
// loud NOTE for every realm carrying one. When the Concert Caverns get their
// own monsters, delete this line and point `monsters`, `elites`, `boss` and
// `npc` at assets/sprites/realm3/ - at which point the test starts enforcing
// that folder instead of merely reporting the loan.
// ---------------------------------------------------------------------------
registerRealm({
  id: 3,
  name: "The Concert Caverns",
  theme: "Music",

  questions:      REALM3_QUESTIONS,
  eliteQuestions: REALM3_ELITE_QUESTIONS,

  // `artBorrowedFrom` is read by test_art.py; `artPending` is read by the realm
  // card in ui.js, which already had a "Playable · artwork still to come" state
  // waiting for exactly this situation. Both come off together when the
  // Concert Caverns get their own cast.
  artBorrowedFrom: 1,
  artPending: true,
  monsters: REALM1_MONSTERS,
  elites:   REALM1_ELITES,
  boss:     REALMS[1].boss,
  npc:      REALMS[1].npc,
  palette:  "storm",
  sky:      "storm",
});
