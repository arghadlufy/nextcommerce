export function formatPrice(price: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(price);
}

/**
 * Artificial delay for testing loading states (e.g. loading.tsx / Suspense).
 * Usage: `await delay(3000);`
 * Remove or guard behind a flag before shipping to production.
 */
export function delay(ms: number = 2000): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
