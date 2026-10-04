'use strict';
// Pixel art gerada por código: base de desenho, tiles, objetos, plantações e construções.
// Personagens, retratos, bichos, monstros e ícones ficam em chars.js.
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

  // ---------------------------------------------------------------- Contorno e desenho
  // Contorno escuro de 1 px puxado da cor vizinha (como nos jogos de 16 bits).
  SE.outline = function (src) {
    const w = src.width + 2, h = src.height + 2;
    const [cv, c] = SE.canvas(w, h);
    c.drawImage(src, 1, 1);
    const img = c.getImageData(0, 0, w, h), d = img.data, out = new Uint8ClampedArray(d);
    const solid = (x, y) => x >= 0 && y >= 0 && x < w && y < h && d[(y * w + x) * 4 + 3] >= 128;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = (y * w + x) * 4;
      if (d[i + 3] >= 128) continue;
      let n = -1;
      if (solid(x, y + 1)) n = ((y + 1) * w + x) * 4;
      else if (solid(x, y - 1)) n = ((y - 1) * w + x) * 4;
      else if (solid(x - 1, y)) n = (y * w + x - 1) * 4;
      else if (solid(x + 1, y)) n = (y * w + x + 1) * 4;
      if (n < 0) continue;
      out[i] = d[n] * 0.28 + 14; out[i + 1] = d[n + 1] * 0.24 + 8; out[i + 2] = d[n + 2] * 0.24 + 6; out[i + 3] = 255;
    }
    img.data.set(out);
    c.putImageData(img, 0, 0);
    cv.ox = 1; cv.oy = 1;
    return cv;
  };
  // desenha um sprite (com ou sem contorno) com o canto do desenho original em x,y
  SE.blit = function (c, spr, x, y, sc) {
    sc = sc || 1;
    const ox = (spr.ox || 0) * sc, oy = (spr.oy || 0) * sc;
    if (sc === 1) c.drawImage(spr, Math.round(x - ox), Math.round(y - oy));
    else c.drawImage(spr, Math.round(x - ox), Math.round(y - oy), Math.round(spr.width * sc), Math.round(spr.height * sc));
  };
  SE.shadow = function (c, cx, cy, rx, ry, a) {
    ell(c, Math.round(cx), Math.round(cy), rx, ry || Math.max(1, Math.round(rx / 3)), 'rgba(20,12,30,' + (a || 0.28) + ')');
  };
  function mk(w, h, fn, noOutline) {
    const [cv, c] = SE.canvas(w, h);
    fn(c);
    return noOutline ? cv : SE.outline(cv);
  }

  // ---------------------------------------------------------------- Paletas por época
  SE.PAL = {
    aguas: {
      grass: '#5cb04c', grassD: '#3f8d3c', grassDD: '#2f7232', grassL: '#86cf62', flowers: ['#f4e04d', '#f28ab2', '#ffffff'],
      leaf: '#3a9440', leafD: '#22682e', leafDD: '#174d24', leafL: '#6cc052', mato: '#3f9a3a', matoD: '#2a7a2c', matoL: '#7ccf5a',
      sky: ['#5fa6dc', '#a9d4ee'], mount: ['#3f7a5c', '#4f9068', '#66a873'], ipe: '#3a9440', ipeL: '#6cc052', ipeD: '#22682e',
    },
    seca: {
      grass: '#b4ad5c', grassD: '#968f45', grassDD: '#7a7335', grassL: '#d4cb7c', flowers: ['#f2b84b', '#e9e4c9', '#d77a3a'],
      leaf: '#748e3c', leafD: '#556b2c', leafDD: '#3e5020', leafL: '#9fb252', mato: '#a59a4a', matoD: '#857a36', matoL: '#d2c573',
      sky: ['#2f8ee6', '#8ccaf5'], mount: ['#7a7450', '#948a5c', '#ad9f68'], ipe: '#f2c230', ipeL: '#ffe27a', ipeD: '#c8921a',
    },
  };

  // ---------------------------------------------------------------- Tiles
  SE.TILES = {};
  SE.buildTiles = function (ep) {
    if (SE.TILES[ep]) return SE.TILES[ep];
    const pal = SE.PAL[ep];
    const t = {};
    const tile = (fn) => mk(T, T, fn, true);
    const blade = (c, x, y, col, colL) => { P(c, x, y, col); P(c, x - 1, y + 1, col); P(c, x + 1, y + 1, col); if (colL) P(c, x, y - 1, colL); };
    t.grass = [0, 1, 2, 3, 4, 5].map((v) => tile((c) => {
      R(c, 0, 0, T, T, pal.grass);
      for (let i = 0; i < 22; i++) {
        const x = Math.floor(SE.hash(i, v, 11) * 16), y = Math.floor(SE.hash(v, i, 12) * 16);
        P(c, x, y, SE.hash(i, i + 3, v) > 0.45 ? pal.grassD : pal.grassL);
      }
      for (let i = 0; i < 4; i++) {
        const x = 2 + Math.floor(SE.hash(i, v, 21) * 12), y = 3 + Math.floor(SE.hash(v, i, 22) * 11);
        blade(c, x, y, pal.grassD, pal.grassL);
      }
      if (v === 3) { R(c, 4, 9, 3, 2, pal.grassDD); P(c, 5, 8, pal.grassD); R(c, 10, 4, 2, 2, pal.grassDD); }
      if (v >= 4) {
        for (let i = 0; i < 3; i++) {
          const x = 2 + Math.floor(SE.hash(i, v, 31) * 12), y = 2 + Math.floor(SE.hash(v, i, 32) * 12);
          const col = pal.flowers[(i + v) % 3];
          P(c, x, y - 1, col); P(c, x - 1, y, col); P(c, x + 1, y, col); P(c, x, y + 1, pal.grassDD); P(c, x, y, '#f7d02c');
        }
      }
    }));
    const dirt = '#c49a62', dirtD = '#a67c48', dirtL = '#dcb880';
    t.path = [0, 1].map((v) => tile((c) => {
      R(c, 0, 0, T, T, dirt);
      for (let i = 0; i < 24; i++) {
        const x = Math.floor(SE.hash(i, v, 41) * 16), y = Math.floor(SE.hash(v, i, 42) * 16);
        P(c, x, y, SE.hash(i, v, 43) > 0.5 ? dirtD : dirtL);
      }
      for (let i = 0; i < 3; i++) {
        const x = 1 + Math.floor(SE.hash(i, v, 44) * 13), y = 1 + Math.floor(SE.hash(v, i, 45) * 13);
        R(c, x, y, 2, 2, '#9a8a78'); P(c, x, y, '#d8d0c4'); P(c, x + 1, y + 2, dirtD); P(c, x + 2, y + 1, dirtD);
      }
    }));
    t.water = [0, 1, 2].map((f) => tile((c) => {
      R(c, 0, 0, T, T, '#3d7fd0');
      for (let y = 0; y < 16; y += 4) R(c, 0, y + 2, 16, 1, '#3772bf');
      for (let i = 0; i < 3; i++) {
        const y = (i * 5 + f * 2) % 16, x = (i * 7 + f * 3) % 12;
        R(c, x, y, 4, 1, '#79b3ec'); R(c, x + 1, y - 1, 2, 1, '#a9d2f5'); P(c, x + 4, y + 1, '#2f63ab');
      }
      P(c, (f * 5 + 9) % 16, (f * 3 + 2) % 16, '#e2f1fd');
    }));
    const soilTile = (base, d, l) => tile((c) => {
      R(c, 0, 0, T, T, base);
      for (let i = 0; i < 14; i++) {
        const x = Math.floor(SE.hash(i, base.length, 46) * 15), y = Math.floor(SE.hash(base.length, i, 47) * 15);
        P(c, x, y, d); P(c, x, y - 1, l);
      }
      for (let y = 3; y < 16; y += 5) for (let x = 1; x < 15; x += 3) { P(c, x + (y % 2), y, d); P(c, x + 1 + (y % 2), y, d); P(c, x + (y % 2), y - 1, l); }
    });
    t.tilled = soilTile('#8a5a34', '#6a4224', '#a87048');
    t.wet = soilTile('#5a3a22', '#432a16', '#6e4a2e');
    t.cobble = [0, 1].map((v) => tile((c) => {
      R(c, 0, 0, T, T, '#7a746c');
      for (let yy = 0; yy < 4; yy++) for (let xx = 0; xx < 4; xx++) {
        const ox = (yy % 2) * 2;
        const col = SE.hash(xx + v * 7, yy, 51) > 0.5 ? '#b3aca2' : '#a39c92';
        R(c, xx * 4 + ox, yy * 4, 3, 3, col); P(c, xx * 4 + ox, yy * 4, '#d6cfc4'); P(c, xx * 4 + ox + 2, yy * 4 + 2, '#8a847a');
      }
    }));
    t.rail = tile((c) => {
      R(c, 0, 0, T, T, '#8e877e');
      for (let i = 0; i < 12; i++) P(c, Math.floor(SE.hash(i, 1, 61) * 16), Math.floor(SE.hash(1, i, 62) * 16), i % 2 ? '#6f685f' : '#aaa298');
      for (let x = 1; x < 16; x += 5) { R(c, x, 2, 3, 12, '#6b4a2a'); R(c, x, 2, 3, 1, '#8a6a42'); }
      R(c, 0, 4, 16, 2, '#c8ccd4'); R(c, 0, 6, 16, 1, '#5a5e66');
      R(c, 0, 10, 16, 2, '#c8ccd4'); R(c, 0, 12, 16, 1, '#5a5e66');
    });
    t.floor = tile((c) => {
      R(c, 0, 0, T, T, '#a0703f');
      for (let y = 0; y < 16; y += 4) { R(c, 0, y, 16, 1, '#7d5530'); }
      P(c, 5, 2, '#7d5530'); P(c, 11, 6, '#7d5530'); P(c, 3, 10, '#7d5530'); P(c, 13, 14, '#7d5530');
    });
    // franjas de grama que invadem a terra (cima, baixo, esquerda, direita)
    const fr = (side) => tile((c) => {
      for (let i = 0; i < 16; i++) {
        const h = SE.hash(i, side.length, 81), h2 = SE.hash(side.length, i, 82);
        const put = (d, col) => {
          if (side === 't') P(c, i, d, col); else if (side === 'b') P(c, i, 15 - d, col);
          else if (side === 'l') P(c, d, i, col); else P(c, 15 - d, i, col);
        };
        put(0, pal.grass);
        if (h > 0.25) put(1, pal.grass);
        if (h > 0.7) put(2, pal.grassD);
        if (h2 > 0.82) put(2, pal.grass);
        if (side === 't' && h > 0.25) put(2, 'rgba(60,40,20,0.35)');
      }
    });
    t.fringe = { t: fr('t'), b: fr('b'), l: fr('l'), r: fr('r') };
    // margens do rio
    t.bank = {
      t: tile((c) => {
        R(c, 0, 0, 16, 2, pal.grass); for (let i = 0; i < 16; i++) if (SE.hash(i, 9, 83) > 0.4) P(c, i, 2, pal.grassD);
        R(c, 0, 3, 16, 3, '#8a6438'); R(c, 0, 5, 16, 1, '#6a4a28'); R(c, 0, 6, 16, 1, '#2f63ab');
        for (let i = 0; i < 16; i += 3) P(c, i + 1, 4, '#a07a4a');
      }),
      b: tile((c) => { for (let i = 0; i < 16; i++) { if (SE.hash(i, 7, 84) > 0.3) P(c, i, 12, '#cfe6fb'); } R(c, 0, 13, 16, 1, '#c9a46c'); R(c, 0, 14, 16, 2, pal.grass); }),
      l: tile((c) => { R(c, 0, 0, 2, 16, pal.grass); R(c, 2, 0, 2, 16, '#8a6438'); R(c, 4, 0, 1, 16, '#2f63ab'); }),
      r: tile((c) => { R(c, 14, 0, 2, 16, pal.grass); R(c, 12, 0, 2, 16, '#8a6438'); R(c, 11, 0, 1, 16, '#2f63ab'); }),
    };
    // borda escura da terra arada
    const se = (col) => ({
      t: tile((c) => { R(c, 0, 0, 16, 1, col); }), b: tile((c) => { R(c, 0, 15, 16, 1, col); R(c, 0, 14, 16, 1, 'rgba(0,0,0,0.15)'); }),
      l: tile((c) => { R(c, 0, 0, 1, 16, col); }), r: tile((c) => { R(c, 15, 0, 1, 16, col); }),
    });
    t.soilEdge = se('#4a2e18');
    SE.TILES[ep] = t;
    return t;
  };

  // Tiles da gruta por faixa de profundidade (0: terra, 1: gelo, 2: lava)
  const MINE_T = {};
  SE.MINE_TIERS = [
    { floor: '#8a6a4a', floorD: '#6e5238', floorL: '#a48460', wall: '#4a3a30', wallL: '#6a5444', rock: '#8a8278', rockD: '#62584e', rockL: '#b2aa9e' },
    { floor: '#6a7e94', floorD: '#536478', floorL: '#8aa0b6', wall: '#2e3a4c', wallL: '#4a5c74', rock: '#9aaec2', rockD: '#6a7e94', rockL: '#d4e4f2' },
    { floor: '#6a3e32', floorD: '#502c24', floorL: '#8a5444', wall: '#2a1614', wallL: '#4a2620', rock: '#7a5a52', rockD: '#54382f', rockL: '#a8847a' },
  ];
  SE.mineTiles = function (tier) {
    if (MINE_T[tier]) return MINE_T[tier];
    const M = SE.MINE_TIERS[tier];
    const tile = (fn) => mk(T, T, fn, true);
    const t = {};
    t.floor = [0, 1, 2].map((v) => tile((c) => {
      R(c, 0, 0, 16, 16, M.floor);
      for (let i = 0; i < 20; i++) { const x = Math.floor(SE.hash(i, v, 301 + tier) * 16), y = Math.floor(SE.hash(v, i, 302) * 16); P(c, x, y, i % 3 ? M.floorD : M.floorL); }
      if (v === 2) { R(c, 5, 8, 3, 2, M.floorD); P(c, 5, 8, M.floorL); R(c, 11, 3, 2, 2, M.floorD); }
      if (tier === 2 && v === 1) { R(c, 3, 11, 4, 1, '#e8582a'); P(c, 4, 10, '#f2a03a'); }
    }));
    t.wall = tile((c) => {
      R(c, 0, 0, 16, 16, M.wall);
      for (let i = 0; i < 10; i++) { const x = Math.floor(SE.hash(i, 3, 303 + tier) * 14), y = Math.floor(SE.hash(3, i, 304) * 14); R(c, x, y, 2, 1, M.wallL); P(c, x, y + 1, '#120c0a'); }
    });
    t.face = tile((c) => {
      R(c, 0, 0, 16, 16, M.wallL);
      R(c, 0, 0, 16, 2, M.wall);
      for (let x = 0; x < 16; x += 4) { R(c, x + (x % 8 ? 1 : 0), 3, 1, 11, M.wall); P(c, x + 2, 6, M.rockL); }
      R(c, 0, 14, 16, 2, '#120c0a');
    });
    MINE_T[tier] = t;
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
  // Todos com contorno. Âncora: canto superior esquerdo do tile; árvores e objetos altos sobem.
  const OBJ_CACHE = {};
  SE.TREE_CODES = 'TPJAI';
  SE.objSprite = function (code, ep, v, tier) {
    const k = code + ep + (v || 0) + '|' + (tier || 0);
    if (OBJ_CACHE[k]) return OBJ_CACHE[k];
    const pal = SE.PAL[ep];
    let spr = null;
    if (code === 'm') spr = mk(16, 16, (c) => {
      const n = 4 + (v % 2);
      for (let i = 0; i < n; i++) {
        const bx = 3 + Math.floor(SE.hash(i, v, 81) * 10), hh = 7 + Math.floor(SE.hash(v, i, 82) * 6);
        for (let b = -1; b <= 1; b++) {
          const col = b === 0 ? pal.matoL : b < 0 ? pal.matoD : pal.mato;
          for (let y = 0; y < hh - Math.abs(b) * 2; y++) P(c, bx + b + (b * y) / 4, 15 - y, col);
        }
      }
      R(c, 3, 13, 10, 3, pal.matoD); R(c, 4, 13, 8, 1, pal.mato);
    });
    else if (code === 'p') spr = mk(16, 16, (c) => {
      ell(c, 8, 10, 6, 4, '#6f6a66'); ell(c, 8, 9, 5, 3, '#9a948e'); ell(c, 7, 8, 3, 1, '#b8b2aa'); R(c, 5, 7, 2, 1, '#dcd6ce'); P(c, 10, 11, '#5a5652'); P(c, 11, 10, '#5a5652');
      if (v % 2) { ell(c, 13, 12, 2, 1, '#8a847e'); P(c, 12, 11, '#b8b2aa'); }
    });
    else if (code === 'k') spr = mk(16, 16, (c) => {
      R(c, 3, 6, 10, 8, '#6b4a2a'); R(c, 3, 6, 2, 8, '#5a3c20'); R(c, 11, 6, 2, 8, '#7d5a34');
      for (let y = 8; y < 14; y += 2) P(c, 6 + (y % 4), y, '#4a301a');
      ell(c, 8, 6, 5, 2, '#c49a6a'); ell(c, 8, 6, 3, 1, '#a07848'); P(c, 8, 6, '#7a5230');
      R(c, 1, 12, 3, 2, '#5a3c20'); R(c, 12, 12, 3, 2, '#5a3c20'); R(c, 6, 13, 2, 2, '#5a3c20');
    });
    else if (SE.TREE_CODES.includes(code)) spr = mk(48, 64, (c) => drawTree(c, code, ep, pal, v));
    else if (code === 'b') spr = mk(16, 16, (c) => {
      disc(c, 8, 9, 6, pal.leafD); disc(c, 7, 8, 5, pal.leaf); disc(c, 6, 7, 2, pal.leafL);
      P(c, 10, 6, pal.leafL); P(c, 4, 11, pal.leafDD); P(c, 11, 12, pal.leafDD);
      if (ep === 'aguas') { P(c, 5, 10, '#f28ab2'); P(c, 10, 9, '#f28ab2'); P(c, 8, 12, '#ffffff'); }
    });
    else if ('rcfoq'.includes(code)) spr = mk(16, 16, (c) => drawMineRock(c, code, tier || 0, v));
    else if (code === 'L') spr = mk(16, 16, (c) => {
      ell(c, 8, 9, 7, 5, '#1a100c'); ell(c, 8, 8, 5, 3, '#0a0604');
      R(c, 4, 2, 2, 11, '#a07848'); R(c, 10, 2, 2, 11, '#a07848'); for (let y = 4; y < 13; y += 3) R(c, 5, y, 6, 1, '#7a5230');
    });
    else if (code === 'U') spr = mk(16, 28, (c) => {
      R(c, 3, 0, 2, 28, '#a07848'); R(c, 11, 0, 2, 28, '#a07848'); R(c, 3, 0, 1, 28, '#c49a6a');
      for (let y = 3; y < 27; y += 4) { R(c, 4, y, 8, 2, '#7a5230'); R(c, 4, y, 8, 1, '#a07848'); }
    });
    else if (code === 'C') spr = mk(16, 16, (c) => {
      R(c, 1, 5, 14, 10, '#9a6232'); R(c, 1, 5, 14, 4, '#b57a40'); R(c, 1, 9, 14, 1, '#5a3418');
      R(c, 1, 5, 1, 10, '#7a4a22'); R(c, 14, 5, 1, 10, '#7a4a22');
      R(c, 3, 5, 1, 10, '#c8ccd4'); R(c, 12, 5, 1, 10, '#c8ccd4'); R(c, 7, 8, 2, 3, '#f2c94c'); P(c, 7, 8, '#fff2b0');
      R(c, 2, 3, 12, 2, '#b57a40'); R(c, 2, 3, 12, 1, '#d29a5a');
    });
    else if (code === 'E') spr = mk(16, 30, (c) => {
      R(c, 7, 10, 2, 20, '#7a5230'); R(c, 1, 14, 14, 2, '#7a5230');
      R(c, 4, 12, 8, 9, '#c0392b'); for (let y = 12; y < 21; y += 2) R(c, 4, y, 8, 1, '#9a2a1e'); R(c, 7, 12, 2, 9, '#2e6db5');
      R(c, 1, 13, 3, 4, '#c0392b'); R(c, 12, 13, 3, 4, '#c0392b'); P(c, 0, 17, '#e3c070'); P(c, 15, 17, '#e3c070');
      disc(c, 8, 7, 4, '#e8d4a0'); P(c, 6, 7, '#3a2412'); P(c, 10, 7, '#3a2412'); R(c, 7, 9, 3, 1, '#7a3a2a');
      R(c, 1, 3, 14, 2, '#e3c070'); R(c, 4, 0, 8, 4, '#e8c878'); R(c, 4, 3, 8, 1, '#8a3a2a');
      R(c, 5, 21, 2, 3, '#e3c070'); R(c, 9, 21, 2, 3, '#e3c070');
    });
    else if (code === 'R') spr = mk(16, 16, (c) => {
      ell(c, 8, 12, 5, 2, '#8a5a2a'); R(c, 5, 8, 6, 4, '#c87838'); R(c, 5, 8, 6, 1, '#e8a060'); R(c, 7, 4, 2, 4, '#9aa0a8'); R(c, 6, 3, 4, 2, '#c8ccd4');
      P(c, 5, 3, '#8ac0f0'); P(c, 10, 3, '#8ac0f0');
    });
    else if (code === 'O' || code === 'o_lit') spr = mk(16, 28, (c) => {
      const lit = code === 'o_lit';
      R(c, 1, 10, 14, 18, '#8a827a'); R(c, 1, 10, 14, 2, '#b2aa9e'); R(c, 3, 2, 10, 9, '#8a827a'); R(c, 5, 0, 6, 3, '#6a625a');
      for (let y = 12; y < 28; y += 4) for (let x = 1 + (y % 8 ? 0 : 2); x < 15; x += 5) R(c, x, y, 4, 1, '#6a625a');
      R(c, 4, 17, 8, 7, '#1a100c'); R(c, 4, 17, 8, 1, '#4a3a30');
      if (lit) { R(c, 5, 19, 6, 5, '#e8582a'); R(c, 6, 20, 4, 3, '#f2a03a'); R(c, 7, 21, 2, 2, '#fff2b0'); }
    });
    else if (code === 'h') spr = SE.buildingSprite('colmeia', 1, 1, 4);
    OBJ_CACHE[k] = spr;
    return spr;
  };

  function drawTree(c, code, ep, pal, v) {
    // tronco e raízes
    R(c, 19, 38, 10, 22, '#6b4a2a'); R(c, 19, 38, 3, 22, '#563a20'); R(c, 27, 38, 2, 22, '#86603a');
    for (let y = 42; y < 58; y += 5) { R(c, 22 + (y % 3), y, 1, 3, '#4a301a'); P(c, 25, y + 2, '#4a301a'); }
    R(c, 15, 58, 18, 3, '#563a20'); R(c, 13, 60, 6, 2, '#563a20'); R(c, 29, 60, 6, 2, '#563a20'); R(c, 17, 58, 14, 1, '#6b4a2a');
    const ipe = code === 'I';
    const leaf = ipe ? pal.ipe : code === 'J' ? SE.shade(pal.leaf, -0.1) : pal.leaf;
    const leafD = ipe ? pal.ipeD : code === 'J' ? SE.shade(pal.leafD, -0.1) : pal.leafD;
    const leafDD = ipe ? SE.shade(pal.ipeD, -0.3) : pal.leafDD;
    const leafL = ipe ? pal.ipeL : pal.leafL;
    const jit = (i, s) => Math.round((SE.hash(i, v, s) - 0.5) * 4);
    const blobs = [[24, 21, 16], [12, 29, 10], [36, 29, 10], [24, 33, 12], [15, 14, 10], [33, 13, 10], [24, 8, 9]]
      .map(([x, y, r], i) => [x + jit(i, 111), y + jit(i, 112), r]);
    blobs.forEach(([x, y, r]) => disc(c, x, y + 2, r, leafDD));
    blobs.forEach(([x, y, r]) => disc(c, x, y, r, leafD));
    blobs.forEach(([x, y, r]) => disc(c, x - 1, y - 2, r - 3, leaf));
    blobs.forEach(([x, y, r]) => disc(c, x - 3, y - 4, Math.max(2, r - 8), leafL));
    // tufos de folha
    for (let i = 0; i < 26; i++) {
      const x = 8 + SE.hash(i, v, 113) * 32, y = 4 + SE.hash(v, i, 114) * 34;
      P(c, x, y, leafDD); P(c, x + 1, y - 1, leafD); P(c, x - 1, y + 1, leafD);
    }
    for (let i = 0; i < 12; i++) P(c, 10 + SE.hash(i, v, 115) * 26, 4 + SE.hash(v, i, 116) * 22, SE.shade(leafL, 0.3));
    if (code === 'P') for (let i = 0; i < 6; i++) { const x = 12 + SE.hash(i, 5, 93) * 24, y = 14 + SE.hash(5, i, 94) * 18; disc(c, x, y, 2, '#b8c04a'); P(c, x - 1, y - 1, '#e8f08a'); }
    if (code === 'A') for (let i = 0; i < 5; i++) { const x = 12 + SE.hash(i, 6, 95) * 24, y = 14 + SE.hash(6, i, 96) * 18; disc(c, x, y, 2, '#6f8e2a'); P(c, x - 1, y - 1, '#a8c45a'); }
    if (code === 'J') for (let i = 0; i < 14; i++) { const x = 19 + SE.hash(i, 7, 97) * 9, y = 40 + SE.hash(7, i, 98) * 16; R(c, x, y, 2, 2, '#2a1238'); P(c, x, y, '#6a4a88'); }
    if (ipe && ep === 'seca') for (let i = 0; i < 18; i++) P(c, 8 + SE.hash(i, 8, 99) * 32, 4 + SE.hash(8, i, 100) * 32, '#fff2a0');
  }

  function drawMineRock(c, code, tier, v) {
    const M = SE.MINE_TIERS[tier];
    ell(c, 8, 10, 7, 5, M.rockD); ell(c, 8, 9, 6, 4, M.rock); ell(c, 6, 7, 3, 2, M.rockL);
    P(c, 11, 12, M.rockD); P(c, 3, 10, M.rockD); R(c, 9, 6, 2, 1, M.rockL);
    const spot = (col, colL, n) => { for (let i = 0; i < n; i++) { const x = 4 + SE.hash(i, v, 121) * 8, y = 6 + SE.hash(v, i, 122) * 6; R(c, x, y, 2, 2, col); P(c, x, y, colL); } };
    if (code === 'c') spot('#c8642a', '#f0a060', 4);
    else if (code === 'f') spot('#a8b0b8', '#f4f8fc', 4);
    else if (code === 'o') spot('#e0a820', '#fff0a0', 5);
    else if (code === 'q') { R(c, 6, 4, 2, 6, '#c88af0'); P(c, 6, 4, '#f4e0ff'); R(c, 9, 5, 2, 5, '#e8d8ff'); R(c, 4, 7, 2, 3, '#a060d0'); }
  }

  // Cerca: desenhada conforme vizinhos
  SE.drawFence = function (c, x, y, l, r, u, d) {
    R(c, x + 6, y + 1, 4, 14, '#7a5230'); R(c, x + 6, y + 1, 4, 1, '#a07848'); R(c, x + 6, y + 14, 4, 1, '#4a301a'); R(c, x + 9, y + 2, 1, 12, '#5a3c20');
    if (l) { R(c, x, y + 4, 7, 2, '#a07848'); R(c, x, y + 9, 7, 2, '#a07848'); R(c, x, y + 6, 7, 1, '#5a3c20'); R(c, x, y + 11, 7, 1, '#5a3c20'); }
    if (r) { R(c, x + 9, y + 4, 7, 2, '#a07848'); R(c, x + 9, y + 9, 7, 2, '#a07848'); R(c, x + 9, y + 6, 7, 1, '#5a3c20'); R(c, x + 9, y + 11, 7, 1, '#5a3c20'); }
    if (u) R(c, x + 7, y - 2, 2, 4, '#a07848');
    if (d) R(c, x + 7, y + 14, 2, 3, '#a07848');
  };

  // ---------------------------------------------------------------- Plantações (16×32, contorno, cache)
  SE.cropStage = function (cr) {
    const d = SE.CROPS[cr.id];
    if (cr.ready) return 4;
    return Math.min(3, Math.floor((cr.age / d.days) * 4));
  };
  const CROP_CACHE = {};
  SE.cropSprite = function (cr) {
    const st = cr.dead ? 'x' : SE.cropStage(cr);
    const k = cr.id + st;
    if (CROP_CACHE[k]) return CROP_CACHE[k];
    const spr = mk(16, 32, (c) => drawCropRaw(c, 0, 16, cr, st));
    CROP_CACHE[k] = spr;
    return spr;
  };
  SE.drawCrop = function (c, x, y, cr) { SE.blit(c, SE.cropSprite(cr), x, y - 16); };

  function drawCropRaw(c, x, y, cr, st) {
    const g = '#3f9a3a', gD = '#2a7a2c', gL = '#7ccf5a';
    if (st === 'x') {
      R(c, x + 7, y + 6, 2, 9, '#8a6a3a'); R(c, x + 4, y + 8, 3, 1, '#a08050'); R(c, x + 9, y + 10, 4, 1, '#a08050'); P(c, x + 5, y + 7, '#a08050');
      return;
    }
    if (st === 0) { R(c, x + 5, y + 9, 2, 1, '#3a2414'); R(c, x + 10, y + 7, 2, 1, '#3a2414'); R(c, x + 7, y + 12, 2, 1, '#3a2414'); P(c, x + 8, y + 11, gL); return; }
    if (st === 1) { R(c, x + 7, y + 9, 2, 5, g); P(c, x + 6, y + 9, gL); R(c, x + 4, y + 7, 3, 2, gL); R(c, x + 9, y + 6, 3, 2, gL); P(c, x + 5, y + 8, gD); P(c, x + 10, y + 7, gD); return; }
    const big = st >= 3;
    switch (cr.id) {
      case 'milho': {
        const h = st === 2 ? 10 : 17;
        R(c, x + 7, y + 15 - h, 2, h, g); R(c, x + 8, y + 15 - h, 1, h, gD);
        for (let i = 0; i < 4; i++) { const yy = y + 14 - i * 4; if (yy < y + 15 - h + 1) break; R(c, x + 2, yy - 1, 5, 1, gL); P(c, x + 2, yy, gD); R(c, x + 9, yy - 3, 5, 1, gD); P(c, x + 13, yy - 2, gD); }
        if (big) { R(c, x + 6, y - 3, 4, 2, '#e8d27a'); P(c, x + 8, y - 4, '#e8d27a'); P(c, x + 5, y - 2, '#c8a24a'); }
        if (st === 4) { R(c, x + 9, y + 3, 3, 6, '#f2c94c'); P(c, x + 10, y + 4, '#fff0a0'); R(c, x + 9, y + 3, 1, 6, '#7ab04a'); P(c, x + 10, y + 2, '#c9a24c'); }
        break;
      }
      case 'feijao': {
        const r = st === 2 ? 4 : 6;
        R(c, x + 7, y + 15 - r * 2 - 2, 1, r * 2 + 2, '#8a6a3a');
        ell(c, x + 8, y + 15 - r, r + 1, r, gD); ell(c, x + 8, y + 14 - r, r, r - 1, g);
        P(c, x + 6, y + 15 - r * 2 + 2, gL); P(c, x + 10, y + 15 - r * 2 + 3, gL); P(c, x + 7, y + 12 - r, gL);
        if (st === 4) { R(c, x + 4, y + 8, 1, 5, '#d8b860'); R(c, x + 9, y + 7, 1, 5, '#d8b860'); R(c, x + 12, y + 9, 1, 4, '#d8b860'); P(c, x + 4, y + 8, '#f0d890'); }
        break;
      }
      case 'abobora': {
        ell(c, x + 8, y + 12, st === 2 ? 4 : 7, 3, gD);
        disc(c, x + 4, y + 10, 2, g); disc(c, x + 12, y + 11, 2, g); if (big) { disc(c, x + 8, y + 8, 3, g); P(c, x + 7, y + 6, gL); }
        if (st === 3) disc(c, x + 9, y + 13, 1, '#e8b02a');
        if (st === 4) { ell(c, x + 8, y + 12, 6, 3, '#d9731e'); ell(c, x + 8, y + 11, 5, 2, '#f2902a'); R(c, x + 8, y + 9, 1, 6, '#c2621a'); R(c, x + 5, y + 10, 1, 4, '#c2621a'); R(c, x + 11, y + 10, 1, 4, '#c2621a'); R(c, x + 8, y + 7, 2, 2, '#5a7a2a'); P(c, x + 5, y + 10, '#ffb860'); }
        break;
      }
      case 'mandioca': {
        const h = st === 2 ? 9 : 15;
        R(c, x + 7, y + 15 - h, 1, h, '#8a5a3a'); R(c, x + 8, y + 15 - h + 2, 1, h - 2, '#a06a48');
        const leaf = (lx, ly) => { P(c, lx, ly, g); P(c, lx - 1, ly - 1, gL); P(c, lx + 1, ly - 1, gL); P(c, lx - 2, ly, gD); P(c, lx + 2, ly, gD); P(c, lx, ly - 2, gL); P(c, lx - 2, ly - 2, g); P(c, lx + 2, ly - 2, g); };
        leaf(x + 7, y + 15 - h); if (big) { leaf(x + 4, y + 4); leaf(x + 11, y + 3); leaf(x + 7, y + 8); }
        if (st === 4) { R(c, x + 4, y + 13, 3, 2, '#8a5a3a'); R(c, x + 9, y + 14, 3, 1, '#8a5a3a'); }
        break;
      }
      case 'cana': {
        const h = st === 2 ? 10 : st === 3 ? 16 : 20;
        [4, 7, 10].forEach((sx, i) => {
          const hh = h - i * 2 + (i === 1 ? 2 : 0);
          R(c, x + sx, y + 15 - hh, 2, hh, st === 4 ? '#b8c45a' : '#7ab04a'); R(c, x + sx + 1, y + 15 - hh, 1, hh, st === 4 ? '#9aa840' : '#5a9a3a');
          for (let k = 3; k < hh; k += 4) R(c, x + sx, y + 15 - k, 2, 1, '#5a8a2a');
          R(c, x + sx - 3, y + 15 - hh, 3, 1, gL); R(c, x + sx + 2, y + 14 - hh, 3, 1, gD);
        });
        break;
      }
      case 'cafe': {
        const r = st === 2 ? 4 : 6;
        R(c, x + 7, y + 11, 2, 4, '#6b4a2a');
        disc(c, x + 8, y + 13 - r, r, '#1f5a2a'); disc(c, x + 7, y + 12 - r, r - 1, '#2f7a3a'); disc(c, x + 6, y + 11 - r, Math.max(1, r - 4), '#4a9a4a');
        for (let i = 0; i < 4; i++) P(c, x + 5 + i * 2, y + 9 - r + (i % 2) * 3, '#56a04a');
        if (st === 4) for (let i = 0; i < 8; i++) { const px = x + 4 + SE.hash(i, 1, 9) * 8, py = y + 13 - r * 2 + SE.hash(1, i, 9) * r * 1.6; P(c, px, py, '#d9342b'); P(c, px + 1, py, '#a82018'); }
        break;
      }
      case 'maracuja': {
        R(c, x + 7, y - 2, 2, 17, '#8a6a3a'); R(c, x + 2, y - 2, 12, 1, '#8a6a3a'); R(c, x + 2, y - 2, 1, 4, '#8a6a3a'); R(c, x + 13, y - 2, 1, 4, '#8a6a3a');
        const n = st === 2 ? 4 : 8;
        for (let i = 0; i < n; i++) { const px = x + 3 + SE.hash(i, 2, 9) * 10, py = y + SE.hash(2, i, 9) * 13; disc(c, px, py, 1, i % 2 ? g : gD); P(c, px, py - 1, gL); }
        if (st === 3) { P(c, x + 5, y + 4, '#ffffff'); P(c, x + 10, y + 7, '#b04aa0'); P(c, x + 11, y + 7, '#ffffff'); }
        if (st === 4) [[4, 6], [11, 3], [10, 10]].forEach(([a, b]) => { disc(c, x + a, y + b, 2, '#e9cf3f'); P(c, x + a - 1, y + b - 1, '#fff2a0'); });
        break;
      }
      case 'laranja': {
        R(c, x + 7, y + 6, 2, 9, '#6b4a2a'); R(c, x + 7, y + 6, 1, 9, '#563a20');
        const r = st === 2 ? 4 : 7;
        disc(c, x + 8, y + 6 - (r - 4), r, '#1f6a2c'); disc(c, x + 7, y + 5 - (r - 4), r - 1, '#2f8a3a'); disc(c, x + 6, y + 3 - (r - 4), Math.max(1, r - 4), '#56b04a');
        if (st === 3) { P(c, x + 5, y + 4, '#ffffff'); P(c, x + 11, y + 2, '#ffffff'); P(c, x + 8, y + 6, '#ffffff'); }
        if (st === 4) [[4, 3], [10, 1], [8, 6], [12, 5], [6, -1]].forEach(([a, b]) => { R(c, x + a, y + b, 2, 2, '#f39a1e'); P(c, x + a, y + b, '#ffd080'); });
        break;
      }
    }
  }

  // ---------------------------------------------------------------- Construções
  const B_CACHE = {};
  SE.buildingSprite = function (art, w, h, over, variant) {
    const k = art + '|' + w + 'x' + h + '|' + (variant || '');
    if (B_CACHE[k]) return B_CACHE[k];
    const W = w * T, H = h * T + over;
    const fn = ART[art] || ART.casa;
    const spr = mk(W, H, (c) => fn(c, W, H, over, variant || ''));
    B_CACHE[k] = spr;
    return spr;
  };

  function house(c, W, H, o) {
    const roofH = o.roofH;
    const wall = o.wall, wallD = SE.shade(wall, -0.15), wallL = SE.shade(wall, 0.12);
    R(c, 0, roofH - 2, W, H - roofH + 2, wall);
    if (o.planks) for (let x = 3; x < W; x += 6) { R(c, x, roofH, 1, H - roofH - 4, wallD); P(c, x + 1, roofH + 3 + (x % 5), wallL); }
    else for (let i = 0; i < (W * (H - roofH)) / 14; i++) {
      const x = SE.hash(i, W, 201) * W, y = roofH + SE.hash(H, i, 202) * (H - roofH);
      P(c, x, y, SE.hash(i, 3, 203) > 0.5 ? wallD : wallL);
    }
    if (o.cracks) for (let i = 0; i < 4; i++) { const x = 6 + SE.hash(i, 1, 204) * (W - 12), y = roofH + 4 + SE.hash(1, i, 205) * 10; R(c, x, y, 1, 4, SE.shade(wall, -0.35)); R(c, x + 1, y + 3, 1, 3, SE.shade(wall, -0.35)); }
    // alicerce de pedra
    const base = o.base || '#8a827a';
    R(c, 0, H - 5, W, 5, base);
    for (let x = 0; x < W; x += 5) { R(c, x + ((x / 5) % 2 ? 2 : 0), H - 5, 4, 2, SE.shade(base, 0.15)); P(c, x + 4, H - 2, SE.shade(base, -0.3)); }
    R(c, 0, roofH, 1, H - roofH, wallD); R(c, W - 1, roofH, 1, H - roofH, wallD);
    // telhado de telha capa-canal com brilho
    const roof = o.roof, roofD = SE.shade(roof, -0.25), roofL = SE.shade(roof, 0.18);
    for (let y = 0; y < roofH; y++) R(c, 0, y, W, 1, y % 4 === 3 ? roofD : roof);
    for (let y = 0; y < roofH; y += 4) for (let x = (y / 4) % 2 ? 2 : 0; x < W; x += 5) { R(c, x, y, 1, 3, roofD); P(c, x + 2, y, roofL); }
    R(c, 0, 0, W, 1, roofL); R(c, 0, roofH - 3, W, 3, SE.shade(roof, -0.45)); R(c, 0, roofH, W, 3, 'rgba(0,0,0,0.22)');
    if (o.holes) o.holes.forEach(([x, y]) => { R(c, x, y, 5, 3, '#3a2a20'); P(c, x + 5, y + 1, roofD); });
    (o.windows || []).forEach((wx) => {
      const wy = roofH + 6;
      R(c, wx - 1, wy - 1, 12, 12, '#f4f0e6'); R(c, wx, wy, 10, 10, o.boarded ? '#8a6a4a' : '#2a3a5a');
      if (!o.boarded) { R(c, wx + 1, wy + 1, 3, 3, '#5a7aa8'); R(c, wx + 4, wy, 2, 10, '#f4f0e6'); R(c, wx, wy + 4, 10, 2, '#f4f0e6'); P(c, wx + 7, wy + 7, '#4a6a98'); }
      else { R(c, wx - 2, wy + 2, 14, 2, '#a07848'); R(c, wx - 2, wy + 6, 14, 2, '#a07848'); }
      R(c, wx - 4, wy - 1, 3, 12, o.shutter || '#2e6db5'); R(c, wx + 11, wy - 1, 3, 12, o.shutter || '#2e6db5');
      R(c, wx - 4, wy - 1, 3, 1, SE.shade(o.shutter || '#2e6db5', 0.3)); R(c, wx - 2, wy + 11, 14, 2, SE.shade(wall, -0.3));
      if (o.flowers) { R(c, wx - 1, wy + 11, 12, 3, '#7a4a2a'); for (let i = 0; i < 4; i++) P(c, wx + 1 + i * 3, wy + 10, ['#e8405a', '#f2c94c', '#ffffff', '#f28ab2'][i]); }
    });
    if (o.door !== undefined) {
      const dw = o.doorW || 12, dh = o.doorH || 18, dx = o.door;
      R(c, dx - 1, H - dh - 1, dw + 2, dh + 1, '#f4f0e6');
      R(c, dx, H - dh, dw, dh, o.doorCol || '#7a4a2a');
      R(c, dx, H - dh, dw, 1, SE.shade(o.doorCol || '#7a4a2a', 0.25));
      if (o.doorBoard) { R(c, dx - 2, H - dh + 4, dw + 4, 2, '#a07848'); R(c, dx - 2, H - dh + 10, dw + 4, 2, '#a07848'); }
      else { R(c, dx + dw / 2, H - dh, 1, dh, SE.shade(o.doorCol || '#7a4a2a', -0.3)); P(c, dx + dw / 2 + 2, H - dh / 2, '#e2c044'); }
      R(c, dx - 2, H - 2, dw + 4, 2, '#9a948e');
    }
    if (o.sign) { R(c, o.sign[0], o.sign[1], o.sign[2], 7, '#5a3a1e'); R(c, o.sign[0] + 1, o.sign[1] + 1, o.sign[2] - 2, 5, o.signCol || '#e8d6a0');
      for (let i = 3; i < o.sign[2] - 3; i += 3) R(c, o.sign[0] + i, o.sign[1] + 3, 2, 1, '#5a3a1e'); }
  }

  const ART = {
    casa(c, W, H, over, v) {
      const ref = v === 'reformada';
      house(c, W, H, { roofH: over + 10, wall: ref ? '#f1e6cf' : '#c58a52', roof: ref ? '#c2562f' : '#9a5a3a', windows: [8, W - 22], door: Math.floor(W / 2) - 6,
        cracks: !ref, holes: ref ? null : [[12, 6], [W - 24, 14]], shutter: ref ? '#2e6db5' : '#5a7a6a', flowers: ref });
      if (!ref) R(c, W - 10, H - 10, 6, 6, '#8a6a4a');
      R(c, W - 16, 0, 6, 10, '#9a948e'); R(c, W - 17, 0, 8, 2, '#6f6a66');
    },
    armazem(c, W, H, over) {
      house(c, W, H, { roofH: over + 8, wall: '#e8d8b0', roof: '#b5502f', windows: [10, W - 24], door: Math.floor(W / 2) - 8, doorW: 16, doorCol: '#2e6db5', sign: [Math.floor(W / 2) - 20, over + 10, 40], signCol: '#f2c94c' });
      R(c, 4, H - 11, 8, 6, '#a07848'); R(c, 5, H - 12, 6, 2, '#f2c94c'); R(c, W - 12, H - 11, 8, 6, '#a07848'); R(c, W - 11, H - 12, 6, 2, '#c0392b');
    },
    pensao(c, W, H, over) {
      house(c, W, H, { roofH: over + 8, wall: '#f2c2c8', roof: '#b5502f', windows: [8, W - 22], door: Math.floor(W / 2) - 6, shutter: '#2e8a5a', sign: [Math.floor(W / 2) - 14, over + 9, 28], signCol: '#ffffff', flowers: true });
      R(c, 2, H - 9, 4, 4, '#c0392b'); disc(c, 4, H - 11, 2, '#3f9a3a'); R(c, W - 6, H - 9, 4, 4, '#c0392b'); disc(c, W - 4, H - 11, 2, '#3f9a3a');
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
      house(c, W, H, { roofH: over + 8, wall: '#f4e6c8', roof: '#b5502f', windows: [8], door: W - 20, shutter: '#c0392b', flowers: true });
      R(c, W - 6, H - 13, 4, 8, '#7a4a2a'); disc(c, W - 4, H - 15, 3, '#3f9a3a'); P(c, W - 5, H - 16, '#f28ab2');
    },
    ferraria(c, W, H, over) {
      house(c, W, H, { roofH: over + 8, wall: '#9a8a7a', roof: '#5a4a4a', windows: [W - 20], door: 8, doorW: 18, doorH: 20, doorCol: '#2a1a12', base: '#6a625a', planks: true, sign: [6, over + 9, 34], signCol: '#c8ccd4' });
      R(c, 10, H - 14, 14, 6, '#e8582a'); R(c, 12, H - 13, 10, 4, '#f2a03a'); R(c, 15, H - 12, 4, 2, '#fff2b0');
      R(c, W - 14, 0, 8, over + 4, '#6a625a'); R(c, W - 15, 0, 10, 2, '#4a4440');
      R(c, W - 30, H - 10, 10, 3, '#3a3a40'); R(c, W - 28, H - 7, 6, 4, '#2a2a30'); R(c, W - 32, H - 10, 3, 2, '#3a3a40');
    },
    igreja(c, W, H, over) {
      const roofH = over + 6;
      house(c, W, H, { roofH, wall: '#f6f4ee', roof: '#b5502f', windows: [6, W - 16], door: Math.floor(W / 2) - 7, doorW: 14, doorH: 22, doorCol: '#5a3a1e', shutter: '#2e6db5' });
      const tx = Math.floor(W / 2) - 8;
      R(c, tx, 6, 16, roofH + 6, '#f6f4ee'); R(c, tx, 6, 1, roofH + 6, '#d8d4c8'); R(c, tx + 15, 6, 1, roofH + 6, '#d8d4c8');
      for (let y = 0; y < 8; y++) R(c, tx + 8 - y, y, y * 2 + 1, 1, '#b5502f');
      disc(c, tx + 8, 16, 3, '#2e6db5'); disc(c, tx + 8, 16, 1, '#f2c94c');
      R(c, tx + 5, 22, 6, 8, '#3a2a20'); disc(c, tx + 8, 25, 2, '#c9a24c');
      R(c, tx + 7, 0, 2, 6, '#5a3a1e'); R(c, tx + 5, 2, 6, 1, '#5a3a1e');
    },
    poco(c, W, H) {
      ell(c, W / 2, H - 9, 12, 7, '#7a7470'); ell(c, W / 2, H - 10, 11, 6, '#9a948e'); ell(c, W / 2, H - 11, 8, 4, '#1a2a4a'); ell(c, W / 2 - 2, H - 12, 3, 1, '#3a5a8a');
      for (let i = 0; i < 8; i++) { R(c, W / 2 - 11 + i * 3, H - 6, 2, 2, '#6f6a66'); P(c, W / 2 - 11 + i * 3, H - 6, '#b2aa9e'); }
      R(c, 3, 4, 2, H - 12, '#6b4a2a'); R(c, W - 5, 4, 2, H - 12, '#6b4a2a');
      for (let y = 0; y < 6; y++) R(c, 1 + y, y, W - 2 - y * 2, 1, y % 2 ? '#9a5a3a' : '#b06a44');
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
    correio(c, W, H) {
      R(c, 7, 8, 2, H - 8, '#6b4a2a'); R(c, 7, 8, 1, H - 8, '#86603a');
      R(c, 2, 2, 12, 8, '#c0392b'); R(c, 2, 2, 12, 2, '#e05a4a'); ell(c, 8, 2, 6, 1, '#e05a4a'); R(c, 3, 5, 10, 1, '#8a2a1e');
      R(c, 13, 3, 1, 6, '#5a5a5a'); R(c, 13, 3, 3, 2, '#f2c94c');
    },
    gruta(c, W, H, over) {
      ell(c, W / 2, H - 14, W / 2, 16, '#6a625a'); ell(c, W / 2, H - 16, W / 2 - 3, 14, '#8a827a');
      for (let i = 0; i < 14; i++) { const x = 4 + SE.hash(i, 2, 131) * (W - 8), y = 4 + SE.hash(2, i, 132) * (H - 16); R(c, x, y, 3, 2, '#a8a096'); P(c, x, y + 2, '#5a524a'); }
      ell(c, W / 2, H - 8, 11, 9, '#0e0806'); R(c, W / 2 - 11, H - 8, 22, 8, '#0e0806');
      R(c, W / 2 - 13, H - 18, 3, 18, '#7a5230'); R(c, W / 2 + 10, H - 18, 3, 18, '#7a5230'); R(c, W / 2 - 14, H - 20, 28, 3, '#9a6a3a');
      R(c, W / 2 - 14, H - 20, 28, 1, '#c49a6a');
      for (let i = 0; i < 6; i++) P(c, 6 + SE.hash(i, 4, 133) * (W - 12), 3 + SE.hash(4, i, 134) * 8, '#3f9a3a');
    },
    fogao(c, W, H) {
      for (let x = 0; x < W; x += 1) R(c, x, 0, 1, 6, x % 3 ? '#9a5a3a' : '#7a3a2a');
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
      if (ok) R(c, 13, H - 20, W - 18, 2, '#a07848');
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
})(window.SE);
