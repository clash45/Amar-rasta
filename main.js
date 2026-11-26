/* main.js - starts the game and runs the loop. Loaded last. */
(function () {
  G.reset();
  G.ui.init();

  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    G.step(dt);
    G.render();
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
})();
