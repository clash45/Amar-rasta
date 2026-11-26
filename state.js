/* state.js - creates a fresh game state. G.S is always the current state. */
(function () {
  G.reset = function () {
    G.S = {
      state: 'title',            // title | play | pause | dying | over
      time: 0, t: 0,             // time since load / seconds of driving this run
      dist: 0, score: 0,
      speed: 220,
      px: 85, vx: 0, cam: 76,    // player lateral position, steering velocity, camera lateral position
      anger: 0, crash: 0, shake: 0, ring: 0, honkCd: 0,
      cars: [], peds: [], mobs: [], texts: [],
      bld: [[], []],             // buildings: [left side, right side]
      props: [],                 // street lamps
      nextCar: 0.4, nextPed: 0.6, nextMob: 2.5,
      honks: 0, bumps: 0, wrongT: 0, near: 0,
      wrong: false, side: false, die: 0,
      memeT: 0                   // seconds until the next meme sound
    };
    G.fillWorld();
  };
})();
