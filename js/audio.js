// ---------------------------------------------------------------------------
// Tiny procedural chiptune audio engine (Web Audio API). No audio files —
// everything is synthesized at runtime, so there's nothing to license.
// ---------------------------------------------------------------------------
const SFX = (() => {
  let ctx = null;
  let enabled = true;

  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function tone(freq, start, dur, type="square", gain=0.15) {
    if (!enabled) return;
    const c = ensureCtx();
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime + start);
    g.gain.setValueAtTime(0, c.currentTime + start);
    g.gain.linearRampToValueAtTime(gain, c.currentTime + start + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + start + dur);
    osc.connect(g).connect(c.destination);
    osc.start(c.currentTime + start);
    osc.stop(c.currentTime + start + dur + 0.02);
  }

  return {
    setEnabled(v) { enabled = v; },
    isEnabled() { return enabled; },

    click() { tone(520, 0, 0.06, "square", 0.08); },
    move() { tone(340, 0, 0.08, "square", 0.07); tone(420, 0.05, 0.08, "square", 0.05); },
    correct() {
      tone(523, 0, 0.09, "square", 0.12);
      tone(659, 0.09, 0.09, "square", 0.12);
      tone(784, 0.18, 0.16, "square", 0.14);
    },
    wrong() {
      tone(220, 0, 0.14, "sawtooth", 0.12);
      tone(160, 0.1, 0.22, "sawtooth", 0.12);
    },
    heartLost() { tone(180, 0, 0.2, "triangle", 0.14); },
    heal() { tone(440, 0, 0.08, "sine", 0.1); tone(660, 0.08, 0.14, "sine", 0.12); },
    treasure() {
      tone(660, 0, 0.08, "square", 0.1);
      tone(880, 0.08, 0.08, "square", 0.1);
      tone(1046, 0.16, 0.2, "square", 0.12);
    },
    bossHit() { tone(140, 0, 0.12, "sawtooth", 0.16); tone(90, 0.1, 0.18, "sawtooth", 0.14); },
    victory() {
      [523,659,784,1046].forEach((f,i)=>tone(f, i*0.13, 0.18, "square", 0.13));
    },
    defeat() {
      [392,349,294,220].forEach((f,i)=>tone(f, i*0.16, 0.2, "sawtooth", 0.12));
    },
    unlock() { tone(784, 0, 0.1, "square", 0.12); tone(1046, 0.1, 0.18, "square", 0.14); },
  };
})();
