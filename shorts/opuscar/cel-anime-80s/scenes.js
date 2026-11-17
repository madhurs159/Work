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
    else { ctx.strokeStyle = rgba(col, .55); ctx.lineWidth = size * .1; ctx.strokeText(txt, x, y); }
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
  const [bc, b] = canvas(Wp, Hp), [bec, be] = canvas(Wp, Hp), R = rng(seed); let nb = 0;
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
    const ncol = NEONC[Math.floor(R() * NEONC.length)], txt = SIGNW[(seed + nb++) % SIGNW.length], sgy = sy - 92;
    b.font = '76px Rozha'; const sw = Math.min(w - 30, b.measureText(txt).width + 70);
    b.fillStyle = '#120b1e'; b.fillRect(x + (w - sw) / 2, sgy - 54, sw, 104); b.strokeStyle = rgba(ncol, .9); b.lineWidth = 5; b.strokeRect(x + (w - sw) / 2 + 8, sgy - 46, sw - 16, 88); be.strokeStyle = rgba(ncol, .7); be.lineWidth = 5; be.strokeRect(x + (w - sw) / 2 + 8, sgy - 46, sw - 16, 88);
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

// ================= bus interior, looking down the aisle (one-point perspective, painted per frame) =================
const VX = 540, VY = 780, WALL = 640, FLOOR = 900, CEIL = -640, SILL = 170, WTOP = -340, STP = 130, CUSH = 520, ZF = 3.8;
const PX = (u, z) => VX + u / z, PY = (v, z) => VY + v / z;
function quad(ctx, pts, fill) { ctx.beginPath(); pts.forEach(([u, v, z], i) => ctx[i ? 'lineTo' : 'moveTo'](PX(u, z), PY(v, z))); ctx.closePath(); if (fill) { ctx.fillStyle = fill; ctx.fill(); } }
function seatRow(z, s, lit = 1) {
  const xa = PX(s * 205, z), xb = PX(s * 615, z), ya = PY(STP, z), yb = PY(CUSH + 30, z), x0 = Math.min(xa, xb), w = Math.abs(xb - xa);
  quad(g, [[s * 205, CUSH, z], [s * 615, CUSH, z], [s * 615, CUSH, z - .3], [s * 205, CUSH, z - .3]], mix('#0c1a24', '#3a98a4', lit));
  quad(g, [[s * 205, CUSH, z - .3], [s * 615, CUSH, z - .3], [s * 615, CUSH + 90, z - .3], [s * 205, CUSH + 90, z - .3]], mix('#081218', '#1c5562', lit));
  g.strokeStyle = '#0a1820'; g.lineWidth = 8 / z; g.beginPath(); g.moveTo(PX(s * 260, z - .25), PY(CUSH + 90, z - .25)); g.lineTo(PX(s * 260, z - .25), PY(FLOOR, z - .25)); g.stroke();
  const R = rrp(x0, ya, w, yb - ya, 34 / z), gr = g.createLinearGradient(0, ya, 0, yb); gr.addColorStop(0, mix('#0c1a24', '#3f9aa4', lit)); gr.addColorStop(.25, mix('#0c1a24', '#2f808a', lit)); gr.addColorStop(1, mix('#081218', '#1a4c5a', lit));
  g.fillStyle = gr; g.fill(R); g.strokeStyle = '#0a2630'; g.lineWidth = 5 / z; g.stroke(R);
  g.beginPath(); g.moveTo(x0 + w / 2, ya + 10 / z); g.lineTo(x0 + w / 2, yb); g.stroke();
  g.fillStyle = rgba('#bff4ee', .25 * lit); g.fillRect(x0 + 16 / z, ya + 8 / z, w - 32 / z, 8 / z);
  g.strokeStyle = mix('#3a4858', '#d0e0f0', lit); g.lineWidth = 9 / z; g.lineCap = 'round'; g.beginPath(); g.moveTo(PX(s * 205, z), PY(STP + 70, z)); g.lineTo(PX(s * 205, z), PY(STP - 46, z)); g.lineTo(PX(s * 330, z), PY(STP - 46, z)); g.lineTo(PX(s * 330, z), PY(STP + 6, z)); g.stroke();
}
// o: t, variant 'back'|'front', tube(j)->0..1, speed
function aisle(o) {
  const t = o.t, zN = .7, tube = o.tube || (() => 1), fr = o.variant === 'front';
  const x0 = PX(-WALL, ZF), x1 = PX(WALL, ZF), y0 = PY(CEIL, ZF), y1 = PY(FLOOR, ZF);
  vgrad(g, x0, y0, x1 - x0, y1 - y0, [[0, '#24424e'], [1, '#10242e']]);
  if (!fr) { const wx = PX(-480, ZF), ww = PX(480, ZF) - wx, wy = PY(-340, ZF), wh = PY(40, ZF) - wy;
    vgrad(g, wx, wy, ww, wh, [[0, '#07061c'], [1, '#2a1650']]);
    for (let k = 0; k < 5; k++) { const zz = (k / 5 + t * .22) % 1, x = VX + (k % 2 ? 1 : -1) * (90 - 70 * zz), y = wy + wh * (.85 - .5 * zz), col = k % 2 ? '#ffb060' : '#ff4050'; both((ctx, em) => airbrush(ctx, x, y, 16 * (1 - zz) + 3, 16 * (1 - zz) + 3, col, em ? .8 : .9)); }
    g.strokeStyle = '#9fb8c8'; g.lineWidth = 3; g.strokeRect(wx, wy, ww, wh);
  } else { const wx = PX(-580, ZF), ww = PX(580, ZF) - wx, wy = PY(-400, ZF), wh = PY(140, ZF) - wy;
    vgrad(g, wx, wy, ww, wh, [[0, '#07061c'], [.6, '#1e1448'], [1, '#141030']]);
    for (let k = 0; k < 4; k++) { const zz = (k / 4 + t * .3) % 1, x = VX - 30 + (k % 2 ? 70 : -80) * zz * 1.6, y = wy + wh * (.42 + .4 * zz), col = k % 2 ? '#ffc070' : '#fff0d0'; both((ctx, em) => airbrush(ctx, x, y, 22 * zz + 3, 22 * zz + 3, col, em ? .8 : .9)); }
    g.strokeStyle = '#9fb8c8'; g.lineWidth = 3; g.strokeRect(wx, wy, ww, wh); g.beginPath(); g.moveTo(VX, wy); g.lineTo(VX, wy + wh); g.stroke();
    g.fillStyle = '#0c1820'; g.fillRect(PX(120, ZF), PY(140, ZF), PX(640, ZF) - PX(120, ZF), PY(FLOOR, ZF) - PY(140, ZF)); g.fillRect(PX(-640, ZF), PY(240, ZF), PX(120, ZF) - PX(-640, ZF), PY(FLOOR, ZF) - PY(240, ZF));
    g.beginPath(); g.ellipse(PX(380, ZF), PY(-90, ZF), 22, 26, 0, 0, TAU); g.fill(); g.fillRect(PX(280, ZF), PY(-10, ZF), 56, 60); g.fillRect(PX(250, ZF), PY(-200, ZF), PX(520, ZF) - PX(250, ZF), 10);
    both((ctx, em) => { for (let k = 0; k < 3; k++) airbrush(ctx, PX(-420 + k * 90, ZF), PY(190, ZF), 7, 7, ['#4dff9a', '#ffb040', '#ff4050'][k], .9); });
  }
  // ceiling
  quad(g, [[-WALL, CEIL, zN], [WALL, CEIL, zN], [WALL, CEIL, ZF], [-WALL, CEIL, ZF]], '#2a3e54'); quad(g, [[-250, CEIL, zN], [250, CEIL, zN], [250, CEIL, ZF], [-250, CEIL, ZF]], '#38526a');
  // walls + windows
  for (const s of [-1, 1]) {
    quad(g, [[s * WALL, CEIL, zN], [s * WALL, CEIL, ZF], [s * WALL, WTOP, ZF], [s * WALL, WTOP, zN]], '#3c6c76');
    quad(g, [[s * WALL, WTOP, zN], [s * WALL, WTOP, ZF], [s * WALL, SILL, ZF], [s * WALL, SILL, zN]], '#31606a');
    quad(g, [[s * WALL, SILL, zN], [s * WALL, SILL, ZF], [s * WALL, FLOOR, ZF], [s * WALL, FLOOR, zN]], '#254a56');
    quad(g, [[s * WALL, FLOOR - 160, zN], [s * WALL, FLOOR - 160, ZF], [s * WALL, FLOOR, ZF], [s * WALL, FLOOR, zN]], '#18323c');
    for (let i = 0; i < 6; i++) { const z0 = .62 + i * .58 - .58, z1 = z0 + .46; if (z1 < zN) continue; const za = Math.max(z0, zN), zc = (z0 + z1) / 2;
      const pts = [[s * WALL, WTOP + 30, za], [s * WALL, WTOP + 30, z1], [s * WALL, SILL - 20, z1], [s * WALL, SILL - 20, za]];
      quad(g, pts, '#0b0924'); let I = 0;
      for (let k = 0; k < 3; k++) { const zl = fr ? 4.6 - ((k * 1.5 + t * (o.speed || 1.9) + (s > 0 ? .7 : 0)) % 4.5) : .2 + ((k * 1.5 + t * (o.speed || 1.9) + (s > 0 ? .7 : 0)) % 4.5); I += Math.max(0, 1 - Math.abs(zl - zc) / .42); }
      I = Math.min(1, I); const col = (i + (s > 0 ? 1 : 0)) % 3 ? '#ffc070' : '#ff7ab0';
      if (I > 0) { g.save(); g.globalCompositeOperation = 'lighter'; quad(g, pts, rgba(col, I * .75)); quad(g, [[s * WALL, FLOOR, za], [s * WALL, FLOOR, z1], [s * 190, FLOOR, z1], [s * 190, FLOOR, za]], rgba(col, I * .12)); g.restore(); quad(e, pts, rgba(col, I * .5)); }
      quad(g, pts); g.strokeStyle = '#9fb8c8'; g.lineWidth = 5 / za; g.stroke();
    }
    g.strokeStyle = '#c8d8e8'; g.lineWidth = 3; g.beginPath(); g.moveTo(PX(s * 430, zN), PY(-500, zN)); g.lineTo(PX(s * 430, ZF), PY(-500, ZF)); g.stroke();
    for (let k = 0; k < 9; k++) { const z = .95 + k * .33, sw = Math.sin(st12(t) * 5 + k * 1.7) * 14, xa = PX(s * 430, z), ya = PY(-500, z), xb = PX(s * 430 + sw, z), yb = PY(-390, z);
      g.strokeStyle = '#d8c060'; g.lineWidth = 7 / z; g.beginPath(); g.moveTo(xa, ya); g.lineTo(xb, yb); g.stroke(); g.lineWidth = 9 / z; g.beginPath(); g.arc(xb + sw * .2 / z, yb + 34 / z, 30 / z, 0, TAU); g.stroke(); }
  }
  // floor
  quad(g, [[-WALL, FLOOR, zN], [WALL, FLOOR, zN], [WALL, FLOOR, ZF], [-WALL, FLOOR, ZF]], '#141a2a'); quad(g, [[-185, FLOOR, zN], [185, FLOOR, zN], [185, FLOOR, ZF], [-185, FLOOR, ZF]], '#222c42');
  g.strokeStyle = rgba('#000000', .35); g.lineWidth = 2; for (let z = .8; z < ZF; z += .16) { g.beginPath(); g.moveTo(PX(-185, z), PY(FLOOR, z)); g.lineTo(PX(185, z), PY(FLOOR, z)); g.stroke(); }
  // fluorescent tubes (backlit)
  for (let j = 0; j < 5; j++) { const z0 = .9 + j * .6, z1 = z0 + .4, on = tube(j), pts = [[-34, CEIL + 6, z0], [34, CEIL + 6, z0], [34, CEIL + 6, z1], [-34, CEIL + 6, z1]];
    quad(g, pts, mix('#3a4a58', '#f0fff4', on)); quad(e, pts, rgba('#d8fff0', .9 * on)); }
  if (!fr) { // back bench
    const z = ZF - .03, R = rrp(PX(-615, z), PY(STP, z), PX(615, z) - PX(-615, z), PY(CUSH + 30, z) - PY(STP, z), 10); vgrad(g, PX(-615, z), PY(STP, z), 400, PY(CUSH + 30, z) - PY(STP, z), [[0, '#2f808a'], [1, '#1a4c5a']]); g.fill(R); g.strokeStyle = '#0a2630'; g.lineWidth = 2; g.stroke(R);
    quad(g, [[-615, CUSH, z], [615, CUSH, z], [615, CUSH, z - .32], [-615, CUSH, z - .32]], '#3a98a4'); quad(g, [[-615, CUSH, z - .32], [615, CUSH, z - .32], [615, CUSH + 90, z - .32], [-615, CUSH + 90, z - .32]], '#1c5562');
  }
}
function aisleSeats(zs) { for (const z of zs) for (const s of [-1, 1]) seatRow(z, s); for (const z of [2.75, 1.65]) for (const s of [-1, 1]) { g.strokeStyle = '#c8d8e8'; g.lineWidth = 8 / z; g.beginPath(); g.moveTo(PX(s * 205, z), PY(STP - 46, z)); g.lineTo(PX(s * 205, z), PY(-560, z)); g.stroke(); } }
// tiny old woman on the back bench (front view)
function oldFar(P, z, lookUp = 0) {
  const s = 1.1 / z; c.save(); c.translate(PX(0, z), PY(-80, z)); c.scale(s, s); LWK.k = 1.7;
  c.save(); c.beginPath(); c.rect(-300, -200, 600, 660); c.clip(); head(c, P, { kind: 'old', view: 'front', expr: 'neutral', E: { lid: .35 - lookUp * .3, open: .8 + lookUp * .2, mouth: lookUp > .5 ? 'smile' : 'closed' } }); c.restore();
  for (const sx of [-40, 40]) { const fp = new Path2D(); fp.ellipse(sx, 884, 34, 14, 0, 0, TAU); c.fillStyle = P.border.s; c.fill(fp); }
  cel(c, [[-150, 440, 1], [150, 440, 1], [158, 520], [104, 878, 1], [-104, 878, 1], [-158, 520]], { f: P.sari.f, s: P.sari.s, so: [-14, -10], l: P.sari.l, lw: LW, clipFn: gg => { gg.strokeStyle = P.sari.l; gg.lineWidth = 2; for (let i = -2; i <= 2; i++) { gg.beginPath(); gg.moveTo(i * 50, 560); gg.lineTo(i * 44, 880); gg.stroke(); } gg.fillStyle = P.border.f; gg.fillRect(-200, 850, 400, 30); } });
  for (const sx of [-34, 30]) { const hp = new Path2D(); hp.ellipse(sx, 462, 34, 24, 0, 0, TAU); cel(c, hp, { f: P.skin.f, s: P.skin.s, so: [-6, -4], l: P.skin.l, lw: LS }); }
  LWK.k = 1; c.restore();
}
// conductor seen from behind, walking away. origin = feet, 400 units tall
function condBack(P, ph) {
  const sw = Math.sin(ph) * 16;
  for (const sx of [-1, 1]) cel(c, limb([sx * 24, -196], [sx * 26 + sx * sw * .3, -4 - Math.max(0, sx * Math.sin(ph)) * 16], 46, 34), { f: sx < 0 ? P.pants.s : P.pants.f, s: P.pants.s, so: [-6, 0], l: P.pants.l, lw: 2.4 });
  for (const sx of [-1, 1]) { cel(c, limb([sx * 62, -322], [sx * 70, -236 + sx * sw * .4], 34, 30), { f: P.jacket.f, s: P.jacket.s, so: [-5, 0], l: P.jacket.l, lw: 2.4 }); cel(c, limb([sx * 70, -236 + sx * sw * .4], [sx * 68, -176 + sx * sw * .6], 24, 22), { f: P.skin.f, s: P.skin.s, so: [-4, 0], l: P.skin.l, lw: 2 }); }
  cel(c, [[-62, -332, 1], [-40, -348], [40, -348], [62, -332, 1], [54, -186, 1], [-54, -186, 1]], { f: P.jacket.f, s: P.jacket.s, so: [-14, -4], h: P.jacket.h, ho: [4, 3], l: P.jacket.l, lw: 2.6, clipFn: gg => { gg.fillStyle = P.strap.f; gg.fill(poly([[-58, -340], [-40, -348], [52, -200], [38, -190]])); gg.fillStyle = P.pants.s; gg.fillRect(-70, -200, 140, 14); } });
  cel(c, poly([[34, -214], [78, -220], [82, -160], [36, -156]]), { f: P.strap.f, s: P.strap.s, so: [-6, -4], l: P.strap.l, lw: 2.4 });
  cel(c, poly([[-13, -356], [13, -356], [15, -340], [-15, -340]]), { f: P.skin.s, l: P.skin.l, lw: 2 });
  for (const sx of [-1, 1]) { const ep = new Path2D(); ep.ellipse(sx * 31, -378, 6, 10, 0, 0, TAU); cel(c, ep, { f: P.skin.f, l: P.skin.l, lw: 1.8 }); }
  const hp = new Path2D(); hp.ellipse(0, -380, 30, 34, 0, 0, TAU); cel(c, hp, { f: P.hair.f, s: P.hair.s, so: [-8, -6], l: P.hair.l, lw: 2.2, clipFn: gg => { gg.fillStyle = P.skin.f; gg.fillRect(-40, -356, 80, 20); } });
  cel(c, [[-36, -388, 1], [-38, -410], [-18, -424], [18, -424], [38, -410], [36, -388, 1]], { f: P.cap.f, s: P.cap.s, so: [-8, -5], h: P.cap.h, ho: [3, 2], l: P.cap.l, lw: 2.6 });
  cel(c, poly([[-36, -392], [36, -392], [36, -382], [-36, -382]]), { f: P.cap.s, l: P.cap.l, lw: 2 });
}
// Arjun's arm with the banknote. local = head units of his bust; a = raise 0..1
function banknote(P, x, y, rot, t) {
  c.save(); c.translate(x, y); c.rotate(rot);
  const R = rrp(-36, -150, 76, 150, 4); cel(c, R, { f: '#cdbcea', s: '#9a86c8', so: [-6, 0], l: '#4a3a78', lw: LW,
    clipFn: gg => { gg.strokeStyle = '#7a5aa8'; gg.lineWidth = 2.5; gg.strokeRect(-29, -143, 62, 136); gg.fillStyle = '#b89ad8'; gg.beginPath(); gg.ellipse(2, -78, 17, 24, 0, 0, TAU); gg.fill(); gg.fillStyle = '#5a3a88'; gg.font = '800 24px Mukta'; gg.textAlign = 'center'; gg.textBaseline = 'middle'; gg.fillText('10', 2, -126); gg.fillText('10', 2, -24);
      const hx = ((t * .9) % 1.6 - .3) * 200 - 150; gg.fillStyle = rgba('#ffffff', .55); gg.beginPath(); gg.moveTo(-60, hx); gg.lineTo(60, hx - 40); gg.lineTo(60, hx - 14); gg.lineTo(-60, hx + 26); gg.fill(); } });
  c.restore();
}
function armNote(P, a, t, jit = 0) {
  const J = P.jacket, sh = [124, 222], el = [lerp(156, 196, a), lerp(392, 318, a)], hd = [lerp(110, 262, a) + jit, lerp(540, 168, a) + jit * .6];
  const st = { f: J.f, s: J.s, so: [-10, -4], h: J.h, ho: [3, 3], l: J.l, lw: LW * 1.1 };
  cel(c, limb(sh, el, 70, 60), st); cel(c, limb(el, hd, 58, 44), st);
  const dx = hd[0] - el[0], dy = hd[1] - el[1], d = Math.hypot(dx, dy), ux = dx / d, uy = dy / d;
  cel(c, limb([hd[0] - ux * 14, hd[1] - uy * 14], [hd[0] + ux * 4, hd[1] + uy * 4], 50, 48), { f: P.stripe.f, s: P.stripe.s, so: [-6, 0], l: P.stripe.l, lw: LW });
  banknote(P, hd[0] + ux * 34, hd[1] + uy * 34 - 6, .22 + jit * .01, t);
  cel(c, limb([hd[0] + ux * 10, hd[1] + uy * 10], [hd[0] + ux * 40, hd[1] + uy * 40], 40, 42), { f: P.skin.f, s: P.skin.s, so: [-7, -3], h: P.skin.h, l: P.skin.l, lw: LS });
  const tx = hd[0] + ux * 40, ty = hd[1] + uy * 40; cel(c, limb([tx - 4, ty - 14], [tx + 18, ty - 28], 15, 13), { f: P.skin.f, l: P.skin.l, lw: LS });
  for (let k = 0; k < 3; k++) line(c, [[tx - uy * (-12 + k * 12) - ux * 4, ty + ux * (-12 + k * 12) - uy * 4], [tx - uy * (-12 + k * 12) + ux * 12, ty + ux * (-12 + k * 12) + uy * 12]], P.skin.l, LS * .9);
}

