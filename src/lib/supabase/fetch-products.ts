import type { Product } from "@/data/products";
import { createClient } from "@/lib/supabase/server";

/** 無圖片時避免 next/image 空 src */
const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800";

interface ProductImageRow {
  image_url: string;
  sort_order: number;
}

interface ProductRow {
  id: string;
  name: string;
  subtitle: string | null;
  price: number;
  category: string;
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
  if (s === "draft" || s === "active" || s === "archived") return s;
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
    category: row.category,
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

const productSelect = `
  id,
  name,
  subtitle,
  price,
  category,
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

export async function fetchProductsForCatalog(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchProductsForCatalog]", error.message);
    return [];
  }

  return (data as ProductRow[] | null)?.map(mapProductRow) ?? [];
}

export async function fetchProductById(id: string): Promise<Product | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("id", id)
    .eq("status", "active")
    .maybeSingle();

  if (error) {
    console.error("[fetchProductById]", error.message);
    return null;
  }
  if (!data) return null;
  return mapProductRow(data as ProductRow);
}

export async function fetchFeaturedProducts(): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("is_featured", true)
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchFeaturedProducts]", error.message);
    return [];
  }

  return (data as ProductRow[] | null)?.map(mapProductRow) ?? [];
}

export async function fetchRelatedProducts(
  category: string,
  excludeId: string,
  limit = 4,
): Promise<Product[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select(productSelect)
    .eq("category", category)
    .eq("status", "active")
    .neq("id", excludeId)
    .order("display_order", { ascending: true })
    .limit(limit);

  if (error) {
    console.error("[fetchRelatedProducts]", error.message);
    return [];
  }

  return (data as ProductRow[] | null)?.map(mapProductRow) ?? [];
}

export async function fetchAllProductIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("products")
    .select("id")
    .eq("status", "active")
    .order("display_order", { ascending: true });

  if (error) {
    console.error("[fetchAllProductIds]", error.message);
    return [];
  }

  return (data ?? []).map((r) => r.id as string);
}
