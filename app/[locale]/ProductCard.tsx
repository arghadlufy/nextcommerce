import { Product } from "@/lib/mocks";
import Image from "next/image";

export function ProductCard({ product }: { product: Product }) {
  return (
    <div className="bg-background-card p-4 rounded-lg shadow-md">
      <div className="relative aspect-square">
        <Image
          src={product.image}
          alt={product.name}
          className="object-cover rounded-lg"
          fill // fill when the size is unknown as coming from a remote source
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw" // sizes for the image to be responsive
        />
      </div>
      <h3 className="text-text-heading text-lg font-bold">{product.name}</h3>
      <p className="text-text-body text-sm">{product.description}</p>
      <p className="text-text-body text-sm">{product.price.toFixed(2)}</p>
    </div>
  );
}
