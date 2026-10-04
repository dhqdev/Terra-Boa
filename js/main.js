'use strict';
// Loop principal, escala de tela e transições.
(function (SE) {
  const W = SE.W, H = SE.H, I = SE.input;
  const cv = document.getElementById('game');
  const ctx = cv.getContext('2d');
  const [buf, bctx] = SE.canvas(W, H);
  SE.S = 1;

  function resize() {
    const dpr = window.devicePixelRatio || 1;
    const aw = window.innerWidth * dpr, ah = window.innerHeight * dpr;
    // escala inteira quando sobra espaço (pixels nítidos); fracionária em telas pequenas para preencher
    const fit = Math.min(aw / W, ah / H);
    let s = Math.floor(fit);
    if (s < 3 || fit - s > 0.5 * s) s = fit;
    cv.width = Math.round(W * s); cv.height = Math.round(H * s);
    cv.style.width = cv.width / dpr + 'px'; cv.style.height = cv.height / dpr + 'px';
    ctx.imageSmoothingEnabled = false;
    SE.S = s;
  }
  window.addEventListener('resize', resize);
  resize();
  I.attach(cv);

  SE.setScene = function (sc) { SE.scene = sc; SE.toasts.length = 0; };

  let fade = null;
  SE.fadeTo = function (cb) {
    if (fade) { fade.queue.push(cb); return; }
    fade = { t: 0, phase: 0, cb, queue: [] };
  };

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    if (I.take('mute') && !I.typing) { const on = SE.audio.toggleMusic(); SE.toast('Música ' + (on ? 'ligada' : 'desligada'), '#ffffff'); }

    if (fade) {
      fade.t += dt;
      if (fade.phase === 0 && fade.t >= 0.28) {
        fade.phase = 1; fade.t = 0;
        fade.cb();
        while (fade.queue.length) fade.queue.shift()();
      } else if (fade.phase === 1 && fade.t >= 0.28) fade = null;
      I.pressed = {}; I.mouse.click = false;
      SE.scene.update(dt, true);
    } else {
      SE.processClick();
      const top = SE.topPanel();
      if (top) top.update(dt);
      SE.scene.update(dt, SE.panels.length > 0);
    }

    // mundo em baixa resolução
    bctx.setTransform(1, 0, 0, 1, 0, 0);
    SE.scene.draw(bctx);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(buf, 0, 0, cv.width, cv.height);

    // interface com texto nítido
    ctx.setTransform(SE.S, 0, 0, SE.S, 0, 0);
    ctx.imageSmoothingEnabled = false;
    SE.hits = [];
    SE.hitOn = SE.panels.length === 0 && !fade;
    if (SE.scene.drawUI) SE.scene.drawUI(ctx, dt);
    const n = SE.panels.length;
    SE.panels.forEach((p, i) => { SE.hitOn = i === n - 1 && !fade; p.draw(ctx); });
    SE.hitOn = false;
    SE.drawToasts(ctx, dt, SE.scene.toastY && !n ? SE.scene.toastY : H - 70);
    if (fade) {
      const a = fade.phase === 0 ? fade.t / 0.28 : 1 - fade.t / 0.28;
      ctx.fillStyle = 'rgba(8,6,4,' + SE.clamp(a, 0, 1) + ')';
      ctx.fillRect(0, 0, W, H);
    }
    I.endFrame();
    requestAnimationFrame(frame);
  }

  SE.setScene(SE.TitleScene());
  const go = () => requestAnimationFrame(frame);
  if (document.fonts && document.fonts.load) {
    Promise.race([
      Promise.all([document.fonts.load('10px "VT323"'), document.fonts.load('10px "Press Start 2P"')]),
      new Promise((r) => setTimeout(r, 1500)),
    ]).then(go, go);
  } else go();
})(window.SE);
