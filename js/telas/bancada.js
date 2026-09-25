/* ==========================================================================
   telas/bancada.js — PROVISÓRIO: a bancada de teste do motor.

   Passo 5: provou que o motor abre e a base carrega nos dois idiomas.
   Passo 7: passou a usar as peças de verdade — o editor, a tabela de
   resultado e os erros traduzidos —, para testá-las no Safari antes de
   existir a tela de missão.

   Sai no passo 12, quando a tela de missão chegar.
   ========================================================================== */

import { idioma } from '../i18n.js';
import { abrirBase, baseAberta, consultar, idiomaDaBase, medicoes } from '../bd.js';
import { traduzirSQL } from '../traducao-sql.js';
import { criarEditor } from '../editor.js';
import { desenharResultado, desenharErro, MAX_LINHAS } from '../tabela-resultado.js';
import { traduzirErro } from '../erros-sql.js';
import { conferirResposta } from '../conferir.js';
import { mostrarAbrindo } from './abrindo.js';
import { criarRaioX } from '../raio-x.js';
import { modulos, carregarModulo } from '../../dados/missoes/indice.js';
import { emIdioma } from '../i18n.js';

// A consulta de exemplo, escrita uma vez em inglês — como os gabaritos.
const EXEMPLO = `-- The 5 most populous countries in 2023 (aggregates left out)
SELECT country_name, population
FROM countries
JOIN country_year ON country_year.country_code = countries.country_code
WHERE year = 2023 AND region_code IS NOT NULL
ORDER BY population DESC
LIMIT 5;`;

// PROVISÓRIO (passo 9): um desafio de teste, para ver a conferência pelo
// resultado funcionando. O mesmo pedido da consulta de exemplo — então a
// consulta que já vem no editor está certa; é só mexer nela para errar.
const DESAFIO_DE_TESTE = {
  gabarito: `SELECT country_name, population
FROM countries
JOIN country_year ON country_year.country_code = countries.country_code
WHERE year = 2023 AND region_code IS NOT NULL
ORDER BY population DESC
LIMIT 5`,
  conferir: { ordem: true },
  exige: ['ORDER BY'],
};

export function ligarBancada() {
  const lugarDoEditor = document.querySelector('#bancada-editor');
  const saida = document.querySelector('#bancada-resultado');
  if (!lugarDoEditor) return;

  const editor = criarEditor(lugarDoEditor, {
    inicial: traduzirSQL(EXEMPLO, 'en', idioma()),
    aoRodar: rodar,
  });

  async function rodar(sql) {
    if (!baseAberta()) {
      const tela = mostrarAbrindo({ aoTentarDeNovo: () => rodar(sql) });
      try {
        await abrirBase({ aoProgredir: tela.progredir });
        tela.fechar();
        console.info('[bd] medições da abertura:', { ...medicoes });
      } catch (erro) {
        tela.falhar(erro);
        return;
      }
    }

    try {
      const resultado = await consultar(sql, { maxLinhas: MAX_LINHAS });
      desenharResultado(saida, resultado);

      // A conferência do desafio de teste, logo abaixo do resultado.
      const veredito = await conferirResposta(resultado, sql, DESAFIO_DE_TESTE);
      const linha = document.createElement('p');
      linha.className = veredito.certo ? 'conferencia-certa' : 'conferencia-errada';
      linha.innerHTML = veredito.mensagem;
      saida.prepend(linha);
    } catch (erro) {
      const traduzido = traduzirErro(erro.message, { sql, idiomaDaBase: idiomaDaBase() });
      desenharErro(saida, traduzido);
      if (traduzido.linha) editor.marcarErro(traduzido.linha);
    }
  }
}

/* --------------------------------------------------------------------------
   PROVISÓRIO (passo 11): o Raio-X de cada missão escrita, para ver antes da
   tela de missão existir. Sai no passo 12.
   -------------------------------------------------------------------------- */

export async function ligarRaioXDeTeste() {
  const seletor = document.querySelector('#bancada-missao');
  const lugar = document.querySelector('#bancada-raiox');
  if (!seletor || !lugar) return;

  const missoes = [];
  for (const modulo of modulos) {
    for (const missao of await carregarModulo(modulo.id)) {
      if (missao.raioX?.length) missoes.push(missao);
    }
  }

  function preencherSeletor() {
    const escolhida = seletor.value;
    seletor.innerHTML = '<option value="">—</option>' + missoes
      .map((m) => `<option value="${m.id}">${m.id} · ${emIdioma(m.titulo)}</option>`)
      .join('');
    seletor.value = escolhida;
  }
  preencherSeletor();
  document.addEventListener('idioma-mudou', preencherSeletor);

  let raioX = null;
  seletor.addEventListener('change', async () => {
    raioX?.destruir();
    raioX = null;
    lugar.innerHTML = '';
    const missao = missoes.find((m) => m.id === seletor.value);
    if (!missao) return;

    if (!baseAberta()) {
      const tela = mostrarAbrindo();
      try {
        await abrirBase({ aoProgredir: tela.progredir });
        tela.fechar();
      } catch (erro) {
        tela.falhar(erro);
        return;
      }
    }
    raioX = await criarRaioX(lugar, { etapas: missao.raioX });
  });
}
