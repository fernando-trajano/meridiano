/* ==========================================================================
   realce.js — colore uma consulta SQL por cláusula.

   Usado em todo lugar onde há código: editor, Raio-X, cola e jogos. Devolve
   HTML com <span class="sql-…">; as cores moram no tema.css e as classes no
   componentes.css. Só a cor das letras muda, nunca o fundo.

   Quem ganha cor (a regra do briefing):
     SELECT                          .sql-select
     FROM e JOIN (e LEFT, INNER…)    .sql-from
     WHERE (e QUALIFY, que também    .sql-where
       filtra — decisão do passo 7)
     GROUP BY e HAVING               .sql-group
     ORDER BY, LIMIT e OFFSET        .sql-order
     WITH (e RECURSIVE) e OVER       .sql-with
     funções, textos e números       .sql-funcao, .sql-texto, .sql-numero
     comentários                     .sql-comentario
   O resto (AS, AND, ON, DESC, nomes de tabela e coluna) fica na cor do texto.

   A consulta é cortada pelo mesmo separar() do traducao-sql.js: quem colore
   e quem traduz enxergam a consulta do mesmo jeito.
   ========================================================================== */

import { separar } from './traducao-sql.js';

// Palavra (em minúsculas) → classe. Multipalavras (GROUP BY, LEFT JOIN) são
// tratadas à parte, olhando a palavra seguinte.
const CLAUSULAS = {
  select: 'sql-select',
  from: 'sql-from',
  join: 'sql-from',
  where: 'sql-where',
  qualify: 'sql-where',
  having: 'sql-group',
  limit: 'sql-order',
  offset: 'sql-order',
  with: 'sql-with',
  recursive: 'sql-with',
  over: 'sql-with',
};

// Palavras que, antes de JOIN, fazem parte dele: LEFT JOIN, FULL OUTER JOIN…
const PARTES_DO_JOIN = new Set(['left', 'right', 'full', 'inner', 'outer', 'cross', 'natural', 'semi', 'anti', 'asof', 'positional']);

// Palavras que aparecem antes de "(" sem serem função: IN (…), EXISTS (…)…
const NAO_SAO_FUNCAO = new Set([
  'in', 'exists', 'as', 'on', 'and', 'or', 'not', 'values', 'using', 'into', 'from',
  'join', 'where', 'select', 'table', 'over', 'filter', 'within', 'any', 'all', 'some',
  'union', 'intersect', 'except', 'then', 'else', 'when', 'by', 'with', 'recursive',
]);

/**
 * Colore uma consulta.
 * @param {string} sql
 * @returns {string} HTML seguro (todo texto é escapado)
 */
export function realcarSQL(sql) {
  const pedacos = separar(sql);
  const classes = classificar(pedacos);
  return pedacos
    .map((pedaco, i) => {
      const texto = escapar(pedaco.texto);
      return classes[i] ? `<span class="${classes[i]}">${texto}</span>` : texto;
    })
    .join('');
}

/**
 * A classe de cada pedaço (ou null). Separado do HTML para o Raio-X e os
 * jogos poderem perguntar "de que cláusula é esta palavra?".
 * @param {{tipo: string, texto: string}[]} pedacos
 * @returns {(string|null)[]}
 */
export function classificar(pedacos) {
  const classes = new Array(pedacos.length).fill(null);
  const proximo = (i) => {
    for (let j = i + 1; j < pedacos.length; j += 1) {
      if (pedacos[j].tipo !== 'espaco' && pedacos[j].tipo !== 'comentario') return j;
    }
    return -1;
  };

  for (let i = 0; i < pedacos.length; i += 1) {
    const { tipo, texto } = pedacos[i];

    if (tipo === 'comentario') { classes[i] = 'sql-comentario'; continue; }
    if (tipo === 'texto') { classes[i] = 'sql-texto'; continue; }
    if (tipo === 'numero') { classes[i] = 'sql-numero'; continue; }
    if (tipo !== 'nome') continue;

    const palavra = texto.toLowerCase();
    const j = proximo(i);
    const seguinte = j === -1 ? '' : pedacos[j].texto.toLowerCase();

    // GROUP BY e ORDER BY: as duas palavras levam a cor.
    if ((palavra === 'group' || palavra === 'order') && seguinte === 'by') {
      classes[i] = classes[j] = palavra === 'group' ? 'sql-group' : 'sql-order';
      i = j;
      continue;
    }

    // LEFT JOIN, FULL OUTER JOIN…: pinta até o JOIN, inclusive.
    if (PARTES_DO_JOIN.has(palavra)) {
      const indices = [i];
      let k = j;
      while (k !== -1 && PARTES_DO_JOIN.has(pedacos[k].texto.toLowerCase())) {
        indices.push(k);
        k = proximo(k);
      }
      if (k !== -1 && pedacos[k].texto.toLowerCase() === 'join') {
        for (const indice of [...indices, k]) classes[indice] = 'sql-from';
        i = k;
      }
      continue;
    }

    if (CLAUSULAS[palavra]) {
      classes[i] = CLAUSULAS[palavra];
      continue;
    }

    // Um nome seguido de "(" é função: COUNT(…), ROUND(…), year(…).
    if (seguinte === '(' && !NAO_SAO_FUNCAO.has(palavra)) classes[i] = 'sql-funcao';
  }

  return classes;
}

/** Escapa o texto para ir dentro de HTML. */
export function escapar(texto) {
  return texto.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
