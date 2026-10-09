import { db, type Task } from "./db";
import { newId, now } from "./ids";
import { sanitizeLine } from "./sanitize";

export interface TaskNode extends Task {
  children: TaskNode[];
}

/** Nivel 1 = tarea principal. A partir del nivel 4 se sugiere reducir la jerarquía. */
export const MAX_RECOMMENDED_LEVEL = 3;

export async function createTask(input: {
  title?: string;
  parentId?: string | null;
  noteId?: string | null;
}): Promise<string> {
  const parentId = input.parentId ?? null;
  let noteId = input.noteId ?? null;

  if (parentId) {
    const parent = await db.tasks.get(parentId);
    // Las subtareas heredan la nota de su raíz.
    noteId = parent?.noteId ?? noteId;
  }

  const id = newId();
  const t = now();
  await db.tasks.add({
    id,
    ownerId: null,
    noteId,
    parentId,
    title: sanitizeLine(input.title ?? ""),
    done: false,
    createdAt: t,
    updatedAt: t,
    deletedAt: null,
    syncState: "pending",
  });
  return id;
}

export async function updateTask(
  id: string,
  changes: Partial<Pick<Task, "title" | "noteId">>,
) {
  const clean: Partial<Pick<Task, "title" | "noteId">> = { ...changes };
  if (clean.title !== undefined) {
    clean.title = sanitizeLine(clean.title);
  }
  await db.tasks.update(id, {
    ...clean,
    updatedAt: now(),
    syncState: "pending",
  });
}

/** Asigna (o quita) la nota de una tarea y de todo su subárbol. */
export async function setTaskNote(id: string, noteId: string | null) {
  const t = now();
  await db.transaction("rw", db.tasks, async () => {
    const all = await db.tasks
      .filter((task) => task.deletedAt === null)
      .toArray();
    for (const taskId of subtreeIds(all, id)) {
      await db.tasks.update(taskId, {
        noteId,
        updatedAt: t,
        syncState: "pending",
      });
    }
  });
}

/** Ids de una tarea y todo su subárbol. */
export function subtreeIds(tasks: Task[], rootId: string): string[] {
  const ids = [rootId];
  let frontier = [rootId];
  while (frontier.length > 0) {
    const next: string[] = [];
    for (const task of tasks) {
      if (task.parentId && frontier.includes(task.parentId)) {
        ids.push(task.id);
        next.push(task.id);
      }
    }
    frontier = next;
  }
  return ids;
}

/**
 * Marcar el padre completa todos sus hijos. Desmarcar el padre solo
 * desmarca el padre (los hijos no se tocan).
 */
export async function toggleTaskDone(id: string, done: boolean) {
  const t = now();
  await db.transaction("rw", db.tasks, async () => {
    const all = await db.tasks
      .filter((task) => task.deletedAt === null)
      .toArray();
    const targets = done ? subtreeIds(all, id) : [id];
    for (const taskId of targets) {
      await db.tasks.update(taskId, {
        done,
        updatedAt: t,
        syncState: "pending",
      });
    }
  });
}

/** Borra (lógico) una tarea y todo su subárbol. */
export async function deleteTask(id: string) {
  const t = now();
  await db.transaction("rw", db.tasks, async () => {
    const all = await db.tasks
      .filter((task) => task.deletedAt === null)
      .toArray();
    const targets = subtreeIds(all, id);
    for (const taskId of targets) {
      await db.tasks.update(taskId, {
        deletedAt: t,
        updatedAt: t,
        syncState: "pending",
      });
    }
  });
}

/** Nota heredada por el subárbol, usada al mostrar de dónde viene una tarea. */
export function taskDepth(tasks: Task[], id: string): number {
  const byId = new Map(tasks.map((task) => [task.id, task]));
  let depth = 1;
  let current = byId.get(id);
  while (current?.parentId && byId.has(current.parentId)) {
    depth += 1;
    current = byId.get(current.parentId);
  }
  return depth;
}

export function buildTaskTree(tasks: Task[]): TaskNode[] {
  const byId = new Map<string, TaskNode>();
  for (const task of tasks) {
    byId.set(task.id, { ...task, children: [] });
  }

  const roots: TaskNode[] = [];
  for (const node of byId.values()) {
    const parent = node.parentId ? byId.get(node.parentId) : undefined;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

export function countDone(nodes: TaskNode[]): { done: number; total: number } {
  let done = 0;
  let total = 0;
  for (const node of nodes) {
    total += 1;
    if (node.done) {
      done += 1;
    }
    const child = countDone(node.children);
    done += child.done;
    total += child.total;
  }
  return { done, total };
}
