"use client";
/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Heart } from "lucide-react";
import type { Product } from "@/data/products";
import { createClient } from "@/lib/supabase/client";
import {
  mapProductRow,
  PRODUCT_LIST_SELECT,
  type ProductRow,
} from "@/lib/supabase/fetch-products";
import { readWishlistIds } from "@/lib/wishlist-storage";
import { ProductListCard } from "@/components/products/ProductListCard";
import { Button } from "@/components/ui/button";

export function WishlistContent() {
  const [ids, setIds] = useState<string[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const syncIds = () => setIds(readWishlistIds());
    syncIds();
    window.addEventListener("wishlist-updated", syncIds);
    window.addEventListener("storage", syncIds);
    return () => {
      window.removeEventListener("wishlist-updated", syncIds);
      window.removeEventListener("storage", syncIds);
    };
  }, []);

  useEffect(() => {
    if (ids.length === 0) {
      // 避免在 effect 內同步 setState 觸發 eslint react-hooks/set-state-in-effect
      queueMicrotask(() => {
        setProducts([]);
        setLoading(false);
      });
      return;
    }

    let cancelled = false;
    setLoading(true);
    const supabase = createClient();

    void (async () => {
      const { data, error } = await supabase
        .from("products")
        .select(PRODUCT_LIST_SELECT)
        .in("id", ids)
        .in("status", ["active", "sold_out"]);

      if (cancelled) return;

      if (error) {
        console.error("[WishlistContent]", error.message);
        setProducts([]);
        setLoading(false);
        return;
      }

      const rows = (data as ProductRow[] | null) ?? [];
      const mapped = rows.map((row) => mapProductRow(row));
      const order = new Map(ids.map((id, i) => [id, i]));
      mapped.sort((a, b) => (order.get(a.id) ?? 0) - (order.get(b.id) ?? 0));
      setProducts(mapped);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [ids]);

  return (
    <div className="container mx-auto px-4 py-10 lg:py-16">
      <div className="mb-8 flex items-center justify-between gap-4">
        <h1 className="text-3xl font-bold tracking-tight text-foreground">願望清單</h1>
        {!loading && ids.length > 0 && (
          <span className="text-sm text-muted-foreground">共 {ids.length} 項收藏</span>
        )}
      </div>

      {loading ? (
        <p className="text-sm text-muted-foreground">載入中…</p>
      ) : ids.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 py-20 text-center">
          <div className="mb-4 rounded-full bg-muted p-4">
            <Heart className="size-8 text-muted-foreground" aria-hidden />
          </div>
          <h2 className="mb-2 text-xl font-semibold text-foreground">願望清單是空的</h2>
          <p className="mb-8 max-w-sm text-muted-foreground">
            在商品頁點選愛心即可收藏；收藏列表會存在此裝置的瀏覽器中。
          </p>
          <Button size="lg" className="rounded-full" nativeButton={false} render={<Link href="/products" />}>
            去逛逛商品
          </Button>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <li key={product.id}>
              <ProductListCard product={product} />
            </li>
          ))}
        </ul>
      )}

      {!loading && ids.length > 0 && products.length < ids.length && (
        <p className="mt-8 text-sm text-muted-foreground">
          部分收藏已下架或無法顯示，清單中僅顯示仍可購買的商品。
        </p>
      )}
    </div>
  );
}
