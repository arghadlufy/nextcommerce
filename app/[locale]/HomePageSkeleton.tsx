function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-outline bg-background-card shadow-sm animate-pulse">
      {/* Image placeholder */}
      <div className="aspect-square bg-outline/30" />
      <div className="flex flex-col gap-3 p-5">
        {/* Category */}
        <div className="h-3 w-20 rounded-full bg-outline/30" />
        {/* Title */}
        <div className="h-5 w-3/4 rounded-full bg-outline/30" />
        {/* Description line 1 */}
        <div className="h-3 w-full rounded-full bg-outline/30" />
        {/* Description line 2 */}
        <div className="h-3 w-2/3 rounded-full bg-outline/30" />
        {/* Price + button row */}
        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <div className="h-6 w-16 rounded-full bg-outline/30" />
          <div className="h-10 w-24 rounded-xl bg-outline/30" />
        </div>
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <main className="container mx-auto p-4 sm:p-6 lg:p-8 animate-pulse">
      {/* Heading */}
      <div className="mb-6 h-9 w-32 rounded-lg bg-outline/30" />
      {/* Showing count */}
      <div className="mb-6 h-4 w-48 rounded-full bg-outline/30" />
      {/* Product grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {Array.from({ length: 6 }).map((_, i) => (
          <ProductCardSkeleton key={i} />
        ))}
      </div>
    </main>
  );
}
