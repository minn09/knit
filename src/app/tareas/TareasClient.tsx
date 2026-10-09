"use client";

import { useLiveQuery } from "dexie-react-hooks";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AuthButton } from "@/components/auth/AuthButton";
import { SyncStatus } from "@/components/sync/SyncStatus";
import { TaskList } from "@/components/tasks/TaskList";
import { listNotes, listTasks } from "@/lib/queries";

export function TareasClient() {
  const router = useRouter();
  const tasks = useLiveQuery(() => listTasks(), []);
  const notes = useLiveQuery(() => listNotes(), []);
  const hasTasks = (tasks?.length ?? 0) > 0;

  return (
    <main className="flex h-dvh flex-col bg-background text-foreground">
      <div className="flex items-center justify-between border-b border-neutral-200 p-3 dark:border-neutral-800">
        <h1 className="font-semibold">Tareas</h1>
        <div className="flex items-center gap-3">
          <SyncStatus />
          <Link
            href="/notas"
            className="text-sm text-neutral-500 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Ir a Notas
          </Link>
          <AuthButton />
        </div>
      </div>

      <div className="mx-auto w-full max-w-2xl flex-1 overflow-y-auto p-4">
        {!hasTasks && (
          <p className="mb-4 text-sm text-neutral-500 dark:text-neutral-400">
            Aquí viven tus tareas y subtareas. Crea la primera abajo.
          </p>
        )}
        {tasks && notes && (
          <TaskList
            tasks={tasks}
            notes={notes}
            onOpenNote={(id) => router.push(`/notas?note=${id}`)}
          />
        )}
      </div>
    </main>
  );
}
