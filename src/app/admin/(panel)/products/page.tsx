import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { buttonVariants } from "@/components/ui/button-variants";
import { FormMenuSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { AdminProductsTableClient, type AdminProductsRow } from "@/components/admin/AdminProductsTableClient";
import {
  ADMIN_PRODUCT_STATUS_FILTER_VALUES,
  ADMIN_PRODUCTS_PAGE_SIZE,
  buildAdminProductsListHref,
  getAdminProductsListDefaultOrder,
  sanitizeProductSearchQuery,
} from "@/lib/admin/admin-products-list";

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  active: "上架",
  archived: "下架",
  sold_out: "售完",
};

type Row = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number | null;
  status: string | null;
  display_order: number;
  updated_at: string | null;
  image_url: string | null;
  product_categories: { name: string } | null;
};

const SELECT = `
  id,
  name,
  price,
  stock_quantity,
  status,
  display_order,
  updated_at,
  image_url,
  product_categories ( name )
`;

function formatLastEdited(iso: string | null): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  } catch {
    return "—";
  }
}

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{
    q?: string;
    page?: string;
    category?: string;
    status?: string;
  }>;
}) {
  const sp = await searchParams;
  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const q = sanitizeProductSearchQuery(rawQ);
  const rawPage = parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const pageRequested = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const supabase = await createClient();

  const { data: catsRaw } = await supabase
    .from("product_categories")
    .select("id, name")
    .order("sort_order", { ascending: true })
    .order("name", { ascending: true });

  const categories = (catsRaw ?? []) as { id: string; name: string }[];

  const rawCategory = typeof sp.category === "string" ? sp.category.trim() : "";
  const categoryId =
    rawCategory && categories.some((c) => c.id === rawCategory) ? rawCategory : "";

  const rawStatus = typeof sp.status === "string" ? sp.status.trim() : "";
  const statusFilter =
    rawStatus &&
    (ADMIN_PRODUCT_STATUS_FILTER_VALUES as readonly string[]).includes(rawStatus)
      ? rawStatus
      : "";

  const hasActiveFilters = q.length > 0 || !!categoryId || !!statusFilter;

  const { column: orderColumn, ascending: orderAscending } =
    getAdminProductsListDefaultOrder(hasActiveFilters);

  let countQuery = supabase.from("products").select("id", { count: "exact", head: true });
  if (categoryId) {
    countQuery = countQuery.eq("category_id", categoryId);
  }
  if (statusFilter) {
    countQuery = countQuery.eq("status", statusFilter);
  }
  if (q) {
    countQuery = countQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }
  const { count: totalCount, error: countError } = await countQuery;

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_PRODUCTS_PAGE_SIZE));
  const page = Math.min(Math.max(1, pageRequested), totalPages);
  const from = (page - 1) * ADMIN_PRODUCTS_PAGE_SIZE;

  let listQuery = supabase.from("products").select(SELECT);
  if (categoryId) {
    listQuery = listQuery.eq("category_id", categoryId);
  }
  if (statusFilter) {
    listQuery = listQuery.eq("status", statusFilter);
  }
  if (q) {
    listQuery = listQuery.or(`name.ilike.%${q}%,description.ilike.%${q}%`);
  }
  listQuery = listQuery
    .order(orderColumn, { ascending: orderAscending })
    .order("id", { ascending: true });

  const { data: raw, error } = await listQuery.range(from, from + ADMIN_PRODUCTS_PAGE_SIZE - 1);

  const products = raw as Row[] | null;
  const loadError = countError ?? error;
  const rows: AdminProductsRow[] =
    (products ?? []).map((p) => ({
      id: p.id,
      name: p.name,
      price: p.price,
      stock_quantity: p.stock_quantity,
      status: p.status,
      display_order: p.display_order,
      last_edited: formatLastEdited(p.updated_at),
      image_url: p.image_url,
      category_name: p.product_categories?.name ?? null,
    })) ?? [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">商品管理</h2>
          <p className="mt-1 text-sm text-muted-foreground">建立、編輯商品與圖片</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/admin/products/categories"
            className={cn(buttonVariants({ variant: "outline" }))}
            title="前往分類管理：新增、重新命名或調整排序（供商品表單選擇）。與本頁篩選區的「分類」不同。"
            aria-label="前往分類管理頁面"
          >
            管理分類
          </Link>
          <Link href="/admin/products/new" className={cn(buttonVariants())}>
            新增商品
          </Link>
        </div>
      </div>

      <form method="get" className="rounded-xl border border-border/80 bg-muted/25 px-4 py-4 shadow-sm sm:px-5">
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="sr-only">篩選商品</legend>

          <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:gap-4">
            <div className="min-w-0 w-full xl:min-w-0 xl:flex-1">
              <label
                htmlFor="admin-products-q"
                className="mb-1.5 block text-xs font-medium text-muted-foreground"
              >
                關鍵字
              </label>
              <input
                id="admin-products-q"
                name="q"
                type="search"
                placeholder="商品名稱或描述…"
                defaultValue={q}
                className="h-9 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoComplete="off"
              />
            </div>

            <div className="flex min-w-0 w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 xl:w-auto xl:shrink-0">
              <div className="min-w-0 flex-1 basis-[14rem] sm:min-w-[14rem]">
                <label
                  htmlFor="admin-products-category"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  分類
                </label>
                <FormMenuSelect
                  id="admin-products-category"
                  name="category"
                  defaultValue={categoryId}
                  emptyOption={{ label: "全部分類" }}
                  options={categories.map((c) => ({ value: c.id, label: c.name }))}
                />
              </div>
              <div className="min-w-0 flex-1 basis-[14rem] sm:min-w-[14rem]">
                <label
                  htmlFor="admin-products-status"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  狀態
                </label>
                <FormMenuSelect
                  id="admin-products-status"
                  name="status"
                  defaultValue={statusFilter}
                  emptyOption={{ label: "全部狀態" }}
                  options={ADMIN_PRODUCT_STATUS_FILTER_VALUES.map((value) => ({
                    value,
                    label: STATUS_LABEL[value] ?? value,
                  }))}
                />
              </div>

              <div className="flex w-full shrink-0 flex-wrap gap-2 sm:ml-auto sm:w-auto sm:justify-end">
                <Button type="submit" size="lg" className="rounded-full">
                  搜尋
                </Button>
                {q || categoryId || statusFilter ? (
                  <Link
                    href="/admin/products"
                    className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
                  >
                    清除
                  </Link>
                ) : null}
              </div>
            </div>
          </div>
        </fieldset>
      </form>

      <Card className="border-none shadow-sm overflow-hidden">
        <AdminProductsTableClient
          rows={rows}
          emptyMessage={
            loadError
              ? `載入失敗：${loadError.message}`
              : hasActiveFilters
                ? "找不到符合條件的商品"
                : "尚無商品"
          }
        />

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              共 <span className="font-medium text-foreground tabular-nums">{total}</span> 筆，每頁{" "}
              <span className="font-medium text-foreground tabular-nums">
                {ADMIN_PRODUCTS_PAGE_SIZE}
              </span>{" "}
              筆
              {totalPages > 1 ? (
                <>
                  ，第{" "}
                  <span className="font-medium text-foreground tabular-nums">{page}</span> /{" "}
                  <span className="tabular-nums">{totalPages}</span> 頁
                </>
              ) : null}
            </p>
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={buildAdminProductsListHref(
                    q,
                    page - 1,
                    categoryId || null,
                    statusFilter || null,
                  )}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page <= 1 && "pointer-events-none opacity-40",
                  )}
                  aria-disabled={page <= 1}
                  prefetch={false}
                >
                  上一頁
                </Link>
                <Link
                  href={buildAdminProductsListHref(
                    q,
                    page + 1,
                    categoryId || null,
                    statusFilter || null,
                  )}
                  className={cn(
                    buttonVariants({ variant: "outline", size: "sm" }),
                    page >= totalPages && "pointer-events-none opacity-40",
                  )}
                  aria-disabled={page >= totalPages}
                  prefetch={false}
                >
                  下一頁
                </Link>
              </div>
            ) : null}
          </div>
        )}
      </Card>
    </div>
  );
}
