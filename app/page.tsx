import Link from "next/link";
import { supabase } from "@/lib/supabase";
import type { Opportunity } from "@/lib/types";
import OpportunityCard from "@/components/OpportunityCard";
import HeroDecorations from "@/components/HeroDecorations";

// Always hit Supabase fresh — this data changes from outside the app
// (manual image/cost edits), so we don't want Next.js's fetch cache
// serving a stale snapshot.
export const dynamic = "force-dynamic";

async function getFeatured(): Promise<Opportunity[]> {
  const { data, error } = await supabase
    .from("opportunities_with_status")
    .select("*")
    .eq("status", "Aberta")
    .order("current_cycle_end", { ascending: true })
    .limit(8);

  if (error) {
    console.error(error);
    return [];
  }
  return (data as Opportunity[]) ?? [];
}

export default async function Home() {
  const featured = await getFeatured();

  return (
    <main className="dawn-page min-h-screen">
      {/* The one bold moment on the site: dawn breaking. */}
      <section className="relative px-6 pb-24 pt-20 text-center sm:pt-28">
        <HeroDecorations />
        <div className="relative">
          <h1 className="mx-auto mt-6 max-w-3xl font-display text-5xl font-semibold leading-tight text-white sm:text-6xl">
            Oportunidades que Transformam
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-white/80">
            Para escolas e estudantes do ensino fundamental e médio
          </p>

          <div className="mx-auto mt-14 flex max-w-xl flex-col items-center gap-6">
            <span className="font-display text-4xl font-semibold text-white sm:text-5xl">
              Eu sou...
            </span>
            <div className="flex gap-4">
              <Link
                href="/professor"
                className="flex items-center gap-2 rounded-full bg-white px-10 py-5 text-xl font-semibold text-dawnDeep shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
              >
                <span aria-hidden="true">🍎</span>
                Professor
              </Link>
              <Link
                href="/aluno"
                className="flex items-center gap-2 rounded-full bg-stamp px-10 py-5 text-xl font-semibold text-white shadow-lg shadow-black/10 transition-transform hover:-translate-y-0.5"
              >
                <span aria-hidden="true">✏️</span>
                Aluno
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Featured opportunities slider */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="rounded-[24px] bg-[#F2EFE5] p-8">
          <div className="flex items-end justify-between">
            <div>
              <p className="font-mono text-xs uppercase tracking-[0.2em] text-inkMuted">
                Sua chance está aqui
              </p>
              <h2 className="mt-2 font-display text-2xl font-semibold text-ink sm:text-3xl">
                Portas abertas agora — uma delas pode ser sua
              </h2>
            </div>
            <Link
              href="/resultados"
              className="hidden shrink-0 font-semibold text-stamp hover:underline sm:block"
            >
              Ver todas →
            </Link>
          </div>

          {featured.length > 0 ? (
            <div className="snap-row mt-8 flex gap-5 overflow-x-auto pb-4">
              {featured.map((opp) => (
                <div key={opp.id} className="w-[280px] shrink-0 sm:w-[320px]">
                  <OpportunityCard opp={opp} />
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-8 text-inkMuted">
              Novas oportunidades estão a caminho — sua chance está chegando.
              Volte em breve!
            </p>
          )}

          <div className="mt-8 text-center sm:hidden">
            <Link
              href="/resultados"
              className="inline-block rounded-full border border-ink/20 px-6 py-3 font-semibold text-ink"
            >
              Ver todas →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
