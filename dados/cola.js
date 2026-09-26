/* ==========================================================================
   cola.js — o conteúdo das Dicas, a antiga cola (passo 18).

   É CONTEÚDO, não código. Mesmas regras das missões (ver missoes/MODELO.md):
     - SQL em inglês, traduzido na hora; com apelido ou comentário, os dois
       idiomas à mão ({ pt, en }), cada um com os seus nomes;
     - texto corrido com os comandos, tabelas e colunas entre crases (selos);
     - todo exemplo de leitura roda na base e devolve linhas — as conferências
       automáticas (conferencia.js) conferem, como fazem com os gabaritos.
   O mapa das tabelas e os indicadores vêm do dicionario.js (nomes, tipos,
   chaves, ligações e descrições): aqui só o que o dicionário não tem.
   ========================================================================== */

/**
 * A sintaxe, cláusula por cláusula, na ordem em que a trilha ensina.
 * Cada item: o nome (como aparece no título — código, ou { pt, en } quando
 * não é código), uma frase e um exemplo que abre no laboratório.
 */
export const sintaxe = [
  {
    grupo: { pt: 'Escolher colunas', en: 'Choosing columns' },
    itens: [
      {
        nome: 'SELECT … FROM',
        texto: { pt: '`SELECT` diz o que mostrar; `FROM`, de qual tabela. O `*` quer dizer todas as colunas.', en: '`SELECT` says what to show; `FROM`, from which table. `*` means every column.' },
        sql: 'SELECT country_name, capital_city FROM countries',
      },
      {
        nome: 'AS',
        texto: { pt: 'Dá um apelido a uma coluna do resultado. Com espaço, entre aspas duplas.', en: 'Gives a result column a nickname. With spaces, in double quotes.' },
        sql: { pt: 'SELECT nome_pais AS pais, capital AS "capital do país" FROM paises', en: 'SELECT country_name AS country, capital_city AS "capital city" FROM countries' },
      },
      {
        nome: 'DISTINCT',
        texto: { pt: 'Tira as linhas repetidas: cada combinação aparece uma vez.', en: 'Removes repeated rows: each combination shows up once.' },
        sql: 'SELECT DISTINCT topic FROM indicators',
      },
      {
        nome: '+ − * /',
        texto: { pt: 'Contas com colunas de números, linha por linha.', en: 'Arithmetic on number columns, row by row.' },
        sql: { pt: 'SELECT titulo, orcamento_usd / 1000000 AS milhoes FROM projetos', en: 'SELECT title, budget_usd / 1000000 AS millions FROM projects' },
      },
      {
        nome: '||',
        texto: { pt: 'Junta textos numa coluna só. Pedaços fixos vão entre aspas simples.', en: 'Joins text into a single column. Fixed pieces go in single quotes.' },
        sql: "SELECT region_code || ' - ' || region_name FROM regions",
      },
      {
        nome: 'LIMIT',
        texto: { pt: 'Mostra no máximo tantas linhas — bom para espiar uma tabela grande.', en: 'Shows at most that many rows — handy to peek at a big table.' },
        sql: 'SELECT * FROM country_year LIMIT 10',
      },
      {
        nome: '--',
        texto: { pt: 'Comentário: o banco ignora tudo depois de `--`, até o fim da linha.', en: 'Comment: the database ignores everything after `--`, to the end of the line.' },
        sql: { pt: '-- As sete regiões do Banco Mundial\nSELECT * FROM regioes', en: '-- The World Bank’s seven regions\nSELECT * FROM regions' },
      },
    ],
  },
  {
    grupo: { pt: 'Filtrar linhas', en: 'Filtering rows' },
    itens: [
      {
        nome: 'WHERE',
        texto: { pt: 'Só passam as linhas que cumprem a condição. Texto entre aspas simples, número sem.', en: 'Only rows meeting the condition get through. Text in single quotes, numbers without.' },
        sql: "SELECT country_name FROM countries WHERE region_code = 'LCN'",
      },
      {
        nome: '= <> < > <= >=',
        texto: { pt: 'Igual, diferente, menor, maior, menor ou igual, maior ou igual.', en: 'Equal, different, less, greater, less or equal, greater or equal.' },
        sql: 'SELECT full_name, salary_chf FROM staff WHERE salary_chf > 150000',
      },
      {
        nome: 'AND · OR · NOT',
        texto: { pt: '`AND` exige as duas; `OR`, qualquer uma; `NOT` inverte. Misturando, use parênteses.', en: '`AND` requires both; `OR`, either; `NOT` flips. When mixing, use parentheses.' },
        sql: 'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND life_expectancy > 80',
      },
      {
        nome: 'IN',
        texto: { pt: 'Compara com uma lista: o mesmo que um `OR` para cada valor.', en: 'Compares against a list: the same as one `OR` per value.' },
        sql: "SELECT full_name, department FROM staff WHERE department IN ('Research', 'Economics')",
      },
      {
        nome: 'BETWEEN',
        texto: { pt: 'Uma faixa, com as duas pontas incluídas.', en: 'A range, both ends included.' },
        sql: "SELECT year, internet_pct FROM country_year WHERE country_code = 'WLD' AND year BETWEEN 2010 AND 2020",
      },
      {
        nome: 'LIKE',
        texto: { pt: 'Procura um pedaço de texto: `%` é qualquer coisa; `_`, uma letra só.', en: 'Searches for a piece of text: `%` is anything; `_`, a single letter.' },
        sql: "SELECT country_name FROM countries WHERE country_name LIKE '%Islands%'",
      },
      {
        nome: 'IS NULL',
        texto: { pt: 'O vazio não é igual a nada: `= NULL` nunca funciona. Use `IS NULL` ou `IS NOT NULL`.', en: 'Empty equals nothing: `= NULL` never works. Use `IS NULL` or `IS NOT NULL`.' },
        sql: 'SELECT country_name FROM countries WHERE region_code IS NULL',
      },
    ],
  },
  {
    grupo: { pt: 'Ordenar e transformar', en: 'Sorting and transforming' },
    itens: [
      {
        nome: 'ORDER BY',
        texto: { pt: 'Ordena o resultado. `DESC` do maior para o menor; `ASC` (o padrão), o contrário.', en: 'Sorts the result. `DESC` from largest to smallest; `ASC` (the default), the other way.' },
        sql: 'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND life_expectancy IS NOT NULL ORDER BY life_expectancy DESC LIMIT 10',
      },
      {
        nome: 'CASE WHEN',
        texto: { pt: 'Um valor para cada condição, na ordem; `ELSE` para o resto.', en: 'One value per condition, in order; `ELSE` for the rest.' },
        sql: {
          pt: "SELECT nome, CASE WHEN salario_chf >= 150000 THEN 'alta' ELSE 'padrão' END AS faixa FROM equipe",
          en: "SELECT full_name, CASE WHEN salary_chf >= 150000 THEN 'high' ELSE 'standard' END AS band FROM staff",
        },
      },
      {
        nome: 'COALESCE',
        texto: { pt: 'O primeiro valor que não for vazio: bom para trocar `NULL` por outra coisa.', en: 'The first value that isn’t empty: handy to replace `NULL` with something else.' },
        sql: "SELECT country_name, COALESCE(capital_city, '—') FROM countries",
      },
      {
        nome: 'CAST',
        texto: { pt: 'Troca o tipo de um valor: número em texto, texto em data…', en: 'Changes a value’s type: number to text, text to date…' },
        sql: "SELECT CAST(year AS VARCHAR) || ': ' || country_code FROM country_year LIMIT 5",
      },
    ],
  },
  {
    grupo: { pt: 'Resumir e agrupar', en: 'Summarising and grouping' },
    itens: [
      {
        nome: 'COUNT · SUM · AVG · MIN · MAX',
        texto: { pt: 'Resumem muitas linhas num número só.', en: 'Summarise many rows into a single number.' },
        sql: 'SELECT COUNT(*), AVG(salary_chf), MAX(salary_chf) FROM staff',
      },
      {
        nome: 'GROUP BY',
        texto: { pt: 'Um resumo para cada grupo: uma linha por valor da coluna.', en: 'One summary per group: one row per value of the column.' },
        sql: 'SELECT department, COUNT(*) FROM staff GROUP BY department',
      },
      {
        nome: 'HAVING',
        texto: { pt: 'Filtra os grupos (o `WHERE` filtra as linhas, antes de agrupar).', en: 'Filters the groups (`WHERE` filters the rows, before grouping).' },
        sql: 'SELECT department, COUNT(*) FROM staff GROUP BY department HAVING COUNT(*) >= 10',
      },
    ],
  },
  {
    grupo: { pt: 'Juntar tabelas', en: 'Joining tables' },
    itens: [
      {
        nome: 'JOIN … ON',
        texto: { pt: 'Liga duas tabelas pela chave: só ficam as linhas que têm par.', en: 'Links two tables by their key: only rows with a match stay.' },
        sql: 'SELECT p.title, c.country_name FROM projects p JOIN countries c ON p.country_code = c.country_code',
      },
      {
        nome: 'LEFT JOIN',
        texto: { pt: 'Todas as linhas da tabela da esquerda; sem par, o lado direito fica vazio.', en: 'Every row of the left table; with no match, the right side is empty.' },
        sql: 'SELECT c.country_name, p.title FROM countries c LEFT JOIN projects p ON p.country_code = c.country_code',
      },
      {
        nome: { pt: 'Uma tabela com ela mesma', en: 'Self join' },
        texto: { pt: 'Uma tabela ligada a ela mesma: cada pessoa e quem é o gestor dela.', en: 'A table joined to itself: each person and their manager.' },
        sql: 'SELECT e.full_name, g.full_name FROM staff e JOIN staff g ON e.manager_id = g.staff_id',
      },
    ],
  },
  {
    grupo: { pt: 'Consultas dentro de consultas', en: 'Queries inside queries' },
    itens: [
      {
        nome: '( SELECT … )',
        texto: { pt: 'Uma subconsulta: o resultado de uma consulta usado dentro de outra.', en: 'A subquery: the result of one query used inside another.' },
        sql: 'SELECT full_name, salary_chf FROM staff WHERE salary_chf > (SELECT AVG(salary_chf) FROM staff)',
      },
      {
        nome: 'EXISTS',
        texto: { pt: 'Verdadeiro se a subconsulta devolve pelo menos uma linha.', en: 'True if the subquery returns at least one row.' },
        sql: 'SELECT c.country_name FROM countries c WHERE EXISTS (SELECT 1 FROM projects p WHERE p.country_code = c.country_code)',
      },
      {
        nome: 'UNION · INTERSECT · EXCEPT',
        texto: { pt: 'Juntam, cruzam ou subtraem os resultados de duas consultas com as mesmas colunas.', en: 'Combine, intersect or subtract the results of two queries with the same columns.' },
        sql: 'SELECT country_code FROM projects UNION SELECT country_code FROM field_trips',
      },
    ],
  },
  {
    grupo: { pt: 'Análise moderna', en: 'Modern analysis' },
    itens: [
      {
        nome: 'WITH',
        texto: { pt: 'Dá nome a uma consulta, para usá-la na seguinte como se fosse uma tabela.', en: 'Names a query, to use it in the next one as if it were a table.' },
        sql: {
          pt: 'WITH recente AS (SELECT * FROM pais_ano WHERE ano = 2023) SELECT codigo_pais, populacao FROM recente ORDER BY populacao DESC LIMIT 5',
          en: 'WITH recent AS (SELECT * FROM country_year WHERE year = 2023) SELECT country_code, population FROM recent ORDER BY population DESC LIMIT 5',
        },
      },
      {
        nome: 'ROW_NUMBER() OVER',
        texto: { pt: 'Numera as linhas dentro de cada grupo (`PARTITION BY`), na ordem pedida.', en: 'Numbers the rows within each group (`PARTITION BY`), in the order asked.' },
        sql: 'SELECT department, full_name, salary_chf, ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary_chf DESC) FROM staff',
      },
      {
        nome: 'LAG · LEAD',
        texto: { pt: 'O valor da linha anterior (ou da seguinte): bom para ver quanto mudou de um ano para o outro.', en: 'The previous (or next) row’s value: handy to see how much changed from one year to the next.' },
        sql: "SELECT year, internet_pct, internet_pct - LAG(internet_pct) OVER (ORDER BY year) FROM country_year WHERE country_code = 'WLD' ORDER BY year",
      },
      {
        nome: 'QUALIFY',
        texto: { pt: 'Filtra pelo resultado de uma função de janela — como um `WHERE` que vem depois dela.', en: 'Filters on the result of a window function — like a `WHERE` that comes after it.' },
        sql: 'SELECT department, full_name, salary_chf FROM staff QUALIFY ROW_NUMBER() OVER (PARTITION BY department ORDER BY salary_chf DESC) = 1',
      },
    ],
  },
  {
    grupo: { pt: 'Criar e alterar dados', en: 'Creating and changing data' },
    // Estes mudam a base: no laboratório, entram no editor sem rodar sozinhos.
    itens: [
      {
        nome: 'CREATE TABLE',
        texto: { pt: 'Cria uma tabela: cada coluna com o seu tipo. `PRIMARY KEY` marca a chave.', en: 'Creates a table: each column with its type. `PRIMARY KEY` marks the key.' },
        sql: { pt: 'CREATE TABLE notas (id INTEGER PRIMARY KEY, texto VARCHAR)', en: 'CREATE TABLE notes (id INTEGER PRIMARY KEY, body VARCHAR)' },
      },
      {
        nome: 'INSERT INTO',
        texto: { pt: 'Acrescenta linhas, com um valor para cada coluna.', en: 'Adds rows, with one value per column.' },
        sql: { pt: "INSERT INTO notas VALUES (1, 'primeira nota')", en: "INSERT INTO notes VALUES (1, 'first note')" },
      },
      {
        nome: 'UPDATE',
        texto: { pt: 'Muda valores das linhas que cumprem o `WHERE` — sem `WHERE`, de todas.', en: 'Changes values in the rows meeting the `WHERE` — without `WHERE`, in all of them.' },
        sql: { pt: "UPDATE notas SET texto = 'nota revista' WHERE id = 1", en: "UPDATE notes SET body = 'revised note' WHERE id = 1" },
      },
      {
        nome: 'DELETE',
        texto: { pt: 'Apaga as linhas que cumprem o `WHERE` — sem `WHERE`, todas.', en: 'Deletes the rows meeting the `WHERE` — without `WHERE`, all of them.' },
        sql: { pt: 'DELETE FROM notas WHERE id = 1', en: 'DELETE FROM notes WHERE id = 1' },
      },
    ],
  },
];

