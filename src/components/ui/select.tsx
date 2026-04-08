"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Menu as MenuPrimitive } from "@base-ui/react/menu";
import { ChevronDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";

const formMenuTriggerClassName =
  "group flex h-9 w-full min-w-0 cursor-pointer items-center justify-between rounded-lg border border-border bg-background px-3 text-sm outline-none transition-all hover:bg-muted/30 focus-visible:ring-2 focus-visible:ring-ring data-[open]:border-primary/50 data-[open]:ring-2 data-[open]:ring-primary/10";

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

export interface FormMenuSelectProps {
  name: string;
  id?: string;
  defaultValue: string;
  options: { value: string; label: string }[];
  required?: boolean;
  invalid?: boolean;
  /** 在選項前加入 value 為空字串的選項（例如「請選擇」） */
  emptyOption?: { label: string };
  /** 選取後向最近的 form 送出（例如 GET 篩選表單） */
  requestSubmitParentForm?: boolean;
}

/**
 * 與 {@link SortDropdown} 相同觸發器／選單樣式，並以 hidden input 供 server action 表單提交。
 */
export function FormMenuSelect({
  name,
  id,
  defaultValue,
  options,
  required,
  invalid,
  emptyOption,
  requestSubmitParentForm,
}: FormMenuSelectProps) {
  const fullOptions = useMemo(() => {
    if (!emptyOption) return options;
    return [{ value: "", label: emptyOption.label }, ...options];
  }, [options, emptyOption]);

  const [value, setValue] = useState(defaultValue);
  useEffect(() => {
    setValue(defaultValue);
  }, [defaultValue]);

  const rootRef = useRef<HTMLDivElement>(null);

  const currentLabel =
    fullOptions.find((o) => o.value === value)?.label ?? "";

  function commitValue(next: string) {
    setValue(next);
    if (requestSubmitParentForm) {
      queueMicrotask(() => {
        rootRef.current?.closest("form")?.requestSubmit();
      });
    }
  }

  return (
    <div ref={rootRef} className="w-full">
      <input type="hidden" name={name} value={value} required={required} />
      <MenuPrimitive.Root>
        <MenuPrimitive.Trigger
          type="button"
          id={id}
          aria-invalid={invalid ? true : undefined}
          className={cn(
            formMenuTriggerClassName,
            invalid &&
              "border-destructive ring-2 ring-destructive/10 data-[open]:border-destructive data-[open]:ring-destructive/20",
          )}
        >
          <span className="min-w-0 flex-1 truncate text-left">{currentLabel}</span>
          <ChevronDown className="ml-2 size-4 shrink-0 text-muted-foreground opacity-70 transition-transform group-data-[open]:rotate-180" />
        </MenuPrimitive.Trigger>

        <MenuPrimitive.Portal>
          <MenuPrimitive.Positioner className="z-[80] pt-1" side="bottom" align="start">
            <MenuPrimitive.Popup
              data-ui="form-menu-select-popup"
              className="w-[var(--anchor-width)] min-w-[11rem] overflow-hidden rounded-xl border border-border bg-background p-1 shadow-lg shadow-black/5 animate-in fade-in zoom-in-95 duration-150 origin-top"
            >
              <div className="max-h-72 overflow-auto overscroll-contain">
                {fullOptions.map((option) => (
                  <MenuPrimitive.Item
                    key={option.value === "" ? "__empty__" : option.value}
                    onClick={() => commitValue(option.value)}
                    className={cn(
                      "relative flex w-full cursor-pointer select-none items-center rounded-lg py-2 pl-3 pr-9 text-sm outline-none transition-colors hover:bg-primary/10 hover:text-primary",
                      value === option.value &&
                        "bg-primary/5 font-medium text-primary",
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
