// ---------------------------------------------------------------------------
// Procedural node-map generator (Slay-the-Spire-style branching path).
// Guarantees a connected path from start to boss; node types shuffle every
// run so there's no "perfect route" to memorize.
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

// weighted node type pool (boss/start excluded - handled separately)
const NODE_TYPE_WEIGHTS = [
  ["fight", 5], ["fight", 5], ["elite", 2], ["event", 3],
  ["rest", 2], ["treasure", 2], ["safe", 2],
];
function weightedNodeType() {
  const pool = [];
  NODE_TYPE_WEIGHTS.forEach(([t, w]) => { for (let i=0;i<w;i++) pool.push(t); });
  return pick(pool);
}

function generateMap(realm) {
  const layers = CONFIG.LAYERS_PER_REALM;
  const nodes = []; // {id, layer, lane, type, tag, connectsTo:[ids]}
  let idCounter = 0;

  // Layer 0: single start node
  nodes.push({ id: idCounter++, layer: 0, lane: 0, type: "start", connectsTo: [] });

  const layerNodeIds = [[0]];

  // Pool of question tags to sprinkle across fight/elite nodes without repeats
  // until exhausted (boss guarantees full coverage regardless).
  let tagPool = shuffle(realm.allTags || []);

  for (let L = 1; L <= layers; L++) {
    const count = CONFIG.NODES_PER_LAYER_MIN +
      rand(CONFIG.NODES_PER_LAYER_MAX - CONFIG.NODES_PER_LAYER_MIN + 1);
    const ids = [];
    for (let i = 0; i < count; i++) {
      const type = weightedNodeType();
      const node = { id: idCounter++, layer: L, lane: i, type, connectsTo: [] };
      if (type === "fight" || type === "elite") {
        if (tagPool.length === 0) tagPool = shuffle(realm.allTags || []);
        node.tag = tagPool.pop();
      }
      nodes.push(node);
      ids.push(node.id);
    }
    layerNodeIds.push(ids);
  }

  // Boss layer: single node
  const bossLayer = layers + 1;
  const bossId = idCounter++;
  nodes.push({ id: bossId, layer: bossLayer, lane: 0, type: "boss", connectsTo: [] });
  layerNodeIds.push([bossId]);

  // Connect each layer to the next: every node gets >=1 outgoing edge,
  // every node (except start) gets >=1 incoming edge.
  for (let L = 0; L < layerNodeIds.length - 1; L++) {
    const from = layerNodeIds[L];
    const to = layerNodeIds[L + 1];
    const incoming = new Set();

    from.forEach(fid => {
      const numLinks = to.length === 1 ? 1 : (1 + (Math.random() < 0.35 ? 1 : 0));
      const targets = shuffle(to).slice(0, Math.min(numLinks, to.length));
      targets.forEach(tid => {
        const node = nodes.find(n => n.id === fid);
        if (!node.connectsTo.includes(tid)) node.connectsTo.push(tid);
        incoming.add(tid);
      });
    });

    // Make sure every 'to' node has at least one incoming edge
    to.forEach(tid => {
      if (!incoming.has(tid)) {
        const giverId = pick(from); // pick ONCE - evaluating inside find()'s
                                     // predicate would re-roll per element
        const giver = nodes.find(n => n.id === giverId);
        if (!giver.connectsTo.includes(tid)) giver.connectsTo.push(tid);
        incoming.add(tid);
      }
    });
  }

  return { nodes, layerNodeIds, bossId };
}

function nodeById(map, id) {
  return map.nodes.find(n => n.id === id);
}
