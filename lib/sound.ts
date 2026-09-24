"use client";

/*
 * DAYFOUR sound, synthesized with Web Audio until real sound files exist.
 *
 *  bed   A low drone with slow air and a long, dark reverb. Starts with the intro, never stops.
 *  swell The bed opens up once while the logo reveals.
 *  rise  A thin pad and noise that climb with the scroll expansion (kept quiet).
 *
 * Browsers only allow sound after a tap or key press, so nothing plays until the
 * first gesture. The toggle in the corner can turn it off again.
 */

type Listener = (on: boolean) => void;

class DayfourSound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private bedFilter!: BiquadFilterNode;
  private riseGain!: GainNode;
  private riseFilter!: BiquadFilterNode;
  private riseNoise!: GainNode;
  private riseNoiseFilter!: BiquadFilterNode;
  private riseLfo!: OscillatorNode;
  private riseVoices: { osc: OscillatorNode; base: number }[] = [];
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
    this.master.gain.linearRampToValueAtTime(on ? 0.55 : 0, t + (on ? 2.5 : 0.4));
    this.listeners.forEach((fn) => fn(on));
  }

  /** The bed opens once, slowly, while the logo reveals. */
  swell(seconds = 6) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const f = this.bedFilter.frequency;
    f.cancelScheduledValues(t);
    f.setValueAtTime(f.value, t);
    f.linearRampToValueAtTime(1100, t + seconds * 0.7);
    f.linearRampToValueAtTime(420, t + seconds + 3);
  }

  /** 0..1 from the scroll expansion. */
  rise(p: number) {
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const q = p * p;
    this.riseGain.gain.setTargetAtTime(p > 0.001 ? 0.05 + q * 0.12 : 0, t, 0.12);
    this.riseFilter.frequency.setTargetAtTime(500 + q * 4200, t, 0.1);
    this.riseVoices.forEach(({ osc, base }) => osc.frequency.setTargetAtTime(base * (1 + q * 0.35), t, 0.1));
    this.riseLfo.frequency.setTargetAtTime(0.2 + q * 7, t, 0.1);
    this.riseNoise.gain.setTargetAtTime(q * 0.05, t, 0.1);
    this.riseNoiseFilter.frequency.setTargetAtTime(600 + q * 4000, t, 0.1);
  }

  private build() {
    const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AC) return;
    const ctx = new AC();
    this.ctx = ctx;

    this.master = ctx.createGain();
    this.master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    this.master.connect(comp).connect(ctx.destination);

    // Long dark reverb from a decaying noise impulse.
    const reverb = ctx.createConvolver();
    const len = ctx.sampleRate * 4.5;
    const impulse = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let ch = 0; ch < 2; ch++) {
      const d = impulse.getChannelData(ch);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3.2);
    }
    reverb.buffer = impulse;
    const wet = ctx.createGain();
    wet.gain.value = 0.7;
    reverb.connect(wet).connect(this.master);

    const noise = this.noiseBuffer(ctx);

    // Bed: drone.
    this.bedFilter = ctx.createBiquadFilter();
    this.bedFilter.type = "lowpass";
    this.bedFilter.frequency.value = 420;
    const bed = ctx.createGain();
    bed.gain.value = 0.5;
    this.bedFilter.connect(bed);
    bed.connect(this.master);
    bed.connect(reverb);
    const breathe = ctx.createOscillator();
    breathe.frequency.value = 0.045;
    const breatheDepth = ctx.createGain();
    breatheDepth.gain.value = 0.18;
    breathe.connect(breatheDepth).connect(bed.gain);
    breathe.start();
    ([[55, 0.34, "sine"], [82.41, 0.2, "sine"], [110, 0.07, "triangle"], [164.81, 0.03, "sine"]] as const)
      .forEach(([f, g, type], i) => {
        const o = ctx.createOscillator();
        o.type = type;
        o.frequency.value = f;
        o.detune.value = (i % 2 ? 1 : -1) * 4;
        const v = ctx.createGain();
        v.gain.value = g;
        o.connect(v).connect(this.bedFilter);
        o.start();
      });

    // Bed: slow air.
    const air = ctx.createBufferSource();
    air.buffer = noise;
    air.loop = true;
    const airFilter = ctx.createBiquadFilter();
    airFilter.type = "bandpass";
    airFilter.frequency.value = 320;
    airFilter.Q.value = 0.6;
    const airGain = ctx.createGain();
    airGain.gain.value = 0.035;
    air.connect(airFilter).connect(airGain);
    airGain.connect(this.master);
    airGain.connect(reverb);
    const sweep = ctx.createOscillator();
    sweep.frequency.value = 0.03;
    const sweepDepth = ctx.createGain();
    sweepDepth.gain.value = 160;
    sweep.connect(sweepDepth).connect(airFilter.frequency);
    sweep.start();
    air.start();

    // Rise: thin pad plus noise, silent until the expansion drives it.
    this.riseFilter = ctx.createBiquadFilter();
    this.riseFilter.type = "lowpass";
    this.riseFilter.frequency.value = 500;
    const trem = ctx.createGain();
    trem.gain.value = 0.8;
    this.riseGain = ctx.createGain();
    this.riseGain.gain.value = 0;
    this.riseFilter.connect(trem).connect(this.riseGain);
    this.riseGain.connect(this.master);
    this.riseGain.connect(reverb);
    this.riseLfo = ctx.createOscillator();
    this.riseLfo.frequency.value = 0.2;
    const lfoDepth = ctx.createGain();
    lfoDepth.gain.value = 0.25;
    this.riseLfo.connect(lfoDepth).connect(trem.gain);
    this.riseLfo.start();
    [220, 329.63, 493.88].forEach((base, i) => {
      const osc = ctx.createOscillator();
      osc.type = i === 1 ? "triangle" : "sine";
      osc.frequency.value = base;
      const v = ctx.createGain();
      v.gain.value = [0.3, 0.18, 0.1][i];
      osc.connect(v).connect(this.riseFilter);
      osc.start();
      this.riseVoices.push({ osc, base });
    });
    const hiss = ctx.createBufferSource();
    hiss.buffer = noise;
    hiss.loop = true;
    this.riseNoiseFilter = ctx.createBiquadFilter();
    this.riseNoiseFilter.type = "bandpass";
    this.riseNoiseFilter.frequency.value = 600;
    this.riseNoise = ctx.createGain();
    this.riseNoise.gain.value = 0;
    hiss.connect(this.riseNoiseFilter).connect(this.riseNoise).connect(this.master);
    hiss.start();
  }

  private noiseBuffer(ctx: AudioContext) {
    const buf = ctx.createBuffer(1, ctx.sampleRate * 3, ctx.sampleRate);
    const d = buf.getChannelData(0);
    let last = 0;
    for (let i = 0; i < d.length; i++) {
      // Brown-ish noise: darker than white, closer to room tone.
      last = (last + 0.02 * (Math.random() * 2 - 1)) / 1.02;
      d[i] = last * 3.5;
    }
    return buf;
  }
}

let instance: DayfourSound | null = null;
export function getSound() {
  if (!instance) instance = new DayfourSound();
  return instance;
}
