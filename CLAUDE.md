# meridiano. — memória do projeto

Este arquivo é a fonte da verdade do projeto. A **Parte 1** é o briefing original, como
foi escrito pelo Fernando. A **Parte 2** são as decisões e convenções combinadas depois.
A **Parte 3** lista o que **não** deve ser construído na versão 1.

> ## ⚠️ Antes de qualquer trabalho: consulte o [PLANO.md](PLANO.md)
>
> O `CLAUDE.md` diz **o quê**; o `PLANO.md` diz **como** e em **que ordem** — a estrutura
> de arquivos, o formato das missões, as conferências automáticas, as chaves do
> `localStorage`, os 21 passos, as pausas (🛑) para revisão e teste no Safari e as regras
> de publicação.
>
> **Ao concluir um passo, marcar a caixa correspondente** na seção "Estado dos passos", no
> fim do `PLANO.md`, junto com as outras mudanças do passo. Se o plano mudar durante a
> construção, atualizar o `PLANO.md` — ele não pode ficar desatualizado em relação ao
> código.
>
> **Projeto de referência:** o digita. (`/Users/fernando/Documents/ClaudeCode/Digita`),
> já publicado. O meridiano. segue as mesmas convenções e o mesmo ritmo de trabalho, com
> **uma diferença importante: aqui o Claude não roda nenhum comando de Git** (ver Parte 2).

---

# PARTE 1 — BRIEFING DO PROJETO: meridiano.

## O PROJETO

Curso de SQL interativo e gratuito, para o portfólio do Fernando.

O aluno entra como analista de dados do **"Observatório Meridiano"**, um instituto de
pesquisa fictício em Genebra. Cada lição é uma **"missão"**: um pedido de um pesquisador,
resolvido com SQL de verdade rodando no navegador, sobre dados reais de países.

- **Público:** iniciante total.
- **Idiomas:** site em português e inglês.
- **Subtítulo:** "SQL de verdade, com dados do mundo real" / "Real SQL, real-world data".

## TECNOLOGIA

- Igual ao digita: HTML, CSS e JS puro, módulos ES, sem build, GitHub Pages, repositório
  público, UTF-8, comentários e nomes de arquivo em português, caminhos relativos. **Nada
  de TypeScript, React ou Tailwind.**
- **Dependência externa única:** DuckDB-WASM (`@duckdb/duckdb-wasm`), com os arquivos
  **dentro do repositório** em `vendor/duckdb/`, **versão fixada**. Nada de CDN. Quem
  visita não instala nada.
- Carregar o motor **só nas telas que usam SQL** (missão, laboratório, jogos), com a tela
  **"Abrindo o observatório..."** e um globo de traço girando devagar. **Medir peso e
  tempo de carga no endereço real.** Plano B se ficar lento: **sql.js** (SQLite).
- `servidor.py` do digita + MIME `application/wasm` para `.wasm`.
- **Cada missão começa com a base zerada.**
- Reaproveitar e adaptar do digita: `i18n.js` (`data-i18n`, `pt.js`/`en.js` com as mesmas
  chaves), `armazenamento.js`, `estado.js`, `exportacao.js`, `som.js`, a moldura das
  telas, o acordeão da trilha, o painel de progresso à direita e o hover da lista (texto
  escurece, desliza 4px, ilustração com cross-fade).

## VISUAL

Conceito: **"de dia, tinta no papel; à noite, estrelas no céu".**

Mantém do digita: `tema.css` como **único arquivo com cores**, sem sombras, sem
gradientes, sem caixas em volta das seções (espaço e linha fina), largura máxima de
**1100px**, laterais vazias, marca em minúsculas com ponto que volta ao início.

**Modo claro:**

| Elemento | Cor |
|---|---|
| Fundo | `#FFFFFF` |
| Superfície | `#F4F4F5` |
| Bordas | `#E4E4E7` |
| Texto | `#18181B` |
| Texto secundário | `#52525B` |
| Texto discreto | `#71717A` |
| **Destaque** (tinta azul) | `#1F3A93` |
| Botão principal | fundo `#18181B`, texto `#FFFFFF` |
| Botão secundário | borda `#D4D4D8`, texto `#18181B` |
| Erro | fundo `#FEE2E2`, texto `#B91C1C` |

**Modo escuro:**

| Elemento | Cor |
|---|---|
| Fundo | `#0E1726` |
| Superfície | `#16213A` |
| Bordas | `#26324D` |
| Texto | `#E6EBF2` |
| Texto secundário | `#AAB4C5` |
| Texto discreto | `#7F8AA0` |
| **Destaque** (âmbar) | `#E9B44C` |
| Botão principal | fundo `#E6EBF2`, texto `#0E1726` |
| Botão secundário | borda `#7F8AA0`, texto `#E6EBF2` |
| Erro | fundo `#5B1F2A`, texto `#F7C1C1` |

