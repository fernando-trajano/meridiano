# Modelo de uma missão

O contrato entre o conteúdo e o código. Missões novas são escritas copiando o molde
abaixo. Um arquivo por módulo (`primeiro-dia.js`, `escolher-colunas.js`…), que exporta
`missoes`, na ordem. Depois de escrever, aponte `arquivo` para ele em `indice.js` e abra
o site com **`?conferencia`** no endereço, na trilha (`localhost:8030/?conferencia`): as 6
conferências rodam e avisam no console.

## A missão, campo por campo

```js
export const missoes = [
  {
    id: 'm1-03',                 // módulo 1, missão 3 — sempre mN-NN
    tipo: 'missao',              // missao | revisao | desafio | projeto
    titulo: { pt: 'Sem repetição', en: 'No repeats' },
    personagem: 'kofi',          // uma chave de dados/personagens.js
    hora: '09:14',               // a hora do pedido (opcional, HH:MM; não aparece na tela)

    // O pedido, do jeito que o personagem escreveria.
    pedido: {
      pt: 'Quais regiões aparecem na nossa lista de países? Cada uma uma vez só.',
      en: 'Which regions show up in our country list? Each one only once.',
    },

    // Uma linha que lembra o pedido na etapa do conceito ("Pedido: …").
    resumo: { pt: 'cada região uma vez só.', en: 'each region only once.' },

    // Os recursos que esta missão ENSINA (nomes canônicos, ver abaixo).
    conceitosNovos: ['DISTINCT'],

    // As tabelas usadas — sempre em inglês.
    tabelas: ['countries'],

    // A amostra mostrada na bancada, na etapa do pedido (opcional).
    // Sem este campo, a tela mostra SELECT * FROM <primeira tabela> LIMIT 5.
    amostra: 'SELECT country_name, region_code FROM countries LIMIT 5',

    // O conceito: no máximo 80 palavras em cada idioma. Não repete a
    // consulta inteira do exemplo: diz "no exemplo ao lado" e cita só as peças.
    conceito: {
      pt: '`DISTINCT`, logo depois do `SELECT`, tira as linhas repetidas… No exemplo ao lado, `SELECT DISTINCT grupo_renda`…',
      en: '`DISTINCT`, right after `SELECT`, removes repeated rows… In the example alongside, `SELECT DISTINCT income_group`…',
    },

    // O exemplo mínimo do conceito — em inglês; traduzido na hora.
    exemplo: 'SELECT DISTINCT income_group FROM countries',
    // Com apelido ou comentário, que o tradutor não traduz, escreva os dois
    // idiomas à mão, cada um com os seus nomes:
    //   exemplo: {
    //     pt: 'SELECT titulo, orcamento_usd / 1000000 AS orcamento_milhoes FROM projetos',
    //     en: 'SELECT title, budget_usd / 1000000 AS budget_millions FROM projects',
    //   },

    // O Passo a passo: UMA FRASE SIMPLES POR CLÁUSULA do exemplo — o que
    // aquela linha faz. A ordem (a do banco) e o efeito na tabela saem do
    // próprio exemplo; aqui vão só as frases.
    passoAPasso: {
      FROM: {
        pt: 'Primeiro, o banco pega a tabela `paises` inteira.',
        en: 'First, the database takes the whole `countries` table.',
      },
      SELECT: {
        pt: 'Depois, fica só com `grupo_renda`, e o `DISTINCT` tira os repetidos.',
        en: 'Then it keeps only `income_group`, and `DISTINCT` removes the repeats.',
      },
    },

    // O palpite: 3 opções ANTES de rodar o exemplo.
    palpite: {
      pergunta: { pt: 'Quantas linhas o exemplo devolve?', en: 'How many rows does the example return?' },
      opcoes: [
        { pt: '234, uma por país', en: '234, one per country' },
        { pt: '5: os 4 grupos de renda e o vazio dos agregados', en: '5: the 4 income groups and the aggregates’ empty value' },
        { pt: '4, só os grupos de renda', en: '4, only the income groups' },
      ],
      correta: 1,                // 0, 1 ou 2
    },

    // Os desafios: normalmente dois — "Tente você" (com começo escrito) e a
    // "Variação sem ajuda" (inicial vazio).
    desafios: [
      {
        enunciado: { pt: 'Liste cada região uma vez só.', en: 'List each region only once.' },
        inicial: 'SELECT ',      // o começo já escrito — em inglês; '' para editor vazio
        gabarito: 'SELECT DISTINCT region_code FROM countries',   // UMA vez, em inglês
        tabelas: ['countries'],  // as tabelas do gabarito, em inglês (aparecem na barra da Consulta)
        conferir: { ordem: false, casas: 2 },   // ordem só se o pedido falar em ordenar
        exige: ['DISTINCT'],     // recursos obrigatórios (opcional)
        dicas: [                 // SEMPRE 3: pista, esqueleto, resposta
          // a pista: texto nos dois idiomas, com selos (se citar nome de
          // tabela ou coluna, cada idioma com o seu: `paises` / `countries`)
          { pt: 'Uma palavra logo depois do `SELECT` tira as repetições.', en: 'One word right after `SELECT` removes repeats.' },
          // esqueleto e resposta: SQL em inglês, com ____ nas lacunas —
          // traduzido na hora, como o gabarito…
          'SELECT ____ region_code FROM countries',
          'SELECT DISTINCT region_code FROM countries',
          // …ou texto {pt, en}, quando a resposta tem apelidos ou comentários
          // (em português, AS pessoa; em inglês, AS person).
        ],
      },
    ],

    // A entrega: a resposta do personagem quando a missão termina.
    entrega: {
      pt: 'Sete regiões — e aquele vazio são os agregados. Bom olho.',
      en: 'Seven regions — and that empty one is the aggregates. Good eye.',
    },
  },
];
```

