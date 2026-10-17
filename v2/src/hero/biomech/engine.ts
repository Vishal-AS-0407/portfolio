/* Biomech — the hero's centrepiece. Builds the scene, owns interaction, the
   teardown egg and the intro, and renders from the site's one frame loop.
   docs/design/biomech-and-inheritance.md */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { onFrame, state, clamp, ss } from '@/lib/scroll';
import { buildHeart, PALETTE } from './heart';
import { buildParts, metals, type Part, type PartName } from './parts';
import { buildSwarm, buildDebris } from './swarm';
import { buildFx } from './fx';
import { Cardiac } from './clock';
import { createSound, type Sound } from './audio';
import { surfaceAt, surfaceT } from './anatomy';

export type BiomechEvents = {
  onFirstInteraction: () => void;
  onTeardown: (open: boolean) => void;
  onFail: () => void;
};
export type BiomechHandle = {
  dispose: () => void;
  toggleSound: () => boolean;
  sound: Sound;
};

const EGG_KEY = 'biomech-egg';
const lsGet = (k: string) => { try { return localStorage.getItem(k); } catch { return null; } };
const lsSet = (k: string, v: string) => { try { localStorage.setItem(k, v); } catch { /* private mode */ } };
const expoOut = (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t));
const expoInOut = (t: number) =>
  t <= 0 ? 0 : t >= 1 ? 1 : t < 0.5 ? Math.pow(2, 20 * t - 10) / 2 : (2 - Math.pow(2, -20 * t + 10)) / 2;

