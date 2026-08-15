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
}: {
  status: string;
  cycleStart?: string | null;
}) {
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
          Já passou :( Aplique no próximo ano, em {MONTHS_PT[start.getMonth()]}.
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
