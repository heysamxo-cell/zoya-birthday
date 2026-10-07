/**
 * A tiny generative "dreamy music box" engine built on the Web Audio API.
 * No audio files needed (so nothing to license or download) — a soft pad,
 * a gentle music-box melody and shimmering reverb, in a slow I–V–vi–IV loop.
 *
 * Want a real song instead? Set SITE.musicSrc in config.ts.
 */
import { SITE } from "./config";

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12);

// C – G – Am – F  (add9 colours)
const CHORDS = [
  { bass: 48, pad: [64, 67, 71, 74] },
  { bass: 43, pad: [62, 67, 71, 74] },
  { bass: 45, pad: [60, 64, 67, 71] },
  { bass: 41, pad: [60, 64, 69, 72] },
];

class DreamMusic {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private fx: GainNode | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private audioEl: HTMLAudioElement | null = null;
  private next = 0;
  private step = 0;
  private melodyIdx = 5;
  playing = false;

  private build() {
    if (this.ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    const ctx = new AC();
    this.ctx = ctx;
    const master = ctx.createGain();
    master.gain.value = 0;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    this.master = master;

    // reverb (generated impulse)
    const len = ctx.sampleRate * 3.4;
    const ir = ctx.createBuffer(2, len, ctx.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = ir.getChannelData(c);
      for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 2.6);
    }
    const conv = ctx.createConvolver();
    conv.buffer = ir;
    const wet = ctx.createGain();
    wet.gain.value = 0.55;
    conv.connect(wet).connect(master);

    // soft echo
    const delay = ctx.createDelay(1.5);
    delay.delayTime.value = 0.46;
    const fb = ctx.createGain();
    fb.gain.value = 0.32;
    const dl = ctx.createBiquadFilter();
    dl.type = "lowpass";
    dl.frequency.value = 2400;
    delay.connect(dl).connect(fb).connect(delay);
    dl.connect(conv);

    const fx = ctx.createGain();
    fx.connect(master); // dry
    fx.connect(conv);
    fx.connect(delay);
    this.fx = fx;
  }

  private pad(freq: number, t: number, dur: number, vol: number) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 1.4);
    g.gain.setValueAtTime(vol, t + dur - 0.6);
    g.gain.linearRampToValueAtTime(0, t + dur + 1.6);
    const lp = ctx.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.value = 1100;
    [-6, 6].forEach((det) => {
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = freq;
      o.detune.value = det;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 1.8);
    });
    lp.connect(g).connect(this.fx!);
  }

  private bell(freq: number, t: number, vol: number, long = 1.8) {
    const ctx = this.ctx!;
    const g = ctx.createGain();
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, t + long);
    [[1, 1], [2, 0.28], [4.01, 0.08]].forEach(([m, a]) => {
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.value = freq * m;
      const og = ctx.createGain();
      og.gain.value = a;
      o.connect(og).connect(g);
      o.start(t);
      o.stop(t + long + 0.1);
    });
    g.connect(this.fx!);
  }

  private schedule() {
    const ctx = this.ctx!;
    const beat = 60 / 62;
    while (this.next < ctx.currentTime + 0.5) {
      const bar = Math.floor(this.step / 8);
      const chord = CHORDS[bar % CHORDS.length];
      const sub = this.step % 8; // eighth notes
      const t = this.next;
      if (sub === 0) {
        const dur = beat * 4;
        this.pad(mtof(chord.bass), t, dur, 0.16);
        chord.pad.forEach((n, i) => this.pad(mtof(n), t + i * 0.08, dur, 0.055));
      }
      // melody random-walk over chord tones (+octave)
      const pool = [...chord.pad.map((n) => n + 12), ...chord.pad.map((n) => n + 24)].sort((a, b) => a - b);
      const playProb = sub % 2 === 0 ? 0.78 : 0.42;
      if (Math.random() < playProb) {
        const stepMove = [-2, -1, -1, 1, 1, 2][(Math.random() * 6) | 0];
        this.melodyIdx = Math.max(1, Math.min(pool.length - 2, this.melodyIdx + stepMove));
        this.bell(mtof(pool[this.melodyIdx]), t, sub === 0 ? 0.13 : 0.085);
      }
      if (sub === 4 && Math.random() < 0.35) this.bell(mtof(pool[pool.length - 1] + 12), t + beat * 0.25, 0.035, 2.4);
      this.next += beat / 2;
      this.step += 1;
    }
  }

  async start() {
    if (this.playing) return;
    this.playing = true;
    if (SITE.musicSrc) {
      if (!this.audioEl) {
        this.audioEl = new Audio(SITE.musicSrc);
        this.audioEl.loop = true;
      }
      this.audioEl.volume = 0;
      try {
        await this.audioEl.play();
      } catch {
        this.playing = false;
        return;
      }
      const a = this.audioEl;
      const iv = setInterval(() => {
        a.volume = Math.min(0.55, a.volume + 0.04);
        if (a.volume >= 0.55) clearInterval(iv);
      }, 80);
      return;
    }
    this.build();
    const ctx = this.ctx!;
    await ctx.resume();
    this.master!.gain.cancelScheduledValues(ctx.currentTime);
    this.master!.gain.setValueAtTime(this.master!.gain.value, ctx.currentTime);
    this.master!.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 2.2);
    this.next = ctx.currentTime + 0.1;
    this.step = 0;
    this.timer = setInterval(() => this.schedule(), 90);
  }

  stop() {
    if (!this.playing) return;
    this.playing = false;
    if (this.audioEl) {
      const a = this.audioEl;
      const iv = setInterval(() => {
        a.volume = Math.max(0, a.volume - 0.06);
        if (a.volume <= 0.01) {
          a.pause();
          clearInterval(iv);
        }
      }, 60);
      return;
    }
    const ctx = this.ctx;
    if (!ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(ctx.currentTime);
    this.master.gain.setValueAtTime(this.master.gain.value, ctx.currentTime);
    this.master.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.9);
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
    setTimeout(() => {
      if (!this.playing) ctx.suspend();
    }, 1400);
  }

  /** Little sparkle sound for interactions — only when the player has turned music on. */
  chime(kind: "up" | "soft" = "up") {
    if (!this.playing || !this.ctx || !this.fx || SITE.musicSrc) return;
    const t = this.ctx.currentTime + 0.01;
    const notes = kind === "up" ? [79, 83, 86, 91] : [86, 91];
    notes.forEach((n, i) => this.bell(mtof(n), t + i * 0.09, 0.07, 1.6));
  }
}

export const music = typeof window !== "undefined" ? new DreamMusic() : (null as unknown as DreamMusic);
export const chime = (k: "up" | "soft" = "up") => music?.chime(k);
