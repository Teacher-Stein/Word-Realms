// ---------------------------------------------------------------------------
// Game flow and event wiring.
// ---------------------------------------------------------------------------

function $(id) { return document.getElementById(id); }

// ===================== BOOT =====================
function bootstrap() {
  renderMenu();
  if (typeof STATE.musicOn !== "boolean") STATE.musicOn = true;   // music on by default
  if (typeof STATE.volume  !== "number")  STATE.volume  = 0.8;
  $("btn-sound").textContent = STATE.soundOn ? "SFX: On" : "SFX: Off";
  $("btn-music").textContent = STATE.musicOn ? "Music: On" : "Music: Off";
  $("vol-slider").value = Math.round(STATE.volume * 100);
  SFX.setEnabled(STATE.soundOn);
  SFX.setVolume(STATE.volume);
  MUSIC.setEnabled(STATE.musicOn);
  MUSIC.setVolume(STATE.volume);

  if (STATE.run && REALMS[STATE.run.realmId] && REALMS[STATE.run.realmId].ready) {
    // resume mid-realm (e.g. next class period on the same computer)
    showScreen("screen-map");
    $("turn-hint").textContent = "Welcome back — resuming where the class left off";
    if (!STATE.run.currentStudent) nextStudent();
    renderTopHud("hud");
    renderMap();
    renderStudentChips();
    MUSIC.play("explore");
  } else {
    showScreen("screen-menu");
  }
}

// ===================== MENU / NAV =====================
$("btn-sound").addEventListener("click", () => {
  STATE.soundOn = !STATE.soundOn;
  SFX.setEnabled(STATE.soundOn);
  SFX.unlock();
  $("btn-sound").textContent = STATE.soundOn ? "SFX: On" : "SFX: Off";
  saveState();
});
$("btn-music").addEventListener("click", () => {
  STATE.musicOn = !STATE.musicOn;
  MUSIC.setEnabled(STATE.musicOn);
  $("btn-music").textContent = STATE.musicOn ? "Music: On" : "Music: Off";
  saveState();
});
$("vol-slider").addEventListener("input", e => {
  const v = parseInt(e.target.value, 10) / 100;
  STATE.volume = v;
  SFX.setVolume(v);
  MUSIC.setVolume(v);
  saveState();
});

$("btn-howto").addEventListener("click", () => { SFX.click(); showScreen("screen-howto"); });
$("btn-howto-close").addEventListener("click", () => { SFX.click(); showScreen("screen-menu"); renderMenu(); });

$("btn-map-menu").addEventListener("click", () => { SFX.click(); MUSIC.stop(); showScreen("screen-menu"); renderMenu(); });

