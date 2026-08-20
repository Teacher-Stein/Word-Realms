// ---------------------------------------------------------------------------
// Game flow / event wiring. UI rendering lives in ui.js, data in content.js,
// persistence in state.js, map generation in mapgen.js.
// ---------------------------------------------------------------------------

const EVENT_FLAVORS = [
  { who:"A stranded weather-watcher", text:"Their instruments broke in the storm. Help them fix it (answer a question) or leave them be?",
    tag:null },
  { who:"A shaking radio tower", text:"It might have emergency supplies inside, but it looks unstable. Search it, or walk on?",
    tag:null },
  { who:"A strange calm in the storm", text:"The wind just... stopped. Investigate the eye of the storm, or keep moving before it changes?",
    tag:null },
];

function bootstrap() {
  renderMenu();
  document.getElementById("btn-sound").textContent = STATE.soundOn ? "Sound: On" : "Sound: Off";
  if (STATE.run && REALMS[STATE.run.realmId] && REALMS[STATE.run.realmId].ready) {
    // Resume an in-progress run (e.g. picking back up next class period)
    // instead of dropping the class back to the main menu.
    showScreen("screen-map");
    document.getElementById("turn-banner").textContent = "Welcome back — resuming where the class left off";
    renderTopHud("hud");
    renderMap();
  } else {
    showScreen("screen-menu");
  }
}

// ---------------- Menu / Teacher / How-To wiring ----------------
document.getElementById("btn-teacher").addEventListener("click", () => {
  document.getElementById("teacher-pin-view").style.display = "";
  document.getElementById("teacher-controls").style.display = "none";
  document.getElementById("pin-input").value = "";
  document.getElementById("pin-error").textContent = "";
  showScreen("screen-teacher");
});
document.getElementById("btn-map-teacher")?.addEventListener("click", () => {
  document.getElementById("teacher-pin-view").style.display = "";
  document.getElementById("teacher-controls").style.display = "none";
  showScreen("screen-teacher");
});
document.getElementById("btn-teacher-close").addEventListener("click", () => {
  showScreen(STATE.run ? "screen-map" : "screen-menu");
  if (STATE.run) renderMap();
});
document.getElementById("btn-back-menu").addEventListener("click", () => {
  showScreen("screen-menu"); renderMenu();
});
document.getElementById("pin-submit").addEventListener("click", () => {
  const val = document.getElementById("pin-input").value;
  if (val === CONFIG.TEACHER_PIN) {
    document.getElementById("teacher-pin-view").style.display = "none";
    document.getElementById("teacher-controls").style.display = "";
    renderTeacherRealmList();
    SFX.unlock();
  } else {
    document.getElementById("pin-error").textContent = "Incorrect PIN.";
  }
});
document.getElementById("auto-unlock-toggle").addEventListener("change", (e) => {
  STATE.teacherAutoUnlock = e.target.checked;
  saveState();
});
document.getElementById("btn-reset-run").addEventListener("click", () => {
  if (confirm("Reset the current run? This clears hearts/progress for the active realm.")) {
    STATE.run = null; saveState();
    showScreen("screen-menu"); renderMenu();
  }
});

document.getElementById("btn-howto").addEventListener("click", () => showScreen("screen-howto"));
document.getElementById("btn-howto-close").addEventListener("click", () => {
  showScreen("screen-menu"); renderMenu();
});

document.getElementById("btn-sound").addEventListener("click", () => {
  STATE.soundOn = !STATE.soundOn;
  SFX.setEnabled(STATE.soundOn);
  document.getElementById("btn-sound").textContent = STATE.soundOn ? "Sound: On" : "Sound: Off";
  saveState();
});

document.getElementById("btn-map-menu").addEventListener("click", () => {
  showScreen("screen-menu"); renderMenu();
});

SFX.setEnabled(STATE.soundOn);

