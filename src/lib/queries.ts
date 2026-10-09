import { db, type Folder, type Note, type Tag, type Task } from "./db";

export interface FolderNode extends Folder {
  children: FolderNode[];
}

export async function listNotes(): Promise<Note[]> {
  const all = await db.notes
    .filter((note) => note.deletedAt === null)
    .toArray();
  return all.sort(
    (a, b) =>
      Number(b.pinned) - Number(a.pinned) ||
      b.updatedAt.localeCompare(a.updatedAt),
  );
}

export function filterNotesByTitle(notes: Note[], query: string): Note[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return notes;
  }
  return notes.filter((note) =>
    (note.title || "Sin título").toLowerCase().includes(q),
  );
}

export function notesInFolder(notes: Note[], folderId: string | null): Note[] {
  return notes.filter((note) => note.folderId === folderId);
}

export function buildFolderTree(folders: Folder[]): FolderNode[] {
  const byId = new Map<string, FolderNode>();
  for (const folder of folders) {
    byId.set(folder.id, { ...folder, children: [] });
  }
  const roots: FolderNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export async function listFolders(): Promise<Folder[]> {
  const all = await db.folders
    .filter((folder) => folder.deletedAt === null)
    .toArray();
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function listTags(): Promise<Tag[]> {
  const all = await db.tags.filter((tag) => tag.deletedAt === null).toArray();
  return all.sort((a, b) => a.name.localeCompare(b.name));
}

export async function tagsForNote(noteId: string): Promise<Tag[]> {
  const links = await db.noteTags
    .filter((link) => link.deletedAt === null && link.noteId === noteId)
    .toArray();
  const tagIds = new Set(links.map((link) => link.tagId));
  const tags = await db.tags.filter((tag) => tag.deletedAt === null).toArray();
  return tags.filter((tag) => tagIds.has(tag.id));
}

export async function notesForTag(tagId: string): Promise<Set<string>> {
  const links = await db.noteTags
    .filter((link) => link.deletedAt === null && link.tagId === tagId)
    .toArray();
  return new Set(links.map((link) => link.noteId));
}

export async function listTasks(): Promise<Task[]> {
  return db.tasks.filter((task) => task.deletedAt === null).toArray();
}

export function tasksForNote(tasks: Task[], noteId: string): Task[] {
  return tasks.filter((task) => task.noteId === noteId);
}
