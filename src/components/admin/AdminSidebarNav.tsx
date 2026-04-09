"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Users, ShoppingBag, Settings, ClipboardList } from "lucide-react";
import { cn } from "@/lib/utils";

const baseClass =
  "flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors";

function navItemActive(href: string, pathname: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin" || pathname === "/admin/";
  }
  return pathname === href || pathname.startsWith(`${href}/`);
}

const items: {
  href: string;
  label: string;
  icon: typeof LayoutDashboard;
}[] = [
  { href: "/admin", label: "儀表板", icon: LayoutDashboard },
  { href: "/admin/members", label: "會員管理", icon: Users },
  { href: "/admin/orders", label: "訂單管理", icon: ClipboardList },
  { href: "/admin/products", label: "商品管理", icon: ShoppingBag },
  { href: "/admin/settings", label: "系統設定", icon: Settings },
];

export function AdminSidebarNav() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 space-y-1 p-4">
      {items.map(({ href, label, icon: Icon }) => {
        const active = navItemActive(href, pathname);
        return (
          <Link
            key={href}
            href={href}
            className={cn(
              baseClass,
              active
                ? "bg-primary/15 font-medium text-primary"
                : "text-muted-foreground hover:bg-primary/10 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            <Icon
              className={cn("size-5 shrink-0", !active && "text-primary/80")}
              aria-hidden
            />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