// ---------------- Enter realm / map ----------------
window.enterRealm = function(realmId) {
  if (!STATE.run || STATE.run.realmId !== realmId) {
    startNewRun(realmId);
  }
  showScreen("screen-map");
  document.getElementById("turn-banner").textContent = "Pick a student — choose the next path";
  renderTopHud("hud");
  renderMap();
};

window.travelToNode = function(nodeId) {
  const run = STATE.run;
  const map = run.map;
  const node = nodeById(map, nodeId);
  SFX.move();
  run.currentNodeId = nodeId;
  if (!run.visitedNodeIds.includes(nodeId)) run.visitedNodeIds.push(nodeId);
  saveState();

  switch (node.type) {
    case "fight": enterEncounter(node, false); break;
    case "elite": enterEncounter(node, true); break;
    case "event": enterEvent(node); break;
    case "rest": enterRest(node); break;
    case "treasure": enterTreasure(node); break;
    case "safe": enterSafe(node); break;
    case "boss": enterBoss(node); break;
    default: renderMap();
  }
};

function backToMap() {
  renderTopHud("hud");
  showScreen("screen-map");
  renderMap();
}

// ---------------- Fight / Elite ----------------
function enterEncounter(node, isElite) {
  const realm = currentRealm();
  const q = questionByTag(node.tag) || pick(realm.questions);
  if (!STATE.run.askedTags.includes(q.tag)) STATE.run.askedTags.push(q.tag);

  const monster = isElite
    ? realm.monsters[realm.monsters.length - 1] || realm.monsters[0]
    : pick(realm.monsters);

  applyPalette("corridor", realm.palette);
  setMonsterSprite("monster-sprite", monster.sprite);
  document.getElementById("enc-who").textContent =
    `${isElite ? "An Elite " : "A "}${monster.name} blocks the path!`;
  renderQuestionCard(q, "enc-question", "enc-choices", "enc-feedback", (correct) => {
    resolveEncounterAnswer(correct, isElite);
  });
  renderTopHud("enc");
  showScreen("screen-encounter");
}

function resolveEncounterAnswer(correct, isElite) {
  if (correct) {
    SFX.correct();
    const gain = isElite ? 3 : 2;
    addShards(gain);
    setTimeout(() => { renderTopHud("enc"); backToMap(); }, 900);
  } else {
    SFX.wrong();
    const result = damage(isElite ? 2 : 1);
    if (result && result.blocked) {
      SFX.heal();
      document.getElementById("enc-feedback").textContent += " (Lucky Charm saved you!)";
    } else {
      SFX.heartLost();
    }
    setTimeout(() => {
      if (result && result.dead) {
        handleDeath();
      } else {
        renderTopHud("enc");
        backToMap();
      }
    }, 1100);
  }
}

// ---------------- Event ----------------
function enterEvent(node) {
  const realm = currentRealm();
  applyPalette("corridor", realm.palette);
  setMonsterSprite("monster-sprite", "");
  const flavor = pick(EVENT_FLAVORS);
  document.getElementById("enc-who").textContent = flavor.who;
  document.getElementById("enc-question").innerHTML = flavor.text;
  const choicesEl = document.getElementById("enc-choices");
  choicesEl.innerHTML = "";
  document.getElementById("enc-feedback").textContent = "";

  const btnA = document.createElement("div");
  btnA.className = "choice";
  btnA.textContent = "Investigate";
  btnA.addEventListener("click", () => {
    SFX.click();
    const roll = Math.random();
    if (roll < 0.6) {
      addShards(3);
      document.getElementById("enc-feedback").textContent = "You found something useful! +3 Knowledge Shards.";
      SFX.treasure();
    } else {
      const result = damage(1);
      document.getElementById("enc-feedback").textContent = "That went badly. -1 heart.";
      SFX.heartLost();
      if (result && result.dead) { setTimeout(handleDeath, 900); return; }
    }
    setTimeout(() => { renderTopHud("enc"); backToMap(); }, 900);
  });

  const btnB = document.createElement("div");
  btnB.className = "choice";
  btnB.textContent = "Move on";
  btnB.addEventListener("click", () => {
    SFX.click();
    document.getElementById("enc-feedback").textContent = "You continue on, safe but empty-handed.";
    setTimeout(() => backToMap(), 700);
  });

  choicesEl.appendChild(btnA);
  choicesEl.appendChild(btnB);
  renderTopHud("enc");
  showScreen("screen-encounter");
}

