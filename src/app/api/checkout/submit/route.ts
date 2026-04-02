import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { randomUUID } from "crypto";

type ShippingMethod = "home" | "store";
type PaymentMethod = "credit" | "transfer" | "linepay";

type CheckoutItem = {
  id: string;
  quantity: number;
};

type CheckoutFormData = {
  name: string;
  phone: string;
  email: string;
  address: string;
};

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
      paymentMethod,
      formData,
      items,
    }: {
      shippingMethod: ShippingMethod;
      paymentMethod: PaymentMethod;
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
    const normalizedPaymentMethod: PaymentMethod = paymentMethod;

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

    const orderNumber = `ORD-${Date.now()}-${randomUUID().slice(0, 8)}`;

    const { data: orderRow, error: orderError } = await supabase
      .from("orders")
      .insert({
        user_id: user.id,
        order_number: orderNumber,
        recipient_name: formData.name,
        recipient_phone: formData.phone,
        recipient_email: formData.email,
        shipping_address:
          normalizedShippingMethod === "home" ? formData.address : null,
        shipping_method: normalizedShippingMethod,
        shipping_fee: shippingFee,
        subtotal,
        total,
        // 目前為前台「模擬支付」：直接標記 paid，讓 success 頁能看到正確狀態
        status: "paid",
        // notes 可依 paymentMethod 擴充
        notes: `payment=${normalizedPaymentMethod}`,
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

    return NextResponse.json({ orderId });
  } catch (e) {
    return NextResponse.json(
      { error: e instanceof Error ? e.message : "Unknown error" },
      { status: 500 },
    );
  }
}

