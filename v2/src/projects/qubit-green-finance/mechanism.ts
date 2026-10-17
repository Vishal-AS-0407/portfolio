/* Allocation — the programme, built in flat colour and seen isometrically:
   twenty candidates standing as tall as their asks, the 15×3 matrix that
   scores a project, the ESG floor that zeroes, the 40% cap that clips, and the
   allocation the solver returns — then the budget and the floor are the
   reader's. Same candidates, same objective, same constraints and the same
   solver as the rest of the page (./sdg). No shading, no light: every face is
   a flat tint of the page's four colours, every edge an ink hairline. */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease, textTexture } from '@/projects/_shared/stage3d';
import { allocate, buildCandidates, buildMatrix, fmtEsg, BUDGET, CAP, FLOOR } from './sdg';

const FOREST = '#134e37', GOLD = '#e8c547', INK = '#111111', BONE = '#efeae0', NULL = '#7a7a72', SLAB = '#e0d9cb';
/* +x, −x, top, bottom, +z, −z — fixed tints stand in for light */
const TINT = [0.8, 0.6, 1, 0.5, 0.92, 0.6];
const H = (dollars: number) => dollars / 300; // world height per dollar
const FLAT = 0.025;

const tinted = (hex: string) => TINT.map((k) => new THREE.MeshBasicMaterial({ color: new THREE.Color(hex).multiplyScalar(k) }));
const paint = (mats: THREE.MeshBasicMaterial[], c: THREE.Color) => mats.forEach((m, i) => m.color.copy(c).multiplyScalar(TINT[i]));

