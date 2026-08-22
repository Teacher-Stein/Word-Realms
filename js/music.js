// ---------------------------------------------------------------------------
// THE SCORE  (v5.4)
//
// Everything here is synthesized in the browser at runtime. There are no audio
// files, nothing is sampled, and nothing is borrowed from any other game — the
// whole soundtrack is arithmetic, which is the only way it can ship in a
// classroom without a licence.
//
// What this replaces: the old MUSIC object picked random notes out of a scale
// on a setTimeout. Random notes are not a melody, and the result was wallpaper
// — which is exactly why it lacked oomph. This is a real sequencer with written
// note data: chord progressions, bass lines, drum patterns and song sections
// that repeat, so the ear can learn them.
//
// Three things drove every decision:
//
//   1. It plays through a TV speaker in a room with twenty-five children. That
//      hardware cannot reproduce anything below about 90Hz — sub-bass just eats
//      headroom and makes the cabinet buzz. The master chain therefore
//      high-passes hard, pushes the mids where small speakers are actually
//      efficient, and compresses so the level stays steady over classroom
//      noise. This is mixed for the room it will be heard in, not for
//      headphones.
//
//   2. The teacher talks over it. Music ducks to 30% the moment a question is
//      on screen and comes back up between them, so it breathes with the
//      lesson instead of fighting it.
//
//   3. Nine realms are coming. There is ONE core score, and each realm shifts
//      its root, its mode and its instrument balance. Realm 5 will feel unlike
//      the Stormlands without being nine separate soundtracks to maintain.
// ---------------------------------------------------------------------------

