import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";
import { ProductCard } from "./ProductCard";
import { db } from "@/lib/db";
import { delay } from "@/lib/utils";
import { Pagination } from "@/components/Pagination";

export default async function LocaleHomePage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const { locale } = await params;
  const { page: pageParam } = await searchParams;

  if (!hasLocale(locale)) notFound();

  const page = Number(pageParam) || 1;
  const pageSize = 3;
  const skip = (page - 1) * pageSize;

  const products = await db.product.findMany({
    include: { category: true },
    skip,
    take: pageSize,
  });

  const totalProducts = await db.product.count();
  const totalPages = Math.ceil(totalProducts / pageSize);

  await delay(3000); // artificial delay – test loading state

  const dict = await getDictionary(locale as Locale);
  const showingText = dict.products.showingCount.replace(
    "{count}",
    String(products.length),
  );

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-text-heading">
        {dict.common.home}
      </h1>

      <p className="text-text-body mb-6">{showingText}</p>
      <div className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </main>
  );
}
