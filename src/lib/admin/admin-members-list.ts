/** 後台會員列表：分頁大小、URL 輔助與搜尋消毒 */
export const ADMIN_MEMBERS_PAGE_SIZE = 20;

/** 會員詳細頁「訂單紀錄」表格每頁筆數 */
export const ADMIN_MEMBER_DETAIL_ORDERS_PAGE_SIZE = 10;

/** 會員詳細頁 URL（可帶訂單列表頁碼 `ordersPage`） */
export function buildAdminMemberDetailHref(
  memberId: string,
  params?: { ordersPage?: number },
): string {
  const sp = new URLSearchParams();
  if (params?.ordersPage && params.ordersPage > 1) {
    sp.set("ordersPage", String(params.ordersPage));
  }
  const qs = sp.toString();
  return `/admin/members/${memberId}${qs ? `?${qs}` : ""}`;
}

/** 來源篩選（URL `source`） */
export const ADMIN_MEMBER_SOURCE_FILTER_VALUES = ["registered", "purchase"] as const;
export type AdminMemberSourceFilter =
  (typeof ADMIN_MEMBER_SOURCE_FILTER_VALUES)[number];

/** 帳號狀態篩選（URL `status`，對應 admin_account_status） */
export const ADMIN_MEMBER_ACCOUNT_STATUS_FILTER_VALUES = [
  "active",
  "dormant",
  "repeat_buyer",
  "banned",
] as const;
export type AdminMemberAccountStatusFilter =
  (typeof ADMIN_MEMBER_ACCOUNT_STATUS_FILTER_VALUES)[number];

const UUID_FULL =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

/** 僅 hex 與連字號，視為 UUID 片段（至少 8 字元才併入 id 搜尋，減少誤判） */
const UUID_LIKE_FRAGMENT = /^[0-9a-f-]{8,}$/i;

export function sanitizeMemberSearchQuery(raw: string): string {
  return raw.trim().replace(/[%_,]/g, "").slice(0, 80);
}

/**
 * PostgREST `or` 條件：姓名、Email，以及依輸入型態比對會員 id（UUID）。
 * - 完整 UUID → `id.eq`
 * - 長度 ≥8 且僅含 hex／連字號 → `id::text.ilike`（可貼片段）
 */
export function buildMemberSearchOrFilter(q: string): string {
  const parts = [`full_name.ilike.%${q}%`, `email.ilike.%${q}%`];
  if (UUID_FULL.test(q)) {
    parts.push(`id.eq.${q}`);
  } else if (UUID_LIKE_FRAGMENT.test(q)) {
    parts.push(`id::text.ilike.%${q}%`);
  }
  return parts.join(",");
}

export function buildAdminMembersListHref(params: {
  q?: string;
  page?: number;
  source?: string;
  status?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (params.source && ADMIN_MEMBER_SOURCE_FILTER_VALUES.includes(params.source as AdminMemberSourceFilter)) {
    sp.set("source", params.source);
  }
  if (
    params.status &&
    ADMIN_MEMBER_ACCOUNT_STATUS_FILTER_VALUES.includes(
      params.status as AdminMemberAccountStatusFilter,
    )
  ) {
    sp.set("status", params.status);
  }
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `/admin/members${qs ? `?${qs}` : ""}`;
}
