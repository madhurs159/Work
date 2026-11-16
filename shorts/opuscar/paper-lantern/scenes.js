'use strict';
// Shots. Two ladders: cool night (street / road) and a sick teal (inside the bus). Light is amber; the one accent is Arjun's red shirt.
const FAR = '#6a86c2', MID = '#3f5a92', NEAR = '#27386e', GND = '#18224c', BUSC = '#121a40', FRONT = '#060a1c';
const T5 = '#7fa89c', T4 = '#4f7f78', T3 = '#2f5a58', T2 = '#1b3c40', T1 = '#0f262b', T0 = '#06141a';
const S = {}, B = {};
let CH = null;   // CH(id) -> phrase chunks of that line

function buildings(x, R, x0, x1, base, hmin, hmax, wmin, wmax, wins, wp = .3) {
  let cx = x0;
  while (cx < x1) {
    const w = wmin + R() * (wmax - wmin), h = hmin + R() * (hmax - hmin), top = base - h; x.fillRect(cx, top, w + 1, h + 800);
    const k = R(); if (k < .3) x.fillRect(cx + w * .2, top - 28, w * .35, 30); else if (k < .45) { x.beginPath(); x.moveTo(cx, top + 1); x.lineTo(cx + w / 2, top - 36); x.lineTo(cx + w, top + 1); x.fill(); } else if (k < .6) { x.fillRect(cx + w * .6, top - 70, 5, 72); x.fillRect(cx + w * .6 - 14, top - 52, 33, 4); }
    if (wins) { const cw = Math.max(16, w / 6), n = Math.floor((w - 16) / (cw * 1.6)); for (let r = 0; r < Math.min(14, (h - 30) / 56); r++) for (let c = 0; c < n; c++) if (R() < wp) wins.push([cx + 14 + c * cw * 1.6, top + 28 + r * 56, cw, 28, R()]); }
    cx += w;
  }
}
function wins(list, o, k, t) { over(o, x => { for (const w of list) { const f = k * (.72 + .28 * Math.sin(t * 1.3 + w[4] * 40)); x.fillStyle = css(mixc([16, 20, 48], [255, 190, 104], f)); x.fillRect(w[0], w[1], w[2], w[3]); } }); }
function hills(x, R, wd, base, amp, pines) {
  const ph = [R() * TAU, R() * TAU, R() * TAU], f = u => base - amp * (.5 + .5 * Math.sin(u * TAU + ph[0])) - amp * .4 * Math.sin(u * TAU * 3 + ph[1]) - amp * .15 * Math.sin(u * TAU * 7 + ph[2]);
  x.beginPath(); x.moveTo(0, 3000); for (let i = 0; i <= wd; i += 8) x.lineTo(i, f(i / wd)); x.lineTo(wd, 3000); x.fill();
  for (let i = 0; i < (pines || 0); i++) { const px = R() * wd, h = 50 + R() * 80, py = f(px / wd) + 10; for (const ox of [-wd, 0, wd]) { x.beginPath(); x.moveTo(px + ox, py - h); x.lineTo(px + ox + h * .3, py); x.lineTo(px + ox - h * .3, py); x.fill(); x.beginPath(); x.moveTo(px + ox, py - h * .6); x.lineTo(px + ox + h * .38, py + h * .25); x.lineTo(px + ox - h * .38, py + h * .25); x.fill(); } }
}
function tile(s, off, o) { const dx = -(((off % 2160) + 2160) % 2160); put(s, { ...o, dx }); put(s, { ...o, dx: dx + 2160 }); if (dx > -200) put(s, { ...o, dx: dx - 2160 }); }
function stars(o, t, k = 1) { over(o, x => { for (const s of B.stars) { x.fillStyle = `rgba(255,244,214,${k * s[3] * (.65 + .35 * Math.sin(t * 1.7 + s[4]))})`; x.beginPath(); x.arc(s[0], s[1], s[2], 0, TAU); x.fill(); } }); }
function moon(o, cx, cy, r, k) { lightOn(o, x => { halo(x, cx, cy, r * 4.6, [255, 220, 160], .42 * k); }); over(o, x => { x.fillStyle = css(mixc([20, 26, 60], [255, 234, 184], k)); x.beginPath(); x.arc(cx, cy, r, 0, TAU); x.fill(); x.fillStyle = `rgba(190,150,100,${.13 * k})`; for (const [a, b, c] of [[-.3, -.2, .3], [.25, .3, .24], [.3, -.3, .18], [-.2, .4, .16]]) { x.beginPath(); x.arc(cx + a * r, cy + b * r, c * r, 0, TAU); x.fill(); } }); }

// ---------- outside seen through bus windows (bus runs right, the night runs left) ----------
function outside(t, sp, y0, y1, k = 1) {
  g.save(); const gr = g.createLinearGradient(0, y0, 0, y1); gr.addColorStop(0, '#060b24'); gr.addColorStop(1, '#1a2a64'); g.fillStyle = gr; g.fillRect(-50, y0 - 150, W + 100, y1 - y0 + 300);
  const a = -((t * sp * .22) % 2160), b = -((t * sp) % 2160);
  g.globalAlpha = k; g.drawImage(B.os1.c, a, y1 - 560); g.drawImage(B.os1.c, a + 2160, y1 - 560);
  g.globalCompositeOperation = 'lighter';
  for (let i = 0; i < 4; i++) { const lx = 1500 - ((t * sp * .8 + i * 690) % 2760), ly = y0 + (y1 - y0) * .22; halo(g, lx, ly, 210, AMB, .55 * k); halo(g, lx, ly, 46, PALE, .9 * k); }
  g.globalCompositeOperation = 'source-over'; g.drawImage(B.os2.c, b, y1 - 760); g.drawImage(B.os2.c, b + 2160, y1 - 760);
  g.restore();
}
function sheen(x0, y0, w, h, t, a = .05) { g.save(); g.beginPath(); g.rect(x0, y0, w, h); g.clip(); g.globalCompositeOperation = 'lighter'; for (let i = 0; i < 3; i++) { const sx0 = x0 - 200 + ((t * 60 + i * 420) % (w + 600)); g.fillStyle = `rgba(190,215,255,${a * (i == 1 ? 1.5 : 1)})`; g.beginPath(); g.moveTo(sx0, y0 + h); g.lineTo(sx0 + 260, y0); g.lineTo(sx0 + 330 + i * 30, y0); g.lineTo(sx0 + 70 + i * 30, y0 + h); g.fill(); } g.restore(); }

