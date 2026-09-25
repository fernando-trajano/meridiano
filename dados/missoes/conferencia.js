/* ==========================================================================
   conferencia.js — as cinco conferências automáticas do conteúdo.

   A rede de segurança para quando as 77 missões forem escritas. Rodam sobre
   todos os módulos já escritos e AVISAM NO CONSOLE — nunca quebram a tela.

     1. Todo gabarito roda e devolve pelo menos uma linha.
     2. O gabarito traduzido dá o mesmo resultado na base em português.
     3. Só comandos já ensinados: cada consulta de uma missão só usa os
        conceitosNovos dela somados aos de todas as missões anteriores.
     4. Nenhum conceito passa de 80 palavras (nos dois idiomas).
     5. Todo texto tem pt e en, e toda tabela e coluna usada está no
        dicionario.js.

   Mais a estrutura de cada missão (campos obrigatórios, 3 dicas, 3 opções
   de palpite, ids, contagem por módulo).

   As conferências 3, 4 e 5 e a estrutura não precisam do motor: rodam
   sempre que o site abre (são leves). As 1 e 2 rodam os gabaritos no
   DuckDB — só com ?conferencia no endereço, para nenhum visitante baixar o
   motor à toa nem ter a base zerada no meio de uma missão.
   ========================================================================== */

import { modulos, carregarModulo } from './indice.js';
import { personagens } from '../personagens.js';
import { dicionario } from '../base/dicionario.js';
import { recursosUsados, normalizarRecurso, compararResultados } from '../../js/conferir.js';
import { separar, traduzirSQL } from '../../js/traducao-sql.js';

const TIPOS = ['missao', 'revisao', 'desafio', 'projeto'];
const LIMITE_DE_PALAVRAS = 80;

// Módulos que não seguem o ritmo "revisão + desafio final" (o módulo 0 é a
// chegada ao observatório: três missões curtas de boas-vindas).
const SEM_REVISAO_E_DESAFIO = new Set(['m0']);

/* --------------------------------------------------------------------------
   Rodar tudo
   -------------------------------------------------------------------------- */

/**
 * Carrega os módulos escritos e roda as conferências, avisando no console.
 * @param {{comMotor?: boolean, bd?: {abrirBase, zerarBase, consultar, idiomaDaBase}}} [opcoes]
 * @returns {Promise<string[]>} os avisos
 */
export async function conferirConteudo({ comMotor = false, bd = null } = {}) {
  const lista = [];
  for (const modulo of modulos) {
    if (modulo.arquivo) lista.push({ modulo, missoes: await carregarModulo(modulo.id) });
  }

  const avisos = conferirSemMotor(lista);
  if (comMotor && bd) avisos.push(...(await conferirComMotor(lista, bd)));

  relatar(avisos, lista, comMotor);
  return avisos;
}

function relatar(avisos, lista, comMotor) {
  const missoes = lista.reduce((soma, { missoes }) => soma + missoes.length, 0);
  const quais = comMotor ? 'as 5 conferências' : 'as conferências 3, 4 e 5 e a estrutura';
  if (!avisos.length) {
    if (missoes) console.info(`[conferência] ${missoes} missões conferidas (${quais}): tudo certo.`);
    return;
  }
  console.groupCollapsed(`[conferência] ${avisos.length} aviso(s) em ${missoes} missões (${quais})`);
  for (const aviso of avisos) console.warn(aviso);
  console.groupEnd();
}

/* --------------------------------------------------------------------------
   Sem o motor: estrutura, 3, 4 e 5
   -------------------------------------------------------------------------- */

/**
 * @param {{modulo: object, missoes: object[]}[]} lista  módulos na ordem da trilha
 * @returns {string[]} avisos
 */
