/* ==========================================================================
   personagens.js — quem faz os pedidos, nos memorandos das missões.

   É CONTEÚDO, não código. Aprovados no passo 4 (ver CLAUDE.md):
     - sem rosto: cada um é um monograma cinza;
     - os textos nunca citam a nacionalidade de ninguém (ela existe só como
       dado, na tabela staff) e nenhum personagem pergunta sobre o "próprio"
       país;
     - cada um está na tabela staff, com o mesmo nome e o mesmo cargo (em
       inglês lá) — o id fica aqui para as missões poderem consultar "quem me
       pediu isto".
   ========================================================================== */

export const personagens = {
  ingrid: {
    nome: 'Ingrid Solberg',
    monograma: 'IS',
    idNaBase: 2,
    cargo: { pt: 'Coordenadora de pesquisa', en: 'Research Coordinator' },
    tom: 'acolhe no primeiro dia; calma, didática',
  },
  kofi: {
    nome: 'Kofi Mensah',
    monograma: 'KM',
    idNaBase: 3,
    cargo: { pt: 'Economista-chefe', en: 'Lead Economist' },
    tom: 'direto, gosta de número exato; PIB e desigualdade',
  },
  lucia: {
    nome: 'Lucía Ferreyra',
    monograma: 'LF',
    idNaBase: 4,
    cargo: { pt: 'Líder de clima e energia', en: 'Climate and Energy Lead' },
    tom: 'quer rankings e comparações; CO₂ e renováveis',
  },
  amelie: {
    nome: 'Amélie Laurent',
    monograma: 'AL',
    idNaBase: 5,
    cargo: { pt: 'Chefe de relações institucionais', en: 'Head of Institutional Relations' },
    tom: 'pede resumos para parceiros; totais e médias',
  },
  tomasz: {
    nome: 'Tomasz Nowak',
    monograma: 'TN',
    idNaBase: 6,
    cargo: { pt: 'Chefe de projetos de cooperação', en: 'Head of Cooperation Projects' },
    tom: 'cruza projetos, países e viagens',
  },
  hiroshi: {
    nome: 'Hiroshi Tanaka',
    monograma: 'HT',
    idNaBase: 7,
    cargo: { pt: 'Engenheiro-chefe de dados', en: 'Lead Data Engineer' },
    tom: 'cuida da base; cuidadoso com o que se apaga',
  },
  nadia: {
    nome: 'Nadia Haddad',
    monograma: 'NH',
    idNaBase: 1,
    cargo: { pt: 'Diretora-geral', en: 'Director-General' },
    tom: 'tendências ao longo do tempo; o relatório anual',
  },
};
