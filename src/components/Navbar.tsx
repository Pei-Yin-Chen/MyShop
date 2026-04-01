import Link from "next/link";
import { ShoppingCart, Search, Menu, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-semibold tracking-tight text-foreground">
              My<span className="text-primary">Pâtisserie</span>
            </span>
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/products" className="transition-colors hover:text-foreground">
              所有商品
            </Link>
            <Link href="/products?category=蛋糕" className="transition-colors hover:text-foreground">
              蛋糕
            </Link>
            <Link href="/products?category=麵包" className="transition-colors hover:text-foreground">
              麵包
            </Link>
            <Link href="/about" className="transition-colors hover:text-foreground">
              關於我們
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-1">
          <Button variant="ghost" size="icon" className="hidden text-muted-foreground sm:flex">
            <Search className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="hidden text-muted-foreground sm:flex">
            <Heart className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" className="relative text-muted-foreground">
            <ShoppingCart className="h-5 w-5" />
            <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
              2
            </span>
          </Button>

          <Sheet>
            <SheetTrigger render={<Button variant="ghost" size="icon" className="md:hidden" />}>
              <Menu className="h-5 w-5" />
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="mt-8 flex flex-col gap-5 text-base font-medium">
                <Link href="/products">所有商品</Link>
                <Link href="/products?category=蛋糕">蛋糕</Link>
                <Link href="/products?category=麵包">麵包</Link>
                <Link href="/about">關於我們</Link>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
