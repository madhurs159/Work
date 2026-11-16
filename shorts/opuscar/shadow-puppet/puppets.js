// Carved hide pieces for the bus story: three jointed puppets, the bus, sets, plaques.
// Units: figure pieces are in "puppet units" (drawn at a world scale), origin at the piece's joint.
const HK = 1.2, UA = 54, FA = 50, TH = 68, SHN = 76, SOLE = SHN + 11;
const JN = { neck: [3, -110], shF: [9, -97], shB: [-5, -99], hipF: [5, 2], hipB: [-6, 2] };
Object.assign(DYE, { indigo: '#27468c', crim: '#9a1a14', ochre: '#d0931f', jade: '#2b8257', teal: '#1f6a80', glass: '#a8d3c8', dark: '#3a1a0c', khaki: '#c79a52' });
const P4 = (box, fn, seed, ss) => piece(box, fn, { seed, ss });
const rrp = (q, x, y, w, h, r) => q.roundRect(x, y, w, h, r);
const circ = (q, x, y, r) => { q.moveTo(x + r, y); q.arc(x, y, r, 0, Math.PI * 2); };

function limbPath(len, w0, w1) { return q => smooth(q, [[-w0, -6], [0, -w0 - 2], [w0, -6], [w1, len + 2], [0, len + w1], [-w1, len + 2]]); }
function upperArm(dye, seed, deco) { return P4([-15, -17, 15, UA + 15], g => { const p = limbPath(UA, 11.5, 10); fill(g, dye, p); within(g, p, () => deco && deco(g)); ink(g, 2, p); }, seed); }
function foreArm(dye, seed, o = {}) {
  return P4([-18, -15, 30, FA + 40], g => {
    const hand = o.point
      ? q => { smooth(q, [[-6, FA - 14], [6, FA - 14], [8, FA], [6, FA + 10], [-1, FA + 13], [-6, FA + 6]]); poly(q, [[1, FA + 2], [5, FA], [8, FA + 30], [4.5, FA + 31]]); }
      : q => { smooth(q, [[-6, FA - 14], [6, FA - 14], [8.5, FA + 2], [7, FA + 15], [1, FA + 20], [-5.5, FA + 13], [-7, FA]]); smooth(q, [[4, FA - 4], [13, FA + 1], [13, FA + 9], [6, FA + 6]]); };
    fill(g, DYE.skin, hand, 'nonzero'); ink(g, 1.5, hand);
    if (!o.point) { cutLine(g, .9, q => { q.moveTo(-2, FA + 8); q.lineTo(-1, FA + 18); q.moveTo(2, FA + 8); q.lineTo(3.5, FA + 18); }); }
    const sl = o.bare ? q => smooth(q, [[-7, -6], [0, -9], [7, -6], [6, FA - 10], [-6, FA - 10]]) : q => smooth(q, [[-10, -6], [0, -11.5], [10, -6], [8.5, FA - 9], [-8.5, FA - 9]]);
    fill(g, o.bare ? DYE.skin : dye, sl); within(g, sl, () => { if (o.deco) o.deco(g); else cutLine(g, 1.8, q => { q.moveTo(-10, FA - 17); q.lineTo(10, FA - 17); }); }); ink(g, 2, sl);
    if (o.bare) for (const y of [FA - 22, FA - 17, FA - 12]) ink(g, 2.2, q => { q.moveTo(-7, y); q.lineTo(7, y); }, DYE.ochre);
  }, seed);
}
function thigh(dye, seed) { return P4([-17, -18, 17, TH + 16], g => { const p = limbPath(TH, 13.5, 11.5); fill(g, dye, p); within(g, p, () => { for (let k = 0; k < 4; k++) cutLine(g, 1.5, q => { q.moveTo(-6 + k * 4.5, 8); q.lineTo(-5 + k * 4, TH - 8); }); }); ink(g, 2, p); }, seed); }
function shin(dye, seed) {
  return P4([-15, -15, 36, SOLE + 4], g => {
    const p = q => smooth(q, [[-11, -6], [0, -12], [11, -6], [8.5, SHN - 6], [-8.5, SHN - 6]]);
    fill(g, dye, p); within(g, p, () => { for (let k = 0; k < 3; k++) cutLine(g, 1.4, q => { q.moveTo(-4 + k * 4, 6); q.lineTo(-3.5 + k * 3.5, SHN - 16); }); }); ink(g, 2, p);
    const shoe = q => smooth(q, [[-10, SHN - 9], [8, SHN - 10], [15, SHN - 2], [28, SHN + 3], [31, SOLE], [-10, SOLE]]);
    fill(g, DYE.ink, shoe); cutLine(g, 1.1, q => { q.moveTo(-8, SOLE - 4.5); q.lineTo(28, SOLE - 4.5); }); cutLine(g, 1, q => { q.moveTo(8, SHN - 3); q.lineTo(17, SHN + 1); });
  }, seed);
}
const torsoPath = q => smooth(q, [[-22, 9], [-27, -36], [-26, -80], [-17, -104], [0, -113], [15, -109], [26, -91], [28, -56], [25, -22], [23, 9]]);

