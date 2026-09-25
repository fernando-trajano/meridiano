/* ==========================================================================
   raio-x.js — a tabela viva: a consulta acontecendo, etapa por etapa.

   A missão traz o Raio-X pronto, em inglês: raioX: [{ etapa, sql }, …], na
   ordem LÓGICA de execução (FROM → WHERE → GROUP BY → HAVING → SELECT →
   ORDER BY → LIMIT). Cada etapa é um SQL de verdade, rodado no motor: a
   tabela mostrada é sempre o resultado real, nunca um desenho feito à mão.

   Entre uma etapa e a seguinte, uma animação diz o que aconteceu:
     WHERE      as linhas que não passam apagam; as que passam ganham o
                fundo translúcido da cor do WHERE
     SELECT     as colunas que não foram pedidas somem; as novas aparecem
     DISTINCT   as linhas repetidas se desfazem
     ORDER BY   as linhas deslizam para o lugar novo
     LIMIT      as que passam do limite apagam
     GROUP BY   as linhas se juntam em blocos (linha fina entre um e outro)
     FROM, JOIN, HAVING e o resto: a tabela nova aparece.
   (A linha fina ligando as chaves de um JOIN chega com o módulo 5.)

   Tudo usa uma mecânica só: marcar quem sai (e quem fica), redesenhar, e
   deslizar quem ficou da posição antiga para a nova (a técnica "FLIP").
   Com prefers-reduced-motion, a tabela troca sem animação — o estado final
   é o mesmo.

   Regra para quem escreve as etapas (ver MODELO.md): cada etapa muda UMA
   coisa em relação à anterior, e WHERE, DISTINCT, ORDER BY e LIMIT mantêm
   as mesmas colunas da etapa de antes — é o que deixa casar as linhas.
   ========================================================================== */

import { t, idioma } from './i18n.js';
import { consultar, idiomaDaBase } from './bd.js';
import { sqlNoIdioma } from './traducao-sql.js';
import { formatarValor } from './tabela-resultado.js';
import { escapar } from './realce.js';

/** Quantas linhas aparecem de cada vez. A contagem de verdade é dita embaixo. */
const LINHAS_NA_TELA = 12;

/** Quantas linhas de cada etapa trazer do motor (o bastante para escolher a amostra). */
const LINHAS_DO_MOTOR = 500;

const DURACAO_SAIDA = 450;
const DURACAO_ENTRADA = 380;

// A cor de cada etapa: a da cláusula (só nas letras, como no código).
const COR_DA_ETAPA = {
  FROM: 'sql-from', JOIN: 'sql-from', WHERE: 'sql-where', 'GROUP BY': 'sql-group',
  HAVING: 'sql-group', SELECT: 'sql-select', DISTINCT: 'sql-select',
  'ORDER BY': 'sql-order', LIMIT: 'sql-order', WITH: 'sql-with', QUALIFY: 'sql-where',
};

// Que animação cada etapa pede ao chegar.
const JEITO_DE_CHEGAR = {
  WHERE: 'filtrar', HAVING: 'filtrar', QUALIFY: 'filtrar', DISTINCT: 'fundir',
  'ORDER BY': 'reordenar', LIMIT: 'cortar', SELECT: 'colunas',
};

const semMovimento = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/**
 * Monta o Raio-X dentro de um elemento.
 * @param {HTMLElement} alvo
 * @param {{etapas: {etapa: string, sql: string|{pt: string, en: string}}[]}} opcoes
 *   SQL em inglês (traduzido aqui) ou { pt, en } (ver sqlNoIdioma)
 * @returns {Promise<{irPara: (i: number) => Promise<void>, destruir: () => void}>}
 */
