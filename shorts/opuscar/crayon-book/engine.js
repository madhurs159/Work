// Engine adapted from the Lemo-Opuscar "Crayon Picture Book" demo (gl.js, crayon.js, rig.js): converted to a classic script, canvas 1080x1920. See CREDITS.
const clamp=(x,a=0,b=1)=>Math.max(a,Math.min(b,x)),lerp=(a,b,t)=>a+(b-a)*t;
const hash=n=>{n=Math.sin(n*127.1+311.7)*43758.5453;return n-Math.floor(n)};
const vnoise=x=>{const i=Math.floor(x),f=x-i,u=f*f*(3-2*f);return lerp(hash(i),hash(i+1),u)};
const makeComp=(()=>{
// WebGL2 compositor: paper → crayon layers (adhesion by paper-tooth threshold) → watercolour layer (crayon resist) → final composite (paper-tooth emboss, vignette)
// Each crayon layer is a Canvas2D: RGB = crayon colour, A = pressure. The shader decides whether wax sticks by "pressure > depth of the paper-tooth pit".
const W = 1080, H = 1920;

const VS = `#version 300 es
in vec2 p; out vec2 uv;
void main(){ uv = p*.5+.5; gl_Position = vec4(p,0,1); }`;

// Paper tooth: pixel coords → height [0,1] (1 = raised paper)
const TOOTH = `
float h21(vec2 p){ p = fract(p*vec2(123.34,456.21)); p += dot(p,p+45.32); return fract(p.x*p.y); }
float vn(vec2 p){ vec2 i=floor(p), f=fract(p); vec2 u=f*f*(3.-2.*f);
  return mix(mix(h21(i),h21(i+vec2(1,0)),u.x), mix(h21(i+vec2(0,1)),h21(i+vec2(1,1)),u.x), u.y); }
uniform float uToothScale;
float toothRaw(vec2 px){
  px /= uToothScale;
  float n = vn(px/1.35)*.34 + vn(px/2.9+17.)*.33 + vn(px/6.3+41.)*.21;
  n += (vn(vec2(px.x/10., px.y/1.9)+7.)-.5)*.22;   // long thin grooves along the fibre direction (horizontally dragged streaks)
  n += (vn(vec2(px.x/2.1, px.y/13.)+71.)-.5)*.08;
  return n;
}
float tooth(vec2 px){ return smoothstep(.16,.86,toothRaw(px)+.06); }
// Paper moves with the drawing: screen pixels → paper coords (pans with the camera; when zooming it crossfades between two octaves so the grain stays about 1 px on screen)
uniform vec3 uPC;
vec2 paperQ(vec2 uv, vec2 res){ vec2 sp = vec2(uv.x*res.x, (1.-uv.y)*res.y); return (sp - res*.5)/uPC.z + uPC.xy; }
float toothRawAt(vec2 uv, vec2 res, vec2 off){
  float L = log2(uPC.z); float k = floor(L), f = L - k;
  vec2 q = paperQ(uv, res);
  float a = toothRaw(q*exp2(k) + off), b = toothRaw(q*exp2(k+1.) + off + 37.1);
  return mix(a, b, smoothstep(0.,1.,f));
}
float toothAt(vec2 uv, vec2 res, vec2 off){ return smoothstep(.16,.86,toothRawAt(uv,res,off)+.06); }
`;

// Paper base colour: low-frequency mottling
const FS_PAPER = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform vec3 uPaper; uniform vec2 uRes; uniform vec2 uPoff;
${TOOTH}
void main(){
  vec2 px = paperQ(uv, uRes) + uPoff;
  float m = vn(px/180.)*.6 + vn(px/60.+9.)*.4;
  vec3 c = uPaper * (0.975 + 0.035*m);
  o = vec4(c, 0.);
}`;

const FS_IMG = `#version 300 es
precision highp float; in vec2 uv; out vec4 o; uniform sampler2D uL;
void main(){ o = texture(uL, uv); }`;

// Silhouette backing: the background behind a character is left blank (a child draws the figure first, then the background around it)
const FS_KNOCK = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D uL; uniform vec3 uPaper; uniform vec2 uRes; uniform vec2 uPoff;
${TOOTH}
void main(){
  float m = texture(uL, uv).a;
  if (m < .5) discard;
  vec2 px = paperQ(uv, uRes) + uPoff;
  float n = vn(px/180.)*.6 + vn(px/60.+9.)*.4;
  o = vec4(uPaper*(0.975+0.035*n), 0.);
}`;

// Crayon layer
const FS_CRAYON = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D uL; uniform vec2 uRes; uniform vec2 uGoff; uniform float uGain; uniform float uSoft;
${TOOTH}
void main(){
  vec4 L = texture(uL, uv);
  if (L.a < .003) { o = vec4(0); return; }
  float t = toothAt(uv, uRes, uGoff);
  float a = clamp(L.a*uGain, 0., 1.);
  // the harder the pressure, the deeper it gets into the paper-tooth pits
  float thr = 1.0 - a*1.22;
  float cov = smoothstep(thr - uSoft, thr + uSoft, t);
  cov *= smoothstep(0.0, 0.18, a);
  vec3 c = L.rgb * (1.0 - 0.10*a*a);           // heavy pressure: thicker wax, deeper colour
  o = vec4(c, cov);
}`;

// Watercolour layer: reads the previous pass (rgb + wax coverage a), multiplies by the watercolour transmission colour; wax resists it
const FS_WASH = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D uPrev; uniform sampler2D uW; uniform vec2 uRes; uniform vec3 uT; uniform vec2 uGoff;
uniform float uResist; uniform float uEdge; uniform float uGran;
${TOOTH}
void main(){
  vec4 P = texture(uPrev, uv);
  vec4 Wc = texture(uW, uv);
  float d = Wc.a;
  vec2 px = uv*uRes;
  if (d > .002) {
    float blur = textureLod(uW, uv, 4.0).a;
    float blur2 = textureLod(uW, uv, 2.0).a;
    float edge = clamp(d - blur, 0., 1.)*uEdge + clamp(d - blur2, 0., 1.)*uEdge*.6;   // tide marks: pigment pools at the edges
    float t = smoothstep(.16,.86, toothRaw(paperQ(uv,uRes)*0.55 + uGoff + 300.) + .06);
    vec2 wq = paperQ(uv, uRes);
    float lo = vn(wq/160.)*.5 + vn(wq/55.+3.)*.3 + vn(wq/19.+8.)*.2;                 // bloom density variation (cauliflower blooms)
    float gr = smoothstep(.35, .05, t);                                              // granulation settles only in the deepest paper-tooth pits
    float dd = d * (0.82 + 0.3*lo) * (1.0 + uGran*.45*gr) + edge;
    float wax = P.a;
    float res = 1.0 - uResist*smoothstep(.12, .55, wax);                            // crayon resist
    dd = clamp(dd*res, 0., 1.25);
    vec3 tr = mix(vec3(1.), uT, clamp(dd,0.,1.));
    tr *= mix(1.0, 0.82, clamp(dd-1.0,0.,1.)*4.);
    o = vec4(P.rgb*tr, P.a);
  } else o = P;
}`;

// Final composite: paper-tooth emboss (wax sits on the raised tooth, so the emboss goes over everything), warm vignette
const FS_FINAL = `#version 300 es
precision highp float; in vec2 uv; out vec4 o;
uniform sampler2D uS; uniform vec2 uRes; uniform float uVig; uniform float uEmb; uniform vec2 uPoff; uniform float uLift; uniform vec4 uLamp;
${TOOTH}
void main(){
  vec4 S = texture(uS, uv);
  vec2 du = vec2(1./uRes.x, 0.), dv = vec2(0., 1./uRes.y);
  float t0 = toothRawAt(uv, uRes, uPoff), tx = toothRawAt(uv+du, uRes, uPoff), ty = toothRawAt(uv-dv, uRes, uPoff);
  vec2 g = vec2(tx-t0, ty-t0);
  float waxSmooth = 1.0 - .55*S.a;                     // wax fills the paper tooth in a little
  float lit = 1.0 + (g.x*-.9 + g.y*.9)*uEmb*waxSmooth - (1.0-t0)*.035*waxSmooth;
  vec3 c = S.rgb*lit;
  c += S.a*.018*uLift;                                   // faint sheen of the wax
  vec2 q = uv-.5; q.x *= uRes.x/uRes.y;
  float v = 1.0 - uVig*dot(q,q);
  c *= mix(vec3(1.), vec3(1.0,.965,.9), clamp((1.0-v)*1.4,0.,1.)) * v;
  if (uLamp.w > 0.) {   // desk-lamp glow: a pool of warm yellow, edges falling off into warm dark
    vec2 d = (uv - uLamp.xy); d.x *= uRes.x/uRes.y;
    float fall = exp(-dot(d,d)/(uLamp.z*uLamp.z));
    vec3 lamp = mix(vec3(.46,.36,.30), vec3(1.07,1.0,.9), fall);
    c *= mix(vec3(1.), lamp, uLamp.w);
  }
  o = vec4(clamp(c,0.,1.), 1.);
}`;

function sh(gl, type, src) { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) + '\n' + src.slice(0, 200)); return s; }
function prog(gl, fs) {
  const p = gl.createProgram(); gl.attachShader(p, sh(gl, gl.VERTEX_SHADER, VS)); gl.attachShader(p, sh(gl, gl.FRAGMENT_SHADER, fs));
  gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
  const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
  for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name] = gl.getUniformLocation(p, a.name); }
  return { p, u };
}

