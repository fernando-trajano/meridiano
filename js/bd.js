/* ==========================================================================
   bd.js — o motor SQL do site: DuckDB-WASM, rodando no navegador.

   Em uma frase: abre o DuckDB (só quando alguma tela pede), carrega as 11
   tabelas da base com os nomes do idioma da tela e roda consultas.

   Três regras do projeto que moram aqui:
   1. Nada vem de fora. O motor e os dados são arquivos do próprio site, e a
      instalação automática de extensões do DuckDB (que buscaria arquivos na
      internet) fica desligada.
   2. Cada missão começa com a base zerada: zerarBase() joga fora o banco
      inteiro — tabelas, views, o que o aluno tiver criado — e monta outro
      a partir dos CSVs, que ficam guardados na memória do motor.
   3. A base fala o idioma da tela: em português as tabelas se chamam
      paises, pais_ano…; em inglês, countries, country_year… Os nomes vêm do
      dicionario.js. Trocar de idioma recarrega a base.

   O motor só é baixado na primeira chamada de abrirBase(). Quem só lê a
   trilha ou a cola nunca paga esse peso.
   ========================================================================== */

import { dicionario } from '../dados/base/dicionario.js';
import { idioma } from './i18n.js';

const PASTA_MOTOR = new URL('../vendor/duckdb/', import.meta.url);
const PASTA_BASE = new URL('../dados/base/', import.meta.url);

// Tamanho do duckdb-eh.wasm SEM compressão (ver vendor/duckdb/VERSAO.md).
// O navegador conta os bytes já descomprimidos, então é contra este número
// que a barra de progresso anda — o Content-Length do servidor é o tamanho
// comprimido e não serviria. Também confere a cópia guardada (ver abaixo).
const TAMANHO_DO_MOTOR = 34242586;

// O motor fica guardado no armazenamento do próprio site (Cache Storage),
// para a segunda visita em diante abrir sem baixar os 7,8 MB de novo — sem
// depender do cache comum do navegador, que pode descartar um arquivo desse
// tamanho (foi o que o passo 6 mediu). A versão vai no nome: ao atualizar o
// motor, troque as duas linhas juntas, e a cópia antiga é apagada sozinha.
const VERSAO_DO_MOTOR = '1.32.0';
const GAVETA_DO_MOTOR = `meridiano:motor-${VERSAO_DO_MOTOR}`;

// O banco onde o aluno trabalha. Recriado a cada zerarBase().
const BANCO = 'observatorio';

let abertura = null;      // a promessa da abertura: abrir duas vezes não baixa duas vezes
let db = null;
let conexao = null;
let idiomaAtualDaBase = null;
let arrowUtil = null;

/** Medições da abertura, para o passo 6 (peso e tempo no endereço real). */
export const medicoes = {};

/* --------------------------------------------------------------------------
   Abrir
   -------------------------------------------------------------------------- */

/**
 * Abre o motor e carrega a base. Pode ser chamada várias vezes: a segunda
 * em diante só espera a primeira terminar.
 * @param {{aoProgredir?: (fracao: number, etapa: 'motor'|'dados'|'tabelas') => void}} [opcoes]
 * @returns {Promise<void>}
 */
export function abrirBase({ aoProgredir = () => {} } = {}) {
  abertura ??= abrir(aoProgredir).catch((erro) => {
    abertura = null;       // deixa tentar de novo
    throw erro;
  });
  return abertura;
}

/** @returns {boolean} true se o motor já está aberto e pronto. */
export function baseAberta() {
  return conexao !== null;
}

async function abrir(aoProgredir) {
  const inicio = performance.now();

  // 1. O código do motor (o import map do index.html resolve o Arrow).
  aoProgredir(0, 'motor');
  const duckdb = await import('../vendor/duckdb/duckdb-browser.mjs');
  arrowUtil = (await import('apache-arrow')).util;

  // 2. O .wasm, baixado aqui para a barra de progresso andar de verdade.
  const urlDoMotor = await baixarMotor((fracao) => aoProgredir(fracao * 0.75, 'motor'));

  // 3. O motor, num Web Worker: as consultas rodam fora da tela, que
  //    continua respondendo enquanto isso.
  const worker = new Worker(new URL('duckdb-browser-eh.worker.js', PASTA_MOTOR));
  db = new duckdb.AsyncDuckDB(new duckdb.VoidLogger(), worker);
  await db.instantiate(urlDoMotor);
  URL.revokeObjectURL(urlDoMotor);
  await db.open({});
  conexao = await db.connect();
  medicoes.motorMs = Math.round(performance.now() - inicio);

  // 4. Os CSVs, guardados na memória do motor com um nome simples.
  aoProgredir(0.75, 'dados');
  const inicioDados = performance.now();
  const tabelas = Object.values(dicionario);
  let baixadas = 0;
  medicoes.dadosBytes = 0;
  await Promise.all(
    tabelas.map(async (tabela) => {
      const resposta = await fetch(new URL(tabela.arquivo, PASTA_BASE));
      if (!resposta.ok) throw new Error(`Não foi possível baixar ${tabela.arquivo}`);
      const texto = await resposta.text();
      medicoes.dadosBytes += texto.length;
      await db.registerFileText(nomeDoArquivo(tabela), texto);
      baixadas += 1;
      aoProgredir(0.75 + 0.2 * (baixadas / tabelas.length), 'dados');
    })
  );
  medicoes.dadosMs = Math.round(performance.now() - inicioDados);

  // 5. As tabelas, no idioma da tela.
  aoProgredir(0.95, 'tabelas');
  // Direto, sem passar pela fila: quem está na fila pode estar esperando
  // justamente esta abertura terminar.
  await zerarAgora(idioma());
  aoProgredir(1, 'tabelas');

  medicoes.totalMs = Math.round(performance.now() - inicio);
}

