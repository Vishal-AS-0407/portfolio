/* The machine half: everything grafted onto the heart. Each part is its own
   group with a pivot, so a raycast can name it, the beat can carry it and the
   teardown can fly it out along its own axis.

   docs/design/biomech-and-inheritance.md §2.2 */
import * as THREE from 'three';
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js';
import { surfaceAt, gToDir, surfaceT, sdfNormal, PLATE } from './anatomy';
import { PALETTE, deformPoint, type HeartU } from './heart';
import { GLSL_NOISE } from './noise';

/** how far the exploded view throws parts, as a fraction of each part's dist */
const EXPLODE = 0.55;

export type PartName = 'plate' | 'gears' | 'pistonA' | 'pistonB' | 'valve' | 'aorta' | 'pulmonary' | 'cava' | 'bolt';

export type Part = {
  name: PartName;
  obj: THREE.Object3D;
  home: THREE.Vector3;
  dir: THREE.Vector3;
  dist: number;
  spinAxis: THREE.Vector3;
  label?: string;
  /** rigid parts follow the beat at their pivot; shader-deformed ones don't */
  rides: boolean;
  rigid: number;
};

export function metals(env: THREE.Texture | null) {
  return {
    gun: new THREE.MeshPhysicalMaterial({ color: PALETTE.g2, metalness: 1, roughness: 0.34, clearcoat: 0.2, envMap: env, envMapIntensity: 0.9 }),
    dark: new THREE.MeshPhysicalMaterial({ color: PALETTE.g1, metalness: 1, roughness: 0.5, envMap: env, envMapIntensity: 0.7 }),
    chrome: new THREE.MeshPhysicalMaterial({ color: PALETTE.fg, metalness: 1, roughness: 0.1, envMap: env, envMapIntensity: 1.1 }),
    brass: new THREE.MeshPhysicalMaterial({ color: '#C98A5A', metalness: 1, roughness: 0.3, envMap: env, envMapIntensity: 0.95 }),
    copper: new THREE.MeshPhysicalMaterial({ color: PALETTE.m4, metalness: 1, roughness: 0.3, envMap: env, envMapIntensity: 0.9 }),
    glowCup: new THREE.MeshStandardMaterial({ color: PALETTE.ground, emissive: new THREE.Color(PALETTE.m4), emissiveIntensity: 0.5, roughness: 0.9 }),
    cup: new THREE.MeshPhysicalMaterial({ color: PALETTE.g1, metalness: 1, roughness: 0.62, side: THREE.DoubleSide, envMap: env, envMapIntensity: 0.4 }),
  };
}
type Metals = ReturnType<typeof metals>;

/** a basis whose +y is `axis` */
function alignY(obj: THREE.Object3D, axis: THREE.Vector3) {
  obj.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), axis.clone().normalize());
}
/** a basis whose +z is n, +x along the plate's u */
function plateBasis(n: THREE.Vector3) {
  const x = PLATE.u.clone().addScaledVector(n, -PLATE.u.dot(n)).normalize();
  const y = new THREE.Vector3().crossVectors(n, x);
  return new THREE.Matrix4().makeBasis(x, y, n);
}
const tag = (o: THREE.Object3D, name: string) => { o.traverse((c) => { c.userData.part = name; }); return o; };

/* ── gear profile ── */
function gearGeometry(teeth: number, r: number, depth: number, hole = 0.25) {
  const s = new THREE.Shape();
  const rr = r * 0.82, tip = r;
  for (let i = 0; i < teeth; i++) {
    const a0 = (i / teeth) * Math.PI * 2;
    const step = (Math.PI * 2) / teeth;
    const pts: [number, number][] = [
      [rr, a0], [rr, a0 + step * 0.18], [tip, a0 + step * 0.3], [tip, a0 + step * 0.55], [rr, a0 + step * 0.67],
    ];
    pts.forEach(([rad, a], k) => {
      const x = Math.cos(a) * rad, y = Math.sin(a) * rad;
      if (i === 0 && k === 0) s.moveTo(x, y); else s.lineTo(x, y);
    });
  }
  s.closePath();
  const h = new THREE.Path();
  h.absarc(0, 0, r * hole, 0, Math.PI * 2, true);
  s.holes.push(h);
  /* spokes: four windows */
  for (let k = 0; k < 4; k++) {
    const w = new THREE.Path();
    const a = (k / 4) * Math.PI * 2 + 0.4;
    w.absarc(Math.cos(a) * r * 0.52, Math.sin(a) * r * 0.52, r * 0.16, 0, Math.PI * 2, true);
    if (teeth > 9) s.holes.push(w);
  }
  const g = new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: depth * 0.18, bevelSize: r * 0.02, bevelSegments: 1, curveSegments: 3 });
  g.translate(0, 0, -depth / 2);
  return g;
}

