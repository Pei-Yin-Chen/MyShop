import {
  heroBreadFeatured,
  heroCakeFeatured,
  heroCroissantFeatured,
} from "@/data/remote-images";
import { shopImages } from "@/data/remote-images";

/** 首頁區塊 `section_key` 與 DB `home_page_sections.section_key` 對應：hero、featured_intro、product_gallery、brand_philosophy、shopping_rules */

export interface HeroSectionContent {
  eyebrow: string;
  badgeLabel: string;
  badgeText: string;
  titleLine1: string;
  titleLine2Accent: string;
  description: string;
  primaryCta: { label: string; href: string };
  secondaryCta: { label: string; href: string };
  /** 依序：主圖（左高）、右上、右下 */
  images: { url: string; alt: string }[];
}

export interface FeaturedIntroContent {
  title: string;
  subtitle: string;
  browseAllLabel: string;
  browseAllHref: string;
}

export interface ProductGallerySectionContent {
  enabled?: boolean;
  title: string;
  subtitle: string;
  items: { imageUrl: string; alt: string; sortOrder: number }[];
}

/** 首頁區塊卡片 icon 底色（品牌理念、購物說明共用） */
export const SECTION_CARD_BG_VARIANTS = ["cream", "peach", "rose", "sage"] as const;
export type SectionCardBgVariant = (typeof SECTION_CARD_BG_VARIANTS)[number];

/**
 * 首頁品牌理念 icon（Lucide）；含烘焙主題與通用商業／品牌意象，後台選單與驗證以此為準。
 */
export const PHILOSOPHY_ICON_KEYS = [
  "wheat",
  "chef_hat",
  "heart",
  "cookie",
  "sparkles",
  "shield",
  "users",
  "handshake",
  "leaf",
  "award",
  "star",
  "lightbulb",
] as const;

export type PhilosophyIconKey = (typeof PHILOSOPHY_ICON_KEYS)[number];

export interface BrandPhilosophySectionContent {
  enabled?: boolean;
  title: string;
  subtitle: string;
  items: {
    iconKey: PhilosophyIconKey;
    title: string;
    description: string;
    bgVariant: SectionCardBgVariant;
  }[];
}

/** 與 `ShoppingRules`、後台表單、normalizeRules 驗證一致 */
export const SHOPPING_RULE_ICON_KEYS = [
  "truck",
  "clock",
  "refrigerator",
  "credit_card",
  "map_pin",
  "phone",
  "message_circle",
  "store",
  "package",
  "shield_check",
  "gift",
  "info",
] as const;

export type ShoppingRuleIconKey = (typeof SHOPPING_RULE_ICON_KEYS)[number];

export interface ShoppingRulesSectionContent {
  enabled?: boolean;
  title: string;
  subtitle: string;
  items: {
    iconKey: ShoppingRuleIconKey;
    title: string;
    description: string;
    bgVariant: SectionCardBgVariant;
  }[];
}

export type HomePageSectionContentMap = {
  hero: HeroSectionContent;
  featured_intro: FeaturedIntroContent;
  product_gallery: ProductGallerySectionContent;
  brand_philosophy: BrandPhilosophySectionContent;
  shopping_rules: ShoppingRulesSectionContent;
};

export const defaultHomePageContent: HomePageSectionContentMap = {
  hero: {
    eyebrow: "Welcome to Our Store",
    badgeLabel: "最新上架",
    badgeText: "精選商品 · 限量供應",
    titleLine1: "用心挑選，",
    titleLine2Accent: "為你呈現最好的品質",
    description:
      "我們精心挑選每一件商品，堅持品質與服務，\n為你的生活增添一份美好。",
    primaryCta: { label: "瀏覽商品", href: "/products" },
    secondaryCta: { label: "了解更多", href: "/about" },
    images: [
      { url: heroCakeFeatured, alt: "範例圖片 1" },
      { url: heroBreadFeatured, alt: "範例圖片 2" },
      { url: heroCroissantFeatured, alt: "範例圖片 3" },
    ],
  },
  featured_intro: {
    title: "精選推薦",
    subtitle:
      "以下是我們目前主打的精選商品，數量有限，售完將以新品替補。",
    browseAllLabel: "瀏覽全部商品",
    browseAllHref: "/products",
  },
  product_gallery: {
    enabled: true,
    title: "精選圖集",
    subtitle: "用影像記錄我們的品牌故事，每一幕都值得細細品味。",
    items: [
      { imageUrl: shopImages.fruitTart, alt: "範例圖片 1", sortOrder: 0 },
      { imageUrl: shopImages.userBakery900, alt: "範例圖片 2", sortOrder: 1 },
      { imageUrl: shopImages.seasonSundae, alt: "範例圖片 3", sortOrder: 2 },
      { imageUrl: shopImages.breadLoaves, alt: "範例圖片 4", sortOrder: 3 },
      { imageUrl: shopImages.macarons, alt: "範例圖片 5", sortOrder: 4 },
      { imageUrl: shopImages.cinnamonRoll, alt: "範例圖片 6", sortOrder: 5 },
    ],
  },
  brand_philosophy: {
    enabled: true,
    title: "品牌理念",
    subtitle: "我們堅持品質與用心，讓每一個細節都能傳遞價值。",
    items: [
      {
        iconKey: "wheat",
        title: "嚴選品質",
        description: "每一件商品皆經過嚴格篩選，確保品質值得信賴。",
        bgVariant: "cream",
      },
      {
        iconKey: "chef_hat",
        title: "專業服務",
        description: "由專業團隊為您提供完善的購物體驗與售後支援。",
        bgVariant: "peach",
      },
      {
        iconKey: "heart",
        title: "用心經營",
        description: "我們重視每一位顧客的需求，用心打造最好的服務。",
        bgVariant: "rose",
      },
      {
        iconKey: "cookie",
        title: "持續創新",
        description: "不斷推出新品與優化服務，為您帶來更多驚喜。",
        bgVariant: "sage",
      },
    ],
  },
  shopping_rules: {
    enabled: true,
    title: "購物說明",
    subtitle: "以下為購物相關注意事項，請在結帳前稍加留意。",
    items: [
      {
        iconKey: "truck",
        title: "配送方式",
        description: "支援宅配到府與門市自取，依商品類型提供合適的配送選項。",
        bgVariant: "cream",
      },
      {
        iconKey: "clock",
        title: "訂單處理時間",
        description: "訂單成立後將於 1–3 個工作天內處理出貨，特殊商品請留意備註。",
        bgVariant: "peach",
      },
      {
        iconKey: "shield_check",
        title: "退換貨政策",
        description: "商品如有瑕疵可於收到後 7 日內申請退換貨，詳情請參閱退換貨說明。",
        bgVariant: "rose",
      },
      {
        iconKey: "credit_card",
        title: "付款方式",
        description: "支援信用卡、行動支付與轉帳等多元付款方式。",
        bgVariant: "sage",
      },
    ],
  },
};
