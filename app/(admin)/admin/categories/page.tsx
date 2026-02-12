import { getCategoriesWithTranslations } from "@/lib/actions/admin-category";
import { CategoryEditor } from "./CategoryEditor";

export default async function AdminCategoriesPage() {
  const categories = await getCategoriesWithTranslations();

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-heading">Categories</h1>
      <p className="mb-8 text-sm text-text-body">
        Edit category names and their translations.
      </p>
      <CategoryEditor
        categories={JSON.parse(JSON.stringify(categories))}
      />
    </div>
  );
}
