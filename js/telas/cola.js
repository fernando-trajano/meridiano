/* ==========================================================================
   telas/cola.js — as Dicas (a antiga cola): tudo o que se consulta enquanto
   escreve SQL (passo 18; redesenhada depois dele, a partir de um rascunho
   aprovado pelo Fernando).

   Uma coluna de leitura, com o índice das seções fixo no topo:
     Sintaxe            cláusula por cláusula, em sanfonas (fechadas ao
                        entrar); o ícone no canto da consulta abre ela no
                        laboratório
     Funções            em sanfonas (fechadas); o exemplo aparece num painel
                        ao passar o mouse na linha
     As tabelas         a origem dos dados num filtro, a lista das tabelas e,
                        ao lado, as colunas da escolhida, com as ligações
     Os indicadores     os 12, agrupados por tema (sanfonas abertas); o que
                        cada um mede aparece num painel
     Em outros bancos   o mesmo pedido no Oracle e no BigQuery
     Glossário          português ↔ inglês, na ordem do idioma da tela

   A rota (#/cola), o nome deste arquivo, as classes .cola-* e as chaves do
   i18n continuam "cola": só o nome na tela mudou. O conteúdo mora em
   dados/cola.js e no dicionário da base. Não carrega o motor SQL.

   O índice usa botões, e não âncoras: o "#" do endereço é do roteador.
   Sanfonas abertas, a origem e a tabela escolhida vivem só enquanto a tela
   está aberta (nada no localStorage): ao voltar, tudo volta ao começo.
   ========================================================================== */

import { t, idioma, emIdioma } from '../i18n.js';
import { sqlNoIdioma, nomeNoIdioma } from '../traducao-sql.js';
import { realcarSQL, escapar, textoComSelos } from '../realce.js';
import { formatarSQL } from '../formatar-sql.js';
import { definirContexto } from '../cabecalho.js';
import { ligarLinhasComPainel } from '../linha-com-painel.js';
import { ligarPainelFixavel } from '../painel-fixavel.js';
import { semMovimento } from '../movimento.js';
import { dicionario } from '../../dados/base/dicionario.js';
import { sintaxe, funcoes, indicadores, destaqueOutrosBancos, outrosBancos, glossario } from '../../dados/cola.js';

const SECOES = ['sintaxe', 'funcoes', 'tabelas', 'indicadores', 'outrosBancos', 'glossario'];

/** A origem de cada grupo do filtro das tabelas (o `grupo` do dicionário). */
const ORIGENS = ['mundo', 'instituto'];

/**
 * @param {HTMLElement} tela
 * @returns {() => void}
 */
