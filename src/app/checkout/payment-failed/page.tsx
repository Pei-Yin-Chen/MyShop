import Link from "next/link";
import Image from "next/image";
import { cookies } from "next/headers";
import { CircleAlert } from "lucide-react";
import { ORDER_SUCCESS_ACCESS_COOKIE_NAME } from "@/lib/order-success-access";
import { loadOrderForSuccessPage } from "@/lib/supabase/load-order-success";
import { ClearPayuniSession } from "@/app/checkout/success/clear-payuni-session";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PayuniResumePaymentButton } from "@/components/PayuniResumePaymentButton";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import { shouldOfferPayuniResumePayment } from "@/lib/payuni/should-offer-resume-payment";

const IMAGE_PLACEHOLDER =
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&q=80&w=800";

const MSG_FAILED =
  "此筆付款未成功（例如卡號錯誤、驗證失敗或銀行拒絕）。訂單仍為「待付款」，可點下方按鈕再開統一金流，或登入後至訂單內操作。";
const MSG_AMT =
  "回傳金額與訂單不符，請勿重複操作付款；請聯絡客服並提供訂單編號。";

function isPayuniPendingOrder(notes: string | null): boolean {
  const first = notes?.trim().split(/\r?\n/, 1)[0]?.trim() ?? "";
  return first === "payment=payuni";
}

export default async function PaymentFailedPage({
  searchParams,
}: {
  searchParams: Promise<{
    orderId?: string;
    reason?: string;
    access?: string;
  }>;
}) {
  const { orderId, reason, access: accessFromQuery } = await searchParams;
  const reasonNorm = reason === "amt" ? "amt" : "failed";

  if (!orderId) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-grow">
          <div className="container mx-auto px-4 py-16">
            <h1 className="text-2xl font-bold text-foreground">找不到訂單</h1>
            <p className="mt-2 text-muted-foreground">此頁缺少訂單編號。</p>
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
                render={<Link href="/" />}
              >
                回到首頁
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
    const back = encodeURIComponent(`/checkout/payment-failed?orderId=${orderId}`);
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <main className="flex-grow">
          <div className="container mx-auto max-w-lg px-4 py-16">
            <h1 className="text-2xl font-bold text-foreground">請先登入</h1>
            <p className="mt-2 text-muted-foreground leading-relaxed">
              從金流返回時瀏覽器可能未帶入登入 Cookie。請登入與結帳相同的帳號後即可查看此筆訂單並繼續付款。
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
              找不到此訂單，或訂單不屬於目前登入帳號。請至會員中心或聯絡客服。
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
                render={<Link href="/" />}
              >
                回到首頁
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
  const bodyText = reasonNorm === "amt" ? MSG_AMT : MSG_FAILED;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <ClearPayuniSession />
      <main className="flex-grow">
        <div className="container max-w-3xl mx-auto px-4 py-12 lg:py-20">
          <div className="text-center mb-10">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <CircleAlert className="size-12 text-destructive" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">付款未成功</h1>
            <p className="text-muted-foreground leading-relaxed max-w-xl mx-auto">
              {bodyText}
            </p>
          </div>

          <Card className="border-border/60 shadow-sm overflow-hidden">
            <CardHeader className="bg-muted/30 border-b border-border/60 py-4">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  訂單編號：<span className="text-primary">#{order.order_number}</span>
                </CardTitle>
                <span className="text-sm text-muted-foreground">
                  {formatOrderDateTimeZh(order.created_at)}
                </span>
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
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {item.product_name}
                        </h4>
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
                    <span className="text-muted-foreground">應付金額</span>
                    <span className="text-lg font-bold text-foreground tabular-nums">
                      NT$ {order.total}
                    </span>
                  </div>
                </div>

                {order.status === "pending" &&
                isPayuniPendingOrder(order.notes) &&
                shouldOfferPayuniResumePayment(
                  order.payuni_payment_type,
                  order.payuni_payment_detail,
                ) ? (
                  <div className="rounded-lg border border-amber-200/80 bg-amber-50/40 dark:border-amber-900/45 dark:bg-amber-950/25 px-4 py-3 space-y-3">
                    <p className="text-sm text-foreground">
                      若要重新開啟統一金流付款頁，請點下方按鈕。
                    </p>
                    <PayuniResumePaymentButton orderId={order.id} />
                  </div>
                ) : null}

                <div className="flex flex-col gap-3 pt-2">
                  <Button
                    size="lg"
                    className="w-full min-h-11 justify-center rounded-full px-6"
                    nativeButton={false}
                    render={<Link href={`/member/orders/${order.id}`} />}
                  >
                    查看此筆訂單
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-h-11 justify-center rounded-full px-6"
                    nativeButton={false}
                    render={<Link href="/member/orders" />}
                  >
                    我的訂單
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="w-full min-h-11 justify-center rounded-full px-6"
                    nativeButton={false}
                    render={<Link href="/" />}
                  >
                    回到首頁
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
