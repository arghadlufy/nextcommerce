import { mockProducts } from "@/lib/mocks";
import Link from "next/link";

export default function HomePage() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold mb-6 text-text-heading">Home</h1>

      <p className="text-text-body mb-6">Showing {mockProducts.length} products</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {mockProducts.map((product) => (
          <article
            key={product.id}
            className="rounded-lg border border-outline bg-background-card p-4 shadow-sm transition hover:border-primary"
          >
            <div className="aspect-square mb-3 overflow-hidden rounded-md bg-background">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={product.image}
                alt={product.name}
                className="h-full w-full object-cover"
              />
            </div>
            <h2 className="text-lg font-semibold text-text-heading mb-1">
              {product.name}
            </h2>
            <p className="text-sm text-text-body mb-3 line-clamp-2">
              {product.description}
            </p>
            <p className="text-text-heading font-medium mb-3">${product.price.toFixed(2)}</p>
            <Link
              href={`/products/${product.id}`}
              className="inline-block rounded-md border border-primary bg-primary px-4 py-2 text-sm font-medium text-text-inverse transition hover:opacity-90"
            >
              Add to cart
            </Link>
          </article>
        ))}
      </div>
    </main>
  );
}
