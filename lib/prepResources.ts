// "How to prepare for this opportunity" — a small hand-authored data
// sheet keyed by opportunity_type. Every opportunity of the same type
// (e.g. every "summer_program") shows the exact same three resource
// cards; this isn't generated per-opportunity.
//
// `url: null` means the link hasn't been filled in yet — the card still
// renders (title + description), just without a clickable "Acessar"
// link. Fill these in as real resources are found, per type below.
export type PrepResource = {
  title: string;
  description: string;
  url: string | null;
};

export const PREP_RESOURCES: Record<string, PrepResource[]> = {
  academic_olympiad: [
    {
      title: "Provas de anos anteriores",
      description:
        "Pratique com provas de edições passadas para conhecer o formato, o estilo das questões e o nível de dificuldade.",
      url: null,
    },
    {
      title: "Conteúdo programático",
      description:
        "Consulte a lista oficial de tópicos cobrados para direcionar seus estudos com foco no que realmente cai.",
      url: null,
    },
    {
      title: "Grupos de estudo",
      description:
        "Converse com quem já participou, troque materiais e estratégias com outros competidores.",
      url: null,
    },
  ],
  competition_contest: [
    {
      title: "Trabalhos premiados de edições anteriores",
      description:
        "Veja exemplos do que já venceu para entender o padrão de qualidade esperado pela banca.",
      url: null,
    },
    {
      title: "Guia oficial de submissão",
      description:
        "Confira o regulamento em detalhe — formato, critérios de avaliação e prazos de entrega.",
      url: null,
    },
    {
      title: "Mentoria e feedback",
      description:
        "Peça para um professor ou orientador revisar seu material antes da submissão final.",
      url: null,
    },
  ],
  exchange_program: [
    {
      title: "Preparação para a entrevista",
      description:
        "Veja perguntas comuns e pratique respostas sobre seus objetivos e motivações.",
      url: null,
    },
    {
      title: "Certificados de idioma",
      description:
        "Descubra quais exames de proficiência são aceitos e como se preparar para eles.",
      url: null,
    },
    {
      title: "Depoimentos de ex-participantes",
      description:
        "Leia relatos de quem já passou pelo processo para saber o que esperar em cada etapa.",
      url: null,
    },
  ],
  scholarship: [
    {
      title: "Como escrever uma carta de motivação",
      description:
        "Aprenda a estrutura e o tom que costumam funcionar melhor para esse tipo de candidatura.",
      url: null,
    },
    {
      title: "Documentos necessários",
      description:
        "Monte com antecedência a lista de documentos, comprovantes e cartas de recomendação exigidos.",
      url: null,
    },
    {
      title: "Depoimentos de bolsistas",
      description:
        "Veja relatos de quem já conquistou essa bolsa e como se preparou para o processo seletivo.",
      url: null,
    },
  ],
  summer_program: [
    {
      title: "Como se preparar para o processo seletivo",
      description:
        "Entenda as etapas do processo e o que costuma ser avaliado em cada uma delas.",
      url: null,
    },
    {
      title: "Dicas de ensaio e redação",
      description:
        "Veja boas práticas para escrever textos de aplicação que se destacam entre os candidatos.",
      url: null,
    },
    {
      title: "Experiências de participantes anteriores",
      description:
        "Leia relatos de quem já fez o programa para saber o que esperar da experiência.",
      url: null,
    },
  ],
  social_impact: [
    {
      title: "Como estruturar um projeto de impacto",
      description:
        "Aprenda a definir problema, público e métricas antes de submeter sua iniciativa.",
      url: null,
    },
    {
      title: "Exemplos de iniciativas premiadas",
      description:
        "Veja projetos que já se destacaram para entender o que costuma ser valorizado.",
      url: null,
    },
    {
      title: "Rede de apoio e mentoria",
      description:
        "Encontre organizações e mentores que podem ajudar a desenvolver sua ideia.",
      url: null,
    },
  ],
};

// Fallback for any opportunity_type not explicitly listed above.
export const DEFAULT_PREP_RESOURCES: PrepResource[] = [
  {
    title: "Edital oficial",
    description:
      "Leia o edital completo para entender critérios, etapas e prazos antes de começar a se preparar.",
    url: null,
  },
  {
    title: "Depoimentos de participantes",
    description:
      "Busque relatos de quem já passou pelo processo para saber o que esperar.",
    url: null,
  },
  {
    title: "Comunidade de apoio",
    description:
      "Encontre grupos, professores ou mentores que possam te ajudar na preparação.",
    url: null,
  },
];

// Picks the resource set for the first opportunity_type that has an
// entry in the data sheet; falls back to the generic set otherwise.
export function getPrepResources(opportunityTypes: string[]): PrepResource[] {
  for (const type of opportunityTypes) {
    if (PREP_RESOURCES[type]) return PREP_RESOURCES[type];
  }
  return DEFAULT_PREP_RESOURCES;
}
