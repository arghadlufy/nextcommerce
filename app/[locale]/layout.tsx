import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "@/lib/i18n";
import type { Locale } from "@/lib/i18n-constants";
import { I18nProvider } from "@/contexts/I18nContext";
import { SetLang } from "@/components/SetLang";
import { ThemeSwitcher } from "@/components/ThemeSwitcher";
import { LocaleSelector } from "@/components/LocaleSelector";

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(locale)) {
    notFound();
  }

  const dict = await getDictionary(locale as Locale);

  return (
    <I18nProvider locale={locale as Locale} dict={dict}>
      <SetLang locale={locale as Locale} />
      <header className="sticky top-0 z-10 flex items-center justify-end gap-3 border-b border-outline bg-background-card px-4 py-2">
        <LocaleSelector />
        <ThemeSwitcher />
      </header>
      {children}
    </I18nProvider>
  );
}
