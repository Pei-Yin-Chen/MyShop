import { NextResponse } from "next/server";
import { runCancelStalePayuniPendingOrders } from "@/lib/orders/cancel-stale-payuni-pending";

export const dynamic = "force-dynamic";

function unauthorized() {
  return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
}

/**
 * 排程：取消仍待付款的 PAYUNi 訂單並還原庫存。條件見
 * `runCancelStalePayuniPendingOrders`（建立逾時、PAYUNi 期限、**僅線上**依訂單成立日 +1 日曆日等）。
 * 請設定 CRON_SECRET，並以 Header：`Authorization: Bearer <CRON_SECRET>` 呼叫。
 * Vercel Cron 會發 GET；亦可手動 POST 觸發。
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
    const result = await runCancelStalePayuniPendingOrders();
    return NextResponse.json({
      ok: true,
      ...result,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "Unknown error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
