"use client";

import { useSyncExternalStore } from "react";

const THEME_STORAGE_KEY = "jmmc-theme";
const THEME_CHANGE_EVENT = "jmmc-theme-change";
type Theme = "dark" | "light";

function applyTheme(theme: Theme) {
  const root = document.documentElement;
  root.classList.toggle("dark", theme === "dark");
  root.classList.toggle("light", theme === "light");
}

function subscribeToThemeChanges(onStoreChange: () => void) {
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
}

function getThemeSnapshot(): Theme {
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function getServerThemeSnapshot(): Theme {
  return "dark";
}

export function ThemeSelector() {
  const theme = useSyncExternalStore(
    subscribeToThemeChanges,
    getThemeSnapshot,
    getServerThemeSnapshot,
  );

  function handleThemeChange(nextTheme: Theme) {
    applyTheme(nextTheme);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, nextTheme);
    } catch {
      // The theme remains active for this session when storage is unavailable.
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }

  return (
    <div
      aria-label="Selector de tema"
      className={/* taste-skill-ignore: technical selector token from DESIGN.md */ "flex items-center border border-border font-mono text-mono-code uppercase tracking-[0.12em]"}
      role="group"
    >
      <button
        aria-pressed={theme === "dark"}
        className="min-h-10 min-w-10 px-space-sm text-on-surface-variant hover:bg-surface-high hover:text-primary"
        onClick={() => handleThemeChange("dark")}
        title="Usar tema oscuro"
        type="button"
      >
        D
      </button>
      <span aria-hidden="true" className="text-border-strong">
        /
      </span>
      <button
        aria-pressed={theme === "light"}
        className="min-h-10 min-w-10 px-space-sm text-on-surface-variant hover:bg-surface-high hover:text-primary"
        onClick={() => handleThemeChange("light")}
        title="Usar tema claro"
        type="button"
      >
        L
      </button>
    </div>
  );
}
