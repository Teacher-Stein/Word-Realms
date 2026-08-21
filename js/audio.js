// ---------------------------------------------------------------------------
// Procedural chiptune audio (Web Audio API). Every sound is synthesized at
// runtime - there are no audio files and nothing to license.
// ---------------------------------------------------------------------------
const SFX = (() => {
  let ctx = null;
  let enabled = true;
  let master = null;
  let masterVol = 0.8;

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      master = ctx.createGain();
      master.gain.value = 1.15 * masterVol;
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
    setVolume(v) { masterVol = v; if (master) master.gain.value = 1.15 * v; },
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

    // Rolling thunder, fired with the big lightning strike. The crack comes
    // first and the rumble runs on underneath it for the best part of a second.
    thunder() {
      noise(0,    0.09, 0.34, "highpass", 2600, 1400, 0.7);  // the crack
      noise(0.03, 0.95, 0.42, "lowpass",  520,  70,  0.4);   // the roll
      noise(0.30, 0.80, 0.24, "lowpass",  300,  55,  0.4);
      thump(0.02, 0.85, 74, 26, 0.55);
      thump(0.34, 0.70, 58, 22, 0.32);
    },

    // ----------------------------------------------------------------------
    // MONSTER CRIES
    //
    // Every monster announces itself, the way they do in Pokémon. Rather than
    // 17 hand-written sounds, each monster names a VOICE and a PITCH: the
    // voice decides the character, the pitch makes it that particular
    // creature. Dying replays the same cry lower and slower.
    // ----------------------------------------------------------------------
    monsterCry(base, dying = false) {
      if (!enabled || !base) return;
      const voice = base.voice || "growl";
      const p = (base.pitch || 220) * (dying ? 0.62 : 1);
      const size = base.size == null ? 0.5 : base.size;   // 0 small, 1 huge
      const len = (dying ? 1.35 : 1) * (0.72 + size * 0.55);
      const g = 0.20 + size * 0.16;

      switch (voice) {
        case "growl":                                    // wyrms, brutes
          tone(p,        0,     0.30 * len, "sawtooth", g,        p * 0.55);
          tone(p * 0.72, 0.13,  0.36 * len, "square",   g * 0.7,  p * 0.42);
          noise(0, 0.34 * len, 0.20, "lowpass", 700, 130);
          thump(0.01, 0.34 * len, p * 0.7, p * 0.32, 0.42 + size * 0.3);
          break;

        case "shriek":                                   // crows, sirens
          tone(p * 1.5,  0,     0.11 * len, "square",   g * 0.9,  p * 2.2);
          tone(p * 2.2,  0.09,  0.20 * len, "sawtooth", g * 0.75, p * 1.1);
          noise(0.02, 0.16 * len, 0.16, "bandpass", p * 3, p * 1.4, 4);
          break;

        case "glass":                                    // wisps, frost
          tone(p * 2,    0,     0.16 * len, "sine",     g * 0.8);
          tone(p * 3,    0.07,  0.22 * len, "sine",     g * 0.5);
          tone(p * 4.5,  0.14,  0.26 * len, "triangle", g * 0.28);
          noise(0.03, 0.22 * len, 0.10, "highpass", 4200, 2600, 2);
          break;

        case "whoosh":                                   // djinn, gales
          noise(0,    0.30 * len, 0.34, "bandpass", 420, 2400, 0.9);
          noise(0.14, 0.28 * len, 0.24, "bandpass", 1900, 500, 1.2);
          tone(p * 0.8, 0.05, 0.24 * len, "sawtooth", g * 0.45, p * 1.3);
          break;

        case "crunch":                                   // hailstone, titans
          noise(0,    0.13 * len, 0.40, "lowpass", 1500, 260, 0.8);
          noise(0.10, 0.20 * len, 0.28, "lowpass", 900, 150);
          tone(p * 0.6, 0.02, 0.26 * len, "square", g * 0.8, p * 0.3);
          thump(0.0, 0.34 * len, p * 0.55, p * 0.22, 0.5 + size * 0.3);
          break;

        case "gurgle":                                   // flood serpent
          tone(p,       0,     0.20 * len, "sine",     g * 0.7,  p * 1.6);
          tone(p * 1.4, 0.11,  0.20 * len, "sine",     g * 0.6,  p * 0.7);
          noise(0.02, 0.28 * len, 0.18, "lowpass", 900, 300, 3);
          break;

        case "rasp":                                     // drought husk
          noise(0,    0.24 * len, 0.30, "bandpass", 1500, 700, 1.6);
          tone(p * 0.9, 0.04, 0.24 * len, "sawtooth", g * 0.5, p * 0.6);
          noise(0.18, 0.20 * len, 0.18, "bandpass", 900, 420, 2);
          break;

        case "bell":                                     // ice storm herald
          tone(p * 2,   0,     0.42 * len, "sine",     g * 0.7);
          tone(p * 3,   0.01,  0.34 * len, "sine",     g * 0.34);
          tone(p * 0.5, 0.05,  0.44 * len, "triangle", g * 0.5);
          break;

        case "wail":                                     // siren of the gale
          tone(p,       0,     0.40 * len, "sawtooth", g * 0.7, p * 1.9);
          tone(p * 1.5, 0.16,  0.40 * len, "sawtooth", g * 0.5, p * 0.8);
          noise(0.05, 0.34 * len, 0.12, "bandpass", p * 4, p * 2, 3);
          break;

        case "roar":                                     // bosses
        default:
          tone(p * 0.55, 0,    0.90 * len, "sawtooth", g + 0.1, p * 0.3);
          tone(p * 0.85, 0.06, 0.80 * len, "square",   g * 0.6, p * 0.42);
          noise(0, 0.95 * len, 0.30, "lowpass", 720, 110);
          thump(0.0, 0.9 * len, p * 0.5, p * 0.2, 0.75);
      }
    },
  };
})();