// ---------- Arjun: open-cut face, indigo checked shirt, teal sleeves ----------
const AF = [[-7, -5], [5, -3], [14, -6], [17.5, -12], [16, -17], [18, -19.5], [16.8, -22], [19.5, -24.5], [18.6, -28], [21, -30], [25.5, -33.5], [20.5, -42], [18.5, -50], [18.5, -58], [19.5, -64], [16, -70]];
function buildArjun() {
  const F = { seed: 11 };
  F.head = P4([-48, -114, 40, 18], g => {
    g.scale(HK, HK);
    const neck = q => poly(q, [[-9, 11], [8, 11], [7, -6], [-8, -12]]); fill(g, DYE.skin, neck); ink(g, 1.6, neck);
    const hair = q => smooth(q, [[16, -69], [25, -76], [17, -87], [-3, -91], [-21, -86], [-32, -71], [-35, -50], [-31, -32], [-23, -23], [-15, -29], [-13, -44], [-8, -56], [2, -62], [11, -64]]);
    fill(g, DYE.ink, hair);
    within(g, hair, () => { for (let k = 0; k < 8; k++) cutLine(g, .9, q => { q.moveTo(18 - k * 5, -84 + k * .4); q.quadraticCurveTo(-6 - k * 3.4, -76 + k * 3, -17 - k * 2, -34 + k * 2); }); });
    ink(g, 2.4, q => poly(q, AF, false));
    ink(g, 2, q => { q.moveTo(-7, -5); q.quadraticCurveTo(-12, -14, -11, -27); });
    ink(g, 1.4, q => { q.moveTo(-10, -43); q.bezierCurveTo(-18, -44, -18, -29, -11, -30); q.moveTo(-12, -40); q.quadraticCurveTo(-14.5, -37, -12.5, -34); });
    ink(g, 1.7, q => { q.moveTo(16.5, -45); q.quadraticCurveTo(9, -50.5, 0, -46.5); });
    ink(g, 1.1, q => { q.moveTo(16, -44.4); q.quadraticCurveTo(9, -41.6, 2, -45.2); });
    g.beginPath(); g.arc(10.5, -45.6, 2.3, 0, 7); g.fillStyle = DYE.ink; g.fill();
    fill(g, DYE.ink, q => smooth(q, [[18, -52.5], [10, -56.5], [0, -57], [-6, -54], [0, -54], [10, -53.4], [17.5, -50.4]]));
    ink(g, 1.2, q => { q.moveTo(22.5, -30.6); q.quadraticCurveTo(19.4, -31.6, 20, -28.6); });
    ink(g, 1.4, q => { q.moveTo(17.2, -22); q.lineTo(11, -21.2); });
    ink(g, 1, q => { q.moveTo(12, -14); q.quadraticCurveTo(8, -12, 4, -15); });
  }, 1);
  F.torso = P4([-32, -118, 34, 16], g => {
    fill(g, DYE.indigo, torsoPath);
    within(g, torsoPath, () => {
      lattice(g, -30, -92, 32, -4, 12, 3.2);
      fill(g, DYE.indigo, q => q.rect(-30, -4, 64, 16)); cutLine(g, 1.6, q => { q.moveTo(-26, 0); q.lineTo(26, 0); });
      fill(g, DYE.indigo, q => q.rect(9, -100, 9, 100)); beadLine(g, 13.5, -92, 13.5, -10, 1.7, 13);
    });
    const col = q => poly(q, [[-12, -108], [2, -116], [18, -110], [22, -96], [10, -100], [2, -92], [-8, -100]]); fill(g, DYE.hide, col); ink(g, 1.6, col);
    ink(g, 2.3, torsoPath);
  }, 2);
  F.pack = P4([-62, -112, -14, -12], g => {
    const p = q => smooth(q, [[-22, -104], [-40, -106], [-56, -90], [-58, -50], [-52, -22], [-34, -16], [-20, -24]]);
    fill(g, DYE.ochre, p); within(g, p, () => { for (const y of [-84, -58]) coin(g, -41, y, 7); cutLine(g, 2, q => { q.moveTo(-58, -40); q.lineTo(-18, -40); }); beadLine(g, -52, -30, -26, -30, 1.6, 6); }); ink(g, 2.1, p);
  }, 3);
  const stripes = g => { for (const y of [14, 26, 38]) cutLine(g, 2.2, q => { q.moveTo(-12, y); q.lineTo(12, y); }); };
  F.ua = upperArm(DYE.teal, 4, stripes); F.fa = foreArm(DYE.teal, 5);
  F.th = thigh(DYE.brown, 6); F.sh = shin(DYE.brown, 7);
  F.note = P4([-10, -3, 12, 36], g => { const p = q => poly(q, [[-8, 0], [9, -2], [10, 33], [-7, 34]]); fill(g, DYE.jade, p); coin(g, 1, 16, 5); cutLine(g, 1, q => { q.moveTo(-4, 4); q.lineTo(6, 3.4); q.moveTo(-4, 29); q.lineTo(6, 28.6); }); ink(g, 1.5, p); }, 8);
  return F;
}

