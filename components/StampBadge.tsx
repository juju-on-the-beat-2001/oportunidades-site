const MONTHS_PT = [
  "janeiro", "fevereiro", "março", "abril", "maio", "junho",
  "julho", "agosto", "setembro", "outubro", "novembro", "dezembro",
];

// The two "not open yet" status variants the view produces — both mean
// "registration hasn't started, here's when it will".
function isNotYetOpenStatus(status: string): boolean {
  return status.startsWith("As inscrições ainda não abriram") || isClosedForThisYear(status);
}

// "Already missed this year's window, reopens next year" specifically —
// gets its own friendlier copy instead of the view's default phrasing.
function isClosedForThisYear(status: string): boolean {
  return status.startsWith("Essa aplicação já encerrou para esse ano. Abrirá novamente");
}

function badgeClass(status: string): string {
  if (status.startsWith("Fechando")) return "glow-badge glow-urgent";
  if (status === "Aberta") return "glow-badge glow-open";
  if (status.startsWith("Verificar")) return "glow-badge glow-closed";
  return "glow-badge glow-soon"; // "Em breve...", not-yet-open, closed-reopens-next-year
}

export default function StampBadge({
  status,
  cycleStart,
  eligibilityYearsToGo,
}: {
  status: string;
  cycleStart?: string | null;
  // Takes priority over everything else below — set when the opportunity
  // itself is open, but the viewing student isn't old enough/right grade
  // yet, and says how many cycles away they are from being eligible.
  eligibilityYearsToGo?: number | null;
}) {
  if (eligibilityYearsToGo && eligibilityYearsToGo > 0) {
    const monthLabel = cycleStart
      ? MONTHS_PT[new Date(`${cycleStart}T00:00:00`).getMonth()]
      : null;

    // One cycle away: same wording and color as "closed this year, opens
    // again next year" — from the student's point of view it's the same
    // situation, just for a different reason.
    if (eligibilityYearsToGo === 1) {
      return (
        <span className="glow-badge glow-soon">
          <span className="glow-dot" />
          {monthLabel
            ? `Prepare-se para aplicar em ${monthLabel} do ano que vem`
            : "Prepare-se para aplicar no ano que vem"}
        </span>
      );
    }

    // Two cycles (or more) away: further out, so it gets the more urgent
    // yellow instead of blue.
    const when = eligibilityYearsToGo === 2 ? "em 2 anos" : `em ${eligibilityYearsToGo} anos`;
    return (
      <span className="glow-badge glow-urgent">
        <span className="glow-dot" />
        Você terá a idade para participar {when}. Se prepare agora!
      </span>
    );
  }

  // If the next application window opens later this same year, that's
  // more time-sensitive than "opens sometime next year" — call it out
  // in yellow with the specific month instead of the muted blue default.
  if (isNotYetOpenStatus(status) && cycleStart) {
    const start = new Date(`${cycleStart}T00:00:00`);

    if (start.getFullYear() === new Date().getFullYear()) {
      return (
        <span className="glow-badge glow-urgent">
          <span className="glow-dot" />
          Registração abre em {MONTHS_PT[start.getMonth()]}
        </span>
      );
    }

    if (isClosedForThisYear(status)) {
      return (
        <span className="glow-badge glow-soon">
          <span className="glow-dot" />
          Prepare-se para aplicar em {MONTHS_PT[start.getMonth()]} do ano que vem
        </span>
      );
    }
  }

  return (
    <span className={badgeClass(status)}>
      <span className="glow-dot" />
      {status}
    </span>
  );
}
