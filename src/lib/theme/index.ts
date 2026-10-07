import { THEME_KEY, THEME_EVENT } from "./consts";
import type { Theme } from "./types";
export function getTheme(): Theme {
  if (typeof window === "undefined") {
    return "light";
  }

  const saved = localStorage.getItem(THEME_KEY);

  if (saved === "dark" || saved === "light") {
    return saved;
  }

  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function setTheme(theme: Theme) {
  const isDark = theme === "dark";

  document.documentElement.classList.toggle("dark", isDark);

  try {
    localStorage.setItem(THEME_KEY, theme);
  } catch {
    // localStorage no disponible
  }

  window.dispatchEvent(new Event(THEME_EVENT));
}

export function toggleTheme() {
  const current = getTheme();
  const next: Theme = current === "dark" ? "light" : "dark";

  setTheme(next);
}

export function subscribeToTheme(callback: () => void) {
  window.addEventListener(THEME_EVENT, callback);

  return () => {
    window.removeEventListener(THEME_EVENT, callback);
  };
}
