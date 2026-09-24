"use client";

/*
 * DAYFOUR sound, synthesized with Web Audio until real sound files exist.
 *
 *  music  A quiet, slowly shifting chord bed with the odd soft bell note. Dark,
 *         warm, no noise. This is the site's background.
 *  hit    Once, as the logo reveals: a low bloom and a bell chord that fade away.
 *  scene  The slow timeline's own audio (from its video), looped while the timeline
 *         scene is on screen; it quickens with the expansion and fades away after.
 *  rise   A tonal pad that climbs and quickens with the timeline expansion, then
 *         slowly fades out once the footage is done.
 *
 * Browsers only allow sound after a tap or key press, so nothing plays until the
 * first gesture. The toggle in the corner can turn it off again.
 */

type Listener = (on: boolean) => void;

// A minor 9, F major 7, C major 7, E minor 7: slow, open, unresolved.
const CHORDS = [
  [110, 164.81, 246.94, 261.63, 329.63],
  [87.31, 130.81, 220, 261.63, 329.63],
  [65.41, 130.81, 196, 246.94, 329.63],
  [82.41, 123.47, 196, 246.94, 293.66],
];
const BELLS = [659.25, 783.99, 880, 987.77, 1318.51];
const CHORD_SECONDS = 9;

class DayfourSound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private musicBus!: GainNode;
  private reverb!: ConvolverNode;
  private riseGain!: GainNode;
  private riseFilter!: BiquadFilterNode;
  private riseLfo!: OscillatorNode;
  private riseDepth!: GainNode;
  private riseVoices: { osc: OscillatorNode; base: number }[] = [];
  private riseDone = false;
  private sceneGain!: GainNode;
  private sceneSource: AudioBufferSourceNode | null = null;
  private sceneOn = false;
  private chordTimer: number | null = null;
  private bellTimer: number | null = null;
  private chordIndex = 0;
  private hitRequestedAt = -Infinity;
  private on = false;
  private userMuted = false;
  private listeners = new Set<Listener>();

  get enabled() {
    return this.on;
  }

  subscribe(fn: Listener) {
    this.listeners.add(fn);
    return () => void this.listeners.delete(fn);
  }

  /** First tap or key press anywhere: start, unless the visitor muted it. */
  gesture() {
    if (!this.userMuted && !this.on) this.setEnabled(true);
  }

  toggle() {
    this.userMuted = this.on;
    this.setEnabled(!this.on);
  }

  setEnabled(on: boolean) {
    if (on && !this.ctx) this.build();
    if (!this.ctx) return;
    if (on && this.ctx.state === "suspended") void this.ctx.resume();
    this.on = on;
    const t = this.ctx.currentTime;
    this.master.gain.cancelScheduledValues(t);
    this.master.gain.setValueAtTime(this.master.gain.value, t);
    this.master.gain.linearRampToValueAtTime(on ? 0.7 : 0, t + (on ? 3 : 0.4));
    if (on) {
      this.startMusic();
      // Only if the visitor turned sound on while the logo is still showing.
      if (performance.now() - this.hitRequestedAt < 6000) this.hit();
    } else {
      this.stopMusic();
    }
    this.listeners.forEach((fn) => fn(on));
  }

  /** Once, as the logo reveals. If sound is off, it plays only if turned on within a few seconds. */
  hit() {
    if (!this.ctx || !this.on) {
      this.hitRequestedAt = performance.now();
      return;
    }
    this.hitRequestedAt = -Infinity;
    const ctx = this.ctx;
    const t = ctx.currentTime + 0.05;

    // Low bloom: a sine falling from 70 to 42 Hz, fading over a few seconds.
    const low = ctx.createOscillator();
    low.frequency.setValueAtTime(70, t);
    low.frequency.exponentialRampToValueAtTime(42, t + 3);
    const lowGain = ctx.createGain();
    lowGain.gain.setValueAtTime(0.0001, t);
    lowGain.gain.exponentialRampToValueAtTime(0.5, t + 0.08);
    lowGain.gain.exponentialRampToValueAtTime(0.0001, t + 4.5);
    low.connect(lowGain);
    lowGain.connect(this.master);
    lowGain.connect(this.reverb);
    low.start(t);
    low.stop(t + 4.6);

    // Bell chord over it, rolled slightly, ringing into the reverb.
    [220, 329.63, 493.88, 659.25].forEach((f, i) => this.bell(f, t + 0.12 + i * 0.07, 0.07, 6));
  }

  /** The slow timeline's audio: on while the timeline scene is showing, fading out after. */
  scene(active: boolean) {
    if (active === this.sceneOn) return;
    this.sceneOn = active;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.sceneGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(active ? 0.9 : 0, t + (active ? 1.5 : 4));
  }

  /** 0..1 from the timeline expansion. After it completes, the pad fades out slowly. */
  rise(p: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const q = p * p;
    const done = p >= 0.995;
    if (done && !this.riseDone) {
      this.riseDone = true;
      this.riseGain.gain.cancelScheduledValues(t);
      this.riseGain.gain.setValueAtTime(this.riseGain.gain.value, t);
      this.riseGain.gain.linearRampToValueAtTime(0, t + 5);
    } else if (!done) {
      this.riseDone = false;
      this.riseGain.gain.cancelScheduledValues(t);
      this.riseGain.gain.setTargetAtTime(p > 0.001 ? 0.04 + q * 0.08 : 0, t, 0.15);
    }
    this.sceneSource?.playbackRate.setTargetAtTime(1 + q * 0.6, t, 0.15);
    this.riseFilter.frequency.setTargetAtTime(600 + q * 2600, t, 0.1);
    this.riseVoices.forEach(({ osc, base }) => osc.frequency.setTargetAtTime(base * (1 + q * 0.25), t, 0.12));
    this.riseLfo.frequency.setTargetAtTime(0.3 + q * 5, t, 0.15);
    this.riseDepth.gain.setTargetAtTime(0.1 + q * 0.3, t, 0.15);
  }

  private build() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const warm = ctx.createBiquadFilter(); // takes the edge off everything
    warm.type = "lowpass";
    warm.frequency.value = 5200;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(warm).connect(comp).connect(ctx.destination);

    // Long, dark reverb.
    this.reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 5;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.5);
    }
    this.reverb.buffer = impulse;
    const damp = ctx.createBiquadFilter();
    damp.type = "lowpass";
    damp.frequency.value = 2400;
    const wet = ctx.createGain();
    wet.gain.value = 0.6;
    this.reverb.connect(damp).connect(wet).connect(this.master);

    // Music bus, kept low under everything.
    this.musicBus = ctx.createGain();
    this.musicBus.gain.value = 0.16;
    const musicTone = ctx.createBiquadFilter();
    musicTone.type = "lowpass";
    musicTone.frequency.value = 1500;
    this.musicBus.connect(musicTone);
    musicTone.connect(this.master);
    musicTone.connect(this.reverb);

    // Scene: the slow timeline's own audio (desk clicks and room tone), looped.
    this.sceneGain = ctx.createGain();
    this.sceneGain.gain.value = 0;
    this.sceneGain.connect(this.master);
    const roomSend = ctx.createGain();
    roomSend.gain.value = 0.25;
    this.sceneGain.connect(roomSend).connect(this.reverb);
    fetch("/assets/audio/timeline-slow.m4a")
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.connect(this.sceneGain);
        src.start();
        this.sceneSource = src;
      })
      .catch(() => {});
    if (this.sceneOn) {
      this.sceneOn = false;
      this.scene(true);
    }

    // Rise: three tonal voices with a tremolo that quickens. No noise.
    this.riseFilter = ctx.createBiquadFilter();
    this.riseFilter.type = "lowpass";
    this.riseFilter.frequency.value = 600;
    const trem = ctx.createGain();
    trem.gain.value = 0.8;
    this.riseGain = ctx.createGain();
    this.riseGain.gain.value = 0;
    this.riseFilter.connect(trem).connect(this.riseGain);
    this.riseGain.connect(this.master);
    this.riseGain.connect(this.reverb);
    this.riseLfo = ctx.createOscillator();
    this.riseLfo.frequency.value = 0.3;
    this.riseDepth = ctx.createGain();
    this.riseDepth.gain.value = 0.1;
    this.riseLfo.connect(this.riseDepth).connect(trem.gain);
    this.riseLfo.start();
    [220, 329.63, 440].forEach((base, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 1 ? "triangle" : "sine";
      osc.frequency.value = base;
      osc.detune.value = (i - 1) * 6;
      const v = ctx.createGain();
      v.gain.value = [0.3, 0.16, 0.1][i];
      osc.connect(v).connect(this.riseFilter);
      osc.start();
      this.riseVoices.push({ osc, base });
    });
  }

  private startMusic() {
    if (!this.ctx || this.chordTimer !== null) return;
    const playChord = () => {
      const chord = CHORDS[this.chordIndex++ % CHORDS.length];
      const t = this.ctx!.currentTime + 0.05;
      chord.forEach((f, i) => this.padNote(f, t + i * 0.25, CHORD_SECONDS + 4));
    };
    playChord();
    this.chordTimer = window.setInterval(playChord, CHORD_SECONDS * 1000);
    const bellLater = () => {
      this.bellTimer = window.setTimeout(() => {
        const f = BELLS[Math.floor(Math.random() * BELLS.length)];
        this.bell(f, this.ctx!.currentTime + 0.05, 0.035, 5);
        bellLater();
      }, 6000 + Math.random() * 9000);
    };
    bellLater();
  }

  private stopMusic() {
    if (this.chordTimer !== null) clearInterval(this.chordTimer);
    if (this.bellTimer !== null) clearTimeout(this.bellTimer);
    this.chordTimer = null;
    this.bellTimer = null;
  }

  /** A soft pad note: slow attack, long release, overlapping into the next chord. */
  private padNote(freq: number, t: number, length: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(0.22, t + 3.5);
    g.gain.setValueAtTime(0.22, t + length - 5);
    g.gain.linearRampToValueAtTime(0, t + length);
    g.connect(this.musicBus);
    [0, 7].forEach((detune, i) => {
      const o = ctx.createOscillator();
      o.type = i ? "triangle" : "sine";
      o.frequency.value = freq;
      o.detune.value = i ? detune : -detune;
      const v = ctx.createGain();
      v.gain.value = i ? 0.35 : 0.65;
      o.connect(v).connect(g);
      o.start(t);
      o.stop(t + length + 0.1);
    });
  }

  /** A soft struck bell that rings into the reverb. */
  private bell(freq: number, t: number, level: number, decay: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(level, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + decay);
    g.connect(this.master);
    g.connect(this.reverb);
    [1, 2.01].forEach((mult, i) => {
      const o = ctx.createOscillator();
      o.frequency.value = freq * mult;
      const v = ctx.createGain();
      v.gain.value = i ? 0.25 : 1;
      o.connect(v).connect(g);
      o.start(t);
      o.stop(t + decay + 0.1);
    });
  }
}

let instance: DayfourSound | null = null;
export function getSound() {
  if (!instance) instance = new DayfourSound();
  return instance;
}
