// Scenes for the last-bus story, in the 80s cel anime grammar
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), prog = (t, a, d) => clamp((t - a) / d), lerp = (a, b, k) => a + (b - a) * k;
const eo = x => 1 - Math.pow(1 - x, 3), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const st12 = t => Math.floor(t * 12 + 1e-6) / 12, st8 = t => Math.floor(t * 8 + 1e-6) / 8;
const A = {};
function cam(s, cx, cy, tx = W / 2, ty = H / 2) { for (const x of [g, e, c]) x.setTransform(s, 0, 0, s, tx - cx * s, ty - cy * s); }
function uncam() { for (const x of [g, e, c]) x.setTransform(1, 0, 0, 1, 0, 0); }
// put the cel layer onto the picture and stamp its silhouette in black onto the emissive canvas
function flush(a = 1, sa = 1) {
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalAlpha = a; g.drawImage(cc, 0, 0); g.restore();
  e.save(); e.setTransform(1, 0, 0, 1, 0, 0); e.globalAlpha = sa; e.globalCompositeOperation = 'destination-out'; e.drawImage(cc, 0, 0);
  e.globalAlpha = 1; e.globalCompositeOperation = 'destination-over'; e.fillStyle = '#000'; e.fillRect(0, 0, W, H); e.restore();
  c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.restore();
}
// a coloured light band sweeping over the held cels (drawn before flush)
function lband(x, w, col, a, skew = -.35) { c.save(); c.setTransform(1, 0, skew, 1, 0, 0); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = a; c.fillStyle = col; c.fillRect(x, -100, w, H + 200); c.restore(); }
function tintCels(col, a) { c.save(); c.setTransform(1, 0, 0, 1, 0, 0); c.globalCompositeOperation = 'source-atop'; c.globalAlpha = a; c.fillStyle = col; c.fillRect(0, 0, W, H); c.restore(); }
function both(fn) { fn(g, 0); fn(e, 1); }
function rrp(x, y, w, h, r) { const p = new Path2D(); p.roundRect(x, y, w, h, r); return p; }
function neonText(p, q, txt, x, y, size, col, font = 'Rozha') {
  for (const [ctx, pass] of [[p, 0], [q, 1]]) { ctx.save(); ctx.font = `${font === 'Mukta' ? '800 ' : ''}${size}px ${font}`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if (pass === 0) { ctx.strokeStyle = rgba(col, .9); ctx.lineWidth = size * .12; ctx.strokeText(txt, x, y); ctx.fillStyle = mix(col, '#ffffff', .8); ctx.fillText(txt, x, y); }
    else { ctx.strokeStyle = col; ctx.lineWidth = size * .16; ctx.strokeText(txt, x, y); ctx.fillStyle = mix(col, '#ffffff', .4); ctx.fillText(txt, x, y); }
    ctx.restore(); }
}

