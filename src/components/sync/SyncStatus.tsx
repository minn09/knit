"use client";

import { useSyncExternalStore } from "react";
import { syncEnabled } from "@/lib/sync/config";
import { getStatus, subscribeStatus } from "@/lib/sync/status";
import { usePendingCount } from "@/lib/sync/useSync";

export function SyncStatus() {
  const status = useSyncExternalStore(
    subscribeStatus,
    getStatus,
    () => "idle" as const,
  );
  const pending = usePendingCount();

  if (!syncEnabled) {
    return null;
  }

  let text: string | null = null;
  if (status === "syncing") {
    text = "Sincronizando…";
  } else if (status === "offline") {
    text =
      pending > 0 ? `Sin conexión · ${pending} pendientes` : "Sin conexión";
  } else if (status === "error") {
    text = "No se pudo sincronizar";
  } else if (pending > 0) {
    text = `${pending} por sincronizar`;
  }

  if (!text) {
    return null;
  }

  return (
    <span className="text-xs text-neutral-500 dark:text-neutral-400">
      {text}
    </span>
  );
}
