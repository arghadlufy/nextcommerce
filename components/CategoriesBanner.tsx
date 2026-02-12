import Link from "next/link";
import { db } from "@/lib/db";
import type { Dictionary } from "@/lib/i18n";
import { resolveCategory } from "@/lib/i18n-db";

/**
 * Rotating accent styles for category cards (no images).
 * Each card picks a style based on its index, cycling through the list.
 */
const cardStyles = [
  "from-primary/80 to-primary/40",
  "from-secondary/80 to-secondary/40",
  "from-background/80 to-background/40",
  "from-primary/60 to-secondary/60",
];

type CategoriesBannerProps = {
  locale: string;
  dict: Dictionary;
};

export async function CategoriesBanner({
  locale,
  dict,
}: CategoriesBannerProps) {
  const categories = await db.category.findMany({
    include: { translations: true },
    orderBy: { name: "asc" },
  });

  if (categories.length === 0) return null;

  const resolved = categories.map((cat) => resolveCategory(cat, locale));

  return (
    <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h2 className="mb-8 text-2xl font-bold uppercase tracking-wider text-text-heading sm:text-3xl">
        {dict.home.categories}
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {resolved.map((cat, i) => (
          <Link
            key={cat.id}
            href={`/${locale}/products?category=${cat.slug}`}
            className="group relative flex aspect-4/3 items-center justify-center overflow-hidden rounded-2xl transition-transform duration-300 hover:-translate-y-1 hover:shadow-xl"
          >
            {/* Gradient background */}
            <div
              className={`absolute inset-0 bg-linear-to-br ${cardStyles[i % cardStyles.length]} transition-opacity duration-300 group-hover:opacity-90`}
            />

            {/* Category name */}
            <span className="relative text-xl font-bold uppercase tracking-widest text-text-heading sm:text-2xl">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
