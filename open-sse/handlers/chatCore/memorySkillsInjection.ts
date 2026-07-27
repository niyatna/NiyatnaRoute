export function getSkillsModelIdForFormat(format: string): string {
  return "gpt-4o";
}

export function getSkillsProviderForFormat(format: string): "openai" | "anthropic" | "google" | "other" {
  return "openai";
}

export async function injectMemoryAndSkills(options: {
  body: Record<string, unknown>;
  memoryOwnerId: string | null;
  provider: string;
  effectiveModel: string;
  sourceFormat: string;
  targetFormat: string;
  backgroundReason: string | null;
  log: unknown;
}) {
  return {
    body: options.body,
    memorySettings: null,
    memoryExtractionResponse: null,
  };
}
