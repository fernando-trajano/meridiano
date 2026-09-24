/* ==========================================================================
   app.js — ponto de entrada do site.

   Liga o que vale para o site inteiro e sai da frente. Cada tela cuida de
   si. A cada passo do plano ganha mais responsabilidades: idioma (passo 3),
   configuração salva (passo 8), troca de telas e o resto.
   ========================================================================== */

import {
  detectarIdioma,
  definirIdioma,
  ligarSeletorDeIdioma,
  conferirChaves,
} from './i18n.js';

const raiz = document.documentElement;
const botaoTema = document.querySelector('#botao-tema');
const preferenciaEscura = window.matchMedia('(prefers-color-scheme: dark)');

/* --------------------------------------------------------------------------
   Tema

   Por enquanto: começa no tema do sistema, o botão alterna, e uma mudança
   no sistema com o site aberto é seguida. A escolha ainda NÃO é salva — no
   passo 8 entra a regra inteira do digita (a última mudança vale, e o
   sistema é a referência).
   -------------------------------------------------------------------------- */

/**
 * Aplica um tema à página inteira.
 * Basta trocar o atributo data-tema no <html>: o tema.css cuida do resto.
 * @param {'claro'|'escuro'} tema
 */
function aplicarTema(tema) {
  raiz.dataset.tema = tema;

  // O ícone mostra para onde o clique leva: lua = "ir para o escuro".
  const icone = tema === 'escuro' ? '#icone-sol' : '#icone-lua';
  botaoTema.querySelector('use').setAttribute('href', icone);
}

function temaDoSistema() {
  return preferenciaEscura.matches ? 'escuro' : 'claro';
}

botaoTema.addEventListener('click', () => {
  aplicarTema(raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro');
});

preferenciaEscura.addEventListener('change', () => {
  aplicarTema(temaDoSistema());
});

/* --------------------------------------------------------------------------
   Idioma

   Por enquanto: o idioma do navegador ao abrir, e os botões PT/EN do
   cabeçalho. A escolha ainda NÃO é salva — isso é o passo 8.
   -------------------------------------------------------------------------- */

ligarSeletorDeIdioma();

/* --------------------------------------------------------------------------
   Partida
   -------------------------------------------------------------------------- */

// O script do <head> já pôs o tema certo; aqui só acertamos o ícone.
aplicarTema(raiz.dataset.tema || temaDoSistema());

// pt.js e en.js com as mesmas chaves? Se não, avisa no console.
conferirChaves();

definirIdioma(detectarIdioma());
