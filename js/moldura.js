/* ==========================================================================
   moldura.js — a moldura de duas colunas das telas com o painel de
   progresso (início e trilha, e as que vierem). Igual à do digita.

     centro     o título, o topo e o conteúdo da tela
     direita    o painel "Seu progresso" (painel-progresso.js)

   Todas usam ESTA moldura, e nenhuma define a própria grade: assim, ao ir
   de uma para a outra, o título, a coluna do meio e o painel ficam
   exatamente no mesmo lugar — nada "pula". O título é sempre o primeiro
   elemento do centro, com a mesma classe.

   Em tela estreita vira uma coluna só, nesta ordem: o título e o topo, o
   painel, o resto do conteúdo (ver .moldura em componentes.css).
   ========================================================================== */

import { escapar } from './realce.js';
import { painelDeProgresso } from './painel-progresso.js';

/**
 * A página inteira de uma tela com moldura.
 * @param {{titulo: string, topo?: string, conteudo?: string, classe?: string}} opcoes
 *   titulo: texto puro (vira o <h1>); topo e conteudo: HTML;
 *   classe: uma classe a mais no contêiner, para o CSS próprio da tela
 * @returns {string}
 */
export function montarMoldura({ titulo, topo = '', conteudo = '', classe = '' }) {
  return `
    <div class="moldura ${classe}">
      <div class="moldura-centro">
        <div class="moldura-topo">
          <h1 class="moldura-titulo">${escapar(titulo)}</h1>
          ${topo}
        </div>
        <div class="moldura-corpo">${conteudo}</div>
      </div>
      <aside class="moldura-progresso" aria-labelledby="painel-titulo">${painelDeProgresso()}</aside>
    </div>`;
}
