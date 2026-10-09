import type { Folder, Note, NoteTag, Tag, Task } from "@/lib/db";

export type Syncable = Folder | Note | Tag | NoteTag | Task;
export type RemoteRow = Record<string, unknown>;

export type LocalTable = "folders" | "notes" | "tags" | "noteTags" | "tasks";

export interface TableSpec {
  local: LocalTable;
  remote: string;
  upstream: (row: Syncable, userId: string) => RemoteRow;
  downstream: (row: RemoteRow, userId: string) => Syncable;
}

const str = (value: unknown): string =>
  typeof value === "string" ? value : "";
const strOrNull = (value: unknown): string | null =>
  typeof value === "string" ? value : null;

function baseUpstream(
  row: Syncable & { createdAt?: string },
  userId: string,
  extra: RemoteRow,
): RemoteRow {
  return {
    id: row.id,
    user_id: userId,
    updated_at: row.updatedAt,
    deleted_at: row.deletedAt,
    ...extra,
  };
}

export const TABLE_SPECS: TableSpec[] = [
  {
    local: "folders",
    remote: "folders",
    upstream: (row, userId) => {
      const folder = row as Folder;
      return baseUpstream(folder, userId, {
        parent_id: folder.parentId,
        name: folder.name,
        created_at: folder.createdAt,
      });
    },
    downstream: (row, userId) => ({
      id: str(row.id),
      ownerId: userId,
      parentId: strOrNull(row.parent_id),
      name: str(row.name),
      createdAt: str(row.created_at),
      updatedAt: str(row.updated_at),
      deletedAt: strOrNull(row.deleted_at),
      syncState: "synced",
    }),
  },
  {
    local: "notes",
    remote: "notes",
    upstream: (row, userId) => {
      const note = row as Note;
      return baseUpstream(note, userId, {
        folder_id: note.folderId,
        title: note.title,
        content: note.content,
        is_markdown: note.isMarkdown,
        pinned: note.pinned,
        created_at: note.createdAt,
      });
    },
    downstream: (row, userId) => ({
      id: str(row.id),
      ownerId: userId,
      folderId: strOrNull(row.folder_id),
      title: str(row.title),
      content: str(row.content),
      isMarkdown: row.is_markdown !== false,
      pinned: row.pinned === true,
      createdAt: str(row.created_at),
      updatedAt: str(row.updated_at),
      deletedAt: strOrNull(row.deleted_at),
      syncState: "synced",
    }),
  },
  {
    local: "tags",
    remote: "tags",
    upstream: (row, userId) => {
      const tag = row as Tag;
      return baseUpstream(tag, userId, {
        name: tag.name,
        created_at: tag.createdAt,
      });
    },
    downstream: (row, userId) => ({
      id: str(row.id),
      ownerId: userId,
      name: str(row.name),
      createdAt: str(row.created_at),
      updatedAt: str(row.updated_at),
      deletedAt: strOrNull(row.deleted_at),
      syncState: "synced",
    }),
  },
  {
    local: "noteTags",
    remote: "note_tags",
    upstream: (row, userId) => {
      const link = row as NoteTag;
      return baseUpstream(link, userId, {
        note_id: link.noteId,
        tag_id: link.tagId,
      });
    },
    downstream: (row, userId) => ({
      id: str(row.id),
      ownerId: userId,
      noteId: str(row.note_id),
      tagId: str(row.tag_id),
      createdAt: str(row.updated_at),
      updatedAt: str(row.updated_at),
      deletedAt: strOrNull(row.deleted_at),
      syncState: "synced",
    }),
  },
  {
    local: "tasks",
    remote: "tasks",
    upstream: (row, userId) => {
      const task = row as Task;
      return baseUpstream(task, userId, {
        note_id: task.noteId,
        parent_id: task.parentId,
        title: task.title,
        done: task.done,
        created_at: task.createdAt,
      });
    },
    downstream: (row, userId) => ({
      id: str(row.id),
      ownerId: userId,
      noteId: strOrNull(row.note_id),
      parentId: strOrNull(row.parent_id),
      title: str(row.title),
      done: row.done === true,
      createdAt: str(row.created_at),
      updatedAt: str(row.updated_at),
      deletedAt: strOrNull(row.deleted_at),
      syncState: "synced",
    }),
  },
];