export function createBiomech(
  canvas: HTMLCanvasElement, host: HTMLElement, overlay: HTMLElement, tier: 0 | 1 | 2, ev: BiomechEvents,
): BiomechHandle | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const animate = tier > 0;
  const dprCap = tier === 2 ? 1.75 : 1.5;
  let dpr = Math.min(window.devicePixelRatio || 1, dprCap);
  renderer.setPixelRatio(dpr);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.05;
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  const env = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
  pmrem.dispose();

  const cam = new THREE.PerspectiveCamera(32, 1, 0.1, 60);

  /* ── lights ── */
  const key = new THREE.DirectionalLight(PALETTE.m4, 1.9);
  key.position.set(-3, 4, 3.5);
  const rim = new THREE.DirectionalLight(PALETTE.m2, 3.2);
  rim.position.set(3.5, 1.2, -3);
  const under = new THREE.DirectionalLight(PALETTE.m1, 1.4);
  under.position.set(0, -4, 1);
  const cursorLight = new THREE.PointLight(PALETTE.m5, 0, 2.4, 1.6);
  cursorLight.position.set(0, 0, 2);
  scene.add(key, rim, under, cursorLight);

  /* ── graph: rig (screen placement, scroll exit) → space (swarm, debris, fx) + spin → heart ── */
  const rig = new THREE.Group();
  const space = new THREE.Group();
  const spin = new THREE.Group();
  const heartG = new THREE.Group();
  heartG.position.y = -0.12;
  rig.add(space, spin);
  spin.add(heartG);
  scene.add(rig);

  const H = buildHeart(tier, env);
  const M = metals(env);
  const P = buildParts(H.plate, H.U, env, M);
  heartG.add(H.flesh, H.vessels, P.core);
  const U = H.U;

  const swarm = buildSwarm(renderer, tier);
  if (swarm) space.add(swarm.points);
  const debris = buildDebris(tier === 2 ? 24 : 14, M, animate);
  space.add(debris.group);
  const fx = buildFx(env, animate);
  space.add(fx.group);

  /* a low-poly proxy for hover and flesh hits — 82k triangles is no raycast target */
  const proxyGeo = new THREE.IcosahedronGeometry(1, 3);
  {
    const pa = proxyGeo.attributes.position as THREE.BufferAttribute;
    const d = new THREE.Vector3();
    for (let i = 0; i < pa.count; i++) {
      d.fromBufferAttribute(pa, i).normalize();
      const t = surfaceT(d.x, d.y, d.z);
      pa.setXYZ(i, d.x * t, d.y * t, d.z * t);
    }
  }
  const proxy = new THREE.Mesh(proxyGeo, new THREE.MeshBasicMaterial());
  proxy.userData.part = 'flesh';

  const clock = new Cardiac();
  clock.auto = animate;
  const sound = createSound();
  const apexLocal = surfaceAt(new THREE.Vector3(0.42, -1, 0.12)).p;

  let renderUntil = 0;

  /* ── layout: where the heart sits on screen ── */
  let W = 1, Hh = 1;
  const base = new THREE.Vector3();
  const layout = () => {
    W = Math.max(1, host.clientWidth);
    Hh = Math.max(1, host.clientHeight);
    renderer.setSize(W, Hh, false);
    cam.aspect = W / Hh;
    const phone = W < 760;
    const frac = phone ? Math.min(0.42, (W * 0.82) / Hh) : 0.58;
    const sx = phone ? 0.5 : W < 1100 ? 0.68 : 0.72;
    const sy = phone ? 0.32 : 0.39;
    const tan = Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    const D = 2.55 / (2 * tan * frac);
    cam.position.set(0, 0, D);
    cam.updateProjectionMatrix();
    const halfH = D * tan, halfW = halfH * cam.aspect;
    base.set((sx * 2 - 1) * halfW, (1 - sy * 2) * halfH, 0);
    if (swarm) swarm.draw.uDpr.value = renderer.getPixelRatio();
    fx.setDpr(renderer.getPixelRatio());
  };
  layout();
  const ro = new ResizeObserver(() => { layout(); renderUntil = performance.now() + 300; });
  ro.observe(host);

  /* ── callouts (teardown) — real DOM text ── */
  const svgNS = 'http://www.w3.org/2000/svg';
  const svg = document.createElementNS(svgNS, 'svg');
  svg.setAttribute('class', 'bm-lines');
  overlay.appendChild(svg);
  const labelled = P.parts.filter((p) => p.label);
  const callouts = [...labelled.map((p) => ({ part: p as Part | null, text: p.label! })), { part: null, text: 'CORE — still human' }].map((c) => {
    const el = document.createElement('div');
    el.className = 'bm-callout';
    const [a, b] = c.text.split(' — ');
    el.innerHTML = `<b>${a}</b><span>${b}</span>`;
    overlay.appendChild(el);
    const line = document.createElementNS(svgNS, 'line');
    svg.appendChild(line);
    const dot = document.createElementNS(svgNS, 'circle');
    dot.setAttribute('r', '2.5');
    svg.appendChild(dot);
    return { ...c, el, line, dot };
  });

  /* ── interaction state ── */
  const ray = new THREE.Raycaster();
  const ndc = new THREE.Vector2(9, 9);
  let pointerIn = false, mouseOn = 0;
  let px = 0, py = 0, lastPX = 0, lastPY = 0, lastPT = 0;
  let down = false, downT = 0, downX = 0, downY = 0, moved = 0;
  let dragging = false, holding = false, holdK = 0, holdStart = 0;
  let rotVX = 0, rotVY = 0, dragX = 0, dragY = 0;
  let lookX = 0, lookY = 0;
  let interactions = 0, firstDone = false;
  let armed = lsGet(EGG_KEY) === '1';
  let flare = 0, dentT = 9, blast = 0, overclockVig = 0;
  let gearBoost = 0;
  const kickRender = (s = 1.4) => { renderUntil = performance.now() + s * 1000; };

  const pickables: THREE.Object3D[] = [];
  P.core.traverse((o) => { if ((o as THREE.Mesh).isMesh && o.userData.part) pickables.push(o); });

  const setNdc = (cx: number, cy: number) => {
    const r = canvas.getBoundingClientRect();
    px = cx - r.left; py = cy - r.top;
    ndc.set((px / r.width) * 2 - 1, -(py / r.height) * 2 + 1);
  };
  const pick = (): { name: PartName | 'flesh'; point: THREE.Vector3; normal: THREE.Vector3 } | null => {
    ray.setFromCamera(ndc, cam);
    proxy.matrixWorld.copy(heartG.matrixWorld);
    const hits = ray.intersectObjects([...pickables, proxy], false);
    if (!hits.length) return null;
    const h = hits[0];
    const nrm = h.face ? h.face.normal.clone().transformDirection(h.object.matrixWorld) : new THREE.Vector3(0, 0, 1);
    return { name: h.object.userData.part, point: h.point.clone(), normal: nrm };
  };

  const toSpace = (wp: THREE.Vector3) => space.worldToLocal(wp.clone());
  const dirToSpace = (wd: THREE.Vector3) => {
    const q = new THREE.Quaternion();
    space.getWorldQuaternion(q);
    return wd.clone().applyQuaternion(q.invert()).normalize();
  };

  const touched = () => {
    if (!firstDone) { firstDone = true; ev.onFirstInteraction(); }
    interactions++;
    if (interactions >= 7 && !armed) {
      armed = true;
      console.log('%ca bolt has worked itself loose.', 'color:#FE9F6D;font:12px monospace');
    }
    kickRender();
  };

  const beat = (strength: number) => {
    clock.kick(strength);
    flare = Math.max(flare, 1.2 + strength);
    state.pulse += 0.25 + strength * 0.3;
    if (swarm) swarm.U.uPulse.value += 0.6 * strength;
    kickRender(2);
  };

  /* ── teardown ── */
  type Anim = { from: number; to: number; t0: number; dur: number; ease: (t: number) => number };
  let explodeAnim: Anim = { from: 1, to: 1, t0: 0, dur: 1, ease: expoOut };
  let explodeNow = 1;
  let introDone = false, tearOpen = false, tearTimer = 0;
  let boltOut = 0;  // 0 home → 1 gone
  const STAGGER = 0.07;
  const order = new Map<Part, number>(P.parts.map((p, i) => [p, i]));
  const explodeOf = (p: Part) => {
    const a = explodeAnim;
    const n = P.parts.length;
    const local = clamp(((performance.now() - a.t0) / (a.dur * 1000)) * (1 + STAGGER * n) - STAGGER * (order.get(p) ?? 0), 0, 1);
    return a.from + (a.to - a.from) * a.ease(local);
  };
  const runExplode = (to: number, dur: number, ease = expoOut) => {
    explodeAnim = { from: explodeNow, to, t0: performance.now(), dur: animate ? dur : 0.0001, ease };
    kickRender(dur + 0.6);
  };

  const openTeardown = () => {
    if (tearOpen) return;
    tearOpen = true;
    lsSet(EGG_KEY, '1');
    state.hud = 'state: teardown';
    console.log('%cyou took it apart. it still beats.', 'color:#FCFDBF;background:#3B0F70;font:600 12px/2 monospace;padding:0 8px');
    tearTimer = 0;
    boltOut = 0.001;
    sound.clang();
    setTimeout(() => runExplode(1, 1.15), animate ? 380 : 0);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    ev.onTeardown(true);
  };
  const closeTeardown = () => {
    if (!tearOpen) return;
    tearOpen = false;
    state.hud = '';
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    runExplode(0, 1.1, expoInOut);
    setTimeout(() => { boltOut = 0; beat(1.5); sound.beat(2); }, animate ? 1150 : 0);
    ev.onTeardown(false);
  };

  /* ── per-part click reactions ── */
  const react = (hit: NonNullable<ReturnType<typeof pick>>) => {
    const sp = toSpace(hit.point), sn = dirToSpace(hit.normal);
    switch (hit.name) {
      case 'flesh': {
        const local = heartG.worldToLocal(hit.point.clone());
        U.uDent.value.copy(local);
        dentT = 0;
        beat(1.4);
        fx.ring(sp, sn, 0.5);
        sound.beat(1.6);
        break;
      }
      case 'plate':
        fx.sparks(sp, sn, 26);
        fx.ring(sp, sn, 0.3);
        sound.clang();
        flare = Math.max(flare, 0.6);
        state.pulse += 0.3;
        break;
      case 'pistonA': case 'pistonB': {
        const pi = P.pistons.find((x) => x.part.name === hit.name)!;
        pi.slam = 1;
        sound.piston(); setTimeout(() => sound.piston(), 130);
        fx.sparks(sp, sn, 10);
        break;
      }
      case 'gears':
        gearBoost = 8;
        sound.piston();
        break;
      case 'valve':
        P.valve.spin = 1;
        steamBurst = 1.2;
        sound.steam(1.2);
        break;
      case 'aorta': case 'pulmonary': case 'cava':
        fx.sparks(sp, sn, 18);
        sound.clang();
        hoseShake = 1;
        break;
      case 'bolt':
        if (armed && !tearOpen) { openTeardown(); return; }
        fx.sparks(sp, sn, 6);
        sound.piston();
        break;
    }
    kickRender(1.6);
  };
  let steamBurst = 0, hoseShake = 0;

  /* ── pointer ── */
  const onMove = (e: PointerEvent) => {
    setNdc(e.clientX, e.clientY);
    pointerIn = true;
    const now = performance.now();
    const dtm = Math.max(1, now - lastPT);
    const vx = (px - lastPX) / dtm, vy = (py - lastPY) / dtm;
    if (down) {
      const dx = px - downX, dy = py - downY;
      moved = Math.max(moved, Math.hypot(dx, dy));
      if (moved > 6 && !holding) {
        dragging = true;
        rotVY = (px - lastPX) * 0.0065;
        rotVX = (py - lastPY) * 0.0045;
        dragX += rotVX; dragY += rotVY;
        canvas.dataset.curLabel = 'drag';
      }
    } else if (debris.flick(px, py, vx, vy, cam, W, Hh)) {
      touched();
    }
    lastPX = px; lastPY = py; lastPT = now;
    kickRender(0.6);
  };
  const onDown = (e: PointerEvent) => {
    if (e.button > 0) return;
    setNdc(e.clientX, e.clientY);
    down = true; moved = 0; dragging = false; holding = false;
    downT = performance.now(); downX = px; downY = py; lastPX = px; lastPY = py;
    if (tearOpen) return;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const release = () => {
    if (!down) return;
    down = false;
    const dur = performance.now() - downT;
    if (tearOpen) {
      if (moved < 6) closeTeardown();
      return;
    }
    if (holding) {
      const held = (performance.now() - holdStart) / 1000;
      holding = false;
      sound.hold(0);
      clock.target = 64;
      if (held >= 0.8) {
        blast = 1;
        if (swarm) swarm.U.uBlast.value = holdK;
        debris.blast(holdK * 2.4);
        state.pulse += 1.2 * holdK;
        beat(1.2 + holdK);
        sound.blast();
        fx.ring(new THREE.Vector3(), dirToSpace(cam.getWorldDirection(new THREE.Vector3()).negate()), 1.9 * holdK + 0.4);
      }
      touched();
    } else if (!dragging && moved < 6 && dur < 450) {
      const hit = pick();
      if (hit) { react(hit); touched(); }
    } else if (dragging) touched();
    dragging = false;
    canvas.dataset.curLabel = 'drag';
  };
  const onLeave = () => { pointerIn = false; if (!down) canvas.dataset.curLabel = ''; };
  canvas.addEventListener('pointermove', onMove);
  canvas.addEventListener('pointerdown', onDown);
  canvas.addEventListener('pointerup', release);
  canvas.addEventListener('pointercancel', () => { down = false; holding = false; dragging = false; sound.hold(0); clock.target = 64; });
  canvas.addEventListener('pointerleave', onLeave);
  const noMenu = (e: Event) => e.preventDefault();
  canvas.addEventListener('contextmenu', noMenu);
  canvas.dataset.curLabel = 'drag';

  /* ── keyboard ── */
  let spaceHeld = false;
  const onKey = (e: KeyboardEvent) => {
    if (e.key === 'ArrowLeft') { rotVY -= 0.06; dragY -= 0.06; }
    else if (e.key === 'ArrowRight') { rotVY += 0.06; dragY += 0.06; }
    else if (e.key === 'ArrowUp') { dragX -= 0.05; }
    else if (e.key === 'ArrowDown') { dragX += 0.05; }
    else if (e.key === 'Enter') { beat(1.4); sound.beat(1.6); touched(); }
    else if (e.key === 'Escape') { closeTeardown(); }
    else if (e.key === ' ') {
      if (!spaceHeld) { spaceHeld = true; holding = true; holdStart = performance.now(); down = true; moved = 0; downT = performance.now(); }
    } else return;
    e.preventDefault();
    kickRender();
  };
  const onKeyUp = (e: KeyboardEvent) => {
    if (e.key === ' ' && spaceHeld) { spaceHeld = false; release(); e.preventDefault(); }
  };
  canvas.addEventListener('keydown', onKey);
  canvas.addEventListener('keyup', onKeyUp);

  /* the egg also opens from a click anywhere while open, or Escape */
  const onDocDown = (e: PointerEvent) => { if (tearOpen && e.target !== canvas) closeTeardown(); };
  document.addEventListener('pointerdown', onDocDown);

  /* ── clock hooks ── */
  clock.onPeak = (a) => {
    state.pulse += 0.1 * a;
    if (swarm) swarm.U.uPulse.value += 0.28 * a;
    sound.beat(a);
    if (Math.random() < 0.55 || a > 1.2) {
      const vt = P.valve.part.obj;
      const at = vt.localToWorld(P.valve.nozzle.clone());
      fx.steam(toSpace(at), dirToSpace(new THREE.Vector3(1, 0.6, 0).applyQuaternion(vt.getWorldQuaternion(new THREE.Quaternion()))), 3 + Math.round(a * 2), 0.7);
    }
  };

  /* ── intro: the parts fly in once the preloader lifts ── */
  let introAt = 0;
  const startIntro = () => {
    if (introAt) return;
    introAt = performance.now();
    runExplode(0, 1.5);
    setTimeout(() => {
      introDone = true;
      beat(1);
      if (new URLSearchParams(location.search).get('egg') === '1') { armed = true; openTeardown(); }
    }, animate ? 1500 : 0);
  };
  if (state.ready) startIntro();
  const onReady = () => startIntro();
  window.addEventListener('preloader:done', onReady);

  /* ── adaptive quality ── */
  let ftAcc = 0, ftN = 0, lastRender = 0, swarmFrac = 1;
  const adapt = (ms: number) => {
    ftAcc += ms; ftN++;
    if (ftN < 60) return;
    const avg = ftAcc / ftN;
    ftAcc = 0; ftN = 0;
    if (avg > 22 && dpr > 1) {
      dpr = Math.max(1, dpr - 0.25);
      renderer.setPixelRatio(dpr);
      layout();
    } else if (avg > 28 && swarm && swarmFrac > 0.25) {
      swarmFrac *= 0.5;
      swarm.setDrawFraction(swarmFrac);
    }
  };

  /* ── context loss ── */
  const onLost = (e: Event) => { e.preventDefault(); ev.onFail(); };
  canvas.addEventListener('webglcontextlost', onLost);

  /* ── frame ── */
  const t0 = performance.now();
  let lastT = t0, visible = true, wasVisible = true;
  const tmp = new THREE.Vector3(), tmpQ = new THREE.Quaternion();
  const apexW = new THREE.Vector3();
  const io = new IntersectionObserver(([en]) => { visible = en.isIntersecting; }, { threshold: 0 });
  io.observe(host);

  const off = onFrame(() => {
    const now = performance.now();
    const dt = Math.min(0.05, (now - lastT) / 1000);
    lastT = now;
    const t = (now - t0) / 1000;
    const hp = clamp(window.scrollY / Math.max(1, window.innerHeight), 0, 1.2);
    const show = visible && hp < 1.05 && !!introAt;
    if (!show) {
      if (wasVisible) { canvas.style.visibility = 'hidden'; wasVisible = false; }
      return;
    }
    if (!wasVisible) { canvas.style.visibility = 'visible'; wasVisible = true; }
    if (!animate && now > renderUntil && introDone) return;

    /* hold → overclock */
    if (down && !dragging && !holding && !tearOpen && moved < 6 && now - downT > 350) {
      holding = true; holdStart = now; canvas.dataset.curLabel = 'hold';
    }
    if (holding) {
      holdK = Math.min(1, holdK + dt / 2.4);
      clock.target = 64 + 116 * holdK;
      sound.hold(holdK);
    } else holdK = Math.max(0, holdK - dt * 0.9);
    overclockVig = holdK;
    state.hud = tearOpen ? 'state: teardown' : holdK > 0.05 ? `state: overclock ${Math.round(clock.bpm)} bpm` : state.hud.startsWith('state: overclock') ? '' : state.hud;
    host.style.setProperty('--bm-vig', (holdK * (0.55 + 0.45 * clock.V)).toFixed(3));

    clock.tick(dt);
    explodeNow = explodeOf(P.parts[0]);

    /* uniforms */
    U.uTime.value = t;
    U.uA.value = clock.A;
    U.uV.value = clock.V;
    U.uWring.value = 0.06 * clock.V;
    flare *= Math.exp(-dt * 2.6);
    U.uGlow.value = 0.05 + clock.V * 0.6 + holdK * 1.1;
    U.uFlare.value = flare;
    U.uWave.value = clock.sincePeak * 1.9;
    dentT += dt;
    U.uDentAmt.value = 0.09 * Math.exp(-2.9 * dentT) * Math.cos(18 * dentT);

    /* rotation: idle sway + pointer look + drag inertia with a spring home */
    const r = canvas.getBoundingClientRect();
    const lx = pointerIn ? (px / r.width - 0.5) : 0, ly = pointerIn ? (py / r.height - 0.5) : 0;
    lookX += (ly * 0.24 - lookX) * Math.min(1, dt * 3);
    lookY += (lx * 0.36 - lookY) * Math.min(1, dt * 3);
    if (!down || !dragging) {
      dragY += rotVY; dragX += rotVX;
      rotVY *= Math.pow(0.92, dt * 60); rotVX *= Math.pow(0.92, dt * 60);
      if (Math.abs(rotVY) < 0.002) dragY *= Math.pow(1 - 0.035, dt * 60);
      if (Math.abs(rotVX) < 0.002) dragX *= Math.pow(1 - 0.05, dt * 60);
    }
    dragX = clamp(dragX, -0.7, 0.7);
    const sway = animate ? Math.sin(t * 0.17) * 0.2 : 0;
    spin.rotation.set(lookX + dragX + 0.06, -0.3 + sway + lookY + dragY, 0);
    const shake = (holdK * 0.012 + hoseShake * 0.01) * (animate ? 1 : 0);
    hoseShake *= Math.exp(-dt * 6);

    /* scroll exit + intro scale */
    const introK = introAt ? expoOut(clamp((now - introAt) / 1600, 0, 1)) : 0;
    rig.position.set(
      base.x + (Math.random() - 0.5) * shake,
      base.y - ss(0, 1, hp) * 0.9 + (animate ? Math.sin(t * 0.6) * 0.03 : 0) + (Math.random() - 0.5) * shake,
      -ss(0, 1, hp) * 1.6,
    );
    rig.scale.setScalar(0.82 + 0.18 * introK);
    canvas.style.opacity = (1 - ss(0.55, 1, hp)).toFixed(3);

    /* parts */
    P.update(U, dt, explodeOf);
    gearBoost *= Math.exp(-dt * 0.9);
    const gearRate = (clock.bpm / 64) * (0.8 + gearBoost);
    P.gears.forEach((g, i) => { g.rotation.z += P.gearSpeeds[i] * dt * gearRate * 0.6; });

    /* the loose bolt: glints when armed, unscrews on teardown */
    const bm = P.bolt.mesh;
    const bmat = bm.material as THREE.MeshPhysicalMaterial;
    if (boltOut > 0 && boltOut < 1) boltOut = Math.min(1, boltOut + dt * 1.4);
    if (boltOut > 0) {
      bm.position.copy(P.bolt.home).addScaledVector(P.bolt.n, expoOut(boltOut) * 0.5);
      bm.rotateOnAxis(new THREE.Vector3(0, 1, 0), dt * 30 * (1 - boltOut));
      bm.visible = boltOut < 0.99;
    } else {
      bm.visible = true;
      bm.position.copy(P.bolt.home);
      bm.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), P.bolt.n);
      if (armed) {
        const g = Math.pow(Math.max(0, Math.sin(t * 2.6)), 24);
        bmat.emissive.set(PALETTE.m5);
        bmat.emissiveIntensity = g * 1.6 + 0.08;
        bm.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.sin(t * 19) * 0.08 * (0.3 + g));
      }
    }

    /* cursor light rides above the surface under the pointer */
    if (pointerIn && !down && now - lastRender > 30) {
      ray.setFromCamera(ndc, cam);
      proxy.matrixWorld.copy(heartG.matrixWorld);
      const hit = ray.intersectObject(proxy, false)[0];
      if (hit) {
        tmp.copy(hit.point).add(ray.ray.direction.clone().multiplyScalar(-0.62));
        cursorLight.position.lerp(tmp, 0.35);
      } else {
        tmp.copy(ray.ray.direction).multiplyScalar(cam.position.z - 0.6).add(cam.position);
        cursorLight.position.lerp(tmp, 0.2);
      }
    }
    mouseOn += ((pointerIn ? 1 : 0) - mouseOn) * Math.min(1, dt * 4);
    cursorLight.intensity = 1.7 * mouseOn + holdK * 1.2;

    /* swarm */
    if (swarm) {
      const S = swarm.U;
      S.uTime.value = t;
      S.uDt.value = Math.min(2.5, dt * 60);
      S.uHold.value = holdK;
      S.uDisperse.value = ss(0.05, 0.9, hp) + (1 - introK) * 0.6;
      S.uMouseOn.value = mouseOn;
      ray.setFromCamera(ndc, cam);
      S.uRayO.value.copy(toSpace(ray.ray.origin));
      S.uRayD.value.copy(dirToSpace(ray.ray.direction));
      if (animate) swarm.step();
      S.uPulse.value *= Math.pow(0.82, dt * 60);
      S.uBlast.value = 0;
      swarm.draw.uAlpha.value = introK;
      swarm.draw.uLight.value.copy(cursorLight.position);
    }
    blast *= Math.exp(-dt * 3);

    debris.update(dt, animate ? t : 0, ss(0.05, 0.9, hp) + (1 - introK) * 0.8);

    /* steam burst from a valve click */
    if (steamBurst > 0 && P.valve.part.obj) {
      steamBurst -= dt;
      const vt = P.valve.part.obj;
      const at = vt.localToWorld(P.valve.nozzle.clone());
      fx.steam(toSpace(at), dirToSpace(new THREE.Vector3(1, 0.5, 0).applyQuaternion(vt.getWorldQuaternion(tmpQ))), 4, 1.6);
    }
    scene.updateMatrixWorld();
    apexW.copy(apexLocal);
    heartG.localToWorld(apexW);
    fx.update(dt, toSpace(apexW), introDone && !tearOpen);

    /* teardown callouts */
    if (tearOpen) {
      tearTimer += dt;
      if (tearTimer > 8) closeTeardown();
    }
    if (tearOpen || overlay.classList.contains('open')) {
      const centre = tmp.copy(heartG.getWorldPosition(new THREE.Vector3())).project(cam);
      const cx = (centre.x * 0.5 + 0.5) * W, cy = (-centre.y * 0.5 + 0.5) * Hh;
      const placed: { c: (typeof callouts)[number]; x: number; y: number; lx: number; ly: number; left: boolean }[] = [];
      for (const c of callouts) {
        const wp = c.part ? c.part.obj.getWorldPosition(new THREE.Vector3()) : heartG.getWorldPosition(new THREE.Vector3());
        wp.project(cam);
        const x = (wp.x * 0.5 + 0.5) * W, y = (-wp.y * 0.5 + 0.5) * Hh;
        let dx = x - cx, dy = y - cy;
        const dl = Math.hypot(dx, dy) || 1;
        dx /= dl; dy /= dl;
        if (!c.part) { dx = -0.7; dy = 0.7; }
        placed.push({ c, x, y, lx: clamp(x + dx * 64, 150, W - 150), ly: clamp(y + dy * 44, 40, Hh - 170), left: dx < 0 });
      }
      /* keep labels on the same side from stacking on each other */
      placed.sort((a, b) => a.ly - b.ly);
      for (let i = 1; i < placed.length; i++) {
        for (let j = 0; j < i; j++) {
          const a = placed[j], b = placed[i];
          if (a.left === b.left && Math.abs(a.lx - b.lx) < 180 && b.ly - a.ly < 38) b.ly = a.ly + 38;
        }
      }
      for (const { c, x, y, lx: lx2, ly: ly2, left } of placed) {
        c.el.style.transform = `translate(${lx2.toFixed(1)}px,${ly2.toFixed(1)}px) translate(${left ? '-100%' : '0'},-50%)`;
        c.line.setAttribute('x1', x.toFixed(1)); c.line.setAttribute('y1', y.toFixed(1));
        c.line.setAttribute('x2', lx2.toFixed(1)); c.line.setAttribute('y2', ly2.toFixed(1));
        c.dot.setAttribute('cx', x.toFixed(1)); c.dot.setAttribute('cy', y.toFixed(1));
      }
    }

    renderer.render(scene, cam);
    /* frame interval, only while rendering back to back */
    if (animate && now - lastRender < 100) adapt(now - lastRender);
    lastRender = now;
  });

  return {
    sound,
    toggleSound: () => { const on = sound.toggle(); if (on) sound.beat(1); return on; },
    dispose() {
      off();
      ro.disconnect();
      io.disconnect();
      window.removeEventListener('preloader:done', onReady);
      document.removeEventListener('pointerdown', onDocDown);
      canvas.removeEventListener('webglcontextlost', onLost);
      sound.dispose();
      swarm?.dispose();
      fx.dispose();
      overlay.innerHTML = '';
      state.hud = '';
      scene.traverse((o) => {
        const m = o as THREE.Mesh;
        if (m.geometry) m.geometry.dispose();
        const mat = m.material as THREE.Material | THREE.Material[] | undefined;
        if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
      });
      proxyGeo.dispose();
      env.dispose();
      renderer.dispose();
    },
  };
}