/** As funções mais usadas: a assinatura, o que faz e um exemplo curto. */
export const funcoes = [
  {
    grupo: { pt: 'Texto', en: 'Text' },
    itens: [
      { nome: 'UPPER(texto) · LOWER(texto)', texto: { pt: 'Tudo em maiúsculas ou minúsculas.', en: 'All upper or lower case.' }, exemplo: 'UPPER(country_name)' },
      { nome: 'LENGTH(texto)', texto: { pt: 'Quantas letras o texto tem.', en: 'How many characters the text has.' }, exemplo: 'LENGTH(country_name)' },
      { nome: 'TRIM(texto)', texto: { pt: 'Tira os espaços do começo e do fim.', en: 'Removes spaces at the start and end.' }, exemplo: 'TRIM(job_title)' },
      { nome: 'SUBSTRING(texto, início, tamanho)', texto: { pt: 'Um pedaço do texto (a primeira letra é a 1).', en: 'A piece of the text (the first letter is 1).' }, exemplo: 'SUBSTRING(country_name, 1, 3)' },
      { nome: 'REPLACE(texto, de, para)', texto: { pt: 'Troca um pedaço por outro.', en: 'Swaps one piece for another.' }, exemplo: "REPLACE(title, ':', ' —')" },
    ],
  },
  {
    grupo: { pt: 'Números', en: 'Numbers' },
    itens: [
      { nome: 'ROUND(número, casas)', texto: { pt: 'Arredonda para tantas casas decimais.', en: 'Rounds to that many decimal places.' }, exemplo: 'ROUND(gdp_per_capita, 0)' },
      { nome: 'ABS(número)', texto: { pt: 'O valor sem o sinal.', en: 'The value without its sign.' }, exemplo: 'ABS(latitude)' },
      { nome: 'CEIL(número) · FLOOR(número)', texto: { pt: 'Arredonda para cima ou para baixo.', en: 'Rounds up or down.' }, exemplo: 'CEIL(life_expectancy)' },
    ],
  },
  {
    grupo: { pt: 'Vazios e tipos', en: 'Empty values and types' },
    itens: [
      { nome: 'COALESCE(a, b, …)', texto: { pt: 'O primeiro valor que não for `NULL`.', en: 'The first value that isn’t `NULL`.' }, exemplo: 'COALESCE(gini, 0)' },
      { nome: 'NULLIF(a, b)', texto: { pt: '`NULL` se os dois forem iguais — evita divisão por zero.', en: '`NULL` if both are equal — avoids division by zero.' }, exemplo: 'gdp_usd / NULLIF(population, 0)' },
      { nome: 'CAST(valor AS tipo)', texto: { pt: 'Troca o tipo do valor.', en: 'Changes the value’s type.' }, exemplo: 'CAST(year AS VARCHAR)' },
    ],
  },
  {
    grupo: { pt: 'Datas', en: 'Dates' },
    itens: [
      { nome: 'YEAR(data) · MONTH(data)', texto: { pt: 'O ano ou o mês de uma data.', en: 'The year or month of a date.' }, exemplo: 'YEAR(hire_date)' },
      { nome: 'DATE_TRUNC(parte, data)', texto: { pt: 'Corta a data no mês, no ano…', en: 'Truncates the date to the month, the year…' }, exemplo: "DATE_TRUNC('month', paid_on)" },
      { nome: 'data − data', texto: { pt: 'Quantos dias entre duas datas.', en: 'How many days between two dates.' }, exemplo: 'return_date - departure_date' },
      { nome: 'STRFTIME(data, formato)', texto: { pt: 'A data como texto, no formato pedido.', en: 'The date as text, in the format asked.' }, exemplo: "STRFTIME(hire_date, '%d/%m/%Y')" },
    ],
  },
  {
    grupo: { pt: 'Resumos (com GROUP BY)', en: 'Summaries (with GROUP BY)' },
    itens: [
      { nome: 'COUNT(*) · COUNT(coluna)', texto: { pt: 'Quantas linhas — ou quantos valores não vazios.', en: 'How many rows — or how many non-empty values.' }, exemplo: 'COUNT(gini)' },
      { nome: 'SUM · AVG · MIN · MAX', texto: { pt: 'Soma, média, menor e maior.', en: 'Sum, average, smallest and largest.' }, exemplo: 'AVG(salary_chf)' },
      { nome: 'MEDIAN(coluna)', texto: { pt: 'O valor do meio: menos sensível aos extremos que a média.', en: 'The middle value: less sensitive to extremes than the average.' }, exemplo: 'MEDIAN(salary_chf)' },
      { nome: 'STRING_AGG(texto, separador)', texto: { pt: 'Junta os textos do grupo num só.', en: 'Joins the group’s texts into one.' }, exemplo: "STRING_AGG(full_name, ', ')" },
    ],
  },
  {
    grupo: { pt: 'Janela (com OVER)', en: 'Window (with OVER)' },
    itens: [
      { nome: 'ROW_NUMBER() · RANK() · DENSE_RANK()', texto: { pt: 'A posição de cada linha; `RANK` repete nos empates.', en: 'Each row’s position; `RANK` repeats on ties.' }, exemplo: 'RANK() OVER (ORDER BY salary_chf DESC)' },
      { nome: 'LAG(coluna) · LEAD(coluna)', texto: { pt: 'O valor da linha anterior ou da seguinte.', en: 'The previous or next row’s value.' }, exemplo: 'LAG(population) OVER (ORDER BY year)' },
      { nome: 'SUM(…) OVER (ORDER BY …)', texto: { pt: 'O total acumulado até cada linha.', en: 'The running total up to each row.' }, exemplo: 'SUM(amount_usd) OVER (ORDER BY paid_on)' },
    ],
  },
];

