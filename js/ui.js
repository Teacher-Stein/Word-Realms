// ---------------------------------------------------------------------------
// Rendering. Game flow lives in main.js.
// ---------------------------------------------------------------------------

const NODE_ART = {
  start:    "assets/nodes/node_start.png",
  fight:    "assets/nodes/node_fight.png",
  elite:    "assets/nodes/node_elite.png",
  event:    "assets/nodes/node_event.png",
  rest:     "assets/nodes/node_rest.png",
  treasure: "assets/nodes/node_treasure.png",
  safe:     "assets/nodes/node_safe.png",
  shop:     "assets/nodes/node_shop.png",
  boss:     "assets/nodes/node_boss.png",
};
const NODE_LABEL = {
  start: "Entrance", fight: "Fight", elite: "Elite", event: "Event",
  rest: "Campfire", treasure: "Treasure", safe: "Safe Path", shop: "Shop", boss: "BOSS",
};

// map layout constants
const LAYER_GAP = 210;   // horizontal px between layers
const LANE_GAP  = 150;   // vertical px between lanes
const MAP_PAD_X = 140;
const MAP_PAD_Y = 110;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
  // A hidden section has no measurable height, so the shared sprite scale can
  // only be worked out once the screen is actually on. Re-measure here and
  // correct anything that was sized from the previous screen's value.
  if (id === "screen-encounter" || id === "screen-boss") {
    const boss = id === "screen-boss";
    updateStageScale(boss ? "boss-corridor" : "corridor");
    fixSpriteWidths();
    fixSceneryWidth();
    // A sprite that hasn't decoded yet measures as zero, so fit once now and
    // again on the next frame, when the browser has laid the scene out.
    refitCurrentStage();
    requestAnimationFrame(() => { fixSpriteWidths(); refitCurrentStage(); });
  }
}

function refitCurrentStage() {
  const boss = document.getElementById("screen-boss");
  if (boss && boss.classList.contains("active")) {
    fitStage("boss-corridor", "boss-stage");
    return;
  }
  const enc = document.getElementById("screen-encounter");
  if (enc && enc.classList.contains("active")) fitStage("corridor", "monster-stage");
}

// Belt and braces on top of updateStageScale(): measure what actually got
// laid out and step the scale down until the foe - sprite, nameplate, HP and
// intent together - is fully inside the corridor. Nothing may be cut off the
// top of the screen, which is what sent us looking at this in the first place.
function fitStage(corridorId, stageId) {
  const c = document.getElementById(corridorId);
  const st = document.getElementById(stageId);
  if (!c || !st) return;
  for (let i = 0; i < 6 && STAGE_SCALE > 1; i++) {
    // offsetTop/offsetHeight ignore CSS transforms. getBoundingClientRect()
    // does not - and the monster's arrival animation starts at scale(.6), so
    // measuring rects mid-animation reported a sprite that fitted when the
    // full-size one did not.
    if (!st.offsetHeight) return;
    if (st.offsetTop >= 6) return;
    STAGE_SCALE = Math.max(1, STAGE_SCALE - 0.5);
    fixSpriteWidths();
    fixSceneryWidth();
  }
}

// ------------------------------- hearts ------------------------------------
function renderHearts(elId, hearts, maxHearts, losingIndex = -1) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
  // Past ten, a row of individual hearts stops being readable from the back of
  // a classroom and starts being a bar chart. Collapse to a count.
  if (maxHearts > 10) {
    const wrap = document.createElement("span");
    wrap.className = "heart-stack";
    wrap.innerHTML =
      '<span class="heart-icon"><i class="sq"></i><i class="c1"></i><i class="c2"></i></span>' +
      `<b>${hearts}<span>/${maxHearts}</span></b>`;
    el.appendChild(wrap);
    return;
  }
  for (let i = 0; i < maxHearts; i++) {
    const h = document.createElement("span");
    h.className = "heart-icon" + (i < hearts ? "" : " empty") +
                  (i === losingIndex ? " losing" : "");
    h.innerHTML = '<i class="sq"></i><i class="c1"></i><i class="c2"></i>';
    el.appendChild(h);
  }
}

// ------------------------------- menu --------------------------------------
function renderMenu() {
  if (typeof MUSIC !== "undefined") { MUSIC.duck(false); MUSIC.play("title"); }
  const strip = document.getElementById("class-strip");
  strip.textContent = STATE.roster
    ? `Class: ${STATE.roster.className}  ·  ${STATE.roster.students.length} warriors`
    : "No class roster set — open Class Roster to add your students.";

  const grid = document.getElementById("realm-select");
  grid.innerHTML = "";
  Object.values(REALMS).forEach(realm => {
    const unlocked = STATE.unlockedRealms.includes(realm.id);
    const playable = unlocked && realm.ready;
    const card = document.createElement("div");
    card.className = "realm-card" + (unlocked ? "" : " locked") +
                     (realm.ready ? "" : " notready");
    const inProgress = STATE.run && STATE.run.realmId === realm.id;
    card.innerHTML = `
      <div class="realm-card-num">${realm.id}</div>
      <div class="realm-card-name">${realm.name}</div>
      <div class="realm-card-theme">${realm.theme}</div>
      <div class="realm-card-status">${
        !unlocked ? "🔒 Locked"
        : !realm.ready ? "Coming soon"
        : inProgress ? "Resume →" : "Enter →"}</div>
      ${realm.artPending && realm.ready
        ? '<div class="realm-card-note">Playable · artwork still to come</div>' : ""}`;
    if (playable) card.addEventListener("click", () => window.enterRealm(realm.id));
    grid.appendChild(card);
  });
}

function renderTeacherRealmList() {
  const wrap = document.getElementById("teacher-realm-list");
  wrap.innerHTML = "";
  Object.values(REALMS).forEach(realm => {
    const row = document.createElement("label");
    row.className = "teacher-row";
    const checked  = STATE.unlockedRealms.includes(realm.id) ? "checked" : "";
    const disabled = realm.id === 1 ? "disabled" : "";
    row.innerHTML = `<input type="checkbox" data-realm="${realm.id}" ${checked} ${disabled}>
      Realm ${realm.id} — ${realm.name}${realm.id === 1 ? " (always open)" : ""}
      ${realm.ready ? "" : '<span style="opacity:.6"> · not built yet</span>'}`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", e => {
      teacherUnlock(parseInt(e.target.dataset.realm, 10), e.target.checked);
      renderMenu();
    });
  });
  document.getElementById("auto-unlock-toggle").checked = STATE.teacherAutoUnlock;
  const pt = document.getElementById("perks-toggle");
  if (pt) pt.checked = STATE.perksEnabled !== false;
  const ct = document.getElementById("coach-toggle");
  if (ct) ct.checked = STATE.coachOn !== false;
  const st = document.getElementById("short-toggle");
  if (st) st.checked = !!STATE.shortRealm;
  renderTeacherStudents();
}

