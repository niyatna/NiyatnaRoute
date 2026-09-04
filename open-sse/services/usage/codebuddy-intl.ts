/**
 * CodeBuddy International usage handler — scoped to the "codebuddy-intl" provider.
 * Sourced from https://www.codebuddy.ai/v2/billing/meter/get-user-resource.
 */

const USAGE_URL = "https://www.codebuddy.ai/v2/billing/meter/get-user-resource";

interface TencentAccount {
  PackageName?: string;
  SubProductName?: string;
  CycleStartTime?: string | number;
  CycleEndTime?: string | number;
  DeductionEndTime?: string | number;
  CycleCapacitySize?: number | string;
  CycleCapacitySizePrecise?: string | number;
  CycleCapacityUsed?: number | string;
  CycleCapacityUsedPrecise?: string | number;
  CapacitySize?: number | string;
  CapacitySizePrecise?: string | number;
  CapacityUsed?: number | string;
  CapacityUsedPrecise?: string | number;
}

function parseCycleTimestamp(raw: unknown): number | null {
  if (raw === undefined || raw === null || raw === "") return null;
  if (typeof raw === "number" && Number.isFinite(raw)) {
    return raw < 1e11 ? raw * 1000 : raw;
  }
  if (typeof raw === "string") {
    const trimmed = raw.trim();
    if (!trimmed) return null;
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      return n < 1e11 ? n * 1000 : n;
    }
    const parsed = Date.parse(trimmed.replace(" ", "T"));
    if (!Number.isNaN(parsed)) return parsed;
  }
  return null;
}

function parseCycleLengthDays(account: TencentAccount): number | null {
  const start = parseCycleTimestamp(account.CycleStartTime);
  const end = parseCycleTimestamp(account.CycleEndTime);
  if (!start || !end || end <= start) return null;
  const days = Math.round((end - start) / 86400000);
  return days > 0 ? days : null;
}

function isBonusPack(account: TencentAccount): boolean {
  const cycleEnd = parseCycleTimestamp(account.CycleEndTime);
  const deductionEnd = parseCycleTimestamp(account.DeductionEndTime);
  if (!cycleEnd || !deductionEnd) return false;
  return Math.abs(deductionEnd - cycleEnd) <= 86400000;
}

function labelForRefill(account: TencentAccount): string {
  const days = parseCycleLengthDays(account);
  if (days === null) return "Refill Pack";
  if (days >= 27 && days <= 32) return "Monthly";
  if (days >= 6 && days <= 8) return "Weekly";
  if (days === 1) return "Daily";
  return `${days}d Cycle`;
}

function pickNumber(
  precise: string | number | undefined,
  fallback: number | string | undefined
): number {
  if (precise !== undefined && precise !== null && precise !== "") {
    const n = Number(precise);
    if (!Number.isNaN(n) && n >= 0) return n;
  }
  if (fallback !== undefined && fallback !== null && fallback !== "") {
    const n = Number(fallback);
    if (!Number.isNaN(n) && n >= 0) return n;
  }
  return 0;
}

interface CodeBuddyUsageResult {
  plan?: string;
  quotas?: Record<
    string,
    {
      used: number;
      limit: number;
      percentage: number;
      resetAt?: number;
      unlimited: boolean;
    }
  >;
  message?: string;
}

export async function getCodeBuddyIntlUsage(
  accessToken?: string,
  apiKey?: string,
  _providerSpecificData?: unknown
): Promise<CodeBuddyUsageResult> {
  const token = accessToken || apiKey;
  if (!token) {
    return { message: "CodeBuddy Intl credential not available." };
  }

  try {
    const response = await fetch(USAGE_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
        "User-Agent": "IDE/2.108.1 CodeBuddy/2.108.1",
        "X-Product": "SaaS",
        "X-IDE-Type": "IDE",
        "X-IDE-Name": "IDE",
        "x-requested-with": "XMLHttpRequest",
        "x-codebuddy-request": "1",
      },
      body: "{}",
    });

    if (response.status === 401 || response.status === 403) {
      return { message: "CodeBuddy Intl credential invalid or expired." };
    }
    if (!response.ok) {
      return { message: `CodeBuddy Intl quota API error (${response.status}).` };
    }

    const json: any = await response.json();
    if (json?.code !== 0) {
      return { message: `CodeBuddy Intl quota error: ${json?.msg || "unknown"}` };
    }

    const data = json?.data?.Response?.Data || {};
    const accounts: TencentAccount[] = Array.isArray(data.Accounts) ? data.Accounts : [];

    if (accounts.length === 0) {
      return { message: "CodeBuddy Intl connected. No credit package found." };
    }

    const refillAccounts: TencentAccount[] = [];
    const bonusAccounts: TencentAccount[] = [];
    for (const a of accounts) {
      (isBonusPack(a) ? bonusAccounts : refillAccounts).push(a);
    }

    const quotas: NonNullable<CodeBuddyUsageResult["quotas"]> = {};

    for (let i = 0; i < refillAccounts.length; i++) {
      const a = refillAccounts[i];
      const baseLabel = labelForRefill(a);
      const label = refillAccounts.length > 1 ? `${baseLabel} ${i + 1}` : baseLabel;
      const limit = pickNumber(a.CycleCapacitySizePrecise, a.CycleCapacitySize);
      const used = pickNumber(a.CycleCapacityUsedPrecise, a.CycleCapacityUsed);
      const resetAt = parseCycleTimestamp(a.CycleEndTime) ?? undefined;
      const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
      quotas[label] = { used, limit, percentage, resetAt, unlimited: false };
    }

    bonusAccounts.sort((a, b) => {
      const ta = parseCycleTimestamp(a.CycleEndTime) ?? Number.POSITIVE_INFINITY;
      const tb = parseCycleTimestamp(b.CycleEndTime) ?? Number.POSITIVE_INFINITY;
      return ta - tb;
    });

    for (let i = 0; i < bonusAccounts.length; i++) {
      const a = bonusAccounts[i];
      const label = bonusAccounts.length > 1 ? `Bonus Pack ${i + 1}` : "Bonus Pack";
      const limit = pickNumber(a.CapacitySizePrecise, a.CapacitySize);
      const used = pickNumber(a.CapacityUsedPrecise, a.CapacityUsed);
      const resetAt = parseCycleTimestamp(a.CycleEndTime) ?? undefined;
      const percentage = limit > 0 ? Math.min(100, Math.round((used / limit) * 100)) : 0;
      quotas[label] = { used, limit, percentage, resetAt, unlimited: false };
    }

    const basePkg = refillAccounts[0] || bonusAccounts[0] || accounts[0];
    const plan = basePkg.PackageName || basePkg.SubProductName || "CodeBuddy Intl";

    return { plan, quotas };
  } catch (error) {
    return { message: "CodeBuddy Intl error: failed to fetch quota." };
  }
}

export default getCodeBuddyIntlUsage;
