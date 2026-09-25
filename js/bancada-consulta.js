/* ==========================================================================
   bancada-consulta.js — a bancada de um desafio: Consulta e Resultado.

   A mesma para a missão (tente você, sem ajuda, desafios) e o nivelamento:

     [Consulta]  ···  tabela paises  [Formatar]  [Rodar]
     o editor
     [Resultado]  ···  60 linhas · 4 ms
     o veredito da conferência e a tabela (ou o erro, ou a prévia)

   Quem usa diz o desafio e o que fazer com o veredito; a bancada cuida do
   resto: rodar, conferir pelo resultado, traduzir o erro, marcar a linha
   dele no editor, a lista de colunas e a "Prévia" (as 5 primeiras linhas).
   ========================================================================== */

import { t, idioma } from './i18n.js';
import { consultar, idiomaDaBase } from './bd.js';
import { nomeNoIdioma, tabelasDoSQL } from './traducao-sql.js';
import { escapar } from './realce.js';
import { criarEditor, ATALHO_RODAR, ATALHO_FORMATAR } from './editor.js';
import { desenharResultado, desenharErro, MAX_LINHAS } from './tabela-resultado.js';
import { traduzirErro } from './erros-sql.js';
import { conferirResposta } from './conferir.js';
import { criarTabelasDaBarra } from './tabelas-da-barra.js';

/** Quantas linhas a prévia de uma tabela mostra. */
const LINHAS_DA_PREVIA = 5;

/**
 * Monta a bancada dentro de um painel.
 * @param {HTMLElement} alvo  o painel (.painel)
 * @param {{desafio: {gabarito: string, tabelas?: string[], conferir?: object, exige?: string[]},
 *          inicial?: string, principal?: boolean,
 *          aoRodar?: (sql: string) => void,
 *          aoVeredito?: (veredito: {certo: boolean}, sql: string) => void}} opcoes
 *   principal: o Rodar é o botão principal da tela (deixa de ser quando o
 *   desafio fica resolvido — ver rebaixarRodar)
 * @returns {{editor: object, rodar: (sql: string) => Promise<void>,
 *            rebaixarRodar: () => void, destruir: () => void}}
 */
export function criarBancadaDeConsulta(alvo, { desafio, inicial = '', principal = true, aoRodar = () => {}, aoVeredito = () => {} }) {
  alvo.innerHTML = `
    <div class="painel-barra painel-barra--consulta">
      <span class="painel-aba" data-i18n="missao.abas.consulta">${escapar(t('missao.abas.consulta'))}</span>
      <span class="painel-espaco"></span>
      <span class="bancada-tabelas"></span>
      <button type="button" class="botao-icone botao-icone--pequeno bancada-formatar">
        <svg aria-hidden="true"><use href="#icone-formatar"></use></svg>
      </button>
      <button type="button" class="botao botao--pequeno bancada-rodar ${principal ? 'botao--principal' : ''}"
        data-i18n="editor.rodar">${escapar(t('editor.rodar'))}</button>
    </div>
    <div class="missao-editor"></div>
    <div class="painel-barra">
      <span class="painel-aba" data-i18n="missao.abas.resultado">${escapar(t('missao.abas.resultado'))}</span>
      <span class="painel-espaco"></span>
      <span class="painel-info bancada-info"></span>
    </div>
    <div class="painel-rolagem missao-saida" aria-live="polite">
      <p class="tabela-aviso" data-i18n="missao.resultadoVazio">${escapar(t('missao.resultadoVazio'))}</p>
    </div>`;

  const saida = alvo.querySelector('.missao-saida');
  const info = alvo.querySelector('.bancada-info');
  const botaoRodar = alvo.querySelector('.bancada-rodar');
  const botaoFormatar = alvo.querySelector('.bancada-formatar');

  // Os títulos dos botões, com o atalho de cada sistema (e no idioma da tela).
  function atualizarTitulos() {
    botaoRodar.title = t('editor.rodarTitulo', { atalho: ATALHO_RODAR });
    const formatar = t('editor.formatarTitulo', { atalho: ATALHO_FORMATAR });
    botaoFormatar.title = formatar;
    botaoFormatar.setAttribute('aria-label', formatar);
  }
  atualizarTitulos();
  document.addEventListener('idioma-mudou', atualizarTitulos);

  // As tabelas da tarefa, com a lista de colunas e a prévia.
  const tabelasDaBarra = criarTabelasDaBarra(alvo.querySelector('.bancada-tabelas'), {
    tabelas: desafio.tabelas ?? tabelasDoSQL(desafio.gabarito),
    aoMostrarPrevia: mostrarPrevia,
  });

  let editor = null;

  async function rodar(sql) {
    aoRodar(sql);
    try {
      // A conferência precisa do resultado INTEIRO; a tela mostra no máximo
      // MAX_LINHAS. (Antes, só as linhas mostradas eram conferidas, e uma
      // resposta certa com mais de 200 linhas parecia faltar linhas.)
      const resultado = await consultar(sql);
      info.textContent = desenharResultado(saida, { ...resultado, linhas: resultado.linhas.slice(0, MAX_LINHAS) });
      const veredito = await conferirResposta(resultado, sql, desafio);
      const linha = document.createElement('p');
      linha.className = veredito.certo ? 'conferencia-certa' : 'conferencia-errada';
      linha.innerHTML = veredito.mensagem;   // já com os selos (conferir.js)
      saida.prepend(linha);
      aoVeredito(veredito, sql);
    } catch (erro) {
      info.textContent = '';
      const traduzido = traduzirErro(erro.message, { sql, idiomaDaBase: idiomaDaBase() });
      desenharErro(saida, traduzido);
      if (traduzido.linha) editor?.marcarErro(traduzido.linha);
    }
  }

  /** A "Prévia" de uma tabela (as 5 primeiras linhas), na seção Resultado. */
  async function mostrarPrevia(tabelaEn) {
    const nome = nomeNoIdioma(tabelaEn, idioma());
    try {
      const [amostra, contagem] = await Promise.all([
        consultar(`SELECT * FROM ${nome} LIMIT ${LINHAS_DA_PREVIA}`, { maxLinhas: LINHAS_DA_PREVIA }),
        consultar(`SELECT count(*) FROM ${nome}`),
      ]);
      desenharResultado(saida, amostra);
      info.textContent = t('missao.previa', { nome, n: amostra.linhas.length, total: Number(contagem.linhas[0][0]) });
    } catch (erro) {
      desenharErro(saida, traduzirErro(erro.message, { sql: nome, idiomaDaBase: idiomaDaBase() }));
    }
  }

  editor = criarEditor(alvo.querySelector('.missao-editor'), { inicial, aoRodar: rodar });
  botaoRodar.addEventListener('click', () => editor.rodar());
  botaoFormatar.addEventListener('click', () => {
    editor.formatar();
    editor.focar();
  });

  return {
    editor,
    rodar,
    /** Resolvido: o botão principal da tela passa a ser o de seguir. */
    rebaixarRodar() {
      botaoRodar.classList.remove('botao--principal');
    },
    destruir() {
      document.removeEventListener('idioma-mudou', atualizarTitulos);
      tabelasDaBarra.destruir();
      editor.destruir();
    },
  };
}
