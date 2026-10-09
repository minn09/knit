"use client";

import { cn } from "cn";
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
  draggingNoteId = null,
  onDragStartNote,
  onDragEndNote,
  emptyText = "No hay notas en esta vista.",
}: {
  notes: Note[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  draggingNoteId?: string | null;
  onDragStartNote?: (id: string) => void;
  onDragEndNote?: () => void;
  emptyText?: string;
}) {
  if (notes.length === 0) {
    return (
      <p className="px-3 py-4 text-sm text-neutral-500 dark:text-neutral-400">
        {emptyText}
      </p>
    );
  }

  return (
    <ul className="flex-1 overflow-y-auto">
      {notes.map((note) => {
        const active = note.id === selectedId;
        const isDragging = draggingNoteId === note.id;
        return (
          <li key={note.id}>
            <button
              type="button"
              draggable
              onClick={() => onSelect(note.id)}
              onDragStart={(event) => {
                event.dataTransfer.setData("text/plain", note.id);
                event.dataTransfer.effectAllowed = "move";
                onDragStartNote?.(note.id);
              }}
              onDragEnd={() => onDragEndNote?.()}
              className={cn(
                "w-full border-b border-neutral-100 px-3 py-2 text-left transition-all duration-200 hover:bg-neutral-100 dark:border-neutral-900 dark:hover:bg-neutral-900",
                active && "bg-muted dark:bg-neutral-800",
                isDragging && "opacity-40",
              )}
            >
              <span className="flex items-center gap-2">
                {note.pinned && (
                  <Pin
                    className="size-3.5 shrink-0 text-neutral-400"
                    aria-hidden
                  />
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
