import { startOfNextCalendarDayTaipei } from "@/lib/payuni/expire-date";

const DATE_PREFIX = /^(\d{4}-\d{2}-\d{2})/;

/**
 * PAYUNi 回傳之繳費期限字串（常見：`YYYY-MM-DD` 或 `YYYY-MM-DD HH:mm:ss`，無時區時視為台北當地時間之日曆日）。
 * 回傳「該期限日曆日結束後」第一個瞬間（UTC），與 DB `payuni_expire_at` 一致。
 */
export function parsePayuniExpireDateRawToUtcExclusiveEnd(raw: string): Date | null {
  const s = raw.trim();
  const m = DATE_PREFIX.exec(s);
  if (!m) return null;
  const yyyyMmDd = m[1];
  return startOfNextCalendarDayTaipei(yyyyMmDd);
}

export function payuniExpireDateRawToUtcBoundaryIso(raw: string): string | null {
  const d = parsePayuniExpireDateRawToUtcExclusiveEnd(raw);
  return d ? d.toISOString() : null;
}
