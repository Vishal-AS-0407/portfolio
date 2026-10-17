/* A WebGL stage for a page's mechanism scene. Neutral plumbing: renderer
   lifecycle, DPR cap, resize, pointer orbit with inertia, click/hover picking.
   It chooses no colour, light or material — every scene brings its own.
   docs/design/subpages-mechanism.md */
import * as THREE from 'three';

export type Stage = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  w: number;
  h: number;
  /** pointer in NDC; `inside` while over the canvas */
  pointer: { ndc: THREE.Vector2; inside: boolean; down: boolean; x: number; y: number };
  /** accumulated user rotation from dragging, with inertia; scenes add it to their root */
  orbit: { yaw: number; pitch: number };
  ray: THREE.Raycaster;
  pick: (objects: THREE.Object3D[], recursive?: boolean) => THREE.Intersection | null;
  onClick: (() => void) | null;
  /** fires when the size changes, after the camera is updated */
  onResize: (() => void) | null;
  step: (dt: number) => void;
  render: () => void;
  dispose: () => void;
};

export function createStage(
  canvas: HTMLCanvasElement,
  opts: { fov?: number; ortho?: number; dprMax?: number; pitchMax?: number; yawMax?: number } = {},
): Stage | null {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true, powerPreference: 'high-performance' });
  } catch {
    return null;
  }
  const coarse = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 760;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, opts.dprMax ?? (coarse ? 1.5 : 1.75)));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera: THREE.PerspectiveCamera | THREE.OrthographicCamera = opts.ortho
    ? new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 200)
    : new THREE.PerspectiveCamera(opts.fov ?? 35, 1, 0.05, 200);

  const st: Stage = {
    renderer, scene, camera, w: 1, h: 1,
    pointer: { ndc: new THREE.Vector2(9, 9), inside: false, down: false, x: 0, y: 0 },
    orbit: { yaw: 0, pitch: 0 },
    ray: new THREE.Raycaster(),
    pick: () => null,
    onClick: null,
    onResize: null,
    step: () => {},
    render: () => renderer.render(scene, camera),
    dispose: () => {},
  };

  const size = () => {
    const w = Math.max(1, canvas.clientWidth), h = Math.max(1, canvas.clientHeight);
    if (w === st.w && h === st.h) return;
    st.w = w; st.h = h;
    renderer.setSize(w, h, false);
    if (camera instanceof THREE.PerspectiveCamera) {
      camera.aspect = w / h;
    } else {
      const v = opts.ortho!;
      const a = w / h;
      camera.left = -v * a; camera.right = v * a; camera.top = v; camera.bottom = -v;
    }
    camera.updateProjectionMatrix();
    st.onResize?.();
  };
  size();
  const ro = new ResizeObserver(size);
  ro.observe(canvas);

  /* ── pointer: hover, click, drag-to-orbit with inertia ── */
  let vy = 0, vp = 0, sx = 0, sy = 0, lx = 0, ly = 0, moved = 0;
  const pitchMax = opts.pitchMax ?? 0.55, yawMax = opts.yawMax ?? Infinity;
  const setNdc = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    st.pointer.x = e.clientX - r.left; st.pointer.y = e.clientY - r.top;
    st.pointer.ndc.set((st.pointer.x / r.width) * 2 - 1, -(st.pointer.y / r.height) * 2 + 1);
  };
  const move = (e: PointerEvent) => {
    setNdc(e);
    st.pointer.inside = true;
    if (!st.pointer.down) return;
    const dx = e.clientX - lx, dy = e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    moved = Math.max(moved, Math.hypot(e.clientX - sx, e.clientY - sy));
    if (moved > 5) { vy = dx * 0.006; vp = dy * 0.004; st.orbit.yaw += vy; st.orbit.pitch += vp; }
  };
  const down = (e: PointerEvent) => {
    if (e.button > 0) return;
    setNdc(e);
    st.pointer.down = true; moved = 0; sx = lx = e.clientX; sy = ly = e.clientY;
    canvas.setPointerCapture?.(e.pointerId);
  };
  const up = () => {
    if (!st.pointer.down) return;
    st.pointer.down = false;
    if (moved <= 5) st.onClick?.();
  };
  const leave = () => { st.pointer.inside = false; if (!st.pointer.down) st.pointer.ndc.set(9, 9); };
  const cancel = () => { st.pointer.down = false; };
  canvas.addEventListener('pointermove', move);
  canvas.addEventListener('pointerdown', down);
  canvas.addEventListener('pointerup', up);
  canvas.addEventListener('pointercancel', cancel);
  canvas.addEventListener('pointerleave', leave);

  st.step = (dt: number) => {
    if (!st.pointer.down) {
      st.orbit.yaw += vy; st.orbit.pitch += vp;
      const k = Math.pow(0.9, dt);
      vy *= k; vp *= k;
    }
    st.orbit.pitch = Math.max(-pitchMax, Math.min(pitchMax, st.orbit.pitch));
    st.orbit.yaw = Math.max(-yawMax, Math.min(yawMax, st.orbit.yaw));
  };

  st.pick = (objects, recursive = true) => {
    if (!st.pointer.inside && !st.pointer.down) return null;
    st.ray.setFromCamera(st.pointer.ndc, camera);
    return st.ray.intersectObjects(objects, recursive)[0] ?? null;
  };

  st.dispose = () => {
    ro.disconnect();
    canvas.removeEventListener('pointermove', move);
    canvas.removeEventListener('pointerdown', down);
    canvas.removeEventListener('pointerup', up);
    canvas.removeEventListener('pointercancel', cancel);
    canvas.removeEventListener('pointerleave', leave);
    scene.traverse((o) => {
      const m = o as THREE.Mesh;
      m.geometry?.dispose();
      const mat = m.material as THREE.Material | THREE.Material[] | undefined;
      if (Array.isArray(mat)) mat.forEach((x) => x.dispose()); else mat?.dispose();
    });
    renderer.dispose();
  };
  return st;
}

/** a canvas-drawn label as a sprite-ready texture */
export function textTexture(
  lines: string[], font: string, color: string, opts: { pad?: number; bg?: string; scale?: number; align?: CanvasTextAlign } = {},
) {
  const s = opts.scale ?? 2;
  const c = document.createElement('canvas');
  const x = c.getContext('2d')!;
  x.font = font;
  const lh = parseFloat(font.match(/(\d+(\.\d+)?)px/)?.[1] ?? '16') * 1.25;
  const pad = opts.pad ?? 6;
  const w = Math.ceil(Math.max(...lines.map((l) => x.measureText(l).width)) + pad * 2);
  const h = Math.ceil(lh * lines.length + pad * 2);
  c.width = w * s; c.height = h * s;
  x.scale(s, s);
  if (opts.bg) { x.fillStyle = opts.bg; x.fillRect(0, 0, w, h); }
  x.font = font; x.fillStyle = color; x.textBaseline = 'middle'; x.textAlign = opts.align ?? 'left';
  const tx = opts.align === 'center' ? w / 2 : pad;
  lines.forEach((l, i) => x.fillText(l, tx, pad + lh * (i + 0.5)));
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = 4;
  return { tex, aspect: w / h };
}

export const ease = {
  io: (t: number) => t * t * (3 - 2 * t),
  out: (t: number) => 1 - Math.pow(1 - t, 3),
  expo: (t: number) => (t >= 1 ? 1 : 1 - Math.pow(2, -10 * t)),
};
/** 0→1 as x goes a→b, clamped and smoothed */
export const band = (a: number, b: number, x: number) => ease.io(Math.max(0, Math.min(1, (x - a) / (b - a))));
