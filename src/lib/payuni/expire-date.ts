/**
 * PAYUNi UPP `ExpireDate`（YYYY-MM-DD）：超商／ATM 繳費有效日期。
 * 文件：若設為「當日」，訂單成立後至少需有 2 小時繳費時間；若當日剩餘時間小於 2 小時，應設為隔日。
 */

const TAIPEI_TZ = "Asia/Taipei";

function formatYyyyMmDdTaipei(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TAIPEI_TZ });
}

/** 該 YYYY-MM-DD（台北日曆日）的隔日 00:00（台北） */
function startOfNextCalendarDayTaipei(yyyyMmDd: string): Date {
  const start = new Date(`${yyyyMmDd}T00:00:00+08:00`);
  start.setDate(start.getDate() + 1);
  return start;
}

/**
 * 依「現在」計算應帶入 UPP 的 ExpireDate：
 * - 若距「台北當日」結束（隔日 00:00）尚餘 **≥ 2 小時** → 使用 **當日**；
 * - 若 **< 2 小時** → 使用 **隔日**（符合官方「小於 2 小時請設隔日」）。
 */
export function computePayuniExpireDateYyyyMmDd(now: Date = new Date()): string {
  const todayStr = formatYyyyMmDdTaipei(now);
  const nextDayStart = startOfNextCalendarDayTaipei(todayStr);
  const msLeft = nextDayStart.getTime() - now.getTime();
  const twoHoursMs = 2 * 60 * 60 * 1000;

  if (msLeft < twoHoursMs) {
    return formatYyyyMmDdTaipei(nextDayStart);
  }

  return todayStr;
}
