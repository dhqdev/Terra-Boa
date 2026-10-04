'use strict';
// A gruta da serra: andares gerados, minério, monstros, facão, bombas e vida do jogador.
(function (SE) {
  const T = SE.T;
  const MW = 26, MH = 20;
  SE.MINE_BOTTOM = 30;
  SE.mineTier = (floor) => (floor >= 20 ? 2 : floor >= 10 ? 1 : 0);
  const TIER_NAME = ['Gruta de terra', 'Gruta gelada', 'Gruta de fogo'];

  // ---------------------------------------------------------------- Geração de andar
  SE.genMine = function (floor) {
    const tier = SE.mineTier(floor);
    let g, start, count;
    for (let attempt = 0; attempt < 30; attempt++) {
      g = new Array(MW * MH).fill('x');
      for (let y = 2; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) if (Math.random() > 0.43) g[y * MW + x] = 'd';
      for (let it = 0; it < 4; it++) {
        const n = g.slice();
        for (let y = 2; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
          let walls = 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) if ((dx || dy) && g[(y + dy) * MW + x + dx] !== 'd') walls++;
          n[y * MW + x] = walls >= 5 ? 'x' : walls <= 3 ? 'd' : g[y * MW + x];
        }
        g = n;
      }
      const cands = [];
      for (let y = 3; y < MH / 2; y++) for (let x = 2; x < MW - 2; x++) if (g[y * MW + x] === 'd' && g[(y + 1) * MW + x] === 'd' && g[(y - 1) * MW + x] === 'x') cands.push([x, y]);
      if (!cands.length) continue;
      start = SE.pick(cands);
      const seen = new Uint8Array(MW * MH), q = [start];
      seen[start[1] * MW + start[0]] = 1; count = 0;
      while (q.length) {
        const [x, y] = q.pop(); count++;
        [[1, 0], [-1, 0], [0, 1], [0, -1]].forEach(([dx, dy]) => {
          const i = (y + dy) * MW + x + dx;
          if (g[i] === 'd' && !seen[i]) { seen[i] = 1; q.push([x + dx, y + dy]); }
        });
      }
      if (count < 150) continue;
      for (let i = 0; i < g.length; i++) if (g[i] === 'd' && !seen[i]) g[i] = 'x';
      break;
    }
    const m = { id: 'mina', name: 'Gruta · andar ' + floor, w: MW, h: MH, ground: g, deco: [], obj: new Array(MW * MH).fill(''), buildings: [], exits: [],
      floor, tier, mons: [], bombs: [], fx: [], rocks: 0, ladder: false, spawn: [start[0], start[1] + 1] };
    m.obj[start[1] * MW + start[0]] = 'U';
    const far = (x, y, d) => Math.abs(x - start[0]) + Math.abs(y - start[1]) > d;
    const free = [];
    for (let y = 2; y < MH - 1; y++) for (let x = 1; x < MW - 1; x++) {
      if (g[y * MW + x] !== 'd' || !far(x, y, 2)) continue;
      free.push([x, y]);
      if (Math.random() < 0.32) {
        const r = Math.random();
        let o = 'r';
        if (r < 0.025) o = 'q';
        else if (floor >= 20 && r < 0.08) o = 'o';
        else if (floor >= 10 && r < (floor >= 20 ? 0.14 : 0.1)) o = 'f';
        else if (floor < 25 && r < (floor >= 10 ? 0.16 : 0.13)) o = 'c';
        m.obj[y * MW + x] = o; m.rocks++;
      }
    }
    // monstros
    const nMon = Math.min(9, 2 + Math.floor(floor / 3));
    const spots = free.filter(([x, y]) => far(x, y, 6) && !m.obj[y * MW + x]);
    for (let i = 0; i < nMon && spots.length; i++) {
      const [x, y] = spots.splice(SE.ri(0, spots.length - 1), 1)[0];
      const kind = floor >= 6 && Math.random() < 0.38 ? 'morcego' : 'lesma';
      m.mons.push(makeMon(kind, tier, x * T + 8, y * T + 12));
    }
    return m;
  };
  function makeMon(kind, tier, x, y) {
    const k = 1 + tier * 0.9;
    return kind === 'lesma'
      ? { kind, tier, x, y, hp: Math.round(24 * k), max: Math.round(24 * k), dmg: 6 + tier * 5, t: Math.random(), vx: 0, vy: 0, hurt: 0, f: 0 }
      : { kind, tier, x, y, hp: Math.round(16 * k), max: Math.round(16 * k), dmg: 7 + tier * 5, t: Math.random() * 6, vx: 0, vy: 0, hurt: 0, f: 0 };
  }

  // ---------------------------------------------------------------- Entrar e sair
  SE.enterMineMenu = function () {
    const s = SE.state;
    const go = () => {
      const floors = [1];
      for (let f = 5; f <= s.mine.deepest && f <= SE.MINE_BOTTOM; f += 5) floors.push(f);
      if (floors.length === 1) return SE.enterMine(1);
      SE.say('O velho elevador de mineiro ainda funciona. Descer até qual andar?', {
        choices: floors.slice(-6).map((f) => ({ t: 'Andar ' + f, fn: () => SE.enterMine(f) })).concat([{ t: 'Agora não', fn: () => {} }]),
      });
    };
    if (!s.flags.facao) {
      s.flags.facao = true;
      SE.say([
        { who: null, text: 'A boca da gruta sopra um ar frio. Na entrada, encostado numa viga, um facão velho e uma lamparina.' },
        { who: null, text: 'Lá dentro tem pedra, minério e bicho estranho. Segure o facão e aperte Espaço para golpear. Ache a escada em baixo das pedras para descer.' },
      ], { onClose: () => { if (SE.give('facao', 1) > 0) SE.toast('Libere espaço na mochila para pegar o facão.', '#ffb0a0'); go(); } });
      return;
    }
    go();
  };
  SE.enterMine = function (floor) {
    const s = SE.state;
    SE.audio.play('ladder');
    SE.fadeTo(() => {
      const m = SE.genMine(floor);
      SE.MAPS.mina = m;
      s.map = 'mina';
      const p = SE.player;
      p.x = m.spawn[0] * T + 8; p.y = m.spawn[1] * T + 12; p.dir = 0; p.kx = p.ky = 0;
      SE.fishing = null;
      if (floor > s.mine.deepest) s.mine.deepest = floor;
      if (SE.scene && SE.scene.onMapChange) SE.scene.onMapChange();
      SE.checkGoals();
      if (floor === SE.MINE_BOTTOM) SE.toast('Você chegou ao fundo da gruta!', '#ffe08a');
      else if (floor % 5 === 0) SE.toast('Andar ' + floor + ': o elevador agora para aqui.', '#a0e0ff');
      if (floor === 10 || floor === 20) SE.toast(TIER_NAME[SE.mineTier(floor)] + ': minério novo por aqui!', '#a0e0ff');
    });
  };
  SE.leaveMine = function (faint) {
    const s = SE.state;
    SE.fadeTo(() => {
      s.map = 'farm';
      const p = SE.player;
      if (faint) { p.x = 7 * T + 8; p.y = 8 * T + 12; }
      else { p.x = 20 * T + 8; p.y = 5 * T + 12; }
      p.dir = 0; p.kx = p.ky = 0;
      delete SE.MAPS.mina;
      if (SE.scene && SE.scene.onMapChange) SE.scene.onMapChange();
    });
  };
  SE.useLadder = function (o) {
    const m = SE.MAPS.mina;
    if (o === 'U') return SE.leaveMine(false);
    if (m.floor >= SE.MINE_BOTTOM) { SE.toast('Aqui é o fundo da gruta.', '#e0d0b0'); return; }
    SE.enterMine(m.floor + 1);
  };
  SE.rockBroken = function (tx, ty) {
    const m = SE.MAPS.mina;
    if (!m) return;
    m.rocks--;
    if (m.ladder || m.floor >= SE.MINE_BOTTOM) return;
    const p = 0.025 + 0.5 / Math.max(1, m.rocks) + (m.mons.length ? 0 : 0.04);
    if (Math.random() < p || m.rocks <= 0) {
      SE.setObj(m, tx, ty, 'L'); m.ladder = true;
      SE.audio.play('ladder'); SE.toast('Você achou a escada para o próximo andar!', '#ffe08a');
    }
  };

  // ---------------------------------------------------------------- Combate
  SE.swing = function () {
    const p = SE.player, s = SE.state;
    if (p.swingCd > 0) return;
    p.swingCd = 0.42; p.swingT = 0.24; p.tool = 'facao'; p.toolT = 0.24;
    SE.audio.play('swing');
    const d = SE.DIRS[p.dir];
    const hx = p.x + d[0] * 13, hy = p.y - 8 + d[1] * 13;
    const m = SE.MAPS[s.map];
    if (m.id === 'mina') m.mons.forEach((mo) => {
      if (Math.hypot(mo.x - hx, mo.y - 6 - hy) > 18) return;
      const dmg = SE.ri(6, 10) + 2 * (s.lvl.combate || 0);
      mo.hp -= dmg; mo.hurt = 0.25;
      const len = Math.hypot(mo.x - p.x, mo.y - p.y) || 1;
      mo.vx = ((mo.x - p.x) / len) * 140; mo.vy = ((mo.y - p.y) / len) * 140;
      m.fx.push({ kind: 'num', x: mo.x, y: mo.y - 16, t: 0.7, text: String(dmg) });
      SE.audio.play('slime');
    });
    const [ftx, fty] = SE.frontTile();
    if (SE.objAt(m, ftx, fty) === 'm') { SE.setObj(m, ftx, fty, ''); if (Math.random() < 0.4) SE.give('capim', 1); }
  };
  SE.hurtPlayer = function (dmg, fx, fy) {
    const p = SE.player, s = SE.state;
    if (p.inv > 0 || s.hp <= 0) return;
    s.hp = Math.max(0, s.hp - dmg);
    p.inv = 1.0;
    const len = Math.hypot(p.x - fx, p.y - fy) || 1;
    p.kx = ((p.x - fx) / len) * 150; p.ky = ((p.y - fy) / len) * 150;
    SE.audio.play('hurt');
    const m = SE.MAPS[s.map];
    if (m.fx) m.fx.push({ kind: 'num', x: p.x, y: p.y - 34, t: 0.8, text: '-' + dmg, col: '#ff6a5a' });
    if (s.hp <= 0) faint();
  };
  function faint() {
    const s = SE.state;
    const lost = Math.min(500, Math.round(s.money * 0.1));
    s.money -= lost;
    s.hp = Math.round(s.maxHp * 0.5);
    s.energy = Math.max(s.energy, 10);
    s.time = Math.min(SE.PASS_OUT - 60, s.time + 120);
    SE.leaveMine(true);
    SE.fadeTo(() => SE.say('Você desmaiou na gruta! Um tropeiro te achou e te trouxe de volta pra casa.' + (lost ? ' Você perdeu ' + SE.money(lost) + ' pelo caminho.' : '') + ' Coma alguma coisa antes de descer de novo.'));
  }

  // ---------------------------------------------------------------- Bombas
  SE.placeBomb = function (tx, ty) {
    const s = SE.state, m = SE.MAPS[s.map];
    if (SE.isSolidTile(m, tx, ty) || m.id === 'vila') { SE.toast('Coloque a bomba num lugar livre.', '#e0d0b0'); return; }
    if (!m.bombs) m.bombs = [];
    if (!m.fx) m.fx = [];
    SE.invRemoveAt(s.sel, 1);
    m.bombs.push({ tx, ty, t: 2.2 });
    SE.audio.play('charge');
  };
  function explode(m, b) {
    const s = SE.state, cx = b.tx * T + 8, cy = b.ty * T + 8;
    SE.audio.play('boom');
    m.fx.push({ kind: 'boom', x: cx, y: cy, t: 0.5 });
    for (let y = b.ty - 2; y <= b.ty + 2; y++) for (let x = b.tx - 2; x <= b.tx + 2; x++) {
      if (Math.hypot(x - b.tx, y - b.ty) > 2.3) continue;
      const o = SE.objAt(m, x, y);
      if (m.id === 'mina' && 'rcfoq'.includes(o) && o) { SE.setObj(m, x, y, ''); SE.rockDrops(m, o, x, y); }
      if (m.id === 'farm' && (o === 'm' || o === 'p' || o === 'k' || o === 'b')) { SE.setObj(m, x, y, ''); if (o === 'p') SE.give('pedra', 1, true); }
    }
    (m.mons || []).forEach((mo) => { if (Math.hypot(mo.x - cx, mo.y - cy) < 42) { mo.hp -= 40; mo.hurt = 0.3; } });
    const p = SE.player;
    if (Math.hypot(p.x - cx, p.y - 6 - cy) < 40) SE.hurtPlayer(15, cx, cy);
    SE.shakeScreen = 0.35;
  }

  // ---------------------------------------------------------------- Atualização
  SE.updateMine = function (dt) {
    const s = SE.state, m = SE.MAPS[s.map], p = SE.player;
    if (p.inv > 0) p.inv -= dt;
    if (p.swingCd > 0) p.swingCd -= dt;
    if (!m || !m.fx) return;
    for (let i = m.fx.length - 1; i >= 0; i--) { m.fx[i].t -= dt; if (m.fx[i].t <= 0) m.fx.splice(i, 1); }
    for (let i = m.bombs.length - 1; i >= 0; i--) { const b = m.bombs[i]; b.t -= dt; if (b.t <= 0) { m.bombs.splice(i, 1); explode(m, b); } }
    if (m.id !== 'mina') return;
    const solidAt = (x, y) => SE.isSolidTile(m, Math.floor(x / T), Math.floor(y / T));
    for (let i = m.mons.length - 1; i >= 0; i--) {
      const mo = m.mons[i];
      if (mo.hp <= 0) {
        m.mons.splice(i, 1);
        s.stats.monstros++;
        SE.addXP('combate', mo.kind === 'lesma' ? 5 + mo.tier * 4 : 7 + mo.tier * 5);
        if (mo.kind === 'lesma' && Math.random() < 0.7) SE.give('gosma', 1);
        if (mo.kind === 'morcego' && Math.random() < 0.2) SE.give('carvao', 1);
        m.fx.push({ kind: 'poof', x: mo.x, y: mo.y - 6, t: 0.4 });
        if (!m.mons.length && !m.ladder && Math.random() < 0.5) {
          const [sx, sy] = [Math.floor(mo.x / T), Math.floor((mo.y - 4) / T)];
          if (!SE.objAt(m, sx, sy) && SE.groundAt(m, sx, sy) === 'd' && m.floor < SE.MINE_BOTTOM) { SE.setObj(m, sx, sy, 'L'); m.ladder = true; SE.toast('A escada apareceu!', '#ffe08a'); }
        }
        continue;
      }
      mo.t += dt; mo.f += dt;
      if (mo.hurt > 0) mo.hurt -= dt;
      const dx = p.x - mo.x, dy = p.y - 6 - (mo.y - 6), dist = Math.hypot(dx, dy) || 1;
      if (mo.kind === 'lesma') {
        if (mo.t > 1.1 && dist < 7 * T) { mo.t = 0; const sp = 70 + mo.tier * 15; mo.vx = (dx / dist) * sp; mo.vy = (dy / dist) * sp; }
        else if (mo.t > 2.4) { mo.t = 0; const a = Math.random() * 6.28; mo.vx = Math.cos(a) * 40; mo.vy = Math.sin(a) * 40; }
        const nx = mo.x + mo.vx * dt, ny = mo.y + mo.vy * dt;
        if (!solidAt(nx, mo.y - 2)) mo.x = nx; else mo.vx = -mo.vx * 0.5;
        if (!solidAt(mo.x, ny - 2)) mo.y = ny; else mo.vy = -mo.vy * 0.5;
        mo.vx *= Math.pow(0.08, dt); mo.vy *= Math.pow(0.08, dt);
      } else {
        const sp = 34 + mo.tier * 10;
        if (dist < 9 * T) { mo.vx += ((dx / dist) * sp - mo.vx) * dt * 2; mo.vy += ((dy / dist) * sp - mo.vy) * dt * 2; }
        mo.x += (mo.vx + Math.cos(mo.t * 3) * 20) * dt; mo.y += (mo.vy + Math.sin(mo.t * 4) * 16) * dt;
        mo.x = SE.clamp(mo.x, T, (m.w - 1) * T); mo.y = SE.clamp(mo.y, 2 * T, (m.h - 1) * T);
      }
      if (dist < 11 && mo.hurt <= 0) SE.hurtPlayer(mo.dmg, mo.x, mo.y);
    }
  };

  // ---------------------------------------------------------------- Desenho
  SE.mineDrawList = function (list, c, m, camX, camY, t) {
    (m.mons || []).forEach((mo) => list.push({ y: mo.y, d: () => {
      const fly = mo.kind === 'morcego';
      const spr = SE.monsterSprite(mo.kind, mo.tier, Math.floor(mo.f * (fly ? 8 : 3)) % 2);
      const x = Math.round(mo.x - camX), y = Math.round(mo.y - camY);
      SE.shadow(c, x, y - 1, fly ? 4 : 7, 2, fly ? 0.18 : 0.3);
      if (mo.hurt > 0 && Math.floor(mo.hurt * 30) % 2) return;
      SE.blit(c, spr, x - spr.width / 2 + 1, y - spr.height - (fly ? 14 + Math.sin(mo.t * 4) * 3 : 0) + 1);
      if (mo.hp < mo.max) { SE.px.R(c, x - 7, y - (fly ? 34 : 20), 14, 2, '#3a1010'); SE.px.R(c, x - 7, y - (fly ? 34 : 20), Math.round(14 * mo.hp / mo.max), 2, '#e8405a'); }
    } }));
    (m.bombs || []).forEach((b) => list.push({ y: b.ty * T + 14, d: () => {
      const x = b.tx * T - camX, y = b.ty * T - camY;
      SE.drawIcon(c, 'bomba', x, y);
      if (Math.floor(b.t * 8) % 2) SE.px.R(c, x + 9, y - 1, 3, 3, '#fff2b0');
    } }));
  };
  SE.drawMineFX = function (c, m, camX, camY, ui) {
    (m.fx || []).forEach((f) => {
      const x = f.x - camX, y = f.y - camY;
      if (f.kind === 'boom') {
        const r = Math.round((0.5 - f.t) * 90);
        SE.px.disc(c, x, y, r, 'rgba(255,200,80,' + f.t * 1.6 + ')');
        SE.px.disc(c, x, y, Math.max(1, r - 8), 'rgba(255,255,220,' + f.t * 1.6 + ')');
      } else if (f.kind === 'poof') {
        for (let i = 0; i < 6; i++) { const a = i * 1.05, r = (0.4 - f.t) * 40; SE.px.R(c, x + Math.cos(a) * r, y + Math.sin(a) * r, 2, 2, 'rgba(230,230,230,' + f.t * 2 + ')'); }
      }
    });
  };
  SE.drawMineNums = function (c, m, camX, camY) {
    (m.fx || []).forEach((f) => {
      if (f.kind !== 'num') return;
      SE.ui.text(c, f.text, f.x - camX, f.y - camY - (0.8 - f.t) * 14, { align: 'center', size: 10, col: f.col || '#ffffff', shadow: '#000' });
    });
  };
})(window.SE);
