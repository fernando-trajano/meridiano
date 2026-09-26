/* ==========================================================================
   painel-fixavel.js — um painel flutuante que abre por um botão e pode ser
   fixado (nas Dicas: o "Exibir mais" de "Em outros bancos").

   O VISUAL é o do painel flutuante do site (.flutuante: fundo, borda, raio
   e vidro no claro), com a variante de largura .flutuante--largo. Aqui só o
   comportamento, que o linha-com-painel.js não tem:

     - hover (só onde existe mouse): abre depois de 200ms parado no botão;
       sair do botão ou do painel fecha depois de 300ms, e voltar a qualquer
       um dos dois cancela. Cruzar o canto sem parar não abre nada, e o
       painel não some no caminho do botão até ele;
     - clique (e Enter/Espaço, que num <button> são clique) FIXA o painel:
       fixado, ele não some quando o mouse sai. No toque, o clique abre já
       fixado. Um segundo clique no botão fecha;
     - fecha pelo X, pelo Esc e por clique fora. Ao fechar um painel fixado,
       o foco volta para o botão;
     - nada mais abre: nem o foco sozinho, nem a rolagem. Não é um modal: não
       escurece a página, não trava a rolagem, não prende o foco (o painel
       vem logo depois do botão no HTML, e o Tab entra nele naturalmente).

   Posição: o CSS prende o painel à direita do botão, abrindo embaixo; se
   embaixo não couber e em cima houver mais espaço, ele abre em cima (classe
   .painel-fixavel--acima). Em tela estreita, o CSS o transforma numa folha
   de tela cheia, e aí a posição não importa.
   ========================================================================== */

const ATRASO_PARA_ABRIR = 200;
const ATRASO_PARA_FECHAR = 300;

/**
 * @param {{gatilho: HTMLButtonElement, painel: HTMLElement, botaoFechar: HTMLElement}} partes
 * @returns {() => void} desliga tudo
 */
export function ligarPainelFixavel({ gatilho, painel, botaoFechar }) {
  let estado = 'fechado';     // 'fechado' | 'hover' | 'fixado'
  let paraAbrir = 0;
  let paraFechar = 0;
  const temMouse = window.matchMedia('(hover: hover)');

  function limparAtrasos() {
    clearTimeout(paraAbrir);
    clearTimeout(paraFechar);
  }

  function abrir(como) {
    limparAtrasos();
    const estava = estado;
    estado = como;
    gatilho.setAttribute('aria-expanded', 'true');
    if (estava === 'fechado') {
      painel.hidden = false;
      posicionar();
    }
    // Fixado pelo clique ou pelo teclado: o foco vai para o X, o começo do
    // painel (sem prender: o Tab sai dele normalmente).
    if (como === 'fixado') botaoFechar.focus({ preventScroll: true });
  }

  function fechar() {
    limparAtrasos();
    if (estado === 'fechado') return;
    const estava = estado;
    estado = 'fechado';
    painel.hidden = true;
    painel.classList.remove('painel-fixavel--acima');
    gatilho.setAttribute('aria-expanded', 'false');
    if (estava === 'fixado') gatilho.focus({ preventScroll: true });
  }

  /** Embaixo, a menos que embaixo não caiba e em cima haja mais espaço. */
  function posicionar() {
    painel.classList.remove('painel-fixavel--acima');
    if (getComputedStyle(painel).position === 'fixed') return;   // folha de tela cheia
    const caixa = gatilho.getBoundingClientRect();
    const altura = painel.getBoundingClientRect().height;
    const embaixo = window.innerHeight - caixa.bottom - 8;
    const emCima = caixa.top - 8;
    if (altura > embaixo && emCima > embaixo) painel.classList.add('painel-fixavel--acima');
  }

  /* ------------------------------------------------------------------------
     Eventos
     ------------------------------------------------------------------------ */

  function aoEntrar(evento) {
    if (evento.pointerType !== 'mouse' || !temMouse.matches) return;
    clearTimeout(paraFechar);
    if (estado === 'fechado' && evento.currentTarget === gatilho) {
      clearTimeout(paraAbrir);
      paraAbrir = setTimeout(() => abrir('hover'), ATRASO_PARA_ABRIR);
    }
  }

  function aoSair(evento) {
    if (evento.pointerType !== 'mouse') return;
    clearTimeout(paraAbrir);
    if (estado === 'hover') paraFechar = setTimeout(fechar, ATRASO_PARA_FECHAR);
  }

  function aoClicarNoGatilho() {
    if (estado === 'fixado') fechar();
    else abrir('fixado');
  }

  function aoTocarFora(evento) {
    if (estado === 'fechado') return;
    if (painel.contains(evento.target) || gatilho.contains(evento.target)) return;
    fechar();
  }

  function aoTeclar(evento) {
    if (evento.key === 'Escape' && estado !== 'fechado') {
      // Fechar pelo Esc devolve o foco ao botão, mesmo aberto só pelo hover.
      estado = 'fixado';
      fechar();
    }
  }

  function aoMudarJanela() {
    if (estado !== 'fechado') posicionar();
  }

  gatilho.addEventListener('pointerenter', aoEntrar);
  gatilho.addEventListener('pointerleave', aoSair);
  painel.addEventListener('pointerenter', aoEntrar);
  painel.addEventListener('pointerleave', aoSair);
  gatilho.addEventListener('click', aoClicarNoGatilho);
  botaoFechar.addEventListener('click', () => {
    estado = 'fixado';          // o X sempre devolve o foco ao botão
    fechar();
  });
  document.addEventListener('pointerdown', aoTocarFora);
  document.addEventListener('keydown', aoTeclar);
  window.addEventListener('resize', aoMudarJanela);

  return () => {
    limparAtrasos();
    document.removeEventListener('pointerdown', aoTocarFora);
    document.removeEventListener('keydown', aoTeclar);
    window.removeEventListener('resize', aoMudarJanela);
  };
}
