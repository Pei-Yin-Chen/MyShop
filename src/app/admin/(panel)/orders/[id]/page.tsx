import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPayuniPaymentTypeForDisplay } from "@/lib/payuni/payment-channel";
import {
  shouldShowPayuniOfflinePaymentDetail,
  type PayuniPaymentDetailStored,
} from "@/lib/payuni/payment-detail";
import { getPayuniConfig } from "@/lib/payuni/config";
import {
  inferPayuniLgsTypeFromOrder,
  normalizePayuniLgsType,
} from "@/lib/payuni/logistics-order-defaults";
import { PayuniPaymentDetailSection } from "@/components/PayuniPaymentDetailSection";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import {
  orderStatusBadgeProps,
  orderStatusLabel,
} from "@/lib/orders/order-status-display";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminOrderProcessingForm } from "@/components/admin/AdminOrderProcessingForm";
import { AdminOrderShipButton } from "@/components/admin/AdminOrderShipButton";
import { AdminOrderStoreMarkCompleteButton } from "@/components/admin/AdminOrderStoreMarkCompleteButton";
import { AdminPayuniLogisticsQueryButton } from "@/components/admin/AdminPayuniLogisticsQueryButton";
import { orderLogisticsStatusLabel } from "@/lib/orders/order-logistics-display";
import { shippingCarrierLabel } from "@/lib/orders/shipping-carriers";
import { cn } from "@/lib/utils";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800";

type OrderRow = {
  id: string;
  user_id: string;
  order_number: string;
  created_at: string;
  total: number;
  subtotal: number;
  shipping_fee: number;
  shipping_method: "home" | "store";
  shipping_address: string | null;
  status: string;
  recipient_name: string;
  recipient_phone: string;
  recipient_email: string;
  notes: string | null;
  customer_note: string | null;
  payuni_payment_type: string | null;
  payuni_payment_detail: PayuniPaymentDetailStored | null;
  payuni_expire_at: string | null;
  admin_note_body: string | null;
  admin_note_handling_status: string;
  shipping_carrier: string | null;
  shipping_tracking_number: string | null;
  shipped_at: string | null;
  payuni_logistics_lgs_type: string | null;
  payuni_logistics_ship_trade_no: string | null;
  payuni_logistics_trade_type: string | null;
  payuni_logistics_return_odno: string | null;
};

type OrderItemRow = {
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
};

function paymentLabelFromNotes(notes: string | null): string | null {
  const t = notes?.trim() ?? "";
  if (!t.startsWith("payment=")) return null;
  const firstLine = t.split(/\r?\n/, 1)[0]?.trim() ?? "";
  const method = firstLine.slice("payment=".length).trim();
  switch (method) {
    case "payuni":
      return "PAYUNi 線上付款";
    case "credit":
      return "信用卡 / 簽帳金融卡";
    case "transfer":
      return "銀行轉帳";
    case "linepay":
      return "LINE Pay";
    default:
      return method || null;
  }
}

function userNoteFromNotes(notes: string | null): string | null {
  const t = notes?.trim() ?? "";
  if (!t) return null;
  if (!t.startsWith("payment=")) return t;
  const nl = t.search(/\r?\n/);
  if (nl === -1) return null;
  const rest = t.slice(nl).replace(/^\r?\n+/, "").trim();
  return rest || null;
}

