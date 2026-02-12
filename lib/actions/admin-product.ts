"use server";

import { revalidatePath } from "next/cache";
import { db } from "../db";

export async function getProductsWithTranslations() {
  return db.product.findMany({
    include: {
      category: true,
      translations: { orderBy: { language: "asc" } },
    },
    orderBy: { name: "asc" },
  });
}

export async function getAllCategories() {
  return db.category.findMany({ orderBy: { name: "asc" } });
}

export async function updateProduct(
  id: string,
  data: {
    name: string;
    description: string;
    price: number;
    image: string;
    categoryId: string;
  },
) {
  await db.product.update({ where: { id }, data });
  revalidatePath("/", "layout");
}

export async function upsertProductTranslation(
  productId: string,
  language: string,
  data: { name: string; description: string },
) {
  await db.productTranslation.upsert({
    where: { productId_language: { productId, language } },
    update: { name: data.name, description: data.description },
    create: {
      productId,
      language,
      name: data.name,
      description: data.description,
    },
  });
  revalidatePath("/", "layout");
}