// ---------- 2. inside: over Arjun's shoulder, the empty aisle; the rear tube stutters on and she is there ----------
SCENES.inside = S => {
  const { t, lt, d } = S, tc = st12(lt), k = eio(prog(lt, 1.3, 3.5)), s = lerp(1, 1.85, k);
  const on = lt < 1.9 ? 0 : lt < 2.6 ? (hash(Math.floor(lt * 12) * 3.1) > .45 ? 1 : .1) : (hash(Math.floor(lt * 12) * 1.7) > .06 ? 1 : .55);
  cam(s, VX, VY + 20, 540, lerp(VY + 20, 900, k));
  aisle({ t, variant: 'back', tube: j => j >= 3 ? on : (hash(Math.floor(lt * 12) + j * 9) > .04 ? 1 : .7) });
  oldFar(PO.bus, ZF - .2, prog(lt, 3.6, .3));
  if (on < 1) tintCels('#060a18', .8 * (1 - on));
  flush();
  if (on < 1) { g.fillStyle = rgba('#04060e', .62 * (1 - on)); g.fillRect(PX(-WALL, 2.9), PY(CEIL, 2.9), PX(WALL, 2.9) - PX(-WALL, 2.9), PY(FLOOR, 2.9) - PY(CEIL, 2.9)); }
  aisleSeats([3.3, 2.75, 2.2, 1.65, 1.1]);
  uncam();
  // foreground: back of Arjun's head (multiplane: leaves frame as the camera pushes past)
  c.save(); c.translate(250 - 330 * k, 1545 + 520 * k); c.scale(2.5 * (1 + .5 * k), 2.5 * (1 + .5 * k)); c.rotate(-.04 + Math.sin(tc * 2) * .015); backHead(c, PA.bus, { rim: { c: '#9ff4e0', d: [3, 2.5] } }); c.restore();
  lband(1500 - ((t * 900) % 3000), 200, '#ffd9a0', .2);
  flush();
  return { tint: [.95, 1.0, .99], shadowTint: [.06, .12, .2], bloom: .8 };
};

