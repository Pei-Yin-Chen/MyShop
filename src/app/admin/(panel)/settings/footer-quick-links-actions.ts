"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";
import {
  normalizeFooterQuickLinks,
  validateFooterQuickLinksContent,
  type FooterQuickLinksContent,
} from "@/lib/footer-quick-links";

export type FooterQuickLinksFormState =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

async function requireAdminSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "未登入" as const };
  const ok = await fetchUserIsAdmin(supabase, user.id);
  if (!ok) return { supabase: null, error: "需要管理員權限" as const };
  return { supabase, error: null as null };
}

export async function updateFooterQuickLinksAction(
  _prev: FooterQuickLinksFormState | undefined,
  formData: FormData,
): Promise<FooterQuickLinksFormState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const content: FooterQuickLinksContent = {
    aboutLabel: String(formData.get("aboutLabel") ?? "").trim(),
    aboutHref: String(formData.get("aboutHref") ?? "").trim(),
  };

  const fieldErrors = validateFooterQuickLinksContent(content);
  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "請依紅字提示修正", fieldErrors };
  }

  const { error } = await supabase.from("home_page_sections").upsert(
    {
      section_key: "footer_quick_links",
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "section_key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  revalidatePath("/admin/settings/site-pages");
  return { ok: true, message: "已儲存快速連結" };
}
