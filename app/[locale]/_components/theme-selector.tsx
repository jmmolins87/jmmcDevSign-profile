"use client";

import { useSyncExternalStore } from "react";
import { useLocale } from "@/app/lib/locale-context";

export type ThemePreference = "dark" | "light" | "system";
const THEME_STORAGE_KEY = "jmmc-theme";
const THEME_CHANGE_EVENT = "jmmc-theme-change";
const QUERY = "(prefers-color-scheme: dark)";

function getThemeSnapshot(): ThemePreference {
  const preference = document.documentElement.dataset.themePreference;
  if (preference === "light" || preference === "dark" || preference === "system") return preference;
  return document.documentElement.classList.contains("light") ? "light" : "dark";
}

function applyTheme(preference: ThemePreference) {
  const root = document.documentElement;
  const dark = preference === "system" ? window.matchMedia(QUERY).matches : preference === "dark";
  root.dataset.themePreference = preference;
  root.classList.toggle("dark", dark);
  root.classList.toggle("light", !dark);
}

function subscribe(onStoreChange: () => void) {
  const media = window.matchMedia(QUERY);
  const syncSystem = () => {
    if (getThemeSnapshot() === "system") applyTheme("system");
    onStoreChange();
  };
  const syncStorage = (event: StorageEvent) => {
    if (event.key !== THEME_STORAGE_KEY) return;
    if (event.newValue === "dark" || event.newValue === "light" || event.newValue === "system") applyTheme(event.newValue);
    onStoreChange();
  };
  media.addEventListener("change", syncSystem);
  window.addEventListener(THEME_CHANGE_EVENT, onStoreChange);
  window.addEventListener("storage", syncStorage);
  return () => {
    media.removeEventListener("change", syncSystem);
    window.removeEventListener(THEME_CHANGE_EVENT, onStoreChange);
    window.removeEventListener("storage", syncStorage);
  };
}

function ThemeIcon({ theme }: { theme: ThemePreference }) {
  return <svg aria-hidden="true" fill="none" height="18" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" viewBox="0 0 24 24" width="18">
    {theme === "dark" ? <path d="M20.5 14A8.5 8.5 0 0 1 10 3.5 8.5 8.5 0 1 0 20.5 14Z" /> : theme === "light" ? <><circle cx="12" cy="12" r="4" /><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5" /></> : <><rect height="13" rx="1" width="18" x="3" y="3" /><path d="M8 21h8m-4-5v5" /></>}
  </svg>;
}

const labels = {
  es: { dark: "Usar tema oscuro", light: "Usar tema claro", system: "Usar tema del sistema", group: "Selector de tema" },
  en: { dark: "Use dark theme", light: "Use light theme", system: "Use system theme", group: "Theme selector" },
};

export function ThemeSelector() {
  const locale = useLocale();
  const theme = useSyncExternalStore(subscribe, getThemeSnapshot, () => "dark" as ThemePreference);
  function change(next: ThemePreference) {
    applyTheme(next);
    try {
      window.localStorage.setItem(THEME_STORAGE_KEY, next);
      document.documentElement.removeAttribute("data-theme-persistence");
    } catch {
      document.documentElement.setAttribute("data-theme-persistence", "memory");
    }
    window.dispatchEvent(new Event(THEME_CHANGE_EVENT));
  }
  return <div aria-label={labels[locale].group} className="flex items-center border border-border font-mono text-mono-code" role="group">
    {(["dark", "light", "system"] as const).map((option) => <button aria-label={labels[locale][option]} aria-pressed={theme === option} className={`inline-flex min-h-10 min-w-10 items-center justify-center px-space-sm hover:bg-surface-high active:bg-surface-highest ${theme === option ? "bg-surface-high text-primary" : "text-on-surface-variant"}`} key={option} onClick={() => change(option)} title={labels[locale][option]} type="button"><ThemeIcon theme={option} /></button>)}
  </div>;
}
