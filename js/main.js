// ---------------------------------------------------------------------------
// Game flow and event wiring.
// ---------------------------------------------------------------------------

function $(id) { return document.getElementById(id); }

// ===================== BOOT =====================
function bootstrap() {
  renderMenu();
  $("btn-sound").textContent = STATE.soundOn ? "Sound: On" : "Sound: Off";
  SFX.setEnabled(STATE.soundOn);

  if (STATE.run && REALMS[STATE.run.realmId] && REALMS[STATE.run.realmId].ready) {
    // resume mid-realm (e.g. next class period on the same computer)
    showScreen("screen-map");
    $("turn-hint").textContent = "Welcome back — resuming where the class left off";
    if (!STATE.run.currentStudent) nextStudent();
    renderTopHud("hud");
    renderMap();
    renderStudentChips();
  } else {
    showScreen("screen-menu");
  }
}

// ===================== MENU / NAV =====================
$("btn-sound").addEventListener("click", () => {
  STATE.soundOn = !STATE.soundOn;
  SFX.setEnabled(STATE.soundOn);
  SFX.unlock();
  $("btn-sound").textContent = STATE.soundOn ? "Sound: On" : "Sound: Off";
  saveState();
});

$("btn-howto").addEventListener("click", () => { SFX.click(); showScreen("screen-howto"); });
$("btn-howto-close").addEventListener("click", () => { SFX.click(); showScreen("screen-menu"); renderMenu(); });

$("btn-map-menu").addEventListener("click", () => { SFX.click(); showScreen("screen-menu"); renderMenu(); });

// ---- roster ----
$("btn-roster").addEventListener("click", () => {
  SFX.click(); SFX.unlock();
  $("roster-class").value = STATE.roster ? STATE.roster.className : "";
  $("roster-names").value = STATE.roster ? STATE.roster.students.join("\n") : "";
  updateRosterCount();
  showScreen("screen-roster");
});
$("roster-names").addEventListener("input", updateRosterCount);
function updateRosterCount() {
  const n = parseRosterNames().length;
  $("roster-count").textContent = n ? `${n} warriors ready` : "No students entered yet";
}
function parseRosterNames() {
  return $("roster-names").value.split("\n")
    .map(s => s.trim()).filter(Boolean);
}
$("roster-save").addEventListener("click", () => {
  const cls = $("roster-class").value.trim() || "Unnamed class";
  const names = parseRosterNames();
  if (!names.length) { $("roster-count").textContent = "Add at least one student."; return; }
  setRoster(cls, names);
  SFX.unlockChime();
  showScreen("screen-menu");
  renderMenu();
});
$("roster-close").addEventListener("click", () => { SFX.click(); showScreen("screen-menu"); renderMenu(); });

// ---- leaderboards ----
$("btn-scores").addEventListener("click", () => {
  SFX.click(); renderLeaderboards(); showScreen("screen-scores");
});
$("scores-close").addEventListener("click", () => { SFX.click(); showScreen("screen-menu"); renderMenu(); });
document.querySelectorAll(".tab-btn").forEach(btn => {
  btn.addEventListener("click", () => {
    document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
    document.querySelectorAll(".tab-panel").forEach(p => p.classList.remove("active"));
    btn.classList.add("active");
    $(btn.dataset.tab).classList.add("active");
    SFX.click();
  });
});

// ---- teacher ----
function openTeacher() {
  $("teacher-pin-view").style.display = "";
  $("teacher-controls").style.display = "none";
  $("confirm-box").style.display = "none";
  $("pin-input").value = "";
  $("pin-error").textContent = "";
  showScreen("screen-teacher");
}
$("btn-teacher").addEventListener("click", () => { SFX.click(); openTeacher(); });
$("btn-map-teacher").addEventListener("click", () => { SFX.click(); openTeacher(); });
$("pin-submit").addEventListener("click", () => {
  if ($("pin-input").value === CONFIG.TEACHER_PIN) {
    $("teacher-pin-view").style.display = "none";
    $("teacher-controls").style.display = "";
    renderTeacherRealmList();
    SFX.unlockChime();
  } else {
    $("pin-error").textContent = "Incorrect PIN.";
    SFX.wrong();
  }
});
$("pin-input").addEventListener("keydown", e => { if (e.key === "Enter") $("pin-submit").click(); });
$("auto-unlock-toggle").addEventListener("change", e => {
  STATE.teacherAutoUnlock = e.target.checked; saveState();
});
$("btn-teacher-close").addEventListener("click", () => {
  SFX.click();
  if (STATE.run) { showScreen("screen-map"); renderTopHud("hud"); renderMap(); }
  else { showScreen("screen-menu"); renderMenu(); }
});

