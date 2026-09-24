# DuckDB-WASM — versão fixada

Cópia intacta de três arquivos do pacote oficial. **Não editar.** Atualizar é uma decisão,
nunca um acidente: trocar os três arquivos juntos, conferir a integridade, atualizar esta
página e, em `js/bd.js`, o `TAMANHO_DO_MOTOR` e a `VERSAO_DO_MOTOR` — a versão dá nome
à gaveta onde o navegador guarda o motor, e trocá-la faz todo mundo baixar o novo.

| | |
|---|---|
| Pacote | `@duckdb/duckdb-wasm` **1.32.0** (a última estável; as mais novas no npm são `-dev`) |
| Motor | DuckDB **v1.4.3** (o que `SELECT version()` responde) |
| Publicado em | 16/12/2025 |
| Baixado em | 24/09/2026, de `https://registry.npmjs.org/@duckdb/duckdb-wasm/-/duckdb-wasm-1.32.0.tgz` |
| Integridade | sha512 do `.tgz` conferido com o `dist.integrity` publicado no npm |
| Licença | MIT — `LICENSE`, desta pasta (do repositório `duckdb/duckdb-wasm`, tag `v1.32.0`) |

## Os arquivos

| Arquivo | Tamanho | Comprimido (gzip -9) | O que é |
|---|---|---|---|
| `duckdb-browser.mjs` | 32 KB | — | o módulo que o `bd.js` importa (AsyncDuckDB) |
| `duckdb-browser-eh.worker.js` | 773 KB | 188 KB | o Web Worker onde o motor roda |
| `duckdb-eh.wasm` | **34.242.586 bytes** | ~7,6 MB | o motor em si |

## Por que só a variante "eh"

O pacote traz três variantes do motor: `mvp` (39 MB, para navegadores antigos), `eh`
(34 MB, usa as exceções nativas do WebAssembly) e `coi` (com threads, exige os cabeçalhos
COOP/COEP, que o GitHub Pages não permite). A `eh` roda em todos os navegadores atuais —
Safari 15.2+, Chrome 95+, Firefox 100+ — e é menor e mais rápida que a `mvp`. Levar as
três somaria mais de 100 MB ao repositório por causa de navegadores de 2021.

## O que o `duckdb-browser.mjs` precisa

Ele importa o Apache Arrow pelo nome (`"apache-arrow"`). Quem resolve esse nome é o
*import map* do `index.html`, que aponta para `vendor/arrow/arrow.mjs`.

## Extensões

Nenhuma é baixada. O `bd.js` desliga a instalação e o carregamento automáticos
(`autoinstall_known_extensions` e `autoload_known_extensions`), e o que a trilha usa —
CSV, janelas, `QUALIFY`, `PIVOT`, `WITH RECURSIVE` — é do núcleo. Conferido no passo 5:
só `core_functions` aparece carregada, e nenhuma requisição sai do domínio.
