import type { SupabaseClient } from "@supabase/supabase-js";

/** 與訂單列表、結帳顯示一致：商店當地日曆 */
export const DASHBOARD_TZ = "Asia/Taipei";

/** 計入「營收」的訂單狀態（已付款或後續流程） */
export const DASHBOARD_REVENUE_STATUSES = ["paid", "processing", "shipped", "completed"] as const;

export type DashboardDayPoint = {
  /** YYYY-MM-DD（台北） */
  dateKey: string;
  /** 圖表橫軸短標籤，例如 4/9 */
  label: string;
  orderCount: number;
  revenue: number;
};

export type DashboardStats = {
  memberCount: number;
  todayOrderCount: number;
  monthRevenue: number;
  last7Days: DashboardDayPoint[];
};

function taipeiYmdFromInstant(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: DASHBOARD_TZ });
}

/** 今日 YYYY-MM-DD（台北） */
function taipeiTodayYmd(): string {
  return taipeiYmdFromInstant(new Date());
}

function taipeiDayStartIso(ymd: string): string {
  return `${ymd}T00:00:00+08:00`;
}

function addMs(isoUtc: string, ms: number): string {
  return new Date(new Date(isoUtc).getTime() + ms).toISOString();
}

/** 台北該日結束（不含）＝次日 00:00 +08 */
function taipeiDayEndExclusiveUtcIso(ymd: string): string {
  return addMs(taipeiDayStartIso(ymd), 24 * 60 * 60 * 1000);
}

/** 由 YYYY-MM-DD 產生圖表用短標籤 */
function formatDashboardDayLabel(ymd: string): string {
  const [, m, d] = ymd.split("-").map(Number);
  return `${m}/${d}`;
}

/** 含今天在內，最近 7 個台北日曆日（由早到晚） */
function last7TaipeiDaysInclusive(): string[] {
  const todayYmd = taipeiTodayYmd();
  const anchor = new Date(`${todayYmd}T12:00:00+08:00`);
  const out: string[] = [];
  for (let back = 6; back >= 0; back -= 1) {
    const t = anchor.getTime() - back * 24 * 60 * 60 * 1000;
    out.push(taipeiYmdFromInstant(new Date(t)));
  }
  return out;
}

function taipeiThisMonthRangeUtc(): { startIso: string; endExclusiveIso: string } {
  const today = taipeiTodayYmd();
  const [yStr, mStr] = today.split("-");
  const y = Number(yStr);
  const m = Number(mStr);
  const startIso = `${y}-${String(m).padStart(2, "0")}-01T00:00:00+08:00`;
  let ny = y;
  let nm = m + 1;
  if (nm > 12) {
    nm = 1;
    ny += 1;
  }
  const endExclusiveIso = `${ny}-${String(nm).padStart(2, "0")}-01T00:00:00+08:00`;
  return { startIso, endExclusiveIso };
}

/**
 * 後台儀表板統計（會員數、今日訂單、本月營收、最近 7 日訂單／營收序列）。
 * 日期與「今日／本月」皆以 Asia/Taipei 計算。
 */
export async function fetchDashboardStats(
  supabase: SupabaseClient,
): Promise<{ ok: true; data: DashboardStats } | { ok: false; error: string }> {
  const todayYmd = taipeiTodayYmd();
  const todayStart = taipeiDayStartIso(todayYmd);
  const todayEndEx = taipeiDayEndExclusiveUtcIso(todayYmd);
  const { startIso: monthStart, endExclusiveIso: monthEndEx } = taipeiThisMonthRangeUtc();

  const dayKeys = last7TaipeiDaysInclusive();
  const weekStartIso = taipeiDayStartIso(dayKeys[0]!);
  const weekEndExIso = taipeiDayEndExclusiveUtcIso(dayKeys[6]!);

  const [
    membersRes,
    todayOrdersRes,
    monthRevRes,
    weekOrdersRes,
  ] = await Promise.all([
    // 顧客會員數（後台管理員不計入，與常見「註冊會員」KPI 一致）
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("is_admin", false),
    supabase
      .from("orders")
      .select("id", { count: "exact", head: true })
      .gte("created_at", todayStart)
      .lt("created_at", todayEndEx),
    supabase
      .from("orders")
      .select("total")
      .gte("created_at", monthStart)
      .lt("created_at", monthEndEx)
      .in("status", [...DASHBOARD_REVENUE_STATUSES]),
    supabase.from("orders").select("created_at, total, status").gte("created_at", weekStartIso).lt("created_at", weekEndExIso),
  ]);

  if (membersRes.error) return { ok: false, error: membersRes.error.message };
  if (todayOrdersRes.error) return { ok: false, error: todayOrdersRes.error.message };
  if (monthRevRes.error) return { ok: false, error: monthRevRes.error.message };
  if (weekOrdersRes.error) return { ok: false, error: weekOrdersRes.error.message };

  const memberCount = membersRes.count ?? 0;
  const todayOrderCount = todayOrdersRes.count ?? 0;
  const monthRevenue = (monthRevRes.data ?? []).reduce((s, r) => s + (r.total ?? 0), 0);

  const bucket = new Map<string, { orderCount: number; revenue: number }>();
  for (const k of dayKeys) {
    bucket.set(k, { orderCount: 0, revenue: 0 });
  }

  const revenueSet = new Set<string>(DASHBOARD_REVENUE_STATUSES);

  for (const row of weekOrdersRes.data ?? []) {
    const day = taipeiYmdFromInstant(new Date(row.created_at));
    const b = bucket.get(day);
    if (!b) continue;
    b.orderCount += 1;
    if (revenueSet.has(row.status)) b.revenue += row.total ?? 0;
  }

  const last7Days: DashboardDayPoint[] = dayKeys.map((dateKey) => {
    const b = bucket.get(dateKey)!;
    return {
      dateKey,
      label: formatDashboardDayLabel(dateKey),
      orderCount: b.orderCount,
      revenue: b.revenue,
    };
  });

  return {
    ok: true,
    data: {
      memberCount,
      todayOrderCount,
      monthRevenue,
      last7Days,
    },
  };
}
