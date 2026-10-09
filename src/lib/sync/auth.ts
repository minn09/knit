import type { User } from "@supabase/supabase-js";
import { getSupabase } from "./client";
import { TABLE_SPECS } from "./schema";

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

let currentUser: User | null = null;
const listeners = new Set<() => void>();

function emit() {
  for (const listener of listeners) {
    listener();
  }
}

export function getUserSnapshot(): User | null {
  return currentUser;
}

export function subscribeUser(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

/** Arranca el seguimiento de sesión. Devuelve una función para desuscribirse. */
export function initAuth(): () => void {
  const supabase = getSupabase();
  if (!supabase) {
    return () => {};
  }

  supabase.auth.getSession().then(({ data }) => {
    currentUser = data.session?.user ?? null;
    emit();
  });

  const { data } = supabase.auth.onAuthStateChange((_event, session) => {
    currentUser = session?.user ?? null;
    emit();
  });

  return () => data.subscription.unsubscribe();
}

export async function signInWithPassword(email: string, password: string) {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const { error } = await supabase.auth.signInWithPassword({
    email: normalizeEmail(email),
    password,
  });
  if (error) {
    throw error;
  }
}

/** Crea la cuenta. Devuelve `true` si Supabase exige confirmar el correo. */
export async function signUpWithPassword(
  email: string,
  password: string,
): Promise<boolean> {
  const supabase = getSupabase();
  if (!supabase) {
    return false;
  }
  const { data, error } = await supabase.auth.signUp({
    email: normalizeEmail(email),
    password,
  });
  if (error) {
    throw error;
  }
  return data.session === null;
}

export async function signInWithGoogle() {
  const supabase = getSupabase();
  if (!supabase) {
    return;
  }
  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: `${window.location.origin}/notas` },
  });
  if (error) {
    throw error;
  }
}

export async function signOut() {
  const supabase = getSupabase();
  await supabase?.auth.signOut();
}

/** Borra las filas del usuario en la nube. El usuario de auth se gestiona aparte. */
export async function deleteCloudData() {
  const supabase = getSupabase();
  if (!supabase || !currentUser) {
    return;
  }
  for (const spec of TABLE_SPECS) {
    await supabase.from(spec.remote).delete().eq("user_id", currentUser.id);
  }
}