// in-page confirmation (native confirm() can be blocked or missed on a TV)
let pendingConfirm = null;
function askConfirm(text, fn) {
  $("confirm-text").textContent = text;
  $("confirm-box").style.display = "";
  pendingConfirm = fn;
}
$("confirm-no").addEventListener("click", () => {
  $("confirm-box").style.display = "none"; pendingConfirm = null; SFX.click();
});
$("confirm-yes").addEventListener("click", () => {
  if (pendingConfirm) pendingConfirm();
  $("confirm-box").style.display = "none";
  pendingConfirm = null;
});
$("btn-reset-run").addEventListener("click", () => {
  SFX.click();
  askConfirm("Reset the current run? The class loses this realm's progress, hearts and relics.", () => {
    STATE.run = null; saveState();
    showScreen("screen-menu"); renderMenu();
  });
});
$("btn-factory").addEventListener("click", () => {
  SFX.click();
  askConfirm("Factory reset wipes EVERYTHING: roster, warrior stats, leaderboards, Ember and unlocks. This cannot be undone.", () => {
    factoryReset();
    showScreen("screen-menu"); renderMenu();
  });
});

// ===================== ENTER REALM =====================
window.enterRealm = function (realmId) {
  SFX.unlock();
  if (!STATE.run || STATE.run.realmId !== realmId) startNewRun(realmId);
  if (!STATE.run.currentStudent) nextStudent();
  showScreen("screen-map");
  $("turn-hint").textContent = "Pick a glowing room to enter";
  renderTopHud("hud");
  renderMap();
  renderStudentChips();
};

// Run `fn` once every queued popup has been dismissed, so the class always
// sees a reward card before the game moves on.
function afterPopups(fn) {
  if (!popupsPending()) { fn(); return; }
  const iv = setInterval(() => {
    if (!popupsPending()) { clearInterval(iv); fn(); }
  }, 140);
}

function backToMap(advanceTurn = true) {
  if (!STATE.run) return;
  if (advanceTurn) nextStudent();
  renderTopHud("hud");
  showScreen("screen-map");
  renderMap();
  renderStudentChips();
  $("turn-hint").textContent = "Pick a glowing room to enter";
}

// reroll buttons (student absent)
["btn-reroll", "btn-reroll-enc", "btn-reroll-boss"].forEach(id => {
  $(id).addEventListener("click", () => {
    SFX.click();
    rerollStudent();
    renderStudentChips();
  });
});
$("btn-recenter").addEventListener("click", () => { SFX.click(); centreOnCurrent(true); });
window.addEventListener("resize", () => { if (STATE.run) centreOnCurrent(false); });

// ===================== TRAVEL =====================
window.travelToNode = function (nodeId) {
  const run = STATE.run;
  const node = nodeById(run.map, nodeId);
  const fromId = run.currentNodeId;

  // disable further clicks while the totem walks
  document.querySelectorAll(".map-node.reachable")
    .forEach(el => el.classList.remove("reachable"));
  $("turn-hint").textContent = "Moving...";

  walkTotemTo(fromId, nodeId, () => {
    run.currentNodeId = nodeId;
    if (!run.visitedNodeIds.includes(nodeId)) run.visitedNodeIds.push(nodeId);
    saveState();
    centreOnCurrent(true);
    setTimeout(() => {
      switch (node.type) {
        case "fight":    startFight(false); break;
        case "elite":    startFight(true);  break;
        case "event":    enterEvent();      break;
        case "rest":     enterRest();       break;
        case "treasure": enterTreasure();   break;
        case "safe":     enterSafe();       break;
        case "shop":     enterShop(nodeId);  break;
        case "boss":     startBoss();       break;
        default:         backToMap(false);
      }
    }, 380);
  });
};

