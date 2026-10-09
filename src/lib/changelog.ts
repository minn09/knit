export type ChangeType = "added" | "changed" | "fixed";

export interface ChangelogEntry {
  version: string;
  date: string; // YYYY-MM-DD
  changes: { type: ChangeType; text: string }[];
}

// Agrega las versiones nuevas ARRIBA. Ejemplo:
// {
//   version: "0.1.0",
//   date: "2026-10-08",
//   changes: [{ type: "added", text: "Notas locales con markdown" }],
// },
export const changelog: ChangelogEntry[] = [
  {
    version: "0.1.1",
    date: "2026-10-09",
    changes: [
      {
        type: "fixed",
        text: "El aviso al crear una subtarea en el nivel 4 ahora sí aparece.",
      },
      {
        type: "added",
        text: "Puedes asignar cualquier tarea a una nota desde la sección de Tareas.",
      },
      {
        type: "changed",
        text: "Crear o renombrar carpetas y tags usa diálogos de la app, no los del navegador.",
      },
      {
        type: "changed",
        text: "Borrar carpeta o tag, cerrar sesión y borrar datos de la nube piden confirmación.",
      },
      {
        type: "fixed",
        text: "Mejorado el arranque: las imágenes principales cargan antes.",
      },
      {
        type: "changed",
        text: "El registro con correo avisa si hay que confirmar la cuenta; quedó habilitado el login con Google.",
      },
    ],
  },
  {
    version: "0.1.0",
    date: "2026-10-09",
    changes: [
      {
        type: "added",
        text: "Notas en markdown con vista previa en vivo mientras escribes.",
      },
      {
        type: "added",
        text: "Carpetas anidadas, tags, notas fijadas y búsqueda por título.",
      },
      {
        type: "added",
        text: "Tareas con subtareas sin límite y relación con sus notas.",
      },
      {
        type: "added",
        text: "Uso sin conexión: la app se instala como PWA y abre sin red.",
      },
      {
        type: "added",
        text: "Cuenta opcional para sincronizar entre dispositivos.",
      },
      {
        type: "changed",
        text: "La app guarda todo en tu dispositivo (IndexedDB); la nube solo sincroniza.",
      },
    ],
  },
];
