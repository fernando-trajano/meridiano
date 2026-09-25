/* ==========================================================================
   ilustracoes.js — os desenhos de traço do site, em SVG.

   Regras de todos eles:
     - só traço, em currentColor: acompanham o tema sozinhos, sem cor própria
       (a única exceção é o meridiano da marca, no globo: a cor de destaque,
       pelo CSS);
     - sem bandeiras e sem mapas com fronteiras;
     - decorativos: aria-hidden, porque o texto ao lado já diz tudo.

   Por enquanto, só o globo — UM componente, o mesmo na entrada e na tela
   "Abrindo o observatório..." (só a entrada liga a linha do meridiano da
   marca). Os outros —
   mapa em pontos, fachada do instituto, pino, avião, documento, gráfico de
   linha — chegam com as telas que os usam.
   ========================================================================== */

let contadorDeGlobos = 0;

/** Quantos meridianos o globo tem, e o raio dele (no viewBox de 200×200). */
const MERIDIANOS = 4;
const RAIO = 80;

/** A largura (rx) de cada meridiano num ângulo de giro θ. */
function larguras(theta) {
  return Array.from({ length: MERIDIANOS }, (_, i) => RAIO * Math.abs(Math.cos(theta + (i * Math.PI) / MERIDIANOS)));
}

/** O ângulo em que o globo fica parado (sem animação): nenhum meridiano some. */
const THETA_PARADO = 0.3;

/**
 * O globo com meridianos.
 *
 * Os meridianos são elipses SEMPRE centradas no meio do globo: o giro vem
 * de estreitar e alargar cada uma (a largura rx = 80 × |cos(θ + defasagem)|),
 * nunca de mover a elipse. Tudo o que está dentro é recortado pelo próprio
 * círculo, então nada escapa do contorno. Para girar, ver animarGlobo().
 *
 * Com linhaMeridiano, por cima, parada enquanto os outros giram, a linha
 * vertical na cor de destaque: o meridiano da marca, cruzando o globo de
 * cima a baixo. Só a entrada a liga; a tela de carregamento, não.
 * @param {{classe?: string, linhaMeridiano?: boolean}} [opcoes]
 * @returns {string} o SVG, como texto
 */
export function globo({ classe = '', linhaMeridiano = false } = {}) {
  contadorDeGlobos += 1;
  const recorte = `globo-recorte-${contadorDeGlobos}`;
  const meridianos = larguras(THETA_PARADO)
    .map((rx) => `<ellipse class="globo-meridiano" cx="100" cy="100" rx="${rx.toFixed(2)}" ry="${RAIO}"/>`)
    .join('');

  return `
    <svg class="globo ${classe}" viewBox="0 0 200 200" aria-hidden="true"
         fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round">
      <defs><clipPath id="${recorte}"><circle cx="100" cy="100" r="${RAIO}"/></clipPath></defs>
      <g clip-path="url(#${recorte})">
        <path d="M20 100h160" opacity="0.7"/>
        <path d="M20 60h160M20 140h160" opacity="0.35"/>
        <g opacity="0.8">${meridianos}</g>
      </g>
      <circle cx="100" cy="100" r="${RAIO}"/>
      ${linhaMeridiano ? '<path class="globo-meridiano-marca" d="M100 8V192"/>' : ''}
    </svg>`;
}

/**
 * Faz o globo girar devagar (meia volta a cada 8 segundos), por
 * requestAnimationFrame. Com prefers-reduced-motion, ele fica parado.
 * @param {SVGElement} svg  um globo feito por globo()
 * @returns {() => void} para parar
 */
export function animarGlobo(svg) {
  if (!svg || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return () => {};
  const elipses = [...svg.querySelectorAll('.globo-meridiano')];
  const inicio = performance.now();
  let pedido = 0;

  function quadro(agora) {
    const theta = THETA_PARADO + ((agora - inicio) / 8000) * Math.PI;
    larguras(theta).forEach((rx, i) => elipses[i].setAttribute('rx', rx.toFixed(2)));
    pedido = requestAnimationFrame(quadro);
  }
  pedido = requestAnimationFrame(quadro);
  return () => cancelAnimationFrame(pedido);
}
