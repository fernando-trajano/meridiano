/* ==========================================================================
   erros-sql.js — traduz o erro do DuckDB para uma frase simples, com pista.

   O DuckDB responde em inglês técnico ("Binder Error: Referenced column …").
   Aqui cada erro conhecido vira:
     - uma FRASE: o que aconteceu, em palavras de gente;
     - uma PISTA: o que fazer — e, sempre que dá, a pista usa o que o site
       sabe: o nome certo no outro idioma, a tabela onde a coluna mora, a
       palavra-chave que a pessoa quis digitar.
   A mensagem original fica guardada, para quem quiser ver.

   As mensagens foram colhidas do DuckDB 1.4 de verdade, no passo 7. Ao
   atualizar o motor, conferir se continuam iguais (o erro desconhecido cai
   numa frase genérica, nunca quebra a tela).

   A frase e a pista saem em HTML: nomes e trechos de código vão dentro de
   <code>, e todo texto que veio da consulta é escapado.
   ========================================================================== */

import { t } from './i18n.js';
import { dicionario } from '../dados/base/dicionario.js';
import { separar } from './traducao-sql.js';
import { escapar } from './realce.js';

/**
 * @param {string} mensagem  o erro do DuckDB
 * @param {{sql?: string, idiomaDaBase?: 'pt'|'en'}} [contexto]
 * @returns {{frase: string, pista: string|null, linha: number|null,
 *            coluna: number|null, original: string}}
 *   frase e pista em HTML; linha e coluna (a partir de 1) quando o DuckDB diz
 */
export function traduzirErro(mensagem, { sql = '', idiomaDaBase = 'pt' } = {}) {
  const original = limparOriginal(mensagem);
  const { linha, coluna } = posicao(mensagem);
  const contexto = { sql, idiomaDaBase, nomes: nomesDaBase(idiomaDaBase) };

  for (const regra of REGRAS) {
    const achado = regra.padrao.exec(original);
    if (achado) {
      const { frase, pista = null } = regra.traduzir(achado, contexto);
      return { frase, pista, linha, coluna, original };
    }
  }
  return { frase: t('erros.generico'), pista: t('erros.genericoPista'), linha, coluna, original };
}

/* --------------------------------------------------------------------------
   As regras, da mais específica para a mais geral
   -------------------------------------------------------------------------- */

