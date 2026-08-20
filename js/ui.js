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
  boss:     "assets/nodes/node_boss.png",
};
const NODE_LABEL = {
  start: "Entrance", fight: "Fight", elite: "Elite", event: "Event",
  rest: "Rest", treasure: "Treasure", safe: "Safe Path", boss: "BOSS",
};

// map layout constants
const LAYER_GAP = 210;   // horizontal px between layers
const LANE_GAP  = 150;   // vertical px between lanes
const MAP_PAD_X = 140;
const MAP_PAD_Y = 110;

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

// ------------------------------- hearts ------------------------------------
function renderHearts(elId, hearts, maxHearts, losingIndex = -1) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
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
        : inProgress ? "Resume →" : "Enter →"}</div>`;
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
  renderHearts(`${prefix}-hearts`, run.hearts, run.maxHearts);
  const nameEl = document.getElementById(`${prefix}-realm-name`);
  if (nameEl) nameEl.textContent = `Realm ${realm.id} · ${realm.name}`;
  const sh = document.getElementById(`${prefix}-shards`);
  if (sh) sh.textContent = run.shards;
  const em = document.getElementById(`${prefix}-ember`);
  if (em) em.textContent = STATE.ember;
  const rl = document.getElementById(`${prefix}-relics`);
  if (rl) rl.textContent = run.relics.length
    ? run.relics.map(r => r.name).join(" · ") : "No relics yet";
}

function renderStudentChips() {
  const name = STATE.run && STATE.run.currentStudent ? STATE.run.currentStudent : "—";
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
function playSlash(fxId) {
  const el = document.getElementById(fxId);
  if (!el) return;
  el.classList.remove("go");
  void el.offsetWidth;      // restart the animation
  el.classList.add("go");
}
function playHitFlash(flashId, corridorId) {
  const f = document.getElementById(flashId);
  const c = document.getElementById(corridorId);
  if (f) { f.classList.remove("go"); void f.offsetWidth; f.classList.add("go"); }
  if (c) { c.classList.remove("shake"); void c.offsetWidth; c.classList.add("shake"); }
}
function animateSprite(spriteId, cls, ms = 600) {
  const s = document.getElementById(spriteId);
  if (!s) return;
  s.classList.remove("hurt", "attack", "dying", "arriving");
  void s.offsetWidth;
  s.classList.add(cls);
  setTimeout(() => s.classList.remove(cls), ms);
}

function applySky(skyElId, skyName) {
  const el = document.getElementById(skyElId);
  if (!el) return;
  // tint the whole corridor with the realm's gradient
  const corridor = el.parentElement;
  if (corridor) corridor.dataset.realmsky = skyName;
  if (el.childElementCount) return;
  if (skyName === "storm") {
    // two full-scene lightning washes, offset so flashes feel irregular
    ["", "f2"].forEach(cls => {
      const f = document.createElement("div");
      f.className = "sky-flash " + cls;
      el.appendChild(f);
    });
    // a few bolt streaks high in the scene
    [["17%", "1%", "26%", ""], ["57%", "0%", "20%", "b2"], ["81%", "3%", "16%", "b3"]]
      .forEach(([left, top, h, cls]) => {
        const b = document.createElement("div");
        b.className = "sky-bolt " + cls;
        b.style.left = left; b.style.top = top; b.style.height = h;
        el.appendChild(b);
      });
  }
}
