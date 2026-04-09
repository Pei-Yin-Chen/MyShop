import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card } from "@/components/ui/card";
import { FormMenuSelect } from "@/components/ui/select";
import { buttonVariants } from "@/components/ui/button-variants";
import { AdminMemberImportForm } from "@/components/admin/AdminMemberImportForm";
import { cn } from "@/lib/utils";
import {
  ADMIN_MEMBER_ACCOUNT_STATUS_FILTER_VALUES,
  ADMIN_MEMBER_SOURCE_FILTER_VALUES,
  ADMIN_MEMBERS_PAGE_SIZE,
  buildAdminMembersListHref,
  buildMemberSearchOrFilter,
  sanitizeMemberSearchQuery,
} from "@/lib/admin/admin-members-list";
import {
  MEMBER_ACCOUNT_STATUS_LABEL,
  type MemberAccountStatusKey,
} from "@/lib/admin/member-account-status";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  created_at: string;
  updated_at: string | null;
  member_source: string | null;
  is_banned: boolean | null;
  admin_account_status: string;
};

function parseAccountStatus(raw: string): MemberAccountStatusKey {
  if (
    raw === "banned" ||
    raw === "dormant" ||
    raw === "repeat_buyer" ||
    raw === "active"
  ) {
    return raw;
  }
  return "active";
}

function statusBadgeClass(status: MemberAccountStatusKey): string {
  switch (status) {
    case "banned":
      return "bg-red-100 text-red-800 border border-red-200 dark:bg-red-950/40 dark:text-red-200 dark:border-red-900";
    case "dormant":
      return "bg-slate-100 text-slate-700 border border-slate-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
    case "repeat_buyer":
      return "bg-amber-100 text-amber-900 border border-amber-200 dark:bg-amber-950/50 dark:text-amber-100 dark:border-amber-900";
    case "active":
      return "bg-emerald-100 text-emerald-800 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-200 dark:border-emerald-900";
    default:
      return "bg-muted text-muted-foreground border border-border";
  }
}

const SOURCE_LABEL: Record<string, string> = {
  registered: "註冊",
  purchase: "購買會員",
};

/** 訪客下單／訂單匯入購買會員：待前台流程就緒後改為 true，並恢復 `AdminMemberImportForm` 的 import 與下方區塊。 */
const SHOW_ADMIN_IMPORT_MEMBER_FROM_ORDER = false;

