/* ==========================================================================
   progresso.js — o que a pessoa já fez: missões, estrelas, módulos
   liberados, sequência de dias e os conceitos em que ela tropeça.

   Três gavetas do localStorage (ver armazenamento.js e o PLANO.md):

   meridiano:progresso
     { versao: 1,
       missoes: { 'm0-01': { estrelas: 3, dicas: 0, viuResposta: false,
                             concluida: '2026-09-25', vezes: 1 } },
       liberados: ['m0', 'm1'] }
     estrelas é a MELHOR nota (refazer com menos não apaga a anterior);
     dicas é o maior degrau de dica da última vez (0 a 3).
     O módulo 0 está sempre liberado; concluir o desafio final de um módulo
     libera o seguinte (o nivelamento, no passo 15, também libera).

   meridiano:sequencia
     { atual: 3, maior: 5, ultimoDia: '2026-09-25' }
     Dias seguidos com pelo menos uma missão concluída, no fuso de quem usa.
     Passou um dia inteiro sem missão, a sequência volta a zero (na leitura:
     o que está salvo só muda quando outra missão é concluída).

   meridiano:nivelamento
     { concluido: '2026-09-25', acertos: [true, true, false], liberou: ['m1', 'm2'] }
     O resultado do nivelamento (passo 15). Os módulos que ele libera entram
     em meridiano:progresso.liberados e nunca voltam a fechar — refazer o
     nivelamento só pode liberar mais.

   meridiano:estatisticas
     { conceitos: { DISTINCT: 2, '||': 1 } }
     Quantas vezes cada conceito "escapou": num desafio, a pessoa pediu dica
     ou errou a conferência. Conta uma vez por desafio, por visita — rodar
     vinte vezes a mesma consulta errada não vira vinte. Alimenta o painel
     "Conceitos que mais escapam".
   ========================================================================== */

import { CHAVES, ler, gravar } from './armazenamento.js';
import { modulos, carregarModulo } from '../dados/missoes/indice.js';

const VERSAO = 1;
const PADRAO_PROGRESSO = { versao: VERSAO, missoes: {}, liberados: ['m0'] };
const PADRAO_SEQUENCIA = { atual: 0, maior: 0, ultimoDia: null };
const PADRAO_ESTATISTICAS = { conceitos: {} };

/** Quem quer ser avisado quando o progresso muda (a trilha, o início). */
const ouvintes = new Set();

/**
 * Pede para ser avisado a cada mudança.
 * @param {() => void} ouvinte
 * @returns {() => void} para parar de ouvir
 */
export function aoMudarProgresso(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

function avisar() {
  for (const ouvinte of ouvintes) ouvinte();
}

/* --------------------------------------------------------------------------
   Leitura
   -------------------------------------------------------------------------- */

function lerProgresso() {
  const salvo = ler(CHAVES.progresso, PADRAO_PROGRESSO);
  const liberados = Array.isArray(salvo.liberados) ? salvo.liberados : [];
  return {
    versao: VERSAO,
    missoes: salvo.missoes && typeof salvo.missoes === 'object' ? salvo.missoes : {},
    liberados: liberados.includes('m0') ? liberados : ['m0', ...liberados],
  };
}

/** O registro de uma missão (ou null, se nunca foi concluída). */
export function registroDaMissao(id) {
  return lerProgresso().missoes[id] ?? null;
}

/** true se a missão já foi concluída pelo menos uma vez. */
export function missaoFeita(id) {
  return Boolean(registroDaMissao(id));
}

/** Quantas missões diferentes já foram concluídas. */
export function totalFeitas() {
  return Object.keys(lerProgresso().missoes).length;
}

/** true se o módulo está liberado. */
export function moduloLiberado(idDoModulo) {
  return lerProgresso().liberados.includes(idDoModulo);
}

/**
 * Por onde seguir: a primeira missão não feita do módulo liberado mais
 * adiantado que ainda tenha alguma por fazer (quem passou pelo nivelamento
 * segue de onde ele abriu, e não do começo). Módulos ainda não escritos
 * ficam de fora.
 * @returns {Promise<{modulo: object, missao: object}|null>} null = tudo feito
 */
export async function proximaMissao() {
  const conteudo = [];
  for (const modulo of modulos) conteudo.push({ modulo, missoes: await carregarModulo(modulo.id) });
  return escolherProxima(conteudo);
}

/**
 * A mesma regra, com as missões já carregadas (a trilha tem todas à mão).
 * @param {{modulo: object, missoes: object[]}[]} conteudo  na ordem da trilha
 */
export function escolherProxima(conteudo) {
  for (const { modulo, missoes } of [...conteudo].reverse()) {
    if (!moduloLiberado(modulo.id)) continue;
    const missao = missoes.find((m) => !missaoFeita(m.id));
    if (missao) return { modulo, missao };
  }
  return null;
}

/** A sequência de dias de agora: a salva, ou 0 se ela já se quebrou. */
export function sequenciaAtual() {
  const { atual, ultimoDia } = ler(CHAVES.sequencia, PADRAO_SEQUENCIA);
  if (!ultimoDia) return 0;
  return ultimoDia === hoje() || ultimoDia === ontem() ? Number(atual) || 0 : 0;
}

/**
 * Os conceitos que mais escaparam, do que mais escapou para o que menos.
 * @param {number} [quantos]
 * @returns {string[]} nomes canônicos (ver MODELO.md)
 */
export function conceitosQueMaisEscapam(quantos = 3) {
  const { conceitos } = ler(CHAVES.estatisticas, PADRAO_ESTATISTICAS);
  return Object.entries(conceitos ?? {})
    .filter(([, n]) => Number(n) > 0)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, quantos)
    .map(([conceito]) => conceito);
}

