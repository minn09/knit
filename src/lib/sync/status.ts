export type SyncStatus = "disabled" | "idle" | "syncing" | "offline" | "error";

let status: SyncStatus = "idle";
const listeners = new Set<() => void>();

export function getStatus(): SyncStatus {
  return status;
}

export function setStatus(next: SyncStatus) {
  if (status === next) {
    return;
  }
  status = next;
  for (const listener of listeners) {
    listener();
  }
}

export function subscribeStatus(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
