/* projection.js - turns road coordinates into screen coordinates.
   u = lateral position (0 = centre line)   z = distance in front of the camera   h = height above the road */
(function () {
  const C = G.C;
  G.proj = {
    /* pixels per world unit at distance z */
    s: z => C.F / z,
    /* screen x */
    x: (u, z) => C.W / 2 + (u - G.S.cam) * C.F / z,
    /* screen y */
    y: (h, z) => C.HORIZON + (C.CAMH - h) * C.F / z
  };
})();
