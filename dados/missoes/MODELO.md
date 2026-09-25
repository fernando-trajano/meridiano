# Modelo de uma missão

O contrato entre o conteúdo e o código. Missões novas são escritas copiando o molde
abaixo. Um arquivo por módulo (`primeiro-dia.js`, `escolher-colunas.js`…), que exporta
`missoes`, na ordem. Depois de escrever, aponte `arquivo` para ele em `indice.js` e abra
o site com **`?conferencia`** no endereço: as 5 conferências rodam e avisam no console.

## A missão, campo por campo

```js
export const missoes = [
  {
    id: 'm1-03',                 // módulo 1, missão 3 — sempre mN-NN
    tipo: 'missao',              // missao | revisao | desafio | projeto
    titulo: { pt: 'Sem repetição', en: 'No repeats' },
    personagem: 'kofi',          // uma chave de dados/personagens.js
    hora: '09:14',               // a hora do memorando (opcional, HH:MM)

    // O memorando: o pedido, do jeito que o personagem escreveria.
    pedido: {
      pt: 'Quais regiões aparecem na nossa lista de países? Cada uma uma vez só.',
      en: 'Which regions show up in our country list? Each one only once.',
    },

    // Os recursos que esta missão ENSINA (nomes canônicos, ver abaixo).
    conceitosNovos: ['DISTINCT'],

    // As tabelas usadas — sempre em inglês.
    tabelas: ['countries'],

    // "Olhe os dados": as 5 linhas mostradas antes de tudo (opcional).
    // Sem este campo, a tela mostra SELECT * FROM <primeira tabela> LIMIT 5.
    amostra: 'SELECT country_name, region_code FROM countries LIMIT 5',

    // O conceito: no máximo 80 palavras em cada idioma.
    conceito: {
      pt: 'DISTINCT, logo depois do SELECT, tira as linhas repetidas do resultado…',
      en: 'DISTINCT, right after SELECT, removes repeated rows from the result…',
    },

    // O exemplo mínimo do conceito — em inglês; traduzido na hora.
    exemplo: 'SELECT DISTINCT income_group FROM countries',

    // O Raio-X: o mesmo exemplo, etapa por etapa, na ordem LÓGICA
    // (FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT).
    // Cada etapa é um SQL de verdade: a tabela mostrada é o resultado real.
    raioX: [
      { etapa: 'FROM', sql: 'SELECT income_group FROM countries' },
      { etapa: 'SELECT', sql: 'SELECT DISTINCT income_group FROM countries' },
    ],

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
        conferir: { ordem: false, casas: 2 },   // ordem só se o pedido falar em ordenar
        exige: ['DISTINCT'],     // recursos obrigatórios (opcional)
        dicas: [                 // SEMPRE 3: pista, esqueleto, resposta
          { pt: 'Uma palavra logo depois do SELECT tira as repetições.', en: 'One word right after SELECT removes repeats.' },
          { pt: 'SELECT ____ region_code FROM countries', en: 'SELECT ____ region_code FROM countries' },
          { pt: 'SELECT DISTINCT region_code FROM countries', en: 'SELECT DISTINCT region_code FROM countries' },
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

## Os tipos

| Tipo | O que é | Campos obrigatórios além dos comuns |
|---|---|---|
| `missao` | ensina um conceito novo | `conceitosNovos` (≥ 1), `tabelas`, `conceito`, `exemplo`, `raioX`, `palpite` |
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
| `COMPARACOES` | `= <> != < > <= >=` |
| `\|\|` | juntar textos |
| `--` | comentário |

## As regras de conteúdo

- **Um conceito novo por missão.** SQL de verdade desde a primeira missão.
- **Pedidos sobre temas reais** — desigualdade, clima, energia, saúde — e **neutros**:
  sobre indicadores, nunca tomando partido entre países. Nenhum personagem pergunta
  sobre "o próprio" país; os textos nunca citam a nacionalidade de ninguém.
- **Tudo em inglês no SQL** (exemplo, raioX, inicial, gabarito, amostra): o
  `traducao-sql.js` traduz nomes de tabela e coluna para a base em português. Os valores
  (`'Brazil'`, `'LCN'`) ficam em inglês nos dois idiomas.
- **Nada de apelido igual a um nome do outro idioma** num gabarito (`AS nome`, `AS ano`):
  o tradutor trocaria o apelido junto (ver o topo do `traducao-sql.js`).
- **`JOIN` sempre com `JOIN … ON`.** A sintaxe do Oracle só aparece na cola.
- **O aluno nunca é tratado com gênero** ("você entra como analista").

## As 5 conferências (`conferencia.js`)

| # | O quê | Quando roda |
|---|---|---|
| 1 | todo gabarito roda e devolve linhas; amostra, exemplo e Raio-X rodam | com `?conferencia` |
| 2 | o gabarito traduzido dá o mesmo resultado na base em português | com `?conferencia` |
| 3 | só comandos já ensinados (e o `exige` também); a `amostra` fica de fora, porque quem a mostra é o sistema | sempre, ao abrir o site |
| 4 | nenhum conceito passa de 80 palavras | sempre |
| 5 | todo texto tem `pt` e `en`; toda tabela e coluna está no dicionário | sempre |

Mais a estrutura: ids `mN-NN` sem repetição, campos obrigatórios por tipo, 3 opções de
palpite, 3 dicas por desafio, a contagem de missões igual à do `indice.js`.