// ================= side-on interior (far wall, windows with sliding lights, far seats) =================
function sideInt(o) {
  const t = o.t, fl = o.flick ?? 1, sp = o.speed ?? 1000;
  vgrad(g, -500, -200, 2100, 460, [[0, '#1c2c40'], [1, '#3a5670']]);
  g.fillStyle = mix('#4a6070', '#f0fff4', fl); g.fillRect(-500, 196, 2100, 26); e.fillStyle = rgba('#d8fff0', .85 * fl); e.fillRect(-500, 196, 2100, 26); g.fillStyle = '#16242f'; g.fillRect(-500, 222, 2100, 9);
  vgrad(g, -500, 231, 2100, 790, [[0, '#4f9092'], [1, '#37707a']]); vgrad(g, -500, 1020, 2100, 1100, [[0, '#2c5866'], [1, '#143440']]);
  g.fillStyle = '#b8ccd8'; g.fillRect(-500, 1010, 2100, 10); g.fillStyle = '#5a7080'; g.fillRect(-500, 1020, 2100, 4);
  for (let i = -1; i < 4; i++) { const x = i * 540 - 120, R = rrp(x, 350, 450, 570, 42);
    for (const [ctx, kk] of [[g, 'c'], [e, 'e']]) { ctx.save(); ctx.clip(R); const off = ((t * sp + i * 540) % A.strip.w + A.strip.w) % A.strip.w; ctx.globalAlpha = kk === 'e' ? .8 : 1; ctx.drawImage(A.strip[kk], off - A.strip.w + x, 350, A.strip.w, 570); ctx.drawImage(A.strip[kk], off + x, 350, A.strip.w, 570);
      if (kk === 'c') { ctx.globalAlpha = .07; ctx.fillStyle = '#ffffff'; ctx.beginPath(); ctx.moveTo(x + 250, 350); ctx.lineTo(x + 340, 350); ctx.lineTo(x + 140, 920); ctx.lineTo(x + 50, 920); ctx.fill(); ctx.beginPath(); ctx.moveTo(x + 370, 350); ctx.lineTo(x + 400, 350); ctx.lineTo(x + 200, 920); ctx.lineTo(x + 170, 920); ctx.fill(); }
      ctx.restore(); }
    g.strokeStyle = '#b8ccd8'; g.lineWidth = 13; g.stroke(R); g.strokeStyle = '#1a2c3a'; g.lineWidth = 4; g.stroke(rrp(x + 8, 358, 434, 554, 36)); g.strokeStyle = rgba('#ffffff', .5); g.lineWidth = 2; g.stroke(rrp(x - 4, 346, 458, 578, 46));
    g.fillStyle = '#b8ccd8'; g.fillRect(x + 190, 628, 70, 12); }
  g.fillStyle = '#c8d8e8'; g.fillRect(-500, 286, 2100, 9); g.fillStyle = '#5a7080'; g.fillRect(-500, 295, 2100, 3);
  for (let k = -1; k < 6; k++) { const x = k * 290 + 60, sw = Math.sin(st12(t) * 5 + k * 1.9) * 9; g.strokeStyle = '#d8c060'; g.lineWidth = 8; g.beginPath(); g.moveTo(x, 292); g.lineTo(x + sw, 384); g.stroke(); g.lineWidth = 9; g.beginPath(); g.arc(x + sw * 1.3, 414, 30, 0, TAU); g.stroke(); }
  for (let i = -1; i < 5; i++) { const x = i * 330 + (o.sx || 0) - 40, R = rrp(x, 1050, 280, 900, 38), gr = g.createLinearGradient(0, 1050, 0, 1700); gr.addColorStop(0, '#3a929c'); gr.addColorStop(.2, '#2f808a'); gr.addColorStop(1, '#184654');
    g.fillStyle = gr; g.fill(R); g.strokeStyle = '#0a2630'; g.lineWidth = 5; g.stroke(R); g.beginPath(); g.moveTo(x + 140, 1062); g.lineTo(x + 140, 1920); g.stroke(); g.fillStyle = rgba('#bff4ee', .25); g.fillRect(x + 22, 1060, 236, 9);
    g.strokeStyle = '#d0e0f0'; g.lineWidth = 10; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 40, 1070); g.lineTo(x + 40, 1012); g.lineTo(x + 240, 1012); g.lineTo(x + 240, 1070); g.stroke(); }
}
function nearSeat(x, y, w) {   // the seat Arjun sits on (cel: must cover what is behind him)
  cel(c, rrp(x, y, w, 1100, 44), { f: '#2f808a', s: '#1c5562', so: [-18, -14], h: '#62b8be', ho: [6, 5], l: '#0a2630', lw: 4 });
  c.strokeStyle = '#d0e0f0'; c.lineWidth = 12; c.lineCap = 'round'; c.beginPath(); c.moveTo(x + 40, y + 20); c.lineTo(x + 40, y - 42); c.lineTo(x + w - 40, y - 42); c.lineTo(x + w - 40, y + 20); c.stroke();
}
function condArm(P) {   // conductor's near arm with ticket book (local head units, facing right)
  cel(c, limb([-24, 220], [-6, 400], 72, 60), { f: P.jacket.f, s: P.jacket.s, so: [-10, -4], h: P.jacket.h, ho: [3, 3], l: P.jacket.l, lw: LW * 1.1 });
  cel(c, limb([-6, 400], [10, 560], 46, 38), { f: P.skin.f, s: P.skin.s, so: [-8, -3], l: P.skin.l, lw: LS });
  cel(c, [[-96, 520], [-10, 506], [4, 600], [-20, 660], [-90, 664], [-110, 590]], { f: P.strap.f, s: P.strap.s, so: [-10, -8], h: P.strap.h, ho: [3, 3], l: P.strap.l, lw: LW * 1.2 });
}
function hSpeed(drawing, a = .5, col = '#bfe6ff') { speedLines(g, drawing, { type: 'h', col, a, n: 80, hmax: 9 }); }

