/* Paper — the mechanism in 3D: a pen drawing of a head with the 14 DREAMER
   electrode sites, threads to a chart-recorder sheet where the traces run,
   the valence/arousal/dominance cube, and the report that tears off.
   Everything is ink line-work on paper; traces come from a generator. */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease, textTexture } from '@/projects/_shared/stage3d';

const INK = '#22357a', PEN2 = '#0f7c6b', PENCIL = '#c6362f', MUTED = '#8a7e79';

/* approximate 10-20 sites: inclination from the vertex, azimuth from the nose (deg) */
export const SITES: [string, number, number, string][] = [
  ['AF3', 72, -25, 'anterior frontal'], ['F7', 92, -54, 'inferior frontal'], ['F3', 62, -40, 'frontal'],
  ['FC5', 78, -69, 'fronto-central'], ['T7', 92, -90, 'temporal'], ['P7', 92, -126, 'parietal'],
  ['O1', 92, -162, 'occipital'], ['O2', 92, 162, 'occipital'], ['P8', 92, 126, 'parietal'],
  ['T8', 92, 90, 'temporal'], ['FC6', 78, 69, 'fronto-central'], ['F4', 62, 40, 'frontal'],
  ['F8', 92, 54, 'inferior frontal'], ['AF4', 72, 25, 'anterior frontal'],
];
const RX = 0.82, RY = 0.98, RZ = 1.0;
const onHead = (incl: number, az: number, lift = 0) => {
  const i = THREE.MathUtils.degToRad(incl), a = THREE.MathUtils.degToRad(az);
  return new THREE.Vector3(Math.sin(i) * Math.sin(a) * (RX + lift), Math.cos(i) * (RY + lift) + 0.25, Math.sin(i) * Math.cos(a) * (RZ + lift));
};

/* a deterministic EEG-ish signal: a few rhythms plus burst noise */
function sig(ch: number, x: number, clean: number) {
  const s = ch * 1.37;
  let v = Math.sin(x * 9.1 + s) * 0.35 + Math.sin(x * 21.7 + s * 2.1) * 0.22 + Math.sin(x * 4.3 + s * 0.7) * 0.28;
  v += Math.sin(x * 47 + s * 3.3) * 0.12 * (1 - clean * 0.7);
  const n = Math.sin(x * 131.1 + s * 9.7) * Math.sin(x * 77.3 + s) * 0.5 * (1 - clean);
  return v + n;
}

