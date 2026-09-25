/* ==========================================================================
   editor.js — o editor de SQL: realce por cláusula, autocompletar, atalhos
   e formatar. Usado na missão e no laboratório.

   Desde o redesenho depois do passo 12, o editor é só a área de código: a
   barra em cima dele (a aba "Consulta", o atalho e o botão Rodar) é de quem
   o usa — ver a missão. Sem números de linha: a linha de um erro ganha uma
   marca fina na margem.

   Como é feito: um <textarea> de verdade, com o texto transparente, deitado
   por cima de uma cópia colorida da consulta (<pre>). Tudo o que o navegador
   já faz bem continua com ele — digitar, desfazer (Cmd+Z), colar, selecionar,
   acentos compostos do Safari, leitores de tela —, e o realce só acompanha.
   As duas camadas precisam ter exatamente a mesma fonte, o mesmo tamanho e
   o mesmo espaçamento (ver editor.css).

   Atalhos:
     Cmd/Ctrl + Enter   roda
     Cmd/Ctrl + /       comenta ou descomenta as linhas
     Shift + Alt + F    formata (⇧⌥F no Mac) — só quando pedido, nunca sozinho
     Tab / Shift+Tab    recua / desrecua (Esc e depois Tab sai do editor)
     Enter              quebra a linha mantendo o recuo
     ↑ ↓ Enter Tab Esc  navegam nas sugestões, quando abertas

   As mudanças feitas pelo editor (sugestão aceita, comentário, formatar,
   troca de idioma) passam por insertText, e por isso entram no desfazer.
   ========================================================================== */

import { t, idioma } from './i18n.js';
import { realcarSQL, escapar } from './realce.js';
import { formatarSQL } from './formatar-sql.js';
import { traduzirSQL, separar } from './traducao-sql.js';
import { dicionario } from '../dados/base/dicionario.js';

const EH_MAC = /Mac|iPhone|iPad/.test(navigator.platform || navigator.userAgent);

/** Os atalhos de rodar e de formatar, escritos para este sistema. */
export const ATALHO_RODAR = EH_MAC ? '⌘ Enter' : 'Ctrl + Enter';
export const ATALHO_FORMATAR = EH_MAC ? '⇧⌥F' : 'Shift + Alt + F';
const RECUO = '  ';
const MAX_SUGESTOES = 8;

let contador = 0;

/**
 * Monta um editor dentro de um elemento.
 * @param {HTMLElement} alvo
 * @param {{inicial?: string, aoRodar?: (sql: string) => void,
 *          linhasMin?: number, linhasMax?: number}} [opcoes]
 */
