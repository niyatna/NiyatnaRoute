export interface MemorySkillsInjectionResult {
  body: Record<string, unknown>;
  memorySettings: { enabled: boolean; skillsEnabled: boolean; maxTokens: number } | null;
  builtinToolNames: string[];
  injectedCustomSkillNames: string[];
}

export function sortToolsByName<T>(tools: T[]): T[] {
  if (!Array.isArray(tools) || tools.length <= 1) return tools;
  return tools;
}

export function getSkillsModelIdForFormat(_format: string): string {
  return "gpt-4o";
}

export function getSkillsProviderForFormat(_format: string): "openai" | "anthropic" | "google" | "other" {
  return "openai";
}

export async function injectMemoryAndSkills(options: {
  body: Record<string, unknown>;
  memoryOwnerId?: string | null;
  provider?: string;
  effectiveModel?: string;
  sourceFormat?: string;
  targetFormat?: string;
  backgroundReason?: string | null;
  log?: unknown;
}): Promise<MemorySkillsInjectionResult> {
  return {
    body: options.body,
    memorySettings: null,
    builtinToolNames: [],
    injectedCustomSkillNames: [],
  };
}

export function mergeInjectedFallbackOwnerNames(
  injectionResult: { builtinToolNames?: string[] },
  plans: Array<{ enabled?: boolean; toolName?: string | null; convertedToolCount?: number }>,
  preConversionClientToolNames?: string[]
): { builtinToolNames: string[] } {
  const existing = new Set(injectionResult?.builtinToolNames || []);
  const clientTools = new Set(preConversionClientToolNames || []);
  for (const plan of plans) {
    if (plan?.enabled && (plan.convertedToolCount ?? 0) > 0 && plan.toolName) {
      if (!clientTools.has(plan.toolName)) {
        existing.add(plan.toolName);
      }
    }
  }
  return { builtinToolNames: Array.from(existing) };
}