function renderTeacherStudents() {
  const wrap = document.getElementById("teacher-students");
  if (!wrap) return;
  wrap.innerHTML = "";
  const names = STATE.roster ? STATE.roster.students : [];
  if (!names.length) {
    wrap.innerHTML = '<div class="empty-note">No class roster set yet.</div>';
    return;
  }
  names.forEach(n => {
    const row = document.createElement("div");
    row.className = "teacher-student";
    const stats = STATE.studentStats[n] || {};
    row.innerHTML = `<span class="ts-name">${escapeHtml(n)}</span>
      <span class="ts-stats">${stats.correct || 0} correct · ${stats.wrong || 0} wrong</span>`;
    const btn = document.createElement("button");
    btn.className = "pixel-btn tiny danger";
    btn.textContent = "Remove";
    btn.addEventListener("click", () => window.teacherRemoveStudent(n));
    row.appendChild(btn);
    wrap.appendChild(row);
  });
}

// ---------------------------- leaderboards ---------------------------------
function renderLeaderboards() {
  // classes: best score per class
  const byClass = {};
  STATE.leaderboard.forEach(r => {
    if (!byClass[r.className] || r.score > byClass[r.className].score) {
      byClass[r.className] = r;
    }
  });
  const classRows = Object.values(byClass).sort((a, b) => b.score - a.score);
  const cEl = document.getElementById("tab-class");
  if (!classRows.length) {
    cEl.innerHTML = '<div class="empty-note">No runs finished yet. Clear a realm to get on the board.</div>';
  } else {
    cEl.innerHTML = `<table class="board">
      <tr><th>#</th><th>Class</th><th>Score</th><th>Time</th><th>Hearts left</th><th>Correct</th><th>Date</th></tr>
      ${classRows.map((r, i) => `<tr>
        <td class="rank">${i + 1}</td>
        <td><b>${escapeHtml(r.className)}</b></td>
        <td>${r.score}</td>
        <td>${r.minutes} min</td>
        <td>${r.hearts}/${r.maxHearts}</td>
        <td>${r.correct}/${r.correct + r.wrong}</td>
        <td>${r.date}</td></tr>`).join("")}
    </table>`;
  }

  // warriors: per-student stats
  const names = Object.keys(STATE.studentStats);
  const sEl = document.getElementById("tab-students");
  if (!names.length) {
    sEl.innerHTML = '<div class="empty-note">No warrior stats yet. Set a class roster and play a realm.</div>';
    return;
  }
  const rows = names.map(n => ({ name: n, ...STATE.studentStats[n] }))
    .sort((a, b) => (b.correct * 10 + b.monsters * 5) - (a.correct * 10 + a.monsters * 5));
  sEl.innerHTML = `<table class="board">
    <tr><th>#</th><th>Warrior</th><th>Correct</th><th>Wrong</th><th>Monsters felled</th><th>Damage taken</th><th>Relics</th><th>Team-ups</th></tr>
    ${rows.map((r, i) => `<tr>
      <td class="rank">${i + 1}</td>
      <td><b>${escapeHtml(r.name)}</b></td>
      <td>${r.correct}</td><td>${r.wrong}</td>
      <td>${r.monsters}</td><td>${r.damage}</td>
      <td>${r.relics}</td><td>${r.teamups}</td></tr>`).join("")}
  </table>`;
}

