/* ==========================================================================
   linha-com-painel.js — uma linha que mostra um painel flutuante logo abaixo
   dela (nas Dicas: o exemplo de uma função, o que um indicador mede).

   O alvo é a LINHA INTEIRA, não só o nome. O painel abre:
     - ao passar o mouse em qualquer ponto da linha (só onde existe mouse);
     - pelo teclado: a linha entra na ordem do Tab, e o foco abre o painel;
     - no clique ou toque, que liga e desliga.
   Fecha no Esc, no clique fora e ao abrir outro.

   A marcação é de quem usa (o painel mora dentro da linha, com a classe
   .flutuante, a mesma da lista de colunas da barra da Consulta):

     <div class="linha-com-painel" tabindex="0" aria-describedby="p1">
       …as células da linha…
       <div class="flutuante linha-painel" id="p1" role="tooltip" aria-label="Exemplo">…</div>
     </div>

   Quem mostra e esconde é o CSS (componentes.css); aqui só os estados
   data-aberto (clique, toque) e data-fechado (Esc, até sair da linha).
   ========================================================================== */

const LINHA = '.linha-com-painel';

/**
 * Liga as linhas com painel que estão (ou vierem a estar) dentro de `raiz`.
 * Os ouvintes ficam na raiz: a tela pode redesenhar as linhas à vontade.
 * @param {HTMLElement} raiz
 * @returns {() => void} desliga tudo
 */
export function ligarLinhasComPainel(raiz) {
  const abertas = () => raiz.querySelectorAll(`${LINHA}[data-aberto]`);
  const fecharTodas = (exceto) => abertas().forEach((linha) => linha !== exceto && delete linha.dataset.aberto);

  function alternar(linha) {
    fecharTodas(linha);
    delete linha.dataset.fechado;
    if (linha.dataset.aberto !== undefined) delete linha.dataset.aberto;
    else linha.dataset.aberto = '';
  }

  function aoClicar(evento) {
    const linha = evento.target.closest?.(LINHA);
    // Um clique dentro do painel (para selecionar o exemplo) não fecha nada.
    if (evento.target.closest?.('.linha-painel')) return;
    if (linha && raiz.contains(linha)) alternar(linha);
    else fecharTodas();
  }

  function aoTeclar(evento) {
    if (evento.key === 'Escape') {
      fecharTodas();
      // A linha em foco ou sob o mouse fica fechada até a pessoa sair dela.
      for (const linha of raiz.querySelectorAll(`${LINHA}:focus, ${LINHA}:hover`)) linha.dataset.fechado = '';
      return;
    }
    const linha = evento.target.closest?.(LINHA);
    if (linha === evento.target && (evento.key === 'Enter' || evento.key === ' ')) {
      evento.preventDefault();
      alternar(linha);
    }
  }

  // Sair da linha (com o mouse ou com o foco) desfaz o "fechado pelo Esc".
  function aoSair(evento) {
    const linha = evento.target.closest?.(LINHA);
    if (linha && !linha.contains(evento.relatedTarget)) delete linha.dataset.fechado;
  }

  // Passar o mouse numa linha fecha a que estava aberta por clique.
  function aoEntrar(evento) {
    const linha = evento.target.closest?.(LINHA);
    if (linha) fecharTodas(linha);
  }

  // O Esc também vale com o foco fora da raiz (depois de um clique numa linha).
  function aoEscFora(evento) {
    if (evento.key === 'Escape' && !raiz.contains(evento.target)) fecharTodas();
  }

  raiz.addEventListener('keydown', aoTeclar);
  raiz.addEventListener('mouseout', aoSair);
  raiz.addEventListener('focusout', aoSair);
  raiz.addEventListener('mouseover', aoEntrar);
  document.addEventListener('click', aoClicar);
  document.addEventListener('keydown', aoEscFora);

  return () => {
    raiz.removeEventListener('keydown', aoTeclar);
    raiz.removeEventListener('mouseout', aoSair);
    raiz.removeEventListener('focusout', aoSair);
    raiz.removeEventListener('mouseover', aoEntrar);
    document.removeEventListener('click', aoClicar);
    document.removeEventListener('keydown', aoEscFora);
  };
}
