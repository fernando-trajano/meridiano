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
| Fontes | **Fonte do sistema** para títulos, marca e texto; **JetBrains Mono** (`fontes/`) só para código, números, códigos e NULL | A Source Serif 4, aprovada no passo 2, saiu no redesenho depois do passo 12 |
| Paleta | **Refeita em duas rodadas depois do passo 12** (ver `CLAUDE.md`, "Paleta"): escuro é o padrão, com brancos quentes; claro é branco com a bancada em vidro | Contraste medido em cada rodada |
| Marca | Só o nome, na fonte do sistema (peso 600), com o ponto na cor de destaque — sem ícone ao lado | O ponto já é a assinatura; o globo fica no favicon |
| Idioma da base | CSVs e gabaritos em inglês; nomes de tabela e coluna traduzidos na hora | Uma fonte só, sem duas bases para manter em sincronia |
| Como testar | Claude inicia `python3 servidor.py` (porta **8030**) e abre no painel de navegador | Módulos ES não funcionam com `file://`, e o servidor padrão serve código velho do cache |
| Escopo v1 | Fluxo completo + módulos 0 a 2 | Ver o site rodando e publicável cedo |
| Publicação | Logo depois do motor SQL (passo 6) | Medir peso e tempo de carga no endereço real antes de construir em cima |
| Safari | Fernando testa à mão nos passos 5, 7 e 12 | WebAssembly, Workers e editor são onde a simulação mais engana |
| Git | **Todo pelo Fernando, no GitHub Desktop** | Claude não roda nenhum comando de Git; sugere a mensagem de commit |
| README | **Dois arquivos**: `README.md` (PT) e `README.en.md` (EN) | Portfólio lido por gente dos dois idiomas |
| Licença | **MIT**, em nome de Fernando Rodrigo Trajano da Silva | Padrão para projeto público de portfólio |
| Nome do repositório | **`meridiano`** → `fernando-trajano.github.io/meridiano/` | Confirmado no passo 6; repositório público |
| Motor, depois de medido | **Fica o DuckDB-WASM**, com o `.wasm` guardado no Cache Storage | Decisão do Fernando no passo 6, com os números na mesa (ver "Medições no endereço real") |

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
│   ├── componentes.css        # botões, painel (bancada), barra da Consulta, flutuante,
│   │                          # tabela, selo, erro, realce de SQL
│   ├── editor.css             # editor, autocompletar, erro e veredito
│   ├── passo-a-passo.css      # a consulta na ordem em que o banco lê
│   ├── telas.css              # o que é específico de cada tela
│   └── jogos.css              # as partidas dos jogos
│
├── fontes/
│   ├── LEIA-ME.md             # origem, data, subconjunto e licença de cada fonte
│   └── jetbrains-mono/        # um .woff2 variável (400–500) + OFL.txt
│
├── vendor/
│   ├── duckdb/                # DuckDB-WASM 1.32.0, versão fixada: módulo, worker e .wasm
│   │                          # da variante "eh", LICENSE e VERSAO.md
│   └── arrow/                 # Apache Arrow 17.0.0 (o DuckDB depende dele): o arquivo
│                              # único do pacote + arrow.mjs, a ponte; licenças e VERSAO.md
│
├── js/
│   ├── app.js                 # ponto de entrada: liga tudo e mostra a 1ª tela
│   ├── roteador.js            # troca de telas (#/trilha, #/missao/m1-03…) + View Transitions
│   ├── cabecalho.js           # o que cada tela põe no cabeçalho (contexto, "Sair")
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
│   ├── realce.js              # colore SQL por cláusula (editor, Passo a passo, cola, jogos)
│   │                          # e transforma `código` do texto em selos
│   ├── formatar-sql.js        # o botão "Formatar": só espaços, quebras e maiúsculas
│   ├── editor.js              # editor: realce, autocompletar, atalhos, formatar
│   ├── tabela-resultado.js    # a tabela do site inteiro (amostra, Passo a passo, resultado)
│   ├── passo-a-passo.js       # a consulta na ordem do banco, com o efeito na amostra
│   ├── tabelas-da-barra.js    # as tabelas da tarefa na barra da Consulta + lista de colunas
│   ├── moldura.js             # a moldura de duas colunas (centro + painel) das telas
│   │                          # com o painel de progresso
│   ├── painel-progresso.js    # o painel "Seu progresso" (posto pela moldura)
│   ├── bancada-consulta.js    # a bancada de um desafio (Consulta + Resultado), da missão e
│   │                          # do nivelamento
│   ├── progresso.js           # concluir missão, estrelas, desbloqueio, sequência de dias
│   ├── telas/
│   │   ├── abrindo.js         # "Abrindo o observatório..." com o globo girando
│   │   ├── entrada.js         # a 1ª tela de quem nunca esteve aqui: começar ou nivelar
│   │   ├── nivelamento.js     # os 6 desafios (abertura, desafios, resultado)
│   │   ├── inicio.js          # continuar, atalhos com desenho (o exportar/importar é do
│   │   │                      # passo 21)
│   │   ├── trilha.js          # acordeão dos 10 módulos + linha do meridiano (o visual
│   │   │                      # chegou antes; a lógica é o passo 14)
│   │   ├── missao.js          # as 6 etapas da missão, com a bancada — e a entrega:
│   │   │                      # resposta do personagem, estrelas, números que contam
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
│   │   ├── conferencia.js     # as 6 conferências automáticas
│   │   ├── MODELO.md          # esquema de uma missão, para escrever as próximas
│   │   ├── primeiro-dia.js    # módulo 0 (v1)
│   │   ├── escolher-colunas.js    # módulo 1 (v1)
│   │   ├── filtrar-linhas.js      # módulo 2 (v1)
│   │   └── …                  # módulos 3 a 9, depois da v1
│   ├── personagens.js         # os 7 personagens: nome, monograma, cargo PT/EN, id na base
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
separar por espaço e linha fina; sem sombras e sem gradientes (a única exceção é o vidro
da bancada no tema claro — ver `CLAUDE.md`); conteúdo centralizado até
**1100px** (`--largura-max`); laterais vazias.

