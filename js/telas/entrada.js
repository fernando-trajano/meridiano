/* ==========================================================================
   telas/entrada.js — a primeira tela de quem nunca esteve aqui.

   Duas colunas em tela larga: à esquerda, quem você é no Observatório, três
   fatos curtos e dois caminhos — começar pela primeira missão ou, para quem
   já sabe um pouco, fazer o nivelamento; à direita, o globo girando devagar
   (o mesmo da tela "Abrindo o observatório..."). Em tela estreita, o globo
   vem em cima. Não carrega o motor SQL: é leve de propósito.

   Quem já concluiu uma missão ou o nivelamento não passa mais por aqui: o
   endereço "#/" leva direto à trilha (ver app.js). A entrada continua em
   "#/entrada".
   ========================================================================== */

import { t } from '../i18n.js';
import { escapar } from '../realce.js';
import { globo, animarGlobo } from '../ilustracoes.js';
import { TOTAL_DE_MISSOES, modulos } from '../../dados/missoes/indice.js';

/**
 * @param {HTMLElement} tela
 * @returns {() => void}
 */
export function mostrarEntrada(tela) {
  let pararGlobo = () => {};

  function desenhar() {
    pararGlobo();
    const escritas = modulos.filter((m) => m.arquivo).reduce((soma, m) => soma + m.total, 0);
    tela.innerHTML = `
      <section class="entrada">
        <div class="entrada-texto-coluna">
          <p class="entrada-instituto">${escapar(t('geral.instituto'))}</p>
          <h1 class="entrada-titulo">${escapar(t('entrada.titulo'))}</h1>
          <p class="entrada-texto">${escapar(t('vitrine.texto'))}</p>
          <ul class="entrada-fatos">
            <li>${escapar(t('entrada.fatoMissoes', { escritas, total: TOTAL_DE_MISSOES }))}</li>
            <li>${escapar(t('entrada.fatoNavegador'))}</li>
            <li>${escapar(t('entrada.fatoDados'))}</li>
          </ul>
          <div class="entrada-caminhos">
            <a class="botao botao--principal" href="#/missao/m0-01">${escapar(t('entrada.comecar'))}</a>
            <a class="botao" href="#/nivelamento">${escapar(t('entrada.jaSei'))}</a>
          </div>
          <p class="entrada-trilha"><a class="botao-link" href="#/trilha">${escapar(t('entrada.verTrilha'))}</a></p>
        </div>
        ${globo({ classe: 'entrada-globo', linhaMeridiano: true })}
      </section>`;
    pararGlobo = animarGlobo(tela.querySelector('.globo'));
    document.title = t('documento.titulo');
  }

  desenhar();
  document.addEventListener('idioma-mudou', desenhar);

  return () => {
    pararGlobo();
    document.removeEventListener('idioma-mudou', desenhar);
  };
}
