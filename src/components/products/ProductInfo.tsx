"use client";

import { useState } from "react";
import { Minus, Plus, ShoppingCart, Heart, Share2 } from "lucide-react";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ProductRating } from "./ProductRating";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/lib/cart-context";

export function ProductInfo({ product }: { product: Product }) {
  const [quantity, setQuantity] = useState(1);
  const { addItem } = useCart();

  const increment = () => setQuantity((prev) => Math.min(prev + 1, 99));
  const decrement = () => setQuantity((prev) => Math.max(prev - 1, 1));

  return (
    <div className="flex flex-col space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground hover:text-primary">
              <Heart className="size-4" />
            </Button>
            <Button variant="ghost" size="icon-sm" className="rounded-full text-muted-foreground hover:text-primary">
              <Share2 className="size-4" />
            </Button>
          </div>
        </div>
        
        <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
          {product.name}
        </h1>
        {product.subtitle && (
          <p className="text-lg font-medium text-primary/80">
            {product.subtitle}
          </p>
        )}
        
        <div className="flex items-center gap-4 pt-1">
          <ProductRating rating={product.rating} reviewCount={product.reviewCount} />
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-3xl font-bold text-primary tabular-nums">
          <span className="text-lg font-medium text-muted-foreground mr-1">NT$</span>
          {product.price}
        </p>
        <p className="text-sm text-muted-foreground">
          含稅，運費於結帳時計算
        </p>
      </div>

      <Separator />

      <p className="text-base leading-relaxed text-muted-foreground">
        {product.description}
      </p>

      <div className="space-y-4 pt-2">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="flex h-11 items-center rounded-full border border-border bg-card px-1 shadow-sm">
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={decrement}
              disabled={quantity <= 1}
              className="rounded-full"
            >
              <Minus className="size-3.5" />
            </Button>
            <span className="w-10 text-center font-medium tabular-nums">
              {quantity}
            </span>
            <Button
              variant="ghost"
              size="icon-sm"
              onClick={increment}
              disabled={quantity >= 99}
              className="rounded-full"
            >
              <Plus className="size-3.5" />
            </Button>
          </div>
          
          <Button 
            size="lg" 
            className="h-11 flex-1 rounded-full font-semibold shadow-md shadow-primary/10"
            onClick={() => addItem(product, quantity)}
          >
            <ShoppingCart className="mr-2 size-4" />
            加入購物車
          </Button>
        </div>
        
        <Button variant="outline" size="lg" className="h-11 w-full rounded-full font-medium">
          立即購買
        </Button>
      </div>

      <div className="grid grid-cols-1 gap-4 pt-4 sm:grid-cols-2">
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">配送方式</p>
          <p className="text-sm font-medium">低溫宅配 / 店取</p>
        </div>
        <div className="rounded-xl border border-border/60 bg-muted/30 p-4 text-center">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-1">預計到貨</p>
          <p className="text-sm font-medium">下單後 3-5 日</p>
        </div>
      </div>
    </div>
  );
}
