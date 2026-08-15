export type Opportunity = {
  id: string;
  name: string;
  audience: string[];
  opportunity_type: string[];
  school_subject: string[];
  url: string | null;
  english_level: string[];
  school_type: string | null;
  grades_eligible: string[];
  participation_type: string[];
  description: string | null;
  min_age: number | null;
  max_age: number | null;
  prize: string | null;
  cost: string | null;
  country_region: string | null;
  requirements: string | null;
  student_interest_tags: string[];
  image_url: string | null;
  image_storage_path: string | null;
  // From the opportunities_with_status view:
  current_cycle_start: string | null;
  current_cycle_end: string | null;
  is_estimated_cycle: boolean;
  status: string;
};

// Grades in display order — used by both onboarding flows.
export const GRADES = [
  { code: "grade_6", label: "6º Ano" },
  { code: "grade_7", label: "7º Ano" },
  { code: "grade_8", label: "8º Ano" },
  { code: "grade_9", label: "9º Ano" },
  { code: "grade_10", label: "1º Ano" },
  { code: "grade_11", label: "2º Ano" },
  { code: "grade_12", label: "3º Ano" },
];

// GRADES split into Ensino Fundamental / Ensino Médio — used to render
// the grade picker as two labeled groups instead of one flat row.
export const GRADE_GROUPS = [
  {
    label: "Ensino Fundamental",
    grades: GRADES.filter((g) => ["grade_6", "grade_7", "grade_8", "grade_9"].includes(g.code)),
  },
  {
    label: "Ensino Médio",
    grades: GRADES.filter((g) => ["grade_10", "grade_11", "grade_12"].includes(g.code)),
  },
];

export const SUBJECTS = [
  { code: "biology_science", label: "Biologia/Ciências", icon: "🔬" },
  { code: "chemistry", label: "Química", icon: "⚗️" },
  { code: "math", label: "Matemática", icon: "📐" },
  { code: "cs_programming_robotics", label: "Computação, Programação e Robótica", icon: "🤖" },
  { code: "history", label: "História", icon: "🏛️" },
  { code: "geography", label: "Geografia", icon: "🌍" },
  { code: "philosophy_sociology", label: "Filosofia e Sociologia", icon: "🧠" },
  { code: "portuguese_lang_lit", label: "Língua Portuguesa e Literatura", icon: "📚" },
  { code: "english", label: "Inglês", icon: "🗣️" },
  { code: "arts", label: "Artes", icon: "🎨" },
];

export const ENGLISH_LEVELS = [
  { code: "not_required", label: "Iniciante", rank: 0, icon: "🌱" },
  { code: "intermediate", label: "Intermediário", rank: 1, icon: "💬" },
  { code: "fluent", label: "Fluente", rank: 2, icon: "🌟" },
];

export const INTERESTS = [
  { code: "science_tech", label: "Ciência e Tecnologia", icon: "🔬" },
  { code: "business_entrepreneurship", label: "Negócios e Empreendedorismo", icon: "💼" },
  { code: "environment_sustainability", label: "Meio Ambiente e Sustentabilidade", icon: "🌱" },
  { code: "politics_intl_relations", label: "Política e Relações Internacionais", icon: "🌐" },
  { code: "humanities", label: "Humanidades", icon: "📖" },
  { code: "social_impact_activism", label: "Impacto Social e Ativismo", icon: "🤝" },
  { code: "communication_media", label: "Escrita e Comunicação", icon: "📣" },
  { code: "arts_creativity", label: "Artes e Criatividade", icon: "🎨" },
];

// Labels for the `participation_type` codes stored on each opportunity —
// shown on the opportunity detail page. Falls back to the raw code for
// anything not listed here (defensive: better an ugly label than a
// missing one).
export const PARTICIPATION_TYPES: Record<string, string> = {
  individual_student: "Individual (aluno)",
  student_team: "Equipe de alunos",
  teacher_lead: "Professor líder do projeto",
  whole_class: "Turma inteira",
  whole_school: "Escola inteira",
};

export function getParticipationTypeLabel(code: string): string {
  return PARTICIPATION_TYPES[code] ?? code;
}

export const OPPORTUNITY_TYPES = [
  { code: "competition_contest", label: "Competição e concurso" },
  { code: "academic_olympiad", label: "Olimpíada do conhecimento" },
  { code: "exchange_program", label: "Intercâmbio" },
  { code: "scholarship", label: "Bolsa de estudo" },
  { code: "summer_program", label: "Programa de verão" },
  { code: "social_impact", label: "Impacto social" },
];
