"use client";

import { useState } from "react";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import {
  deleteCloudData,
  signInWithGoogle,
  signInWithPassword,
  signOut,
  signUpWithPassword,
} from "@/lib/sync/auth";
import { useSyncUser } from "@/lib/sync/useSync";

interface ConfirmState {
  title: string;
  description: string;
  confirmText: string;
  destructive: boolean;
  action: () => void | Promise<void>;
}

export function AuthDialog({ onClose }: { onClose: () => void }) {
  const user = useSyncUser();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  async function run(action: () => Promise<void>) {
    setBusy(true);
    setError(null);
    setInfo(null);
    try {
      await action();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Algo salió mal.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
        <div className="w-full max-w-sm rounded-lg border border-neutral-200 bg-background p-5 shadow-lg dark:border-neutral-800">
          <div className="flex items-center justify-between">
            <h2 className="font-semibold">
              {user
                ? "Tu cuenta"
                : mode === "signin"
                  ? "Iniciar sesión"
                  : "Crear cuenta"}
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded px-2 py-1 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900"
            >
              Cerrar
            </button>
          </div>

          {user ? (
            <div className="mt-4 space-y-3">
              <p className="text-sm text-neutral-600 dark:text-neutral-400">
                Sesión iniciada como <strong>{user.email}</strong>. Tus notas se
                sincronizan entre dispositivos.
              </p>
              {error && <p className="text-sm text-red-600">{error}</p>}
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setConfirm({
                    title: "Cerrar sesión",
                    description:
                      "Tus notas quedarán en este dispositivo y dejarán de sincronizarse. ¿Continuar?",
                    confirmText: "Cerrar sesión",
                    destructive: false,
                    action: () => run(signOut),
                  })
                }
                className="w-full rounded border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-neutral-700"
              >
                Cerrar sesión
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  setConfirm({
                    title: "Borrar datos de la nube",
                    description:
                      "Esto borrará tus notas en la nube de forma permanente. La copia local se mantiene. ¿Continuar?",
                    confirmText: "Borrar",
                    destructive: true,
                    action: () => run(deleteCloudData),
                  })
                }
                className="w-full rounded px-3 py-2 text-sm text-red-600 hover:bg-red-50 disabled:opacity-50 dark:hover:bg-red-950/40"
              >
                Borrar datos de la nube
              </button>
            </div>
          ) : (
            <div className="mt-4 space-y-3">
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="tu@correo.com"
                className="w-full rounded border border-neutral-200 px-3 py-2 text-sm outline-none dark:border-neutral-800"
              />
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Contraseña"
                className="w-full rounded border border-neutral-200 px-3 py-2 text-sm outline-none dark:border-neutral-800"
              />
              {error && <p className="text-sm text-red-600">{error}</p>}
              {info && (
                <p className="text-sm text-emerald-600 dark:text-emerald-400">
                  {info}
                </p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() =>
                  run(async () => {
                    if (mode === "signin") {
                      await signInWithPassword(email, password);
                      onClose();
                    } else {
                      const needsConfirm = await signUpWithPassword(
                        email,
                        password,
                      );
                      if (needsConfirm) {
                        setInfo(
                          "Te enviamos un correo para confirmar tu cuenta. Revisá tu bandeja (y el spam) y luego iniciá sesión.",
                        );
                      } else {
                        onClose();
                      }
                    }
                  })
                }
                className="w-full rounded bg-neutral-900 px-3 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-white dark:text-neutral-900"
              >
                {mode === "signin" ? "Entrar" : "Registrarme"}
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={() => run(signInWithGoogle)}
                className="w-full rounded border border-neutral-300 px-3 py-2 text-sm disabled:opacity-50 dark:border-neutral-700"
              >
                Continuar con Google
              </button>
              <button
                type="button"
                onClick={() => setMode(mode === "signin" ? "signup" : "signin")}
                className="w-full text-center text-xs text-neutral-500 hover:underline"
              >
                {mode === "signin"
                  ? "¿No tienes cuenta? Crear una"
                  : "¿Ya tienes cuenta? Iniciar sesión"}
              </button>
            </div>
          )}
        </div>
      </div>

      {confirm && (
        <ConfirmDialog
          open
          title={confirm.title}
          description={confirm.description}
          confirmText={confirm.confirmText}
          destructive={confirm.destructive}
          onConfirm={() => {
            confirm.action();
            setConfirm(null);
          }}
          onOpenChange={(open) => {
            if (!open) {
              setConfirm(null);
            }
          }}
        />
      )}
    </>
  );
}
