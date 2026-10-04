# 🌾 Sítio Esperança

Jogo de roça em **pixel art 16 bits** ambientado no interior do Brasil, entre serras e cafezais.
Você herda o sítio abandonado do Vô Benedito, roça o mato, planta na época certa, cria bichos,
faz queijo e rapadura, vende na feira de sábado e ajuda o vilarejo a renascer.

> Versão **0.1**: primeira versão jogável. Veja o [documento de design e o roadmap](docs/GDD.md).

## Como jogar

Não precisa instalar nada.

- **No computador:** baixe o repositório e abra o `index.html` no navegador.
- **Pelo GitHub Pages:** em *Settings → Pages*, escolha a branch `main` e a pasta `/ (root)`. O jogo fica em `https://<usuario>.github.io/Terra-Boa/`.
- **Servidor local (opcional):** `npx http-server .` e abra `http://localhost:8080`.

### Controles

| Ação | Teclado | Celular |
|---|---|---|
| Andar / correr | Setas ou WASD / Shift | Direcional |
| Usar ferramenta, colher, conversar | Espaço, Enter, J ou clique | A |
| Carregar ferramenta / arremessar a vara | Segure Espaço ou o clique | Segure A |
| Menu (mochila, habilidades, criação...) | Esc, I ou Tab | Menu |
| Trocar aba do menu | Q/E | – |
| Trocar item | 1–0, - e =, Q/E ou rodinha | Item › |
| Música | M | – |

## O que tem na v0.2

Visual e funções no jeito dos clássicos de fazenda em pixel art, com arte, código e textos próprios e o interior brasileiro como tema.

- Arte nova com contorno e sombra, personagens maiores, árvores altas, rio com margem, HUD com relógio e barras de energia e vida.
- Diálogo com retrato do morador, menu em abas (Mochila, Habilidades, Amizades, Criação, Caderno, Opções) e mochila de 36 espaços.
- **5 habilidades** (Agricultura, Mineração, Coleta, Pesca, Combate) que sobem de nível à noite.
- **Ferraria do Seu Bastião**: ferramentas de cobre, ferro e ouro, que carregam para atingir mais canteiros.
- **Gruta com 30 andares**: minérios, cristais, lesmas, morcegos, facão, bombas e elevador. Fornalha para fazer barras.
- **Pesca** com minijogo e 7 peixes por época e horário.
- Criação de baú, espantalho, irrigador, adubo, bomba e isca. Corvos atacam plantação sem espantalho.
- Correio com cartas e presentes, e relatório da noite com vendas e níveis novos.

E tudo da v0.1: águas e seca, 8 culturas, galinhas, cabras, vacas e colmeias, 17 produtos artesanais, feira de sábado com preço definido por você, jornal, 8 moradores e o mural da comunidade.

## Tecnologia

HTML5 Canvas + JavaScript puro, sem build e sem dependências. Toda a arte e o som são gerados por código.
A estrutura dos arquivos está no [GDD](docs/GDD.md#18-arquitetura-técnica-v02).
Fontes VT323 e Press Start 2P sob a SIL Open Font License ([detalhes](fonts/LEIAME.md)).