function makeComp(canvas, w = W, h = H) {
  const gl = canvas.getContext('webgl2', { preserveDrawingBuffer: true, premultipliedAlpha: false, antialias: false, alpha: false });
  if (!gl) throw new Error('no webgl2');
  const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
  gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  const P = { img: prog(gl, FS_IMG), knock: prog(gl, FS_KNOCK), paper: prog(gl, FS_PAPER), crayon: prog(gl, FS_CRAYON), wash: prog(gl, FS_WASH), final: prog(gl, FS_FINAL) };
  function tex(mip) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, mip ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function target() {
    const t = tex(false); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
    const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f); gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
    return { t, f };
  }
  const T = [target(), target()]; let cur = 0;
  const layerTex = tex(false), washTex = tex(true);
  gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
  gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
  let toothScale = 1; let pc = [0, 0, 1];
  function use(pr, extra = {}) {
    gl.useProgram(pr.p);
    if (pr.u.uRes) gl.uniform2f(pr.u.uRes, w, h);
    if (pr.u.uToothScale) gl.uniform1f(pr.u.uToothScale, toothScale);
    if (pr.u.uPC) gl.uniform3f(pr.u.uPC, pc[0], pc[1], pc[2]);
    for (const k in extra) { const l = pr.u[k]; if (!l) continue; const v = extra[k]; if (Array.isArray(v)) (v.length === 2 ? gl.uniform2f : gl.uniform3f).call(gl, l, ...v); else gl.uniform1f(l, v); }
  }
  const draw = () => gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  gl.viewport(0, 0, w, h);
  return {
    gl,
    set toothScale(v) { toothScale = v; },
    paperCam(x, y, z) { pc = [x, y, z]; },   // paper coords: camera centre (in paper pixels) and relative zoom
    begin(paper = [0.957, 0.937, 0.890], poff = [0, 0]) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, T[cur].f); gl.disable(gl.BLEND);
      use(P.paper, { uPaper: paper, uPoff: poff }); draw();
    },
    knock(cv, paper = [0.957, 0.937, 0.890], poff = [0, 0]) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, layerTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
      gl.bindFramebuffer(gl.FRAMEBUFFER, T[cur].f); gl.disable(gl.BLEND);
      use(P.knock, { uPaper: paper, uPoff: poff }); gl.uniform1i(P.knock.u.uL, 0); draw();
    },
    group(C, o = {}) { this.knock(C.k.c); this.crayon(C.f.c, o); this.crayon(C.l.c, o); },
    crayon(cv, { goff = [0, 0], gain = 1, soft = 0.07 } = {}) {
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, layerTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
      gl.bindFramebuffer(gl.FRAMEBUFFER, T[cur].f);
      gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
      use(P.crayon, { uGoff: goff, uGain: gain, uSoft: soft }); gl.uniform1i(P.crayon.u.uL, 0); draw();
      gl.disable(gl.BLEND);
    },
    wash(cv, { color = [0.16, 0.2, 0.46], goff = [0, 0], resist = 0.93, edge = 1.6, gran = 0.6 } = {}) {
      gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, washTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv); gl.generateMipmap(gl.TEXTURE_2D);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T[cur].t);
      const nx = 1 - cur; gl.bindFramebuffer(gl.FRAMEBUFFER, T[nx].f); gl.disable(gl.BLEND);
      use(P.wash, { uT: color, uGoff: goff, uResist: resist, uEdge: edge, uGran: gran });
      gl.uniform1i(P.wash.u.uPrev, 0); gl.uniform1i(P.wash.u.uW, 1); draw();
      cur = nx;
    },
    image(cv) {   // a pre-rendered image (book page): plain alpha over, not passed through the paper tooth again
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, layerTex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
      gl.bindFramebuffer(gl.FRAMEBUFFER, T[cur].f);
      gl.enable(gl.BLEND); gl.blendFuncSeparate(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA, gl.ZERO, gl.ONE);
      use(P.img); gl.uniform1i(P.img.u.uL, 0); draw(); gl.disable(gl.BLEND);
    },
    finish({ vig = 0.32, emb = 0.55, poff = [0, 0], lift = 1, lamp = [0.5, 0.5, 1, 0] } = {}) {
      gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.disable(gl.BLEND);
      gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, T[cur].t);
      use(P.final, { uVig: vig, uEmb: emb, uPoff: poff, uLift: lift }); gl.uniform4f(P.final.u.uLamp, ...lamp); gl.uniform1i(P.final.u.uS, 0); draw();
    },
  };
}

