/* ==========================================================================
   telas/missao.js — a tela de missão: o coração do site.

   (Redesenhada depois do passo 12.)

   Em cima, a LINHA DO MERIDIANO: um ponto por etapa — cheio nas já
   visitadas, um anel na de agora, apagado nas que faltam. Só as visitadas
   são clicáveis: é por ela que se volta. Ao lado, só o nome da etapa de
   agora ("Tente você · 4 de 6").

   Embaixo, duas colunas:
     à esquerda, o TEXTO, direto no fundo da página — no máximo três coisas
       por etapa, e um só botão principal na tela;
     à direita, a BANCADA, num painel próprio: seções com uma barra cada
       (a aba com o nome da seção, a informação e os botões dela), o código
       no fundo de código, e as tabelas. Ela rola por dentro: a tela cabe em
       1280×800 sem rolar a página.

   As 6 etapas de uma missão (tipo 'missao'):
     1. pedido      quem pede, o título e o pedido · a tabela da missão
     2. conceito    o lembrete do pedido e o conceito · o Passo a passo
     3. palpite     a pergunta e as 3 opções · o exemplo, que roda depois
     4. tente você  a tarefa e as dicas · a consulta e o resultado
     5. sem ajuda   o mesmo, com o editor vazio
     6. entrega     a resposta · as estrelas
   Revisão e desafio final pulam conceito e palpite.

   Dicas em 3 degraus (pista, esqueleto, resposta). Estrelas: 3 sem dica,
   2 sem ver a resposta, 1 com a resposta. A animação da entrega, o
   progresso salvo e o desbloqueio são o passo 13.

   A base é zerada ao entrar na missão. Trocar o idioma no meio redesenha os
   textos no lugar; o editor traduz a consulta sozinho, e o Passo a passo se
   refaz no mesmo passo.
   ========================================================================== */

import { t, idioma, emIdioma } from '../i18n.js';
import { abrirBase, baseAberta, zerarBase, consultar, idiomaDaBase } from '../bd.js';
import { sqlNoIdioma, nomeNoIdioma, traduzirSQL, tabelasDoSQL } from '../traducao-sql.js';
import { realcarSQL, escapar, textoComSelos } from '../realce.js';
import { formatarSQL } from '../formatar-sql.js';
import { criarEditor, ATALHO_RODAR, ATALHO_FORMATAR } from '../editor.js';
import { criarTabelasDaBarra } from '../tabelas-da-barra.js';
import { desenharResultado, desenharErro, MAX_LINHAS } from '../tabela-resultado.js';
import { traduzirErro } from '../erros-sql.js';
import { conferirResposta } from '../conferir.js';
import { criarPassoAPasso } from '../passo-a-passo.js';
import { definirContexto, definirSair } from '../cabecalho.js';
import { mostrarAbrindo } from './abrindo.js';
import { modulos, carregarModulo } from '../../dados/missoes/indice.js';
import { personagens } from '../../dados/personagens.js';
import { dicionario } from '../../dados/base/dicionario.js';

/** Quantas linhas a amostra da etapa do pedido mostra. */
const LINHAS_DA_AMOSTRA = 5;

/**
 * @param {HTMLElement} tela
 * @param {string} id  ex.: 'm1-03'
 * @returns {Promise<() => void>} a limpeza, para quando a tela sai
 */