// ================= painted plates (once, at load) =================
const NEONC = ['#ff3fa4', '#35e7ff', '#ffd23f', '#ff5a3c', '#b36bff', '#4dff9a'];
const SIGNW = ['चाय', 'होटल', 'दवाखाना', 'पान', 'किताबें', 'सिनेमा', 'मिठाई', 'टेलर', 'रेडियो', 'भोजनालय'];
const BY = 1480;   // building base line in street-plate coordinates
function paintSky(Wp, Hp) {
  const [pc, p] = canvas(Wp, Hp), [pe, q] = canvas(Wp, Hp), R = rng(11);
  q.fillStyle = '#000'; q.fillRect(0, 0, Wp, Hp);
  vgrad(p, 0, 0, Wp, Hp, [[0, '#05051a'], [.3, '#12103e'], [.55, '#2c1a66'], [.72, '#5a2880'], [.86, '#a0408a'], [1, '#d8607a']]);
  for (let i = 0; i < 260; i++) { const x = R() * Wp, y = R() * Hp * .6, s = 1 + R() * 2.4, a = .25 + R() * .7; p.fillStyle = rgba(R() < .2 ? '#bfe0ff' : '#ffffff', a); p.fillRect(x, y, s, s); if (s > 2.6) { q.fillStyle = rgba('#bfd8ff', .5); q.fillRect(x - 1, y - 1, s + 2, s + 2); } }
  // moon
  const mx = Wp * .2, my = 330; airbrush(p, mx, my, 260, 260, '#8a7ad8', .28); airbrush(q, mx, my, 170, 170, '#c8c0ff', .3);
  p.fillStyle = '#fff6dc'; p.beginPath(); p.arc(mx, my, 62, 0, TAU); p.fill(); p.fillStyle = '#12103e'; p.globalAlpha = .93; p.beginPath(); p.arc(mx + 26, my - 12, 56, 0, TAU); p.fill(); p.globalAlpha = 1;
  q.fillStyle = rgba('#fff0c8', .7); q.beginPath(); q.arc(mx - 14, my + 6, 40, 0, TAU); q.fill();
  // airbrushed clouds with lit undersides
  for (let k = 0; k < 9; k++) { const cx = R() * Wp, cy = 420 + R() * 520, rx = 200 + R() * 260;
    for (let j = 0; j < 5; j++) airbrush(p, cx + (R() - .5) * rx, cy + (R() - .5) * 30, rx * (.4 + R() * .4), 26 + R() * 30, '#1c1650', .5);
    airbrush(p, cx, cy + 34, rx * .9, 16, '#e0609a', .28); airbrush(p, cx + 40, cy + 26, rx * .5, 10, '#ffb08a', .25); }
  // far skyline
  const base = Hp - 420;
  for (let x = -20; x < Wp;) { const w = 70 + R() * 130, h = 160 + R() * 420, col = mix('#1a1446', '#3a2260', R() * .6);
    vgrad(p, x, base - h, w, h + 430, [[0, mix(col, '#000000', .3)], [.6, col], [1, mix(col, '#c0508a', .45)]]);
    if (R() < .3) { p.fillStyle = col; p.fillRect(x + w * .4, base - h - 50, 6, 50); q.fillStyle = '#ff3030'; q.beginPath(); q.arc(x + w * .4 + 3, base - h - 50, 5, 0, TAU); q.fill(); p.fillStyle = '#ff8080'; p.fillRect(x + w * .4, base - h - 53, 6, 6); }
    for (let yy = base - h + 16; yy < base + 300; yy += 26) for (let xx = x + 8; xx < x + w - 12; xx += 18) if (R() < .22) { const wc = R() < .75 ? '#ffd98a' : '#9fe8ff'; p.fillStyle = wc; p.fillRect(xx, yy, 9, 12); q.fillStyle = rgba(wc, .4); q.fillRect(xx, yy, 9, 12); }
    x += w + (R() < .3 ? 10 + R() * 40 : 0); }
  airbrush(p, Wp / 2, base + 330, Wp, 300, '#c0508a', .32);
  return { c: pc, e: pe, w: Wp, h: Hp };
}
function paintStreet(Wp, Hp, seed) {
  const [bc, b] = canvas(Wp, Hp), [bec, be] = canvas(Wp, Hp), R = rng(seed);
  for (let x = 0; x < Wp;) {
    let w = 250 + R() * 190; if (Wp - x - w < 180) w = Wp - x;
    const top = BY - (430 + R() * 330), hue = ['#2a1f52', '#1f2850', '#3a2048', '#232a44', '#2e2458'][Math.floor(R() * 5)];
    vgrad(b, x, top, w, BY - top, [[0, mix(hue, '#000000', .5)], [.7, hue], [1, mix(hue, '#ff4fa8', .2)]]);
    b.fillStyle = rgba('#000000', .28); b.fillRect(x + w - 12, top, 12, BY - top); b.fillStyle = rgba('#ffffff', .07); b.fillRect(x, top, 5, BY - top);
    b.fillStyle = mix(hue, '#000000', .6); b.fillRect(x - 6, top - 12, w + 12, 14);
    if (R() < .5) { b.fillStyle = mix(hue, '#000000', .55); b.fillRect(x + 30 + R() * (w - 120), top - 60, 70, 50); }   // water tank
    const cols = Math.max(2, Math.floor(w / 78)), cw = w / cols;
    for (let yy = top + 44; yy < BY - 290; yy += 92) for (let i = 0; i < cols; i++) {
      const wx = x + i * cw + cw * .2, ww = cw * .6, lit = R() < .3, wc = lit ? (R() < .7 ? '#ffd98a' : '#9fe8ff') : mix(hue, '#000000', .38);
      b.fillStyle = wc; b.fillRect(wx, yy, ww, 50);
      if (lit) { be.fillStyle = rgba(wc, .4); be.fillRect(wx, yy, ww, 50); b.fillStyle = rgba('#000000', .28); b.fillRect(wx, yy + 34, ww, 16); if (R() < .5) { b.fillStyle = rgba('#2a1830', .6); b.fillRect(wx + ww * .55, yy + 12, 4, 38); } }
      b.fillStyle = rgba('#000000', .4); b.fillRect(wx - 3, yy + 50, ww + 6, 5);
      b.fillStyle = rgba('#000000', .25); b.fillRect(wx + ww / 2 - 1.5, yy, 3, 50);
    }
    // ground floor: closed shutter or a lit shop
    const sy = BY - 230, lit = R() < .45;
    b.fillStyle = mix(hue, '#000000', .55); b.fillRect(x + 8, sy - 20, w - 16, 250);
    if (lit) { const shop = ['#ffcf7a', '#ffe7b0', '#ff9f7a', '#9fdcff'][Math.floor(R() * 4)];
      vgrad(b, x + 22, sy + 14, w - 44, 196, [[0, rgba(shop, .95)], [1, rgba(mix(shop, '#ff6a3c', .4), .8)]]); be.fillStyle = rgba(shop, .42); be.fillRect(x + 22, sy + 14, w - 44, 196);
      b.fillStyle = rgba('#2a1830', .72); for (let k = 0; k < 3; k++) { const px = x + 44 + R() * (w - 110); if (R() < .5) { b.beginPath(); b.ellipse(px, sy + 96, 15, 17, 0, 0, TAU); b.fill(); b.fillRect(px - 21, sy + 112, 42, 100); } else b.fillRect(px - 30, sy + 130, 62, 80); }
      b.fillStyle = rgba('#000000', .5); for (let k = 1; k < 3; k++) b.fillRect(x + 22 + (w - 44) * k / 3 - 3, sy + 14, 6, 196);
    } else { vgrad(b, x + 22, sy + 14, w - 44, 196, [[0, '#3a3a5e'], [1, '#26264a']]); b.fillStyle = rgba('#000000', .3); for (let yy = sy + 20; yy < sy + 206; yy += 13) b.fillRect(x + 22, yy, w - 44, 4); b.fillStyle = rgba('#ffffff', .08); b.fillRect(x + 22, sy + 14, w - 44, 3); }
    // awning + neon sign board
    const aw = NEONC[Math.floor(R() * NEONC.length)];
    for (let k = 0; k < (w - 16) / 38; k++) { b.fillStyle = k % 2 ? mix(aw, '#1a1030', .5) : mix('#f0e8f0', '#1a1030', .4); b.beginPath(); b.moveTo(x + 8 + k * 38, sy - 26); b.lineTo(Math.min(x + w - 8, x + 46 + k * 38), sy - 26); b.lineTo(Math.min(x + w - 4, x + 50 + k * 38), sy + 14); b.lineTo(x + 4 + k * 38, sy + 14); b.fill(); }
    const ncol = NEONC[Math.floor(R() * NEONC.length)], txt = SIGNW[Math.floor(R() * SIGNW.length)], sgy = sy - 92;
    b.font = '76px Rozha'; const sw = Math.min(w - 30, b.measureText(txt).width + 70);
    b.fillStyle = '#120b1e'; b.fillRect(x + (w - sw) / 2, sgy - 54, sw, 104); b.strokeStyle = rgba(ncol, .9); b.lineWidth = 5; b.strokeRect(x + (w - sw) / 2 + 8, sgy - 46, sw - 16, 88); be.strokeStyle = ncol; be.lineWidth = 7; be.strokeRect(x + (w - sw) / 2 + 8, sgy - 46, sw - 16, 88);
    neonText(b, be, txt, x + w / 2, sgy + 2, Math.min(76, (sw - 50) / Math.max(1, b.measureText(txt).width) * 76), NEONC[Math.floor(R() * NEONC.length)]);
    b.strokeStyle = rgba('#000000', .4); b.lineWidth = 4; b.beginPath(); b.moveTo(x + w * .9, top); b.lineTo(x + w * .9, BY); b.stroke();
    x += w + (R() < .28 ? 50 + R() * 90 : 0);
  }
  // street lamps on the far pavement (sodium)
  for (let lx = 190; lx < Wp; lx += 560) { b.fillStyle = '#16122c'; b.fillRect(lx - 5, BY - 560, 10, 560); b.fillRect(lx - 5, BY - 566, 90, 9); b.fillStyle = '#ffe2a0'; b.fillRect(lx + 52, BY - 558, 36, 9);
    const gr = b.createLinearGradient(0, BY - 550, 0, BY); gr.addColorStop(0, rgba('#ffb060', .3)); gr.addColorStop(1, rgba('#ffb060', 0)); b.fillStyle = gr; b.beginPath(); b.moveTo(lx + 56, BY - 550); b.lineTo(lx + 86, BY - 550); b.lineTo(lx + 250, BY); b.lineTo(lx - 110, BY); b.fill();
    const lg = be.createRadialGradient(lx + 70, BY - 552, 0, lx + 70, BY - 552, 110); lg.addColorStop(0, rgba('#ffc070', 1)); lg.addColorStop(.25, rgba('#ffa040', .5)); lg.addColorStop(1, rgba('#ffa040', 0)); be.fillStyle = lg; be.fillRect(lx - 60, BY - 680, 260, 260); }
  // compose: road + wet reflection + buildings; emissive twin with black silhouettes
  const [pc, p] = canvas(Wp, Hp), [pe, q] = canvas(Wp, Hp);
  vgrad(p, 0, BY, Wp, Hp - BY, [[0, '#2a2650'], [.05, '#17143a'], [.3, '#100e2a'], [1, '#0a0820']]); q.fillStyle = '#000'; q.fillRect(0, BY, Wp, Hp - BY);
  for (const [ctx, src, al] of [[p, bc, .34], [q, bec, .36]]) { ctx.save(); ctx.beginPath(); ctx.rect(0, BY + 28, Wp, Hp); ctx.clip(); ctx.filter = 'blur(6px)';
    for (let i = 0; i < 6; i++) { ctx.globalAlpha = al * (1 - i / 7); ctx.save(); ctx.translate(0, BY + 28 + i * 30); ctx.scale(1, -1.25); ctx.drawImage(src, 0, 0, Wp, BY, 0, -BY, Wp, BY); ctx.restore(); } ctx.restore(); }
  for (let y = BY + 28; y < Hp; y += 6) { const a = .14 + .1 * Math.sin(y * .37) + .08 * Math.sin(y * 1.3); p.fillStyle = rgba('#0a0616', a); p.fillRect(0, y, Wp, 3); q.fillStyle = rgba('#000000', a * 1.6); q.fillRect(0, y, Wp, 3); }
  p.fillStyle = '#3a3668'; p.fillRect(0, BY, Wp, 26); p.fillStyle = '#56509a'; p.fillRect(0, BY + 24, Wp, 5);            // far pavement + kerb
  p.fillStyle = rgba('#f0e8c0', .35); for (let x = 0; x < Wp; x += 220) p.fillRect(x, BY + 108, 120, 7);                       // lane dashes
  p.fillStyle = rgba('#4a4680', .5); p.fillRect(0, BY + 200, Wp, Hp); p.fillStyle = '#7a74c0'; p.fillRect(0, BY + 196, Wp, 6); p.fillStyle = '#211d48'; p.fillRect(0, BY + 202, Wp, 14);   // near kerb + pavement slab
  p.strokeStyle = rgba('#0a0820', .5); p.lineWidth = 3; for (const yy of [BY + 290, BY + 420, BY + 600]) { p.beginPath(); p.moveTo(0, yy); p.lineTo(Wp, yy); p.stroke(); }
  for (let x = -400; x < Wp + 400; x += 260) { p.beginPath(); p.moveTo(x + (Wp / 2 - x) * .25, BY + 216); p.lineTo(x - (Wp / 2 - x) * .5, Hp); p.stroke(); }
  q.fillStyle = rgba('#000000', .45); q.fillRect(0, BY + 196, Wp, Hp);
  p.drawImage(bc, 0, 0);
  q.save(); q.filter = 'brightness(0)'; q.drawImage(bc, 0, 0); q.restore(); q.drawImage(bec, 0, 0);
  return { c: pc, e: pe, w: Wp, h: Hp };
}
function smearPlate(plate, px, n = 8) { const out = {}; for (const k of ['c', 'e']) { const [cv2, x] = canvas(plate.w, plate.h); x.globalAlpha = 1 / n; for (let j = 0; j < 3; j++) for (let i = 0; i < n; i++) { const dx = (i / (n - 1) - .5) * px; x.drawImage(plate[k], dx, 0); x.drawImage(plate[k], dx + (dx < 0 ? plate.w : -plate.w), 0); } out[k] = cv2; } return { ...out, w: plate.w, h: plate.h }; }
// blurred light streaks seen through the bus windows
function paintStrip(Wp, Hp) {
  const [pc, p] = canvas(Wp, Hp), [pe, q] = canvas(Wp, Hp), R = rng(5);
  vgrad(p, 0, 0, Wp, Hp, [[0, '#07061c'], [.6, '#1a1248'], [1, '#3a1c5c']]); q.fillStyle = '#000'; q.fillRect(0, 0, Wp, Hp);
  for (let i = 0; i < 26; i++) { const x = R() * Wp, w = 120 + R() * 260, h = Hp * (.3 + R() * .5); p.fillStyle = rgba('#0a0822', .8); p.fillRect(x, Hp - h, w, h); if (x + w > Wp) p.fillRect(x - Wp, Hp - h, w, h); }
  for (let i = 0; i < 46; i++) { const x = R() * Wp, y = Hp * (.2 + R() * .7), rx = 60 + R() * 200, ry = 8 + R() * 26, col = R() < .35 ? '#ffc070' : NEONC[Math.floor(R() * 6)], a = .35 + R() * .5;
    for (const dx of [0, -Wp, Wp]) { airbrush(p, x + dx, y, rx, ry, col, a); airbrush(p, x + dx, y, rx * .5, ry * .4, '#ffffff', a * .6); airbrush(q, x + dx, y, rx, ry, col, a * .7); } }
  return { c: pc, e: pe, w: Wp, h: Hp };
}
function buildAssets() {
  A.sky = paintSky(1500, 1900);
  A.street = paintStreet(1700, 2200, 3);
  A.streetSm = smearPlate(A.street, 46, 10);
  A.strip = paintStrip(2600, 600);
}
function loopDraw(plate, x, y, k) { x = ((x % plate.w) + plate.w) % plate.w; for (const [ctx, kk] of [[g, 'c'], [e, 'e']]) { ctx.drawImage(plate[kk], x - plate.w, y); if (x < W / (k || 1) + 400) ctx.drawImage(plate[kk], x, y); } }

