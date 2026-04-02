import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type OrderRow = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
};

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

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("zh-TW", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
}

export default async function MemberIndexPage() {
  const supabase = await createClient();

  const { data: orders } = await supabase
    .from("orders")
    .select("id, order_number, created_at, total, status")
    .order("created_at", { ascending: false })
    .limit(3)
    .returns<OrderRow[]>();

  const latestOrders = orders ?? [];

  return (
    <div className="space-y-6">
      <Card className="border-border/60 shadow-sm">
        <CardHeader className="space-y-1">
          <CardTitle className="text-base font-semibold">最近訂單</CardTitle>
          <p className="text-sm text-muted-foreground">快速查看最近 3 筆訂單。</p>
        </CardHeader>
        <CardContent className="space-y-3">
          {latestOrders.length === 0 ? (
            <div className="py-6">
              <p className="text-sm text-muted-foreground">目前尚無訂單紀錄。</p>
              <div className="mt-4">
                <Button className="rounded-full" nativeButton={false} render={<Link href="/products" />}>
                  去逛逛商品
                </Button>
              </div>
            </div>
          ) : (
            latestOrders.map((o) => (
              <Link
                key={o.id}
                href={`/member/orders/${o.id}`}
                className="flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2 hover:bg-muted/20 transition-colors"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">#{o.order_number}</p>
                  <p className="mt-0.5 text-xs text-muted-foreground">{formatDate(o.created_at)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={statusVariant(o.status)}>{statusLabel(o.status)}</Badge>
                  <span className="text-sm font-medium tabular-nums text-foreground">NT$ {o.total}</span>
                </div>
              </Link>
            ))
          )}

          <div className="pt-2">
            <Button
              variant="ghost"
              className="px-0 text-primary hover:text-primary hover:bg-transparent"
              nativeButton={false}
              render={<Link href="/member/orders" />}
            >
              查看全部訂單 →
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

