import { revalidatePath } from "next/cache";
import { getPayuniConfig } from "@/lib/payuni/config";
import {
  buildLogisticsQueryEncryptFields,
  executePayuniLogisticsQuery,
  type PayuniLgsType,
} from "@/lib/payuni/logistics-query";
import { isPayuniLogisticsPayloadDelivered } from "@/lib/payuni/logistics-delivered";
import {
  inferPayuniLgsTypeFromOrder,
  normalizePayuniLgsType,
} from "@/lib/payuni/logistics-order-defaults";
import { createServiceClient } from "@/lib/supabase/service";

const LGS: PayuniLgsType[] = ["B2C", "C2C", "HOME", "C2B"];

type OrderSyncRow = {
  id: string;
  user_id: string | null;
  shipping_method: string;
  shipping_carrier: string | null;
  shipping_tracking_number: string | null;
  payuni_logistics_lgs_type: string | null;
  payuni_logistics_ship_trade_no: string | null;
  payuni_logistics_trade_type: string | null;
  payuni_logistics_return_odno: string | null;
};

const BATCH_LIMIT = 40;

/**
 * 宅配 HOME 查詢：與後台「PAYUNi 物流查詢」一致，未指定時視為正物流（1）。
 * 若 DB 為空則以前不帶 TradeType，易與手動選「正物流」的查詢結果不一致（甚至回傳查無資料）。
 */
function tradeTypeForHomeQuery(stored: string | null | undefined): 1 | 2 {
  const t = stored?.trim();
  if (t === "2") return 2;
  return 1;
}

/**
 * 以 PAYUNi 物流查詢 API 輪詢「宅配、已出貨、尚未送達」訂單；貨態為已送達時自動 completed + delivered_at。
 */
export async function runSyncPayuniDeliveredOrders(): Promise<{
  scanned: number;
  markedDelivered: number;
  skipped: number;
  errors: string[];
}> {
  const cfg = getPayuniConfig();
  if (!cfg) {
    return {
      scanned: 0,
      markedDelivered: 0,
      skipped: 0,
      errors: ["PAYUNi 未設定，略過"],
    };
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    return {
      scanned: 0,
      markedDelivered: 0,
      skipped: 0,
      errors: [`無法建立 service client：${msg}`],
    };
  }

  const { data: rows, error: qErr } = await supabase
    .from("orders")
    .select(
      "id, user_id, shipping_method, shipping_carrier, shipping_tracking_number, payuni_logistics_lgs_type, payuni_logistics_ship_trade_no, payuni_logistics_trade_type, payuni_logistics_return_odno",
    )
    .eq("shipping_method", "home")
    .eq("status", "shipped")
    .is("delivered_at", null)
    .not("shipped_at", "is", null)
    .order("shipped_at", { ascending: true })
    .limit(BATCH_LIMIT);

  if (qErr) {
    return {
      scanned: 0,
      markedDelivered: 0,
      skipped: 0,
      errors: [qErr.message],
    };
  }

  const list = (rows ?? []) as OrderSyncRow[];
  const errors: string[] = [];
  let markedDelivered = 0;
  let skipped = 0;

  for (const order of list) {
    const fallbackLgs = inferPayuniLgsTypeFromOrder({
      shipping_method: "home",
      shipping_carrier: order.shipping_carrier,
    });
    const lgsType = normalizePayuniLgsType(
      order.payuni_logistics_lgs_type,
      fallbackLgs,
    );
    if (!LGS.includes(lgsType)) {
      skipped += 1;
      continue;
    }

    const shipTradeNo =
      order.payuni_logistics_ship_trade_no?.trim() ||
      order.shipping_tracking_number?.trim() ||
      "";
    const returnOdno = order.payuni_logistics_return_odno?.trim() ?? "";

    if (lgsType === "C2B") {
      if (returnOdno.length !== 12) {
        skipped += 1;
        continue;
      }
    } else if (!shipTradeNo) {
      skipped += 1;
      continue;
    }

    const encryptFields = buildLogisticsQueryEncryptFields(cfg.merId, {
      lgsType,
      shipTradeNo: lgsType === "C2B" ? undefined : shipTradeNo,
      returnOdno: lgsType === "C2B" ? returnOdno : undefined,
      tradeType: lgsType === "HOME" ? tradeTypeForHomeQuery(order.payuni_logistics_trade_type) : undefined,
    });

    const result = await executePayuniLogisticsQuery(cfg, encryptFields);
    if (!result.ok) {
      errors.push(`${order.id}：${result.error}`);
      continue;
    }

    if (!isPayuniLogisticsPayloadDelivered(result.payload)) {
      continue;
    }

    const now = new Date().toISOString();
    const { error: updErr } = await supabase
      .from("orders")
      .update({
        status: "completed",
        delivered_at: now,
        updated_at: now,
      })
      .eq("id", order.id)
      .eq("status", "shipped")
      .is("delivered_at", null);

    if (updErr) {
      errors.push(`${order.id}：${updErr.message}`);
      continue;
    }

    revalidatePath(`/admin/orders/${order.id}`);
    revalidatePath(`/member/orders/${order.id}`);
    markedDelivered += 1;
  }

  return {
    scanned: list.length,
    markedDelivered,
    skipped,
    errors,
  };
}