// ---------------------------------------------------------------------------
// MUSIC + AMBIENCE
// Procedural, looping, and entirely synthesized - a low drone bed with wind,
// plus a simple bass/arpeggio pattern that changes intensity by context.
// Nothing here is a recording, so there is nothing to license.
// ---------------------------------------------------------------------------
const MUSIC = (() => {
  let ctx = null, bus = null, windGain = null, windSrc = null;
  let enabled = true, volume = 0.8, current = null, timer = null, step = 0;

  const TRACKS = {
    explore: { bpm: 84,  root: 110.00, scale: [0, 3, 5, 7, 10], drone: true,  lead: 0.05 },
    fight:   { bpm: 104, root: 110.00, scale: [0, 2, 3, 7, 8],  drone: true,  lead: 0.09 },
    elite:   { bpm: 118, root: 98.00,  scale: [0, 1, 5, 7, 8],  drone: true,  lead: 0.11 },
    boss:    { bpm: 132, root: 87.31,  scale: [0, 1, 3, 6, 7],  drone: true,  lead: 0.13 },
  };

  function ac() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = new AC();
      bus = ctx.createGain();
      bus.gain.value = 0;
      bus.connect(ctx.destination);
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function targetGain() { return enabled ? 0.16 * volume : 0; }

  function rampBus(to, secs = 1.2) {
    if (!bus) return;
    const c = ac();
    bus.gain.cancelScheduledValues(c.currentTime);
    bus.gain.setValueAtTime(bus.gain.value, c.currentTime);
    bus.gain.linearRampToValueAtTime(to, c.currentTime + secs);
  }

  // continuous filtered-noise wind bed
  function startWind() {
    if (windSrc) return;
    const c = ac();
    const len = c.sampleRate * 4;
    const buf = c.createBuffer(1, len, c.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < len; i++) {          // brown-ish noise = wind, not hiss
      last = (last + Math.random() * 2 - 1) * 0.5;
      d[i] = last;
    }
    windSrc = c.createBufferSource();
    windSrc.buffer = buf;
    windSrc.loop = true;
    const filt = c.createBiquadFilter();
    filt.type = "lowpass";
    filt.frequency.value = 420;
    windGain = c.createGain();
    windGain.gain.value = 0.5;

    // slow gusting
    const lfo = c.createOscillator();
    const lfoGain = c.createGain();
    lfo.frequency.value = 0.06;
    lfoGain.gain.value = 0.28;
    lfo.connect(lfoGain).connect(windGain.gain);
    lfo.start();

    windSrc.connect(filt).connect(windGain).connect(bus);
    windSrc.start();
  }

  function note(freq, start, dur, type, gain) {
    const c = ac();
    const t0 = c.currentTime + start;
    const osc = c.createOscillator();
    const g = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    osc.connect(g).connect(bus);
    osc.start(t0);
    osc.stop(t0 + dur + 0.05);
  }

  function tick() {
    const t = TRACKS[current];
    if (!t || !enabled) return;
    const beat = 60 / t.bpm;

    // bass pulse on every other step
    if (step % 2 === 0) {
      note(t.root / 2, 0, beat * 0.9, "triangle", 0.30);
    }
    // sparse arpeggio drawn from the scale
    if (step % 4 === 1 || step % 8 === 6) {
      const deg = t.scale[Math.floor(Math.random() * t.scale.length)];
      const oct = Math.random() < 0.4 ? 4 : 2;
      note(t.root * Math.pow(2, deg / 12) * oct, 0, beat * 1.4, "square", t.lead);
    }
    // occasional high shimmer
    if (step % 16 === 12) {
      const deg = t.scale[Math.floor(Math.random() * t.scale.length)];
      note(t.root * Math.pow(2, deg / 12) * 8, 0, beat * 2.2, "sine", 0.05);
    }
    step++;
    timer = setTimeout(tick, beat * 1000);
  }

  return {
    setEnabled(v) {
      enabled = v;
      if (!v) { rampBus(0, 0.6); }
      else if (current) { ac(); startWind(); rampBus(targetGain()); if (!timer) tick(); }
    },
    setVolume(v) { volume = v; if (current && enabled) rampBus(targetGain(), 0.3); },
    isEnabled() { return enabled; },

    play(track) {
      if (!TRACKS[track]) return;
      if (current === track) return;
      current = track;
      step = 0;
      if (!enabled) return;
      ac();
      startWind();
      if (timer) { clearTimeout(timer); timer = null; }
      rampBus(targetGain());
      tick();
    },
    stop() {
      current = null;
      if (timer) { clearTimeout(timer); timer = null; }
      rampBus(0, 0.8);
    },
  };
})();
