import Link from "next/link";
import { ArrowLeft, CreditCard, HelpCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Footer } from "@/components/Footer";

/**
 * PAYUNi UPP「返回商店／返回」導向此頁（BackURL）。
 * 使用者若關閉付款分頁而未點返回，不會經過此頁，請至會員中心或登入後查看訂單。
 */
export default async function PayuniBackPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const { orderId } = await searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let orderLabel: string | null = null;
  let orderStatus: string | null = null;
  if (orderId && user) {
    const { data } = await supabase
      .from("orders")
      .select("order_number, status")
      .eq("id", orderId)
      .eq("user_id", user.id)
      .maybeSingle<{ order_number: string; status: string }>();
    if (data) {
      orderLabel = data.order_number;
      orderStatus = data.status;
    }
  }

  const loginRedirect = orderId
    ? encodeURIComponent(`/member/orders/${orderId}`)
    : encodeURIComponent("/member/orders");

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow">
        <div className="container mx-auto max-w-xl px-4 py-12 lg:py-16">
          <Card className="border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CreditCard className="size-5 text-primary" />
                已離開統一金流付款頁
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-muted-foreground leading-relaxed">
              <p>
                若您尚未完成付款、關閉分頁時還沒選付款方式，訂單仍會是「待付款」。請至
                <strong className="text-foreground"> 會員中心 → 我的訂單 </strong>
                開啟該筆訂單，點
                <strong className="text-foreground">「繼續完成線上付款」</strong>
                即可再開付款頁（與原訂單同一編號）。
              </p>
              <p>
                若您已付款成功，訂單狀態會在短時間內更新；若未更新請稍候重新整理，或洽客服並提供訂單編號。
              </p>
              <div className="rounded-lg border border-border/60 bg-muted/30 px-3 py-2.5 flex gap-2 text-xs">
                <HelpCircle className="size-4 shrink-0 text-muted-foreground mt-0.5" />
                <span>
                  若您<strong className="text-foreground">直接關閉</strong>
                  付款分頁而未按「返回」，請改由本站首頁登入後至「我的訂單」查看同一筆訂單。
                </span>
              </div>

              <div className="flex flex-col gap-4 pt-3">
                {user && orderId && orderLabel ? (
                  <Button
                    size="lg"
                    className="w-full min-h-11 justify-center rounded-full px-6"
                    nativeButton={false}
                    render={<Link href={`/member/orders/${orderId}`} />}
                  >
                    查看訂單 #{orderLabel}
                  </Button>
                ) : null}
                {user ? (
                  <Button
                    size="lg"
                    variant={orderLabel ? "outline" : "default"}
                    className="w-full min-h-11 justify-center rounded-full px-6"
                    nativeButton={false}
                    render={<Link href="/member/orders" />}
                  >
                    我的訂單
                  </Button>
                ) : (
                  <Button
                    size="lg"
                    className="w-full min-h-11 justify-center rounded-full px-6"
                    nativeButton={false}
                    render={<Link href={`/login?redirectTo=${loginRedirect}`} />}
                  >
                    登入後查看訂單
                  </Button>
                )}
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full min-h-11 justify-center gap-2 rounded-full px-6"
                  nativeButton={false}
                  render={<Link href="/" />}
                >
                  <ArrowLeft className="size-4 shrink-0" />
                  回到首頁
                </Button>
              </div>

              {orderStatus === "pending" && orderLabel ? (
                <p className="text-xs text-amber-800 dark:text-amber-200/90 pt-1">
                  此筆訂單目前狀態為「待付款」，請依訂單內的繳費說明於期限內完成；逾時可能需重新下單。
                </p>
              ) : null}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
