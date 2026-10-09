"use client";

import { Columns2, Eye, Pencil, Pin, Trash2 } from "lucide-react";
import { useState } from "react";
import ReactMarkdown from "react-markdown";
import { NoteTasksPanel } from "@/components/tasks/NoteTasksPanel";
import type { Note } from "@/lib/db";
import { deleteNote, updateNote } from "@/lib/notes";

type ViewMode = "edit" | "split" | "preview";

const btn =
  "rounded px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800";
const activeBtn = "bg-neutral-200 dark:bg-neutral-800";

export function NoteEditor({
  note,
  onBack,
}: {
  note: Note;
  onBack: () => void;
}) {
  // Estado local para que el cursor no salte; se guarda en IndexedDB en cada cambio.
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [view, setView] = useState<ViewMode>("split");

  const markdown = note.isMarkdown;

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
          <Pin className="h-4 w-4" />
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
              <Pencil className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Dividir"
              title="Editar y vista previa"
              onClick={() => setView("split")}
              className={`${btn} ${view === "split" ? activeBtn : "text-neutral-500"}`}
            >
              <Columns2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              aria-label="Vista previa"
              title="Vista previa"
              onClick={() => setView("preview")}
              className={`${btn} ${view === "preview" ? activeBtn : "text-neutral-500"}`}
            >
              <Eye className="h-4 w-4" />
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
          <Trash2 className="h-4 w-4" />
        </button>
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
            className="h-full resize-none bg-transparent p-4 font-mono text-sm outline-none"
          />
        )}
      </div>

      <NoteTasksPanel noteId={note.id} />
    </div>
  );
}
