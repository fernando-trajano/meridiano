/* ==========================================================================
   nivelamento.js — os 6 desafios do nivelamento.

   É CONTEÚDO, não código. Para quem já sabe um pouco de SQL não começar do
   zero: cada desafio mede o que um módulo ensina, do mais simples ao mais
   difícil, e acertá-lo libera o módulo SEGUINTE (o 0 já vem aberto).
   "Não sei fazer este" encerra o nivelamento ali.

     1. escolher colunas (módulo 0)      → libera o módulo 1
     2. DISTINCT (módulo 1)              → libera o módulo 2
     3. WHERE com AND (módulo 2)         → libera o módulo 3
     4. ORDER BY e LIMIT (módulo 3)      → libera o módulo 4
     5. GROUP BY e COUNT (módulo 4)      → libera o módulo 5
     6. JOIN (módulo 5)                  → libera o módulo 6

   Mesmas regras das missões (ver missoes/MODELO.md): gabarito UMA vez, em
   inglês; `tabelas` = as tabelas do gabarito; texto com selos entre crases,
   cada idioma com os seus nomes. Sem dicas: é um teste, não uma aula.
   Os números foram conferidos nos CSVs da base (passo 15).
   ========================================================================== */

export const desafiosDoNivelamento = [
  {
    libera: 'm1',
    enunciado: {
      pt: 'O nome e a capital de cada país da tabela `paises`.',
      en: 'The name and capital of every country in the `countries` table.',
    },
    gabarito: 'SELECT country_name, capital_city FROM countries',
    tabelas: ['countries'],
  },
  {
    libera: 'm2',
    enunciado: {
      pt: 'Os departamentos da equipe, cada um uma vez só.',
      en: 'The staff departments, each one only once.',
    },
    gabarito: 'SELECT DISTINCT department FROM staff',
    tabelas: ['staff'],
  },
  {
    libera: 'm3',
    enunciado: {
      pt: 'O título e o orçamento dos projetos de tema `\'energy\'` com orçamento acima de 1 milhão de dólares.',
      en: 'The title and budget of the `\'energy\'` projects with a budget over 1 million dollars.',
    },
    gabarito: "SELECT title, budget_usd FROM projects WHERE topic = 'energy' AND budget_usd > 1000000",
    tabelas: ['projects'],
  },
  {
    libera: 'm4',
    enunciado: {
      pt: 'Os 5 códigos com a maior expectativa de vida em 2023, da maior para a menor, com o valor.',
      en: 'The 5 codes with the highest life expectancy in 2023, from highest to lowest, with the value.',
    },
    gabarito: 'SELECT country_code, life_expectancy FROM country_year WHERE year = 2023 AND life_expectancy IS NOT NULL ORDER BY life_expectancy DESC LIMIT 5',
    tabelas: ['country_year'],
    conferir: { ordem: true },
  },
  {
    libera: 'm5',
    enunciado: {
      pt: 'Quantas pessoas trabalham em cada departamento: o departamento e a contagem.',
      en: 'How many people work in each department: the department and the count.',
    },
    gabarito: 'SELECT department, COUNT(*) FROM staff GROUP BY department',
    tabelas: ['staff'],
  },
  {
    libera: 'm6',
    enunciado: {
      pt: 'O título de cada projeto e o nome do país onde ele acontece.',
      en: 'The title of each project and the name of the country where it takes place.',
    },
    gabarito: 'SELECT p.title, c.country_name FROM projects p JOIN countries c ON p.country_code = c.country_code',
    tabelas: ['projects', 'countries'],
  },
];
