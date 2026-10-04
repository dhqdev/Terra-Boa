'use strict';
// Pescaria: arremesso com força, espera, fisgada e o minijogo da barra verde.
(function (SE) {
  const T = SE.T, W = SE.W, H = SE.H, I = SE.input;
  SE.fishing = null;

  SE.castLine = function (power) {
    const s = SE.state, p = SE.player, m = SE.MAPS[s.map];
    if (!SE.useEnergy(SE.cost(4, 'pesca'))) return;
    const d = SE.DIRS[p.dir];
    const ptx = Math.floor(p.x / T), pty = Math.floor((p.y - 6) / T);
    const dist = 1 + Math.round(power * 3);
    p.tool = 'vara'; p.toolT = 0.3;
    SE.audio.play('cast');
    let hit = null;
    for (let k = dist; k >= 1; k--) { const tx = ptx + d[0] * k, ty = pty + d[1] * k; if (SE.groundAt(m, tx, ty) === 'w') { hit = [tx, ty]; break; } }
    if (!hit) { SE.toast('A linha não caiu na água. Fique de frente para o rio.', '#e0d0b0'); return; }
    const bait = SE.invCount('isca') > 0;
    if (bait) SE.invRemove('isca', 1);
    SE.fishing = { phase: 'wait', t: SE.rand(1.5, 5) * (bait ? 0.5 : 1), bx: hit[0] * T + 8, by: hit[1] * T + 8, bait };
    setTimeout(() => SE.audio.play('splash'), 200);
  };

  SE.updateFishing = function (dt) {
    const f = SE.fishing;
    if (!f) return;
    f.t -= dt;
    if (f.phase === 'wait' && f.t <= 0) { f.phase = 'bite'; f.t = 1.0; SE.audio.play('bite'); }
    else if (f.phase === 'bite' && f.t <= 0) { SE.fishing = null; SE.toast('O peixe roubou a isca e fugiu...', '#e0d0b0'); }
  };

  function chooseFish() {
    const s = SE.state, h = s.time / 60, ep = SE.cal().epoca;
    if (Math.random() < 0.07) return 'lata';
    const pool = Object.keys(SE.FISH).filter((id) => { const f = SE.FISH[id]; return f.ep.includes(ep) && h >= f.h[0] && h < f.h[1]; });
    let tot = pool.reduce((a, id) => a + SE.FISH[id].w, 0), r = Math.random() * tot;
    for (const id of pool) { r -= SE.FISH[id].w; if (r <= 0) return id; }
    return pool[0] || 'lambari';
  }

  SE.reelIn = function () {
    const f = SE.fishing;
    if (!f) return;
    SE.fishing = null;
    SE.player.tool = 'vara'; SE.player.toolT = 0.2;
    if (f.phase !== 'bite') { SE.toast('Você recolheu a linha.', '#e0d0b0'); return; }
    const id = chooseFish();
    if (id === 'lata') { SE.give('lata', 1); SE.addXP('pesca', 1); SE.toast('Ih... era uma lata velha. Pelo menos o rio ficou mais limpo.', '#e0d0b0'); return; }
    SE.openPanel(FishPanel(id));
  };

  function FishPanel(id) {
    const fish = SE.FISH[id], s = SE.state;
    const BAR_H = 130, ZONE_H = Math.round(30 + 3 * (s.lvl.pesca || 0));
    let zone = BAR_H - ZONE_H, zv = 0, fy = BAR_H * 0.6, ftgt = fy, ft = 0, prog = 0.3, t = 0, done = false;
    const diff = fish.diff;
    const p = {
      modal: true,
      update(dt) {
        if (done) return;
        t += dt;
        const hold = I.down.a || I.mouse.down;
        zv += (hold ? -520 : 420) * dt;
        zone += zv * dt;
        if (zone < 0) { zone = 0; zv = Math.max(0, zv) * 0.2; }
        if (zone > BAR_H - ZONE_H) { zone = BAR_H - ZONE_H; zv = -Math.abs(zv) * 0.35; if (Math.abs(zv) < 30) zv = 0; }
        ft -= dt;
        if (ft <= 0) {
          const jump = fish.mv === 'arisco' ? 0.9 : fish.mv === 'misto' ? 0.6 : 0.35;
          ft = SE.rand(0.4, 1.4) * (1.2 - diff / 120);
          if (fish.mv === 'afunda' && Math.random() < 0.5) ftgt = BAR_H - SE.rand(4, 30);
          else ftgt = SE.clamp(fy + SE.rand(-1, 1) * BAR_H * jump * (0.4 + diff / 100), 6, BAR_H - 6);
        }
        fy += (ftgt - fy) * Math.min(1, dt * (1.5 + diff / 18));
        const inZone = fy >= zone && fy <= zone + ZONE_H;
        prog += (inZone ? 0.32 : -(0.18 + diff / 500)) * dt;
        if (inZone && Math.floor(t * 12) !== Math.floor((t - dt) * 12)) SE.audio.play('reel');
        if (prog >= 1) finish(true);
        else if (prog <= 0) finish(false);
        if (I.take('b')) finish(false);
      },
      draw(c) {
        const ui = SE.ui;
        const x = Math.round(W / 2 - 34), y = 34;
        c.fillStyle = 'rgba(0,0,0,0.25)'; c.fillRect(0, 0, W, H);
        ui.panel(c, x - 8, y - 22, 84, BAR_H + 46);
        ui.text(c, 'Puxa!', x + 34, y - 15, { align: 'center', size: 7, title: true, col: '#7a3a1a' });
        c.fillStyle = '#3a2412'; c.fillRect(x, y, 26, BAR_H + 4);
        c.fillStyle = '#3d7fd0'; c.fillRect(x + 2, y + 2, 22, BAR_H);
        for (let i = 0; i < BAR_H; i += 8) { const ly = i + Math.floor(t * 20) % 8; if (ly < BAR_H) { c.fillStyle = '#3772bf'; c.fillRect(x + 2, y + 2 + ly, 22, 1); } }
        const inZone = fy >= zone && fy <= zone + ZONE_H;
        c.fillStyle = inZone ? '#7ad06a' : '#5aa04a'; c.fillRect(x + 3, y + 2 + Math.round(zone), 20, ZONE_H);
        c.fillStyle = '#b8f0a0'; c.fillRect(x + 3, y + 2 + Math.round(zone), 20, 2);
        c.fillStyle = '#3a8a2a'; c.fillRect(x + 3, y + Math.round(zone) + ZONE_H, 20, 2);
        SE.drawIcon(c, id, x + 5, y + 2 + Math.round(fy) - 8 + Math.round(Math.sin(t * 20) * (inZone ? 0.5 : 1.5)));
        c.fillStyle = '#3a2412'; c.fillRect(x + 32, y, 10, BAR_H + 4);
        c.fillStyle = '#5a4030'; c.fillRect(x + 34, y + 2, 6, BAR_H);
        const ph = Math.round(BAR_H * SE.clamp(prog, 0, 1));
        c.fillStyle = prog > 0.66 ? '#6ab04a' : prog > 0.33 ? '#f2c94c' : '#e8405a'; c.fillRect(x + 34, y + 2 + BAR_H - ph, 6, ph);
        // carretilha
        SE.px.disc(c, x + 56, y + BAR_H - 10, 7, '#9aa0a8'); SE.px.disc(c, x + 56, y + BAR_H - 10, 4, '#5a5e66');
        const a = t * (I.down.a || I.mouse.down ? 14 : 3);
        c.fillStyle = '#e8e8f0'; c.fillRect(Math.round(x + 56 + Math.cos(a) * 5), Math.round(y + BAR_H - 10 + Math.sin(a) * 5), 2, 2);
        ui.text(c, I.touch ? 'Segure A' : 'Segure Espaço', x + 34, y + BAR_H + 6, { align: 'center', size: 9, col: '#7a3a1a' });
        SE.addHit(0, 0, W, H, () => {});
      },
    };
    function finish(ok) {
      if (done) return;
      done = true;
      SE.closePanel(p);
      if (ok) {
        SE.give(id, 1, true);
        s.stats.peixes++;
        SE.addXP('pesca', 5 + diff / 3);
        SE.audio.play('harvest');
        SE.toast('Você pescou: ' + SE.ITEMS[id].name + '!', '#bff0a0', id);
        SE.checkGoals();
      } else { SE.audio.play('error'); SE.toast('O peixe escapou...', '#e0d0b0'); }
    }
    return p;
  }
})(window.SE);
