import type { Prisma } from "@/app/generated/prisma/client";

// ---------------------------------------------------------------------------
// Types for products & categories that include their translation relations.
// These match the shape returned by Prisma when using `include: { translations: true }`.
// ---------------------------------------------------------------------------

/** Product with translations and category (which also has translations). */
export type ProductWithTranslations = Prisma.ProductGetPayload<{
  include: {
    translations: true;
    category: { include: { translations: true } };
  };
}>;

/** Category with translations. */
export type CategoryWithTranslations = Prisma.CategoryGetPayload<{
  include: { translations: true };
}>;

// ---------------------------------------------------------------------------
// Resolved types – the shape components actually consume (no raw translation arrays).
// ---------------------------------------------------------------------------

export type ResolvedProduct = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  slug: string;
  categoryId: string;
  category: ResolvedCategory;
};

export type ResolvedCategory = {
  id: string;
  name: string;
  slug: string;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Extract the language code from a full locale string.
 * e.g. "en-BE" → "en",  "nl-BE" → "nl",  "hi-IN" → "hi"
 */
export function getLanguageFromLocale(locale: string): string {
  return locale.split("-")[0];
}

/**
 * Resolve a category to the correct language, falling back to the
 * English fields stored on the main table.
 */
export function resolveCategory(
  category: CategoryWithTranslations,
  locale: string,
): ResolvedCategory {
  const lang = getLanguageFromLocale(locale);
  const t = category.translations.find((tr) => tr.language === lang);

  return {
    id: category.id,
    name: t?.name ?? category.name,
    slug: category.slug,
  };
}

/**
 * Resolve a product (including its nested category) to the correct language,
 * falling back to the English fields stored on the main table.
 */
export function resolveProduct(
  product: ProductWithTranslations,
  locale: string,
): ResolvedProduct {
  const lang = getLanguageFromLocale(locale);
  const t = product.translations.find((tr) => tr.language === lang);

  return {
    id: product.id,
    name: t?.name ?? product.name,
    description: t?.description ?? product.description,
    price: product.price,
    image: product.image,
    slug: product.slug,
    categoryId: product.categoryId,
    category: resolveCategory(product.category, locale),
  };
}