/**
 * Os 12 indicadores, agrupados por tema: a coluna de country_year e o código
 * no Banco Mundial. O que cada um mede vem do dicionário; o cuidado (curto,
 * vira selo ao lado do nome), daqui — e só daqui.
 * O tema é uma chave de cola.temas no i18n.
 */
export const indicadores = [
  {
    tema: 'sociedade',
    itens: [
      { coluna: 'population', codigo: 'SP.POP.TOTL' },
      { coluna: 'urban_pct', codigo: 'SP.URB.TOTL.IN.ZS' },
    ],
  },
  {
    tema: 'economia',
    itens: [
      { coluna: 'gdp_usd', codigo: 'NY.GDP.MKTP.CD' },
      { coluna: 'gdp_per_capita', codigo: 'NY.GDP.PCAP.CD' },
      { coluna: 'gini', codigo: 'SI.POV.GINI', cuidado: { pt: 'muitos vazios', en: 'many empty values' } },
    ],
  },
  {
    tema: 'saude',
    itens: [
      { coluna: 'life_expectancy', codigo: 'SP.DYN.LE00.IN' },
      { coluna: 'under5_mortality', codigo: 'SH.DYN.MORT' },
      { coluna: 'health_spend_pct', codigo: 'SH.XPD.CHEX.GD.ZS' },
    ],
  },
  {
    tema: 'energia',
    itens: [
      { coluna: 'co2_per_capita', codigo: 'EN.GHG.CO2.PC.CE.AR5' },
      { coluna: 'renewable_pct', codigo: 'EG.FEC.RNEW.ZS', cuidado: { pt: 'até 2021', en: 'up to 2021' } },
      { coluna: 'electricity_pct', codigo: 'EG.ELC.ACCS.ZS' },
    ],
  },
  {
    tema: 'digital',
    itens: [
      { coluna: 'internet_pct', codigo: 'IT.NET.USER.ZS' },
    ],
  },
];

