import { Suspense } from "react";
import { supabase } from "@/lib/supabase";
import OpportunityCard from "@/components/OpportunityCard";
import FiltersSidebar from "@/components/FiltersSidebar";
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

// "Nacionais" vs. "Internacionais" filter: national means no English is
// required to participate — not a geography check. Anything that requires
// some level of English (intermediate/fluent only, no "not_required" in
// its accepted levels) counts as international.
function isNational(o: Opportunity): boolean {
  return o.english_level.includes("not_required");
}

// "Quando" filter: buckets an opportunity into one of three windows.
// "Verificar no site" (rolling, no fixed date) and anything with no
// current_cycle_start don't fit any bucket and are excluded whenever this
// filter is active — same as any other filter, nothing shows without a
// clear match.
function openingBucket(o: Opportunity): "open" | "soon" | "next_year" | null {
  if (o.status === "Aberta" || o.status.startsWith("Fechando")) return "open";

  const isUpcoming =
    o.status.startsWith("As inscrições ainda não abriram") ||
    o.status.startsWith("Essa aplicação já encerrou para esse ano. Abrirá novamente");
  if (!isUpcoming || !o.current_cycle_start) return null;

  const cycleYear = new Date(`${o.current_cycle_start}T00:00:00`).getFullYear();
  return cycleYear > new Date().getFullYear() ? "next_year" : "soon";
}

// Grade codes are literally "grade_N" with N already in progression
// order (8, 9, 10, 11, 12), so the trailing number doubles as a rank.
function gradeRank(code: string): number | null {
  const m = /^grade_(\d+)$/.exec(code);
  return m ? parseInt(m[1], 10) : null;
}

// grade_12 (3º ano do Ensino Médio) is the last grade in the system — a
// student there will graduate at the end of this school year. Unlike a
// younger student, they won't grow into an opportunity whose next cycle
// only opens in a future calendar year, so it isn't a "prepare-se, você
// já terá idade" candidate — it's simply not relevant to them anymore.
const TERMINAL_GRADE = "grade_12";

function opensInFutureYear(cycleStart: string | null): boolean {
  if (!cycleStart) return false;
  const cycleYear = new Date(`${cycleStart}T00:00:00`).getFullYear();
  return cycleYear > new Date().getFullYear();
}

// A student's reported age is "as of today" — but if an opportunity's
// next cycle only opens next year (or later), the student will have had
// a birthday by then. Project forward by that many calendar years before
// comparing against max_age, so we don't show something they'll have
// already aged out of by the time it actually opens.
function projectedAgeAtNextCycle(age: number, cycleStart: string | null): number {
  if (!cycleStart) return age;
  const cycleYear = new Date(`${cycleStart}T00:00:00`).getFullYear();
  const yearsUntil = Math.max(0, cycleYear - new Date().getFullYear());
  return age + yearsUntil;
}

