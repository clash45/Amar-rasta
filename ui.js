/* ui.js - title screen, pause, game-over newspaper, and fitting the game to the window. */
(function () {
  const C = G.C, pick = G.pick;
  const frame = document.getElementById('frame');
  const titleEl = document.getElementById('title');
  const overEl = document.getElementById('over');

  function start() {
    G.audio.unlock();
    G.audio.stopMeme();
    G.reset();
    G.S.state = 'play';
    titleEl.classList.remove('show');
    overEl.classList.remove('show');
  }

  function togglePause() {
    const S = G.S;
    if (S.state === 'play') { S.state = 'pause'; G.audio.pauseMeme(); }
    else if (S.state === 'pause') { S.state = 'play'; G.audio.resumeMeme(); }
  }

  /* funny headline for the game-over newspaper, chosen by how you drove */
  function headline() {
    const S = G.S, m = Math.floor(S.dist / 40), sp = [];
    if (S.wrongT >= 6) sp.push(['Driver goes wrong way for ' + Math.round(S.wrongT) + ' seconds, meets entire neighbourhood', 'Eyewitnesses insist the lane arrows were “very clearly painted”.']);
    if (S.bumps >= 3) sp.push([S.bumps + ' bumps, zero apologies: auto driver gets a public lecture', 'Tea-stall experts demand a driving licence for everyone, including the rickshaw.']);
    if (S.honks >= 20) sp.push(['Horn used ' + S.honks + ' times; crowd responds with something louder', 'Residents report the first quiet moment on this road in years.']);
    if (S.near >= 5) sp.push([S.near + ' near misses later, luck finally takes the day off', '“He was inches from everyone,” says a witness.']);
    const def = [
      ['Auto rampage ends after ' + m + ' metres', 'Traffic police arrive 45 minutes later and ask what happened.'],
      ['Rickshaw driver learns road rules the hard way', 'No one was seriously hurt, except the driver’s pride.']
    ];
    return pick(sp.length ? sp : def);
  }

  function showOver() {
    const S = G.S;
    const sc = Math.floor(S.score), isBest = sc > G.best;
    if (isBest) G.saveBest(sc);
    const hl = headline();
    const date = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    overEl.innerHTML =
      '<div class="paper"><div class="mast">দৈনিক জ্যাম<small>THE DAILY JAM</small></div>' +
      '<div class="date">' + date + ' · Price: 5 Taka</div>' +
      '<h2>' + hl[0] + '</h2><p class="sub">' + hl[1] + '</p>' +
      '<div class="stats">' +
        '<div><b>' + sc + '</b>Score</div>' +
        '<div><b>' + Math.floor(S.dist / 40) + '</b>Metres</div>' +
        '<div><b>' + S.bumps + '</b>Bumps</div>' +
        '<div><b>' + S.honks + '</b>Honks</div>' +
        '<div><b>' + Math.round(S.wrongT) + 's</b>Wrong way</div>' +
        '<div><b>' + S.near + '</b>Near misses</div>' +
      '</div>' +
      '<p class="best">Best: ' + G.best + (isBest ? ' — NEW RECORD!' : '') + '</p>' +
      '<button class="go" id="again">DRIVE AGAIN</button></div>';
    overEl.classList.add('show');
    document.getElementById('again').addEventListener('click', e => { e.currentTarget.blur(); start(); });
  }

  /* scale the 480x800 game to whatever space the window has */
  function resize() {
    const r = document.getElementById('stage').getBoundingClientRect();
    const s = Math.min(r.width / C.W, r.height / C.H);
    frame.style.width = (C.W * s) + 'px';
    frame.style.height = (C.H * s) + 'px';
    frame.style.fontSize = (16 * Math.max(s, 0.62)) + 'px';
  }

  function init() {
    document.getElementById('startBtn').addEventListener('click', e => { e.currentTarget.blur(); start(); });
    addEventListener('resize', resize);
    resize();
    setTimeout(resize, 200);
  }

  G.ui = { start, togglePause, showOver, resize, init };
})();
