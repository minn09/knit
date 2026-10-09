import type { SupabaseClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { getSupabase } from "./client";
import { type LocalTable, type Syncable, TABLE_SPECS } from "./schema";

export interface SyncResult {
  pushed: number;
  pulled: number;
}

interface LocalTableHandle {
  where(key: string): {
    equals(value: unknown): {
      toArray(): Promise<Syncable[]>;
      count(): Promise<number>;
    };
  };
  get(id: string): Promise<Syncable | undefined>;
  put(row: Syncable): Promise<unknown>;
  update(id: string, changes: Record<string, unknown>): Promise<unknown>;
}

const table = (name: LocalTable): LocalTableHandle =>
  db[name] as unknown as LocalTableHandle;

const LAST_PULL_PREFIX = "knit:lastPull:";
const EPOCH = "1970-01-01T00:00:00.000Z";

/** Sube lo pendiente y baja lo nuevo. Devuelve null si no hay sesión o red. */
export async function runSync(): Promise<SyncResult | null> {
  const supabase = getSupabase();
  if (!supabase) {
    return null;
  }
  if (typeof navigator !== "undefined" && !navigator.onLine) {
    return null;
  }

  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) {
    return null;
  }

  const userId = session.user.id;
  const pushed = await push(supabase, userId);
  const pulled = await pull(supabase, userId);
  return { pushed, pulled };
}

async function push(supabase: SupabaseClient, userId: string): Promise<number> {
  let pushed = 0;

  for (const spec of TABLE_SPECS) {
    const handle = table(spec.local);
    const pending = await handle.where("syncState").equals("pending").toArray();

    // Nunca se suben filas que pertenecen a otro dueño.
    const mine = pending.filter(
      (row) => row.ownerId === null || row.ownerId === userId,
    );
    if (mine.length === 0) {
      continue;
    }

    const ids = mine.map((row) => row.id);
    const { data: existing } = await supabase
      .from(spec.remote)
      .select("id, updated_at")
      .in("id", ids);
    const remoteTimes = new Map(
      (existing ?? []).map((row) => [
        row.id as string,
        row.updated_at as string,
      ]),
    );

    // Gana la última edición: no se pisa un registro más reciente en la nube.
    const rows = mine
      .map((row) => spec.upstream(row, userId))
      .filter((row) => {
        const remote = remoteTimes.get(row.id as string);
        return !remote || (row.updated_at as string) >= remote;
      });

    if (rows.length > 0) {
      const { error } = await supabase.from(spec.remote).upsert(rows);
      if (error) {
        throw error;
      }
      pushed += rows.length;
    }

    for (const row of mine) {
      await handle.update(row.id, { syncState: "synced", ownerId: userId });
    }
  }

  return pushed;
}

async function pull(supabase: SupabaseClient, userId: string): Promise<number> {
  const storageKey = `${LAST_PULL_PREFIX}${userId}`;
  const since = localStorage.getItem(storageKey) ?? EPOCH;
  let pulled = 0;
  let maxTime = since;

  for (const spec of TABLE_SPECS) {
    const { data, error } = await supabase
      .from(spec.remote)
      .select("*")
      .eq("user_id", userId)
      .gt("updated_at", since)
      .order("updated_at", { ascending: true });
    if (error) {
      throw error;
    }

    const handle = table(spec.local);
    for (const row of data ?? []) {
      const local = spec.downstream(row, userId);
      const existing = await handle.get(local.id);
      if (!existing || existing.updatedAt < local.updatedAt) {
        await handle.put(local);
        pulled += 1;
      }
      if (local.updatedAt > maxTime) {
        maxTime = local.updatedAt;
      }
    }
  }

  localStorage.setItem(storageKey, maxTime);
  return pulled;
}
