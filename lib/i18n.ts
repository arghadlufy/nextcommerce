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
  localeModal: { title: string; selectLabel: string; continueLabel: string };
};

const dictionaries: Record<Locale, () => Promise<{ default: Dictionary }>> = {
  "en-BE": () =>
    import("@/dictionaries/en-BE.json").then((m) => m as Promise<{ default: Dictionary }>),
  "en-IN": () =>
    import("@/dictionaries/en-IN.json").then((m) => m as Promise<{ default: Dictionary }>),
  "nl-BE": () =>
    import("@/dictionaries/nl-BE.json").then((m) => m as Promise<{ default: Dictionary }>),
  "hi-IN": () =>
    import("@/dictionaries/hi-IN.json").then((m) => m as Promise<{ default: Dictionary }>),
};

export async function getDictionary(locale: Locale): Promise<Dictionary> {
  const loader = dictionaries[locale];
  if (!loader) throw new Error(`No dictionary for locale: ${locale}`);
  const mod = await loader();
  return mod.default;
}
