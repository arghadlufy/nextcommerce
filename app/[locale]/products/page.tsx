import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";

export default async function LocaleProductsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(locale)) notFound();

  const dict = await getDictionary(locale as Locale);

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-text-heading mb-4">
        {dict.common.products}
      </h1>
      <p className="text-text-body mb-6">{dict.products.browseDescription}</p>
      <Link
        href={`/${locale}`}
        className="inline-block rounded-md border border-outline bg-background-card px-4 py-2 text-text-heading transition hover:border-primary hover:bg-primary hover:text-text-inverse"
      >
        {dict.products.backToHome}
      </Link>
    </main>
  );
}
