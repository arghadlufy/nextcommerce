import { mockProducts } from "@/lib/mocks";
import { PrismaClient, Prisma } from "../app/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import "dotenv/config";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL,
});

const prisma = new PrismaClient({
  adapter,
});

export async function main() {
  await prisma.$transaction(async (tx) => {
    // Clean existing data inside the transaction so it is rolled back on failure
    await tx.product.deleteMany();
    await tx.category.deleteMany();

    // Seed categories
    await tx.category.createMany({
      data: [
        { name: "Electronics", slug: "electronics" },
        { name: "Sports", slug: "sports" },
        { name: "Home", slug: "home" },
        { name: "Fashion", slug: "fashion" },
      ],
    });

    const categories = await tx.category.findMany();

    // Seed products; if any create fails, the whole transaction (including categories) is rolled back
    for (const p of mockProducts) {
      const category = categories.find((c) => c.name === p.category);
      if (!category) {
        throw new Error(
          `Category "${p.category}" not found for product "${p.name}"`,
        );
      }

      // INTENTIONAL TEST ERROR: uncomment this block to verify rollback behavior
      //   if (p.name === "Wireless Headphones") {
      //     throw new Error("Intentional test failure while creating products");
      //   }

      await tx.product.create({
        data: {
          name: p.name,
          description: p.description,
          categoryId: category.id,
          price: p.price,
          slug: p.name.toLowerCase().replace(/ /g, "-"),
          image: p.image,
        },
      });
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
