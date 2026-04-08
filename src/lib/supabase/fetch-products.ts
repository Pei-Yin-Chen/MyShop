import type { Product } from "@/data/products";
import { createPublicSupabaseClient } from "@/lib/supabase/public-server";
import type { SupabaseClient } from "@supabase/supabase-js";

/** 無圖片時避免 next/image 空 src */
const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800";

interface ProductImageRow {
  image_url: string;
  sort_order: number;
}

export interface ProductRow {
  id: string;
  name: string;
  subtitle: string | null;
  price: number;
  category_id: string;
  /** 由 attachCategoryNames 注入 */
  category_name?: string;
  description: string;
  full_description: string | null;
  details: unknown;
  rating: number | string;
  review_count: number;
  is_featured: boolean | null;
  display_order: number;
  stock_quantity: number | null;
  status: string | null;
  image_url: string | null;
  product_images: ProductImageRow[] | null;
}

function parseDetails(raw: unknown): { label: string; value: string }[] {
  if (!Array.isArray(raw)) return [];
  return raw.filter(
    (x): x is { label: string; value: string } =>
      x != null &&
      typeof x === "object" &&
      "label" in x &&
      "value" in x &&
      typeof (x as { label: unknown }).label === "string" &&
      typeof (x as { value: unknown }).value === "string",
  );
}

function parseProductStatus(s: string | null): Product["status"] {
  if (s === "draft" || s === "active" || s === "archived" || s === "sold_out")
    return s;
  return undefined;
}

export function mapProductRow(row: ProductRow): Product {
  const imgs = [...(row.product_images ?? [])].sort((a, b) => a.sort_order - b.sort_order);
  const fromChildren = imgs.map((i) => i.image_url).filter(Boolean);
  const urls =
    fromChildren.length > 0
      ? fromChildren
      : row.image_url
        ? [row.image_url]
        : [];
  const image = urls[0] ?? IMAGE_PLACEHOLDER;
  const gallery = urls.length > 0 ? urls : undefined;

  return {
    id: row.id,
    name: row.name,
    subtitle: row.subtitle ?? undefined,
    price: row.price,
    category: row.category_name ?? "",
    description: row.description,
    fullDescription: row.full_description ?? undefined,
    details: parseDetails(row.details),
    rating: Number(row.rating),
    reviewCount: row.review_count,
    isFeatured: row.is_featured ?? false,
    image,
    gallery,
    stockQuantity: row.stock_quantity ?? undefined,
    status: parseProductStatus(row.status),
  };
}

/** 與 mapProductRow 對應的 select（分類名稱另查 product_categories，避免依賴 PostgREST 嵌套關聯快取） */
export const PRODUCT_LIST_SELECT = `
  id,
  name,
  subtitle,
  price,
  category_id,
  description,
  full_description,
  details,
  rating,
  review_count,
  is_featured,
  display_order,
  stock_quantity,
  status,
  image_url,
  product_images (
    image_url,
    sort_order
  )
`;

async function attachCategoryNames(
  supabase: SupabaseClient,
  rows: ProductRow[] | null,
): Promise<ProductRow[]> {
  const list = rows ?? [];
  const ids = [...new Set(list.map((r) => r.category_id).filter(Boolean))];
  if (ids.length === 0) return list.map((r) => ({ ...r, category_name: "" }));

  const { data: cats, error } = await supabase
    .from("product_categories")
    .select("id, name")
    .in("id", ids);

  if (error) {
    console.error("[attachCategoryNames]", error.message);
    return list.map((r) => ({ ...r, category_name: "" }));
  }

  const map = new Map((cats ?? []).map((c) => [c.id as string, c.name as string]));
  return list.map((r) => ({
    ...r,
    category_name: map.get(r.category_id) ?? "",
  }));
}

export async function fetchProductsForCatalog(): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .in("status", ["active", "sold_out"])
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchProductsForCatalog]", error.message);
    return [];
  }

  const withNames = await attachCategoryNames(supabase, data as ProductRow[] | null);
  return withNames.map((row) => mapProductRow(row));
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("id", id)
    .in("status", ["active", "sold_out"])
    .maybeSingle();

  if (error) {
    console.error("[fetchProductById]", error.message);
    return null;
  }
  if (!data) return null;
  const [withName] = await attachCategoryNames(supabase, [data as ProductRow]);
  return mapProductRow(withName);
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("is_featured", true)
    .in("status", ["active", "sold_out"])
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchFeaturedProducts]", error.message);
    return [];
  }

  const withNames = await attachCategoryNames(supabase, data as ProductRow[] | null);
  return withNames.map((row) => mapProductRow(row));
}

export async function fetchRelatedProducts(
  category: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const supabase = createPublicSupabaseClient();
  const { data: catRows } = await supabase
    .from("product_categories")
    .select("id")
    .eq("name", category)
    .maybeSingle()

  if (!catRows?.id) {
    return []
  }

  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_LIST_SELECT)
    .eq("category_id", catRows.id)
    .in("status", ["active", "sold_out"])
    .neq("id", excludeId)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[fetchRelatedProducts]", error.message);
    return [];
  }

  const withNames = await attachCategoryNames(supabase, data as ProductRow[] | null);
  return withNames.map((row) => mapProductRow(row));
}

export async function fetchAllProductIds(): Promise<string[]> {
  const supabase = createPublicSupabaseClient();
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .in("status", ["active", "sold_out"])
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchAllProductIds]", error.message);
    return [];
  }

  return (data ?? []).map((r) => r.id as string);
}
