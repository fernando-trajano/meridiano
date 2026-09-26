# Estado do projeto — onde paramos

Atualizado em **25/09/2026**, no fim da sessão que fechou o **passo 18**.

Este arquivo é o ponto de partida de uma sessão nova. Ele **não repete** o que já está
escrito: as regras ficam no [CLAUDE.md](CLAUDE.md), e o detalhe de cada passo, no
[PLANO.md](PLANO.md) ("Estado dos passos"). Aqui ficam só o resumo, o que está pendente,
as decisões que não tinham sido escritas e a ordem do que vem.

**Duas regras fixas:** o Claude **nunca roda Git** (nenhum comando; o Fernando faz tudo no
GitHub Desktop) e **para em todo 🛑** até o Fernando aprovar ou testar. Não começar um
passo sem o Fernando pedir.

---

## 1. Pronto e aprovado (passos 1 a 18)

| Passo | O quê | Como foi aprovado |
|---|---|---|
| 1–4 | Documentos, tema, i18n, base (Banco Mundial + instituto) | 🛑 paleta/fontes (2) e dados (4) aprovados |
| 5–7 | Motor DuckDB-WASM, publicação no Pages, editor/resultado/erros | 🛑 Safari (5, 7); decisão do motor (6) |
| 8–12 | Salvamento, conferência, 20 missões, Raio-X, tela de missão | 🛑 Safari (12); revisão do 10 dispensada pelo Fernando |
| Redesenho + rodada 2 | Missão em 6 etapas, Passo a passo, trilha, temas novos, selos, barra da Consulta | Testado no Safari pelo Fernando |
| 13 | Entrega e `progresso.js` | "feito, pode seguir" |
| 14 | Bloqueio dos módulos na trilha | "feito, pode seguir" |
| 15 | Entrada e nivelamento (+ ajuste da entrada com o globo) | "feito, pode seguir" |
| 16 | Início (+ ajustes: cartões, painel único, moldura única) | "feito, pode seguir para o passo 17" |
| 17 | Laboratório (+ rótulos "Usar tabela" e "Prévia") | 🛑 Safari: "tudo ok, pode seguir para o passo 18" |
| 18 | Cola, depois redesenhada como **Dicas** | Passo aprovado; o redesenho espera o 🛑 do Safari |

O fluxo inteiro, **menos os jogos**, funciona: entrada → nivelamento → início → trilha →
missão → entrega, laboratório e Dicas (a antiga cola). Módulos 0 a 2 escritos (20 de 77 missões). As 6
conferências automáticas passam sem aviso.

---

## 2. Pendente ou meio-feito

| # | O quê | Onde | Quando |
|---|---|---|---|
| 1 | **Conteúdo das Dicas sem revisão do Fernando.** Frases e exemplos novos; vale ler "Em outros bancos" e o glossário | `dados/cola.js` | Quando o Fernando puder |
| 1b | **Atalhos de teclado** saíram das Dicas; as chaves `cola.atalhosLista` ficaram, sem uso, para o laboratório | `dados/i18n/pt.js` e `en.js` (`cola.atalhosLista`) | Passo futuro, quando o Fernando pedir |
| 1c | **Nomes internos "cola"** (rota `#/cola`, arquivos, classes, chaves) continuam; só a tela diz "Dicas" | `js/telas/cola.js`, `dados/cola.js`, `css/telas.css` | Passo separado, se o Fernando quiser |
| 2 | **Desenhos do início sem uso** desde o ajuste do passo 16 (guardados de propósito, ver `CLAUDE.md`, "Início"). O comentário do topo do arquivo ainda diz que o início os usa | `js/ilustracoes.js:12-15` (comentário), `:96` (`DESENHOS`), `:159` (`ilustracao()`) | Passo 19 (usar nos jogos?) ou 21 (apagar e corrigir o comentário) |
| 3 | **Autocompletar não conhece tabelas importadas ou criadas** no laboratório: o vocabulário sai só do dicionário e fica guardado por idioma | `js/editor.js:458-482` (`vocabulario()`) | Passo 21 |
| 4 | **Dica "Prévia" dentro do painel flutuante** (quase "dica dentro de dica"). Ofereci tirar só dali; o Fernando testou no Safari e seguiu sem pedir mudança — fica, salvo pedido | `js/tabelas-da-barra.js:87-88` | Só se o Fernando pedir |
| 5 | **Rodapé sem a data da coleta** (tem a fonte e a licença; o `PLANO.md`, "Layout das telas", pede a data) | `index.html:143-148` | Passo 21 |
| 6 | **View Transitions** ainda não existem | `js/roteador.js:13` | Passo 21 |
| 7 | **Backup do progresso.** `lerTudo()` pronto; `exportacao.js` não existe; o `app.js` já prevê idioma e tema vindos de um backup; o botão vai morar no início | `js/armazenamento.js:120-133`, `js/app.js:75`, `js/telas/inicio.js` | Passo 21 |
| 8 | **Sons.** `mudo` é guardado, mas nada toca; `som.js` não existe | `js/estado.js:22` | Passo 21 (só nos jogos) |
| 9 | **Jogos.** Atalho "Jogos" do início em "em breve" (`endereco: null`); chave `meridiano:jogos` reservada | `js/telas/inicio.js:28-38`, `js/armazenamento.js:29` | Passos 19 e 20 |
| 10 | **Dois erros antigos do DuckDB** vistos uma vez no console ("Cannot detach database", "SET schema"), de testes sobrepostos; não se repetiram com ouvinte ligado | `js/bd.js` (zerar em fila) | Observar no passo 21 |
| 11 | **Telas estreitas:** o aviso existe (missão, nivelamento, laboratório); falta a passada geral em 375px | `css/telas.css` | Passo 21 |
| 12 | **README "Em construção"** nos dois idiomas | `README.md`, `README.en.md` | Passo 21 |
| 13 | Passo a passo com `JOIN`, `GROUP BY` e `HAVING`: só destaque e frase | `js/passo-a-passo.js:25` | Depois da v1 (módulos 4 e 5) |
| 14 | Conferência do módulo 8 pelo estado da base (não pelo resultado) | `PLANO.md`, "A missão por dentro" | Depois da v1 |

