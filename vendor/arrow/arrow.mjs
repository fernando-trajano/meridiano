/* ==========================================================================
   arrow.mjs — a ponte entre o DuckDB-WASM e o Apache Arrow.

   Este é o ÚNICO arquivo de vendor/ escrito por nós; os outros são cópias
   intactas dos pacotes oficiais (ver VERSAO.md de cada pasta).

   O problema: o duckdb-browser.mjs faz `import * as arrow from "apache-arrow"`
   — um nome de pacote, sem caminho, que só um empacotador (bundler) sabe
   resolver. O projeto não usa empacotador.

   A solução, em duas partes:
   1. o index.html tem um "import map" dizendo ao navegador que
      "apache-arrow" é ESTE arquivo;
   2. este arquivo carrega o Arrow.esnext.min.js — o pacote do Arrow já
      montado num arquivo só, que se registra como window.Arrow ao rodar como
      script comum — e repassa as peças que o DuckDB usa.

   O `await` aqui no topo faz quem importa este módulo esperar o script
   terminar de carregar. Só acontece nas telas que abrem o motor SQL.
   ========================================================================== */

await new Promise((pronto, falhou) => {
  const script = document.createElement('script');
  script.src = new URL('./Arrow.esnext.min.js', import.meta.url).href;
  script.onload = pronto;
  script.onerror = () => falhou(new Error('Não foi possível carregar o Apache Arrow.'));
  document.head.append(script);
});

const Arrow = globalThis.Arrow;

// As quatro peças que o duckdb-browser.mjs usa, mais o util (conversão de
// números decimais), usado pelo bd.js.
export const { RecordBatchReader, Table, Type, tableToIPC, util } = Arrow;
