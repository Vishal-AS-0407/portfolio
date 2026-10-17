/* The blood nebula: a GPGPU swarm (position + velocity ping-pong textures) of
   blood cells and metal filings orbiting the heart, plus a handful of loose
   bolts, nuts and cogs you can flick.

   docs/design/biomech-and-inheritance.md §3 */
import * as THREE from 'three';
import { GPUComputationRenderer, type Variable } from 'three/addons/misc/GPUComputationRenderer.js';
import { GLSL_NOISE, rng } from './noise';

const VEL = /* glsl */ `
uniform float uTime, uDt, uPulse, uHold, uBlast, uDisperse, uMouseOn;
uniform vec3 uRayO, uRayD;
${GLSL_NOISE}
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 P = texture2D(tPos, uv);
  vec4 Vv = texture2D(tVel, uv);
  vec3 p = P.xyz, v = Vv.xyz;
  float seed = P.w, R = Vv.w, dt = uDt;
  float r = length(p) + 1e-4;
  vec3 n = p / r;
  v += curl(p * .72 + vec3(0., uTime * .035, uTime * .02)) * .0009 * dt;
  vec3 tang = normalize(cross(vec3(.12, 1., 0.), p) + 1e-5);
  v += tang * .00105 * dt * (1. + uHold * 3.2) * (.6 + fract(seed * 5.3) * .8);
  float shell = R * (1. - uHold * .5) + uDisperse * 4.;
  v += n * (shell - r) * .0006 * dt;
  v += n * smoothstep(1.25, .85, r) * .012 * dt;                          // never inside the heart
  vec3 w = p - uRayO;
  vec3 cp = uRayO + uRayD * dot(w, uRayD);
  vec3 dv = p - cp;
  float d = length(dv) + 1e-4;
  v += dv / d * uMouseOn * .016 * exp(-d * d * 5.) * dt;                   // the cursor parts them
  v += n * uPulse * .011 * (1.25 - smoothstep(1., 3.6, r)) * dt;           // each beat: a pressure wave
  v += -n * uHold * .0024 * dt;                                            // overclock: spiral in
  v += n * uBlast * .085 * (.45 + fract(seed * 7.1));                      // release: fling out
  float sp = length(v);
  if (sp > .16) v *= .16 / sp;
  v *= pow(.965, dt);
  gl_FragColor = vec4(v, R);
}`;

const POS = /* glsl */ `
uniform float uDt;
void main(){
  vec2 uv = gl_FragCoord.xy / resolution.xy;
  vec4 P = texture2D(tPos, uv);
  P.xyz += texture2D(tVel, uv).xyz * uDt;
  gl_FragColor = P;
}`;

const DRAW_V = /* glsl */ `
uniform sampler2D tPos, tVel;
uniform float uSize, uDpr;
uniform vec3 uLight;
attribute vec2 ref;
varying float vSpecies, vSpeed, vSeed, vGlint, vDepth;
void main(){
  vec4 P = texture2D(tPos, ref);
  vec3 v = texture2D(tVel, ref).xyz;
  vSeed = P.w;
  vSpecies = step(.8, P.w);
  vSpeed = length(v);
  vec4 wp = modelMatrix * vec4(P.xyz, 1.);
  float ld = distance(wp.xyz, uLight);
  vGlint = exp(-ld * ld * 3.);
  vec4 mv = viewMatrix * wp;
  gl_Position = projectionMatrix * mv;
  float s = mix(1., .5, vSpecies) * (.55 + fract(P.w * 13.7) * .95);
  vDepth = -mv.z;
  gl_PointSize = clamp(uSize * s * uDpr / vDepth, .6, 14.);
}`;

