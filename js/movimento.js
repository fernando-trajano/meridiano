/* ==========================================================================
   movimento.js — o pouco movimento do site, sempre respeitando quem pediu
   menos (prefers-reduced-motion).

   - números que contam (na entrega: missões feitas, sequência de dias);
   - o ponto da marca, que pulsa UMA vez ao concluir uma missão.
   (O globo da tela de carregamento é do ilustracoes.js; o Passo a passo
   cuida das próprias transições.)
   ========================================================================== */

/** true se a pessoa pediu menos movimento no sistema. */
export function semMovimento() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Faz um número contar de um valor até outro.
 * Com movimento reduzido, o número final aparece de uma vez.
 * @param {HTMLElement} elemento
 * @param {number} de
 * @param {number} ate
 * @param {{duracao?: number, atraso?: number}} [opcoes]
 */
export function contarAte(elemento, de, ate, { duracao = 900, atraso = 0 } = {}) {
  if (semMovimento() || de === ate) {
    elemento.textContent = String(ate);
    return;
  }
  elemento.textContent = String(de);
  const inicio = performance.now() + atraso;

  function quadro(agora) {
    const t = Math.min(1, Math.max(0, (agora - inicio) / duracao));
    // Desacelera no fim, como quem acaba de contar.
    const suave = 1 - (1 - t) ** 3;
    elemento.textContent = String(Math.round(de + (ate - de) * suave));
    if (t < 1) requestAnimationFrame(quadro);
  }
  requestAnimationFrame(quadro);
}

/** O ponto da marca pulsa uma vez (ao concluir uma missão). */
export function pulsarPontoDaMarca() {
  const ponto = document.querySelector('.marca-ponto');
  if (!ponto || semMovimento()) return;
  ponto.classList.remove('marca-ponto--pulsa');
  // Ler a largura força o navegador a "esquecer" a animação anterior.
  void ponto.offsetWidth;
  ponto.classList.add('marca-ponto--pulsa');
  ponto.addEventListener('animationend', () => ponto.classList.remove('marca-ponto--pulsa'), { once: true });
}