**O destaque tem uma função só:** progresso, item ativo, link e o ponto da marca. **Uma
cor de destaque por modo, nenhuma outra.**

**Cor por cláusula** — só **dentro do código** (editor, Raio-X, cola, jogos), só na **cor
das letras, sem fundo**:

| Cláusula | Claro | Escuro |
|---|---|---|
| `SELECT` | `#6A4BB5` | `#B9A8F0` |
| `FROM` e `JOIN` | `#2563A6` | `#8DB6E0` |
| `WHERE` | `#1F7A6E` | `#7FD1C0` |
| `GROUP BY` e `HAVING` | `#A0620F` | `#F0997B` |
| `ORDER BY` e `LIMIT` | `#A33A5B` | `#EE9CB6` |
| `WITH` e `OVER` | `#4D7A1F` | `#B5D98A` |
| Funções, textos e números | cor do texto secundário | cor do texto secundário |

**Medir o contraste de todos os pares e mostrar ao Fernando antes de aplicar.**

**Tipografia:**

| Uso | Fonte | Alternativa |
|---|---|---|
| Títulos e marca | **Source Serif 4** | Newsreader |
| Texto e interface | fonte do sistema (`system-ui`), como no digita | — |
| Código, resultados e números | **JetBrains Mono**, sem ligaduras | IBM Plex Mono |

Arquivos `.woff2` dentro de `fontes/`, com as licenças OFL, **só os pesos usados**,
`font-display: swap`.

**Movimento:**

- a **"linha do meridiano"**: linha vertical fina com marquinhas de grau ao lado da
  trilha, que se preenche na cor de destaque conforme o progresso;
- **View Transitions** entre telas, com recuo sem animação onde não houver suporte;
- **Raio-X animado**;
- **números que contam** na entrega da missão;
- **ilustrações de traço** em SVG com `currentColor` (globo com meridianos, mapa em
  pontos, fachada do instituto, pino, avião, documento, gráfico de linha);
- o **ponto da marca pulsa uma vez** ao concluir uma missão;
- tudo respeita **`prefers-reduced-motion`**.

**Sem bandeiras e sem mapas com fronteiras.** Personagens como **monogramas cinza**. O
pedido aparece como **memorando**: nome (na serifada), cargo e hora numa linha fina.

## METODOLOGIA — A MISSÃO (8 a 12 min)

1. **O pedido** (memorando)
2. **Olhe os dados** (5 linhas)
3. **O conceito**: exemplo mínimo, no máximo **80 palavras**, e o **RAIO-X** — tabela viva
   etapa por etapa na ordem lógica `FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY →
   LIMIT`; linhas que não passam no `WHERE` apagam, as que passam ganham fundo translúcido
   da cor do `WHERE`; `GROUP BY` junta em blocos; `JOIN` liga as chaves com uma linha fina
4. **Palpite** (3 opções antes de rodar)
5. **Tente você** (editor com o começo escrito)
6. **Variação sem ajuda** (editor vazio)
7. **Entrega** (resposta do personagem e estrelas)

Regras:

- **Um conceito novo por missão**; SQL de verdade desde a primeira missão; pedidos sobre
  **temas reais** (desigualdade, clima, energia, saúde).
- **Dicas em 3 degraus:** pista, esqueleto, resposta.
- **Estrelas:** 3 sem dica, 2 sem ver a resposta, 1 com a resposta.
- **Conferência pelo RESULTADO, não pelo texto:** ordem só conta se o pedido fala em
  ordenar; nomes de coluna não contam; números com 2 casas; a missão pode exigir um
  recurso. Ao errar, dizer **COMO** errou (linhas a mais, faltando, coluna diferente,
  ordem).
- **Erros do DuckDB traduzidos** para uma frase simples com pista, em PT e EN.
- Todo módulo: **missões → revisão misturada → desafio final**, que libera o próximo.

## TRILHA (10 módulos, 77 missões)