// ===================== SHARED QUESTION RENDERER =====================
function renderQuestion(q, ids, onAnswer) {
  $(ids.question).innerHTML =
    `<span class="q-type">${q.type}</span>${escapeHtml(q.clue)}`;
  const choicesEl = $(ids.choices);
  choicesEl.innerHTML = "";
  $(ids.feedback).textContent = "";
  $(ids.feedback).className = "enc-feedback";

  // Potion of Clarity: grey out one wrong option before anyone answers
  let trimmed = null;
  if (STATE.run && STATE.run.clarityActive) {
    const wrongs = q.choices.filter(c => c !== q.answer);
    if (wrongs.length) trimmed = pick(wrongs);
    STATE.run.clarityActive = false;
    saveState();
  }

  shuffle(q.choices).forEach(opt => {
    const div = document.createElement("div");
    div.className = "choice" + (opt === trimmed ? " removed locked" : "");
    div.textContent = opt;
    div.addEventListener("click", () => {
      if (div.classList.contains("locked") || div.classList.contains("removed")) return;
      choicesEl.querySelectorAll(".choice").forEach(c => c.classList.add("locked"));
      const correct = opt === q.answer;
      div.classList.add(correct ? "correct" : "incorrect");
      if (!correct) {
        choicesEl.querySelectorAll(".choice").forEach(c => {
          if (c.textContent === q.answer) c.classList.add("reveal-correct");
        });
      }
      const fb = $(ids.feedback);
      fb.textContent = correct ? "Correct!" : `Not quite — the answer was "${q.answer}".`;
      fb.className = "enc-feedback " + (correct ? "good" : "bad");
      onAnswer(correct);
    });
    choicesEl.appendChild(div);
  });
  if (trimmed) {
    const fb = $(ids.feedback);
    fb.textContent = "Potion of Clarity removed a wrong answer!";
    fb.className = "enc-feedback good";
  }
}

// ===================== FIGHT / ELITE =====================
function startFight(isElite) {
  $("btn-use-item").style.display = "none";
  const realm = currentRealm();
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  const run = STATE.run;
  const monster = isElite ? pick(realm.elites) : pick(realm.monsters);
  let maxHp = isElite ? CONFIG.ELITE_HP : CONFIG.MONSTER_HP;
  if (isElite && hasRelic("thunder_sigil")) maxHp = Math.max(2, maxHp - 1);

  run.encounter = {
    monster, isElite, hp: maxHp, maxHp,
    teamUpUsed: false,
    helpers: [],
  };
  saveState();

  applySky("corridor-sky", realm.sky);
  $("monster-sprite").src = monster.sprite;
  $("enc-who").textContent = monster.taunt;
  renderMonsterHp("monster-hp", maxHp, maxHp);
  renderTopHud("enc");
  renderStudentChips();
  showScreen("screen-encounter");
  animateSprite("monster-sprite", "arriving", 560);
  SFX.doorOpen();
  if (isElite) setTimeout(() => SFX.bossRoar(), 220);

  updateTeamUpButton("btn-teamup");
  askFightQuestion();
}

function askFightQuestion() {
  const realm = currentRealm();
  const q = drawQuestion(realm);
  STATE.run.encounter.currentQ = q;
  renderQuestion(q, {
    question: "enc-question", choices: "enc-choices", feedback: "enc-feedback",
  }, correct => resolveFightAnswer(correct, q));
}

function resolveFightAnswer(correct, q) {
  const run = STATE.run;
  const enc = run.encounter;
  const student = run.currentStudent;
  $("btn-teamup").disabled = true;

  if (correct) {
    markCovered(q.cover);
    run.stats.correct++;
    bumpStat(student, "correct");
    enc.hp--;
    // credit any partner who was brought in for this monster
    enc.helpers.forEach(h => bumpStat(h, "correct"));
    SFX.playerHit();
    playSlash("slash-fx");
    animateSprite("monster-sprite", "hurt", 520);
    renderMonsterHp("monster-hp", enc.hp, enc.maxHp);
    saveState();

    if (enc.hp <= 0) {
      // monster defeated
      setTimeout(() => {
        SFX.monsterDown();
        animateSprite("monster-sprite", "dying", 820);
        const gain = enc.isElite ? CONFIG.SHARDS_ELITE : CONFIG.SHARDS_FIGHT;
        addShards(gain);
        run.stats.monsters++;
        bumpStat(student, "monsters");
        enc.helpers.forEach(h => bumpStat(h, "monsters"));
        renderTopHud("enc");

        showPopup({
          banner: "MONSTER DEFEATED", tone: "good",
          title: enc.monster.name + " falls!",
          effect: `+${gain} Knowledge Shards`,
          desc: enc.isElite
            ? "An Elite guardian - the party is stronger for it."
            : "The path ahead is clear.",
          extra: `Felled by ${student}${enc.helpers.length ? " & " + enc.helpers.join(" & ") : ""}`,
        });

        // elites always drop a relic
        if (enc.isElite) {
          const relic = availableRelic();
          if (relic) {
            addRelic(relic);
            bumpStat(student, "relics");
            showPopup({
              banner: "RELIC FOUND", tone: "", icon: relic.icon,
              title: relic.name, effect: relic.effect, desc: relic.desc,
              onClose: () => SFX.relic(),
            });
          }
        }
        run.encounter = null;
        saveState();
        afterPopups(() => backToMap(true));
      }, 520);
    } else {
      // still standing - next student takes the next swing
      setTimeout(() => {
        nextStudent();
        renderStudentChips();
        enc.teamUpUsed = false;      // new student may call their own partner
        enc.helpers = [];
        updateTeamUpButton("btn-teamup");
        askFightQuestion();
      }, 1250);
    }
  } else {
    // monster attacks
    run.stats.wrong++;
    bumpStat(student, "wrong");
    setTimeout(() => {
      SFX.monsterAttack();
      animateSprite("monster-sprite", "attack", 640);
      setTimeout(() => {
        const res = damage(1);
        playHitFlash("hit-flash", "corridor");
        if (res.blocked) {
          SFX.heal();
          $("enc-feedback").textContent += ` ${res.blockedBy} absorbed the hit!`;
        } else {
          SFX.heartLost();
          bumpStat(student, "damage");
        }
        renderTopHud("enc");
        setTimeout(() => {
          if (res.dead) { handleDeath(); return; }
          nextStudent();
          renderStudentChips();
          enc.teamUpUsed = false;
          enc.helpers = [];
          updateTeamUpButton("btn-teamup");
          askFightQuestion();
        }, 1100);
      }, 330);
    }, 700);
  }
}

