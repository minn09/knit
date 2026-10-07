import type { Metadata } from "next";
import { SiteHeader } from "@/components/SiteHeader";
import { type ChangeType, changelog } from "@/lib/changelog";

export const metadata: Metadata = { title: "Changelog · Knit" };

const labels: Record<ChangeType, { text: string; style: string }> = {
  added: {
    text: "Nuevo",
    style:
      "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300",
  },
  changed: {
    text: "Cambio",
    style: "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300",
  },
  fixed: {
    text: "Corregido",
    style:
      "bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-300",
  },
};

export default function ChangelogPage() {
  return (
    <>
      <SiteHeader />
      <main className="mx-auto max-w-2xl px-4 py-12">
        <h1 className="text-3xl font-bold">Changelog</h1>
        <p className="mt-2 text-neutral-600 dark:text-neutral-400">
          Qué ha cambiado en cada versión.
        </p>

        {changelog.length === 0 ? (
          <p className="mt-10 text-neutral-500">
            Aún no hay cambios publicados.
          </p>
        ) : (
          <div className="mt-10 space-y-10">
            {changelog.map((entry) => (
              <section key={entry.version}>
                <h2 className="text-xl font-semibold">
                  v{entry.version}{" "}
                  <span className="ml-2 text-sm font-normal text-neutral-500">
                    {entry.date}
                  </span>
                </h2>
                <ul className="mt-3 space-y-2">
                  {entry.changes.map((c) => (
                    <li
                      key={`${entry.version}-${c.text}`}
                      className="flex gap-2"
                    >
                      <span
                        className={`h-fit shrink-0 rounded px-2 py-0.5 text-xs font-medium ${labels[c.type].style}`}
                      >
                        {labels[c.type].text}
                      </span>
                      <span>{c.text}</span>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        )}
      </main>
    </>
  );
}
