export type SiteSettings = {
  siteTitle: string;
  siteDescription: string;
  /** 前台導覽列 Logo 圖片網址（Supabase Storage 或 https）；空字串則顯示文字標題 */
  siteLogoUrl: string;
  /** Footer 專用 Logo；空字串時沿用網站 Logo，兩者皆空則顯示文字標題 */
  footerLogoUrl: string;
  /** Footer 品牌區塊簡短說明 */
  footerTagline: string;
  /** 頁尾「聯絡我們」— 地址（可含換行） */
  footerContactAddress: string;
  footerContactPhone: string;
  footerContactEmail: string;
};

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  siteTitle: "我的商店",
  siteDescription: "",
  siteLogoUrl: "",
  footerLogoUrl: "",
  footerTagline: "精選商品與貼心服務，線上輕鬆選購。",
  footerContactAddress: "",
  footerContactPhone: "",
  footerContactEmail: "",
};

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

export function normalizeSiteSettings(raw: unknown): SiteSettings {
  if (!isRecord(raw)) return DEFAULT_SITE_SETTINGS;
  const siteTitle = typeof raw.siteTitle === "string" ? raw.siteTitle.trim() : "";
  const siteDescription = typeof raw.siteDescription === "string" ? raw.siteDescription.trim() : "";
  const siteLogoUrl = typeof raw.siteLogoUrl === "string" ? raw.siteLogoUrl.trim() : "";
  const footerLogoUrl = typeof raw.footerLogoUrl === "string" ? raw.footerLogoUrl.trim() : "";
  const footerTagline =
    typeof raw.footerTagline === "string"
      ? raw.footerTagline.trim()
      : DEFAULT_SITE_SETTINGS.footerTagline;
  const footerContactAddress =
    typeof raw.footerContactAddress === "string" ? raw.footerContactAddress.trim() : "";
  const footerContactPhone =
    typeof raw.footerContactPhone === "string" ? raw.footerContactPhone.trim() : "";
  const footerContactEmail =
    typeof raw.footerContactEmail === "string" ? raw.footerContactEmail.trim() : "";
  return {
    siteTitle: siteTitle || DEFAULT_SITE_SETTINGS.siteTitle,
    siteDescription,
    siteLogoUrl,
    footerLogoUrl,
    footerTagline,
    footerContactAddress,
    footerContactPhone,
    footerContactEmail,
  };
}