/* ── hose material: flesh at the root, ribbed copper after the split ── */
function hoseMaterial(env: THREE.Texture | null, U: HeartU, split: number, ribs: number) {
  const m = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.4, metalness: 0, clearcoat: 0.55, clearcoatRoughness: 0.25, envMap: env, envMapIntensity: 0.6 });
  const key = `hose-${split}-${ribs}`;
  m.customProgramCacheKey = () => key;
  m.onBeforeCompile = (sh) => {
    sh.uniforms.uC2 = U.uC2; sh.uniforms.uC3 = U.uC3; sh.uniforms.uC1 = U.uC1; sh.uniforms.uC4 = U.uC4;
    sh.uniforms.uTime = U.uTime;
    sh.vertexShader = sh.vertexShader
      .replace('#include <common>', '#include <common>\nvarying vec2 vHuv;\nvarying vec3 vHp;')
      .replace('#include <begin_vertex>', `#include <begin_vertex>
  vHuv = uv; vHp = position;
  float cu = smoothstep(${split.toFixed(3)} - .03, ${split.toFixed(3)} + .03, uv.x);
  transformed += normal * pow(abs(sin(uv.x * ${ribs.toFixed(1)})), 8.) * .011 * cu;`);
    sh.fragmentShader = sh.fragmentShader
      .replace('#include <common>', `#include <common>\nvarying vec2 vHuv;\nvarying vec3 vHp;\nuniform vec3 uC1, uC2, uC3, uC4;\nuniform float uTime;\n${GLSL_NOISE}`)
      .replace('#include <color_fragment>', `#include <color_fragment>
  float cu = smoothstep(${split.toFixed(3)} - .03, ${split.toFixed(3)} + .03, vHuv.x);
  float n1 = snoise(vHp * 7.) * .5 + .5;
  float fib = snoise(vec3(vHp.x * 4., vHp.y * 20., vHp.z * 4.)) * .5 + .5;
  vec3 flesh = mix(uC1, uC2, .35 + n1 * .5) * .7;
  flesh = mix(flesh, uC3 * .7, smoothstep(.62, .95, fib) * .5);
  vec3 cop = uC4 * vec3(.92, .62, .5) * (.75 + n1 * .35);
  float rib = pow(abs(sin(vHuv.x * ${ribs.toFixed(1)})), 8.);
  cop *= .8 + rib * .35;
  float oil = smoothstep(.5, .8, snoise(vec3(vHp.x * 14., vHp.y * 2. + uTime * .03, vHp.z * 14.))) * cu;
  diffuseColor.rgb = mix(mix(flesh, cop, cu), vec3(.004), oil * .85);`)
      .replace('#include <roughnessmap_fragment>', `#include <roughnessmap_fragment>
  roughnessFactor = mix(mix(.42, .28, cu), .05, oil);`)
      .replace('#include <metalnessmap_fragment>', `#include <metalnessmap_fragment>
  metalnessFactor = cu * (1. - oil * .7);`);
  };
  return m;
}