// ================= cels: bus, people, props =================
const BUSP = { body: { f: '#aaa4d0', s: '#6c64aa', h: '#dcd8f6', l: '#221c48' }, stripe: '#1f8a94', stripe2: '#e0507a', win: '#d6f4dc', winS: '#8fc8b8', seat: '#2a6a78', frame: '#3a3468',
  tire: { f: '#1c1a2c', s: '#0e0c1a', h: '#4a4868', l: '#06050c' }, chrome: { f: '#b8c0e4', s: '#5c668c', h: '#ffffff', l: '#232a48' }, dark: '#17142e' };
const BWIN = [225, 343, 461, 579, 697, 815];
// local coords: origin = front-bottom, bus faces left, length 980, roof at -400, wheels touch 0
function bus(o = {}) {
  const B = BUSP, door = o.door || 0;
  const P = new Path2D(); P.moveTo(52, -400); P.lineTo(952, -400); P.quadraticCurveTo(980, -400, 980, -372); P.lineTo(980, -52); P.lineTo(16, -52); P.lineTo(4, -110); P.lineTo(6, -230); P.quadraticCurveTo(14, -340, 52, -400); P.closePath();
  cel(c, P, { f: B.body.f, s: B.body.s, h: B.body.h, l: B.body.l, lw: 3, sh: [poly([[0, -150], [990, -150], [990, 0], [0, 0]])], hi: [poly([[30, -400], [960, -400], [960, -388], [26, -388]])],
    clipFn: gg => { gg.fillStyle = B.stripe; gg.fillRect(0, -212, 990, 40); gg.fillStyle = B.stripe2; gg.fillRect(0, -166, 990, 9); gg.fillStyle = rgba('#000000', .25); gg.fillRect(0, -70, 990, 20);
      gg.fillStyle = B.dark; for (const wx of [230, 760]) { gg.beginPath(); gg.arc(wx, -52, 70, Math.PI, 0); gg.fill(); } } });
  // windows (flat lit cels) + seat tops
  for (const wx of BWIN) { const R = rrp(wx, -350, 100, 124, 10); c.fillStyle = B.win; c.fill(R); c.save(); c.clip(R); c.fillStyle = B.winS; c.fillRect(wx, -350, 100, 22); c.fillStyle = B.seat; c.beginPath(); c.roundRect(wx + 12, -262, 34, 60, 8); c.roundRect(wx + 56, -262, 34, 60, 8); c.fill(); c.restore(); c.strokeStyle = B.frame; c.lineWidth = 4; c.stroke(R); }
  const ws = path([[26, -330, 1], [50, -352, 1], [84, -352, 1], [84, -228, 1], [20, -228, 1]]); c.fillStyle = B.win; c.fill(ws); c.strokeStyle = B.frame; c.lineWidth = 4; c.stroke(ws);
  // driver silhouette
  c.fillStyle = B.dark; c.beginPath(); c.ellipse(60, -296, 13, 15, 0, 0, TAU); c.fill(); c.fillRect(44, -284, 34, 56);
  // door
  c.fillStyle = mix(B.win, '#ffd9a0', .5); c.fillRect(104, -352, 100, 296); c.fillStyle = B.winS; c.fillRect(104, -110, 100, 12); c.fillRect(104, -80, 100, 28);
  if (o.inDoor) o.inDoor();
  const lw2 = 50 * (1 - door * .82);
  for (const [x0, dir] of [[104, 1], [204, -1]]) { const x = dir > 0 ? x0 : x0 - lw2; c.fillStyle = B.body.f; c.fillRect(x, -352, lw2, 296); c.fillStyle = B.win; c.fillRect(x + lw2 * .16, -338, lw2 * .68, 120); c.strokeStyle = B.body.l; c.lineWidth = 3; c.strokeRect(x, -352, lw2, 296); }
  c.strokeStyle = B.frame; c.lineWidth = 4; c.strokeRect(104, -352, 100, 300);
  // destination board, lamps, bumper, mirror
  c.fillStyle = '#17120a'; c.fillRect(222, -396, 250, 40); c.save(); c.font = '800 30px Mukta'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillStyle = '#ffc040'; c.fillText('रात्रि सेवा · 40', 347, -375); c.restore();
  c.fillStyle = B.dark; c.fillRect(-4, -78, 60, 26); c.fillRect(940, -78, 44, 26);
  c.fillStyle = '#fff6d0'; c.beginPath(); c.ellipse(12, -124, 9, 17, 0, 0, TAU); c.fill(); c.strokeStyle = B.body.l; c.lineWidth = 2.5; c.stroke();
  c.fillStyle = '#ff5040'; c.fillRect(972, -150, 9, 40); c.fillStyle = '#ffb040'; c.fillRect(60, -404, 16, 6); c.fillRect(920, -404, 16, 6);
  c.strokeStyle = B.dark; c.lineWidth = 5; c.beginPath(); c.moveTo(14, -300); c.lineTo(-14, -312); c.stroke(); c.fillStyle = B.dark; c.fillRect(-22, -334, 12, 40);
  for (const wx of [230, 760]) { const tp = new Path2D(); tp.arc(wx, -52, 52, 0, TAU); cel(c, tp, { f: B.tire.f, s: B.tire.s, so: [0, -8], l: B.tire.l, lw: 3 }); const hp = new Path2D(); hp.arc(wx, -52, 24, 0, TAU); cel(c, hp, { f: B.chrome.f, s: B.chrome.s, so: [-4, -5], h: B.chrome.h, l: B.chrome.l, lw: 2.5 });
    c.fillStyle = B.chrome.l; for (let k = 0; k < 5; k++) { const a = (o.wheelA || 0) + k * TAU / 5; c.beginPath(); c.arc(wx + Math.cos(a) * 13, -52 + Math.sin(a) * 13, 3.4, 0, TAU); c.fill(); } }
}
// emissive parts of the bus, drawn on e after the stamp (same transform as the cel)
function busGlow(o = {}) {
  const a = o.a ?? 1; e.save(); e.globalCompositeOperation = 'lighter';
  for (const wx of BWIN) { e.fillStyle = rgba('#bff0d0', .34 * a); e.fillRect(wx, -350, 100, 124); }
  e.fillStyle = rgba('#ffe0a8', .3 * a * (.4 + .6 * (o.door ?? 0))); e.fillRect(110, -348, 88, 240);
  e.fillStyle = rgba('#ffb040', .8 * a); e.font = '800 30px Mukta'; e.textAlign = 'center'; e.textBaseline = 'middle'; e.fillText('रात्रि सेवा · 40', 347, -375);
  e.fillStyle = rgba('#ff3020', .9 * a); e.fillRect(968, -152, 14, 44); airbrush(e, 985, -130, 70, 70, '#ff3020', .5 * a);
  airbrush(e, 68, -401, 26, 26, '#ffb040', .8 * a); airbrush(e, 928, -401, 26, 26, '#ffb040', .8 * a);
  // headlight + cone
  const hl = (o.head ?? 1) * a; airbrush(e, 8, -124, 60, 60, '#fff0c0', hl);
  const gr = e.createLinearGradient(0, 0, -620, 0); gr.addColorStop(0, rgba('#ffe8b0', .5 * hl)); gr.addColorStop(1, rgba('#ffe8b0', 0)); e.fillStyle = gr; e.beginPath(); e.moveTo(4, -136); e.lineTo(-620, -210); e.lineTo(-620, 20); e.lineTo(4, -110); e.fill();
  e.restore();
}
// small full figure of Arjun, side view facing right; origin at the feet, ~335 px tall. ph = walk phase (radians), 0 walk = standing
function figure(P, o = {}) {
  const w = o.walk || 0, ph = o.ph || 0, J = P.jacket, PT = P.pants;
  const leg = (a, bend, front) => { const hip = [0, -162], kn = [hip[0] + Math.sin(a) * 82, hip[1] + Math.cos(a) * 82], a2 = a - bend, ft = [kn[0] + Math.sin(a2) * 80, kn[1] + Math.cos(a2) * 80];
    const st = { f: front ? PT.f : PT.s, s: PT.s, so: [-5, 0], l: PT.l, lw: 2.2 }; cel(c, limb(hip, kn, 34, 28), st); cel(c, limb(kn, ft, 27, 20), st);
    cel(c, [[ft[0] - 12, ft[1] - 8], [ft[0] + 8, ft[1] - 12], [ft[0] + 30, ft[1] - 2], [ft[0] + 30, ft[1] + 6, 1], [ft[0] - 13, ft[1] + 6, 1]], { f: P.shoe.f, s: P.shoe.s, so: [0, -4], l: P.shoe.l, lw: 2 }); };
  const a1 = Math.sin(ph) * .5 * w, b1 = Math.max(0, Math.sin(ph + 1.9)) * .7 * w, b2 = Math.max(0, Math.sin(ph + 1.9 + Math.PI)) * .7 * w;
  const arm = (a, front) => { const sh = [2, -262], el = [sh[0] + Math.sin(a) * 60, sh[1] + Math.cos(a) * 60], a2 = a + .35 * w + .1, hd = [el[0] + Math.sin(a2) * 56, el[1] + Math.cos(a2) * 56];
    const st = { f: front ? J.f : J.s, s: J.s, so: [-4, 0], h: J.h, l: J.l, lw: 2.2 }; cel(c, limb(sh, el, 27, 23), st); cel(c, limb(el, hd, 23, 19), st); const hp = new Path2D(); hp.arc(hd[0] + Math.sin(a2) * 8, hd[1] + Math.cos(a2) * 8, 10, 0, TAU); cel(c, hp, { f: P.skin.f, l: P.skin.l, lw: 1.8 }); };
  arm(a1 * .9, false); leg(-a1, b2, false);
  // sling bag behind
  cel(c, poly([[-44, -196], [-8, -200], [-6, -150], [-42, -146]]), { f: P.bag.f, s: P.bag.s, so: [-6, -4], l: P.bag.l, lw: 2.2 });
  leg(a1, b1, true);
  cel(c, [[-24, -272, 1], [-6, -282], [20, -276], [29, -240], [27, -196], [22, -150, 1], [-22, -150, 1], [-28, -200], [-30, -240]], { f: J.f, s: J.s, so: [-9, -3], h: J.h, ho: [3, 2], l: J.l, lw: 2.4,
    clipFn: gg => { gg.strokeStyle = P.bag.l; gg.lineWidth = 6; gg.beginPath(); gg.moveTo(18, -278); gg.lineTo(-30, -190); gg.stroke(); gg.fillStyle = P.stripe.f; gg.fillRect(-30, -160, 60, 7); } });
  arm(-a1 * .9, true);
  c.save(); c.translate(3, -312); c.scale(.33, .33); LWK.k = 1.9; head(c, P, { kind: 'arjun', view: 'side', expr: o.expr || 'neutral', body: false }); LWK.k = 1; c.restore();
}
function rainFx(drawing, a = .3, n = 150) { rain(g, e, drawing, { n, a, ang: .22, len: [50, 130], w: 1.8 }); }

