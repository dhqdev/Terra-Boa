# Sítio Esperança — Documento de Design do Jogo (GDD)

> Versão do documento: 1.0 · acompanha o jogo **v0.1**
> Este é o documento original, reorganizado e aprofundado: pilares, sistemas com números, telas, estilo e um roadmap de versões.

---

## 1. Visão em uma frase

Um jogo de roça em pixel art 16 bits onde você herda o sítio abandonado do avô na serra, aprende a plantar na época certa, transforma a colheita em produto artesanal, negocia na feira de sábado e, devagarzinho, traz um vilarejo inteiro de volta à vida.

## 2. Pilares

| Pilar | O que significa na prática |
|---|---|
| **Terra com ritmo próprio** | Não há quatro estações: há **águas** e **seca**. Cada uma muda o que dá pra plantar, se precisa regar, se o pasto alimenta os bichos e o risco de temporal. |
| **Valor está no capricho** | Produto cru vale pouco. Queijo, rapadura, farinha e café torrado valem 2 a 4 vezes mais. O jogo recompensa quem beneficia. |
| **Comércio com gente** | Vender não é jogar num baú. É escolher onde vender (armazém, caixote, feira), definir preço e conhecer o gosto de cada freguês. |
| **Comunidade que renasce** | Todo dinheiro tem um destino maior: o mural da praça financia praça, escola e estação de trem. O mundo muda visualmente quando você ajuda. |
| **Orgulho caipira, sem caricatura** | Personagens com história e dignidade. Humor gentil. Nada de sotaque escrito "errado" para fazer graça. |

## 3. Público e plataforma

- Jogadores de *Stardew Valley*, *Harvest Moon* e *Story of Seasons* que gostariam de ver o interior do Brasil num jogo assim.
- **Web primeiro**: HTML5 Canvas + JavaScript puro, sem build. Roda abrindo `index.html` ou pelo GitHub Pages, no computador e no celular (controles na tela).
- Sessões curtas (um dia de jogo ≈ 14 minutos) e salvamento automático toda noite.

## 4. História

O jogador chega de ônibus com uma mala e R$ 500. O Sítio Esperança tem mato alto, uma casa de taipa rachada, um curral vazio e um poço que ainda funciona. Na mesa, uma carta do Vô Benedito pede que cuide da terra e ajude a serra a voltar a ser o que era.

O vilarejo está esvaziando: a escola fechou por falta de alunos, o trem parou de parar e a pensão vive vazia.

**Arco principal (v0.1):** reformar a praça → reabrir a escola → reabrir a estação de trem.
**Arcos futuros:** festas tradicionais, a gruta da serra, a história do avô, novos moradores, namoro e casamento.

## 5. Loop de jogo

```
manhã: regar, colher, cuidar dos bichos, recolher produtos
   ↓
tarde: beneficiar (fogão, engenho, casa de farinha, terreiro), roçar, plantar
   ↓
vilarejo: comprar sementes, conversar, dar presentes, comer na pensão
   ↓
noite: guardar no caixote, dormir (salva o jogo, o dia vira)
   ↓
sábado: feira livre com preço definido pelo jogador
   ↓
lucro → obras no sítio → projetos do vilarejo
```

## 6. Tempo e clima

| Item | Valor (v0.1) |
|---|---|
| Duração de um dia | 6h às 2h. 10 minutos do jogo a cada 7 segundos reais |
| Ano | 56 dias: 28 de **águas** + 28 de **seca** |
| Semana | Segunda a domingo. Feira aos sábados, 7h às 13h. Armazém fecha domingo |
| Chuva nas águas | 30% sol, 20% nublado, 38% chuva, 12% temporal |
| Chuva na seca | 78% sol, 16% nublado, 6% chuva |
| Efeito da chuva | Rega toda a terra arada |
| Temporal | 25% de chance de estragar cada planta madura não colhida |
| Seca | Planta anual sem água por 2 dias murcha. Pasto some: bichos dependem do cocho |
| Águas | Plantas crescem 25% mais rápido. Bichos comem no pasto |
| Desmaio | Às 2h, ou ao dormir tarde: acorda com 50% de energia e perde até R$ 100 |

