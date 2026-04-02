"use client";

import Link from "next/link";
import { ShoppingCart, Menu, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { readWishlistIds } from "@/lib/wishlist-storage";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import { User as SupabaseUser } from "@supabase/supabase-js";

function displayNameForUser(
  user: SupabaseUser,
  profileFullName: string | null | undefined,
): string {
  const fromProfile = profileFullName?.trim();
  if (fromProfile) return fromProfile;
  const fromMeta =
    typeof user.user_metadata?.full_name === "string" ? user.user_metadata.full_name.trim() : "";
  if (fromMeta) return fromMeta;
  return user.email ?? "會員";
}

export function Navbar() {
  const { totalItems } = useCart();
  const [wishCount, setWishCount] = useState(0);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileFullName, setProfileFullName] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const refreshWishlist = () => setWishCount(readWishlistIds().length);
    refreshWishlist();
    window.addEventListener("wishlist-updated", refreshWishlist);
    window.addEventListener("storage", refreshWishlist);
    return () => {
      window.removeEventListener("wishlist-updated", refreshWishlist);
      window.removeEventListener("storage", refreshWishlist);
    };
  }, []);

  useEffect(() => {
    async function loadProfileName(uid: string) {
      const { data } = await supabase.from("profiles").select("full_name").eq("id", uid).maybeSingle();
      setProfileFullName(data?.full_name ?? null);
    }

    const syncUser = async () => {
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
      if (u) await loadProfileName(u.id);
      else setProfileFullName(null);
    };

    // 有些登入流程是「在同一路由重新導向」，可能不會觸發完整重載或 auth listener；
    // 透過短時間輪詢 + 前景觸發 sync，可確保 Navbar 及時顯示登入狀態。
    void syncUser();

    let attempts = 0;
    const interval = window.setInterval(() => {
      attempts += 1;
      void syncUser();
      if (attempts >= 4) window.clearInterval(interval);
    }, 800);

    const onVisible = () => {
      if (document.visibilityState === "visible") void syncUser();
    };
    window.addEventListener("focus", onVisible);
    document.addEventListener("visibilitychange", onVisible);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser(next);
      if (next) void loadProfileName(next.id);
      else setProfileFullName(null);
    });

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      subscription.unsubscribe();
    };
  }, [supabase]);

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

        <div className="flex items-center gap-2 sm:gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="relative hidden text-muted-foreground sm:flex"
            nativeButton={false}
            render={<Link href="/wishlist" />}
            aria-label={wishCount > 0 ? `願望清單，${wishCount} 項` : "願望清單"}
          >
            <Heart className="h-5 w-5" />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {wishCount > 99 ? "99+" : wishCount}
              </span>
            )}
          </Button>

          <Button variant="ghost" size="icon" className="relative text-muted-foreground" nativeButton={false} render={<Link href="/cart" />}>
            <ShoppingCart className="h-5 w-5" />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>

          <div className="flex min-w-0 items-center">
            {user ? (
              <div className="flex min-w-0 max-w-[min(100vw-10rem,14rem)] items-center gap-1 sm:gap-2">
                <span
                  className="truncate text-xs text-muted-foreground sm:text-sm"
                  title={user.email ?? undefined}
                >
                  {displayNameForUser(user, profileFullName)}
                </span>
                <Button
                  variant="ghost"
                  size="icon-sm"
                  className="shrink-0 sm:hidden text-muted-foreground"
                  onClick={() => void signOut()}
                  aria-label="登出"
                  title="登出"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => void signOut()}
                  className="hidden shrink-0 sm:flex text-sm"
                >
                  登出
                </Button>
              </div>
            ) : (
              <div className="flex items-center gap-1">
                <Button variant="ghost" className="hidden text-sm sm:flex" nativeButton={false} render={<Link href="/login" />}>
                  登入 / 註冊
                </Button>
                <Button variant="ghost" size="icon" className="text-muted-foreground sm:hidden" nativeButton={false} render={<Link href="/login" />}>
                  <User className="h-5 w-5" />
                </Button>
              </div>
            )}
          </div>

          <Sheet>
            <SheetTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden text-muted-foreground hover:text-foreground"
                  aria-label="開啟選單"
                  title="開啟選單"
                >
                  <Menu className="h-5 w-5" />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="border-l border-border/80 bg-background/85 backdrop-blur-md"
            >
              <nav className="mt-8 flex flex-col gap-5 px-6 text-base font-medium">
                <Link href="/wishlist" className="flex items-center gap-2">
                  願望清單
                  {wishCount > 0 && (
                    <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary tabular-nums">
                      {wishCount > 99 ? "99+" : wishCount}
                    </span>
                  )}
                </Link>
                <Link href="/products" className="transition-colors hover:text-foreground text-muted-foreground">
                  所有商品
                </Link>
                <Link
                  href="/products?category=蛋糕"
                  className="transition-colors hover:text-foreground text-muted-foreground"
                >
                  蛋糕
                </Link>
                <Link
                  href="/products?category=麵包"
                  className="transition-colors hover:text-foreground text-muted-foreground"
                >
                  麵包
                </Link>
                <Link
                  href="/products?category=甜點"
                  className="transition-colors hover:text-foreground text-muted-foreground"
                >
                  甜點
                </Link>
                <Link href="/about" className="transition-colors hover:text-foreground text-muted-foreground">
                  關於我們
                </Link>
                {user ? (
                  <>
                    <div className="border-t border-border pt-4">
                      <p className="mb-1 text-sm font-medium text-foreground">
                        {displayNameForUser(user, profileFullName)}
                      </p>
                      <p className="mb-1 break-all text-xs text-muted-foreground">{user.email}</p>
                      <button type="button" onClick={() => signOut()} className="text-left text-sm">
                        登出
                      </button>
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
