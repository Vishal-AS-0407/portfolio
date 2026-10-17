/* Sealed — the mechanism in 3D: two institutions as glass vaults. Rows never
   leave them; SMOTE thickens the fraud class inside each; each grows its own
   models; only sealed parameter packets cross the gate; a transaction is put
   to the hard vote. Rows and packets are illustrative. */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease, textTexture } from '@/projects/_shared/stage3d';

const INK = '#0b0d10', NOISE = '#a4abb5', CA = '#0075c4', CB = '#5b3df5', GND = '#e8eaed';
const MONO = (px: number, w = 500) => `${w} ${px}px PlexMonoSD, ui-monospace, monospace`;

export const sealedScene: Builder = (stage, env) => {
  const { scene, camera } = stage;
  const cam = camera as THREE.PerspectiveCamera;
  const root = new THREE.Group();
  scene.add(root);
  const W = 1.7, H = 1.5, D = 1.3;

  const vault = (x: number, hex: string, name: string) => {
    const g = new THREE.Group();
    g.position.x = x;
    root.add(g);
    const box = new THREE.BoxGeometry(W, H, D);
    g.add(new THREE.LineSegments(new THREE.EdgesGeometry(box), new THREE.LineBasicMaterial({ color: INK })));
    const glass = new THREE.Mesh(box, new THREE.MeshBasicMaterial({ color: '#ffffff', transparent: true, opacity: 0.22, depthWrite: false }));
    g.add(glass);
    const { tex, aspect } = textTexture([name], MONO(22, 600), hex);
    const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true }));
    lab.scale.set(0.13 * aspect, 0.13, 1);
    lab.position.set(0, -H / 2 - 0.2, D / 2);
    g.add(lab);

    /* 40 real rows, 3 of them fraud; 16 synthetic fraud rows appear with SMOTE */
    const R = 22, S = 12;
    const rows = new THREE.InstancedMesh(new THREE.BoxGeometry(W * 0.82, 0.007, D * 0.7), new THREE.MeshBasicMaterial({ color: '#ffffff' }), R + S);
    const m4 = new THREE.Matrix4();
    const fraudIdx = [4, 12, 18];
    for (let i = 0; i < R; i++) {
      rows.setMatrixAt(i, m4.makeTranslation(0, -H / 2 + 0.1 + i * 0.058, 0));
      rows.setColorAt(i, new THREE.Color(fraudIdx.includes(i) ? hex : NOISE));
    }
    for (let k = 0; k < S; k++) { rows.setColorAt(R + k, new THREE.Color(hex).lerp(new THREE.Color('#ffffff'), 0.45)); rows.setMatrixAt(R + k, m4.makeScale(0.0001, 1, 1)); }
    g.add(rows);

    /* the local models: an MLP stack (64 → 32 → 16 → 1) and a 400-tree forest */
    const mlp = new THREE.Group();
    mlp.position.y = H / 2 + 0.12;
    [64, 32, 16, 1].forEach((n, i) => {
      const s = Math.max(0.08, (n / 64) * 1.1);
      const pl = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(s, s * 0.7).rotateX(-Math.PI / 2)), new THREE.LineBasicMaterial({ color: hex, transparent: true }));
      pl.position.y = i * 0.16;
      mlp.add(pl);
    });
    g.add(mlp);
    const TREES = env.coarse ? 160 : 400;
    const forest = new THREE.InstancedMesh(new THREE.BoxGeometry(0.0035, 1, 0.0035), new THREE.MeshBasicMaterial({ color: '#5a626c', transparent: true }), TREES);
    const fh: number[] = [];
    for (let i = 0; i < TREES; i++) fh.push(0.12 + ((Math.sin(i * 91.7 + x) * 43758.5) % 1 + 1) % 1 * 0.3);
    g.add(forest);
    return { g, rows, mlp, forest, fh, R, S, fraudIdx, hex, glass };
  };
  const A = vault(-2.1, CA, 'institution a');
  const B = vault(2.1, CB, 'institution b');

  /* the gate between them, and the aggregator above it */
  const gate = new THREE.Mesh(new THREE.BoxGeometry(0.06, 2.4, 0.5), new THREE.MeshBasicMaterial({ color: INK }));
  gate.position.y = 0.2;
  root.add(gate);
  const agg = new THREE.Group();
  agg.position.set(0, 1.85, 0);
  root.add(agg);
  const aggBox = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.62, 0.62), new THREE.MeshBasicMaterial({ color: INK }));
  agg.add(aggBox);
  agg.add(new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(0.7, 0.7, 0.7)), new THREE.LineBasicMaterial({ color: INK })));

  /* sealed packets: ciphertext on every face */
  const cipherTex = () => {
    const c = document.createElement('canvas'); c.width = c.height = 128;
    const x = c.getContext('2d')!;
    x.fillStyle = INK; x.fillRect(0, 0, 128, 128);
    x.fillStyle = GND; x.font = MONO(15);
    const hexs = '0123456789abcdef';
    for (let r = 0; r < 7; r++) {
      let s = '';
      for (let k = 0; k < 9; k++) s += hexs[(Math.random() * 16) | 0];
      x.fillText(s, 8, 20 + r * 16);
    }
    const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
  };
  const pkMat = new THREE.MeshBasicMaterial({ map: cipherTex() });
  const PK = 6;
  const packets = [A, B].map((v) => Array.from({ length: PK }, () => {
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.16, 0.16), pkMat);
    root.add(m);
    return { m, v };
  })).flat();

  /* the transaction and the two votes */
  const tx = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.05, 0.3), new THREE.MeshBasicMaterial({ color: INK }));
  root.add(tx);
  const voteSprite = (txt: string, hex: string) => {
    const { tex, aspect } = textTexture([txt], MONO(26, 600), hex, { bg: GND, pad: 8 });
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    s.scale.set(0.19 * aspect, 0.19, 1);
    root.add(s);
    return s;
  };
  const verdicts = {
    fraud: [voteSprite('fraud', CA), voteSprite('fraud', CB), voteSprite('FRAUD · 2 of 2 · ~3 ms', INK)],
    legit: [voteSprite('legit', CA), voteSprite('legit', CB), voteSprite('LEGIT · 2 of 2 · ~3 ms', INK)],
  };
  const zeroLab = voteSprite('raw records shared: 0', INK);
  zeroLab.position.set(0, -1.15, 0.8);

  let kind: 'fraud' | 'legit' = 'fraud';
  let txT = 9;
  stage.onClick = () => { if (txT > 1.5) txT = 0; };

  const K: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(0, 1.4, 7.4), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(-3.6, 0.9, 3.9), new THREE.Vector3(-2.0, -0.1, 0)],
    [new THREE.Vector3(0, 2.6, 7.0), new THREE.Vector3(0, 0.8, 0)],
    [new THREE.Vector3(0, 2.0, 6.6), new THREE.Vector3(0, 1.0, 0)],
    [new THREE.Vector3(0, 1.6, 7.2), new THREE.Vector3(0, 0.6, 0)],
    [new THREE.Vector3(1.0, 2.2, 7.6), new THREE.Vector3(0, 0.5, 0)],
  ];
  stage.onResize = () => { cam.fov = stage.w / stage.h < 0.8 ? 64 : 36; cam.updateProjectionMatrix(); };
  stage.onResize();
  const cp = new THREE.Vector3(), ct = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v3 = new THREE.Vector3(), s3 = new THREE.Vector3();

  return {
    control(k, v) {
      if (k === 'tx') { kind = v as 'fraud' | 'legit'; txT = 0; }
    },
    frame({ beat, local, t, dt, free, reduced }) {
      const u = beat + band(0.5, 1, local);
      const smote = free ? 1 : band(0.9, 1.6, u);
      const models = free ? 1 : band(1.9, 2.5, u);
      const send = free ? 1 : band(2.6, 3.5, u);
      const vote = band(3.6, 4.4, u);

      for (const V of [A, B]) {
        /* SMOTE: synthetic rows slide in between the real fraud rows */
        for (let k = 0; k < V.S; k++) {
          const near = V.fraudIdx[k % 3];
          const y = -H / 2 + 0.1 + near * 0.058 + (((k / 3) | 0) + 1) * 0.0095;
          const sc = ease.out(Math.max(0, Math.min(1, smote * 1.4 - k / V.S * 0.4)));
          V.rows.setMatrixAt(V.R + k, m4.compose(v3.set((1 - sc) * 1.2, y, 0), q.identity(), s3.set(Math.max(0.0001, sc), 0.6, 1)));
        }
        V.rows.instanceMatrix.needsUpdate = true;
        V.mlp.scale.setScalar(Math.max(0.001, models));
        V.mlp.rotation.y = reduced ? 0 : t * 0.3;
        (V.forest.material as THREE.MeshBasicMaterial).opacity = models * 0.55;
        V.forest.visible = models > 0.01;
        const n = V.fh.length;
        for (let i = 0; i < n; i++) {
          const a = (i / n) * Math.PI * 2 * 7.3;
          const r = 0.55 + (i % 9) * 0.035;
          const h = V.fh[i] * models;
          V.forest.setMatrixAt(i, m4.compose(v3.set(Math.cos(a) * r * 1.25, H / 2 + h / 2, Math.sin(a) * r * 0.95), q.identity(), s3.set(1, Math.max(0.001, h), 1)));
        }
        V.forest.instanceMatrix.needsUpdate = true;
      }

      /* packets cross the gate — the rows never do */
      packets.forEach(({ m, v }, i) => {
        const k = i % PK;
        const ph = free ? ((t * 0.35 + k / PK) % 1) : Math.max(0, Math.min(1, send * 1.6 - k * 0.12));
        const sx = v.g.position.x, from = v3.set(sx, H / 2 + 0.6, 0);
        const ex = 0, ey = 1.85;
        const x = from.x + (ex - from.x) * ph, y = from.y + (ey - from.y) * ph + Math.sin(ph * Math.PI) * 0.5;
        m.position.set(x, y, (k - PK / 2) * 0.06);
        m.rotation.set(t * 0.8 + k, t * 0.6, 0);
        m.visible = (send > 0.01 || free) && ph > 0.01 && ph < 0.99;
      });
      aggBox.rotation.y = reduced ? 0 : t * 0.2;

      /* the vote: storyboard panel 5, or the reader's transaction */
      let phase = -1;
      if (free) { txT += dt / 60; phase = txT; } else if (vote > 0) phase = Math.min(2.0, vote * 2.2);
      const kv = free ? kind : 'fraud';
      Object.entries(verdicts).forEach(([k2, arr]) => arr.forEach((s) => { s.visible = false; void k2; }));
      tx.visible = phase >= 0 && phase < 4.5;
      if (tx.visible) {
        const p1 = Math.min(1, phase / 0.8);
        tx.position.set(0, 0.4 - p1 * 0.1, 2.4 - p1 * 1.4);
        (tx.material as THREE.MeshBasicMaterial).color.set(kv === 'fraud' ? '#c8102e' : INK);
        if (phase > 0.8) {
          const [va, vb, vv] = verdicts[kv];
          va.visible = vb.visible = true;
          va.position.set(A.g.position.x, H / 2 + 1.0, 0.4);
          vb.position.set(B.g.position.x, H / 2 + 1.0, 0.4);
          if (phase > 1.3) { vv.visible = true; vv.position.set(0, 2.5, 0.4); }
        }
      }

      /* the counter that never moves */
      (zeroLab.material as THREE.SpriteMaterial).opacity = free ? 1 : band(0.2, 0.6, u);

      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = u - Math.floor(u);
      cp.lerpVectors(K[i0][0], K[i1][0], f); ct.lerpVectors(K[i0][1], K[i1][1], f);
      if (stage.w / stage.h < 0.8) cp.sub(ct).multiplyScalar(1.45).add(ct);
      cam.position.copy(cp); cam.lookAt(ct);
      root.rotation.y = stage.orbit.yaw + (reduced ? 0 : Math.sin(t * 0.15) * 0.06);
      root.rotation.x = stage.orbit.pitch * 0.5;
      env.readout(free ? `raw records shared: 0 · ${tx.visible && phase > 1.3 ? `verdict: ${kv} (2 of 2 votes)` : 'click the scene or pick a transaction'}` : '');
    },
  };
};
