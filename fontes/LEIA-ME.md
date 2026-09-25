# Fontes

A fonte do site copiada para dentro do repositório (nada vem de CDN).

| Fonte | Arquivo | Uso | Pesos | Tamanho |
|---|---|---|---|---|
| JetBrains Mono | `jetbrains-mono/jetbrains-mono-latin.woff2` | código, números, códigos (ISO3…) e NULL | 400 a 500 (variável) | 31 KB |

Títulos, marca e texto usam a **fonte do sistema** (`system-ui`), como no digita. A
Source Serif 4, aprovada no passo 2, **saiu no redesenho depois do passo 12**.

- **Origem:** Google Fonts (`fonts.gstatic.com`, `jetbrainsmono/v24`), baixada em 24 de
  setembro de 2026.
- **Subconjunto:** só o latino (`U+0000-00FF` e alguns sinais), que cobre o português, o
  inglês e os nomes de países do Banco Mundial. Um caractere de fora (por exemplo, num CSV
  importado no laboratório) cai na fonte de reserva do sistema, sem quebrar nada.
- **Um arquivo só:** é uma fonte variável — o mesmo arquivo desenha todos os pesos do
  intervalo.
- **Ligaduras desligadas** pelo CSS (`font-variant-ligatures: none`), para `>=` e `<>`
  aparecerem como se digitam.
- **Licença:** SIL Open Font License 1.1 — `jetbrains-mono/OFL.txt`, copiado do repositório
  `google/fonts`.
