import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAppBaseUrl, getPayuniConfig, getPayuniUppOptionalEncryptFields } from "@/lib/payuni/config";
import { generateMerTradeNo } from "@/lib/payuni/mer-trade-no";
import { buildUppPostBody } from "@/lib/payuni/upp";

type ShippingMethod = "home" | "store";

type CheckoutItem = {
  id: string;
  quantity: number;
};

type CheckoutFormData = {
  name: string;
  phone: string;
  email: string;
  address: string;
  orderNote?: string;
};

/** 與結帳頁 maxLength 一致 */
const MAX_CUSTOMER_NOTE_LENGTH = 500;

function sanitizeCustomerNote(input: string | undefined): string | null {
  const t = input?.trim() ?? "";
  if (!t) return null;
  return t.slice(0, MAX_CUSTOMER_NOTE_LENGTH);
}

function normalizePhone(input: string) {
  return String(input ?? "").replace(/\D/g, "");
}

type ProductRow = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number | null;
  status: string;
  image_url: string | null;
};

export async function POST(req: Request) {
  try {
    const supabase = await createClient();

    const {
      shippingMethod,
      formData,
      items,
    }: {
      shippingMethod: ShippingMethod;
      formData: CheckoutFormData;
      items: CheckoutItem[];
    } = await req.json();

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: "購物車為空" },
        { status: 400 },
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.json(
        { error: "請先登入再結帳" },
        { status: 401 },
      );
    }

    const normalizedShippingMethod: ShippingMethod =
      shippingMethod === "store" ? "store" : "home";

    const itemIds = Array.from(
      new Set(items.map((i) => i.id)),
    );

    const { data: productRows, error: productError } = await supabase
      .from("products")
      .select("id, name, price, stock_quantity, status, image_url")
      .in("id", itemIds);

    if (productError) {
      return NextResponse.json(
        { error: productError.message },
        { status: 400 },
      );
    }

    const productsById = new Map(
      (productRows ?? []).map((p) => [String(p.id), p as ProductRow]),
    );

    // 先驗證：商品狀態、庫存是否足夠（避免先下單後扣庫存失敗）
    let subtotal = 0;
    const orderItemsPayload: {
      product_id: string;
      product_name: string;
      unit_price: number;
      quantity: number;
      line_total: number;
      image_url: string | null;
    }[] = [];

    for (const it of items) {
      const p = productsById.get(it.id);
      if (!p) {
        return NextResponse.json(
          { error: "商品不存在" },
          { status: 400 },
        );
      }
      if (p.status !== "active") {
        return NextResponse.json(
          { error: "部分商品已下架" },
          { status: 400 },
        );
      }

      const qty = Math.floor(Number(it.quantity));
      if (!Number.isFinite(qty) || qty <= 0) {
        return NextResponse.json(
          { error: "商品數量不正確" },
          { status: 400 },
        );
      }

      const stock = Number(p.stock_quantity ?? 0);
      if (stock < qty) {
        return NextResponse.json(
          { error: `商品 ${p.name} 庫存不足` },
          { status: 400 },
        );
      }

      const unitPrice = Number(p.price);
      subtotal += unitPrice * qty;
      orderItemsPayload.push({
        product_id: it.id,
        product_name: String(p.name),
        unit_price: unitPrice,
        quantity: qty,
        line_total: unitPrice * qty,
        image_url: p.image_url ?? null,
      });
    }

    const shippingFee =
      normalizedShippingMethod === "store"
        ? 0
        : subtotal >= 1000
          ? 0
          : 150;
    const total = subtotal + shippingFee;

    const payuniCfg = getPayuniConfig();
    if (!payuniCfg) {
      return NextResponse.json(
        {
          error:
            "尚未設定 PAYUNi（請設定 PAYUNI_MER_ID、PAYUNI_HASH_KEY、PAYUNI_HASH_IV）",
        },
        { status: 503 },
      );
    }

    const orderNumber = generateMerTradeNo();

    const phoneDigits = normalizePhone(formData.phone);

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        payuni_mer_trade_no: orderNumber,
        recipient_name: formData.name,
        recipient_phone: phoneDigits,
        recipient_email: formData.email,
        shipping_address:
          normalizedShippingMethod === "home" ? formData.address : null,
        shipping_method: normalizedShippingMethod,
        shipping_fee: shippingFee,
        subtotal,
        total,
        status: "pending",
        notes: "payment=payuni",
        customer_note: sanitizeCustomerNote(formData.orderNote),
      })
      .select("id")
      .single();

    if (orderError) {
      return NextResponse.json(
        { error: orderError.message },
        { status: 400 },
      );
    }

    if (!orderRow?.id) {
      return NextResponse.json(
        { error: "建立訂單失敗" },
        { status: 500 },
      );
    }

    const orderId = orderRow.id as string;

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(
        orderItemsPayload.map((oi) => ({
          order_id: orderId,
          product_id: oi.product_id,
          product_name: oi.product_name,
          unit_price: oi.unit_price,
          quantity: oi.quantity,
          line_total: oi.line_total,
          image_url: oi.image_url,
        })),
      );

    if (itemsError) {
      return NextResponse.json(
        { error: itemsError.message },
        { status: 400 },
      );
    }

    // 扣庫存：使用驗證時取得的 stock_quantity 計算新庫存
    const stockUpdates = orderItemsPayload.map((oi) => {
      const p = productsById.get(oi.product_id);
      const currentStock = Number(p?.stock_quantity ?? 0);
      const nextStock = currentStock - oi.quantity;
      return { id: oi.product_id, nextStock };
    });

    const { error: stockError } = await Promise.all(
      stockUpdates.map((u) =>
        supabase
          .from("products")
          .update({ stock_quantity: u.nextStock })
          .eq("id", u.id),
      ),
    )
      .then((results) => {
        const anyErr = results.find((r) => r.error);
        return { error: anyErr?.error ?? null };
      })
      .catch((e) => ({ error: e as Error }));

    if (stockError) {
      // 盡量保護前端：若庫存扣減失敗，先回報錯誤
      return NextResponse.json(
        { error: "扣庫存失敗，請稍後再試" },
        { status: 400 },
      );
    }

    const base = getAppBaseUrl();
    /** 付款頁「返回商店」導向（勿用空購物車 /cart，改為引導至訂單說明） */
    const payuniBackUrl = `${base}/checkout/payuni-back?orderId=${encodeURIComponent(orderId)}`;

    const prodDescRaw = orderItemsPayload
      .map((oi) => `${oi.product_name} * ${oi.quantity}`)
      .join(";");
    const prodDesc =
      prodDescRaw.length > 550 ? prodDescRaw.slice(0, 550) : prodDescRaw;

    const encryptFields = {
      MerID: payuniCfg.merId,
      MerTradeNo: orderNumber,
      TradeAmt: total,
      Timestamp: Math.floor(Date.now() / 1000),
      /** 付款頁交易截止秒數（文件 60–600，未帶則預設 600）；明確帶入避免與後台預設解讀不一致 */
      TradeLExpireSec: 600,
      ProdDesc: prodDesc,
      ReturnURL: `${base}/api/payuni/return`,
      NotifyURL: `${base}/api/payuni/notify`,
      BackURL: payuniBackUrl,
      UsrMail: formData.email,
      Lang: "zh-tw",
      ...getPayuniUppOptionalEncryptFields(),
    };

    try {
      const payuni = buildUppPostBody(payuniCfg, encryptFields);
      return NextResponse.json({
        orderId,
        payuni: {
          actionUrl: payuniCfg.uppUrl,
          fields: payuni,
        },
      });
    } catch (e) {
      return NextResponse.json(
        {
          error:
            e instanceof Error
              ? e.message
              : "建立 PAYUNi 付款資料失敗",
        },
        { status: 500 },
      );
    }
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

