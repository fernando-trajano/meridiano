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

> **Atenção — o visual mudou depois do passo 12.** Paletas, tipografia (sem serifada), tema
> padrão (escuro), missão, Passo a passo (no lugar do Raio-X) e trilha seguem hoje a seção
> **"Design depois do passo 12"**, na Parte 2. As tabelas abaixo ficam como registro do
> briefing original.

> **Atenção:** duas cores do modo claro foram **ajustadas depois do briefing**, com
> aprovação do Fernando no passo 2, para passar de 4,5:1 também sobre a superfície: o
> texto discreto (`#71717A` → **`#6D6D76`**) e o `GROUP BY` (`#A0620F` → **`#9D600F`**).
> As tabelas abaixo já estão com os valores novos. Ver "Contraste da paleta", na Parte 2.

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
| Texto discreto | `#6D6D76` *(era `#71717A`)* |
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
| `GROUP BY` e `HAVING` | `#9D600F` *(era `#A0620F`)* | `#F0997B` |
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

> **Atenção:** desde o redesenho depois do passo 12, a missão tem **6 etapas** (pedido ·
> conceito · palpite · tente você · sem ajuda · entrega — "olhe os dados" virou a amostra
> na bancada do Pedido), e o Raio-X virou o **Passo a passo**. Ver "Design depois do passo
> 12", na Parte 2.

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
| 4 | Resumir e agrupar | 8 | Amélie | agregações, `GROUP BY`, `HAVING` *(a ordem lógica saiu como missão própria: o Passo a passo a mostra em toda missão; fica só uma explicação curta de por que o apelido do `SELECT` não funciona no `WHERE`)* |
| 5 | Juntar tabelas | 9 | Tomasz | chaves, `INNER`, `LEFT`, várias tabelas, muitos-para-muitos, self join |
| 6 | Consultas dentro de consultas | 8 | Tomasz | subconsultas, `EXISTS`, `ALL`, correlacionadas, `UNION`/`INTERSECT`/`EXCEPT` |
| 7 | Análise moderna | 10 | Nadia | `WITH`, `ROW_NUMBER`, `RANK`, `LAG`/`LEAD`, total acumulado, média móvel, `QUALIFY`, `PIVOT`, `WITH RECURSIVE` |
| 8 | Criar e alterar dados | 8 | Hiroshi | `CREATE TABLE`, restrições, `INSERT`, `UPDATE`, `DELETE`, transações, `VIEW` |
| 9 | Relatório anual | 4 | Nadia | projeto final sobre transição energética |
| | **Total** | **77** | | |

`JOIN` **sempre** com `JOIN ... ON`. A sintaxe do Oracle (vírgula + `(+)`, `DECODE`,
`NVL`, `ROWNUM`) aparece **só na cola**, em "em outros bancos".

## BASE DO OBSERVATÓRIO MERIDIANO

> **Atenção:** esta seção foi **atualizada no passo 4**, depois da consulta à API e da
> revisão do Fernando. As contagens abaixo são as reais; a tabela `missions` virou
> **`field_trips` / `viagens`**, para não se confundir com as missões do curso. Detalhes
> em "A base: decisões do passo 4", na Parte 2.

**MUNDO** — real: Banco Mundial, *World Development Indicators*, **CC BY 4.0**, 2000 a
2023.

| Tabela | Linhas | O que é |
|---|---|---|
| `regions` | 7 | regiões |
| `countries` | 234 | 217 países, **mais 17 agregados** como *World* e *Euro area* — armadilha de propósito |
| `indicators` | 12 | os indicadores usados |
| `country_year` | 5.616 | país × ano: população, PIB, PIB per capita, expectativa de vida, CO₂ per capita, % renovável, % internet... |
| `indicator_values` | 60.478 | os mesmos dados em formato longo, só os valores que existem |

**INSTITUTO** — inventado, com **semente fixa**:

| Tabela | Linhas | Detalhe |
|---|---|---|
| `staff` | 60 | com gestor |
| `projects` | 80 | alguns sem data de fim |
| `disbursements` | 1.500 | com alguns duplicados |
| `field_trips` *(era `missions`)* | 400 | |
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
| **Missão** | história à esquerda (40%); editor em cima e resultado embaixo à direita (60%) *(hoje: texto à esquerda e bancada à direita — ver "Design depois do passo 12")* |
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
- **Dependências:** só o DuckDB-WASM e a fonte mono (a serifada saiu depois do passo 12),
  copiados para dentro do repositório (`vendor/duckdb/` e `fontes/`), com versão e
  licença registradas ao lado.
  Nada de CDN, nada carregado de outro domínio. Zero etapa de build.
  - O DuckDB-WASM depende do **Apache Arrow**, que por isso também está em
    `vendor/arrow/` (passo 5). Não é uma escolha nossa: vem junto com o motor.
  - O navegador mais antigo aceito é o **Safari 16.4** (março de 2023), por causa do
    *import map* que liga o motor ao Arrow.
  - **Decidido no passo 6, com o site medido no ar:** fica o DuckDB-WASM (7,8 MB
    comprimido; ~1,2 s na primeira visita numa conexão boa), e o `.wasm` é guardado no
    Cache Storage do site para a segunda visita não baixar nada. O plano B (sql.js) foi
    descartado. Números e detalhes no `PLANO.md`.
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
cada texto é um objeto `{ pt, en }` dentro de `dados/`, lido com `emIdioma(objeto)` — com
a mesma reserva em português e o mesmo aviso no console.

Três acréscimos em relação ao `i18n.js` do digita (passo 3):

- **Lacunas:** `t('chave', { feitas: 29, total: 77 })` preenche `{feitas}` e `{total}`
  no texto. A ordem das palavras fica no texto de cada idioma, nunca no código.
- **Conferência das chaves:** ao abrir, `conferirChaves()` compara `pt.js` e `en.js` e
  avisa no console as chaves que estiverem de um lado só.
- **Detecção:** português no navegador → PT; inglês → EN; **qualquer outro idioma → EN**
  (no digita, era PT). O meridiano. é portfólio lido também por quem não fala nenhum dos
  dois, e o inglês é a aposta mais segura.

## A base em dois idiomas

- **Uma fonte só:** CSVs, gabaritos e conteúdo dos jogos em inglês.
- **A tela decide os nomes:** o `bd.js` cria as tabelas com os nomes do idioma da tela,
  lidos do `dicionario.js`. O `traducao-sql.js` troca **só identificadores** (tabela e
  coluna) — nunca o que está entre aspas simples, nunca palavras-chave, nunca valores.
- **Valores não se traduzem:** `'Brazil'` continua `'Brazil'` nos dois idiomas.
- **Conferência 2** (ver `PLANO.md`) garante que todo gabarito traduzido devolve o mesmo
  resultado na base em português.

## A base: decisões do passo 4

Aprovadas pelo Fernando depois de uma consulta à API do Banco Mundial:

- **Os 12 indicadores** (código → coluna): `SP.POP.TOTL` population · `NY.GDP.MKTP.CD`
  gdp_usd · `NY.GDP.PCAP.CD` gdp_per_capita · `SP.DYN.LE00.IN` life_expectancy ·
  `EN.GHG.CO2.PC.CE.AR5` co2_per_capita (o código antigo de CO₂ foi descontinuado) ·
  `EG.FEC.RNEW.ZS` renewable_pct (**só até 2021**) · `IT.NET.USER.ZS` internet_pct ·
  `SI.POV.GINI` gini (**esparso**, bom para `IS NULL` e `COALESCE`) · `SP.URB.TOTL.IN.ZS`
  urban_pct · `EG.ELC.ACCS.ZS` electricity_pct · `SH.DYN.MORT` under5_mortality ·
  `SH.XPD.CHEX.GD.ZS` health_spend_pct. Reservas, se um dia precisar trocar: área de
  florestas, fecundidade, desemprego.
- **17 agregados**, não os 78 da API: World, as 7 regiões, os 4 grupos de renda, Euro
  area, European Union, OECD members, Arab World e Least developed countries. Nos
  agregados, região, grupo de renda, capital e coordenadas ficam vazios.