| Tela | Colunas em tela larga |
|---|---|
| **Início** e **Trilha** | Duas: conteúdo no centro · painel de progresso à direita (sequência de dias, missões de 77, conceitos que mais escapam). Sem menu lateral, como no digita. Na trilha, a linha do meridiano corre ao lado do acordeão. |
| **Missão** | Em cima, a linha do meridiano com as 6 etapas. Embaixo, duas: texto à esquerda (210–260px, no fundo da página) · **bancada** à direita, num painel (seções com barra e aba). Cabe em 1280×800 sem rolar a página; a bancada rola por dentro |
| **Laboratório** | Editor e resultado ocupando a largura; tabelas e histórico acessíveis sem sair da tela |
| **Cola** | Uma coluna de leitura, com índice das seções |
| **Entrada**, **Nivelamento**, **Jogos** | Uma coluna centralizada, laterais vazias |

**Telas estreitas:** tudo vira uma coluna. Leitura, cola e Palpite funcionam; na missão e
no laboratório, um aviso discreto recomenda o computador, sem bloquear.

**Rodapé:** a fonte dos dados — *Banco Mundial, World Development Indicators, CC BY 4.0* —
e a data da coleta.

---

## A missão por dentro

As 6 etapas, na ordem (desde o redesenho depois do passo 12): **pedido → conceito →
palpite → tente você → sem ajuda → entrega**. A antiga "olhe os dados" virou a amostra da
tabela, na bancada do Pedido. Revisão e desafio final pulam conceito e palpite.

**Passo a passo** (`js/passo-a-passo.js`; substituiu o Raio-X no redesenho). O código do
exemplo aparece na ordem **normal**; o destaque segue a ordem em que o banco lê
(`FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`, só as cláusulas
que existem). A linha ativa fica inteira, com um véu de fundo e uma borda de 2px na cor da
cláusula; as outras, a 40%. Embaixo, a frase da missão para aquela cláusula
(`passoAPasso: { FROM: {pt, en}, … }`) e, no 1º passo, a nota "o banco começa por aqui".
A tabela é uma amostra de 5 a 8 linhas da tabela do `FROM`, com o efeito calculado sobre
os dados reais: no `WHERE` as linhas descartadas ficam a 18%; no `SELECT`, as colunas não
pedidas (e, com `DISTINCT`, as linhas repetidas); o `ORDER BY` reordena; o `LIMIT` apaga
o que passa do limite. Transição de 0,45 s. Com `JOIN`, por enquanto, só destaque e frase
(volta quando o módulo 5 for escrito).

**Dicas e estrelas.** Três degraus de dica (pista → esqueleto → resposta). 3 estrelas sem
dica; 2 sem ver a resposta; 1 com a resposta.

**Conferência pelo resultado** (`js/conferir.js`, passo 9). Roda o gabarito (traduzido
para o idioma da base) e compara os **resultados**:

- nomes de coluna **não** contam;
- a **ordem das colunas também não**: se as colunas do aluno são as mesmas, em outra
  ordem, vale — o `conferir.js` casa cada coluna esperada com uma coluna do aluno de
  mesmo conteúdo (decisão do passo 9, além do briefing);
- ordem das linhas só conta quando `conferir.ordem` é verdadeiro (o pedido fala em
  ordenar);
- números com `conferir.casas` casas (padrão 2), arredondados **exatamente como o
  `ROUND` do DuckDB** (conferido com 3.013 números: zero divergência) — assim quem usou
  `ROUND` e um gabarito que não usou comparam igual; 3 e 3.0 são iguais; o número 3 e o
  texto `'3'`, não;
- `exige: ['ORDER BY']` obriga um recurso, conferido na consulta (fora de textos e
  comentários): o resultado certo sem ele ouve "está certo, mas use…";
- ao errar, diz **como**, nesta ordem: colunas a mais ou a menos → linhas a mais,
  faltando ou vazio → qual coluna não bate → quantas linhas não são as esperadas →
  ordem. Singular e plural certos nos dois idiomas.

Para os módulos de SELECT (0 a 7 e 9), o gabarito roda na mesma base do aluno. O módulo 8,
que altera dados, vai precisar de uma conferência pelo estado da base depois do comando —
decisão para quando ele for escrito.

---

## Formato de uma missão (`dados/missoes/`)

Contrato entre conteúdo e código. Um arquivo por módulo; missões novas são criadas
copiando este molde. **O detalhe completo — campos, tipos, nomes canônicos dos recursos
e regras de conteúdo — está em `dados/missoes/MODELO.md`** (passo 9); aqui fica o
resumo:

