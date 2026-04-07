/**
 * PAYUNi UPP 付款完成後，EncryptInfo 解密欄位中的付款方式。
 * 文件以 PaymentType 或各通路參數（CREDIT=1、VACC=1…）表示；實際鍵名可能大小寫不一，故寬鬆比對。
 */

function pickField(d: Record<string, string>, ...names: string[]): string {
  for (const n of names) {
    const v = d[n];
    if (v !== undefined && v !== null && String(v) !== "") {
      return String(v).trim();
    }
    const found = Object.keys(d).find((k) => k.toLowerCase() === n.toLowerCase());
    if (found !== undefined && d[found] != null && String(d[found]) !== "") {
      return String(d[found]).trim();
    }
  }
  return "";
}

function isTruthyFlag(v: string): boolean {
  const t = v.trim();
  return t === "1" || t.toUpperCase() === "Y" || t.toUpperCase() === "TRUE";
}

/**
 * PAYUNi 回傳 EncryptInfo 的 PaymentType 數字代碼（參考官方整合範例／WooCommerce 外掛註解）。
 * 1=信用卡、2=ATM、3=超商代碼、6=愛金卡、7=AFTEE、9=LINE Pay…
 */
const PAYMENT_TYPE_NUMERIC_TO_CHANNEL: Record<string, string> = {
  "1": "CREDIT",
  "2": "VACC",
  "3": "CVS",
  "6": "ICASH",
  "7": "AFTEE",
  "9": "LINEPAY",
};

/**
 * PaymentType=1（信用卡）時，AuthType 可區分錢包／銀聯（參考 PAYUNi 範例）。
 * 0=無 1=一次 2=分期 3=紅利 4=Apple Pay 5=Google Pay 6=Samsung Pay 7=銀聯
 */
const CREDIT_AUTH_TYPE_TO_CHANNEL: Record<string, string> = {
  "4": "APPLEPAY",
  "5": "GOOGLEPAY",
  "6": "SAMSUNGPAY",
  "7": "CREDIT_UNIONPAY",
};

/** 與 UPP 請求／回傳常見的通路鍵名一致（大寫） */
const PAYUNI_CHANNEL_FLAG_KEYS = [
  "CREDIT",
  "LINEPAY",
  "APPLEPAY",
  "GOOGLEPAY",
  "VACC",
  "CVS",
  "BARCODE",
  "ICASH",
  "ESUNWALLET",
  "JKOPAY",
  "AFTEE",
  "TAIWANPAY",
  "BITO",
  "SAMSUNGPAY",
] as const;

/**
 * 從解密後的 EncryptInfo 取得單一代碼字串（大寫），供寫入 orders.payuni_payment_type。
 */
export function extractPayuniPaymentType(
  decrypted: Record<string, string>,
): string | null {
  const direct = pickField(
    decrypted,
    "PaymentType",
    "PayType",
    "PaymentMethod",
  );
  if (direct) {
    const trimmed = direct.trim();
    if (/^\d+$/.test(trimmed)) {
      if (trimmed === "1") {
        const authRaw = pickField(decrypted, "AuthType");
        const auth = authRaw.replace(/^0+(?=\d)/, "") || authRaw;
        if (auth && CREDIT_AUTH_TYPE_TO_CHANNEL[auth]) {
          return CREDIT_AUTH_TYPE_TO_CHANNEL[auth];
        }
        return "CREDIT";
      }
      const mapped = PAYMENT_TYPE_NUMERIC_TO_CHANNEL[trimmed];
      if (mapped) return mapped;
    }
    const u = trimmed.toUpperCase();
    if (u && u !== "0") return u;
  }

  for (const key of PAYUNI_CHANNEL_FLAG_KEYS) {
    const v = pickField(decrypted, key);
    if (v && isTruthyFlag(v)) return key;
  }

  return null;
}

const DISPLAY: Record<string, string> = {
  CREDIT: "信用卡",
  LINEPAY: "LINE Pay",
  APPLEPAY: "Apple Pay",
  GOOGLEPAY: "Google Pay",
  VACC: "ATM 轉帳",
  CVS: "超商代碼",
  BARCODE: "超商條碼",
  ICASH: "愛金卡 iCash",
  ESUNWALLET: "玉山 Wallet",
  JKOPAY: "街口支付",
  AFTEE: "AFTEE 先享後付",
  TAIWANPAY: "台灣 Pay",
  BITO: "BitoPay",
  SAMSUNGPAY: "Samsung Pay",
  CREDIT_UNIONPAY: "銀聯卡",
};

/** 已寫入 DB 的純數字 PaymentType（舊資料）對應顯示 */
function numericCodeToDisplay(numeric: string): string | null {
  const ch = PAYMENT_TYPE_NUMERIC_TO_CHANNEL[numeric];
  if (!ch) return null;
  return DISPLAY[ch] ?? ch;
}

/** 後台／會員頁顯示用 */
export function formatPayuniPaymentTypeForDisplay(
  code: string | null | undefined,
): string | null {
  if (!code?.trim()) return null;
  const raw = code.trim();
  if (/^\d+$/.test(raw)) {
    return numericCodeToDisplay(raw) ?? raw;
  }
  const u = raw.toUpperCase();
  return DISPLAY[u] ?? raw;
}
