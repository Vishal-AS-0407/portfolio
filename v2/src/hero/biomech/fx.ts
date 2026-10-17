/* Small effects, CPU-simulated: steam from the valve, sparks off metal,
   shock rings from a click, and oil that beads at the apex and drips away
   into the swarm. */
import * as THREE from 'three';
import { PALETTE } from './heart';

const SPR_V = /* glsl */ `
attribute float aSize, aAlpha;
attribute vec3 aCol;
uniform float uDpr;
varying float vA;
varying vec3 vC;
void main(){
  vec4 mv = modelViewMatrix * vec4(position, 1.);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = aSize * uDpr * 120. / -mv.z;
  vA = aAlpha; vC = aCol;
}`;
const SPR_F = /* glsl */ `
varying float vA;
varying vec3 vC;
void main(){
  vec2 q = gl_PointCoord - .5;
  float r = dot(q, q);
  if (r > .25) discard;
  float a = (1. - smoothstep(0., .25, r)) * vA;
  gl_FragColor = vec4(vC * a, a);
}`;

type P = { x: number; y: number; z: number; vx: number; vy: number; vz: number; life: number; max: number; size: number; grow: number; g: number; drag: number; c: THREE.Color; a: number };

export type Fx = {
  group: THREE.Group;
  steam: (at: THREE.Vector3, dir: THREE.Vector3, n: number, power?: number) => void;
  sparks: (at: THREE.Vector3, normal: THREE.Vector3, n: number) => void;
  ring: (at: THREE.Vector3, normal: THREE.Vector3, size?: number) => void;
  update: (dt: number, apex: THREE.Vector3, dripping: boolean) => void;
  setDpr: (d: number) => void;
  dispose: () => void;
};

