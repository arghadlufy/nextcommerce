import { getLabelsForLocale } from "@/lib/actions/label";
import { LabelEditor } from "./LabelEditor";

export default async function LabelsPage() {
  const defaultLocale = "en-BE";
  const data = await getLabelsForLocale(defaultLocale);

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold text-text-heading">
        Translation Labels
      </h1>
      <p className="mb-8 text-sm text-text-body">
        Edit UI text labels for each locale. Changes take effect immediately on
        the storefront.
      </p>
      <LabelEditor initialLocale={defaultLocale} initialData={data} />
    </div>
  );
}
