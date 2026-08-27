// ---------------------------------------------------------------------------
// CONTENT CHECKER
//
// Validates a realm's question bank before a class ever sees it. Written when
// Realm 2 was authored, because the errors it catches are exactly the ones a
// human makes writing a hundred questions in a sitting - and every one of them
// is invisible until a child is standing in front of the TV.
//
// Run:  node tools/tests/check_content.js
// ---------------------------------------------------------------------------
const fs = require("fs"), vm = require("vm");
const D = __dirname + "/../../";
vm.runInThisContext(fs.readFileSync(D + "js/config.js", "utf8"));
vm.runInThisContext(fs.readFileSync(D + "js/content.js", "utf8"));

let problems = 0;
const bad = (msg) => { problems++; console.log("   !! " + msg); };

function checkBank(realmName, standard, elite) {
  console.log(`\n=== ${realmName} ===`);
  const all = standard.concat(elite);
  const stdKeys = new Set(standard.map(q => q.cover));
  const elKeys = new Set(elite.map(q => q.cover));

  console.log(`standard ${standard.length} · elite ${elite.length} · ` +
              `total ${all.length} · keys ${stdKeys.size}`);

  // --- every question must be structurally sound -------------------------
  //
  // v6.5 added four formats, and each one carries different fields. A shared
  // check would have to be so loose it caught nothing, so the common rules run
  // for everything and then each format is checked on its own terms.
  all.forEach((q, i) => {
    const where = `${realmName} #${i} (${q.cover}${q.format ? "/" + q.format : ""})`;
    if (!q.cover)  bad(`${where}: no cover key`);
    if (!q.clue)   bad(`${where}: no clue`);
    if (typeof q.open !== "boolean")
      bad(`${where}: no open flag, so the stake gate cannot decide about it`);
    if (![1, 2, 3, 4].includes(q.tier))
      bad(`${where}: tier ${q.tier} is outside 1-4`);
    if (!q.type) bad(`${where}: no type label`);

    const fmt = q.format || "choice";
    if (!["choice", "odd", "error", "order"].includes(fmt))
      bad(`${where}: format "${fmt}" is not one the game can render`);

    // Only the two selection formats can go blind, because a blind call means
    // the OPTIONS come off the screen and the class says the answer aloud.
    // There is nothing sayable about a half-built sentence or a mistake nobody
    // can see, so tagging one open would offer the room a call it cannot make.
    if (q.open && !["choice", "odd"].includes(fmt))
      bad(`${where}: a "${fmt}" question cannot be answered blind, so it must ` +
          `not be tagged open`);

    if (fmt === "choice" || fmt === "odd") {
      if (!q.answer) bad(`${where}: no answer`);
      const want = fmt === "odd" ? 4 : 3;
      if (!Array.isArray(q.choices) || q.choices.length < want)
        bad(`${where}: fewer than ${want} choices`);
      if (q.choices && !q.choices.includes(q.answer))
        bad(`${where}: the answer "${q.answer}" is not among its own choices`);
      if (q.choices && new Set(q.choices).size !== q.choices.length)
        bad(`${where}: duplicate choices — one distractor is the answer twice`);
    }

    if (fmt === "error") {
      const bare = w => w.replace(/[.,!?;:'"]+$/g, "");
      if (!q.sentence) bad(`${where}: no sentence to find the mistake in`);
      if (!q.answer)   bad(`${where}: no answer, so no word is the mistake`);
      if (!q.fix)      bad(`${where}: no fix, so the class is told it is wrong ` +
                           `and never told what is right`);
      const words = String(q.sentence || "").split(/\s+/).map(bare);
      // THE trap of this format: the mistake has to actually be in the
      // sentence, spelled the same way. A typo here makes a question nobody
      // can answer, and it looks completely fine in the source.
      if (q.answer && !words.includes(q.answer))
        bad(`${where}: the mistake "${q.answer}" does not appear in the ` +
            `sentence "${q.sentence}"`);
      if (q.answer && words.filter(w => w === q.answer).length > 1)
        bad(`${where}: "${q.answer}" appears twice in the sentence, so there ` +
            `are two right taps and only one of them counts`);
      if (q.answer && q.fix && q.answer === q.fix)
        bad(`${where}: the mistake and the fix are the same word`);
    }

    if (fmt === "order") {
      if (!Array.isArray(q.parts) || q.parts.length < 3)
        bad(`${where}: fewer than 3 pieces to put in order`);
      if (q.parts && new Set(q.parts).size !== q.parts.length)
        bad(`${where}: two pieces are identical, so one correct order marks ` +
            `as wrong depending on which was tapped`);
    }

  });

  // --- the rule the whole stake system rests on --------------------------
  // A question tagged `open` must be answerable from the clue alone. The
  // giveaway that it is NOT is a clue that refers to the options - "choose
  // the correct sentence", "which one", "which list". Getting this wrong is
  // exactly the bug Stein found in v5.1: 19 of 47 questions offered a blind
  // call that nobody could possibly answer.
  // NOTE the exclusions. "Which WORD describes the gate?" is perfectly
  // answerable aloud - a child says "twisted" - so it must not be flagged.
  // What genuinely cannot be answered blind is a clue pointing at the OPTIONS
  // THEMSELVES: "choose the correct sentence", "which list", "which one".
  const REFERS_TO_OPTIONS = /choose the|which (one|sentence|list|opening|pair)\b|which of (these|the following)/i;
  // ...AND the clue does not itself spell out the alternatives. "'Resemble'
  // and 'imitate' are close. Which one means only to LOOK like something?" is
  // perfectly answerable aloud, because the clue names both candidates. The
  // test is therefore: does the clue point at the options AND fail to contain
  // the answer? That is the shape that cannot be answered blind.
  const norml = s => String(s).toLowerCase().replace(/[^a-z0-9 ]/g, " ")
                              .replace(/\s+/g, " ").trim();
  all.filter(q => q.open && q.answer).forEach(q => {
    const clueHasAnswer = norml(q.clue).includes(norml(q.answer));
    if (REFERS_TO_OPTIONS.test(q.clue) && !clueHasAnswer)
      bad(`${realmName} "${q.cover}" is tagged open but its clue points at the ` +
          `options: "${q.clue.slice(0, 60)}..."`);
  });

  // --- coverage ----------------------------------------------------------
  const thin = [...stdKeys].filter(
    k => standard.filter(q => q.cover === k).length < 2);
  if (thin.length)
    bad(`${realmName}: only one standard question for ${thin.join(", ")} — ` +
        `a class that meets it twice gets a repeat`);

  const noElite = [...stdKeys].filter(k => !elKeys.has(k));
  if (noElite.length)
    bad(`${realmName}: no elite version of ${noElite.join(", ")} — the Boss ` +
        `will fall back to the easy question for those items`);

  const orphanElite = [...elKeys].filter(k => !stdKeys.has(k));
  if (orphanElite.length)
    bad(`${realmName}: elite-only keys ${orphanElite.join(", ")} — these never ` +
        `appear in an ordinary fight`);

  // --- the blind-call pool ----------------------------------------------
  // RISKY escalates to a blind call on open questions at or above the tier
  // floor. If that pool is thin the mechanic barely appears.
  const blindable = all.filter(q => q.open && q.tier >= CONFIG.STAKE_MIN_TIER);
  const pct = (blindable.length / all.length * 100).toFixed(0);
  console.log(`blind-call pool  : ${blindable.length} of ${all.length} (${pct}%)`);
  if (blindable.length < all.length * 0.25)
    bad(`${realmName}: only ${pct}% of questions can be called blind — ` +
        `RISKY's best mode will hardly ever be offered`);

  // --- tier spread -------------------------------------------------------
  const tiers = {};
  all.forEach(q => tiers[q.tier] = (tiers[q.tier] || 0) + 1);
  console.log(`tier spread      : ` +
    [1,2,3,4].map(t => `T${t} ${tiers[t] || 0}`).join(" · "));
  [1, 2, 3, 4].forEach(t => {
    if (!tiers[t]) bad(`${realmName}: no tier-${t} questions at all`);
  });

  // --- duplicate QUESTIONS -----------------------------------------------
  // Compare the whole question, not just the clue. Many selection-only
  // questions legitimately share the clue "Choose the correct sentence:" -
  // the options ARE the question - so flagging on the clue alone reported
  // twenty false positives on a perfectly healthy bank.
  //
  // v6.5: the new formats share a generic clue on purpose - "One word is wrong.
  // Tap the mistake." is the instruction, and the SENTENCE is the question.
  // Keying on clue+choices alone reported every one of them as a duplicate of
  // every other, which would have trained whoever ran this to ignore it.
  const seen = {};
  all.forEach(q => {
    const payload = q.format === "error" ? q.sentence
                  : q.format === "order" ? (q.parts || []).join("|")
                  : [...(q.choices || [])].sort().join("|");
    const k = (q.clue + "||" + payload).trim().toLowerCase();
    if (seen[k])
      bad(`${realmName}: two identical questions — "${q.clue.slice(0, 50)}..." ` +
          `with the same options`);
    seen[k] = true;
  });

  // --- a distractor that is accidentally also correct --------------------
  // Cheap heuristic: if a distractor is the answer with different
  // capitalisation or an article, a child who says it aloud is right and the
  // game marks them wrong.
  const norm = s => String(s).toLowerCase().replace(/^(a|an|the)\s+/, "").trim();
  all.forEach(q => {
    (q.choices || []).forEach(c => {
      if (c !== q.answer && norm(c) === norm(q.answer))
        bad(`${realmName} "${q.cover}": distractor "${c}" is the same as the ` +
            `answer "${q.answer}" once articles and case are stripped`);
    });
  });

  // --- boss length -------------------------------------------------------
  // The boss's HP is the count of uncovered curriculum items, clamped by
  // config. If a realm has far more keys than the clamp, the finale can never
  // sweep the whole unit.
  if (stdKeys.size > CONFIG.BOSS_MAX_QUESTIONS)
    console.log(`note             : ${stdKeys.size} keys but the Boss is ` +
      `capped at ${CONFIG.BOSS_MAX_QUESTIONS} questions, so a class that ` +
      `skipped rooms will not be tested on everything`);
}

Object.values(REALMS).filter(r => r.ready).forEach(r => {
  checkBank(`Realm ${r.id} — ${r.name}`, r.questions, r.eliteQuestions || []);
});

console.log(`\nProblems: ${problems}`);
console.log("RESULT:", problems ? "FAIL" : "PASS");
process.exit(problems ? 1 : 0);