/**
 * Entrega o .wasm como um endereço local (blob), pronto para o motor
 * carregar: da gaveta, se ele já estiver guardado; senão, baixado — e
 * guardado para a próxima vez.
 */
async function baixarMotor(aoProgredir) {
  const endereco = new URL('duckdb-eh.wasm', PASTA_MOTOR).href;

  const guardado = await tirarDaGaveta(endereco);
  if (guardado) {
    medicoes.motorDaGaveta = true;
    aoProgredir(1);
    return URL.createObjectURL(guardado);
  }

  const baixado = await baixarComProgresso(endereco, aoProgredir);
  medicoes.motorDaGaveta = false;
  await guardarNaGaveta(endereco, baixado);
  return URL.createObjectURL(baixado);
}

/** O motor guardado, se houver uma cópia inteira; senão, null. */
async function tirarDaGaveta(endereco) {
  try {
    if (!('caches' in window)) return null;
    const gaveta = await caches.open(GAVETA_DO_MOTOR);
    const resposta = await gaveta.match(endereco);
    if (!resposta) return null;

    const arquivo = await resposta.blob();
    // Uma cópia pela metade (download interrompido, disco cheio) não serve.
    if (arquivo.size !== TAMANHO_DO_MOTOR) {
      await gaveta.delete(endereco);
      return null;
    }
    return new Blob([arquivo], { type: 'application/wasm' });
  } catch {
    // Sem armazenamento (modo privado, bloqueio do navegador): baixa e pronto.
    return null;
  }
}

/** Guarda o motor e apaga as versões antigas. Se não der, segue sem guardar. */
async function guardarNaGaveta(endereco, arquivo) {
  try {
    if (!('caches' in window)) return;
    for (const nome of await caches.keys()) {
      if (nome.startsWith('meridiano:motor-') && nome !== GAVETA_DO_MOTOR) await caches.delete(nome);
    }
    const gaveta = await caches.open(GAVETA_DO_MOTOR);
    await gaveta.put(
      endereco,
      new Response(arquivo, { headers: { 'Content-Type': 'application/wasm' } })
    );
  } catch (erro) {
    console.warn('[bd] Não foi possível guardar o motor para a próxima visita:', erro);
  }
}

/** Baixa o .wasm contando os bytes, para a barra de progresso andar de verdade. */
async function baixarComProgresso(endereco, aoProgredir) {
  const inicio = performance.now();
  const resposta = await fetch(endereco);
  if (!resposta.ok || !resposta.body) throw new Error('Não foi possível baixar o motor SQL.');

  const leitor = resposta.body.getReader();
  const pedacos = [];
  let recebidos = 0;
  for (;;) {
    const { done, value } = await leitor.read();
    if (done) break;
    pedacos.push(value);
    recebidos += value.length;
    aoProgredir(Math.min(recebidos / TAMANHO_DO_MOTOR, 1));
  }

  medicoes.motorBytes = recebidos;
  medicoes.downloadMotorMs = Math.round(performance.now() - inicio);
  // O tipo application/wasm deixa o navegador compilar o motor em streaming.
  return new Blob(pedacos, { type: 'application/wasm' });
}

/** O nome com que cada CSV fica guardado dentro do motor: "countries.csv". */
function nomeDoArquivo(tabela) {
  return tabela.arquivo.split('/').pop();
}

/* --------------------------------------------------------------------------
   Zerar e trocar de idioma
   -------------------------------------------------------------------------- */

/**
 * Joga fora o banco do aluno e monta outro, limpo, a partir dos CSVs.
 * É chamado no começo de cada missão e ao trocar de idioma.
 * @param {'pt'|'en'} [idiomaDaBase]  com que nomes criar as tabelas
 */
