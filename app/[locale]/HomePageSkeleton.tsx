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

function BannerSkeleton() {
  return (
    <div className="w-full animate-pulse bg-outline/20">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-6 py-24 sm:py-32 md:py-40">
        {/* Heading */}
        <div className="h-12 w-3/4 max-w-lg rounded-lg bg-outline/30 sm:h-16" />
        {/* Subtitle */}
        <div className="mt-4 h-5 w-1/2 max-w-xs rounded-full bg-outline/30" />
        {/* CTA button */}
        <div className="mt-8 h-12 w-40 rounded-full bg-outline/30" />
      </div>
    </div>
  );
}

function CategoryCardSkeleton() {
  return (
    <div className="aspect-4/3 animate-pulse rounded-2xl bg-outline/20">
      <div className="flex h-full items-center justify-center">
        <div className="h-6 w-24 rounded-full bg-outline/30" />
      </div>
    </div>
  );
}

export function HomePageSkeleton() {
  return (
    <>
      {/* Banner skeleton */}
      <BannerSkeleton />

      {/* Products section skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        {/* Section heading row */}
        <div className="mb-8 flex items-center justify-between">
          <div className="h-8 w-40 rounded-lg bg-outline/30" />
          <div className="h-4 w-20 rounded-full bg-outline/30" />
        </div>
        {/* Product grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {Array.from({ length: 3 }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      </section>

      {/* Categories section skeleton */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 animate-pulse">
        <div className="mb-8 h-8 w-48 rounded-lg bg-outline/30" />
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CategoryCardSkeleton key={i} />
          ))}
        </div>
      </section>
    </>
  );
}
