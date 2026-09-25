/* ==========================================================================
   formatar-sql.js — o botão "Formatar" do editor.

   A regra de segurança: só mexe em ESPAÇOS, QUEBRAS DE LINHA e em
   MAIÚSCULAS de palavras-chave e funções conhecidas. Nunca muda um nome, um
   texto entre aspas, um número ou um comentário — a consulta formatada
   devolve exatamente o mesmo resultado que a original.

   O que ele faz:
     - cada cláusula (SELECT, FROM, JOIN, WHERE, GROUP BY, HAVING, QUALIFY,
       ORDER BY, LIMIT, UNION…) começa numa linha;
     - AND e OR do WHERE, HAVING, QUALIFY e ON descem para a linha de baixo,
       recuados — menos o AND de BETWEEN … AND …, que é parte do BETWEEN;
     - uma subconsulta entre parênteses ganha recuo próprio; dentro de
       parênteses comuns — COUNT(*) FILTER (WHERE …), OVER (… ORDER BY …),
       (a OR b) — nada quebra;
     - palavras-chave e funções conhecidas em MAIÚSCULAS; nomes ficam como
       estão;
     - espaços repetidos viram um só; o espaçamento original entre símbolos
       (a>=1 ou a >= 1) é mantido.
   ========================================================================== */

import { separar } from './traducao-sql.js';

const RECUO = '  ';

// Palavras-chave que viram MAIÚSCULAS.
const PALAVRAS_CHAVE = new Set(`
  select from where group by having order limit offset qualify window join inner left
  right full outer cross natural on using as and or not in is null like ilike between
  case when then else end distinct all any some exists union intersect except with
  recursive over partition rows range preceding following unbounded current row asc
  desc nulls first last insert into values update set delete create table view drop
  alter add column primary key foreign references unique check default constraint
  begin commit rollback transaction true false pivot unpivot filter interval cast
  replace temp temporary if semi anti asof
`.split(/\s+/).filter(Boolean));

// Funções conhecidas: só estas viram MAIÚSCULAS (uma macro do aluno fica como está).
const FUNCOES = new Set(`
  count sum avg min max round cast coalesce nullif upper lower length trim ltrim rtrim
  substr substring replace concat abs ceil floor sqrt power ln log exp mod greatest least
  row_number rank dense_rank ntile lag lead first_value last_value percent_rank cume_dist
  extract year month day date_part date_trunc strftime strptime now today current_date
  string_agg list listagg median mode stddev variance corr regexp_matches contains
  starts_with ends_with left right lpad rpad split_part any_value arg_max arg_min
  typeof epoch make_date age
`.split(/\s+/).filter(Boolean));

// A primeira palavra de cada cláusula começa uma linha nova.
const INICIO_DE_CLAUSULA = new Set([
  'select', 'from', 'where', 'group', 'having', 'qualify', 'window', 'order', 'limit',
  'offset', 'union', 'intersect', 'except', 'with', 'values', 'set', 'insert', 'update',
  'delete', 'create', 'drop', 'alter',
]);

// Partes de um JOIN: a linha nova começa na primeira delas (o LEFT de LEFT JOIN).
const PARTES_DO_JOIN = new Set(['left', 'right', 'full', 'inner', 'outer', 'cross', 'natural', 'semi', 'anti', 'asof', 'positional']);

/**
 * Formata uma consulta (ou várias, separadas por ";").
 * @param {string} sql
 * @returns {string}
 */