// ---------- the bus (side) ----------
function buildBus() {
  B.bus = sheet({
    x: -10, y: -10, w: 1244, h: 400, col: BUSC, draw: x => {
      rr(x, 0, 0, 1210, 362, [46, 90, 22, 26]); x.fill(); rr(x, 1196, 292, 26, 50, 8); x.fill();
      cut(x, () => { for (let i = 0; i < 6; i++) { rr(x, 50 + i * 152, 50, 125, 125, 14); x.fill(); } rr(x, 988, 56, 106, 284, [14, 14, 4, 4]); x.fill(); rr(x, 1118, 56, 72, 118, [12, 40, 10, 10]); x.fill(); x.beginPath(); x.arc(238, 362, 76, 0, TAU); x.fill(); x.beginPath(); x.arc(900, 362, 76, 0, TAU); x.fill(); rr(x, 1160, 286, 40, 26, 8); x.fill(); });
      crease(x, 'rgba(0,0,0,.4)', () => { x.fillRect(0, 214, 980, 5); x.fillRect(0, 252, 980, 3); }); crease(x, 'rgba(255,220,170,.09)', () => x.fillRect(0, 219, 980, 33));
    }
  });
  B.wheel = sheet({ x: -66, y: -66, w: 132, h: 132, col: '#070b1e', draw: x => { x.beginPath(); x.arc(0, 0, 62, 0, TAU); x.fill(); cut(x, () => { for (let i = 0; i < 5; i++) { x.beginPath(); x.arc(Math.cos(i * TAU / 5) * 32, Math.sin(i * TAU / 5) * 32, 11, 0, TAU); x.fill(); } }); } });
}
function drawBus(bx, by, sc, p, lit, mid, a = 1, rotw = 0, ghost = 0) {
  const o = { p, dx: bx, dy: by, sc, px: 0, py: 0 };
  over(o, x => {
    x.globalAlpha = a; const gr = x.createLinearGradient(0, 30, 0, 340); gr.addColorStop(0, css(mixc([34, 22, 12], [255, 186, 100], lit))); gr.addColorStop(1, css(mixc([26, 16, 8], [200, 100, 38], lit))); x.fillStyle = gr; x.fillRect(20, 20, 1180, 262); x.fillRect(980, 20, 122, 326);
    x.fillStyle = css(mixc([18, 11, 6], [112, 56, 22], lit)); for (let i = 0; i < 7; i++) { rr(x, 22 + i * 152, 122, 54, 160, [20, 20, 0, 0]); x.fill(); } x.fillRect(1100, 150, 60, 132);
    if (ghost) { x.fillStyle = '#7c2618'; rr(x, 690, 142, 78, 70, 24); x.fill(); x.fillStyle = '#160b0a'; x.beginPath(); x.arc(729, 116, 27, 0, TAU); x.fill(); }
  });
  if (mid) mid();
  put(B.bus, { ...o, a, trans: .05, sh: .5 * a });
  for (const wx of [238, 900]) put(B.wheel, { p, dx: bx + wx * sc, dy: by + 362 * sc, sc, rot: rotw, px: 0, py: 0, sh: 0, a });
  lightOn(o, x => { for (let i = 0; i < 6; i++) halo(x, 112 + i * 152, 112, 190, AMB, .11 * lit * a); halo(x, 1040, 200, 260, AMB, .12 * lit * a); halo(x, 1180, 300, 120, PALE, .4 * lit * a); halo(x, 1180, 300, 34, PALE, lit * a); const gr = x.createLinearGradient(1190, 0, 1900, 0); gr.addColorStop(0, css(PALE, .13 * lit * a)); gr.addColorStop(1, css(PALE, 0)); x.fillStyle = gr; x.beginPath(); x.moveTo(1190, 292); x.lineTo(1900, 250); x.lineTo(1900, 470); x.lineTo(1190, 312); x.fill(); });
}

