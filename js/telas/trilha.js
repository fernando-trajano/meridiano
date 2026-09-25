/* ==========================================================================
   telas/trilha.js — a trilha: os 10 módulos, em acordeão.

   (O VISUAL chegou no redesenho depois do passo 12, no lugar da lista
   provisória. O desbloqueio — o desafio final libera o módulo seguinte — e
   o resto da lógica são o passo 14.)

   À esquerda:
     - o título, uma linha discreta e o botão Continuar, com o nome da
       próxima missão e o módulo ao lado;
     - a LINHA DO MERIDIANO, vertical, com um traço por módulo, preenchida
       no destaque até o módulo de agora;
     - os módulos, um embaixo do outro: número (mono, discreto), nome e, à
       direita, "3 de 3" (no destaque, quando completo), "2 de 8", "9
       missões" ou "em breve". O módulo de agora abre sozinho; os outros
       ficam fechados; os "em breve" ficam apagados e não abrem.
     - dentro de um módulo, as missões: um ponto (cheio = feita, anel = a de
       agora, contorno = a fazer), o número (01, 02…) e o título.
   Nunca aparece um id interno (m0-01): só números e títulos.

   À direita, o painel: sequência (dias), missões (x de 77, com uma barra
   fina) e os conceitos que mais escapam.

   O progresso vem do progresso.js (passo 13): missões feitas, módulos
   liberados, sequência de dias e conceitos que escaparam. A tela se
   redesenha quando ele muda.

   Bloqueio (passo 14): um módulo só abre as missões depois que o desafio
   final do anterior foi concluído (ou o nivelamento o liberou, no passo 15).
   Bloqueado, ele mostra "9 missões", apagado; aberto, lista as missões sem
   link e diz o que falta. O Continuar só aponta para missões liberadas.
   ========================================================================== */

import { t, emIdioma } from '../i18n.js';
import { missaoFeita, moduloLiberado, sequenciaAtual, conceitosQueMaisEscapam, aoMudarProgresso, escolherProxima } from '../progresso.js';
import { escapar, textoComSelos } from '../realce.js';
import { modulos, carregarModulo, TOTAL_DE_MISSOES } from '../../dados/missoes/indice.js';

/**
 * @param {HTMLElement} tela
 * @returns {Promise<() => void>} a limpeza
 */
