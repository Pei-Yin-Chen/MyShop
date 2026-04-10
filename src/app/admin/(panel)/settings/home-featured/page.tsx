import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminFeaturedIntroForm } from "@/components/admin/AdminFeaturedIntroForm";
import { normalizeFeaturedIntro } from "@/lib/supabase/fetch-home-page";

export default async function AdminHomeFeaturedSettingsPage() {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "featured_intro")
    .maybeSingle();

  const initial = normalizeFeaturedIntro(row?.content);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/settings" ariaLabel="返回系統設定" title="返回設定列表" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">商品推薦區</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              編輯此區塊標題與副標，儲存後套用於首頁。精選商品請至{" "}
              <Link href="/admin/products" className="font-medium text-primary underline-offset-4 hover:underline">
                商品管理
              </Link>{" "}
              勾選「顯示於首頁精選」。
            </p>
          </div>
        </div>
      </div>

      <AdminFeaturedIntroForm initial={initial} />
    </div>
  );
}
