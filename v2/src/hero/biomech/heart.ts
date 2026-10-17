/* The organic half: myocardium, coronary arteries, and the armour plate that
   is bolted over the left ventricle. The three share one uniform set and one
   vertex deformation, so the beat moves them as one body.

   docs/design/biomech-and-inheritance.md §2 */
import * as THREE from 'three';
import { mergeVertices, mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { fbm3, rng, GLSL_NOISE } from './noise';
import {
  surfaceT, sdfNormal, chamberDists, PLATE, hexMetric, gToDir, dirToG, GLSL_PLATE, plateUniforms,
} from './anatomy';

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

export const PALETTE = {
  ground: '#0C0D0B', fg: '#EFEFE7',
  g1: '#3A3D34', g2: '#5E6159', g3: '#8B8E83',
  m1: '#3B0F70', m2: '#8C2981', m3: '#DE4968', m4: '#FE9F6D', m5: '#FCFDBF',
};

/** the uniforms every heart material shares — update once, all follow */
export function heartUniforms() {
  return {
    uTime: { value: 0 },
    uA: { value: 0 },
    uV: { value: 0 },
    uWring: { value: 0 },
    uDent: { value: new THREE.Vector3(0, 0, 9) },
    uDentAmt: { value: 0 },
    uGlow: { value: 0.2 },
    uFlare: { value: 0 },
    uWave: { value: 9 },
    uHoleOpen: { value: 1 },
    uC1: { value: new THREE.Color(PALETTE.m1) },
    uC2: { value: new THREE.Color(PALETTE.m2) },
    uC3: { value: new THREE.Color(PALETTE.m3) },
    uC4: { value: new THREE.Color(PALETTE.m4) },
    uC5: { value: new THREE.Color(PALETTE.m5) },
    uG1: { value: new THREE.Color(PALETTE.g1) },
    uG2: { value: new THREE.Color(PALETTE.g2) },
    uG3: { value: new THREE.Color(PALETTE.g3) },
    ...plateUniforms(),
  };
}
export type HeartU = ReturnType<typeof heartUniforms>;

/* ── the beat, as a vertex deformation (GLSL) and its JS twin for rigid parts ── */
const DEFORM_HEAD = /* glsl */ `
attribute vec2 aW;     // ventricle, atrium weight
attribute vec3 aPS;    // rigid (plate), seam, groove
uniform float uA, uV, uWring, uDentAmt, uTime;
uniform vec3 uDent;
varying vec3 vObj;
varying vec3 vPS;
vec3 heartDeform(vec3 p){
  float rig = 1.0 - 0.7 * aPS.x;
  float disp = (-0.05 * uV * aW.x - 0.032 * uA * aW.y) * rig;
  float dd = distance(p, uDent);
  disp -= uDentAmt * exp(-dd * dd * 22.0) * (1.0 - 0.8 * aPS.x);
  vec3 q = p + normalize(p) * disp;
  float wa = uWring * (0.4 - p.y);
  float cw = cos(wa), sw = sin(wa);
  q.xz = mat2(cw, -sw, sw, cw) * q.xz;
  return q;
}
`;
const DEFORM_BODY = /* glsl */ `
#include <begin_vertex>
vObj = position;
vPS = aPS;
transformed = heartDeform(position);
`;

export function weightsAt(p: THREE.Vector3): [number, number] {
  return [ss(0.35, -0.6, p.y), ss(0.15, 0.62, p.y)];
}
/** where a point on the heart is this frame — for parts that ride the surface */
export function deformPoint(p: THREE.Vector3, U: HeartU, rigid: number, out: THREE.Vector3) {
  const [wv, wa] = weightsAt(p);
  const rig = 1 - 0.7 * rigid;
  const disp = (-0.05 * U.uV.value * wv - 0.032 * U.uA.value * wa) * rig;
  const len = p.length() || 1;
  out.copy(p).multiplyScalar(1 + disp / len);
  const ang = U.uWring.value * (0.4 - p.y);
  const c = Math.cos(ang), s = Math.sin(ang);
  /* GLSL mat2(c,-s,s,c) is column-major: x' = c·x + s·z, z' = -s·x + c·z */
  const x = out.x, z = out.z;
  out.x = c * x + s * z;
  out.z = -s * x + c * z;
  return out;
}

let keySeq = 0;
function patch(mat: THREE.Material, U: HeartU, frag: (s: string) => string, extraVert = '') {
  /* every patched material shares this closure's source text, which is what
     three keys its program cache on by default — give each its own key */
  const key = `heart-${keySeq++}`;
  mat.customProgramCacheKey = () => key;
  mat.onBeforeCompile = (shader) => {
    Object.assign(shader.uniforms, U);
    shader.vertexShader = shader.vertexShader
      .replace('#include <common>', `#include <common>\n${DEFORM_HEAD}\n${extraVert}`)
      .replace('#include <begin_vertex>', DEFORM_BODY);
    shader.fragmentShader = frag(
      shader.fragmentShader.replace(
        '#include <common>',
        `#include <common>
uniform float uTime, uV, uGlow, uFlare, uWave, uHoleOpen;
uniform vec3 uC1, uC2, uC3, uC4, uC5, uG1, uG2, uG3;
varying vec3 vObj;
varying vec3 vPS;
${GLSL_NOISE}
${GLSL_PLATE}`
      )
    );
  };
}

/* ── flesh ─────────────────────────────────────────────────────────────── */
function fleshGeometry(detail: number) {
  let g: THREE.BufferGeometry = new THREE.IcosahedronGeometry(1, detail);
  g.deleteAttribute('normal');
  g.deleteAttribute('uv');
  g = mergeVertices(g);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const n = pos.count;
  const aW = new Float32Array(n * 2);
  const aPS = new Float32Array(n * 3);
  const d = new THREE.Vector3();
  const cd = [0, 0, 0, 0, 0];
  for (let i = 0; i < n; i++) {
    d.fromBufferAttribute(pos, i).normalize();
    const t = surfaceT(d.x, d.y, d.z);
    const px = d.x * t, py = d.y * t, pz = d.z * t;

    /* grooves: where the two nearest chambers meet */
    chamberDists(px, py, pz, cd);
    const s = [...cd].sort((a, b) => a - b);
    const groove = Math.exp(-Math.abs(s[0] - s[1]) * 11);

    const { gx, gy, front } = dirToG(d);
    const hm = front ? hexMetric(gx, gy) : 9;
    const rigid = 1 - ss(PLATE.HR, PLATE.HR + 0.14, hm);
    const seam = front ? Math.exp(-(((hm - PLATE.HR - 0.022) / 0.018) ** 2)) : 0;
    const under = hm < PLATE.HR + 0.004 ? 1 : 0;

    const relief =
      fbm3(px * 3.4, py * 3.4, pz * 3.4) * 0.02 * (1 - under) +
      fbm3(px * 11 + 7, py * 11, pz * 11) * 0.0035 -
      seam * 0.007 - groove * 0.03;
    const r = t + relief;
    pos.setXYZ(i, d.x * r, d.y * r, d.z * r);

    const [wv, wa] = weightsAt(d.clone().multiplyScalar(r));
    aW[i * 2] = wv; aW[i * 2 + 1] = wa;
    aPS[i * 3] = rigid; aPS[i * 3 + 1] = seam; aPS[i * 3 + 2] = groove;
  }
  g.setAttribute('aW', new THREE.BufferAttribute(aW, 2));
  g.setAttribute('aPS', new THREE.BufferAttribute(aPS, 3));
  g.computeVertexNormals();
  return g;
}

const FLESH_FRAG = (s: string) =>
  s
    .replace(
      '#include <color_fragment>',
      /* glsl */ `#include <color_fragment>
  float pf; vec2 pg = plateG(vObj, pf);
  float hm = hexM(pg);
  if (pf > .5 && length(pg - uHoleC) < uHoleR * uHoleOpen) discard;
  vec3 P = vObj;
  float n1 = snoise(P * 2.6) * .5 + .5;
  float n2 = snoise(P * 7.3 + vec3(4.)) * .5 + .5;
  /* fibres wind diagonally round the ventricles, as myocardium does */
  float fib = snoise(vec3(P.x * 5. + P.y * 9., P.y * 4. - P.x * 9., P.z * 5. + P.y * 6.)) * .5 + .5;
  /* deep wine muscle: violet in the shadows, magma red only on the fibres' crests */
  vec3 flesh = mix(uC1 * .8, uC3 * .62, smoothstep(.1, .9, n1 * .65 + fib * .4));
  flesh = mix(flesh, uC2 * .7, (1. - n2) * .35);
  flesh = mix(flesh, uC3 * .9, smoothstep(.66, .97, fib * .6 + n2 * .45) * .45);
  flesh *= .72;
  flesh = mix(flesh, uC1 * .32, clamp(smoothstep(.4, 1., vPS.z) * .8 + (1. - n2) * .14, 0., 1.));
  float fat = smoothstep(.45, .85, vPS.z) * smoothstep(.5, .74, snoise(P * 6. + vec3(9.)) * .5 + .5);
  flesh = mix(flesh, uC4 * vec3(.78, .56, .42) * .62, fat * .75);
  /* capillaries run down the wall: ridged noise stretched along y, warped */
  vec3 wp = vec3(P.x * 7.5, P.y * 2.1, P.z * 7.5) + vec3(snoise(P * 2.3), snoise(P * 2.3 + 5.), snoise(P * 2.3 + 11.)) * .7;
  float ridge = 1. - abs(snoise(wp));
  float vein = smoothstep(.962, .993, ridge) * (1. - fat) * (1. - vPS.x * .8) * smoothstep(.2, .6, n1 + .2);
  flesh = mix(flesh, uC1 * .4, vein * .6);
  flesh = mix(flesh, uC1 * .45, clamp(vPS.y, 0., 1.) * .85);                       // bruised seam
  flesh = mix(flesh, uC1 * .3, step(hm, uHR) * pf);                                // scar under the plate
  float zone = pf * smoothstep(.6, .28, abs(pg.x)) * smoothstep(.45, .05, pg.y) * smoothstep(-1.35, -.45, pg.y);
  float drip = snoise(vec3(P.x * 12., P.y * 1.25 + uTime * .04, P.z * 12.));
  float grease = clamp(smoothstep(.32, .68, drip) * zone + vPS.y * .55, 0., 1.);
  diffuseColor.rgb = mix(flesh, vec3(.003), grease * .93);`
    )
    .replace(
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
  roughnessFactor = mix(.44 - fib * .1, .05, grease);`
    )
    .replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
  float fres = pow(1. - abs(dot(normal, normalize(vViewPosition))), 3.);
  totalEmissiveRadiance += uC4 * vein * (uGlow * .25 + uFlare * .7) * (.4 + n2 * .7);
  totalEmissiveRadiance += uC2 * fres * .2 * (1. - grease);`
    )
    .replace(
      '#include <lights_physical_fragment>',
      `#include <lights_physical_fragment>
  material.clearcoat = max(.78, grease);
  material.clearcoatRoughness = mix(.3, .03, grease);`
    );

/* ── the plate: a hexagonal shell lifted off the flesh, with a real edge ── */
function plateGeometry() {
  const N = 28;
  const { HR, LIFT } = PLATE;
  const R = (2 * HR) / Math.sqrt(3);
  const C: [number, number][] = [];
  for (let k = 0; k < 6; k++) C.push([R * Math.cos((k * Math.PI) / 3), R * Math.sin((k * Math.PI) / 3)]);

  const d = new THREE.Vector3(), p = new THREE.Vector3(), nn = new THREE.Vector3();
  const lifted = (gx: number, gy: number, lift: number) => {
    gToDir(gx, gy, d);
    p.copy(d).multiplyScalar(surfaceT(d.x, d.y, d.z));
    sdfNormal(p, nn);
    return p.clone().addScaledVector(nn, lift);
  };

  const top: number[] = [];
  const wall: number[] = [];
  for (let s = 0; s < 6; s++) {
    const A = C[s], B = C[(s + 1) % 6];
    const grid: THREE.Vector3[][] = [];
    for (let i = 0; i <= N; i++) {
      grid.push([]);
      for (let j = 0; j <= i; j++) {
        const gx = (A[0] * i) / N + ((B[0] - A[0]) * j) / N;
        const gy = (A[1] * i) / N + ((B[1] - A[1]) * j) / N;
        /* the outermost ring sits lower: a chamfer that catches the light */
        grid[i].push(lifted(gx, gy, i === N ? LIFT * 0.55 : i === N - 1 ? LIFT * 0.9 : LIFT));
      }
    }
    const push = (arr: number[], ...v: THREE.Vector3[]) => v.forEach((q) => arr.push(q.x, q.y, q.z));
    for (let i = 0; i < N; i++) {
      for (let j = 0; j <= i; j++) {
        push(top, grid[i][j], grid[i + 1][j], grid[i + 1][j + 1]);
        if (j < i) push(top, grid[i][j], grid[i + 1][j + 1], grid[i][j + 1]);
      }
    }
    /* the edge wall, from the chamfer down into the flesh */
    for (let j = 0; j < N; j++) {
      const gx0 = A[0] + ((B[0] - A[0]) * j) / N, gy0 = A[1] + ((B[1] - A[1]) * j) / N;
      const gx1 = A[0] + ((B[0] - A[0]) * (j + 1)) / N, gy1 = A[1] + ((B[1] - A[1]) * (j + 1)) / N;
      const t0 = grid[N][j], t1 = grid[N][j + 1];
      const b0 = lifted(gx0, gy0, -0.012), b1 = lifted(gx1, gy1, -0.012);
      push(wall, t0, b0, b1, t0, b1, t1);
    }
  }
  const mk = (arr: number[], weld: boolean) => {
    let g: THREE.BufferGeometry = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.Float32BufferAttribute(arr, 3));
    if (weld) g = mergeVertices(g, 1e-4);
    g.computeVertexNormals();
    return g;
  };
  const g = mergeGeometries([mk(top, true).toNonIndexed(), mk(wall, false)]);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const aW = new Float32Array(pos.count * 2), aPS = new Float32Array(pos.count * 3);
  for (let i = 0; i < pos.count; i++) {
    const [wv, wa] = weightsAt(p.fromBufferAttribute(pos, i));
    aW[i * 2] = wv; aW[i * 2 + 1] = wa; aPS[i * 3] = 1;
  }
  g.setAttribute('aW', new THREE.BufferAttribute(aW, 2));
  g.setAttribute('aPS', new THREE.BufferAttribute(aPS, 3));
  return g;
}

