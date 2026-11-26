/* utils.js - tiny helpers shared by every module. */
(function () {
  G.TAU = Math.PI * 2;
  G.rnd = (a, b) => a + Math.random() * (b - a);
  G.pick = arr => arr[(Math.random() * arr.length) | 0];
  G.clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  /* best score is kept in the browser */
  G.best = 0;
  try { G.best = Number(localStorage.getItem('myroad_best')) || 0; } catch (e) {}
  G.saveBest = function (v) {
    G.best = v;
    try { localStorage.setItem('myroad_best', String(v)); } catch (e) {}
  };
})();