const REGRAS = [
  {
    // Texto entre aspas simples sem fechar: WHERE nome_pais = 'Brazil
    padrao: /unterminated quoted string at or near "(.*)"/,
    traduzir: ([, trecho]) => ({
      frase: t('erros.textoAberto'),
      pista: t('erros.pistaTextoAberto', { exemplo: codigo(`${trecho}'`) }),
    }),
  },
  {
    padrao: /SELECT clause without selection list/,
    traduzir: () => ({ frase: t('erros.semColunas'), pista: t('erros.pistaSemColunas') }),
  },
  {
    padrao: /syntax error at end of input/,
    traduzir: (_, contexto) => ({ frase: t('erros.sintaxeFim'), pista: pistaDoFim(contexto.sql) }),
  },
  {
    padrao: /syntax error at or near "(.*?)"/,
    traduzir: ([, trecho], contexto) => ({
      frase: t('erros.sintaxePerto', { trecho: codigo(trecho) }),
      pista: pistaDaSintaxe(trecho, contexto.sql),
    }),
  },
  {
    // Table with name paisess does not exist! Did you mean "paises"?
    padrao: /Table with name "?([^"!\s]+)"? does not exist!(?:\s*Did you mean "([^"]+)")?/,
    traduzir: ([, nome, sugestao], contexto) => ({
      frase: t('erros.tabelaNaoExiste', { nome: codigo(nome) }),
      pista: pistaDeNome(nome, sugestao, contexto, 'tabela'),
    }),
  },
  {
    padrao: /(?:Scalar |Aggregate |Table )?Function with name "?([^"!\s]+)"? does not exist!(?:\s*Did you mean "([^"]+)")?/,
    traduzir: ([, nome, sugestao]) => {
      const emIngles = FUNCOES_EM_PORTUGUES[nome.toLowerCase()];
      let pista = null;
      if (emIngles) pista = t('erros.pistaFuncaoPt', { funcao: codigo(emIngles) });
      else if (sugestao && parecido(nome, sugestao)) pista = t('erros.pistaQuisDizer', { nome: codigo(sugestao) });
      return { frase: t('erros.funcaoNaoExiste', { nome: codigo(nome) }), pista };
    },
  },
  {
    // p.populacao, com p = paises: Table "p" does not have a column named "populacao"
    padrao: /Table "([^"]+)" does not have a column named "([^"]+)"/,
    traduzir: ([, tabela, nome], contexto) => ({
      frase: t('erros.colunaNaoExisteNaTabela', { tabela: codigo(tabela), nome: codigo(nome) }),
      pista: pistaDeColuna(nome, null, contexto),
    }),
  },
  {
    padrao: /Referenced column "([^"]+)" not found in FROM clause!(?:\s*Candidate bindings: "([^"]+)")?/,
    traduzir: ([, nome, candidata], contexto) => ({
      frase: t('erros.colunaNaoExiste', { nome: codigo(nome) }),
      pista: pistaDeColuna(nome, candidata, contexto),
    }),
  },
  {
    padrao: /Referenced table "([^"]+)" not found!(?:\s*Candidate tables: "([^"]+)")?/,
    traduzir: ([, apelido, tabela]) => ({
      frase: t('erros.apelidoNaoExiste', { apelido: codigo(apelido) }),
      pista: t('erros.pistaApelido', { exemplo: codigo(`FROM ${tabela ?? '…'} ${apelido}`) }),
    }),
  },
  {
    padrao: /column "([^"]+)" must appear in the GROUP BY clause/,
    traduzir: ([, nome]) => ({
      frase: t('erros.agrupar', { nome: codigo(nome) }),
      pista: t('erros.pistaAgrupar', { nome: codigo(nome) }),
    }),
  },
  {
    padrao: /Ambiguous reference to column name "([^"]+)" \(use: (.*)\)/,
    traduzir: ([, nome, opcoes]) => ({
      frase: t('erros.ambigua', { nome: codigo(nome) }),
      pista: t('erros.pistaAmbigua', {
        opcoes: [...opcoes.matchAll(/"([^"]+)"/g)].map((m) => codigo(m[1])).join(t('erros.ou')),
      }),
    }),
  },
  {
    padrao: /WHERE clause cannot contain aggregates/,
    traduzir: () => ({ frase: t('erros.agregacaoWhere'), pista: t('erros.pistaAgregacaoWhere') }),
  },
  {
    padrao: /WHERE clause cannot contain window functions/,
    traduzir: () => ({ frase: t('erros.janelaWhere'), pista: t('erros.pistaJanelaWhere') }),
  },
  {
    padrao: /Could not convert string '(.*)' to (INT\d*|BIGINT|INTEGER|DOUBLE|FLOAT|DECIMAL|HUGEINT|UINT\d*)/,
    traduzir: ([, valor]) => ({
      frase: t('erros.conversaoNumero', { valor: codigo(`'${valor}'`) }),
      pista: t('erros.pistaNumero'),
    }),
  },
  {
    padrao: /(?:invalid date field format: "(.*?)"|Could not convert string '(.*)' to DATE|date field value out of range: "(.*?)")/,
    traduzir: ([, a, b, c]) => ({
      frase: t('erros.conversaoData', { valor: codigo(`'${a ?? b ?? c}'`) }),
      pista: t('erros.pistaData'),
    }),
  },
  {
    // SUM(nome_pais): No function matches the given name and argument types 'sum(VARCHAR)'
    padrao: /No function matches the given name and argument types '(\w+)\(([^)]*)\)'/,
    traduzir: ([, funcao, tipos]) => {
      const comTexto = /VARCHAR/.test(tipos);
      return {
        frase: comTexto
          ? t('erros.funcaoComTexto', { funcao: codigo(funcao.toUpperCase()) })
          : t('erros.funcaoTipo', { funcao: codigo(funcao.toUpperCase()), tipo: codigo(tipos) }),
        pista: comTexto ? t('erros.pistaFuncaoTexto') : null,
      };
    },
  },
  {
    // 'a' + 1
    padrao: /Could not choose a best candidate function for the function call "[+\-*\/]\(STRING_LITERAL|No function matches the given name and argument types '[+\-*\/]\(VARCHAR/,
    traduzir: () => ({ frase: t('erros.contaComTexto'), pista: t('erros.pistaContaComTexto') }),
  },
  {
    padrao: /Duplicate key "([^"]+)" violates (?:primary key|unique) constraint/,
    traduzir: ([, chave]) => ({
      frase: t('erros.chaveRepetida', { chave: codigo(chave.replace(': ', ' = ')) }),
      pista: t('erros.pistaChaveRepetida'),
    }),
  },
  {
    padrao: /NOT NULL constraint failed: (?:[\w]+\.)?(\w+)/,
    traduzir: ([, nome]) => ({
      frase: t('erros.naoNulo', { nome: codigo(nome) }),
      pista: t('erros.pistaNaoNulo'),
    }),
  },
  {
    padrao: /(?:Table|View) with name "?([^"!\s]+)"? already exists!/,
    traduzir: ([, nome]) => ({
      frase: t('erros.jaExiste', { nome: codigo(nome) }),
      pista: t('erros.pistaJaExiste'),
    }),
  },
  {
    padrao: /LIMIT\/OFFSET cannot be negative/,
    traduzir: () => ({ frase: t('erros.limiteNegativo'), pista: t('erros.pistaLimiteNegativo') }),
  },
  {
    padrao: /Set operations can only apply to expressions with the same number of result columns/,
    traduzir: () => ({ frase: t('erros.uniaoColunas'), pista: t('erros.pistaUniaoColunas') }),
  },
  {
    padrao: /table (\S+) has (\d+) columns but (\d+) values were supplied/,
    traduzir: ([, tabela, colunas, valores]) => ({
      frase: t('erros.insertColunas', { tabela: codigo(tabela), colunas, valores }),
      pista: t('erros.pistaInsertColunas'),
    }),
  },
];

