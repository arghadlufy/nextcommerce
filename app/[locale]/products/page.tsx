import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";
import { ProductCard } from "../ProductCard";
import { db } from "@/lib/db";
import { delay } from "@/lib/utils";
import { Pagination } from "@/components/Pagination";
import ProductsSkeleton from "./ProductsSkeleton";
import { Suspense } from "react";
import { PAGE_SIZE } from "@/lib/constants";

// Products component
// Fetching happens here so we can wrap it in Suspense.
async function Products({ page }: { page: number }) {
  const skip = (page - 1) * PAGE_SIZE;

  const products = await db.product.findMany({
    include: { category: true },
    skip,
    take: PAGE_SIZE,
  });

  // await delay(3000); // artificial delay – test loading state

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function ProductsPage({
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
  const totalPages = Math.ceil(totalProducts / PAGE_SIZE);

  const dict = await getDictionary(locale as Locale);

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold uppercase tracking-wider text-text-heading sm:text-4xl">
        {dict.common.products}
      </h1>

      <p className="mb-6 text-text-body">
        {dict.products.showingCount.replace("{count}", String(totalProducts))}
      </p>

      <div className="flex flex-col gap-6">
        <Suspense key={page} fallback={<ProductsSkeleton />}>
          <Products page={page} />
        </Suspense>
        <Pagination currentPage={page} totalPages={totalPages} />
      </div>
    </main>
  );
}