/**
 * "Em outros bancos", em destaque nos três cards: a MESMA consulta inteira no
 * DuckDB (este site), no Oracle e no BigQuery — as primeiras linhas, onde os
 * três ficam visivelmente diferentes. O SQL do DuckDB e o do Oracle vão em
 * inglês e são traduzidos na hora. O do BigQuery vai nos dois idiomas à mão:
 * dentro das crases, "project" e "dataset" não são nomes da base, e o
 * tradutor os deixaria em inglês na versão em português. A consulta do DuckDB
 * roda nas conferências automáticas.
 */
export const destaqueOutrosBancos = {
  duckdb: 'SELECT country_code, population\nFROM country_year\nWHERE year = 2020\nORDER BY population DESC\nLIMIT 10',
  oracle: 'SELECT country_code, population\nFROM country_year\nWHERE year = 2020\nORDER BY population DESC\nFETCH FIRST 10 ROWS ONLY',
  oracleAntigo: 'WHERE ROWNUM <= 10',
  bigquery: {
    pt: 'SELECT codigo_pais, populacao\nFROM `projeto.base.pais_ano`\nWHERE ano = 2020\nORDER BY populacao DESC\nLIMIT 10',
    en: 'SELECT country_code, population\nFROM `project.dataset.country_year`\nWHERE year = 2020\nORDER BY population DESC\nLIMIT 10',
  },
};

