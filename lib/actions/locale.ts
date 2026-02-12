"use server";

import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { hasLocale, COOKIE_LOCALE } from "@/lib/i18n-constants";

export async function setLocaleAndRedirect(locale: string) {
  if (!hasLocale(locale)) {
    redirect("/");
  }
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_LOCALE, locale, { path: "/", maxAge: 60 * 60 * 24 * 365 });
  redirect(`/${locale}`);
}
