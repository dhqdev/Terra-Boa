'use strict';
// Feira livre de sábado: montar a barraca, definir preços e atender a freguesia.
(function (SE) {
  const W = SE.W, H = SE.H, I = SE.input, ui = SE.ui;
  const MAX_SLOTS = 6;
  const FEIRA_CATS = { crop: 1, animal: 1, forage: 1, artisan: 1, fish: 1 };

  function priceMood(p, ref) {
    const r = p / ref;
    if (r < 0.8) return ['barato', '#2e86c1'];
    if (r <= 1.15) return ['justo', '#2a7a2a'];
    if (r <= 1.4) return ['salgado', '#d9731e'];
    return ['caro demais', '#c0392b'];
  }

  // ---------------------------------------------------------------- Montagem da barraca
  SE.FeiraSetupPanel = function () {
    const stall = [];
    let cur = 0, t = 0;
    const invRows = () => {
      const seen = {};
      SE.state.inv.forEach((it) => { if (it && FEIRA_CATS[SE.ITEMS[it.id].cat]) seen[it.id] = (seen[it.id] || 0) + it.q; });
      stall.forEach((sl) => { if (seen[sl.id] !== undefined) seen[sl.id] -= sl.q; });
      return Object.keys(seen).filter((id) => seen[id] > 0).map((id) => ({ id, q: seen[id] }));
    };
    const all = () => {
      const a = invRows().map((r) => ({ kind: 'inv', r }));
      stall.forEach((sl, i) => a.push({ kind: 'stall', i }));
      a.push({ kind: 'open' });
      return a;
    };
    const p = {
      modal: true,
      update(dt) {
        t += dt;
        const rows = all();
        if (cur >= rows.length) cur = rows.length - 1;
        if (I.take('b')) { SE.closePanel(p); SE.audio.play('back'); return; }
        if (I.take('up')) { cur = (cur + rows.length - 1) % rows.length; SE.audio.play('move'); }
        if (I.take('down')) { cur = (cur + 1) % rows.length; SE.audio.play('move'); }
        const r = rows[cur];
        if (r.kind === 'stall') {
          const step = I.shift ? 10 : 1;
          if (I.take('left')) adj(r.i, -step);
          if (I.take('right')) adj(r.i, step);
        }
        if (I.take('a')) act(r);
      },
      draw(c) {
        c.fillStyle = 'rgba(20,12,6,0.6)'; c.fillRect(0, 0, W, H);
        const x = 10, y = 8, w = W - 20, h = H - 16;
        ui.panel(c, x, y, w, h);
        ui.text(c, 'Montar a barraca', x + 10, y + 8, { size: 8, title: true, col: '#7a3a1a' });
        ui.text(c, 'Clientes esperados: ' + expected() + '   Hora: ' + SE.clock(SE.state.time), x + w - 26, y + 7, { align: 'right', col: '#2a6a2a' });
        ui.btn(c, x + w - 20, y + 6, 13, 12, 'x', { fn: () => SE.closePanel(p) });
        const rows = all();
        // Mochila
        const lx = x + 8, ly = y + 22, lw = 140;
        c.fillStyle = '#e8d4a0'; c.fillRect(lx, ly, lw, h - 58);
        ui.text(c, 'Na mochila (Espaço: pôr na barraca)', lx + 4, ly + 2, { size: 9, col: '#7a3a1a' });
        let i = 0;
        invRows().slice(0, 9).forEach((r, k) => {
          const ry = ly + 13 + k * 16, idx = i++;
          if (SE.isHover(lx, ry, lw, 15)) cur = idx;
          if (idx === cur) { c.fillStyle = 'rgba(242,201,76,0.7)'; c.fillRect(lx + 1, ry, lw - 2, 15); }
          SE.drawIcon(c, r.id, lx + 3, ry);
          ui.text(c, SE.itemName(r.id) + ' x' + r.q, lx + 21, ry + 3);
          SE.addHit(lx, ry, lw, 15, () => { cur = idx; act(all()[idx]); });
        });
        i = invRows().length;
        if (!i) ui.text(c, 'Nada mais na mochila.', lx + 4, ly + 16, { col: '#9a7a5a', size: 9 });
        // Barraca
        const sx = lx + lw + 8, sw = w - lw - 32;
        c.fillStyle = '#f8ecd0'; c.fillRect(sx, ly, sw, h - 58);
        ui.text(c, 'Sua barraca (' + stall.length + '/' + MAX_SLOTS + ')  ←/→ ajusta o preço', sx + 4, ly + 2, { size: 9, col: '#7a3a1a' });
        stall.forEach((sl, k) => {
          const ry = ly + 13 + k * 18, idx = i + k;
          if (SE.isHover(sx, ry, sw - 64, 17)) cur = idx;
          if (idx === cur) { c.fillStyle = 'rgba(242,201,76,0.7)'; c.fillRect(sx + 1, ry, sw - 2, 17); }
          SE.drawIcon(c, sl.id, sx + 3, ry + 1);
          const ref = SE.refPrice(sl.id), [mood, mc] = priceMood(sl.price, ref);
          ui.text(c, SE.itemName(sl.id) + ' x' + sl.q, sx + 21, ry + 1);
          ui.text(c, 'ref. ' + SE.money(ref) + ' · ' + mood, sx + 21, ry + 9, { size: 9, col: mc });
          ui.text(c, SE.money(sl.price), sx + sw - 70, ry + 4, { align: 'right', col: '#7a3a1a' });
          ui.btn(c, sx + sw - 66, ry + 2, 14, 13, '-', { fn: () => adj(k, -1) });
          ui.btn(c, sx + sw - 50, ry + 2, 14, 13, '+', { fn: () => adj(k, 1) });
          ui.btn(c, sx + sw - 34, ry + 2, 14, 13, '++', { fn: () => adj(k, 10), size: 9 });
          ui.btn(c, sx + sw - 18, ry + 2, 14, 13, 'x', { fn: () => { stall.splice(k, 1); SE.audio.play('back'); } });
          SE.addHit(sx, ry, sw - 70, 17, () => { cur = idx; });
        });
        if (!stall.length) ui.text(c, 'Escolha até 6 produtos na mochila.', sx + 6, ly + 18, { col: '#9a7a5a' });
        const openIdx = rows.length - 1;
        ui.btn(c, x + w / 2 - 60, y + h - 30, 120, 16, 'Abrir a barraca!', { sel: cur === openIdx, disabled: !stall.length, fn: () => act({ kind: 'open' }) });
        ui.text(c, 'Dica: preço justo vende mais; cada freguês tem seus gostos.', x + w / 2, y + h - 12, { align: 'center', size: 9, col: '#9a7a5a' });
      },
    };
    function expected() {
      const s = SE.state;
      const friends = Object.keys(s.npcs).reduce((a, k) => a + s.npcs[k].f, 0) / 1200;
      return Math.max(1, Math.round((16 + SE.feiraBonus() + friends) * (13 * 60 - s.time) / 360));
    }
    function adj(i, d) {
      const sl = stall[i];
      if (!sl) return;
      sl.price = SE.clamp(sl.price + d, 1, 9999);
      SE.audio.play('move');
    }
    function act(r) {
      if (!r) return;
      if (r.kind === 'inv') {
        if (stall.length >= MAX_SLOTS) { SE.toast('A barraca está cheia (6 produtos).', '#ffb0a0'); SE.audio.play('error'); return; }
        const ex = stall.find((sl) => sl.id === r.r.id);
        if (ex) ex.q += r.r.q;
        else stall.push({ id: r.r.id, q: Math.min(99, r.r.q), price: SE.refPrice(r.r.id) });
        SE.audio.play('select');
      } else if (r.kind === 'stall') {
        const sl = stall[r.i];
        SE.say(SE.itemName(sl.id) + ' a ' + SE.money(sl.price) + ' (referência ' + SE.money(SE.refPrice(sl.id)) + ').', { choices: [
          { t: 'Manter na barraca', fn: () => {} },
          { t: 'Tirar da barraca', fn: () => { stall.splice(stall.indexOf(sl), 1); } }] });
      } else if (r.kind === 'open') {
        if (!stall.length) { SE.audio.play('error'); return; }
        stall.forEach((sl) => SE.invRemove(sl.id, sl.q));
        SE.closePanel(p);
        SE.fadeTo(() => SE.openPanel(SE.FeiraPanel(stall, expected())));
      }
    }
    return p;
  };

  // ---------------------------------------------------------------- A feira acontecendo
  const SKINS = ['#e0ac7e', '#8d5a3b', '#c68642', '#f1c9a5', '#5c3a24', '#a8714a'];
  const HAIRS = ['#1e130c', '#3b2416', '#a0522d', '#d9d9d9', '#5a3a1a', '#e8c070'];
  const SHIRTS = ['#c0392b', '#2e86c1', '#27ae60', '#8e44ad', '#e67e22', '#16a085', '#d35d8a', '#f2c94c'];
  function visitorLook() {
    const l = { skin: SE.pick(SKINS), hair: SE.pick(HAIRS), shirt: SE.pick(SHIRTS), pants: SE.pick(['#2f4a7a', '#3a3a52', '#4a3b2a']) };
    const r = Math.random();
    if (r < 0.25) l.hat = 'palha'; else if (r < 0.4) { l.hat = 'bone'; l.hatColor = SE.pick(SHIRTS); }
    if (Math.random() < 0.45) { l.long = true; if (Math.random() < 0.5) l.dress = l.shirt; }
    return l;
  }
  const VISITOR_NAMES = ['Freguesa', 'Freguês', 'Turista', 'Moça da cidade', 'Rapaz da moto', 'Senhora de sombrinha', 'Vizinho', 'Caminhoneiro'];

  SE.FeiraPanel = function (stall, expected) {
    const s = SE.state;
    s.flags['feira' + s.day] = true;
    const end = 13 * 60;
    const arrivals = [];
    for (let i = 0; i < expected; i++) arrivals.push(SE.rand(s.time + 5, end - 25));
    arrivals.sort((a, b) => a - b);
    const npcPool = Object.keys(SE.NPCS).filter((id) => s.npcs[id].met);
    const customers = [], log = [], demand = {};
    let revenue = 0, sold = 0, speed = 1, t = 0, done = false, served = 0;
    const slotX = (i) => 96 + i * 32;

    function spawn() {
      const avail = stall.map((sl, i) => (sl.q > 0 ? i : -1)).filter((i) => i >= 0);
      if (!avail.length) return;
      let npc = null;
      if (npcPool.length && Math.random() < 0.4) {
        const free = npcPool.filter((id) => !customers.some((c) => c.npc === id));
        if (free.length) npc = SE.pick(free);
      }
      const n = npc ? SE.NPCS[npc] : null;
      const weights = avail.map((i) => {
        const id = stall[i].id;
        if (n) return n.loves.includes(id) ? 5 : n.likes.includes(id) ? 2.5 : n.dislikes.includes(id) ? 0.2 : 1;
        return SE.ITEMS[id].cat === 'artisan' ? 1.6 : 1;
      });
      let r = Math.random() * weights.reduce((a, b) => a + b, 0), want = avail[0];
      for (let k = 0; k < avail.length; k++) { r -= weights[k]; if (r <= 0) { want = avail[k]; break; } }
      const left = Math.random() < 0.5;
      customers.push({
        npc, name: n ? n.name : SE.pick(VISITOR_NAMES), look: n ? n.look : visitorLook(),
        x: left ? -20 : W + 20, y: 196 + SE.ri(-4, 4), tx: slotX(want) + 16 + SE.ri(-6, 6), want,
        st: 'in', t: 0, dir: left ? 3 : 2, bubble: null, bcol: '#3a2412',
      });
    }
    function decide(cu) {
      const sl = stall[cu.want];
      if (!sl || sl.q <= 0) { say(cu, 'Ih, acabou...', '#7a6a5a'); return; }
      const id = sl.id, ref = SE.refPrice(id);
      let pref = 1;
      if (cu.npc) { const n = SE.NPCS[cu.npc]; pref = n.loves.includes(id) ? 1.3 : n.likes.includes(id) ? 1.15 : n.dislikes.includes(id) ? 0.7 : 1; }
      const friend = cu.npc ? 1 + s.npcs[cu.npc].f / 4000 : 1;
      const wtp = ref * SE.rand(0.85, 1.3) * pref * friend * (demand[id] || 1);
      const p = sl.price;
      let q = 0, msg, col = '#3a2412';
      if (p <= wtp * 0.7) { q = Math.min(sl.q, SE.ri(2, 3)); msg = 'Que barato! Levo ' + q + '!'; col = '#2e86c1'; }
      else if (p <= wtp) { q = Math.min(sl.q, SE.ri(1, 2)); msg = SE.pick(['Vou levar!', 'Bonito, hein!', 'Me vê ' + q + ', por favor.', 'Esse tá bom!']); col = '#2a7a2a'; }
      else if (p <= wtp * 1.2) { if (Math.random() < 0.4) { q = 1; msg = 'Tá salgado... mas levo um.'; col = '#d9731e'; } else { msg = 'Hmm, tá salgado.'; col = '#d9731e'; } }
      else { msg = SE.pick(['Tá caro demais!', 'Nossa, que preço!', 'No armazém sai mais barato...']); col = '#c0392b'; }
      if (q > 0) {
        sl.q -= q; revenue += p * q; sold += q;
        demand[id] = (demand[id] || 1) * Math.pow(0.93, q);
        SE.audio.play('coin');
        if (cu.npc) s.npcs[cu.npc].f = Math.min(1000, s.npcs[cu.npc].f + 5);
        cu.paid = p * q;
      }
      say(cu, msg, col);
    }
    function say(cu, msg, col) {
      cu.bubble = msg; cu.bcol = col; cu.st = 'react'; cu.t = 0;
      log.push({ text: cu.name + ': "' + msg + '"', col });
      if (log.length > 3) log.shift();
    }
    function finish() {
      if (done) return;
      done = true;
      let back = 0;
      stall.forEach((sl) => {
        if (sl.q <= 0) return;
        const left = SE.invAdd(sl.id, sl.q);
        back += sl.q;
        if (left > 0) { const e = s.caixote.find((x) => x.id === sl.id); if (e) e.q += left; else s.caixote.push({ id: sl.id, q: left }); }
      });
      stall.forEach((sl) => {});
      Object.keys(demand).forEach((id) => SE.marketSold(id, Math.round((1 - demand[id]) * 10), 0.5));
      SE.earn(revenue);
      s.stats.feiras++; s.stats.vendidos += sold;
      s.time = Math.max(s.time, Math.min(end, s.time));
      SE.player.x = 21 * 16; SE.player.y = 11 * 16 + 14; SE.player.dir = 1;
      SE.closePanel(p);
      SE.fadeTo(() => {
        SE.say([
          'Fim de feira! Você vendeu ' + sold + (sold === 1 ? ' produto' : ' produtos') + ' e faturou ' + SE.money(revenue) + '.',
          back ? 'O que sobrou (' + back + ') voltou para a mochila.' : 'Vendeu tudo! A barraca ficou vazia.',
        ]);
        SE.checkGoals();
      });
    }
    const p = {
      modal: true, full: true,
      update(dt) {
        if (done) return;
        t += dt;
        if (I.take('a') || I.take('fast')) speed = speed === 1 ? 3 : 1;
        if (I.take('b')) {
          SE.say('Fechar a barraca agora?', { choices: [{ t: 'Fechar', fn: finish }, { t: 'Continuar vendendo', fn: () => {} }] });
          return;
        }
        const step = dt * speed;
        s.time = Math.min(end, s.time + step * 13);
        while (arrivals.length && arrivals[0] <= s.time) { arrivals.shift(); spawn(); served++; }
        customers.forEach((cu) => {
          cu.t += step;
          if (cu.st === 'in') {
            const d = cu.tx - cu.x;
            if (Math.abs(d) < 1.5) { cu.st = 'think'; cu.t = 0; cu.dir = 1; }
            else { cu.x += Math.sign(d) * Math.min(Math.abs(d), 45 * step); cu.dir = d < 0 ? 2 : 3; }
          } else if (cu.st === 'think' && cu.t > 1.2) decide(cu);
          else if (cu.st === 'react' && cu.t > 1.8) { cu.st = 'out'; cu.bubble = null; cu.dir = cu.x < W / 2 ? 2 : 3; }
          else if (cu.st === 'out') cu.x += (cu.dir === 2 ? -1 : 1) * 45 * step;
        });
        for (let i = customers.length - 1; i >= 0; i--) if (customers[i].st === 'out' && (customers[i].x < -30 || customers[i].x > W + 30)) customers.splice(i, 1);
        const empty = stall.every((sl) => sl.q <= 0);
        if ((s.time >= end || empty || !arrivals.length) && !customers.length) finish();
      },
      draw(c) {
        const ep = SE.cal().epoca, pal = SE.PAL[ep];
        const tiles = SE.buildTiles(ep);
        // céu, igreja e praça
        SE.drawPanorama(c, 0, 0, W, 60, ep, s.time, 0, { t });
        for (let y = 56; y < H; y += 16) for (let x = 0; x < W; x += 16) c.drawImage(tiles.cobble[(x / 16 + y / 16) & 1], x, y);
        SE.blit(c, SE.buildingSprite('igreja', 6, 4, 22), W / 2 - 48, -10);
        SE.blit(c, SE.objSprite('I', ep, 0), 10, 30); SE.blit(c, SE.objSprite('I', ep, 1), W - 58, 30);
        SE.blit(c, SE.buildingSprite('barraca', 2, 1, 14, '#27ae60'), 4, 92, 2);
        SE.blit(c, SE.buildingSprite('barraca', 2, 1, 14, '#2e86c1'), W - 68, 92, 2);
        // barraca do jogador
        const bx = 88, bw = 208;
        SE.px.R(c, bx + 2, 74, 4, 70, '#6b4a2a'); SE.px.R(c, bx + bw - 6, 74, 4, 70, '#6b4a2a');
        for (let x = bx; x < bx + bw; x += 8) { SE.px.R(c, x, 66, 8, 12, (x / 8) % 2 ? '#ffffff' : '#c0392b'); SE.px.R(c, x + 2, 78, 4, 3, (x / 8) % 2 ? '#ffffff' : '#c0392b'); }
        SE.drawPerson(c, SE.LOOKS[s.look], 0, 0, W / 2, 132, 1.5);
        SE.px.R(c, bx, 120, bw, 22, '#a07848'); SE.px.R(c, bx, 120, bw, 3, '#c49a6a'); SE.px.R(c, bx, 140, bw, 2, '#6b4a2a');
        SE.px.R(c, bx + 4, 142, 3, 18, '#6b4a2a'); SE.px.R(c, bx + bw - 7, 142, 3, 18, '#6b4a2a');
        stall.forEach((sl, i) => {
          const x = slotX(i) + 4;
          if (sl.q > 0) {
            SE.drawIcon(c, sl.id, x, 104, 1.5);
            if (sl.q > 1) SE.drawIcon(c, sl.id, x + 6, 108, 1.2);
          }
          SE.px.R(c, x - 1, 124, 26, 14, '#3a2412'); SE.px.R(c, x, 125, 24, 12, sl.q > 0 ? '#ffffff' : '#c8c0b0');
          ui.text(c, sl.q > 0 ? SE.money(sl.price).replace('R$ ', '$') : 'acabou', x + 12, 125, { align: 'center', size: 9, col: sl.q > 0 ? '#7a3a1a' : '#8a7a6a' });
          if (sl.q > 0) ui.text(c, 'x' + sl.q, x + 12, 131, { align: 'center', size: 8, col: '#5a5a5a' });
        });
        // fregueses
        customers.slice().sort((a, b) => a.y - b.y).forEach((cu) => {
          const fr = cu.st === 'in' || cu.st === 'out' ? (Math.floor(cu.t * 6) % 2) + 1 : 0;
          SE.drawPerson(c, cu.look, cu.dir, fr, Math.round(cu.x), Math.round(cu.y), 1.5);
          if (cu.st === 'think') { ui.text(c, '...', cu.x, cu.y - 60, { align: 'center', col: '#ffffff', shadow: '#000' }); }
          if (cu.bubble) {
            c.font = ui.font(10);
            const bw2 = c.measureText(cu.bubble).width + 10;
            const bx2 = SE.clamp(cu.x - bw2 / 2, 2, W - bw2 - 2), by = cu.y - 66;
            SE.px.R(c, bx2, by, bw2, 13, '#3a2412'); SE.px.R(c, bx2 + 1, by + 1, bw2 - 2, 11, '#ffffff');
            SE.px.R(c, cu.x - 2, by + 13, 4, 2, '#ffffff');
            ui.text(c, cu.bubble, bx2 + 5, by + 2, { col: cu.bcol });
            if (cu.paid && cu.t < 1) ui.text(c, '+' + SE.money(cu.paid), cu.x, cu.y - 78 - cu.t * 8, { align: 'center', col: '#f2c94c', shadow: '#3a2412' });
          }
        });
        // painel superior
        ui.panel(c, 4, 4, 168, 34);
        ui.text(c, 'Feira de sábado', 12, 10, { size: 7, title: true, col: '#7a3a1a' });
        ui.text(c, SE.clock(s.time) + '  ·  vendidos ' + sold + '  ·  ' + SE.money(revenue), 12, 22, { col: '#2a6a2a' });
        ui.btn(c, W - 104, 6, 48, 14, speed === 1 ? 'Acelerar' : 'Normal', { fn: () => { speed = speed === 1 ? 3 : 1; } });
        ui.btn(c, W - 54, 6, 50, 14, 'Fechar', { fn: () => { I.pressed.b = true; } });
        log.forEach((l, i) => ui.text(c, l.text, 8, H - 34 + i * 10, { col: '#ffffff', shadow: '#000', size: 9 }));
        ui.text(c, 'Espaço: acelerar · Esc: fechar a barraca', W - 6, H - 12, { align: 'right', size: 9, col: '#ffffff', shadow: '#000' });
      },
    };
    return p;
  };
})(window.SE);
