import { createServiceClient } from "@/lib/supabase/service";

/** 統一金流結帳訂單（notes 首行 payment=payuni） */
export function isPayuniCheckoutOrderNotes(notes: string | null): boolean {
  const first = notes?.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return first === "payment=payuni";
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
 * 取消「建立超過 getStalePayuniPendingDays() 天仍待付款」的 PAYUNi 訂單。
 * 需以 service role 呼叫 DB function `cancel_pending_order_restore_stock`。
 */
export async function runCancelStalePayuniPendingOrders(): Promise<{
  cancelled: number;
  orderIds: string[];
  staleAfterDays: number;
}> {
  const staleAfterDays = getStalePayuniPendingDays();
  const supabase = createServiceClient();
  const cutoff = new Date(
    Date.now() - staleAfterDays * 24 * 60 * 60 * 1000,
  ).toISOString();

  const { data: rows, error } = await supabase
    .from("orders")
    .select("id, notes")
    .eq("status", "pending")
    .lt("created_at", cutoff);

  if (error) {
    throw new Error(error.message);
  }

  const candidates = (rows ?? []).filter((o) =>
    isPayuniCheckoutOrderNotes(o.notes),
  );

  const orderIds: string[] = [];

  for (const row of candidates) {
    const { data: ok, error: rpcErr } = await supabase.rpc(
      "cancel_pending_order_restore_stock",
      { p_order_id: row.id },
    );

    if (rpcErr) {
      throw new Error(rpcErr.message);
    }
    if (ok === true) {
      orderIds.push(row.id);
    }
  }

  return { cancelled: orderIds.length, orderIds, staleAfterDays };
}
