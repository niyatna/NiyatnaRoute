const DEFAULT_NIYATNAROUTE_BASE_URL = "http://localhost:9999";

type NiyatnaRouteBaseUrlEnv = {
  NIYATNAROUTE_BASE_URL?: string;
  BASE_URL?: string;
  NEXT_PUBLIC_BASE_URL?: string;
};

function normalizeBaseUrl(value?: string): string | null {
  const trimmed = value?.trim();
  if (!trimmed) return null;
  return trimmed.replace(/\/+$/, "");
}

export function resolveNiyatnaRouteBaseUrl(env: NiyatnaRouteBaseUrlEnv = process.env): string {
  return (
    normalizeBaseUrl(env.NIYATNAROUTE_BASE_URL) ||
    normalizeBaseUrl(env.BASE_URL) ||
    normalizeBaseUrl(env.NEXT_PUBLIC_BASE_URL) ||
    DEFAULT_NIYATNAROUTE_BASE_URL
  );
}

export { DEFAULT_NIYATNAROUTE_BASE_URL };