return makeComp;})();
// Crayon stroke engine (Canvas2D): draws into a "pressure layer" (RGB = colour, A = pressure); gl.js decides adhesion from the paper tooth.
// World coords → screen coords via CAM; line widths are in screen pixels (each frame is a freshly "redrawn" picture, so stroke width does not scale much with the camera).
// BOIL.step = floor(t*12): the jitter seed changes every 2 frames (at 24fps) = line boil.

const W = 1080, H = 1920;
const CAM = { x: 960, y: 540, s: 1 };
const BOIL = { step: 0, amp: 1 };
const WMUL = { k: 1 };        // global line-width multiplier (adjustable for big close-ups on the model sheet)

function layer() { const c = document.createElement('canvas'); c.width = W; c.height = H; const g = c.getContext('2d',{willReadFrequently:true}); g.lineCap = 'round'; g.lineJoin = 'round'; return { c, g }; }
function clear(L) { L.g.setTransform(1, 0, 0, 1, 0, 0); L.g.clearRect(0, 0, W, H); }

const sx = x => (x - CAM.x) * CAM.s + W / 2;
const sy = y => (y - CAM.y) * CAM.s + H / 2;
const ws = w => w * Math.pow(CAM.s, 0.45) * WMUL.k;      // screen line width: varies slightly with the camera
const n1 = (seed, x) => vnoise(x + seed * 17.31) * 2 - 1;

