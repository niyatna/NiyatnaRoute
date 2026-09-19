export const MEMORY_SAVE_TOOL_NAME = "memory_save";
export const MEMORY_UPDATE_TOOL_NAME = "memory_update";
export const MEMORY_SEARCH_TOOL_NAME = "memory_search";
export const MEMORY_DELETE_TOOL_NAME = "memory_delete";

export const MEMORY_BUILTIN_TOOL_NAMES: readonly string[] = [];

export const memoryBuiltinHandlers: Record<string, unknown> = {};

export function buildMemoryToolsForProvider(_provider: string): unknown[] {
  return [];
}
