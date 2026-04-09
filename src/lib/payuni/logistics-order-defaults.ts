export type PayuniLgsTypeCode = "B2C" | "C2C" | "HOME" | "C2B";

/**
 * 訂單尚無 PAYUNi 快取時，依本店填寫的物流粗略推測 LgsType（僅供預設選項）。
 */
export function inferPayuniLgsTypeFromOrder(input: {
  shipping_method: "home" | "store";
  shipping_carrier: string | null;
}): PayuniLgsTypeCode {
  if (input.shipping_method === "home") {
    const c = input.shipping_carrier?.trim().toLowerCase() ?? "";
    if (c === "black_cat") return "HOME";
  }
  return "HOME";
}

export function normalizePayuniLgsType(
  stored: string | null | undefined,
  fallback: PayuniLgsTypeCode,
): PayuniLgsTypeCode {
  const u = (stored ?? "").trim().toUpperCase();
  if (u === "B2C" || u === "C2C" || u === "HOME" || u === "C2B") return u;
  return fallback;
}
