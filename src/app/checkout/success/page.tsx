import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { CheckCircle2, ShoppingBag, ArrowRight, MapPin, Calendar, CreditCard } from "lucide-react";
import { ORDER_SUCCESS_ACCESS_COOKIE_NAME } from "@/lib/order-success-access";
import { loadOrderForSuccessPage } from "@/lib/supabase/load-order-success";
import { formatPayuniPaymentTypeForDisplay } from "@/lib/payuni/payment-channel";
import { PayuniPaymentDetailSection } from "@/components/PayuniPaymentDetailSection";
import { ClearPayuniSession } from "@/app/checkout/success/clear-payuni-session";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";

const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800";

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
  searchParams: Promise<{ orderId?: string; pay?: string; access?: string }>;
}) {
  const { orderId, pay: payFlag, access: accessFromQuery } = await searchParams;
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

  const cookieStore = await cookies();
  const accessToken =
    cookieStore.get(ORDER_SUCCESS_ACCESS_COOKIE_NAME)?.value ??
    accessFromQuery ??
    undefined;

  const result = await loadOrderForSuccessPage(orderId, accessToken);

  if (result.kind === "no_session") {
    const back = encodeURIComponent(`/checkout/success?orderId=${orderId}`);
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-grow">
          <div className="container mx-auto max-w-lg px-4 py-16">
            <h1 className="text-2xl font-bold text-foreground">請先登入</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              從金流返回時瀏覽器可能未帶入登入 Cookie。請登入與結帳相同的帳號後即可查看；若剛完成付款，登入後訂單應為「已付款」。
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href={`/login?redirectTo=${back}`} />}
              >
                登入並查看訂單
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/member/orders" />}
              >
                會員中心訂單
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (result.kind === "not_found") {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold text-foreground">訂單資料不可取得</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              找不到此訂單，或訂單不屬於目前登入帳號。請確認訂單編號，或至會員中心查看訂單列表。
            </p>
            <p className="mt-2 text-xs text-muted-foreground font-mono break-all">
              orderId：{orderId}
            </p>
            <div className="mt-6 flex gap-3 flex-wrap">
              <Button
                size="lg"
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/member/orders" />}
              >
                我的訂單
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

  const order = result.order;
  const safeItems = result.items;

  const paymentText = statusLabel(order.status);
  const payuniMethodLabel = formatPayuniPaymentTypeForDisplay(
    order.payuni_payment_type,
  );

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ClearPayuniSession />
      <main className="flex-grow">
        <div className="container max-w-3xl mx-auto px-4 py-12 lg:py-20">
          {payFlag === "db" && (
            <div className="mb-6 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-3 text-sm text-amber-950 dark:text-amber-100">
              付款狀態可能尚未寫入資料庫，請稍候至會員中心確認；若長時間仍為待付款請聯絡客服。
            </div>
          )}
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4 animate-in zoom-in duration-500">
                <CheckCircle2 className="size-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">感謝您的訂購！</h1>
            <p className="text-muted-foreground leading-relaxed">
              {order.status === "pending" && order.payuni_payment_detail
                ? "訂單已成立，請於下方期限內完成繳費；繳費完成後訂單將自動更新為已付款。"
                : "我們已收到您的訂單，並為您處理後續流程。"}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    訂單編號：<span className="text-primary">#{order.order_number}</span>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">{formatOrderDateTimeZh(order.created_at)}</span>
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

                <div className="bg-primary/5 px-6 py-4 flex flex-col gap-2 border-t border-primary/10 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <CreditCard className="size-4 shrink-0" />
                    <span>
                      付款狀態：{paymentText}
                      {payuniMethodLabel ? (
                        <span className="block text-xs font-normal text-muted-foreground mt-0.5">
                          付款方式：{payuniMethodLabel}
                        </span>
                      ) : null}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <ShoppingBag className="size-4" />
                    訂單狀態：{statusLabel(order.status)}
                  </div>
                </div>
              </CardContent>
            </Card>

            <PayuniPaymentDetailSection detail={order.payuni_payment_detail} />

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
