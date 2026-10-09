"use client";

import { useEffect } from "react";
import { initAuth } from "@/lib/sync/auth";
import { syncEnabled } from "@/lib/sync/config";
import { runSync } from "@/lib/sync/engine";
import { setStatus } from "@/lib/sync/status";

/** Corre la sincronización al abrir, al recuperar red y cada 30 s. */
export function SyncProvider() {
  useEffect(() => {
    if (!syncEnabled) {
      setStatus("disabled");
      return;
    }

    const stop = initAuth();
    let active = true;

    const tick = async () => {
      if (!active) {
        return;
      }
      if (typeof navigator !== "undefined" && !navigator.onLine) {
        setStatus("offline");
        return;
      }
      setStatus("syncing");
      try {
        await runSync();
        if (active) {
          setStatus("idle");
        }
      } catch {
        if (active) {
          setStatus("error");
        }
      }
    };

    tick();
    const interval = window.setInterval(tick, 30000);
    const onOnline = () => tick();
    const onOffline = () => setStatus("offline");

    window.addEventListener("online", onOnline);
    window.addEventListener("offline", onOffline);

    return () => {
      active = false;
      stop();
      window.clearInterval(interval);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("offline", onOffline);
    };
  }, []);

  return null;
}
