/* ==========================================================================
   Módulo 2 — Filtrar linhas (Kofi Mensah).

   É CONTEÚDO, não código. Um conceito novo por missão — WHERE com =,
   as outras comparações, AND/OR/NOT, IN, BETWEEN, LIKE e IS NULL —, depois
   a revisão misturada e o desafio final, que abre o módulo 3.

   Os agregados (World, as regiões, os grupos de renda…) aparecem de
   propósito em alguns resultados: é a armadilha que o curso vai ensinar a
   desarmar mais adiante, com JOIN.

   Regras e formato: MODELO.md, nesta pasta. Todo número citado nas entregas
   foi conferido na base (passo 10).
   ========================================================================== */

export const missoes = [
  {
    id: 'm2-01',
    tipo: 'missao',
    titulo: { pt: 'Só o que passa no filtro', en: 'Only what passes the filter' },
    personagem: 'kofi',
    hora: '09:10',
    pedido: {
      pt: 'Um parceiro na América Latina pediu a nossa lista de países da região — só os da América Latina e Caribe, que na base têm o código LCN.',
      en: 'A partner in Latin America asked for our list of countries in the region — only Latin America & Caribbean, coded LCN in the database.',
    },
    conceitosNovos: ['WHERE', '='],
    tabelas: ['countries'],
    amostra: 'SELECT country_name, region_code FROM countries LIMIT 5',
    conceito: {
      pt: "WHERE filtra as linhas: só passam as que cumprem a condição. Ele vem depois do FROM. Textos vão entre aspas simples e têm de ser iguais letra por letra: WHERE tema = 'health' não encontra 'Health'. Números vão sem aspas: WHERE ano = 2023.",
      en: "WHERE filters the rows: only those meeting the condition get through. It comes after FROM. Text goes in single quotes and must match letter by letter: WHERE topic = 'health' won’t find 'Health'. Numbers go without quotes: WHERE year = 2023.",
    },
    exemplo: "SELECT indicator_name FROM indicators WHERE topic = 'health'",
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM indicators' },
      { etapa: 'WHERE', sql: "SELECT * FROM indicators WHERE topic = 'health'" },
      { etapa: 'SELECT', sql: "SELECT indicator_name FROM indicators WHERE topic = 'health'" },
    ],
    palpite: {
      pergunta: { pt: 'Quantas linhas o exemplo devolve?', en: 'How many rows does the example return?' },
      opcoes: [
        { pt: '3', en: '3' },
        { pt: '12', en: '12' },
        { pt: 'Nenhuma: o tema está escrito Health', en: 'None: the topic is written Health' },
      ],
      correta: 0,
    },
    desafios: [
      {
        enunciado: { pt: 'O nome dos países da América Latina e Caribe (região LCN).', en: 'The names of the countries in Latin America & Caribbean (region LCN).' },
        inicial: 'SELECT country_name FROM countries WHERE ',
        gabarito: "SELECT country_name FROM countries WHERE region_code = 'LCN'",
        exige: ['WHERE'],
        dicas: [
          { pt: "A região fica na coluna codigo_regiao, e o valor vai entre aspas simples: 'LCN'.", en: "The region is in the region_code column, and the value goes in single quotes: 'LCN'." },
          'SELECT country_name FROM countries WHERE ____ = ____',
          "SELECT country_name FROM countries WHERE region_code = 'LCN'",
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título dos projetos de energia (tema energy).', en: 'On your own: the titles of the energy projects (topic energy).' },
        inicial: '',
        gabarito: "SELECT title FROM projects WHERE topic = 'energy'",
        exige: ['WHERE'],
        dicas: [
          { pt: "O tema do projeto está na coluna tema; o valor é 'energy', em minúsculas.", en: "The project topic is in the topic column; the value is 'energy', in lowercase." },
          'SELECT title FROM projects WHERE ____',
          "SELECT title FROM projects WHERE topic = 'energy'",
        ],
      },
    ],
    entrega: {
      pt: 'Quarenta e dois países e territórios — obrigado. E dezoito projetos de energia: quase um quarto de tudo o que fazemos.',
      en: 'Forty-two countries and territories — thank you. And eighteen energy projects: almost a quarter of everything we do.',
    },
  },

  {
    id: 'm2-02',
    tipo: 'missao',
    titulo: { pt: 'Maior, menor, diferente', en: 'Greater, less, different' },
    personagem: 'kofi',
    hora: '10:30',
    pedido: {
      pt: 'Estou estudando emissões. Em que casos um país emitiu mais de 20 toneladas de CO₂ por pessoa num ano? Quero o código, o ano e o valor.',
      en: 'I am studying emissions. In which cases did a country emit more than 20 tonnes of CO₂ per person in a year? I want the code, the year and the value.',
    },
    conceitosNovos: ['COMPARACOES'],
    tabelas: ['country_year'],
    amostra: 'SELECT country_code, year, co2_per_capita FROM country_year LIMIT 5',
    conceito: {
      pt: 'Além do =, o WHERE compara com > (maior), < (menor), >= (maior ou igual), <= (menor ou igual) e <> (diferente). Com números, é a comparação de sempre. WHERE salario_chf > 150000 deixa passar só quem ganha mais de 150 mil francos por ano.',
      en: 'Besides =, WHERE compares with > (greater), < (less), >= (greater or equal), <= (less or equal) and <> (different). With numbers, it is the usual comparison. WHERE salary_chf > 150000 only lets through those earning over 150 thousand francs a year.',
    },
    exemplo: 'SELECT full_name, salary_chf FROM staff WHERE salary_chf > 150000',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM staff' },
      { etapa: 'WHERE', sql: 'SELECT * FROM staff WHERE salary_chf > 150000' },
      { etapa: 'SELECT', sql: 'SELECT full_name, salary_chf FROM staff WHERE salary_chf > 150000' },
    ],
    palpite: {
      pergunta: { pt: 'Quem aparece no resultado do exemplo?', en: 'Who shows up in the example’s result?' },
      opcoes: [
        { pt: 'Ninguém: ninguém ganha tanto', en: 'Nobody: no one earns that much' },
        { pt: 'As sete pessoas que você já conhece', en: 'The seven people you already know' },
        { pt: 'A equipe inteira', en: 'The whole staff' },
      ],
      correta: 1,
    },
    desafios: [
      {
        enunciado: { pt: 'Código do país, ano e CO₂ por pessoa, sempre que ele passou de 20 toneladas.', en: 'Country code, year and CO₂ per person, whenever it went over 20 tonnes.' },
        inicial: 'SELECT country_code, year, co2_per_capita FROM country_year WHERE ',
        gabarito: 'SELECT country_code, year, co2_per_capita FROM country_year WHERE co2_per_capita > 20',
        exige: ['COMPARACOES'],
        dicas: [
          { pt: 'A coluna é co2_per_capita, e "mais de" é >.', en: 'The column is co2_per_capita, and "more than" is >.' },
          'SELECT country_code, year, co2_per_capita FROM country_year WHERE co2_per_capita ____ 20',
          'SELECT country_code, year, co2_per_capita FROM country_year WHERE co2_per_capita > 20',
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título e o orçamento dos projetos de 2 milhões de dólares ou mais.', en: 'On your own: the title and budget of projects worth 2 million dollars or more.' },
        inicial: '',
        gabarito: 'SELECT title, budget_usd FROM projects WHERE budget_usd >= 2000000',
        exige: ['COMPARACOES'],
        dicas: [
          { pt: '"Ou mais" inclui o próprio valor: use >=. O número vai sem pontos: 2000000.', en: '"Or more" includes the value itself: use >=. The number goes without separators: 2000000.' },
          'SELECT title, budget_usd FROM projects WHERE budget_usd ____ 2000000',
          'SELECT title, budget_usd FROM projects WHERE budget_usd >= 2000000',
        ],
      },
    ],
    entrega: {
      pt: '172 casos, de 13 códigos — e olhe o NAC na lista: não é um país, é a América do Norte inteira. Os agregados de novo. E só 3 projetos passam dos 2 milhões.',
      en: '172 cases, from 13 codes — and look at NAC on the list: it is not a country, it is all of North America. The aggregates again. And only 3 projects reach 2 million.',
    },
  },

  {
    id: 'm2-03',
    tipo: 'missao',
    titulo: { pt: 'Mais de uma condição', en: 'More than one condition' },
    personagem: 'kofi',
    hora: '13:15',
    pedido: {
      pt: 'Em 2023, onde a expectativa de vida passou dos 80 anos? Quero o código e a expectativa de vida.',
      en: 'In 2023, where did life expectancy go above 80 years? I want the code and the life expectancy.',
    },
    conceitosNovos: ['AND', 'OR', 'NOT'],
    tabelas: ['country_year'],
    amostra: 'SELECT country_code, year, life_expectancy FROM country_year LIMIT 5',
    conceito: {
      pt: 'AND exige as duas condições ao mesmo tempo; OR aceita qualquer uma delas; NOT inverte uma condição. WHERE ano = 2023 AND expectativa_vida > 80 pega só 2023, e só acima de 80. Ao misturar AND com OR, use parênteses para deixar claro o que vai junto.',
      en: 'AND requires both conditions at once; OR accepts either one; NOT flips a condition. WHERE year = 2023 AND life_expectancy > 80 takes only 2023, and only above 80. When mixing AND with OR, use parentheses to make clear what goes together.',
    },
    exemplo: "SELECT title, topic FROM projects WHERE topic = 'health' OR topic = 'energy'",
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM projects' },
      { etapa: 'WHERE', sql: "SELECT * FROM projects WHERE topic = 'health' OR topic = 'energy'" },
      { etapa: 'SELECT', sql: "SELECT title, topic FROM projects WHERE topic = 'health' OR topic = 'energy'" },
    ],
    palpite: {
      pergunta: { pt: 'O exemplo devolve os projetos…', en: 'The example returns the projects…' },
      opcoes: [
        { pt: 'de saúde e também os de energia', en: 'about health and also those about energy' },
        { pt: 'de nenhum tema: um projeto não pode ter os dois', en: 'of no topic: a project can’t have both' },
        { pt: 'de todos os temas', en: 'of every topic' },
      ],
      correta: 0,
    },
    desafios: [
      {
        enunciado: { pt: 'Código e expectativa de vida onde ela passou de 80 anos, em 2023.', en: 'Code and life expectancy where it went above 80 years, in 2023.' },
        inicial: 'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 ',
        gabarito: 'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND life_expectancy > 80',
        exige: ['AND'],
        dicas: [
          { pt: 'Falta a segunda condição, ligada à primeira por AND.', en: 'The second condition is missing, linked to the first by AND.' },
          'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 ____ life_expectancy > 80',
          'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND life_expectancy > 80',
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título e o tema de todos os projetos que NÃO são do tema digital — usando NOT.', en: 'On your own: the title and topic of every project that is NOT about digital — using NOT.' },
        inicial: '',
        gabarito: "SELECT title, topic FROM projects WHERE NOT topic = 'digital'",
        exige: ['NOT'],
        dicas: [
          { pt: 'O NOT vem antes da condição que ele inverte.', en: 'NOT comes before the condition it flips.' },
          "SELECT title, topic FROM projects WHERE ____ topic = 'digital'",
          "SELECT title, topic FROM projects WHERE NOT topic = 'digital'",
        ],
      },
    ],
    entrega: {
      pt: '56 linhas — mas olhe com atenção: EMU, EUU, OED e HIC não são países. São a zona do euro, a União Europeia, a OCDE e o grupo de renda alta. Os agregados apareceram de novo; logo você vai aprender a tirá-los.',
      en: '56 rows — but look closely: EMU, EUU, OED and HIC are not countries. They are the euro area, the European Union, the OECD and the high-income group. The aggregates again; soon you will learn to take them out.',
    },
  },

  {
    id: 'm2-04',
    tipo: 'missao',
    titulo: { pt: 'Uma lista de valores', en: 'A list of values' },
    personagem: 'kofi',
    hora: '15:00',
    pedido: {
      pt: 'Para o relatório sobre desigualdade: a expectativa de vida em 2023 em cada grupo de renda. Os códigos dos grupos são LIC, LMC, UMC e HIC.',
      en: 'For the inequality report: life expectancy in 2023 in each income group. The group codes are LIC, LMC, UMC and HIC.',
    },
    conceitosNovos: ['IN'],
    tabelas: ['country_year'],
    amostra: 'SELECT country_code, year, life_expectancy FROM country_year LIMIT 5',
    conceito: {
      pt: "IN compara com uma lista: WHERE departamento IN ('Research', 'Economics') é o mesmo que um OR para cada valor, só que mais curto. A lista vai entre parênteses, com os valores separados por vírgula. NOT IN faz o contrário: deixa passar o que não está na lista.",
      en: "IN compares against a list: WHERE department IN ('Research', 'Economics') is the same as one OR per value, only shorter. The list goes in parentheses, with the values separated by commas. NOT IN does the opposite: it lets through what is not on the list.",
    },
    exemplo: "SELECT full_name, department FROM staff WHERE department IN ('Research', 'Economics')",
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM staff' },
      { etapa: 'WHERE', sql: "SELECT * FROM staff WHERE department IN ('Research', 'Economics')" },
      { etapa: 'SELECT', sql: "SELECT full_name, department FROM staff WHERE department IN ('Research', 'Economics')" },
    ],
    palpite: {
      pergunta: { pt: 'O filtro do exemplo é o mesmo que…', en: 'The example’s filter is the same as…' },
      opcoes: [
        { pt: "departamento = 'Research' AND departamento = 'Economics'", en: "department = 'Research' AND department = 'Economics'" },
        { pt: "departamento = 'Research' OR departamento = 'Economics'", en: "department = 'Research' OR department = 'Economics'" },
        { pt: "departamento <> 'Research'", en: "department <> 'Research'" },
      ],
      correta: 1,
    },
    desafios: [
      {
        enunciado: { pt: 'Código e expectativa de vida dos quatro grupos de renda (LIC, LMC, UMC e HIC), em 2023.', en: 'Code and life expectancy of the four income groups (LIC, LMC, UMC and HIC), in 2023.' },
        inicial: 'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND country_code ',
        gabarito: "SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND country_code IN ('LIC', 'LMC', 'UMC', 'HIC')",
        exige: ['IN'],
        dicas: [
          { pt: 'Depois do IN, a lista entre parênteses, cada código entre aspas simples.', en: 'After IN, the list in parentheses, each code in single quotes.' },
          'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND country_code IN (____)',
          "SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND country_code IN ('LIC', 'LMC', 'UMC', 'HIC')",
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: nome e departamento de quem trabalha em Climate & Energy ou em Data Engineering.', en: 'On your own: name and department of everyone in Climate & Energy or Data Engineering.' },
        inicial: '',
        gabarito: "SELECT full_name, department FROM staff WHERE department IN ('Climate & Energy', 'Data Engineering')",
        exige: ['IN'],
        dicas: [
          { pt: 'Os valores têm de ser escritos exatamente como na coluna departamento, com o & e as maiúsculas.', en: 'The values must be written exactly as in the department column, with the & and the capitals.' },
          'SELECT full_name, department FROM staff WHERE department IN (____, ____)',
          "SELECT full_name, department FROM staff WHERE department IN ('Climate & Energy', 'Data Engineering')",
        ],
      },
    ],
    entrega: {
      pt: 'Quinze anos de diferença: 65 anos nos países de renda baixa, 80 nos de renda alta. É por números assim que este Observatório existe.',
      en: 'Fifteen years apart: 65 years in low-income countries, 80 in high-income ones. Numbers like these are why this Observatory exists.',
    },
  },

  {
    id: 'm2-05',
    tipo: 'missao',
    titulo: { pt: 'Entre dois valores', en: 'Between two values' },
    personagem: 'kofi',
    hora: '09:20',
    pedido: {
      pt: 'Quero ver a década da internet: a porcentagem da população mundial usando a internet, de 2010 a 2020. O mundo inteiro tem o código WLD.',
      en: 'I want to see the internet decade: the share of the world population using the internet, from 2010 to 2020. The whole world has the code WLD.',
    },
    conceitosNovos: ['BETWEEN'],
    tabelas: ['country_year'],
    amostra: 'SELECT country_code, year, internet_pct FROM country_year LIMIT 5',
    conceito: {
      pt: 'BETWEEN pega uma faixa de valores, com as duas pontas incluídas: WHERE ano BETWEEN 2010 AND 2020 é o mesmo que ano >= 2010 AND ano <= 2020. Serve para números, datas e até textos. O AND aqui faz parte do BETWEEN — não é uma segunda condição.',
      en: 'BETWEEN takes a range of values, both ends included: WHERE year BETWEEN 2010 AND 2020 is the same as year >= 2010 AND year <= 2020. It works for numbers, dates and even text. The AND here is part of BETWEEN — not a second condition.',
    },
    exemplo: 'SELECT title, budget_usd FROM projects WHERE budget_usd BETWEEN 500000 AND 1000000',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM projects' },
      { etapa: 'WHERE', sql: 'SELECT * FROM projects WHERE budget_usd BETWEEN 500000 AND 1000000' },
      { etapa: 'SELECT', sql: 'SELECT title, budget_usd FROM projects WHERE budget_usd BETWEEN 500000 AND 1000000' },
    ],
    palpite: {
      pergunta: { pt: 'Um projeto de exatamente 1.000.000 de dólares entraria no resultado do exemplo?', en: 'Would a project of exactly 1,000,000 dollars be in the example’s result?' },
      opcoes: [
        { pt: 'Sim: as pontas entram', en: 'Yes: the ends are included' },
        { pt: 'Não: só o que fica no meio', en: 'No: only what is in between' },
        { pt: 'Depende da ordem das linhas', en: 'It depends on the row order' },
      ],
      correta: 0,
    },
    desafios: [
      {
        enunciado: { pt: 'Ano e porcentagem da população mundial (WLD) na internet, de 2010 a 2020.', en: 'Year and share of the world population (WLD) on the internet, from 2010 to 2020.' },
        inicial: "SELECT year, internet_pct FROM country_year WHERE country_code = 'WLD' AND ",
        gabarito: "SELECT year, internet_pct FROM country_year WHERE country_code = 'WLD' AND year BETWEEN 2010 AND 2020",
        exige: ['BETWEEN'],
        dicas: [
          { pt: 'Falta a faixa de anos: ano BETWEEN o primeiro AND o último.', en: 'The range of years is missing: year BETWEEN the first AND the last.' },
          "SELECT year, internet_pct FROM country_year WHERE country_code = 'WLD' AND year BETWEEN ____ AND ____",
          "SELECT year, internet_pct FROM country_year WHERE country_code = 'WLD' AND year BETWEEN 2010 AND 2020",
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: nome e data de admissão de quem entrou na equipe de 1º de janeiro de 2020 a 31 de dezembro de 2022.', en: 'On your own: name and hire date of everyone who joined the staff from 1 January 2020 to 31 December 2022.' },
        inicial: '',
        gabarito: "SELECT full_name, hire_date FROM staff WHERE hire_date BETWEEN '2020-01-01' AND '2022-12-31'",
        exige: ['BETWEEN'],
        dicas: [
          { pt: "Datas vão entre aspas simples, no formato ano-mês-dia: '2020-01-01'. A coluna é data_admissao.", en: "Dates go in single quotes, as year-month-day: '2020-01-01'. The column is hire_date." },
          'SELECT full_name, hire_date FROM staff WHERE hire_date BETWEEN ____ AND ____',
          "SELECT full_name, hire_date FROM staff WHERE hire_date BETWEEN '2020-01-01' AND '2022-12-31'",
        ],
      },
    ],
    entrega: {
      pt: 'De 28% para 60% da população mundial em dez anos. E o maior salto da década, de 2019 para 2020, coincide com o primeiro ano da pandemia.',
      en: 'From 28% to 60% of the world population in ten years. And the decade’s biggest jump, from 2019 to 2020, coincides with the first year of the pandemic.',
    },
  },

  {
    id: 'm2-06',
    tipo: 'missao',
    titulo: { pt: 'Procurar por um pedaço', en: 'Searching by a piece' },
    personagem: 'kofi',
    hora: '11:40',
    pedido: {
      pt: 'Estou juntando dados sobre pequenos estados insulares. Para começar, me mostre os países e territórios cujo nome em inglês tem a palavra "Islands".',
      en: 'I am gathering data on small island states. To start, show me the countries and territories whose English name contains the word "Islands".',
    },
    conceitosNovos: ['LIKE'],
    tabelas: ['countries'],
    conceito: {
      pt: "LIKE procura um pedaço de texto. O % quer dizer \"qualquer coisa, até nada\": 'Senior%' é tudo o que começa com Senior; '%Islands%' é tudo o que tem Islands em algum lugar. O _ vale por uma letra só. Maiúsculas e minúsculas contam.",
      en: "LIKE searches for a piece of text. The % means \"anything, even nothing\": 'Senior%' is everything that starts with Senior; '%Islands%' is everything with Islands somewhere in it. The _ stands for a single letter. Upper and lower case matter.",
    },
    exemplo: "SELECT full_name, job_title FROM staff WHERE job_title LIKE 'Senior%'",
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM staff' },
      { etapa: 'WHERE', sql: "SELECT * FROM staff WHERE job_title LIKE 'Senior%'" },
      { etapa: 'SELECT', sql: "SELECT full_name, job_title FROM staff WHERE job_title LIKE 'Senior%'" },
    ],
    palpite: {
      pergunta: { pt: "Qual destes cargos passa em LIKE 'Senior%'?", en: "Which of these job titles passes LIKE 'Senior%'?" },
      opcoes: [
        { pt: 'Senior Economist', en: 'Senior Economist' },
        { pt: 'Research Analyst (Senior)', en: 'Research Analyst (Senior)' },
        { pt: 'senior economist', en: 'senior economist' },
      ],
      correta: 0,
    },
    desafios: [
      {
        enunciado: { pt: 'O nome dos países e territórios que têm "Islands" no nome.', en: 'The names of the countries and territories with "Islands" in the name.' },
        inicial: 'SELECT country_name FROM countries WHERE country_name ',
        gabarito: "SELECT country_name FROM countries WHERE country_name LIKE '%Islands%'",
        exige: ['LIKE'],
        dicas: [
          { pt: 'A palavra pode estar em qualquer lugar do nome: % antes e % depois.', en: 'The word can be anywhere in the name: % before and % after.' },
          "SELECT country_name FROM countries WHERE country_name LIKE ____",
          "SELECT country_name FROM countries WHERE country_name LIKE '%Islands%'",
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título dos relatórios anuais do Observatório — todos começam com "Meridiano Observatory annual report".', en: 'On your own: the titles of the Observatory’s annual reports — they all start with "Meridiano Observatory annual report".' },
        inicial: '',
        gabarito: "SELECT title FROM publications WHERE title LIKE 'Meridiano Observatory annual report%'",
        exige: ['LIKE'],
        dicas: [
          { pt: 'Começa com: o texto e depois o %. O título fica na coluna titulo da tabela publicacoes.', en: 'Starts with: the text, then the %. The title is in the title column of the publications table.' },
          "SELECT title FROM publications WHERE title LIKE ____",
          "SELECT title FROM publications WHERE title LIKE 'Meridiano Observatory annual report%'",
        ],
      },
    ],
    entrega: {
      pt: 'Nove, quase todos territórios pequenos — e duas Ilhas Virgens diferentes, a britânica e a americana. E nove relatórios anuais, de 2015 a 2023.',
      en: 'Nine, almost all small territories — and two different Virgin Islands, the British and the US ones. And nine annual reports, from 2015 to 2023.',
    },
  },

  {
    id: 'm2-07',
    tipo: 'missao',
    titulo: { pt: 'Quando o dado não existe', en: 'When the data does not exist' },
    personagem: 'kofi',
    hora: '14:30',
    pedido: {
      pt: 'O índice de Gini mede a desigualdade de renda, mas não é medido todo ano em todo país. Em 2021, onde há Gini medido? Quero o código e o valor.',
      en: 'The Gini index measures income inequality, but it isn’t measured every year in every country. In 2021, where is there a measured Gini? I want the code and the value.',
    },
    conceitosNovos: ['IS NULL'],
    tabelas: ['country_year'],
    amostra: 'SELECT country_code, year, gini FROM country_year LIMIT 5',
    conceito: {
      pt: 'Um dado que não existe é NULL — nem zero, nem vazio: desconhecido. Por isso, = NULL nunca funciona. Para achar os vazios, use IS NULL; para achar os preenchidos, IS NOT NULL. WHERE codigo_regiao IS NULL encontra os agregados, que não têm região.',
      en: 'Data that doesn’t exist is NULL — not zero, not blank: unknown. That is why = NULL never works. To find the empty ones, use IS NULL; to find the filled ones, IS NOT NULL. WHERE region_code IS NULL finds the aggregates, which have no region.',
    },
    exemplo: 'SELECT country_name FROM countries WHERE region_code IS NULL',
    raioX: [
      { etapa: 'FROM', sql: 'SELECT * FROM countries' },
      { etapa: 'WHERE', sql: 'SELECT * FROM countries WHERE region_code IS NULL' },
      { etapa: 'SELECT', sql: 'SELECT country_name FROM countries WHERE region_code IS NULL' },
    ],
    palpite: {
      pergunta: { pt: 'Quantas linhas o exemplo devolve?', en: 'How many rows does the example return?' },
      opcoes: [
        { pt: 'Nenhuma: todo país tem região', en: 'None: every country has a region' },
        { pt: '17, os agregados', en: '17, the aggregates' },
        { pt: '234, todos', en: '234, all of them' },
      ],
      correta: 1,
    },
    desafios: [
      {
        enunciado: { pt: 'Código e índice de Gini onde ele foi medido, em 2021.', en: 'Code and Gini index wherever it was measured, in 2021.' },
        inicial: 'SELECT country_code, gini FROM country_year WHERE year = 2021 AND gini ',
        gabarito: 'SELECT country_code, gini FROM country_year WHERE year = 2021 AND gini IS NOT NULL',
        exige: ['IS NULL'],
        dicas: [
          { pt: 'Queremos os preenchidos: IS NOT NULL.', en: 'We want the filled ones: IS NOT NULL.' },
          'SELECT country_code, gini FROM country_year WHERE year = 2021 AND gini IS ____',
          'SELECT country_code, gini FROM country_year WHERE year = 2021 AND gini IS NOT NULL',
        ],
      },
      {
        enunciado: { pt: 'Sem ajuda: o título dos projetos que ainda estão em andamento — os que não têm data de fim.', en: 'On your own: the titles of the projects still running — the ones with no end date.' },
        inicial: '',
        gabarito: 'SELECT title FROM projects WHERE end_date IS NULL',
        exige: ['IS NULL'],
        dicas: [
          { pt: 'A data de fim fica em data_fim; sem data de fim quer dizer NULL.', en: 'The end date is in end_date; no end date means NULL.' },
          'SELECT title FROM projects WHERE end_date ____',
          'SELECT title FROM projects WHERE end_date IS NULL',
        ],
      },
    ],
    entrega: {
      pt: '81 países com o Gini de 2021 — menos da metade. Em desigualdade, os buracos nos dados também são parte da história. E dezenove projetos seguem em andamento.',
      en: '81 countries with a 2021 Gini — fewer than half. In inequality, the gaps in the data are part of the story too. And nineteen projects are still running.',
    },
  },

  {
    id: 'm2-08',
    tipo: 'revisao',
    titulo: { pt: 'Revisão: filtrar linhas', en: 'Review: filtering rows' },
    personagem: 'kofi',
    hora: '10:00',
    pedido: {
      pt: 'Três pedidos misturados antes do desafio final do módulo.',
      en: 'Three mixed requests before the module’s final challenge.',
    },
    conceitosNovos: [],
    tabelas: ['countries', 'publications', 'staff'],
    desafios: [
      {
        enunciado: { pt: 'Nome e região dos países do Sul da Ásia (SAS) e da América do Norte (NAC).', en: 'Name and region of the countries in South Asia (SAS) and North America (NAC).' },
        inicial: '',
        gabarito: "SELECT country_name, region_code FROM countries WHERE region_code IN ('SAS', 'NAC')",
        dicas: [
          { pt: 'Dois valores possíveis para a mesma coluna: IN.', en: 'Two possible values for the same column: IN.' },
          'SELECT country_name, region_code FROM countries WHERE region_code IN (____)',
          "SELECT country_name, region_code FROM countries WHERE region_code IN ('SAS', 'NAC')",
        ],
      },
      {
        enunciado: { pt: 'Título e downloads das publicações com 1000 downloads ou mais.', en: 'Title and downloads of the publications with 1000 downloads or more.' },
        inicial: '',
        gabarito: 'SELECT title, downloads FROM publications WHERE downloads >= 1000',
        dicas: [
          { pt: '"Ou mais" é >=.', en: '"Or more" is >=.' },
          'SELECT title, downloads FROM publications WHERE downloads ____',
          'SELECT title, downloads FROM publications WHERE downloads >= 1000',
        ],
      },
      {
        enunciado: { pt: 'Nome, cargo e salário de quem tem "Analyst" no cargo e ganha menos de 120 mil francos por ano.', en: 'Name, job title and salary of everyone with "Analyst" in their job title who earns less than 120 thousand francs a year.' },
        inicial: '',
        gabarito: "SELECT full_name, job_title, salary_chf FROM staff WHERE job_title LIKE '%Analyst%' AND salary_chf < 120000",
        dicas: [
          { pt: 'Duas condições com AND: um LIKE para o cargo e um < para o salário.', en: 'Two conditions with AND: a LIKE for the title and a < for the salary.' },
          "SELECT full_name, job_title, salary_chf FROM staff WHERE job_title LIKE ____ AND salary_chf ____",
          "SELECT full_name, job_title, salary_chf FROM staff WHERE job_title LIKE '%Analyst%' AND salary_chf < 120000",
        ],
      },
    ],
    entrega: {
      pt: 'Os três certos. Você já filtra como gente da casa. Falta o último pedido do módulo.',
      en: 'All three right. You already filter like one of the team. One last request for this module.',
    },
  },

  {
    id: 'm2-09',
    tipo: 'desafio',
    titulo: { pt: 'Desafio: o paradoxo da energia', en: 'Challenge: the energy paradox' },
    personagem: 'kofi',
    hora: '16:00',
    pedido: {
      pt: 'Um achado para o relatório de energia: em 2021, em que países mais de 80% da energia consumida veio de fontes renováveis, mas menos da metade da população tinha eletricidade? Quero o código, a porcentagem renovável e o acesso à eletricidade.',
      en: 'A finding for the energy report: in 2021, in which countries did more than 80% of the energy consumed come from renewable sources, yet less than half the population had electricity? I want the code, the renewable share and the access to electricity.',
    },
    conceitosNovos: [],
    tabelas: ['country_year'],
    desafios: [
      {
        enunciado: { pt: 'Em 2021: renovável acima de 80% e eletricidade abaixo de 50%. Código, renovável e eletricidade.', en: 'In 2021: renewables above 80% and electricity below 50%. Code, renewables and electricity.' },
        inicial: '',
        gabarito: 'SELECT country_code, renewable_pct, electricity_pct FROM country_year WHERE year = 2021 AND renewable_pct > 80 AND electricity_pct < 50',
        exige: ['WHERE', 'AND'],
        dicas: [
          { pt: 'Três condições ligadas por AND: o ano, o renovável (renovavel_pct) e a eletricidade (eletricidade_pct).', en: 'Three conditions linked by AND: the year, renewables (renewable_pct) and electricity (electricity_pct).' },
          'SELECT country_code, renewable_pct, electricity_pct FROM country_year WHERE year = 2021 AND ____ AND ____',
          'SELECT country_code, renewable_pct, electricity_pct FROM country_year WHERE year = 2021 AND renewable_pct > 80 AND electricity_pct < 50',
        ],
      },
    ],
    entrega: {
      pt: 'Dez países — e o paradoxo tem explicação: nesses lugares, boa parte da energia "renovável" é lenha e carvão vegetal, usados para cozinhar. O indicador está certo; é a leitura que pede cuidado. Módulo concluído: você já escolhe as linhas. A seguir, a Lucía vai pedir para você ordenar e transformar.',
      en: 'Ten countries — and the paradox has an explanation: in these places, much of the "renewable" energy is firewood and charcoal, used for cooking. The indicator is right; it is the reading that needs care. Module complete: you can now pick the rows. Next, Lucía will ask you to sort and transform.',
    },
  },
];
