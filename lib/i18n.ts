import "server-only";
import type { Locale } from "./i18n-constants";
import { hasLocale } from "./i18n-constants";

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

// Map each locale to a lazy JSON import that resolves to the typed Dictionary
const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  "en-BE": async () =>
    (await import("@/dictionaries/en-BE.json")).default as Dictionary,
  "en-IN": async () =>
    (await import("@/dictionaries/en-IN.json")).default as Dictionary,
  "nl-BE": async () =>
    (await import("@/dictionaries/nl-BE.json")).default as Dictionary,
  "hi-IN": async () =>
    (await import("@/dictionaries/hi-IN.json")).default as Dictionary,
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale];
  if (!loader) throw new Error(`No dictionary for locale: ${locale}`);
  return loader();
}
