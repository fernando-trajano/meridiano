/* ==========================================================================
   passo-a-passo.js — a consulta na ordem em que o banco a lê.

   (Substituiu o Raio-X no redesenho depois do passo 12.)

   O código do exemplo aparece na ordem NORMAL, como se escreve. O destaque
   é que segue a ordem em que o banco lê:

     FROM → JOIN → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT

   (só as cláusulas que existem no exemplo). A linha ativa fica inteira, com
   um véu de fundo e uma borda fina na cor da cláusula; as outras ficam a
   40%. Embaixo do código, uma frase simples do que aquela linha faz — escrita
   pela missão, em passoAPasso: { FROM: {pt, en}, WHERE: {…}, … } — e, no
   primeiro passo, a nota de que o banco começa por baixo.

   A tabela embaixo é uma amostra de 5 a 8 linhas da tabela do FROM, e mostra
   o efeito de cada passo (calculado aqui, sobre os dados de verdade):
     FROM       a tabela inteira
     WHERE      as linhas que não passam apagam
     SELECT     as colunas que não foram pedidas apagam (e, com DISTINCT, as
                linhas repetidas)
     ORDER BY   as linhas trocam de lugar
     LIMIT      as que passam do limite apagam
     JOIN, GROUP BY, HAVING: por enquanto, só o destaque e a frase (os
     módulos 4 e 5 ainda não foram escritos).
   Nada some de verdade: o que o passo descarta fica a 18%, para dar para
   ver o que saiu.
   ========================================================================== */

import { t, idioma, emIdioma } from './i18n.js';
import { consultar, idiomaDaBase } from './bd.js';
import { sqlNoIdioma, separar } from './traducao-sql.js';
import { formatarSQL } from './formatar-sql.js';
import { realcarSQL, escapar, textoComSelos } from './realce.js';
import { montarTabela } from './tabela-resultado.js';

/** A ordem em que o banco lê uma consulta. */
export const ORDEM_DO_BANCO = ['FROM', 'JOIN', 'WHERE', 'GROUP BY', 'HAVING', 'SELECT', 'ORDER BY', 'LIMIT'];

/** A cor de cada cláusula (a mesma do realce do código). */
const COR = {
  FROM: '--cor-from', JOIN: '--cor-from', WHERE: '--cor-where', 'GROUP BY': '--cor-group',
  HAVING: '--cor-group', SELECT: '--cor-select', 'ORDER BY': '--cor-order', LIMIT: '--cor-order',
};

/** Uma linha que começa uma cláusula (sem recuo: as de subconsulta vêm recuadas). */
const INICIO = /^(SELECT|FROM|WHERE|GROUP BY|HAVING|ORDER BY|LIMIT|OFFSET|(?:(?:LEFT|RIGHT|FULL|INNER|CROSS|NATURAL|SEMI|ANTI|ASOF|POSITIONAL)\s+)*(?:OUTER\s+)?JOIN)\b/;

const LINHAS_NA_AMOSTRA = 6;
const LINHAS_DO_MOTOR = 2000;

/**
 * A consulta em blocos, um por cláusula, cada um com as suas linhas.
 * @param {string} sql
 * @returns {{clausula: string|null, linhas: string[], corpo: string}[]}
 *   clausula null = comentário solto (nunca fica ativo)
 */
export function blocosDoSQL(sql) {
  const blocos = [];
  for (const linha of formatarSQL(sql).trim().split('\n')) {
    const achado = INICIO.exec(linha);
    if (achado) {
      let clausula = achado[1].replace(/\s+/g, ' ');
      if (clausula.endsWith('JOIN')) clausula = 'JOIN';
      if (clausula === 'OFFSET') clausula = 'LIMIT';
      const anterior = blocos[blocos.length - 1];
      // OFFSET é parte do LIMIT: vai no mesmo bloco.
      if (clausula === 'LIMIT' && anterior?.clausula === 'LIMIT') anterior.linhas.push(linha);
      else blocos.push({ clausula, linhas: [linha] });
    } else if (/^\s*--/.test(linha) && !blocos.length) {
      blocos.push({ clausula: null, linhas: [linha] });
    } else if (blocos.length) {
      blocos[blocos.length - 1].linhas.push(linha);
    } else {
      blocos.push({ clausula: null, linhas: [linha] });
    }
  }
  for (const bloco of blocos) bloco.corpo = bloco.linhas.join('\n');
  return blocos;
}