/**
 * "Em outros bancos", no painel do "Exibir mais": as outras diferenças, cada
 * pedido no DuckDB (este site), no Oracle e no BigQuery. A sintaxe antiga do
 * Oracle aparece SÓ nas Dicas (regra do projeto).
 */
export const outrosBancos = [
  {
    tema: { pt: 'Juntar tabelas', en: 'Joining tables' },
    duckdb: 'JOIN b ON a.id = b.id',
    oracle: 'JOIN b ON a.id = b.id',
    oracleAntigo: 'FROM a, b WHERE a.id = b.id(+)',
    bigquery: 'JOIN b ON a.id = b.id',
  },
  {
    tema: { pt: 'Trocar o vazio', en: 'Replacing empty values' },
    duckdb: 'COALESCE(x, 0)',
    oracle: 'COALESCE(x, 0)',
    oracleAntigo: 'NVL(x, 0)',
    bigquery: 'IFNULL(x, 0)',
  },
  {
    tema: { pt: 'Um valor para cada caso', en: 'One value per case' },
    // Quebrado no ELSE, como o botão Formatar faria: numa linha só, não cabe
    // na coluna de um banco (decisão do Fernando; nada de quebra automática).
    duckdb: "CASE WHEN x = 'a' THEN 1\nELSE 0 END",
    oracle: "CASE WHEN x = 'a' THEN 1\nELSE 0 END",
    oracleAntigo: "DECODE(x, 'a', 1, 0)",
    bigquery: "IF(x = 'a', 1, 0)",
  },
  {
    tema: { pt: 'Juntar textos', en: 'Joining text' },
    duckdb: "a || ' ' || b",
    oracle: "a || ' ' || b",
    oracleAntigo: null,
    bigquery: "CONCAT(a, ' ', b)",
  },
  {
    tema: { pt: 'Dividir sem erro por zero', en: 'Dividing without a zero error' },
    duckdb: 'x / NULLIF(y, 0)',
    oracle: 'x / NULLIF(y, 0)',
    oracleAntigo: null,
    bigquery: 'SAFE_DIVIDE(x, y)',
  },
  {
    tema: { pt: 'A data de hoje', en: 'Today’s date' },
    duckdb: 'current_date',
    oracle: 'SYSDATE',
    oracleAntigo: null,
    bigquery: 'CURRENT_DATE()',
  },
];

