/**
 * 依 PAYUNi 物流查詢 API 解密後 payload 判斷是否為「已送達／已取件」。
 *
 * 官方文件常見 **ShipStatus** 狀態碼（節錄）：`11`＝買家已取貨或收件（含黑貓宅配送達等情境）。
 * 實際代碼請以 https://www.payuni.com.tw 文件為準；可用環境變數擴充。
 *
 * @see https://www.payuni.com.tw/docs/web/（物流查詢／貨態）
 */

const DEFAULT_DELIVERED_SHIP_STATUS_CODES = new Set(["11"]);

function parseShipStatusCodesFromEnv(): Set<string> {
  const raw = String(process.env.PAYUNI_LOGISTICS_DELIVERED_SHIP_STATUS ?? "").trim();
  if (!raw) return DEFAULT_DELIVERED_SHIP_STATUS_CODES;
  const set = new Set<string>();
  for (const part of raw.split(",")) {
    const t = part.trim();
    if (t) set.add(t);
  }
  return set.size > 0 ? set : DEFAULT_DELIVERED_SHIP_STATUS_CODES;
}

/**
 * 若 PAYUNi 回傳 ShipStatus 為設定的「送達」代碼，或 ShipStatusDesc 含明確送達關鍵字，則視為已送達。
 */
export function isPayuniLogisticsPayloadDelivered(
  payload: Record<string, string>,
): boolean {
  const codes = parseShipStatusCodesFromEnv();
  const shipStatus = String(payload.ShipStatus ?? payload.shipStatus ?? "").trim();
  if (shipStatus && codes.has(shipStatus)) {
    return true;
  }

  const desc = String(payload.ShipStatusDesc ?? payload.shipStatusDesc ?? "").trim();
  if (!desc) return false;
  /** 後備：文件未列代碼時，中文說明常含「送達／簽收／取件」 */
  const deliveredHints = ["送達", "簽收", "已取件", "取貨完成", "配達"];
  return deliveredHints.some((h) => desc.includes(h));
}