Visual: céu bem azul e grama amarelada na seca; verde intenso e nuvens nas águas. Ipês florescem amarelo na seca.

## 7. Energia

- Máximo 100 (130 com a casa reformada).
- Custos: enxada 2, regador 1, foice 1, machado 3, picareta 3.
- Recupera dormindo, comendo itens (pamonha, queijo, mel...) ou na pensão e no bar.
- Escutar a viola do Padre Bento no fim da tarde dá +10.

## 8. Plantações

| Cultura | Época de plantio | Dias | Rebrota | Colheita | Preço base |
|---|---|---|---|---|---|
| Milho | Águas | 6 | – | 1–2 | R$ 28 |
| Feijão | Águas e seca | 5 | – | 2–3 | R$ 20 |
| Abóbora | Águas | 8 | – | 1 | R$ 70 |
| Mandioca | Águas e seca | 9 | – | 1–2 | R$ 45 |
| Cana | Águas e seca | 9 | a cada 5 | 2–3 | R$ 22 |
| Café (perene) | Águas | 12 | a cada 6 | 3–4 | R$ 30 |
| Maracujá | Águas | 8 | a cada 4 | 2–3 | R$ 30 |
| Laranja (perene) | Águas e seca | 12 | a cada 5 | 3–4 | R$ 18 |

Plantas perenes sobrevivem à troca de época e não murcham na seca (só param de crescer sem água).
Frutas nativas do mato (pequi, jabuticaba, araticum) caem perto das árvores, mais nas águas.

## 9. Animais

| Bicho | Preço | Produto | Observações |
|---|---|---|---|
| Galinha | R$ 200 | Ovo caipira | Afeição alta: 50% de chance de 2 ovos |
| Cabra | R$ 700 | Leite de cabra | Afeição alta: 2 por dia |
| Vaca | R$ 1.200 | Leite | Afeição alta: 2 por dia |
| Colmeia | R$ 350 | Mel | Instalada em qualquer grama. Mel a cada 3 dias (águas) ou 4 (seca) |

- **Afeição** de 0 a 1000 (mostrada como 0–10). Carinho diário +25; dia sem carinho −10; dia com fome −40 e sem produção. A partir de 700 a produção dobra.
- **Cocho**: capim (da foice) ou ração (armazém). Cada bicho come uma porção por dia na seca.
- Curral comporta 10 bichos.

## 10. Beneficiamento

| Estação | Restaurar | Receitas |
|---|---|---|
| Fogão a lenha | já funciona | queijo minas, requeijão, doce de leite, pamonha, curau, doce de abóbora, geleias de maracujá e jabuticaba, queijo de cabra, pão de queijo |
| Engenho de cana | R$ 800 | rapadura, melado, cachaça de alambique (3 dias) |
| Casa de farinha | R$ 600 | farinha de mandioca, polvilho, fubá |
| Terreiro de café | R$ 500 | café torrado (secagem + torra, 2 dias) |

Cada estação tem 3 vagas; o produto fica pronto nos dias seguintes. Cadeias de valor: *polvilho + queijo + ovos → 6 pães de queijo*; *leite + melado → doce de leite*.

A **Rapadura da Serra** é uma receita secreta: com amizade de 5 corações, Seu Tião a ensina e a rapadura passa a valer 50% a mais.

## 11. Comércio

| Canal | Como funciona |
|---|---|
| **Armazém do Seu Jorge** | Compra tudo, sempre, a 60% do preço de mercado. Vende sementes da época, ração, colmeia, bichos e obras. |
| **Caixote do sítio** | O caminhão do Seu Jorge passa de madrugada e paga o preço do armazém. |
| **Feira de sábado** | Até 6 produtos na barraca, preço livre. Cada freguês tem disposição a pagar ≈ preço de mercado × (0,85 a 1,3) × gosto pessoal × amizade. Barato demais: leva mais. Caro demais: vai embora. Cada venda reduz a procura daquele item na mesma feira (incentiva variedade). |
| **Mercado** | Cada produto tem um multiplicador de preço (0,5 a 1,6). Vender muito derruba o preço; ele se recupera 15% ao dia. |
| **Jornal O Eco da Serra** | Toda segunda: uma manchete que mexe nos preços da semana ou traz turistas para a feira. |

