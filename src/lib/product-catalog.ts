import type { Product } from "@/data/products";
import { products as allProducts } from "@/data/products";

export const PAGE_SIZE = 6;

export type SortOption =
  | "default"
  | "price-asc"
  | "price-desc"
  | "rating-desc"
  | "name-asc";

export interface CatalogQuery {
  category: string;
  sort: SortOption;
  page: number;
  featuredOnly: boolean;
  minPrice?: number;
  maxPrice?: number;
}

const CATEGORY_ORDER = ["蛋糕", "麵包", "甜點"] as const;

export function getCategoryNavItems(): string[] {
  const set = new Set(allProducts.map((p) => p.category));
  const ordered = CATEGORY_ORDER.filter((c) => set.has(c));
  const orderSet = new Set<string>(CATEGORY_ORDER);
  const rest = [...set].filter((c) => !orderSet.has(c));
  rest.sort((a, b) => a.localeCompare(b, "zh-Hant"));
  return ["全部", ...ordered, ...rest];
}

function parsePositiveInt(value: string | null, fallback: number): number {
  if (value == null || value === "") return fallback;
  const n = Number.parseInt(value, 10);
  return Number.isFinite(n) && n >= 1 ? n : fallback;
}

function parseOptionalPrice(value: string | null): number | undefined {
  if (value == null || value === "") return undefined;
  const n = Number.parseInt(value, 10);
  if (!Number.isFinite(n) || n < 0) return undefined;
  return n;
}

const SORT_VALUES: SortOption[] = [
  "default",
  "price-asc",
  "price-desc",
  "rating-desc",
  "name-asc",
];

export function parseCatalogQuery(searchParams: URLSearchParams): CatalogQuery {
  const rawCat = searchParams.get("category");
  const category = rawCat && rawCat !== "全部" ? rawCat : "全部";

  const rawSort = searchParams.get("sort") as SortOption | null;
  const sort = rawSort && SORT_VALUES.includes(rawSort) ? rawSort : "default";

  const page = parsePositiveInt(searchParams.get("page"), 1);
  const featuredOnly = searchParams.get("featured") === "1";

  const minPrice = parseOptionalPrice(searchParams.get("min"));
  const maxPrice = parseOptionalPrice(searchParams.get("max"));

  return { category, sort, page, featuredOnly, minPrice, maxPrice };
}

export function filterProducts(list: Product[], q: CatalogQuery): Product[] {
  let out = list;

  if (q.category !== "全部") {
    out = out.filter((p) => p.category === q.category);
  }

  if (q.featuredOnly) {
    out = out.filter((p) => p.isFeatured);
  }

  if (q.minPrice != null) {
    out = out.filter((p) => p.price >= q.minPrice);
  }

  if (q.maxPrice != null) {
    out = out.filter((p) => p.price <= q.maxPrice);
  }

  return out;
}

export function sortProducts(list: Product[], sort: SortOption): Product[] {
  const next = [...list];
  switch (sort) {
    case "price-asc":
      next.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      next.sort((a, b) => b.price - a.price);
      break;
    case "rating-desc":
      next.sort((a, b) => b.rating - a.rating || b.reviewCount - a.reviewCount);
      break;
    case "name-asc":
      next.sort((a, b) => a.name.localeCompare(b.name, "zh-Hant"));
      break;
    default:
      break;
  }
  return next;
}

export function paginate<T>(list: T[], page: number, pageSize: number): { items: T[]; total: number; totalPages: number } {
  const total = list.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const safePage = Math.min(Math.max(1, page), totalPages);
  const start = (safePage - 1) * pageSize;
  const items = list.slice(start, start + pageSize);
  return { items, total, totalPages };
}

export function getCatalogPage(q: CatalogQuery): {
  items: Product[];
  total: number;
  totalPages: number;
  page: number;
} {
  const filtered = filterProducts(allProducts, q);
  const sorted = sortProducts(filtered, q.sort);
  const { items, total, totalPages } = paginate(sorted, q.page, PAGE_SIZE);
  const page = Math.min(Math.max(1, q.page), totalPages);
  return { items, total, totalPages, page };
}
