import Link from "next/link";
import type { Product } from "@/data/products";
import { ProductListCard } from "./ProductListCard";

export function RelatedProducts({
  products,
  categoryHref,
  categoryLabel,
}: {
  products: Product[];
  categoryHref: string;
  categoryLabel: string;
}) {
  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <h2 className="text-2xl font-semibold tracking-tight">你可能也會喜歡</h2>
        <Link
          href={categoryHref}
          className="text-sm font-medium text-primary underline-offset-4 hover:underline"
        >
          查看「{categoryLabel}」全部商品
        </Link>
      </div>

      {products.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          目前沒有其他同分類商品，可從上方連結瀏覽本分類列表，或返回所有商品。
        </p>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map((product) => (
            <ProductListCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </section>
  );
}