| # | Módulo | Missões | Personagem | Conceitos |
|---|---|---|---|---|
| 0 | Primeiro dia no observatório | 3 | Ingrid | — |
| 1 | Escolher colunas | 8 | Kofi | `SELECT`, `*`, apelidos, `DISTINCT`, contas, `\|\|`, comentários, `LIMIT` |
| 2 | Filtrar linhas | 9 | Kofi | `WHERE`, comparações, `AND`/`OR`/`NOT`, `IN`, `BETWEEN`, `LIKE`, `IS NULL` |
| 3 | Ordenar e transformar | 10 | Lucía | `ORDER BY`, texto, número, data, `CAST`, `COALESCE`, `CASE WHEN` |
| 4 | Resumir e agrupar | 8 | Amélie | agregações, `GROUP BY`, `HAVING`, ordem lógica |
| 5 | Juntar tabelas | 9 | Tomasz | chaves, `INNER`, `LEFT`, várias tabelas, muitos-para-muitos, self join |
| 6 | Consultas dentro de consultas | 8 | Tomasz | subconsultas, `EXISTS`, `ALL`, correlacionadas, `UNION`/`INTERSECT`/`EXCEPT` |
| 7 | Análise moderna | 10 | Nadia | `WITH`, `ROW_NUMBER`, `RANK`, `LAG`/`LEAD`, total acumulado, média móvel, `QUALIFY`, `PIVOT`, `WITH RECURSIVE` |
| 8 | Criar e alterar dados | 8 | Hiroshi | `CREATE TABLE`, restrições, `INSERT`, `UPDATE`, `DELETE`, transações, `VIEW` |
| 9 | Relatório anual | 4 | Nadia | projeto final sobre transição energética |
| | **Total** | **77** | | |

`JOIN` **sempre** com `JOIN ... ON`. A sintaxe do Oracle (vírgula + `(+)`, `DECODE`,
`NVL`, `ROWNUM`) aparece **só na cola**, em "em outros bancos".

## BASE DO OBSERVATÓRIO MERIDIANO

**MUNDO** — real: Banco Mundial, *World Development Indicators*, **CC BY 4.0**, 2000 a
2023.

| Tabela | Linhas | O que é |
|---|---|---|
| `regions` | 7 | regiões |
| `countries` | ~260 | países, **incluindo agregados** como *World* e *Euro area* — armadilha de propósito |
| `indicators` | 12 | os indicadores usados |
| `country_year` | ~6.300 | país × ano: população, PIB, PIB per capita, expectativa de vida, CO₂ per capita, % renovável, % internet... |
| `indicator_values` | ~75.000 | os mesmos dados em formato longo |

**INSTITUTO** — inventado, com **semente fixa**:

| Tabela | Linhas | Detalhe |
|---|---|---|
| `staff` | 60 | com gestor |
| `projects` | 80 | alguns sem data de fim |
| `disbursements` | 1.500 | com alguns duplicados |
| `missions` | 400 | |
| `publications` | 150 | |
| `authorships` | 300 | muitos-para-muitos |

- `ferramentas/baixar_dados.py` (Python 3.9, só biblioteca padrão) baixa **UMA vez** pela
  API do Banco Mundial e salva `dados/base/mundo/*.csv` com a **data da coleta** (plano B:
  CSVs do site).
- `ferramentas/gerar_instituto.py` gera `dados/base/instituto/*.csv`, coerente com os
  dados reais.
- `dados/base/dicionario.js`: cada tabela e coluna com nome e descrição em PT e EN.

**BASE NOS DOIS IDIOMAS:** os CSVs ficam em inglês; o `bd.js` cria as tabelas com os nomes
do idioma da tela (`paises.nome_pais` / `countries.country_name`). Trocar de idioma
recarrega a base e traduz a consulta do editor. Gabaritos escritos **UMA vez, em inglês**,
e traduzidos pelo `traducao-sql.js` (só nomes de tabela e coluna, **nunca o que está entre
aspas**). Valores (nomes de países) ficam em inglês.

**Personagens:**

| Nome | Cargo |
|---|---|
| Ingrid Solberg | coordenadora de pesquisa |
| Kofi Mensah | economista |
| Lucía Ferreyra | clima e energia |
| Amélie Laurent | relações institucionais |
| Tomasz Nowak | projetos de cooperação |
| Hiroshi Tanaka | engenheiro de dados |
| Nadia Haddad | diretora-geral |

- **Fonte citada** no rodapé do site e nos READMEs.
- **Neutralidade:** pedidos sobre indicadores, nunca tomando partido entre países.
- **Nada do trabalho atual do Fernando entra no site.**

## TELAS

| Tela | O que tem |
|---|---|
| **Entrada** | |
| **Nivelamento** | 6 desafios |
| **Início** | continuar, atalhos com hover e ilustração, exportar/importar |
| **Trilha** | acordeão + linha do meridiano |
| **Missão** | história à esquerda (40%); editor em cima e resultado embaixo à direita (60%) |
| **Laboratório** | |
| **Cola** | |
| **Jogos** | |