Clientes na feira: 16 + bônus dos projetos + bônus da notícia + amizades, proporcional ao horário em que a barraca abre.

## 12. Vilarejo e moradores

| Morador | Papel | Adora |
|---|---|---|
| Seu Jorge | Dono do armazém | café torrado, cachaça |
| Padre Bento | Pároco e violeiro | mel, doce de leite |
| Dra. Lúcia | Veterinária vinda da capital | queijo de cabra, geleia de maracujá |
| Dona Cida | Dona da pensão | fubá, abóbora |
| Zé do Bar | Dono do bar | cachaça, pequi |
| Professora Marta | Professora da escola fechada | laranja, geleia de jabuticaba |
| Seu Tião | Mestre rapadureiro | rapadura, pamonha |
| Dona Nena | Doceira, esposa do Tião | curau, doce de abóbora |

- Amizade de 0 a 1000 (10 corações). Conversa diária +20. Presente: adora +120, gosta +60, comum +30, não gosta −30. Um presente por dia por pessoa.
- Cada morador tem rotina por horário (e vai à praça no sábado de feira).
- Falas mudam com a amizade (3 níveis), a época e o dia da feira.

## 13. Progressão

| Etapa | Custo | Efeito |
|---|---|---|
| Restaurar estações | R$ 500–800 | Novas receitas |
| Regador grande | R$ 600 | 40 de água |
| Reformar a casa | R$ 3.000 | +30 de energia máxima e visual novo |
| Reforma da praça | R$ 2.500 | +3 clientes na feira |
| Reabrir a escola | R$ 8.000 | +5 clientes, escola aberta no mapa |
| Reabrir a estação | R$ 20.000 | +8 clientes, estação aberta, "final" da v0.1 |

Objetivos guiados no canto da tela levam o jogador do primeiro mato roçado até a estação reaberta.

## 14. Telas

| Tela | Status |
|---|---|
| Título (Continuar, Novo jogo, Como jogar) | ✅ v0.1 |
| Criação de personagem (nome + 5 visuais) | ✅ v0.1 |
| Introdução de ônibus | ✅ v0.1 |
| Jogo (sítio e vilarejo) com HUD: relógio, clima, dinheiro, energia, objetivo, barra rápida | ✅ v0.1 |
| Diálogo com retrato, corações e escolhas | ✅ v0.1 |
| Mochila (30 espaços, mover, comer, segurar) | ✅ v0.1 |
| Armazém (Sementes, Animais, Obras, Vender) | ✅ v0.1 |
| Pensão e bar (comida que dá energia) | ✅ v0.1 |
| Estações de beneficiamento | ✅ v0.1 |
| Caixote do sítio | ✅ v0.1 |
| Montar barraca + feira ao vivo | ✅ v0.1 |
| Mural da comunidade | ✅ v0.1 |
| Caderno (objetivos, amizades, cotações) | ✅ v0.1 |
| Bom dia (resumo da noite + previsão) | ✅ v0.1 |
| Jornal de segunda | ✅ v0.1 |
| Menu de pausa, Como jogar | ✅ v0.1 |
| Interior das casas, mapa da serra, pesca, gruta, festas, banco, contratos | 🔜 roadmap |

## 15. Direção de arte e som

- **Resolução interna** 384×216, tiles de 16×16, escala inteira (pixels nítidos). Texto da interface desenhado na resolução da tela.
- **Tudo é gerado por código** (sem imagens): tiles, plantas em 5 estágios, construções, 8 moradores, bichos, 50 ícones. Fácil de ajustar e de manter coerente.
- **Paleta quente**: terra vermelha, telha de barro, janelas azul-colonial, taipa ocre. Duas paletas de natureza (águas/seca).
- **Luz**: entardecer alaranjado, noite azulada com janelas e lampiões acesos, chuva com respingos, relâmpagos no temporal.
- **Fontes**: VT323 (texto) e Press Start 2P (títulos), ambas OFL e incluídas no repositório.
- **Trilha chiptune**: toada em Sol maior (G–C–D–G | Em–C–D–G), viola caipira simulada com cordas em pares levemente desafinadas, baixo em triângulo, melodia em duas partes. Mais baixa à noite. Efeitos sonoros sintetizados.

