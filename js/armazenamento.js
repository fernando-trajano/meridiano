/* ==========================================================================
   armazenamento.js — ler e gravar no localStorage. Adaptado do digita.

   O localStorage é a gavetinha que o navegador guarda para cada site. Fica
   só no computador de quem usa: não há login, nada é enviado para servidor
   nenhum, e o progresso de uma pessoa nunca aparece para outra.

   Todas as chaves do meridiano. começam com "meridiano:" para não se
   misturarem com as de outros sites que rodem no mesmo endereço (o digita,
   por exemplo, mora em fernando-trajano.github.io também).

   Este arquivo é a ÚNICA parte do site que fala com o localStorage. O resto
   do código pede as coisas aqui, e por isso não precisa se preocupar com
   navegador em modo privado, gaveta cheia ou dado corrompido.

   (O motor SQL não mora aqui: ele fica no Cache Storage, ver bd.js.)
   ========================================================================== */

const PREFIXO = 'meridiano:';

/** As gavetas que o site usa (ver a tabela "Chaves do localStorage" no PLANO.md). */
export const CHAVES = {
  config: `${PREFIXO}config`,
  progresso: `${PREFIXO}progresso`,
  sequencia: `${PREFIXO}sequencia`,
  estatisticas: `${PREFIXO}estatisticas`,
  nivelamento: `${PREFIXO}nivelamento`,
  laboratorio: `${PREFIXO}laboratorio`,
  jogos: `${PREFIXO}jogos`,
};

/**
 * O localStorage pode simplesmente não existir: navegação privada em alguns
 * navegadores, cookies bloqueados, ou uma configuração de privacidade mais
 * dura. Nesses casos o site inteiro continua funcionando — só não lembra
 * nada de uma visita para a outra.
 */
let disponivel = null;

function temLocalStorage() {
  if (disponivel !== null) return disponivel;

  try {
    const teste = `${PREFIXO}teste`;
    localStorage.setItem(teste, '1');
    localStorage.removeItem(teste);
    disponivel = true;
  } catch {
    disponivel = false;
    console.warn(
      '[meridiano] Este navegador não deixa salvar dados. O site funciona, mas ' +
        'o progresso não será lembrado.'
    );
  }

  return disponivel;
}

/**
 * Lê uma gaveta.
 * @param {string} chave  uma das CHAVES
 * @param {object|null} padrao  o que devolver quando não há nada salvo
 * @returns {object|null}
 */
export function ler(chave, padrao = {}) {
  // Quem chama com padrão null está perguntando "existe algo salvo?" — e a
  // resposta honesta, quando não existe, é null, não um objeto vazio.
  const semNada = () => (padrao === null ? null : { ...padrao });

  if (!temLocalStorage()) return semNada();

  try {
    const bruto = localStorage.getItem(chave);
    if (!bruto) return semNada();

    const salvo = JSON.parse(bruto);

    // O que está salvo pode ser de uma versão antiga do site, com campos a
    // menos. Misturar com o padrão garante que nunca falte um campo.
    return { ...padrao, ...salvo };
  } catch {
    // Dado corrompido (alguém mexeu na mão, por exemplo) não pode derrubar o
    // site: joga fora e começa limpo.
    console.warn(`[meridiano] "${chave}" estava ilegível e foi descartada.`);
    apagar(chave);
    return semNada();
  }
}

/**
 * Grava uma gaveta.
 * @param {string} chave
 * @param {object} valor
 * @returns {boolean}  false se não deu para salvar
 */
export function gravar(chave, valor) {
  if (!temLocalStorage()) return false;

  try {
    localStorage.setItem(chave, JSON.stringify(valor));
    return true;
  } catch {
    // Acontece quando a gaveta do navegador está cheia.
    console.warn(`[meridiano] Não foi possível salvar "${chave}".`);
    return false;
  }
}

/** Apaga uma gaveta. */
export function apagar(chave) {
  if (!temLocalStorage()) return;

  try {
    localStorage.removeItem(chave);
  } catch {
    /* não há o que fazer, e não é motivo para quebrar a tela */
  }
}

/**
 * Tudo o que o site guardou — usado pelo backup do progresso (passo 21).
 * @returns {object}
 */
export function lerTudo() {
  const tudo = {};

  for (const [nome, chave] of Object.entries(CHAVES)) {
    const valor = ler(chave, null);
    if (valor) tudo[nome] = valor;
  }

  return tudo;
}
