'use strict';
// Paper-cut lightbox engine in Canvas 2D: flat cut sheets (grain, lit top rim, dark bottom edge), stacked back to front,
// each casting a soft shadow on the ones behind and letting a warm backlight through (pulp mottle), plus emissive holes.
const W = 1080, H = 1920, TAU = Math.PI * 2;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), prog = (t, a, d) => clamp((t - a) / d), lerp = (a, b, k) => a + (b - a) * k;
const eo = x => 1 - Math.pow(1 - x, 3), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2, ss = x => x * x * (3 - 2 * x);
function mulberry(a) { return () => { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function mk(w, h) { const c = document.createElement('canvas'); c.width = Math.max(1, Math.ceil(w)); c.height = Math.max(1, Math.ceil(h)); return c; }
const rgb = h => [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16));
const css = (c, a = 1) => `rgba(${c[0] | 0},${c[1] | 0},${c[2] | 0},${a})`;
const mixc = (a, b, k) => [0, 1, 2].map(i => a[i] + (b[i] - a[i]) * k);
const shade = (h, k) => css(rgb(h).map(v => v * k));
const rimc = h => css(mixc(rgb(h), [255, 226, 176], .42));
const flick = t => 1 + .06 * Math.sin(7.3 * t) * Math.sin(3.1 * t);

// ---- textures: fibre grain (front face) and pulp cloud (seen when backlit) ----
function makeGrain(n, seed) {
  const c = mk(n, n), x = c.getContext('2d'), R = mulberry(seed), img = x.createImageData(n, n), d = img.data;
  for (let i = 0; i < n * n; i++) { const v = R(); d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = v < .5 ? 0 : 255; d[i * 4 + 3] = Math.abs(v - .5) * 34; }
  x.putImageData(img, 0, 0); x.lineCap = 'round';
  for (let i = 0; i < n * 1.5; i++) {
    const px = R() * n, py = R() * n, a = R() * TAU, l = 5 + R() * 24;
    x.strokeStyle = R() < .5 ? 'rgba(30,24,20,.13)' : 'rgba(255,255,255,.15)'; x.lineWidth = .5 + R() * .9;
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .5) * l * .5, py + Math.sin(a + .5) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  return c;
}
function makeCloud(n, seed) {   // tileable mottle, stored in alpha (.25‥1)
  const R = mulberry(seed), c = mk(n, n), x = c.getContext('2d');
  x.fillStyle = '#808080'; x.fillRect(0, 0, n, n);
  for (const [cnt, rmin, rmax, a] of [[60, 40, 120, .24], [260, 10, 40, .17], [900, 3, 10, .12]]) for (let i = 0; i < cnt; i++) {
    const px = R() * n, py = R() * n, r = rmin + R() * (rmax - rmin), v = R() < .5 ? 0 : 255;
    for (const ox of [-n, 0, n]) for (const oy of [-n, 0, n]) {
      const g = x.createRadialGradient(px + ox, py + oy, 0, px + ox, py + oy, r);
      g.addColorStop(0, `rgba(${v},${v},${v},${a})`); g.addColorStop(1, `rgba(${v},${v},${v},0)`); x.fillStyle = g; x.fillRect(px + ox - r, py + oy - r, r * 2, r * 2);
    }
  }
  x.lineCap = 'round';
  for (let i = 0; i < n * 2; i++) {
    const px = R() * n, py = R() * n, a = R() * TAU, l = 6 + R() * 30;
    x.strokeStyle = `rgba(255,255,255,${.06 + R() * .14})`; x.lineWidth = .6 + R();
    x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + Math.cos(a + .6) * l * .5, py + Math.sin(a + .6) * l * .5, px + Math.cos(a) * l, py + Math.sin(a) * l); x.stroke();
  }
  const img = x.getImageData(0, 0, n, n), d = img.data;
  for (let i = 0; i < n * n; i++) { const v = d[i * 4] / 255; d[i * 4] = d[i * 4 + 1] = d[i * 4 + 2] = 255; d[i * 4 + 3] = clamp(.12 + v * 1.25) * 255; }
  x.putImageData(img, 0, 0); return c;
}
const GRAIN = makeGrain(512, 7), CLOUD = makeCloud(512, 3);
const stage = mk(W, H), g = stage.getContext('2d'), scr = mk(W, H), sx = scr.getContext('2d');
const GP = g.createPattern(GRAIN, 'repeat'), CP = g.createPattern(CLOUD, 'repeat');

