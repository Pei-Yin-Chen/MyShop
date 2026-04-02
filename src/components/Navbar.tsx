"use client";

import Link from "next/link";
import { ShoppingCart, Search, Menu, Heart, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import { User as SupabaseUser } from "@supabase/supabase-js";

export function Navbar() {
  const { totalItems } = useCart();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };

    getUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

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
            <Link href="/products?category=甜點" className="transition-colors hover:text-foreground">
              甜點
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
          
          <div className="flex items-center gap-2">
            {user ? (
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground hidden lg:inline-block">
                  {user.email}
                </span>
                <Button variant="ghost" onClick={() => signOut()} className="text-sm">
                  登出
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button variant="ghost" className="text-sm hidden sm:flex" nativeButton={false} render={<Link href="/login" />}>
                  登入 / 註冊
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground sm:hidden" nativeButton={false} render={<Link href="/login" />}>
                  <User className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground" nativeButton={false} render={<Link href="/cart" />}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {totalItems}
              </span>
            )}
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
                <Link href="/products?category=甜點">甜點</Link>
                <Link href="/about">關於我們</Link>
                {user ? (
                  <>
                    <div className="pt-4 border-t border-border">
                      <p className="text-sm text-muted-foreground mb-2">{user.email}</p>
                      <button onClick={() => signOut()} className="text-left">登出</button>
                    </div>
                  </>
                ) : (
                  <Link href="/login">登入 / 註冊</Link>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