const PLATE_FRAG = (s: string) =>
  s
    .replace(
      '#include <color_fragment>',
      /* glsl */ `#include <color_fragment>
  float pf; vec2 pg = plateG(vObj, pf);
  float hm = hexM(pg);
  float hd = length(pg - uHoleC);
  if (hd < uHoleR * uHoleOpen) discard;
  float brushed = snoise(vec3(vObj.x * 70., vObj.y * 3., vObj.z * 70.)) * .5 + .5;
  float n1 = snoise(vObj * 5.) * .5 + .5;
  vec3 metal = mix(uG1, uG3, .18 + n1 * .32 + brushed * .14);
  float inner = uHR * .64;
  float lines = 1. - smoothstep(.0022, .005, abs(hm - inner));
  lines = max(lines, (1. - smoothstep(.0022, .005, abs(pg.y + .01))) * step(inner, hm) * step(0., pg.x));
  lines = max(lines, (1. - smoothstep(.0022, .005, abs(pg.x + .07))) * step(inner, hm) * step(pg.y, 0.));
  float recess = smoothstep(uHoleR + .034, uHoleR + .026, hd);
  float wear = smoothstep(uHR * .84, uHR * .99, hm) * smoothstep(.35, .7, n1 + brushed * .3);
  float stripe = step(.5, fract((pg.x - pg.y) * 22.)) * step(uHR * .7, hm) * step(hm, uHR * .86) * step(pg.y, -.12);
  vec3 paint = mix(uC4 * .62, uG1 * .6, step(.5, fract((pg.x - pg.y) * 22. + .5)));
  vec3 col = mix(metal, metal * .45, recess);
  col = mix(col, uG3 * 1.25, wear * .7);
  col = mix(col, paint, stripe * (1. - wear) * .85);
  col = mix(col, vec3(.01), lines * .85);
  float drip = snoise(vec3(vObj.x * 13., vObj.y * 1.2 + uTime * .035, vObj.z * 13.));
  float grease = clamp(smoothstep(.42, .75, drip) * smoothstep(.12, -.3, pg.y) + lines * .5, 0., 1.);
  diffuseColor.rgb = mix(col, vec3(.004), grease * .9);`
    )
    .replace(
      '#include <roughnessmap_fragment>',
      `#include <roughnessmap_fragment>
  roughnessFactor = mix(mix(.34 + brushed * .1, .16, wear), .72, lines);
  roughnessFactor = mix(roughnessFactor, .5, stripe);
  roughnessFactor = mix(roughnessFactor, .05, grease);`
    )
    .replace(
      '#include <metalnessmap_fragment>',
      `#include <metalnessmap_fragment>
  metalnessFactor = mix(mix(1., .15, stripe * (1. - wear)), .2, grease);`
    );