// ================= 1. stop =================
function buildStop() {
  const R = mulberry(11);
  B.stars = []; for (let i = 0; i < 150; i++) B.stars.push([R() * 1300 - 110, R() * 1150 - 50, .8 + R() * R() * 2.2, .3 + R() * .6, R() * 9]);
  const big = { x: -260, y: 300, w: 1600, h: 1800 };
  B.far = sheet({ ...big, col: FAR, draw: x => buildings(x, R, -260, 1340, 1400, 380, 640, 70, 150) });
  B.midW = []; B.mid = sheet({ ...big, col: MID, draw: x => buildings(x, R, -260, 1340, 1420, 480, 820, 130, 230, B.midW, .2) });
  B.nearW = []; B.near = sheet({ ...big, col: NEAR, draw: x => { buildings(x, R, -300, 200, 1420, 520, 700, 170, 250, B.nearW, .22); buildings(x, R, 900, 1340, 1420, 380, 540, 170, 240, B.nearW, .22); } });
  B.gnd = sheet({
    ...big, col: GND, draw: x => {
      x.fillRect(-260, 1318, 1600, 900);
      x.beginPath(); x.moveTo(696, 962); x.lineTo(1044, 946); x.lineTo(1044, 966); x.lineTo(696, 984); x.fill(); x.fillRect(724, 975, 13, 345); x.fillRect(1004, 962, 13, 358); x.fillRect(770, 1218, 204, 13); x.fillRect(784, 1228, 10, 92); x.fillRect(950, 1228, 10, 92);
      x.fillRect(766, 978, 6, 30); x.fillRect(900, 972, 6, 36); rr(x, 730, 1000, 212, 78, 10); x.fill();
      cut(x, () => { x.font = '400 50px Tiro'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('11:40 PM', 836, 1042); });
      x.fillRect(655, 640, 12, 680); x.beginPath(); x.moveTo(667, 656); x.quadraticCurveTo(640, 596, 585, 626); x.lineTo(585, 640); x.quadraticCurveTo(636, 616, 655, 664); x.fill(); rr(x, 548, 626, 74, 24, [10, 10, 4, 4]); x.fill(); rr(x, 646, 1276, 30, 44, 4); x.fill();
    }
  });
  B.front1 = sheet({
    x: -320, y: -200, w: 1720, h: 2500, col: FRONT, blur: 5, draw: x => {
      x.fillRect(-320, 1452, 1720, 900); x.fillRect(-320, 1394, 1720, 12); for (let i = -4; i < 16; i++) x.fillRect(i * 96 + 20, 1400, 10, 56);
      x.beginPath(); x.moveTo(-110, 1460); x.bezierCurveTo(-50, 1100, -40, 700, 0, 380); x.lineTo(46, 380); x.bezierCurveTo(24, 800, 56, 1150, 60, 1460); x.fill();
      x.lineWidth = 18; x.lineCap = 'round'; x.beginPath(); x.moveTo(14, 740); x.quadraticCurveTo(120, 600, 300, 520); x.stroke(); x.lineWidth = 13; x.beginPath(); x.moveTo(20, 560); x.quadraticCurveTo(110, 380, 260, 300); x.stroke();
      const Q = mulberry(5); for (let i = 0; i < 70; i++) { const u = Q(), px = -160 + u * 600, py = 60 + Q() * (480 - u * 200), r = 26 + Q() * 44; x.beginPath(); x.arc(px, py, r, 0, TAU); x.fill(); }
    }
  });
}
S.stop = (lt, d, t) => {
  const zk = eio(prog(lt, 2.2, 1.9)); cam.z = 1 + .012 * lt + .34 * zk; cam.x = -6 + 4 * Math.sin(t * .9) + 2 * Math.sin(t * 2.1) - 30 * zk; cam.y = -70 + 2 * Math.sin(t * 1.3) + 210 * zk;
  const on = eo(prog(lt, .1, .9)), wk = ss(prog(lt, .75, .7));
  LIT.x = 600; LIT.y = 900; LIT.r = 620; LIT.k = on * flick(t);
  sky('#040820', '#0f1a48', '#1c2c6a'); stars({ p: .05 }, t, on); moon({ p: .08 }, 830, 340, 62, ss(prog(lt, .25, .6)));
  put(B.far, { p: .25, trans: .42 * ss(prog(lt, .2, .5)), sh: .3 });
  put(B.mid, { p: .45, trans: .5 * ss(prog(lt, .35, .5)) }); wins(B.midW, { p: .45 }, wk, t);
  put(B.near, { p: .7, trans: .26 * ss(prog(lt, .5, .5)) }); wins(B.nearW, { p: .7 }, ss(prog(lt, .95, .6)), t);
  const sk = ss(prog(lt, .85, .35)) * flick(t + 1), lk = ss(prog(lt, .6, .3)) * flick(t + 2);
  over({ p: 1 }, x => { x.fillStyle = css(mixc([22, 16, 12], [255, 214, 140], sk)); x.fillRect(734, 1003, 204, 72); });
  put(B.gnd, { p: 1, trans: .14 });
  lightOn({ p: 1 }, x => { halo(x, 585, 664, 380, AMB, .5 * lk); halo(x, 585, 660, 54, PALE, lk); const gr = x.createLinearGradient(0, 660, 0, 1318); gr.addColorStop(0, css(AMB, .2 * lk)); gr.addColorStop(1, css(AMB, 0)); x.fillStyle = gr; x.beginPath(); x.moveTo(560, 652); x.lineTo(610, 652); x.lineTo(820, 1318); x.lineTo(360, 1318); x.fill(); halo(x, 836, 1040, 170, AMB, .16 * sk); });
  const bk = eo(prog(lt, .45, 1.85)), leave = Math.pow(prog(lt, 3.8, 1.2), 2) * 260, bx = -560 - 1300 * (1 - bk) + leave;
  const wkp = ss(prog(lt, 2.2, 1.4)), inb = wkp >= 1, ax = lerp(992, 482, wkp) + (inb ? leave : 0), foot = 1318 - 62 * ss(prog(wkp, .72, .28));
  const wl = wkp > 0 && wkp < 1 ? walk(lt, 11, .55) : { legF: [.03, -.05], legB: [-.04, -.03], armF: [.08, .2], armB: [-.05, .15], bob: 0 };
  drawBus(bx, 898, 1, 1.04, wk, () => {
    const s = dyn('arj1', ax - 170, foot - 330, 340, 350, ARJ.shirt, x => person(x, ax, foot - 131 + wl.bob * .5, .5, -1, ARJ, { ...wl, head: .05 + .04 * Math.sin(t * 1.2), eye: .5, lean: .02 * Math.sin(t * .8) }));
    put(s, { p: 1.04, trans: .08, sh: .45, sb: 12, sy: 8 });
  }, 1, (bx + 560) / 62);
  put(B.front1, { p: 1.5, blur: 1, sh: .7, sb: 40 });
};