export async function mostrarMissao(tela, id) {
  // --- A missão, o módulo e a lista de todas as escritas (para "próxima") ---
  const todas = [];
  for (const modulo of modulos) {
    for (const missao of await carregarModulo(modulo.id)) todas.push({ modulo, missao });
  }
  const achada = todas.find(({ missao }) => missao.id === id);
  if (!achada) return mostrarNaoEncontrada(tela);
  const { modulo, missao } = achada;
  const seguinte = todas[todas.indexOf(achada) + 1] ?? null;
  const personagem = personagens[missao.personagem];
  const posicaoNoModulo = todas.filter((item) => item.modulo === modulo).indexOf(achada) + 1;
  const tabelas = tabelasDaMissao(missao);

  // --- O motor, e a base zerada ---------------------------------------------
  if (!baseAberta()) {
    const abrindo = mostrarAbrindo({ aoTentarDeNovo: () => mostrarMissao(tela, id) });
    try {
      await abrirBase({ aoProgredir: abrindo.progredir });
      abrindo.fechar();
    } catch (erro) {
      abrindo.falhar(erro);
      return undefined;
    }
  }
  await zerarBase(idioma());

  // --- O estado da missão -------------------------------------------------
  const etapas = montarEtapas(missao);
  const estado = {
    indice: 0,
    alcancada: 0,                                      // até onde já se chegou
    grauDaDica: missao.desafios.map(() => 0),          // 0 nada · 1 pista · 2 esqueleto · 3 resposta
    confirmandoResposta: missao.desafios.map(() => false),
    resolvido: missao.desafios.map(() => false),
    // A consulta de cada desafio, e em que idioma ela está escrita (a pessoa
    // pode trocar o idioma num desafio e voltar a outro depois).
    sqlDoAluno: missao.desafios.map((d) => sqlNoIdioma(d.inicial ?? '', idioma())),
    idiomaDoSql: missao.desafios.map(() => idioma()),
    rodou: missao.desafios.map(() => false),
    palpite: null,
    tabelaAberta: 0,                                   // a aba de tabela na etapa do pedido
  };
  let editor = null;
  let passoAPasso = null;
  let rodarDesafio = null;   // o "rodar" do desafio aberto, para a troca de idioma
  let tabelasDaBarra = null; // as tabelas na barra da Consulta
  let atualizarBarra = null; // os títulos dos botões da barra, na troca de idioma

  // A tela da missão ocupa a janela inteira, sem rodapé (ver telas.css).
  document.body.dataset.tela = 'missao';

  // --- O esqueleto da tela --------------------------------------------------
  tela.innerHTML = `
    <div class="missao">
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
     Cabeçalho e linha do meridiano
     ------------------------------------------------------------------------ */

  function desenharTopo() {
    el.aviso.textContent = t('missao.avisoCelular');
    definirContexto(t('missao.contexto', { n: modulo.numero, i: posicaoNoModulo, total: modulo.total }));
    definirSair('#/');
    document.title = `${emIdioma(missao.titulo)} · meridiano.`;

    const total = etapas.length;
    el.meridiano.setAttribute('aria-label', t('missao.linhaEtapas'));
    el.linha.style.setProperty('--progresso', String(estado.alcancada));
    el.linha.innerHTML = etapas
      .map((etapa, i) => {
        const nome = rotuloDaEtapa(etapa, missao);
        const situacao = i === estado.indice ? 'atual' : i <= estado.alcancada ? 'feita' : 'futura';
        return `
          <li><button type="button" class="meridiano-ponto meridiano-ponto--${situacao}" data-indice="${i}"
            ${i === estado.indice ? 'aria-current="step"' : ''} ${i > estado.alcancada ? 'disabled' : ''}
            aria-label="${escapar(t('missao.etapaRotulo', { nome, n: i + 1, total }))}"
            title="${escapar(nome)}"></button></li>`;
      })
      .join('');

    el.rotulo.innerHTML = `${escapar(rotuloDaEtapa(etapas[estado.indice], missao))} <span class="meridiano-de">· ${escapar(t('missao.etapaDe', { n: estado.indice + 1, total }))}</span>`;
  }

  el.linha.addEventListener('click', (evento) => {
    const ponto = evento.target.closest('.meridiano-ponto');
    if (ponto && !ponto.disabled) irParaEtapa(Number(ponto.dataset.indice));
  });

  /* ------------------------------------------------------------------------
     As etapas
     ------------------------------------------------------------------------ */

  function irParaEtapa(i) {
    guardarEditor();
    estado.indice = i;
    estado.alcancada = Math.max(estado.alcancada, i);
    desenharTopo();
    desenharTexto();
    desenharBancada();
    // Numa tela estreita, a etapa nova começa no topo.
    if (window.matchMedia('(max-width: 52rem)').matches) window.scrollTo(0, 0);
  }

  function avancar() {
    if (estado.indice < etapas.length - 1) irParaEtapa(estado.indice + 1);
    el.texto.querySelector('.botao--principal, .missao-tarefa, h1')?.focus?.({ preventScroll: true });
  }

  function guardarEditor() {
    const etapa = etapas[estado.indice];
    if (editor && etapa?.tipo === 'desafio') {
      estado.sqlDoAluno[etapa.desafio] = editor.valor();
      estado.idiomaDoSql[etapa.desafio] = idioma();
    }
  }

  function limparBancada() {
    editor?.destruir();
    editor = null;
    rodarDesafio = null;
    tabelasDaBarra?.destruir();
    tabelasDaBarra = null;
    atualizarBarra = null;
    passoAPasso?.destruir();
    passoAPasso = null;
    el.bancada.className = 'missao-bancada painel';
    el.bancada.replaceChildren();
  }

  function desenharTexto() {
    const etapa = etapas[estado.indice];
    ({
      pedido: textoPedido,
      conceito: textoConceito,
      palpite: textoPalpite,
      desafio: textoDesafio,
      entrega: textoEntrega,
    })[etapa.tipo](etapa);
  }

  function desenharBancada() {
    limparBancada();
    const etapa = etapas[estado.indice];
    ({
      pedido: bancadaPedido,
      conceito: bancadaConceito,
      palpite: bancadaPalpite,
      desafio: bancadaDesafio,
      entrega: bancadaEntrega,
    })[etapa.tipo](etapa);
  }

  /** O botão principal da etapa, que leva à seguinte. */
  function botaoAvancar(chave) {
    return `<button type="button" class="botao botao--principal missao-avancar">${escapar(t(chave))}</button>`;
  }

  function ligarAvancar() {
    el.texto.querySelector('.missao-avancar')?.addEventListener('click', avancar);
  }

  /* --- 1. Pedido ------------------------------------------------------------- */

  function textoPedido() {
    const proxima = etapas[1]?.tipo === 'conceito' ? 'missao.entenderConceito' : 'missao.comecar';
    el.texto.innerHTML = `
      <p class="missao-quem">${escapar(personagem.nome)} · ${escapar(emIdioma(personagem.cargo))}</p>
      <h1 class="missao-titulo">${escapar(emIdioma(missao.titulo))}</h1>
      <p class="missao-pedido">${textoComSelos(emIdioma(missao.pedido))}</p>
      ${botaoAvancar(proxima)}`;
    ligarAvancar();
  }

  async function bancadaPedido() {
    const idiomaDaTela = idioma();
    const nomes = tabelas.map((nome) => nomeNoIdioma(nome, idiomaDaTela));
    const abas = nomes.length > 1
      ? `<div class="painel-abas" role="tablist">${nomes
        .map((nome, i) => `<button type="button" class="painel-aba" role="tab" data-tabela="${i}"
          aria-selected="${i === estado.tabelaAberta}">${escapar(t('missao.abas.tabela', { nome }))}</button>`)
        .join('')}</div>`
      : `<span class="painel-aba">${escapar(t('missao.abas.tabela', { nome: nomes[0] ?? '' }))}</span>`;

    el.bancada.innerHTML = `
      <div class="painel-barra">
        ${abas}
        <span class="painel-espaco"></span>
        <span class="painel-info missao-amostra-info"></span>
      </div>
      <div class="painel-rolagem missao-amostra"></div>`;

    el.bancada.querySelectorAll('[data-tabela]').forEach((aba) => {
      aba.addEventListener('click', () => {
        estado.tabelaAberta = Number(aba.dataset.tabela);
        desenharBancada();
      });
    });

    const nome = tabelas[estado.tabelaAberta];
    if (!nome) return;
    const alvo = el.bancada.querySelector('.missao-amostra');
    const info = el.bancada.querySelector('.missao-amostra-info');
    const sql = estado.tabelaAberta === 0 && missao.amostra
      ? sqlNoIdioma(missao.amostra, idioma())
      : `SELECT * FROM ${nomeNoIdioma(nome, idioma())} LIMIT ${LINHAS_DA_AMOSTRA}`;
    try {
      const [amostra, contagem] = await Promise.all([
        consultar(sql, { maxLinhas: LINHAS_DA_AMOSTRA }),
        consultar(`SELECT count(*) FROM ${nomeNoIdioma(nome, idioma())}`),
      ]);
      desenharResultado(alvo, amostra);
      info.textContent = t('missao.amostraInfo', { n: amostra.linhas.length, total: Number(contagem.linhas[0][0]) });
    } catch (erro) {
      desenharErro(alvo, traduzirErro(erro.message, { sql, idiomaDaBase: idiomaDaBase() }));
    }
  }

  /* --- 2. Conceito ----------------------------------------------------------- */

  function textoConceito() {
    el.texto.innerHTML = `
      <p class="missao-lembrete">${textoComSelos(t('missao.lembretePedido', { resumo: emIdioma(missao.resumo) }))}</p>
      <p class="missao-conceito">${textoComSelos(emIdioma(missao.conceito))}</p>
      ${botaoAvancar('missao.irPalpite')}`;
    ligarAvancar();
  }

  async function bancadaConceito() {
    passoAPasso = await criarPassoAPasso(el.bancada, { exemplo: missao.exemplo, frases: missao.passoAPasso });
  }

  /* --- 3. Palpite ------------------------------------------------------------ */

  function textoPalpite() {
    const { pergunta, opcoes, correta } = missao.palpite;
    const respondido = estado.palpite !== null;

    const botoes = opcoes
      .map((opcao, i) => {
        let marca = '';
        if (respondido && i === correta) marca = 'palpite-certa';
        else if (respondido && i === estado.palpite) marca = 'palpite-errada';
        return `<li><button type="button" class="palpite-opcao ${marca}" data-opcao="${i}" ${respondido ? 'disabled' : ''}>${textoComSelos(emIdioma(opcao))}</button></li>`;
      })
      .join('');

    el.texto.innerHTML = `
      <p class="missao-rotulo">${escapar(t('missao.seuPalpite'))}</p>
      <p class="missao-pergunta">${textoComSelos(emIdioma(pergunta))}</p>
      <ol class="palpite-opcoes">${botoes}</ol>
      ${respondido ? botaoAvancar('missao.tentar') : ''}`;

    el.texto.querySelectorAll('.palpite-opcao').forEach((botao) => {
      botao.addEventListener('click', () => {
        estado.palpite = Number(botao.dataset.opcao);
        estado.alcancada = Math.max(estado.alcancada, estado.indice + 1);
        desenharTopo();
        desenharTexto();
        desenharBancada();
        el.texto.querySelector('.missao-avancar')?.focus();
      });
    });
    ligarAvancar();
  }

  async function bancadaPalpite() {
    const exemplo = sqlNoIdioma(missao.exemplo, idioma());
    el.bancada.innerHTML = `
      <div class="painel-barra"><span class="painel-aba">${escapar(t('missao.abas.exemplo'))}</span></div>
      <pre class="painel-codigo mono">${realcarSQL(formatarSQL(exemplo).trim())}</pre>
      <div class="painel-barra">
        <span class="painel-aba">${escapar(t('missao.abas.resultado'))}</span>
        <span class="painel-espaco"></span>
        <span class="painel-info missao-resultado-info"></span>
      </div>
      <div class="painel-rolagem missao-saida" aria-live="polite"></div>`;

    const saida = el.bancada.querySelector('.missao-saida');
    if (estado.palpite === null) {
      saida.innerHTML = `<p class="tabela-aviso">${escapar(t('missao.palpiteAntes'))}</p>`;
      return;
    }
    await mostrarConsulta(saida, exemplo, el.bancada.querySelector('.missao-resultado-info'));
    const certo = estado.palpite === missao.palpite.correta;
    const retorno = document.createElement('p');
    retorno.className = certo ? 'conferencia-certa' : 'conferencia-errada';
    retorno.innerHTML = textoComSelos(t(certo ? 'missao.palpiteCerto' : 'missao.palpiteErrado'));
    saida.prepend(retorno);
  }

  /* --- 4 e 5. Desafios ------------------------------------------------------- */

  function textoDesafio(etapa) {
    const i = etapa.desafio;
    const desafio = missao.desafios[i];
    const grau = estado.grauDaDica[i];

    // As dicas já abertas, em ordem.
    const abertas = [];
    if (grau >= 1) abertas.push(`<div class="dica"><p class="dica-rotulo">${escapar(t('missao.dicaPista'))}</p><p>${textoComSelos(emIdioma(desafio.dicas[0]))}</p></div>`);
    if (grau >= 2) abertas.push(`<div class="dica"><p class="dica-rotulo">${escapar(t('missao.dicaEsqueleto'))}</p><pre class="bloco-codigo mono">${realcarSQL(sqlDaDica(desafio.dicas[1]))}</pre></div>`);
    if (grau >= 3) {
      abertas.push(`
        <div class="dica"><p class="dica-rotulo">${escapar(t('missao.dicaResposta'))}</p>
          <pre class="bloco-codigo mono">${realcarSQL(sqlDaDica(desafio.dicas[2]))}</pre>
          <button type="button" class="botao-link dica-levar">${escapar(t('missao.levarEditor'))}</button>
        </div>`);
    }

    // O próximo degrau de dica (e a confirmação antes da resposta).
    let proximaDica = '';
    if (!estado.resolvido[i] && grau < 3) {
      const rotulo = grau === 0 ? 'missao.pista' : grau === 1 ? 'missao.esqueleto' : estado.confirmandoResposta[i] ? 'missao.respostaConfirma' : 'missao.resposta';
      proximaDica = `<button type="button" class="botao-link dica-proxima">${escapar(t(rotulo))}</button>`;
    }

    const resolvido = estado.resolvido[i]
      ? `<p class="missao-resolvido" role="status">${escapar(t('missao.resolvido'))}</p>${botaoAvancar('missao.proximo')}`
      : '';

    el.texto.innerHTML = `
      <p class="missao-rotulo">${escapar(t('missao.suaTarefa'))}</p>
      <p class="missao-tarefa" tabindex="-1">${textoComSelos(emIdioma(desafio.enunciado))}</p>
      ${abertas.length || proximaDica ? `<div class="dicas">${abertas.join('')}${proximaDica}</div>` : ''}
      ${resolvido}`;

    el.texto.querySelector('.dica-proxima')?.addEventListener('click', () => {
      // A resposta custa estrelas: pede um segundo clique para confirmar.
      if (grau === 2 && !estado.confirmandoResposta[i]) {
        estado.confirmandoResposta[i] = true;
      } else {
        estado.grauDaDica[i] = grau + 1;
      }
      desenharTexto();
      el.texto.querySelector('.dica-proxima, .dica-levar')?.focus();
    });
    el.texto.querySelector('.dica-levar')?.addEventListener('click', () => {
      editor?.definirValor(sqlDaDica(desafio.dicas[2]));
      editor?.focar();
    });
    ligarAvancar();
  }

  function bancadaDesafio(etapa) {
    const i = etapa.desafio;
    el.bancada.innerHTML = `
      <div class="painel-barra painel-barra--consulta">
        <span class="painel-aba" data-i18n="missao.abas.consulta">${escapar(t('missao.abas.consulta'))}</span>
        <span class="painel-espaco"></span>
        <span class="missao-tabelas"></span>
        <button type="button" class="botao-icone botao-icone--pequeno missao-formatar">
          <svg aria-hidden="true"><use href="#icone-formatar"></use></svg>
        </button>
        <button type="button" class="botao botao--pequeno missao-rodar ${estado.resolvido[i] ? '' : 'botao--principal'}"
          data-i18n="editor.rodar">${escapar(t('editor.rodar'))}</button>
      </div>
      <div class="missao-editor"></div>
      <div class="painel-barra">
        <span class="painel-aba" data-i18n="missao.abas.resultado">${escapar(t('missao.abas.resultado'))}</span>
        <span class="painel-espaco"></span>
        <span class="painel-info missao-resultado-info"></span>
      </div>
      <div class="painel-rolagem missao-saida" aria-live="polite">
        <p class="tabela-aviso" data-i18n="missao.resultadoVazio">${escapar(t('missao.resultadoVazio'))}</p>
      </div>`;

    const saida = el.bancada.querySelector('.missao-saida');
    const info = el.bancada.querySelector('.missao-resultado-info');
    const botaoRodar = el.bancada.querySelector('.missao-rodar');
    const botaoFormatar = el.bancada.querySelector('.missao-formatar');

    // Os títulos dos botões, com o atalho de cada sistema (e no idioma da tela).
    atualizarBarra = () => {
      botaoRodar.title = t('editor.rodarTitulo', { atalho: ATALHO_RODAR });
      const formatar = t('editor.formatarTitulo', { atalho: ATALHO_FORMATAR });
      botaoFormatar.title = formatar;
      botaoFormatar.setAttribute('aria-label', formatar);
    };
    atualizarBarra();

    // As tabelas da tarefa, com a lista de colunas e a prévia.
    tabelasDaBarra = criarTabelasDaBarra(el.bancada.querySelector('.missao-tabelas'), {
      tabelas: missao.desafios[i].tabelas ?? tabelasDoSQL(missao.desafios[i].gabarito),
      aoVerLinhas: (tabela) => mostrarPrevia(tabela, saida, info),
    });

    async function rodar(sql) {
      estado.sqlDoAluno[i] = sql;
      estado.rodou[i] = true;
      try {
        const resultado = await consultar(sql, { maxLinhas: MAX_LINHAS });
        info.textContent = desenharResultado(saida, resultado);
        const veredito = await conferirResposta(resultado, sql, missao.desafios[i]);
        const linha = document.createElement('p');
        linha.className = veredito.certo ? 'conferencia-certa' : 'conferencia-errada';
        linha.innerHTML = veredito.mensagem;   // já com os selos (conferir.js)
        saida.prepend(linha);
        if (veredito.certo && !estado.resolvido[i]) {
          estado.resolvido[i] = true;
          estado.alcancada = Math.max(estado.alcancada, estado.indice + 1);
          // Resolvido: o botão principal passa a ser o "Continuar", à esquerda.
          botaoRodar.classList.remove('botao--principal');
          desenharTopo();
          desenharTexto();
          el.texto.querySelector('.missao-avancar')?.focus();
        }
      } catch (erro) {
        info.textContent = '';
        const traduzido = traduzirErro(erro.message, { sql, idiomaDaBase: idiomaDaBase() });
        desenharErro(saida, traduzido);
        if (traduzido.linha) editor?.marcarErro(traduzido.linha);
      }
    }

    // A consulta guardada pode estar no outro idioma: traduz antes de mostrar.
    if (estado.idiomaDoSql[i] !== idioma()) {
      estado.sqlDoAluno[i] = traduzirSQL(estado.sqlDoAluno[i], estado.idiomaDoSql[i], idioma());
      estado.idiomaDoSql[i] = idioma();
    }
    editor = criarEditor(el.bancada.querySelector('.missao-editor'), { inicial: estado.sqlDoAluno[i], aoRodar: rodar });
    rodarDesafio = rodar;
    botaoRodar.addEventListener('click', () => editor.rodar());
    botaoFormatar.addEventListener('click', () => {
      editor.formatar();
      editor.focar();
    });
    // Voltando a um desafio já rodado: o resultado aparece de novo.
    if (estado.rodou[i]) rodar(estado.sqlDoAluno[i]);
  }

  /* --- 6. Entrega ------------------------------------------------------------- */

  function estrelas() {
    const maior = Math.max(...estado.grauDaDica);
    if (maior === 0) return 3;
    if (maior < 3) return 2;
    return 1;
  }

  function textoEntrega() {
    const proxima = seguinte
      ? `<a class="botao botao--principal" href="#/missao/${seguinte.missao.id}">${escapar(t('missao.proximaMissao'))}</a>`
      : `<p class="missao-lembrete">${escapar(t('missao.ultimaEscrita'))}</p>`;
    el.texto.innerHTML = `
      <p class="missao-rotulo">${escapar(t('missao.entregue'))}</p>
      <p class="missao-pedido">${textoComSelos(emIdioma(missao.entrega))}</p>
      ${proxima}`;
  }

  function bancadaEntrega() {
    const n = estrelas();
    el.bancada.classList.add('missao-bancada--entrega');
    el.bancada.innerHTML = `
      <div class="entrega">
        <p class="estrelas" role="img" aria-label="${escapar(t('missao.estrelasRotulo', { n }))}">${desenharEstrelas(n)}</p>
        <p class="entrega-frase">${escapar(t(`missao.estrelas${n}`))}</p>
        <a class="botao-link" href="#/">${escapar(t('missao.voltarInicio'))}</a>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     A prévia de uma tabela ("ver 5 linhas"), na seção Resultado
     ------------------------------------------------------------------------ */

  async function mostrarPrevia(tabelaEn, alvo, info) {
    const nome = nomeNoIdioma(tabelaEn, idioma());
    try {
      const [amostra, contagem] = await Promise.all([
        consultar(`SELECT * FROM ${nome} LIMIT ${LINHAS_DA_AMOSTRA}`, { maxLinhas: LINHAS_DA_AMOSTRA }),
        consultar(`SELECT count(*) FROM ${nome}`),
      ]);
      desenharResultado(alvo, amostra);
      info.textContent = t('missao.previa', { nome, n: amostra.linhas.length, total: Number(contagem.linhas[0][0]) });
    } catch (erro) {
      desenharErro(alvo, traduzirErro(erro.message, { sql: nome, idiomaDaBase: idiomaDaBase() }));
    }
  }

  /* ------------------------------------------------------------------------
     Uma consulta de leitura (o exemplo), com erro traduzido se houver
     ------------------------------------------------------------------------ */

  async function mostrarConsulta(alvo, sql, info) {
    try {
      const resumo = desenharResultado(alvo, await consultar(sql, { maxLinhas: MAX_LINHAS }));
      if (info) info.textContent = resumo;
    } catch (erro) {
      desenharErro(alvo, traduzirErro(erro.message, { sql, idiomaDaBase: idiomaDaBase() }));
    }
  }

  /* ------------------------------------------------------------------------
     Idioma: textos no lugar; a base recarregada refaz o que depende dela
     ------------------------------------------------------------------------ */

  function aoMudarIdioma() {
    // Só os textos. A consulta do editor é guardada em aoRecarregarBase, que
    // vem depois — quando o editor (que ouve este mesmo aviso, mas depois
    // desta tela) já terminou de traduzi-la.
    desenharTopo();
    desenharTexto();
    atualizarBarra?.();
  }

  function aoRecarregarBase() {
    const etapa = etapas[estado.indice];
    // O editor já traduziu a consulta sozinho; o Passo a passo se refaz sozinho.
    if (etapa.tipo === 'desafio') {
      estado.sqlDoAluno[etapa.desafio] = editor?.valor() ?? estado.sqlDoAluno[etapa.desafio];
      estado.idiomaDoSql[etapa.desafio] = idioma();
      if (estado.rodou[etapa.desafio]) rodarDesafio?.(estado.sqlDoAluno[etapa.desafio]);
      return;
    }
    if (etapa.tipo !== 'conceito') desenharBancada();
  }

  document.addEventListener('idioma-mudou', aoMudarIdioma);
  document.addEventListener('base-recarregada', aoRecarregarBase);

  irParaEtapa(0);

  return () => {
    document.removeEventListener('idioma-mudou', aoMudarIdioma);
    document.removeEventListener('base-recarregada', aoRecarregarBase);
    limparBancada();
    delete document.body.dataset.tela;
    document.title = t('documento.titulo');
  };
}