/* ── coronary arteries: branching walks on the surface ─────────────────── */
type Walk = { pts: THREE.Vector3[]; r0: number; r1: number; arc0: number };
function vesselGeometry(detailScale: number) {
  const R = rng(7);
  const walks: Walk[] = [];
  const up = new THREE.Vector3(), n = new THREE.Vector3(), h = new THREE.Vector3(), d = new THREE.Vector3();

  const walk = (start: THREE.Vector3, heading: THREE.Vector3, steps: number, r0: number, depth: number, arc0: number) => {
    const pts: THREE.Vector3[] = [];
    const p = start.clone();
    h.copy(heading).normalize();
    const STEP = 0.034;
    for (let k = 0; k < steps; k++) {
      d.copy(p).normalize();
      const t = surfaceT(d.x, d.y, d.z);
      p.copy(d).multiplyScalar(t);
      sdfNormal(p, n);
      const onSurf = p.clone().addScaledVector(n, r0 * (1 - k / steps * 0.6) * 0.15);
      pts.push(onSurf);
      const { gx, gy, front } = dirToG(d);
      /* arteries run under the plate's edge and stop there — the seam swallows them */
      if (front && hexMetric(gx, gy) < PLATE.HR + 0.01) break;
      h.addScaledVector(n, -h.dot(n));
      up.set(R() - 0.5, R() - 0.5, R() - 0.5).multiplyScalar(0.55);
      h.add(up).addScaledVector(new THREE.Vector3(0, -1, 0), 0.22);
      h.addScaledVector(n, -h.dot(n)).normalize();
      if (depth < 3 && k > 3 && k < steps - 4 && R() < 0.085) {
        const side = R() < 0.5 ? -1 : 1;
        const bh = h.clone().applyAxisAngle(n, side * (0.6 + R() * 0.6));
        const saved = h.clone();
        walk(p.clone(), bh, Math.floor((steps - k) * 0.75), r0 * 0.62, depth + 1, arc0 + k * STEP);
        h.copy(saved);
      }
      p.addScaledVector(h, STEP);
    }
    if (pts.length > 3) walks.push({ pts, r0, r1: r0 * 0.4, arc0 });
  };

  walk(new THREE.Vector3(-0.02, 0.32, 0.5), new THREE.Vector3(0.12, -1, 0.15), 40, 0.019, 0, 0);   // LAD
  walk(new THREE.Vector3(0.28, 0.3, 0.32), new THREE.Vector3(1, -0.25, -0.6), 34, 0.016, 0, 0);     // circumflex
  walk(new THREE.Vector3(-0.38, 0.28, 0.46), new THREE.Vector3(-1, -0.5, 0), 36, 0.017, 0, 0);     // RCA
  walk(new THREE.Vector3(0.0, 0.12, -0.52), new THREE.Vector3(0, -1, -0.2), 30, 0.018, 0, 0);      // posterior

  const geos: THREE.BufferGeometry[] = [];
  for (const w of walks) {
    const curve = new THREE.CatmullRomCurve3(w.pts);
    const segs = Math.max(4, Math.round(w.pts.length * 2 * detailScale));
    const g = new THREE.TubeGeometry(curve, segs, 1, 6, false);
    const pos = g.attributes.position as THREE.BufferAttribute;
    const nor = g.attributes.normal as THREE.BufferAttribute;
    const arc = new Float32Array(pos.count);
    const len = curve.getLength();
    const c = new THREE.Vector3(), q = new THREE.Vector3();
    for (let i = 0; i <= segs; i++) {
      const u = i / segs;
      curve.getPointAt(u, c);
      const r = w.r0 + (w.r1 - w.r0) * u;
      for (let j = 0; j <= 6; j++) {
        const k = i * 7 + j;
        q.fromBufferAttribute(pos, k).sub(c).multiplyScalar(r).add(c);
        pos.setXYZ(k, q.x, q.y, q.z);
        arc[k] = w.arc0 + u * len;
      }
    }
    nor.needsUpdate = true;
    g.setAttribute('aArc', new THREE.BufferAttribute(arc, 1));
    g.deleteAttribute('uv');
    geos.push(g);
  }
  const g = mergeGeometries(geos);
  const pos = g.attributes.position as THREE.BufferAttribute;
  const aW = new Float32Array(pos.count * 2), aPS = new Float32Array(pos.count * 3);
  const p = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    p.fromBufferAttribute(pos, i);
    const [wv, wa] = weightsAt(p);
    aW[i * 2] = wv; aW[i * 2 + 1] = wa;
  }
  g.setAttribute('aW', new THREE.BufferAttribute(aW, 2));
  g.setAttribute('aPS', new THREE.BufferAttribute(aPS, 3));
  return g;
}

