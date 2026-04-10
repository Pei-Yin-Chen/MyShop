import { createClient } from "@/lib/supabase/server";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminHomeRulesForm } from "@/components/admin/AdminHomeRulesForm";
import { normalizeRules } from "@/lib/supabase/fetch-home-page";

export default async function AdminHomeRulesSettingsPage() {
  const supabase = await createClient();
  const { data: row } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "shopping_rules")
    .maybeSingle();

  const initial = normalizeRules(row?.content);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/settings" ariaLabel="返回系統設定" title="返回設定列表" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">說明列表區</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">編輯此區塊內容，儲存後套用於首頁。</p>
          </div>
        </div>
      </div>

      <AdminHomeRulesForm initial={initial} />
    </div>
  );
}