// ---- team up ----
function updateTeamUpButton(btnId) {
  const run = STATE.run;
  const ctx = btnId === "btn-teamup" ? run.encounter : run.boss;
  const btn = $(btnId);
  if (!ctx) { btn.disabled = true; return; }
  const rosterOk = STATE.roster && STATE.roster.students.length > 1;
  btn.disabled = !rosterOk ||
    (CONFIG.TEAMUP_ONCE_PER_MONSTER && ctx.teamUpUsed);
  btn.textContent = ctx.teamUpUsed
    ? "Team Up used"
    : `Team Up (+${CONFIG.TEAMUP_HP_COST} monster HP)`;
}

function doTeamUp(btnId, hpElId, feedbackId) {
  const run = STATE.run;
  const ctx = btnId === "btn-teamup" ? run.encounter : run.boss;
  if (!ctx || ctx.teamUpUsed) return;

  const partner = nextStudent(run.currentStudent);
  ctx.teamUpUsed = true;
  ctx.helpers = ctx.helpers || [];
  if (partner) ctx.helpers.push(partner);
  // pausing to bring a partner in gives the monster time to recover,
  // unless the Iron Bell relic makes the call instant
  const hpCost = hasRelic("iron_bell") ? 0 : CONFIG.TEAMUP_HP_COST;
  ctx.maxHp += hpCost;
  ctx.hp    += hpCost;
  run.stats.teamups++;
  bumpStat(run.currentStudent, "teamups");
  saveState();

  SFX.teamup();
  renderMonsterHp(hpElId, ctx.hp, ctx.maxHp, hpCost ? ctx.maxHp - 1 : -1);
  showPopup({
    banner: "TEAM UP", tone: "good",
    title: partner ? `${partner} joins the fight!` : "A partner joins the fight!",
    effect: hpCost
      ? `The monster recovers ${hpCost} HP while you confer`
      : "The Iron Bell rings — no HP cost!",
    desc: "Both warriors share the credit for this monster.",
  });
  updateTeamUpButton(btnId);
}

$("btn-teamup").addEventListener("click", () =>
  doTeamUp("btn-teamup", "monster-hp", "enc-feedback"));
$("btn-teamup-boss").addEventListener("click", () =>
  doTeamUp("btn-teamup-boss", "boss-hp", "boss-feedback"));

