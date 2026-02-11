"use client";

import { useEffect, useState } from "react";

const THEME_KEY = "theme";
type ThemeMode = "light" | "dark" | "system";

function getSystemDark(): boolean {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

function getStoredTheme(): ThemeMode {
  if (typeof window === "undefined") return "system";
  const stored = localStorage.getItem(THEME_KEY);
  if (stored === "light" || stored === "dark" || stored === "system") return stored;
  return "system";
}

function applyTheme(mode: ThemeMode) {
  const root = document.documentElement;
  const isDark =
    mode === "dark" || (mode === "system" && getSystemDark());
  if (isDark) {
    root.classList.add("dark");
  } else {
    root.classList.remove("dark");
  }
}

export function ThemeSwitcher() {
  const [mode, setMode] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    setMode(getStoredTheme());
  }, []);

  useEffect(() => {
    if (!mounted) return;
    applyTheme(mode);
    localStorage.setItem(THEME_KEY, mode);
  }, [mode, mounted]);

  useEffect(() => {
    if (!mounted || mode !== "system") return;
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const handler = () => applyTheme("system");
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, [mode, mounted]);

  const cycle = () => {
    setMode((prev) => (prev === "light" ? "dark" : prev === "dark" ? "system" : "light"));
  };

  if (!mounted) {
    return (
      <button
        type="button"
        aria-label="Theme switcher"
        className="h-9 w-9 rounded-lg border border-outline bg-background-card text-text-heading opacity-70"
      >
        <span className="sr-only">Loading theme</span>
      </button>
    );
  }

  return (
    <button
      type="button"
      onClick={cycle}
      aria-label={`Theme: ${mode}. Click to switch.`}
      className="h-9 w-9 rounded-lg border border-outline bg-background-card text-text-heading transition hover:bg-primary hover:text-text-inverse hover:border-primary"
    >
      {mode === "light" && (
        <svg className="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
        </svg>
      )}
      {mode === "dark" && (
        <svg className="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
        </svg>
      )}
      {mode === "system" && (
        <svg className="mx-auto h-5 w-5" fill="currentColor" viewBox="0 0 20 20" aria-hidden>
          <path fillRule="evenodd" d="M3 5a2 2 0 012-2h10a2 2 0 012 2v8a2 2 0 01-2 2h-2.22l.123.489.655.327A3 3 0 0118 15.803V5a4 4 0 00-4-4H6a4 4 0 00-4 4v10.803a3 3 0 005.757 1.589l.656-.327.122-.489H5a2 2 0 01-2-2V5zm4 2a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1H8a1 1 0 01-1-1V7z" clipRule="evenodd" />
        </svg>
      )}
    </button>
  );
}
