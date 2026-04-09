import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { fetchUserIsAdmin } from "@/lib/supabase/is-admin";
import { getPayuniConfig } from "@/lib/payuni/config";
import {
  buildLogisticsQueryEncryptFields,
  executePayuniLogisticsQuery,
  type PayuniLgsType,
} from "@/lib/payuni/logistics-query";

const LGS_TYPES = new Set<PayuniLgsType>(["B2C", "C2C", "HOME", "C2B"]);

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export async function POST(
  req: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id: orderId } = await context.params;
  if (!UUID_RE.test(orderId)) {
    return NextResponse.json({ error: "無效的訂單 ID" }, { status: 400 });
  }

  const cfg = getPayuniConfig();
  if (!cfg) {
    return NextResponse.json({ error: "PAYUNi 未設定（請設定 MER_ID / HASH_KEY / HASH_IV）" }, { status: 503 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "未登入" }, { status: 401 });
  }
  if (!(await fetchUserIsAdmin(supabase, user.id))) {
    return NextResponse.json({ error: "需要管理員權限" }, { status: 403 });
  }

  const { data: orderRow, error: orderErr } = await supabase
    .from("orders")
    .select("id")
    .eq("id", orderId)
    .maybeSingle();
  if (orderErr || !orderRow) {
    return NextResponse.json({ error: "找不到訂單" }, { status: 404 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "無效的 JSON" }, { status: 400 });
  }

  const b = body as Record<string, unknown>;

  const lgsTypeRaw = String(b.lgsType ?? "").trim().toUpperCase();
  if (!LGS_TYPES.has(lgsTypeRaw as PayuniLgsType)) {
    return NextResponse.json({ error: "無效的物流型態" }, { status: 400 });
  }
  const lgsType = lgsTypeRaw as PayuniLgsType;

  const shipTradeNo = String(b.shipTradeNo ?? "").trim();
  const returnOdno = String(b.returnOdno ?? "").trim();
  const tradeTypeRaw = b.tradeType;

  if (lgsType === "C2B") {
    if (returnOdno.length !== 12) {
      return NextResponse.json(
        { error: "退貨便須提供 12 碼編號（8 碼單號＋4 碼驗證碼）" },
        { status: 400 },
      );
    }
  } else if (!shipTradeNo) {
    return NextResponse.json(
      { error: "請填寫 UNi 物流序號（ShipTradeNo）" },
      { status: 400 },
    );
  }

  let tradeType: 1 | 2 | undefined;
  if (lgsType === "HOME" && tradeTypeRaw != null && String(tradeTypeRaw).trim() !== "") {
    const n = Number(tradeTypeRaw);
    if (n !== 1 && n !== 2) {
      return NextResponse.json({ error: "宅配類別須為 1（正物流）或 2（逆物流）" }, { status: 400 });
    }
    tradeType = n as 1 | 2;
  }

  const encryptFields = buildLogisticsQueryEncryptFields(cfg.merId, {
    lgsType,
    shipTradeNo: lgsType === "C2B" ? undefined : shipTradeNo,
    returnOdno: lgsType === "C2B" ? returnOdno : undefined,
    tradeType,
  });

  const result = await executePayuniLogisticsQuery(cfg, encryptFields);
  if (!result.ok) {
    return NextResponse.json({ error: result.error }, { status: 422 });
  }

  return NextResponse.json({ ok: true as const, payload: result.payload });
}
