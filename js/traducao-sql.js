/* ==========================================================================
   traducao-sql.js — traduz os NOMES de tabela e coluna de uma consulta,
   de inglês para português e de volta.

   Para que serve:
     - os gabaritos das missões são escritos UMA vez, em inglês, e traduzidos
       na hora quando a tela está em português;
     - ao trocar de idioma, a consulta que está no editor acompanha.

   O que ele NUNCA toca:
     - o que está entre aspas simples ('Brazil' continua 'Brazil');
     - comentários (os de linha, com dois hífens, e os de bloco, entre barra
       e asterisco);
     - palavras-chave e funções (SELECT, COUNT…);
     - um nome seguido de "(": é chamada de função — year(data) é a função
       year, não a coluna year;
     - o YEAR de EXTRACT(YEAR FROM …) e de INTERVAL 1 YEAR, que é palavra-
       chave de tempo, e não a coluna;
     - apelidos e nomes que não estão no dicionário.

   Nomes entre aspas duplas ("country_name") SÃO traduzidos: em SQL, aspas
   duplas marcam um nome, não um texto.

   Limite conhecido: um apelido igual a um nome da base no idioma de origem
   é traduzido junto (… AS population vira … AS populacao). Não muda o
   resultado — a conferência não olha nomes de coluna —, mas é por isso que
   os gabaritos evitam apelidos iguais a nomes do OUTRO idioma.

   A tradução é de mão dupla e sem ambiguidade porque o dicionário garante
   que cada nome em inglês tem um só par em português, e vice-versa (a
   função conferirMapa, lá embaixo, confere isso ao carregar).
   ========================================================================== */

import { dicionario } from '../dados/base/dicionario.js';

/* --------------------------------------------------------------------------
   Os dois mapas, montados uma vez a partir do dicionário
   -------------------------------------------------------------------------- */

const mapas = { en: new Map(), pt: new Map() };   // mapas[de] : nome → nome no outro idioma

for (const [tabelaEn, tabela] of Object.entries(dicionario)) {
  registrar(tabelaEn, tabela.pt);
  for (const [colunaEn, coluna] of Object.entries(tabela.colunas)) {
    registrar(colunaEn, coluna.pt);
  }
}

function registrar(en, pt) {
  mapas.en.set(en, pt);
  mapas.pt.set(pt, en);
}

/**
 * Confere que a tradução é de mão dupla: nenhum nome em português pode vir
 * de dois nomes em inglês diferentes (e vice-versa). Avisa no console.
 * @returns {string[]} os conflitos encontrados (vazio = tudo certo)
 */
export function conferirMapa() {
  const conflitos = [];
  const vistos = { en: new Map(), pt: new Map() };

  for (const [tabelaEn, tabela] of Object.entries(dicionario)) {
    const pares = [[tabelaEn, tabela.pt]].concat(
      Object.entries(tabela.colunas).map(([en, c]) => [en, c.pt])
    );
    for (const [en, pt] of pares) {
      if (vistos.en.has(en) && vistos.en.get(en) !== pt) {
        conflitos.push(`"${en}" vira "${vistos.en.get(en)}" e "${pt}"`);
      }
      if (vistos.pt.has(pt) && vistos.pt.get(pt) !== en) {
        conflitos.push(`"${pt}" volta como "${vistos.pt.get(pt)}" e "${en}"`);
      }
      vistos.en.set(en, pt);
      vistos.pt.set(pt, en);
    }
  }

  if (conflitos.length) console.warn('[traducao-sql] Nomes ambíguos no dicionário:', conflitos);
  return conflitos;
}

/* --------------------------------------------------------------------------
   Tradução
   -------------------------------------------------------------------------- */

/**
 * Traduz os nomes de tabela e coluna de uma consulta.
 * @param {string} sql
 * @param {'en'|'pt'} de    idioma em que a consulta está escrita
 * @param {'en'|'pt'} para  idioma de destino
 * @returns {string}
 */
export function traduzirSQL(sql, de, para) {
  if (de === para || !sql) return sql;
  const mapa = mapas[de];

  const pedacos = separar(sql);
  return pedacos
    .map((pedaco, i) => {
      if (pedaco.tipo === 'nome') {
        if (ehChamadaDeFuncao(pedacos, i) || ehPalavraDeTempo(pedacos, i)) return pedaco.texto;
        return trocar(pedaco.texto, mapa);
      }
      if (pedaco.tipo === 'nome-entre-aspas') {
        const dentro = pedaco.texto.slice(1, -1);
        const traduzido = mapa.get(dentro.toLowerCase());
        return traduzido ? `"${traduzido}"` : pedaco.texto;
      }
      return pedaco.texto;
    })
    .join('');
}

/** Troca um nome pelo par, mantendo MAIÚSCULAS se o original estava assim. */
function trocar(nome, mapa) {
  const traduzido = mapa.get(nome.toLowerCase());
  if (!traduzido) return nome;
  return nome === nome.toUpperCase() && nome !== nome.toLowerCase()
    ? traduzido.toUpperCase()
    : traduzido;
}

/** O próximo pedaço que não é espaço nem comentário, em qualquer direção. */
function vizinho(pedacos, i, passo) {
  for (let j = i + passo; j >= 0 && j < pedacos.length; j += passo) {
    if (pedacos[j].tipo !== 'espaco' && pedacos[j].tipo !== 'comentario') return j;
  }
  return -1;
}

/** Um nome seguido de "(" é chamada de função: year(x), count(*)… */
function ehChamadaDeFuncao(pedacos, i) {
  const j = vizinho(pedacos, i, 1);
  return j !== -1 && pedacos[j].texto === '(';
}

