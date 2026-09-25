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
    sair: 'Sair',
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

  missao: {
    // Na linha do cabeçalho: "Módulo 0 · Missão 2 de 3".
    contexto: 'Módulo {n} · Missão {i} de {total}',
    naoEncontrada: 'Essa missão não existe — ou ainda não foi escrita.',
    voltarInicio: 'Voltar à trilha',
    avisoCelular: 'As missões funcionam melhor num computador, com teclado. Dá para ler daqui, mas escrever SQL no celular é difícil.',
    // A linha do meridiano, com as etapas.
    linhaEtapas: 'Etapas da missão',
    etapaDe: '{n} de {total}',
    etapaRotulo: '{nome}, etapa {n} de {total}',
    etapas: {
      pedido: 'Pedido',
      conceito: 'Conceito',
      palpite: 'Palpite',
      tente: 'Tente você',
      semAjuda: 'Sem ajuda',
      desafio: 'Desafio',
      desafioN: 'Desafio {n}',
      entrega: 'Entrega',
    },
    // As abas das seções da bancada.
    abas: {
      tabela: 'Tabela {nome}',
      exemplo: 'Exemplo',
      consulta: 'Consulta',
      resultado: 'Resultado',
    },
    // A barra da Consulta: as tabelas da tarefa e a lista de colunas.
    tabela: 'tabela',
    tabelas: 'tabelas',
    colunas: 'Colunas:',
    verLinhas: 'ver 5 linhas',
    previa: 'prévia de {nome} · {n} de {total} linhas',
    amostraInfo: 'mostrando {n} de {total} linhas',
    entenderConceito: 'Entender o conceito',
    comecar: 'Começar',
    lembretePedido: 'Pedido: {resumo}',
    irPalpite: 'Dar um palpite',
    seuPalpite: 'Seu palpite',
    palpiteAntes: 'Escolha uma opção para rodar o exemplo.',
    palpiteCerto: 'Isso mesmo.',
    palpiteErrado: 'Não é essa — a certa está marcada. Confira no resultado.',
    tentar: 'Agora é com você',
    suaTarefa: 'Sua tarefa',
    pista: 'Pedir uma pista',
    esqueleto: 'Ver o esqueleto',
    resposta: 'Ver a resposta',
    respostaConfirma: 'Ver mesmo? Com a resposta, a missão vale 1 estrela.',
    dicaPista: 'Pista',
    dicaEsqueleto: 'Esqueleto',
    dicaResposta: 'Resposta',
    levarEditor: 'Levar para o editor',
    resultadoVazio: 'Rode a consulta para ver o resultado aqui.',
    resolvido: 'Resolvido.',
    proximo: 'Continuar',
    entregue: 'Entregue',
    estrelasRotulo: '{n} de 3 estrelas',
    estrelas3: 'Três estrelas: sem nenhuma dica.',
    estrelas2: 'Duas estrelas: com dicas, sem ver a resposta.',
    estrelas1: 'Uma estrela: com a resposta. Vale refazer depois, sem ela.',
    melhorMarca: 'A sua melhor marca nesta missão continua valendo: {n} de 3 estrelas.',
    moduloLiberado: 'Módulo {n} liberado: {titulo}.',
    diaUnidade: 'dia seguido',
    diasUnidade: 'dias seguidos',
    proximaMissao: 'Próxima missão',
    ultimaEscrita: 'Esta é a última missão escrita, por enquanto.',
    bloqueadaTitulo: 'Esta missão ainda está fechada',
    bloqueadaTexto: 'Ela abre quando você concluir o desafio final do módulo {n} — {titulo}.',
  },

  // O painel "Seu progresso" (início e trilha).
  painelProgresso: {
    rotulo: 'Seu progresso',
    diaSeguido: 'dia seguido praticando',
    diasSeguidos: 'dias seguidos praticando',
    deTotal: 'de {total}',
    missoesConcluidas: 'missões concluídas',
    conceitosEscapam: 'Conceitos que mais escapam',
    semConceitos: 'Nada por enquanto.',
  },

  // O início: a tela de quem volta (passo 16).
  inicio: {
    titulo: 'De volta ao Observatório',
    tituloNovo: 'Tudo pronto para começar',
    paradoEm: 'Você parou em',
    comecarPor: 'Comece por',
    doModulo: 'Módulo {n} · {titulo}',
    feitasDoModulo: '{n} de {total} feitas',
    continuar: 'Continuar de onde parei',
    comecar: 'Começar',
    tudoFeito: 'Todas as missões escritas estão feitas. As próximas chegam em ondas.',
    irPara: 'Ir para',
    atalhos: {
      trilha: 'Trilha',
      trilhaDescricao: 'Os 10 módulos, com o que você já fez e o que falta.',
      nivelamento: 'Nivelamento',
      nivelamentoDescricao: 'Seis desafios que liberam o que você já sabe.',
      laboratorio: 'Laboratório',
      laboratorioDescricao: 'A base inteira para consultas livres, com CSV e histórico.',
      cola: 'Cola',
      colaDescricao: 'A sintaxe por cláusula, as funções e o mapa das tabelas.',
      jogos: 'Jogos',
      jogosDescricao: 'Palpite, Telegrama e Infiltrado: SQL em partidas curtas.',
    },
  },

  // A entrada: a primeira tela de quem nunca esteve aqui (passo 15).
  entrada: {
    titulo: 'Aprenda SQL com dados do mundo real',
    fatoMissoes: '{escritas} missões prontas hoje, de {total} no caminho inteiro.',
    fatoNavegador: 'SQL de verdade rodando no seu navegador.',
    fatoDados: 'Dados do Banco Mundial, de 2000 a 2023.',
    comecar: 'Começar a primeira missão',
    jaSei: 'Já sei um pouco de SQL',
    verTrilha: 'Ver a trilha inteira',
  },

  // O nivelamento: 6 desafios que liberam o que a pessoa já sabe (passo 15).
  nivelamento: {
    titulo: 'Nivelamento',
    contexto: 'Nivelamento · desafio {n} de {total}',
    linha: 'Desafios do nivelamento',
    desafio: 'Desafio',
    explica: 'Seis desafios, do mais simples ao mais difícil. Cada acerto libera um módulo da trilha. Não há dicas: se não souber um, é só dizer — o nivelamento para ali, e nada do que já estava liberado volta a fechar.',
    comecar: 'Começar o nivelamento',
    comoFunciona: 'Como funciona',
    libera: 'Libera o módulo {n} — {titulo}',
    naoSei: 'Não sei fazer este',
    proximo: 'Próximo desafio',
    verResultado: 'Ver o resultado',
    resultadoTitulo: 'Resultado',
    nenhum: 'Tudo bem: você começa pelo módulo 0, do jeito que a trilha foi pensada.',
    alguns: 'Você acertou {n} de {total}: a trilha está aberta até o módulo {ultimo}.',
    todos: 'Você acertou os {total}: a trilha está aberta até o módulo {ultimo}.',
    seguirPara: 'Começar: {titulo}',
    acertou: 'acertou',
    naoRespondido: 'não respondido',
  },

  // A trilha (o visual chegou no redesenho depois do passo 12; o
  // desbloqueio e o resto da lógica são o passo 14).
  trilha: {
    titulo: 'Trilha',
    subtitulo: '10 módulos, do primeiro `SELECT` à análise moderna.',
    continuar: 'Continuar',
    comecar: 'Começar',
    modulo: 'Módulo {n}',
    modulos: 'Módulos da trilha',
    feitas: '{n} de {total}',
    missoesN: '{n} missões',
    emBreve: 'em breve',
    bloqueado: 'bloqueado',
    libera: 'Abre quando você concluir o desafio final do módulo {n}.',
    feita: 'feita',
    atual: 'a de agora',
    aFazer: 'a fazer',
    tudoFeito: 'Todas as missões escritas estão feitas.',
    sequencia: 'Sequência',
    missoes: 'Missões',
    deTotal: 'de {total}',
    // Os nomes de alguns conceitos no painel "Conceitos que mais escapam".
    conceitos: {
      colunas: 'escolher colunas',
      contas: 'contas',
      apelidos: 'AS (apelidos)',
      comparacoes: 'comparações',
      juntar: '|| (juntar)',
      comentario: '-- (comentário)',
      asterisco: '* (todas as colunas)',
      igual: '= (igual)',
    },
  },

  editor: {
    rotulo: 'Editor de SQL',
    dica: '{rodar} roda · {comentar} comenta a linha · {formatar} formata · Esc e depois Tab sai do editor',
    rodarTitulo: 'Rodar ({atalho})',
    formatarTitulo: 'Formatar consulta ({atalho})',
    rodar: 'Rodar',
    formatar: 'Formatar',
    sugestoes: 'Sugestões',
    tabela: 'tabela',
    coluna: 'coluna · {tabela}',
    palavraChave: 'palavra-chave',
    funcao: 'função',
  },

  resultado: {
    linhas: '{n} linhas',
    umaLinha: '1 linha',
    mostrando: 'mostrando {n}',
    ms: '{ms} ms',
    nenhuma: 'A consulta rodou, mas nenhuma linha passou.',
    comando: 'Comando executado.',
    tabela: 'Resultado da consulta',
    linhaDoErro: 'linha {linha}',
    original: 'Mensagem original do DuckDB',
  },

  // O Passo a passo: a consulta na ordem em que o banco a lê.
  passoAPasso: {
    titulo: 'Passo a passo',
    contador: '{n} de {total}',
    anterior: 'Anterior',
    proximo: 'Próximo',
    notaInicio: 'Você escreve o `SELECT` em cima, mas o banco começa por aqui.',
    amostra: 'Mostrando {n} de {total} linhas',
  },

  // A conferência pelo resultado (js/conferir.js). {recurso} chega como código.
  conferir: {
    certo: 'Resultado certo.',
    colunasAMais: 'Seu resultado tem {aluno}; o pedido pede {esperado}. Sobrou coluna no `SELECT`.',
    colunasAMenos: 'Seu resultado tem {aluno}; o pedido pede {esperado}. Faltou coluna no `SELECT`.',
    linhasAMais: 'Seu resultado tem {aluno}; o pedido tem {esperado}. Faltou algum filtro?',
    linhasFaltando: 'Seu resultado tem {aluno}; o pedido tem {esperado}. O filtro não ficou apertado demais?',
    linhasVazio: 'Seu resultado veio vazio; o pedido tem {esperado}. O filtro não ficou apertado demais?',
    colunaDiferente: 'O número de linhas bate, mas os valores da coluna {posicao} não são os esperados. Confira essa coluna do `SELECT` — e o filtro.',
    linhasDiferentes: 'O número de linhas bate, mas {quantas} delas não são as esperadas. Confira o filtro.',
    linhasDiferentesUma: 'O número de linhas bate, mas uma delas não é a esperada. Confira o filtro.',
    ordem: 'As linhas estão certas, mas na ordem errada. Confira o `ORDER BY`.',
    faltaRecurso: 'O resultado está certo, mas esta missão pede que você use {recurso}.',
    // Singular e plural das contagens acima.
    umaColuna: '1 coluna',
    nColunas: '{n} colunas',
    umaLinha: '1 linha',
    nLinhas: '{n} linhas',
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
    semColunas: 'Depois de `SELECT` falta dizer quais colunas mostrar.',
    pistaSemColunas: 'Use * para todas, ou escreva os nomes separados por vírgula.',
    pistaQuisDizer: 'Você quis dizer {nome}?',
    pistaPalavraPt: 'SQL usa as palavras em inglês: {palavra}, e não {trecho}.',
    pistaVirgula: 'Confira as vírgulas: entre duas colunas vai exatamente uma.',
    pistaVirgulaSobrando: 'Há uma vírgula sobrando antes de {trecho}.',
    pistaParenteseVazio: 'Falta alguma coisa antes deste parêntese — por exemplo, a coluna dentro de `COUNT(DISTINCT …)`.',
    pistaParenteseAntes: 'Um parêntese aberto antes de {trecho} não foi fechado.',
    pistaParenteseAberto: 'Um parêntese foi aberto e não foi fechado.',
    pistaConfira: 'Confira {trecho} e o que vem logo antes dele.',
    pistaFimCondicao: 'Depois de {palavra} falta a condição — por exemplo, `ano = 2023`.',
    pistaFimColuna: 'Depois de {palavra} falta dizer a coluna.',
    pistaFimTabela: 'Depois de `FROM` falta o nome da tabela.',
    pistaFimSelect: 'Depois de `SELECT` vêm as colunas, separadas por vírgula.',
    pistaFimOn: 'Depois do `JOIN` falta o `ON`, que diz como as tabelas se ligam: … `ON a.coluna = b.coluna`.',
    pistaFimGenerico: 'Falta alguma coisa depois de {palavra}.',
    tabelaNaoExiste: 'Não existe tabela chamada {nome}.',
    pistaTabelaEmPt: 'Com o site em português, essa tabela se chama {nome}.',
    pistaTabelaEmEn: 'Com o site em inglês, essa tabela se chama {nome}.',
    pistaVerTabelas: 'Confira o nome da tabela: as 11 tabelas da base estão na cola.',
    funcaoNaoExiste: 'Não existe a função {nome}.',
    pistaFuncaoPt: 'Em SQL, as funções têm nome em inglês: {funcao}.',
    colunaNaoExiste: 'A coluna {nome} não existe nas tabelas do `FROM`.',
    colunaNaoExisteNaTabela: 'A tabela {tabela} não tem a coluna {nome}.',
    pistaColunaEmPt: 'Com o site em português, essa coluna se chama {nome}.',
    pistaColunaEmEn: 'Com o site em inglês, essa coluna se chama {nome}.',
    pistaOutraTabela: 'A coluna {nome} fica na tabela {tabela}, que não está no `FROM`.',
    pistaAspasDuplas: 'Texto vai entre aspas simples: {exemplo}. Aspas duplas são para nomes de coluna.',
    pistaSemAspas: 'Se {nome} é um valor, e não uma coluna, ele vai entre aspas simples: {exemplo}.',
    apelidoNaoExiste: 'A consulta usa {apelido}, mas nenhuma tabela ou apelido do `FROM` tem esse nome.',
    pistaApelido: 'Dê o apelido no `FROM` — por exemplo, {exemplo} — ou use o nome da tabela.',
    agrupar: 'A coluna {nome} está no `SELECT`, mas não no `GROUP BY`.',
    pistaAgrupar: 'Ponha {nome} no `GROUP BY`, ou resuma-a com uma função, como `COUNT`, `MAX` ou `MIN`.',
    ambigua: 'A coluna {nome} existe em mais de uma tabela da consulta.',
    pistaAmbigua: 'Diga de qual tabela ela vem: {opcoes}.',
    agregacaoWhere: 'O `WHERE` não pode usar `COUNT`, `SUM`, `AVG`, `MIN` ou `MAX`.',
    pistaAgregacaoWhere: 'O `WHERE` filtra as linhas antes de agrupar. Para filtrar os grupos, use `HAVING`, depois do `GROUP BY`.',
    janelaWhere: 'O `WHERE` não pode usar funções de janela, como `ROW_NUMBER`.',
    pistaJanelaWhere: 'Para filtrar pelo resultado delas, use `QUALIFY` — ou calcule antes numa subconsulta.',
    conversaoNumero: 'Não deu para transformar {valor} em número.',
    pistaNumero: 'Números vão sem aspas: 10, e não \'10\' nem \'dez\'.',
    conversaoData: 'Não deu para transformar {valor} em data.',
    pistaData: 'Datas vão entre aspas simples, no formato ano-mês-dia: \'2024-03-05\'.',
    funcaoComTexto: 'A função {funcao} não funciona com texto.',
    funcaoTipo: 'A função {funcao} não aceita esse tipo de valor ({tipo}).',
    pistaFuncaoTexto: 'Ela precisa de números. Confira qual coluna está entre os parênteses.',
    contaComTexto: 'Não dá para fazer contas com texto.',
    pistaContaComTexto: 'Para juntar textos, use `||`. Para somar, os dois lados precisam ser números.',
    chaveRepetida: 'Já existe uma linha com a chave {chave}.',
    pistaChaveRepetida: 'Uma chave primária não se repete. Use outro valor, ou mude a linha que já existe com `UPDATE`.',
    naoNulo: 'A coluna {nome} não aceita ficar vazia (`NULL`).',
    pistaNaoNulo: 'Dê um valor para ela no `INSERT`.',
    jaExiste: 'Já existe uma tabela chamada {nome}.',
    pistaJaExiste: 'Use outro nome, ou `CREATE OR REPLACE TABLE` para trocar a antiga.',
    limiteNegativo: 'O `LIMIT` não pode ser negativo.',
    pistaLimiteNegativo: 'Use um número inteiro a partir de 0.',
    uniaoColunas: 'As consultas unidas devolvem números diferentes de colunas.',
    pistaUniaoColunas: 'Com `UNION`, `INTERSECT` e `EXCEPT`, os dois lados precisam ter a mesma quantidade de colunas, na mesma ordem.',
    insertColunas: 'A tabela {tabela} tem {colunas} colunas, mas vieram {valores} valores.',
    pistaInsertColunas: 'Dê um valor para cada coluna, ou diga quais colunas preencher: `INSERT INTO tabela (coluna1, coluna2) VALUES (…)`.',
  },


  // O texto da abertura (a reserva do index.html, antes do JavaScript).
  // Muda de lugar quando a tela de entrada chegar, no passo 16.
  vitrine: {
    texto:
      'Você entra como analista de dados de um instituto de pesquisa em Genebra. Cada lição é uma missão: o pedido de um pesquisador, resolvido com SQL sobre dados de mais de 200 países.',
  },
};
