/* The particle field.
   Mounted ONCE outside the router so it survives route changes — an R3F reconciler
   would tear this down on every navigation. Six morph formations, scrubbed by scroll:
     0 noise · 1 lattice · 2 spectrogram · 3 eeg · 4 embedding · 5 clusters
   Positions are a pure function of scroll, never a simulation — you must be able to
   scrub backwards. */
import * as THREE from 'three';

export type FieldTier = 0 | 1 | 2; // 0 = off (reduced motion), 1 = mobile, 2 = desktop

const VERT = /* glsl */ `
attribute vec3 aP0, aP1, aP2, aP3, aP4, aP5;
attribute vec3 aCol;
attribute vec2 aRnd;
uniform float uMorph, uTime, uTurb, uVel, uReveal, uPS, uDpr, uKick;
varying float vT, vA, vImg;
varying vec3 vC;

vec3 turb(vec3 p, float t) {
  return vec3(
    sin(p.y * 1.9 + t * .55) + sin(p.z * 1.3 - t * .31),
    sin(p.z * 1.7 + t * .42) + sin(p.x * 1.5 + t * .37),
    sin(p.x * 1.6 - t * .47) + sin(p.y * 1.4 + t * .44));
}

void main() {
  float m = uMorph;
  vec3 p = mix(aP0, aP1, smoothstep(0., 1., clamp(m, 0., 1.)));
  p = mix(p, aP2, smoothstep(0., 1., clamp(m - 1., 0., 1.)));
  p = mix(p, aP3, smoothstep(0., 1., clamp(m - 2., 0., 1.)));
  p = mix(p, aP4, smoothstep(0., 1., clamp(m - 3., 0., 1.)));
  p = mix(p, aP5, smoothstep(0., 1., clamp(m - 4., 0., 1.)));

  /* how deep we are in an image formation (2,3,4) — drives colour sampling */
  float d2 = 1. - clamp(abs(m - 2.), 0., 1.);
  float d3 = 1. - clamp(abs(m - 3.), 0., 1.);
  float d4 = 1. - clamp(abs(m - 4.), 0., 1.);
  vImg = max(d2, max(d3, d4));

  p += turb(p * 1.5 + aRnd.x * 6.28, uTime) * uTurb * (.35 + aRnd.y * .65);
  p.z += (1. - uReveal) * (2.2 + aRnd.y * 6.5);
  /* the hero heart's beat travels through the whole cloud as a ring */
  float kr = length(p);
  p += p / max(kr, .1) * uKick * (.05 + aRnd.y * .09) * (.6 + .4 * sin(kr * 5. - uTime * 9.));

  vec4 mv = modelViewMatrix * vec4(p, 1.);
  mv.y += uVel * .15 * (.4 + aRnd.x);
  gl_Position = projectionMatrix * mv;

  float dist = max(.05, -mv.z);
  gl_PointSize = clamp(uPS * uDpr / dist, .55, 7.);
  vT = clamp(aRnd.y * .5 + length(p) * .4 + m * .06, 0., 1.);
  vA = uReveal * clamp(1.55 - dist * .2, .1, 1.);
  vC = aCol;
}`;

const FRAG = /* glsl */ `
precision highp float;
varying float vT, vA, vImg;
varying vec3 vC;
uniform float uInv, uAlpha;

vec3 magma(float t) {
  t = clamp(t, 0., 1.);
  vec3 c0 = vec3(.001,0.,.014), c1 = vec3(.232,.059,.437), c2 = vec3(.550,.161,.506),
       c3 = vec3(.871,.288,.409), c4 = vec3(.996,.624,.427), c5 = vec3(.987,.991,.749);
  float s = t * 5.;
  if (s < 1.) return mix(c0, c1, s);
  if (s < 2.) return mix(c1, c2, s - 1.);
  if (s < 3.) return mix(c2, c3, s - 2.);
  if (s < 4.) return mix(c3, c4, s - 3.);
  return mix(c4, c5, s - 4.);
}

void main() {
  vec2 q = gl_PointCoord - .5;
  float r = dot(q, q);
  if (r > .25) discard;
  float soft = 1. - smoothstep(.03, .25, r);
  vec3 base = magma(vT * .82 + .1);
  base = mix(base, vC, vImg * .9);
  /* on the plate, read the dark end of the ramp so points stay rich as ink */
  vec3 col = mix(base, magma(vT * .34 + .06) * .92, uInv);
  float a = mix(.40, .55, uInv) * soft * vA * uAlpha;
  gl_FragColor = vec4(col, a);
}`;