function escapeHtml(s) {
  return String(s).replace(/[&<>"']/g, c => (
    { "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
}

// -------------------------------- map --------------------------------------
function mapLayout(map) {
  const pos = {};
  const maxLanes = Math.max(...map.layerNodeIds.map(ids => ids.length));
  const height = MAP_PAD_Y * 2 + (maxLanes - 1) * LANE_GAP;
  map.layerNodeIds.forEach((ids, L) => {
    const x = MAP_PAD_X + L * LAYER_GAP;
    const n = ids.length;
    const spanTop = (height - (n - 1) * LANE_GAP) / 2;
    ids.forEach((id, i) => { pos[id] = { x, y: spanTop + i * LANE_GAP }; });
  });
  const width = MAP_PAD_X * 2 + (map.layerNodeIds.length - 1) * LAYER_GAP;
  return { pos, width, height };
}

let MAP_GEO = null;

function renderMap() {
  const run = STATE.run;
  const canvas = document.getElementById("map-canvas");
  canvas.innerHTML = "";

  const geo = mapLayout(run.map);
  MAP_GEO = geo;
  canvas.style.width  = geo.width + "px";
  canvas.style.height = geo.height + "px";

  const reachable = nodeById(run.map, run.currentNodeId).connectsTo;

  // edges
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", geo.width);
  svg.setAttribute("height", geo.height);
  svg.classList.add("map-svg");
  run.map.nodes.forEach(node => {
    node.connectsTo.forEach(toId => {
      const a = geo.pos[node.id], b = geo.pos[toId];
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      const traveled = run.visitedNodeIds.includes(node.id) &&
                       run.visitedNodeIds.includes(toId);
      const open = node.id === run.currentNodeId;
      line.setAttribute("class", "edge" + (traveled ? " traveled" : open ? " open" : ""));
      svg.appendChild(line);
    });
  });
  canvas.appendChild(svg);

  // room nodes
  run.map.nodes.forEach(node => {
    const p = geo.pos[node.id];
    const isVisited   = run.visitedNodeIds.includes(node.id);
    const isCurrent   = node.id === run.currentNodeId;
    const isReachable = reachable.includes(node.id);

    const div = document.createElement("div");
    div.className = "map-node type-" + node.type +
      (isCurrent ? " current" : "") +
      (isVisited && !isCurrent ? " visited" : "") +
      (isReachable ? " reachable" : (isVisited || isCurrent ? "" : " unreachable"));
    div.style.left = p.x + "px";
    div.style.top  = p.y + "px";

    const img = document.createElement("img");
    img.src = NODE_ART[node.type];
    img.alt = NODE_LABEL[node.type];
    div.appendChild(img);

    const label = document.createElement("div");
    label.className = "node-label";
    label.textContent = NODE_LABEL[node.type];
    div.appendChild(label);

    // make the cost of an Elite obvious before the class commits to it
    if (node.type === "elite" && isReachable) {
      const warn = document.createElement("div");
      warn.className = "elite-warning";
      warn.textContent = `${CONFIG.ELITE_HP} HITS`;
      div.appendChild(warn);
    }

    if (isReachable) {
      div.addEventListener("click", () => window.travelToNode(node.id));
    }
    canvas.appendChild(div);
  });

  // player totem sits on the current room
  const totem = document.createElement("div");
  totem.className = "totem";
  totem.id = "player-totem";
  const cp = geo.pos[run.currentNodeId];
  totem.style.left = cp.x + "px";
  totem.style.top  = cp.y + "px";
  canvas.appendChild(totem);

  centreOnCurrent(false);
}

// Auto-follow: keep the party's room in view as the map scrolls past.
function centreOnCurrent(animate = true) {
  const run = STATE.run;
  if (!run || !MAP_GEO) return;
  const viewport = document.getElementById("map-viewport");
  const canvas   = document.getElementById("map-canvas");
  const p = MAP_GEO.pos[run.currentNodeId];
  const vw = viewport.clientWidth, vh = viewport.clientHeight;

  // keep the current room slightly left of centre so the path ahead is visible
  let tx = vw * 0.38 - p.x;
  let ty = vh * 0.5  - p.y;
  tx = Math.min(0, Math.max(tx, vw - MAP_GEO.width));
  if (MAP_GEO.width  < vw) tx = (vw - MAP_GEO.width) / 2;
  ty = Math.min(0, Math.max(ty, vh - MAP_GEO.height));
  if (MAP_GEO.height < vh) ty = (vh - MAP_GEO.height) / 2;

  canvas.style.transition = animate ? "" : "none";
  canvas.style.transform = `translate(${tx}px, ${ty}px)`;
  if (!animate) requestAnimationFrame(() => { canvas.style.transition = ""; });
}

// Walk the totem along the edge, dropping footprints behind it.
function walkTotemTo(fromId, toId, done) {
  const canvas = document.getElementById("map-canvas");
  const totem  = document.getElementById("player-totem");
  if (!totem || !MAP_GEO) { done && done(); return; }
  const a = MAP_GEO.pos[fromId], b = MAP_GEO.pos[toId];

  const STEPS = 5;
  for (let i = 1; i <= STEPS; i++) {
    const t = i / (STEPS + 1);
    const fx = a.x + (b.x - a.x) * t;
    const fy = a.y + (b.y - a.y) * t;
    setTimeout(() => {
      const fp = document.createElement("div");
      fp.className = "footprint";
      fp.style.left = (fx + (i % 2 ? -9 : 9)) + "px";
      fp.style.top  = fy + "px";
      const ang = Math.atan2(b.y - a.y, b.x - a.x) * 180 / Math.PI + 90;
      fp.style.transform = `translate(-50%,-50%) rotate(${ang}deg)`;
      canvas.appendChild(fp);
      SFX.move();
      setTimeout(() => fp.remove(), 2500);
    }, i * 120);
  }
  totem.style.left = b.x + "px";
  totem.style.top  = b.y + "px";
  setTimeout(done, 900);
}

// ------------------------------- HUD ---------------------------------------
function renderTopHud(prefix) {
  const run = STATE.run, realm = currentRealm();
  if (!run) return;

  // hero portrait + identity
  const hero = currentHero();
  const port = document.getElementById(`${prefix}-portrait`);
  if (port && hero) {
    const img = port.querySelector("img");
    if (img && img.getAttribute("src") !== hero.sprite) img.src = hero.sprite;
  }
  const hn = document.getElementById(`${prefix}-hero-name`);
  if (hn && hero) hn.textContent = hero.name.toUpperCase();
  const pn = document.getElementById(`${prefix}-party-name`);
  if (pn) {
    const r = STATE.roster;
    pn.textContent = r
      ? (r.partyName ? `${r.className} — ${r.partyName}` : r.className)
      : "No class set";
  }

  renderHearts(`${prefix}-hearts`, run.hearts, run.maxHearts);
  // shields render right after the hearts
  const heartsEl = document.getElementById(`${prefix}-hearts`);
  if (heartsEl) {
    // Shields can now reach the high teens, and drawing one pip each turned
    // the HUD into a bar chart. Past six they collapse into a single pip
    // with a count.
    const n = run.shields || 0;
    if (n > 6) {
      const wrap = document.createElement("span");
      wrap.className = "shield-stack";
      wrap.innerHTML = '<span class="shield-pip"></span><b>&times;' + n + "</b>";
      heartsEl.appendChild(wrap);
    } else {
      for (let i = 0; i < n; i++) {
        const sp = document.createElement("span");
        sp.className = "shield-pip";
        heartsEl.appendChild(sp);
      }
    }
  }
  const st = document.getElementById(`${prefix}-streak`);
  if (st) {
    st.textContent = `Streak ${run.streak || 0}`;
    st.className = "badge streak" + ((run.streak || 0) >= CONFIG.STREAK_GUARD ? " hot" : "");
  }
  const nameEl = document.getElementById(`${prefix}-realm-name`);
  if (nameEl) nameEl.textContent = `Realm ${realm.id} · ${realm.name}`;
  const sh = document.getElementById(`${prefix}-shards`);
  if (sh) sh.textContent = run.shards;
  const em = document.getElementById(`${prefix}-ember`);
  if (em) em.textContent = STATE.ember;
  const po = document.getElementById(`${prefix}-potions`);
  if (po) {
    const n = run.potions ? run.potions.length : 0;
    po.textContent = n ? `${n} potion${n > 1 ? "s" : ""}` : "No potions";
  }
  const rl = document.getElementById(`${prefix}-relics`);
  if (rl) rl.textContent = run.relics.length
    ? run.relics.map(r => r.name).join(" · ") : "No relics yet";
  renderRelicStrip(prefix);
  // the HUD is redrawn after every state change, so this is the one place
  // that reliably keeps the hero's status chips honest
  refreshStatus();
}

// ---------------------------------------------------------------------------
// The relic bar.
//
// Relics were only listed as text on the map screen, so a party fighting with
// a Lucky Charm - which the Wordsmith hands out at the start of every run -
// had no way of knowing it was there. They now sit as icons across the top of
// every in-run screen, the way Slay the Spire does it.
// ---------------------------------------------------------------------------
function renderRelicStrip(prefix) {
  const el = document.getElementById(`${prefix}-relic-strip`);
  const run = STATE.run;
  if (!el || !run) return;
  const gear = [run.weapon, run.armour].filter(Boolean).map(gearById).filter(Boolean);
  const items = gear.concat(run.relics.map(r => relicById(r.id) || r));
  el.innerHTML = "";
  if (!items.length) {
    el.innerHTML = '<span class="relic-none">No relics yet</span>';
    return;
  }
  items.forEach(item => {
    const d = document.createElement("div");
    d.className = "relic-chip" + (item.rarity ? " r-" + item.rarity : "") +
                  (item.slot ? " gear" : "");
    d.innerHTML = `<img src="${item.icon}" alt=""><span class="relic-tip">
      <b>${escapeHtml(item.name)}</b>${escapeHtml(item.effect || "")}</span>`;
    el.appendChild(d);
  });
}

function renderStudentChips() {
  // No roster set (a teacher playtesting alone, or a first run before the
  // class list exists) used to render a bare dash. Say something useful.
  const noRoster = !STATE.roster || !STATE.roster.students.length;
  const name = STATE.run && STATE.run.currentStudent ? STATE.run.currentStudent
             : noRoster ? "ANYONE!" : "—";
  ["map-student", "enc-student", "boss-student"].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = name;
  });
}

// --------------------------- monster HP pips -------------------------------
function renderMonsterHp(elId, current, max, addedIndex = -1) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = '<span class="monster-hp-label">HP</span>';
  for (let i = 0; i < max; i++) {
    const pip = document.createElement("span");
    pip.className = "hp-pip" + (i < current ? "" : " spent") +
                    (i === addedIndex ? " added" : "");
    el.appendChild(pip);
  }
}

