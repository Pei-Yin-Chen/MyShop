import type { Product } from "@/data/products";
import { ProductListCard } from "./ProductListCard";

export function RelatedProducts({ products }: { products: Product[] }) {
  if (products.length === 0) return null;

  return (
    <section className="space-y-8">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">你可能也會喜歡</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => (
          <ProductListCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