/* ── formation builders ─────────────────────────────────── */
function noiseBall(n: number) {
  const a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) {
    const r = Math.pow(Math.random(), 0.42) * 1.6;
    const th = Math.acos(2 * Math.random() - 1), ph = Math.random() * 6.2832;
    a[i * 3] = r * Math.sin(th) * Math.cos(ph);
    a[i * 3 + 1] = r * Math.sin(th) * Math.sin(ph) * 0.7;
    a[i * 3 + 2] = r * Math.cos(th);
  }
  return a;
}
function lattice(n: number) {
  const a = new Float32Array(n * 3), s = Math.ceil(Math.cbrt(n));
  for (let i = 0; i < n; i++) {
    const x = i % s, y = ((i / s) | 0) % s, z = (i / (s * s)) | 0;
    a[i * 3] = (x / (s - 1) - .5) * 2.6;
    a[i * 3 + 1] = (y / (s - 1) - .5) * 1.6;
    a[i * 3 + 2] = (z / (s - 1) - .5) * 2.6;
  }
  return a;
}
function clusters(n: number, k = 8) {
  const a = new Float32Array(n * 3), C: number[][] = [];
  for (let i = 0; i < k; i++) {
    const t = (i / k) * 6.2832;
    C.push([Math.cos(t) * 1.45, Math.sin(t * 1.6) * .78, Math.sin(t) * 1.45]);
  }
  const g = () => (Math.random() + Math.random() + Math.random() - 1.5) * .30;
  for (let i = 0; i < n; i++) {
    const c = C[i % k];
    a[i * 3] = c[0] + g(); a[i * 3 + 1] = c[1] + g(); a[i * 3 + 2] = c[2] + g();
  }
  return a;
}
/* positions AND colours sampled from a real plate image */
function fromImage(n: number, img: HTMLImageElement, spanX: number, spanY: number) {
  const W = 520, H = Math.max(1, Math.round((W * img.height) / img.width));
  const c = document.createElement('canvas');
  c.width = W; c.height = H;
  const x = c.getContext('2d', { willReadFrequently: true })!;
  x.drawImage(img, 0, 0, W, H);
  const d = x.getImageData(0, 0, W, H).data;
  const idx: number[] = [];
  for (let i = 0; i < W * H; i++) {
    const l = (d[i * 4] * .299 + d[i * 4 + 1] * .587 + d[i * 4 + 2] * .114) / 255;
    if (l > .085) idx.push(i);
  }
  const pos = new Float32Array(n * 3), col = new Float32Array(n * 3);
  if (!idx.length) return { pos: lattice(n), col };
  for (let i = 0; i < n; i++) {
    const k = idx[(Math.random() * idx.length) | 0], px = k % W, py = (k / W) | 0;
    pos[i * 3] = (px / W - .5) * spanX + (Math.random() - .5) * .006;
    pos[i * 3 + 1] = -(py / H - .5) * spanY + (Math.random() - .5) * .006;
    pos[i * 3 + 2] = (Math.random() - .5) * .16;
    col[i * 3] = d[k * 4] / 255; col[i * 3 + 1] = d[k * 4 + 1] / 255; col[i * 3 + 2] = d[k * 4 + 2] / 255;
  }
  return { pos, col };
}

const loadImg = (src: string) =>
  new Promise<HTMLImageElement | null>((r) => {
    const i = new Image();
    i.onload = () => r(i); i.onerror = () => r(null); i.src = src;
  });

export type FieldHandle = {
  update: (o: { morph: number; turb: number; inv: number; vel: number; reveal: number; rotY: number; rotX: number; dist: number; alpha: number; kick?: number }) => void;
  resize: () => void;
  dispose: () => void;
  count: number;
};

