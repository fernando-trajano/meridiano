/* ==========================================================================
   indice.js — os 10 módulos da trilha, na ordem.

   É CONTEÚDO, não código. Cada módulo diz:
     - quantas missões terá (total), contando a revisão e o desafio final;
     - quem faz os pedidos (personagem, ver dados/personagens.js);
     - o arquivo com as missões, quando já estiver escrito (arquivo: null =
       ainda não escrito; a trilha mostra "em breve").

   Todo módulo segue o ritmo: missões → revisão misturada → desafio final,
   e o desafio final libera o módulo seguinte.

   Na versão 1, só os módulos 0 a 2 são escritos (passo 10). Para escrever um
   módulo novo: criar o arquivo seguindo o MODELO.md, apontar `arquivo` para
   ele aqui e abrir o site com ?conferencia para rodar as 5 conferências.
   ========================================================================== */

export const modulos = [
  {
    id: 'm0',
    numero: 0,
    titulo: { pt: 'Primeiro dia no observatório', en: 'First day at the observatory' },
    personagem: 'ingrid',
    total: 3,
    arquivo: null,
  },
  {
    id: 'm1',
    numero: 1,
    titulo: { pt: 'Escolher colunas', en: 'Choosing columns' },
    personagem: 'kofi',
    total: 8,
    arquivo: null,
  },
  {
    id: 'm2',
    numero: 2,
    titulo: { pt: 'Filtrar linhas', en: 'Filtering rows' },
    personagem: 'kofi',
    total: 9,
    arquivo: null,
  },
  {
    id: 'm3',
    numero: 3,
    titulo: { pt: 'Ordenar e transformar', en: 'Sorting and transforming' },
    personagem: 'lucia',
    total: 10,
    arquivo: null,
  },
  {
    id: 'm4',
    numero: 4,
    titulo: { pt: 'Resumir e agrupar', en: 'Summarising and grouping' },
    personagem: 'amelie',
    total: 8,
    arquivo: null,
  },
  {
    id: 'm5',
    numero: 5,
    titulo: { pt: 'Juntar tabelas', en: 'Joining tables' },
    personagem: 'tomasz',
    total: 9,
    arquivo: null,
  },
  {
    id: 'm6',
    numero: 6,
    titulo: { pt: 'Consultas dentro de consultas', en: 'Queries inside queries' },
    personagem: 'tomasz',
    total: 8,
    arquivo: null,
  },
  {
    id: 'm7',
    numero: 7,
    titulo: { pt: 'Análise moderna', en: 'Modern analysis' },
    personagem: 'nadia',
    total: 10,
    arquivo: null,
  },
  {
    id: 'm8',
    numero: 8,
    titulo: { pt: 'Criar e alterar dados', en: 'Creating and changing data' },
    personagem: 'hiroshi',
    total: 8,
    arquivo: null,
  },
  {
    id: 'm9',
    numero: 9,
    titulo: { pt: 'Relatório anual', en: 'Annual report' },
    personagem: 'nadia',
    total: 4,
    arquivo: null,
  },
];

/** O total da trilha: 77. */
export const TOTAL_DE_MISSOES = modulos.reduce((soma, m) => soma + m.total, 0);

/**
 * Carrega as missões de um módulo (só quando alguém precisa delas).
 * @param {string} idDoModulo  ex.: 'm1'
 * @returns {Promise<object[]>}  as missões, ou [] se o módulo ainda não foi escrito
 */
export async function carregarModulo(idDoModulo) {
  const modulo = modulos.find((m) => m.id === idDoModulo);
  if (!modulo?.arquivo) return [];
  const { missoes } = await import(modulo.arquivo);
  return missoes;
}
