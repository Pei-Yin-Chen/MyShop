"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { ShoppingCart, Menu, Heart, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useCart } from "@/lib/cart-context";
import { readWishlistIds } from "@/lib/wishlist-storage";
import { useCallback, useEffect, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/app/auth/actions";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings } from "@/lib/site-settings";
import { SiteLogo } from "@/components/SiteLogo";
import { NavCategoryMenu } from "@/components/NavCategoryMenu";

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

export function Navbar({
  initialSiteTitle,
  initialSiteLogoUrl,
  navProductCategories = [],
}: {
  initialSiteTitle?: string;
  initialSiteLogoUrl?: string;
  /** 來自 `product_categories`，供「商品分類」選單與手機選單 */
  navProductCategories?: string[];
}) {
  const pathname = usePathname();
  const { totalItems } = useCart();
  const [wishCount, setWishCount] = useState(0);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [profileFullName, setProfileFullName] = useState<string | null>(null);
  const [siteTitle, setSiteTitle] = useState<string>(initialSiteTitle || DEFAULT_SITE_SETTINGS.siteTitle);
  const [siteLogoUrl, setSiteLogoUrl] = useState<string>(initialSiteLogoUrl ?? DEFAULT_SITE_SETTINGS.siteLogoUrl);
  const [authLoaded, setAuthLoaded] = useState(false);
  const supabase = useMemo(() => createClient(), []);

  const syncUser = useCallback(async () => {
    try {
      // Server Action 登入只會寫入 cookie，瀏覽器 singleton 不會收到 onAuthStateChange；
      // 先從 cookie 讀回 session，再 getUser，避免導回首頁後仍顯示「登入/註冊」。
      await supabase.auth.getSession();
      const {
        data: { user: u },
      } = await supabase.auth.getUser();
      setUser(u);
      void supabase
        .from("home_page_sections")
        .select("content")
        .eq("section_key", "site_settings")
        .maybeSingle()
        .then(({ data }) => {
          const s = normalizeSiteSettings(data?.content);
          setSiteTitle(s.siteTitle);
          setSiteLogoUrl(s.siteLogoUrl);
        });
      if (u) {
        const { data } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("id", u.id)
          .maybeSingle();
        setProfileFullName(data?.full_name ?? null);
      } else {
        setProfileFullName(null);
      }
    } finally {
      setAuthLoaded(true);
    }
  }, [supabase]);

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

  // 換頁後（例如 /login → /）強制與 cookie 同步
  useEffect(() => {
    void syncUser();
  }, [pathname, syncUser]);

  useEffect(() => {
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
    window.addEventListener("profile-updated", onVisible);

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      const next = session?.user ?? null;
      setUser(next);
      if (next) {
        void supabase
          .from("profiles")
          .select("full_name")
          .eq("id", next.id)
          .maybeSingle()
          .then(({ data }) => setProfileFullName(data?.full_name ?? null));
      } else {
        setProfileFullName(null);
      }
      setAuthLoaded(true);
    });

    return () => {
      window.clearInterval(interval);
      window.removeEventListener("focus", onVisible);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("profile-updated", onVisible);
      subscription.unsubscribe();
    };
  }, [supabase, syncUser]);

  /** 僅用 Server Action 登出並 redirect，避免與 `router.refresh()` 競態（Next.js：Router action dispatched before initialization） */
  function handleSignOut() {
    void signOut();
  }

  if (pathname.startsWith("/admin")) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/80 bg-background/85 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2" title={siteTitle}>
            {siteLogoUrl.trim() ? (
              <Image
                src={siteLogoUrl.trim()}
                alt={siteTitle}
                width={220}
                height={56}
                priority
                sizes="(max-width: 768px) 55vw, 220px"
                style={{ width: "auto", height: "auto" }}
                className="h-8 w-auto max-h-9 max-w-[min(220px,55vw)] object-contain object-left"
              />
            ) : (
              <SiteLogo text={siteTitle} className="text-xl" />
            )}
          </Link>
          <nav className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <Link href="/products" className="transition-colors hover:text-foreground">
              所有商品
            </Link>
            <NavCategoryMenu categories={navProductCategories} />
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
            title={wishCount > 0 ? `願望清單（${wishCount} 項）` : "願望清單"}
          >
            <Heart className="h-5 w-5" aria-hidden />
            {wishCount > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {wishCount > 99 ? "99+" : wishCount}
              </span>
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="relative text-muted-foreground"
            nativeButton={false}
            render={<Link href="/cart" />}
            aria-label={totalItems > 0 ? `購物車，${totalItems} 件商品` : "購物車"}
            title={totalItems > 0 ? `購物車（${totalItems} 件）` : "購物車"}
          >
            <ShoppingCart className="h-5 w-5" aria-hidden />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary px-1 text-[10px] font-medium text-primary-foreground">
                {totalItems}
              </span>
            )}
          </Button>

          {!authLoaded ? (
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground/70 cursor-wait pointer-events-none"
              aria-label="載入會員狀態中"
              title="載入中…"
            >
              <User className="h-5 w-5" aria-hidden />
            </Button>
          ) : user ? (
            <>
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground"
                nativeButton={false}
                render={<Link href="/member" />}
                aria-label="會員中心"
                title="會員中心"
              >
                <User className="h-5 w-5" aria-hidden />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer text-muted-foreground"
                onClick={() => void handleSignOut()}
                aria-label="登出"
                title="登出"
              >
                <LogOut className="h-5 w-5" aria-hidden />
              </Button>
            </>
          ) : (
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                className="hidden cursor-pointer text-sm sm:flex"
                nativeButton={false}
                render={<Link href="/login" />}
              >
                登入 / 註冊
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="cursor-pointer text-muted-foreground sm:hidden"
                nativeButton={false}
                render={<Link href="/login" />}
                aria-label="登入或註冊"
                title="登入或註冊"
              >
                <User className="h-5 w-5" aria-hidden />
              </Button>
            </div>
          )}

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
                  <Menu className="h-5 w-5" aria-hidden />
                </Button>
              }
            />
            <SheetContent
              side="right"
              className="border-l border-border/80 bg-background/85 backdrop-blur-md"
            >
              <nav className="mt-8 flex flex-col gap-4 px-6 text-base font-medium">
                {/* sm 以上 header 已顯示心形捷徑，抽屜內不重複列出 */}
                <Link
                  href="/wishlist"
                  className="flex items-center gap-2 sm:hidden"
                >
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
                {navProductCategories.map((name) => (
                  <Link
                    key={name}
                    href={`/products?category=${encodeURIComponent(name)}`}
                    className="transition-colors hover:text-foreground text-muted-foreground"
                  >
                    {name}
                  </Link>
                ))}
                <Link href="/about" className="transition-colors hover:text-foreground text-muted-foreground">
                  關於我們
                </Link>
                {user ? (
                  <>
                    <div className="mt-2 border-t border-border pt-5">
                      <div className="mb-4 flex items-center gap-3 px-1">
                        <div className="flex size-10 items-center justify-center rounded-full border border-border bg-muted/40">
                          <User className="size-5 text-muted-foreground" />
                        </div>
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-foreground">
                            {displayNameForUser(user, profileFullName)}
                          </p>
                          <p className="mt-0.5 break-all text-xs text-muted-foreground">
                            {user.email}
                          </p>
                        </div>
                      </div>
                      <div className="mt-5 flex flex-col gap-4">
                        <Link
                          href="/member/profile"
                          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                        >
                          個人資料
                        </Link>
                        <Link
                          href="/member/orders"
                          className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                        >
                          我的訂單
                        </Link>
                        <button
                          type="button"
                          onClick={() => void handleSignOut()}
                          className="cursor-pointer text-left text-muted-foreground transition-colors hover:text-foreground"
                        >
                          登出
                        </button>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="mt-2 border-t border-border pt-5 sm:hidden">
                    <Link
                      href="/login"
                      className="cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                    >
                      登入 / 註冊
                    </Link>
                  </div>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}
