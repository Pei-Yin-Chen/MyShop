import type { PayuniPaymentDetailStored } from "@/lib/payuni/payment-detail";
import { shouldShowPayuniOfflinePaymentDetail } from "@/lib/payuni/payment-detail";

/** PaymentType 數字或通路代碼：已選線下繳費（ATM／超商等） */
const OFFLINE_PAYUNI_TYPE_CODES = new Set([
  "VACC",
  "CVS",
  "BARCODE",
  "2",
  "3",
]);

/**
 * 是否顯示「繼續完成線上付款」：若已選 ATM／超商並已取得帳號或繳費代碼，則不顯示（避免與線下繳費重複開金流）。
 */
export function shouldOfferPayuniResumePayment(
  payuniPaymentType: string | null | undefined,
  payuniPaymentDetail: PayuniPaymentDetailStored | null | undefined,
): boolean {
  if (shouldShowPayuniOfflinePaymentDetail(payuniPaymentDetail)) {
    return false;
  }
  const t = payuniPaymentType?.trim();
  if (!t) return true;
  const u = t.toUpperCase();
  if (OFFLINE_PAYUNI_TYPE_CODES.has(u)) {
    return false;
  }
  if (/^\d+$/.test(t) && (t === "2" || t === "3")) {
    return false;
  }
  return true;
}
