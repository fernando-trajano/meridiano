/* ==========================================================================
   telas/nivelamento.js — os 6 desafios para quem já sabe um pouco de SQL.

   Mesma cara da missão: a linha do meridiano em cima (um ponto por desafio),
   o texto à esquerda e a bancada à direita (bancada-consulta.js). Três
   momentos:
     1. a abertura: o que é o nivelamento e o que cada desafio mede;
     2. os desafios, um de cada vez. Acertar libera o seguinte; "Não sei
        fazer este" encerra ali — sem dicas: é um teste, não uma aula;
     3. o resultado: quantos acertos, que módulos abriram e por onde seguir.

   Cada acerto libera um módulo (dados/nivelamento.js), e o resultado é
   guardado pelo progresso.js. O que já estava liberado nunca volta a fechar.
   ========================================================================== */

import { t, idioma, emIdioma } from '../i18n.js';
import { abrirBase, baseAberta, zerarBase } from '../bd.js';
import { traduzirSQL } from '../traducao-sql.js';
import { escapar, textoComSelos } from '../realce.js';
import { criarBancadaDeConsulta } from '../bancada-consulta.js';
import { definirContexto, definirSair } from '../cabecalho.js';
import { concluirNivelamento, proximaMissao } from '../progresso.js';
import { pulsarPontoDaMarca } from '../movimento.js';
import { mostrarAbrindo } from './abrindo.js';
import { desafiosDoNivelamento as desafios } from '../../dados/nivelamento.js';
import { modulos } from '../../dados/missoes/indice.js';

/**
 * @param {HTMLElement} tela
 * @returns {Promise<() => void>}
 */
