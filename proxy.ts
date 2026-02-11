import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SUPPORTED_LOCALES, COOKIE_LOCALE } from "@/lib/i18n-constants";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/") {
    const savedLocale = request.cookies.get(COOKIE_LOCALE)?.value;
    if (savedLocale && SUPPORTED_LOCALES.includes(savedLocale as (typeof SUPPORTED_LOCALES)[number])) {
      return NextResponse.redirect(new URL(`/${savedLocale}`, request.url));
    }
    return NextResponse.next();
  }

  const firstSegment = pathname.split("/")[1];
  const isSupportedLocale = SUPPORTED_LOCALES.includes(firstSegment as (typeof SUPPORTED_LOCALES)[number]);

  if (isSupportedLocale) {
    return NextResponse.next();
  }

  return NextResponse.redirect(new URL("/", request.url));
}

export const config = {
  matcher: ["/((?!_next|api|favicon.ico|.*\\.(?:svg|png|ico|txt)).*)"],
};