export function conferirSemMotor(lista) {
  const avisos = [];
  const ids = new Set();
  const ensinados = new Set();

  for (const { modulo, missoes } of lista) {
    const onde = (missao) => `${missao?.id ?? '(sem id)'}`;

    // Contagem e ritmo do módulo.
    if (missoes.length !== modulo.total) {
      avisos.push(`${modulo.id}: tem ${missoes.length} missões; o índice diz ${modulo.total}.`);
    }
    if (!SEM_REVISAO_E_DESAFIO.has(modulo.id) && missoes.length) {
      if (missoes[missoes.length - 1].tipo !== 'desafio') avisos.push(`${modulo.id}: a última missão deveria ser o desafio final.`);
      if (!missoes.some((m) => m.tipo === 'revisao')) avisos.push(`${modulo.id}: falta a revisão misturada.`);
    }

    for (const missao of missoes) {
      // --- Estrutura ------------------------------------------------------
      if (!missao.id) avisos.push(`${modulo.id}: uma missão está sem id.`);
      else if (ids.has(missao.id)) avisos.push(`${missao.id}: id repetido.`);
      else if (!new RegExp(`^${modulo.id}-\\d{2}$`).test(missao.id)) avisos.push(`${missao.id}: o id deveria ser ${modulo.id}-NN.`);
      ids.add(missao.id);

      avisos.push(...conferirEstrutura(missao).map((a) => `${onde(missao)}: ${a}`));

      // --- 3. Só comandos já ensinados --------------------------------------
      for (const conceito of missao.conceitosNovos ?? []) ensinados.add(normalizarRecurso(conceito));

      // A amostra ("Olhe os dados") fica de fora: quem a mostra é o sistema,
      // e ela sempre usa LIMIT 5, ensinado ou não.
      for (const { rotulo, sql } of consultasDaMissao(missao).filter((c) => c.rotulo !== 'a amostra')) {
        for (const recurso of recursosUsados(sql)) {
          if (!ensinados.has(recurso)) {
            avisos.push(`${onde(missao)}: [3] ${rotulo} usa ${recurso}, que ainda não foi ensinado.`);
          }
        }
      }
      for (const desafio of missao.desafios ?? []) {
        for (const recurso of desafio.exige ?? []) {
          if (!ensinados.has(normalizarRecurso(recurso))) {
            avisos.push(`${onde(missao)}: [3] o desafio exige ${recurso}, que ainda não foi ensinado.`);
          }
        }
      }

      // --- 4. Conceito de até 80 palavras ------------------------------------
      for (const idioma of ['pt', 'en']) {
        const palavras = contarPalavras(missao.conceito?.[idioma]);
        if (palavras > LIMITE_DE_PALAVRAS) {
          avisos.push(`${onde(missao)}: [4] o conceito em ${idioma} tem ${palavras} palavras (máximo ${LIMITE_DE_PALAVRAS}).`);
        }
      }

      // --- 5. Dois idiomas, tabelas e colunas do dicionário ------------------
      for (const caminho of textosIncompletos(missao)) {
        avisos.push(`${onde(missao)}: [5] texto sem pt ou en em ${caminho}.`);
      }
      for (const tabela of missao.tabelas ?? []) {
        if (!dicionario[tabela]) avisos.push(`${onde(missao)}: [5] a tabela ${tabela} não está no dicionário.`);
      }
      for (const { rotulo, sql } of consultasDaMissao(missao)) {
        for (const nome of nomesDesconhecidos(sql)) {
          avisos.push(`${onde(missao)}: [5] ${rotulo} usa "${nome}", que não é tabela nem coluna do dicionário.`);
        }
      }
    }
  }
  return avisos;
}

/** Os campos que cada tipo de missão precisa ter. */
function conferirEstrutura(missao) {
  const avisos = [];
  const exigir = (condicao, texto) => { if (!condicao) avisos.push(texto); };
  const temTexto = (valor) => valor && typeof valor.pt === 'string' && typeof valor.en === 'string';

  exigir(TIPOS.includes(missao.tipo), `tipo "${missao.tipo}" desconhecido (${TIPOS.join(', ')}).`);
  exigir(temTexto(missao.titulo), 'falta o título.');
  exigir(personagens[missao.personagem], `personagem "${missao.personagem}" desconhecido.`);
  exigir(temTexto(missao.pedido), 'falta o pedido.');
  exigir(temTexto(missao.entrega), 'falta a entrega (a resposta do personagem).');
  exigir(Array.isArray(missao.desafios) && missao.desafios.length > 0, 'falta pelo menos um desafio.');
  if (missao.hora !== undefined) exigir(/^\d{2}:\d{2}$/.test(missao.hora), `hora "${missao.hora}" fora do formato HH:MM.`);

  if (missao.tipo === 'missao') {
    exigir(Array.isArray(missao.conceitosNovos) && missao.conceitosNovos.length > 0, 'uma missão ensina pelo menos um conceito novo.');
    exigir(Array.isArray(missao.tabelas) && missao.tabelas.length > 0, 'faltam as tabelas.');
    exigir(temTexto(missao.conceito), 'falta o conceito.');
    exigir(typeof missao.exemplo === 'string' && missao.exemplo.trim(), 'falta o exemplo.');
    exigir(Array.isArray(missao.raioX) && missao.raioX.length > 0, 'falta o Raio-X.');
    exigir(missao.palpite, 'falta o palpite.');
  }

  if (missao.palpite) {
    const { pergunta, opcoes, correta } = missao.palpite;
    exigir(temTexto(pergunta), 'o palpite está sem pergunta.');
    exigir(Array.isArray(opcoes) && opcoes.length === 3, 'o palpite precisa de exatamente 3 opções.');
    exigir(Number.isInteger(correta) && correta >= 0 && correta < 3, 'palpite.correta deve ser 0, 1 ou 2.');
  }

  for (const [i, etapa] of (missao.raioX ?? []).entries()) {
    exigir(etapa.etapa && typeof etapa.sql === 'string', `raioX[${i}] precisa de etapa e sql.`);
  }

  for (const [i, desafio] of (missao.desafios ?? []).entries()) {
    exigir(temTexto(desafio.enunciado), `desafios[${i}] está sem enunciado.`);
    exigir(typeof desafio.gabarito === 'string' && desafio.gabarito.trim(), `desafios[${i}] está sem gabarito.`);
    exigir(typeof desafio.inicial === 'string', `desafios[${i}].inicial deve ser texto (pode ser vazio).`);
    exigir(Array.isArray(desafio.dicas) && desafio.dicas.length === 3, `desafios[${i}] precisa de 3 dicas (pista, esqueleto, resposta).`);
  }
  return avisos;
}

