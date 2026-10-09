"use client";

import { useLiveQuery } from "dexie-react-hooks";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";
import { listTasks, tasksForNote } from "@/lib/queries";
import { AddTaskInput, TaskTree } from "./TaskTree";

export function NoteTasksPanel({ noteId }: { noteId: string }) {
  const [open, setOpen] = useState(true);
  const tasks = useLiveQuery(
    async () => tasksForNote(await listTasks(), noteId),
    [noteId],
  );
  const count = tasks?.length ?? 0;

  return (
    <div className="border-t border-neutral-200 dark:border-neutral-800">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex w-full items-center gap-2 px-3 py-2 text-sm font-medium hover:bg-neutral-50 dark:hover:bg-neutral-900"
      >
        {open ? (
          <ChevronDown className="h-4 w-4" />
        ) : (
          <ChevronRight className="h-4 w-4" />
        )}
        Tareas de esta nota
        {count > 0 && (
          <span className="text-neutral-500 dark:text-neutral-400">
            {count}
          </span>
        )}
      </button>
      {open && (
        <div className="max-h-64 overflow-y-auto px-2 pb-2">
          {tasks && (
            <TaskTree
              tasks={tasks}
              emptyText="Sin tareas ligadas a esta nota."
            />
          )}
          <div className="px-2 pt-1">
            <AddTaskInput
              noteId={noteId}
              placeholder="Añadir tarea a esta nota…"
            />
          </div>
        </div>
      )}
    </div>
  );
}