// ===================== EVENT =====================
function enterEvent() {
  $("btn-use-item").style.display = "none";
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  const realm = currentRealm();
  const ev = pick(REALM1_EVENTS);
  applySky("corridor-sky", realm.sky);
  $("monster-sprite").src = realm.npc.sprite;
  renderMonsterHp("monster-hp", 0, 0);
  $("monster-hp").innerHTML = "";
  $("enc-who").textContent = ev.who;
  $("enc-question").textContent = ev.text;
  $("btn-teamup").disabled = true;
  const choices = $("enc-choices");
  choices.innerHTML = "";
  $("enc-feedback").textContent = "";
  $("enc-feedback").className = "enc-feedback";

  const mk = (label, risky) => {
    const div = document.createElement("div");
    div.className = "choice";
    div.textContent = label;
    div.addEventListener("click", () => {
      choices.querySelectorAll(".choice").forEach(c => c.classList.add("locked"));
      SFX.click();
      const fb = $("enc-feedback");
      if (!risky) {
        showPopup({
          banner: "MOVED ON", tone: "neutral", title: "You walk away",
          effect: "No risk, no reward",
          desc: "Sometimes that's the wise call.",
        });
        afterPopups(() => backToMap(true));
        return;
      }
      if (Math.random() < 0.62) {
        addShards(4);
        SFX.treasure();
        renderTopHud("enc");
        showPopup({
          banner: "IT PAYS OFF", tone: "good", title: "A good decision",
          effect: "+4 Knowledge Shards",
          desc: "The Storm Chaser nods approvingly.",
          extra: `Chosen by ${STATE.run.currentStudent}`,
        });
        afterPopups(() => backToMap(true));
      } else {
        SFX.monsterAttack();
        playHitFlash("hit-flash", "corridor");
        const res = damage(1);
        if (!res.blocked) bumpStat(STATE.run.currentStudent, "damage");
        SFX.heartLost();
        fb.textContent = res.blocked
          ? "It goes badly — but the Lucky Charm absorbs it!"
          : "It goes badly. The party loses a heart.";
        fb.className = "enc-feedback bad";
        renderTopHud("enc");
        setTimeout(() => {
          if (res.dead) handleDeath(); else backToMap(true);
        }, 1500);
      }
    });
    return div;
  };
  choices.appendChild(mk(ev.optionA, true));
  choices.appendChild(mk(ev.optionB, false));

  renderTopHud("enc");
  renderStudentChips();
  showScreen("screen-encounter");
  animateSprite("monster-sprite", "arriving", 560);
}

// ===================== REST =====================
function enterRest() {
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  const realm = currentRealm();
  const before = STATE.run.hearts;
  const amount = hasRelic("warm_cloak") ? 2 : 1;
  heal(amount);
  const healed = STATE.run.hearts - before;
  SFX.heal();
  applySky("corridor-sky", realm.sky);
  $("monster-sprite").src = "";
  $("monster-hp").innerHTML = "";
  $("enc-who").textContent = "A sheltered chamber, out of the wind.";
  $("enc-question").textContent = "The party sets down their packs.";
  $("enc-choices").innerHTML = "";
  $("enc-feedback").textContent = "";
  $("btn-teamup").disabled = true;
  $("btn-use-item").style.display = "none";
  renderTopHud("enc");
  renderStudentChips();
  showScreen("screen-encounter");
  showPopup({
    banner: "REST", tone: "good", title: "A sheltered chamber",
    effect: healed > 0
      ? `+${healed} heart${healed > 1 ? "s" : ""}`
      : "Already at full health",
    desc: hasRelic("warm_cloak")
      ? "Your Warm Cloak makes the rest twice as restorative."
      : "The wind can't reach you here.",
    extra: `Hearts: ${STATE.run.hearts}/${STATE.run.maxHearts}`,
  });
  afterPopups(() => backToMap(true));
}

// ===================== SAFE PATH =====================
function enterSafe() {
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  const realm = currentRealm();
  applySky("corridor-sky", realm.sky);
  $("monster-sprite").src = "";
  $("monster-hp").innerHTML = "";
  $("enc-who").textContent = "Safe Path — a quiet stretch of corridor";
  $("enc-question").textContent =
    "No danger here, and no reward. A good moment to use something from your pack.";
  $("enc-choices").innerHTML = "";
  $("enc-feedback").textContent = "";
  $("btn-teamup").disabled = true;

  // Safe rooms are the one place the party can spend a potion freely.
  const useBtn = $("btn-use-item");
  const havePotions = STATE.run.potions.length > 0;
  useBtn.style.display = "";
  useBtn.disabled = !havePotions;
  useBtn.textContent = havePotions
    ? `Use an Item (${STATE.run.potions.length})`
    : "No items to use";
  useBtn.onclick = () => openInventory({ usable: true, from: "safe" });

  const choices = $("enc-choices");
  const cont = document.createElement("div");
  cont.className = "choice";
  cont.textContent = "Move on";
  cont.addEventListener("click", () => {
    SFX.move();
    useBtn.style.display = "none";
    backToMap(true);
  });
  choices.appendChild(cont);

  renderTopHud("enc");
  renderStudentChips();
  showScreen("screen-encounter");
  SFX.move();
}

