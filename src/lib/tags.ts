import { db, type Tag } from "./db";
import { newId, now } from "./ids";
import { sanitizeLine } from "./sanitize";

export async function createTag(name: string): Promise<string> {
  const clean = sanitizeLine(name);
  const existing = await db.tags
    .filter((tag) => tag.deletedAt === null && tag.name === clean)
    .first();
  if (existing) {
    return existing.id;
  }

  const id = newId();
  const t = now();
  await db.tags.add({
    id,
    ownerId: null,
    name: clean,
    createdAt: t,
    updatedAt: t,
    deletedAt: null,
    syncState: "pending",
  });
  return id;
}

export async function renameTag(id: string, name: string) {
  await db.tags.update(id, {
    name: sanitizeLine(name),
    updatedAt: now(),
    syncState: "pending",
  });
}

/** Borra el tag y todas sus relaciones con notas. */
export async function deleteTag(id: string) {
  const t = now();
  await db.transaction("rw", db.tags, db.noteTags, async () => {
    await db.noteTags
      .filter((link) => link.deletedAt === null && link.tagId === id)
      .modify((link) => {
        link.deletedAt = t;
        link.updatedAt = t;
        link.syncState = "pending";
      });
    await db.tags.update(id, {
      deletedAt: t,
      updatedAt: t,
      syncState: "pending",
    });
  });
}

export async function addTagToNote(noteId: string, tagId: string) {
  const id = `${noteId}:${tagId}`;
  const t = now();
  const existing = await db.noteTags.get(id);
  if (existing) {
    await db.noteTags.update(id, {
      deletedAt: null,
      updatedAt: t,
      syncState: "pending",
    });
    return;
  }
  await db.noteTags.add({
    id,
    ownerId: null,
    noteId,
    tagId,
    createdAt: t,
    updatedAt: t,
    deletedAt: null,
    syncState: "pending",
  });
}

export async function removeTagFromNote(noteId: string, tagId: string) {
  const id = `${noteId}:${tagId}`;
  const t = now();
  await db.noteTags.update(id, {
    deletedAt: t,
    updatedAt: t,
    syncState: "pending",
  });
}

export function tagName(tag: Tag): string {
  return tag.name.trim() || "sin-tag";
}
