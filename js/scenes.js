'use strict';
// Cenas: tela de título, criação de personagem, chegada de ônibus e o jogo.
(function (SE) {
  const W = SE.W, H = SE.H, T = SE.T, I = SE.input, ui = SE.ui;
  const { R, disc, ell } = SE.px;

  // ---------------------------------------------------------------- Título
  SE.TitleScene = function () {
    let t = 0, cur = 0;
    const save = SE.loadGame();
    const items = [];
    if (save) items.push({ t: 'Continuar', fn: () => startLoaded(save) });
    items.push({ t: 'Novo jogo', fn: () => {
      if (save) SE.say('Começar do zero? O jogo salvo será apagado quando você dormir pela primeira vez.', { choices: [{ t: 'Começar de novo', fn: () => SE.fadeTo(() => SE.setScene(SE.NameScene())) }, { t: 'Cancelar', fn: () => {} }] });
      else SE.fadeTo(() => SE.setScene(SE.NameScene()));
    } });
    items.push({ t: 'Como jogar', fn: () => SE.openPanel(SE.HelpPanel()) });
    function startLoaded(s) {
      SE.fadeTo(() => {
        SE.state = s;
        SE.player.x = s.px; SE.player.y = s.py; SE.player.dir = s.dir || 0;
        SE.setScene(SE.PlayScene());
        SE.toast('Bem-vindo de volta, ' + s.name + '!', '#ffe08a');
      });
    }
    const fakeMin = 6.6 * 60;
    return {
      update(dt, paused) {
        t += dt;
        if (paused) return;
        if (I.take('up')) { cur = (cur + items.length - 1) % items.length; SE.audio.play('move'); }
        if (I.take('down')) { cur = (cur + 1) % items.length; SE.audio.play('move'); }
        if (I.take('a')) { SE.audio.play('select'); items[cur].fn(); }
      },
      draw(c) {
        const ep = Math.floor(t / 20) % 2 ? 'seca' : 'aguas';
        SE.drawPanorama(c, 0, 0, W, 170, ep, fakeMin + Math.sin(t * 0.05) * 30, t * 6, { t, chapel: true });
        const tiles = SE.buildTiles(ep);
        for (let y = 160; y < H; y += 16) for (let x = 0; x < W; x += 16) c.drawImage(tiles.grass[(x * 7 + y) % 4], x, y);
        for (let x = 0; x < W; x += 16) c.drawImage(tiles.path[0], x, 192);
        c.drawImage(SE.buildingSprite('casa', 5, 3, 20, 'reformada'), 24, 116);
        for (let i = 0; i < 9; i++) {
          const cx = 150 + i * 22;
          [0, 1].forEach((r) => SE.drawCrop(c, cx + r * 8, 160 + r * 14, { id: i % 3 === 0 ? 'cafe' : i % 3 === 1 ? 'milho' : 'cana', age: 99, ready: true }, ep, t));
        }
        c.drawImage(SE.objSprite('I', ep, 0), 300, 140);
        c.drawImage(SE.personSprite(SE.LOOKS[0], 0, 0), 112, 168);
      },
      drawUI(c) {
        const bob = Math.round(Math.sin(t * 2) * 2);
        ui.text(c, 'Sítio', W / 2, 20 + bob, { align: 'center', size: 22, title: true, col: '#f2c94c', shadow: '#5a2a0a' });
        ui.text(c, 'Esperança', W / 2, 46 + bob, { align: 'center', size: 22, title: true, col: '#ffffff', shadow: '#5a2a0a' });
        ui.text(c, 'um jogo de roça no interior do Brasil', W / 2, 74, { align: 'center', col: '#ffffff', shadow: '#3a2412' });
        const mw = 120, mh = items.length * 15 + 10, mx = W / 2 - mw / 2, my = 96;
        ui.panel(c, mx, my, mw, mh);
        items.forEach((it, i) => {
          const y = my + 6 + i * 15;
          if (SE.isHover(mx, y, mw, 14)) cur = i;
          if (i === cur) { c.fillStyle = 'rgba(242,201,76,0.6)'; c.fillRect(mx + 4, y, mw - 8, 14); ui.cursor(c, mx + 8, y + 3, t); }
          ui.text(c, it.t, W / 2, y + 2, { align: 'center' });
          SE.addHit(mx, y, mw, 14, () => { cur = i; SE.audio.play('select'); it.fn(); });
        });
        ui.text(c, 'v0.1  ·  Setas + Espaço  ·  M: música', W / 2, H - 12, { align: 'center', size: 9, col: '#ffffff', shadow: '#000' });
      },
    };
  };

  // ---------------------------------------------------------------- Criação de personagem
  SE.NameScene = function () {
    let name = '', look = 0, t = 0;
    I.typing = true;
    const DEF = ['Joca', 'Dita', 'Zeca', 'Lia', 'Tonho', 'Nina', 'Bené', 'Cacau'];
    function confirm() {
      I.typing = false;
      const nm = name.trim() || SE.pick(DEF);
      SE.state = SE.newState(nm, look);
      SE.audio.play('goal');
      SE.fadeTo(() => SE.setScene(SE.IntroScene()));
    }
    function askName() {
      const v = window.prompt('Como você se chama?', name);
      if (v !== null) name = v.slice(0, 12);
    }
    return {
      update(dt, paused) {
        t += dt;
        if (paused) return;
        I.typed.forEach((ch) => {
          if (ch === '\b') name = name.slice(0, -1);
          else if (name.length < 12 && /[\p{L}\p{N} '\-]/u.test(ch)) name += ch;
        });
        if (I.take('left')) { look = (look + SE.LOOKS.length - 1) % SE.LOOKS.length; SE.audio.play('move'); }
        if (I.take('right')) { look = (look + 1) % SE.LOOKS.length; SE.audio.play('move'); }
        if (I.take('a')) confirm();
        if (I.take('b')) { I.typing = false; SE.fadeTo(() => SE.setScene(SE.TitleScene())); }
      },
      draw(c) { SE.drawPanorama(c, 0, 0, W, H, 'aguas', 8 * 60, t * 4, { t, chapel: true }); },
      drawUI(c) {
        const x = 62, y = 26, w = W - 124, h = 164;
        ui.panel(c, x, y, w, h);
        ui.text(c, 'Quem vai cuidar do sítio?', W / 2, y + 10, { align: 'center', size: 8, title: true, col: '#7a3a1a' });
        ui.text(c, 'Seu nome:', x + 16, y + 30);
        c.fillStyle = '#fff8e8'; c.fillRect(x + 70, y + 27, 120, 14); c.fillStyle = '#3a2412'; c.fillRect(x + 70, y + 41, 120, 1);
        ui.text(c, name + (Math.floor(t * 2) % 2 ? '_' : ''), x + 74, y + 29, { col: '#7a3a1a' });
        if (I.touch) ui.btn(c, x + 194, y + 27, 50, 14, 'Digitar', { fn: askName });
        else SE.addHit(x + 70, y + 27, 120, 14, askName);
        const dirs = [0, 3, 1, 2];
        const d = dirs[Math.floor(t * 1.2) % 4];
        c.fillStyle = '#e8d4a0'; c.fillRect(W / 2 - 30, y + 50, 60, 76);
        c.drawImage(SE.personSprite(SE.LOOKS[look], d, Math.floor(t * 5) % 3), W / 2 - 24, y + 54, 48, 72);
        ui.btn(c, W / 2 - 56, y + 80, 18, 16, '<', { fn: () => { look = (look + SE.LOOKS.length - 1) % SE.LOOKS.length; } });
        ui.btn(c, W / 2 + 38, y + 80, 18, 16, '>', { fn: () => { look = (look + 1) % SE.LOOKS.length; } });
        ui.text(c, '←/→ muda o visual  ·  Enter confirma', W / 2, y + 132, { align: 'center', size: 9, col: '#9a7a5a' });
        ui.btn(c, W / 2 - 40, y + 144, 80, 14, 'Começar', { fn: confirm });
      },
    };
  };

  // ---------------------------------------------------------------- Chegada de ônibus
  SE.IntroScene = function () {
    const s = SE.state;
    const cards = [
      'Faz doze anos que você não sobe a serra. O ônibus chacoalha na estrada de terra, entre cafezais e ipês.',
      'Na mão, a carta do cartório: o Sítio Esperança, do seu avô Benedito, agora é seu.',
      'Uma mala, ' + SE.money(500) + ' no bolso e uma vontade danada de recomeçar.',
      'O vilarejo anda vazio. Os jovens foram pra cidade, a escola fechou e o trem não para mais.',
      'Mas a terra continua ali, esperando. Bem-vindo de volta, ' + s.name + '.',
    ];
    let i = 0, t = 0, ch = 0, busX = -70, done = false;
    function next() {
      if (ch < cards[i].length) { ch = cards[i].length; return; }
      if (i < cards.length - 1) { i++; ch = 0; return; }
      finish();
    }
    function finish() {
      if (done) return;
      done = true;
      SE.fadeTo(() => {
        SE.player.x = s.px; SE.player.y = s.py; SE.player.dir = 0;
        SE.setScene(SE.PlayScene());
        SE.say([
          'Você chegou ao Sítio Esperança! O mato tomou conta, a casa de taipa está rachada... mas o poço ainda funciona.',
          'Dica: fique de frente para a porta da casa e aperte Espaço para entrar. Tem uma carta do vovô te esperando.',
          'Na barra de baixo estão suas ferramentas: enxada, regador, foice, machado e picareta. Troque com 1-0, Q/E ou a rodinha do mouse.',
          'Siga o objetivo no canto da tela. E durma antes das 2h da manhã!',
        ]);
      });
    }
    return {
      update(dt, paused) {
        t += dt;
        if (paused) return;
        ch += dt * 45;
        busX = i < 2 ? SE.lerp(busX, W / 2 - 30, dt * 0.8) : busX + dt * (i >= 3 ? 50 : 0);
        if (I.take('a') || (I.mouse.click && (I.mouse.click = false, true))) next();
        if (I.take('b')) finish();
      },
      draw(c) {
        const scroll = i < 2 ? t * 40 : 80 * 2 + t * 2;
        SE.drawPanorama(c, 0, 0, W, 160, 'aguas', (i < 3 ? 7.2 : 8) * 60, scroll, { t, chapel: i >= 2 });
        const tiles = SE.buildTiles('aguas');
        for (let x = -16; x < W + 16; x += 16) {
          const ox = Math.floor(-((i < 2 ? scroll : scroll) % 16));
          c.drawImage(tiles.grass[(Math.floor((x + scroll) / 16) & 3)], x + ox, 152);
          c.drawImage(tiles.path[0], x + ox, 168); c.drawImage(tiles.path[1], x + ox, 184);
          c.drawImage(tiles.grass[1], x + ox, 200);
        }
        for (let k = 0; k < 4; k++) {
          const tx = ((k * 120 - scroll * 1.2) % (W + 60) + W + 60) % (W + 60) - 30;
          c.drawImage(SE.objSprite(k % 2 ? 'I' : 'T', 'aguas', k), tx, 112);
        }
        if (i >= 2) {
          c.drawImage(SE.buildingSprite('ponto', 2, 1, 14), 40, 150);
          c.drawImage(SE.personSprite(SE.LOOKS[s.look], 0, 0), 52, 160);
          R(c, 64, 174, 9, 7, '#8a3a2a'); R(c, 66, 172, 5, 2, '#5a2a1a');
        }
        SE.drawBus(c, Math.round(busX), 150, i < 2 ? t : 0);
      },
      drawUI(c) {
        const x = 16, y = 10, w = W - 32, h = 50;
        ui.panel(c, x, y, w, h, { bg: '#fbf2da' });
        c.font = ui.font(11);
        const lines = SE.wrap(c, cards[i], w - 24);
        let left = Math.floor(ch);
        lines.forEach((ln, k) => { ui.text(c, ln.slice(0, Math.max(0, left)), x + 12, y + 9 + k * 12, { size: 11 }); left -= ln.length; });
        ui.text(c, (i + 1) + '/' + cards.length + '  ·  Espaço continua  ·  Esc pula', x + w - 10, y + h - 14, { align: 'right', size: 9, col: '#9a7a5a' });
      },
    };
  };

  // ---------------------------------------------------------------- O jogo
  SE.PlayScene = function () {
    const s = SE.state;
    let t = 0, tick = 0, banner = 2.5, actCd = 0, hint = '';
    const rain = [];
    let flash = 0;
    SE.npcRT = {};
    SE.updateNPCs(0, true);
    SE.checkGoals();

    function moveAxis(m, nx, ny) {
      const x0 = nx - 5, x1 = nx + 5, y0 = ny - 5, y1 = ny;
      const tx0 = Math.floor(x0 / T), tx1 = Math.floor((x1 - 0.01) / T), ty0 = Math.floor(y0 / T), ty1 = Math.floor((y1 - 0.01) / T);
      for (let ty = ty0; ty <= ty1; ty++) for (let tx = tx0; tx <= tx1; tx++) if (SE.isSolidTile(m, tx, ty)) return false;
      if (SE.npcBlocks(x0, y0, x1, y1)) return false;
      return true;
    }
    function changeMap(ex) {
      SE.fadeTo(() => {
        s.map = ex.to;
        SE.player.x = ex.tx * T; SE.player.y = ex.ty * T + 8; SE.player.dir = ex.dir;
        SE.npcRT = {};
        SE.updateNPCs(0, true);
        banner = 2.5;
      });
    }
    function computeHint() {
      const m = SE.MAPS[s.map];
      const [fx, fy] = SE.frontPoint();
      const tx = Math.floor(fx / T), ty = Math.floor(fy / T);
      const npc = SE.npcAtPoint(fx, fy);
      if (npc) return 'Conversar com ' + SE.NPCS[npc].name;
      const an = SE.animalAtPoint(fx, fy);
      if (an) return an.prod > 0 ? 'Recolher ' + SE.ITEMS[SE.ANIMALS[an.kind].product].name.toLowerCase() : an.pet ? an.name : 'Fazer carinho em ' + an.name;
      const b = SE.buildingAt(m, tx, ty, s);
      if (b) {
        const L = { casa: s.flags.carta ? 'Dormir' : 'Entrar em casa', poco: 'Encher o regador', caixote: 'Abrir o caixote', cocho: 'Encher o cocho (' + s.cocho + ')', armazem: 'Entrar no armazém', pensao: 'Comer na pensão', bar: 'Entrar no bar', mural: 'Ver o mural', feira: 'Montar a barraca', station: (s.stations[b.id] && s.stations[b.id].ok ? 'Usar: ' : 'Ver: ') + b.name };
        return L[b.act] || b.name;
      }
      if (m.id === 'farm') {
        const k = SE.key(tx, ty);
        if (s.forage[k]) return 'Pegar ' + SE.ITEMS[s.forage[k]].name;
        if (s.hives[k]) return s.hives[k].mel ? 'Recolher mel' : 'Colmeia';
        const so = s.soil[k];
        if (so && so.c && so.c.ready) return 'Colher ' + SE.CROPS[so.c.id].name;
        if (so && so.c && so.c.dead) return 'Arrancar planta morta';
        if (so && so.c) { const c = so.c, d = SE.CROPS[c.id]; return d.name + ': ' + Math.max(1, Math.ceil((d.days - c.age) / (SE.cal().epoca === 'aguas' ? 1.25 : 1))) + ' dia(s)' + (so.w ? '' : ' · precisa de água'); }
      }
      return '';
    }

    return {
      update(dt, paused) {
        t += dt;
        const p = SE.player, m = SE.MAPS[s.map];
        if (banner > 0) banner -= dt;
        // chuva
        if (SE.isRaining()) {
          const n = s.weather === 'tempestade' ? 6 : 3;
          for (let i = 0; i < n; i++) rain.push({ x: Math.random() * (W + 60), y: -10, v: 220 + Math.random() * 80 });
          if (s.weather === 'tempestade' && Math.random() < dt * 0.08) flash = 0.25;
        }
        for (let i = rain.length - 1; i >= 0; i--) { const r = rain[i]; r.y += r.v * dt; r.x -= r.v * 0.25 * dt; if (r.y > H) rain.splice(i, 1); }
        if (flash > 0) flash -= dt;
        if (s.map === 'farm') SE.updateAnimals(dt);
        if (paused) { p.moving = false; p.frame = 0; actCd = 0.25; return; }

        // tempo
        s.time += dt * SE.MIN_PER_SEC;
        if (s.map === 'vila') SE.updateNPCs(dt);
        const nt = Math.floor(s.time / 10);
        if (nt !== tick) {
          tick = nt; SE.checkGoals();
          if (Math.floor(s.time) === 24 * 60) SE.toast('Já é meia-noite. Hora de ir pra cama!', '#a0d0ff');
        }
        if (s.time >= SE.PASS_OUT) { SE.sleep(true); s.time = SE.PASS_OUT - 1; return; }

        // atalhos
        for (let i = 1; i <= 10; i++) if (I.take('h' + i)) { s.sel = i - 1; SE.audio.play('move'); }
        if (I.take('prev') || I.wheel < 0) { s.sel = (s.sel + 9) % 10; SE.audio.play('move'); }
        if (I.take('next') || I.wheel > 0) { s.sel = (s.sel + 1) % 10; SE.audio.play('move'); }
        if (I.take('inv')) { SE.audio.play('select'); SE.openPanel(SE.InventoryPanel()); return; }
        if (I.take('b')) { SE.audio.play('select'); SE.openPanel(SE.PauseMenu()); return; }

        // movimento
        const [dx, dy] = I.dir();
        let sp = (I.down.run ? 96 : 64) * (s.energy <= 10 ? 0.7 : 1);
        p.moving = !!(dx || dy);
        if (p.moving) {
          const len = Math.hypot(dx, dy);
          const vx = (dx / len) * sp * dt, vy = (dy / len) * sp * dt;
          if (vx && moveAxis(m, p.x + vx, p.y)) p.x += vx;
          if (vy && moveAxis(m, p.x, p.y + vy)) p.y += vy;
          if (dx && !dy) p.dir = dx < 0 ? 2 : 3;
          else if (dy && !dx) p.dir = dy < 0 ? 1 : 0;
          else if (!((p.dir === 2 && dx < 0) || (p.dir === 3 && dx > 0) || (p.dir === 1 && dy < 0) || (p.dir === 0 && dy > 0))) p.dir = dy < 0 ? 1 : 0;
          p.animT += dt * (I.down.run ? 1.5 : 1);
          p.frame = [1, 0, 2, 0][Math.floor(p.animT * 8) % 4];
        } else { p.frame = 0; p.animT = 0; }
        if (p.toolT > 0) p.toolT -= dt;

        // saídas do mapa
        const ftx = Math.floor(p.x / T), fty = Math.floor((p.y - 2) / T);
        for (const ex of m.exits) if (ftx >= ex.x0 && ftx <= ex.x1 && fty >= ex.y0 && fty <= ex.y1) { changeMap(ex); return; }

        // ação
        actCd -= dt;
        if (I.take('a') && actCd <= 0) { actCd = 0.18; SE.act(); }
        if (I.mouse.click) {
          I.mouse.click = false;
          const cam = this.cam || [0, 0];
          const wx = I.mouse.x + cam[0], wy = I.mouse.y + cam[1];
          const ddx = wx - p.x, ddy = wy - (p.y - 6);
          if (Math.abs(ddx) > 3 || Math.abs(ddy) > 3) p.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? 2 : 3) : ddy < 0 ? 1 : 0;
          if (Math.hypot(ddx, ddy) < 30 && actCd <= 0) { actCd = 0.18; SE.act(); }
        }
        hint = computeHint();
      },

      draw(c) {
        const m = SE.MAPS[s.map], p = SE.player, cal = SE.cal(), ep = cal.epoca;
        const tiles = SE.buildTiles(ep);
        const camX = Math.round(SE.clamp(p.x - W / 2, 0, m.w * T - W));
        const camY = Math.round(SE.clamp(p.y - 8 - H / 2, 0, m.h * T - H));
        this.cam = [camX, camY];
        c.fillStyle = '#000'; c.fillRect(0, 0, W, H);
        if (camY < 48) SE.drawPanorama(c, 0, -camY, W, 48, ep, s.time, camX, { t, chapel: m.id === 'farm' });
        const x0 = Math.floor(camX / T), y0 = Math.floor(camY / T), x1 = Math.min(m.w - 1, x0 + Math.ceil(W / T)), y1 = Math.min(m.h - 1, y0 + Math.ceil(H / T) + 1);
        const wf = Math.floor(t * 2.5) % 3;
        for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
          const g = m.ground[ty * m.w + tx], sx = tx * T - camX, sy = ty * T - camY;
          let img = null;
          if (g === 'g') { const h = SE.hash(tx, ty, 7); img = tiles.grass[h < 0.08 ? 4 + (h < 0.04 ? 1 : 0) : Math.floor(h * 4) % 4]; }
          else if (g === 'p') img = tiles.path[SE.hash(tx, ty, 3) < 0.5 ? 0 : 1];
          else if (g === 'w') img = tiles.water[(wf + tx) % 3];
          else if (g === 'c') img = tiles.cobble[(tx + ty) & 1];
          else if (g === 'r') img = tiles.rail;
          if (img) c.drawImage(img, sx, sy);
          if (m.id === 'farm') { const so = s.soil[SE.key(tx, ty)]; if (so) c.drawImage(so.w ? tiles.wet : tiles.tilled, sx, sy); }
        }
        // margem do rio
        if (m.id === 'farm') { const ry = 28 * T - camY; R(c, 1 * T - camX, ry - 2, 38 * T, 2, '#8a6a3a'); R(c, 1 * T - camX, 30 * T - camY, 38 * T, 2, '#8a6a3a'); }

        // objetos ordenados por profundidade
        const list = [];
        const ox = Math.max(0, x0 - 2), ox1 = Math.min(m.w - 1, x1 + 2), oy1 = Math.min(m.h - 1, y1 + 3);
        for (let ty = y0; ty <= oy1; ty++) for (let tx = ox; tx <= ox1; tx++) {
          const o = SE.objAt(m, tx, ty), sx = tx * T - camX, sy = ty * T - camY, base = (ty + 1) * T;
          if (o) list.push({ y: base, d: () => drawObj(c, m, o, tx, ty, sx, sy, ep) });
          if (m.id === 'farm') {
            const k = SE.key(tx, ty);
            const so = s.soil[k];
            if (so && so.c) list.push({ y: base - 2, d: () => SE.drawCrop(c, sx, sy, so.c, ep, t) });
            if (s.forage[k]) list.push({ y: base - 3, d: () => { SE.px.ell(c, sx + 8, sy + 14, 5, 1, 'rgba(0,0,0,0.2)'); SE.drawIcon(c, s.forage[k], sx, sy - 2 + Math.round(Math.sin(t * 3 + tx) * 1)); } });
          }
        }
        m.buildings.forEach((b) => {
          if (b.when && !b.when(s)) return;
          const sx = b.x * T - camX, sy = b.y * T - camY - b.over;
          if (sx > W || sx + b.w * T < 0 || sy > H || sy + b.h * T + b.over < 0) return;
          list.push({ y: (b.y + b.h) * T, d: () => {
            c.drawImage(SE.buildingSprite(b.art, b.w, b.h, b.over, b.variant ? b.variant(s) : ''), sx, sy);
            if (b.id === 'cocho' && s.cocho > 0) { R(c, sx + 3, sy + 7, 26, 3, '#7ccf5a'); R(c, sx + 5, sy + 6, 4, 1, '#a8e070'); }
            if (b.act === 'station' && s.stations[b.id] && s.stations[b.id].slots.some((sl) => sl.d <= 0)) {
              const by = sy - 8 + Math.round(Math.sin(t * 4) * 2);
              R(c, sx + b.w * 8 - 6, by, 12, 12, '#ffffff'); R(c, sx + b.w * 8 - 7, by + 1, 14, 10, '#ffffff');
              SE.drawIcon(c, SE.RECIPES[s.stations[b.id].slots.find((sl) => sl.d <= 0).r].out, sx + b.w * 8 - 6, by - 1, 0.75);
            }
            if (b.act === 'station' && s.stations[b.id] && s.stations[b.id].ok && s.stations[b.id].slots.some((sl) => sl.d > 0)) {
              for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; c.fillStyle = 'rgba(230,230,230,' + (0.6 - ph * 0.6) + ')'; c.fillRect(sx + b.w * 8 + Math.sin(ph * 6 + i) * 3, sy + 2 - ph * 14, 3, 3); }
            }
          } });
        });
        if (m.id === 'farm') s.animals.forEach((a) => list.push({ y: a.y, d: () => {
          const spr = SE.animalSprite(a.kind, a.left, a.walk ? (Math.floor((a.anim || 0) * 5) % 2) : (a.kind === 'galinha' && Math.sin(t * 2 + a.id) > 0.8 ? 2 : 0));
          c.drawImage(spr, Math.round(a.x - spr.width / 2 - camX), Math.round(a.y - spr.height - camY));
          if (a.heart > 0) ui.heart(c, Math.round(a.x - 3 - camX), Math.round(a.y - spr.height - 8 - camY - (1.5 - a.heart) * 6), true);
          else if (a.prod > 0) { const bx = Math.round(a.x - 6 - camX), by = Math.round(a.y - spr.height - 14 - camY + Math.sin(t * 3 + a.id)); R(c, bx, by, 12, 11, '#ffffff'); SE.drawIcon(c, SE.ANIMALS[a.kind].product, bx, by - 2, 0.75); }
        } }));
        if (m.id === 'vila') Object.keys(SE.npcRT).forEach((id) => {
          const r = SE.npcRT[id];
          if (!r.visible) return;
          list.push({ y: r.y, d: () => c.drawImage(SE.personSprite(SE.NPCS[id].look, r.dir, r.frame), Math.round(r.x - 8 - camX), Math.round(r.y - 23 - camY)) });
        });
        list.push({ y: p.y, d: () => drawPlayer(c, p, camX, camY) });
        list.sort((a, b) => a.y - b.y).forEach((e) => e.d());

        // abelhas
        if (m.id === 'farm') Object.keys(s.hives).forEach((k) => {
          const [hx, hy] = k.split(',').map(Number);
          for (let i = 0; i < 3; i++) R(c, hx * T + 8 + Math.sin(t * 5 + i * 2) * 8 - camX, hy * T + 2 + Math.cos(t * 4 + i) * 5 - camY, 1, 1, '#f2c94c');
        });

        // chuva, noite e luzes
        if (SE.isRaining()) {
          c.fillStyle = 'rgba(40,60,90,0.18)'; c.fillRect(0, 0, W, H);
        } else if (s.weather === 'nublado') { c.fillStyle = 'rgba(60,70,90,0.1)'; c.fillRect(0, 0, W, H); }
        else if (ep === 'seca') { c.fillStyle = 'rgba(255,200,120,0.05)'; c.fillRect(0, 0, W, H); }
        const dark = darkness(s.time);
        if (dark > 0) {
          c.fillStyle = 'rgba(12,18,52,' + dark + ')'; c.fillRect(0, 0, W, H);
          c.globalCompositeOperation = 'lighter';
          const glow = (x, y, r, a) => { for (let k = 3; k >= 1; k--) { c.fillStyle = 'rgba(255,170,70,' + (a * dark) / k + ')'; disc(c, x, y, r * k * 0.5, c.fillStyle); } };
          m.buildings.forEach((b) => (b.lights || []).forEach(([lx, ly]) => glow(b.x * T + lx - camX + 5, b.y * T - b.over + ly - camY, 7, 0.25)));
          for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) if (SE.objAt(m, tx, ty) === 'l') glow(tx * T + 8 - camX, ty * T - 10 - camY, 12, 0.3);
          glow(p.x - camX, p.y - 10 - camY, 10, 0.12);
          c.globalCompositeOperation = 'source-over';
        }
        if (flash > 0) { c.fillStyle = 'rgba(255,255,255,' + flash * 2 + ')'; c.fillRect(0, 0, W, H); }
        if (SE.isRaining()) { c.fillStyle = 'rgba(200,220,255,0.6)'; rain.forEach((r) => c.fillRect(r.x, r.y, 1, 4)); }
      },

      drawUI(c, dt) {
        const cal = SE.cal(), p = SE.player;
        // relógio
        const bx = W - 112, by = 4;
        ui.panel(c, bx, by, 108, 44);
        ui.text(c, SE.WEEKDAYS_SHORT[cal.wd] + ', ' + cal.dia + ' · ' + SE.EPOCAS[cal.epoca].short, bx + 8, by + 6, { col: cal.wd === 5 ? '#c0392b' : '#3a2412' });
        ui.text(c, SE.clock(s.time), bx + 8, by + 17, { size: 12, col: '#7a3a1a' });
        weatherIcon(c, bx + 86, by + 17, s.weather, s.time);
        ui.text(c, SE.money(s.money), bx + 8, by + 30, { col: '#2a6a2a' });
        if (cal.wd === 5 && s.time < 13 * 60) ui.text(c, 'FEIRA!', bx + 100, by + 30, { align: 'right', col: '#c0392b', size: 9 });
        // energia
        const ex = W - 16, ey = H - 74, eh = 62;
        c.fillStyle = '#3a2412'; c.fillRect(ex - 1, ey - 1, 10, eh + 2);
        c.fillStyle = '#5a4030'; c.fillRect(ex, ey, 8, eh);
        const f = s.energy / s.maxEnergy;
        c.fillStyle = f > 0.5 ? '#6ab04a' : f > 0.2 ? '#f2c94c' : '#e8405a';
        c.fillRect(ex + 1, ey + eh - Math.round((eh - 2) * f) - 1, 6, Math.round((eh - 2) * f));
        ui.text(c, 'E', ex + 4, ey + eh + 2, { align: 'center', size: 9, col: '#ffffff', shadow: '#000' });
        // objetivo
        const g = SE.currentGoal();
        if (g) {
          c.font = ui.font(10);
          const lines = SE.wrap(c, g.t, 170);
          c.fillStyle = 'rgba(20,12,6,0.6)'; c.fillRect(4, 4, 182, 14 + lines.length * 10);
          ui.text(c, 'OBJETIVO', 9, 7, { size: 9, col: '#f2c94c' });
          lines.forEach((l, i) => ui.text(c, l, 9, 16 + i * 10, { col: '#ffffff' }));
        }
        // barra rápida
        const hx = Math.round((W - 10 * 20) / 2) - 4, hy = H - 24;
        c.fillStyle = 'rgba(58,36,18,0.9)'; c.fillRect(hx - 2, hy - 2, 10 * 20 + 2, 23);
        for (let i = 0; i < 10; i++) {
          const x = hx + i * 20;
          c.fillStyle = i === s.sel ? '#f2c94c' : '#c49a6a'; c.fillRect(x, hy, 18, 19);
          c.fillStyle = '#f4e4bc'; c.fillRect(x + 1, hy + 1, 16, 17);
          const it = s.inv[i];
          if (it) {
            SE.drawIcon(c, it.id, x + 1, hy + 1);
            if (it.q > 1) ui.text(c, String(it.q), x + 17, hy + 10, { align: 'right', size: 9, col: '#ffffff', shadow: '#3a2412' });
            if (it.id === 'regador') { c.fillStyle = '#3a2412'; c.fillRect(x + 2, hy + 15, 14, 3); c.fillStyle = '#4a9ae8'; c.fillRect(x + 3, hy + 16, Math.round(12 * s.water / s.waterMax), 1); }
          }
          if (i === s.sel) { c.fillStyle = '#c0392b'; c.fillRect(x, hy - 2, 18, 2); }
          SE.addHit(x, hy, 18, 19, () => { s.sel = i; SE.audio.play('move'); });
        }
        const sel = s.inv[s.sel];
        if (sel) ui.text(c, SE.itemName(sel.id), hx - 6, hy + 5, { align: 'right', col: '#ffffff', shadow: '#000', size: 9 });
        // botões rápidos (mouse)
        if (!I.touch) {
          ui.btn(c, W - 50, H - 22, 28, 14, 'Bolsa', { size: 9, fn: () => SE.openPanel(SE.InventoryPanel()) });
          ui.btn(c, 4, H - 22, 30, 14, 'Menu', { size: 9, fn: () => SE.openPanel(SE.PauseMenu()) });
        }
        // dica de ação
        if (hint && !SE.panels.length) {
          const w = ui.measure(c, hint, 10) + 46;
          c.fillStyle = 'rgba(20,12,6,0.75)'; c.fillRect(W / 2 - w / 2, hy - 18, w, 13);
          ui.text(c, (I.touch ? '[A] ' : '[Espaço] ') + hint, W / 2, hy - 17, { align: 'center', col: '#ffe08a' });
        }
        if (banner > 0) {
          c.globalAlpha = Math.min(1, banner);
          ui.text(c, SE.MAPS[s.map].name, W / 2, 56, { align: 'center', size: 10, title: true, col: '#ffffff', shadow: '#3a2412' });
          c.globalAlpha = 1;
        }
      },
      toastY: H - 46,
    };

    function drawObj(c, m, o, tx, ty, sx, sy, ep) {
      const v = Math.floor(SE.hash(tx, ty, 5) * 4);
      if ('TPJAI'.includes(o)) c.drawImage(SE.objSprite(o, ep, v), sx - 8, sy + 16 - 44);
      else if (o === 'F') SE.drawFence(c, sx, sy, SE.objAt(m, tx - 1, ty) === 'F', SE.objAt(m, tx + 1, ty) === 'F', SE.objAt(m, tx, ty - 1) === 'F', SE.objAt(m, tx, ty + 1) === 'F');
      else if (o === 'h') {
        c.drawImage(SE.buildingSprite('colmeia', 1, 1, 4), sx, sy - 4);
        if (s.hives[SE.key(tx, ty)] && s.hives[SE.key(tx, ty)].mel) { R(c, sx + 3, sy - 14, 10, 9, '#ffffff'); SE.drawIcon(c, 'mel', sx + 3, sy - 16, 0.6); }
      } else if (o === 'l') {
        R(c, sx + 7, sy - 10, 2, 24, '#3a3a3a'); R(c, sx + 5, sy - 14, 6, 5, '#2a2a2a'); R(c, sx + 6, sy - 13, 4, 3, darkness(s.time) > 0 ? '#ffe08a' : '#d8d0b0'); R(c, sx + 5, sy + 13, 6, 2, '#2a2a2a');
      } else if (o === 'n') {
        R(c, sx, sy + 6, 16, 3, '#a07848'); R(c, sx, sy + 3, 16, 2, '#8a6a3a'); R(c, sx + 1, sy + 9, 2, 5, '#5a3c20'); R(c, sx + 13, sy + 9, 2, 5, '#5a3c20');
      } else {
        const spr = SE.objSprite(o, ep, v);
        if (spr) c.drawImage(spr, sx, sy);
      }
    }
    function drawPlayer(c, p, camX, camY) {
      const spr = SE.personSprite(SE.LOOKS[s.look], p.dir, p.frame);
      const px = Math.round(p.x - 8 - camX), py = Math.round(p.y - 23 - camY);
      const tool = p.toolT > 0 ? p.tool : null;
      const d = SE.DIRS[p.dir];
      const drawTool = () => {
        if (!tool || tool === 'colher') return;
        const sw = p.toolT > 0.12 ? -3 : 3;
        const tx = px + 4 + d[0] * 9 + (d[1] ? sw : 0), ty = py + 9 + d[1] * 7 + (d[0] ? sw : 0);
        SE.drawIcon(c, tool, tx, ty, 0.75);
      };
      if (p.dir === 1) drawTool();
      c.drawImage(spr, px, py - (tool === 'colher' ? 1 : 0));
      if (p.dir !== 1) drawTool();
      if (tool === 'regador') for (let i = 0; i < 4; i++) R(c, px + 8 + d[0] * 16 + (i - 2) * 2, py + 18 + d[1] * 12 + (i % 2) * 2, 1, 2, '#8ac0f0');
    }
  };

  function darkness(min) {
    const h = min / 60;
    if (h < 17.5) return 0;
    if (h < 20) return ((h - 17.5) / 2.5) * 0.6;
    return 0.6;
  }
  function weatherIcon(c, x, y, w, min) {
    const night = min >= 19 * 60;
    if (w === 'sol') {
      if (night) { disc(c, x + 6, y + 6, 4, '#f4f0d0'); disc(c, x + 8, y + 5, 3, '#7a5a3a'); }
      else { disc(c, x + 6, y + 6, 4, '#f2c94c'); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; R(c, x + 6 + Math.cos(a) * 6, y + 6 + Math.sin(a) * 6, 1, 1, '#e8a02a'); } }
    } else {
      ell(c, x + 6, y + 5, 6, 3, w === 'nublado' ? '#c8ccd4' : '#8a90a0'); ell(c, x + 4, y + 3, 3, 2, w === 'nublado' ? '#dfe2e8' : '#a0a6b4');
      if (w !== 'nublado') for (let i = 0; i < 3; i++) R(c, x + 2 + i * 4, y + 9, 1, 3, '#4a9ae8');
      if (w === 'tempestade') { R(c, x + 7, y + 8, 2, 2, '#f2c94c'); R(c, x + 6, y + 10, 2, 2, '#f2c94c'); }
    }
  }
})(window.SE);
