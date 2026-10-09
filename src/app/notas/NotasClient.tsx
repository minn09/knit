"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";
import { NoteEditor } from "@/components/notes/NoteEditor";
import { NotesEmptyState } from "@/components/notes/NotesEmptyState";
import { NotesLayout } from "@/components/notes/NotesLayout";
import {
  type FolderFilter,
  NotesSidebar,
} from "@/components/notes/NotesSidebar";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { PromptDialog } from "@/components/ui/prompt-dialog";
import { db } from "@/lib/db";
import { createFolder, deleteFolder, renameFolder } from "@/lib/folders";
import { createNote, moveNote } from "@/lib/notes";
import {
  filterNotesByTitle,
  listFolders,
  listNotes,
  listTags,
} from "@/lib/queries";
import {
  addTagToNote,
  createTag,
  deleteTag,
  removeTagFromNote,
} from "@/lib/tags";

interface ConfirmState {
  title: string;
  description: string;
  confirmText: string;
  destructive: boolean;
  action: () => void | Promise<void>;
}

export function NotasClient({
  initialNoteId,
}: {
  initialNoteId: string | null;
}) {
  const [selectedId, setSelectedId] = useState<string | null>(initialNoteId);
  const [query, setQuery] = useState("");
  const [folderFilter, setFolderFilter] = useState<FolderFilter>("all");
  const [tagFilter, setTagFilter] = useState<string | null>(null);
  const [draggingNoteId, setDraggingNoteId] = useState<string | null>(null);

  const [folderDialog, setFolderDialog] = useState<{
    id: string | null;
    parentId: string | null;
    initial: string;
  } | null>(null);
  const [tagDialogOpen, setTagDialogOpen] = useState(false);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const notes = useLiveQuery(() => listNotes(), []);
  const folders = useLiveQuery(() => listFolders(), []);
  const tags = useLiveQuery(() => listTags(), []);
  const links = useLiveQuery(
    () => db.noteTags.filter((link) => link.deletedAt === null).toArray(),
    [],
  );

  const selected = notes?.find((note) => note.id === selectedId) ?? null;

  const hasNotes = (notes?.length ?? 0) > 0;
  const trimmedQuery = query.trim();
  const activeFolderName =
    folderFilter !== "all" && folderFilter !== "none"
      ? (folders?.find((folder) => folder.id === folderFilter)?.name ?? null)
      : null;
  const activeTagName = tagFilter
    ? (tags?.find((tag) => tag.id === tagFilter)?.name ?? null)
    : null;

  const noteTagIds = selected
    ? new Set(
        (links ?? [])
          .filter((link) => link.noteId === selected.id)
          .map((link) => link.tagId),
      )
    : new Set<string>();

  const emptyText = trimmedQuery
    ? `Sin resultados para «${trimmedQuery}».`
    : activeFolderName
      ? "Esta carpeta no tiene notas."
      : activeTagName
        ? "Nada con esta etiqueta."
        : hasNotes
          ? "No hay notas en esta vista."
          : "No hay notas todavía.";

  let visible = notes ?? [];
  if (folderFilter === "none") {
    visible = visible.filter((note) => note.folderId === null);
  } else if (folderFilter !== "all") {
    visible = visible.filter((note) => note.folderId === folderFilter);
  }
  if (tagFilter) {
    const ids = new Set(
      (links ?? [])
        .filter((link) => link.tagId === tagFilter)
        .map((link) => link.noteId),
    );
    visible = visible.filter((note) => ids.has(note.id));
  }
  visible = filterNotesByTitle(visible, query);

  async function handleCreateNote() {
    const targetFolder =
      folderFilter !== "all" && folderFilter !== "none" ? folderFilter : null;
    const id = await createNote(targetFolder);
    if (tagFilter) {
      await addTagToNote(id, tagFilter);
    }
    setQuery("");
    setSelectedId(id);
  }

  async function handleDropOnFolder(noteId: string, folderId: string | null) {
    await moveNote(noteId, folderId);
    setDraggingNoteId(null);
  }

  async function handleDropOnTag(noteId: string, tagId: string) {
    await addTagToNote(noteId, tagId);
    setDraggingNoteId(null);
  }

  function handleAddFolder(parentId: string | null) {
    setFolderDialog({ id: null, parentId, initial: "" });
  }

  function handleRenameFolder(id: string) {
    const current = folders?.find((folder) => folder.id === id);
    setFolderDialog({
      id,
      parentId: current?.parentId ?? null,
      initial: current?.name ?? "",
    });
  }

  function handleDeleteFolder(id: string) {
    setConfirm({
      title: "Eliminar carpeta",
      description:
        "Se borrarán las subcarpetas y sus notas pasarán a «Sin carpeta». Esta acción no se puede deshacer.",
      confirmText: "Eliminar",
      destructive: true,
      action: async () => {
        await deleteFolder(id);
        setFolderFilter((current) => (current === id ? "all" : current));
      },
    });
  }

  function handleAddTag() {
    setTagDialogOpen(true);
  }

  function handleDeleteTag(id: string) {
    setConfirm({
      title: "Eliminar tag",
      description: "Se quitará este tag de todas las notas.",
      confirmText: "Eliminar",
      destructive: true,
      action: async () => {
        await deleteTag(id);
        setTagFilter((current) => (current === id ? null : current));
      },
    });
  }

  return (
    <>
      <NotesLayout
        showContent={selected !== null}
        sidebar={
          <NotesSidebar
            notes={visible}
            selectedId={selectedId}
            onSelectNote={setSelectedId}
            folders={folders ?? []}
            activeFolder={folderFilter}
            onSelectFolder={setFolderFilter}
            onAddFolder={handleAddFolder}
            onRenameFolder={handleRenameFolder}
            onDeleteFolder={handleDeleteFolder}
            tags={tags ?? []}
            activeTag={tagFilter}
            onSelectTag={setTagFilter}
            onAddTag={handleAddTag}
            onDeleteTag={handleDeleteTag}
            query={query}
            onQueryChange={setQuery}
            onCreateNote={handleCreateNote}
            draggingNoteId={draggingNoteId}
            onDragStartNote={setDraggingNoteId}
            onDragEndNote={() => setDraggingNoteId(null)}
            onDropOnFolder={handleDropOnFolder}
            onDropOnTag={handleDropOnTag}
            emptyText={emptyText}
          />
        }
      >
        {selected ? (
          <NoteEditor
            key={selected.id}
            note={selected}
            onBack={() => setSelectedId(null)}
            folders={folders ?? []}
            tags={tags ?? []}
            noteTagIds={noteTagIds}
            onMoveFolder={moveNote}
            onToggleTag={(noteId, tagId, active) =>
              active
                ? addTagToNote(noteId, tagId)
                : removeTagFromNote(noteId, tagId)
            }
            onAddTag={handleAddTag}
          />
        ) : notes ? (
          visible.length === 0 ? (
            trimmedQuery ? (
              <NotesEmptyState
                variant="search"
                query={trimmedQuery}
                onClearSearch={() => setQuery("")}
              />
            ) : activeFolderName ? (
              <NotesEmptyState
                variant="folder"
                name={activeFolderName}
                onCreate={handleCreateNote}
              />
            ) : activeTagName ? (
              <NotesEmptyState
                variant="tag"
                name={activeTagName}
                onCreate={handleCreateNote}
              />
            ) : hasNotes ? (
              <NotesEmptyState variant="select" />
            ) : (
              <NotesEmptyState variant="no-notes" onCreate={handleCreateNote} />
            )
          ) : (
            <NotesEmptyState variant="select" />
          )
        ) : null}
      </NotesLayout>

      <PromptDialog
        open={folderDialog !== null}
        title={folderDialog?.id ? "Renombrar carpeta" : "Nueva carpeta"}
        label="Nombre de la carpeta"
        placeholder="Mi carpeta"
        defaultValue={folderDialog?.initial ?? ""}
        confirmText={folderDialog?.id ? "Renombrar" : "Crear"}
        onConfirm={(name) => {
          if (folderDialog?.id) {
            renameFolder(folderDialog.id, name);
          } else {
            createFolder(name, folderDialog?.parentId ?? null);
          }
        }}
        onOpenChange={(open) => {
          if (!open) {
            setFolderDialog(null);
          }
        }}
      />

      <PromptDialog
        open={tagDialogOpen}
        title="Nuevo tag"
        label="Nombre del tag"
        placeholder="Importante"
        confirmText="Crear"
        onConfirm={(name) => createTag(name)}
        onOpenChange={setTagDialogOpen}
      />

      {confirm && (
        <ConfirmDialog
          open
          title={confirm.title}
          description={confirm.description}
          confirmText={confirm.confirmText}
          destructive={confirm.destructive}
          onConfirm={() => {
            confirm.action();
            setConfirm(null);
          }}
          onOpenChange={(open) => {
            if (!open) {
              setConfirm(null);
            }
          }}
        />
      )}
    </>
  );
}
