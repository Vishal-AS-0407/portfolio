/* The heart's shape as a signed distance field, and the few things everything
   else needs from it: where the surface is along a direction, its normal, and
   the plate's coordinate frame.

   Heart space: y up, +x = viewer's right (the patient's left), +z = toward the
   viewer. Units are roughly "one heart radius". */
import * as THREE from 'three';

type Chamber = { c: [number, number, number]; r: [number, number, number]; tilt: number; taper: number };

/* see docs/design/biomech-and-inheritance.md §2.1 */
const CHAMBERS: Chamber[] = [
  { c: [0.15, -0.22, -0.05], r: [0.56, 0.86, 0.56], tilt: 25, taper: 0.24 }, // left ventricle → apex
  { c: [-0.22, -0.12, 0.26], r: [0.55, 0.70, 0.42], tilt: 30, taper: 0.18 }, // right ventricle
  { c: [0.26, 0.55, -0.30], r: [0.42, 0.32, 0.38], tilt: 0, taper: 0 },      // left atrium
  { c: [-0.52, 0.40, 0.0], r: [0.36, 0.42, 0.38], tilt: 0, taper: 0 },       // right atrium
  { c: [-0.05, 0.38, 0.10], r: [0.50, 0.26, 0.40], tilt: 0, taper: 0 },      // base / fat pad
];
const PRE = CHAMBERS.map((ch) => {
  const a = (ch.tilt * Math.PI) / 180;
  return { ...ch, cos: Math.cos(a), sin: Math.sin(a) };
});

/* iq's ellipsoid bound — not exact, but its zero set and sign are, which is
   all a radial projection needs */
function sdEllipsoid(x: number, y: number, z: number, rx: number, ry: number, rz: number) {
  const k0 = Math.hypot(x / rx, y / ry, z / rz);
  const k1 = Math.hypot(x / (rx * rx), y / (ry * ry), z / (rz * rz));
  return k1 < 1e-6 ? -Math.min(rx, ry, rz) : (k0 * (k0 - 1)) / k1;
}
const smin = (a: number, b: number, k: number) => {
  const h = Math.max(k - Math.abs(a - b), 0) / k;
  return Math.min(a, b) - h * h * k * 0.25;
};

/** per-chamber distances, for groove detection */
export function chamberDists(x: number, y: number, z: number, out: number[]) {
  for (let i = 0; i < PRE.length; i++) {
    const ch = PRE[i];
    let qx = x - ch.c[0], qy = y - ch.c[1];
    const qz = z - ch.c[2];
    /* rotate into the chamber's frame (inverse of its tilt about z) */
    const rx = qx * ch.cos + qy * ch.sin;
    const ry = -qx * ch.sin + qy * ch.cos;
    qx = rx; qy = ry;
    /* egg taper: narrower toward -y (the apex) */
    const t = Math.max(-1, Math.min(1, qy / ch.r[1]));
    const s = 1 + ch.taper * t;
    out[i] = sdEllipsoid(qx / s, qy, qz / s, ch.r[0], ch.r[1], ch.r[2]) * Math.min(1, s);
  }
  return out;
}

const tmp: number[] = [0, 0, 0, 0, 0];
export function sdf(x: number, y: number, z: number) {
  chamberDists(x, y, z, tmp);
  let d = tmp[0];
  for (let i = 1; i < tmp.length; i++) d = smin(d, tmp[i], 0.22);
  return d;
}

/** distance from the origin to the first surface crossing along unit dir d */
export function surfaceT(dx: number, dy: number, dz: number) {
  let t0 = 0, t = 0.04;
  while (t < 3 && sdf(dx * t, dy * t, dz * t) < 0) { t0 = t; t += 0.04; }
  let lo = t0, hi = t;
  for (let i = 0; i < 14; i++) {
    const m = (lo + hi) * 0.5;
    if (sdf(dx * m, dy * m, dz * m) < 0) lo = m; else hi = m;
  }
  return (lo + hi) * 0.5;
}

export function sdfNormal(p: THREE.Vector3, out = new THREE.Vector3()) {
  const e = 0.004;
  return out.set(
    sdf(p.x + e, p.y, p.z) - sdf(p.x - e, p.y, p.z),
    sdf(p.x, p.y + e, p.z) - sdf(p.x, p.y - e, p.z),
    sdf(p.x, p.y, p.z + e) - sdf(p.x, p.y, p.z - e)
  ).normalize();
}

/** surface point + outward normal along a direction */
export function surfaceAt(dir: THREE.Vector3) {
  const d = dir.clone().normalize();
  const p = d.multiplyScalar(surfaceT(d.x, d.y, d.z));
  return { p, n: sdfNormal(p) };
}

/* ── the armour plate's frame ──────────────────────────────────────────
   Plate coordinates g are a gnomonic projection onto the tangent plane at the
   plate centre, scaled by the surface radius there, so g is ≈ surface distance
   near the centre and a hexagon in g is a hexagon on the heart. */
export const PLATE = (() => {
  const c = new THREE.Vector3(0.56, -0.3, 0.77).normalize();
  const up = new THREE.Vector3(0, 1, 0);
  const u = new THREE.Vector3().crossVectors(up, c).normalize();          // +u → screen right
  const v = new THREE.Vector3().crossVectors(c, u).normalize();           // +v → up
  const R0 = surfaceT(c.x, c.y, c.z);
  return {
    c, u, v, R0,
    HR: 0.38,      // hex "radius" (apothem-ish metric below)
    LIFT: 0.034,   // plate thickness above the flesh
    hole: new THREE.Vector2(0.015, -0.02),
    HOLE_R: 0.13,
  };
})();

/** hexagon metric, flat top and bottom: 1 at the edge midpoints */
export const hexMetric = (gx: number, gy: number) =>
  Math.max(Math.abs(gx) * 0.8660254 + Math.abs(gy) * 0.5, Math.abs(gy));

export function gToDir(gx: number, gy: number, out = new THREE.Vector3()) {
  const { c, u, v, R0 } = PLATE;
  return out.copy(c).addScaledVector(u, gx / R0).addScaledVector(v, gy / R0).normalize();
}

export function dirToG(d: THREE.Vector3) {
  const { c, u, v, R0 } = PLATE;
  const k = Math.max(0.05, d.dot(c));
  return { gx: (d.dot(u) / k) * R0, gy: (d.dot(v) / k) * R0, front: d.dot(c) > 0 };
}

/** GLSL twin of the plate frame, for discards and masks in shaders */
export const GLSL_PLATE = /* glsl */ `
uniform vec3 uPC, uPU, uPV;
uniform float uR0, uHR, uHoleR;
uniform vec2 uHoleC;
vec2 plateG(vec3 obj, out float front){
  vec3 d = normalize(obj);
  float k = dot(d, uPC);
  front = step(0.0, k);
  return vec2(dot(d, uPU), dot(d, uPV)) / max(k, .05) * uR0;
}
float hexM(vec2 g){ return max(abs(g.x)*.8660254 + abs(g.y)*.5, abs(g.y)); }
`;

export const plateUniforms = () => ({
  uPC: { value: PLATE.c.clone() },
  uPU: { value: PLATE.u.clone() },
  uPV: { value: PLATE.v.clone() },
  uR0: { value: PLATE.R0 },
  uHR: { value: PLATE.HR },
  uHoleR: { value: PLATE.HOLE_R },
  uHoleC: { value: PLATE.hole.clone() },
});