/* --------------------------------------------------------------------------
   Escrita
   -------------------------------------------------------------------------- */

/**
 * Conclui uma missão: guarda a nota, conta a sequência e, se for o desafio
 * final do módulo, libera o módulo seguinte.
 * @param {{id: string, tipo: string}} missao
 * @param {{estrelas: number, dicas: number, ultimaDoModulo: boolean, idDoModulo: string}} dados
 * @returns {{feitasAntes: number, feitasDepois: number,
 *            sequenciaAntes: number, sequenciaDepois: number,
 *            melhorAntes: number|null, liberou: object|null}}
 *   o antes e o depois, para a entrega animar os números
 */
export function concluirMissao(missao, { estrelas, dicas, ultimaDoModulo, idDoModulo }) {
  const progresso = lerProgresso();
  const anterior = progresso.missoes[missao.id] ?? null;
  const feitasAntes = Object.keys(progresso.missoes).length;
  const sequenciaAntes = sequenciaAtual();

  progresso.missoes[missao.id] = {
    estrelas: Math.max(estrelas, anterior?.estrelas ?? 0),
    dicas,
    viuResposta: dicas >= 3,
    concluida: anterior?.concluida ?? hoje(),
    vezes: (anterior?.vezes ?? 0) + 1,
  };

  // O desafio final libera o módulo seguinte.
  let liberou = null;
  if (missao.tipo === 'desafio' && ultimaDoModulo) {
    const seguinte = modulos[modulos.findIndex((m) => m.id === idDoModulo) + 1];
    if (seguinte && !progresso.liberados.includes(seguinte.id)) {
      progresso.liberados.push(seguinte.id);
      liberou = seguinte;
    }
  }
  gravar(CHAVES.progresso, progresso);

  const sequenciaDepois = contarDia();
  avisar();

  return {
    feitasAntes,
    feitasDepois: Object.keys(progresso.missoes).length,
    sequenciaAntes,
    sequenciaDepois,
    melhorAntes: anterior?.estrelas ?? null,
    liberou,
  };
}

/** Conta o dia de hoje na sequência. @returns {number} a sequência depois */
function contarDia() {
  const salva = ler(CHAVES.sequencia, PADRAO_SEQUENCIA);
  const dia = hoje();
  let atual;
  if (salva.ultimoDia === dia) atual = Number(salva.atual) || 1;
  else if (salva.ultimoDia === ontem()) atual = (Number(salva.atual) || 0) + 1;
  else atual = 1;
  gravar(CHAVES.sequencia, { atual, maior: Math.max(atual, Number(salva.maior) || 0), ultimoDia: dia });
  return atual;
}

/** true se o nivelamento já foi feito alguma vez. */
export function nivelamentoFeito() {
  return Boolean(ler(CHAVES.nivelamento, null)?.concluido);
}

/**
 * Guarda o resultado do nivelamento e libera os módulos que ele abriu.
 * @param {boolean[]} acertos  um por desafio respondido, na ordem
 * @param {string[]} modulosAcertados  o módulo que cada acerto libera
 * @returns {object[]} os módulos liberados agora (os que já estavam não contam)
 */
export function concluirNivelamento(acertos, modulosAcertados) {
  const progresso = lerProgresso();
  const novos = [];
  for (const id of modulosAcertados) {
    if (!progresso.liberados.includes(id)) {
      progresso.liberados.push(id);
      novos.push(modulos.find((m) => m.id === id));
    }
  }
  gravar(CHAVES.progresso, progresso);
  gravar(CHAVES.nivelamento, { concluido: hoje(), acertos, liberou: modulosAcertados });
  avisar();
  return novos.filter(Boolean);
}

/**
 * Registra que conceitos escaparam (uma dica pedida ou uma resposta errada).
 * Quem chama garante que é uma vez por desafio.
 * @param {string[]} conceitos  nomes canônicos
 */
export function registrarTropeco(conceitos) {
  if (!conceitos?.length) return;
  const estatisticas = ler(CHAVES.estatisticas, PADRAO_ESTATISTICAS);
  const contagem = { ...(estatisticas.conceitos ?? {}) };
  for (const conceito of new Set(conceitos)) contagem[conceito] = (Number(contagem[conceito]) || 0) + 1;
  gravar(CHAVES.estatisticas, { ...estatisticas, conceitos: contagem });
  avisar();
}

/* --------------------------------------------------------------------------
   Datas, no fuso de quem usa
   -------------------------------------------------------------------------- */

function dataLocal(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const dia = String(data.getDate()).padStart(2, '0');
  return `${ano}-${mes}-${dia}`;
}

function hoje() {
  return dataLocal(new Date());
}

function ontem() {
  const agora = new Date();
  return dataLocal(new Date(agora.getFullYear(), agora.getMonth(), agora.getDate() - 1));
}
