import {
  getProductsWithTranslations,
  getAllCategories,
} from "@/lib/actions/admin-product";
import { ProductEditor } from "./ProductEditor";

export default async function AdminProductsPage() {
  const [products, categories] = await Promise.all([
    getProductsWithTranslations(),
    getAllCategories(),
  ]);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-heading">Products</h1>
      <p className="mb-8 text-sm text-text-body">
        Edit product details and their translations. Click a product to expand.
      </p>
      <ProductEditor
        products={JSON.parse(JSON.stringify(products))}
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  );
}
