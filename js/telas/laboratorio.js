/* ==========================================================================
   telas/laboratorio.js — o laboratório: a base inteira, para consultas
   livres (passo 17).

   Duas colunas, na moldura de tela cheia da missão:
     à esquerda, três abas — Tabelas (as da base, as importadas e as criadas
       aqui, com as colunas; um clique escreve o nome no editor), Histórico
       (as 50 últimas consultas) e Favoritas;
     à direita, a bancada: a Consulta (favoritar, copiar o link, formatar,
       rodar) e o Resultado (copiar como tabela, baixar CSV, formato).

   A base NÃO é zerada ao entrar: é um lugar para experimentar, e o que se
   cria aqui fica até a pessoa pedir "Zerar a base" (ou entrar numa missão,
   que zera a base dela). Um CSV importado vira tabela só nesta visita; ele
   é recriado sozinho quando a base volta zerada (troca de idioma, missão).

   O link com a consulta ("#/laboratorio?sql=…") leva a consulta em inglês,
   para abrir certo em qualquer idioma (ou, com "&de=pt", em português — é
   o que a cola usa); uma consulta de leitura (SELECT, WITH) que chega por
   link já roda.
   ========================================================================== */

import { t, idioma } from '../i18n.js';
import { abrirBase, baseAberta, zerarBase, consultar, idiomaDaBase, importarCsv, recriarImportada } from '../bd.js';
import { traduzirSQL, nomeNoIdioma } from '../traducao-sql.js';
import { escapar } from '../realce.js';
import { criarEditor, ATALHO_RODAR, ATALHO_FORMATAR } from '../editor.js';
import { desenharResultado, desenharErro, MAX_LINHAS } from '../tabela-resultado.js';
import { traduzirErro } from '../erros-sql.js';
import { definirConfig } from '../estado.js';
import { definirContexto } from '../cabecalho.js';
import { mostrarAbrindo } from './abrindo.js';
import { dicionario } from '../../dados/base/dicionario.js';
import {
  historico, favoritas, ultimaConsulta, guardarNoHistorico, ehFavorita, alternarFavorita, guardarUltima,
  formatoCsv, paraCsv, paraTabelaColavel, baixarArquivo, nomeParaTabela, lerTextoDoArquivo,
} from '../laboratorio-dados.js';

/** Quantas linhas uma consulta traz do motor, no máximo (para o CSV). */
const LIMITE_DO_MOTOR = 100000;

/** O maior CSV aceito, em bytes. */
const MAIOR_CSV = 50 * 1024 * 1024;

/** As tabelas importadas nesta visita (sobrevivem à troca de tela). */
const importadas = new Set();

/**
 * @param {HTMLElement} tela
 * @param {string} [consultaDoEndereco]  o que vem depois do "?" no endereço
 * @returns {Promise<() => void>}
 */
