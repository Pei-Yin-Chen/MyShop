import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatPayuniPaymentTypeForDisplay } from "@/lib/payuni/payment-channel";
import type { PayuniPaymentDetailStored } from "@/lib/payuni/payment-detail";
import { PayuniPaymentDetailSection } from "@/components/PayuniPaymentDetailSection";
import { PayuniResumePaymentButton } from "@/components/PayuniResumePaymentButton";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import {
  orderStatusBadgeProps,
  orderStatusLabel,
} from "@/lib/orders/order-status-display";
import { orderLogisticsStatusLabel } from "@/lib/orders/order-logistics-display";
import { shippingCarrierLabel } from "@/lib/orders/shipping-carriers";
import { shouldOfferPayuniResumePayment } from "@/lib/payuni/should-offer-resume-payment";

const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800";

type OrderRow = {
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
  recipient_phone: string;
  recipient_email: string;
  notes: string | null;
  customer_note: string | null;
  payuni_payment_type: string | null;
  payuni_payment_detail: PayuniPaymentDetailStored | null;
  payuni_expire_at: string | null;
  shipping_carrier: string | null;
  shipping_tracking_number: string | null;
  shipped_at: string | null;
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

function isPayuniPendingOrder(notes: string | null): boolean {
  const first = notes?.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return first === "payment=payuni";
}

export default async function MemberOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, total, subtotal, shipping_fee, shipping_method, shipping_address, status, recipient_name, recipient_phone, recipient_email, notes, customer_note, payuni_payment_type, payuni_payment_detail, payuni_expire_at, shipping_carrier, shipping_tracking_number, shipped_at",
    )
    .eq("id", id)
    .eq("user_id", user?.id ?? "")
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
  const logisticsLabel = orderLogisticsStatusLabel({
    shippingMethod: order.shipping_method,
    orderStatus: order.status,
    shippedAt: order.shipped_at,
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">訂單詳情</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/90">#{order.order_number}</span>
            <span className="hidden sm:inline">·</span>
            <span>{formatOrderDateTimeZh(order.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge {...orderStatusBadgeProps(order.status)}>
            {orderStatusLabel(order.status)}
          </Badge>
          <Button
            variant="outline"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/member/orders" />}
          >
            返回列表
          </Button>
        </div>
      </div>

      {order.status === "pending" &&
      isPayuniPendingOrder(order.notes) &&
      shouldOfferPayuniResumePayment(
        order.payuni_payment_type,
        order.payuni_payment_detail,
      ) ? (
        <Card className="border-amber-200/80 bg-amber-50/40 dark:border-amber-900/45 dark:bg-amber-950/25">
          <CardHeader className="pb-2">
            <CardTitle className="text-base font-semibold text-foreground">
              尚未完成付款？
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-muted-foreground leading-relaxed">
            <p>
              若您曾關閉付款分頁、尚未選擇付款方式，或離開後想繼續繳費，訂單仍保留為「待付款」。請點下方「繼續完成線上付款」開啟付款頁（商店訂單編號不變）。
            </p>
            <PayuniResumePaymentButton orderId={order.id} />
          </CardContent>
        </Card>
      ) : null}

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60">
          <CardTitle className="text-base font-semibold">商品明細</CardTitle>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
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
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium text-foreground truncate">
                    {item.product_name}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    NT$ {item.unit_price} · 數量 {item.quantity}
                  </p>
                </div>
                <p className="text-sm font-medium text-foreground tabular-nums">
                  NT$ {item.line_total}
                </p>
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
              <span className="font-medium text-foreground tabular-nums">
                NT$ {order.subtotal}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">運費</span>
              <span className="font-medium text-foreground tabular-nums">
                {order.shipping_fee === 0 ? "免運費" : `NT$ ${order.shipping_fee}`}
              </span>
            </div>
            <div className="flex justify-between text-base font-bold pt-2">
              <span>總計</span>
              <span className="text-primary tabular-nums">NT$ {order.total}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card className="border-border/60 shadow-sm">
          <CardHeader className="space-y-1">
            <CardTitle className="text-base font-semibold">收件與配送</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
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
                <span className="font-medium text-foreground text-right">
                  {order.shipping_address ?? "—"}
                </span>
              </div>
            )}
            <div className="flex justify-between gap-4 pt-1">
              <span className="text-muted-foreground">物流狀態</span>
              <span className="font-medium text-foreground">{logisticsLabel}</span>
            </div>
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
              </>
            ) : order.shipping_method === "store" && order.shipped_at ? (
              <div className="flex justify-between gap-4">
                <span className="text-muted-foreground">可取貨時間</span>
                <span className="text-right font-medium text-foreground">
                  {formatOrderDateTimeZh(order.shipped_at)}
                </span>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {userNote && (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold">備註</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground whitespace-pre-wrap">
              {userNote}
            </CardContent>
          </Card>
        )}

        <PayuniPaymentDetailSection
          detail={order.payuni_payment_detail}
          payuniExpireAtUtc={order.payuni_expire_at}
        />
      </div>
    </div>
  );
}