// ---------- Old woman: solid face with a cut-out eye and slit wrinkles, crimson sari, hinged jaw ----------
const JW = [-6, -30];
function buildWoman() {
  const F = { seed: 23 };
  F.head = P4([-56, -122, 40, 26], g => {
    g.scale(HK, HK);
    const neck = q => poly(q, [[-9, 12], [6, 12], [6, -14], [-8, -16]]); fill(g, DYE.skin, neck); ink(g, 1.5, neck);
    cutLine(g, .8, q => { q.moveTo(-5, -6); q.lineTo(4, -3); q.moveTo(-5, 1); q.lineTo(4, 4); });
    const face = q => poly(q, [[13, -23], [17.5, -25.5], [17, -29.5], [20, -31], [27.5, -31], [26.5, -36], [21.5, -44], [18.5, -51], [18, -58], [19, -63], [16, -68], [2, -67], [-10, -57], [-13, -40], [-11, -23], [-2, -21], [6, -21.5]]);
    fill(g, DYE.skin, face);
    within(g, face, () => {
      cut(g, q => { q.moveTo(17, -46); q.quadraticCurveTo(10, -51.5, 2.5, -46.5); q.quadraticCurveTo(10, -43.4, 17, -46); });   // the eye: a hole of light
      cutTaper(g, [[0, -47], [-5, -50], [-9, -54]], 1.4); cutTaper(g, [[0, -45.5], [-6, -45], [-10, -46]], 1.3); cutTaper(g, [[1, -44], [-4, -40], [-8, -37]], 1.3);
      cutTaper(g, [[15, -61], [7, -63.5], [-2, -61]], 1.5); cutTaper(g, [[16, -57], [8, -59.5], [0, -57.5]], 1.3);
      cutTaper(g, [[19, -33], [12, -31], [8, -25]], 1.6); cutTaper(g, [[14, -41], [8, -38], [3, -40]], 1.2); cutTaper(g, [[3, -33], [-2, -29], [-3, -24]], 1.3);
    });
    fill(g, DYE.ink, q => smooth(q, [[18.5, -52.5], [11, -56], [2, -55.4], [-3, -52], [3, -52.6], [11, -52.6], [18, -50.6]]));
    ink(g, 2.1, face);
    g.beginPath(); g.arc(15, -64, 2, 0, 7); g.fillStyle = DYE.crim; g.fill();
    const hair = q => poly(q, [[16, -68], [19, -73], [6, -78], [-8, -70], [-14, -52], [-13, -40], [-10, -57], [2, -67]]);
    fill(g, DYE.white, hair); within(g, hair, () => { for (let k = 0; k < 6; k++) cutLine(g, .8, q => { q.moveTo(15 - k * 4, -74 + k); q.quadraticCurveTo(0 - k * 3, -68 + k * 3, -12, -46 + k * 2); }); }); ink(g, 1.4, hair);
    const pallu = q => smooth(q, [[18, -73], [22, -82], [10, -94], [-12, -97], [-30, -88], [-40, -68], [-43, -40], [-40, -8], [-32, 12], [-16, 14], [-17, -8], [-14, -30], [-13.5, -50], [-7, -68], [6, -78]]);
    fill(g, DYE.crim, pallu);
    within(g, pallu, () => {
      ink(g, 7, pallu, DYE.ochre);
      for (let k = 0; k < 13; k++) { const a = k / 12, x = -30 + 8 * Math.sin(k * 2.1) + (k % 2) * 9, y = -84 + a * 86; plum(g, x, y, 2.6); }
      cutLine(g, 1.1, q => { q.moveTo(8, -86); q.quadraticCurveTo(-22, -84, -30, -50); q.quadraticCurveTo(-34, -20, -26, 8); });
    });
    ink(g, 2, pallu);
  }, 21);
  F.jaw = P4([-22, -18, 34, 44], g => {     // local origin = hinge rivet near the ear (already in HK-scaled units)
    g.scale(HK, HK); g.translate(-JW[0], -JW[1]);
    const p = q => poly(q, [[-10, -32], [-10, -12], [-3, -5], [9, -3.5], [17, -6], [19.5, -12], [16.5, -16.5], [17.5, -20.5], [13, -21.5], [9, -19], [5, -21], [1, -19], [-3, -21.5]]);
    fill(g, DYE.skin, p); cutTaper(g, [[13, -9], [6, -8], [0, -11]], 1.3); cutTaper(g, [[-2, -14], [-6, -18], [-7, -24]], 1.2); ink(g, 1.9, p);
  }, 22);
  F.torso = P4([-34, -118, 36, 16], g => {
    const tp = q => smooth(q, [[-22, 9], [-28, -36], [-27, -80], [-18, -104], [0, -112], [14, -106], [22, -88], [26, -56], [27, -22], [24, 9]]);
    fill(g, DYE.crim, tp);
    within(g, tp, () => {
      scalesOpen(g, -30, -84, 30, 2, 7.5);
      const sash = q => poly(q, [[-30, -100], [-10, -116], [30, -20], [30, 12], [8, 12]]); fill(g, DYE.crim, sash); g.save(); g.beginPath(); sash(g); g.clip(); ink(g, 8, sash, DYE.ochre);
      for (let k = 0; k < 7; k++) plum(g, -12 + k * 5.6, -88 + k * 15, 2.4); g.restore();
    });
    ink(g, 2.3, tp);
  }, 24);
  F.lower = P4([-34, -22, 104, SOLE + 6], g => {
    const p = q => smooth(q, [[-26, -12], [10, -17], [56, -15], [78, -6], [84, 16], [80, 50], [84, SOLE - 8], [44, SOLE - 6], [42, 40], [26, 26], [-24, 24]]);
    fill(g, DYE.crim, p);
    within(g, p, () => { scalesOpen(g, -30, -8, 90, 60, 8); const hem = q => q.rect(36, SOLE - 24, 56, 20); fill(g, DYE.ochre, hem); meander(g, 40, SOLE - 9, 90, 4.6, 1.3); cutLine(g, 2, q => { q.moveTo(-20, -2); q.quadraticCurveTo(40, -8, 76, 4); }); });
    ink(g, 2.3, p);
    const foot = q => smooth(q, [[52, SOLE - 9], [68, SOLE - 10], [84, SOLE - 3], [94, SOLE + 2], [52, SOLE + 2]]); fill(g, DYE.ink, foot);
  }, 25);
  F.ua = upperArm(DYE.jade, 26, g => { beadLine(g, -8, UA - 8, 8, UA - 8, 1.7, 5); cutLine(g, 1.6, q => { q.moveTo(-11, UA - 15); q.lineTo(11, UA - 15); }); });
  F.fa = foreArm(DYE.jade, 27, { bare: true }); F.faF = foreArm(DYE.jade, 28, { bare: true, point: true });
  F.stick = P4([-8, -40, 20, 150], g => { ink(g, 5, q => { q.moveTo(14, -24); q.quadraticCurveTo(12, -36, 3, -34); q.quadraticCurveTo(-2, -30, 0, -18); q.lineTo(2, 146); }, DYE.dark); cutLine(g, 1, q => { q.moveTo(.6, 0); q.lineTo(2, 130); }); }, 29);
  F.ear = P4([-7, -2, 7, 20], g => { ink(g, 1.3, q => { q.moveTo(0, 0); q.lineTo(0, 6); }); const r = q => circ(q, 0, 11.5, 5.5); fill(g, DYE.ochre, r); cut(g, q => circ(q, 0, 11.5, 2.6)); ink(g, 1.3, r); }, 30);
  return F;
}

