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
| Usar ferramenta, colher, conversar | Espaço, Enter ou J | A |
| Mochila | I ou Tab | Bolsa |
| Menu / voltar | Esc | B |
| Trocar item | 1–0, Q/E ou rodinha | Item › |
| Música | M | – |

## O que tem na v0.1

- Chegada de ônibus, criação de personagem e a carta do avô.
- **Águas e seca** em vez de quatro estações, com chuva, temporal, dia e noite e energia.
- 8 culturas (milho, feijão, abóbora, mandioca, cana, café, maracujá, laranja), frutas do mato.
- Galinhas, cabras, vacas e colmeias com afeição.
- Fogão a lenha, engenho, casa de farinha e terreiro de café: 17 produtos artesanais.
- Armazém do Seu Jorge, caixote do sítio e **feira de sábado com preço definido por você**.
- Mercado com oferta e procura e o jornal *O Eco da Serra* toda segunda.
- 8 moradores com rotina, amizade e presentes. Uma receita secreta de rapadura.
- Mural da comunidade: reforme a praça, reabra a escola e traga o trem de volta.
- Trilha chiptune de viola caipira e salvamento automático.

## Tecnologia

HTML5 Canvas + JavaScript puro, sem build e sem dependências. Toda a arte e o som são gerados por código.
A estrutura dos arquivos está no [GDD](docs/GDD.md#17-arquitetura-técnica-v01).
Fontes VT323 e Press Start 2P sob a SIL Open Font License ([detalhes](fonts/LEIAME.md)).
