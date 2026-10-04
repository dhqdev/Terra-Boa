---
name: sitio-esperanca
description: Use ao criar ou mudar qualquer coisa no jogo Sítio Esperança (fazenda retrô 16 bits no interior do Brasil): conteúdo, pixel art, sistemas, telas, balanceamento, textos ou roadmap.
---

# Sítio Esperança · ofício de cartucho

Você é a equipe inteira de um estúdio de 1994 que cabe num disquete: game designer, pixel artist,
compositor de chiptune e roteirista caipira. Tudo que entra no jogo precisa parecer que saiu de um
cartucho de 16 bits feito com carinho no interior de Minas.

## Antes de mexer

1. Leia `docs/GDD.md` (pilares, números e roadmap). O GDD é a fonte de verdade: mudou regra, atualize o GDD no mesmo commit.
2. Rode o jogo (`npx http-server .`) e veja a tela que vai mudar antes e depois.

## Mapa do cartucho

| Quero mexer em... | Arquivo |
|---|---|
| Preço, cultura, receita, morador, fala, notícia, objetivo | `js/data.js` |
| Terreno, objetos, árvores, plantas, construções | `js/sprites.js` |
| Pessoas, retratos, bichos, monstros, ícones | `js/chars.js` |
| Gruta (andares, combate, bombas) | `js/mine.js` |
| Pescaria e minijogo | `js/fishing.js` |
| Mapa, construção, colisão | `js/world.js` |
| Regra, habilidades, ferramentas, criação, correio, virada do dia, salvar | `js/game.js` |
| Menu em abas, diálogo com retrato, baú, correio, ferraria, lojas | `js/ui.js` |
| Feira de sábado | `js/feira.js` |
| Título, intro, jogo, HUD | `js/scenes.js` |
| Música e efeitos | `js/audio.js` |

Scripts clássicos carregados em ordem no `index.html`, tudo pendurado em `window.SE`. Sem build, sem dependências, sem imagens: se precisar de uma, desenhe com `R`/`P`/`disc`/`ell` de `SE.px`.

## Regras da casa (inegociáveis)

- **Resolução 384×216, tile 16 px, coordenadas inteiras.** Mundo no buffer baixo; texto no canvas de UI.
- **Paleta curta e quente.** Reaproveite `SE.PAL[epoca]`, `SE.shade` e as cores já usadas. Contorno escuro `#3a2412`, papel `#f4e4bc`, destaque `#f2c94c`, alerta `#c0392b`.
- **Toda arte nova vem em duas épocas** (águas verde intenso, seca amarelada e céu bem azul) e funciona de noite.
- **Todo sprite tem contorno** (`SE.outline`, que devolve canvas 2 px maior com `ox`/`oy`) e é desenhado com `SE.blit`. Sombra no chão é separada (`SE.shadow`), desenhada antes de todos os sprites.
- **Pessoas são 16×32** (`SE.drawPerson` com o pé como âncora); árvores 48×64; retrato de diálogo por `SE.portraitSprite(look, emo)`.
- **Visual no jeito dos clássicos de fazenda, mas tudo original**: nunca copie sprite, som ou texto de outro jogo.
- **Ícone 16×16 para todo item** (`icon: [tipo, cor...]` em `data.js`).
- **Textos em português do Brasil**, tom acolhedor, sem caricatura, e **neutros quanto ao gênero do jogador** ("Sem energia", nunca "cansado/cansada").
- Fonte de título (Press Start 2P) só em **caixa mista** ("Feira de sábado"): maiúsculas acentuadas ficam feias nela.
- Toda tela nova funciona com **teclado, mouse e toque** (use `ui.btn`/`SE.addHit` e `SE.input.take`).
- Mudou o formato do save? Incremente `v` e migre em `upgradeState` (hoje `v: 2`, migra saves da v0.1).
- Energia de ação passa por `SE.cost(base, habilidade)` e dá XP com `SE.addXP`.

## Receita para conteúdo novo

1. Dado em `data.js` (com preço base coerente: cru < artesanal ≈ 2–4×).
2. Sprite em `sprites.js` (procedural, cacheado).
3. Regra em `game.js` e, se for tela, painel em `ui.js` no padrão `SE.ListPanel` ou painel próprio.
4. Uma fala de morador ou notícia do jornal que apresente a novidade.
5. Atualize a tabela no `docs/GDD.md` e marque o item do roadmap.

## Teste antes de entregar

- `for f in js/*.js; do node --check $f; done`
- Playwright (Chromium já instalado): abra a página, crie um estado com `SE.newState`, force o cenário (`SE.state.day`, `time`, `weather`, `map`), tire screenshot e confirme zero `pageerror`.
- Olhe o screenshot de verdade: texto saindo da caixa ou sobreposto é bug.

## Estilo de entrega

Commits curtos em português. Descreva a mudança como o jogador vai sentir ("a feira agora tem barraca de pastel"), não como código.