const VESSEL_FRAG = (s: string) =>
  s
    .replace('varying vec3 vObj;', 'varying vec3 vObj;\nvarying float vArc;')
    .replace(
      '#include <color_fragment>',
      `#include <color_fragment>
  float n1 = snoise(vObj * 9.) * .5 + .5;
  diffuseColor.rgb = mix(uC1, uC2, .45 + n1 * .4) * .85;
  float wave = exp(-pow((vArc - uWave) * 8., 2.));`
    )
    .replace(
      '#include <emissivemap_fragment>',
      `#include <emissivemap_fragment>
  totalEmissiveRadiance += uC4 * (.01 + uGlow * .12 + wave * 1.1 + uFlare * .4);
  totalEmissiveRadiance += uC5 * wave * .12;`
    );

export type HeartParts = {
  group: THREE.Group;
  flesh: THREE.Mesh;
  plate: THREE.Mesh;
  vessels: THREE.Mesh;
  U: HeartU;
  materials: THREE.Material[];
};

export function buildHeart(tier: number, envMap: THREE.Texture | null): HeartParts {
  const U = heartUniforms();
  const group = new THREE.Group();

  const fleshMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.44, metalness: 0, clearcoat: 0.8, clearcoatRoughness: 0.3,
    sheen: 0.3, sheenColor: new THREE.Color(PALETTE.m3), sheenRoughness: 0.45,
    envMap, envMapIntensity: 0.3,
  });
  patch(fleshMat, U, FLESH_FRAG);
  const flesh = new THREE.Mesh(fleshGeometry(tier === 2 ? 6 : 5), fleshMat);
  flesh.userData.part = 'flesh';

  const plateMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.36, metalness: 1, clearcoat: 0.25, clearcoatRoughness: 0.4,
    envMap, envMapIntensity: 0.85,
  });
  patch(plateMat, U, PLATE_FRAG);
  const plate = new THREE.Mesh(plateGeometry(), plateMat);
  plate.userData.part = 'plate';

  const vesselMat = new THREE.MeshPhysicalMaterial({
    color: 0xffffff, roughness: 0.36, clearcoat: 0.5, clearcoatRoughness: 0.2,
    envMap, envMapIntensity: 0.22,
  });
  patch(vesselMat, U, VESSEL_FRAG, 'attribute float aArc;\nvarying float vArc;');
  vesselMat.onBeforeCompile = ((orig) => (shader: Parameters<NonNullable<THREE.Material['onBeforeCompile']>>[0], r: THREE.WebGLRenderer) => {
    orig(shader, r);
    shader.vertexShader = shader.vertexShader.replace('vObj = position;', 'vObj = position;\nvArc = aArc;');
  })(vesselMat.onBeforeCompile);
  const vessels = new THREE.Mesh(vesselGeometry(tier === 2 ? 1 : 0.6), vesselMat);
  vessels.userData.part = 'flesh';

  group.add(flesh, plate, vessels);
  return { group, flesh, plate, vessels, U, materials: [fleshMat, plateMat, vesselMat] };
}
