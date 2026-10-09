"use client";

import { useEffect } from "react";
import { toggleTheme } from "@/lib/theme";

export function ThemeShortcut() {
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() !== "d" || e.repeat) return;
      if (e.ctrlKey || e.metaKey || e.altKey) return;

      const target = e.target;

      if (
        target instanceof HTMLElement &&
        target.closest("input, textarea, select, [contenteditable='true']")
      ) {
        return;
      }

      toggleTheme();
    };

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return null;
}
