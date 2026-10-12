"use client";

/*
 * DAYFOUR sound. The only audio on the site is the timeline's own:
 *
 *  scene  The slow timeline's audio (from its video), looped from the opening.
 *  rise   As the timeline expands into the fast footage, the same audio quickens.
 *         Once the expansion is done it fades out slowly and stays off; it comes
 *         back only if the visitor scrolls back up into the scene.
 *
 * Browsers only allow sound after a tap or key press, so nothing plays until the
 * first gesture. The toggle in the corner can turn it off again.
 */

type Listener = (on: boolean) => void;

const LEVEL = 0.9;
const FADE_IN = 1.5;
const FADE_OUT = 5;

class DayfourSound {
  private ctx: AudioContext | null = null;
  private master!: GainNode;
  private sceneGain!: GainNode;
  private sceneSource: AudioBufferSourceNode | null = null;
  // The slow timeline is on screen from the opening, so its audio starts with the page.
  private sceneOn = true;
  private rate = 1;
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
    this.master.gain.linearRampToValueAtTime(on ? 1 : 0, t + (on ? 2 : 0.4));
    this.listeners.forEach((fn) => fn(on));
  }

  /** The timeline audio: on while the timeline is showing, fading out slowly after. */
  scene(active: boolean) {
    if (active === this.sceneOn) return;
    this.sceneOn = active;
    if (!this.ctx) return;
    const t = this.ctx.currentTime;
    const g = this.sceneGain.gain;
    g.cancelScheduledValues(t);
    g.setValueAtTime(g.value, t);
    g.linearRampToValueAtTime(active ? LEVEL : 0, t + (active ? FADE_IN : FADE_OUT));
  }

  /** 0..1 from the timeline expansion: the audio quickens with the fast footage. */
  rise(p: number) {
    const q = p * p;
    this.rate = 1 + q * 0.6;
    if (this.ctx) this.sceneSource?.playbackRate.setTargetAtTime(this.rate, this.ctx.currentTime, 0.15);
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

    this.sceneGain = ctx.createGain();
    this.sceneGain.gain.value = 0;
    this.sceneGain.connect(this.master);
    fetch("/assets/audio/timeline-slow.m4a")
      .then((r) => r.arrayBuffer())
      .then((data) => ctx.decodeAudioData(data))
      .then((buffer) => {
        const src = ctx.createBufferSource();
        src.buffer = buffer;
        src.loop = true;
        src.playbackRate.value = this.rate;
        src.connect(this.sceneGain);
        src.start();
        this.sceneSource = src;
      })
      .catch(() => {});
    if (this.sceneOn) this.sceneGain.gain.linearRampToValueAtTime(LEVEL, ctx.currentTime + FADE_IN);
  }
}

let instance: DayfourSound | null = null;
export function getSound() {
  if (!instance) instance = new DayfourSound();
  return instance;
}