```js
{
  id: 'm1-03',                       // módulo 1, missão 3 (formato a confirmar no passo 9)
  tipo: 'missao',                    // missao | revisao | desafio | projeto
  titulo: { pt: '…', en: '…' },
  personagem: 'kofi',
  pedido: { pt: '…', en: '…' },      // o pedido do personagem
  resumo: { pt: '…', en: '…' },      // uma linha que lembra o pedido, no conceito
  conceitosNovos: ['DISTINCT'],
  tabelas: ['countries'],            // sempre em inglês (a amostra do Pedido)
  conceito: { pt: '…', en: '…' },    // no máximo 80 palavras; "no exemplo ao lado" + peças
  exemplo: 'SELECT DISTINCT …',      // em inglês; traduzido na hora
  passoAPasso: { FROM: { pt, en }, SELECT: { pt, en } },  // uma frase por cláusula
  palpite: { pergunta: { pt, en }, opcoes: [ … ], correta: 1 },
  desafios: [
    {
      enunciado: { pt: '…', en: '…' },
      inicial: 'SELECT …',           // o começo já escrito (vazio na variação sem ajuda)
      gabarito: 'SELECT …',          // UMA vez, em inglês
      tabelas: ['countries'],        // as tabelas do gabarito (aparecem na barra da Consulta)
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

### As seis conferências automáticas (`dados/missoes/conferencia.js`)

Rodam sobre todas as missões escritas e **avisam no console** (nunca quebram a tela). As
3 a 6 (e a estrutura) rodam sempre que o site abre; as 1 e 2 precisam do motor e só
rodam com **`?conferencia`** no endereço, **na trilha** (`http://localhost:8030/?conferencia`)
— quem escreve missões abre assim. Dentro de uma missão elas não rodam: a missão zera a
base no meio das consultas. Testadas no passo 9 com um módulo de mentira cheio de erros
plantados: cada conferência pegou os seus.

1. **Todo gabarito roda** e devolve pelo menos uma linha.
2. **O gabarito traduzido dá o mesmo resultado** na base em português.
3. **Só comandos já ensinados** — a consulta de uma missão só usa os `conceitosNovos`
   dela somados aos de todas as missões anteriores.
4. **Nenhum conceito passa de 80 palavras** (nos dois idiomas).
5. **Todo texto tem `pt` e `en`**, e **toda tabela e coluna** usada está no
   `dicionario.js` — inclusive dentro dos selos (`` `nome_pais` ``) dos textos, no idioma
   certo (apelidos depois do `AS` ficam de fora).
6. **As tabelas de cada desafio** (`desafios[].tabelas`) são exatamente as que o gabarito
   usa (ajustes de design, rodada 2).

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
| `meridiano:config` | `idioma`, `tema` (`null` = escuro, o padrão; `'claro'` só por escolha), `mudo`, `formatoCsv` (`br`/`internacional`; `null` = seguir o idioma). `null` em qualquer campo = "ainda não escolheu" |
| `meridiano:progresso` | `{ versao: 1, missoes: { 'm0-01': { estrelas, dicas, viuResposta, concluida, vezes } }, liberados: ['m0', …] }` — `estrelas` é a **melhor** nota; `m0` sempre liberado (passo 13) |
| `meridiano:sequencia` | `{ atual, maior, ultimoDia }` — dias seguidos com missão concluída, no fuso de quem usa; na leitura, vira 0 se passou um dia inteiro sem missão |
| `meridiano:estatisticas` | `{ conceitos: { DISTINCT: 2, … } }` — quantas vezes cada conceito escapou (dica pedida ou conferência errada, uma vez por desafio); alimenta "conceitos que mais escapam" |
| `meridiano:nivelamento` | as respostas dos 6 desafios e o que foi liberado |
| `meridiano:laboratorio` | histórico (50 consultas), favoritas, a última consulta aberta |
| `meridiano:jogos` | o último jogo e nível escolhidos no menu |

O backup (passo 21) exporta e importa todas elas num JSON com **número de versão**, para
um backup antigo continuar entrando depois que o formato mudar.

**Fora do localStorage:** o motor SQL fica no Cache Storage, na gaveta
`meridiano:motor-<versão>` (passo 6). Não é progresso do aluno e não entra no backup.

**Vizinhança:** o digita e o meridiano moram no mesmo endereço
(`fernando-trajano.github.io`) e por isso dividem o mesmo `localStorage` e o mesmo Cache
Storage. Os prefixos `digita:` e `meridiano:` são o que impede um de ler ou apagar as
coisas do outro — nunca criar uma chave sem prefixo.

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
| 9 | `conferir.js` + formato da missão + `conferencia.js` + `MODELO.md` | Conferência pelo resultado dizendo como errou; as conferências no console (5 no passo 9; 6 desde a rodada 2 de design) |
| 10 | Conteúdo dos módulos 0 a 2 | 20 missões escritas · **🛑 revisão dos pedidos e gabaritos ANTES de escrever** |
| 11 | `raio-x.js` (virou `passo-a-passo.js` no redesenho) | A tabela viva, etapa por etapa |
| 12 | Tela de **missão** | As 7 etapas (6 desde o redesenho), dicas · **🛑 teste no Safari** |
| 13 | **Entrega** e `progresso.js` | Estrelas, números que contam, ponto da marca pulsando, desbloqueio |
| 14 | Tela de **trilha** | O bloqueio dos módulos (o visual chegou no redesenho; o progresso, no passo 13) |
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

## Passo 10 — como o conteúdo dos módulos 0 a 2 ficou

| Módulo | Missões | Conceitos novos, em ordem |
|---|---|---|
| 0 · Ingrid | 3 | `SELECT`/`FROM`/`*` · escolher colunas · desafio (o primeiro pedido da Nadia) |
| 1 · Kofi | 8 | `AS` · `DISTINCT` · contas · `\|\|` · `--` · `LIMIT` · revisão · desafio (a prévia do relatório de projetos) |
| 2 · Kofi | 9 | `WHERE` com `=` · comparações · `AND`/`OR`/`NOT` · `IN` · `BETWEEN` · `LIKE` · `IS NULL` · revisão · desafio (o paradoxo da energia) |