/* --------------------------------------------------------------------------
   Pistas que olham a consulta
   -------------------------------------------------------------------------- */

// Palavras-chave com que se compara um erro de digitação (SELEC → SELECT).
const PALAVRAS_CHAVE = [
  'SELECT', 'FROM', 'WHERE', 'GROUP', 'ORDER', 'HAVING', 'LIMIT', 'JOIN', 'LEFT', 'INNER',
  'AND', 'OR', 'NOT', 'NULL', 'BETWEEN', 'LIKE', 'DISTINCT', 'IS', 'IN', 'BY', 'DESC', 'ASC',
  'UNION', 'CASE', 'WHEN', 'THEN', 'ELSE', 'END', 'WITH', 'OVER', 'AS', 'ON', 'COUNT',
];

// O que um iniciante escreve em português achando que é SQL.
const PALAVRAS_EM_PORTUGUES = {
  selecione: 'SELECT', selecionar: 'SELECT', de: 'FROM', onde: 'WHERE', agrupar: 'GROUP BY',
  ordenar: 'ORDER BY', ordene: 'ORDER BY', limite: 'LIMIT', e: 'AND', ou: 'OR', nao: 'NOT',
  não: 'NOT', nulo: 'NULL', entre: 'BETWEEN', como: 'LIKE', distinto: 'DISTINCT',
  crescente: 'ASC', decrescente: 'DESC', juntar: 'JOIN', tendo: 'HAVING',
};

