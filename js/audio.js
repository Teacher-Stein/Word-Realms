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
      master.gain.value = 0.9;
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

  return {
    setEnabled(v) { enabled = v; },
    isEnabled() { return enabled; },
    unlock() { ac(); },   // call from a click so browsers allow audio

    click()  { tone(520, 0, 0.05, "square", 0.07); },
    hover()  { tone(680, 0, 0.03, "square", 0.03); },

    // party steps forward to the next room
    move() {
      noise(0,    0.07, 0.10, "lowpass", 800, 300);
      noise(0.13, 0.07, 0.08, "lowpass", 700, 260);
    },
    doorOpen() {
      noise(0, 0.35, 0.10, "lowpass", 900, 200);
      tone(150, 0, 0.3, "sawtooth", 0.05, 90);
    },

    correct() {
      tone(523, 0,    0.08, "square", 0.11);
      tone(659, 0.08, 0.08, "square", 0.11);
      tone(784, 0.16, 0.16, "square", 0.13);
    },
    wrong() {
      tone(233, 0,    0.12, "sawtooth", 0.11, 180);
      tone(175, 0.10, 0.20, "sawtooth", 0.11, 120);
    },

    // player lands a hit on a monster
    playerHit() {
      noise(0, 0.10, 0.22, "bandpass", 2600, 700, 0.8);
      tone(420, 0, 0.09, "square", 0.10, 180);
    },
    // monster is defeated
    monsterDown() {
      tone(330, 0,    0.10, "square",   0.10, 220);
      tone(220, 0.10, 0.14, "square",   0.10, 130);
      noise(0.05, 0.30, 0.14, "lowpass", 900, 160);
    },

    // monster lunges at the party (wrong answer)
    monsterAttack() {
      noise(0, 0.16, 0.26, "bandpass", 500, 2200, 0.7);  // swipe rising
      tone(90, 0.10, 0.22, "sawtooth", 0.16, 55);        // impact thud
      noise(0.12, 0.16, 0.20, "lowpass", 1400, 200);
    },
    heartLost() {
      tone(200, 0, 0.22, "triangle", 0.13, 120);
    },

    heal() {
      tone(440, 0,    0.08, "sine", 0.10);
      tone(660, 0.08, 0.16, "sine", 0.12);
    },
    treasure() {
      tone(660,  0,    0.07, "square", 0.10);
      tone(880,  0.07, 0.07, "square", 0.10);
      tone(1046, 0.14, 0.20, "square", 0.12);
    },
    relic() {
      [523, 659, 784, 1046, 1318].forEach((f, i) =>
        tone(f, i * 0.07, 0.20, "triangle", 0.10));
    },
    teamup() {
      tone(392, 0,    0.09, "square", 0.10);
      tone(523, 0.09, 0.09, "square", 0.10);
      tone(392, 0.18, 0.14, "square", 0.08);
    },

    bossHit() {
      noise(0, 0.14, 0.26, "bandpass", 1800, 400, 0.7);
      tone(120, 0, 0.20, "sawtooth", 0.16, 70);
    },
    bossRoar() {
      tone(70,  0,    0.7, "sawtooth", 0.18, 45);
      tone(105, 0.05, 0.6, "square",   0.10, 60);
      noise(0,  0.7,  0.16, "lowpass", 600, 120);
    },

    victory() {
      [523, 659, 784, 1046].forEach((f, i) =>
        tone(f, i * 0.13, 0.20, "square", 0.13));
      tone(1318, 0.52, 0.45, "square", 0.14);
    },
    defeat() {
      [392, 349, 294, 220].forEach((f, i) =>
        tone(f, i * 0.17, 0.24, "sawtooth", 0.12));
      noise(0.5, 0.6, 0.10, "lowpass", 500, 90);
    },
    unlockChime() {
      tone(784, 0, 0.10, "square", 0.12);
      tone(1046, 0.10, 0.20, "square", 0.14);
    },
  };
})();
