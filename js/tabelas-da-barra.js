/* ==========================================================================
   tabelas-da-barra.js — as tabelas de uma tarefa, na barra da Consulta.

   (Ajustes de design, rodada 2.)

   "tabela paises" ou "tabelas equipe · regioes": o rótulo discreto e os
   nomes em mono, com um sublinhado pontilhado — o único sinal de que dá para
   abrir. Nada pisca nem pulsa.

   Ao passar o mouse, focar pelo teclado ou tocar num nome, abre um painel
   flutuante com as colunas da tabela e o link "ver 5 linhas" (quem usa a
   barra decide onde a prévia aparece). Esc fecha. Com 4 tabelas ou mais,
   aparecem as duas primeiras e "+2", que lista o resto.

   O painel mora no <body>, com posição fixa: dentro da bancada ele seria
   cortado (a bancada esconde o que passa da borda, e o vidro do tema claro
   vira a referência de posição de quem estiver dentro dele).
   ========================================================================== */

import { t, idioma } from './i18n.js';
import { nomeNoIdioma } from './traducao-sql.js';
import { escapar } from './realce.js';
import { dicionario } from '../dados/base/dicionario.js';

/** A partir de quantas tabelas o resto vira "+N". */
const MAXIMO_VISIVEL = 3;

let contador = 0;

/**
 * Monta a lista de tabelas dentro de um elemento da barra.
 * @param {HTMLElement} alvo
 * @param {{tabelas: string[], aoVerLinhas: (tabelaEn: string) => void}} opcoes
 *   tabelas em inglês (como estão nas missões)
 * @returns {{destruir: () => void}}
 */
