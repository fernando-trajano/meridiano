/* ==========================================================================
   Módulo 0 — Primeiro dia no observatório (Ingrid Solberg).

   É CONTEÚDO, não código. Três missões de chegada: a primeira consulta
   (SELECT * FROM), escolher colunas e o primeiro pedido de verdade. O módulo
   0 não tem revisão: termina num desafio curto, que abre o módulo 1.

   Regras e formato: MODELO.md, nesta pasta. Todo número citado nas entregas
   foi conferido na base (passo 10).
   ========================================================================== */

export const missoes = [
  {
    id: 'm0-01',
    tipo: 'missao',
    titulo: { pt: 'A primeira consulta', en: 'Your first query' },
    personagem: 'ingrid',
    hora: '08:40',
    pedido: {
      pt: 'Boas-vindas ao Observatório Meridiano! Antes de qualquer coisa, conheça a base com que trabalhamos. Comece pelo jeito como dividimos o mundo aqui: me mostre a tabela de regiões inteira.',
      en: 'Welcome to the Meridiano Observatory! Before anything else, get to know the database we work with. Start with how we split the world here: show me the whole regions table.',
    },
    // Uma linha que lembra o pedido na etapa do conceito.
    resumo: { pt: 'a tabela de regiões inteira.', en: 'the whole regions table.' },
    conceitosNovos: ['SELECT', 'FROM', '*'],
    tabelas: ['regions'],
    conceito: {
      pt: 'Uma consulta é um pedido feito à base de dados, escrito em SQL. `SELECT` diz o que mostrar; `FROM` diz de qual tabela. O asterisco (`*`) quer dizer "todas as colunas". No exemplo ao lado, `SELECT *` com `FROM indicadores` devolve a tabela `indicadores` inteira: todas as linhas e todas as colunas.',
      en: 'A query is a request made to the database, written in SQL. `SELECT` says what to show; `FROM` says which table. The asterisk (`*`) means "all columns". In the example alongside, `SELECT *` with `FROM indicators` returns the whole `indicators` table: every row and every column.',
    },
    exemplo: 'SELECT * FROM indicators',
    // O Passo a passo: uma frase por cláusula do exemplo. A ordem (a do
    // banco) e o efeito na tabela saem do próprio exemplo.
    passoAPasso: {
      FROM: {
        pt: 'Primeiro, o banco pega a tabela `indicadores` inteira.',
        en: 'First, the database takes the whole `indicators` table.',
      },
      SELECT: {
        pt: 'Depois, o `*` pede todas as colunas: nenhuma fica de fora.',
        en: 'Then `*` asks for every column: none is left out.',
      },
    },
    palpite: {
      pergunta: { pt: 'Quantas linhas o exemplo devolve?', en: 'How many rows does the example return?' },
      opcoes: [
        { pt: 'Uma só: o nome da tabela', en: 'Just one: the table name' },
        { pt: '12, uma para cada indicador', en: '12, one per indicator' },
        { pt: '5, as primeiras', en: '5, the first ones' },
      ],
      correta: 1,
    },
    desafios: [
      {
        enunciado: { pt: 'Mostre a tabela de regiões inteira.', en: 'Show the whole regions table.' },
        inicial: 'SELECT * FROM ',
        gabarito: 'SELECT * FROM regions',
        tabelas: ['regions'],
        dicas: [
          { pt: 'Só falta o nome da tabela, depois do `FROM`. A tabela de regiões se chama `regioes`.', en: 'Only the table name is missing, after `FROM`. The regions table is called `regions`.' },
          'SELECT * FROM ____',
          'SELECT * FROM regions',
        ],
      },
      {
        enunciado: { pt: 'Agora sem ajuda: mostre a tabela da equipe do Observatório inteira.', en: 'Now on your own: show the whole Observatory staff table.' },
        inicial: '',
        gabarito: 'SELECT * FROM staff',
        tabelas: ['staff'],
        dicas: [
          { pt: 'A tabela da equipe se chama `equipe`.', en: 'The staff table is called `staff`.' },
          'SELECT * FROM ____',
          'SELECT * FROM staff',
        ],
      },
    ],
    entrega: {
      pt: 'Sete regiões — é assim que o Banco Mundial divide o mundo, e é assim que vamos dividir também. E sessenta pessoas na equipe: você vai conhecer várias delas.',
      en: 'Seven regions — that is how the World Bank splits the world, and so will we. And sixty people on staff: you will meet quite a few of them.',
    },
  },

  {
    id: 'm0-02',
    tipo: 'missao',
    titulo: { pt: 'Só o que interessa', en: 'Just what matters' },
    personagem: 'ingrid',
    hora: '09:15',
    pedido: {
      pt: 'Vou apresentar você à equipe na reunião das dez. Preciso de uma lista com só duas coisas de cada pessoa: o nome e o cargo. O resto da tabela pode ficar de fora.',
      en: 'I am introducing you to the team at the ten o’clock meeting. I need a list with just two things about each person: their name and job title. The rest of the table can stay out.',
    },
    // Uma linha que lembra o pedido na etapa do conceito.
    resumo: { pt: 'o nome e o cargo de cada pessoa.', en: 'each person’s name and job title.' },
    conceitosNovos: ['COLUNAS'],
    tabelas: ['staff'],
    conceito: {
      pt: 'No lugar do asterisco, escreva os nomes das colunas que você quer, separados por vírgula. Elas aparecem na ordem em que foram escritas. No exemplo ao lado, `SELECT` com `nome_pais` e `capital` mostra só essas duas colunas da tabela `paises`, de todos os países.',
      en: 'Instead of the asterisk, write the names of the columns you want, separated by commas. They show up in the order you wrote them. In the example alongside, `SELECT` with `country_name` and `capital_city` shows just those two columns of the `countries` table, for every country.',
    },
    exemplo: 'SELECT country_name, capital_city FROM countries',
    // O Passo a passo: uma frase por cláusula do exemplo. A ordem (a do
    // banco) e o efeito na tabela saem do próprio exemplo.
    passoAPasso: {
      FROM: {
        pt: 'Primeiro, o banco pega a tabela `paises` inteira.',
        en: 'First, the database takes the whole `countries` table.',
      },
      SELECT: {
        pt: 'Por último, fica só com as duas colunas pedidas: `nome_pais` e `capital`.',
        en: 'Last, it keeps only the two columns asked for: `country_name` and `capital_city`.',
      },
    },
    palpite: {
      pergunta: { pt: 'Quantas colunas o exemplo devolve?', en: 'How many columns does the example return?' },
      opcoes: [
        { pt: '7, a tabela inteira', en: '7, the whole table' },
        { pt: '1', en: '1' },
        { pt: '2', en: '2' },
      ],
      correta: 2,
    },
    desafios: [
      {
        enunciado: { pt: 'Liste o nome e o cargo de cada pessoa da equipe.', en: 'List the name and job title of every staff member.' },
        inicial: 'SELECT full_name, ',
        gabarito: 'SELECT full_name, job_title FROM staff',
        tabelas: ['staff'],
        dicas: [
          { pt: 'Faltam a coluna do cargo e o `FROM`. O cargo fica na coluna `cargo`.', en: 'The job title column and the `FROM` are missing. The job title is in the `job_title` column.' },
          'SELECT full_name, ____ FROM ____',
          'SELECT full_name, job_title FROM staff',
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título e o país de cada projeto do Observatório.', en: 'On your own: the title and country of each Observatory project.' },
        inicial: '',
        gabarito: 'SELECT title, country_code FROM projects',
        tabelas: ['projects'],
        dicas: [
          { pt: 'Os projetos estão na tabela `projetos`; o título, em `titulo`; o país, em `codigo_pais`.', en: 'Projects are in the `projects` table; the title in `title`; the country in `country_code`.' },
          'SELECT ____, ____ FROM projects',
          'SELECT title, country_code FROM projects',
        ],
      },
    ],
    entrega: {
      pt: 'Perfeito, já imprimi. E repare nos projetos: são oitenta, espalhados pelo mundo. Boa parte do seu trabalho vai ser sobre eles.',
      en: 'Perfect, printed already. And look at the projects: eighty of them, all over the world. A lot of your work will be about them.',
    },
  },

  {
    id: 'm0-03',
    tipo: 'desafio',
    titulo: { pt: 'O primeiro pedido de verdade', en: 'Your first real request' },
    personagem: 'ingrid',
    hora: '10:40',
    pedido: {
      pt: 'A Nadia, nossa diretora-geral, quer ver os indicadores que acompanhamos: o código, o nome e a unidade de cada um. É o seu primeiro pedido de verdade — capriche.',
      en: 'Nadia, our director-general, wants to see the indicators we track: the code, name and unit of each one. It is your first real request — make it count.',
    },
    conceitosNovos: [],
    tabelas: ['indicators'],
    desafios: [
      {
        enunciado: { pt: 'Liste o código, o nome e a unidade de cada indicador.', en: 'List the code, name and unit of each indicator.' },
        inicial: '',
        gabarito: 'SELECT indicator_code, indicator_name, unit FROM indicators',
        tabelas: ['indicators'],
        dicas: [
          { pt: 'Está tudo na tabela `indicadores`: `codigo_indicador`, `nome_indicador` e `unidade`.', en: 'Everything is in the `indicators` table: `indicator_code`, `indicator_name` and `unit`.' },
          'SELECT ____, ____, ____ FROM indicators',
          'SELECT indicator_code, indicator_name, unit FROM indicators',
        ],
      },
    ],
    entrega: {
      pt: 'Doze indicadores: população, PIB, clima, energia, saúde, desigualdade. A Nadia gostou. Amanhã o Kofi, nosso economista-chefe, começa a mandar pedidos para você.',
      en: 'Twelve indicators: population, GDP, climate, energy, health, inequality. Nadia liked it. Tomorrow Kofi, our lead economist, starts sending you requests.',
    },
  },
];
