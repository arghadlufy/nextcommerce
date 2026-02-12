"use client";

import { useState, useTransition } from "react";
import {
  updateCategory,
  upsertCategoryTranslation,
} from "@/lib/actions/admin-category";

type Translation = { language: string; name: string };

type Category = {
  id: string;
  name: string;
  slug: string;
  translations: Translation[];
};

const LANGUAGES = ["nl", "hi"];
const LANG_LABELS: Record<string, string> = {
  nl: "Dutch",
  hi: "Hindi",
};

export function CategoryEditor({
  categories: initialCategories,
}: {
  categories: Category[];
}) {
  const [categories, setCategories] = useState(initialCategories);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);

  function updateField(id: string, field: string, value: string) {
    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, [field]: value } : c)),
    );
  }

  function updateTranslation(catId: string, language: string, name: string) {
    setCategories((prev) =>
      prev.map((c) => {
        if (c.id !== catId) return c;
        const existing = c.translations.find((t) => t.language === language);
        if (existing) {
          return {
            ...c,
            translations: c.translations.map((t) =>
              t.language === language ? { ...t, name } : t,
            ),
          };
        }
        return {
          ...c,
          translations: [...c.translations, { language, name }],
        };
      }),
    );
  }

  function handleSave(cat: Category) {
    startTransition(async () => {
      await updateCategory(cat.id, { name: cat.name, slug: cat.slug });
      setSaved(cat.id);
      setTimeout(() => setSaved(null), 2000);
    });
  }

  function handleSaveTranslation(catId: string, language: string) {
    const cat = categories.find((c) => c.id === catId);
    const t = cat?.translations.find((tr) => tr.language === language);
    if (!t) return;

    startTransition(async () => {
      await upsertCategoryTranslation(catId, language, t.name);
      setSaved(`${catId}-${language}`);
      setTimeout(() => setSaved(null), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-4">
      {categories.map((cat) => (
        <div
          key={cat.id}
          className="rounded-2xl border border-outline bg-background-card p-5"
        >
          {/* Main fields */}
          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-text-body">
                Name
              </label>
              <input
                type="text"
                value={cat.name}
                onChange={(e) => updateField(cat.id, "name", e.target.value)}
                className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs font-medium text-text-body">
                Slug
              </label>
              <input
                type="text"
                value={cat.slug}
                onChange={(e) => updateField(cat.id, "slug", e.target.value)}
                className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={() => handleSave(cat)}
                disabled={isPending}
                className="rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-text-inverse transition hover:opacity-90 disabled:opacity-50"
              >
                {saved === cat.id ? "Saved!" : "Save"}
              </button>
            </div>
          </div>

          {/* Translations */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {LANGUAGES.map((lang) => {
              const t = cat.translations.find((tr) => tr.language === lang) || {
                language: lang,
                name: "",
              };
              return (
                <div
                  key={lang}
                  className="rounded-xl border border-outline/50 bg-background p-3"
                >
                  <p className="mb-2 text-xs font-semibold uppercase tracking-wider text-primary">
                    {LANG_LABELS[lang] ?? lang}
                  </p>
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      value={t.name}
                      onChange={(e) =>
                        updateTranslation(cat.id, lang, e.target.value)
                      }
                      placeholder="Translated name"
                      className="flex-1 rounded-lg border border-outline bg-background-card px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                    />
                    <button
                      onClick={() => handleSaveTranslation(cat.id, lang)}
                      disabled={isPending}
                      className="shrink-0 rounded-lg bg-secondary px-3 py-2 text-xs font-semibold text-text-inverse transition hover:opacity-90 disabled:opacity-50"
                    >
                      {saved === `${cat.id}-${lang}` ? "Saved!" : "Save"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