/**
 * As cláusulas de uma consulta, na ordem em que o banco as lê.
 * @param {string} sql
 * @returns {string[]}
 */
export function clausulasNaOrdemDoBanco(sql) {
  const existentes = new Set(blocosDoSQL(sql).map((b) => b.clausula).filter(Boolean));
  return ORDEM_DO_BANCO.filter((c) => existentes.has(c));
}

/**
 * Monta o Passo a passo dentro de um painel (a bancada).
 * @param {HTMLElement} alvo
 * @param {{exemplo: string|{pt: string, en: string}, frases: Object<string, {pt: string, en: string}>}} opcoes
 * @returns {Promise<{destruir: () => void}>}
 */
export async function criarPassoAPasso(alvo, { exemplo, frases }) {
  alvo.classList.add('passo');
  alvo.innerHTML = `
    <div class="painel-barra">
      <span class="painel-aba">${escapar(t('passoAPasso.titulo'))}</span>
      <span class="painel-info passo-contador"></span>
      <span class="painel-espaco"></span>
      <button type="button" class="botao botao--pequeno passo-anterior"></button>
      <button type="button" class="botao botao--pequeno passo-proximo"></button>
    </div>
    <pre class="painel-codigo passo-codigo mono"></pre>
    <div class="passo-legenda" aria-live="polite">
      <p class="passo-frase"></p>
      <p class="passo-nota"></p>
    </div>
    <div class="painel-rolagem passo-quadro"></div>
    <p class="painel-rodape passo-amostra"></p>`;

  const el = {
    contador: alvo.querySelector('.passo-contador'),
    anterior: alvo.querySelector('.passo-anterior'),
    proximo: alvo.querySelector('.passo-proximo'),
    codigo: alvo.querySelector('.passo-codigo'),
    frase: alvo.querySelector('.passo-frase'),
    nota: alvo.querySelector('.passo-nota'),
    quadro: alvo.querySelector('.passo-quadro'),
    amostra: alvo.querySelector('.passo-amostra'),
  };

  let blocos = [];
  let passos = [];      // as cláusulas, na ordem do banco
  let dados = null;     // a amostra e o que cada passo faz com ela
  let atual = 0;

  /* ------------------------------------------------------------------------
     O código e os dados
     ------------------------------------------------------------------------ */

  async function carregar() {
    const sql = sqlNoIdioma(exemplo, idiomaDaBase() ?? idioma());
    blocos = blocosDoSQL(sql);
    passos = clausulasNaOrdemDoBanco(sql);

    el.codigo.innerHTML = blocos
      .map((bloco, i) => bloco.linhas
        .map((linha) => `<span class="passo-linha" data-bloco="${i}"${bloco.clausula ? ` style="--cor-linha: var(${COR[bloco.clausula]})"` : ''}>${realcarSQL(linha) || ' '}</span>`)
        .join(''))
      .join('');

    try {
      dados = await calcularEfeitos(blocos);
    } catch (erro) {
      // Um exemplo que o cálculo não entende (um JOIN, por enquanto): fica
      // só o destaque do código e as frases, sem a tabela.
      console.warn('[passo a passo] Sem a tabela de efeitos:', erro);
      dados = null;
    }
  }

  /* ------------------------------------------------------------------------
     Um passo
     ------------------------------------------------------------------------ */

  function mostrar(i) {
    atual = Math.max(0, Math.min(i, passos.length - 1));
    const clausula = passos[atual];

    el.codigo.querySelectorAll('.passo-linha').forEach((linha) => {
      linha.classList.toggle('passo-linha--ativa', blocos[Number(linha.dataset.bloco)].clausula === clausula);
    });

    el.contador.textContent = t('passoAPasso.contador', { n: atual + 1, total: passos.length });
    el.anterior.textContent = t('passoAPasso.anterior');
    el.proximo.textContent = t('passoAPasso.proximo');
    el.anterior.disabled = atual === 0;
    el.proximo.disabled = atual === passos.length - 1;

    const frase = frases?.[clausula];
    el.frase.innerHTML = frase ? textoComSelos(emIdioma(frase)) : '';
    // A nota só no primeiro passo, e só quando o banco não começa pela
    // primeira linha escrita (quase sempre: o SELECT vem em cima).
    const primeiraEscrita = blocos.find((b) => b.clausula)?.clausula;
    const nota = atual === 0 && primeiraEscrita !== clausula;
    el.nota.innerHTML = nota ? textoComSelos(t('passoAPasso.notaInicio')) : '';
    el.nota.hidden = !nota;

    desenharEfeitos();
  }

  function desenharEfeitos() {
    if (!dados) {
      el.quadro.replaceChildren();
      el.amostra.textContent = '';
      return;
    }
    const { colunas, linhas, chaves } = dados;
    const estado = estadoNoPasso(atual);

    // A tabela é desenhada uma vez; cada passo só apaga, acende e reordena
    // (assim a transição de opacidade acontece).
    let tabela = el.quadro.querySelector('table');
    if (!tabela) {
      tabela = montarTabela(colunas, linhas, { chaves });
      el.quadro.replaceChildren(tabela);
    }

    const corpo = tabela.tBodies[0];
    const porChave = new Map([...corpo.rows].map((tr) => [tr.dataset.chave, tr]));
    for (const chave of estado.ordem) corpo.append(porChave.get(chave));

    for (const tr of corpo.rows) tr.classList.toggle('apagada', estado.linhasApagadas.has(tr.dataset.chave));
    for (const tr of tabela.rows) {
      [...tr.cells].forEach((celula, j) => celula.classList.toggle('apagada', estado.colunasApagadas.has(j)));
    }

    el.amostra.textContent = t('passoAPasso.amostra', { n: linhas.length, total: dados.total });
  }

  /** O que já aconteceu com a amostra até o passo i (os efeitos se somam). */
  function estadoNoPasso(i) {
    const { linhas, chaves, colunas, passam, ordenadas, finais, mantidas, distinto } = dados;
    const linhasApagadas = new Set();
    const colunasApagadas = new Set();
    let ordem = [...chaves];

    for (const clausula of passos.slice(0, i + 1)) {
      if (clausula === 'WHERE' && passam) {
        chaves.forEach((c) => { if (!passam.has(c)) linhasApagadas.add(c); });
      }
      if (clausula === 'SELECT' && mantidas) {
        colunas.forEach((_, j) => { if (!mantidas.has(j)) colunasApagadas.add(j); });
        if (distinto) {
          // Com DISTINCT, a segunda vez que a mesma combinação aparece apaga.
          const vistas = new Set();
          for (const c of ordem) {
            if (linhasApagadas.has(c)) continue;
            const linha = linhas[chaves.indexOf(c)];
            const valor = JSON.stringify(linha.filter((_, j) => mantidas.has(j)));
            if (vistas.has(valor)) linhasApagadas.add(c);
            vistas.add(valor);
          }
        }
      }
      if (clausula === 'ORDER BY' && ordenadas) {
        const posicao = (c) => (ordenadas.has(c) ? ordenadas.get(c) : Infinity);
        ordem = [...ordem].sort((a, b) => posicao(a) - posicao(b));
      }
      if (clausula === 'LIMIT' && finais) {
        chaves.forEach((c) => { if (!finais.has(c)) linhasApagadas.add(c); });
      }
    }
    return { linhasApagadas, colunasApagadas, ordem };
  }

  /* ------------------------------------------------------------------------
     Botões, teclado e idioma
     ------------------------------------------------------------------------ */

  el.anterior.addEventListener('click', () => mostrar(atual - 1));
  el.proximo.addEventListener('click', () => mostrar(atual + 1));

  // A base volta com os nomes do outro idioma: refaz tudo no mesmo passo.
  async function aoRecarregarBase() {
    const onde = atual;
    el.quadro.replaceChildren();
    await carregar();
    mostrar(onde);
  }
  document.addEventListener('base-recarregada', aoRecarregarBase);

  await carregar();
  mostrar(0);

  return {
    destruir() {
      document.removeEventListener('base-recarregada', aoRecarregarBase);
    },
  };
}

