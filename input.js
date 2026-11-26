/* input.js - keyboard + on-screen touch buttons. Sets G.keys.* to true/false. */
(function () {
  const keys = { left: false, right: false, up: false, down: false, honk: false };
  G.keys = keys;

  const MAP = {
    ArrowLeft: 'left', a: 'left', A: 'left',
    ArrowRight: 'right', d: 'right', D: 'right',
    ArrowUp: 'up', w: 'up', W: 'up',
    ArrowDown: 'down', s: 'down', S: 'down',
    ' ': 'honk', h: 'honk', H: 'honk'
  };

  addEventListener('keydown', e => {
    const k = MAP[e.key];
    if (k) { keys[k] = true; e.preventDefault(); G.audio.unlock(); }
    if (e.key === 'p' || e.key === 'P' || e.key === 'Escape') G.ui.togglePause();
  });
  addEventListener('keyup', e => {
    const k = MAP[e.key];
    if (k) { keys[k] = false; e.preventDefault(); }
  });
  addEventListener('contextmenu', e => e.preventDefault());

  document.querySelectorAll('#pad button').forEach(b => {
    const k = b.dataset.k;
    b.addEventListener('pointerdown', e => { e.preventDefault(); G.audio.unlock(); keys[k] = true; });
    ['pointerup', 'pointercancel', 'pointerleave'].forEach(t =>
      b.addEventListener(t, () => { keys[k] = false; }));
  });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden && G.S.state === 'play') G.ui.togglePause();
  });
})();
