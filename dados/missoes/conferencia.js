/* ==========================================================================
   conferencia.js — as seis conferências automáticas do conteúdo.

   A rede de segurança para quando as 77 missões forem escritas. Rodam sobre
   todos os módulos já escritos e AVISAM NO CONSOLE — nunca quebram a tela.

     1. Todo gabarito roda e devolve pelo menos uma linha.
     2. O gabarito traduzido dá o mesmo resultado na base em português.
     3. Só comandos já ensinados: cada consulta de uma missão só usa os
        conceitosNovos dela somados aos de todas as missões anteriores.
     4. Nenhum conceito passa de 80 palavras (nos dois idiomas).
     5. Todo texto tem pt e en, e toda tabela e coluna usada está no
        dicionario.js — inclusive as marcadas como selo (`nome_pais`) nos
        textos, cada idioma com os seus nomes.
     6. Cada desafio declara em `tabelas` exatamente as tabelas que o
        gabarito usa (são elas que aparecem na barra da Consulta).

   Mais a estrutura de cada missão (campos obrigatórios, 3 dicas, 3 opções
   de palpite, ids, contagem por módulo).

   As conferências 3, 4, 5 e 6 e a estrutura não precisam do motor: rodam
   sempre que o site abre (são leves). As 1 e 2 rodam os gabaritos no
   DuckDB — só com ?conferencia no endereço, para nenhum visitante baixar o
   motor à toa nem ter a base zerada no meio de uma missão.
   ========================================================================== */

import { modulos, carregarModulo } from './indice.js';
import { personagens } from '../personagens.js';
import { dicionario } from '../base/dicionario.js';
import { recursosUsados, normalizarRecurso, compararResultados } from '../../js/conferir.js';
import { separar, traduzirSQL, sqlEmIngles, tabelasDoSQL } from '../../js/traducao-sql.js';
import { clausulasNaOrdemDoBanco } from '../../js/passo-a-passo.js';

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
  const quais = comMotor ? 'as 6 conferências' : 'as conferências 3 a 6 e a estrutura';
  if (!avisos.length) {
    if (missoes) console.info(`[conferência] ${missoes} missões conferidas (${quais}): tudo certo.`);
    return;
  }
  console.groupCollapsed(`[conferência] ${avisos.length} aviso(s) em ${missoes} missões (${quais})`);
  for (const aviso of avisos) console.warn(aviso);
  console.groupEnd();
}

/* --------------------------------------------------------------------------
   Sem o motor: estrutura, 3, 4, 5 e 6
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
      for (const { rotulo, sql } of consultasDaMissao(missao).filter((c) => !c.rotulo.startsWith('a amostra'))) {
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
      for (const { idioma, nome } of selosDesconhecidos(missao)) {
        avisos.push(`${onde(missao)}: [5] o selo \`${nome}\` (${idioma}) não é tabela nem coluna do dicionário nesse idioma.`);
      }

      // --- 6. As tabelas de cada desafio são as do gabarito --------------------
      for (const [i, desafio] of (missao.desafios ?? []).entries()) {
        const doGabarito = tabelasDoSQL(desafio.gabarito).sort();
        const declaradas = [...(desafio.tabelas ?? [])].sort();
        if (doGabarito.join() !== declaradas.join()) {
          avisos.push(`${onde(missao)}: [6] desafios[${i}].tabelas é [${declaradas.join(', ')}], mas o gabarito usa [${doGabarito.join(', ')}].`);
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
    exigir(sqlEmIngles(missao.exemplo).trim(), 'falta o exemplo.');
    exigir(temTexto(missao.resumo), 'falta o resumo (a linha que lembra o pedido no conceito).');
    exigir(missao.passoAPasso && typeof missao.passoAPasso === 'object', 'falta o Passo a passo.');
    exigir(missao.palpite, 'falta o palpite.');
  }

  // O Passo a passo: uma frase {pt, en} para cada cláusula do exemplo — nem
  // uma a mais, nem uma a menos. A ordem vem do exemplo (a do banco).
  if (missao.passoAPasso && missao.exemplo) {
    const doExemplo = clausulasNaOrdemDoBanco(sqlEmIngles(missao.exemplo));
    const escritas = Object.keys(missao.passoAPasso);
    for (const clausula of doExemplo) {
      exigir(temTexto(missao.passoAPasso[clausula]), `passoAPasso.${clausula} falta (o exemplo tem ${clausula}), ou está sem pt e en.`);
    }
    for (const clausula of escritas) {
      exigir(doExemplo.includes(clausula), `passoAPasso.${clausula} sobra: o exemplo não tem ${clausula}.`);
    }
  }

  if (missao.palpite) {
    const { pergunta, opcoes, correta } = missao.palpite;
    exigir(temTexto(pergunta), 'o palpite está sem pergunta.');
    exigir(Array.isArray(opcoes) && opcoes.length === 3, 'o palpite precisa de exatamente 3 opções.');
    exigir(Number.isInteger(correta) && correta >= 0 && correta < 3, 'palpite.correta deve ser 0, 1 ou 2.');
  }

  for (const [i, desafio] of (missao.desafios ?? []).entries()) {
    exigir(temTexto(desafio.enunciado), `desafios[${i}] está sem enunciado.`);
    exigir(typeof desafio.gabarito === 'string' && desafio.gabarito.trim(), `desafios[${i}] está sem gabarito.`);
    exigir(typeof desafio.inicial === 'string', `desafios[${i}].inicial deve ser texto (pode ser vazio).`);
    exigir(Array.isArray(desafio.dicas) && desafio.dicas.length === 3, `desafios[${i}] precisa de 3 dicas (pista, esqueleto, resposta).`);
    if (Array.isArray(desafio.dicas)) {
      // A pista é texto nos dois idiomas; esqueleto e resposta são SQL em
      // inglês (traduzido na hora) ou texto {pt, en} (quando há apelidos).
      exigir(temTexto(desafio.dicas[0]), `desafios[${i}].dicas[0] (a pista) precisa de pt e en.`);
      for (const j of [1, 2]) {
        const dica = desafio.dicas[j];
        exigir(typeof dica === 'string' || temTexto(dica), `desafios[${i}].dicas[${j}] deve ser SQL em inglês ou {pt, en}.`);
      }
    }
  }
  return avisos;
}

/** Todas as consultas de uma missão, com um rótulo para o aviso. */
function consultasDaMissao(missao) {
  // Campos de SQL podem vir como texto (inglês) ou { pt, en }: as
  // conferências olham sempre a versão em inglês.
  const consultas = [];
  // As versões em português escritas à mão também são conferidas: traduzidas
  // de volta para o inglês, um nome digitado errado aparece na [5].
  const versaoPt = (rotulo, valor) => {
    if (valor && typeof valor === 'object' && valor.pt) {
      consultas.push({ rotulo: `${rotulo} (pt)`, sql: traduzirSQL(valor.pt, 'pt', 'en') });
    }
  };
  versaoPt('o exemplo', missao.exemplo);
  if (missao.amostra) consultas.push({ rotulo: 'a amostra', sql: sqlEmIngles(missao.amostra) });
  if (missao.exemplo) consultas.push({ rotulo: 'o exemplo', sql: sqlEmIngles(missao.exemplo) });
  for (const [i, desafio] of (missao.desafios ?? []).entries()) {
    if (desafio.inicial) consultas.push({ rotulo: `desafios[${i}].inicial`, sql: sqlEmIngles(desafio.inicial) });
    consultas.push({ rotulo: `desafios[${i}].gabarito`, sql: desafio.gabarito ?? '' });
    // Esqueleto e resposta escritos como SQL em inglês também são conferidos.
    for (const [j, dica] of (desafio.dicas ?? []).entries()) {
      if (typeof dica === 'string') consultas.push({ rotulo: `desafios[${i}].dicas[${j}]`, sql: dica });
    }
  }
  return consultas;
}

