'use strict';
// Jointed paper figures (profile): body sheet + limb sheets pinned at the joints; rotation only.
const ARJ = { skin: '#a88c76', hair: '#0f1226', shirt: '#a83524', pants: '#1d2750', shoe: '#0c0f22' };
const CON = { skin: '#977d66', hair: '#141218', shirt: '#7a7049', pants: '#4b4731', shoe: '#15130f', cap: '#5f5838', mus: 1, bag: '#2a2016' };
const DARKF = { eyeW: '#44575a', pupil: '#020405', skin: '#0b161a', hair: '#050a0d', shirt: '#4a1a12', pants: '#081014', shoe: '#050a0d' };
const P2 = d => new Path2D(d);
const capsule = (L, w) => { const p = new Path2D(); p.roundRect(-w / 2, -w / 2, w, L + w, w / 2); return p; };
const FACE = P2('M-4,-56 C26,-60 46,-40 47,-16 L49,-8 Q54,0 64,12 Q66,17 54,19 L52,23 Q57,26 56,30 L51,33 Q56,36 54,41 Q50,46 50,50 Q48,62 32,64 Q10,64 -8,52 C-44,48 -58,10 -54,-14 C-50,-44 -28,-56 -4,-56 Z');
const HAIR = P2('M46,-28 C44,-66 -10,-76 -40,-54 C-68,-32 -64,14 -50,36 L-34,32 C-30,8 -34,-8 -18,-20 C0,-32 28,-22 46,-28 Z');
const HAIRB = P2('M-52,-26 C-64,-8 -62,20 -50,36 L-34,32 C-32,10 -36,-10 -30,-26 Z');
const CAP = P2('M-56,-30 C-54,-72 38,-78 48,-40 L84,-31 L84,-23 L-56,-23 Z');
const TORSO = P2('M-44,10 C-52,-60 -50,-150 -34,-196 Q0,-214 34,-196 C52,-150 50,-60 44,10 Q0,26 -44,10 Z');
const SHOE = (() => { const p = new Path2D(); p.ellipse(14, 8, 32, 14, 0, 0, TAU); return p; })();
const circ = (cx, cy, r) => { const p = new Path2D(); p.arc(cx, cy, r, 0, TAU); return p; };
const ell = (cx, cy, a, b, r = 0) => { const p = new Path2D(); p.ellipse(cx, cy, a, b, r, 0, TAU); return p; };
const rect = (a, b, w, h, r = 0) => { const p = new Path2D(); p.roundRect(a, b, w, h, r); return p; };

function headP(x, C, P, s) {
  part(x, FACE, C.skin);
  part(x, ell(-16, 4, 8, 13), shade(C.skin, .8), { rim: 2 });
  if (C.cap) { part(x, HAIRB, C.hair); part(x, CAP, C.cap); } else part(x, HAIR, C.hair);
  if (C.mus) part(x, ell(50, 23, 13, 5.5, .15), C.hair, { rim: 1.5 });
  const e = P.eye ?? .4;
  x.save(); x.translate(31, -9); const m = x.getTransform();
  part(x, ell(0, 0, 9 + e * 3, 3 + e * 7.5), C.eyeW || '#b7b1a0', { rim: 1.5 }); part(x, circ(2.5 + (P.gx || 0) * 4, (P.gy || 0) * 3, 4.6 - e * 1.4), C.pupil || '#0c0a10', { rim: .6 }); x.restore();
  if (s) s.eye = [m.e, m.f];
  x.save(); x.translate(31, -25 - e * 7); x.rotate(P.brow || 0); part(x, rect(-14, -2.5, 28, 5, 2), C.hair, { rim: 1 }); x.restore();
  const mo = P.mouth || 0; if (mo > 0) hole(x, ell(51, 33, 5 + mo * 6, 1.5 + mo * 8, -.2));
}
// (hx,hy) = hip in design coords; sc scale; dir +1 faces right. P: lean, head, hflip, armF/armB/legF/legB = [a1,a2] (0 = hanging down, + = forward)
function person(x, hx, hy, sc, dir, C, P, s) {
  x.save(); x.translate(hx, hy); x.scale(sc * dir, sc);
  const limb = (jx, jy, A, L1, L2, w, c1, c2, end) => { x.save(); x.translate(jx, jy); x.rotate(-A[0]); part(x, capsule(L1, w), c1); x.translate(0, L1); x.rotate(-A[1]); part(x, capsule(L2, w * .88), c2); if (end) { x.translate(0, L2); end(x); } x.restore(); };
  const hand = held => y => { if (held === 'note') { y.save(); y.translate(6, 12); y.rotate(-.5); part(y, rect(-8, -6, 62, 30, 3), '#d9cfae', { rim: 2 }); y.restore(); } if (held === 'machine') part(y, rect(-16, 2, 34, 44, 5), '#2a2016'); part(y, circ(0, 4, 16), C.skin); };
  const shoe = y => part(y, SHOE, C.shoe);
  const dk = (c, k = .72) => shade(c, k);
  if (!P.bust) { limb(0, 0, P.legB || [0, 0], 122, 120, 44, dk(C.pants), dk(C.pants), shoe); }
  x.save(); x.rotate(P.lean || 0);
  limb(4, -176, P.armB || [0, 0], 96, 90, 34, dk(C.shirt), dk(C.shirt), hand(P.holdB));
  x.restore();
  if (!P.bust) limb(0, 0, P.legF || [0, 0], 122, 120, 46, C.pants, C.pants, shoe);
  x.save(); x.rotate(P.lean || 0);
  part(x, TORSO, C.shirt);
  if (C.bag) { x.save(); x.translate(0, -100); x.rotate(.42); part(x, rect(-7, -120, 14, 240, 4), C.bag, { rim: 2 }); x.restore(); part(x, rect(-34, -40, 62, 58, 10), C.bag); }
  part(x, rect(-14, -232, 30, 46, 8), shade(C.skin, .82));
  x.save(); x.translate(6, -266); x.rotate(-(P.head || 0)); x.scale((P.hflip ?? 1) * 1.14, 1.14); headP(x, C, P, s); x.restore();
  limb(-2, -176, P.armF || [0, 0], 96, 90, 36, C.shirt, C.shirt, hand(P.holdF));
  x.restore(); x.restore();
}
// seat in profile (dir +1: sitter faces right). (bx,by) = cushion top at the backrest
function seatPath(x, bx, by, sc, dir) {
  x.save(); x.translate(bx, by); x.scale(sc * dir, sc);
  x.beginPath(); x.moveTo(-70, -330); x.quadraticCurveTo(-40, -352, -22, -326); x.lineTo(2, -10); x.lineTo(150, -8); x.quadraticCurveTo(176, -4, 172, 26); x.lineTo(40, 30); x.lineTo(36, 150); x.lineTo(8, 150); x.lineTo(6, 34); x.lineTo(-40, 30); x.closePath(); x.fill();
  x.beginPath(); x.roundRect(-84, -300, 26, 60, 10); x.fill();
  x.restore();
}
function walk(t, f = 7.5, a = .5) { const s = Math.sin(t * f); return { legF: [s * a, Math.max(0, -s) * -.5 - .08], legB: [-s * a, Math.max(0, s) * -.5 - .08], armF: [-s * a * .7, .25], armB: [s * a * .7, .25], bob: -Math.abs(Math.cos(t * f)) * 5 }; }
