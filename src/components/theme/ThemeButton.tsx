"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { getTheme, toggleTheme } from "@/lib/theme";

export function ThemeButton() {
  const [dark, setDark] = useState(false);

  useEffect(() => {
    // Estado inicial
    setDark(getTheme() === "dark");

    const handleThemeChange = () => {
      setDark(getTheme() === "dark");
    };

    window.addEventListener("theme-change", handleThemeChange);

    return () => {
      window.removeEventListener("theme-change", handleThemeChange);
    };
  }, []);

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label="Cambiar tema"
      title="Cambiar tema (D)"
      className="rounded px-2 py-1 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-800"
    >
      {dark ? (
        <Moon className="h-4 w-4" />
      ) : (
        <Sun className="h-4 w-4" />
      )}
    </button>
  );
}
