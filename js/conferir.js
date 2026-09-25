/* ==========================================================================
   conferir.js — confere a resposta do aluno pelo RESULTADO, não pelo texto.

   Duas consultas diferentes podem estar igualmente certas. Então o que se
   compara é o que elas devolvem, com estas regras (do briefing):

     - nomes de coluna NÃO contam (AS pais ou AS country: tanto faz);
     - a ORDEM DAS COLUNAS também não conta: se as colunas do aluno são as
       mesmas, em outra ordem, a resposta vale (o dado é o mesmo);
     - a ORDEM DAS LINHAS só conta quando o pedido fala em ordenar
       (conferir.ordem = true);
     - números comparados com conferir.casas casas decimais (padrão 2):
       3, 3.0 e 3.004 são iguais;
     - a missão pode EXIGIR um recurso (exige: ['ORDER BY']): o resultado
       certo sem ele não passa, e a mensagem diz por quê.

   Ao errar, diz COMO errou — colunas a mais ou a menos, linhas a mais ou
   faltando, qual coluna não bate, linhas trocadas, ordem —, nunca só
   "errado".

   Este arquivo também sabe dizer quais RECURSOS uma consulta usa
   (recursosUsados): é o que confere o "exige" daqui e o "só comandos já
   ensinados" da conferência automática do conteúdo.
   ========================================================================== */

import { t } from './i18n.js';
import { consultar, idiomaDaBase } from './bd.js';
import { traduzirSQL, separar } from './traducao-sql.js';
import { seloDe, selosEmHtml } from './realce.js';

/* --------------------------------------------------------------------------
   Conferir uma resposta
   -------------------------------------------------------------------------- */

/**
 * Roda o gabarito e compara com o resultado do aluno.
 * @param {object} resultadoAluno  o que consultar() devolveu para a consulta do aluno
 * @param {string} sqlAluno        a consulta do aluno (para conferir o "exige")
 * @param {{gabarito: string, conferir?: {ordem?: boolean, casas?: number}, exige?: string[]}} desafio
 *   gabarito escrito em inglês; é traduzido para o idioma da base aqui
 * @returns {Promise<{certo: boolean, motivo: string, mensagem: string}>}
 */
export async function conferirResposta(resultadoAluno, sqlAluno, { gabarito, conferir = {}, exige = [] }) {
  const esperado = await consultar(traduzirSQL(gabarito, 'en', idiomaDaBase()));
  return avaliar(resultadoAluno, esperado, sqlAluno, { ...conferir, exige });
}

/**
 * A parte que não precisa do motor: compara dois resultados já prontos.
 * Separada para poder ser testada sozinha.
 * @returns {{certo: boolean, motivo: string, mensagem: string, dados: object}}
 */
export function avaliar(aluno, esperado, sqlAluno = '', { ordem = false, casas = 2, exige = [] } = {}) {
  const comparacao = compararResultados(aluno, esperado, { ordem, casas });
  if (!comparacao.certo) return comMensagem(comparacao);

  const faltando = exige.find((recurso) => !recursosUsados(sqlAluno).has(normalizarRecurso(recurso)));
  if (faltando) return comMensagem({ certo: false, motivo: 'faltaRecurso', dados: { recurso: faltando } });

  return comMensagem(comparacao);
}

/** Acrescenta a frase, no idioma da tela — com singular e plural certos. */
function comMensagem(resultado) {
  const dados = resultado.dados ?? {};
  const { motivo } = resultado;
  const valores = { ...dados };

  if (dados.recurso) valores.recurso = seloDe(dados.recurso);

  // "1 coluna" / "3 colunas", "1 linha" / "5 linhas".
  const contar = (n, um, varios) => (n === 1 ? t(`conferir.${um}`) : t(`conferir.${varios}`, { n }));
  if (motivo === 'colunasAMais' || motivo === 'colunasAMenos') {
    valores.aluno = contar(dados.aluno, 'umaColuna', 'nColunas');
    valores.esperado = contar(dados.esperado, 'umaColuna', 'nColunas');
  }
  if (motivo === 'linhasAMais' || motivo === 'linhasFaltando') {
    valores.aluno = contar(dados.aluno, 'umaLinha', 'nLinhas');
    valores.esperado = contar(dados.esperado, 'umaLinha', 'nLinhas');
  }
  // Frases próprias para o resultado vazio e para uma linha só fora do lugar.
  let frase = motivo;
  if (motivo === 'linhasFaltando' && dados.aluno === 0) frase = 'linhasVazio';
  if (motivo === 'linhasDiferentes' && dados.quantas === 1) frase = 'linhasDiferentesUma';

  return { ...resultado, dados, mensagem: selosEmHtml(t(`conferir.${frase}`, valores)) };
}