## 16. Tom de escrita

- Português do Brasil, linguagem neutra para o personagem do jogador (sem "cansado/cansada").
- Afeto e humor leve. Expressões do interior quando soam naturais ("uma vontade danada", "tem coração de rapadura").
- Nunca zombar do sotaque ou da pobreza; o interior é lugar de saber.

## 17. Sistemas da v0.2 ("Roça clássica")

A v0.2 aproxima o jogo do ritmo dos clássicos de fazenda em pixel art, com arte, código e textos próprios e o tema do interior brasileiro.

| Sistema | Como funciona |
|---|---|
| Visual | Sprites com contorno escuro (`SE.outline`) e sombra no chão; personagens 16×32; árvores 48×64; bordas de grama, margem de rio e canteiro; painéis de madeira com moldura. |
| HUD | Relógio com mostrador, dia da semana, clima e época; dinheiro em casas; barras verticais de energia (E) e vida (V); barra de 12 itens (1–0, - e =). |
| Menu | Abas Mochila, Habilidades, Amizades, Criação, Caderno e Opções (Q/E troca de aba). Mochila de 36 espaços. |
| Diálogo | Caixa larga com retrato expressivo do morador e plaquinha com o nome. |
| Habilidades | Agricultura, Mineração, Coleta, Pesca e Combate, níveis 0–10 (`SE.XP_LV`). Sobe de nível à noite; cada nível barateia a energia (`SE.cost`) e libera receitas. Combate dá +5 de vida por nível. |
| Ferramentas | Enxada, regador, machado e picareta com níveis básico → cobre → ferro → ouro. Melhorar na Ferraria do Seu Bastião (R$ 2.000 / 5.000 / 10.000 + 5 barras); fica pronta em 2 dias e chega pelo correio. Enxada e regador melhorados carregam (segurar) para 3, 5 ou 3×3 canteiros. |
| Objetos com vida | Árvore 8 golpes, toco 3, pedra 1; rochas da gruta conforme o minério. Dano = 1 + nível da ferramenta. |
| Gruta | Entrada no alto do sítio. Andares 1–30 gerados por autômato celular, em três faixas (pedra, gelo, fogo). Escada aparece ao quebrar rochas; elevador a cada 5 andares. Lesmas e morcegos; facão dado na primeira descida. Desmaiar custa 10% do dinheiro (máx. R$ 500). Bombas abrem caminho. |
| Fornalha | 5 minérios + 1 carvão viram 1 barra em horas do jogo. Receita chega por carta ao achar o primeiro cobre. |
| Pesca | Vara chega pelo correio no dia 2. Segure para arremessar, espere o "!", e no minijogo mantenha a barra verde sobre o peixe. 7 peixes por época e horário; isca encurta a espera. |
| Criação | Baú (36 espaços), espantalho (raio 8 contra os corvos), adubo (+25% de crescimento), irrigador (rega os 4 vizinhos toda manhã), fornalha, bomba, isca. |
| Corvos | A partir do dia 4, com 10+ plantas fora do alcance de espantalho, corvos podem comer algumas plantas à noite. |
| Correio | Caixa de correio ao lado da casa; cartas com presentes anexados. |
| Relatório da noite | Página do que foi vendido no caixote, uma página por nível novo e o resumo do dia. |

Save `v: 2`, na mesma chave. Saves da v0.1 são migrados em `upgradeState`; ninguém acorda dentro da gruta.

## 18. Arquitetura técnica (v0.2)

