// ---------------------------------------------------------------------------
// Game flow and event wiring.
// ---------------------------------------------------------------------------

function $(id) { return document.getElementById(id); }

// ===================== BOOT =====================
function bootstrap() {
  renderMenu();
  if (typeof STATE.musicOn !== "boolean") STATE.musicOn = true;   // music on by default
  if (typeof STATE.volume  !== "number")  STATE.volume  = 0.8;
  if (typeof STATE.musicVolume !== "number") STATE.musicVolume = 0.8;
  $("btn-sound").textContent = STATE.soundOn ? "SFX: On" : "SFX: Off";
  $("btn-music").textContent = STATE.musicOn ? "Music: On" : "Music: Off";
  $("vol-slider").value = Math.round(STATE.volume * 100);
  SFX.setEnabled(STATE.soundOn);
  SFX.setVolume(STATE.volume);
  MUSIC.setEnabled(STATE.musicOn);
  MUSIC.setVolume(STATE.musicVolume);
  armStorm();

  if (STATE.run && REALMS[STATE.run.realmId] && REALMS[STATE.run.realmId].ready) {
    const run = STATE.run;

    // A reload used to be a free escape hatch. The old boot always landed on
    // the map, no matter what the run was in the middle of, which meant:
    //   * refresh during a losing fight  -> fight skipped, all rewards kept
    //   * refresh at 0 hearts            -> party walks on at 0 hearts, no death
    //   * refresh during the boss        -> stranded on a node with no exits,
    //                                       the realm can never be finished
    // Children on a shared classroom machine WILL press F5. Each of these is
    // now resolved before the map is drawn.
    if (run.hearts <= 0) {
      // the party fell; the save was written before the death screen ran
      showScreen("screen-map");
      renderTopHud("hud");
      handleDeath();
      return;
    }
    if (run.boss && run.map && run.currentNodeId === run.map.bossId) {
      showScreen("screen-map");
      renderTopHud("hud");
      renderMap();
      renderStudentChips();
      MUSIC.setRealm(run.realmId);
      startBoss();                       // re-enter rather than strand them
      return;
    }
    if (run.encounter) {
      // Step back to the room they came from so the skipped fight is still
      // ahead of them, and clear the ghost monster.
      const prev = run.visitedNodeIds.length > 1
        ? run.visitedNodeIds[run.visitedNodeIds.length - 2] : run.map.nodes[0].id;
      run.visitedNodeIds = run.visitedNodeIds.filter(id => id !== run.currentNodeId);
      run.currentNodeId = prev;
      run.encounter = null;
      saveState();
    }

    // resume mid-realm (e.g. next class period on the same computer)
    showScreen("screen-map");
    $("turn-hint").textContent = "Welcome back — resuming where the class left off";
    if (!STATE.run.currentStudent) nextStudent();
    renderTopHud("hud");
    renderMap();
    renderStudentChips();
    MUSIC.setRealm(STATE.run ? STATE.run.realmId : 1);
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
  saveState();
});

