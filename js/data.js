'use strict';
// Dados do jogo: itens, culturas, receitas, moradores, notícias e metas.
(function (SE) {
  SE.WEEKDAYS = ['Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado', 'Domingo'];
  SE.WEEKDAYS_SHORT = ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
  SE.EPOCA_DAYS = 28;
  SE.EPOCAS = {
    aguas: { name: 'Época das Águas', short: 'Águas' },
    seca: { name: 'Época da Seca', short: 'Seca' },
  };
  SE.WEATHER = {
    sol: { name: 'Sol' },
    nublado: { name: 'Nublado' },
    chuva: { name: 'Chuva' },
    tempestade: { name: 'Temporal' },
  };

  // ---------------------------------------------------------------- Itens
  // cat: tool | seed | crop | animal | forage | artisan | feed | res | place
  SE.ITEMS = {
    enxada: { name: 'Enxada', cat: 'tool', icon: ['hoe'], desc: 'Ara a terra para o plantio. Gasta 2 de energia.' },
    regador: { name: 'Regador', cat: 'tool', icon: ['can'], desc: 'Molha a terra arada. Encha no poço ou no rio.' },
    foice: { name: 'Foice', cat: 'tool', icon: ['sickle'], desc: 'Roça o mato. Às vezes rende capim para os bichos.' },
    machado: { name: 'Machado', cat: 'tool', icon: ['axe'], desc: 'Arranca tocos velhos e rende madeira.' },
    picareta: { name: 'Picareta', cat: 'tool', icon: ['pick'], desc: 'Quebra pedras e minério. Também recolhe objetos colocados.' },
    vara: { name: 'Vara de pescar', cat: 'tool', icon: ['rod'], desc: 'Segure o botão para arremessar na água. Quando o peixe morder, aperte de novo!' },
    facao: { name: 'Facão velho', cat: 'weapon', icon: ['blade'], desc: 'Arma para se defender na gruta. Dano 6 a 10.' },

    sem_milho: { name: 'Semente de milho', cat: 'seed', crop: 'milho', price: 10, icon: ['seed', '#f2c94c'] },
    sem_feijao: { name: 'Semente de feijão', cat: 'seed', crop: 'feijao', price: 8, icon: ['seed', '#8a4b2a'] },
    sem_abobora: { name: 'Semente de abóbora', cat: 'seed', crop: 'abobora', price: 20, icon: ['seed', '#e8892a'] },
    maniva: { name: 'Maniva de mandioca', cat: 'seed', crop: 'mandioca', price: 15, icon: ['seed', '#c9a27a'] },
    muda_cana: { name: 'Muda de cana', cat: 'seed', crop: 'cana', price: 25, icon: ['seed', '#9bc45a'] },
    muda_cafe: { name: 'Muda de café', cat: 'seed', crop: 'cafe', price: 60, icon: ['seed', '#c0392b'] },
    sem_maracuja: { name: 'Semente de maracujá', cat: 'seed', crop: 'maracuja', price: 35, icon: ['seed', '#e9cf3f'] },
    muda_laranja: { name: 'Muda de laranja', cat: 'seed', crop: 'laranja', price: 70, icon: ['seed', '#f39a1e'] },

    milho: { name: 'Milho verde', cat: 'crop', price: 28, icon: ['cob'], eat: 8, desc: 'Espiga fresquinha. Vira pamonha, curau ou fubá.' },
    feijao: { name: 'Feijão', cat: 'crop', price: 20, icon: ['beans'], desc: 'Feijão carioquinha, base de todo prato feito.' },
    abobora: { name: 'Abóbora', cat: 'crop', price: 70, icon: ['pumpkin'], desc: 'Abóbora de pescoço. Dá um doce famoso.' },
    mandioca: { name: 'Mandioca', cat: 'crop', price: 45, icon: ['root'], desc: 'Na casa de farinha vira farinha ou polvilho.' },
    cana: { name: 'Cana-de-açúcar', cat: 'crop', price: 22, icon: ['cane'], desc: 'No engenho vira rapadura, melado e cachaça.' },
    cafe: { name: 'Café em coco', cat: 'crop', price: 30, icon: ['berries', '#c0392b'], desc: 'Grão maduro. Seque e torre no terreiro.' },
    maracuja: { name: 'Maracujá', cat: 'crop', price: 30, icon: ['fruit', '#e9cf3f'], eat: 6, desc: 'Azedinho e perfumado.' },
    laranja: { name: 'Laranja', cat: 'crop', price: 18, icon: ['fruit', '#f39a1e'], eat: 8, desc: 'Laranja-pera, doce que só.' },

    ovo: { name: 'Ovo caipira', cat: 'animal', price: 15, icon: ['egg'], desc: 'Gema bem laranjinha.' },
    leite: { name: 'Leite', cat: 'animal', price: 35, icon: ['bottle', '#ffffff'], eat: 10, desc: 'Leite tirado na hora.' },
    leite_cabra: { name: 'Leite de cabra', cat: 'animal', price: 45, icon: ['bottle', '#f3ecd2'], desc: 'Leve e nutritivo.' },
    mel: { name: 'Mel', cat: 'animal', price: 90, icon: ['jar', '#f0b020', '#7a4a1a'], eat: 20, desc: 'Mel de florada silvestre.' },

    pequi: { name: 'Pequi', cat: 'forage', price: 25, icon: ['fruit', '#c8d04a'], desc: 'Cuidado com os espinhos! Cheiro forte do cerrado.' },
    jabuticaba: { name: 'Jabuticaba', cat: 'forage', price: 20, icon: ['cluster', '#3a1a48'], eat: 6, desc: 'Nasce grudada no tronco.' },
    araticum: { name: 'Araticum', cat: 'forage', price: 30, icon: ['fruit', '#8fae4a'], eat: 10, desc: 'Fruta do mato, doce e cremosa.' },

    queijo: { name: 'Queijo minas', cat: 'artisan', price: 130, icon: ['wheel', '#f3e3a0'], eat: 30, desc: 'Curado no capricho.' },
    requeijao: { name: 'Requeijão', cat: 'artisan', price: 70, icon: ['pot', '#f8f4ea'], eat: 20, desc: 'Cremoso, de colher.' },
    doce_leite: { name: 'Doce de leite', cat: 'artisan', price: 110, icon: ['jar', '#b8743a', '#e8dcc0'], eat: 25, desc: 'Mexido no tacho de cobre.' },
    pamonha: { name: 'Pamonha', cat: 'artisan', price: 40, icon: ['husk'], eat: 30, desc: 'Quentinha, enrolada na palha.' },
    curau: { name: 'Curau', cat: 'artisan', price: 50, icon: ['bowl', '#f3d77a'], eat: 30, desc: 'Com canela por cima.' },
    doce_abobora: { name: 'Doce de abóbora', cat: 'artisan', price: 105, icon: ['jar', '#e8892a', '#e8dcc0'], eat: 25, desc: 'Em pedaço, cristalizado.' },
    geleia_maracuja: { name: 'Geleia de maracujá', cat: 'artisan', price: 120, icon: ['jar', '#f2c830', '#8a5a2a'], desc: 'Com as sementinhas.' },
    doce_jabuticaba: { name: 'Geleia de jabuticaba', cat: 'artisan', price: 95, icon: ['jar', '#5a1a4a', '#e8dcc0'], desc: 'Roxinha e brilhante.' },
    queijo_cabra: { name: 'Queijo de cabra', cat: 'artisan', price: 170, icon: ['wheel', '#fbf6e6'], eat: 30, desc: 'Fino, de sabor marcante.' },
    pao_queijo: { name: 'Pão de queijo', cat: 'artisan', price: 60, icon: ['bun'], eat: 25, desc: 'Ninguém resiste.' },
    fuba: { name: 'Fubá', cat: 'artisan', price: 75, icon: ['bag', '#f2d26a', '#c0392b'], desc: 'Moído na pedra.' },
    farinha: { name: 'Farinha de mandioca', cat: 'artisan', price: 115, icon: ['bag', '#efe3c4', '#2e86c1'], desc: 'Torradinha, de casa de farinha.' },
    polvilho: { name: 'Polvilho', cat: 'artisan', price: 110, icon: ['bag', '#ffffff', '#27ae60'], desc: 'Base do pão de queijo.' },
    rapadura: { name: 'Rapadura', cat: 'artisan', price: 95, icon: ['brick'], eat: 20, desc: 'Doce, dura e cheia de história.' },
    melado: { name: 'Melado', cat: 'artisan', price: 65, icon: ['bottle', '#7a3e12'], desc: 'Grosso, de escorrer devagar.' },
    cachaca: { name: 'Cachaça de alambique', cat: 'artisan', price: 210, icon: ['bottle', '#e8dca0'], desc: 'Envelhecida em barril de amburana.' },
    cafe_torrado: { name: 'Café torrado', cat: 'artisan', price: 130, icon: ['bag', '#5a3a22', '#e8dcc0'], desc: 'Seco no terreiro, torrado na hora.' },

    capim: { name: 'Capim', cat: 'feed', price: 2, icon: ['grass'], desc: 'Coloque no cocho do curral para alimentar os bichos.' },
    racao: { name: 'Ração', cat: 'feed', price: 8, icon: ['sack', '#c49a5a'], desc: 'Alimenta um animal por um dia. Use no cocho.' },
    madeira: { name: 'Madeira', cat: 'res', price: 3, icon: ['log'], desc: 'Lenha boa para o fogão.' },
    pedra: { name: 'Pedra', cat: 'res', price: 2, icon: ['rock'], desc: 'Pedra do terreno.' },
    colmeia: { name: 'Colmeia', cat: 'place', obj: 'h', price: 350, icon: ['hive'], desc: 'Coloque no sítio (de frente para a grama). As abelhas fazem mel sozinhas.' },
    bau: { name: 'Baú', cat: 'place', obj: 'C', price: 0, icon: ['chest'], desc: 'Guarda 36 itens. Coloque no sítio. Recolha com machado ou picareta (vazio).' },
    espantalho: { name: 'Espantalho', cat: 'place', obj: 'E', price: 0, icon: ['scare'], desc: 'Protege as plantas num raio de 8 passos contra os corvos.' },
    irrigador: { name: 'Irrigador', cat: 'place', obj: 'R', price: 0, icon: ['sprink'], desc: 'Toda manhã rega os 4 canteiros vizinhos (cima, baixo e lados).' },
    fornalha: { name: 'Fornalha', cat: 'place', obj: 'O', price: 0, icon: ['furnace'], desc: 'Derrete 5 minérios + 1 carvão numa barra de metal.' },
    adubo: { name: 'Adubo', cat: 'fert', price: 10, icon: ['fert'], desc: 'Use na terra arada: a planta cresce 25% mais rápido.' },
    isca: { name: 'Isca', cat: 'bait', price: 5, icon: ['bait'], desc: 'Com isca na mochila, o peixe morde em metade do tempo.' },
    bomba: { name: 'Bomba de carvão', cat: 'bomb', price: 50, icon: ['bomb'], desc: 'Explode as pedras em volta. Afaste-se depois de acender!' },

    lambari: { name: 'Lambari', cat: 'fish', price: 30, icon: ['fish', '#c8ccd4', '#e8a02a'], eat: 6, desc: 'Peixinho prateado do rio. Frito é uma delícia.' },
    tilapia: { name: 'Tilápia', cat: 'fish', price: 60, icon: ['fish', '#8a9a8a', '#5a6a5a'], eat: 10, desc: 'Peixe de água calma, carne branca.' },
    piau: { name: 'Piau', cat: 'fish', price: 75, icon: ['fish', '#c8b07a', '#2a2a2a'], desc: 'Listrado, aparece nas águas.' },
    bagre: { name: 'Bagre', cat: 'fish', price: 90, icon: ['fish', '#6a5a4a', '#4a3a2a'], desc: 'Bigodudo, gosta da noite.' },
    traira: { name: 'Traíra', cat: 'fish', price: 110, icon: ['fish', '#5a6a3a', '#3a4a2a'], desc: 'Dentuça e brava. Dá trabalho na seca.' },
    pacu: { name: 'Pacu', cat: 'fish', price: 130, icon: ['fish', '#a8a8b8', '#e8582a'], desc: 'Redondo e forte, come fruta que cai no rio.' },
    dourado: { name: 'Dourado', cat: 'fish', price: 300, icon: ['fish', '#f2b030', '#c0392b'], desc: 'O rei do rio! Briga muito e só aparece de manhã nas águas.' },
    lata: { name: 'Lata velha', cat: 'res', price: 1, icon: ['junk'], desc: 'Alguém jogou isso no rio. Que feio!' },

    carvao: { name: 'Carvão', cat: 'res', price: 15, icon: ['coal'], desc: 'Combustível da fornalha.' },
    minerio_cobre: { name: 'Minério de cobre', cat: 'res', price: 5, icon: ['ore', '#d0783a'], desc: 'Derreta na fornalha (5 + 1 carvão).' },
    minerio_ferro: { name: 'Minério de ferro', cat: 'res', price: 10, icon: ['ore', '#dfe6ee'], desc: 'Aparece do andar 10 da gruta para baixo.' },
    minerio_ouro: { name: 'Minério de ouro', cat: 'res', price: 25, icon: ['ore', '#f2c94c'], desc: 'Só no fundo da gruta, do andar 20 em diante.' },
    barra_cobre: { name: 'Barra de cobre', cat: 'res', price: 60, icon: ['bar', '#d0783a'], desc: 'Para melhorar ferramentas e fazer irrigadores.' },
    barra_ferro: { name: 'Barra de ferro', cat: 'res', price: 120, icon: ['bar', '#dfe6ee'], desc: 'Metal forte para ferramentas melhores.' },
    barra_ouro: { name: 'Barra de ouro', cat: 'res', price: 250, icon: ['bar', '#f2c94c'], desc: 'Brilha que só! Para as melhores ferramentas.' },
    quartzo: { name: 'Quartzo', cat: 'gem', price: 25, icon: ['gem', '#e8eef8'], desc: 'Cristal transparente das pedras da gruta.' },
    ametista: { name: 'Ametista', cat: 'gem', price: 100, icon: ['gem', '#a060d0'], desc: 'Pedra roxa e rara, do meio da gruta.' },
    gosma: { name: 'Gosma', cat: 'res', price: 5, icon: ['slime'], desc: 'Meleca de lesma da gruta. Vira isca.' },
    peixe_frito: { name: 'Peixe frito', cat: 'artisan', price: 150, icon: ['fish', '#d9a24c', '#a0602a'], eat: 45, desc: 'Empanado na farinha, sequinho.' },
  };

  // ---------------------------------------------------------------- Culturas
  SE.CROPS = {
    milho: { name: 'Milho', item: 'milho', epocas: ['aguas'], days: 6, regrow: 0, yield: [1, 2], color: '#f2c94c' },
    feijao: { name: 'Feijão', item: 'feijao', epocas: ['aguas', 'seca'], days: 5, regrow: 0, yield: [2, 3], color: '#8a4b2a' },
    abobora: { name: 'Abóbora', item: 'abobora', epocas: ['aguas'], days: 8, regrow: 0, yield: [1, 1], color: '#e8892a' },
    mandioca: { name: 'Mandioca', item: 'mandioca', epocas: ['aguas', 'seca'], days: 9, regrow: 0, yield: [1, 2], color: '#c9a27a' },
    cana: { name: 'Cana', item: 'cana', epocas: ['aguas', 'seca'], days: 9, regrow: 5, yield: [2, 3], color: '#9bc45a' },
    cafe: { name: 'Café', item: 'cafe', epocas: ['aguas'], days: 12, regrow: 6, yield: [3, 4], color: '#c0392b', perene: true },
    maracuja: { name: 'Maracujá', item: 'maracuja', epocas: ['aguas'], days: 8, regrow: 4, yield: [2, 3], color: '#e9cf3f' },
    laranja: { name: 'Laranja', item: 'laranja', epocas: ['aguas', 'seca'], days: 12, regrow: 5, yield: [3, 4], color: '#f39a1e', perene: true },
  };
  Object.keys(SE.ITEMS).forEach((id) => {
    const it = SE.ITEMS[id];
    if (it.cat === 'seed') {
      const c = SE.CROPS[it.crop];
      const ep = c.epocas.map((e) => SE.EPOCAS[e].short).join(' e ');
      it.desc = 'Plante na terra arada. Época: ' + ep + '. Colhe em ' + c.days + ' dias' +
        (c.regrow ? ', e volta a produzir a cada ' + c.regrow + '.' : '.') + (c.perene ? ' Planta perene.' : '');
    }
  });

  // ---------------------------------------------------------------- Beneficiamento
  SE.STATIONS = {
    fogao: { name: 'Fogão a lenha', restore: 0, desc: 'Queijos, doces, pamonha e quitandas.' },
    engenho: { name: 'Engenho de cana', restore: 800, desc: 'Rapadura, melado e cachaça de alambique.' },
    casa_farinha: { name: 'Casa de farinha', restore: 600, desc: 'Farinha, polvilho e fubá moído na pedra.' },
    terreiro: { name: 'Terreiro de café', restore: 500, desc: 'Secagem, torra e moagem do café.' },
  };
  SE.STATION_SLOTS = 3;
  SE.RECIPES = {
    queijo: { st: 'fogao', inp: { leite: 2 }, out: 'queijo', n: 1, days: 1 },
    requeijao: { st: 'fogao', inp: { leite: 1 }, out: 'requeijao', n: 1, days: 1 },
    doce_leite: { st: 'fogao', inp: { leite: 2, melado: 1 }, out: 'doce_leite', n: 2, days: 1 },
    pamonha: { st: 'fogao', inp: { milho: 2 }, out: 'pamonha', n: 2, days: 1 },
    curau: { st: 'fogao', inp: { milho: 2, leite: 1 }, out: 'curau', n: 2, days: 1 },
    doce_abobora: { st: 'fogao', inp: { abobora: 1 }, out: 'doce_abobora', n: 1, days: 1 },
    geleia_maracuja: { st: 'fogao', inp: { maracuja: 3 }, out: 'geleia_maracuja', n: 1, days: 1 },
    doce_jabuticaba: { st: 'fogao', inp: { jabuticaba: 3 }, out: 'doce_jabuticaba', n: 1, days: 1 },
    queijo_cabra: { st: 'fogao', inp: { leite_cabra: 2 }, out: 'queijo_cabra', n: 1, days: 2 },
    pao_queijo: { st: 'fogao', inp: { polvilho: 1, queijo: 1, ovo: 2 }, out: 'pao_queijo', n: 6, days: 1 },
    rapadura: { st: 'engenho', inp: { cana: 3 }, out: 'rapadura', n: 1, days: 1 },
    melado: { st: 'engenho', inp: { cana: 2 }, out: 'melado', n: 1, days: 1 },
    cachaca: { st: 'engenho', inp: { cana: 5 }, out: 'cachaca', n: 1, days: 3 },
    farinha: { st: 'casa_farinha', inp: { mandioca: 2 }, out: 'farinha', n: 1, days: 1 },
    polvilho: { st: 'casa_farinha', inp: { mandioca: 2 }, out: 'polvilho', n: 1, days: 2 },
    fuba: { st: 'casa_farinha', inp: { milho: 2 }, out: 'fuba', n: 1, days: 1 },
    cafe_torrado: { st: 'terreiro', inp: { cafe: 3 }, out: 'cafe_torrado', n: 1, days: 2 },
    peixe_frito: { st: 'fogao', inp: { tilapia: 1, farinha: 1 }, out: 'peixe_frito', n: 2, days: 1 },
  };

  // ---------------------------------------------------------------- Fornalha (minutos do jogo)
  SE.SMELT = {
    minerio_cobre: { out: 'barra_cobre', n: 5, m: 30 },
    minerio_ferro: { out: 'barra_ferro', n: 5, m: 120 },
    minerio_ouro: { out: 'barra_ouro', n: 5, m: 300 },
  };

  // ---------------------------------------------------------------- Criação (menu do jogo)
  // req: [habilidade, nível] ou 'flag'
  SE.CRAFT = [
    { id: 'bau', inp: { madeira: 50 }, n: 1, req: null },
    { id: 'espantalho', inp: { madeira: 20, carvao: 1, capim: 10 }, n: 1, req: ['agricultura', 1] },
    { id: 'adubo', inp: { capim: 5 }, n: 3, req: ['agricultura', 2] },
    { id: 'irrigador', inp: { barra_cobre: 1, barra_ferro: 1 }, n: 1, req: ['agricultura', 3] },
    { id: 'fornalha', inp: { minerio_cobre: 20, pedra: 25 }, n: 1, req: 'fornalha' },
    { id: 'bomba', inp: { carvao: 1, minerio_cobre: 4 }, n: 1, req: ['mineracao', 1] },
    { id: 'isca', inp: { gosma: 1 }, n: 5, req: ['pesca', 2] },
  ];

  // ---------------------------------------------------------------- Habilidades
  SE.XP_LV = [100, 380, 770, 1300, 2150, 3300, 4800, 6900, 10000, 15000];
  SE.SKILLS = [
    { id: 'agricultura', name: 'Agricultura', icon: 'enxada', perk: 'Enxada e regador gastam menos energia. Libera espantalho, adubo e irrigador.' },
    { id: 'mineracao', name: 'Mineração', icon: 'picareta', perk: 'Picareta gasta menos energia e cada nível dá mais chance de minério extra.' },
    { id: 'coleta', name: 'Coleta', icon: 'pequi', perk: 'Machado gasta menos energia e frutas do mato podem vir em dobro.' },
    { id: 'pesca', name: 'Pesca', icon: 'lambari', perk: 'A barra verde da pescaria fica maior. No nível 2 libera a isca.' },
    { id: 'combate', name: 'Combate', icon: 'facao', perk: '+5 de vida máxima e mais dano com o facão a cada nível.' },
  ];

  // ---------------------------------------------------------------- Peixes (rio do sítio)
  // h: [hora inicial, hora final); diff 0-100; w: peso do sorteio
  SE.FISH = {
    lambari: { ep: ['aguas', 'seca'], h: [6, 26], diff: 15, w: 30, mv: 'calmo' },
    tilapia: { ep: ['aguas', 'seca'], h: [6, 20], diff: 30, w: 24, mv: 'calmo' },
    piau: { ep: ['aguas'], h: [6, 19], diff: 40, w: 14, mv: 'misto' },
    bagre: { ep: ['aguas', 'seca'], h: [18, 26], diff: 45, w: 16, mv: 'afunda' },
    traira: { ep: ['seca'], h: [6, 26], diff: 62, w: 12, mv: 'arisco' },
    pacu: { ep: ['aguas'], h: [10, 18], diff: 55, w: 10, mv: 'misto' },
    dourado: { ep: ['aguas'], h: [6, 12], diff: 85, w: 3, mv: 'arisco' },
  };

  // ---------------------------------------------------------------- Ferraria do Seu Bastião
  SE.UPGRADES = [
    { lvl: 1, name: 'de cobre', price: 2000, bar: 'barra_cobre' },
    { lvl: 2, name: 'de ferro', price: 5000, bar: 'barra_ferro' },
    { lvl: 3, name: 'de ouro', price: 10000, bar: 'barra_ouro' },
  ];
  SE.UPGRADABLE = ['enxada', 'regador', 'machado', 'picareta'];
  SE.FERRARIA_SHOP = [['carvao', 60], ['minerio_cobre', 30], ['minerio_ferro', 60], ['minerio_ouro', 120]];

  // ---------------------------------------------------------------- Animais
  SE.ANIMALS = {
    galinha: { name: 'Galinha', price: 200, product: 'ovo', names: ['Pintadinha', 'Cocota', 'Carijó', 'Penosa', 'Ruivinha', 'Zezé'] },
    cabra: { name: 'Cabra', price: 700, product: 'leite_cabra', names: ['Filó', 'Chiquinha', 'Barbicha', 'Nanica', 'Dondoca'] },
    vaca: { name: 'Vaca', price: 1200, product: 'leite', names: ['Mimosa', 'Estrela', 'Malhada', 'Boneca', 'Jurema', 'Fumaça'] },
  };
  SE.CURRAL_MAX = 10;

  // ---------------------------------------------------------------- Obras (Armazém)
  SE.OBRAS = [
    { id: 'engenho', name: 'Restaurar o engenho', price: 800, desc: 'Volta a moer cana: rapadura, melado e cachaça.',
      done: (s) => s.stations.engenho.ok, apply: (s) => { s.stations.engenho.ok = true; } },
    { id: 'casa_farinha', name: 'Restaurar a casa de farinha', price: 600, desc: 'Farinha, polvilho e fubá.',
      done: (s) => s.stations.casa_farinha.ok, apply: (s) => { s.stations.casa_farinha.ok = true; } },
    { id: 'terreiro', name: 'Refazer o terreiro de café', price: 500, desc: 'Seca e torra o café colhido.',
      done: (s) => s.stations.terreiro.ok, apply: (s) => { s.stations.terreiro.ok = true; } },
    { id: 'casa', name: 'Reformar a casa de taipa', price: 3000, desc: 'Telhado novo e cama boa: +30 de energia máxima.',
      done: (s) => !!s.flags.casaReformada, apply: (s) => { s.flags.casaReformada = true; s.maxEnergy = 130; } },
  ];

  // ---------------------------------------------------------------- Projetos do vilarejo (mural)
  SE.PROJECTS = [
    { id: 'praca', name: 'Reforma da praça', cost: 2500, bonus: 3,
      desc: 'Bancos novos e coreto pintado. Mais gente passeando na feira (+3 clientes).' },
    { id: 'escola', name: 'Reabrir a escola', cost: 8000, bonus: 5,
      desc: 'A Professora Marta volta a dar aula e famílias voltam para a serra (+5 clientes).' },
    { id: 'estacao', name: 'Reabrir a estação de trem', cost: 20000, bonus: 8,
      desc: 'O trem volta a parar no vilarejo e traz compradores da cidade (+8 clientes).' },
  ];

  // ---------------------------------------------------------------- Comida da pensão e do bar
  SE.FOOD = {
    pensao: [
      { name: 'Prato feito (arroz, feijão, ovo e couve)', price: 30, energy: 50 },
      { name: 'Sopa de mandioca com carne', price: 22, energy: 35 },
      { name: 'Café com bolo de fubá', price: 12, energy: 20 },
    ],
    bar: [
      { name: 'Café coado no coador de pano', price: 5, energy: 12 },
      { name: 'Pastel de queijo', price: 10, energy: 18 },
      { name: 'Caldo de cana com limão', price: 8, energy: 15 },
    ],
  };

  // ---------------------------------------------------------------- Visual dos personagens
  SE.LOOKS = [
    { skin: '#e0ac7e', hair: '#3b2416', shirt: '#c0392b', pants: '#2f4a7a', hat: 'palha' },
    { skin: '#8d5a3b', hair: '#1e130c', shirt: '#2e86c1', pants: '#4a3b2a', hat: 'palha', long: true },
    { skin: '#c68642', hair: '#5a3a1a', shirt: '#27ae60', pants: '#3a3a52', hat: 'bone', hatColor: '#e67e22' },
    { skin: '#f1c9a5', hair: '#a0522d', shirt: '#8e44ad', pants: '#2f4a7a', long: true },
    { skin: '#5c3a24', hair: '#120b08', shirt: '#e67e22', pants: '#3a3a52', hat: 'palha' },
  ];

  // ---------------------------------------------------------------- Moradores
  // sched: [hora, [x, y] | null] — posição no mapa do vilarejo a partir daquela hora.
  SE.NPCS = {
    jorge: {
      name: 'Seu Jorge', role: 'Dono do armazém',
      look: { skin: '#c98d5e', hair: '#d9d9d9', shirt: '#2f6db5', pants: '#4a3b2a', mustache: true, apron: '#e8dcc0' },
      loves: ['cafe_torrado', 'cachaca'], likes: ['rapadura', 'pamonha', 'queijo', 'pao_queijo'], dislikes: ['pedra', 'capim'],
      sched: [[7, [6, 12]], [18, [16, 12]], [21, null]],
      lines: [
        ['Opa! Você é da família do Benedito? Tem a cara dele! Que bom ter você na serra.', 'O armazém compra tudo que você trouxer. Pago pouco, mas pago na hora!', 'Semente boa eu tenho. Só não planta milho na seca, hein.'],
        ['Seu avô vendia o melhor café da região aqui no balcão.', 'Na feira de sábado você ganha mais que aqui. Mas aqui é garantido.', 'Esse vilarejo já teve até cinema, sabia?'],
        ['Você trouxe vida nova pra serra. O Benedito estaria orgulhoso.', 'Quando a estação reabrir, vou encomendar mercadoria da capital de novo!'],
      ],
    },
    bento: {
      name: 'Padre Bento', role: 'Pároco e violeiro',
      look: { skin: '#e8b98a', hair: '#7a7a7a', shirt: '#22222a', pants: '#22222a', collar: true },
      loves: ['mel', 'doce_leite'], likes: ['queijo', 'laranja', 'curau'], dislikes: ['cachaca'],
      sched: [[6, [20, 8]], [12, [22, 11]], [17, [20, 8]], [21, null]],
      lines: [
        ['Que Deus abençoe sua chegada! Eu sou o Padre Bento.', 'À tardinha eu toco viola na escadaria. Aparece!', 'A quermesse já foi a maior festa da região.'],
        ['A viola caipira tem dez cordas, em pares. Como a gente: ninguém toca sozinho.', 'Rezo toda noite pra chuva vir na hora certa.'],
        ['Vejo mais gente na missa desde que você chegou. Obrigado, de coração.', 'Ano que vem quero uma Festa Junina com quadrilha de verdade!'],
      ],
    },
    lucia: {
      name: 'Dra. Lúcia', role: 'Veterinária',
      look: { skin: '#6b4430', hair: '#1a110b', shirt: '#f4f4f4', pants: '#2f4a7a', long: true },
      loves: ['queijo_cabra', 'geleia_maracuja'], likes: ['maracuja', 'leite_cabra', 'araticum'], dislikes: ['pedra'],
      sched: [[8, [25, 12]], [13, [30, 11]], [15, [11, 15]], [20, null]],
      lines: [
        ['Oi! Sou a Lúcia, veterinária. Vim da capital trabalhar aqui.', 'Bicho bem tratado produz mais. Faça carinho todo dia!', 'Na seca o pasto some: deixe o cocho do curral sempre cheio.'],
        ['Troquei o trânsito da capital pelo canto do sabiá. Não me arrependo.', 'Vaca com muita afeição dá leite em dobro, sabia?'],
        ['Você virou referência em criação por aqui. Estou impressionada!'],
      ],
    },
    cida: {
      name: 'Dona Cida', role: 'Dona da pensão',
      look: { skin: '#d9a37a', hair: '#4a2e1c', shirt: '#d35d8a', pants: '#3a2a3a', dress: '#d35d8a', apron: '#ffffff', long: true },
      loves: ['fuba', 'abobora'], likes: ['feijao', 'mandioca', 'ovo', 'farinha'], dislikes: ['pedra', 'madeira'],
      sched: [[6, [29, 12]], [21, null]],
      lines: [
        ['Entra, meu bem! A pensão da Cida tem comida quentinha o dia todo.', 'Prato feito aqui é que nem de mãe: renova a energia.', 'Se tiver fubá bom, eu compro na feira.'],
        ['Meus filhos foram todos pra cidade... a pensão anda tão vazia.', 'Seu avô almoçava aqui toda sexta. Pedia sempre ovo frito.'],
        ['Você é de casa agora. Tem sempre um prato te esperando.'],
      ],
    },
    ze: {
      name: 'Zé do Bar', role: 'Dono do bar',
      look: { skin: '#a8714a', hair: '#2a1a12', shirt: '#e2c044', pants: '#3a3a52', hat: 'bone', hatColor: '#c0392b', beard: true },
      loves: ['cachaca', 'pequi'], likes: ['pao_queijo', 'milho', 'curau'], dislikes: ['laranja'],
      sched: [[10, [35, 12]], [26, null]],
      lines: [
        ['E aí, chegou gente nova! Zé, do bar. Café é cinco reais.', 'Domingo tem truco e rádio no talo. Futebol, claro.', 'Arruma uma cachaça de alambique boa que eu compro todas.'],
        ['Contam que tem uma gruta lá no alto da serra. Ninguém mais sobe lá.', 'O trem passava aqui às quatro da tarde. Dava pra acertar o relógio!'],
        ['Tu é gente boa demais. A primeira do dia é por minha conta!'],
      ],
    },
    marta: {
      name: 'Professora Marta', role: 'Professora',
      look: { skin: '#efc39b', hair: '#6b4a2a', shirt: '#4a8a5a', pants: '#3a3a52', dress: '#4a8a5a', long: true, glasses: true },
      loves: ['laranja', 'doce_jabuticaba'], likes: ['jabuticaba', 'mel', 'pamonha'], dislikes: ['pedra', 'cachaca'],
      sched: [[8, [7, 22]], [12, [23, 9]], [17, [18, 21]], [20, null]],
      lines: [
        ['Muito prazer, sou a Marta. Dei aula trinta anos naquela escola.', 'A escola fechou quando sobraram só quatro alunos.', 'Toda manhã eu passo lá pra varrer a porta. Mania de professora.'],
        ['Se a escola reabrir, as famílias voltam. Eu tenho certeza.', 'Ensinava as crianças a plantar na horta da escola. Bons tempos.'],
        ['Você me devolveu a esperança. E olha que o sítio tem esse nome à toa não!'],
      ],
    },
    tiao: {
      name: 'Seu Tião', role: 'Mestre rapadureiro',
      look: { skin: '#7a4a30', hair: '#e8e8e8', shirt: '#b5824a', pants: '#4a3b2a', hat: 'palha', mustache: true },
      loves: ['rapadura', 'pamonha'], likes: ['cana', 'cafe_torrado', 'melado'], dislikes: ['pedra'],
      sched: [[7, [17, 21]], [15, [24, 12]], [19, null]],
      lines: [
        ['Hmm... família do Benedito. Ele moía cana comigo no engenho, sabia?', 'Rapadura boa é paciência e fogo certo.', 'A receita da Rapadura da Serra a gente não conta pra qualquer um.'],
        ['Você tem mão boa pra terra. Igual seu avô.', 'Quando a cana dá o ponto, o tacho canta. É assim que se sabe.'],
        ['Tá na hora de alguém guardar a receita depois de nós...'],
      ],
    },
    nena: {
      name: 'Dona Nena', role: 'Doceira',
      look: { skin: '#8a5a3c', hair: '#dcdcdc', shirt: '#7a9ad8', pants: '#3a3a52', dress: '#7a9ad8', scarf: '#e86a5a' },
      loves: ['curau', 'doce_abobora'], likes: ['milho', 'leite', 'abobora'], dislikes: ['capim'],
      sched: [[7, [19, 21]], [10, [15, 12]], [16, [19, 21]], [19, null]],
      lines: [
        ['Ai, que alegria ver o sítio do Benedito com gente de novo!', 'O Tião é rabugento, mas tem coração de rapadura: duro por fora, doce por dentro.', 'Gosto muito de um curau com canela.'],
        ['Aprendi a fazer doce com a minha avó, no fogão a lenha.', 'Traz uma abóbora que eu te ensino o ponto do doce.'],
        ['Você é praticamente da família. Vem tomar um café qualquer dia.'],
      ],
    },
  };

  SE.NPCS.bastiao = {
    name: 'Seu Bastião', role: 'Ferreiro',
    look: { skin: '#6b4430', hair: '#2a1a12', shirt: '#7a7a82', pants: '#3a3a42', apron: '#6a4a2a', beard: true },
    loves: ['barra_ouro', 'ametista'], likes: ['cafe_torrado', 'barra_ferro', 'quartzo', 'pao_queijo'], dislikes: ['capim', 'lata'],
    sched: [[8, [12, 12]], [19, [34, 12]], [23, null]],
    lines: [
      ['Bastião, ferreiro. Se trouxer barra de metal, eu deixo sua ferramenta tinindo.', 'A gruta lá no alto do seu sítio tem minério bom. Cobre por cima, ferro e ouro lá no fundo.', 'Ferro se bate quente. Gente também: tem que acolher enquanto tá chegando.'],
      ['Seu avô me trazia as enxadas pra amolar todo começo de águas.', 'Leva um facão quando descer a gruta. As lesmas não são de brincadeira.'],
      ['Nunca vi alguém tão dedicado. Vou caprichar ainda mais nas suas ferramentas.'],
    ],
  };

  // ---------------------------------------------------------------- Jornal
  SE.NEWS = [
    { title: 'Festival gastronômico na capital', text: 'Chefs da capital estão atrás de queijo artesanal da serra. Preço do queijo em alta!', eff: { queijo: 1.4, queijo_cabra: 1.3, requeijao: 1.2 } },
    { title: 'Safra recorde de milho no estado', text: 'Os silos estão cheios e o milho perdeu valor nesta semana.', eff: { milho: 0.7, fuba: 0.85 } },
    { title: 'Geada no Sul derruba produção de café', text: 'Com a quebra de safra, o café da serra está valorizado.', eff: { cafe: 1.5, cafe_torrado: 1.4 } },
    { title: 'Turistas descobrem a serra', text: 'Ônibus de excursão devem passar pela feira de sábado. Prepare a barraca!', eff: {}, clientes: 6 },
    { title: 'Seca no Nordeste encarece a farinha', text: 'Farinha e polvilho estão em falta nos mercados da região.', eff: { farinha: 1.4, polvilho: 1.3, mandioca: 1.2 } },
    { title: 'Doceiros em alta nas redes', text: 'Vídeo de doce de leite caseiro viraliza e todo mundo quer provar!', eff: { doce_leite: 1.4, doce_abobora: 1.3, rapadura: 1.2 } },
    { title: 'Chuva de granizo em cidades vizinhas', text: 'Hortas da região foram atingidas. Verduras e frutas valorizadas.', eff: { abobora: 1.3, maracuja: 1.3, laranja: 1.3, feijao: 1.2 } },
    { title: 'Concurso de cachaça na capital', text: 'Alambiques da serra são lembrados pelos jurados.', eff: { cachaca: 1.5, melado: 1.2 } },
    { title: 'Promoção no supermercado da cidade', text: 'Ovos e leite em promoção na cidade: o preço por aqui caiu um pouco.', eff: { ovo: 0.8, leite: 0.85 } },
    { title: 'Semana do mel e das abelhas', text: 'Escolas da região fazem campanha pelas abelhas. Mel valorizado!', eff: { mel: 1.4 } },
  ];

  // ---------------------------------------------------------------- Objetivos (guiam o jogador)
  SE.OBJECTIVES = [
    { t: 'Roce 5 moitas de mato com a foice', ok: (s) => s.stats.mato >= 5 },
    { t: 'Are a terra e plante 6 sementes', ok: (s) => s.stats.plantado >= 6 },
    { t: 'Regue as sementes com o regador', ok: (s) => s.stats.regado >= 6 },
    { t: 'Vá ao vilarejo (pela estrada à direita) e fale com o Seu Jorge', ok: (s) => !!(s.npcs.jorge && s.npcs.jorge.met) },
    { t: 'Colha sua primeira safra', ok: (s) => s.stats.colhido >= 1 },
    { t: 'Monte a barraca na feira de sábado, na praça', ok: (s) => s.stats.feiras >= 1 },
    { t: 'Compre um animal no armazém (aba Animais)', ok: (s) => s.animals.length >= 1 },
    { t: 'Faça um produto artesanal no fogão a lenha', ok: (s) => s.stats.artesanal >= 1 },
    { t: 'Pesque um peixe no rio com a vara do Zé (veja o correio)', ok: (s) => (s.stats.peixes || 0) >= 1 },
    { t: 'Desça até o andar 5 da gruta no alto do sítio', ok: (s) => (s.mine && s.mine.deepest >= 5) },
    { t: 'Restaure o engenho de cana (aba Obras do armazém)', ok: (s) => s.stations.engenho.ok },
    { t: 'Melhore uma ferramenta na ferraria do Seu Bastião', ok: (s) => !!(s.tools && Object.keys(s.tools).some((k) => s.tools[k] > 0)) },
    { t: 'Ajude a reformar a praça (mural da praça)', ok: (s) => !!s.projDone.praca },
    { t: 'Ajude a reabrir a escola', ok: (s) => !!s.projDone.escola },
    { t: 'Traga o trem de volta: reabra a estação', ok: (s) => !!s.projDone.estacao },
  ];

  // Itens que podem ser vendidos
  SE.isSellable = (id) => {
    const it = SE.ITEMS[id];
    return it && it.cat !== 'tool' && it.cat !== 'weapon' && it.price > 0;
  };
})(window.SE);
