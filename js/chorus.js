// ---------------------------------------------------------------------------
// THE CHORUS
//
// The whole class answers one question at the same time - fingers, mini
// whiteboards, hands, whatever the room already uses - and the teacher taps one
// of three buttons for how it went.
//
// This exists because of an uncomfortable arithmetic. A lesson is about forty
// questions. Twenty-four children are in the room. So each child answers under
// two questions, and spends the other thirty-eight watching somebody else
// think. RULE ONE says review volume is the entire point of the game, and the
// ordinary loop was collecting one twenty-fourth of the volume available.
//
// Three Chorus questions a room, two or three rooms a run, turns roughly six
// answers into roughly a hundred and forty.
//
// Three design decisions worth keeping written down:
//
//   ONE TAP, NOT TWO. The obvious design shows the question, waits for a "show
//   the answer" press, then asks the teacher to judge. That is two taps per
//   question while twenty-four children wait. Here the three judge buttons are
//   on screen from the start: the room answers, one tap scores it AND reveals
//   the correct answer together.
//
//   IT CANNOT COST A HEART. A Chorus is not a fight. Making a whole class wrong
//   together cost damage would teach them to dread the room, and the room's
//   whole job is to get everyone answering. It pays less than a fight instead,
//   so walking into one is still a real choice on the map.
//
//   SELECTION QUESTIONS ONLY. Twenty-four children cannot each put four
//   fragments in order on their fingers. drawChorusQuestion() enforces it.
// ---------------------------------------------------------------------------

let CHORUS = null;   // { queue, asked, results, onDone, boss }

function chorusEls() {
  return {
    question: "cho-question",
    choices:  "cho-choices",
    feedback: "cho-feedback",
  };
}

// Start a Chorus. `onDone` is called when the last question has been judged;
// a Chorus room passes a return-to-map, the boss passes "carry on fighting".
function startChorus(count, onDone, opts = {}) {
  const realm = currentRealm();
  if (!STATE.run || !realm) return;
  CHORUS = {
    total: count,
    asked: 0,
    results: [],
    onDone: onDone || (() => {}),
    boss: !!opts.boss,
  };
  MUSIC.play(opts.boss ? "boss" : "explore");
  if (typeof coach === "function") coach("chorus");
  renderTopHud("cho");
  $("cho-realm-name").textContent = realm.name;
  $("cho-lead").textContent = opts.lead ||
    "Everyone answers this one. Hands up, fingers out, or write it down.";
  showScreen("screen-chorus");
  nextChorusQuestion();
}

function nextChorusQuestion() {
  if (!CHORUS) return;
  if (CHORUS.asked >= CHORUS.total) return finishChorus();

  const realm = currentRealm();
  const q = drawChorusQuestion(realm);
  if (!q) return finishChorus();

  CHORUS.q = q;
  CHORUS.asked++;
  CHORUS.judged = false;

  $("cho-progress").textContent = `${CHORUS.asked} of ${CHORUS.total}`;
  $("cho-question").innerHTML =
    `<span class="q-type">${q.type}</span>${escapeHtml(q.clue)}`;

  // The options are SHOWN, not offered. Every child in the room is answering,
  // so there is nothing for one person to click - and a clickable option here
  // would invite exactly the single-student answer the Chorus exists to avoid.
  const box = $("cho-choices");
  box.className = "choices chorus-choices";
  box.innerHTML = "";
  shuffle(q.choices).forEach(opt => {
    const div = document.createElement("div");
    div.className = "choice chorus-option";
    div.dataset.opt = opt;
    div.textContent = opt;
    box.appendChild(div);
  });

  // The record has to be opened here, exactly as renderQuestion does it, or the
  // judge below has nothing to book its answer against.
  beginAsk(q);

  $("cho-judge").style.display = "";
  $("cho-result").textContent = "";
  $("cho-result").className = "chorus-result";
  $("cho-next").style.display = "none";
  $("cho-feedback").textContent = "";
}

// One tap: score the room, reveal the answer, pay out.
function judgeChorus(level) {
  if (!CHORUS || CHORUS.judged || !CHORUS.q) return;
  CHORUS.judged = true;
  const q = CHORUS.q;
  const run = STATE.run;

  // "About half" counts as NOT known for the teaching record. That reads harsh
  // until you remember what the record is for: half a class unable to do
  // question tags is a thing to reteach, not a pass. The three levels are kept
  // separately alongside, so nothing is lost by the simplification.
  const correct = level === "good";

  document.querySelectorAll("#cho-choices .chorus-option").forEach(el => {
    el.classList.add("locked");
    if (el.dataset.opt === q.answer) el.classList.add("correct");
  });

  logAnswer(q, correct, level);
  run.stats[correct ? "correct" : "wrong"]++;
  run.answeredThisRoom = true;

  const pay = CONFIG.CHORUS_REWARD[level] || CONFIG.CHORUS_REWARD.poor;
  const gained = addShards(pay.shards);
  if (pay.shields) addShields(pay.shields);

  CHORUS.results.push(level);
  const said = { good: "Nearly everyone had it",
                 half: "About half the room",
                 poor: "Only a few" }[level];
  const res = $("cho-result");
  res.className = "chorus-result " + level;
  res.innerHTML = `<b>${said}.</b> The answer was “${escapeHtml(q.answer)}”.` +
    `<span class="chorus-pay">+${gained} shards` +
    (pay.shields ? ` · +${pay.shields} shields` : "") + `</span>`;

  if (level === "good") SFX.unlockChime();
  else if (level === "poor") SFX.wrong();
  else SFX.click();
  $("cho-judge").style.display = "none";
  $("cho-next").style.display = "";
  $("cho-next").textContent = CHORUS.asked >= CHORUS.total
    ? (CHORUS.boss ? "Back to the fight" : "Leave the Chorus")
    : "Next question";
  renderTopHud("cho");
  saveState();
}

function finishChorus() {
  const c = CHORUS;
  CHORUS = null;
  if (!c) return;
  const good = c.results.filter(r => r === "good").length;
  if (!c.boss) {
    showPopup({
      banner: "THE CHORUS FADES", tone: good >= c.total - 1 ? "good" : "coach",
      title: `${good} of ${c.results.length} sung clean`,
      effect: "Every voice counted",
      desc: good === c.results.length
        ? "The whole room had all of them. That is the sound the storm cannot argue with."
        : "The ones that wobbled are worth another look before the boss.",
      button: "Onward",
      onClose: () => c.onDone(),
    });
  } else {
    c.onDone();
  }
}

// ---- wiring ---------------------------------------------------------------
document.addEventListener("click", ev => {
  const btn = ev.target.closest("#cho-judge .pixel-btn");
  if (!btn || !CHORUS) return;
  SFX.click();
  judgeChorus(btn.dataset.level);
});

// A Chorus ROOM on the map.
function enterChorusRoom() {
  startChorus(CONFIG.CHORUS_QUESTIONS, () => backToMap(true), {
    lead: "The storm wants to hear the whole class. Everyone answers.",
  });
}
