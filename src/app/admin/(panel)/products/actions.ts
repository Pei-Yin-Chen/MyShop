"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";
import { syncProductMainImageUrl } from "@/lib/admin/sync-product-main-image";
import {
  parseDisplayOrderFromForm,
  parsePriceStockFromForm,
  validateDisplayOrderField,
  validatePriceField,
  validateProductNameField,
  validateStockField,
} from "@/lib/admin/product-form-fields";
import { isEmptyRichText } from "@/lib/html/rich-text";

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

export type ProductFormState =
  | { ok: true; productId?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

const pathsToRevalidate = ["/admin/products", "/products", "/"];

export async function createProductAction(
  _prev: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const nameRaw = String(formData.get("name") ?? "");
  const name = nameRaw.trim();
  const descriptionRaw = String(formData.get("description") ?? "");
  const priceRaw = String(formData.get("price") ?? "");
  const stockRaw = String(formData.get("stock_quantity") ?? "");
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  const displayOrderRaw = String(formData.get("display_order") ?? "");

  const fieldErrors: Record<string, string> = {};
  const nameMsg = validateProductNameField(nameRaw);
  if (nameMsg) fieldErrors.name = nameMsg;
  if (isEmptyRichText(descriptionRaw)) fieldErrors.description = "請填寫描述";
  const priceMsg = validatePriceField(priceRaw);
  if (priceMsg) fieldErrors.price = priceMsg;
  const stockMsg = validateStockField(stockRaw);
  if (stockMsg) fieldErrors.stock_quantity = stockMsg;
  if (!categoryId) fieldErrors.category_id = "請選擇分類";
  if (!["draft", "active", "archived", "sold_out"].includes(status))
    fieldErrors.status = "狀態不正確";
  const displayOrderMsg = validateDisplayOrderField(displayOrderRaw);
  if (displayOrderMsg) fieldErrors.display_order = displayOrderMsg;

  if (Object.keys(fieldErrors).length > 0)
    return { ok: false, error: "請修正表單欄位", fieldErrors };

  const { price, stock_quantity } = parsePriceStockFromForm(priceRaw, stockRaw);
  const display_order = parseDisplayOrderFromForm(displayOrderRaw);

  const { data, error } = await supabase
    .from("products")
    .insert({
      name,
      description: descriptionRaw.trim(),
      price,
      category_id: categoryId,
      stock_quantity,
      status,
      display_order,
      subtitle: null,
      full_description: null,
      details: [],
      rating: 4.5,
      review_count: 0,
      is_featured: false,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  for (const p of pathsToRevalidate) revalidatePath(p);

  return { ok: true, productId: data.id };
}

export async function updateProductAction(
  productId: string,
  _prev: ProductFormState | undefined,
  formData: FormData,
): Promise<ProductFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const nameRaw = String(formData.get("name") ?? "");
  const name = nameRaw.trim();
  const descriptionRaw = String(formData.get("description") ?? "");
  const priceRaw = String(formData.get("price") ?? "");
  const stockRaw = String(formData.get("stock_quantity") ?? "");
  const categoryId = String(formData.get("category_id") ?? "").trim();
  const status = String(formData.get("status") ?? "draft");
  const displayOrderRaw = String(formData.get("display_order") ?? "");

  const fieldErrors: Record<string, string> = {};
  const nameMsg = validateProductNameField(nameRaw);
  if (nameMsg) fieldErrors.name = nameMsg;
  if (isEmptyRichText(descriptionRaw)) fieldErrors.description = "請填寫描述";
  const priceMsg = validatePriceField(priceRaw);
  if (priceMsg) fieldErrors.price = priceMsg;
  const stockMsg = validateStockField(stockRaw);
  if (stockMsg) fieldErrors.stock_quantity = stockMsg;
  if (!categoryId) fieldErrors.category_id = "請選擇分類";
  if (!["draft", "active", "archived", "sold_out"].includes(status))
    fieldErrors.status = "狀態不正確";
  const displayOrderMsg = validateDisplayOrderField(displayOrderRaw);
  if (displayOrderMsg) fieldErrors.display_order = displayOrderMsg;

  if (Object.keys(fieldErrors).length > 0)
    return { ok: false, error: "請修正表單欄位", fieldErrors };

  const { price, stock_quantity } = parsePriceStockFromForm(priceRaw, stockRaw);
  const display_order = parseDisplayOrderFromForm(displayOrderRaw);

  const { error } = await supabase
    .from("products")
    .update({
      name,
      description: descriptionRaw.trim(),
      price,
      category_id: categoryId,
      stock_quantity,
      status,
      display_order,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);

  if (error) return { ok: false, error: error.message };

  for (const p of pathsToRevalidate) revalidatePath(p);

  return { ok: true };
}

export async function deleteProductAction(productId: string): Promise<{ ok: boolean; error?: string }> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const { error } = await supabase.from("products").delete().eq("id", productId);
  if (error) return { ok: false, error: error.message };

  for (const p of pathsToRevalidate) revalidatePath(p);
  return { ok: true };
}

export async function registerProductImageAction(
  productId: string,
  imageUrl: string,
  altText: string | null,
): Promise<{ ok: boolean; error?: string; id?: string }> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const url = imageUrl.trim();
  if (!url) return { ok: false, error: "請提供圖片網址" };

  const { data: maxRow } = await supabase
    .from("product_images")
    .select("sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: false })
    .limit(1)
    .maybeSingle();

  const nextOrder = (maxRow?.sort_order ?? -1) + 1;

  const { data, error } = await supabase
    .from("product_images")
    .insert({
      product_id: productId,
      image_url: url,
      alt_text: altText?.trim() || null,
      sort_order: nextOrder,
    })
    .select("id")
    .single();

  if (error) return { ok: false, error: error.message };

  await syncProductMainImageUrl(supabase, productId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");

  return { ok: true, id: data.id };
}

export async function updateProductImageAction(
  imageId: string,
  productId: string,
  patch: { image_url?: string; alt_text?: string | null },
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const { error } = await supabase
    .from("product_images")
    .update({
      ...(patch.image_url !== undefined ? { image_url: patch.image_url.trim() } : {}),
      ...(patch.alt_text !== undefined ? { alt_text: patch.alt_text } : {}),
    })
    .eq("id", imageId)
    .eq("product_id", productId);

  if (error) return { ok: false, error: error.message };

  await syncProductMainImageUrl(supabase, productId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");

  return { ok: true };
}

export async function deleteProductImageAction(
  imageId: string,
  productId: string,
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const { error } = await supabase.from("product_images").delete().eq("id", imageId).eq("product_id", productId);

  if (error) return { ok: false, error: error.message };

  await syncProductMainImageUrl(supabase, productId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");

  return { ok: true };
}

export async function reorderProductImagesAction(
  productId: string,
  orderedIds: string[],
): Promise<{ ok: boolean; error?: string }> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const { error } = await supabase.rpc("reorder_product_images", {
    p_product_id: productId,
    p_ids: orderedIds,
  });

  if (error) return { ok: false, error: error.message };

  await syncProductMainImageUrl(supabase, productId);
  revalidatePath("/admin/products");
  revalidatePath(`/admin/products/${productId}`);
  revalidatePath("/products");

  return { ok: true };
}