export function zerarBase(idiomaDaBase = idioma()) {
  // Uma de cada vez: trocar o idioma (que zera a base) e abrir uma missão
  // (que também zera) quase ao mesmo tempo misturava os DETACH e ATTACH das
  // duas, e o motor recusava. Cada pedido espera o anterior terminar.
  const vez = filaDeZerar.catch(() => {}).then(() => zerarAgora(idiomaDaBase));
  filaDeZerar = vez;
  return vez;
}

let filaDeZerar = Promise.resolve();

async function zerarAgora(idiomaDaBase) {
  if (!db) await abrirBase();
  const inicio = performance.now();

  // Uma transação que o aluno deixou aberta (BEGIN sem COMMIT) impediria
  // o resto. Se não houver nenhuma, o ROLLBACK só reclama — e tudo bem.
  await tentar('ROLLBACK');

  // As regras de sempre, reaplicadas: se o aluno tiver mexido nelas com SET,
  // zerar a base desfaz.
  await conexao.query('SET autoinstall_known_extensions = false');
  await conexao.query('SET autoload_known_extensions = false');

  // Objetos temporários (CREATE TEMP …) vivem fora do banco e sobreviveriam.
  const temporarios = await conexao.query(
    "SELECT 'VIEW' AS tipo, view_name AS nome FROM duckdb_views() WHERE temporary AND NOT internal " +
      "UNION ALL SELECT 'TABLE', table_name FROM duckdb_tables() WHERE temporary"
  );
  for (const { tipo, nome } of temporarios.toArray()) {
    await tentar(`DROP ${tipo} IF EXISTS temp.main."${nome}"`);
  }

  // O banco inteiro sai, e entra um novo, vazio.
  await conexao.query('USE memory');
  await conexao.query(`DETACH DATABASE IF EXISTS ${BANCO}`);
  await conexao.query(`ATTACH ':memory:' AS ${BANCO}`);
  await conexao.query(`USE ${BANCO}`);

  for (const [nomeEn, tabela] of Object.entries(dicionario)) {
    await conexao.query(sqlDeCriacao(nomeEn, tabela, idiomaDaBase));
  }

  idiomaAtualDaBase = idiomaDaBase;
  medicoes.zerarMs = Math.round(performance.now() - inicio);
}

/**
 * O CREATE TABLE de uma tabela: lê o CSV com os tipos do dicionário (nada
 * de adivinhar) e dá a cada coluna o nome do idioma pedido.
 */
function sqlDeCriacao(nomeEn, tabela, idiomaDaBase) {
  const emPt = idiomaDaBase === 'pt';
  const colunas = Object.entries(tabela.colunas);

  const tipos = colunas.map(([nome, coluna]) => `'${nome}': '${coluna.tipo}'`).join(', ');
  const selecao = colunas
    .map(([nome, coluna]) => `"${nome}" AS "${emPt ? coluna.pt : nome}"`)
    .join(', ');

  return (
    `CREATE TABLE "${emPt ? tabela.pt : nomeEn}" AS ` +
    `SELECT ${selecao} FROM read_csv('${nomeDoArquivo(tabela)}', ` +
    `header = true, delim = ',', quote = '"', columns = {${tipos}})`
  );
}

/* --------------------------------------------------------------------------
   CSV do usuário (laboratório, passo 17)

   O arquivo fica registrado no motor, só na memória desta visita, com um
   nome que não se confunde com os da base ("importado-…"). Zerar a base
   troca o banco, mas não apaga os arquivos registrados: por isso a tabela
   pode ser recriada depois de uma troca de idioma ou de uma missão.
   -------------------------------------------------------------------------- */

const arquivoImportado = (nomeTabela) => `importado-${nomeTabela}.csv`;

/**
 * Registra o texto de um CSV e cria (ou troca) a tabela com ele.
 * O DuckDB descobre sozinho o separador, o cabeçalho e os tipos.
 * @param {string} nomeTabela  já limpo por quem chama
 * @param {string} texto
 */
export async function importarCsv(nomeTabela, texto) {
  if (!db) await abrirBase();
  await db.registerFileText(arquivoImportado(nomeTabela), texto);
  await conexao.query(`CREATE OR REPLACE TABLE "${nomeTabela}" AS SELECT * FROM read_csv_auto('${arquivoImportado(nomeTabela)}')`);
}

/**
 * Recria uma tabela importada que a base zerada levou embora (se ela já
 * existir, não faz nada).
 * @param {string} nomeTabela
 */
export async function recriarImportada(nomeTabela) {
  if (!conexao) return;
  await conexao.query(`CREATE TABLE IF NOT EXISTS "${nomeTabela}" AS SELECT * FROM read_csv_auto('${arquivoImportado(nomeTabela)}')`);
}