const FUNCOES_EM_PORTUGUES = {
  contar: 'COUNT', conta: 'COUNT', soma: 'SUM', somar: 'SUM', media: 'AVG', média: 'AVG',
  maximo: 'MAX', máximo: 'MAX', maior: 'MAX', minimo: 'MIN', mínimo: 'MIN', menor: 'MIN',
  arredondar: 'ROUND', maiuscula: 'UPPER', maiusculas: 'UPPER', minuscula: 'LOWER',
  minusculas: 'LOWER', tamanho: 'LENGTH', comprimento: 'LENGTH', ano: 'YEAR', mes: 'MONTH',
  mês: 'MONTH', dia: 'DAY', substituir: 'REPLACE', concatenar: 'CONCAT', absoluto: 'ABS',
  raiz: 'SQRT', coalescer: 'COALESCE',
};

const CONDICOES = ['where', 'and', 'or', 'not', 'having', 'qualify', 'like', 'in', 'between', 'on', '=', '<', '>', 'is'];

/** "A consulta acabou antes da hora": o que faltou, olhando o fim dela. */
function pistaDoFim(sql) {
  const pedacos = significativos(sql).filter((p) => p.texto !== ';');
  if (!pedacos.length) return t('erros.pistaFimGenerico', { palavra: '…' });

  if (saldoDeParenteses(pedacos) > 0) return t('erros.pistaParenteseAberto');

  const ultima = pedacos[pedacos.length - 1].texto;
  const palavra = ultima.toLowerCase();

  if (palavra === 'by') {
    const antes = pedacos[pedacos.length - 2]?.texto.toUpperCase() ?? '';
    return t('erros.pistaFimColuna', { palavra: codigo(`${antes} BY`) });
  }
  if (CONDICOES.includes(palavra)) return t('erros.pistaFimCondicao', { palavra: codigo(ultima.toUpperCase()) });
  if (palavra === 'from') return t('erros.pistaFimTabela');
  if (palavra === 'select') return t('erros.pistaFimSelect');

  // JOIN sem ON: a última palavra JOIN não tem um ON depois dela.
  const ultimoJoin = pedacos.map((p) => p.texto.toLowerCase()).lastIndexOf('join');
  if (ultimoJoin !== -1 && !pedacos.slice(ultimoJoin).some((p) => ['on', 'using'].includes(p.texto.toLowerCase()))) {
    return t('erros.pistaFimOn');
  }
  return t('erros.pistaFimGenerico', { palavra: codigo(ultima) });
}

/** "Não entendeu a partir de X": vírgula, parêntese, palavra mal escrita… */
function pistaDaSintaxe(trecho, sql) {
  const palavra = trecho.toLowerCase();

  if (PALAVRAS_EM_PORTUGUES[palavra]) {
    return t('erros.pistaPalavraPt', { palavra: codigo(PALAVRAS_EM_PORTUGUES[palavra]), trecho: codigo(trecho) });
  }

  const pedacos = significativos(sql);
  const indice = pedacos.findIndex((p) => p.texto === trecho);
  const anterior = indice > 0 ? pedacos[indice - 1].texto : '';

  // "FROM paises ONDE codigo_regiao = …": o DuckDB entende ONDE como apelido
  // da tabela e só reclama da palavra seguinte. O engano está na anterior.
  // (Só palavras de 3 letras ou mais: "e" ou "de" logo antes podem ser um
  // apelido de verdade, como em FROM equipe e.)
  if (anterior.length >= 3 && PALAVRAS_EM_PORTUGUES[anterior.toLowerCase()]) {
    return t('erros.pistaPalavraPt', {
      palavra: codigo(PALAVRAS_EM_PORTUGUES[anterior.toLowerCase()]),
      trecho: codigo(anterior),
    });
  }

  if (trecho === ',') return t('erros.pistaVirgula');
  if (anterior === ',') return t('erros.pistaVirgulaSobrando', { trecho: codigo(trecho) });
  if (trecho === ')') return t('erros.pistaParenteseVazio');
  if (indice !== -1 && saldoDeParenteses(pedacos.slice(0, indice)) > 0 && /^[a-z]+$/.test(palavra)) {
    return t('erros.pistaParenteseAntes', { trecho: codigo(trecho) });
  }

  // Erro de digitação numa palavra-chave: SELEC, FORM, nul…
  if (/^[a-z]{2,}$/.test(palavra) && !PALAVRAS_CHAVE.includes(trecho.toUpperCase())) {
    const perto = PALAVRAS_CHAVE.find((p) => distancia(palavra, p.toLowerCase()) <= (p.length > 4 ? 2 : 1));
    if (perto) return t('erros.pistaQuisDizer', { nome: codigo(perto) });
  }
  return t('erros.pistaConfira', { trecho: codigo(trecho) });
}