// ----------------------------- effects -------------------------------------
// NOTE: these effect classes MUST be cleared once the animation ends.
// A CSS animation restarts whenever its element goes from display:none back
// to visible, so a leftover .go/.shake class made the red damage flash and
// screen shake replay every time the class walked into any room.
function runOnce(el, cls, ms) {
  if (!el) return;
  el.classList.remove(cls);
  void el.offsetWidth;             // force reflow so the animation restarts
  el.classList.add(cls);
  clearTimeout(el._fxTimer);
  el._fxTimer = setTimeout(() => el.classList.remove(cls), ms);
}
function playSlash(fxId) {
  runOnce(document.getElementById(fxId), "go", 420);
}
function playHitFlash(flashId, corridorId) {
  runOnce(document.getElementById(flashId), "go", 520);
  runOnce(document.getElementById(corridorId), "shake", 480);
}
// Belt and braces: strip any lingering effect classes when a corridor screen
// is shown, so nothing can flash on entry.
function clearCorridorFx(corridorId, flashId, slashId) {
  [[corridorId, "shake"], [flashId, "go"], [slashId, "go"]].forEach(([id, cls]) => {
    const el = document.getElementById(id);
    if (el) { clearTimeout(el._fxTimer); el.classList.remove(cls); }
  });
}
function animateSprite(spriteId, cls, ms = 600) {
  const s = document.getElementById(spriteId);
  if (!s) return;
  s.classList.remove("hurt", "attack", "dying", "arriving");
  void s.offsetWidth;
  s.classList.add(cls);
  // "dying" is the one animation that must NOT be cleared on a timer. It ends
  // on opacity 0 and holds there (animation-fill-mode: forwards); stripping
  // the class put the monster back on its feet while the reward cards were
  // still on screen. It is cleared when the next room stages a foe.
  if (cls === "dying") return;
  setTimeout(() => s.classList.remove(cls), ms);
}

// ---------------------------------------------------------------------------
// Painted backdrops.
//
// Each realm has three of them and the party works through them as it goes
// deeper, so a 20-layer map doesn't look the same at the boss as it did at the
// entrance. When a backdrop is in place the procedural brick walls, ceiling,
// floor and torches are hidden - the painting supplies all of that - but the
// animated storm layer stays on top of it.
// ---------------------------------------------------------------------------
const BACKDROPS = {
  1: ["assets/backdrops/realm1_band1.png",
      "assets/backdrops/realm1_band2.png",
      "assets/backdrops/realm1_band3.png"],
};

// How far through the map the party is, 0 at the entrance and 1 at the boss.
function runDepth() {
  const run = STATE.run;
  if (!run || !run.map) return 0;
  const node = nodeById(run.map, run.currentNodeId);
  const last = run.map.layerNodeIds.length - 1;
  if (!node || last <= 0) return 0;
  return node.layer / last;
}

function backdropForDepth(realmId, depth) {
  const set = BACKDROPS[realmId];
  if (!set) return null;
  const band = depth >= 0.70 ? 2 : depth >= 0.35 ? 1 : 0;
  return set[band];
}

function applyBackdrop(corridor) {
  if (!corridor || !STATE.run) return;
  const src = backdropForDepth(STATE.run.realmId, runDepth());
  if (!src) { corridor.classList.remove("has-backdrop"); return; }
  corridor.classList.add("has-backdrop");
  if (corridor.dataset.backdrop !== src) {
    corridor.dataset.backdrop = src;
    corridor.style.backgroundImage = `url('${src}')`;
  }
}

function applySky(skyElId, skyName) {
  const el = document.getElementById(skyElId);
  if (!el) return;
  // tint the whole corridor with the realm's gradient
  const corridor = el.parentElement;
  if (corridor) corridor.dataset.realmsky = skyName;
  applyBackdrop(corridor);
  if (el.childElementCount) return;
  if (skyName === "storm") {
    // two full-scene lightning washes, offset so flashes feel irregular
    ["", "f2"].forEach(cls => {
      const f = document.createElement("div");
      f.className = "sky-flash " + cls;
      el.appendChild(f);
    });
    // the big strike's wash - driven from JS so thunder lands with it
    const wash = document.createElement("div");
    wash.className = "sky-wash";
    el.appendChild(wash);

    // Bolts: were 6px wide and confined to the top quarter, which read as
    // scratches. Now they are fat, forked and long enough to fall behind the
    // fighters. Widths and heights vary so no two look stamped.
    [["12%", "0%", "62%", 22, ""],
     ["31%", "2%", "44%", 15, "b2"],
     ["48%", "0%", "70%", 26, "b3"],
     ["66%", "3%", "40%", 14, ""],
     ["82%", "0%", "58%", 20, "b2"],
     ["93%", "5%", "34%", 12, "b3"]]
      .forEach(([left, top, h, w, cls]) => {
        const b = document.createElement("div");
        b.className = "sky-bolt " + cls;
        b.style.left = left; b.style.top = top;
        b.style.height = h; b.style.width = w + "px";
        el.appendChild(b);
      });
  }
}

// ===========================================================================
// REWARD POPUPS
// Rewards get a centre-screen card that waits to be dismissed, so nothing
// important vanishes before the class has read it.
// ===========================================================================
let _popupQueue = [];
let _popupOpen = false;

/**
 * showPopup({banner, title, effect, desc, extra, icon, tone, onClose})
 * tone: "good" | "bad" | "neutral" | "" (gold)
 * Popups queue up, so several rewards in a row are shown one after another.
 */
function showPopup(opts) {
  _popupQueue.push(opts);
  if (!_popupOpen) drainPopups();
}

function drainPopups() {
  if (!_popupQueue.length) {
    _popupOpen = false;
    document.getElementById("popup-layer").classList.remove("open");
    return;
  }
  _popupOpen = true;
  const o = _popupQueue.shift();
  const card = document.getElementById("popup-card");
  card.className = "popup-card " + (o.tone || "");
  document.getElementById("popup-banner").textContent = o.banner || "REWARD";
  document.getElementById("popup-title").textContent  = o.title || "";
  const eff = document.getElementById("popup-effect");
  eff.textContent = o.effect || "";
  eff.style.display = o.effect ? "" : "none";
  const desc = document.getElementById("popup-desc");
  desc.textContent = o.desc || "";
  desc.style.display = o.desc ? "" : "none";
  const extra = document.getElementById("popup-extra");
  extra.textContent = o.extra || "";
  extra.style.display = o.extra ? "" : "none";
  const icon = document.getElementById("popup-icon");
  if (o.icon) { icon.src = o.icon; icon.style.display = ""; }
  else { icon.removeAttribute("src"); icon.style.display = "none"; }
  document.getElementById("popup-continue").textContent = o.button || "Continue";
  document.getElementById("popup-layer").classList.add("open");
  _popupCurrentOnClose = o.onClose || null;
  // A queued popup can carry its own second button. addPopupCancel() only
  // ever reaches the card that is on screen RIGHT NOW, which is no use for a
  // reward card sitting behind two others in the queue.
  if (o.cancel) addPopupCancel(o.cancel, o.onCancel);
}

