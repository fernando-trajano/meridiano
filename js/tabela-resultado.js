/* ==========================================================================
   tabela-resultado.js — mostra o que uma consulta devolveu (ou o erro).

   Uma tabela só para o site inteiro: a amostra do pedido, o Passo a passo,
   o resultado da missão e o laboratório. Regras (redesenho depois do
   passo 12):
     - texto na fonte do sistema; mono SÓ em números, códigos (BRA, LCN) e
       NULL;
     - números à direita, com algarismos de mesma largura (tabular-nums);
     - valores crus, sem separador de milhar — 1438069596, como o SQL vê e
       como se escreve num WHERE; DECIMAL com as casas dele (45496.00);
     - o cabeçalho nunca é cortado: cada coluna tem pelo menos a largura do
       nome dela; se não couberem, a tabela rola para o lado;
     - uma linha por registro: numa CÉLULA, o que não cabe termina em "…",
       e o valor inteiro aparece ao parar o mouse em cima (title);
     - NULL escrito, discreto, para o vazio nunca passar despercebido;
     - no máximo MAX_LINHAS na tela; quem chama diz o total na barra.

   O erro aparece como a frase simples do erros-sql.js, a pista, a linha
   apontada pelo DuckDB e — fechada, para quem quiser — a mensagem original.
   ========================================================================== */

import { t } from './i18n.js';
import { selosEmHtml } from './realce.js';

/** Quantas linhas desenhar. A consulta pode devolver mais; a tela avisa. */
export const MAX_LINHAS = 200;

/** Quanto cada unidade de peso de coluna vale, em pixels (4.5rem). */
const PX_POR_PESO = 72;

/** A largura de uma letra da mono a 12.5px (a das células de número e código). */
const PX_POR_LETRA_MONO = 7.6;

/** O recuo do <th> dos dois lados (12px + 12px), e uma folga. */
const RECUO_DO_CABECALHO = 26;

let regua = null;

/** A largura do nome de uma coluna, na fonte do cabeçalho (12px, do sistema). */
function larguraDoNome(nome) {
  regua ??= document.createElement('canvas').getContext('2d');
  regua.font = `12px ${getComputedStyle(document.body).fontFamily}`;
  return Math.ceil(regua.measureText(nome).width) + RECUO_DO_CABECALHO;
}

/** Um valor de texto que parece código (BRA, LCN, BR): vai em mono. */
const PARECE_CODIGO = /^[A-Z][A-Z0-9]{1,3}$/;

/**
 * Monta a <table> de um resultado.
 * @param {{nome: string, tipo: string, escala: number|null}[]} colunas
 * @param {any[][]} linhas
 * @param {{chaves?: string[]}} [opcoes]  uma chave por linha (vai em data-chave)
 * @returns {HTMLTableElement}
 */
export function montarTabela(colunas, linhas, { chaves } = {}) {
  const tabela = document.createElement('table');
  tabela.className = 'tabela';

  // Uma coluna de texto só com códigos (BRA, WLD…) vai em mono.
  const ehCodigo = colunas.map((coluna, j) =>
    coluna.tipo === 'texto' &&
    linhas.some((linha) => linha[j] !== null) &&
    linhas.every((linha) => linha[j] === null || PARECE_CODIGO.test(String(linha[j])))
  );

  // A largura de cada coluna. O cabeçalho NUNCA é cortado: cada coluna tem
  // pelo menos a largura do próprio nome. Fora isso, texto ganha mais espaço
  // que número e código. As larguras viram porcentagens, e a soma vira a
  // largura mínima da tabela: se não couber, ela rola para o lado.
  const pesos = colunas.map((coluna, j) => {
    if (ehCodigo[j]) return 0.8;
    if (coluna.tipo === 'numero' || coluna.tipo === 'logico') return 1;
    if (coluna.tipo === 'data') return 1.1;
    return 1.7;
  });
  // Números, códigos e datas não viram "…": a coluna tem a largura do maior
  // valor mostrado (até um teto). Só o texto comprido encolhe.
  const curtas = colunas.map((coluna, j) => ehCodigo[j] || ['numero', 'data', 'logico'].includes(coluna.tipo));
  const bases = colunas.map((coluna, j) => {
    let base = Math.max(larguraDoNome(coluna.nome), pesos[j] * PX_POR_PESO);
    if (curtas[j]) {
      const maior = Math.max(0, ...linhas.map((linha) => (linha[j] === null ? 4 : formatarValor(linha[j], coluna).length)));
      base = Math.max(base, Math.min(maior * PX_POR_LETRA_MONO + RECUO_DO_CABECALHO, 220));
    }
    return base;
  });
  const soma = bases.reduce((a, b) => a + b, 0);
  const grupo = document.createElement('colgroup');
  for (const base of bases) {
    const col = document.createElement('col');
    col.style.width = `${(base / soma) * 100}%`;
    grupo.append(col);
  }
  tabela.append(grupo);
  tabela.style.minWidth = `${Math.ceil(soma)}px`;

  const cabeca = tabela.createTHead().insertRow();
  colunas.forEach((coluna) => {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = coluna.nome;
    if (coluna.tipo === 'numero') th.className = 'numero';
    cabeca.append(th);
  });

  const corpo = tabela.createTBody();
  linhas.forEach((linha, i) => {
    const tr = corpo.insertRow();
    if (chaves) tr.dataset.chave = chaves[i];
    linha.forEach((valor, j) => {
      const td = tr.insertCell();
      const coluna = colunas[j];
      if (valor === null) {
        td.textContent = 'NULL';
        td.className = 'nulo';
        return;
      }
      const texto = formatarValor(valor, coluna);
      td.textContent = texto;
      td.title = texto;
      if (coluna.tipo === 'numero') td.className = 'numero';
      else if (ehCodigo[j]) td.className = 'codigo';
    });
  });

  return tabela;
}

