import { db, type Folder } from "./db";
import { newId, now } from "./ids";
import { sanitizeLine } from "./sanitize";

export async function createFolder(
  name: string,
  parentId: string | null = null,
): Promise<string> {
  const id = newId();
  const t = now();
  await db.folders.add({
    id,
    ownerId: null,
    parentId,
    name: sanitizeLine(name),
    createdAt: t,
    updatedAt: t,
    deletedAt: null,
    syncState: "pending",
  });
  return id;
}

export async function renameFolder(id: string, name: string) {
  await db.folders.update(id, {
    name: sanitizeLine(name),
    updatedAt: now(),
    syncState: "pending",
  });
}

/** Ids de la carpeta y todas sus subcarpetas (activas o no). */
export async function folderSubtreeIds(rootId: string): Promise<string[]> {
  const all = await db.folders.toArray();
  const ids = [rootId];
  let frontier = [rootId];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const folder of all) {
      if (folder.parentId && frontier.includes(folder.parentId)) {
        ids.push(folder.id);
        next.push(folder.id);
      }
    }
    frontier = next;
  }
  return ids;
}

/**
 * Borra una carpeta y sus subcarpetas. Las notas de cualquier nivel del
 * subárbol pasan a "Sin carpeta" (no se pierden).
 */
export async function deleteFolder(id: string) {
  const ids = await folderSubtreeIds(id);
  const t = now();

  await db.transaction("rw", db.folders, db.notes, async () => {
    await db.notes
      .filter((note) => note.deletedAt === null && note.folderId !== null)
      .modify((note) => {
        if (note.folderId && ids.includes(note.folderId)) {
          note.folderId = null;
          note.updatedAt = t;
          note.syncState = "pending";
        }
      });

    for (const folderId of ids) {
      await db.folders.update(folderId, {
        deletedAt: t,
        updatedAt: t,
        syncState: "pending",
      });
    }
  });
}

export function folderName(folder: Folder): string {
  return folder.name.trim() || "Sin nombre";
}
