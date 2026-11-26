/* audio.js - horn, crash, and the Bengali meme sound that plays every minute.
   Browsers only allow sound after a tap/click, so G.audio.unlock() is called from input + Start button. */
(function () {
  const C = G.C;
  let AC = null;            // Web Audio context (horn + crash are generated, no files needed)
  let meme = null;          // meme sound (assets/meme_sound.mp3)
  let hornEl = null;        // optional custom horn (assets/horn.mp3)
  let hornReady = false;
  let memePaused = false;

  function loadMedia() {
    if (!meme) {
      meme = new Audio(C.MEME_FILE);
      meme.preload = 'auto';
      meme.volume = C.MEME_VOLUME;
    }
    if (!hornEl) {
      hornEl = new Audio();
      hornEl.preload = 'auto';
      hornEl.addEventListener('canplaythrough', () => { hornReady = true; });
      hornEl.addEventListener('error', () => { hornReady = false; });
      hornEl.src = C.HORN_FILE;
    }
  }

  function unlock() {
    try {
      if (!AC) AC = new (window.AudioContext || window.webkitAudioContext)();
      if (AC.state === 'suspended') AC.resume();
    } catch (e) {}
    loadMedia();
  }

  /* one horn beep: two detuned voices through a low-pass filter */
  function pulse(t, dur, f) {
    const g = AC.createGain(), lp = AC.createBiquadFilter();
    lp.type = 'lowpass';
    lp.frequency.value = 2600;
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(0.09, t + 0.015);
    g.gain.setValueAtTime(0.09, t + dur - 0.03);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    [f, f * 1.5].forEach((fr, i) => {
      const o = AC.createOscillator();
      o.type = i ? 'square' : 'sawtooth';
      o.frequency.value = fr;
      o.connect(lp);
      o.start(t);
      o.stop(t + dur + 0.02);
    });
    lp.connect(g);
    g.connect(AC.destination);
  }

  function honk() {
    if (hornReady) {
      try {
        const a = hornEl.cloneNode();
        a.volume = 0.8;
        a.play();
        return;
      } catch (e) {}
    }
    if (!AC) return;
    const t = AC.currentTime;
    pulse(t, 0.11, 640);          // "pee"
    pulse(t + 0.14, 0.17, 820);   // "peep"
  }

  function crash() {
    if (!AC) return;
    const n = (AC.sampleRate * 0.28) | 0;
    const buf = AC.createBuffer(1, n, AC.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < n; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / n);
    const src = AC.createBufferSource(), g = AC.createGain();
    src.buffer = buf;
    g.gain.value = 0.28;
    src.connect(g);
    g.connect(AC.destination);
    src.start();
    // low thump
    const o = AC.createOscillator(), og = AC.createGain(), t = AC.currentTime;
    o.frequency.setValueAtTime(140, t);
    o.frequency.exponentialRampToValueAtTime(50, t + 0.2);
    og.gain.setValueAtTime(0.3, t);
    og.gain.exponentialRampToValueAtTime(0.0001, t + 0.22);
    o.connect(og);
    og.connect(AC.destination);
    o.start(t);
    o.stop(t + 0.25);
  }

  /* ----- meme sound ----- */
  function playMeme() {
    loadMedia();
    try {
      meme.currentTime = 0;
      const p = meme.play();
      if (p && p.catch) p.catch(() => {});
    } catch (e) {}
  }
  function pauseMeme() {
    if (meme && !meme.paused) { meme.pause(); memePaused = true; }
  }
  function resumeMeme() {
    if (meme && memePaused) {
      memePaused = false;
      const p = meme.play();
      if (p && p.catch) p.catch(() => {});
    }
  }
  function stopMeme() {
    memePaused = false;
    if (meme) { meme.pause(); meme.currentTime = 0; }
  }

  G.audio = { unlock, honk, crash, playMeme, pauseMeme, resumeMeme, stopMeme };
})();
