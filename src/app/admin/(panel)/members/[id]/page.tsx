import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import {
  computeMemberAccountStatus,
  MEMBER_ACCOUNT_STATUS_LABEL,
  type MemberAccountStatusKey,
} from "@/lib/admin/member-account-status";
import {
  ADMIN_MEMBER_DETAIL_ORDERS_PAGE_SIZE,
  buildAdminMemberDetailHref,
} from "@/lib/admin/admin-members-list";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import {
  AdminMemberNotesForm,
  type AdminMemberNoteRow,
} from "@/components/admin/AdminMemberNotesForm";
import { AdminMemberBannedForm } from "@/components/admin/AdminMemberBannedForm";
import { Badge } from "@/components/ui/badge";
import {
  orderStatusBadgeProps,
  orderStatusLabel,
} from "@/lib/orders/order-status-display";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

type ProfileDetail = {
  id: string;
  full_name: string | null;
  email: string | null;
  mobile_phone: string | null;
  landline_phone: string | null;
  birthday: string | null;
  default_shipping_address: string | null;
  avatar_url: string | null;
  is_admin: boolean | null;
  created_at: string;
  updated_at: string | null;
  member_source: string | null;
  is_banned: boolean | null;
};

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  updated_at: string;
  total: number;
  status: string;
};