**Painel à direita** no início e na trilha: sequência de dias, missões de 77, conceitos
que mais escapam.

**Celular:** funciona para ler, cola e Palpite; na missão e no laboratório, **aviso
discreto** recomendando o computador, **sem bloquear**.

## FERRAMENTAS

- **Laboratório:** editor na base inteira; importar CSV (vira tabela com o nome do
  arquivo, só na memória, com aviso); exportar resultado em CSV (em PT: formato do Excel
  brasileiro, com `;` e vírgula decimal e BOM UTF-8; em EN: internacional; dá para
  trocar); copiar como tabela; histórico de 50; favoritas; link com a consulta no
  endereço.
- **Cola:** sintaxe por cláusula (exemplo que abre no laboratório), funções, mapa
  clicável das 11 tabelas nos dois idiomas, os indicadores explicados, "em outros bancos"
  (Oracle e BigQuery), glossário PT↔EN, atalho de teclado.
- **Editor:** realce por cláusula, autocompletar, `Cmd/Ctrl+Enter` roda, `Cmd/Ctrl+/`
  comenta, botão de formatar.
- **Backup** do progresso em JSON com número de versão.

## JOGOS (na versão 1)

- **Palpite:** tabela pequena + consulta, escolher o resultado certo entre 3; fim com 3
  erros.
- **Telegrama:** os pedaços da consulta caem embaralhados (com intrusos); montar na ordem
  antes que a fila encha.
- **Infiltrado:** consulta com um erro infiltrado; clicar nele antes que o relatório seja
  publicado; uma frase explica o erro depois.

Regras do digita: relógio pelo `performance.now()` do `requestAnimationFrame`, sair da
janela pausa, 3 níveis, sons ligados só nos jogos, **nada entra no progresso**. Conteúdo
em `dados/jogos/`, só com os módulos liberados.

## SALVAMENTO

`localStorage`, sem login. Todas as chaves com o prefixo **`meridiano:`**: `config` ·
`progresso` · `sequencia` · `estatisticas` · `nivelamento` · `laboratorio` · `jogos`.
Detalhes no `PLANO.md`.

## GIT E RITMO

O Claude **NÃO roda nenhum comando de Git**: nem `git init`, `add`, `commit`, `push`,
`remote` ou qualquer outro. Todo o Git é feito pelo Fernando, pelo GitHub Desktop. Ao fim
de cada passo, o Claude entrega um resumo curto (o que mudou, o que testar, o que o
Fernando deve ver) e uma **sugestão de mensagem de commit em português**. Quando o
Fernando pedir para testar, o Claude sobe o `servidor.py` e abre o navegador.

---

# PARTE 2 — DECISÕES E CONVENÇÕES

## Código

- **Módulos ES** (`import` / `export`) em todos os arquivos `.js`. Consequência: o site
  **não** funciona por duplo clique (`file://`) — precisa de um servidor local.
- Comentários e nomes de arquivo em português. Os **dados** (CSVs, nomes de tabela e
  coluna de origem, gabaritos) ficam em inglês — ver "A base em dois idiomas".
- **Dependências:** só o DuckDB-WASM e as duas fontes, todos copiados para dentro do
  repositório (`vendor/duckdb/` e `fontes/`), com versão e licença registradas ao lado.
  Nada de CDN, nada carregado de outro domínio. Zero etapa de build.
- Caminhos **relativos** em todos os `href`/`src`/`import` — o GitHub Pages publica o
  projeto numa subpasta (`usuario.github.io/meridiano/`).
- O motor SQL **não pode buscar nada na internet**: extensões do DuckDB que tentem se
  baixar sozinhas ficam desligadas (detalhes no `PLANO.md`, passo 5).

## Textos e tradução

Igual ao digita. Nenhum texto visível fica escrito direto no HTML ou no JavaScript. Todos
moram em `dados/i18n/pt.js` e `dados/i18n/en.js`, com **exatamente as mesmas chaves** nos
dois arquivos, e são aplicados por marcadores no HTML:

| Marcador | Troca |
|---|---|
| `data-i18n="secao.chave"` | o texto de dentro do elemento |
| `data-i18n-aria="secao.chave"` | o atributo `aria-label` |
| `data-i18n-titulo="secao.chave"` | o atributo `title` |

O texto em português fica escrito no HTML como reserva, para a página não aparecer vazia
antes de o JavaScript rodar. Chave faltando não quebra a tela: o site cai no português e
avisa no console.

O conteúdo das missões, do dicionário e dos jogos segue a mesma regra por outro caminho:
cada texto é um objeto `{ pt, en }` dentro de `dados/`.