export async function mostrarNivelamento(tela) {
  if (!baseAberta()) {
    const abrindo = mostrarAbrindo({ aoTentarDeNovo: () => mostrarNivelamento(tela) });
    try {
      await abrirBase({ aoProgredir: abrindo.progredir });
      abrindo.fechar();
    } catch (erro) {
      abrindo.falhar(erro);
      return undefined;
    }
  }
  await zerarBase(idioma());

  const estado = {
    momento: 'abertura',          // abertura · desafio · resultado
    indice: 0,                    // o desafio de agora
    acertos: [],                  // um por desafio respondido
    resolvido: false,
    sql: desafios.map(() => ''),
    idiomaDoSql: desafios.map(() => idioma()),
    rodou: false,
    liberadosAgora: [],
  };
  let bancada = null;

  // Ocupa a janela inteira, como a missão (ver telas.css).
  document.body.dataset.tela = 'missao';

  tela.innerHTML = `
    <div class="missao nivelamento">
      <p class="missao-aviso-celular"></p>
      <nav class="meridiano">
        <ol class="meridiano-linha"></ol>
        <p class="meridiano-rotulo" aria-hidden="true"></p>
      </nav>
      <div class="missao-corpo">
        <section class="missao-texto"></section>
        <section class="missao-bancada painel"></section>
      </div>
    </div>`;

  const el = {
    aviso: tela.querySelector('.missao-aviso-celular'),
    meridiano: tela.querySelector('.meridiano'),
    linha: tela.querySelector('.meridiano-linha'),
    rotulo: tela.querySelector('.meridiano-rotulo'),
    texto: tela.querySelector('.missao-texto'),
    bancada: tela.querySelector('.missao-bancada'),
  };

  /* ------------------------------------------------------------------------
     Topo: o cabeçalho e a linha, um ponto por desafio
     ------------------------------------------------------------------------ */

  function desenharTopo() {
    el.aviso.textContent = t('missao.avisoCelular');
    const total = desafios.length;
    const n = Math.min(estado.indice + 1, total);
    definirContexto(estado.momento === 'desafio'
      ? t('nivelamento.contexto', { n, total })
      : t('nivelamento.titulo'));
    definirSair('#/');
    document.title = `${t('nivelamento.titulo')} · meridiano.`;

    // Só para ver onde se está: os pontos não são clicáveis (não se volta
    // num teste).
    const feitos = estado.acertos.length;
    el.meridiano.setAttribute('aria-label', t('nivelamento.linha'));
    el.linha.style.setProperty('--progresso', String(Math.min(feitos, total - 1)));
    el.linha.innerHTML = desafios
      .map((_, i) => {
        let situacao = 'futura';
        if (i < feitos) situacao = 'feita';
        if (estado.momento === 'desafio' && i === estado.indice) situacao = 'atual';
        return `<li><button type="button" class="meridiano-ponto meridiano-ponto--${situacao}" disabled
          ${situacao === 'atual' ? 'aria-current="step"' : ''}
          aria-label="${escapar(t('nivelamento.contexto', { n: i + 1, total }))}"></button></li>`;
      })
      .join('');
    el.rotulo.innerHTML = estado.momento === 'desafio'
      ? `${escapar(t('nivelamento.desafio'))} <span class="meridiano-de">· ${escapar(t('missao.etapaDe', { n, total }))}</span>`
      : escapar(t(estado.momento === 'abertura' ? 'nivelamento.titulo' : 'nivelamento.resultadoTitulo'));
  }

  function desenhar() {
    desenharTopo();
    desenharTexto();
    desenharBancada();
  }

  function desenharTexto() {
    ({ abertura: textoAbertura, desafio: textoDesafio, resultado: textoResultado })[estado.momento]();
  }

  function desenharBancada() {
    bancada?.destruir();
    bancada = null;
    el.bancada.replaceChildren();
    ({ abertura: bancadaAbertura, desafio: bancadaDesafio, resultado: bancadaResultado })[estado.momento]();
  }

  /* ------------------------------------------------------------------------
     1. A abertura
     ------------------------------------------------------------------------ */

  function textoAbertura() {
    el.texto.innerHTML = `
      <h1 class="missao-titulo">${escapar(t('nivelamento.titulo'))}</h1>
      <p class="missao-pedido">${escapar(t('nivelamento.explica'))}</p>
      <button type="button" class="botao botao--principal nivelamento-comecar">${escapar(t('nivelamento.comecar'))}</button>`;
    el.texto.querySelector('.nivelamento-comecar').addEventListener('click', () => {
      estado.momento = 'desafio';
      desenhar();
      el.texto.querySelector('.missao-tarefa')?.focus();
    });
  }

  function bancadaAbertura() {
    const itens = desafios
      .map((desafio, i) => {
        const modulo = modulos.find((m) => m.id === desafio.libera);
        return `<li><span class="nivelamento-numero">${String(i + 1).padStart(2, '0')}</span>
          ${escapar(t('nivelamento.libera', { n: modulo.numero, titulo: emIdioma(modulo.titulo) }))}</li>`;
      })
      .join('');
    el.bancada.innerHTML = `
      <div class="painel-barra"><span class="painel-aba">${escapar(t('nivelamento.comoFunciona'))}</span></div>
      <ol class="nivelamento-lista">${itens}</ol>`;
  }

  /* ------------------------------------------------------------------------
     2. Os desafios
     ------------------------------------------------------------------------ */

  function textoDesafio() {
    const desafio = desafios[estado.indice];
    const ultimo = estado.indice === desafios.length - 1;
    const seguir = estado.resolvido
      ? `<p class="missao-resolvido" role="status">${escapar(t('missao.resolvido'))}</p>
         <button type="button" class="botao botao--principal nivelamento-seguir">${escapar(t(ultimo ? 'nivelamento.verResultado' : 'nivelamento.proximo'))}</button>`
      : `<button type="button" class="botao-link nivelamento-nao-sei">${escapar(t('nivelamento.naoSei'))}</button>`;
    el.texto.innerHTML = `
      <p class="missao-rotulo">${escapar(t('nivelamento.contexto', { n: estado.indice + 1, total: desafios.length }))}</p>
      <p class="missao-tarefa" tabindex="-1">${textoComSelos(emIdioma(desafio.enunciado))}</p>
      ${seguir}`;
    el.texto.querySelector('.nivelamento-seguir')?.addEventListener('click', () => {
      estado.acertos.push(true);
      if (ultimo) terminar();
      else irPara(estado.indice + 1);
    });
    el.texto.querySelector('.nivelamento-nao-sei')?.addEventListener('click', terminar);
  }

  function bancadaDesafio() {
    const i = estado.indice;
    if (estado.idiomaDoSql[i] !== idioma()) {
      estado.sql[i] = traduzirSQL(estado.sql[i], estado.idiomaDoSql[i], idioma());
      estado.idiomaDoSql[i] = idioma();
    }
    bancada = criarBancadaDeConsulta(el.bancada, {
      desafio: desafios[i],
      inicial: estado.sql[i],
      principal: !estado.resolvido,
      aoRodar(sql) {
        estado.sql[i] = sql;
        estado.rodou = true;
      },
      aoVeredito(veredito) {
        if (!veredito.certo || estado.resolvido) return;
        estado.resolvido = true;
        bancada.rebaixarRodar();
        desenharTexto();
        el.texto.querySelector('.nivelamento-seguir')?.focus();
      },
    });
    if (estado.rodou) bancada.rodar(estado.sql[i]);
  }

  function irPara(i) {
    estado.indice = i;
    estado.resolvido = false;
    estado.rodou = false;
    desenhar();
    el.texto.querySelector('.missao-tarefa')?.focus();
  }

  /** Encerra (no fim, ou num "não sei"): guarda e mostra o resultado. */
  function terminar() {
    const acertados = desafios.slice(0, estado.acertos.length).map((d) => d.libera);
    estado.liberadosAgora = concluirNivelamento(estado.acertos, acertados);
    estado.momento = 'resultado';
    if (estado.acertos.length) pulsarPontoDaMarca();
    desenhar();
  }

  /* ------------------------------------------------------------------------
     3. O resultado
     ------------------------------------------------------------------------ */

  async function textoResultado() {
    const n = estado.acertos.length;
    const frase = n === 0
      ? t('nivelamento.nenhum')
      : t(n === desafios.length ? 'nivelamento.todos' : 'nivelamento.alguns', {
        n, total: desafios.length, ultimo: modulos.find((m) => m.id === desafios[n - 1].libera).numero,
      });

    // Por onde seguir: de onde o nivelamento abriu (progresso.js).
    const proxima = (await proximaMissao())?.missao ?? null;

    el.texto.innerHTML = `
      <h1 class="missao-titulo">${escapar(t('nivelamento.resultadoTitulo'))}</h1>
      <p class="missao-pedido">${escapar(frase)}</p>
      ${proxima
        ? `<a class="botao botao--principal" href="#/missao/${proxima.id}">${escapar(t('nivelamento.seguirPara', { titulo: emIdioma(proxima.titulo) }))}</a>`
        : ''}
      <p class="nivelamento-trilha"><a class="botao-link" href="#/trilha">${escapar(t('missao.voltarInicio'))}</a></p>`;
  }

  function bancadaResultado() {
    const itens = desafios
      .map((desafio, i) => {
        const modulo = modulos.find((m) => m.id === desafio.libera);
        const acertou = i < estado.acertos.length;
        return `<li class="${acertou ? 'nivelamento-acertou' : ''}">
          <span class="nivelamento-marca" aria-hidden="true">${acertou ? '✓' : '·'}</span>
          ${escapar(t('nivelamento.libera', { n: modulo.numero, titulo: emIdioma(modulo.titulo) }))}
          <span class="apenas-leitor-de-tela">(${escapar(t(acertou ? 'nivelamento.acertou' : 'nivelamento.naoRespondido'))})</span>
        </li>`;
      })
      .join('');
    el.bancada.innerHTML = `
      <div class="painel-barra"><span class="painel-aba">${escapar(t('nivelamento.resultadoTitulo'))}</span></div>
      <ol class="nivelamento-lista">${itens}</ol>`;
  }

  /* ------------------------------------------------------------------------
     Idioma
     ------------------------------------------------------------------------ */

  function aoMudarIdioma() {
    desenharTopo();
    desenharTexto();
    if (estado.momento !== 'desafio') desenharBancada();
  }

  function aoRecarregarBase() {
    if (estado.momento !== 'desafio' || !bancada) return;
    // O editor já traduziu a consulta sozinho.
    estado.sql[estado.indice] = bancada.editor.valor();
    estado.idiomaDoSql[estado.indice] = idioma();
    if (estado.rodou) bancada.rodar(estado.sql[estado.indice]);
  }

  document.addEventListener('idioma-mudou', aoMudarIdioma);
  document.addEventListener('base-recarregada', aoRecarregarBase);

  desenhar();

  return () => {
    document.removeEventListener('idioma-mudou', aoMudarIdioma);
    document.removeEventListener('base-recarregada', aoRecarregarBase);
    bancada?.destruir();
    delete document.body.dataset.tela;
    document.title = t('documento.titulo');
  };
}