// ---------- Conductor: solid face, peaked cap, khaki uniform, ticket bag on a strap ----------
function buildConductor() {
  const F = { seed: 37 };
  F.head = P4([-46, -116, 52, 18], g => {
    g.scale(HK, HK);
    const neck = q => poly(q, [[-10, 11], [9, 11], [8, -6], [-9, -12]]); fill(g, DYE.skin, neck); ink(g, 1.6, neck);
    const face = q => poly(q, [[-8, -4], [6, -3], [15, -6], [18.5, -12], [16.5, -17], [18, -20], [17, -23], [19, -25], [18.5, -29], [21, -31], [27, -34], [22, -42], [19.5, -50], [19.5, -58], [20, -63], [4, -65], [-12, -62], [-28, -58], [-30, -40], [-24, -24], [-13, -12]]);
    fill(g, DYE.hide2, face);
    within(g, face, () => { cut(g, q => { q.moveTo(16.5, -45.5); q.quadraticCurveTo(10, -48.6, 4, -45.6); q.quadraticCurveTo(10, -44, 16.5, -45.5); }); cutTaper(g, [[6, -14], [0, -12], [-6, -16]], 1.2); });
    fill(g, DYE.ink, q => smooth(q, [[19.5, -50], [12, -53.6], [2, -54.6], [-3, -52], [3, -51], [12, -50], [19, -47.4]]));
    const hair = q => smooth(q, [[-27, -60], [-32, -42], [-26, -24], [-16, -22], [-13, -34], [-12, -58]]); fill(g, DYE.ink, hair); within(g, hair, () => { for (let k = 0; k < 4; k++) cutLine(g, .8, q => { q.moveTo(-15 - k * 3.4, -56); q.lineTo(-17 - k * 3, -27); }); });
    ink(g, 1.3, q => { q.moveTo(-6, -42); q.bezierCurveTo(-13, -43, -13, -30, -7, -31); });
    fill(g, DYE.ink, q => smooth(q, [[21, -27.5], [14, -30.5], [6, -27], [1, -21], [8, -22.6], [15, -22], [22, -24]]));     // moustache
    ink(g, 1.3, q => { q.moveTo(17, -19.4); q.lineTo(11, -18.8); });
    ink(g, 2.2, face);
    const crown = q => smooth(q, [[23, -62], [21, -80], [6, -90], [-16, -88], [-31, -76], [-31, -60]]);
    fill(g, DYE.ochre, crown); within(g, crown, () => { coin(g, 12, -75, 5); cutLine(g, 1.3, q => { q.moveTo(-28, -70); q.quadraticCurveTo(-6, -84, 18, -84); }); }); ink(g, 2, crown);
    const band = q => poly(q, [[-32, -66], [24, -66], [24, -58], [-32, -58]]); fill(g, DYE.dark, band); within(g, band, () => beadLine(g, -28, -62, 20, -62, 1.2, 6)); ink(g, 1.5, band);
    const visor = q => poly(q, [[20, -64], [41, -57], [40, -53], [20, -57]]); fill(g, DYE.ink, visor);
  }, 31);
  F.torso = P4([-32, -118, 34, 16], g => {
    fill(g, DYE.khaki, torsoPath);
    within(g, torsoPath, () => {
      const pk = q => rrp(q, -2, -84, 20, 22, 3); cut(g, pk); fill(g, DYE.khaki, q => q.rect(-2, -84, 20, 7)); ink(g, 1.4, pk);
      beadLine(g, 22, -98, 22, -22, 2, 13);
      for (let y = -56; y < -12; y += 8) cutLine(g, 2, q => { q.moveTo(-24, y); q.lineTo(14, y + 3); });
      fill(g, DYE.dark, q => q.rect(-30, -12, 62, 10)); coin(g, 14, -7, 3.6);
      ink(g, 4.5, q => { q.moveTo(18, -108); q.lineTo(-22, -6); }, DYE.dark);
    });
    const col = q => poly(q, [[-12, -108], [2, -116], [19, -110], [23, -95], [10, -99], [2, -92], [-8, -100]]); fill(g, DYE.khaki, col); ink(g, 1.6, col);
    ink(g, 2.3, torsoPath);
  }, 32);
  const cuffs = g => { cutLine(g, 2, q => { q.moveTo(-12, 10); q.lineTo(12, 10); }); coin(g, 0, 26, 4.5); };
  F.ua = upperArm(DYE.brown, 33, cuffs); F.fa = foreArm(DYE.brown, 34);
  F.th = thigh(DYE.brown, 35); F.sh = shin(DYE.brown, 36);
  F.bag = P4([-24, -4, 24, 58], g => {
    ink(g, 3, q => { q.moveTo(0, 0); q.lineTo(0, 18); }, DYE.dark);
    const p = q => smooth(q, [[-18, 16], [18, 16], [21, 44], [12, 54], [-12, 54], [-21, 44]]); fill(g, DYE.crim, p);
    within(g, p, () => { const fl = q => poly(q, [[-22, 14], [22, 14], [14, 34], [0, 39], [-14, 34]]); fill(g, DYE.ochre, fl); coin(g, 0, 28, 4.6); beadLine(g, -12, 46, 12, 46, 1.6, 6); ink(g, 1.4, fl); });
    ink(g, 2, p);
  }, 37);
  return F;
}

