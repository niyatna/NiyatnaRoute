import { useState } from "react";

export function useAvailableModels(_modelFilterKey: string) {
  return {
    availableModels: [] as string[],
    modelCapabilities: {} as Record<string, unknown>,
    loading: false,
  };
}
