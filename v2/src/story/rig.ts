/* One skeleton for humans and machines, two skins.
   A pose is 11 angles (radians):
     [spine, neck, shL, elL, shR, elR, hipL, knL, hipR, knR, lean]
   spine/neck tilt forward from vertical; shoulders/hips swing forward from
   hanging straight down; elbows bend the forearm forward/up; knees bend the
   shin back; lean tips the whole body about the hip (±1.45 ≈ lying down).
   `face` (+1 / −1) mirrors everything. Units are body heights.
   docs/design/biomech-and-inheritance.md §9.3 */

export type Pose = number[];
export type Pt = { x: number; y: number };
export type Joints = {
  hip: Pt; chest: Pt; neck: Pt; head: Pt; shoulder: Pt;
  elbowL: Pt; handL: Pt; elbowR: Pt; handR: Pt;
  kneeL: Pt; footL: Pt; kneeR: Pt; footR: Pt;
};

export const B = { torso: 0.31, neck: 0.05, headR: 0.068, ua: 0.17, fa: 0.16, th: 0.245, sh: 0.245 };

/* key poses */
export const P: Record<string, Pose> = {
  stand:    [0.02, 0.00, 0.08, 0.12, -0.06, 0.14, 0.03, 0.05, -0.03, 0.04, 0],
  posture:  [-0.12, -0.12, -0.25, 0.5, -0.3, 0.5, 0.12, 0.05, -0.14, 0.05, 0],
  shove:    [0.32, 0.05, 1.5, 0.05, 1.45, 0.08, 0.35, 0.15, -0.35, 0.1, 0],
  stagger:  [-0.35, 0.3, -0.5, 0.6, -0.3, 0.8, 0.4, 0.5, -0.1, 0.2, 0],
  guard:    [0.14, -0.06, 0.62, 2.05, 0.38, 2.25, 0.32, 0.38, -0.26, 0.3, 0],
  jab:      [0.26, -0.04, 1.52, 0.06, 0.4, 2.2, 0.42, 0.25, -0.42, 0.32, 0],
  block:    [-0.08, 0.12, 0.95, 2.35, 0.9, 2.45, 0.22, 0.42, -0.24, 0.36, 0],
  hook:     [0.34, 0.0, 0.5, 2.1, 1.35, 1.35, 0.3, 0.4, -0.38, 0.22, 0],
  hit:      [-0.5, 0.45, -0.7, 0.4, -0.9, 0.3, 0.45, 0.35, -0.1, 0.5, -0.12],
  fallen:   [0.0, 0.25, 0.3, 0.3, -0.4, 0.5, 0.15, 0.3, -0.1, 0.4, -1.5],
  fallenF:  [0.0, -0.2, 2.6, 0.2, 2.9, 0.4, 0.1, 0.2, -0.2, 0.3, 1.5],
  kneel:    [0.3, 0.35, 0.25, 0.4, 0.15, 0.4, 1.45, 1.55, 0.05, 1.6, 0],
  lookUp:   [0.05, -0.45, 0.2, 0.3, 0.1, 0.3, 1.45, 1.55, 0.05, 1.6, 0],
  reachIn:  [0.1, 0.25, 0.15, 0.25, 0.45, 2.6, 0.05, 0.05, -0.05, 0.05, 0],
  offer:    [0.14, 0.15, 0.1, 0.2, 1.45, 0.12, 0.12, 0.08, -0.12, 0.08, 0],
  hammerUp: [0.2, 0.1, 0.4, 0.5, 2.6, 0.9, 0.12, 0.06, -0.12, 0.06, 0],
  hammerDn: [0.42, 0.25, 0.4, 0.5, 1.05, 0.25, 0.14, 0.12, -0.12, 0.08, 0],
  carry:    [0.08, 0.0, 0.1, 0.2, 2.75, 2.5, 0.0, 0.05, 0.0, 0.05, 0],
  crouch:   [0.95, 0.55, 0.65, 0.2, 0.6, 0.25, 1.2, 2.1, 0.9, 1.9, 0],
  dormant:  [0.48, 0.65, 0.35, 0.15, 0.3, 0.2, 0.15, 0.25, -0.1, 0.2, 0],
  tall:     [-0.02, -0.05, 0.12, 0.15, -0.08, 0.15, 0.04, 0.04, -0.04, 0.04, 0],
  tilt:     [-0.02, -0.3, 0.12, 0.15, -0.08, 0.15, 0.04, 0.04, -0.04, 0.04, 0],
  hands:    [0.16, 0.55, 0.95, 1.35, 1.05, 1.25, 0.05, 0.05, -0.05, 0.05, 0],
};

