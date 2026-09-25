/* ==========================================================================
   roteador.js — qual tela mostrar, pelo endereço.

   O site é uma página só (index.html); as telas trocam por JavaScript. O
   endereço guarda a tela pelo "#": #/ é o início, #/missao/m1-03 é a
   missão m1-03. Assim o botão Voltar do navegador funciona, e dá para
   mandar o link de uma missão para alguém.

   Cada tela é uma função que desenha dentro do <main> e pode devolver uma
   função de limpeza (parar de ouvir eventos, destruir o editor…), chamada
   quando a tela sai.

   As View Transitions entre telas entram no passo 21.
   ========================================================================== */

import { limparCabecalho } from './cabecalho.js';

const rotas = [];
let limparTelaAtual = null;
let tela = null;

/**
 * Registra uma tela.
 * @param {RegExp} padrao  casa com o caminho depois do "#" (ex.: /^\/missao\/(\w+-\d+)$/)
 * @param {(tela: HTMLElement, ...partes: string[]) => (void|(() => void)|Promise<void|(() => void)>)} mostrar
 */
export function rota(padrao, mostrar) {
  rotas.push({ padrao, mostrar });
}

/** Vai para um caminho (ex.: '/missao/m1-03'). */
export function irPara(caminho) {
  if (location.hash === `#${caminho}`) mostrarAtual();
  else location.hash = caminho;
}

/** Começa a ouvir o endereço e mostra a tela dele. */
export function iniciarRoteador(elemento) {
  tela = elemento;
  window.addEventListener('hashchange', mostrarAtual);
  mostrarAtual();
}

async function mostrarAtual() {
  const caminho = location.hash.replace(/^#/, '') || '/';
  const achada = rotas.find(({ padrao }) => padrao.test(caminho)) ?? rotas.find(({ padrao }) => padrao.test('/'));
  if (!achada) return;

  try {
    limparTelaAtual?.();
  } catch (erro) {
    console.warn('[roteador] Erro ao limpar a tela anterior:', erro);
  }
  limparTelaAtual = null;
  limparCabecalho();
  tela.replaceChildren();
  window.scrollTo(0, 0);

  const partes = caminho.match(achada.padrao)?.slice(1) ?? [];
  const limpeza = await achada.mostrar(tela, ...partes);
  if (typeof limpeza === 'function') limparTelaAtual = limpeza;

  // Quem navega pelo teclado ou com leitor de tela começa pelo título da tela nova.
  const titulo = tela.querySelector('h1');
  if (titulo) {
    titulo.tabIndex = -1;
    titulo.focus({ preventScroll: true });
  }
}
