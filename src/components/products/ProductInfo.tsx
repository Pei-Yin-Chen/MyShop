"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Minus, Plus, ShoppingCart, Heart, Share2 } from "lucide-react";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductRating } from "./ProductRating";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/use-wishlist";
import { cn } from "@/lib/utils";
import { stripHtmlToPlainText } from "@/lib/html/rich-text";
import { sanitizeRichHtml } from "@/lib/sanitize-rich-html";

const MADE_TO_ORDER_CATEGORIES = ["蛋糕", "甜點"] as const;

function isMadeToOrderCategory(category: string): boolean {
  return (MADE_TO_ORDER_CATEGORIES as readonly string[]).includes(category);
}

export function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const [shareHint, setShareHint] = useState<string | null>(null);
  const { addItem } = useCart();
  const router = useRouter();
  const { isWishlisted, toggle, hydrated } = useWishlist(product.id);

  const stock = product.stockQuantity;
  const hasStockField = stock !== undefined;
  const outOfStock =
    product.status === "sold_out" || (hasStockField && stock <= 0);
  const maxSelectable = hasStockField ? Math.min(99, Math.max(0, stock)) : 99;

  const increment = () =>
    setQuantity((prev) => Math.min(prev + 1, Math.max(1, maxSelectable)));
  const decrement = () => setQuantity((prev) => Math.max(prev - 1, 1));

  const handleBuyNow = () => {
    if (outOfStock) return;
    addItem(product, quantity);
    router.push("/cart");
  };

  async function handleShare() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    const title = product.name;
    const text = stripHtmlToPlainText(product.description).slice(0, 160);

    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title, text, url });
        return;
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setShareHint("已複製商品連結");
    } catch {
      setShareHint("無法自動複製，請手動複製網址列");
    }
    window.setTimeout(() => setShareHint(null), 2800);
  }

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            {product.isFeatured && (
              <Badge className="rounded-full font-medium">主廚推薦</Badge>
            )}
            <Badge variant="secondary" className="rounded-full font-normal">
              {product.category}
            </Badge>
          </div>
          <div className="flex shrink-0 items-center gap-1">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className={cn(
                "rounded-full text-muted-foreground hover:text-primary",
                hydrated && isWishlisted && "text-primary",
              )}
              aria-pressed={hydrated ? isWishlisted : false}
              aria-label={isWishlisted ? "從願望清單移除" : "加入願望清單"}
              title={
                isWishlisted
                  ? "從願望清單移除（亦可在導覽列願望清單查看）"
                  : "加入願望清單（可於導覽列愛心圖示查看）"
              }
              onClick={toggle}
            >
              <Heart
                className={cn(
                  "size-4",
                  hydrated && isWishlisted ? "text-primary" : "text-muted-foreground",
                )}
                fill={hydrated && isWishlisted ? "currentColor" : "none"}
                aria-hidden
              />
            </Button>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              className="rounded-full text-muted-foreground hover:text-primary"
              aria-label="分享或複製連結"
              title="分享或複製連結"
              onClick={() => void handleShare()}
            >
              <Share2 className="size-4" aria-hidden />
            </Button>
          </div>
        </div>

        {hydrated && isWishlisted && (
          <p className="text-xs text-muted-foreground">
            已加入{" "}
            <Link href="/wishlist" className="font-medium text-primary underline-offset-4 hover:underline">
              願望清單
            </Link>
            （與導覽列愛心相同）
          </p>
        )}

        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {product.name}
        </h1>
        {product.subtitle && (
          <p className="text-lg font-medium text-primary/80">{product.subtitle}</p>
        )}

        <div className="flex flex-wrap items-center gap-4 pt-1">
          <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-primary tabular-nums">
          <span className="mr-1 text-lg font-medium text-muted-foreground">NT$</span>
          {product.price}
        </p>
        <p className="text-sm text-muted-foreground">含稅，運費於結帳時計算</p>
        {outOfStock && (
          <p className="text-sm font-medium tabular-nums text-destructive">
            {product.status === "sold_out" ? "售完" : "暫無庫存"}
          </p>
        )}
      </div>

      {shareHint && (
        <p className="text-sm text-primary" aria-live="polite" role="status">
          {shareHint}
        </p>
      )}

      <Separator />

      {/<[a-z][\s\S]*>/i.test(product.description.trim()) ? (
        <div
          className="text-base leading-relaxed text-muted-foreground [&_a]:text-primary [&_a]:underline [&_a]:underline-offset-2 [&_blockquote]:border-l-2 [&_blockquote]:border-border [&_blockquote]:pl-3 [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-base [&_h3]:font-semibold [&_ol]:list-decimal [&_ol]:pl-6 [&_p]:my-2 [&_ul]:list-disc [&_ul]:pl-6"
          dangerouslySetInnerHTML={{
            __html: sanitizeRichHtml(product.description),
          }}
        />
      ) : (
        <p className="whitespace-pre-wrap text-base leading-relaxed text-muted-foreground">
          {product.description}
        </p>
      )}

      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-11 w-full items-center justify-center rounded-full border border-border bg-card px-2 shadow-sm sm:w-auto sm:flex-none">
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={decrement}
              disabled={outOfStock || quantity <= 1}
              className="rounded-full"
              aria-label="減少數量"
              title="減少數量"
            >
              <Minus className="size-3.5" aria-hidden />
            </Button>
            <span className="w-10 text-center font-medium tabular-nums">{quantity}</span>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              onClick={increment}
              disabled={outOfStock || quantity >= maxSelectable}
              className="rounded-full"
              aria-label="增加數量"
              title="增加數量"
            >
              <Plus className="size-3.5" aria-hidden />
            </Button>
          </div>

          <Button
            type="button"
            size="lg"
            className="h-11 w-full rounded-full font-semibold shadow-md shadow-primary/10 sm:h-11 sm:flex-1"
            disabled={outOfStock}
            onClick={() => addItem(product, quantity)}
          >
            <ShoppingCart className="mr-2 size-4" aria-hidden />
            {outOfStock ? "暫無庫存" : "加入購物車"}
          </Button>
        </div>

        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-11 w-full rounded-full font-medium"
          disabled={outOfStock}
          onClick={handleBuyNow}
        >
          立即購買
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            配送方式
          </p>
          <p className="text-sm font-medium">低溫宅配 / 店取</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
          <p className="mb-1 text-xs font-medium uppercase tracking-wider text-muted-foreground">
            預計到貨
          </p>
          <p className="text-sm font-medium">下單後 3–5 個工作天</p>
        </div>
      </div>

      {isMadeToOrderCategory(product.category) && (
        <div className="rounded-xl border border-primary/20 bg-primary/5 px-4 py-3 text-sm leading-relaxed text-foreground">
          <p className="font-medium text-primary">宅配／現做說明</p>
          <p className="mt-1.5 text-muted-foreground">
            蛋糕與甜點多為接單後現做，以維持風味與品質；若選擇<strong className="text-foreground">低溫宅配</strong>
            ，實際出貨日可能依訂單量與品項調整，將於出貨前與您確認或可於備註預留希望到貨區間。店取通常可較快取貨。
          </p>
        </div>
      )}
    </div>
  );
}