// ---------- bus seat (puppet units, origin = sitter's hip) ----------
function buildSeat() {
  return P4([-50, -134, 66, SOLE + 4], g => {
    const back = q => smooth(q, [[-43, -124], [-30, -130], [-22, -116], [-21, 10], [-43, 16]]);
    fill(g, DYE.jade, back); within(g, back, () => lattice(g, -46, -116, -18, 6, 10, 2.4)); ink(g, 2.2, back);
    ink(g, 3.2, q => { q.moveTo(-40, -126); q.quadraticCurveTo(-34, -138, -24, -127); }, DYE.dark);
    const cush = q => smooth(q, [[-42, 13], [50, 11], [60, 19], [58, 30], [-42, 32]]);
    fill(g, DYE.jade, cush); within(g, cush, () => beadLine(g, -34, 22, 52, 22, 2.2, 9)); ink(g, 2.2, cush);
    const ped = q => poly(q, [[-6, 32], [14, 32], [20, SOLE], [-14, SOLE]]); fill(g, DYE.dark, ped); within(g, ped, () => coin(g, 4, 58, 5)); ink(g, 1.8, ped);
  }, 41);
}

// ---------- exterior bus (world px at exterior scale; nose at x=0, facing left) ----------
const BUS = { len: 1150, wheelY: 500, wheelR: 58, wheels: [345, 925], win: i => 285 + i * 142, door: 190 };
function buildBus(wreck) {
  return piece([-24, -78, 1180, 520], g => {
    const body = q => { q.moveTo(46, 20); q.lineTo(1118, 20); q.quadraticCurveTo(1150, 20, 1150, 56); q.lineTo(1150, 500); q.lineTo(22, 500); q.lineTo(0, 474); q.lineTo(0, 262); q.quadraticCurveTo(4, 70, 46, 20); q.closePath(); };
    // roof rack and bundles
    ink(g, 5, q => { q.moveTo(420, 4); q.lineTo(1000, 4); for (let x = 430; x < 1000; x += 80) { q.moveTo(x, 4); q.lineTo(x, 20); } }, DYE.dark);
    for (const [x, w, h, d] of [[470, 150, 62, DYE.ochre], [640, 110, 46, DYE.jade], [770, 170, 56, DYE.khaki]]) {
      const b = q => smooth(q, [[x, 2], [x + 6, -h * .8], [x + w * .5, -h], [x + w - 8, -h * .75], [x + w, 2]]); fill(g, d, b); within(g, b, () => lattice(g, x, -h, x + w, 0, 20, 4)); ink(g, 2.4, b);
    }
    fill(g, DYE.crim, body);
    within(g, body, () => {
      scalesOpen(g, 0, 352, 1150, 492, 15);
      fill(g, DYE.ochre, q => q.rect(-5, 288, 1160, 48)); meander(g, 10, 322, 1150, 11, 3);
      fill(g, DYE.crim, q => q.rect(-5, 20, 1160, 44)); beadLine(g, 60, 44, 1130, 44, 4, 22);
      // windows: holes of light
      cut(g, q => { q.moveTo(26, 250); q.lineTo(34, 110); q.quadraticCurveTo(40, 76, 70, 76); q.lineTo(106, 76); q.lineTo(106, 250); q.closePath(); for (let i = 0; i < 6; i++) rrp(q, BUS.win(i), 76, 118, 180, 16); }, 'nonzero');
      // door
      cut(g, q => { rrp(q, 136, 76, 50, 180, 8); rrp(q, 194, 76, 50, 180, 8); }, 'nonzero');
      cutLine(g, 4, q => { q.rect(128, 68, 124, 420); q.moveTo(190, 68); q.lineTo(190, 488); });
      lattice(g, 138, 350, 244, 480, 26, 5);
      // wheel arches
      cut(g, q => { for (const x of BUS.wheels) circ(q, x, 500, 76); }, 'nonzero');
      // headlight, grille
      coin(g, 30, 410, 17); for (let y = 440; y < 480; y += 12) cutLine(g, 4, q => { q.moveTo(10, y); q.lineTo(70, y); });
      fill(g, DYE.ochre, q => q.rect(1090, 380, 60, 40)); coin(g, 1124, 400, 12);
    });
    for (let i = 0; i < 6; i++) ink(g, 2.4, q => rrp(q, BUS.win(i), 76, 118, 180, 16));
    ink(g, 2.4, q => { rrp(q, 136, 76, 50, 180, 8); rrp(q, 194, 76, 50, 180, 8); });
    ink(g, 3.6, body);
    ink(g, 7, q => { q.moveTo(-10, 486); q.lineTo(40, 486); }, DYE.dark);
    if (wreck) {
      cut(g, q => poly(q, [[-30, 230], [70, 262], [20, 318], [104, 352], [36, 410], [96, 452], [-30, 500]]));
      ink(g, 3, q => poly(q, [[0, 236], [70, 262], [20, 318], [104, 352], [36, 410], [96, 452], [22, 500]], false));
      const cr = (pts, w) => cutTaper(g, pts, w);
      cr([[104, 352], [200, 330], [270, 372], [380, 340]], 9); cr([[70, 262], [130, 180], [120, 100], [170, 30]], 8); cr([[520, 20], [560, 120], [530, 220], [600, 300], [570, 420], [620, 500]], 10);
      cr([[600, 300], [700, 280], [760, 330]], 7); cr([[900, 20], [880, 140], [930, 260], [900, 360]], 8); cr([[285, 160], [340, 200], [403, 150]], 6); cr([[711, 256], [760, 170], [829, 200]], 6);
      for (let i = 0; i < 6; i++) { const x = BUS.win(i); fill(g, DYE.crim, q => poly(q, [[x, 256], [x + 30, 200 - (i % 2) * 40], [x + 52, 240], [x + 84, 176 + (i % 3) * 20], [x + 118, 256]])); ink(g, 2, q => poly(q, [[x, 256], [x + 30, 200 - (i % 2) * 40], [x + 52, 240], [x + 84, 176 + (i % 3) * 20], [x + 118, 256]], false)); }
    }
  }, { seed: wreck ? 52 : 51, ss: 2 });
}
function buildWheel() {
  return piece([-62, -62, 62, 62], g => {
    const o = q => circ(q, 0, 0, 58); fill(g, DYE.ink, o); cut(g, q => { circ(q, 0, 0, 44); circ(q, 0, 0, 38); }, 'evenodd');
    const hub = q => circ(q, 0, 0, 32); fill(g, DYE.khaki, hub);
    for (let k = 0; k < 6; k++) { const a = k * Math.PI / 3; cut(g, q => q.ellipse(Math.cos(a) * 19, Math.sin(a) * 19, 8, 4.4, a, 0, 7)); }
    ink(g, 2.4, hub); coin(g, 0, 0, 6);
  }, { seed: 53, ss: 2 });
}