/* --------------------------------------------------------------------------
   Comparar dois resultados
   -------------------------------------------------------------------------- */

/**
 * @param {{colunas: object[], linhas: any[][]}} aluno
 * @param {{colunas: object[], linhas: any[][]}} esperado
 * @param {{ordem: boolean, casas: number}} regras
 * @returns {{certo: boolean, motivo: string, dados?: object}}
 *   motivos: certo | colunasAMais | colunasAMenos | linhasAMais | linhasFaltando |
 *            colunaDiferente | linhasDiferentes | ordem
 */
export function compararResultados(aluno, esperado, { ordem = false, casas = 2 } = {}) {
  const nColunasAluno = aluno.colunas.length;
  const nColunasEsperado = esperado.colunas.length;

  // 1. Quantas colunas.
  if (nColunasAluno > nColunasEsperado) {
    return { certo: false, motivo: 'colunasAMais', dados: { aluno: nColunasAluno, esperado: nColunasEsperado } };
  }
  if (nColunasAluno < nColunasEsperado) {
    return { certo: false, motivo: 'colunasAMenos', dados: { aluno: nColunasAluno, esperado: nColunasEsperado } };
  }

  // 2. Quantas linhas.
  const nLinhasAluno = aluno.linhas.length;
  const nLinhasEsperado = esperado.linhas.length;
  if (nLinhasAluno > nLinhasEsperado) {
    return { certo: false, motivo: 'linhasAMais', dados: { aluno: nLinhasAluno, esperado: nLinhasEsperado, diferenca: nLinhasAluno - nLinhasEsperado } };
  }
  if (nLinhasAluno < nLinhasEsperado) {
    return { certo: false, motivo: 'linhasFaltando', dados: { aluno: nLinhasAluno, esperado: nLinhasEsperado, diferenca: nLinhasEsperado - nLinhasAluno } };
  }

  // Tudo vira texto comparável: números arredondados, NULL marcado.
  const linhasAluno = aluno.linhas.map((linha) => linha.map((v) => normalizar(v, casas)));
  const linhasEsperado = esperado.linhas.map((linha) => linha.map((v) => normalizar(v, casas)));

  // 3. Quais colunas: cada coluna esperada precisa de uma coluna do aluno
  //    com os mesmos valores — na mesma posição ou em outra.
  const casamento = casarColunas(linhasAluno, linhasEsperado, nColunasEsperado);
  if (!casamento.completo) {
    // Nenhuma coluna bate: as linhas é que são outras (o filtro, quase sempre).
    if (casamento.casadas === 0) {
      return { certo: false, motivo: 'linhasDiferentes', dados: { quantas: contarLinhasFora(linhasAluno, linhasEsperado) } };
    }
    return { certo: false, motivo: 'colunaDiferente', dados: { posicao: casamento.primeiraSemPar + 1 } };
  }

  // Reordena as colunas do aluno para a ordem esperada.
  const reordenadas = linhasAluno.map((linha) => casamento.ordem.map((j) => linha[j]));

  // 4. As linhas, como conjunto: as mesmas combinações de valores?
  const foraDoLugar = contarLinhasFora(reordenadas, linhasEsperado);
  if (foraDoLugar > 0) {
    return { certo: false, motivo: 'linhasDiferentes', dados: { quantas: foraDoLugar } };
  }

  // 5. A ordem, só se o pedido pede ordem.
  if (ordem) {
    const mesmaOrdem = reordenadas.every((linha, i) => chave(linha) === chave(linhasEsperado[i]));
    if (!mesmaOrdem) return { certo: false, motivo: 'ordem' };
  }

  return { certo: true, motivo: 'certo' };
}

/**
 * Um valor em forma comparável.
 * Números com `casas` casas (−0 vira 0); NULL marcado para não se confundir
 * com o texto "null"; o resto como texto, com o tipo na frente — o número 3
 * e o texto '3' são respostas diferentes.
 */
export function normalizar(valor, casas = 2) {
  if (valor === null || valor === undefined) return '∅';
  if (typeof valor === 'number') {
    if (!Number.isFinite(valor)) return `n:${valor}`;
    const arredondado = arredondar(valor, casas);
    return `n:${Object.is(arredondado, -0) ? 0 : arredondado}`;
  }
  if (typeof valor === 'boolean') return `b:${valor}`;
  return `t:${valor}`;
}