const DRAW_F = /* glsl */ `
uniform float uAlpha;
varying float vSpecies, vSpeed, vSeed, vGlint, vDepth;
vec3 magma(float t){
  t = clamp(t, 0., 1.);
  vec3 c1 = vec3(.232,.059,.437), c2 = vec3(.550,.161,.506), c3 = vec3(.871,.288,.409),
       c4 = vec3(.996,.624,.427), c5 = vec3(.987,.991,.749);
  float s = t * 4.;
  if (s < 1.) return mix(c1, c2, s);
  if (s < 2.) return mix(c2, c3, s - 1.);
  if (s < 3.) return mix(c3, c4, s - 2.);
  return mix(c4, c5, s - 3.);
}
void main(){
  vec2 q = gl_PointCoord - .5;
  float r = dot(q, q);
  if (r > .25) discard;
  float soft = 1. - smoothstep(0., .25, r);
  float hard = 1. - smoothstep(.1, .25, r);
  vec3 blood = magma(.42 + vSpeed * 6. + fract(vSeed * 31.) * .4);
  vec3 metal = mix(vec3(.45,.46,.42), vec3(.92,.92,.88), fract(vSeed * 17.)) * (1. + vGlint * 3.);
  vec3 col = mix(blood, metal, vSpecies);
  float a = mix(soft * .34, hard * (.5 + vGlint * .5), vSpecies) * uAlpha * smoothstep(.4, 1.4, vDepth);
  gl_FragColor = vec4(col * a, a);
}`;

export type Swarm = {
  points: THREE.Points;
  U: {
    uTime: { value: number }; uDt: { value: number }; uPulse: { value: number }; uHold: { value: number };
    uBlast: { value: number }; uDisperse: { value: number }; uMouseOn: { value: number };
    uRayO: { value: THREE.Vector3 }; uRayD: { value: THREE.Vector3 };
  };
  draw: { uAlpha: { value: number }; uLight: { value: THREE.Vector3 }; uDpr: { value: number } };
  step: () => void;
  setDrawFraction: (f: number) => void;
  dispose: () => void;
};

export function buildSwarm(renderer: THREE.WebGLRenderer, tier: number): Swarm | null {
  const SIZE = tier === 2 ? 96 : 56;
  const N = SIZE * SIZE;
  const R = rng(99);
  const simulate = tier > 0;

  let gpu: GPUComputationRenderer | null = null;
  let posVar: Variable | null = null, velVar: Variable | null = null;
  const U = {
    uTime: { value: 0 }, uDt: { value: 1 }, uPulse: { value: 0 }, uHold: { value: 0 },
    uBlast: { value: 0 }, uDisperse: { value: 0 }, uMouseOn: { value: 0 },
    uRayO: { value: new THREE.Vector3(0, 0, 9) }, uRayD: { value: new THREE.Vector3(0, 0, -1) },
  };

  const seedPos = (arr: Float32Array) => {
    for (let i = 0; i < N; i++) {
      const rr = 1.25 + Math.pow(R(), 2.2) * 1.5;
      const th = Math.acos(2 * R() - 1), ph = R() * Math.PI * 2;
      arr[i * 4] = rr * Math.sin(th) * Math.cos(ph);
      arr[i * 4 + 1] = rr * Math.cos(th) * 0.62;
      arr[i * 4 + 2] = rr * Math.sin(th) * Math.sin(ph);
      arr[i * 4 + 3] = R();
    }
  };

  let staticTex: THREE.DataTexture | null = null;
  if (simulate) {
    gpu = new GPUComputationRenderer(SIZE, SIZE, renderer);
    if (tier === 1) gpu.setDataType(THREE.HalfFloatType);
    const p0 = gpu.createTexture(), v0 = gpu.createTexture();
    seedPos(p0.image.data as unknown as Float32Array);
    const vd = v0.image.data as unknown as Float32Array, pd = p0.image.data as unknown as Float32Array;
    for (let i = 0; i < N; i++) {
      const x = pd[i * 4], z = pd[i * 4 + 2];
      vd[i * 4] = -z * 0.004; vd[i * 4 + 1] = 0; vd[i * 4 + 2] = x * 0.004;
      vd[i * 4 + 3] = Math.hypot(x, pd[i * 4 + 1], z);
    }
    posVar = gpu.addVariable('tPos', POS, p0);
    velVar = gpu.addVariable('tVel', VEL, v0);
    gpu.setVariableDependencies(posVar, [posVar, velVar]);
    gpu.setVariableDependencies(velVar, [posVar, velVar]);
    Object.assign(velVar.material.uniforms, U);
    posVar.material.uniforms.uDt = U.uDt;
    const err = gpu.init();
    if (err) { console.warn('[biomech] swarm disabled:', err); gpu.dispose(); return null; }
  } else {
    const arr = new Float32Array(N * 4);
    seedPos(arr);
    staticTex = new THREE.DataTexture(arr, SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
    staticTex.needsUpdate = true;
  }

  const geo = new THREE.BufferGeometry();
  const ref = new Float32Array(N * 2);
  for (let i = 0; i < N; i++) {
    ref[i * 2] = ((i % SIZE) + 0.5) / SIZE;
    ref[i * 2 + 1] = (Math.floor(i / SIZE) + 0.5) / SIZE;
  }
  geo.setAttribute('ref', new THREE.BufferAttribute(ref, 2));
  geo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(N * 3), 3));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 12);

  const blank = new THREE.DataTexture(new Float32Array(4 * N), SIZE, SIZE, THREE.RGBAFormat, THREE.FloatType);
  blank.needsUpdate = true;
  const draw = {
    tPos: { value: (staticTex ?? blank) as THREE.Texture },
    tVel: { value: blank as THREE.Texture },
    uSize: { value: tier === 2 ? 20 : 18 },
    uDpr: { value: renderer.getPixelRatio() },
    uAlpha: { value: 0 },
    uLight: { value: new THREE.Vector3(0, 0, 3) },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms: draw, vertexShader: DRAW_V, fragmentShader: DRAW_F,
    transparent: true, depthWrite: false, blending: THREE.CustomBlending,
    blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
  });
  const points = new THREE.Points(geo, mat);
  points.frustumCulled = false;
  points.renderOrder = 2;

  return {
    points, U, draw,
    step() {
      if (!gpu || !posVar || !velVar) return;
      gpu.compute();
      draw.tPos.value = gpu.getCurrentRenderTarget(posVar).texture;
      draw.tVel.value = gpu.getCurrentRenderTarget(velVar).texture;
    },
    setDrawFraction(f: number) { geo.setDrawRange(0, Math.max(1, Math.floor(N * f))); },
    dispose() { gpu?.dispose(); geo.dispose(); mat.dispose(); blank.dispose(); staticTex?.dispose(); },
  };
}

