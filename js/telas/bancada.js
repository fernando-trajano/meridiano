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
import { mostrarAbrindo } from './abrindo.js';

// A consulta de exemplo, escrita uma vez em inglês — como os gabaritos.
const EXEMPLO = `-- The 5 most populous countries in 2023 (aggregates left out)
SELECT country_name, population
FROM countries
JOIN country_year ON country_year.country_code = countries.country_code
WHERE year = 2023 AND region_code IS NOT NULL
ORDER BY population DESC
LIMIT 5;`;

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
    } catch (erro) {
      const traduzido = traduzirErro(erro.message, { sql, idiomaDaBase: idiomaDaBase() });
      desenharErro(saida, traduzido);
      if (traduzido.linha) editor.marcarErro(traduzido.linha);
    }
  }
}
