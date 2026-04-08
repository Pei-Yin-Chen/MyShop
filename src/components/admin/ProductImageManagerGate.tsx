"use client";

import { useEffect, useState } from "react";
import {
  ProductImageManager,
  type AdminProductImageRow,
} from "@/components/admin/ProductImageManager";

/**
 * dnd-kit 在 SSR 與 CSR 會產生不同的 `aria-describedby`（DndDescribedBy-*），導致 hydration 不符。
 * 延後到掛載後再渲染 {@link ProductImageManager}，避免伺服器輸出與首屏 client 不一致。
 */
export function ProductImageManagerGate({
  productId,
  productName,
  initialImages,
}: {
  productId: string;
  /** 圖片替代文字預設使用商品名稱，無需逐張填寫 */
  productName: string;
  initialImages: AdminProductImageRow[];
}) {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    setReady(true);
  }, []);

  if (!ready) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-muted/20 py-12 text-center text-sm text-muted-foreground">
        載入圖片編輯…
      </div>
    );
  }

  return (
    <ProductImageManager
      productId={productId}
      productName={productName}
      initialImages={initialImages}
    />
  );
}