function contarPalavras(texto) {
  return texto ? texto.trim().split(/\s+/).filter(Boolean).length : 0;
}

/** Os lugares da missão onde um texto {pt, en} está com um lado faltando. */
/** Os nomes de cada idioma: tabelas e colunas do dicionário. */
const NOMES = { pt: new Set(), en: new Set() };
for (const [tabelaEn, tabela] of Object.entries(dicionario)) {
  NOMES.en.add(tabelaEn);
  NOMES.pt.add(tabela.pt);
  for (const [colunaEn, coluna] of Object.entries(tabela.colunas)) {
    NOMES.en.add(colunaEn);
    NOMES.pt.add(coluna.pt);
  }
}

/**
 * Os nomes em minúsculas dentro dos selos (`nome_pais`) dos textos de uma
 * missão que não são tabela nem coluna naquele idioma. Palavras-chave
 * (MAIÚSCULAS), apelidos (depois do AS), números e textos entre aspas
 * ficam de fora.
 */
function selosDesconhecidos(valor, achados = []) {
  if (!valor || typeof valor !== 'object') return achados;
  if (typeof valor.pt === 'string' && typeof valor.en === 'string') {
    for (const idioma of ['pt', 'en']) {
      for (const [, selo] of valor[idioma].matchAll(/`([^`]+)`/g)) {
        let anterior = '';
        for (const pedaco of separar(selo).filter((p) => p.tipo !== 'espaco')) {
          // Um apelido (o nome depois do AS) é inventado pela consulta: vale.
          const apelido = anterior.toUpperCase() === 'AS';
          if (pedaco.tipo === 'nome' && !apelido && /[a-z]/.test(pedaco.texto) &&
              pedaco.texto === pedaco.texto.toLowerCase() && !NOMES[idioma].has(pedaco.texto)) {
            achados.push({ idioma, nome: pedaco.texto });
          }
          anterior = pedaco.texto;
        }
      }
    }
    return achados;
  }
  for (const filho of Object.values(valor)) selosDesconhecidos(filho, achados);
  return achados;
}

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
    if (/^_+$/.test(nome)) return;   // a lacuna de um esqueleto de dica: ____
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
        { rotulo: 'a amostra', sql: sqlEmIngles(missao.amostra) },
        { rotulo: 'o exemplo', sql: sqlEmIngles(missao.exemplo) },
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
      // [1] As versões em português escritas à mão rodam na base em português.
      const escritasEmPt = [
        { rotulo: 'o exemplo (pt)', valor: missao.exemplo },
      ].filter(({ valor }) => valor && typeof valor === 'object' && valor.pt);
      for (const { rotulo, valor } of escritasEmPt) {
        try {
          await consultar(valor.pt);
        } catch (erro) {
          avisos.push(`${missao.id}: [1] ${rotulo} dá erro: ${erro.message.split('\n')[0]}`);
        }
      }

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
