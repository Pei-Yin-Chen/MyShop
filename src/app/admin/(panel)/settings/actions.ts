"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";
import {
  PHILOSOPHY_ICON_KEYS,
  SECTION_CARD_BG_VARIANTS,
  SHOPPING_RULE_ICON_KEYS,
  type FeaturedIntroContent,
  type HeroSectionContent,
  type ProductGallerySectionContent,
  type BrandPhilosophySectionContent,
  type ShoppingRulesSectionContent,
} from "@/data/home-page-defaults";

export type FeaturedIntroFormState =
  | { ok: true; content: FeaturedIntroContent }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type HeroFormState =
  | { ok: true; content: HeroSectionContent }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type GalleryFormState =
  | { ok: true; content: ProductGallerySectionContent }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type PhilosophyFormState =
  | { ok: true; content: BrandPhilosophySectionContent }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type RulesFormState =
  | { ok: true; content: ShoppingRulesSectionContent }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

export type SiteSettingsFormState =
  | {
      ok: true;
      content: {
        siteTitle: string;
        siteDescription: string;
        siteLogoUrl: string;
        footerLogoUrl: string;
        footerTagline: string;
        footerContactAddress: string;
        footerContactPhone: string;
        footerContactEmail: string;
      };
    }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

function validateBrowseHref(h: string): string | null {
  const t = h.trim();
  if (!t) return "請填寫按鈕連結";
  if (t.startsWith("/")) return null;
  if (t.startsWith("https://") || t.startsWith("http://")) return null;
  return "請以 / 開頭（站內連結）或以 http(s):// 開頭";
}

function validateImageUrl(u: string): string | null {
  const t = u.trim();
  if (!t) return "請填寫圖片網址";
  if (t.startsWith("https://") || t.startsWith("http://")) return null;
  if (t.startsWith("/")) return null;
  return "請填寫 http(s):// 或 / 開頭的網址";
}

function validateOptionalEmail(u: string): string | null {
  const t = u.trim();
  if (!t) return null;
  if (t.length > 120) return "信箱過長（最多 120 字）";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(t)) return "請填寫有效的電子郵件格式";
  return null;
}

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

export async function updateFeaturedIntroAction(
  _prev: FeaturedIntroFormState | undefined,
  formData: FormData,
): Promise<FeaturedIntroFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const browseAllLabel = String(formData.get("browseAllLabel") ?? "").trim();
  const browseAllHrefRaw = String(formData.get("browseAllHref") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "請填寫標題";
  if (!subtitle) fieldErrors.subtitle = "請填寫副標說明";
  if (!browseAllLabel) fieldErrors.browseAllLabel = "請填寫按鈕文字";
  const hrefErr = validateBrowseHref(browseAllHrefRaw);
  if (hrefErr) fieldErrors.browseAllHref = hrefErr;

  if (Object.keys(fieldErrors).length > 0)
    return { ok: false, error: "請修正表單欄位", fieldErrors };

  const content: FeaturedIntroContent = {
    title,
    subtitle,
    browseAllLabel,
    browseAllHref: browseAllHrefRaw.trim(),
  };

  const { error } = await supabase.from("home_page_sections").upsert(
    {
      section_key: "featured_intro",
      content,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "section_key" },
  );

  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings/home-featured");

  return { ok: true, content };
}

