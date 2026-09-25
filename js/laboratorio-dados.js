/* ==========================================================================
   laboratorio-dados.js — o que o laboratório guarda e como ele exporta.

   meridiano:laboratorio
     { versao: 1,
       historico: [{ sql, em }],     ← as 50 últimas consultas que rodaram
       favoritas: [{ sql, em }],
       ultima: '…' }                 ← a consulta que estava no editor
   Toda consulta é guardada EM INGLÊS (traduzida na hora de mostrar): assim
   ela continua valendo quando a pessoa troca o idioma da tela.

   E o CSV: no formato do Excel brasileiro (";", vírgula decimal, BOM UTF-8)
   ou no internacional (",", ponto) — o escolhido em meridiano:config
   (formatoCsv), ou, sem escolha, o do idioma da tela.
   ========================================================================== */

import { CHAVES, ler, gravar } from './armazenamento.js';
import { config } from './estado.js';
import { idioma } from './i18n.js';
import { formatarValor } from './tabela-resultado.js';

const MAXIMO_NO_HISTORICO = 50;
const PADRAO = { versao: 1, historico: [], favoritas: [], ultima: '' };

function lerTudo() {
  const salvo = ler(CHAVES.laboratorio, PADRAO);
  return {
    versao: 1,
    historico: Array.isArray(salvo.historico) ? salvo.historico : [],
    favoritas: Array.isArray(salvo.favoritas) ? salvo.favoritas : [],
    ultima: typeof salvo.ultima === 'string' ? salvo.ultima : '',
  };
}

/* --------------------------------------------------------------------------
   Histórico, favoritas e a última consulta (sempre em inglês)
   -------------------------------------------------------------------------- */

export function historico() {
  return lerTudo().historico;
}

export function favoritas() {
  return lerTudo().favoritas;
}

export function ultimaConsulta() {
  return lerTudo().ultima;
}

/** Guarda uma consulta que rodou (a mesma de novo sobe para o topo). */
export function guardarNoHistorico(sqlEn) {
  const tudo = lerTudo();
  const limpa = sqlEn.trim();
  if (!limpa) return;
  tudo.historico = [{ sql: limpa, em: new Date().toISOString() }, ...tudo.historico.filter((h) => h.sql !== limpa)]
    .slice(0, MAXIMO_NO_HISTORICO);
  gravar(CHAVES.laboratorio, tudo);
}

export function ehFavorita(sqlEn) {
  return lerTudo().favoritas.some((f) => f.sql === sqlEn.trim());
}

/** Liga ou desliga uma favorita. @returns {boolean} se ficou favorita */
export function alternarFavorita(sqlEn) {
  const tudo = lerTudo();
  const limpa = sqlEn.trim();
  if (!limpa) return false;
  const ja = tudo.favoritas.some((f) => f.sql === limpa);
  tudo.favoritas = ja
    ? tudo.favoritas.filter((f) => f.sql !== limpa)
    : [{ sql: limpa, em: new Date().toISOString() }, ...tudo.favoritas];
  gravar(CHAVES.laboratorio, tudo);
  return !ja;
}

export function guardarUltima(sqlEn) {
  const tudo = lerTudo();
  tudo.ultima = sqlEn;
  gravar(CHAVES.laboratorio, tudo);
}

/* --------------------------------------------------------------------------
   CSV e "copiar como tabela"
   -------------------------------------------------------------------------- */

/** O formato que vale agora: 'br' ou 'internacional'. */
export function formatoCsv() {
  const escolhido = config().formatoCsv;
  if (escolhido === 'br' || escolhido === 'internacional') return escolhido;
  return idioma() === 'pt' ? 'br' : 'internacional';
}

/** Um valor pronto para o CSV/TSV: número com a vírgula do Brasil, se for o caso. */
function valorParaArquivo(valor, coluna, formato) {
  if (valor === null) return '';
  const texto = formatarValor(valor, coluna);
  return coluna.tipo === 'numero' && formato === 'br' ? texto.replace('.', ',') : texto;
}

/**
 * O resultado inteiro em CSV.
 * @param {{colunas: object[], linhas: any[][]}} resultado
 * @param {'br'|'internacional'} formato
 * @returns {string}
 */
export function paraCsv({ colunas, linhas }, formato) {
  const separador = formato === 'br' ? ';' : ',';
  // Aspas só quando o texto tem o separador, aspas ou quebra de linha (a
  // vírgula decimal do formato brasileiro não precisa delas).
  const citar = (texto) => (texto.includes(separador) || /["\n\r]/.test(texto) ? `"${texto.replace(/"/g, '""')}"` : texto);
  const cabeca = colunas.map((c) => citar(c.nome)).join(separador);
  const corpo = linhas.map((linha) => linha.map((v, j) => citar(valorParaArquivo(v, colunas[j], formato))).join(separador));
  // O BOM avisa ao Excel que o arquivo é UTF-8 (sem ele, os acentos quebram).
  return (formato === 'br' ? '\uFEFF' : '') + [cabeca, ...corpo].join('\r\n') + '\r\n';
}

/**
 * O resultado como texto separado por tabulação: colado numa planilha, vira
 * uma tabela.
 */
export function paraTabelaColavel({ colunas, linhas }, formato) {
  const limpar = (texto) => texto.replace(/[\t\r\n]+/g, ' ');
  const cabeca = colunas.map((c) => limpar(c.nome)).join('\t');
  const corpo = linhas.map((linha) => linha.map((v, j) => limpar(valorParaArquivo(v, colunas[j], formato))).join('\t'));
  return [cabeca, ...corpo].join('\n');
}

/** Baixa um texto como arquivo. */
export function baixarArquivo(nome, texto, tipo = 'text/csv;charset=utf-8') {
  const url = URL.createObjectURL(new Blob([texto], { type: tipo }));
  const link = document.createElement('a');
  link.href = url;
  link.download = nome;
  document.body.append(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* --------------------------------------------------------------------------
   Um CSV importado vira tabela: o nome e a leitura do arquivo
   -------------------------------------------------------------------------- */

/**
 * O nome da tabela a partir do nome do arquivo: sem acento, minúsculas,
 * letras, números e "_" — e nunca igual a uma tabela da base.
 * @param {string} nomeDoArquivo  ex.: "Gastos 2024.csv"
 * @param {Set<string>} ocupados  nomes que não podem ser usados
 */
export function nomeParaTabela(nomeDoArquivo, ocupados) {
  let nome = nomeDoArquivo
    .replace(/\.[^.]+$/, '')
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9_]+/g, '_')
    .replace(/^_+|_+$/g, '');
  if (!nome) nome = 'importada';
  if (/^\d/.test(nome)) nome = `t_${nome}`;
  while (ocupados.has(nome)) nome = `${nome}_csv`;
  return nome;
}

/**
 * O texto de um arquivo: UTF-8, ou — se não for — o Windows-1252 dos CSVs
 * que o Excel brasileiro salva.
 * @param {File} arquivo
 */
export async function lerTextoDoArquivo(arquivo) {
  const bytes = await arquivo.arrayBuffer();
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes).replace(/^\uFEFF/, '');
  } catch {
    return new TextDecoder('windows-1252').decode(bytes);
  }
}
