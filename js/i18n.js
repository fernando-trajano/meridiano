/* ==========================================================================
   i18n.js — o tradutor do site. Adaptado do digita.

   "i18n" é como se abrevia "internationalization": i + 18 letras + n.

   Como funciona, em uma frase: no HTML você marca um elemento com
   data-i18n="vitrine.titulo", e este arquivo troca o texto dele pelo texto
   do idioma escolhido.

   Marcadores aceitos no HTML:
     data-i18n="chave"         → troca o texto de dentro do elemento
     data-i18n-aria="chave"    → troca o atributo aria-label (leitores de tela)
     data-i18n-titulo="chave"  → troca o atributo title (a dica ao passar o mouse)

   Duas fontes de texto, por dois caminhos:
     - a INTERFACE (botões, títulos, avisos) mora em dados/i18n/pt.js e en.js,
       e é lida por chave, com t('secao.chave');
     - o CONTEÚDO (missões, dicionário da base, jogos) já vem com os dois
       idiomas lado a lado, { pt: '…', en: '…' }, e é lido com emIdioma().
   ========================================================================== */

import { pt } from '../dados/i18n/pt.js';
import { en } from '../dados/i18n/en.js';

const idiomas = { pt, en };

/** Idioma usado quando não dá para detectar, e também o de reserva. */
export const IDIOMA_PADRAO = 'pt';

let idiomaAtual = IDIOMA_PADRAO;

/**
 * Descobre o idioma pelo navegador do visitante.
 * navigator.languages traz a lista de idiomas na ordem de preferência dele
 * (ex.: ['pt-BR', 'pt', 'en-US']). O primeiro que for português ou inglês
 * ganha; se nenhum dos dois aparecer, o site abre em inglês — é a língua que
 * mais gente de fora lê.
 * @returns {'pt'|'en'}
 */
export function detectarIdioma() {
  const preferidos = navigator.languages?.length
    ? navigator.languages
    : [navigator.language || ''];

  for (const codigo of preferidos) {
    if (codigo.toLowerCase().startsWith('pt')) return 'pt';
    if (codigo.toLowerCase().startsWith('en')) return 'en';
  }

  return 'en';
}

/** @returns {'pt'|'en'} o idioma que está valendo agora. */
export function idioma() {
  return idiomaAtual;
}

/**
 * Busca um texto da interface pela chave, no formato "secao.chave".
 * Se faltar no idioma atual, cai no português e avisa no console — assim um
 * texto esquecido aparece durante o desenvolvimento, e nunca some para quem
 * está usando o site.
 *
 * Aceita lacunas: t('trilha.feitas', { feitas: 29, total: 77 }) troca
 * "{feitas} de {total} missões" por "29 de 77 missões". A ordem das palavras
 * fica no texto de cada idioma, nunca no código.
 *
 * @param {string} chave  ex.: 'vitrine.titulo'
 * @param {Record<string, string|number>} [valores]  o que vai nas lacunas
 * @returns {string}
 */
export function t(chave, valores) {
  let texto = buscar(idiomas[idiomaAtual], chave);

  if (typeof texto !== 'string') {
    console.warn(`[i18n] Falta a chave "${chave}" em ${idiomaAtual}.js`);
    const reserva = buscar(idiomas[IDIOMA_PADRAO], chave);
    texto = typeof reserva === 'string' ? reserva : chave;
  }

  return valores ? preencher(texto, valores) : texto;
}

/**
 * Escolhe o lado certo de um texto de conteúdo, { pt: '…', en: '…' }.
 * Mesma rede de segurança do t(): se faltar o idioma atual, usa o português
 * e avisa no console.
 * @param {{pt?: string, en?: string}} objeto
 * @param {Record<string, string|number>} [valores]  o que vai nas lacunas
 * @returns {string}
 */
export function emIdioma(objeto, valores) {
  let texto = objeto?.[idiomaAtual];

  if (typeof texto !== 'string') {
    console.warn(`[i18n] Texto de conteúdo sem "${idiomaAtual}":`, objeto);
    texto = objeto?.[IDIOMA_PADRAO] ?? '';
  }

  return valores ? preencher(texto, valores) : texto;
}