/* ── debris: bolts, nuts and cogs on loose orbits ─────────────────────── */
export type Debris = {
  group: THREE.Group;
  update: (dt: number, t: number, disperse: number) => void;
  /** a pointer sweep: screen position + velocity in px/ms; returns true if it flicked something */
  flick: (sx: number, sy: number, vx: number, vy: number, cam: THREE.Camera, w: number, h: number) => boolean;
  blast: (k: number) => void;
};

export function buildDebris(count: number, mats: { gun: THREE.Material; chrome: THREE.Material; brass: THREE.Material }, animate: boolean): Debris {
  const R = rng(4242);
  const group = new THREE.Group();
  const nutG = new THREE.CylinderGeometry(0.05, 0.05, 0.035, 6);
  const boltG = new THREE.CylinderGeometry(0.018, 0.018, 0.14, 8).translate(0, -0.06, 0);
  const headG = new THREE.CylinderGeometry(0.038, 0.038, 0.03, 6);
  const cogS = new THREE.Shape();
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2, st = Math.PI / 8;
    const pts: [number, number][] = [[0.045, a], [0.06, a + st * 0.3], [0.06, a + st * 0.9], [0.045, a + st * 1.2]];
    pts.forEach(([r, aa], k) => (i === 0 && k === 0 ? cogS.moveTo(Math.cos(aa) * r, Math.sin(aa) * r) : cogS.lineTo(Math.cos(aa) * r, Math.sin(aa) * r)));
  }
  const hp = new THREE.Path(); hp.absarc(0, 0, 0.016, 0, Math.PI * 2, true); cogS.holes.push(hp);
  const cogG = new THREE.ExtrudeGeometry(cogS, { depth: 0.02, bevelEnabled: false, curveSegments: 2 });

  const kinds: [THREE.BufferGeometry, THREE.Material][] = [[nutG, mats.gun], [boltG, mats.chrome], [headG, mats.chrome], [cogG, mats.brass]];
  const meshes = kinds.map(([g, m]) => {
    const im = new THREE.InstancedMesh(g, m, count);
    im.count = 0;
    im.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
    im.frustumCulled = false;
    group.add(im);
    return im;
  });

  type Item = {
    kind: number; slot: number; r: number; incl: THREE.Quaternion; w: number; ph: number;
    off: THREE.Vector3; vel: THREE.Vector3; axis: THREE.Vector3; rot: number; spin: number; scale: number;
  };
  const items: Item[] = [];
  for (let i = 0; i < count; i++) {
    const kind = i % 4;
    /* a bolt is a shaft (1) plus a head (2) drawn as one item — skip separate heads */
    const k = kind === 2 ? 0 : kind;
    const incl = new THREE.Quaternion().setFromEuler(new THREE.Euler((R() - 0.5) * 1.1, R() * 6.28, (R() - 0.5) * 0.8));
    items.push({
      kind: k, slot: meshes[k].count++, r: 1.55 + R() * 1.15, incl, w: (0.05 + R() * 0.07) * (R() < 0.5 ? 1 : -1),
      ph: R() * 6.28, off: new THREE.Vector3(), vel: new THREE.Vector3(),
      axis: new THREE.Vector3(R() - 0.5, R() - 0.5, R() - 0.5).normalize(), rot: R() * 6.28, spin: 0.2 + R() * 0.6, scale: 0.42 + R() * 0.45,
    });
    if (k === 1) { const h = meshes[2]; h.count++; }
  }

  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pos = new THREE.Vector3(), sc = new THREE.Vector3();
  const world = new THREE.Vector3(), headOff = new THREE.Vector3();
  let t = 0;
  const update = (dt: number, time: number, disperse: number) => {
    t = time;
    let headSlot = 0;
    for (const it of items) {
      if (animate) {
        /* spring back to the orbit with a ~2.5 s time constant */
        it.vel.addScaledVector(it.off, -0.9 * dt).multiplyScalar(Math.exp(-1.6 * dt));
        it.off.addScaledVector(it.vel, dt);
        it.spin += (0.4 - it.spin) * Math.min(1, dt * 0.5);
        it.rot += it.spin * dt;
      }
      const a = it.ph + t * it.w;
      pos.set(Math.cos(a) * it.r, Math.sin(a * 2.3 + it.ph) * 0.08, Math.sin(a) * it.r).applyQuaternion(it.incl);
      pos.multiplyScalar(1 + disperse * 1.6).add(it.off);
      q.setFromAxisAngle(it.axis, it.rot);
      sc.setScalar(it.scale);
      meshes[it.kind].setMatrixAt(it.slot, m4.compose(pos, q, sc));
      if (it.kind === 1) {
        headOff.set(0, 0.012 * it.scale, 0).applyQuaternion(q).add(pos);
        meshes[2].setMatrixAt(headSlot++, m4.compose(headOff, q, sc));
      }
    }
    meshes.forEach((m) => { m.instanceMatrix.needsUpdate = true; });
  };

  const flick: Debris['flick'] = (sx, sy, vx, vy, cam, w, h) => {
    const sp = Math.hypot(vx, vy);
    if (sp < 0.6) return false;
    let hit = false;
    const e = group.matrixWorld;
    for (const it of items) {
      const a = it.ph + t * it.w;
      world.set(Math.cos(a) * it.r, 0, Math.sin(a) * it.r).applyQuaternion(it.incl).add(it.off).applyMatrix4(e);
      world.project(cam);
      const px = (world.x * 0.5 + 0.5) * w, py = (-world.y * 0.5 + 0.5) * h;
      if (Math.hypot(px - sx, py - sy) < 44) {
        it.vel.x += vx * 0.9; it.vel.y -= vy * 0.9; it.vel.z += (Math.random() - 0.5) * sp * 0.6;
        it.spin += sp * 9;
        hit = true;
      }
    }
    return hit;
  };

  const blast = (k: number) => {
    for (const it of items) {
      const a = it.ph + t * it.w;
      pos.set(Math.cos(a), 0, Math.sin(a)).applyQuaternion(it.incl);
      it.vel.addScaledVector(pos, k * (1.2 + Math.random()));
      it.spin += k * 6;
    }
  };

  return { group, update, flick, blast };
}
