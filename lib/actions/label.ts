"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";

export async function upsertLabel(
  locale: string,
  namespace: string,
  key: string,
  value: string,
) {
  await db.uiLabel.upsert({
    where: {
      locale_namespace_key: { locale, namespace, key },
    },
    update: { value },
    create: { locale, namespace, key, value },
  });

  // Revalidate all pages that use this dictionary
  revalidatePath("/", "layout");
}

export async function getLabelsForLocale(locale: string) {
  const rows = await db.uiLabel.findMany({
    where: { locale },
    orderBy: [{ namespace: "asc" }, { key: "asc" }],
  });

  // Group by namespace
  const grouped: Record<string, { key: string; value: string }[]> = {};
  for (const row of rows) {
    if (!grouped[row.namespace]) grouped[row.namespace] = [];
    grouped[row.namespace].push({ key: row.key, value: row.value });
  }

  return grouped;
}