// Convert a world-coord polyline to screen and resample by screen distance
function toScreen(pts) { return pts.map(p => [sx(p[0]), sy(p[1])]); }
function resample(sp, step = 3.5, closed = false) {
  const q = closed ? [...sp, sp[0]] : sp; const out = [q[0].slice()]; const L = [0]; let acc = 0, total = 0;
  for (let i = 1; i < q.length; i++) {
    const [ax, ay] = q[i - 1], [bx, by] = q[i]; const d = Math.hypot(bx - ax, by - ay); if (d < 1e-6) continue;
    let pos = step - acc;
    while (pos <= d) { const u = pos / d; out.push([ax + (bx - ax) * u, ay + (by - ay) * u]); total += step; L.push(total); pos += step; }
    acc = d - (pos - step);
  }
  const last = q[q.length - 1]; const lp = out[out.length - 1]; const rem = Math.hypot(last[0] - lp[0], last[1] - lp[1]);
  if (rem > 0.3) { out.push(last.slice()); total += rem; L.push(total); }
  return { p: out, L, total };
}

// ——— crayon line ———
// o: col, w (screen px), p (pressure 0–1), seed, wob (hand wobble), boil, taper (tapering ratio at both ends), draw (drawing progress 0–1), streak (number of stroke streaks)
function line(L, pts, o = {}) {
  const g = L.g;
  const col = o.col || "#2d3263", w = ws(o.w ?? 6), p = o.p ?? 0.8, seed = o.seed ?? 1, wob = o.wob ?? 1, boil = o.boil ?? 1;
  const draw = o.draw ?? 1; if (draw <= 0) return;
  const sp = toScreen(pts); const R = resample(sp, 3, o.closed);
  let n = R.p.length; if (n < 2) return;
  const lim = R.total * draw;
  const st = BOIL.step, ba = BOIL.amp * boil;
  const jx = (hash(seed * 3.1 + st * 7.7) - .5) * 1.6 * ba, jy = (hash(seed * 5.3 + st * 3.9) - .5) * 1.6 * ba;
  const P = [], Wd = [];
  const taper = o.taper ?? 0.25, tl = Math.min(R.total * taper, 28);
  for (let i = 0; i < n; i++) {
    const s = R.L[i]; if (s > lim) break;
    const a = R.p[Math.max(0, i - 1)], b = R.p[Math.min(n - 1, i + 1)];
    let tx = b[0] - a[0], ty = b[1] - a[1]; const tn = Math.hypot(tx, ty) || 1; tx /= tn; ty /= tn;
    const off = n1(seed, s / 85) * 1.7 * wob + n1(seed + st * 1.37 + 11, s / 38) * 0.9 * ba;
    P.push([R.p[i][0] - ty * off + jx, R.p[i][1] + tx * off + jy, -ty, tx]);
    const e0 = o.closed ? 1 : clamp(s / (tl + 1e-3)), e1 = o.closed ? 1 : clamp((Math.min(lim, R.total) - s) / (tl + 1e-3));
    Wd.push(w * (0.82 + 0.3 * n1(seed + 3, s / 55)) * (0.45 + 0.55 * Math.min(e0, e1)));
  }
  if (P.length < 2) return;
  g.fillStyle = col; g.strokeStyle = col;
  // main band
  ribbon(g, P, Wd, 1); g.globalAlpha = p * 0.5; g.fill();
  // core (lighter at both ends where the crayon lifts)
  ribbon(g, P, Wd, 0.5); g.globalAlpha = p * 0.34; g.fill();
  // stroke streaks
  const ns = o.streak ?? 2;
  for (let k = 0; k < ns; k++) {
    const side = (hash(seed + k * 9.1) - .5) * 0.9;
    g.beginPath();
    for (let i = 0; i < P.length; i++) { const q = P[i]; const d = side * Wd[i]; const x = q[0] + q[2] * d, y = q[1] + q[3] * d; i ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.lineWidth = Math.max(1, w * 0.22); g.globalAlpha = p * 0.3; g.stroke();
  }
  g.globalAlpha = 1;
}
function ribbon(g, P, Wd, k) {
  g.beginPath();
  for (let i = 0; i < P.length; i++) { const q = P[i], d = Wd[i] * 0.5 * k; i ? g.lineTo(q[0] + q[2] * d, q[1] + q[3] * d) : g.moveTo(q[0] + q[2] * d, q[1] + q[3] * d); }
  for (let i = P.length - 1; i >= 0; i--) { const q = P[i], d = Wd[i] * 0.5 * k; g.lineTo(q[0] - q[2] * d, q[1] - q[3] * d); }
  g.closePath();
}

// ——— fill: back-and-forth zigzag hatching that goes over the outline ———
// o: col, p, ang (hatching angle), gap (row spacing px), w (stroke width px), over (overshoot past the outline px), seed, draw (fill progress), boil, cross (second cross-hatching pass)
function fill(L, poly, o = {}) {
  const g = L.g;
  const col = o.col || '#f6c945', p = o.p ?? 0.62, seed = o.seed ?? 1, boil = o.boil ?? 1;
  const st = BOIL.step, ba = BOIL.amp * boil;
  const ang = (o.ang ?? 0.62) + (hash(seed + st * 1.9) - .5) * 0.035 * ba;
  const gap = ws(o.gap ?? 10.5), w = ws(o.w ?? 11), over = ws(o.over ?? 7);
  const draw = o.draw ?? 1; if (draw <= 0) return;
  const sp = toScreen(poly);
  const ca = Math.cos(ang), sa = Math.sin(ang);
  const rp = sp.map(([x, y]) => [x * ca + y * sa, -x * sa + y * ca]);   // rotate so the hatching is horizontal
  let y0 = Infinity, y1 = -Infinity; for (const q of rp) { y0 = Math.min(y0, q[1]); y1 = Math.max(y1, q[1]); }
  const rows = []; let y = y0 + gap * (0.35 + 0.3 * hash(seed + st * 0.7 * ba));
  let r = 0;
  while (y < y1) {
    const xs = [];
    for (let i = 0; i < rp.length; i++) {
      const a = rp[i], b = rp[(i + 1) % rp.length];
      if ((a[1] <= y && b[1] > y) || (b[1] <= y && a[1] > y)) xs.push(a[0] + (y - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
    }
    xs.sort((a, b) => a - b);
    const spans = []; for (let i = 0; i + 1 < xs.length; i += 2) spans.push([xs[i], xs[i + 1]]);
    rows.push({ y, spans, r }); r++;
    y += gap * (0.8 + 0.4 * hash(seed * 1.3 + r * 3.7));
  }
  // join into zigzag strokes: adjacent rows whose spans overlap get connected
  const strokes = []; let curS = null, prev = null, dir = 1;
  for (const row of rows) {
    if (row.spans.length !== 1) { curS = null; prev = null; for (const s of row.spans) strokes.push([[s, row.y, row.r]]); continue; }
    const s = row.spans[0];
    if (curS && prev && s[0] < prev[1] && s[1] > prev[0]) curS.push([s, row.y, row.r]);
    else { curS = [[s, row.y, row.r]]; strokes.push(curS); }
    prev = s;
  }
  // total length, used for fill progress
  const paths = strokes.map((S, si) => {
    const pts = [];
    S.forEach(([s, yy, rr], k) => {
      const len = s[1] - s[0];
      const oA = over * (hash(seed + rr * 5.1 + 0.3) * 1.1 - 0.15) - Math.min(0, len * 0) , oB = over * (hash(seed + rr * 2.3 + 0.7) * 1.1 - 0.15);
      const yj = (hash(seed + rr * 1.7 + st * 0.31 * ba) - .5) * gap * 0.35 * Math.max(ba, .3);
      const a = [s[0] - oA, yy + yj], b = [s[1] + oB, yy + yj + (hash(seed + rr) - .5) * gap * 0.6];
      if ((k + si) % 2 === 0) pts.push(a, b); else pts.push(b, a);
    });
    return pts.map(([x, y]) => [x * ca - y * sa, x * sa + y * ca]);
  });
  let total = 0; const lens = paths.map(pp => { let l = 0; for (let i = 1; i < pp.length; i++) l += Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]); total += l; return l; });
  let budget = total * draw;
  g.strokeStyle = col; g.lineWidth = w;
  for (let k = 0; k < paths.length && budget > 0; k++) {
    const pp = paths[k];
    const cut = cutPath(pp, budget); budget -= lens[k];
    // each pass of hatching has a different pressure: the individual back-and-forth strokes stay visible
    for (let i = 1; i < cut.length; i++) {
      const pr = p * (0.72 + 0.42 * hash(seed * 0.37 + k * 13.1 + i * 0.71));
      g.beginPath(); g.moveTo(cut[i - 1][0], cut[i - 1][1]); g.lineTo(cut[i][0], cut[i][1]);
      g.globalAlpha = pr * 0.62; g.lineWidth = w; g.stroke();
      g.globalAlpha = pr * 0.3; g.lineWidth = w * 0.42; g.stroke();
    }
  }
  g.globalAlpha = 1;
  if (o.cross) fill(L, poly, { ...o, cross: false, ang: (o.ang ?? 0.62) + (o.crossAng ?? 1.25), seed: seed + 101, p: p * (o.crossP ?? 0.7) });
}
function cutPath(pp, len) {
  const out = [pp[0]]; let acc = 0;
  for (let i = 1; i < pp.length; i++) {
    const d = Math.hypot(pp[i][0] - pp[i - 1][0], pp[i][1] - pp[i - 1][1]);
    if (acc + d >= len) { const u = (len - acc) / d; out.push([lerp(pp[i - 1][0], pp[i][0], u), lerp(pp[i - 1][1], pp[i][1], u)]); return out; }
    acc += d; out.push(pp[i]);
  }
  return out;
}

// ——— solid soft fill: small areas (blush, pupils) filled with circular scribbles ———
function dab(L, x, y, r, o = {}) {
  fill(L, handCircle(x, y, r, o.seed ?? 1, 0, 20).map(([px, py]) => [px, y + (py - y) * (o.sq ?? 1)]), { col: o.col || '#ee8ea4', p: o.p ?? 0.7, gap: o.gap ?? 4.5, w: o.w ?? 6, over: o.over ?? 1.5, seed: o.seed ?? 1, ang: o.ang ?? 0.5, boil: o.boil ?? 1 });
}

// ——— shape tools (world coords) ———
function ellipse(cx, cy, rx, ry, n = 48, a0 = 0, a1 = Math.PI * 2, rot = 0) {
  const out = []; const c = Math.cos(rot), s = Math.sin(rot);
  for (let i = 0; i <= n; i++) { const a = a0 + (a1 - a0) * i / n; const x = Math.cos(a) * rx, y = Math.sin(a) * ry; out.push([cx + x * c - y * s, cy + x * s + y * c]); }
  return out;
}
// hand-drawn circle: start and end slightly offset, a bit lopsided
function handCircle(cx, cy, r, seed = 1, over = 0.12, n = 56) {
  const out = []; const a0 = hash(seed) * 6.28;
  for (let i = 0; i <= n; i++) { const u = i / n; const a = a0 + u * Math.PI * 2 * (1 + over); const rr = r * (1 + 0.035 * Math.sin(a * 2 + seed) + (u > 1 - over ? 0.04 * (u - (1 - over)) / over : 0)); out.push([cx + Math.cos(a) * rr, cy + Math.sin(a) * rr]); }
  return out;
}
// chain of cubic Béziers: [p0, c1, c2, p1, c3, c4, p2, ...]
function bez(c, n = 16) {
  const out = [c[0]];
  for (let i = 0; i + 3 < c.length; i += 3) {
    const [a, b, d, e] = [c[i], c[i + 1], c[i + 2], c[i + 3]];
    for (let k = 1; k <= n; k++) { const t = k / n, u = 1 - t; out.push([u * u * u * a[0] + 3 * u * u * t * b[0] + 3 * u * t * t * d[0] + t * t * t * e[0], u * u * u * a[1] + 3 * u * u * t * b[1] + 3 * u * t * t * d[1] + t * t * t * e[1]]); }
  }
  return out;
}
// smooth closed curve (Catmull-Rom)
function smooth(pts, n = 8, closed = true) {
  const out = []; const m = pts.length; const N = closed ? m : m - 1;
  for (let i = 0; i < N; i++) {
    const p0 = pts[(i - 1 + m) % m], p1 = pts[i], p2 = pts[(i + 1) % m], p3 = pts[(i + 2) % m];
    const P0 = closed || i > 0 ? p0 : p1, P3 = closed || i + 2 < m ? p3 : p2;
    for (let k = 0; k < n; k++) { const t = k / n, t2 = t * t, t3 = t2 * t;
      out.push([0.5 * ((2 * p1[0]) + (-P0[0] + p2[0]) * t + (2 * P0[0] - 5 * p1[0] + 4 * p2[0] - P3[0]) * t2 + (-P0[0] + 3 * p1[0] - 3 * p2[0] + P3[0]) * t3),
                0.5 * ((2 * p1[1]) + (-P0[1] + p2[1]) * t + (2 * P0[1] - 5 * p1[1] + 4 * p2[1] - P3[1]) * t2 + (-P0[1] + 3 * p1[1] - 3 * p2[1] + P3[1]) * t3)]); }
  }
  if (!closed) out.push(pts[m - 1]); else out.push(out[0]);
  return out;
}
// transform: translate, rotate, scale a set of points
function xf(pts, { x = 0, y = 0, r = 0, s = 1, sx: kx = 1, sy: ky = 1, ox = 0, oy = 0 } = {}) {
  const c = Math.cos(r), sn = Math.sin(r);
  return pts.map(([px, py]) => { const X = (px - ox) * s * kx, Y = (py - oy) * s * ky; return [x + ox + X * c - Y * sn, y + oy + X * sn + Y * c]; });
}

// ——— crayon lettering (subtitles, title): glyphs are filled, then jitter slightly every 2 frames ———
function text(L, str, x, y, o = {}) {
  const g = L.g, st = BOIL.step, seed = o.seed ?? 7, ba = BOIL.amp * (o.boil ?? 1);
  const size = o.size ?? 56; const font = o.font ?? 'Patrick Hand';
  g.save();
  g.font = `${o.weight ?? 400} ${size}px "${font}"`; g.textBaseline = 'alphabetic';
  const chars = [...str]; const widths = chars.map(c => g.measureText(c).width); const tw = widths.reduce((a, b) => a + b, 0) + (o.track ?? 0) * (chars.length - 1);
  let cx = o.align === 'left' ? x : o.align === 'right' ? x - tw : x - tw / 2;
  const reveal = o.reveal ?? 1;   // 0–1, written out letter by letter
  const nShow = reveal * chars.length;
  g.fillStyle = o.col || '#2b2f5e';
  chars.forEach((ch, i) => {
    const vis = clamp(nShow - i); if (vis <= 0) { cx += widths[i] + (o.track ?? 0); return; }
    const jx = (hash(seed + i * 3.3 + st * 1.1) - .5) * 1.4 * ba, jy = (hash(seed + i * 7.1 + st * 2.3) - .5) * 1.4 * ba;
    const rot = (hash(seed + i * 1.9) - .5) * 0.07 + (hash(seed + i + st * .7) - .5) * 0.02 * ba;
    const by = (hash(seed + i * 5.5) - .5) * size * 0.05;
    g.save(); g.translate(cx + widths[i] / 2 + jx, y + by + jy); g.rotate(rot);
    g.globalAlpha = (o.p ?? 1) * vis;
    g.fillText(ch, -widths[i] / 2, 0);
    if (o.stroke) { g.lineWidth = o.stroke; g.strokeStyle = o.col || '#2b2f5e'; g.globalAlpha = (o.p ?? 1) * vis * 0.6; g.strokeText(ch, -widths[i] / 2, 0); }
    g.restore();
    cx += widths[i] + (o.track ?? 0);
  });
  g.restore();
  return tw;
}

// Shared parts for drawing characters: part occlusion (erase lines/colour behind + cut-paper backing), limb tubes, canvas groups


// A "character group": three layers, backing (knock), fill (f), outline (l)
function group() { return { k: layer(), f: layer(), l: layer() }; }
function clearGroup(C) { clear(C.k); clear(C.f); clear(C.l); }

function pathScreen(g, poly) { g.beginPath(); poly.forEach(([x, y], i) => i ? g.lineTo(sx(x), sy(y)) : g.moveTo(sx(x), sy(y))); g.closePath(); }
function erase(L, poly) { const g = L.g; g.save(); g.globalCompositeOperation = 'destination-out'; g.globalAlpha = 1; g.fillStyle = '#000'; pathScreen(g, poly); g.fill(); g.restore(); }
function knock(C, poly) { const g = C.k.g; g.save(); g.globalAlpha = 1; g.fillStyle = '#000'; pathScreen(g, poly); g.fill(); g.restore(); }

// Draw one part: it hides the parts drawn before it (erases their lines and colour), then fills and outlines itself
// fo: fill params (null = no fill), lo: outline params (null = no outline)
function part(C, poly, fo, lo, { occ = true, kn = true } = {}) {
  if (occ) { erase(C.l, poly); if (fo) erase(C.f, poly); }
  if (kn) knock(C, poly);
  if (fo) fill(C.f, poly, fo);
  if (lo) line(C.l, [...poly, poly[1] || poly[0]], lo);
}

// Limb tube: offset both sides of a polyline + round caps, returns a closed polygon
function tube(pts, w0, w1 = w0) {
  const n = pts.length; const L = [], R = [];
  const dirs = [];
  for (let i = 0; i < n; i++) {
    const a = pts[Math.max(0, i - 1)], b = pts[Math.min(n - 1, i + 1)];
    let dx = b[0] - a[0], dy = b[1] - a[1]; const d = Math.hypot(dx, dy) || 1; dx /= d; dy /= d; dirs.push([dx, dy]);
    const w = (w0 + (w1 - w0) * i / (n - 1)) / 2;
    L.push([pts[i][0] - dy * w, pts[i][1] + dx * w]); R.push([pts[i][0] + dy * w, pts[i][1] - dx * w]);
  }
  const cap = (c, d, w, from) => { const out = []; const a0 = Math.atan2(d[1], d[0]); for (let k = 1; k < 8; k++) { const a = a0 + from + Math.PI * k / 8; out.push([c[0] + Math.cos(a) * w, c[1] + Math.sin(a) * w]); } return out; };
  return [...L, ...cap(pts[n - 1], dirs[n - 1], w1 / 2, Math.PI / 2), ...R.reverse(), ...cap(pts[0], dirs[0], w0 / 2, -Math.PI / 2)];
}
// Smooth a polyline (two rounds of subdivision)
function curve(pts, n = 6) {
  if (pts.length < 3) return pts;
  const out = [pts[0]];
  for (let i = 1; i < pts.length - 1; i++) {
    const a = mid(pts[i - 1], pts[i]), b = mid(pts[i], pts[i + 1]);
    for (let k = 0; k <= n; k++) { const t = k / n, u = 1 - t; out.push([u * u * a[0] + 2 * u * t * pts[i][0] + t * t * b[0], u * u * a[1] + 2 * u * t * pts[i][1] + t * t * b[1]]); }
  }
  out.push(pts[pts.length - 1]); return out;
}
const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
