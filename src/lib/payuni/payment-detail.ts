import { isPayuniPaymentSuccess } from "@/lib/payuni/payment-success";

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

/** 寫入 DB 的結構（camelCase） */
export type PayuniPaymentDetailStored = {
  tradeStatus?: string;
  status?: string;
  bankType?: string;
  payNo?: string;
  expireDate?: string;
  store?: string;
  payBank?: string;
  account5No?: string;
  payTime?: string;
  message?: string;
};

/**
 * 從 PAYUNi 解密後 EncryptInfo 抽出可保存之繳費資訊（ATM／超商等）。
 */
export function extractPayuniPaymentDetailForStorage(
  decrypted: Record<string, string>,
): PayuniPaymentDetailStored {
  const out: PayuniPaymentDetailStored = {};
  const ts = pickField(decrypted, "TradeStatus");
  if (ts) out.tradeStatus = ts;
  const st = pickField(decrypted, "Status");
  if (st) out.status = st;
  const bankType = pickField(decrypted, "BankType");
  if (bankType) out.bankType = bankType;
  const payNo = pickField(decrypted, "PayNo");
  if (payNo) out.payNo = payNo;
  const expireDate = pickField(decrypted, "ExpireDate");
  if (expireDate) out.expireDate = expireDate;
  const store = pickField(decrypted, "Store");
  if (store) out.store = store;
  const payBank = pickField(decrypted, "PayBank");
  if (payBank) out.payBank = payBank;
  const account5No = pickField(decrypted, "Account5No");
  if (account5No) out.account5No = account5No;
  const payTime = pickField(decrypted, "PayTime");
  if (payTime) out.payTime = payTime;
  const message = pickField(decrypted, "Message");
  if (message) out.message = message;
  return out;
}

export function hasPayuniPaymentDetailContent(
  d: PayuniPaymentDetailStored,
): boolean {
  return Object.keys(d).length > 0;
}

/**
 * 成功頁／訂單詳情：僅當有 ATM／超商等「線下繳費代碼或帳號」時才顯示繳費資訊區塊。
 * 信用卡等即時授權仍會寫入 message／tradeStatus 等，不應套用 ATM 版型。
 */
export function shouldShowPayuniOfflinePaymentDetail(
  detail: PayuniPaymentDetailStored | null | undefined,
): boolean {
  if (!detail || Object.keys(detail).length === 0) return false;
  if (detail.payNo?.trim()) return true;
  if (detail.store?.trim()) return true;
  if (detail.account5No?.trim()) return true;
  return false;
}

/**
 * 尚未付款成功，但已取得 ATM／超商繳費資訊（可導向成功頁顯示待繳款說明）。
 */
export function isPendingOfflinePaymentInstruction(
  decrypted: Record<string, string>,
  detail: PayuniPaymentDetailStored,
): boolean {
  if (isPayuniPaymentSuccess(decrypted)) return false;
  const payNo = detail.payNo || pickField(decrypted, "PayNo");
  if (!payNo) return false;
  const pmt = pickField(decrypted, "PaymentType");
  if (pmt === "2" || pmt === "3") return true;
  if (pickField(decrypted, "VACC") === "1") return true;
  if (pickField(decrypted, "CVS") === "1") return true;
  if (detail.bankType || detail.store) return true;
  return false;
}