export function criarEditor(alvo, { inicial = '', aoRodar = () => {}, linhasMin = 3, linhasMax = 10 } = {}) {
  contador += 1;
  const id = `editor-${contador}`;

  alvo.classList.add('editor');
  alvo.innerHTML = `
    <div class="editor-corpo">
      <div class="editor-area">
        <span class="editor-marca-erro" aria-hidden="true" hidden></span>
        <pre class="editor-realce mono" aria-hidden="true"><code></code></pre>
        <textarea class="editor-texto mono" id="${id}-texto" spellcheck="false" autocapitalize="off"
          autocomplete="off" autocorrect="off" wrap="off" aria-autocomplete="list"
          aria-controls="${id}-sugestoes" aria-describedby="${id}-dica"
          data-i18n-aria="editor.rotulo" aria-label="${escapar(t('editor.rotulo'))}"></textarea>
        <ul class="editor-sugestoes" id="${id}-sugestoes" role="listbox"
          data-i18n-aria="editor.sugestoes" aria-label="${escapar(t('editor.sugestoes'))}" hidden></ul>
        <span class="editor-medida mono" aria-hidden="true">MMMMMMMMMM</span>
      </div>
    </div>
    <p class="apenas-leitor-de-tela" id="${id}-dica"></p>
  `;

  const texto = alvo.querySelector('.editor-texto');
  const realce = alvo.querySelector('.editor-realce');
  const codigo = realce.querySelector('code');
  const marcaErro = alvo.querySelector('.editor-marca-erro');
  const area = alvo.querySelector('.editor-area');
  const lista = alvo.querySelector('.editor-sugestoes');
  const medida = alvo.querySelector('.editor-medida');
  const dica = alvo.querySelector(`#${id}-dica`);

  let linhaComErro = null;
  let idiomaDoTexto = idioma();
  let sairComTab = false;        // Esc liga: o próximo Tab sai do editor
  let sugestoes = [];            // as sugestões abertas
  let ativa = 0;                 // qual delas está marcada
  let prefixo = '';              // o pedaço de palavra que elas completam

  texto.value = inicial;

  /* ------------------------------------------------------------------------
     Desenho: realce, números, altura, rolagem
     ------------------------------------------------------------------------ */

  function atualizar() {
    // O "\n" a mais garante que a última linha vazia também tenha altura.
    codigo.innerHTML = realcarSQL(texto.value) + '\n';

    const total = texto.value.split('\n').length;
    const estilo = getComputedStyle(texto);
    const alturaDaLinha = parseFloat(estilo.lineHeight);
    const margens = parseFloat(estilo.paddingTop) + parseFloat(estilo.paddingBottom);
    const linhas = Math.min(Math.max(total, linhasMin), linhasMax);
    // A barra de rolagem horizontal, quando aparece, ganha o seu espaço.
    const folga = texto.scrollWidth > texto.clientWidth ? 12 : 0;
    area.style.height = `${Math.ceil(linhas * alturaDaLinha + margens + folga)}px`;

    sincronizarRolagem();
  }

  function sincronizarRolagem() {
    realce.scrollTop = texto.scrollTop;
    realce.scrollLeft = texto.scrollLeft;
    posicionarMarcaDeErro();
  }

  /** A marca fina na margem, na altura da linha que o DuckDB apontou. */
  function posicionarMarcaDeErro() {
    marcaErro.hidden = linhaComErro === null;
    if (linhaComErro === null) return;
    const estilo = getComputedStyle(texto);
    const alturaDaLinha = parseFloat(estilo.lineHeight);
    marcaErro.style.top = `${parseFloat(estilo.paddingTop) + (linhaComErro - 1) * alturaDaLinha - texto.scrollTop}px`;
    marcaErro.style.height = `${alturaDaLinha}px`;
  }

  function atualizarDica() {
    dica.textContent = t('editor.dica', {
      rodar: ATALHO_RODAR,
      comentar: EH_MAC ? '⌘ /' : 'Ctrl + /',
      formatar: ATALHO_FORMATAR,
    });
  }

  /* ------------------------------------------------------------------------
     Escrever no texto sem perder o desfazer
     ------------------------------------------------------------------------ */

  /** Troca a seleção por um texto, como se a pessoa tivesse digitado. */
  function inserir(novo) {
    texto.focus();
    // insertText entra no histórico do desfazer; setRangeText, não. Este
    // último só fica como reserva para navegador que não aceite o primeiro.
    const aceito = document.execCommand && document.execCommand('insertText', false, novo);
    if (!aceito) {
      texto.setRangeText(novo, texto.selectionStart, texto.selectionEnd, 'end');
      texto.dispatchEvent(new Event('input', { bubbles: true }));
    }
  }

  /** Substitui o texto todo (formatar, trocar de idioma), mantendo a linha do cursor. */
  function substituirTudo(novo) {
    if (novo === texto.value) return;
    const antes = texto.value.slice(0, texto.selectionStart).split('\n');
    const linha = antes.length - 1;
    const coluna = antes[antes.length - 1].length;

    texto.setSelectionRange(0, texto.value.length);
    inserir(novo);

    const linhas = novo.split('\n');
    const linhaNova = Math.min(linha, linhas.length - 1);
    const posicao = linhas.slice(0, linhaNova).reduce((soma, l) => soma + l.length + 1, 0) +
      Math.min(coluna, linhas[linhaNova].length);
    texto.setSelectionRange(posicao, posicao);
  }

  /** As linhas tocadas pela seleção: de onde a onde, e o texto delas. */
  function linhasDaSelecao() {
    const valor = texto.value;
    const { selectionStart: s, selectionEnd: e } = texto;
    const inicio = valor.lastIndexOf('\n', s - 1) + 1;
    // Seleção que termina logo depois de um "\n" não pega a linha seguinte.
    const ate = e > s && valor[e - 1] === '\n' ? e - 1 : e;
    let fim = valor.indexOf('\n', ate);
    if (fim === -1) fim = valor.length;
    return { inicio, fim, linhas: valor.slice(inicio, fim).split('\n') };
  }

  function trocarLinhas(transformar) {
    const { inicio, fim, linhas } = linhasDaSelecao();
    const novo = transformar(linhas).join('\n');
    texto.setSelectionRange(inicio, fim);
    inserir(novo);
    texto.setSelectionRange(inicio, inicio + novo.length);
  }

  /** Cmd+/: comenta as linhas; se todas já estão comentadas, descomenta. */
  function comentar() {
    trocarLinhas((linhas) => {
      const cheias = linhas.filter((l) => l.trim());
      const todasComentadas = cheias.length > 0 && cheias.every((l) => /^\s*--/.test(l));
      if (todasComentadas) return linhas.map((l) => l.replace(/^(\s*)-- ?/, '$1'));
      const recuo = Math.min(...cheias.map((l) => /^\s*/.exec(l)[0].length));
      return linhas.map((l) => (l.trim() ? `${l.slice(0, recuo)}-- ${l.slice(recuo)}` : l));
    });
  }

  function recuar(desfazer) {
    const { selectionStart: s, selectionEnd: e } = texto;
    const variasLinhas = texto.value.slice(s, e).includes('\n');
    if (!desfazer && !variasLinhas) {
      inserir(RECUO);
      return;
    }
    trocarLinhas((linhas) =>
      linhas.map((l) => (desfazer ? l.replace(new RegExp(`^ {1,${RECUO.length}}`), '') : RECUO + l))
    );
  }

  function quebrarLinhaComRecuo() {
    const valor = texto.value;
    const inicio = valor.lastIndexOf('\n', texto.selectionStart - 1) + 1;
    const recuo = /^[ \t]*/.exec(valor.slice(inicio, texto.selectionStart))[0];
    inserir(`\n${recuo}`);
  }

  function formatar() {
    substituirTudo(formatarSQL(texto.value));
  }

  /* ------------------------------------------------------------------------
     Autocompletar
     ------------------------------------------------------------------------ */

  function abrirSugestoes() {
    const achado = palavraNoCursor();
    if (!achado) return fecharSugestoes();

    prefixo = achado.prefixo;
    sugestoes = buscarSugestoes(achado, texto.value);
    if (!sugestoes.length) return fecharSugestoes();

    ativa = 0;
    lista.innerHTML = sugestoes
      .map(
        (s, i) => `<li role="option" id="${id}-opcao-${i}" aria-selected="${i === 0}">
          <span class="editor-sugestao-nome mono">${escapar(s.texto)}</span>
          <span class="editor-sugestao-tipo">${escapar(s.rotulo)}</span>
        </li>`
      )
      .join('');
    lista.hidden = false;
    texto.setAttribute('aria-activedescendant', `${id}-opcao-0`);
    posicionarLista();
  }

  function fecharSugestoes() {
    sugestoes = [];
    lista.hidden = true;
    lista.innerHTML = '';
    texto.removeAttribute('aria-activedescendant');
  }

  function marcar(indice) {
    ativa = (indice + sugestoes.length) % sugestoes.length;
    lista.querySelectorAll('li').forEach((li, i) => li.setAttribute('aria-selected', String(i === ativa)));
    texto.setAttribute('aria-activedescendant', `${id}-opcao-${ativa}`);
    lista.children[ativa]?.scrollIntoView({ block: 'nearest' });
  }

  function aceitar(indice = ativa) {
    const escolhida = sugestoes[indice];
    if (!escolhida) return;
    const fim = texto.selectionStart;
    texto.setSelectionRange(fim - prefixo.length, fim);
    inserir(escolhida.texto);
    fecharSugestoes();
  }

  /** A palavra que está sendo digitada, se o cursor estiver no fim de uma. */
  function palavraNoCursor() {
    const { selectionStart: s, selectionEnd: e, value } = texto;
    if (s !== e) return null;
    if (/[A-Za-z0-9_]/.test(value[s] ?? '')) return null;   // no meio de uma palavra

    const antes = value.slice(0, s);
    const achado = /[A-Za-z_][A-Za-z0-9_]*$/.exec(antes);
    const aposPonto = /([A-Za-z_][A-Za-z0-9_]*)\.([A-Za-z0-9_]*)$/.exec(antes);

    // Dentro de texto entre aspas ou de comentário, nada de sugestão.
    const pedacos = separar(antes);
    const ultimo = pedacos[pedacos.length - 1];
    if (ultimo && ['texto', 'comentario', 'nome-entre-aspas'].includes(ultimo.tipo)) return null;

    if (aposPonto) return { prefixo: aposPonto[2], qualificador: aposPonto[1] };
    if (!achado || achado[0].length < 2) return null;
    return { prefixo: achado[0], qualificador: null };
  }

  /** Onde a lista aparece: logo abaixo do cursor (a fonte é mono: dá para contar). */
  function posicionarLista() {
    const estilo = getComputedStyle(texto);
    const larguraDaLetra = medida.getBoundingClientRect().width / 10;
    const alturaDaLinha = parseFloat(estilo.lineHeight);
    const antes = texto.value.slice(0, texto.selectionStart).split('\n');
    const linha = antes.length - 1;
    const coluna = antes[antes.length - 1].length - prefixo.length;

    let x = parseFloat(estilo.paddingLeft) + coluna * larguraDaLetra - texto.scrollLeft;
    const y = parseFloat(estilo.paddingTop) + (linha + 1) * alturaDaLinha - texto.scrollTop + 2;
    x = Math.max(0, Math.min(x, area.clientWidth - lista.offsetWidth - 4));
    lista.style.left = `${x}px`;
    lista.style.top = `${y}px`;
  }

  /* ------------------------------------------------------------------------
     Eventos
     ------------------------------------------------------------------------ */

  texto.addEventListener('input', (evento) => {
    linhaComErro = null;
    atualizar();
    if (evento.isComposing) return;   // acento sendo composto: espera terminar
    abrirSugestoes();
  });

  texto.addEventListener('scroll', () => {
    sincronizarRolagem();
    if (!lista.hidden) posicionarLista();
  });

  texto.addEventListener('keydown', (evento) => {
    const comando = EH_MAC ? evento.metaKey : evento.ctrlKey;
    const abertas = !lista.hidden;

    if (abertas) {
      if (evento.key === 'ArrowDown') { evento.preventDefault(); marcar(ativa + 1); return; }
      if (evento.key === 'ArrowUp') { evento.preventDefault(); marcar(ativa - 1); return; }
      if ((evento.key === 'Enter' && !comando) || evento.key === 'Tab') { evento.preventDefault(); aceitar(); return; }
      if (evento.key === 'Escape') { evento.preventDefault(); fecharSugestoes(); return; }
    }

    if (comando && evento.key === 'Enter') { evento.preventDefault(); fecharSugestoes(); aoRodar(texto.value); return; }
    // A barra pode vir de teclas físicas diferentes: "Slash" no teclado
    // americano, "IntlRo" (ao lado do Shift direito) no ABNT2.
    const barra = evento.key === '/' || evento.code === 'Slash' || evento.code === 'IntlRo';
    if (comando && barra) { evento.preventDefault(); comentar(); return; }
    // evento.code, e não evento.key: no Mac, Option+F escreve "ƒ".
    if (evento.shiftKey && evento.altKey && evento.code === 'KeyF') { evento.preventDefault(); fecharSugestoes(); formatar(); return; }

    if (evento.key === 'Escape') { sairComTab = true; return; }
    if (evento.key === 'Tab') {
      if (sairComTab) { sairComTab = false; return; }   // deixa o foco sair
      evento.preventDefault();
      recuar(evento.shiftKey);
      return;
    }
    sairComTab = false;

    if (evento.key === 'Enter' && !evento.shiftKey && !evento.isComposing) {
      evento.preventDefault();
      quebrarLinhaComRecuo();
    }
  });

  // Clicar ou andar com as setas fora da palavra fecha a lista.
  texto.addEventListener('click', fecharSugestoes);
  texto.addEventListener('blur', () => setTimeout(fecharSugestoes, 150));

  // mousedown (e não click) para o textarea não perder o foco antes.
  lista.addEventListener('mousedown', (evento) => {
    const item = evento.target.closest('li');
    if (!item) return;
    evento.preventDefault();
    aceitar([...lista.children].indexOf(item));
  });

  // Trocar o idioma da tela traduz os nomes de tabela e coluna do texto.
  function aoMudarIdioma(evento) {
    const novo = evento.detail.idioma;
    if (novo !== idiomaDoTexto) {
      const traduzido = traduzirSQL(texto.value, idiomaDoTexto, novo);
      idiomaDoTexto = novo;
      if (document.activeElement === texto) substituirTudo(traduzido);
      else {
        texto.value = traduzido;
        atualizar();
      }
    }
    atualizarDica();
  }
  document.addEventListener('idioma-mudou', aoMudarIdioma);

  // A fonte mono chega depois: remedir quando ela carregar — e conferir que
  // as duas camadas têm a mesma fonte. Qualquer diferença desalinha o cursor
  // do texto que se vê (foi o defeito achado depois do passo 8).
  document.fonts?.ready.then(() => {
    atualizar();
    const deTexto = getComputedStyle(texto);
    const deRealce = getComputedStyle(codigo);
    for (const propriedade of ['fontSize', 'fontFamily', 'lineHeight', 'letterSpacing']) {
      if (deTexto[propriedade] !== deRealce[propriedade]) {
        console.warn(`[editor] As camadas do editor diferem em ${propriedade}: ` +
          `${deTexto[propriedade]} × ${deRealce[propriedade]}. O cursor vai desalinhar.`);
      }
    }
  });

  atualizarDica();
  atualizar();

  return {
    /** O texto do editor. */
    valor: () => texto.value,
    /** Troca o texto (sem entrar no desfazer — é para carregar uma missão). */
    definirValor(novo, idiomaDoNovo = idioma()) {
      texto.value = novo;
      idiomaDoTexto = idiomaDoNovo;
      linhaComErro = null;
      atualizar();
    },
    focar: () => texto.focus(),
    /** Escreve no cursor, como se a pessoa tivesse digitado (entra no desfazer). */
    inserirTexto(novo) {
      inserir(novo);
    },
    formatar,
    /** Roda o que está escrito (o botão Rodar da barra de quem usa o editor). */
    rodar: () => {
      fecharSugestoes();
      aoRodar(texto.value);
    },
    /** Marca, na margem, a linha que o DuckDB apontou. */
    marcarErro(linha) {
      linhaComErro = linha;
      atualizar();
    },
    /** Para parar de ouvir a troca de idioma, quando a tela sai. */
    destruir() {
      document.removeEventListener('idioma-mudou', aoMudarIdioma);
    },
  };
}