// ===================== SHOP =====================
function enterShop(nodeId) {
  SFX.doorOpen();
  STATE.run.activeShopNode = nodeId;
  saveState();
  renderShop(nodeId);
  showScreen("screen-shop");
}

window.shopBuy = function (nodeId, kind, index) {
  const res = buyFromShop(nodeId, kind, index);
  const fb = $("shop-feedback");
  if (!res.ok) {
    SFX.wrong();
    fb.textContent = res.reason === "poor"
      ? "Not enough Knowledge Shards for that."
      : "That one's already gone.";
    fb.className = "shop-feedback bad";
    return;
  }
  SFX.treasure();
  if (kind === "relics") {
    bumpStat(STATE.run.currentStudent, "relics");
    SFX.relic();
  }
  showPopup({
    banner: kind === "relics" ? "RELIC PURCHASED" : "POTION PURCHASED",
    tone: "good", icon: res.item.icon,
    title: res.item.name, effect: res.item.effect, desc: res.item.desc,
    extra: `Bought by ${STATE.run.currentStudent} · ${STATE.run.shards} shards left`,
  });
  renderShop(nodeId);
};

$("shop-leave").addEventListener("click", () => {
  SFX.click();
  STATE.run.activeShopNode = null;
  saveState();
  backToMap(true);
});

// ===================== INVENTORY =====================
let _inventoryReturn = null;
function openInventory(opts = {}) {
  SFX.click();
  _inventoryReturn = opts.from || null;
  renderInventory({
    usable: !!opts.usable,
    onUse: id => usePotion(id),
  });
  showScreen("screen-inventory");
}

function usePotion(id) {
  const p = potionById(id);
  if (!p || !consumePotion(id)) return;
  const run = STATE.run;
  let effectText = p.effect;

  if (id === "potion_heal") {
    const before = run.hearts;
    heal(2);
    effectText = `+${run.hearts - before} heart${run.hearts - before === 1 ? "" : "s"}`;
    SFX.heal();
  } else if (id === "potion_shield") {
    run.shieldActive = true;
    SFX.unlockChime();
  } else if (id === "potion_clarity") {
    run.clarityActive = true;
    SFX.unlockChime();
  }
  saveState();

  showPopup({
    banner: "POTION USED", tone: "good", icon: p.icon,
    title: p.name, effect: effectText, desc: p.desc,
    extra: id === "potion_heal"
      ? `Hearts: ${run.hearts}/${run.maxHearts}`
      : "Active on the next question.",
  });
  renderInventory({ usable: true, onUse: usePotion });
  ["hud", "enc", "boss"].forEach(renderTopHudSafe);
}

function renderTopHudSafe(prefix) {
  try { renderTopHud(prefix); } catch (e) { /* screen not present */ }
}

$("inv-close").addEventListener("click", () => {
  SFX.click();
  if (_inventoryReturn === "safe") {
    const useBtn = $("btn-use-item");
    const n = STATE.run.potions.length;
    useBtn.disabled = n === 0;
    useBtn.textContent = n ? `Use an Item (${n})` : "No items to use";
    showScreen("screen-encounter");
  } else {
    showScreen("screen-map");
    renderTopHud("hud");
    renderMap();
  }
  _inventoryReturn = null;
});

$("btn-inventory").addEventListener("click", () => openInventory({ usable: false }));

