/**
 * "Featured" provider pinning + brand accent — presentation-only concern for the
 * providers dashboard grid.
 *
 * Cheaper Inference (rank 2). Ranked providers are pinned — in rank order —
 * within whichever category/group they render in on `/dashboard/providers`, and
 * their `ProviderCard` renders a brand accent + supporter badge.
 *
 * Scope guard: this is a UI ordering/branding concern ONLY. It must never be
 * imported by routing/fallback code (`open-sse/config/providerRegistry.ts`,
 * `open-sse/config/providers/*`) — the order defined here has zero effect on
 * combo routing, Auto-Combo scoring, or fallback/account selection. See
 * `providerPageUtils.ts::sortProviderEntriesFeaturedFirst`, the sole consumer
 * of `FEATURED_PROVIDER_IDS`, and `ProviderCard.tsx`, the sole consumer of
 */


/** Cheaper Inference brand green (the accent stroke in its logomark). */
export const CHEAPERINFERENCE_BRAND_COLOR = "#31f889";


/** Cheaper Inference (api.cheaperinference.com) — apikey category, single id. */
const CHEAPERINFERENCE_PROVIDER_IDS: readonly string[] = ["cheaperinference"];

/**
 * Explicit sponsor ordering for the dashboard provider grids.
 *
 * A plain Set is NOT enough: `sortProviderEntriesFeaturedFirst` pins featured
 * entries while preserving alphabetical order among them, and "Cheaper Inference"
 * sorts before "Kimi". The operator requires Kimi 1st and Cheaper Inference 2nd
 * (2026-07-31), so rank is stated here rather than derived from the display name.
 * Lower number = higher on the page; equal ranks fall back to alphabetical.
 *
 * Scope guard (see file header): presentation only — never import this from
 * routing/fallback code.
 */
const FEATURED_PROVIDER_RANKS: ReadonlyMap<string, number> = new Map([
  ...CHEAPERINFERENCE_PROVIDER_IDS.map((id) => [id, 2] as const),
]);

/** Brand accent per sponsor family, keyed by any of that family's provider ids. */
export const SPONSOR_BRAND_COLORS: Readonly<Record<string, string>> = Object.freeze({
  ...Object.fromEntries(
    CHEAPERINFERENCE_PROVIDER_IDS.map((id) => [id, CHEAPERINFERENCE_BRAND_COLOR])
  ),
});

/** Sponsor rank (1 = top), or null when the provider is not featured. */
export function getFeaturedProviderRank(providerId: string | null | undefined): number | null {
  if (typeof providerId !== "string") return null;
  return FEATURED_PROVIDER_RANKS.get(providerId) ?? null;
}

/**
 * Providers pinned first within their dashboard category/group by
 * `sortProviderEntriesFeaturedFirst`. Retained for existing importers: the flat
 * set of featured ids, derived from the rank map so the two cannot drift.
 */
export const FEATURED_PROVIDER_IDS: ReadonlySet<string> = new Set(FEATURED_PROVIDER_RANKS.keys());

export function isFeaturedProviderId(providerId: string | null | undefined): boolean {
  return getFeaturedProviderRank(providerId) !== null;
}


/** True for providers that should render the Cheaper Inference card accent. */
export function isCheaperInferenceProviderId(providerId: string | null | undefined): boolean {
  return typeof providerId === "string" && CHEAPERINFERENCE_PROVIDER_IDS.includes(providerId);
}

/** True for any Open Source Friend — drives the shared supporter chip. */
export function isSponsorProviderId(providerId: string | null | undefined): boolean {
  return isFeaturedProviderId(providerId);
}

export default isCheaperInferenceProviderId;

