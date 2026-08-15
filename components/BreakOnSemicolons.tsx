// Splits text on ';' and renders each segment on its own line — used for
// fields like `cost` or `requirements` that pack multiple clauses into
// one run-on sentence (e.g. "Gratuita para escolas públicas; R$65,00 por
// equipe em escolas privadas.").
export default function BreakOnSemicolons({ text }: { text: string }) {
  const lines = text
    .split(";")
    .map((s) => s.trim())
    .filter(Boolean);

  return (
    <>
      {lines.map((line, i) => (
        <span key={i}>
          {line}
          {i < lines.length - 1 && <br />}
        </span>
      ))}
    </>
  );
}
