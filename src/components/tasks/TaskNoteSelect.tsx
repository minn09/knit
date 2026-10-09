"use client";

import { useLiveQuery } from "dexie-react-hooks";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { listNotes } from "@/lib/queries";
import { setTaskNote } from "@/lib/tasks";

const UNLINKED = "__none__";

/** Selector para ligar (o desligar) una tarea de una nota. */
export function TaskNoteSelect({
  taskId,
  noteId,
}: {
  taskId: string;
  noteId: string | null;
}) {
  const notes = useLiveQuery(() => listNotes(), []);

  const items = [
    { value: UNLINKED, label: "Sin nota" },
    ...(notes ?? []).map((note) => ({
      value: note.id,
      label: note.title || "Sin título",
    })),
  ];

  return (
    <Select
      items={items}
      value={noteId ?? UNLINKED}
      onValueChange={(value) => {
        const next = String(value);
        setTaskNote(taskId, next === UNLINKED ? null : next);
      }}
    >
      <SelectTrigger
        size="sm"
        aria-label="Nota de la tarea"
        className="h-6 w-36 text-xs text-muted-foreground"
      >
        <SelectValue placeholder="Sin nota" />
      </SelectTrigger>
      <SelectContent>
        {items.map((item) => (
          <SelectItem key={item.value} value={item.value}>
            {item.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
