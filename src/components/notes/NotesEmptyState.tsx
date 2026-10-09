import { Plus, SearchX } from "lucide-react";
import { EmptyState, type OviPose } from "@/components/EmptyState";
import { Button } from "@/components/ui/button";

export type NotesEmptyVariant =
  | "no-notes"
  | "select"
  | "folder"
  | "tag"
  | "search";

const base: Record<
  "no-notes" | "select",
  { pose: OviPose; title: string; text: string }
> = {
  "no-notes": {
    pose: "write",
    title: "Aún no tienes notas",
    text: "Escribe tu primera idea: puede ser markdown o texto plano.",
  },
  select: {
    pose: "hello",
    title: "Elige una nota",
    text: "Selecciona una de la lista o crea una nueva para empezar.",
  },
};

export function NotesEmptyState({
  variant,
  name,
  query,
  onCreate,
  onClearSearch,
}: {
  variant: NotesEmptyVariant;
  name?: string;
  query?: string;
  onCreate?: () => void;
  onClearSearch?: () => void;
}) {
  if (variant === "folder") {
    return (
      <EmptyState
        pose="sleep"
        title="Esta carpeta está vacía"
        text={`«${name}» no tiene notas todavía. Crea una para empezar a organizar aquí.`}
      >
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus data-icon="inline-start" />
            Crear nota aquí
          </Button>
        )}
      </EmptyState>
    );
  }

  if (variant === "tag") {
    return (
      <EmptyState
        pose="hello"
        title="Nada con esta etiqueta"
        text={`Crea una nota con «${name}» para empezar a agrupar tu contenido.`}
      >
        {onCreate && (
          <Button onClick={onCreate}>
            <Plus data-icon="inline-start" />
            Crear nota aquí
          </Button>
        )}
      </EmptyState>
    );
  }

  if (variant === "search") {
    return (
      <EmptyState
        pose="confused"
        title="Sin resultados"
        text={`No hay notas que coincidan con «${query}».`}
      >
        {onClearSearch && (
          <Button variant="outline" onClick={onClearSearch}>
            <SearchX data-icon="inline-start" />
            Borrar búsqueda
          </Button>
        )}
      </EmptyState>
    );
  }

  const copy = base[variant];

  return (
    <EmptyState pose={copy.pose} title={copy.title} text={copy.text}>
      {variant === "no-notes" && onCreate && (
        <Button onClick={onCreate}>
          <Plus data-icon="inline-start" />
          Crear nota
        </Button>
      )}
    </EmptyState>
  );
}
