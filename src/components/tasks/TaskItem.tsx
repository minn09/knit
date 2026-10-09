"use client";

import { Plus, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type { TaskNode } from "@/lib/tasks";
import { TaskNoteSelect } from "./TaskNoteSelect";

function Title({
  value,
  editing,
  onSave,
}: {
  value: string;
  editing: boolean;
  onSave: (title: string) => void;
}) {
  const [text, setText] = useState(value);
  const ref = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (editing) {
      ref.current?.focus();
    }
  }, [editing]);

  return (
    <input
      ref={ref}
      value={text}
      onChange={(event) => setText(event.target.value)}
      onKeyDown={(event) => {
        if (event.key === "Enter") {
          onSave(text.trim());
        }
        if (event.key === "Escape") {
          setText(value);
          onSave(value);
        }
      }}
      onBlur={() => onSave(text.trim())}
      placeholder="Escribe la tarea…"
      className="min-w-0 flex-1 bg-transparent text-sm outline-none"
    />
  );
}

export function TaskItem({
  node,
  depth,
  onToggle,
  onAddChild,
  onDelete,
  onRename,
}: {
  node: TaskNode;
  depth: number;
  onToggle: (id: string, done: boolean) => void;
  onAddChild: (parentId: string) => void;
  onDelete: (id: string) => void;
  onRename: (id: string, title: string) => void;
}) {
  const [editing, setEditing] = useState(node.title === "");

  return (
    <li>
      <div
        className="group flex items-center gap-2 rounded px-2 py-1 hover:bg-neutral-100 dark:hover:bg-neutral-900"
        style={{ paddingLeft: 8 + depth * 18 }}
      >
        <input
          type="checkbox"
          checked={node.done}
          onChange={() => onToggle(node.id, !node.done)}
          aria-label={node.done ? "Marcar como pendiente" : "Marcar como hecha"}
          className="h-4 w-4 shrink-0 accent-neutral-900 dark:accent-white"
        />

        <div
          className={`min-w-0 flex-1 ${
            node.done ? "text-neutral-400 line-through" : ""
          }`}
        >
          <Title
            value={node.title}
            editing={editing}
            onSave={(title) => {
              setEditing(false);
              if (title !== node.title) {
                onRename(node.id, title);
              }
            }}
          />
        </div>

        <div className="hidden shrink-0 sm:block">
          <TaskNoteSelect taskId={node.id} noteId={node.noteId} />
        </div>

        <button
          type="button"
          aria-label="Añadir subtarea"
          onClick={() => onAddChild(node.id)}
          className="shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
        <button
          type="button"
          aria-label="Borrar tarea"
          onClick={() => onDelete(node.id)}
          className="shrink-0 text-neutral-400 opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>

      {node.children.length > 0 && (
        <ul>
          {node.children.map((child) => (
            <TaskItem
              key={child.id}
              node={child}
              depth={depth + 1}
              onToggle={onToggle}
              onAddChild={onAddChild}
              onDelete={onDelete}
              onRename={onRename}
            />
          ))}
        </ul>
      )}
    </li>
  );
}
