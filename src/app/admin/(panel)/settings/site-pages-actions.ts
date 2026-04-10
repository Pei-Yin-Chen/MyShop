"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";
import {
  validateCustomerServiceHref,
  validateCustomerServiceSlug,
  customerServicePagePublicPath,
  type CustomerServiceFooterLink,
} from "@/lib/customer-service";
import { isEmptyRichText } from "@/lib/html/rich-text";

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

export type CustomerServiceFooterFormState =
  | { ok: true; message?: string }
  | { ok: false; error: string };

export type CustomerServicePageFormState =
  | { ok: true; message?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function updateCustomerServiceFooterAction(
  _prev: CustomerServiceFooterFormState | undefined,
  formData: FormData,
): Promise<CustomerServiceFooterFormState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const rawJson = String(formData.get("footer_links_json") ?? "").trim();
  let parsed: unknown;
  try {
    parsed = JSON.parse(rawJson);
  } catch {
    return { ok: false, error: "連結資料格式錯誤" };
  }

  const linksRaw = Array.isArray(parsed) ? parsed : [];
  const links: CustomerServiceFooterLink[] = [];
  const fieldErrors: string[] = [];

  for (let i = 0; i < linksRaw.length; i += 1) {
    const row = linksRaw[i];
    if (!row || typeof row !== "object" || Array.isArray(row)) continue;
    const label = String((row as { label?: unknown }).label ?? "").trim();
    const href = String((row as { href?: unknown }).href ?? "").trim();
    if (!label && !href) continue;
    if (!label) {
      fieldErrors.push(`第 ${i + 1} 列：請填寫連結文字`);
      continue;
    }
    const he = validateCustomerServiceHref(href);
    if (he) {
      fieldErrors.push(`「${label}」：${he}`);
      continue;
    }
    links.push({ label, href });
  }

  if (links.length === 0) {
    return { ok: false, error: "請至少保留一筆有效連結" };
  }
  if (fieldErrors.length > 0) {
    return { ok: false, error: fieldErrors.join("；") };
  }

  const content = { links };
  const { error } = await supabase.from("home_page_sections").upsert(
    {
      section_key: "customer_service_footer",
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "section_key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings/site-pages");
  return { ok: true, message: "已儲存客戶服務連結" };
}

export async function updateCustomerServicePageAction(
  _prev: CustomerServicePageFormState | undefined,
  formData: FormData,
): Promise<CustomerServicePageFormState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const metaDescription = String(formData.get("meta_description") ?? "").trim();
  const bodyHtml = String(formData.get("body_html") ?? "");

  const fieldErrors: Record<string, string> = {};
  const slugErr = validateCustomerServiceSlug(slug);
  if (slugErr) fieldErrors.slug = slugErr;
  if (!title) fieldErrors.title = "請填寫頁面大標題";
  if (title.length > 120) fieldErrors.title = "標題過長（最多 120 字）";
  if (metaDescription.length > 300) fieldErrors.meta_description = "簡短說明過長（最多 300 字）";
  if (isEmptyRichText(bodyHtml)) fieldErrors.body_html = "請填寫內文";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "請依紅字提示修正", fieldErrors };
  }

  const { error } = await supabase
    .from("customer_service_pages")
    .update({
      title,
      meta_description: metaDescription || null,
      body_html: bodyHtml,
      updated_at: new Date().toISOString(),
    })
    .eq("slug", slug);

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath(customerServicePagePublicPath(slug));
  revalidatePath("/admin/settings/site-pages");
  revalidatePath(`/admin/settings/site-pages/${slug}`);
  return { ok: true, message: "已儲存說明頁" };
}

export async function createCustomerServicePageAction(
  _prev: CustomerServicePageFormState | undefined,
  formData: FormData,
): Promise<CustomerServicePageFormState> {
  const { supabase, error: authError } = await requireAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const slug = String(formData.get("slug") ?? "").trim().toLowerCase();
  const title = String(formData.get("title") ?? "").trim();
  const metaDescription = String(formData.get("meta_description") ?? "").trim();
  const bodyHtml = String(formData.get("body_html") ?? "");

  const fieldErrors: Record<string, string> = {};
  const slugErr = validateCustomerServiceSlug(slug);
  if (slugErr) fieldErrors.slug = slugErr;
  if (!title) fieldErrors.title = "請填寫頁面大標題";
  if (title.length > 120) fieldErrors.title = "標題過長（最多 120 字）";
  if (metaDescription.length > 300) fieldErrors.meta_description = "簡短說明過長（最多 300 字）";
  if (isEmptyRichText(bodyHtml)) fieldErrors.body_html = "請填寫內文";

  if (Object.keys(fieldErrors).length > 0) {
    return { ok: false, error: "請依紅字提示修正", fieldErrors };
  }

  const { error } = await supabase.from("customer_service_pages").insert({
    slug,
    title,
    meta_description: metaDescription || null,
    body_html: bodyHtml,
  });

  if (error) {
    if (error.code === "23505") {
      return { ok: false, error: "此網址名稱已被使用，請換一個" };
    }
    return { ok: false, error: error.message };
  }

  revalidatePath("/");
  revalidatePath(customerServicePagePublicPath(slug));
  revalidatePath("/admin/settings/site-pages");
  return { ok: true, message: "已新增說明頁" };
}
