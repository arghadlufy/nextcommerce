"use client";

import { useState, useTransition } from "react";
import { upsertLabel, getLabelsForLocale } from "@/lib/actions/label";
import { SUPPORTED_LOCALES, LOCALE_LABELS } from "@/lib/i18n-constants";
import type { Locale } from "@/lib/i18n-constants";

type Props = {
  initialLocale: string;
  initialData: Record<string, { key: string; value: string }[]>;
};

export function LabelEditor({ initialLocale, initialData }: Props) {
  const [locale, setLocale] = useState(initialLocale);
  const [data, setData] = useState(initialData);
  const [isPending, startTransition] = useTransition();
  const [savedKey, setSavedKey] = useState<string | null>(null);

  async function handleLocaleChange(newLocale: string) {
    setLocale(newLocale);
    const result = await getLabelsForLocale(newLocale);
    setData(result);
  }

  function handleChange(namespace: string, key: string, value: string) {
    setData((prev) => ({
      ...prev,
      [namespace]: prev[namespace].map((item) =>
        item.key === key ? { ...item, value } : item,
      ),
    }));
  }

  function handleSave(namespace: string, key: string, value: string) {
    startTransition(async () => {
      await upsertLabel(locale, namespace, key, value);
      setSavedKey(`${namespace}.${key}`);
      setTimeout(() => setSavedKey(null), 2000);
    });
  }

  return (
    <div>
      {/* Locale selector */}
      <div className="mb-8">
        <label className="mb-2 block text-sm font-medium text-text-body">
          Select locale
        </label>
        <select
          value={locale}
          onChange={(e) => handleLocaleChange(e.target.value)}
          className="rounded-lg border border-outline bg-background-card px-4 py-2 text-sm text-text-heading"
        >
          {SUPPORTED_LOCALES.map((loc) => (
            <option key={loc} value={loc}>
              {LOCALE_LABELS[loc as Locale]}
            </option>
          ))}
        </select>
      </div>

      {/* Labels grouped by namespace */}
      {Object.entries(data).map(([namespace, entries]) => (
        <div
          key={namespace}
          className="mb-8 rounded-2xl border border-outline bg-background-card p-6"
        >
          <h3 className="mb-4 text-lg font-bold uppercase tracking-wider text-text-heading">
            {namespace}
          </h3>
          <div className="flex flex-col gap-3">
            {entries.map((entry) => {
              const fullKey = `${namespace}.${entry.key}`;
              return (
                <div
                  key={entry.key}
                  className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4"
                >
                  <span className="w-48 shrink-0 text-xs font-mono text-text-body">
                    {entry.key}
                  </span>
                  <input
                    type="text"
                    value={entry.value}
                    onChange={(e) =>
                      handleChange(namespace, entry.key, e.target.value)
                    }
                    className="flex-1 rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading transition focus:border-primary focus:outline-none"
                  />
                  <button
                    onClick={() =>
                      handleSave(namespace, entry.key, entry.value)
                    }
                    disabled={isPending}
                    className="shrink-0 rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-text-inverse transition hover:opacity-90 disabled:opacity-50"
                  >
                    {savedKey === fullKey ? "Saved!" : "Save"}
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