// ===================== TREASURE =====================
function enterTreasure() {
  $("btn-use-item").style.display = "none";
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  const realm = currentRealm();
  const q = drawQuestion(realm);
  applySky("corridor-sky", realm.sky);
  $("monster-sprite").src = "";
  $("monster-hp").innerHTML = "";
  $("enc-who").textContent = "A locked chest hums with old storm-magic.";
  $("btn-teamup").disabled = true;
  renderTopHud("enc");
  renderStudentChips();
  showScreen("screen-encounter");

  renderQuestion(q, {
    question: "enc-question", choices: "enc-choices", feedback: "enc-feedback",
  }, correct => {
    const run = STATE.run;
    const student = run.currentStudent;
    if (correct) {
      markCovered(q.cover);
      run.stats.correct++;
      bumpStat(student, "correct");
      SFX.treasure();
      const bonus = hasRelic("storm_map") ? 3 : 0;
      const relic = (hasRelic("scholars_lens") || Math.random() < 0.45)
        ? availableRelic() : null;
      if (relic) {
        addRelic(relic);
        bumpStat(student, "relics");
        showPopup({
          banner: "RELIC FOUND", tone: "", icon: relic.icon,
          title: relic.name, effect: relic.effect, desc: relic.desc,
          onClose: () => SFX.relic(),
        });
      } else {
        const amount = CONFIG.SHARDS_TREASURE + bonus;
        addShards(amount);
        showPopup({
          banner: "TREASURE", tone: "good", title: "The chest bursts open!",
          effect: `+${amount} Knowledge Shards`,
          desc: bonus ? "Your Storm-Worn Map led you to the deeper cache." : "",
          extra: `Opened by ${student}`,
        });
      }
    } else {
      run.stats.wrong++;
      bumpStat(student, "wrong");
      SFX.wrong();
      addShards(1);
      showPopup({
        banner: "LOCKED", tone: "bad", title: "The lock holds firm",
        effect: "+1 Knowledge Shard",
        desc: "You scrape a little something from the hinges before moving on.",
      });
    }
    renderTopHud("enc");
    afterPopups(() => backToMap(true));
  });
}

// ===================== BOSS =====================
function startBoss() {
  const realm = currentRealm();
  const run = STATE.run;
  clearCorridorFx("boss-corridor", "boss-hit-flash", "boss-slash-fx");

  // The boss tests every curriculum item the class hasn't faced yet, so
  // skipping rooms means a longer boss rather than skipped content.
  const missing = realm.coverKeys.filter(k => !run.coveredKeys.includes(k));
  let queue = shuffle(missing);
  // A class that dodged most rooms faces a much longer boss - that's the
  // intended consequence - but cap it so the finale can't run absurdly long.
  if (queue.length > CONFIG.BOSS_MAX_QUESTIONS) {
    queue = queue.slice(0, CONFIG.BOSS_MAX_QUESTIONS);
  }
  if (queue.length < CONFIG.BOSS_MIN_QUESTIONS) {
    const filler = shuffle(realm.coverKeys).filter(k => !queue.includes(k));
    queue = queue.concat(filler.slice(0, CONFIG.BOSS_MIN_QUESTIONS - queue.length));
  }

  run.boss = {
    queue, index: 0,
    hp: queue.length, maxHp: queue.length,
    teamUpUsed: false, helpers: [],
  };
  saveState();

  applySky("boss-sky", realm.sky);
  $("boss-sprite").src = realm.boss.sprite;
  renderMonsterHp("boss-hp", queue.length, queue.length);
  renderTopHud("boss");
  renderStudentChips();
  showScreen("screen-boss");
  animateSprite("boss-sprite", "arriving", 560);
  SFX.bossRoar();
  updateTeamUpButton("btn-teamup-boss");
  setTimeout(askBossQuestion, 700);
}

function askBossQuestion() {
  const run = STATE.run, realm = currentRealm();
  const boss = run.boss;
  const cover = boss.queue[boss.index % boss.queue.length];
  const options = questionsForCover(cover);
  const q = options.length ? pick(options) : drawQuestion(realm);
  boss.currentQ = q;

  $("boss-who").textContent =
    `${realm.boss.name} — ${boss.hp} hit${boss.hp === 1 ? "" : "s"} remaining`;
  renderQuestion(q, {
    question: "boss-question", choices: "boss-choices", feedback: "boss-feedback",
  }, correct => resolveBossAnswer(correct, q));
}