// ---------- 3. the conductor walks through; Arjun holds out the note; he never looks ----------
SCENES.cond = S => {
  const { t, lt, d } = S, tc = st12(lt), t8 = st8(lt), P = PA.bus;
  cam(1 + .05 * prog(lt, 0, d), 540, 960, 540 - 14 * prog(lt, 0, d), 960);
  sideInt({ t, sx: 20 });
  const cx = lerp(1340, -340, prog(tc, .1, 5.0)), bob = -Math.abs(Math.sin(tc * 12 * .5)) * 14;
  c.save(); c.translate(cx, 610 + bob); c.scale(-1.74, 1.74); head(c, PC.bus, { kind: 'cond', view: 'side', E: { open: .5, lid: .35, mouth: 'set' } }); condArm(PC.bus); c.restore();
  lband(1500 - ((t * 1000) % 2600), 190, '#ffd9a0', .24);
  flush();
  // Arjun, seated, bust
  const a = eo(prog(tc, 1.25, .5)), passed = cx < 330, late = prog(tc, 4.2, .5);
  nearSeat(40, 1130, 330);
  let E, expr;
  if (!passed) { expr = lt < 1.2 ? 'neutral' : 'smileopen'; E = { look: [.75, -.55], brow: [-6, -5, 4.5] }; if (lt >= 1.2) E.mouth = (lt > 1.7 && lt < 2.9) ? (Math.floor(t8 * 8) % 2 ? 'talk' : 'smileopen') : 'smile'; }
  else { const q = late > 0 ? 2 : cx < 140 ? 1 : 0; expr = q === 0 ? 'surprised' : q === 1 ? 'confused' : 'hurt'; E = { look: [.7, q === 2 ? -.15 : -.5], iris: q ? .85 : .72 }; }
  if (Math.floor(tc * 12) % 41 === 20) E.open = 0;
  c.save(); c.translate(380, 1075); c.scale(2.0, 2.0); head(c, P, { kind: 'arjun', view: 'q', expr, E, flipHead: passed ? 22 : 0 });
  armNote(P, a * (1 - .12 * late), t, passed ? Math.round(Math.sin(tc * 40) * 2) : 0); c.restore();
  lband(1100 - ((t * 1000) % 2600), 190, '#ffd9a0', .14);
  flush();
  uncam();
  return { tint: [.96, 1.0, .98], shadowTint: [.06, .12, .2], bloom: .75 };
};

