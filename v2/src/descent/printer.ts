/* The stipple printer. Reads the scene buffer (paint.ts) and prints it as
   points of the page's own ink: each pixel finds the nearest seeded, jittered
   point among its 3×3 neighbouring cells, samples the buffer there, and draws
   a dot whose size follows √density. Material decides the colour, light tints
   it toward magma and blooms through a mip-blurred read of the light channel.
   A second pass draws the free motes as GL points. */

const VS = `#version 300 es
in vec2 a; void main(){ gl_Position = vec4(a, 0., 1.); }`;

const FS = `#version 300 es
precision highp float;
uniform sampler2D uS;
uniform vec2 uRes;        // canvas, device px
uniform float uCell;      // stipple cell, device px
uniform float uTime, uInit, uFog, uFlash, uInv, uTop;
uniform vec3 uInk, uEmber, uCore, uEcho, uEchoHot;
out vec4 o;

vec2 h22(vec2 p){ p = vec2(dot(p, vec2(127.1, 311.7)), dot(p, vec2(269.5, 183.3))); return fract(sin(p) * 43758.5453); }
float h12(vec2 p){ return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
float vn(vec2 p){ vec2 i = floor(p), f = fract(p); f = f * f * (3. - 2. * f);
  return mix(mix(h12(i), h12(i + vec2(1, 0)), f.x), mix(h12(i + vec2(0, 1)), h12(i + vec2(1, 1)), f.x), f.y); }

void main(){
  vec2 px = vec2(gl_FragCoord.x, uRes.y - gl_FragCoord.y);
  vec2 g = px / uCell, c = floor(g);
  float aa = 1.1 / uCell;
  vec4 best = vec4(0.);
  for (int j = -1; j <= 1; j++) for (int i = -1; i <= 1; i++) {
    vec2 n = c + vec2(i, j);
    vec2 h = h22(n);
    /* a seeded jitter, and a breath of shimmer */
    vec2 q = n + .5 + (h - .5) * .72 + .06 * vec2(sin(uTime * 1.3 + h.x * 30.), cos(uTime * 1.1 + h.y * 30.));
    /* at load the samples come from scrambled places and settle home */
    vec2 sq = q + (h22(n + 17.) - .5) * 60. * (1. - uInit) * (1. - uInit);
    vec4 s = texture(uS, sq * uCell / uRes);
    float d = s.r;
    float m = s.b / max(s.r, .004);
    float mat = floor(m * 4. + .5);   // 0 world · 1 people · 2 echo · 3 flame · 4 water
    if (mat < .5) {
      float fn = vn(q * .045 + vec2(uTime * .12, 0.)) * .6 + vn(q * .11 - vec2(uTime * .2, 0.)) * .4;
      d *= 1. - uFog * .6 * fn;
      float band = smoothstep(uTop, uTop + 30., q.y * uCell) ;
      d = max(d, uFog * .2 * smoothstep(.55, .85, fn) * band);
    }
    /* initialisation: random points before structure */
    d = mix(step(.9, h12(n + floor(uTime * 9.))) * .55 * step(uTop, q.y * uCell), d, uInit);
    if (d < .02) continue;
    float r = .5 * sqrt(d) * (mat > 2.5 && mat < 3.5 ? 1.15 : 1.04) * mix(1., 1.1, uInv);
    float cov = smoothstep(r + aa, r - aa, length(g - q));
    if (cov <= best.a) continue;
    float lit = clamp(s.g * 1.25, 0., 1.);
    vec3 col; float al;
    if (mat < .5)       { col = uInk; al = .34 + .62 * d; }
    else if (mat < 1.5) { col = uInk; al = .96; }
    else if (mat < 2.5) { col = mix(uEcho, uEchoHot, lit); al = .9; }
    else if (mat < 3.5) { col = mix(uEmber, uCore, clamp(s.g * 1.4, 0., 1.)); al = 1.; lit = 0.; }
    else                { col = uInk; al = .42; }
    col = mix(col, mix(uEmber, uCore, lit * lit), lit * .82);
    al = min(1., al * mix(1., 1.45, uInv) + lit * .3 + uFlash * .35);
    col = mix(col, uCore, uFlash * .4 * step(mat, 1.5));
    best = vec4(col, cov * al);
  }
  /* bloom from the light channel */
  float hl = textureLod(uS, px / uRes, 3.2).g * .8 + textureLod(uS, px / uRes, 4.6).g * .6;
  vec3 hc = mix(uEmber, uCore, .25);
  float ha = clamp(hl * mix(.42, .28, uInv), 0., .7) + uFlash * .06;
  vec3 rgb = best.rgb * best.a + hc * ha * (1. - best.a);
  float a = best.a + ha * (1. - best.a);
  o = vec4(rgb, a);
}`;