/** Troca cada {nome} do texto pelo valor correspondente. */
function preencher(texto, valores) {
  return texto.replace(/\{(\w+)\}/g, (lacuna, nome) =>
    nome in valores ? String(valores[nome]) : lacuna
  );
}

/** Caminha pelo objeto seguindo os pontos da chave: 'a.b' → objeto.a.b */
function buscar(objeto, chave) {
  return chave.split('.').reduce((atual, parte) => atual?.[parte], objeto);
}

/**
 * Troca o idioma do site inteiro.
 * @param {'pt'|'en'} codigo
 * @param {boolean} [manual]  true quando veio de um clique do usuário, e não
 *                            da detecção automática. Só a escolha manual vai
 *                            ser salva (passo 8) — a detecção não deve virar
 *                            decisão.
 */
export function definirIdioma(codigo, manual = false) {
  idiomaAtual = idiomas[codigo] ? codigo : IDIOMA_PADRAO;

  // Avisa o navegador em que idioma a página está.
  document.documentElement.lang = t('codigoHtml');

  traduzirPagina();
  marcarBotaoDoIdioma();

  // As telas construídas depois escutam este aviso para se redesenharem no
  // idioma novo — e o bd.js (passo 5), para recarregar a base com os nomes
  // de tabela e coluna do outro idioma.
  document.dispatchEvent(
    new CustomEvent('idioma-mudou', { detail: { idioma: idiomaAtual, manual } })
  );
}

/**
 * Percorre a página (ou um pedaço dela) e traduz tudo que estiver marcado.
 * @param {ParentNode} raiz  onde procurar; a página inteira, por padrão
 */
export function traduzirPagina(raiz = document) {
  raiz.querySelectorAll('[data-i18n]').forEach((elemento) => {
    elemento.textContent = t(elemento.dataset.i18n);
  });

  raiz.querySelectorAll('[data-i18n-aria]').forEach((elemento) => {
    elemento.setAttribute('aria-label', t(elemento.dataset.i18nAria));
  });

  raiz.querySelectorAll('[data-i18n-titulo]').forEach((elemento) => {
    elemento.setAttribute('title', t(elemento.dataset.i18nTitulo));
  });

  // O título da aba e a descrição para buscadores também mudam de idioma.
  if (raiz === document) {
    document.title = t('documento.titulo');
    document
      .querySelector('meta[name="description"]')
      ?.setAttribute('content', t('documento.descricao'));
  }
}

/** Deixa PT ou EN marcado como opção ativa no cabeçalho. */
function marcarBotaoDoIdioma() {
  document.querySelectorAll('[data-idioma]').forEach((botao) => {
    botao.setAttribute('aria-pressed', String(botao.dataset.idioma === idiomaAtual));
  });
}

/** Liga os botões PT/EN do cabeçalho. */
export function ligarSeletorDeIdioma() {
  document.querySelectorAll('[data-idioma]').forEach((botao) => {
    botao.addEventListener('click', () => definirIdioma(botao.dataset.idioma, true));
  });
}

/**
 * Confere se pt.js e en.js têm exatamente as mesmas chaves, e avisa no
 * console as que estiverem de um lado só. Roda uma vez, ao abrir o site: é
 * a rede de segurança para quando os dois arquivos crescerem.
 * @returns {boolean} true se os dois estão iguais
 */
export function conferirChaves() {
  const chavesPt = listarChaves(pt);
  const chavesEn = listarChaves(en);

  const soNoPt = chavesPt.filter((chave) => !chavesEn.includes(chave));
  const soNoEn = chavesEn.filter((chave) => !chavesPt.includes(chave));

  if (soNoPt.length) console.warn('[i18n] Chaves que faltam no en.js:', soNoPt);
  if (soNoEn.length) console.warn('[i18n] Chaves que faltam no pt.js:', soNoEn);

  return !soNoPt.length && !soNoEn.length;
}

/** Todas as chaves de um objeto de traduções, no formato "secao.chave". */
function listarChaves(objeto, prefixo = '') {
  return Object.entries(objeto).flatMap(([nome, valor]) =>
    typeof valor === 'object' && valor !== null
      ? listarChaves(valor, `${prefixo}${nome}.`)
      : [`${prefixo}${nome}`]
  );
}