// ---------- 4. the call: "bhaiya, ticket!" (speed-line shout), then the aisle, his back, no answer ----------
SCENES.call = S => {
  const { t, lt, d, L } = S, tc = st12(lt), t8 = st8(lt), cs = chunks(L), s0 = L.start - .3, shA = cs[1].s - s0, shB = cs[2].e - s0, cut = cs[3].s - s0 - .08, P = PA.bus;
  if (lt < cut) {
    const shout = lt >= shA && lt < shB + .1;
    cam(1.25 + .05 * prog(lt, 0, cut), 500, 900);
    sideInt({ t, sx: -60 });
    if (shout) { uncam(); g.fillStyle = rgba('#0a1040', .72); g.fillRect(0, 0, W, H); hSpeed(Math.floor(lt * 12), .55); e.fillStyle = rgba('#3050c0', .12); e.fillRect(0, 0, W, H); }
    uncam();
    const rise = eo(prog(tc, shA - .25, .3)), jx = shout ? Math.round((hash(tc * 12) - .5) * 8) : 0;
    c.save(); c.translate(610 + jx, 1010 - rise * 70); c.scale(-2.9, 2.9);
    const E = shout ? { ...EXPR.shout, mouth: Math.floor(t8 * 8) % 2 ? 'scream' : 'pant', look: [.6, -.2] } : lt < shA ? { ...EXPR.hurt, look: [.6, -.3], mouth: 'wavy' } : { ...EXPR.fear, look: [.6 + .12 * Math.sin(tc * 50), -.2], gloom: .5 };
    head(c, P, { kind: 'arjun', view: 'q', expr: 'neutral', E }); armNote(P, .82 + .1 * rise, t, shout ? jx * .3 : 0); c.restore();
    lband(1300 - ((t * 1000) % 2600), 200, '#ffd9a0', .2);
    flush();
    return { tint: [.96, 1.0, .98], shadowTint: [.06, .12, .2], bloom: .75 };
  }
  // shot B: he walks on
  const u = lt - cut, k = prog(u, 0, d - cut), fl = j => (hash(Math.floor(lt * 12) * 2.3 + j * 5) > .22 ? 1 : .25);
  cam(1.3 + .12 * k, VX, VY + 60, 540, 900);
  aisle({ t, variant: 'front', tube: fl, speed: 1.9 });
  aisleSeats([3.3, 2.75]);
  const z = lerp(2.05, 2.5, k), sc2 = 1380 / 400 / z;
  c.save(); c.translate(PX(0, z), PY(FLOOR, z) - Math.abs(Math.sin(tc * 12 * .5)) * 6); c.scale(sc2, sc2); condBack(PC.bus, tc * 12 * .5); c.restore();
  lband(1500 - ((t * 900) % 2400), 160, '#ffd9a0', .2);
  flush();
  aisleSeats([2.2 - .35, 1.3]);
  uncam();
  c.save(); c.translate(130, 960); c.scale(2.6, 2.6); armNote(P, .9, t, Math.round(Math.sin(tc * 30) * 3)); c.restore();
  flush();
  return { tint: [.93, .99, 1.0], shadowTint: [.05, .1, .2], bloom: .8, flick: .05 };
};

// ---------- 5. the old woman laughs; colour model turns cold; "he cannot see us" ----------
function backWall(t, fl, dark = 0) {
  vgrad(g, -300, -200, 1700, 2400, [[0, '#16283a'], [.45, '#24444e'], [1, '#0e2028']]);
  g.fillStyle = mix('#3a4a58', '#f0fff4', fl); g.fillRect(240, 150, 600, 26); e.fillStyle = rgba('#d8fff0', .85 * fl); e.fillRect(240, 150, 600, 26);
  const R = rrp(80, 330, 920, 520, 44); g.save(); g.clip(R); vgrad(g, 80, 330, 920, 520, [[0, '#07061c'], [.7, '#2a1650'], [1, '#3a1c5c']]);
  g.fillStyle = '#0c0a22'; g.beginPath(); g.moveTo(540, 600); g.lineTo(1100, 850); g.lineTo(-20, 850); g.fill(); g.restore();
  e.save(); e.clip(R); g.save(); g.clip(R);
  for (let k = 0; k < 8; k++) { const zz = (k / 8 + t * .16) % 1, sd = k % 2 ? 1 : -1, x = 540 + sd * (60 + 420 * (1 - zz)), y = 600 - 230 * (1 - zz) * (k % 4 < 2 ? 1 : .2) + 40 * (1 - zz), r = 44 * (1 - zz) + 5, col = k % 4 < 2 ? '#ffb060' : (k % 4 === 2 ? '#ff4060' : '#35e7ff');
    airbrush(g, x, y, r, r, col, .85); airbrush(g, x, y, r * .4, r * .4, '#ffffff', .7); airbrush(e, x, y, r * 1.3, r * 1.3, col, .7); }
  g.restore(); e.restore();
  g.strokeStyle = '#b8ccd8'; g.lineWidth = 14; g.stroke(R); g.strokeStyle = '#1a2c3a'; g.lineWidth = 4; g.stroke(rrp(89, 339, 902, 502, 38));
  const B = rrp(-200, 1210, 1480, 1000, 70), gr = g.createLinearGradient(0, 1210, 0, 1900); gr.addColorStop(0, '#3a929c'); gr.addColorStop(.15, '#2f808a'); gr.addColorStop(1, '#143c48'); g.fillStyle = gr; g.fill(B); g.strokeStyle = '#0a2630'; g.lineWidth = 6; g.stroke(B);
  g.fillStyle = rgba('#bff4ee', .22); g.fillRect(-200, 1222, 1480, 10); for (const x of [200, 880]) { g.beginPath(); g.moveTo(x, 1224); g.lineTo(x, 1920); g.stroke(); }
  if (dark) { g.fillStyle = rgba('#03040e', dark); g.fillRect(-300, -200, 1700, 2400); }
}
SCENES.woman = S => {
  const { t, lt, d, L } = S, tc = st12(lt), t8 = st8(lt), cs = chunks(L), s0 = L.start - .3, cut = cs[1].s - s0 - .05, sp0 = cs[2].s - s0, sp1 = L.end - s0;
  if (lt < cut) {   // laughing, eyes shut
    const fr = Math.floor(t8 * 8), k = prog(lt, 0, cut);
    cam(1 + .06 * k, 540, 900);
    backWall(t, hash(Math.floor(lt * 12) * 1.3) > .12 ? 1 : .5);
    c.save(); c.translate(540, 930 + (fr % 2 ? -10 : 0)); c.scale(2.25, 2.25); c.rotate(fr % 2 ? -.03 : .01);
    head(c, PO.bus, { kind: 'old', view: 'q', expr: 'smileopen', E: { open: 0, mouth: lt < .25 ? 'smile' : fr % 2 ? 'grin' : 'smileopen', shoulders: fr % 2 ? -12 : 0, brow: [-3, 1, 3] } }); c.restore();
    lband(1500 - ((t * 900) % 2600), 200, '#ffd9a0', .18);
    flush(); uncam();
    return { tint: [.96, 1.0, .98], shadowTint: [.06, .12, .2], bloom: .75 };
  }
  // cold close-up, eyes open and lit from inside
  const u = lt - cut, k = prog(u, 0, d - cut), sc2 = lerp(3.9, 4.5, eio(k)), speaking = lt > sp0 && lt < sp1, fr = Math.floor(t8 * 8);
  const fl = hash(Math.floor(lt * 12) * 2.9) > .3 ? .45 : .12, hx = 540 - 7 * sc2, hy = 850 - 22 * sc2, op = u < 1 / 8 ? .35 : u < 2 / 8 ? .8 : 1.08;
  cam(sc2 / 2.25 * .62, 540, 760); backWall(t, fl, .5); uncam();
  c.save(); c.translate(hx, hy); c.scale(sc2, sc2); LWK.k = .62;
  head(c, PO.cold, { kind: 'old', view: 'q', expr: 'smile', light: [-.35, .95], skinRim: '#7fffe0', E: { open: op, smileEyes: false, lid: -.1, iris: .62, look: [.35, .1], brow: [9, -6, 3], mouth: speaking ? ['talk', 'grin', 'smileopen', 'grin'][fr % 4] : 'grin' } }); LWK.k = 1; c.restore();
  lband(1700 - ((t * 700) % 3400), 260, '#35e7ff', .16);
  flush();
  if (u > 2 / 8) for (const [ex, ey, r] of [[-21, 23, 1], [35, 21, .7]]) { airbrush(e, hx + ex * sc2, hy + ey * sc2, 30 * r * sc2 / 4, 30 * r * sc2 / 4, '#bffcff', .95); airbrush(e, hx + ex * sc2, hy + ey * sc2, 110 * r, 110 * r, '#35e7ff', .35); }
  return { tint: [.86, .98, 1.08], shadowTint: [.03, .1, .22], bloom: 1.0, sat: .92, flick: .06 };
};

