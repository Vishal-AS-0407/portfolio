/* The Catalogue — the mechanism in 3D: the drawer itself, built from the
   same forty cards as the rest of the page. A turn is typed onto a card,
   stamped with a topic, filed on the rod; a query narrows by topic first and
   the top three rise out into the prompt. Real light, real shadows. */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease } from '@/projects/_shared/stage3d';
import { buildDeck, QUERY_TOPIC, type Card } from './cards';

const OAK = '#4a3b2a', OAK_LT = '#61503a', CARD = '#f2efe9', RULE = '#9fb8d0', RED = '#c4483e', INK = '#20242a', BRASS = '#d98e2b', STAMP = '#3b5ba5';
const CW = 1.0, CH = 0.66, N = 40, GAP = 0.082;

function cardTexture(c: Card, stamped: boolean) {
  const W = 320, H = 212;
  const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
  const x = cv.getContext('2d')!;
  x.fillStyle = CARD; x.fillRect(0, 0, W, H);
  x.strokeStyle = RED; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 34); x.lineTo(W, 34); x.stroke();
  x.strokeStyle = RULE; x.lineWidth = 1;
  for (let y = 58; y < H; y += 24) { x.beginPath(); x.moveTo(0, y); x.lineTo(W, y); x.stroke(); }
  x.fillStyle = INK; x.font = '600 13px CourierPrimeMM, Courier, monospace';
  x.fillText(`window:${(c.id * 2654435761 >>> 0).toString(16).slice(0, 8)}`, 12, 24);
  x.font = '400 15px CourierPrimeMM, Courier, monospace';
  const words = c.q.split(' ');
  let line = '', y = 53;
  for (const w of words) {
    if (x.measureText(line + w).width > W - 26) { x.fillText(line, 12, y); line = ''; y += 24; }
    line += w + ' ';
  }
  x.fillText(line, 12, y);
  if (stamped) {
    x.save(); x.translate(W - 80, H - 34); x.rotate(-0.12);
    x.strokeStyle = STAMP; x.lineWidth = 2; x.strokeRect(-58, -15, 116, 28);
    x.fillStyle = STAMP; x.font = '700 14px CourierPrimeMM, Courier, monospace'; x.textAlign = 'center';
    x.fillText(c.topic.toUpperCase(), 0, 4);
    x.restore();
  }
  const t = new THREE.CanvasTexture(cv); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  return t;
}