/** walk / run cycle at phase φ */
export function gait(phi: number, run = 0): Pose {
  const a = 0.42 + run * 0.32;
  const s = Math.sin(phi), c = Math.cos(phi);
  return [
    0.06 + run * 0.18, -0.02,
    -0.38 * s * (1 + run * 0.6), 0.35 + run * 1.0,
    0.38 * s * (1 + run * 0.6), 0.35 + run * 1.0,
    a * s, 0.12 + (0.65 + run * 0.6) * Math.max(0, c),
    -a * s, 0.12 + (0.65 + run * 0.6) * Math.max(0, -c),
    0,
  ];
}

export const lerpPose = (a: Pose, b: Pose, t: number) => a.map((v, i) => v + (b[i] - v) * t);

/** forward kinematics with the hip at (0,0), y up */
export function fk(pose: Pose, face: number): Joints {
  const [sp, nk, shL, elL, shR, elR, hL, kL, hR, kR, lean] = pose;
  const up = (a: number, l: number, o: Pt): Pt => ({ x: o.x + Math.sin(a) * face * l, y: o.y + Math.cos(a) * l });
  const dn = (a: number, l: number, o: Pt): Pt => ({ x: o.x + Math.sin(a) * face * l, y: o.y - Math.cos(a) * l });
  const hip = { x: 0, y: 0 };
  const sA = sp + lean;
  const shoulder = up(sA, B.torso * 0.9, hip);
  const chest = up(sA, B.torso * 0.66, hip);
  const neck = up(sA, B.torso, hip);
  const head = up(sA + nk, B.neck + B.headR, neck);
  const elbowL = dn(shL + lean, B.ua, shoulder);
  const handL = dn(shL + elL + lean, B.fa, elbowL);
  const elbowR = dn(shR + lean, B.ua, shoulder);
  const handR = dn(shR + elR + lean, B.fa, elbowR);
  const kneeL = dn(hL + lean, B.th, hip);
  const footL = dn(hL - kL + lean, B.sh, kneeL);
  const kneeR = dn(hR + lean, B.th, hip);
  const footR = dn(hR - kR + lean, B.sh, kneeR);
  return { hip, chest, neck, head, shoulder, elbowL, handL, elbowR, handR, kneeL, footL, kneeR, footR };
}

/** lift so the lowest point touches y = 0 */
export function ground(j: Joints) {
  let min = Infinity;
  for (const k in j) {
    const p = j[k as keyof Joints];
    const r = k === 'head' ? B.headR : k.startsWith('foot') ? 0.012 : 0.02;
    min = Math.min(min, p.y - r);
  }
  return -min;
}

/* ── skins ── */
type Ctx = CanvasRenderingContext2D;
export type Xf = (p: Pt) => [number, number];

function seg(x: Ctx, a: [number, number], b: [number, number], w: number) {
  x.lineWidth = w;
  x.beginPath(); x.moveTo(a[0], a[1]); x.lineTo(b[0], b[1]); x.stroke();
}