function hose(
  name: PartName, pts: THREE.Vector3[], radius: number, split: number, M: Metals, env: THREE.Texture | null, U: HeartU,
  dir: THREE.Vector3, dist: number, label?: string
): Part {
  const curve = new THREE.CatmullRomCurve3(pts);
  const len = curve.getLength();
  const root = pts[0].clone();
  const g = new THREE.Group();
  g.position.copy(root);
  const tube = new THREE.Mesh(new THREE.TubeGeometry(curve, 72, radius, 22, false), hoseMaterial(env, U, split, len * 52));
  tube.position.copy(root).negate();
  g.add(tube);

  const clampAt = (u: number, r: number, w: number) => {
    const p = curve.getPointAt(u), t = curve.getTangentAt(u);
    const c = new THREE.Mesh(new THREE.TorusGeometry(r, w, 10, 32), M.gun);
    c.position.copy(p).sub(root);
    c.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), t);
    g.add(c);
    /* the clamp's screw lug */
    const lug = new THREE.Mesh(new THREE.BoxGeometry(w * 3.2, w * 3.2, w * 2.6), M.dark);
    lug.position.set(r + w, 0, 0);
    c.add(lug);
  };
  clampAt(split + 0.02, radius * 1.08, radius * 0.16);
  clampAt(split + 0.3, radius * 1.1, radius * 0.12);
  clampAt(Math.min(0.94, split + 0.5), radius * 1.1, radius * 0.12);

  /* the flange it ends in, with a ring of bolts */
  const pe = curve.getPointAt(1), te = curve.getTangentAt(1);
  const fl = new THREE.Group();
  fl.position.copy(pe).sub(root);
  fl.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), te);
  const disc = new THREE.Mesh(new THREE.CylinderGeometry(radius * 1.55, radius * 1.55, radius * 0.32, 36), M.gun);
  const cap = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.7, radius * 0.9, radius * 0.25, 24), M.dark);
  cap.position.y = radius * 0.26;
  fl.add(disc, cap);
  const boltG = new THREE.CylinderGeometry(radius * 0.17, radius * 0.17, radius * 0.22, 6);
  for (let k = 0; k < 8; k++) {
    const b = new THREE.Mesh(boltG, M.chrome);
    const a = (k / 8) * Math.PI * 2;
    b.position.set(Math.cos(a) * radius * 1.25, radius * 0.22, Math.sin(a) * radius * 1.25);
    fl.add(b);
  }
  g.add(fl);
  tag(g, name);
  return { name, obj: g, home: root.clone(), dir: dir.normalize(), dist, spinAxis: new THREE.Vector3(1, 0, 0.3).normalize(), label, rides: true, rigid: 0 };
}

export type MachineParts = {
  parts: Part[];
  byName: Record<string, Part>;
  plateRide: THREE.Group;
  gears: THREE.Mesh[];
  gearSpeeds: number[];
  pistons: { part: Part; base: THREE.Vector3; tip: THREE.Vector3; barrel: THREE.Mesh; rod: THREE.Group; baseRigid: number; slam: number }[];
  valve: { part: Part; wheel: THREE.Object3D; nozzle: THREE.Vector3; spin: number };
  bolt: { mesh: THREE.Mesh; home: THREE.Vector3; n: THREE.Vector3 };
  rivets: THREE.InstancedMesh;
  cup: THREE.Group;
  core: THREE.Group;
  update: (U: HeartU, dt: number, explode: (p: Part) => number) => void;
};

