/* ==========================================================================
   telas/inicio.js — a tela de quem volta.

   Ela responde uma pergunta só, e rápido: "o que eu faço agora?" (a mesma
   ideia — e a mesma hierarquia — do início do digita):

     De volta ao Observatório            ← o título da página, grande
     Você parou em                       ← colado nele, discreto
     Só o que interessa                  ← a missão
     Módulo 0 · … · 1 de 3 feitas
     [Continuar de onde parei]
     ───────────────
     Ir para                             ← os atalhos, em cartões (3 colunas)

   A página é montada pela moldura (moldura.js), a mesma da trilha: o
   título no mesmo lugar e, à direita, o painel "Seu progresso". Em tela
   estreita, a ordem é: topo, progresso, "Ir para".

   Quem nunca concluiu nada vê a entrada, e não esta tela (ver app.js).
   ========================================================================== */

import { t, emIdioma } from '../i18n.js';
import { escapar } from '../realce.js';
import { proximaMissao, totalFeitas, missaoFeita, aoMudarProgresso } from '../progresso.js';
import { montarMoldura } from '../moldura.js';
import { carregarModulo } from '../../dados/missoes/indice.js';

/**
 * Os atalhos, na ordem. Sem `endereco` = ainda não existe ("em breve"):
 * a cola é o passo 18 e os jogos os passos 19 e 20.
 */
const ATALHOS = [
  { id: 'trilha', endereco: '#/trilha' },
  { id: 'nivelamento', endereco: '#/nivelamento' },
  { id: 'laboratorio', endereco: '#/laboratorio' },
  { id: 'cola', endereco: null },
  { id: 'jogos', endereco: null },
];

/**
 * @param {HTMLElement} tela
 * @returns {Promise<() => void>}
 */
export async function mostrarInicio(tela) {
  async function desenhar() {
    const proxima = await proximaMissao();
    const comecou = totalFeitas() > 0;

    // --- O topo: o título, onde parou e o Continuar ------------------------
    let continuar = `<p class="inicio-tudo-feito">${escapar(t('inicio.tudoFeito'))}</p>`;
    if (proxima) {
      const doModulo = await carregarModulo(proxima.modulo.id);
      const feitasNoModulo = doModulo.filter((m) => missaoFeita(m.id)).length;
      continuar = `
        <h2 class="inicio-missao">${escapar(emIdioma(proxima.missao.titulo))}</h2>
        <p class="inicio-modulo">${escapar(t('inicio.doModulo', { n: proxima.modulo.numero, titulo: emIdioma(proxima.modulo.titulo) }))}
          · ${escapar(t('inicio.feitasDoModulo', { n: feitasNoModulo, total: proxima.modulo.total }))}</p>
        <a class="botao botao--principal inicio-botao" href="#/missao/${proxima.missao.id}">${escapar(t(comecou ? 'inicio.continuar' : 'inicio.comecar'))}</a>`;
    }

    // --- Os atalhos, em cartões -------------------------------------------------
    const cartoes = ATALHOS
      .map(({ id, endereco }) => {
        const miolo = `
          <span class="cartao-nome">${escapar(t(`inicio.atalhos.${id}`))}${endereco ? '' : ` <span class="cartao-breve">${escapar(t('trilha.emBreve'))}</span>`}</span>
          <span class="cartao-descricao">${escapar(t(`inicio.atalhos.${id}Descricao`))}</span>`;
        return endereco
          ? `<li><a class="cartao" href="${endereco}">${miolo}</a></li>`
          : `<li><span class="cartao cartao--breve">${miolo}</span></li>`;
      })
      .join('');

    tela.innerHTML = montarMoldura({
      titulo: t(comecou ? 'inicio.titulo' : 'inicio.tituloNovo'),
      classe: 'inicio',
      topo: `
        ${proxima ? `<p class="inicio-rotulo">${escapar(t(comecou ? 'inicio.paradoEm' : 'inicio.comecarPor'))}</p>` : ''}
        <div class="inicio-continuar">${continuar}</div>`,
      conteudo: `
        <section class="inicio-ir" aria-labelledby="inicio-ir-titulo">
          <h2 class="inicio-ir-titulo" id="inicio-ir-titulo">${escapar(t('inicio.irPara'))}</h2>
          <ul class="cartoes">${cartoes}</ul>
        </section>`,
    });
  }

  document.addEventListener('idioma-mudou', desenhar);
  const pararDeOuvir = aoMudarProgresso(desenhar);
  document.title = t('documento.titulo');
  await desenhar();

  return () => {
    document.removeEventListener('idioma-mudou', desenhar);
    pararDeOuvir();
  };
}
