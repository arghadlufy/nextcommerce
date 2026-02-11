import { notFound } from "next/navigation";
import Link from "next/link";
import { mockProducts } from "@/lib/mocks";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";

export default async function LocaleProductPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  if (!hasLocale(locale)) notFound();

  const product = mockProducts.find((p) => p.id === id);
  if (!product) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-text-heading mb-4">{product.name}</h1>
      <p className="text-text-body mb-4">{product.description}</p>
      <p className="text-text-heading font-medium mb-4">
        ${product.price.toFixed(2)}
      </p>
      <Link
        href={`/${locale}`}
        className="inline-block rounded-md border border-outline bg-background-card px-4 py-2 text-text-heading transition hover:border-primary hover:bg-primary hover:text-text-inverse"
      >
        {dict.products.backToHome}
      </Link>
    </main>
  );
}
