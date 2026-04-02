/** 前台／購物車共用的商品形狀（資料來源：Supabase `products` + `product_images`） */
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
  /** 庫存（來自 DB `stock_quantity`） */
  stockQuantity?: number;
  /** 上架狀態（來自 DB `status`） */
  status?: "draft" | "active" | "archived";
}
