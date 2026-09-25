/* ==========================================================================
   estado.js — as configurações do usuário, em memória e salvas.
   Adaptado do digita.

   Guarda o que o site precisa lembrar de uma visita para a outra: idioma,
   tema, som e o formato do CSV exportado. Quem quiser saber de alguma dessas
   coisas pergunta aqui; quem mudar alguma, avisa aqui.

   Uma ideia importante (a mesma do digita): o valor `null` significa "o
   usuário ainda não escolheu". Enquanto for null, o site segue o palpite —
   o idioma do navegador, o tema do sistema. Assim que a pessoa escolhe, o
   valor é gravado e a escolha manual vale.
   ========================================================================== */

import { CHAVES, ler, gravar } from './armazenamento.js';

/** Como o site começa, para quem nunca esteve aqui. */
const PADRAO = {
  idioma: null, // null = usar o idioma do navegador
  tema: null, // null = acompanhar o modo claro/escuro do sistema

  /* O tema que o SISTEMA tinha quando o usuário escolheu um tema à mão.
     Guardar isto é o que permite saber, na volta, se o sistema mudou desde
     então — e, se mudou, descartar a escolha. Ver a seção Tema do app.js. */
  temaDoSistemaNaEscolha: null,

  mudo: false, // o botão de mudo — os sons só existem nos jogos (passo 21)

  /* O CSV exportado pelo laboratório (passo 17): 'br' (ponto e vírgula,
     vírgula decimal, para o Excel brasileiro) ou 'internacional' (vírgula e
     ponto). null = seguir o idioma da tela: PT → br, EN → internacional. */
  formatoCsv: null,
};

let configuracao = limpar(ler(CHAVES.config, PADRAO));

/**
 * Descarta campos que o site não usa mais.
 *
 * Uma configuração salva mês passado pode ter campos que já foram removidos
 * do site. Sem esta limpeza eles ficariam para sempre no localStorage e,
 * pior, entrariam no backup exportado.
 */
function limpar(salva) {
  const limpa = {};

  for (const chave of Object.keys(PADRAO)) limpa[chave] = salva[chave] ?? PADRAO[chave];

  return limpa;
}

/** Quem quer ser avisado quando algo muda. */
const ouvintes = new Set();

/**
 * As configurações de agora.
 * Devolve uma cópia: ninguém muda o estado por acidente, só por definirConfig.
 * @returns {typeof PADRAO}
 */
export function config() {
  return { ...configuracao };
}

/**
 * Muda uma ou mais configurações, salva e avisa quem depende delas.
 * @param {Partial<typeof PADRAO>} mudancas  ex.: { tema: 'escuro' }
 */
export function definirConfig(mudancas) {
  const antes = configuracao;
  configuracao = { ...configuracao, ...mudancas };

  // Nada mudou de fato? Então não salva nem avisa ninguém.
  const mudouAlgo = Object.keys(mudancas).some((chave) => antes[chave] !== configuracao[chave]);
  if (!mudouAlgo) return;

  gravar(CHAVES.config, configuracao);

  for (const ouvinte of ouvintes) ouvinte(config(), mudancas);
}

/**
 * Pede para ser avisado sempre que a configuração mudar.
 * @param {(config: typeof PADRAO, mudancas: object) => void} ouvinte
 * @returns {() => void}  função para parar de ouvir
 */
export function aoMudarConfig(ouvinte) {
  ouvintes.add(ouvinte);
  return () => ouvintes.delete(ouvinte);
}

/**
 * Relê a configuração do que está salvo e avisa quem depende dela.
 * Usado depois de importar um backup: sem isto, o idioma e o tema
 * importados só valeriam ao recarregar a página.
 */
export function recarregarConfig() {
  configuracao = limpar(ler(CHAVES.config, PADRAO));

  for (const ouvinte of ouvintes) ouvinte(config(), configuracao);
}
