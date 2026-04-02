"use client";

import * as React from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

export interface SortDropdownProps {
  label?: string;
  value: string;
  options: { value: string; label: string }[];
  onValueChange: (value: string) => void;
  className?: string;
}

export function SortDropdown({
  label,
  value,
  options,
  onValueChange,
  className,
}: SortDropdownProps) {
  const currentLabel = options.find((o) => o.value === value)?.label || value;

  return (
    <div className="flex items-center gap-2">
      {label && (
        <span className="text-sm text-muted-foreground whitespace-nowrap">
          {label}
        </span>
      )}
      <MenuPrimitive.Root>
        <MenuPrimitive.Trigger
          className={cn(
            "group flex h-9 min-w-[11rem] cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring data-[open]:border-primary/50 data-[open]:ring-2 data-[open]:ring-primary/10",
            className
          )}
        >
          <span className="truncate">{currentLabel}</span>
          <ChevronDown className="ml-2 size-4 text-muted-foreground opacity-70 transition-transform group-data-[open]:rotate-180" />
        </MenuPrimitive.Trigger>

        <MenuPrimitive.Portal>
          <MenuPrimitive.Positioner className="z-[80] pt-1" side="bottom" align="end">
            <MenuPrimitive.Popup
              data-ui="sort-dropdown-popup"
              className="min-w-[11rem] overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-150 origin-top"
            >
              <div className="max-h-72 overflow-auto overscroll-contain">
                {options.map((option) => (
                  <MenuPrimitive.Item
                    key={option.value}
                    onClick={() => onValueChange(option.value)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm outline-none transition-colors hover:bg-primary/10 hover:text-primary",
                      value === option.value && "font-medium text-primary bg-primary/5"
                    )}
                  >
                    {option.label}
                    {value === option.value && (
                      <span className="absolute right-3 flex items-center justify-center">
                        <Check className="size-4" />
                      </span>
                    )}
                  </MenuPrimitive.Item>
                ))}
              </div>
            </MenuPrimitive.Popup>
          </MenuPrimitive.Positioner>
        </MenuPrimitive.Portal>
      </MenuPrimitive.Root>
    </div>
  );
}