export const allocScene: Builder = (stage, env) => {
  const { scene } = stage;
  const cam = stage.camera as THREE.OrthographicCamera;
  const root = new THREE.Group();
  scene.add(root);
  const cands = buildCandidates();
  const matrix = buildMatrix();
  const texs: THREE.Texture[] = [];

  /* a box whose origin is its base, so scaling y grows it upward */
  const unit = new THREE.BoxGeometry(1, 1, 1).translate(0, 0.5, 0);
  const unitEdges = new THREE.EdgesGeometry(unit);
  const edgeMat = new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0.55 });
  const box = (hex: string, edges = true) => {
    const mats = tinted(hex);
    const m = new THREE.Mesh(unit, mats);
    if (edges) m.add(new THREE.LineSegments(unitEdges, edgeMat));
    return { m, mats };
  };

  /* ── the slab the candidates stand on ── */
  const slab = box(SLAB);
  slab.m.scale.set(4.9, 0.06, 3.9);
  slab.m.position.y = -0.06;
  root.add(slab.m);

  /* ── twenty candidates on a 5×4 grid ── */
  const G = 0.9, S = 0.62;
  const blocks = cands.map((c, i) => {
    const b = box(FOREST);
    b.m.position.set(((i % 5) - 2) * G, 0, (((i / 5) | 0) - 1.5) * G);
    b.m.scale.set(S, FLAT, S);
    b.m.userData.i = i;
    root.add(b.m);
    return { ...b, c, h: FLAT, col: new THREE.Color(FOREST) };
  });

  /* ── the 15×3 matrix, one project's 45 scores, on its own plate ── */
  const mPlate = box(SLAB);
  mPlate.m.scale.set(0.95, 0.04, 3.95);
  mPlate.m.position.set(-3.55, -0.04, 0);
  root.add(mPlate.m);
  const cells = matrix.map((v, k) => {
    const g = (k / 3) | 0, a = k % 3;
    const b = box(v < FLOOR ? NULL : a === 0 ? GOLD : a === 1 ? FOREST : INK);
    b.m.position.set(-3.81 + a * 0.26, 0, -1.75 + g * 0.25);
    b.m.scale.set(0.2, FLAT, 0.2);
    root.add(b.m);
    return { m: b.m, v };
  });

  /* ── the 40% cap: a gold sheet, hard-edged ── */
  const capSheet = new THREE.Mesh(
    new THREE.PlaneGeometry(4.9, 3.9).rotateX(-Math.PI / 2),
    new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, opacity: 0, side: THREE.DoubleSide, depthWrite: false }),
  );
  const capEdge = new THREE.LineSegments(
    new THREE.EdgesGeometry(new THREE.PlaneGeometry(4.9, 3.9).rotateX(-Math.PI / 2)),
    new THREE.LineBasicMaterial({ color: INK, transparent: true, opacity: 0 }),
  );
  capSheet.add(capEdge);
  root.add(capSheet);

  /* ── the budget bar along the front edge: width is share of budget ── */
  const BAR = 4.9, BZ = 2.45;
  const segs = cands.map(() => {
    const b = box(FOREST);
    b.m.position.set(0, 0, BZ);
    b.m.scale.set(0.0001, 0.14, 0.34);
    root.add(b.m);
    return { ...b, col: new THREE.Color(FOREST) };
  });
  const slack = box(BONE);
  slack.m.position.set(0, 0, BZ);
  slack.m.scale.set(0.0001, 0.05, 0.34);
  root.add(slack.m);

  /* ── labels: flat type on bone, re-set only when their text changes ── */
  const FONT = '600 22px InstrumentAL, system-ui, sans-serif';
  const label = (h: number) => {
    const sp = new THREE.Sprite(new THREE.SpriteMaterial({ transparent: true, depthTest: false, opacity: 0 }));
    sp.renderOrder = 10;
    root.add(sp);
    let text = '', tex: THREE.Texture | null = null, aspect = 1;
    const draw = () => {
      const r = textTexture([text], FONT, INK, { pad: 8, bg: BONE });
      tex?.dispose();
      tex = r.tex; texs.push(tex);
      (sp.material as THREE.SpriteMaterial).map = tex;
      (sp.material as THREE.SpriteMaterial).needsUpdate = true;
      aspect = r.aspect;
      sp.scale.set(h * aspect * ls, h * ls, 1);
    };
    return {
      sp,
      set(t: string) { if (t !== text) { text = t; draw(); } },
      redraw() { if (text) draw(); },
      alpha(a: number) { (sp.material as THREE.SpriteMaterial).opacity = a; sp.visible = a > 0.01; },
      fit() { sp.scale.set(h * aspect * ls, h * ls, 1); },
    };
  };
  /* labels keep one on-screen size whatever the frustum */
  let ls = 1;
  const lMatrix = label(0.2), lFloor = label(0.2), lCap = label(0.2), lBar = label(0.2);
  lMatrix.sp.position.set(-3.55, 1.75, -1.9);
  lMatrix.set('15 goals × 3 axes · 45 scores');
  lFloor.sp.position.set(-1.2, 0.55, 2.1);
  const labels = [lMatrix, lFloor, lCap, lBar];
  /* the page's font may land after the first draw */
  document.fonts?.load(FONT).then(() => labels.forEach((l) => l.redraw())).catch(() => {});

  /* ── camera: true isometric direction, a target per panel ── */
  const DIR = new THREE.Vector3(1, 0.82, 1).normalize().multiplyScalar(16);
  const K: [THREE.Vector3, number][] = [
    [new THREE.Vector3(0, 0.55, 0.2), 1.0],
    [new THREE.Vector3(-2.5, 0.45, -0.2), 1.22],
    [new THREE.Vector3(0, 0.35, 0.3), 1.04],
    [new THREE.Vector3(0, 0.75, 0.3), 1.0],
    [new THREE.Vector3(0, 0.3, 0.8), 1.04],
    [new THREE.Vector3(-0.5, 0.4, 0.5), 0.96],
  ];
  /* the scene sits right of the caption on wide screens, above it on tall ones */
  stage.onResize = () => {
    const a = stage.w / stage.h, tall = a < 0.8;
    /* tall: the drawing is ~7 units across, and lives between the title and the caption */
    const v = tall ? Math.max(3.1, 3.6 / a) : 3.1;
    const W = 2 * v * a;
    if (tall) { cam.left = -W * 0.55; cam.right = W * 0.45; cam.top = v * 0.8; cam.bottom = -v * 1.2; }
    else { cam.left = -W * 0.6; cam.right = W * 0.4; cam.top = v; cam.bottom = -v; }
    cam.updateProjectionMatrix();
    ls = tall ? (v / 3.1) * 0.9 : 1;
    labels.forEach((l) => l.fit());
  };
  stage.onResize();

  let budget = BUDGET, floor = FLOOR;
  let sol = allocate(cands, budget, floor);
  const story = allocate(cands);
  const tmp = new THREE.Color(), ct = new THREE.Vector3();
  const C = { forest: new THREE.Color(FOREST), deep: new THREE.Color('#0d3a29'), gold: new THREE.Color(GOLD), null: new THREE.Color(NULL), slab: new THREE.Color(SLAB) };
  const money = (v: number) => `$${Math.round(v).toLocaleString('en-US')}`;

  return {
    control(k, v) {
      if (k === 'budget') budget = v as number;
      if (k === 'floor') floor = v as number;
      sol = allocate(cands, budget, floor);
    },
    frame({ beat, local, t, dt, free, reduced }) {
      const u = beat + band(0.5, 1, local);
      const k = reduced ? 1 : Math.min(1, 0.11 * dt);
      const B = free ? budget : BUDGET, F = free ? floor : FLOOR;
      const s = free ? sol : story;
      const capD = B * CAP;

      /* each panel's state is complete by the time it snaps into place */
      const mtx = free ? 0 : band(0.5, 1, u) * (1 - band(1.5, 2, u));
      const flr = free ? 1 : band(1.5, 2, u);
      const cap = free ? 1 : band(2.5, 3, u);
      const alloc = free ? 1 : band(3.5, 4, u);

      blocks.forEach((b) => {
        const under = b.c.esg < F;
        const ask = H(b.c.ask), a = s.out.get(b.c.id) ?? 0;
        let h = ask;
        if (under) h += (FLAT - h) * flr;
        else h += (Math.min(ask, H(capD)) - h) * cap;
        h += ((a > 0 ? H(a) : FLAT) - h) * alloc;
        /* the candidates crouch while the matrix has the stage */
        h *= 1 - 0.78 * mtx;
        b.h += (Math.max(FLAT, h) - b.h) * k;
        b.m.scale.y = b.h;
        const want =
          under && flr > 0.5 ? C.null
          : alloc > 0.5 ? (a <= 0 ? C.slab : a >= capD - 0.5 ? C.gold : C.forest)
          : cap > 0.5 && b.c.ask > capD ? C.gold
          : C.forest;
        b.col.lerp(want, k);
        paint(b.mats, b.col);
      });

      cells.forEach(({ m, v }, i) => {
        const rise = ease.out(Math.max(0, Math.min(1, mtx * 1.5 - (i / 45) * 0.5)));
        m.scale.y += (Math.max(FLAT, v * 1.5 * rise) - m.scale.y) * k;
      });
      lMatrix.alpha(mtx);

      /* the floor: what it took out, and from where */
      lFloor.set(`ESG below ${F.toFixed(2)} → $0 · ${cands.filter((c) => c.esg < F).length} of 20`);
      lFloor.alpha(free ? 0 : flr * (1 - cap));

      /* the cap */
      const capA = cap * (1 - alloc * 0.8);
      capSheet.position.y = H(capD);
      (capSheet.material as THREE.MeshBasicMaterial).opacity = capA * 0.34;
      (capEdge.material as THREE.LineBasicMaterial).opacity = capA * 0.8;
      capSheet.visible = capA > 0.01;
      lCap.set(`40% cap · ${money(capD)}`);
      lCap.sp.position.set(2.35, 0, -1.95);
      lCap.alpha(free ? 0.85 : cap * (1 - alloc));
      lCap.sp.position.y = H(capD) + 0.2;

      /* the bar: each funded project takes its share of the width */
      let x = -BAR / 2;
      cands.forEach((c, i) => {
        const a = s.out.get(c.id) ?? 0;
        const w = Math.max(0.0001, (BAR * a / B) * alloc);
        const g = segs[i];
        g.m.scale.x += (w - g.m.scale.x) * k;
        g.m.position.x = x + g.m.scale.x / 2;
        g.m.visible = g.m.scale.x > 0.002;
        x += g.m.scale.x;
        g.col.copy(a >= capD - 0.5 ? C.gold : i % 2 ? C.forest : C.deep);
        paint(g.mats, g.col);
      });
      const sw = Math.max(0.0001, (BAR * s.left / B) * alloc);
      slack.m.scale.x += (sw - slack.m.scale.x) * k;
      slack.m.position.x = x + slack.m.scale.x / 2;
      slack.m.visible = slack.m.scale.x > 0.002;
      const deployed = B - s.left;
      lBar.set(`${money(deployed)} of ${money(B)} · ${s.out.size} funded`);
      lBar.sp.position.set(-1.5, 0.42, BZ + 0.3);
      lBar.alpha(alloc);

      /* camera */
      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = ease.io(u - Math.floor(u));
      ct.lerpVectors(K[i0][0], K[i1][0], f);
      cam.zoom = K[i0][1] + (K[i1][1] - K[i0][1]) * f;
      cam.updateProjectionMatrix();
      cam.position.copy(ct).add(DIR);
      cam.lookAt(ct);
      root.rotation.y = stage.orbit.yaw + (reduced ? 0 : Math.sin(t * 0.12) * 0.025);

      if (free) {
        const hit = stage.pick(blocks.map((b) => b.m), false);
        if (hit) {
          const c = blocks[hit.object.userData.i as number].c;
          const a = s.out.get(c.id) ?? 0;
          const why = c.esg < F ? ' · below the floor' : a >= capD - 0.5 ? ' · at the 40% cap' : a <= 0 ? ' · budget spent before it' : '';
          env.readout(`${c.id} · ESG ${fmtEsg(c.esg)} · risk ${c.risk.toFixed(1)} · asks ${money(c.ask)} · gets ${money(a)}${why}`);
        } else env.readout(`${money(deployed)} of ${money(B)} deployed · ${s.out.size} funded · ${cands.filter((c) => c.esg < F).length} below the floor`);
      } else env.readout('');
    },
    dispose() { texs.forEach((x) => x.dispose()); },
  };
};