/**
 * YEAR como palavra-chave de tempo, e não como coluna:
 *   EXTRACT(YEAR FROM data)   — vem logo depois de "EXTRACT ("
 *   INTERVAL 1 YEAR           — vem logo depois de um número ou de um texto
 */
function ehPalavraDeTempo(pedacos, i) {
  if (pedacos[i].texto.toLowerCase() !== 'year') return false;

  const antes = vizinho(pedacos, i, -1);
  if (antes === -1) return false;
  const anterior = pedacos[antes];

  if (anterior.tipo === 'numero' || anterior.tipo === 'texto') return true;

  if (anterior.texto === '(') {
    const antesDoParentese = vizinho(pedacos, antes, -1);
    return antesDoParentese !== -1 && pedacos[antesDoParentese].texto.toLowerCase() === 'extract';
  }
  return false;
}

/* --------------------------------------------------------------------------
   Separar a consulta em pedaços
   -------------------------------------------------------------------------- */

/**
 * Corta a consulta em pedaços com tipo: nome, nome-entre-aspas, texto
 * (entre aspas simples), comentario, numero, espaco e simbolo. Juntar os
 * pedaços de volta devolve a consulta exatamente como era.
 * @param {string} sql
 * @returns {{tipo: string, texto: string}[]}
 */
export function separar(sql) {
  const pedacos = [];
  let i = 0;

  while (i < sql.length) {
    const c = sql[i];
    const resto = sql.slice(i);
    let m;

    if (resto.startsWith('--')) {
      const fim = sql.indexOf('\n', i);
      const ate = fim === -1 ? sql.length : fim;
      pedacos.push({ tipo: 'comentario', texto: sql.slice(i, ate) });
      i = ate;
    } else if (resto.startsWith('/*')) {
      const fim = sql.indexOf('*/', i + 2);
      const ate = fim === -1 ? sql.length : fim + 2;
      pedacos.push({ tipo: 'comentario', texto: sql.slice(i, ate) });
      i = ate;
    } else if (c === "'") {
      // Texto entre aspas simples; '' dentro dele é uma aspa escapada.
      let j = i + 1;
      while (j < sql.length) {
        if (sql[j] === "'" && sql[j + 1] === "'") j += 2;
        else if (sql[j] === "'") break;
        else j += 1;
      }
      pedacos.push({ tipo: 'texto', texto: sql.slice(i, j + 1) });
      i = j + 1;
    } else if (c === '"') {
      const fim = sql.indexOf('"', i + 1);
      const ate = fim === -1 ? sql.length : fim + 1;
      pedacos.push({ tipo: 'nome-entre-aspas', texto: sql.slice(i, ate) });
      i = ate;
    } else if ((m = /^[A-Za-z_][A-Za-z0-9_$]*/.exec(resto))) {
      pedacos.push({ tipo: 'nome', texto: m[0] });
      i += m[0].length;
    } else if ((m = /^\d+(\.\d+)?([eE][+-]?\d+)?/.exec(resto))) {
      pedacos.push({ tipo: 'numero', texto: m[0] });
      i += m[0].length;
    } else if ((m = /^\s+/.exec(resto))) {
      pedacos.push({ tipo: 'espaco', texto: m[0] });
      i += m[0].length;
    } else {
      pedacos.push({ tipo: 'simbolo', texto: c });
      i += 1;
    }
  }

  return pedacos;
}

/**
 * O SQL de um campo de missão (exemplo, amostra, dica…) no idioma
 * pedido. O campo pode vir de dois jeitos:
 *   - texto: SQL escrito UMA vez, em inglês — traduzido aqui;
 *   - { pt, en }: cada idioma escrito à mão, com os seus nomes — para quando
 *     há apelidos ou comentários, que o tradutor não traduz (AS milhoes /
 *     AS millions; -- Todas as regiões / -- All regions).
 * @param {string|{pt: string, en: string}} valor
 * @param {'pt'|'en'} idiomaAlvo
 * @returns {string}
 */
export function sqlNoIdioma(valor, idiomaAlvo) {
  if (valor && typeof valor === 'object') return valor[idiomaAlvo] ?? valor.en ?? '';
  return traduzirSQL(valor ?? '', 'en', idiomaAlvo);
}

/** A versão em inglês de um campo de SQL de missão (para as conferências). */
export function sqlEmIngles(valor) {
  return valor && typeof valor === 'object' ? valor.en ?? '' : valor ?? '';
}

/* --------------------------------------------------------------------------
   Nomes, para quem precisar (bd.js, autocompletar, cola)
   -------------------------------------------------------------------------- */

/**
 * O nome de uma tabela ou coluna (dado em inglês) no idioma pedido.
 * @param {string} nomeEn
 * @param {'en'|'pt'} idioma
 */
export function nomeNoIdioma(nomeEn, idioma) {
  return idioma === 'pt' ? mapas.en.get(nomeEn) ?? nomeEn : nomeEn;
}

/**
 * As tabelas que uma consulta em inglês usa (nomes em inglês, na ordem em
 * que aparecem, sem repetir). Um nome logo depois de "." é coluna, não
 * tabela — nunca conta.
 * @param {string} sql
 * @returns {string[]}
 */
export function tabelasDoSQL(sql) {
  const achadas = [];
  const pedacos = separar(sql ?? '').filter((p) => p.tipo !== 'espaco' && p.tipo !== 'comentario');
  pedacos.forEach((pedaco, i) => {
    const nome = pedaco.texto.toLowerCase();
    if (pedaco.tipo !== 'nome' || !dicionario[nome] || pedacos[i - 1]?.texto === '.') return;
    if (!achadas.includes(nome)) achadas.push(nome);
  });
  return achadas;
}
