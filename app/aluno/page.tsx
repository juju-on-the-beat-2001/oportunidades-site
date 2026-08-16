"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { GRADE_GROUPS, ENGLISH_LEVELS, INTERESTS } from "@/lib/types";
import IconCard from "@/components/IconCard";

function Chip({
  label,
  active,
  onClick,
  size = "md",
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  size?: "md" | "lg";
}) {
  const sizeClasses = size === "lg" ? "px-6 py-4 text-xl" : "px-4 py-2 text-sm";
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full border transition-colors ${sizeClasses} ${
        active
          ? "border-ink bg-ink text-paper"
          : "border-ink/30 bg-transparent text-ink hover:border-ink"
      }`}
    >
      {label}
    </button>
  );
}

const AGES = Array.from({ length: 6 }, (_, i) => 14 + i); // 14–19

export default function AlunoFlow() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [age, setAge] = useState<number | null>(null);
  const [grade, setGrade] = useState<string | null>(null);
  const [english, setEnglish] = useState<string | null>(null);
  const [interests, setInterests] = useState<string[]>([]);

  function toggle(list: string[], setList: (v: string[]) => void, code: string) {
    setList(
      list.includes(code) ? list.filter((c) => c !== code) : [...list, code]
    );
  }

  const totalSteps = 4;

  function seeResults() {
    const params = new URLSearchParams();
    params.set("audience", "student");
    params.set("age", String(age));
    params.set("grade", grade ?? "");
    params.set("english", english ?? "");
    params.set("interests", interests.join(","));
    router.push(`/resultados?${params.toString()}`);
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col px-6 pb-16 pt-24 sm:pt-32">
      <p className="font-mono text-sm uppercase tracking-[0.2em] text-inkMuted">
        Passo {step} de {totalSteps}
      </p>

      {step === 1 && (
        <>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Quantos anos você tem?
          </h1>
          <div className="mt-6 flex flex-wrap gap-3">
            {AGES.map((a) => (
              <Chip
                key={a}
                label={String(a)}
                active={age === a}
                onClick={() => setAge(a)}
                size="lg"
              />
            ))}
          </div>
          <button
            type="button"
            disabled={age === null}
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
            Qual é a sua série?
          </h1>
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
                      active={grade === g.code}
                      onClick={() => setGrade(g.code)}
                      size="lg"
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="mt-10 flex gap-3">
            <BackButton onClick={() => setStep(1)} />
            <button
              type="button"
              disabled={grade === null}
              onClick={() => setStep(3)}
              className="rounded-sm bg-ink px-6 py-3 font-mono text-sm uppercase tracking-wide text-paper disabled:opacity-30"
            >
              Continuar →
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Como está o seu inglês?
          </h1>
          <div className="mt-6 grid grid-cols-3 gap-3">
            {ENGLISH_LEVELS.map((e) => (
              <IconCard
                key={e.code}
                icon={e.icon}
                label={e.label}
                active={english === e.code}
                onClick={() => setEnglish(e.code)}
              />
            ))}
          </div>
          <div className="mt-10 flex gap-3">
            <BackButton onClick={() => setStep(2)} />
            <button
              type="button"
              disabled={english === null}
              onClick={() => setStep(4)}
              className="rounded-sm bg-ink px-6 py-3 font-mono text-sm uppercase tracking-wide text-paper disabled:opacity-30"
            >
              Continuar →
            </button>
          </div>
        </>
      )}

      {step === 4 && (
        <>
          <h1 className="mt-3 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Me conta tudo que você gosta
          </h1>
          <p className="mt-3 text-base text-inkMuted">
            Selecione quantos quiser — quanto mais você compartilhar, mais
            certeiras ficam as recomendações.
          </p>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            {INTERESTS.map((i) => (
              <IconCard
                key={i.code}
                icon={i.icon}
                label={i.label}
                active={interests.includes(i.code)}
                onClick={() => toggle(interests, setInterests, i.code)}
              />
            ))}
          </div>
          <div className="mt-10 flex gap-3">
            <BackButton onClick={() => setStep(3)} />
            <button
              type="button"
              disabled={interests.length === 0}
              onClick={seeResults}
              className="rounded-sm bg-stamp px-6 py-3 font-mono text-sm uppercase tracking-wide text-paper disabled:opacity-30"
            >
              Descobrir minhas oportunidades →
            </button>
          </div>
        </>
      )}
    </main>
  );
}

function BackButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-sm border border-ink/30 px-6 py-3 font-mono text-sm uppercase tracking-wide text-ink"
    >
      ← Voltar
    </button>
  );
}
