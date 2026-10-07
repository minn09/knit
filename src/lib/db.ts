import Dexie, { type EntityTable } from "dexie";

export interface Note {
  id: string; // UUID creado en el cliente
  ownerId: string | null; // null = creada sin cuenta (se usa en la fase 4)
  folderId: string | null; // fase 2
  title: string;
  content: string; // markdown plano, un solo campo
  isMarkdown: boolean;
  pinned: boolean;
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt: string | null; // borrado lógico
  syncState: "pending" | "synced"; // fase 4
}

export const db = new Dexie("notas") as Dexie & {
  notes: EntityTable<Note, "id">;
};

// Solo se indexa lo que se consulta; booleanos no son claves válidas en IndexedDB
db.version(1).stores({
  notes: "id, updatedAt, deletedAt, syncState",
});
