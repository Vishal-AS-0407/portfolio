/* Sound, synthesised — no files. Off until the visitor turns it on; the
   AudioContext is only created on that first click.
   docs/design/biomech-and-inheritance.md §5 */

export type Sound = {
  enabled: () => boolean;
  toggle: () => boolean;
  beat: (strength: number) => void;
  piston: () => void;
  steam: (len?: number) => void;
  clang: () => void;
  hold: (k: number) => void;
  blast: () => void;
  dispose: () => void;
};

export function createSound(): Sound {
  let ctx: AudioContext | null = null;
  let master: GainNode | null = null;
  let on = false;
  let noiseBuf: AudioBuffer | null = null;
  let riser: { o: OscillatorNode; f: BiquadFilterNode; g: GainNode } | null = null;

  const init = () => {
    if (ctx) return;
    const AC = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    ctx = new AC();
    master = ctx.createGain();
    master.gain.value = 0.55;
    const comp = ctx.createDynamicsCompressor();
    master.connect(comp).connect(ctx.destination);
    noiseBuf = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
    const d = noiseBuf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
  };

  const env = (g: GainNode, t: number, a: number, peak: number, rel: number) => {
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(peak, t + a);
    g.gain.exponentialRampToValueAtTime(0.0001, t + a + rel);
  };
  const noise = (t: number, len: number) => {
    const s = ctx!.createBufferSource();
    s.buffer = noiseBuf; s.loop = true;
    s.start(t); s.stop(t + len + 0.05);
    return s;
  };

  const thump = (t: number, f: number, gain: number) => {
    const o = ctx!.createOscillator(), g = ctx!.createGain(), lp = ctx!.createBiquadFilter();
    o.type = 'sine';
    o.frequency.setValueAtTime(f, t);
    o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.12);
    lp.type = 'lowpass'; lp.frequency.value = 180;
    env(g, t, 0.008, gain, 0.2);
    o.connect(lp).connect(g).connect(master!);
    o.start(t); o.stop(t + 0.3);
  };

  return {
    enabled: () => on,
    toggle() {
      init();
      on = !on;
      if (on) ctx!.resume();
      master!.gain.setTargetAtTime(on ? 0.55 : 0, ctx!.currentTime, 0.05);
      return on;
    },
    beat(strength) {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      const k = Math.min(1.6, 0.5 + strength * 0.4);
      thump(t, 58, 0.7 * k);
      thump(t + 0.16, 72, 0.45 * k);
    },
    piston() {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      const bp = ctx.createBiquadFilter(), g = ctx.createGain();
      bp.type = 'bandpass'; bp.frequency.value = 1800; bp.Q.value = 2;
      env(g, t, 0.003, 0.35, 0.05);
      noise(t, 0.08).connect(bp).connect(g).connect(master!);
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.type = 'triangle'; o.frequency.value = 340;
      env(og, t, 0.002, 0.12, 0.12);
      o.connect(og).connect(master!);
      o.start(t); o.stop(t + 0.2);
    },
    steam(len = 0.9) {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      const hp = ctx.createBiquadFilter(), g = ctx.createGain();
      hp.type = 'highpass'; hp.frequency.value = 2500;
      env(g, t, 0.05, 0.16, len);
      noise(t, len + 0.1).connect(hp).connect(g).connect(master!);
    },
    clang() {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      [1, 2.76, 5.4, 8.93].forEach((m, i) => {
        const o = ctx!.createOscillator(), g = ctx!.createGain();
        o.frequency.value = 420 * m;
        env(g, t, 0.002, 0.16 / (i + 1), 1.1 / (1 + i * 0.5));
        o.connect(g).connect(master!);
        o.start(t); o.stop(t + 1.3);
      });
    },
    hold(k) {
      if (!ctx || !on) {
        if (riser && k <= 0) { riser.o.stop(); riser = null; }
        return;
      }
      const t = ctx.currentTime;
      if (k > 0 && !riser) {
        const o = ctx.createOscillator(), f = ctx.createBiquadFilter(), g = ctx.createGain();
        o.type = 'sawtooth'; f.type = 'lowpass'; f.Q.value = 6; g.gain.value = 0;
        o.connect(f).connect(g).connect(master!);
        o.start();
        riser = { o, f, g };
      }
      if (riser) {
        riser.o.frequency.setTargetAtTime(40 + k * 100, t, 0.08);
        riser.f.frequency.setTargetAtTime(120 + k * 1400, t, 0.08);
        riser.g.gain.setTargetAtTime(k * 0.09, t, 0.06);
        if (k <= 0) { const r = riser; setTimeout(() => r.o.stop(), 300); riser = null; }
      }
    },
    blast() {
      if (!on || !ctx) return;
      const t = ctx.currentTime;
      const g = ctx.createGain(), lp = ctx.createBiquadFilter();
      lp.type = 'lowpass'; lp.frequency.setValueAtTime(3000, t); lp.frequency.exponentialRampToValueAtTime(200, t + 0.8);
      env(g, t, 0.004, 0.5, 0.9);
      noise(t, 1).connect(lp).connect(g).connect(master!);
      const o = ctx.createOscillator(), og = ctx.createGain();
      o.frequency.setValueAtTime(90, t); o.frequency.exponentialRampToValueAtTime(30, t + 0.9);
      env(og, t, 0.005, 0.8, 0.9);
      o.connect(og).connect(master!);
      o.start(t); o.stop(t + 1);
    },
    dispose() { riser?.o.stop(); ctx?.close(); },
  };
}
