'use strict';
// Utilidades gerais do Sítio Esperança
window.SE = window.SE || {};
(function (SE) {
  SE.W = 384;
  SE.H = 216;
  SE.T = 16;
  SE.FONT = '"VT323", monospace';
  SE.FONT_TITLE = '"Press Start 2P", monospace';
  SE.SAVE_KEY = 'sitioEsperanca.save.v1';

  SE.clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  SE.lerp = (a, b, t) => a + (b - a) * t;
  SE.rand = (a, b) => a + Math.random() * (b - a);
  SE.ri = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  SE.pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  SE.chance = (p) => Math.random() < p;
  SE.pad2 = (n) => (n < 10 ? '0' : '') + n;
  SE.key = (x, y) => x + ',' + y;

  SE.mulberry32 = function (a) {
    return function () {
      a |= 0; a = (a + 0x6d2b79f5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  };

  // Ruído determinístico por coordenada (0..1)
  SE.hash = function (x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul((s || 0) | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  };

  SE.money = (n) => 'R$ ' + Math.round(n).toLocaleString('pt-BR');

  SE.canvas = function (w, h) {
    const c = document.createElement('canvas');
    c.width = w; c.height = h;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    return [c, x];
  };

  SE.shade = function (hex, f) {
    const n = parseInt(hex.slice(1), 16);
    let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    if (f < 0) { r *= 1 + f; g *= 1 + f; b *= 1 + f; }
    else { r += (255 - r) * f; g += (255 - g) * f; b += (255 - b) * f; }
    return '#' + ((1 << 24) | (Math.round(r) << 16) | (Math.round(g) << 8) | Math.round(b)).toString(16).slice(1);
  };

  SE.wrap = function (ctx, text, maxW) {
    const out = [];
    String(text).split('\n').forEach((para) => {
      const words = para.split(' ');
      let line = '';
      words.forEach((w) => {
        const test = line ? line + ' ' + w : w;
        if (ctx.measureText(test).width > maxW && line) { out.push(line); line = w; }
        else line = test;
      });
      out.push(line);
    });
    return out;
  };

  // Retângulo cheio com coordenadas inteiras
  SE.rect = (ctx, x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x | 0, y | 0, w | 0, h | 0); };
})(window.SE);
