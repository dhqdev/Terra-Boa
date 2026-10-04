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
    c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(x + 2, y + 2, w, h);
    c.fillStyle = '#3a2412'; c.fillRect(x, y, w, h);
    c.fillStyle = o.frame || '#9a6232'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
    c.fillStyle = '#c4884a'; c.fillRect(x + 1, y + 1, w - 2, 1);
    c.fillStyle = '#3a2412'; c.fillRect(x + 3, y + 3, w - 6, h - 6);
    c.fillStyle = o.bg || '#f4e4bc'; c.fillRect(x + 4, y + 4, w - 8, h - 8);
    c.fillStyle = 'rgba(160,110,50,0.18)'; c.fillRect(x + 4, y + h - 6, w - 8, 2);
  };
  ui.btn = function (c, x, y, w, h, label, o) {
    o = o || {};
    const hov = SE.isHover(x, y, w, h);
    const sel = o.sel || hov;
    c.fillStyle = '#3a2412'; c.fillRect(x, y, w, h);
    c.fillStyle = o.disabled ? '#b0a080' : sel ? '#f2c94c' : '#e8cf96'; c.fillRect(x + 1, y + 1, w - 2, h - 2);
    c.fillStyle = 'rgba(255,255,255,0.35)'; c.fillRect(x + 1, y + 1, w - 2, 1);
    ui.text(c, label, x + w / 2, y + Math.floor((h - 9) / 2), { align: 'center', col: o.disabled ? '#6a5a40' : '#3a2412', size: o.size || 10 });
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
    lines.forEach((l) => {
      const hasP = !!l.who;
      mctx.font = ui.font(10);
      const wrapped = SE.wrap(mctx, l.text, W - 16 - 16 - (hasP ? 44 : 0));
      for (let i = 0; i < wrapped.length; i += 4) pages.push({ who: l.who, lines: wrapped.slice(i, i + 4) });
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
        const x = 8, y = H - 64, w = W - 16, h = 58;
        ui.panel(c, x, y, w, h);
        let tx = x + 10;
        if (pg.who) {
          const n = SE.NPCS[pg.who];
          c.fillStyle = '#e8d4a0'; c.fillRect(x + 7, y + 7, 36, 44);
          c.drawImage(SE.personSprite(n.look, 0, 0), x + 9, y + 4, 32, 48);
          tx = x + 50;
          const nw = ui.measure(c, n.name, 10) + 12;
          ui.panel(c, x + 6, y - 16, nw + 74, 18, { bg: '#f2c94c' });
          ui.text(c, n.name, x + 12, y - 11);
          const hs = SE.hearts(SE.state.npcs[pg.who].f);
          for (let i = 0; i < 10; i++) if (i < 10) ui.heart(c, x + 12 + nw + i * 6.5 - 4, y - 9, i < hs);
        }
        let left = Math.floor(chars);
        pg.lines.forEach((ln, i) => {
          const s = ln.slice(0, Math.max(0, left));
          left -= ln.length;
          ui.text(c, s, tx, y + 8 + i * 11);
        });
        const total = pg.lines.join('').length;
        if (chars >= total && !(pi === pages.length - 1 && opts.choices)) {
          const b = Math.floor(t * 3) % 2;
          c.fillStyle = '#c0392b'; c.fillRect(x + w - 14, y + h - 12 + b, 5, 2); c.fillRect(x + w - 13, y + h - 10 + b, 3, 1); c.fillRect(x + w - 12, y + h - 9 + b, 1, 1);
        }
        SE.addHit(x, y, w, h, () => advance());
        if (pi === pages.length - 1 && chars >= total && opts.choices) {
          const cw = Math.max(120, ...opts.choices.map((ch) => ui.measure(c, ch.t, 10) + 24));
          const ch = opts.choices.length * 13 + 10;
          const cx = W - cw - 10, cy = y - ch - 4;
          ui.panel(c, cx, cy, cw, ch);
          opts.choices.forEach((o, i) => {
            const ry = cy + 5 + i * 13;
            if (SE.isHover(cx, ry, cw, 13)) cur = i;
            if (i === cur) { c.fillStyle = 'rgba(242,201,76,0.6)'; c.fillRect(cx + 4, ry, cw - 8, 12); ui.cursor(c, cx + 6, ry + 2, t); }
            ui.text(c, o.t, cx + 14, ry + 1);
            SE.addHit(cx, ry, cw, 13, () => choose(i));
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
      })),
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

  // ---------------------------------------------------------------- Mochila
  SE.InventoryPanel = function () {
    let cur = SE.state.sel, moving = -1, t = 0;
    const COLS = 10, SZ = 22;
    const p = {
      modal: true,
      update(dt) {
        t += dt;
        if (I.take('b') || I.take('inv')) { SE.closePanel(p); SE.audio.play('back'); return; }
        if (I.take('left')) { cur = (cur + 29) % 30; SE.audio.play('move'); }
        if (I.take('right')) { cur = (cur + 1) % 30; SE.audio.play('move'); }
        if (I.take('up')) { cur = (cur + 20) % 30; SE.audio.play('move'); }
        if (I.take('down')) { cur = (cur + 10) % 30; SE.audio.play('move'); }
        if (I.take('a')) pick(cur);
      },
      draw(c) {
        const s = SE.state;
        const PW = COLS * SZ + 20, PH = 184;
        const x = Math.round((W - PW) / 2), y = Math.round((H - PH) / 2) - 6;
        ui.panel(c, x, y, PW, PH);
        ui.text(c, 'Mochila', x + 10, y + 8, { size: 8, title: true, col: '#7a3a1a' });
        ui.text(c, SE.money(s.money) + '  ·  Energia ' + Math.round(s.energy) + '/' + s.maxEnergy + '  ·  Água ' + s.water + '/' + s.waterMax, x + PW / 2, y + 101, { align: 'center', col: '#2a6a2a' });
        ui.btn(c, x + PW - 20, y + 6, 13, 12, 'x', { fn: () => { SE.closePanel(p); } });
        for (let i = 0; i < 30; i++) {
          const cx = x + 10 + (i % COLS) * SZ, cy = y + 22 + Math.floor(i / COLS) * (SZ + 2) + (i >= 10 ? 4 : 0);
          if (SE.isHover(cx, cy, SZ - 2, SZ - 2)) cur = i;
          c.fillStyle = i < 10 ? '#c49a6a' : '#d8b880'; c.fillRect(cx, cy, SZ - 2, SZ - 2);
          c.fillStyle = '#e8d4a0'; c.fillRect(cx + 1, cy + 1, SZ - 4, SZ - 4);
          const it = s.inv[i];
          if (it && i !== moving) {
            SE.drawIcon(c, it.id, cx + 2, cy + 2);
            if (it.q > 1) ui.text(c, String(it.q), cx + SZ - 3, cy + SZ - 11, { align: 'right', col: '#ffffff', shadow: '#3a2412', size: 9 });
          }
          if (i === moving) { c.fillStyle = 'rgba(192,57,43,0.3)'; c.fillRect(cx + 1, cy + 1, SZ - 4, SZ - 4); }
          if (i === cur) { c.strokeStyle = '#c0392b'; c.lineWidth = 1; c.strokeRect(cx - 0.5, cy - 0.5, SZ - 1, SZ - 1); c.strokeRect(cx + 0.5, cy + 0.5, SZ - 3, SZ - 3); }
          if (i === s.sel) { c.fillStyle = '#f2c94c'; c.fillRect(cx, cy - 2, SZ - 2, 1); }
          SE.addHit(cx, cy, SZ - 2, SZ - 2, () => { cur = i; pick(i); });
        }
        ui.text(c, 'linha de cima = barra rápida (1-0)', x + PW - 24, y + 8, { align: 'right', size: 9, col: '#9a7a5a' });
        if (moving >= 0 && s.inv[moving]) {
          const mx = SE.clamp(I.mouse.x, 0, W - 16), my = SE.clamp(I.mouse.y, 0, H - 16);
          if (!I.touch && I.mouse.x >= 0) SE.drawIcon(c, s.inv[moving].id, mx - 8, my - 8);
        }
        const it = s.inv[cur];
        const dy = y + 114;
        c.fillStyle = '#e8d4a0'; c.fillRect(x + 8, dy, PW - 16, PH - (dy - y) - 8);
        if (it) {
          const def = SE.ITEMS[it.id];
          SE.drawIcon(c, it.id, x + 12, dy + 4, 2);
          ui.text(c, SE.itemName(it.id) + (it.q > 1 ? ' x' + it.q : ''), x + 48, dy + 4, { col: '#7a3a1a' });
          c.font = ui.font(10);
          SE.wrap(c, def.desc || '', PW - 60).slice(0, 3).forEach((ln, i) => ui.text(c, ln, x + 48, dy + 15 + i * 10, { col: '#5a3a1e' }));
          const info = [];
          if (SE.isSellable(it.id)) info.push('Mercado: ' + SE.money(SE.refPrice(it.id)));
          if (def.eat) info.push('Energia: +' + def.eat);
          ui.text(c, info.join('   '), x + 48, dy + 45, { col: '#2a6a2a' });
        } else ui.text(c, moving >= 0 ? 'Escolha onde colocar.' : 'Espaço vazio.', x + 48, dy + 6, { col: '#9a7a5a' });
        ui.text(c, moving >= 0 ? 'Espaço: soltar aqui' : 'Espaço: opções do item  ·  Esc: fechar', x + PW / 2, y + PH - 15, { align: 'center', size: 9, col: '#9a7a5a' });
      },
    };
    function pick(i) {
      const s = SE.state;
      if (moving >= 0) {
        const a = s.inv[moving], b = s.inv[i];
        if (a && b && a.id === b.id && i !== moving && SE.ITEMS[a.id].cat !== 'tool') {
          const n = Math.min(a.q, 99 - b.q); b.q += n; a.q -= n; if (a.q <= 0) s.inv[moving] = null;
        } else { s.inv[moving] = b; s.inv[i] = a; }
        moving = -1; SE.audio.play('select');
        return;
      }
      const it = s.inv[i];
      if (!it) return;
      const def = SE.ITEMS[it.id];
      const ch = [{ t: 'Mover', fn: () => { moving = i; } }];
      if (i >= 10) ch.push({ t: 'Pôr na barra rápida', fn: () => { const sel = s.sel; const tmp = s.inv[sel]; s.inv[sel] = s.inv[i]; s.inv[i] = tmp; SE.toast(def.name + ' está na sua mão.', '#e0d0b0'); } });
      else ch.push({ t: 'Segurar', fn: () => { s.sel = i; SE.closePanel(p); } });
      if (def.eat) ch.push({ t: 'Comer (+' + def.eat + ' energia)', fn: () => SE.eat(it.id) });
      ch.push({ t: 'Cancelar', fn: () => {} });
      SE.say(SE.itemName(it.id) + (it.q > 1 ? ' (' + it.q + ')' : ''), { choices: ch });
    }
    return p;
  };

  // ---------------------------------------------------------------- Diário (objetivos, amizades, mercado)
  SE.DiaryPanel = function () {
    return SE.ListPanel({
      title: 'Caderno do sítio', w: 330, h: 196,
      tabs: [
        { name: 'Objetivos', rows: () => SE.OBJECTIVES.map((o, i) => ({ label: o.t, right: i < SE.state.goal ? 'FEITO' : i === SE.state.goal ? 'AGORA' : '', rightCol: i < SE.state.goal ? '#2a7a2a' : '#c0392b', disabled: i > SE.state.goal, sub: 'Grande meta: reerguer o sítio e trazer o vilarejo de volta à vida.' })) },
        { name: 'Amizades', rows: () => Object.keys(SE.NPCS).map((id) => {
          const n = SE.NPCS[id], st = SE.state.npcs[id];
          return { label: st.met ? n.name + ' · ' + n.role : '???', right: SE.hearts(st.f) + '/10 corações', bar: st.f / 1000,
            sub: st.met ? 'Adora: ' + n.loves.map((x) => SE.ITEMS[x].name).join(', ') + '. Converse todo dia e dê presentes (segure o item e fale com a pessoa).' : 'Você ainda não conhece essa pessoa. Passeie pelo vilarejo!' };
        }) },
        { name: 'Mercado', rows: () => Object.keys(SE.ITEMS).filter((id) => SE.isSellable(id) && !['seed', 'res', 'feed', 'place'].includes(SE.ITEMS[id].cat)).map((id) => {
          const m = SE.mult(id);
          return { label: SE.itemName(id), icon: id, right: SE.money(SE.refPrice(id)) + (m > 1.05 ? '  ALTA' : m < 0.95 ? '  BAIXA' : ''), rightCol: m > 1.05 ? '#2a7a2a' : m < 0.95 ? '#c0392b' : null,
            sub: 'Preço base ' + SE.money(SE.basePrice(id)) + '. Vender muito de uma vez derruba o preço; ele se recupera aos poucos.' };
        }) },
      ],
    });
  };

  SE.HelpPanel = function () {
    const pages = [
      ['Como jogar', 'Setas ou WASD: andar  ·  Shift: correr', 'Espaço / Enter: usar ferramenta, colher, conversar', 'I ou Tab: mochila  ·  Esc: menu', '1-0, Q/E ou rodinha do mouse: trocar item', 'M: música liga/desliga', 'No celular: use os botões na tela.'],
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

  SE.PauseMenu = function () {
    return SE.ListPanel({
      title: 'Menu', w: 220, h: 170,
      rows: () => [
        { label: 'Voltar ao jogo', fn: () => SE.closePanel(SE.topPanel()) },
        { label: 'Mochila', fn: () => { SE.closePanel(SE.topPanel()); SE.openPanel(SE.InventoryPanel()); } },
        { label: 'Caderno: objetivos, amizades e preços', fn: () => SE.openPanel(SE.DiaryPanel()) },
        { label: 'Salvar jogo', fn: () => SE.saveGame(false) },
        { label: 'Como jogar', fn: () => SE.openPanel(SE.HelpPanel()) },
        { label: 'Música: ' + (SE.audio.music ? 'ligada' : 'desligada'), fn: () => SE.audio.toggleMusic() },
        { label: 'Sair para a tela inicial', sub: 'O progresso é salvo automaticamente ao dormir.', fn: () => SE.say('Salvar antes de sair?', { choices: [
          { t: 'Salvar e sair', fn: () => { SE.saveGame(true); SE.panels.length = 0; SE.setScene(SE.TitleScene()); } },
          { t: 'Sair sem salvar', fn: () => { SE.panels.length = 0; SE.setScene(SE.TitleScene()); } },
          { t: 'Cancelar', fn: () => {} }] }) },
      ],
      footer: () => '',
    });
  };

  // ---------------------------------------------------------------- Fim do dia e jornal
  SE.DayPanel = function (rep) {
    let t = 0;
    const p = {
      modal: true,
      update(dt) {
        t += dt;
        if (t > 0.6 && (I.take('a') || I.take('b'))) close();
      },
      draw(c) {
        c.fillStyle = 'rgba(10,14,32,0.94)'; c.fillRect(0, 0, W, H);
        const s = SE.state, cal = SE.cal();
        ui.text(c, 'Bom dia!', W / 2, 18, { align: 'center', size: 12, title: true, col: '#f2c94c', shadow: '#000' });
        ui.text(c, SE.WEEKDAYS[cal.wd] + ', dia ' + cal.dia + ' da ' + SE.EPOCAS[cal.epoca].name + ' · Ano ' + cal.ano, W / 2, 38, { align: 'center', col: '#ffffff' });
        let y = 58;
        c.font = ui.font(10);
        const lines = rep.lines.length ? rep.lines : ['Noite tranquila no sítio. Os grilos cantaram até o galo assumir.'];
        lines.forEach((l) => SE.wrap(c, '• ' + l, W - 60).forEach((ln) => { ui.text(c, ln, 30, y, { col: '#e8dcc0' }); y += 11; }));
        y += 6;
        ui.text(c, 'Hoje: ' + SE.WEATHER[s.weather].name + '   ·   Amanhã: ' + SE.WEATHER[rep.forecast].name + '   ·   Dinheiro: ' + SE.money(s.money), W / 2, Math.max(y, 150), { align: 'center', col: '#a0d0ff' });
        const g = SE.currentGoal();
        if (g) ui.text(c, 'Objetivo: ' + g.t, W / 2, Math.max(y, 150) + 14, { align: 'center', col: '#f2c94c' });
        if (t > 0.6) ui.text(c, '[Espaço] Começar o dia', W / 2, H - 20, { align: 'center', col: Math.floor(t * 2) % 2 ? '#ffffff' : '#c8c8c8' });
        SE.addHit(0, 0, W, H, () => { if (t > 0.6) close(); });
      },
    };
    function close() {
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