/**
 * Desenha um resultado dentro de um elemento (substitui o que houver).
 * @param {HTMLElement} alvo
 * @param {{colunas: {nome: string, tipo: string, escala: number|null}[],
 *          linhas: any[][], total: number, ms: number}} resultado
 * @returns {string} o resumo, para a barra de quem chamou ("60 linhas · 4 ms")
 */
export function desenharResultado(alvo, { colunas, linhas, total, ms }) {
  // Comando sem resultado em tabela (CREATE, DROP…).
  if (colunas.length === 0) {
    alvo.replaceChildren(aviso(t('resultado.comando')));
    return t('resultado.ms', { ms });
  }

  const rolagem = document.createElement('div');
  rolagem.className = 'tabela-rolagem';
  rolagem.tabIndex = 0;   // rolável pelo teclado
  rolagem.setAttribute('role', 'region');
  rolagem.setAttribute('aria-label', t('resultado.tabela'));
  rolagem.append(montarTabela(colunas, linhas));

  if (total === 0) {
    alvo.replaceChildren(rolagem, aviso(t('resultado.nenhuma')));
    return t('resultado.ms', { ms });
  }

  alvo.replaceChildren(rolagem);
  return resumoDeLinhas(total, linhas.length, ms);
}

/** "60 linhas · 4 ms", ou "1234 linhas · mostrando 200 · 9 ms". */
export function resumoDeLinhas(total, mostradas, ms) {
  const linhas = total === 1 ? t('resultado.umaLinha') : t('resultado.linhas', { n: total });
  const partes = [linhas];
  if (mostradas < total) partes.push(t('resultado.mostrando', { n: mostradas }));
  if (ms != null) partes.push(t('resultado.ms', { ms }));
  return partes.join(' · ');
}

function aviso(texto) {
  const p = document.createElement('p');
  p.className = 'tabela-aviso';
  p.textContent = texto;
  return p;
}

/** Um valor como texto, do jeito que o banco mostraria. */
export function formatarValor(valor, coluna) {
  if (typeof valor === 'number' && coluna?.escala != null) return valor.toFixed(coluna.escala);
  if (typeof valor === 'boolean') return valor ? 'true' : 'false';
  return String(valor);
}

/**
 * Desenha um erro já traduzido (ver erros-sql.js).
 * @param {HTMLElement} alvo
 * @param {{frase: string, pista: string|null, linha: number|null, original: string}} erro
 *   frase e pista em HTML seguro, feito pelo erros-sql.js
 */
export function desenharErro(alvo, { frase, pista, linha, original }) {
  const caixa = document.createElement('div');
  caixa.className = 'resultado-erro';
  caixa.setAttribute('role', 'alert');

  const principal = document.createElement('p');
  principal.className = 'resultado-erro-frase';
  principal.innerHTML = selosEmHtml(frase);
  if (linha) {
    const onde = document.createElement('span');
    onde.className = 'resultado-erro-linha';
    onde.textContent = ` · ${t('resultado.linhaDoErro', { linha })}`;
    principal.append(onde);
  }
  caixa.append(principal);

  if (pista) {
    const dica = document.createElement('p');
    dica.className = 'resultado-erro-pista';
    dica.innerHTML = selosEmHtml(pista);
    caixa.append(dica);
  }

  const detalhes = document.createElement('details');
  detalhes.className = 'resultado-erro-original';
  const resumo = document.createElement('summary');
  resumo.textContent = t('resultado.original');
  const texto = document.createElement('pre');
  texto.className = 'mono';
  texto.textContent = original;
  detalhes.append(resumo, texto);
  caixa.append(detalhes);

  alvo.replaceChildren(caixa);
}