export async function mostrarTrilha(tela) {
  // As missões escritas de cada módulo (os não escritos vêm vazios).
  const conteudo = [];
  for (const modulo of modulos) conteudo.push({ modulo, missoes: await carregarModulo(modulo.id) });

  const abertos = new Set();   // os módulos que a pessoa abriu ou fechou
  let primeiraVez = true;
  let observador = null;

  function desenhar() {
    const feita = (missao) => missaoFeita(missao.id);

    // Por onde seguir: a primeira missão não feita do módulo liberado mais
    // adiantado (progresso.js) — quem fez o nivelamento segue de onde ele abriu.
    const proxima = escolherProxima(conteudo);
    const moduloAtual = proxima?.modulo ?? [...conteudo].reverse().find((item) => item.missoes.length)?.modulo;
    const indiceAtual = modulos.indexOf(moduloAtual);
    if (primeiraVez && moduloAtual) abertos.add(moduloAtual.id);
    primeiraVez = false;

    const totalFeitas = conteudo.reduce((soma, item) => soma + item.missoes.filter(feita).length, 0);

    // --- O botão Continuar ---------------------------------------------------
    const continuar = proxima
      ? `<div class="trilha-continuar">
          <a class="botao botao--principal trilha-botao" href="#/missao/${proxima.missao.id}">${escapar(t(totalFeitas ? 'trilha.continuar' : 'trilha.comecar'))}</a>
          <span class="trilha-proxima">${escapar(emIdioma(proxima.missao.titulo))} <span class="trilha-proxima-modulo">· ${escapar(t('trilha.modulo', { n: proxima.modulo.numero }))}</span></span>
        </div>`
      : `<p class="trilha-subtitulo">${escapar(t('trilha.tudoFeito'))}</p>`;

    // --- Os módulos -----------------------------------------------------------
    const itens = conteudo
      .map(({ modulo, missoes }, i) => {
        const emBreve = missoes.length === 0;
        const bloqueado = !emBreve && !moduloLiberado(modulo.id);
        const quantasFeitas = missoes.filter(feita).length;
        const completo = !emBreve && quantasFeitas === modulo.total;
        let situacao;
        if (emBreve) situacao = t('trilha.emBreve');
        else if (bloqueado) situacao = t('trilha.missoesN', { n: modulo.total });
        else if (i <= indiceAtual || quantasFeitas > 0) situacao = t('trilha.feitas', { n: quantasFeitas, total: modulo.total });
        else situacao = t('trilha.missoesN', { n: modulo.total });

        const aberto = !emBreve && abertos.has(modulo.id);
        const idLista = `trilha-${modulo.id}`;

        // Um módulo bloqueado abre só para mostrar o que vem: as missões
        // apagadas, sem link, e o que falta para liberar.
        const aviso = bloqueado
          ? `<li class="trilha-aviso">${escapar(t('trilha.libera', { n: modulos[i - 1]?.numero ?? 0 }))}</li>` : '';
        const lista = aviso + missoes
          .map((missao, j) => {
            if (bloqueado) {
              return `
              <li><span class="trilha-missao trilha-missao--bloqueada">
                <span class="trilha-ponto" aria-hidden="true"></span>
                <span class="trilha-missao-texto">
                  <span class="trilha-numero">${String(j + 1).padStart(2, '0')}</span>${escapar(emIdioma(missao.titulo))}
                </span>
              </span></li>`;
            }
            const tipo = feita(missao) ? 'feita' : proxima?.missao === missao ? 'atual' : 'a-fazer';
            const rotulo = { feita: 'trilha.feita', atual: 'trilha.atual', 'a-fazer': 'trilha.aFazer' }[tipo];
            return `
              <li><a class="trilha-missao trilha-missao--${tipo}" href="#/missao/${missao.id}">
                <span class="trilha-ponto" aria-hidden="true"></span>
                <span class="trilha-missao-texto">
                  <span class="trilha-numero">${String(j + 1).padStart(2, '0')}</span>${escapar(emIdioma(missao.titulo))}
                  <span class="apenas-leitor-de-tela">(${escapar(t(rotulo))})</span>
                </span>
              </a></li>`;
          })
          .join('');

        return `
          <li class="trilha-modulo ${aberto ? 'trilha-modulo--aberto' : ''} ${emBreve ? 'trilha-modulo--breve' : ''} ${bloqueado ? 'trilha-modulo--bloqueado' : ''}" data-modulo="${modulo.id}">
            <button type="button" class="trilha-modulo-cabeca" ${emBreve ? 'disabled' : `aria-expanded="${aberto}" aria-controls="${idLista}"`}>
              <span class="trilha-modulo-numero">${modulo.numero}</span>
              <span class="trilha-modulo-nome">${escapar(emIdioma(modulo.titulo))}</span>
              <span class="trilha-modulo-situacao ${completo ? 'trilha-modulo-situacao--completo' : ''}">${escapar(situacao)}${bloqueado ? `<span class="apenas-leitor-de-tela"> (${escapar(t('trilha.bloqueado'))})</span>` : ''}</span>
            </button>
            ${emBreve ? '' : `<ol class="trilha-missoes" id="${idLista}" ${aberto ? '' : 'hidden'}>${lista}</ol>`}
          </li>`;
      })
      .join('');

    // --- O painel -----------------------------------------------------------------
    const sequencia = sequenciaAtual();
    const escapam = conceitosQueMaisEscapam(3).map(nomeDoConceito);
    const porcentagem = TOTAL_DE_MISSOES ? (totalFeitas / TOTAL_DE_MISSOES) * 100 : 0;

    tela.innerHTML = `
      <div class="trilha">
        <div class="trilha-principal">
          <h1 class="trilha-titulo">${escapar(t('trilha.titulo'))}</h1>
          <p class="trilha-subtitulo">${textoComSelos(t('trilha.subtitulo'))}</p>
          ${continuar}
          <div class="trilha-lista">
            <div class="trilha-meridiano" aria-hidden="true">
              <span class="trilha-meridiano-cheio"></span>
            </div>
            <ol class="trilha-modulos" aria-label="${escapar(t('trilha.modulos'))}">${itens}</ol>
          </div>
        </div>
        <aside class="trilha-painel">
          <p class="trilha-painel-rotulo">${escapar(t('trilha.sequencia'))}</p>
          <p class="trilha-painel-valor">${escapar(sequencia === 1 ? t('trilha.umDia') : t('trilha.dias', { n: sequencia }))}</p>
          <p class="trilha-painel-rotulo">${escapar(t('trilha.missoes'))}</p>
          <p class="trilha-painel-valor trilha-painel-valor--curto">${totalFeitas} <span class="trilha-painel-de">${escapar(t('trilha.deTotal', { total: TOTAL_DE_MISSOES }))}</span></p>
          <div class="trilha-barra" role="progressbar" aria-valuemin="0" aria-valuemax="${TOTAL_DE_MISSOES}" aria-valuenow="${totalFeitas}"
            aria-label="${escapar(t('trilha.missoes'))}"><span style="width: ${porcentagem}%"></span></div>
          <p class="trilha-painel-rotulo">${escapar(t('trilha.conceitosEscapam'))}</p>
          ${escapam.length
            ? `<ul class="trilha-conceitos">${escapam.map((c) => `<li>${escapar(c)}</li>`).join('')}</ul>`
            : `<p class="trilha-painel-vazio">${escapar(t('trilha.semConceitos'))}</p>`}
        </aside>
      </div>`;

    tela.querySelectorAll('.trilha-modulo-cabeca:not(:disabled)').forEach((botao) => {
      botao.addEventListener('click', () => {
        const item = botao.closest('.trilha-modulo');
        const id = item.dataset.modulo;
        const abrir = !abertos.has(id);
        if (abrir) abertos.add(id);
        else abertos.delete(id);
        item.classList.toggle('trilha-modulo--aberto', abrir);
        botao.setAttribute('aria-expanded', String(abrir));
        item.querySelector('.trilha-missoes').hidden = !abrir;
        desenharMeridiano(indiceAtual);
      });
    });

    desenharMeridiano(indiceAtual);
    observador?.disconnect();
    observador = new ResizeObserver(() => desenharMeridiano(indiceAtual));
    observador.observe(tela.querySelector('.trilha-modulos'));
  }

  /**
   * A linha vertical: um traço na altura de cada módulo, e o destaque até o
   * de agora. As alturas mudam quando um módulo abre ou fecha — por isso ela
   * é medida, e não desenhada de antemão.
   */
  function desenharMeridiano(indiceAtual) {
    const linha = tela.querySelector('.trilha-meridiano');
    const lista = tela.querySelector('.trilha-modulos');
    if (!linha || !lista) return;
    linha.querySelectorAll('.trilha-traco').forEach((traco) => traco.remove());

    const topoDaLista = lista.getBoundingClientRect().top;
    let alturaDoCheio = 0;
    lista.querySelectorAll('.trilha-modulo-cabeca').forEach((cabeca, i) => {
      const caixa = cabeca.getBoundingClientRect();
      const meio = caixa.top - topoDaLista + caixa.height / 2;
      const traco = document.createElement('span');
      traco.className = `trilha-traco ${i <= indiceAtual ? 'trilha-traco--cheio' : ''}`;
      traco.style.top = `${meio}px`;
      linha.append(traco);
      if (i === indiceAtual) alturaDoCheio = meio + 6;
    });
    linha.querySelector('.trilha-meridiano-cheio').style.height = `${alturaDoCheio}px`;
  }

  function aoMudarIdioma() {
    document.title = t('documento.titulo');
    desenhar();
  }

  document.addEventListener('idioma-mudou', aoMudarIdioma);
  const pararDeOuvir = aoMudarProgresso(desenhar);
  desenhar();

  return () => {
    document.removeEventListener('idioma-mudou', aoMudarIdioma);
    pararDeOuvir();
    observador?.disconnect();
  };
}

/* Os conceitos cujo nome canônico não se explica sozinho ganham um nome
   na tela ("|| (juntar)"); os outros (DISTINCT, WHERE…) aparecem como são. */
const CONCEITOS_COM_NOME = {
  COLUNAS: 'colunas', CONTAS: 'contas', AS: 'apelidos', COMPARACOES: 'comparacoes',
  '||': 'juntar', '--': 'comentario', '*': 'asterisco', '=': 'igual',
};

function nomeDoConceito(conceito) {
  const chave = CONCEITOS_COM_NOME[conceito];
  return chave ? t(`trilha.conceitos.${chave}`) : conceito;
}