/** O glossário: o termo em português e o que se lê em inglês (e na documentação). */
export const glossario = [
  { pt: 'consulta', en: 'query' },
  { pt: 'tabela', en: 'table' },
  { pt: 'coluna', en: 'column' },
  { pt: 'linha', en: 'row' },
  { pt: 'valor vazio', en: 'null' },
  { pt: 'tipo de dado', en: 'data type' },
  { pt: 'chave primária', en: 'primary key' },
  { pt: 'chave estrangeira', en: 'foreign key' },
  { pt: 'apelido', en: 'alias' },
  { pt: 'filtro', en: 'filter' },
  { pt: 'condição', en: 'condition' },
  { pt: 'ordenar', en: 'sort · order by' },
  { pt: 'agrupar', en: 'group by' },
  { pt: 'função de agregação', en: 'aggregate function' },
  { pt: 'junção', en: 'join' },
  { pt: 'junção externa', en: 'outer join' },
  { pt: 'subconsulta', en: 'subquery' },
  { pt: 'função de janela', en: 'window function' },
  { pt: 'expressão de tabela comum', en: 'common table expression (CTE)' },
  { pt: 'visão', en: 'view' },
  { pt: 'transação', en: 'transaction' },
  { pt: 'esquema', en: 'schema' },
  { pt: 'resultado', en: 'result set' },
  { pt: 'banco de dados', en: 'database' },
];
