import { notFound } from "next/navigation";
import Link from "next/link";
import { mockProducts } from "@/lib/mocks";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";
import { ProductCard } from "./ProductCard";

export default async function LocaleHomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);
  const showingText = dict.products.showingCount.replace(
    "{count}",
    String(mockProducts.length),
  );

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-text-heading">
        {dict.common.home}
      </h1>

      <p className="text-text-body mb-6">{showingText}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </main>
  );
}
