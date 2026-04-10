"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { DashboardDayPoint } from "@/lib/admin/dashboard-stats";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

function nt$(n: number) {
  return `NT$ ${n.toLocaleString("zh-TW")}`;
}

export function AdminDashboardCharts({ days }: { days: DashboardDayPoint[] }) {
  const orderData = days.map((d) => ({ label: d.label, orderCount: d.orderCount }));
  const revenueData = days.map((d) => ({ label: d.label, revenue: d.revenue }));

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <Card className="border-border/80 shadow-sm ring-1 ring-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">最近一週 · 每日訂單數</CardTitle>
          <CardDescription>含所有狀態；依訂單建立時間（台北時區）</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[280px] w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={orderData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  width={36}
                  allowDecimals={false}
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <Tooltip
                  formatter={(value) => [`${value ?? 0} 筆`, "訂單數"]}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                />
                <Bar dataKey="orderCount" name="訂單數" fill="var(--color-primary)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm ring-1 ring-border/60">
        <CardHeader className="pb-2">
          <CardTitle className="text-base">最近一週 · 每日營收</CardTitle>
          <CardDescription>僅計入已付款／處理中／已出貨／已完成</CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="h-[280px] w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={revenueData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                <CartesianGrid stroke="var(--border)" strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="label"
                  tick={{ fontSize: 12, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                />
                <YAxis
                  width={44}
                  tick={{ fontSize: 11, fill: "var(--muted-foreground)" }}
                  tickLine={false}
                  axisLine={{ stroke: "var(--border)" }}
                  tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : `${v}`)}
                />
                <Tooltip
                  formatter={(value) => {
                    const n = typeof value === "number" ? value : Number(value ?? 0);
                    return [nt$(Number.isFinite(n) ? n : 0), "營收"];
                  }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "1px solid var(--border)",
                    background: "var(--card)",
                    fontSize: "12px",
                  }}
                  cursor={{ fill: "var(--muted)", opacity: 0.35 }}
                />
                <Bar dataKey="revenue" name="營收" fill="var(--color-chart-2)" radius={[6, 6, 0, 0]} maxBarSize={48} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