// paper finish on a canvas: grain, warm rim on top edges, dark band on bottom edges
function finish(c, o = {}) {
  const x = c.getContext('2d'), w = c.width, h = c.height;
  x.save(); x.setTransform(1, 0, 0, 1, 0, 0);
  if (o.grain !== 0) { x.globalCompositeOperation = 'source-atop'; x.globalAlpha = o.grain ?? .9; x.fillStyle = GP; x.fillRect(0, 0, w, h); x.globalAlpha = 1; }
  const band = (dy, col, blur) => {
    const t = mk(w, h), y = t.getContext('2d');
    y.drawImage(c, 0, 0); y.globalCompositeOperation = 'destination-out'; y.drawImage(c, 0, dy);
    y.globalCompositeOperation = 'source-in'; y.fillStyle = col; y.fillRect(0, 0, w, h);
    x.globalCompositeOperation = 'source-atop'; x.filter = `blur(${blur}px)`; x.drawImage(t, 0, 0); x.filter = 'none';
  };
  if (o.rim !== 0) band(o.rimPx ?? 3, `rgba(255,232,190,${o.rim ?? .42})`, .6);
  if (o.under !== 0) band(-(o.underPx ?? 3), `rgba(0,0,0,${o.under ?? .34})`, .8);
  x.restore(); return c;
}
function cut(x, fn) { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.strokeStyle = '#000'; fn(x); x.restore(); }
function crease(x, col, fn) { x.save(); x.globalCompositeOperation = 'source-atop'; x.strokeStyle = col; x.fillStyle = col; x.lineCap = 'round'; x.lineJoin = 'round'; fn(x); x.restore(); }
// a static sheet: o = { x, y, w, h, col, draw(ctx), blur }
function sheet(o) {
  const c = mk(o.w, o.h), x = c.getContext('2d'); x.translate(-o.x, -o.y); x.fillStyle = o.col; x.strokeStyle = o.col; o.draw(x);
  finish(c, o);
  const s = { c, x: o.x, y: o.y, w: o.w, h: o.h, col: o.col };
  if (o.blur) { s.b = mk(o.w, o.h); const y = s.b.getContext('2d'); y.filter = `blur(${o.blur}px)`; y.drawImage(c, 0, 0); }
  return s;
}
// a sheet redrawn every frame (jointed figures)
const pool = {};
function dyn(name, x, y, w, h, col, fn) {
  let s = pool[name]; if (!s || s.c.width !== w || s.c.height !== h) s = pool[name] = { c: mk(w, h) };
  const c = s.c.getContext('2d'); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-over'; c.globalAlpha = 1; c.clearRect(0, 0, w, h);
  c.translate(-x, -y); s.x = x; s.y = y; s.w = w; s.h = h; s.col = col; s.em = []; fn(c, s);
  c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = .9; c.fillStyle = GP; c.fillRect(0, 0, w, h); c.globalAlpha = 1; c.globalCompositeOperation = 'source-over';
  return s;
}
const RIM = 3;
// one cut part of a figure: Path2D under the current transform, with rim and under-edge
function part(x, path, col, o = {}) {
  const m = x.getTransform(), cw = x.canvas.width, ch = x.canvas.height, r = o.rim ?? RIM;
  x.save(); x.clip(path); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = shade(col, .52); x.fillRect(0, 0, cw, ch);
  x.setTransform(m.a, m.b, m.c, m.d, m.e, m.f - r); x.clip(path); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = rimc(col); x.fillRect(0, 0, cw, ch);
  x.setTransform(m.a, m.b, m.c, m.d, m.e, m.f + r); x.clip(path); x.setTransform(1, 0, 0, 1, 0, 0); x.fillStyle = col; x.fillRect(0, 0, cw, ch);
  x.restore();
}
function hole(x, path) { x.save(); x.globalCompositeOperation = 'destination-out'; x.fillStyle = '#000'; x.fill(path); x.restore(); }

