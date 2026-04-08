"use client";

import { ProductForm, type CategoryOption } from "@/components/admin/ProductForm";
import { ProductImageManagerGate } from "@/components/admin/ProductImageManagerGate";
import type { AdminProductImageRow } from "@/components/admin/ProductImageManager";

export function AdminEditProductClient({
  productId,
  categories,
  initial,
  sortedImages,
}: {
  productId: string;
  categories: CategoryOption[];
  initial: {
    id: string;
    name: string;
    description: string;
    price: number;
    category_id: string;
    stock_quantity: number;
    status: string;
    display_order: number;
  };
  sortedImages: AdminProductImageRow[];
}) {
  return (
    <div className="space-y-6">
      <section className="space-y-4">
        <h3 className="text-lg font-semibold text-foreground">基本資料</h3>
        <ProductForm mode="edit" categories={categories} initial={initial} />
      </section>

      <section className="space-y-4 border-t border-border pt-6">
        <h3 className="text-lg font-semibold text-foreground">商品圖片</h3>
        <ProductImageManagerGate
          productId={productId}
          productName={initial.name}
          initialImages={sortedImages}
        />
      </section>
    </div>
  );
}