// ---------------- Rest ----------------
function enterRest(node) {
  heal(1);
  SFX.heal();
  const realm = currentRealm();
  applyPalette("corridor", realm.palette);
  setMonsterSprite("monster-sprite", "");
  document.getElementById("enc-who").textContent = "A quiet, sheltered spot.";
  document.getElementById("enc-question").textContent = "The party rests and recovers 1 heart.";
  document.getElementById("enc-choices").innerHTML = "";
  document.getElementById("enc-feedback").textContent = "";
  renderTopHud("enc");
  showScreen("screen-encounter");
  setTimeout(() => backToMap(), 1400);
}

// ---------------- Safe path ----------------
function enterSafe(node) {
  const realm = currentRealm();
  applyPalette("corridor", realm.palette);
  setMonsterSprite("monster-sprite", "");
  document.getElementById("enc-who").textContent = "Safe Path";
  document.getElementById("enc-question").textContent = "The party slips past quietly — no risk, but no reward either.";
  document.getElementById("enc-choices").innerHTML = "";
  document.getElementById("enc-feedback").textContent = "";
  renderTopHud("enc");
  showScreen("screen-encounter");
  setTimeout(() => backToMap(), 1200);
}

// ---------------- Treasure ----------------
function enterTreasure(node) {
  const realm = currentRealm();
  const q = pick(realm.questions);
  if (!STATE.run.askedTags.includes(q.tag)) STATE.run.askedTags.push(q.tag);
  applyPalette("corridor", realm.palette);
  setMonsterSprite("monster-sprite", "");
  document.getElementById("enc-who").textContent = "A locked chest hums with old magic.";
  renderQuestionCard(q, "enc-question", "enc-choices", "enc-feedback", (correct) => {
    if (correct) {
      SFX.treasure();
      if (Math.random() < 0.5 && RELIC_POOL.length) {
        const relic = pick(RELIC_POOL.filter(r => !STATE.run.relics.find(x=>x.id===r.id)) . length ?
          RELIC_POOL.filter(r => !STATE.run.relics.find(x=>x.id===r.id)) : RELIC_POOL);
        addRelic(relic);
        document.getElementById("enc-feedback").textContent = `You found a relic: ${relic.name}! (${relic.desc})`;
      } else {
        addShards(5);
        document.getElementById("enc-feedback").textContent = "The chest bursts with Knowledge Shards! +5";
      }
    } else {
      SFX.wrong();
      addShards(1);
      document.getElementById("enc-feedback").textContent = "The lock resists... but you still find a little something. +1 Shard.";
    }
    setTimeout(() => { renderTopHud("enc"); backToMap(); }, 1300);
  }, true);
  renderTopHud("enc");
  showScreen("screen-encounter");
}

// ---------------- Boss ----------------
function enterBoss(node) {
  const run = STATE.run;
  const realm = currentRealm();
  const missing = shuffle((realm.allTags || []).filter(t => !run.askedTags.includes(t)));
  let queue = missing;
  if (queue.length < 4) {
    const filler = shuffle(realm.allTags || []).slice(0, 4 - queue.length);
    queue = queue.concat(filler);
  }
  queue = queue.slice(0, 12); // cap so it never becomes absurd
  run.bossQueue = queue;
  run.bossIndex = 0;
  saveState();

  applyPalette("boss-corridor", realm.palette);
  setMonsterSprite("boss-sprite", realm.boss.sprite);
  renderTopHud("boss");
  showScreen("screen-boss");
  showBossQuestion();
}

