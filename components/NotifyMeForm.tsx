"use client";

import { useState } from "react";

// UI-only for now — captures intent, doesn't send anything anywhere.
// TODO: wire this up to a real backend that schedules an email for the
// day `current_cycle_start` opens once that infrastructure exists.
export default function NotifyMeForm() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
  }

  if (submitted) {
    return (
      <div className="opportunity-card mt-16 p-6 text-center">
        <p className="font-display text-lg font-semibold text-ink">Combinado! ✓</p>
        <p className="mt-1 text-sm text-inkMuted">
          Vamos avisar <span className="font-semibold text-ink">{email}</span> assim
          que essa oportunidade abrir — pra você chegar na frente.
        </p>
      </div>
    );
  }

  return (
    <div className="opportunity-card mt-16 p-6">
      <p className="font-display text-lg font-semibold text-ink">
        🔔 Me notifique quando a oportunidade abrir
      </p>
      <p className="mt-1 text-sm text-inkMuted">
        Deixe seu e-mail e a gente avisa você no dia em que as inscrições
        abrirem — sua próxima conquista não vai passar despercebida.
      </p>
      <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-2 sm:flex-row">
        <input
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="seu@email.com"
          className="flex-1 rounded-sm border border-ink/20 bg-white px-4 py-2.5 text-sm text-ink placeholder:text-inkMuted focus:border-ink focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-sm bg-ink px-6 py-2.5 font-mono text-sm uppercase tracking-wide text-paper"
        >
          Avisar
        </button>
      </form>
    </div>
  );
}
