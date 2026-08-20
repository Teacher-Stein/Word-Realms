// ---------------------------------------------------------------------------
// Pure(ish) rendering helpers. Game flow/event wiring lives in main.js.
// ---------------------------------------------------------------------------

const NODE_ICON = {
  start: "▶", fight: "⚔", elite: "☠", event: "?",
  rest: "❤", treasure: "♦", safe: "↪", boss: "☠️",
};
const NODE_LABEL = {
  start: "Start", fight: "Fight", elite: "Elite", event: "Event",
  rest: "Rest", treasure: "Treasure", safe: "Safe Path", boss: "BOSS",
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  document.getElementById(id).classList.add("active");
}

function renderHeartsInto(elId, hearts, maxHearts) {
  const el = document.getElementById(elId);
  if (!el) return;
  el.innerHTML = "";
  for (let i = 0; i < maxHearts; i++) {
    const h = document.createElement("span");
    h.className = "heart-icon" + (i < hearts ? "" : " empty");
    el.appendChild(h);
  }
}

function renderMenu() {
  const grid = document.getElementById("realm-select");
  grid.innerHTML = "";
  Object.values(REALMS).forEach(realm => {
    const unlocked = STATE.unlockedRealms.includes(realm.id);
    const card = document.createElement("div");
    card.className = "realm-card" + (unlocked ? "" : " locked") + (!realm.ready ? " notready" : "");
    card.innerHTML = `
      <div class="realm-card-num">${realm.id}</div>
      <div class="realm-card-name">${realm.name}</div>
      <div class="realm-card-theme">${realm.theme}</div>
      <div class="realm-card-status">${unlocked ? (realm.ready ? "Enter →" : "Coming soon") : "🔒 Locked"}</div>
    `;
    if (unlocked && realm.ready) {
      card.addEventListener("click", () => window.enterRealm(realm.id));
    }
    grid.appendChild(card);
  });
}

function renderTeacherRealmList() {
  const wrap = document.getElementById("teacher-realm-list");
  wrap.innerHTML = "";
  Object.values(REALMS).forEach(realm => {
    const row = document.createElement("label");
    row.className = "teacher-row";
    const checked = STATE.unlockedRealms.includes(realm.id) ? "checked" : "";
    const disabled = realm.id === 1 ? "disabled" : "";
    row.innerHTML = `<input type="checkbox" data-realm="${realm.id}" ${checked} ${disabled}>
      Realm ${realm.id} — ${realm.name} ${realm.id===1 ? "(always open)" : ""}`;
    wrap.appendChild(row);
  });
  wrap.querySelectorAll("input[type=checkbox]").forEach(cb => {
    cb.addEventListener("change", (e) => {
      teacherUnlock(parseInt(e.target.dataset.realm, 10), e.target.checked);
      renderMenu();
    });
  });
  document.getElementById("auto-unlock-toggle").checked = STATE.teacherAutoUnlock;
}

// -------------------- MAP RENDERING --------------------
function layoutMap(map, containerW, containerH) {
  const layers = map.layerNodeIds.length;
  const marginX = 70, marginY = 60;
  const usableW = containerW - marginX * 2;
  const usableH = containerH - marginY * 2;
  const positions = {};
  map.layerNodeIds.forEach((ids, L) => {
    const x = marginX + (layers === 1 ? 0 : (usableW * L) / (layers - 1));
    const n = ids.length;
    ids.forEach((id, i) => {
      const y = n === 1 ? containerH / 2 :
        marginY + (usableH * i) / (n - 1);
      positions[id] = { x, y };
    });
  });
  return positions;
}

function reachableFromCurrent(map, currentId) {
  const node = nodeById(map, currentId);
  return node ? node.connectsTo : [];
}

function renderMap() {
  const run = STATE.run;
  const realm = currentRealm();
  const container = document.getElementById("map-canvas");
  container.innerHTML = "";
  const rect = container.getBoundingClientRect();
  const W = Math.max(rect.width, 900);
  const H = Math.max(rect.height, 420);

  const positions = layoutMap(run.map, W, H);
  const svgNS = "http://www.w3.org/2000/svg";
  const svg = document.createElementNS(svgNS, "svg");
  svg.setAttribute("width", W);
  svg.setAttribute("height", H);
  svg.classList.add("map-svg");

  run.map.nodes.forEach(node => {
    node.connectsTo.forEach(toId => {
      const a = positions[node.id], b = positions[toId];
      const line = document.createElementNS(svgNS, "line");
      line.setAttribute("x1", a.x); line.setAttribute("y1", a.y);
      line.setAttribute("x2", b.x); line.setAttribute("y2", b.y);
      const traveled = run.visitedNodeIds.includes(node.id) && run.visitedNodeIds.includes(toId);
      line.setAttribute("class", traveled ? "edge traveled" : "edge");
      svg.appendChild(line);
    });
  });
  container.appendChild(svg);

  const reachable = reachableFromCurrent(run.map, run.currentNodeId);

  run.map.nodes.forEach(node => {
    const pos = positions[node.id];
    const div = document.createElement("div");
    const isCurrent = node.id === run.currentNodeId;
    const isVisited = run.visitedNodeIds.includes(node.id);
    const isReachable = reachable.includes(node.id);
    div.className = "map-node type-" + node.type +
      (isCurrent ? " current" : "") +
      (isVisited ? " visited" : "") +
      (isReachable ? " reachable" : " unreachable");
    div.style.left = pos.x + "px";
    div.style.top = pos.y + "px";
    div.innerHTML = `<span class="node-icon">${NODE_ICON[node.type]}</span>`;
    div.title = NODE_LABEL[node.type];

    const label = document.createElement("div");
    label.className = "node-label";
    label.textContent = NODE_LABEL[node.type];
    div.appendChild(label);

    if (isReachable) {
      div.addEventListener("click", () => window.travelToNode(node.id));
    }
    container.appendChild(div);
  });
}

function renderTopHud(prefix) {
  const run = STATE.run;
  const realm = currentRealm();
  renderHeartsInto(`${prefix}-hearts`, run.hearts, run.maxHearts);
  const nameEl = document.getElementById(`${prefix}-realm-name`);
  if (nameEl) nameEl.textContent = `Realm ${realm.id} · ${realm.name}`;
  const shardEl = document.getElementById(`${prefix}-shards`);
  if (shardEl) shardEl.textContent = run.shards;
  const emberEl = document.getElementById(`${prefix}-ember`);
  if (emberEl) emberEl.textContent = STATE.ember;
}

function setMonsterSprite(imgId, src) {
  const img = document.getElementById(imgId);
  img.src = src;
}

function applyPalette(corridorId, palette) {
  const el = document.getElementById(corridorId);
  el.dataset.palette = palette;
}