export async function createField(canvas: HTMLCanvasElement, tier: FieldTier): Promise<FieldHandle | null> {
  if (tier === 0) return null;
  const N = tier === 1 ? 36000 : 100000;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  const dprCap = tier === 1 ? 1.5 : 1.75;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
  renderer.setSize(window.innerWidth, window.innerHeight, false);

  const scene = new THREE.Scene();
  const cam = new THREE.PerspectiveCamera(71, window.innerWidth / window.innerHeight, 0.1, 100);
  cam.position.z = 3.6;

  const geo = new THREE.BufferGeometry();
  const [spec, eeg, emb] = await Promise.all([
    loadImg('/plates/spectrogram.jpg'), loadImg('/plates/eeg.jpg'), loadImg('/plates/embedding.jpg'),
  ]);

  const P2 = spec ? fromImage(N, spec, 3.75, 1.26) : { pos: lattice(N), col: new Float32Array(N * 3).fill(.8) };
  const P3 = eeg ? fromImage(N, eeg, 3.4, 1.9) : { pos: lattice(N), col: P2.col };
  const P4 = emb ? fromImage(N, emb, 2.6, 2.6) : { pos: clusters(N), col: P2.col };

  geo.setAttribute('position', new THREE.BufferAttribute(noiseBall(N), 3)); // required by three
  geo.setAttribute('aP0', new THREE.BufferAttribute(noiseBall(N), 3));
  geo.setAttribute('aP1', new THREE.BufferAttribute(lattice(N), 3));
  geo.setAttribute('aP2', new THREE.BufferAttribute(P2.pos, 3));
  geo.setAttribute('aP3', new THREE.BufferAttribute(P3.pos, 3));
  geo.setAttribute('aP4', new THREE.BufferAttribute(P4.pos, 3));
  geo.setAttribute('aP5', new THREE.BufferAttribute(clusters(N), 3));
  geo.setAttribute('aCol', new THREE.BufferAttribute(P2.col, 3));
  const rnd = new Float32Array(N * 2);
  for (let i = 0; i < N * 2; i++) rnd[i] = Math.random();
  geo.setAttribute('aRnd', new THREE.BufferAttribute(rnd, 2));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6); // never frustum-cull the field

  const uniforms = {
    uMorph: { value: 0 }, uTime: { value: 0 }, uTurb: { value: .1 }, uVel: { value: 0 },
    uReveal: { value: 0 }, uInv: { value: 0 }, uAlpha: { value: 1 }, uKick: { value: 0 },
    uPS: { value: tier === 1 ? 4.6 : 6.4 },
    uDpr: { value: renderer.getPixelRatio() },
  };
  const mat = new THREE.ShaderMaterial({
    uniforms, vertexShader: VERT, fragmentShader: FRAG,
    transparent: true, depthTest: false, depthWrite: false, blending: THREE.AdditiveBlending,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  scene.add(pts);

  let lastInv = 0;
  return {
    count: N,
    update({ morph, turb, inv, vel, reveal, rotY, rotX, dist, alpha, kick = 0 }) {
      uniforms.uMorph.value = morph;
      uniforms.uTime.value = performance.now() * 0.001;
      uniforms.uTurb.value = turb;
      uniforms.uInv.value = inv;
      uniforms.uVel.value = vel;
      uniforms.uReveal.value = reveal;
      uniforms.uAlpha.value = alpha;
      uniforms.uKick.value = kick;
      pts.rotation.y = rotY; pts.rotation.x = rotX;
      cam.position.z = dist;
      /* additive glows on the void; standard alpha reads as ink on the plate */
      if ((inv > .5) !== (lastInv > .5)) {
        mat.blending = inv > .5 ? THREE.NormalBlending : THREE.AdditiveBlending;
        mat.needsUpdate = true;
        lastInv = inv;
      }
      renderer.render(scene, cam);
    },
    resize() {
      const w = window.innerWidth, h = window.innerHeight;
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, dprCap));
      renderer.setSize(w, h, false);
      uniforms.uDpr.value = renderer.getPixelRatio();
      cam.aspect = w / h; cam.updateProjectionMatrix();
    },
    dispose() { geo.dispose(); mat.dispose(); renderer.dispose(); },
  };
}
