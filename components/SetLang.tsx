"use client";

import { useEffect } from "react";
import type { Locale } from "@/lib/i18n-constants";

export function SetLang({ locale }: { locale: Locale }) {
  useEffect(() => {
    document.documentElement.lang = locale;
    return () => {
      document.documentElement.lang = "";
    };
  }, [locale]);
  return null;
}