/**
 * Arredonda EXATAMENTE como o ROUND do DuckDB: multiplica, arredonda para
 * longe do zero e divide — as mesmas contas de ponto flutuante, com o mesmo
 * resultado byte a byte. Assim um aluno que usou ROUND e um gabarito que não
 * usou (ou o contrário) comparam igual.
 *
 * (Um toFixed(2) direto não serve: 72.345 é guardado como 72.34499999…, e o
 * toFixed daria 72.34 onde o DuckDB dá 72.35. Conferido no passo 9 contra o
 * ROUND do DuckDB com 2.000 números, incluindo os "meios" traiçoeiros.)
 */
function arredondar(valor, casas) {
  const fator = 10 ** casas;
  return (Math.sign(valor) * Math.round(Math.abs(valor) * fator)) / fator;
}

function chave(linha) {
  return JSON.stringify(linha);
}

/** Quantas linhas do aluno não têm par nas esperadas (contando repetições). */
function contarLinhasFora(linhasAluno, linhasEsperado) {
  const restantes = new Map();
  for (const linha of linhasEsperado) {
    const k = chave(linha);
    restantes.set(k, (restantes.get(k) ?? 0) + 1);
  }
  let fora = 0;
  for (const linha of linhasAluno) {
    const k = chave(linha);
    if (restantes.get(k) > 0) restantes.set(k, restantes.get(k) - 1);
    else fora += 1;
  }
  return fora;
}

/**
 * Casa cada coluna esperada com uma coluna do aluno que tenha exatamente os
 * mesmos valores (como conjunto, sem olhar a ordem das linhas). Prefere a
 * mesma posição; senão, a primeira livre que servir.
 */
function casarColunas(linhasAluno, linhasEsperado, n) {
  const assinatura = (linhas, j) => linhas.map((linha) => linha[j]).sort().join('\u0001');
  const doAluno = Array.from({ length: n }, (_, j) => assinatura(linhasAluno, j));
  const esperadas = Array.from({ length: n }, (_, j) => assinatura(linhasEsperado, j));

  const usadas = new Set();
  const ordem = [];
  let casadas = 0;
  let primeiraSemPar = -1;

  for (let j = 0; j < n; j += 1) {
    let par = !usadas.has(j) && doAluno[j] === esperadas[j] ? j : -1;
    if (par === -1) par = doAluno.findIndex((a, k) => !usadas.has(k) && a === esperadas[j]);
    if (par === -1) {
      if (primeiraSemPar === -1) primeiraSemPar = j;
      ordem.push(j);
      continue;
    }
    usadas.add(par);
    ordem.push(par);
    casadas += 1;
  }

  return { completo: casadas === n, casadas, primeiraSemPar, ordem };
}

/* --------------------------------------------------------------------------
   Os recursos que uma consulta usa
   -------------------------------------------------------------------------- */

/*
   Os nomes canônicos dos recursos — os mesmos que as missões usam em
   conceitosNovos e em exige. Palavra-chave ou sequência de palavras-chave,
   funções pelo nome (ROUND, COUNT…) e alguns recursos de símbolo:

     '*'            SELECT * e COUNT(*) (todas as colunas / todas as linhas)
     'CONTAS'       + - * / fazendo conta
     '='            igual (ensinado junto com o WHERE)
     'COMPARACOES'  <> != < > <= >= (ensinadas depois do =)
     '||'           juntar textos
     '--'           comentário
*/
const SEQUENCIAS = [
  ['GROUP', 'BY'], ['ORDER', 'BY'], ['PARTITION', 'BY'], ['IS', 'NOT', 'NULL'], ['IS', 'NULL'],
  ['LEFT', 'JOIN'], ['RIGHT', 'JOIN'], ['FULL', 'JOIN'], ['INNER', 'JOIN'], ['CROSS', 'JOIN'],
  ['UNION', 'ALL'], ['NOT', 'IN'], ['NOT', 'LIKE'], ['NOT', 'BETWEEN'], ['WITH', 'RECURSIVE'],
  ['CREATE', 'TABLE'], ['CREATE', 'VIEW'], ['INSERT', 'INTO'], ['DELETE', 'FROM'],
  ['PRIMARY', 'KEY'], ['NOT', 'NULL'],
];

