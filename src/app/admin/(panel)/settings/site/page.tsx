import { createClient } from "@/lib/supabase/server";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminSiteSettingsForm } from "@/components/admin/AdminSiteSettingsForm";
import { normalizeSiteSettings } from "@/lib/site-settings";

export default async function AdminSiteSettingsPage() {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "site_settings")
    .maybeSingle();

  const initial = normalizeSiteSettings(row?.content);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/settings" ariaLabel="返回系統設定" title="返回設定列表" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">網站標題與 Logo</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">
              編輯網站識別與頁尾資訊，儲存後套用於全站（導覽列、頁尾、瀏覽器標題等）。
            </p>
          </div>
        </div>
      </div>

      <AdminSiteSettingsForm initial={initial} />
    </div>
  );
}

