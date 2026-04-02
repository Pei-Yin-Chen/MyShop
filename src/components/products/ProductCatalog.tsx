"use client";

import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal } from "lucide-react";
import type { Product } from "@/data/products";
import {
  getCatalogPage,
  getCategoryNavItems,
  parseCatalogQuery,
  type SortOption,
} from "@/lib/product-catalog";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { SortDropdown } from "@/components/ui/select";
import { ProductListCard } from "@/components/products/ProductListCard";
import { cn } from "@/lib/utils";

function buildNextParams(
  current: URLSearchParams,
  updates: Record<string, string | null | undefined>,
  resetPage: boolean,
) {
  const next = new URLSearchParams(current.toString());
  for (const [k, v] of Object.entries(updates)) {
    if (v == null || v === "") next.delete(k);
    else next.set(k, v);
  }
  if (resetPage) next.delete("page");
  return next;
}

export function ProductCatalog({ products }: { products: Product[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const q = useMemo(() => parseCatalogQuery(searchParams), [searchParams]);
  const { items, total, totalPages, page } = useMemo(
    () => getCatalogPage(products, q),
    [products, q],
  );
  const categories = useMemo(() => getCategoryNavItems(products), [products]);

  const [minStr, setMinStr] = useState(() => searchParams.get("min") ?? "");
  const [maxStr, setMaxStr] = useState(() => searchParams.get("max") ?? "");

  useEffect(() => {
    setMinStr(searchParams.get("min") ?? "");
    setMaxStr(searchParams.get("max") ?? "");
  }, [searchParams]);

  function pushQuery(updates: Record<string, string | null | undefined>, resetPage = false) {
    const next = buildNextParams(searchParams, updates, resetPage);
    const s = next.toString();
    router.replace(s ? `${pathname}?${s}` : pathname, { scroll: false });
  }

  function setCategory(cat: string) {
    if (cat === "全部") {
      pushQuery({ category: null }, true);
    } else {
      pushQuery({ category: cat }, true);
    }
  }

  function setSort(sort: SortOption) {
    pushQuery({ sort: sort === "default" ? null : sort }, false);
  }

  function setPage(p: number) {
    pushQuery({ page: p <= 1 ? null : String(p) }, false);
  }

  function toggleFeatured(checked: boolean) {
    pushQuery({ featured: checked ? "1" : null }, true);
  }

  function applyPriceFilter() {
    const min = minStr.trim() === "" ? null : minStr.trim();
    const max = maxStr.trim() === "" ? null : maxStr.trim();
    pushQuery({ min: min ?? null, max: max ?? null }, true);
  }

  function clearPriceFilter() {
    setMinStr("");
    setMaxStr("");
    pushQuery({ min: null, max: null }, true);
  }

  const sortValue = q.sort;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 lg:py-14">
      <header className="mb-10">
        <p className="mb-2 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
          Shop
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
          所有商品
        </h1>
        <p className="mt-3 max-w-xl text-muted-foreground">
          依分類瀏覽、篩選價格與主廚推薦，並可排序與分頁檢索。
        </p>
      </header>

      <div className="lg:grid lg:grid-cols-[minmax(0,220px)_1fr] lg:gap-10 xl:grid-cols-[minmax(0,240px)_1fr]">
        {/* 側欄：分類導覽 + 篩選 */}
        <aside className="mb-10 space-y-8 lg:mb-0">
          <nav aria-label="商品分類">
            <h2 className="mb-3 text-sm font-semibold text-foreground">分類導覽</h2>
            <ul className="flex flex-wrap gap-2 lg:flex-col lg:flex-nowrap lg:gap-1">
              {categories.map((cat) => {
                const active =
                  cat === "全部" ? q.category === "全部" : q.category === cat;
                return (
                  <li key={cat}>
                    <button
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "w-full cursor-pointer rounded-lg px-3 py-2 text-left text-sm transition-colors",
                        active
                          ? "bg-primary/15 font-medium text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {cat}
                    </button>
                  </li>
                );
              })}
            </ul>
          </nav>

          <Separator className="hidden lg:block" />

          <section aria-labelledby="filter-heading">
            <div className="mb-3 flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-muted-foreground" aria-hidden />
              <h2 id="filter-heading" className="text-sm font-semibold text-foreground">
                篩選
              </h2>
            </div>

            <div className="space-y-4 rounded-xl border border-border/80 bg-card/50 p-4">
              <label className="flex cursor-pointer items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={q.featuredOnly}
                  onChange={(e) => toggleFeatured(e.target.checked)}
                  className="size-4 rounded border-border text-primary focus-visible:ring-2 focus-visible:ring-ring"
                />
                <span>只看主廚推薦</span>
              </label>

              <div>
                <p className="mb-2 text-xs font-medium text-muted-foreground">價格（NT$）</p>
                <div className="flex gap-2">
                  <input
                    type="number"
                    min={0}
                    placeholder="最低"
                    value={minStr}
                    onChange={(e) => setMinStr(e.target.value)}
                    className="h-9 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                  <input
                    type="number"
                    min={0}
                    placeholder="最高"
                    value={maxStr}
                    onChange={(e) => setMaxStr(e.target.value)}
                    className="h-9 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-sm tabular-nums outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  />
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  <Button type="button" size="sm" className="rounded-full" onClick={applyPriceFilter}>
                    套用價格
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="rounded-full"
                    onClick={clearPriceFilter}
                  >
                    清除價格
                  </Button>
                </div>
              </div>
            </div>
          </section>
        </aside>

        {/* 主區：排序 + 列表 + 分頁 */}
        <div>
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-muted-foreground">
              共 <span className="font-medium tabular-nums text-foreground">{total}</span> 項商品
              {totalPages > 1 && (
                <>
                  ，第{" "}
                  <span className="font-medium tabular-nums text-foreground">{page}</span> /{" "}
                  {totalPages} 頁
                </>
              )}
            </p>

            <SortDropdown
              label="排序"
              value={sortValue}
              onValueChange={(val) => setSort(val as SortOption)}
              options={[
                { value: "default", label: "預設順序" },
                { value: "price-asc", label: "價格：低 → 高" },
                { value: "price-desc", label: "價格：高 → 低" },
                { value: "rating-desc", label: "評分最高" },
                { value: "name-asc", label: "名稱 A→Z" },
              ]}
            />
          </div>

          <section aria-label="商品列表">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-border bg-muted/20 px-6 py-16 text-center text-muted-foreground">
                沒有符合條件的商品，請調整分類或篩選。
              </div>
            ) : (
              <ul className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {items.map((product) => (
                  <li key={product.id}>
                    <ProductListCard product={product} />
                  </li>
                ))}
              </ul>
            )}
          </section>

          {totalPages > 1 && (
            <nav
              className="mt-10 flex flex-wrap items-center justify-center gap-2"
              aria-label="分頁"
            >
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
              >
                上一頁
              </Button>
              <div className="flex flex-wrap justify-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <Button
                    key={p}
                    type="button"
                    size="sm"
                    variant={p === page ? "default" : "outline"}
                    className="min-w-9 rounded-full tabular-nums"
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </Button>
                ))}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="rounded-full"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
              >
                下一頁
              </Button>
            </nav>
          )}
        </div>
      </div>
    </div>
  );
}