/* --------------------------------------------------------------------------
   O vocabulário das sugestões
   -------------------------------------------------------------------------- */

const PALAVRAS_CHAVE = [
  'SELECT', 'FROM', 'WHERE', 'GROUP BY', 'HAVING', 'ORDER BY', 'LIMIT', 'OFFSET', 'DISTINCT',
  'JOIN', 'INNER JOIN', 'LEFT JOIN', 'ON', 'AS', 'AND', 'OR', 'NOT', 'IN', 'BETWEEN', 'LIKE',
  'ILIKE', 'IS NULL', 'IS NOT NULL', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'ASC', 'DESC',
  'UNION', 'UNION ALL', 'INTERSECT', 'EXCEPT', 'EXISTS', 'WITH', 'RECURSIVE', 'OVER',
  'PARTITION BY', 'QUALIFY', 'PIVOT', 'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM',
  'CREATE TABLE', 'CREATE VIEW', 'DROP TABLE', 'PRIMARY KEY', 'NOT NULL', 'BEGIN', 'COMMIT',
  'ROLLBACK', 'NULLS FIRST', 'NULLS LAST',
];

const FUNCOES = [
  'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'ROUND', 'CAST', 'COALESCE', 'NULLIF', 'UPPER', 'LOWER',
  'LENGTH', 'TRIM', 'SUBSTRING', 'REPLACE', 'CONCAT', 'ABS', 'CEIL', 'FLOOR', 'ROW_NUMBER',
  'RANK', 'DENSE_RANK', 'LAG', 'LEAD', 'FIRST_VALUE', 'LAST_VALUE', 'EXTRACT', 'YEAR', 'MONTH',
  'DAY', 'DATE_TRUNC', 'STRFTIME', 'STRING_AGG', 'MEDIAN', 'GREATEST', 'LEAST',
];

