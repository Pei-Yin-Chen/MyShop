import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  orderStatusBadgeProps,
  orderStatusLabel,
} from "@/lib/orders/order-status-display";

type OrderListRow = {
  id: string;
  order_number: string;
  created_at: string;
  total: number;
  status: string;
};

export default async function MemberOrdersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: orders, error } = await supabase
    .from("orders")
    .select("id, order_number, created_at, total, status")
    .eq("user_id", user?.id ?? "")
    .order("created_at", { ascending: false })
    .returns<OrderListRow[]>();

  return (
    <Card className="border-border/60 shadow-sm">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-bold">我的訂單</CardTitle>
        <p className="text-sm text-muted-foreground">查看你的歷史訂單與狀態。</p>
      </CardHeader>
      <CardContent>
        {error && (
          <div className="text-sm text-red-500 font-medium bg-red-50 p-3 rounded-md border border-red-100">
            載入失敗：{error.message}
          </div>
        )}

        {!error && (!orders || orders.length === 0) && (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">目前尚無訂單紀錄。</p>
            <div className="mt-4">
              <Button
                className="rounded-full"
                nativeButton={false}
                render={<Link href="/products" />}
              >
                去逛逛商品
              </Button>
            </div>
          </div>
        )}

        {!!orders?.length && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/30 border-b border-border/60 text-muted-foreground font-medium">
                <tr>
                  <th className="px-4 py-3">訂單編號</th>
                  <th className="px-4 py-3">訂單日期</th>
                  <th className="px-4 py-3">狀態</th>
                  <th className="px-4 py-3 text-right">金額</th>
                  <th className="px-4 py-3 text-right">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3 font-medium text-foreground">
                      #{o.order_number}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">
                      {formatOrderDateTimeZh(o.created_at)}
                    </td>
                    <td className="px-4 py-3">
                      <Badge {...orderStatusBadgeProps(o.status)}>
                        {orderStatusLabel(o.status)}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right font-medium tabular-nums">
                      NT$ {o.total}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <Link
                        href={`/member/orders/${o.id}`}
                        className="font-medium text-primary hover:underline"
                      >
                        查看詳情
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