export async function updateHeroAction(
  _prev: HeroFormState | undefined,
  formData: FormData,
): Promise<HeroFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const eyebrow = String(formData.get("eyebrow") ?? "").trim();
  const badgeLabel = String(formData.get("badgeLabel") ?? "").trim();
  const badgeText = String(formData.get("badgeText") ?? "").trim();
  const titleLine1 = String(formData.get("titleLine1") ?? "").trim();
  const titleLine2Accent = String(formData.get("titleLine2Accent") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const primaryLabel = String(formData.get("primaryCtaLabel") ?? "").trim();
  const primaryHrefRaw = String(formData.get("primaryCtaHref") ?? "");
  const secondaryLabel = String(formData.get("secondaryCtaLabel") ?? "").trim();
  const secondaryHrefRaw = String(formData.get("secondaryCtaHref") ?? "");

  const img1Url = String(formData.get("image1Url") ?? "");
  const img2Url = String(formData.get("image2Url") ?? "");
  const img3Url = String(formData.get("image3Url") ?? "");

  const fieldErrors: Record<string, string> = {};
  if (!eyebrow) fieldErrors.eyebrow = "請填寫眉標";
  if (!badgeLabel) fieldErrors.badgeLabel = "請填寫 badge 標籤";
  if (!badgeText) fieldErrors.badgeText = "請填寫 badge 文字";
  if (!titleLine1) fieldErrors.titleLine1 = "請填寫主標第一行";
  if (!titleLine2Accent) fieldErrors.titleLine2Accent = "請填寫主標強調行";
  if (!description) fieldErrors.description = "請填寫描述";
  if (!primaryLabel) fieldErrors.primaryCtaLabel = "請填寫主要按鈕文字";
  const pHrefErr = validateBrowseHref(primaryHrefRaw);
  if (pHrefErr) fieldErrors.primaryCtaHref = pHrefErr;
  if (!secondaryLabel) fieldErrors.secondaryCtaLabel = "請填寫次要按鈕文字";
  const sHrefErr = validateBrowseHref(secondaryHrefRaw);
  if (sHrefErr) fieldErrors.secondaryCtaHref = sHrefErr;

  const i1 = validateImageUrl(img1Url);
  const i2 = validateImageUrl(img2Url);
  const i3 = validateImageUrl(img3Url);
  if (i1) fieldErrors.image1Url = i1;
  if (i2) fieldErrors.image2Url = i2;
  if (i3) fieldErrors.image3Url = i3;

  if (Object.keys(fieldErrors).length > 0) return { ok: false, error: "請修正表單欄位", fieldErrors };

  const content: HeroSectionContent = {
    eyebrow,
    badgeLabel,
    badgeText,
    titleLine1,
    titleLine2Accent,
    description,
    primaryCta: { label: primaryLabel, href: primaryHrefRaw.trim() },
    secondaryCta: { label: secondaryLabel, href: secondaryHrefRaw.trim() },
    images: [
      { url: img1Url.trim(), alt: "" },
      { url: img2Url.trim(), alt: "" },
      { url: img3Url.trim(), alt: "" },
    ],
  };

  const { error } = await supabase.from("home_page_sections").upsert(
    { section_key: "hero", content, updated_at: new Date().toISOString() },
    { onConflict: "section_key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings/home-hero");
  return { ok: true, content };
}

export async function updateGalleryAction(
  _prev: GalleryFormState | undefined,
  formData: FormData,
): Promise<GalleryFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const enabled = formData.get("enabled") === "on";
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "請填寫標題";
  if (!subtitle) fieldErrors.subtitle = "請填寫副標";

  const items: ProductGallerySectionContent["items"] = [];
  let nextOrder = 0;
  for (let i = 0; i < 6; i += 1) {
    const imageUrl = String(formData.get(`item${i}ImageUrl`) ?? "").trim();
    const sortOrderRaw = String(formData.get(`item${i}SortOrder`) ?? "");
    const sortOrder = Number(sortOrderRaw);
    if (imageUrl) {
      const urlErr = validateImageUrl(imageUrl);
      if (urlErr) fieldErrors[`item${i}ImageUrl`] = urlErr;
    }
    if (!Number.isFinite(sortOrder)) fieldErrors[`item${i}SortOrder`] = "排序需為數字";
    if (imageUrl) {
      items.push({ imageUrl, alt: "", sortOrder: nextOrder });
      nextOrder += 1;
    }
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, error: "請修正表單欄位", fieldErrors };

  const content: ProductGallerySectionContent = {
    enabled,
    title,
    subtitle,
    items,
  };

  const { error } = await supabase.from("home_page_sections").upsert(
    { section_key: "product_gallery", content, updated_at: new Date().toISOString() },
    { onConflict: "section_key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings/home-gallery");
  return { ok: true, content };
}

export async function updatePhilosophyAction(
  _prev: PhilosophyFormState | undefined,
  formData: FormData,
): Promise<PhilosophyFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const enabled = formData.get("enabled") === "on";
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "請填寫標題";
  if (!subtitle) fieldErrors.subtitle = "請填寫副標";

  const itemCount = Math.max(0, Math.min(20, Number(String(formData.get("item_count") ?? "0"))));
  if (itemCount < 1) return { ok: false, error: "請至少保留 1 張理念卡片" };
  const items: BrandPhilosophySectionContent["items"] = [];
  for (let i = 0; i < itemCount; i += 1) {
    const iconKey = String(formData.get(`item${i}IconKey`) ?? "").trim();
    const bgVariant = String(formData.get(`item${i}BgVariant`) ?? "").trim();
    const itTitle = String(formData.get(`item${i}Title`) ?? "").trim();
    const itDesc = String(formData.get(`item${i}Description`) ?? "").trim();
    if (!(PHILOSOPHY_ICON_KEYS as readonly string[]).includes(iconKey))
      fieldErrors[`item${i}IconKey`] = "請選擇 icon";
    if (!(SECTION_CARD_BG_VARIANTS as readonly string[]).includes(bgVariant))
      fieldErrors[`item${i}BgVariant`] = "請選擇底色";
    if (!itTitle) fieldErrors[`item${i}Title`] = "請填寫標題";
    if (!itDesc) fieldErrors[`item${i}Description`] = "請填寫描述";
    items.push({
      iconKey: (iconKey as any) || "wheat",
      bgVariant: (bgVariant as any) || "cream",
      title: itTitle,
      description: itDesc,
    });
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, error: "請修正表單欄位", fieldErrors };

  const content: BrandPhilosophySectionContent = { enabled, title, subtitle, items: items as any };
  const { error } = await supabase.from("home_page_sections").upsert(
    { section_key: "brand_philosophy", content, updated_at: new Date().toISOString() },
    { onConflict: "section_key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings/home-philosophy");
  return { ok: true, content };
}

export async function updateRulesAction(
  _prev: RulesFormState | undefined,
  formData: FormData,
): Promise<RulesFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const enabled = formData.get("enabled") === "on";
  const title = String(formData.get("title") ?? "").trim();
  const subtitle = String(formData.get("subtitle") ?? "").trim();
  const fieldErrors: Record<string, string> = {};
  if (!title) fieldErrors.title = "請填寫標題";
  if (!subtitle) fieldErrors.subtitle = "請填寫副標";

  const itemCount = Math.max(0, Math.min(20, Number(String(formData.get("item_count") ?? "0"))));
  if (itemCount < 1) return { ok: false, error: "請至少保留 1 條購物說明" };
  const items: ShoppingRulesSectionContent["items"] = [];
  for (let i = 0; i < itemCount; i += 1) {
    const iconKey = String(formData.get(`item${i}IconKey`) ?? "").trim();
    const bgVariant = String(formData.get(`item${i}BgVariant`) ?? "").trim();
    const itTitle = String(formData.get(`item${i}Title`) ?? "").trim();
    const itDesc = String(formData.get(`item${i}Description`) ?? "").trim();
    if (!(SHOPPING_RULE_ICON_KEYS as readonly string[]).includes(iconKey))
      fieldErrors[`item${i}IconKey`] = "請選擇 icon";
    if (!(SECTION_CARD_BG_VARIANTS as readonly string[]).includes(bgVariant))
      fieldErrors[`item${i}BgVariant`] = "請選擇底色";
    if (!itTitle) fieldErrors[`item${i}Title`] = "請填寫標題";
    if (!itDesc) fieldErrors[`item${i}Description`] = "請填寫描述";
    items.push({
      iconKey: (iconKey as any) || "truck",
      bgVariant: (bgVariant as any) || "cream",
      title: itTitle,
      description: itDesc,
    });
  }

  if (Object.keys(fieldErrors).length > 0) return { ok: false, error: "請修正表單欄位", fieldErrors };

  const content: ShoppingRulesSectionContent = { enabled, title, subtitle, items: items as any };
  const { error } = await supabase.from("home_page_sections").upsert(
    { section_key: "shopping_rules", content, updated_at: new Date().toISOString() },
    { onConflict: "section_key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings/home-rules");
  return { ok: true, content };
}

export async function updateSiteSettingsAction(
  _prev: SiteSettingsFormState | undefined,
  formData: FormData,
): Promise<SiteSettingsFormState> {
  const { supabase, error: authError } = await getAdminSupabase();
  if (!supabase || authError) return { ok: false, error: authError ?? "未授權" };

  const siteTitle = String(formData.get("siteTitle") ?? "").trim();
  const siteDescription = String(formData.get("siteDescription") ?? "").trim();
  const siteLogoUrl = String(formData.get("siteLogoUrl") ?? "").trim();
  const footerLogoUrl = String(formData.get("footerLogoUrl") ?? "").trim();
  const footerTagline = String(formData.get("footerTagline") ?? "").trim();
  const footerContactAddress = String(formData.get("footerContactAddress") ?? "").trim();
  const footerContactPhone = String(formData.get("footerContactPhone") ?? "").trim();
  const footerContactEmail = String(formData.get("footerContactEmail") ?? "").trim();

  const fieldErrors: Record<string, string> = {};
  if (!siteTitle) fieldErrors.siteTitle = "請填寫網站標題";
  if (siteTitle.length > 80) fieldErrors.siteTitle = "網站標題過長（最多 80 字）";
  if (siteDescription.length > 200) fieldErrors.siteDescription = "網站描述過長（最多 200 字）";
  if (footerTagline.length > 400) fieldErrors.footerTagline = "Footer 說明過長（最多 400 字）";
  if (footerContactAddress.length > 300) fieldErrors.footerContactAddress = "地址過長（最多 300 字）";
  if (footerContactPhone.length > 40) fieldErrors.footerContactPhone = "電話過長（最多 40 字）";
  const emailErr = validateOptionalEmail(footerContactEmail);
  if (emailErr) fieldErrors.footerContactEmail = emailErr;
  if (siteLogoUrl) {
    const logoErr = validateImageUrl(siteLogoUrl);
    if (logoErr) fieldErrors.siteLogoUrl = logoErr;
  }
  if (footerLogoUrl) {
    const footerLogoErr = validateImageUrl(footerLogoUrl);
    if (footerLogoErr) fieldErrors.footerLogoUrl = footerLogoErr;
  }
  if (Object.keys(fieldErrors).length > 0) return { ok: false, error: "請修正表單欄位", fieldErrors };

  const content = {
    siteTitle,
    siteDescription,
    siteLogoUrl,
    footerLogoUrl,
    footerTagline,
    footerContactAddress,
    footerContactPhone,
    footerContactEmail,
  };
  const { error } = await supabase.from("home_page_sections").upsert(
    { section_key: "site_settings", content, updated_at: new Date().toISOString() },
    { onConflict: "section_key" },
  );
  if (error) return { ok: false, error: error.message };

  revalidatePath("/");
  revalidatePath("/admin/settings");
  return { ok: true, content };
}