const PVS = `#version 300 es
in vec2 aP; in float aS; in vec4 aC;
uniform vec2 uRes; out vec4 vC;
void main(){ gl_Position = vec4(aP / uRes * vec2(2., -2.) + vec2(-1., 1.), 0., 1.); gl_PointSize = aS; vC = aC; }`;
const PFS = `#version 300 es
precision mediump float; in vec4 vC; out vec4 o;
void main(){ vec2 q = gl_PointCoord - .5; float r = length(q); if (r > .5) discard; float s = smoothstep(.5, .2, r); o = vec4(vC.rgb * vC.a * s, vC.a * s); }`;

function sh(gl: WebGL2RenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src); gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) || 'shader');
  return s;
}
function prog(gl: WebGL2RenderingContext, vs: string, fs: string) {
  const p = gl.createProgram()!;
  gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, vs)); gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, fs));
  gl.linkProgram(p);
  if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p) || 'link');
  return p;
}

export type PrintIn = {
  cell: number; time: number; init: number; fog: number; flash: number; inv: number; top: number;
  ink: [number, number, number];
  motes: Float32Array; moteCount: number;
};

export function createPrinter(canvas: HTMLCanvasElement) {
  const gl = canvas.getContext('webgl2', { premultipliedAlpha: true, alpha: true, antialias: false });
  if (!gl) return null;
  const P = prog(gl, VS, FS), Q = prog(gl, PVS, PFS);
  const quad = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, quad);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  const vaoA = gl.createVertexArray()!;
  gl.bindVertexArray(vaoA);
  const la = gl.getAttribLocation(P, 'a');
  gl.enableVertexAttribArray(la); gl.vertexAttribPointer(la, 2, gl.FLOAT, false, 0, 0);

  const mb = gl.createBuffer();
  const vaoB = gl.createVertexArray()!;
  gl.bindVertexArray(vaoB);
  gl.bindBuffer(gl.ARRAY_BUFFER, mb);
  const stride = 7 * 4;
  const lp = gl.getAttribLocation(Q, 'aP'), ls = gl.getAttribLocation(Q, 'aS'), lc = gl.getAttribLocation(Q, 'aC');
  gl.enableVertexAttribArray(lp); gl.vertexAttribPointer(lp, 2, gl.FLOAT, false, stride, 0);
  gl.enableVertexAttribArray(ls); gl.vertexAttribPointer(ls, 1, gl.FLOAT, false, stride, 8);
  gl.enableVertexAttribArray(lc); gl.vertexAttribPointer(lc, 4, gl.FLOAT, false, stride, 12);
  gl.bindVertexArray(null);

  const tex = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  const U = (n: string) => gl.getUniformLocation(P, n);
  const u = {
    S: U('uS'), Res: U('uRes'), Cell: U('uCell'), Time: U('uTime'), Init: U('uInit'), Fog: U('uFog'), Flash: U('uFlash'),
    Inv: U('uInv'), Top: U('uTop'), Ink: U('uInk'), Ember: U('uEmber'), Core: U('uCore'), Echo: U('uEcho'), EchoHot: U('uEchoHot'),
  };
  const uq = gl.getUniformLocation(Q, 'uRes');
  const hex = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16) / 255) as [number, number, number];

  return {
    print(scene: HTMLCanvasElement, f: PrintIn) {
      const W = canvas.width, H = canvas.height;
      gl.viewport(0, 0, W, H);
      gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
      gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, scene);
      gl.generateMipmap(gl.TEXTURE_2D);

      gl.useProgram(P);
      gl.uniform1i(u.S, 0);
      gl.uniform2f(u.Res, W, H);
      gl.uniform1f(u.Cell, f.cell);
      gl.uniform1f(u.Time, f.time); gl.uniform1f(u.Init, f.init); gl.uniform1f(u.Fog, f.fog);
      gl.uniform1f(u.Flash, f.flash); gl.uniform1f(u.Inv, f.inv); gl.uniform1f(u.Top, f.top);
      gl.uniform3fv(u.Ink, f.ink);
      gl.uniform3fv(u.Ember, hex('#FE9F6D')); gl.uniform3fv(u.Core, hex('#FCFDBF'));
      gl.uniform3fv(u.Echo, hex('#8C2981')); gl.uniform3fv(u.EchoHot, hex('#DE4968'));
      gl.bindVertexArray(vaoA);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);

      if (f.moteCount) {
        gl.useProgram(Q);
        gl.uniform2f(uq, W, H);
        gl.bindVertexArray(vaoB);
        gl.bindBuffer(gl.ARRAY_BUFFER, mb);
        gl.bufferData(gl.ARRAY_BUFFER, f.motes.subarray(0, f.moteCount * 7), gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, f.moteCount);
      }
      gl.bindVertexArray(null);
    },
    lost: () => gl.isContextLost(),
  };
}