```
index.html        carrega os scripts na ordem
css/style.css     tela, fontes e controles de toque
fonts/            VT323 e Press Start 2P (OFL)
js/util.js        utilidades, RNG determinístico
js/data.js        itens, culturas, receitas, habilidades, peixes, melhorias, moradores  ← balanceamento
js/sprites.js     terreno, objetos, árvores, plantas e construções (contorno + sombra)
js/chars.js       pessoas 16×32, retratos, bichos, monstros e ícones dos itens
js/world.js       mapas do sítio e do vilarejo, colisão
js/audio.js       música e efeitos (WebAudio)
js/input.js       teclado, mouse, toque
js/game.js        regras: inventário, habilidades, ferramentas, criação, correio, virada do dia, salvar
js/mine.js        gruta: geração dos andares, combate, bombas, desmaio
js/fishing.js     arremesso, fisgada e minijogo da pescaria
js/ui.js          painéis: diálogo com retrato, menu em abas, baú, correio, ferraria, lojas
js/feira.js       montar barraca e simulação da feira
js/scenes.js      título, criação, introdução, jogo e HUD
js/main.js        loop, escala, transições
```

Salvamento em `localStorage` (`sitioEsperanca.save.v1`, formato `v: 2`), automático ao dormir e manual pelo menu (não salva dentro da gruta).

---

## 19. Roadmap

### v0.2 — "Roça clássica" (entregue)
- Visual com contorno e sombra, HUD e menu em abas, diálogo com retrato.
- Habilidades, ferramentas com níveis e ferraria, correio, criação de objetos.
- Gruta com 30 andares, minérios, fornalha, combate e bombas.
- Pesca com minijogo, corvos e espantalho, irrigador e adubo.

### v0.3 — "Casa e Bichos"
- Interior da casa de taipa (cama, fogão, baú de guardar coisas, calendário na parede).
- Porcos (e ração de milho), cuidado de saúde com a Dra. Lúcia (bicho doente se mal cuidado).
- Qualidade dos produtos (comum / prata / ouro) ligada à afeição e ao adubo.
- Esterco do curral e irrigador de qualidade (3×3).
- Estufa (plantar fora de época) e **açude** (guardar água na seca).
- Sons ambiente: galo de manhã, cigarra na seca, sapos nas águas.

### v0.4 — "Feira e Contratos"
- Feira com mais barracas concorrentes e preços dos vizinhos.
- **Contratos** com a cooperativa e compradores da cidade (quantidade, qualidade, prazo, multa).
- Carroça e trator (velocidade e área de preparo maiores).
- **Banco do vilarejo**: empréstimo com juros e risco se a colheita falhar.
- Jornal com mais notícias e eventos encadeados (geada, praga, festival).
- Ajudantes contratados (regam e alimentam bichos por uma diária).

### v0.5 — "Festas"
- **Festa Junina** com quadrilha (minijogo de ritmo), comidas típicas e fogueira.
- **Festa do Peão** (concurso de gado) e **quermesse** da igreja (barraquinhas e prendas).
- **Festa da Colheita** com concurso de produtos (qualidade e apresentação).
- Música própria para cada festa (sanfona e zabumba em chiptune).

### v0.6 — "Serra"
- Mapa da serra: mata com frutas nativas (pequi, jabuticaba, araticum, cagaita).
- Pesca de lagoa e de peixes lendários; andares secretos da gruta.
- Segredos do Vô Benedito espalhados pela serra.

### v0.7 — "Vida no Vilarejo"
- 20 moradores com agenda completa e casas visitáveis.
- Eventos de coração (cenas aos 2, 4, 6 e 8 corações).
- Namoro, pedido com uma fita do Senhor do Bonfim e casamento na igreja.
- Novos moradores que chegam quando a escola e a estação reabrem.

### v1.0 — "Esperança"
- Campanha completa de 3 anos com finais diferentes conforme o vilarejo.
- Conquistas, estatísticas, modo foto.
- Acessibilidade: remapear teclas, texto maior, modo daltônico, velocidade do dia ajustável.
- Tradução para inglês e espanhol.
- PWA instalável e jogo offline completo.

### Dívidas técnicas a acompanhar
- Testes automatizados de regras (`game.js`) rodando em Node.
- Separar dados de diálogo em arquivos próprios para facilitar a escrita.
