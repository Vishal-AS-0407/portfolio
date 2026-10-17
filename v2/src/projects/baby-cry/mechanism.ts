/* Night Shift — the mechanism in 3D: a cry becomes a spectrogram terrain,
   the bandpass slices it, it collapses into 461 features, and a forest votes.
   The cry itself is a procedural model (harmonic stack × burst envelope on a
   mel axis), not a recording — the scene's note says so. */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease, textTexture } from '@/projects/_shared/stage3d';

export const TYPES = ['hungry', 'tired', 'discomfort', 'belly_pain', 'burping'] as const;
type CryType = (typeof TYPES)[number];

/* illustrative signatures: f0 (Hz), bursts per 3 s, burst duty, harmonics, noise, energy, f0 slope */
const SIG: Record<CryType, [number, number, number, number, number, number, number]> = {
  hungry:     [450, 3.2, 0.62, 12, 0.10, 0.95, -0.10],
  tired:      [380, 1.4, 0.82, 7, 0.06, 0.62, -0.28],
  discomfort: [520, 2.4, 0.5, 10, 0.16, 0.82, 0.12],
  belly_pain: [640, 2.0, 0.78, 16, 0.32, 1.12, 0.22],
  burping:    [300, 4.6, 0.26, 6, 0.22, 0.58, 0.0],
};

const MEL = (f: number) => 2595 * Math.log10(1 + f / 700);
const MMAX = MEL(8000);
/* frequency axis: z ∈ [-2, 2] on a mel scale, 0 Hz at the back */
const zOfHz = (f: number) => -2 + (MEL(f) / MMAX) * 4;
const hzOfZ = (z: number) => 700 * (Math.pow(10, (((z + 2) / 4) * MMAX) / 2595) - 1);

const HEAD = /* glsl */ `
uniform float uT, uUnfurl, uBand, uAgg, uLo, uHi;
uniform vec4 uA, uB;   // f0, bursts, duty, harmonics | noise, energy, slope, -
uniform vec4 uA2, uB2; // the type we're morphing from
uniform float uMix;
float hash(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float vnoise(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.-2.*f);
  return mix(mix(hash(i), hash(i+vec2(1,0)), f.x), mix(hash(i+vec2(0,1)), hash(i+vec2(1,1)), f.x), f.y); }
float cry(float x, float z, vec4 A, vec4 B){
  float t = (x + 3.) / 6. * 3.;                 // seconds
  float melMax = 2595. * log(1. + 8000. / 700.) / log(10.);
  float hz = 700. * (pow(10., ((z + 2.) / 4.) * melMax / 2595.) - 1.);
  float ph = fract(t * A.y / 3. * 1.0 + .13);
  float env = smoothstep(0., .08, ph) * (1. - smoothstep(A.z - .12, A.z, ph));
  env *= .75 + .25 * vnoise(vec2(t * 3., 7.));
  float f0 = A.x * (1. + B.z * (ph - .5)) * (1. + .04 * sin(t * 17.));
  float e = 0.;
  for (int h = 1; h <= 16; h++) {
    if (float(h) > A.w) break;
    float fh = f0 * float(h);
    float w = 38. + fh * .035;
    e += exp(-pow((hz - fh) / w, 2.)) * pow(.86, float(h));
  }
  e *= env;
  e += B.x * env * vnoise(vec2(t * 40., hz * .01)) * (1. - hz / 9000.);
  e += .025 * vnoise(vec2(t * 9., hz * .004));
  return e * B.y;
}
float heightAt(float x, float z){
  float e = mix(cry(x, z, uA2, uB2), cry(x, z, uA, uB), uMix);
  float inBand = step(uLo, z) * step(z, uHi);
  e *= mix(1., mix(.06, 1., inBand), uBand);
  return e;
}
`;

