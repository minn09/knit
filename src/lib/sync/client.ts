import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { SUPABASE_ANON_KEY, SUPABASE_URL, syncEnabled } from "./config";

let client: SupabaseClient | null = null;

/** Cliente perezoso: se crea solo si la sincronización está configurada. */
export function getSupabase(): SupabaseClient | null {
  if (!syncEnabled) {
    return null;
  }
  if (!client) {
    client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
