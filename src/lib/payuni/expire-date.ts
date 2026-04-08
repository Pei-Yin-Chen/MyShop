/**
 * PAYUNi UPP `ExpireDate`（YYYY-MM-DD）：以「日」為單位，與官方／台灣常見金流一致。
 * 期限設為 1 天時：帶入之日期為 **台北下單日 + 1 個日曆日**，該日 **23:59:59（台北）** 前有效；
 * `payuni_expire_at` 則存「該期限日結束後」第一瞬間（隔日 00:00 台北），供排程與比對。
 */

const TAIPEI_TZ = "Asia/Taipei";

export function formatYyyyMmDdTaipei(d: Date): string {
  return d.toLocaleDateString("en-CA", { timeZone: TAIPEI_TZ });
}

/** 該 YYYY-MM-DD（台北日曆日）的隔日 00:00（台北），即該繳費日「結束後」第一瞬間（UTC 存 timestamptz） */
export function startOfNextCalendarDayTaipei(yyyyMmDd: string): Date {
  const start = new Date(`${yyyyMmDd}T00:00:00+08:00`);
  start.setDate(start.getDate() + 1);
  return start;
}

const YYYY_MM_DD = /^\d{4}-\d{2}-\d{2}$/;

/**
 * PAYUNi 繳費期限（日曆日字串）是否已過：以「該日曆日結束後」第一瞬間（台北隔日 00:00）為界。
 */
export function isPayuniYyyyMmDdExpired(
  yyyyMmDd: string,
  now: Date = new Date(),
): boolean {
  const s = yyyyMmDd.trim();
  if (!YYYY_MM_DD.test(s)) return false;
  const nextDayStart = startOfNextCalendarDayTaipei(s);
  return now.getTime() >= nextDayStart.getTime();
}

/**
 * 帶入 UPP 的 ExpireDate（YYYY-MM-DD）：**台北下單日 + 1 日**之日曆日（例：4/8 下單 → `2026-04-09`，繳費至 4/9 23:59:59 台北時間）。
 */
export function computePayuniExpireDateYyyyMmDd(now: Date = new Date()): string {
  const todayStr = formatYyyyMmDdTaipei(now);
  const nextDayStart = startOfNextCalendarDayTaipei(todayStr);
  return formatYyyyMmDdTaipei(nextDayStart);
}

/** PAYUNi `ExpireDate`（YYYY-MM-DD）對應之「截止後第一瞬間」UTC ISO，供寫入 `orders.payuni_expire_at` */
export function payuniExpireDateYyyyMmDdToUtcExclusiveEndIso(
  yyyyMmDd: string,
): string {
  return startOfNextCalendarDayTaipei(yyyyMmDd.trim()).toISOString();
}

/**
 * 依 **訂單成立時間（台北）** 套用與下單時相同之 1 日期限：下單日 +1 日曆日之 23:59:59 後逾期，
 * 即「該 ExpireDate 日」結束後第一瞬間（與 {@link computePayuniExpireDateYyyyMmDd} 送 UPP 之語意一致）。
 */
export function payuniExpireBoundaryUtcFromOrderCreatedAtTaipei(
  createdIso: string,
): Date {
  const expireDateYmd = computePayuniExpireDateYyyyMmDd(new Date(createdIso));
  return startOfNextCalendarDayTaipei(expireDateYmd);
}
