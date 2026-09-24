# Plano de construção — meridiano. (versão 1)

Este é o plano completo. O `CLAUDE.md` guarda o **quê** (briefing e regras); este arquivo
guarda o **como** e em **que ordem**. Ao concluir cada passo, marcar a caixa na seção
[Estado dos passos](#estado-dos-passos).

---

## Contexto

Curso de SQL interativo e gratuito, para o portfólio do Fernando: site estático (HTML +
CSS + JavaScript puro, sem etapa de build), publicado no GitHub Pages. O aluno é analista
de dados do Observatório Meridiano, um instituto fictício em Genebra, e cada lição é uma
missão — um pedido de um pesquisador, resolvido com SQL de verdade (DuckDB-WASM, rodando
no navegador) sobre dados reais do Banco Mundial.

O projeto começou de uma pasta vazia. O repositório Git é criado pelo Fernando, pelo
GitHub Desktop.

A meta final é uma trilha de **10 módulos e 77 missões** de 8 a 12 minutos. A **versão 1**
entrega o fluxo inteiro funcionando de ponta a ponta, com laboratório, cola e três jogos,
e os **módulos 0 a 2** escritos (20 missões); os módulos 3 a 9 aparecem como "em breve",
mas a estrutura de dados já nasce pronta para recebê-los.

### Decisões tomadas

| Decisão | Escolha | Motivo |
|---|---|---|
| Organização do JS | **Módulos ES** (`import`/`export`), como no digita | Código isolado, sem globais se misturando |
| Motor SQL | **DuckDB-WASM**, versão fixada, dentro de `vendor/duckdb/` | SQL moderno completo (`QUALIFY`, `PIVOT`, janelas, `WITH RECURSIVE`) sem servidor e sem CDN |
| Plano B do motor | **sql.js** (SQLite) | Muito mais leve; só se a medição do passo 6 mostrar que o DuckDB pesa demais |
| Quando o motor carrega | Só nas telas com SQL (missão, laboratório, jogos) | Quem só lê a trilha ou a cola não paga o peso do motor |
| Fontes | Source Serif 4 + JetBrains Mono, `.woff2` em `fontes/` — **aprovadas no passo 2** | Arquivos no repositório, um variável por fonte, só o subconjunto latino (82 KB) |
| Paleta | A do briefing, com **dois ajustes aprovados no passo 2**: texto discreto claro `#6D6D76` e `GROUP BY` claro `#9D600F` | Os dois ficavam abaixo de 4,5:1 sobre a superfície, onde fica o editor |
| Marca | Só o nome, na serifada, com o ponto na cor de destaque — sem ícone ao lado | O ponto já é a assinatura; o globo fica no favicon |
| Idioma da base | CSVs e gabaritos em inglês; nomes de tabela e coluna traduzidos na hora | Uma fonte só, sem duas bases para manter em sincronia |
| Como testar | Claude inicia `python3 servidor.py` (porta **8030**) e abre no painel de navegador | Módulos ES não funcionam com `file://`, e o servidor padrão serve código velho do cache |
| Escopo v1 | Fluxo completo + módulos 0 a 2 | Ver o site rodando e publicável cedo |
| Publicação | Logo depois do motor SQL (passo 6) | Medir peso e tempo de carga no endereço real antes de construir em cima |
| Safari | Fernando testa à mão nos passos 5, 7 e 12 | WebAssembly, Workers e editor são onde a simulação mais engana |
| Git | **Todo pelo Fernando, no GitHub Desktop** | Claude não roda nenhum comando de Git; sugere a mensagem de commit |
| README | **Dois arquivos**: `README.md` (PT) e `README.en.md` (EN) | Portfólio lido por gente dos dois idiomas |
| Licença | **MIT**, em nome de Fernando Rodrigo Trajano da Silva | Padrão para projeto público de portfólio |
| Nome do repositório | **`meridiano`** → `fernando-trajano.github.io/meridiano/` | **A confirmar pelo Fernando** no passo 6 |

Ambiente conferido: `python3` 3.9.6. Não há Node nem Homebrew — o que combina com o
projeto sem etapa de build. Arquivos de terceiros (DuckDB-WASM, fontes) são baixados uma
vez, direto da fonte oficial, e ficam no repositório.

---

## Passo 1 — documentos e repositório

Criados pelo Claude, sem nenhum comando de Git:

- `CLAUDE.md` — o briefing na íntegra (Parte 1), as decisões e convenções (Parte 2) e o
  que fica fora da v1 (Parte 3);
- `PLANO.md` — este arquivo;
- `README.md` e `README.en.md`, `LICENSE` (MIT), `.gitignore`, `.nojekyll`;
- `servidor.py`, copiado do digita, com os tipos de arquivo fixados (`.wasm`, `.mjs`,
  `.woff2`, `.csv`) e a porta 8030.

O Fernando cria o repositório no **GitHub Desktop**:

1. *File → Add Local Repository…* e escolher a pasta `Meridiano`.
2. O aplicativo avisa que a pasta não é um repositório e oferece **"create a
   repository"** — aceitar, com o nome **`meridiano`**, sem README, sem `.gitignore` e sem
   licença (todos já existem na pasta).
3. Conferir em *Settings → Git* que o e-mail é o de privacidade do GitHub
   (`327606988+fernando-trajano@users.noreply.github.com`).
4. Fazer o primeiro commit com os arquivos do passo 1. **Ainda não publicar** — a
   publicação é o passo 6.

---

## Estrutura de pastas e arquivos

```
Meridiano/
├── CLAUDE.md                  # briefing + convenções (memória do projeto)
├── PLANO.md                   # este arquivo: estrutura, ordem dos passos, regras
├── LICENSE                    # MIT
├── README.md                  # em português: o que é, como rodar, fonte dos dados
├── README.en.md               # o mesmo em inglês, com link cruzado entre os dois
├── .gitignore                 # .DS_Store, cache das ferramentas etc.
├── .nojekyll                  # obrigatório no GitHub Pages p/ pastas normais
├── servidor.py                # servidor local sem cache (do digita + tipos .wasm/.mjs)
├── index.html                 # ÚNICA página; as telas trocam por JavaScript
├── favicon.svg
│
├── css/
│   ├── tema.css               # SÓ variáveis: cores claro/escuro, cláusulas, fontes, espaços
│   ├── fontes.css             # @font-face das fontes de fontes/
│   ├── base.css               # reset, tipografia, moldura da página, cabeçalho, rodapé
│   ├── componentes.css        # botões, seletor, memorando, monograma, erro, realce de SQL
│   │                          # (e depois: lista com hover, estrelas)
│   ├── editor.css             # editor, realce por cláusula, autocompletar
│   ├── raio-x.css             # a tabela viva do Raio-X
│   ├── telas.css              # o que é específico de cada tela
│   └── jogos.css              # as partidas dos jogos
│
├── fontes/
│   ├── LEIA-ME.md             # origem, data, subconjunto e licença de cada fonte
│   ├── source-serif-4/        # um .woff2 variável (400–600) + OFL.txt
│   └── jetbrains-mono/        # um .woff2 variável (400–500) + OFL.txt
│
├── vendor/
│   └── duckdb/                # DuckDB-WASM, versão fixada: .wasm, worker, módulo,
│                              # LICENSE e VERSAO.md (versão, data, de onde veio)
│
├── js/
│   ├── app.js                 # ponto de entrada: liga tudo e mostra a 1ª tela
│   ├── roteador.js            # troca de telas (#/inicio, #/missao/m1-03…) + View Transitions
│   ├── armazenamento.js       # ler/gravar localStorage com prefixo "meridiano:" (do digita)
│   ├── estado.js              # config + progresso em memória, avisa quem depende (do digita)
│   ├── i18n.js                # idioma: detectar, trocar, traduzir a tela (do digita)
│   ├── exportacao.js          # backup do progresso em JSON com versão (do digita)
│   ├── som.js                 # Web Audio API, só nos jogos (do digita)
│   ├── movimento.js           # reduced-motion, números que contam, pulso do ponto da marca
│   ├── ilustracoes.js         # os SVGs de traço (globo, mapa em pontos, fachada, pino…)
│   ├── bd.js                  # abre o DuckDB, carrega a base no idioma da tela, zera, roda
│   ├── traducao-sql.js        # troca nomes de tabela/coluna EN↔PT, nunca o que está entre aspas
│   ├── erros-sql.js           # erro do DuckDB → frase simples com pista, PT e EN
│   ├── conferir.js            # compara o resultado do aluno com o do gabarito e diz COMO errou
│   ├── realce.js              # colore SQL por cláusula (editor, Raio-X, cola, jogos)
│   ├── editor.js              # editor: realce, autocompletar, atalhos, formatar
│   ├── tabela-resultado.js    # desenha o resultado de uma consulta
│   ├── raio-x.js              # a animação etapa por etapa
│   ├── progresso.js           # concluir missão, estrelas, desbloqueio, sequência de dias
│   ├── telas/
│   │   ├── abrindo.js         # "Abrindo o observatório..." com o globo girando
│   │   ├── entrada.js
│   │   ├── nivelamento.js     # os 6 desafios
│   │   ├── inicio.js          # continuar, atalhos, exportar/importar
│   │   ├── trilha.js          # acordeão dos 10 módulos + linha do meridiano
│   │   ├── missao.js          # as 7 etapas da missão
│   │   ├── entrega.js         # resposta do personagem, estrelas, números que contam
│   │   ├── laboratorio.js
│   │   ├── cola.js
│   │   └── jogos.js           # o menu de jogos
│   └── jogos/
│       ├── comum.js           # tela do nível, tela do fim, relógio, pausa (do digita)
│       ├── palpite.js
│       ├── telegrama.js
│       └── infiltrado.js
│
├── dados/                     # CONTEÚDO separado da LÓGICA
│   ├── i18n/
│   │   ├── pt.js              # todos os textos da interface em português
│   │   └── en.js              # os mesmos, em inglês, com as mesmas chaves
│   ├── base/
│   │   ├── mundo/             # 5 CSVs do Banco Mundial + COLETA.md (data, códigos, contagens)
│   │   ├── instituto/         # 6 CSVs inventados, gerados com semente fixa
│   │   └── dicionario.js      # as 11 tabelas e 70 colunas: nome PT/EN, descrição, chaves
│   ├── missoes/
│   │   ├── indice.js          # os 10 módulos: ordem, personagem, quais estão liberados
│   │   ├── conferencia.js     # as 5 conferências automáticas
│   │   ├── MODELO.md          # esquema de uma missão, para escrever as próximas
│   │   ├── primeiro-dia.js    # módulo 0 (v1)
│   │   ├── escolher-colunas.js    # módulo 1 (v1)
│   │   ├── filtrar-linhas.js      # módulo 2 (v1)
│   │   └── …                  # módulos 3 a 9, depois da v1
│   ├── nivelamento.js         # os 6 desafios do nivelamento
│   ├── cola.js                # sintaxe, funções, outros bancos, glossário
│   └── jogos/
│       ├── palpite.js
│       ├── telegrama.js
│       └── infiltrado.js
│
└── ferramentas/               # rodam na máquina do Fernando, não no site
    ├── baixar_dados.py        # Python 3.9, só biblioteca padrão
    ├── gerar_instituto.py     # semente fixa; roda DEPOIS do baixar_dados.py
    └── cache/                 # respostas brutas da API (fora do Git)
```

Os ícones ficam num bloco `<svg>` de símbolos no topo do `index.html`, reusados com
`<use href="#icone-x">`, como no digita.

**Por que uma página só:** o site inteiro vive no `index.html` e o JavaScript troca o
conteúdo. É o que faz o GitHub Pages funcionar sem servidor — e aqui tem um motivo a mais:
o motor SQL é carregado **uma vez** e continua vivo entre uma missão e outra.

---

## Layout das telas

Regras do site inteiro (as mesmas do digita): sem caixas com borda em volta das seções,
separar por espaço e linha fina; sem sombras e sem gradientes; conteúdo centralizado até
**1100px** (`--largura-max`); laterais vazias.

| Tela | Colunas em tela larga |
|---|---|
| **Início** e **Trilha** | Duas: conteúdo no centro · painel de progresso à direita (sequência de dias, missões de 77, conceitos que mais escapam). Sem menu lateral, como no digita. Na trilha, a linha do meridiano corre ao lado do acordeão. |
| **Missão** | Duas: história à esquerda (**40%**) · editor em cima e resultado embaixo à direita (**60%**) |
| **Laboratório** | Editor e resultado ocupando a largura; tabelas e histórico acessíveis sem sair da tela |
| **Cola** | Uma coluna de leitura, com índice das seções |
| **Entrada**, **Nivelamento**, **Jogos** | Uma coluna centralizada, laterais vazias |

**Telas estreitas:** tudo vira uma coluna. Leitura, cola e Palpite funcionam; na missão e
no laboratório, um aviso discreto recomenda o computador, sem bloquear.

**Rodapé:** a fonte dos dados — *Banco Mundial, World Development Indicators, CC BY 4.0* —
e a data da coleta.

---

## A missão por dentro

As 7 etapas, na ordem: **pedido → olhe os dados → conceito + Raio-X → palpite → tente
você → variação sem ajuda → entrega**.

**Raio-X.** A consulta de exemplo é mostrada na ordem **lógica** de execução
(`FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`), uma etapa por vez, sobre
uma tabela pequena:

- `WHERE`: as linhas que não passam **apagam**; as que passam ganham **fundo translúcido
  da cor do `WHERE`** (a única exceção à regra "cor de cláusula só nas letras", porque
  aqui a cor marca linhas de dados, não texto);
- `GROUP BY`: as linhas se **juntam em blocos**;
- `JOIN`: uma **linha fina liga as chaves** das duas tabelas;
- com `prefers-reduced-motion`, as etapas trocam sem animação.

Cada etapa é um SQL de verdade (`raioX: [{ etapa, sql }]`) rodado no motor — a tabela
mostrada é sempre o resultado real, nunca um desenho à mão.

**Dicas e estrelas.** Três degraus de dica (pista → esqueleto → resposta). 3 estrelas sem
dica; 2 sem ver a resposta; 1 com a resposta.

**Conferência pelo resultado** (`js/conferir.js`). Roda a consulta do aluno e o gabarito
na mesma base zerada e compara os **resultados**:

- ordem das linhas só conta quando `conferir.ordem` é verdadeiro (o pedido fala em
  ordenar);
- nomes de coluna **não** contam — só a quantidade, a ordem das colunas e os valores;
- números comparados com `conferir.casas` casas (padrão 2);
- `exige: ['ORDER BY']` obriga um recurso (conferido na consulta, não só no resultado);
- ao errar, diz **como**: linhas a mais, linhas faltando, coluna diferente, ordem
  diferente.

---

## Formato de uma missão (`dados/missoes/`)

Contrato entre conteúdo e código. Um arquivo por módulo; missões novas são criadas
copiando este molde (detalhado no `MODELO.md`, passo 9):

```js
{
  id: 'm1-03',                       // módulo 1, missão 3 (formato a confirmar no passo 9)
  tipo: 'missao',                    // missao | revisao | desafio | projeto
  titulo: { pt: '…', en: '…' },
  personagem: 'kofi',
  pedido: { pt: '…', en: '…' },      // o memorando
  conceitosNovos: ['DISTINCT'],
  tabelas: ['countries'],            // sempre em inglês
  conceito: { pt: '…', en: '…' },    // no máximo 80 palavras
  exemplo: 'SELECT DISTINCT …',      // em inglês; traduzido na hora
  raioX: [{ etapa: 'FROM', sql: '…' }, { etapa: 'SELECT', sql: '…' }],
  palpite: { pergunta: { pt, en }, opcoes: [ … ], correta: 1 },
  desafios: [
    {
      enunciado: { pt: '…', en: '…' },
      inicial: 'SELECT …',           // o começo já escrito (vazio na variação sem ajuda)
      gabarito: 'SELECT …',          // UMA vez, em inglês
      conferir: { ordem: false, casas: 2 },
      exige: [],
      dicas: [{ pt, en }, { pt, en }, { pt, en }]   // pista, esqueleto, resposta
    }
  ],
  entrega: { pt: '…', en: '…' }      // a resposta do personagem
}
```

Os 10 módulos ficam declarados em `indice.js` com a contagem final (3 · 8 · 9 · 10 · 8 ·
9 · 8 · 10 · 8 · 4 = 77), o personagem de cada um e quais estão liberados. Todo módulo
segue o ritmo **missões → revisão misturada → desafio final**, e o desafio libera o módulo
seguinte.

### As cinco conferências automáticas (`dados/missoes/conferencia.js`)

Rodam sobre todas as missões escritas e **avisam no console** (nunca quebram a tela):

1. **Todo gabarito roda** e devolve pelo menos uma linha.
2. **O gabarito traduzido dá o mesmo resultado** na base em português.
3. **Só comandos já ensinados** — a consulta de uma missão só usa os `conceitosNovos`
   dela somados aos de todas as missões anteriores.
4. **Nenhum conceito passa de 80 palavras** (nos dois idiomas).
5. **Todo texto tem `pt` e `en`**, e **toda tabela e coluna** usada está no
   `dicionario.js`.

É a rede de segurança para quando as outras 57 missões forem escritas.

---

## A base

**De onde vem.** `ferramentas/baixar_dados.py` roda **uma vez**, na máquina do Fernando,
e salva os CSVs em `dados/base/mundo/` junto com um `COLETA.md` (data, endereço da API,
códigos dos indicadores). Os CSVs entram no repositório: o site nunca chama a API do
Banco Mundial. `ferramentas/gerar_instituto.py` gera `dados/base/instituto/` com semente
fixa — rodar de novo dá exatamente os mesmos arquivos.

**Como chega ao aluno.** O `bd.js`:

1. abre o DuckDB-WASM (só nas telas com SQL, atrás da tela "Abrindo o observatório...");
2. registra os CSVs e cria as tabelas **com os nomes do idioma da tela**, lidos do
   `dicionario.js`;
3. guarda uma cópia intocada da base, para **zerar** no começo de cada missão sem baixar
   nada de novo (o jeito exato — recriar a partir de uma cópia na memória ou de um
   esquema de reserva — é decidido e medido no passo 5);
4. ao trocar de idioma, recarrega a base com os outros nomes e traduz a consulta que está
   no editor com o `traducao-sql.js`.

**Nomes em português.** Aprovados no passo 4; a lista está no `dicionario.js`.

**Refazer a base** (só se um dia for preciso — por exemplo, para trocar um indicador):

```bash
python3 ferramentas/baixar_dados.py --de-novo
python3 ferramentas/gerar_instituto.py
```

O primeiro baixa de novo (a data da coleta muda no `COLETA.md`); o segundo refaz o
instituto a partir do mundo novo. Com o mesmo mundo, o instituto sai idêntico.

---

## Chaves do localStorage

Todas com o prefixo `meridiano:`:

| Chave | Guarda |
|---|---|
| `meridiano:config` | idioma, tema, som, formato de exportação do CSV (BR/internacional) |
| `meridiano:progresso` | por missão: estrelas, dicas usadas, viu a resposta, concluída; módulos liberados |
| `meridiano:sequencia` | dias seguidos, última data |
| `meridiano:estatisticas` | erros por conceito (alimenta "conceitos que mais escapam") |
| `meridiano:nivelamento` | as respostas dos 6 desafios e o que foi liberado |
| `meridiano:laboratorio` | histórico (50 consultas), favoritas, a última consulta aberta |
| `meridiano:jogos` | o último jogo e nível escolhidos no menu |

O backup (passo 21) exporta e importa todas elas num JSON com **número de versão**, para
um backup antigo continuar entrando depois que o formato mudar.

---

## Ordem de construção — os 21 passos

Cada passo termina com algo visível e com um **resumo curto** (o que mudou, o que testar,
o que o Fernando deve ver) e uma **sugestão de mensagem de commit**. 🛑 = parar e chamar
o Fernando.

| # | O que | Entrega visível |
|---|---|---|
| 1 | Repositório e documentos | `CLAUDE.md`, `PLANO.md`, READMEs, LICENSE, `.gitignore`, `.nojekyll`, `servidor.py` |
| 2 | `tema.css` (paleta clara e escura, cores de cláusula), fontes, CSS base, `index.html` e `app.js` | Página com as cores e as fontes certas, claro e escuro · **🛑 aprovar paleta e fontes, com o contraste medido** |
| 3 | `i18n.js` + `dados/i18n/*` | Botão PT/EN trocando os textos de verdade |
| 4 | `baixar_dados.py`, `gerar_instituto.py` e `dicionario.js` | As 11 tabelas em CSV e o dicionário PT/EN · **🛑 revisão de indicadores, tabelas, nomes em PT e personagens** |
| 5 | DuckDB-WASM em `vendor/` + `bd.js` + `traducao-sql.js` | Uma consulta de verdade rodando no navegador, nos dois idiomas, com a tela "Abrindo o observatório..." · **🛑 teste no Safari** |
| 6 | Publicar no GitHub Pages e medir | O site no endereço real, com peso e tempo de carga do motor medidos · **🛑 Claude guia, Fernando publica; decidir se fica o DuckDB ou vai o plano B** |
| 7 | Editor, resultado e erros (`realce.js`, `editor.js`, `tabela-resultado.js`, `erros-sql.js`) | Escrever, rodar com Cmd/Ctrl+Enter, ver o resultado e o erro traduzido · **🛑 teste no Safari** |
| 8 | `armazenamento.js` + `estado.js` | Idioma e tema sobrevivem ao recarregar |
| 9 | `conferir.js` + formato da missão + `conferencia.js` + `MODELO.md` | Conferência pelo resultado dizendo como errou; as 5 conferências no console |
| 10 | Conteúdo dos módulos 0 a 2 | 20 missões escritas · **🛑 revisão dos pedidos e gabaritos ANTES de escrever** |
| 11 | `raio-x.js` | A tabela viva, etapa por etapa |
| 12 | Tela de **missão** | As 7 etapas, dicas, 40/60 · **🛑 teste no Safari** |
| 13 | **Entrega** e `progresso.js` | Estrelas, números que contam, ponto da marca pulsando, desbloqueio |
| 14 | Tela de **trilha** | Acordeão dos 10 módulos, 7 "em breve", linha do meridiano |
| 15 | **Entrada** e **nivelamento** | Os 6 desafios que liberam o que o aluno já sabe |
| 16 | Tela de **início** | Continuar, atalhos com hover e ilustração, painel à direita |
| 17 | **Laboratório** | Base inteira, importar/exportar CSV, histórico, favoritas, link com a consulta |
| 18 | **Cola** | Sintaxe por cláusula, funções, mapa das 11 tabelas, indicadores, outros bancos, glossário |
| 19 | Menu de jogos + **Palpite** | Primeiro jogo jogável |
| 20 | **Telegrama** + **Infiltrado** | Os três jogos |
| 21 | Sons, backup, transições, telas estreitas, rodapé com a fonte, polimento | Versão 1 fechada e publicada |

Os passos 5, 9 e 11 são os mais delicados — devem ser explicados com calma durante a
construção.

---

## As pausas (🛑)

**De aprovação** — o Claude mostra, o Fernando decide, e só então o Claude aplica:

- **Passo 2** — a paleta e as fontes, com uma tabela de contraste de **todos os pares**
  (texto, secundário e discreto sobre fundo e superfície; destaque; erro; botões; as seis
  cores de cláusula sobre fundo e superfície, nos dois modos), marcando o que passa em AA
  para texto normal (4,5:1) e para texto grande (3:1). Sugestões de ajuste vêm como
  sugestão, nunca aplicadas por conta própria.
- **Passo 4** — a lista dos 12 indicadores (com código do Banco Mundial), as colunas de
  cada tabela, os **nomes em português** de tabelas e colunas e o texto dos personagens.
- **Passo 6** — ver "Publicação e medição", abaixo.
- **Passo 10** — antes de escrever, a lista das 20 missões dos módulos 0 a 2: pedido,
  conceito novo, tabelas e gabarito de cada uma.

**De teste no Safari** — com roteiro do tipo "faça isto, você deve ver aquilo":

- **Passo 5** — a tela "Abrindo o observatório..." aparece e some; uma consulta roda e o
  resultado aparece; trocar o idioma troca os nomes das tabelas.
- **Passo 7** — digitar no editor com acentos, colar, desfazer, `Cmd+Enter`, `Cmd+/`,
  autocompletar; um erro de digitação na consulta vira uma frase em português.
- **Passo 12** — uma missão inteira do começo ao fim, com dica, erro e acerto.

---

## Passo 6 — publicação e medição

Claude prepara tudo e guia; **as ações na conta são do Fernando**, pelo GitHub Desktop:

1. *Publish repository*, com o nome **`meridiano`** e a caixa "Keep this code private"
   **desmarcada**.
2. Ligar o Pages em *Settings → Pages → branch `main`, pasta `/ (root)`*.
3. Depois que estiver no ar, o Claude abre o endereço real no navegador e mede:
   - o **peso transferido** do motor (o `.wasm` com a compressão que o GitHub Pages
     aplica) e o total da primeira visita a uma tela com SQL;
   - o **tempo** até "Abrindo o observatório..." sumir, na primeira visita e com cache;
   - se o console fica limpo e se nenhuma requisição sai para fora do domínio.
4. Com os números na mesa, o Fernando decide: **fica o DuckDB-WASM** ou **vai o plano B**
   (sql.js). A decisão e os números entram neste arquivo.

Quando houver commits novos depois disso, o Fernando envia com *Push origin*.

---

## Pontos de atenção do DuckDB-WASM (para o passo 5)

- **Peso.** O `.wasm` do DuckDB tem dezenas de MB sem compressão. O GitHub recusa arquivo
  acima de 100 MB e avisa acima de 50 MB; o Pages entrega comprimido. Levar para
  `vendor/duckdb/` **só o necessário**: o módulo principal, um worker e um `.wasm` (o
  pacote traz variantes — escolher a que roda em todos os navegadores atuais, Safari
  incluído, e registrar o motivo em `VERSAO.md`).
- **Sem cabeçalhos especiais.** O GitHub Pages não deixa configurar `COOP`/`COEP`, então
  vale só a variante **sem threads**. O `servidor.py` também não manda esses cabeçalhos,
  para o teste local ser igual ao endereço real.
- **Nada da internet.** O DuckDB tenta baixar extensões sozinho quando uma função pede
  (por exemplo, fusos horários). Desligar a instalação e o carregamento automáticos, e
  conferir no passo 6 que nenhuma requisição sai do domínio. O que a trilha usa (CSV,
  janelas, `QUALIFY`, `PIVOT`, `WITH RECURSIVE`) é do núcleo.
- **Tipos de arquivo.** `.wasm` precisa chegar como `application/wasm` e `.mjs` como
  JavaScript — fixados no `servidor.py`; o GitHub Pages já faz certo.
- **Versão fixada.** A versão escolhida, a data e o endereço de onde os arquivos vieram
  ficam em `vendor/duckdb/VERSAO.md`. Atualizar é uma decisão, nunca um acidente.

---

## Como testar (Claude faz, Fernando só olha)

```bash
cd /Users/fernando/Documents/ClaudeCode/Meridiano && python3 servidor.py
```

Sempre o `servidor.py`, nunca o `python3 -m http.server`. Abrir `http://localhost:8030`
no painel de navegador do app e conferir, conforme o passo:

1. **Tema** — claro e escuro em todas as telas; o destaque só em progresso, item ativo,
   link e ponto da marca.
2. **Idioma** — PT/EN troca a interface, os nomes das tabelas e a consulta do editor, sem
   texto vazando.
3. **Motor** — a tela "Abrindo o observatório..." só aparece nas telas com SQL; nenhuma
   requisição para fora do domínio.
4. **Base zerada** — um `DELETE` numa missão não aparece na missão seguinte.
5. **Conferência** — uma resposta certa escrita de outro jeito passa; uma errada diz
   como errou.
6. **Conferências de conteúdo** — as 5 passam no console.
7. **Salvamento** — concluir uma missão, recarregar e o progresso continuar lá; exportar
   e importar o backup.
8. **Movimento** — com "reduzir movimento" ligado no sistema, nada anima.
9. **Acessibilidade** — navegar só pelo teclado (Tab, Enter, Esc).
10. **Telas estreitas** — em 375px, leitura, cola e Palpite funcionam; missão e
    laboratório mostram o aviso sem bloquear.

---

## Estado dos passos

- [x] **Passo 1** — `CLAUDE.md`, `PLANO.md`, READMEs PT/EN, `LICENSE`, `.gitignore`,
      `.nojekyll` e `servidor.py` (do digita, com `.wasm`/`.mjs` fixados e porta 8030).
      O repositório Git é criado pelo Fernando no GitHub Desktop.
- [x] **Passo 2** — `tema.css`, `fontes.css`, `base.css`, `componentes.css`, `telas.css`,
      `index.html`, `app.js` e `favicon.svg` · ✅ **paleta e fontes aprovadas pelo
      Fernando**, com o contraste medido (dois ajustes no claro: discreto `#6D6D76`,
      `GROUP BY` `#9D600F`). O botão de tema alterna, mas a escolha ainda não é salva —
      isso é o passo 8. A página mostra uma vitrine provisória, que sai no passo 15.
- [x] **Passo 3** — `i18n.js` e traduções PT/EN (detecção pelo navegador, seletor no
      cabeçalho, título da aba e `lang` acompanhando; lacunas `{nome}`, `emIdioma()` para
      o conteúdo e conferência das chaves no console; a escolha ainda não é salva — isso
      é o passo 8)
- [x] **Passo 4** — `baixar_dados.py`, `gerar_instituto.py` e `dicionario.js` · ✅
      **indicadores, tabelas, nomes em PT e personagens aprovados pelo Fernando** (17
      agregados, `indicator_values` só com valores, `missions` → `field_trips`/`viagens`).
      Coleta em 24/09/2026: 234 países, 5.616 linhas país × ano, 59.454 valores; instituto
      conferido (nenhuma data incoerente, 20 pagamentos em dobro, 19 projetos em aberto,
      hierarquia de 4 níveis)
- [ ] **Passo 5** — DuckDB-WASM, `bd.js` e `traducao-sql.js` · 🛑 Safari
- [ ] **Passo 6** — publicação no GitHub Pages e medição · 🛑
- [ ] **Passo 7** — editor, resultado e erros · 🛑 Safari
- [ ] **Passo 8** — armazenamento e estado
- [ ] **Passo 9** — `conferir.js`, formato da missão, `conferencia.js` e `MODELO.md`
- [ ] **Passo 10** — conteúdo dos módulos 0 a 2 · 🛑 revisão antes de escrever
- [ ] **Passo 11** — `raio-x.js`
- [ ] **Passo 12** — tela de missão · 🛑 Safari
- [ ] **Passo 13** — entrega e progresso
- [ ] **Passo 14** — trilha
- [ ] **Passo 15** — entrada e nivelamento
- [ ] **Passo 16** — início
- [ ] **Passo 17** — laboratório
- [ ] **Passo 18** — cola
- [ ] **Passo 19** — menu de jogos e Palpite
- [ ] **Passo 20** — Telegrama e Infiltrado
- [ ] **Passo 21** — sons, backup, transições, telas estreitas, rodapé com a fonte,
      polimento

## Conteúdo escrito

- [ ] Módulo 0 — Primeiro dia no observatório — 3
- [ ] Módulo 1 — Escolher colunas — 8
- [ ] Módulo 2 — Filtrar linhas — 9
- [ ] Módulo 3 — Ordenar e transformar — 10 *(depois da v1)*
- [ ] Módulo 4 — Resumir e agrupar — 8 *(depois da v1)*
- [ ] Módulo 5 — Juntar tabelas — 9 *(depois da v1)*
- [ ] Módulo 6 — Consultas dentro de consultas — 8 *(depois da v1)*
- [ ] Módulo 7 — Análise moderna — 10 *(depois da v1)*
- [ ] Módulo 8 — Criar e alterar dados — 8 *(depois da v1)*
- [ ] Módulo 9 — Relatório anual — 4 *(depois da v1)*

**0 de 77 missões.**
