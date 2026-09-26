/* ==========================================================================
   dicionario.js — as 11 tabelas da base, com nome e descrição em PT e EN.

   É CONTEÚDO, não código. Quem usa:
     - bd.js (passo 5): cria cada tabela a partir do CSV com os nomes do
       idioma da tela (paises.nome_pais em PT, countries.country_name em EN);
     - traducao-sql.js (passo 5): troca nomes de tabela e coluna de um idioma
       para o outro;
     - as Dicas (a antiga cola, passo 18): as tabelas, as colunas e os
       indicadores. As descrições só com a definição: os cuidados de um
       indicador ("até 2021") moram em dados/cola.js;
     - conferencia.js (passo 9): toda tabela e coluna usada numa missão tem
       de estar aqui.

   Regras:
     - a CHAVE de cada tabela e de cada coluna é o nome em inglês, igual ao
       cabeçalho do CSV; `pt` é o nome em português;
     - a ORDEM das colunas aqui é a ordem das colunas no CSV;
     - nomes em português sem acento e sem ç: são para digitar numa consulta;
     - `chave: 'primaria'` marca o que identifica cada linha;
     - `referencia` diz para qual tabela.coluna uma coluna aponta (em inglês).
   ========================================================================== */

export const dicionario = {
  /* ------------------------------------------------------------------------
     MUNDO — dados reais do Banco Mundial (WDI), CC BY 4.0, 2000 a 2023
     ------------------------------------------------------------------------ */

  regions: {
    pt: 'regioes',
    grupo: 'mundo',
    arquivo: 'mundo/regions.csv',
    descricao: {
      pt: 'As 7 regiões em que o Banco Mundial divide os países.',
      en: 'The 7 regions the World Bank groups countries into.',
    },
    colunas: {
      region_code: {
        pt: 'codigo_regiao',
        tipo: 'VARCHAR',
        chave: 'primaria',
        descricao: { pt: 'Código da região, de 3 letras (ex.: LCN).', en: 'Three-letter region code (e.g. LCN).' },
      },
      region_name: {
        pt: 'nome_regiao',
        tipo: 'VARCHAR',
        descricao: { pt: 'Nome da região, em inglês.', en: 'Region name.' },
      },
    },
  },

  countries: {
    pt: 'paises',
    grupo: 'mundo',
    arquivo: 'mundo/countries.csv',
    descricao: {
      pt: '217 países e territórios, mais 17 agregados (World, Euro area, grupos de renda…). Os agregados não têm região — cuidado ao somar ou comparar.',
      en: '217 countries and territories, plus 17 aggregates (World, Euro area, income groups…). Aggregates have no region — watch out when adding up or comparing.',
    },
    colunas: {
      country_code: {
        pt: 'codigo_pais',
        tipo: 'VARCHAR',
        chave: 'primaria',
        descricao: { pt: 'Código de 3 letras (ex.: BRA, WLD).', en: 'Three-letter code (e.g. BRA, WLD).' },
      },
      country_name: {
        pt: 'nome_pais',
        tipo: 'VARCHAR',
        descricao: { pt: 'Nome, em inglês, como o Banco Mundial escreve.', en: 'Name, as the World Bank writes it.' },
      },
      region_code: {
        pt: 'codigo_regiao',
        tipo: 'VARCHAR',
        referencia: 'regions.region_code',
        descricao: { pt: 'Região do país. Vazio (NULL) nos agregados.', en: 'The country’s region. Empty (NULL) for aggregates.' },
      },
      income_group: {
        pt: 'grupo_renda',
        tipo: 'VARCHAR',
        descricao: {
          pt: 'Grupo de renda na classificação atual do Banco Mundial (Low, Lower middle, Upper middle, High income). Vazio nos agregados.',
          en: 'Income group in the current World Bank classification (Low, Lower middle, Upper middle, High income). Empty for aggregates.',
        },
      },
      capital_city: {
        pt: 'capital',
        tipo: 'VARCHAR',
        descricao: { pt: 'Capital. Vazio nos agregados e em alguns territórios.', en: 'Capital city. Empty for aggregates and some territories.' },
      },
      latitude: {
        pt: 'latitude',
        tipo: 'DOUBLE',
        descricao: { pt: 'Latitude da capital, em graus.', en: 'Latitude of the capital, in degrees.' },
      },
      longitude: {
        pt: 'longitude',
        tipo: 'DOUBLE',
        descricao: { pt: 'Longitude da capital, em graus.', en: 'Longitude of the capital, in degrees.' },
      },
    },
  },

  indicators: {
    pt: 'indicadores',
    grupo: 'mundo',
    arquivo: 'mundo/indicators.csv',
    descricao: {
      pt: 'Os 12 indicadores da base: de onde vêm, em que unidade estão e o nome da coluna em pais_ano.',
      en: 'The 12 indicators in the database: where they come from, their unit and their column name in country_year.',
    },
    colunas: {
      indicator_code: {
        pt: 'codigo_indicador',
        tipo: 'VARCHAR',
        chave: 'primaria',
        descricao: { pt: 'Código do indicador no Banco Mundial (ex.: SP.POP.TOTL).', en: 'World Bank indicator code (e.g. SP.POP.TOTL).' },
      },
      column_name: {
        pt: 'nome_coluna',
        tipo: 'VARCHAR',
        descricao: { pt: 'Nome da coluna em country_year, em inglês.', en: 'Column name in country_year.' },
      },
      indicator_name: {
        pt: 'nome_indicador',
        tipo: 'VARCHAR',
        descricao: { pt: 'Nome completo do indicador, em inglês.', en: 'Full indicator name.' },
      },
      unit: {
        pt: 'unidade',
        tipo: 'VARCHAR',
        descricao: { pt: 'Unidade de medida, em inglês.', en: 'Unit of measure.' },
      },
      topic: {
        pt: 'tema',
        tipo: 'VARCHAR',
        descricao: {
          pt: 'Tema, em inglês: economy, society, health, climate, energy ou inequality.',
          en: 'Topic: economy, society, health, climate, energy or inequality.',
        },
      },
    },
  },

  country_year: {
    pt: 'pais_ano',
    grupo: 'mundo',
    arquivo: 'mundo/country_year.csv',
    descricao: {
      pt: 'Uma linha por país e ano, de 2000 a 2023, com os 12 indicadores lado a lado. Vazio (NULL) onde o Banco Mundial não tem o dado.',
      en: 'One row per country and year, 2000 to 2023, with the 12 indicators side by side. Empty (NULL) where the World Bank has no data.',
    },
    colunas: {
      country_code: {
        pt: 'codigo_pais',
        tipo: 'VARCHAR',
        chave: 'primaria',
        referencia: 'countries.country_code',
        descricao: { pt: 'Código do país.', en: 'Country code.' },
      },
      year: {
        pt: 'ano',
        tipo: 'INTEGER',
        chave: 'primaria',
        descricao: { pt: 'Ano, de 2000 a 2023.', en: 'Year, 2000 to 2023.' },
      },
      population: {
        pt: 'populacao',
        tipo: 'BIGINT',
        descricao: { pt: 'População total, em pessoas.', en: 'Total population, in people.' },
      },
      gdp_usd: {
        pt: 'pib_usd',
        tipo: 'BIGINT',
        descricao: { pt: 'PIB em dólares correntes (do próprio ano).', en: 'GDP in current US dollars (of that year).' },
      },
      gdp_per_capita: {
        pt: 'pib_per_capita',
        tipo: 'DOUBLE',
        descricao: { pt: 'PIB por pessoa, em dólares correntes.', en: 'GDP per person, in current US dollars.' },
      },
      life_expectancy: {
        pt: 'expectativa_vida',
        tipo: 'DOUBLE',
        descricao: { pt: 'Expectativa de vida ao nascer, em anos.', en: 'Life expectancy at birth, in years.' },
      },
      co2_per_capita: {
        pt: 'co2_per_capita',
        tipo: 'DOUBLE',
        descricao: {
          pt: 'Emissões de CO₂ por pessoa, em toneladas (sem uso da terra e florestas).',
          en: 'CO₂ emissions per person, in tonnes (excluding land use and forestry).',
        },
      },
      renewable_pct: {
        pt: 'renovavel_pct',
        tipo: 'DOUBLE',
        descricao: {
          pt: 'Parte renovável do consumo final de energia, em %.',
          en: 'Renewable share of final energy consumption, in %.',
        },
      },
      internet_pct: {
        pt: 'internet_pct',
        tipo: 'DOUBLE',
        descricao: { pt: 'Pessoas que usam a internet, em % da população.', en: 'People using the internet, as % of the population.' },
      },
      gini: {
        pt: 'gini',
        tipo: 'DOUBLE',
        descricao: {
          pt: 'Índice de Gini, de 0 (renda igual para todos) a 100 (desigualdade máxima).',
          en: 'Gini index, from 0 (equal income for all) to 100 (maximum inequality).',
        },
      },
      urban_pct: {
        pt: 'urbana_pct',
        tipo: 'DOUBLE',
        descricao: { pt: 'População que vive em cidades, em %.', en: 'Population living in urban areas, in %.' },
      },
      electricity_pct: {
        pt: 'eletricidade_pct',
        tipo: 'DOUBLE',
        descricao: { pt: 'População com acesso à eletricidade, em %.', en: 'Population with access to electricity, in %.' },
      },
      under5_mortality: {
        pt: 'mortalidade_menores_5',
        tipo: 'DOUBLE',
        descricao: {
          pt: 'Mortes de crianças antes dos 5 anos, a cada 1.000 nascidas vivas.',
          en: 'Deaths of children before age 5, per 1,000 live births.',
        },
      },
      health_spend_pct: {
        pt: 'gasto_saude_pct',
        tipo: 'DOUBLE',
        descricao: { pt: 'Gasto corrente com saúde, em % do PIB.', en: 'Current health expenditure, as % of GDP.' },
      },
    },
  },

  indicator_values: {
    pt: 'valores_indicadores',
    grupo: 'mundo',
    arquivo: 'mundo/indicator_values.csv',
    descricao: {
      pt: 'Os mesmos dados de pais_ano em formato longo: uma linha por país, indicador e ano. Só os valores que existem.',
      en: 'The same data as country_year in long format: one row per country, indicator and year. Only values that exist.',
    },
    colunas: {
      country_code: {
        pt: 'codigo_pais',
        tipo: 'VARCHAR',
        chave: 'primaria',
        referencia: 'countries.country_code',
        descricao: { pt: 'Código do país.', en: 'Country code.' },
      },
      indicator_code: {
        pt: 'codigo_indicador',
        tipo: 'VARCHAR',
        chave: 'primaria',
        referencia: 'indicators.indicator_code',
        descricao: { pt: 'Código do indicador.', en: 'Indicator code.' },
      },
      year: {
        pt: 'ano',
        tipo: 'INTEGER',
        chave: 'primaria',
        descricao: { pt: 'Ano, de 2000 a 2023.', en: 'Year, 2000 to 2023.' },
      },
      value: {
        pt: 'valor',
        tipo: 'DOUBLE',
        descricao: { pt: 'O valor, na unidade do indicador.', en: 'The value, in the indicator’s unit.' },
      },
    },
  },

  /* ------------------------------------------------------------------------
     INSTITUTO — dados inventados do Observatório Meridiano (semente fixa)
     ------------------------------------------------------------------------ */

  staff: {
    pt: 'equipe',
    grupo: 'instituto',
    arquivo: 'instituto/staff.csv',
    descricao: {
      pt: 'As 60 pessoas do Observatório, com cargo, departamento e gestor.',
      en: 'The Observatory’s 60 staff members, with job title, department and manager.',
    },
    colunas: {
      staff_id: {
        pt: 'id_funcionario',
        tipo: 'INTEGER',
        chave: 'primaria',
        descricao: { pt: 'Número da pessoa.', en: 'Staff member number.' },
      },
      full_name: {
        pt: 'nome',
        tipo: 'VARCHAR',
        descricao: { pt: 'Nome completo.', en: 'Full name.' },
      },
      job_title: {
        pt: 'cargo',
        tipo: 'VARCHAR',
        descricao: { pt: 'Cargo, em inglês.', en: 'Job title.' },
      },
      department: {
        pt: 'departamento',
        tipo: 'VARCHAR',
        descricao: { pt: 'Departamento, em inglês.', en: 'Department.' },
      },
      manager_id: {
        pt: 'id_gestor',
        tipo: 'INTEGER',
        referencia: 'staff.staff_id',
        descricao: {
          pt: 'Número de quem é gestor desta pessoa — outra linha desta mesma tabela. Vazio para a diretora-geral.',
          en: 'Number of this person’s manager — another row of this same table. Empty for the director-general.',
        },
      },
      nationality_code: {
        pt: 'codigo_nacionalidade',
        tipo: 'VARCHAR',
        referencia: 'countries.country_code',
        descricao: { pt: 'Nacionalidade, com o código de país.', en: 'Nationality, as a country code.' },
      },
      hire_date: {
        pt: 'data_admissao',
        tipo: 'DATE',
        descricao: { pt: 'Data de entrada no Observatório.', en: 'Date the person joined the Observatory.' },
      },
      salary_chf: {
        pt: 'salario_chf',
        tipo: 'INTEGER',
        descricao: { pt: 'Salário anual, em francos suíços.', en: 'Annual salary, in Swiss francs.' },
      },
    },
  },

  projects: {
    pt: 'projetos',
    grupo: 'instituto',
    arquivo: 'instituto/projects.csv',
    descricao: {
      pt: 'Os 80 projetos de cooperação do Observatório, cada um num país. Projeto sem data de fim ainda está em andamento.',
      en: 'The Observatory’s 80 cooperation projects, each in one country. A project with no end date is still running.',
    },
    colunas: {
      project_id: {
        pt: 'id_projeto',
        tipo: 'INTEGER',
        chave: 'primaria',
        descricao: { pt: 'Número do projeto.', en: 'Project number.' },
      },
      title: {
        pt: 'titulo',
        tipo: 'VARCHAR',
        descricao: { pt: 'Título do projeto, em inglês.', en: 'Project title.' },
      },
      topic: {
        pt: 'tema',
        tipo: 'VARCHAR',
        descricao: {
          pt: 'Tema, em inglês: energy, health, climate, inequality ou digital.',
          en: 'Topic: energy, health, climate, inequality or digital.',
        },
      },
      country_code: {
        pt: 'codigo_pais',
        tipo: 'VARCHAR',
        referencia: 'countries.country_code',
        descricao: { pt: 'País onde o projeto acontece.', en: 'Country where the project takes place.' },
      },
      lead_id: {
        pt: 'id_responsavel',
        tipo: 'INTEGER',
        referencia: 'staff.staff_id',
        descricao: { pt: 'Quem lidera o projeto.', en: 'Who leads the project.' },
      },
      start_date: {
        pt: 'data_inicio',
        tipo: 'DATE',
        descricao: { pt: 'Data de início.', en: 'Start date.' },
      },
      end_date: {
        pt: 'data_fim',
        tipo: 'DATE',
        descricao: { pt: 'Data de fim. Vazio (NULL) se o projeto ainda está em andamento.', en: 'End date. Empty (NULL) if the project is still running.' },
      },
      budget_usd: {
        pt: 'orcamento_usd',
        tipo: 'INTEGER',
        descricao: { pt: 'Orçamento total, em dólares.', en: 'Total budget, in US dollars.' },
      },
    },
  },

  disbursements: {
    pt: 'desembolsos',
    grupo: 'instituto',
    arquivo: 'instituto/disbursements.csv',
    descricao: {
      pt: 'Os 1.500 pagamentos feitos pelos projetos. Alguns foram lançados duas vezes por engano.',
      en: 'The 1,500 payments made by the projects. Some were entered twice by mistake.',
    },
    colunas: {
      disbursement_id: {
        pt: 'id_desembolso',
        tipo: 'INTEGER',
        chave: 'primaria',
        descricao: { pt: 'Número do pagamento.', en: 'Payment number.' },
      },
      project_id: {
        pt: 'id_projeto',
        tipo: 'INTEGER',
        referencia: 'projects.project_id',
        descricao: { pt: 'Projeto que pagou.', en: 'Project that made the payment.' },
      },
      paid_on: {
        pt: 'data_pagamento',
        tipo: 'DATE',
        descricao: { pt: 'Data do pagamento.', en: 'Payment date.' },
      },
      amount_usd: {
        pt: 'valor_usd',
        tipo: 'DECIMAL(12,2)',
        descricao: { pt: 'Valor, em dólares.', en: 'Amount, in US dollars.' },
      },
      category: {
        pt: 'categoria',
        tipo: 'VARCHAR',
        descricao: {
          pt: 'Categoria, em inglês: personnel, travel, equipment, grants, training ou consultancy.',
          en: 'Category: personnel, travel, equipment, grants, training or consultancy.',
        },
      },
    },
  },

  field_trips: {
    pt: 'viagens',
    grupo: 'instituto',
    arquivo: 'instituto/field_trips.csv',
    descricao: {
      pt: 'As 400 viagens de trabalho da equipe. As conferências não têm projeto.',
      en: 'The staff’s 400 work trips. Conferences have no project.',
    },
    colunas: {
      trip_id: {
        pt: 'id_viagem',
        tipo: 'INTEGER',
        chave: 'primaria',
        descricao: { pt: 'Número da viagem.', en: 'Trip number.' },
      },
      staff_id: {
        pt: 'id_funcionario',
        tipo: 'INTEGER',
        referencia: 'staff.staff_id',
        descricao: { pt: 'Quem viajou.', en: 'Who travelled.' },
      },
      project_id: {
        pt: 'id_projeto',
        tipo: 'INTEGER',
        referencia: 'projects.project_id',
        descricao: { pt: 'Projeto da viagem. Vazio (NULL) nas conferências.', en: 'Project of the trip. Empty (NULL) for conferences.' },
      },
      country_code: {
        pt: 'codigo_pais',
        tipo: 'VARCHAR',
        referencia: 'countries.country_code',
        descricao: { pt: 'País de destino.', en: 'Destination country.' },
      },
      departure_date: {
        pt: 'data_ida',
        tipo: 'DATE',
        descricao: { pt: 'Data de ida.', en: 'Departure date.' },
      },
      return_date: {
        pt: 'data_volta',
        tipo: 'DATE',
        descricao: { pt: 'Data de volta.', en: 'Return date.' },
      },
      cost_usd: {
        pt: 'custo_usd',
        tipo: 'DECIMAL(10,2)',
        descricao: { pt: 'Custo total, em dólares.', en: 'Total cost, in US dollars.' },
      },
      purpose: {
        pt: 'motivo',
        tipo: 'VARCHAR',
        descricao: {
          pt: 'Motivo, em inglês: field visit, data collection, workshop, partner meeting, monitoring visit ou conference.',
          en: 'Purpose: field visit, data collection, workshop, partner meeting, monitoring visit or conference.',
        },
      },
    },
  },

  publications: {
    pt: 'publicacoes',
    grupo: 'instituto',
    arquivo: 'instituto/publications.csv',
    descricao: {
      pt: 'As 150 publicações do Observatório. As gerais, como os relatórios anuais, não têm projeto.',
      en: 'The Observatory’s 150 publications. General ones, like the annual reports, have no project.',
    },
    colunas: {
      publication_id: {
        pt: 'id_publicacao',
        tipo: 'INTEGER',
        chave: 'primaria',
        descricao: { pt: 'Número da publicação.', en: 'Publication number.' },
      },
      title: {
        pt: 'titulo',
        tipo: 'VARCHAR',
        descricao: { pt: 'Título, em inglês.', en: 'Title.' },
      },
      pub_type: {
        pt: 'tipo',
        tipo: 'VARCHAR',
        descricao: {
          pt: 'Tipo, em inglês: report, working paper, policy brief, article ou data note.',
          en: 'Type: report, working paper, policy brief, article or data note.',
        },
      },
      published_on: {
        pt: 'data_publicacao',
        tipo: 'DATE',
        descricao: { pt: 'Data de publicação.', en: 'Publication date.' },
      },
      project_id: {
        pt: 'id_projeto',
        tipo: 'INTEGER',
        referencia: 'projects.project_id',
        descricao: { pt: 'Projeto de origem. Vazio (NULL) nas publicações gerais.', en: 'Source project. Empty (NULL) for general publications.' },
      },
      downloads: {
        pt: 'downloads',
        tipo: 'INTEGER',
        descricao: { pt: 'Quantas vezes foi baixada.', en: 'How many times it was downloaded.' },
      },
    },
  },

  authorships: {
    pt: 'autorias',
    grupo: 'instituto',
    arquivo: 'instituto/authorships.csv',
    descricao: {
      pt: 'Quem escreveu o quê: uma linha por autor de cada publicação. Uma publicação pode ter vários autores, e uma pessoa, várias publicações.',
      en: 'Who wrote what: one row per author of each publication. A publication can have several authors, and a person several publications.',
    },
    colunas: {
      publication_id: {
        pt: 'id_publicacao',
        tipo: 'INTEGER',
        chave: 'primaria',
        referencia: 'publications.publication_id',
        descricao: { pt: 'A publicação.', en: 'The publication.' },
      },
      staff_id: {
        pt: 'id_funcionario',
        tipo: 'INTEGER',
        chave: 'primaria',
        referencia: 'staff.staff_id',
        descricao: { pt: 'O autor.', en: 'The author.' },
      },
      author_position: {
        pt: 'posicao_autor',
        tipo: 'INTEGER',
        descricao: { pt: 'Posição na lista de autores (1 = primeiro autor).', en: 'Position in the author list (1 = first author).' },
      },
    },
  },
};
