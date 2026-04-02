import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ShoppingBag, ArrowRight, MapPin, Calendar, CreditCard } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
};

type OrderItemRow = {
  product_name: string;
  unit_price: number;
  quantity: number;
  line_total: number;
  image_url: string | null;
};

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
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

export default async function SuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  if (!orderId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold text-foreground">找不到訂單</h1>
            <p className="mt-2 text-muted-foreground">
              成功頁缺少訂單編號（orderId）。
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/cart" />}
              >
                回到購物車
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                回到商品
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const supabase = await createClient();

  const { data: order, error: orderError } = await supabase
    .from("orders")
    .select(
      "id, order_number, created_at, total, subtotal, shipping_fee, shipping_method, shipping_address, status, recipient_name",
    )
    .eq("id", orderId)
    .maybeSingle<OrderRow>();

  if (orderError || !order) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold text-foreground">訂單資料不可取得</h1>
            <p className="mt-2 text-muted-foreground">
              可能原因：RLS 權限不足，或 orderId 不存在。orderId：{orderId}
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                回到商品
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/cart" />}
              >
                查看購物車
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const { data: items } = await supabase
    .from("order_items")
    .select("product_name, unit_price, quantity, line_total, image_url")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true })
    .returns<OrderItemRow[]>();

  const safeItems = items ?? [];

  const paymentText = statusLabel(order.status);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow">
        <div className="container max-w-3xl mx-auto px-4 py-12 lg:py-20">
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4 animate-in zoom-in duration-500">
                <CheckCircle2 className="size-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">感謝您的訂購！</h1>
            <p className="text-muted-foreground leading-relaxed">
              我們已收到您的訂單，並為您處理後續流程。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    訂單編號：<span className="text-primary">#{order.order_number}</span>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">{formatDate(order.created_at)}</span>
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="p-6 space-y-6">
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
                          <h4 className="text-sm font-medium text-foreground truncate">{item.product_name}</h4>
                          <p className="text-xs text-muted-foreground">數量：{item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground tabular-nums">
                          NT$ {item.line_total}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">訂單小計</span>
                      <span className="font-medium text-foreground tabular-nums">NT$ {order.subtotal}</span>
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
                </div>

                <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <CreditCard className="size-4" />
                    付款狀態：{paymentText}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <ShoppingBag className="size-4" />
                    訂單狀態：{statusLabel(order.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-full bg-muted p-2 shrink-0">
                    <MapPin className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">配送資訊</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {order.shipping_method === "home"
                        ? `宅配至：${order.shipping_address ?? "—"}`
                        : "門市自取（將於通知後至指定店取貨）"}
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-full bg-muted p-2 shrink-0">
                    <Calendar className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">後續追蹤</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      您可以登入會員中心查看訂單進度。若有特殊需求，亦可於備註中說明。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button
                size="lg"
                className="h-11 rounded-full flex-1 font-semibold"
                render={<Link href="/products" />}
                nativeButton={false}
              >
                繼續購物
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-11 rounded-full flex-1 font-medium"
                render={<Link href="/" />}
                nativeButton={false}
              >
                回到首頁
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

