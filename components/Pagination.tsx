"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
  /** How many sibling pages to show around current page (default: 1) */
  siblings?: number;
};

/**
 * Build the list of page numbers + ellipsis markers to render.
 *
 * Examples (siblings = 1):
 *   totalPages=1  → [1]
 *   totalPages=2  → [1, 2]
 *   totalPages=3  → [1, 2, 3]
 *   totalPages=7, current=1  → [1, 2, 3, "…", 7]
 *   totalPages=7, current=4  → [1, "…", 3, 4, 5, "…", 7]
 *   totalPages=7, current=7  → [1, "…", 5, 6, 7]
 */
function getPageNumbers(
  current: number,
  total: number,
  siblings: number,
): (number | "…")[] {
  // If total pages fit without truncation, show all
  // boundary pages (first + last) = 2, sibling window = 2*siblings + 1, 2 ellipsis slots = 2
  const maxSlots = 2 * siblings + 5; // first + last + 2 ellipsis + window
  if (total <= maxSlots) {
    return Array.from({ length: total }, (_, i) => i + 1);
  }

  const left = Math.max(current - siblings, 1);
  const right = Math.min(current + siblings, total);

  const showLeftEllipsis = left > 2;
  const showRightEllipsis = right < total - 1;

  const pages: (number | "…")[] = [];

  // Always show first page
  pages.push(1);

  if (showLeftEllipsis) {
    pages.push("…");
  } else {
    // Fill from 2 to left-1
    for (let i = 2; i < left; i++) pages.push(i);
  }

  // Sibling window
  for (let i = left; i <= right; i++) {
    if (i !== 1 && i !== total) pages.push(i);
  }

  if (showRightEllipsis) {
    pages.push("…");
  } else {
    for (let i = right + 1; i < total; i++) pages.push(i);
  }

  // Always show last page
  if (total > 1) pages.push(total);

  return pages;
}

export function Pagination({
  currentPage,
  totalPages,
  siblings = 1,
}: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  if (totalPages <= 1) return null;

  function buildHref(page: number): string {
    const params = new URLSearchParams(searchParams.toString());
    if (page <= 1) {
      params.delete("page");
    } else {
      params.set("page", String(page));
    }
    const qs = params.toString();
    return qs ? `${pathname}?${qs}` : pathname;
  }

  const pages = getPageNumbers(currentPage, totalPages, siblings);
  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  const baseBtn =
    "inline-flex items-center justify-center rounded-lg border text-sm font-medium transition min-w-[2.25rem] h-9 px-3";
  const activeBtn =
    "border-primary bg-primary text-text-inverse";
  const defaultBtn =
    "border-outline bg-background-card text-text-heading hover:border-primary hover:bg-background";
  const disabledBtn =
    "border-outline bg-background-card text-text-body opacity-50 pointer-events-none";
  const ellipsisStyle =
    "inline-flex items-center justify-center min-w-[2.25rem] h-9 text-text-body text-sm select-none";

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1.5">
      {/* Prev */}
      {isFirst ? (
        <span className={`${baseBtn} ${disabledBtn}`} aria-disabled="true">
          <ChevronLeft />
          <span className="sr-only">Previous</span>
        </span>
      ) : (
        <Link
          href={buildHref(currentPage - 1)}
          className={`${baseBtn} ${defaultBtn}`}
          aria-label="Previous page"
        >
          <ChevronLeft />
        </Link>
      )}

      {/* Page numbers */}
      {pages.map((page, idx) =>
        page === "…" ? (
          <span key={`ellipsis-${idx}`} className={ellipsisStyle}>
            &hellip;
          </span>
        ) : page === currentPage ? (
          <span
            key={page}
            className={`${baseBtn} ${activeBtn}`}
            aria-current="page"
          >
            {page}
          </span>
        ) : (
          <Link
            key={page}
            href={buildHref(page)}
            className={`${baseBtn} ${defaultBtn}`}
          >
            {page}
          </Link>
        ),
      )}

      {/* Next */}
      {isLast ? (
        <span className={`${baseBtn} ${disabledBtn}`} aria-disabled="true">
          <ChevronRight />
          <span className="sr-only">Next</span>
        </span>
      ) : (
        <Link
          href={buildHref(currentPage + 1)}
          className={`${baseBtn} ${defaultBtn}`}
          aria-label="Next page"
        >
          <ChevronRight />
        </Link>
      )}
    </nav>
  );
}

/* Small inline SVG icons so we don't need an icon library */

function ChevronLeft() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ChevronRight() {
  return (
    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
    </svg>
  );
}
