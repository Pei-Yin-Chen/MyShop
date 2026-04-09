/** 後台出貨可選物流公司（value 存於 orders.shipping_carrier） */
export const SHIPPING_CARRIER_OPTIONS = [
  { value: "black_cat", label: "黑貓宅急便" },
  { value: "hct", label: "新竹物流 HCT" },
  { value: "sf", label: "順豐速運" },
  { value: "post", label: "中華郵政" },
  { value: "kerry", label: "嘉里大榮" },
  { value: "fedex", label: "FedEx" },
  { value: "dhl", label: "DHL" },
  { value: "other", label: "其他" },
] as const;

export type ShippingCarrierCode = (typeof SHIPPING_CARRIER_OPTIONS)[number]["value"];

const CARRIER_LABEL_BY_VALUE = Object.fromEntries(
  SHIPPING_CARRIER_OPTIONS.map((o) => [o.value, o.label]),
) as Record<string, string>;

export function shippingCarrierLabel(code: string | null | undefined): string {
  if (!code?.trim()) return "—";
  return CARRIER_LABEL_BY_VALUE[code] ?? code;
}

export function isValidShippingCarrier(code: string): code is ShippingCarrierCode {
  return SHIPPING_CARRIER_OPTIONS.some((o) => o.value === code);
}
