/* ==========================================================================
   ilustracoes.js — os desenhos de traço do site, em SVG.

   Regras de todos eles:
     - só traço, em currentColor: acompanham o tema sozinhos, sem cor própria
       (a única exceção é o meridiano da marca, no globo: a cor de destaque,
       pelo CSS);
     - sem bandeiras e sem mapas com fronteiras;
     - decorativos: aria-hidden, porque o texto ao lado já diz tudo.

   O globo — UM componente, o mesmo na entrada e na tela "Abrindo o
   observatório..." (só a entrada liga a linha do meridiano da marca) — e,
   desde o passo 16, os desenhos dos atalhos do início (ilustracao()): a
   fachada do instituto, o pino na rota, o avião de papel, o gráfico de
   linha, o documento e a grade de pontos.
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

/* --------------------------------------------------------------------------
   Os desenhos dos atalhos do início (passo 16)

   Todos no mesmo quadro de 320×240, com o mesmo traço fino, para trocarem
   de um para o outro sem pular (cross-fade: ficam empilhados, e só a
   opacidade muda — ver telas.css).
   -------------------------------------------------------------------------- */

const DESENHOS = {
  // O instituto: escadaria, colunas, frontão com um óculo. O desenho de quando
  // nenhum atalho está em foco.
  fachada: `
    <path d="M52 204h216M64 196h192M76 188h168"/>
    <path d="M88 188v-78M120 188v-78M200 188v-78M232 188v-78"/>
    <path d="M148 188v-44a12 12 0 0 1 24 0v44"/>
    <path d="M78 110h164M74 102h172"/>
    <path d="M66 102 160 58l94 44"/>
    <circle cx="160" cy="84" r="7"/>`,

  // A trilha: uma rota pontilhada que termina num pino.
  trilha: `
    <path d="M44 200c42-8 40-58 86-62s44 42 88 28 30-58 40-86" stroke-dasharray="3 7"/>
    <circle cx="44" cy="200" r="4"/>
    <circle cx="130" cy="138" r="3"/>
    <circle cx="218" cy="166" r="3"/>
    <path d="M258 96c-12-15-18-25-18-34a18 18 0 0 1 36 0c0 9-6 19-18 34Z"/>
    <circle cx="258" cy="62" r="6"/>`,

  // O nivelamento: um avião de papel, pulando etapas.
  nivelamento: `
    <path d="M60 120 262 52l-62 132-46-44Z"/>
    <path d="M154 140 262 52M154 140l-8 44 30-26"/>
    <path d="M40 176c20-4 36-14 46-30" stroke-dasharray="3 7"/>`,

  // O laboratório: um gráfico de linha, com os eixos e os pontos.
  laboratorio: `
    <path d="M56 36v164h216"/>
    <path d="M56 160h216M56 120h216M56 80h216" opacity="0.35"/>
    <path d="M70 176l40-34 40 10 40-48 40 8 34-54"/>
    <circle cx="70" cy="176" r="3.5"/><circle cx="110" cy="142" r="3.5"/>
    <circle cx="150" cy="152" r="3.5"/><circle cx="190" cy="104" r="3.5"/>
    <circle cx="230" cy="112" r="3.5"/><circle cx="264" cy="58" r="3.5"/>`,

  // A cola: uma folha com o canto dobrado e as linhas de texto.
  cola: `
    <path d="M96 28h104l32 32v152H96Z"/>
    <path d="M200 28v32h32"/>
    <path d="M116 84h72M116 104h92M116 124h60M116 144h84M116 164h48M116 184h72"/>`,

  // Os jogos: uma grade de pontos, alguns acesos e ligados — como peças.
  jogos: (() => {
    let pontos = '';
    for (let linha = 0; linha < 5; linha += 1) {
      for (let coluna = 0; coluna < 8; coluna += 1) {
        pontos += `<circle cx="${62 + coluna * 28}" cy="${64 + linha * 28}" r="1.8"/>`;
      }
    }
    return `${pontos}
      <path d="M90 92l28 28 56 0 28 -28 28 28"/>
      <circle cx="90" cy="92" r="6" fill="currentColor"/><circle cx="118" cy="120" r="6" fill="currentColor"/>
      <circle cx="174" cy="120" r="6" fill="currentColor"/><circle cx="202" cy="92" r="6" fill="currentColor"/>
      <circle cx="230" cy="120" r="6" fill="currentColor"/>`;
  })(),
};

/**
 * Um desenho dos atalhos.
 * @param {keyof DESENHOS} nome
 * @param {{classe?: string}} [opcoes]
 * @returns {string} o SVG, como texto
 */
export function ilustracao(nome, { classe = '' } = {}) {
  return `
    <svg class="ilustracao ${classe}" data-ilustracao="${nome}" viewBox="0 0 320 240" aria-hidden="true"
         fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">
      ${DESENHOS[nome] ?? ''}
    </svg>`;
}