/** Todas as consultas de uma missão, com um rótulo para o aviso. */
function consultasDaMissao(missao) {
  const consultas = [];
  if (missao.amostra) consultas.push({ rotulo: 'a amostra', sql: missao.amostra });
  if (missao.exemplo) consultas.push({ rotulo: 'o exemplo', sql: missao.exemplo });
  for (const [i, etapa] of (missao.raioX ?? []).entries()) consultas.push({ rotulo: `raioX[${i}]`, sql: etapa.sql });
  for (const [i, desafio] of (missao.desafios ?? []).entries()) {
    if (desafio.inicial) consultas.push({ rotulo: `desafios[${i}].inicial`, sql: desafio.inicial });
    consultas.push({ rotulo: `desafios[${i}].gabarito`, sql: desafio.gabarito ?? '' });
  }
  return consultas;
}

function contarPalavras(texto) {
  return texto ? texto.trim().split(/\s+/).filter(Boolean).length : 0;
}

/** Os lugares da missão onde um texto {pt, en} está com um lado faltando. */
function textosIncompletos(valor, caminho = '') {
  if (!valor || typeof valor !== 'object') return [];
  if ('pt' in valor || 'en' in valor) {
    const completo = typeof valor.pt === 'string' && valor.pt.trim() && typeof valor.en === 'string' && valor.en.trim();
    return completo ? [] : [caminho || '(raiz)'];
  }
  return Object.entries(valor).flatMap(([chave, filho]) =>
    textosIncompletos(filho, caminho ? `${caminho}.${chave}` : chave)
  );
}

/* --------------------------------------------------------------------------
   Nomes que não estão no dicionário
   -------------------------------------------------------------------------- */

const TABELAS = new Set(Object.keys(dicionario));
const COLUNAS = new Set(Object.values(dicionario).flatMap((t) => Object.keys(t.colunas)));

// Palavras do SQL que não são nomes da base (não precisam estar no dicionário).
const PALAVRAS_SQL = new Set(`
  select from where group by having order limit offset distinct as and or not in between
  like ilike is null case when then else end join inner left right full outer cross on
  using union intersect except exists all any some with recursive over partition rows
  range preceding following unbounded current row qualify pivot unpivot insert into
  values update set delete create table view drop alter primary key foreign references
  unique check default constraint begin commit rollback transaction asc desc nulls
  first last true false interval cast filter window year month day hour minute second
  date timestamp integer int bigint double decimal varchar text boolean replace temp
  temporary if
`.split(/\s+/).filter(Boolean));

/**
 * Nomes usados numa consulta (em inglês) que não são palavra do SQL, função,
 * apelido, tabela nem coluna do dicionário.
 */
