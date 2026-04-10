import { Users, ShoppingBag, DollarSign } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminDashboardCharts } from "@/components/admin/AdminDashboardCharts";
import { createClient } from "@/lib/supabase/server";
import { fetchDashboardStats } from "@/lib/admin/dashboard-stats";

export default async function AdminDashboard() {
  const supabase = await createClient();
  const result = await fetchDashboardStats(supabase);

  if (!result.ok) {
    return (
      <div className="space-y-6">
        <p className="text-sm text-destructive">無法載入儀表板資料：{result.error}</p>
      </div>
    );
  }

  const { memberCount, todayOrderCount, monthRevenue, last7Days } = result.data;

  const stats = [
    {
      title: "會員數",
      value: memberCount.toLocaleString("zh-TW"),
      description: "註冊會員總數",
      icon: Users,
      iconClass: "text-primary",
      iconBg: "bg-primary/10",
    },
    {
      title: "今日訂單",
      value: todayOrderCount.toLocaleString("zh-TW"),
      description: "依訂單建立時間（台北時區）",
      icon: ShoppingBag,
      iconClass: "text-emerald-700 dark:text-emerald-400",
      iconBg: "bg-emerald-500/10",
    },
    {
      title: "本月營收",
      value: `NT$ ${monthRevenue.toLocaleString("zh-TW")}`,
      description: "已付款／處理中／已出貨／已完成",
      icon: DollarSign,
      iconClass: "text-amber-800 dark:text-amber-200",
      iconBg: "bg-amber-500/10",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-border/80 shadow-sm ring-1 ring-border/60">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">{stat.title}</CardTitle>
              <div className={`rounded-lg p-2 ${stat.iconBg}`}>
                <stat.icon className={`size-4 ${stat.iconClass}`} aria-hidden />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tabular-nums text-foreground">{stat.value}</div>
              <CardDescription className="mt-1.5 text-xs leading-snug">{stat.description}</CardDescription>
            </CardContent>
          </Card>
        ))}
      </div>

      <AdminDashboardCharts days={last7Days} />
    </div>
  );
}
