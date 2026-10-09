"use client";

import { cn } from "cn";
import {
  ChevronDown,
  ChevronRight,
  Folder as FolderIcon,
  FolderX,
  Hash,
  LayoutList,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { type DragEvent, useRef, useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { SyncStatus } from "@/components/sync/SyncStatus";
import { Button } from "@/components/ui/button";
import type { Folder, Note, Tag } from "@/lib/db";
import { buildFolderTree, type FolderNode } from "@/lib/queries";
import { NotesList } from "./NotesList";

export type FolderFilter = "all" | "none" | string;

const rowBase =
  "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm";

const ctrlFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring/70";

const activeRow = "bg-muted font-medium";
const hoverRow = "hover:bg-muted/60";
const dragHint =
  "outline-1 outline-dashed -outline-offset-2 outline-neutral-300 dark:outline-neutral-700";
const dragTarget = "bg-primary/10 ring-2 ring-inset ring-primary/60";

/** Estado de "estoy pasando por encima con una nota arrastrada". */
function useDragTarget(draggingNoteId: string | null) {
  const [isDragOver, setIsDragOver] = useState(false);
  const enterDepth = useRef(0);

  return {
    isDragOver,
    handlers: {
      onDragEnter: (event: DragEvent<HTMLDivElement>) => {
        if (!draggingNoteId) return;
        event.preventDefault();
        enterDepth.current += 1;
        setIsDragOver(true);
      },
      onDragLeave: () => {
        enterDepth.current = Math.max(0, enterDepth.current - 1);
        if (enterDepth.current === 0) setIsDragOver(false);
      },
      onDragOver: (event: DragEvent<HTMLDivElement>) => {
        if (draggingNoteId) {
          event.preventDefault();
          event.dataTransfer.dropEffect = "move";
        }
      },
      onDrop: (
        event: DragEvent<HTMLDivElement>,
        onDrop: (id: string) => void,
      ) => {
        event.preventDefault();
        enterDepth.current = 0;
        setIsDragOver(false);
        const id = draggingNoteId ?? event.dataTransfer.getData("text/plain");
        if (id) onDrop(id);
      },
    },
  };
}

/** Barecita de acento (color primario) que marca la fila activa. */
function AccentBar({ left = 8 }: { left?: number }) {
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute bottom-1.5 top-1.5 w-0.5 rounded-full bg-primary"
      style={{ left }}
    />
  );
}

function FolderRow({
  node,
  depth,
  activeFolder,
  draggingNoteId,
  onSelectFolder,
  onDropOnFolder,
  onAddChild,
  onRenameFolder,
  onDeleteFolder,
}: {
  node: FolderNode;
  depth: number;
  activeFolder: FolderFilter;
  draggingNoteId: string | null;
  onSelectFolder: (id: string) => void;
  onDropOnFolder: (noteId: string, folderId: string) => void;
  onAddChild: (parentId: string) => void;
  onRenameFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;
  const active = activeFolder === node.id;
  const { isDragOver, handlers } = useDragTarget(draggingNoteId);
  const indent = 8 + depth * 16;

  return (
    <li>
      {/* biome-ignore lint/a11y/noStaticElementInteractions: el botón interno maneja teclado/clic; esta capa solo recibe drag & drop */}
      <div
        onDragEnter={handlers.onDragEnter}
        onDragLeave={handlers.onDragLeave}
        onDragOver={handlers.onDragOver}
        onDrop={(event) =>
          handlers.onDrop(event, (id) => onDropOnFolder(id, node.id))
        }
        className={cn(
          "group relative flex w-full items-center gap-1 rounded-md py-1.5 pr-1 transition-all duration-200",
          active && !isDragOver && activeRow,
          !active && !isDragOver && hoverRow,
          draggingNoteId && !isDragOver && !active && dragHint,
          isDragOver && dragTarget,
        )}
        style={{ paddingLeft: indent }}
      >
        {active && <AccentBar left={indent} />}

        <button
          type="button"
          aria-label={open ? `Contraer ${node.name}` : `Expandir ${node.name}`}
          onClick={(event) => {
            event.stopPropagation();
            setOpen((value) => !value);
          }}
          className={cn("shrink-0 rounded text-neutral-400", ctrlFocus)}
        >
          {hasChildren ? (
            open ? (
              <ChevronDown className="size-3.5" />
            ) : (
              <ChevronRight className="size-3.5" />
            )
          ) : (
            <span className="block size-3.5" />
          )}
        </button>

        <FolderIcon
          className="size-3.5 shrink-0 text-neutral-400"
          aria-hidden
        />

        <button
          type="button"
          onClick={(event) => {
            event.stopPropagation();
            onSelectFolder(node.id);
          }}
          className={cn(
            "min-w-0 flex-1 truncate text-left transition-colors",
            active ? "font-medium" : "",
            ctrlFocus,
          )}
        >
          {node.name || "Sin nombre"}
        </button>

        <button
          type="button"
          aria-label={`Nueva subcarpeta en ${node.name || "Sin nombre"}`}
          onClick={(event) => {
            event.stopPropagation();
            onAddChild(node.id);
          }}
          className={cn(
            "shrink-0 rounded p-0.5 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            ctrlFocus,
          )}
        >
          <Plus className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Renombrar carpeta ${node.name || "Sin nombre"}`}
          onClick={(event) => {
            event.stopPropagation();
            onRenameFolder(node.id);
          }}
          className={cn(
            "shrink-0 rounded p-0.5 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
            ctrlFocus,
          )}
        >
          <Pencil className="size-3.5" />
        </button>
        <button
          type="button"
          aria-label={`Borrar carpeta ${node.name || "Sin nombre"}`}
          onClick={(event) => {
            event.stopPropagation();
            onDeleteFolder(node.id);
          }}
          className={cn(
            "shrink-0 rounded p-0.5 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-destructive",
            ctrlFocus,
          )}
        >
          <Trash2 className="size-3.5" />
        </button>
      </div>

      {open && hasChildren && (
        <ul>
          {node.children.map((child) => (
            <FolderRow
              key={child.id}
              node={child}
              depth={depth + 1}
              activeFolder={activeFolder}
              draggingNoteId={draggingNoteId}
              onSelectFolder={onSelectFolder}
              onDropOnFolder={onDropOnFolder}
              onAddChild={onAddChild}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </ul>
      )}
    </li>
  );
}

function TagRow({
  tag,
  activeTag,
  draggingNoteId,
  onSelectTag,
  onDropOnTag,
  onDeleteTag,
}: {
  tag: Tag;
  activeTag: string | null;
  draggingNoteId: string | null;
  onSelectTag: (id: string | null) => void;
  onDropOnTag: (noteId: string, tagId: string) => void;
  onDeleteTag: (id: string) => void;
}) {
  const active = activeTag === tag.id;
  const { isDragOver, handlers } = useDragTarget(draggingNoteId);

  return (
    // biome-ignore lint/a11y/noStaticElementInteractions: el botón interno maneja teclado/clic; esta capa solo recibe drag & drop
    <div
      onDragEnter={handlers.onDragEnter}
      onDragLeave={handlers.onDragLeave}
      onDragOver={handlers.onDragOver}
      onDrop={(event) =>
        handlers.onDrop(event, (id) => onDropOnTag(id, tag.id))
      }
      className={cn(
        "group relative flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition-all duration-200",
        active && !isDragOver && activeRow,
        !active && !isDragOver && hoverRow,
        draggingNoteId && !isDragOver && !active && dragHint,
        isDragOver && dragTarget,
      )}
    >
      {active && <AccentBar />}
      <Hash className="size-3.5 shrink-0 text-neutral-400" aria-hidden />
      <button
        type="button"
        onClick={(event) => {
          event.stopPropagation();
          onSelectTag(active ? null : tag.id);
        }}
        className={cn(
          "min-w-0 flex-1 truncate text-left transition-colors",
          active ? "font-medium" : "",
          ctrlFocus,
        )}
      >
        {tag.name}
      </button>
      <button
        type="button"
        aria-label={`Quitar tag ${tag.name}`}
        onClick={(event) => {
          event.stopPropagation();
          onDeleteTag(tag.id);
        }}
        className={cn(
          "shrink-0 rounded p-0.5 text-neutral-400 opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100 hover:text-destructive",
          ctrlFocus,
        )}
      >
        <Trash2 className="size-3.5" />
      </button>
    </div>
  );
}

export function NotesSidebar({
  notes,
  selectedId,
  onSelectNote,
  folders,
  activeFolder,
  onSelectFolder,
  onAddFolder,
  onRenameFolder,
  onDeleteFolder,
  tags,
  activeTag,
  onSelectTag,
  onAddTag,
  onDeleteTag,
  query,
  onQueryChange,
  onCreateNote,
  draggingNoteId,
  onDragStartNote,
  onDragEndNote,
  onDropOnFolder,
  onDropOnTag,
  emptyText,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelectNote: (id: string) => void;
  folders: Folder[];
  activeFolder: FolderFilter;
  onSelectFolder: (id: FolderFilter) => void;
  onAddFolder: (parentId: string | null) => void;
  onRenameFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
  tags: Tag[];
  activeTag: string | null;
  onSelectTag: (id: string | null) => void;
  onAddTag: () => void;
  onDeleteTag: (id: string) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onCreateNote: () => void;
  draggingNoteId: string | null;
  onDragStartNote: (id: string) => void;
  onDragEndNote: () => void;
  onDropOnFolder: (noteId: string, folderId: string | null) => void;
  onDropOnTag: (noteId: string, tagId: string) => void;
  emptyText: string;
}) {
  const tree = buildFolderTree(folders);
  const noneRow = useDragTarget(draggingNoteId);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <header className="flex items-center justify-between px-3 pt-3 pb-2">
        <h1 className="font-semibold">Notas</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/tareas"
            className="text-sm text-neutral-500 transition-colors hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Tareas
          </Link>
          <Button size="sm" onClick={onCreateNote}>
            <Plus data-icon="inline-start" className="size-3.5" />
            Nueva
          </Button>
        </div>
      </header>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded-lg border border-border bg-background/60 px-2 py-1 transition-colors focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/50">
          <Search className="size-4 shrink-0 text-neutral-400" aria-hidden />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por título"
            aria-label="Buscar notas por título"
            className="min-w-0 flex-1 bg-transparent py-0.5 text-sm outline-none"
          />
        </div>
      </div>

      <nav className="max-h-64 shrink-0 overflow-y-auto px-2 pb-2">
        <button
          type="button"
          onClick={() => onSelectFolder("all")}
          className={cn(
            rowBase,
            "relative cursor-pointer transition-all duration-200",
            activeFolder === "all" ? activeRow : hoverRow,
            ctrlFocus,
          )}
        >
          {activeFolder === "all" && <AccentBar />}
          <LayoutList
            className="size-3.5 shrink-0 text-neutral-400"
            aria-hidden
          />
          <span className="min-w-0 flex-1 truncate">Todas las notas</span>
        </button>

        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Carpetas
          </span>
          <button
            type="button"
            aria-label="Nueva carpeta"
            onClick={() => onAddFolder(null)}
            className={cn(
              "rounded-md p-1 text-neutral-500 transition-colors hover:bg-muted hover:text-foreground",
              ctrlFocus,
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>

        {tree.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Sin carpetas todavía. Crea una con el botón «+».
          </p>
        )}

        <ul>
          {tree.map((node) => (
            <FolderRow
              key={node.id}
              node={node}
              depth={0}
              activeFolder={activeFolder}
              draggingNoteId={draggingNoteId}
              onSelectFolder={onSelectFolder}
              onDropOnFolder={onDropOnFolder}
              onAddChild={onAddFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          ))}
        </ul>

        {/* biome-ignore lint/a11y/noStaticElementInteractions: el botón interno maneja teclado/clic; esta capa solo recibe drag & drop */}
        <div
          onDragEnter={noneRow.handlers.onDragEnter}
          onDragLeave={noneRow.handlers.onDragLeave}
          onDragOver={noneRow.handlers.onDragOver}
          onDrop={(event) =>
            noneRow.handlers.onDrop(event, (id) => onDropOnFolder(id, null))
          }
          className={cn(
            rowBase,
            "relative transition-all duration-200",
            activeFolder === "none" && !noneRow.isDragOver && activeRow,
            activeFolder !== "none" && !noneRow.isDragOver && hoverRow,
            draggingNoteId &&
              !noneRow.isDragOver &&
              activeFolder !== "none" &&
              dragHint,
            noneRow.isDragOver && dragTarget,
          )}
        >
          {activeFolder === "none" && <AccentBar />}
          <FolderX className="size-3.5 shrink-0 text-neutral-400" aria-hidden />
          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              onSelectFolder("none");
            }}
            className={cn(
              "min-w-0 flex-1 truncate text-left transition-colors",
              activeFolder === "none" ? "font-medium" : "",
              ctrlFocus,
            )}
          >
            Sin carpeta
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-1">
          <span className="text-xs font-semibold uppercase tracking-wide text-neutral-500 dark:text-neutral-400">
            Etiquetas
          </span>
          <button
            type="button"
            aria-label="Nueva etiqueta"
            onClick={onAddTag}
            className={cn(
              "rounded-md p-1 text-neutral-500 transition-colors hover:bg-muted hover:text-foreground",
              ctrlFocus,
            )}
          >
            <Plus className="size-4" />
          </button>
        </div>

        {tags.length === 0 && (
          <p className="px-2 py-1.5 text-xs text-neutral-500 dark:text-neutral-400">
            Sin etiquetas todavía. Crea una con el botón «+».
          </p>
        )}

        {tags.map((tag) => (
          <TagRow
            key={tag.id}
            tag={tag}
            activeTag={activeTag}
            draggingNoteId={draggingNoteId}
            onSelectTag={onSelectTag}
            onDropOnTag={onDropOnTag}
            onDeleteTag={onDeleteTag}
          />
        ))}
      </nav>

      <NotesList
        notes={notes}
        selectedId={selectedId}
        onSelect={onSelectNote}
        draggingNoteId={draggingNoteId}
        onDragStartNote={onDragStartNote}
        onDragEndNote={onDragEndNote}
        emptyText={emptyText}
      />

      <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <AuthButton />
        <SyncStatus />
      </div>
    </div>
  );
}
