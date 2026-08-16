"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { OPPORTUNITY_TYPES } from "@/lib/types";

const REGIONS = [
  { code: "national", label: "Nacionais", emoji: "🇧🇷" },
  { code: "international", label: "Internacionais", emoji: "🌐" },
];

const WHEN_OPTIONS = [
  { code: "open", label: "Aberta agora" },
  { code: "soon", label: "Abre este ano" },
  { code: "next_year", label: "Abre ano que vem" },
];

function FilterGroup({
  title,
  items,
  selected,
  onToggle,
}: {
  title: string;
  items: { code: string; label: string; emoji?: string }[];
  selected: string[];
  onToggle: (code: string) => void;
}) {
  return (
    <div>
      <h2 className="mb-3 font-mono text-xs uppercase tracking-[0.15em] text-inkMuted">
        {title}
      </h2>
      <div className="flex flex-col gap-2">
        {items.map((item) => (
          <button
            key={item.code}
            type="button"
            onClick={() => onToggle(item.code)}
            className={`rounded-full border px-4 py-2.5 text-left text-sm transition-colors ${
              selected.includes(item.code)
                ? "border-ink bg-ink text-paper"
                : "border-ink/25 bg-transparent text-ink hover:border-ink"
            }`}
          >
            {item.emoji && (
              <span aria-hidden="true" className="mr-2">
                {item.emoji}
              </span>
            )}
            {item.label}
          </button>
        ))}
      </div>
    </div>
  );
}

// A vertical sidebar of filter chips — opportunity type, plus national vs.
// international scope. Each group writes its own URL param (types /
// region), toggled independently, preserving whatever else is already in
// the query string (personalization params, other filter group, etc.).
export default function FiltersSidebar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [mobileOpen, setMobileOpen] = useState(false);
  const selectedTypes = (searchParams.get("types") || "").split(",").filter(Boolean);
  const selectedRegions = (searchParams.get("region") || "").split(",").filter(Boolean);
  const selectedWhens = (searchParams.get("when") || "").split(",").filter(Boolean);
  const activeCount = selectedTypes.length + selectedRegions.length + selectedWhens.length;

  function toggle(key: string, code: string, current: string[]) {
    const next = current.includes(code)
      ? current.filter((c) => c !== code)
      : [...current, code];

    const params = new URLSearchParams(searchParams.toString());
    if (next.length) {
      params.set(key, next.join(","));
    } else {
      params.delete(key);
    }
    router.push(`/resultados?${params.toString()}`);
  }

  return (
    <aside className="w-full shrink-0 lg:sticky lg:top-8 lg:w-56">
      {/* Mobile-only toggle — the groups below stay hidden until this is
          tapped. Irrelevant at lg and up, where the sidebar is always
          visible, so the button itself is hidden there. */}
      <button
        type="button"
        onClick={() => setMobileOpen((open) => !open)}
        className="mb-4 flex w-full items-center justify-between rounded-full border border-ink/25 px-5 py-3 text-sm font-semibold text-ink lg:hidden"
      >
        <span>
          Filtrar oportunidades
          {activeCount > 0 && (
            <span className="ml-2 rounded-full bg-ink px-2 py-0.5 text-xs text-paper">
              {activeCount}
            </span>
          )}
        </span>
        <span aria-hidden="true">{mobileOpen ? "▲" : "▼"}</span>
      </button>

      <div
        className={`${mobileOpen ? "flex" : "hidden"} flex-col gap-8 lg:flex`}
      >
        <FilterGroup
          title="Tipo"
          items={OPPORTUNITY_TYPES}
          selected={selectedTypes}
          onToggle={(code) => toggle("types", code, selectedTypes)}
        />
        <FilterGroup
          title="Alcance"
          items={REGIONS}
          selected={selectedRegions}
          onToggle={(code) => toggle("region", code, selectedRegions)}
        />
        <FilterGroup
          title="Quando"
          items={WHEN_OPTIONS}
          selected={selectedWhens}
          onToggle={(code) => toggle("when", code, selectedWhens)}
        />
      </div>
    </aside>
  );
}
