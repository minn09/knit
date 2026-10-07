"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import type { Note } from "@/lib/db";
import { deleteNote, updateNote } from "@/lib/notes";

const btn =
  "rounded px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800";

export function NoteEditor({
  note,
  onBack,
}: {
  note: Note;
  onBack: () => void;
}) {
  // Estado local para que el cursor no salte; se guarda en IndexedDB en cada cambio
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const [preview, setPreview] = useState(false);

  const showPreview = note.isMarkdown && preview;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center gap-2 border-b border-neutral-200 p-3 dark:border-neutral-800">
        <button type="button" onClick={onBack} className={`${btn} md:hidden`}>
          ←
        </button>
        <input
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            updateNote(note.id, { title: e.target.value });
          }}
          placeholder="Título"
          className="min-w-0 flex-1 bg-transparent text-lg font-semibold outline-none"
        />
        <button
          type="button"
          onClick={() => updateNote(note.id, { pinned: !note.pinned })}
          className={btn}
        >
          {note.pinned ? "Desfijar" : "Fijar"}
        </button>
        <label className="flex items-center gap-1 text-sm">
          <input
            type="checkbox"
            checked={note.isMarkdown}
            onChange={(e) =>
              updateNote(note.id, { isMarkdown: e.target.checked })
            }
          />
          MD
        </label>
        {note.isMarkdown && (
          <button
            type="button"
            onClick={() => setPreview((p) => !p)}
            className={btn}
          >
            {preview ? "Editar" : "Vista previa"}
          </button>
        )}
        <button
          type="button"
          onClick={async () => {
            await deleteNote(note.id);
            onBack();
          }}
          className={btn}
        >
          Borrar
        </button>
      </div>

      {showPreview ? (
        <article className="prose dark:prose-invert max-w-none flex-1 overflow-y-auto p-4">
          <ReactMarkdown>{content}</ReactMarkdown>
        </article>
      ) : (
        <textarea
          value={content}
          onChange={(e) => {
            setContent(e.target.value);
            updateNote(note.id, { content: e.target.value });
          }}
          placeholder="Escribe aquí..."
          className="flex-1 resize-none bg-transparent p-4 font-mono text-sm outline-none"
        />
      )}
    </div>
  );
}