- **Regiões de 2024:** Afeganistão e Paquistão estão em "Middle East, North Africa,
  Afghanistan & Pakistan". A API devolve dois nomes de região com espaço sobrando no fim;
  o script limpa.
- **`indicator_values`** só com os valores que existem (formato longo de verdade).
- **Correção no passo 10:** os 4 grupos de renda (`HIC`, `LIC`, `LMC`, `UMC`) tinham
  ficado inteiros vazios. Nos dados, a API os marca só com o código de 2 letras (`XD`,
  `XM`…) e deixa o de 3 vazio; o `baixar_dados.py` agora faz a ponte. Refeito do cache, sem
  baixar de novo: `indicator_values` foi de 59.454 para 60.478 linhas, e o instituto saiu
  idêntico.
- **Números:** população e PIB inteiros; o resto com 2 casas, arredondado meio para cima.
- **Nomes em português** sem acento e sem ç, porque são para digitar. A lista completa
  está em `dados/base/dicionario.js`, a fonte da verdade dos nomes.
- **Um ajuste no passo 5:** `projects.theme` virou **`projects.topic`**, para cada nome
  ter um só par no outro idioma (em PT continua `tema`, igual a `indicators.topic`). Sem
  isso, `tema` não saberia voltar para o inglês.
- **Instituto:** o "hoje" da história é 31/12/2024. Os 7 personagens estão na tabela
  `staff` (Nadia no topo, sem gestor; os outros seis chefiam um departamento cada), e a
  hierarquia tem até quatro níveis. As armadilhas de propósito estão listadas no topo do
  `ferramentas/gerar_instituto.py`.
- **Personagens, neutralidade:** os textos nunca citam a nacionalidade de ninguém (ela
  existe só como dado em `staff`), nenhum personagem pergunta sobre "o próprio" país, e o
  aluno nunca é tratado com gênero ("você entra como analista").
- **Caracteres:** todo texto dos CSVs cabe no subconjunto latino das fontes (um "ć" que
  apareceu num sobrenome foi trocado).

## Código SQL na tela

- **Realce:** as cores de cláusula do briefing, e `QUALIFY` na cor do `WHERE` (os dois
  filtram; decisão do passo 7). Um só realce (`realce.js`) para editor, Passo a passo,
  selos, cola e jogos.
- **Resultado:** valores crus, como um banco mostraria — sem separador de milhar, ponto
  como separador decimal —, porque é assim que o aluno vai escrevê-los num `WHERE`.
- **Erros:** nunca a mensagem crua do DuckDB sozinha. Sempre uma frase simples com
  pista, no idioma da tela, e a original guardada para quem quiser ver.
- **Conferência:** pelo resultado, com as regras do briefing e uma decisão do passo 9 —
  a **ordem das colunas também não conta** (o dado é o mesmo). Números arredondados
  exatamente como o `ROUND` do DuckDB. Detalhes no `PLANO.md`, "A missão por dentro".

## Como testar

Quando o Fernando pedir para testar, **eu** (Claude) subo o servidor e abro o navegador —
ele não precisa rodar nada:

```bash
cd /Users/fernando/Documents/ClaudeCode/Meridiano && python3 servidor.py
```

Abre em **http://localhost:8030**. A porta é diferente da do digita (8010) para os dois
projetos poderem rodar ao mesmo tempo sem um tomar o endereço do outro.

No app, o painel de navegador **não consegue iniciar** o servidor sozinho: o macOS não
deixa o processo dele ler a pasta Documentos. Por isso o `.claude/launch.json` só
**aponta** para `http://localhost:8030`, e o servidor é iniciado antes pelo terminal do
Claude (em segundo plano).

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

> **Atenção:** as medições desta seção são do passo 2 e valem como histórico. As paletas
> e os contrastes de hoje estão em "Design depois do passo 12", logo abaixo.

Medido no passo 2 (razão de contraste WCAG 2), todos os pares, sobre o fundo e sobre a
superfície — o editor e as áreas destacadas ficam na superfície.

- **Modo escuro:** tudo passa, quase tudo em AAA (7:1 ou mais). O menor é o texto
  discreto sobre a superfície, 4,61:1.
