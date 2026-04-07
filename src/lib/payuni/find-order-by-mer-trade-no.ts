import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * PAYUNi 回傳的 MerTradeNo 可能為初次下單的 order_number，或重試付款時寫入的 payuni_mer_trade_no。
 */
export async function findOrderByPayuniMerTradeNo(
  supabase: SupabaseClient,
  merTradeNo: string,
  select: string,
): Promise<{ data: unknown; error: { message: string } | null }> {
  const { data: byOrderNumber, error: e1 } = await supabase
    .from("orders")
    .select(select)
    .eq("order_number", merTradeNo)
    .maybeSingle();

  if (e1) {
    return { data: null, error: { message: e1.message } };
  }
  if (byOrderNumber) {
    return { data: byOrderNumber, error: null };
  }

  const { data: byAlias, error: e2 } = await supabase
    .from("orders")
    .select(select)
    .eq("payuni_mer_trade_no", merTradeNo)
    .maybeSingle();

  if (e2) {
    return { data: null, error: { message: e2.message } };
  }
  return { data: byAlias, error: null };
}
