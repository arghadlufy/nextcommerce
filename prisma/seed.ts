import {
  mockProducts,
  productTranslations,
  categoryTranslations,
} from "@/lib/mocks";
import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";
import { readFileSync } from "fs";
import { join } from "path";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  await prisma.$transaction(async (tx) => {
    // Clean existing data inside the transaction so it is rolled back on failure
    await tx.uiLabel.deleteMany();
    await tx.productTranslation.deleteMany();
    await tx.categoryTranslation.deleteMany();
    await tx.product.deleteMany();
    await tx.category.deleteMany();

    // Seed categories
    const categoryData = [
      { name: "Electronics", slug: "electronics" },
      { name: "Sports", slug: "sports" },
      { name: "Home", slug: "home" },
      { name: "Fashion", slug: "fashion" },
    ];

    await tx.category.createMany({ data: categoryData });

    const categories = await tx.category.findMany();

    // Seed category translations
    for (const cat of categories) {
      const translations = categoryTranslations[cat.name];
      if (!translations) continue;

      for (const [language, name] of Object.entries(translations)) {
        await tx.categoryTranslation.create({
          data: { categoryId: cat.id, language, name },
        });
      }
    }

    // Seed products and their translations
    for (const p of mockProducts) {
      const category = categories.find((c) => c.name === p.category);
      if (!category) {
        throw new Error(
          `Category "${p.category}" not found for product "${p.name}"`,
        );
      }

      const product = await tx.product.create({
        data: {
          name: p.name,
          description: p.description,
          categoryId: category.id,
          price: p.price,
          slug: p.name.toLowerCase().replace(/ /g, "-"),
          image: p.image,
        },
      });

      // Insert translations for this product (nl, hi, etc.)
      const translations = productTranslations[p.name];
      if (!translations) continue;

      for (const [language, t] of Object.entries(translations)) {
        await tx.productTranslation.create({
          data: {
            productId: product.id,
            language,
            name: t.name,
            description: t.description,
          },
        });
      }
    }

    // Seed UI labels from dictionary JSON files
    const locales = ["en-BE", "en-IN", "nl-BE", "hi-IN"];
    for (const locale of locales) {
      const filePath = join(__dirname, "..", "dictionaries", `${locale}.json`);
      const dict = JSON.parse(readFileSync(filePath, "utf-8"));

      for (const [namespace, entries] of Object.entries(dict)) {
        for (const [key, value] of Object.entries(
          entries as Record<string, string>,
        )) {
          await tx.uiLabel.create({
            data: { locale, namespace, key, value },
          });
        }
      }
    }
  });
}

main()
  .catch((err) => {
    console.error("Error seeding database:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
