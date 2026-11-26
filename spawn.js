/* spawn.js - creates cars, pedestrians, angry mobs, buildings, lamps and floating texts. */
(function () {
  const C = G.C, rnd = G.rnd, pick = G.pick;

  /* wall, front face, roof */
  const BUILDING_COLORS = [
    ['#b9a58c', '#9a8870', '#cdbca4'],
    ['#9fb3c8', '#8196ad', '#b6c6d8'],
    ['#c9a0a0', '#aa8282', '#dbb7b7'],
    ['#a8c5a0', '#8aa882', '#bfd8b8'],
    ['#d4c28a', '#b5a46d', '#e4d6a8'],
    ['#8f9aa8', '#737e8c', '#a9b3bf']
  ];
  const SIGN_COLORS = ['#e74c3c', '#f1c40f', '#2ecc71', '#3498db', '#e67e22'];

  G.pushBuilding = function (arr) {
    const last = arr[arr.length - 1];
    const col = pick(BUILDING_COLORS);
    arr.push({
      r: last ? last.r + last.len + rnd(6, 30) : -300,
      len: rnd(110, 200),
      h: rnd(120, 300),
      depth: rnd(70, 110),
      wall: col[0], front: col[1], roof: col[2],
      sign: pick(SIGN_COLORS),
      seed: (Math.random() * 1000) | 0
    });
  };

  /* keeps buildings and lamps filled ahead and trimmed behind */
  G.fillWorld = function () {
    const S = G.S;
    for (let s = 0; s < 2; s++) {
      const a = S.bld[s];
      while (a.length && a[0].r + a[0].len < -C.PZ - 120) a.shift();
      while (!a.length || a[a.length - 1].r + a[a.length - 1].len < C.VIEW + 500) G.pushBuilding(a);
    }
    const p = S.props;
    while (p.length && p[0].r < -C.PZ - 120) p.shift();
    while (!p.length || p[p.length - 1].r < C.VIEW + 500) {
      const last = p[p.length - 1];
      p.push({ r: last ? last.r + 260 : -200, side: last ? -last.side : 1 });
    }
  };

  G.spawnCar = function () {
    const S = G.S;
    const type = pick(['car', 'car', 'car', 'car', 'auto', 'auto', 'auto', 'bike', 'bike', 'bus', 'truck']);
    const T = C.TYPES[type];
    const lane = (Math.random() * 4) | 0;
    const dir = lane < 2 ? -1 : 1;
    const r = C.VIEW + rnd(0, 60);
    for (const c of S.cars) {
      if (c.lane === lane && Math.abs(c.r - r) < (c.len + T.len) / 2 + 160) return;
    }
    const sp = C.SPEEDS[type];
    const off = type === 'bike' ? rnd(-18, 18) : rnd(-5, 5);
    S.cars.push({
      type, w: T.w, len: T.len, lane, dir,
      v: rnd(sp[0], sp[1]) * dir,
      u: C.LANES[lane] + off, tu: C.LANES[lane] + off,
      r, pvx: 0,
      col: pick(C.CARCOLS), col2: pick(C.CARCOLS),
      hit: false, near: false
    });
  };

  G.spawnPed = function () {
    const S = G.S;
    const right = Math.random() < 0.5;
    const cross = Math.random() < 0.4;
    S.peds.push({
      u: right ? 205 : -205, r: C.VIEW + rnd(0, 60),
      gx: cross ? (right ? -1 : 1) * 60 : 0,
      cross, flee: false, ph: rnd(0, G.TAU),
      col: pick(['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#ecf0f1'])
    });
  };

  G.newMob = function (u, r) {
    const S = G.S;
    return {
      u, r,
      run: rnd(C.MOB_RUN[0], C.MOB_RUN[1]) + S.anger * 0.4,
      ph: rnd(0, G.TAU),
      ox: rnd(-45, 45), orr: rnd(-25, 45),     // where the mob stands when it surrounds you
      col: pick(['#d33', '#38c', '#e90', '#6a3', '#a4a'])
    };
  };

  /* n mobs come out of the sidewalk nearest to the player, r0 units ahead */
  G.spawnMobs = function (n, r0) {
    const S = G.S;
    const u = S.px < 0 ? -232 : 232;
    for (let i = 0; i < n; i++) S.mobs.push(G.newMob(u + rnd(-8, 8), r0 + rnd(0, 120)));
  };

  /* floating text at a spot in the world */
  G.addText = function (u, r, h, txt, col) {
    G.S.texts.push({ u, r, h, txt, col: col || '#fff', life: 1, lift: 0 });
  };
})();