const MUSIC = (() => {
  let ctx = null;
  let bus = null;          // everything the score plays goes through here
  let duckGain = null;     // ducking rides on top of the bus
  let master = null;       // shared output after the TV voicing chain
  let enabled = true;
  let volume = 0.8;

  let current = null;      // context name currently playing
  let realmTone = null;    // the active realm's tint
  let lookahead = null;    // scheduler interval
  let nextNoteTime = 0;    // absolute AudioContext time of the next 16th
  let stepIndex = 0;       // 16th-note counter since the piece started
  let ducked = false;

  const SCHED_MS = 25;     // how often the scheduler wakes
  const HORIZON = 0.18;    // how far ahead it writes notes, in seconds

  // -------------------------------------------------------------------------
  // Modes. A mode is just which notes are allowed, and it does more for the
  // character of a realm than any amount of instrument choice: Aeolian is
  // wistful, Dorian is hopeful-but-cold, Phrygian is menacing because of that
  // flattened second.
  // -------------------------------------------------------------------------
  const MODES = {
    aeolian:  [0, 2, 3, 5, 7, 8, 10],
    dorian:   [0, 2, 3, 5, 7, 9, 10],
    phrygian: [0, 1, 3, 5, 7, 8, 10],
    lydian:   [0, 2, 4, 6, 7, 9, 11],
    minorPent: [0, 3, 5, 7, 10],
  };

  // Per-realm tinting off one shared core. Only Realm 1 is in play; the rest
  // are declared now so adding a realm is a data edit, not a composition job.
  const REALM_TONE = {
    1: { name: "Stormlands", root: 146.83, mode: "aeolian",  // D3
         bell: 1.15, pluck: 1.0, pad: 1.0, drum: 1.0, air: 1.2 },
    2: { root: 130.81, mode: "dorian",   bell: 0.8, pluck: 1.15, pad: 0.9, drum: 1.1, air: 0.7 },
    3: { root: 155.56, mode: "aeolian",  bell: 1.0, pluck: 0.9, pad: 1.2, drum: 0.9, air: 1.0 },
    4: { root: 123.47, mode: "phrygian", bell: 0.7, pluck: 1.0, pad: 1.1, drum: 1.2, air: 0.8 },
    5: { root: 164.81, mode: "lydian",   bell: 1.3, pluck: 0.95, pad: 1.0, drum: 0.8, air: 1.1 },
    6: { root: 138.59, mode: "dorian",   bell: 0.9, pluck: 1.1, pad: 1.0, drum: 1.1, air: 0.9 },
    7: { root: 116.54, mode: "phrygian", bell: 0.8, pluck: 1.0, pad: 1.2, drum: 1.25, air: 0.8 },
    8: { root: 174.61, mode: "aeolian",  bell: 1.2, pluck: 1.0, pad: 1.0, drum: 1.0, air: 1.15 },
    9: { root: 110.00, mode: "phrygian", bell: 1.0, pluck: 1.05, pad: 1.3, drum: 1.3, air: 0.9 },
  };
  const DEFAULT_TONE = REALM_TONE[1];

  // The master chain high-passes at 85Hz because a television speaker cannot
  // move air below that. Anything written underneath it is simply deleted —
  // and the bass line was written two octaves below the root, which put every
  // piece's low end at 25-40Hz. The score had no bass at all and the Boss,
  // which leans hardest on it, measured QUIETER than the title screen.
  //
  // Rather than hand-tuning every root and transposition to stay clear of the
  // filter — which a future realm's data would silently get wrong — fold any
  // note that falls under the floor up by octaves until it is audible.
  const AUDIBLE_FLOOR = 98;
  function audible(f) {
    while (f < AUDIBLE_FLOOR) f *= 2;
    return f;
  }

  // Scale degree -> frequency, in the active mode. Degrees run past the octave,
  // so degree 7 is the root an octave up and -1 is the seventh below.
  function deg(d, octave = 0) {
    const tone = realmTone || DEFAULT_TONE;
    const steps = MODES[tone.mode] || MODES.aeolian;
    const n = steps.length;
    const within = ((d % n) + n) % n;
    const octaves = Math.floor(d / n) + octave;
    return tone.root * Math.pow(2, steps[within] / 12 + octaves);
  }

  // =========================================================================
  // THE VOICES
  // =========================================================================

  // Karplus-Strong plucked string. A burst of noise fed into a short delay
  // line that feeds back through a lowpass: the delay length sets the pitch,
  // the filter is why it decays from bright to dull the way a real string
  // does. Rendered straight into a buffer, which is cheap and, unlike a
  // native delay node, cannot drift or ring on forever.
  const pluckCache = new Map();
  function pluckBuffer(freq, dur, damp) {
    const c = ctx;
    const key = `${Math.round(freq)}_${dur.toFixed(2)}_${damp.toFixed(2)}`;
    const hit = pluckCache.get(key);
    if (hit) return hit;

    const sr = c.sampleRate;
    const len = Math.max(64, Math.floor(sr * dur));
    const N = Math.max(2, Math.round(sr / freq));
    const buf = c.createBuffer(1, len, sr);
    const out = buf.getChannelData(0);

    const line = new Float32Array(N);
    for (let i = 0; i < N; i++) line[i] = Math.random() * 2 - 1;
    // a touch of lowpass on the initial burst = a softer, less clacky attack
    for (let i = 1; i < N; i++) line[i] = (line[i] + line[i - 1]) * 0.5;

    let idx = 0, prev = 0;
    for (let i = 0; i < len; i++) {
      const cur = line[idx];
      const next = line[(idx + 1) % N];
      const filtered = (cur + next) * 0.5 * damp + prev * 0.02;
      line[idx] = filtered;
      out[i] = cur;
      prev = filtered;
      idx = (idx + 1) % N;
    }
    // fade the tail so a truncated buffer never clicks
    const fade = Math.min(len, Math.floor(sr * 0.03));
    for (let i = 0; i < fade; i++) out[len - 1 - i] *= i / fade;

    if (pluckCache.size > 220) pluckCache.clear();
    pluckCache.set(key, buf);
    return buf;
  }

  function pluck(freq, when, dur, gain, damp = 0.497) {
    const c = ctx;
    const src = c.createBufferSource();
    src.buffer = pluckBuffer(freq, dur, damp);
    const g = c.createGain();
    g.gain.setValueAtTime(gain, when);
    // a gentle bandpass keeps plucks in the range a TV speaker can actually
    // deliver instead of scattering energy where nobody will hear it
    const tone = c.createBiquadFilter();
    tone.type = "lowpass";
    tone.frequency.value = 4200;
    src.connect(tone).connect(g).connect(bus);
    src.start(when);
    src.stop(when + dur + 0.05);
  }

  // Bowed pad: two detuned saws through a slow filter sweep. The slow attack
  // is what makes it read as bowed rather than as an organ.
  function bow(freq, when, dur, gain) {
    const c = ctx;
    const g = c.createGain();
    const filt = c.createBiquadFilter();
    filt.type = "lowpass";
    filt.Q.value = 0.7;
    filt.frequency.setValueAtTime(Math.max(320, freq * 2.2), when);
    filt.frequency.linearRampToValueAtTime(Math.max(420, freq * 3.6), when + dur * 0.5);
    filt.frequency.linearRampToValueAtTime(Math.max(300, freq * 2.0), when + dur);

    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + Math.min(0.5, dur * 0.35));
    g.gain.setValueAtTime(gain, when + dur * 0.72);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    [0, 1].forEach(i => {
      const o = c.createOscillator();
      o.type = "sawtooth";
      o.frequency.value = freq * (i ? 1.006 : 0.994);   // detune = width
      // slow vibrato, only on the upper voice, so it shimmers rather than warbles
      if (i) {
        const lfo = c.createOscillator(), la = c.createGain();
        lfo.frequency.value = 4.6;
        la.gain.value = freq * 0.004;
        lfo.connect(la).connect(o.frequency);
        lfo.start(when); lfo.stop(when + dur + 0.1);
      }
      o.connect(filt);
      o.start(when);
      o.stop(when + dur + 0.05);
    });
    filt.connect(g).connect(bus);
  }

  // FM bell. A carrier sine plus a modulator at a deliberately non-integer
  // ratio — that inharmonicity is the whole reason it rings like struck metal
  // instead of sounding like a flute.
  function bell(freq, when, dur, gain) {
    const c = ctx;
    const carrier = c.createOscillator();
    const mod = c.createOscillator();
    const modAmt = c.createGain();
    const g = c.createGain();

    carrier.type = "sine"; mod.type = "sine";
    carrier.frequency.value = freq;
    mod.frequency.value = freq * 2.41;
    modAmt.gain.setValueAtTime(freq * 2.6, when);
    modAmt.gain.exponentialRampToValueAtTime(freq * 0.05, when + dur * 0.6);

    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.006);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);

    mod.connect(modAmt).connect(carrier.frequency);
    carrier.connect(g).connect(bus);
    mod.start(when); mod.stop(when + dur + 0.05);
    carrier.start(when); carrier.stop(when + dur + 0.05);
  }

  // Frame drum / taiko. A pitched sine that drops fast for the body, plus a
  // noise transient for the stick. Tuned up out of the sub range on purpose —
  // see the note about TV speakers at the top.
  let noiseBuf = null;
  function noise() {
    if (noiseBuf) return noiseBuf;
    const len = Math.floor(ctx.sampleRate * 0.5);
    noiseBuf = ctx.createBuffer(1, len, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    return noiseBuf;
  }

  function drum(when, gain, low = 132, dur = 0.36, snap = 0.5) {
    const c = ctx;
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = "sine";
    o.frequency.setValueAtTime(low * 1.9, when);
    o.frequency.exponentialRampToValueAtTime(low * 0.75, when + dur * 0.5);
    og.gain.setValueAtTime(gain, when);
    og.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(og).connect(bus);
    o.start(when); o.stop(when + dur + 0.05);

    if (snap > 0) {
      const n = c.createBufferSource();
      n.buffer = noise();
      const nf = c.createBiquadFilter();
      nf.type = "bandpass"; nf.frequency.value = 1900; nf.Q.value = 0.8;
      const ng = c.createGain();
      ng.gain.setValueAtTime(gain * 0.5 * snap, when);
      ng.gain.exponentialRampToValueAtTime(0.0001, when + 0.07);
      n.connect(nf).connect(ng).connect(bus);
      n.start(when); n.stop(when + 0.12);
    }
  }

  // Restrained sub. Present enough to feel on a decent speaker, quiet enough
  // that a TV cabinet does not rattle.
  function bass(freq, when, dur, gain) {
    const c = ctx;
    const o = c.createOscillator();
    const g = c.createGain();
    o.type = "triangle";
    o.frequency.value = freq;
    g.gain.setValueAtTime(0.0001, when);
    g.gain.linearRampToValueAtTime(gain, when + 0.02);
    g.gain.setValueAtTime(gain, when + dur * 0.6);
    g.gain.exponentialRampToValueAtTime(0.0001, when + dur);
    o.connect(g).connect(bus);
    o.start(when); o.stop(when + dur + 0.05);
  }

  // =========================================================================
  // THE PIECES
  //
  // Each is written out: a chord progression in scale degrees, a bass line, a
  // melody, and a drum pattern on a 16-step-per-bar grid. `null` means rest.
  // Because they repeat, a class hears the same tune every lesson and starts
  // to know it — which is the entire point of a theme.
  // =========================================================================
  const X = null;

  const PIECES = {
    // Wide and unhurried. Bowed pad underneath, a bell melody that takes its
    // time. This is the sound of the game sitting on screen before the lesson
    // starts, so it must not nag.
    title: {
      bpm: 68, bars: 4,
      chords: [[0, 2, 4], [5, 0, 2], [3, 5, 0], [4, 6, 1]],
      pad: true, padGain: 0.085,
      bassLine: [0, X, X, X,  X, X, X, X,  5, X, X, X,  X, X, X, X],
      melody: {
        voice: "bell", gain: 0.075, dur: 1.6,
        notes: [
          [4, X, X, X,  X, X, 2, X,  X, X, X, X,  4, X, X, X],
          [X, X, X, X,  0, X, X, X,  X, X, X, X,  X, X, 2, X],
          [3, X, X, X,  X, X, X, X,  2, X, X, X,  X, X, X, X],
          [4, X, X, X,  X, X, 6, X,  X, X, X, X,  X, X, X, X],
        ],
      },
      drums: null,
    },

    // The map. A walking pulse — this is where the class argues about which
    // path to take, so it wants forward motion without urgency.
    map: {
      bpm: 92, bars: 4,
      chords: [[0, 2, 4], [3, 5, 0], [5, 0, 2], [4, 6, 1]],
      pad: true, padGain: 0.055,
      bassLine: [0, X, X, 0,  X, X, 4, X,  0, X, X, 0,  X, X, 2, X],
      ostinato: {
        gain: 0.062, dur: 0.85,
        notes: [4, X, 2, X,  4, X, 6, X,  4, X, 2, X,  0, X, 2, X],
      },
      melody: {
        voice: "pluck", gain: 0.07, dur: 1.1,
        notes: [
          [X, X, X, X,  X, X, X, X,  7, X, X, X,  6, X, X, X],
          [4, X, X, X,  X, X, X, X,  X, X, X, X,  X, X, X, X],
          [X, X, X, X,  5, X, 4, X,  X, X, X, X,  2, X, X, X],
          [X, X, X, X,  X, X, X, X,  4, X, 2, X,  0, X, X, X],
        ],
      },
      drums: {
        gain: 0.10,
        pattern: [1, X, X, X,  X, X, .5, X,  1, X, X, X,  X, X, .6, X],
      },
    },

    // A fight. Driving, but it has to sit UNDER a question for most of its
    // life, so the energy is in the rhythm rather than in a busy top line.
    fight: {
      bpm: 108, bars: 4,
      chords: [[0, 2, 4], [0, 2, 4], [5, 0, 2], [4, 6, 1]],
      pad: true, padGain: 0.042,
      bassLine: [0, X, 0, X,  4, X, 0, X,  0, X, 0, X,  2, X, 3, X],
      ostinato: {
        gain: 0.07, dur: 0.5,
        notes: [0, X, 2, X,  4, X, 2, X,  0, X, 2, X,  4, X, 6, X],
      },
      melody: {
        voice: "pluck", gain: 0.075, dur: 0.9,
        notes: [
          [X, X, X, X,  X, X, X, X,  7, X, 6, X,  4, X, X, X],
          [X, X, X, X,  X, X, X, X,  X, X, X, X,  X, X, X, X],
          [5, X, X, X,  4, X, X, X,  2, X, X, X,  X, X, X, X],
          [X, X, X, X,  X, X, X, X,  4, X, 2, X,  0, X, X, X],
        ],
      },
      drums: {
        gain: 0.15,
        pattern: [1, X, X, .4,  X, X, .7, X,  1, X, X, .4,  X, .5, .7, X],
      },
    },

    // An Elite. The same DNA as a fight, wound tighter: faster, lower root,
    // doubled drums. Students should hear the difference before they read the
    // word "ELITE" on screen.
    elite: {
      bpm: 122, bars: 4, transpose: -2,
      chords: [[0, 2, 4], [1, 3, 5], [0, 2, 4], [4, 6, 1]],
      pad: true, padGain: 0.05,
      bassLine: [0, X, 0, 0,  X, X, 3, X,  0, X, 0, 0,  X, 1, 2, X],
      ostinato: {
        gain: 0.075, dur: 0.42,
        notes: [0, X, 1, X,  0, X, 3, X,  0, X, 1, X,  4, X, 3, X],
      },
      melody: {
        voice: "bell", gain: 0.06, dur: 0.7,
        notes: [
          [X, X, X, X,  7, X, X, X,  X, X, X, X,  6, X, X, X],
          [X, X, X, X,  X, X, X, X,  5, X, X, X,  X, X, X, X],
          [X, X, X, X,  7, X, X, X,  X, X, X, X,  8, X, X, X],
          [X, X, X, X,  X, X, X, X,  4, X, 3, X,  1, X, X, X],
        ],
      },
      drums: {
        gain: 0.17,
        pattern: [1, X, .5, .5,  X, .4, .8, X,  1, X, .5, .5,  .4, .6, .9, .5],
      },
    },

    // The Boss. Everything at once, and the only piece that gets the low
    // taiko. Phrygian colour comes from the flat second in the progression.
    boss: {
      bpm: 132, bars: 4, transpose: -4,
      chords: [[0, 2, 4], [1, 3, 5], [0, 2, 4], [1, 3, 5]],
      pad: true, padGain: 0.06,
      bassLine: [0, X, 0, 0,  1, X, 0, X,  0, X, 0, 0,  3, X, 1, X],
      ostinato: {
        gain: 0.08, dur: 0.38,
        notes: [0, 1, 0, X,  3, X, 1, X,  0, 1, 0, X,  4, X, 3, X],
      },
      melody: {
        voice: "bell", gain: 0.08, dur: 0.9,
        notes: [
          [7, X, X, X,  X, X, X, X,  8, X, X, X,  X, X, X, X],
          [X, X, X, X,  7, X, X, X,  X, X, 6, X,  X, X, X, X],
          [7, X, X, X,  X, X, X, X,  X, X, X, X,  8, X, X, X],
          [X, X, X, X,  6, X, 4, X,  X, X, X, X,  1, X, 0, X],
        ],
      },
      drums: {
        gain: 0.2, taiko: true,
        pattern: [1, X, .6, .6,  .5, X, .9, X,  1, X, .6, .6,  .7, .7, 1, .6],
      },
    },

    // A campfire. The exhale. Plucks and pad, no drums at all — the absence of
    // a pulse is what tells the room it is safe here.
    campfire: {
      bpm: 72, bars: 4,
      chords: [[0, 2, 4], [3, 5, 0], [4, 6, 1], [0, 2, 4]],
      pad: true, padGain: 0.075,
      bassLine: [0, X, X, X,  X, X, X, X,  3, X, X, X,  X, X, X, X],
      melody: {
        voice: "pluck", gain: 0.085, dur: 1.5,
        notes: [
          [4, X, X, X,  2, X, X, X,  0, X, X, X,  X, X, 2, X],
          [X, X, X, X,  4, X, X, X,  X, X, X, X,  5, X, X, X],
          [6, X, X, X,  X, X, 4, X,  X, X, X, X,  2, X, X, X],
          [X, X, X, X,  0, X, X, X,  X, X, X, X,  X, X, X, X],
        ],
      },
      drums: null,
    },
  };

  // The old code called these names; keep them working.
  const ALIASES = { explore: "map" };

  // =========================================================================
  // OUTPUT CHAIN — voiced for a classroom television
  // =========================================================================
  function build() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    ctx = new AC();

    bus = ctx.createGain();
    bus.gain.value = 1;

    duckGain = ctx.createGain();
    duckGain.gain.value = 1;

    // 1. High-pass hard. A TV speaker cannot move air below ~90Hz; leaving that
    //    content in only wastes headroom and rattles the cabinet.
    const hp = ctx.createBiquadFilter();
    hp.type = "highpass"; hp.frequency.value = 85; hp.Q.value = 0.7;

    // 2. Lift the mids. Small speakers are most efficient around 1.5-3kHz, and
    //    that is also where the score has to cut through classroom noise.
    const presence = ctx.createBiquadFilter();
    presence.type = "peaking";
    presence.frequency.value = 2300; presence.Q.value = 0.9; presence.gain.value = 3.5;

    // 3. Take the very top off so it never gets harsh at volume.
    const air = ctx.createBiquadFilter();
    air.type = "lowshelf"; air.frequency.value = 240; air.gain.value = -2;
    const tame = ctx.createBiquadFilter();
    tame.type = "lowpass"; tame.frequency.value = 9500; tame.Q.value = 0.6;

    // 4. Compress, so the quiet passages still carry over a noisy room.
    //    Gently: at ratio 3.4 with a -22dB threshold this flattened the dense
    //    pieces so hard that the Boss measured QUIETER than the title screen,
    //    which is exactly backwards. The boss should be the loudest thing in
    //    the game.
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10;
    comp.ratio.value = 2.2; comp.attack.value = 0.010; comp.release.value = 0.25;

    master = ctx.createGain();
    master.gain.value = 0;

    // NOTE THE ORDER. Ducking has to sit AFTER the compressor. With the duck
    // upstream, the compressor simply gave back most of the level the duck had
    // just taken away - a 10dB duck measured as a 1dB duck, and the score kept
    // talking over the teacher. Compression shapes the mix; ducking rides the
    // finished mix.
    bus.connect(hp).connect(air).connect(presence)
       .connect(tame).connect(comp).connect(duckGain).connect(master)
       .connect(ctx.destination);
    return ctx;
  }

  function ac() {
    build();
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }

  function targetGain() { return enabled ? 0.9 * volume : 0; }

  function rampMaster(to, secs = 1.0) {
    if (!master) return;
    const t = ctx.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setValueAtTime(master.gain.value, t);
    master.gain.linearRampToValueAtTime(to, t + secs);
  }

  // =========================================================================
  // THE SEQUENCER
  //
  // Look-ahead scheduling: a timer wakes every 25ms and writes any notes due
  // in the next 180ms at absolute AudioContext times. The timer being sloppy
  // therefore does not matter — every note still lands exactly on the beat.
  // Driving the synth straight from setTimeout, as the old code did, means the
  // groove wobbles with whatever else the page is doing.
  // =========================================================================
  function scheduleStep(piece, step, when) {
    const tone = realmTone || DEFAULT_TONE;
    const spb = 60 / piece.bpm;              // seconds per beat
    const bar = Math.floor(step / 16) % piece.bars;
    const s = step % 16;
    const tr = piece.transpose || 0;

    // pad: one long bowed chord per bar
    if (piece.pad && s === 0) {
      const chord = piece.chords[bar];
      chord.forEach((d, i) => {
        bow(audible(deg(d + tr, i === 0 ? -1 : 0)), when, spb * 4 * 0.98,
            piece.padGain * tone.pad * (i === 0 ? 1 : 0.7));
      });
    }

    // bass
    if (piece.bassLine) {
      const d = piece.bassLine[s];
      if (d !== null && d !== undefined) {
        bass(audible(deg(d + tr, -2)), when, spb * 0.9, 0.22);
      }
    }

    // ostinato: the repeating figure that makes a piece recognisable
    if (piece.ostinato) {
      const d = piece.ostinato.notes[s];
      if (d !== null && d !== undefined) {
        pluck(audible(deg(d + tr, 0)), when, piece.ostinato.dur,
              piece.ostinato.gain * tone.pluck);
      }
    }

    // melody
    if (piece.melody) {
      const row = piece.melody.notes[bar];
      const d = row ? row[s] : null;
      if (d !== null && d !== undefined) {
        const f = audible(deg(d + tr, 1));
        if (piece.melody.voice === "bell") {
          bell(f, when, piece.melody.dur, piece.melody.gain * tone.bell);
        } else {
          pluck(f, when, piece.melody.dur, piece.melody.gain * tone.pluck, 0.4985);
        }
      }
    }

    // drums
    if (piece.drums) {
      const v = piece.drums.pattern[s];
      if (v !== null && v !== undefined) {
        const heavy = piece.drums.taiko && v >= 0.9;
        drum(when, piece.drums.gain * tone.drum * v,
             heavy ? 108 : 138, heavy ? 0.5 : 0.34, v >= 0.9 ? 0.35 : 0.7);
      }
    }
  }

  function scheduler() {
    const piece = PIECES[current];
    if (!piece || !enabled || !ctx) return;
    const spb = 60 / piece.bpm;
    const stepDur = spb / 4;                 // 16th notes
    while (nextNoteTime < ctx.currentTime + HORIZON) {
      // never schedule in the past — a backgrounded tab can stall the timer
      const when = Math.max(nextNoteTime, ctx.currentTime + 0.01);
      scheduleStep(piece, stepIndex, when);
      stepIndex++;
      nextNoteTime += stepDur;
      if (nextNoteTime < ctx.currentTime - 0.5) nextNoteTime = ctx.currentTime + 0.05;
    }
  }

  function startScheduler() {
    stopScheduler();
    lookahead = setInterval(scheduler, SCHED_MS);
  }
  function stopScheduler() {
    if (lookahead) { clearInterval(lookahead); lookahead = null; }
  }

  return {
    setEnabled(v) {
      enabled = v;
      if (!v) { rampMaster(0, 0.5); stopScheduler(); }
      else if (current) {
        ac();
        nextNoteTime = ctx.currentTime + 0.08;
        startScheduler();
        rampMaster(targetGain(), 0.8);
      }
    },
    setVolume(v) { volume = v; if (current && enabled) rampMaster(targetGain(), 0.25); },
    isEnabled() { return enabled; },

    // Tell the score which realm it is in. Called when a run starts.
    setRealm(id) {
      const t = REALM_TONE[id] || DEFAULT_TONE;
      if (t === realmTone) return;
      realmTone = t;
      pluckCache.clear();          // cached strings were built at the old pitch
    },

    play(name) {
      const key = ALIASES[name] || name;
      if (!PIECES[key]) return;
      if (current === key) return;
      const first = !current;
      current = key;
      if (!enabled) return;
      ac();
      if (!realmTone) realmTone = DEFAULT_TONE;
      // Start on a bar line rather than wherever the last piece happened to
      // be, so a context change lands as a change rather than as a stumble.
      stepIndex = 0;
      nextNoteTime = ctx.currentTime + 0.08;
      startScheduler();
      rampMaster(targetGain(), first ? 1.4 : 0.6);
    },

    stop() {
      current = null;
      stopScheduler();
      rampMaster(0, 0.7);
    },

    // ---------------------------------------------------------------------
    // Ducking. The teacher is talking over this, and a child is reading a
    // question off a television. The score drops well back while a question
    // is live and comes up between them, so it breathes with the lesson.
    // ---------------------------------------------------------------------
    duck(on) {
      if (!ctx || !duckGain || ducked === !!on) return;
      ducked = !!on;
      const t = ctx.currentTime;
      duckGain.gain.cancelScheduledValues(t);
      duckGain.gain.setValueAtTime(duckGain.gain.value, t);
      duckGain.gain.linearRampToValueAtTime(on ? 0.30 : 1.0, t + (on ? 0.25 : 0.5));
    },

    // A short lift for a victory or a big hit — the score leans in for a
    // moment and settles back.
    swell(amount = 1.35, secs = 0.9) {
      if (!ctx || !duckGain || ducked) return;
      const t = ctx.currentTime;
      duckGain.gain.cancelScheduledValues(t);
      duckGain.gain.setValueAtTime(duckGain.gain.value, t);
      duckGain.gain.linearRampToValueAtTime(amount, t + 0.12);
      duckGain.gain.linearRampToValueAtTime(1.0, t + secs);
    },

    isDucked() { return ducked; },
    currentPiece() { return current; },
    // the live values behind the flags, for tests and for diagnosing a mix
    duckLevel() { return duckGain ? duckGain.gain.value : null; },
    // Tap the finished mix into an extra destination. Used to record preview
    // files off the real graph rather than re-implementing the synth offline,
    // so what gets exported is exactly what the classroom hears.
    __tapTo(node) { if (master) master.connect(node); },
    masterLevel() { return master ? master.gain.value : null; },

    // A tap off the output, for tests. Checking that `current` is set proves
    // only that a name was assigned - a completely silent score would pass
    // that. This lets a test measure whether any sound is actually coming out,
    // which is the mistake Brace taught us to stop making.
    analyser() {
      if (!ctx) return null;
      if (!MUSIC._an) {
        MUSIC._an = ctx.createAnalyser();
        MUSIC._an.fftSize = 2048;
        master.connect(MUSIC._an);        // a tap, not an insert
      }
      return MUSIC._an;
    },

    // Peak absolute sample value over one analyser frame.
    level() {
      const an = this.analyser();
      if (!an) return 0;
      const buf = new Float32Array(an.fftSize);
      an.getFloatTimeDomainData(buf);
      let peak = 0;
      for (let i = 0; i < buf.length; i++) {
        const v = Math.abs(buf[i]);
        if (v > peak) peak = v;
      }
      return peak;
    },
  };
})();
