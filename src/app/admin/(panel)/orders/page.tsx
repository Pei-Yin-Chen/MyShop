import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { FormMenuSelect } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button-variants";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import {
  ADMIN_ORDERS_PAGE_SIZE,
  ADMIN_ORDER_NOTE_FILTER_VALUES,
  ADMIN_ORDER_STATUS_FILTER_VALUES,
  adminOrderNoteFilterLabel,
  buildAdminOrdersListHref,
  sanitizeOrderSearchQuery,
  buildOrderSearchOrFilter,
} from "@/lib/admin/admin-orders-list";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import {
  orderStatusBadgeProps,
  orderStatusLabel,
} from "@/lib/orders/order-status-display";
import {
  orderAdminNoteHandlingBadgeProps,
  orderAdminNoteHandlingLabel,
} from "@/lib/admin/admin-order-notes";

type OrderListRow = {
  id: string;
  user_id: string | null;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
  admin_note_body: string | null;
  admin_note_handling_status: string;
};

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; status?: string; note?: string }>;
}) {
  const sp = await searchParams;
  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const q = sanitizeOrderSearchQuery(rawQ);
  const rawPage = parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const pageRequested = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawStatus = typeof sp.status === "string" ? sp.status.trim() : "";
  const statusFilter =
    rawStatus &&
    (ADMIN_ORDER_STATUS_FILTER_VALUES as readonly string[]).includes(rawStatus)
      ? rawStatus
      : "";

  const rawNote = typeof sp.note === "string" ? sp.note.trim() : "";
  const noteFilter =
    rawNote && (ADMIN_ORDER_NOTE_FILTER_VALUES as readonly string[]).includes(rawNote)
      ? rawNote
      : "";

  const hasActiveFilters = q.length > 0 || !!statusFilter || !!noteFilter;

  const supabase = await createClient();

  let countQuery = supabase.from("orders").select("id", { count: "exact", head: true });
  if (q) {
    countQuery = countQuery.or(buildOrderSearchOrFilter(q));
  }
  if (statusFilter) {
    countQuery = countQuery.eq("status", statusFilter);
  }
  if (noteFilter === "no_note") {
    countQuery = countQuery.or("admin_note_body.is.null,admin_note_body.eq.");
  } else if (noteFilter === "pending" || noteFilter === "processing" || noteFilter === "resolved") {
    countQuery = countQuery.eq("admin_note_handling_status", noteFilter);
  }
  const { count: totalCount, error: countError } = await countQuery;

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_ORDERS_PAGE_SIZE));
  const page = Math.min(pageRequested, totalPages);

  const from = (page - 1) * ADMIN_ORDERS_PAGE_SIZE;
  const to = from + ADMIN_ORDERS_PAGE_SIZE - 1;

  let listQuery = supabase
    .from("orders")
    .select("id, user_id, order_number, created_at, total, status, admin_note_body, admin_note_handling_status")
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    listQuery = listQuery.or(buildOrderSearchOrFilter(q));
  }
  if (statusFilter) {
    listQuery = listQuery.eq("status", statusFilter);
  }
  if (noteFilter === "no_note") {
    listQuery = listQuery.or("admin_note_body.is.null,admin_note_body.eq.");
  } else if (noteFilter === "pending" || noteFilter === "processing" || noteFilter === "resolved") {
    listQuery = listQuery.eq("admin_note_handling_status", noteFilter);
  }

  const { data: ordersRaw, error: loadError } = await listQuery;

  const orders = (ordersRaw ?? []) as OrderListRow[];

  const userIds = [...new Set(orders.map((o) => o.user_id).filter((x): x is string => Boolean(x)))];
  const profileById = new Map<string, { full_name: string | null; email: string | null }>();
  if (userIds.length > 0) {
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", userIds);
    for (const p of profiles ?? []) {
      profileById.set(p.id, { full_name: p.full_name, email: p.email });
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">訂單管理</h2>
      </div>

      <form method="get" className="rounded-xl border border-border/80 bg-muted/25 px-4 py-4 shadow-sm sm:px-5">
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="sr-only">搜尋與篩選訂單</legend>
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:gap-4">
            <div className="min-w-0 w-full lg:max-w-md">
              <label htmlFor="admin-orders-q" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                訂單編號（可含 #）、收件人、Email 或訂單 ID（UUID）
              </label>
              <input
                id="admin-orders-q"
                name="q"
                type="search"
                placeholder="訂單編號、UUID…"
                defaultValue={rawQ.trim()}
                className="h-9 w-full rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoComplete="off"
              />
            </div>

            <div className="min-w-0 flex-1 sm:min-w-[12rem]">
              <label htmlFor="admin-orders-status" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                訂單狀態
              </label>
              <FormMenuSelect
                id="admin-orders-status"
                name="status"
                defaultValue={statusFilter}
                emptyOption={{ label: "全部狀態" }}
                options={ADMIN_ORDER_STATUS_FILTER_VALUES.map((value) => ({
                  value,
                  label: orderStatusLabel(value),
                }))}
                requestSubmitParentForm
              />
            </div>

            <div className="min-w-0 flex-1 sm:min-w-[12rem]">
              <label htmlFor="admin-orders-note" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                內部備註處理
              </label>
              <FormMenuSelect
                id="admin-orders-note"
                name="note"
                defaultValue={noteFilter}
                emptyOption={{ label: "全部" }}
                options={ADMIN_ORDER_NOTE_FILTER_VALUES.filter((v) => v !== "").map((value) => ({
                  value,
                  label: adminOrderNoteFilterLabel(value),
                }))}
                requestSubmitParentForm
              />
            </div>

            <div className="flex flex-wrap gap-2 lg:shrink-0">
              <button type="submit" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>
                搜尋
              </button>
              {hasActiveFilters ? (
                <Link
                  href="/admin/orders"
                  className={cn(buttonVariants({ variant: "outline", size: "lg" }), "rounded-full")}
                >
                  清除
                </Link>
              ) : null}
            </div>
          </div>
        </fieldset>
      </form>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3 align-top">
                  <span className="block font-medium text-foreground">訂單編號</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">UUID</span>
                </th>
                <th className="px-4 py-3 align-top">
                  <span className="block font-medium text-foreground">會員姓名</span>
                  <span className="mt-0.5 block text-xs font-normal text-muted-foreground">Email</span>
                </th>
                <th className="px-4 py-3 min-w-[10rem] max-w-[18rem]">內部備註</th>
                <th className="px-4 py-3">金額</th>
                <th className="px-4 py-3">狀態</th>
                <th className="px-4 py-3">建立時間</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {orders.map((order) => {
                const prof = order.user_id ? profileById.get(order.user_id) : undefined;
                const memberName = prof?.full_name?.trim() ?? "";
                const memberEmail = prof?.email?.trim() ?? "";
                const memberPrimary =
                  order.user_id && prof
                    ? memberName || memberEmail || "（會員）"
                    : "訪客";
                const showMemberEmailBelow = Boolean(
                  order.user_id && memberName && memberEmail && memberPrimary !== memberEmail,
                );
                return (
                  <tr key={order.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium tabular-nums">
                      <div className="min-w-0">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="text-primary hover:underline"
                        >
                          #{order.order_number}
                        </Link>
                        <p className="mt-0.5 font-mono text-xs leading-snug text-muted-foreground break-all">
                          {order.id}
                        </p>
                      </div>
                    </td>
                    <td className="px-4 py-3 max-w-[220px]">
                      {order.user_id ? (
                        <div className="min-w-0">
                          <Link
                            href={`/admin/members/${order.user_id}`}
                            className="text-primary hover:underline break-all font-medium text-foreground"
                          >
                            {memberPrimary}
                          </Link>
                          {showMemberEmailBelow ? (
                            <p className="mt-0.5 text-xs text-muted-foreground break-all">{memberEmail}</p>
                          ) : null}
                        </div>
                      ) : (
                        <span className="text-muted-foreground">訪客</span>
                      )}
                    </td>
                    <td className="px-4 py-3 align-top text-sm">
                      {order.admin_note_body?.trim() ? (
                        <div className="min-w-0 max-w-[18rem] space-y-1">
                          <p className="line-clamp-2 text-foreground">{order.admin_note_body.trim()}</p>
                          <Badge
                            {...orderAdminNoteHandlingBadgeProps(order.admin_note_handling_status)}
                          >
                            {orderAdminNoteHandlingLabel(order.admin_note_handling_status)}
                          </Badge>
                        </div>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 tabular-nums font-medium text-foreground">
                      NT$ {order.total}
                    </td>
                    <td className="px-4 py-3">
                      <Badge {...orderStatusBadgeProps(order.status)}>
                        {orderStatusLabel(order.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums text-xs">
                      {formatOrderDateTimeZh(order.created_at)}
                    </td>
                  </tr>
                );
              })}
              {orders.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {loadError || countError
                      ? `載入失敗：${(loadError ?? countError)?.message ?? ""}`
                      : hasActiveFilters
                        ? "找不到符合條件的訂單"
                        : "目前尚無訂單"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {total > 0 && (
          <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
            <p className="text-muted-foreground">
              共 <span className="font-medium text-foreground tabular-nums">{total}</span> 筆，每頁{" "}
              <span className="font-medium text-foreground tabular-nums">{ADMIN_ORDERS_PAGE_SIZE}</span>{" "}
              筆
              {totalPages > 1 ? (
                <>
                  ，第 <span className="font-medium text-foreground tabular-nums">{page}</span> /{" "}
                  <span className="tabular-nums">{totalPages}</span> 頁
                </>
              ) : null}
            </p>
            {totalPages > 1 ? (
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={buildAdminOrdersListHref({
                    q: q || undefined,
                    page: page - 1,
                    status: statusFilter || undefined,
                    note: noteFilter || undefined,
                  })}
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
                  href={buildAdminOrdersListHref({
                    q: q || undefined,
                    page: page + 1,
                    status: statusFilter || undefined,
                    note: noteFilter || undefined,
                  })}
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
