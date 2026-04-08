/** 與結帳頁「請輸入…」風格一致；供後台商品表單 client + server action 共用 */

export const MSG_PRODUCT_NAME_REQUIRED = "請填寫名稱";

/** 通過時回傳 undefined（與 server action 文案一致） */
export function validateProductNameField(raw: string): string | undefined {
  return raw.trim() === "" ? MSG_PRODUCT_NAME_REQUIRED : undefined;
}

export const MSG_INVALID_NUMBER = "請輸入有效的數字";

type NonNegIntLabels = {
  required: string;
  negative: string;
  notInteger: string;
};

/**
 * 非負整數：依序檢查空值 → 可解析為有限數字 → 不可為負 → 必須為整數（與小數分開提示）
 */
export function validateNonNegativeIntegerRaw(
  raw: string,
  labels: NonNegIntLabels,
): string | undefined {
  const t = raw.trim();
  if (t === "") return labels.required;
  const n = Number(t);
  if (!Number.isFinite(n)) return MSG_INVALID_NUMBER;
  if (n < 0) return labels.negative;
  if (!Number.isInteger(n)) return labels.notInteger;
  return undefined;
}

export function validatePriceField(raw: string): string | undefined {
  return validateNonNegativeIntegerRaw(raw, {
    required: "請輸入價格",
    negative: "價格不可為負數",
    notInteger: "價格須為整數",
  });
}

export function validateStockField(raw: string): string | undefined {
  return validateNonNegativeIntegerRaw(raw, {
    required: "請輸入庫存",
    negative: "庫存不可為負數",
    notInteger: "庫存須為整數",
  });
}

/** 列表顯示順序（display_order）：0 以上整數，可重複 */
export function validateDisplayOrderField(raw: string): string | undefined {
  return validateNonNegativeIntegerRaw(raw, {
    required: "請輸入顯示順序",
    negative: "顯示順序不可為負數",
    notInteger: "顯示順序須為整數",
  });
}

export function parsePriceStockFromForm(priceRaw: string, stockRaw: string) {
  return {
    price: Number.parseInt(priceRaw.trim(), 10),
    stock_quantity: Number.parseInt(stockRaw.trim(), 10),
  };
}

export function parseDisplayOrderFromForm(raw: string) {
  return Number.parseInt(raw.trim(), 10);
}
