"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function NotFound() {
  const pathname = usePathname();
  // Extract locale from the first path segment (e.g. /en-IN/products/xyz -> en-IN)
  const locale = pathname.split("/")[1] || "en-BE";

  return (
    <main className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      {/* 404 number */}
      <p className="text-[8rem] font-black leading-none tracking-tighter text-primary sm:text-[10rem]">
        404
      </p>

      {/* Heading */}
      <h1 className="mt-4 text-3xl font-bold text-text-heading sm:text-4xl">
        Page not found
      </h1>

      {/* Description */}
      <p className="mt-3 max-w-md text-text-body">
        Sorry, we couldn&apos;t find the page you&apos;re looking for. It might
        have been removed, renamed, or doesn&apos;t exist.
      </p>

      {/* Action buttons */}
      <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
        <Link
          href={`/${locale}`}
          className="rounded-xl bg-primary px-6 py-3 text-sm font-semibold text-text-inverse transition hover:opacity-90 active:scale-95"
        >
          Go Home
        </Link>
        <Link
          href={`/${locale}/contact`}
          className="rounded-xl border-2 border-outline px-6 py-3 text-sm font-semibold text-text-heading transition hover:border-primary hover:text-primary active:scale-95"
        >
          Contact Us
        </Link>
      </div>
    </main>
  );
}
