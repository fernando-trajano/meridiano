/* ==========================================================================
   ilustracoes.js — os desenhos de traço do site, em SVG.

   Regras de todos eles:
     - só traço, em currentColor: acompanham o tema sozinhos, sem cor própria;
     - sem bandeiras e sem mapas com fronteiras;
     - decorativos: aria-hidden, porque o texto ao lado já diz tudo.

   Por enquanto, só o globo (tela "Abrindo o observatório..."). Os outros —
   mapa em pontos, fachada do instituto, pino, avião, documento, gráfico de
   linha — chegam com as telas que os usam.
   ========================================================================== */

/**
 * O globo com meridianos. Com `girando`, os meridianos se estreitam e se
 * alargam em compassos defasados, e o globo parece girar devagar (a
 * animação está no telas.css e respeita prefers-reduced-motion).
 * @param {{girando?: boolean, classe?: string}} [opcoes]
 * @returns {string} o SVG, como texto
 */
export function globo({ girando = false, classe = '' } = {}) {
  // Quatro meridianos, espaçados de 45 graus: cada um começa a animação num
  // ponto diferente do ciclo (atraso negativo), e juntos formam a rotação.
  // Parado (sem animação ou com movimento reduzido), cada um fica numa
  // largura diferente (--parado), para o globo continuar parecendo um globo.
  const larguraParado = [0, 0.45, 0.8, 1];
  const meridianos = larguraParado
    .map(
      (largura, i) =>
        `<ellipse class="globo-meridiano" style="--parado: ${largura}; animation-delay: ${-i * 2}s" cx="60" cy="60" rx="48" ry="48"/>`
    )
    .join('');

  return `
    <svg class="globo ${girando ? 'globo--girando' : ''} ${classe}" viewBox="0 0 120 120" aria-hidden="true"
         fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round">
      <circle cx="60" cy="60" r="48"/>
      <path d="M12 60h96" opacity="0.7"/>
      <path d="M19 36h82M19 84h82" opacity="0.35"/>
      <g opacity="0.8">${meridianos}</g>
    </svg>`;
}