export function buildFx(env: THREE.Texture | null, animate: boolean): Fx {
  const group = new THREE.Group();
  const MAX = 900;
  const pool: P[] = [];
  const geo = new THREE.BufferGeometry();
  const posA = new Float32Array(MAX * 3), colA = new Float32Array(MAX * 3), sizeA = new Float32Array(MAX), alphaA = new Float32Array(MAX);
  geo.setAttribute('position', new THREE.BufferAttribute(posA, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aCol', new THREE.BufferAttribute(colA, 3).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aSize', new THREE.BufferAttribute(sizeA, 1).setUsage(THREE.DynamicDrawUsage));
  geo.setAttribute('aAlpha', new THREE.BufferAttribute(alphaA, 1).setUsage(THREE.DynamicDrawUsage));
  geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 20);
  const sprU = { uDpr: { value: 1 } };
  const mat = new THREE.ShaderMaterial({
    uniforms: sprU, vertexShader: SPR_V, fragmentShader: SPR_F, transparent: true, depthWrite: false,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
  });
  const pts = new THREE.Points(geo, mat);
  pts.frustumCulled = false;
  pts.renderOrder = 3;
  group.add(pts);

  const steamC = new THREE.Color(PALETTE.fg).multiplyScalar(0.55);
  const sparkA = new THREE.Color(PALETTE.m5), sparkB = new THREE.Color(PALETTE.m4);
  const add = (p: Omit<P, 'life'>) => { if (pool.length < MAX) pool.push({ ...p, life: 0 }); };

  const steam: Fx['steam'] = (at, dir, n, power = 1) => {
    for (let i = 0; i < n; i++) {
      const s = (0.012 + Math.random() * 0.02) * power;
      add({
        x: at.x, y: at.y, z: at.z,
        vx: dir.x * s + (Math.random() - 0.5) * 0.006, vy: dir.y * s + 0.004 + Math.random() * 0.004, vz: dir.z * s + (Math.random() - 0.5) * 0.006,
        max: 0.9 + Math.random() * 0.8, size: 0.05 + Math.random() * 0.05, grow: 0.22, g: -0.004, drag: 0.94, c: steamC, a: 0.32,
      });
    }
  };
  const sparks: Fx['sparks'] = (at, nrm, n) => {
    for (let i = 0; i < n; i++) {
      const v = new THREE.Vector3(Math.random() - 0.5, Math.random() - 0.3, Math.random() - 0.5).multiplyScalar(0.06).addScaledVector(nrm, 0.03 + Math.random() * 0.05);
      add({
        x: at.x, y: at.y, z: at.z, vx: v.x, vy: v.y, vz: v.z, max: 0.35 + Math.random() * 0.5,
        size: 0.012 + Math.random() * 0.014, grow: -0.01, g: 0.0024, drag: 0.975, c: Math.random() < 0.5 ? sparkA : sparkB, a: 1,
      });
    }
  };

  /* shock rings: flat additive rings that expand along the surface normal */
  const ringMat = new THREE.ShaderMaterial({
    uniforms: { uA: { value: 0 }, uC: { value: new THREE.Color(PALETTE.m4) } },
    vertexShader: 'varying vec2 vU; void main(){ vU = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.); }',
    fragmentShader: 'uniform float uA; uniform vec3 uC; varying vec2 vU; void main(){ float e = sin(vU.x * 3.14159); gl_FragColor = vec4(uC * uA * e, uA * e); }',
    transparent: true, depthWrite: false, side: THREE.DoubleSide,
    blending: THREE.CustomBlending, blendSrc: THREE.OneFactor, blendDst: THREE.OneFactor,
  });
  const ringGeo = new THREE.RingGeometry(0.8, 1, 64, 1);
  /* map radial position into uv.x so the edge can be feathered */
  {
    const p = ringGeo.attributes.position as THREE.BufferAttribute, uv = ringGeo.attributes.uv as THREE.BufferAttribute;
    for (let i = 0; i < p.count; i++) uv.setX(i, (Math.hypot(p.getX(i), p.getY(i)) - 0.8) / 0.2);
  }
  const rings: { m: THREE.Mesh; t: number; size: number }[] = [];
  const ring: Fx['ring'] = (at, nrm, size = 1) => {
    const m = new THREE.Mesh(ringGeo, ringMat.clone());
    m.position.copy(at);
    m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 0, 1), nrm);
    m.renderOrder = 4;
    group.add(m);
    rings.push({ m, t: 0, size });
  };

  /* oil: glossy black beads that grow at the apex, stretch, let go and fall */
  const oilMat = new THREE.MeshPhysicalMaterial({ color: '#050505', roughness: 0.04, metalness: 0.2, clearcoat: 1, clearcoatRoughness: 0.02, envMap: env, envMapIntensity: 1.4 });
  const DROPS = 8;
  const oil = new THREE.InstancedMesh(new THREE.SphereGeometry(1, 16, 12), oilMat, DROPS);
  oil.frustumCulled = false;
  group.add(oil);
  const drops = Array.from({ length: DROPS }, (_, i) => ({ state: 0, t: -i * 1.6 - Math.random(), y: 0, vy: 0, jx: 0, jz: 0, r: 0 }));
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), pv = new THREE.Vector3(), sv = new THREE.Vector3();

  const update: Fx['update'] = (dt, apex, dripping) => {
    const f = dt * 60;
    let k = 0;
    for (let i = pool.length - 1; i >= 0; i--) {
      const p = pool[i];
      p.life += dt;
      if (p.life >= p.max) { pool[i] = pool[pool.length - 1]; pool.pop(); continue; }
      p.vy -= p.g * f;
      const dr = Math.pow(p.drag, f);
      p.vx *= dr; p.vy *= dr; p.vz *= dr;
      p.x += p.vx * f; p.y += p.vy * f; p.z += p.vz * f;
      p.size = Math.max(0.002, p.size + p.grow * dt);
    }
    for (const p of pool) {
      const tt = p.life / p.max;
      posA[k * 3] = p.x; posA[k * 3 + 1] = p.y; posA[k * 3 + 2] = p.z;
      colA[k * 3] = p.c.r; colA[k * 3 + 1] = p.c.g; colA[k * 3 + 2] = p.c.b;
      sizeA[k] = p.size;
      alphaA[k] = p.a * Math.min(1, tt * 8) * (1 - tt) * (1 - tt);
      k++;
    }
    geo.setDrawRange(0, k);
    (['position', 'aCol', 'aSize', 'aAlpha'] as const).forEach((n) => { (geo.attributes[n] as THREE.BufferAttribute).needsUpdate = true; });

    for (let i = rings.length - 1; i >= 0; i--) {
      const r = rings[i];
      r.t += dt;
      const tt = r.t / 0.9;
      if (tt >= 1) { group.remove(r.m); (r.m.material as THREE.Material).dispose(); rings.splice(i, 1); continue; }
      const e = 1 - Math.pow(1 - tt, 3);
      r.m.scale.setScalar((0.15 + e * 1.6) * r.size);
      (r.m.material as THREE.ShaderMaterial).uniforms.uA.value = (1 - tt) * (1 - tt) * 0.9;
    }

    for (let i = 0; i < DROPS; i++) {
      const d = drops[i];
      if (animate && dripping) d.t += dt;
      if (d.state === 0) {
        /* beading: grows on the apex for 2.4 s */
        if (d.t > 0) { d.state = 1; d.jx = (Math.random() - 0.5) * 0.06; d.jz = (Math.random() - 0.5) * 0.06; }
        d.r = 0;
      }
      if (d.state === 1) {
        const g = Math.min(1, d.t / 2.4);
        d.r = 0.012 + g * 0.022;
        d.y = -d.r * 0.6 - g * 0.02;
        if (g >= 1) { d.state = 2; d.vy = 0; }
      } else if (d.state === 2) {
        d.vy -= 1.6 * dt;
        d.y += d.vy * dt;
        if (d.y < -3.2) { d.state = 0; d.t = -2 - Math.random() * 5; d.r = 0; }
      }
      const stretch = d.state === 2 ? 1 + Math.min(1.6, -d.vy * 0.9) : d.state === 1 ? 1.25 : 1;
      pv.set(apex.x + d.jx, apex.y + d.y, apex.z + d.jz);
      sv.set(d.r, d.r * stretch, d.r);
      oil.setMatrixAt(i, m4.compose(pv, q.identity(), d.r > 0 ? sv : sv.setScalar(0)));
    }
    oil.instanceMatrix.needsUpdate = true;
  };

  return {
    group, steam, sparks, ring, update,
    setDpr(dd) { sprU.uDpr.value = dd; },
    dispose() { geo.dispose(); mat.dispose(); ringGeo.dispose(); ringMat.dispose(); oil.geometry.dispose(); oilMat.dispose(); },
  };
}
