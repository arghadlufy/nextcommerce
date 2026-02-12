"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";

export async function getCategoriesWithTranslations() {
  return db.category.findMany({
    include: {
      translations: { orderBy: { language: "asc" } },
    },
    orderBy: { name: "asc" },
  });
}

export async function updateCategory(
  id: string,
  data: { name: string; slug: string },
) {
  await db.category.update({ where: { id }, data });
  revalidatePath("/", "layout");
}

export async function upsertCategoryTranslation(
  categoryId: string,
  language: string,
  name: string,
) {
  await db.categoryTranslation.upsert({
    where: { categoryId_language: { categoryId, language } },
    update: { name },
    create: { categoryId, language, name },
  });
  revalidatePath("/", "layout");
}
