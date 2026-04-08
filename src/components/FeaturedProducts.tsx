"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { FeaturedIntroContent } from "@/data/home-page-defaults";
import type { Product } from "@/data/products";
import { useCart } from "@/lib/cart-context";
import { useWishlist } from "@/lib/use-wishlist";
import { cn } from "@/lib/utils";
import { stripHtmlToPlainText } from "@/lib/html/rich-text";

function FeaturedProductCard({
  product,
  addItem,
}: {
  product: Product;
  addItem: (p: Product) => void;
}) {
  const { isWishlisted, toggle, hydrated } = useWishlist(product.id);

  return (
    <Card className="group gap-0 overflow-hidden border border-border/80 bg-background py-0 shadow-sm transition-shadow duration-300 hover:shadow-md">
      <CardContent className="relative p-0">
        <Link
          href={`/products/${product.id}`}
          className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          <AspectRatio ratio={1} className="bg-muted/20">
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          </AspectRatio>
        </Link>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={isWishlisted ? "移除願望清單" : "加入願望清單"}
          aria-pressed={hydrated ? isWishlisted : false}
          className={cn(
            "absolute right-3 top-3 z-10 rounded-full border border-border/60 bg-background/80 text-muted-foreground shadow-sm backdrop-blur-sm hover:bg-background hover:text-primary",
            hydrated && isWishlisted && "text-primary",
          )}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            toggle();
          }}
          title={isWishlisted ? "移除願望清單" : "加入願望清單"}
        >
          <Heart className="size-4" fill={hydrated && isWishlisted ? "currentColor" : "none"} aria-hidden />
        </Button>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-4 border-t-0 bg-transparent p-5 pt-4">
        <div className="text-center sm:text-left">
          <Link href={`/products/${product.id}`}>
            <h3 className="mb-1 font-semibold text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <p className="line-clamp-2 min-h-[2.875rem] text-sm leading-relaxed text-muted-foreground">
            {stripHtmlToPlainText(product.description)}
          </p>
        </div>
        <div className="flex items-center justify-between border-t border-border/60 pt-4">
          <p className="text-xl font-bold text-primary tabular-nums">
            <span className="text-sm font-medium text-muted-foreground">NT$</span>
            &nbsp;{product.price}
          </p>
          <Button
            size="icon"
            className="rounded-full shadow-sm"
            onClick={() => addItem(product)}
            aria-label="加入購物車"
          >
            <ShoppingCart className="size-4" aria-hidden />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}

export function FeaturedProducts({
  products,
  intro,
}: {
  products: Product[];
  intro: FeaturedIntroContent;
}) {
  const featured = products.filter((p) => p.isFeatured);
  const { addItem } = useCart();

  return (
    <section className="border-t border-border/60 bg-card py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {intro.title}
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">{intro.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <FeaturedProductCard key={product.id} product={product} addItem={addItem} />
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            className="rounded-full border-border px-10 font-medium"
            render={<Link href={intro.browseAllHref} />}
          >
            {intro.browseAllLabel}
          </Button>
        </div>
      </div>
    </section>
  );
}