export function mostrarCola(tela) {
  // A tela desenha dentro de uma raiz própria: o <main> é o mesmo para todas
  // as telas, e os ouvintes presos nele se somariam a cada visita. A raiz
  // sai com o roteador (replaceChildren), e os ouvintes dela junto.
  const raiz = document.createElement('div');
  tela.append(raiz);

  // O estado da tela: só em memória.
  const abertas = new Map();   // id da sanfona → aberta?
  let origem = 'mundo';        // o filtro das tabelas
  let selecionada = null;      // a tabela escolhida (nome em inglês)
  let desligarMais = null;     // o painel do "Exibir mais"

  /** Um pedaço de SQL, no idioma da tela, com o realce. */
  const codigo = (sql) => `<code class="cola-codigo">${realcarSQL(sqlNoIdioma(sql, idioma()))}</code>`;

  /** O botão (link) que abre a consulta no laboratório, no idioma da tela. */
  const abrirNoLaboratorio = (sql) => {
    const href = `#/laboratorio?de=${idioma()}&sql=${encodeURIComponent(sqlNoIdioma(sql, idioma()))}`;
    const dica = escapar(t('cola.abrirNoLaboratorio'));
    return `<a class="botao-icone cola-abrir" href="${href}" title="${dica}" aria-label="${dica}">
      <svg aria-hidden="true"><use href="#icone-frasco"></use></svg></a>`;
  };

  /**
   * Uma sanfona: o rótulo do grupo é o gatilho.
   * @param {{id: string, rotulo: string, quantos: number, corpo: string, aberta: boolean}} opcoes
   */
  function sanfona({ id, rotulo, quantos, corpo, aberta }) {
    if (!abertas.has(id)) abertas.set(id, aberta);
    const agora = abertas.get(id);
    return `
      <div class="cola-sanfona">
        <button type="button" class="cola-grupo" aria-expanded="${agora}" aria-controls="${id}" data-sanfona="${id}">
          <svg class="cola-grupo-seta" aria-hidden="true"><use href="#icone-seta"></use></svg>
          <span class="cola-grupo-rotulo">${escapar(rotulo)}</span>
          <span class="cola-grupo-linha" aria-hidden="true"></span>
          <span class="cola-grupo-quantos">${quantos}</span>
        </button>
        <div class="cola-sanfona-corpo" id="${id}"${agora ? '' : ' hidden'}>${corpo}</div>
      </div>`;
  }

  /** Uma linha com painel (funções e indicadores): células + o painel. */
  function linhaComPainel({ id, grade, celulas, painel, nomePainel }) {
    return `
      <div class="cola-linha ${grade} linha-com-painel" tabindex="0" aria-describedby="${id}">
        ${celulas.map((celula) => `<div class="cola-celula">${celula}</div>`).join('')}
        <div class="flutuante linha-painel" id="${id}" role="tooltip" aria-label="${escapar(nomePainel)}">${painel}</div>
      </div>`;
  }

  /* ------------------------------------------------------------------------
     As seções
     ------------------------------------------------------------------------ */

  function secaoSintaxe() {
    const grupos = sintaxe
      .map(({ grupo, itens }, i) => sanfona({
        id: `cola-sintaxe-${i}`,
        rotulo: emIdioma(grupo),
        quantos: itens.length,
        aberta: false,
        corpo: `
          <div class="cola-itens">${itens
            .map(({ nome, texto, sql }) => `
              <article class="cola-item">
                <h3 class="cola-nome">${typeof nome === 'string' ? `<code class="cola-codigo">${realcarSQL(nome)}</code>` : escapar(emIdioma(nome))}</h3>
                <p class="cola-texto">${textoComSelos(emIdioma(texto))}</p>
                <div class="cola-consulta">
                  <pre class="bloco-codigo mono">${realcarSQL(formatarSQL(sqlNoIdioma(sql, idioma())).trim())}</pre>
                  ${abrirNoLaboratorio(sql)}
                </div>
              </article>`)
            .join('')}</div>`,
      }))
      .join('');
    return `
      <p class="cola-ajuda">${escapar(t('cola.ajudaSintaxe'))}</p>
      <div class="cola-sanfonas">${grupos}</div>`;
  }

  function secaoFuncoes() {
    const grupos = funcoes
      .map(({ grupo, itens }, i) => sanfona({
        id: `cola-funcoes-${i}`,
        rotulo: emIdioma(grupo),
        quantos: itens.length,
        aberta: false,
        corpo: itens
          .map(({ nome, texto, exemplo }, j) => linhaComPainel({
            id: `cola-funcao-${i}-${j}`,
            grade: 'cola-grade-funcoes',
            celulas: [`<code class="cola-codigo">${escapar(nome)}</code>`, textoComSelos(emIdioma(texto))],
            painel: codigo(exemplo),
            nomePainel: t('cola.exemplo'),
          }))
          .join(''),
      }))
      .join('');
    return `
      <p class="cola-ajuda">${escapar(t('cola.ajudaFuncoes'))}</p>
      <div class="cola-cabeca cola-grade-funcoes" aria-hidden="true">
        <span>${escapar(t('cola.funcao'))}</span><span>${escapar(t('cola.oQueFaz'))}</span>
      </div>
      <div class="cola-sanfonas">${grupos}</div>`;
  }

  /** O filtro da origem, a lista das tabelas e, ao lado, as colunas da escolhida. */
  function secaoTabelas() {
    const opcoes = ORIGENS
      .map((id) => `<option value="${id}"${id === origem ? ' selected' : ''}>${escapar(t(`cola.grupos.${id}`))}</option>`)
      .join('');
    const lista = Object.keys(dicionario)
      .filter((nomeEn) => dicionario[nomeEn].grupo === origem)
      .map((nomeEn) => `
        <li><button type="button" class="cola-mapa-tabela" data-tabela="${nomeEn}" aria-pressed="${nomeEn === selecionada}">
          <span class="cola-mapa-marca" aria-hidden="true"></span>${escapar(nomeNoIdioma(nomeEn, idioma()))}
        </button></li>`)
      .join('');
    return `
      <p class="cola-intro">${escapar(t('cola.mapaTexto'))}</p>
      <div class="cola-tabelas">
        <div class="cola-tabelas-escolha">
          <label class="cola-rotulo" for="cola-origem">${escapar(t('cola.origem'))}</label>
          <select class="cola-origem" id="cola-origem">${opcoes}</select>
          <ul class="cola-mapa">${lista}</ul>
        </div>
        <div class="cola-detalhe" aria-live="polite">${selecionada
          ? detalheDaTabela(selecionada)
          : `<p class="cola-vazio">${escapar(t('cola.escolhaTabela'))}</p>`}</div>
      </div>`;
  }

  /** As colunas de uma tabela: nome, tipo, o que é e a ligação (chave e tabela ligada). */
  function detalheDaTabela(nomeEn) {
    const tabela = dicionario[nomeEn];
    const linhas = Object.entries(tabela.colunas)
      .map(([colunaEn, coluna]) => {
        const selos = [];
        if (coluna.chave === 'primaria') selos.push(`<span class="cola-selo-chave">${escapar(t('cola.chavePrimaria'))}</span>`);
        if (coluna.referencia) {
          const alvo = coluna.referencia.split('.')[0];
          selos.push(`<span class="cola-selo-ligacao">${escapar(nomeNoIdioma(alvo, idioma()))}</span>`);
        }
        return `
          <tr>
            <td><code class="cola-codigo">${escapar(idioma() === 'pt' ? coluna.pt : colunaEn)}</code></td>
            <td class="cola-tipo">${escapar(coluna.tipo)}</td>
            <td>${escapar(emIdioma(coluna.descricao))}</td>
            <td class="cola-ligacao">${selos.length ? `<span class="cola-selos">${selos.join('')}</span>` : ''}</td>
          </tr>`;
      })
      .join('');
    const nome = nomeNoIdioma(nomeEn, idioma());
    return `
      <div class="flutuante cola-colunas">
        <p class="cola-colunas-nome"><code class="cola-codigo">${escapar(nome)}</code></p>
        <p class="cola-colunas-texto">${textoComSelos(emIdioma(tabela.descricao))}</p>
        <div class="cola-colunas-rolagem" tabindex="0" role="region" aria-label="${escapar(nome)}">
          <table class="cola-colunas-tabela">
            <thead><tr>
              <th scope="col">${escapar(t('cola.coluna'))}</th>
              <th scope="col">${escapar(t('cola.tipo'))}</th>
              <th scope="col">${escapar(t('cola.oQueE'))}</th>
              <th scope="col">${escapar(t('cola.ligacao'))}</th>
            </tr></thead>
            <tbody>${linhas}</tbody>
          </table>
        </div>
        <div class="cola-colunas-pe">${abrirNoLaboratorio(`SELECT * FROM ${nomeEn} LIMIT 10`)}</div>
      </div>`;
  }

  function secaoIndicadores() {
    const colunas = dicionario.country_year.colunas;
    const grupos = indicadores
      .map(({ tema, itens }) => sanfona({
        id: `cola-indicadores-${tema}`,
        rotulo: t(`cola.temas.${tema}`),
        quantos: itens.length,
        aberta: true,
        corpo: itens
          .map(({ coluna, codigo: codigoWdi, cuidado }) => linhaComPainel({
            id: `cola-indicador-${coluna}`,
            grade: 'cola-grade-indicadores',
            celulas: [
              `<code class="cola-codigo">${escapar(idioma() === 'pt' ? colunas[coluna].pt : coluna)}</code>${cuidado ? `<span class="cola-cuidado">${escapar(emIdioma(cuidado))}</span>` : ''}`,
              `<code class="cola-codigo cola-wdi">${escapar(codigoWdi)}</code>`,
            ],
            painel: escapar(emIdioma(colunas[coluna].descricao)),
            nomePainel: t('cola.oQueMede'),
          }))
          .join(''),
      }))
      .join('');
    return `
      <p class="cola-intro">${textoComSelos(t('cola.indicadoresTexto'))}</p>
      <p class="cola-ajuda">${escapar(t('cola.ajudaIndicadores'))}</p>
      <div class="cola-cabeca cola-grade-indicadores" aria-hidden="true">
        <span>${escapar(t('cola.indicador'))}</span><span>${escapar(t('cola.codigoBanco'))}</span>
      </div>
      <div class="cola-sanfonas">${grupos}</div>`;
  }

  /**
   * "Em outros bancos": três cards com a MESMA consulta nos três dialetos (o
   * destaque) e, atrás do "Exibir mais", um painel com as outras diferenças
   * numa tabela Pedido | DuckDB | Oracle | BigQuery. A sintaxe antiga do
   * Oracle fica fora do card dele (embaixo) e, no painel, na célula dele.
   */
  function secaoOutrosBancos() {
    const bancos = [t('cola.esteSite'), 'Oracle', 'BigQuery'];
    const antigo = (sql) => `<p class="cola-banco-antigo">${escapar(t('cola.antigo'))} <code class="selo">${realcarSQL(sql)}</code></p>`;
    const { duckdb, oracle, oracleAntigo, bigquery } = destaqueOutrosBancos;
    const card = (banco, sql, embaixo = '') => `
      <div class="cola-card">
        <p class="cola-card-banco">${escapar(banco)}</p>
        <pre class="bloco-codigo mono">${realcarSQL(sql)}</pre>
        ${embaixo}
      </div>`;
    const celula = (banco, sql, sqlAntigo) => `
      <td>
        <span class="cola-banco-nome">${escapar(banco)}</span>
        <pre class="bloco-codigo mono">${realcarSQL(sql)}</pre>
        ${sqlAntigo ? antigo(sqlAntigo) : ''}
      </td>`;
    return `
      <p class="cola-intro">${escapar(t('cola.outrosTexto'))}</p>
      <div class="cola-cards">
        ${card(bancos[0], sqlNoIdioma(duckdb, idioma()))}
        ${card(bancos[1], sqlNoIdioma(oracle, idioma()), antigo(oracleAntigo))}
        ${card(bancos[2], emIdioma(bigquery))}
      </div>
      <div class="cola-mais-ancora">
        <button type="button" class="botao-link cola-exibir-mais" aria-expanded="false" aria-controls="cola-mais">${escapar(t('cola.exibirMais'))}</button>
        <div class="flutuante flutuante--largo cola-mais" id="cola-mais" role="dialog" aria-label="${escapar(t('cola.secoes.outrosBancos'))}" hidden>
          <button type="button" class="botao-icone cola-mais-fechar" aria-label="${escapar(t('cola.fechar'))}" title="${escapar(t('cola.fechar'))}">
            <svg aria-hidden="true"><use href="#icone-fechar"></use></svg>
          </button>
          <div class="flutuante-rolagem">
            <table class="cola-bancos">
              <colgroup><col class="cola-bancos-pedido"><col><col><col></colgroup>
              <thead><tr>
                <th scope="col">${escapar(t('cola.pedido'))}</th>
                ${bancos.map((banco) => `<th scope="col">${escapar(banco)}</th>`).join('')}
              </tr></thead>
              <tbody>${outrosBancos
                .map((pedido) => `
                  <tr>
                    <th scope="row">${escapar(emIdioma(pedido.tema))}</th>
                    ${celula(bancos[0], pedido.duckdb)}
                    ${celula(bancos[1], pedido.oracle, pedido.oracleAntigo)}
                    ${celula(bancos[2], pedido.bigquery)}
                  </tr>`)
                .join('')}</tbody>
            </table>
          </div>
        </div>
      </div>`;
  }

  /** O glossário: o termo do idioma da tela primeiro, e a ordem dele. */
  function secaoGlossario() {
    const ativo = idioma() === 'pt' ? 'pt' : 'en';
    const outro = ativo === 'pt' ? 'en' : 'pt';
    const pares = [...glossario].sort((a, b) => a[ativo].localeCompare(b[ativo], ativo));
    return `
      <dl class="cola-glossario">${pares
        .map((par) => `<div class="cola-par"><dt lang="${ativo}">${escapar(par[ativo])}</dt><dd lang="${outro}">${escapar(par[outro])}</dd></div>`)
        .join('')}</dl>`;
  }

  /* ------------------------------------------------------------------------
     A página
     ------------------------------------------------------------------------ */

  const conteudo = {
    sintaxe: secaoSintaxe,
    funcoes: secaoFuncoes,
    tabelas: secaoTabelas,
    indicadores: secaoIndicadores,
    outrosBancos: secaoOutrosBancos,
    glossario: secaoGlossario,
  };

  function desenhar() {
    raiz.innerHTML = `
      <div class="cola">
        <h1 class="cola-titulo">${escapar(t('cola.titulo'))}</h1>
        <p class="cola-subtitulo">${escapar(t('cola.subtitulo'))}</p>
        <nav class="cola-indice" aria-label="${escapar(t('cola.indice'))}">
          ${SECOES.map((id) => `<button type="button" data-ir="${id}">${escapar(t(`cola.secoes.${id}`))}</button>`).join('')}
        </nav>
        ${SECOES.map((id) => `
          <section class="cola-secao" id="cola-${id}" aria-labelledby="cola-${id}-titulo">
            <h2 class="cola-secao-titulo" id="cola-${id}-titulo" tabindex="-1">${escapar(t(`cola.secoes.${id}`))}</h2>
            <div class="cola-secao-corpo" data-secao="${id}">${conteudo[id]()}</div>
          </section>`).join('')}
      </div>`;
    definirContexto(t('cola.titulo'));
    document.title = `${t('cola.titulo')} · meridiano.`;
    marcarSecaoAtual();

    // O painel do "Exibir mais" nasce de novo a cada desenho (a troca de
    // idioma redesenha a tela): desliga o antigo e liga o novo.
    desligarMais?.();
    desligarMais = ligarPainelFixavel({
      gatilho: raiz.querySelector('.cola-exibir-mais'),
      painel: raiz.querySelector('.cola-mais'),
      botaoFechar: raiz.querySelector('.cola-mais-fechar'),
    });
  }

  function redesenharTabelas() {
    raiz.querySelector('[data-secao="tabelas"]').innerHTML = secaoTabelas();
  }

  /* ------------------------------------------------------------------------
     O índice acompanha a seção visível
     ------------------------------------------------------------------------ */

  function marcarSecaoAtual() {
    const indice = raiz.querySelector('.cola-indice');
    if (!indice) return;
    const base = indice.getBoundingClientRect().bottom + 24;
    const noFim = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
    let atual = SECOES[0];
    for (const id of SECOES) {
      if (raiz.querySelector(`#cola-${id}`).getBoundingClientRect().top <= base) atual = id;
    }
    if (noFim) atual = SECOES[SECOES.length - 1];
    for (const botao of indice.querySelectorAll('[data-ir]')) {
      if (botao.dataset.ir === atual) botao.setAttribute('aria-current', 'true');
      else botao.removeAttribute('aria-current');
    }
  }

  /* ------------------------------------------------------------------------
     Eventos (delegados: a tela é redesenhada na troca de idioma)
     ------------------------------------------------------------------------ */

  raiz.addEventListener('click', (evento) => {
    const ir = evento.target.closest('[data-ir]');
    if (ir) {
      const secao = raiz.querySelector(`#cola-${ir.dataset.ir}`);
      secao?.scrollIntoView({ behavior: semMovimento() ? 'auto' : 'smooth', block: 'start' });
      secao?.querySelector('h2')?.focus?.({ preventScroll: true });
      return;
    }
    const gatilho = evento.target.closest('[data-sanfona]');
    if (gatilho) {
      const id = gatilho.dataset.sanfona;
      const aberta = !abertas.get(id);
      abertas.set(id, aberta);
      gatilho.setAttribute('aria-expanded', String(aberta));
      raiz.querySelector(`#${id}`).hidden = !aberta;
      marcarSecaoAtual();
      return;
    }
    const tabela = evento.target.closest('[data-tabela]');
    if (tabela) {
      selecionada = selecionada === tabela.dataset.tabela ? null : tabela.dataset.tabela;
      redesenharTabelas();
      raiz.querySelector(`[data-tabela="${tabela.dataset.tabela}"]`)?.focus();
    }
  });

  raiz.addEventListener('change', (evento) => {
    if (!evento.target.matches('.cola-origem')) return;
    origem = evento.target.value;
    selecionada = null;
    redesenharTabelas();
    raiz.querySelector('.cola-origem')?.focus();
  });

  const desligarPaineis = ligarLinhasComPainel(raiz);
  window.addEventListener('scroll', marcarSecaoAtual, { passive: true });
  window.addEventListener('resize', marcarSecaoAtual);

  desenhar();
  document.addEventListener('idioma-mudou', desenhar);

  return () => {
    desligarPaineis();
    desligarMais?.();
    window.removeEventListener('scroll', marcarSecaoAtual);
    window.removeEventListener('resize', marcarSecaoAtual);
    document.removeEventListener('idioma-mudou', desenhar);
    document.title = t('documento.titulo');
  };
}
