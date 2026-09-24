# Apache Arrow — versão fixada

O DuckDB-WASM responde às consultas no formato Apache Arrow, e o `duckdb-browser.mjs`
importa o Arrow pelo nome. Esta pasta é o Arrow que ele encontra.

| | |
|---|---|
| Pacote | `apache-arrow` **17.0.0** (a versão que o DuckDB-WASM 1.32.0 pede: `^17.0.0`) |
| Baixado em | 24/09/2026, de `https://registry.npmjs.org/apache-arrow/-/apache-arrow-17.0.0.tgz` |
| Integridade | sha512 do `.tgz` conferido com o `dist.integrity` publicado no npm |
| Licença | Apache 2.0 — `LICENSE.txt` e `NOTICE.txt`, desta pasta, copiados do pacote |

## Os arquivos

| Arquivo | Origem | O que é |
|---|---|---|
| `Arrow.esnext.min.js` | cópia intacta do pacote (163 KB) | o Arrow inteiro num arquivo só, com as dependências dentro; ao rodar como script comum, vira `window.Arrow` |
| `arrow.mjs` | **escrito por nós** | a ponte: carrega o arquivo acima e repassa as peças que o DuckDB usa (`RecordBatchReader`, `Table`, `Type`, `tableToIPC`) e o `util`, que o `bd.js` usa para converter números decimais |
| `LICENSE.txt`, `NOTICE.txt` | cópias do pacote | a licença e o aviso que a Apache 2.0 pede para acompanhar o código |

## Por que a ponte

O pacote do Arrow para módulos ES vem em centenas de arquivos e depende de outros pacotes
pelo nome (`flatbuffers`, `tslib`) — só funciona com um empacotador (bundler). O arquivo
único `Arrow.esnext.min.js` já tem tudo dentro, mas não é um módulo ES. O `arrow.mjs` faz
a ligação sem mexer em nenhum arquivo baixado.