// ---------- 6. Arjun turns to the glass; extreme close-up on the eyes; speed lines and a held beat ----------
SCENES.look = S => {
  const { t, lt, d } = S, tc = st12(lt), cut = 1.95;
  if (lt < cut) {
    const turn = lt < 1.2 ? 0 : lt < 1.2 + 2 / 12 ? 1 : 2, jx = Math.round((hash(tc * 12 + 3) - .5) * 5), P = turn === 2 ? PA.cold : PA.bus;
    cam(1.5 + .08 * prog(lt, 0, cut), 660, 800); sideInt({ t, sx: 90, flick: hash(Math.floor(lt * 12) * 2.1) > .3 ? 1 : .4 }); uncam();
    c.save(); c.translate(500 + jx + (turn === 2 ? 30 : 0), 1010); c.scale(turn === 0 ? -3.1 : 3.1, 3.1);
    const E = turn === 0 ? { ...EXPR.fear, look: [.5 + .1 * Math.sin(tc * 60), .1], mouth: Math.floor(tc * 6) % 2 ? 'wavy' : 'grit' } : turn === 1 ? { ...EXPR.fear, mouth: 'grit', gloom: .8 } : { ...EXPR.terror, look: [1, 0], mouth: 'grit', tears: true };
    head(c, P, { kind: 'arjun', view: turn === 1 ? 'front' : 'q', expr: 'surprised', E }); c.restore();
    lband(1400 - ((t * 1300) % 2400), 200, turn === 2 ? '#35e7ff' : '#ffd9a0', .2);
    flush();
    return { tint: turn === 2 ? [.9, .98, 1.06] : [.96, 1.0, .98], shadowTint: [.05, .1, .22], bloom: .8 };
  }
  const u = lt - cut, k = prog(u, 0, d - cut), sc2 = lerp(8.2, 9.2, k), dr = Math.floor(u * 8), hold = u > d - cut - .5;
  g.fillStyle = PA.cold.hair.s; g.fillRect(0, 0, W, H);
  c.save(); c.translate(540 - 7 * sc2, 880 - 21 * sc2); c.scale(sc2, sc2); LWK.k = .5;
  head(c, PA.cold, { kind: 'arjun', view: 'q', expr: 'surprised', body: false, reflect: '#8ff4ff', E: { look: [Math.min(1, .2 + dr * .3) + .06 * Math.sin(u * 70), .05 * Math.cos(u * 83)], iris: Math.max(.5, .8 - dr * .06), open: Math.min(1.24, 1.05 + dr * .05), sweat: 2, gloom: 1, tears: dr > 3, brow: [-13, 8, 1], reflect: '#8ff4ff' } }); LWK.k = 1; c.restore();
  lband(1500 - ((t * 1500) % 2200), 240, '#8ff4ff', .22);
  flush();
  if (hold) { speedLines(g, Math.floor(u * 12), { type: 'radial', cx: 560, cy: 880, col: '#ffffff', a: .8, n: 70, r0: 520, wmul: .8 }); speedLines(e, Math.floor(u * 12), { type: 'radial', cx: 560, cy: 880, col: '#8ff4ff', a: .25, n: 70, r0: 520, wmul: .8 }); }
  return { tint: [.9, .98, 1.06], shadowTint: [.05, .1, .22], bloom: .7 };
};