export async function mostrarLaboratorio(tela, consultaDoEndereco = '') {
  if (!baseAberta()) {
    const abrindo = mostrarAbrindo({ aoTentarDeNovo: () => mostrarLaboratorio(tela, consultaDoEndereco) });
    try {
      await abrirBase({ aoProgredir: abrindo.progredir });
      abrindo.fechar();
    } catch (erro) {
      abrindo.falhar(erro);
      return undefined;
    }
  }
  for (const nome of importadas) await recriarImportada(nome);

  document.body.dataset.tela = 'laboratorio';

  let aba = 'tabelas';
  let ultimoResultado = null;     // o resultado inteiro, para copiar e baixar
  let confirmandoZerar = false;
  let recado = 0;                 // o temporizador do recado da barra

  tela.innerHTML = `
    <div class="laboratorio">
      <h1 class="apenas-leitor-de-tela">${escapar(t('laboratorio.titulo'))}</h1>
      <p class="missao-aviso-celular">${escapar(t('laboratorio.avisoCelular'))}</p>
      <div class="laboratorio-corpo">
        <aside class="laboratorio-lado">
          <div class="laboratorio-abas" role="tablist"></div>
          <div class="laboratorio-lista" role="tabpanel"></div>
        </aside>
        <section class="laboratorio-bancada painel">
          <div class="painel-barra painel-barra--consulta">
            <span class="painel-aba" data-i18n="missao.abas.consulta">${escapar(t('missao.abas.consulta'))}</span>
            <span class="painel-espaco"></span>
            <span class="painel-info laboratorio-recado" role="status"></span>
            <button type="button" class="botao-icone botao-icone--pequeno laboratorio-favorita" aria-pressed="false">
              <svg aria-hidden="true"><use href="#icone-estrela"></use></svg>
            </button>
            <button type="button" class="botao-icone botao-icone--pequeno laboratorio-link">
              <svg aria-hidden="true"><use href="#icone-link"></use></svg>
            </button>
            <button type="button" class="botao-icone botao-icone--pequeno laboratorio-formatar">
              <svg aria-hidden="true"><use href="#icone-formatar"></use></svg>
            </button>
            <button type="button" class="botao botao--pequeno botao--principal laboratorio-rodar" data-i18n="editor.rodar">${escapar(t('editor.rodar'))}</button>
          </div>
          <div class="laboratorio-editor"></div>
          <div class="painel-barra">
            <span class="painel-aba" data-i18n="missao.abas.resultado">${escapar(t('missao.abas.resultado'))}</span>
            <span class="painel-espaco"></span>
            <span class="painel-info laboratorio-info"></span>
            <button type="button" class="botao-link laboratorio-copiar" disabled></button>
            <button type="button" class="botao-link laboratorio-baixar" disabled></button>
            <select class="laboratorio-formato"></select>
          </div>
          <div class="painel-rolagem missao-saida laboratorio-saida" aria-live="polite"></div>
        </section>
      </div>
    </div>`;

  const el = {
    abas: tela.querySelector('.laboratorio-abas'),
    lista: tela.querySelector('.laboratorio-lista'),
    recado: tela.querySelector('.laboratorio-recado'),
    favorita: tela.querySelector('.laboratorio-favorita'),
    link: tela.querySelector('.laboratorio-link'),
    formatar: tela.querySelector('.laboratorio-formatar'),
    rodar: tela.querySelector('.laboratorio-rodar'),
    info: tela.querySelector('.laboratorio-info'),
    copiar: tela.querySelector('.laboratorio-copiar'),
    baixar: tela.querySelector('.laboratorio-baixar'),
    formato: tela.querySelector('.laboratorio-formato'),
    saida: tela.querySelector('.laboratorio-saida'),
  };

  /* ------------------------------------------------------------------------
     Consultas: em inglês para guardar, no idioma da tela para mostrar
     ------------------------------------------------------------------------ */

  const paraIngles = (sql) => (idioma() === 'en' ? sql : traduzirSQL(sql, idioma(), 'en'));
  const paraTela = (sqlEn) => (idioma() === 'en' ? sqlEn : traduzirSQL(sqlEn, 'en', idioma()));
  const soLeitura = (sql) => /^\s*(--[^\n]*\n\s*)*(select|with|from)\b/i.test(sql);

  /* ------------------------------------------------------------------------
     O editor e o Rodar
     ------------------------------------------------------------------------ */

  const editor = criarEditor(tela.querySelector('.laboratorio-editor'), {
    inicial: paraTela(ultimaConsulta()),
    aoRodar: rodar,
    linhasMin: 6,
    linhasMax: 14,
  });

  async function rodar(sql) {
    if (!sql.trim()) return;
    try {
      const resultado = await consultar(sql, { maxLinhas: LIMITE_DO_MOTOR });
      ultimoResultado = resultado.colunas.length ? resultado : null;
      el.info.textContent = desenharResultado(el.saida, { ...resultado, linhas: resultado.linhas.slice(0, MAX_LINHAS) });
      guardarNoHistorico(paraIngles(sql));
      // CREATE, DROP, uma tabela nova: a lista de tabelas muda junto.
      if (aba !== 'favoritas') await desenharLista();
    } catch (erro) {
      ultimoResultado = null;
      el.info.textContent = '';
      const traduzido = traduzirErro(erro.message, { sql, idiomaDaBase: idiomaDaBase() });
      desenharErro(el.saida, traduzido);
      if (traduzido.linha) editor.marcarErro(traduzido.linha);
    }
    atualizarBotoes();
  }

  el.rodar.addEventListener('click', () => editor.rodar());
  el.formatar.addEventListener('click', () => {
    editor.formatar();
    editor.focar();
  });

  /* ------------------------------------------------------------------------
     A barra: favorita, link, copiar, baixar, formato
     ------------------------------------------------------------------------ */

  function dizer(texto) {
    el.recado.textContent = texto;
    clearTimeout(recado);
    recado = setTimeout(() => { el.recado.textContent = ''; }, 3500);
  }

  function atualizarBotoes() {
    const favorita = ehFavorita(paraIngles(editor.valor()));
    el.favorita.setAttribute('aria-pressed', String(favorita));
    const rotuloFavorita = t(favorita ? 'laboratorio.desfavoritar' : 'laboratorio.favoritar');
    el.favorita.title = rotuloFavorita;
    el.favorita.setAttribute('aria-label', rotuloFavorita);
    el.link.title = t('laboratorio.link');
    el.link.setAttribute('aria-label', t('laboratorio.link'));
    const formatar = t('editor.formatarTitulo', { atalho: ATALHO_FORMATAR });
    el.formatar.title = formatar;
    el.formatar.setAttribute('aria-label', formatar);
    el.rodar.title = t('editor.rodarTitulo', { atalho: ATALHO_RODAR });

    el.copiar.textContent = t('laboratorio.copiar');
    el.copiar.title = t('laboratorio.copiarTitulo');
    el.baixar.textContent = t('laboratorio.baixar');
    el.copiar.disabled = !ultimoResultado;
    el.baixar.disabled = !ultimoResultado;

    el.formato.setAttribute('aria-label', t('laboratorio.formato'));
    el.formato.innerHTML = ['br', 'internacional']
      .map((f) => `<option value="${f}" ${f === formatoCsv() ? 'selected' : ''}>${escapar(t(f === 'br' ? 'laboratorio.formatoBr' : 'laboratorio.formatoInt'))}</option>`)
      .join('');
  }

  el.favorita.addEventListener('click', async () => {
    const sql = editor.valor();
    if (!sql.trim()) return;
    const ficou = alternarFavorita(paraIngles(sql));
    dizer(t(ficou ? 'laboratorio.guardada' : 'laboratorio.tirada'));
    atualizarBotoes();
    if (aba === 'favoritas') await desenharLista();
  });

  el.link.addEventListener('click', async () => {
    const sql = editor.valor();
    if (!sql.trim()) return;
    const endereco = `${location.origin}${location.pathname}#/laboratorio?sql=${encodeURIComponent(paraIngles(sql))}`;
    try {
      await navigator.clipboard.writeText(endereco);
      dizer(t('laboratorio.linkCopiado'));
    } catch {
      dizer(t('laboratorio.semCopiar'));
    }
  });

  el.copiar.addEventListener('click', async () => {
    if (!ultimoResultado) return;
    try {
      await navigator.clipboard.writeText(paraTabelaColavel(ultimoResultado, formatoCsv()));
      dizer(t('laboratorio.copiado', { n: ultimoResultado.linhas.length }));
    } catch {
      dizer(t('laboratorio.semCopiar'));
    }
  });

  el.baixar.addEventListener('click', () => {
    if (!ultimoResultado) return;
    const agora = new Date();
    const carimbo = `${agora.getFullYear()}${String(agora.getMonth() + 1).padStart(2, '0')}${String(agora.getDate()).padStart(2, '0')}-${String(agora.getHours()).padStart(2, '0')}${String(agora.getMinutes()).padStart(2, '0')}`;
    baixarArquivo(`meridiano-${carimbo}.csv`, paraCsv(ultimoResultado, formatoCsv()));
    dizer(ultimoResultado.total > ultimoResultado.linhas.length
      ? t('laboratorio.baixadoCortado', { n: ultimoResultado.linhas.length })
      : t('laboratorio.baixado'));
  });

  el.formato.addEventListener('change', () => definirConfig({ formatoCsv: el.formato.value }));

  /* ------------------------------------------------------------------------
     O lado: Tabelas, Histórico, Favoritas
     ------------------------------------------------------------------------ */

  function desenharAbas() {
    el.abas.innerHTML = ['tabelas', 'historico', 'favoritas']
      .map((id) => `<button type="button" class="painel-aba" role="tab" data-aba="${id}" aria-selected="${id === aba}">${escapar(t(`laboratorio.abas.${id}`))}</button>`)
      .join('');
  }

  el.abas.addEventListener('click', async (evento) => {
    const botao = evento.target.closest('[data-aba]');
    if (!botao) return;
    aba = botao.dataset.aba;
    confirmandoZerar = false;
    desenharAbas();
    await desenharLista();
  });

  async function desenharLista() {
    if (aba === 'tabelas') el.lista.innerHTML = await listaDeTabelas();
    else el.lista.innerHTML = listaDeConsultas(aba === 'historico' ? historico() : favoritas(), aba);
  }

  /** As tabelas que existem agora no banco, com as colunas (do próprio motor). */
  async function listaDeTabelas() {
    let linhas = [];
    try {
      linhas = (await consultar(
        'SELECT table_name, column_name, data_type FROM duckdb_columns() ' +
        'WHERE database_name = current_database() AND schema_name = \'main\' ORDER BY table_name, column_index'
      )).linhas;
    } catch {
      linhas = [];
    }
    const porTabela = new Map();
    for (const [tabela, coluna, tipo] of linhas) {
      if (!porTabela.has(tabela)) porTabela.set(tabela, []);
      porTabela.get(tabela).push({ coluna, tipo });
    }

    // A base primeiro, na ordem do dicionário; depois as importadas e as criadas aqui.
    const daBase = Object.keys(dicionario).map((en) => nomeNoIdioma(en, idioma())).filter((n) => porTabela.has(n));
    const outras = [...porTabela.keys()].filter((n) => !daBase.includes(n)).sort();

    const item = (nome) => {
      const origem = daBase.includes(nome) ? '' : importadas.has(nome) ? 'laboratorio.importada' : 'laboratorio.criadaAqui';
      const colunas = porTabela.get(nome)
        .map(({ coluna, tipo }) => `<li><button type="button" class="laboratorio-inserir" data-texto="${escapar(coluna)}" title="${escapar(tipo)}">${escapar(coluna)}</button></li>`)
        .join('');
      return `
        <li class="laboratorio-tabela">
          <details>
            <summary><span class="laboratorio-tabela-nome">${escapar(nome)}</span>${origem ? ` <span class="laboratorio-etiqueta">${escapar(t(origem))}</span>` : ''}</summary>
            <p class="laboratorio-tabela-acoes">
              <button type="button" class="botao-link laboratorio-inserir" data-texto="${escapar(nome)}">${escapar(t('laboratorio.usarTabela'))}</button>
              <button type="button" class="botao-link laboratorio-ver" data-tabela="${escapar(nome)}"
                title="${escapar(t('missao.dicaPrevia'))}">${escapar(t('missao.botaoPrevia'))}</button>
            </p>
            <ul class="laboratorio-colunas">${colunas}</ul>
          </details>
        </li>`;
    };

    return `
      <p class="laboratorio-importar">
        <button type="button" class="botao-link laboratorio-importar-botao">${escapar(t('laboratorio.importar'))}</button>
        <input type="file" accept=".csv,text/csv,text/plain" hidden class="laboratorio-arquivo">
      </p>
      <ul class="laboratorio-tabelas">${[...daBase, ...outras].map(item).join('')}</ul>
      <p class="laboratorio-zerar">
        <button type="button" class="botao-link laboratorio-zerar-botao">${escapar(t(confirmandoZerar ? 'laboratorio.zerarConfirma' : 'laboratorio.zerar'))}</button>
      </p>`;
  }

  /** O histórico ou as favoritas: cada consulta, clicável, no idioma da tela. */
  function listaDeConsultas(itens, qual) {
    if (!itens.length) {
      return `<p class="laboratorio-vazio">${escapar(t(qual === 'historico' ? 'laboratorio.historicoVazio' : 'laboratorio.favoritasVazio'))}</p>`;
    }
    const quando = (em) => new Date(em).toLocaleString(idioma() === 'pt' ? 'pt-BR' : 'en-GB', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
    return `<ul class="laboratorio-consultas">${itens
      .map(({ sql, em }, i) => `
        <li>
          <button type="button" class="laboratorio-consulta" data-indice="${i}" title="${escapar(paraTela(sql))}">
            <span class="laboratorio-consulta-sql">${escapar(paraTela(sql).replace(/\s+/g, ' '))}</span>
            <span class="laboratorio-consulta-quando">${escapar(quando(em))}</span>
          </button>
          ${qual === 'favoritas' ? `<button type="button" class="botao-link laboratorio-remover" data-indice="${i}" aria-label="${escapar(t('laboratorio.remover'))}">×</button>` : ''}
        </li>`)
      .join('')}</ul>`;
  }

  // Um ouvinte só para a lista inteira (ela é redesenhada o tempo todo).
  el.lista.addEventListener('click', async (evento) => {
    const alvo = evento.target;
    const inserir = alvo.closest('.laboratorio-inserir');
    if (inserir) {
      editor.inserirTexto(inserir.dataset.texto);
      return;
    }
    const ver = alvo.closest('.laboratorio-ver');
    if (ver) {
      await rodar(`SELECT * FROM "${ver.dataset.tabela}" LIMIT 5`);
      return;
    }
    if (alvo.closest('.laboratorio-importar-botao')) {
      el.lista.querySelector('.laboratorio-arquivo').click();
      return;
    }
    if (alvo.closest('.laboratorio-zerar-botao')) {
      if (!confirmandoZerar) {
        confirmandoZerar = true;
      } else {
        confirmandoZerar = false;
        await zerarBase(idioma());
        for (const nome of importadas) await recriarImportada(nome);
        dizer(t('laboratorio.zerada'));
      }
      await desenharLista();
      return;
    }
    const consulta = alvo.closest('.laboratorio-consulta');
    if (consulta) {
      const itens = aba === 'historico' ? historico() : favoritas();
      const escolhida = itens[Number(consulta.dataset.indice)];
      if (escolhida) {
        editor.definirValor(paraTela(escolhida.sql));
        editor.focar();
        atualizarBotoes();
      }
      return;
    }
    const remover = alvo.closest('.laboratorio-remover');
    if (remover) {
      const escolhida = favoritas()[Number(remover.dataset.indice)];
      if (escolhida) alternarFavorita(escolhida.sql);
      atualizarBotoes();
      await desenharLista();
    }
  });

  // Importar um CSV: vira tabela com o nome do arquivo.
  el.lista.addEventListener('change', async (evento) => {
    const campo = evento.target.closest('.laboratorio-arquivo');
    const arquivo = campo?.files?.[0];
    if (!arquivo) return;
    if (arquivo.size > MAIOR_CSV) {
      dizer(t('laboratorio.grandeDemais'));
      return;
    }
    const ocupados = new Set(Object.entries(dicionario).flatMap(([en, tabela]) => [en, tabela.pt]));
    const nome = nomeParaTabela(arquivo.name, ocupados);
    try {
      await importarCsv(nome, await lerTextoDoArquivo(arquivo));
      importadas.add(nome);
      const { linhas } = await consultar(`SELECT count(*) FROM "${nome}"`);
      el.saida.innerHTML = `<p class="tabela-aviso">${escapar(t('laboratorio.importado', { nome, n: Number(linhas[0][0]) }))}</p>`;
      el.info.textContent = '';
      editor.definirValor(`SELECT * FROM ${nome} LIMIT 10`);
      await desenharLista();
    } catch (erro) {
      console.warn('[laboratório] CSV não importado:', erro);
      el.saida.innerHTML = `<p class="tabela-aviso">${escapar(t('laboratorio.importarErro', { arquivo: arquivo.name }))}</p>`;
    }
    campo.value = '';
  });

  /* ------------------------------------------------------------------------
     Idioma, base recarregada e a saída da tela
     ------------------------------------------------------------------------ */

  function aoMudarIdioma() {
    desenharAbas();
    atualizarBotoes();
    tela.querySelector('.missao-aviso-celular').textContent = t('laboratorio.avisoCelular');
    definirContexto(t('laboratorio.titulo'));
    document.title = `${t('laboratorio.titulo')} · meridiano.`;
  }

  async function aoRecarregarBase() {
    for (const nome of importadas) await recriarImportada(nome);
    await desenharLista();
    // O editor já traduziu a consulta; uma de leitura roda de novo, com os nomes novos.
    if (ultimoResultado && soLeitura(editor.valor())) await rodar(editor.valor());
  }

  // Guardar a consulta do editor a cada pausa na digitação (e ao sair).
  let guardando = 0;
  tela.querySelector('.editor-texto').addEventListener('input', () => {
    clearTimeout(guardando);
    guardando = setTimeout(() => {
      guardarUltima(paraIngles(editor.valor()));
      atualizarBotoes();
    }, 600);
  });

  document.addEventListener('idioma-mudou', aoMudarIdioma);
  document.addEventListener('base-recarregada', aoRecarregarBase);

  definirContexto(t('laboratorio.titulo'));
  document.title = `${t('laboratorio.titulo')} · meridiano.`;
  desenharAbas();
  atualizarBotoes();
  await desenharLista();

  // Uma consulta que chegou pelo link: entra no editor (e roda, se for de leitura).
  // O link diz em que idioma ela está ("de"; sem ele, inglês): a cola manda
  // a consulta no idioma da tela, com os apelidos já traduzidos.
  const parametros = new URLSearchParams(consultaDoEndereco);
  const sqlDoLink = parametros.get('sql');
  const idiomaDoLink = parametros.get('de') === 'pt' ? 'pt' : 'en';
  if (sqlDoLink) {
    editor.definirValor(idiomaDoLink === idioma() ? sqlDoLink : traduzirSQL(sqlDoLink, idiomaDoLink, idioma()));
    history.replaceState(null, '', '#/laboratorio');
    if (soLeitura(sqlDoLink)) await rodar(editor.valor());
  } else if (!editor.valor().trim()) {
    el.saida.innerHTML = `<p class="tabela-aviso">${escapar(t('laboratorio.comece', { atalho: ATALHO_RODAR }))}</p>`;
  }

  return () => {
    clearTimeout(guardando);
    clearTimeout(recado);
    guardarUltima(paraIngles(editor.valor()));
    document.removeEventListener('idioma-mudou', aoMudarIdioma);
    document.removeEventListener('base-recarregada', aoRecarregarBase);
    editor.destruir();
    delete document.body.dataset.tela;
    document.title = t('documento.titulo');
  };
}