export function buildParts(plateMesh: THREE.Mesh, U: HeartU, env: THREE.Texture | null, M: Metals): MachineParts {
  const parts: Part[] = [];
  const core = new THREE.Group();

  /* ── plate: shell + rivets + staples + the loose bolt ── */
  const plateCentre = surfaceAt(PLATE.c);
  const plateG = new THREE.Group();
  plateG.position.copy(plateCentre.p);
  plateMesh.position.copy(plateCentre.p).negate();
  plateG.add(plateMesh);
  const plateRide = new THREE.Group();
  plateG.add(plateRide);
  plateRide.position.copy(plateCentre.p).negate();

  const dirV = new THREE.Vector3(), pv = new THREE.Vector3(), nv = new THREE.Vector3();
  const onPlate = (gx: number, gy: number, lift: number) => {
    gToDir(gx, gy, dirV);
    pv.copy(dirV).multiplyScalar(surfaceT(dirV.x, dirV.y, dirV.z));
    sdfNormal(pv, nv);
    return { p: pv.clone().addScaledVector(nv, lift), n: nv.clone() };
  };
  const R = (2 * PLATE.HR) / Math.sqrt(3);
  const corners: [number, number][] = [];
  for (let k = 0; k < 6; k++) corners.push([R * Math.cos((k * Math.PI) / 3), R * Math.sin((k * Math.PI) / 3)]);

  /* rivets: domed heads round the border */
  const rivetG = new THREE.SphereGeometry(0.0125, 12, 6, 0, Math.PI * 2, 0, Math.PI / 2);
  rivetG.scale(1, 0.55, 1);
  const rivetSpots: { p: THREE.Vector3; n: THREE.Vector3 }[] = [];
  const BOLT_SIDE = 5, BOLT_K = 2;
  let boltSpot: { p: THREE.Vector3; n: THREE.Vector3 } | null = null;
  for (let s = 0; s < 6; s++) {
    const A = corners[s], B = corners[(s + 1) % 6];
    for (let k = 0; k < 4; k++) {
      const t = (k + 0.5) / 4;
      const gx = (A[0] + (B[0] - A[0]) * t) * 0.86, gy = (A[1] + (B[1] - A[1]) * t) * 0.86;
      const spot = onPlate(gx, gy, PLATE.LIFT);
      if (s === BOLT_SIDE && k === BOLT_K) boltSpot = spot; else rivetSpots.push(spot);
    }
  }
  const rivets = new THREE.InstancedMesh(rivetG, M.chrome, rivetSpots.length);
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), one = new THREE.Vector3(1, 1, 1);
  rivetSpots.forEach((r, i) => {
    q.setFromUnitVectors(new THREE.Vector3(0, 1, 0), r.n);
    rivets.setMatrixAt(i, m4.compose(r.p, q, one));
  });
  plateRide.add(rivets);

  /* staples across the seam: the stitch line between flesh and metal */
  const stapleCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.03, 0, 0.026), new THREE.Vector3(-0.012, 0, 0.036),
    new THREE.Vector3(0.014, 0, 0.012), new THREE.Vector3(0.03, 0, -0.004),
  ]);
  const stapleG = new THREE.TubeGeometry(stapleCurve, 8, 0.0032, 5, false);
  const STAPLES = 30;
  const staples = new THREE.InstancedMesh(stapleG, M.chrome, STAPLES);
  for (let i = 0; i < STAPLES; i++) {
    const a = (i / STAPLES) * Math.PI * 2 + 0.11;
    /* walk the hex border: scale a ray until it hits the metric */
    const cx = Math.cos(a), cy = Math.sin(a);
    const metric = Math.max(Math.abs(cx) * 0.8660254 + Math.abs(cy) * 0.5, Math.abs(cy));
    const rr = PLATE.HR / metric;
    const gx = cx * rr, gy = cy * rr;
    const spot = onPlate(gx * 1.03, gy * 1.03, 0);
    /* outward direction across the seam, in the tangent plane */
    const o = onPlate(gx * 1.2, gy * 1.2, 0).p.sub(spot.p).normalize();
    const y = new THREE.Vector3().crossVectors(spot.n, o).normalize();
    const mb = new THREE.Matrix4().makeBasis(o, y, spot.n).setPosition(spot.p);
    staples.setMatrixAt(i, mb);
  }
  plateRide.add(staples);

  /* the loose bolt — the easter egg's tell */
  const boltMesh = new THREE.Mesh(
    mergeGeometries([
      new THREE.CylinderGeometry(0.02, 0.02, 0.016, 6).translate(0, 0.008, 0),
      new THREE.CylinderGeometry(0.0085, 0.0085, 0.05, 10).translate(0, -0.02, 0),
    ]),
    M.chrome.clone()
  );
  const bs = boltSpot!;
  boltMesh.position.copy(bs.p).addScaledVector(bs.n, 0.006);
  boltMesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), bs.n);
  boltMesh.userData.part = 'bolt';
  plateRide.add(boltMesh);

  tag(plateG, 'plate');
  boltMesh.userData.part = 'bolt';
  const platePart: Part = {
    name: 'plate', obj: plateG, home: plateCentre.p.clone(), dir: plateCentre.n.clone().multiplyScalar(0.5).add(new THREE.Vector3(0.75, -0.75, 0)).normalize(),
    dist: 0.95, spinAxis: PLATE.v.clone(), label: 'PLATE — 10.0 SGPA', rides: false, rigid: 1,
  };
  parts.push(platePart);

  /* ── porthole: bezel + gears in a socket cut into the ventricle ── */
  const hole = onPlate(PLATE.hole.x, PLATE.hole.y, 0);
  const basis = plateBasis(hole.n);
  const cup = new THREE.Group();
  cup.position.copy(hole.p);
  cup.quaternion.setFromRotationMatrix(basis);
  const sock = new THREE.Mesh(new THREE.CylinderGeometry(PLATE.HOLE_R * 1.02, PLATE.HOLE_R * 0.86, 0.17, 40, 1, true), M.cup);
  sock.rotation.x = Math.PI / 2;
  sock.position.z = -0.05;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(PLATE.HOLE_R * 0.87, 40), M.glowCup);
  floor.position.z = -0.135;
  cup.add(sock, floor);
  tag(cup, 'gears');
  core.add(cup);

  const gearsG = new THREE.Group();
  gearsG.position.copy(hole.p);
  gearsG.quaternion.setFromRotationMatrix(basis);
  const bezel = new THREE.Mesh(new THREE.TorusGeometry(PLATE.HOLE_R + 0.004, 0.015, 14, 56), M.gun);
  bezel.position.z = PLATE.LIFT + 0.004;
  bezel.scale.z = 0.8;
  gearsG.add(bezel);
  const bb = new THREE.CylinderGeometry(0.009, 0.009, 0.008, 6);
  for (let k = 0; k < 8; k++) {
    const b = new THREE.Mesh(bb, M.chrome);
    const a = (k / 8) * Math.PI * 2 + 0.2;
    b.position.set(Math.cos(a) * (PLATE.HOLE_R + 0.004), Math.sin(a) * (PLATE.HOLE_R + 0.004), PLATE.LIFT + 0.018);
    b.rotation.x = Math.PI / 2;
    gearsG.add(b);
  }
  /* three meshing spur gears; speeds in inverse tooth ratio */
  const GDEF: [number, number, number, number, THREE.Material][] = [
    [16, 0.066, -0.026, 0.012, M.brass], [10, 0.042, 0.06, -0.032, M.gun], [7, 0.03, 0.03, 0.068, M.chrome],
  ];
  const gears: THREE.Mesh[] = [];
  const gearSpeeds: number[] = [];
  GDEF.forEach(([teeth, r, x, y, mat], i) => {
    const gm = new THREE.Mesh(gearGeometry(teeth, r, 0.016), mat);
    gm.position.set(x, y, -0.03 - i * 0.012);
    gearsG.add(gm);
    gears.push(gm);
    gearSpeeds.push(((i % 2 ? -1 : 1) * 16) / teeth);
    const axle = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.22, r * 0.22, 0.06, 10), M.dark);
    axle.rotation.x = Math.PI / 2;
    axle.position.set(x, y, -0.06);
    gearsG.add(axle);
  });
  tag(gearsG, 'gears');
  parts.push({
    name: 'gears', obj: gearsG, home: hole.p.clone(), dir: hole.n.clone(), dist: 1.25, spinAxis: hole.n.clone(),
    label: 'GEARS — 8 case studies', rides: true, rigid: 1,
  });

  /* ── pistons between the plate / RV and the atria ── */
  const M_P: { part: Part; base: THREE.Vector3; tip: THREE.Vector3; barrel: THREE.Mesh; rod: THREE.Group; baseRigid: number; slam: number }[] = [];
  const mkPiston = (name: PartName, base: THREE.Vector3, tip: THREE.Vector3, baseRigid: number, label?: string) => {
    const g = new THREE.Group();
    const L = base.distanceTo(tip);
    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.052, 0.052, L * 0.55, 28), M.gun);
    const collar = new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 0.026, 28), M.dark);
    const ring2 = new THREE.Mesh(new THREE.CylinderGeometry(0.058, 0.058, 0.018, 28), M.dark);
    ring2.position.y = -L * 0.2;
    barrel.add(ring2);
    const rod = new THREE.Group();
    const rodM = new THREE.Mesh(new THREE.CylinderGeometry(0.022, 0.022, L * 0.62, 18), M.chrome);
    const clevisG = new THREE.BoxGeometry(0.07, 0.05, 0.04);
    const cb = new THREE.Mesh(clevisG, M.dark), ct = new THREE.Mesh(clevisG, M.dark);
    const pinG = new THREE.CylinderGeometry(0.009, 0.009, 0.06, 10);
    const pb = new THREE.Mesh(pinG, M.chrome), pt = new THREE.Mesh(pinG, M.chrome);
    pb.rotation.z = pt.rotation.z = Math.PI / 2;
    cb.add(pb); ct.add(pt);
    /* hydraulic line coiling off the barrel */
    const line = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
        new THREE.Vector3(0.04, -0.1, 0), new THREE.Vector3(0.09, -0.05, 0.03), new THREE.Vector3(0.08, 0.06, 0.05), new THREE.Vector3(0.04, 0.1, 0.0),
      ]), 20, 0.006, 6), M.dark);
    barrel.add(collar, line);
    collar.position.y = L * 0.275;
    rod.add(rodM, ct);
    g.add(barrel, rod, cb);
    barrel.userData.L = L;
    rodM.userData.L = L;
    tag(g, name);
    const part: Part = {
      name, obj: g, home: base.clone().lerp(tip, 0.5), dir: base.clone().lerp(tip, 0.5).normalize(),
      dist: 0.85, spinAxis: new THREE.Vector3(0, 0, 1), label, rides: true, rigid: 0.5,
    };
    parts.push(part);
    M_P.push({ part, base: base.clone(), tip: tip.clone(), barrel, rod, baseRigid, slam: 0 });
    /* cb / ct are positioned each frame in update() */
    (g.userData as Record<string, unknown>).clevis = [cb, ct];
  };
  const pa0 = onPlate(0.05, PLATE.HR * 0.78, PLATE.LIFT + 0.03).p;
  const pa1 = surfaceAt(new THREE.Vector3(0.52, 0.66, 0.16));
  mkPiston('pistonA', pa0, pa1.p.addScaledVector(pa1.n, 0.035), 1, 'PISTONS ×2 — 2 patents filed');
  const pb0s = surfaceAt(new THREE.Vector3(-0.46, -0.06, 0.78));
  const pb1s = surfaceAt(new THREE.Vector3(-0.78, 0.5, 0.32));
  mkPiston('pistonB', pb0s.p.addScaledVector(pb0s.n, 0.04), pb1s.p.addScaledVector(pb1s.n, 0.035), 0);

  /* ── valve on the crown ── */
  const vs = surfaceAt(new THREE.Vector3(-0.2, 1, 0.34));
  const valveG = new THREE.Group();
  valveG.position.copy(vs.p).addScaledVector(vs.n, 0.02);
  alignY(valveG, vs.n);
  const vbody = new THREE.Mesh(new THREE.CylinderGeometry(0.046, 0.062, 0.13, 24), M.gun);
  vbody.position.y = 0.04;
  const vcollar = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.07, 0.02, 6), M.dark);
  vcollar.position.y = -0.015;
  const stem = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.07, 10), M.chrome);
  stem.position.y = 0.14;
  const wheel = new THREE.Group();
  wheel.position.y = 0.17;
  const rim = new THREE.Mesh(new THREE.TorusGeometry(0.068, 0.009, 10, 40), M.copper);
  rim.rotation.x = Math.PI / 2;
  wheel.add(rim);
  for (let k = 0; k < 4; k++) {
    const sp = new THREE.Mesh(new THREE.BoxGeometry(0.13, 0.008, 0.008), M.copper);
    sp.rotation.y = (k * Math.PI) / 4;
    wheel.add(sp);
  }
  const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.016, 0.016, 0.018, 12), M.dark);
  wheel.add(hub);
  const noz = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.018, 0.07, 12), M.dark);
  noz.rotation.z = Math.PI / 2;
  noz.position.set(0.075, 0.07, 0);
  const gauge = new THREE.Mesh(new THREE.CylinderGeometry(0.026, 0.026, 0.012, 20), M.chrome);
  gauge.rotation.x = Math.PI / 2;
  gauge.position.set(0, 0.06, 0.05);
  valveG.add(vbody, vcollar, stem, wheel, noz, gauge);
  tag(valveG, 'valve');
  const valvePart: Part = {
    name: 'valve', obj: valveG, home: valveG.position.clone(), dir: vs.n.clone(), dist: 0.9,
    spinAxis: new THREE.Vector3(0, 1, 0), label: 'VALVE — Rank 1 · NAACL 2025', rides: true, rigid: 0,
  };
  parts.push(valvePart);

  /* ── great vessels: flesh roots, copper hoses ── */
  const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
  parts.push(hose('aorta',
    [V(0.04, 0.3, 0.06), V(0.05, 0.78, 0.1), V(0.14, 1.12, 0.02), V(0.42, 1.24, -0.2), V(0.66, 1.06, -0.4), V(0.72, 0.8, -0.46)],
    0.15, 0.36, M, env, U, V(0.5, 1, -0.3), 1.0, 'AORTA — 3 papers, peer reviewed'));
  parts.push(hose('pulmonary',
    [V(-0.2, 0.28, 0.4), V(-0.2, 0.66, 0.5), V(-0.02, 0.92, 0.44), V(0.3, 0.98, 0.42), V(0.52, 0.86, 0.5)],
    0.11, 0.38, M, env, U, V(0.1, 0.9, 0.6), 0.95));
  parts.push(hose('cava',
    [V(-0.58, 0.48, -0.02), V(-0.62, 0.86, -0.06), V(-0.6, 1.16, -0.1)],
    0.095, 0.42, M, env, U, V(-0.6, 1, 0), 0.9));

  const byName: Record<string, Part> = {};
  parts.forEach((p) => { byName[p.name] = p; core.add(p.obj); });

  const tmpA = new THREE.Vector3(), tmpB = new THREE.Vector3(), ax = new THREE.Vector3();
  const pistons = M_P;
  const valve = { part: valvePart, wheel, nozzle: new THREE.Vector3(0.115, 0.07, 0), spin: 0 };
  const bolt = { mesh: boltMesh, home: boltMesh.position.clone(), n: bs.n.clone() };

  const update: MachineParts['update'] = (Uu, dt, explode) => {
    for (const p of parts) {
      const e = explode(p);
      if (p.name.startsWith('piston')) continue;
      if (p.rides) {
        deformPoint(p.home, Uu, p.rigid, tmpA);
      } else tmpA.copy(p.home);
      p.obj.position.copy(tmpA).addScaledVector(p.dir, p.dist * EXPLODE * e);
      p.obj.rotation.set(0, 0, 0);
      if (p.name === 'valve') alignY(p.obj, vs.n);
      if (p.name === 'gears') p.obj.quaternion.setFromRotationMatrix(basis);
      if (e > 0.001) {
        q.setFromAxisAngle(p.spinAxis, e * 0.35);
        p.obj.quaternion.premultiply(q);
      }
    }
    /* the plate's rivets ride the beat like the plate shader does */
    deformPoint(plateCentre.p, Uu, 1, tmpA);
    plateRide.position.copy(plateCentre.p).negate().add(tmpA).sub(plateCentre.p);

    for (const pi of pistons) {
      const e = explode(pi.part);
      pi.slam = Math.max(0, pi.slam - dt * 3.2);
      const slamK = Math.sin(pi.slam * Math.PI * 4) * pi.slam;
      deformPoint(pi.base, Uu, pi.baseRigid, tmpA);
      deformPoint(pi.tip, Uu, 0, tmpB);
      tmpB.addScaledVector(ax.copy(pi.tip).sub(pi.base).normalize(), -0.05 * slamK);
      const off = pi.part.dir.clone().multiplyScalar(pi.part.dist * EXPLODE * e);
      tmpA.add(off); tmpB.add(off);
      const g = pi.part.obj;
      const mid = tmpA.clone().lerp(tmpB, 0.5);
      g.position.copy(mid);
      ax.copy(tmpB).sub(tmpA);
      const L = ax.length();
      alignY(g, ax);
      if (e > 0.001) g.quaternion.premultiply(q.setFromAxisAngle(pi.part.spinAxis, e * 0.3));
      const L0 = pi.barrel.userData.L as number;
      pi.barrel.position.y = -L / 2 + L0 * 0.275;
      pi.rod.position.y = L / 2 - L0 * 0.31;
      const [cb, ct] = (g.userData as { clevis: THREE.Object3D[] }).clevis;
      cb.position.y = -L / 2;
      ct.position.y = L0 * 0.31;
    }

    valve.spin *= Math.exp(-dt * 1.2);
    wheel.rotation.y += dt * (0.25 + valve.spin * 14);
  };

  return { parts, byName, plateRide, gears, gearSpeeds, pistons, valve, bolt, rivets, cup, core, update };
}
