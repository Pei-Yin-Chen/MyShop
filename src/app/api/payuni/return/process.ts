import { NextResponse } from "next/server";
import { getPayuniConfig } from "@/lib/payuni/config";
import { decryptPayuniPayload, verifyPayuniHash } from "@/lib/payuni/crypto";
import {
  createOrderSuccessAccessToken,
  redirectToCheckoutSuccessWithAccess,
  redirectToPaymentFailedWithAccess,
} from "@/lib/order-success-access";
import { isPayuniPaymentSuccess } from "@/lib/payuni/payment-success";
import { extractPayuniPaymentType } from "@/lib/payuni/payment-channel";
import {
  extractPayuniPaymentDetailForStorage,
  hasPayuniPaymentDetailContent,
  isPendingOfflinePaymentInstruction,
} from "@/lib/payuni/payment-detail";
import { findOrderByPayuniMerTradeNo } from "@/lib/payuni/find-order-by-mer-trade-no";
import { createServiceClient } from "@/lib/supabase/service";
import { payuniExpireDateRawToUtcBoundaryIso } from "@/lib/payuni/expire-at";

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

function originFromRequest(req: Request) {
  return new URL(req.url).origin;
}

export async function processPayuniReturn(
  req: Request,
  body: Record<string, string>,
): Promise<NextResponse> {
  const origin = originFromRequest(req);

  const cfg = getPayuniConfig();
  if (!cfg) {
    return NextResponse.redirect(new URL("/checkout?pay=config", origin));
  }

  const encryptHex = body.EncryptInfo ?? body.encryptInfo ?? "";
  const hashInfo = body.HashInfo ?? body.hashInfo ?? "";
  if (!encryptHex || !hashInfo) {
    return NextResponse.redirect(new URL("/checkout?pay=missing", origin));
  }

  if (!verifyPayuniHash(encryptHex, hashInfo, cfg.hashKey, cfg.hashIv)) {
    return NextResponse.redirect(new URL("/checkout?pay=hash", origin));
  }

  let decrypted: Record<string, string>;
  try {
    decrypted = decryptPayuniPayload(encryptHex, cfg.hashKey, cfg.hashIv);
  } catch {
    return NextResponse.redirect(new URL("/checkout?pay=decrypt", origin));
  }

  const merId = pickField(decrypted, "MerID");
  if (merId && merId !== cfg.merId) {
    return NextResponse.redirect(new URL("/checkout?pay=mer", origin));
  }

  const merTradeNo = pickField(decrypted, "MerTradeNo");
  if (!merTradeNo) {
    return NextResponse.redirect(new URL("/checkout?pay=noorder", origin));
  }

  let supabase;
  try {
    supabase = createServiceClient();
  } catch {
    return NextResponse.redirect(new URL("/checkout?pay=server", origin));
  }

  const { data: orderRow, error: orderLookupErr } =
    await findOrderByPayuniMerTradeNo(
      supabase,
      String(merTradeNo),
      "id, total, status, user_id, payuni_payment_type",
    );

  const order = orderRow as {
    id: string;
    total: number;
    status: string;
    user_id: string | null;
    payuni_payment_type: string | null;
  } | null;

  if (orderLookupErr || !order) {
    return NextResponse.redirect(new URL("/checkout?pay=unknown", origin));
  }

  const uid = order.user_id as string | null;
  let access = "";
  try {
    if (uid) {
      access = createOrderSuccessAccessToken(order.id, uid);
    }
  } catch {
    /* 未設定 secret 時改依賴登入 Session */
  }

  const tradeAmtRaw = pickField(decrypted, "TradeAmt");
  const tradeAmt = Number(tradeAmtRaw);
  const orderTotal = Number(order.total);

  if (!Number.isFinite(tradeAmt) || tradeAmt !== orderTotal) {
    return redirectToPaymentFailedWithAccess(req, origin, order.id, access, {
      reason: "amt",
    });
  }

  const paymentType = extractPayuniPaymentType(decrypted);
  const detailJson = extractPayuniPaymentDetailForStorage(decrypted);
  const now = new Date().toISOString();

  const basePatch: Record<string, unknown> = { updated_at: now };
  if (hasPayuniPaymentDetailContent(detailJson)) {
    basePatch.payuni_payment_detail = detailJson;
    const rawExp =
      typeof detailJson.expireDate === "string"
        ? detailJson.expireDate.trim()
        : "";
    if (rawExp) {
      const iso = payuniExpireDateRawToUtcBoundaryIso(rawExp);
      if (iso) basePatch.payuni_expire_at = iso;
    }
  }
  if (paymentType) {
    basePatch.payuni_payment_type = paymentType;
  }

  /** ATM／超商：尚未繳費完成但已取得帳號／代碼 */
  if (isPendingOfflinePaymentInstruction(decrypted, detailJson)) {
    await supabase.from("orders").update(basePatch).eq("id", order.id);
    return redirectToCheckoutSuccessWithAccess(req, origin, order.id, access);
  }

  if (isPayuniPaymentSuccess(decrypted)) {
    if (order.status === "pending") {
      const { error: updErr } = await supabase
        .from("orders")
        .update({
          status: "paid",
          ...basePatch,
        })
        .eq("id", order.id);
      if (updErr) {
        return redirectToCheckoutSuccessWithAccess(req, origin, order.id, access, {
          pay: "db",
        });
      }
    } else if (order.status === "paid") {
      if (
        (paymentType && !order.payuni_payment_type) ||
        hasPayuniPaymentDetailContent(detailJson)
      ) {
        await supabase.from("orders").update(basePatch).eq("id", order.id);
      }
    }

    return redirectToCheckoutSuccessWithAccess(req, origin, order.id, access);
  }

  return redirectToPaymentFailedWithAccess(req, origin, order.id, access, {
    reason: "failed",
  });
}
