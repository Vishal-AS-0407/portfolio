/* The ground layer of the night: a live spectrogram, rendered as a single
   full-screen fragment shader in raw WebGL.

   It is not decoration. Its uniforms are the page's argument:
     uEnergy  the cry arriving  (0 = the house is quiet)
     uGate    the 142.91–6620.12 Hz Butterworth band closing over the spectrum
     uDrain   the sound leaving, from the top of the spectrum down
     uBreath  a 4.2 s cycle that runs whether or not you scroll, so the page is
              never completely still

   Rendered at 0.5× and upscaled, because a spectrogram wants to be soft and a
   five-octave fbm does not want to be run per device pixel. */
import { useEffect, useRef } from 'react';
import { prefersReduced, isCoarse } from '@/projects/_shared/reduced';

export type SpectroState = {
  energy: number;
  gate: number;
  drain: number;
  lo: number;
  hi: number;
};

const VERT = `
attribute vec2 p;
void main() { gl_Position = vec4(p, 0.0, 1.0); }
`;

const FRAG = `
precision mediump float;
uniform vec2  uRes;
uniform float uTime;
uniform float uEnergy;
uniform float uGate;
uniform float uDrain;
uniform float uLo;
uniform float uHi;
uniform float uStill;

float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123);
}
float vnoise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  float a = hash(i);
  float b = hash(i + vec2(1.0, 0.0));
  float c = hash(i + vec2(0.0, 1.0));
  float d = hash(i + vec2(1.0, 1.0));
  return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
}
float fbm4(vec2 p) {
  float s = 0.0, a = 0.5;
  for (int i = 0; i < 4; i++) { s += a * vnoise(p); p *= 2.03; a *= 0.5; }
  return s;
}

/* cool -> warm. Deliberately not a magma ramp: navy, steel, teal, amber, cream. */
vec3 ramp(float t) {
  vec3 c0 = vec3(0.055, 0.082, 0.141);
  vec3 c1 = vec3(0.122, 0.373, 0.545);
  vec3 c2 = vec3(0.271, 0.816, 0.784);
  vec3 c3 = vec3(1.000, 0.757, 0.369);
  vec3 c4 = vec3(1.000, 0.953, 0.839);
  if (t < 0.25) return mix(c0, c1, t / 0.25);
  if (t < 0.50) return mix(c1, c2, (t - 0.25) / 0.25);
  if (t < 0.78) return mix(c2, c3, (t - 0.50) / 0.28);
  return mix(c3, c4, (t - 0.78) / 0.22);
}

void main() {
  vec2 uv = gl_FragCoord.xy / uRes;
  float f = uv.y;           // frequency, low at the bottom
  float x = uv.x;           // time
  float t = uTime * 0.085 * uStill;

  /* an infant cry is a fundamental around 350-600 Hz with strong harmonics --
     four gaussian formants stacked up the axis */
  float env =
      1.00 * exp(-pow((f - 0.135) * 4.6, 2.0))
    + 0.62 * exp(-pow((f - 0.300) * 5.4, 2.0))
    + 0.34 * exp(-pow((f - 0.470) * 6.6, 2.0))
    + 0.17 * exp(-pow((f - 0.640) * 8.4, 2.0))
    + 0.07 * exp(-pow((f - 0.820) * 11.0, 2.0));

  float n1 = fbm4(vec2(x * 3.1 + t, f * 6.5 - t * 0.55));
  float n2 = fbm4(vec2(x * 9.4 - t * 1.6, f * 17.0 + t * 0.28));

  float v = env * (0.42 + 0.80 * n1) * (0.55 + 0.85 * n2);

  /* the 4.2 s breath, independent of scroll */
  v *= 0.80 + 0.20 * sin(uTime * 1.4958);

  /* the cry floods in from the bottom of the spectrum upward */
  v *= smoothstep(f - 0.30, f + 0.06, uEnergy * 1.32);

  /* the Butterworth band closes over everything outside 142.91-6620.12 Hz */
  float pass = smoothstep(uLo - 0.030, uLo + 0.030, f)
             * (1.0 - smoothstep(uHi - 0.030, uHi + 0.030, f));
  v *= mix(1.0, pass * 1.22, uGate);

  /* and at 06:12 it drains, from the top down */
  v *= 1.0 - smoothstep((1.0 - uDrain) - 0.10, (1.0 - uDrain) + 0.10, f);

  /* spectrogram columns */
  v *= 0.94 + 0.06 * sin(x * uRes.x * 0.55);

  v = clamp(v, 0.0, 1.0);
  vec3 col = mix(vec3(0.055, 0.082, 0.141), ramp(v), clamp(v * 1.25, 0.0, 1.0));

  /* one amber baseline, the last thing left when the sound has gone */
  float base = exp(-f * 190.0) * (0.35 + 0.65 * uDrain);
  col += vec3(1.0, 0.757, 0.369) * base * 0.55;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    console.warn('[night] shader:', gl.getShaderInfoLog(s));
    gl.deleteShader(s);
    return null;
  }
  return s;
}

export default function Spectro({ stateRef }: { stateRef: React.MutableRefObject<SpectroState> }) {
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const reduced = prefersReduced();
    const scale = isCoarse() ? 0.36 : 0.5;

    const gl =
      (cv.getContext('webgl', { antialias: false, alpha: false, depth: false }) as
        | WebGLRenderingContext
        | null) ?? null;

    /* No WebGL: the CSS gradient underneath the canvas is the fallback, and it
       is a designed one — the page still reads as a dark room with a warm
       baseline. Nothing is missing except motion. */
    if (!gl) { cv.style.display = 'none'; return; }

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    if (!vs || !fs) { cv.style.display = 'none'; return; }
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) { cv.style.display = 'none'; return; }
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 3, -1, -1, 3]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, 'p');
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);

    const U = {
      res: gl.getUniformLocation(prog, 'uRes'),
      time: gl.getUniformLocation(prog, 'uTime'),
      energy: gl.getUniformLocation(prog, 'uEnergy'),
      gate: gl.getUniformLocation(prog, 'uGate'),
      drain: gl.getUniformLocation(prog, 'uDrain'),
      lo: gl.getUniformLocation(prog, 'uLo'),
      hi: gl.getUniformLocation(prog, 'uHi'),
      still: gl.getUniformLocation(prog, 'uStill'),
    };

    let W = 0;
    let H = 0;
    const size = () => {
      W = Math.max(1, Math.round(window.innerWidth * scale));
      H = Math.max(1, Math.round(window.innerHeight * scale));
      cv.width = W;
      cv.height = H;
      gl.viewport(0, 0, W, H);
    };
    size();
    window.addEventListener('resize', size);

    let id = 0;
    let t0 = performance.now();
    /* smoothed uniforms — the shader must never jump when scroll does */
    let e = 0, g = 0, d = 0, lo = 0, hi = 1;

    const draw = (now: number) => {
      id = requestAnimationFrame(draw);
      if (document.hidden) return;
      const s = stateRef.current;
      const k = reduced ? 1 : 0.055;
      e += (s.energy - e) * k;
      g += (s.gate - g) * k;
      d += (s.drain - d) * k;
      lo += (s.lo - lo) * k;
      hi += (s.hi - hi) * k;

      gl.uniform2f(U.res, W, H);
      gl.uniform1f(U.time, reduced ? 12.0 : (now - t0) / 1000);
      gl.uniform1f(U.energy, e);
      gl.uniform1f(U.gate, g);
      gl.uniform1f(U.drain, d);
      gl.uniform1f(U.lo, lo);
      gl.uniform1f(U.hi, hi);
      gl.uniform1f(U.still, reduced ? 0 : 1);
      gl.drawArrays(gl.TRIANGLES, 0, 3);

      /* reduced motion: one frame is the whole experience */
      if (reduced) cancelAnimationFrame(id);
    };
    id = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(id);
      window.removeEventListener('resize', size);
      gl.deleteBuffer(buf);
      gl.deleteProgram(prog);
      gl.deleteShader(vs);
      gl.deleteShader(fs);
      gl.getExtension('WEBGL_lose_context')?.loseContext();
    };
  }, [stateRef]);

  return <canvas ref={ref} className="nw-gl" aria-hidden="true" />;
}
