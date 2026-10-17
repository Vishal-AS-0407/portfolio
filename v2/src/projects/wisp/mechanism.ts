/* After Dark — the mechanism in 3D: the page's own generated IR frame becomes
   a relief whose height is attribution. It passes through a feature pyramid,
   the attribution rises where the model looked, the six methods argue, and the
   field report closes it. Frames and fields come from ./ir, as on the page. */
import * as THREE from 'three';
import type { Builder } from '@/projects/_shared/Mechanism';
import { band, ease, textTexture } from '@/projects/_shared/stage3d';
import { makeIR, heatField, METHODS } from './ir';
import { STUDY } from './species';

const HEAT = '#b4ff3b', BONE = '#f0e7d8', RUST = '#d2673a';
const GW = 150, GH = 100;
const FW = 4.4, FH = (FW * GH) / GW;

const RV = /* glsl */ `
attribute float aH0, aH1;
uniform float uMix, uLift;
varying vec2 vUv; varying float vH;
void main(){
  vUv = uv;
  float h = mix(aH0, aH1, uMix);
  vH = h;
  vec3 p = position + vec3(0., 0., h * uLift);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.);
}`;
const RF = /* glsl */ `
uniform sampler2D uIR; uniform vec3 uHeat; uniform float uShow, uTorchOn, uAlpha;
uniform vec2 uTorch;
varying vec2 vUv; varying float vH;
void main(){
  vec3 ir = texture2D(uIR, vUv).rgb;
  float torch = uTorchOn * smoothstep(.2, .0, distance(vUv * vec2(1.5, 1.), uTorch * vec2(1.5, 1.)));
  vec3 base = ir * (.55 + torch * .7);
  float heat = smoothstep(.18, .85, vH) * uShow;
  vec3 col = mix(base, uHeat, heat * (.55 + .45 * torch + .25));
  gl_FragColor = vec4(col, uAlpha);
}`;

