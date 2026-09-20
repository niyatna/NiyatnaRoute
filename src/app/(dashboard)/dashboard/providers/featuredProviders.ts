/**
 * "Featured" provider pinning + brand accent — presentation-only concern for the
 * providers dashboard grid.
 *
 * Powers the Open Source Friend highlights: Kimi (Moonshot AI, rank 1) and
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
 * `KIMI_BRAND_COLOR`/`isKimiPartnerProviderId`.
 */

/**
 * Official Kimi (Moonshot AI) brand blue — matches the Kimi app icon
 * (#1783FF on white). Card accent classes in `ProviderCard.tsx` use this exact
 * hex as Tailwind arbitrary values (Tailwind's JIT scanner requires a static
 * literal in the className string, so it cannot reference this constant
 * directly) — keep them in sync with this value if it ever changes.
 */
export const KIMI_BRAND_COLOR = "#1783FF";

/** Cheaper Inference brand green (the accent stroke in its logomark). */
export const CHEAPERINFERENCE_BRAND_COLOR = "#31f889";

/**
 * Every Kimi/Moonshot dashboard-catalog provider id (`src/shared/constants/providers/`),
 * including the two `hiddenFromDashboard` aliases that never render their own
 * card today — kept here so the set stays correct if that ever changes.
 *
 *  - "kimi"               legacy Moonshot API alias — apikey category, hiddenFromDashboard
 *  - "kimi-coding"        Kimi Code CLI — oauth category (visible card)
 *  - "kimi-coding-apikey" Kimi Code API Key — apikey category, hiddenFromDashboard
 *                         (its connections fold into the kimi-coding card, see
 *                         PROVIDER_CONNECTION_ALIASES in providerPageUtils.ts)
 *  - "kimi-web"           Kimi Web — web-cookie category (visible card)
 *  - "moonshot"           Moonshot AI — apikey category (visible card)
 */

/** Brand accent per sponsor family, keyed by any of that family's provider ids. */
export const SPONSOR_BRAND_COLORS: Readonly<Record<string, string>> = Object.freeze({});

/** Sponsor rank (1 = top), or null when the provider is not featured. */
export function getFeaturedProviderRank(_providerId: string | null | undefined): number | null {
  return null;
}

/**
 * Providers pinned first within their dashboard category/group by
 * `sortProviderEntriesFeaturedFirst`. Retained for existing importers: the flat
 * set of featured ids, derived from the rank map so the two cannot drift.
 */
export const FEATURED_PROVIDER_IDS: ReadonlySet<string> = new Set();

export function isFeaturedProviderId(_providerId: string | null | undefined): boolean {
  return false;
}

/** True for providers that should render the Kimi official-supporter card accent. */
export function isKimiPartnerProviderId(_providerId: string | null | undefined): boolean {
  return false;
}

/** True for providers that should render the Cheaper Inference card accent. */
export function isCheaperInferenceProviderId(_providerId: string | null | undefined): boolean {
  return false;
}

/** True for any Open Source Friend — drives the shared supporter chip. */
export function isSponsorProviderId(_providerId: string | null | undefined): boolean {
  return false;
}
