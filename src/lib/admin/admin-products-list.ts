/** 後台商品列表：分頁大小與 URL 輔助 */

export const ADMIN_PRODUCTS_PAGE_SIZE = 20;

/** 後台列表允許的狀態篩選值（URL `status`） */
export const ADMIN_PRODUCT_STATUS_FILTER_VALUES = [
  "draft",
  "active",
  "archived",
  "sold_out",
] as const;

export type AdminProductStatusFilter =
  (typeof ADMIN_PRODUCT_STATUS_FILTER_VALUES)[number];

/** 移除 ILIKE / PostgREST `or` 會誤判的字元 */
export function sanitizeProductSearchQuery(raw: string): string {
  return raw.trim().replace(/[%_,]/g, "");
}

/** 無欄位排序時：有任一篩選條件則依最後編輯新到舊，否則依顯示順序 */
export function getAdminProductsListDefaultOrder(hasActiveFilters: boolean): {
  column: "display_order" | "updated_at";
  ascending: boolean;
} {
  if (hasActiveFilters) return { column: "updated_at", ascending: false };
  return { column: "display_order", ascending: true };
}

export function buildAdminProductsListHref(
  q: string,
  page: number,
  categoryId?: string | null,
  status?: string | null,
): string {
  const params = new URLSearchParams();
  const s = sanitizeProductSearchQuery(q);
  if (s) params.set("q", s);
  if (categoryId) params.set("category", categoryId);
  if (status) params.set("status", status);
  if (page > 1) params.set("page", String(page));

  const qs = params.toString();
  return `/admin/products${qs ? `?${qs}` : ""}`;
}