// A student too young — by age OR by grade — for an opportunity still
// sees the card (they'll grow into it), just with an eligibility badge
// instead of the normal open/closed status, saying how many application
// cycles away they are. Being too OLD (past max_age, or past every grade
// the opportunity accepts) is permanent and is excluded earlier, before
// this ever runs.
function eligibilityYearsToGo(
  studentAge: number | null,
  studentGrade: string | null,
  opp: Opportunity
): number | null {
  let yearsToGo = 0;

  if (studentAge != null && opp.min_age != null && studentAge < opp.min_age) {
    yearsToGo = Math.max(yearsToGo, opp.min_age - studentAge);
  }

  if (studentGrade && opp.grades_eligible.length > 0) {
    const studentRank = gradeRank(studentGrade);
    const requiredRanks = opp.grades_eligible
      .map(gradeRank)
      .filter((r): r is number => r != null);
    if (studentRank != null && requiredRanks.length > 0) {
      const minRequired = Math.min(...requiredRanks);
      if (studentRank < minRequired) {
        yearsToGo = Math.max(yearsToGo, minRequired - studentRank);
      }
    }
  }

  return yearsToGo > 0 ? yearsToGo : null;
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

function compareChronologically(a: Opportunity, b: Opportunity): number {
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
}

function sortChronologically(results: Opportunity[]): Opportunity[] {
  return [...results].sort(compareChronologically);
}

// Personalized student ordering: opportunities they're eligible for right
// now come first, then ones they'll be eligible for next cycle, then ones
// two cycles out, and so on — ties within the same eligibility distance
// fall back to the normal chronological order.
function sortForStudent(
  results: Opportunity[],
  studentAge: number | null,
  studentGrade: string | null
): Opportunity[] {
  return [...results].sort((a, b) => {
    const aYears = eligibilityYearsToGo(studentAge, studentGrade, a) ?? 0;
    const bYears = eligibilityYearsToGo(studentAge, studentGrade, b) ?? 0;
    if (aYears !== bYears) return aYears - bYears;
    return compareChronologically(a, b);
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

    query = query.contains("audience", ["teacher"]);
    if (subjects.length) query = query.overlaps("school_subject", subjects);
    // Grade matching happens after the fetch (see below), same reasoning
    // as interests below — an empty grades_eligible means "open to any
    // grade" and must not be excluded by .overlaps() on an empty array.
  }

  if (audience === "student") {
    query = query.contains("audience", ["student"]);
    // Grade and interest matching happen after the fetch (see below)
    // instead of in SQL, so "general" opportunities — ones with no
    // specific grade/interest tags at all — are treated as relevant to
    // everyone instead of being silently excluded by an empty-array
    // .overlaps() (which never matches anything).
    // max_age isn't filtered in SQL — it needs to account for the
    // opportunity's next cycle date (see projectedAgeAtNextCycle below),
    // which requires per-row data only available after the fetch.
    // min_age is deliberately NOT filtered in SQL either. A student who
    // isn't old enough yet still sees the opportunity, just with an
    // "aplique em X anos" badge instead of the normal status (see below).
    // Not filtering by opportunity_type here on purpose — the "aluno"
    // flow no longer asks for a type preference, so show every type.
    // English-level splitting (main results vs. "once your English
    // improves") happens client-side below, in the page component.
  }

  // Opportunity-type filter applies regardless of audience — lets anyone
  // narrow down the results by type, not just the personalized flows.
  const types = ((searchParams.types as string) || "").split(",").filter(Boolean);
  if (types.length) query = query.overlaps("opportunity_type", types);

  const { data, error } = await query;
  if (error) {
    console.error(error);
    return [];
  }

  let results = (data as Opportunity[]) ?? [];
  results = results.filter((o) => isVisibleStatus(o.status));

  // Region filter ("Nacionais" / "Internacionais") — a computed split on
  // country_region, so it's applied here rather than in SQL. Selecting
  // both (or neither) is a no-op.
  const regions = ((searchParams.region as string) || "").split(",").filter(Boolean);
  if (regions.length === 1) {
    const wantNational = regions[0] === "national";
    results = results.filter((o) => isNational(o) === wantNational);
  }

  // "Quando" filter (aberta / abre este ano / abre ano que vem).
  const whens = ((searchParams.when as string) || "").split(",").filter(Boolean);
  if (whens.length) {
    results = results.filter((o) => {
      const bucket = openingBucket(o);
      return bucket != null && whens.includes(bucket);
    });
  }

  if (audience === "teacher") {
    const grades = ((searchParams.grades as string) || "").split(",").filter(Boolean);
    if (grades.length) {
      results = results.filter(
        (o) =>
          o.grades_eligible.length === 0 ||
          o.grades_eligible.some((g) => grades.includes(g))
      );
    }
  }

  if (audience === "student") {
    const age = Number(searchParams.age);
    if (!Number.isNaN(age)) {
      results = results.filter((o) => {
        if (o.max_age == null) return true;
        return projectedAgeAtNextCycle(age, o.current_cycle_start) <= o.max_age;
      });
    }

    const grade = searchParams.grade as string | undefined;
    const studentRank = grade ? gradeRank(grade) : null;
    if (studentRank != null) {
      results = results.filter((o) => {
        if (o.grades_eligible.length === 0) return true;
        const requiredRanks = o.grades_eligible
          .map(gradeRank)
          .filter((r): r is number => r != null);
        if (requiredRanks.length === 0) return true;
        // Exclude only if the student has already aged past every grade
        // this opportunity accepts — too young still shows (with an
        // "aplique em X anos" badge below), too advanced does not.
        return studentRank <= Math.max(...requiredRanks);
      });
    }

    // A 3º ano EM student graduates at the end of this school year — any
    // opportunity whose next cycle only opens next year (or later) is one
    // they'll never actually get to apply to, so it's excluded outright
    // rather than shown with a "you'll be eligible" style badge.
    if (grade === TERMINAL_GRADE) {
      results = results.filter((o) => !opensInFutureYear(o.current_cycle_start));
    }

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
  const { data, error } = await supabase
    .from("opportunities_with_status")
    .select("*")
    .contains("audience", ["student"]);

  if (error) {
    console.error(error);
    return [];
  }

  let results = ((data as Opportunity[]) ?? []).filter((o) => isVisibleStatus(o.status));

  // Empty grades_eligible means "open to any grade" — treat it that way
  // instead of excluding it via .overlaps() on an empty array.
  if (grades.length) {
    results = results.filter(
      (o) => o.grades_eligible.length === 0 || o.grades_eligible.some((g) => grades.includes(g))
    );
  }

  return results;
}

// Most Brazilian academic olympiads are registered by a teacher on
// behalf of a classroom (audience: ["teacher"], not ["student"]) — so a
// student's personalized query never surfaces them. This pulls them in
// separately for a dedicated "talk to your teacher" section, filtered
// the same soft way as the main results (too-young still shows, with an
// eligibility badge; too-old/mismatched interest is excluded).
async function getOlympiadsForStudent(
  grade: string | null,
  interests: string[],
  age: number | null
): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities_with_status")
    .select("*")
    .overlaps("opportunity_type", ["academic_olympiad"])
    .contains("audience", ["teacher"]);

  if (error) {
    console.error(error);
    return [];
  }

  let results = ((data as Opportunity[]) ?? []).filter((o) => isVisibleStatus(o.status));

  if (age != null) {
    results = results.filter((o) => {
      if (o.max_age == null) return true;
      return projectedAgeAtNextCycle(age, o.current_cycle_start) <= o.max_age;
    });
  }

  const studentRank = grade ? gradeRank(grade) : null;
  if (studentRank != null) {
    results = results.filter((o) => {
      if (o.grades_eligible.length === 0) return true;
      const requiredRanks = o.grades_eligible
        .map(gradeRank)
        .filter((r): r is number => r != null);
      if (requiredRanks.length === 0) return true;
      return studentRank <= Math.max(...requiredRanks);
    });
  }

  if (grade === TERMINAL_GRADE) {
    results = results.filter((o) => !opensInFutureYear(o.current_cycle_start));
  }

  if (interests.length) {
    results = results.filter(
      (o) =>
        o.student_interest_tags.length === 0 ||
        o.student_interest_tags.some((t) => interests.includes(t))
    );
  }

  return results;
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
  const studentAge = Number(searchParams.age);
  const studentGrade = (searchParams.grade as string | undefined) ?? null;
  const normalizedAge = Number.isNaN(studentAge) ? null : studentAge;

  // For students, split into what they qualify for now vs. opportunities
  // that require more English than they currently have — the latter get
  // their own "come back later" section instead of disappearing outright.
  let mainResults = results;
  let futureEnglishResults: Opportunity[] = [];

  if (audience === "student" && studentEnglish) {
    // "not_required" opportunities are open to everyone regardless of
    // level — an intermediate/fluent student should still see them, not
    // just students who selected "not_required" themselves.
    mainResults = results.filter(
      (o) => o.english_level.includes(studentEnglish) || o.english_level.includes("not_required")
    );
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

  const studentInterests = ((searchParams.interests as string) || "")
    .split(",")
    .filter(Boolean);

  let olympiadsForStudent: Opportunity[] = [];
  if (audience === "student") {
    olympiadsForStudent = await getOlympiadsForStudent(
      studentGrade,
      studentInterests,
      Number.isNaN(studentAge) ? null : studentAge
    );
  }

  // Only students who picked ciência e tecnologia as their SOLE interest
  // get the olympiad section bumped to the very top, ahead of the main
  // grid — everyone else (including science_tech + other interests) sees
  // it lower, after the main results.
  const olympiadsFirst =
    studentInterests.length === 1 && studentInterests[0] === "science_tech";

  // The general, unpersonalized "todas as oportunidades" browse is sorted
  // chronologically — open-and-closing-soonest first, then upcoming ones
  // ordered by when they open next. The personalized student view instead
  // leads with what they're eligible for right now, then next cycle, then
  // the cycle after that.
  if (!isPersonalized) {
    mainResults = sortChronologically(mainResults);
  } else if (audience === "student") {
    mainResults = sortForStudent(mainResults, normalizedAge, studentGrade);
    futureEnglishResults = sortForStudent(futureEnglishResults, normalizedAge, studentGrade);
    olympiadsForStudent = sortForStudent(olympiadsForStudent, normalizedAge, studentGrade);

    // Students who only have intermediate English see opportunities that
    // don't require any English at all bubbled to the front — stable sort,
    // so it layers on top of the eligibility/chronological order above
    // instead of replacing it.
    if (studentEnglish === "intermediate") {
      mainResults = [...mainResults].sort(
        (a, b) => Number(!isNational(a)) - Number(!isNational(b))
      );
    }
  }

  const olympiadsSection = olympiadsForStudent.length > 0 && (
    <section className="mt-16 border-t border-ink/15 pt-10 first:mt-10 first:border-t-0 first:pt-0">
      <h2 className="font-display text-xl font-semibold text-ink">
        Fale com seu professor e participe:
      </h2>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {olympiadsForStudent.map((opp) => (
          <OpportunityCard
            key={opp.id}
            opp={opp}
            eligibilityYearsToGo={eligibilityYearsToGo(normalizedAge, studentGrade, opp)}
          />
        ))}
      </div>
    </section>
  );

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-16">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkMuted">
            {mainResults.length} oportunidade{mainResults.length === 1 ? "" : "s"}{" "}
            encontrada{mainResults.length === 1 ? "" : "s"}
          </p>
          <h1 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
            {isPersonalized
              ? audience === "teacher"
                ? "Oportunidades incríveis para trazer aos seus alunos:"
                : "Oportunidades perfeitas pra você:"
              : "Todas as oportunidades"}
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

      <div className="mt-8 flex flex-col gap-10 lg:flex-row lg:items-start lg:gap-12">
        <Suspense fallback={null}>
          <FiltersSidebar />
        </Suspense>

        <div className="min-w-0 flex-1">
          {olympiadsFirst && olympiadsSection}

          {olympiadsFirst && (
            <h2 className="mt-16 border-t border-ink/15 pt-10 font-display text-xl font-semibold text-ink">
              E aqui outras oportunidades que você pode participar de forma
              independente
            </h2>
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
            <div className="mt-10 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {mainResults.map((opp) => (
                <OpportunityCard
                  key={opp.id}
                  opp={opp}
                  eligibilityYearsToGo={
                    audience === "student"
                      ? eligibilityYearsToGo(normalizedAge, studentGrade, opp)
                      : null
                  }
                />
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

          {!olympiadsFirst && olympiadsSection}

          {futureEnglishResults.length > 0 && (
            <section className="mt-16 border-t border-ink/15 pt-10">
              <h2 className="font-display text-xl font-semibold text-ink">
                Continue evoluindo no inglês — assim que você chegar lá, essas
                oportunidades incríveis também serão suas:
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {futureEnglishResults.map((opp) => (
                  <OpportunityCard
                    key={opp.id}
                    opp={opp}
                    eligibilityYearsToGo={eligibilityYearsToGo(normalizedAge, studentGrade, opp)}
                  />
                ))}
              </div>
            </section>
          )}

          {studentOpportunitiesForTeacher.length > 0 && (
            <section className="mt-16 border-t border-ink/15 pt-10">
              <h2 className="font-display text-xl font-semibold text-ink">
                Outras oportunidades incríveis que seus alunos merecem conhecer
              </h2>
              <div className="mt-6 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                {studentOpportunitiesForTeacher.map((opp) => (
                  <OpportunityCard key={opp.id} opp={opp} />
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </main>
  );
}
