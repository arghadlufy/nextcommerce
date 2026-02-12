import Image from "next/image";
import Link from "next/link";
import { getProductBySlug } from "@/lib/actions/product";
import { formatPrice } from "@/lib/utils";
import { notFound } from "next/navigation";

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;

  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Back link */}
      <Link
        href={`/${locale}/products`}
        className="mb-8 inline-flex items-center gap-2 text-sm font-medium text-text-body transition hover:text-primary"
      >
        <svg
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M15 19l-7-7 7-7"
          />
        </svg>
        Back to products
      </Link>

      {/* Product grid */}
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 md:gap-12">
        {/* Left: Image */}
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-background">
          <Image
            src={product.image ?? ""}
            alt={product.name}
            fill
            priority
            sizes="(max-width: 769px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        {/* Right: Product info */}
        <div className="flex flex-col gap-6">
          {/* Category */}
          <span className="w-fit rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-primary">
            {product.category.name}
          </span>

          {/* Name */}
          <h1 className="text-3xl font-bold leading-tight text-text-heading sm:text-4xl">
            {product.name}
          </h1>

          {/* Description */}
          <p className="text-base leading-relaxed text-text-body">
            {product.description}
          </p>

          {/* Divider */}
          <hr className="border-outline/30" />

          {/* Price */}
          <p className="text-3xl font-bold text-primary">
            {formatPrice(product.price)}
          </p>

          {/* Add to Cart */}
          <button className="w-full rounded-xl bg-primary px-6 py-4 text-base font-semibold text-text-inverse transition hover:opacity-90 active:scale-[0.98]">
            Add to Cart
          </button>

          {/* Extra info */}
          <div className="flex items-center gap-2 text-sm text-text-body">
            <svg
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M5 13l4 4L19 7"
              />
            </svg>
            Free delivery on orders over $50.0
          </div>
        </div>
      </div>
    </main>
  );
}
