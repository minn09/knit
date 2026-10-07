import { db, type Note } from "./db";

const now = () => new Date().toISOString();

export async function createNote(): Promise<string> {
  const id = crypto.randomUUID();
  const t = now();
  await db.notes.add({
    id,
    ownerId: null,
    folderId: null,
    title: "",
    content: "",
    isMarkdown: true,
    pinned: false,
    createdAt: t,
    updatedAt: t,
    deletedAt: null,
    syncState: "pending",
  });
  return id;
}

type Editable = Pick<Note, "title" | "content" | "isMarkdown" | "pinned">;

export async function updateNote(id: string, changes: Partial<Editable>) {
  await db.notes.update(id, {
    ...changes,
    updatedAt: now(),
    syncState: "pending",
  });
}

// Borrado lógico: la fila queda con deletedAt para poder sincronizarlo después
export async function deleteNote(id: string) {
  const t = now();
  await db.notes.update(id, {
    deletedAt: t,
    updatedAt: t,
    syncState: "pending",
  });
}
