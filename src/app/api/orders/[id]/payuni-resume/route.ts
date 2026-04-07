import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import {
  getAppBaseUrl,
  getPayuniConfig,
  getPayuniUppOptionalEncryptFields,
} from "@/lib/payuni/config";
import { generateMerTradeNo } from "@/lib/payuni/mer-trade-no";
import { buildUppPostBody } from "@/lib/payuni/upp";
import { createServiceClient } from "@/lib/supabase/service";

function isPayuniOrder(notes: string | null): boolean {
  const first = notes?.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return first === "payment=payuni";
}

/**
 * 待付款的 PAYUNi 訂單可再次 POST 至 UPP。
 * 每次重試使用新的 MerTradeNo 並寫入 payuni_mer_trade_no，避免平台短時間內拒絕重複單號。
 */
export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> },
) {
  try {
    const { id: orderId } = await context.params;
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json({ error: "請先登入" }, { status: 401 });
    }

    const payuniCfg = getPayuniConfig();
    if (!payuniCfg) {
      return NextResponse.json(
        { error: "尚未設定 PAYUNi" },
        { status: 503 },
      );
    }

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .select(
        "id, user_id, order_number, total, status, notes, recipient_email",
      )
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle<{
        id: string;
        user_id: string;
        order_number: string;
        total: number;
        status: string;
        notes: string | null;
        recipient_email: string;
      }>();

    if (orderError || !order) {
      return NextResponse.json({ error: "找不到訂單" }, { status: 404 });
    }

    if (order.status !== "pending") {
      return NextResponse.json(
        { error: "此訂單不是待付款狀態" },
        { status: 400 },
      );
    }

    if (!isPayuniOrder(order.notes)) {
      return NextResponse.json(
        { error: "此訂單非 PAYUNi 付款" },
        { status: 400 },
      );
    }

    const { data: itemRows, error: itemsError } = await supabase
      .from("order_items")
      .select("product_name, quantity")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true });

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 400 },
      );
    }

    const items = itemRows ?? [];
    if (items.length === 0) {
      return NextResponse.json(
        { error: "訂單無商品明細" },
        { status: 400 },
      );
    }

    const prodDescRaw = items
      .map((oi) => `${oi.product_name} * ${oi.quantity}`)
      .join(";");
    const prodDesc =
      prodDescRaw.length > 550 ? prodDescRaw.slice(0, 550) : prodDescRaw;

    const base = getAppBaseUrl();
    const payuniBackUrl = `${base}/checkout/payuni-back?orderId=${encodeURIComponent(order.id)}`;

    let serviceSupabase;
    try {
      serviceSupabase = createServiceClient();
    } catch {
      return NextResponse.json(
        { error: "伺服器未設定金流更新權限" },
        { status: 503 },
      );
    }

    const newMerTradeNo = generateMerTradeNo();
    const { data: updatedRow, error: merUpdateErr } = await serviceSupabase
      .from("orders")
      .update({ payuni_mer_trade_no: newMerTradeNo })
      .eq("id", order.id)
      .eq("user_id", user.id)
      .select("id")
      .maybeSingle();

    if (merUpdateErr || !updatedRow) {
      return NextResponse.json(
        { error: merUpdateErr?.message ?? "無法準備付款" },
        { status: 500 },
      );
    }

    const encryptFields = {
      MerID: payuniCfg.merId,
      MerTradeNo: newMerTradeNo,
      TradeAmt: order.total,
      Timestamp: Math.floor(Date.now() / 1000),
      TradeLExpireSec: 600,
      ProdDesc: prodDesc,
      ReturnURL: `${base}/api/payuni/return`,
      NotifyURL: `${base}/api/payuni/notify`,
      BackURL: payuniBackUrl,
      UsrMail: order.recipient_email,
      Lang: "zh-tw",
      ...getPayuniUppOptionalEncryptFields(),
    };

    const payuni = buildUppPostBody(payuniCfg, encryptFields);
    return NextResponse.json({
      payuni: {
        actionUrl: payuniCfg.uppUrl,
        fields: payuni,
      },
    });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}
