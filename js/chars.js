'use strict';
// Gente (16×32), retratos (48×48), bichos, monstros da gruta, ônibus e ícones de itens.
(function (SE) {
  const { R, P, disc, ell } = SE.px;
  const mk = (w, h, fn) => { const [cv, c] = SE.canvas(w, h); fn(c); return SE.outline(cv); };

  // ---------------------------------------------------------------- Pessoas
  const P_CACHE = {};
  SE.personSprite = function (look, dir, frame) {
    const key = JSON.stringify(look) + dir + frame;
    if (P_CACHE[key]) return P_CACHE[key];
    const spr = mk(16, 32, (c) => {
      if (dir === 2) { c.translate(16, 0); c.scale(-1, 1); drawBody(c, 3, frame, look); }
      else drawBody(c, dir, frame, look);
    });
    P_CACHE[key] = spr;
    return spr;
  };
  // desenha com os pés em (x, y), centralizado
  SE.drawPerson = function (c, look, dir, frame, x, y, sc) {
    sc = sc || 1;
    SE.shadow(c, x, y - 1 * sc, 6 * sc, 2 * sc);
    SE.blit(c, SE.personSprite(look, dir, frame), x - 8 * sc, y - 32 * sc, sc);
  };

  function drawBody(c, dir, f, L) {
    const skin = L.skin, skinD = SE.shade(skin, -0.18), skinL = SE.shade(skin, 0.12);
    const hair = L.hair, hairD = SE.shade(hair, -0.3), hairL = SE.shade(hair, 0.25);
    const shirt = L.shirt, shirtD = SE.shade(shirt, -0.25), shirtL = SE.shade(shirt, 0.18);
    const pants = L.pants, pantsD = SE.shade(pants, -0.3), boot = '#3b2a1e';
    const eye = '#1a1008';
    if (dir === 0 || dir === 1) {
      const l1 = f === 1 ? 1 : 0, l2 = f === 2 ? 1 : 0;
      R(c, 5, 24, 3, 6 - l1, pants); R(c, 8, 24, 3, 6 - l2, pants); R(c, 8, 24, 1, 6 - l2, pantsD);
      R(c, 5, 30 - l1, 3, 2, boot); R(c, 8, 30 - l2, 3, 2, boot);
      if (L.dress) { R(c, 4, 21, 8, 6, L.dress); R(c, 3, 26, 10, 1, SE.shade(L.dress, -0.25)); R(c, 4, 21, 1, 5, SE.shade(L.dress, -0.15)); }
      R(c, 4, 15, 8, 9, shirt); R(c, 4, 15, 1, 9, shirtD); R(c, 11, 15, 1, 9, shirtD); R(c, 5, 15, 6, 1, shirtL);
      if (!L.dress) R(c, 4, 23, 8, 1, '#3a2a20');
      const a = f === 1 ? 1 : f === 2 ? -1 : 0;
      R(c, 2, 16 + a, 2, 6, shirtD); R(c, 12, 16 - a, 2, 6, shirtD); R(c, 2, 16 + a, 1, 6, SE.shade(shirtD, -0.15));
      R(c, 2, 22 + a, 2, 2, skin); R(c, 12, 22 - a, 2, 2, skin);
      if (L.apron && dir === 0) { R(c, 5, 17, 6, 8, L.apron); R(c, 5, 17, 6, 1, SE.shade(L.apron, -0.15)); }
      if (L.collar && dir === 0) R(c, 7, 15, 2, 1, '#ffffff');
      R(c, 7, 14, 2, 1, skinD);
      R(c, 4, 4, 8, 10, skin); R(c, 3, 5, 10, 8, skin); R(c, 4, 13, 8, 1, skinD);
      if (dir === 0) {
        R(c, 3, 3, 10, 4, hair); R(c, 4, 2, 8, 1, hair); R(c, 3, 7, 1, 3, hair); R(c, 12, 7, 1, 3, hair);
        P(c, 4, 7, hair); P(c, 6, 7, hair); P(c, 9, 7, hair); P(c, 11, 7, hair); R(c, 5, 3, 3, 1, hairL); P(c, 9, 4, hairL);
        if (L.long) { R(c, 2, 6, 2, 11, hair); R(c, 12, 6, 2, 11, hair); P(c, 2, 16, hairD); P(c, 13, 16, hairD); }
        R(c, 5, 9, 1, 2, eye); R(c, 10, 9, 1, 2, eye);
        if (L.glasses) { R(c, 4, 8, 3, 1, '#3a2a20'); R(c, 9, 8, 3, 1, '#3a2a20'); P(c, 7, 9, '#3a2a20'); P(c, 8, 9, '#3a2a20'); }
        P(c, 4, 11, SE.mix(skin, '#e86a6a', 0.35)); P(c, 11, 11, SE.mix(skin, '#e86a6a', 0.35));
        P(c, 7, 12, skinD); P(c, 8, 12, skinD); P(c, 6, 5, skinL);
        if (L.mustache) R(c, 6, 11, 4, 1, hair);
        if (L.beard) { R(c, 4, 11, 8, 3, hair); R(c, 6, 12, 4, 1, skinD); R(c, 5, 13, 6, 1, hairD); }
      } else {
        R(c, 3, 3, 10, 10, hair); R(c, 4, 2, 8, 1, hair); R(c, 5, 4, 4, 1, hairL); R(c, 4, 12, 8, 1, hairD);
        if (L.long) { R(c, 3, 13, 10, 5, hair); R(c, 4, 17, 8, 1, hairD); }
      }
    } else {
      const fo = f === 1 ? 1 : f === 2 ? -1 : 0;
      R(c, 6 - fo, 24, 3, 6, pantsD); R(c, 8 + fo, 24, 3, 6, pants);
      R(c, 6 - fo, 30, 4, 2, SE.shade(boot, -0.2)); R(c, 8 + fo, 30, 4, 2, boot);
      if (L.dress) { R(c, 5, 21, 7, 6, L.dress); R(c, 4, 26, 9, 1, SE.shade(L.dress, -0.25)); }
      R(c, 5, 15, 6, 9, shirt); R(c, 5, 15, 1, 9, shirtD); R(c, 6, 15, 4, 1, shirtL);
      if (!L.dress) R(c, 5, 23, 6, 1, '#3a2a20');
      if (L.apron) R(c, 10, 17, 2, 8, L.apron);
      R(c, 7 + fo, 16, 2, 6, shirtD); R(c, 7 + fo, 22, 2, 2, skin);
      R(c, 7, 14, 2, 1, skinD);
      R(c, 4, 4, 9, 10, skin); R(c, 5, 3, 7, 1, skin); R(c, 13, 9, 1, 2, skin); R(c, 4, 13, 9, 1, skinD);
      R(c, 4, 3, 9, 4, hair); R(c, 5, 2, 7, 1, hair); R(c, 4, 5, 4, 6, hair); P(c, 11, 7, hair); P(c, 12, 6, hair); R(c, 6, 3, 4, 1, hairL);
      P(c, 8, 9, skinD);
      if (L.long) { R(c, 3, 6, 3, 11, hair); P(c, 3, 16, hairD); }
      R(c, 10, 9, 1, 2, eye);
      if (L.glasses) { R(c, 9, 8, 3, 1, '#3a2a20'); R(c, 7, 8, 2, 1, '#3a2a20'); }
      P(c, 11, 12, skinD); P(c, 10, 11, SE.mix(skin, '#e86a6a', 0.35));
      if (L.mustache) R(c, 10, 11, 3, 1, hair);
      if (L.beard) R(c, 8, 11, 5, 3, hair);
    }
    if (L.hat === 'palha') {
      const side = dir === 3;
      R(c, side ? 2 : 1, 5, side ? 13 : 14, 2, '#e3c070'); R(c, side ? 2 : 1, 6, side ? 13 : 14, 1, '#b48a40');
      R(c, side ? 5 : 4, 1, side ? 7 : 8, 4, '#ecd088'); R(c, side ? 5 : 4, 4, side ? 7 : 8, 1, '#8a3a2a'); R(c, side ? 6 : 5, 1, 3, 1, '#fff0b8');
    } else if (L.hat === 'bone') {
      const hc = L.hatColor || '#c0392b';
      R(c, 3, 2, 10, 4, hc); R(c, 4, 2, 3, 1, SE.shade(hc, 0.3));
      if (dir === 0) R(c, 3, 6, 10, 1, SE.shade(hc, -0.35));
      if (dir === 3) R(c, 11, 5, 4, 1, SE.shade(hc, -0.35));
    } else if (L.scarf) {
      R(c, 3, 2, 10, 4, L.scarf); R(c, 2, 4, 1, 4, L.scarf); R(c, 13, 4, 1, 4, L.scarf); P(c, 5, 3, '#ffffff'); P(c, 9, 2, '#ffffff'); P(c, 11, 4, '#ffffff');
    }
  }

  // ---------------------------------------------------------------- Retratos 48×48 (diálogos e amizades)
  const POR_CACHE = {};
  SE.portraitSprite = function (look, emo) {
    const key = JSON.stringify(look) + (emo || 'n');
    if (POR_CACHE[key]) return POR_CACHE[key];
    const spr = mk(48, 48, (c) => drawPortrait(c, look, emo || 'n'));
    POR_CACHE[key] = spr;
    return spr;
  };
  function drawPortrait(c, L, emo) {
    const skin = L.skin, skinD = SE.shade(skin, -0.18), skinDD = SE.shade(skin, -0.32), skinL = SE.shade(skin, 0.14);
    const hair = L.hair, hairD = SE.shade(hair, -0.3), hairL = SE.shade(hair, 0.28);
    const shirt = L.dress || L.shirt, shirtD = SE.shade(shirt, -0.25), shirtL = SE.shade(shirt, 0.18);
    // ombros
    R(c, 6, 40, 36, 8, shirt); R(c, 9, 37, 30, 3, shirt); R(c, 6, 40, 4, 8, shirtD); R(c, 38, 40, 4, 8, shirtD); R(c, 12, 37, 10, 1, shirtL);
    if (L.long) { R(c, 8, 20, 6, 24, hair); R(c, 34, 20, 6, 24, hair); R(c, 8, 20, 2, 24, hairD); }
    R(c, 20, 32, 8, 7, skinD); R(c, 21, 38, 6, 2, skinDD);
    if (L.apron) { R(c, 15, 41, 18, 7, L.apron); R(c, 15, 41, 18, 1, SE.shade(L.apron, -0.15)); R(c, 17, 38, 2, 3, L.apron); R(c, 29, 38, 2, 3, L.apron); }
    if (L.collar) R(c, 21, 37, 6, 2, '#ffffff');
    // cabeça
    ell(c, 24, 22, 11, 13, skin); R(c, 12, 20, 2, 6, skin); R(c, 34, 20, 2, 6, skin); R(c, 12, 22, 1, 3, skinD); R(c, 35, 22, 1, 3, skinD);
    ell(c, 28, 30, 6, 3, skinD); ell(c, 24, 29, 8, 2, skin);
    R(c, 16, 15, 3, 2, skinL);
    // olhos
    const eyes = (x) => {
      if (emo === 'h') { P(c, x, 24, '#1a1008'); P(c, x + 1, 23, '#1a1008'); P(c, x + 2, 24, '#1a1008'); return; }
      R(c, x, 22, 3, 3, '#ffffff'); R(c, x + 1, 22, 2, 3, '#1a1008'); P(c, x + 1, 22, '#ffffff'); R(c, x, 21, 3, 1, skinD);
    };
    eyes(17); eyes(28);
    if (L.glasses) { R(c, 15, 21, 7, 1, '#3a2a20'); R(c, 15, 25, 7, 1, '#3a2a20'); R(c, 15, 21, 1, 5, '#3a2a20'); R(c, 21, 21, 1, 5, '#3a2a20');
      R(c, 26, 21, 7, 1, '#3a2a20'); R(c, 26, 25, 7, 1, '#3a2a20'); R(c, 26, 21, 1, 5, '#3a2a20'); R(c, 32, 21, 1, 5, '#3a2a20'); R(c, 22, 22, 4, 1, '#3a2a20'); }
    // sobrancelhas
    if (emo === 's') { R(c, 16, 18, 2, 1, hairD); R(c, 18, 19, 2, 1, hairD); R(c, 28, 19, 2, 1, hairD); R(c, 30, 18, 2, 1, hairD); }
    else { R(c, 16, 19, 4, 1, hairD); R(c, 28, 19, 4, 1, hairD); }
    // nariz, bochechas e boca
    R(c, 23, 25, 2, 3, skinD); P(c, 25, 27, skinDD);
    const blush = SE.mix(skin, '#e86a6a', 0.4);
    R(c, 14, 27, 3, 1, blush); R(c, 31, 27, 3, 1, blush);
    if (emo === 'h') { R(c, 20, 30, 8, 1, '#7a2a2a'); R(c, 21, 31, 6, 2, '#7a2a2a'); R(c, 22, 31, 4, 1, '#ffffff'); }
    else if (emo === 's') { R(c, 21, 31, 6, 1, '#7a3a2a'); P(c, 20, 32, '#7a3a2a'); P(c, 27, 32, '#7a3a2a'); }
    else { R(c, 21, 30, 6, 1, '#8a4a3a'); P(c, 20, 29, skinD); }
    if (L.mustache) { R(c, 18, 28, 12, 2, hair); R(c, 18, 28, 12, 1, hairL); }
    if (L.beard) { ell(c, 24, 32, 10, 5, hair); R(c, 14, 26, 3, 6, hair); R(c, 31, 26, 3, 6, hair); R(c, 21, 30, 6, 2, emo === 'h' ? '#7a2a2a' : '#8a4a3a'); R(c, 20, 35, 8, 1, hairD); }
    // cabelo
    ell(c, 24, 13, 13, 6, hair); R(c, 11, 13, 4, 10, hair); R(c, 33, 13, 4, 10, hair);
    for (let x = 14; x < 34; x += 4) { R(c, x, 17, 3, 2, hair); P(c, x + 1, 19, hair); }
    R(c, 17, 9, 8, 1, hairL); R(c, 15, 11, 3, 1, hairL); R(c, 11, 21, 2, 2, hairD); R(c, 35, 21, 2, 2, hairD);
    // chapéus
    if (L.hat === 'palha') {
      ell(c, 24, 12, 22, 3, '#d8b060'); ell(c, 24, 11, 21, 2, '#ecd088');
      R(c, 14, 1, 20, 10, '#ecd088'); R(c, 14, 1, 20, 1, '#fff0b8'); R(c, 14, 8, 20, 2, '#8a3a2a');
      for (let x = 15; x < 34; x += 3) R(c, x, 2, 1, 6, '#d8b060');
    } else if (L.hat === 'bone') {
      const hc = L.hatColor || '#c0392b';
      ell(c, 24, 10, 13, 6, hc); R(c, 11, 10, 26, 4, hc); R(c, 9, 13, 30, 2, SE.shade(hc, -0.35)); R(c, 18, 5, 8, 2, SE.shade(hc, 0.3));
    } else if (L.scarf) {
      ell(c, 24, 11, 14, 7, L.scarf); R(c, 10, 11, 4, 12, L.scarf); R(c, 34, 11, 4, 12, L.scarf);
      for (let i = 0; i < 7; i++) P(c, 14 + SE.hash(i, 3, 140) * 20, 6 + SE.hash(3, i, 141) * 8, '#ffffff');
    }
  }

  // ---------------------------------------------------------------- Bichos
  const A_CACHE = {};
  SE.animalSprite = function (kind, left, frame) {
    const k = kind + left + frame;
    if (A_CACHE[k]) return A_CACHE[k];
    const size = { vaca: [28, 22], cabra: [20, 18], galinha: [13, 13] }[kind];
    const spr = mk(size[0], size[1], (c) => {
      if (left) { c.translate(size[0], 0); c.scale(-1, 1); }
      const lf = frame === 1 ? 1 : 0;
      if (kind === 'vaca') {
        R(c, 5, 15, 3, 7 - lf, '#e8e0d0'); R(c, 9, 15, 3, 7, '#d8d0c0'); R(c, 16, 15, 3, 7, '#d8d0c0'); R(c, 20, 15, 3, 7 - lf, '#e8e0d0');
        R(c, 5, 21 - lf, 3, 1, '#3a2a20'); R(c, 9, 21, 3, 1, '#3a2a20'); R(c, 16, 21, 3, 1, '#3a2a20'); R(c, 20, 21 - lf, 3, 1, '#3a2a20');
        R(c, 3, 6, 20, 10, '#f4f0e6'); R(c, 4, 5, 18, 1, '#f4f0e6'); R(c, 3, 15, 20, 1, '#d8d0c0'); R(c, 5, 6, 14, 1, '#ffffff');
        R(c, 6, 7, 6, 5, '#3a2a20'); R(c, 14, 10, 5, 3, '#3a2a20'); R(c, 17, 6, 3, 2, '#3a2a20');
        R(c, 12, 15, 4, 2, '#f2a0a8');
        R(c, 1, 7, 2, 1, '#d8d0c0'); R(c, 0, 8, 1, 6, '#d8d0c0'); R(c, 0, 13, 2, 2, '#3a2a20');
        R(c, 21, 3, 7, 8, '#f4f0e6'); R(c, 22, 8, 6, 3, '#f2c0b0'); P(c, 24, 9, '#5a3a3a'); P(c, 26, 9, '#5a3a3a');
        R(c, 23, 5, 1, 2, '#1a1a1a'); R(c, 21, 1, 1, 2, '#e8dcc0'); R(c, 26, 1, 1, 2, '#e8dcc0'); R(c, 20, 4, 2, 2, '#3a2a20');
      } else if (kind === 'cabra') {
        R(c, 4, 11, 2, 7 - lf, '#5a4a3a'); R(c, 8, 11, 2, 7, '#4a3a2a'); R(c, 12, 11, 2, 7, '#4a3a2a'); R(c, 15, 11, 2, 7 - lf, '#5a4a3a');
        R(c, 3, 5, 14, 7, '#d8cfc0'); R(c, 3, 11, 14, 1, '#b8ae9c'); R(c, 5, 6, 8, 2, '#ece6da');
        R(c, 2, 5, 1, 3, '#b8ae9c');
        R(c, 14, 2, 5, 6, '#d8cfc0'); R(c, 17, 4, 3, 4, '#ece6da'); P(c, 16, 4, '#1a1a1a'); R(c, 16, 8, 2, 3, '#b8ae9c');
        R(c, 14, 0, 1, 2, '#8a7a6a'); R(c, 15, 0, 2, 1, '#8a7a6a'); R(c, 13, 3, 1, 2, '#b8ae9c');
      } else {
        R(c, 5, 10, 1, 3, '#e8a02a'); R(c, 8, 10, 1, 3 - lf, '#e8a02a');
        ell(c, 6, 7, 5, 3, '#f4f0e6'); R(c, 1, 4, 3, 3, '#e8e0d0'); R(c, 4, 7, 4, 1, '#d8d0c0'); R(c, 3, 5, 4, 1, '#ffffff');
        const hy = frame === 2 ? 2 : 0;
        R(c, 9, 2 + hy, 3, 4, '#f4f0e6'); R(c, 9, 1 + hy, 2, 1, '#d9342b'); R(c, 12, 3 + hy, 1, 1, '#e8a02a'); P(c, 10, 3 + hy, '#1a1a1a'); P(c, 11, 5 + hy, '#d9342b');
      }
    });
    A_CACHE[k] = spr;
    return spr;
  };

  // ---------------------------------------------------------------- Monstros da gruta
  const M_CACHE = {};
  SE.monsterSprite = function (kind, tier, frame) {
    const k = kind + tier + frame;
    if (M_CACHE[k]) return M_CACHE[k];
    let spr;
    if (kind === 'lesma') {
      const col = ['#5ac04a', '#4a9ae8', '#e8503a'][tier], colD = SE.shade(col, -0.3), colL = SE.shade(col, 0.4);
      spr = mk(16, 14, (c) => {
        const sq = frame ? 1 : 0;
        ell(c, 8, 9 + sq, 7 + sq, 4 - sq, colD); ell(c, 8, 8 + sq, 6 + sq, 4 - sq, col); ell(c, 6, 6 + sq, 2, 1, colL); P(c, 5, 5 + sq, '#ffffff');
        R(c, 5, 8 + sq, 2, 2, '#1a1008'); R(c, 10, 8 + sq, 2, 2, '#1a1008'); P(c, 5, 8 + sq, '#ffffff'); P(c, 10, 8 + sq, '#ffffff');
      });
    } else {
      const col = ['#6a4a5a', '#4a5a8a', '#9a2a2a'][tier], colD = SE.shade(col, -0.35);
      spr = mk(18, 12, (c) => {
        disc(c, 9, 6, 3, col); P(c, 7, 5, '#f2c94c'); P(c, 11, 5, '#f2c94c'); R(c, 7, 3, 1, 2, col); R(c, 11, 3, 1, 2, col);
        if (frame) { R(c, 1, 2, 5, 3, colD); R(c, 12, 2, 5, 3, colD); P(c, 0, 1, colD); P(c, 17, 1, colD); }
        else { R(c, 1, 6, 5, 3, colD); R(c, 12, 6, 5, 3, colD); P(c, 0, 9, colD); P(c, 17, 9, colD); }
        P(c, 8, 8, '#ffffff'); P(c, 10, 8, '#ffffff');
      });
    }
    M_CACHE[k] = spr;
    return spr;
  };

  // Ônibus da introdução
  SE.drawBus = function (c, x, y, t) {
    const b = Math.round(Math.sin(t * 20) * 0.6);
    ell(c, x + 30, y + 30, 30, 2, 'rgba(0,0,0,0.25)');
    R(c, x - 1, y + b - 1, 62, 26, '#2a1a10');
    R(c, x, y + b, 60, 24, '#f2f0e6'); R(c, x, y + 14 + b, 60, 4, '#2e6db5'); R(c, x, y + 18 + b, 60, 2, '#f2c94c');
    R(c, x, y + b, 60, 2, '#d8d4c8');
    for (let i = 0; i < 5; i++) { R(c, x + 4 + i * 10, y + 4 + b, 8, 8, '#3a5a8a'); P(c, x + 5 + i * 10, y + 5 + b, '#8ab0e0'); }
    R(c, x + 52, y + 4 + b, 7, 9, '#5a7aa8'); R(c, x + 4 + 10 * 2, y + 5 + b, 3, 3, '#e0ac7e');
    R(c, x + 58, y + 18 + b, 2, 3, '#f2c94c'); R(c, x + 52, y + 13 + b, 6, 12, '#3a5a8a');
    [12, 46].forEach((wx) => { disc(c, x + wx, y + 26, 4, '#222'); disc(c, x + wx, y + 26, 1, '#888'); });
  };

  // ---------------------------------------------------------------- Ícones (16×16, contornados)
  const I_CACHE = {};
  SE.METAL = ['#9aa0a8', '#d0783a', '#dfe6ee', '#f2c94c'];
  SE.toolLvl = (id) => (SE.state && SE.state.tools && SE.state.tools[id]) || 0;
  SE.iconSprite = function (id) {
    const lvl = SE.toolLvl(id);
    const key = id + '|' + lvl;
    if (I_CACHE[key]) return I_CACHE[key];
    const it = SE.ITEMS[id];
    const [k, a, b] = it ? it.icon : ['rock'];
    const metal = SE.METAL[lvl], metalD = SE.shade(metal, -0.3);
    const spr = mk(16, 16, (c) => {
      const handle = (n) => { for (let i = 0; i < n; i++) R(c, 3 + i, 13 - i, 2, 2, i % 3 ? '#a07848' : '#86603a'); };
      const ICON = {
        seed() { R(c, 3, 2, 10, 12, '#8a6a3a'); R(c, 4, 3, 8, 10, '#ece0bc'); R(c, 4, 3, 8, 2, '#d8c89a'); R(c, 3, 2, 10, 1, '#a07848'); disc(c, 8, 9, 2, a); P(c, 7, 8, SE.shade(a, 0.4)); },
        cob() { R(c, 6, 2, 5, 11, '#f2c94c'); for (let y = 3; y < 13; y += 2) R(c, 6, y, 5, 1, '#d9a92c'); R(c, 7, 2, 1, 10, '#fff0a0'); R(c, 4, 6, 3, 9, '#5aa03a'); R(c, 10, 7, 3, 8, '#3f8a2a'); R(c, 7, 13, 3, 3, '#4a8a2a'); },
        beans() { [[4, 9], [8, 10], [11, 8], [6, 6], [9, 5], [5, 12], [10, 12]].forEach(([x, y]) => { ell(c, x, y, 2, 1, '#8a4b2a'); P(c, x - 1, y - 1, '#c08060'); }); },
        pumpkin() { ell(c, 8, 10, 6, 5, '#d9731e'); ell(c, 8, 9, 5, 4, '#f2902a'); R(c, 8, 5, 1, 10, '#c2621a'); R(c, 5, 6, 1, 8, '#e07a22'); R(c, 11, 6, 1, 8, '#e07a22'); R(c, 4, 7, 1, 3, '#ffb860'); R(c, 7, 2, 3, 3, '#5a7a2a'); },
        root() { for (let i = 0; i < 9; i++) R(c, 3 + i, 11 - i, 3, 3, i < 7 ? '#8a5a3a' : '#f4e8c8'); for (let i = 0; i < 7; i++) P(c, 4 + i, 11 - i, '#a87a54'); R(c, 11, 2, 3, 3, '#f4e8c8'); },
        berries() { [[6, 8], [9, 7], [8, 10], [11, 10], [5, 11]].forEach(([x, y]) => { disc(c, x, y, 2, a); P(c, x - 1, y - 1, '#f08080'); }); R(c, 8, 2, 4, 3, '#2f7a3a'); },
        cane() { [3, 7, 11].forEach((x) => { for (let y = 1; y < 15; y++) R(c, x + Math.floor(y / 5), y, 2, 1, y % 4 === 0 ? '#5a8a2a' : '#b8c45a'); }); },
        fruit() { disc(c, 8, 9, 5, SE.shade(a, -0.2)); disc(c, 7, 8, 4, a); P(c, 6, 6, '#ffffff'); P(c, 5, 7, SE.shade(a, 0.4)); R(c, 8, 2, 1, 3, '#6b4a2a'); R(c, 9, 2, 3, 2, '#3f8a2a'); },
        cluster() { [[6, 6], [10, 6], [8, 9], [5, 10], [11, 10], [8, 12]].forEach(([x, y]) => { disc(c, x, y, 2, a); P(c, x - 1, y - 1, '#8a6aa8'); }); },
        egg() { ell(c, 8, 9, 4, 6, '#e8d8b8'); ell(c, 8, 8, 3, 5, '#f8ecd4'); P(c, 6, 5, '#ffffff'); P(c, 6, 6, '#ffffff'); },
        bottle() { R(c, 7, 1, 3, 2, '#a07848'); R(c, 7, 3, 3, 3, '#cfe0e8'); R(c, 5, 6, 7, 9, '#cfe0e8'); R(c, 5, 8, 7, 7, a); R(c, 6, 7, 1, 7, 'rgba(255,255,255,0.6)'); R(c, 5, 14, 7, 1, SE.shade(a, -0.3)); },
        jar() { R(c, 4, 3, 9, 3, b || '#8a5a2a'); R(c, 3, 6, 11, 9, '#dfe8ec'); R(c, 4, 7, 9, 7, a); R(c, 5, 9, 7, 3, '#f4ecd8'); R(c, 5, 7, 1, 2, 'rgba(255,255,255,0.7)'); },
        wheel() { R(c, 2, 7, 12, 6, SE.shade(a, -0.15)); ell(c, 8, 7, 6, 2, a); R(c, 2, 12, 12, 1, SE.shade(a, -0.35)); R(c, 9, 7, 5, 6, SE.shade(a, -0.05)); P(c, 11, 9, '#e8d080'); P(c, 5, 10, '#e8d080'); },
        pot() { R(c, 4, 5, 9, 9, a); R(c, 3, 4, 11, 2, '#c0392b'); R(c, 5, 7, 7, 4, '#2e6db5'); R(c, 6, 8, 5, 2, '#ffffff'); },
        bun() { [[5, 10], [11, 10], [8, 6]].forEach(([x, y]) => { disc(c, x, y, 3, '#d9a24c'); disc(c, x - 1, y - 1, 2, '#f2c870'); }); },
        bag() { R(c, 4, 4, 9, 11, a); R(c, 4, 4, 2, 11, SE.shade(a, -0.15)); R(c, 6, 2, 5, 2, a); R(c, 5, 4, 7, 1, '#8a6a3a'); R(c, 4, 9, 9, 2, b); },
        brick() { R(c, 2, 6, 12, 7, '#8a4a1a'); R(c, 4, 4, 12, 2, '#c47a3a'); R(c, 14, 4, 2, 7, '#6a3a12'); R(c, 3, 8, 3, 1, '#a5612a'); R(c, 8, 10, 4, 1, '#a5612a'); },
        husk() { R(c, 3, 4, 10, 9, '#c8d07a'); R(c, 3, 4, 10, 1, '#e0e4a0'); R(c, 7, 2, 2, 13, '#8a9a4a'); R(c, 3, 8, 10, 1, '#6a7a3a'); R(c, 4, 13, 8, 1, '#a8b05a'); },
        bowl() { ell(c, 8, 8, 6, 2, a); R(c, 2, 8, 12, 4, '#a5612a'); R(c, 4, 12, 8, 2, '#8a4a1a'); P(c, 6, 7, '#8a4a1a'); P(c, 9, 8, '#8a4a1a'); },
        grass() { for (let i = 0; i < 6; i++) R(c, 4 + i, 2 + (i % 2) * 2, 1, 12, i % 2 ? '#5aa03a' : '#7ccf5a'); R(c, 3, 9, 9, 2, '#c49a5a'); },
        sack() { R(c, 3, 4, 10, 11, a); R(c, 5, 2, 6, 3, a); R(c, 6, 4, 4, 1, '#6b4a2a'); R(c, 5, 8, 6, 4, '#e8dcc0'); R(c, 7, 9, 2, 2, b || '#3f8a2a'); },
        log() { R(c, 2, 6, 11, 6, '#7a5230'); R(c, 2, 6, 11, 1, '#a07848'); R(c, 2, 11, 11, 1, '#5a3c20'); ell(c, 13, 9, 2, 3, '#d8b080'); P(c, 13, 9, '#a07848'); },
        rock() { ell(c, 8, 10, 6, 4, '#7a7470'); ell(c, 8, 9, 5, 3, '#9a948e'); R(c, 5, 7, 3, 1, '#c4beb6'); },
        hive() { R(c, 3, 4, 10, 10, '#f4f0e6'); R(c, 2, 3, 12, 2, '#c49a6a'); R(c, 3, 8, 10, 1, '#d8d0c0'); R(c, 6, 12, 4, 1, '#2a1a12'); P(c, 13, 6, '#f2c94c'); P(c, 1, 9, '#f2c94c'); },
        hoe() { handle(11); R(c, 10, 1, 5, 3, metal); R(c, 13, 3, 2, 3, metalD); P(c, 10, 1, SE.shade(metal, 0.4)); },
        can() { R(c, 4, 6, 8, 8, '#3f8a5a'); R(c, 4, 6, 8, 2, metal); R(c, 12, 8, 3, 1, '#3f8a5a'); R(c, 14, 6, 1, 2, metal); R(c, 1, 7, 3, 4, '#2f6a4a'); R(c, 6, 3, 4, 2, metalD); R(c, 5, 9, 1, 4, '#5aaa7a'); },
        sickle() { handle(6); R(c, 8, 4, 2, 6, '#c4c8d0'); R(c, 9, 2, 4, 2, '#c4c8d0'); R(c, 12, 3, 2, 3, '#c4c8d0'); P(c, 10, 6, '#7a8088'); },
        axe() { handle(11); R(c, 9, 1, 4, 6, metal); R(c, 8, 2, 1, 4, SE.shade(metal, 0.3)); R(c, 12, 2, 1, 4, metalD); },
        pick() { handle(11); R(c, 7, 2, 9, 2, metal); R(c, 6, 3, 2, 2, metalD); R(c, 15, 3, 1, 3, metalD); P(c, 9, 2, SE.shade(metal, 0.4)); },
        rod() { for (let i = 0; i < 13; i++) P(c, 2 + i, 14 - i, i < 4 ? '#5a3a1e' : '#c49a6a'); for (let i = 0; i < 13; i++) P(c, 3 + i, 14 - i, i < 4 ? '#7a5230' : '#a07848'); R(c, 4, 10, 3, 3, '#9aa0a8'); R(c, 14, 2, 1, 9, '#e8e8f0'); R(c, 13, 11, 3, 2, '#c0392b'); },
        blade() { for (let i = 0; i < 8; i++) R(c, 5 + i, 10 - i, 3, 2, '#c8ccd4'); for (let i = 0; i < 8; i++) P(c, 5 + i, 10 - i, '#ffffff'); R(c, 2, 11, 4, 4, '#6b4a2a'); R(c, 4, 10, 3, 1, '#3a3a40'); P(c, 3, 12, '#a07848'); },
        fish() { ell(c, 8, 8, 6, 3, a); ell(c, 8, 7, 5, 1, SE.shade(a, 0.35)); R(c, 1, 5, 2, 7, b || SE.shade(a, -0.25)); R(c, 3, 6, 1, 5, b || SE.shade(a, -0.25)); P(c, 12, 7, '#1a1008'); R(c, 6, 10, 4, 1, SE.shade(a, -0.3)); R(c, 7, 4, 3, 1, b || SE.shade(a, -0.25)); },
        ore() { ell(c, 8, 9, 6, 5, '#7a7470'); ell(c, 8, 8, 5, 4, '#9a948e'); [[5, 7], [9, 6], [7, 10], [11, 9]].forEach(([x, y]) => { R(c, x, y, 2, 2, a); P(c, x, y, SE.shade(a, 0.5)); }); },
        bar() { R(c, 2, 7, 12, 6, SE.shade(a, -0.2)); R(c, 4, 5, 10, 3, a); R(c, 4, 5, 10, 1, SE.shade(a, 0.5)); R(c, 12, 5, 2, 6, SE.shade(a, -0.35)); R(c, 3, 8, 3, 1, SE.shade(a, 0.3)); },
        coal() { ell(c, 8, 10, 6, 4, '#1e1a1a'); ell(c, 7, 9, 4, 3, '#2e2a2a'); P(c, 5, 8, '#6a6470'); P(c, 9, 7, '#6a6470'); P(c, 11, 11, '#4a4450'); },
        gem() { R(c, 6, 3, 4, 2, SE.shade(a, 0.3)); R(c, 4, 5, 8, 3, a); R(c, 5, 8, 6, 3, SE.shade(a, -0.15)); R(c, 7, 11, 2, 2, SE.shade(a, -0.3)); P(c, 6, 5, '#ffffff'); P(c, 5, 6, '#ffffff'); },
        slime() { ell(c, 8, 10, 6, 4, '#4aa03a'); ell(c, 7, 9, 4, 2, '#7ad06a'); P(c, 5, 8, '#e8ffe0'); R(c, 10, 13, 2, 2, '#4aa03a'); },
        chest() { R(c, 1, 5, 14, 10, '#9a6232'); R(c, 1, 5, 14, 4, '#b57a40'); R(c, 1, 9, 14, 1, '#5a3418'); R(c, 3, 5, 1, 10, '#c8ccd4'); R(c, 12, 5, 1, 10, '#c8ccd4'); R(c, 7, 8, 2, 3, '#f2c94c'); R(c, 2, 3, 12, 2, '#d29a5a'); },
        scare() { R(c, 7, 6, 2, 10, '#7a5230'); R(c, 2, 8, 12, 2, '#7a5230'); R(c, 5, 7, 6, 5, '#c0392b'); disc(c, 8, 4, 3, '#e8d4a0'); R(c, 3, 2, 10, 1, '#e3c070'); R(c, 5, 0, 6, 2, '#e8c878'); },
        sprink() { ell(c, 8, 12, 5, 2, '#8a5a2a'); R(c, 5, 8, 6, 4, '#c87838'); R(c, 5, 8, 6, 1, '#e8a060'); R(c, 7, 4, 2, 4, '#9aa0a8'); R(c, 6, 3, 4, 2, '#c8ccd4'); P(c, 3, 3, '#8ac0f0'); P(c, 12, 3, '#8ac0f0'); P(c, 2, 6, '#8ac0f0'); P(c, 13, 6, '#8ac0f0'); },
        furnace() { R(c, 3, 5, 10, 10, '#8a827a'); R(c, 4, 2, 8, 4, '#8a827a'); R(c, 6, 0, 4, 2, '#6a625a'); R(c, 5, 9, 6, 5, '#1a100c'); R(c, 6, 11, 4, 3, '#e8582a'); P(c, 7, 12, '#f2c94c'); R(c, 3, 5, 10, 1, '#b2aa9e'); },
        fert() { R(c, 3, 4, 10, 11, '#6a8a3a'); R(c, 5, 2, 6, 3, '#6a8a3a'); R(c, 5, 7, 6, 5, '#e8dcc0'); R(c, 7, 8, 2, 3, '#4a7a2a'); P(c, 6, 9, '#4a7a2a'); P(c, 9, 9, '#4a7a2a'); },
        bait() { R(c, 2, 10, 4, 2, '#d88a8a'); R(c, 5, 8, 3, 2, '#d88a8a'); R(c, 8, 9, 3, 2, '#c87070'); R(c, 11, 7, 3, 2, '#d88a8a'); P(c, 13, 7, '#3a2412'); ell(c, 8, 13, 6, 1, '#8a6a3a'); },
        bomb() { disc(c, 8, 9, 5, '#2a2a30'); disc(c, 7, 8, 3, '#4a4a54'); P(c, 6, 7, '#9a9aa8'); R(c, 8, 3, 1, 2, '#a07848'); R(c, 9, 1, 2, 2, '#f2a03a'); P(c, 10, 0, '#fff2b0'); },
        junk() { R(c, 4, 5, 8, 9, '#8a8a7a'); R(c, 4, 5, 8, 2, '#a8a898'); R(c, 6, 8, 4, 3, '#6a6a5a'); R(c, 4, 13, 8, 1, '#5a5a4a'); P(c, 10, 6, '#c8c8b8'); },
      };
      (ICON[k] || ICON.rock)();
    });
    I_CACHE[key] = spr;
    return spr;
  };
  SE.drawIcon = function (c, id, x, y, scale) { SE.blit(c, SE.iconSprite(id), x, y, scale || 1); };
})(window.SE);
