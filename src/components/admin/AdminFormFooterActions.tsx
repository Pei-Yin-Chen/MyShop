"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { buttonVariants } from "@/components/ui/button-variants";
import { cn } from "@/lib/utils";

type Props = {
  backHref: string;
  /** 預設「返回設定」 */
  backLabel?: string;
  children: ReactNode;
};

/** 表單底部：返回（outline）+ 主按鈕，避免長頁需捲回頂部才能離開 */
export function AdminFormFooterActions({ backHref, backLabel = "返回設定", children }: Props) {
  return (
    <div className="flex flex-wrap items-center justify-end gap-3 border-t border-border/60 pt-4">
      <Link
        href={backHref}
        className={cn(
          buttonVariants({ variant: "outline", size: "lg" }),
          "min-h-9 min-w-[9rem] rounded-full",
        )}
      >
        {backLabel}
      </Link>
      {children}
    </div>
  );
}