export const wispScene: Builder = (stage, env) => {
  const { scene, camera } = stage;
  const cam = camera as THREE.PerspectiveCamera;
  const root = new THREE.Group();
  scene.add(root);

  /* the frame, exactly as the page generates it */
  const irCanvas = makeIR('mx-study', STUDY, 600, 400);
  const irTex = new THREE.CanvasTexture(irCanvas);
  irTex.colorSpace = THREE.SRGBColorSpace;

  /* six attribution fields, one per Captum method — computed once */
  const fields = METHODS.map((_, m) => heatField(STUDY, m, GW + 1, GH + 1));
  const geo = new THREE.PlaneGeometry(FW, FH, GW, GH);
  const n = geo.attributes.position.count;
  const h0 = new Float32Array(n), h1 = new Float32Array(n);
  const fill = (dst: Float32Array, m: number) => {
    const f = fields[m];
    /* PlaneGeometry rows run top → bottom, like the field */
    for (let i = 0; i < n; i++) dst[i] = f[i] ?? 0;
  };
  fill(h0, 0); fill(h1, 0);
  geo.setAttribute('aH0', new THREE.BufferAttribute(h0, 1));
  geo.setAttribute('aH1', new THREE.BufferAttribute(h1, 1));
  const U = {
    uIR: { value: irTex }, uHeat: { value: new THREE.Color(HEAT) }, uMix: { value: 1 }, uLift: { value: 0 },
    uShow: { value: 0 }, uTorch: { value: new THREE.Vector2(-9, -9) }, uTorchOn: { value: 0 }, uAlpha: { value: 1 },
  };
  const relief = new THREE.Mesh(geo, new THREE.ShaderMaterial({ uniforms: U, vertexShader: RV, fragmentShader: RF, transparent: true, side: THREE.DoubleSide }));
  root.add(relief);
  const frameEdge = new THREE.LineSegments(new THREE.EdgesGeometry(new THREE.PlaneGeometry(FW, FH)), new THREE.LineBasicMaterial({ color: BONE, transparent: true, opacity: 0.4 }));
  root.add(frameEdge);

  /* the feature pyramid: the same frame at falling resolution, as a CNN sees it */
  const RES = [[150, 100], [75, 50], [38, 25], [19, 13], [10, 7]];
  const pyramid = RES.map(([w, h], i) => {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d')!;
    x.imageSmoothingEnabled = true;
    x.drawImage(irCanvas, 0, 0, w, h);
    const t = new THREE.CanvasTexture(c);
    t.magFilter = THREE.NearestFilter; t.minFilter = THREE.NearestFilter; t.colorSpace = THREE.SRGBColorSpace;
    const s = 1 - i * 0.16;
    const m = new THREE.Mesh(new THREE.PlaneGeometry(FW * s, FH * s), new THREE.MeshBasicMaterial({ map: t, transparent: true, color: new THREE.Color(BONE).lerp(new THREE.Color(HEAT), i * 0.12) }));
    root.add(m);
    return m;
  });
  const { tex: bbTex, aspect: bbA } = textTexture(['EfficientNet-B3 · 299 px → 20 species'], 'italic 500 26px CormorantWP, Georgia, serif', BONE);
  const bbLab = new THREE.Sprite(new THREE.SpriteMaterial({ map: bbTex, transparent: true, depthTest: false }));
  bbLab.scale.set(0.2 * bbA, 0.2, 1);
  root.add(bbLab);

  /* method label */
  const methodLabs = METHODS.map((m) => {
    const { tex, aspect } = textTexture([m], 'italic 600 30px CormorantWP, Georgia, serif', HEAT);
    const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: tex, transparent: true, depthTest: false, opacity: 0 }));
    s.scale.set(0.22 * aspect, 0.22, 1);
    s.position.set(0, FH / 2 + 0.28, 0.4);
    root.add(s);
    return s;
  });

  /* the field report */
  const rep = textTexture(
    ['Leopardus pardalis · ocelot', '', 'hazard ........ low at distance', 'handling ...... do not corner', 'risk factors .. night, dense cover', 'threat map .... terrain-aware', '', 'CrewAI · four role agents'],
    '500 22px InterTightWP, system-ui, sans-serif', '#171210', { bg: BONE, pad: 22 },
  );
  const report = new THREE.Mesh(new THREE.PlaneGeometry(1.5 * rep.aspect, 1.5), new THREE.MeshBasicMaterial({ map: rep.tex, transparent: true }));
  root.add(report);

  const K: [THREE.Vector3, THREE.Vector3][] = [
    [new THREE.Vector3(0, 0, 5.2), new THREE.Vector3(0, 0, 0)],
    [new THREE.Vector3(5.6, 1.4, 1.2), new THREE.Vector3(0, 0, -1.8)],
    [new THREE.Vector3(1.8, -3.2, 3.8), new THREE.Vector3(0, 0, 0.2)],
    [new THREE.Vector3(-1.6, -3.0, 3.6), new THREE.Vector3(0, 0, 0.2)],
    [new THREE.Vector3(0.5, -0.4, 5.4), new THREE.Vector3(0.4, 0, 0.6)],
    [new THREE.Vector3(1.2, -2.8, 4.4), new THREE.Vector3(0, 0, 0.2)],
  ];
  stage.onResize = () => { cam.fov = stage.w / stage.h < 0.8 ? 66 : 38; cam.updateProjectionMatrix(); };
  stage.onResize();

  let method = 0, from = 0, mixT = 1;
  const setMethod = (m: number) => {
    if (m === method) return;
    /* blend from wherever we are */
    const cur = U.uMix.value;
    for (let i = 0; i < n; i++) h0[i] = h0[i] + (h1[i] - h0[i]) * cur;
    from = method; method = m;
    fill(h1, m);
    geo.attributes.aH0.needsUpdate = true; geo.attributes.aH1.needsUpdate = true;
    mixT = env.reduced ? 1 : 0;
    void from;
  };
  const cp = new THREE.Vector3(), ct = new THREE.Vector3();

  return {
    control(k, v) { if (k === 'method') setMethod(METHODS.indexOf(v as (typeof METHODS)[number])); },
    frame({ beat, local, t, dt, free, reduced }) {
      const u = beat + band(0.5, 1, local);
      mixT = Math.min(1, mixT + dt * 0.035);
      U.uMix.value = ease.io(mixT);

      /* 1 · the pyramid fans out behind the frame */
      const fan = free ? 0 : band(0.6, 1.2, u) * (1 - band(1.6, 2.1, u));
      pyramid.forEach((m, i) => {
        m.position.set(0, 0, -(i + 1) * 0.85 * fan);
        (m.material as THREE.MeshBasicMaterial).opacity = fan;
        m.visible = fan > 0.01;
      });
      bbLab.position.set(0, FH / 2 + 0.35, -1.6 * fan);
      (bbLab.material as THREE.SpriteMaterial).opacity = fan;

      /* 2 · attribution rises   3 · the six argue */
      U.uLift.value = (free ? 1 : band(1.7, 2.4, u)) * 0.9;
      U.uShow.value = free ? 1 : band(1.8, 2.4, u);
      if (!free) {
        const m = u < 3 ? 0 : Math.min(5, Math.floor(band(3.0, 3.95, u) * 6));
        setMethod(m);
      }
      methodLabs.forEach((s, i) => { (s.material as THREE.SpriteMaterial).opacity = (u > 1.9 || free) && i === method ? 1 : 0; });

      /* 4 · the report slides in beside the frame */
      const rIn = free ? 0 : band(3.7, 4.4, u);
      report.visible = rIn > 0.01;
      report.position.set(0.5, -0.15 - (1 - rIn) * 0.5, 1.3);
      report.rotation.y = 0;
      report.scale.setScalar(0.7);
      (report.material as THREE.MeshBasicMaterial).opacity = rIn;
      U.uAlpha.value = 1 - rIn * 0.55 - fan * 0.55;

      /* the torch: wherever the pointer lands on the frame */
      const hit = (free || u > 1.8) ? stage.pick([relief], false) : null;
      if (hit && hit.uv) { U.uTorch.value.copy(hit.uv); U.uTorchOn.value += (1 - U.uTorchOn.value) * 0.2; }
      else U.uTorchOn.value *= 0.9;

      const i0 = Math.min(K.length - 1, Math.floor(u)), i1 = Math.min(K.length - 1, i0 + 1), f = u - Math.floor(u);
      cp.lerpVectors(K[i0][0], K[i1][0], f); ct.lerpVectors(K[i0][1], K[i1][1], f);
      if (stage.w / stage.h < 0.8) cp.sub(ct).multiplyScalar(1.6).add(ct);
      cam.position.copy(cp); cam.up.set(0, 1, 0); cam.lookAt(ct);
      root.rotation.y = stage.orbit.yaw + (reduced ? 0 : Math.sin(t * 0.15) * 0.04);
      root.rotation.x = stage.orbit.pitch * 0.6;

      if (free) {
        if (hit && hit.uv) {
          const gx = Math.round(hit.uv.x * GW), gy = Math.round((1 - hit.uv.y) * GH);
          const v = fields[method][gy * (GW + 1) + gx] ?? 0;
          env.readout(`${METHODS[method]} · attribution ${v.toFixed(2)} at the torch`);
        } else env.readout(`${METHODS[method]} · move the torch over the frame`);
      } else env.readout('');
    },
  };
};

export { METHODS, RUST };