export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string; source?: string; status?: string }>;
}) {
  const sp = await searchParams;
  const rawQ = typeof sp.q === "string" ? sp.q : "";
  const q = sanitizeMemberSearchQuery(rawQ);
  const rawPage = parseInt(typeof sp.page === "string" ? sp.page : "1", 10);
  const pageRequested = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1;

  const rawSource = typeof sp.source === "string" ? sp.source.trim() : "";
  const sourceFilter =
    rawSource &&
    (ADMIN_MEMBER_SOURCE_FILTER_VALUES as readonly string[]).includes(rawSource)
      ? rawSource
      : "";

  const rawStatus = typeof sp.status === "string" ? sp.status.trim() : "";
  const statusFilter =
    rawStatus &&
    (ADMIN_MEMBER_ACCOUNT_STATUS_FILTER_VALUES as readonly string[]).includes(rawStatus)
      ? rawStatus
      : "";

  const hasActiveFilters = q.length > 0 || !!sourceFilter || !!statusFilter;

  const supabase = await createClient();

  let countQuery = supabase.from("profiles_admin_list").select("id", { count: "exact", head: true });
  if (q) {
    countQuery = countQuery.or(buildMemberSearchOrFilter(q));
  }
  if (sourceFilter) {
    countQuery = countQuery.eq("member_source", sourceFilter);
  }
  if (statusFilter) {
    countQuery = countQuery.eq("admin_account_status", statusFilter);
  }
  const { count: totalCount, error: countError } = await countQuery;

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_MEMBERS_PAGE_SIZE));
  const page = Math.min(pageRequested, totalPages);

  const from = (page - 1) * ADMIN_MEMBERS_PAGE_SIZE;
  const to = from + ADMIN_MEMBERS_PAGE_SIZE - 1;

  let listQuery = supabase
    .from("profiles_admin_list")
    .select(
      "id, full_name, email, created_at, updated_at, member_source, is_banned, admin_account_status",
    )
    .order("created_at", { ascending: false })
    .range(from, to);

  if (q) {
    listQuery = listQuery.or(buildMemberSearchOrFilter(q));
  }
  if (sourceFilter) {
    listQuery = listQuery.eq("member_source", sourceFilter);
  }
  if (statusFilter) {
    listQuery = listQuery.eq("admin_account_status", statusFilter);
  }

  const { data: membersRaw, error: loadError } = await listQuery;

  const members = membersRaw as ProfileRow[] | null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-2xl font-bold text-foreground">會員管理</h2>
      </div>

      {SHOW_ADMIN_IMPORT_MEMBER_FROM_ORDER ? (
        <Card className="border border-border/80 bg-muted/20 p-4 shadow-sm sm:p-5">
          <p className="text-sm font-semibold text-foreground">從訂單匯入購買會員</p>
          <p className="mt-1 text-xs text-muted-foreground">
            匯入後，列表上的「帳號狀態」會依訂單與顧客資料自動更新，方便您區分：
            活躍（近期有下單或更新資料）、休眠（約半年沒有任何訂單或更新）、常客（已付款且未取消的成交超過 2 筆）、已停用（您已封鎖此帳號）。
          </p>
          <div className="mt-4">
            <AdminMemberImportForm />
          </div>
        </Card>
      ) : null}

      <form method="get" className="rounded-xl border border-border/80 bg-muted/25 px-4 py-4 shadow-sm sm:px-5">
        <fieldset className="min-w-0 border-0 p-0">
          <legend className="sr-only">搜尋與篩選會員</legend>
          <div className="flex min-w-0 flex-col gap-4 xl:flex-row xl:items-end xl:gap-4">
            <div className="min-w-0 w-full xl:min-w-0 xl:flex-1">
              <label htmlFor="admin-members-q" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                姓名、Email 或會員 ID
              </label>
              <input
                id="admin-members-q"
                name="q"
                type="search"
                placeholder="關鍵字或 UUID…"
                defaultValue={rawQ.trim()}
                className="h-9 w-full min-w-0 rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring"
                autoComplete="off"
              />
            </div>

            <div className="flex min-w-0 w-full flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end sm:gap-4 xl:w-auto xl:shrink-0">
              <div className="min-w-0 flex-1 basis-[12rem] sm:min-w-[12rem]">
                <label htmlFor="admin-members-source" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  來源
                </label>
                <FormMenuSelect
                  id="admin-members-source"
                  name="source"
                  defaultValue={sourceFilter}
                  emptyOption={{ label: "全部來源" }}
                  options={ADMIN_MEMBER_SOURCE_FILTER_VALUES.map((value) => ({
                    value,
                    label: SOURCE_LABEL[value] ?? value,
                  }))}
                />
              </div>
              <div className="min-w-0 flex-1 basis-[12rem] sm:min-w-[12rem]">
                <label htmlFor="admin-members-status" className="mb-1.5 block text-xs font-medium text-muted-foreground">
                  帳號狀態
                </label>
                <FormMenuSelect
                  id="admin-members-status"
                  name="status"
                  defaultValue={statusFilter}
                  emptyOption={{ label: "全部狀態" }}
                  options={ADMIN_MEMBER_ACCOUNT_STATUS_FILTER_VALUES.map((value) => ({
                    value,
                    label: MEMBER_ACCOUNT_STATUS_LABEL[value],
                  }))}
                />
              </div>

              <div className="flex w-full shrink-0 flex-wrap gap-2 sm:ml-auto sm:w-auto sm:justify-end">
                <button type="submit" className={cn(buttonVariants({ size: "lg" }), "rounded-full")}>
                  搜尋
                </button>
                {hasActiveFilters ? (
                  <Link
                    href="/admin/members"
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
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
              <tr>
                <th className="px-4 py-3">姓名</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">來源</th>
                <th className="px-4 py-3">帳號狀態</th>
                <th className="px-4 py-3">註冊時間</th>
                <th className="px-4 py-3 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {members?.map((member) => {
                const accountStatus = parseAccountStatus(member.admin_account_status);
                const sourceLabel =
                  member.member_source === "purchase" ? "購買會員" : "註冊";
                return (
                  <tr key={member.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      {member.full_name?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground break-all max-w-[220px]">
                      {member.email?.trim() || "—"}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          member.member_source === "purchase"
                            ? "bg-violet-100 text-violet-900 border border-violet-200 dark:bg-violet-950/40 dark:text-violet-100"
                            : "bg-muted text-muted-foreground border border-border",
                        )}
                      >
                        {sourceLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={cn(
                          "inline-flex rounded-full px-2 py-0.5 text-xs font-medium",
                          statusBadgeClass(accountStatus),
                        )}
                      >
                        {MEMBER_ACCOUNT_STATUS_LABEL[accountStatus]}
                      </span>
                    </td>
                    <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums text-xs">
                      {formatOrderDateTimeZh(member.created_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/admin/members/${member.id}`}
                        className={cn(
                          buttonVariants({ variant: "ghost", size: "sm" }),
                          "text-primary hover:underline",
                        )}
                      >
                        詳細
                      </Link>
                    </td>
                  </tr>
                );
              })}
              {(!members || members.length === 0) && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-muted-foreground">
                    {loadError || countError
                      ? `載入失敗：${(loadError ?? countError)?.message ?? ""}`
                      : hasActiveFilters
                        ? "找不到符合條件的會員"
                        : "目前尚無會員資料"}
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
              <span className="font-medium text-foreground tabular-nums">{ADMIN_MEMBERS_PAGE_SIZE}</span>{" "}
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
                  href={buildAdminMembersListHref({
                    q: q || undefined,
                    page: page - 1,
                    source: sourceFilter || undefined,
                    status: statusFilter || undefined,
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
                  href={buildAdminMembersListHref({
                    q: q || undefined,
                    page: page + 1,
                    source: sourceFilter || undefined,
                    status: statusFilter || undefined,
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
