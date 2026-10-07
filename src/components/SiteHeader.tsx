import Image from "next/image";
import Link from "next/link";
import ovi from "@/assets/mascot/ovi.png";
import { ThemeButton } from "@/components/theme/ThemeButton";

export function SiteHeader() {
  return (
    <header className="border-b border-neutral-200 dark:border-neutral-800">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-lg font-bold">
          <Image
            src={ovi}
            alt=""
            width={28}
            style={{ width: 28, height: "auto" }}
          />
          Knit
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/changelog"
            className="text-neutral-600 hover:text-neutral-900 dark:text-neutral-400 dark:hover:text-white"
          >
            Changelog
          </Link>
          <ThemeButton />
          <Link
            href="/notas"
            className="rounded bg-neutral-900 px-3 py-1.5 text-white dark:bg-white dark:text-neutral-900"
          >
            Abrir app
          </Link>
        </nav>
      </div>
    </header>
  );
}
