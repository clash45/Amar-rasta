/* update.js - game rules: driving, traffic, collisions, honking, anger, mobs, meme timer.
   World coordinates: u = lateral, r = distance ahead of the player (0 = the player). */
(function () {
  const C = G.C, rnd = G.rnd, clamp = G.clamp;

  /* ---------- world movement ---------- */
  function scrollWorld(dt) {
    const S = G.S, d = S.speed * dt;
    S.dist += d;
    for (let s = 0; s < 2; s++) for (const b of S.bld[s]) b.r -= d;
    for (const p of S.props) p.r -= d;
    G.fillWorld();
  }

  function spawnLogic(dt) {
    const S = G.S, f = 340 / Math.max(S.speed, 150);
    S.nextCar -= dt;
    if (S.nextCar <= 0) {
      G.spawnCar();
      S.nextCar = rnd(C.CAR_INT[0], C.CAR_INT[1]) * Math.max(0.5, 1 - S.dist / 60000) * f;
    }
    S.nextPed -= dt;
    if (S.nextPed <= 0) {
      G.spawnPed();
      S.nextPed = rnd(C.PED_INT[0], C.PED_INT[1]) * f;
    }
  }

  function updateCars(dt) {
    const S = G.S;
    for (const c of S.cars) {
      c.r += (c.v - S.speed) * dt;
      c.u += clamp(c.tu - c.u, -80 * dt, 80 * dt) + c.pvx * dt;
      c.pvx *= Math.pow(0.03, dt);
    }
    S.cars = S.cars.filter(c => c.r > -250 && c.r < C.VIEW + 400);
  }

  function updatePeds(dt) {
    const S = G.S;
    for (const p of S.peds) {
      p.u += p.gx * dt;
      p.r -= S.speed * dt;
      p.ph += dt * 8;
      if (p.cross && ((p.gx > 0 && p.u > 198) || (p.gx < 0 && p.u < -198))) { p.gx = 0; p.cross = false; }
      if (p.flee && Math.abs(p.u) > 198) { p.gx = 0; p.flee = false; }
    }
    S.peds = S.peds.filter(p => p.r > -250);
  }

  function updateMobs(dt, dying) {
    const S = G.S;
    for (const m of S.mobs) {
      const tu = S.px + (dying ? m.ox : 0), tr = dying ? m.orr : 0;
      const du = tu - m.u, dr = tr - m.r;
      const L = C.MOB_LATERAL + S.anger * 0.5;
      m.u += clamp(du, -L * dt, L * dt);
      if (!dying || Math.abs(dr) > 8) m.r += (Math.sign(dr) || 1) * m.run * 0.9 * dt;
      m.r -= S.speed * dt;
      m.ph += dt * 14;
    }
    S.mobs = S.mobs.filter(m => m.r > -250);
  }

  function updateTexts(dt) {
    const S = G.S;
    for (const t of S.texts) {
      t.lift += 40 * dt;
      t.life -= dt * 0.9;
      t.r -= S.speed * dt;
    }
    S.texts = S.texts.filter(t => t.life > 0);
  }

  /* ---------- collisions ---------- */
  const HW = 15, HL = 26;   // half width / half length of the player's rickshaw

  function bump(c) {
    const S = G.S;
    c.hit = true;
    S.crash = C.CRASH_STUN;
    S.speed = Math.min(S.speed, 120);
    S.shake = 0.35;
    S.anger = Math.min(100, S.anger + 25);
    S.bumps++;
    const sg = Math.sign(S.px - c.u) || 1;
    S.vx = sg * 220;
    c.pvx = -sg * 200;
    G.addText(S.px, 40, 60, 'BUMP!', '#ffd23f');
    G.audio.crash();
    G.spawnMobs(2, rnd(320, 420));
  }

  function caught() {
    const S = G.S;
    S.state = 'dying';
    S.die = 0.9;
    S.speed = 0;
    S.shake = 0.5;
    G.audio.crash();
    G.audio.stopMeme();
    G.addText(S.px, 40, 70, 'CAUGHT!', '#ff4444');
  }

  function collide() {
    const S = G.S;
    for (const c of S.cars) {
      if (c.hit) continue;
      const ax = Math.abs(c.u - S.px), ar = Math.abs(c.r);
      const ow = c.w / 2 + HW, ol = c.len / 2 + HL;
      if (ax < ow && ar < ol) { bump(c); continue; }
      if (!c.near && ax < ow + 13 && ar < ol) {
        c.near = true; S.near++; S.score += 10;
        G.addText(c.u, c.r, 50, 'NEAR MISS +10', '#7CFC00');
      }
    }
    for (let i = S.peds.length - 1; i >= 0; i--) {
      const p = S.peds[i];
      if (Math.abs(p.u - S.px) < HW + 6 && Math.abs(p.r) < HL + 6) {
        S.peds.splice(i, 1);
        S.mobs.push(G.newMob(p.u, p.r));
        S.anger = Math.min(100, S.anger + 30);
        S.speed *= 0.75;
        S.shake = 0.2;
        G.addText(p.u, p.r, 50, 'OOPS!', '#ff6b6b');
        G.audio.crash();
      }
    }
    for (const m of S.mobs) {
      if (Math.abs(m.u - S.px) < HW + 10 && Math.abs(m.r) < HL + 10) { caught(); return; }
    }
  }

  /* ---------- honk ---------- */
  function doHonk() {
    const S = G.S;
    S.honkCd = 0.32;
    S.honks++;
    G.audio.honk();
    S.ring = 0.3;
    let hit = false;
    for (const p of S.peds) {
      if (p.r > -100 && p.r < 500 && Math.abs(p.u) < C.ROAD_HALF + 30) {
        p.gx = (p.u < 0 ? -1 : 1) * 140;
        p.cross = false;
        p.flee = true;
        hit = true;
      }
    }
    for (const c of S.cars) {
      if (c.dir > 0 && c.r > 0 && c.r < 700 && Math.abs(c.u - S.px) < 55) {
        c.lane = c.lane === 2 ? 3 : 2;
        c.tu = C.LANES[c.lane];
        hit = true;
      }
    }
    S.anger = Math.min(100, S.anger + (hit ? 2.5 : 0.6));
    if (hit) { S.score += 3; G.addText(S.px, 0, 70, 'PEEP! +3', '#fff'); }
    else G.addText(S.px, 0, 70, 'PEEP!', '#ccc');
  }

  /* ---------- one frame ---------- */
  G.step = function (dt) {
    const S = G.S;
    S.time += dt;
    S.cam += (S.px * C.CAM_FOLLOW - S.cam) * Math.min(1, dt * 6);

    if (S.state === 'title') {
      S.speed = 220;
      S.px = 85 + Math.sin(S.time * 0.8) * 40;
      scrollWorld(dt); spawnLogic(dt); updateCars(dt); updatePeds(dt); updateTexts(dt);
      return;
    }
    if (S.state === 'pause' || S.state === 'over') return;

    if (S.state === 'dying') {
      S.die -= dt;
      S.speed = 0;
      updateMobs(dt, true);
      updateTexts(dt);
      S.shake = Math.max(0, S.shake - dt);
      if (S.die <= 0) { S.state = 'over'; G.ui.showOver(); }
      return;
    }

    /* ----- playing ----- */
    const keys = G.keys;
    S.t += dt;

    let target = C.CRUISE;
    if (keys.up) target = C.MAXSPEED;
    if (keys.down) target = C.MINSPEED;
    if (S.crash > 0) { S.crash -= dt; target = Math.min(target, 70); }
    const rate = target > S.speed ? 320 : 520;
    S.speed += clamp(target - S.speed, -rate * dt, rate * dt);

    const dir = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
    S.vx += (dir * 260 - S.vx) * Math.min(1, dt * 9);
    S.px = clamp(S.px + S.vx * dt, -C.PX_LIMIT, C.PX_LIMIT);

    scrollWorld(dt);

    S.wrong = S.px > -C.ROAD_HALF && S.px < -4;
    S.side = Math.abs(S.px) >= C.ROAD_HALF;
    S.score += S.speed * dt / 12 + (S.wrong ? 40 * dt : 0) + (S.side ? 25 * dt : 0);
    if (S.wrong) S.wrongT += dt;
    S.anger = clamp(S.anger + ((S.wrong ? 5 : 0) + (S.side ? 4 : 0) - 2.5) * dt, 0, 100);

    S.honkCd -= dt;
    if (keys.honk && S.honkCd <= 0) doHonk();
    S.ring = Math.max(0, S.ring - dt);
    S.shake = Math.max(0, S.shake - dt);

    /* meme sound: every MEME_INTERVAL seconds of driving */
    S.memeT += dt;
    if (S.memeT >= C.MEME_INTERVAL) { S.memeT -= C.MEME_INTERVAL; G.audio.playMeme(); }

    spawnLogic(dt);
    if (S.anger >= 20) {
      S.nextMob -= dt;
      if (S.nextMob <= 0) {
        G.spawnMobs(1, C.VIEW * 0.8);
        S.nextMob = 5 - 3.8 * clamp((S.anger - 20) / 80, 0, 1);
      }
    } else S.nextMob = Math.max(S.nextMob, 2.5);

    updateCars(dt); updatePeds(dt); updateMobs(dt, false); updateTexts(dt);
    collide();
  };
})();
