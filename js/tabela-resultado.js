/* ==========================================================================
   tabela-resultado.js — mostra o que uma consulta devolveu (ou o erro).

   O resultado aparece como num programa de banco de dados de verdade:
     - valores crus, sem separador de milhar — 1438069596, como o SQL vê e
       como se escreve num WHERE;
     - DECIMAL com as casas dele (45496.00);
     - números alinhados à direita, para as casas se alinharem;
     - NULL escrito, discreto, para o vazio nunca passar despercebido;
     - no máximo MAX_LINHAS na tela, com o total dito na linha de cima.

   O erro aparece como a frase simples do erros-sql.js, a pista, a linha
   apontada pelo DuckDB e — fechada, para quem quiser — a mensagem original.
   ========================================================================== */

import { t } from './i18n.js';

/** Quantas linhas desenhar. A consulta pode devolver mais; a tela avisa. */
export const MAX_LINHAS = 200;

/**
 * Desenha um resultado dentro de um elemento (substitui o que houver).
 * @param {HTMLElement} alvo
 * @param {{colunas: {nome: string, tipo: string, escala: number|null}[],
 *          linhas: any[][], total: number, ms: number}} resultado
 */
export function desenharResultado(alvo, { colunas, linhas, total, ms }) {
  const info = document.createElement('p');
  info.className = 'resultado-info discreto';

  // Comando sem resultado em tabela (CREATE, DROP…).
  if (colunas.length === 0) {
    info.textContent = t('resultado.comando', { ms });
    alvo.replaceChildren(info);
    return;
  }

  if (total === 0) info.textContent = t('resultado.nenhuma', { ms });
  else if (total === 1) info.textContent = t('resultado.umaLinha', { ms });
  else if (total > linhas.length) info.textContent = t('resultado.linhasCortadas', { total, linhas: linhas.length, ms });
  else info.textContent = t('resultado.linhas', { linhas: total, ms });

  const rolagem = document.createElement('div');
  rolagem.className = 'resultado-rolagem';
  rolagem.tabIndex = 0;   // rolável pelo teclado
  rolagem.setAttribute('role', 'region');
  rolagem.setAttribute('aria-label', t('resultado.tabela'));

  const tabela = document.createElement('table');
  tabela.className = 'tabela-resultado mono';

  const cabeca = tabela.createTHead().insertRow();
  for (const coluna of colunas) {
    const th = document.createElement('th');
    th.scope = 'col';
    th.textContent = coluna.nome;
    if (coluna.tipo === 'numero') th.className = 'numero';
    cabeca.append(th);
  }

  const corpo = tabela.createTBody();
  for (const linha of linhas) {
    const tr = corpo.insertRow();
    linha.forEach((valor, j) => {
      const td = tr.insertCell();
      const coluna = colunas[j];
      if (valor === null) {
        td.textContent = 'NULL';
        td.className = 'nulo';
        return;
      }
      td.textContent = formatarValor(valor, coluna);
      if (coluna.tipo === 'numero') td.className = 'numero';
    });
  }

  rolagem.append(tabela);
  alvo.replaceChildren(info, rolagem);
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
  principal.innerHTML = frase;
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
    dica.innerHTML = pista;
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

  alvo.replaceChildren(caixa, detalhes);
}
