/** 後台訂單列表：分頁、URL 與搜尋消毒 */

export const ADMIN_ORDERS_PAGE_SIZE = 20;

/** 與 `orders.status` check constraint 一致 */
export const ADMIN_ORDER_STATUS_FILTER_VALUES = [
  "pending",
  "paid",
  "processing",
  "shipped",
  "completed",
  "cancelled",
] as const;
export type AdminOrderStatusFilter = (typeof ADMIN_ORDER_STATUS_FILTER_VALUES)[number];

/** 訂單列表：內部備註／處理狀態篩選（query `note`） */
export const ADMIN_ORDER_NOTE_FILTER_VALUES = [
  "",
  "no_note",
  "pending",
  "processing",
  "resolved",
] as const;
export type AdminOrderNoteFilter = (typeof ADMIN_ORDER_NOTE_FILTER_VALUES)[number];

export function adminOrderNoteFilterLabel(value: string): string {
  switch (value) {
    case "no_note":
      return "無內部備註";
    case "pending":
      return "待處理";
    case "processing":
      return "處理中";
    case "resolved":
      return "已處理";
    default:
      return "全部";
  }
}

const UUID_FULL =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const UUID_LIKE_FRAGMENT = /^[0-9a-f-]{8,}$/i;

/**
 * 訂單編號在 DB 不含 `#`（畫面僅為顯示），搜尋時須去掉開頭的 `#` 才能比對到 `order_number`。
 * 逗號會破壞 PostgREST `or=(a,b,c)` 語法，故移除。
 * 訂單編號含 `_`（見 `generateMerTradeNo`），不可再移除 `_`；改在 {@link escapeIlikeFragment} 處理 LIKE 萬用字元。
 */
export function sanitizeOrderSearchQuery(raw: string): string {
  return raw
    .trim()
    .replace(/^#+/, "")
    .replace(/,/g, "")
    .slice(0, 80);
}

/** 與 `generateMerTradeNo` / PAYUNi MerTradeNo 字元集一致，用於精確比對 `order_number`。 */
const ORDER_NUMBER_SEARCH_EQ_RE = /^[A-Za-z0-9_-]{1,25}$/;

/** PostgreSQL ILIKE：將 `%` `_` `\` 轉成字面比對（PostgREST 傳入之 pattern 預設以 `\` 跳脫）。 */
function escapeIlikeFragment(s: string): string {
  return s.replace(/\\/g, "\\\\").replace(/%/g, "\\%").replace(/_/g, "\\_");
}

/**
 * PostgREST `or`：訂單編號、收件人、Email，以及訂單 id（UUID）。
 */
export function buildOrderSearchOrFilter(q: string): string {
  const esc = escapeIlikeFragment(q);
  const parts = [
    `order_number.ilike.%${esc}%`,
    `recipient_name.ilike.%${esc}%`,
    `recipient_email.ilike.%${esc}%`,
  ];
  if (ORDER_NUMBER_SEARCH_EQ_RE.test(q)) {
    parts.push(`order_number.eq.${q}`);
  }
  if (UUID_FULL.test(q)) {
    parts.push(`id.eq.${q}`);
  } else if (UUID_LIKE_FRAGMENT.test(q)) {
    parts.push(`id::text.ilike.%${esc}%`);
  }
  return parts.join(",");
}

export function buildAdminOrdersListHref(params: {
  q?: string;
  page?: number;
  status?: string;
  note?: string;
}): string {
  const sp = new URLSearchParams();
  if (params.q?.trim()) sp.set("q", params.q.trim());
  if (
    params.status &&
    ADMIN_ORDER_STATUS_FILTER_VALUES.includes(params.status as AdminOrderStatusFilter)
  ) {
    sp.set("status", params.status);
  }
  if (
    params.note &&
    ADMIN_ORDER_NOTE_FILTER_VALUES.includes(params.note as AdminOrderNoteFilter) &&
    params.note !== ""
  ) {
    sp.set("note", params.note);
  }
  if (params.page && params.page > 1) sp.set("page", String(params.page));
  const qs = sp.toString();
  return `/admin/orders${qs ? `?${qs}` : ""}`;
}