const vocabularios = {};

/** Tabelas e colunas no idioma pedido, mais palavras-chave e funções. */
function vocabulario(idiomaAlvo) {
  if (vocabularios[idiomaAlvo]) return vocabularios[idiomaAlvo];

  const emPt = idiomaAlvo === 'pt';
  const tabelas = [];
  const colunas = new Map();         // nome da coluna → tabelas onde aparece
  const colunasDaTabela = new Map(); // nome da tabela → colunas

  for (const [tabelaEn, tabela] of Object.entries(dicionario)) {
    const nomeTabela = emPt ? tabela.pt : tabelaEn;
    tabelas.push(nomeTabela);
    colunasDaTabela.set(nomeTabela, []);
    for (const [colunaEn, coluna] of Object.entries(tabela.colunas)) {
      const nomeColuna = emPt ? coluna.pt : colunaEn;
      colunasDaTabela.get(nomeTabela).push(nomeColuna);
      if (!colunas.has(nomeColuna)) colunas.set(nomeColuna, []);
      colunas.get(nomeColuna).push(nomeTabela);
    }
  }

  vocabularios[idiomaAlvo] = { tabelas, colunas, colunasDaTabela };
  return vocabularios[idiomaAlvo];
}

/** As tabelas que a consulta menciona, e os apelidos delas (FROM paises p). */
function tabelasDaConsulta(sql, voc) {
  const pedacos = separar(sql).filter((p) => p.tipo !== 'espaco' && p.tipo !== 'comentario');
  const apelidos = new Map();
  const naConsulta = new Set();
  const conhecidas = new Set(voc.tabelas);

  pedacos.forEach((pedaco, i) => {
    const nome = pedaco.texto.toLowerCase();
    if (!conhecidas.has(nome)) return;
    naConsulta.add(nome);
    apelidos.set(nome, nome);
    let j = i + 1;
    if (pedacos[j]?.texto.toLowerCase() === 'as') j += 1;
    const apelido = pedacos[j];
    if (apelido?.tipo === 'nome' && !ehPalavraChave(apelido.texto)) apelidos.set(apelido.texto.toLowerCase(), nome);
  });
  return { naConsulta, apelidos };
}