/** Tabela que não existe: é o nome do outro idioma? um erro de digitação? */
function pistaDeNome(nome, sugestao, { idiomaDaBase, nomes }, tipo) {
  const noOutroIdioma = nomes.traduzir(nome);
  if (noOutroIdioma && nomes.tabelas.has(noOutroIdioma)) {
    return t(idiomaDaBase === 'pt' ? 'erros.pistaTabelaEmPt' : 'erros.pistaTabelaEmEn', { nome: codigo(noOutroIdioma) });
  }
  // A sugestão do DuckDB só vale se for parecida de verdade ("countries" →
  // "autorias" não ajuda ninguém).
  const perto = [...nomes.tabelas].find((tabela) => parecido(nome, tabela));
  if (perto) return t('erros.pistaQuisDizer', { nome: codigo(perto) });
  if (sugestao && parecido(nome, sugestao)) return t('erros.pistaQuisDizer', { nome: codigo(sugestao) });
  return tipo === 'tabela' ? t('erros.pistaVerTabelas') : null;
}

/** Coluna que não existe: aspas trocadas? outro idioma? outra tabela? erro de digitação? */
function pistaDeColuna(nome, candidata, { sql, idiomaDaBase, nomes }) {
  // WHERE nome_pais = "Brazil": aspas duplas em volta de um valor.
  if (new RegExp(`"${escaparRegex(nome)}"`).test(sql)) {
    return t('erros.pistaAspasDuplas', { exemplo: codigo(`'${nome}'`) });
  }

  const noOutroIdioma = nomes.traduzir(nome);
  if (noOutroIdioma && nomes.colunas.has(noOutroIdioma)) {
    return t(idiomaDaBase === 'pt' ? 'erros.pistaColunaEmPt' : 'erros.pistaColunaEmEn', { nome: codigo(noOutroIdioma) });
  }

  // Uma coluna do FROM parecida, ou que começa igual: "nome" → "nome_pais".
  // Vem antes da busca em outras tabelas porque é o engano mais provável
  // ("nome" também existe em equipe, mas quem consulta paises quis nome_pais).
  const x = nome.toLowerCase();
  if (candidata && (parecido(nome, candidata) || (x.length >= 3 && candidata.startsWith(x)))) {
    return t('erros.pistaQuisDizer', { nome: codigo(candidata) });
  }

  // A coluna existe, mas em outra tabela: populacao fica em pais_ano.
  const donas = nomes.tabelasDaColuna.get(x);
  if (donas?.length) {
    return t('erros.pistaOutraTabela', { nome: codigo(nome), tabela: donas.map(codigo).join(t('erros.ou')) });
  }

  // WHERE nome_pais = Brazil: um valor sem aspas (começa com maiúscula e
  // não se parece com nenhuma coluna).
  if (/^[A-Z]/.test(nome)) {
    return t('erros.pistaSemAspas', { nome: codigo(nome), exemplo: codigo(`'${nome}'`) });
  }

  const perto = [...nomes.colunas].find((coluna) => parecido(nome, coluna));
  return perto ? t('erros.pistaQuisDizer', { nome: codigo(perto) }) : null;
}

/* --------------------------------------------------------------------------
   Nomes da base, nos dois idiomas
   -------------------------------------------------------------------------- */

const cacheDeNomes = {};

