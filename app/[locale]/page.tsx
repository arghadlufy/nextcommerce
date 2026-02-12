import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";
import { ProductCard } from "./ProductCard";
import { db } from "@/lib/db";
import { delay } from "@/lib/utils";
import { Pagination } from "@/components/Pagination";
import ProductsSkeleton from "./products/ProductsSkeleton";
import { Suspense } from "react";

const pageSize = 3;

// Products component
// fetching should happen here as we will wrap this in suspense.
async function Products({ page }: { page: number }) {
  const skip = (page - 1) * pageSize;

  const products = await db.product.findMany({
    include: { category: true },
    skip,
    take: pageSize,
  });

  await delay(3000); // artificial delay – test loading state

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

// Page component
// searchParams pages the page dynamic, so this lost the capabilty of skeleton loading.
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

  const totalProducts = await db.product.count();

  const page = Number(pageParam) || 1;
  const totalPages = Math.ceil(totalProducts / pageSize);

  const dict = await getDictionary(locale as Locale);
  const showingText = dict.products.showingCount.replace(
    "{count}",
    String(totalProducts),
  );

  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-text-heading">
        {dict.common.home}
      </h1>

      <p className="text-text-body mb-6">{showingText}</p>
      <div className="flex flex-col gap-4">
        {/* Suspense is used to wrap the Products component and handle the loading state. */}
        <Suspense key={page} fallback={<ProductsSkeleton />}>
          <Products key={page} page={page} />
        </Suspense>
        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </main>
  );
}
