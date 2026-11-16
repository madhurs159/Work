// Shadow-puppet staging of the last-bus story. Everything is a pure function of t.
const W = 1080, H = 1920, CX = 540, CY = 790, RECT = [36, 110, 1044, 1470];
const PI = Math.PI;
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x)), lerp = (a, b, k) => a + (b - a) * k;
const seg = (t, a, b) => clamp((t - a) / (b - a)), sm = x => x * x * (3 - 2 * x), E = (t, a, b) => sm(seg(t, a, b));
const eo = x => 1 - Math.pow(1 - x, 3), eio = x => x < .5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
const back = (x, c = 1.9) => 1 + (c + 1) * Math.pow(x - 1, 3) + c * Math.pow(x - 1, 2);
const hash = n => { const x = Math.sin(n * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
const vn = x => { const i = Math.floor(x), f = x - i, u = f * f * (3 - 2 * f); return hash(i) * (1 - u) + hash(i + 1) * u; };
const trm = (t, s, a) => ((vn(t * 2.1 + s * 17.3) - .5) * 2 + (vn(t * 5.7 + s * 7.1) - .5) * .7) * a;
let T, L, S0 = [], GLr, trc, tr, frc, fr, lyc, ly, FRAMEC, A = {}, PEND = {};
const SI = 1.9, SE = 1.35, FL = 1330;               // interior / exterior puppet scale, floor line
const SEATS = [250, 550, 850, 1150], HIPY = FL - SOLE * SI;

function camSet(g, c) { g.setTransform(c[2], 0, 0, c[2], CX - c[0] * c[2], CY - c[1] * c[2]); }
function dev(g, x, y) { const m = g.getTransform(); return [m.a * x + m.c * y + m.e, m.b * x + m.d * y + m.f]; }
function ik(sx, sy, tx, ty, a, b, bend) {
  let dx = tx - sx, dy = ty - sy, d0 = Math.hypot(dx, dy) || 1, d = clamp(d0, Math.abs(a - b) + 1, a + b - .5);
  const base = Math.atan2(dy, dx), A1 = Math.acos(clamp((a * a + d * d - b * b) / (2 * a * d), -1, 1)), a1 = base + bend * A1;
  const ex = sx + Math.cos(a1) * a, ey = sy + Math.sin(a1) * a, hx = sx + dx / d0 * d, hy = sy + dy / d0 * d;
  return { a1, a2: Math.atan2(hy - ey, hx - ex), hx, hy };
}
let RODS = [];
function drawFig(g, F, p) {
  const s = p.s, fl = p.flip ?? 1, ten = p.ten ?? 1, sd = F.seed, t = p.t, rods = p.rods === false ? null : RODS;
  g.save(); g.translate(p.x + trm(t, sd, 2.4 * ten), p.y + trm(t, sd + 3, 1.7 * ten)); g.scale(s * fl, s); g.rotate((p.rot || 0) + trm(t, sd + 5, .016 * ten));
  if (F.lower) drawPiece(g, F.lower);
  if (F.th) for (const sdn of ['B', 'F']) { const hp = JN['hip' + sdn]; g.save(); g.translate(hp[0], hp[1]); g.rotate(p['th' + sdn] || 0); drawPiece(g, F.th); rivet(g, 0, 0, 3.2); g.translate(0, TH); g.rotate(p['sh' + sdn] || 0); drawPiece(g, F.sh); rivet(g, 0, 0, 3); g.restore(); }
  g.rotate(p.lean || 0);
  if (F.pack && p.pack !== false) drawPiece(g, F.pack);
  drawPiece(g, F.torso);
  if (F.bag) { g.save(); g.translate(-14, -2); g.rotate(p.bag || 0); drawPiece(g, F.bag); g.restore(); }
  for (const sdn of ['B', 'F']) {
    const S = JN['sh' + sdn], h = p['hand' + sdn] || (sdn === 'F' ? [10, 100] : [-8, 100]);
    const r = ik(S[0], S[1], S[0] + h[0], S[1] + h[1], UA, FA, p['bend' + sdn] ?? 1);
    if (sdn === 'B' && F.stick && p.stick) { g.save(); g.translate(r.hx, r.hy); g.rotate(-(p.lean || 0)); drawPiece(g, F.stick); g.restore(); }
    g.save(); g.translate(S[0], S[1]); g.rotate(r.a1 - PI / 2); drawPiece(g, F.ua); rivet(g, 0, 0, 3.2);
    g.translate(0, UA); g.rotate(r.a2 - r.a1); drawPiece(g, sdn === 'F' && F.faF ? F.faF : F.fa); rivet(g, 0, 0, 3);
    if (sdn === 'F' && p.note) { g.save(); g.translate(0, FA + 6); g.rotate(p.noteRot ?? -.5); drawPiece(g, F.note); g.restore(); }
    if (rods) rods.push([dev(g, 0, FA + 4), sdn === 'F' ? 26 : -22]);
    g.restore();
  }
  g.save(); g.translate(JN.neck[0], JN.neck[1]); g.rotate(p.head || 0); g.scale(p.hflip ?? 1, 1);
  if (F.jaw) { g.save(); g.translate(JW[0] * HK, JW[1] * HK); g.rotate(p.jaw || 0); drawPiece(g, F.jaw); g.restore(); }
  drawPiece(g, F.head);
  if (F.jaw) rivet(g, JW[0] * HK, JW[1] * HK, 2.6);
  if (F.ear) { g.save(); g.translate(-12 * HK, -25 * HK); g.rotate((p.ear || 0) - (p.head || 0) - (p.lean || 0)); drawPiece(g, F.ear); g.restore(); }
  if (rods) rods.push([dev(g, 0, 2), -8]);
  g.restore(); g.restore();
}
// Soft grey control rods, just off the cloth
function drawRods(g) {
  if (!RODS.length) return;
  g.save(); g.setTransform(1, 0, 0, 1, 0, 0); g.globalCompositeOperation = 'multiply'; g.filter = 'blur(2.4px)'; g.strokeStyle = 'rgba(126,108,96,.5)'; g.lineWidth = 7; g.lineCap = 'round';
  g.beginPath(); for (const [[x, y], dx] of RODS) { g.moveTo(x, y); g.lineTo(x + dx * (1600 - y) / 300, 1600); } g.stroke(); g.restore(); g.filter = 'none'; RODS = [];
}
// Press-on / lift-off: a piece pulled toward the lamp grows, blurs and pales. u = 0 on the cloth, 1 gone.
function lifted(u, cx, cy, c, fn, fade) {
  if (u <= .003) { camSet(tr, c); fn(tr); return; }
  if (u >= .997) return;
  const keep = RODS; RODS = [];
  ly.setTransform(1, 0, 0, 1, 0, 0); ly.globalCompositeOperation = 'source-over'; ly.fillStyle = '#fff'; ly.fillRect(0, 0, W, H);
  ly.globalCompositeOperation = 'multiply'; camSet(ly, c); fn(ly);
  ly.setTransform(1, 0, 0, 1, 0, 0); ly.globalCompositeOperation = 'source-over'; ly.fillStyle = `rgba(255,255,255,${clamp(fade ?? u * u)})`; ly.fillRect(0, 0, W, H);
  RODS = keep;
  const dx = (cx - c[0]) * c[2] + CX, dy = (cy - c[1]) * c[2] + CY, k = 1 + .42 * u;
  tr.save(); tr.setTransform(1, 0, 0, 1, 0, 0); tr.filter = `blur(${(u * 30).toFixed(2)}px)`; tr.translate(dx, dy); tr.scale(k, k); tr.translate(-dx, -dy); tr.drawImage(lyc, 0, 0); tr.restore(); tr.filter = 'none';
}
function tile(g, p, x0, x1, y, off = 0) { for (let x = Math.floor((x0 - off) / 600) * 600 + off; x < x1; x += 600) g.drawImage(p.c, x, y, p.w, p.h); }
function at(g, p, x, y, rot = 0, sx = 1, sy = sx) { g.save(); g.translate(x, y); g.rotate(rot); g.scale(sx, sy); drawPiece(g, p); g.restore(); }
function lampFl(k, t, amt = 1) { return 1 + amt * (.07 * (vn(t * 7 + k * 13) - .5) * 2 + .03 * Math.sin(t * 23 + k)); }

// ================= sets =================
function interior(g, t, o = {}) {
  tile(g, A.roof, -200, 2100, 526); tile(g, A.floor, -200, 2100, FL);
  g.save(); g.globalAlpha = 1; for (let x = 100; x < 1900; x += 150) at(g, A.strap, x, 590, PEND.strap[(x / 150 | 0) % 3](t));
  g.restore();
  at(g, A.postT, 78, 592);
  if (!o.noFront) at(g, A.postT, 1440, 592);
  for (const sx of SEATS) { at(g, A.post, sx - 58 * SI, 592); at(g, A.seat, sx, HIPY, 0, SI); }
}
const sit = (x, t, o) => ({ x, y: HIPY, s: SI, t, pack: false, thF: -1.5, shF: 1.5, thB: -1.42, shB: 1.42, ...o });
function exteriorGround(g, off) { tile(g, A.ground, -400, 1700, FL, off); }
function drawBus(g, x, t, o = {}) {      // nose at x, facing left
  const y0 = FL - BUS.wheelY - BUS.wheelR, bob = o.still ? 0 : Math.sin(t * 9) * 2 + trm(t, 91, 1.5);
  g.save(); g.translate(x, y0 + bob); g.rotate(o.rot || 0);
  drawPiece(g, o.wreck ? A.busW : A.bus);
  if (o.heads) for (const [F, i, hd] of [[A.arjun, 1, .06], [A.woman, 4, .12]]) {
    g.save(); g.translate(BUS.win(i) + 62, 258); g.scale(-1.22, 1.22); g.rotate(hd + trm(t, i, .03)); if (F.jaw) { g.save(); g.translate(JW[0] * HK, JW[1] * HK); drawPiece(g, F.jaw); g.restore(); } drawPiece(g, F.head); g.restore();
  }
  g.restore();
  BUS.wheels.forEach((wx, i) => { if (o.wreck && i === 0) at(g, A.wheel, x + wx - 150, FL - 30, 1.2, 1, .5); else at(g, A.wheel, x + wx, FL - BUS.wheelR + bob * .3 + (o.wreck ? 6 : 0), o.spin || 0); });
  if (!o.noRod) RODS.push([dev(g, x + 560, y0 + 330), 0], [dev(g, x + 160, y0 + 330), 0]);
}

// ================= scenes: each returns {cam, lamps:[[x,y,I,hot]], shake} =================
const SC = {
  stop(t, lt, d) {
    const cam = [540 + 14 * eo(seg(lt, 0, d)), 790, 1 + .03 * eo(seg(lt, 0, d))];
    const busX = lerp(1300, 500, eo(seg(lt, .7, 2.5)));
    camSet(tr, cam);
    exteriorGround(tr, 0); at(tr, A.moon, 800, 400, trm(t, 40, .012)); at(tr, A.sign, 150, FL);
    drawBus(tr, busX, t, { spin: -busX / BUS.wheelR, still: lt > 2.6 });
    lifted(Math.max(1 - E(lt, .2, .75), E(lt, 2.2, 3.0)), 410, 330, cam, g => at(g, A.pl1140, 410 + trm(t, 44, 3), 330 + trm(t, 45, 2), trm(t, 46, .02)));
    // Arjun: waits, shuffles to the door, hops in and is lifted off the cloth
    const run = seg(lt, 2.55, 3.35), hop = seg(lt, 3.35, 3.75), ph = lt * 15, go = run > 0 && hop < 1 ? 1 : 0;
    const ax = lerp(290, 455, run) + 150 * hop, ay = FL - (TH + SOLE) * SE - Math.sin(hop * PI) * 46 - go * Math.abs(Math.sin(ph)) * 6 * (hop > 0 ? 0 : 1);
    const look = E(lt, .9, 1.5) * (1 - run);
    lifted(E(lt, 3.5, 4.15), ax, ay - 100, cam, g => drawFig(g, A.arjun, {
      x: ax, y: ay, s: SE, t, rot: -.03 * look + .09 * go, head: -.16 * look,
      thF: go ? .42 * Math.sin(ph) - .5 * Math.sin(hop * PI) : -.13, thB: go ? -.42 * Math.sin(ph) : .12, shF: go ? .3 * (1 - Math.sin(ph)) : 0, shB: go ? .3 * (1 + Math.sin(ph)) : 0,
      handF: go ? [20 + 26 * Math.sin(ph), 78] : [lerp(12, 34, look), lerp(100, 30, look)], handB: go ? [-14 - 26 * Math.sin(ph), 84] : [-10, 100],
    }));
    return { cam, lamps: [[800, 396, 1, .95], [busX - 30, FL - 150, .5 * E(lt, .7, 1.6), .7]] };
  },
  inside(t, lt, d) {
    const pan = eio(seg(lt, .9, 3.7)), cam = [lerp(1085, 400, pan) - 12 * seg(lt, 3.7, d), 950, 1.2 + .06 * E(lt, 3.6, d)];
    const sh = [trm(t, 70, 2.5), trm(t, 72, 3)];
    camSet(tr, cam); tr.translate(sh[0], sh[1]); interior(tr, t);
    const press = 1 - E(lt, .05, .55);
    lifted(press, 1150, HIPY - 100, cam, g => { g.translate(sh[0], sh[1]); drawFig(g, A.arjun, sit(1150, t, { head: .04 + .07 * Math.sin(lt * 1.9), handF: [30, 62], handB: [22, 66], lean: .02 })); });
    const wake = E(lt, 4.0, 4.9);
    drawFig(tr, A.woman, sit(250, t, { lean: .2, head: lerp(.34, -.02, wake), handF: [34, 58], handB: [46, 34], stick: 1, ear: PEND.ear(t), ten: .6 }));
    const sw = 2100 - ((t * 950) % 3000);
    return { cam, lamps: [[1100, 640, 1, .9], [330, 690, .55 * lampFl(5, t, 3), .9], [sw, 430, .3, .5]] };
  },
  cond(t, lt, d) {
    const cam = [lerp(1130, 1010, eio(seg(lt, 1.5, d))), 955, 1.14];
    const sh = [trm(t, 70, 2.5), trm(t, 72, 3)];
    camSet(tr, cam); tr.translate(sh[0], sh[1]); interior(tr, t);
    const cx = 1730 - 205 * lt, passed = E(lt, 3.25, 3.45), raise = back(seg(lt, 1.15, 1.7), 1.2), droop = E(lt, 4.2, 5.4), ph = lt * 9;
    drawFig(tr, A.arjun, sit(1150, t, {
      lean: .08 * raise - .1 * passed, head: -.14 * raise * (1 - passed) + .1 * passed, hflip: lerp(1, -1, passed) || .04,
      handF: [lerp(30, 76, raise) - 10 * droop + 3 * Math.sin(lt * 7) * raise, lerp(62, -34, raise) + 26 * droop], note: raise > .2, noteRot: -.9, handB: [22, 66], ten: 1 + raise,
    }));
    drawFig(tr, A.cond, {
      x: cx, y: FL - (TH + SOLE) * SI - Math.abs(Math.sin(ph)) * 7, s: SI, flip: -1, t, rot: .05, head: .06, bag: PEND.bag(t),
      thF: .34 * Math.sin(ph), thB: -.34 * Math.sin(ph), shF: .25 * (1 - Math.sin(ph)), shB: .25 * (1 + Math.sin(ph)), handF: [46, 26], handB: [-12 - 22 * Math.sin(ph), 92],
    });
    const sw = 2100 - ((t * 950) % 3000);
    return { cam, lamps: [[1120, 650, 1, .9], [sw, 430, .3, .5]] };
  },
  call(t, lt, d) {
    const cam = [lerp(880, 850, seg(lt, 0, d)), 950, 1.1 + .04 * seg(lt, 0, d)];
    const sh = [trm(t, 70, 2.5), trm(t, 72, 3)];
    camSet(tr, cam); tr.translate(sh[0], sh[1]); interior(tr, t);
    const cs = chunks(L[3]), c1 = cs[1].s - S0[3], c3 = cs[cs.length - 1].s - S0[3];
    const rise = back(seg(lt, .25, .7), 1.6) * (1 - E(lt, c3 + .1, c3 + .9)), shout = E(lt, c1, c1 + .2) * (1 - E(lt, c3 - .1, c3 + .3)), sad = E(lt, c3 + .2, c3 + 1), cx = 650 - 72 * lt, ph = lt * 6.5;
    drawFig(tr, A.arjun, sit(1150 - 46 * rise, t, {
      y: HIPY - 66 * rise, flip: -1, lean: .2 * rise + .05 * shout * Math.sin(lt * 20), head: -.12 * rise + .3 * sad,
      thF: lerp(-1.5, -.75, rise), shF: lerp(1.5, .5, rise), thB: lerp(-1.42, -.5, rise), shB: lerp(1.42, .6, rise),
      handF: [lerp(30, 86 + 10 * shout, rise) + 4 * Math.sin(lt * 17) * shout, lerp(62, -30 - 16 * shout, rise)], note: 1, noteRot: -.7, handB: [lerp(22, 40, rise), lerp(66, 30, rise)], ten: 1 + 2 * rise,
    }));
    drawFig(tr, A.cond, {
      x: cx, y: FL - (TH + SOLE) * SI - Math.abs(Math.sin(ph)) * 6, s: SI, flip: -1, t, rot: .05, head: .07, bag: PEND.bag(t),
      thF: .28 * Math.sin(ph), thB: -.28 * Math.sin(ph), shF: .2 * (1 - Math.sin(ph)), shB: .2 * (1 + Math.sin(ph)), handF: [46, 26], handB: [-12 - 18 * Math.sin(ph), 92],
    });
    lifted(Math.max(1 - E(lt, c1 - .05, c1 + .25), E(lt, c3, c3 + .6)), 790, 430, cam, g => { at(g, A.plTicket, 790 + trm(t, 47, 4), 432 + trm(t, 48, 3) + 5 * Math.sin(lt * 20) * shout, -.04 + trm(t, 49, .03)); });
    if (lt > c1 + .1 && lt < c3 + .2) RODS.push([dev(tr, 790, 500), 2]);
    return { cam, lamps: [[900, 650, 1, .9], [2100 - ((t * 950) % 3000), 430, .35, .5]] };
  },
  woman(t, lt, d) {
    const cam = [lerp(318, 330, seg(lt, 0, d)), lerp(905, 885, seg(lt, 0, d)), lerp(1.62, 1.9, eo(seg(lt, 0, d)))];
    const la = E(lt, .25, .6) * (1 - E(lt, 1.95, 2.35)), sp = E(lt, 2.3, 2.5) * (1 - E(lt, 5.0, 5.25)), pt = back(seg(lt, 2.5, 3.1), 1.4);
    const sh = [trm(t, 70, 2), trm(t, 72, 2.4)];
    camSet(tr, cam); tr.translate(sh[0], sh[1]); interior(tr, t);
    drawFig(tr, A.woman, sit(250, t, {
      lean: .2 - .1 * la + .05 * la * Math.sin(lt * 14) + .08 * pt, head: -.3 * la + .07 * la * Math.sin(lt * 14 + 1) + .03 * sp * Math.sin(lt * 9), y: HIPY - 5 * la * Math.abs(Math.sin(lt * 14)),
      jaw: la * (.13 + .11 * Math.sin(lt * 14)) + sp * (.13 + .12 * Math.sin(lt * 10.5)), handF: [lerp(34, 78, pt) + 3 * Math.sin(lt * 5) * pt, lerp(58, -44, pt)], bendF: 1, handB: [46, 34], stick: 1, ear: PEND.ear(t), ten: .8 + la,
    }));
    const hb = 1 + .1 * Math.pow(Math.max(0, Math.sin(t * 7.2)), 6);
    return { cam, lamps: [[300, 800, 1.0 * hb * lampFl(3, t, 2.2), 1]], expoK: .82 };
  },
  look(t, lt, d, mir) {
    const lm = mir ? lt : -1, zt = back(seg(lm, 0, .14), 1.4);
    const c0 = [lerp(1185, 1200, eio(seg(lt, .4, d))), 928, lerp(1.5, 1.86, eio(seg(lt, .3, d)))];
    const cam = mir ? [lerp(1200, 1345 + 30 * seg(lm, .2, d), zt), lerp(928, 935, zt), lerp(1.86, 1.1 + .1 * seg(lm, .2, d), zt)] : c0;
    const ten = mir ? 4.5 : 2 + 2 * seg(lt, 0, d), sh = [trm(t, 70, 2.5), trm(t, 72, 3)];
    camSet(tr, cam); tr.translate(sh[0], sh[1]); interior(tr, t, { noFront: 1 });
    // the window: frame + glass, with the reflection of his seat mirrored about the pane edge
    drawPiece2(tr, A.win.glass, 1290, 600); drawPiece2(tr, A.win.frame, 1290, 600);
    tr.save(); tr.beginPath(); tr.roundRect(1324, 634, 452, 592, 20); tr.clip(); tr.globalAlpha = .8;
    at(tr, A.seat, 1520, HIPY, 0, -SI, SI); at(tr, A.post, 1520 + 58 * SI, 592); at(tr, A.strap, 1450, 628, -PEND.strap[1](t)); at(tr, A.strap, 1650, 628, -PEND.strap[2](t));
    tr.restore();
    const turn = mir ? 1 : E(lt, .3, .5), fl = lerp(-1, 1, turn), reach = mir ? 0 : E(lt, 1.3, 2.9), rec = mir ? back(seg(lm, .02, .25), 2) : 0;
    drawFig(tr, A.arjun, sit(1150, t, {
      flip: Math.abs(fl) < .06 ? .06 : fl, lean: .13 * turn * (1 - rec) - .16 * rec, head: -.05 - .2 * rec,
      handF: [lerp(lerp(30, 72, reach), 58, rec), lerp(lerp(62, -30, reach), -6, rec)], handB: [lerp(22, 46, rec), lerp(66, 16, rec)], ten,
    }));
    const fla = mir ? (lm < .35 ? lerp(0, .8, eo(lm / .35)) + .7 * Math.sin(lm / .35 * PI) : .8) : 0;
    return { cam, lamps: [[1140, 700, mir ? .9 : lerp(.95, .7, seg(lt, 0, d)) * lampFl(2, t, 1 + 2 * seg(lt, 0, d)), .9], [1500, 770, mir ? fla * lampFl(4, t) : .16 * E(lt, 1, d), 1]], fade: mir ? .5 * (1 - seg(lm, 0, .3)) : 0, expoK: mir ? .9 : .9 };
  },
  mirror(t, lt, d) { return SC.look(t, lt, d, true); },
  end(t, lt, d) {
    const W0 = 2.35, W1 = 3.75, CARD = 6.95;
    const cam = [540, 800, .8 + .03 * seg(lt, 0, W0) + .05 * E(lt, CARD - .2, d)];
    const scroll = lt < W0 ? 300 * lt : 300 * W0 + 110 * Math.max(0, lt - W1), wk = lt >= W0 && lt < W1, gh = lt >= W1;
    camSet(tr, cam);
    exteriorGround(tr, scroll % 600); lifted(E(lt, CARD - .5, CARD + .1), 880, 300, cam, g => at(g, A.moon, 880, 300, trm(t, 40, .012)));
    camSet(tr, cam);
    if (lt < W0) for (const bx of [100, 850, 1600]) { const x = ((bx + scroll + 400) % 2250) - 400; at(tr, A.pole, x, FL + 2, trm(t, bx, .006)); }
    if (wk) at(tr, A.tree1, 78 + trm(t, 60, 2), FL + 2, -.13 + .02 * Math.sin(lt * 30) * (1 - seg(lt, W0, W0 + .6)));
    lifted(Math.max(1 - E(lt, .2, .6), E(lt, 2.0, 2.5)), 330, 380, cam, g => at(g, A.pl3, 330 + trm(t, 44, 3), 380 + trm(t, 45, 2), trm(t, 46, .02)));
    const bx0 = 180;
    if (!gh) drawBus(tr, bx0 + (wk ? 0 : 60 * (1 - seg(lt, 0, W0))), t, wk ? { wreck: 1, rot: .035, still: 1 } : { spin: -scroll / BUS.wheelR, heads: 1 });
    else {
      const u = lt - W1, bx = bx0 - 80 * u - 30 * u * u, off = E(lt, 6.1, 6.95);
      lifted(lerp(.15, 1, off), bx + 560, FL - 300, cam, g => drawBus(g, bx, t, { spin: -(scroll + 80 * u) / BUS.wheelR, heads: 1, noRod: 1 }), lerp(.3, 1, off));
    }
    const card = lt - CARD;
    if (card > 0) {
      lifted(1 - E(card, 0, .4), 540, 560, cam, g => at(g, A.plEnd1, 540 + trm(t, 50, 2.5), 540 + trm(t, 51, 2), trm(t, 52, .012)));
      lifted(1 - E(card, .25, .65), 540, 900, cam, g => at(g, A.plEnd2, 540 + trm(t, 53, 2.5), 880 + trm(t, 54, 2), trm(t, 55, .014)));
      camSet(tr, cam); if (card > .7) RODS.push([dev(tr, 500, 720), 3], [dev(tr, 580, 960), -3]);
    }
    const u = Math.max(0, lt - W1), gx = bx0 + 500 - 80 * u - 30 * u * u;
    const moon = wk ? .8 * (.75 + .25 * Math.sin(lt * 46)) * lampFl(1, t, 4) : gh ? lerp(1, .12, E(lt, 4.6, 6.6)) : 1;
    const cf = card > 0 ? (card < .4 ? lerp(0, 1, eo(card / .4)) + .4 * Math.sin(card / .4 * PI) : 1) : 0;
    return { cam, lamps: [[880, 296, moon, .95], [gh ? Math.max(gx, -400) : bx0 + 420, FL - 330, gh ? .5 * (1 - E(lt, 5.6, 6.9)) : .32, .5], [540, 700, 1.3 * cf * lampFl(6, t), .7]], fade: wk ? .35 * (1 - seg(lt, W0, W0 + .25)) : 0, expoK: card > 0 ? lerp(1, 1.3, seg(card, 0, .4)) : 1 };
  },
};
function drawPiece2(g, p, x, y) { g.drawImage(p.c, x + p.x0, y + p.y0, p.w, p.h); }

// ================= front layer: lacquered frame, audience, storyteller's placard =================
function buildFrame() {
  const [c, g] = canvas(W, H);
  const gr = g.createLinearGradient(0, 0, 0, H); gr.addColorStop(0, '#210d07'); gr.addColorStop(.74, '#180905'); gr.addColorStop(.8, '#0e0503'); gr.addColorStop(1, '#050201'); g.fillStyle = gr; g.fillRect(0, 0, W, H);
  g.globalAlpha = .1; g.strokeStyle = '#6a3414'; g.lineWidth = 1.2; for (let k = 0; k < 150; k++) { const y = hash(k) * 1500, x = hash(k + 7) * W; g.beginPath(); g.moveTo(x, y); g.bezierCurveTo(x + 60, y + 4 * hash(k + 1), x + 140, y - 5, x + 200 + 200 * hash(k + 2), y + 3); g.stroke(); } g.globalAlpha = 1;
  // lintel band + gold meander
  g.fillStyle = '#2b100a'; g.fillRect(0, 60, W, 44);
  g.strokeStyle = 'rgba(190,142,62,.75)'; g.lineWidth = 2; g.beginPath(); for (let x = 30; x < W - 40; x += 32) { g.moveTo(x, 94); g.lineTo(x, 72); g.lineTo(x + 20, 72); g.lineTo(x + 20, 86); g.lineTo(x + 10, 86); g.lineTo(x + 10, 80); } g.stroke();
  g.beginPath(); g.moveTo(0, 60); g.lineTo(W, 60); g.moveTo(0, 104); g.lineTo(W, 104); g.stroke();
  // sill
  const sg = g.createLinearGradient(0, 1470, 0, 1506); sg.addColorStop(0, '#4a1d0e'); sg.addColorStop(.3, '#2c110a'); sg.addColorStop(1, '#170805'); g.fillStyle = sg; g.fillRect(0, 1470, W, 36);
  g.strokeStyle = 'rgba(190,142,62,.8)'; g.lineWidth = 2; g.beginPath(); g.moveTo(0, 1481); g.lineTo(W, 1481); g.stroke();
  // warm spill on the inner edges + thin gold line round the opening
  g.save(); g.shadowColor = 'rgba(255,130,45,.8)'; g.shadowBlur = 40; g.strokeStyle = 'rgba(230,140,60,.45)'; g.lineWidth = 3; for (let k = 0; k < 2; k++) g.strokeRect(RECT[0] - 2, RECT[1] - 2, RECT[2] - RECT[0] + 4, RECT[3] - RECT[1] + 4); g.restore();
  g.strokeStyle = 'rgba(205,160,80,.85)'; g.lineWidth = 2; g.strokeRect(RECT[0] - 12, RECT[1] - 12, RECT[2] - RECT[0] + 24, RECT[3] - RECT[1] + 24);
  // light falling into the room below the sill
  const lg = g.createRadialGradient(540, 1500, 40, 540, 1500, 620); lg.addColorStop(0, 'rgba(255,130,50,.2)'); lg.addColorStop(1, 'rgba(255,130,50,0)'); g.fillStyle = lg; g.fillRect(0, 1500, W, 420);
  // audience heads: dark, warm rim
  for (const [x, y, r] of [[120, 1900, 96], [350, 1925, 110], [590, 1905, 92], [820, 1930, 118], [1010, 1895, 84]]) {
    g.save(); g.filter = 'blur(7px)'; g.fillStyle = 'rgba(150,70,24,.55)'; g.beginPath(); g.ellipse(x, y - 5, r * .8, r, 0, 0, 7); g.fill(); g.fillStyle = '#060201'; g.beginPath(); g.ellipse(x, y + 3, r * .8, r, 0, 0, 7); g.fill(); g.restore();
  }
  g.clearRect(RECT[0], RECT[1], RECT[2] - RECT[0], RECT[3] - RECT[1]);
  return c;
}
function chunks(Ln) {
  if (Ln._c) return Ln._c; const parts = Ln.say.split(/(?<=[।,?!])\s*/).filter(Boolean), tot = parts.reduce((a, p) => a + p.length, 0); let s = Ln.start;
  return Ln._c = parts.map(p => { const dd = (Ln.end - Ln.start) * p.length / tot, o = { s, e: s + dd, p: p.replace(/[।,]$/, '') }; s += dd; return o; });
}
function placard(g, t) {
  const gone = E(t, L[L.length - 1].end + .35, L[L.length - 1].end + .9); if (gone >= 1) return;
  const x = 56, w = 968, y = 1512 + 30 * gone, h = 168;
  g.save(); g.globalAlpha = 1 - gone;
  g.strokeStyle = 'rgba(120,84,50,.9)'; g.lineWidth = 3; g.beginPath(); g.moveTo(x + 120, 1500); g.lineTo(x + 120, y + 4); g.moveTo(x + w - 120, 1500); g.lineTo(x + w - 120, y + 4); g.stroke();
  g.shadowColor = 'rgba(0,0,0,.7)'; g.shadowBlur = 20; g.shadowOffsetY = 5;
  const gr = g.createLinearGradient(0, y, 0, y + h); gr.addColorStop(0, '#3a170d'); gr.addColorStop(.5, '#27100a'); gr.addColorStop(1, '#1a0906'); g.fillStyle = gr; g.beginPath(); g.roundRect(x, y, w, h, 8); g.fill(); g.shadowColor = 'transparent';
  g.strokeStyle = 'rgba(190,146,70,.85)'; g.lineWidth = 1.8; g.beginPath(); g.roundRect(x + 8, y + 8, w - 16, h - 16, 4); g.stroke();
  // small carved seal
  const sx = x + 26, sy = y + h / 2 - 26; g.fillStyle = '#a82418'; g.beginPath(); g.roundRect(sx, sy, 52, 52, 5); g.fill(); g.strokeStyle = 'rgba(255,222,190,.6)'; g.lineWidth = 1.4; g.beginPath(); g.roundRect(sx + 4, sy + 4, 44, 44, 3); g.stroke();
  g.fillStyle = '#f6dcc0'; g.font = '34px Rozha'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('क', sx + 26, sy + 28);
  for (const Ln of L) {
    if (t < Ln.start - .05 || t > Ln.end + .3) continue; const cs = chunks(Ln), c = cs.find(c => t < c.e) || cs[cs.length - 1];
    g.font = '62px Tiro'; let rows = [c.p]; const maxw = w - 150;
    if (g.measureText(c.p).width > maxw) { const ws = c.p.split(' '); let best = 1, bd = 1e9; for (let k = 1; k < ws.length; k++) { const dd = Math.abs(g.measureText(ws.slice(0, k).join(' ')).width - g.measureText(ws.slice(k).join(' ')).width); if (dd < bd) { bd = dd; best = k; } } rows = [ws.slice(0, best).join(' '), ws.slice(best).join(' ')]; }
    const k = eo(seg(t, c.s, c.s + .18)) * (1 - seg(t, Ln.end + .12, Ln.end + .3));
    g.globalAlpha = (1 - gone) * k; g.fillStyle = '#f5e4c0'; g.textAlign = 'center'; g.textBaseline = 'middle';
    rows.forEach((r, i) => g.fillText(r, x + w / 2 + 34, y + h / 2 + 4 + (i - (rows.length - 1) / 2) * 72 + (1 - k) * 14));
    break;
  }
  g.restore();
}

// ================= frame =================
window.render = function (t) {
  t = clamp(t, 0, T.total - 1e-4);
  let i = 0; for (let k = 0; k < L.length; k++) if (t >= S0[k]) i = k;
  const s0 = S0[i], s1 = i < L.length - 1 ? S0[i + 1] : T.total, lt = t - s0, d = s1 - s0;
  tr.setTransform(1, 0, 0, 1, 0, 0); tr.globalCompositeOperation = 'source-over'; tr.globalAlpha = 1; tr.filter = 'none'; tr.fillStyle = '#fff'; tr.fillRect(0, 0, W, H); tr.globalCompositeOperation = 'multiply';
  RODS = [];
  const st = SC[L[i].id](t, lt, d);
  drawRods(tr);
  // lamps dim and gutter between scenes (never a crossfade); the mirror scene arrives on a flash instead
  let dip = 1; for (let k = 1; k < L.length; k++) { if (L[k].id === 'mirror') continue; const u = 1 - Math.abs(t - S0[k]) / .24; if (u > 0) dip = Math.min(dip, 1 - .93 * sm(u) * (.85 + .15 * Math.sin(t * 70))); }
  dip *= E(t, 0, .7) * (1 - E(t, T.total - .35, T.total - .02) * .85);
  const lamps = st.lamps.map((l, k) => [l[0], l[1], Math.max(0, l[2] * dip * (k === 0 && L[i].id !== 'woman' ? lampFl(k, t) : 1)), l[3]]);
  const tot = Math.max(.25, st.lamps.reduce((a, l) => a + Math.max(0, l[2]), 0));
  fr.setTransform(1, 0, 0, 1, 0, 0); fr.clearRect(0, 0, W, H); fr.drawImage(FRAMEC, 0, 0); placard(fr, t);
  GLr.render(trc, frc, {
    cam: st.cam, ctr: [CX, CY], rect: RECT, lamps, sigB: 540, sigC: 88, amb: .2, expo: 1.75 * (st.expoK || 1) / Math.sqrt(tot), time: t,
    fade: st.fade || 0, fadeCol: [1, .9, .7], bloom: .42, thr: .7, vign: .5, sat: 1.1, contrast: .2, grain: .012, grainSeed: Math.floor(t * 30) * 17.13,
  });
};
window.init = async function (tm) {
  T = tm; L = T.lines; S0 = L.map((l, k) => k ? l.start - .3 : 0);
  await Promise.all([document.fonts.load('62px Tiro', 'अर्जुन ने 1'), document.fonts.load('60px Rozha', 'कहानी 11:40 PM')]); await document.fonts.ready;
  const cv = document.getElementById('c'); GLr = makeGL(cv);
  [trc, tr] = canvas(W, H);[frc, fr] = canvas(W, H);[lyc, ly] = canvas(W, H);
  FRAMEC = buildFrame();
  Object.assign(A, {
    arjun: buildArjun(), woman: buildWoman(), cond: buildConductor(), seat: buildSeat(), bus: buildBus(false), busW: buildBus(true), wheel: buildWheel(), moon: buildMoon(),
    tree1: buildTree(63), pole: buildPole2(), ground: buildStrip(DYE.hide2, 'ground', 65), floor: buildStrip(DYE.ochre, 'floor', 66), roof: buildStrip(DYE.brown, 'roof', 67),
    post: buildPost(false), postT: buildPost(true), strap: buildStrap(), win: buildWindow(), sign: buildSign(),
    pl1140: buildPlaque(['11:40 PM'], 92, 90), pl3: buildPlaque(['3 साल पहले'], 84, 91), plTicket: buildPlaque(['भैया, टिकट!'], 58, 92, DYE.crim),
    plEnd1: buildPlaque(['कहानी', 'कैसी लगी?'], 112, 93), plEnd2: buildPlaque(['फ़ॉलो करें'], 100, 94, DYE.crim),
  });
  // loose parts: damped pendulums pre-simulated at 120 Hz
  const sim = (w, c, drive) => { const n = Math.ceil((T.total + 1) * 120), a = new Float32Array(n); let th = 0, v = 0; for (let k = 0; k < n; k++) { const tt = k / 120; v += (-w * w * Math.sin(th) - c * v + drive(tt) * Math.cos(th)) / 120; th += v / 120; a[k] = th; } return t => { const x = clamp(t, 0, T.total) * 120, j = Math.floor(x); return a[j] + (a[Math.min(n - 1, j + 1)] - a[j]) * (x - j); }; };
  const kick = t => (Math.abs(t - S0[6] - .05) < .05 ? 45 : 0);
  PEND.strap = [0, 1, 2].map(k => sim(6.4 + k * .5, .7, t => 4 * (vn(t * 2.3 + k * 9) - .5) + 2.4 * Math.sin(t * 5.1 + k) * vn(t * .7 + k) + kick(t)));
  PEND.bag = sim(7.5, 1.1, t => (t > S0[2] && t < S0[4] ? 14 * Math.sin((t - S0[2]) * 9) + 10 * (vn(t * 3) - .5) : 0));
  const la = t => E(t - S0[4], .25, .6) * (1 - E(t - S0[4], 1.95, 2.35));
  PEND.ear = sim(11, 1.5, t => 60 * la(t) * Math.sin((t - S0[4]) * 14) + 4 * (vn(t * 2.9) - .5));
  return true;
};
