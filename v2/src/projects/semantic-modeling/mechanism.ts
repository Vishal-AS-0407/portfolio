/* The Plate — the mechanism in 3D, drawn as a blueprint: PDF sheets, the
   entities lifted out of them, the duplicates collapsing, the relations and
   their centres, then three clusterings that disagree and the consensus they
   reach. Built from the page's own graph (./sim). */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease, textTexture } from '@/projects/_shared/stage3d';
import { buildGraph, N_TOPICS, TOPIC_NAMES } from './sim';

const LINE = '#bbd6f2', INK = '#eaf3ff', HOT = '#ff8a3d', FIG = '#ffe066';
export const ALGOS = ['louvain', 'spectral', 'node2vec', 'consensus'] as const;
type Algo = (typeof ALGOS)[number];

export const plateScene: Builder = (stage, env) => {
  const { scene, camera } = stage;
  const cam = camera as THREE.PerspectiveCamera;
  const root = new THREE.Group();
  root.position.y = -0.45;
  scene.add(root);

  const G = buildGraph(env.coarse ? 160 : 240);
  const n = G.nodes.length;

  /* ── a 3D layout: topics on a sphere shell, members around them, relaxed ── */
  const P = G.nodes.map((nd) => {
    const t = nd.con;
    const a = (t / N_TOPICS) * Math.PI * 2 * 2.618, z = 1 - (2 * (t + 0.5)) / N_TOPICS;
    const rr = Math.sqrt(1 - z * z);
    const c = new THREE.Vector3(Math.cos(a) * rr, z * 0.75, Math.sin(a) * rr).multiplyScalar(1.9);
    const s = nd.seed * 6.283;
    return c.add(new THREE.Vector3(Math.cos(s) * 0.45, Math.sin(s * 1.7) * 0.45, Math.sin(s) * 0.45).multiplyScalar(0.4 + nd.seed));
  });
  {
    const adj: number[][] = Array.from({ length: n }, () => []);
    for (const [a, b] of G.edges) { adj[a].push(b); adj[b].push(a); }
    const v = new THREE.Vector3();
    for (let it = 0; it < 60; it++) {
      for (let i = 0; i < n; i++) for (const j of adj[i]) {
        v.subVectors(P[j], P[i]);
        const d = v.length() || 1;
        P[i].addScaledVector(v, ((d - 0.5) / d) * 0.02);
      }
      for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) {
        v.subVectors(P[i], P[j]);
        const d2 = v.lengthSq();
        if (d2 < 0.09 && d2 > 1e-6) { v.multiplyScalar(0.012 / d2); P[i].add(v); P[j].sub(v); }
      }
    }
  }

  /* ── the PDFs: a stack of drawn sheets ── */
  const sheets: THREE.LineSegments[] = [];
  const sheetGeo = (() => {
    const pts: number[] = [];
    const w = 0.85, h = 1.1;
    pts.push(-w / 2, 0, -h / 2, w / 2, 0, -h / 2, w / 2, 0, -h / 2, w / 2, 0, h / 2, w / 2, 0, h / 2, -w / 2, 0, h / 2, -w / 2, 0, h / 2, -w / 2, 0, -h / 2);
    for (let k = 0; k < 9; k++) { const z = -h / 2 + 0.16 + k * 0.1; pts.push(-w / 2 + 0.08, 0, z, w / 2 - 0.08 - (k % 3) * 0.12, 0, z); }
    const g = new THREE.BufferGeometry(); g.setAttribute('position', new THREE.Float32BufferAttribute(pts, 3)); return g;
  })();
  for (let s = 0; s < 12; s++) {
    const m = new THREE.LineSegments(sheetGeo, new THREE.LineBasicMaterial({ color: LINE, transparent: true }));
    m.position.set((s % 4 - 1.5) * 1.05, -1.9 + ((s / 4) | 0) * 0.04, ((s / 4) | 0) * 0.15 - 0.15);
    m.rotation.y = (s % 3 - 1) * 0.05;
    root.add(m);
    sheets.push(m);
  }
  const from = G.nodes.map((_, i) => sheets[i % 12].position.clone().add(new THREE.Vector3((Math.sin(i) * 0.3), 0.01, Math.cos(i * 1.3) * 0.4)));

  /* ── nodes ── */
  const nodes = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 10, 8), new THREE.MeshBasicMaterial({ color: '#ffffff' }), n);
  nodes.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  root.add(nodes);
  const pal = Array.from({ length: N_TOPICS * 2 }, (_, k) => new THREE.Color().setHSL((k * 0.137) % 1, 0.62, 0.68));
  const colOf = (i: number, a: Algo) => {
    const nd = G.nodes[i];
    if (a === 'consensus') return pal[nd.con];
    return pal[nd.part[ALGOS.indexOf(a)] % pal.length];
  };

  /* ── edges ── */
  const eg = new THREE.BufferGeometry();
  const epos = new Float32Array(G.edges.length * 6);
  eg.setAttribute('position', new THREE.BufferAttribute(epos, 3).setUsage(THREE.DynamicDrawUsage));
  const ecol = new Float32Array(G.edges.length * 6).fill(1);
  eg.setAttribute('color', new THREE.BufferAttribute(ecol, 3).setUsage(THREE.DynamicDrawUsage));
  const edgeMat = new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, opacity: 0 });
  root.add(new THREE.LineSegments(eg, edgeMat));

  /* topic labels for the five largest */
  const labels = G.nodes.filter((nd) => nd.label && nd.con < 5).map((nd) => {
    const { tex, aspect } = textTexture([nd.label!], '700 24px SyneBP, system-ui, sans-serif', FIG);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false }));
    s.scale.set(0.16 * aspect, 0.16, 1);
    root.add(s);
    return { s, i: nd.i };
  });

  const adj2 = (() => {
    const a: Set<number>[] = Array.from({ length: n }, () => new Set());
    for (const [x, y] of G.edges) { a[x].add(y); a[y].add(x); }
    return a;
  })();
  let algo: Algo = 'consensus';
  let focus = -1;
  let hood = new Set<number>();
  stage.onClick = () => {
    const hit = stage.pick([nodes], false);
    const id = hit?.instanceId ?? -1;
    if (id < 0 || id === focus) { focus = -1; hood = new Set(); return; }
    focus = id;
    hood = new Set([id]);
    for (const j of adj2[id]) { hood.add(j); for (const k of adj2[j]) hood.add(k); }
  };

  const K: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(0, 0.15, 4.2), new THREE.Vector3(0, -2.15, 0)],
    [new THREE.Vector3(2.4, 1.0, 6.2), new THREE.Vector3(0, -0.4, 0)],
    [new THREE.Vector3(0.5, 0.8, 6.6), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(-2.6, 1.6, 6.0), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(0.6, 2.2, 6.4), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(2.2, 1.4, 6.4), new THREE.Vector3(0, 0, 0)],
  ];
  stage.onResize = () => { cam.fov = stage.w / stage.h < 0.8 ? 66 : 40; cam.updateProjectionMatrix(); };
  stage.onResize();
  const cp = new THREE.Vector3(), ct = new THREE.Vector3(), m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), v = new THREE.Vector3(), s3 = new THREE.Vector3();
  const cur = G.nodes.map(() => new THREE.Color('#ffffff'));
  const tmpC = new THREE.Color();

  return {
    control(k, val) { if (k === 'algo') algo = val as Algo; },
    frame({ beat, local, t, dt, free, reduced }) {
      const u = beat + band(0.5, 1, local);
      const lift = free ? 1 : band(0.6, 1.4, u);
      const dedup = free ? 1 : band(1.6, 2.3, u);
      const wire = free ? 1 : band(2.5, 3.2, u);
      sheets.forEach((s) => { (s.material as THREE.LineBasicMaterial).opacity = 0.9 - lift * 0.65; });

      /* which partition colours the nodes: the storyboard walks all three, then agrees */
      let a: Algo = algo;
      if (!free) {
        const c = band(3.4, 4.6, u);
        a = u < 3.4 ? 'consensus' : ALGOS[Math.min(3, Math.floor(c * 4))];
      }
      const tint = free ? 1 : band(3.4, 3.7, u);
      const k = Math.min(1, 0.1 * dt);
      for (let i = 0; i < n; i++) {
        const nd = G.nodes[i];
        const e = ease.io(Math.max(0, Math.min(1, lift * 1.4 - nd.seed * 0.4)));
        v.lerpVectors(from[i], P[i], e);
        let sc = 0.028 + nd.rank * 0.06 * wire;
        if (nd.dupOf >= 0) { v.lerp(P[nd.dupOf], ease.io(dedup)); sc *= 1 - dedup; }
        if (!reduced) v.y += Math.sin(t * 0.7 + nd.seed * 9) * 0.015;
        if (focus >= 0 && free) sc *= hood.has(i) ? 1.5 : 0.6;
        nodes.setMatrixAt(i, m4.compose(v, q.identity(), s3.setScalar(Math.max(0.0001, sc))));
        tmpC.set(INK).lerp(colOf(i, a), tint);
        if (focus >= 0 && free) tmpC.lerp(new THREE.Color(hood.has(i) ? (i === focus ? HOT : FIG) : '#2a4a72'), 0.7);
        cur[i].lerp(tmpC, k * 2);
        nodes.setColorAt(i, cur[i]);
      }
      nodes.instanceMatrix.needsUpdate = true;
      if (nodes.instanceColor) nodes.instanceColor.needsUpdate = true;

      nodes.updateMatrix();
      const pv = new THREE.Vector3();
      G.edges.forEach(([x, y], ei) => {
        nodes.getMatrixAt(x, m4); pv.setFromMatrixPosition(m4); epos.set([pv.x, pv.y, pv.z], ei * 6);
        nodes.getMatrixAt(y, m4); pv.setFromMatrixPosition(m4); epos.set([pv.x, pv.y, pv.z], ei * 6 + 3);
        const on = focus >= 0 && free && hood.has(x) && hood.has(y);
        tmpC.set(on ? HOT : LINE);
        ecol.set([tmpC.r, tmpC.g, tmpC.b, tmpC.r, tmpC.g, tmpC.b], ei * 6);
      });
      eg.attributes.position.needsUpdate = true; eg.attributes.color.needsUpdate = true;
      edgeMat.opacity = wire * 0.45;
      labels.forEach(({ s, i }) => {
        nodes.getMatrixAt(i, m4); s.position.setFromMatrixPosition(m4).add(new THREE.Vector3(0, 0.2, 0));
        (s.material as THREE.SpriteMaterial).opacity = wire;
      });

      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = u - Math.floor(u);
      cp.lerpVectors(K[i0][0], K[i1][0], f); ct.lerpVectors(K[i0][1], K[i1][1], f);
      if (stage.w / stage.h < 0.8) cp.sub(ct).multiplyScalar(1.45).add(ct);
      cam.position.copy(cp); cam.lookAt(ct);
      root.rotation.y = stage.orbit.yaw + (reduced ? 0 : t * 0.04);
      root.rotation.x = stage.orbit.pitch * 0.6;
      cam.position.z += 0.4;

      if (free) {
        const hit = stage.pick([nodes], false);
        const id = hit?.instanceId ?? focus;
        stage.renderer.domElement.style.cursor = hit ? 'pointer' : '';
        if (id >= 0) {
          const nd = G.nodes[id];
          env.readout(`entity ${id} · topic: ${TOPIC_NAMES[nd.con] ?? nd.con} · ${adj2[id].size} relations${focus === id ? ` · 2-hop: ${hood.size}` : ''}`);
        } else env.readout(`${algo} · click an entity for its 2-hop neighbourhood`);
      } else env.readout(u > 3.4 && u < 5 ? `partition: ${a}` : '');
    },
  };
};
