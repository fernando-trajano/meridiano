/* ==========================================================================
   painel-progresso.js — o painel "Seu progresso", à direita do início e da
   trilha. UM componente só, igual em todas as telas que o mostram:

     SEU PROGRESSO                 ← maiúsculas pequenas, discreto
     2                             ← número grande
     dias seguidos praticando
     ───────
     1 de 77                       ← "de 77" menor e discreto
     missões concluídas
     ▬▬▬───────                    ← a barra fina, no destaque
     ───────
     Conceitos que mais escapam
     [DISTINCT] [|| (juntar)]      ← selos, lado a lado

   Tudo lido do progresso.js. Quem o põe na tela é a moldura (moldura.js),
   a mesma em todas as telas que o mostram.
   ========================================================================== */

import { t } from './i18n.js';
import { escapar, realcarSQL } from './realce.js';
import { totalFeitas, sequenciaAtual, conceitosQueMaisEscapam } from './progresso.js';
import { TOTAL_DE_MISSOES } from '../dados/missoes/indice.js';

/* Os conceitos cujo nome canônico não se explica sozinho ganham um nome
   na tela ("|| (juntar)"); os outros (DISTINCT, WHERE…) aparecem como são. */
const CONCEITOS_COM_NOME = {
  COLUNAS: 'colunas', CONTAS: 'contas', AS: 'apelidos', COMPARACOES: 'comparacoes',
  '||': 'juntar', '--': 'comentario', '*': 'asterisco', '=': 'igual',
};

/** O nome de um conceito na tela. */
export function nomeDoConceito(conceito) {
  const chave = CONCEITOS_COM_NOME[conceito];
  return chave ? t(`trilha.conceitos.${chave}`) : conceito;
}

/**
 * O conteúdo do painel, em HTML (quem o põe na tela é a moldura).
 * @returns {string}
 */
export function painelDeProgresso() {
  const dias = sequenciaAtual();
  const feitas = totalFeitas();
  const porcentagem = TOTAL_DE_MISSOES ? (feitas / TOTAL_DE_MISSOES) * 100 : 0;
  const escapam = conceitosQueMaisEscapam(3);

  // Cada conceito num selo, com a palavra-chave na cor da cláusula.
  const conceitos = escapam.length
    ? `<p class="painel-selos">${escapam.map((c) => `<code class="selo painel-selo">${realcarSQL(nomeDoConceito(c))}</code>`).join('')}</p>`
    : `<p class="painel-vazio">${escapar(t('painelProgresso.semConceitos'))}</p>`;

  return `
    <h2 class="painel-titulo" id="painel-titulo">${escapar(t('painelProgresso.rotulo'))}</h2>
    <div class="painel-bloco">
      <p class="painel-numero">${dias}</p>
      <p class="painel-legenda">${escapar(t(dias === 1 ? 'painelProgresso.diaSeguido' : 'painelProgresso.diasSeguidos'))}</p>
    </div>
    <div class="painel-bloco">
      <p class="painel-numero">${feitas} <span class="painel-de">${escapar(t('painelProgresso.deTotal', { total: TOTAL_DE_MISSOES }))}</span></p>
      <p class="painel-legenda">${escapar(t('painelProgresso.missoesConcluidas'))}</p>
      <div class="barra" role="progressbar" aria-valuemin="0" aria-valuemax="${TOTAL_DE_MISSOES}" aria-valuenow="${feitas}"
        aria-label="${escapar(t('painelProgresso.missoesConcluidas'))}"><span style="width: ${porcentagem}%"></span></div>
    </div>
    <div class="painel-bloco">
      <p class="painel-subtitulo">${escapar(t('painelProgresso.conceitosEscapam'))}</p>
      ${conceitos}
    </div>`;
}
