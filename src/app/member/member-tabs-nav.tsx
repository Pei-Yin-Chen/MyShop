"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/member/profile", label: "個人資料" },
  { href: "/member/orders", label: "我的訂單" },
] as const;

export function MemberTabsNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="會員中心導覽"
      className="flex w-full gap-2 overflow-x-auto rounded-xl border border-border/60 bg-card p-2 shadow-sm"
    >
      {navItems.map((it) => {
        const active = pathname === it.href || pathname.startsWith(`${it.href}/`);
        return (
          <Link
            key={it.href}
            href={it.href}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-primary/15 text-primary"
                : "text-muted-foreground hover:bg-muted/40 hover:text-foreground",
            )}
            aria-current={active ? "page" : undefined}
          >
            {it.label}
          </Link>
        );
      })}
    </nav>
  );
}

