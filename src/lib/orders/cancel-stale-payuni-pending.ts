import { createServiceClient } from "@/lib/supabase/service";
import { payuniExpireBoundaryUtcFromOrderCreatedAtTaipei } from "@/lib/payuni/expire-date";
import { parsePayuniExpireDateRawToUtcExclusiveEnd } from "@/lib/payuni/expire-at";
import { shouldShowPayuniOfflinePaymentDetail } from "@/lib/payuni/payment-detail";

/** 統一金流結帳訂單（notes 首行 payment=payuni） */
export function isPayuniCheckoutOrderNotes(notes: string | null): boolean {
  const first = notes?.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return first === "payment=payuni";
}

function expireDateFromPayuniPaymentDetail(detail: unknown): string | null {
  if (!detail || typeof detail !== "object") return null;
  const o = detail as Record<string, unknown>;
  const v = o.expireDate ?? o.ExpireDate;
  if (typeof v !== "string") return null;
  const t = v.trim();
  return t || null;
}

/**
 * 建立訂單後，超過幾天仍 `pending` 則由排程取消（還原庫存）。
 * 環境變數 `STALE_PAYUNI_PENDING_DAYS`（正整數），未設定時預設 **1**（適合需盡快釋出庫存的品項）。
 */
export function getStalePayuniPendingDays(): number {
  const raw = process.env.STALE_PAYUNI_PENDING_DAYS;
  if (raw === undefined || raw.trim() === "") {
    return 1;
  }
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) {
    return 1;
  }
  if (n > 365) {
    return 365;
  }
  return n;
}

/**
 * 取消符合以下任一條件的 PAYUNi 待付款訂單（`notes` 首行 `payment=payuni`）：
 * 1. **建立時間**早於「現在 − STALE_PAYUNI_PENDING_DAYS」（預設 1 天）— 兜底（與日曆期限並存時會較早觸發）。
 * 2. **`payuni_expire_at`（UTC）已過** — 由 UPP ExpireDate／回傳期限換算。
 * 3. **僅線上、未取得 ATM／超商繳費代碼**（如信用卡失敗僅顯示 PAYUNi 線上）：**以訂單成立時間** 套用「下單日（台北）+1 日」之截止瞬間（與 PAYUNi 1 日期限一致）。
 * 4. **舊資料**（無 `payuni_expire_at` 但有 JSON `expireDate`）：以期限字串換算判斷。
 *
 * 需以 service role 呼叫 DB function `cancel_pending_order_restore_stock`。
 */
export async function runCancelStalePayuniPendingOrders(): Promise<{
  cancelled: number;
  orderIds: string[];
  staleAfterDays: number;
}> {
  const staleAfterDays = getStalePayuniPendingDays();
  const supabase = createServiceClient();
  const now = new Date();
  const cutoff = new Date(
    now.getTime() - staleAfterDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: rowsByAge, error: errAge } = await supabase
    .from("orders")
    .select("id, notes")
    .eq("status", "pending")
    .lt("created_at", cutoff);

  if (errAge) {
    throw new Error(errAge.message);
  }

  const { data: rowsByExpireAt, error: errEx } = await supabase
    .from("orders")
    .select("id, notes")
    .eq("status", "pending")
    .not("payuni_expire_at", "is", null)
    .lt("payuni_expire_at", now.toISOString());

  if (errEx) {
    throw new Error(errEx.message);
  }

  const { data: rowsDetailLegacy, error: errLegacy } = await supabase
    .from("orders")
    .select("id, notes, payuni_payment_detail")
    .eq("status", "pending")
    .is("payuni_expire_at", null)
    .not("payuni_payment_detail", "is", null);

  if (errLegacy) {
    throw new Error(errLegacy.message);
  }

  const { data: rowsPayuniOnline, error: errOnline } = await supabase
    .from("orders")
    .select("id, notes, created_at, payuni_payment_detail")
    .eq("status", "pending")
    .ilike("notes", "payment=payuni%");

  if (errOnline) {
    throw new Error(errOnline.message);
  }

  const toCancel = new Set<string>();

  for (const o of rowsByAge ?? []) {
    if (isPayuniCheckoutOrderNotes(o.notes)) {
      toCancel.add(o.id);
    }
  }

  for (const o of rowsByExpireAt ?? []) {
    if (isPayuniCheckoutOrderNotes(o.notes)) {
      toCancel.add(o.id);
    }
  }

  for (const o of rowsDetailLegacy ?? []) {
    if (!isPayuniCheckoutOrderNotes(o.notes)) continue;
    const exp = expireDateFromPayuniPaymentDetail(o.payuni_payment_detail);
    if (!exp) continue;
    const boundary = parsePayuniExpireDateRawToUtcExclusiveEnd(exp);
    if (boundary && now.getTime() >= boundary.getTime()) {
      toCancel.add(o.id);
    }
  }

  for (const o of rowsPayuniOnline ?? []) {
    if (!isPayuniCheckoutOrderNotes(o.notes)) continue;
    if (shouldShowPayuniOfflinePaymentDetail(o.payuni_payment_detail)) continue;
    const boundary = payuniExpireBoundaryUtcFromOrderCreatedAtTaipei(o.created_at);
    if (now.getTime() >= boundary.getTime()) {
      toCancel.add(o.id);
    }
  }

  const orderIds: string[] = [];

  for (const id of toCancel) {
    const { data: ok, error: rpcErr } = await supabase.rpc(
      "cancel_pending_order_restore_stock",
      { p_order_id: id },
    );

    if (rpcErr) {
      throw new Error(rpcErr.message);
    }
    if (ok === true) {
      orderIds.push(id);
    }
  }

  return { cancelled: orderIds.length, orderIds, staleAfterDays };
}
