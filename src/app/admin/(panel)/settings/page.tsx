import type { LucideIcon } from "lucide-react";
import Link from "next/link";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  ChevronRight,
  ClipboardList,
  GalleryVerticalEnd,
  HeartHandshake,
  Image as ImageIcon,
  FileText,
  Sparkles,
  Type,
} from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import {
  normalizeFeaturedIntro,
  normalizeGallery,
  normalizeHero,
  normalizePhilosophy,
  normalizeRules,
} from "@/lib/supabase/fetch-home-page";
import { normalizeSiteSettings } from "@/lib/site-settings";
import type { ReactNode } from "react";
import { fetchCustomerServicePagesForAdmin } from "@/lib/supabase/fetch-customer-service";

function SettingsLinkCard({
  href,
  icon: Icon,
  title,
  children,
}: {
  href: string;
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <li>
      <Link
        href={href}
        className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        <Card className="border-border/80 shadow-sm transition-colors hover:bg-muted/40">
          <CardHeader className="flex flex-row items-start gap-3 space-y-0">
            <div className="flex min-w-0 flex-1 gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden />
              </div>
              <div className="min-w-0 flex-1">
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription className="mt-1">{children}</CardDescription>
              </div>
            </div>
            <ChevronRight
              className="mt-0.5 size-5 shrink-0 text-muted-foreground"
              aria-hidden
            />
          </CardHeader>
        </Card>
      </Link>
    </li>
  );
}

export default async function AdminSettingsPage() {
  const supabase = await createClient();
  const [{ data }, customerServicePages] = await Promise.all([
    supabase
      .from("home_page_sections")
      .select("section_key, content")
      .in("section_key", [
        "site_settings",
        "hero",
        "featured_intro",
        "product_gallery",
        "brand_philosophy",
        "shopping_rules",
      ]),
    fetchCustomerServicePagesForAdmin(),
  ]);
  const byKey = new Map<string, unknown>();
  for (const row of data ?? []) {
    byKey.set(row.section_key as string, row.content);
  }

  const site = normalizeSiteSettings(byKey.get("site_settings"));
  const hero = normalizeHero(byKey.get("hero"));
  const featured = normalizeFeaturedIntro(byKey.get("featured_intro"));
  const gallery = normalizeGallery(byKey.get("product_gallery"));
  const philosophy = normalizePhilosophy(byKey.get("brand_philosophy"));
  const rules = normalizeRules(byKey.get("shopping_rules"));

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">系統設定</h2>
        <p className="mt-1 text-sm text-muted-foreground">管理全站識別與首頁各區塊內容。</p>
      </div>

      <div className="space-y-8 lg:max-w-xl">
        <section aria-labelledby="settings-site-wide-heading">
          <h3
            id="settings-site-wide-heading"
            className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground"
          >
            全站
          </h3>
          <ul className="grid gap-4 sm:grid-cols-1">
            <SettingsLinkCard href="/admin/settings/site" icon={Type} title="網站標題與 Logo">
              <>
                標題：{site.siteTitle}
                <span className="mt-1 block text-xs">
                  Logo：{site.siteLogoUrl ? "已上傳圖片" : "顯示文字標題"}
                </span>
                <span className="mt-1 block text-xs line-clamp-2">
                  Footer：{site.footerTagline}
                </span>
              </>
            </SettingsLinkCard>

            <SettingsLinkCard href="/admin/settings/site-pages" icon={FileText} title="網站說明">
              <>
                可設定頁尾快速連結、客戶服務區塊與說明頁內容。
                <span className="mt-1 block text-xs">
                  目前已建立 {customerServicePages.length} 則說明頁
                </span>
              </>
            </SettingsLinkCard>
          </ul>
        </section>

        <section aria-labelledby="settings-home-heading">
          <h3
            id="settings-home-heading"
            className="mb-3 text-sm font-semibold tracking-tight text-muted-foreground"
          >
            首頁
          </h3>
          <ul className="grid gap-4 sm:grid-cols-1">
            <SettingsLinkCard href="/admin/settings/home-hero" icon={ImageIcon} title="Banner（主視覺）">
              <>
                目前主標：{hero.titleLine1}
                {hero.titleLine2Accent ? ` ${hero.titleLine2Accent}` : ""}
              </>
            </SettingsLinkCard>

            <SettingsLinkCard
              href="/admin/settings/home-featured"
              icon={Sparkles}
              title="商品推薦區"
            >
              目前標題：{featured.title}
            </SettingsLinkCard>

            <SettingsLinkCard
              href="/admin/settings/home-gallery"
              icon={GalleryVerticalEnd}
              title="圖片展示區"
            >
              {gallery.enabled === false ? "目前狀態：不顯示" : `目前標題：${gallery.title}`}
            </SettingsLinkCard>

            <SettingsLinkCard
              href="/admin/settings/home-philosophy"
              icon={HeartHandshake}
              title="介紹卡片區"
            >
              {philosophy.enabled === false ? "目前狀態：不顯示" : `目前標題：${philosophy.title}`}
            </SettingsLinkCard>

            <SettingsLinkCard href="/admin/settings/home-rules" icon={ClipboardList} title="說明列表區">
              {rules.enabled === false ? "目前狀態：不顯示" : `目前標題：${rules.title}`}
            </SettingsLinkCard>
          </ul>
        </section>
      </div>
    </div>
  );
}
