import Link from "next/link";
import type { Opportunity } from "@/lib/types";
import { getOpportunityImageUrl } from "@/lib/supabase";
import StampBadge from "./StampBadge";
import BreakOnSemicolons from "./BreakOnSemicolons";

export default function OpportunityCard({ opp }: { opp: Opportunity }) {
  const imageUrl = getOpportunityImageUrl(opp);

  return (
    <Link
      href={`/oportunidades/${opp.id}`}
      className="opportunity-card block overflow-hidden rounded-[20px]"
    >
      <div className="aspect-[16/10] w-full overflow-hidden bg-paperDark">
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-gradient-to-br from-dawnDeep via-dawnMid to-stamp">
            <span className="font-display text-lg text-white/90">
              {opp.name.slice(0, 1)}
            </span>
          </div>
        )}
      </div>

      <div className="p-5">
        <h3 className="font-display text-lg font-semibold leading-snug text-ink">
          {opp.name}
        </h3>

        {opp.prize && (
          <p className="mt-1.5 line-clamp-2 text-sm text-inkMuted">
            <BreakOnSemicolons text={opp.prize} />
          </p>
        )}

        <div className="mt-4">
          <StampBadge status={opp.status} cycleStart={opp.current_cycle_start} />
        </div>
      </div>
    </Link>
  );
}
