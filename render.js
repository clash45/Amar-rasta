/* render.js - draws a frame: sky, road, buildings, traffic, player, HUD. Third-person view from behind. */
(function () {
  const C = G.C, P = G.proj, SP = G.sprites, W = C.W, H = C.H, TAU = G.TAU;
  const cv = document.getElementById('cv');
  const ctx = cv.getContext('2d');
  const Q = Math.min(2, window.devicePixelRatio || 1);
  cv.width = W * Q;
  cv.height = H * Q;

  /* distant skyline, generated once */
  const sky1 = [], sky2 = [];
  (function () {
    let x = -20;
    while (x < W + 40) { const w = G.rnd(20, 46); sky1.push({ x, w, h: G.rnd(25, 80) }); x += w + G.rnd(0, 6); }
    x = -30;
    while (x < W + 40) { const w = G.rnd(26, 60); sky2.push({ x, w, h: G.rnd(15, 45) }); x += w + G.rnd(0, 10); }
  })();

  /* fill a flat shape given as [u, z, h] road points */
  function poly(pts, fill) {
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i], z = Math.max(p[1], C.NEAR);
      const x = P.x(p[0], z), y = P.y(p[2] || 0, z);
      if (i) ctx.lineTo(x, y); else ctx.moveTo(x, y);
    }
    ctx.closePath();
    ctx.fillStyle = fill;
    ctx.fill();
  }
  function rr(x, y, w, h, r) {
    ctx.beginPath(); ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r); ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r); ctx.arcTo(x, y, x + w, y, r); ctx.closePath();
  }

  /* ---------- background ---------- */
  function drawSky() {
    const S = G.S;
    const g = ctx.createLinearGradient(0, 0, 0, C.HORIZON);
    g.addColorStop(0, '#6f9fcf'); g.addColorStop(1, '#f2dcb8');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, W, C.HORIZON + 1);
    ctx.fillStyle = '#b9bfc4';
    for (const b of sky2) ctx.fillRect(b.x - S.cam * 0.03, C.HORIZON - b.h, b.w, b.h);
    ctx.fillStyle = '#9aa4ad';
    for (const b of sky1) ctx.fillRect(b.x - S.cam * 0.06, C.HORIZON - b.h, b.w, b.h);
    ctx.fillStyle = '#5b5850';
    ctx.fillRect(0, C.HORIZON, W, H - C.HORIZON);
  }

  /* ---------- road surface ---------- */
  const ARROW = [[0, 32], [13, 6], [5, 6], [5, -32], [-5, -32], [-5, 6], [-13, 6]];

  function drawRoad() {
    const S = G.S, RH = C.ROAD_HALF, SH = C.SIDE_HALF, BAND = 200, NEAR = C.NEAR, ZF = C.ZFAR;
    const base = S.dist - C.PZ;

    // asphalt + sidewalk in alternating bands (gives the feeling of speed)
    for (let a = Math.floor(base / BAND) * BAND; a < S.dist + ZF; a += BAND) {
      const z0 = a - S.dist + C.PZ, z1 = z0 + BAND;
      if (z1 <= NEAR) continue;
      const par = (a / BAND) & 1;
      poly([[-RH, z0], [RH, z0], [RH, z1], [-RH, z1]], par ? '#3a3a41' : '#41414a');
      const sw = par ? '#8d8a82' : '#97948c';
      poly([[-SH, z0], [-RH, z0], [-RH, z1], [-SH, z1]], sw);
      poly([[RH, z0], [SH, z0], [SH, z1], [RH, z1]], sw);
    }
    // curbs
    poly([[-RH - 6, NEAR], [-RH, NEAR], [-RH, ZF], [-RH - 6, ZF]], '#c9c4b8');
    poly([[RH, NEAR], [RH + 6, NEAR], [RH + 6, ZF], [RH, ZF]], '#c9c4b8');
    // double yellow centre line
    poly([[-5, NEAR], [-2, NEAR], [-2, ZF], [-5, ZF]], '#f1c40f');
    poly([[2, NEAR], [5, NEAR], [5, ZF], [2, ZF]], '#f1c40f');

    // dashed lane lines
    const DASH = 120, dEnd = S.dist + C.VIEW * 1.4;
    for (let a = Math.floor(base / DASH) * DASH; a < dEnd; a += DASH) {
      const z0 = a - S.dist + C.PZ, z1 = z0 + 60;
      if (z1 <= NEAR) continue;
      poly([[-86.5, z0], [-83.5, z0], [-83.5, z1], [-86.5, z1]], 'rgba(255,255,255,.75)');
      poly([[83.5, z0], [86.5, z0], [86.5, z1], [83.5, z1]], 'rgba(255,255,255,.75)');
    }

    // direction arrows painted on the road
    const AR = 640;
    for (let a = Math.floor(base / AR) * AR + 320; a < S.dist + C.VIEW * 1.3; a += AR) {
      const zc = a - S.dist + C.PZ;
      if (zc < NEAR + 40) continue;
      for (let i = 0; i < 4; i++) {
        const sg = i >= 2 ? 1 : -1, uc = C.LANES[i];
        poly(ARROW.map(p => [uc + p[0], zc + p[1] * sg]), 'rgba(255,255,255,.38)');
      }
    }

    // sidewalk tile lines
    ctx.strokeStyle = 'rgba(0,0,0,.16)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let a = Math.floor(base / 60) * 60; a < S.dist + C.VIEW; a += 60) {
      const z = a - S.dist + C.PZ;
      if (z < NEAR) continue;
      const y = P.y(0, z);
      ctx.moveTo(P.x(-SH, z), y); ctx.lineTo(P.x(-RH - 6, z), y);
      ctx.moveTo(P.x(RH + 6, z), y); ctx.lineTo(P.x(SH, z), y);
    }
    ctx.stroke();
  }

  /* ---------- buildings along both sides ---------- */
  function drawBuildings() {
    const S = G.S;
    for (let s = 0; s < 2; s++) {
      const sg = s ? 1 : -1, a = S.bld[s];
      for (let i = a.length - 1; i >= 0; i--) {          // far to near
        const b = a[i], z0 = b.r + C.PZ, z1 = z0 + b.len;
        if (z1 <= C.NEAR + 2 || z0 > C.VIEW + C.PZ + 300) continue;
        const uIn = sg * C.SIDE_HALF, uOut = sg * (C.SIDE_HALF + b.depth), zn = Math.max(z0, C.NEAR);

        poly([[uIn, zn, 0], [uIn, z1, 0], [uIn, z1, b.h], [uIn, zn, b.h]], b.wall);                 // wall facing the road
        if (z0 > C.NEAR) poly([[uIn, z0, 0], [uOut, z0, 0], [uOut, z0, b.h], [uIn, z0, b.h]], b.front); // face toward us
        if (b.h < C.CAMH) poly([[uIn, zn, b.h], [uOut, zn, b.h], [uOut, z1, b.h], [uIn, z1, b.h]], b.roof);

        // shop sign band
        poly([[uIn, Math.max(z0 + 6, C.NEAR), 8], [uIn, z1 - 6, 8], [uIn, z1 - 6, 28], [uIn, Math.max(z0 + 6, C.NEAR), 28]], b.sign);

        // windows
        if (z0 > 160) {
          for (let k = 0; z0 + 14 + k * 30 + 14 < z1; k++) {
            const zz = z0 + 14 + k * 30;
            for (let j = 0; 44 + j * 36 + 18 < b.h; j++) {
              const hh = 44 + j * 36, t = (b.seed + k * 7 + j * 13) % 3;
              poly([[uIn, zz, hh], [uIn, zz + 14, hh], [uIn, zz + 14, hh + 18], [uIn, zz, hh + 18]],
                   t === 0 ? 'rgba(255,240,170,.6)' : '#2a3340');
            }
          }
        }
      }
    }
  }

  function drawHaze() {
    const g = ctx.createLinearGradient(0, C.HORIZON - 40, 0, C.HORIZON + 110);
    g.addColorStop(0, 'rgba(242,220,184,0)');
    g.addColorStop(0.3, 'rgba(242,220,184,.92)');
    g.addColorStop(1, 'rgba(242,220,184,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, C.HORIZON - 40, W, 150);
  }

  /* ---------- things standing on the road ---------- */
  function drawItem(it) {
    const S = G.S, z = it.r + C.PZ;
    if (z < C.NEAR) return;
    const s = C.F / z;
    const u = it.k === 'prop' ? it.o.side * 238 : (it.k === 'player' ? S.px : it.o.u);
    const x = P.x(u, z);
    if (x < -120 || x > W + 120) return;
    const fog = G.clamp(1 - (z - 700) / 900, 0, 1);
    if (fog <= 0) return;
    let gy = P.y(0, z);
    ctx.globalAlpha = fog;
    switch (it.k) {
      case 'prop': SP.lamp(ctx, it.o.side, x, gy, s); break;
      case 'ped': SP.person(ctx, it.o, x, gy, s, it.o.r > 0); break;
      case 'mob': SP.mob(ctx, it.o, x, gy, s, it.o.r > 0); break;
      case 'car': SP.vehicle(ctx, it.o, x, gy, s, it.o.dir < 0); break;
      case 'player':
        gy += Math.sin(S.time * 38) * 0.8 * (S.speed / 700);
        SP.vehicle(ctx, { type: 'auto', w: 34, col: '#1aa04a', col2: '#ffd23f', driver: true,
                          tilt: G.clamp(S.vx / 260, -1, 1) * 0.12 }, x, gy, s * 1.25, false);
        break;
    }
    ctx.globalAlpha = 1;
  }

  function drawWorldItems() {
    const S = G.S, list = [];
    for (const p of S.props) list.push({ k: 'prop', r: p.r, o: p });
    for (const p of S.peds) list.push({ k: 'ped', r: p.r, o: p });
    for (const c of S.cars) list.push({ k: 'car', r: c.r, o: c });
    for (const m of S.mobs) list.push({ k: 'mob', r: m.r, o: m });
    list.push({ k: 'player', r: 0, o: null });
    list.sort((a, b) => b.r - a.r);                     // far first
    for (const it of list) drawItem(it);
  }

  function drawEffects() {
    const S = G.S;
    // speed lines racing out of the vanishing point
    if (S.speed > 520) {
      ctx.strokeStyle = 'rgba(255,255,255,.22)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 10; i++) {
        const ang = Math.PI * (0.08 + 0.84 * (i / 9));
        const r0 = ((S.time * 700 + i * 97) % 420) + 90;
        ctx.beginPath();
        ctx.moveTo(W / 2 + Math.cos(ang) * r0, C.HORIZON + 40 + Math.sin(ang) * r0 * 1.15);
        ctx.lineTo(W / 2 + Math.cos(ang) * (r0 + 40), C.HORIZON + 40 + Math.sin(ang) * (r0 + 40) * 1.15);
        ctx.stroke();
      }
    }
    // horn sound waves
    if (S.ring > 0) {
      const z = C.PZ, x = P.x(S.px, z), y = P.y(25, z);
      ctx.strokeStyle = 'rgba(255,255,255,' + (S.ring * 2.5) + ')';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(x, y, (0.3 - S.ring) * 380 + 20, Math.PI * 1.15, Math.PI * 1.85);
      ctx.stroke();
    }
    // floating texts
    for (const t of S.texts) {
      const z = t.r + C.PZ;
      if (z < C.NEAR) continue;
      ctx.globalAlpha = Math.max(0, Math.min(1, t.life * 1.5));
      ctx.fillStyle = t.col;
      ctx.strokeStyle = 'rgba(0,0,0,.7)';
      ctx.lineWidth = 3;
      ctx.font = '16px Bungee, Impact, sans-serif';
      ctx.textAlign = 'center';
      const x = P.x(t.u, z), y = P.y(t.h, z) - t.lift;
      ctx.strokeText(t.txt, x, y);
      ctx.fillText(t.txt, x, y);
    }
    ctx.globalAlpha = 1;
  }

  /* ---------- HUD ---------- */
  function drawHUD() {
    const S = G.S;
    ctx.save();
    ctx.textAlign = 'left';
    ctx.fillStyle = 'rgba(0,0,0,.5)'; rr(10, 10, 150, 58, 10); ctx.fill();
    ctx.fillStyle = '#bbb'; ctx.font = '700 11px system-ui'; ctx.fillText('CHAOS SCORE', 20, 28);
    ctx.fillStyle = '#ffd23f'; ctx.font = '26px Bungee, Impact, sans-serif'; ctx.fillText(String(Math.floor(S.score)), 20, 57);

    ctx.fillStyle = 'rgba(0,0,0,.5)'; rr(W - 160, 10, 150, 58, 10); ctx.fill();
    ctx.fillStyle = '#bbb'; ctx.font = '700 11px system-ui'; ctx.fillText('PUBLIC ANGER', W - 150, 28);
    ctx.fillStyle = '#333'; rr(W - 150, 35, 130, 14, 7); ctx.fill();
    const a = S.anger / 100;
    if (a > 0) { ctx.fillStyle = 'hsl(' + (120 - 120 * a) + ',85%,50%)'; rr(W - 150, 35, Math.max(10, 130 * a), 14, 7); ctx.fill(); }
    ctx.fillStyle = '#ddd'; ctx.font = '11px system-ui'; ctx.fillText(Math.floor(S.dist / 40) + ' m', W - 150, 63);

    if (S.state === 'play' && (S.wrong || S.side) && ((S.time * 4) | 0) % 2 === 0) {
      ctx.textAlign = 'center'; ctx.fillStyle = '#ff4d4d'; ctx.font = '18px Bungee, Impact, sans-serif';
      ctx.fillText(S.side ? 'SIDEWALK! CHAOS +' : 'WRONG WAY! CHAOS +', W / 2, 100);
    }
    if (S.state === 'play' && S.t < 6) {
      ctx.textAlign = 'center'; ctx.fillStyle = 'rgba(255,255,255,.9)'; ctx.font = '600 13px system-ui';
      ctx.fillText('Arrows/WASD: steer + speed   Space: honk', W / 2, H - 24);
    }
    ctx.restore();
  }

  /* ---------- one frame ---------- */
  G.render = function () {
    const S = G.S;
    ctx.setTransform(Q, 0, 0, Q, 0, 0);
    ctx.clearRect(0, 0, W, H);
    ctx.save();
    if (S.shake > 0) ctx.translate((Math.random() - 0.5) * 14 * S.shake, (Math.random() - 0.5) * 14 * S.shake);
    drawSky();
    drawRoad();
    drawBuildings();
    drawHaze();
    drawWorldItems();
    drawEffects();
    ctx.restore();

    // red edges when the public is furious
    if (S.anger > 60) {
      const k = (S.anger - 60) / 40 * 0.4 * (0.75 + 0.25 * Math.sin(S.time * 8));
      const g = ctx.createRadialGradient(W / 2, H / 2, H * 0.3, W / 2, H / 2, H * 0.75);
      g.addColorStop(0, 'rgba(255,0,0,0)');
      g.addColorStop(1, 'rgba(255,0,0,' + k + ')');
      ctx.fillStyle = g;
      ctx.fillRect(0, 0, W, H);
    }
    if (S.state !== 'title') drawHUD();
    if (S.state === 'pause') {
      ctx.fillStyle = 'rgba(0,0,0,.6)'; ctx.fillRect(0, 0, W, H);
      ctx.fillStyle = '#fff'; ctx.textAlign = 'center';
      ctx.font = '34px Bungee, Impact, sans-serif'; ctx.fillText('PAUSED', W / 2, H / 2);
      ctx.font = '600 14px system-ui'; ctx.fillText('press P to continue', W / 2, H / 2 + 30);
    }
  };
})();
