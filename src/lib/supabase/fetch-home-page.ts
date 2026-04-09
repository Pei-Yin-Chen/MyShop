import { createClient } from "@/lib/supabase/server";
import {
  defaultHomePageContent,
  PHILOSOPHY_ICON_KEYS,
  SECTION_CARD_BG_VARIANTS,
  SHOPPING_RULE_ICON_KEYS,
  type HomePageSectionContentMap,
  type HeroSectionContent,
  type FeaturedIntroContent,
  type ProductGallerySectionContent,
  type BrandPhilosophySectionContent,
  type ShoppingRulesSectionContent,
} from "@/data/home-page-defaults";

const ruleIconKeys = new Set<string>(SHOPPING_RULE_ICON_KEYS);
const ruleBgKeys = new Set<string>(SECTION_CARD_BG_VARIANTS);

function isRecord(x: unknown): x is Record<string, unknown> {
  return x != null && typeof x === "object" && !Array.isArray(x);
}

export function normalizeHero(raw: unknown): HeroSectionContent {
  const d = defaultHomePageContent.hero;
  if (!isRecord(raw)) return d;
  const imgs = raw.images;
  const images = Array.isArray(imgs)
    ? imgs
        .map((it) => {
          if (!isRecord(it)) return null;
          const url = it.url;
          const alt = it.alt;
          if (typeof url !== "string" || typeof alt !== "string") return null;
          return { url, alt };
        })
        .filter(Boolean) as { url: string; alt: string }[]
    : d.images;
  const primary = isRecord(raw.primaryCta) ? raw.primaryCta : {};
  const secondary = isRecord(raw.secondaryCta) ? raw.secondaryCta : {};
  return {
    eyebrow: typeof raw.eyebrow === "string" ? raw.eyebrow : d.eyebrow,
    badgeLabel: typeof raw.badgeLabel === "string" ? raw.badgeLabel : d.badgeLabel,
    badgeText: typeof raw.badgeText === "string" ? raw.badgeText : d.badgeText,
    titleLine1: typeof raw.titleLine1 === "string" ? raw.titleLine1 : d.titleLine1,
    titleLine2Accent:
      typeof raw.titleLine2Accent === "string" ? raw.titleLine2Accent : d.titleLine2Accent,
    description: typeof raw.description === "string" ? raw.description : d.description,
    primaryCta: {
      label: typeof primary.label === "string" ? primary.label : d.primaryCta.label,
      href: typeof primary.href === "string" ? primary.href : d.primaryCta.href,
    },
    secondaryCta: {
      label: typeof secondary.label === "string" ? secondary.label : d.secondaryCta.label,
      href: typeof secondary.href === "string" ? secondary.href : d.secondaryCta.href,
    },
    images: images.length >= 3 ? images.slice(0, 3) : d.images,
  };
}

export function normalizeFeaturedIntro(raw: unknown): FeaturedIntroContent {
  const d = defaultHomePageContent.featured_intro;
  if (!isRecord(raw)) return d;
  return {
    title: typeof raw.title === "string" ? raw.title : d.title,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : d.subtitle,
    browseAllLabel: typeof raw.browseAllLabel === "string" ? raw.browseAllLabel : d.browseAllLabel,
    browseAllHref: typeof raw.browseAllHref === "string" ? raw.browseAllHref : d.browseAllHref,
  };
}

export function normalizeGallery(raw: unknown): ProductGallerySectionContent {
  const d = defaultHomePageContent.product_gallery;
  if (!isRecord(raw)) return d;
  const itemsRaw = raw.items;
  if (!Array.isArray(itemsRaw)) return d;
  const items = itemsRaw
    .map((it) => {
      if (!isRecord(it)) return null;
      const imageUrl = it.imageUrl;
      const alt = it.alt;
      const sortOrder = it.sortOrder;
      if (typeof imageUrl !== "string" || typeof alt !== "string") return null;
      return {
        imageUrl,
        alt,
        sortOrder: typeof sortOrder === "number" && Number.isFinite(sortOrder) ? sortOrder : 0,
      };
    })
    .filter(Boolean) as ProductGallerySectionContent["items"];
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : d.enabled,
    title: typeof raw.title === "string" ? raw.title : d.title,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : d.subtitle,
    items: items.length > 0 ? [...items].sort((a, b) => a.sortOrder - b.sortOrder) : d.items,
  };
}

