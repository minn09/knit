/**
 * La sincronización es opcional: si no hay credenciales de Supabase, la app
 * se comporta 100% local y ninguna pieza de red se ejecuta.
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY =
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

export const syncEnabled =
  SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