---

## 3. Decisões desta conversa que não estavam escritas

- **Largura da moldura:** a coluna do meio do início e da trilha usa a largura do site
  (1100px), como no digita. Antes, a trilha limitava a 820px e o início a 960px. Aceito
  pelo Fernando.
- **Painel no celular:** a moldura põe o painel logo depois do título e do topo (no
  digita, ele vem no fim). Foi para manter a ordem pedida para o início. Voltar ao jeito
  do digita é uma regra só, em `moldura.js` + `telas.css`.
- **Link do laboratório:** o link que o laboratório copia é sempre em inglês. O `&de=pt`
  existe só para os links da cola, que levam a consulta no idioma da tela.
- **CSV do Brasil:** aspas só quando o texto tem o separador, aspas ou quebra de linha. A
  vírgula decimal não pede aspas (no começo, os números saíam entre aspas).
- **Caracteres invisíveis no código** (BOM, faixas de acento) sempre como escape
  (`'\uFEFF'`, `/[\u0300-\u036f]/`), nunca o caractere colado: ele não aparece
  no editor. No passo 17, dois foram escritos literalmente e trocados por escapes.
- **Conferências da cola:** os exemplos de "Criar e alterar dados" ficam fora das
  conferências com o motor, porque criam tabelas e um depende do outro.
- **Testar no painel do navegador:** com o painel escondido, o screenshot falha (além da
  lentidão já anotada no `PLANO.md`). Conferir por JavaScript (medidas, estilos,
  `console`) e pedir ao Fernando para mostrar o painel quando a imagem importa.
- **Servidor:** o `servidor.py` iniciado em segundo plano morre com a sessão. Numa sessão
  nova, subir de novo (comando no `CLAUDE.md`, "Como testar").

---

## 4. Próximos passos, na ordem

O `PLANO.md` não marca 🛑 nos passos 19 a 21. Mesmo assim, ao fim de cada um: resumo
curto, roteiro de teste e sugestão de commit, e **esperar o Fernando pedir o próximo**.
Os jogos usam relógio, `requestAnimationFrame` e som — vale propor um teste no Safari.

1. **Passo 19 — menu de jogos + Palpite.** `js/telas/jogos.js` (menu, `#/jogos`),
   `js/jogos/comum.js` (tela do nível, tela do fim, relógio pelo `performance.now()` do
   `requestAnimationFrame`, sair da janela pausa — do digita), `js/jogos/palpite.js`,
   `dados/jogos/palpite.js` (em inglês, só com os módulos liberados), `css/jogos.css`.
   Palpite: tabela pequena + consulta, escolher o resultado certo entre 3; fim com 3
   erros; 3 níveis. **Nada entra no progresso.** Ligar o atalho "Jogos" do início
   (pendência 9). Guardar só o último jogo e nível em `meridiano:jogos`. Funciona no
   celular.
2. **Passo 20 — Telegrama + Infiltrado.** Telegrama: pedaços da consulta caem
   embaralhados (com intrusos), montar na ordem antes que a fila encha. Infiltrado:
   consulta com um erro infiltrado, clicar nele antes que o relatório seja publicado, e
   uma frase explica o erro. Mesmas regras do 19.
3. **Passo 21 — fechamento da versão 1.** Sons (`som.js`, só nos jogos, com o mudo),
   backup (`exportacao.js`, JSON com versão, no início), View Transitions no roteador (com
   recuo sem animação e `prefers-reduced-motion`), passada em telas estreitas, rodapé com
   a data da coleta, e as pendências marcadas "Passo 21" acima. Atualizar os READMEs e
   este arquivo. O Fernando publica pelo GitHub Desktop, e o Claude confere no endereço
   real.
