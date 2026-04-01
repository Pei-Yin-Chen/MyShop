import Image from "next/image";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@/data/products";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { ProductRating } from "@/components/products/ProductRating";

export function ProductListCard({ product }: { product: Product }) {
  return (
    <Card
      id={`p-${product.id}`}
      className="group scroll-mt-28 gap-0 overflow-hidden border border-border/80 bg-background py-0 shadow-sm transition-shadow hover:shadow-md"
    >
      <CardContent className="relative p-0">
        <Link href={`/products#p-${product.id}`} className="block outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
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
        <Badge className="absolute left-3 top-3 border-0 bg-background/90 font-normal text-foreground shadow-sm backdrop-blur-sm">
          {product.category}
        </Badge>
      </CardContent>
      <CardFooter className="flex flex-col items-stretch gap-3 border-t-0 bg-transparent p-4 pt-3">
        <div>
          <Link href={`/products#p-${product.id}`}>
            <h3 className="font-semibold text-foreground transition-colors group-hover:text-primary">
              {product.name}
            </h3>
          </Link>
          <ProductRating rating={product.rating} reviewCount={product.reviewCount} className="mt-2" />
        </div>
        <div className="flex items-center justify-between gap-3 border-t border-border/60 pt-3">
          <p className="text-lg font-semibold text-primary tabular-nums">
            <span className="text-sm font-medium text-muted-foreground">NT$</span>
            &nbsp;{product.price}
          </p>
          <Button size="sm" className="shrink-0 rounded-full font-medium">
            <ShoppingCart className="mr-1.5 size-3.5" />
            加入購物車
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
