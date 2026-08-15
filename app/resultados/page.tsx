import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import OpportunityCard from "@/components/OpportunityCard";
import TypeFilter from "@/components/TypeFilter";
import ShareButton from "@/components/ShareButton";
import CopyLinkButton from "@/components/CopyLinkButton";
import type { Opportunity } from "@/lib/types";
import Link from "next/link";

// Always hit Supabase fresh — this data changes from outside the app
// (manual image/cost edits), so we don't want Next.js's fetch cache
// serving a stale snapshot.
export const dynamic = "force-dynamic";

// Statuses that mean "still worth showing right now". This must cover
// every distinct status the `opportunities_with_status` view can
// produce — anything missing here gets silently hidden from every page,
// which is exactly what happened to "Verificar no site" (used for
// rolling/no-fixed-deadline opportunities like aggregator portals).
const VISIBLE_STATUSES = [
  "Aberta",
  "Fechando em breve",
  "As inscrições ainda não abriram. Previsão de abertura em",
  "Essa aplicação já encerrou para esse ano. Abrirá novamente em",
  "Verificar no site",
];

function isVisibleStatus(status: string) {
  return VISIBLE_STATUSES.some((s) => status.startsWith(s));
}

// Chronological order for the general "todas as oportunidades" browse:
// currently-open ones first (soonest-closing first), then upcoming ones
// (soonest-opening first), then anything with no clear date last.
function chronoRank(o: Opportunity): number {
  if (o.status === "Aberta" || o.status.startsWith("Fechando")) return 0;
  if (
    o.status.startsWith("As inscrições ainda não abriram") ||
    o.status.startsWith("Essa aplicação já encerrou para esse ano. Abrirá novamente")
  ) {
    return 1;
  }
  return 2;
}

function sortChronologically(results: Opportunity[]): Opportunity[] {
  return [...results].sort((a, b) => {
    const rankDiff = chronoRank(a) - chronoRank(b);
    if (rankDiff !== 0) return rankDiff;

    const rank = chronoRank(a);
    if (rank === 0) {
      // Open: whichever closes soonest comes first.
      return (a.current_cycle_end ?? "9999-99-99").localeCompare(
        b.current_cycle_end ?? "9999-99-99"
      );
    }
    if (rank === 1) {
      // Upcoming: whichever opens soonest comes first.
      return (a.current_cycle_start ?? "9999-99-99").localeCompare(
        b.current_cycle_start ?? "9999-99-99"
      );
    }
    return a.name.localeCompare(b.name);
  });
}

async function getResults(searchParams: {
  [key: string]: string | string[] | undefined;
}): Promise<Opportunity[]> {
  const audience = searchParams.audience as string | undefined;

  let query = supabase.from("opportunities_with_status").select("*");

  if (audience === "teacher") {
    const subjects = ((searchParams.subjects as string) || "")
      .split(",")
      .filter(Boolean);
    const grades = ((searchParams.grades as string) || "")
      .split(",")
      .filter(Boolean);

    query = query.contains("audience", ["teacher"]);
    if (subjects.length) query = query.overlaps("school_subject", subjects);
    if (grades.length) query = query.overlaps("grades_eligible", grades);
  }

  if (audience === "student") {
    const age = Number(searchParams.age);
    const grade = searchParams.grade as string;

    query = query.contains("audience", ["student"]);
    if (grade) query = query.overlaps("grades_eligible", [grade]);
    // Interest matching happens after the fetch (see below) instead of in
    // SQL, so "general" opportunities — ones with no specific interest
    // tags at all — are treated as relevant to everyone instead of being
    // silently excluded by an empty-array .overlaps() (which never
    // matches anything).
    if (!Number.isNaN(age)) {
      query = query.or(`min_age.is.null,min_age.lte.${age}`);
      query = query.or(`max_age.is.null,max_age.gte.${age}`);
    }
    // Not filtering by opportunity_type here on purpose — the "aluno"
    // flow no longer asks for a type preference, so show every type.
    // English-level splitting (main results vs. "once your English
    // improves") happens client-side below, in the page component.
  }

  // Opportunity-type filter applies regardless of audience — lets anyone
  // narrow down the "all opportunities" view by type too, not just the
  // personalized student/teacher flows.
  const types = ((searchParams.types as string) || "").split(",").filter(Boolean);
  if (types.length) query = query.overlaps("opportunity_type", types);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }

  let results = (data as Opportunity[]) ?? [];
  results = results.filter((o) => isVisibleStatus(o.status));

  if (audience === "student") {
    const interests = ((searchParams.interests as string) || "")
      .split(",")
      .filter(Boolean);
    if (interests.length) {
      results = results.filter(
        (o) =>
          o.student_interest_tags.length === 0 ||
          o.student_interest_tags.some((t) => interests.includes(t))
      );
    }
  }

  return results;
}

