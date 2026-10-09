"use client";

import {
  ChevronDown,
  ChevronRight,
  Hash,
  Plus,
  Search,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AuthButton } from "@/components/auth/AuthButton";
import { SyncStatus } from "@/components/sync/SyncStatus";
import type { Folder, Note, Tag } from "@/lib/db";
import { buildFolderTree, type FolderNode } from "@/lib/queries";
import { NotesList } from "./NotesList";

export type FolderFilter = "all" | "none" | string;

const rowBase =
  "flex w-full items-center gap-2 rounded px-2 py-1 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900";

function FolderRow({
  node,
  depth,
  activeFolder,
  onSelectFolder,
  onAddChild,
  onRenameFolder,
  onDeleteFolder,
}: {
  node: FolderNode;
  depth: number;
  activeFolder: FolderFilter;
  onSelectFolder: (id: string) => void;
  onAddChild: (parentId: string) => void;
  onRenameFolder: (id: string) => void;
  onDeleteFolder: (id: string) => void;
}) {
  const [open, setOpen] = useState(true);
  const hasChildren = node.children.length > 0;

  return (
    <li>
      <div
        className={`group ${rowBase} ${
          activeFolder === node.id ? "bg-neutral-100 dark:bg-neutral-900" : ""
        }`}
        style={{ paddingLeft: 8 + depth * 12 }}
      >
        <button
          type="button"
          aria-label={open ? "Contraer" : "Expandir"}
          onClick={() => setOpen((value) => !value)}
          className="shrink-0 text-neutral-400"
        >
          {hasChildren ? (
            open ? (
              <ChevronDown className="h-3.5 w-3.5" />
            ) : (
              <ChevronRight className="h-3.5 w-3.5" />
            )
          ) : (
            <span className="block h-3.5 w-3.5" />
          )}
        </button>
        <button
          type="button"
          onClick={() => onSelectFolder(node.id)}
          onDoubleClick={() => onRenameFolder(node.id)}
          className="flex-1 truncate text-left"
        >
          {node.name || "Sin nombre"}
        </button>
        <button
          type="button"
          aria-label="Nueva subcarpeta"
          onClick={() => onAddChild(node.id)}
          className="shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Borrar carpeta"
          onClick={() => onDeleteFolder(node.id)}
          className="shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
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
              onSelectFolder={onSelectFolder}
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
}) {
  const tree = buildFolderTree(folders);

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center justify-between p-3">
        <h1 className="font-semibold">Notas</h1>
        <div className="flex items-center gap-3">
          <Link
            href="/tareas"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Tareas
          </Link>
          <button
            type="button"
            onClick={onCreateNote}
            className="rounded bg-neutral-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-neutral-900"
          >
            Nueva
          </button>
        </div>
      </div>

      <div className="px-3 pb-2">
        <div className="flex items-center gap-2 rounded border border-neutral-200 px-2 py-1 dark:border-neutral-800">
          <Search className="h-4 w-4 shrink-0 text-neutral-400" />
          <input
            value={query}
            onChange={(event) => onQueryChange(event.target.value)}
            placeholder="Buscar por título"
            className="min-w-0 flex-1 bg-transparent py-0.5 text-sm outline-none"
          />
        </div>
      </div>

      <nav className="max-h-64 shrink-0 overflow-y-auto px-3 pb-2">
        <button
          type="button"
          onClick={() => onSelectFolder("all")}
          className={`${rowBase} ${
            activeFolder === "all" ? "bg-neutral-100 dark:bg-neutral-900" : ""
          }`}
        >
          Todas las notas
        </button>

        {tree.map((node) => (
          <ul key={node.id}>
            <FolderRow
              node={node}
              depth={0}
              activeFolder={activeFolder}
              onSelectFolder={onSelectFolder}
              onAddChild={onAddFolder}
              onRenameFolder={onRenameFolder}
              onDeleteFolder={onDeleteFolder}
            />
          </ul>
        ))}

        <div className="mt-1 flex items-center gap-1">
          <button
            type="button"
            onClick={() => onSelectFolder("none")}
            className={`${rowBase} flex-1 ${
              activeFolder === "none"
                ? "bg-neutral-100 dark:bg-neutral-900"
                : ""
            }`}
          >
            Sin carpeta
          </button>
          <button
            type="button"
            aria-label="Nueva carpeta"
            onClick={() => onAddFolder(null)}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-3 flex items-center justify-between px-2">
          <span className="text-xs font-medium uppercase tracking-wide text-neutral-500">
            Tags
          </span>
          <button
            type="button"
            aria-label="Nuevo tag"
            onClick={onAddTag}
            className="rounded p-1 text-neutral-400 hover:bg-neutral-100 dark:hover:bg-neutral-900"
          >
            <Plus className="h-4 w-4" />
          </button>
        </div>
        {tags.length === 0 && (
          <p className="px-2 py-1 text-xs text-neutral-500">
            Sin tags todavía.
          </p>
        )}
        {tags.map((tag) => (
          <div key={tag.id} className="group flex items-center gap-1">
            <button
              type="button"
              onClick={() => onSelectTag(activeTag === tag.id ? null : tag.id)}
              className={`${rowBase} flex-1 ${
                activeTag === tag.id ? "bg-neutral-100 dark:bg-neutral-900" : ""
              }`}
            >
              <Hash className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
              <span className="truncate">{tag.name}</span>
            </button>
            <button
              type="button"
              aria-label="Borrar tag"
              onClick={() => onDeleteTag(tag.id)}
              className="shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        ))}
      </nav>

      <NotesList
        notes={notes}
        selectedId={selectedId}
        onSelect={onSelectNote}
      />

      <div className="flex items-center justify-between gap-2 border-t border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <AuthButton />
        <SyncStatus />
      </div>
    </div>
  );
}
