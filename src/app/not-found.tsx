import Link from "next/link";
import { EmptyState } from "@/components/EmptyState";

export default function NotFound() {
  return (
    <main className="flex min-h-dvh">
      <EmptyState
        pose="confused"
        title="No encontramos esa página"
        text="Puede que el enlace esté mal escrito o que ya no exista."
      >
        <Link
          href="/"
          className="mt-2 rounded bg-neutral-900 px-4 py-2 text-sm text-white dark:bg-white dark:text-neutral-900"
        >
          Volver al inicio
        </Link>
      </EmptyState>
    </main>
  );
}
