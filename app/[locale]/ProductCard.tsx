"use client";

import Link from "next/link";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { useLocale } from "@/contexts/I18nContext";
import type { ResolvedProduct } from "@/lib/i18n-db";

type ProductCardProps = {
  product: ResolvedProduct;
};

export function ProductCard({ product }: ProductCardProps) {
  const locale = useLocale();
  return (
    <Link href={`/${locale}/products/${product.slug}`} className="block">
      <article className="group relative overflow-hidden rounded-2xl border border-outline bg-background-card shadow-sm transition-all duration-300 hover:border-primary hover:shadow-xl hover:-translate-y-1">
        <div className="relative aspect-square overflow-hidden bg-background">
          <Image
            src={product.image ?? ""}
            alt={product.name}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="flex flex-col gap-3 p-5">
          <div>
            <span className="text-xs font-medium uppercase tracking-wider text-primary">
              {product.category.name}
            </span>
            <h3 className="mt-1 text-lg font-semibold leading-tight text-text-heading">
              {product.name}
            </h3>
          </div>
          <p className="line-clamp-2 text-sm text-text-body">
            {product.description}
          </p>
          <div className="mt-auto flex items-center justify-between gap-3">
            <p className="text-xl font-bold text-primary">
              {formatPrice(product.price)}
            </p>
            <button
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("Add to Cart");
              }}
              className="relative z-10 rounded-xl bg-primary px-4 py-2 text-sm font-semibold text-text-inverse transition hover:opacity-90 active:scale-95"
            >
              Add to Cart
            </button>
          </div>
        </div>
      </article>
    </Link>
  );
}