let _popupCurrentOnClose = null;
function closePopup() {
  const fn = _popupCurrentOnClose;
  _popupCurrentOnClose = null;
  const layer = document.getElementById("popup-layer");
  layer.classList.remove("open");
  if (fn) fn();
  // let the fade finish before the next card pops
  setTimeout(drainPopups, 120);
}

function popupsPending() { return _popupOpen || _popupQueue.length > 0; }

// ===========================================================================
// ITEM TILES
// ===========================================================================
function itemTile(item, opts = {}) {
  const div = document.createElement("div");
  div.className = "item-tile" +
    (item.rarity ? " rarity-" + item.rarity : "") +
    (opts.sold ? " sold" : "") +
    (opts.usable ? " usable" : "") +
    (opts.unaffordable ? " unaffordable" : "");
  let html = "";
  if (item.rarity) html += `<div class="it-rarity">${item.rarity}</div>`;
  html += `<img src="${item.icon}" alt="">
           <div class="it-name">${escapeHtml(item.name)}</div>
           <div class="it-effect">${escapeHtml(item.effect)}</div>
           <div class="it-desc">${escapeHtml(item.desc)}</div>`;
  if (opts.note) {
    html += `<div class="it-note">${escapeHtml(opts.note)}</div>`;
  }
  if (opts.price != null) {
    html += `<div class="it-price"><span class="icon-shard"></span>${opts.price}</div>`;
  }
  div.innerHTML = html;
  if (opts.buttonLabel) {
    const btn = document.createElement("button");
    btn.className = "pixel-btn tiny buy-btn";
    btn.textContent = opts.buttonLabel;
    btn.disabled = !!opts.disabled;
    btn.addEventListener("click", e => { e.stopPropagation(); opts.onClick && opts.onClick(); });
    div.appendChild(btn);
  } else if (opts.onClick) {
    div.addEventListener("click", opts.onClick);
  }
  return div;
}

function renderInventory(opts = {}) {
  const run = STATE.run;
  document.getElementById("inv-summary").innerHTML = `
    <span class="badge"><span class="icon-shard"></span>${run.shards} shards</span>
    <span class="badge ember"><span class="icon-ember"></span>${STATE.ember} ember</span>
    <span class="badge">${run.hearts}/${run.maxHearts} hearts</span>`;

  // equipment slots
  const gearEl = document.getElementById("inv-gear");
  if (gearEl) {
    gearEl.innerHTML = "";
    [["weapon","Weapon"],["armour","Armour"]].forEach(([slot,label]) => {
      const id = run[slot];
      const g = id ? gearById(id) : null;
      if (!g) {
        const empty = document.createElement("div");
        empty.className = "item-tile slot-empty";
        empty.innerHTML = `<div class="it-slot">${label}</div>
          <div class="it-name">Empty</div>
          <div class="it-desc">Find or buy ${label.toLowerCase()} on your travels.</div>`;
        gearEl.appendChild(empty);
        return;
      }
      const tile = itemTile(g, {});
      const badge = document.createElement("div");
      badge.className = "it-slot";
      badge.textContent = label;
      tile.appendChild(badge);
      const ench = run.enchants && run.enchants[slot] ? enchantById(run.enchants[slot]) : null;
      if (ench) {
        const e = document.createElement("div");
        e.className = "it-enchant";
        e.textContent = `✦ ${ench.name} — ${ench.effect}`;
        tile.appendChild(e);
      }
      gearEl.appendChild(tile);
    });
  }

  const rel = document.getElementById("inv-relics");
  rel.innerHTML = "";
  if (!run.relics.length) {
    rel.innerHTML = '<div class="item-tile empty-slot"><div class="it-name">No relics yet</div>' +
      '<div class="it-desc">Beat an Elite, open a chest, or visit the pedlar.</div></div>';
  } else {
    run.relics.forEach(r => {
      const full = relicById(r.id) || r;
      rel.appendChild(itemTile(full));
    });
  }

  const pot = document.getElementById("inv-potions");
  pot.innerHTML = "";
  if (!run.potions.length) {
    pot.innerHTML = '<div class="item-tile empty-slot"><div class="it-name">No potions</div>' +
      '<div class="it-desc">Buy them from the Storm Pedlar.</div></div>';
  } else {
    // group identical potions
    const counts = {};
    run.potions.forEach(id => counts[id] = (counts[id] || 0) + 1);
    Object.entries(counts).forEach(([id, n]) => {
      const p = potionById(id);
      if (!p) return;
      const label = n > 1 ? `${p.name} ×${n}` : p.name;
      pot.appendChild(itemTile({ ...p, name: label }, {
        usable: !!opts.usable,
        buttonLabel: opts.usable ? "Use" : null,
        onClick: opts.usable ? () => opts.onUse(id) : null,
      }));
    });
  }
}

function renderForge() {
  document.getElementById("forge-ember").textContent = STATE.ember;
  document.getElementById("forge-feedback").textContent = "";
  const grid = document.getElementById("forge-grid");
  grid.innerHTML = "";
  FORGE_PERKS.forEach(perk => {
    const owned = perksForRealm(forgeRealmId()).includes(perk.id);
    const poor = !owned && STATE.ember < perk.cost;
    const tile = itemTile(
      { icon: perk.icon, name: perk.name, effect: perk.effect, desc: perk.desc },
      {
        sold: owned, unaffordable: poor,
        buttonLabel: owned ? "Forged" : "Forge it",
        disabled: owned || poor,
        onClick: () => window.forgeBuy(perk.id),
      });
    const price = document.createElement("div");
    price.className = "it-price";
    price.innerHTML = `<span class="icon-ember"></span>${perk.cost}`;
    tile.insertBefore(price, tile.querySelector(".buy-btn"));
    grid.appendChild(tile);
  });
}

function renderShop(nodeId) {
  const run = STATE.run;
  const stock = shopStockFor(nodeId);
  document.getElementById("shop-shards").textContent = run.shards;
  document.getElementById("shop-feedback").textContent = "";

  const relEl = document.getElementById("shop-relics");
  relEl.innerHTML = "";
  stock.relics.forEach((entry, i) => {
    const r = relicById(entry.id);
    if (!r) return;
    relEl.appendChild(itemTile(r, {
      price: entry.price, sold: entry.sold,
      unaffordable: !entry.sold && run.shards < entry.price,
      buttonLabel: entry.sold ? "Sold" : "Buy",
      disabled: entry.sold || run.shards < entry.price,
      onClick: () => window.shopBuy(nodeId, "relics", i),
    }));
  });

  const gearEl = document.getElementById("shop-gear");
  if (gearEl) {
    gearEl.innerHTML = "";
    (stock.gear || []).forEach((entry, i) => {
      const g = gearById(entry.id);
      if (!g) return;
      const current = run[g.slot] ? gearById(run[g.slot]) : null;
      gearEl.appendChild(itemTile(g, {
        price: entry.price, sold: entry.sold,
        unaffordable: !entry.sold && run.shards < entry.price,
        // A weapon or armour REPLACES what is already carried, and the etching
        // on the old piece is lost with it. Say so on the tile rather than
        // letting a class find out afterwards.
        note: current && current.id !== g.id
          ? `Replaces your ${current.name}` : null,
        buttonLabel: entry.sold ? "Sold" : (current ? "Swap" : "Buy"),
        disabled: entry.sold || run.shards < entry.price,
        onClick: () => window.shopBuy(nodeId, "gear", i),
      }));
    });
  }

  const potEl = document.getElementById("shop-potions");
  potEl.innerHTML = "";
  stock.potions.forEach((entry, i) => {
    const p = potionById(entry.id);
    if (!p) return;
    potEl.appendChild(itemTile(p, {
      price: entry.price, sold: entry.sold,
      unaffordable: !entry.sold && run.shards < entry.price,
      buttonLabel: entry.sold ? "Sold" : "Buy",
      disabled: entry.sold || run.shards < entry.price,
      onClick: () => window.shopBuy(nodeId, "potions", i),
    }));
  });
}

