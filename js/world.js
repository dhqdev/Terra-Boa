'use strict';
// Mapas: o Sítio Esperança e o vilarejo.
(function (SE) {
  const T = SE.T;
  SE.MAPS = {};

  function makeMap(id, name, w, h) {
    const m = { id, name, w, h, ground: new Array(w * h).fill('g'), deco: new Array(w * h).fill(''), buildings: [], exits: [] };
    for (let y = 0; y < 3; y++) for (let x = 0; x < w; x++) m.ground[y * w + x] = 's';
    return m;
  }
  const setG = (m, x, y, g) => { if (x >= 0 && y >= 0 && x < m.w && y < m.h) m.ground[y * m.w + x] = g; };
  const fillG = (m, x0, y0, x1, y1, g) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) setG(m, x, y, g); };

  // ---------------------------------------------------------------- Sítio
  const farm = makeMap('farm', 'Sítio Esperança', 40, 32);
  fillG(farm, 7, 8, 7, 14, 'p');
  fillG(farm, 3, 14, 39, 14, 'p');
  fillG(farm, 37, 15, 39, 15, 'p');
  fillG(farm, 8, 9, 13, 9, 'p');
  fillG(farm, 30, 12, 31, 13, 'p');
  fillG(farm, 1, 28, 38, 29, 'w');
  farm.buildings = [
    { id: 'casa', art: 'casa', x: 5, y: 5, w: 5, h: 3, over: 20, name: 'Casa de taipa', act: 'casa', variant: (s) => (s.flags.casaReformada ? 'reformada' : '') ,
      lights: [[14, 42], [62, 42]] },
    { id: 'poco', art: 'poco', x: 12, y: 6, w: 2, h: 2, over: 8, name: 'Poço', act: 'poco' },
    { id: 'caixote', art: 'caixote', x: 10, y: 7, w: 1, h: 1, over: 4, name: 'Caixote do Seu Jorge', act: 'caixote' },
    { id: 'fogao', art: 'fogao', x: 3, y: 11, w: 2, h: 2, over: 6, name: 'Fogão a lenha', act: 'station' },
    { id: 'engenho', art: 'engenho', x: 8, y: 11, w: 3, h: 2, over: 6, name: 'Engenho de cana', act: 'station', variant: (s) => (s.stations.engenho.ok ? 'ok' : '') },
    { id: 'casa_farinha', art: 'casa_farinha', x: 12, y: 11, w: 3, h: 2, over: 6, name: 'Casa de farinha', act: 'station', variant: (s) => (s.stations.casa_farinha.ok ? 'ok' : '') },
    { id: 'terreiro', art: 'terreiro', x: 16, y: 11, w: 3, h: 2, over: 6, name: 'Terreiro de café', act: 'station', variant: (s) => (s.stations.terreiro.ok ? 'ok' : '') },
    { id: 'cocho', art: 'cocho', x: 25, y: 6, w: 2, h: 1, over: 0, name: 'Cocho do curral', act: 'cocho' },
  ];
  farm.exits = [{ x0: 39, y0: 14, x1: 39, y1: 15, to: 'vila', tx: 1.5, ty: 14, dir: 3, name: 'Estrada para o vilarejo' }];
  farm.curral = { x0: 25, y0: 7, x1: 35, y1: 11 };
  SE.MAPS.farm = farm;

  // ---------------------------------------------------------------- Vilarejo
  const vila = makeMap('vila', 'Vilarejo da Serra', 40, 28);
  fillG(vila, 0, 13, 39, 14, 'p');
  fillG(vila, 14, 7, 25, 12, 'c');
  fillG(vila, 5, 11, 6, 12, 'p');
  fillG(vila, 29, 11, 30, 12, 'p');
  fillG(vila, 34, 11, 35, 12, 'p');
  fillG(vila, 3, 20, 36, 20, 'p');
  fillG(vila, 11, 15, 11, 19, 'p');
  fillG(vila, 24, 15, 24, 19, 'p');
  fillG(vila, 26, 20, 36, 20, 'c');
  fillG(vila, 0, 22, 39, 23, 'r');
  vila.buildings = [
    { id: 'igreja', art: 'igreja', x: 17, y: 3, w: 6, h: 4, over: 22, name: 'Igreja de São Benedito', act: 'igreja', lights: [[10, 34], [86, 34]] },
    { id: 'armazem', art: 'armazem', x: 3, y: 8, w: 6, h: 3, over: 18, name: 'Armazém do Seu Jorge', act: 'armazem', lights: [[15, 32], [77, 32]] },
    { id: 'pensao', art: 'pensao', x: 27, y: 8, w: 5, h: 3, over: 18, name: 'Pensão da Dona Cida', act: 'pensao', lights: [[13, 32], [63, 32]] },
    { id: 'bar', art: 'bar', x: 33, y: 8, w: 4, h: 3, over: 16, name: 'Bar do Zé', act: 'bar', lights: [[51, 30]] },
    { id: 'escola', art: 'escola', x: 4, y: 17, w: 6, h: 3, over: 18, name: 'Escola Municipal da Serra', act: 'escola', variant: (s) => (s.projDone.escola ? 'aberta' : '') },
    { id: 'casavila', art: 'casavila', x: 16, y: 17, w: 5, h: 3, over: 16, name: 'Casa do Seu Tião e da Dona Nena', act: 'casavila', lights: [[13, 30]] },
    { id: 'estacao', art: 'estacao', x: 27, y: 17, w: 8, h: 3, over: 16, name: 'Estação Ferroviária da Serra', act: 'estacao', variant: (s) => (s.projDone.estacao ? 'aberta' : '') },
    { id: 'ponto', art: 'ponto', x: 1, y: 11, w: 2, h: 1, over: 14, name: 'Ponto de ônibus', act: 'ponto' },
    { id: 'barraca', art: 'barraca', x: 20, y: 10, w: 2, h: 1, over: 14, name: 'Sua barraca da feira', act: 'feira' },
    { id: 'mural', art: 'mural', x: 15, y: 8, w: 1, h: 1, over: 8, name: 'Mural da comunidade', act: 'mural' },
    { id: 'barraca2', art: 'barraca', x: 16, y: 10, w: 2, h: 1, over: 14, name: 'Barraca de verduras', act: 'feirante', variant: () => '#27ae60', when: (s) => SE.isFeiraDay(s) },
    { id: 'barraca3', art: 'barraca', x: 23, y: 10, w: 2, h: 1, over: 14, name: 'Barraca de pastel', act: 'feirante', variant: () => '#2e6db5', when: (s) => SE.isFeiraDay(s) },
  ];
  vila.exits = [{ x0: 0, y0: 13, x1: 0, y1: 14, to: 'farm', tx: 38, ty: 14.5, dir: 2, name: 'Estrada para o sítio' }];
  SE.MAPS.vila = vila;

  // ---------------------------------------------------------------- Consultas
  SE.buildingAt = function (m, x, y, s) {
    for (const b of m.buildings) {
      if (b.when && (!s || !b.when(s))) continue;
      if (x >= b.x && x < b.x + b.w && y >= b.y && y < b.y + b.h) return b;
    }
    return null;
  };
  SE.groundAt = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h ? 's' : m.ground[y * m.w + x]);
  SE.objAt = function (m, x, y) {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return '';
    if (m.id === 'farm') return SE.state.farmObj[y * m.w + x] || '';
    return m.deco[y * m.w + x] || '';
  };
  SE.setObj = function (m, x, y, v) { if (m.id === 'farm') SE.state.farmObj[y * m.w + x] = v; };
  const SOLID_OBJ = { m: 1, p: 1, k: 1, T: 1, P: 1, J: 1, A: 1, I: 1, b: 1, F: 1, h: 1, l: 1 };
  SE.isSolidTile = function (m, x, y) {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return true;
    const g = m.ground[y * m.w + x];
    if (g === 's' || g === 'w') return true;
    if (SOLID_OBJ[SE.objAt(m, x, y)]) return true;
    if (SE.buildingAt(m, x, y, SE.state)) return true;
    return false;
  };

  // Decoração fixa do vilarejo
  (function () {
    const rnd = SE.mulberry32(42);
    const m = vila;
    const free = (x, y) => m.ground[y * m.w + x] === 'g' && !SE.buildingAt(m, x, y, null) && !SE.buildingAt(m, x, y + 1, null);
    for (let y = 3; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const i = y * m.w + x;
      const edge = x === 0 || x === m.w - 1 || y === m.h - 1 || y === 3;
      if (edge && m.ground[i] === 'g' && !SE.buildingAt(m, x, y, null)) { m.deco[i] = 'T'; continue; }
      if (!free(x, y)) continue;
      const r = rnd();
      if (y >= 24 && r < 0.25) m.deco[i] = 'T';
      else if (y >= 24 && r < 0.35) m.deco[i] = 'b';
      else if (y > 3 && y < 12 && (x < 3 || x > 37) && r < 0.4) m.deco[i] = 'T';
      else if (y >= 15 && y <= 19 && (x === 12 || x === 23 || x === 25 || x === 37) && r < 0.6) m.deco[i] = 'b';
    }
    [[14, 7], [25, 7]].forEach(([x, y]) => { m.deco[y * m.w + x] = 'I'; });
    [[13, 12], [26, 12], [9, 12], [32, 12], [2, 15], [37, 15]].forEach(([x, y]) => { m.deco[y * m.w + x] = 'l'; });
    [[17, 12], [23, 8]].forEach(([x, y]) => { m.deco[y * m.w + x] = 'n'; });
    [[1, 13], [1, 14]].forEach(([x, y]) => { m.deco[y * m.w + x] = ''; });
  })();

  // ---------------------------------------------------------------- Geração do sítio (novo jogo)
  SE.genFarmObj = function () {
    const m = farm;
    const o = new Array(m.w * m.h).fill('');
    const rnd = SE.mulberry32(1987);
    const c = m.curral;
    for (let y = 3; y < m.h; y++) for (let x = 0; x < m.w; x++) {
      const i = y * m.w + x;
      if (m.ground[i] !== 'g') continue;
      if (SE.buildingAt(m, x, y, null)) continue;
      const edge = x === 0 || x === m.w - 1 || y === 3 || y === m.h - 1;
      if (edge) { o[i] = 'T'; continue; }
      const onFence = (x >= c.x0 - 1 && x <= c.x1 + 1 && (y === c.y0 - 2 || y === c.y1 + 1)) || ((x === c.x0 - 1 || x === c.x1 + 1) && y >= c.y0 - 2 && y <= c.y1 + 1);
      if (onFence) { o[i] = 'F'; continue; }
      if (x >= c.x0 && x <= c.x1 && y >= c.y0 - 1 && y <= c.y1) continue;
      // frente das construções e beira dos caminhos ficam livres
      if (SE.buildingAt(m, x, y - 1, null)) continue;
      if ([[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => SE.groundAt(m, x + dx, y + dy) === 'p')) continue;
      const r = rnd();
      if (x >= 2 && x <= 22 && y >= 16 && y <= 26) {
        if (r < 0.42) o[i] = 'm'; else if (r < 0.5) o[i] = 'p'; else if (r < 0.55) o[i] = 'k';
      } else if (x >= 24 && x <= 37 && y >= 16 && y <= 26) {
        if (r < 0.13) o[i] = 'T'; else if (r < 0.16) o[i] = 'P'; else if (r < 0.19) o[i] = 'J'; else if (r < 0.21) o[i] = 'A';
        else if (r < 0.36) o[i] = 'm'; else if (r < 0.4) o[i] = 'b';
      } else if (y === 30) {
        if (r < 0.35) o[i] = 'b'; else if (r < 0.45) o[i] = 'T';
      } else if (y >= 4 && y <= 13) {
        if (r < 0.08) o[i] = 'm'; else if (r < 0.1) o[i] = 'p';
      } else if (r < 0.12) o[i] = 'm';
    }
    // portão do curral
    o[12 * m.w + 30] = ''; o[12 * m.w + 31] = '';
    // pequeno roçado já limpo para começar
    for (let y = 17; y <= 19; y++) for (let x = 3; x <= 7; x++) o[y * m.w + x] = '';
    return o;
  };

  SE.tileCenter = (tx, ty) => [tx * T + T / 2, ty * T + T / 2];
})(window.SE);
