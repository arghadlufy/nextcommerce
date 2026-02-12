"use client";

import { useMemo, useState, useTransition } from "react";
import {
  updateProduct,
  upsertProductTranslation,
} from "@/lib/actions/admin-product";
import { useAppSelector, useAppDispatch } from "@/lib/hooks";
import {
  setSearchQuery,
  setCategoryId,
  setPriceRange,
  setSortBy,
  setPage,
  resetFilters,
  type SortBy,
} from "@/lib/features/admin-products/adminProductsSlice";

type Category = { id: string; name: string };

type Translation = {
  language: string;
  name: string;
  description: string | null;
};

type Product = {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image: string | null;
  slug: string;
  categoryId: string;
  category: Category;
  translations: Translation[];
};

const LANGUAGES = ["nl", "hi"];
const LANG_LABELS: Record<string, string> = {
  nl: "Dutch",
  hi: "Hindi",
};

export function ProductEditor({
  products: initialProducts,
  categories,
}: {
  products: Product[];
  categories: Category[];
}) {
  const [products, setProducts] = useState(initialProducts);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState<string | null>(null);

  // Redux filter state
  const dispatch = useAppDispatch();
  const { searchQuery, categoryId, priceMin, priceMax, sortBy, page, pageSize } =
    useAppSelector((state) => state.adminProducts);

  // Derive filtered, sorted, paginated products
  const { paginatedProducts, totalFiltered, totalPages } = useMemo(() => {
    let filtered = [...products];

    // Search by name
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((p) => p.name.toLowerCase().includes(q));
    }

    // Filter by category
    if (categoryId) {
      filtered = filtered.filter((p) => p.categoryId === categoryId);
    }

    // Price range
    if (priceMin !== null) {
      filtered = filtered.filter((p) => p.price >= priceMin);
    }
    if (priceMax !== null) {
      filtered = filtered.filter((p) => p.price <= priceMax);
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case "name-asc":
          return a.name.localeCompare(b.name);
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "price-asc":
          return a.price - b.price;
        case "price-desc":
          return b.price - a.price;
        default:
          return 0;
      }
    });

    const totalFiltered = filtered.length;
    const totalPages = Math.max(1, Math.ceil(totalFiltered / pageSize));

    // Paginate
    const start = (page - 1) * pageSize;
    const paginatedProducts = filtered.slice(start, start + pageSize);

    return { paginatedProducts, totalFiltered, totalPages };
  }, [products, searchQuery, categoryId, priceMin, priceMax, sortBy, page, pageSize]);

  function toggle(id: string) {
    setExpandedId((prev) => (prev === id ? null : id));
  }

  function updateField(id: string, field: string, value: string | number) {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, [field]: value } : p)),
    );
  }

  function updateTranslation(
    productId: string,
    language: string,
    field: string,
    value: string,
  ) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== productId) return p;
        const existing = p.translations.find((t) => t.language === language);
        if (existing) {
          return {
            ...p,
            translations: p.translations.map((t) =>
              t.language === language ? { ...t, [field]: value } : t,
            ),
          };
        }
        return {
          ...p,
          translations: [
            ...p.translations,
            { language, name: "", description: "", [field]: value },
          ],
        };
      }),
    );
  }

  function handleSaveProduct(product: Product) {
    startTransition(async () => {
      await updateProduct(product.id, {
        name: product.name,
        description: product.description ?? "",
        price: product.price,
        image: product.image ?? "",
        categoryId: product.categoryId,
      });
      setSaved(product.id);
      setTimeout(() => setSaved(null), 2000);
    });
  }

  function handleSaveTranslation(productId: string, language: string) {
    const product = products.find((p) => p.id === productId);
    const t = product?.translations.find((tr) => tr.language === language);
    if (!t) return;

    startTransition(async () => {
      await upsertProductTranslation(productId, language, {
        name: t.name,
        description: t.description ?? "",
      });
      setSaved(`${productId}-${language}`);
      setTimeout(() => setSaved(null), 2000);
    });
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Filter toolbar ── */}
      <div className="rounded-2xl border border-outline bg-background-card p-4">
        {/* Row 1: search + category + sort */}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {/* Search */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-body">
              Search by name
            </label>
            <input
              type="text"
              placeholder="e.g. Running Shoes"
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading placeholder:text-text-body/50 focus:border-primary focus:outline-none"
            />
          </div>

          {/* Category */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-body">
              Category
            </label>
            <select
              value={categoryId ?? ""}
              onChange={(e) =>
                dispatch(setCategoryId(e.target.value || null))
              }
              className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
            >
              <option value="">All categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Price range */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-text-body">
                Min price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="0"
                value={priceMin ?? ""}
                onChange={(e) =>
                  dispatch(
                    setPriceRange({
                      min: e.target.value ? parseFloat(e.target.value) : null,
                      max: priceMax,
                    }),
                  )
                }
                className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading placeholder:text-text-body/50 focus:border-primary focus:outline-none"
              />
            </div>
            <div className="flex-1">
              <label className="mb-1 block text-xs font-medium text-text-body">
                Max price
              </label>
              <input
                type="number"
                step="0.01"
                min="0"
                placeholder="999"
                value={priceMax ?? ""}
                onChange={(e) =>
                  dispatch(
                    setPriceRange({
                      min: priceMin,
                      max: e.target.value ? parseFloat(e.target.value) : null,
                    }),
                  )
                }
                className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading placeholder:text-text-body/50 focus:border-primary focus:outline-none"
              />
            </div>
          </div>

          {/* Sort */}
          <div>
            <label className="mb-1 block text-xs font-medium text-text-body">
              Sort by
            </label>
            <select
              value={sortBy}
              onChange={(e) => dispatch(setSortBy(e.target.value as SortBy))}
              className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
            >
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="price-asc">Price Low–High</option>
              <option value="price-desc">Price High–Low</option>
            </select>
          </div>
        </div>

        {/* Row 2: result count + reset */}
        <div className="mt-3 flex items-center justify-between">
          <span className="text-xs text-text-body">
            {totalFiltered} product{totalFiltered !== 1 ? "s" : ""} found
          </span>
          <button
            onClick={() => dispatch(resetFilters())}
            className="text-xs font-medium text-primary transition hover:opacity-80"
          >
            Reset filters
          </button>
        </div>
      </div>

      {/* ── Product list ── */}
      {paginatedProducts.length === 0 ? (
        <p className="py-8 text-center text-sm text-text-body">
          No products match your filters.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {paginatedProducts.map((product) => {
            const isExpanded = expandedId === product.id;
            return (
              <div
                key={product.id}
                className="rounded-2xl border border-outline bg-background-card overflow-hidden"
              >
                {/* Row header */}
                <button
                  onClick={() => toggle(product.id)}
                  className="flex w-full items-center justify-between px-5 py-4 text-left transition hover:bg-background"
                >
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-semibold text-text-heading">
                      {product.name}
                    </span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                      {product.category.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-sm font-bold text-primary">
                      ${product.price.toFixed(2)}
                    </span>
                    <svg
                      className={`h-4 w-4 text-text-body transition-transform ${isExpanded ? "rotate-180" : ""}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </button>

                {/* Expanded edit form */}
                {isExpanded && (
                  <div className="border-t border-outline px-5 py-5">
                    {/* Main fields */}
                    <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text-body">Name</label>
                        <input
                          type="text"
                          value={product.name}
                          onChange={(e) => updateField(product.id, "name", e.target.value)}
                          className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text-body">Price</label>
                        <input
                          type="number"
                          step="0.01"
                          value={product.price}
                          onChange={(e) => updateField(product.id, "price", parseFloat(e.target.value) || 0)}
                          className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div className="sm:col-span-2">
                        <label className="mb-1 block text-xs font-medium text-text-body">Description</label>
                        <textarea
                          value={product.description ?? ""}
                          onChange={(e) => updateField(product.id, "description", e.target.value)}
                          rows={2}
                          className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text-body">Image URL</label>
                        <input
                          type="text"
                          value={product.image ?? ""}
                          onChange={(e) => updateField(product.id, "image", e.target.value)}
                          className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="mb-1 block text-xs font-medium text-text-body">Category</label>
                        <select
                          value={product.categoryId}
                          onChange={(e) => updateField(product.id, "categoryId", e.target.value)}
                          className="w-full rounded-lg border border-outline bg-background px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                        >
                          {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <button
                      onClick={() => handleSaveProduct(product)}
                      disabled={isPending}
                      className="mb-6 rounded-lg bg-primary px-5 py-2 text-sm font-semibold text-text-inverse transition hover:opacity-90 disabled:opacity-50"
                    >
                      {saved === product.id ? "Saved!" : "Save Product"}
                    </button>

                    {/* Translations */}
                    <h4 className="mb-3 text-sm font-bold uppercase tracking-wider text-text-heading">
                      Translations
                    </h4>
                    {LANGUAGES.map((lang) => {
                      const t = product.translations.find((tr) => tr.language === lang) || {
                        language: lang,
                        name: "",
                        description: "",
                      };
                      return (
                        <div
                          key={lang}
                          className="mb-4 rounded-xl border border-outline/50 bg-background p-4"
                        >
                          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                            {LANG_LABELS[lang] ?? lang}
                          </p>
                          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                            <div>
                              <label className="mb-1 block text-xs text-text-body">Name</label>
                              <input
                                type="text"
                                value={t.name}
                                onChange={(e) => updateTranslation(product.id, lang, "name", e.target.value)}
                                className="w-full rounded-lg border border-outline bg-background-card px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="mb-1 block text-xs text-text-body">Description</label>
                              <input
                                type="text"
                                value={t.description ?? ""}
                                onChange={(e) => updateTranslation(product.id, lang, "description", e.target.value)}
                                className="w-full rounded-lg border border-outline bg-background-card px-3 py-2 text-sm text-text-heading focus:border-primary focus:outline-none"
                              />
                            </div>
                          </div>
                          <button
                            onClick={() => handleSaveTranslation(product.id, lang)}
                            disabled={isPending}
                            className="mt-3 rounded-lg bg-secondary px-4 py-1.5 text-xs font-semibold text-text-inverse transition hover:opacity-90 disabled:opacity-50"
                          >
                            {saved === `${product.id}-${lang}` ? "Saved!" : `Save ${LANG_LABELS[lang]}`}
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* ── Pagination ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={() => dispatch(setPage(page - 1))}
            disabled={page <= 1}
            className="rounded-lg border border-outline px-3 py-1.5 text-sm font-medium text-text-body transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-outline disabled:hover:text-text-body"
          >
            Previous
          </button>
          <span className="text-sm text-text-body">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => dispatch(setPage(page + 1))}
            disabled={page >= totalPages}
            className="rounded-lg border border-outline px-3 py-1.5 text-sm font-medium text-text-body transition hover:border-primary hover:text-primary disabled:opacity-40 disabled:hover:border-outline disabled:hover:text-text-body"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
