"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { useState } from "react";

import { EmptyState } from "@/components/EmptyState";
import { NoteEditor } from "@/components/NoteEditor";
import { db } from "@/lib/db";
import { createNote } from "@/lib/notes";

export function NotasClient() {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const notes = useLiveQuery(async () => {
    const all = await db.notes
      .filter((note) => note.deletedAt === null)
      .toArray();

    return all.sort(
      (a, b) =>
        Number(b.pinned) - Number(a.pinned) ||
        b.updatedAt.localeCompare(a.updatedAt),
    );
  }, []);

  const selected = notes?.find((note) => note.id === selectedId) ?? null;
  const hasNotes = (notes?.length ?? 0) > 0;

  async function handleCreateNote() {
    const id = await createNote();
    setSelectedId(id);
  }

  return (
    <main className="flex h-dvh">
      <aside
        className={`${selected ? "hidden md:flex" : "flex"} w-full flex-col border-r border-neutral-200 md:w-72 dark:border-neutral-800`}
      >
        <div className="flex items-center justify-between p-3">
          <h1 className="font-semibold">Notas</h1>

          <button
            type="button"
            onClick={handleCreateNote}
            className="rounded bg-neutral-900 px-3 py-1 text-sm text-white dark:bg-white dark:text-neutral-900"
          >
            Nueva
          </button>
        </div>

        {notes && !hasNotes && (
          <div className="flex flex-1 md:hidden">
            <EmptyState
              pose="write"
              size={120}
              title="Aún no tienes notas"
              text="Crea la primera con el botón Nueva."
            />
          </div>
        )}

        <ul className="flex-1 overflow-y-auto">
          {notes?.map((note) => (
            <li key={note.id}>
              <button
                type="button"
                onClick={() => setSelectedId(note.id)}
                className={`w-full truncate px-3 py-2 text-left text-sm hover:bg-neutral-100 dark:hover:bg-neutral-900 ${note.id === selectedId
                  ? "bg-neutral-100 dark:bg-neutral-900"
                  : ""
                  }`}
              >
                {note.pinned && "📌 "}
                {note.title || "Sin título"}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <section
        className={`${selected ? "flex" : "hidden md:flex"} flex-1 flex-col`}
      >
        {selected ? (
          <NoteEditor
            key={selected.id}
            note={selected}
            onBack={() => setSelectedId(null)}
          />
        ) : (
          notes && (
            <EmptyState
              pose={hasNotes ? "hello" : "write"}
              title={hasNotes ? "Selecciona una nota" : "Aún no tienes notas"}
              text={
                hasNotes
                  ? "Elige una de la lista o crea una nueva."
                  : "Crea la primera con el botón Nueva."
              }
            />
          )
        )}
      </section>
    </main>
  );
}
