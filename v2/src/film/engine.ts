/* Composes one frame of the film from f (scroll) and t (clock).
   Back to front: sky → far planes → ridge → ground and set → the cast →
   the heart and the kite → sparks → foreground → cuts and flashes.
   docs/design/inheritance-film.md §5–6 */
import { GRADES, lerpGrade, css, mix, hex, HEART, HEART_CORE, KITE, BOW, HOT, type Grade, type RGB } from './grade';
import { fk, ground, bonePoints, drawFigure, cavity, type Joints, type Pt, type Skin, type Weapon } from './cast';
import {
  buildScript, sampleField, samplePose, sampleCamera, step, shotAt, localU, SHOTS, GRADE_KEYS, WAR_SPLIT, AGAIN_SPLIT, EASE,
  type Actor, type Ev,
} from './script';
import {
  plane, eraAt, drawSky, drawFar, drawRidge, drawGround, drawSet, drawBattlefield, drawFore, drawAir, drawVolley, drawCrows,
  h1, band, type View,
} from './world';

type Ctx = CanvasRenderingContext2D;
type S = [number, number];
const TAU = Math.PI * 2;
const sat = (v: number) => (v < 0 ? 0 : v > 1 ? 1 : v);

export function sampleGrade(f: number): Grade {
  let i = 0;
  while (i < GRADE_KEYS.length - 1 && GRADE_KEYS[i + 1][0] <= f) i++;
  const a = GRADE_KEYS[i], b = GRADE_KEYS[i + 1];
  if (!b || b[0] === a[0]) return GRADES[a[1]];
  return lerpGrade(GRADES[a[1]], GRADES[b[1]], EASE.io((f - a[0]) / (b[0] - a[0])));
}

type Spark = { x: number; y: number; vx: number; vy: number; life: number; max: number; c: RGB };
type Placed = { a: Actor; j: Joints; ox: number; oy: number; sc: number; face: number; M: (q: Pt) => S; U: number };

