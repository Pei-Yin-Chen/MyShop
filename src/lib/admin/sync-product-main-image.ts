import type { SupabaseClient } from "@supabase/supabase-js";

/** 將 `products.image_url` 設為該商品圖庫 sort_order 最小者（主圖） */
export async function syncProductMainImageUrl(
  supabase: SupabaseClient,
  productId: string,
) {
  const { data: first } = await supabase
    .from("product_images")
    .select("image_url")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true })
    .limit(1)
    .maybeSingle();

  await supabase
    .from("products")
    .update({
      image_url: first?.image_url ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", productId);
}
