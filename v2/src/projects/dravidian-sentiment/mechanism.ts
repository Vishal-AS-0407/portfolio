/* Muzhakkam — the mechanism in 3D, printed flat in two spot inks: a hashtag
   is shredded by the tokenizer, re-joined by the agent, encoded twice (dense
   and sparse), fused, and sorted into seven classes. The point geometry is
   illustrative, not the model's embeddings. */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease, textTexture } from '@/projects/_shared/stage3d';

const VERM = '#c0261c', GOLD = '#e9b23c', BONE = '#f4e7ce';
export const SEVEN: [string, string, string][] = [
  ['உறுதிப்படுத்தப்பட்டது', 'substantiated', VERM], ['நக்கல்', 'sarcastic', GOLD], ['கருத்து', 'opinionated', BONE],
  ['நேர்மறை', 'positive', '#e0683a'], ['எதிர்மறை', 'negative', '#f2c879'], ['நடுநிலை', 'neutral', '#d9c6a0'], ['எதுவுமில்லை', 'none of the above', '#f08a6e'],
];
const FRAGS: [string, boolean][] = [['#', false], ['தமிழ்', false], ['நாடு', true], ['அர', true], ['சியல்', true]];

const PV = /* glsl */ `
attribute vec3 aCol; attribute float aSq;
uniform float uSize, uDpr;
varying vec3 vC; varying float vSq;
void main(){ vC = aCol; vSq = aSq; vec4 mv = modelViewMatrix * vec4(position,1.); gl_Position = projectionMatrix * mv; gl_PointSize = uSize * uDpr / -mv.z; }`;
const PF = /* glsl */ `
uniform float uA;
varying vec3 vC; varying float vSq;
void main(){
  vec2 q = gl_PointCoord - .5;
  /* dense = round dot, sparse = a hard square: the halftone and the type case */
  float d = mix(length(q), max(abs(q.x), abs(q.y)), vSq);
  if (d > .5) discard;
  gl_FragColor = vec4(vC, uA);
}`;

export type Mode = 'dense' | 'sparse' | 'fused';