// ---------- 7. the glass: impact frames, then the reflection with his seat empty ----------
SCENES.mirror = S => {
  const { t, lt, d } = S, dr = Math.floor(lt * 12 + 1e-6), R = rrp(100, 250, 880, 1090, 54);
  if (dr < 2) {   // impact frames: monochrome, radial lines
    g.fillStyle = dr ? '#000' : '#fff'; g.fillRect(0, 0, W, H);
    speedLines(g, dr, { type: 'radial', cx: 540, cy: 800, col: dr ? '#ffffff' : '#000000', a: 1, n: 120, r0: 420, wmul: 1.3 });
    g.fillStyle = dr ? '#fff' : '#000'; g.fill(rrp(330, 560, 420, 520, 50)); g.fill(rrp(300, 1040, 480, 150, 40));
    return { bloom: 0, halo: 0, sat: 0, tint: [1, 1, 1], lift: 0 };
  }
  const k = prog(lt, .17, d), sc2 = 1 + .1 * eo(k);
  cam(sc2, 540, 860);
  vgrad(g, -200, -200, 1500, 2400, [[0, '#35666e'], [.5, '#2a5560'], [1, '#143440']]);
  for (const [ctx, kk] of [[g, 'c'], [e, 'e']]) { ctx.save(); ctx.clip(R); const off = ((t * 1100) % A.strip.w + A.strip.w) % A.strip.w; ctx.globalAlpha = kk === 'e' ? .5 : .8; ctx.drawImage(A.strip[kk], off - A.strip.w, 250, A.strip.w, 1090); ctx.drawImage(A.strip[kk], off, 250, A.strip.w, 1090); ctx.restore(); }
  // the reflection of the interior, pale on the glass
  g.save(); g.clip(R); g.globalAlpha = .7;
  g.fillStyle = '#16303c'; g.fillRect(100, 250, 880, 1090);
  g.fillStyle = '#e8fff4'; g.fillRect(100, 322, 880, 20);
  for (let i = 0; i < 3; i++) { g.fillStyle = '#081420'; g.beginPath(); g.roundRect(130 + i * 300, 400, 250, 250, 22); g.fill(); g.strokeStyle = '#7fa8b8'; g.lineWidth = 5; g.stroke(); }
  g.fillStyle = '#28505c'; g.fillRect(100, 690, 880, 650); g.fillStyle = '#8fb0c0'; g.fillRect(100, 684, 880, 8);
  airbrush(g, 540, 880, 420, 420, '#bff4ee', .3);
  const seat = (x, w, hi) => { const B = rrp(x, 600, w, 520, 50), gr = g.createLinearGradient(0, 600, 0, 1120); gr.addColorStop(0, hi ? '#6fd0d4' : '#3a8a94'); gr.addColorStop(1, hi ? '#2f8088' : '#1c5562'); g.fillStyle = gr; g.fill(B); g.strokeStyle = '#0a2630'; g.lineWidth = 6; g.stroke(B);
    const C = rrp(x - 30, 1080, w + 60, 170, 44); g.fillStyle = hi ? '#58bcc2' : '#2f808a'; g.fill(C); g.stroke(C); g.fillStyle = rgba('#ffffff', .35); g.fillRect(x + 30, 614, w - 60, 10);
    g.strokeStyle = '#e0f0ff'; g.lineWidth = 12; g.lineCap = 'round'; g.beginPath(); g.moveTo(x + 50, 620); g.lineTo(x + 50, 552); g.lineTo(x + w - 50, 552); g.lineTo(x + w - 50, 620); g.stroke(); };
  seat(-110, 380, 0); seat(810, 380, 0); seat(340, 400, 1);
  g.restore();
  e.save(); e.clip(R); e.fillStyle = rgba('#d8fff0', .35); e.fillRect(100, 322, 880, 20); airbrush(e, 540, 860, 300, 300, '#8ff4ff', .1 + .05 * Math.sin(lt * 9)); e.restore();
  // his reflection stutters for two drawings, then nothing
  if (dr === 3 || dr === 5) { c.save(); c.beginPath(); c.roundRect(100, 250, 880, 1090, 54); c.clip(); c.translate(540, 760); c.scale(-1.75, 1.75); head(c, PA.cold, { kind: 'arjun', view: 'q', expr: 'terror', E: { iris: .6 } }); c.restore(); tintCels('#bff4ff', .5); flush(dr === 3 ? .5 : .28, 0); }
  // glass sheen, rain beads, frame
  g.save(); g.clip(R); g.globalAlpha = .09; g.fillStyle = '#ffffff'; for (const [a, b] of [[520, 150], [760, 50]]) { g.beginPath(); g.moveTo(a, 250); g.lineTo(a + b, 250); g.lineTo(a + b - 380, 1340); g.lineTo(a - 380, 1340); g.fill(); }
  g.globalAlpha = .5; g.strokeStyle = '#cfe8ff'; g.lineWidth = 2.5; const RR = rng(40 + (dr % 3)); for (let i = 0; i < 26; i++) { const x = 120 + RR() * 840, y = 270 + RR() * 1040, l = 14 + RR() * 30; g.beginPath(); g.moveTo(x, y); g.lineTo(x - l * .5, y + l); g.stroke(); }
  g.restore();
  g.strokeStyle = '#1a2c3a'; g.lineWidth = 34; g.stroke(R); g.strokeStyle = '#b8ccd8'; g.lineWidth = 16; g.stroke(R); g.strokeStyle = rgba('#ffffff', .6); g.lineWidth = 3; g.stroke(rrp(94, 244, 892, 1102, 58));
  uncam();
  c.save(); c.translate(250, 1640 + 30 * k); c.scale(3.3, 3.3); c.rotate(.05); backHead(c, PA.sil, { rim: { c: '#7fe8ff', d: [-3, 2] } }); c.restore();
  lband(1500 - ((t * 1200) % 2600), 200, '#8ff4ff', .16);
  flush();
  return { tint: [.88, .98, 1.08], shadowTint: [.04, .1, .24], bloom: .85, sat: .9, track: lt < .5 ? 1 - (lt - .17) / .33 * .6 : 0 };
};