// potion count for the HUD
function renderPotionBadge(prefix) {
  const el = document.getElementById(`${prefix}-potions`);
  if (!el || !STATE.run) return;
  const n = STATE.run.potions.length;
  el.textContent = n ? `${n} potion${n > 1 ? "s" : ""}` : "No potions";
}

// ===========================================================================
// BUILD A additions
// ===========================================================================

// Every sprite in the game is displayed at the same pixel scale, so the whole
// cast shares one pixel size. Sizes come from the PNG's natural width.
const SPRITE_SCALE = 4;      // v5.1: the panel shrank, so the cast grew
const TALLEST_SPRITE = 152;  // the boss, in true pixels - the worst case
let STAGE_SCALE = SPRITE_SCALE;

// One scale for everything on screen, so the whole cast keeps a single pixel
// size. It only drops below 3x on a window too short to fit a full-size
// monster AND the info block that now sits underneath it - on a projector or
// classroom TV it is always 3x.
function updateStageScale(corridorId) {
  const c = document.getElementById(corridorId);
  const h = c ? c.clientHeight : 0;
  if (!h) { STAGE_SCALE = SPRITE_SCALE; return STAGE_SCALE; }
  const usable = h * 0.96 - 104;                // info block + floor margin
  let s = Math.floor((usable / TALLEST_SPRITE) * 2) / 2;   // half-step scales
  STAGE_SCALE = Math.max(1, Math.min(SPRITE_SCALE, s));
  return STAGE_SCALE;
}

const _spriteNatural = {};
function spriteWidth(src) {
  let nat = _spriteNatural[src];
  if (nat == null) {
    const img = new Image();
    img.src = src;
    nat = img.naturalWidth || 0;
    if (nat) _spriteNatural[src] = nat;
  }
  return nat ? nat * STAGE_SCALE : 200;   // fallback until the image loads
}

// Once images finish loading, correct any width we had to guess.
const _SCALED_IMGS = ["hero-sprite", "monster-sprite", "boss-sprite", "boss-hero-sprite"];

// Heroes read a little small next to the monsters they are fighting. This is
// purely cosmetic - it changes nothing about reach, damage or hitboxes,
// because there are none.
const HERO_SCALE_BOOST = 1.18;

// Set an image's width from the shared pixel scale, WITHOUT ever distorting it.
//
// The bug this fixes: width was set inline from naturalWidth * STAGE_SCALE,
// while the CSS clamped the boss with `max-height: 380px`. With an explicit
// width and height:auto, the browser computes the height from the aspect ratio,
// clamps it to 380 - and does NOT reduce the width to match. The Hurricane
// Titan's art is 145x150, very nearly square, and it was being rendered into a
// 580x380 box: an aspect of 1.53 against a true 0.97. It looked stretched
// because it WAS stretched, by more than half again.
//
// Clamping the width against the same max-height keeps the sprite in
// proportion and, for the boss, narrower - which is what Stein asked for.
function sizeSprite(el, scale) {
  if (!el || !el.naturalWidth || !el.naturalHeight) return;
  let w = el.naturalWidth * scale;
  const maxH = parseFloat(getComputedStyle(el).maxHeight);
  if (maxH && isFinite(maxH)) {
    const hAtW = w * (el.naturalHeight / el.naturalWidth);
    if (hAtW > maxH) w = maxH * (el.naturalWidth / el.naturalHeight);
  }
  el.style.width = Math.round(w) + "px";
  el.style.height = "auto";
}

function fixSpriteWidths() {
  _SCALED_IMGS.forEach(id => {
    const el = document.getElementById(id);
    if (!el) return;
    const isHero = id === "hero-sprite" || id === "boss-hero-sprite";
    sizeSprite(el, STAGE_SCALE * (isHero ? HERO_SCALE_BOOST : 1));
  });
}
window.addEventListener("load", fixSpriteWidths);
_SCALED_IMGS.forEach(id => {
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("load", () => {
      const isHero = id === "hero-sprite" || id === "boss-hero-sprite";
      sizeSprite(el, STAGE_SCALE * (isHero ? HERO_SCALE_BOOST : 1));
      refitCurrentStage();
    });
  });
});
function fixSceneryWidth() {
  const sc = document.getElementById("room-scenery");
  if (sc && sc.naturalWidth && sc.getAttribute("src")) {
    sc.style.width = (sc.naturalWidth * STAGE_SCALE) + "px";
  }
}

// Resizing the window (or plugging in the TV) changes how much room the
// corridor has, so rescale what's already on screen.
window.addEventListener("resize", () => {
  const boss = document.getElementById("screen-boss");
  updateStageScale(boss && boss.classList.contains("active") ? "boss-corridor" : "corridor");
  fixSpriteWidths();
  fixSceneryWidth();
});

// tinted monster variants (a recolour multiplies the roster without new art)
function applyVariantTint(imgId, variant) {
  const el = document.getElementById(imgId);
  if (!el) return;
  el.style.filter = variant
    ? `drop-shadow(0 12px 22px rgba(0,0,0,.6)) hue-rotate(${variant.hue}deg) saturate(${variant.sat})`
    : "drop-shadow(0 12px 22px rgba(0,0,0,.6))";
}

// draw the chosen hero into a combat slot
function paintHero(imgId, shieldRowId) {
  const hero = currentHero();
  const el = document.getElementById(imgId);
  if (!el || !hero) return;
  el.src = hero.sprite;
  el.style.width = spriteWidth(hero.sprite) + "px";
  renderShieldRow(shieldRowId);
}

// The row under the hero now carries live status, not just shields.
function renderShieldRow(elId) { renderStatusRow(elId); }

// Refresh whichever hero status row is currently on screen.
function refreshStatus() {
  renderStatusRow("hero-shields");
  renderStatusRow("boss-hero-shields");
}

// ---------------------------------------------------------------------------
// Whose turn it is.
//
// The name used to change quietly in a small chip. In a room of thirty
// ten-year-olds that is the single most missable thing on the screen, so it
// now gets a card across the top of the scene for a moment.
// ---------------------------------------------------------------------------
function showTurnCallout(name) {
  if (!name) return;
  let el = document.getElementById("turn-callout");
  if (!el) {
    el = document.createElement("div");
    el.id = "turn-callout";
    el.className = "turn-callout";
    document.getElementById("app").appendChild(el);
  }
  el.innerHTML = `<span class="tc-label">Your turn</span>
                  <span class="tc-name">${escapeHtml(name)}</span>`;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove("show"), 1500);
}