function showBossQuestion() {
  const run = STATE.run;
  const realm = currentRealm();
  const tracker = document.getElementById("boss-wave-tracker");
  tracker.innerHTML = "";
  run.bossQueue.forEach((_, i) => {
    const dot = document.createElement("span");
    dot.className = "wave-dot" + (i < run.bossIndex ? " done" : (i === run.bossIndex ? " active" : ""));
    tracker.appendChild(dot);
  });

  document.getElementById("boss-who").textContent =
    `${realm.boss.name} — question ${run.bossIndex + 1} of ${run.bossQueue.length}`;
  const tag = run.bossQueue[run.bossIndex];
  const q = questionByTag(tag) || pick(realm.questions);
  renderQuestionCard(q, "boss-question", "boss-choices", "boss-feedback", (correct) => {
    if (correct) {
      SFX.bossHit();
      addShards(2);
    } else {
      SFX.wrong();
      const result = damage(1);
      SFX.heartLost();
      if (result && result.dead) { setTimeout(handleDeath, 1000); return; }
    }
    run.bossIndex++;
    saveState();
    renderTopHud("boss");
    setTimeout(() => {
      if (run.bossIndex >= run.bossQueue.length) {
        handleVictory();
      } else {
        showBossQuestion();
      }
    }, 900);
  });
}

function handleVictory() {
  SFX.victory();
  const result = clearRealm();
  document.getElementById("result-title").textContent = "Realm Cleared!";
  document.getElementById("result-body").innerHTML = `
    <p>The realm is restored. Every word and grammar point in this unit has now been faced.</p>
    <p>Ember banked: <b>+${result.emberGained}</b></p>
    ${result.nextUnlocked ? "<p>The next realm has automatically unlocked.</p>" :
      "<p>Ask your teacher to unlock the next realm when the class is ready.</p>"}
  `;
  showScreen("screen-result");
}

function handleDeath() {
  SFX.defeat();
  const outcome = handleRunDeath();
  document.getElementById("result-title").textContent = "The Party Has Fallen...";
  let body = "<p>Hearts ran out. The run resets with a brand-new map layout.</p>";
  if (outcome.type === "relic") {
    body += `<p>But the party held onto a relic: <b>${outcome.relic.name}</b> — ${outcome.relic.desc}</p>`;
  } else {
    body += `<p>The party banked their shards as Ember: <b>+${outcome.amount} Ember</b></p>`;
  }
  document.getElementById("result-body").innerHTML = body;
  showScreen("screen-result");
}

document.getElementById("btn-result-continue").addEventListener("click", () => {
  showScreen("screen-menu");
  renderMenu();
});

// ---------------- Question card renderer (shared by fight/elite/treasure/boss) ----------------
function renderQuestionCard(q, questionElId, choicesElId, feedbackElId, onAnswer, isTreasure=false) {
  document.getElementById(questionElId).textContent = q.clue;
  const choicesEl = document.getElementById(choicesElId);
  choicesEl.innerHTML = "";
  document.getElementById(feedbackElId).textContent = "";
  const options = shuffle(q.choices);
  options.forEach(opt => {
    const div = document.createElement("div");
    div.className = "choice";
    div.textContent = opt;
    div.addEventListener("click", () => {
      if (div.classList.contains("locked")) return;
      choicesEl.querySelectorAll(".choice").forEach(c => c.classList.add("locked"));
      const correct = opt === q.answer;
      div.classList.add(correct ? "correct" : "incorrect");
      if (!correct) {
        choicesEl.querySelectorAll(".choice").forEach(c => {
          if (c.textContent === q.answer) c.classList.add("reveal-correct");
        });
      }
      document.getElementById(feedbackElId).textContent = correct
        ? "Correct!"
        : `Not quite — the answer was "${q.answer}".`;
      onAnswer(correct);
    });
    choicesEl.appendChild(div);
  });
}

bootstrap();
