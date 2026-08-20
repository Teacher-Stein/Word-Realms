// ---------------------------------------------------------------------------
// Procedural branching node-map. Wider, denser and more tangled than v1:
// every node gets 1-3 forward links, so the class faces real route choices
// rather than a mostly-linear corridor. Layout reshuffles every run.
// ---------------------------------------------------------------------------

function rand(n) { return Math.floor(Math.random() * n); }
function pick(arr) { return arr[rand(arr.length)]; }
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = rand(i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// Weighted pool for ordinary layers. Elites are handled separately so a map
// can never fill up with 5-hit fights.
const NODE_WEIGHTS = [
  ["fight", 12], ["event", 4], ["rest", 3], ["treasure", 3], ["safe", 3],
];

function weightedNodeType() {
  const pool = [];
  NODE_WEIGHTS.forEach(([t, w]) => { for (let i = 0; i < w; i++) pool.push(t); });
  return pick(pool);
}

function generateMap(realm) {
  const layers = CONFIG.LAYERS_PER_REALM;
  const nodes = [];
  const layerNodeIds = [];
  let id = 0;

  // ---- Start ----
  nodes.push({ id: id++, layer: 0, lane: 0, type: "start", connectsTo: [] });
  layerNodeIds.push([0]);

  // ---- Body layers ----
  for (let L = 1; L <= layers; L++) {
    const count = CONFIG.NODES_PER_LAYER_MIN +
      rand(CONFIG.NODES_PER_LAYER_MAX - CONFIG.NODES_PER_LAYER_MIN + 1);
    const ids = [];
    for (let i = 0; i < count; i++) {
      const node = { id: id++, layer: L, lane: i, type: weightedNodeType(),
                     connectsTo: [] };
      nodes.push(node);
      ids.push(node.id);
    }
    layerNodeIds.push(ids);
  }

  // ---- Boss ----
  const bossId = id++;
  nodes.push({ id: bossId, layer: layers + 1, lane: 0, type: "boss",
               connectsTo: [] });
  layerNodeIds.push([bossId]);

  // ---- Promote a few mid-map nodes to Elite ----
  // Never in the first two layers (party has no relics yet) and never in the
  // layer right before the boss (back-to-back long fights feel punishing).
  const eliteCandidates = shuffle(
    nodes.filter(n => n.type === "fight" &&
                      n.layer >= 3 && n.layer <= layers - 1)
  );
  const eliteCount = Math.min(CONFIG.MAX_ELITES_PER_MAP, eliteCandidates.length);
  const usedEliteLayers = new Set();
  let promoted = 0;
  for (const cand of eliteCandidates) {
    if (promoted >= eliteCount) break;
    if (usedEliteLayers.has(cand.layer)) continue; // spread them out
    cand.type = "elite";
    usedEliteLayers.add(cand.layer);
    promoted++;
  }

  // ---- Connect layers ----
  for (let L = 0; L < layerNodeIds.length - 1; L++) {
    const from = layerNodeIds[L];
    const to = layerNodeIds[L + 1];
    const hasIncoming = new Set();

    from.forEach(fid => {
      const node = nodes.find(n => n.id === fid);
      let links = 1;
      if (Math.random() < CONFIG.EXTRA_LINK_CHANCE) links++;
      if (Math.random() < CONFIG.THIRD_LINK_CHANCE) links++;
      links = Math.min(links, to.length);

      // Prefer nearby lanes so edges cross less and the map stays readable,
      // but still allow the occasional long diagonal.
      const fromNode = nodes.find(n => n.id === fid);
      const sorted = to.slice().sort((a, b) => {
        const na = nodes.find(n => n.id === a);
        const nb = nodes.find(n => n.id === b);
        const da = Math.abs(laneRatio(na, to.length) - laneRatio(fromNode, from.length));
        const db = Math.abs(laneRatio(nb, to.length) - laneRatio(fromNode, from.length));
        return da - db;
      });
      const nearPool = sorted.slice(0, Math.max(links, Math.min(3, sorted.length)));
      const targets = shuffle(nearPool).slice(0, links);

      targets.forEach(tid => {
        if (!node.connectsTo.includes(tid)) node.connectsTo.push(tid);
        hasIncoming.add(tid);
      });
    });

    // guarantee no orphan nodes in the next layer
    to.forEach(tid => {
      if (!hasIncoming.has(tid)) {
        const giverId = pick(from);   // pick ONCE - calling pick() inside a
                                      // find() predicate re-rolls per element
        const giver = nodes.find(n => n.id === giverId);
        if (!giver.connectsTo.includes(tid)) giver.connectsTo.push(tid);
        hasIncoming.add(tid);
      }
    });
  }

  return { nodes, layerNodeIds, bossId };
}

function laneRatio(node, laneCount) {
  return laneCount <= 1 ? 0.5 : node.lane / (laneCount - 1);
}

function nodeById(map, id) {
  return map.nodes.find(n => n.id === id);
}
