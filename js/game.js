'use strict';
// Regras do jogo: estado, calendário, inventário, mercado, ações e virada do dia.
(function (SE) {
  const T = SE.T;
  SE.MIN_PER_SEC = 10 / 7; // 10 minutos do jogo a cada 7 segundos
  SE.DAY_START = 6 * 60;
  SE.PASS_OUT = 26 * 60; // 2h da manhã
  const MAXQ = 99;

  // ---------------------------------------------------------------- Estado
  SE.newState = function (name, look) {
    const s = {
      v: 1, name: name || 'Joca', look: look || 0, money: 500, energy: 100, maxEnergy: 100,
      day: 1, time: SE.DAY_START, weather: 'sol', nextWeather: 'chuva',
      map: 'farm', px: 7 * T + 8, py: 8 * T + 12, dir: 0,
      inv: new Array(30).fill(null), sel: 0, water: 20, waterMax: 20,
      farmObj: SE.genFarmObj(), soil: {}, forage: {}, hives: {},
      animals: [], cocho: 0, uid: 1,
      stations: { fogao: { ok: true, slots: [] }, engenho: { ok: false, slots: [] }, casa_farinha: { ok: false, slots: [] }, terreiro: { ok: false, slots: [] } },
      npcs: {}, market: {}, news: null, lastNews: -1, proj: { praca: 0, escola: 0, estacao: 0 }, projDone: {}, flags: {}, caixote: [],
      stats: { mato: 0, plantado: 0, regado: 0, colhido: 0, feiras: 0, artesanal: 0, ganho: 0, vendidos: 0 },
      goal: 0,
    };
    Object.keys(SE.NPCS).forEach((id) => { s.npcs[id] = { f: 0, met: false, talk: 0, gift: 0 }; });
    [['enxada', 1], ['regador', 1], ['foice', 1], ['machado', 1], ['picareta', 1], ['sem_milho', 12], ['sem_feijao', 8]].forEach(([id, q], i) => { s.inv[i] = { id, q }; });
    return s;
  };

  // ---------------------------------------------------------------- Calendário
  SE.cal = function (s) {
    s = s || SE.state;
    const d = s.day - 1;
    const doy = d % (2 * SE.EPOCA_DAYS);
    return { epoca: doy < SE.EPOCA_DAYS ? 'aguas' : 'seca', dia: (doy % SE.EPOCA_DAYS) + 1, wd: d % 7, ano: Math.floor(d / (2 * SE.EPOCA_DAYS)) + 1 };
  };
  SE.isFeiraDay = (s) => SE.cal(s).wd === 5;
  SE.isRaining = () => SE.state.weather === 'chuva' || SE.state.weather === 'tempestade';
  SE.clock = function (min) {
    const h = Math.floor(min / 60) % 24, m = Math.floor(min % 60 / 10) * 10;
    return SE.pad2(h) + ':' + SE.pad2(m);
  };
  function rollWeather(ep) {
    const r = Math.random();
    if (ep === 'aguas') return r < 0.3 ? 'sol' : r < 0.5 ? 'nublado' : r < 0.88 ? 'chuva' : 'tempestade';
    return r < 0.78 ? 'sol' : r < 0.94 ? 'nublado' : 'chuva';
  }

  // ---------------------------------------------------------------- Inventário
  SE.invAdd = function (id, q) {
    const s = SE.state, tool = SE.ITEMS[id].cat === 'tool';
    if (!tool) for (const it of s.inv) { if (q <= 0) break; if (it && it.id === id && it.q < MAXQ) { const n = Math.min(q, MAXQ - it.q); it.q += n; q -= n; } }
    for (let i = 0; i < s.inv.length && q > 0; i++) {
      if (!s.inv[i]) { const n = tool ? 1 : Math.min(q, MAXQ); s.inv[i] = { id, q: n }; q -= n; }
    }
    return q;
  };
  SE.invCount = (id) => SE.state.inv.reduce((a, it) => a + (it && it.id === id ? it.q : 0), 0);
  SE.invRemove = function (id, q) {
    const s = SE.state;
    if (SE.invCount(id) < q) return false;
    for (let i = s.inv.length - 1; i >= 0 && q > 0; i--) {
      const it = s.inv[i];
      if (it && it.id === id) { const n = Math.min(q, it.q); it.q -= n; q -= n; if (it.q <= 0) s.inv[i] = null; }
    }
    return true;
  };
  SE.invRemoveAt = function (i, q) { const it = SE.state.inv[i]; if (!it) return; it.q -= q; if (it.q <= 0) SE.state.inv[i] = null; };
  SE.invSpace = function (id) {
    let n = 0; const tool = SE.ITEMS[id].cat === 'tool';
    SE.state.inv.forEach((it) => { if (!it) n += tool ? 1 : MAXQ; else if (!tool && it.id === id) n += MAXQ - it.q; });
    return n;
  };
  SE.give = function (id, q, quiet) {
    const left = SE.invAdd(id, q);
    if (!quiet && q - left > 0) SE.toast('+' + (q - left) + ' ' + SE.ITEMS[id].name, '#bff0a0', id);
    if (left > 0) SE.toast('Mochila cheia!', '#ffb0a0');
    return left;
  };

  SE.useEnergy = function (n) {
    const s = SE.state;
    if (s.energy < n) { SE.toast('Sem energia! Coma algo ou vá dormir.', '#ffb0a0'); SE.audio.play('error'); return false; }
    s.energy = Math.max(0, s.energy - n);
    return true;
  };
  SE.eat = function (id) {
    const it = SE.ITEMS[id], s = SE.state;
    if (!it.eat || !SE.invRemove(id, 1)) return;
    s.energy = Math.min(s.maxEnergy, s.energy + it.eat);
    SE.toast('Você comeu ' + it.name + '. +' + it.eat + ' energia', '#ffe08a');
    SE.audio.play('harvest');
  };

  // ---------------------------------------------------------------- Mercado
  SE.basePrice = function (id) {
    let p = (SE.ITEMS[id] && SE.ITEMS[id].price) || 0;
    if (id === 'rapadura' && SE.state.flags.receita) p = Math.round(p * 1.5);
    return p;
  };
  SE.newsMult = function (id) {
    const n = SE.state.news;
    if (!n) return 1;
    return SE.NEWS[n.i].eff[id] || 1;
  };
  SE.mult = (id) => (SE.state.market[id] || 1) * SE.newsMult(id);
  SE.refPrice = (id) => Math.max(1, Math.round(SE.basePrice(id) * SE.mult(id)));
  SE.jorgePrice = (id) => Math.max(1, Math.floor(SE.refPrice(id) * 0.6));
  SE.marketSold = function (id, q, f) {
    const m = SE.state.market;
    m[id] = Math.max(0.5, (m[id] || 1) - 0.012 * q * (f || 1));
  };
  SE.earn = function (v) { SE.state.money += v; SE.state.stats.ganho += v; };
  SE.itemName = (id) => (id === 'rapadura' && SE.state.flags.receita ? 'Rapadura da Serra' : SE.ITEMS[id].name);

  // ---------------------------------------------------------------- Jogador e mira
  SE.player = { x: 0, y: 0, dir: 0, frame: 0, animT: 0, moving: false, tool: null, toolT: 0 };
  SE.DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]];
  SE.frontPoint = function () {
    const p = SE.player, d = SE.DIRS[p.dir];
    return [p.x + d[0] * 13, p.y - 5 + d[1] * 13];
  };
  SE.frontTile = function () { const [x, y] = SE.frontPoint(); return [Math.floor(x / T), Math.floor(y / T)]; };

  // ---------------------------------------------------------------- Moradores (posição no vilarejo)
  SE.npcRT = {};
  SE.npcTarget = function (id) {
    const n = SE.NPCS[id], s = SE.state, h = s.time / 60;
    let pos = null;
    for (const [hr, p] of n.sched) if (h >= hr) pos = p;
    if (SE.isFeiraDay(s) && h >= 7 && h < 13 && pos && id !== 'cida' && id !== 'ze') {
      const spots = { jorge: [19, 12], bento: [21, 12], lucia: [18, 12], marta: [22, 12], tiao: [17, 11], nena: [24, 11] };
      if (spots[id] && !(id === 'jorge' && h >= 8 && h < 12)) pos = spots[id];
    }
    return pos;
  };
  SE.updateNPCs = function (dt, snap) {
    Object.keys(SE.NPCS).forEach((id) => {
      let r = SE.npcRT[id];
      const tgt = SE.npcTarget(id);
      if (!r) r = SE.npcRT[id] = { x: 0, y: 0, dir: 0, frame: 0, t: 0, visible: false };
      if (!tgt) { r.visible = false; return; }
      const tx = tgt[0] * T + 8, ty = tgt[1] * T + 12;
      if (!r.visible || snap) { r.x = tx; r.y = ty; r.visible = true; r.dir = 0; return; }
      if (r.talking > 0) { r.talking -= dt; return; }
      const dx = tx - r.x, dy = ty - r.y, dist = Math.hypot(dx, dy);
      if (dist > 1) {
        const sp = Math.min(dist, 30 * dt);
        r.x += (dx / dist) * sp; r.y += (dy / dist) * sp;
        r.dir = Math.abs(dx) > Math.abs(dy) ? (dx < 0 ? 2 : 3) : dy < 0 ? 1 : 0;
        r.t += dt; r.frame = Math.floor(r.t * 6) % 2 + 1;
      } else { r.frame = 0; r.dir = r.dir === 1 ? 0 : r.dir; }
    });
  };
  SE.npcAtPoint = function (x, y) {
    if (SE.state.map !== 'vila') return null;
    for (const id of Object.keys(SE.npcRT)) {
      const r = SE.npcRT[id];
      if (r.visible && Math.abs(r.x - x) < 9 && y > r.y - 20 && y < r.y + 4) return id;
    }
    return null;
  };
  SE.npcBlocks = function (x0, y0, x1, y1) {
    if (SE.state.map !== 'vila') return false;
    for (const id of Object.keys(SE.npcRT)) {
      const r = SE.npcRT[id];
      if (r.visible && x1 > r.x - 5 && x0 < r.x + 5 && y1 > r.y - 5 && y0 < r.y + 1) return true;
    }
    return false;
  };
  SE.hearts = (f) => Math.min(10, Math.floor(f / 100));

  SE.npcInteract = function (id) {
    const s = SE.state, n = SE.NPCS[id], st = s.npcs[id], r = SE.npcRT[id];
    const p = SE.player;
    r.dir = p.dir === 0 ? 1 : p.dir === 1 ? 0 : p.dir === 2 ? 3 : 2;
    r.talking = 4;
    const held = s.inv[s.sel];
    const canGift = held && SE.ITEMS[held.id].cat !== 'tool' && st.gift !== s.day && st.met;
    if (canGift) {
      SE.say([{ who: id, text: 'Oi! Precisa de alguma coisa?' }], {
        choices: [
          { t: 'Conversar', fn: () => talk(id) },
          { t: 'Dar ' + SE.itemName(held.id) + ' de presente', fn: () => gift(id, held.id) },
          { t: 'Nada, até mais!', fn: () => {} },
        ],
      });
    } else talk(id);
  };
  function talk(id) {
    const s = SE.state, n = SE.NPCS[id], st = s.npcs[id];
    let text;
    if (!st.met) { text = n.lines[0][0]; st.met = true; }
    else {
      const tier = st.f >= 600 ? 2 : st.f >= 250 ? 1 : 0;
      const pool = [].concat(...n.lines.slice(0, tier + 1)).slice(1);
      const ep = SE.cal().epoca;
      if (Math.random() < 0.3) pool.push(ep === 'seca' ? 'Na seca a poeira sobe e o céu fica azul que dói. Guarde água!' : 'Nas águas tudo cresce ligeiro. Só cuidado com o temporal!');
      if (SE.isFeiraDay(s)) pool.push('Hoje é dia de feira! Já montou sua barraca na praça?');
      text = SE.pick(pool);
    }
    if (st.talk !== s.day) { st.talk = s.day; st.f += 20; }
    const lines = [{ who: id, text }];
    if (id === 'tiao' && st.f >= 500 && !s.flags.receita) {
      s.flags.receita = true;
      lines.push({ who: id, text: 'Escuta... a Nena e eu conversamos. A receita da Rapadura da Serra precisa de alguém pra continuar.' });
      lines.push({ who: id, text: 'O segredo é o ponto do melado e um tiquinho de cravo. Agora é sua. Cuida bem dela.' });
      lines.push({ who: null, text: 'Você aprendeu a receita da Rapadura da Serra! Sua rapadura agora vale 50% a mais.' });
      SE.audio.play('goal');
    }
    SE.say(lines);
    SE.checkGoals();
  }
  function gift(id, item) {
    const s = SE.state, n = SE.NPCS[id], st = s.npcs[id];
    if (!SE.invRemove(item, 1)) return;
    st.gift = s.day;
    let d, text;
    if (n.loves.includes(item)) { d = 120; text = 'Não acredito! Eu AMO isso! Você é um amor de pessoa.'; SE.audio.play('love'); }
    else if (n.likes.includes(item)) { d = 60; text = 'Ah, que gentileza! Gostei muito.'; SE.audio.play('select'); }
    else if (n.dislikes.includes(item)) { d = -30; text = 'Hmm... isso aí não é muito a minha praia, não.'; SE.audio.play('error'); }
    else { d = 30; text = 'Que presente bom! Obrigado pela lembrança.'; SE.audio.play('select'); }
    st.f = SE.clamp(st.f + d, 0, 1000);
    SE.say([{ who: id, text }]);
  }

  // ---------------------------------------------------------------- Bichos
  SE.animalAtPoint = function (x, y) {
    if (SE.state.map !== 'farm') return null;
    let best = null, bd = 14;
    SE.state.animals.forEach((a) => { const d = Math.hypot(a.x - x, a.y - 4 - y); if (d < bd) { bd = d; best = a; } });
    return best;
  };
  SE.buyAnimal = function (kind) {
    const s = SE.state, def = SE.ANIMALS[kind];
    if (s.animals.length >= SE.CURRAL_MAX) { SE.say('O curral está cheio (máximo ' + SE.CURRAL_MAX + ' bichos).'); return false; }
    if (s.money < def.price) { SE.toast('Dinheiro insuficiente.', '#ffb0a0'); SE.audio.play('error'); return false; }
    s.money -= def.price;
    const c = SE.MAPS.farm.curral;
    const used = s.animals.map((a) => a.name);
    const name = def.names.find((nm) => !used.includes(nm)) || def.name + ' ' + (s.animals.length + 1);
    s.animals.push({ id: s.uid++, kind, name, aff: 100, pet: false, prod: 0, x: (SE.ri(c.x0, c.x1)) * T + 8, y: SE.ri(c.y0, c.y1) * T + 12, left: false, t: 0, tx: 0, ty: 0 });
    SE.audio.play('coin');
    SE.say(def.name + ' "' + name + '" chega amanhã cedo... brincadeira, já está no curral do sítio!');
    SE.checkGoals();
    return true;
  };
  SE.animalInteract = function (a) {
    const s = SE.state, def = SE.ANIMALS[a.kind];
    let msg = [];
    if (a.prod > 0) {
      const left = SE.give(def.product, a.prod);
      a.prod = left;
    }
    if (!a.pet) {
      a.pet = true; a.aff = Math.min(1000, a.aff + 25); a.heart = 1.5;
      SE.audio.play(a.kind === 'galinha' ? 'cluck' : 'moo');
      msg.push(a.name + ' adorou o carinho!');
    }
    msg.push(a.name + ' (' + def.name.toLowerCase() + ') · afeição ' + SE.hearts(a.aff) + '/10');
    SE.toast(msg.join(' '), '#ffd0e0');
  };
  SE.updateAnimals = function (dt) {
    const c = SE.MAPS.farm.curral;
    SE.state.animals.forEach((a) => {
      a.t -= dt;
      if (a.heart > 0) a.heart -= dt;
      if (a.t <= 0) {
        a.t = SE.rand(2, 6);
        a.tx = SE.rand(c.x0 * T + 4, (c.x1 + 1) * T - 4); a.ty = SE.rand(c.y0 * T + 8, (c.y1 + 1) * T - 2);
        a.walk = Math.random() < 0.6;
      }
      if (a.walk) {
        const sp = a.kind === 'galinha' ? 16 : 10;
        const dx = a.tx - a.x, dy = a.ty - a.y, d = Math.hypot(dx, dy);
        if (d > 1) { a.x += (dx / d) * sp * dt; a.y += (dy / d) * sp * dt; a.left = dx < 0; a.anim = (a.anim || 0) + dt; }
        else a.walk = false;
      }
    });
  };

  // ---------------------------------------------------------------- Beneficiamento
  SE.recipeOk = function (rid) {
    const r = SE.RECIPES[rid];
    return Object.keys(r.inp).every((k) => SE.invCount(k) >= r.inp[k]);
  };
  SE.recipeText = function (rid) {
    const r = SE.RECIPES[rid];
    return Object.keys(r.inp).map((k) => r.inp[k] + ' ' + SE.ITEMS[k].name).join(' + ') + ' → ' + r.n + ' ' + SE.itemName(r.out);
  };
  SE.startRecipe = function (stId, rid) {
    const st = SE.state.stations[stId], r = SE.RECIPES[rid];
    if (st.slots.length >= SE.STATION_SLOTS) { SE.toast('Todas as vagas estão ocupadas.', '#ffb0a0'); return false; }
    if (!SE.recipeOk(rid)) { SE.toast('Faltam ingredientes.', '#ffb0a0'); SE.audio.play('error'); return false; }
    Object.keys(r.inp).forEach((k) => SE.invRemove(k, r.inp[k]));
    st.slots.push({ r: rid, d: r.days });
    SE.audio.play('plant');
    SE.toast(SE.itemName(r.out) + ' em preparo: pronto em ' + r.days + (r.days > 1 ? ' dias' : ' dia'), '#ffe08a');
    return true;
  };
  SE.collectStation = function (stId) {
    const st = SE.state.stations[stId];
    let got = 0;
    let full = false;
    st.slots = st.slots.filter((sl) => {
      if (sl.d > 0) return true;
      const r = SE.RECIPES[sl.r];
      if (SE.invSpace(r.out) < r.n) { full = true; return true; }
      SE.give(r.out, r.n);
      got += r.n;
      SE.state.stats.artesanal += r.n;
      return false;
    });
    if (full) SE.toast('Mochila cheia! Libere espaço para recolher.', '#ffb0a0');
    if (got) { SE.audio.play('harvest'); SE.checkGoals(); }
    return got;
  };

  // ---------------------------------------------------------------- Projetos
  SE.contribute = function (pid, amt) {
    const s = SE.state, p = SE.PROJECTS.find((x) => x.id === pid);
    amt = Math.min(amt, s.money, p.cost - s.proj[pid]);
    if (amt <= 0) return;
    s.money -= amt; s.proj[pid] += amt;
    SE.audio.play('coin');
    if (s.proj[pid] >= p.cost && !s.projDone[pid]) {
      s.projDone[pid] = true;
      SE.audio.play('goal');
      const msgs = {
        praca: ['A praça foi reformada! Bancos novos, coreto pintado e jardim florido.', 'O Padre Bento já marcou uma serenata de viola para sábado.'],
        escola: ['A escola reabriu! A Professora Marta chorou de alegria ao tocar o sino.', 'Três famílias já se mudaram de volta para a serra.'],
        estacao: ['O apito do trem voltou a ecoar na serra! A estação está reaberta.', 'O vilarejo está de volta à vida. Seu avô Benedito teria muito orgulho.', 'Você completou a grande meta desta versão. Mas a vida no sítio continua!'],
      };
      SE.say(msgs[pid]);
    } else SE.toast('Contribuição de ' + SE.money(amt) + ' para ' + p.name, '#ffe08a');
    SE.checkGoals();
  };
  SE.feiraBonus = function () {
    const s = SE.state;
    let b = 0;
    SE.PROJECTS.forEach((p) => { if (s.projDone[p.id]) b += p.bonus; });
    if (s.news && SE.NEWS[s.news.i].clientes) b += SE.NEWS[s.news.i].clientes;
    return b;
  };

  // ---------------------------------------------------------------- Objetivos
  SE.currentGoal = () => SE.OBJECTIVES[SE.state.goal];
  SE.checkGoals = function () {
    const s = SE.state;
    while (s.goal < SE.OBJECTIVES.length && SE.OBJECTIVES[s.goal].ok(s)) {
      SE.toast('Objetivo concluído: ' + SE.OBJECTIVES[s.goal].t, '#a0e0ff');
      SE.audio.play('goal');
      s.goal++;
    }
  };

  // ---------------------------------------------------------------- Ação principal (Espaço)
  SE.act = function () {
    const s = SE.state, m = SE.MAPS[s.map];
    const [fx, fy] = SE.frontPoint();
    const tx = Math.floor(fx / T), ty = Math.floor(fy / T);
    const npc = SE.npcAtPoint(fx, fy);
    if (npc) return SE.npcInteract(npc);
    const an = SE.animalAtPoint(fx, fy);
    if (an) return SE.animalInteract(an);
    const b = SE.buildingAt(m, tx, ty, s);
    if (b) return SE.buildingInteract(b);
    const k = SE.key(tx, ty);
    if (m.id === 'farm') {
      if (s.forage[k]) {
        const id = s.forage[k];
        if (SE.give(id, 1) === 0) { delete s.forage[k]; SE.audio.play('harvest'); }
        return;
      }
      if (s.hives[k]) {
        const h = s.hives[k];
        if (h.mel) { if (SE.give('mel', 1) === 0) { h.mel = false; SE.audio.play('harvest'); } }
        else SE.toast('As abelhas ainda estão trabalhando. Volte em alguns dias.', '#ffe08a');
        return;
      }
      const soil = s.soil[k];
      if (soil && soil.c && soil.c.ready) return harvest(k, soil);
      if (soil && soil.c && soil.c.dead) { soil.c = null; SE.audio.play('cut'); SE.toast('Você arrancou a planta morta.', '#e0d0b0'); return; }
    }
    const it = s.inv[s.sel];
    if (!it) return;
    useItem(it, m, tx, ty, k);
  };

  function harvest(k, soil) {
    const s = SE.state, c = soil.c, d = SE.CROPS[c.id];
    const n = SE.ri(d.yield[0], d.yield[1]);
    if (SE.invSpace(d.item) < n) { SE.toast('Mochila cheia!', '#ffb0a0'); SE.audio.play('error'); return; }
    SE.give(d.item, n);
    s.stats.colhido += n;
    if (d.regrow) { c.ready = false; c.age = d.days - d.regrow; }
    else soil.c = null;
    SE.audio.play('harvest');
    SE.player.tool = 'colher'; SE.player.toolT = 0.25;
    SE.checkGoals();
  }

  function useItem(it, m, tx, ty, k) {
    const s = SE.state, def = SE.ITEMS[it.id];
    const g = SE.groundAt(m, tx, ty), o = SE.objAt(m, tx, ty);
    const farm = m.id === 'farm';
    const soil = farm ? s.soil[k] : null;
    const anim = (t) => { SE.player.tool = t; SE.player.toolT = 0.25; };
    switch (it.id) {
      case 'enxada':
        if (!farm || g !== 'g' || o || soil || SE.inCurral(tx, ty)) { if (soil) SE.toast('A terra já está arada.', '#e0d0b0'); else if (o === 'm') SE.toast('Roce o mato com a foice primeiro.', '#e0d0b0'); return; }
        if (!SE.useEnergy(2)) return;
        s.soil[k] = { w: SE.isRaining() ? 1 : 0, c: null };
        anim('enxada'); SE.audio.play('hoe');
        return;
      case 'regador':
        if (g === 'w') { s.water = s.waterMax; SE.audio.play('water'); SE.toast('Regador cheio (' + s.water + '/' + s.waterMax + ')', '#a0d0ff'); return; }
        if (!soil) return;
        if (s.water <= 0) { SE.toast('Regador vazio! Encha no poço ou no rio.', '#ffb0a0'); SE.audio.play('error'); return; }
        if (!SE.useEnergy(1)) return;
        s.water--; anim('regador'); SE.audio.play('water');
        if (!soil.w) { soil.w = 1; if (soil.c) s.stats.regado++; }
        SE.checkGoals();
        return;
      case 'foice':
        if (o === 'm' || o === 'b') {
          if (!SE.useEnergy(o === 'b' ? 2 : 1)) return;
          SE.setObj(m, tx, ty, ''); anim('foice'); SE.audio.play('cut');
          if (o === 'm') { s.stats.mato++; if (Math.random() < 0.6) SE.give('capim', 1); }
          else SE.give('madeira', 1);
          SE.checkGoals();
        }
        return;
      case 'machado':
        if (o === 'k') { if (!SE.useEnergy(3)) return; SE.setObj(m, tx, ty, ''); anim('machado'); SE.audio.play('hit'); SE.give('madeira', SE.ri(2, 3)); }
        else if ('TPJAI'.includes(o) && o) SE.toast('Essa árvore é antiga e dá sombra boa. Melhor deixar.', '#e0d0b0');
        return;
      case 'picareta':
        if (o === 'p') { if (!SE.useEnergy(3)) return; SE.setObj(m, tx, ty, ''); anim('picareta'); SE.audio.play('hit'); SE.give('pedra', SE.ri(1, 2)); }
        else if (soil && !soil.c) { delete s.soil[k]; anim('picareta'); SE.audio.play('hoe'); }
        return;
      case 'colmeia':
        if (!farm || g !== 'g' || o || soil || s.forage[k] || SE.inCurral(tx, ty)) { SE.toast('Escolha um pedaço de grama livre.', '#e0d0b0'); return; }
        SE.invRemoveAt(s.sel, 1);
        SE.setObj(m, tx, ty, 'h'); s.hives[k] = { d: 0, mel: false };
        SE.audio.play('plant'); SE.toast('Colmeia instalada! As abelhas fazem mel a cada poucos dias.', '#ffe08a');
        return;
    }
    if (def.cat === 'seed') {
      if (!soil) { SE.toast('Are a terra com a enxada antes de plantar.', '#e0d0b0'); return; }
      if (soil.c) return;
      const crop = SE.CROPS[def.crop], ep = SE.cal().epoca;
      if (!crop.epocas.includes(ep)) { SE.toast('Fora de época! ' + crop.name + ' se planta na ' + SE.EPOCAS[crop.epocas[0]].name.toLowerCase() + '.', '#ffb0a0'); SE.audio.play('error'); return; }
      soil.c = { id: def.crop, age: 0, ready: false, dry: 0, dead: false };
      SE.invRemoveAt(s.sel, 1);
      s.stats.plantado++;
      SE.audio.play('plant');
      SE.checkGoals();
      return;
    }
    if (def.cat === 'feed') { SE.toast('Coloque no cocho do curral.', '#e0d0b0'); return; }
    if (def.eat) {
      SE.say('Comer ' + SE.itemName(it.id) + '? (+' + def.eat + ' de energia)', { choices: [{ t: 'Comer', fn: () => SE.eat(it.id) }, { t: 'Agora não', fn: () => {} }] });
    }
  }
  SE.inCurral = function (tx, ty) {
    const c = SE.MAPS.farm.curral;
    return tx >= c.x0 - 1 && tx <= c.x1 + 1 && ty >= c.y0 - 2 && ty <= c.y1 + 1;
  };

  // ---------------------------------------------------------------- Construções
  SE.buildingInteract = function (b) {
    const s = SE.state, h = s.time / 60, cal = SE.cal();
    switch (b.act) {
      case 'casa':
        if (!s.flags.carta) {
          s.flags.carta = true;
          SE.say([
            { who: null, text: 'Em cima da mesa de madeira, um envelope amarelado com seu nome, na letra caprichada do vovô Benedito:' },
            { who: null, text: '"Se você está lendo isto, o sítio agora é seu. Ele anda cansado, igual eu andava. Mas a terra daqui é generosa com quem cuida dela."' },
            { who: null, text: '"Roce o mato, plante na época certa, trate bem os bichos e não tenha vergonha de vender na feira. O povo da vila vai te ajudar."' },
            { who: null, text: '"E se puder, ajude a serra a voltar a ser o que era. Com carinho, Vô Benedito."' },
          ]);
          return;
        }
        {
          const ch = [{ t: 'Dormir', fn: () => SE.sleep(false) }, { t: 'Ainda não', fn: () => {} }];
          if (h < 18) ch.reverse();
          SE.say(h < 18 ? 'Ainda é cedo... Quer mesmo dormir e encerrar o dia?' : 'Casa de taipa do vovô. Hora de descansar?', { choices: ch });
        }
        return;
      case 'poco':
        s.water = s.waterMax; SE.audio.play('water');
        SE.toast('Regador cheio (' + s.water + '/' + s.waterMax + '). Água fresquinha do poço!', '#a0d0ff');
        return;
      case 'caixote': SE.openPanel(SE.CaixotePanel()); return;
      case 'station': {
        const st = s.stations[b.id], def = SE.STATIONS[b.id];
        if (!st.ok) { SE.say(def.name + ' está abandonado, com teia de aranha e cupim. Dá pra restaurar no Armazém do Seu Jorge (aba Obras) por ' + SE.money(def.restore) + '.'); return; }
        SE.collectStation(b.id);
        SE.openPanel(SE.StationPanel(b.id));
        return;
      }
      case 'cocho': {
        const cap = SE.invCount('capim'), rac = SE.invCount('racao');
        if (cap + rac > 0) {
          SE.invRemove('capim', cap); SE.invRemove('racao', rac); s.cocho += cap + rac;
          SE.audio.play('plant');
          SE.toast('Você encheu o cocho: ' + s.cocho + ' porções.', '#bff0a0');
        } else {
          SE.say('Cocho com ' + s.cocho + ' porções. Cada bicho come uma por dia. ' +
            (cal.epoca === 'aguas' ? 'Nas águas o pasto está verde e os bichos comem sozinhos.' : 'Na seca o pasto some: mantenha o cocho cheio de capim ou ração!'));
        }
        return;
      }
      case 'armazem':
        if (cal.wd === 6 || h < 8 || h >= 18) { SE.say('Fechado. O armazém abre de segunda a sábado, das 8h às 18h.'); return; }
        s.npcs.jorge.met = true; SE.checkGoals();
        SE.audio.play('door');
        SE.openPanel(SE.ShopPanel());
        return;
      case 'pensao':
        if (h < 6 || h >= 21) { SE.say('A pensão está fechada. Dona Cida abre às 6h.'); return; }
        SE.audio.play('door'); SE.openPanel(SE.FoodPanel('pensao', 'Pensão da Dona Cida')); return;
      case 'bar':
        if (h < 10) { SE.say('O bar abre às 10h. O Zé deve estar dormindo ainda.'); return; }
        SE.audio.play('door'); SE.openPanel(SE.FoodPanel('bar', 'Bar do Zé')); return;
      case 'igreja':
        if (h >= 17 && h < 20 && !s.flags['viola' + s.day]) {
          s.flags['viola' + s.day] = true;
          s.energy = Math.min(s.maxEnergy, s.energy + 10);
          SE.say('Você senta na escadaria e escuta o Padre Bento ponteando a viola. Que paz! (+10 de energia)');
        } else SE.say('A Igreja de São Benedito, branquinha no alto da praça. O sino ainda toca às seis da tarde.');
        return;
      case 'escola':
        SE.say(s.projDone.escola ? 'Lá dentro, as crianças cantam a tabuada. A Professora Marta acena da janela.' : 'As janelas estão pregadas com tábuas. Na porta, um aviso desbotado: "Escola fechada por falta de alunos". Contribua no mural da praça para reabrir.');
        return;
      case 'estacao':
        SE.say(s.projDone.estacao ? 'O trem das quatro voltou! Gente chegando e saindo com malas e sacolas.' : 'A estação está fechada há anos. O relógio parou às 4h10. Dizem que, se o vilarejo crescer, o trem volta a parar.');
        return;
      case 'casavila': SE.say('A casa do Seu Tião e da Dona Nena. Sai um cheirinho de melado pela janela.'); return;
      case 'ponto': SE.say('Ponto de ônibus. Foi aqui que você desceu com a mala. O ônibus para a cidade passa só às segundas.'); return;
      case 'mural': SE.openPanel(SE.MuralPanel()); return;
      case 'feirante': SE.say(SE.pick(['"Olha a alface fresquinha, freguesia!"', '"Pastel de queijo saindo agora!"', '"Leva três, paga dois!"'])); return;
      case 'feira':
        if (!SE.isFeiraDay(s)) { SE.say('A feira livre acontece aos sábados, das 7h às 13h. Traga seus produtos e defina seus preços!'); return; }
        if (h < 7) { SE.say('Ainda está cedo. A feira começa às 7h.'); return; }
        if (h >= 12) { SE.say('A feira já está acabando. Volte no próximo sábado, bem cedinho!'); return; }
        if (s.flags['feira' + s.day]) { SE.say('Você já montou sua barraca hoje.'); return; }
        SE.openPanel(SE.FeiraSetupPanel());
        return;
    }
  };

  // ---------------------------------------------------------------- Dormir e virar o dia
  SE.sleep = function (passedOut) {
    const s = SE.state;
    SE.audio.play('sleep');
    SE.fadeTo(() => {
      const rep = SE.endDay(passedOut);
      SE.openPanel(SE.DayPanel(rep));
    });
  };

  SE.endDay = function (passedOut) {
    const s = SE.state;
    const cal0 = SE.cal();
    const rep = { lines: [], earned: 0, day: s.day };
    const lateBed = s.time >= 24 * 60;

    // Plantas
    let grew = 0, dried = 0, spoiled = 0;
    Object.keys(s.soil).forEach((k) => {
      const so = s.soil[k], c = so.c;
      if (c && !c.dead) {
        const d = SE.CROPS[c.id];
        if (c.ready) {
          if (s.weather === 'tempestade' && !d.perene && Math.random() < 0.25) { c.dead = true; spoiled++; }
        } else if (so.w) {
          c.age += cal0.epoca === 'aguas' ? 1.25 : 1; c.dry = 0; grew++;
          if (c.age >= d.days) { c.ready = true; }
        } else if (cal0.epoca === 'seca' && !d.perene) {
          c.dry++;
          if (c.dry >= 2) { c.dead = true; dried++; }
        }
      }
      so.w = 0;
    });
    if (spoiled) rep.lines.push('O temporal estragou ' + spoiled + (spoiled > 1 ? ' plantas maduras.' : ' planta madura.') + ' Colha logo quando estiver pronto!');
    if (dried) rep.lines.push(dried + (dried > 1 ? ' plantas murcharam' : ' planta murchou') + ' de sede. Na seca, regue todo dia!');

    // Caixote
    if (s.caixote.length) {
      let tot = 0;
      s.caixote.forEach((it) => { tot += SE.jorgePrice(it.id) * it.q; SE.marketSold(it.id, it.q); s.stats.vendidos += it.q; });
      s.caixote = [];
      SE.earn(tot); rep.earned += tot;
      rep.lines.push('O caminhão do Seu Jorge passou e pagou ' + SE.money(tot) + ' pelo caixote.');
    }

    // Bichos
    let hungry = 0, prod = 0;
    s.animals.forEach((a) => {
      let fed = cal0.epoca === 'aguas';
      if (!fed && s.cocho > 0) { s.cocho--; fed = true; }
      if (!fed) { a.aff = Math.max(0, a.aff - 40); hungry++; a.prod = 0; }
      else {
        a.aff = SE.clamp(a.aff + 5 - (a.pet ? 0 : 10), 0, 1000);
        let n = 1;
        if (a.aff >= 700) n = a.kind === 'galinha' ? (Math.random() < 0.5 ? 2 : 1) : 2;
        a.prod = Math.max(a.prod, n); prod++;
      }
      a.pet = false;
    });
    if (hungry) rep.lines.push(hungry + (hungry > 1 ? ' bichos passaram' : ' bicho passou') + ' fome! Encha o cocho do curral.');
    if (prod) rep.lines.push('Os bichos produziram. Passe no curral para recolher ovos e leite.');

    // Colmeias
    Object.keys(s.hives).forEach((k) => { const h = s.hives[k]; if (!h.mel) { h.d++; if (h.d >= (cal0.epoca === 'aguas' ? 3 : 4)) { h.mel = true; h.d = 0; } } });

    // Beneficiamento
    let ready = 0;
    Object.keys(s.stations).forEach((id) => s.stations[id].slots.forEach((sl) => { if (sl.d > 0) { sl.d--; if (sl.d === 0) ready++; } }));
    if (ready) rep.lines.push(ready + (ready > 1 ? ' produtos artesanais ficaram prontos.' : ' produto artesanal ficou pronto.'));

    // Mercado
    Object.keys(s.market).forEach((id) => { s.market[id] = SE.clamp(s.market[id] + (1 - s.market[id]) * 0.15 + SE.rand(-0.03, 0.03), 0.5, 1.6); });

    // Novo dia
    s.day++;
    const cal = SE.cal();
    s.weather = s.nextWeather;
    s.nextWeather = rollWeather(SE.cal({ day: s.day + 1 }).epoca);
    if (cal.epoca !== cal0.epoca) {
      let died = 0;
      Object.keys(s.soil).forEach((k) => { const c = s.soil[k].c; if (c && !c.dead && !SE.CROPS[c.id].epocas.includes(cal.epoca)) { c.dead = true; died++; } });
      rep.lines.unshift(cal.epoca === 'seca'
        ? 'Chegou a ÉPOCA DA SECA! O céu fica azul e o pasto amarela. Regue todo dia e encha o cocho.' + (died ? ' ' + died + ' plantas das águas não resistiram.' : '')
        : 'Chegou a ÉPOCA DAS ÁGUAS! A chuva volta e tudo cresce ligeiro.' + (died ? ' ' + died + ' plantas da seca não resistiram.' : ''));
      rep.epoca = cal.epoca;
    }
    if (SE.isRaining()) Object.keys(s.soil).forEach((k) => { s.soil[k].w = 1; });

    // Frutas do mato e mato novo
    const m = SE.MAPS.farm;
    const nForage = Object.keys(s.forage).length;
    if (nForage < 12) {
      const fruit = { P: 'pequi', J: 'jabuticaba', A: 'araticum' };
      for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
        const o = s.farmObj[y * m.w + x];
        if (!fruit[o] || Math.random() > (cal.epoca === 'aguas' ? 0.4 : 0.12)) continue;
        const [dx, dy] = SE.pick([[0, 1], [1, 0], [-1, 0], [1, 1], [-1, 1]]);
        const fx = x + dx, fy = y + dy, k = SE.key(fx, fy);
        if (SE.groundAt(m, fx, fy) === 'g' && !s.farmObj[fy * m.w + fx] && !s.soil[k] && !s.forage[k]) s.forage[k] = fruit[o];
      }
    }
    for (let i = 0; i < (cal.epoca === 'aguas' ? 8 : 2); i++) {
      const x = SE.ri(1, m.w - 2), y = SE.ri(4, m.h - 4), k = SE.key(x, y);
      if (SE.groundAt(m, x, y) === 'g' && !s.farmObj[y * m.w + x] && !s.soil[k] && !s.forage[k] && !SE.buildingAt(m, x, y, s) && !SE.buildingAt(m, x, y - 1, s) && !SE.inCurral(x, y)) s.farmObj[y * m.w + x] = 'm';
    }

    // Jornal de segunda
    if (s.news && s.day > s.news.until) s.news = null;
    if (cal.wd === 0) {
      let i; do { i = SE.ri(0, SE.NEWS.length - 1); } while (i === s.lastNews && SE.NEWS.length > 1);
      s.news = { i, until: s.day + 6 }; s.lastNews = i;
      rep.news = true;
    }

    // Energia e penalidades
    if (passedOut) {
      const lost = Math.min(100, Math.round(s.money * 0.1));
      s.money -= lost;
      s.energy = Math.round(s.maxEnergy * 0.5);
      rep.lines.unshift('Você apagou de cansaço no meio da noite! A Dra. Lúcia te achou e te levou pra casa.' + (lost ? ' Gastou ' + SE.money(lost) + ' com remédio.' : ''));
    } else s.energy = lateBed ? Math.round(s.maxEnergy * 0.85) : s.maxEnergy;

    s.time = SE.DAY_START;
    s.map = 'farm'; s.px = 7 * T + 8; s.py = 8 * T + 12; s.dir = 0;
    SE.player.x = s.px; SE.player.y = s.py; SE.player.dir = 0;
    rep.forecast = s.nextWeather;
    SE.saveGame(true);
    return rep;
  };

  // ---------------------------------------------------------------- Salvar
  SE.saveGame = function (quiet) {
    const s = SE.state, p = SE.player;
    s.px = p.x; s.py = p.y; s.dir = p.dir;
    try {
      localStorage.setItem(SE.SAVE_KEY, JSON.stringify(s));
      if (!quiet) SE.toast('Jogo salvo!', '#bff0a0');
      return true;
    } catch (e) {
      if (!quiet) SE.toast('Não foi possível salvar neste navegador.', '#ffb0a0');
      return false;
    }
  };
  SE.loadGame = function () {
    try {
      const raw = localStorage.getItem(SE.SAVE_KEY);
      if (!raw) return null;
      const s = JSON.parse(raw);
      return s && s.v === 1 ? s : null;
    } catch (e) { return null; }
  };
})(window.SE);