function ehPalavraChave(palavra) {
  const p = palavra.toUpperCase();
  return PALAVRAS_CHAVE.some((k) => k.split(' ')[0] === p) || ['LEFT', 'RIGHT', 'INNER', 'FULL', 'CROSS', 'USING'].includes(p);
}

/** As sugestões para a palavra no cursor, das mais prováveis para as menos. */
function buscarSugestoes({ prefixo, qualificador }, sql) {
  const voc = vocabulario(idioma());
  const busca = prefixo.toLowerCase();
  const { naConsulta, apelidos } = tabelasDaConsulta(sql, voc);
  const combina = (nome) => nome.toLowerCase().startsWith(busca) && nome.toLowerCase() !== busca;

  // Depois de "p.": só as colunas da tabela que p representa.
  if (qualificador) {
    const tabela = apelidos.get(qualificador.toLowerCase());
    if (!tabela) return [];
    return voc.colunasDaTabela
      .get(tabela)
      .filter((c) => !busca || combina(c))
      .slice(0, MAX_SUGESTOES)
      .map((c) => ({ texto: c, rotulo: t('editor.coluna', { tabela }) }));
  }

  const itens = [];
  for (const [coluna, donas] of voc.colunas) {
    if (!combina(coluna)) continue;
    const daConsulta = donas.filter((d) => naConsulta.has(d));
    itens.push({
      texto: coluna,
      rotulo: t('editor.coluna', { tabela: (daConsulta.length ? daConsulta : donas).join(', ') }),
      peso: daConsulta.length ? 0 : 2,
    });
  }
  for (const tabela of voc.tabelas) {
    if (combina(tabela)) itens.push({ texto: tabela, rotulo: t('editor.tabela'), peso: 1 });
  }
  for (const palavra of PALAVRAS_CHAVE) {
    if (combina(palavra)) itens.push({ texto: palavra, rotulo: t('editor.palavraChave'), peso: 3 });
  }
  for (const funcao of FUNCOES) {
    if (combina(funcao)) itens.push({ texto: funcao, rotulo: t('editor.funcao'), peso: 3 });
  }

  return itens
    .sort((a, b) => a.peso - b.peso || a.texto.length - b.texto.length || a.texto.localeCompare(b.texto))
    .slice(0, MAX_SUGESTOES);
}
