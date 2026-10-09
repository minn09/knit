"use client";

import { Pin } from "lucide-react";
import type { Note } from "@/lib/db";

function excerpt(content: string): string {
  const line = content
    .split("\n")
    .map((row) => row.replace(/^[#>*\-\s]+/, "").trim())
    .find((row) => row.length > 0);
  return line ?? "Nota vacía";
}

export function NotesList({
  notes,
  selectedId,
  onSelect,
}: {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}) {
  if (notes.length === 0) {
    return (
      <p className="px-3 py-4 text-sm text-neutral-500 dark:text-neutral-400">
        No hay notas en esta vista.
      </p>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {notes.map((note) => {
        const active = note.id === selectedId;
        return (
          <li key={note.id}>
            <button
              type="button"
              onClick={() => onSelect(note.id)}
              className={`w-full border-b border-neutral-100 px-3 py-2 text-left hover:bg-neutral-100 dark:border-neutral-900 dark:hover:bg-neutral-900 ${
                active ? "bg-neutral-100 dark:bg-neutral-900" : ""
              }`}
            >
              <span className="flex items-center gap-2">
                {note.pinned && (
                  <Pin className="h-3.5 w-3.5 shrink-0 text-neutral-400" />
                )}
                <span className="truncate text-sm font-medium">
                  {note.title || "Sin título"}
                </span>
              </span>
              <span className="mt-0.5 block truncate text-xs text-neutral-500 dark:text-neutral-400">
                {excerpt(note.content)}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