// For a teacher's results, also surface the student-facing opportunities
// for the grades they teach — the same bridge point ("what would a
// student in these grades see?") since we don't have a student's age,
// English level, or interests to filter further here.
async function getStudentOpportunitiesForTeacher(
  grades: string[]
): Promise<Opportunity[]> {
  let query = supabase
    .from("opportunities_with_status")
    .select("*")
    .contains("audience", ["student"]);

  if (grades.length) query = query.overlaps("grades_eligible", grades);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }

  return ((data as Opportunity[]) ?? []).filter((o) => isVisibleStatus(o.status));
}

export default async function ResultadosPage({
  searchParams,
}: {
  searchParams: { [key: string]: string | string[] | undefined };
}) {
  const results = await getResults(searchParams);
  const isPersonalized = Boolean(searchParams.audience);
  const audience = searchParams.audience as string | undefined;
  const studentEnglish = searchParams.english as string | undefined;

  // For students, split into what they qualify for now vs. opportunities
  // that require more English than they currently have — the latter get
  // their own "come back later" section instead of disappearing outright.
  let mainResults = results;
  let futureEnglishResults: Opportunity[] = [];

  if (audience === "student" && studentEnglish) {
    mainResults = results.filter((o) => o.english_level.includes(studentEnglish));
    if (studentEnglish === "not_required") {
      futureEnglishResults = results.filter(
        (o) => !o.english_level.includes("not_required")
      );
    }
  }

  let studentOpportunitiesForTeacher: Opportunity[] = [];
  if (audience === "teacher") {
    const grades = ((searchParams.grades as string) || "").split(",").filter(Boolean);
    studentOpportunitiesForTeacher = await getStudentOpportunitiesForTeacher(grades);
  }

  // The general, unpersonalized "todas as oportunidades" browse is sorted
  // chronologically — open-and-closing-soonest first, then upcoming ones
  // ordered by when they open next.
  if (!isPersonalized) {
    mainResults = sortChronologically(mainResults);
  }

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkMuted">
            {mainResults.length} oportunidade{mainResults.length === 1 ? "" : "s"}{" "}
            encontrada{mainResults.length === 1 ? "" : "s"}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {isPersonalized ? "Oportunidades perfeitas pra você:" : "Todas as oportunidades abertas"}
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3 sm:gap-4">
          {isPersonalized && (
            <>
              <ShareButton title="Oportunidades feitas para você" />
              <CopyLinkButton />
            </>
          )}
          <Link
            href="/"
            className="font-mono text-xs uppercase tracking-wide text-stamp hover:underline"
          >
            ← {isPersonalized ? "Recomeçar" : "Início"}
          </Link>
        </div>
      </div>

      {/* Type filter only makes sense on the general, unpersonalized
          "todas as oportunidades" browse — the personalized flows already
          asked for specific preferences. */}
      {!isPersonalized && (
        <Suspense fallback={null}>
          <TypeFilter />
        </Suspense>
      )}

      {mainResults.length === 0 ? (
        <div className="opportunity-card mt-10 p-10 text-center">
          <p className="font-display text-xl text-ink">
            Nada por aqui ainda — mas sua oportunidade ideal está por vir.
          </p>
          <p className="mt-2 text-sm text-inkMuted">
            Tente ajustar suas respostas, com menos filtros selecionados.
            Grandes conquistas às vezes exigem um pouco de busca.
          </p>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {mainResults.map((opp) => (
            <OpportunityCard key={opp.id} opp={opp} />
          ))}
        </div>
      )}

      {isPersonalized && (
        <div className="mt-10 text-center">
          <Link
            href="/resultados"
            className="inline-block rounded-full border border-ink/20 px-6 py-3 font-mono text-sm uppercase tracking-wide text-ink transition-colors hover:border-ink"
          >
            Ver todas as oportunidades →
          </Link>
        </div>
      )}

      {futureEnglishResults.length > 0 && (
        <section className="mt-16 border-t border-ink/15 pt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Continue evoluindo no inglês — assim que você chegar lá, essas
            oportunidades incríveis também serão suas:
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {futureEnglishResults.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        </section>
      )}

      {studentOpportunitiesForTeacher.length > 0 && (
        <section className="mt-16 border-t border-ink/15 pt-10">
          <h2 className="font-display text-xl font-semibold text-ink">
            Outras oportunidades incríveis que seus alunos merecem conhecer
          </h2>
          <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {studentOpportunitiesForTeacher.map((opp) => (
              <OpportunityCard key={opp.id} opp={opp} />
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