/* --------------------------------------------------------------------------
   O efeito de cada passo, sobre os dados de verdade

   Cada linha da tabela do FROM é identificada pelo rowid do DuckDB. Três
   perguntas ao motor dizem tudo:
     - quais linhas passam no WHERE;
     - em que ordem ficam depois do ORDER BY;
     - quais sobram depois do LIMIT.
   As colunas mantidas pelo SELECT saem dos nomes escritos nele.
   -------------------------------------------------------------------------- */

async function calcularEfeitos(blocos) {
  const corpo = (clausula) => {
    const achados = blocos.filter((b) => b.clausula === clausula);
    if (!achados.length) return null;
    return achados.map((b) => b.corpo).join('\n');
  };
  const semPalavra = (texto, palavra) => texto.replace(new RegExp(`^\\s*${palavra}\\b`, 'i'), '').trim();

  const from = corpo('FROM');
  if (!from || corpo('JOIN')) throw new Error('só FROM de uma tabela, por enquanto');
  const tabela = semPalavra(from, 'FROM');
  const where = corpo('WHERE') ? semPalavra(corpo('WHERE'), 'WHERE') : null;
  const orderBy = corpo('ORDER BY') ? semPalavra(corpo('ORDER BY'), 'ORDER BY') : null;
  const limit = corpo('LIMIT');
  const select = semPalavra(corpo('SELECT') ?? 'SELECT *', 'SELECT');
  const distinto = /^DISTINCT\b/i.test(select);

  const base = await consultar(`SELECT rowid AS __id, * FROM ${tabela}`, { maxLinhas: LINHAS_DO_MOTOR });
  const ids = (resultado) => resultado.linhas.map((linha) => String(linha[0]));
  const todas = ids(base);

  const passam = where ? new Set(ids(await consultar(`SELECT rowid FROM ${tabela} WHERE ${where}`))) : null;
  const filtro = where ? `WHERE ${where}` : '';

  let ordenadas = null;
  if (orderBy) {
    const lista = ids(await consultar(`SELECT rowid FROM ${tabela} ${filtro} ORDER BY ${orderBy}`));
    ordenadas = new Map(lista.map((id, i) => [id, i]));
  }
  let finais = null;
  if (limit) {
    finais = new Set(ids(await consultar(`SELECT rowid FROM ${tabela} ${filtro} ${orderBy ? `ORDER BY ${orderBy}` : ''} ${limit}`)));
  }

  // A amostra: linhas que mostrem o efeito — metade das que passam, metade
  // das que saem —, na ordem da tabela.
  const escolhidas = escolherAmostra(todas, { passam, ordenadas, finais });
  const posicao = new Map(todas.map((id, i) => [id, i]));
  const linhas = escolhidas.map((id) => base.linhas[posicao.get(id)].slice(1));
  const colunas = base.colunas.slice(1);

  // As colunas que o SELECT pede: as que aparecem pelo nome (ou todas, com *).
  const nomes = new Set(
    separar(select).filter((p) => p.tipo === 'nome' || p.tipo === 'nome-entre-aspas')
      .map((p) => p.texto.replace(/"/g, '').toLowerCase())
  );
  const mantidas = select.includes('*')
    ? null
    : new Set(colunas.map((c, j) => (nomes.has(c.nome.toLowerCase()) ? j : -1)).filter((j) => j !== -1));

  return {
    colunas,
    linhas,
    chaves: escolhidas,
    total: base.total,
    passam,
    ordenadas,
    finais,
    mantidas,
    distinto: distinto && mantidas !== null,
  };
}

function escolherAmostra(todas, { passam, ordenadas, finais }) {
  const n = LINHAS_NA_AMOSTRA;
  const naOrdemDaTabela = (lista) => todas.filter((id) => lista.has(id));

  // O resultado final vem primeiro na preferência: é o que precisa aparecer.
  const noFim = (id) => (finais ? finais.has(id) : passam ? passam.has(id) : true);

  if (passam) {
    const ficam = todas.filter((id) => passam.has(id));
    const saem = todas.filter((id) => !passam.has(id));
    ficam.sort((a, b) => Number(noFim(b)) - Number(noFim(a)));
    const quantasFicam = Math.min(ficam.length, Math.max(Math.ceil(n / 2), n - saem.length));
    const quantasSaem = Math.min(saem.length, n - quantasFicam);
    return naOrdemDaTabela(new Set([...ficam.slice(0, quantasFicam), ...saem.slice(0, quantasSaem)]));
  }

  if (ordenadas || finais) {
    // As primeiras do resultado final (até 6) e duas que ficam de fora do
    // LIMIT — no máximo 8 linhas.
    const resultado = ordenadas ? [...ordenadas.keys()] : todas;
    const dentro = resultado.filter(noFim).slice(0, n);
    const fora = todas.filter((id) => !noFim(id)).slice(0, Math.min(2, 8 - dentro.length));
    return naOrdemDaTabela(new Set([...dentro, ...fora]));
  }

  return todas.slice(0, n);
}
