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
