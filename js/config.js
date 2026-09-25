// ---------------------------------------------------------------------------
// Tuning. Safe to edit these numbers - everything else reads from here.
// ---------------------------------------------------------------------------
const CONFIG = {
  // The PIN is stored as a SHA-256 hash of a PASSPHRASE, never as the
  // passphrase itself. This file is served publicly by GitHub Pages, so a
  // cleartext PIN could be read by any student who opened the page source -
  // and for most of this game's life it said "1234" right here.
  //
  // Hashing does not make it secret; the hash is public too, and anyone
  // determined could test guesses against it offline. What it buys is that
  // guessing has to be done deliberately rather than by accident, which is why
  // it must be a PASSPHRASE (three or four unrelated words) and not four
  // digits. Four digits fall in seconds.
  //
  // To change it: open tools/set-pin.html in a browser, type the passphrase,
  // and paste the line it prints over the one below. The passphrase is hashed
  // in your own browser and is never sent anywhere.
  //
  // Default below is the hash of "storm-tiger-lantern" - CHANGE IT.
  TEACHER_PIN_SHA256:
    "086e6dbaca9e9630b9aae77c2b89aebdfa089d2b69e23312711f9b6a4dcb8c26",

  // --- party ---
  // v5.0: hearts are now the party's MAIN resource and shields are a thin
  // buffer, inverting v4.3 where shields quietly absorbed 84% of everything.
  // v5.1: 13 hearts made a wrong answer cost 10% of the pool, so getting one
  // wrong felt like nothing. Instrumenting the damage showed why: only 31% of
  // it came from wrong answers, the rest from the monster's clock. The fix is
  // a smaller pool AND a slower clock, so the threat comes from not knowing
  // rather than from waiting. Wrong answers are now 47% of all damage and one
  // costs about a fifth of the party.
  //
  // ***** THIS IS THE DIFFICULTY DIAL. *****
  //
  // If you change one number in this file between classes, change this one.
  // Everything else in the game is integer-grained - a monster hits for 1, 2
  // or 3 hearts, so "make the monster 15% weaker" rounds straight back to the
  // number you started with. The heart pool is the only continuous control
  // there is, and it moves the wipe rate smoothly and predictably.
  //
  //   12 or 13   a weaker class, or the first lesson with a new group
  //   11         the tuned default, aimed at roughly 1 run in 2 ending badly
  //   9 or 10    a class that has played before and is coasting
  //
  // Nothing else needs touching to go with it. RULE THREE still applies at
  // every setting: none of these is an easy mode, and the run must stay
  // losable.
  START_HEARTS: 11,
  MAX_HEARTS: 16,

  // --- combat ---
  // v5.0: a 2-HP monster died before its first turn arrived, so it never got
  // to use the intent it had just telegraphed. At 4 it acts 1.7 times per
  // fight and the countdown finally means something.
  MONSTER_HP: 4,          // regular Fight node
  ELITE_HP: 7,            // Elite node
  BOSS_MIN_QUESTIONS: 6,  // boss is never trivially short
  BOSS_MAX_QUESTIONS: 20, // ...nor absurdly long if the class dodged rooms
  TEAMUP_HP_COST: 1,      // asking a partner for help adds this much monster HP
  TEAMUP_ONCE_PER_MONSTER: true,

  // --- map shape (bigger + denser than v1) ---
  LAYERS_PER_REALM: 15,       // shorter map, deeper fights - same lesson length
  NODES_PER_LAYER_MIN: 3,
  NODES_PER_LAYER_MAX: 4,
  EXTRA_LINK_CHANCE: 0.55,    // chance a node gets a 2nd forward link
  THIRD_LINK_CHANCE: 0.22,    // chance of a 3rd forward link
  MAX_ELITES_PER_MAP: 4,      // elites are 5-hit commitments; keep them rare

  // --- rewards (v4: roughly tripled - the old numbers couldn't fund a shop) ---
  // v5.5: HALVED. Measured over 4,000 runs, a typical run EARNED 527 shards
  // and could only SPEND about 123 of them - 77% of all income had nothing to
  // buy. 210 of those shards were earned during the boss fight, which is after
  // the last shop by construction, so they were unspendable the moment they
  // were paid. The v4 comment below is why: the constants were tripled to
  // "fund a shop" and overshot by roughly 4x.
  SHARDS_FIGHT: 4,          // per regular monster felled
  SHARDS_ELITE: 12,         // per elite felled
  SHARDS_TREASURE: 8,
  // v6.1: was 4. The boss pays out AFTER the last shop by construction, so
  // every shard earned in the boss fight was unspendable the moment it was
  // earned - about 40 a run of pure inflation, and part of why the shop
  // economy read as "you can afford everything". Dropped to 1 so a correct
  // answer still registers as a reward without pretending to be money.
  SHARDS_BOSS_HIT: 1,
  SHARDS_PER_HIT: 2,        // small trickle for every correct answer in combat
  SHARDS_TIER_BONUS: 2,     // extra per difficulty tier above 1
  // A run acquired 8.5 potions, 6.5 of them from streak bonuses alone, so the
  // shop's potion row and the Deep Pack perk were both buying something the
  // class was already drowning in. Scarcity is what makes them worth anything.
  MAX_POTIONS: 4,
  POTION_DROP_CHANCE: 0.22, // monsters sometimes drop a potion
  POTION_DROP_ELITE: 0.75,
  START_POTIONS: ["potion_heal"],   // so potions are visible from turn one

  // A Safe Path used to give nothing at all, which made 11% of the walk dead
  // air dressed up as a reward. Small enough that a campfire Repair is still
  // the real fix.
  SAFE_PATH_SHIELDS: 5,

  // --- shops ---
  SHOPS_PER_MAP: 3,
  SHOP_FIRST_DEPTH: 0.35,   // no shop before this fraction of the map
  SHOP_LAST_DEPTH: 0.92,

  // --- difficulty tiers: damage taken on a wrong answer ---
  // Hard questions now bite properly. Vocabulary still costs one heart; a
  // grammar or Elite question costs three of nine.
  // v6.1: tier 3/4 dropped from 3 to 2. Measured across four real classes, a
  // wrong answer was doing FAR more damage than the monster ever did - a RISKY
  // tier-3 mistake cost 6 of 9 hearts, two thirds of the party for one guess,
  // while the monster landed about half a hit per fight. That taught classes
  // that RISKY is a trap and combat is scenery. The threat now comes from the
  // monster's clock (see BOSS_CADENCE and the cadence:2 monsters) and a
  // mistake costs a serious but survivable amount.
  //
  // v6.7: THIS TABLE IS NOW THE *SAFE* COST ONLY. A wrong RISKY answer no
  // longer multiplies these - it ignores them entirely and charges a flat
  // STAKE_RISKY_FLAT / _FLAT_HARD instead. See the stakes block below.
  TIER_DAMAGE: { 1: 1, 2: 1, 3: 2, 4: 2 },   // tier 4 = the Elite bank

  // --- survivability (tuned with tools/../sim: at 100% accuracy the party
  //     almost always survives; at 80% roughly 4 runs in 10 end in a wipe) ---
  // v4.3: shields NO LONGER refill in every room. They persist, and are only
  // topped up at a Rest room or Safe Path, by a potion, or by shopping. That
  // is what makes armour worth carrying. Lower this for a harder game.
  // Shields are the right buffer for the faster v6.1 monster rather than more
  // hearts: they are a MANAGED resource that only refills at a campfire or a
  // Safe Path, so the class has to plan for the damage instead of simply
  // having a deeper pool - and a bigger heart pool would have made a wrong
  // answer feel like nothing, which is the mistake v5.1 already made and
  // corrected. Shields also lengthen fights and never shorten them.
  //
  // v6.1 took this 7 -> 18. v6.2.1 pulls it back to 12: at 18 the party took
  // NO DAMAGE AT ALL in 91% of fights. The monster was swinging 1.9 times a
  // fight and landing every one, and the shields ate the lot - so the whole
  // point of v6.1 was being absorbed.
  // ---- THE CHORUS ---------------------------------------------------------
  // The whole room answers at once and the teacher taps how it went. Its
  // entire purpose is REVIEW VOLUME: an ordinary question is answered by one
  // child out of twenty-four, and a Chorus question is answered by all of
  // them. Three questions a room turns ~6 answers a run into ~144.
  //
  // The rewards are deliberately modest. A Chorus is safe - it cannot cost a
  // heart - so if it paid like a fight nobody would ever walk into one again,
  // and the map would stop being a decision.
  CHORUS_QUESTIONS: 3,       // per Chorus room
  CHORUS_BOSS_QUESTIONS: 2,  // the boss demands one at half health
  // THE CHORUS PAYS NO SHIELDS. This took three measurements to get right and
  // the answer was not the one to guess at.
  //
  // The first draft paid 3 shields for a clean answer - 9 a room, ~23 a run,
  // twice a campfire Repair - and painless fights went 70% -> 85%. Cutting it
  // to ONE shield still left it at 78%. Raising the fight weight to win back
  // the share the new room had diluted moved it by two points, so the map mix
  // was never the cause. Setting shields to zero put painless back to exactly
  // 70% and the wipe rate to 69% against v6.4's 68% - difficulty untouched,
  // with seven more questions a run.
  //
  // One shield per correct answer, in a room that cannot cost a heart, is
  // worth eight points of painless-fight rate. Shields are the currency that
  // decides whether the game is hard, and nothing that cannot be lost should
  // hand them out. RULE THREE.
  CHORUS_REWARD: {
    good: { shards: 3, shields: 0 },   // nearly everyone
    half: { shards: 2, shields: 0 },   // about half
    poor: { shards: 1, shields: 0 },   // only a few - still paid for trying
  },
  REST_SHIELDS: 12,          // campfire "Repair"

  // What the party sets out with. This is NOT the same as a Repair, and the
  // bug that prompted splitting them out is worth remembering:
  //
  // A run starts on zero shields and then called refillShields() once, so the
  // party began every run as though they had just rested. That was invisible
  // while a Repair was 7. When v6.1 raised Repair to 18 the starting kit
  // silently tripled with it - nobody chose 18, it was inherited - and the
  // first several fights became free.
  //
  // Half a Repair: enough that nobody walks into room one on nothing, small
  // enough that the first campfire is a real upgrade rather than a top-up.
  START_SHIELDS: 6,
  REST_HEAL: 5,              // campfire "Mend"
  SHARPEN_HEARTS: 1,         // campfire "Sharpen" - permanent max hearts this run
  BOSS_CADENCE: 3,           // boss acts every N student turns

  // --- the monster clock (v6.1) ---
  //
  // This is the single most important number in the game and it was wrong.
  //
  // A fight lasts about 4.6 questions. At cadence 3 the monster got roughly
  // one action per fight - and the streak guard (3 correct in a row, which a
  // decent class hits constantly) blocked it. Across four real classes the
  // students effectively never saw a monster complete an attack, so all the
  // threat came from wrong answers, Brace and Focus defended against nothing,
  // and elites hitting for 3 came out of a clear sky.
  //
  // Removing the streak guard on its own takes the monster from ~0.5 LANDED
  // hits per fight to ~1.5 - three times the threat, with the countdown finally
  // meaning something.
  //
  // v6.7: THIS IS NOW 2, and the v6.1 note below explaining why it could never
  // be 2 was measured against a rule that has since been corrected. Read both.
  //
  // v6.1 rejected cadence 2 because questions per RUN fell from 36 to 23. That
  // measurement was right and the conclusion drawn from it was wrong, because
  // the run is not the unit that matters. A lesson is forty-five minutes long
  // and a class that wipes restarts and keeps answering until the bell. Held
  // against the clock instead of the run, at 85% accuracy, questions per LESSON
  // sit at 42-43 across every difficulty tested - a shorter run is simply
  // followed by more runs - and the number of DISTINCT curriculum items touched
  // goes slightly UP, because each fresh run sweeps untested keys first.
  //
  // So the thing v6.1 was protecting was never actually at risk. See RULE ONE
  // in CLAUDE.md, which has been rewritten to say questions per lesson.
  //
  // What forced the move: v6.7 makes a RISKY correct answer deal 2 damage, and
  // a shorter fight means the monster's clock reaches zero less often. Left at
  // cadence 3 that took monster swings per fight from 1.46 to 0.79 - roughly
  // half of all fights would have had no monster attack in them at all, which
  // is the exact fault that made v6.1 raise the clock in the first place.
  // Cadence 2 puts it back to 1.38. The two changes pay for each other.
  //
  // Overrides the per-monster `cadence` in content.js, which is 3 everywhere.
  // Kept as a single knob so the number can move for the whole cast at once.
  MONSTER_CADENCE: 2,

  // --- monster behaviour ---
  VARIANT_CHANCE: 0.30,      // chance a regular monster is a tinted variant
  SPECIAL_CHANCE: 0.45,      // chance a monster applies its debuff when acting
  ENRAGE_AFTER_TURNS: 4,     // monster turns before it enrages (+1 damage)

  // --- failure ladder ---
  LAST_STAND_ENABLED: true,  // one sudden-death question at 0 hearts, once
                             // per run - the counterweight to v4.1's faster
                             // monsters, and a genuinely tense classroom beat
  CHECKPOINT_HEARTS: 2,      // hearts restored when falling back to a campfire

  // --- stakes (v5.3, replaces Momentum) ---
  // Momentum was a pool spent through a separate UI, and it was OPTIONAL, so
  // classes ignored it. The decision now sits on the question itself: before
  // the options appear, the student on turn picks SAFE or RISKY.
  //
  // v6.7 REBUILT THIS. Two faults, both found by measuring rather than by
  // playing, and the second one only visible because of the first.
  //
  // FAULT 1 - "double both ways" is not symmetrical. It sounds fair and it is
  // not, because the two sides are not drawn equally often. A class answering
  // at 85% collects the upside about six times for every one time it pays the
  // downside, so doubling both ends is a straight gift: a class that always
  // gambled wiped 75% of the time against 95% for a class that never did.
  // Being bold was strictly better, and a decision with a right answer is not
  // a decision. Balancing it by multiplication needs roughly 5x, and 5x on a
  // tier-4 question is 10 hearts out of 11 - one wrong answer, run over.
  //
  // So the penalty is FLAT. It does not scale with the question's tier, which
  // means it can be set to a number that actually deters without becoming a
  // one-shot kill on the hardest questions. It is also a number a ten-year-old
  // can hold in their head while deciding, which "double" never was.
  //
  // FAULT 2 - the upside was pure shards, and shards only cash out at a shop
  // several rooms later, while the damage lands in the same second. That is
  // why v5.3 had to bolt a shield onto blind calls to stop RISKY being a trap.
  // A RISKY correct answer now deals 2 damage instead of 1: the reward arrives
  // at the same moment as the risk, in the currency the class is actually
  // watching. This DOES shorten fights, and under the old reading of RULE ONE
  // it would have been forbidden - see MONSTER_CADENCE above for why that
  // reading was wrong, and what had to move with it.
  // v7.0: RISKY MEANS ONE THING - the options vanish and the answer is said
  // out loud. It used to mean that on some questions and "same multiple choice,
  // bigger stakes" on the rest, which a class spotted in a lesson and called
  // unfair: two students, same button, different jobs. The split is gone.
  //
  // What enforces it is the SHAPE of the question, not a flag somebody has to
  // remember to tick. RISKY is simply not offered on an odd-one-out, a
  // put-it-in-order, or anything carrying `noBlind: true` - see stakes.js. That
  // covers about 10% of the bank; the other 90% offers it, against roughly a
  // third before the v7.0 clue rewrites.
  STAKES_ENABLED: true,
  STAKE_RISKY_SHARDS: 2,     // UNUSED since v7.0 - there is one RISKY, and it
                             // pays STAKE_BLIND_SHARDS. Kept so the old rate is
                             // recoverable if the blind rate proves too rich.
  STAKE_RISKY_DAMAGE_DEALT: 2,  // ...and lands twice as hard (SAFE deals 1)
  // What a wrong RISKY answer costs, in hearts, flat. Shields absorb it
  // normally - the class already reads shields as their buffer and taking that
  // away would have made the penalty arbitrary as well as large.
  //
  // The split is by question tier, so an elite or the boss - which ask from
  // the tier-4 bank - charge the higher number without needing to be named
  // here. 4 of 11 hearts is a bad afternoon; 6 of 11 is most of the party and
  // is meant to be frightening. Neither is fatal from full health, which is
  // the line that separates a gamble from a coin-flip.
  //
  // v7.0 BROUGHT THESE DOWN FROM 4/6, and the reason is worth keeping.
  //
  // RISKY now always hides the options, so it is a genuinely harder question
  // than it was: a multiple choice hands a student who does not know a 1-in-3
  // guess, and a class at 85% accuracy is in that position about 15% of the
  // time. Removing it costs them roughly 5 points of accuracy, plus a little
  // more for production being harder than recognition.
  //
  // At the old 4/6, that made bold play strictly WORSE - a class that gambled
  // wiped 87% against a cautious class's 78%. Which is precisely the v6.6 fault
  // turned inside out: a stake with a correct answer is not a stake. At 3/5 it
  // is 82% against 76%, a six-point spread, and a class can reasonably play
  // either way. Questions per lesson and curriculum coverage are unchanged.
  //
  // The difficulty did not go away - it moved from the punishment to the task.
  STAKE_RISKY_FLAT: 3,       // tiers 1-2
  STAKE_RISKY_FLAT_HARD: 5,  // tiers 3-4, so elites and the boss
  // On a question tagged `open: true` the clue alone tells you what to say, so
  // RISKY escalates to answering BLIND - nothing on screen to pick from. This
  // is the old Commit, folded in. It pays more because recall is harder than
  // recognition. It is never offered on selection-only questions: hiding the
  // correct answer from a student who knows it is the one thing this game
  // must never do.
  STAKE_BLIND_SHARDS: 3,
  // UNUSED since v7.0. This was the tier floor below which RISKY would not go
  // blind, and it is exactly the kind of hidden second condition that made the
  // button behave differently on questions that looked the same. A tier-1
  // question now offers the same gamble as any other; the flat penalty already
  // scales the cost by tier, so nothing here needed a floor as well.
  STAKE_MIN_TIER: 2,
  // REMOVED in v6.7 (was 1). This existed to stop RISKY being a trap, because
  // the whole upside was shards that could not be spent until a shop several
  // rooms away. RISKY now deals 2 damage, which is an immediate payoff, so the
  // shield is doing nothing the mechanic does not already do - and it was a
  // free shield in the one place the game had proved it cannot afford to give
  // them away (see the Chorus note above: one shield per correct answer in a
  // risk-free room was worth eight points of painless-fight rate).
  //
  // Left here at 0 rather than deleted so the reason survives. A blind call
  // still pays 3x shards, still deals the RISKY 2 damage, and still costs the
  // same flat 4 or 6 when it misses.
  STAKE_BLIND_SHIELD: 0,
  STAKE_SHIELD_CAP: 2,       // per fight

  // --- team up ---
  TEAMUPS_PER_RUN: 3,        // was unlimited, which made it a non-decision

  // --- the distracted button (v6.1) ---
  // A teacher's button, not a game mechanic. When a student is nominated and
  // somebody else shouts the answer, the class rule has been broken and there
  // needs to be a visible cost. In a fight the monster gets a free strike;
  // anywhere else the party simply loses this many hearts, so the rule reads
  // the same to the class on the map, in a shop or at a campfire.
  //
  // It deliberately does NOT consume the question. The nominated student still
  // answers it. Eating the question would cost review volume AND punish the
  // one child who did nothing wrong.
  DISTRACTED_DAMAGE: 1,

  // --- per-realm difficulty ramp (v5.9) ---
  //
  // Nothing in the game read `realmId` for difficulty, so Realm 9 was exactly
  // as hard as Realm 1 while the class got steadily better at it and the Forge
  // handed out permanent upgrades. v5.5 scoped those perks per realm, which
  // flattened the worst of the ratchet; this is the other half.
  //
  // Deliberately gentle. Over nine realms these compound, and the language
  // itself gets harder every unit - the mechanics only need to stop the curve
  // sagging, not fight the class.
  REALM_RAMP: {
    // +1 monster HP every third realm: R1-3 = 4, R4-6 = 5, R7-9 = 6.
    // Monster HP is the main fight-LENGTH dial, so this also means more
    // questions per fight later in the year, which is the direction we want.
    monsterHpPer: 3,
    eliteHpPer: 3,
    // -1 starting heart every fourth realm: R1-4 = 9, R5-8 = 8, R9 = 7.
    heartsPer: 4,
    // DISABLED in v6.1. This used to take cadence from 3 to 2 at Realm 7.
    // Cadence 2 is now the base for every realm, and 1 would mean the monster
    // acting on every single answer - the countdown would never show a number
    // above one and there would be nothing to plan around. The late-realm
    // ramp does its work through monster HP and hearts instead.
    cadenceFrom: 0,
  },

  // --- misc ---
  // Shown on the title screen. Its whole job is to answer "did my upload
  // actually go live?" from across the room, without opening dev tools -
  // a question that cost an evening once already, when a cached index.html
  // and a fresh config.js disagreed and the teacher menu simply stopped
  // accepting any passphrase at all.
  VERSION: "7.0",

  SAVE_KEY: "wordrealms_save_v2",
  DEFAULT_UNLOCKED: [1],
};
