#!/usr/bin/env python3
"""
servidor.py — servidor local para desenvolvimento.

Copiado do digita, com duas mudanças: a porta padrão (8030, para rodar ao
lado do digita, que usa a 8010) e os tipos de arquivo fixados à mão.

Por que existe: o `python3 -m http.server` deixa o navegador guardar os
arquivos em cache. Como o site é feito de módulos JavaScript, isso faz o
navegador continuar rodando a versão ANTIGA de um arquivo depois de você
editá-lo — e você fica olhando para uma tela que não mudou, achando que o
código está errado.

Este servidor manda o navegador nunca guardar nada, então recarregar a
página sempre mostra a versão de agora.

Por que fixar os tipos: o navegador só aceita compilar o motor SQL em
streaming se o `.wasm` chegar como `application/wasm`, e só aceita um módulo
`.mjs` se ele chegar como JavaScript. O Python pergunta ao sistema qual é o
tipo de cada extensão, e a resposta muda de máquina para máquina — aqui a
lista é a do projeto, igual em qualquer lugar.

De propósito, este servidor NÃO manda os cabeçalhos COOP/COEP: o GitHub
Pages também não manda, e o teste local tem de ser igual ao endereço real.

Como usar:

    python3 servidor.py          # abre em http://localhost:8030
    python3 servidor.py 8040     # ou em outra porta, se a 8030 estiver ocupada

Só serve para desenvolver na sua máquina. No GitHub Pages o site é servido
pelo GitHub, e este arquivo não faz diferença nenhuma.
"""

import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path

PORTA_PADRAO = 8030

# Tipos que o site precisa, independentes do que o sistema conhece.
TIPOS_DO_PROJETO = {
    ".wasm": "application/wasm",
    ".js": "text/javascript; charset=utf-8",
    ".mjs": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".csv": "text/csv; charset=utf-8",
    ".woff2": "font/woff2",
    ".svg": "image/svg+xml",
    ".md": "text/markdown; charset=utf-8",
}


class SemCache(SimpleHTTPRequestHandler):
    """Igual ao servidor padrão, mas proibindo o cache do navegador."""

    extensions_map = {**SimpleHTTPRequestHandler.extensions_map, **TIPOS_DO_PROJETO}

    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Expires", "0")
        super().end_headers()


def main():
    porta = int(sys.argv[1]) if len(sys.argv) > 1 else PORTA_PADRAO
    raiz = Path(__file__).parent
    manipulador = partial(SemCache, directory=str(raiz))

    with ThreadingHTTPServer(("127.0.0.1", porta), manipulador) as servidor:
        print(f"meridiano. rodando em http://localhost:{porta}")
        print("Para parar: Ctrl+C")
        try:
            servidor.serve_forever()
        except KeyboardInterrupt:
            print("\nServidor parado.")


if __name__ == "__main__":
    main()
