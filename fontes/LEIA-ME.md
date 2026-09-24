# Fontes

As duas fontes do site, copiadas para dentro do repositório (nada vem de CDN).

| Fonte | Arquivo | Uso | Pesos | Tamanho |
|---|---|---|---|---|
| Source Serif 4 | `source-serif-4/source-serif-4-latin.woff2` | títulos, marca, nome no memorando | 400 a 600 (variável) | 50 KB |
| JetBrains Mono | `jetbrains-mono/jetbrains-mono-latin.woff2` | código, resultados, números | 400 a 500 (variável) | 31 KB |

- **Origem:** Google Fonts (`fonts.gstatic.com`: `sourceserif4/v14` e
  `jetbrainsmono/v24`), baixadas em 24 de setembro de 2026.
- **Subconjunto:** só o latino (`U+0000-00FF` e alguns sinais), que cobre o português, o
  inglês e os nomes de países do Banco Mundial. Um caractere de fora (por exemplo, num CSV
  importado no laboratório) cai na fonte de reserva do sistema, sem quebrar nada.
- **Um arquivo por fonte:** são fontes variáveis — o mesmo arquivo desenha todos os pesos
  do intervalo.
- **Ligaduras desligadas** na JetBrains Mono pelo CSS (`font-variant-ligatures: none`),
  para `>=` e `<>` aparecerem como se digitam.
- **Licença:** SIL Open Font License 1.1 — o `OFL.txt` de cada pasta, copiado do
  repositório `google/fonts`.
