import { EmptyState } from "@/components/EmptyState";

export function NotesEmptyState({
  variant,
  onCreate,
}: {
  variant: "no-notes" | "select";
  onCreate?: () => void;
}) {
  if (variant === "select") {
    return (
      <EmptyState
        pose="hello"
        title="Elige una nota"
        text="Selecciona una de la lista o crea una nueva para empezar."
      />
    );
  }

  return (
    <EmptyState
      pose="write"
      title="Aún no tienes notas"
      text="Escribe tu primera idea: puede ser markdown o texto plano."
    >
      {onCreate && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-2 rounded bg-neutral-900 px-4 py-2 text-sm font-medium text-white dark:bg-white dark:text-neutral-900"
        >
          Crear nota
        </button>
      )}
    </EmptyState>
  );
}
