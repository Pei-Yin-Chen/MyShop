/** 商品描述等富文字：編輯器載入、驗證、純文字摘要 */

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/** 資料庫既有純文字 → TipTap HTML；已是 HTML 則沿用 */
export function normalizeDescriptionForEditor(raw: string | undefined): string {
  if (!raw?.trim()) return "";
  const t = raw.trim();
  if (/<[a-z][\s\S]*>/i.test(t)) return raw;
  return `<p>${escapeHtml(t).replace(/\r\n|\r|\n/g, "<br />")}</p>`;
}

export function stripHtmlToPlainText(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function isEmptyRichText(html: string): boolean {
  return stripHtmlToPlainText(html).length === 0;
}