// Sinônimos: o recurso ensinado cobre as variações dele.
const EQUIVALENTES = {
  'IS NOT NULL': 'IS NULL',
  'NOT IN': 'IN',
  'NOT LIKE': 'LIKE',
  'NOT BETWEEN': 'BETWEEN',
  'INNER JOIN': 'JOIN',
  'UNION ALL': 'UNION',
  '<>': 'COMPARACOES',
  '!=': 'COMPARACOES',
};

const PALAVRAS = new Set(`
  SELECT FROM WHERE HAVING LIMIT OFFSET DISTINCT AS AND OR NOT IN BETWEEN LIKE ILIKE CASE
  WHEN THEN ELSE END JOIN ON USING UNION INTERSECT EXCEPT EXISTS ALL ANY WITH RECURSIVE
  OVER QUALIFY PIVOT UNPIVOT INSERT INTO VALUES UPDATE SET DELETE CREATE TABLE VIEW DROP
  ALTER PRIMARY KEY FOREIGN REFERENCES UNIQUE CHECK DEFAULT BEGIN COMMIT ROLLBACK
  TRANSACTION ASC DESC NULLS FIRST LAST TRUE FALSE NULL INTERVAL CAST FILTER WINDOW ROWS
  RANGE PRECEDING FOLLOWING UNBOUNDED CURRENT ROW
`.split(/\s+/).filter(Boolean));

/** O nome canônico de um recurso escrito numa missão: 'order by' → 'ORDER BY'. */
export function normalizarRecurso(recurso) {
  const limpo = recurso.trim().toUpperCase().replace(/\s+/g, ' ');
  return EQUIVALENTES[limpo] ?? limpo;
}

/**
 * Os recursos que uma consulta usa, com os nomes canônicos.
 * @param {string} sql
 * @returns {Set<string>}
 */
export function recursosUsados(sql) {
  const usados = new Set();
  const pedacos = separar(sql || '');
  if (pedacos.some((p) => p.tipo === 'comentario' && p.texto.startsWith('--'))) usados.add('--');

  const sig = pedacos.filter((p) => p.tipo !== 'espaco' && p.tipo !== 'comentario');
  const palavra = (i) => (sig[i]?.tipo === 'nome' ? sig[i].texto.toUpperCase() : null);

  for (let i = 0; i < sig.length; i += 1) {
    const { tipo, texto } = sig[i];

    if (tipo === 'nome') {
      const atual = texto.toUpperCase();

      // Sequências (ORDER BY, IS NOT NULL…): a mais longa que couber.
      const sequencia = SEQUENCIAS
        .filter((s) => s.every((p, k) => palavra(i + k) === p))
        .sort((a, b) => b.length - a.length)[0];
      if (sequencia) {
        const nome = sequencia.join(' ');
        usados.add(EQUIVALENTES[nome] ?? nome);
        // O NOT de NOT IN / IS NOT NULL não conta como o NOT sozinho.
        i += sequencia.length - 1;
        continue;
      }

      // Função: um nome seguido de "(".
      if (sig[i + 1]?.texto === '(' && !PALAVRAS.has(atual)) {
        usados.add(atual);
        continue;
      }
      if (PALAVRAS.has(atual)) usados.add(atual);
      continue;
    }

    if (tipo === 'simbolo') {
      const seguinte = sig[i + 1]?.tipo === 'simbolo' ? sig[i + 1].texto : '';
      const duplo = texto + seguinte;

      if (duplo === '||') { usados.add('||'); i += 1; continue; }
      if (['<>', '!=', '<=', '>='].includes(duplo)) { usados.add('COMPARACOES'); i += 1; continue; }
      if (texto === '=') { usados.add('='); continue; }
      if (['<', '>'].includes(texto)) { usados.add('COMPARACOES'); continue; }

      if (texto === '*') {
        // Asterisco depois de SELECT, de "(" (COUNT(*)), de vírgula ou de "t." é
        // "todas as colunas/linhas"; entre dois valores, é multiplicação.
        const antes = sig[i - 1];
        const ehTodas = !antes || ['(', ',', '.'].includes(antes.texto) || ['SELECT', 'DISTINCT'].includes(antes.texto.toUpperCase());
        usados.add(ehTodas ? '*' : 'CONTAS');
        continue;
      }
      if (['+', '/', '%'].includes(texto)) { usados.add('CONTAS'); continue; }
      if (texto === '-') {
        // Menos entre dois valores é conta; antes de um número sozinho, é sinal.
        const antes = sig[i - 1];
        const ehConta = antes && (antes.tipo === 'nome' || antes.tipo === 'numero' || antes.texto === ')');
        if (ehConta) usados.add('CONTAS');
      }
    }
  }

  return usados;
}
