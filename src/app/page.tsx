import {
  CloudOff,
  FileCode,
  FolderTree,
  ListChecks,
  RefreshCw,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import oviHello from "@/assets/mascot/ovi-hello.png";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Knit · Notas en markdown y tareas",
  description:
    "Notas en markdown y una lista de tareas ligada a tus notas. Funciona sin cuenta y sin conexión; con cuenta, sincroniza entre dispositivos.",
};

const features = [
  {
    icon: FileCode,
    title: "Markdown cuando quieras",
    text: "Escribe en markdown con vista previa en vivo, o apágalo en una nota y úsala como un bloc de notas normal.",
  },
  {
    icon: FolderTree,
    title: "Organiza a tu manera",
    text: "Carpetas anidadas, tags y notas fijadas para encontrar todo rápido. Búsqueda por título, incluso sin conexión.",
  },
  {
    icon: ListChecks,
    title: "Tareas ligadas a tus notas",
    text: "Una lista de tareas con subtareas, conectada con las notas donde nacieron.",
  },
  {
    icon: CloudOff,
    title: "Funciona sin internet",
    text: "Tus notas viven en tu dispositivo. Instálala como app y sigue escribiendo aunque se caiga la red.",
  },
  {
    icon: RefreshCw,
    title: "Sincroniza si quieres",
    text: "Empieza sin cuenta. Si inicias sesión, tus notas te siguen a todos tus dispositivos.",
  },
];

const ctaPrimary =
  "rounded-lg bg-neutral-900 px-5 py-2.5 font-medium text-white transition-colors duration-200 hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-200";
const ctaSecondary =
  "rounded-lg border border-neutral-300 px-5 py-2.5 font-medium transition-colors duration-200 hover:bg-neutral-100 dark:border-neutral-700 dark:hover:bg-neutral-900";
const ctaFocus =
  "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring/70";

function AppMock() {
  const folders = ["Ideas", "Trabajo", "Lecturas"];
  const notes = [
    { title: "Idea para la home", excerpt: "Hero sobrio, la mascota..." },
    { title: "Lista del super", excerpt: "leche, huevos, avena, café" },
    { title: "Nota en markdown", excerpt: "# Título\n- [ ] pendiente" },
  ];

  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200 shadow-sm dark:border-neutral-800">
      <div className="flex items-center gap-1.5 border-b border-neutral-200 px-4 py-3 dark:border-neutral-800">
        <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="size-2.5 rounded-full bg-neutral-300 dark:bg-neutral-700" />
        <span className="ml-3 text-xs text-neutral-400">app.knit</span>
      </div>

      <div className="grid grid-cols-[92px_minmax(0,1fr)] text-left sm:grid-cols-[170px_minmax(0,1fr)]">
        <aside className="border-r border-neutral-200 p-2.5 dark:border-neutral-800 sm:p-3">
          <p className="mb-1.5 text-xs font-semibold">Notas</p>
          <div className="rounded bg-neutral-900 px-2 py-1 text-[11px] font-medium text-white dark:bg-white dark:text-neutral-900">
            Todas
          </div>
          <p className="px-2 pt-2 pb-1 text-[9px] font-semibold uppercase tracking-widest text-neutral-400">
            Carpetas
          </p>
          <div className="space-y-0.5">
            {folders.map((folder, index) => (
              <div
                key={folder}
                className={`border-l-2 px-2 py-1 text-[11px] ${
                  index === 0
                    ? "border-neutral-900 font-medium text-neutral-900 dark:border-white dark:text-white"
                    : "border-transparent text-neutral-500 dark:text-neutral-400"
                }`}
              >
                {folder}
              </div>
            ))}
          </div>
        </aside>

        <section className="p-2.5 sm:p-3">
          <div className="mb-2 flex items-center justify-between gap-2">
            <span className="text-sm font-medium">Todas</span>
            <span className="h-5 w-20 rounded-md border border-neutral-200 dark:border-neutral-800" />
          </div>
          <div className="space-y-1">
            {notes.map((note, index) => (
              <div
                key={note.title}
                className={`rounded-md border p-2 ${
                  index === 0
                    ? "border-neutral-200 bg-neutral-100 dark:border-neutral-800 dark:bg-neutral-900"
                    : "border-transparent dark:border-transparent"
                }`}
              >
                <p className="truncate text-[11px] font-medium">{note.title}</p>
                <p className="truncate text-[9px] text-neutral-500 dark:text-neutral-400">
                  {note.excerpt}
                </p>
              </div>
            ))}
          </div>
          <div className="mt-2 flex items-center gap-1">
            <span className="rounded-full bg-neutral-200 px-1.5 py-0.5 text-[9px] font-medium text-neutral-800 dark:bg-neutral-800 dark:text-neutral-200">
              md
            </span>
            <span className="rounded-full border border-dashed border-neutral-300 px-1.5 py-0.5 text-[9px] text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
              + Etiqueta
            </span>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function Landing() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-2xl px-4 py-24 text-center sm:py-32">
          <p className="mb-4 text-xs font-semibold uppercase tracking-widest text-neutral-500 dark:text-neutral-400">
            Bloc de notas + lista de tareas
          </p>
          <Image
            src={oviHello}
            alt=""
            width={160}
            preload
            style={{ width: 160, height: "auto" }}
            className="mx-auto mb-8"
          />
          <h1 className="text-balance text-4xl font-semibold tracking-tight sm:text-6xl">
            Notas y tareas, con o sin internet
          </h1>
          <p className="text-pretty mx-auto mt-6 max-w-xl text-lg text-neutral-600 dark:text-neutral-400">
            Escribe en markdown, vincula tus tareas a cada nota y ordénalo todo
            por carpetas y etiquetas. Funciona al instante, sin cuenta y sin
            conexión; sincroniza cuando tú quieras.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link href="/notas" className={`${ctaPrimary} ${ctaFocus}`}>
              Abrir la app
            </Link>
            <Link href="/changelog" className={`${ctaSecondary} ${ctaFocus}`}>
              Ver los cambios
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <h2 className="text-balance text-center text-2xl font-semibold tracking-tight">
            Todo lo necesario, nada de más
          </h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div
                key={feature.title}
                className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
              >
                <feature.icon
                  className="size-5 text-neutral-400"
                  strokeWidth={2}
                  aria-hidden
                />
                <h3 className="mt-3 font-semibold">{feature.title}</h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {feature.text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="mx-auto max-w-4xl px-4 pb-24">
          <h2 className="text-balance text-center text-2xl font-semibold tracking-tight">
            Así se ve Knit
          </h2>
          <p className="text-pretty mx-auto mt-3 max-w-xl text-center text-neutral-600 dark:text-neutral-400">
            Sin relleno ni adornos: tus carpetas, tus etiquetas y tus notas, en
            un solo panel.
          </p>
          <div className="mt-8">
            <AppMock />
          </div>
        </section>

        <section className="mx-auto max-w-2xl px-4 pb-24 text-center">
          <h2 className="text-balance text-2xl font-semibold tracking-tight">
            ¿Listo para escribir tu primera nota?
          </h2>
          <p className="text-pretty mt-3 text-neutral-600 dark:text-neutral-400">
            No necesitas una cuenta ni una conexión. Empieza ahora.
          </p>
          <div className="mt-6">
            <Link href="/notas" className={`${ctaPrimary} ${ctaFocus}`}>
              Abrir la app
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500 dark:border-neutral-800">
        Proyecto personal de Jonathan · Gratis
      </footer>
    </>
  );
}
