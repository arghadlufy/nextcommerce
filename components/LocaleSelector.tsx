"use client";

import { useRouter, usePathname } from "next/navigation";
import { useLocale } from "@/contexts/I18nContext";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  COOKIE_LOCALE,
  type Locale,
} from "@/lib/i18n-constants";

export function LocaleSelector() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = useLocale();

  function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const newLocale = e.target.value as Locale;
    const segments = pathname.split("/").filter(Boolean);
    segments[0] = newLocale;
    const newPath = "/" + segments.join("/");
    document.cookie = `${COOKIE_LOCALE}=${newLocale};path=/;max-age=${60 * 60 * 24 * 365}`;
    router.push(newPath);
  }

  return (
    <select
      value={currentLocale}
      onChange={handleChange}
      aria-label="Select language and country"
      className="rounded-lg border border-outline bg-background-card px-3 py-1.5 text-sm text-text-heading focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
    >
      {SUPPORTED_LOCALES.map((loc) => (
        <option key={loc} value={loc}>
          {LOCALE_LABELS[loc]}
        </option>
      ))}
    </select>
  );
}
