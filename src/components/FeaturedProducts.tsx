import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { products } from "@/data/products";

export function FeaturedProducts() {
  const featured = products.filter((p) => p.isFeatured);

  return (
    <section className="border-t border-border/60 bg-card py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            主廚推薦
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">
            當日爐邊精選，蛋糕與麵包皆以細緻工法完成，適合與重要的人分享。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {featured.map((product) => (
            <Card
              key={product.id}
              className="group gap-0 overflow-hidden border border-border/80 bg-background py-0 shadow-sm transition-shadow duration-300 hover:shadow-md"
            >
              {/* 覆蓋 Card 預設 py/gap，避免圖片上方留白；CardContent 需拿掉水平 padding */}
              <CardContent className="relative p-0">
                <AspectRatio ratio={1} className="bg-muted/20">
                  <Image
                    src={product.image}
                    alt={product.name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                </AspectRatio>
                <div className="absolute right-3 top-3 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <Button
                    size="icon"
                    variant="secondary"
                    className="h-9 w-9 rounded-full border border-border/60 bg-background/90 shadow-sm backdrop-blur-sm"
                  >
                    <Heart className="h-4 w-4 text-primary" />
                  </Button>
                </div>
                <Badge className="absolute left-3 top-3 border-0 bg-background/90 font-normal text-foreground shadow-sm backdrop-blur-sm">
                  {product.category}
                </Badge>
              </CardContent>
              <CardFooter className="flex flex-col items-stretch gap-4 border-t-0 bg-transparent p-5 pt-4">
                <div className="text-center sm:text-left">
                  <h3 className="mb-1 font-semibold text-foreground transition-colors group-hover:text-primary">
                    {product.name}
                  </h3>
                  <p className="line-clamp-2 min-h-[2.875rem] text-sm leading-relaxed text-muted-foreground">
                    {product.description}
                  </p>
                </div>
                <div className="flex flex-col gap-3 border-t border-border/60 pt-3">
                  {/* 全寬價格條，視覺填滿、不會右側空洞 */}
                  <div className="rounded-xl bg-muted/50 px-4 py-2.5 text-center ring-1 ring-border/40">
                    <p className="text-lg font-semibold text-primary">
                      <span className="text-sm font-medium text-muted-foreground">NT$</span>
                      <span className="tabular-nums">&nbsp;{product.price}</span>
                    </p>
                  </div>
                  <Button size="sm" className="w-full rounded-full font-medium">
                    <ShoppingCart className="mr-2 h-4 w-4" />
                    加入購物車
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>

        <div className="mt-14 flex justify-center">
          <Button
            variant="outline"
            size="lg"
            nativeButton={false}
            className="rounded-full border-border px-10 font-medium"
            render={<Link href="/products" />}
          >
            查看完整菜單
          </Button>
        </div>
      </div>
    </section>
  );
}
