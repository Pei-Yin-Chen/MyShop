/**
 * 後台會員「帳號狀態」：程式內英文鍵 + 介面中文標籤。
 *
 * - active：近期有互動（更新資料或訂單活動），且非停用、非休眠、未達常客門檻
 * - dormant：約半年以上無任何訂單／資料更新活動（停用優先於此）
 * - repeat_buyer：有效成交訂單超過 2 筆（第 3 筆起視為常客；與 active／dormant 互斥時依優先順序）
 * - banned：已停用
 */
export type MemberAccountStatusKey =
  | "active"
  | "dormant"
  | "repeat_buyer"
  | "banned";

export const MEMBER_ACCOUNT_STATUS_LABEL: Record<MemberAccountStatusKey, string> = {
  active: "活躍",
  dormant: "休眠",
  repeat_buyer: "常客",
  banned: "已停用",
};

/** 計入「成交／有效訂單」的狀態（排除待付款與已取消） */
export const QUALIFYING_ORDER_STATUSES = [
  "paid",
  "processing",
  "shipped",
  "completed",
] as const;

const SIX_MONTHS_MS = 180 * 24 * 60 * 60 * 1000;

function maxTimeMs(dates: (string | null | undefined)[]): number {
  let max = 0;
  for (const d of dates) {
    if (!d) continue;
    const t = new Date(d).getTime();
    if (!Number.isFinite(t)) continue;
    if (t > max) max = t;
  }
  return max;
}

export function computeMemberAccountStatus(input: {
  isBanned: boolean;
  profileUpdatedAt: string | null | undefined;
  orderRows: { status: string; created_at: string; updated_at: string }[];
}): MemberAccountStatusKey {
  if (input.isBanned) return "banned";

  const qualifyingCount = input.orderRows.filter((o) =>
    (QUALIFYING_ORDER_STATUSES as readonly string[]).includes(o.status),
  ).length;

  const activityMs = maxTimeMs([
    input.profileUpdatedAt,
    ...input.orderRows.flatMap((o) => [o.created_at, o.updated_at]),
  ]);

  const now = Date.now();
  if (activityMs > 0 && now - activityMs > SIX_MONTHS_MS) {
    return "dormant";
  }

  if (qualifyingCount > 2) {
    return "repeat_buyer";
  }

  return "active";
}