// ---------- scenery ----------
function buildMoon() {
  return piece([-130, -110, 150, 150], g => {
    const o = q => circ(q, 0, 0, 78); fill(g, DYE.hide, o);
    within(g, o, () => { for (let k = 0; k < 5; k++) cutLine(g, 2.4, q => q.arc(34, -20, 82 + k * 9, 1.9, 3.5)); });
    ink(g, 3, o); cut(g, q => circ(q, 34, -20, 70));
    within(g, o, () => ink(g, 3, q => circ(q, 34, -20, 70)));
    for (const [x, y, s, f] of [[-58, 92, 1, 1], [56, 108, .8, -1]]) {
      const c = q => smooth(q, [[x - 60 * s, y + 16 * s], [x - 50 * s, y - 12 * s], [x - 20 * s, y - 26 * s], [x + 10 * s, y - 16 * s], [x + 40 * s, y - 24 * s], [x + 62 * s, y - 2 * s], [x + 52 * s, y + 18 * s]]);
      fill(g, DYE.ochre, c); within(g, c, () => { cloud(g, x - 28 * s, y - 2 * s, 17 * s, 0, 3, f); cloud(g, x + 30 * s, y, 15 * s, 2, 3, -f); cutLine(g, 2.4, q => { q.moveTo(x - 50 * s, y + 10 * s); q.lineTo(x + 50 * s, y + 10 * s); }); }); ink(g, 2.6, c);
    }
  }, { seed: 61, ss: 2 });
}
function buildTree(seed) {
  return piece([-190, -470, 190, 8], g => {
    const tr = q => smooth(q, [[-22, 4], [-14, -120], [-20, -230], [0, -250], [18, -230], [14, -120], [24, 4]]); fill(g, DYE.brown, tr);
    within(g, tr, () => { for (let k = 0; k < 4; k++) cutTaper(g, [[-10 + k * 7, -10], [-7 + k * 5, -100], [-9 + k * 6, -210]], 4); }); ink(g, 2.6, tr);
    const lobes = [[0, -330, 120], [-90, -280, 84], [92, -290, 88], [-40, -390, 76], [56, -396, 70]];
    const can = q => { for (const [x, y, r] of lobes) circ(q, x, y, r); };
    fill(g, DYE.jade, can, 'nonzero');
    g.save(); g.beginPath(); can(g); g.clip('nonzero');
    let n = 0; for (let y = -460; y < -200; y += 21) for (let x = -180; x < 180; x += 25) { n++; const a = .5 + Math.sin(n * 2.3 + seed) * .7; cut(g, q => q.ellipse(x + (n % 2) * 12, y, 10.5, 4.6, a, 0, 7)); }
    g.restore();
    for (const [x, y, r] of lobes) { g.save(); g.beginPath(); g.rect(-200, -480, 400, 490); for (const [a, b, c] of lobes) if (a !== x || b !== y) circ(g, a, b, c); g.clip('evenodd'); ink(g, 3, q => circ(q, x, y, r)); g.restore(); }
  }, { seed, ss: 2 });
}
function buildStrip(dye, kind, seed) {     // 600-px tile of a carved ground / floor / roof strip
  return piece([0, 0, 600, 70], g => {
    fill(g, dye, q => q.rect(0, 0, 600, 64));
    if (kind === 'ground') { meander(g, 0, 30, 640, 10, 3); for (let x = 20; x < 600; x += 40) coin(g, x, 48, 8); }
    else if (kind === 'floor') { fill(g, DYE.crim, q => q.rect(0, 0, 600, 14)); lattice(g, 0, 26, 600, 56, 24, 5); }
    else { for (let x = 15; x < 600; x += 30) coin(g, x, 20, 9); cutLine(g, 3, q => { q.moveTo(0, 42); q.lineTo(600, 42); }); beadLine(g, 10, 54, 600, 54, 2.6, 20); }
    ink(g, 3.4, q => { q.moveTo(0, 1.7); q.lineTo(600, 1.7); q.moveTo(0, 63); q.lineTo(600, 63); });
  }, { seed, ss: 2 });
}
function buildPost(thick) {
  const h = 740, w = thick ? 34 : 12;
  return piece([-w / 2 - 2, 0, w / 2 + 2, h], g => {
    const p = q => q.rect(-w / 2, 0, w, h); fill(g, thick ? DYE.crim : DYE.brown, p);
    if (thick) within(g, p, () => lattice(g, -w / 2, 10, w / 2, h - 10, 17, 3.6)); else beadLine(g, 0, 16, 0, h - 10, 2.2, 26);
    ink(g, 2.2, p);
  }, { seed: 71 + (thick ? 1 : 0), ss: 2 });
}
function buildStrap() { return piece([-20, -2, 20, 96], g => { ink(g, 5, q => { q.moveTo(0, 0); q.lineTo(0, 52); }, DYE.dark); const r = q => circ(q, 0, 70, 19); fill(g, DYE.ochre, r); cut(g, q => circ(q, 0, 70, 12)); ink(g, 2.2, r); ink(g, 1.8, q => circ(q, 0, 70, 12)); }, { seed: 73, ss: 2 }); }
function buildWindow() {
  const frame = piece([0, 0, 520, 660], g => {
    const o = q => { rrp(q, 4, 4, 512, 652, 34); rrp(q, 34, 34, 452, 592, 20); };
    fill(g, DYE.brown, o, 'evenodd');
    g.save(); g.beginPath(); o(g); g.clip('evenodd');
    for (const [x, y] of [[19, 19], [501, 19], [19, 641], [501, 641]]) coin(g, x, y, 8);
    beadLine(g, 50, 19, 470, 19, 3, 20); beadLine(g, 50, 641, 470, 641, 3, 20); beadLine(g, 19, 50, 19, 610, 3, 20); beadLine(g, 501, 50, 501, 610, 3, 20);
    g.restore();
    ink(g, 3, q => rrp(q, 4, 4, 512, 652, 34)); ink(g, 3, q => rrp(q, 34, 34, 452, 592, 20));
    ink(g, 9, q => { q.moveTo(120, 4); q.lineTo(120, -20); q.moveTo(400, 4); q.lineTo(400, -20); }, DYE.dark);
  }, { seed: 81, ss: 2 });
  const glass = piece([0, 0, 520, 660], g => {
    const p = q => rrp(q, 34, 34, 452, 592, 20); fill(g, DYE.glass, p);
    within(g, p, () => { cutTaper(g, [[300, 60], [380, 150], [450, 260]], 9); cutTaper(g, [[350, 50], [410, 110], [470, 190]], 5); cutTaper(g, [[60, 470], [110, 540], [150, 610]], 6); });
  }, { seed: 82, ss: 2 });
  return { frame, glass };
}
function buildSign() {
  return piece([-104, -640, 104, 6], g => {
    const pole = q => q.rect(-7, -560, 14, 566); fill(g, DYE.brown, pole); within(g, pole, () => beadLine(g, 0, -540, 0, -10, 2.4, 30)); ink(g, 2.2, pole);
    const bd = q => rrp(q, -98, -634, 196, 84, 12); fill(g, DYE.jade, bd);
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.font = '46px Rozha'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('बस स्टॉप', 0, -590); g.restore();
    cutLine(g, 2, q => rrp(q, -90, -626, 180, 68, 8)); ink(g, 2.6, bd);
  }, { seed: 85, ss: 2 });
}
// Title plaque: dark hide, letters cut out so the words glow; carved border; a tab for the rod.
function buildPlaque(lines, px, seed, dye) {
  const [mc, mg] = canvas(8, 8); mg.font = `${px}px Rozha`;
  const tw = Math.max(...lines.map(l => mg.measureText(l).width)), w = tw + px * 1.5, lh = px * 1.3, h = lines.length * lh + px * .95;
  return piece([-w / 2 - 6, -h / 2 - 6, w / 2 + 6, h / 2 + 30], g => {
    const o = q => rrp(q, -w / 2, -h / 2, w, h, 20);
    fill(g, DYE.dark, q => q.rect(-9, h / 2 - 2, 18, 28)); fill(g, dye || DYE.dark, o);
    cutLine(g, 3, q => rrp(q, -w / 2 + 13, -h / 2 + 13, w - 26, h - 26, 11));
    for (const sx of [-1, 1]) for (const sy of [-1, 1]) { coin(g, sx * (w / 2 - 13), sy * (h / 2 - 13), 6); }
    g.save(); g.globalCompositeOperation = 'destination-out'; g.fillStyle = '#000'; g.font = `${px}px Rozha`; g.textAlign = 'center'; g.textBaseline = 'middle';
    lines.forEach((l, i) => g.fillText(l, 0, (i - (lines.length - 1) / 2) * lh + px * .06)); g.restore();
    ink(g, 3, o);
  }, { seed, ss: 2 });
}
