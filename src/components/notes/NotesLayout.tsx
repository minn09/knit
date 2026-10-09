"use client";

import type { ReactNode } from "react";

export function NotesLayout({
  sidebar,
  children,
  showContent,
}: {
  sidebar: ReactNode;
  children: ReactNode;
  showContent: boolean;
}) {
  return (
    <main className="flex h-dvh bg-background text-foreground">
      <aside
        className={`${
          showContent ? "hidden md:flex" : "flex"
        } w-full flex-col border-r border-neutral-200 md:w-80 dark:border-neutral-800`}
      >
        {sidebar}
      </aside>
      <section
        className={`${
          showContent ? "flex" : "hidden md:flex"
        } min-w-0 flex-1 flex-col`}
      >
        {children}
      </section>
    </main>
  );
}