## A base em dois idiomas

- **Uma fonte só:** CSVs, gabaritos e conteúdo dos jogos em inglês.
- **A tela decide os nomes:** o `bd.js` cria as tabelas com os nomes do idioma da tela,
  lidos do `dicionario.js`. O `traducao-sql.js` troca **só identificadores** (tabela e
  coluna) — nunca o que está entre aspas simples, nunca palavras-chave, nunca valores.
- **Valores não se traduzem:** `'Brazil'` continua `'Brazil'` nos dois idiomas.
- **Conferência 2** (ver `PLANO.md`) garante que todo gabarito traduzido devolve o mesmo
  resultado na base em português.

## Como testar

Quando o Fernando pedir para testar, **eu** (Claude) subo o servidor e abro o navegador —
ele não precisa rodar nada:

```bash
cd /Users/fernando/Documents/ClaudeCode/Meridiano && python3 servidor.py
```

Abre em **http://localhost:8030**. A porta é diferente da do digita (8010) para os dois
projetos poderem rodar ao mesmo tempo sem um tomar o endereço do outro.

Use **sempre o `servidor.py`**, nunca o `python3 -m http.server`: o servidor padrão deixa
o navegador guardar os módulos JavaScript em cache e mostrar a versão antiga do código. O
`servidor.py` manda `Cache-Control: no-store` e, além do que o do digita já fazia, fixa os
tipos de arquivo que o site precisa (`.wasm` como `application/wasm`, `.js`/`.mjs` como
JavaScript, `.woff2`, `.csv` e `.json`) — sem depender do que o Python da máquina conhece.

Ambiente conferido: `python3` 3.9.6. Não há Node nem Homebrew.

## Git e GitHub

- **Regra fixa: o Claude não roda nenhum comando de Git.** Nem `git init`, `add`,
  `commit`, `push`, `remote`, `status`, `log`, `config` — nenhum. Esta é a principal
  diferença em relação ao digita, onde o Claude fazia os commits.
- Todo o Git é do Fernando, pelo **GitHub Desktop**: criar o repositório, commitar,
  publicar e enviar.
- Branch principal: `main`. Um commit pequeno e descritivo por passo.
- Autoria: a conta configurada no GitHub Desktop, com o e-mail de privacidade do GitHub
  (`327606988+fernando-trajano@users.noreply.github.com`), como no digita.

## Ritmo de trabalho

Ao final de cada passo, o Claude entrega:

1. um **resumo curto**: o que mudou, o que o Fernando deve testar e o que ele deve ver;
2. uma **sugestão de mensagem de commit em português**.

Nos passos marcados com 🛑 no `PLANO.md`, o Claude **para e chama o Fernando** — para
aprovar (paleta, dados, conteúdo) ou para testar no Safari, com roteiro do tipo "faça
isto, você deve ver aquilo". O Safari é onde WebAssembly, Web Workers e o editor têm mais
chance de se comportar diferente do Chrome.

Não começar o passo seguinte sem o Fernando pedir.

## Escopo da versão 1

**Fluxo completo** (entrada → nivelamento → início → trilha → missão → entrega,
laboratório, cola, os três jogos) **+ módulos 0 a 2 escritos** (20 missões). Os módulos 3 a
9 aparecem como **"em breve"**, com a estrutura de dados já pronta para recebê-los.

## Contraste da paleta

A preencher no passo 2, com a medição de todos os pares (texto × fundo, texto × superfície,
destaque, erro e as seis cores de cláusula nos dois modos) e as regras de uso que saírem
dela — como no digita, onde a cor das letras pendentes ficou restrita a fonte de 24px ou
maior.

## Outros

- **Dois READMEs:** `README.md` (português) e `README.en.md` (inglês), com link cruzado.
  Sem bandeiras também neles, pela regra do visual.
- **Licença:** MIT, em nome de Fernando Rodrigo Trajano da Silva. Os **dados** do Banco
  Mundial têm a licença deles (CC BY 4.0), citada no rodapé e nos READMEs; as fontes, a
  OFL; o DuckDB-WASM, a MIT dele — cada uma registrada ao lado dos arquivos.

---

# PARTE 3 — FORA DA VERSÃO 1

Não construir agora, mesmo que pareça fácil:

- **Módulos 3 a 9** — escritos em ondas, cada onda com revisão do Fernando antes.
- **Estatísticas.**
- **Desafio do dia.**
- **Recordes** dos jogos.
- **Apêndice de PL/SQL do Oracle.**
- **Certificado de conclusão.**
