import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";
import { ProductCard } from "./ProductCard";
import { db } from "@/lib/db";
import { Banner } from "@/components/Banner";
import { CategoriesBanner } from "@/components/CategoriesBanner";
import { resolveProduct } from "@/lib/i18n-db";

// Show first 3 products on the homepage as a preview
async function FeaturedProducts({ locale }: { locale: string }) {
  const products = await db.product.findMany({
    include: {
      category: { include: { translations: true } },
      translations: true,
    },
    take: 3,
  });

  const resolved = products.map((p) => resolveProduct(p, locale));

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {resolved.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <>
      {/* Hero banner */}
      <Banner locale={locale} dict={dict} />

      {/* Featured products section */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        {/* Section heading row */}
        <div className="mb-8 flex items-center justify-between">
          <h2 className="text-2xl font-bold uppercase tracking-wider text-text-heading sm:text-3xl">
            {dict.common.products}
          </h2>
          <Link
            href={`/${locale}/products`}
            className="text-sm font-semibold uppercase tracking-wider text-primary transition hover:opacity-80"
          >
            {dict.home.seeAll}
          </Link>
        </div>

        <FeaturedProducts locale={locale} />
      </section>

      {/* Categories banner */}
      <CategoriesBanner locale={locale} dict={dict} />
    </>
  );
}