// ---------- 8. three years ago (the wreck, a repainted street), the ghost bus drives on, the tape runs out ----------
function osdRew(ov, txt, blink) {
  ov.save(); ov.font = '800 66px Mukta'; ov.textBaseline = 'middle'; ov.lineJoin = 'round';
  const dr = fn => { ov.strokeStyle = '#000'; ov.lineWidth = 12; ov.fillStyle = '#f4f8ff'; fn(); };
  if (blink) for (const x of [80, 128]) { ov.beginPath(); ov.moveTo(x + 44, 196); ov.lineTo(x, 226); ov.lineTo(x + 44, 256); ov.closePath(); ov.strokeStyle = '#000'; ov.lineWidth = 8; ov.stroke(); ov.fillStyle = '#f4f8ff'; ov.fill(); }
  dr(() => { ov.strokeText(txt, 200, 230); ov.fillText(txt, 200, 230); }); ov.restore();
}
function endCard(u) {
  vgrad(g, 0, 0, W, H, [[0, '#1626c8'], [1, '#0e1aa0']]); e.fillStyle = rgba('#2030ff', .1); e.fillRect(0, 0, W, H);
  const dr = Math.floor(u * 12), vis = [1, 0, 1, 1, 0, 1][dr] ?? 1;
  if (vis) { c.save(); c.translate(540, 800); c.transform(1, 0, -.16, 1, 0, 0); c.textAlign = 'center'; c.textBaseline = 'middle'; c.lineJoin = 'round';
    let sz = 150; c.font = `${sz}px Rozha`; sz = Math.min(150, 880 / c.measureText('कहानी कैसी लगी?').width * sz); c.font = `${sz}px Rozha`;
    const T1 = 'कहानी कैसी लगी?'; c.strokeStyle = '#ff3fa4'; c.lineWidth = 30; c.strokeText(T1, 0, 0); c.strokeStyle = '#0a0830'; c.lineWidth = 18; c.strokeText(T1, 0, 0);
    const gr = c.createLinearGradient(0, -sz * .62, 0, sz * .5); gr.addColorStop(0, '#5fc8ff'); gr.addColorStop(.42, '#e8f8ff'); gr.addColorStop(.5, '#ffffff'); gr.addColorStop(.53, '#6a3ad8'); gr.addColorStop(.75, '#ff6ab0'); gr.addColorStop(1, '#ffd23f'); c.fillStyle = gr; c.fillText(T1, 0, 0); c.restore();
    const sx = lerp(-300, 1500, prog(u, .45, .7)); lband(sx, 90, '#ffffff', .85); 
    g.drawImage(cc, 0, 0); e.save(); e.globalAlpha = .55; e.drawImage(cc, 0, 0); e.restore(); c.clearRect(0, 0, W, H);
    if (u > .9 && u < 1.6) flare(e, 930, 730, .45 * Math.sin((u - .9) / .7 * Math.PI), '#ffffff', { streak: 300, ghosts: false, rot: u }); }
  if (u > .55) both((ctx, em) => { ctx.save(); ctx.font = '600 56px Mukta'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.fillStyle = em ? rgba('#8ff4ff', .25) : '#cfe4ff'; ctx.fillText('ऐसी और कहानियों के लिए', 540, 1010); ctx.restore(); });
  if (u > .8 && (u > 1.15 || Math.floor(u * 12) % 2)) both((ctx, em) => { ctx.save(); const B = rrp(270, 1090, 540, 150, 24); if (!em) { ctx.fillStyle = '#0a0f60'; ctx.fill(B); }
    ctx.strokeStyle = em ? rgba('#35e7ff', .8) : '#8ff4ff'; ctx.lineWidth = em ? 10 : 6; ctx.stroke(B); ctx.font = '800 96px Mukta'; ctx.textAlign = 'center'; ctx.textBaseline = 'middle'; ctx.lineJoin = 'round';
    if (!em) { ctx.strokeStyle = '#120a1e'; ctx.lineWidth = 12; ctx.strokeText('फ़ॉलो करें', 540, 1168); } ctx.fillStyle = em ? rgba('#ffe060', .3) : '#fff0a0'; ctx.fillText('फ़ॉलो करें', 540, 1168); ctx.restore(); });
  return { tint: [1, 1, 1], bloom: .9, track: u < .4 ? 1 - u : 0, noiseA: .03 };
}
SCENES.end = S => {
  const { t, lt, d, L } = S, tc = st12(lt), cs = chunks(L), s0 = L.start - .3, cutB = cs[2].s - s0 - .05, cutC = L.end + .32 - s0;
  if (lt >= cutC) return endCard(lt - cutC);
  const offY = 280;
  if (lt < cutB) {   // the wreck: a held painting, only light, smoke and rain move
    const k = prog(lt, 0, cutB), offX = 520 - 40 * k, z = 1.04 + .06 * k;
    cam(z, 540, 1000);
    for (const [ctx, kk] of [[g, 'c'], [e, 'e']]) { ctx.drawImage(A.sky[kk], -300, -offY * .5 - 140); ctx.globalAlpha = kk === 'e' ? .5 : 1; ctx.drawImage(A.street[kk], -offX, -offY); ctx.globalAlpha = 1; }
    const wx = 250, wy = 1672 - offY, fl = hash(Math.floor(lt * 12) * 1.9) > .55 ? 1 : .15;
    g.fillStyle = rgba('#05040e', .6); g.beginPath(); g.ellipse(wx + 470, wy, 520, 22, 0, 0, TAU); g.fill();
    c.save(); c.translate(wx + 730, wy); c.rotate(-.055); c.translate(-730, 0); c.scale(.96, .96); bus({ door: .55, wheelA: 1 });
    cel(c, poly([[-14, -60], [-8, -200], [30, -250], [10, -300], [48, -352], [70, -300], [50, -262], [86, -230], [60, -170], [92, -120], [56, -60]]), { f: '#2a2448', s: '#14102a', so: [-10, -6], l: '#0a0818', lw: 3 });
    c.strokeStyle = '#e8f0ff'; c.lineWidth = 2.5; for (const [a, b] of [[60, -300], [30, -250], [80, -260], [44, -330], [76, -238]]) { c.beginPath(); c.moveTo(52, -280); c.lineTo(a, b); c.stroke(); }
    c.restore();
    cel(c, poly([[wx - 64, wy + 10], [wx + 30, wy - 520], [wx + 46, wy - 516], [wx - 44, wy + 10]]), { f: '#3a3860', s: '#1e1c3c', so: [-5, 0], l: '#0c0a1e', lw: 3 }); cel(c, poly([[wx + 30, wy - 520], [wx + 130, wy - 560], [wx + 132, wy - 548], [wx + 40, wy - 508]]), { f: '#3a3860', l: '#0c0a1e', lw: 3 });
    tintCels('#0a0820', .5);
    const pulse = .5 + .5 * Math.sin(lt * 9); lband(-300 + ((lt * 900) % 1900), 320, '#ff2040', .34); lband(600 + ((lt * 900) % 1900) - 1900, 320, '#3060ff', .2);
    flush();
    e.save(); e.translate(wx + 730, wy); e.rotate(-.055); e.translate(-730, 0); e.scale(.96, .96); airbrush(e, 68, -401, 30, 30, '#ffb040', fl); airbrush(e, 928, -401, 30, 30, '#ffb040', fl); airbrush(e, 985, -130, 60, 60, '#ff3020', .5); e.restore();
    airbrush(e, 900, wy - 250, 700, 500, '#ff2040', .1 + .14 * pulse); airbrush(g, 900, wy - 250, 700, 500, '#ff2040', .05 + .08 * pulse);
    // smoke ribbons (4-drawing cycle on twos)
    const ph = (Math.floor(lt * 6) % 8) / 8; g.save(); g.globalAlpha = .55;
    for (let i = 0; i < 3; i++) { const sp = flutter(wx + 20 + i * 26, wy - 250 - i * 30, -Math.PI / 2 - .12 + i * .1, 520 + i * 90, 14, 34 + i * 10, 1.4, ph * TAU + i * 2); g.fillStyle = ['#8a84b0', '#6a648e', '#a09ac8'][i]; g.fill(path(ribbon(sp, u => 16 + u * 70))); }
    g.restore();
    uncam(); rainFx(Math.floor(lt * 12), .4, 240);
    return { fade: .5, sat: .8, tint: [1.06, .93, .95], shadowTint: [.2, .05, .12], bloom: .9, track: lt < .4 ? 1 - lt * 1.5 : 0, osd: o => osdRew(o, '3 साल पहले', Math.floor(lt * 2.5) % 2 === 0 || lt < .6) };
  }
  // the ghost bus, side tracking with parallax
  const u = lt - cutB, D = cutC - cutB, k = prog(u, 0, D);
  for (const [ctx, kk] of [[g, 'c'], [e, 'e']]) ctx.drawImage(A.sky[kk], -380 + u * 14, -offY * .5 - 140);
  loopDraw(A.streetSm, u * 1500 + 300, -offY);
  g.save(); g.beginPath(); g.rect(0, 1232, W, 170); g.clip(); hSpeed(Math.floor(u * 30), .16, '#cfd8ff'); g.restore();
  const gone = [1, 1, .5, 1, .3, .7, .15, .4, 0, .2, 0, 0], gi = Math.floor((u - (D - 1.0)) * 12), ga = gi < 0 ? 1 : (gone[gi] ?? 0);
  const bx = lerp(230, 70, eio(k)) + Math.sin(tc * 1.3) * 10, by = 1672 - offY + Math.round(hash(tc * 12) * 3), flick = .86 + .14 * hash(Math.floor(u * 12) * 3.3);
  if (ga > 0) {
    c.save(); c.translate(bx, by); c.scale(.96, .96);
    bus({ door: 0, wheelA: -tc * 30 });
    c.save(); c.beginPath(); c.roundRect(BWIN[1], -350, 100, 124, 10); c.clip(); c.fillStyle = BUSP.win; c.fillRect(BWIN[1], -350, 100, 124); c.translate(BWIN[1] + 56, -300); c.scale(-.66, .66); LWK.k = 1.5;
    head(c, PA.cold, { kind: 'arjun', view: 'q', expr: 'neutral', E: { brow: [-10, 7, 1], lid: .32, look: [.3, .3], mouth: 'frown', tears: true } }); LWK.k = 1; c.restore();
    c.strokeStyle = BUSP.frame; c.lineWidth = 4; c.strokeRect(BWIN[1], -350, 100, 124);
    c.restore();
    tintCels('#8fe8ff', .3);
    flush(.6 * ga * flick, .35 * ga);
    e.save(); e.translate(bx, by); e.scale(.96, .96); busGlow({ a: .8 * ga, head: .9 }); e.restore();
    airbrush(e, bx + 470, by - 200, 620, 300, '#35e7ff', .16 * ga);
    trail(g, e, Array.from({ length: 14 }, (_, i) => [bx + 945 + i * 46, by - 126 + Math.sin(i * .7 + tc * 9) * 3]), '#ff3040', 7 * ga + .01);
  }
  rain(g, e, Math.floor(u * 12), { n: 170, a: .3, ang: 1.05, len: [90, 220], w: 1.8 });
  return { tint: [.9, .97, 1.08], shadowTint: [.05, .08, .24], bloom: .95 };
};