// ---- roster ----
$("btn-roster").addEventListener("click", () => {
  SFX.click(); SFX.unlock();
  $("roster-class").value = STATE.roster ? STATE.roster.className : "";
  $("roster-party").value = STATE.roster ? (STATE.roster.partyName || "") : "";
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
  setRoster(cls, names, $("roster-party").value);
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
let _pendingRealm = null;
let _chosenHeroId = null;

window.enterRealm = function (realmId) {
  SFX.unlock();
  // Resuming a run in progress skips hero selection - the hero is already set.
  if (STATE.run && STATE.run.realmId === realmId) { resumeRun(); return; }
  _pendingRealm = realmId;
  _chosenHeroId = null;
  renderHeroSelect(null);
  $("hero-select-sub").textContent =
    `${REALMS[realmId].name} · one hero leads the party through this realm.`;
  $("hero-confirm").disabled = true;
  showScreen("screen-hero");
};

function resumeRun() {
  if (!STATE.run.currentStudent) nextStudent();
  showScreen("screen-map");
  $("turn-hint").textContent = "Pick a glowing room to enter";
  renderTopHud("hud");
  renderMap();
  renderStudentChips();
  MUSIC.play("explore");
}

window.pickHero = function (heroId) {
  _chosenHeroId = heroId;
  SFX.click();
  renderHeroSelect(heroId);
  $("hero-confirm").disabled = false;
};

$("hero-confirm").addEventListener("click", () => {
  if (!_chosenHeroId || _pendingRealm == null) return;
  SFX.unlockChime();
  const run = startNewRun(_pendingRealm, _chosenHeroId);
  const hero = heroById(_chosenHeroId);

  // starting kit
  CONFIG.START_POTIONS.forEach(addPotion);
  const granted = hero.grant ? hero.grant(run) : "";
  saveState();

  nextStudent();
  showScreen("screen-map");
  $("turn-hint").textContent = "Pick a glowing room to enter";
  renderTopHud("hud");
  renderMap();
  renderStudentChips();
  MUSIC.play("explore");

  showPopup({
    banner: "THE PARTY SETS OUT", tone: "good", icon: hero.sprite,
    title: hero.name,
    effect: hero.perk,
    desc: hero.blurb,
    extra: granted || "",
  });
});
$("hero-cancel").addEventListener("click", () => {
  SFX.click(); showScreen("screen-menu"); renderMenu();
});

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
  MUSIC.play("explore");
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

// End Run - available right on the map so it isn't buried in the Teacher Menu
$("btn-end-run").addEventListener("click", () => {
  SFX.click();
  showPopup({
    banner: "END THIS RUN?", tone: "bad",
    title: "Abandon the realm",
    effect: "This run's progress, relics and shards are lost",
    desc: "The class can start a fresh run straight afterwards.",
    button: "Yes, end the run",
    onClose: () => {
      STATE.run = null; saveState();
      MUSIC.stop();
      showScreen("screen-menu"); renderMenu();
    },
  });
  // give the popup a visible way out that ISN'T ending the run
  addPopupCancel("Keep playing");
});
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
  const realm = currentRealm();
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  $("btn-use-item").style.display = "none";
  const run = STATE.run;

  const base = isElite ? pick(realm.elites) : pick(realm.monsters);
  const m = makeMonster(base, isElite);
  chooseIntent(m);
  run.encounter = m;
  clearDebuff();
  const shieldGain = refreshRoomShields();
  saveState();

  applySky("corridor-sky", realm.sky);
  paintHero("hero-sprite", "hero-shields");
  $("monster-sprite").src = m.sprite;
  $("monster-sprite").style.width = spriteWidth(m.sprite) + "px";
  applyVariantTint("monster-sprite", m.variant);
  $("monster-name").textContent = (isElite ? "ELITE · " : "") + m.name;
  $("enc-who").textContent = base.taunt;
  renderMonsterHp("monster-hp", m.hp, m.maxHp);
  renderIntent("monster-intent", m);
  renderTopHud("enc");
  renderStudentChips();
  showScreen("screen-encounter");
  MUSIC.play(isElite ? "elite" : "fight");
  animateSprite("monster-sprite", "arriving", 560);
  SFX.doorOpen();
  if (isElite) setTimeout(() => SFX.bossRoar(), 220);
  if (shieldGain) SFX.unlockChime();

  updateCombatButtons("enc");
  askFightQuestion();
}

function askFightQuestion() {
  const realm = currentRealm();
  const run = STATE.run;
  const m = run.encounter;
  const q = drawQuestion(realm);
  m.currentQ = q;
  saveState();

  const frozen = isFrozen();
  if (frozen) {
    $("enc-who").textContent =
      `${m.name} has frozen your attack — you must defend!`;
  }
  renderQuestion(q, {
    question: "enc-question", choices: "enc-choices", feedback: "enc-feedback",
  }, correct => resolveFightAnswer(correct, q, frozen || run.bracing));
  updateCombatButtons("enc");
}

// The shared resolution used by fights and the boss.
// `defending` = this turn is a Brace: a correct answer blocks the incoming
// attack instead of damaging the monster.
function resolveCombatAnswer(ctx, correct, q, defending) {
  const run = STATE.run;
  const m = ctx.monster;
  const student = run.currentStudent;
  const isBoss = !!m.isBoss;
  const P = isBoss
    ? { hpEl:"boss-hp", sprite:"boss-sprite", hero:"boss-hero-sprite",
        slash:"boss-slash-fx", flash:"boss-hit-flash", corridor:"boss-corridor",
        feedback:"boss-feedback", intent:"boss-intent", shields:"boss-hero-shields",
        hud:"boss" }
    : { hpEl:"monster-hp", sprite:"monster-sprite", hero:"hero-sprite",
        slash:"slash-fx", flash:"hit-flash", corridor:"corridor",
        feedback:"enc-feedback", intent:"monster-intent", shields:"hero-shields",
        hud:"enc" };

  document.querySelectorAll(".pixel-btn.brace, .pixel-btn.teamup")
    .forEach(b => b.disabled = true);

  if (correct) {
    markCovered(q.cover);
    run.stats.correct++;
    bumpStat(student, "correct");
    m.helpers.forEach(h => bumpStat(h, "correct"));
    const streak = bumpStreak();

    if (defending) {
      // Brace: block the blow, clear the debuff, deal no damage.
      clearDebuff();
      m.turnsUntilAct = Math.max(1, m.cadence);
      m.charging = null;
      run.bracing = false;
      saveState();
      SFX.heal();
      animateSprite(P.hero, "bracing", 620);
      $(P.feedback).textContent = "Braced! The attack is turned aside.";
      $(P.feedback).className = "enc-feedback good";
      renderIntent(P.intent, m);
      renderTopHud(P.hud);
      afterStreak(streak, () => nextCombatTurn(ctx));
      return;
    }

    const dmg = playerDamageAgainst(m);
    SFX.playerHit();
    animateSprite(P.hero, "attacking", 560);
    setTimeout(() => playSlash(P.slash), 180);
    setTimeout(() => animateSprite(P.sprite, "hurt", 520), 220);

    if (dmg === 0) {
      const why = run.debuff === "chill" ? "You are Chilled — no damage!"
                                         : `${m.name} is guarding — no damage!`;
      clearDebuff();
      m.guarding = false;
      $(P.feedback).textContent = why;
      $(P.feedback).className = "enc-feedback bad";
    } else {
      m.hp = Math.max(0, m.hp - dmg);
      const { amount, crit } = hitShards(q, m);
      const gained = addShards(amount);
      if (rollStun()) {
        m.stunned = true;
        $(P.feedback).textContent = `A stunning blow! ${m.name} loses its next turn.`;
      } else {
        $(P.feedback).textContent = crit ? `Critical hit! +${gained} shards`
                                         : `A clean hit! +${gained} shards`;
      }
      $(P.feedback).className = "enc-feedback good";
    }
    renderMonsterHp(P.hpEl, m.hp, m.maxHp);
    renderIntent(P.intent, m);
    renderTopHud(P.hud);
    saveState();

    if (m.hp <= 0) { setTimeout(() => monsterDefeated(ctx), 620); return; }
    afterStreak(streak, () => nextCombatTurn(ctx));

  } else {
    // wrong answer: the monster counter-attacks immediately
    run.stats.wrong++;
    bumpStat(student, "wrong");
    resetStreak();
    run.bracing = false;
    const dmg = wrongAnswerDamage(q);
    saveState();
    setTimeout(() => {
      SFX.monsterAttack();
      animateSprite(P.sprite, "attack", 640);
      setTimeout(() => {
        const res = applyHit(dmg, m, P);
        setTimeout(() => {
          if (res.dead) { onPartyDown(ctx); return; }
          nextCombatTurn(ctx);
        }, 1000);
      }, 320);
    }, 620);
  }
}

// Apply one incoming hit with all the animation/audio that goes with it.
function applyHit(rawDmg, m, P) {
  const dmg = incomingDamage(rawDmg, m);
  const res = damage(dmg);
  playHitFlash(P.flash, P.corridor);
  animateSprite(P.hero, "flinching", 520);
  if (res.blocked && res.blockedBy && res.blockedBy !== "Shields") {
    SFX.heal();
    $(P.feedback).textContent = `${res.blockedBy} absorbed the hit!`;
    $(P.feedback).className = "enc-feedback good";
  } else if (res.absorbed > 0 && res.dealt === 0) {
    SFX.heal();
    $(P.feedback).textContent = `Shields held! (${res.absorbed} absorbed)`;
    $(P.feedback).className = "enc-feedback good";
  } else {
    SFX.heartLost();
    bumpStat(STATE.run.currentStudent, "damage", Math.max(1, res.dealt));
    $(P.feedback).textContent = res.absorbed
      ? `Shields broke — ${res.dealt} damage through!`
      : `${m.name} strikes for ${res.dealt}!`;
    $(P.feedback).className = "enc-feedback bad";
  }
  renderTopHud(P.hud);
  renderShieldRow(P.shields);
  return res;
}

// streak rewards, then continue
function afterStreak(streak, done) {
  const run = STATE.run;
  if (streak === CONFIG.STREAK_GUARD) {
    run.streakGuard = true; saveState();
    showStreakBanner(`${streak} IN A ROW — NEXT ATTACK BLOCKED!`);
    SFX.unlockChime();
    setTimeout(done, 1500);
    return;
  }
  if (streak >= CONFIG.STREAK_BONUS && streak % CONFIG.STREAK_BONUS === 0) {
    const gained = addShards(12);
    addPotion(pick(POTIONS).id);
    showStreakBanner(`${streak} IN A ROW — +${gained} SHARDS & A POTION!`);
    SFX.treasure();
    renderTopHud("enc"); renderTopHud("boss");
    setTimeout(done, 1700);
    return;
  }
  setTimeout(done, 1150);
}

// After a resolved answer: the monster may act, then the next student is up.
function nextCombatTurn(ctx) {
  const run = STATE.run;
  const m = ctx.monster;
  if (!run || !m) return;

  const P = m.isBoss
    ? { sprite:"boss-sprite", hero:"boss-hero-sprite", flash:"boss-hit-flash",
        corridor:"boss-corridor", feedback:"boss-feedback", intent:"boss-intent",
        hpEl:"boss-hp", shields:"boss-hero-shields", hud:"boss" }
    : { sprite:"monster-sprite", hero:"hero-sprite", flash:"hit-flash",
        corridor:"corridor", feedback:"enc-feedback", intent:"monster-intent",
        hpEl:"monster-hp", shields:"hero-shields", hud:"enc" };

  const acts = tickMonsterClock(m);
  if (!acts) { advanceStudentAndAsk(ctx); return; }

  const result = monsterTakeTurn(m);
  renderIntent(P.intent, m);
  renderMonsterHp(P.hpEl, m.hp, m.maxHp);

  if (result.type === "stunned") {
    $(P.feedback).textContent = `${m.name} is stunned and loses its turn!`;
    $(P.feedback).className = "enc-feedback good";
    setTimeout(() => advanceStudentAndAsk(ctx), 1100);
    return;
  }

  // play the monster's events one at a time
  let i = 0;
  const events = result.events;
  const step = () => {
    if (i >= events.length) {
      renderTopHud(P.hud);
      setTimeout(() => advanceStudentAndAsk(ctx), 700);
      return;
    }
    const ev = events[i++];
    if (ev.type === "damage") {
      if (STATE.run.streakGuard) {
        STATE.run.streakGuard = false; saveState();
        SFX.heal();
        $(P.feedback).textContent = "Your winning streak turns the blow aside!";
        $(P.feedback).className = "enc-feedback good";
        setTimeout(step, 1000);
        return;
      }
      SFX.monsterAttack();
      animateSprite(P.sprite, "attack", 640);
      setTimeout(() => {
        const res = applyHit(ev.dmg, m, P);
        if (res.dead) { setTimeout(() => onPartyDown(ctx), 900); return; }
        setTimeout(step, 900);
      }, 320);
      return;
    }
    if (ev.type === "drain") {
      SFX.wrong();
      $(P.feedback).textContent = `${m.name} drains ${ev.shards} shards!`;
      $(P.feedback).className = "enc-feedback bad";
      renderTopHud(P.hud);
    } else if (ev.type === "guard") {
      $(P.feedback).textContent = `${m.name} raises its guard.`;
      $(P.feedback).className = "enc-feedback";
    } else if (ev.type === "regen") {
      SFX.heal();
      $(P.feedback).textContent = `${m.name} heals itself!`;
      $(P.feedback).className = "enc-feedback bad";
    } else if (ev.type === "charging") {
      SFX.bossRoar();
      $(P.feedback).textContent = `${m.name} is charging a devastating blow!`;
      $(P.feedback).className = "enc-feedback bad";
    } else if (ev.type === "enrage") {
      SFX.bossRoar();
      showStreakBanner(`${m.name.toUpperCase()} IS ENRAGED!`);
      $(P.feedback).textContent = `${m.name} is enraged — its attacks hit harder!`;
      $(P.feedback).className = "enc-feedback bad";
    } else if (ev.type === "debuff") {
      SFX.wrong();
      $(P.feedback).textContent = DEBUFF_TEXT[ev.debuff] || "";
      $(P.feedback).className = "enc-feedback bad";
      renderTopHud(P.hud);
    }
    setTimeout(step, 1150);
  };
  step();
}

function advanceStudentAndAsk(ctx) {
  const run = STATE.run;
  if (!run || !ctx.monster) return;
  nextStudent();
  renderStudentChips();
  const m = ctx.monster;
  m.teamUpUsed = false;
  m.helpers = [];
  run.bracing = false;
  saveState();
  ctx.ask();
}

function monsterDefeated(ctx) {
  const run = STATE.run;
  const m = ctx.monster;
  const student = run.currentStudent;
  SFX.monsterDown();
  animateSprite(m.isBoss ? "boss-sprite" : "monster-sprite", "dying", 820);

  const gain = m.isBoss ? 0 : (m.isElite ? CONFIG.SHARDS_ELITE : CONFIG.SHARDS_FIGHT);
  const gained = gain ? addShards(gain) : 0;
  run.stats.monsters++;
  bumpStat(student, "monsters");
  m.helpers.forEach(h => bumpStat(h, "monsters"));
  clearDebuff();
  renderTopHud(m.isBoss ? "boss" : "enc");

  if (m.isBoss) { setTimeout(() => ctx.onDefeat(), 700); return; }

  showPopup({
    banner: "MONSTER DEFEATED", tone: "good",
    title: m.name + " falls!",
    effect: `+${gained} Knowledge Shards`,
    desc: m.isElite ? "An Elite guardian - the party is stronger for it."
                    : "The path ahead is clear.",
    extra: `Felled by ${student}${m.helpers.length ? " & " + m.helpers.join(" & ") : ""}`,
  });

  // elites always drop a relic; regular monsters may drop a potion
  if (m.isElite) {
    const relic = availableRelic();
    if (relic) {
      addRelic(relic);
      bumpStat(student, "relics");
      showPopup({ banner:"RELIC FOUND", icon: relic.icon, title: relic.name,
                  effect: relic.effect, desc: relic.desc,
                  onClose: () => SFX.relic() });
    }
    if (Math.random() < CONFIG.POTION_DROP_ELITE) {
      const pid = pick(POTIONS).id; addPotion(pid);
      const pot = potionById(pid);
      showPopup({ banner:"POTION DROP", tone:"good", icon: pot.icon,
                  title: pot.name, effect: pot.effect, desc: pot.desc });
    }
    const gear = availableGear();
    if (gear && Math.random() < 0.5) offerGear(gear);
  } else {
    let chance = CONFIG.POTION_DROP_CHANCE + (hasRelic("magpie_eye") ? 0.2 : 0);
    if (Math.random() < chance) {
      const pid = pick(POTIONS).id; addPotion(pid);
      const pot = potionById(pid);
      showPopup({ banner:"POTION DROP", tone:"good", icon: pot.icon,
                  title: pot.name, effect: pot.effect, desc: pot.desc });
    }
  }

  run.encounter = null;
  saveState();
  afterPopups(() => backToMap(true));
}

// offer a piece of gear: equip it, or leave it
function offerGear(gear) {
  showPopup({
    banner: gear.slot === "weapon" ? "WEAPON FOUND" : "ARMOUR FOUND",
    tone: "", icon: gear.icon, title: gear.name,
    effect: gear.effect, desc: gear.desc,
    button: "Equip it",
    onClose: () => {
      const replaced = equipGear(gear);
      SFX.relic();
      if (replaced) {
        showPopup({ banner:"SWAPPED OUT", tone:"neutral", icon: replaced.icon,
                    title: `${replaced.name} left behind`,
                    effect: "Its enchantment was lost with it",
                    desc: "Only one weapon and one armour can be carried." });
      }
      renderTopHud("enc");
    },
  });
}

function onPartyDown(ctx) {
  handleDeath();
}

// ---- team up ----


function doTeamUp(btnId, hpElId, feedbackId) {
  const run = STATE.run;
  const ctx = btnId === "btn-teamup" ? run.encounter : run.boss;
  const maxTeam = hasRelic("team_banner") ? 2 : 1;
  if (!ctx || (ctx.teamUpCount || 0) >= maxTeam) return;

  const partner = nextStudent(run.currentStudent);
  ctx.teamUpUsed = true;
  ctx.teamUpCount = (ctx.teamUpCount || 0) + 1;
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
  updateCombatButtons(btnId === "btn-teamup" ? "enc" : "boss");
  showPopup({
    banner: "TEAM UP", tone: "good",
    title: partner ? `${partner} joins the fight!` : "A partner joins the fight!",
    effect: hpCost
      ? `The monster recovers ${hpCost} HP while you confer`
      : "The Iron Bell rings — no HP cost!",
    desc: "Both warriors share the credit for this monster.",
  });
}

$("btn-teamup").addEventListener("click", () =>
  doTeamUp("btn-teamup", "monster-hp", "enc-feedback"));
$("btn-teamup-boss").addEventListener("click", () =>
  doTeamUp("btn-teamup-boss", "boss-hp", "boss-feedback"));

// ---- Brace: defend instead of attacking. Still asks a question, so no
// review time is lost - a correct answer blocks the blow and clears debuffs.
function doBrace(which) {
  const run = STATE.run;
  const m = which === "boss" ? run.boss : run.encounter;
  if (!m || run.bracing) return;
  run.bracing = true;
  saveState();
  SFX.unlockChime();
  const fb = which === "boss" ? "boss-feedback" : "enc-feedback";
  $(fb).textContent = "Bracing! A correct answer will block the next attack.";
  $(fb).className = "enc-feedback good";
  updateCombatButtons(which === "boss" ? "boss" : "enc");
}
$("btn-brace").addEventListener("click", () => doBrace("enc"));
$("btn-brace-boss").addEventListener("click", () => doBrace("boss"));

// enable/disable the combat action buttons for the current turn
function updateCombatButtons(prefix) {
  const run = STATE.run;
  const isBoss = prefix === "boss";
  const m = isBoss ? run.boss : run.encounter;
  const braceBtn  = $(isBoss ? "btn-brace-boss"  : "btn-brace");
  const teamBtn   = $(isBoss ? "btn-teamup-boss" : "btn-teamup");
  if (!m) { braceBtn.disabled = true; teamBtn.disabled = true; return; }

  const frozen = isFrozen();
  braceBtn.disabled = frozen || run.bracing;
  braceBtn.textContent = frozen ? "FROZEN — must Brace"
                       : run.bracing ? "Bracing…" : "Brace (defend)";

  const maxTeam = hasRelic("team_banner") ? 2 : 1;
  const canTeam = STATE.roster && STATE.roster.students.length > 1 &&
                  (m.teamUpCount || 0) < maxTeam;
  teamBtn.disabled = !canTeam;
  const cost = hasRelic("iron_bell") ? 0 : CONFIG.TEAMUP_HP_COST;
  teamBtn.textContent = canTeam
    ? (cost ? `Team Up (+${cost} HP)` : "Team Up (free)")
    : "Team Up used";
}

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
  const amount = CONFIG.REST_HEAL + (hasRelic("warm_cloak") ? 1 : 0);
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

  const missing = realm.coverKeys.filter(k => !run.coveredKeys.includes(k));
  let queue = shuffle(missing);
  if (queue.length > CONFIG.BOSS_MAX_QUESTIONS) queue = queue.slice(0, CONFIG.BOSS_MAX_QUESTIONS);
  if (queue.length < CONFIG.BOSS_MIN_QUESTIONS) {
    const filler = shuffle(realm.coverKeys).filter(k => !queue.includes(k));
    queue = queue.concat(filler.slice(0, CONFIG.BOSS_MIN_QUESTIONS - queue.length));
  }

  const m = makeMonster(realm.boss, false, true);
  m.hp = m.maxHp = queue.length;
  m.cadence = m.turnsUntilAct = CONFIG.BOSS_CADENCE;
  m.queue = queue;
  m.index = 0;
  chooseIntent(m);
  run.boss = m;
  clearDebuff();
  refreshRoomShields();
  saveState();

  applySky("boss-sky", realm.sky);
  paintHero("boss-hero-sprite", "boss-hero-shields");
  $("boss-sprite").src = m.sprite;
  $("boss-sprite").style.width = spriteWidth(m.sprite) + "px";
  $("boss-name").textContent = "BOSS · " + m.name;
  renderMonsterHp("boss-hp", m.hp, m.maxHp);
  renderIntent("boss-intent", m);
  renderTopHud("boss");
  renderStudentChips();
  showScreen("screen-boss");
  MUSIC.play("boss");
  animateSprite("boss-sprite", "arriving", 560);
  SFX.bossRoar();
  updateCombatButtons("boss");
  setTimeout(askBossQuestion, 700);
}