## Os selos

Todo comando, tabela ou coluna que aparece no **texto corrido** (pedido, resumo,
conceito, Passo a passo, tarefa, pista, entrega) vai **entre crases**: `` `SELECT` ``,
`` `nome_pais` ``, `` `tema = 'health'` ``. Na tela, vira um selo (mono, fundo de código,
palavra-chave na cor da cláusula). Cada idioma com os seus nomes. Selos **curtos** (até
uns 25 caracteres): eles não quebram de linha, e a coluna de texto é estreita. Os
campos de SQL (exemplo, gabarito, esqueleto, resposta) **não** levam crases.

## O Passo a passo

- O código do exemplo aparece **na ordem normal**; o destaque segue **a ordem em que o
  banco lê**: `FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT` —
  só as cláusulas que existem no exemplo (o `passo-a-passo.js` descobre sozinho).
- `passoAPasso` tem **uma frase por cláusula** do exemplo: nem uma a mais, nem uma a
  menos (a conferência avisa). `DISTINCT` é parte do `SELECT`; `OFFSET`, do `LIMIT`.
- A frase diz, em palavras simples, **o que aquela linha faz** ("Depois, deixa passar
  só…"). Nomes de tabela e coluna, cada idioma com os seus.
- A tabela embaixo é uma amostra de 5 a 8 linhas da tabela do `FROM`, com o efeito
  calculado sobre os dados de verdade: no `WHERE`, as linhas que não passam apagam; no
  `SELECT`, as colunas não pedidas (e, com `DISTINCT`, as linhas repetidas); no `ORDER
  BY`, as linhas trocam de lugar; no `LIMIT`, as que passam do limite apagam.
- Por enquanto, o efeito só é calculado com **uma tabela no `FROM`**: com `JOIN`, ficam
  o destaque e as frases (a tabela volta quando o módulo 5 for escrito).

## Os tipos

| Tipo | O que é | Campos obrigatórios além dos comuns |
|---|---|---|
| `missao` | ensina um conceito novo | `conceitosNovos` (≥ 1), `tabelas`, `resumo`, `conceito`, `exemplo`, `passoAPasso`, `palpite` |
| `revisao` | revisão misturada do módulo, sem conceito novo | — |
| `desafio` | desafio final, que libera o próximo módulo | — |
| `projeto` | o projeto final (módulo 9) | — |

Comuns a todos: `id`, `tipo`, `titulo`, `personagem`, `pedido`, `desafios` (≥ 1), `entrega`.

Todo módulo termina em **revisão misturada → desafio final** — menos o módulo 0, que é a
chegada ao observatório.

## Os nomes canônicos dos recursos

`conceitosNovos` e `exige` usam os mesmos nomes que o `conferir.js` reconhece numa
consulta (`recursosUsados`). Maiúsculas ou minúsculas tanto faz.

| Recurso | O que cobre |
|---|---|
| palavras-chave | `SELECT`, `FROM`, `WHERE`, `DISTINCT`, `AS`, `LIMIT`, `AND`, `OR`, `NOT`, `IN`, `BETWEEN`, `LIKE`, `ILIKE`, `CASE`, `JOIN`, `ON`… |
| sequências | `ORDER BY`, `GROUP BY`, `IS NULL` (cobre também `IS NOT NULL`), `LEFT JOIN`, `NOT IN` (conta como `IN`)… |
| funções | pelo nome: `COUNT`, `ROUND`, `UPPER`, `COALESCE`… (um nome seguido de parêntese) |
| `*` | `SELECT *` e `COUNT(*)` — todas as colunas / todas as linhas |
| `CONTAS` | `+ - * /` fazendo conta |
| `=` | igual — ensinado junto com o `WHERE` |
| `COMPARACOES` | `<> != < > <= >=` — ensinadas depois do `=` |
| `COLUNAS` | escolher colunas pelo nome (`SELECT a, b`). Não é detectado numa consulta: existe para a missão que o ensina ter o seu conceito novo |
| `\|\|` | juntar textos |
| `--` | comentário |

## As regras de conteúdo

- **Um conceito novo por missão.** SQL de verdade desde a primeira missão.
- **Pedidos sobre temas reais** — desigualdade, clima, energia, saúde — e **neutros**:
  sobre indicadores, nunca tomando partido entre países. Nenhum personagem pergunta
  sobre "o próprio" país; os textos nunca citam a nacionalidade de ninguém.
- **SQL dentro de texto** (conceito, pista, palpite): cada idioma com os seus nomes —
  `SELECT nome_pais FROM paises` no `pt`, `SELECT country_name FROM countries` no `en`.
  O tradutor não mexe em texto; só nos campos de SQL.
- **Tudo em inglês no SQL** (exemplo, inicial, gabarito, amostra): o
  `traducao-sql.js` traduz nomes de tabela e coluna para a base em português. Os valores
  (`'Brazil'`, `'LCN'`) ficam em inglês nos dois idiomas.
- **Nada de apelido igual a um nome do outro idioma** num gabarito (`AS nome`, `AS ano`):
  o tradutor trocaria o apelido junto (ver o topo do `traducao-sql.js`).
- **`JOIN` sempre com `JOIN … ON`.** A sintaxe do Oracle só aparece na cola.
- **O aluno nunca é tratado com gênero** ("você entra como analista").

## As 6 conferências (`conferencia.js`)

| # | O quê | Quando roda |
|---|---|---|
| 1 | todo gabarito roda e devolve linhas; amostra e exemplo rodam | com `?conferencia` |
| 2 | o gabarito traduzido dá o mesmo resultado na base em português | com `?conferencia` |
| 3 | só comandos já ensinados (e o `exige` também); a `amostra` fica de fora, porque quem a mostra é o sistema | sempre, ao abrir o site |
| 4 | nenhum conceito passa de 80 palavras | sempre |
| 5 | todo texto tem `pt` e `en`; toda tabela e coluna está no dicionário — inclusive nos selos, no idioma certo | sempre |
| 6 | cada desafio declara em `tabelas` exatamente as tabelas do gabarito | sempre |

Mais a estrutura: ids `mN-NN` sem repetição, campos obrigatórios por tipo, 3 opções de
palpite, 3 dicas por desafio, uma frase do Passo a passo para cada cláusula do exemplo, a
contagem de missões igual à do `indice.js`.
