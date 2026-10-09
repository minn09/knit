"use client";

import { useState } from "react";
import { syncEnabled } from "@/lib/sync/config";
import { useSyncUser } from "@/lib/sync/useSync";
import { AuthDialog } from "./AuthDialog";

export function AuthButton() {
  const user = useSyncUser();
  const [open, setOpen] = useState(false);

  if (!syncEnabled) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        title={user ? "Tu cuenta" : "Iniciar sesión para sincronizar"}
        className="rounded border border-neutral-300 px-3 py-1.5 text-sm hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900"
      >
        {user ? (user.email?.split("@")[0] ?? "Cuenta") : "Iniciar sesión"}
      </button>
      {open && <AuthDialog onClose={() => setOpen(false)} />}
    </>
  );
}
