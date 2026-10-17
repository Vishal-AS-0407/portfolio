/* Inheritance — a nine-scene shadow-puppet story along the bottom edge of the
   screen, scrubbed by the page's scroll. Canvas 2D, one draw per frame from
   the site's spine, nothing when collapsed or off-route.
   docs/design/biomech-and-inheritance.md §9 */
import { useEffect, useRef, useState } from 'react';
import { onFrame, ss, prefersReduced } from '@/lib/scroll';
import { fk, ground, drawHuman, drawMachine, bonePoints, type Joints, type Pt } from './rig';
import { buildScript, sampleField, samplePose, sampleCamera, sceneAt, CUTS, type Ev } from './script';

const KEY = 'story-collapsed';
const ls = {
  get: () => { try { return localStorage.getItem(KEY) === '1'; } catch { return false; } },
  set: (v: boolean) => { try { localStorage.setItem(KEY, v ? '1' : '0'); } catch { /* private mode */ } },
};

/* seeded hash for scenery */
const h1 = (n: number) => { const s = Math.sin(n * 127.1 + 311.7) * 43758.5453; return s - Math.floor(s); };

const MACHINE = '#5E6159', JOINT = '#3A3D34', EYE = '#DE4968', HEART = '#FE9F6D';

export default function StoryBand() {
  const cv = useRef<HTMLCanvasElement>(null);
  const [collapsed, setCollapsed] = useState(ls.get);
  const [slug, setSlug] = useState('SC 01 · LIFE');
  const colRef = useRef(collapsed);
  colRef.current = collapsed;

  useEffect(() => {
    const c = cv.current;
    if (!c) return;
    const x = c.getContext('2d')!;
    const reduced = prefersReduced();
    const S = buildScript();
    const qs = new URLSearchParams(location.search);
    const freeze = qs.has('story') ? Number(qs.get('story')) : null;
    const bones = qs.get('bones') === '1';

    let W = 0, H = 0, dpr = 1;
    const size = () => {
      dpr = Math.min(2, window.devicePixelRatio || 1);
      W = c.clientWidth; H = c.clientHeight;
      c.width = Math.round(W * dpr); c.height = Math.round(H * dpr);
    };
    size();
    const ro = new ResizeObserver(size);
    ro.observe(c);

    /* impacts: flash, shake, sparks — triggered only when scrolling forward through them */
    let lastP = -1, flash = 0, shake = 0;
    type Spark = { x: number; y: number; vx: number; vy: number; life: number; c: string };
    const sparks: Spark[] = [];
    const fire = (e: Ev, at: Pt) => {
      const big = e.k === 'hit' || e.k === 'strike' || e.k === 'clang';
      flash = Math.max(flash, big ? 1 : 0.35);
      shake = Math.max(shake, big ? 1 : 0.4);
      if (reduced) return;
      const n = e.k === 'clang' || e.k === 'spark' ? 16 : e.k === 'strike' ? 10 : 0;
      for (let i = 0; i < n; i++) {
        sparks.push({ x: at.x, y: at.y, vx: (Math.random() - 0.5) * 3, vy: Math.random() * 2.4 + 0.4, life: 0.35 + Math.random() * 0.4, c: Math.random() < 0.5 ? '#FCFDBF' : HEART });
      }
    };

    let lastSlug = '';
    let lastT = performance.now();
    let fg = '239 239 231', lastInv: boolean | null = null;

    const off = onFrame(({ p: pScroll }) => {
      const now = performance.now();
      const dt = Math.min(0.05, (now - lastT) / 1000);
      lastT = now;
      const p = freeze ?? pScroll;
      const vis = freeze !== null ? 1 : ss(0.012, 0.03, p);
      c.style.opacity = vis.toFixed(3);
      const s0 = sceneAt(p);
      if (s0 !== lastSlug) { lastSlug = s0; setSlug(s0); }
      if (colRef.current || vis < 0.01 || !W) { lastP = p; return; }

      const inv = document.body.classList.contains('inv');
      if (inv !== lastInv) {
        lastInv = inv;
        fg = getComputedStyle(document.body).getPropertyValue('--fg').trim() || fg;
      }
      const bg = document.documentElement.style.getPropertyValue('--bg').trim() || '12 13 11';
      const FG = `rgb(${fg})`;
      const t = now / 1000;

      const s = H * 0.6;                         // px per body height
      const camX = sampleCamera(S.camera, p);
      const gy = H - 3;                          // ground line
      shake *= Math.exp(-dt * 9);
      flash *= Math.exp(-dt * 14);
      const shx = reduced ? 0 : (Math.random() - 0.5) * 5 * shake, shy = reduced ? 0 : (Math.random() - 0.5) * 3 * shake;
      const T = (rate: number) => (q: Pt): [number, number] => [(q.x - camX * rate) * s + W / 2 + shx, gy - q.y * s + shy];

      x.setTransform(dpr, 0, 0, dpr, 0, 0);
      x.clearRect(0, 0, W, H);

      /* ── far: skyline that turns from village to machine city ── */
      const themes = [
        1 - ss(0.14, 0.22, p),
        ss(0.14, 0.22, p) * (1 - ss(0.36, 0.44, p)),
        ss(0.36, 0.44, p) * (1 - ss(0.7, 0.78, p)),
        ss(0.7, 0.78, p),
      ];
      const tf = T(0.15);
      const span = W / s + 4;
      const fx0 = Math.floor(camX * 0.15 - span / 2) - 1;
      themes.forEach((w, th) => {
        if (w < 0.01) return;
        x.globalAlpha = w * 0.085;
        x.fillStyle = FG;
        for (let i = fx0; i < fx0 + span + 2; i++) {
          const r = h1(i * 7 + th * 101), r2 = h1(i * 13 + th * 57);
          const [px] = tf({ x: i + r * 0.4, y: 0 });
          const hh = (0.35 + r2 * 0.8) * s;
          const ww = (0.35 + r * 0.45) * s;
          if (th === 0) {               // huts and trees
            if (r < 0.55) {
              x.fillRect(px, gy - hh * 0.45, ww, hh * 0.45);
              x.beginPath(); x.moveTo(px - 4, gy - hh * 0.45); x.lineTo(px + ww / 2, gy - hh * 0.8); x.lineTo(px + ww + 4, gy - hh * 0.45); x.fill();
            } else {
              x.fillRect(px + ww / 2 - 1.5, gy - hh * 0.6, 3, hh * 0.6);
              x.beginPath(); x.arc(px + ww / 2, gy - hh * 0.7, ww * 0.38, 0, 6.29); x.fill();
            }
          } else if (th === 1) {        // broken posts, spears, a flag
            x.save(); x.translate(px, gy); x.rotate((r - 0.5) * 0.5);
            x.fillRect(-2, -hh, 4, hh);
            if (r2 > 0.7) { x.beginPath(); x.moveTo(2, -hh); x.lineTo(2 + ww * 0.6, -hh + 6 + r * 6); x.lineTo(2, -hh + 14); x.fill(); }
            x.restore();
          } else if (th === 2) {        // chimneys, sheds, a crane
            x.fillRect(px, gy - hh * 0.4, ww * 1.4, hh * 0.4);
            if (r > 0.4) x.fillRect(px + ww * 0.3, gy - hh * 1.15, ww * 0.22, hh * 1.15);
            if (r2 > 0.8) {
              x.fillRect(px + ww, gy - hh * 1.3, 3, hh * 1.3);
              x.fillRect(px + ww - ww * 0.8, gy - hh * 1.3, ww * 1.6, 3);
            }
          } else {                      // towers with lights
            const th2 = hh * (0.55 + r * 0.55);
            x.fillRect(px, gy - th2, ww * 0.7, th2);
            x.fillRect(px + ww * 0.33, gy - th2 - 10, 1.5, 10);
            x.save(); x.globalAlpha = w * 0.5 * (0.5 + 0.5 * Math.sin(t * 2 + i));
            x.fillStyle = EYE; x.fillRect(px + ww * 0.3, gy - th2 - 11, 3, 3);
            x.restore();
          }
        }
      });

      /* ── mid: rocks, posts, slack cables ── */
      const tm = T(0.4);
      x.globalAlpha = 0.22; x.fillStyle = FG; x.strokeStyle = FG; x.lineWidth = 1;
      const mx0 = Math.floor(camX * 0.4 - span / 2) - 1;
      for (let i = mx0; i < mx0 + span + 2; i++) {
        const r = h1(i * 3.3 + 9);
        const [px] = tm({ x: i * 1.0 + r * 0.6, y: 0 });
        if (r < 0.35) { x.beginPath(); x.ellipse(px, gy, 0.12 * s, 0.05 * s, 0, Math.PI, 0); x.fill(); }
        else if (r < 0.55) {
          x.fillRect(px, gy - 0.5 * s, 2, 0.5 * s);
          const [nx] = tm({ x: (i + 1) * 1.0 + h1((i + 1) * 3.3 + 9) * 0.6, y: 0 });
          x.beginPath(); x.moveTo(px + 1, gy - 0.48 * s); x.quadraticCurveTo((px + nx) / 2, gy - 0.3 * s, nx + 1, gy - 0.48 * s); x.stroke();
        }
      }
      x.globalAlpha = 1;
      /* the ground line itself */
      x.fillStyle = FG; x.globalAlpha = 0.18; x.fillRect(0, gy, W, 1); x.globalAlpha = 1;

      /* ── actors ── */
      const ta = T(1);
      const J: Record<string, { j: Joints; ox: number; oy: number; sc: number }> = {};
      const breathe = reduced ? 0 : Math.sin(t * 1.7);
      const actors = [...S.actors].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'machine' ? -1 : 1));
      for (const a of actors) {
        if (sampleField(a.keys, 'vis', p, 1) < 0.5) continue;
        const ax = sampleField(a.keys, 'x', p, 0);
        const face = sampleField(a.keys, 'face', p, 1);
        const pose = samplePose(a.keys, p, ax, t).slice();
        pose[0] += breathe * 0.015;
        if (a.kind === 'machine') pose[1] += Math.sin(t * 0.9 + ax) * 0.02 * (reduced ? 0 : 1);
        const j = fk(pose, face);
        const lift = ground(j) + sampleField(a.keys, 'y', p, 0);
        const sc = a.scale;
        const toW = (q: Pt): Pt => ({ x: ax + q.x * sc, y: (q.y + lift) * sc });
        const Tj = (q: Pt) => ta(toW(q));
        J[a.id] = { j, ox: ax, oy: lift, sc };
        const dis = sampleField(a.keys, 'dis', p, 0);
        const sz = s * sc;

        if (a.kind === 'human') {
          if (dis < 0.98) {
            /* the fallen stay where they fell, fading as the story moves on */
            const remains = pose[10] < -1 || pose[10] > 1 ? 1 - 0.55 * ss(0.3, 0.42, p) : 1;
            x.globalAlpha = Math.pow(1 - dis, 1.6) * remains;
            drawHuman(x, j, Tj, sz, FG);
            x.globalAlpha = 1;
          }
          if (dis > 0) {
            /* he comes apart in the site's own particle language */
            x.fillStyle = FG;
            const pts = bonePoints(j, 90);
            pts.forEach((q, i) => {
              const r1 = h1(i * 1.7), r2 = h1(i * 2.9 + 4);
              const d = Math.max(0, dis * 1.25 - r1 * 0.25);
              const w = toW(q);
              const [px, py] = ta({ x: w.x + d * (0.4 + r1 * 2.6) + Math.sin(i + t * 2) * 0.03 * d, y: w.y + d * (0.2 + r2 * 1.2) });
              x.globalAlpha = Math.max(0, (1 - d) * 0.9);
              x.fillRect(px, py, 2, 2);
            });
            x.globalAlpha = 1;
          }
        } else {
          drawMachine(x, j, Tj, sz, MACHINE, JOINT, EYE, sampleField(a.keys, 'eye', p, 0), face);
        }
        if (bones) {
          x.strokeStyle = '#DE4968'; x.lineWidth = 1;
          for (const k of Object.keys(j) as (keyof Joints)[]) { const [px, py] = Tj(j[k]); x.strokeRect(px - 2, py - 2, 4, 4); }
        }
      }

      /* ── props on the actors' plane ── */
      x.fillStyle = FG;
      if (p < 0.34) {
        /* forge: anvil and hearth, its fire drawn cold — only the heart is warm */
        const [ax0] = ta({ x: 6.35, y: 0 });
        x.fillRect(ax0 - 0.09 * s, gy - 0.2 * s, 0.18 * s, 0.2 * s);
        x.fillRect(ax0 - 0.17 * s, gy - 0.28 * s, 0.3 * s, 0.08 * s);
        const [hx] = ta({ x: 7.0, y: 0 });
        x.fillRect(hx, gy - 0.42 * s, 0.38 * s, 0.42 * s);
        x.fillRect(hx + 0.12 * s, gy - 0.95 * s, 0.12 * s, 0.55 * s);
        x.globalAlpha = 0.25 + (reduced ? 0 : 0.2 * Math.sin(t * 13) * Math.sin(t * 7));
        x.beginPath(); x.arc(hx + 0.19 * s, gy - 0.44 * s, 0.09 * s, Math.PI, 0); x.fill();
        x.globalAlpha = 1;
      }
      if (J.B && p < 0.34) {
        /* the beam: on B's shoulder, then dropped where the quarrel starts */
        const drop = ss(0.12, 0.13, p);
        const b = J.B;
        const sh = { x: b.ox + b.j.shoulder.x * b.sc, y: (b.j.shoulder.y + b.oy) * b.sc + 0.03 };
        const rest = { x: 3.9, y: 0.03 };
        const cx0 = sh.x + (rest.x - sh.x) * drop, cy0 = sh.y + (rest.y - sh.y) * drop;
        const ang = 0.08 * (1 - drop);
        const L = 0.62;
        const a0 = ta({ x: cx0 - Math.cos(ang) * L, y: cy0 - Math.sin(ang) * L });
        const a1 = ta({ x: cx0 + Math.cos(ang) * L, y: cy0 + Math.sin(ang) * L });
        x.strokeStyle = FG; x.lineCap = 'butt'; x.lineWidth = 0.05 * s;
        x.beginPath(); x.moveTo(a0[0], a0[1]); x.lineTo(a1[0], a1[1]); x.stroke();
      }
      if (p > 0.86) {
        /* machine city foreground */
        x.globalAlpha = 0.32 * ss(0.86, 0.93, p);
        x.fillStyle = MACHINE;
        for (let i = 0; i < 7; i++) {
          const r = h1(i * 5.1);
          const [px] = ta({ x: 19.5 + i * 0.85 + r * 0.3, y: 0 });
          x.fillRect(px, gy - (0.7 + r * 0.6) * s, (0.22 + r * 0.25) * s, (0.7 + r * 0.6) * s);
        }
        x.globalAlpha = 1;
      }

      /* ── the heart — the only warm thing in the story ── */
      const heartAt = (): { q: Pt; a: number } | null => {
        const jp = (id: string, k: keyof Joints): Pt | null => {
          const r = J[id];
          return r ? { x: r.ox + r.j[k].x * r.sc, y: (r.j[k].y + r.oy) * r.sc } : null;
        };
        if (p < 0.3) return null;
        if (p < 0.545) { const q = jp('B', 'chest'); return q ? { q, a: 0.28 * ss(0.3, 0.36, p) } : null; }
        if (p < 0.578) { const q = jp('B', 'handR'); return q ? { q, a: 0.3 + 0.7 * ss(0.545, 0.556, p) } : null; }
        const m = jp('M0', 'chest');
        if (p < 0.598) {
          const a = jp('B', 'handR'), k = ss(0.578, 0.598, p);
          if (!a || !m) return null;
          return { q: { x: a.x + (m.x - a.x) * k, y: a.y + (m.y - a.y) * k + Math.sin(k * Math.PI) * 0.18 }, a: 1 };
        }
        return m ? { q: m, a: 1 } : null;
      };
      const hp = heartAt();
      if (hp && hp.a > 0.01) {
        const [px, py] = ta(hp.q);
        const beat = reduced ? 0 : Math.pow(Math.max(0, Math.sin(t * 6.7)), 12) + 0.5 * Math.pow(Math.max(0, Math.sin(t * 6.7 - 0.9)), 12);
        const r = 0.05 * s * (1 + beat * 0.18);
        const g = x.createRadialGradient(px, py, 0, px, py, r * 5);
        g.addColorStop(0, `rgba(254,159,109,${0.55 * hp.a})`);
        g.addColorStop(1, 'rgba(254,159,109,0)');
        x.fillStyle = g;
        x.fillRect(px - r * 5, py - r * 5, r * 10, r * 10);
        x.globalAlpha = hp.a;
        x.fillStyle = HEART;
        x.beginPath();
        x.moveTo(px, py + r * 0.9);
        x.bezierCurveTo(px - r * 1.6, py - r * 0.1, px - r * 0.7, py - r * 1.3, px, py - r * 0.45);
        x.bezierCurveTo(px + r * 0.7, py - r * 1.3, px + r * 1.6, py - r * 0.1, px, py + r * 0.9);
        x.fill();
        x.globalAlpha = 1;
      }

      /* ── impacts ── */
      if (lastP >= 0 && p > lastP && p - lastP < 0.02) {
        for (const e of S.events) if (lastP < e.p && p >= e.p) fire(e, { x: e.x, y: 0.62 });
      }
      lastP = p;
      for (let i = sparks.length - 1; i >= 0; i--) {
        const k = sparks[i];
        k.life -= dt;
        if (k.life <= 0) { sparks.splice(i, 1); continue; }
        k.vy -= 6 * dt; k.x += k.vx * dt; k.y += k.vy * dt;
        if (k.y < 0) { k.y = 0; k.vy *= -0.3; }
        const [px, py] = ta(k);
        x.fillStyle = k.c; x.globalAlpha = Math.min(1, k.life * 3);
        x.fillRect(px, py, 2, 2);
      }
      x.globalAlpha = 1;

      /* ── fore: smoke that wipes across the scene cuts ── */
      for (const cut of CUTS) {
        const d = (p - cut) / 0.014;
        if (Math.abs(d) >= 1) continue;
        const w = 1 - Math.abs(d);
        x.fillStyle = `rgb(${bg})`;
        for (let i = 0; i < 16; i++) {
          const r = h1(i * 4.7 + cut * 100);
          const px = ((i / 16) - d * 0.9) * W * 1.6 - W * 0.3 + r * 60;
          const rad = (0.45 + r * 0.6) * H;
          x.globalAlpha = w * 0.94;
          x.beginPath(); x.arc(px, H * (0.35 + r * 0.6), rad, 0, 6.29); x.fill();
        }
        x.globalAlpha = 1;
      }

      if (flash > 0.02 && !reduced) {
        x.fillStyle = `rgba(252,253,191,${(flash * 0.35).toFixed(3)})`;
        x.fillRect(0, 0, W, H);
      }
    });

    return () => { off(); ro.disconnect(); };
  }, []);

  const toggle = () => {
    const v = !collapsed;
    setCollapsed(v);
    ls.set(v);
  };

  return (
    <div className="story" data-collapsed={collapsed ? '' : undefined}>
      <canvas ref={cv} className="story-cv" aria-hidden />
      <div className="story-bar mono">
        <button type="button" onClick={toggle} aria-expanded={!collapsed} data-cur>
          {collapsed ? '▸' : '▾'} story
        </button>
        <span aria-hidden>{slug}</span>
      </div>
      <span className="sr-only" aria-live="polite">{collapsed ? '' : slug}</span>
    </div>
  );
}