- O módulo 1 usa só as tabelas pequenas (ainda não há `WHERE`); o 2 entra em
  `pais_ano`.
- Os agregados aparecem de propósito em três entregas (grupo de renda vazio no m1-02,
  `NAC` no m2-02, `EMU`/`EUU`/`OED`/`HIC` no m2-03), preparando o `JOIN` do módulo 5.
- Temas reais e neutros: salários e crachás da equipe, emissões de CO₂, expectativa de
  vida por grupo de renda, a década da internet, estados insulares, o Gini que falta, o
  paradoxo "muita energia renovável, pouca eletricidade" (a lenha).
- O comentário do exemplo do m1-05 está nos dois idiomas (`-- All regions · Todas as
  regiões`): o tradutor não mexe em comentários.

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

### Medições no endereço real (24/09/2026)

No ar em **https://fernando-trajano.github.io/meridiano/** (repositório público).

**O que o GitHub Pages entrega** (medido com `curl`):

| Arquivo | Sem compressão | Transferido | Tipo |
|---|---|---|---|
| `duckdb-eh.wasm` | 34,2 MB | **7,84 MB** (gzip) | `application/wasm` ✓ |
| `duckdb-browser-eh.worker.js` | 773 KB | 190 KB | JavaScript |
| `indicator_values.csv` | 1,85 MB | 348 KB | `text/csv` |
| `country_year.csv` | 461 KB | 196 KB | `text/csv` |
| a página inteira, sem o motor | — | **121 KB** | — |

- Tudo que é texto vai comprimido (gzip); as fontes `.woff2` já vêm comprimidas.
- Cache: `max-age=600` (10 minutos) com `ETag`. Depois dos 10 minutos, o navegador
  pergunta se mudou, e a resposta "não mudou" (304) tem 0 bytes.

**No navegador** (painel do app, conexão do Mac do Fernando, página visível):

- primeira visita, do clique em "Rodar" ao resultado: **1,2 s** — 8,5 MB transferidos,
  download do motor em 0,3 s, motor pronto em 0,8 s, base montada em 0,2 s;
- **nenhuma requisição fora do domínio**; console limpo.

**Estimativa por velocidade de conexão** (8,5 MB + ~0,8 s para compilar e montar):

| Conexão | Primeira visita |
|---|---|
| 100 Mbps | ~1,5 s |
| 25 Mbps | ~3,5 s |
| 10 Mbps | ~7,5 s |
| 4G fraco (5 Mbps) | ~15 s |

**Achado:** no painel do app, o `.wasm` foi baixado de novo a cada visita, mesmo dentro
dos 10 minutos (os CSVs vieram do cache). O GitHub manda os cabeçalhos certos; o mais
provável é esse navegador não guardar um arquivo desse tamanho no cache HTTP.

**Cuidado ao medir:** com o painel do navegador escondido, o navegador desacelera a aba e
tudo fica 3 a 5 vezes mais lento — até o zerar da base, que não usa rede. Só vale a
medição feita com a página à vista (`document.visibilityState === 'visible'`).

### Decisão do Fernando: fica o DuckDB-WASM, com o motor guardado no navegador

O plano B (sql.js) foi descartado: pesaria ~0,5 MB, mas sem `QUALIFY`, `PIVOT` e
`DECIMAL`, com datas e divisão diferentes — os módulos 7 e 9 teriam de ser refeitos.

Para a segunda visita não depender do cache comum do navegador, o `bd.js` guarda o `.wasm`
no **Cache Storage** do site, numa gaveta com a versão no nome
(`meridiano:motor-1.32.0`):

- primeira visita: baixa com progresso e guarda;
- da segunda em diante: tira da gaveta, **sem nenhum pedido à rede**;
- cópia com tamanho errado (download interrompido): descartada e baixada de novo;
- gavetas de versões antigas do motor: apagadas sozinhas;
- sem armazenamento (modo privado, cota cheia): funciona igual, só baixa toda vez.

Os três casos foram testados no passo 6. Para atualizar o motor: trocar os arquivos de
`vendor/duckdb/`, e no `bd.js` o `TAMANHO_DO_MOTOR` e a `VERSAO_DO_MOTOR`, juntos.

O Safari apaga o armazenamento de sites que a pessoa não visita há mais de 7 dias; aí o
motor é baixado de novo, uma vez.

**Conferido no ar** depois do push: primeira visita baixou 7,6 MB e guardou o motor
inteiro; a segunda abriu da gaveta, sem nenhum pedido à rede e sem nada fora do domínio.

### Publicar uma versão nova — o que esperar

- Depois do *Push origin*, o GitHub leva **1 a 2 minutos** para publicar (dá para ver em
  *Actions → pages build and deployment*).
- Quem visitou o site há pouco pode continuar vendo a versão anterior por até
  **10 minutos**: é o tempo que o GitHub deixa o navegador guardar cada arquivo
  (`max-age=600`). Para conferir na hora, recarregar forçando (Cmd+Shift+R).
- O motor não entra nessa conta: ele só muda quando a `VERSAO_DO_MOTOR` muda.

---

## O motor, como ficou no passo 5

- **Versão:** DuckDB-WASM **1.32.0** (a última estável; as mais novas do npm são `-dev`),
  motor DuckDB v1.4.3. Só a variante **`eh`** (34 MB, ~7,6 MB comprimida): roda em
  Safari 15.2+, Chrome 95+ e Firefox 100+. Detalhes em `vendor/duckdb/VERSAO.md`.