/* --------------------------------------------------------------------------
   Ajudantes
   -------------------------------------------------------------------------- */

/** As etapas de uma missão, conforme o tipo. */
function montarEtapas(missao) {
  const etapas = [{ tipo: 'pedido' }];
  if (missao.tipo === 'missao') etapas.push({ tipo: 'conceito' }, { tipo: 'palpite' });
  missao.desafios.forEach((_, i) => etapas.push({ tipo: 'desafio', desafio: i }));
  etapas.push({ tipo: 'entrega' });
  return etapas;
}

/** O nome de uma etapa. */
function rotuloDaEtapa(etapa, missao) {
  if (etapa.tipo !== 'desafio') return t(`missao.etapas.${etapa.tipo}`);
  if (missao.tipo === 'missao') return t(etapa.desafio === 0 ? 'missao.etapas.tente' : 'missao.etapas.semAjuda');
  return missao.desafios.length === 1 ? t('missao.etapas.desafio') : t('missao.etapas.desafioN', { n: etapa.desafio + 1 });
}

/**
 * As tabelas da missão (nomes em inglês): as que ela declara, ou — se não
 * declarar — as que os desafios declaram.
 */
function tabelasDaMissao(missao) {
  if (missao.tabelas?.length) return missao.tabelas;
  return [...new Set(missao.desafios.flatMap((d) => d.tabelas ?? tabelasDoSQL(d.gabarito)))];
}

/**
 * Uma dica de SQL (esqueleto ou resposta): texto em inglês (traduzido) ou
 * { pt, en } — formatada com uma cláusula por linha, como o botão Formatar.
 */
function sqlDaDica(dica) {
  return formatarSQL(sqlNoIdioma(dica, idioma())).trim();
}

function desenharEstrelas(n) {
  return [1, 2, 3].map((i) => `<span class="${i <= n ? 'estrela-cheia' : 'estrela-vazia'}">★</span>`).join('');
}

function mostrarNaoEncontrada(tela) {
  tela.innerHTML = `
    <section class="secao">
      <h1>${escapar(t('missao.naoEncontrada'))}</h1>
      <p><a href="#/">${escapar(t('missao.voltarInicio'))}</a></p>
    </section>`;
  return undefined;
}
