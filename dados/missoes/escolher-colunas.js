/* ==========================================================================
   Módulo 1 — Escolher colunas (Kofi Mensah).

   É CONTEÚDO, não código. Um conceito novo por missão — apelidos (AS),
   DISTINCT, contas, juntar textos (||), comentários (--) e LIMIT —, depois
   a revisão misturada e o desafio final, que abre o módulo 2.

   Ainda sem WHERE: as tabelas usadas aqui são as pequenas (regiões,
   indicadores, equipe, projetos, publicações, países), para o resultado
   inteiro caber na leitura.

   Regras e formato: MODELO.md, nesta pasta. Todo número citado nas entregas
   foi conferido na base (passo 10).
   ========================================================================== */

export const missoes = [
  {
    id: 'm1-01',
    tipo: 'missao',
    titulo: { pt: 'Nomes que se entendem', en: 'Names people understand' },
    personagem: 'kofi',
    hora: '09:05',
    pedido: {
      pt: 'Bom dia. Vou mandar uma lista de países para parceiros que não conhecem os nomes técnicos da nossa base. Preciso do nome de cada país e do grupo de renda, com títulos de coluna que qualquer pessoa entenda.',
      en: 'Good morning. I am sending a country list to partners who don’t know our database’s technical names. I need each country’s name and income group, with column headings anyone can understand.',
    },
    conceitosNovos: ['AS'],
    tabelas: ['countries'],
    conceito: {
      pt: 'AS dá um apelido a uma coluna do resultado: o dado continua o mesmo, só muda o nome no cabeçalho. SELECT nome_indicador AS indicador FROM indicadores. Um apelido com espaço vai entre aspas duplas: AS "nome do indicador".',
      en: 'AS gives a result column a nickname: the data stays the same, only the header changes. SELECT indicator_name AS indicator FROM indicators. A nickname with spaces goes in double quotes: AS "indicator name".',
    },
    exemplo: 'SELECT indicator_name AS indicator, unit AS measured_in FROM indicators',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM indicators' },
      { etapa: 'SELECT', sql: 'SELECT indicator_name AS indicator, unit AS measured_in FROM indicators' },
    ],
    palpite: {
      pergunta: { pt: 'O que o AS muda no resultado do exemplo?', en: 'What does AS change in the example’s result?' },
      opcoes: [
        { pt: 'Os valores das colunas', en: 'The values in the columns' },
        { pt: 'Só os nomes no cabeçalho', en: 'Only the names in the header' },
        { pt: 'A quantidade de linhas', en: 'The number of rows' },
      ],
      correta: 1,
    },
    desafios: [
      {
        enunciado: { pt: 'Liste o nome de cada país e o grupo de renda, com um apelido legível em cada coluna.', en: 'List each country’s name and income group, with a readable nickname on each column.' },
        inicial: 'SELECT country_name AS ',
        gabarito: 'SELECT country_name AS country, income_group AS income FROM countries',
        exige: ['AS'],
        dicas: [
          { pt: 'Depois de cada coluna, escreva AS e o apelido. A segunda coluna é grupo_renda.', en: 'After each column, write AS and the nickname. The second column is income_group.' },
          'SELECT country_name AS ____, income_group AS ____ FROM countries',
          { pt: 'SELECT nome_pais AS pais, grupo_renda AS renda FROM paises', en: 'SELECT country_name AS country, income_group AS income FROM countries' },
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: a lista da equipe, com o nome e o cargo de cada pessoa, cada coluna com um apelido.', en: 'On your own: the staff list, with each person’s name and job title, each column with a nickname.' },
        inicial: '',
        gabarito: 'SELECT full_name AS person, job_title AS role FROM staff',
        exige: ['AS'],
        dicas: [
          { pt: 'As colunas são nome e cargo, na tabela equipe.', en: 'The columns are full_name and job_title, in the staff table.' },
          'SELECT full_name AS ____, job_title AS ____ FROM staff',
          { pt: 'SELECT nome AS pessoa, cargo AS funcao FROM equipe', en: 'SELECT full_name AS person, job_title AS role FROM staff' },
        ],
      },
    ],
    entrega: {
      pt: 'Agora sim, dá para mandar. E repare: alguns "países" estão sem grupo de renda. São os agregados, como World. Voltaremos a eles.',
      en: 'Now we can send it. And notice: some "countries" have no income group. Those are aggregates, like World. We will come back to them.',
    },
  },

  {
    id: 'm1-02',
    tipo: 'missao',
    titulo: { pt: 'Sem repetição', en: 'No repeats' },
    personagem: 'kofi',
    hora: '10:20',
    pedido: {
      pt: 'Pergunta rápida: em quantos grupos de renda o Banco Mundial divide os países? Quero ver a lista, com cada grupo aparecendo uma vez só.',
      en: 'Quick question: into how many income groups does the World Bank split countries? I want to see the list, each group appearing only once.',
    },
    conceitosNovos: ['DISTINCT'],
    tabelas: ['countries'],
    amostra: 'SELECT country_name, income_group FROM countries LIMIT 5',
    conceito: {
      pt: 'DISTINCT, logo depois do SELECT, tira as linhas repetidas do resultado: cada combinação de valores aparece uma vez só. SELECT DISTINCT tema FROM indicadores mostra cada tema uma vez, por mais indicadores que ele tenha. O vazio (NULL) também conta como um valor.',
      en: 'DISTINCT, right after SELECT, removes repeated rows from the result: each combination of values shows up only once. SELECT DISTINCT topic FROM indicators shows each topic once, however many indicators it has. The empty value (NULL) counts as a value too.',
    },
    exemplo: 'SELECT DISTINCT topic FROM indicators',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM indicators' },
      { etapa: 'SELECT', sql: 'SELECT topic FROM indicators' },
      { etapa: 'DISTINCT', sql: 'SELECT DISTINCT topic FROM indicators' },
    ],
    palpite: {
      pergunta: { pt: 'Quantas linhas o exemplo devolve?', en: 'How many rows does the example return?' },
      opcoes: [
        { pt: '12, uma por indicador', en: '12, one per indicator' },
        { pt: '1', en: '1' },
        { pt: '6, uma por tema', en: '6, one per topic' },
      ],
      correta: 2,
    },
    desafios: [
      {
        enunciado: { pt: 'Liste os grupos de renda dos países, cada um uma vez só.', en: 'List the countries’ income groups, each only once.' },
        inicial: 'SELECT ',
        gabarito: 'SELECT DISTINCT income_group FROM countries',
        exige: ['DISTINCT'],
        dicas: [
          { pt: 'Uma palavra logo depois do SELECT tira as repetições. A coluna é grupo_renda.', en: 'One word right after SELECT removes the repeats. The column is income_group.' },
          'SELECT ____ income_group FROM countries',
          'SELECT DISTINCT income_group FROM countries',
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: que temas têm os projetos do Observatório? Cada tema uma vez.', en: 'On your own: which topics do the Observatory’s projects have? Each topic once.' },
        inicial: '',
        gabarito: 'SELECT DISTINCT topic FROM projects',
        exige: ['DISTINCT'],
        dicas: [
          { pt: 'O tema do projeto está na coluna tema da tabela projetos.', en: 'The project topic is in the topic column of the projects table.' },
          'SELECT DISTINCT ____ FROM projects',
          'SELECT DISTINCT topic FROM projects',
        ],
      },
    ],
    entrega: {
      pt: 'Quatro grupos: renda baixa, média-baixa, média-alta e alta. A quinta linha, vazia, são os agregados — World, Euro area… Eles não são países, e isso ainda vai fazer diferença.',
      en: 'Four groups: low, lower-middle, upper-middle and high income. The fifth, empty row is the aggregates — World, Euro area… They are not countries, and that will matter.',
    },
  },

  {
    id: 'm1-03',
    tipo: 'missao',
    titulo: { pt: 'Fazendo contas', en: 'Doing the maths' },
    personagem: 'kofi',
    hora: '11:45',
    pedido: {
      pt: 'O orçamento do ano que vem vai ser feito mês a mês. Preciso do nome de cada pessoa da equipe e do salário por mês — na tabela ele está por ano, em francos suíços.',
      en: 'Next year’s budget will be planned month by month. I need each staff member’s name and monthly salary — the table has it per year, in Swiss francs.',
    },
    conceitosNovos: ['CONTAS'],
    tabelas: ['staff'],
    conceito: {
      pt: 'Colunas de números aceitam contas: + soma, - subtrai, * multiplica e / divide. A conta é feita linha por linha, e o resultado vira uma coluna nova — com AS, ela ganha um nome legível. SELECT titulo, orcamento_usd / 1000000 AS milhoes FROM projetos.',
      en: 'Number columns accept arithmetic: + adds, - subtracts, * multiplies and / divides. The calculation runs row by row, and the result becomes a new column — with AS, it gets a readable name. SELECT title, budget_usd / 1000000 AS millions FROM projects.',
    },
    exemplo: 'SELECT title, budget_usd / 1000000 AS budget_millions FROM projects',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM projects' },
      { etapa: 'SELECT', sql: 'SELECT title, budget_usd / 1000000 AS budget_millions FROM projects' },
    ],
    palpite: {
      pergunta: { pt: 'No exemplo, um projeto de 1.080.000 dólares aparece como…', en: 'In the example, a project of 1,080,000 dollars shows up as…' },
      opcoes: [
        { pt: '1080000', en: '1080000' },
        { pt: '1080', en: '1080' },
        { pt: '1.08', en: '1.08' },
      ],
      correta: 2,
    },
    desafios: [
      {
        enunciado: { pt: 'Liste o nome de cada pessoa e o salário por mês.', en: 'List each person’s name and monthly salary.' },
        inicial: 'SELECT full_name, salary_chf ',
        gabarito: 'SELECT full_name, salary_chf / 12 FROM staff',
        exige: ['CONTAS'],
        dicas: [
          { pt: 'Um ano tem 12 meses: divida o salário por 12.', en: 'A year has 12 months: divide the salary by 12.' },
          'SELECT full_name, salary_chf ____ FROM staff',
          'SELECT full_name, salary_chf / 12 FROM staff',
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título e o orçamento de cada projeto, em milhares de dólares.', en: 'On your own: each project’s title and budget, in thousands of dollars.' },
        inicial: '',
        gabarito: 'SELECT title, budget_usd / 1000 FROM projects',
        exige: ['CONTAS'],
        dicas: [
          { pt: 'Milhares: divida o orcamento_usd por 1000.', en: 'Thousands: divide budget_usd by 1000.' },
          'SELECT title, ____ / 1000 FROM projects',
          'SELECT title, budget_usd / 1000 FROM projects',
        ],
      },
    ],
    entrega: {
      pt: 'Bate com a planilha do financeiro. E note que a conta não mexeu na tabela: o salário continua guardado por ano. A coluna nova só existe no resultado.',
      en: 'Matches finance’s spreadsheet. And note that the calculation didn’t touch the table: salaries are still stored per year. The new column only exists in the result.',
    },
  },

  {
    id: 'm1-04',
    tipo: 'missao',
    titulo: { pt: 'Juntar textos', en: 'Joining text' },
    personagem: 'kofi',
    hora: '14:10',
    pedido: {
      pt: 'Para os crachás do seminário, preciso de uma coluna só com o nome e o cargo de cada pessoa, assim: Kofi Mensah, Lead Economist.',
      en: 'For the seminar name badges, I need a single column with each person’s name and job title, like this: Kofi Mensah, Lead Economist.',
    },
    conceitosNovos: ['||'],
    tabelas: ['staff'],
    conceito: {
      pt: '|| junta textos numa coluna só. Pedaços fixos vão entre aspas simples, e tudo o que está entre as aspas aparece igualzinho, espaços inclusive. SELECT codigo_regiao || \' - \' || nome_regiao FROM regioes devolve linhas como "EAS - East Asia & Pacific".',
      en: '|| joins text into a single column. Fixed pieces go in single quotes, and everything inside the quotes shows up exactly as written, spaces included. SELECT region_code || \' - \' || region_name FROM regions returns rows like "EAS - East Asia & Pacific".',
    },
    exemplo: "SELECT region_code || ' - ' || region_name FROM regions",
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM regions' },
      { etapa: 'SELECT', sql: "SELECT region_code || ' - ' || region_name FROM regions" },
    ],
    palpite: {
      pergunta: { pt: 'Qual é a primeira linha do exemplo?', en: 'What is the first row of the example?' },
      opcoes: [
        { pt: 'EAS - East Asia & Pacific', en: 'EAS - East Asia & Pacific' },
        { pt: "EAS ' - ' East Asia & Pacific", en: "EAS ' - ' East Asia & Pacific" },
        { pt: 'EAS-East Asia & Pacific', en: 'EAS-East Asia & Pacific' },
      ],
      correta: 0,
    },
    desafios: [
      {
        enunciado: { pt: 'Uma coluna só, com o nome e o cargo de cada pessoa separados por vírgula e espaço.', en: 'A single column with each person’s name and job title, separated by a comma and a space.' },
        inicial: 'SELECT full_name || ',
        gabarito: "SELECT full_name || ', ' || job_title FROM staff",
        exige: ['||'],
        dicas: [
          { pt: "O pedaço fixo é a vírgula com o espaço: ', '.", en: "The fixed piece is the comma and the space: ', '." },
          'SELECT full_name || ____ || job_title FROM staff',
          "SELECT full_name || ', ' || job_title FROM staff",
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: cada país numa linha, no formato Brazil (BRA).', en: 'On your own: each country on one row, formatted like Brazil (BRA).' },
        inicial: '',
        gabarito: "SELECT country_name || ' (' || country_code || ')' FROM countries",
        exige: ['||'],
        dicas: [
          { pt: 'São dois pedaços fixos: o parêntese que abre (com um espaço antes) e o que fecha. O código fica em codigo_pais.', en: 'Two fixed pieces: the opening parenthesis (with a space before it) and the closing one. The code is in country_code.' },
          "SELECT country_name || ' (' || ____ || ')' FROM countries",
          "SELECT country_name || ' (' || country_code || ')' FROM countries",
        ],
      },
    ],
    entrega: {
      pt: 'Crachás prontos. Um detalhe que vale guardar: se um dos pedaços for vazio (NULL), o resultado inteiro fica vazio.',
      en: 'Badges done. A detail worth keeping: if one of the pieces is empty (NULL), the whole result becomes empty.',
    },
  },

  {
    id: 'm1-05',
    tipo: 'missao',
    titulo: { pt: 'Consultas com legenda', en: 'Queries with captions' },
    personagem: 'kofi',
    hora: '15:30',
    pedido: {
      pt: 'Estou montando um arquivo com as consultas da equipe. Regra da casa: toda consulta guardada tem uma linha explicando o que ela faz. Me mande a lista de publicações — título e data — já com essa explicação em cima.',
      en: 'I am putting together an archive of the team’s queries. House rule: every saved query has a line explaining what it does. Send me the publications list — title and date — with that explanation on top.',
    },
    conceitosNovos: ['--'],
    tabelas: ['publications'],
    conceito: {
      pt: 'Tudo o que vem depois de dois hífens (--), até o fim da linha, é comentário: o DuckDB ignora. Serve para explicar a consulta a quem for ler depois — inclusive você, daqui a um mês. Também serve para desligar uma linha sem apagá-la.',
      en: 'Everything after two hyphens (--), up to the end of the line, is a comment: DuckDB ignores it. It explains the query to whoever reads it later — including you, a month from now. It also switches a line off without deleting it.',
    },
    // O comentário do exemplo está nos dois idiomas: o tradutor não mexe em
    // comentários, e o exemplo é o mesmo para todo mundo.
    exemplo: '-- All regions · Todas as regiões\nSELECT * FROM regions',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM regions' },
      { etapa: 'SELECT', sql: '-- All regions · Todas as regiões\nSELECT * FROM regions' },
    ],
    palpite: {
      pergunta: { pt: 'O que o DuckDB faz com a linha que começa com --?', en: 'What does DuckDB do with the line that starts with --?' },
      opcoes: [
        { pt: 'Mostra como título do resultado', en: 'Shows it as the result’s title' },
        { pt: 'Dá erro, porque não é SQL', en: 'Throws an error, since it isn’t SQL' },
        { pt: 'Ignora', en: 'Ignores it' },
      ],
      correta: 2,
    },
    desafios: [
      {
        enunciado: { pt: 'O título e a data de cada publicação, com um comentário em cima explicando a consulta.', en: 'Each publication’s title and date, with a comment on top explaining the query.' },
        inicial: '-- ',
        gabarito: 'SELECT title, published_on FROM publications',
        exige: ['--'],
        dicas: [
          { pt: 'Escreva a explicação depois do --, e a consulta na linha de baixo. A data fica em data_publicacao.', en: 'Write the explanation after the --, and the query on the next line. The date is in published_on.' },
          { pt: '-- ____\nSELECT titulo, data_publicacao FROM publicacoes', en: '-- ____\nSELECT title, published_on FROM publications' },
          { pt: '-- As publicações do Observatório\nSELECT titulo, data_publicacao FROM publicacoes', en: '-- The Observatory’s publications\nSELECT title, published_on FROM publications' },
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o nome e a capital de cada país, com um comentário.', en: 'On your own: each country’s name and capital, with a comment.' },
        inicial: '',
        gabarito: 'SELECT country_name, capital_city FROM countries',
        exige: ['--'],
        dicas: [
          { pt: 'Comentário na primeira linha, consulta na segunda. A capital fica na coluna capital.', en: 'Comment on the first line, query on the second. The capital is in the capital_city column.' },
          { pt: '-- ____\nSELECT nome_pais, capital FROM paises', en: '-- ____\nSELECT country_name, capital_city FROM countries' },
          { pt: '-- Países e capitais\nSELECT nome_pais, capital FROM paises', en: '-- Countries and capitals\nSELECT country_name, capital_city FROM countries' },
        ],
      },
    ],
    entrega: {
      pt: 'Arquivado. Daqui a um ano, alguém vai abrir esse arquivo e agradecer.',
      en: 'Filed. A year from now, someone will open that archive and be grateful.',
    },
  },

  {
    id: 'm1-06',
    tipo: 'missao',
    titulo: { pt: 'Só uma amostra', en: 'Just a sample' },
    personagem: 'kofi',
    hora: '16:45',
    pedido: {
      pt: 'Antes de pedir qualquer coisa de pais_ano, a nossa maior tabela, com mais de cinco mil linhas, quero ver o formato dela. Só as 10 primeiras linhas, por favor.',
      en: 'Before asking anything of country_year, our biggest table, with over five thousand rows, I want to see its shape. Just the first 10 rows, please.',
    },
    conceitosNovos: ['LIMIT'],
    tabelas: ['country_year'],
    conceito: {
      pt: 'LIMIT, no fim da consulta, diz quantas linhas mostrar, no máximo. Sem uma ordem definida — isso vem mais adiante —, são as primeiras que o banco encontrar. É o jeito de espiar uma tabela grande sem trazer tudo: SELECT * FROM pais_ano LIMIT 10.',
      en: 'LIMIT, at the end of the query, says how many rows to show at most. Without a defined order — that comes later — they are the first ones the database finds. It is how you peek at a big table without bringing everything: SELECT * FROM country_year LIMIT 10.',
    },
    exemplo: 'SELECT * FROM countries LIMIT 5',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM countries' },
      { etapa: 'SELECT', sql: 'SELECT * FROM countries' },
      { etapa: 'LIMIT', sql: 'SELECT * FROM countries LIMIT 5' },
    ],
    palpite: {
      pergunta: { pt: 'Se uma tabela tem 3 linhas e a consulta pede LIMIT 5, o que acontece?', en: 'If a table has 3 rows and the query asks for LIMIT 5, what happens?' },
      opcoes: [
        { pt: 'Dá erro', en: 'An error' },
        { pt: 'Vêm as 3 linhas', en: 'The 3 rows come back' },
        { pt: 'Vêm 5 linhas, duas vazias', en: '5 rows come back, two of them empty' },
      ],
      correta: 1,
    },
    desafios: [
      {
        enunciado: { pt: 'As 10 primeiras linhas de pais_ano, com todas as colunas.', en: 'The first 10 rows of country_year, with every column.' },
        inicial: 'SELECT * FROM country_year ',
        gabarito: 'SELECT * FROM country_year LIMIT 10',
        exige: ['LIMIT'],
        dicas: [
          { pt: 'LIMIT vai no fim, seguido do número de linhas.', en: 'LIMIT goes at the end, followed by the number of rows.' },
          'SELECT * FROM country_year ____ 10',
          'SELECT * FROM country_year LIMIT 10',
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título e o orçamento de só 3 projetos.', en: 'On your own: the title and budget of just 3 projects.' },
        inicial: '',
        gabarito: 'SELECT title, budget_usd FROM projects LIMIT 3',
        exige: ['LIMIT'],
        dicas: [
          { pt: 'Primeiro as colunas titulo e orcamento_usd; o LIMIT fecha a consulta.', en: 'First the title and budget_usd columns; LIMIT closes the query.' },
          'SELECT title, budget_usd FROM projects ____',
          'SELECT title, budget_usd FROM projects LIMIT 3',
        ],
      },
    ],
    entrega: {
      pt: 'Uma linha por país e por ano, de 2000 a 2023, com os doze indicadores lado a lado. E muito vazio: nem todo país mede tudo, todo ano.',
      en: 'One row per country and year, 2000 to 2023, with the twelve indicators side by side. And lots of empty cells: not every country measures everything, every year.',
    },
  },

  {
    id: 'm1-07',
    tipo: 'revisao',
    titulo: { pt: 'Revisão: escolher colunas', en: 'Review: choosing columns' },
    personagem: 'kofi',
    hora: '09:30',
    pedido: {
      pt: 'Semana puxada. Antes de avançar, três pedidos pequenos que misturam tudo o que você já usou.',
      en: 'Busy week. Before moving on, three small requests that mix everything you have used so far.',
    },
    conceitosNovos: [],
    tabelas: ['publications', 'staff', 'regions'],
    desafios: [
      {
        enunciado: { pt: 'Os tipos de publicação que o Observatório já lançou, cada um uma vez.', en: 'The publication types the Observatory has released, each once.' },
        inicial: '',
        gabarito: 'SELECT DISTINCT pub_type FROM publications',
        exige: ['DISTINCT'],
        dicas: [
          { pt: 'O tipo fica na coluna tipo, da tabela publicacoes.', en: 'The type is in the pub_type column, in the publications table.' },
          'SELECT ____ pub_type FROM publications',
          'SELECT DISTINCT pub_type FROM publications',
        ],
      },
      {
        enunciado: { pt: 'O nome e o salário mensal de 5 pessoas da equipe, com um apelido em cada coluna.', en: 'The name and monthly salary of 5 staff members, with a nickname on each column.' },
        inicial: '',
        gabarito: 'SELECT full_name AS person, salary_chf / 12 AS monthly FROM staff LIMIT 5',
        exige: ['AS', 'LIMIT'],
        dicas: [
          { pt: 'Três ideias juntas: a conta (/ 12), os apelidos (AS) e o LIMIT no fim.', en: 'Three ideas together: the arithmetic (/ 12), the nicknames (AS) and LIMIT at the end.' },
          'SELECT full_name AS ____, salary_chf / 12 AS ____ FROM staff LIMIT ____',
          { pt: 'SELECT nome AS pessoa, salario_chf / 12 AS mensal FROM equipe LIMIT 5', en: 'SELECT full_name AS person, salary_chf / 12 AS monthly FROM staff LIMIT 5' },
        ],
      },
      {
        enunciado: { pt: 'Cada região numa linha, no formato EAS: East Asia & Pacific.', en: 'Each region on one row, formatted like EAS: East Asia & Pacific.' },
        inicial: '',
        gabarito: "SELECT region_code || ': ' || region_name FROM regions",
        exige: ['||'],
        dicas: [
          { pt: "O pedaço fixo é dois-pontos com um espaço: ': '.", en: "The fixed piece is a colon and a space: ': '." },
          'SELECT region_code || ____ || region_name FROM regions',
          "SELECT region_code || ': ' || region_name FROM regions",
        ],
      },
    ],
    entrega: {
      pt: 'Tudo certo. Na semana que vem começamos a filtrar — aí a base fica bem mais interessante.',
      en: 'All good. Next week we start filtering — that is when the database gets a lot more interesting.',
    },
  },

  {
    id: 'm1-08',
    tipo: 'desafio',
    titulo: { pt: 'Desafio: a prévia do relatório', en: 'Challenge: the report preview' },
    personagem: 'kofi',
    hora: '11:00',
    pedido: {
      pt: 'A diretoria quer uma prévia do relatório de projetos. Numa coluna, o título com o código do país entre parênteses, assim: "Poverty mapping update: Peru (PER)". Na outra, o orçamento em milhões de dólares. As duas com nomes legíveis e, por enquanto, só 10 projetos.',
      en: 'The board wants a preview of the projects report. In one column, the title with the country code in parentheses, like "Poverty mapping update: Peru (PER)". In the other, the budget in millions of dollars. Both with readable names and, for now, just 10 projects.',
    },
    conceitosNovos: [],
    tabelas: ['projects'],
    desafios: [
      {
        enunciado: { pt: 'Título e país numa coluna, orçamento em milhões na outra, um apelido em cada, 10 projetos.', en: 'Title and country in one column, budget in millions in the other, a nickname on each, 10 projects.' },
        inicial: '',
        gabarito: "SELECT title || ' (' || country_code || ')' AS project, budget_usd / 1000000 AS budget_millions FROM projects LIMIT 10",
        exige: ['||', 'AS', 'CONTAS', 'LIMIT'],
        dicas: [
          { pt: 'Quatro peças: || para juntar, / 1000000 para os milhões, AS para os nomes e LIMIT no fim.', en: 'Four pieces: || to join, / 1000000 for millions, AS for the names and LIMIT at the end.' },
          "SELECT title || ' (' || ____ || ')' AS ____, budget_usd / ____ AS ____ FROM projects LIMIT ____",
          { pt: "SELECT titulo || ' (' || codigo_pais || ')' AS projeto, orcamento_usd / 1000000 AS milhoes FROM projetos LIMIT 10", en: "SELECT title || ' (' || country_code || ')' AS project, budget_usd / 1000000 AS budget_millions FROM projects LIMIT 10" },
        ],
      },
    ],
    entrega: {
      pt: 'A diretoria aprovou o formato. Módulo concluído: você já sabe escolher e montar colunas. Agora vem a parte que muda tudo — escolher as linhas.',
      en: 'The board approved the format. Module complete: you can now pick and build columns. Next comes the part that changes everything — picking the rows.',
    },
  },
];