export function createFilm() {
  const { actors, ev } = buildScript();
  let lastF = -1, shake = 0, flash = 0, flashCol: RGB = [255, 255, 255];
  const sparks: Spark[] = [];

  const fire = (e: Ev, reduced: boolean) => {
    const big = e.k === 'strike' || e.k === 'clang';
    flash = Math.max(flash, e.k === 'strike' ? 1 : e.k === 'clang' ? 0.55 : e.k === 'weld' ? 0.3 : e.k === 'hit' ? 0.18 : 0.08);
    flashCol = e.k === 'weld' ? [230, 236, 255] : e.k === 'strike' ? [255, 255, 250] : [255, 230, 190];
    shake = Math.max(shake, big ? 1 : e.k === 'hit' ? 0.6 : e.k === 'weld' ? 0.18 : 0.1);
    if (reduced) return;
    const n = { strike: 26, clang: 20, weld: 16, spark: 9, hit: 0, tap: 0 }[e.k];
    for (let i = 0; i < n; i++) {
      const a = Math.random() * TAU, sp = 0.6 + Math.random() * (big ? 2.4 : 1.4);
      const life = 0.3 + Math.random() * 0.45;
      sparks.push({ x: e.x, y: e.y, vx: Math.cos(a) * sp, vy: Math.abs(Math.sin(a)) * sp * 1.1 + 0.3, life, max: life, c: Math.random() < 0.5 ? HEART_CORE : e.k === 'weld' ? [220, 230, 255] : HOT });
    }
  };

  /** place an actor at film position f: joints, transform, scale */
  const place = (a: Actor, f: number, v: View): Placed | null => {
    if (sampleField(a.keys, 'vis', f, 1) < 0.5) return null;
    const ax = sampleField(a.keys, 'x', f, 0);
    const face = sampleField(a.keys, 'face', f, 1);
    const pose = samplePose(a.keys, f, ax).slice();
    if (!v.reduced) {
      pose[0] += Math.sin(v.t * 1.7 + ax) * 0.012;
      pose[1] += Math.sin(v.t * 0.9 + ax * 2) * 0.01;
    }
    const j = fk(pose, face);
    const lift = ground(j);
    const sc = a.scale;
    const pl = plane(v, 1);
    const U = pl.kd * sc;
    const M = (q: Pt): S => [pl.X(ax + q.x * sc), pl.Y((q.y + lift) * sc)];
    return { a, j, ox: ax, oy: lift, sc, face, M, U };
  };
  const world = (p: Placed, q: Pt): Pt => ({ x: p.ox + q.x * p.sc, y: (q.y + p.oy) * p.sc });

  const tipOf = (p: Placed, weapon: Weapon, grip: number): { hand: S; tip: S } | null => {
    const hand = p.M(p.j.handL), el = p.M(p.j.elbowL);
    let d: S = [hand[0] - el[0], hand[1] - el[1]];
    const l = Math.hypot(d[0], d[1]) || 1;
    d = [d[0] / l, d[1] / l];
    const machine = p.a.look === 'prime' || p.a.look === 'drone';
    if (machine) return p.a.look === 'prime' ? { hand, tip: [hand[0] + d[0] * 0.62 * p.U, hand[1] + d[1] * 0.62 * p.U] } : null;
    if (weapon !== 'blade' && weapon !== 'hammer') return null;
    const a = -grip * p.face, c = Math.cos(a), s = Math.sin(a);
    d = [d[0] * c - d[1] * s, d[0] * s + d[1] * c];
    const L = weapon === 'blade' ? 0.5 : 0.33;
    return { hand, tip: [hand[0] + d[0] * L * p.U, hand[1] + d[1] * L * p.U] };
  };

  function draw(x: Ctx, W: number, H: number, f: number, t: number, dt: number, still = false, bones = false) {
    const g = sampleGrade(f);
    const cam = sampleCamera(f);
    const k = Math.min((cam.g * H) / cam.h, W / cam.w);
    const kRef = Math.min((H * 0.8) / 3.2, W / 3.8);
    const gy = cam.g * H;
    const hy = Math.max(H * 0.1, Math.min(gy - 4, gy - cam.eh * k));
    const v: View = { W, H, k, kRef, cx: cam.x, gy, hy, t, f, reduced: still, g };
    const si = shotAt(f), u = localU(si, f);
    const era = eraAt(f);

    /* impacts fire only when scrolling forward through them */
    if (!still) {
      if (lastF >= 0 && f > lastF && f - lastF < 0.03) for (const e of ev) if (lastF < e.f && f >= e.f) fire(e, still);
      lastF = f;
      shake *= Math.exp(-dt * 8);
      flash *= Math.exp(-dt * 11);
    }

    x.save();
    if (shake > 0.01 && !still) x.translate((Math.random() - 0.5) * 10 * shake, (Math.random() - 0.5) * 6 * shake);
    x.fillStyle = css(g.ink); x.fillRect(-20, -20, W + 40, H + 40);

    drawSky(x, v);
    drawFar(x, v, era);

    /* the ridge: houses always; armies in 3a / 8a; distant duels behind 3b / 8b */
    const inA = si === 2 && f < WAR_SPLIT, inB = si === 2 && f >= WAR_SPLIT;
    const in8a = si === 7 && f < AGAIN_SPLIT, in8b = si === 7 && f >= AGAIN_SPLIT;
    const armies = inA ? (f - SHOTS[2].f0) / (WAR_SPLIT - SHOTS[2].f0) : in8a ? (f - SHOTS[7].f0) / (AGAIN_SPLIT - SHOTS[7].f0) : 0;
    const duel = inB ? (f - WAR_SPLIT) / (SHOTS[2].f1 - WAR_SPLIT) : in8b ? (f - AGAIN_SPLIT) / (SHOTS[7].f1 - AGAIN_SPLIT) : -1;
    drawRidge(x, v, era, armies, si >= 7, duel);
    if (inA || in8a) drawVolley(x, v, armies, in8a);

    drawGround(x, v, era);
    const forge = [1, 1, 0.45, 0, 0.55, 0.3, 0, 0, 0][si];
    drawSet(x, v, era, forge);
    drawAir(x, v, era, { birds: si <= 1 ? 1 : 0, smoke: si <= 1 ? 1 : 0, ash: 0, embers: 0 });
    drawBattlefield(x, v, era);
    if (si === 3) drawCrows(x, v, band(0.45, 0.8, u));

    /* ── the cast ── */
    const placed: Record<string, Placed> = {};
    for (const a of actors) { const p = place(a, f, v); if (p) placed[a.id] = p; }

    /* the heart: inside him, in his hand, crossing, in the machine */
    let heart: { q: Pt; a: number; size: number; inside: boolean } | null = null;
    const sm = placed.smith, pr = placed.prime;
    if (si === 5 && sm) {
      const chest = world(sm, sm.j.chest), hand = world(sm, sm.j.handL);
      const cav = pr ? world(pr, cavity(pr.j, pr.face)) : hand;
      if (u >= 0.16 && u < 0.42) heart = { q: { x: chest.x + sm.face * 0.03, y: chest.y }, a: band(0.16, 0.4, u), size: 1, inside: true };
      else if (u >= 0.42 && u < 0.6) heart = { q: hand, a: 1, size: 1, inside: false };
      else if (u >= 0.6) {
        const c = EASE.io(band(0.6, 0.66, u));
        heart = { q: { x: hand.x + (cav.x - hand.x) * c, y: hand.y + (cav.y - hand.y) * c }, a: 1, size: 1, inside: false };
      }
    } else if (pr && si >= 6) {
      heart = { q: world(pr, cavity(pr.j, pr.face)), a: 1, size: 1, inside: false };
    }
    const beat = still ? 0.3 : Math.pow(Math.max(0, Math.sin(t * 6.4)), 14) + 0.55 * Math.pow(Math.max(0, Math.sin(t * 6.4 - 0.85)), 14);
    const pl1 = plane(v, 1);
    const heartS: S | null = heart ? [pl1.X(heart.q.x), pl1.Y(heart.q.y)] : null;
    const heartLight = heart && si === 5 ? heart.a * (heart.inside ? 0.5 : 1) : heart ? 0.45 : 0;

    /* where the light comes from, for the rim */
    const sunS: S = [g.sunX * W, hy - g.sunAlt * H];
    const lightAt: S = heartS && heartLight > 0.4 ? heartS : sunS;
    const rimCol = heartLight > 0.4 ? mix(g.rim, HEART, 0.7) : g.rim;

    /* heart glow lights the world before the cast is drawn over it */
    if (heartS && heartLight > 0) {
      const R = (0.75 + beat * 0.08) * pl1.kd;
      x.save(); x.globalCompositeOperation = 'lighter';
      const gr = x.createRadialGradient(heartS[0], heartS[1], 0, heartS[0], heartS[1], R * 2.2);
      gr.addColorStop(0, css(HEART, 0.42 * heartLight)); gr.addColorStop(0.4, css(HEART, 0.12 * heartLight)); gr.addColorStop(1, css(HEART, 0));
      x.fillStyle = gr; x.fillRect(heartS[0] - R * 2.2, heartS[1] - R * 2.2, R * 4.4, R * 4.4);
      x.restore();
    }

    const order = ['prime', 'drone', 'rival', 'child', 'smith'];
    for (const id of order) {
      const p = placed[id];
      if (!p) continue;
      const a = p.a;
      const dis = sampleField(a.keys, 'dis', f, 0);
      const fade = sampleField(a.keys, 'fade', f, 0);
      const weapon = step(a.weapon, f);
      const grip = sampleField(a.keys, 'grip', f, 0.3);
      const ink = mix(g.ink, g.haze, fade * 0.65);
      const back = mix(ink, g.haze, 0.2);
      const skin: Skin = {
        look: a.look, ink: css(ink), back: css(back), weapon, grip,
        helmet: a.helmet ? step(a.helmet, f) : false, t: still ? 0 : t,
        seam: sampleField(a.keys, 'seam', f, 0), eye: sampleField(a.keys, 'eye', f, 0), seamCol: css(HEART), eyeCol: '#DE4968',
        build: sampleField(a.keys, 'build', f, 1), heat: weapon === 'blade' ? sampleField(a.keys, 'heat', f, 0) : 0, heatCol: css(HOT),
      };
      /* a smear behind a fast weapon: the tip's path over the last few frames */
      const tp = tipOf(p, weapon, grip);
      if (tp && !still) {
        const trail: { hand: S; tip: S }[] = [tp];
        for (let i = 1; i <= 6; i++) {
          const q = place(a, f - i * 0.0012, v);
          const tq = q && tipOf(q, step(a.weapon, f - i * 0.0012), sampleField(a.keys, 'grip', f - i * 0.0012, 0.3));
          if (tq) trail.push(tq);
        }
        const last = trail[trail.length - 1];
        if (Math.hypot(last.tip[0] - tp.tip[0], last.tip[1] - tp.tip[1]) > p.U * 0.35) {
          for (let i = 1; i < trail.length; i++) {
            const A = trail[i - 1], Bq = trail[i];
            x.fillStyle = css(mix(rimCol, g.sun, 0.3), 0.4 * (1 - i / trail.length));
            x.beginPath();
            x.moveTo(A.hand[0], A.hand[1]); x.lineTo(A.tip[0], A.tip[1]); x.lineTo(Bq.tip[0], Bq.tip[1]); x.lineTo(Bq.hand[0], Bq.hand[1]);
            x.closePath(); x.fill();
          }
        }
      }
      const alpha = dis > 0 ? Math.pow(1 - sat(dis * 1.4), 1.5) : 1;
      if (alpha > 0.01) {
        x.save();
        x.globalAlpha = alpha;
        /* rim pass: the silhouette in light, nudged toward the light; then the ink over it */
        const c0 = p.M(p.j.chest);
        let dx = lightAt[0] - c0[0], dy = lightAt[1] - c0[1];
        const dl = Math.hypot(dx, dy) || 1;
        const off = Math.max(1.1, p.U * 0.012);
        dx = (dx / dl) * off; dy = (dy / dl) * off;
        const rimSkin: Skin = { ...skin, ink: css(rimCol, 0.9), back: css(rimCol, 0.55), heat: 0, seam: 0, eye: 0 };
        drawFigure(x, p.j, (q) => { const s = p.M(q); return [s[0] + dx, s[1] + dy]; }, p.U, p.face, rimSkin);
        drawFigure(x, p.j, p.M, p.U, p.face, skin);
        x.restore();
      }
      if (dis > 0) {
        /* he comes apart into embers, lifting downwind */
        x.save(); x.globalCompositeOperation = 'lighter';
        const pts = bonePoints(p.j, 150);
        pts.forEach((q, i) => {
          const r1 = h1(i * 1.7), r2 = h1(i * 2.9 + 4);
          const d = Math.max(0, dis * 1.3 - r1 * 0.3);
          if (d <= 0 || d >= 1) return;
          const w = world(p, q);
          const sway = still ? 0 : Math.sin(i + t * 2.3) * 0.04 * d;
          const s = [pl1.X(w.x - d * (0.4 + r1 * 2.2) + sway), pl1.Y(w.y + d * (0.3 + r2 * 1.6))];
          x.fillStyle = css(mix(HEART, HEART_CORE, r2), (1 - d) * 0.95);
          const z = 1.5 + r1 * 2.2;
          x.fillRect(s[0], s[1], z, z);
        });
        x.restore();
      }
      if (bones) {
        x.fillStyle = '#DE4968';
        for (const kk of Object.keys(p.j) as (keyof Joints)[]) { const s = p.M(p.j[kk]); x.fillRect(s[0] - 2, s[1] - 2, 4, 4); }
      }
    }

    /* the blade lying in the mud between the duel and the ash */
    const rv = placed.rival;
    if (f >= SHOTS[2].f0 + (SHOTS[2].f1 - SHOTS[2].f0) * (0.375 + 0.74 * 0.625) && f < SHOTS[3].f0 + 0.038 * 1) {
      const bx = pl1.X(2.62), by = gy - 0.02 * pl1.kd, L = 0.5 * pl1.kd;
      x.save(); x.translate(bx, by); x.rotate(-0.06);
      x.fillStyle = css(g.ink); x.fillRect(-L * 0.12, -0.012 * pl1.kd, L * 1.1, 0.025 * pl1.kd);
      x.fillStyle = css(g.rim, 0.6); x.fillRect(0, -0.014 * pl1.kd, L, 1);
      x.restore();
    }
    /* the stray arrow: flies in, then stays in his back */
    if (rv && (si === 2 || si === 3)) {
      const hitF = SHOTS[2].f0 + (SHOTS[2].f1 - SHOTS[2].f0) * (0.375 + 0.69 * 0.625);
      const back = world(rv, rv.j.chest);
      const fly = (hitF - f) / 0.006;
      if (si === 2 && fly > 0 && fly < 1) {
        const ax = back.x + fly * 2.6, ay = back.y + fly * 1.6;
        const s0: S = [pl1.X(ax), pl1.Y(ay)], s1: S = [pl1.X(ax + 0.35), pl1.Y(ay + 0.22)];
        x.strokeStyle = css(g.ink); x.lineWidth = Math.max(1.2, pl1.kd * 0.01);
        x.beginPath(); x.moveTo(s0[0], s0[1]); x.lineTo(s1[0], s1[1]); x.stroke();
      } else if (f >= hitF) {
        const s0: S = [pl1.X(back.x - 0.04 * rv.face), pl1.Y(back.y)];
        const s1: S = [s0[0] + 0.28 * pl1.kd * 0.85, s0[1] - 0.28 * pl1.kd * 0.5];
        x.strokeStyle = css(g.ink); x.lineWidth = Math.max(1.2, pl1.kd * 0.01);
        x.beginPath(); x.moveTo(s0[0], s0[1]); x.lineTo(s1[0], s1[1]); x.stroke();
        x.fillStyle = css(g.ink);
        x.beginPath(); x.moveTo(s1[0], s1[1]); x.lineTo(s1[0] + 6, s1[1] - 8); x.lineTo(s1[0] + 9, s1[1] - 1); x.fill();
      }
    }

    /* the heart itself */
    if (heart && heartS && !heart.inside) {
      const r = 0.052 * pl1.kd * (1 + beat * 0.16);
      const [hx, hy2] = heartS;
      x.save();
      x.globalCompositeOperation = 'lighter';
      const gl = x.createRadialGradient(hx, hy2, 0, hx, hy2, r * 4);
      gl.addColorStop(0, css(HEART_CORE, 0.55)); gl.addColorStop(1, css(HEART, 0));
      x.fillStyle = gl; x.fillRect(hx - r * 4, hy2 - r * 4, r * 8, r * 8);
      x.restore();
      const hg = x.createRadialGradient(hx - r * 0.3, hy2 - r * 0.4, 0, hx, hy2, r * 1.4);
      hg.addColorStop(0, css(HEART_CORE)); hg.addColorStop(0.6, css(HEART)); hg.addColorStop(1, css(mix(HEART, hex('#DE4968'), 0.5)));
      x.fillStyle = hg;
      x.beginPath();
      x.moveTo(hx, hy2 + r * 0.95);
      x.bezierCurveTo(hx - r * 1.7, hy2 - r * 0.1, hx - r * 0.75, hy2 - r * 1.35, hx, hy2 - r * 0.45);
      x.bezierCurveTo(hx + r * 0.75, hy2 - r * 1.35, hx + r * 1.7, hy2 - r * 0.1, hx, hy2 + r * 0.95);
      x.fill();
      /* the vessels it was torn from */
      if (si === 5 && u < 0.66) {
        x.strokeStyle = css(HEART, 0.8); x.lineWidth = Math.max(1, r * 0.18);
        x.beginPath(); x.moveTo(hx - r * 0.2, hy2 - r * 0.7); x.quadraticCurveTo(hx - r * 0.5, hy2 - r * 1.6, hx - r * 0.1, hy2 - r * 1.9); x.stroke();
        x.beginPath(); x.moveTo(hx + r * 0.25, hy2 - r * 0.75); x.quadraticCurveTo(hx + r * 0.7, hy2 - r * 1.4, hx + r * 0.45, hy2 - r * 1.7); x.stroke();
      }
    } else if (heart && heartS && heart.inside) {
      /* light leaking between his fingers */
      x.save(); x.globalCompositeOperation = 'lighter';
      const r = 0.12 * pl1.kd * (0.6 + heart.a * 0.6) * (1 + beat * 0.2);
      const gl = x.createRadialGradient(heartS[0], heartS[1], 0, heartS[0], heartS[1], r);
      gl.addColorStop(0, css(HEART_CORE, 0.8 * heart.a)); gl.addColorStop(1, css(HEART, 0));
      x.fillStyle = gl; x.fillRect(heartS[0] - r, heartS[1] - r, r * 2, r * 2);
      for (let i = 0; i < 5; i++) {
        const a = -Math.PI / 2 + (i - 2) * 0.32 + Math.sin(t + i) * 0.04;
        x.strokeStyle = css(HEART_CORE, 0.25 * heart.a); x.lineWidth = 1.2;
        x.beginPath(); x.moveTo(heartS[0], heartS[1]); x.lineTo(heartS[0] + Math.cos(a) * r * 2.2, heartS[1] + Math.sin(a) * r * 2.2); x.stroke();
      }
      x.restore();
    }

    /* the kite: on its string (1–2), lost to the sky (2), returned (9) */
    const kite = kiteAt(f, si, u, placed, t, still);
    if (kite) {
      const ks: S = [pl1.X(kite.q.x), pl1.Y(kite.q.y)];
      if (kite.from) {
        const hs: S = [pl1.X(kite.from.x), pl1.Y(kite.from.y)];
        x.strokeStyle = css(g.ink, 0.7); x.lineWidth = 1;
        x.beginPath(); x.moveTo(hs[0], hs[1]); x.quadraticCurveTo((hs[0] + ks[0]) / 2 + 10, (hs[1] + ks[1]) / 2 + 26, ks[0], ks[1] + 0.1 * pl1.kd); x.stroke();
      } else if (kite.loose > 0) {
        x.strokeStyle = css(g.ink, 0.6); x.lineWidth = 1;
        x.beginPath(); x.moveTo(ks[0], ks[1] + 0.1 * pl1.kd);
        for (let i = 1; i <= 8; i++) x.lineTo(ks[0] + i * 0.05 * pl1.kd + Math.sin(t * 3 + i) * 3, ks[1] + 0.1 * pl1.kd + i * 0.07 * pl1.kd);
        x.stroke();
      }
      drawKite(x, ks, pl1.kd * 0.95, kite.tilt, t, still, g);
    }

    /* sparks */
    for (let i = sparks.length - 1; i >= 0; i--) {
      const s = sparks[i];
      s.life -= dt;
      if (s.life <= 0) { sparks.splice(i, 1); continue; }
      s.vy -= 6 * dt; s.x += s.vx * dt; s.y += s.vy * dt;
      if (s.y < 0) { s.y = 0; s.vy *= -0.35; s.vx *= 0.6; }
      const sp: S = [pl1.X(s.x), pl1.Y(s.y)];
      const a = s.life / s.max;
      x.save(); x.globalCompositeOperation = g.tone ? 'source-over' : 'lighter';
      x.strokeStyle = css(s.c, a); x.lineWidth = 1.6;
      x.beginPath(); x.moveTo(sp[0], sp[1]); x.lineTo(sp[0] - s.vx * 6, sp[1] + s.vy * 6); x.stroke();
      x.restore();
    }

    drawAir(x, v, era, { birds: 0, smoke: 0, ash: si === 3 ? 1 : si === 4 ? 0.25 : 0, embers: si === 2 ? 0.9 : si === 6 && u > 0.6 ? 0.25 : 0 });
    drawFore(x, v, era);
    x.restore();

    /* dips at the cuts, the opening fade-up and the closing fade-out */
    let dip = 0;
    for (let i = 1; i < SHOTS.length; i++) dip = Math.max(dip, 1 - Math.abs(f - SHOTS[i].f0) / 0.0035);
    dip = Math.max(dip, 1 - sat(f / 0.022), band(0.955, 0.995, f));
    if (dip > 0.002) { x.fillStyle = `rgba(5,4,5,${sat(dip).toFixed(3)})`; x.fillRect(0, 0, W, H); }
    if (flash > 0.02 && !still) { x.fillStyle = css(flashCol, Math.min(0.85, flash * 0.6)); x.fillRect(0, 0, W, H); }
    return { si, u, tone: g.tone };
  }

  return { draw };
}

