import Link from 'next/link'
import { LayoutDashboard, Users, ShoppingBag, Settings } from 'lucide-react'
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton'

const navClass =
  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium text-muted-foreground transition-colors hover:bg-primary/10 hover:text-foreground'

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-screen bg-muted/30">
      <aside className="flex w-64 flex-col border-r border-border bg-card text-foreground shadow-sm">
        <div className="border-b border-border p-6">
          <Link href="/admin" className="block">
            <span className="text-xl font-semibold tracking-tight">
              My<span className="text-primary">Pâtisserie</span>
            </span>
            <span className="mt-1 block text-xs font-medium text-muted-foreground">後台管理</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 p-4">
          <Link href="/admin" className={navClass}>
            <LayoutDashboard className="size-5 shrink-0 text-primary/80" />
            儀表板
          </Link>
          <Link href="/admin/members" className={navClass}>
            <Users className="size-5 shrink-0 text-primary/80" />
            會員管理
          </Link>
          <Link href="/admin/products" className={navClass}>
            <ShoppingBag className="size-5 shrink-0 text-primary/80" />
            商品管理
          </Link>
          <Link href="/admin/settings" className={navClass}>
            <Settings className="size-5 shrink-0 text-primary/80" />
            系統設定
          </Link>
        </nav>
        <div className="border-t border-border p-4">
          <AdminSignOutButton />
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b border-border/80 bg-background/95 px-8 backdrop-blur-sm">
          <h1 className="text-lg font-semibold text-foreground">管理系統</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>管理員您好</span>
          </div>
        </header>
        <div className="p-8">{children}</div>
      </main>
    </div>
  )
}