const SCENES = {};
// ---------- 1. the stop: crane down from the clock to the street, the last bus arrives, Arjun boards ----------
function clockSign(x, y, t, a = 1) {
  both((ctx, em) => { ctx.save(); ctx.translate(x, y);
    if (!em) { ctx.fillStyle = '#14102a'; ctx.fillRect(-150, 86, 14, 150); ctx.fillRect(136, 86, 14, 150); ctx.fillStyle = '#0c0818'; ctx.beginPath(); ctx.roundRect(-232, -90, 464, 180, 14); ctx.fill(); ctx.strokeStyle = '#4a4488'; ctx.lineWidth = 6; ctx.stroke(); ctx.fillStyle = '#1c0a10'; ctx.fillRect(-212, -70, 424, 140); }
    else { ctx.fillStyle = '#000'; ctx.fillRect(-232, -90, 464, 180); }
    ctx.font = '800 108px Mukta'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    const col = Math.floor(t * 2) % 2 === 0, s1 = '11', s2 = '40', s3 = 'PM';
    const dr = (s, xx, sz) => { ctx.font = `800 ${sz}px Mukta`; if (em) { ctx.strokeStyle = rgba('#ff2a2a', .9 * a); ctx.lineWidth = 9; ctx.strokeText(s, xx, 4); ctx.fillStyle = rgba('#ff8a60', a); ctx.fillText(s, xx, 4); } else { ctx.fillStyle = '#ff5a48'; ctx.fillText(s, xx, 4); ctx.fillStyle = '#ffd0b0'; ctx.globalAlpha = .7; ctx.fillText(s, xx, 4); ctx.globalAlpha = 1; } };
    dr(s1, -128, 118); if (col) dr(':', -56, 118); dr(s2, 16, 118); dr(s3, 150, 62);
    ctx.restore(); });
}
function stopSign(x, y) {   // foreground cel: pole + round sign
  cel(c, poly([[x - 9, y], [x - 7, y - 640], [x + 7, y - 640], [x + 9, y]]), { f: '#4a4a78', s: '#2a2a50', so: [-6, 0], h: '#9a9ad0', ho: [3, 0], l: '#14122c', lw: 3 });
  const d = new Path2D(); d.arc(x, y - 700, 92, 0, TAU); cel(c, d, { f: '#2a4ad0', s: '#1a2a90', so: [-12, -10], h: '#7a9aff', ho: [5, 5], l: '#0c1040', lw: 4 });
  const d2 = new Path2D(); d2.arc(x, y - 700, 76, 0, TAU); c.strokeStyle = '#e8ecff'; c.lineWidth = 5; c.stroke(d2);
  c.save(); c.fillStyle = '#f4f6ff'; c.textAlign = 'center'; c.textBaseline = 'middle'; c.font = '58px Rozha'; c.fillText('बस', x, y - 722); c.font = '800 40px Mukta'; c.fillText('स्टॉप', x, y - 672); c.restore();
}
SCENES.stop = S => {
  const { lt } = S, tc = st12(lt), k = eio(prog(lt, .45, 2.1)), offY = lerp(30, 280, k), offX = lerp(70, 170, k);
  for (const [ctx, kk] of [[g, 'c'], [e, 'e']]) { ctx.drawImage(A.sky[kk], -offX * .35 - 60, -offY * .5 - 140); ctx.drawImage(A.street[kk], -offX, -offY); }
  for (const x of [g, e, c]) x.setTransform(1, 0, 0, 1, -offX, -offY);
  clockSign(660, 520, lt);
  // the bus (on twos)
  const bk = eo(prog(tc, .5, 1.9)), bx = lerp(1900, 330, bk), moving = bk < .999, bob = moving ? Math.round(hash(tc * 12) * 3) : 0, door = eo(prog(tc, 2.45, .35));
  g.fillStyle = rgba('#05040e', .55); g.beginPath(); g.ellipse(bx + 470, 1668, 500, 20, 0, 0, TAU); g.fill();
  const w = prog(tc, 2.7, .95), bd = prog(tc, 3.55, .55), ax = lerp(470, 476, w), inside = bd > .45;
  const arj = () => { c.save(); c.setTransform(1, 0, 0, 1, -offX, -offY); c.translate(lerp(380, bx + 150, eio(w)), lerp(1752, 1668, eio(bd))); const s = lerp(1, .88, bd); c.scale(s, s); figure(PA.street, { walk: (w > 0 && bd < 1) ? 1 : 0, ph: tc * 12 * .9, expr: 'neutral' }); c.restore(); };
  c.save(); c.translate(bx, 1668 + bob); c.scale(.96, .96); bus({ door, wheelA: -bx / 50, inDoor: inside ? () => { c.save(); c.beginPath(); c.rect(104, -352, 100, 300); c.clip(); c.setTransform(1, 0, 0, 1, 0, 0); arj(); c.restore(); tintCels; } : null }); c.restore();
  flush();
  e.save(); e.translate(bx, 1668 + bob); e.scale(.96, .96); busGlow({ door, head: 1 }); e.restore();
  if (moving) flare(e, bx + 10 - offX + offX, 1668 - 119, .5 + .5 * (1 - bk), '#ffe8b0', { streak: 500, ghosts: false });
  // wet reflection of the bus lights on the road
  both((ctx, em) => { ctx.save(); ctx.globalCompositeOperation = 'lighter'; for (const wx of BWIN) { const gr = ctx.createLinearGradient(0, 1672, 0, 1900); gr.addColorStop(0, rgba('#bff0d0', em ? .16 : .2)); gr.addColorStop(1, rgba('#bff0d0', 0)); ctx.fillStyle = gr; ctx.fillRect(bx + wx * .96 + 6, 1672, 84, 230); } ctx.restore(); });
  if (!inside) arj();
  stopSign(300, 1830);
  flush();
  uncam(); rainFx(Math.floor(lt * 12), .28);
  return { tint: [.98, .97, 1.04], bloom: .9 };
};