- **Modo claro:** tudo passa de 4,5:1 depois dos dois ajustes aprovados:
  - texto discreto `#6D6D76`: 5,12 no fundo, 4,66 na superfície (o `#71717A` do
    briefing dava 4,40 na superfície);
  - `GROUP BY` `#9D600F`: 5,10 no fundo, 4,64 na superfície (o `#A0620F` dava 4,497).
- **Menores do claro que continuam valendo:** `WITH` 4,64 e `WHERE` 4,70 na superfície;
  erro `#B91C1C` sobre `#FEE2E2`, 5,30.
- **Borda do botão secundário claro** (`#D4D4D8`): 1,48:1 contra o fundo, como no
  digita. O botão é reconhecido pelo texto (17,7:1); a borda é só acabamento.
- **Linhas finas** (`--cor-borda`) são decorativas — nunca a única pista de nada.

Regras que saíram da medição:

- **Fundo do Raio-X:** a linha que passa no `WHERE` usa `--cor-raiox-passa`, a cor do
  `WHERE` a 14% sobre o fundo, **já misturada** (`#E0ECEB` / `#1E313C`), e não uma
  transparência — assim o contraste medido é o que aparece (texto em cima: 14,65 / 11,24).
  É a **única** exceção à regra "cor de cláusula só nas letras".
- **Comentários do código** na cor discreta, em itálico; palavras que não são cláusula
  (`AS`, `AND`, `ON`, `DESC`) e nomes de tabela e coluna na cor do texto. Propostas do
  Claude, aprovadas junto com a paleta.

## Fontes

Aprovadas no passo 2: **Source Serif 4** e **JetBrains Mono**. **A serifada saiu no
redesenho depois do passo 12**: títulos, marca e texto usam a fonte do sistema. Fica só a
**JetBrains Mono** (Google Fonts, subconjunto latino, um arquivo variável de 400 a 500, 31
KB), usada só em código, números, códigos (ISO3…) e NULL. Origem, data e licença:
`fontes/LEIA-ME.md`.

## Design depois do passo 12

Duas rodadas aprovadas pelo Fernando antes do passo 13 (detalhes e caixas marcadas no
`PLANO.md`: "Redesenho depois do passo 12" e "Ajustes de design — rodada 2").

### Tipografia e tema

- **Sem serifada.** Títulos, marca e texto na fonte do sistema; títulos com peso 600 e
  `letter-spacing: -0.02em`. A marca "meridiano." em 17px, peso 600, com o ponto no
  destaque. **JetBrains Mono só** em código, números, códigos (ISO3) e NULL.
- **O site abre no escuro.** O claro vale só por escolha, salva em `meridiano:config`
  (`tema: 'claro'`). A regra está no `<head>` do `index.html` e no `app.js`.
- `tema.css` continua o único arquivo com cores.

### Paletas

**Escuro** (o padrão):

| Elemento | Cor |
|---|---|
| Fundo | `#0E1726` |
| Superfície | `#16213A` |
| Painel (a bancada) | `#131E33` |
| Código e selos | `#1A2640` |
| Bordas | `#26324D` |
| Texto | `#F2F0E9` |
| Texto secundário | `#B6B8BD` |
| Texto discreto | `#878D99` |
| Destaque (âmbar) — linhas, pontos e texto | `#E9B44C` |
| Botão principal | fundo `#FFFEFA`, texto `#0E1726` |
| Botão secundário | texto `#F2F0E9`, borda `#878D99` |
| Linha ativa do Passo a passo | `rgba(255,254,250,.06)` |
| Erro | fundo `#5B1F2A`, texto `#F7C1C1` |
| Cláusulas | as do briefing (`#B9A8F0`, `#8DB6E0`, `#7FD1C0`, `#F0997B`, `#EE9CB6`, `#B5D98A`) |

**Claro** — branco, com a bancada em vidro:

| Elemento | Cor |
|---|---|
| Fundo | `#FFFFFF` |
| Bordas | `rgba(14,23,38,.08)` |
| Código, selos e superfície | `rgba(14,23,38,.04)` |
| Texto | `#0E1726` |
| Texto secundário | `#4A5670` |
| Texto discreto | `#626D83` |
| Destaque em linhas, pontos e sublinhados | `#B7791F` |
| Destaque quando é **texto** ("Sua tarefa", links, "3 de 3") | `#9A6212` (`--cor-destaque-texto`) |
| Botão principal | fundo `#0E1726`, texto `#FFFFFF` |
| Linha ativa do Passo a passo | `rgba(255,255,255,.7)` — ela **acende** (ver contraste) |
| Erro | fundo `#FEE2E2`, texto `#B91C1C` |
| `SELECT` · `FROM`/`JOIN` · `WHERE` | `#6A4BB5` · `#2563A6` · `#1F7A6E` |
| `GROUP BY`/`HAVING` | `#B4532A` (coral, para não se confundir com o âmbar) |
| `ORDER BY`/`LIMIT` · `WITH`/`OVER` | `#A33A5B` · `#4D7A1F` |

**O vidro — a ÚNICA exceção a "sem sombras e sem desfoque":** só no tema claro, só na
bancada (`.painel`) e nos painéis flutuantes (`.flutuante`, a lista de colunas). Bancada:
fundo `rgba(255,255,255,.7)`, `backdrop-filter: blur(24px) saturate(160%)`, borda
`rgba(14,23,38,.08)`, raio 12px, sombra `inset 0 1px 0 rgba(255,255,255,.9), 0 10px 30px
rgba(14,23,38,.06)`. Flutuante: fundo `rgba(255,255,255,.85)`, `blur(20px)`, raio 10px,
sombra `0 8px 24px rgba(14,23,38,.08)`. Sem manchas nem brilho no fundo da página. Onde o
navegador não desfoca (`@supports`), fundo branco sólido. No escuro, o flutuante é o
fundo de código com borda.

**Contraste medido (rodada 2):**

- **Escuro:** tudo passa. Texto 15,75 no fundo / 13,20 no código; secundário 9,05 /
  7,58; discreto 5,39 / 4,52; destaque 9,49; cláusulas de 6,84 a 9,50 no código e de 5,73
  a 7,97 na linha ativa; botão 17,8. Única exceção: discreto **na linha ativa** (3,79) —
  só afetaria um comentário no fim de uma linha de cláusula.
- **Claro:** texto 17,96 no fundo / 16,57 no código; secundário 7,35 / 6,78; discreto
  5,21 / 4,80; destaque de texto 5,08 / 4,69; cláusulas de 4,99 a 6,39 no fundo e de
  4,60 a 5,90 no código; botão 17,96; erro 5,30. O âmbar `#B7791F` (3,64) é só para
  linhas e pontos, que pedem 3:1. Com véu escuro, a linha ativa deixava `GROUP BY`,
  `WITH` e `WHERE` abaixo de 4,5 — por isso ela acende (agora 4,87 a 5,04).

### A missão

- **Cabeçalho** numa linha: marca · contexto discreto ("Módulo 0 · Missão 2 de 3") · PT ·
  EN · tema · Sair.
- **6 etapas**, na **linha do meridiano** horizontal: pontos cheios nas visitadas, anel na
  de agora, apagados nas que faltam; só as visitadas são clicáveis (é por ela que se
  volta); ao lado, só "Tente você · 4 de 6".
- **Duas colunas:** à esquerda, **texto** no fundo da página (210–260px), no máximo três
  coisas por etapa; à direita, a **bancada** num painel, com seções separadas por barras
  (aba com o nome da seção, sublinhada no destaque; informação e botões à direita).
  **Um só botão principal por tela.** O personagem aparece **só no Pedido** (nome · cargo,
  sem monograma nem hora). A tela cabe em 1280×800 sem rolar a página; a bancada rola por
  dentro.
- **Barra da Consulta:** à esquerda a aba "Consulta"; à direita, nesta ordem: as
  **tabelas** da tarefa (rótulo discreto + nomes em mono com sublinhado pontilhado, sem
  fundo nem contorno — hover, foco ou toque abre a lista de colunas com "ver 5 linhas";
  Esc fecha; 4+ tabelas viram as duas primeiras e "+2"; nada pisca), o **ícone Formatar**
  (⇧⌥F, só quando pedido) e **Rodar** (o atalho no `title`). A barra nunca quebra de
  linha.