export const dravScene: Builder = (stage, env) => {
  const { scene, camera } = stage;
  const cam = camera as THREE.PerspectiveCamera;
  const root = new THREE.Group();
  scene.add(root);
  const font = (w: number, px: number) => `${w} ${px}px NotoTamilMZ, AntonMZ, sans-serif`;

  /* ── the strip and its tiles, re-textured once the Tamil face has loaded ── */
  const tileMat = (lines: string[], fg: string, bg: string, px = 54) => {
    const { tex, aspect } = textTexture(lines, font(700, px), fg, { bg, pad: 18 });
    return { m: new THREE.MeshBasicMaterial({ map: tex, transparent: true, side: THREE.DoubleSide }), aspect };
  };
  const mkTile = (lines: string[], fg: string, bg: string, h: number, px?: number) => {
    const { m, aspect } = tileMat(lines, fg, bg, px);
    const mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), m);
    mesh.scale.set(h * aspect, h, 1);
    root.add(mesh);
    return mesh;
  };
  const strip = mkTile(['#தமிழ்நாடுஅரசியல்'], VERM, BONE, 0.62);
  const tiles = FRAGS.map(([t, sub]) => mkTile([(sub ? '##' : '') + t], sub ? BONE : VERM, sub ? VERM : BONE, 0.5));
  const rejoined = mkTile(['தமிழ்நாடு அரசியல்'], '#120a08', GOLD, 0.62);
  const english = mkTile(['an opinion about Tamil Nadu politics'], VERM, BONE, 0.26, 40);
  const retex = () => {
    const swap = (mesh: THREE.Mesh, lines: string[], fg: string, bg: string, h: number, px?: number) => {
      const old = mesh.material as THREE.MeshBasicMaterial;
      const { m, aspect } = tileMat(lines, fg, bg, px);
      mesh.material = m; mesh.scale.set(h * aspect, h, 1);
      old.map?.dispose(); old.dispose();
    };
    swap(strip, ['#தமிழ்நாடுஅரசியல்'], VERM, BONE, 0.62);
    FRAGS.forEach(([t, sub], i) => swap(tiles[i], [(sub ? '##' : '') + t], sub ? BONE : VERM, sub ? VERM : BONE, 0.5));
    swap(rejoined, ['தமிழ்நாடு அரசியல்'], '#120a08', GOLD, 0.62);
    swap(english, ['an opinion about Tamil Nadu politics'], VERM, BONE, 0.26, 40);
    labels.forEach((l, i) => {
      const old = l.material as THREE.SpriteMaterial;
      const { tex, aspect } = textTexture([SEVEN[i][0], SEVEN[i][1]], font(700, 26), SEVEN[i][2]);
      l.material = new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false });
      l.scale.set(0.34 * aspect, 0.34, 1);
      old.map?.dispose(); old.dispose();
    });
  };
  let alive = true;
  document.fonts?.load(font(700, 54), 'தமிழ்').then(() => { if (alive) retex(); }).catch(() => {});

  /* where the shredded tiles fly to, and the order the agent puts them back */
  const SHRED = [[-2.2, 1.1, 0.6, 0.5], [1.6, 1.3, -0.3, -0.4], [-1.0, -0.9, 0.4, 0.7], [2.1, -0.6, 0.2, -0.6], [0.2, 0.2, 1.2, 0.3]];

  /* ── the two channels and the seven classes ── */
  const PER = env.coarse ? 110 : 170;
  const N = PER * 7;
  const pos = new Float32Array(N * 3), col = new Float32Array(N * 3), sq = new Float32Array(N);
  const rnd = Array.from({ length: N }, (_, i) => {
    const r = (k: number) => { const s = Math.sin(i * 12.9898 + k * 78.233) * 43758.5453; return s - Math.floor(s); };
    /* gaussian-ish triple */
    const g = (k: number) => (r(k) + r(k + 1) + r(k + 2) - 1.5) / 1.5;
    return [g(1), g(4), g(7), r(10), r(11)];
  });
  const cls = (i: number) => (i / PER) | 0;
  for (let i = 0; i < N; i++) {
    const c = new THREE.Color(SEVEN[cls(i)][2]);
    col[i * 3] = c.r; col[i * 3 + 1] = c.g; col[i * 3 + 2] = c.b;
    sq[i] = i % 2;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3).setUsage(THREE.DynamicDrawUsage));
  pg.setAttribute('aCol', new THREE.BufferAttribute(col, 3));
  pg.setAttribute('aSq', new THREE.BufferAttribute(sq, 1));
  const PU = { uSize: { value: 34 }, uDpr: { value: stage.renderer.getPixelRatio() }, uA: { value: 0 } };
  const pts = new THREE.Points(pg, new THREE.ShaderMaterial({ uniforms: PU, vertexShader: PV, fragmentShader: PF, transparent: true, depthWrite: false }));
  pts.frustumCulled = false;
  root.add(pts);
  const centre = (c: number) => {
    const a = (c / 7) * Math.PI * 2 + 0.3;
    return [Math.cos(a) * 1.75, Math.sin(a) * 0.92 - 0.22, Math.sin(a * 2) * 0.35];
  };
  const labels = SEVEN.map(([ta, en, hex], i) => {
    const { tex, aspect } = textTexture([ta, en], font(700, 26), hex);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    s.scale.set(0.34 * aspect, 0.34, 1);
    const [x, y, z] = centre(i);
    s.position.set(x * 1.3, (y + 0.22) * 1.32 - 0.22, z);
    root.add(s);
    return s;
  });

  /* separation per mode — illustrative of why fusion helped, not measured */
  const SPREAD: Record<Mode, [number, number]> = { dense: [0.95, 0.95], sparse: [0.32, 1.7], fused: [0.24, 0.24] };
  let mode: Mode = 'fused';
  const spread = { a: 0.27, b: 0.27 };

  const K: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(0, 0.1, 4.2), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(0.6, 0.3, 5.6), new THREE.Vector3(0, 0.1, 0)],
    [new THREE.Vector3(-0.3, 0.2, 4.4), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(0, 1.2, 6.2), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(0, 0.6, 6.8), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(0.4, 0.8, 6.6), new THREE.Vector3(0, 0, 0)],
  ];
  stage.onResize = () => { cam.fov = stage.w / stage.h < 0.8 ? 62 : 36; cam.updateProjectionMatrix(); PU.uDpr.value = stage.renderer.getPixelRatio(); };
  stage.onResize();
  const cp = new THREE.Vector3(), ct = new THREE.Vector3();

  return {
    control(k, v) { if (k === 'mode') mode = v as Mode; },
    dispose() { alive = false; },
    frame({ beat, local, t, free, reduced, dt }) {
      const u = beat + band(0.5, 1, local);
      const wob = reduced ? 0 : 1;

      /* 0 · the strip   1 · shredded   2 · re-joined */
      const shred = band(0.55, 1.3, u), join = band(1.55, 2.2, u), off = band(2.55, 3.1, u);
      const words = free ? 0 : 1;
      strip.visible = shred < 0.98 && words > 0;
      (strip.material as THREE.MeshBasicMaterial).opacity = 1 - shred;
      strip.rotation.z = -0.03;
      tiles.forEach((tl, i) => {
        const [sx, sy, sz, rot] = SHRED[i];
        const homeX = -1.55 + [0.12, 0.6, 1.25, 1.95, 2.55][i];
        const jx = -0.95 + [0, 0.62, 1.25, 1.85, 2.45][i] * 0.8;
        const k = ease.out(shred);
        tl.visible = shred > 0.02 && join < 0.98 && words > 0;
        tl.position.set(
          homeX + (sx - homeX) * k + (jx - sx) * join,
          sy * k * (1 - join) + Math.sin(t * 1.3 + i) * 0.04 * wob * k,
          sz * k * (1 - join),
        );
        tl.rotation.set(rot * k * 0.6 * (1 - join), rot * k * (1 - join), rot * 0.5 * k * (1 - join));
        (tl.material as THREE.MeshBasicMaterial).opacity = 1 - join;
      });
      rejoined.visible = english.visible = join > 0.02 && off < 0.98 && words > 0;
      (rejoined.material as THREE.MeshBasicMaterial).opacity = join * (1 - off);
      (english.material as THREE.MeshBasicMaterial).opacity = join * (1 - off);
      rejoined.position.set(0, 0.15 + off * 1.2, 0);
      english.position.set(0.25, -0.38 + off * 1.2, 0.02);
      rejoined.rotation.z = 0.02;

      /* 3 · two channels   4 · fused into seven */
      const show = free ? 1 : band(2.6, 3.1, u);
      const fuse = free ? 1 : band(3.6, 4.4, u);
      PU.uA.value = show;
      const target = free ? SPREAD[mode] : SPREAD.fused;
      spread.a += (target[0] - spread.a) * Math.min(1, 0.06 * dt);
      spread.b += (target[1] - spread.b) * Math.min(1, 0.06 * dt);
      for (let i = 0; i < N; i++) {
        const [gx, gy, gz] = rnd[i];
        const c = cls(i);
        /* channels: dense (round) on the left, sparse (square) on the right */
        const isSparse = i % 2 === 1;
        const ax = isSparse ? 1.5 : -1.5;
        const chx = ax + (isSparse ? (rnd[i][3] < 0.33 ? gx * 1.3 : gx * 0.08) : gx * 0.62);
        const chy = isSparse ? (rnd[i][3] > 0.66 ? gy * 1.3 : gy * 0.08) : gy * 0.62;
        const chz = isSparse ? (rnd[i][3] >= 0.33 && rnd[i][3] <= 0.66 ? gz * 1.3 : gz * 0.08) : gz * 0.62;
        const [cx, cy, cz] = centre(c);
        const sa = spread.a, sb = spread.b;
        const fx = cx + gx * (rnd[i][4] < 0.5 ? sb : sa), fy = cy + gy * sa, fz = cz + gz * sa;
        const k = ease.io(fuse);
        pos[i * 3] = chx + (fx - chx) * k;
        pos[i * 3 + 1] = chy + (fy - chy) * k + Math.sin(t + i) * 0.01 * wob;
        pos[i * 3 + 2] = chz + (fz - chz) * k;
      }
      pg.attributes.position.needsUpdate = true;
      labels.forEach((l) => { (l.material as THREE.SpriteMaterial).opacity = free ? 1 : band(4.2, 4.6, u); });

      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = u - Math.floor(u);
      cp.lerpVectors(K[i0][0], K[i1][0], f); ct.lerpVectors(K[i0][1], K[i1][1], f);
      if (stage.w / stage.h < 0.8) cp.sub(ct).multiplyScalar(1.5).add(ct);
      cam.position.copy(cp); cam.lookAt(ct);
      root.rotation.y = stage.orbit.yaw + (reduced ? 0 : Math.sin(t * 0.2) * 0.06);
      root.rotation.x = stage.orbit.pitch * 0.6;

      if (free) {
        /* nearest class centre to the pointer, in screen space */
        let best = -1, bd = 0.09;
        const v = new THREE.Vector3();
        if (stage.pointer.inside) {
          for (let c = 0; c < 7; c++) {
            const [x, y, z] = centre(c);
            v.set(x, y, z).applyMatrix4(root.matrixWorld).project(cam);
            const d = Math.hypot(v.x - stage.pointer.ndc.x, (v.y - stage.pointer.ndc.y) * (stage.h / stage.w));
            if (d < bd) { bd = d; best = c; }
          }
        }
        env.readout(best >= 0 ? `${SEVEN[best][0]} · ${SEVEN[best][1]}` : `${mode} · rank 1 of 25 · macro-F1 0.3773`);
      } else env.readout('');
    },
  };
};
