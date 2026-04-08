"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";

async function getAdminSupabase() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { supabase: null, error: "未登入" as const };
  const ok = await fetchUserIsAdmin(supabase, user.id);
  if (!ok) return { supabase: null, error: "需要管理員權限" as const };
  return { supabase, error: null as null };
}

export type CategoryFormState =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export async function createCategoryAction(
  _prev: CategoryFormState | undefined,
  formData: FormData,
): Promise<CategoryFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const name = String(formData.get("name") ?? "").trim();
  const sort_order = Number(formData.get("sort_order"));

  if (!name) return { ok: false, error: "請填寫分類名稱", fieldErrors: { name: "必填" } };
  if (!Number.isFinite(sort_order) || sort_order < 0)
    return { ok: false, error: "排序需為 0 以上的整數", fieldErrors: { sort_order: "不正確" } };

  const { error } = await supabase.from("product_categories").insert({
    name,
    sort_order: Math.round(sort_order),
  });

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "已有相同名稱的分類", fieldErrors: { name: "重複" } };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/products/categories");
  revalidatePath("/admin/products");
  return { ok: true };
}

export async function updateCategoryAction(
  categoryId: string,
  _prev: CategoryFormState | undefined,
  formData: FormData,
): Promise<CategoryFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const name = String(formData.get("name") ?? "").trim();
  const sort_order = Number(formData.get("sort_order"));

  if (!name) return { ok: false, error: "請填寫分類名稱", fieldErrors: { name: "必填" } };
  if (!Number.isFinite(sort_order) || sort_order < 0)
    return { ok: false, error: "排序需為 0 以上的整數", fieldErrors: { sort_order: "不正確" } };

  const { error } = await supabase
    .from("product_categories")
    .update({
      name,
      sort_order: Math.round(sort_order),
    })
    .eq("id", categoryId);

  if (error) {
    if (error.code === "23505")
      return { ok: false, error: "已有相同名稱的分類", fieldErrors: { name: "重複" } };
    return { ok: false, error: error.message };
  }

  revalidatePath("/admin/products/categories");
  revalidatePath("/admin/products");
  revalidatePath("/products");
  return { ok: true };
}

export async function deleteCategoryAction(categoryId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const { count, error: cErr } = await supabase
    .from("products")
    .select("*", { count: "exact", head: true })
    .eq("category_id", categoryId);

  if (cErr) return { ok: false, error: cErr.message };
  if ((count ?? 0) > 0)
    return { ok: false, error: "仍有商品使用此分類，請先變更商品分類後再刪除" };

  const { error } = await supabase.from("product_categories").delete().eq("id", categoryId);
  if (error) return { ok: false, error: error.message };

  revalidatePath("/admin/products/categories");
  revalidatePath("/admin/products");
  return { ok: true };
}
