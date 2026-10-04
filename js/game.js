'use strict';
// Regras do jogo: estado, calendário, inventário, habilidades, mercado, ações e virada do dia.
(function (SE) {
  const T = SE.T;
  SE.MIN_PER_SEC = 10 / 7; // 10 minutos do jogo a cada 7 segundos
  SE.DAY_START = 6 * 60;
  SE.PASS_OUT = 26 * 60; // 2h da manhã
  SE.INV_SIZE = 36;
  SE.HOTBAR = 12;
  const MAXQ = 99;

  // ---------------------------------------------------------------- Estado
  SE.newState = function (name, look) {
    const s = {
      v: 2, name: name || 'Joca', look: look || 0, money: 500, energy: 100, maxEnergy: 100, hp: 100, maxHp: 100,
      day: 1, time: SE.DAY_START, weather: 'sol', nextWeather: 'chuva',
      map: 'farm', px: 7 * T + 8, py: 8 * T + 12, dir: 0,
      inv: new Array(SE.INV_SIZE).fill(null), sel: 0, water: 20, waterMax: 20,
      farmObj: SE.genFarmObj(), soil: {}, forage: {}, hives: {}, chests: {}, furn: {},
      animals: [], cocho: 0, uid: 1,
      stations: { fogao: { ok: true, slots: [] }, engenho: { ok: false, slots: [] }, casa_farinha: { ok: false, slots: [] }, terreiro: { ok: false, slots: [] } },
      npcs: {}, market: {}, news: null, lastNews: -1, proj: { praca: 0, escola: 0, estacao: 0 }, projDone: {}, flags: {}, caixote: [],
      stats: { mato: 0, plantado: 0, regado: 0, colhido: 0, feiras: 0, artesanal: 0, ganho: 0, vendidos: 0, peixes: 0, monstros: 0 },
      goal: 0,
    };
    upgradeState(s);
    [['enxada', 1], ['regador', 1], ['foice', 1], ['machado', 1], ['picareta', 1], ['sem_milho', 12], ['sem_feijao', 8]].forEach(([id, q], i) => { s.inv[i] = { id, q }; });
    return s;
  };
  // campos da v0.2 (também usado para migrar saves da v0.1)
  function upgradeState(s) {
    s.v = 2;
    while (s.inv.length < SE.INV_SIZE) s.inv.push(null);
    if (s.hp === undefined) { s.hp = 100; s.maxHp = 100; }
    s.tools = s.tools || { enxada: 0, regador: 0, machado: 0, picareta: 0 };
    if (s.waterMax >= 40 && !s.tools.regador) s.tools.regador = 1;
    s.waterMax = 20 * (1 + s.tools.regador);
    s.water = Math.min(s.water, s.waterMax);
    s.xp = s.xp || {}; s.lvl = s.lvl || {};
    SE.SKILLS.forEach((k) => { s.xp[k.id] = s.xp[k.id] || 0; s.lvl[k.id] = s.lvl[k.id] || 0; });
    s.mail = s.mail || []; s.mailSent = s.mailSent || {};
    s.mine = s.mine || { deepest: 0 };
    s.chests = s.chests || {}; s.furn = s.furn || {};
    s.upgrade = s.upgrade || null;
    s.stats.peixes = s.stats.peixes || 0; s.stats.monstros = s.stats.monstros || 0;
    Object.keys(SE.NPCS).forEach((id) => { if (!s.npcs[id]) s.npcs[id] = { f: 0, met: false, talk: 0, gift: 0 }; });
    SE.cleanFarmObj(s.farmObj);
    return s;
  }

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
  SE.isTool = (id) => { const c = SE.ITEMS[id].cat; return c === 'tool' || c === 'weapon'; };
  SE.invAdd = function (id, q) {
    const s = SE.state, tool = SE.isTool(id);
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
    let n = 0; const tool = SE.isTool(id);
    SE.state.inv.forEach((it) => { if (!it) n += tool ? 1 : MAXQ; else if (!tool && it.id === id) n += MAXQ - it.q; });
    return n;
  };
  SE.give = function (id, q, quiet) {
    const left = SE.invAdd(id, q);
    if (!quiet && q - left > 0) SE.toast('+' + (q - left) + ' ' + SE.itemName(id), '#bff0a0', id);
    if (left > 0) SE.toast('Mochila cheia!', '#ffb0a0');
    if (id === 'minerio_cobre' && !SE.state.flags.cobre) SE.state.flags.cobre = true;
    return left;
  };

  SE.useEnergy = function (n) {
    const s = SE.state;
    if (s.energy < Math.min(n, 1) || s.energy <= 0) { SE.toast('Sem energia! Coma algo ou vá dormir.', '#ffb0a0'); SE.audio.play('error'); return false; }
    s.energy = Math.max(0, s.energy - n);
    return true;
  };
  // custo de energia reduzido pela habilidade
  SE.cost = (base, skill) => base * Math.max(0.5, 1 - 0.06 * (SE.state.lvl[skill] || 0));
  SE.eat = function (id) {
    const it = SE.ITEMS[id], s = SE.state;
    if (!it.eat || !SE.invRemove(id, 1)) return;
    s.energy = Math.min(s.maxEnergy, s.energy + it.eat);
    s.hp = Math.min(s.maxHp, s.hp + Math.round(it.eat * 0.45));
    SE.toast('Você comeu ' + SE.itemName(id) + '. +' + it.eat + ' energia', '#ffe08a', id);
    SE.audio.play('harvest');
  };

  // ---------------------------------------------------------------- Habilidades
  SE.addXP = function (skill, n) { SE.state.xp[skill] = (SE.state.xp[skill] || 0) + Math.max(1, Math.round(n)); };
  SE.skillName = (k) => SE.SKILLS.find((x) => x.id === k).name;

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
  SE.itemName = function (id) {
    if (id === 'rapadura' && SE.state && SE.state.flags.receita) return 'Rapadura da Serra';
    const lvl = SE.toolLvl(id);
    if (lvl > 0) return SE.ITEMS[id].name + ' ' + SE.UPGRADES[lvl - 1].name;
    return SE.ITEMS[id].name;
  };

  // ---------------------------------------------------------------- Jogador e mira
  SE.player = { x: 0, y: 0, dir: 0, frame: 0, animT: 0, moving: false, tool: null, toolT: 0, charge: null, inv: 0, kx: 0, ky: 0 };
  SE.DIRS = [[0, 1], [0, -1], [-1, 0], [1, 0]];
  SE.frontPoint = function () {
    const p = SE.player, d = SE.DIRS[p.dir];
    return [p.x + d[0] * 13, p.y - 5 + d[1] * 13];
  };
  SE.frontTile = function () { const [x, y] = SE.frontPoint(); return [Math.floor(x / T), Math.floor(y / T)]; };
  // tiles atingidos pela ferramenta carregada: 0 = 1 tile, 1 = linha de 3, 2 = linha de 5, 3 = área 3×3
  SE.toolTiles = function (charge) {
    const [fx, fy] = SE.frontTile(), d = SE.DIRS[SE.player.dir];
    const out = [];
    if (charge >= 3) { for (let a = -1; a <= 1; a++) for (let b = 0; b <= 2; b++) out.push([fx + d[0] * b + (d[1] ? a : 0), fy + d[1] * b + (d[0] ? a : 0)]); return out; }
    const n = charge === 2 ? 5 : charge === 1 ? 3 : 1;
    for (let i = 0; i < n; i++) out.push([fx + d[0] * i, fy + d[1] * i]);
    return out;
  };

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
      if (r.visible && Math.abs(r.x - x) < 9 && y > r.y - 26 && y < r.y + 4) return id;
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
    const s = SE.state, st = s.npcs[id], r = SE.npcRT[id];
    const p = SE.player;
    r.dir = p.dir === 0 ? 1 : p.dir === 1 ? 0 : p.dir === 2 ? 3 : 2;
    r.talking = 4;
    const held = s.inv[s.sel];
    const canGift = held && !SE.isTool(held.id) && st.gift !== s.day && st.met;
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
    let text, emo = 'n';
    if (!st.met) { text = n.lines[0][0]; st.met = true; emo = 'h'; }
    else {
      const tier = st.f >= 600 ? 2 : st.f >= 250 ? 1 : 0;
      const pool = [].concat(...n.lines.slice(0, tier + 1)).slice(1);
      const ep = SE.cal().epoca;
      if (Math.random() < 0.3) pool.push(ep === 'seca' ? 'Na seca a poeira sobe e o céu fica azul que dói. Guarde água!' : 'Nas águas tudo cresce ligeiro. Só cuidado com o temporal!');
      if (SE.isFeiraDay(s)) pool.push('Hoje é dia de feira! Já montou sua barraca na praça?');
      if (s.mine.deepest > 0 && Math.random() < 0.25) pool.push('Ouvi dizer que você anda descendo a gruta. Cuidado lá embaixo!');
      text = SE.pick(pool);
      if (tier >= 1) emo = 'h';
    }
    if (st.talk !== s.day) { st.talk = s.day; st.f += 20; }
    const lines = [{ who: id, text, emo }];
    if (id === 'tiao' && st.f >= 500 && !s.flags.receita) {
      s.flags.receita = true;
      lines.push({ who: id, text: 'Escuta... a Nena e eu conversamos. A receita da Rapadura da Serra precisa de alguém pra continuar.' });
      lines.push({ who: id, text: 'O segredo é o ponto do melado e um tiquinho de cravo. Agora é sua. Cuida bem dela.', emo: 'h' });
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
    let d, text, emo = 'h';
    if (n.loves.includes(item)) { d = 120; text = 'Não acredito! Eu AMO isso! Você é um amor de pessoa.'; SE.audio.play('love'); }
    else if (n.likes.includes(item)) { d = 60; text = 'Ah, que gentileza! Gostei muito.'; SE.audio.play('select'); }
    else if (n.dislikes.includes(item)) { d = -30; text = 'Hmm... isso aí não é muito a minha praia, não.'; emo = 's'; SE.audio.play('error'); }
    else { d = 30; text = 'Que presente bom! Obrigado pela lembrança.'; emo = 'n'; SE.audio.play('select'); }
    st.f = SE.clamp(st.f + d, 0, 1000);
    SE.say([{ who: id, text, emo }]);
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
    SE.say(def.name + ' "' + name + '" já está no curral do sítio!');
    SE.checkGoals();
    return true;
  };
  SE.animalInteract = function (a) {
    const def = SE.ANIMALS[a.kind];
    const msg = [];
    if (a.prod > 0) {
      const n = a.prod;
      const left = SE.give(def.product, a.prod);
      a.prod = left;
      SE.addXP('agricultura', 5 * (n - left));
    }
    if (!a.pet) {
      a.pet = true; a.aff = Math.min(1000, a.aff + 25); a.heart = 1.5;
      SE.audio.play(a.kind === 'galinha' ? 'cluck' : 'moo');
      msg.push(a.name + ' adorou o carinho!');
      SE.addXP('agricultura', 3);
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
  SE.inpText = (inp) => Object.keys(inp).map((k) => inp[k] + ' ' + SE.ITEMS[k].name).join(' + ');
  SE.recipeText = function (rid) {
    const r = SE.RECIPES[rid];
    return SE.inpText(r.inp) + ' → ' + r.n + ' ' + SE.itemName(r.out);
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
  SE.slotReady = (sl) => sl.d <= 0;
  SE.collectStation = function (stId) {
    const st = SE.state.stations[stId];
    let got = 0;
    let full = false;
    st.slots = st.slots.filter((sl) => {
      if (!SE.slotReady(sl)) return true;
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

  // ---------------------------------------------------------------- Fornalha (tempo em minutos)
  SE.furnaceTick = function (mins) {
    const f = SE.state.furn;
    Object.keys(f).forEach((k) => { if (f[k].out && f[k].m > 0) f[k].m = Math.max(0, f[k].m - mins); });
  };
  function furnaceInteract(k) {
    const s = SE.state, f = s.furn[k] || (s.furn[k] = { out: null, m: 0 });
    if (f.out && f.m <= 0) {
      if (SE.give(f.out, 1) === 0) { f.out = null; SE.audio.play('harvest'); }
      return;
    }
    if (f.out) { SE.toast('Derretendo: ' + SE.ITEMS[f.out].name + ' em ' + Math.ceil(f.m) + ' min.', '#ffe08a'); return; }
    const held = s.inv[s.sel];
    const rec = held && SE.SMELT[held.id];
    if (!rec) { SE.say('Fornalha: segure minério na mão (5 minérios + 1 carvão) e use aqui.' + (SE.invCount('carvao') ? '' : ' Carvão sai das pedras da gruta ou da ferraria.')); return; }
    if (SE.invCount(held.id) < rec.n) { SE.toast('Precisa de ' + rec.n + ' ' + SE.ITEMS[held.id].name + '.', '#ffb0a0'); SE.audio.play('error'); return; }
    if (SE.invCount('carvao') < 1) { SE.toast('Precisa de 1 carvão.', '#ffb0a0'); SE.audio.play('error'); return; }
    SE.invRemove(held.id, rec.n); SE.invRemove('carvao', 1);
    f.out = rec.out; f.m = rec.m;
    SE.audio.play('door');
    SE.toast(SE.ITEMS[rec.out].name + ' fica pronta em ' + rec.m + ' minutos.', '#ffe08a');
  }

  // ---------------------------------------------------------------- Criação
  SE.craftUnlocked = function (r) {
    const s = SE.state;
    if (!r.req) return true;
    if (typeof r.req === 'string') return !!s.flags[r.req];
    return (s.lvl[r.req[0]] || 0) >= r.req[1];
  };
  SE.craftReqText = function (r) {
    if (!r.req) return '';
    if (typeof r.req === 'string') return 'Aprenda com o Seu Bastião (ache cobre na gruta).';
    return 'Requer ' + SE.skillName(r.req[0]) + ' nível ' + r.req[1] + '.';
  };
  SE.craftOk = (r) => Object.keys(r.inp).every((k) => SE.invCount(k) >= r.inp[k]);
  SE.craft = function (r) {
    if (!SE.craftUnlocked(r)) { SE.toast(SE.craftReqText(r), '#ffb0a0'); SE.audio.play('error'); return false; }
    if (!SE.craftOk(r)) { SE.toast('Faltam materiais: ' + SE.inpText(r.inp), '#ffb0a0'); SE.audio.play('error'); return false; }
    if (SE.invSpace(r.id) < r.n) { SE.toast('Mochila cheia!', '#ffb0a0'); return false; }
    Object.keys(r.inp).forEach((k) => SE.invRemove(k, r.inp[k]));
    SE.give(r.id, r.n);
    SE.audio.play('plant');
    return true;
  };

  // ---------------------------------------------------------------- Correio
  SE.sendMail = function (id, from, text, items) {
    const s = SE.state;
    if (s.mailSent[id]) return;
    s.mailSent[id] = true;
    s.mail.unshift({ id, from, text, items: items || [], read: false, day: s.day });
  };
  SE.unreadMail = () => SE.state.mail.some((m) => !m.read || m.items.length);

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

  // ---------------------------------------------------------------- Objetos com vida (árvores, tocos, pedras)
  SE.objHP = {};
  const HP = { T: 8, k: 3, p: 1 };
  SE.objMaxHP = function (o, m) {
    if (m && m.id === 'mina') return { r: 1 + m.tier, c: 3, f: 5, o: 7, q: 4 }[o] || 1;
    return HP[o] || 1;
  };
  // golpe com machado/picareta; devolve true se destruiu
  SE.hitObj = function (m, tx, ty, dmg) {
    const o = SE.objAt(m, tx, ty), k = m.id + ':' + tx + ',' + ty;
    const hp = (SE.objHP[k] === undefined ? SE.objMaxHP(o, m) : SE.objHP[k]) - dmg;
    SE.objHP[k] = hp;
    SE.shake = { tx, ty, t: 0.18 };
    if (hp > 0) return false;
    delete SE.objHP[k];
    return true;
  };

  // ---------------------------------------------------------------- Ação principal (Espaço)
  SE.act = function (fromMouse) {
    const s = SE.state, m = SE.MAPS[s.map];
    const [fx, fy] = SE.frontPoint();
    const tx = Math.floor(fx / T), ty = Math.floor(fy / T);
    const held = s.inv[s.sel];
    if (held && held.id === 'facao') { SE.swing(); return; }
    const npc = SE.npcAtPoint(fx, fy);
    if (npc) return SE.npcInteract(npc);
    const an = SE.animalAtPoint(fx, fy);
    if (an) return SE.animalInteract(an);
    const b = SE.buildingAt(m, tx, ty, s);
    if (b) return SE.buildingInteract(b);
    const k = SE.key(tx, ty);
    const o = SE.objAt(m, tx, ty);
    if (m.id === 'mina' && (o === 'L' || o === 'U')) return SE.useLadder(o);
    if (m.id === 'farm') {
      if (o === 'C') { SE.openPanel(SE.ChestPanel(k)); SE.audio.play('door'); return; }
      if (o === 'O' && !(held && (held.id === 'picareta' || held.id === 'machado'))) return furnaceInteract(k);
      if (s.forage[k]) {
        const id = s.forage[k];
        const n = SE.chance(0.05 * s.lvl.coleta) ? 2 : 1;
        if (SE.give(id, n) === 0) { delete s.forage[k]; SE.audio.play('harvest'); SE.addXP('coleta', 7); }
        return;
      }
      if (s.hives[k]) {
        const h = s.hives[k];
        if (h.mel) { if (SE.give('mel', 1) === 0) { h.mel = false; SE.audio.play('harvest'); SE.addXP('coleta', 5); } }
        else SE.toast('As abelhas ainda estão trabalhando. Volte em alguns dias.', '#ffe08a');
        return;
      }
      const soil = s.soil[k];
      if (soil && soil.c && soil.c.ready) return harvest(k, soil);
      if (soil && soil.c && soil.c.dead) { soil.c = null; SE.audio.play('cut'); SE.toast('Você arrancou a planta morta.', '#e0d0b0'); return; }
    }
    if (!held) return;
    useItem(held, m, tx, ty, k, fromMouse);
  };

  function harvest(k, soil) {
    const s = SE.state, c = soil.c, d = SE.CROPS[c.id];
    const n = SE.ri(d.yield[0], d.yield[1]);
    if (SE.invSpace(d.item) < n) { SE.toast('Mochila cheia!', '#ffb0a0'); SE.audio.play('error'); return; }
    SE.give(d.item, n);
    s.stats.colhido += n;
    SE.addXP('agricultura', 3 + SE.ITEMS[d.item].price / 8);
    if (d.regrow) { c.ready = false; c.age = d.days - d.regrow; }
    else soil.c = null;
    SE.audio.play('harvest');
    SE.player.tool = 'colher'; SE.player.toolT = 0.25;
    SE.checkGoals();
  }

  const anim = (t) => { SE.player.tool = t; SE.player.toolT = 0.28; };
  // ferramentas carregáveis: segure o botão para atingir mais tiles
  SE.chargeable = (id) => (id === 'enxada' || id === 'regador') && SE.toolLvl(id) > 0;
  SE.releaseCharge = function (ch) {
    if (ch.id === 'vara') { SE.castLine(ch.power); return; }
    const lvl = Math.min(SE.toolLvl(ch.id), Math.floor(ch.t / 0.45));
    useToolArea(ch.id, lvl);
  };
  function useToolArea(id, lvl) {
    const s = SE.state, m = SE.MAPS[s.map];
    const tiles = SE.toolTiles(lvl);
    if (id === 'enxada') {
      const ok = tiles.filter(([x, y]) => canTill(m, x, y));
      if (!ok.length) { if (lvl === 0) tillMsg(m, tiles[0][0], tiles[0][1]); return; }
      if (!SE.useEnergy(SE.cost(2, 'agricultura') * (lvl + 1))) return;
      ok.forEach(([x, y]) => { s.soil[SE.key(x, y)] = { w: SE.isRaining() ? 1 : 0, c: null }; });
      anim('enxada'); SE.audio.play('hoe');
      SE.addXP('agricultura', ok.length * 0.5);
    } else if (id === 'regador') {
      const [fx, fy] = tiles[0];
      if (SE.groundAt(m, fx, fy) === 'w') { refill(); return; }
      const ok = tiles.filter(([x, y]) => m.id === 'farm' && s.soil[SE.key(x, y)]);
      if (!ok.length) return;
      if (s.water <= 0) { SE.toast('Regador vazio! Encha no poço ou no rio.', '#ffb0a0'); SE.audio.play('error'); return; }
      if (!SE.useEnergy(SE.cost(1, 'agricultura') * (lvl + 1))) return;
      anim('regador'); SE.audio.play('water');
      ok.forEach(([x, y]) => {
        if (s.water <= 0) return;
        const so = s.soil[SE.key(x, y)];
        s.water--;
        if (!so.w) { so.w = 1; if (so.c) { s.stats.regado++; SE.addXP('agricultura', 0.5); } }
      });
      SE.checkGoals();
    }
  }
  function refill() {
    const s = SE.state;
    s.water = s.waterMax; SE.audio.play('water');
    SE.toast('Regador cheio (' + s.water + '/' + s.waterMax + ')', '#a0d0ff');
  }
  function canTill(m, x, y) {
    const s = SE.state, k = SE.key(x, y);
    return m.id === 'farm' && SE.groundAt(m, x, y) === 'g' && !SE.objAt(m, x, y) && !s.soil[k] && !s.forage[k] && !SE.inCurral(x, y) && !SE.buildingAt(m, x, y, s);
  }
  function tillMsg(m, x, y) {
    const s = SE.state, o = SE.objAt(m, x, y);
    if (s.soil[SE.key(x, y)]) SE.toast('A terra já está arada.', '#e0d0b0');
    else if (o === 'm') SE.toast('Roce o mato com a foice primeiro.', '#e0d0b0');
  }

  function useItem(it, m, tx, ty, k, fromMouse) {
    const s = SE.state, def = SE.ITEMS[it.id];
    const g = SE.groundAt(m, tx, ty), o = SE.objAt(m, tx, ty);
    const farm = m.id === 'farm';
    const soil = farm ? s.soil[k] : null;
    if (SE.chargeable(it.id) && !(it.id === 'regador' && g === 'w')) { SE.player.charge = { id: it.id, t: 0, mouse: !!fromMouse }; return; }
    switch (it.id) {
      case 'enxada': useToolArea('enxada', 0); return;
      case 'regador':
        if (g === 'w') { refill(); return; }
        useToolArea('regador', 0); return;
      case 'vara':
        if (SE.fishing) return SE.reelIn();
        SE.player.charge = { id: 'vara', t: 0, mouse: !!fromMouse, power: 0 };
        return;
      case 'foice':
        if (o === 'm' || o === 'b') {
          if (!SE.useEnergy(o === 'b' ? 2 : 1)) return;
          SE.setObj(m, tx, ty, ''); anim('foice'); SE.audio.play('cut');
          if (o === 'm') { s.stats.mato++; if (Math.random() < 0.6) SE.give('capim', 1); SE.addXP('coleta', 1); }
          else { SE.give('madeira', 1); SE.addXP('coleta', 2); }
          SE.checkGoals();
        } else anim('foice');
        return;
      case 'machado': {
        const dmg = 1 + SE.toolLvl('machado');
        if (o === 'k' || (o === 'T' && farm && !SE.isEdgeTree(m, tx, ty))) {
          if (!SE.useEnergy(SE.cost(2, 'coleta'))) return;
          anim('machado'); SE.audio.play('hit');
          if (SE.hitObj(m, tx, ty, dmg)) {
            if (o === 'T') { SE.setObj(m, tx, ty, 'k'); SE.audio.play('tree'); SE.give('madeira', SE.ri(8, 12)); SE.addXP('coleta', 12); SE.toast('A árvore caiu! Sobrou o toco.', '#e0d0b0'); }
            else { SE.setObj(m, tx, ty, ''); SE.give('madeira', SE.ri(2, 4)); SE.addXP('coleta', 5); }
          }
        } else if (pickUpPlaced(m, tx, ty, k, o)) anim('machado');
        else if (SE.TREE_CODES.includes(o) && o) { SE.toast(o === 'T' ? 'Essa árvore marca a divisa do sítio. Melhor deixar.' : 'Essa árvore dá fruta. Melhor deixar.', '#e0d0b0'); anim('machado'); }
        else anim('machado');
        return;
      }
      case 'picareta': {
        const dmg = 1 + SE.toolLvl('picareta');
        if (o === 'p' || 'rcfoq'.includes(o) && o) {
          if (!SE.useEnergy(SE.cost(2, 'mineracao'))) return;
          anim('picareta'); SE.audio.play('stone');
          if (SE.hitObj(m, tx, ty, dmg)) { SE.setObj(m, tx, ty, ''); SE.audio.play('break'); rockDrops(m, o, tx, ty); }
        } else if (pickUpPlaced(m, tx, ty, k, o)) anim('picareta');
        else if (soil && !soil.c) { delete s.soil[k]; anim('picareta'); SE.audio.play('hoe'); }
        else anim('picareta');
        return;
      }
    }
    if (def.cat === 'place') return placeItem(it, def, m, tx, ty, k, soil);
    if (def.cat === 'fert') {
      if (!soil) { SE.toast('Use o adubo na terra arada.', '#e0d0b0'); return; }
      if (soil.f) { SE.toast('Essa terra já está adubada.', '#e0d0b0'); return; }
      soil.f = 1; SE.invRemoveAt(s.sel, 1); SE.audio.play('plant'); SE.toast('Terra adubada: cresce 25% mais rápido.', '#bff0a0');
      return;
    }
    if (def.cat === 'bomb') return SE.placeBomb(tx, ty);
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

  function rockDrops(m, o, tx, ty) {
    const s = SE.state, ml = s.lvl.mineracao || 0;
    const extra = () => (SE.chance(0.05 * ml) ? 1 : 0);
    if (o === 'p') { SE.give('pedra', SE.ri(1, 2)); SE.addXP('mineracao', 1); return; }
    if (o === 'r') { SE.give('pedra', 1); if (SE.chance(0.06 + 0.02 * m.tier)) SE.give('carvao', 1); if (SE.chance(0.02)) SE.give('quartzo', 1); SE.addXP('mineracao', 1); }
    else if (o === 'c') { SE.give('minerio_cobre', SE.ri(1, 2) + extra()); SE.addXP('mineracao', 5); }
    else if (o === 'f') { SE.give('minerio_ferro', SE.ri(1, 2) + extra()); SE.addXP('mineracao', 12); }
    else if (o === 'o') { SE.give('minerio_ouro', SE.ri(1, 2) + extra()); SE.addXP('mineracao', 18); }
    else if (o === 'q') { SE.give(m.tier >= 1 && SE.chance(0.5) ? 'ametista' : 'quartzo', 1); SE.addXP('mineracao', 8); }
    if (m.id === 'mina') SE.rockBroken(tx, ty);
  }
  SE.rockDrops = rockDrops;

  function pickUpPlaced(m, tx, ty, k, o) {
    const s = SE.state;
    const back = { C: 'bau', E: 'espantalho', R: 'irrigador', O: 'fornalha', h: 'colmeia' }[o];
    if (!back || m.id !== 'farm') return false;
    if (o === 'C' && (s.chests[k] || []).some((x) => x)) { SE.toast('Esvazie o baú antes de recolher.', '#ffb0a0'); return true; }
    if (o === 'O' && s.furn[k] && s.furn[k].out) { SE.toast('Espere a fornalha terminar.', '#ffb0a0'); return true; }
    if (o === 'h' && s.hives[k] && s.hives[k].mel) { SE.toast('Recolha o mel primeiro.', '#ffb0a0'); return true; }
    if (SE.invSpace(back) < 1) { SE.toast('Mochila cheia!', '#ffb0a0'); return true; }
    SE.setObj(m, tx, ty, '');
    delete s.chests[k]; delete s.furn[k]; delete s.hives[k];
    SE.give(back, 1); SE.audio.play('hit');
    return true;
  }
  function placeItem(it, def, m, tx, ty, k, soil) {
    const s = SE.state;
    if (m.id !== 'farm' || SE.groundAt(m, tx, ty) !== 'g' || SE.objAt(m, tx, ty) || (soil && soil.c) || s.forage[k] || SE.inCurral(tx, ty) || SE.buildingAt(m, tx, ty, s)) {
      SE.toast('Escolha um pedaço livre de grama no sítio.', '#e0d0b0'); return;
    }
    const p = SE.player;
    if (Math.floor(p.x / T) === tx && Math.floor((p.y - 2) / T) === ty) return;
    SE.invRemoveAt(s.sel, 1);
    if (soil) delete s.soil[k];
    SE.setObj(m, tx, ty, def.obj);
    if (def.obj === 'h') s.hives[k] = { d: 0, mel: false };
    if (def.obj === 'C') s.chests[k] = new Array(SE.INV_SIZE).fill(null);
    if (def.obj === 'O') s.furn[k] = { out: null, m: 0 };
    SE.audio.play('plant');
    const msg = { h: 'Colmeia instalada! As abelhas fazem mel a cada poucos dias.', C: 'Baú colocado.', E: 'Espantalho de pé! Os corvos vão pensar duas vezes.', R: 'Irrigador instalado: rega os vizinhos toda manhã.', O: 'Fornalha montada.' }[def.obj];
    SE.toast(msg, '#ffe08a');
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
      case 'correio':
        if (!s.mail.length) { SE.say('A caixa de correio está vazia. Só teia de aranha.'); return; }
        SE.audio.play('mail'); SE.openPanel(SE.MailPanel()); return;
      case 'gruta': return SE.enterMineMenu();
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
      case 'ferraria':
        if (cal.wd === 6 || h < 9 || h >= 17) { SE.say('A ferraria está fechada. O Seu Bastião atende de segunda a sábado, das 9h às 17h.'); return; }
        s.npcs.bastiao.met = true;
        SE.audio.play('door');
        SE.openPanel(SE.FerrariaPanel());
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

  // ---------------------------------------------------------------- Ferraria: melhorias
  SE.startUpgrade = function (tool) {
    const s = SE.state, lvl = s.tools[tool], up = SE.UPGRADES[lvl];
    if (!up) return;
    if (s.upgrade) { SE.toast('O Seu Bastião ainda está trabalhando em outra ferramenta.', '#ffb0a0'); return; }
    if (s.money < up.price) { SE.toast('Dinheiro insuficiente.', '#ffb0a0'); SE.audio.play('error'); return; }
    if (SE.invCount(up.bar) < 5) { SE.toast('Precisa de 5 ' + SE.ITEMS[up.bar].name + '.', '#ffb0a0'); SE.audio.play('error'); return; }
    if (SE.invCount(tool) < 1) { SE.toast('Traga a ferramenta na mochila.', '#ffb0a0'); return; }
    s.money -= up.price; SE.invRemove(up.bar, 5); SE.invRemove(tool, 1);
    s.upgrade = { tool, lvl: lvl + 1, day: s.day + 2 };
    SE.audio.play('coin');
    SE.say([{ who: 'bastiao', text: 'Deixa comigo. Em dois dias eu mando a ' + SE.ITEMS[tool].name.toLowerCase() + ' ' + up.name + ' pelo correio. Vai ficar tinindo!', emo: 'h' }]);
  };

  // ---------------------------------------------------------------- Dormir e virar o dia
  SE.sleep = function (passedOut) {
    SE.audio.play('sleep');
    SE.fadeTo(() => {
      const rep = SE.endDay(passedOut);
      SE.openPanel(SE.DayPanel(rep));
    });
  };

  SE.endDay = function (passedOut) {
    const s = SE.state;
    const cal0 = SE.cal();
    const rep = { lines: [], earned: 0, day: s.day, shipped: [], levels: [] };
    const lateBed = s.time >= 24 * 60;
    const m = SE.MAPS.farm;

    // Corvos (a partir do dia 4, plantações sem espantalho)
    const scare = [];
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (s.farmObj[y * m.w + x] === 'E') scare.push([x, y]);
    const exposed = Object.keys(s.soil).filter((k) => {
      const c = s.soil[k].c;
      if (!c || c.dead || SE.CROPS[c.id].perene) return false;
      const [x, y] = k.split(',').map(Number);
      return !scare.some(([sx, sy]) => Math.hypot(sx - x, sy - y) <= 8);
    });
    if (s.day >= 4 && exposed.length >= 10 && Math.random() < 0.6) {
      const n = Math.min(exposed.length, SE.ri(1, Math.min(4, Math.floor(exposed.length / 8))));
      for (let i = 0; i < n; i++) { const k = exposed.splice(SE.ri(0, exposed.length - 1), 1)[0]; s.soil[k].c = null; }
      rep.lines.push('Os corvos atacaram e comeram ' + n + (n > 1 ? ' plantas' : ' planta') + '! Um espantalho protege as plantas num raio de 8 passos.');
    }

    // Plantas
    let dried = 0, spoiled = 0;
    Object.keys(s.soil).forEach((k) => {
      const so = s.soil[k], c = so.c;
      if (c && !c.dead) {
        const d = SE.CROPS[c.id];
        if (c.ready) {
          if (s.weather === 'tempestade' && !d.perene && Math.random() < 0.25) { c.dead = true; spoiled++; }
        } else if (so.w) {
          c.age += (cal0.epoca === 'aguas' ? 1.25 : 1) * (so.f ? 1.25 : 1); c.dry = 0;
          if (c.age >= d.days) c.ready = true;
        } else if (cal0.epoca === 'seca' && !d.perene) {
          c.dry++;
          if (c.dry >= 2) { c.dead = true; dried++; }
        }
      }
      so.w = 0;
    });
    if (spoiled) rep.lines.push('O temporal estragou ' + spoiled + (spoiled > 1 ? ' plantas maduras.' : ' planta madura.') + ' Colha logo quando estiver pronto!');
    if (dried) rep.lines.push(dried + (dried > 1 ? ' plantas murcharam' : ' planta murchou') + ' de sede. Na seca, regue todo dia!');

    // Caixote (relatório item por item)
    if (s.caixote.length) {
      let tot = 0;
      s.caixote.forEach((it) => {
        const v = SE.jorgePrice(it.id) * it.q;
        rep.shipped.push({ id: it.id, q: it.q, v });
        tot += v; SE.marketSold(it.id, it.q); s.stats.vendidos += it.q;
      });
      s.caixote = [];
      SE.earn(tot); rep.earned += tot;
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

    // Colmeias, beneficiamento e fornalhas
    Object.keys(s.hives).forEach((k) => { const h = s.hives[k]; if (!h.mel) { h.d++; if (h.d >= (cal0.epoca === 'aguas' ? 3 : 4)) { h.mel = true; h.d = 0; } } });
    let ready = 0;
    Object.keys(s.stations).forEach((id) => s.stations[id].slots.forEach((sl) => { if (sl.d > 0) { sl.d--; if (sl.d === 0) ready++; } }));
    if (ready) rep.lines.push(ready + (ready > 1 ? ' produtos artesanais ficaram prontos.' : ' produto artesanal ficou pronto.'));
    SE.furnaceTick(24 * 60);

    // Mercado
    Object.keys(s.market).forEach((id) => { s.market[id] = SE.clamp(s.market[id] + (1 - s.market[id]) * 0.15 + SE.rand(-0.03, 0.03), 0.5, 1.6); });

    // Habilidades: sobe de nível durante a noite
    SE.SKILLS.forEach((sk) => {
      while (s.lvl[sk.id] < 10 && s.xp[sk.id] >= SE.XP_LV[s.lvl[sk.id]]) {
        s.lvl[sk.id]++;
        if (sk.id === 'combate') { s.maxHp += 5; }
        const unlock = SE.CRAFT.filter((r) => Array.isArray(r.req) && r.req[0] === sk.id && r.req[1] === s.lvl[sk.id]).map((r) => SE.ITEMS[r.id].name);
        rep.levels.push({ id: sk.id, lvl: s.lvl[sk.id], unlock });
      }
    });

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
    // Irrigadores regam os vizinhos
    for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) if (s.farmObj[y * m.w + x] === 'R') {
      [[0, 1], [0, -1], [1, 0], [-1, 0]].forEach(([dx, dy]) => { const so = s.soil[SE.key(x + dx, y + dy)]; if (so) so.w = 1; });
    }

    // Frutas do mato e mato novo
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

    // Correio
    if (s.day >= 2) SE.sendMail('vara', 'Zé do Bar', 'Fala, vizinho! Achei essa vara de pescar velha no fundo do bar. O rio do seu sítio tem lambari e tilápia, e no comecinho das águas aparece até dourado. Segura o botão pra arremessar e, quando o peixe morder, aperta de novo! Mandei umas iscas também.', [['vara', 1], ['isca', 10]]);
    if (s.day >= 4) SE.sendMail('corvos', 'Seu Tião', 'Ô, gente do Benedito! Os corvos andam rondando a serra. Quando a plantação crescer, faz um espantalho (Agricultura nível 1, menu Criação). Madeira, carvão e capim resolvem.');
    if (s.day >= 5) SE.sendMail('gruta', 'Seu Bastião', 'Sou o Bastião, da ferraria do vilarejo. Lá no alto do seu sítio tem uma gruta antiga cheia de minério. Traga barras de metal que eu melhoro suas ferramentas. Cuidado com as lesmas!');
    if (s.flags.cobre && !s.flags.fornalha) {
      s.flags.fornalha = true;
      SE.sendMail('fornalha', 'Seu Bastião', 'Vi que você achou cobre! Vou te ensinar a fazer uma fornalha: 20 minérios de cobre e 25 pedras (menu Criação). Põe 5 minérios e 1 carvão e sai uma barra.');
    }
    if (s.upgrade && s.day >= s.upgrade.day) {
      const u = s.upgrade;
      s.tools[u.tool] = u.lvl;
      if (u.tool === 'regador') { s.waterMax = 20 * (1 + u.lvl); s.water = s.waterMax; }
      s.upgrade = null;
      SE.sendMail('up' + s.day + u.tool, 'Seu Bastião', 'Pronto! Sua ' + SE.ITEMS[u.tool].name.toLowerCase() + ' ' + SE.UPGRADES[u.lvl - 1].name + ' está aqui, tinindo. ' + (u.tool === 'enxada' || u.tool === 'regador' ? 'Segure o botão para atingir vários canteiros de uma vez.' : 'Agora corta e quebra bem mais rápido.'), [[u.tool, 1]]);
      rep.lines.push('O Seu Bastião mandou sua ferramenta melhorada pelo correio.');
    }
    if (s.mail.some((ml) => !ml.read)) rep.mail = true;

    // Energia, vida e penalidades
    if (passedOut) {
      const lost = Math.min(1000, Math.round(s.money * 0.1));
      s.money -= lost;
      s.energy = Math.round(s.maxEnergy * 0.5);
      rep.lines.unshift('Você apagou de cansaço no meio da noite! A Dra. Lúcia te achou e te levou pra casa.' + (lost ? ' Gastou ' + SE.money(lost) + ' com remédio.' : ''));
    } else s.energy = lateBed ? Math.round(s.maxEnergy * 0.85) : s.maxEnergy;
    s.hp = s.maxHp;
    SE.objHP = {};

    s.time = SE.DAY_START;
    s.map = 'farm'; s.px = 7 * T + 8; s.py = 8 * T + 12; s.dir = 0;
    SE.player.x = s.px; SE.player.y = s.py; SE.player.dir = 0;
    SE.fishing = null; SE.player.charge = null;
    rep.forecast = s.nextWeather;
    SE.saveGame(true);
    return rep;
  };

  // ---------------------------------------------------------------- Salvar
  SE.saveGame = function (quiet) {
    const s = SE.state, p = SE.player;
    if (s.map === 'mina') { if (!quiet) SE.toast('Não dá para salvar dentro da gruta.', '#ffb0a0'); return false; }
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
      if (!s || (s.v !== 1 && s.v !== 2)) return null;
      upgradeState(s);
      if (s.map === 'mina') { s.map = 'farm'; s.px = 20 * T + 8; s.py = 5 * T + 12; }
      return s;
    } catch (e) { return null; }
  };
})(window.SE);