/* ── the kite ── */
function kiteAt(f: number, si: number, u: number, placed: Record<string, Placed>, t: number, still: boolean):
  { q: Pt; from: Pt | null; tilt: number; loose: number } | null {
  const sway = still ? 0 : Math.sin(t * 1.3) * 0.06;
  const tilt = still ? -0.25 : -0.25 + Math.sin(t * 1.1) * 0.12;
  const ch = placed.child;
  const hand = (p: Placed, k: keyof Joints): Pt => ({ x: p.ox + p.j[k].x * p.sc, y: (p.j[k].y + p.oy) * p.sc });
  if ((si === 0 || (si === 1 && u < 0.6)) && ch) {
    const h = hand(ch, 'handL');
    return { q: { x: h.x - 1.05 + sway, y: h.y + 1.35 + sway * 0.6 }, from: h, tilt, loose: 0 };
  }
  if (si === 1 && ch) {
    const s = (u - 0.6) / 0.4;
    const h = hand(ch, 'handL');
    const q0 = { x: h.x - 1.05, y: h.y + 1.35 };
    return { q: { x: q0.x - s * 1.4 + Math.sin(s * 5) * 0.12, y: q0.y + s * s * 2.6 + s * 0.4 }, from: null, tilt: tilt + s * 1.2, loose: 1 };
  }
  const pr = placed.prime;
  if (si === 8 && pr) {
    const h = hand(pr, 'handR');
    const rest = { x: h.x - 0.55 + sway, y: h.y + 0.75 + sway * 0.5 };
    if (u < 0.44) {
      const s = EASE.out(u / 0.44);
      return { q: { x: rest.x - 0.9 * (1 - s) + Math.sin(s * 7) * 0.15 * (1 - s), y: rest.y + 2.6 * (1 - s) }, from: null, tilt: tilt + (1 - s) * 0.9, loose: 1 };
    }
    return { q: rest, from: h, tilt, loose: 0 };
  }
  return null;
}

