import type { SectionCardBgVariant } from "@/data/home-page-defaults";

/** 首頁「品牌理念」「購物說明」等卡片 icon 區塊共用底色（與後台選項一致） */
export const SECTION_CARD_BG_CLASS: Record<SectionCardBgVariant, string> = {
  cream: "bg-[oklch(0.96_0.02_85)]",
  peach: "bg-[oklch(0.96_0.025_55)]",
  rose: "bg-[oklch(0.97_0.02_75)]",
  sage: "bg-[oklch(0.95_0.02_95)]",
};
