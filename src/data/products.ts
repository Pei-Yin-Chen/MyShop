import { shopImages } from "@/data/remote-images";

export interface Product {
  id: string;
  name: string;
  subtitle?: string;
  price: number;
  category: string;
  image: string;
  gallery?: string[];
  description: string;
  fullDescription?: string;
  details?: { label: string; value: string }[];
  /** 1–5，可一位小數 */
  rating: number;
  /** 評價則數（展示用） */
  reviewCount: number;
  isFeatured?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "草莓奶油小杯蛋糕",
    subtitle: "每日限量 · 季節限定",
    price: 180,
    category: "蛋糕",
    image: shopImages.seasonSundae,
    gallery: [shopImages.seasonSundae, shopImages.fruitTart, shopImages.macarons],
    description: "小杯盛裝的鬆軟蛋糕體，上層擠上草莓風味奶油，再點綴一顆鮮草莓。",
    fullDescription: "這款小杯蛋糕是我們季節限定的明星產品。我們選用大湖當季草莓，製作成酸甜適中的草莓奶油，搭配口感輕盈的戚風蛋糕體。小巧的杯裝設計，不僅方便食用，更能鎖住蛋糕的濕潤度，是下午茶的最佳選擇。",
    details: [
      { label: "主要原料", value: "日本麵粉、法國奶油、當季草莓、農場雞蛋" },
      { label: "保存方式", value: "冷藏保存 2 日" },
      { label: "過敏原", value: "本產品含麩質、蛋、奶製品" },
    ],
    rating: 4.7,
    reviewCount: 86,
    isFeatured: true,
  },
  {
    id: "2",
    name: "酸種鄉村麵包",
    subtitle: "天然發酵 · 歐式經典",
    price: 220,
    category: "麵包",
    image: shopImages.bread,
    gallery: [shopImages.bread, shopImages.breadLoaves, shopImages.userBakery800],
    description: "長時間發酵，外脆內軟，麥香溫潤。",
    fullDescription: "遵循傳統法式工法，使用自家培養的天然酵母，經過 24 小時低溫長時發酵。外皮呈現迷人的焦糖色澤與酥脆口感，內部則保有豐富的氣孔與濕潤彈性，帶有淡淡的天然微酸與濃郁麥香。",
    details: [
      { label: "主要原料", value: "石磨全麥粉、天然酵母、海鹽、過濾水" },
      { label: "保存方式", value: "常溫 2 日，冷凍可保存 2 週" },
      { label: "食用建議", value: "回烤後口感更佳，適合搭配奶油或濃湯" },
    ],
    rating: 4.8,
    reviewCount: 214,
    isFeatured: true,
  },
  {
    id: "3",
    name: "法式可頌（單入）",
    subtitle: "純手工疊層 · 奶油香氣",
    price: 95,
    category: "麵包",
    image: shopImages.croissant,
    gallery: [shopImages.croissant, shopImages.userBakery900, shopImages.breadLoaves],
    description: "奶油層次分明，烘烤至金黃酥脆。",
    fullDescription: "經典的法式工藝展現。我們使用法國 AOP 認證奶油，透過反覆的摺疊與低溫發酵，打造出 16 層完美的蜂巢狀層次。每一口都能感受到外層的極致酥脆與內裡的柔軟香醇。",
    details: [
      { label: "主要原料", value: "法國 AOP 奶油、日本麵粉、鮮乳" },
      { label: "保存方式", value: "常溫 1 日，建議當日食用" },
      { label: "規格", value: "約 65g ± 5g" },
    ],
    rating: 4.6,
    reviewCount: 402,
    isFeatured: true,
  },
  {
    id: "4",
    name: "綜合馬卡龍禮盒（8 入）",
    subtitle: "法式浪漫 · 繽紛午茶",
    price: 520,
    category: "蛋糕",
    image: shopImages.macarons,
    gallery: [shopImages.macarons, shopImages.seasonSundae, shopImages.fruitTart],
    description: "低甜度內餡，色彩柔和，送禮體面。",
    fullDescription: "精選四款經典口味：鹽之花焦糖、宇治抹茶、覆盆子荔枝、馬達加斯加香草。我們特別調整了減糖配方，讓馬卡龍保有外酥內 Q 的迷人觸感，卻不會過於甜膩，完美呈現食材原味。",
    details: [
      { label: "口味", value: "焦糖、抹茶、覆盆子、香草（各 2 入）" },
      { label: "保存方式", value: "冷藏 5 日，冷凍 10 日" },
      { label: "包裝", value: "附品牌精緻禮盒與提袋" },
    ],
    rating: 4.9,
    reviewCount: 63,
    isFeatured: false,
  },
  {
    id: "5",
    name: "肉桂捲（焦糖乳酪淋醬）",
    subtitle: "溫暖香氣 · 濃郁淋醬",
    price: 120,
    category: "麵包",
    image: shopImages.cinnamonRoll,
    gallery: [shopImages.cinnamonRoll, shopImages.bread, shopImages.userBakery800],
    description: "溫暖肉桂香氣，淋上自製乳酪糖霜。",
    fullDescription: "選用頂級錫蘭肉桂粉，香氣溫和不辛辣。麵團加入大量鮮乳與雞蛋，口感介於麵包與蛋糕之間。出爐後淋上厚厚的自製焦糖乳酪淋醬，鹹甜交織的滋味讓人欲罷不能。",
    details: [
      { label: "主要原料", value: "錫蘭肉桂、奶油乳酪、黑糖、核桃" },
      { label: "保存方式", value: "常溫 1 日，冷藏 3 日" },
      { label: "加熱建議", value: "微波 20 秒或烤箱 150度回烤 3 分鐘" },
    ],
    rating: 4.5,
    reviewCount: 178,
    isFeatured: false,
  },
  {
    id: "6",
    name: "季節水果塔（單片）",
    subtitle: "新鮮採收 · 酥脆塔皮",
    price: 180,
    category: "蛋糕",
    image: shopImages.fruitTart,
    gallery: [shopImages.fruitTart, shopImages.seasonSundae, shopImages.macarons],
    description: "酥脆塔皮與卡士達，鋪上當日新鮮水果。",
    fullDescription: "手工捏製的甜酥塔皮，填入香草籽熬煮的濃郁卡士達醬。上方鋪滿主廚當日在市場挑選的最優質水果，每一口都是季節的滋味。水果種類隨季節更換，帶給你不同的驚喜。",
    details: [
      { label: "主要原料", value: "當季水果、大溪地香草籽、手工塔皮" },
      { label: "保存方式", value: "冷藏保存 1 日" },
      { label: "規格", value: "3.5 吋塔皮切片" },
    ],
    rating: 4.7,
    reviewCount: 95,
    isFeatured: false,
  },
  {
    id: "7",
    name: "草莓果粒牛奶麵包（單入）",
    subtitle: "柔軟質地 · 酸甜驚喜",
    price: 160,
    category: "麵包",
    image: shopImages.userCake800,
    gallery: [shopImages.userCake800, shopImages.breadLoaves, shopImages.userBakery900],
    description: "柔軟麵包裡藏著酸甜的草莓果粒，每一口都咬得到果香。",
    fullDescription: "專為草莓愛好者設計。麵團中加入大量鮮乳與草莓果泥，揉入低溫烘乾的草莓果粒，保留了果肉的口感與濃縮香氣。外層撒上薄薄的糖粉，像是冬日的初雪般迷人。",
    details: [
      { label: "主要原料", value: "草莓乾、鮮乳、日本麵粉、煉乳" },
      { label: "保存方式", value: "常溫 2 日" },
      { label: "特色", value: "不添加人工香料與色素" },
    ],
    rating: 4.4,
    reviewCount: 52,
    isFeatured: true,
  },
  {
    id: "8",
    name: "手作布里歐吐司（半條）",
    subtitle: "雲朵口感 · 蛋奶豐沛",
    price: 190,
    category: "麵包",
    image: shopImages.userBakery800,
    gallery: [shopImages.userBakery800, shopImages.breadLoaves, shopImages.userBakery900],
    description: "蛋奶香氣飽滿，撕開如雲朵般柔軟。",
    fullDescription: "布里歐（Brioche）是法國最富盛名的麵包之一。我們的配方含有超過 25% 的優質奶油與大量農場雞蛋，完全不加一滴水。長時間低溫發酵讓風味更顯層次，口感細緻如絲綢，直接撕著吃就是最高享受。",
    details: [
      { label: "主要原料", value: "發酵奶油、農場雞蛋、日本麵粉" },
      { label: "保存方式", value: "常溫 2 日，冷凍 1 週" },
      { label: "規格", value: "約 250g (半條)" },
    ],
    rating: 4.6,
    reviewCount: 131,
    isFeatured: false,
  },
];