function askBossQuestion() {
  const run = STATE.run, realm = currentRealm();
  const m = run.boss;
  if (!m) return;
  const cover = m.queue[m.index % m.queue.length];
  const options = questionsForCover(cover);
  const q = options.length ? pick(options) : drawQuestion(realm);
  m.currentQ = q;
  m.index++;
  saveState();

  const frozen = isFrozen();
  $("boss-who").textContent = frozen
    ? `${m.name} freezes you in place — defend!`
    : `${m.name} — ${m.hp} hit${m.hp === 1 ? "" : "s"} remaining`;

  renderQuestion(q, {
    question: "boss-question", choices: "boss-choices", feedback: "boss-feedback",
  }, correct => resolveCombatAnswer(bossCtx(), correct, q, frozen || run.bracing));
  updateCombatButtons("boss");
}

function bossCtx() {
  return {
    monster: STATE.run.boss,
    ask: askBossQuestion,
    onDefeat: () => {
      showPopup({
        banner: "BOSS DEFEATED", tone: "good",
        title: currentRealm().boss.name + " is beaten!",
        effect: "The realm is yours",
        extra: `Final blow by ${STATE.run.currentStudent}`,
      });
      afterPopups(handleVictory);
    },
  };
}

function fightCtx() {
  return { monster: STATE.run.encounter, ask: askFightQuestion, onDefeat: null };
}

function resolveFightAnswer(correct, q, defending) {
  resolveCombatAnswer(fightCtx(), correct, q, defending);
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
startNewRun = function (realmId, heroId) {
  lastRealmId = realmId;
  STATE.lastRealmPlayed = realmId;
  STATE.lastHeroPlayed = heroId || STATE.lastHeroPlayed;
  saveState();
  // forward EVERY argument - dropping heroId here silently un-set the hero
  return _origStartNewRun.apply(this, arguments);
};

$("btn-play-again").addEventListener("click", () => {
  SFX.click();
  const id = STATE.lastRealmPlayed || lastRealmId || 1;
  STATE.run = null;
  saveState();
  window.enterRealm(id);   // goes back through hero select, so the class
                            // can pick a different champion for the rerun
});
$("btn-result-menu").addEventListener("click", () => {
  SFX.click(); MUSIC.stop(); showScreen("screen-menu"); renderMenu();
});

$("popup-continue").addEventListener("click", () => { SFX.click(); closePopup(); });

bootstrap();
