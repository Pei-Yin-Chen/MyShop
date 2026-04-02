import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

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
};

type OrderItemRow = {
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
};

function formatDateTime(iso: string) {
  return new Date(iso).toLocaleString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function paymentLabelFromNotes(notes: string | null): string | null {
  const t = notes?.trim() ?? "";
  if (!t.startsWith("payment=")) return null;
  const method = t.slice("payment=".length).trim();
  switch (method) {
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
  if (t.startsWith("payment=")) return null;
  return t;
}

function statusLabel(status: string) {
  switch (status) {
    case "pending":
      return "待付款";
    case "paid":
      return "已付款";
    case "processing":
      return "處理中";
    case "shipped":
      return "已出貨";
    case "completed":
      return "已完成";
    case "cancelled":
      return "已取消";
    default:
      return status;
  }
}

function statusVariant(status: string): "default" | "secondary" | "destructive" | "outline" {
  switch (status) {
    case "paid":
    case "processing":
    case "shipped":
    case "completed":
      return "secondary";
    case "cancelled":
      return "destructive";
    default:
      return "outline";
  }
}

export default async function MemberOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, total, subtotal, shipping_fee, shipping_method, shipping_address, status, recipient_name, recipient_phone, recipient_email, notes",
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
  const paymentLabel = paymentLabelFromNotes(order.notes);
  const userNote = userNoteFromNotes(order.notes);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-foreground">訂單詳情</h1>
          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-muted-foreground">
            <span className="font-medium text-foreground/90">#{order.order_number}</span>
            <span className="hidden sm:inline">·</span>
            <span>{formatDateTime(order.created_at)}</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={statusVariant(order.status)}>{statusLabel(order.status)}</Badge>
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
      </div>
    </div>
  );
}

