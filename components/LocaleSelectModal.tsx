"use client";

import { useState } from "react";
import { setLocaleAndRedirect } from "@/app/actions/locale";
import {
  SUPPORTED_LOCALES,
  LOCALE_LABELS,
  type Locale,
} from "@/lib/i18n-constants";

const MODAL_LABELS = {
  title: "Select your region",
  selectLabel: "Language & country",
  continueLabel: "Continue",
};

export function LocaleSelectModal() {
  const [locale, setLocale] = useState<Locale>("en-BE");
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.SyntheticEvent) {
    e.preventDefault();
    setPending(true);
    await setLocaleAndRedirect(locale);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/90 p-4">
      <div
        className="w-full max-w-md rounded-xl border border-outline bg-background-card p-6 shadow-lg"
        role="dialog"
        aria-modal="true"
        aria-labelledby="locale-modal-title"
      >
        <h1
          id="locale-modal-title"
          className="text-xl font-semibold text-text-heading mb-4"
        >
          {MODAL_LABELS.title}
        </h1>
        <form onSubmit={handleSubmit}>
          <label
            htmlFor="locale-select"
            className="block text-sm font-medium text-text-body mb-2"
          >
            {MODAL_LABELS.selectLabel}
          </label>
          <select
            id="locale-select"
            value={locale}
            onChange={(e) => setLocale(e.target.value as Locale)}
            className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-text-heading focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            disabled={pending}
          >
            {SUPPORTED_LOCALES.map((loc) => (
              <option key={loc} value={loc}>
                {LOCALE_LABELS[loc]}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="mt-6 w-full rounded-lg bg-primary px-4 py-3 font-medium text-text-inverse transition hover:opacity-90 disabled:opacity-70"
            disabled={pending}
          >
            {pending ? "..." : MODAL_LABELS.continueLabel}
          </button>
        </form>
      </div>
    </div>
  );
}
