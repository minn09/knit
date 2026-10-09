import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import oviHello from "@/assets/mascot/ovi-hello.png";
import { SiteHeader } from "@/components/SiteHeader";

export const metadata: Metadata = {
  title: "Knit · Notas en markdown y tareas",
  description:
    "Notas en markdown y una lista de tareas ligada a tus notas. Funciona sin cuenta; con cuenta, sincroniza entre dispositivos.",
};

// Cambia soon a true cuando una función todavía no esté lista
const features = [
  {
    title: "Markdown cuando quieras",
    text: "Escribe en markdown con vista previa en vivo, o apágalo en una nota y úsala como un bloc de notas normal.",
    soon: false,
  },
  {
    title: "Organiza a tu manera",
    text: "Carpetas anidadas, tags y notas fijadas para encontrar todo rápido. Búsqueda por título, incluso sin conexión.",
    soon: false,
  },
  {
    title: "Tareas ligadas a tus notas",
    text: "Una lista de tareas con subtareas, conectada con las notas donde nacieron.",
    soon: false,
  },
  {
    title: "Funciona sin internet",
    text: "Tus notas viven en tu dispositivo. Instálala como app y sigue escribiendo aunque se caiga la red.",
    soon: false,
  },
  {
    title: "Sincroniza si quieres",
    text: "Empieza sin cuenta. Si inicias sesión, tus notas te siguen a todos tus dispositivos.",
    soon: false,
  },
];

export default function Landing() {
  return (
    <>
      <SiteHeader />
      <main>
        <section className="mx-auto max-w-3xl px-4 py-20 text-center">
          <Image
            src={oviHello}
            alt="Ovi, la mascota de Knit"
            width={160}
            preload
            style={{ width: 160, height: "auto" }}
            className="mx-auto mb-6"
          />
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Tus notas y tareas, con o sin internet
          </h1>
          <p className="mt-6 text-lg text-neutral-600 dark:text-neutral-400">
            Un bloc de notas con markdown opcional y una lista de tareas ligada
            a tus notas. Empieza sin cuenta; si quieres verlas en todos tus
            dispositivos, inicia sesión.
          </p>
          <div className="mt-8 flex justify-center gap-3">
            <Link
              href="/notas"
              className="rounded bg-neutral-900 px-5 py-2.5 font-medium text-white dark:bg-white dark:text-neutral-900"
            >
              Abrir la app
            </Link>
            <Link
              href="/changelog"
              className="rounded border border-neutral-300 px-5 py-2.5 font-medium dark:border-neutral-700"
            >
              Ver cambios
            </Link>
          </div>
        </section>

        <section className="mx-auto max-w-5xl px-4 pb-20">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div
                key={f.title}
                className="rounded-lg border border-neutral-200 p-5 dark:border-neutral-800"
              >
                <h2 className="flex items-center gap-2 font-semibold">
                  {f.title}
                  {f.soon && (
                    <span className="rounded bg-neutral-100 px-2 py-0.5 text-xs font-normal text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400">
                      Próximamente
                    </span>
                  )}
                </h2>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  {f.text}
                </p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <footer className="border-t border-neutral-200 py-6 text-center text-sm text-neutral-500 dark:border-neutral-800">
        Proyecto personal de Jonathan · Gratis
      </footer>
    </>
  );
}
