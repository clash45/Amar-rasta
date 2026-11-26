/* config.js - every tunable number lives here. */
window.G = window.G || {};

G.C = {
  /* canvas */
  W: 480, H: 800,

  /* third-person camera (pseudo-3D, behind the rickshaw looking forward) */
  HORIZON: 290,   // screen y of the horizon
  F: 138,         // focal length: screen scale = F / distance
  CAMH: 300,      // camera height above the road
  PZ: 120,        // distance from camera to the player rickshaw
  NEAR: 45,       // nearest distance that is drawn
  VIEW: 1500,     // how far ahead things spawn (fade in with haze)
  ZFAR: 9000,     // how far the road surface is drawn

  /* road layout (lateral units: 0 = centre line, left is negative) */
  ROAD_HALF: 170,
  SIDE_HALF: 240,
  LANES: [-127.5, -42.5, 42.5, 127.5],   // 0,1 = oncoming | 2,3 = same direction
  PX_LIMIT: 196,

  /* driving */
  CRUISE: 340, MAXSPEED: 680, MINSPEED: 110,
  CRASH_STUN: 0.45,
  CAM_FOLLOW: 0.9,

  /* spawning */
  CAR_INT: [0.4, 0.95],
  PED_INT: [0.5, 1.1],
  MOB_RUN: [125, 165],
  MOB_LATERAL: 120,

  TYPES: {
    car:   { w: 40, len: 72 },
    bus:   { w: 52, len: 130 },
    bike:  { w: 20, len: 42 },
    auto:  { w: 34, len: 56 },
    truck: { w: 50, len: 100 }
  },
  SPEEDS: {
    car: [190, 260], auto: [150, 220], bike: [230, 300], bus: [140, 190], truck: [130, 180]
  },
  CARCOLS: ['#c0392b', '#2980b9', '#f1c40f', '#8e44ad', '#16a085', '#e67e22', '#ecf0f1', '#34495e', '#d35400'],

  /* sound */
  MEME_FILE: 'assets/meme_sound.mp3',
  MEME_INTERVAL: 60,      // seconds of driving between each meme sound
  MEME_VOLUME: 0.9,
  HORN_FILE: 'assets/horn.mp3'   // optional: drop your own horn.mp3 here and it is used instead of the built-in beep
};