/** @returns {'pt'|'en'|null} o idioma dos nomes da base agora. */
export function idiomaDaBase() {
  return idiomaAtualDaBase;
}

// Trocar o idioma da tela recarrega a base com os nomes do outro idioma —
// mas só se ela já estiver aberta. Avisa quem depende quando terminar.
document.addEventListener('idioma-mudou', async (evento) => {
  if (!conexao || evento.detail.idioma === idiomaAtualDaBase) return;
  await zerarBase(evento.detail.idioma);
  document.dispatchEvent(new CustomEvent('base-recarregada', { detail: { idioma: idiomaAtualDaBase } }));
});

/* --------------------------------------------------------------------------
   Consultar
   -------------------------------------------------------------------------- */

/**
 * Roda uma consulta e devolve o resultado em JavaScript simples.
 * Se a consulta tiver vários comandos separados por ";", vale o último.
 *
 * @param {string} sql
 * @param {{maxLinhas?: number}} [opcoes]  quantas linhas converter (todas, por padrão)
 * @returns {Promise<{
 *   colunas: {nome: string, tipo: 'numero'|'texto'|'data'|'logico'|'outro', escala: number|null}[],
 *   linhas: any[][],
 *   total: number,
 *   ms: number
 * }>}
 * Se o DuckDB recusar a consulta, a promessa falha com o erro dele (a
 * tradução para uma frase simples é o erros-sql.js, no passo 7).
 */
export async function consultar(sql, { maxLinhas = Infinity } = {}) {
  await abrirBase();
  const inicio = performance.now();
  const tabela = await conexao.query(sql);
  const ms = Math.round(performance.now() - inicio);

  const campos = tabela.schema.fields;
  const colunas = campos.map((campo) => ({
    nome: campo.name,
    tipo: tipoSimples(campo.type),
    // Casas decimais de um DECIMAL, para mostrar 45496.00 e não 45496.
    escala: campo.type.typeId === TIPO.Decimal ? campo.type.scale : null,
  }));
  const vetores = campos.map((_, j) => tabela.getChildAt(j));

  const quantas = Math.min(tabela.numRows, maxLinhas);
  const linhas = new Array(quantas);
  for (let i = 0; i < quantas; i += 1) {
    linhas[i] = vetores.map((vetor, j) => converterValor(vetor.get(i), campos[j].type));
  }

  return { colunas, linhas, total: tabela.numRows, ms };
}

/** Roda um comando e ignora o erro — para limpezas que podem não ter o que limpar. */
async function tentar(sql) {
  try {
    await conexao.query(sql);
  } catch {
    /* nada a fazer */
  }
}

/* --------------------------------------------------------------------------
   Do Arrow (o formato em que o DuckDB responde) para JavaScript simples
   -------------------------------------------------------------------------- */

// Os códigos de tipo do Arrow (enum Type) que interessam aqui.
const TIPO = { Int: 2, Float: 3, Utf8: 5, Bool: 6, Decimal: 7, Date: 8, Time: 9, Timestamp: 10, LargeUtf8: 20 };

function tipoSimples(tipo) {
  switch (tipo.typeId) {
    case TIPO.Int:
    case TIPO.Float:
    case TIPO.Decimal:
      return 'numero';
    case TIPO.Utf8:
    case TIPO.LargeUtf8:
      return 'texto';
    case TIPO.Date:
    case TIPO.Timestamp:
      return 'data';
    case TIPO.Bool:
      return 'logico';
    default:
      return 'outro';
  }
}

/** Um valor do Arrow → número, texto, booleano ou null. */
function converterValor(valor, tipo) {
  if (valor === null || valor === undefined) return null;

  switch (tipo.typeId) {
    case TIPO.Int:
      // BIGINT chega como BigInt. Os números da base cabem com folga num
      // Number; se um dia não couber, vira texto em vez de perder dígitos.
      if (typeof valor === 'bigint') {
        const numero = Number(valor);
        return Number.isSafeInteger(numero) ? numero : valor.toString();
      }
      return valor;
    case TIPO.Decimal:
      // DECIMAL(12,2) chega como um inteiro grande sem a vírgula; a escala
      // diz quantas casas voltar.
      return arrowUtil.bigNumToNumber(valor, tipo.scale);
    case TIPO.Date:
      return new Date(Number(valor)).toISOString().slice(0, 10);
    case TIPO.Timestamp:
      return new Date(Number(valor)).toISOString().slice(0, 19).replace('T', ' ');
    case TIPO.Float:
    case TIPO.Utf8:
    case TIPO.LargeUtf8:
    case TIPO.Bool:
      return valor;
    default:
      // Listas, structs e o resto: mostrados como texto.
      return typeof valor?.toJSON === 'function' ? JSON.stringify(valor.toJSON()) : String(valor);
  }
}
