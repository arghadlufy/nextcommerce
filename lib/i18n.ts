import "server-only";
import type { Locale } from "./i18n-constants";
import { hasLocale } from "./i18n-constants";
import { db } from "./db";

export type { Locale } from "./i18n-constants";
export {
  SUPPORTED_LOCALES,
  DEFAULT_LOCALE,
  LOCALE_LABELS,
  hasLocale,
  COOKIE_LOCALE,
} from "./i18n-constants";

export type Dictionary = {
  common: { home: string; products: string };
  products: {
    addToCart: string;
    backToHome: string;
    showingCount: string;
    browseDescription: string;
  };
  home: {
    bannerHeading: string;
    bannerSubtitle: string;
    shopNow: string;
    favorites: string;
    seeAll: string;
    categories: string;
  };
  localeModal: { title: string; selectLabel: string; continueLabel: string };
};

// Fallback: static JSON dictionaries used when DB rows are missing
const fallbackDictionaries: Record<Locale, () => Promise<Dictionary>> = {
  "en-BE": async () =>
    (await import("@/dictionaries/en-BE.json")).default as Dictionary,
  "en-IN": async () =>
    (await import("@/dictionaries/en-IN.json")).default as Dictionary,
  "nl-BE": async () =>
    (await import("@/dictionaries/nl-BE.json")).default as Dictionary,
  "hi-IN": async () =>
    (await import("@/dictionaries/hi-IN.json")).default as Dictionary,
};

/**
 * Load a dictionary from the UiLabel DB table, falling back to
 * the static JSON file if no rows are found for the locale.
 */
export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const rows = await db.uiLabel.findMany({ where: { locale } });

  // If no DB rows exist yet, fall back to JSON
  if (rows.length === 0) {
    const loader = fallbackDictionaries[locale];
    if (!loader) throw new Error(`No dictionary for locale: ${locale}`);
    return loader();
  }

  // Reconstruct the Dictionary object from flat rows
  const dict: Record<string, Record<string, string>> = {};
  for (const row of rows) {
    if (!dict[row.namespace]) dict[row.namespace] = {};
    dict[row.namespace][row.key] = row.value;
  }

  return dict as unknown as Dictionary;
}
