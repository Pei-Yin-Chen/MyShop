import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyOrderSuccessAccessToken } from "@/lib/order-success-access";
import type { PayuniPaymentDetailStored } from "@/lib/payuni/payment-detail";

const ORDER_SELECT =
  "id, order_number, created_at, total, subtotal, shipping_fee, shipping_method, shipping_address, status, recipient_name, notes, user_id, payuni_payment_type, payuni_payment_detail, payuni_expire_at";

export type OrderSuccessRow = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  shipping_method: "home" | "store";
  shipping_address: string | null;
  status: string;
  recipient_name: string;
  notes: string | null;
  payuni_payment_type: string | null;
  payuni_payment_detail: PayuniPaymentDetailStored | null;
  payuni_expire_at: string | null;
};

export type OrderItemSuccessRow = {
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
};

export type LoadOrderSuccessResult =
  | { kind: "no_session" }
  | { kind: "not_found" }
  | { kind: "ok"; order: OrderSuccessRow; items: OrderItemSuccessRow[] };

async function loadItemsForOrder(
  orderId: string,
  supabase: Awaited<ReturnType<typeof createClient>>,
): Promise<OrderItemSuccessRow[]> {
  const itemsFirst = await supabase
    .from("order_items")
    .select("product_name, unit_price, quantity, line_total, image_url")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .returns<OrderItemSuccessRow[]>();

  let items = itemsFirst.data;
  if (!items?.length) {
    try {
      const svc = createServiceClient();
      const itemsSecond = await svc
        .from("order_items")
        .select("product_name, unit_price, quantity, line_total, image_url")
        .eq("order_id", orderId)
        .order("created_at", { ascending: true })
        .returns<OrderItemSuccessRow[]>();
      items = itemsSecond.data ?? [];
    } catch {
      items = items ?? [];
    }
  }
  return items ?? [];
}

/**
 * accessToken：由 /api/payuni/return 簽發並以 httpOnly Cookie 傳遞，金流導回無登入 Session 時仍可顯示訂單。
 */
export async function loadOrderForSuccessPage(
  orderId: string,
  accessToken?: string | null,
): Promise<LoadOrderSuccessResult> {
  if (accessToken) {
    const verified = verifyOrderSuccessAccessToken(accessToken);
    if (verified && verified.orderId === orderId) {
      try {
        const svc = createServiceClient();
        const { data: order } = await svc
          .from("orders")
          .select(ORDER_SELECT)
          .eq("id", orderId)
          .eq("user_id", verified.userId)
          .maybeSingle<OrderSuccessRow & { user_id: string }>();

        if (order && order.user_id === verified.userId) {
          const { user_id, ...orderPublic } = order;
          void user_id;
          const supabase = await createClient();
          const items = await loadItemsForOrder(orderId, supabase);
          return { kind: "ok", order: orderPublic, items };
        }
      } catch {
        /* misconfigured */
      }
      return { kind: "not_found" };
    }
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { kind: "no_session" };
  }

  let order: (OrderSuccessRow & { user_id: string }) | null = null;

  const first = await supabase
    .from("orders")
    .select(ORDER_SELECT)
    .eq("id", orderId)
    .maybeSingle<OrderSuccessRow & { user_id: string }>();

  order = first.data;

  if (!order) {
    try {
      const svc = createServiceClient();
      const second = await svc
        .from("orders")
        .select(ORDER_SELECT)
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle<OrderSuccessRow & { user_id: string }>();
      order = second.data;
    } catch {
      /* SUPABASE_SERVICE_ROLE_KEY 未設定 */
    }
  }

  if (!order || order.user_id !== user.id) {
    return { kind: "not_found" };
  }

  const { user_id, ...orderPublic } = order;
  void user_id;
  const items = await loadItemsForOrder(orderId, supabase);

  return {
    kind: "ok",
    order: orderPublic,
    items,
  };
}
