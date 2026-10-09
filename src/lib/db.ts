import Dexie, { type EntityTable } from "dexie";

export type SyncState = "pending" | "synced";

/** Campos comunes a toda fila sincronizable. */
interface BaseRow {
  id: string; // UUID creado en el cliente
  ownerId: string | null; // null = creada sin cuenta
  createdAt: string; // ISO
  updatedAt: string; // ISO
  deletedAt: string | null; // borrado lógico
  syncState: SyncState;
}

export interface Folder extends BaseRow {
  parentId: string | null;
  name: string;
}

export interface Note extends BaseRow {
  folderId: string | null;
  title: string;
  content: string; // markdown plano, un solo campo
  isMarkdown: boolean;
  pinned: boolean;
}

export interface Tag extends BaseRow {
  name: string;
}

/** Relación muchos-a-muchos nota–tag. id = `${noteId}:${tagId}`. */
export interface NoteTag extends BaseRow {
  noteId: string;
  tagId: string;
}

export interface Task extends BaseRow {
  noteId: string | null; // copiado a todo el árbol de subtareas
  parentId: string | null;
  title: string;
  done: boolean;
}

export const db = new Dexie("notas") as Dexie & {
  folders: EntityTable<Folder, "id">;
  notes: EntityTable<Note, "id">;
  tags: EntityTable<Tag, "id">;
  noteTags: EntityTable<NoteTag, "id">;
  tasks: EntityTable<Task, "id">;
};

// v1: solo notas. Se conserva para no perder datos ya guardados en el dispositivo.
db.version(1).stores({
  notes: "id, updatedAt, deletedAt, syncState",
});

// v2: modelo completo (organización + tareas + sync).
db.version(2).stores({
  folders: "id, parentId, updatedAt, deletedAt, syncState",
  notes: "id, folderId, updatedAt, deletedAt, syncState",
  tags: "id, name, updatedAt, deletedAt, syncState",
  noteTags: "id, noteId, tagId, updatedAt, deletedAt, syncState",
  tasks: "id, noteId, parentId, updatedAt, deletedAt, syncState",
});