- **Apache Arrow:** o `duckdb-browser.mjs` importa `"apache-arrow"` pelo nome. Um *import
  map* no `index.html` aponta esse nome para `vendor/arrow/arrow.mjs`, uma ponte que
  carrega o arquivo único do Arrow 17.0.0. Nenhum arquivo baixado foi editado. O import
  map exige **Safari 16.4+** (março de 2023) — é o navegador mais antigo que o site aceita.
- **Progresso real:** o `bd.js` baixa o `.wasm` ele mesmo, contando os bytes, e entrega
  ao motor um endereço local (blob). A barra anda contra o tamanho sem compressão.
- **Tipos fixos:** cada coluna tem `tipo` no `dicionario.js`, e o `bd.js` lê o CSV com
  esses tipos — nada é adivinhado. População e PIB são `BIGINT` (8 bilhões não cabem em
  `INTEGER`); dinheiro do instituto é `DECIMAL`.
- **Zerar:** cada missão ganha um banco novo em memória (`ATTACH ':memory:' AS
  observatorio`); o anterior sai inteiro com `DETACH`, junto com o que o aluno criou.
  Objetos temporários e transações abertas também são limpos. Leva ~170 ms.
- **Idioma:** trocar o idioma da tela zera a base com os nomes do outro idioma e avisa
  com o evento `base-recarregada`.
- **Tradução de SQL:** `traducao-sql.js`. Para ser de mão dupla sem ambiguidade, cada nome
  precisa de um só par — por isso `projects.theme` virou **`projects.topic`** (em PT
  continua `tema`, como `indicators.topic`). `conferirMapa()` avisa no console se um dia
  aparecer um nome ambíguo.
- **Medições locais** (no Mac, sem rede): abertura completa em ~0,6 s; consulta de
  exemplo em 17 ms. As medições de verdade são as do passo 6.

## A tela de missão, como ficou no passo 12

> **Atenção:** o layout abaixo foi **substituído** no "Redesenho depois do passo 12" e nos
> "Ajustes de design — rodada 2" (seções no fim deste arquivo). Continuam valendo: o
> roteador, as dicas, as estrelas, a troca de idioma no meio e a base zerada.

- **Endereço:** `#/missao/m1-03`. O roteador (`roteador.js`) troca as telas pelo `#`: o
  botão Voltar funciona, dá para mandar o link de uma missão, e o foco vai para o título
  da tela nova. Uma missão que não existe mostra um aviso; um endereço qualquer cai no
  início.
- **Duas colunas:** história à esquerda (40%) — o memorando sempre no topo, a etapa de
  agora embaixo —; bancada à direita — tabelas, dados, Raio-X, editor e resultado. Em
  tela estreita, uma coluna só e um aviso discreto recomendando o computador.
- **As etapas** aparecem numa barra no topo, a de agora marcada na cor de destaque
  (item ativo); dá para voltar a uma etapa já vista, mas não pular para a frente — um
  desafio só libera a etapa seguinte quando a conferência diz "certo".
- **Tipos:** `missao` tem as 7 etapas; `revisao` e `desafio` vão do pedido direto aos
  desafios (Desafio 1, 2, 3).
- **Palpite:** a escolhida errada fica riscada, a certa marcada, e o exemplo roda de
  verdade ao lado.
