"use client";

import { useState } from "react";
import { toast } from "sonner";
import type { Task } from "@/lib/db";
import {
  buildTaskTree,
  createTask,
  deleteTask,
  MAX_RECOMMENDED_LEVEL,
  taskDepth,
  toggleTaskDone,
  updateTask,
} from "@/lib/tasks";
import { TaskItem } from "./TaskItem";

export function TaskTree({
  tasks,
  emptyText,
}: {
  tasks: Task[];
  emptyText?: string;
}) {
  const nodes = buildTaskTree(tasks);

  async function addChild(parentId: string) {
    const depth = taskDepth(tasks, parentId);
    if (depth + 1 > MAX_RECOMMENDED_LEVEL) {
      toast.warning(
        "Esta tarea quedaría en el nivel 4. Divide la jerarquía para mantenerla legible.",
      );
    }
    await createTask({ parentId });
  }

  if (nodes.length === 0) {
    return (
      <p className="px-2 py-1 text-sm text-neutral-500 dark:text-neutral-400">
        {emptyText ?? "Sin tareas."}
      </p>
    );
  }

  return (
    <ul>
      {nodes.map((node) => (
        <TaskItem
          key={node.id}
          node={node}
          depth={0}
          onToggle={(id, done) => toggleTaskDone(id, done)}
          onAddChild={addChild}
          onDelete={(id) => deleteTask(id)}
          onRename={(id, title) => updateTask(id, { title })}
        />
      ))}
    </ul>
  );
}

export function AddTaskInput({
  noteId,
  placeholder,
}: {
  noteId: string | null;
  placeholder?: string;
}) {
  const [value, setValue] = useState("");

  async function submit() {
    const title = value.trim();
    if (!title) {
      return;
    }
    await createTask({ title, noteId });
    setValue("");
  }

  return (
    <input
      value={value}
      onChange={(event) => setValue(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          submit();
        }
      }}
      placeholder={placeholder ?? "Nueva tarea y Enter…"}
      className="w-full rounded border border-neutral-200 bg-transparent px-2 py-1 text-sm outline-none focus:border-neutral-400 dark:border-neutral-800 dark:focus:border-neutral-600"
    />
  );
}
