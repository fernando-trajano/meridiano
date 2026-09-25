/* ==========================================================================
   cabecalho.js — o que cada tela põe no cabeçalho.

   O cabeçalho é um só para o site inteiro (index.html): a marca, o idioma e
   o tema. Algumas telas acrescentam coisas nele — a missão mostra onde a
   pessoa está ("Módulo 0 · Missão 2 de 3") e o link "Sair". O roteador
   limpa tudo a cada troca de tela.
   ========================================================================== */

const contexto = document.querySelector('.cabecalho-contexto');
const sair = document.querySelector('.cabecalho-sair');

/**
 * O texto discreto ao lado da marca (ou nada).
 * @param {string|null} texto
 */
export function definirContexto(texto) {
  contexto.textContent = texto ?? '';
  contexto.hidden = !texto;
}

/**
 * O link "Sair", à direita.
 * @param {string|null} destino  o endereço para onde ele leva (null esconde)
 */
export function definirSair(destino) {
  sair.hidden = !destino;
  if (destino) sair.setAttribute('href', destino);
}

/** Volta o cabeçalho ao normal (chamado pelo roteador a cada tela nova). */
export function limparCabecalho() {
  definirContexto(null);
  definirSair(null);
}
