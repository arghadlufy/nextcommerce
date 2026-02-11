"use client";

import { createContext, useContext } from "react";
import type { Locale } from "@/lib/i18n-constants";
import type { Dictionary } from "@/lib/i18n";

type I18nContextValue = {
  locale: Locale;
  dict: Dictionary;
};

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({
  locale,
  dict,
  children,
}: {
  locale: Locale;
  dict: Dictionary;
  children: React.ReactNode;
}) {
  return (
    <I18nContext.Provider value={{ locale, dict }}>{children}</I18nContext.Provider>
  );
}

export function useI18n(): I18nContextValue {
  const value = useContext(I18nContext);
  if (!value) throw new Error("useI18n must be used within I18nProvider");
  return value;
}

export function useDictionary(): Dictionary {
  return useI18n().dict;
}

export function useLocale(): Locale {
  return useI18n().locale;
}