function drawKite(x: Ctx, s: S, u: number, tilt: number, t: number, still: boolean, g: Grade) {
  const w = 0.11 * u, h = 0.16 * u;
  x.save(); x.translate(s[0], s[1]); x.rotate(tilt);
  x.fillStyle = css(KITE);
  x.beginPath(); x.moveTo(0, -h); x.lineTo(w, -h * 0.25); x.lineTo(0, h); x.lineTo(-w, -h * 0.25); x.closePath(); x.fill();
  x.strokeStyle = css(mix(KITE, BOW, 0.5), 0.9); x.lineWidth = 1;
  x.beginPath(); x.moveTo(0, -h); x.lineTo(0, h); x.moveTo(-w, -h * 0.25); x.lineTo(w, -h * 0.25); x.stroke();
  /* tail with bows, trailing downwind */
  x.strokeStyle = css(g.ink, 0.6);
  x.beginPath(); x.moveTo(0, h);
  const pts: S[] = [];
  for (let i = 1; i <= 7; i++) {
    const px = Math.sin((still ? 0 : t * 4) - i * 0.8) * 0.03 * u + i * 0.012 * u, py = h + i * 0.045 * u;
    x.lineTo(px, py); pts.push([px, py]);
  }
  x.stroke();
  x.fillStyle = css(BOW);
  for (const [i, p] of pts.entries()) {
    if (i % 2) continue;
    x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(p[0] - 0.02 * u, p[1] - 0.012 * u); x.lineTo(p[0] - 0.02 * u, p[1] + 0.012 * u);
    x.moveTo(p[0], p[1]); x.lineTo(p[0] + 0.02 * u, p[1] - 0.012 * u); x.lineTo(p[0] + 0.02 * u, p[1] + 0.012 * u); x.fill();
  }
  x.restore();
}
