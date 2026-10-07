export type ChangeType = "added" | "changed" | "fixed";

export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  changes: { type: ChangeType; text: string }[];
}

// Agrega las versiones nuevas ARRIBA. Ejemplo:
// {
//   version: "0.1.0",
//   date: "2026-10-08",
//   changes: [{ type: "added", text: "Notas locales con markdown" }],
// },
export const changelog: ChangelogEntry[] = [];
