import Link from "next/link";

export default function ProductsPage() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8">
      <h1 className="text-3xl font-bold text-text-heading mb-4">Products</h1>
      <p className="text-text-body mb-6">
        Browse all products. Theme uses semantic colors (background, text-heading, text-body) and
        custom breakpoints: sm 481px, md 769px, lg 1280px, xl 1536px.
      </p>
      <Link
        href="/"
        className="inline-block rounded-md border border-outline bg-background-card px-4 py-2 text-text-heading transition hover:border-primary hover:bg-primary hover:text-text-inverse"
      >
        Back to home
      </Link>
    </main>
  );
}
