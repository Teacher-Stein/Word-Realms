// ---------------------------------------------------------------------------
// Procedural chiptune audio (Web Audio API). Every sound is synthesized at
// runtime - there are no audio files and nothing to license.
// ---------------------------------------------------------------------------
const SFX = (() => {
  let ctx = null;
  let enabled = true;
  let master = null;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1.0;
      master.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  // --- basic oscillator blip -------------------------------------------------
  function tone(freq, start, dur, type = "square", gain = 0.14, endFreq = null) {
    if (!enabled) return;
    const c = ac();
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    if (endFreq) osc.frequency.exponentialRampToValueAtTime(
      Math.max(20, endFreq), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0);
    osc.stop(t0 + dur + 0.03);
  }

  // --- filtered noise burst (impacts, wind, swipes) --------------------------
  function noise(start, dur, gain = 0.2, filterType = "bandpass",
                 f0 = 1200, f1 = null, q = 1) {
    if (!enabled) return;
    const c = ac();
    const t0 = c.currentTime + start;
    const len = Math.max(1, Math.floor(c.sampleRate * dur));
    const buf = c.createBuffer(1, len, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource();
    src.buffer = buf;
    const filt = c.createBiquadFilter();
    filt.type = filterType;
    filt.frequency.setValueAtTime(f0, t0);
    filt.Q.value = q;
    if (f1) filt.frequency.exponentialRampToValueAtTime(Math.max(40, f1), t0 + dur);
    const g = c.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(filt).connect(g).connect(master);
    src.start(t0);
    src.stop(t0 + dur + 0.02);
  }

  // Sub-bass thump: gives impacts real weight on TV speakers.
  function thump(start, dur, f0, f1, gain) {
    if (!enabled) return;
    const c = ac();
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(f0, t0);
    osc.frequency.exponentialRampToValueAtTime(Math.max(20, f1), t0 + dur);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(master);
    osc.start(t0); osc.stop(t0 + dur + 0.03);
  }

  return {
    setEnabled(v) { enabled = v; },
    isEnabled() { return enabled; },
    unlock() { ac(); },   // call from a click so browsers allow audio

    click()  { tone(520, 0, 0.05, "square", 0.14); },
    hover()  { tone(680, 0, 0.03, "square", 0.03); },

    // party steps forward to the next room
    move() {
      noise(0,    0.08, 0.20, "lowpass", 820, 280);
      noise(0.13, 0.08, 0.16, "lowpass", 720, 240);
      thump(0.0,  0.10, 90, 50, 0.16);
      thump(0.13, 0.10, 85, 46, 0.13);
    },
    doorOpen() {
      noise(0, 0.42, 0.22, "lowpass", 950, 180);
      tone(150, 0, 0.36, "sawtooth", 0.12, 85);
      thump(0.0, 0.4, 120, 40, 0.3);
    },

    correct() {
      tone(523, 0,    0.09, "square", 0.22);
      tone(659, 0.08, 0.09, "square", 0.22);
      tone(784, 0.16, 0.20, "square", 0.26);
      tone(1046,0.16, 0.20, "triangle", 0.12);
    },
    wrong() {
      tone(233, 0,    0.14, "sawtooth", 0.24, 175);
      tone(175, 0.10, 0.24, "sawtooth", 0.24, 115);
      thump(0.02, 0.22, 100, 45, 0.28);
    },

    // player lands a hit on a monster
    playerHit() {
      noise(0, 0.13, 0.42, "bandpass", 2800, 600, 0.9);
      tone(460, 0, 0.11, "square", 0.20, 170);
      thump(0.01, 0.20, 180, 70, 0.42);
    },
    // monster is defeated
    monsterDown() {
      tone(330, 0,    0.11, "square",   0.20, 220);
      tone(220, 0.10, 0.16, "square",   0.20, 130);
      noise(0.04, 0.38, 0.30, "lowpass", 1100, 140);
      thump(0.02, 0.34, 150, 45, 0.48);
    },

    // monster lunges at the party (wrong answer)
    monsterAttack() {
      noise(0, 0.17, 0.46, "bandpass", 480, 2600, 0.8);   // rising swipe
      tone(95, 0.11, 0.26, "sawtooth", 0.30, 50);         // impact
      noise(0.12, 0.22, 0.38, "lowpass", 1500, 180);
      thump(0.11, 0.40, 130, 38, 0.62);                   // body blow
    },
    heartLost() {
      tone(200, 0, 0.26, "triangle", 0.26, 110);
      tone(150, 0.06, 0.30, "triangle", 0.20, 80);
      thump(0.0, 0.28, 110, 40, 0.34);
    },

    heal() {
      tone(440, 0,    0.09, "sine", 0.22);
      tone(660, 0.08, 0.20, "sine", 0.26);
      tone(880, 0.16, 0.22, "triangle", 0.14);
    },
    treasure() {
      tone(660,  0,    0.08, "square", 0.22);
      tone(880,  0.07, 0.08, "square", 0.22);
      tone(1046, 0.14, 0.24, "square", 0.26);
      thump(0.0, 0.18, 200, 90, 0.24);
    },
    relic() {
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        tone(f, i * 0.07, 0.24, "triangle", 0.20));
      [523, 784, 1046].forEach((f, i) =>
        tone(f, i * 0.07, 0.28, "square", 0.09));
      thump(0.0, 0.3, 180, 70, 0.28);
    },
    teamup() {
      tone(392, 0,    0.10, "square", 0.22);
      tone(523, 0.09, 0.10, "square", 0.22);
      tone(659, 0.18, 0.20, "square", 0.20);
      thump(0.0, 0.2, 150, 70, 0.2);
    },

    bossHit() {
      noise(0, 0.16, 0.46, "bandpass", 2000, 380, 0.8);
      tone(130, 0, 0.24, "sawtooth", 0.30, 65);
      thump(0.01, 0.32, 160, 42, 0.58);
    },
    bossRoar() {
      tone(70,  0,    0.85, "sawtooth", 0.34, 42);
      tone(105, 0.05, 0.75, "square",   0.20, 58);
      noise(0,  0.85, 0.32, "lowpass", 700, 110);
      thump(0.0, 0.8, 90, 30, 0.7);
    },

    victory() {
      [523, 659, 784, 1046].forEach((f, i) =>
        tone(f, i * 0.13, 0.22, "square", 0.26));
      [261, 330, 392, 523].forEach((f, i) =>
        tone(f, i * 0.13, 0.26, "triangle", 0.16));
      tone(1318, 0.52, 0.55, "square", 0.28);
      thump(0.52, 0.6, 160, 60, 0.4);
    },
    defeat() {
      [392, 349, 294, 220].forEach((f, i) =>
        tone(f, i * 0.17, 0.28, "sawtooth", 0.24));
      noise(0.5, 0.7, 0.22, "lowpass", 520, 80);
      thump(0.5, 0.75, 90, 28, 0.5);
    },
    unlockChime() {
      tone(784, 0, 0.11, "square", 0.24);
      tone(1046, 0.10, 0.24, "square", 0.28);
      tone(1318, 0.20, 0.24, "triangle", 0.16);
    },
  };
})();
