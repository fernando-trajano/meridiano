/* ==========================================================================
   pt.js — todos os textos da interface em português.

   Este arquivo é CONTEÚDO, não código: dá para corrigir uma frase aqui sem
   entender nada de JavaScript. A única regra é manter as aspas e a vírgula
   no fim de cada linha.

   O en.js precisa ter exatamente as mesmas chaves. Se faltar alguma, o site
   avisa no console do navegador em vez de mostrar a tela quebrada.

   Textos entre chaves, como {feitas}, são lacunas: o código preenche.
   ========================================================================== */

export const pt = {
  // Código que vai para o atributo lang do <html>. Serve para o navegador
  // saber hifenizar, corrigir ortografia e ler em voz alta no idioma certo.
  codigoHtml: 'pt-BR',

  documento: {
    titulo: 'meridiano. · SQL de verdade, com dados do mundo real',
    descricao:
      'Curso de SQL interativo e gratuito: missões com SQL de verdade, rodando no navegador, sobre dados reais de países do Banco Mundial.',
  },

  geral: {
    subtitulo: 'SQL de verdade, com dados do mundo real',
    instituto: 'Observatório Meridiano',
  },

  cabecalho: {
    idioma: 'Idioma da interface',
    alternarTema: 'Alternar entre modo claro e escuro',
  },

  rodape: {
    dados: 'Dados:',
    fonteDados: 'Banco Mundial, World Development Indicators',
    // Antes do nome do autor, que é o mesmo nos dois idiomas e mora no HTML.
    por: 'por',
  },

  abrindo: {
    titulo: 'Abrindo o observatório...',
    motor: 'Ligando o motor',
    dados: 'Trazendo os dados',
    tabelas: 'Arrumando as tabelas',
    erroTitulo: 'O observatório não abriu.',
    erroTexto: 'Algo falhou ao carregar o motor SQL. Confira a conexão e tente de novo.',
    tentarDeNovo: 'Tentar de novo',
  },

  editor: {
    rotulo: 'Editor de SQL',
    dica: '{rodar} roda · {comentar} comenta a linha · Esc e depois Tab sai do editor',
    rodar: 'Rodar',
    formatar: 'Formatar',
    sugestoes: 'Sugestões',
    tabela: 'tabela',
    coluna: 'coluna · {tabela}',
    palavraChave: 'palavra-chave',
    funcao: 'função',
  },

  resultado: {
    linhas: '{linhas} linhas · {ms} ms',
    umaLinha: '1 linha · {ms} ms',
    linhasCortadas: '{total} linhas (mostrando as {linhas} primeiras) · {ms} ms',
    nenhuma: 'A consulta rodou, mas nenhuma linha passou. · {ms} ms',
    comando: 'Comando executado. · {ms} ms',
    tabela: 'Resultado da consulta',
    linhaDoErro: 'linha {linha}',
    original: 'Mensagem original do DuckDB',
  },

  // Os erros do DuckDB traduzidos (js/erros-sql.js). {nome}, {trecho} etc.
  // chegam já formatados como código.
  erros: {
    ou: ' ou ',
    generico: 'O DuckDB não conseguiu rodar a consulta.',
    genericoPista: 'A mensagem original, em inglês, está logo abaixo.',
    sintaxePerto: 'O DuckDB não entendeu a consulta a partir de {trecho}.',
    sintaxeFim: 'A consulta acabou antes da hora.',
    textoAberto: 'Um texto entre aspas simples ficou aberto.',
    pistaTextoAberto: 'Feche a aspa no fim do texto: {exemplo}.',
    semColunas: 'Depois de SELECT falta dizer quais colunas mostrar.',
    pistaSemColunas: 'Use * para todas, ou escreva os nomes separados por vírgula.',
    pistaQuisDizer: 'Você quis dizer {nome}?',
    pistaPalavraPt: 'SQL usa as palavras em inglês: {palavra}, e não {trecho}.',
    pistaVirgula: 'Confira as vírgulas: entre duas colunas vai exatamente uma.',
    pistaVirgulaSobrando: 'Há uma vírgula sobrando antes de {trecho}.',
    pistaParenteseVazio: 'Falta alguma coisa antes deste parêntese — por exemplo, a coluna dentro de COUNT(DISTINCT …).',
    pistaParenteseAntes: 'Um parêntese aberto antes de {trecho} não foi fechado.',
    pistaParenteseAberto: 'Um parêntese foi aberto e não foi fechado.',
    pistaConfira: 'Confira {trecho} e o que vem logo antes dele.',
    pistaFimCondicao: 'Depois de {palavra} falta a condição — por exemplo, ano = 2023.',
    pistaFimColuna: 'Depois de {palavra} falta dizer a coluna.',
    pistaFimTabela: 'Depois de FROM falta o nome da tabela.',
    pistaFimSelect: 'Depois de SELECT vêm as colunas, separadas por vírgula.',
    pistaFimOn: 'Depois do JOIN falta o ON, que diz como as tabelas se ligam: … ON a.coluna = b.coluna.',
    pistaFimGenerico: 'Falta alguma coisa depois de {palavra}.',
    tabelaNaoExiste: 'Não existe tabela chamada {nome}.',
    pistaTabelaEmPt: 'Com o site em português, essa tabela se chama {nome}.',
    pistaTabelaEmEn: 'Com o site em inglês, essa tabela se chama {nome}.',
    pistaVerTabelas: 'Confira o nome da tabela: as 11 tabelas da base estão na cola.',
    funcaoNaoExiste: 'Não existe a função {nome}.',
    pistaFuncaoPt: 'Em SQL, as funções têm nome em inglês: {funcao}.',
    colunaNaoExiste: 'A coluna {nome} não existe nas tabelas do FROM.',
    colunaNaoExisteNaTabela: 'A tabela {tabela} não tem a coluna {nome}.',
    pistaColunaEmPt: 'Com o site em português, essa coluna se chama {nome}.',
    pistaColunaEmEn: 'Com o site em inglês, essa coluna se chama {nome}.',
    pistaOutraTabela: 'A coluna {nome} fica na tabela {tabela}, que não está no FROM.',
    pistaAspasDuplas: 'Texto vai entre aspas simples: {exemplo}. Aspas duplas são para nomes de coluna.',
    pistaSemAspas: 'Se {nome} é um valor, e não uma coluna, ele vai entre aspas simples: {exemplo}.',
    apelidoNaoExiste: 'A consulta usa {apelido}, mas nenhuma tabela ou apelido do FROM tem esse nome.',
    pistaApelido: 'Dê o apelido no FROM — por exemplo, {exemplo} — ou use o nome da tabela.',
    agrupar: 'A coluna {nome} está no SELECT, mas não no GROUP BY.',
    pistaAgrupar: 'Ponha {nome} no GROUP BY, ou resuma-a com uma função, como COUNT, MAX ou MIN.',
    ambigua: 'A coluna {nome} existe em mais de uma tabela da consulta.',
    pistaAmbigua: 'Diga de qual tabela ela vem: {opcoes}.',
    agregacaoWhere: 'O WHERE não pode usar COUNT, SUM, AVG, MIN ou MAX.',
    pistaAgregacaoWhere: 'O WHERE filtra as linhas antes de agrupar. Para filtrar os grupos, use HAVING, depois do GROUP BY.',
    janelaWhere: 'O WHERE não pode usar funções de janela, como ROW_NUMBER.',
    pistaJanelaWhere: 'Para filtrar pelo resultado delas, use QUALIFY — ou calcule antes numa subconsulta.',
    conversaoNumero: 'Não deu para transformar {valor} em número.',
    pistaNumero: 'Números vão sem aspas: 10, e não \'10\' nem \'dez\'.',
    conversaoData: 'Não deu para transformar {valor} em data.',
    pistaData: 'Datas vão entre aspas simples, no formato ano-mês-dia: \'2024-03-05\'.',
    funcaoComTexto: 'A função {funcao} não funciona com texto.',
    funcaoTipo: 'A função {funcao} não aceita esse tipo de valor ({tipo}).',
    pistaFuncaoTexto: 'Ela precisa de números. Confira qual coluna está entre os parênteses.',
    contaComTexto: 'Não dá para fazer contas com texto.',
    pistaContaComTexto: 'Para juntar textos, use ||. Para somar, os dois lados precisam ser números.',
    chaveRepetida: 'Já existe uma linha com a chave {chave}.',
    pistaChaveRepetida: 'Uma chave primária não se repete. Use outro valor, ou mude a linha que já existe com UPDATE.',
    naoNulo: 'A coluna {nome} não aceita ficar vazia (NULL).',
    pistaNaoNulo: 'Dê um valor para ela no INSERT.',
    jaExiste: 'Já existe uma tabela chamada {nome}.',
    pistaJaExiste: 'Use outro nome, ou CREATE OR REPLACE TABLE para trocar a antiga.',
    limiteNegativo: 'O LIMIT não pode ser negativo.',
    pistaLimiteNegativo: 'Use um número inteiro a partir de 0.',
    uniaoColunas: 'As consultas unidas devolvem números diferentes de colunas.',
    pistaUniaoColunas: 'Com UNION, INTERSECT e EXCEPT, os dois lados precisam ter a mesma quantidade de colunas, na mesma ordem.',
    insertColunas: 'A tabela {tabela} tem {colunas} colunas, mas vieram {valores} valores.',
    pistaInsertColunas: 'Dê um valor para cada coluna, ou diga quais colunas preencher: INSERT INTO tabela (coluna1, coluna2) VALUES (…).',
  },

  // PROVISÓRIO: a bancada de teste. Sai no passo 12, com a tela de missão.
  bancada: {
    titulo: 'Bancada de teste',
    explicacao:
      'Provisório: o editor e o motor de verdade, antes de existir a tela de missão (passo 12). Experimente errar de propósito.',
  },

  // PROVISÓRIO: os textos da vitrine do passo 2. Saem junto com ela, no
  // passo 15.
  vitrine: {
    texto:
      'Você entra como analista de dados de um instituto de pesquisa em Genebra. Cada lição é uma missão: o pedido de um pesquisador, resolvido com SQL de verdade sobre dados reais de países.',
    comecar: 'Começar',
    jaSei: 'Já sei um pouco de SQL',
    cargo: 'Economista',
    pedido:
      'Preciso saber, por região, quantos países já tiravam mais da metade da energia de fontes renováveis. Só as regiões com pelo menos três países.',
    exemplo: 'Missão de exemplo',
    verDados: 'ver os dados',
    comentario: '-- Regiões com mais países acima de 50%',
    erro: 'Faltou fechar um parêntese. Confira o fim da linha 3.',
  },
};
