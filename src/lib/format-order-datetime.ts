/** DB timestamptz 為 UTC；顯示一律轉 **Asia/Taipei**（商店當地時間） */
const DISPLAY_TZ = "Asia/Taipei";

/**
 * 訂單時間顯示：YYYY/MM/DD HH:mm（台北時區，24 小時制）
 */
export function formatOrderDateTimeZh(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "—";
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: DISPLAY_TZ,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  const y = parts.find((p) => p.type === "year")?.value;
  const m = parts.find((p) => p.type === "month")?.value;
  const day = parts.find((p) => p.type === "day")?.value;
  const h = parts.find((p) => p.type === "hour")?.value;
  const min = parts.find((p) => p.type === "minute")?.value;
  if (!y || !m || !day || !h || !min) return "—";
  return `${y}/${m}/${day} ${h}:${min}`;
}

/**
 * `payuni_expire_at`（截止後第一瞬間，UTC）對應「最後可繳費時刻」顯示（台北）。
 */
export function formatPayuniExpireBeforeUtc(isoUtc: string): string {
  const boundary = new Date(isoUtc);
  if (Number.isNaN(boundary.getTime())) return "—";
  const lastValid = new Date(boundary.getTime() - 1);
  return formatOrderDateTimeZh(lastValid.toISOString());
}
