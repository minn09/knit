import { db, type Note } from "./db";
import { newId, now } from "./ids";
import { sanitizeBody, sanitizeLine } from "./sanitize";

export async function createNote(
  folderId: string | null = null,
): Promise<string> {
  const id = newId();
  const t = now();
  await db.notes.add({
    id,
    ownerId: null,
    folderId,
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

type Editable = Pick<
  Note,
  "title" | "content" | "isMarkdown" | "pinned" | "folderId"
>;

export async function updateNote(id: string, changes: Partial<Editable>) {
  const clean: Partial<Editable> = { ...changes };
  if (clean.title !== undefined) {
    clean.title = sanitizeLine(clean.title);
  }
  if (clean.content !== undefined) {
    clean.content = sanitizeBody(clean.content);
  }
  await db.notes.update(id, {
    ...clean,
    updatedAt: now(),
    syncState: "pending",
  });
}

export async function togglePinned(id: string, pinned: boolean) {
  await updateNote(id, { pinned });
}

export async function moveNote(id: string, folderId: string | null) {
  await updateNote(id, { folderId });
}

/**
 * Borrado lógico de la nota. Sus tareas sobreviven y quedan sin nota
 * para no perder trabajo.
 */
export async function deleteNote(id: string) {
  const t = now();
  await db.transaction("rw", db.notes, db.noteTags, db.tasks, async () => {
    await db.notes.update(id, {
      deletedAt: t,
      updatedAt: t,
      syncState: "pending",
    });

    await db.noteTags
      .filter((link) => link.deletedAt === null && link.noteId === id)
      .modify((link) => {
        link.deletedAt = t;
        link.updatedAt = t;
        link.syncState = "pending";
      });

    await db.tasks
      .filter((task) => task.deletedAt === null && task.noteId === id)
      .modify((task) => {
        task.noteId = null;
        task.updatedAt = t;
        task.syncState = "pending";
      });
  });
}