// ================= 2. inside (a tunnel of frames) =================
const VP = [540, 900], FS = [1, .78, .61, .48, .38], FC = [T0, T1, T2, T3, T4], BS = .3;
function frameArt(x) {
  x.fillRect(-500, -600, 2080, 3100); cut(x, () => { rr(x, 150, 330, 780, 1110, [210, 210, 0, 0]); x.fill(); });
  for (const s0 of [150, 675]) { rr(x, s0, 1010, 255, 440, [50, 50, 0, 0]); x.fill(); rr(x, s0 + 62, 966, 130, 70, 22); x.fill(); cut(x, () => { rr(x, s0 + 84, 984, 86, 22, 10); x.fill(); }); }
  x.fillRect(396, 340, 13, 700); x.fillRect(671, 340, 13, 700); rr(x, 468, 326, 144, 38, [0, 0, 16, 16]); x.fill();
  x.fillRect(150, 600, 70, 9); x.fillRect(860, 600, 70, 9);
}
const fp = (s, bx, by) => [VP[0] + (bx - VP[0]) * s, VP[1] + (by - VP[1]) * s];
function buildInside() {
  B.fr = FS.map((s, k) => sheet({ x: -220, y: -220, w: 1520, h: 2360, col: FC[k], blur: k == 0 ? 6 : 0, draw: x => { x.translate(VP[0], VP[1]); x.scale(s, s); x.translate(-VP[0], -VP[1]); frameArt(x); } }));
  B.back = sheet({ x: 190, y: 500, w: 700, h: 800, col: T5, draw: x => { x.translate(VP[0], VP[1]); x.scale(BS, BS); x.translate(-VP[0], -VP[1]); x.fillRect(-1000, -800, 3100, 3600); cut(x, () => { rr(x, 170, 420, 740, 400, 70); x.fill(); }); crease(x, 'rgba(0,0,0,.3)', () => { x.fillRect(-1000, 1130, 3100, 10); x.fillRect(-1000, 1175, 3100, 5); }); } });
  B.wsm = sheet({ x: 440, y: 800, w: 200, h: 180, col: '#1f3344', rimPx: 2, underPx: 2, draw: x => { x.translate(VP[0], VP[1]); x.scale(BS, BS); x.translate(-VP[0], -VP[1]); x.fillStyle = '#1f3344'; x.beginPath(); x.moveTo(350, 1160); x.quadraticCurveTo(380, 880, 462, 830); x.quadraticCurveTo(440, 690, 540, 680); x.quadraticCurveTo(640, 690, 618, 830); x.quadraticCurveTo(700, 880, 730, 1160); x.fill(); x.fillStyle = '#8f889c'; x.beginPath(); x.ellipse(540, 780, 54, 66, 0, 0, TAU); x.fill(); x.fillStyle = '#b4b0be'; x.beginPath(); x.ellipse(540, 740, 56, 30, 0, Math.PI, TAU); x.fill(); cut(x, () => { for (const e of [-22, 22]) { x.beginPath(); x.ellipse(540 + e, 784, 11, 6, 0, 0, TAU); x.fill(); } x.beginPath(); x.ellipse(540, 818, 16, 4, 0, 0, TAU); x.fill(); }); } });
  B.handle = sheet({ x: -30, y: -4, w: 60, h: 130, col: T1, rimPx: 2, underPx: 2, draw: x => { x.fillRect(-5, 0, 10, 74); x.beginPath(); x.arc(0, 94, 25, 0, TAU); x.fill(); cut(x, () => { x.beginPath(); x.arc(0, 94, 14, 0, TAU); x.fill(); }); } });
}
S.inside = (lt, d, t) => {
  const k = eio(prog(lt, .1, d - .3)); cam.z = 1 + .8 * k; cam.x = 5 * Math.sin(t * 1.1) + 3 * Math.sin(t * 2.3); cam.y = -64 * k + 2 * Math.sin(t * 1.7) + 1.5 * Math.sin(t * 9);
  const dipk = t > 7.2 && t < 7.5 ? .55 + .3 * Math.sin(t * 60) : 1;
  LIT.x = 540; LIT.y = 880; LIT.r = 440 + 160 * k; LIT.k = 1.05 * flick(t) * dipk; LIT.floor = .18;
  g.fillStyle = '#03070c'; g.fillRect(0, 0, W, H);
  const ob = { p: 1 };
  over(ob, x => { const gr = x.createLinearGradient(0, 750, 0, 880); gr.addColorStop(0, '#060b24'); gr.addColorStop(1, '#1d2e6c'); x.fillStyle = gr; x.fillRect(400, 730, 280, 170); });
  lightOn(ob, x => { for (let i = 0; i < 5; i++) { const u = (t * .3 + i / 5) % 1, q = (1 - u) * (1 - u); for (const sg of [-1, 1]) halo(x, 540 + sg * (14 + q * 110), 835 - q * 60, 6 + 26 * q, AMB, .9 * (1 - u * .6)); } });
  put(B.back, { p: 1, trans: .42, sh: 0 });
  const wo = { p: 1, rot: .025 * Math.sin(t * 1.4), px: 540, py: 980, trans: .1, sh: .5, sb: 8, sy: 5 }; put(B.wsm, wo);
  const ek = ss(prog(t, 7.35, .5)); lightOn(wo, x => { for (const ex of [-1, 1]) { const [a, b] = fp(BS, 540 + ex * 22, 784); halo(x, a, b, 16, AMB, ek * flick(t * 2)); x.fillStyle = css(PALE, ek); x.beginPath(); x.arc(a, b, 2.4, 0, TAU); x.fill(); } });
  for (let i = 4; i >= 0; i--) {
    const s = FS[i], o = { p: 1 + (5 - i) * .22, trans: [.03, .07, .12, .19, .28][i], blur: i == 0 ? 1 : 0, sh: .62, sb: 34 * s + 8, sy: 26 * s + 4 };
    put(B.fr[i], o);
    const [lx, ly] = fp(s, 540, 372); lightOn(o, x => { halo(x, lx, ly, 260 * s, AMB, .3 * LIT.k); x.fillStyle = css(PALE, .95 * Math.min(1, LIT.k)); rr(x, lx - 52 * s, ly - 6 * s, 104 * s, 16 * s, 8 * s); x.fill(); });
    for (const hx of [292, 788]) { const [a, b] = fp(s, hx, 344); put(B.handle, { ...o, dx: a, dy: b, sc: s * 1.5, px: 0, py: 0, rot: .13 * Math.sin(t * 2.2 + i * .9 + hx), trans: 0, sh: .4, blur: 0 }); }
  }
};

