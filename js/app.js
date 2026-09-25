/* ==========================================================================
   app.js — ponto de entrada do site.

   Liga o que vale para o site inteiro e sai da frente. Cada tela cuida de
   si. A cada passo do plano ganha mais responsabilidades: idioma (passo 3),
   configuração salva (passo 8), troca de telas e o resto.
   ========================================================================== */

import {
  detectarIdioma,
  definirIdioma,
  ligarSeletorDeIdioma,
  conferirChaves,
} from './i18n.js';
import { config, definirConfig, aoMudarConfig } from './estado.js';
import { conferirMapa } from './traducao-sql.js';
import { ligarBancada } from './telas/bancada.js';
import { conferirConteudo } from '../dados/missoes/conferencia.js';
import * as bd from './bd.js';

const raiz = document.documentElement;
const botaoTema = document.querySelector('#botao-tema');
const preferenciaEscura = window.matchMedia('(prefers-color-scheme: dark)');

/* --------------------------------------------------------------------------
   Tema (a regra do digita)

   A regra, numa frase: a ÚLTIMA mudança vale, e o sistema é a referência.

     - primeira visita: segue o tema do sistema;
     - clique no botão: a escolha vale e fica salva;
     - o sistema muda com o site aberto: o site acompanha e a escolha manual
       é descartada, porque ela é a mudança mais antiga das duas;
     - ao voltar ao site: se o sistema continua como estava quando a escolha
       foi feita, a escolha vale; se mudou nesse meio-tempo, quem vale é o
       sistema, e a escolha é descartada.

   É por isso que a escolha manual é salva em DUAS partes: o tema escolhido e
   o tema que o sistema tinha naquele momento. Sem a segunda não há como
   saber, na volta, se o sistema mudou desde então.

   A mesma regra está repetida no <head> do index.html, que roda antes de a
   página aparecer.
   -------------------------------------------------------------------------- */

/**
 * Aplica um tema à página inteira.
 * Basta trocar o atributo data-tema no <html>: o tema.css cuida do resto.
 * @param {'claro'|'escuro'} tema
 */
function aplicarTema(tema) {
  raiz.dataset.tema = tema;

  // O ícone mostra para onde o clique leva: lua = "ir para o escuro".
  const icone = tema === 'escuro' ? '#icone-sol' : '#icone-lua';
  botaoTema.querySelector('use').setAttribute('href', icone);
}

function temaDoSistema() {
  return preferenciaEscura.matches ? 'escuro' : 'claro';
}

/** Esquece a escolha manual: daqui em diante quem manda é o sistema. */
function esquecerEscolhaDeTema() {
  definirConfig({ tema: null, temaDoSistemaNaEscolha: null });
}

/** O tema que vale agora, com a regra inteira aplicada. */
function temaQueVale() {
  const { tema, temaDoSistemaNaEscolha } = config();
  const sistema = temaDoSistema();

  if (!tema) return sistema;

  // O sistema mudou desde a escolha: ela caducou.
  if (temaDoSistemaNaEscolha !== sistema) {
    esquecerEscolhaDeTema();
    return sistema;
  }

  return tema;
}

botaoTema.addEventListener('click', () => {
  const novo = raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro';

  definirConfig({ tema: novo, temaDoSistemaNaEscolha: temaDoSistema() });
  aplicarTema(novo);
});

// O computador trocou de claro para escuro (ao anoitecer, por exemplo). Essa
// é agora a última mudança, então ela vale — e a escolha manual anterior,
// que era mais antiga, é descartada.
preferenciaEscura.addEventListener('change', () => {
  esquecerEscolhaDeTema();
  aplicarTema(temaDoSistema());
});

/* --------------------------------------------------------------------------
   Idioma
   -------------------------------------------------------------------------- */

ligarSeletorDeIdioma();

// Só o que veio de um clique é salvo: a detecção sugere, não decide.
document.addEventListener('idioma-mudou', (evento) => {
  if (evento.detail.manual) definirConfig({ idioma: evento.detail.idioma });
});

// Um backup importado (passo 21) pode trazer outro idioma ou tema: a tela
// segue o estado, e não só o clique.
aoMudarConfig((atual, mudancas) => {
  if ('tema' in mudancas) aplicarTema(temaQueVale());
  if ('idioma' in mudancas && atual.idioma && atual.idioma !== raiz.lang.slice(0, 2)) {
    definirIdioma(atual.idioma);
  }
});

/* --------------------------------------------------------------------------
   Partida
   -------------------------------------------------------------------------- */

// O script no <head> do index.html já aplicou esta mesma regra antes de a
// página aparecer. Repeti-la aqui acerta o ícone e, quando a escolha manual
// caducou, é o que apaga de fato o que estava salvo.
aplicarTema(temaQueVale());

// pt.js e en.js com as mesmas chaves? Se não, avisa no console.
conferirChaves();

// Cada nome de tabela e coluna com um só par no outro idioma? Se não, avisa.
conferirMapa();

// Idioma salvo, se houver; senão, o do navegador de quem chegou.
definirIdioma(config().idioma ?? detectarIdioma());

// PROVISÓRIO: a bancada de teste do motor SQL. Sai no passo 12.
ligarBancada();

// As conferências do conteúdo das missões (ver dados/missoes/conferencia.js).
// Sem o motor, sempre — são leves. Com o motor (gabaritos rodando nas duas
// bases), só com ?conferencia no endereço: quem escreve missões abre assim.
conferirConteudo({
  comMotor: new URLSearchParams(location.search).has('conferencia'),
  bd,
});
