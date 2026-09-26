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
import { rota, iniciarRoteador } from './roteador.js';
import { mostrarTrilha } from './telas/trilha.js';
import { mostrarEntrada } from './telas/entrada.js';
import { mostrarNivelamento } from './telas/nivelamento.js';
import { mostrarInicio } from './telas/inicio.js';
import { mostrarLaboratorio } from './telas/laboratorio.js';
import { mostrarCola } from './telas/cola.js';
import { totalFeitas, nivelamentoFeito } from './progresso.js';
import { mostrarMissao } from './telas/missao.js';
import { conferirConteudo } from '../dados/missoes/conferencia.js';
import * as bd from './bd.js';

const raiz = document.documentElement;
const botaoTema = document.querySelector('#botao-tema');

/* --------------------------------------------------------------------------
   Tema

   O site abre no ESCURO. O claro é escolha de quem usa, salva em
   meridiano:config (redesenho depois do passo 12 — antes, o tema seguia o
   sistema, como no digita). A mesma regra está no <head> do index.html,
   que roda antes de a página aparecer.
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

/** O tema que vale: o escolhido, ou o escuro. */
function temaQueVale() {
  return config().tema === 'claro' ? 'claro' : 'escuro';
}

botaoTema.addEventListener('click', () => {
  definirConfig({ tema: raiz.dataset.tema === 'escuro' ? 'claro' : 'escuro' });
  aplicarTema(temaQueVale());
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

// O script no <head> já pôs o tema; aqui acertamos o ícone.
aplicarTema(temaQueVale());

// pt.js e en.js com as mesmas chaves? Se não, avisa no console.
conferirChaves();

// Cada nome de tabela e coluna com um só par no outro idioma? Se não, avisa.
conferirMapa();

// Idioma salvo, se houver; senão, o do navegador de quem chegou.
definirIdioma(config().idioma ?? detectarIdioma());

// As telas. "#/" decide: quem nunca concluiu nada (nem missão, nem
// nivelamento) vê a entrada; quem volta vê o início (passo 16).
rota(/^\/missao\/(m\d-\d{2})$/, mostrarMissao);
rota(/^\/trilha$/, mostrarTrilha);
rota(/^\/entrada$/, mostrarEntrada);
rota(/^\/nivelamento$/, mostrarNivelamento);
rota(/^\/inicio$/, mostrarInicio);
rota(/^\/laboratorio(?:\?(.*))?$/, mostrarLaboratorio);
rota(/^\/cola$/, mostrarCola);
rota(/^\/$/, (tela) => (totalFeitas() === 0 && !nivelamentoFeito() ? mostrarEntrada(tela) : mostrarInicio(tela)));
iniciarRoteador(document.querySelector('#tela'));

// As conferências do conteúdo das missões (ver dados/missoes/conferencia.js).
// Sem o motor, sempre — são leves. Com o motor (gabaritos rodando nas duas
// bases), só com ?conferencia no endereço: quem escreve missões abre assim —
// e na trilha, não numa missão: a missão zera a base no idioma da tela bem no
// meio das consultas da conferência.
const naTrilha = ['', '#', '#/', '#/trilha'].includes(location.hash);
conferirConteudo({
  comMotor: new URLSearchParams(location.search).has('conferencia') && naTrilha,
  bd,
});