export function formatarSQL(sql) {
  const pedacos = separar(sql);
  const pilha = [];            // um item por parêntese aberto
  let saida = '';
  let nivel = 0;               // recuo das subconsultas
  let clausula = '';           // a cláusula em que estamos
  let dentroDeBetween = false;
  let quebraPendente = false;  // um comentário de linha pede quebra depois dele

  const significativo = (i, passo) => {
    for (let j = i + passo; j >= 0 && j < pedacos.length; j += passo) {
      if (pedacos[j].tipo !== 'espaco') return j;
    }
    return -1;
  };
  const palavraEm = (j) => (j === -1 ? '' : pedacos[j].texto.toLowerCase());
  const dentroDeParenteseComum = () => pilha.length > 0 && !pilha[pilha.length - 1].subconsulta;

  // Linha nova, com o recuo do nível (+ extra). Nunca deixa linha em branco.
  const novaLinha = (extra = 0) => {
    saida = saida.replace(/[ \t]+$/, '');
    if (saida && !saida.endsWith('\n')) saida += '\n';
    saida += RECUO.repeat(nivel + extra);
  };

  // LEFT, FULL OUTER… só são JOIN se, andando por elas, se chega a um JOIN.
  const levaAoJoin = (i) => {
    let j = i;
    while (j !== -1 && PARTES_DO_JOIN.has(palavraEm(j))) j = significativo(j, 1);
    return palavraEm(j) === 'join';
  };

  for (let i = 0; i < pedacos.length; i += 1) {
    const { tipo, texto } = pedacos[i];

    if (tipo === 'espaco') {
      if (!quebraPendente && saida && !/[\n ]$/.test(saida)) saida += ' ';
      continue;
    }

    if (quebraPendente) {
      novaLinha(clausula && pilha.length === 0 ? 1 : 0);
      quebraPendente = false;
    }

    const palavra = tipo === 'nome' ? texto.toLowerCase() : '';
    const anterior = palavraEm(significativo(i, -1));

    // --- Linha nova para cada cláusula ------------------------------------
    if (tipo === 'nome' && !dentroDeParenteseComum()) {
      const comecaJoin =
        (palavra === 'join' && !PARTES_DO_JOIN.has(anterior)) ||
        (PARTES_DO_JOIN.has(palavra) && !PARTES_DO_JOIN.has(anterior) && levaAoJoin(i));
      const comecaClausula =
        INICIO_DE_CLAUSULA.has(palavra) &&
        !(palavra === 'set' && clausula !== 'update') &&
        !(palavra === 'select' && ['union', 'intersect', 'except', 'all', 'distinct'].includes(anterior));

      if (comecaJoin || comecaClausula) {
        if (anterior !== '(') novaLinha();
        clausula = comecaJoin ? 'join' : palavra;
        dentroDeBetween = false;
      } else if (palavra === 'and' || palavra === 'or') {
        if (palavra === 'and' && dentroDeBetween) {
          dentroDeBetween = false;
        } else if (['where', 'having', 'qualify', 'join'].includes(clausula)) {
          novaLinha(1);
        }
      }
    }
    if (palavra === 'between') dentroDeBetween = true;

    // --- Parênteses -------------------------------------------------------
    if (texto === '(') {
      const seguinte = palavraEm(significativo(i, 1));
      const subconsulta = seguinte === 'select' || seguinte === 'with';
      pilha.push({ subconsulta, clausula });
      saida += '(';
      if (subconsulta) {
        nivel += 1;
        novaLinha();
      }
      continue;
    }
    if (texto === ')') {
      const aberto = pilha.pop();
      if (aberto?.subconsulta) {
        nivel = Math.max(0, nivel - 1);
        novaLinha();
      }
      saida += ')';
      if (aberto) clausula = aberto.clausula;
      continue;
    }

    // --- O pedaço em si ---------------------------------------------------
    if (tipo === 'comentario') {
      saida += texto;
      if (texto.startsWith('--')) quebraPendente = true;
      continue;
    }

    if (texto === ';') {
      saida = saida.replace(/[ \t]+$/, '') + ';';
      nivel = 0;
      clausula = '';
      pilha.length = 0;
      // Linha em branco entre um comando e o seguinte.
      if (significativo(i, 1) !== -1) saida += '\n\n';
      continue;
    }

    if (tipo === 'nome') {
      const seguidaDeParentese = palavraEm(significativo(i, 1)) === '(';
      const maiuscula = PALAVRAS_CHAVE.has(palavra) || (seguidaDeParentese && FUNCOES.has(palavra));
      saida += maiuscula ? texto.toUpperCase() : texto;
      continue;
    }

    // Sem espaço antes de vírgula.
    if (texto === ',') saida = saida.replace(/[ \t]+$/, '');
    saida += texto;
  }

  return saida.replace(/[ \t]+\n/g, '\n').trim();
}
