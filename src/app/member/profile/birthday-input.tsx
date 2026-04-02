"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { SortDropdown } from "@/components/ui/select";

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function formatYmd(d: Date) {
  const y = d.getFullYear();
  const m = pad2(d.getMonth() + 1);
  const day = pad2(d.getDate());
  return `${y}-${m}-${day}`;
}

function isValidYmd(s: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(s)) return false;
  const [yS, mS, dS] = s.split("-");
  const y = Number(yS);
  const m = Number(mS);
  const d = Number(dS);
  if (!Number.isFinite(y) || !Number.isFinite(m) || !Number.isFinite(d)) return false;
  if (m < 1 || m > 12) return false;
  if (d < 1 || d > 31) return false;
  const dt = new Date(y, m - 1, d);
  return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
}

function parseYmd(s: string): Date | null {
  if (!isValidYmd(s)) return null;
  const [yS, mS, dS] = s.split("-");
  return new Date(Number(yS), Number(mS) - 1, Number(dS));
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

const WEEKDAYS_ZH = ["日", "一", "二", "三", "四", "五", "六"] as const;

type AnchorPos = {
  left: number;
  top: number;
  width: number;
  placement: "bottom" | "top";
};

export function BirthdayInput({
  name,
  defaultValue,
  error,
}: {
  name: string;
  defaultValue: string;
  error?: string;
}) {
  const [open, setOpen] = useState(false);
  const [value, setValue] = useState(defaultValue ?? "");
  const [anchorPos, setAnchorPos] = useState<AnchorPos | null>(null);

  const selectedDate = useMemo(() => parseYmd(value), [value]);

  const [monthCursor, setMonthCursor] = useState<Date>(() => {
    return startOfMonth(selectedDate ?? new Date());
  });

  const rootRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const popoverRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      const el = rootRef.current;
      const pop = popoverRef.current;
      if (!el) return;
      if (!(e.target instanceof Node)) return;
      // Portal renders popover outside rootRef; treat clicks inside popover as "inside"
      const insideRoot = el.contains(e.target);
      const insidePopover = pop ? pop.contains(e.target) : false;
      const insideSortDropdownPopup =
        e.target instanceof Element &&
        Boolean(e.target.closest('[data-ui="sort-dropdown-popup"]'));
      if (!insideRoot && !insidePopover && !insideSortDropdownPopup) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    const updatePos = () => {
      const el = inputRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const margin = 8;
      const w = Math.min(320, Math.max(260, r.width));
      const left = Math.min(
        Math.max(margin, r.left),
        Math.max(margin, window.innerWidth - margin - w),
      );
      const spaceBelow = window.innerHeight - r.bottom;
      const placement: AnchorPos["placement"] = spaceBelow >= 260 ? "bottom" : "top";
      const top =
        placement === "bottom"
          ? Math.min(window.innerHeight - margin - 1, r.bottom + margin)
          : Math.max(margin, r.top - margin);
      setAnchorPos({ left, top, width: w, placement });
    };
    window.addEventListener("mousedown", onDown);
    window.addEventListener("keydown", onKey);
    window.addEventListener("scroll", updatePos, true);
    window.addEventListener("resize", updatePos);
    updatePos();
    return () => {
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", updatePos, true);
      window.removeEventListener("resize", updatePos);
    };
  }, [open]);

  const year = monthCursor.getFullYear();
  const month = monthCursor.getMonth(); // 0-based
  const first = new Date(year, month, 1);
  const startWeekday = first.getDay(); // 0=Sun
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const cells: Array<{ day: number | null }> = [];
  for (let i = 0; i < startWeekday; i += 1) cells.push({ day: null });
  for (let d = 1; d <= daysInMonth; d += 1) cells.push({ day: d });
  while (cells.length % 7 !== 0) cells.push({ day: null });

  const alignMonthToSelection = () => {
    setMonthCursor(startOfMonth(selectedDate ?? new Date()));
  };

  const yearOptions = useMemo(() => {
    const current = new Date().getFullYear();
    const out: { value: string; label: string }[] = [];
    for (let y = current; y >= current - 120; y -= 1) out.push({ value: String(y), label: `${y}年` });
    return out;
  }, []);

  const monthOptions = useMemo(() => {
    return Array.from({ length: 12 }, (_, i) => ({ value: String(i), label: `${i + 1}月` }));
  }, []);

  const popover =
    open && anchorPos
      ? createPortal(
          <div
            ref={popoverRef}
            className="fixed z-[60]"
            style={{
              left: anchorPos.left,
              top: anchorPos.placement === "bottom" ? anchorPos.top : undefined,
              bottom: anchorPos.placement === "top" ? window.innerHeight - anchorPos.top + 8 : undefined,
              width: anchorPos.width,
            }}
          >
            <div className="rounded-2xl border border-border/70 bg-card shadow-lg ring-1 ring-foreground/5">
              <div className="flex items-center justify-between px-4 py-3">
                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer"
                  onClick={() => setMonthCursor((d) => addMonths(d, -1))}
                  aria-label="上一個月"
                >
                  <ChevronLeft className="size-4" />
                </button>

                <div className="flex items-center gap-2">
                  <SortDropdown
                    value={String(year)}
                    onValueChange={(val) => setMonthCursor(new Date(Number(val), month, 1))}
                    options={yearOptions}
                    className="min-w-[7.25rem] h-8 cursor-pointer"
                  />
                  <SortDropdown
                    value={String(month)}
                    onValueChange={(val) => setMonthCursor(new Date(year, Number(val), 1))}
                    options={monthOptions}
                    className="min-w-[6rem] h-8 cursor-pointer"
                  />
                </div>

                <button
                  type="button"
                  className="rounded-lg p-2 text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer"
                  onClick={() => setMonthCursor((d) => addMonths(d, 1))}
                  aria-label="下一個月"
                >
                  <ChevronRight className="size-4" />
                </button>
              </div>

              <div className="px-4 pb-4">
                <div className="grid grid-cols-7 gap-1 text-center text-xs text-muted-foreground">
                  {WEEKDAYS_ZH.map((w) => (
                    <div key={w} className="py-1">
                      {w}
                    </div>
                  ))}
                </div>

                <div className="mt-1 grid grid-cols-7 gap-1">
                  {cells.map((c, idx) => {
                    if (c.day == null) return <div key={`e-${idx}`} className="h-9" />;
                    const d = new Date(year, month, c.day);
                    const ymd = formatYmd(d);
                    const isSelected = value === ymd;
                    return (
                      <button
                        key={ymd}
                        type="button"
                        className={cn(
                          "h-9 rounded-lg text-sm transition-colors cursor-pointer",
                          isSelected
                            ? "bg-primary/15 text-primary font-semibold"
                            : "hover:bg-muted/40 text-foreground",
                        )}
                        onClick={() => {
                          setValue(ymd);
                          setOpen(false);
                        }}
                      >
                        {c.day}
                      </button>
                    );
                  })}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-xs text-muted-foreground hover:bg-muted/40 hover:text-foreground cursor-pointer"
                    onClick={() => {
                      setValue("");
                      setOpen(false);
                    }}
                  >
                    清除
                  </button>
                  <div className="h-0.5" />
                </div>
              </div>
            </div>
          </div>,
          document.body,
        )
      : null;

  return (
    <div ref={rootRef} className="relative">
      <div className="relative">
        {/* Hidden field for form submission */}
        <input type="hidden" name={name} value={value} />
        <input
          id={name}
          ref={inputRef}
          value={value}
          readOnly
          onClick={() => {
            alignMonthToSelection();
            setOpen(true);
          }}
          placeholder="請選擇日期"
          autoComplete="bday"
          className={cn(
            "w-full h-10 rounded-lg border bg-background pl-3 pr-10 text-sm outline-none transition-all cursor-pointer",
            error ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
          )}
        />
        <button
          type="button"
          onClick={() => {
            alignMonthToSelection();
            setOpen((v) => !v);
          }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground hover:text-foreground cursor-pointer"
          aria-label="選擇生日日期"
        >
          <CalendarIcon className="size-4" />
        </button>
      </div>

      {popover}
    </div>
  );
}

