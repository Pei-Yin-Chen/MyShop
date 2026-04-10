export type CustomerServiceFooterLink = {
  label: string;
  href: string;
};

/** 新資料庫尚未有設定時，與 migration 種子一致 */
export const DEFAULT_CUSTOMER_SERVICE_FOOTER_LINKS: CustomerServiceFooterLink[] = [
  { label: "常見問題", href: "/faq" },
  { label: "運送與取貨", href: "/shipping" },
  { label: "取消與變更", href: "/returns" },
  { label: "隱私權政策", href: "/privacy" },
  { label: "服務條款", href: "/terms" },
];

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

/** 讀取 home_page_sections.customer_service_footer JSON */
export function normalizeCustomerServiceFooter(raw: unknown): CustomerServiceFooterLink[] {
  if (!isRecord(raw)) return [...DEFAULT_CUSTOMER_SERVICE_FOOTER_LINKS];
  const linksRaw = raw.links;
  if (!Array.isArray(linksRaw) || linksRaw.length === 0) {
    return [...DEFAULT_CUSTOMER_SERVICE_FOOTER_LINKS];
  }
  const out: CustomerServiceFooterLink[] = [];
  for (const item of linksRaw) {
    if (!isRecord(item)) continue;
    const label = typeof item.label === "string" ? item.label.trim() : "";
    const href = typeof item.href === "string" ? item.href.trim() : "";
    if (!label || !href) continue;
    out.push({ label, href });
  }
  return out.length > 0 ? out : [...DEFAULT_CUSTOMER_SERVICE_FOOTER_LINKS];
}

export function validateCustomerServiceHref(h: string): string | null {
  const t = h.trim();
  if (!t) return "請填寫連結";
  if (t.startsWith("/")) return null;
  if (t.startsWith("https://") || t.startsWith("http://")) return null;
  return "站內連結請以 / 開頭；外部網站請以 https:// 或 http:// 開頭";
}

export const CUSTOMER_SERVICE_SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** 與 app 既有靜態路由衝突的網址名稱（避免 /faq 被誤建成說明頁卻開到別的頁） */
const RESERVED_CUSTOMER_SERVICE_SLUGS = new Set([
  "admin",
  "api",
  "cart",
  "checkout",
  "login",
  "member",
  "products",
  "blog",
  "wishlist",
  "support",
]);

/** 前台顧客開啟的網址（關於我們為 /about；其餘為 /{slug}）。 */
export function customerServicePagePublicPath(slug: string): string {
  const s = slug.trim().toLowerCase();
  if (s === "about") return "/about";
  return `/${s}`;
}

export function validateCustomerServiceSlug(s: string): string | null {
  const t = s.trim().toLowerCase();
  if (!t) return "請填寫網址名稱";
  if (t.length > 80) return "網址名稱過長";
  if (!CUSTOMER_SERVICE_SLUG_RE.test(t)) return "僅能使用小寫英文、數字與連字號（例：faq、my-page）";
  if (RESERVED_CUSTOMER_SERVICE_SLUGS.has(t)) {
    return "此名稱與網站既有路徑衝突，請換一個";
  }
  return null;
}
