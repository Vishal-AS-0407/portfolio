/* The cardiac clock. One phase drives the flesh, the pistons, the vessels'
   glow, the valve, the swarm's pressure wave and the site's field kick.

     atrial kick   A(φ) = pulse(φ, .06, .05)
     ventricular   V(φ) = pulse(φ, .20, .09) + .35 · pulse(φ, .36, .07)    lub … dub
*/
const pulse = (x: number, c: number, w: number) => {
  const d = (x - c) / w;
  return Math.exp(-d * d);
};

export class Cardiac {
  phase = 0.55;
  bpm = 64;
  target = 64;
  /** extra amplitude from a click; decays */
  boost = 0;
  A = 0;
  V = 0;
  /** seconds since the last ventricular peak — drives the vessel wave */
  sincePeak = 9;
  /** false under reduced motion: the heart rests until a click beats it once */
  auto = true;
  onPeak: ((strength: number) => void) | null = null;
  onAtrial: (() => void) | null = null;

  tick(dt: number) {
    this.bpm += (this.target - this.bpm) * Math.min(1, 1.6 * dt);
    const prev = this.phase;
    if (this.auto || this.phase < 1) this.phase += (dt * this.bpm) / 60;
    if (this.phase >= 1) this.phase = this.auto ? this.phase - 1 : 1;
    this.boost *= Math.exp(-dt * 1.4);
    const a = 1 + this.boost;
    const ph = this.phase;
    this.A = pulse(ph, 0.06, 0.05) * a;
    this.V = (pulse(ph, 0.2, 0.09) + 0.35 * pulse(ph, 0.36, 0.07)) * a;
    this.sincePeak += dt;
    const crossed = (c: number) => (prev < c && ph >= c) || (prev > ph && ph >= c);
    if (crossed(0.2)) {
      this.sincePeak = 0;
      this.onPeak?.(a);
    }
    if (crossed(0.05)) this.onAtrial?.();
  }

  /** a beat right now, `strength` above normal */
  kick(strength = 1) {
    this.phase = 0.02;
    this.boost = Math.max(this.boost, strength);
  }
}
