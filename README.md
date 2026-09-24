# meridiano.

SQL de verdade, com dados do mundo real.

**▶ fernando-trajano.github.io/meridiano** *(em breve)*

[Read this in English](README.en.md)

---

## O que é

Um curso de SQL interativo e gratuito, para quem nunca escreveu uma consulta.

Você entra como analista de dados do **Observatório Meridiano**, um instituto de pesquisa
fictício em Genebra. Cada lição é uma **missão**: um pesquisador faz um pedido — sobre
desigualdade, clima, energia, saúde — e você responde com SQL de verdade, rodando no seu
navegador, sobre dados reais de países.

- **SQL de verdade desde a primeira missão**, num banco de dados completo (DuckDB) que
  roda dentro da página — nada para instalar.
- **Um conceito novo por missão**, com um **Raio-X** que mostra a consulta acontecendo
  etapa por etapa: quais linhas ficam, quais saem, como os grupos se formam.
- **A resposta é conferida pelo resultado**, não pelo texto: escrever de outro jeito
  vale, e quando algo dá errado o site diz *como* errou.
- **Laboratório** para consultas livres, **cola** com a sintaxe e três **jogos** curtos.
- Em português e em inglês — inclusive os nomes das tabelas.

## Estado do projeto

**Em construção.** A trilha planejada tem 10 módulos e 77 missões; a versão 1 traz o
fluxo completo e os três primeiros módulos. O andamento passo a passo está no
[PLANO.md](PLANO.md).

## Os dados

- **Mundo** — Banco Mundial, *World Development Indicators*, de 2000 a 2023, licença
  [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Os dados foram baixados uma
  vez e ficam neste repositório; a data da coleta fica registrada ao lado dos arquivos.
- **Instituto** — equipe, projetos, desembolsos, viagens e publicações do Observatório
  Meridiano: **inventados**, gerados por um script com semente fixa.

## Tecnologia

HTML, CSS e JavaScript puro — **sem frameworks e sem etapa de build**. A única
dependência é o [DuckDB-WASM](https://github.com/duckdb/duckdb-wasm), com os arquivos
copiados para dentro do repositório numa versão fixa: nada vem de CDN. O progresso fica
no `localStorage` do seu navegador — não há login e nada é enviado para lugar nenhum.

## Como rodar na sua máquina

Como o projeto usa módulos ES, o navegador **não** aceita abrir o `index.html` com duplo
clique. É preciso servir a pasta. Com o Python que já vem no macOS:

```bash
python3 servidor.py
```

Depois abra **http://localhost:8030** no navegador.

O `servidor.py` é um servidor local pequeno, sem dependências, que manda o navegador não
guardar nada em cache — assim uma alteração no código aparece assim que a página é
recarregada.

## Estrutura

```
css/          estilos — tema.css guarda todas as cores em variáveis
js/           lógica — telas, motor SQL, editor, Raio-X, conferência
dados/        conteúdo — missões, base de dados, jogos e traduções (PT/EN)
fontes/       Source Serif 4 e JetBrains Mono, com as licenças OFL
vendor/       DuckDB-WASM, versão fixada
ferramentas/  scripts em Python que baixam e geram a base
```

Conteúdo e lógica ficam separados de propósito: dá para escrever missões novas mexendo só
em `dados/missoes/`, sem tocar no código.

## Licença

Código: [MIT](LICENSE) — © 2026 Fernando Rodrigo Trajano da Silva.
Dados do Banco Mundial: CC BY 4.0. Fontes: SIL Open Font License. DuckDB-WASM: MIT.
