'use strict';
// Teclado, mouse/toque e controles na tela.
(function (SE) {
  const I = (SE.input = { down: {}, pressed: {}, typed: [], typing: false, mouse: { x: -1, y: -1, click: false }, wheel: 0, touch: false });
  const MAP = {
    ArrowUp: 'up', KeyW: 'up', ArrowDown: 'down', KeyS: 'down', ArrowLeft: 'left', KeyA: 'left', ArrowRight: 'right', KeyD: 'right',
    Space: 'a', Enter: 'a', NumpadEnter: 'a', KeyJ: 'a', Escape: 'b', KeyK: 'b', KeyI: 'inv', Tab: 'inv',
    KeyQ: 'prev', KeyE: 'next', KeyM: 'mute', ShiftLeft: 'run', ShiftRight: 'run', KeyF: 'fast',
  };
  for (let i = 1; i <= 10; i++) MAP['Digit' + (i % 10)] = 'h' + i;
  const REPEAT = { up: 1, down: 1, left: 1, right: 1 };

  window.addEventListener('keydown', (e) => {
    if (SE.audio && !SE.audio.ctx) SE.audio.init();
    if (I.typing) {
      if (e.key === 'Enter') I.pressed.a = true;
      else if (e.key === 'Escape') I.pressed.b = true;
      else if (e.key === 'Backspace') I.typed.push('\b');
      else if (e.key.length === 1) I.typed.push(e.key);
      else if (e.code === 'ArrowLeft') I.pressed.left = true;
      else if (e.code === 'ArrowRight') I.pressed.right = true;
      e.preventDefault();
      return;
    }
    const k = MAP[e.code];
    if (!k) return;
    e.preventDefault();
    if (e.repeat && !REPEAT[k]) return;
    I.down[k] = true;
    I.pressed[k] = true;
    I.shift = e.shiftKey;
  });
  window.addEventListener('keyup', (e) => {
    const k = MAP[e.code];
    if (k) I.down[k] = false;
    I.shift = e.shiftKey;
  });
  window.addEventListener('blur', () => { I.down = {}; });

  // consome um toque de tecla
  I.take = function (k) { if (I.pressed[k]) { I.pressed[k] = false; return true; } return false; };
  I.endFrame = function () { I.pressed = {}; I.mouse.click = false; I.wheel = 0; I.typed.length = 0; };
  I.dir = function () {
    let dx = 0, dy = 0;
    if (I.down.left) dx -= 1; if (I.down.right) dx += 1;
    if (I.down.up) dy -= 1; if (I.down.down) dy += 1;
    return [dx, dy];
  };

  I.attach = function (canvas) {
    const toGame = (e) => {
      const r = canvas.getBoundingClientRect();
      I.mouse.x = ((e.clientX - r.left) / r.width) * SE.W;
      I.mouse.y = ((e.clientY - r.top) / r.height) * SE.H;
    };
    canvas.addEventListener('pointermove', toGame);
    canvas.addEventListener('pointerdown', (e) => {
      if (SE.audio && !SE.audio.ctx) SE.audio.init();
      toGame(e);
      I.mouse.click = true;
      I.mouse.touch = e.pointerType === 'touch';
      e.preventDefault();
    });
    canvas.addEventListener('wheel', (e) => { I.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { passive: false });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());

    // Controles de toque
    const pad = document.getElementById('touch');
    const coarse = window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
    if (pad && (coarse || 'ontouchstart' in window)) {
      I.touch = true;
      pad.hidden = false;
      pad.querySelectorAll('[data-k]').forEach((btn) => {
        const k = btn.getAttribute('data-k');
        const on = (e) => { e.preventDefault(); if (SE.audio && !SE.audio.ctx) SE.audio.init(); I.down[k] = true; I.pressed[k] = true; btn.classList.add('on'); };
        const off = (e) => { e.preventDefault(); I.down[k] = false; btn.classList.remove('on'); };
        btn.addEventListener('pointerdown', on);
        btn.addEventListener('pointerup', off);
        btn.addEventListener('pointercancel', off);
        btn.addEventListener('pointerleave', off);
      });
    }
  };
})(window.SE);