// Music has its own level, separate from the sound effects. A room where the
// score is too loud does not want the monster cries turned down with it, and
// the control lives on the pause screen because that is where a teacher
// already is when they decide the music is in the way.
function syncMusicControls() {
  const sl = $("pause-music-vol"), val = $("pause-music-val"), tog = $("pause-music-toggle");
  if (sl)  sl.value = Math.round((STATE.musicVolume ?? 0.8) * 100);
  if (val) val.textContent = Math.round((STATE.musicVolume ?? 0.8) * 100) + "%";
  if (tog) tog.textContent = STATE.musicOn ? "Music: On" : "Music: Off";
}
$("pause-music-vol").addEventListener("input", e => {
  const v = parseInt(e.target.value, 10) / 100;
  STATE.musicVolume = v;
  MUSIC.setVolume(v);
  $("pause-music-val").textContent = Math.round(v * 100) + "%";
  saveState();
});
$("pause-music-toggle").addEventListener("click", () => {
  SFX.click();
  STATE.musicOn = !STATE.musicOn;
  MUSIC.setEnabled(STATE.musicOn);
  $("btn-music").textContent = STATE.musicOn ? "Music: On" : "Music: Off";
  syncMusicControls();
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

// ---- ember forge ----
$("btn-forge").addEventListener("click", () => {
  SFX.click(); SFX.unlock(); renderForge(); showScreen("screen-forge");
});
$("forge-close").addEventListener("click", () => {
  SFX.click(); showScreen("screen-menu"); renderMenu();
});
window.forgeBuy = function (id) {
  const res = buyPerk(id);
  const fb = $("forge-feedback");
  if (!res.ok) {
    SFX.wrong();
    fb.textContent = res.reason === "poor"
      ? "Not enough Ember for that yet — finish another run."
      : "The class already has that one.";
    fb.className = "shop-feedback bad";
    return;
  }
  SFX.relic();
  showPopup({
    banner: "FORGED", tone: "good", icon: res.perk.icon,
    title: res.perk.name, effect: res.perk.effect, desc: res.perk.desc,
    extra: `Permanent for this class · ${STATE.ember} Ember left`,
  });
  renderForge();
};

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
$("coach-toggle").addEventListener("change", e => {
  STATE.coachOn = e.target.checked; saveState();
});
$("short-toggle").addEventListener("change", e => {
  STATE.shortRealm = e.target.checked; saveState();
});
$("btn-coach-reset").addEventListener("click", () => {
  SFX.click(); resetCoach();
  $("pin-error").textContent = "";
  showPopup({ banner:"COACH RESET", tone:"good", title:"Explanations will show again",
              desc:"The next class to play will be walked through each mechanic once." });
});

// The whole term lives in one browser on one school computer. If that machine
// gets reimaged, everything goes with it - so it has to be exportable.
$("btn-save-export").addEventListener("click", () => {
  SFX.click();
  const blob = new Blob([JSON.stringify(STATE, null, 2)], { type: "application/json" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  const cls = STATE.roster ? STATE.roster.className.replace(/\W+/g, "-") : "word-realms";
  a.download = `${cls}-${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a); a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
});
$("save-import-file").addEventListener("change", e => {
  const file = e.target.files && e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    try {
      const data = JSON.parse(reader.result);
      if (!data || typeof data !== "object" || !("unlockedRealms" in data)) {
        throw new Error("not a Word Realms save");
      }
      STATE = Object.assign(defaultState(), data);
      migrateRun(STATE);
      saveState();
      showPopup({ banner:"SAVE RESTORED", tone:"good",
                  title: STATE.roster ? STATE.roster.className : "Save loaded",
                  effect: `${STATE.ember} Ember · ${perksForRealm(forgeRealmId()).length} Forge upgrades in this realm`,
                  desc:"Everything is back where it was." });
      renderTeacherRealmList(); renderMenu();
    } catch (err) {
      SFX.wrong();
      $("pin-error").textContent = "That file isn't a Word Realms save.";
    }
    e.target.value = "";
  };
  reader.readAsText(file);
});

$("perks-toggle").addEventListener("change", e => {
  STATE.perksEnabled = e.target.checked; saveState();
});
$("btn-new-term").addEventListener("click", () => {
  SFX.click();
  askConfirm("Start a new term? The class list is kept. Warrior stats, leaderboards, Ember, Forge upgrades and realm unlocks are all cleared.", () => {
    newTermReset();
    showScreen("screen-menu"); renderMenu();
  });
});
window.teacherRemoveStudent = function (name) {
  SFX.click();
  askConfirm(`Remove ${name} from the class? Their warrior stats are deleted too.`, () => {
    removeStudent(name);
    renderTeacherStudents();
  });
};
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
  MUSIC.setRealm(STATE.run ? STATE.run.realmId : 1);
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
  const perkNotes = applyRunPerks(run);
  // The party sets out equipped. Without this they walked into the first
  // fight on zero shields, because shields now only fill at rest points.
  refillShields();
  saveState();

  nextStudent();
  showScreen("screen-map");
  $("turn-hint").textContent = "Pick a glowing room to enter";
  renderTopHud("hud");
  renderMap();
  renderStudentChips();
  MUSIC.setRealm(STATE.run ? STATE.run.realmId : 1);
  MUSIC.play("explore");

  showPopup({
    banner: "THE PARTY SETS OUT", tone: "good", icon: hero.sprite,
    title: hero.name,
    effect: hero.perk,
    desc: hero.blurb,
    extra: [granted, perkNotes.length ? "From the Forge: " + perkNotes.join(", ") : ""]
             .filter(Boolean).join("  ·  "),
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
  MUSIC.duck(false);
  if (!STATE.run) return;
  MUSIC.setRealm(STATE.run ? STATE.run.realmId : 1);
  MUSIC.play("explore");
  if (advanceTurn) { nextStudent(); showTurnCallout(STATE.run.currentStudent); }
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
    showTurnCallout(STATE.run && STATE.run.currentStudent);
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
let _travelling = false;

window.travelToNode = function (nodeId) {
  const run = STATE.run;
  if (!run || _travelling) return;
  // Removing the .reachable CLASS did not remove the click LISTENERS, so a
  // second click during the totem walk started a second room. Children on a
  // shared machine double-tap constantly, and this let them skip a room
  // entirely - including a 7-hit Elite, which was then marked visited with a
  // live monster left stranded in run.encounter.
  _travelling = true;
  const node = nodeById(run.map, nodeId);
  const fromId = run.currentNodeId;

  document.querySelectorAll(".map-node.reachable")
    .forEach(el => el.classList.remove("reachable"));
  $("turn-hint").textContent = "Moving...";

  walkTotemTo(fromId, nodeId, () => {
    run.currentNodeId = nodeId;
    if (!run.visitedNodeIds.includes(nodeId)) run.visitedNodeIds.push(nodeId);
    saveState();
    centreOnCurrent(true);
    setTimeout(() => {
      _travelling = false;
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

// ===================== PAUSE =====================
// The bell will go mid-boss. ESC freezes everything, stops the music and puts
// the teacher's options in one place.
let _paused = false;

function questionIsLive() {
  const enc = $("screen-encounter"), boss = $("screen-boss");
  const on = (enc && enc.classList.contains("active")) ||
             (boss && boss.classList.contains("active"));
  if (!on) return null;
  const side = boss && boss.classList.contains("active") ? "boss" : "enc";
  const box = $(`${side}-choices`);
  if (!box) return null;
  // The choices are still in the DOM behind the stake gate and behind a blind
  // call - hidden, but unlocked. Treating that as a live question let "Award
  // this answer" fire a handler on a display:none element, and then the class
  // answered the SAME question again: two monster hits, two shard payouts and
  // two entries in a child's correct-answer count, off one question.
  if (box.classList.contains("hidden")) return null;
  if (_pendingStake && _pendingStake.side === side) return null;
  const live = box.querySelector(".choice:not(.locked)");
  return live ? side : null;
}

function togglePause(force) {
  const want = force === undefined ? !_paused : force;
  if (want === _paused) return;
  if (want && !STATE.run) return;               // nothing to pause
  _paused = want;
  const layer = $("pause-layer");
  layer.classList.toggle("open", _paused);
  if (_paused) {
    // The score keeps playing while paused. It used to stop dead, but the
    // music volume slider now lives on this screen and a slider you cannot
    // hear is useless. The Music: Off button beside it gives silence in one
    // click for a teacher who wants the room quiet.
    syncMusicControls();
    const side = questionIsLive();
    $("pause-award").style.display = side ? "" : "none";
    $("pause-sub").textContent = side
      ? "A question is on screen. You can award it if the class was right."
      : "The storm waits.";
  }
}

document.addEventListener("keydown", e => {
  if (e.key !== "Escape") return;
  const tag = (document.activeElement && document.activeElement.tagName) || "";
  if (tag === "INPUT" || tag === "TEXTAREA") return;
  if (popupsPending()) return;                  // let a reward card be read
  e.preventDefault();
  togglePause();
});

$("pause-resume").addEventListener("click", () => { SFX.click(); togglePause(false); });
$("pause-exit").addEventListener("click", () => {
  SFX.click(); togglePause(false); MUSIC.stop();
  showScreen("screen-menu"); renderMenu();
});
$("pause-teacher").addEventListener("click", () => {
  SFX.click(); togglePause(false); openTeacher();
});
$("pause-restart").addEventListener("click", () => {
  SFX.click(); togglePause(false);
  showPopup({
    banner: "RESTART THE REALM?", tone: "bad",
    title: "Start this realm again",
    effect: "A brand new map, and this run's relics and shards are lost",
    desc: "Banked Ember and Forge upgrades are kept.",
    button: "Yes, restart",
    cancel: "Keep playing",
    onClose: () => {
      const id = STATE.run ? STATE.run.realmId : (STATE.lastRealmPlayed || 1);
      STATE.run = null; saveState();
      window.enterRealm(id);
    },
  });
});
// Teacher override: award the question currently on screen. Deliberately
// living behind the pause menu rather than on a hotkey, so no child can reach
// it and no key can be pressed by accident.
$("pause-award").addEventListener("click", () => {
  const side = questionIsLive();
  if (!side) return;
  // This was described in the code as living "behind the pause menu so no
  // child can reach it" - but the pause menu is the ESC key with no PIN. Three
  // keystrokes and three clicks killed most of a monster with nobody
  // answering, and a Grade 5 class finds that in one lesson. It is a teacher
  // override, so it asks for the teacher's PIN.
  const given = window.prompt("Teacher PIN to award this answer:");
  if (given === null) return;
  if (String(given).trim() !== String(CONFIG.TEACHER_PIN)) {
    SFX.wrong();
    $("pause-sub").textContent = "That PIN is not right.";
    return;
  }
  SFX.unlockChime();
  togglePause(false);
  const correct = $(`${side}-choices`).querySelector(".choice");
  const answer = (side === "boss" ? STATE.run.boss : STATE.run.encounter);
  const q = answer && answer.currentQ;
  if (!q) return;
  const nodes = $(`${side}-choices`).querySelectorAll(".choice");
  nodes.forEach(c => { if (c.textContent === q.answer) c.click(); });
});

// ===================== STAKES =====================
// Before the options appear, the student on turn picks how much they are
// putting on this answer. SAFE plays normally. RISKY doubles the shards and
// doubles what a mistake costs - and on an `open` question it escalates to
// answering BLIND, with nothing on screen to pick from.
//
// Nothing can mark a spoken answer, so the room adjudicates a blind call. That
// is the point: it turns a silent multiple-choice tap into the whole class
// listening to one person back themselves out loud.
let _pendingStake = null;
// Set BEFORE the first render of a question that is about to be hidden behind
// the stake gate. _pendingStake itself is assigned after that render, so it is
// always null at the moment renderQuestion needs to know.
let _gatingSide = null;

function stakeEls(side) {
  return {
    gate:    $(`${side}-stake-gate`),
    say:     $(`${side}-commit-say`),
    choices: $(`${side}-choices`),
  };
}

function clearStakeUI(side) {
  if (_pendingStake && _pendingStake.side === side) _pendingStake = null;
  if (_gatingSide === side) _gatingSide = null;
  const e = stakeEls(side);
  if (e.gate) e.gate.style.display = "none";
  if (e.say) e.say.style.display = "none";
  if (e.choices) e.choices.classList.remove("hidden");
}
// kept under the old name so nothing that still calls it breaks
function clearCommitUI(side) { clearStakeUI(side); }

// onPick(stake) is called once the class has chosen.
function offerStake(side, q, onPick) {
  const e = stakeEls(side);
  if (!e.gate) { onPick(STAKE_SAFE); return; }
  _pendingStake = { side, q, onPick };
  e.choices.classList.add("hidden");
  e.say.style.display = "none";
  e.gate.style.display = "";
  renderStakeGate(side, q);
}

document.addEventListener("click", ev => {
  const btn = ev.target.closest(".sg-safe, .sg-risky, .cs-yes, .cs-no");
  if (!btn || !_pendingStake) return;
  const side = btn.dataset.side;
  if (side !== _pendingStake.side) return;
  const e = stakeEls(side);
  const P = _pendingStake;

  if (btn.classList.contains("sg-safe")) {
    SFX.click();
    setStake(STAKE_SAFE);
    _pendingStake = null;
    clearStakeUI(side);
    P.onPick(STAKE_SAFE);
    return;
  }

  if (btn.classList.contains("sg-risky")) {
    setStake(STAKE_RISKY);
    // On a selection-only question RISKY just raises the stakes and the
    // options come straight back. Only an `open` question goes blind - the
    // correct answer is never hidden from someone who could have picked it.
    if (!stakeIsBlind(P.q, STAKE_RISKY)) {
      SFX.unlockChime();
      _pendingStake = null;
      clearStakeUI(side);
      const fb = $(side === "boss" ? "boss-feedback" : "enc-feedback");
      fb.textContent = "RISKY — double shards, double damage if it's wrong.";
      fb.className = "enc-feedback";
      P.onPick(STAKE_RISKY);
      return;
    }
    SFX.bossRoar();
    e.gate.style.display = "none";
    e.say.style.display = "";
    showStreakBanner("RISKY — NO OPTIONS, SAY IT OUT LOUD");
    return;
  }

  // a blind call, adjudicated by the room
  const correct = btn.classList.contains("cs-yes");
  const fb = $(side === "boss" ? "boss-feedback" : "enc-feedback");
  fb.textContent = correct
    ? `Called it blind — the answer was "${P.q.answer}". Triple shards!`
    : `Not this time — the answer was "${P.q.answer}".`;
  fb.className = "enc-feedback " + (correct ? "good" : "bad");
  _pendingStake = null;
  clearStakeUI(side);
  P.onPick(STAKE_RISKY, correct);
});

// ===================== FOCUS =====================
window.useFocusNow = function (prefix) {
  const fb = $(prefix === "boss" ? "boss-feedback" : "enc-feedback");
  if (!useFocus()) {
    SFX.wrong();
    fb.textContent = "Focus is already spent for this fight.";
    fb.className = "enc-feedback bad";
    return;
  }
  SFX.unlockChime();
  showStreakBanner("FOCUS — THE WHOLE CLASS ANSWERS");
  fb.textContent =
    `Hands up, everyone. Get this right and ${CONFIG.FOCUS_STUN_ANSWERS} answers ` +
    `are struck off the monster's clock.`;
  fb.className = "enc-feedback good";
  updateCombatButtons(prefix);
};

// ===================== SHARED QUESTION RENDERER =====================
function renderQuestion(q, ids, onAnswer) {
  // Every question in the game funnels through here, so this is the one place
  // that can guarantee the answers are actually visible. A Commit hides them,
  // and a Last Stand or a Treasure chest that fired straight afterwards used
  // to inherit the hidden state and leave the class staring at nothing.
  const side = String(ids.question).startsWith("boss") ? "boss" : "enc";
  // Capture this BEFORE clearCommitUI, which clears the flag.
  const gated = _gatingSide === side;
  clearCommitUI(side);
  $(ids.question).innerHTML =
    `<span class="q-type">${q.type}</span>${escapeHtml(q.clue)}`;
  const choicesEl = $(ids.choices);
  choicesEl.innerHTML = "";
  $(ids.feedback).textContent = "";
  $(ids.feedback).className = "enc-feedback";

  // Grey out one WRONG option before anyone answers. Two things can do this:
  // the Potion of Clarity, and the Echo Shard relic, which fires itself once
  // per run on the first grammar question. Neither ever touches the correct
  // answer - removing a wrong option helps, it never punishes knowing.
  // These are consumed HERE, at render time - and askFightQuestion renders the
  // question once before the stake gate hides it, then again when the class
  // picks SAFE. That first render is invisible, so a Potion of Clarity and the
  // once-per-run Echo Shard were both being eaten with nothing on screen.
  // Skip the consumption entirely while the choices are about to be hidden.
  let trimmed = null, trimSource = "";
  if (gated) {
    // fall through with no trim; the real render will do it
  } else if (STATE.run && STATE.run.clarityActive) {
    const wrongs = q.choices.filter(c => c !== q.answer);
    if (wrongs.length) trimmed = pick(wrongs);
    STATE.run.clarityActive = false;
    trimSource = "Potion of Clarity";
    saveState();
  } else if (STATE.run && q.tier === 3 && !STATE.run.usedEcho && hasRelic("echo_shard")) {
    const wrongs = q.choices.filter(c => c !== q.answer);
    if (wrongs.length) {
      trimmed = pick(wrongs);
      STATE.run.usedEcho = true;
      trimSource = "Echo Shard";
      saveState();
    }
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
    fb.textContent = `${trimSource} removed a wrong answer!`;
    fb.className = "enc-feedback good";
  }
  // The question panel and the corridor share the screen, so a long question
  // with four long options shortens the corridor. Re-fit the foe now that the
  // panel's real height is known, or a tall monster is cut off at the top.
  refitCurrentStage();
  requestAnimationFrame(refitCurrentStage);
}

// ===================== FIGHT / ELITE =====================
function startFight(isElite) {
  const realm = currentRealm();
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  clearScenery();
  updateStageScale("corridor");
  showCombatButtons(true);
  resetFocus();                 // one Focus per FIGHT, not per run
  clearStake();
  STATE.run.potionUsedThisTurn = false;
  const run = STATE.run;

  const base = isElite ? pick(realm.elites) : pick(realm.monsters);
  const m = makeMonster(base, isElite);
  chooseIntent(m);
  run.encounter = m;
  clearDebuff();
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
  MUSIC.duck(true);            // stays back for the WHOLE fight, not per question
  animateSprite("monster-sprite", "arriving", 560);
  SFX.doorOpen();
  // every monster announces itself with its own voice
  setTimeout(() => SFX.monsterCry(monsterVoice(m)), isElite ? 260 : 200);
  if (isElite) setTimeout(() => { SFX.bossRoar(); lightningStrike(false); }, 480);

  updateCombatButtons("enc");
  askFightQuestion();
}

function askFightQuestion() {
  const realm = currentRealm();
  const run = STATE.run;
  const m = run && run.encounter;
  // The fight can end between a turn being scheduled and the next question
  // being drawn - a blind call adjudicated a beat after the monster fell, or a
  // party wipe mid-animation. monsterDefeated() nulls run.encounter, so
  // without this the whole screen throws on the next draw.
  if (!run || !m) return;
  const q = drawQuestion(realm, !!m.isElite);
  if (!q) return;                     // the run ended underneath us
  m.currentQ = q;
  saveState();

  const frozen = isFrozen();
  if (frozen) {
    $("enc-who").textContent =
      `${m.name} has frozen your attack — you must defend!`;
  }
  const ids = { question: "enc-question", choices: "enc-choices", feedback: "enc-feedback" };
  const defending = frozen || run.bracing;
  clearStakeUI("enc");
  clearStake();
  _gatingSide = stakesAvailable(q, defending) ? "enc" : null;
  // NB: the answer handlers call isDefendingNow() rather than closing over
  // `defending`. Brace is clicked AFTER the question is on screen, so a
  // captured value is always the state from before the student decided.
  renderQuestion(q, ids, correct => resolveFightAnswer(correct, q, isDefendingNow()));

  if (stakesAvailable(q, defending)) {
    offerStake("enc", q, (stake, blindResult) => {
      if (blindResult === undefined) {
        // options are on screen now, so the real render may consume a Clarity
        _gatingSide = null;
        renderQuestion(q, ids, correct => resolveFightAnswer(correct, q, isDefendingNow()));
        return;
      }
      resolveFightAnswer(blindResult, q, isDefendingNow());
    });
  }

  updateCombatButtons("enc");
  if (m.isElite) coach("elite");
  if (stakesAvailable(q, defending)) coach("stakes");
  if (focusAvailable()) coach("focus");
  if (m.intent && !m.stunned) coach("intent");
}

// The shared resolution used by fights and the boss.
// `defending` = this turn is a Brace: a correct answer blocks the incoming
// attack instead of damaging the monster.
function resolveCombatAnswer(ctx, correct, q, defending) {
  const run = STATE.run;
  const m = ctx && ctx.monster;
  // The fight can end between a question being asked and its answer landing -
  // a Commit adjudicated a beat after the monster fell, say. Without this the
  // whole screen throws on a null monster.
  if (!run || !m) return;
  const student = run.currentStudent;
  const isBoss = !!m.isBoss;
  const P = isBoss
    ? { hpEl:"boss-hp", sprite:"boss-sprite", hero:"boss-hero-sprite",
        slash:"boss-slash-fx", flash:"boss-hit-flash", corridor:"boss-corridor",
        feedback:"boss-feedback", intent:"boss-intent", shields:"boss-hero-shields",
        heroStage:"boss-hero-stage", foeStage:"boss-stage", hud:"boss" }
    : { hpEl:"monster-hp", sprite:"monster-sprite", hero:"hero-sprite",
        slash:"slash-fx", flash:"hit-flash", corridor:"corridor",
        feedback:"enc-feedback", intent:"monster-intent", shields:"hero-shields",
        heroStage:"hero-stage", foeStage:"monster-stage", hud:"enc" };

  document.querySelectorAll(".pixel-btn.brace, .pixel-btn.teamup")
    .forEach(b => b.disabled = true);

  if (correct) {
    markCovered(q.cover);
    run.stats.correct++;
    bumpStat(student, "correct");
    m.helpers.filter(h => h !== student).forEach(h => bumpStat(h, "correct"));
    const streak = bumpStreak();

    if (defending) {
      // Brace: block the blow, clear the debuff, deal no damage.
      //
      // The +1 matters. nextCombatTurn() ticks the clock immediately after
      // this, so setting it to `cadence` left it at cadence-1 - and on a fast
      // variant with cadence 1 it landed on 0 and the monster swung anyway.
      // A student who braced and answered correctly took the hit regardless,
      // which is the exact opposite of what the button promises. Setting it to
      // cadence+1 means the tick lands on a full fresh clock.
      clearDebuff();
      m.turnsUntilAct = Math.max(1, m.cadence) + 1;
      // Clearing m.charging alone was not enough: m.intent still said "charge",
      // so the monster simply STARTED THE CHARGE AGAIN on its next turn and
      // landed it in full a turn later, while the feedback line claimed the
      // attack had been turned aside. Re-roll the intent so a broken charge is
      // genuinely broken.
      const wasCharging = !!m.charging;
      m.charging = null;
      if (wasCharging) { m.intent = null; chooseIntent(m); }
      run.bracing = false;
      clearStake();
      saveState();
      SFX.heal();
      animateSprite(P.hero, "bracing", 620);
      $(P.feedback).textContent = wasCharging
        ? `Braced! The charge is broken — ${m.name} has to start again.`
        : `Braced! The attack is turned aside — its clock resets to ${Math.max(1, m.cadence)} answers.`;
      $(P.feedback).className = "enc-feedback good";
      renderIntent(P.intent, m);
      renderTopHud(P.hud);
      afterStreak(streak, () => nextCombatTurn(ctx));
      return;
    }

    if (run.potionUsedThisTurn) {
      // the student answered, so the review still happened - but the hand
      // that would have swung the blade was busy with a cork
      run.potionUsedThisTurn = false;
      saveState();
      SFX.heal();
      animateSprite(P.hero, "bracing", 620);
      $(P.feedback).textContent = "You drank a potion — no attack this turn.";
      $(P.feedback).className = "enc-feedback";
      renderIntent(P.intent, m);
      renderTopHud(P.hud);
      afterStreak(streak, () => nextCombatTurn(ctx));
      return;
    }

    const stake = currentStake();
    const blind = stakeIsBlind(q, stake);
    // A stake pays in shards - never in damage. Extra damage would mean a
    // shorter fight, and a shorter fight is fewer questions.
    const dmg = playerDamageAgainst(m);

    // Focus: a correct answer strikes ticks off the monster's clock. This
    // LENGTHENS the fight, which is the only reason it is allowed to exist.
    const stun = consumeFocus(true);
    let focusNote = "";
    if (stun) {
      // Do NOT clamp to cadence. The clock sits AT cadence at the start of
      // every fight and immediately after every monster turn - the two moments
      // a class is most likely to press the panic button - so Math.min threw
      // the whole effect away and then announced success anyway. Focus is
      // meant to lengthen a fight, so the clock is allowed to run past its
      // normal maximum.
      m.turnsUntilAct += stun;
      focusNote = ` FOCUS — ${stun} answers struck off its clock!`;
    }

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
      floatText(P.foeStage, `-${dmg}`, "damage");
      const { amount, crit } = hitShards(q, m);
      const gained = addShards(amount * stakeShardMult(stake, blind));
      const shielded = payStakeShield(blind);
      if (shielded) {
        floatText(P.heroStage, `+${shielded} shield`, "shield");
        renderShieldRow(P.shields);
      }
      if (rollStun()) {
        m.stunned = true;
        $(P.feedback).textContent =
          `A stunning blow! ${m.name} loses its next turn.` + focusNote;
      } else {
        $(P.feedback).textContent =
          (blind ? `Called it blind! +${gained} shards${shielded ? ` and +${shielded} shield` : ""}`
         : crit  ? `Critical hit! +${gained} shards`
                 : `A clean hit! +${gained} shards`)
          + stakeNote(stake, blind, true) + focusNote;
      }
      $(P.feedback).className = "enc-feedback good";
    }
    clearStake();
    renderMonsterHp(P.hpEl, m.hp, m.maxHp);
    renderIntent(P.intent, m);
    renderTopHud(P.hud);
    updateCombatButtons(P.hud);
    saveState();

    if (m.hp <= 0) { setTimeout(() => monsterDefeated(ctx), 620); return; }
    afterStreak(streak, () => nextCombatTurn(ctx));

  } else {
    // wrong answer: the monster counter-attacks immediately
    run.stats.wrong++;
    bumpStat(student, "wrong");
    resetStreak();
    run.bracing = false;

    // This is where RISKY bites. The stake multiplies what the mistake costs;
    // it never touched what a correct answer deals.
    const stake = currentStake();
    const blind = stakeIsBlind(q, stake);
    const dmg = wrongAnswerDamage(q) * stakeDamageMult(stake);
    consumeFocus(false);          // a missed Focus is simply spent
    clearStake();
    if (stake === STAKE_RISKY) {
      $(P.feedback).textContent += stakeNote(stake, blind, false);
    }
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
  // v5.3: Momentum's Guard is gone. Relics and streaks still blunt blows
  // further down; nothing takes the top off here any more.
  let incoming = rawDmg;
  const dmg = incomingDamage(incoming, m);
  const res = damage(dmg);
  playHitFlash(P.flash, P.corridor);
  animateSprite(P.hero, "flinching", 520);
  if (res.blocked && res.blockedBy && res.blockedBy !== "Shields") {
    SFX.heal();
    floatText(P.heroStage, res.blockedBy.toUpperCase(), "block");
    $(P.feedback).textContent = `${res.blockedBy} absorbed the hit!`;
    $(P.feedback).className = "enc-feedback good";
  } else if (res.absorbed > 0 && res.dealt === 0) {
    SFX.heal();
    floatText(P.heroStage, `-${res.absorbed} shield`, "shield");
    $(P.feedback).textContent = `Shields held! (${res.absorbed} absorbed)`;
    $(P.feedback).className = "enc-feedback good";
  } else {
    SFX.heartLost();
    if (res.absorbed) floatText(P.heroStage, `-${res.absorbed} shield`, "shield");
    floatText(P.heroStage, `-${res.dealt}`, "damage");
    bumpStat(STATE.run.currentStudent, "damage", Math.max(1, res.dealt));
    $(P.feedback).textContent = res.absorbed
      ? `Shields broke — ${res.dealt} damage through!`
      : `${m.name} strikes for ${res.dealt}!`;
    // (the counter-attack path relabels this below)
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
        hpEl:"boss-hp", shields:"boss-hero-shields",
        heroStage:"boss-hero-stage", foeStage:"boss-stage", hud:"boss" }
    : { sprite:"monster-sprite", hero:"hero-sprite", flash:"hit-flash",
        corridor:"corridor", feedback:"enc-feedback", intent:"monster-intent",
        hpEl:"monster-hp", shields:"hero-shields",
        heroStage:"hero-stage", foeStage:"monster-stage", hud:"enc" };

  const tick = tickMonsterClock(m);
  if (!tick.acts) {
    // Redraw the clock AFTER the tick. This used to be skipped, which left the
    // countdown one turn stale for the whole of the next question - the number
    // on screen while a student was choosing was always wrong by one, and
    // "NEXT ANSWER" only ever flashed up during the feedback right before the
    // blow landed. The warning is worthless if it arrives after the decision.
    renderIntent(P.intent, m);
    if (tick.held) {
      SFX.heal();
      $(P.feedback).textContent = "The Riposte Ring holds it back — the clock does not move!";
      $(P.feedback).className = "enc-feedback good";
      setTimeout(() => advanceStudentAndAsk(ctx), 1000);
      return;
    }
    advanceStudentAndAsk(ctx);
    return;
  }

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
      if (ev.full) {
        $(P.feedback).textContent = `${m.name} tries to heal — it is already at full strength.`;
        $(P.feedback).className = "enc-feedback";
      } else {
        SFX.heal();
        floatText(P.foeStage, "+1", "heal");
        $(P.feedback).textContent = `${m.name} heals itself!`;
        $(P.feedback).className = "enc-feedback bad";
      }
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
      coach("debuff");
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
  showTurnCallout(run.currentStudent);
  const m = ctx.monster;
  m.teamUpUsed = false;
  m.helpers = [];
  run.bracing = false;
  run.potionUsedThisTurn = false;
  saveState();
  ctx.ask();
}

function monsterDefeated(ctx) {
  const run = STATE.run;
  const m = ctx.monster;
  const student = run.currentStudent;
  MUSIC.duck(false);          // as soon as the monster falls, not after the popups
  SFX.monsterDown();
  setTimeout(() => SFX.monsterCry(monsterVoice(m), true), 160);
  animateSprite(m.isBoss ? "boss-sprite" : "monster-sprite", "dying", 820);

  const gain = m.isBoss ? 0 : (m.isElite ? CONFIG.SHARDS_ELITE : CONFIG.SHARDS_FIGHT);
  const gained = gain ? addShards(gain) : 0;
  run.stats.monsters++;
  bumpStat(student, "monsters");
  m.helpers.filter(h => h !== student).forEach(h => bumpStat(h, "monsters"));
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
  MUSIC.duck(false);          // the fight is over - bring the score straight back
  _pendingStake = null;       // nothing left to stake on
  clearStake();
  saveState();
  afterPopups(() => backToMap(true));
}

// Offer a piece of gear as a genuine choice: take it, or keep what you have.
// Nothing is ever equipped over the class's head - if they are carrying
// something, the card shows both so they can compare before deciding.
function offerGear(gear) {
  const run = STATE.run;
  const current = run[gear.slot] ? gearById(run[gear.slot]) : null;
  const slotName = gear.slot === "weapon" ? "weapon" : "armour";

  showPopup({
    banner: gear.slot === "weapon" ? "WEAPON FOUND" : "ARMOUR FOUND",
    tone: "", icon: gear.icon, title: gear.name,
    effect: gear.effect, desc: gear.desc,
    extra: current
      ? `You are carrying the ${current.name} — ${current.effect}`
      : `Your ${slotName} slot is empty.`,
    button: current ? `Take the ${gear.name}` : `Equip the ${gear.name}`,
    cancel: current ? `Keep the ${current.name}` : "Leave it behind",
    onCancel: () => {
      showPopup({ banner: "LEFT BEHIND", tone: "neutral", icon: gear.icon,
                  title: `${gear.name} left where it lay`,
                  effect: current ? `You keep the ${current.name}` : "",
                  desc: "Nothing is lost - the party moves on." });
    },
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
  tryLastStand(ctx, () => nextCombatTurn(ctx));
}

// ---------------------------------------------------------------------------
// LAST STAND
// At zero hearts the party gets one sudden-death question instead of dying on
// the spot. Answer it and they get back up with a single heart; miss it and
// the run is over. Once per run, so it's a reprieve rather than a safety net.
//
// It costs no review time - it IS a question - and it can't hide an answer,
// so the rule that knowledge is never punished still holds.
// ---------------------------------------------------------------------------
function tryLastStand(ctx, onSurvive) {
  const run = STATE.run;
  if (!run || !CONFIG.LAST_STAND_ENABLED) { handleDeath(); return; }

  // The Last Breath relic buys a second one - which is the whole reason to
  // spend 52 shards on it.
  let viaRelic = false;
  if (!run.usedLastStand) {
    run.usedLastStand = true;
  } else if ((hasRelic("last_breath") || hasPerk("second_breath")) &&
             !run.usedLastBreath) {
    run.usedLastBreath = true;
    viaRelic = true;
  } else {
    handleDeath();
    return;
  }
  saveState();

  const m = ctx && ctx.monster;
  const isBoss = !!(m && m.isBoss);
  const ids = isBoss
    ? { question: "boss-question", choices: "boss-choices", feedback: "boss-feedback" }
    : { question: "enc-question", choices: "enc-choices", feedback: "enc-feedback" };
  const whoId = isBoss ? "boss-who" : "enc-who";
  const hud   = isBoss ? "boss" : "enc";

  document.querySelectorAll(".pixel-btn.brace, .pixel-btn.teamup")
    .forEach(b => b.disabled = true);
  SFX.bossRoar();

  showPopup({
    banner: "LAST STAND", tone: "bad",
    title: viaRelic ? "Your Last Breath flares" : "The party is on its knees",
    effect: "One question stands between you and the end of the run",
    desc: viaRelic
      ? "The relic buys one more chance. Answer and they rise again; miss it and the realm resets."
      : "Answer it and they get back up with a single heart. Miss it and the realm resets.",
    extra: `It falls to ${run.currentStudent}`,
    button: "Face it",
    onClose: () => {
      showStreakBanner("LAST STAND — ANSWER OR FALL");
      $("app").classList.add("last-stand");
      const q = drawQuestion(currentRealm());
      if (!q) return;
      $(whoId).textContent = "LAST STAND — everything rides on this answer.";
      renderQuestion(q, ids, correct => {
        $("app").classList.remove("last-stand");
        const student = STATE.run.currentStudent;
        if (correct) {
          markCovered(q.cover);
          STATE.run.stats.correct++;
          bumpStat(student, "correct");
          STATE.run.hearts = 1;
          STATE.run.shields = 0;
          STATE.run.streak = 0;
          if (m) m.stunned = true;           // the foe reels back too
          clearDebuff();
          saveState();
          SFX.victory();
          renderTopHud(hud);
          if (m) renderIntent(isBoss ? "boss-intent" : "monster-intent", m);
          showPopup({
            banner: "BACK ON THEIR FEET", tone: "good",
            title: `${student} saves the party!`,
            effect: "+1 heart — the run continues",
            desc: "A Last Stand can only be made once in a run. Guard it well.",
          });
          afterPopups(() => { if (onSurvive) onSurvive(); });
        } else {
          STATE.run.stats.wrong++;
          bumpStat(student, "wrong");
          resetStreak();
          saveState();
          SFX.defeat();
          setTimeout(handleDeath, 1500);
        }
      });
    },
  });
}

// ---- team up ----


function doTeamUp(btnId, hpElId, feedbackId) {
  const run = STATE.run;
  const ctx = btnId === "btn-teamup" ? run.encounter : run.boss;
  const perRun = CONFIG.TEAMUPS_PER_RUN + (hasRelic("team_banner") ? 2 : 0);
  if (!ctx || (run.teamUpsUsed || 0) >= perRun) return;
  run.teamUpsUsed = (run.teamUpsUsed || 0) + 1;

  // nextStudent() REASSIGNS run.currentStudent, so asking for help handed the
  // turn to the partner: the partner then answered, was credited twice (once
  // as the answering student, once as a helper), and the child who actually
  // asked for help got nothing at all.
  const asker = run.currentStudent;
  const partner = nextStudent(run.currentStudent);
  run.currentStudent = asker;
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
  bumpStat(asker, "teamups");
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
// Is the party defending RIGHT NOW, at the moment an answer lands?
//
// This has to be read live. Brace is clicked while the question is already on
// screen, so any value captured when the question was ASKED is the state from
// before the student made the decision - which meant a braced, correct answer
// was resolved as an ordinary attack and the blow landed anyway. Worse,
// advanceStudentAndAsk() clears run.bracing before drawing the next question,
// so the flag could never survive to be read on a later turn either: Brace was
// a dead button from the day it was added.
function isDefendingNow() {
  const run = STATE.run;
  if (!run) return false;
  return isFrozen() || !!run.bracing;
}

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
$("btn-focus").addEventListener("click", () => window.useFocusNow("enc"));
$("btn-focus-boss").addEventListener("click", () => window.useFocusNow("boss"));

// Brace, Focus and Team Up only mean something when there is something to
// fight, so they are hidden outright in Rest, Safe, Treasure and Event rooms.
function showCombatButtons(show) {
  ["btn-brace", "btn-teamup", "btn-focus"].forEach(id => {
    const b = $(id);
    if (b) b.style.display = show ? "" : "none";
  });
  if (!show) clearStakeUI("enc");
}

// enable/disable the combat action buttons for the current turn
function updateCombatButtons(prefix) {
  const run = STATE.run;
  const isBoss = prefix === "boss";
  const m = isBoss ? run.boss : run.encounter;
  const braceBtn  = $(isBoss ? "btn-brace-boss"  : "btn-brace");
  const teamBtn   = $(isBoss ? "btn-teamup-boss" : "btn-teamup");

  // The pack can be opened mid-fight. It costs the turn's ATTACK, not the
  // turn's question - the student still answers, so no review is lost.
  const itemBtn = $(isBoss ? "btn-use-item-boss" : "btn-use-item");
  if (itemBtn && m) {
    const n = run.potions.length;
    itemBtn.style.display = "";
    itemBtn.disabled = n === 0 || !!run.potionUsedThisTurn;
    itemBtn.textContent = run.potionUsedThisTurn ? "Item used this turn"
                        : n ? `Use an Item (${n})` : "No items to use";
    itemBtn.onclick = () => openInventory({ usable: true, from: isBoss ? "boss" : "fight" });
  }

  // Focus: one per fight, the party's panic button and a licensed moment for
  // the whole class to argue about an answer together.
  const focusBtn = $(isBoss ? "btn-focus-boss" : "btn-focus");
  if (focusBtn) {
    focusBtn.style.display = CONFIG.FOCUS_ENABLED && m ? "" : "none";
    const armed = focusArmed();
    focusBtn.disabled = !focusAvailable() || armed;
    focusBtn.classList.toggle("armed", armed);
    focusBtn.textContent = armed ? "FOCUS — everyone answers!"
                         : focusAvailable() ? "Focus (whole class)"
                         : "Focus spent";
  }

  if (!m) { braceBtn.disabled = true; teamBtn.disabled = true; return; }

  const frozen = isFrozen();
  braceBtn.disabled = frozen || run.bracing;
  braceBtn.textContent = frozen ? "FROZEN — must Brace"
                       : run.bracing ? "Bracing…" : "Brace (defend)";

  // Team Up used to be unlimited and its only cost was one more question -
  // which is a thing we want - so it was free, and free is not a decision.
  // Three per RUN makes it something to save.
  const perRun = CONFIG.TEAMUPS_PER_RUN + (hasRelic("team_banner") ? 2 : 0);
  const left = Math.max(0, perRun - (run.teamUpsUsed || 0));
  const canTeam = STATE.roster && STATE.roster.students.length > 1 && left > 0;
  teamBtn.disabled = !canTeam;
  teamBtn.textContent = canTeam ? `Team Up (${left} left)` : "No Team Ups left";
}

// ===================== EVENT =====================
function enterEvent() {
  $("btn-use-item").style.display = "none";
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  clearFoeStage();
  clearScenery();
  updateStageScale("corridor");
  showCombatButtons(false);
  const realm = currentRealm();
  const ev = pick(REALM1_EVENTS);
  applySky("corridor-sky", realm.sky);
  paintHero("hero-sprite", "hero-shields");
  $("monster-sprite").src = realm.npc.sprite;
  $("monster-sprite").style.width = spriteWidth(realm.npc.sprite) + "px";
  $("monster-name").textContent = realm.npc.name;
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
          if (res.dead) tryLastStand({ monster: null }, () => backToMap(true));
          else backToMap(true);
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

// ===================== CAMPFIRE (was Rest) =====================
// The old Rest room healed hearts AND refilled shields, free, every time -
// which meant the damage a fight had done never actually cost anything. Now
// there is time for exactly one thing, and choosing is the point.
function enterRest() {
  MUSIC.setRealm(STATE.run ? STATE.run.realmId : 1);
  MUSIC.play("campfire");
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  clearFoeStage();
  showScenery("safe");            // the campfire itself
  showCombatButtons(false);
  const realm = currentRealm();
  const run = STATE.run;
  applySky("corridor-sky", realm.sky);
  paintHero("hero-sprite", "hero-shields");
  SFX.doorOpen();

  coach("campfire");
  $("enc-who").textContent = "A campfire. There is time for one thing only.";
  $("enc-question").textContent =
    "Mend the wounded, repair the armour, or sharpen up for what is coming?";
  $("enc-feedback").textContent = "";
  $("btn-teamup").disabled = true;

  // the pack is still open here
  const useBtn = $("btn-use-item");
  const havePotions = run.potions.length > 0;
  useBtn.style.display = "";
  useBtn.disabled = !havePotions;
  useBtn.textContent = havePotions
    ? `Use an Item (${run.potions.length})` : "No items to use";
  useBtn.onclick = () => openInventory({ usable: true, from: "safe" });

  const mendAmount = CONFIG.REST_HEAL + (hasRelic("warm_cloak") ? 1 : 0);
  const choices = $("enc-choices");
  choices.innerHTML = "";

  const option = (label, sub, fn) => {
    const div = document.createElement("div");
    div.className = "choice campfire";
    div.innerHTML = `<b>${label}</b><span>${sub}</span>`;
    div.addEventListener("click", () => {
      choices.querySelectorAll(".choice").forEach(c => c.classList.add("locked"));
      useBtn.style.display = "none";
      fn();
    });
    choices.appendChild(div);
  };

  option("Mend", `Restore ${mendAmount} hearts — now ${run.hearts}/${run.maxHearts}`, () => {
    const before = run.hearts;
    heal(mendAmount);
    SFX.heal();
    renderTopHud("enc");
    showPopup({
      banner: "MEND", tone: "good", title: "The party patches itself up",
      effect: `+${run.hearts - before} heart${run.hearts - before === 1 ? "" : "s"}`,
      desc: "Bandages, hot food, and a few minutes out of the wind.",
      extra: `Hearts: ${run.hearts}/${run.maxHearts} · Shields still ${run.shields}`,
    });
    afterPopups(() => backToMap(true));
  });

  option("Repair", `Shields back to full — now ${run.shields}`, () => {
    const gain = refillShields();
    SFX.unlockChime();
    renderTopHud("enc");
    showPopup({
      banner: "REPAIR", tone: "good", title: "Armour hammered back into shape",
      effect: gain ? `+${gain} shields` : "Armour was already sound",
      desc: "Wire, hide, and a great deal of swearing.",
      extra: `Shields: ${run.shields} · Hearts still ${run.hearts}/${run.maxHearts}`,
    });
    afterPopups(() => backToMap(true));
  });

  option("Sharpen", `+${CONFIG.SHARPEN_HEARTS} maximum heart for the rest of the run`, () => {
    run.maxHearts += CONFIG.SHARPEN_HEARTS;
    run.hearts += CONFIG.SHARPEN_HEARTS;
    saveState();
    SFX.relic();
    renderTopHud("enc");
    showPopup({
      banner: "SHARPEN", tone: "good", title: "The party steels itself",
      effect: `+${CONFIG.SHARPEN_HEARTS} maximum heart, permanently this run`,
      desc: "Nothing is healed and nothing is mended — but there is more of you now.",
      extra: `Hearts: ${run.hearts}/${run.maxHearts}`,
    });
    afterPopups(() => backToMap(true));
  });

  renderTopHud("enc");
  renderStudentChips();
  showScreen("screen-encounter");
}

// ===================== SAFE PATH =====================
function enterSafe() {
  clearCorridorFx("corridor", "hit-flash", "slash-fx");
  clearFoeStage();
  showScenery("safe");
  showCombatButtons(false);
  const realm = currentRealm();
  applySky("corridor-sky", realm.sky);
  paintHero("hero-sprite", "hero-shields");
  $("enc-who").textContent = "Safe Path — a quiet stretch of corridor";
  $("enc-question").textContent =
    "No danger here, and no reward. A good moment to open the pack. " +
    "Armour is only repaired at a campfire.";
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
  coach("shop");
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
  } else if (id === "potion_patch") {
    const before = run.shields || 0;
    addShieldTop(6);
    effectText = `Shields ${before} → ${run.shields}`;
    SFX.unlockChime();
  } else if (id === "potion_clarity") {
    run.clarityActive = true;
    SFX.unlockChime();
  }
  if (_inventoryReturn === "fight" || _inventoryReturn === "boss") {
    run.potionUsedThisTurn = true;
  }
  saveState();

  showPopup({
    banner: "POTION USED", tone: "good", icon: p.icon,
    title: p.name, effect: effectText, desc: p.desc,
    extra: id === "potion_heal" ? `Hearts: ${run.hearts}/${run.maxHearts}`
         : id === "potion_patch" ? `Shields: ${run.shields}`
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
  if (_inventoryReturn === "fight" || _inventoryReturn === "boss") {
    const boss = _inventoryReturn === "boss";
    showScreen(boss ? "screen-boss" : "screen-encounter");
    renderTopHud(boss ? "boss" : "enc");
    updateCombatButtons(boss ? "boss" : "enc");
    _inventoryReturn = null;
    return;
  }
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
  clearFoeStage();
  showScenery("treasure");
  showCombatButtons(false);
  const realm = currentRealm();
  const q = drawQuestion(realm);
  applySky("corridor-sky", realm.sky);
  paintHero("hero-sprite", "hero-shields");
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
  if (!realm || !run) return;
  clearCorridorFx("boss-corridor", "boss-hit-flash", "boss-slash-fx");
  clearScenery();
  updateStageScale("boss-corridor");

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
  resetFocus();                 // the boss is a fight, so it gets its own Focus
  clearStake();
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
  MUSIC.duck(true);
  animateSprite("boss-sprite", "arriving", 560);
  SFX.bossRoar();
  setTimeout(() => SFX.monsterCry(monsterVoice(m)), 340);
  setTimeout(() => lightningStrike(true), 200);
  updateCombatButtons("boss");
  setTimeout(askBossQuestion, 700);
}

function askBossQuestion() {
  const run = STATE.run, realm = currentRealm();
  if (!run || !realm) return;
  const m = run.boss;
  if (!m) return;
  const cover = m.queue[m.index % m.queue.length];
  // the boss asks the hard version of a curriculum item wherever one exists
  const options = questionsForCover(cover, true);
  const q = options.length ? pick(options) : drawQuestion(realm);
  m.currentQ = q;
  m.index++;
  saveState();

  const frozen = isFrozen();
  $("boss-who").textContent = frozen
    ? `${m.name} freezes you in place — defend!`
    : `${m.name} — ${m.hp} hit${m.hp === 1 ? "" : "s"} remaining`;

  const ids = { question: "boss-question", choices: "boss-choices", feedback: "boss-feedback" };
  const defending = frozen || run.bracing;
  clearStakeUI("boss");
  clearStake();
  _gatingSide = stakesAvailable(q, defending) ? "boss" : null;
  // Live-read, same as the fight path - see isDefendingNow().
  renderQuestion(q, ids,
    correct => resolveCombatAnswer(bossCtx(), correct, q, isDefendingNow()));

  if (stakesAvailable(q, defending)) {
    offerStake("boss", q, (stake, blindResult) => {
      if (blindResult === undefined) {
        _gatingSide = null;
        renderQuestion(q, ids,
          correct => resolveCombatAnswer(bossCtx(), correct, q, isDefendingNow()));
        return;
      }
      resolveCombatAnswer(bossCtx(), blindResult, q, isDefendingNow());
    });
  }
  updateCombatButtons("boss");
}

function bossCtx() {
  return {
    // bossCtx() is handed to callbacks that can fire after a wipe has already
    // nulled the run, so neither the run nor the realm can be assumed here.
    monster: STATE.run ? STATE.run.boss : null,
    ask: askBossQuestion,
    onDefeat: () => {
      showPopup({
        banner: "BOSS DEFEATED", tone: "good",
        title: ((currentRealm() || {}).boss || { name: "The boss" }).name + " is beaten!",
        effect: "The realm is yours",
        extra: `Final blow by ${STATE.run ? STATE.run.currentStudent : "the party"}`,
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
  body += `<p>Their shards were banked as Ember: <b>+${outcome.amount} Ember</b></p>`;
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
