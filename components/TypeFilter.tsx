"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { OPPORTUNITY_TYPES } from "@/lib/types";

export default function TypeFilter() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const selected = (searchParams.get("types") || "").split(",").filter(Boolean);

  function toggle(code: string) {
    const next = selected.includes(code)
      ? selected.filter((c) => c !== code)
      : [...selected, code];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length) {
      params.set("types", next.join(","));
    } else {
      params.delete("types");
    }
    router.push(`/resultados?${params.toString()}`);
  }

  return (
    <div className="mt-6 flex flex-wrap gap-2">
      <span className="mr-1 self-center font-mono text-xs uppercase tracking-wide text-inkMuted">
        Tipo:
      </span>
      {OPPORTUNITY_TYPES.map((t) => (
        <button
          key={t.code}
          type="button"
          onClick={() => toggle(t.code)}
          className={`rounded-full border px-4 py-2 text-sm transition-colors ${
            selected.includes(t.code)
              ? "border-ink bg-ink text-paper"
              : "border-ink/30 bg-transparent text-ink hover:border-ink"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
