'use strict';
// Trilha chiptune caipira (viola em pares, baixo e melodia) e efeitos sonoros via WebAudio.
(function (SE) {
  const A = (SE.audio = { ctx: null, music: true, sfxOn: true, started: false });

  A.init = function () {
    if (A.ctx) { if (A.ctx.state === 'suspended') A.ctx.resume(); return; }
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    A.ctx = new AC();
    A.master = A.ctx.createGain(); A.master.gain.value = 0.6; A.master.connect(A.ctx.destination);
    A.mus = A.ctx.createGain(); A.mus.gain.value = 0.32; A.mus.connect(A.master);
    A.sfx = A.ctx.createGain(); A.sfx.gain.value = 0.5; A.sfx.connect(A.master);
    const len = A.ctx.sampleRate * 0.5;
    A.noise = A.ctx.createBuffer(1, len, A.ctx.sampleRate);
    const d = A.noise.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    try { A.music = localStorage.getItem('sitioEsperanca.music') !== '0'; } catch (e) { /* sem storage */ }
    A.mus.gain.value = A.music ? 0.32 : 0;
    A.startMusic();
  };

  const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);

  function tone(type, freq, t, dur, vol, dest, detune) {
    const o = A.ctx.createOscillator(), g = A.ctx.createGain();
    o.type = type; o.frequency.value = freq; if (detune) o.detune.value = detune;
    g.gain.setValueAtTime(0, t);
    g.gain.linearRampToValueAtTime(vol, t + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0008, t + dur);
    o.connect(g); g.connect(dest || A.sfx);
    o.start(t); o.stop(t + dur + 0.02);
  }
  function noise(t, dur, vol, freq, q) {
    const s = A.ctx.createBufferSource(), f = A.ctx.createBiquadFilter(), g = A.ctx.createGain();
    s.buffer = A.noise; f.type = 'bandpass'; f.frequency.value = freq || 1200; f.Q.value = q || 1;
    g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
    s.connect(f); f.connect(g); g.connect(A.sfx); s.start(t); s.stop(t + dur);
  }

  // ---------------------------------------------------------------- Música
  // Toada em Sol maior: G C D G | Em C D G
  const CH = {
    G: { root: 43, arp: [55, 59, 62, 67] }, C: { root: 48, arp: [55, 60, 64, 67] },
    D: { root: 50, arp: [57, 62, 66, 69] }, Em: { root: 40, arp: [55, 59, 64, 67] },
  };
  const PROG = ['G', 'C', 'D', 'G', 'Em', 'C', 'D', 'G'];
  const _ = 0;
  const MEL_A = [
    71, _, 74, _, 76, 74, 71, _,
    72, _, 76, _, 79, 76, 72, _,
    74, _, 78, _, 81, 78, 74, 72,
    71, _, _, _, 67, 69, 71, _,
    71, _, 74, _, 76, _, 74, 71,
    72, _, 71, _, 69, _, 67, 69,
    71, _, 69, _, 66, _, 69, _,
    67, _, _, _, _, _, -1, -1,
  ];
  const MEL_B = [
    79, _, 76, _, 74, _, 71, _,
    76, _, 74, _, 72, _, 76, _,
    74, _, 76, 78, 79, _, 78, 76,
    74, _, _, _, 71, _, 74, _,
    76, _, 79, _, 76, 74, 71, _,
    72, _, 74, _, 76, _, 72, _,
    74, _, 72, _, 71, _, 69, _,
    67, _, _, _, -1, -1, -1, -1,
  ];
  let step = 0, nextT = 0, timer = null;
  A.tempo = 1;
  A.startMusic = function () {
    if (!A.ctx || timer) return;
    nextT = A.ctx.currentTime + 0.1;
    timer = setInterval(schedule, 50);
  };
  function schedule() {
    if (!A.ctx) return;
    const eighth = 0.31 / A.tempo;
    while (nextT < A.ctx.currentTime + 0.25) {
      if (A.music) playStep(step, nextT, eighth);
      step = (step + 1) % 128;
      nextT += eighth;
    }
  }
  function playStep(s, t, e) {
    const half = Math.floor(s / 64);
    const i = s % 64;
    const bar = Math.floor(i / 8), beat = i % 8;
    const ch = CH[PROG[bar]];
    const night = SE.state && (SE.state.time >= 19 * 60 || SE.state.time < 5 * 60);
    const vol = night ? 0.5 : 1;
    if (beat === 0 || beat === 4) tone('triangle', mtof(beat === 0 ? ch.root : ch.root + 7), t, e * 3.5, 0.5 * vol, A.mus);
    // viola caipira: cordas em pares (uma levemente desafinada da outra)
    const n = ch.arp[[0, 1, 2, 1, 3, 1, 2, 1][beat]];
    tone('square', mtof(n), t, e * 1.6, 0.05 * vol, A.mus);
    tone('sawtooth', mtof(n + 12), t + 0.004, e * 1.1, 0.018 * vol, A.mus, 9);
    const mel = (half === 0 ? MEL_A : MEL_B)[i];
    if (mel > 0) {
      let len = 1; while (i + len < 64 && (half === 0 ? MEL_A : MEL_B)[i + len] === 0) len++;
      tone('triangle', mtof(mel), t, e * len * 0.95, 0.16 * vol, A.mus);
      tone('square', mtof(mel), t, e * Math.min(len, 2) * 0.6, 0.025 * vol, A.mus, 6);
    }
    if (beat % 2 === 1 && !night) noise(t, 0.03, 0.04, 6000, 2);
  }
  A.toggleMusic = function () {
    A.music = !A.music;
    if (A.mus) A.mus.gain.value = A.music ? 0.32 : 0;
    try { localStorage.setItem('sitioEsperanca.music', A.music ? '1' : '0'); } catch (e) { /* sem storage */ }
    return A.music;
  };

  // ---------------------------------------------------------------- Efeitos
  A.play = function (name) {
    if (!A.ctx || !A.sfxOn) return;
    const t = A.ctx.currentTime;
    switch (name) {
      case 'hoe': noise(t, 0.12, 0.5, 400, 1.5); tone('square', 110, t, 0.08, 0.08); break;
      case 'cut': noise(t, 0.08, 0.4, 3000, 1); noise(t + 0.05, 0.06, 0.3, 2000, 1); break;
      case 'hit': tone('square', 160, t, 0.1, 0.15); noise(t, 0.1, 0.4, 900, 2); break;
      case 'water': noise(t, 0.35, 0.25, 1800, 0.8); noise(t + 0.08, 0.25, 0.2, 2600, 0.8); break;
      case 'plant': tone('triangle', 330, t, 0.08, 0.2); tone('triangle', 440, t + 0.06, 0.1, 0.2); break;
      case 'harvest': [523, 659, 784].forEach((f, i) => tone('square', f, t + i * 0.06, 0.12, 0.09)); break;
      case 'coin': tone('square', 988, t, 0.08, 0.1); tone('square', 1319, t + 0.07, 0.2, 0.1); break;
      case 'select': tone('square', 660, t, 0.05, 0.06); break;
      case 'move': tone('square', 440, t, 0.03, 0.04); break;
      case 'back': tone('square', 330, t, 0.06, 0.06); break;
      case 'error': tone('square', 150, t, 0.15, 0.1); tone('square', 140, t + 0.08, 0.15, 0.1); break;
      case 'talk': tone('triangle', 520 + Math.random() * 120, t, 0.04, 0.07); break;
      case 'love': [784, 988, 1175].forEach((f, i) => tone('triangle', f, t + i * 0.07, 0.15, 0.12)); break;
      case 'moo': tone('sawtooth', 110, t, 0.5, 0.08); tone('sawtooth', 95, t + 0.2, 0.4, 0.06); break;
      case 'cluck': tone('square', 900, t, 0.04, 0.05); tone('square', 1100, t + 0.06, 0.04, 0.05); break;
      case 'sleep': [659, 523, 440, 392].forEach((f, i) => tone('triangle', f, t + i * 0.18, 0.3, 0.14)); break;
      case 'door': noise(t, 0.15, 0.3, 300, 1); break;
      case 'goal': [523, 659, 784, 1047].forEach((f, i) => tone('square', f, t + i * 0.08, 0.18, 0.08)); break;
      case 'cast': noise(t, 0.25, 0.25, 2400, 0.6); tone('triangle', 880, t, 0.2, 0.05); break;
      case 'splash': noise(t, 0.3, 0.35, 900, 0.7); break;
      case 'bite': tone('square', 1320, t, 0.06, 0.12); tone('square', 1320, t + 0.1, 0.06, 0.12); break;
      case 'reel': tone('square', 700 + Math.random() * 60, t, 0.03, 0.03); break;
      case 'stone': noise(t, 0.12, 0.5, 600, 2); tone('square', 220, t, 0.06, 0.08); break;
      case 'break': noise(t, 0.25, 0.5, 500, 1); noise(t + 0.05, 0.2, 0.4, 1500, 1); break;
      case 'tree': noise(t, 0.6, 0.5, 300, 0.8); tone('sawtooth', 80, t, 0.5, 0.08); break;
      case 'swing': noise(t, 0.08, 0.3, 4000, 3); break;
      case 'slime': tone('triangle', 200, t, 0.1, 0.12); tone('triangle', 140, t + 0.05, 0.12, 0.1); break;
      case 'hurt': tone('square', 220, t, 0.08, 0.14); tone('square', 110, t + 0.06, 0.15, 0.14); break;
      case 'boom': noise(t, 0.8, 0.8, 120, 0.6); tone('sawtooth', 55, t, 0.6, 0.2); break;
      case 'ladder': [392, 523, 659].forEach((f, i) => tone('triangle', f, t + i * 0.05, 0.1, 0.1)); break;
      case 'charge': tone('square', 440 + Math.random() * 10, t, 0.05, 0.05); break;
      case 'level': [523, 659, 784, 1047, 1319].forEach((f, i) => tone('triangle', f, t + i * 0.1, 0.25, 0.12)); break;
      case 'mail': tone('triangle', 988, t, 0.1, 0.1); tone('triangle', 784, t + 0.1, 0.15, 0.1); break;
    }
  };
})(window.SE);
