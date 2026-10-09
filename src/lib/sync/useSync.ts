"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useSyncExternalStore } from "react";
import { db } from "@/lib/db";
import { getUserSnapshot, subscribeUser } from "./auth";
import type { LocalTable } from "./schema";

const TABLES: LocalTable[] = ["folders", "notes", "tags", "noteTags", "tasks"];

export function useSyncUser() {
  return useSyncExternalStore(subscribeUser, getUserSnapshot, () => null);
}

export function usePendingCount(): number {
  return (
    useLiveQuery(async () => {
      let total = 0;
      for (const name of TABLES) {
        total += await db[name].where("syncState").equals("pending").count();
      }
      return total;
    }, []) ?? 0
  );
}
