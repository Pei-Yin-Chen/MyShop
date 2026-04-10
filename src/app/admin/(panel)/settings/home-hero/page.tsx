import { createClient } from "@/lib/supabase/server";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminHomeHeroForm } from "@/components/admin/AdminHomeHeroForm";
import { normalizeHero } from "@/lib/supabase/fetch-home-page";

export default async function AdminHomeHeroSettingsPage() {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "hero")
    .maybeSingle();

  const initial = normalizeHero(row?.content);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/settings" ariaLabel="返回系統設定" title="返回設定列表" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Banner（主視覺）</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">編輯此區塊內容，儲存後套用於首頁。</p>
          </div>
        </div>
      </div>

      <AdminHomeHeroForm initial={initial} />
    </div>
  );
}