function nomesDesconhecidos(sql) {
  const sig = separar(sql).filter((p) => p.tipo !== 'espaco' && p.tipo !== 'comentario');
  const apelidos = new Set();

  sig.forEach((p, i) => {
    const anterior = sig[i - 1];
    const nome = p.texto.toLowerCase();
    if (p.tipo !== 'nome') return;
    // … AS apelido
    if (anterior?.texto.toLowerCase() === 'as') apelidos.add(nome);
    // FROM tabela apelido  /  ) apelido
    if (anterior && (TABELAS.has(anterior.texto.toLowerCase()) || anterior.texto === ')') && !PALAVRAS_SQL.has(nome)) {
      apelidos.add(nome);
    }
    // WITH nome AS (
    if (sig[i + 1]?.texto.toLowerCase() === 'as' && sig[i + 2]?.texto === '(') apelidos.add(nome);
  });

  const desconhecidos = new Set();
  sig.forEach((p, i) => {
    if (p.tipo !== 'nome' && p.tipo !== 'nome-entre-aspas') return;
    const nome = (p.tipo === 'nome-entre-aspas' ? p.texto.slice(1, -1) : p.texto).toLowerCase();
    if (p.tipo === 'nome' && (PALAVRAS_SQL.has(nome) || sig[i + 1]?.texto === '(')) return;   // palavra ou função
    if (TABELAS.has(nome) || COLUNAS.has(nome) || apelidos.has(nome)) return;
    desconhecidos.add(p.texto);
  });
  return desconhecidos;
}

/* --------------------------------------------------------------------------
   Com o motor: 1 e 2
   -------------------------------------------------------------------------- */

/**
 * Roda os gabaritos na base em inglês e, traduzidos, na base em português.
 * Deixa a base de volta no idioma em que estava.
 */
export async function conferirComMotor(lista, { abrirBase, zerarBase, consultar, idiomaDaBase }) {
  const avisos = [];
  await abrirBase();
  const idiomaDeAntes = idiomaDaBase();

  // Uma consulta por vez, na ordem, guardando os resultados em inglês.
  const emIngles = new Map();
  await zerarBase('en');
  for (const { missoes } of lista) {
    for (const missao of missoes) {
      for (const [i, desafio] of (missao.desafios ?? []).entries()) {
        const onde = `${missao.id} desafios[${i}]`;
        try {
          const resultado = await consultar(desafio.gabarito);
          if (resultado.total === 0) avisos.push(`${onde}: [1] o gabarito roda, mas não devolve nenhuma linha.`);
          emIngles.set(onde, resultado);
        } catch (erro) {
          avisos.push(`${onde}: [1] o gabarito dá erro: ${erro.message.split('\n')[0]}`);
        }
        // Quem altera dados (módulo 8) deixa a base suja: zera para o próximo.
        if (alteraDados(desafio.gabarito)) await zerarBase('en');
      }
      const outras = [
        { rotulo: 'a amostra', sql: missao.amostra },
        { rotulo: 'o exemplo', sql: missao.exemplo },
        ...(missao.raioX ?? []).map((e, i) => ({ rotulo: `raioX[${i}]`, sql: e.sql })),
      ];
      for (const { rotulo, sql } of outras) {
        if (!sql) continue;
        try {
          await consultar(sql);
        } catch (erro) {
          avisos.push(`${missao.id}: [1] ${rotulo} dá erro: ${erro.message.split('\n')[0]}`);
        }
      }
    }
  }

  await zerarBase('pt');
  for (const { missoes } of lista) {
    for (const missao of missoes) {
      for (const [i, desafio] of (missao.desafios ?? []).entries()) {
        const onde = `${missao.id} desafios[${i}]`;
        const original = emIngles.get(onde);
        if (!original) continue;
        try {
          const traduzido = await consultar(traduzirSQL(desafio.gabarito, 'en', 'pt'));
          const { certo, motivo } = compararResultados(traduzido, original, {
            ordem: desafio.conferir?.ordem ?? false,
            casas: desafio.conferir?.casas ?? 2,
          });
          if (!certo) avisos.push(`${onde}: [2] traduzido para o português, o gabarito dá outro resultado (${motivo}).`);
        } catch (erro) {
          avisos.push(`${onde}: [2] traduzido para o português, o gabarito dá erro: ${erro.message.split('\n')[0]}`);
        }
        if (alteraDados(desafio.gabarito)) await zerarBase('pt');
      }
    }
  }

  await zerarBase(idiomaDeAntes ?? 'pt');
  return avisos;
}

/** Um comando que muda a base (e não só lê)? */
function alteraDados(sql) {
  return /\b(insert|update|delete|create|drop|alter)\b/i.test(sql ?? '');
}
