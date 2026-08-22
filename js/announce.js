// ---------------------------------------------------------------------------
// THE ARENA ANNOUNCER  (v5.6)
//
// What happens in a fight used to be narrated in a small line at the bottom
// left of the question panel. Stein reported it twice: unreadable from where he
// was sitting, and gone before he could work out what it said. In a classroom
// that line is projected onto a TV several metres from thirty children, and
// nobody is looking at the bottom-left corner of anything — they are looking at
// the monster.
//
// So the narration moves into the middle of the battlefield, at a size that
// reads from the back of the room, and it STAYS long enough to be read.
//
// Two design decisions worth recording:
//
//   1. It is a QUEUE, not a replacement. A single turn can produce four
//      messages in quick succession — "A clean hit! +4 shards", then "Bog Ogre
//      is enraged!", then "You are Chilled". The old line simply overwrote
//      itself, so the class saw the last one and never knew the other three
//      happened. Each message now waits its turn.
//
//   2. Nothing calls this directly. There are 46 places in main.js that write
//      to the feedback element, and any of them could be missed by hand — so a
//      MutationObserver watches those elements and mirrors every write here.
//      A new message added anywhere in the game is announced automatically.
// ---------------------------------------------------------------------------

const ANNOUNCER = (() => {
  // Stein's note was "it needs to stay on screen for longer - I can barely
  // read it in time". A short sentence read aloud takes about two seconds, and
  // a child reading it off a TV needs longer than that, so a lone message is
  // held for nearly three. When several stack up the dwell halves, otherwise
  // the banner would drift a full turn behind the fight it is describing.
  const MIN_DWELL   = 2800;   // how long one message is held, in ms
  const RUSH_DWELL  = 1400;   // ...shortened when messages are backing up
  const RUSH_AFTER  = 1;      // queue length at which we start rushing
  const MAX_QUEUE   = 5;      // beyond this, drop the OLDEST pending message

  let queue = [];
  let showing = false;
  let timer = null;
  let lastText = "";
  let lastAt = 0;

  function el(side) {
    return document.getElementById(side === "boss" ? "boss-announce" : "enc-announce");
  }

  function activeSide() {
    const boss = document.getElementById("screen-boss");
    return boss && boss.classList.contains("active") ? "boss" : "enc";
  }

  function step() {
    const side = activeSide();
    const node = el(side);
    if (!node) { showing = false; return; }

    if (!queue.length) {
      node.classList.remove("show");
      showing = false;
      return;
    }

    // If the class is falling behind the action, speed up rather than lag.
    const rushing = queue.length > RUSH_AFTER;
    const msg = queue.shift();

    node.className = "arena-announce " + (msg.tone || "") + " show";
    node.textContent = msg.text;

    clearTimeout(timer);
    timer = setTimeout(() => {
      node.classList.remove("show");
      // let the fade finish before the next line lands on top of it
      setTimeout(step, 180);
    }, rushing ? RUSH_DWELL : MIN_DWELL);
  }

  return {
    say(text, tone) {
      const t = (text || "").trim();
      if (!t) return;
      // The same line written twice in a row within a moment is a re-render,
      // not a new event.
      const now = Date.now();
      if (t === lastText && now - lastAt < 700) return;
      lastText = t; lastAt = now;

      queue.push({ text: t, tone: tone || "" });
      if (queue.length > MAX_QUEUE) queue.shift();
      if (!showing) { showing = true; step(); }
    },

    clear() {
      queue = [];
      clearTimeout(timer);
      showing = false;
      lastText = "";
      ["enc", "boss"].forEach(s => {
        const n = el(s);
        if (n) { n.classList.remove("show"); n.textContent = ""; }
      });
    },

    // How many messages are still waiting — used by the tests.
    pending() { return queue.length; },

    // Mirror every write to the old feedback line into the arena. Doing this
    // with an observer rather than by editing 46 call sites means a message
    // added later cannot be forgotten.
    attach() {
      ["enc-feedback", "boss-feedback"].forEach(id => {
        const src = document.getElementById(id);
        if (!src || src._announceHooked) return;
        src._announceHooked = true;
        const obs = new MutationObserver(() => {
          const txt = src.textContent;
          if (!txt || !txt.trim()) return;      // clears are not events
          const cls = src.className || "";
          const tone = cls.includes("good") ? "good"
                     : cls.includes("bad")  ? "bad" : "";
          ANNOUNCER.say(txt, tone);
        });
        obs.observe(src, { childList: true, characterData: true, subtree: true });
      });
    },
  };
})();

document.addEventListener("DOMContentLoaded", () => ANNOUNCER.attach());