export function criarTabelasDaBarra(alvo, { tabelas, aoVerLinhas }) {
  contador += 1;
  const idPainel = `tabelas-flutuante-${contador}`;

  const painel = document.createElement('div');
  painel.className = 'flutuante tabelas-flutuante';
  painel.id = idPainel;
  painel.hidden = true;
  document.body.append(painel);

  let aberto = null;          // o nome (ou o "+N") que abriu o painel
  let fechamento = 0;         // o fechamento adiado, ao tirar o mouse

  /* ------------------------------------------------------------------------
     Desenho
     ------------------------------------------------------------------------ */

  function desenhar() {
    const visiveis = tabelas.length > MAXIMO_VISIVEL ? tabelas.slice(0, 2) : tabelas;
    const resto = tabelas.slice(visiveis.length);
    const nome = (tabela) => nomeNoIdioma(tabela, idioma());

    alvo.className = 'tabelas-da-barra';
    alvo.innerHTML = `
      <span class="tabelas-da-barra-rotulo">${escapar(t(tabelas.length === 1 ? 'missao.tabela' : 'missao.tabelas'))}</span>
      ${visiveis
        .map((tabela) => `<span class="nome-tabela" tabindex="0" role="button" aria-haspopup="dialog"
          aria-expanded="false" aria-controls="${idPainel}" data-tabelas="${tabela}">${escapar(nome(tabela))}</span>`)
        .join('<span class="tabelas-da-barra-ponto" aria-hidden="true">·</span>')}
      ${resto.length
        ? `<span class="tabelas-da-barra-ponto" aria-hidden="true">·</span><span class="nome-tabela" tabindex="0" role="button"
            aria-haspopup="dialog" aria-expanded="false" aria-controls="${idPainel}" data-tabelas="${resto.join(' ')}"
            aria-label="${escapar(resto.map(nome).join(', '))}">+${resto.length}</span>`
        : ''}`;
  }

  function conteudo(lista) {
    return lista
      .map((tabela) => {
        const colunas = Object.entries(dicionario[tabela]?.colunas ?? {})
          .map(([colunaEn, coluna]) => (idioma() === 'pt' ? coluna.pt : colunaEn));
        const titulo = lista.length > 1 ? `<p class="tabelas-flutuante-nome">${escapar(nomeNoIdioma(tabela, idioma()))}</p>` : '';
        return `
          <div class="tabelas-flutuante-tabela">
            ${titulo}
            <p class="tabelas-flutuante-rotulo">${escapar(t('missao.colunas'))}</p>
            <p class="tabelas-flutuante-colunas">${colunas
              // O " · " fica grudado no nome de antes: a linha nunca começa com ele.
              .map((coluna, i) => `<span>${escapar(coluna)}${i < colunas.length - 1 ? ' ·' : ''}</span>`)
              .join(' ')}</p>
            <button type="button" class="botao-link tabelas-flutuante-ver" data-tabela="${tabela}">${escapar(t('missao.verLinhas'))}</button>
          </div>`;
      })
      .join('');
  }

  /* ------------------------------------------------------------------------
     Abrir e fechar
     ------------------------------------------------------------------------ */

  function abrir(ancora) {
    clearTimeout(fechamento);
    if (aberto === ancora) return;
    fecharAgora();
    aberto = ancora;
    ancora.setAttribute('aria-expanded', 'true');
    painel.innerHTML = conteudo(ancora.dataset.tabelas.split(' '));
    painel.setAttribute('aria-label', ancora.getAttribute('aria-label') ?? ancora.textContent);
    painel.hidden = false;
    posicionar();
  }

  function posicionar() {
    if (!aberto) return;
    const caixa = aberto.getBoundingClientRect();
    const largura = painel.offsetWidth;
    const esquerda = Math.max(8, Math.min(caixa.left, window.innerWidth - largura - 8));
    painel.style.left = `${esquerda}px`;
    painel.style.top = `${caixa.bottom + 6}px`;
  }

  function fecharAgora() {
    clearTimeout(fechamento);
    if (!aberto) return;
    aberto.setAttribute('aria-expanded', 'false');
    aberto = null;
    painel.hidden = true;
  }

  function fecharDepois() {
    clearTimeout(fechamento);
    fechamento = setTimeout(fecharAgora, 180);
  }

  /* ------------------------------------------------------------------------
     Eventos
     ------------------------------------------------------------------------ */

  const ancoraDe = (evento) => evento.target.closest?.('.nome-tabela');

  alvo.addEventListener('mouseover', (evento) => {
    const ancora = ancoraDe(evento);
    if (ancora) abrir(ancora);
  });
  alvo.addEventListener('mouseout', (evento) => {
    if (ancoraDe(evento) && !painel.contains(evento.relatedTarget)) fecharDepois();
  });
  painel.addEventListener('mouseenter', () => clearTimeout(fechamento));
  painel.addEventListener('mouseleave', (evento) => {
    if (!aberto?.contains(evento.relatedTarget)) fecharDepois();
  });

  // Foco pelo teclado (e o toque, que também foca).
  alvo.addEventListener('focusin', (evento) => {
    const ancora = ancoraDe(evento);
    if (ancora) abrir(ancora);
  });
  alvo.addEventListener('click', (evento) => {
    const ancora = ancoraDe(evento);
    if (ancora) abrir(ancora);
  });
  function aoPerderFoco(evento) {
    const para = evento.relatedTarget;
    if (para && (painel.contains(para) || para === aberto)) return;
    if (para?.closest?.('.nome-tabela') && alvo.contains(para)) return;
    fecharAgora();
  }
  alvo.addEventListener('focusout', aoPerderFoco);
  painel.addEventListener('focusout', aoPerderFoco);

  alvo.addEventListener('keydown', (evento) => {
    const ancora = ancoraDe(evento);
    if (!ancora) return;
    if (evento.key === 'Enter' || evento.key === ' ') {
      evento.preventDefault();
      abrir(ancora);
      painel.querySelector('button')?.focus();
    }
    // Tab com o painel aberto entra nele (ele mora longe, no fim da página).
    if (evento.key === 'Tab' && !evento.shiftKey && aberto === ancora) {
      evento.preventDefault();
      painel.querySelector('button')?.focus();
    }
  });
  painel.addEventListener('keydown', (evento) => {
    if (evento.key !== 'Tab') return;
    const botoes = [...painel.querySelectorAll('button')];
    const i = botoes.indexOf(document.activeElement);
    const ancora = aberto;
    if (evento.shiftKey && i === 0) {
      evento.preventDefault();
      ancora?.focus();
    } else if (!evento.shiftKey && i === botoes.length - 1) {
      // Saindo do painel: volta para a barra, no que vem depois do nome.
      evento.preventDefault();
      fecharAgora();
      const focaveis = [...alvo.closest('.painel-barra').querySelectorAll('[tabindex="0"], button')];
      (focaveis[focaveis.indexOf(ancora) + 1] ?? ancora)?.focus();
    }
  });

  painel.addEventListener('click', (evento) => {
    const botao = evento.target.closest('.tabelas-flutuante-ver');
    if (!botao) return;
    const ancora = aberto;
    fecharAgora();
    ancora?.focus({ preventScroll: true });
    aoVerLinhas(botao.dataset.tabela);
  });

  function aoTeclar(evento) {
    if (evento.key === 'Escape' && aberto) {
      const ancora = aberto;
      fecharAgora();
      ancora.focus();
    }
  }
  function aoTocarFora(evento) {
    if (aberto && !painel.contains(evento.target) && !alvo.contains(evento.target)) fecharAgora();
  }
  document.addEventListener('keydown', aoTeclar);
  document.addEventListener('pointerdown', aoTocarFora);
  window.addEventListener('resize', fecharAgora);
  window.addEventListener('scroll', posicionar, true);

  function aoMudarIdioma() {
    fecharAgora();
    desenhar();
  }
  document.addEventListener('idioma-mudou', aoMudarIdioma);

  desenhar();

  return {
    destruir() {
      fecharAgora();
      painel.remove();
      document.removeEventListener('keydown', aoTeclar);
      document.removeEventListener('pointerdown', aoTocarFora);
      document.removeEventListener('idioma-mudou', aoMudarIdioma);
      window.removeEventListener('resize', fecharAgora);
      window.removeEventListener('scroll', posicionar, true);
    },
  };
}
