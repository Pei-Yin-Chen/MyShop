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
  title: string;
  subtitle: string;
  items: { imageUrl: string; alt: string; sortOrder: number }[];
}

export interface BrandPhilosophySectionContent {
  title: string;
  subtitle: string;
  items: {
    iconKey: "wheat" | "chef_hat" | "heart" | "cookie";
    title: string;
    description: string;
    bgVariant: "cream" | "peach" | "rose" | "sage";
  }[];
}

export interface ShoppingRulesSectionContent {
  title: string;
  subtitle: string;
  items: {
    iconKey: "truck" | "clock" | "refrigerator" | "credit_card";
    title: string;
    description: string;
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
    eyebrow: "Pâtisserie & Boulangerie",
    badgeLabel: "本日烘焙",
    badgeText: "上午出爐 · 限量供應",
    titleLine1: "以時間與溫度，",
    titleLine2Accent: "呈現每一口的柔軟",
    description:
      "蛋糕、麵包與季節甜點，堅持好原料與當日現做，\n為你的餐桌與聚會，留一點剛好的甜。",
    primaryCta: { label: "瀏覽品項", href: "/products" },
    secondaryCta: { label: "預訂整模蛋糕", href: "/products?category=蛋糕" },
    images: [
      { url: heroCakeFeatured, alt: "草莓果粒麵包與甜點桌面陳列" },
      { url: heroBreadFeatured, alt: "麵包與烘焙陳列" },
      { url: heroCroissantFeatured, alt: "可頌與酥皮" },
    ],
  },
  featured_intro: {
    title: "主廚推薦",
    subtitle: "當日爐邊精選，蛋糕與麵包皆以細緻工法完成，適合與重要的人分享。",
    browseAllLabel: "瀏覽所有品項",
    browseAllHref: "/products",
  },
  product_gallery: {
    title: "店內風景",
    subtitle: "麵粉、奶油與果香交織的空間，每一幕都是日常裡的小儀式。",
    items: [
      { imageUrl: shopImages.fruitTart, alt: "季節水果塔", sortOrder: 0 },
      { imageUrl: shopImages.userBakery900, alt: "烘焙店內風景", sortOrder: 1 },
      { imageUrl: shopImages.seasonSundae, alt: "草莓奶油小杯蛋糕", sortOrder: 2 },
      { imageUrl: shopImages.breadLoaves, alt: "新鮮麵包", sortOrder: 3 },
      { imageUrl: shopImages.macarons, alt: "甜點小點拼盤", sortOrder: 4 },
      { imageUrl: shopImages.cinnamonRoll, alt: "手作肉桂捲", sortOrder: 5 },
    ],
  },
  brand_philosophy: {
    title: "品牌理念",
    subtitle: "我們相信好的烘焙不必張揚，柔軟、香氣與餘韻，會在入口時自己說話。",
    items: [
      {
        iconKey: "wheat",
        title: "嚴選食材",
        description: "麵粉、奶油與雞蛋皆來自可信賴產區，減少添加，讓風味自然展開。",
        bgVariant: "cream",
      },
      {
        iconKey: "chef_hat",
        title: "手工製作",
        description: "從打麵、發酵到烘烤，由師傅依當日溫溼度微調，保留手作溫度。",
        bgVariant: "peach",
      },
      {
        iconKey: "heart",
        title: "分享時刻",
        description: "無論是早餐一片吐司或慶生蛋糕，我們希望成為你日子裡的柔軟陪伴。",
        bgVariant: "rose",
      },
      {
        iconKey: "cookie",
        title: "當日精神",
        description: "烘焙品以當日鮮度為優先，建議依保存建議享用，風味最佳。",
        bgVariant: "sage",
      },
    ],
  },
  shopping_rules: {
    title: "購物說明",
    subtitle: "為了讓您收到與店內相同品質的烘焙，以下說明請在結帳前稍加留意。",
    items: [
      {
        iconKey: "truck",
        title: "宅配與門市取貨",
        description: "指定區域可選宅配或到店取貨；蛋糕類建議預訂時段，確保完整交付。",
      },
      {
        iconKey: "clock",
        title: "預訂與出爐時間",
        description: "整模蛋糕請提前 2–3 日預訂；麵包以當日出爐時間為主，售完為止。",
      },
      {
        iconKey: "refrigerator",
        title: "保存建議",
        description: "含鮮奶油與水果之品項請冷藏並於建議期限內食用，風味較佳。",
      },
      {
        iconKey: "credit_card",
        title: "付款方式",
        description: "支援信用卡、LINE Pay 與門市現金；大宗訂單可另洽對公匯款。",
      },
    ],
  },
};
