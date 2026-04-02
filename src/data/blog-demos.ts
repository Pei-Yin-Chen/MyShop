export type DemoBlogPost = {
  slug: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  paragraphs: string[];
};

export const DEMO_BLOG_POSTS: DemoBlogPost[] = [
  {
    slug: "spring-strawberry-tart",
    title: "春季草莓塔：選果與卡士達的平衡",
    publishedAt: "2026-03-18",
    excerpt: "示範文章：從草莓酸度調整到香草卡士達的甜度，如何讓每一口都清爽不膩。",
    paragraphs: [
      "春天是草莓的季節，也是我們店裡草莓塔最受歡迎的時候。這篇示範文章說明我們如何挑選果實、控制水分，以及與卡士達的搭配思路。",
      "實際營運時，食譜與流程會依原料批次微調；上架內容僅供參考，不代表最終產品規格。若您有過敏或飲食限制，結帳前請務必確認商品說明或洽客服。",
      "感謝您閱讀烘焙誌，未來我們會在這裡分享更多季節甜點背後的小故事。",
    ],
  },
  {
    slug: "sourdough-starter-101",
    title: "酸種麵包入門：養種的溫度與時間（示範）",
    publishedAt: "2026-02-22",
    excerpt: "示範文章：用簡單步驟理解酵母活動，適合想在家嘗試的烘焙同好。",
    paragraphs: [
      "酸種（sourdough starter）的魅力在於風味層次與天然發酵。這裡以示意流程介紹餵養比例、環境溫度對發酵速度的影響，以及何時該換瓶、冷藏休息。",
      "本文為示範教學內容，不構成專業食品衛生建議。門市販售之麵包仍以當日製作標示與包裝說明為準。",
    ],
  },
  {
    slug: "gift-box-packaging",
    title: "禮盒包裝小細節：從防震到開箱體驗",
    publishedAt: "2026-01-08",
    excerpt: "示範文章：說明我們在禮盒緩衝、保冷與視覺呈現上的基本原則。",
    paragraphs: [
      "送禮時，甜點不只要好吃，也要安全抵達。這篇示範文章整理我們在禮盒設計上常見的考量：防震材、季節性保冷建議，以及易開箱的紙材選擇。",
      "實際包裝會依品項、運送方式與法規要求調整；圖文為示意，請以訂單確認信或客服說明為準。",
    ],
  },
];

export function getDemoPostBySlug(slug: string): DemoBlogPost | undefined {
  return DEMO_BLOG_POSTS.find((p) => p.slug === slug);
}
