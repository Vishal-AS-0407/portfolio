/* Free points — the only things in Descent that live on clock time:
   embers off the fire, rain, fireflies over the lake, sparks, the echoes
   breaking apart, and the traveller rising into the page's field. */

export type Kind = 'ember' | 'rain' | 'fly' | 'spark' | 'shard' | 'rise' | 'dust';
type Mote = { k: Kind; x: number; y: number; vx: number; vy: number; life: number; age: number; s: number; seed: number };

const MAX = 2400;

export function createMotes() {
  const pool: Mote[] = [];
  const add = (k: Kind, x: number, y: number, vx: number, vy: number, life: number, s: number) => {
    if (pool.length >= MAX) pool.shift();
    pool.push({ k, x, y, vx, vy, life, age: 0, s, seed: Math.random() });
  };
  function step(dt: number, wind: number, t: number) {
    for (let i = pool.length - 1; i >= 0; i--) {
      const m = pool[i];
      m.age += dt;
      if (m.age >= m.life) { pool.splice(i, 1); continue; }
      switch (m.k) {
        case 'ember': m.vx += (Math.sin(t * 3 + m.seed * 20) * 0.6 - wind * 0.4) * dt; m.vy += 0.15 * dt; break;
        case 'rain': break;
        case 'fly': m.vx = Math.sin(t * 0.9 + m.seed * 40) * 0.35; m.vy = Math.cos(t * 1.3 + m.seed * 30) * 0.18; break;
        case 'spark': m.vy -= 9 * dt; m.vx *= 1 - 1.5 * dt; break;
        case 'shard': m.vx *= 1 - 1.8 * dt; m.vy = m.vy * (1 - 1.8 * dt) + 0.9 * dt; break;
        case 'rise': m.vx += Math.sin(t * 1.4 + m.seed * 9) * 0.25 * dt - wind * 0.08 * dt; m.vy += 0.5 * dt; break;
        case 'dust': m.vx *= 1 - 2.5 * dt; m.vy = m.vy * (1 - 2.5 * dt) + 0.1 * dt; break;
      }
      m.x += m.vx * dt; m.y += m.vy * dt;
    }
  }
  return { pool, add, step, clear: () => { pool.length = 0; } };
}
export type Motes = ReturnType<typeof createMotes>;