function accountStatusBadgeClass(status: MemberAccountStatusKey): string {
  switch (status) {
    case "banned":
      return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-200";
    case "dormant":
      return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200";
    case "repeat_buyer":
      return "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-100";
    case "active":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

function adminNoteAuthorLabel(
  createdBy: string | null,
  map: Map<string, { full_name: string | null; email: string | null }>,
): string {
  if (!createdBy) return "（歷史匯入）";
  const p = map.get(createdBy);
  if (!p) return "管理員";
  const name = p.full_name?.trim();
  if (name) return name;
  return p.email?.trim() || "管理員";
}

export default async function AdminMemberDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ordersPage?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const rawOrdersPage = parseInt(typeof sp.ordersPage === "string" ? sp.ordersPage : "1", 10);
  const ordersPageRequested =
    Number.isFinite(rawOrdersPage) && rawOrdersPage > 0 ? rawOrdersPage : 1;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  const { data: profileRaw, error: profileError } = await supabase
    .from("profiles")
    .select(
      "id, full_name, email, mobile_phone, landline_phone, birthday, default_shipping_address, avatar_url, is_admin, created_at, updated_at, member_source, is_banned",
    )
    .eq("id", id)
    .maybeSingle();

  if (profileError || !profileRaw) {
    notFound();
  }

  const profile = profileRaw as ProfileDetail;

  const { data: noteRows } = await supabase
    .from("profile_admin_note_entries")
    .select("id, body, created_at, created_by")
    .eq("profile_id", id)
    .order("created_at", { ascending: false });

  const authorIds = [
    ...new Set(
      (noteRows ?? []).map((n) => n.created_by).filter((x): x is string => Boolean(x)),
    ),
  ];
  const authorMap = new Map<string, { full_name: string | null; email: string | null }>();
  if (authorIds.length > 0) {
    const { data: authors } = await supabase
      .from("profiles")
      .select("id, full_name, email")
      .in("id", authorIds);
    for (const a of authors ?? []) {
      authorMap.set(a.id, { full_name: a.full_name, email: a.email });
    }
  }

  const adminNotes: AdminMemberNoteRow[] = (noteRows ?? []).map((n) => ({
    id: n.id,
    body: n.body,
    created_at: n.created_at,
    created_by: n.created_by,
    authorLabel: adminNoteAuthorLabel(n.created_by, authorMap),
  }));

  const [{ count: ordersTotalCount }, { data: orderMetaForStatus }] = await Promise.all([
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .eq("user_id", id),
    supabase
      .from("orders")
      .select("status, created_at, updated_at")
      .eq("user_id", id),
  ]);

  const orderRowsForStatus = (orderMetaForStatus ?? []).map((o) => ({
    status: o.status,
    created_at: o.created_at,
    updated_at: o.updated_at,
  }));

  const ordersTotal = ordersTotalCount ?? 0;
  const ordersTotalPages = Math.max(
    1,
    Math.ceil(ordersTotal / ADMIN_MEMBER_DETAIL_ORDERS_PAGE_SIZE),
  );
  const ordersPage = Math.min(ordersPageRequested, ordersTotalPages);
  const ordersFrom = (ordersPage - 1) * ADMIN_MEMBER_DETAIL_ORDERS_PAGE_SIZE;
  const ordersTo = ordersFrom + ADMIN_MEMBER_DETAIL_ORDERS_PAGE_SIZE - 1;

  const { data: ordersRaw } = await supabase
    .from("orders")
    .select("id, order_number, created_at, updated_at, total, status")
    .eq("user_id", id)
    .order("created_at", { ascending: false })
    .range(ordersFrom, ordersTo)
    .returns<OrderRow[]>();

  const orders = ordersRaw ?? [];

  const accountStatus = computeMemberAccountStatus({
    isBanned: profile.is_banned === true,
    profileUpdatedAt: profile.updated_at,
    orderRows: orderRowsForStatus,
  });

  const isSelf = currentUser?.id === profile.id;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/members" ariaLabel="返回會員列表" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">會員詳細</h2>
            <p className="mt-0.5 font-mono text-xs text-muted-foreground break-all">{profile.id}</p>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:items-start">
        <div className="flex min-w-0 flex-col gap-6">
          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">個人資料與帳號管理</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-muted-foreground">帳號狀態</span>
                <span
                  className={cn(
                    "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                    accountStatusBadgeClass(accountStatus),
                  )}
                >
                  {MEMBER_ACCOUNT_STATUS_LABEL[accountStatus]}
                </span>
                {profile.member_source === "purchase" ? (
                  <span className="inline-flex rounded-full border border-violet-200 bg-violet-100 px-2 py-0.5 text-xs font-medium text-violet-900 dark:border-violet-900 dark:bg-violet-950/40 dark:text-violet-100">
                    購買會員
                  </span>
                ) : (
                  <span className="inline-flex rounded-full border border-border bg-muted px-2 py-0.5 text-xs text-muted-foreground">
                    註冊會員
                  </span>
                )}
                {profile.is_admin ? (
                  <span className="inline-flex rounded-full border border-amber-200 bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900">
                    管理員
                  </span>
                ) : null}
              </div>
              <dl className="grid gap-2 sm:grid-cols-[8rem_1fr] sm:gap-x-4">
                <dt className="text-muted-foreground">姓名</dt>
                <dd className="text-foreground">{profile.full_name?.trim() || "—"}</dd>
                <dt className="text-muted-foreground">Email</dt>
                <dd className="break-all text-foreground">{profile.email?.trim() || "—"}</dd>
                <dt className="text-muted-foreground">手機</dt>
                <dd className="text-foreground">{profile.mobile_phone?.trim() || "—"}</dd>
                <dt className="text-muted-foreground">市話</dt>
                <dd className="text-foreground">{profile.landline_phone?.trim() || "—"}</dd>
                <dt className="text-muted-foreground">生日</dt>
                <dd className="text-foreground">{profile.birthday ?? "—"}</dd>
                <dt className="text-muted-foreground">預設地址</dt>
                <dd className="whitespace-pre-wrap text-foreground">
                  {profile.default_shipping_address?.trim() || "—"}
                </dd>
                <dt className="text-muted-foreground">註冊時間</dt>
                <dd className="tabular-nums text-foreground">{formatOrderDateTimeZh(profile.created_at)}</dd>
              </dl>

              <div className="mt-5 border-t border-border pt-5">
                <p className="text-sm font-medium text-foreground">帳號停用</p>
                <p className="mt-1 text-xs text-muted-foreground">
                  停用後該帳號無法登入前台（Email／Google）。
                </p>
                <div className="mt-3">
                  <AdminMemberBannedForm
                    memberId={profile.id}
                    isBanned={profile.is_banned === true}
                    disabled={isSelf}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-border/80 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">後台備註</CardTitle>
            </CardHeader>
            <CardContent>
              <AdminMemberNotesForm memberId={profile.id} notes={adminNotes} />
            </CardContent>
          </Card>
        </div>

        <Card className="min-h-0 min-w-0 border border-border/80 shadow-sm">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">訂單紀錄</CardTitle>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            <div className="overflow-x-auto">
              <table className="w-full min-w-[20rem] text-left text-sm">
                <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3">訂單編號</th>
                  <th className="px-4 py-3">建立時間</th>
                  <th className="px-4 py-3">狀態</th>
                  <th className="px-4 py-3 text-right">金額</th>
                </tr>
                </thead>
                <tbody className="divide-y divide-border bg-card">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <Link
                        href={`/admin/orders/${o.id}?from=member`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "h-auto min-h-0 px-1 py-0 font-mono text-xs text-primary hover:underline",
                        )}
                      >
                        #{o.order_number}
                      </Link>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums text-xs">
                      {formatOrderDateTimeZh(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge {...orderStatusBadgeProps(o.status)}>
                        {orderStatusLabel(o.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right tabular-nums">NT$ {o.total}</td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-6 py-10 text-center text-muted-foreground">
                      尚無訂單
                    </td>
                  </tr>
                ) : null}
                </tbody>
              </table>
            </div>
            {ordersTotal > 0 ? (
              <div className="flex flex-col gap-3 border-t border-border bg-muted/20 px-4 py-3 text-sm sm:flex-row sm:items-center sm:justify-between">
                <p className="text-muted-foreground">
                  共{" "}
                  <span className="font-medium text-foreground tabular-nums">{ordersTotal}</span> 筆訂單，每頁{" "}
                  <span className="font-medium text-foreground tabular-nums">
                    {ADMIN_MEMBER_DETAIL_ORDERS_PAGE_SIZE}
                  </span>{" "}
                  筆
                  {ordersTotalPages > 1 ? (
                    <>
                      ，第{" "}
                      <span className="font-medium text-foreground tabular-nums">{ordersPage}</span> /{" "}
                      <span className="tabular-nums">{ordersTotalPages}</span> 頁
                    </>
                  ) : null}
                </p>
                {ordersTotalPages > 1 ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={buildAdminMemberDetailHref(id, {
                        ordersPage: ordersPage - 1,
                      })}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        ordersPage <= 1 && "pointer-events-none opacity-40",
                      )}
                      aria-disabled={ordersPage <= 1}
                      prefetch={false}
                    >
                      上一頁
                    </Link>
                    <Link
                      href={buildAdminMemberDetailHref(id, {
                        ordersPage: ordersPage + 1,
                      })}
                      className={cn(
                        buttonVariants({ variant: "outline", size: "sm" }),
                        ordersPage >= ordersTotalPages && "pointer-events-none opacity-40",
                      )}
                      aria-disabled={ordersPage >= ordersTotalPages}
                      prefetch={false}
                    >
                      下一頁
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
