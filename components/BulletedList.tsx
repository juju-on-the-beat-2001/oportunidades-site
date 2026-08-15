// Splits text on ';' and renders each clause as its own bullet point —
// used for fields like `prize`, `cost`, and `requirements` that pack
// several distinct items into one sentence. Each clause's first letter
// is capitalized, since splitting mid-sentence often leaves a lowercase
// start (e.g. "...; medalhistas têm acesso..." -> "Medalhistas têm acesso...").
function capitalizeFirst(text: string): string {
  if (!text) return text;
  return text.charAt(0).toUpperCase() + text.slice(1);
}

export default function BulletedList({ text }: { text: string }) {
  const items = text
    .split(";")
    .map((s) => capitalizeFirst(s.trim()))
    .filter(Boolean);

  return (
    <ul className="list-disc space-y-1 pl-5 marker:text-stamp">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}
