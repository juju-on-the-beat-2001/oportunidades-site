import { supabase, getOpportunityImageUrl } from "@/lib/supabase";
import type { Opportunity } from "@/lib/types";
import { getParticipationTypeLabel } from "@/lib/types";
import StampBadge from "@/components/StampBadge";
import BreakOnSemicolons from "@/components/BreakOnSemicolons";
import BulletedList from "@/components/BulletedList";
import { getPrepResources } from "@/lib/prepResources";
import NotifyMeForm from "@/components/NotifyMeForm";
import Link from "next/link";
import { notFound } from "next/navigation";

// Always hit Supabase fresh — this data changes from outside the app
// (manual image/cost edits), so we don't want Next.js's fetch cache
// serving a stale snapshot.
export const dynamic = "force-dynamic";

async function getOpportunity(id: string): Promise<Opportunity | null> {
  const { data, error } = await supabase
    .from("opportunities_with_status")
    .select("*")
    .eq("id", id)
    .single();

  if (error || !data) return null;
  return data as Opportunity;
}

export default async function OpportunityPage({
  params,
}: {
  params: { id: string };
}) {
  const opp = await getOpportunity(params.id);
  if (!opp) notFound();

  const imageUrl = getOpportunityImageUrl(opp);
  const prepResources = getPrepResources(opp.opportunity_type);

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-6 py-16">
      <Link
        href="/"
        className="font-mono text-xs uppercase tracking-wide text-stamp hover:underline"
      >
        ← Início
      </Link>

      {imageUrl && (
        <div className="mt-6 aspect-[21/9] w-full overflow-hidden rounded-sm bg-paperDark">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-contain"
          />
        </div>
      )}

      <h1 className="mt-6 font-display text-4xl font-semibold leading-tight text-ink">
        {opp.name}
      </h1>

      <div className="mt-4 flex flex-wrap gap-2">
        <StampBadge status={opp.status} cycleStart={opp.current_cycle_start} />
      </div>

      {opp.description && (
        <p className="mt-6 leading-relaxed text-ink">
          <BreakOnSemicolons text={opp.description} />
        </p>
      )}

      <dl className="mt-10 grid gap-6 border-t border-ink/15 pt-8 sm:grid-cols-2">
        {opp.prize && (
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-inkMuted">
              Prêmio
            </dt>
            <dd className="mt-1 text-ink">
              <BulletedList text={opp.prize} />
            </dd>
          </div>
        )}
        {opp.cost && (
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-inkMuted">
              Custo
            </dt>
            <dd className="mt-1 text-ink">
              <BulletedList text={opp.cost} />
            </dd>
          </div>
        )}
        {opp.participation_type.length > 0 && (
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-inkMuted">
              Como participar
            </dt>
            <dd className="mt-1 text-ink">
              {opp.participation_type.map(getParticipationTypeLabel).join(" · ")}
            </dd>
          </div>
        )}
        {opp.current_cycle_end && (
          <div>
            <dt className="font-mono text-xs uppercase tracking-wide text-inkMuted">
              Prazo
            </dt>
            <dd className="mt-1 text-ink">
              {new Date(opp.current_cycle_end).toLocaleDateString("pt-BR")}
              {opp.is_estimated_cycle && (
                <span className="ml-2 text-xs text-inkMuted">(estimado)</span>
              )}
            </dd>
          </div>
        )}
        {opp.requirements && (
          <div className="sm:col-span-2">
            <dt className="font-mono text-xs uppercase tracking-wide text-inkMuted">
              Requisitos
            </dt>
            <dd className="mt-1 text-ink">
              <BulletedList text={opp.requirements} />
            </dd>
          </div>
        )}
      </dl>

      {opp.url && (
        <a
          href={opp.url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-10 inline-block rounded-sm bg-ink px-6 py-3 font-mono text-sm uppercase tracking-wide text-paper"
        >
          Acessar site oficial →
        </a>
      )}

      <NotifyMeForm />

      <section className="mt-16 border-t border-ink/15 pt-10">
        <h2 className="font-display text-xl font-semibold text-ink">
          Como se preparar para conquistar essa oportunidade
        </h2>
        <div className="mt-6 grid gap-5 sm:grid-cols-3">
          {prepResources.map((resource) => (
            <div key={resource.title} className="opportunity-card p-5">
              <h3 className="font-display text-base font-semibold text-ink">
                {resource.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-inkMuted">
                {resource.description}
              </p>
              {resource.url ? (
                <a
                  href={resource.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block text-sm font-semibold text-stamp hover:underline"
                >
                  Acessar →
                </a>
              ) : (
                <p className="mt-4 font-mono text-xs uppercase tracking-wide text-inkMuted/60">
                  Link em breve
                </p>
              )}
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
