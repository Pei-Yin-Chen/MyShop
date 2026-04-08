import Link from 'next/link'
import { AdminSidebarNav } from '@/components/admin/AdminSidebarNav'
import { AdminSignOutButton } from '@/components/admin/AdminSignOutButton'

export default function AdminPanelLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[16rem_1fr] overflow-hidden bg-muted/30">
      <aside className="flex min-h-0 flex-col overflow-y-auto border-r border-border bg-card text-foreground shadow-sm">
        <div className="border-b border-border p-6">
          <Link href="/admin" className="block">
            <span className="text-xl font-semibold tracking-tight">
              My<span className="text-primary">Pâtisserie</span>
            </span>
            <span className="mt-1 block text-xs font-medium text-muted-foreground">後台管理</span>
          </Link>
        </div>
        <AdminSidebarNav />
        <div className="border-t border-border p-4">
          <AdminSignOutButton />
        </div>
      </aside>

      <main className="grid min-h-0 min-w-0 grid-rows-[auto_minmax(0,1fr)] overflow-hidden">
        <header className="flex h-16 shrink-0 items-center justify-between border-b border-border/80 bg-background/95 px-8 backdrop-blur-sm">
          <h1 className="text-lg font-semibold text-foreground">管理系統</h1>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>管理員您好</span>
          </div>
        </header>
        <div className="min-h-0 overflow-y-auto overflow-x-hidden overscroll-contain p-8">{children}</div>
      </main>
    </div>
  )
}
