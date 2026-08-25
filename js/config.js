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
  // mistake costs a serious but survivable amount. RISKY now caps at 4.
  TIER_DAMAGE: { 1: 1, 2: 1, 3: 2, 4: 2 },   // tier 4 = the Elite bank

  // --- survivability (tuned with tools/../sim: at 100% accuracy the party
  //     almost always survives; at 80% roughly 4 runs in 10 end in a wipe) ---
  // v4.3: shields NO LONGER refill in every room. They persist, and are only
  // topped up at a Rest room or Safe Path, by a potion, or by shopping. That
  // is what makes armour worth carrying. Lower this for a harder game.
  // v6.1: 7 -> 18, and this is what pays for the monster now landing three
  // times as often. Shields are the right buffer rather than more hearts:
  // they are a MANAGED resource that only refills at a campfire or a Safe
  // Path, so the class has to plan for the damage instead of simply having a
  // deeper pool - and a bigger heart pool would have made a wrong answer feel
  // like nothing, which is the mistake v5.1 already made and corrected.
  // Shields also lengthen fights and never shorten them.
  REST_SHIELDS: 18,          // campfire "Repair"
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
  // Cadence 2 was tried and rejected on the numbers. It pushed monster actions
  // to 2.0 a fight, which the party could not absorb: the wipe rate went to
  // ~100% at every accuracy and questions per run FELL from 36 to 23, because
  // runs were ending early. Fewer questions is the one thing this game may
  // never do, so cadence 2 is out regardless of how it feels.
  //
  // Overrides the per-monster `cadence` in content.js, which is 3 everywhere.
  // Kept as a single knob so the number can move for the whole cast at once.
  MONSTER_CADENCE: 3,

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
  // Stakes move SHARDS EARNED and DAMAGE TAKEN. They never move damage DEALT.
  // An earlier system had a Heavy Strike that hit harder and it quietly cut a
  // run from 36 questions to 25 - the exact rule this game exists to protect.
  STAKES_ENABLED: true,
  STAKE_RISKY_SHARDS: 2,     // RISKY pays double...
  STAKE_RISKY_DAMAGE: 2,     // ...and a wrong answer costs double
  // On a question tagged `open: true` the clue alone tells you what to say, so
  // RISKY escalates to answering BLIND - nothing on screen to pick from. This
  // is the old Commit, folded in. It pays more because recall is harder than
  // recognition. It is never offered on selection-only questions: hiding the
  // correct answer from a student who knows it is the one thing this game
  // must never do.
  STAKE_BLIND_SHARDS: 3,
  STAKE_MIN_TIER: 2,         // blind is a reward for the harder half of the bank
  // A landed BLIND call also pays one shield point. Without this, RISKY was a
  // trap: the shards only cash out at a shop several rooms later, while the
  // doubled damage lands immediately, so a class that never risked anything
  // was strictly better off. Paying it on every RISKY overcorrected - a class
  // that always played SAFE then wiped 17 points more often, which is exactly
  // the mandatory-mechanic trap Momentum fell into. Blind calls only, capped
  // per fight, sits between the two. Shields do not shorten fights.
  STAKE_BLIND_SHIELD: 1,
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
  VERSION: "6.1.1",

  SAVE_KEY: "wordrealms_save_v2",
  DEFAULT_UNLOCKED: [1],
};
