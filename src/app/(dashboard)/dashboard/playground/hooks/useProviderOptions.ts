import { useState } from "react";

export function useProviderOptions(initialProvider: string) {
  const [provider, setProvider] = useState(initialProvider);
  return {
    provider,
    setProvider,
    providerOptions: [] as Array<{ value: string; label: string; modelPrefix?: string }>,
    loading: false,
  };
}