export const memoraScene: Builder = (stage, env) => {
  const { scene, camera, renderer } = stage;
  const cam = camera as THREE.PerspectiveCamera;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  const root = new THREE.Group();
  scene.add(root);

  scene.add(new THREE.HemisphereLight('#dfe6ee', '#2e3338', 0.9));
  const key = new THREE.DirectionalLight('#fff1dc', 2.2);
  key.position.set(-2.5, 5, 3);
  key.castShadow = true;
  key.shadow.mapSize.set(env.coarse ? 1024 : 2048, env.coarse ? 1024 : 2048);
  key.shadow.camera.left = -3; key.shadow.camera.right = 3; key.shadow.camera.top = 3; key.shadow.camera.bottom = -3;
  key.shadow.bias = -0.0008;
  scene.add(key);

  /* ── the drawer ── */
  const drawer = new THREE.Group();
  root.add(drawer);
  const oak = new THREE.MeshStandardMaterial({ color: OAK, roughness: 0.62 });
  const oakLt = new THREE.MeshStandardMaterial({ color: OAK_LT, roughness: 0.55 });
  const L = N * GAP + 0.5, Wd = CW + 0.16, Hd = 0.5;
  const plank = (w: number, h: number, d: number, x: number, y: number, z: number, m = oak) => {
    const b = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    b.position.set(x, y, z); b.castShadow = true; b.receiveShadow = true;
    drawer.add(b);
    return b;
  };
  plank(Wd, 0.04, L, 0, -0.02, 0);                         // floor
  plank(0.04, Hd, L, -Wd / 2, Hd / 2 - 0.04, 0);            // sides
  plank(0.04, Hd, L, Wd / 2, Hd / 2 - 0.04, 0);
  plank(Wd + 0.04, Hd, 0.04, 0, Hd / 2 - 0.04, -L / 2);    // back
  plank(Wd + 0.12, Hd + 0.06, 0.06, 0, Hd / 2 - 0.04, L / 2, oakLt); // front
  const brass = new THREE.MeshStandardMaterial({ color: BRASS, metalness: 0.85, roughness: 0.32 });
  const pull = new THREE.Mesh(new THREE.TorusGeometry(0.09, 0.016, 10, 28, Math.PI), brass);
  pull.position.set(0, 0.12, L / 2 + 0.04); pull.rotation.z = Math.PI;
  drawer.add(pull);
  const holder = new THREE.Mesh(new THREE.BoxGeometry(0.34, 0.12, 0.012), brass);
  holder.position.set(0, 0.32, L / 2 + 0.035);
  drawer.add(holder);
  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, L + 0.1, 12).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#9aa3ab', metalness: 0.9, roughness: 0.25 }));
  rod.position.set(0, 0.07, 0); rod.castShadow = true;
  drawer.add(rod);

  /* ── the forty cards ── */
  const deck = buildDeck(N);
  const edge = new THREE.MeshStandardMaterial({ color: CARD, roughness: 0.9 });
  const cardGeo = new THREE.BoxGeometry(CW, CH, 0.008);
  const tabGeo = new THREE.BoxGeometry(0.2, 0.07, 0.008);
  const TOPICS = [...new Set(deck.map((c) => c.topic))];
  const tabCol = (t: string) => new THREE.Color().setHSL((TOPICS.indexOf(t) / TOPICS.length) * 0.75 + 0.05, 0.38, 0.62);
  const cards = deck.map((c, i) => {
    const front = new THREE.MeshStandardMaterial({ map: cardTexture(c, true), roughness: 0.92 });
    const m = new THREE.Mesh(cardGeo, [edge, edge, edge, edge, front, edge]);
    m.castShadow = true; m.receiveShadow = true;
    const tab = new THREE.Mesh(tabGeo, new THREE.MeshStandardMaterial({ color: tabCol(c.topic), roughness: 0.8 }));
    tab.position.set(-CW / 2 + 0.14 + (TOPICS.indexOf(c.topic) / TOPICS.length) * (CW - 0.28), CH / 2 + 0.035, 0);
    tab.castShadow = true;
    m.add(tab);
    m.userData = { i };
    root.add(m);
    return { m, c, slot: -L / 2 + 0.3 + i * GAP, tilt: ((i * 7919) % 13 - 6) * 0.004 };
  });

  /* the newest card: typed, then stamped, then filed at the back of the drawer */
  const fresh = cards[N - 1];
  const blank = new THREE.MeshStandardMaterial({ map: cardTexture({ ...fresh.c, q: '' }, false), roughness: 0.92 });
  const typed = new THREE.MeshStandardMaterial({ map: cardTexture(fresh.c, false), roughness: 0.92 });
  const stampedMat = (fresh.m.material as THREE.Material[])[4];
  const stampBlock = new THREE.Mesh(new THREE.BoxGeometry(0.26, 0.12, 0.12), new THREE.MeshStandardMaterial({ color: INK, roughness: 0.5 }));
  const stampFace = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.1, 0.02), new THREE.MeshStandardMaterial({ color: STAMP }));
  stampFace.position.z = -0.07;
  const handle = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.05, 0.22, 16).rotateX(Math.PI / 2), new THREE.MeshStandardMaterial({ color: '#7a2e24', roughness: 0.4 }));
  handle.position.z = 0.16;
  const stamp = new THREE.Group();
  stamp.add(stampBlock, stampFace, handle);
  root.add(stamp);

  let topic = QUERY_TOPIC;
  const pickTop = (t: string) => deck.filter((c) => c.topic === t).sort((a, b) => b.cos - a.cos).slice(0, 3).map((c) => c.id);
  let top = pickTop(topic);

  const K: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(0.2, 1.6, 4.4), new THREE.Vector3(0, 1.25, 2.0)],
    [new THREE.Vector3(-0.6, 1.9, 3.9), new THREE.Vector3(0, 1.25, 2.0)],
    [new THREE.Vector3(3.0, 3.0, 4.4), new THREE.Vector3(0, 0.2, 0.2)],
    [new THREE.Vector3(2.2, 2.4, 4.6), new THREE.Vector3(0, 0.4, 0.2)],
    [new THREE.Vector3(0.4, 2.6, 5.4), new THREE.Vector3(0, 1.0, 0.8)],
    [new THREE.Vector3(2.8, 2.9, 5.0), new THREE.Vector3(0, 0.6, 0.4)],
  ];
  stage.onResize = () => { cam.fov = stage.w / stage.h < 0.8 ? 62 : 36; cam.updateProjectionMatrix(); };
  stage.onResize();
  const cp = new THREE.Vector3(), ct = new THREE.Vector3(), target = new THREE.Vector3();

  return {
    control(k, v) { if (k === 'topic') { topic = v as string; top = pickTop(topic); } },
    frame({ beat, local, t, dt, free, reduced }) {
      const u = beat + band(0.5, 1, local);
      const k = Math.min(1, 0.12 * dt);
      const qt = free ? topic : QUERY_TOPIC;
      const tops = free ? top : pickTop(QUERY_TOPIC);
      const filter = free ? 1 : band(2.6, 3.2, u);
      const rise = free ? 1 : band(3.6, 4.3, u);

      /* the fresh card's own little story */
      const typeIn = band(0.05, 0.5, u), stampIn = band(1.0, 1.5, u), file = free ? 1 : band(1.6, 2.4, u);
      (fresh.m.material as THREE.Material[])[4] = stampIn > 0.55 ? stampedMat : typeIn > 0.3 ? typed : blank;
      stamp.visible = !free && u > 0.6 && u < 2.0;
      const press = Math.sin(Math.min(1, Math.max(0, (u - 1.0) / 0.5)) * Math.PI);
      stamp.position.set(0.28, 1.12, 2.0 + 0.2 + (1 - press) * 0.35);
      stamp.rotation.set(0, 0, -0.12);

      cards.forEach(({ m, c, slot, tilt }, i) => {
        const on = c.topic === qt;
        const rank = tops.indexOf(c.id);
        /* home: standing on the rod in its slot */
        target.set(0, CH / 2 + 0.02, slot);
        let rx = tilt - 0.08, ry = 0;
        if (on) target.y += 0.26 * filter;
        if (rank >= 0) {
          target.lerp(new THREE.Vector3(-1.12 + rank * 1.12, 1.02, 1.5), ease.out(rise));
          rx += (0.08 - rx) * rise;
          ry = (rank - 1) * -0.2 * rise;
        }
        if (i === N - 1 && file < 1) {
          const from = new THREE.Vector3(0, 1.25, 2.0);
          target.lerpVectors(from, target, ease.io(file));
          rx = rx * file;
        }
        m.position.lerp(target, reduced ? 1 : k * 2.2);
        m.rotation.x += (rx - m.rotation.x) * (reduced ? 1 : k * 2);
        m.rotation.y += (ry - m.rotation.y) * (reduced ? 1 : k * 2);
        /* everything off-topic greys back once the filter runs */
        const dim = filter > 0.01 && !on ? 1 - filter * 0.45 : 1;
        ((m.material as THREE.MeshStandardMaterial[])[4]).color.setScalar(dim);
      });

      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = u - Math.floor(u);
      cp.lerpVectors(K[i0][0], K[i1][0], f); ct.lerpVectors(K[i0][1], K[i1][1], f);
      if (stage.w / stage.h < 0.8) cp.sub(ct).multiplyScalar(1.55).add(ct);
      cam.position.copy(cp); cam.lookAt(ct);
      root.rotation.y = stage.orbit.yaw + (reduced ? 0 : Math.sin(t * 0.12) * 0.04);
      root.rotation.x = stage.orbit.pitch * 0.4;

      if (free) {
        const hit = stage.pick(cards.map((x) => x.m), false);
        const c = hit ? cards[hit.object.userData.i as number].c : null;
        const kept = deck.filter((d) => d.topic === topic).length;
        env.readout(c ? `“${c.q}” · ${c.topic}${top.includes(c.id) ? ` · cos ${c.cos.toFixed(3)}` : ''}` : `${N} filed · ${kept} on “${topic}” · top 3 enter the prompt`);
      } else env.readout('');
    },
  };
};

export const deckTopics = () => [...new Set(buildDeck(N).map((c) => c.topic))];
