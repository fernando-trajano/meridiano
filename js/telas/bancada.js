/* ==========================================================================
   telas/bancada.js — PROVISÓRIO (passo 5): a bancada de teste do motor.

   Uma caixa de texto com uma consulta, um botão "Rodar" e o resultado numa
   tabela simples. Existe para provar, no navegador de verdade (Safari
   incluído), que o motor abre, que a base carrega nos dois idiomas e que a
   consulta do editor acompanha a troca de idioma.

   Sai no passo 7, quando chegam o editor, a tabela de resultado e os erros
   traduzidos.
   ========================================================================== */

import { t, idioma } from '../i18n.js';
import { abrirBase, baseAberta, consultar, medicoes } from '../bd.js';
import { traduzirSQL } from '../traducao-sql.js';
import { mostrarAbrindo } from './abrindo.js';

// A consulta de exemplo, escrita uma vez em inglês — como os gabaritos.
const EXEMPLO = `-- The 5 most populous countries in 2023 (aggregates left out)
SELECT country_name, population
FROM countries
JOIN country_year ON country_year.country_code = countries.country_code
WHERE year = 2023 AND region_code IS NOT NULL
ORDER BY population DESC
LIMIT 5;`;

const MAX_LINHAS = 50;

export function ligarBancada() {
  const secao = document.querySelector('#bancada');
  if (!secao) return;

  const caixa = secao.querySelector('#bancada-sql');
  const botao = secao.querySelector('#bancada-rodar');
  const saida = secao.querySelector('#bancada-resultado');

  // Em que idioma está o texto da caixa agora — para traduzir ao trocar.
  let idiomaDoTexto = idioma();
  caixa.value = traduzirSQL(EXEMPLO, 'en', idiomaDoTexto);

  document.addEventListener('idioma-mudou', (evento) => {
    caixa.value = traduzirSQL(caixa.value, idiomaDoTexto, evento.detail.idioma);
    idiomaDoTexto = evento.detail.idioma;
  });

  async function rodar() {
    botao.disabled = true;
    try {
      if (!baseAberta()) {
        const tela = mostrarAbrindo({ aoTentarDeNovo: rodar });
        try {
          await abrirBase({ aoProgredir: tela.progredir });
          tela.fechar();
          console.info('[bd] medições da abertura:', { ...medicoes });
        } catch (erro) {
          tela.falhar(erro);
          return;
        }
      }
      const resultado = await consultar(caixa.value, { maxLinhas: MAX_LINHAS });
      desenharResultado(saida, resultado);
    } catch (erro) {
      // A frase simples, com pista, é o erros-sql.js (passo 7). Aqui, o erro cru.
      saida.innerHTML = '';
      const aviso = document.createElement('p');
      aviso.className = 'aviso-erro mono';
      aviso.textContent = erro.message;
      saida.append(aviso);
    } finally {
      botao.disabled = false;
    }
  }

  botao.addEventListener('click', rodar);
  caixa.addEventListener('keydown', (evento) => {
    if (evento.key === 'Enter' && (evento.metaKey || evento.ctrlKey)) {
      evento.preventDefault();
      rodar();
    }
  });
}

/** A tabela de resultado, simples: números à direita, NULL discreto. */
function desenharResultado(saida, { colunas, linhas, total, ms }) {
  const tabela = document.createElement('table');
  tabela.className = 'tabela-resultado mono';

  const cabeca = tabela.createTHead().insertRow();
  for (const coluna of colunas) {
    const th = document.createElement('th');
    th.textContent = coluna.nome;
    if (coluna.tipo === 'numero') th.className = 'numero';
    cabeca.append(th);
  }

  const corpo = tabela.createTBody();
  for (const linha of linhas) {
    const tr = corpo.insertRow();
    linha.forEach((valor, j) => {
      const td = tr.insertCell();
      if (valor === null) {
        td.textContent = 'NULL';
        td.className = 'nulo';
      } else {
        td.textContent = String(valor);
        if (colunas[j].tipo === 'numero') td.className = 'numero';
      }
    });
  }

  const info = document.createElement('p');
  info.className = 'discreto';
  info.textContent =
    total > linhas.length
      ? t('bancada.infoCortada', { total, linhas: linhas.length, ms })
      : t('bancada.info', { linhas: total, ms });

  saida.replaceChildren(info, tabela);
}
