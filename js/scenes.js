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
        SE.toast('Que bom te ver de volta, ' + s.name + '!', '#ffe08a');
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
        SE.blit(c, SE.objSprite('T', ep, 2), -14, 98);
        SE.blit(c, SE.buildingSprite('casa', 5, 3, 20, 'reformada'), 24, 116);
        for (let i = 0; i < 9; i++) {
          const cx = 150 + i * 22;
          [0, 1].forEach((r) => SE.drawCrop(c, cx + r * 8, 160 + r * 14, { id: i % 3 === 0 ? 'cafe' : i % 3 === 1 ? 'milho' : 'cana', age: 99, ready: true }));
        }
        SE.shadow(c, 340, 183, 14, 4);
        SE.blit(c, SE.objSprite('I', ep, 0), 316, 120);
        SE.drawPerson(c, SE.LOOKS[0], 0, Math.floor(t * 2) % 8 === 0 ? 0 : 0, 120, 194);
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
        ui.text(c, 'v0.2  ·  Setas + Espaço  ·  Esc: menu  ·  M: música', W / 2, H - 12, { align: 'center', size: 9, col: '#ffffff', shadow: '#000' });
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
        c.fillStyle = '#e8b878'; c.fillRect(W / 2 - 30, y + 50, 60, 76);
        c.fillStyle = '#d8a060'; c.fillRect(W / 2 - 30, y + 110, 60, 16);
        SE.drawPerson(c, SE.LOOKS[look], d, Math.floor(t * 5) % 3, W / 2, y + 122, 2);
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
      'Mas a terra continua ali, esperando. Que bom ter você de volta, ' + s.name + '.',
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
          'Na barra de baixo estão suas ferramentas: enxada, regador, foice, machado e picareta. Troque com 1-0, Q/E ou a rodinha do mouse. Esc abre o menu.',
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
          SE.blit(c, SE.objSprite(k % 2 ? 'I' : 'T', 'aguas', k), tx, 92);
        }
        if (i >= 2) {
          SE.blit(c, SE.buildingSprite('ponto', 2, 1, 14), 40, 150);
          SE.drawPerson(c, SE.LOOKS[s.look], 0, 0, 60, 186);
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
  const KEYS = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '='];
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
        scene.onMapChange();
      });
    }
    function computeHint() {
      const m = SE.MAPS[s.map];
      const p = SE.player;
      if (SE.fishing) return SE.fishing.phase === 'bite' ? 'Fisgou! Aperte agora!' : 'Esperando o peixe morder... (Espaço recolhe)';
      const [fx, fy] = SE.frontPoint();
      const tx = Math.floor(fx / T), ty = Math.floor(fy / T);
      const npc = SE.npcAtPoint(fx, fy);
      if (npc) return 'Conversar com ' + SE.NPCS[npc].name;
      const an = SE.animalAtPoint(fx, fy);
      if (an) return an.prod > 0 ? 'Recolher ' + SE.ITEMS[SE.ANIMALS[an.kind].product].name.toLowerCase() : an.pet ? an.name : 'Fazer carinho em ' + an.name;
      const b = SE.buildingAt(m, tx, ty, s);
      if (b) {
        const L = { casa: s.flags.carta ? 'Dormir' : 'Entrar em casa', poco: 'Encher o regador', caixote: 'Abrir o caixote', cocho: 'Encher o cocho (' + s.cocho + ')', armazem: 'Entrar no armazém', ferraria: 'Entrar na ferraria', pensao: 'Comer na pensão', bar: 'Entrar no bar', mural: 'Ver o mural', feira: 'Montar a barraca', correio: SE.unreadMail() ? 'Abrir o correio (carta nova!)' : 'Abrir o correio', gruta: 'Entrar na gruta', station: (s.stations[b.id] && s.stations[b.id].ok ? 'Usar: ' : 'Ver: ') + b.name };
        return L[b.act] || b.name;
      }
      const o = SE.objAt(m, tx, ty);
      if (o === 'L') return 'Descer para o andar ' + (m.floor + 1);
      if (o === 'U') return 'Subir para o sítio';
      if (o === 'C') return 'Abrir o baú';
      if (o === 'O') { const f = s.furn[SE.key(tx, ty)]; return f && f.out ? (f.m > 0 ? 'Fornalha: ' + Math.ceil(f.m) + ' min' : 'Pegar ' + SE.ITEMS[f.out].name) : 'Usar a fornalha (segure minério)'; }
      if (m.id === 'farm') {
        const k = SE.key(tx, ty);
        if (s.forage[k]) return 'Pegar ' + SE.ITEMS[s.forage[k]].name;
        if (s.hives[k]) return s.hives[k].mel ? 'Recolher mel' : 'Colmeia';
        const so = s.soil[k];
        if (so && so.c && so.c.ready) return 'Colher ' + SE.CROPS[so.c.id].name;
        if (so && so.c && so.c.dead) return 'Arrancar planta morta';
        if (so && so.c) { const c = so.c, d = SE.CROPS[c.id]; return d.name + ': ' + Math.max(1, Math.ceil((d.days - c.age) / ((SE.cal().epoca === 'aguas' ? 1.25 : 1) * (so.f ? 1.25 : 1)))) + ' dia(s)' + (so.w ? '' : ' · precisa de água'); }
      }
      const held = s.inv[s.sel];
      if (held && held.id === 'vara' && !p.charge) return 'Segure para arremessar a linha';
      return '';
    }

    const scene = {
      onMapChange() {
        SE.npcRT = {};
        SE.updateNPCs(0, true);
        banner = 2.5;
        if (s.map !== 'mina') delete SE.MAPS.mina;
      },
      update(dt, paused) {
        t += dt;
        const p = SE.player, m = SE.MAPS[s.map];
        if (banner > 0) banner -= dt;
        if (SE.shake && SE.shake.t > 0) SE.shake.t -= dt;
        if (SE.shakeScreen > 0) SE.shakeScreen -= dt;
        if (SE.isRaining() && m.id !== 'mina') {
          const n = s.weather === 'tempestade' ? 6 : 3;
          for (let i = 0; i < n; i++) rain.push({ x: Math.random() * (W + 60), y: -10, v: 220 + Math.random() * 80 });
          if (s.weather === 'tempestade' && Math.random() < dt * 0.08) flash = 0.25;
        }
        for (let i = rain.length - 1; i >= 0; i--) { const r = rain[i]; r.y += r.v * dt; r.x -= r.v * 0.25 * dt; if (r.y > H) rain.splice(i, 1); }
        if (flash > 0) flash -= dt;
        if (s.map === 'farm') SE.updateAnimals(dt);
        if (paused) { p.moving = false; p.frame = 0; actCd = 0.25; p.charge = null; return; }

        // tempo
        s.time += dt * SE.MIN_PER_SEC;
        SE.furnaceTick(dt * SE.MIN_PER_SEC);
        if (s.map === 'vila') SE.updateNPCs(dt);
        SE.updateMine(dt);
        SE.updateFishing(dt);
        const nt = Math.floor(s.time / 10);
        if (nt !== tick) {
          tick = nt; SE.checkGoals();
          if (Math.floor(s.time) === 24 * 60) SE.toast('Já é meia-noite. Hora de ir pra cama!', '#a0d0ff');
        }
        if (s.time >= SE.PASS_OUT) { SE.sleep(true); s.time = SE.PASS_OUT - 1; return; }
        if (SE.state.map !== m.id) return;

        // menu e barra rápida
        for (let i = 1; i <= SE.HOTBAR; i++) if (I.take('h' + i)) { s.sel = i - 1; SE.audio.play('move'); }
        if (!p.charge && !SE.fishing) {
          if (I.take('prev') || I.wheel < 0) { s.sel = (s.sel + SE.HOTBAR - 1) % SE.HOTBAR; SE.audio.play('move'); }
          if (I.take('next') || I.wheel > 0) { s.sel = (s.sel + 1) % SE.HOTBAR; SE.audio.play('move'); }
        }
        if (I.take('inv') || I.take('b')) {
          if (SE.fishing) { SE.fishing = null; SE.toast('Você recolheu a linha.', '#e0d0b0'); return; }
          SE.audio.play('select'); SE.openPanel(SE.GameMenu(0)); return;
        }

        // empurrão (dano)
        if (p.kx || p.ky) {
          if (moveAxis(m, p.x + p.kx * dt, p.y)) p.x += p.kx * dt;
          if (moveAxis(m, p.x, p.y + p.ky * dt)) p.y += p.ky * dt;
          p.kx *= Math.pow(0.002, dt); p.ky *= Math.pow(0.002, dt);
          if (Math.abs(p.kx) + Math.abs(p.ky) < 5) p.kx = p.ky = 0;
        }

        // ferramenta carregando (segurar o botão)
        if (p.charge) {
          const ch = p.charge, held = ch.mouse ? I.mouse.down : I.down.a;
          const before = ch.id === 'vara' ? -1 : Math.min(SE.toolLvl(ch.id), Math.floor(ch.t / 0.45));
          ch.t += dt;
          if (ch.id === 'vara') ch.power = 1 - Math.abs(((ch.t / 0.9) % 2) - 1);
          else if (Math.min(SE.toolLvl(ch.id), Math.floor(ch.t / 0.45)) !== before) SE.audio.play('charge');
          p.moving = false; p.frame = 0;
          if (!held) { p.charge = null; SE.releaseCharge(ch); actCd = 0.2; }
          I.take('a'); I.mouse.click = false;
          hint = '';
          return;
        }
        if (SE.fishing) {
          p.moving = false; p.frame = 0;
          if (I.take('a') || I.mouse.click) { I.mouse.click = false; SE.reelIn(); actCd = 0.25; }
          hint = computeHint();
          return;
        }

        // movimento
        const [dx, dy] = I.dir();
        const sp = (I.down.run ? 96 : 64) * (s.energy <= 10 ? 0.7 : 1);
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
        if (I.take('a') && actCd <= 0) { actCd = 0.18; SE.act(false); }
        else if (I.down.a && actCd <= 0 && s.inv[s.sel] && s.inv[s.sel].id === 'facao') { actCd = 0.18; SE.swing(); }
        if (I.mouse.click) {
          I.mouse.click = false;
          const cam = this.cam || [0, 0];
          const wx = I.mouse.x + cam[0], wy = I.mouse.y + cam[1];
          const ddx = wx - p.x, ddy = wy - (p.y - 8);
          if (Math.abs(ddx) > 3 || Math.abs(ddy) > 3) p.dir = Math.abs(ddx) > Math.abs(ddy) ? (ddx < 0 ? 2 : 3) : ddy < 0 ? 1 : 0;
          if ((Math.hypot(ddx, ddy) < 34 || (s.inv[s.sel] && ['vara', 'facao'].includes(s.inv[s.sel].id))) && actCd <= 0) { actCd = 0.18; SE.act(true); }
        }
        hint = computeHint();
      },

      draw(c) {
        const m = SE.MAPS[s.map], p = SE.player, cal = SE.cal(), ep = cal.epoca;
        const mine = m.id === 'mina';
        const tiles = SE.buildTiles(ep), mt = mine ? SE.mineTiles(m.tier) : null;
        let camX = Math.round(SE.clamp(p.x - W / 2, 0, m.w * T - W));
        let camY = Math.round(SE.clamp(p.y - 12 - H / 2, mine ? 0 : 0, m.h * T - H));
        if (SE.shakeScreen > 0) { camX += Math.round(Math.sin(t * 80) * 2); camY += Math.round(Math.cos(t * 70) * 2); }
        this.cam = [camX, camY];
        c.fillStyle = mine ? '#0a0604' : '#000'; c.fillRect(0, 0, W, H);
        if (!mine && camY < 48) SE.drawPanorama(c, 0, -camY, W, 48, ep, s.time, camX, { t, chapel: m.id === 'farm' });
        const x0 = Math.max(0, Math.floor(camX / T)), y0 = Math.max(0, Math.floor(camY / T)), x1 = Math.min(m.w - 1, x0 + Math.ceil(W / T)), y1 = Math.min(m.h - 1, y0 + Math.ceil(H / T) + 1);
        const wf = Math.floor(t * 2.5) % 3;
        const G = (x, y) => SE.groundAt(m, x, y);
        const N4 = [['t', 0, -1], ['b', 0, 1], ['l', -1, 0], ['r', 1, 0]];
        for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) {
          const g = m.ground[ty * m.w + tx], sx = tx * T - camX, sy = ty * T - camY;
          if (mine) {
            if (g === 'd') c.drawImage(mt.floor[Math.floor(SE.hash(tx, ty, 9) * 3)], sx, sy);
            else c.drawImage(G(tx, ty + 1) === 'd' ? mt.face : mt.wall, sx, sy);
            continue;
          }
          let img = null;
          if (g === 'g') { const h = SE.hash(tx, ty, 7); img = tiles.grass[h < 0.08 ? 4 + (h < 0.04 ? 1 : 0) : Math.floor(h * 4) % 4]; }
          else if (g === 'p') img = tiles.path[SE.hash(tx, ty, 3) < 0.5 ? 0 : 1];
          else if (g === 'w') img = tiles.water[(wf + tx) % 3];
          else if (g === 'c') img = tiles.cobble[(tx + ty) & 1];
          else if (g === 'r') img = tiles.rail;
          if (img) c.drawImage(img, sx, sy);
          if (g === 'p') N4.forEach(([k, ddx, ddy]) => { if (G(tx + ddx, ty + ddy) === 'g') c.drawImage(tiles.fringe[k], sx, sy); });
          else if (g === 'w') N4.forEach(([k, ddx, ddy]) => { const n = G(tx + ddx, ty + ddy); if (n !== 'w' && n !== 's') c.drawImage(tiles.bank[k], sx, sy); });
          if (m.id === 'farm') {
            const so = s.soil[SE.key(tx, ty)];
            if (so) {
              c.drawImage(so.w ? tiles.wet : tiles.tilled, sx, sy);
              N4.forEach(([k, ddx, ddy]) => {
                if (s.soil[SE.key(tx + ddx, ty + ddy)]) return;
                c.drawImage(tiles.soilEdge[k], sx, sy);
                if (G(tx + ddx, ty + ddy) === 'g') c.drawImage(tiles.fringe[k], sx, sy);
              });
              if (so.f) { c.fillStyle = 'rgba(120,180,60,0.5)'; c.fillRect(sx + 3, sy + 3, 1, 1); c.fillRect(sx + 11, sy + 8, 1, 1); c.fillRect(sx + 6, sy + 12, 1, 1); }
            }
          }
        }

        // objetos ordenados por profundidade (sombras primeiro)
        const list = [];
        const ox = Math.max(0, x0 - 2), ox1 = Math.min(m.w - 1, x1 + 2), oy1 = Math.min(m.h - 1, y1 + 4);
        for (let ty = y0; ty <= oy1; ty++) for (let tx = ox; tx <= ox1; tx++) {
          const o = SE.objAt(m, tx, ty), sx = tx * T - camX, sy = ty * T - camY, base = (ty + 1) * T;
          if (o) list.push(objEntry(c, m, o, tx, ty, sx, sy, base, ep));
          if (m.id === 'farm') {
            const k = SE.key(tx, ty);
            const so = s.soil[k];
            if (so && so.c) list.push({ y: base - 2, d: () => SE.drawCrop(c, sx, sy, so.c) });
            if (s.forage[k]) list.push({ y: base - 3, sh: () => SE.shadow(c, sx + 8, sy + 14, 5, 1), d: () => SE.drawIcon(c, s.forage[k], sx, sy - 2 + Math.round(Math.sin(t * 3 + tx) * 1)) });
          }
        }
        m.buildings.forEach((b) => {
          if (b.when && !b.when(s)) return;
          const sx = b.x * T - camX, sy = b.y * T - camY - b.over;
          if (sx > W || sx + b.w * T < 0 || sy > H || sy + b.h * T + b.over < 0) return;
          list.push({ y: (b.y + b.h) * T, sh: () => { c.fillStyle = 'rgba(20,12,30,0.22)'; c.fillRect(sx + 3, sy + b.h * T + b.over - 2, b.w * T - 2, 3); }, d: () => {
            SE.blit(c, SE.buildingSprite(b.art, b.w, b.h, b.over, b.variant ? b.variant(s) : ''), sx, sy);
            if (b.id === 'cocho' && s.cocho > 0) { R(c, sx + 3, sy + 7, 26, 3, '#7ccf5a'); R(c, sx + 5, sy + 6, 4, 1, '#a8e070'); }
            if (b.id === 'correio' && SE.unreadMail()) bubble(c, sx + 8, sy - 6, null);
            if (b.act === 'station' && s.stations[b.id] && s.stations[b.id].slots.some(SE.slotReady)) bubble(c, sx + b.w * 8, sy - 4, SE.RECIPES[s.stations[b.id].slots.find(SE.slotReady).r].out);
            if (b.act === 'station' && s.stations[b.id] && s.stations[b.id].ok && s.stations[b.id].slots.some((sl) => sl.d > 0)) smoke(c, sx + b.w * 8, sy + 2);
          } });
        });
        if (m.id === 'farm') s.animals.forEach((a) => {
          const spr = SE.animalSprite(a.kind, a.left, a.walk ? (Math.floor((a.anim || 0) * 5) % 2) : (a.kind === 'galinha' && Math.sin(t * 2 + a.id) > 0.8 ? 2 : 0));
          const ax = Math.round(a.x - camX), ay = Math.round(a.y - camY), w = spr.width - 2, h = spr.height - 2;
          list.push({ y: a.y, sh: () => SE.shadow(c, ax, ay - 1, Math.round(w / 2.4), 2), d: () => {
            SE.blit(c, spr, ax - Math.round(w / 2), ay - h);
            if (a.heart > 0) ui.heart(c, ax - 3, ay - h - 8 - Math.round((1.5 - a.heart) * 6), true);
            else if (a.prod > 0) bubble(c, ax, ay - h - 6 + Math.round(Math.sin(t * 3 + a.id)), SE.ANIMALS[a.kind].product);
          } });
        });
        if (m.id === 'vila') Object.keys(SE.npcRT).forEach((id) => {
          const r = SE.npcRT[id];
          if (!r.visible) return;
          list.push({ y: r.y, d: () => SE.drawPerson(c, SE.NPCS[id].look, r.dir, r.frame, Math.round(r.x - camX), Math.round(r.y - camY)) });
        });
        if (m.mons || m.bombs) SE.mineDrawList(list, c, m, camX, camY, t);
        list.push({ y: p.y, d: () => drawPlayer(c, p, camX, camY) });
        list.sort((a, b) => a.y - b.y);
        list.forEach((e) => { if (e.sh) e.sh(); });
        list.forEach((e) => e.d());
        if (m.fx) SE.drawMineFX(c, m, camX, camY);

        // abelhas
        if (m.id === 'farm') Object.keys(s.hives).forEach((k) => {
          const [hx, hy] = k.split(',').map(Number);
          for (let i = 0; i < 3; i++) R(c, hx * T + 8 + Math.sin(t * 5 + i * 2) * 8 - camX, hy * T + 2 + Math.cos(t * 4 + i) * 5 - camY, 1, 1, '#f2c94c');
        });

        // pescaria: linha e boia
        if (SE.fishing) {
          const f = SE.fishing, d = SE.DIRS[p.dir];
          const rx = Math.round(p.x - camX + d[0] * 12), ry = Math.round(p.y - camY - 26 + (d[1] < 0 ? -4 : 0));
          const bx = Math.round(f.bx - camX), by = Math.round(f.by - camY + (f.phase === 'bite' ? Math.sin(t * 40) * 1.5 : Math.sin(t * 3)));
          c.strokeStyle = 'rgba(240,240,240,0.8)'; c.lineWidth = 1; c.beginPath(); c.moveTo(rx + 0.5, ry + 0.5); c.quadraticCurveTo((rx + bx) / 2, Math.max(ry, by) + 6, bx + 0.5, by + 0.5); c.stroke();
          R(c, bx - 1, by - 2, 3, 2, '#e8405a'); R(c, bx - 1, by, 3, 1, '#ffffff');
          if (f.phase === 'bite') { R(c, bx - 4, by + 2, 9, 1, '#cfe6fb'); }
        }

        // tempo, noite, luzes e gruta
        if (mine) {
          c.fillStyle = 'rgba(10,6,18,' + (0.28 + m.tier * 0.08) + ')'; c.fillRect(0, 0, W, H);
          c.globalCompositeOperation = 'lighter';
          for (let k = 3; k >= 1; k--) disc(c, Math.round(p.x - camX), Math.round(p.y - 12 - camY), 18 * k, 'rgba(255,170,80,' + 0.05 + ')');
          c.globalCompositeOperation = 'source-over';
        } else {
          if (SE.isRaining()) { c.fillStyle = 'rgba(40,60,90,0.18)'; c.fillRect(0, 0, W, H); }
          else if (s.weather === 'nublado') { c.fillStyle = 'rgba(60,70,90,0.1)'; c.fillRect(0, 0, W, H); }
          else if (ep === 'seca') { c.fillStyle = 'rgba(255,200,120,0.05)'; c.fillRect(0, 0, W, H); }
          const dark = darkness(s.time);
          if (dark > 0) {
            const h = s.time / 60;
            c.fillStyle = h < 19 ? 'rgba(80,40,90,' + dark * 0.6 + ')' : 'rgba(12,18,52,' + dark + ')'; c.fillRect(0, 0, W, H);
            c.globalCompositeOperation = 'lighter';
            const glow = (x, y, r, a) => { for (let k = 3; k >= 1; k--) disc(c, x, y, r * k * 0.5, 'rgba(255,170,70,' + (a * dark) / k + ')'); };
            m.buildings.forEach((b) => (b.lights || []).forEach(([lx, ly]) => glow(b.x * T + lx - camX + 5, b.y * T - b.over + ly - camY, 7, 0.25)));
            for (let ty = y0; ty <= y1; ty++) for (let tx = x0; tx <= x1; tx++) { const o = SE.objAt(m, tx, ty); if (o === 'l') glow(tx * T + 8 - camX, ty * T - 10 - camY, 12, 0.3); else if (o === 'O' && s.furn[SE.key(tx, ty)] && s.furn[SE.key(tx, ty)].out) glow(tx * T + 8 - camX, ty * T + 2 - camY, 8, 0.4); }
            glow(p.x - camX, p.y - 12 - camY, 10, 0.12);
            c.globalCompositeOperation = 'source-over';
          }
          if (flash > 0) { c.fillStyle = 'rgba(255,255,255,' + flash * 2 + ')'; c.fillRect(0, 0, W, H); }
          if (SE.isRaining()) { c.fillStyle = 'rgba(200,220,255,0.6)'; rain.forEach((r) => c.fillRect(r.x, r.y, 1, 4)); }
        }
      },

      drawUI(c) {
        const cal = SE.cal(), p = SE.player, m = SE.MAPS[s.map];
        // ------ relógio (estilo almanaque)
        const bx = W - 98, by = 3, bw = 94, bh = 50;
        ui.panel(c, bx, by, bw, bh);
        const h = s.time / 60, f = SE.clamp((h - 6) / 20, 0, 1);
        const dcx = bx + 20, dcy = by + 32;
        disc(c, dcx, dcy, 14, '#5a2a0a');
        const sky = SE.skyColors(cal.epoca, s.time);
        disc(c, dcx, dcy, 13, sky[0]); disc(c, dcx, dcy, 8, sky[1]);
        c.fillStyle = '#f8dca4'; c.fillRect(dcx - 15, dcy + 1, 31, 14);
        c.fillStyle = '#5a2a0a'; c.fillRect(dcx - 15, dcy, 31, 1);
        const ang = Math.PI * (1 - f);
        for (let r = 2; r < 12; r++) { c.fillStyle = r > 9 ? '#d9342b' : '#3a1a08'; c.fillRect(Math.round(dcx + Math.cos(ang) * r), Math.round(dcy - Math.sin(ang) * r), 1, 1); }
        disc(c, dcx, dcy, 1, '#3a1a08');
        ui.text(c, SE.WEEKDAYS_SHORT[cal.wd] + '. ' + cal.dia, bx + 40, by + 6, { size: 11, col: cal.wd === 5 ? '#c0392b' : '#3a1a08' });
        weatherIcon(c, bx + 40, by + 20, s.weather, s.time);
        seasonIcon(c, bx + 58, by + 20, cal.epoca);
        if (cal.wd === 5 && s.time < 13 * 60) ui.text(c, 'feira', bx + 70, by + 21, { size: 9, col: '#c0392b' });
        ui.text(c, SE.clock(s.time), bx + 40, by + 33, { size: 13, col: '#7a3a1a' });
        // ------ dinheiro em casas
        const mx = bx, my = by + bh + 1, mw = bw;
        c.fillStyle = '#3a1a08'; c.fillRect(mx, my, mw, 16); c.fillStyle = '#c26b2a'; c.fillRect(mx + 1, my + 1, mw - 2, 14);
        const digits = String(Math.max(0, Math.floor(s.money))).padStart(8, ' ').slice(-8);
        for (let i = 0; i < 8; i++) {
          const dx = mx + 6 + i * 10;
          c.fillStyle = '#5a2a0a'; c.fillRect(dx, my + 3, 9, 11); c.fillStyle = '#7a3a12'; c.fillRect(dx, my + 3, 9, 1);
          if (digits[i] !== ' ') ui.text(c, digits[i], dx + 5, my + 3, { align: 'center', size: 11, col: '#f2c94c' });
        }
        // ------ energia e vida
        const ex = W - 15, eh = 64, ey = H - eh - 10;
        vbar(c, ex, ey, eh, s.energy / s.maxEnergy, 'E');
        if (m.id === 'mina' || s.hp < s.maxHp) vbar(c, ex - 15, ey, eh, s.hp / s.maxHp, 'V', '#e8405a');
        // ------ objetivo ou andar da gruta
        if (m.id === 'mina') {
          ui.panel(c, 4, 4, 64, 22);
          ui.text(c, 'Andar ' + m.floor, 36, 10, { align: 'center', size: 11, col: '#7a3a1a' });
        } else {
          const g = SE.currentGoal();
          if (g) {
            c.font = ui.font(10);
            const lines = SE.wrap(c, g.t, 160);
            ui.panel(c, 4, 4, 176, 16 + lines.length * 10, { bg: '#fbe8bc' });
            R(c, 10, 9, 7, 9, '#f2c94c'); R(c, 13, 10, 1, 4, '#3a1a08'); R(c, 13, 16, 1, 1, '#3a1a08');
            lines.forEach((l, i) => ui.text(c, l, 20, 9 + i * 10, { col: '#3a1a08' }));
          }
        }
        // ------ barra de ferramentas
        const n = SE.HOTBAR, SZ = 19, hw = n * SZ + 8;
        const hx = Math.round((W - hw) / 2) - 6, hy = H - 26;
        ui.panel(c, hx, hy - 4, hw, SZ + 8);
        for (let i = 0; i < n; i++) {
          const x = hx + 4 + i * SZ, y = hy;
          ui.slot(c, x, y, SZ - 1, SZ - 1, { sel: i === s.sel });
          const it = s.inv[i];
          if (it) {
            SE.drawIcon(c, it.id, x + 1, y + 1);
            if (it.q > 1) ui.text(c, String(it.q), x + SZ - 2, y + 8, { align: 'right', size: 9, col: '#ffffff', shadow: '#3a1a08' });
            if (it.id === 'regador') { R(c, x + 2, y + 15, 14, 2, '#3a1a08'); R(c, x + 2, y + 15, Math.round(14 * s.water / s.waterMax), 1, '#4a9ae8'); }
          }
          ui.text(c, KEYS[i], x + 2, y, { size: 8, col: 'rgba(90,42,10,0.5)' });
          SE.addHit(x, y, SZ - 1, SZ - 1, () => { s.sel = i; SE.audio.play('move'); });
        }
        const sel = s.inv[s.sel];
        if (sel && !hint) ui.text(c, SE.itemName(sel.id), W / 2 - 6, hy - 16, { align: 'center', col: '#ffffff', shadow: '#000', size: 10 });
        if (!I.touch) ui.btn(c, 4, H - 20, 34, 14, 'Menu', { size: 9, fn: () => SE.openPanel(SE.GameMenu(0)) });
        // ------ dica de ação
        if (hint && !SE.panels.length) {
          const w = ui.measure(c, hint, 10) + 46;
          c.fillStyle = 'rgba(30,14,6,0.78)'; c.fillRect(W / 2 - w / 2 - 6, hy - 19, w, 13);
          ui.text(c, (I.touch ? '[A] ' : '[Espaço] ') + hint, W / 2 - 6, hy - 18, { align: 'center', col: '#ffe08a' });
        }
        // ------ carga da ferramenta e força do arremesso
        if (p.charge) {
          const cam = scene.cam || [0, 0];
          const px = Math.round(p.x - cam[0]), py = Math.round(p.y - cam[1]);
          if (p.charge.id === 'vara') {
            R(c, px + 10, py - 34, 6, 30, '#3a1a08'); R(c, px + 11, py - 33, 4, 28, '#5a4030');
            const ph = Math.round(28 * p.charge.power);
            R(c, px + 11, py - 5 - ph, 4, ph, p.charge.power > 0.8 ? '#6ab04a' : p.charge.power > 0.4 ? '#f2c94c' : '#e8405a');
          } else {
            const max = SE.toolLvl(p.charge.id), lv = Math.min(max, Math.floor(p.charge.t / 0.45));
            for (let i = 0; i < max; i++) { R(c, px - max * 4 + i * 8, py - 42, 7, 4, '#3a1a08'); R(c, px - max * 4 + i * 8 + 1, py - 41, 5, 2, i < lv ? '#f2c94c' : '#7a5a3a'); }
          }
        }
        if (SE.fishing && SE.fishing.phase === 'bite') {
          const cam = scene.cam || [0, 0];
          ui.text(c, '!', Math.round(p.x - cam[0]), Math.round(p.y - cam[1]) - 50 + Math.round(Math.sin(t * 30)), { align: 'center', size: 14, title: true, col: '#ffe066', shadow: '#c0392b' });
        }
        if (m.fx) SE.drawMineNums(c, m, scene.cam[0], scene.cam[1]);
        if (banner > 0) {
          c.globalAlpha = Math.min(1, banner);
          ui.text(c, m.name, W / 2, 62, { align: 'center', size: 10, title: true, col: '#ffffff', shadow: '#3a2412' });
          c.globalAlpha = 1;
        }
      },
      toastY: H - 50,
    };

    function bubble(c, x, y, icon) {
      R(c, x - 8, y - 14, 16, 14, '#3a1a08'); R(c, x - 7, y - 13, 14, 12, '#ffffff'); R(c, x - 2, y - 1, 4, 2, '#ffffff'); R(c, x - 1, y + 1, 2, 1, '#ffffff');
      if (icon) SE.drawIcon(c, icon, x - 7, y - 14, 0.85);
      else { R(c, x - 5, y - 11, 10, 7, '#f4e8c8'); R(c, x - 5, y - 11, 10, 1, '#c0392b'); R(c, x - 1, y - 9, 2, 2, '#c0392b'); }
    }
    function smoke(c, x, y) {
      for (let i = 0; i < 3; i++) { const ph = (t * 0.6 + i / 3) % 1; c.fillStyle = 'rgba(230,230,230,' + (0.6 - ph * 0.6) + ')'; c.fillRect(x + Math.sin(ph * 6 + i) * 3, y - ph * 14, 3, 3); }
    }
    function objEntry(c, m, o, tx, ty, sx, sy, base, ep) {
      const v = Math.floor(SE.hash(tx, ty, 5) * 4);
      const sh = SE.shake && SE.shake.t > 0 && SE.shake.tx === tx && SE.shake.ty === ty ? Math.round(Math.sin(t * 60) * 1.5) : 0;
      if (SE.TREE_CODES.includes(o)) return { y: base, sh: () => SE.shadow(c, sx + 8, sy + 14, 13, 4), d: () => SE.blit(c, SE.objSprite(o, ep, v), sx - 16 + sh, sy - 48) };
      if (o === 'F') return { y: base, d: () => SE.drawFence(c, sx, sy, SE.objAt(m, tx - 1, ty) === 'F', SE.objAt(m, tx + 1, ty) === 'F', SE.objAt(m, tx, ty - 1) === 'F', SE.objAt(m, tx, ty + 1) === 'F') };
      if (o === 'l') return { y: base, d: () => { R(c, sx + 7, sy - 10, 2, 24, '#3a3a3a'); R(c, sx + 5, sy - 14, 6, 5, '#2a2a2a'); R(c, sx + 6, sy - 13, 4, 3, darkness(s.time) > 0 ? '#ffe08a' : '#d8d0b0'); R(c, sx + 5, sy + 13, 6, 2, '#2a2a2a'); } };
      if (o === 'n') return { y: base, d: () => { R(c, sx, sy + 6, 16, 3, '#a07848'); R(c, sx, sy + 3, 16, 2, '#8a6a3a'); R(c, sx + 1, sy + 9, 2, 5, '#5a3c20'); R(c, sx + 13, sy + 9, 2, 5, '#5a3c20'); } };
      if (o === 'h') return { y: base, sh: () => SE.shadow(c, sx + 8, sy + 15, 6, 2), d: () => {
        SE.blit(c, SE.objSprite('h', ep), sx, sy - 4);
        const hv = s.hives[SE.key(tx, ty)]; if (hv && hv.mel) bubble(c, sx + 8, sy - 6, 'mel');
      } };
      if (o === 'O') return { y: base, sh: () => SE.shadow(c, sx + 8, sy + 15, 7, 2), d: () => {
        const f = s.furn[SE.key(tx, ty)];
        SE.blit(c, SE.objSprite(f && f.out && f.m > 0 ? 'o_lit' : 'O', ep), sx, sy - 12);
        if (f && f.out && f.m <= 0) bubble(c, sx + 8, sy - 14, f.out);
        else if (f && f.out) smoke(c, sx + 7, sy - 14);
      } };
      const tall = { E: 14, U: 12 }[o] || 0;
      const spr = SE.objSprite(o, ep, v, m.tier);
      if (!spr) return { y: base, d: () => {} };
      const shadowR = { r: 7, c: 7, f: 7, o: 7, q: 7, p: 6, k: 7, b: 6, C: 7, E: 4, R: 5 }[o];
      return { y: base, sh: shadowR ? () => SE.shadow(c, sx + 8, sy + 14, shadowR, 2) : null, d: () => SE.blit(c, spr, sx + sh, sy - tall) };
    }
    function drawPlayer(c, p, camX, camY) {
      if (p.inv > 0 && Math.floor(p.inv * 16) % 2) return;
      const px = Math.round(p.x - camX), py = Math.round(p.y - camY);
      const tool = p.toolT > 0 ? p.tool : p.charge ? p.charge.id : SE.fishing ? 'vara' : null;
      const d = SE.DIRS[p.dir];
      const drawTool = () => {
        if (!tool || tool === 'colher') return;
        if (tool === 'facao' && p.toolT > 0) {
          const a0 = Math.atan2(d[1], d[0]), sw = (0.24 - Math.max(0, p.toolT)) / 0.24;
          for (let i = 0; i < 6; i++) { const a = a0 - 1.2 + sw * 2.4 - i * 0.12; c.fillStyle = 'rgba(255,255,255,' + (0.7 - i * 0.1) + ')'; c.fillRect(Math.round(px + Math.cos(a) * 14), Math.round(py - 10 + Math.sin(a) * 12), 2, 2); }
        }
        const sw = p.charge ? -2 : p.toolT > 0.14 ? -4 : 3;
        const tx = px - 6 + d[0] * 10 + (d[1] ? sw : 0), ty = py - 20 + d[1] * 6 + (d[0] ? sw : 0);
        SE.drawIcon(c, tool, tx, ty, 0.8);
      };
      if (p.dir === 1) drawTool();
      SE.drawPerson(c, SE.LOOKS[s.look], p.dir, p.frame, px, py - (tool === 'colher' ? 1 : 0));
      if (p.dir !== 1) drawTool();
      if (tool === 'regador' && p.toolT > 0) for (let i = 0; i < 5; i++) R(c, px + d[0] * 16 + (i - 2) * 2, py - 6 + d[1] * 12 + (i % 2) * 2, 1, 2, '#8ac0f0');
    }
    return scene;
  };

  function darkness(min) {
    const h = min / 60;
    if (h < 17.5) return 0;
    if (h < 20) return ((h - 17.5) / 2.5) * 0.6;
    return 0.6;
  }
  function vbar(c, x, y, h, f, label, col) {
    R(c, x - 1, y - 12, 12, h + 13, '#3a1a08'); R(c, x, y - 11, 10, h + 11, '#c26b2a'); R(c, x, y - 11, 10, 1, '#e89a4a');
    ui.text(c, label, x + 5, y - 11, { align: 'center', size: 9, col: '#3a1a08' });
    R(c, x + 2, y, 6, h - 2, '#5a2a0a');
    const fh = Math.round((h - 4) * SE.clamp(f, 0, 1));
    R(c, x + 3, y + h - 3 - fh, 4, fh, col || (f > 0.5 ? '#6ad04a' : f > 0.2 ? '#f2c94c' : '#e8405a'));
    if (fh > 2) R(c, x + 3, y + h - 3 - fh, 1, fh, 'rgba(255,255,255,0.35)');
  }
  function seasonIcon(c, x, y, ep) {
    if (ep === 'aguas') { R(c, x + 2, y + 2, 8, 8, '#3a9a3a'); R(c, x + 3, y + 1, 6, 1, '#3a9a3a'); R(c, x + 5, y + 3, 1, 8, '#1e5a1e'); R(c, x + 3, y + 3, 2, 2, '#6cc052'); }
    else { disc(c, x + 6, y + 6, 4, '#e8a02a'); R(c, x + 2, y + 6, 8, 1, '#a0602a'); R(c, x + 5, y + 3, 1, 6, '#a0602a'); }
  }
  function weatherIcon(c, x, y, w, min) {
    const night = min >= 19 * 60;
    if (w === 'sol') {
      if (night) { disc(c, x + 6, y + 6, 4, '#f4f0d0'); disc(c, x + 8, y + 5, 3, '#c26b2a'); }
      else { disc(c, x + 6, y + 6, 4, '#f2c94c'); for (let i = 0; i < 8; i++) { const a = (i / 8) * Math.PI * 2; R(c, x + 6 + Math.cos(a) * 6, y + 6 + Math.sin(a) * 6, 1, 1, '#e8a02a'); } }
    } else {
      ell(c, x + 6, y + 5, 6, 3, w === 'nublado' ? '#c8ccd4' : '#8a90a0'); ell(c, x + 4, y + 3, 3, 2, w === 'nublado' ? '#dfe2e8' : '#a0a6b4');
      if (w !== 'nublado') for (let i = 0; i < 3; i++) R(c, x + 2 + i * 4, y + 9, 1, 3, '#4a9ae8');
      if (w === 'tempestade') { R(c, x + 7, y + 8, 2, 2, '#f2c94c'); R(c, x + 6, y + 10, 2, 2, '#f2c94c'); }
    }
  }
})(window.SE);
