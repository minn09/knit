"use client";

import { cn } from "cn";
import {
  Check,
  Columns2,
  Eye,
  Folder as FolderIcon,
  Hash,
  Pencil,
  Pin,
  Plus,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { NoteTasksPanel } from "@/components/tasks/NoteTasksPanel";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Folder, Note, Tag } from "@/lib/db";
import { deleteNote, updateNote } from "@/lib/notes";
import { buildFolderTree, type FolderNode } from "@/lib/queries";

type ViewMode = "edit" | "split" | "preview";

const btn =
  "rounded px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800";
const activeBtn = "bg-neutral-200 dark:bg-neutral-800";

function flattenFolders(
  nodes: FolderNode[],
  depth = 0,
): { id: string; name: string; label: string }[] {
  const out: { id: string; name: string; label: string }[] = [];
  for (const node of nodes) {
    out.push({
      id: node.id,
      name: node.name || "Sin nombre",
      label: `${"  ".repeat(depth)}${node.name || "Sin nombre"}`,
    });
    out.push(...flattenFolders(node.children, depth + 1));
  }
  return out;
}

export function NoteEditor({
  note,
  onBack,
  folders,
  tags,
  noteTagIds,
  onMoveFolder,
  onToggleTag,
  onAddTag,
}: {
  note: Note;
  onBack: () => void;
  folders: Folder[];
  tags: Tag[];
  noteTagIds: Set<string>;
  onMoveFolder: (noteId: string, folderId: string | null) => void;
  onToggleTag: (noteId: string, tagId: string, active: boolean) => void;
  onAddTag: () => void;
}) {
  // Estado local para que el cursor no salte; se guarda en IndexedDB en cada cambio.
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [view, setView] = useState<ViewMode>("split");

  const markdown = note.isMarkdown;
  const folderOptions = flattenFolders(buildFolderTree(folders));

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex items-center gap-1 border-b border-neutral-200 p-3 dark:border-neutral-800">
        <button
          type="button"
          onClick={onBack}
          aria-label="Volver"
          className={`${btn} md:hidden`}
        >
          ←
        </button>
        <input
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            updateNote(note.id, { title: event.target.value });
          }}
          placeholder="Título"
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
        />

        <button
          type="button"
          onClick={() => updateNote(note.id, { pinned: !note.pinned })}
          aria-label={note.pinned ? "Desfijar" : "Fijar"}
          title={note.pinned ? "Desfijar" : "Fijar"}
          className={`${btn} ${note.pinned ? "text-neutral-900 dark:text-white" : "text-neutral-400"}`}
        >
          <Pin className="size-4" />
        </button>

        <label className="flex cursor-pointer items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={markdown}
            onChange={(event) => {
              const value = event.target.checked;
              updateNote(note.id, { isMarkdown: value });
              setView(value ? "split" : "edit");
            }}
          />
          MD
        </label>

        {markdown && (
          <div className="flex items-center rounded border border-neutral-200 dark:border-neutral-800">
            <button
              type="button"
              aria-label="Editar"
              title="Editar"
              onClick={() => setView("edit")}
              className={`${btn} ${view === "edit" ? activeBtn : "text-neutral-500"}`}
            >
              <Pencil className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Dividir"
              title="Editar y vista previa"
              onClick={() => setView("split")}
              className={`${btn} ${view === "split" ? activeBtn : "text-neutral-500"}`}
            >
              <Columns2 className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Vista previa"
              title="Vista previa"
              onClick={() => setView("preview")}
              className={`${btn} ${view === "preview" ? activeBtn : "text-neutral-500"}`}
            >
              <Eye className="size-4" />
            </button>
          </div>
        )}

        <button
          type="button"
          aria-label="Borrar nota"
          title="Borrar nota"
          onClick={async () => {
            await deleteNote(note.id);
            onBack();
          }}
          className={`${btn} text-neutral-500`}
        >
          <Trash2 className="size-4" />
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-x-3 gap-y-2 border-b border-neutral-200 px-3 py-2 dark:border-neutral-800">
        <Select
          value={note.folderId ?? "none"}
          onValueChange={(value) =>
            onMoveFolder(note.id, value && value !== "none" ? value : null)
          }
        >
          <SelectTrigger
            size="sm"
            aria-label="Mover a carpeta"
            className="h-7 gap-1 rounded-md px-2 text-xs"
          >
            <FolderIcon className="size-3.5 text-neutral-400" aria-hidden />
            <SelectValue>
              {(value) => {
                if (!value || value === "none") return "Sin carpeta";
                return (
                  folderOptions.find((folder) => folder.id === value)?.name ??
                  "Sin carpeta"
                );
              }}
            </SelectValue>
          </SelectTrigger>
          <SelectContent align="start">
            <SelectItem value="none" label="Sin carpeta">
              Sin carpeta
            </SelectItem>
            {folderOptions.map((folder) => (
              <SelectItem
                key={folder.id}
                value={folder.id}
                label={folder.name || "Sin nombre"}
              >
                {folder.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex min-w-0 flex-wrap items-center gap-1.5">
          <Hash className="size-3.5 shrink-0 text-neutral-400" aria-hidden />
          {tags.map((tag) => {
            const active = noteTagIds.has(tag.id);
            return (
              <button
                key={tag.id}
                type="button"
                aria-pressed={active}
                title={
                  active
                    ? `Quitar etiqueta ${tag.name}`
                    : `Agregar etiqueta ${tag.name}`
                }
                onClick={() => onToggleTag(note.id, tag.id, !active)}
                className={cn(
                  "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs transition-all duration-200",
                  active
                    ? "bg-neutral-900 text-white dark:bg-white dark:text-neutral-900"
                    : "bg-neutral-100 text-neutral-500 hover:bg-neutral-200 hover:text-neutral-900 dark:bg-neutral-800 dark:text-neutral-400 dark:hover:bg-neutral-700 dark:hover:text-white",
                )}
              >
                {active && <Check className="size-3" aria-hidden />}
                <span className="max-w-32 truncate">{tag.name}</span>
              </button>
            );
          })}
          <button
            type="button"
            onClick={onAddTag}
            aria-label="Crear etiqueta"
            className="inline-flex items-center gap-1 rounded-full border border-dashed border-neutral-300 px-2 py-0.5 text-xs text-neutral-500 transition-colors hover:border-neutral-400 hover:text-neutral-900 dark:border-neutral-700 dark:text-neutral-400 dark:hover:border-neutral-500 dark:hover:text-white"
          >
            <Plus className="size-3" aria-hidden />
            <span>Nueva etiqueta</span>
          </button>
        </div>
      </div>

      <div className="min-h-0 flex-1">
        {markdown && view === "preview" ? (
          <article className="prose dark:prose-invert h-full max-w-none overflow-y-auto p-4">
            <ReactMarkdown>{content}</ReactMarkdown>
          </article>
        ) : markdown && view === "split" ? (
          <div className="flex h-full flex-col md:grid md:grid-cols-2">
            <textarea
              value={content}
              onChange={(event) => {
                setContent(event.target.value);
                updateNote(note.id, { content: event.target.value });
              }}
              placeholder="Escribe en markdown…"
              spellCheck={false}
              className="h-full min-h-0 flex-1 resize-none bg-transparent p-4 font-mono text-sm outline-none"
            />
            <article className="prose dark:prose-invert hidden h-full max-w-none overflow-y-auto border-l border-neutral-200 p-4 md:block dark:border-neutral-800">
              <ReactMarkdown>{content}</ReactMarkdown>
            </article>
          </div>
        ) : (
          <textarea
            value={content}
            onChange={(event) => {
              setContent(event.target.value);
              updateNote(note.id, { content: event.target.value });
            }}
            placeholder="Escribe aquí…"
            spellCheck={false}
            className="h-full w-full resize-none bg-transparent p-4 font-mono text-sm outline-none"
          />
        )}
      </div>

      <NoteTasksPanel noteId={note.id} />
    </div>
  );
}