// ---------------------------------------------------------------------------
// The storm.
//
// The CSS bolts drift along on their own timers for ambience. This is the big
// one: a full-scene white wash, a fat forked bolt and a thunder crack, fired
// on a loose timer and again whenever something hits hard.
// ---------------------------------------------------------------------------
function activeSkyId() {
  const boss = document.getElementById("screen-boss");
  if (boss && boss.classList.contains("active")) return "boss-sky";
  const enc = document.getElementById("screen-encounter");
  if (enc && enc.classList.contains("active")) return "corridor-sky";
  return null;
}

function lightningStrike(withThunder = true) {
  const id = activeSkyId();
  if (!id) return;
  const sky = document.getElementById(id);
  if (!sky) return;
  const wash = sky.querySelector(".sky-wash");
  if (wash) runOnce(wash, "go", 760);
  const bolts = sky.querySelectorAll(".sky-bolt");
  if (bolts.length) {
    const b = bolts[Math.floor(Math.random() * bolts.length)];
    runOnce(b, "strike", 620);
  }
  if (withThunder) SFX.thunder();
}

let _stormTimer = null;
function armStorm() {
  clearTimeout(_stormTimer);
  const next = 6500 + Math.random() * 7000;
  _stormTimer = setTimeout(() => { lightningStrike(true); armStorm(); }, next);
}

// ---------------------------------------------------------------------------
// Room staging.
//
// The corridor is reused by every room type, so anything left over from the
// last fight - the monster's nameplate, its HP pips, its telegraphed intent -
// stays on screen unless it is explicitly wiped. That's what made a Rest room
// show "the remnants of a monster action with no monster at all".
// ---------------------------------------------------------------------------
function clearFoeStage(prefix = "monster") {
  const sprite = document.getElementById(prefix === "boss" ? "boss-sprite" : "monster-sprite");
  if (sprite) {
    sprite.setAttribute("src", "");
    sprite.classList.remove("hurt", "attack", "dying", "arriving");
    sprite.style.filter = "";
  }
  const name = document.getElementById(prefix === "boss" ? "boss-name" : "monster-name");
  if (name) name.textContent = "";
  const hp = document.getElementById(prefix === "boss" ? "boss-hp" : "monster-hp");
  if (hp) hp.innerHTML = "";
  renderIntent(prefix === "boss" ? "boss-intent" : "monster-intent", null);
}

// Furniture for the rooms that have no monster in them.
// Warm timber props for the upper realm, cold steel ones once the party is
// deep enough to be walking through flooded halls.
const SCENERY = {
  rest:     { src: "assets/scenery/bed.png",      deep: "assets/scenery/bed_cool.png",    cls: "" },
  safe:     { src: "assets/scenery/campfire.png", cls: "fire" },
  campfire: { src: "assets/scenery/campfire.png", cls: "fire" },
  treasure: { src: "assets/scenery/chest.png",    deep: "assets/scenery/chest_cool.png",  cls: "" },
  shop:     { src: "assets/scenery/stall.png",    cls: "" },
  // Event rooms deliberately have no prop: the Storm Chaser stands where the
  // scenery would go, and the crates were drawing straight over her.
};

function showScenery(kind) {
  const el = document.getElementById("room-scenery");
  if (!el) return;
  const s = SCENERY[kind];
  if (!s) { clearScenery(); return; }
  updateStageScale("corridor");
  el.className = "room-scenery " + s.cls;
  el.setAttribute("src", (s.deep && runDepth() >= 0.70) ? s.deep : s.src);
  const applyWidth = () => {
    if (el.naturalWidth) el.style.width = (el.naturalWidth * STAGE_SCALE) + "px";
  };
  if (el.complete) applyWidth(); else el.addEventListener("load", applyWidth, { once: true });
}

function clearScenery() {
  const el = document.getElementById("room-scenery");
  if (!el) return;
  el.setAttribute("src", "");
  el.className = "room-scenery";
}

// The monster's telegraphed intent, with a countdown showing WHEN it lands.
// Knowing an attack is coming is useless if you can't tell whether it arrives
// this turn or in three, so the dots tick down and turn red on the last one.
function renderIntent(elId, m) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!m) {
    el.innerHTML = ""; el.className = "intent";
    renderFoeStatus(elId === "boss-intent" ? "boss-status" : "monster-status", null);
    return;
  }

  const label = intentLabel(m);
  if (!label) { el.innerHTML = ""; el.className = "intent"; return; }

  // The unit is ANSWERS, not "turns". A ten-year-old looking at a class roster
  // reads "in 2 turns" as "two of MY turns" and gets hit twice as fast as they
  // expected. Anybody's answer moves this clock, so the label says so.
  let when = "", imminent = false;
  // A charge has its own fuse, counted in the label above. Printing the
  // monster's turn clock underneath it made the screen read "3 damage incoming
  // - ON THE NEXT ANSWER" on a turn that dealt nothing, three times in a row.
  // While a charge is winding up, the label IS the countdown.
  const winding = m.charging && m.charging.turnsLeft > 0;
  if (!m.stunned && !winding) {
    const left = Math.max(0, m.turnsUntilAct);
    imminent = left <= 1;
    const dots = Array.from({ length: Math.max(1, Math.min(4, m.cadence)) },
      (_, i) => `<i class="${i < left ? "" : "spent"}"></i>`).join("");
    when = `<span class="intent-when">${
      imminent ? "ON THE NEXT ANSWER" : `AFTER ${left} MORE ANSWERS`
    }<span class="intent-dots">${dots}</span></span>`;
  }
  el.innerHTML = `<span class="intent-label">${escapeHtml(label)}</span>${when}`;
  el.className = "intent " + (INTENT_CLASS[m.intent && m.intent.kind] || "") +
                 (imminent ? " imminent" : "");
  renderFoeStatus(elId === "boss-intent" ? "boss-status" : "monster-status", m);
}

// ---------------------------------------------------------------------------
// Status chips under the hero.
//
// Debuffs used to be announced once in a small line of feedback text and then
// vanish, so a class could be Chilled or Exposed for three turns with nothing
// on screen saying so. These sit under the hero's feet and stay while active.
// ---------------------------------------------------------------------------
const STATUS_CHIPS = {
  chill:  { label: "CHILLED",  cls: "chill",  hint: "next hit deals no damage" },
  expose: { label: "EXPOSED",  cls: "expose", hint: "next wrong answer costs 2" },
  freeze: { label: "FROZEN",   cls: "freeze", hint: "you must Brace" },
};

