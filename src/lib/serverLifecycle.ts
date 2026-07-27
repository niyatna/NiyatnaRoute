export type ServerLifecyclePhase = "starting" | "ready" | "stopping";

declare global {
  var __niyatnarouteServerLifecycle: ServerLifecyclePhase | undefined;
}

export function getServerLifecyclePhase(): ServerLifecyclePhase {
  return globalThis.__niyatnarouteServerLifecycle ?? "starting";
}

export function markServerStarting(): void {
  globalThis.__niyatnarouteServerLifecycle = "starting";
}

export function markServerReady(): void {
  if (getServerLifecyclePhase() !== "stopping") {
    globalThis.__niyatnarouteServerLifecycle = "ready";
  }
}

export function markServerStopping(): void {
  globalThis.__niyatnarouteServerLifecycle = "stopping";
}