// ================= 3/4. side view in the bus =================
function buildSide() {
  const R = mulberry(23);
  B.os1 = sheet({ x: 0, y: 0, w: 2160, h: 600, col: '#33487e', rim: .2, draw: x => buildings(x, R, 0, 2160, 600, 120, 420, 80, 170) });
  B.os2 = sheet({ x: 0, y: 0, w: 2160, h: 800, col: '#0b1230', rim: .15, draw: x => { for (let i = 0; i < 9; i++) { const px = 80 + i * 240 + R() * 90, h = 380 + R() * 260; if (i % 3 == 0) { x.fillRect(px, 800 - h - 120, 9, h + 120); x.fillRect(px - 40, 800 - h - 120, 50, 8); } else { x.fillRect(px - 7, 800 - h * .6, 14, h); for (let j = 0; j < 9; j++) { x.beginPath(); x.arc(px + (R() - .5) * 150, 800 - h * .62 - R() * 170, 34 + R() * 44, 0, TAU); x.fill(); } } } x.fillRect(0, 760, 2160, 40); } });
  B.wall = sheet({ x: -400, y: -150, w: 1880, h: 2200, col: T3, draw: x => { x.fillRect(-400, -150, 1880, 2200); cut(x, () => { for (const wx of [-420, 70, 560, 1050]) { rr(x, wx, 470, 440, 440, 36); x.fill(); } }); crease(x, 'rgba(0,0,0,.28)', () => { x.fillRect(-400, 986, 1880, 5); x.fillRect(-400, 1012, 1880, 3); for (let i = -1; i < 5; i++) x.fillRect(-420 + i * 490 + 465 - 2, 380, 4, 1700); }); } });
  B.ceil = sheet({ x: -400, y: -150, w: 1880, h: 580, col: T2, draw: x => { x.fillRect(-400, -150, 1880, 500); x.fillRect(-400, 392, 1880, 12); for (let i = -1; i < 8; i++) x.fillRect(-340 + i * 245, 345, 10, 52); for (const lx of [50, 540, 1030]) { rr(x, lx - 72, 344, 144, 30, [0, 0, 14, 14]); x.fill(); } } });
  B.seats = sheet({ x: -400, y: 500, w: 1880, h: 1100, col: '#1f474a', draw: x => { for (const bx of [-545, -70, 405, 880, 1355]) seatPath(x, bx, 1215, 1.62, 1); } });
  B.floor = sheet({ x: -400, y: 1380, w: 1880, h: 700, col: T1, draw: x => x.fillRect(-400, 1392, 1880, 700) });
  B.front2 = sheet({ x: -400, y: 1200, w: 1880, h: 1000, col: T0, blur: 5, draw: x => { for (const [a, b] of [[-160, 1452], [372, 1478], [900, 1452]]) { rr(x, a, b, 440, 800, [80, 80, 0, 0]); x.fill(); rr(x, a + 130, b - 38, 180, 70, 24); x.fill(); cut(x, () => { rr(x, a + 156, b - 20, 128, 22, 10); x.fill(); }); } x.fillRect(-400, 1560, 1880, 700); } });
}
function handles(o, t, list, sc = 1.5) { for (const [hx, hy] of list) put(B.handle, { ...o, dx: hx, dy: hy, sc, px: 0, py: 0, rot: .14 * Math.sin(t * 2.3 + hx * .01) + .03 * Math.sin(t * 5.1 + hx), trans: 0, sh: .45 }); }
function lamps(o, list, k, r = 380) { lightOn(o, x => { for (const [lx, ly] of list) { halo(x, lx, ly, r, [255, 150, 70], .42 * k); x.fillStyle = css(PALE, Math.min(1, k)); rr(x, lx - 56, ly - 8, 112, 18, 9); x.fill(); } }); }
S.cond = (lt, d, t) => {
  cam.z = 1.02 + .03 * lt / d; cam.x = -16 + 32 * lt / d + 4 * Math.sin(t * 1.3); cam.y = 3 * Math.sin(t * 2.1) + 1.5 * Math.sin(t * 11);
  LIT.x = 540; LIT.y = 520; LIT.r = 760; LIT.k = flick(t); LIT.floor = .2;
  outside(t, 520, 400, 960);
  put(B.wall, { p: .92, trans: .3, sh: .5 }); sheen(0, 380, W, 620, t, .03);
  put(B.ceil, { p: .96, trans: .12 }); lamps({ p: .96 }, [[50, 372], [540, 372], [1030, 372]], LIT.k);
  put(B.floor, { p: 1, trans: .1, sh: .3 });
  const cx = 1300 - 275 * (t - 9.9), w = walk(t, 6.2, .42);
  const sc = dyn('con3', cx - 300, 330, 600, 1160, CON.shirt, x => person(x, cx, 1000 + w.bob, 1.66, -1, CON, { ...w, armF: [.12 + w.armF[0] * .4, .45], holdF: 'machine', head: .02, eye: .3, brow: .12, lean: .03 }));
  put(sc, { p: .98, trans: .05, sh: .5 });
  put(B.seats, { p: 1, trans: .16 });
  const r = eio(prog(t, 10.5, .65)), drop = eio(prog(t, 13.3, 1.3)), fl = 1 - 2 * eio(prog(t, 12.72, .3)), after = prog(t, 12.9, .4);
  const P = { legF: [1.5, -1.48], legB: [1.42, -1.36], armB: [.3, 1.1], armF: [lerp(.3, 1.5, r) - .7 * drop + .02 * Math.sin(t * 9) * r, lerp(1.15, .28, r) + .5 * drop], holdF: 'note', lean: .05 * r - .04 * after, head: .1 * r * (1 - after) + .03 * Math.sin(t * 1.1), hflip: Math.abs(fl) < .1 ? .1 * Math.sign(fl || 1) : fl, eye: .45 + .4 * after, brow: -.3 * after, mouth: .25 * after };
  const sa = dyn('arj3', 230, 590, 700, 900, ARJ.shirt, x => person(x, 482, 1200, 1.62, 1, ARJ, P));
  put(sa, { p: 1, trans: .05, sh: .5 });
  handles({ p: 1.04 }, t, [[180, 402], [425, 402], [670, 402], [915, 402]]);
  put(B.front2, { p: 1.5, blur: 1, sh: .7, sb: 40 });
};
S.call = (lt, d, t) => {
  cam.z = 1 + .06 * lt / d; cam.x = 14 - 30 * lt / d + 4 * Math.sin(t * 1.3); cam.y = 3 * Math.sin(t * 2.1) + 1.5 * Math.sin(t * 11);
  const c = CH('call'), no = prog(t, c[3].s, .5);
  LIT.x = 420; LIT.y = 560; LIT.r = 760; LIT.k = flick(t) * (1 - .3 * no) * (no > 0 && no < 1 ? .8 + .2 * Math.sin(t * 50) : 1); LIT.floor = .2;
  outside(t, 520, 330, 1020);
  const bo = { sc: 1.3, px: 200, py: 690 };
  put(B.wall, { ...bo, p: .8, trans: .3, sh: .5 }); sheen(0, 380, W, 640, t, .03);
  put(B.ceil, { ...bo, p: .84, trans: .12 }); lamps({ ...bo, p: .84 }, [[50, 372], [540, 372]], LIT.k);
  put(B.floor, { p: .95, trans: .1, sh: .3, dy: 30 }); put(B.seats, { p: .95, dx: -170, dy: 205, trans: .16, blur: 0 });
  const cx = 420 - 62 * lt, w = walk(t, 6.2, .4);
  const sc = dyn('con4', cx - 180, 780, 360, 700, CON.shirt, x => person(x, cx, 1150 + w.bob * .6, 1.0, -1, CON, { ...w, armF: [.12 + w.armF[0] * .4, .45], holdF: 'machine', eye: .3, brow: .12, lean: .03 }));
  put(sc, { p: .97, trans: .08, sh: .5, sb: 18, sy: 12 });
  handles({ p: 1, }, t, [[120, 330], [470, 330], [820, 330]], 2);
  const reach = eio(prog(t, 15.5, .7)), give = eio(prog(t, c[3].s + .1, .9)), say = t > c[1].s - .05 && t < c[2].e - .12;
  const P = { bust: 1, armB: [.2, .5], armF: [lerp(.4, 1.75, reach) - .55 * give + (say ? .05 * Math.sin(t * 16) : 0), lerp(1.2, .25, reach) + .35 * give], lean: .08 * reach - .05 * give, head: .08 * reach - .12 * give, eye: .6 + .3 * reach, brow: -.25 - .15 * give, mouth: say ? .45 + .55 * Math.abs(Math.sin(t * 10.5)) : .12 * (1 - give) };
  const sa = dyn('arj4', 100, 740, 1080, 860, ARJ.shirt, x => person(x, 770, 1720, 2.7, -1, ARJ, P));
  const ao = { p: 1.08, trans: .1, sh: .6, sb: 36, sy: 26 }; put(sa, ao);
  lightOn(ao, x => {   // light arcs cut in the air: his voice
    x.lineCap = 'round'; const mx = 590 - 60 * reach, my = 1092 - 30 * reach;
    for (let i = 0; i < 3; i++) { const a0 = prog(t, c[1].s + i * .13, .28), fade = 1 - prog(t, c[2].e - .1 + i * .08, .45), kk = eo(a0) * fade; if (kk <= 0) continue; const rad = 90 + i * 62, sw = .55 * eo(a0); x.strokeStyle = css(AMB, kk); x.lineWidth = 13 - i * 2; x.shadowColor = css(AMB, kk); x.shadowBlur = 30; x.beginPath(); x.arc(mx, my, rad, Math.PI - sw + .12, Math.PI + sw + .12); x.stroke(); }
  });
  put(B.front2, { p: 1.5, blur: 1, sh: .7, sb: 40, dx: 40 });
};