function resolveBossAnswer(correct, q) {
  const run = STATE.run, boss = run.boss;
  const student = run.currentStudent;
  $("btn-teamup-boss").disabled = true;

  if (correct) {
    markCovered(q.cover);
    run.stats.correct++;
    bumpStat(student, "correct");
    boss.helpers.forEach(h => bumpStat(h, "correct"));
    boss.hp--;
    boss.index++;
    addShards(CONFIG.SHARDS_BOSS_HIT);
    SFX.bossHit();
    playSlash("boss-slash-fx");
    animateSprite("boss-sprite", "hurt", 520);
    renderMonsterHp("boss-hp", boss.hp, boss.maxHp);
    renderTopHud("boss");
    saveState();

    if (boss.hp <= 0) {
      setTimeout(() => {
        animateSprite("boss-sprite", "dying", 900);
        SFX.monsterDown();
        run.stats.monsters++;
        bumpStat(student, "monsters");
        showPopup({
          banner: "BOSS DEFEATED", tone: "good",
          title: currentRealm().boss.name + " is beaten!",
          effect: "The realm is yours",
          extra: `Final blow by ${student}`,
        });
        afterPopups(handleVictory);
      }, 700);
      return;
    }
    setTimeout(() => {
      nextStudent(); renderStudentChips();
      boss.teamUpUsed = false; boss.helpers = [];
      updateTeamUpButton("btn-teamup-boss");
      askBossQuestion();
    }, 1250);
  } else {
    run.stats.wrong++;
    bumpStat(student, "wrong");
    boss.index++;   // move on so the class isn't stuck on one item
    setTimeout(() => {
      SFX.monsterAttack();
      animateSprite("boss-sprite", "attack", 640);
      setTimeout(() => {
        const res = damage(1);
        playHitFlash("boss-hit-flash", "boss-corridor");
        if (res.blocked) {
          SFX.heal();
          $("boss-feedback").textContent += ` ${res.blockedBy} absorbed the hit!`;
        } else {
          SFX.heartLost();
          bumpStat(student, "damage");
        }
        renderTopHud("boss");
        setTimeout(() => {
          if (res.dead) { handleDeath(); return; }
          nextStudent(); renderStudentChips();
          boss.teamUpUsed = false; boss.helpers = [];
          updateTeamUpButton("btn-teamup-boss");
          askBossQuestion();
        }, 1100);
      }, 330);
    }, 700);
  }
}

// ===================== END OF RUN =====================
function handleVictory() {
  const run = STATE.run;
  const realmName = currentRealm().name;
  const stats = { ...run.stats };
  const heartsLeft = run.hearts, maxHearts = run.maxHearts;
  const shards = run.shards;
  // clearRealm() nulls STATE.run, so everything above is captured first
  const result = clearRealm();

  SFX.victory();
  $("result-title").textContent = "REALM CLEARED!";
  $("result-body").innerHTML = `
    <p>${escapeHtml(realmName)} is calm again. Every word and grammar point in
       this unit has now been faced.</p>
    <div class="result-stats">
      <div class="stat-tile"><div class="v">${result.score}</div><div class="k">Score</div></div>
      <div class="stat-tile"><div class="v">${result.minutes}m</div><div class="k">Time</div></div>
      <div class="stat-tile"><div class="v">${heartsLeft}/${maxHearts}</div><div class="k">Hearts left</div></div>
      <div class="stat-tile"><div class="v">${stats.correct}</div><div class="k">Correct</div></div>
      <div class="stat-tile"><div class="v">${stats.monsters}</div><div class="k">Monsters felled</div></div>
      <div class="stat-tile"><div class="v">${shards}</div><div class="k">Shards</div></div>
    </div>
    <p>Ember banked: <b>+${result.emberGained}</b></p>
    ${result.nextUnlocked
      ? "<p>The next realm has unlocked.</p>"
      : "<p>Ask your teacher to unlock the next realm when the class is ready.</p>"}`;
  showScreen("screen-result");
}

function handleDeath() {
  const outcome = handleRunDeath();
  SFX.defeat();
  $("result-title").textContent = "THE PARTY HAS FALLEN";
  let body = `<p>The storm overwhelms you. The run resets with a brand-new map
              layout — but the journey wasn't wasted.</p>`;
  if (outcome.type === "relic") {
    body += `<p>The party held onto a relic: <b>${escapeHtml(outcome.relic.name)}</b><br>
             <span style="opacity:.8">${escapeHtml(outcome.relic.desc)}</span></p>`;
  } else {
    body += `<p>Their shards were banked as Ember: <b>+${outcome.amount} Ember</b></p>`;
  }
  $("result-body").innerHTML = body;
  showScreen("screen-result");
}

// remember which realm was last played so "Play again" works after the run
// object has already been cleared by clearRealm()/handleRunDeath()
let lastRealmId = 1;
const _origStartNewRun = startNewRun;
startNewRun = function (realmId) {
  lastRealmId = realmId;
  STATE.lastRealmPlayed = realmId;
  saveState();
  return _origStartNewRun(realmId);
};

$("btn-play-again").addEventListener("click", () => {
  SFX.click();
  const id = STATE.lastRealmPlayed || lastRealmId || 1;
  STATE.run = null;
  saveState();
  window.enterRealm(id);
});
$("btn-result-menu").addEventListener("click", () => {
  SFX.click(); showScreen("screen-menu"); renderMenu();
});

$("popup-continue").addEventListener("click", () => { SFX.click(); closePopup(); });

bootstrap();
