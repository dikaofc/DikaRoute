export type ServerLifecyclePhase = "starting" | "ready" | "stopping";

declare global {
  var __dikarouteServerLifecycle: ServerLifecyclePhase | undefined;
}

export function getServerLifecyclePhase(): ServerLifecyclePhase {
  return globalThis.__dikarouteServerLifecycle ?? "starting";
}

export function markServerStarting(): void {
  globalThis.__dikarouteServerLifecycle = "starting";
}

export function markServerReady(): void {
  if (getServerLifecyclePhase() !== "stopping") {
    globalThis.__dikarouteServerLifecycle = "ready";
  }
}

export function markServerStopping(): void {
  globalThis.__dikarouteServerLifecycle = "stopping";
}
