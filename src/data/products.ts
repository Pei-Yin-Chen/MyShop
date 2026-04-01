import { shopImages } from "@/data/remote-images";

export interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  image: string;
  description: string;
  isFeatured?: boolean;
}

export const products: Product[] = [
  {
    id: "1",
    name: "草莓奶油小杯蛋糕",
    price: 180,
    category: "蛋糕",
    image: shopImages.seasonSundae,
    description: "小杯盛裝的鬆軟蛋糕體，上層擠上草莓風味奶油，再點綴一顆鮮草莓。",
    isFeatured: true,
  },
  {
    id: "2",
    name: "酸種鄉村麵包",
    price: 220,
    category: "麵包",
    image: shopImages.bread,
    description: "長時間發酵，外脆內軟，麥香溫潤。",
    isFeatured: true,
  },
  {
    id: "3",
    name: "法式可頌（單入）",
    price: 95,
    category: "麵包",
    image: shopImages.croissant,
    description: "奶油層次分明，烘烤至金黃酥脆。",
    isFeatured: true,
  },
  {
    id: "4",
    name: "綜合馬卡龍禮盒（8 入）",
    price: 520,
    category: "甜點",
    image: shopImages.macarons,
    description: "低甜度內餡，色彩柔和，送禮體面。",
    isFeatured: false,
  },
  {
    id: "5",
    name: "肉桂捲（焦糖乳酪淋醬）",
    price: 120,
    category: "麵包",
    image: shopImages.cinnamonRoll,
    description: "溫暖肉桂香氣，淋上自製乳酪糖霜。",
    isFeatured: false,
  },
  {
    id: "6",
    name: "季節水果塔（單片）",
    price: 180,
    category: "蛋糕",
    image: shopImages.fruitTart,
    description: "酥脆塔皮與卡士達，鋪上當日新鮮水果。",
    isFeatured: false,
  },
  {
    id: "7",
    name: "草莓果粒牛奶麵包（單入）",
    price: 160,
    category: "麵包",
    image: shopImages.userCake800,
    description: "柔軟麵包裡藏著酸甜的草莓果粒，每一口都咬得到果香。",
    isFeatured: true,
  },
  {
    id: "8",
    name: "手作布里歐吐司（半條）",
    price: 190,
    category: "麵包",
    image: shopImages.userBakery800,
    description: "蛋奶香氣飽滿，撕開如雲朵般柔軟。",
    isFeatured: false,
  },
];