export default async function AdminOrderDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ from?: string }>;
}) {
  const { id } = await params;
  const sp = await searchParams;
  const fromMember = sp.from === "member";
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, user_id, order_number, created_at, total, subtotal, shipping_fee, shipping_method, shipping_address, status, recipient_name, recipient_phone, recipient_email, notes, customer_note, payuni_payment_type, payuni_payment_detail, payuni_expire_at, admin_note_body, admin_note_handling_status, shipping_carrier, shipping_tracking_number, shipped_at, payuni_logistics_lgs_type, payuni_logistics_ship_trade_no, payuni_logistics_trade_type, payuni_logistics_return_odno",
    )
    .eq("id", id)
    .maybeSingle<OrderRow>();

  if (orderError) {
    notFound();
  }

  if (!order) {
    notFound();
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, unit_price, quantity, line_total, image_url")
    .eq("order_id", order.id)
    .order("created_at", { ascending: true })
    .returns<OrderItemRow[]>();

  const safeItems = items ?? [];
  const paymentLabel =
    formatPayuniPaymentTypeForDisplay(order.payuni_payment_type) ??
    paymentLabelFromNotes(order.notes);
  const userNote =
    order.customer_note?.trim() || userNoteFromNotes(order.notes);

  const showPayuniDetail = shouldShowPayuniOfflinePaymentDetail(order.payuni_payment_detail);
  const hasRecipientRightColumn = !!(userNote || showPayuniDetail);

  const backHref =
    fromMember && order.user_id
      ? `/admin/members/${order.user_id}`
      : "/admin/orders";
  const backAria = fromMember && order.user_id ? "返回該會員詳細頁" : "返回訂單列表";
  const backTitle = backAria;

  const logisticsLabel = orderLogisticsStatusLabel({
    shippingMethod: order.shipping_method,
    orderStatus: order.status,
    shippedAt: order.shipped_at,
  });
  const showFulfillmentAction =
    (order.status === "paid" || order.status === "processing") && !order.shipped_at;
  const showStoreMarkCompleteAction =
    order.shipping_method === "store" && order.status === "shipped";
  const showPayuniLogisticsQuery = getPayuniConfig() !== null;
  const payuniLgsFallback = inferPayuniLgsTypeFromOrder({
    shipping_method: order.shipping_method,
    shipping_carrier: order.shipping_carrier,
  });
  const defaultPayuniLgsType = order.payuni_logistics_return_odno?.trim()
    ? normalizePayuniLgsType(order.payuni_logistics_lgs_type, "C2B")
    : normalizePayuniLgsType(order.payuni_logistics_lgs_type, payuniLgsFallback);
  /** PAYUNi 快取優先；無則帶入「追蹤號碼」（多數情境與託運單號／查詢用序號一致，若不符可於彈窗內改） */
  const defaultPayuniShipTradeNo =
    order.payuni_logistics_ship_trade_no?.trim() ||
    order.shipping_tracking_number?.trim() ||
    "";
  const payuniShipTradeFromTracking =
    !order.payuni_logistics_ship_trade_no?.trim() &&
    Boolean(order.shipping_tracking_number?.trim());
  const defaultPayuniReturnOdno = order.payuni_logistics_return_odno?.trim() ?? "";
  const defaultPayuniTradeType =
    order.payuni_logistics_trade_type === "1" || order.payuni_logistics_trade_type === "2"
      ? order.payuni_logistics_trade_type
      : "";

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <AdminBackToListLink href={backHref} ariaLabel={backAria} title={backTitle} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h1 className="text-2xl font-bold text-foreground">訂單詳情</h1>
            <Badge {...orderStatusBadgeProps(order.status)}>
              {orderStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/90">#{order.order_number}</span>
            <span className="hidden sm:inline">·</span>
            <span>{formatOrderDateTimeZh(order.created_at)}</span>
          </div>
          <p className="mt-1 font-mono text-xs text-muted-foreground break-all">{order.id}</p>
        </div>
      </div>

      <Card className="border border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">訂單處理</CardTitle>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-0 sm:px-6">
          <AdminOrderProcessingForm
            orderId={order.id}
            currentStatus={order.status}
            adminNoteBody={order.admin_note_body}
            adminNoteHandlingStatus={order.admin_note_handling_status ?? "none"}
          />
        </CardContent>
      </Card>

      <div className="flex min-w-0 flex-col gap-6">
        <Card className="border border-border/80 shadow-sm overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">商品明細（購買紀錄）</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6 px-4 pb-4 pt-0 sm:px-6">
            <div className="space-y-4">
              {safeItems.map((item, idx) => (
                <div key={`${item.product_name}-${idx}`} className="flex items-center gap-4">
                  <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
                    <Image
                      src={item.image_url ?? IMAGE_PLACEHOLDER}
                      alt={item.product_name}
                      fill
                      className="object-cover"
                    />
                  </div>
                  <div className="min-w-0 flex-1">
                    <h4 className="truncate text-sm font-medium text-foreground">{item.product_name}</h4>
                    <p className="text-xs text-muted-foreground">
                      NT$ {item.unit_price} · 數量 {item.quantity}
                    </p>
                  </div>
                  <p className="text-sm font-medium text-foreground tabular-nums">NT$ {item.line_total}</p>
                </div>
              ))}
              {safeItems.length === 0 && (
                <p className="text-sm text-muted-foreground">此訂單沒有商品明細。</p>
              )}
            </div>

            <Separator />

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">小計</span>
                <span className="font-medium text-foreground tabular-nums">NT$ {order.subtotal}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">運費</span>
                <span className="font-medium text-foreground tabular-nums">
                  {order.shipping_fee === 0 ? "免運費" : `NT$ ${order.shipping_fee}`}
                </span>
              </div>
              <div className="flex justify-between pt-2 text-base font-bold">
                <span>總計</span>
                <span className="text-primary tabular-nums">NT$ {order.total}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div
          className={cn(
            "grid gap-6",
            hasRecipientRightColumn ? "lg:grid-cols-2" : "lg:grid-cols-1",
          )}
        >
            <Card
              className={cn(
                "border border-border/80 shadow-sm",
                !hasRecipientRightColumn && "lg:col-span-2",
              )}
            >
              <CardHeader className="pb-2">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <CardTitle className="text-lg">收件與配送</CardTitle>
                  <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:flex-wrap sm:justify-end">
                    {showFulfillmentAction ? (
                      <AdminOrderShipButton
                        orderId={order.id}
                        variant={order.shipping_method === "home" ? "ship" : "store_pickup"}
                      />
                    ) : null}
                    {showStoreMarkCompleteAction ? (
                      <AdminOrderStoreMarkCompleteButton orderId={order.id} />
                    ) : null}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-2 px-4 pb-4 pt-0 text-sm sm:px-6">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between sm:gap-4">
                  <div className="flex min-w-0 flex-1 items-center justify-between gap-2 sm:justify-start sm:gap-3">
                    <span className="shrink-0 text-muted-foreground">物流狀態</span>
                    <span className="font-medium text-foreground">{logisticsLabel}</span>
                  </div>
                  {showPayuniLogisticsQuery ? (
                    <AdminPayuniLogisticsQueryButton
                      orderId={order.id}
                      className="shrink-0 sm:ml-auto"
                      defaultLgsType={defaultPayuniLgsType}
                      defaultShipTradeNo={defaultPayuniShipTradeNo}
                      defaultReturnOdno={defaultPayuniReturnOdno}
                      defaultTradeType={defaultPayuniTradeType}
                      shipTradePrefilledFromTracking={payuniShipTradeFromTracking}
                    />
                  ) : null}
                </div>
                {!order.shipped_at ? <Separator className="my-3" /> : null}
                {order.shipping_method === "home" && order.shipped_at ? (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">物流公司</span>
                      <span className="text-right font-medium text-foreground">
                        {shippingCarrierLabel(order.shipping_carrier)}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">追蹤號碼</span>
                      <span className="break-all text-right font-mono text-xs font-medium text-foreground sm:text-sm">
                        {order.shipping_tracking_number ?? "—"}
                      </span>
                    </div>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">出貨時間</span>
                      <span className="text-right font-medium text-foreground">
                        {formatOrderDateTimeZh(order.shipped_at)}
                      </span>
                    </div>
                    <Separator className="my-3" />
                  </>
                ) : null}
                {order.shipping_method === "store" && order.shipped_at ? (
                  <>
                    <div className="flex justify-between gap-4">
                      <span className="text-muted-foreground">可取貨時間</span>
                      <span className="text-right font-medium text-foreground">
                        {formatOrderDateTimeZh(order.shipped_at)}
                      </span>
                    </div>
                    <Separator className="my-3" />
                  </>
                ) : null}
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">收件人</span>
                  <span className="font-medium text-foreground">{order.recipient_name}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">電話</span>
                  <span className="font-medium text-foreground">{order.recipient_phone}</span>
                </div>
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">Email</span>
                  <span className="font-medium text-foreground">{order.recipient_email}</span>
                </div>
                {paymentLabel && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">付款方式</span>
                    <span className="font-medium text-foreground">{paymentLabel}</span>
                  </div>
                )}
                <Separator className="my-3" />
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">運送方式</span>
                  <span className="font-medium text-foreground">
                    {order.shipping_method === "home" ? "宅配" : "門市自取"}
                  </span>
                </div>
                {order.shipping_method === "home" && (
                  <div className="flex justify-between gap-4">
                    <span className="text-muted-foreground">地址</span>
                    <span className="text-right font-medium text-foreground">
                      {order.shipping_address ?? "—"}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>

            {hasRecipientRightColumn ? (
              <div className="flex min-w-0 flex-col gap-6">
                {userNote ? (
                  <Card className="border border-border/80 shadow-sm">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-lg">備註</CardTitle>
                    </CardHeader>
                    <CardContent className="whitespace-pre-wrap px-4 pb-4 pt-0 text-sm text-muted-foreground sm:px-6">
                      {userNote}
                    </CardContent>
                  </Card>
                ) : null}
                <PayuniPaymentDetailSection
                  detail={order.payuni_payment_detail}
                  payuniExpireAtUtc={order.payuni_expire_at}
                  className="border border-border/80 shadow-sm"
                />
              </div>
            ) : null}
        </div>
      </div>
    </div>
  );
}
