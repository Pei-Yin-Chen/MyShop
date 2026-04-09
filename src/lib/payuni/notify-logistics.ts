const LGS = new Set(["B2C", "C2C", "HOME", "C2B"]);

function pickField(d: Record<string, string>, ...names: string[]): string {
  for (const n of names) {
    const v = d[n];
    if (v !== undefined && v != null && String(v).trim() !== "") {
      return String(v).trim();
    }
    const found = Object.keys(d).find((k) => k.toLowerCase() === n.toLowerCase());
    if (found !== undefined && d[found] != null && String(d[found]).trim() !== "") {
      return String(d[found]).trim();
    }
  }
  return "";
}

/**
 * 若 PAYUNi Notify EncryptInfo 含物流序號等欄位，寫入訂單供後台查詢預填。
 */
export function extractPayuniLogisticsPatchFromNotify(
  decrypted: Record<string, string>,
): Record<string, string> {
  const out: Record<string, string> = {};
  const shipTradeNo = pickField(decrypted, "ShipTradeNo");
  if (shipTradeNo) out.payuni_logistics_ship_trade_no = shipTradeNo;

  const lgs = pickField(decrypted, "LgsType").toUpperCase();
  if (lgs && LGS.has(lgs)) out.payuni_logistics_lgs_type = lgs;

  const tt = pickField(decrypted, "TradeType");
  if (tt === "1" || tt === "2") out.payuni_logistics_trade_type = tt;

  const ro = pickField(decrypted, "ReturnOdno");
  if (ro.length === 12) out.payuni_logistics_return_odno = ro;

  return out;
}
