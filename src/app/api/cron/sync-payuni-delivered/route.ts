import { revalidatePath } from "next/cache";
import { NextResponse } from "next/server";
import { runSyncPayuniDeliveredOrders } from "@/lib/orders/sync-payuni-delivered-orders";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * 排程：以 PAYUNi 物流查詢 API 檢查「宅配、已出貨、尚未送達」訂單，若貨態為已送達則自動
 * `completed` + `delivered_at`。
 *
 * 需已設定 PAYUNi（MER_ID / HASH_KEY / IV）與 `SUPABASE_SERVICE_ROLE_KEY`。
 * 黑貓若**未**經 PAYUNi 產生之 UNi 物流序號，查詢可能失敗；請以 Notify 寫入之 ShipTradeNo
 * 或與查詢一致之追蹤號碼為準。
 *
 * 預設以 ShipStatus `11` 視為送達；可設 `PAYUNI_LOGISTICS_DELIVERED_SHIP_STATUS=11,…`（逗號分隔）。
 *
 * Header：`Authorization: Bearer <CRON_SECRET>`（與其他 cron 相同）。
 */
export async function GET(req: Request) {
  return handleCron(req);
}

export async function POST(req: Request) {
  return handleCron(req);
}

async function handleCron(req: Request) {
  const secret = process.env.CRON_SECRET;
  const auth = req.headers.get("authorization");
  if (!secret || auth !== `Bearer ${secret}`) {
    return unauthorized();
  }

  try {
    const result = await runSyncPayuniDeliveredOrders();
    if (result.markedDelivered > 0) {
      revalidatePath("/admin/orders");
      revalidatePath("/member/orders");
    }
    return NextResponse.json({
      ok: true as const,
      ...result,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false as const, error: message }, { status: 500 });
  }
}
