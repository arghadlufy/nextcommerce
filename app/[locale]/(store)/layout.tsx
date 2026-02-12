import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LocaleSelector } from "@/components/LocaleSelector";
import Link from "next/link";
import { getDictionary } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";

export default async function StoreLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const dict = await getDictionary(locale as Locale);

  return (
    <>
      <header className="sticky top-0 z-10 border-b border-outline bg-background-card/80 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4 sm:px-6">
          {/* Logo + nav */}
          <div className="flex items-center gap-8">
            <Link
              href={`/${locale}`}
              className="flex items-center gap-2 text-lg font-bold tracking-tight text-text-heading transition hover:text-primary"
            >
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-sm font-black text-text-inverse">
                N
              </span>
              <span className="hidden sm:inline">nextcommerce</span>
            </Link>

            <nav>
              <ul className="flex items-center gap-1">
                <li>
                  <Link
                    href={`/${locale}`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-body transition hover:bg-background hover:text-text-heading"
                  >
                    {dict.common.home}
                  </Link>
                </li>
                <li>
                  <Link
                    href={`/${locale}/products`}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-body transition hover:bg-background hover:text-text-heading"
                  >
                    {dict.common.products}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/admin"
                    className="rounded-lg px-3 py-1.5 text-sm font-medium text-text-body transition hover:bg-background hover:text-text-heading"
                  >
                    CMS
                  </Link>
                </li>
              </ul>
            </nav>
          </div>

          {/* Right side controls */}
          <div className="flex items-center gap-3">
            <LocaleSelector />
            <ThemeSwitcher />
          </div>
        </div>
      </header>
      {children}
    </>
  );
}
