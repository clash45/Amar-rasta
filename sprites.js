/* sprites.js - draws vehicles, people and lamps as seen from behind (or from the front for oncoming traffic).
   Every function draws at the road point (x, gy) with scale s = pixels per world unit. Drawing units: y is negative upwards. */
(function () {
  const TAU = G.TAU;
  let c = null;

  function poly(pts, fill) {
    c.beginPath(); c.moveTo(pts[0][0], pts[0][1]);
    for (let i = 1; i < pts.length; i++) c.lineTo(pts[i][0], pts[i][1]);
    c.closePath(); c.fillStyle = fill; c.fill();
  }
  function rect(x, y, w, h, fill) { c.fillStyle = fill; c.fillRect(x, y, w, h); }
  function rr(x, y, w, h, r, fill) {
    c.beginPath(); c.moveTo(x + r, y);
    c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r);
    c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r);
    c.closePath(); c.fillStyle = fill; c.fill();
  }
  function circ(x, y, r, fill) { c.fillStyle = fill; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill(); }
  function begin(ctx, x, gy, s) { c = ctx; c.save(); c.translate(x, gy); c.scale(s, s); }
  function shadow(w) { c.fillStyle = 'rgba(0,0,0,.3)'; c.beginPath(); c.ellipse(0, 0, w * 0.62, 5, 0, 0, TAU); c.fill(); }

  /* ---------- vehicles ---------- */
  function vehicle(ctx, o, x, gy, s, front) {
    begin(ctx, x, gy, s);
    shadow(o.w);
    if (o.tilt) c.rotate(o.tilt);
    const w = o.w, hw = w / 2;

    if (o.type === 'car') {
      rect(-hw + 1, -9, 8, 9, '#111'); rect(hw - 9, -9, 8, 9, '#111');
      rr(-hw, -25, w, 18, 4, o.col);
      const cab = [[-hw + 5, -25], [-hw + 9, -38], [hw - 9, -38], [hw - 5, -25]];
      poly(cab, o.col); poly(cab, 'rgba(255,255,255,.14)');
      poly([[-hw + 8, -26], [-hw + 11, -36], [hw - 11, -36], [hw - 8, -26]], front ? '#3d566e' : '#1d2430');
      if (front) { rect(-hw + 2, -21, 8, 5, '#ffe9a0'); rect(hw - 10, -21, 8, 5, '#ffe9a0'); rect(-8, -20, 16, 5, '#222'); }
      else { rect(-hw + 2, -21, 8, 4, '#e33'); rect(hw - 10, -21, 8, 4, '#e33'); rect(-5, -17, 10, 4, '#eee'); }

    } else if (o.type === 'bus') {
      rect(-hw + 2, -9, 10, 9, '#111'); rect(hw - 12, -9, 10, 9, '#111');
      rr(-hw, -72, w, 64, 4, o.col);
      rect(-hw, -38, w, 6, o.col2);
      rect(-hw, -74, w, 4, 'rgba(255,255,255,.3)');
      if (front) {
        rect(-hw + 3, -64, w - 6, 24, '#34495e');
        rect(-14, -70, 28, 5, '#f1c40f');
        rect(-hw + 2, -26, 8, 5, '#ffe9a0'); rect(hw - 10, -26, 8, 5, '#ffe9a0');
      } else {
        rect(-hw + 3, -64, w - 6, 17, '#1d2430');
        for (let i = 0; i < 3; i++) rect(-hw + 5 + i * 15, -62, 11, 13, 'rgba(255,255,255,.25)');
        rect(-hw + 2, -26, 8, 5, '#e33'); rect(hw - 10, -26, 8, 5, '#e33');
        rect(-6, -20, 12, 5, '#eee');
      }

    } else if (o.type === 'truck') {
      rect(-hw + 1, -9, 9, 9, '#111'); rect(hw - 10, -9, 9, 9, '#111');
      if (front) {
        rect(-hw, -58, w, 18, '#8a8f98');
        rr(-hw + 1, -44, w - 2, 34, 4, o.col2);
        rect(-hw + 6, -40, w - 12, 14, '#2c3e50');
        rect(-hw + 3, -20, 8, 5, '#ffe9a0'); rect(hw - 11, -20, 8, 5, '#ffe9a0'); rect(-9, -18, 18, 6, '#222');
      } else {
        rr(-hw, -60, w, 48, 2, '#8a8f98');
        rect(-1, -58, 2, 44, 'rgba(0,0,0,.35)');
        rect(-hw, -12, w, 5, '#333');
        rect(-hw + 2, -22, 7, 5, '#e33'); rect(hw - 9, -22, 7, 5, '#e33');
      }

    } else if (o.type === 'auto') {
      rect(-hw + 1, -9, 7, 9, '#111'); rect(hw - 8, -9, 7, 9, '#111');
      if (front) rect(-3, -8, 6, 8, '#111');
      rr(-hw, -27, w, 20, 5, o.col);
      rect(-hw, -19, w, 4, o.col2);
      rr(-hw + 3, -43, w - 6, 18, 5, o.col);
      rr(-hw + 3, -43, w - 6, 18, 5, 'rgba(0,0,0,.18)');
      if (front) {
        rect(-hw + 7, -40, w - 14, 11, '#9fd3ff');
        circ(0, -17, 3.5, '#ffe9a0');
      } else {
        rect(-hw + 7, -40, w - 14, 11, '#223');
        if (o.driver) { circ(0, -33, 4.2, '#c58c5a'); rr(-4.5, -38, 9, 4, 2, '#222'); }
        rect(-hw + 2, -17, 5, 4, '#e33'); rect(hw - 7, -17, 5, 4, '#e33');
      }

    } else { // bike
      rect(-2.5, -14, 5, 14, '#111');
      if (front) {
        rect(-10, -28, 20, 3, '#222');
        rr(-6, -34, 12, 16, 5, o.col);
        circ(0, -39, 5.5, '#222');
        circ(0, -16, 2.5, '#ffe9a0');
      } else {
        rr(-7, -34, 14, 19, 5, o.col);
        circ(0, -39, 5.5, o.col2);
        rect(-1.5, -14, 3, 3, '#e33');
      }
    }
    c.restore();
  }

  /* ---------- people ---------- */
  function legs(sw) {
    rect(-4, -10 - Math.abs(sw) * 0.3, 3, 10, '#2c3e50');
    rect(1, -10 + Math.abs(sw) * 0.3, 3, 10, '#2c3e50');
  }

  function person(ctx, o, x, gy, s, front) {
    begin(ctx, x, gy, s);
    shadow(12);
    legs(Math.sin(o.ph || 0) * 3);
    rr(-5, -25, 10, 16, 3, o.col);
    circ(0, -30, 4.5, '#d9a066');
    if (front) { c.fillStyle = '#222'; c.beginPath(); c.arc(0, -31, 4.5, Math.PI, 0); c.fill(); }
    else circ(0, -30, 4.6, '#222');
    c.restore();
  }

  function mob(ctx, m, x, gy, s, front) {
    begin(ctx, x, gy, s);
    shadow(16);
    const bob = Math.sin(m.ph) * 2;
    legs(Math.sin(m.ph) * 4);
    c.lineCap = 'round';
    c.strokeStyle = '#7a4a1c'; c.lineWidth = 3.5;
    c.beginPath(); c.moveTo(8, -28 + bob); c.lineTo(16, -54 + bob); c.stroke();      // the stick
    rr(-7, -30 + bob * 0.3, 14, 20, 3, m.col);
    c.strokeStyle = m.col; c.lineWidth = 4.5;
    c.beginPath(); c.moveTo(6, -26); c.lineTo(10, -34 + bob); c.stroke();           // raised arm
    circ(10, -34 + bob, 2.6, '#d9a066');
    circ(0, -35 + bob * 0.3, 5.5, '#d9a066');
    if (front) {
      c.fillStyle = '#222'; c.beginPath(); c.arc(0, -36 + bob * 0.3, 5.5, Math.PI, 0); c.fill();
      rect(-3.5, -36 + bob * 0.3, 2, 1.6, '#222'); rect(1.5, -36 + bob * 0.3, 2, 1.6, '#222');
      c.strokeStyle = '#c0392b'; c.lineWidth = 1.2;
      c.beginPath(); c.moveTo(-4.5, -38 + bob * 0.3); c.lineTo(-1, -36.6 + bob * 0.3);
      c.moveTo(4.5, -38 + bob * 0.3); c.lineTo(1, -36.6 + bob * 0.3); c.stroke();
    } else circ(0, -35 + bob * 0.3, 5.6, '#222');
    c.fillStyle = '#ff2d2d'; c.font = 'bold 18px system-ui'; c.textAlign = 'center';
    c.fillText('!', -2, -45 + bob * 0.3);
    c.restore();
  }

  /* ---------- street lamp ( side: 1 = right of the road, -1 = left ) ---------- */
  function lamp(ctx, side, x, gy, s) {
    begin(ctx, x, gy, s);
    rect(-2, -120, 4, 120, '#555');
    if (side > 0) rect(-24, -123, 24, 3, '#555'); else rect(0, -123, 24, 3, '#555');
    circ(side > 0 ? -24 : 24, -119, 5, '#ffe9a0');
    c.restore();
  }

  G.sprites = { vehicle, person, mob, lamp };
})();