- **A tarefa sempre mostra as tabelas que usa:** cada desafio declara `tabelas`, e a 6ª
  conferência confere que são exatamente as do gabarito.

### Passo a passo (no lugar do Raio-X)

O código do exemplo na ordem **normal**; o destaque segue a ordem em que o banco lê
(`FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT`, só as que existem).
Linha ativa inteira, com véu e borda de 2px na cor da cláusula; as outras a 40%. Embaixo,
uma frase simples por cláusula (escrita na missão) e, no 1º passo, a nota "Você escreve o
`SELECT` em cima, mas o banco começa por aqui". Amostra de 5 a 8 linhas com o efeito de
cada passo (o que sai fica a 18%, transição de 0,45 s). Anterior/Próximo e "1 de 3" na
barra do painel. A regra antiga do "fundo do Raio-X" deixou de existir.

### Tabelas

Uma só para o site (amostra, Passo a passo, resultado, laboratório): fonte do sistema a
13px; mono só em números, códigos e NULL; números à direita com `tabular-nums`; layout
fixo; cabeçalho a 12px, peso 400, discreto; linhas finas, sem listras. **O cabeçalho nunca
é cortado:** cada coluna tem pelo menos a largura do nome; números, códigos e datas têm a
largura do maior valor mostrado; só o **texto** das células pode terminar em "…" (com o
valor inteiro no `title`). Se não couber, rolagem lateral com barra fina.

### Selos

Todo comando, tabela ou coluna no **texto corrido** (pedido, resumo, conceito, Passo a
passo, tarefa, pista, entrega, erros e conferência) é escrito **entre crases** nos textos
(`` `SELECT` ``, `` `nome_pais` ``) e vira um **selo**: mono a `.88em`, fundo de código,
`padding: 1px 5px`, raio 4px, sem quebra de linha; palavra-chave na cor da cláusula, nomes
na cor do texto (`textoComSelos` e `selosEmHtml`, em `realce.js`). Selos curtos (até uns 25
caracteres), porque a coluna de texto é estreita. O conceito não repete a consulta inteira:
diz "no exemplo ao lado" e cita só as peças. A conferência 5 confere os nomes dentro dos
selos.

### Trilha

Título, subtítulo discreto e **Continuar** com o nome da próxima missão e o módulo ao
lado. **Linha do meridiano** vertical à esquerda, com um traço por módulo, preenchida no
destaque até o módulo de agora. Módulos em **acordeão**, uma coluna: número (mono,
discreto), nome e, à direita, "3 de 3" (no destaque quando completo), "2 de 8", "9
missões" ou "em breve" (apagado, não abre); o módulo atual abre sozinho; teclado e
`aria-expanded`. Dentro, as missões com ponto (cheio = feita, anel = a de agora, contorno
= a fazer), número "01" e título. **Nunca um id interno** (m0-01) na tela. O destaque só em
marcas de progresso, nunca em títulos. Hover do digita (o texto escurece e anda 4px).
Painel à direita: sequência, missões (x de 77, barra fina), conceitos que mais escapam. O
início leva à trilha. O progresso de verdade chegou no passo 13 (`progresso.js`); o
bloqueio, no 14: um módulo abre depois do desafio final do anterior (o 0 sempre aberto);
bloqueado, mostra as missões apagadas e sem link; dentro de um módulo aberto, as missões
ficam livres.

### Entrada e nivelamento (passo 15)