const philosophyIconKeys = new Set<string>(PHILOSOPHY_ICON_KEYS);
const philosophyBgKeys = new Set(["cream", "peach", "rose", "sage"]);

export function normalizePhilosophy(raw: unknown): BrandPhilosophySectionContent {
  const d = defaultHomePageContent.brand_philosophy;
  if (!isRecord(raw)) return d;
  const itemsRaw = raw.items;
  if (!Array.isArray(itemsRaw)) return d;
  const items = itemsRaw
    .map((it) => {
      if (!isRecord(it)) return null;
      const iconKey = it.iconKey;
      const bgVariant = it.bgVariant;
      if (typeof iconKey !== "string" || !philosophyIconKeys.has(iconKey)) return null;
      if (typeof bgVariant !== "string" || !philosophyBgKeys.has(bgVariant)) return null;
      const title = it.title;
      const description = it.description;
      if (typeof title !== "string" || typeof description !== "string") return null;
      return {
        iconKey: iconKey as BrandPhilosophySectionContent["items"][number]["iconKey"],
        title,
        description,
        bgVariant: bgVariant as BrandPhilosophySectionContent["items"][number]["bgVariant"],
      };
    })
    .filter(Boolean) as BrandPhilosophySectionContent["items"];
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : d.enabled,
    title: typeof raw.title === "string" ? raw.title : d.title,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : d.subtitle,
    items: items.length > 0 ? items : d.items,
  };
}

export function normalizeRules(raw: unknown): ShoppingRulesSectionContent {
  const d = defaultHomePageContent.shopping_rules;
  if (!isRecord(raw)) return d;
  const itemsRaw = raw.items;
  if (!Array.isArray(itemsRaw)) return d;
  const items = itemsRaw
    .map((it) => {
      if (!isRecord(it)) return null;
      const iconKey = it.iconKey;
      if (typeof iconKey !== "string" || !ruleIconKeys.has(iconKey)) return null;
      const title = it.title;
      const description = it.description;
      if (typeof title !== "string" || typeof description !== "string") return null;
      const bgRaw = it.bgVariant;
      const bgVariant =
        typeof bgRaw === "string" && ruleBgKeys.has(bgRaw)
          ? (bgRaw as ShoppingRulesSectionContent["items"][number]["bgVariant"])
          : "cream";
      return {
        iconKey: iconKey as ShoppingRulesSectionContent["items"][number]["iconKey"],
        title,
        description,
        bgVariant,
      };
    })
    .filter(Boolean) as ShoppingRulesSectionContent["items"];
  return {
    enabled: typeof raw.enabled === "boolean" ? raw.enabled : d.enabled,
    title: typeof raw.title === "string" ? raw.title : d.title,
    subtitle: typeof raw.subtitle === "string" ? raw.subtitle : d.subtitle,
    items: items.length > 0 ? items : d.items,
  };
}

export async function fetchHomePageContent(): Promise<HomePageSectionContentMap> {
  const supabase = await createClient();
  const { data, error } = await supabase.from("home_page_sections").select("section_key, content");

  if (error) {
    console.error("[fetchHomePageContent]", error.message);
    return defaultHomePageContent;
  }

  const byKey = new Map<string, unknown>();
  for (const row of data ?? []) {
    const k = row.section_key as string;
    byKey.set(k, row.content);
  }

  return {
    hero: normalizeHero(byKey.get("hero")),
    featured_intro: normalizeFeaturedIntro(byKey.get("featured_intro")),
    product_gallery: normalizeGallery(byKey.get("product_gallery")),
    brand_philosophy: normalizePhilosophy(byKey.get("brand_philosophy")),
    shopping_rules: normalizeRules(byKey.get("shopping_rules")),
  };
}