/** Tabelas e colunas no idioma da base, e a ponte para o outro idioma. */
function nomesDaBase(idiomaDaBase) {
  if (cacheDeNomes[idiomaDaBase]) return cacheDeNomes[idiomaDaBase];

  const emPt = idiomaDaBase === 'pt';
  const tabelas = new Set();
  const colunas = new Set();
  const tabelasDaColuna = new Map();
  const doOutroIdioma = new Map();   // nome no outro idioma → nome no idioma da base

  for (const [tabelaEn, tabela] of Object.entries(dicionario)) {
    const nomeTabela = emPt ? tabela.pt : tabelaEn;
    tabelas.add(nomeTabela);
    doOutroIdioma.set(emPt ? tabelaEn : tabela.pt, nomeTabela);

    for (const [colunaEn, coluna] of Object.entries(tabela.colunas)) {
      const nomeColuna = emPt ? coluna.pt : colunaEn;
      colunas.add(nomeColuna);
      doOutroIdioma.set(emPt ? colunaEn : coluna.pt, nomeColuna);
      if (!tabelasDaColuna.has(nomeColuna)) tabelasDaColuna.set(nomeColuna, []);
      tabelasDaColuna.get(nomeColuna).push(nomeTabela);
    }
  }

  // Um nome que é igual nos dois idiomas (latitude, gini) não é "do outro idioma".
  const traduzir = (nome) => {
    const traduzido = doOutroIdioma.get(nome.toLowerCase());
    return traduzido && traduzido !== nome.toLowerCase() ? traduzido : null;
  };

  cacheDeNomes[idiomaDaBase] = { tabelas, colunas, tabelasDaColuna, traduzir };
  return cacheDeNomes[idiomaDaBase];
}

/* --------------------------------------------------------------------------
   Utilidades
   -------------------------------------------------------------------------- */

/** Um trecho de código dentro da frase: <code>, com o texto escapado. */
function codigo(texto) {
  return `<code>${escapar(String(texto))}</code>`;
}

/** Os pedaços da consulta sem espaços e comentários. */
function significativos(sql) {
  return separar(sql || '').filter((p) => p.tipo !== 'espaco' && p.tipo !== 'comentario');
}

/** Parênteses abertos menos fechados. */
function saldoDeParenteses(pedacos) {
  return pedacos.reduce((saldo, p) => saldo + (p.texto === '(') - (p.texto === ')'), 0);
}

/** Parecido o bastante para valer um "Você quis dizer…?" */
function parecido(a, b) {
  const x = a.toLowerCase();
  const y = b.toLowerCase();
  if (x === y) return false;
  const limite = Math.max(1, Math.floor(Math.min(x.length, y.length) / 3));
  return distancia(x, y) <= limite;
}

/** Distância de edição (Levenshtein): quantas letras trocar, pôr ou tirar. */
function distancia(a, b) {
  const linha = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i += 1) {
    let diagonal = linha[0];
    linha[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const guardado = linha[j];
      linha[j] = Math.min(linha[j] + 1, linha[j - 1] + 1, diagonal + (a[i - 1] === b[j - 1] ? 0 : 1));
      diagonal = guardado;
    }
  }
  return linha[b.length];
}

function escaparRegex(texto) {
  return texto.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/** A posição que o DuckDB aponta com "LINE 3:" e o "^" embaixo. */
function posicao(mensagem) {
  const achado = /LINE (\d+): (.*)\n( *)\^/.exec(mensagem);
  if (!achado) return { linha: null, coluna: null };
  const prefixo = `LINE ${achado[1]}: `.length;
  return { linha: Number(achado[1]), coluna: Math.max(1, achado[3].length - prefixo + 1) };
}

/** A mensagem original, sem o trecho "LINE …" repetido que o DuckDB às vezes duplica. */
function limparOriginal(mensagem) {
  const partes = String(mensagem).split('\n\n');
  return partes.filter((parte, i) => partes.indexOf(parte) === i).join('\n\n').trim();
}