export function drawHuman(x: Ctx, j: Joints, T: Xf, s: number, col: string) {
  x.strokeStyle = col; x.fillStyle = col; x.lineCap = 'round'; x.lineJoin = 'round';
  const P2 = (k: keyof Joints) => T(j[k]);
  /* far limbs a touch thinner reads as depth */
  seg(x, P2('hip'), P2('kneeR'), 0.07 * s); seg(x, P2('kneeR'), P2('footR'), 0.052 * s);
  seg(x, P2('shoulder'), P2('elbowR'), 0.05 * s); seg(x, P2('elbowR'), P2('handR'), 0.042 * s);
  /* torso as a tapered quad: shoulders wider than hips */
  const h = P2('hip'), sh = P2('shoulder');
  const dx = sh[0] - h[0], dy = sh[1] - h[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L;
  x.beginPath();
  x.moveTo(h[0] + nx * 0.04 * s, h[1] + ny * 0.04 * s);
  x.lineTo(sh[0] + nx * 0.062 * s, sh[1] + ny * 0.062 * s);
  x.lineTo(sh[0] - nx * 0.062 * s, sh[1] - ny * 0.062 * s);
  x.lineTo(h[0] - nx * 0.04 * s, h[1] - ny * 0.04 * s);
  x.closePath(); x.fill();
  seg(x, P2('neck'), P2('head'), 0.04 * s);
  const hd = P2('head');
  x.beginPath(); x.arc(hd[0], hd[1], B.headR * s, 0, Math.PI * 2); x.fill();
  seg(x, P2('hip'), P2('kneeL'), 0.076 * s); seg(x, P2('kneeL'), P2('footL'), 0.058 * s);
  seg(x, P2('shoulder'), P2('elbowL'), 0.055 * s); seg(x, P2('elbowL'), P2('handL'), 0.046 * s);
}

export function drawMachine(x: Ctx, j: Joints, T: Xf, s: number, col: string, joint: string, eyeCol: string, eye: number, face: number) {
  x.strokeStyle = col; x.fillStyle = col; x.lineCap = 'butt'; x.lineJoin = 'miter';
  const P2 = (k: keyof Joints) => T(j[k]);
  const limb = (a: keyof Joints, b: keyof Joints, w: number) => {
    seg(x, P2(a), P2(b), w * s);
    const q = P2(a);
    x.fillStyle = joint; x.beginPath(); x.arc(q[0], q[1], w * 0.62 * s, 0, Math.PI * 2); x.fill(); x.fillStyle = col;
  };
  limb('hip', 'kneeR', 0.07); limb('kneeR', 'footR', 0.05); limb('shoulder', 'elbowR', 0.055); limb('elbowR', 'handR', 0.06);
  /* angular torso plate */
  const h = P2('hip'), sh = P2('shoulder');
  const dx = sh[0] - h[0], dy = sh[1] - h[1], L = Math.hypot(dx, dy) || 1;
  const nx = -dy / L, ny = dx / L, ux = dx / L, uy = dy / L;
  x.beginPath();
  x.moveTo(h[0] + nx * 0.035 * s, h[1] + ny * 0.035 * s);
  x.lineTo(sh[0] + nx * 0.085 * s - ux * 0.04 * s, sh[1] + ny * 0.085 * s - uy * 0.04 * s);
  x.lineTo(sh[0] + nx * 0.06 * s + ux * 0.03 * s, sh[1] + ny * 0.06 * s + uy * 0.03 * s);
  x.lineTo(sh[0] - nx * 0.07 * s + ux * 0.03 * s, sh[1] - ny * 0.07 * s + uy * 0.03 * s);
  x.lineTo(h[0] - nx * 0.05 * s, h[1] - ny * 0.05 * s);
  x.closePath(); x.fill();
  /* foot plates */
  for (const f of ['footL', 'footR'] as const) {
    const p = P2(f);
    x.fillRect(p[0] - 0.03 * s + face * 0.012 * s, p[1] - 0.02 * s, 0.075 * s, 0.024 * s);
  }
  /* visor head */
  const nk = P2('neck'), hd = P2('head');
  seg(x, nk, hd, 0.03 * s);
  const hx = hd[0], hy = hd[1];
  const ang = Math.atan2(hd[1] - nk[1], hd[0] - nk[0]) + Math.PI / 2;
  x.save();
  x.translate(hx, hy); x.rotate(ang);
  x.fillRect(-0.06 * s, -0.055 * s, 0.12 * s, 0.1 * s);
  x.fillStyle = joint; x.fillRect(-0.06 * s, 0.035 * s, 0.12 * s, 0.012 * s);
  if (eye > 0.01) {
    x.globalAlpha = Math.min(1, eye);
    x.fillStyle = eyeCol;
    x.shadowColor = eyeCol; x.shadowBlur = 10 * eye;
    x.fillRect(face > 0 ? 0.0 : -0.05 * s, -0.022 * s, 0.05 * s, 0.018 * s);
    x.shadowBlur = 0; x.globalAlpha = 1;
  } else {
    x.fillStyle = joint;
    x.fillRect(face > 0 ? 0.0 : -0.05 * s, -0.022 * s, 0.05 * s, 0.018 * s);
  }
  x.restore();
  x.fillStyle = col;
  limb('hip', 'kneeL', 0.075); limb('kneeL', 'footL', 0.055); limb('shoulder', 'elbowL', 0.06); limb('elbowL', 'handL', 0.065);
}

/** points along the bones, for disintegration */
export function bonePoints(j: Joints, n: number): Pt[] {
  const bones: [keyof Joints, keyof Joints][] = [
    ['hip', 'neck'], ['neck', 'head'], ['shoulder', 'elbowL'], ['elbowL', 'handL'], ['shoulder', 'elbowR'], ['elbowR', 'handR'],
    ['hip', 'kneeL'], ['kneeL', 'footL'], ['hip', 'kneeR'], ['kneeR', 'footR'], ['hip', 'neck'], ['head', 'head'],
  ];
  const out: Pt[] = [];
  for (let i = 0; i < n; i++) {
    const [a, b] = bones[i % bones.length];
    const t = ((i * 0.618) % 1);
    out.push({ x: j[a].x + (j[b].x - j[a].x) * t, y: j[a].y + (j[b].y - j[a].y) * t });
  }
  return out;
}
