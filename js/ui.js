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
  rest: "Rest", treasure: "Treasure", safe: "Safe Path", shop: "Shop", boss: "BOSS",
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
    for (let i = 0; i < (run.shields || 0); i++) {
      const sp = document.createElement("span");
      sp.className = "shield-pip";
      heartsEl.appendChild(sp);
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
const SPRITE_SCALE = 3;      // the scale a classroom TV gets
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
  const usable = h * 0.94 - 110;                // info block + floor margin
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
function fixSpriteWidths() {
  _SCALED_IMGS.forEach(id => {
    const el = document.getElementById(id);
    if (el && el.naturalWidth) el.style.width = (el.naturalWidth * STAGE_SCALE) + "px";
  });
}
window.addEventListener("load", fixSpriteWidths);
_SCALED_IMGS.forEach(id => {
  document.addEventListener("DOMContentLoaded", () => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("load", () => {
      if (el.naturalWidth) el.style.width = (el.naturalWidth * STAGE_SCALE) + "px";
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

// Shields are shown in the HUD beside the hearts; this row is intentionally
// left empty so the same information isn't duplicated under the hero sprite.
function renderShieldRow(elId) {
  const el = document.getElementById(elId);
  if (el) el.innerHTML = "";
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
const SCENERY = {
  rest:     { src: "assets/scenery/bed.png",      cls: "" },
  safe:     { src: "assets/scenery/campfire.png", cls: "fire" },
  campfire: { src: "assets/scenery/campfire.png", cls: "fire" },
  treasure: { src: "assets/scenery/chest.png",    cls: "" },
  shop:     { src: "assets/scenery/stall.png",    cls: "" },
};

function showScenery(kind) {
  const el = document.getElementById("room-scenery");
  if (!el) return;
  const s = SCENERY[kind];
  if (!s) { clearScenery(); return; }
  updateStageScale("corridor");
  el.className = "room-scenery " + s.cls;
  el.setAttribute("src", s.src);
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

// the monster's telegraphed intent
function renderIntent(elId, m) {
  const el = document.getElementById(elId);
  if (!el) return;
  if (!m) { el.textContent = ""; el.className = "intent"; return; }
  el.textContent = intentLabel(m);
  el.className = "intent " + (INTENT_CLASS[m.intent && m.intent.kind] || "");
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
function addPopupCancel(label) {
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
