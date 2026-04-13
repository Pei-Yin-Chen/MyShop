import { NextResponse } from "next/server";
import { getPayuniConfig } from "@/lib/payuni/config";
import { decryptPayuniPayload, verifyPayuniHash } from "@/lib/payuni/crypto";
import { isPayuniPaymentSuccess } from "@/lib/payuni/payment-success";
import { extractPayuniPaymentType } from "@/lib/payuni/payment-channel";
import {
  extractPayuniPaymentDetailForStorage,
  hasPayuniPaymentDetailContent,
} from "@/lib/payuni/payment-detail";
import { findOrderByPayuniMerTradeNo } from "@/lib/payuni/find-order-by-mer-trade-no";
import { parsePayuniPostBody } from "@/lib/payuni/parse-post";
import { trySendPaymentSuccessNotificationEmailsOnce } from "@/lib/email/order-notifications";
import { createServiceClient } from "@/lib/supabase/service";
import { payuniExpireDateRawToUtcBoundaryIso } from "@/lib/payuni/expire-at";
import { extractPayuniLogisticsPatchFromNotify } from "@/lib/payuni/notify-logistics";

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

export async function POST(req: Request) {
  const cfg = getPayuniConfig();
  if (!cfg) {
    return new NextResponse("payuni not configured", { status: 503 });
  }

  let body: Record<string, string>;
  try {
    body = await parsePayuniPostBody(req);
  } catch {
    return new NextResponse("bad request", { status: 400 });
  }

  const encryptHex = body.EncryptInfo ?? body.encryptInfo ?? "";
  const hashInfo = body.HashInfo ?? body.hashInfo ?? "";
  if (!encryptHex || !hashInfo) {
    return new NextResponse("missing EncryptInfo or HashInfo", { status: 400 });
  }

  if (!verifyPayuniHash(encryptHex, hashInfo, cfg.hashKey, cfg.hashIv)) {
    return new NextResponse("hash mismatch", { status: 400 });
  }

  let decrypted: Record<string, string>;
  try {
    decrypted = decryptPayuniPayload(encryptHex, cfg.hashKey, cfg.hashIv);
  } catch {
    return new NextResponse("decrypt failed", { status: 400 });
  }

  const merId = pickField(decrypted, "MerID");
  if (merId && merId !== cfg.merId) {
    return new NextResponse("mer mismatch", { status: 400 });
  }

  const merTradeNo = pickField(decrypted, "MerTradeNo");
  if (!merTradeNo) {
    return new NextResponse("missing MerTradeNo", { status: 400 });
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return new NextResponse("server misconfigured", { status: 500 });
  }

  const { data: orderRow, error: fetchErr } = await findOrderByPayuniMerTradeNo(
    supabase,
    merTradeNo,
    "id, total, status, payuni_payment_type",
  );

  const order = orderRow as {
    id: string;
    total: number;
    status: string;
    payuni_payment_type: string | null;
  } | null;

  if (fetchErr || !order) {
    return new NextResponse("order not found", { status: 404 });
  }

  if (!isPayuniPaymentSuccess(decrypted)) {
    return new NextResponse("OK", { status: 200 });
  }

  const tradeAmt = Number(pickField(decrypted, "TradeAmt"));
  if (!Number.isFinite(tradeAmt) || tradeAmt !== Number(order.total)) {
    return new NextResponse("amount mismatch", { status: 400 });
  }

  const paymentType = extractPayuniPaymentType(decrypted);
  const detailJson = extractPayuniPaymentDetailForStorage(decrypted);
  const logisticsPatch = extractPayuniLogisticsPatchFromNotify(decrypted);
  const now = new Date().toISOString();

  if (order.status === "pending") {
    const update: Record<string, unknown> = {
      status: "paid",
      updated_at: now,
    };
    Object.assign(update, logisticsPatch);
    if (paymentType) update.payuni_payment_type = paymentType;
    if (hasPayuniPaymentDetailContent(detailJson)) {
      update.payuni_payment_detail = detailJson;
      const rawExp =
        typeof detailJson.expireDate === "string"
          ? detailJson.expireDate.trim()
          : "";
      if (rawExp) {
        const iso = payuniExpireDateRawToUtcBoundaryIso(rawExp);
        if (iso) update.payuni_expire_at = iso;
      }
    }

    const { error: updErr } = await supabase
      .from("orders")
      .update(update)
      .eq("id", order.id);

    if (updErr) {
      return new NextResponse("db error", { status: 500 });
    }

    await trySendPaymentSuccessNotificationEmailsOnce(supabase, order.id);
  } else if (order.status === "paid") {
    const patch: Record<string, unknown> = { updated_at: now, ...logisticsPatch };
    if (paymentType && !order.payuni_payment_type) {
      patch.payuni_payment_type = paymentType;
    }
    if (hasPayuniPaymentDetailContent(detailJson)) {
      patch.payuni_payment_detail = detailJson;
      const rawExp =
        typeof detailJson.expireDate === "string"
          ? detailJson.expireDate.trim()
          : "";
      if (rawExp) {
        const iso = payuniExpireDateRawToUtcBoundaryIso(rawExp);
        if (iso) patch.payuni_expire_at = iso;
      }
    }
    if (Object.keys(patch).length > 1) {
      const { error: patchErr } = await supabase
        .from("orders")
        .update(patch)
        .eq("id", order.id);
      if (patchErr) {
        return new NextResponse("db error", { status: 500 });
      }
    }
  }

  return new NextResponse("OK", { status: 200 });
}