// ================= 5. the old woman =================
const SHAWL = P2('M100,1990 C110,1420 230,1270 340,1200 C280,1000 300,560 540,540 C780,560 800,1000 740,1200 C850,1270 970,1420 980,1990 Z');
const WHAIR = P2('M352,800 C352,640 440,598 540,598 C640,598 728,640 728,800 C728,880 700,900 690,935 L390,935 C380,900 352,880 352,800 Z');
const UPFACE = P2('M384,810 C384,715 450,672 540,672 C630,672 696,715 696,810 C700,890 684,950 652,992 Q540,1052 428,992 C396,950 380,890 384,810 Z');
const JAW = P2('M420,984 Q540,1056 660,984 C664,1090 610,1150 540,1152 C470,1150 416,1090 420,984 Z');
const EYEL = P2('M414,840 Q462,782 512,840 Q462,812 414,840 Z'), EYER = P2('M568,840 Q618,782 666,840 Q618,812 568,840 Z');
function womanBig(x, j) {
  part(x, SHAWL, '#3b3454');
  x.save(); x.globalCompositeOperation = 'destination-out'; for (let i = 0; i < 9; i++) { const a = Math.PI * (1.08 + i * .105), px = 540 + Math.cos(a) * 232, py = 800 + Math.sin(a) * 232; x.beginPath(); x.moveTo(px, py - 11); x.lineTo(px + 9, py); x.lineTo(px, py + 11); x.lineTo(px - 9, py); x.fill(); } x.restore();
  part(x, WHAIR, '#b4b0c2'); x.save(); x.globalCompositeOperation = 'destination-out'; x.lineWidth = 4; x.lineCap = 'round'; for (const sg of [-1, 1]) for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(540 + sg * (4 + i * 6), 606 + i * 3); x.quadraticCurveTo(540 + sg * (70 + i * 28), 640, 540 + sg * (150 + i * 12), 760); x.stroke(); } x.restore();
  part(x, rect(424, 950, 232, 170, 60), '#120a14');
  for (const [a, b, w, h] of [[474, 1000, 26, 34], [528, 1010, 24, 36], [584, 1000, 24, 30]]) part(x, rect(a, b, w, h, 4), '#bdb6a2', { rim: 2 });
  part(x, UPFACE, '#958ea4');
  x.save(); x.translate(0, j); part(x, JAW, '#8e879d'); x.restore();
  hole(x, EYEL); hole(x, EYER);
  x.save(); x.globalCompositeOperation = 'destination-out'; x.lineCap = 'round'; x.lineWidth = 8;
  const L = (...a) => { x.beginPath(); x.moveTo(a[0], a[1]); if (a.length == 6) x.quadraticCurveTo(a[2], a[3], a[4], a[5]); else x.lineTo(a[2], a[3]); x.stroke(); };
  L(408, 786, 456, 744, 508, 772); L(572, 772, 624, 744, 672, 786);
  x.lineWidth = 4.5; L(452, 716, 540, 700, 628, 716); L(474, 742, 540, 730, 606, 742);
  for (const sg of [-1, 1]) { const c = 540 + sg * 142; L(c, 852, c + sg * 16, 842); L(c + sg * 2, 866, c + sg * 18, 868); L(c, 880, c + sg * 13, 892); L(540 + sg * 42, 900, 540 + sg * 76, 936, 540 + sg * 92, 984); L(540 + sg * 96, 900, 540 + sg * 120, 916, 540 + sg * 124, 944); }
  x.lineWidth = 5.5; x.beginPath(); x.moveTo(530, 846); x.quadraticCurveTo(520, 896, 510, 912); x.quadraticCurveTo(540, 934, 570, 912); x.stroke();
  x.restore();
}
function buildWoman() {
  B.wwall = sheet({ x: -300, y: -150, w: 1680, h: 2200, col: T3, draw: x => { x.fillRect(-300, -150, 1680, 2200); cut(x, () => { rr(x, 110, 360, 860, 560, 80); x.fill(); }); crease(x, 'rgba(0,0,0,.28)', () => { x.lineWidth = 5; rr(x, 84, 334, 912, 612, 96); x.stroke(); x.fillRect(-300, 1010, 1680, 5); }); } });
  B.wbench = sheet({ x: -300, y: 1100, w: 1680, h: 1000, col: T2, draw: x => { rr(x, -260, 1150, 1600, 1200, [90, 90, 0, 0]); x.fill(); crease(x, 'rgba(0,0,0,.3)', () => { x.setLineDash([22, 16]); x.lineWidth = 4; x.beginPath(); x.moveTo(-200, 1196); x.lineTo(1280, 1196); x.stroke(); }); } });
}
S.woman = (lt, d, t) => {
  const c = CH('woman'), laugh = 1 - prog(t, c[0].e - .15, .35), la = Math.abs(Math.sin(t * 13)), dk = eio(lt / d);
  cam.z = 1 + .13 * dk; cam.x = 4 * Math.sin(t * 1.3); cam.y = -30 * dk + 3 * Math.sin(t * 2.1) + 1.5 * Math.sin(t * 11);
  let sp = 0; for (let i = 1; i < 4; i++) if (t > c[i].s && t < c[i].e - .1) sp = 1;
  const j = laugh * (20 + 34 * la) + (1 - laugh) * (sp ? 10 + 30 * Math.abs(Math.sin(t * 9.5)) : 5);
  const surge = prog(t, c[3].s, .5) * (1 - prog(t, c[3].e, .4));
  LIT.x = 540; LIT.y = 720; LIT.r = 520; LIT.k = flick(t * 1.6) * (.92 + .2 * laugh * la) * (1 - .28 * surge); LIT.floor = .14;
  g.fillStyle = '#03070c'; g.fillRect(0, 0, W, H);
  const ob = { p: .7 };
  over(ob, x => { const gr = x.createLinearGradient(0, 300, 0, 960); gr.addColorStop(0, '#050a22'); gr.addColorStop(1, '#1c2d6c'); x.fillStyle = gr; x.fillRect(40, 300, 1000, 700); });
  lightOn(ob, x => { for (let i = 0; i < 6; i++) { const u = (t * .3 + i / 6) % 1, q = (1 - u) * (1 - u); for (const sg of [-1, 1]) halo(x, 540 + sg * (30 + q * 520), 760 - q * 300, 14 + 90 * q, AMB, .85 * (1 - u * .5)); } });
  put(B.wwall, { p: .8, trans: .5, sh: .5 }); sheen(100, 330, 880, 620, t, .03);
  put(B.wbench, { p: .92, trans: .2 });
  const s = dyn('wom', 60, 500, 960, 1500, '#3b3454', x => womanBig(x, j));
  const o = { p: 1, rot: .022 * Math.sin(t * 1.7) + laugh * .018 * Math.sin(t * 13), px: 540, py: 1560, dy: -laugh * 9 * la, trans: .05, sh: .65, sb: 40, sy: 26 }; put(s, o);
  const ek = (.75 + .25 * la * laugh + .5 * surge) * flick(t * 2.3);
  lightOn(o, x => { x.fillStyle = css([255, 150, 60], Math.min(1, .8 * ek)); x.fill(EYEL); x.fill(EYER); halo(x, 462, 826, 44 + 40 * surge, AMB, .16 * ek); halo(x, 618, 826, 44 + 40 * surge, AMB, .16 * ek); });
  put(B.front2, { p: 1.5, blur: 1, sh: .7, sb: 40, dx: -30 });
};