- **Dicas:** pista → esqueleto → resposta, com confirmação antes da resposta ("vale 1
  estrela") e um botão para levá-la ao editor.
- **Estrelas:** o maior degrau de dica usado em qualquer desafio da missão — nenhum = 3,
  pista ou esqueleto = 2, resposta = 1. Salvar, animar e desbloquear é o passo 13.
- **Idioma no meio da missão:** os textos trocam no lugar; o editor traduz a consulta
  sozinho; cada consulta guardada lembra em que idioma está e é traduzida ao voltar a
  ela; o resultado roda de novo.
- **Base zerada** ao entrar em cada missão.
- A bancada provisória saiu; o `index.html` voltou a ter só a reserva da abertura.

## O editor, o resultado e os erros, como ficaram no passo 7

- **Editor** (`editor.js`): um `<textarea>` de verdade, com o texto transparente, por
  cima de uma cópia colorida (`<pre>`). Desfazer, colar, acentos compostos e leitores de
  tela ficam com o navegador. As três camadas (números, realce, texto) dividem as
  medidas definidas no topo do `editor.css` — mudar uma sem as outras desalinha o cursor.
  Tudo o que o editor escreve (sugestão, comentário, formatar, tradução) passa por
  `insertText`, e por isso entra no Cmd+Z.
- **Atalhos:** Cmd/Ctrl+Enter roda; Cmd/Ctrl+/ comenta (aceita a barra do teclado
  americano e a do ABNT2, `IntlRo`); Tab/Shift+Tab recuam; Enter mantém o recuo; Esc e
  depois Tab saem do editor (para quem navega só pelo teclado).
- **Autocompletar:** a partir de 2 letras; colunas das tabelas que já estão na consulta
  primeiro, depois tabelas, outras colunas, palavras-chave e funções. Depois de `c.`, só
  as colunas da tabela que `c` apelida. Nada dentro de texto entre aspas nem de
  comentário.
- **Realce:** `QUALIFY` leva a cor do `WHERE` (os dois filtram) — o briefing não diz a
  cor dele; decisão do passo 7.
- **Formatar** (`formatar-sql.js`): só mexe em espaços, quebras de linha e maiúsculas.
  Conferido com 7 consultas (subconsulta, WITH, janela com QUALIFY, FILTER, BETWEEN,
  dois comandos): o resultado formatado é igual ao original, e formatar de novo não muda
  nada.
- **Resultado** (`tabela-resultado.js`): valores crus, como um banco mostraria —
  1438069596, sem separador de milhar, porque é assim que se escreve num `WHERE`;
  `DECIMAL` com as casas dele; `NULL` escrito; até 200 linhas na tela, com o total dito.
- **Erros** (`erros-sql.js`): frase simples + pista, em PT e EN, com a linha marcada na
  margem do editor e a mensagem original guardada num "ver mais". As mensagens foram
  colhidas do DuckDB 1.4 de verdade. As pistas usam o dicionário: o nome certo no outro
  idioma, a tabela onde a coluna mora, a palavra em português que virou SQL (`ONDE` →
  `WHERE`, `contar` → `COUNT`), o erro de digitação mais provável (`SELEC` → `SELECT`).
  26 erros típicos de iniciante conferidos; um erro desconhecido cai numa frase genérica
  com a mensagem original, nunca quebra a tela.
- **Bancada de teste:** continua, agora com as peças de verdade, até a tela de missão
  (passo 12).

**Correções depois do passo 8** (achadas pelo Fernando usando o editor):

- **Cursor desalinhado do texto.** Clicar numa letra punha o cursor uma ou duas letras
  antes, e apagar levava a letra errada. A causa: a regra geral `code { font-size:
  0.9em }` do `base.css` deixava a camada colorida em 12,6 px, e o texto de verdade em
  14 px — a diferença crescia uma letra a cada dez. Corrigido com `.editor-realce code {
  font: inherit }`; medido depois: 0 letra de diferença até a coluna 151. O editor agora
  confere, ao abrir, se as duas camadas têm a mesma fonte, tamanho, altura de linha e
  espaçamento, e avisa no console se não tiverem.
- **Números das linhas sem rolar.** Numa consulta maior que a caixa (mais de 18 linhas), a
  coluna dos números crescia em vez de rolar com o texto. Agora ela tem a altura da
  caixa, e as três camadas rolam juntas até o fim.

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
6. **Conferências de conteúdo** — as 6 passam no console (abrir `?conferencia` na trilha).
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
      Coleta em 24/09/2026: 234 países, 5.616 linhas país × ano, 60.478 valores (59.454
      antes da correção dos grupos de renda, no passo 10); instituto
      conferido (nenhuma data incoerente, 20 pagamentos em dobro, 19 projetos em aberto,
      hierarquia de 4 níveis)
- [x] **Passo 5** — DuckDB-WASM 1.32.0 (variante `eh`) + Apache Arrow 17.0.0 em
      `vendor/`, `bd.js`, `traducao-sql.js`, tela "Abrindo o observatório..." e bancada
      de teste provisória · ✅ **testado no Safari pelo Fernando**: o motor abre, a
      consulta roda nos dois idiomas, o erro aparece, trocar o idioma zera a base e
      Cmd+Enter roda. `projects.theme` virou `projects.topic`
- [x] **Passo 6** — publicação no GitHub Pages e medição ✅ **no ar em
      https://fernando-trajano.github.io/meridiano/** (repositório público). Motor de
      7,8 MB comprimido, ~1,2 s na primeira visita; nenhuma requisição fora do domínio.
      **Decisão do Fernando: fica o DuckDB-WASM**, com o motor guardado no Cache Storage
      — conferido no ar: a segunda visita não baixa nada
- [x] **Passo 7** — editor (`editor.js`, `realce.js`, `formatar-sql.js`), resultado
      (`tabela-resultado.js`) e erros traduzidos (`erros-sql.js`) · ✅ **testado no
      Safari pelo Fernando**: rodar, acentos, autocompletar, atalhos, desfazer, formatar,
      erro traduzido com a linha marcada e colar. A bancada de teste continua até o
      passo 12
- [x] **Passo 8** — `armazenamento.js` e `estado.js`, adaptados do digita: idioma e tema
      sobrevivem ao recarregar, com a regra do tema do digita (a última mudança vale, o
      sistema é a referência); gaveta corrompida é descartada sem quebrar a tela.
      `meridiano:config` já nasce com `mudo` e `formatoCsv`, para os passos 17 e 21
- [x] **Passo 9** — `conferir.js` (conferência pelo resultado, dizendo como errou),
      `dados/missoes/indice.js` (os 10 módulos), `dados/personagens.js`,
      `conferencia.js` (as 5 conferências) e `MODELO.md`. A bancada ganhou um desafio de
      teste com o veredito embaixo do resultado
- [x] **Passo 10** — conteúdo dos módulos 0 a 2: 20 missões, 39 desafios
      (`primeiro-dia.js`, `escolher-colunas.js`, `filtrar-linhas.js`). **A pausa de
      revisão foi dispensada pelo Fernando** ("pode fazer, não precisa me apresentar").
      As 5 conferências passam sem aviso; todo número citado em entrega e palpite foi
      conferido na base; os 39 gabaritos dão o mesmo resultado em PT e EN. No caminho:
      corrigidos os grupos de renda vazios no `baixar_dados.py`, o `=` virou recurso
      próprio (separado das outras comparações) e as dicas passaram a aceitar SQL
- [x] **Passo 11** — `raio-x.js` e `raio-x.css`: cada etapa é o resultado real do
      motor; animações de filtro (apagam / ganham a cor do WHERE), colunas (SELECT),
      fusão (DISTINCT), deslize (ORDER BY), corte (LIMIT) e blocos (GROUP BY), numa
      mecânica só (FLIP); 12 linhas na tela, com mistura de "passa / não passa" antes de
      um filtro; sem animação com movimento reduzido; troca de idioma refaz a etapa no
      lugar. Exemplos e etapas com apelido ou comentário agora podem vir como `{ pt, en }`
      (m1-01, m1-03 e m1-05 reescritos). A linha ligando as chaves do JOIN fica para
      quando o módulo 5 for escrito. A bancada ganhou um seletor com o Raio-X das 15
      missões que o têm
- [x] **Passo 12** — tela de missão (`telas/missao.js`), roteador (`roteador.js`) e
      início provisório com a lista das missões; a bancada de teste saiu · ✅ **testado
      no Safari pelo Fernando**: as 7 etapas, palpite, desafio certo e errado, as 3 dicas
      com confirmação, entrega com estrelas, troca de idioma no meio e o botão Voltar

### Redesenho depois do passo 12

O layout do passo 12 ficou desproporcional. Antes do passo 13, a missão, o Raio-X e a
trilha foram redesenhados a partir de três modelos em HTML (aprovados e depois apagados de
`rascunhos/referencial/`). Testado no Safari pelo Fernando.

- [x] **Tipografia e tema** — sai a Source Serif 4 (arquivos, `@font-face`, preload); tudo
      na fonte do sistema, títulos a 600 com `-0.02em`; mono só em código, números,
      códigos e NULL. O site abre no **escuro**; o claro vale só por escolha, salva em
      `meridiano:config`. Tokens novos: `--cor-painel` e `--cor-codigo`
- [x] **Cabeçalho numa linha** — marca · contexto discreto ("Módulo 0 · Missão 2 de 3") ·
      PT · EN · tema · Sair (`js/cabecalho.js`)
- [x] **Missão em 6 etapas** — pedido · conceito · palpite · tente você · sem ajuda ·
      entrega, na linha do meridiano horizontal (só as visitadas clicáveis); texto à
      esquerda (no máximo 3 coisas por etapa, um só botão principal), bancada à direita
      num painel; o personagem aparece só no Pedido; saíram "Do começo" e "Etapa
      anterior"; cabe em 1280×800 sem rolar a página. Campo novo `resumo` nas 15 missões
      do tipo `missao`
- [x] **Passo a passo** no lugar do Raio-X (renomeado em todo lugar; `raioX` →
      `passoAPasso`, com uma frase por cláusula): código na ordem normal, destaque na
      ordem do banco, efeito calculado numa amostra de 5 a 8 linhas
- [x] **Tabelas** — fonte do sistema a 13px, mono só em número/código/NULL, números à
      direita, uma linha por registro com "…" e `title`, layout fixo, sem listras,
      rolagem lateral só quando não cabe
- [x] **Trilha** (o visual do passo 14) — título, Continuar com a próxima missão, linha do
      meridiano vertical com um traço por módulo, acordeão (o módulo atual aberto; "em
      breve" apagado), pontos por missão, painel à direita. O início provisório saiu: o
      início leva à trilha
- [x] **Módulo 4:** sai do plano a missão separada sobre "a ordem em que o banco lê" — o
      Passo a passo mostra isso em toda missão. Fica só uma explicação curta de por que um
      apelido do `SELECT` não funciona no `WHERE`
- [x] Corrigido: trocar o idioma e abrir outra missão ao mesmo tempo misturava as
      recargas da base — agora elas entram numa fila (`bd.js`)

### Ajustes de design — rodada 2

Ajustes finos pedidos pelo Fernando depois do redesenho. Testado no Safari pelo Fernando.

- [x] **Globo** da tela de carregamento refeito: elipses sempre centradas, giro pela
      largura (`rx = 80 × |cos(θ + defasagem)|`) em `requestAnimationFrame`, tudo recortado
      pelo círculo; parado com movimento reduzido
- [x] **Foco:** sem anel no título que recebe foco pelo código (`[tabindex="-1"]`); abas
      da bancada sem seleção de texto
- [x] **Tabelas visíveis:** cada desafio declara `tabelas`; 6ª conferência automática;
      cabeçalho nunca cortado (cada coluna com pelo menos a largura do nome; número,
      código e data com a largura do maior valor); esqueleto e resposta formatados
- [x] **Selos:** código no texto corrido entre crases vira selo; textos das 20 missões e
      do i18n marcados; os 15 conceitos reescritos ("no exemplo ao lado" + peças)
- [x] **Escuro:** só os brancos esquentaram
- [x] **Claro refeito:** branco, bancada e flutuantes em vidro (única exceção a "sem
      sombras e sem desfoque"), destaque em duas versões (linha/texto), `GROUP BY` coral;
      a linha ativa do Passo a passo acende em vez de escurecer, para manter 4,5:1
- [x] **Barra da Consulta:** Consulta · tabelas (pontilhado, lista de colunas flutuante,
      "ver 5 linhas") · ícone Formatar (⇧⌥F) · Rodar (com o atalho no `title`)
- [x] Conferência com o motor só na trilha (dentro de uma missão dava avisos falsos)

- [x] **Passo 13** — entrega e progresso: `progresso.js` (conclui a missão guardando a
      melhor nota, conta a sequência de dias, o desafio final libera o módulo seguinte,
      registra os conceitos que escaparam) e `movimento.js` (números que contam, pulso
      do ponto da marca, tudo parado com movimento reduzido). A entrega mostra as
      estrelas chegando uma a uma, "Missões x de 77" e "Sequência" contando do antes
      para o depois, "Módulo N liberado" e, ao refazer com nota menor, que a melhor
      continua valendo. A trilha passou a ler o progresso de verdade (pontos, "2 de 3",
      sequência, conceitos com nomes legíveis) e se redesenha quando ele muda. O
      **bloqueio** dos módulos na trilha é o passo 14
- [x] **Passo 14** — trilha: o bloqueio dos módulos. Um módulo só libera as missões
      depois do desafio final do anterior (o módulo 0 sempre aberto); bloqueado, ele
      mostra "9 missões" no tom discreto e, aberto, lista as missões apagadas e sem link,
      com "Abre quando você concluir o desafio final do módulo N". O Continuar só aponta
      para missões liberadas. Uma missão bloqueada aberta pelo endereço mostra o aviso,
      sem carregar o motor; na entrega, "Próxima missão" vira "Voltar à trilha" se a
      seguinte estiver fechada. (O visual, o progresso e a sequência chegaram antes: no
      redesenho e no passo 13.) Dentro de um módulo liberado, as missões ficam livres,
      em qualquer ordem
- [x] **Passo 15** — entrada e nivelamento. **Entrada** (`#/entrada`): o globo, quem você
      é no Observatório, três fatos e dois caminhos — a primeira missão ou "Já sei um
      pouco de SQL"; sem motor. "#/" mostra a entrada a quem nunca concluiu nada (nem
      missão, nem nivelamento), e a trilha aos outros. **Nivelamento** (`#/nivelamento`,
      conteúdo em `dados/nivelamento.js`): 6 desafios, um por módulo (0 a 5); cada acerto
      libera o módulo seguinte (até o 6), "Não sei fazer este" encerra, sem dicas; a
      mesma moldura da missão; o resultado diz até onde a trilha abriu e sugere por onde
      seguir. Guardado em `meridiano:nivelamento`; o que já estava liberado nunca fecha.
      As conferências automáticas passaram a cobrir o nivelamento (gabaritos nas duas
      bases, nomes, selos, tabelas). "Por onde seguir" (trilha e nivelamento) passou a
      ser a primeira missão não feita do módulo liberado **mais adiantado**. A bancada
      de Consulta virou um módulo só (`bancada-consulta.js`), usado pela missão e pelo
      nivelamento. **Defeito corrigido** (vinha do passo 9): a conferência comparava só
      as 200 linhas mostradas na tela — uma resposta certa com mais linhas (a m1-01 tem
      234 países) parecia "faltar linhas"; agora compara o resultado inteiro.
      **Ajuste da entrada** (pedido depois do passo): duas colunas em tela larga (texto
      58% · globo 42%, até 220px); globo em cima em tela estreita (120px); o globo
      (o mesmo componente da tela "Abrindo o observatório...") ganhou a opção
      `linhaMeridiano`, ligada só na entrada: o meridiano da marca, uma linha vertical
      no destaque; título e textos novos
- [x] **Passo 16** — início (`telas/inicio.js`): a tela de quem volta — "#/" mostra a
      entrada a quem nunca concluiu nada e o início aos outros (a trilha ficou em
      `#/trilha`; o "Voltar à trilha" da missão e do nivelamento aponta para lá). Em
      cima, o **Continuar**: "Você parou em", a próxima missão, o módulo e "1 de 3
      feitas". Embaixo, os **atalhos** — trilha, nivelamento e, "em breve", laboratório,
      cola e jogos — com o gesto do digita (o texto escurece e desliza 4px) e um
      **desenho ao lado que troca com cross-fade** (fachada do instituto quando nenhum
      está em foco; pino na rota, avião de papel, gráfico de linha, documento, grade de
      pontos — `ilustracao()` em `ilustracoes.js`); no celular, sem o desenho. À direita,
      o **painel de progresso**, que virou um componente (`painel-progresso.js`) usado
      pelo início e pela trilha. O exportar/importar do progresso fica no passo 21
      (backup), e vai morar nesta tela.
      **Ajuste do início** (pedido depois do passo): a hierarquia do digita (título
      grande, "Você parou em" colado, "Continuar de onde parei"); "Ir para" com os
      atalhos em cartões numa grade de 3 colunas iguais; sem a ilustração; painel
      próprio "Seu progresso" (números grandes, legendas, conceitos em selos); no tema
      claro, e só nesta tela, borda do cartão mais marcada e descrição na cor discreta.
      Depois, o painel "Seu progresso" do início virou o **componente único**
      (`painel-progresso.js`), usado também pela trilha. Por fim, **a moldura única**
      (`moldura.js`, a do digita): início e trilha montam a página por ela — mesma
      grade (centro + painel de 14rem, `sticky`), mesmo título (`h1.moldura-titulo`),
      mesmo padding — e nada "pula" ao trocar de tela; `scrollbar-gutter: stable` no
      `html`; as classes do painel no padrão do digita
- [ ] **Passo 17** — laboratório
- [ ] **Passo 18** — cola
- [ ] **Passo 19** — menu de jogos e Palpite
- [ ] **Passo 20** — Telegrama e Infiltrado
- [ ] **Passo 21** — sons, backup, transições, telas estreitas, rodapé com a fonte,
      polimento

## Conteúdo escrito

- [x] Módulo 0 — Primeiro dia no observatório — 3 (Ingrid)
- [x] Módulo 1 — Escolher colunas — 8 (Kofi)
- [x] Módulo 2 — Filtrar linhas — 9 (Kofi)
- [ ] Módulo 3 — Ordenar e transformar — 10 *(depois da v1)*
- [ ] Módulo 4 — Resumir e agrupar — 8 *(depois da v1)*
- [ ] Módulo 5 — Juntar tabelas — 9 *(depois da v1)*
- [ ] Módulo 6 — Consultas dentro de consultas — 8 *(depois da v1)*
- [ ] Módulo 7 — Análise moderna — 10 *(depois da v1)*
- [ ] Módulo 8 — Criar e alterar dados — 8 *(depois da v1)*
- [ ] Módulo 9 — Relatório anual — 4 *(depois da v1)*

**20 de 77 missões.**
