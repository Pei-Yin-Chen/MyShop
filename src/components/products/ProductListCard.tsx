"use client";

import Image from "next/image";
import Link from "next/link";
import { Heart, ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ProductRating } from "@/components/products/ProductRating";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/use-wishlist";
import { cn } from "@/lib/utils";

export function ProductListCard({
  product,
}: {
  product: Product;
}) {
  const { addItem } = useCart();
  const { isWishlisted, toggle, hydrated } = useWishlist(product.id);
  const outOfStock =
    product.stockQuantity !== undefined && product.stockQuantity <= 0;

  return (
    <Card
      id={`p-${product.id}`}
      className="group scroll-mt-28 gap-0 overflow-hidden border border-border/80 bg-background py-0 shadow-sm transition-shadow hover:shadow-md"
    >
      <CardContent className="relative p-0">
        <Link href={`/products/${product.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <AspectRatio ratio={1} className="bg-muted/20">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            />
          </AspectRatio>
        </Link>

        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={
            isWishlisted ? "移除願望清單" : "加入願望清單"
          }
          aria-pressed={hydrated ? isWishlisted : false}
          // 與商品詳細頁一致：收藏狀態顯示站內 primary（紅棕）
          // 未收藏則維持 muted，避免變黑
          className={cn(
            "absolute right-3 top-3 z-10 rounded-full bg-background/80 backdrop-blur hover:bg-background text-muted-foreground hover:text-primary",
            hydrated && isWishlisted && "text-primary",
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
          title={isWishlisted ? "移除願望清單" : "加入願望清單"}
        >
          <Heart
            className="size-4"
            fill={hydrated && isWishlisted ? "currentColor" : "none"}
            aria-hidden
          />
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t-0 bg-transparent p-4 pt-3">
        <div>
          <Link href={`/products/${product.id}`}>
            <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <ProductRating rating={product.rating} reviewCount={product.reviewCount} className="mt-2" />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-primary tabular-nums">
              <span className="text-sm font-medium text-muted-foreground">NT$</span>
              &nbsp;{product.price}
            </p>
            {outOfStock && (
              <p className="mt-1 text-xs text-muted-foreground">暫無庫存</p>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="icon-sm"
              className="shrink-0 rounded-full shadow-sm"
              disabled={outOfStock}
              onClick={() => addItem(product)}
              aria-label={outOfStock ? "暫無庫存" : "加入購物車"}
            >
              <ShoppingCart className="size-3.5" />
            </Button>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
}