export async function criarRaioX(alvo, { etapas }) {
  alvo.classList.add('raiox');
  alvo.innerHTML = `
    <ol class="raiox-etapas"></ol>
    <p class="raiox-explicacao" aria-live="polite"></p>
    <div class="raiox-quadro"></div>
    <p class="raiox-contagem discreto"></p>
    <div class="raiox-controles">
      <button type="button" class="botao raiox-anterior" data-i18n="raioX.anterior">${t('raioX.anterior')}</button>
      <button type="button" class="botao botao--principal raiox-proxima" data-i18n="raioX.proxima">${t('raioX.proxima')}</button>
      <button type="button" class="botao raiox-de-novo" data-i18n="raioX.deNovo">${t('raioX.deNovo')}</button>
    </div>
  `;

  const lista = alvo.querySelector('.raiox-etapas');
  const explicacao = alvo.querySelector('.raiox-explicacao');
  const quadro = alvo.querySelector('.raiox-quadro');
  const contagem = alvo.querySelector('.raiox-contagem');
  const botaoAnterior = alvo.querySelector('.raiox-anterior');
  const botaoProxima = alvo.querySelector('.raiox-proxima');
  const botaoDeNovo = alvo.querySelector('.raiox-de-novo');

  let resultados = [];
  let visiveis = [];   // por etapa: as linhas mostradas, com a chave de cada uma
  let atual = -1;
  let animando = false;

  /* ------------------------------------------------------------------------
     Os resultados de todas as etapas, de uma vez
     ------------------------------------------------------------------------ */

  async function carregar() {
    resultados = [];
    for (const { sql } of etapas) {
      resultados.push(await consultar(sqlNoIdioma(sql, idiomaDaBase() ?? idioma()), { maxLinhas: LINHAS_DO_MOTOR }));
    }
    visiveis = resultados.map((_, i) => escolherLinhas(i));
  }

  /**
   * As linhas que a etapa mostra. Antes de um filtro, uma mistura das que
   * vão passar e das que não vão — senão, numa tabela grande, as 12 primeiras
   * podiam passar todas (ou nenhuma), e o filtro não se veria acontecendo.
   */
  function escolherLinhas(i) {
    const { linhas } = resultados[i];
    const comChave = linhas.map((linha) => ({ linha, chave: chaveDaLinha(linha) }));
    marcarOcorrencias(comChave);

    const seguinte = etapas[i + 1]?.etapa.toUpperCase();
    if (JEITO_DE_CHEGAR[seguinte] !== 'filtrar' || comChave.length <= LINHAS_NA_TELA) {
      return comChave.slice(0, LINHAS_NA_TELA);
    }

    const passam = new Set(ocorrencias(resultados[i + 1].linhas));
    const quePassam = comChave.filter((item) => passam.has(item.chave));
    const queSaem = comChave.filter((item) => !passam.has(item.chave));

    // Metade de cada, mais ou menos: se um dos lados tem pouco, o outro completa.
    const quantasPassam = Math.min(quePassam.length, Math.max(Math.ceil(LINHAS_NA_TELA / 2), LINHAS_NA_TELA - queSaem.length));
    const quantasSaem = Math.min(queSaem.length, LINHAS_NA_TELA - quantasPassam);
    const escolhidas = new Set([...quePassam.slice(0, quantasPassam), ...queSaem.slice(0, quantasSaem)]);

    // Na ordem original da tabela.
    return comChave.filter((item) => escolhidas.has(item));
  }

  /* ------------------------------------------------------------------------
     Desenhar uma etapa
     ------------------------------------------------------------------------ */

  function desenharEtapas() {
    lista.innerHTML = etapas
      .map(({ etapa }, i) => `
        <li><button type="button" class="raiox-etapa ${COR_DA_ETAPA[etapa.toUpperCase()] ?? ''}"
          data-indice="${i}" ${i === atual ? 'aria-current="step"' : ''}>${escapar(etapa.toUpperCase())}</button></li>`)
      .join('');
  }

  function desenharTabela(i, { passaram = false } = {}) {
    const { colunas, total } = resultados[i];
    const linhas = visiveis[i];
    const etapa = etapas[i].etapa.toUpperCase();
    const blocos = etapa === 'GROUP BY';

    const cabeca = colunas
      .map((c) => `<th scope="col" data-coluna="${escaparAtributo(c.nome)}" class="${c.tipo === 'numero' ? 'numero' : ''}">${escapar(c.nome)}</th>`)
      .join('');

    let anterior = null;
    const corpo = linhas
      .map(({ linha, chave }) => {
        // GROUP BY: uma linha fina separa um bloco do outro (a 1ª coluna é a chave).
        const novoBloco = blocos && anterior !== null && linha[0] !== anterior;
        anterior = linha[0];
        const classes = [passaram ? 'raiox-passa' : '', novoBloco ? 'raiox-bloco' : ''].filter(Boolean).join(' ');
        const celulas = linha
          .map((valor, j) => {
            if (valor === null) return '<td class="nulo">NULL</td>';
            const classe = colunas[j].tipo === 'numero' ? ' class="numero"' : '';
            return `<td${classe}>${escapar(formatarValor(valor, colunas[j]))}</td>`;
          })
          .join('');
        return `<tr data-chave="${escaparAtributo(chave)}"${classes ? ` class="${classes}"` : ''}>${celulas}</tr>`;
      })
      .join('');

    const escondidas = total - linhas.length;
    const rodape = escondidas > 0
      ? `<tr class="raiox-mais"><td colspan="${colunas.length}">${escapar(t('raioX.maisLinhas', { n: escondidas }))}</td></tr>`
      : '';

    quadro.innerHTML = `
      <table class="tabela-resultado mono raiox-tabela">
        <thead><tr>${cabeca}</tr></thead>
        <tbody>${corpo}${rodape}</tbody>
      </table>`;
  }

  function desenharTextos(i) {
    const etapa = etapas[i].etapa.toUpperCase();
    const chave = `raioX.explica.${etapa.replace(' ', '')}`;
    explicacao.textContent = t(chave);
    explicacao.dataset.i18n = chave;

    const depois = resultados[i].total;
    const antes = i > 0 ? resultados[i - 1].total : null;
    contagem.textContent = antes === null || antes === depois
      ? t(depois === 1 ? 'raioX.umaLinha' : 'raioX.linhas', { n: depois })
      : t(depois === 1 ? 'raioX.deAteUma' : 'raioX.deAte', { antes, depois });

    botaoAnterior.disabled = i === 0;
    botaoProxima.disabled = i === etapas.length - 1;
  }

  /* ------------------------------------------------------------------------
     Ir de uma etapa a outra
     ------------------------------------------------------------------------ */

  async function irPara(i) {
    if (animando || i < 0 || i >= etapas.length) return;
    animando = true;
    try {
      const vaiAnimar = i === atual + 1 && atual >= 0 && !semMovimento();
      if (vaiAnimar) {
        await animarChegada(i);
      } else {
        desenharTabela(i, { passaram: passouNumFiltro(i) });
        // Pular de etapa (ou começar): a tabela aparece de uma vez, com um fade.
        if (!semMovimento()) {
          quadro.firstElementChild?.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURACAO_ENTRADA });
        }
      }
      atual = i;
      desenharEtapas();
      desenharTextos(i);
    } finally {
      animando = false;
    }
  }

  /** Depois de um filtro (e até o SELECT seguinte), as linhas guardam o fundo de "passou". */
  function passouNumFiltro(i) {
    const etapa = etapas[i].etapa.toUpperCase();
    return JEITO_DE_CHEGAR[etapa] === 'filtrar';
  }

  async function animarChegada(i) {
    const jeito = JEITO_DE_CHEGAR[etapas[i].etapa.toUpperCase()];
    const linhasAntes = [...quadro.querySelectorAll('tbody tr[data-chave]')];
    const posicoesAntes = new Map(linhasAntes.map((tr) => [tr.dataset.chave, tr.getBoundingClientRect().top]));
    const ficam = new Set(visiveis[i].map((item) => item.chave));

    // 1. Na tabela de antes: quem sai apaga (e, num filtro, quem fica ganha a cor).
    const saidas = [];
    if (jeito === 'colunas') {
      const nomesDepois = new Set(resultados[i].colunas.map((c) => c.nome));
      const indicesQueSaem = resultados[i - 1].colunas
        .map((c, j) => (nomesDepois.has(c.nome) ? -1 : j))
        .filter((j) => j !== -1);
      for (const tr of quadro.querySelectorAll('tr')) {
        for (const j of indicesQueSaem) {
          const celula = tr.children[j];
          if (celula) saidas.push(apagar(celula));
        }
      }
    } else if (jeito) {
      for (const tr of linhasAntes) {
        if (!ficam.has(tr.dataset.chave)) saidas.push(apagar(tr));
        else if (jeito === 'filtrar') tr.classList.add('raiox-passa');
      }
    }
    await Promise.all(saidas);

    // 2. A tabela nova.
    desenharTabela(i, { passaram: jeito === 'filtrar' });

    // 3. Quem ficou desliza da posição antiga para a nova; quem é novo aparece.
    //    No SELECT as linhas não mudam de lugar: só as colunas novas aparecem.
    const entradas = [];
    const linhasQueSeMexem = jeito === 'colunas' ? [] : quadro.querySelectorAll('tbody tr[data-chave]');
    for (const tr of linhasQueSeMexem) {
      const antes = posicoesAntes.get(tr.dataset.chave);
      if (antes !== undefined) {
        const deslocamento = antes - tr.getBoundingClientRect().top;
        if (Math.abs(deslocamento) > 1) {
          entradas.push(tr.animate(
            [{ transform: `translateY(${deslocamento}px)` }, { transform: 'translateY(0)' }],
            { duration: DURACAO_ENTRADA, easing: 'cubic-bezier(.2,.7,.2,1)' }
          ).finished);
        }
      } else {
        entradas.push(tr.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURACAO_ENTRADA, easing: 'ease-out' }).finished);
      }
    }
    // Colunas novas (uma conta, um apelido) aparecem devagar.
    if (jeito === 'colunas') {
      const nomesAntes = new Set(resultados[i - 1].colunas.map((c) => c.nome));
      resultados[i].colunas.forEach((c, j) => {
        if (nomesAntes.has(c.nome)) return;
        for (const tr of quadro.querySelectorAll('tr')) {
          const celula = tr.children[j];
          if (celula) entradas.push(celula.animate([{ opacity: 0 }, { opacity: 1 }], { duration: DURACAO_ENTRADA }).finished);
        }
      });
    }
    await Promise.all(entradas.map((p) => p.catch(() => {})));
  }

  function apagar(elemento) {
    return elemento
      .animate([{ opacity: 1 }, { opacity: 0.08 }], { duration: DURACAO_SAIDA, easing: 'ease-in', fill: 'forwards' })
      .finished.catch(() => {});
  }

  /* ------------------------------------------------------------------------
     Botões, idioma, começo
     ------------------------------------------------------------------------ */

  botaoProxima.addEventListener('click', () => irPara(atual + 1));
  botaoAnterior.addEventListener('click', () => irPara(atual - 1));
  botaoDeNovo.addEventListener('click', async () => {
    atual = -1;
    await irPara(0);
  });
  lista.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.raiox-etapa');
    if (botao) irPara(Number(botao.dataset.indice));
  });

  // Trocar o idioma recarrega a base com outros nomes: refaz as etapas no
  // lugar, sem voltar para o começo.
  async function aoRecarregarBase() {
    const onde = Math.max(atual, 0);
    await carregar();
    atual = -1;
    await irPara(onde);
    desenharTextos(onde);
  }
  document.addEventListener('base-recarregada', aoRecarregarBase);

  await carregar();
  await irPara(0);

  return {
    irPara,
    destruir() {
      document.removeEventListener('base-recarregada', aoRecarregarBase);
    },
  };
}

/* --------------------------------------------------------------------------
   Chaves das linhas
   -------------------------------------------------------------------------- */

/** Uma linha vira texto: é o que casa a mesma linha entre duas etapas. */
function chaveDaLinha(linha) {
  return JSON.stringify(linha);
}

/**
 * Linhas repetidas precisam de chaves diferentes: a 2ª "Research" vira
 * "…#2". Assim, num DISTINCT, só a primeira fica e as outras saem.
 */
function marcarOcorrencias(itens) {
  const vistas = new Map();
  for (const item of itens) {
    const n = (vistas.get(item.chave) ?? 0) + 1;
    vistas.set(item.chave, n);
    if (n > 1) item.chave = `${item.chave}#${n}`;
  }
}

/** As chaves (com a contagem das repetidas) de um conjunto de linhas. */
function ocorrencias(linhas) {
  const itens = linhas.map((linha) => ({ chave: chaveDaLinha(linha) }));
  marcarOcorrencias(itens);
  return itens.map((item) => item.chave);
}

/** Texto para dentro de um atributo HTML: também as aspas duplas (a chave é JSON). */
function escaparAtributo(texto) {
  return escapar(String(texto)).replace(/"/g, '&quot;');
}