export const eegScene: Builder = (stage, env) => {
  const { scene, camera } = stage;
  const cam = camera as THREE.PerspectiveCamera;
  const root = new THREE.Group();
  scene.add(root);
  const headG = new THREE.Group();
  root.add(headG);

  /* ── the head, as pen line-work ── */
  const pts: number[] = [];
  const headR = (y: number, ang: number) => {
    /* ellipsoid cross-section, a nose bump at the front, a jaw taper */
    const t = (y - 0.25) / RY;
    const base = Math.sqrt(Math.max(0, 1 - t * t));
    const jaw = y < 0 ? 1 - Math.min(0.35, -y * 0.5) : 1;
    const nose = Math.exp(-((y + 0.05) ** 2) / 0.02) * Math.exp(-(ang * ang) / 0.02) * 0.16;
    return { r: base * jaw, nose };
  };
  for (let k = 1; k < 16; k++) {
    const y = 0.25 + RY * (1 - (k / 16) * 1.75);
    if (y < -0.62) continue;
    for (let i = 0; i < 72; i++) {
      for (const j of [i, i + 1]) {
        const ang = (j / 72) * Math.PI * 2 - Math.PI;
        const { r, nose } = headR(y, ang);
        pts.push(Math.sin(ang) * RX * r, y, Math.cos(ang) * (RZ * r + nose));
      }
    }
  }
  for (let m = 0; m < 18; m++) {
    const ang = (m / 18) * Math.PI * 2 - Math.PI;
    for (let i = 0; i < 40; i++) {
      for (const j of [i, i + 1]) {
        const y = 0.25 + RY - (j / 40) * (RY + 0.85);
        const { r, nose } = headR(y, ang);
        pts.push(Math.sin(ang) * RX * r, y, Math.cos(ang) * (RZ * r + nose));
      }
    }
  }
  const headGeo = new THREE.BufferGeometry();
  headGeo.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3));
  const headMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.32 });
  headG.add(new THREE.LineSegments(headGeo, headMat));
  /* the neck */
  const neck: number[] = [];
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    neck.push(Math.sin(a) * 0.36, -0.55, Math.cos(a) * 0.4 - 0.1, Math.sin(a) * 0.4, -1.15, Math.cos(a) * 0.44 - 0.12);
  }
  const ng = new THREE.BufferGeometry();
  ng.setAttribute('position', new THREE.Float32BufferAttribute(neck, 3));
  headG.add(new THREE.LineSegments(ng, headMat));

  /* ── electrodes ── */
  const elG = new THREE.SphereGeometry(0.034, 14, 10);
  const electrodes = SITES.map(([name, inc, az, region], i) => {
    const m = new THREE.Mesh(elG, new THREE.MeshBasicMaterial({ color: PENCIL, transparent: true }));
    m.position.copy(onHead(inc, az, 0.02));
    m.userData = { i, name, region };
    headG.add(m);
    const { tex, aspect } = textTexture([name], '600 22px SplineMonoPP, ui-monospace, monospace', INK);
    const lab = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    lab.scale.set(0.09 * aspect, 0.09, 1);
    lab.position.copy(onHead(inc, az, 0.16));
    headG.add(lab);
    return { m, lab };
  });

  /* ── the chart paper and its 14 lanes ── */
  const PX0 = 0.7, PX1 = 5.6, LANE = 0.17, PY0 = 1.25;
  const gridC = document.createElement('canvas');
  gridC.width = 1024; gridC.height = 600;
  {
    const x = gridC.getContext('2d')!;
    x.fillStyle = '#f6ede6'; x.fillRect(0, 0, 1024, 600);
    for (let i = 0; i <= 1024; i += 8) { x.strokeStyle = i % 40 === 0 ? '#e39a93' : '#f2c6be'; x.lineWidth = i % 40 === 0 ? 1.4 : 0.7; x.beginPath(); x.moveTo(i, 0); x.lineTo(i, 600); x.stroke(); }
    for (let j = 0; j <= 600; j += 8) { x.strokeStyle = j % 40 === 0 ? '#e39a93' : '#f2c6be'; x.lineWidth = j % 40 === 0 ? 1.4 : 0.7; x.beginPath(); x.moveTo(0, j); x.lineTo(1024, j); x.stroke(); }
  }
  const gridTex = new THREE.CanvasTexture(gridC);
  gridTex.colorSpace = THREE.SRGBColorSpace;
  const PH = LANE * 14 + 0.3;
  const paper = new THREE.Mesh(new THREE.PlaneGeometry(PX1 - PX0, PH), new THREE.MeshBasicMaterial({ map: gridTex, transparent: true }));
  paper.position.set((PX0 + PX1) / 2, PY0 - PH / 2 + 0.15, -0.9);
  root.add(paper);

  const TN = 420;
  const traces = SITES.map((_, ch) => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(TN * 3), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: ch % 2 ? PEN2 : INK, transparent: true }));
    root.add(l);
    return l;
  });
  /* threads: electrode → the start of its lane */
  const threads = SITES.map(() => {
    const g = new THREE.BufferGeometry();
    g.setAttribute('position', new THREE.BufferAttribute(new Float32Array(24 * 3), 3));
    const l = new THREE.Line(g, new THREE.LineBasicMaterial({ color: MUTED, transparent: true, opacity: 0 }));
    root.add(l);
    return l;
  });

  /* ── the VAD cube, in pencil ── */
  const cube = new THREE.Group();
  cube.position.set(3.7, -0.5, 0.2);
  root.add(cube);
  const cubeLines = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.BoxGeometry(1.2, 1.2, 1.2)), new THREE.LineBasicMaterial({ color: INK, transparent: true }));
  cube.add(cubeLines);
  const dot = new THREE.Mesh(new THREE.SphereGeometry(0.06, 16, 12), new THREE.MeshBasicMaterial({ color: PENCIL, transparent: true }));
  cube.add(dot);
  const dropG = new THREE.BufferGeometry();
  dropG.setAttribute('position', new THREE.BufferAttribute(new Float32Array(18), 3));
  const drops = new THREE.LineSegments(dropG, new THREE.LineDashedMaterial({ color: PENCIL, dashSize: 0.04, gapSize: 0.03, transparent: true }));
  cube.add(drops);
  const axisLab = (txt: string, pos: THREE.Vector3) => {
    const { tex, aspect } = textTexture([txt], '500 22px SplineMonoPP, ui-monospace, monospace', PENCIL);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    s.scale.set(0.085 * aspect, 0.085, 1);
    s.position.copy(pos);
    cube.add(s);
    return s;
  };
  const cubeLabs = [
    axisLab('valence 98.6%', new THREE.Vector3(0, -0.76, 0.66)),
    axisLab('arousal 96.6%', new THREE.Vector3(-0.98, 0, 0.66)),
    axisLab('dominance 95.7%', new THREE.Vector3(0.62, -0.72, -0.2)),
  ];

  /* ── the report that tears off ── */
  const rep = textTexture(
    ['REPORT · cumulative wellbeing', '', 'emotional state ........ ✓', 'cognitive load ......... ✓', 'rest + diet guidance .... ✓', 'when to see a clinician . ✓', '', 'BioGPT grounds · agent 2 writes'],
    '400 20px SplineMonoPP, ui-monospace, monospace', '#151a2e', { bg: '#efe2d8', pad: 22 },
  );
  const report = new THREE.Mesh(new THREE.PlaneGeometry(0.95 * rep.aspect, 0.95), new THREE.MeshBasicMaterial({ map: rep.tex, transparent: true, side: THREE.DoubleSide }));
  report.position.set(3.7, -0.4, 0.7);
  root.add(report);

  /* ── camera keys: 0 head · 1 traces · 2 clean · 3 vad · 4 report · free ── */
  const K: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(-1.1, 0.8, 4.4), new THREE.Vector3(-0.3, 0.25, 0)],
    [new THREE.Vector3(1.4, 1.0, 6.6), new THREE.Vector3(2.0, 0.3, -0.5)],
    [new THREE.Vector3(3.6, 0.7, 4.4), new THREE.Vector3(3.2, 0.4, -0.8)],
    [new THREE.Vector3(4.6, 1.0, 4.8), new THREE.Vector3(3.3, -0.4, 0)],
    [new THREE.Vector3(4.2, 0.4, 4.4), new THREE.Vector3(3.3, -0.3, 0.3)],
    [new THREE.Vector3(1.4, 0.9, 7.2), new THREE.Vector3(2.0, 0.1, -0.3)],
  ];
  stage.onResize = () => { cam.fov = stage.w / stage.h < 0.8 ? 58 : 36; cam.updateProjectionMatrix(); };
  stage.onResize();

  let solo = -1;
  stage.onClick = () => {
    const hit = stage.pick(electrodes.map((e) => e.m), false);
    solo = hit ? (hit.object.userData.i === solo ? -1 : hit.object.userData.i) : -1;
  };
  const cp = new THREE.Vector3(), ct = new THREE.Vector3(), wv = new THREE.Vector3(), lv = new THREE.Vector3();
  const vad = new THREE.Vector3(0.62, 0.34, 0.55);

  return {
    frame({ beat, local, t, free, reduced }) {
      const u = beat + band(0.5, 1, local);
      const run = reduced ? 0 : t * 0.6;

      /* electrodes come on one by one in panel 0 */
      electrodes.forEach(({ m, lab }, i) => {
        const on = free ? 1 : band(0.05 + i * 0.045, 0.12 + i * 0.045, u);
        (m.material as THREE.MeshBasicMaterial).color.set(on > 0.5 ? (solo === i ? PENCIL : INK) : PENCIL);
        m.scale.setScalar(0.4 + on * 0.6 + (solo === i ? 0.5 : 0));
        (lab.material as THREE.SpriteMaterial).opacity = on * (u > 2.6 && !free ? 0.25 : 1);
      });
      headMat.opacity = 0.32 * (1 - band(2.6, 3.2, u) * 0.6 * (free ? 0 : 1));

      /* threads and traces: written onto the paper from panel 1 */
      const write = free ? 1 : band(0.8, 1.6, u);
      const clean = free ? 1 : band(1.7, 2.4, u);
      paper.material.opacity = band(0.6, 1.1, u) * (free ? 1 : 1 - band(3.3, 3.8, u) * 0.6);
      headG.updateMatrixWorld();
      SITES.forEach((_, ch) => {
        const ly = PY0 - LANE * ch;
        const pa = traces[ch].geometry.attributes.position as THREE.BufferAttribute;
        const xmax = PX0 + 0.1 + (PX1 - PX0 - 0.2) * write;
        for (let i = 0; i < TN; i++) {
          const x = PX0 + 0.1 + ((PX1 - PX0 - 0.2) * i) / (TN - 1);
          const xx = Math.min(x, xmax);
          pa.setXYZ(i, xx, ly + sig(ch, xx * 0.8 + run, clean) * LANE * 0.32, -0.88);
        }
        pa.needsUpdate = true;
        const alpha = write > 0.01 ? (solo < 0 || solo === ch ? 1 : 0.12) : 0;
        (traces[ch].material as THREE.LineBasicMaterial).opacity = alpha;
        /* thread: a slack curve from the electrode to the lane start */
        electrodes[ch].m.getWorldPosition(wv);
        root.worldToLocal(wv);
        const ta = threads[ch].geometry.attributes.position as THREE.BufferAttribute;
        lv.set(PX0 + 0.1, ly, -0.88);
        for (let i = 0; i < 24; i++) {
          const k = i / 23;
          ta.setXYZ(i, wv.x + (lv.x - wv.x) * k, wv.y + (lv.y - wv.y) * k - Math.sin(k * Math.PI) * 0.25, wv.z + (lv.z - wv.z) * k);
        }
        ta.needsUpdate = true;
        (threads[ch].material as THREE.LineBasicMaterial).opacity = band(0.7, 1.2, u) * (solo < 0 || solo === ch ? 0.5 : 0.08) * (free ? 1 : 1 - band(2.6, 3.0, u));
      });

      /* VAD: the point settles into the cube */
      const vIn = free ? 0.35 : band(2.5, 3.1, u) * (1 - band(3.6, 4.2, u) * 0.4);
      cube.visible = vIn > 0.01;
      (cubeLines.material as THREE.LineBasicMaterial).opacity = vIn;
      const settle = ease.out(band(2.7, 3.4, u));
      dot.position.set((vad.x - 0.5) * 1.2 * settle, (vad.y - 0.5) * 1.2 * settle, (vad.z - 0.5) * 1.2 * settle);
      (dot.material as THREE.MeshBasicMaterial).opacity = vIn > 0.01 ? Math.max(vIn, 0.6) : 0;
      const d = dot.position, h = 0.6;
      (dropG.attributes.position as THREE.BufferAttribute).set([d.x, d.y, d.z, d.x, -h, d.z, d.x, d.y, d.z, -h, d.y, d.z, d.x, d.y, d.z, d.x, d.y, -h]);
      dropG.attributes.position.needsUpdate = true;
      drops.computeLineDistances();
      (drops.material as THREE.LineDashedMaterial).opacity = vIn;
      cubeLabs.forEach((s) => { (s.material as THREE.SpriteMaterial).opacity = vIn; });
      cube.rotation.y = -0.5 + (reduced ? 0 : Math.sin(t * 0.3) * 0.08);

      /* the report slides out of the machine */
      const rIn = free ? 0 : band(3.6, 4.3, u);
      report.visible = rIn > 0.01;
      report.position.y = -1.6 + rIn * 1.3;
      report.rotation.z = (1 - rIn) * -0.12;
      (report.material as THREE.MeshBasicMaterial).opacity = rIn;

      /* camera */
      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = u - Math.floor(u);
      cp.lerpVectors(K[i0][0], K[i1][0], f); ct.lerpVectors(K[i0][1], K[i1][1], f);
      /* a portrait phone sees a narrow slice: stand further back */
      if (stage.w / stage.h < 0.8) cp.sub(ct).multiplyScalar(1.75).add(ct);
      cam.position.copy(cp); cam.lookAt(ct);
      headG.rotation.y = stage.orbit.yaw + (reduced ? 0 : Math.sin(t * 0.25) * 0.12) - 0.25;
      headG.rotation.x = stage.orbit.pitch * 0.5;

      if (free) {
        const hit = stage.pick(electrodes.map((e) => e.m), false);
        const i = hit ? (hit.object.userData.i as number) : solo;
        env.readout(i >= 0 ? `${SITES[i][0]} · ${SITES[i][3]} · channel ${i + 1} of 14 @ 128 Hz` : 'click an electrode');
        stage.renderer.domElement.style.cursor = hit ? 'pointer' : '';
      } else env.readout('');
    },
  };
};
