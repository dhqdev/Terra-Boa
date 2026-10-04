'use strict';
// Interface: painéis, diálogos, menus, lojas, mochila e notificações.
(function (SE) {
  const W = SE.W, H = SE.H;
  const I = SE.input;

  // ---------------------------------------------------------------- Primitivas
  SE.hits = []; SE.hitOn = true;
  SE.addHit = (x, y, w, h, fn) => { if (SE.hitOn) SE.hits.push({ x, y, w, h, fn }); };
  SE.isHover = (x, y, w, h) => SE.hitOn && !I.touch && I.mouse.x >= x && I.mouse.x < x + w && I.mouse.y >= y && I.mouse.y < y + h;
  SE.processClick = function () {
    if (!I.mouse.click) return false;
    for (let i = SE.hits.length - 1; i >= 0; i--) {
      const h = SE.hits[i];
      if (I.mouse.x >= h.x && I.mouse.x < h.x + h.w && I.mouse.y >= h.y && I.mouse.y < h.y + h.h) { I.mouse.click = false; h.fn(); return true; }
    }
    return false;
  };

  const ui = (SE.ui = {});
  ui.font = (size, title) => (title ? size + 'px ' + SE.FONT_TITLE : size + 'px ' + SE.FONT);
  ui.text = function (c, s, x, y, o) {
    o = o || {};
    c.font = ui.font(o.size || 10, o.title);
    c.textAlign = o.align || 'left';
    c.textBaseline = 'top';
    if (o.shadow) { c.fillStyle = o.shadow; c.fillText(s, x + 1, y + 1); }
    c.fillStyle = o.col || '#3a2412';
    c.fillText(s, x, y);
  };
  ui.measure = (c, s, size) => { c.font = ui.font(size || 10); return c.measureText(s).width; };
  ui.panel = function (c, x, y, w, h, o) {
    o = o || {};
    c.fillStyle = 'rgba(0,0,0,0.28)'; c.fillRect(x + 2, y + 3, w, h);
    c.fillStyle = '#3a1a08'; c.fillRect(x, y, w, h);
    c.fillStyle = o.frame || '#c26b2a'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
    c.fillStyle = '#e89a4a'; c.fillRect(x + 1, y + 1, w - 2, 1); c.fillRect(x + 1, y + 1, 1, h - 2);
    c.fillStyle = '#8a4418'; c.fillRect(x + 1, y + h - 2, w - 2, 1); c.fillRect(x + w - 2, y + 1, 1, h - 2);
    c.fillStyle = '#5a2a0a'; c.fillRect(x + 4, y + 4, w - 8, h - 8);
    c.fillStyle = o.bg || '#f8dca4'; c.fillRect(x + 5, y + 5, w - 10, h - 10);
    c.fillStyle = 'rgba(255,255,255,0.25)'; c.fillRect(x + 5, y + 5, w - 10, 1);
    c.fillStyle = 'rgba(160,90,30,0.15)'; c.fillRect(x + 5, y + h - 7, w - 10, 2);
    // rebites nos cantos
    c.fillStyle = '#f2c070';
    [[x + 2, y + 2], [x + w - 4, y + 2], [x + 2, y + h - 4], [x + w - 4, y + h - 4]].forEach(([a, b]) => c.fillRect(a, b, 2, 2));
  };
  ui.slot = function (c, x, y, w, h, o) {
    o = o || {};
    c.fillStyle = '#b8743a'; c.fillRect(x, y, w, h);
    c.fillStyle = o.dark ? '#d8b070' : '#f4d090'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
    c.fillStyle = 'rgba(120,60,20,0.25)'; c.fillRect(x + 1, y + 1, w - 2, 1); c.fillRect(x + 1, y + 1, 1, h - 2);
    if (o.sel) { c.fillStyle = '#d9342b'; c.fillRect(x - 1, y - 1, w + 2, 2); c.fillRect(x - 1, y + h - 1, w + 2, 2); c.fillRect(x - 1, y - 1, 2, h + 2); c.fillRect(x + w - 1, y - 1, 2, h + 2); }
  };
  ui.btn = function (c, x, y, w, h, label, o) {
    o = o || {};
    const hov = SE.isHover(x, y, w, h);
    const sel = o.sel || hov;
    c.fillStyle = '#3a1a08'; c.fillRect(x, y, w, h);
    c.fillStyle = o.disabled ? '#b8a080' : sel ? '#f2c94c' : '#f0c27a'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
    c.fillStyle = 'rgba(255,255,255,0.4)'; c.fillRect(x + 1, y + 1, w - 2, 1);
    c.fillStyle = 'rgba(120,50,10,0.3)'; c.fillRect(x + 1, y + h - 2, w - 2, 1);
    ui.text(c, label, x + w / 2, y + Math.floor((h - 9) / 2), { align: 'center', col: o.disabled ? '#6a5a40' : '#3a1a08', size: o.size || 10 });
    if (o.fn) SE.addHit(x, y, w, h, o.fn);
  };
  ui.heart = function (c, x, y, full) {
    const col = full ? '#e8405a' : '#c8b48a';
    c.fillStyle = col;
    c.fillRect(x + 1, y, 2, 1); c.fillRect(x + 4, y, 2, 1); c.fillRect(x, y + 1, 7, 2); c.fillRect(x + 1, y + 3, 5, 1); c.fillRect(x + 2, y + 4, 3, 1); c.fillRect(x + 3, y + 5, 1, 1);
  };
  ui.bar = function (c, x, y, w, h, f, col) {
    c.fillStyle = '#3a2412'; c.fillRect(x, y, w, h);
    c.fillStyle = '#5a4030'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
    c.fillStyle = col; c.fillRect(x + 1, y + 1, Math.round((w - 2) * SE.clamp(f, 0, 1)), h - 2);
  };
  ui.cursor = function (c, x, y, t) {
    const o = Math.round(Math.sin(t * 8));
    c.fillStyle = '#c0392b';
    c.fillRect(x + o, y, 2, 7); c.fillRect(x + 2 + o, y + 1, 1, 5); c.fillRect(x + 3 + o, y + 2, 1, 3);
  };

  // ---------------------------------------------------------------- Pilha de painéis
  SE.panels = [];
  SE.openPanel = function (p) { SE.panels.push(p); if (p.open) p.open(); return p; };
  SE.closePanel = function (p) { const i = SE.panels.indexOf(p); if (i >= 0) SE.panels.splice(i, 1); };
  SE.topPanel = () => SE.panels[SE.panels.length - 1];

  // ---------------------------------------------------------------- Notificações
  SE.toasts = [];
  SE.toast = function (text, col, icon) {
    SE.toasts.push({ text, col: col || '#ffffff', icon, t: 3 });
    if (SE.toasts.length > 4) SE.toasts.shift();
  };
  SE.drawToasts = function (c, dt, baseY) {
    let y = baseY;
    for (let i = SE.toasts.length - 1; i >= 0; i--) {
      const t = SE.toasts[i];
      t.t -= dt;
      if (t.t <= 0) { SE.toasts.splice(i, 1); continue; }
      c.globalAlpha = Math.min(1, t.t * 2);
      const w = ui.measure(c, t.text, 10) + (t.icon ? 22 : 10);
      const x = Math.round((W - w) / 2);
      c.fillStyle = 'rgba(20,12,6,0.82)'; c.fillRect(x, y - 13, w, 13);
      if (t.icon) SE.drawIcon(c, t.icon, x + 3, y - 13, 0.8);
      ui.text(c, t.text, x + (t.icon ? 18 : 5), y - 12, { col: t.col });
      c.globalAlpha = 1;
      y -= 15;
    }
  };

  // ---------------------------------------------------------------- Diálogo
  const [mcv, mctx] = SE.canvas(4, 4);
  SE.say = function (lines, opts) {
    if (!Array.isArray(lines)) lines = [lines];
    lines = lines.map((l) => (typeof l === 'string' ? { who: null, text: l } : l));
    return SE.openPanel(DialogPanel(lines, opts || {}));
  };
  function DialogPanel(lines, opts) {
    const pages = [];
    const BX = 10, BW = W - 20, BH = 76, BY = H - BH - 4, PW = 68;
    lines.forEach((l) => {
      const hasP = !!l.who;
      mctx.font = ui.font(11);
      const wrapped = SE.wrap(mctx, l.text, BW - 24 - (hasP ? PW + 4 : 0));
      for (let i = 0; i < wrapped.length; i += 5) pages.push({ who: l.who, emo: l.emo, lines: wrapped.slice(i, i + 5) });
    });
    let pi = 0, chars = 0, cur = 0, t = 0;
    const p = {
      modal: true,
      update(dt) {
        t += dt;
        const pg = pages[pi], total = pg.lines.join('').length;
        if (chars < total) {
          const before = Math.floor(chars);
          chars += dt * 70;
          if (Math.floor(chars / 3) !== Math.floor(before / 3) && pg.who) SE.audio.play('talk');
        }
        const done = chars >= total;
        const last = pi === pages.length - 1;
        if (last && done && opts.choices) {
          if (I.take('up')) { cur = (cur + opts.choices.length - 1) % opts.choices.length; SE.audio.play('move'); }
          if (I.take('down')) { cur = (cur + 1) % opts.choices.length; SE.audio.play('move'); }
          if (I.take('a')) return choose(cur);
          if (I.take('b')) return choose(opts.choices.length - 1);
          return;
        }
        if (I.take('a') || I.take('b') || (I.mouse.click && (I.mouse.click = false, true))) advance();
      },
      draw(c) {
        const pg = pages[pi];
        const x = BX, y = BY, w = BW, h = BH;
        ui.panel(c, x, y, w, h);
        const tx = x + 12;
        if (pg.who) {
          const n = SE.NPCS[pg.who];
          const px = x + w - PW - 6, py = y + 5;
          c.fillStyle = '#5a2a0a'; c.fillRect(px - 2, py, 1, h - 10);
          c.fillStyle = '#e8b878'; c.fillRect(px + 2, py + 1, PW - 4, 52);
          c.fillStyle = '#d8a060'; c.fillRect(px + 2, py + 41, PW - 4, 12);
          SE.blit(c, SE.portraitSprite(n.look, pg.emo), px + (PW - 48) / 2, py + 3);
          c.fillStyle = '#3a1a08'; c.fillRect(px + 1, py + 54, PW - 2, 13);
          c.fillStyle = '#f2c070'; c.fillRect(px + 2, py + 55, PW - 4, 11);
          ui.text(c, n.name, px + PW / 2, py + 56, { align: 'center', size: 10, col: '#3a1a08' });
        }
        let left = Math.floor(chars);
        pg.lines.forEach((ln, i) => {
          const s = ln.slice(0, Math.max(0, left));
          left -= ln.length;
          ui.text(c, s, tx, y + 9 + i * 12, { size: 11 });
        });
        const total = pg.lines.join('').length;
        if (chars >= total && !(pi === pages.length - 1 && opts.choices)) {
          const b = Math.floor(t * 3) % 2, ax = x + (pg.who ? w - PW - 20 : w - 16);
          c.fillStyle = '#d9342b'; c.fillRect(ax, y + h - 14 + b, 6, 2); c.fillRect(ax + 1, y + h - 12 + b, 4, 1); c.fillRect(ax + 2, y + h - 11 + b, 2, 1);
        }
        SE.addHit(x, y, w, h, () => advance());
        if (pi === pages.length - 1 && chars >= total && opts.choices) {
          const cw = Math.max(130, ...opts.choices.map((ch) => ui.measure(c, ch.t, 10) + 26));
          const ch = opts.choices.length * 14 + 12;
          const cx = W - cw - 12, cy = y - ch - 3;
          ui.panel(c, cx, cy, cw, ch);
          opts.choices.forEach((o, i) => {
            const ry = cy + 6 + i * 14;
            if (SE.isHover(cx, ry, cw, 14)) cur = i;
            if (i === cur) { c.fillStyle = 'rgba(242,170,60,0.45)'; c.fillRect(cx + 5, ry, cw - 10, 13); ui.cursor(c, cx + 7, ry + 3, t); }
            ui.text(c, o.t, cx + 15, ry + 2);
            SE.addHit(cx, ry, cw, 14, () => choose(i));
          });
        }
      },
    };
    function advance() {
      const pg = pages[pi], total = pg.lines.join('').length;
      if (chars < total) { chars = total; return; }
      if (pi < pages.length - 1) { pi++; chars = 0; return; }
      if (opts.choices) return;
      SE.closePanel(p);
      if (opts.onClose) opts.onClose();
    }
    function choose(i) {
      SE.audio.play('select');
      SE.closePanel(p);
      opts.choices[i].fn();
    }
    return p;
  }

  // Escolha de quantidade (comprar/vender/guardar)
  SE.qtyChoice = function (title, max, unit, cb, verb) {
    if (max <= 0) { SE.toast('Não dá: quantidade indisponível.', '#ffb0a0'); SE.audio.play('error'); return; }
    const opts = [];
    [1, 5, 10, 20].forEach((n) => { if (n < max) opts.push(n); });
    opts.push(max);
    const choices = opts.slice(-4).map((n) => ({ t: (n === max && max > 1 ? 'Tudo: ' : '') + n + (unit ? ' (' + SE.money(n * unit) + ')' : ''), fn: () => cb(n) }));
    choices.push({ t: 'Cancelar', fn: () => {} });
    SE.say(title, { choices });
  };

  // ---------------------------------------------------------------- Lista genérica com abas
  SE.ListPanel = function (o) {
    let tab = 0, cur = 0, scroll = 0, t = 0;
    const PW = o.w || 300, PH = o.h || 184;
    const p = {
      modal: true,
      rows() { return o.tabs ? o.tabs[tab].rows() : o.rows(); },
      close() { SE.closePanel(p); SE.audio.play('back'); if (o.onClose) o.onClose(); },
      update(dt) {
        t += dt;
        const rows = p.rows();
        if (I.take('b') || I.take('inv')) return p.close();
        if (o.tabs) {
          if (I.take('left') || I.take('prev')) { tab = (tab + o.tabs.length - 1) % o.tabs.length; cur = 0; scroll = 0; SE.audio.play('move'); }
          if (I.take('right') || I.take('next')) { tab = (tab + 1) % o.tabs.length; cur = 0; scroll = 0; SE.audio.play('move'); }
        }
        if (!rows.length) return;
        if (I.take('up')) { cur = (cur + rows.length - 1) % rows.length; SE.audio.play('move'); }
        if (I.take('down')) { cur = (cur + 1) % rows.length; SE.audio.play('move'); }
        if (I.wheel) { cur = SE.clamp(cur + I.wheel, 0, rows.length - 1); }
        if (I.take('a')) activate(rows[cur]);
      },
      draw(c) {
        const x = Math.round((W - PW) / 2), y = Math.round((H - PH) / 2) - 4;
        ui.panel(c, x, y, PW, PH);
        ui.text(c, o.title, x + PW / 2, y + 8, { align: 'center', size: 8, title: true, col: '#7a3a1a' });
        ui.btn(c, x + PW - 20, y + 6, 13, 12, 'x', { fn: () => p.close() });
        let ly = y + 22;
        if (o.tabs) {
          const tw = Math.floor((PW - 16) / o.tabs.length);
          o.tabs.forEach((tb, i) => {
            ui.btn(c, x + 8 + i * tw, ly, tw - 2, 13, tb.name, { sel: i === tab, fn: () => { tab = i; cur = 0; scroll = 0; SE.audio.play('move'); } });
          });
          ly += 17;
        }
        if (o.header) { o.header(c, x + 8, ly, PW - 16); ly += o.headerH || 12; }
        const rows = p.rows();
        if (cur >= rows.length) cur = Math.max(0, rows.length - 1);
        const footH = 40;
        const RH = 17;
        const vis = Math.max(1, Math.floor((y + PH - footH - ly) / RH));
        if (cur < scroll) scroll = cur;
        if (cur >= scroll + vis) scroll = cur - vis + 1;
        if (!rows.length) ui.text(c, o.empty || 'Nada por aqui.', x + PW / 2, ly + 10, { align: 'center', col: '#8a6a4a' });
        for (let i = scroll; i < Math.min(rows.length, scroll + vis); i++) {
          const r = rows[i], ry = ly + (i - scroll) * RH;
          if (SE.isHover(x + 6, ry, PW - 12, RH - 1)) cur = i;
          if (i === cur) { c.fillStyle = 'rgba(242,201,76,0.55)'; c.fillRect(x + 6, ry, PW - 12, RH - 1); ui.cursor(c, x + 8, ry + 5, t); }
          let tx = x + 14;
          if (r.icon) { SE.drawIcon(c, r.icon, tx, ry); tx += 18; }
          ui.text(c, r.label, tx, ry + 3, { col: r.disabled ? '#9a8a6a' : '#3a2412' });
          if (r.right) ui.text(c, r.right, x + PW - 12, ry + 3, { align: 'right', col: r.rightCol || (r.disabled ? '#9a8a6a' : '#7a3a1a') });
          if (r.bar !== undefined) ui.bar(c, x + PW - 92, ry + 12, 80, 4, r.bar, '#6ab04a');
          SE.addHit(x + 6, ry, PW - 12, RH - 1, () => { cur = i; activate(r); });
        }
        if (rows.length > vis) {
          const sh = (PH - footH - (ly - y)) * (vis / rows.length);
          const sy = ly + ((PH - footH - (ly - y) - sh) * scroll) / Math.max(1, rows.length - vis);
          c.fillStyle = '#c4884a'; c.fillRect(x + PW - 7, sy, 2, sh);
        }
        // descrição + rodapé
        c.fillStyle = '#e8d4a0'; c.fillRect(x + 6, y + PH - footH - 2, PW - 12, footH - 14);
        const r = rows[cur];
        if (r && r.sub) {
          c.font = ui.font(10);
          SE.wrap(c, r.sub, PW - 20).slice(0, 2).forEach((ln, i) => ui.text(c, ln, x + 10, y + PH - footH + i * 10, { col: '#5a3a1e' }));
        }
        const foot = o.footer ? o.footer() : 'Dinheiro: ' + SE.money(SE.state.money);
        ui.text(c, foot, x + PW - 10, y + PH - 15, { align: 'right', col: '#2a6a2a', size: 10 });
        if (o.tabs) ui.text(c, '←/→: trocar aba', x + 10, y + PH - 15, { col: '#9a7a5a', size: 9 });
      },
    };
    function activate(r) {
      if (!r) return;
      if (r.disabled) { SE.audio.play('error'); if (r.why) SE.toast(r.why, '#ffb0a0'); return; }
      if (r.fn) { SE.audio.play('select'); r.fn(); }
    }
    return p;
  };

  // ---------------------------------------------------------------- Armazém do Seu Jorge
  SE.ShopPanel = function () {
    const s = () => SE.state;
    const buy = (id, price) => SE.qtyChoice('Quantos ' + SE.ITEMS[id].name + '?', Math.min(Math.floor(s().money / price), SE.invSpace(id), 99), price, (n) => {
      s().money -= n * price; SE.give(id, n); SE.audio.play('coin');
    });
    const sellRows = () => {
      const seen = {};
      s().inv.forEach((it) => { if (it && SE.isSellable(it.id)) seen[it.id] = (seen[it.id] || 0) + it.q; });
      return Object.keys(seen).map((id) => ({
        label: SE.itemName(id) + ' x' + seen[id], icon: id, right: SE.money(SE.jorgePrice(id)) + '/un',
        sub: 'Seu Jorge paga ' + SE.money(SE.jorgePrice(id)) + '. Preço de mercado: ' + SE.money(SE.refPrice(id)) + ' (na feira você ganha mais!)',
        fn: () => SE.qtyChoice('Vender quantos?', SE.invCount(id), SE.jorgePrice(id), (n) => {
          if (!SE.invRemove(id, n)) return;
          const v = SE.jorgePrice(id) * n; SE.earn(v); SE.marketSold(id, n); s().stats.vendidos += n; SE.audio.play('coin');
          SE.toast('Vendeu ' + n + ' ' + SE.itemName(id) + ' por ' + SE.money(v), '#bff0a0');
        }),
      }));
    };
    return SE.ListPanel({
      title: 'Armazém do Seu Jorge', w: 320, h: 190,
      tabs: [
        { name: 'Sementes', rows: () => {
          const ep = SE.cal().epoca;
          const rows = Object.keys(SE.ITEMS).filter((id) => SE.ITEMS[id].cat === 'seed').map((id) => {
            const it = SE.ITEMS[id], ok = SE.CROPS[it.crop].epocas.includes(ep);
            return { label: it.name, icon: id, right: SE.money(it.price), disabled: !ok, why: 'Fora de época. Seu Jorge só vende o que dá pra plantar agora.',
              sub: it.desc, fn: () => buy(id, it.price) };
          });
          rows.sort((a, b) => a.disabled - b.disabled);
          rows.push({ label: 'Ração (1 dia de um bicho)', icon: 'racao', right: SE.money(8), sub: SE.ITEMS.racao.desc + ' Na seca o pasto some!', fn: () => buy('racao', 8) });
          rows.push({ label: 'Colmeia', icon: 'colmeia', right: SE.money(350), sub: SE.ITEMS.colmeia.desc, fn: () => buy('colmeia', 350) });
          return rows;
        } },
        { name: 'Animais', rows: () => Object.keys(SE.ANIMALS).map((k) => {
          const a = SE.ANIMALS[k], n = s().animals.filter((x) => x.kind === k).length;
          return { label: a.name + (n ? ' (você tem ' + n + ')' : ''), icon: a.product, right: SE.money(a.price),
            sub: 'Produz ' + SE.ITEMS[a.product].name.toLowerCase() + ' todo dia se estiver alimentado. Faça carinho para aumentar a afeição.',
            fn: () => SE.say('Comprar ' + a.name.toLowerCase() + ' por ' + SE.money(a.price) + '?', { choices: [{ t: 'Comprar', fn: () => SE.buyAnimal(k) }, { t: 'Cancelar', fn: () => {} }] }) };
        }) },
        { name: 'Obras', rows: () => SE.OBRAS.map((ob) => {
          const done = ob.done(s());
          return { label: ob.name, icon: null, right: done ? 'FEITO' : SE.money(ob.price), rightCol: done ? '#2a7a2a' : null, disabled: done, sub: ob.desc,
            fn: () => {
              if (s().money < ob.price) { SE.toast('Dinheiro insuficiente.', '#ffb0a0'); SE.audio.play('error'); return; }
              SE.say(ob.name + ' por ' + SE.money(ob.price) + '?', { choices: [{ t: 'Fechar negócio', fn: () => { s().money -= ob.price; ob.apply(s()); SE.audio.play('goal'); SE.toast(ob.name + ': pronto!', '#bff0a0'); SE.checkGoals(); } }, { t: 'Cancelar', fn: () => {} }] });
            } };
        }) },
        { name: 'Vender', rows: sellRows },
      ],
      empty: 'Nada para vender na mochila.',
    });
  };

  SE.FoodPanel = function (kind, title) {
    return SE.ListPanel({
      title: title, w: 300, h: 130,
      rows: () => SE.FOOD[kind].map((f) => ({
        label: f.name, right: SE.money(f.price), sub: 'Recupera ' + f.energy + ' de energia. Energia: ' + Math.round(SE.state.energy) + '/' + SE.state.maxEnergy,
        fn: () => {
          const s = SE.state;
          if (s.money < f.price) { SE.toast('Dinheiro insuficiente.', '#ffb0a0'); SE.audio.play('error'); return; }
          s.money -= f.price; s.energy = Math.min(s.maxEnergy, s.energy + f.energy);
          SE.audio.play('harvest'); SE.toast('Que delícia! +' + f.energy + ' energia', '#ffe08a');
        },
      })).concat(kind === 'bar' ? [{ label: 'Isca para pescar (5)', icon: 'isca', right: SE.money(25), sub: 'O Zé vende minhoca boa: o peixe morde em metade do tempo.',
        fn: () => { const s = SE.state; if (s.money < 25) { SE.toast('Dinheiro insuficiente.', '#ffb0a0'); return; } s.money -= 25; SE.give('isca', 5); SE.audio.play('coin'); } }] : []),
    });
  };

  SE.CaixotePanel = function () {
    const s = () => SE.state;
    return SE.ListPanel({
      title: 'Caixote do Seu Jorge', w: 300, h: 180,
      tabs: [
        { name: 'Mochila', rows: () => {
          const seen = {};
          s().inv.forEach((it) => { if (it && SE.isSellable(it.id)) seen[it.id] = (seen[it.id] || 0) + it.q; });
          return Object.keys(seen).map((id) => ({ label: SE.itemName(id) + ' x' + seen[id], icon: id, right: SE.money(SE.jorgePrice(id)) + '/un',
            sub: 'O caminhão do Seu Jorge passa de madrugada e paga o preço do armazém.',
            fn: () => SE.qtyChoice('Colocar quantos no caixote?', SE.invCount(id), SE.jorgePrice(id), (n) => {
              if (!SE.invRemove(id, n)) return;
              const e = s().caixote.find((x) => x.id === id);
              if (e) e.q += n; else s().caixote.push({ id, q: n });
              SE.audio.play('plant');
            }) }));
        } },
        { name: 'No caixote', rows: () => s().caixote.map((it) => ({ label: SE.itemName(it.id) + ' x' + it.q, icon: it.id, right: SE.money(SE.jorgePrice(it.id) * it.q),
          sub: 'Escolha para tirar do caixote.',
          fn: () => { const left = SE.invAdd(it.id, it.q); it.q = left; s().caixote = s().caixote.filter((x) => x.q > 0); SE.audio.play('select'); } })) },
      ],
      footer: () => 'No caixote: ' + SE.money(s().caixote.reduce((a, it) => a + SE.jorgePrice(it.id) * it.q, 0)),
      empty: 'Vazio.',
    });
  };

  SE.StationPanel = function (stId) {
    const def = SE.STATIONS[stId];
    return SE.ListPanel({
      title: def.name, w: 320, h: 190,
      header: (c, x, y, w) => {
        const st = SE.state.stations[stId];
        ui.text(c, 'Vagas: ' + (SE.STATION_SLOTS - st.slots.length) + '/' + SE.STATION_SLOTS + '   ' + st.slots.map((sl) => SE.itemName(SE.RECIPES[sl.r].out) + (sl.d > 0 ? ' (' + sl.d + 'd)' : ' (pronto)')).join(', '), x, y, { col: '#7a3a1a' });
      },
      headerH: 13,
      rows: () => Object.keys(SE.RECIPES).filter((k) => SE.RECIPES[k].st === stId).map((k) => {
        const r = SE.RECIPES[k], full = SE.state.stations[stId].slots.length >= SE.STATION_SLOTS, ok = SE.recipeOk(k);
        return { label: SE.itemName(r.out), icon: r.out, right: 'vale ' + SE.money(SE.basePrice(r.out)),
          sub: SE.recipeText(k) + ' · fica pronto em ' + r.days + (r.days > 1 ? ' dias' : ' dia') + '.',
          disabled: full || !ok, why: full ? 'Todas as vagas ocupadas. Espere ficar pronto.' : 'Faltam ingredientes: ' + SE.recipeText(k),
          fn: () => SE.startRecipe(stId, k) };
      }),
    });
  };

  SE.MuralPanel = function () {
    return SE.ListPanel({
      title: 'Mural da comunidade', w: 320, h: 150,
      header: (c, x, y) => ui.text(c, 'Juntos a gente reergue a serra! Contribua com o que puder.', x, y, { col: '#7a3a1a' }),
      headerH: 13,
      rows: () => SE.PROJECTS.map((p) => {
        const s = SE.state, done = s.projDone[p.id], prev = SE.PROJECTS[SE.PROJECTS.indexOf(p) - 1];
        const locked = prev && !s.projDone[prev.id];
        return { label: p.name, right: done ? 'CONCLUÍDO' : SE.money(s.proj[p.id]) + ' / ' + SE.money(p.cost), rightCol: done ? '#2a7a2a' : null,
          sub: locked ? 'Conclua antes: ' + prev.name + '.' : p.desc, disabled: done || locked, why: locked ? 'Um passo de cada vez: conclua ' + prev.name + '.' : null,
          fn: () => {
            const falta = p.cost - s.proj[p.id];
            const ch = [100, 500, 1000].filter((v) => v < falta && v <= s.money).map((v) => ({ t: 'Doar ' + SE.money(v), fn: () => SE.contribute(p.id, v) }));
            if (s.money >= falta) ch.push({ t: 'Completar: ' + SE.money(falta), fn: () => SE.contribute(p.id, falta) });
            else if (s.money > 0) ch.push({ t: 'Doar tudo: ' + SE.money(s.money), fn: () => SE.contribute(p.id, s.money) });
            ch.push({ t: 'Cancelar', fn: () => {} });
            SE.say(p.name + ': faltam ' + SE.money(falta) + '.', { choices: ch });
          } };
      }),
    });
  };

  // ---------------------------------------------------------------- Menu do jogo (abas)
  const TABS = ['Mochila', 'Habilidades', 'Amizades', 'Criação', 'Caderno', 'Opções'];
  SE.GameMenu = function (startTab) {
    let tab = startTab || 0, t = 0, cur = SE.state.sel, held = -1, scroll = 0, ccur = 0, ocur = 0;
    const PW = 348, PH = 186;
    const X = Math.round((W - PW) / 2), Y = 22;
    const p = { modal: true, isMenu: true };
    const close = () => { held = -1; SE.closePanel(p); SE.audio.play('back'); };
    const opts = () => [
      { t: 'Salvar jogo', fn: () => SE.saveGame(false) },
      { t: 'Música: ' + (SE.audio.music ? 'ligada' : 'desligada'), fn: () => SE.audio.toggleMusic() },
      { t: 'Como jogar', fn: () => SE.openPanel(SE.HelpPanel()) },
      { t: 'Cotações do mercado', fn: () => SE.openPanel(SE.MarketPanel()) },
      { t: 'Sair para a tela inicial', fn: () => SE.say('Salvar antes de sair?', { choices: [
        { t: 'Salvar e sair', fn: () => { SE.saveGame(true); SE.panels.length = 0; SE.setScene(SE.TitleScene()); } },
        { t: 'Sair sem salvar', fn: () => { SE.panels.length = 0; SE.setScene(SE.TitleScene()); } },
        { t: 'Cancelar', fn: () => {} }] }) },
    ];
    const setTab = (i) => { tab = (i + TABS.length) % TABS.length; scroll = 0; SE.audio.play('move'); };
    p.update = function (dt) {
      t += dt;
      if (I.take('b') || I.take('inv')) return close();
      if (I.take('prev')) setTab(tab - 1);
      if (I.take('next')) setTab(tab + 1);
      const s = SE.state;
      if (tab === 0) {
        const n = SE.INV_SIZE, C = 12;
        if (I.take('left')) { cur = (cur + n - 1) % n; SE.audio.play('move'); }
        if (I.take('right')) { cur = (cur + 1) % n; SE.audio.play('move'); }
        if (I.take('up')) { cur = (cur + n - C) % n; SE.audio.play('move'); }
        if (I.take('down')) { cur = (cur + C) % n; SE.audio.play('move'); }
        for (let i = 1; i <= 12; i++) if (I.take('h' + i)) { const tmp = s.inv[i - 1]; s.inv[i - 1] = s.inv[cur]; s.inv[cur] = tmp; SE.audio.play('select'); }
        if (I.take('a')) pick(cur);
      } else if (tab === 3) {
        const n = SE.CRAFT.length;
        if (I.take('left')) ccur = (ccur + n - 1) % n;
        if (I.take('right')) ccur = (ccur + 1) % n;
        if (I.take('up')) ccur = Math.max(0, ccur - 6);
        if (I.take('down')) ccur = Math.min(n - 1, ccur + 6);
        if (I.take('a')) SE.craft(SE.CRAFT[ccur]);
      } else if (tab === 5) {
        const o = opts();
        if (I.take('up')) { ocur = (ocur + o.length - 1) % o.length; SE.audio.play('move'); }
        if (I.take('down')) { ocur = (ocur + 1) % o.length; SE.audio.play('move'); }
        if (I.take('a')) { SE.audio.play('select'); o[ocur].fn(); }
      } else {
        if (I.take('left')) setTab(tab - 1);
        if (I.take('right')) setTab(tab + 1);
        if (I.take('up') || I.wheel < 0) scroll = Math.max(0, scroll - 1);
        if (I.take('down') || I.wheel > 0) scroll++;
      }
    };
    p.draw = function (c) {
      const s = SE.state;
      c.fillStyle = 'rgba(10,6,20,0.45)'; c.fillRect(0, 0, W, H);
      // abas
      const tw = 56;
      TABS.forEach((nm, i) => {
        const tx = X + 6 + i * (tw + 1), ty = Y - 15 + (i === tab ? 0 : 3);
        c.fillStyle = '#3a1a08'; c.fillRect(tx, ty, tw, 18);
        c.fillStyle = i === tab ? '#f8dca4' : '#c26b2a'; c.fillRect(tx + 1, ty + 1, tw - 2, 17);
        c.fillStyle = i === tab ? '#ffffff' : '#e89a4a'; c.fillRect(tx + 1, ty + 1, tw - 2, 1);
        ui.text(c, nm, tx + tw / 2, ty + 4, { align: 'center', size: 10, col: i === tab ? '#7a3a1a' : '#3a1a08' });
        SE.addHit(tx, ty, tw, 16, () => setTab(i));
      });
      ui.panel(c, X, Y, PW, PH);
      [drawInv, drawSkills, drawFriends, drawCraft, drawNotes, drawOpts][tab](c, s);
      ui.btn(c, X + PW - 18, Y + 6, 12, 12, 'x', { fn: close });
      if (held >= 0 && s.inv[held] && !I.touch && I.mouse.x >= 0) SE.drawIcon(c, s.inv[held].id, SE.clamp(I.mouse.x - 8, 0, W - 16), SE.clamp(I.mouse.y - 8, 0, H - 16));
    };

    // ------ Mochila
    function drawInv(c, s) {
      const SZ = 19, gx = X + 12, gy = Y + 12;
      for (let i = 0; i < SE.INV_SIZE; i++) {
        const cx = gx + (i % 12) * SZ, cy = gy + Math.floor(i / 12) * SZ + (i >= 12 ? 3 : 0);
        if (SE.isHover(cx, cy, SZ - 1, SZ - 1)) cur = i;
        ui.slot(c, cx, cy, SZ - 1, SZ - 1, { sel: i === cur, dark: i >= 12 });
        const it = s.inv[i];
        if (it && i !== held) {
          SE.drawIcon(c, it.id, cx + 1, cy + 1);
          if (it.q > 1) ui.text(c, String(it.q), cx + SZ - 2, cy + SZ - 11, { align: 'right', col: '#ffffff', shadow: '#3a1a08', size: 9 });
        }
        if (i === held) { c.fillStyle = 'rgba(217,52,43,0.25)'; c.fillRect(cx + 1, cy + 1, SZ - 3, SZ - 3); }
        if (i === s.sel) { c.fillStyle = '#f2c94c'; c.fillRect(cx + 2, cy + SZ - 3, SZ - 5, 1); }
        if (i < 12) ui.text(c, ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='][i], cx + 2, cy + 1, { size: 8, col: 'rgba(90,42,10,0.55)' });
        SE.addHit(cx, cy, SZ - 1, SZ - 1, () => { cur = i; pick(i); });
      }
      // ficha do jogador
      const fx = X + 250, fy = Y + 10;
      c.fillStyle = '#e8b878'; c.fillRect(fx, fy, 88, 62);
      SE.blit(c, SE.portraitSprite(SE.LOOKS[s.look], 'h'), fx + 4, fy + 4);
      ui.text(c, s.name, fx + 56, fy + 6, { size: 10, col: '#7a3a1a' });
      ui.text(c, SE.money(s.money), fx + 56, fy + 18, { size: 9, col: '#2a6a2a' });
      ui.text(c, 'E ' + Math.round(s.energy) + '/' + s.maxEnergy, fx + 56, fy + 30, { size: 9, col: '#3a6a1a' });
      ui.text(c, 'V ' + Math.round(s.hp) + '/' + s.maxHp, fx + 56, fy + 40, { size: 9, col: '#a02a2a' });
      ui.text(c, 'Água ' + s.water + '/' + s.waterMax, fx + 6, fy + 52, { size: 9, col: '#2a5a9a' });
      // descrição
      const dy = Y + 76;
      c.fillStyle = '#efc888'; c.fillRect(X + 10, dy, PW - 20, PH - (dy - Y) - 10);
      const it = s.inv[cur];
      if (it) {
        const def = SE.ITEMS[it.id];
        SE.drawIcon(c, it.id, X + 14, dy + 6, 2);
        ui.text(c, SE.itemName(it.id) + (it.q > 1 ? ' x' + it.q : ''), X + 52, dy + 4, { col: '#7a3a1a', size: 11 });
        c.font = ui.font(10);
        SE.wrap(c, def.desc || '', PW - 140).slice(0, 4).forEach((ln, i) => ui.text(c, ln, X + 52, dy + 17 + i * 10, { col: '#5a3a1e' }));
        const info = [];
        if (SE.isSellable(it.id)) info.push('Mercado: ' + SE.money(SE.refPrice(it.id)));
        if (def.eat) info.push('Energia +' + def.eat + '  Vida +' + Math.round(def.eat * 0.45));
        ui.text(c, info.join('   '), X + 52, dy + 60, { col: '#2a6a2a', size: 9 });
        const bx = X + PW - 82;
        if (def.eat) ui.btn(c, bx, dy + 6, 68, 14, 'Comer', { fn: () => SE.eat(it.id) });
        if (cur >= 12) ui.btn(c, bx, dy + 24, 68, 14, 'Pôr na mão', { fn: () => { const tmp = s.inv[s.sel]; s.inv[s.sel] = s.inv[cur]; s.inv[cur] = tmp; SE.audio.play('select'); } });
        else ui.btn(c, bx, dy + 24, 68, 14, 'Segurar', { fn: () => { s.sel = cur; close(); } });
        if (!SE.isTool(it.id)) ui.btn(c, bx, dy + 42, 68, 14, 'Jogar fora', { fn: () => SE.say('Jogar fora ' + SE.itemName(it.id) + ' x' + it.q + '?', { choices: [{ t: 'Jogar fora', fn: () => { if (s.inv[cur] === it) s.inv[cur] = null; SE.audio.play('cut'); } }, { t: 'Cancelar', fn: () => {} }] }) });
      } else ui.text(c, held >= 0 ? 'Escolha onde colocar.' : 'Espaço vazio.', X + 52, dy + 8, { col: '#9a7a5a' });
      ui.text(c, held >= 0 ? 'Espaço: soltar aqui' : 'Espaço: pegar/mover  ·  1-0: pôr na barra', X + 14, Y + PH - 18, { size: 9, col: '#9a6a3a' });
    }
    function pick(i) {
      const s = SE.state;
      if (held >= 0) {
        const a = s.inv[held], b = s.inv[i];
        if (a && b && a.id === b.id && i !== held && !SE.isTool(a.id)) {
          const n = Math.min(a.q, 99 - b.q); b.q += n; a.q -= n; if (a.q <= 0) s.inv[held] = null;
        } else { s.inv[held] = b; s.inv[i] = a; }
        held = -1; SE.audio.play('select');
        return;
      }
      if (s.inv[i]) { held = i; SE.audio.play('select'); }
    }

    // ------ Habilidades
    function drawSkills(c, s) {
      SE.SKILLS.forEach((sk, i) => {
        const ry = Y + 12 + i * 33, lv = s.lvl[sk.id] || 0, xp = s.xp[sk.id] || 0;
        c.fillStyle = i % 2 ? '#f2d098' : '#efc888'; c.fillRect(X + 8, ry - 2, PW - 16, 32);
        SE.drawIcon(c, sk.icon, X + 14, ry + 6, 1);
        ui.text(c, sk.name, X + 36, ry, { size: 11, col: '#7a3a1a' });
        ui.text(c, 'Nível ' + lv, X + 120, ry + 1, { size: 10, col: '#3a1a08' });
        for (let j = 0; j < 10; j++) {
          const px = X + 170 + j * 16;
          c.fillStyle = '#5a2a0a'; c.fillRect(px, ry + 1, 13, 9);
          c.fillStyle = j < lv ? (j === 4 || j === 9 ? '#f28a2a' : '#f2c94c') : '#c8a070'; c.fillRect(px + 1, ry + 2, 11, 7);
          if (j < lv) { c.fillStyle = '#fff2b0'; c.fillRect(px + 1, ry + 2, 11, 1); }
        }
        const prev = lv ? SE.XP_LV[lv - 1] : 0, next = SE.XP_LV[lv];
        if (next) ui.bar(c, X + 170, ry + 13, 158, 4, (xp - prev) / (next - prev), '#6ab04a');
        c.font = ui.font(9);
        ui.text(c, SE.wrap(c, sk.perk, 280)[0], X + 36, ry + 19, { size: 9, col: '#7a5a3a' });
        if (next) ui.text(c, xp + '/' + next + ' xp', X + 120, ry + 11, { size: 9, col: '#9a6a3a' });
      });
    }

    // ------ Amizades
    function drawFriends(c, s) {
      const ids = Object.keys(SE.NPCS);
      const RH = 24, vis = 7;
      scroll = SE.clamp(scroll, 0, Math.max(0, ids.length - vis));
      ids.slice(scroll, scroll + vis).forEach((id, k) => {
        const n = SE.NPCS[id], st = s.npcs[id], ry = Y + 10 + k * RH;
        c.fillStyle = k % 2 ? '#f2d098' : '#efc888'; c.fillRect(X + 8, ry, PW - 16, RH - 2);
        if (st.met) SE.blit(c, SE.portraitSprite(n.look, 'n'), X + 10, ry + 1, 0.42);
        else { c.fillStyle = '#7a5a3a'; c.fillRect(X + 12, ry + 2, 17, 18); ui.text(c, '?', X + 20, ry + 6, { align: 'center', col: '#f8dca4' }); }
        ui.text(c, st.met ? n.name : '???', X + 36, ry + 2, { size: 10, col: '#7a3a1a' });
        ui.text(c, st.met ? n.role : 'Ainda não conhece', X + 36, ry + 12, { size: 9, col: '#9a6a3a' });
        const hs = SE.hearts(st.f);
        for (let j = 0; j < 10; j++) ui.heart(c, X + 150 + j * 9, ry + 4, j < hs);
        ui.text(c, st.gift === s.day ? 'presente: ok' : 'presente: -', X + 248, ry + 2, { size: 9, col: st.gift === s.day ? '#2a7a2a' : '#9a7a5a' });
        ui.text(c, st.talk === s.day ? 'conversa: ok' : 'conversa: -', X + 248, ry + 11, { size: 9, col: st.talk === s.day ? '#2a7a2a' : '#9a7a5a' });
        if (st.met) SE.addHit(X + 8, ry, PW - 16, RH - 2, () => SE.toast(n.name + ' adora: ' + n.loves.map((x) => SE.ITEMS[x].name).join(', '), '#ffd0e0'));
      });
      if (ids.length > vis) {
        ui.btn(c, X + PW - 20, Y + 22, 12, 12, '▲', { size: 8, fn: () => { scroll = Math.max(0, scroll - 1); } });
        ui.btn(c, X + PW - 20, Y + PH - 26, 12, 12, '▼', { size: 8, fn: () => { scroll++; } });
      }
    }

    // ------ Criação
    function drawCraft(c, s) {
      const SZ = 26;
      ui.text(c, 'Receitas', X + 12, Y + 8, { size: 10, col: '#7a3a1a' });
      SE.CRAFT.forEach((r, i) => {
        const cx = X + 12 + (i % 6) * (SZ + 2), cy = Y + 22 + Math.floor(i / 6) * (SZ + 2);
        const un = SE.craftUnlocked(r), ok = un && SE.craftOk(r);
        if (SE.isHover(cx, cy, SZ, SZ)) ccur = i;
        ui.slot(c, cx, cy, SZ, SZ, { sel: i === ccur, dark: !ok });
        if (un) { SE.drawIcon(c, r.id, cx + 5, cy + 5); if (!ok) { c.fillStyle = 'rgba(240,200,140,0.5)'; c.fillRect(cx + 1, cy + 1, SZ - 2, SZ - 2); } }
        else ui.text(c, '?', cx + SZ / 2, cy + 8, { align: 'center', col: '#9a6a3a', size: 11 });
        SE.addHit(cx, cy, SZ, SZ, () => { if (ccur === i) SE.craft(r); ccur = i; });
      });
      const r = SE.CRAFT[ccur], un = SE.craftUnlocked(r);
      const dx = X + 186, dy = Y + 10, dw = PW - 196;
      c.fillStyle = '#efc888'; c.fillRect(dx, dy, dw, PH - 20);
      ui.text(c, un ? SE.ITEMS[r.id].name + (r.n > 1 ? ' x' + r.n : '') : '???', dx + 6, dy + 4, { size: 11, col: '#7a3a1a' });
      c.font = ui.font(9);
      SE.wrap(c, un ? SE.ITEMS[r.id].desc : SE.craftReqText(r), dw - 12).slice(0, 3).forEach((ln, i) => ui.text(c, ln, dx + 6, dy + 18 + i * 9, { size: 9, col: '#5a3a1e' }));
      if (un) {
        Object.keys(r.inp).forEach((k, i) => {
          const have = SE.invCount(k), need = r.inp[k], ry = dy + 50 + i * 17;
          SE.drawIcon(c, k, dx + 6, ry);
          ui.text(c, SE.ITEMS[k].name, dx + 26, ry + 3, { size: 10 });
          ui.text(c, have + '/' + need, dx + dw - 8, ry + 3, { align: 'right', size: 10, col: have >= need ? '#2a7a2a' : '#c0392b' });
        });
        ui.btn(c, dx + dw / 2 - 30, dy + PH - 42, 60, 15, 'Criar', { disabled: !SE.craftOk(r), fn: () => SE.craft(r) });
      }
      ui.text(c, 'Novas receitas chegam com os níveis de habilidade.', X + 12, Y + PH - 18, { size: 9, col: '#9a6a3a' });
    }

    // ------ Caderno (objetivos e jornal)
    function drawNotes(c, s) {
      ui.text(c, 'Objetivos', X + 12, Y + 8, { size: 10, col: '#7a3a1a' });
      const vis = 9;
      scroll = SE.clamp(scroll, 0, Math.max(0, SE.OBJECTIVES.length - vis));
      c.font = ui.font(9);
      SE.OBJECTIVES.slice(scroll, scroll + vis).forEach((o, k) => {
        const i = k + scroll, ry = Y + 22 + k * 16;
        const done = i < s.goal, now = i === s.goal;
        c.fillStyle = now ? '#f2c94c' : k % 2 ? '#f2d098' : '#efc888'; c.fillRect(X + 8, ry, 196, 15);
        ui.text(c, done ? '✓' : now ? '!' : '·', X + 13, ry + 3, { col: done ? '#2a7a2a' : '#c0392b' });
        ui.text(c, SE.wrap(c, o.t, 176)[0], X + 22, ry + 3, { size: 9, col: done ? '#8a7a5a' : i > s.goal ? '#a08a6a' : '#3a1a08' });
      });
      const nx = X + 212, nw = PW - 222;
      c.fillStyle = '#efe8d8'; c.fillRect(nx, Y + 10, nw, PH - 20);
      ui.text(c, 'O Eco da Serra', nx + nw / 2, Y + 14, { align: 'center', size: 7, title: true, col: '#1a1a1a' });
      c.fillStyle = '#1a1a1a'; c.fillRect(nx + 6, Y + 26, nw - 12, 1);
      c.font = ui.font(10);
      if (s.news) {
        const n = SE.NEWS[s.news.i];
        let yy = Y + 30;
        SE.wrap(c, n.title, nw - 12).forEach((ln) => { ui.text(c, ln, nx + 6, yy, { size: 10, col: '#1a1a1a' }); yy += 10; });
        c.font = ui.font(9);
        SE.wrap(c, n.text, nw - 12).slice(0, 7).forEach((ln) => { ui.text(c, ln, nx + 6, yy + 2, { size: 9, col: '#4a4a4a' }); yy += 9; });
      } else ui.text(c, 'Jornal novo toda segunda.', nx + 6, Y + 32, { size: 9, col: '#4a4a4a' });
      ui.btn(c, nx + 8, Y + PH - 30, nw - 16, 14, 'Cotações', { fn: () => SE.openPanel(SE.MarketPanel()) });
    }

    // ------ Opções
    function drawOpts(c) {
      const o = opts();
      o.forEach((op, i) => {
        const by = Y + 24 + i * 24;
        if (SE.isHover(X + PW / 2 - 90, by, 180, 18)) ocur = i;
        ui.btn(c, X + PW / 2 - 90, by, 180, 18, op.t, { sel: i === ocur, fn: () => { ocur = i; op.fn(); } });
      });
      ui.text(c, 'O jogo salva sozinho toda noite ao dormir.', X + PW / 2, Y + PH - 20, { align: 'center', size: 9, col: '#9a6a3a' });
    }
    return p;
  };
  SE.InventoryPanel = () => SE.GameMenu(0);
  SE.PauseMenu = () => SE.GameMenu(0);

  // ---------------------------------------------------------------- Baú
  SE.ChestPanel = function (key) {
    const s = SE.state;
    if (!s.chests[key]) s.chests[key] = new Array(SE.INV_SIZE).fill(null);
    let cur = 0, t = 0;
    const SZ = 19, PW = 12 * SZ + 24, PH = 172;
    const p = { modal: true };
    const slotOf = (i) => (i < 36 ? [s.chests[key], i] : [s.inv, i - 36]);
    function move(i) {
      const [from, fi] = slotOf(i), it = from[fi];
      if (!it) return;
      const to = i < 36 ? s.inv : s.chests[key];
      let q = it.q;
      if (!SE.isTool(it.id)) to.forEach((x) => { if (q > 0 && x && x.id === it.id && x.q < 99) { const n = Math.min(q, 99 - x.q); x.q += n; q -= n; } });
      for (let k = 0; k < to.length && q > 0; k++) if (!to[k]) { to[k] = { id: it.id, q }; q = 0; }
      if (q === it.q) { SE.toast('Sem espaço do outro lado.', '#ffb0a0'); SE.audio.play('error'); return; }
      if (q > 0) it.q = q; else from[fi] = null;
      SE.audio.play('select');
    }
    p.update = function (dt) {
      t += dt;
      if (I.take('b') || I.take('inv')) { SE.closePanel(p); SE.audio.play('back'); return; }
      if (I.take('left')) cur = (cur + 71) % 72;
      if (I.take('right')) cur = (cur + 1) % 72;
      if (I.take('up')) cur = (cur + 60) % 72;
      if (I.take('down')) cur = (cur + 12) % 72;
      if (I.take('a')) move(cur);
    };
    p.draw = function (c) {
      const x = Math.round((W - PW) / 2), y = Math.round((H - PH) / 2);
      ui.panel(c, x, y, PW, PH);
      ui.btn(c, x + PW - 18, y + 6, 12, 12, 'x', { fn: () => SE.closePanel(p) });
      ui.text(c, 'Baú', x + 12, y + 7, { size: 10, col: '#7a3a1a' });
      ui.text(c, 'Mochila', x + 12, y + 82, { size: 10, col: '#7a3a1a' });
      for (let i = 0; i < 72; i++) {
        const [arr, k] = slotOf(i);
        const cx = x + 12 + (k % 12) * SZ, cy = y + (i < 36 ? 19 : 94) + Math.floor(k / 12) * SZ;
        if (SE.isHover(cx, cy, SZ - 1, SZ - 1)) cur = i;
        ui.slot(c, cx, cy, SZ - 1, SZ - 1, { sel: i === cur, dark: i < 36 });
        const it = arr[k];
        if (it) { SE.drawIcon(c, it.id, cx + 1, cy + 1); if (it.q > 1) ui.text(c, String(it.q), cx + SZ - 2, cy + SZ - 11, { align: 'right', col: '#ffffff', shadow: '#3a1a08', size: 9 }); }
        SE.addHit(cx, cy, SZ - 1, SZ - 1, () => { cur = i; move(i); });
      }
      const [arr, k] = slotOf(cur);
      ui.text(c, arr[k] ? SE.itemName(arr[k].id) + ' x' + arr[k].q + '  ·  Espaço/clique: passar para o outro lado' : 'Espaço/clique: passar o item para o outro lado', x + PW / 2, y + PH - 16, { align: 'center', size: 9, col: '#9a6a3a' });
    };
    return p;
  };

  // ---------------------------------------------------------------- Correio
  SE.MailPanel = function () {
    let cur = 0, t = 0;
    const p = { modal: true };
    const take = (ml) => {
      const left = [];
      ml.items.forEach(([id, q]) => { const r = SE.invAdd(id, q); if (q - r > 0) SE.toast('+' + (q - r) + ' ' + SE.itemName(id), '#bff0a0', id); if (r > 0) left.push([id, r]); });
      if (left.length) SE.toast('Mochila cheia! O resto fica na carta.', '#ffb0a0');
      ml.items = left; SE.audio.play('harvest');
      SE.checkGoals();
    };
    p.update = function (dt) {
      t += dt;
      const mail = SE.state.mail;
      if (I.take('b') || I.take('inv')) { SE.closePanel(p); SE.audio.play('back'); return; }
      if (I.take('up')) cur = Math.max(0, cur - 1);
      if (I.take('down')) cur = Math.min(mail.length - 1, cur + 1);
      if (mail[cur]) mail[cur].read = true;
      if (I.take('a') && mail[cur] && mail[cur].items.length) take(mail[cur]);
    };
    p.draw = function (c) {
      const mail = SE.state.mail, x = 16, y = 12, w = W - 32, h = H - 24;
      ui.panel(c, x, y, w, h);
      ui.btn(c, x + w - 18, y + 6, 12, 12, 'x', { fn: () => SE.closePanel(p) });
      ui.text(c, 'Cartas', x + 12, y + 8, { size: 10, col: '#7a3a1a' });
      mail.slice(0, 9).forEach((ml, i) => {
        const ry = y + 22 + i * 18;
        if (SE.isHover(x + 8, ry, 100, 16)) cur = i;
        ui.slot(c, x + 8, ry, 100, 16, { sel: i === cur, dark: ml.read });
        c.fillStyle = ml.read ? '#d8c8a8' : '#ffffff'; c.fillRect(x + 12, ry + 4, 10, 8); c.fillStyle = '#c0392b'; c.fillRect(x + 16, ry + 7, 2, 2);
        ui.text(c, ml.from, x + 26, ry + 3, { size: 9, col: ml.read ? '#8a6a4a' : '#3a1a08' });
        SE.addHit(x + 8, ry, 100, 16, () => { cur = i; });
      });
      const ml = mail[cur];
      if (!ml) return;
      ml.read = true;
      const px = x + 116, pw = w - 128;
      c.fillStyle = '#fbf2da'; c.fillRect(px, y + 8, pw, h - 16);
      c.fillStyle = '#e8d8b8'; for (let ly = y + 30; ly < y + h - 20; ly += 12) c.fillRect(px + 6, ly + 10, pw - 12, 1);
      ui.text(c, 'De: ' + ml.from, px + 8, y + 14, { size: 10, col: '#7a3a1a' });
      c.font = ui.font(10);
      SE.wrap(c, ml.text, pw - 16).slice(0, 10).forEach((ln, i) => ui.text(c, ln, px + 8, y + 30 + i * 12, { col: '#3a2412' }));
      if (ml.items.length) {
        ml.items.forEach(([id, q], i) => { ui.slot(c, px + 8 + i * 22, y + h - 34, 20, 20); SE.drawIcon(c, id, px + 10 + i * 22, y + h - 32); if (q > 1) ui.text(c, String(q), px + 27 + i * 22, y + h - 24, { align: 'right', size: 9, col: '#fff', shadow: '#3a1a08' }); });
        ui.btn(c, px + pw - 70, y + h - 32, 62, 16, 'Pegar', { fn: () => take(ml) });
      }
    };
    return p;
  };

  // ---------------------------------------------------------------- Ferraria do Seu Bastião
  SE.FerrariaPanel = function () {
    const s = () => SE.state;
    return SE.ListPanel({
      title: 'Ferraria do Seu Bastião', w: 320, h: 190,
      header: (c, x, y) => {
        const u = s().upgrade;
        ui.text(c, u ? 'Na bigorna: ' + SE.ITEMS[u.tool].name + ' ' + SE.UPGRADES[u.lvl - 1].name + ' (chega pelo correio no dia ' + u.day + ')' : 'Traga 5 barras e o dinheiro: em 2 dias chega pelo correio.', x, y, { col: '#7a3a1a', size: 9 });
      },
      headerH: 13,
      tabs: [
        { name: 'Comprar', rows: () => SE.FERRARIA_SHOP.map(([id, price]) => ({ label: SE.ITEMS[id].name, icon: id, right: SE.money(price), sub: SE.ITEMS[id].desc,
          fn: () => SE.qtyChoice('Quantos ' + SE.ITEMS[id].name + '?', Math.min(Math.floor(s().money / price), SE.invSpace(id), 99), price, (n) => { s().money -= n * price; SE.give(id, n); SE.audio.play('coin'); }) })) },
        { name: 'Melhorar', rows: () => SE.UPGRADABLE.map((tool) => {
          const lvl = s().tools[tool], up = SE.UPGRADES[lvl];
          if (!up) return { label: SE.itemName(tool), icon: tool, right: 'MÁXIMO', rightCol: '#2a7a2a', disabled: true, sub: 'Já é de ouro! Não tem como melhorar mais.' };
          const bars = SE.invCount(up.bar);
          return { label: SE.ITEMS[tool].name + ' ' + up.name, icon: up.bar, right: SE.money(up.price) + ' + 5 barras',
            sub: 'Você tem ' + bars + '/5 ' + SE.ITEMS[up.bar].name.toLowerCase() + '. ' + (tool === 'enxada' || tool === 'regador' ? 'Segure o botão para atingir mais canteiros.' : 'Mais força: quebra e corta com menos golpes.'),
            disabled: !!s().upgrade, why: 'O Seu Bastião só trabalha numa ferramenta por vez.',
            fn: () => SE.say('Melhorar ' + SE.itemName(tool) + ' por ' + SE.money(up.price) + ' e 5 barras? Você fica 2 dias sem ela.', { choices: [{ t: 'Pode fazer', fn: () => SE.startUpgrade(tool) }, { t: 'Agora não', fn: () => {} }] }) };
        }) },
      ],
    });
  };

  // ---------------------------------------------------------------- Cotações
  SE.MarketPanel = function () {
    return SE.ListPanel({
      title: 'Cotações do mercado', w: 320, h: 190,
      rows: () => Object.keys(SE.ITEMS).filter((id) => SE.isSellable(id) && !['seed', 'res', 'feed', 'place', 'fert', 'bait', 'bomb'].includes(SE.ITEMS[id].cat)).map((id) => {
        const m = SE.mult(id);
        return { label: SE.itemName(id), icon: id, right: SE.money(SE.refPrice(id)) + (m > 1.05 ? '  ALTA' : m < 0.95 ? '  BAIXA' : ''), rightCol: m > 1.05 ? '#2a7a2a' : m < 0.95 ? '#c0392b' : null,
          sub: 'Preço base ' + SE.money(SE.basePrice(id)) + '. Vender muito de uma vez derruba o preço; ele se recupera aos poucos.' };
      }),
    });
  };

  SE.HelpPanel = function () {
    const pages = [
      ['Como jogar', 'Setas ou WASD: andar  ·  Shift: correr', 'Espaço / Enter: usar ferramenta, colher, conversar', 'Segure Espaço: carregar enxada/regador melhorados e a vara', 'Esc, I ou Tab: menu (mochila, habilidades, criação...)', '1-0, - e =, Q/E ou rodinha do mouse: trocar item', 'M: música  ·  No celular: use os botões na tela.'],
      ['Gruta e pescaria', 'A gruta fica no alto do sítio. Quebre pedras com a', 'picareta para achar minério e a escada para descer.', 'Segure o facão e aperte Espaço para lutar.', 'A cada 5 andares o elevador passa a parar ali.', 'Pescar: segure Espaço para arremessar no rio. Quando', 'aparecer "!", aperte e segure para subir a barra verde.'],
      ['Na roça', 'Foice roça o mato (e dá capim). Machado tira tocos.', 'Picareta quebra pedra. Enxada ara a terra.', 'Plante na época certa e regue todo dia.', 'Encha o regador no poço ou no rio.', 'Nas ÁGUAS chove muito e tudo cresce rápido,', 'mas o temporal estraga o que já está maduro.', 'Na SECA, planta sem água murcha em 2 dias.'],
      ['Bichos e doces', 'Compre bichos no armazém. Faça carinho todo dia.', 'Afeição alta = produção em dobro.', 'Na seca, encha o cocho com capim ou ração.', 'Fogão a lenha, engenho, casa de farinha e terreiro', 'transformam a colheita em produto artesanal,', 'que vale bem mais. Fica pronto nos dias seguintes.'],
      ['Comércio', 'Armazém do Seu Jorge: compra sempre, paga 60%.', 'Caixote no sítio: o caminhão passa de madrugada.', 'Feira de sábado (7h às 13h) na praça:', 'você escolhe os produtos e define o preço.', 'Caro demais espanta freguês; barato demais é prejuízo.', 'O Jornal de segunda mexe com os preços da semana.'],
      ['O vilarejo', 'Converse com os moradores e dê presentes.', 'Cada um tem seus gostos (veja o Caderno no menu).', 'Use o mural da praça para reformar a praça,', 'reabrir a escola e trazer o trem de volta.', 'Durma antes das 2h ou você desmaia de cansaço!', 'O jogo salva sozinho toda noite.'],
    ];
    let pg = 0;
    const p = {
      modal: true,
      update() {
        if (I.take('b')) { SE.closePanel(p); return; }
        if (I.take('right') || I.take('a') || I.take('down')) { if (pg < pages.length - 1) { pg++; SE.audio.play('move'); } else SE.closePanel(p); }
        if (I.take('left') || I.take('up')) { pg = Math.max(0, pg - 1); SE.audio.play('move'); }
      },
      draw(c) {
        const x = 32, y = 24, w = W - 64, h = H - 48;
        ui.panel(c, x, y, w, h);
        const P = pages[pg];
        ui.text(c, P[0], W / 2, y + 10, { align: 'center', size: 9, title: true, col: '#7a3a1a' });
        P.slice(1).forEach((ln, i) => ui.text(c, ln, x + 16, y + 30 + i * 13));
        ui.text(c, (pg + 1) + '/' + pages.length + '   ←/→ para virar a página · Esc fecha', W / 2, y + h - 18, { align: 'center', size: 9, col: '#9a7a5a' });
        ui.btn(c, x + w - 20, y + 6, 13, 12, 'x', { fn: () => SE.closePanel(p) });
        SE.addHit(x, y + 20, w, h - 40, () => { if (pg < pages.length - 1) pg++; else SE.closePanel(p); });
      },
    };
    return p;
  };

  // ---------------------------------------------------------------- Fim do dia e jornal
  SE.DayPanel = function (rep) {
    let t = 0, pg = 0;
    const pages = [];
    if (rep.shipped.length) pages.push('venda');
    rep.levels.forEach((lv) => pages.push(lv));
    pages.push('dia');
    const p = {
      modal: true,
      update(dt) {
        t += dt;
        if (t > 0.5 && (I.take('a') || I.take('b'))) next();
      },
      draw(c) {
        c.fillStyle = '#0e1226'; c.fillRect(0, 0, W, H);
        for (let i = 0; i < 40; i++) { c.fillStyle = SE.hash(i, 1, 9) > 0.7 ? '#ffffff' : '#6a78a8'; c.fillRect(SE.hash(i, 2, 9) * W, SE.hash(3, i, 9) * H * 0.5, 1, 1); }
        const s = SE.state, cal = SE.cal(), P = pages[pg];
        if (P === 'venda') {
          const x = 46, y = 12, w = W - 92, h = H - 34;
          ui.panel(c, x, y, w, h);
          ui.text(c, 'Caixote do Seu Jorge', W / 2, y + 9, { align: 'center', size: 8, title: true, col: '#7a3a1a' });
          let yy = y + 26;
          rep.shipped.slice(0, 8).forEach((it) => {
            SE.drawIcon(c, it.id, x + 14, yy);
            ui.text(c, SE.itemName(it.id) + ' x' + it.q, x + 34, yy + 3);
            c.fillStyle = 'rgba(122,58,26,0.35)'; for (let dx = x + 150; dx < x + w - 70; dx += 4) c.fillRect(dx, yy + 10, 2, 1);
            ui.text(c, SE.money(it.v), x + w - 14, yy + 3, { align: 'right', col: '#2a6a2a' });
            yy += 17;
          });
          if (rep.shipped.length > 8) ui.text(c, '+ ' + (rep.shipped.length - 8) + ' outros itens', x + 34, yy + 2, { size: 9, col: '#9a6a3a' });
          c.fillStyle = '#7a3a1a'; c.fillRect(x + 12, y + h - 28, w - 24, 1);
          ui.text(c, 'Total', x + 14, y + h - 22, { size: 11, col: '#7a3a1a' });
          ui.text(c, SE.money(rep.earned), x + w - 14, y + h - 22, { align: 'right', size: 11, col: '#2a6a2a' });
        } else if (P !== 'dia') {
          const sk = SE.SKILLS.find((k) => k.id === P.id);
          const x = 70, y = 30, w = W - 140, h = 140;
          ui.panel(c, x, y, w, h);
          ui.text(c, 'Subiu de nível!', W / 2, y + 12, { align: 'center', size: 9, title: true, col: '#c0392b' });
          SE.drawIcon(c, sk.icon, W / 2 - 16, y + 30, 2);
          ui.text(c, sk.name + ': nível ' + P.lvl, W / 2, y + 68, { align: 'center', size: 12, col: '#7a3a1a' });
          c.font = ui.font(10);
          SE.wrap(c, sk.perk, w - 30).forEach((ln, i) => ui.text(c, ln, W / 2, y + 84 + i * 11, { align: 'center', col: '#5a3a1e' }));
          if (P.unlock.length) ui.text(c, 'Nova receita: ' + P.unlock.join(', '), W / 2, y + h - 22, { align: 'center', col: '#2a6a2a' });
          if (t < 0.1) SE.audio.play('level');
        } else {
          ui.text(c, 'Bom dia!', W / 2, 16, { align: 'center', size: 12, title: true, col: '#f2c94c', shadow: '#000' });
          ui.text(c, SE.WEEKDAYS[cal.wd] + ', dia ' + cal.dia + ' da ' + SE.EPOCAS[cal.epoca].name + ' · Ano ' + cal.ano, W / 2, 36, { align: 'center', col: '#ffffff' });
          let y = 54;
          c.font = ui.font(10);
          const lines = rep.lines.slice();
          if (rep.earned) lines.unshift('O caminhão do Seu Jorge passou e pagou ' + SE.money(rep.earned) + ' pelo caixote.');
          if (rep.mail) lines.push('Tem carta nova na caixa de correio!');
          if (!lines.length) lines.push('Noite tranquila no sítio. Os grilos cantaram até o galo assumir.');
          lines.forEach((l) => SE.wrap(c, '• ' + l, W - 60).forEach((ln) => { if (y < 148) ui.text(c, ln, 30, y, { col: '#e8dcc0' }); y += 11; }));
          y = Math.min(Math.max(y + 6, 150), 160);
          ui.text(c, 'Hoje: ' + SE.WEATHER[s.weather].name + '   ·   Amanhã: ' + SE.WEATHER[rep.forecast].name + '   ·   Dinheiro: ' + SE.money(s.money), W / 2, y, { align: 'center', col: '#a0d0ff' });
          const g = SE.currentGoal();
          if (g) ui.text(c, 'Objetivo: ' + g.t, W / 2, y + 13, { align: 'center', col: '#f2c94c' });
        }
        if (t > 0.5) ui.text(c, '[Espaço] ' + (pg < pages.length - 1 ? 'Continuar' : 'Começar o dia'), W / 2, H - 16, { align: 'center', col: Math.floor(t * 2) % 2 ? '#ffffff' : '#c8c8c8' });
        SE.addHit(0, 0, W, H, () => { if (t > 0.5) next(); });
      },
    };
    function next() {
      if (pg < pages.length - 1) { pg++; t = 0; SE.audio.play('select'); return; }
      SE.closePanel(p);
      if (rep.news) SE.openPanel(SE.JornalPanel());
    }
    return p;
  };

  SE.JornalPanel = function () {
    let t = 0;
    const p = {
      modal: true,
      update(dt) { t += dt; if (t > 0.4 && (I.take('a') || I.take('b'))) SE.closePanel(p); },
      draw(c) {
        const s = SE.state, n = SE.NEWS[s.news.i], cal = SE.cal();
        const x = 48, y = 14, w = W - 96, h = H - 28;
        c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(0, 0, W, H);
        c.fillStyle = '#efe8d8'; c.fillRect(x, y, w, h);
        c.fillStyle = '#d8d0bc'; c.fillRect(x + w - 4, y, 4, h); c.fillRect(x, y + h - 3, w, 3);
        ui.text(c, 'O Eco da Serra', W / 2, y + 8, { align: 'center', size: 12, title: true, col: '#1a1a1a' });
        c.fillStyle = '#1a1a1a'; c.fillRect(x + 8, y + 24, w - 16, 1); c.fillRect(x + 8, y + 36, w - 16, 1);
        ui.text(c, 'Segunda-feira, dia ' + cal.dia + ' da ' + SE.EPOCAS[cal.epoca].name + ' · R$ 1,00', W / 2, y + 26, { align: 'center', size: 9, col: '#3a3a3a' });
        c.font = ui.font(13);
        let yy = y + 42;
        SE.wrap(c, n.title.toUpperCase(), w - 24).forEach((ln) => { ui.text(c, ln, x + 12, yy, { size: 13, col: '#1a1a1a' }); yy += 13; });
        c.font = ui.font(10);
        yy += 3;
        SE.wrap(c, n.text, w - 24).forEach((ln) => { ui.text(c, ln, x + 12, yy, { col: '#3a3a3a' }); yy += 11; });
        yy += 6;
        const eff = Object.keys(n.eff);
        if (eff.length) {
          ui.text(c, 'COTAÇÕES DA SEMANA', x + 12, yy, { col: '#1a1a1a', size: 9, title: false }); yy += 12;
          eff.slice(0, 4).forEach((id) => {
            const up = n.eff[id] > 1;
            ui.text(c, SE.itemName(id) + ': ' + (up ? '+' : '') + Math.round((n.eff[id] - 1) * 100) + '%  (' + SE.money(SE.refPrice(id)) + ')', x + 16, yy, { col: up ? '#1e6a2a' : '#a02a2a' }); yy += 10;
          });
        }
        if (n.clientes) { ui.text(c, 'Feira deste sábado: +' + n.clientes + ' clientes esperados!', x + 12, yy, { col: '#1e6a2a' }); }
        ui.text(c, 'Classificados: vende-se carroça usada.', x + 12, y + h - 30, { size: 9, col: '#5a5a5a' });
        ui.text(c, '[Espaço] Dobrar o jornal', W / 2, y + h - 16, { align: 'center', size: 9, col: '#5a5a5a' });
        SE.addHit(0, 0, W, H, () => SE.closePanel(p));
      },
    };
    return p;
  };
})(window.SE);
