"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { SUBJECTS, GRADE_GROUPS } from "@/lib/types";
import IconCard from "@/components/IconCard";

function Chip({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border px-6 py-4 text-xl transition-colors ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/30 bg-transparent text-ink hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}

export default function ProfessorFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [subjects, setSubjects] = useState<string[]>([]);
  const [grades, setGrades] = useState<string[]>([]);

  function toggle(list: string[], setList: (v: string[]) => void, code: string) {
    setList(
      list.includes(code) ? list.filter((c) => c !== code) : [...list, code]
    );
  }

  function seeResults() {
    const params = new URLSearchParams();
    params.set("audience", "teacher");
    params.set("subjects", subjects.join(","));
    params.set("grades", grades.join(","));
    router.push(`/resultados?${params.toString()}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-16 pt-24 sm:pt-32">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-inkMuted">
        Passo {step} de 2
      </p>

      {step === 1 && (
        <>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Quais matérias você ensina?
          </h1>
          <p className="mt-3 text-base text-inkMuted">
            Selecione quantas quiser — vamos te ajudar a encontrar
            oportunidades incríveis para seus alunos.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {SUBJECTS.map((s) => (
              <IconCard
                key={s.code}
                icon={s.icon}
                label={s.label}
                active={subjects.includes(s.code)}
                onClick={() => toggle(subjects, setSubjects, s.code)}
              />
            ))}
          </div>
          <button
            type="button"
            disabled={subjects.length === 0}
            onClick={() => setStep(2)}
            className="mt-10 self-start rounded-sm bg-ink px-6 py-3 font-mono text-sm uppercase tracking-wide text-paper disabled:opacity-30"
          >
            Continuar →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Quais séries você ensina?
          </h1>
          <p className="mt-3 text-base text-inkMuted">Selecione quantas quiser.</p>
          <div className="mt-6 space-y-6">
            {GRADE_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="font-mono text-xs uppercase tracking-wide text-inkMuted">
                  {group.label}
                </p>
                <div className="mt-3 flex flex-wrap gap-3">
                  {group.grades.map((g) => (
                    <Chip
                      key={g.code}
                      label={g.label}
                      active={grades.includes(g.code)}
                      onClick={() => toggle(grades, setGrades, g.code)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="rounded-sm border border-ink/30 px-6 py-3 font-mono text-sm uppercase tracking-wide text-ink"
            >
              ← Voltar
            </button>
            <button
              type="button"
              disabled={grades.length === 0}
              onClick={seeResults}
              className="rounded-sm bg-stamp px-6 py-3 font-mono text-sm uppercase tracking-wide text-paper disabled:opacity-30"
            >
              Ver oportunidades para meus alunos →
            </button>
          </div>
        </>
      )}
    </main>
  );
}