"#/" mostra a **entrada** a quem nunca concluiu nada (nem missão, nem nivelamento). Em tela
larga, duas colunas: o texto à esquerda (58%) — "Aprenda SQL com dados do mundo real",
três fatos e dois caminhos, a primeira missão ou o **nivelamento** — e o globo à direita
(42%, até 220px, centralizado na altura do texto). Em tela estreita, o globo vai para
cima, centralizado, com 120px. **O globo é um componente só** (`ilustracoes.js`), o
mesmo da tela "Abrindo o observatório...": meridianos centrados que giram pela largura,
recortados pelo círculo, parados com movimento reduzido. **Só na entrada** ele ganha o
**meridiano da marca** (opção `linhaMeridiano: true`) — uma linha vertical na cor de
destaque, parada, cruzando o globo de cima a baixo. Na tela de carregamento, sem a linha. O nivelamento tem 6 desafios (um por módulo, do 0 ao 5), sem dicas; cada
acerto libera o módulo seguinte, "Não sei fazer este" encerra, e o que já estava liberado
nunca fecha. Na trilha e no fim do nivelamento, **"por onde seguir"** é a primeira missão
não feita do módulo liberado mais adiantado.

### A moldura das telas com painel (depois do passo 16)

Início e trilha — e toda tela futura com o painel de progresso — usam **a mesma
moldura** (`js/moldura.js`, igual à do digita): `.moldura` (grade), `.moldura-centro`
(título, topo e conteúdo) e `.moldura-progresso` (o painel, com **14rem** e `sticky` em
tela larga, a partir de 64rem). **Nenhuma tela define a própria grade, o próprio padding
do `.conteudo` nem o próprio título**: o título é sempre o `h1.moldura-titulo`, o primeiro
elemento do centro, com o mesmo tamanho. Por isso, ao ir de uma tela para a outra, o
título, a coluna do meio e o painel não se mexem nem um pixel (medido). Em tela estreita,
uma coluna: título e topo, painel, resto. O `html` tem `scrollbar-gutter: stable`
(recuo: `overflow-y: scroll`), para a barra de rolagem não deslocar a página. As classes
do painel moram num lugar só (`componentes.css`), no padrão do digita: `.painel-titulo`,
`.painel-bloco + .painel-bloco`, `.painel-numero`, `.painel-de`, `.painel-legenda`,
`.painel-subtitulo`, `.barra`, `.painel-selo`.

### Início (passo 16)

A tela de quem volta ("#/" para quem já concluiu alguma coisa; a trilha fica em
`#/trilha`), com a hierarquia do início do digita (ajustada depois do passo 16):

- **Topo:** "De volta ao Observatório" como título da página (30–36px, 600); "Você parou
  em" colado nele (12,5px, discreto); a missão (19px, 600) e "Módulo N · título · x de y
  feitas" (12,5px, secundário); o botão **"Continuar de onde parei"**. Uma linha fina
  fecha o bloco.
- **"Ir para"** (título de seção, 19px): os atalhos em **cartões**, numa grade de **3
  colunas de mesma largura** (gap 10px) — nome numa linha (500), descrição embaixo
  (12,5px); borda de 1px, cantos de 10px; hover só escurece a borda. Os "em breve" com o
  nome secundário e a etiqueta. Uma coluna em tela estreita. **Sem ilustração** nesta
  tela (os desenhos continuam em `ilustracoes.js`, para quando outra tela precisar).
- **Painel "Seu progresso"** — um **componente único** (`painel-progresso.js`), posto
  na tela pela moldura, o mesmo no início e na trilha, com 14rem: rótulo em
  maiúsculas pequenas (11,5px, 0.09em); dias seguidos e missões concluídas com o número
  grande (26px) e a legenda embaixo; a barra fina; os **conceitos que mais escapam em
  selos** (12px, padding 2px 7px), lado a lado.
- **Só no claro e só nesta tela** (tokens `--cor-cartao-borda` e `--cor-cartao-descricao`;
  no escuro eles apontam para as cores de sempre): borda do cartão `rgba(14,23,38,.14)`
  (1,34:1 contra o fundo, decorativa) e descrição na discreta `#626D83` (5,21:1); nome em
  `#0E1726` (17,96:1).
- Em tela estreita: topo, progresso, "Ir para".

### As 6 conferências automáticas

As 5 do passo 9 mais a **6ª: as tabelas de cada desafio são exatamente as do gabarito**.
Os desafios do nivelamento passam pelas que cabem neles (1, 2, 5 e 6).
As com o motor (1 e 2) rodam com `?conferencia` **na trilha** — dentro de uma missão, a
base é zerada no meio delas.

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
