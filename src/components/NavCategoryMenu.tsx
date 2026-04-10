"use client";

import Link from "next/link";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

/** 導覽列：依 `product_categories` 列出分類，避免多個分類時橫向塞滿 */
export function NavCategoryMenu({ categories }: { categories: string[] }) {
  if (categories.length === 0) return null;

  return (
    <MenuPrimitive.Root>
      <MenuPrimitive.Trigger
        className={cn(
          "group flex cursor-pointer items-center gap-1 rounded-md px-1 py-0.5 -mx-1 text-sm font-medium text-muted-foreground outline-none transition-colors hover:text-foreground",
          "focus-visible:ring-2 focus-visible:ring-ring",
        )}
        title="商品分類"
        aria-label="開啟商品分類選單"
      >
        商品分類
        <ChevronDown
          className="size-4 opacity-70 transition-transform group-data-[open]:rotate-180"
          aria-hidden
        />
      </MenuPrimitive.Trigger>
      <MenuPrimitive.Portal>
        <MenuPrimitive.Positioner className="z-[80] pt-1" side="bottom" align="start">
          <MenuPrimitive.Popup className="min-w-[12rem] max-w-[min(20rem,calc(100vw-2rem))] overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-150 origin-top">
            <div className="max-h-[min(24rem,70vh)] overflow-y-auto overscroll-contain py-1">
              {categories.map((name) => (
                <Link
                  key={name}
                  href={`/products?category=${encodeURIComponent(name)}`}
                  className="block rounded-lg px-3 py-2 text-sm text-foreground outline-none transition-colors hover:bg-primary/10 hover:text-primary"
                >
                  {name}
                </Link>
              ))}
            </div>
          </MenuPrimitive.Popup>
        </MenuPrimitive.Positioner>
      </MenuPrimitive.Portal>
    </MenuPrimitive.Root>
  );
}