// ================= 6. he looks at the glass =================
function buildLook() {
  B.wall6 = sheet({ x: -300, y: -150, w: 1680, h: 2200, col: T3, draw: x => { x.fillRect(-300, -150, 1680, 2200); cut(x, () => { rr(x, 560, 450, 470, 800, 46); x.fill(); }); crease(x, 'rgba(0,0,0,.28)', () => { x.lineWidth = 5; rr(x, 534, 424, 522, 852, 60); x.stroke(); x.fillRect(-300, 1330, 1680, 5); x.fillRect(-300, 300, 1680, 5); }); } });
  B.seat6 = sheet({ x: -400, y: 900, w: 900, h: 1200, col: T2, draw: x => { rr(x, -330, 1010, 520, 1300, 80); x.fill(); rr(x, -120, 960, 200, 80, 26); x.fill(); cut(x, () => { rr(x, -90, 982, 140, 24, 12); x.fill(); }); } });
}
S.look = (lt, d, t) => {
  const dk = eio(lt / d); cam.z = 1 + .12 * dk; cam.x = 50 * dk + 4 * Math.sin(t * 1.3); cam.y = 20 * dk + 3 * Math.sin(t * 2.1) + 1.5 * Math.sin(t * 11);
  LIT.x = 300; LIT.y = 500; LIT.r = 760; LIT.k = flick(t * 1.5) * (.9 - .12 * dk); LIT.floor = .18;
  outside(t, 560, 400, 1300);
  sheen(520, 420, 560, 860, t, .05);
  put(B.wall6, { p: .9, trans: .3, sh: .5 });
  lamps({ p: .9 }, [[200, 250]], LIT.k, 460);
  put(B.seat6, { p: .97, trans: .14 });
  const fl = -1 + 2 * eio(prog(t, 25.72, .3)), tw = prog(t, 25.9, .5), rise = eio(prog(t, 26.5, .8)), sh = .012 * Math.sin(t * 31);
  const P = { bust: 1, armB: [.15, .6], armF: [lerp(.2, 1.15, rise) + sh, lerp(.9, 1.25, rise)], lean: .1 * eio(tw) + sh * .3, head: -.04 + .1 * eio(tw), hflip: Math.abs(fl) < .1 ? .1 * Math.sign(fl || 1) : fl, eye: .95, brow: -.38, mouth: .35 + .1 * Math.sin(t * 6) };
  const sa = dyn('arj6', -160, 720, 1060, 900, ARJ.shirt, x => person(x, 300, 1690, 2.6, 1, ARJ, P));
  put(sa, { p: 1.05, trans: .1, sh: .6, sb: 36, sy: 26 });
  handles({ p: 1.1 }, t, [[130, 250], [460, 250]], 2.2);
  put(B.front2, { p: 1.5, blur: 1, sh: .7, sb: 40, dx: 60 });
};

// ================= 7. the glass: his seat is empty =================
function buildMirror() {
  B.win7 = sheet({ x: -300, y: -200, w: 1680, h: 2400, col: T0, blur: 2, draw: x => { x.fillRect(-300, -200, 1680, 2400); cut(x, () => { rr(x, 96, 300, 888, 1070, 76); x.fill(); }); } });
  B.gask = sheet({ x: 40, y: 250, w: 1000, h: 1180, col: T1, draw: x => { rr(x, 70, 274, 940, 1122, 96); x.fill(); cut(x, () => { rr(x, 112, 316, 856, 1038, 62); x.fill(); }); } });
  B.rwall = sheet({ x: -200, y: 100, w: 1480, h: 1500, col: '#24505a', draw: x => { x.fillRect(-200, 100, 1480, 1500); cut(x, () => { rr(x, 130, 500, 330, 330, 30); x.fill(); rr(x, 560, 500, 330, 330, 30); x.fill(); }); crease(x, 'rgba(0,0,0,.3)', () => { x.fillRect(-200, 880, 1480, 5); }); } });
  B.rseat = sheet({ x: 100, y: 400, w: 900, h: 1100, col: '#6fa59b', draw: x => seatPath(x, 742, 1080, 1.75, -1) });
  B.rpole = sheet({ x: 300, y: 250, w: 60, h: 1200, col: '#3b6f6c', draw: x => x.fillRect(322, 250, 16, 1200) });
}
S.mirror = (lt, d, t) => {
  const push = eo(prog(lt, 0, .55)), fl = Math.exp(-lt * 4.5);
  cam.z = 1 + .1 * push + .02 * lt; cam.x = 16 * push + 3 * Math.sin(t * 1.3); cam.y = 20 * push + 2 * Math.sin(t * 2.1) + 1.5 * Math.sin(t * 11);
  LIT.x = 560; LIT.y = 760; LIT.r = 520; LIT.k = flick(t * 2) * (.8 + .35 * fl); LIT.floor = .1;
  outside(t, 560, 250, 1420, .55);
  const ro = { a: .88 };
  put(B.rwall, { ...ro, p: .72, trans: .4, sh: .4 });
  lightOn({ p: .8 }, x => { halo(x, 560, 400, 420, AMB, .4 * LIT.k); halo(x, 585, 960, 330, PALE, .1 + .25 * fl); });
  put(B.rpole, { ...ro, p: .8, trans: .3, sh: .4 });
  put(B.handle, { p: .8, dx: 330, dy: 330, sc: 2, px: 0, py: 0, rot: .14 * Math.sin(t * 2.3), sh: .3, a: .8 });
  put(B.rseat, { ...ro, p: .86, trans: .55, sh: .55, sb: 30 });
  g.fillStyle = 'rgba(40,70,120,.10)'; g.fillRect(0, 0, W, H); sheen(60, 260, 960, 1160, t, .045);
  put(B.gask, { p: 1.08, trans: .1, sh: .6 }); put(B.win7, { p: 1.1, sh: .7, sb: 36 });
  const sh = .01 * Math.sin(t * 33);
  const sa = dyn('arj7', -240, 880, 1000, 1100, DARKF.shirt, x => person(x, 110, 1830, 2.4, 1, DARKF, { bust: 1, armB: [0, .3], armF: [1.42 + sh, .36], lean: .06 + sh, head: .04, eye: 1, brow: -.4, mouth: .5 }));
  put(sa, { p: 1.3, trans: .04, sh: .7, sb: 40 });
};

