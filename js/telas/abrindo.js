/* ==========================================================================
   telas/abrindo.js — a tela "Abrindo o observatório...".

   Aparece enquanto o motor SQL carrega — só nas telas que usam SQL (missão,
   laboratório, jogos), e só da primeira vez: depois o motor fica aberto.

   Cobre a área abaixo do cabeçalho, para a marca, o idioma e o tema
   continuarem ao alcance. O globo gira devagar; a linha embaixo dele é o
   progresso de verdade (bytes baixados), na cor de destaque.
   ========================================================================== */

import { t } from '../i18n.js';
import { globo, animarGlobo } from '../ilustracoes.js';

/**
 * Mostra a tela e devolve os controles dela.
 * @param {{aoTentarDeNovo?: () => void}} [opcoes]
 * @returns {{progredir: (fracao: number, etapa: string) => void,
 *            fechar: () => void,
 *            falhar: (erro: Error) => void}}
 */
export function mostrarAbrindo({ aoTentarDeNovo } = {}) {
  const cabecalho = document.querySelector('.cabecalho-faixa');
  const camada = document.createElement('div');
  camada.className = 'abrindo';
  // Se a página estiver rolada e o cabeçalho já tiver saído de vista, a
  // camada começa no topo da janela.
  const fimDoCabecalho = cabecalho ? cabecalho.getBoundingClientRect().bottom : 0;
  camada.style.top = `${Math.max(0, fimDoCabecalho)}px`;
  camada.setAttribute('role', 'status');

  camada.innerHTML = `
    ${globo({ classe: 'abrindo-globo' })}
    <p class="abrindo-titulo" data-i18n="abrindo.titulo">${t('abrindo.titulo')}</p>
    <div class="abrindo-progresso" aria-hidden="true"><span></span></div>
    <p class="abrindo-etapa discreto" data-i18n="abrindo.motor">${t('abrindo.motor')}</p>
  `;
  document.body.append(camada);

  const pararGlobo = animarGlobo(camada.querySelector('.globo'));
  const barra = camada.querySelector('.abrindo-progresso span');
  const etapa = camada.querySelector('.abrindo-etapa');

  return {
    progredir(fracao, nomeDaEtapa) {
      barra.style.width = `${Math.round(fracao * 100)}%`;
      const chave = `abrindo.${nomeDaEtapa}`;
      if (etapa.dataset.i18n !== chave) {
        etapa.dataset.i18n = chave;
        etapa.textContent = t(chave);
      }
    },

    fechar() {
      pararGlobo();
      camada.classList.add('abrindo--saindo');
      camada.addEventListener('transitionend', () => camada.remove(), { once: true });
      // Rede de segurança: sem transição (movimento reduzido), some na hora.
      setTimeout(() => camada.remove(), 400);
    },

    falhar(erro) {
      console.error('[abrindo]', erro);
      pararGlobo();
      camada.classList.add('abrindo--erro');
      camada.innerHTML = `
        ${globo({ classe: 'abrindo-globo' })}
        <p class="abrindo-titulo" data-i18n="abrindo.erroTitulo">${t('abrindo.erroTitulo')}</p>
        <p class="abrindo-etapa" data-i18n="abrindo.erroTexto">${t('abrindo.erroTexto')}</p>
        <button type="button" class="botao" data-i18n="abrindo.tentarDeNovo">${t('abrindo.tentarDeNovo')}</button>
      `;
      camada.querySelector('button').addEventListener('click', () => {
        camada.remove();
        aoTentarDeNovo?.();
      });
    },
  };
}
