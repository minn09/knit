"use client";

import { FileText } from "lucide-react";
import type { Note, Task } from "@/lib/db";
import { AddTaskInput, TaskTree } from "./TaskTree";

export function TaskList({
  tasks,
  notes,
  onOpenNote,
}: {
  tasks: Task[];
  notes: Note[];
  onOpenNote: (id: string) => void;
}) {
  const byNote = new Map<string, Task[]>();
  const unlinked: Task[] = [];

  for (const task of tasks) {
    if (task.noteId) {
      const list = byNote.get(task.noteId) ?? [];
      list.push(task);
      byNote.set(task.noteId, list);
    } else {
      unlinked.push(task);
    }
  }

  const linkedNotes = notes.filter((note) => byNote.has(note.id));

  return (
    <div className="space-y-6">
      {linkedNotes.map((note) => (
        <section key={note.id}>
          <button
            type="button"
            onClick={() => onOpenNote(note.id)}
            className="flex items-center gap-2 text-sm font-semibold hover:underline"
          >
            <FileText className="h-4 w-4 text-neutral-400" />
            {note.title || "Sin título"}
          </button>
          <div className="mt-1">
            <TaskTree tasks={byNote.get(note.id) ?? []} />
            <div className="px-2 pt-1">
              <AddTaskInput
                noteId={note.id}
                placeholder="Añadir tarea a esta nota…"
              />
            </div>
          </div>
        </section>
      ))}

      <section>
        <h2 className="text-sm font-semibold text-neutral-500 dark:text-neutral-400">
          Sin nota
        </h2>
        <div className="mt-1">
          <TaskTree
            tasks={unlinked}
            emptyText="Las tareas sin nota aparecen aquí."
          />
          <div className="px-2 pt-1">
            <AddTaskInput noteId={null} placeholder="Nueva tarea suelta…" />
          </div>
        </div>
      </section>
    </div>
  );
}
