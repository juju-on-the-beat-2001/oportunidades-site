import { createClient } from "@supabase/supabase-js";

// These come from your .env.local — NEXT_PUBLIC_ prefix means they're
// safe to expose in the browser (this is the read-only anon key, not
// the service key). Your `opportunities` table already allows public
// reads (set up in schema.sql), so no login is needed to query it.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Force every request through this client to skip Next.js's fetch cache.
// Without this, Next.js's App Router silently caches the raw fetch()
// response indefinitely (even across `next dev` restarts, since it's
// persisted to .next/cache) — so edits made directly in Supabase (image
// replacements, cost rewording, etc.) wouldn't show up on the site.
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  global: {
    fetch: (input, init) => fetch(input, { ...init, cache: "no-store" }),
  },
});

const IMAGE_BUCKET = "opportunity-images";

// Prefer the cached Supabase Storage copy (image_storage_path) — that's
// what gets updated when someone manually replaces an image. Only fall
// back to the original hotlinked image_url when nothing's been cached.
export function getOpportunityImageUrl(opp: {
  image_url: string | null;
  image_storage_path: string | null;
}): string | null {
  if (opp.image_storage_path) {
    return `${supabaseUrl}/storage/v1/object/public/${IMAGE_BUCKET}/${opp.image_storage_path}`;
  }
  return opp.image_url;
}
