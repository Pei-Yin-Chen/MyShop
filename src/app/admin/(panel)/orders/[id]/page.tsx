import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { formatPayuniPaymentTypeForDisplay } from "@/lib/payuni/payment-channel";
import type { PayuniPaymentDetailStored } from "@/lib/payuni/payment-detail";
import { PayuniPaymentDetailSection } from "@/components/PayuniPaymentDetailSection";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import {
  orderStatusBadgeVariant,
  orderStatusLabel,
} from "@/lib/orders/order-status-display";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";

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
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  if (!UUID_RE.test(id)) {
    notFound();
  }

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, user_id, order_number, created_at, total, subtotal, shipping_fee, shipping_method, shipping_address, status, recipient_name, recipient_phone, recipient_email, notes, customer_note, payuni_payment_type, payuni_payment_detail, payuni_expire_at",
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

  const backToMemberHref = `/admin/members/${order.user_id}`;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-3">
        <AdminBackToListLink
          href={backToMemberHref}
          ariaLabel="返回該會員詳細頁"
          title="返回該會員詳細頁"
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 gap-y-1">
            <h1 className="text-2xl font-bold text-foreground">訂單詳情</h1>
            <Badge variant={orderStatusBadgeVariant(order.status)}>
              {orderStatusLabel(order.status)}
            </Badge>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/90">#{order.order_number}</span>
            <span className="hidden sm:inline">·</span>
            <span>{formatOrderDateTimeZh(order.created_at)}</span>
          </div>
        </div>
      </div>

      <Card className="border-border/60 shadow-sm overflow-hidden">
        <CardHeader className="bg-muted/30 border-b border-border/60">
          <CardTitle className="text-base font-semibold">商品明細（購買紀錄）</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6 p-6">
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
                <span className="text-right font-medium text-foreground">
                  {order.shipping_address ?? "—"}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {userNote ? (
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="space-y-1">
              <CardTitle className="text-base font-semibold">備註</CardTitle>
            </CardHeader>
            <CardContent className="whitespace-pre-wrap text-sm text-muted-foreground">{userNote}</CardContent>
          </Card>
        ) : null}

        <PayuniPaymentDetailSection
          detail={order.payuni_payment_detail}
          payuniExpireAtUtc={order.payuni_expire_at}
        />
      </div>
    </div>
  );
}