// ---- per-frame state ----
const cam = { x: 0, y: 0, z: 1 };
const LIT = { x: 540, y: 800, r: 700, k: 1, col: [255, 178, 96], floor: .12 };
function xf(x, o) {
  const p = o.p ?? 1, s = 1 + (cam.z - 1) * p; x.translate(W / 2, H / 2); x.scale(s, s); x.translate(-W / 2 - cam.x * p + (o.dx || 0), -H / 2 - cam.y * p + (o.dy || 0));
  if (o.rot || o.sc || o.sx) { x.translate(o.px || 0, o.py || 0); if (o.rot) x.rotate(o.rot); x.scale((o.sc || 1) * (o.sx ?? 1), o.sc || 1); x.translate(-(o.px || 0), -(o.py || 0)); }
}
// put a sheet in the stack. o: p parallax (far <1, story 1, near >1), dx, dy, rot/sc/sx about (px,py), trans, sh, blur, a
function put(s, o = {}) {
  g.save(); xf(g, o);
  const sh = o.sh ?? .55;
  if (sh > 0) { g.shadowColor = `rgba(1,3,10,${sh})`; g.shadowBlur = o.sb ?? 26; g.shadowOffsetY = o.sy ?? 20; g.shadowOffsetX = o.sox ?? 4; }
  g.globalAlpha = o.a ?? 1;
  const bl = o.blur ?? 0;
  if (bl >= 1 && s.b) g.drawImage(s.b, s.x, s.y);
  else { g.drawImage(s.c, s.x, s.y); if (bl > 0 && s.b) { g.shadowColor = 'transparent'; g.globalAlpha = (o.a ?? 1) * bl; g.drawImage(s.b, s.x, s.y); } }
  g.restore();
  const k = (o.trans ?? 0) * LIT.k * (o.a ?? 1);
  if (k > .004) {   // backlight through the paper: albedo x warm light x gaussian falloff x pulp cloud, masked by the sheet
    sx.setTransform(1, 0, 0, 1, 0, 0); sx.globalCompositeOperation = 'copy';
    const a = rgb(s.col), c = [0, 1, 2].map(i => Math.min(255, (a[i] * .9 + 26) * LIT.col[i] / 255 * 1.0));
    const lx = LIT.x - cam.x * (o.p ?? 1), ly = LIT.y - cam.y * (o.p ?? 1), R = LIT.r * 2.1, gr = sx.createRadialGradient(lx, ly, 0, lx, ly, R), f = LIT.floor;
    for (let i = 0; i <= 8; i++) { const u = i / 8, d = u * R / LIT.r; gr.addColorStop(u, css(c, f + (1 - f) * Math.exp(-d * d))); }
    sx.fillStyle = gr; sx.fillRect(0, 0, W, H);
    sx.globalCompositeOperation = 'destination-in'; sx.save(); sx.translate(-cam.x * (o.p ?? 1) + (o.dx || 0), -cam.y * (o.p ?? 1)); sx.fillStyle = CP; sx.fillRect(-2000, -1000, 5000, 4000); sx.restore();
    sx.save(); xf(sx, o); sx.drawImage(bl >= 1 && s.b ? s.b : s.c, s.x, s.y); sx.restore();
    g.save(); g.globalCompositeOperation = 'lighter'; g.globalAlpha = Math.min(1, k); g.drawImage(scr, 0, 0); g.restore();
  }
}
// emissive drawing (holes that burn): fn draws in design coords, additive
function lightOn(o, fn) { g.save(); xf(g, o); g.globalCompositeOperation = 'lighter'; fn(g); g.restore(); }
function over(o, fn) { g.save(); xf(g, o); fn(g); g.restore(); }
function halo(x, cx, cy, r, col, a = 1) {
  if (a <= 0 || r <= 0) return; const gr = x.createRadialGradient(cx, cy, 0, cx, cy, r);
  gr.addColorStop(0, css(col, a)); gr.addColorStop(.3, css(col, a * .42)); gr.addColorStop(.65, css(col, a * .1)); gr.addColorStop(1, css(col, 0));
  x.fillStyle = gr; x.fillRect(cx - r, cy - r, r * 2, r * 2);
}
const AMB = [255, 184, 98], AMBH = '#ffb862', PALE = [255, 236, 200];
function sky(c0, c1, c2) { const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, c0); gr.addColorStop(.6, c1); gr.addColorStop(1, c2 || c1); g.fillStyle = gr; g.fillRect(0, 0, W, H); g.save(); g.globalAlpha = .5; g.globalCompositeOperation = 'overlay'; g.fillStyle = GP; g.fillRect(0, 0, W, H); g.restore(); }
function rr(x, a, b, w, h, r) { x.beginPath(); x.roundRect(a, b, w, h, r); }