// ================= 8. the bus drives on =================
function buildEnd() {
  const R = mulberry(41), tl = { x: 0, y: 500, w: 2160, h: 1700 };
  B.h1 = sheet({ ...tl, col: FAR, draw: x => { hills(x, R, 2160, 1060, 300); crease(x, 'rgba(20,30,80,.35)', () => { x.lineWidth = 4; for (let i = 0; i < 9; i++) { const px = 120 + i * 250; x.beginPath(); x.moveTo(px, 760); x.quadraticCurveTo(px + 60, 900, px - 40, 1100); x.stroke(); } }); } });
  B.h2 = sheet({ ...tl, col: MID, draw: x => hills(x, R, 2160, 1130, 170, 36) });
  B.h3 = sheet({ ...tl, col: NEAR, draw: x => hills(x, R, 2160, 1180, 80, 64) });
  B.road = sheet({ x: -300, y: 1100, w: 1680, h: 1000, col: GND, draw: x => { x.fillRect(-300, 1190, 1680, 1000); crease(x, 'rgba(0,0,0,.3)', () => x.fillRect(-300, 1236, 1680, 4)); } });
  B.rail = sheet({
    x: -200, y: 1000, w: 3400, h: 500, col: '#0d1434', draw: x => {
      x.fillRect(-200, 1228, 3400, 400);
      for (let px = -180; px < 3200; px += 96) { x.fillRect(px, 1150, 12, 90); const broken = px > 800 && px < 1090; if (!broken) { x.fillRect(px, 1160, 98, 12); x.fillRect(px, 1188, 98, 8); } }
      x.save(); x.translate(876, 1166); x.rotate(.55); x.fillRect(0, -6, 120, 12); x.restore(); x.save(); x.translate(1100, 1166); x.rotate(Math.PI - .32); x.fillRect(0, -6, 86, 12); x.restore(); x.save(); x.translate(984, 1240); x.rotate(-.2); x.fillRect(-6, -84, 12, 90); x.restore();
      rr(x, 1010, 1168, 54, 66, [22, 22, 0, 0]); x.fill(); x.beginPath(); x.ellipse(960, 1226, 22, 9, 0, 0, TAU); x.fill();
    }
  });
  B.fg = sheet({ x: 0, y: 1250, w: 2160, h: 900, col: FRONT, blur: 5, draw: x => { x.fillRect(0, 1462, 2160, 800); const Q = mulberry(9); for (let i = 0; i < 200; i++) { const px = Q() * 2160, h = 30 + Q() * 110, l = (Q() - .5) * 50; for (const ox of [-2160, 0, 2160]) { x.beginPath(); x.moveTo(px + ox - 7, 1466); x.quadraticCurveTo(px + ox, 1466 - h * .5, px + ox + l, 1466 - h); x.quadraticCurveTo(px + ox + 5, 1466 - h * .5, px + ox + 7, 1466); x.fill(); } } rr(x, 1500, 1380, 70, 100, [30, 30, 0, 0]); x.fill(); } });
  B.mist = sheet({ x: 0, y: 900, w: 2160, h: 420, col: '#8ea2d8', rim: 0, under: 0, draw: x => { x.beginPath(); x.moveTo(0, 1320); for (let i = 0; i <= 2160; i += 20) x.lineTo(i, 1010 + 40 * Math.sin(i / 2160 * TAU * 2) + 22 * Math.sin(i / 2160 * TAU * 5 + 1)); x.lineTo(2160, 1320); x.fill(); } });
}
S.end = (lt, d, t) => {
  const off = 300 + lt * 170;
  cam.z = 1.02 + .04 * lt / d; cam.x = 4 * Math.sin(t * .9) + 2 * Math.sin(t * 2.1); cam.y = -80 + 2 * Math.sin(t * 1.3) + 20 * lt / d;
  LIT.x = 780; LIT.y = 520; LIT.r = 820; LIT.k = .95 * flick(t * .6); LIT.col = [232, 206, 170]; LIT.floor = .16;
  sky('#040820', '#0f1a48', '#22336f'); stars({ p: .05 }, t, 1); moon({ p: .08 }, 790, 440, 92, 1);
  tile(B.h1, off * .1 + 300, { p: .2, trans: .3, sh: .3 });
  tile(B.mist, off * .16, { p: .3, a: .2, sh: 0 });
  tile(B.h2, off * .3, { p: .42, trans: .25 });
  tile(B.mist, off * .42 + 900, { p: .5, a: .16, sh: 0, dy: 50 });
  tile(B.h3, off * .55 + 700, { p: .66, trans: .22 });
  put(B.road, { p: 1, trans: .12 });
  const bx = 120 + lt * 17, by = 985 + 2 * Math.sin(t * 6.3), rot = off / 31, lit = .92 * flick(t * 1.4);
  for (const [e, a] of [[84, .1], [42, .2]]) { const o = { p: 1, dx: bx - e, dy: by, sc: .5, px: 0, py: 0, a, sh: 0 }; put(B.bus, o); }
  lightOn({ p: 1 }, x => halo(x, bx + 300, by + 100, 520, [150, 180, 255], .16));
  drawBus(bx, by, .5, 1, lit, null, .8, rot, 1);
  put(B.rail, { p: 1.06, dx: -(off - 300) * 1.06, trans: .07, sh: .5 });
  const dxm = -(off - 300) * 1.06; lightOn({ p: 1.06, dx: dxm }, x => { const f = flick(t * 3) * (.85 + .15 * Math.sin(t * 17)); halo(x, 960, 1208, 150, AMB, .6 * f); halo(x, 960, 1210, 26, PALE, f); x.fillStyle = css(PALE, .95); x.beginPath(); x.ellipse(960, 1204 - 6 * f, 5, 12 * f, 0, 0, TAU); x.fill(); });
  tile(B.fg, off * 1.7, { p: 1.5, blur: 1, sh: .7, sb: 40 });
};

function buildAll() { buildBus(); buildStop(); buildInside(); buildSide(); buildWoman(); buildLook(); buildMirror(); buildEnd(); }
