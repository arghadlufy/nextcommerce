export const SUPPORTED_LOCALES = ["en-BE", "en-IN", "nl-BE", "hi-IN"] as const;
export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "en-BE";

export const LOCALE_LABELS: Record<Locale, string> = {
  "en-BE": "English (Belgium)",
  "en-IN": "English (India)",
  "nl-BE": "Dutch (Belgium)",
  "hi-IN": "Hindi (India)",
};

export const COOKIE_LOCALE = "NEXT_LOCALE";

export function hasLocale(locale: string): locale is Locale {
  return SUPPORTED_LOCALES.includes(locale as Locale);
}