function renderStatusRow(elId) {
  const el = document.getElementById(elId);
  if (!el) return;
  const run = STATE.run;
  el.innerHTML = "";
  if (!run) return;

  const add = (label, cls, hint) => {
    const c = document.createElement("div");
    c.className = "status-chip " + cls;
    c.innerHTML = `<b>${label}</b>${hint ? `<span>${hint}</span>` : ""}`;
    el.appendChild(c);
  };

  if (run.debuff && STATUS_CHIPS[run.debuff]) {
    const s = STATUS_CHIPS[run.debuff];
    add(s.label, s.cls, s.hint);
  }
  if (run.bracing)      add("BRACING", "brace", "a correct answer blocks");
  if (run.shieldActive) add("STORM SHIELD", "ward", "blocks the next hit");
  if (run.streakGuard)  add("GUARDED", "ward", "next attack blocked");
  if ((run.shields || 0) > 0) add(`SHIELDS ${run.shields}`, "shield", "");
  if ((run.streak || 0) >= 2) add(`STREAK ${run.streak}`, "streak", "");
}

// ---------------------------------------------------------------------------
// The stake gate: the one decision a question asks before it is answered.
//
// It replaces the Momentum meter, which was a pool spent through a separate UI
// and therefore optional, and therefore ignored. Two buttons, no currency, and
// the wording changes to match what RISKY actually means on THIS question -
// a blind call on an open question, plain double-or-nothing otherwise.
// ---------------------------------------------------------------------------
function renderStakeGate(prefix, q) {
  const el = document.getElementById(`${prefix}-stake-gate`);
  if (!el) return;
  // ask the same predicate the outcome uses, so the promise cannot drift
  const blind = typeof stakeIsBlind === "function"
    ? stakeIsBlind(q, STAKE_RISKY)
    : (q && q.open === true && (q.tier || 1) >= CONFIG.STAKE_MIN_TIER);
  // Show the REAL heart cost of each option, not a multiplier. A ten-year-old
  // deciding under time pressure should not have to do arithmetic on the word
  // "double" - the gate says "costs 3" and "costs 6", and the clue is already
  // on screen above it, so the gamble is an informed one.
  const safeDmg = wrongAnswerDamage(q);
  const riskDmg = safeDmg * CONFIG.STAKE_RISKY_DAMAGE;
  const hearts = n => `${n} heart${n === 1 ? "" : "s"}`;
  el.innerHTML = `
    <div class="stake-title">How much are you putting on this one?</div>
    <div class="stake-opts">
      <button class="pixel-btn sg-safe" data-side="${prefix}">
        <b>SAFE</b>
        <span>Normal shards · costs <b>${hearts(safeDmg)}</b> if wrong</span>
      </button>
      <button class="pixel-btn danger sg-risky" data-side="${prefix}">
        <b>RISKY</b>
        <span>${blind
          ? `No options — say it out loud · <b>${CONFIG.STAKE_BLIND_SHARDS}× shards + a shield</b>`
          : `<b>${CONFIG.STAKE_RISKY_SHARDS}× shards</b>`
        } · costs <b>${hearts(riskDmg)}</b> if wrong</span>
      </button>
    </div>`;
}

// ---------------------------------------------------------------------------
// Floating combat text.
//
// What happened in a fight used to be narrated in a small line at the bottom
// left of the panel - the last place thirty children look. Numbers now rise
// off whoever it happened to: red for damage, green for healing, blue for a
// block. No ambiguity about who just got hurt.
// ---------------------------------------------------------------------------
function floatText(stageId, text, kind = "damage") {
  const stage = document.getElementById(stageId);
  if (!stage) return;
  const corridor = stage.parentElement;
  if (!corridor) return;
  const el = document.createElement("div");
  el.className = "float-text " + kind;
  el.textContent = text;
  // .combatant is positioned by its left edge and then shifted by a transform,
  // so offsetLeft already lands on the character's centre line.
  el.style.left = stage.offsetLeft + "px";
  el.style.top  = (stage.offsetTop + stage.offsetHeight * 0.22) + "px";
  // stagger simultaneous numbers so a flurry doesn't stack into one blob
  const live = corridor.querySelectorAll(".float-text").length;
  el.style.marginTop = (live % 3) * -26 + "px";
  corridor.appendChild(el);
  setTimeout(() => el.remove(), 1500);
}

// The monster's own states, mirrored from the hero's chips.
const FOE_CHIPS = {
  guarding: { label: "GUARDING", cls: "ward",   hint: "takes no damage" },
  enraged:  { label: "ENRAGED",  cls: "expose", hint: "attacks hit harder" },
  stunned:  { label: "STUNNED",  cls: "brace",  hint: "loses its next turn" },
  charging: { label: "CHARGING", cls: "expose", hint: "a big blow is coming" },
};

function renderFoeStatus(elId, m) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
  if (!m) return;
  const add = key => {
    const c = FOE_CHIPS[key];
    const d = document.createElement("div");
    d.className = "status-chip " + c.cls;
    d.innerHTML = `<b>${c.label}</b><span>${c.hint}</span>`;
    el.appendChild(d);
  };
  if (m.stunned)  add("stunned");
  if (m.guarding) add("guarding");
  if (m.charging) add("charging");
  if (m.enraged)  add("enraged");
}

// big centre-screen shout for streaks and enrage
function showStreakBanner(text) {
  let el = document.getElementById("streak-banner");
  if (!el) {
    el = document.createElement("div");
    el.id = "streak-banner";
    el.className = "streak-banner";
    document.getElementById("app").appendChild(el);
  }
  el.textContent = text;
  el.classList.remove("show");
  void el.offsetWidth;
  el.classList.add("show");
}

// hero-select tiles
function renderHeroSelect(chosenId) {
  const grid = document.getElementById("hero-grid");
  grid.innerHTML = "";
  HEROES.forEach(h => {
    const card = document.createElement("div");
    card.className = "hero-card" + (chosenId === h.id ? " chosen" : "");
    card.innerHTML = `
      <div class="hero-art"><img src="${h.sprite}" alt=""></div>
      <div class="h-name">${escapeHtml(h.name)}</div>
      <div class="h-tagline">${escapeHtml(h.tagline)}</div>
      <div class="h-perk">${escapeHtml(h.perk)}</div>`;
    const img = card.querySelector("img");
    img.addEventListener("load", () => {
      img.style.width = (img.naturalWidth * 2) + "px";
    });
    card.addEventListener("click", () => window.pickHero(h.id));
    grid.appendChild(card);
  });
}

// a second button on the current popup, for cancellable prompts
function addPopupCancel(label, onCancel) {
  const card = document.getElementById("popup-card");
  const existing = card.querySelector(".popup-cancel");
  if (existing) existing.remove();
  const btn = document.createElement("button");
  btn.className = "pixel-btn ghost popup-cancel";
  btn.textContent = label;
  btn.style.marginLeft = "10px";
  btn.addEventListener("click", () => {
    _popupCurrentOnClose = null;   // cancel the confirm action
    btn.remove();
    closePopup();
    if (onCancel) onCancel();
  });
  document.getElementById("popup-continue").after(btn);
}

// clear any stale cancel button whenever a popup opens
const _origDrain = drainPopups;
drainPopups = function () {
  const card = document.getElementById("popup-card");
  const stale = card && card.querySelector(".popup-cancel");
  if (stale) stale.remove();
  return _origDrain.apply(this, arguments);
};