const TV = HEAD + /* glsl */ `
varying float vE, vIn;
varying vec2 vXZ;
void main(){
  vec3 p = position;
  float e = heightAt(p.x, p.z);
  vE = e;
  vIn = step(uLo, p.z) * step(p.z, uHi);
  vXZ = p.xz;
  p.y = e * 1.15 * (1. - uAgg);
  p.z *= max(uUnfurl, .002);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;

const TF = /* glsl */ `
uniform float uBand, uAgg, uUnfurl;
varying float vE, vIn;
varying vec2 vXZ;
vec3 ramp(float t){
  vec3 c0 = vec3(.055,.082,.141), c1 = vec3(.122,.373,.545), c2 = vec3(.271,.816,.784), c3 = vec3(1.,.757,.369), c4 = vec3(1.,.855,.627);
  t = clamp(t, 0., 1.) * 4.;
  if (t < 1.) return mix(c0, c1, t);
  if (t < 2.) return mix(c1, c2, t - 1.);
  if (t < 3.) return mix(c2, c3, t - 2.);
  return mix(c3, c4, t - 3.);
}
void main(){
  vec3 col = ramp(pow(vE, .7) * 1.05);
  /* time lines every 0.25 s, like frames of the STFT */
  float gx = abs(fract(vXZ.x * 2. / 3. * 4.) - .5);
  float line = 1. - smoothstep(.0, .035, gx);
  col += vec3(.27,.82,.78) * line * .12;
  col *= mix(1., mix(.35, 1., vIn), uBand);
  float a = (.35 + .65 * smoothstep(.0, .08, vE + .03)) * (1. - uAgg) * smoothstep(0., .25, uUnfurl);
  gl_FragColor = vec4(col, a);
}`;

export const babyScene: Builder = (stage, env) => {
  const { scene, camera } = stage;
  const cam = camera as THREE.PerspectiveCamera;
  const root = new THREE.Group();
  scene.add(root);

  /* ── terrain ── */
  const geo = new THREE.PlaneGeometry(6, 4, env.coarse ? 150 : 220, env.coarse ? 110 : 160);
  geo.rotateX(-Math.PI / 2);
  const sig = (t: CryType) => {
    const s = SIG[t];
    return [new THREE.Vector4(s[0], s[1], s[2], s[3]), new THREE.Vector4(s[4], s[5], s[6], 0)];
  };
  const [a0, b0] = sig('hungry');
  const U = {
    uT: { value: 0 }, uUnfurl: { value: 0 }, uBand: { value: 0 }, uAgg: { value: 0 },
    uLo: { value: zOfHz(142.91) }, uHi: { value: zOfHz(6620.12) },
    uA: { value: a0 }, uB: { value: b0 }, uA2: { value: a0.clone() }, uB2: { value: b0.clone() }, uMix: { value: 1 },
  };
  const terrain = new THREE.Mesh(geo, new THREE.ShaderMaterial({
    uniforms: U, vertexShader: TV, fragmentShader: TF, transparent: true, depthWrite: true, side: THREE.DoubleSide,
  }));
  root.add(terrain);

  /* ── the raw waveform, a ribbon in the time plane ── */
  const WN = 900;
  const wgeo = new THREE.BufferGeometry();
  const wpos = new Float32Array(WN * 3);
  wgeo.setAttribute('position', new THREE.BufferAttribute(wpos, 3));
  const wave = new THREE.Line(wgeo, new THREE.LineBasicMaterial({ color: '#45d0c8', transparent: true }));
  root.add(wave);
  const fillWave = (t: CryType) => {
    const [f0, bursts, duty] = SIG[t];
    for (let i = 0; i < WN; i++) {
      const x = -3 + (6 * i) / (WN - 1);
      const s = ((x + 3) / 6) * 3;
      const ph = (s * bursts / 3 + 0.13) % 1;
      const envv = Math.min(1, ph / 0.08) * (ph > duty ? Math.max(0, 1 - (ph - duty) / 0.04) : 1);
      const v = envv * (Math.sin(s * f0 * 0.9) * 0.6 + Math.sin(s * f0 * 1.83 + 1) * 0.3) * (0.7 + 0.3 * Math.sin(s * 23));
      wpos[i * 3] = x; wpos[i * 3 + 1] = 0.45 + v * 0.42; wpos[i * 3 + 2] = 0;
    }
    wgeo.attributes.position.needsUpdate = true;
  };
  fillWave('hungry');

  /* ── the Butterworth band: two amber gates ── */
  const gateMat = new THREE.MeshBasicMaterial({ color: '#ffc15e', transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
  const gates = [142.91, 6620.12].map((hz) => {
    const g = new THREE.Mesh(new THREE.PlaneGeometry(6.4, 1.6), gateMat);
    g.position.set(0, 0.8, zOfHz(hz));
    root.add(g);
    const { tex, aspect } = textTexture([`${hz.toFixed(2)} Hz`], '500 22px InterNW, system-ui, sans-serif', '#ffc15e');
    const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, opacity: 0 }));
    lab.scale.set(0.13 * aspect, 0.13, 1);
    lab.position.set(3.4, 1.72, zOfHz(hz));
    root.add(lab);
    return { g, lab };
  });

  /* ── 461 features: a barcode of aggregated descriptors, by family ── */
  const FAM: [number, string][] = [[240, '#45d0c8'], [6, '#8ca0c4'], [6, '#8ca0c4'], [72, '#1f5f8b'], [42, '#ffc15e'], [42, '#ffda9f'], [36, '#45d0c8'], [17, '#e9f0ff']];
  const N = 461;
  const bars = new THREE.InstancedMesh(new THREE.BoxGeometry(1, 1, 1), new THREE.MeshBasicMaterial({ transparent: true }), N);
  bars.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  const barCol: THREE.Color[] = [];
  const barH: number[] = [];
  {
    let k = 0;
    for (const [cnt, hex] of FAM) for (let i = 0; i < cnt && k < N; i++, k++) {
      barCol.push(new THREE.Color(hex));
      barH.push(0.1 + Math.abs(Math.sin(k * 12.9898) * 43758.5453 % 1) * 0.7);
    }
    while (barCol.length < N) { barCol.push(new THREE.Color('#e9f0ff')); barH.push(0.4); }
    barCol.forEach((c, i) => bars.setColorAt(i, c));
  }
  root.add(bars);

  /* ── the forest and its five pillars ── */
  const TREES = 24;
  const treeG = new THREE.ConeGeometry(0.13, 0.46, 6).translate(0, 0.33, 0);
  const forest = new THREE.InstancedMesh(treeG, new THREE.MeshBasicMaterial({ color: '#1f5f8b', transparent: true }), TREES);
  root.add(forest);
  /* votes in the shape of the committed result: one class carries the forest */
  const VOTES = [17, 2, 3, 1, 1];
  const pillars = TYPES.map((t, i) => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.34, 1, 0.34), new THREE.MeshBasicMaterial({ color: i === 0 ? '#ffc15e' : '#4f6183', transparent: true }));
    m.position.set(-1.6 + i * 0.8, 0, 0.5);
    root.add(m);
    const { tex, aspect } = textTexture([t.replace('_', ' ')], 'italic 400 24px Fraunces, Georgia, serif', i === 0 ? '#ffc15e' : '#8ca0c4');
    const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false }));
    lab.scale.set(0.15 * aspect, 0.15, 1);
    lab.position.set(-1.6 + i * 0.8, 0, 0.5);
    root.add(lab);
    return { m, lab };
  });
  const voteDots = new THREE.InstancedMesh(new THREE.SphereGeometry(0.045, 8, 6), new THREE.MeshBasicMaterial({ color: '#ffda9f', transparent: true }), TREES);
  root.add(voteDots);
  const treeVote = Array.from({ length: TREES }, (_, i) => {
    let acc = 0;
    for (let c = 0; c < 5; c++) { acc += VOTES[c]; if (i < acc) return c; }
    return 0;
  });

  /* ── camera keys per panel (0 raw · 1 stft · 2 band · 3 features · 4 forest · 5 free) ── */
  const K: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(0, 0.8, 6.4), new THREE.Vector3(0, 0.45, 0)],
    [new THREE.Vector3(4.6, 3.3, 5.0), new THREE.Vector3(0, 0.2, 0)],
    [new THREE.Vector3(5.8, 4.2, 1.2), new THREE.Vector3(0, 0.2, 0)],
    [new THREE.Vector3(0.6, 1.5, 6.6), new THREE.Vector3(0.6, 0.4, 0)],
    [new THREE.Vector3(0.6, 3.6, 7.6), new THREE.Vector3(0.6, 0.5, -0.2)],
    [new THREE.Vector3(5.4, 4.0, 6.2), new THREE.Vector3(0.4, 0.1, 0)],
  ];
  const camP = new THREE.Vector3(), camT = new THREE.Vector3();
  let type: CryType = 'hungry';
  let mixT = 1;
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s3 = new THREE.Vector3();

  stage.onResize = () => {
    /* phones are tall: pull back so the 6-unit terrain fits */
    cam.fov = stage.w / stage.h < 0.8 ? 52 : 35;
    cam.updateProjectionMatrix();
  };
  stage.onResize();

  const hitPlane = new THREE.Mesh(new THREE.PlaneGeometry(6, 4).rotateX(-Math.PI / 2), new THREE.MeshBasicMaterial({ visible: false }));
  root.add(hitPlane);

  return {
    control(k, val) {
      if (k !== 'type') return;
      const next = val as CryType;
      if (next === type) return;
      U.uA2.value.copy(U.uA.value).lerp(U.uA2.value, 1 - U.uMix.value);
      U.uB2.value.copy(U.uB.value).lerp(U.uB2.value, 1 - U.uMix.value);
      const [a, b] = sig(next);
      U.uA.value.copy(a); U.uB.value.copy(b);
      mixT = env.reduced ? 1 : 0;
      type = next;
      fillWave(next);
    },
    frame({ p, beat, local, t, dt, free }) {
      const u = beat + band(0.5, 1, local);         // continuous storyboard position
      U.uT.value = t;
      mixT = Math.min(1, mixT + dt * 0.03);
      U.uMix.value = ease.io(mixT);

      /* panel-driven state; in the free panel the terrain comes back */
      const unf = band(0.6, 1.6, u);
      const agg = free ? 0 : band(2.6, 3.4, u);
      U.uUnfurl.value = unf;
      U.uBand.value = free ? 1 : band(1.6, 2.4, u);
      U.uAgg.value = agg;
      (wave.material as THREE.LineBasicMaterial).opacity = 1 - band(0.6, 1.3, u);
      wave.visible = u < 1.4 && !free;
      const gateA = (free ? 0.6 : band(1.6, 2.2, u) * (1 - band(2.6, 3.0, u))) * 0.1;
      gateMat.opacity = gateA;
      gates.forEach(({ lab }) => { (lab.material as THREE.SpriteMaterial).opacity = gateA / 0.06; });

      /* bars rise in panel 3 and stream away to the forest in panel 4 */
      const barsIn = free ? 0 : band(2.5, 3.2, u);
      const toForest = band(3.5, 4.3, u);
      (bars.material as THREE.MeshBasicMaterial).opacity = barsIn * (1 - toForest * 0.85);
      bars.visible = barsIn > 0.01;
      if (bars.visible) {
        for (let i = 0; i < N; i++) {
          const x = -3 + (6 * i) / (N - 1);
          const h = barH[i] * barsIn * (1 - toForest * 0.7);
          v.set(x * (1 - toForest * 0.6), h / 2, -toForest * 1.2 + Math.sin(i) * 0.02);
          bars.setMatrixAt(i, m4.compose(v, q.identity(), s3.set(0.009, Math.max(0.001, h), 0.05)));
        }
        bars.instanceMatrix.needsUpdate = true;
      }

      /* the forest grows; each tree casts a vote that flies to its pillar */
      const grow = free ? 0 : band(3.4, 3.9, u);
      const fly = free ? 0 : band(3.9, 4.6, u);
      forest.visible = voteDots.visible = grow > 0.01;
      (forest.material as THREE.MeshBasicMaterial).opacity = grow;
      for (let i = 0; i < TREES; i++) {
        const a = Math.PI * (0.12 + 0.76 * (i / (TREES - 1)));
        const tx = -Math.cos(a) * 2.6, tz = -Math.sin(a) * 1.4 - 0.4;
        forest.setMatrixAt(i, m4.compose(v.set(tx, 0, tz), q.identity(), s3.setScalar(Math.max(0.001, grow))));
        const c = treeVote[i];
        const px = -1.6 + c * 0.8, pz = 0.5;
        const k = ease.out(Math.max(0, Math.min(1, fly * 1.3 - (i / TREES) * 0.3)));
        v.set(tx + (px - tx) * k, 0.8 + Math.sin(k * Math.PI) * 0.9, tz + (pz - tz) * k);
        voteDots.setMatrixAt(i, m4.compose(v, q.identity(), s3.setScalar(k > 0.98 || fly < 0.01 ? 0.001 : 1)));
      }
      forest.instanceMatrix.needsUpdate = true;
      voteDots.instanceMatrix.needsUpdate = true;
      pillars.forEach(({ m, lab }, i) => {
        const h = Math.max(0.001, (VOTES[i] / 17) * 1.2 * band(4.1, 4.7, u) * (free ? 0 : 1));
        m.scale.y = h; m.position.y = h / 2;
        m.visible = lab.visible = grow > 0.01;
        (lab.material as THREE.SpriteMaterial).opacity = grow;
        lab.position.y = 0.18 + h;
      });

      /* camera */
      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = u - Math.floor(u);
      camP.lerpVectors(K[i0][0], K[i1][0], f);
      camT.lerpVectors(K[i0][1], K[i1][1], f);
      cam.position.copy(camP);
      cam.lookAt(camT);
      root.rotation.y = stage.orbit.yaw + (env.reduced ? 0 : Math.sin(t * 0.12) * 0.05);
      root.rotation.x = stage.orbit.pitch * 0.6;

      /* hover readout: where on the spectrogram the pointer is */
      if (free) {
        const hit = stage.pick([hitPlane], false);
        if (hit) {
          const lp = root.worldToLocal(hit.point.clone());
          const hz = hzOfZ(lp.z);
          const inB = hz >= 142.91 && hz <= 6620.12;
          env.readout(`${(((lp.x + 3) / 6) * 3).toFixed(2)} s · ${Math.round(hz)} Hz · ${inB ? 'inside the band' : 'filtered out'}`);
        } else env.readout(`${type.replace('_', ' ')} · illustrative signature`);
      } else env.readout('');
      void p;
    },
  };
};
