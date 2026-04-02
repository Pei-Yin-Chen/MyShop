import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Users, ShoppingBag, DollarSign, TrendingUp } from 'lucide-react'

export default function AdminDashboard() {
  const stats = [
    { title: '總會員數', value: '1,284', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100' },
    { title: '今日訂單', value: '42', icon: ShoppingBag, color: 'text-green-600', bg: 'bg-green-100' },
    { title: '本月營收', value: '$128,430', icon: DollarSign, color: 'text-amber-600', bg: 'bg-amber-100' },
    { title: '活躍用戶', value: '856', icon: TrendingUp, color: 'text-purple-600', bg: 'bg-purple-100' },
  ]

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <Card key={stat.title} className="border-none shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between pb-2 space-y-0">
              <CardTitle className="text-sm font-medium text-slate-500">{stat.title}</CardTitle>
              <div className={`${stat.bg} p-2 rounded-lg`}>
                <stat.icon className={`size-4 ${stat.color}`} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-slate-400 mt-1">+12% 較上個月</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">近期訂單</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-slate-500 text-center py-8">
              暫無近期訂單資料
            </div>
          </CardContent>
        </Card>
        <Card className="border-none shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">系統公告</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="p-3 bg-slate-50 rounded-lg text-sm">
                <p className="font-medium">系統維護通知</p>
                <p className="text-slate-500 text-xs mt-1">2024-04-15 02:00 - 04:00</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
