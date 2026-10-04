'use strict';
// Pixel art 16 bits gerada por código: tiles, objetos, plantas, construções, gente, bichos e ícones.
(function (SE) {
  const T = SE.T;
  const R = (c, x, y, w, h, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, w | 0, h | 0); };
  const P = (c, x, y, col) => { c.fillStyle = col; c.fillRect(x | 0, y | 0, 1, 1); };
  const disc = (c, cx, cy, r, col) => {
    c.fillStyle = col;
    for (let dy = -r; dy <= r; dy++) {
      const hw = Math.floor(Math.sqrt(r * r - dy * dy + r * 0.6));
      c.fillRect(Math.round(cx - hw), Math.round(cy + dy), hw * 2 + 1, 1);
    }
  };
  const ell = (c, cx, cy, rx, ry, col) => {
    c.fillStyle = col;
    for (let dy = -ry; dy <= ry; dy++) {
      const hw = Math.round(rx * Math.sqrt(Math.max(0, 1 - (dy * dy) / (ry * ry + 0.01))));
      c.fillRect(Math.round(cx - hw), Math.round(cy + dy), hw * 2 + 1, 1);
    }
  };
  SE.px = { R, P, disc, ell };

  // ---------------------------------------------------------------- Paletas por época
  SE.PAL = {
    aguas: {
      grass: '#57b04a', grassD: '#3f8f3a', grassL: '#78c95e', flowers: ['#f4e04d', '#f28ab2', '#ffffff'],
      leaf: '#2f8a3a', leafD: '#1f6a2c', leafL: '#56b04a', mato: '#3f9a3a', matoD: '#2a7a2c', matoL: '#7ccf5a',
      sky: ['#5fa6dc', '#a9d4ee'], mount: ['#3f7a5c', '#4f9068', '#66a873'], ipe: '#3f9a3a',
    },
    seca: {
      grass: '#b4ad5c', grassD: '#968f45', grassL: '#cfc777', flowers: ['#f2b84b', '#e9e4c9', '#d77a3a'],
      leaf: '#6f8a3a', leafD: '#52692a', leafL: '#93a94e', mato: '#a59a4a', matoD: '#857a36', matoL: '#d2c573',
      sky: ['#2f8ee6', '#8ccaf5'], mount: ['#7a7450', '#948a5c', '#ad9f68'], ipe: '#f2c230',
    },
  };

  // ---------------------------------------------------------------- Tiles
  SE.TILES = {};
  SE.buildTiles = function (ep) {
    if (SE.TILES[ep]) return SE.TILES[ep];
    const pal = SE.PAL[ep];
    const t = {};
    const mk = (fn) => { const [cv, c] = SE.canvas(T, T); fn(c); return cv; };
    t.grass = [0, 1, 2, 3, 4, 5].map((v) => mk((c) => {
      R(c, 0, 0, T, T, pal.grass);
      for (let i = 0; i < 16; i++) {
        const x = Math.floor(SE.hash(i, v, 11) * 16), y = Math.floor(SE.hash(v, i, 12) * 16);
        P(c, x, y, SE.hash(i, i + 3, v) > 0.5 ? pal.grassD : pal.grassL);
      }
      for (let i = 0; i < 2; i++) {
        const x = 2 + Math.floor(SE.hash(i, v, 21) * 11), y = 3 + Math.floor(SE.hash(v, i, 22) * 11);
        P(c, x, y, pal.grassD); P(c, x + 2, y, pal.grassD); P(c, x + 1, y + 1, pal.grassD); P(c, x + 1, y - 1, pal.grassL);
      }
      if (v >= 4) {
        for (let i = 0; i < 3; i++) {
          const x = 2 + Math.floor(SE.hash(i, v, 31) * 12), y = 2 + Math.floor(SE.hash(v, i, 32) * 12);
          const col = pal.flowers[(i + v) % 3];
          P(c, x, y - 1, col); P(c, x - 1, y, col); P(c, x + 1, y, col); P(c, x, y + 1, col); P(c, x, y, '#f7d02c');
        }
      }
    }));
    t.path = [0, 1].map((v) => mk((c) => {
      R(c, 0, 0, T, T, '#c9a46c');
      for (let i = 0; i < 18; i++) {
        const x = Math.floor(SE.hash(i, v, 41) * 16), y = Math.floor(SE.hash(v, i, 42) * 16);
        P(c, x, y, SE.hash(i, v, 43) > 0.5 ? '#b08a55' : '#dcbb84');
      }
      for (let i = 0; i < 2; i++) {
        const x = 1 + Math.floor(SE.hash(i, v, 44) * 13), y = 1 + Math.floor(SE.hash(v, i, 45) * 13);
        R(c, x, y, 2, 1, '#9a8a78'); P(c, x, y - 1, '#d8d0c4');
      }
    }));
    t.water = [0, 1, 2].map((f) => mk((c) => {
      R(c, 0, 0, T, T, '#3a78c9');
      for (let i = 0; i < 3; i++) {
        const y = (i * 5 + f * 2) % 16, x = (i * 7 + f * 3) % 12;
        R(c, x, y, 4, 1, '#6aa3e3'); P(c, x + 4, y + 1, '#2f63ab');
      }
      P(c, (f * 5 + 9) % 16, (f * 3 + 2) % 16, '#cfe6fb');
    }));
    t.tilled = mk((c) => {
      R(c, 0, 0, T, T, '#7a4e2c');
      for (let y = 1; y < 16; y += 4) { R(c, 1, y, 14, 1, '#5e3b20'); R(c, 1, y + 1, 14, 1, '#8d5e37'); }
      R(c, 0, 0, T, 1, '#8d5e37'); R(c, 0, 15, T, 1, '#5e3b20');
    });
    t.wet = mk((c) => {
      R(c, 0, 0, T, T, '#4f321d');
      for (let y = 1; y < 16; y += 4) { R(c, 1, y, 14, 1, '#3a2414'); R(c, 1, y + 1, 14, 1, '#61412a'); }
      R(c, 0, 0, T, 1, '#61412a'); R(c, 0, 15, T, 1, '#3a2414');
    });
    t.cobble = [0, 1].map((v) => mk((c) => {
      R(c, 0, 0, T, T, '#8b847c');
      for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) {
        const ox = (yy % 2) * 2;
        const col = SE.hash(xx + v * 7, yy, 51) > 0.5 ? '#b3aca2' : '#a39c92';
        R(c, xx * 4 + ox, yy * 4, 3, 3, col); P(c, xx * 4 + ox, yy * 4, '#cfc8be');
      }
    }));
    t.rail = mk((c) => {
      R(c, 0, 0, T, T, '#8e877e');
      for (let i = 0; i < 10; i++) P(c, Math.floor(SE.hash(i, 1, 61) * 16), Math.floor(SE.hash(1, i, 62) * 16), '#6f685f');
      for (let x = 1; x < 16; x += 5) R(c, x, 2, 3, 12, '#6b4a2a');
      R(c, 0, 4, 16, 2, '#b8bcc4'); R(c, 0, 6, 16, 1, '#5a5e66');
      R(c, 0, 10, 16, 2, '#b8bcc4'); R(c, 0, 12, 16, 1, '#5a5e66');
    });
    t.floor = mk((c) => {
      R(c, 0, 0, T, T, '#a0703f');
      for (let y = 0; y < 16; y += 4) { R(c, 0, y, 16, 1, '#7d5530'); }
      P(c, 5, 2, '#7d5530'); P(c, 11, 6, '#7d5530'); P(c, 3, 10, '#7d5530'); P(c, 13, 14, '#7d5530');
    });
    SE.TILES[ep] = t;
    return t;
  };

  // ---------------------------------------------------------------- Céu e serra (panorama)
  SE.skyColors = function (ep, min) {
    const pal = SE.PAL[ep];
    const h = (min / 60) % 24;
    let top = pal.sky[0], bot = pal.sky[1];
    if (h >= 17 && h < 19) { const f = (h - 17) / 2; top = mix(top, '#5a4a8a', f); bot = mix(bot, '#f29a5a', f); }
    else if (h >= 19 || h < 5) { top = '#0e1838'; bot = '#2a3462'; }
    else if (h >= 5 && h < 6.5) { const f = (h - 5) / 1.5; top = mix('#0e1838', top, f); bot = mix('#f2a46a', bot, f); }
    return [top, bot];
  };
  function mix(a, b, f) {
    const pa = parseInt(a.slice(1), 16), pb = parseInt(b.slice(1), 16);
    const r = Math.round(SE.lerp(pa >> 16, pb >> 16, f)), g = Math.round(SE.lerp((pa >> 8) & 255, (pb >> 8) & 255, f)), bb = Math.round(SE.lerp(pa & 255, pb & 255, f));
    return '#' + ((1 << 24) | (r << 16) | (g << 8) | bb).toString(16).slice(1);
  }
  SE.mix = mix;

  SE.drawPanorama = function (c, x0, y0, w, h, ep, min, scroll, opts) {
    opts = opts || {};
    const pal = SE.PAL[ep];
    const [top, bot] = SE.skyColors(ep, min);
    const bands = 8;
    for (let i = 0; i < bands; i++) R(c, x0, y0 + Math.floor((h * i) / bands), w, Math.ceil(h / bands) + 1, mix(top, bot, i / (bands - 1)));
    const hr = (min / 60) % 24;
    const night = hr >= 19 || hr < 5;
    if (night) {
      for (let i = 0; i < 40; i++) {
        const sx = x0 + ((SE.hash(i, 3, 71) * w + scroll * 0.05) % w), sy = y0 + SE.hash(3, i, 72) * h * 0.6;
        P(c, sx, sy, SE.hash(i, i, 73) > 0.7 ? '#ffffff' : '#9aa8d8');
      }
      disc(c, x0 + w * 0.8, y0 + h * 0.18, Math.max(3, h * 0.06), '#f4f0d0');
    } else {
      const f = SE.clamp((hr - 6) / 13, 0, 1);
      const sx = x0 + w * (0.15 + f * 0.7), sy = y0 + h * (0.45 - Math.sin(f * Math.PI) * 0.35);
      disc(c, sx, sy, Math.max(4, h * 0.08), '#fff3b0');
      disc(c, sx, sy, Math.max(3, h * 0.06), '#ffe066');
      const cl = ep === 'aguas' ? 6 : 2;
      for (let i = 0; i < cl; i++) {
        const cx = x0 + ((SE.hash(i, 9, 74) * (w + 80) + (opts.t || 0) * 3 * (1 + i * 0.2) - scroll * 0.1) % (w + 80)) - 40;
        const cy = y0 + h * (0.1 + SE.hash(9, i, 75) * 0.3);
        const col = ep === 'aguas' ? '#eef4f8' : '#ffffff';
        ell(c, cx, cy, 10 + i % 3 * 3, 3, col); ell(c, cx + 6, cy - 2, 6, 3, col);
        R(c, cx - 10, cy + 2, 22, 1, '#d4e2ec');
      }
    }
    // três camadas de serra
    const layers = [
      { col: pal.mount[0], base: 0.62, a: 0.22, f: 0.011, p: 0.2, k: 0.15 },
      { col: pal.mount[1], base: 0.76, a: 0.14, f: 0.019, p: 1.7, k: 0.35 },
      { col: pal.mount[2], base: 0.9, a: 0.09, f: 0.031, p: 3.1, k: 0.6 },
    ];
    layers.forEach((L, li) => {
      const darkN = night ? -0.55 : 0;
      const col = darkN ? SE.shade(L.col, darkN) : L.col;
      for (let x = 0; x < w; x++) {
        const wx = x + scroll * L.k;
        const yy = h * L.base - (Math.sin(wx * L.f + L.p) * 0.6 + Math.sin(wx * L.f * 2.3 + L.p * 2) * 0.4) * h * L.a;
        R(c, x0 + x, y0 + yy, 1, h - yy + 1, col);
        if (li === 1 && !night && ((wx | 0) % 5 === 0) && yy < h * 0.85) {
          for (let r = 4; r < h - yy; r += 4) P(c, x0 + x, y0 + yy + r, SE.shade(col, -0.25));
        }
      }
    });
    if (opts.chapel) {
      const cx = x0 + ((w * 0.3 - scroll * 0.35) % w + w) % w, cy = y0 + h * 0.66;
      R(c, cx, cy, 6, 5, night ? '#8a8a9a' : '#f4f4ee'); R(c, cx + 2, cy - 4, 2, 4, night ? '#8a8a9a' : '#f4f4ee');
      R(c, cx - 1, cy - 1, 8, 1, '#b5502f'); P(c, cx + 2, cy - 6, '#5a3a1e'); P(c, cx + 3, cy - 6, '#5a3a1e');
    }
  };

  // ---------------------------------------------------------------- Objetos do mapa
  const OBJ_CACHE = {};
  SE.objSprite = function (code, ep, v) {
    const k = code + ep + (v || 0);
    if (OBJ_CACHE[k]) return OBJ_CACHE[k];
    const pal = SE.PAL[ep];
    let cv, c;
    if (code === 'm') {
      [cv, c] = SE.canvas(16, 16);
      const n = 4 + (v % 2);
      for (let i = 0; i < n; i++) {
        const bx = 2 + Math.floor(SE.hash(i, v, 81) * 11), hh = 6 + Math.floor(SE.hash(v, i, 82) * 6);
        for (let b = -1; b <= 1; b++) {
          const col = b === 0 ? pal.matoL : b < 0 ? pal.matoD : pal.mato;
          for (let y = 0; y < hh - Math.abs(b) * 2; y++) P(c, bx + b + (b * y) / 4, 15 - y, col);
        }
      }
      R(c, 2, 14, 12, 2, pal.matoD);
    } else if (code === 'p') {
      [cv, c] = SE.canvas(16, 16);
      ell(c, 8, 10, 6, 4, '#6f6a66'); ell(c, 8, 9, 5, 3, '#9a948e'); R(c, 5, 7, 3, 1, '#c4beb6'); P(c, 10, 11, '#5a5652');
      if (v % 2) { ell(c, 12, 12, 2, 1, '#8a847e'); }
    } else if (code === 'k') {
      [cv, c] = SE.canvas(16, 16);
      R(c, 4, 6, 8, 8, '#6b4a2a'); R(c, 4, 6, 2, 8, '#5a3c20'); ell(c, 8, 6, 4, 2, '#c49a6a'); ell(c, 8, 6, 2, 1, '#a07848');
      R(c, 2, 13, 3, 2, '#5a3c20'); R(c, 11, 13, 3, 2, '#5a3c20');
    } else if ('TPJAI'.includes(code)) {
      [cv, c] = SE.canvas(32, 44);
      const leafCol = code === 'I' ? pal.ipe : code === 'J' ? SE.shade(pal.leaf, -0.1) : pal.leaf;
      R(c, 13, 26, 6, 18, '#6b4a2a'); R(c, 13, 26, 2, 18, '#563a20'); R(c, 11, 41, 10, 3, '#563a20');
      ell(c, 16, 41, 9, 2, 'rgba(0,0,0,0.18)');
      const blobs = [[16, 14, 11], [9, 20, 8], [23, 20, 8], [16, 24, 8], [12, 10, 6], [21, 9, 6]];
      blobs.forEach(([x, y, r]) => disc(c, x, y, r, SE.shade(leafCol, -0.25)));
      blobs.forEach(([x, y, r]) => disc(c, x - 1, y - 1, r - 2, leafCol));
      for (let i = 0; i < 14; i++) P(c, 6 + SE.hash(i, v, 91) * 20, 4 + SE.hash(v, i, 92) * 22, SE.shade(leafCol, 0.25));
      if (code === 'P') for (let i = 0; i < 6; i++) disc(c, 8 + SE.hash(i, 5, 93) * 16, 10 + SE.hash(5, i, 94) * 14, 1, '#c8d04a');
      if (code === 'A') for (let i = 0; i < 5; i++) disc(c, 8 + SE.hash(i, 6, 95) * 16, 10 + SE.hash(6, i, 96) * 14, 1, '#7f9e3a');
      if (code === 'J') for (let i = 0; i < 10; i++) P(c, 13 + SE.hash(i, 7, 97) * 6, 27 + SE.hash(7, i, 98) * 12, '#2a1238');
      if (code === 'I' && ep === 'seca') for (let i = 0; i < 12; i++) P(c, 5 + SE.hash(i, 8, 99) * 22, 4 + SE.hash(8, i, 100) * 22, '#fff2a0');
    } else if (code === 'b') { // arbusto
      [cv, c] = SE.canvas(16, 16);
      disc(c, 8, 9, 6, SE.shade(pal.leaf, -0.25)); disc(c, 7, 8, 5, pal.leaf); P(c, 5, 6, pal.leafL); P(c, 9, 7, pal.leafL);
      if (ep === 'aguas') { P(c, 6, 10, '#f28ab2'); P(c, 10, 9, '#f28ab2'); }
    }
    OBJ_CACHE[k] = cv;
    return cv;
  };

  // Cerca: desenhada conforme vizinhos
  SE.drawFence = function (c, x, y, l, r, u, d) {
    R(c, x + 6, y + 3, 4, 12, '#7a5230'); R(c, x + 6, y + 3, 4, 1, '#a07848'); R(c, x + 6, y + 14, 4, 1, '#4a301a');
    if (l) { R(c, x, y + 5, 7, 2, '#a07848'); R(c, x, y + 10, 7, 2, '#a07848'); R(c, x, y + 7, 7, 1, '#5a3c20'); R(c, x, y + 12, 7, 1, '#5a3c20'); }
    if (r) { R(c, x + 9, y + 5, 7, 2, '#a07848'); R(c, x + 9, y + 10, 7, 2, '#a07848'); R(c, x + 9, y + 7, 7, 1, '#5a3c20'); R(c, x + 9, y + 12, 7, 1, '#5a3c20'); }
    if (u) R(c, x + 7, y - 2, 2, 6, '#a07848');
    if (d) R(c, x + 7, y + 14, 2, 3, '#a07848');
  };

  // ---------------------------------------------------------------- Plantações
  SE.cropStage = function (cr) {
    const d = SE.CROPS[cr.id];
    if (cr.ready) return 4;
    return Math.min(3, Math.floor((cr.age / d.days) * 4));
  };
  SE.drawCrop = function (c, x, y, cr, ep, t) {
    const d = SE.CROPS[cr.id];
    const st = SE.cropStage(cr);
    const g = '#3f9a3a', gD = '#2a7a2c', gL = '#7ccf5a';
    const sway = Math.round(Math.sin(t * 2 + x * 0.3) * 0.6);
    if (cr.dead) {
      R(c, x + 7, y + 6, 2, 9, '#8a6a3a'); R(c, x + 4, y + 8, 3, 1, '#a08050'); R(c, x + 9, y + 10, 4, 1, '#a08050'); P(c, x + 5, y + 7, '#a08050');
      return;
    }
    if (st === 0) { P(c, x + 5, y + 9, '#3a2414'); P(c, x + 10, y + 7, '#3a2414'); P(c, x + 8, y + 12, '#3a2414'); P(c, x + 8, y + 11, gL); return; }
    if (st === 1) { R(c, x + 7, y + 9, 1, 4, g); P(c, x + 6, y + 9, gL); P(c, x + 8, y + 8, gL); P(c, x + 5, y + 8, gL); P(c, x + 9, y + 7, gL); return; }
    const big = st >= 3;
    switch (cr.id) {
      case 'milho': {
        const h = st === 2 ? 9 : 15;
        R(c, x + 7 + sway, y + 15 - h, 2, h, g);
        for (let i = 0; i < 3; i++) { const yy = y + 14 - i * 4; if (yy < y + 15 - h + 1) break; R(c, x + 3 + sway, yy - 1, 4, 1, gL); R(c, x + 9 + sway, yy - 3, 4, 1, gD); }
        if (big) { R(c, x + 6 + sway, y - 1, 4, 2, '#e8d27a'); P(c, x + 8 + sway, y - 2, '#e8d27a'); }
        if (st === 4) { R(c, x + 9 + sway, y + 4, 3, 5, '#f2c94c'); R(c, x + 9 + sway, y + 4, 1, 5, '#7ab04a'); P(c, x + 10 + sway, y + 3, '#c9a24c'); }
        break;
      }
      case 'feijao': {
        const r = st === 2 ? 4 : 6;
        ell(c, x + 8, y + 15 - r, r + 1, r, gD); ell(c, x + 8, y + 14 - r, r, r - 1, g);
        P(c, x + 6, y + 15 - r * 2 + 2, gL); P(c, x + 10, y + 15 - r * 2 + 3, gL);
        if (st === 4) { R(c, x + 4, y + 9, 1, 4, '#d8b860'); R(c, x + 9, y + 8, 1, 4, '#d8b860'); R(c, x + 12, y + 10, 1, 3, '#d8b860'); }
        break;
      }
      case 'abobora': {
        ell(c, x + 8, y + 12, st === 2 ? 4 : 7, 3, gD);
        disc(c, x + 4, y + 10, 2, g); disc(c, x + 12, y + 11, 2, g); if (big) disc(c, x + 8, y + 8, 3, g);
        if (st === 3) disc(c, x + 9, y + 13, 1, '#e8b02a');
        if (st === 4) { ell(c, x + 8, y + 12, 5, 3, '#d9731e'); ell(c, x + 8, y + 11, 4, 2, '#f2902a'); R(c, x + 8, y + 9, 1, 6, '#c2621a'); R(c, x + 8, y + 7, 2, 2, '#5a7a2a'); }
        break;
      }
      case 'mandioca': {
        const h = st === 2 ? 8 : 13;
        R(c, x + 7, y + 15 - h, 1, h, '#8a5a3a');
        const leaf = (lx, ly) => { P(c, lx, ly, g); P(c, lx - 1, ly - 1, gL); P(c, lx + 1, ly - 1, gL); P(c, lx - 2, ly, gD); P(c, lx + 2, ly, gD); P(c, lx, ly - 2, gL); };
        leaf(x + 7 + sway, y + 15 - h); if (big) { leaf(x + 4 + sway, y + 6); leaf(x + 11 + sway, y + 5); }
        if (st === 4) { R(c, x + 5, y + 13, 3, 2, '#8a5a3a'); R(c, x + 9, y + 14, 3, 1, '#8a5a3a'); }
        break;
      }
      case 'cana': {
        const h = st === 2 ? 9 : st === 3 ? 14 : 17;
        [4, 7, 10].forEach((sx, i) => {
          const hh = h - i * 2 + (i === 1 ? 2 : 0);
          R(c, x + sx + sway, y + 15 - hh, 2, hh, st === 4 ? '#b8c45a' : '#7ab04a');
          for (let k = 3; k < hh; k += 4) R(c, x + sx + sway, y + 15 - k, 2, 1, '#5a8a2a');
          R(c, x + sx - 2 + sway, y + 15 - hh, 2, 1, gL); R(c, x + sx + 2 + sway, y + 14 - hh, 2, 1, gD);
        });
        break;
      }
      case 'cafe': {
        const r = st === 2 ? 4 : 6;
        R(c, x + 7, y + 11, 2, 4, '#6b4a2a');
        disc(c, x + 8, y + 13 - r, r, '#1f5a2a'); disc(c, x + 7, y + 12 - r, r - 1, '#2f7a3a');
        for (let i = 0; i < 4; i++) P(c, x + 5 + i * 2, y + 9 - r + (i % 2) * 3, '#56a04a');
        if (st === 4) for (let i = 0; i < 8; i++) P(c, x + 4 + SE.hash(i, 1, 9) * 8, y + 13 - r * 2 + SE.hash(1, i, 9) * r * 1.6, '#d9342b');
        break;
      }
      case 'maracuja': {
        R(c, x + 7, y + 1, 2, 14, '#8a6a3a'); R(c, x + 3, y + 1, 10, 1, '#8a6a3a');
        const n = st === 2 ? 3 : 6;
        for (let i = 0; i < n; i++) disc(c, x + 4 + SE.hash(i, 2, 9) * 8, y + 3 + SE.hash(2, i, 9) * 10, 1, i % 2 ? g : gD);
        if (st === 3) { P(c, x + 5, y + 4, '#ffffff'); P(c, x + 10, y + 7, '#b04aa0'); }
        if (st === 4) { disc(c, x + 4, y + 6, 1, '#e9cf3f'); disc(c, x + 11, y + 4, 1, '#e9cf3f'); disc(c, x + 10, y + 10, 1, '#e9cf3f'); }
        break;
      }
      case 'laranja': {
        R(c, x + 7, y + 7, 2, 8, '#6b4a2a');
        const r = st === 2 ? 4 : 7;
        disc(c, x + 8, y + 7 - (r - 4), r, '#1f6a2c'); disc(c, x + 7, y + 6 - (r - 4), r - 1, '#2f8a3a');
        P(c, x + 5, y + 2, '#56b04a'); P(c, x + 10, y + 4, '#56b04a');
        if (st === 3) { P(c, x + 5, y + 5, '#ffffff'); P(c, x + 11, y + 3, '#ffffff'); }
        if (st === 4) [[4, 4], [10, 2], [8, 7], [12, 6], [6, 0]].forEach(([a, b]) => { R(c, x + a, y + b, 2, 2, '#f39a1e'); });
        break;
      }
    }
  };

  // ---------------------------------------------------------------- Construções
  const B_CACHE = {};
  SE.buildingSprite = function (art, w, h, over, variant) {
    const k = art + '|' + w + 'x' + h + '|' + (variant || '');
    if (B_CACHE[k]) return B_CACHE[k];
    const W = w * T, H = h * T + over;
    const [cv, c] = SE.canvas(W, H);
    const fn = ART[art] || ART.casa;
    fn(c, W, H, over, variant || '');
    B_CACHE[k] = cv;
    return cv;
  };

  function house(c, W, H, o) {
    const roofH = o.roofH;
    const wall = o.wall, wallD = SE.shade(wall, -0.15);
    R(c, 0, roofH - 2, W, H - roofH + 2, wall);
    for (let i = 0; i < (W * (H - roofH)) / 18; i++) {
      const x = SE.hash(i, W, 201) * W, y = roofH + SE.hash(H, i, 202) * (H - roofH);
      P(c, x, y, SE.hash(i, 3, 203) > 0.5 ? wallD : SE.shade(wall, 0.1));
    }
    if (o.cracks) for (let i = 0; i < 4; i++) { const x = 6 + SE.hash(i, 1, 204) * (W - 12), y = roofH + 4 + SE.hash(1, i, 205) * 10; R(c, x, y, 1, 4, wallD); R(c, x + 1, y + 3, 1, 3, wallD); }
    R(c, 0, H - 4, W, 4, o.base || SE.shade(wall, -0.35));
    R(c, 0, roofH, 1, H - roofH, wallD); R(c, W - 1, roofH, 1, H - roofH, wallD);
    const roof = o.roof, roofD = SE.shade(roof, -0.25), roofL = SE.shade(roof, 0.15);
    for (let y = 0; y < roofH; y++) R(c, 0, y, W, 1, y % 4 === 3 ? roofD : roof);
    for (let y = 0; y < roofH; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < W; x += 5) R(c, x, y, 1, 3, roofD);
    R(c, 0, 0, W, 1, roofL); R(c, 0, roofH - 2, W, 2, SE.shade(roof, -0.45)); R(c, 0, roofH, W, 2, 'rgba(0,0,0,0.18)');
    if (o.holes) o.holes.forEach(([x, y]) => { R(c, x, y, 5, 3, '#3a2a20'); P(c, x + 5, y + 1, roofD); });
    (o.windows || []).forEach((wx) => {
      const wy = roofH + 6;
      R(c, wx - 1, wy - 1, 12, 12, '#f4f0e6'); R(c, wx, wy, 10, 10, o.boarded ? '#8a6a4a' : '#2a3a5a');
      if (!o.boarded) { R(c, wx + 4, wy, 2, 10, '#f4f0e6'); R(c, wx, wy + 4, 10, 2, '#f4f0e6'); P(c, wx + 1, wy + 1, '#5a7aa8'); }
      else { R(c, wx - 2, wy + 2, 14, 2, '#a07848'); R(c, wx - 2, wy + 6, 14, 2, '#a07848'); }
      R(c, wx - 4, wy - 1, 3, 12, o.shutter || '#2e6db5'); R(c, wx + 11, wy - 1, 3, 12, o.shutter || '#2e6db5');
    });
    if (o.door !== undefined) {
      const dw = o.doorW || 12, dh = o.doorH || 18, dx = o.door;
      R(c, dx - 1, H - dh - 1, dw + 2, dh + 1, '#f4f0e6');
      R(c, dx, H - dh, dw, dh, o.doorCol || '#7a4a2a');
      if (o.doorBoard) { R(c, dx - 2, H - dh + 4, dw + 4, 2, '#a07848'); R(c, dx - 2, H - dh + 10, dw + 4, 2, '#a07848'); }
      else { R(c, dx + dw / 2, H - dh, 1, dh, SE.shade(o.doorCol || '#7a4a2a', -0.3)); P(c, dx + dw / 2 + 2, H - dh / 2, '#e2c044'); }
    }
    if (o.sign) { R(c, o.sign[0], o.sign[1], o.sign[2], 7, '#5a3a1e'); R(c, o.sign[0] + 1, o.sign[1] + 1, o.sign[2] - 2, 5, o.signCol || '#e8d6a0');
      for (let i = 3; i < o.sign[2] - 3; i += 3) R(c, o.sign[0] + i, o.sign[1] + 3, 2, 1, '#5a3a1e'); }
  }

  const ART = {
    casa(c, W, H, over, v) {
      const ref = v === 'reformada';
      house(c, W, H, { roofH: over + 10, wall: ref ? '#f1e6cf' : '#c58a52', roof: ref ? '#c2562f' : '#9a5a3a', windows: [8, W - 22], door: Math.floor(W / 2) - 6,
        cracks: !ref, holes: ref ? null : [[12, 6], [W - 24, 14]], shutter: ref ? '#2e6db5' : '#5a7a6a' });
      if (!ref) { R(c, W - 10, H - 10, 6, 6, '#8a6a4a'); }
    },
    armazem(c, W, H, over) {
      house(c, W, H, { roofH: over + 8, wall: '#e8d8b0', roof: '#b5502f', windows: [10, W - 24], door: Math.floor(W / 2) - 8, doorW: 16, doorCol: '#2e6db5', sign: [Math.floor(W / 2) - 20, over + 10, 40], signCol: '#f2c94c' });
      R(c, 4, H - 10, 8, 6, '#a07848'); R(c, 5, H - 11, 6, 2, '#f2c94c'); R(c, W - 12, H - 10, 8, 6, '#a07848'); R(c, W - 11, H - 11, 6, 2, '#c0392b');
    },
    pensao(c, W, H, over) {
      house(c, W, H, { roofH: over + 8, wall: '#f2c2c8', roof: '#b5502f', windows: [8, W - 22], door: Math.floor(W / 2) - 6, shutter: '#2e8a5a', sign: [Math.floor(W / 2) - 14, over + 9, 28], signCol: '#ffffff' });
      R(c, 2, H - 8, 4, 4, '#c0392b'); disc(c, 4, H - 10, 2, '#3f9a3a'); R(c, W - 6, H - 8, 4, 4, '#c0392b'); disc(c, W - 4, H - 10, 2, '#3f9a3a');
    },
    bar(c, W, H, over) {
      house(c, W, H, { roofH: over + 8, wall: '#9ad0c2', roof: '#9a5a3a', windows: [W - 18], door: 8, doorCol: '#c0392b', sign: [4, over + 9, W - 8], signCol: '#e2c044' });
    },
    escola(c, W, H, over, v) {
      const open = v === 'aberta';
      house(c, W, H, { roofH: over + 8, wall: open ? '#f4e8b8' : '#c8bc98', roof: open ? '#c2562f' : '#8a5a3a', windows: [8, 26, W - 22], door: Math.floor(W / 2) + 2,
        boarded: !open, doorBoard: !open, cracks: !open, shutter: open ? '#27ae60' : '#6a7a6a', sign: [8, over + 9, 30], signCol: open ? '#ffffff' : '#a8a088' });
      R(c, W - 8, 0, 1, over + 8, '#5a5a5a');
      if (open) { R(c, W - 7, 1, 8, 5, '#27ae60'); R(c, W - 5, 2, 3, 3, '#f2c94c'); }
    },
    estacao(c, W, H, over, v) {
      const open = v === 'aberta';
      house(c, W, H, { roofH: over + 8, wall: open ? '#f2d28a' : '#bfae84', roof: open ? '#7a3a2a' : '#5a4a3a', windows: [10, 30, W - 40, W - 20], door: Math.floor(W / 2) - 6,
        boarded: !open, doorBoard: !open, cracks: !open, shutter: open ? '#8a2a2a' : '#6a6a5a', sign: [Math.floor(W / 2) - 20, over + 9, 40], signCol: open ? '#ffffff' : '#a8a088' });
      R(c, Math.floor(W / 2) - 4, 2, 8, 8, '#f4f0e6'); disc(c, Math.floor(W / 2), 6, 3, '#ffffff'); P(c, Math.floor(W / 2), 4, '#222'); P(c, Math.floor(W / 2) + 1, 6, '#222');
    },
    casavila(c, W, H, over) {
      house(c, W, H, { roofH: over + 8, wall: '#f4e6c8', roof: '#b5502f', windows: [8], door: W - 20, shutter: '#c0392b' });
      R(c, W - 6, H - 12, 4, 8, '#7a4a2a'); disc(c, W - 4, H - 14, 3, '#3f9a3a'); P(c, W - 5, H - 15, '#f28ab2');
    },
    igreja(c, W, H, over) {
      const roofH = over + 6;
      house(c, W, H, { roofH, wall: '#f6f4ee', roof: '#b5502f', windows: [6, W - 16], door: Math.floor(W / 2) - 7, doorW: 14, doorH: 22, doorCol: '#5a3a1e', shutter: '#2e6db5' });
      const tx = Math.floor(W / 2) - 8;
      R(c, tx, 6, 16, roofH + 6, '#f6f4ee'); R(c, tx, 6, 1, roofH + 6, '#d8d4c8'); R(c, tx + 15, 6, 1, roofH + 6, '#d8d4c8');
      for (let y = 0; y < 8; y++) R(c, tx + 8 - y, y - 2 + 2, y * 2 + 1, 1, '#b5502f');
      R(c, tx + 7, -2 + 0, 2, 0, '#5a3a1e');
      disc(c, tx + 8, 16, 3, '#2e6db5'); disc(c, tx + 8, 16, 1, '#f2c94c');
      R(c, tx + 5, 22, 6, 8, '#3a2a20'); disc(c, tx + 8, 25, 2, '#c9a24c');
      R(c, tx + 7, 0, 2, 6, '#5a3a1e'); R(c, tx + 5, 2, 6, 1, '#5a3a1e');
    },
    poco(c, W, H) {
      ell(c, W / 2, H - 9, 12, 7, '#7a7470'); ell(c, W / 2, H - 10, 11, 6, '#9a948e'); ell(c, W / 2, H - 11, 8, 4, '#1a2a4a'); ell(c, W / 2 - 2, H - 12, 3, 1, '#3a5a8a');
      for (let i = 0; i < 8; i++) R(c, W / 2 - 11 + i * 3, H - 6, 2, 2, '#6f6a66');
      R(c, 3, 4, 2, H - 12, '#6b4a2a'); R(c, W - 5, 4, 2, H - 12, '#6b4a2a');
      for (let y = 0; y < 6; y++) R(c, 1 + y, y, W - 2 - y * 2, 1, '#9a5a3a');
      R(c, 1, 5, W - 2, 2, '#7a3a2a'); R(c, 5, 10, W - 10, 2, '#a07848'); R(c, W / 2 - 2, 12, 4, 4, '#8a6a4a'); R(c, W - 6, 9, 3, 1, '#5a5a5a');
    },
    caixote(c, W, H) {
      R(c, 1, H - 13, W - 2, 12, '#a07848'); R(c, 1, H - 13, W - 2, 2, '#c49a6a'); R(c, 1, H - 7, W - 2, 1, '#7a5230');
      R(c, 3, H - 11, 1, 10, '#7a5230'); R(c, W - 4, H - 11, 1, 10, '#7a5230');
      R(c, 4, H - 16, 3, 3, '#f39a1e'); R(c, 8, H - 15, 3, 2, '#f2c94c'); R(c, 11, H - 16, 2, 3, '#7ab04a');
    },
    cocho(c, W, H) {
      R(c, 1, H - 10, W - 2, 8, '#7a5230'); R(c, 1, H - 10, W - 2, 2, '#a07848'); R(c, 3, H - 8, W - 6, 3, '#4a301a');
      R(c, 3, H - 2, 2, 2, '#5a3c20'); R(c, W - 5, H - 2, 2, 2, '#5a3c20');
    },
    fogao(c, W, H, over, v) {
      for (let x = 0; x < W; x += 1) R(c, x, 0, 1, 6, '#9a5a3a');
      R(c, 0, 5, W, 1, '#6a3a2a');
      R(c, 2, 6, 2, H - 6, '#6b4a2a'); R(c, W - 4, 6, 2, H - 6, '#6b4a2a');
      R(c, 6, H - 18, W - 12, 16, '#b05a3a');
      for (let y = H - 18; y < H - 2; y += 3) for (let x = 6 + ((y / 3) % 2) * 2; x < W - 6; x += 5) R(c, x, y, 1, 2, '#8a4a2a');
      R(c, 6, H - 19, W - 12, 2, '#3a3a3a'); R(c, 10, H - 21, 6, 2, '#5a5a5a'); R(c, 18, H - 21, 6, 2, '#5a5a5a');
      R(c, 12, H - 10, 8, 6, '#2a1a12'); R(c, 13, H - 7, 6, 3, '#e8892a'); P(c, 15, H - 8, '#f2c94c');
      R(c, W - 12, 6, 4, H - 25, '#8a4a2a');
      R(c, W - 6, H - 6, 6, 4, '#8a6a3a'); R(c, W - 6, H - 8, 5, 2, '#a07848');
    },
    engenho(c, W, H, over, v) {
      const ok = v === 'ok';
      R(c, 0, 0, W, 6, ok ? '#9a5a3a' : '#6a4a3a'); R(c, 0, 5, W, 1, '#4a2a1a');
      if (!ok) { R(c, 10, 1, 7, 4, '#2a1a12'); R(c, 30, 2, 5, 3, '#2a1a12'); }
      R(c, 1, 6, 2, H - 6, '#6b4a2a'); R(c, W - 3, 6, 2, H - 6, '#6b4a2a');
      R(c, 6, H - 16, 14, 12, ok ? '#8a8480' : '#6f6a66'); R(c, 7, H - 14, 12, 3, '#9a948e'); R(c, 7, H - 9, 12, 3, '#9a948e');
      R(c, 12, H - 22, 2, 8, '#6b4a2a');
      if (ok) { R(c, 13, H - 20, W - 18, 2, '#a07848'); }
      else { R(c, 13, H - 14, 10, 2, '#8a6a4a'); R(c, 22, H - 6, 8, 2, '#8a6a4a'); }
      R(c, W - 18, H - 12, 12, 9, ok ? '#c47a2a' : '#6a5a4a'); R(c, W - 18, H - 12, 12, 2, ok ? '#e8a04a' : '#7a6a5a');
      if (ok) R(c, W - 16, H - 10, 8, 3, '#7a3e12');
      if (!ok) for (let i = 0; i < 6; i++) P(c, 4 + SE.hash(i, 2, 7) * (W - 8), H - 4 - SE.hash(2, i, 7) * 6, '#3f9a3a');
    },
    casa_farinha(c, W, H, over, v) {
      const ok = v === 'ok';
      for (let y = 0; y < 8; y++) R(c, 0, y, W, 1, y % 3 === 2 ? '#7a3a2a' : ok ? '#9a5a3a' : '#6a4a3a');
      if (!ok) { R(c, 8, 1, 8, 5, '#2a1a12'); R(c, W - 16, 3, 6, 4, '#2a1a12'); }
      R(c, 1, 8, 2, H - 8, '#6b4a2a'); R(c, W - 3, 8, 2, H - 8, '#6b4a2a'); R(c, W / 2 - 1, 8, 2, H - 8, '#6b4a2a');
      R(c, 5, H - 12, 18, 9, '#b05a3a'); ell(c, 14, H - 12, 8, 2, ok ? '#3a3a3a' : '#5a5a5a'); if (ok) ell(c, 14, H - 12, 6, 1, '#efe3c4');
      R(c, W - 20, H - 10, 14, 8, '#8a6a4a'); R(c, W - 19, H - 9, 12, 2, '#a07848');
      if (ok) { R(c, W - 18, H - 12, 4, 3, '#efe3c4'); R(c, W - 12, H - 12, 4, 3, '#ffffff'); }
      else for (let i = 0; i < 5; i++) P(c, 4 + SE.hash(i, 3, 7) * (W - 8), H - 3 - SE.hash(3, i, 7) * 5, '#3f9a3a');
    },
    terreiro(c, W, H, over, v) {
      const ok = v === 'ok';
      R(c, 0, H - 26, W, 26, ok ? '#c8c0b0' : '#a49c8c'); R(c, 0, H - 26, W, 2, '#e0d8c8'); R(c, 0, H - 2, W, 2, '#8a8478');
      for (let x = 8; x < W; x += 12) R(c, x, H - 24, 1, 22, '#b0a898');
      if (ok) for (let i = 0; i < 70; i++) P(c, 3 + SE.hash(i, 4, 7) * (W - 6), H - 22 + SE.hash(4, i, 7) * 18, i % 3 ? '#7a3a1a' : '#c0392b');
      else { for (let i = 0; i < 4; i++) { const x = 6 + SE.hash(i, 5, 7) * (W - 12); R(c, x, H - 20, 1, 6, '#7a7468'); R(c, x + 1, H - 15, 3, 1, '#7a7468'); }
        for (let i = 0; i < 10; i++) P(c, 3 + SE.hash(i, 6, 7) * (W - 6), H - 22 + SE.hash(6, i, 7) * 18, '#5a9a3a'); }
      R(c, W - 10, H - 12, 6, 8, '#6b4a2a'); R(c, W - 9, H - 30, 2, 18, '#8a6a3a');
    },
    barraca(c, W, H, over, v) {
      const col = v || '#c0392b';
      R(c, 1, 6, 2, H - 6, '#6b4a2a'); R(c, W - 3, 6, 2, H - 6, '#6b4a2a');
      for (let x = 0; x < W; x += 4) R(c, x, 0, 4, 7, (x / 4) % 2 ? '#ffffff' : col);
      for (let x = 0; x < W; x += 4) R(c, x + 1, 7, 2, 2, (x / 4) % 2 ? '#ffffff' : col);
      R(c, 0, H - 10, W, 8, '#a07848'); R(c, 0, H - 10, W, 2, '#c49a6a');
      R(c, 4, H - 13, 4, 3, '#f2c94c'); R(c, 10, H - 13, 5, 3, '#e8892a'); R(c, 17, H - 13, 4, 3, '#7ab04a'); R(c, 23, H - 13, 4, 3, '#f3e3a0');
    },
    mural(c, W, H) {
      R(c, 2, 4, 2, H - 4, '#6b4a2a'); R(c, W - 4, 4, 2, H - 4, '#6b4a2a');
      R(c, 0, 2, W, 14, '#7a5230'); R(c, 1, 3, W - 2, 12, '#c49a6a');
      R(c, 2, 4, 5, 6, '#ffffff'); R(c, 8, 5, 5, 5, '#f2c94c'); R(c, 4, 11, 8, 3, '#e8dcc0');
      R(c, 0, 0, W, 2, '#9a5a3a');
    },
    ponto(c, W, H) {
      R(c, 0, 0, W, 4, '#2e6db5'); R(c, 0, 4, W, 1, '#1e4d85');
      R(c, 1, 4, 2, H - 4, '#7a7a7a'); R(c, W - 3, 4, 2, H - 4, '#7a7a7a');
      R(c, 4, H - 8, W - 8, 2, '#a07848'); R(c, 5, H - 6, 1, 4, '#6b4a2a'); R(c, W - 6, H - 6, 1, 4, '#6b4a2a');
    },
    colmeia(c, W, H) {
      R(c, 3, H - 4, 10, 4, '#6b4a2a');
      R(c, 2, H - 14, 12, 10, '#f4f0e6'); R(c, 2, H - 10, 12, 1, '#d8d0c0'); R(c, 2, H - 7, 12, 1, '#d8d0c0');
      R(c, 1, H - 16, 14, 2, '#c49a6a'); R(c, 6, H - 6, 4, 1, '#2a1a12');
    },
  };

  // ---------------------------------------------------------------- Pessoas
  const P_CACHE = {};
  SE.personSprite = function (look, dir, frame) {
    const key = JSON.stringify(look) + dir + frame;
    if (P_CACHE[key]) return P_CACHE[key];
    const [cv, c] = SE.canvas(16, 24);
    if (dir === 2) { c.translate(16, 0); c.scale(-1, 1); drawPerson(c, 3, frame, look); }
    else drawPerson(c, dir, frame, look);
    P_CACHE[key] = cv;
    return cv;
  };
  function drawPerson(c, dir, f, L) {
    const skin = L.skin, skinD = SE.shade(skin, -0.2), hair = L.hair, shirt = L.shirt, shirtD = SE.shade(shirt, -0.25);
    const pants = L.pants, boot = '#3b2a1e';
    ell(c, 8, 22, 5, 1, 'rgba(0,0,0,0.25)');
    const l1 = f === 1 ? -1 : 0, l2 = f === 2 ? -1 : 0;
    if (dir === 0 || dir === 1) {
      R(c, 5, 17 + l1, 2, 5, pants); R(c, 9, 17 + l2, 2, 5, pants);
      R(c, 5, 21 + l1, 2, 1, boot); R(c, 9, 21 + l2, 2, 1, boot);
      if (L.dress) { R(c, 4, 15, 8, 5, L.dress); R(c, 3, 19, 10, 1, SE.shade(L.dress, -0.2)); }
      R(c, 4, 11, 8, 7, shirt); R(c, 4, 11, 1, 7, shirtD); R(c, 11, 11, 1, 7, shirtD);
      const a1 = f === 1 ? 1 : 0, a2 = f === 2 ? 1 : 0;
      R(c, 2, 12 + a1, 2, 5, shirtD); R(c, 12, 12 + a2, 2, 5, shirtD); R(c, 2, 17 + a1, 2, 1, skin); R(c, 12, 17 + a2, 2, 1, skin);
      if (L.apron && dir === 0) { R(c, 5, 13, 6, 6, L.apron); }
      if (L.collar && dir === 0) R(c, 7, 11, 2, 1, '#ffffff');
      R(c, 4, 3, 8, 8, skin); R(c, 4, 10, 8, 1, skinD);
      if (dir === 0) {
        R(c, 4, 3, 8, 2, hair); R(c, 4, 5, 1, 3, hair); R(c, 11, 5, 1, 3, hair);
        if (L.long) { R(c, 3, 5, 1, 7, hair); R(c, 12, 5, 1, 7, hair); }
        R(c, 6, 7, 1, 2, '#2a1a12'); R(c, 9, 7, 1, 2, '#2a1a12');
        P(c, 5, 9, SE.shade(skin, 0.15)); P(c, 10, 9, SE.shade(skin, 0.15));
        if (L.mustache) R(c, 6, 9, 4, 1, hair);
        if (L.beard) { R(c, 4, 9, 8, 2, hair); R(c, 6, 9, 4, 1, skinD); }
      } else {
        R(c, 4, 3, 8, 7, hair); if (L.long) R(c, 4, 10, 8, 3, hair);
      }
    } else {
      R(c, 6 + (f === 1 ? 1 : f === 2 ? -1 : 0), 17, 2, 5, SE.shade(pants, -0.15));
      R(c, 8 + (f === 1 ? -1 : f === 2 ? 1 : 0), 17, 2, 5, pants);
      R(c, 6 + (f === 1 ? 1 : f === 2 ? -1 : 0), 21, 3, 1, boot); R(c, 8 + (f === 1 ? -1 : f === 2 ? 1 : 0), 21, 3, 1, boot);
      if (L.dress) { R(c, 5, 15, 7, 5, L.dress); R(c, 4, 19, 9, 1, SE.shade(L.dress, -0.2)); }
      R(c, 5, 11, 6, 7, shirt); R(c, 5, 11, 1, 7, shirtD);
      if (L.apron) R(c, 10, 13, 2, 6, L.apron);
      const sw = f === 1 ? 1 : f === 2 ? -1 : 0;
      R(c, 7 + sw, 12, 2, 5, shirtD); R(c, 7 + sw, 17, 2, 1, skin);
      R(c, 5, 3, 7, 8, skin); R(c, 5, 10, 7, 1, skinD);
      R(c, 5, 3, 7, 2, hair); R(c, 5, 5, 3, 3, hair); if (L.long) R(c, 5, 5, 2, 7, hair);
      R(c, 10, 7, 1, 2, '#2a1a12'); P(c, 12, 8, skin);
      if (L.mustache) R(c, 10, 9, 2, 1, hair);
      if (L.beard) R(c, 8, 9, 4, 2, hair);
    }
    if (L.hat === 'palha') {
      const bx = dir >= 2 ? 3 : 2;
      R(c, bx, 4, 12, 2, '#e3c070'); R(c, bx, 5, 12, 1, '#c9a050');
      R(c, 4, 1, 8, 3, '#e8c878'); R(c, 4, 3, 8, 1, '#8a3a2a');
    } else if (L.hat === 'bone') {
      R(c, 4, 2, 8, 3, L.hatColor || '#c0392b');
      if (dir === 0) R(c, 4, 5, 8, 1, SE.shade(L.hatColor || '#c0392b', -0.3));
      if (dir === 3) R(c, 10, 4, 4, 1, SE.shade(L.hatColor || '#c0392b', -0.3));
    } else if (L.scarf) {
      R(c, 4, 2, 8, 3, L.scarf); R(c, 3, 4, 1, 3, L.scarf); R(c, 12, 4, 1, 3, L.scarf); P(c, 6, 3, '#ffffff'); P(c, 9, 2, '#ffffff');
    }
  }

  // ---------------------------------------------------------------- Bichos
  const A_CACHE = {};
  SE.animalSprite = function (kind, left, frame) {
    const k = kind + left + frame;
    if (A_CACHE[k]) return A_CACHE[k];
    const size = { vaca: [26, 20], cabra: [18, 16], galinha: [12, 12] }[kind];
    const [cv, c] = SE.canvas(size[0], size[1]);
    if (left) { c.translate(size[0], 0); c.scale(-1, 1); }
    const lf = frame === 1 ? 1 : 0;
    if (kind === 'vaca') {
      ell(c, 12, 19, 10, 1, 'rgba(0,0,0,0.2)');
      R(c, 4, 13, 2, 6 - lf, '#e8e0d0'); R(c, 8, 13, 2, 6, '#e8e0d0'); R(c, 15, 13, 2, 6, '#e8e0d0'); R(c, 18, 13, 2, 6 - lf, '#e8e0d0');
      R(c, 4, 18 - lf, 2, 1, '#3a2a20'); R(c, 8, 18, 2, 1, '#3a2a20'); R(c, 15, 18, 2, 1, '#3a2a20'); R(c, 18, 18 - lf, 2, 1, '#3a2a20');
      R(c, 3, 6, 18, 9, '#f4f0e6'); R(c, 3, 14, 18, 1, '#d8d0c0');
      R(c, 6, 7, 5, 4, '#3a2a20'); R(c, 13, 9, 4, 3, '#3a2a20'); R(c, 16, 6, 3, 2, '#3a2a20');
      R(c, 11, 14, 4, 2, '#f2a0a8');
      R(c, 1, 7, 2, 1, '#d8d0c0'); R(c, 0, 8, 1, 5, '#d8d0c0'); R(c, 0, 12, 2, 2, '#3a2a20');
      R(c, 19, 3, 6, 7, '#f4f0e6'); R(c, 20, 8, 5, 3, '#f2c0b0'); P(c, 22, 9, '#5a3a3a'); P(c, 24, 9, '#5a3a3a');
      R(c, 21, 5, 1, 1, '#1a1a1a'); R(c, 19, 2, 1, 2, '#e8dcc0'); R(c, 24, 2, 1, 2, '#e8dcc0'); R(c, 18, 4, 2, 2, '#3a2a20');
    } else if (kind === 'cabra') {
      ell(c, 9, 15, 7, 1, 'rgba(0,0,0,0.2)');
      R(c, 4, 10, 1, 5 - lf, '#5a4a3a'); R(c, 7, 10, 1, 5, '#5a4a3a'); R(c, 11, 10, 1, 5, '#5a4a3a'); R(c, 13, 10, 1, 5 - lf, '#5a4a3a');
      R(c, 3, 5, 12, 6, '#d8cfc0'); R(c, 3, 10, 12, 1, '#b8ae9c'); R(c, 5, 6, 6, 2, '#ece6da');
      R(c, 2, 5, 1, 2, '#b8ae9c');
      R(c, 13, 2, 4, 5, '#d8cfc0'); R(c, 16, 4, 2, 3, '#ece6da'); P(c, 15, 3, '#1a1a1a'); R(c, 15, 7, 1, 2, '#b8ae9c');
      R(c, 13, 0, 1, 2, '#8a7a6a'); R(c, 14, 0, 2, 1, '#8a7a6a'); R(c, 12, 3, 1, 2, '#b8ae9c');
    } else {
      ell(c, 6, 11, 4, 1, 'rgba(0,0,0,0.2)');
      R(c, 5, 9, 1, 2, '#e8a02a'); R(c, 7, 9, 1, 2 - lf, '#e8a02a');
      ell(c, 6, 6, 4, 3, '#f4f0e6'); R(c, 2, 4, 2, 3, '#e8e0d0'); R(c, 4, 6, 4, 1, '#d8d0c0');
      const hy = frame === 2 ? 2 : 0;
      R(c, 8, 2 + hy, 3, 3, '#f4f0e6'); R(c, 8, 1 + hy, 2, 1, '#d9342b'); R(c, 11, 3 + hy, 1, 1, '#e8a02a'); P(c, 9, 3 + hy, '#1a1a1a'); P(c, 10, 5 + hy, '#d9342b');
    }
    A_CACHE[k] = cv;
    return cv;
  };

  // Ônibus da introdução
  SE.drawBus = function (c, x, y, t) {
    const b = Math.round(Math.sin(t * 20) * 0.6);
    ell(c, x + 30, y + 30, 30, 2, 'rgba(0,0,0,0.25)');
    R(c, x, y + b, 60, 24, '#f2f0e6'); R(c, x, y + 14 + b, 60, 4, '#2e6db5'); R(c, x, y + 18 + b, 60, 2, '#f2c94c');
    R(c, x, y + b, 60, 2, '#d8d4c8');
    for (let i = 0; i < 5; i++) R(c, x + 4 + i * 10, y + 4 + b, 8, 8, '#3a5a8a');
    R(c, x + 52, y + 4 + b, 7, 9, '#5a7aa8'); R(c, x + 4 + 10 * 2, y + 5 + b, 3, 3, '#e0ac7e');
    R(c, x + 58, y + 18 + b, 2, 3, '#f2c94c'); R(c, x + 52, y + 13 + b, 6, 12, '#3a5a8a');
    [12, 46].forEach((wx) => { disc(c, x + wx, y + 26, 4, '#222'); disc(c, x + wx, y + 26, 1, '#888'); });
  };

  // ---------------------------------------------------------------- Ícones (16x16)
  const I_CACHE = {};
  SE.iconSprite = function (id) {
    if (I_CACHE[id]) return I_CACHE[id];
    const it = SE.ITEMS[id];
    const [cv, c] = SE.canvas(16, 16);
    const [k, a, b] = it ? it.icon : ['rock'];
    const ICON = {
      seed() { R(c, 3, 2, 10, 12, '#8a6a3a'); R(c, 4, 3, 8, 10, '#ece0bc'); R(c, 4, 3, 8, 2, '#d8c89a'); disc(c, 8, 9, 2, a); P(c, 7, 8, SE.shade(a, 0.4)); },
      cob() { R(c, 6, 2, 5, 11, '#f2c94c'); for (let y = 3; y < 13; y += 2) R(c, 6, y, 5, 1, '#d9a92c'); R(c, 4, 6, 3, 9, '#5aa03a'); R(c, 10, 7, 3, 8, '#3f8a2a'); R(c, 7, 13, 3, 3, '#4a8a2a'); },
      beans() { [[4, 9], [8, 10], [11, 8], [6, 6], [9, 5], [5, 12], [10, 12]].forEach(([x, y]) => { ell(c, x, y, 2, 1, '#8a4b2a'); P(c, x - 1, y - 1, '#c08060'); }); },
      pumpkin() { ell(c, 8, 10, 6, 5, '#d9731e'); ell(c, 8, 9, 5, 4, '#f2902a'); R(c, 8, 5, 1, 10, '#c2621a'); R(c, 5, 6, 1, 8, '#e07a22'); R(c, 11, 6, 1, 8, '#e07a22'); R(c, 7, 2, 3, 3, '#5a7a2a'); },
      root() { for (let i = 0; i < 9; i++) R(c, 3 + i, 11 - i, 3, 3, i < 7 ? '#8a5a3a' : '#f4e8c8'); R(c, 3, 13, 1, 1, '#6a3a2a'); R(c, 11, 2, 3, 3, '#f4e8c8'); },
      berries() { [[6, 8], [9, 7], [8, 10], [11, 10], [5, 11]].forEach(([x, y]) => { disc(c, x, y, 2, a); P(c, x - 1, y - 1, '#f08080'); }); R(c, 8, 2, 4, 3, '#2f7a3a'); },
      cane() { [[3, 0], [7, 1], [11, 0]].forEach(([x], i) => { for (let y = 1; y < 15; y++) R(c, x + Math.floor(y / 5), y, 2, 1, y % 4 === 0 ? '#5a8a2a' : '#b8c45a'); }); },
      fruit() { disc(c, 8, 9, 5, SE.shade(a, -0.2)); disc(c, 7, 8, 4, a); P(c, 6, 6, '#ffffff'); R(c, 8, 2, 1, 3, '#6b4a2a'); R(c, 9, 2, 3, 2, '#3f8a2a'); },
      cluster() { [[6, 6], [10, 6], [8, 9], [5, 10], [11, 10], [8, 12]].forEach(([x, y]) => { disc(c, x, y, 2, a); P(c, x - 1, y - 1, '#8a6aa8'); }); },
      egg() { ell(c, 8, 9, 4, 6, '#e8d8b8'); ell(c, 8, 8, 3, 5, '#f8ecd4'); P(c, 6, 5, '#ffffff'); },
      bottle() { R(c, 7, 1, 3, 2, '#a07848'); R(c, 7, 3, 3, 3, '#cfe0e8'); R(c, 5, 6, 7, 9, '#cfe0e8'); R(c, 5, 8, 7, 7, a); R(c, 6, 7, 1, 7, 'rgba(255,255,255,0.6)'); R(c, 5, 14, 7, 1, SE.shade(a, -0.3)); },
      jar() { R(c, 4, 3, 9, 3, b || '#8a5a2a'); R(c, 3, 6, 11, 9, '#dfe8ec'); R(c, 4, 7, 9, 7, a); R(c, 5, 9, 7, 3, '#f4ecd8'); R(c, 5, 7, 1, 2, 'rgba(255,255,255,0.7)'); },
      wheel() { R(c, 2, 7, 12, 6, SE.shade(a, -0.15)); ell(c, 8, 7, 6, 2, a); R(c, 2, 12, 12, 1, SE.shade(a, -0.35)); R(c, 9, 7, 5, 6, SE.shade(a, -0.05)); P(c, 11, 9, '#e8d080'); P(c, 5, 10, '#e8d080'); },
      pot() { R(c, 4, 5, 9, 9, a); R(c, 3, 4, 11, 2, '#c0392b'); R(c, 5, 7, 7, 4, '#2e6db5'); R(c, 6, 8, 5, 2, '#ffffff'); },
      bun() { [[5, 10], [11, 10], [8, 6]].forEach(([x, y]) => { disc(c, x, y, 3, '#d9a24c'); disc(c, x - 1, y - 1, 2, '#f2c870'); }); },
      bag() { R(c, 4, 4, 9, 11, a); R(c, 4, 4, 2, 11, SE.shade(a, -0.15)); R(c, 6, 2, 5, 2, a); R(c, 5, 4, 7, 1, '#8a6a3a'); R(c, 4, 9, 9, 2, b); },
      brick() { R(c, 2, 6, 12, 7, '#8a4a1a'); R(c, 4, 4, 12, 2, '#c47a3a'); R(c, 14, 4, 2, 7, '#6a3a12'); R(c, 3, 8, 3, 1, '#a5612a'); R(c, 8, 10, 4, 1, '#a5612a'); },
      husk() { R(c, 3, 4, 10, 9, '#c8d07a'); R(c, 3, 4, 10, 1, '#e0e4a0'); R(c, 7, 2, 2, 13, '#8a9a4a'); R(c, 3, 8, 10, 1, '#6a7a3a'); R(c, 4, 13, 8, 1, '#a8b05a'); },
      bowl() { ell(c, 8, 8, 6, 2, a); R(c, 2, 8, 12, 4, '#a5612a'); R(c, 4, 12, 8, 2, '#8a4a1a'); P(c, 6, 7, '#8a4a1a'); P(c, 9, 8, '#8a4a1a'); },
      grass() { for (let i = 0; i < 6; i++) R(c, 4 + i, 2 + (i % 2) * 2, 1, 12, i % 2 ? '#5aa03a' : '#7ccf5a'); R(c, 3, 9, 9, 2, '#c49a5a'); },
      sack() { R(c, 3, 4, 10, 11, a); R(c, 5, 2, 6, 3, a); R(c, 6, 4, 4, 1, '#6b4a2a'); R(c, 5, 8, 6, 4, '#e8dcc0'); R(c, 7, 9, 2, 2, '#3f8a2a'); },
      log() { R(c, 2, 6, 11, 6, '#7a5230'); R(c, 2, 6, 11, 1, '#a07848'); ell(c, 13, 9, 2, 3, '#d8b080'); P(c, 13, 9, '#a07848'); },
      rock() { ell(c, 8, 10, 6, 4, '#7a7470'); ell(c, 8, 9, 5, 3, '#9a948e'); R(c, 5, 7, 3, 1, '#c4beb6'); },
      hive() { R(c, 3, 4, 10, 10, '#f4f0e6'); R(c, 2, 3, 12, 2, '#c49a6a'); R(c, 3, 8, 10, 1, '#d8d0c0'); R(c, 6, 12, 4, 1, '#2a1a12'); P(c, 13, 6, '#f2c94c'); P(c, 1, 9, '#f2c94c'); },
      hoe() { for (let i = 0; i < 11; i++) R(c, 3 + i, 13 - i, 2, 2, '#a07848'); R(c, 10, 1, 5, 3, '#9aa0a8'); R(c, 13, 3, 2, 3, '#7a8088'); },
      can() { R(c, 4, 6, 8, 8, '#3f8a5a'); R(c, 4, 6, 8, 2, '#5aaa7a'); R(c, 12, 8, 3, 1, '#3f8a5a'); R(c, 14, 6, 1, 2, '#3f8a5a'); R(c, 1, 7, 3, 4, '#2f6a4a'); R(c, 6, 3, 4, 2, '#2f6a4a'); },
      sickle() { for (let i = 0; i < 6; i++) R(c, 3 + i, 14 - i, 2, 2, '#a07848'); R(c, 8, 4, 2, 6, '#c4c8d0'); R(c, 9, 2, 4, 2, '#c4c8d0'); R(c, 12, 3, 2, 3, '#c4c8d0'); P(c, 10, 6, '#7a8088'); },
      axe() { for (let i = 0; i < 11; i++) R(c, 3 + i, 13 - i, 2, 2, '#a07848'); R(c, 9, 1, 4, 6, '#9aa0a8'); R(c, 8, 2, 1, 4, '#c4c8d0'); },
      pick() { for (let i = 0; i < 11; i++) R(c, 3 + i, 13 - i, 2, 2, '#a07848'); R(c, 7, 2, 9, 2, '#9aa0a8'); R(c, 6, 3, 2, 2, '#7a8088'); R(c, 15, 3, 1, 3, '#7a8088'); },
    };
    (ICON[k] || ICON.rock)();
    I_CACHE[id] = cv;
    return cv;
  };
  SE.drawIcon = function (c, id, x, y, scale) {
    const s = scale || 1;
    c.drawImage(SE.iconSprite(id), Math.round(x), Math.round(y), 16 * s, 16 * s);
  };
})(window.SE);
