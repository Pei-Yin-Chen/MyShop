"use client";

import { useActionState } from "react";
import { createCategoryAction } from "@/app/admin/(panel)/products/category-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CategoryCreateForm() {
  const [state, action, pending] = useActionState(createCategoryAction, undefined);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">新增分類</h3>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
        <div className="min-w-0 flex-1 space-y-2">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="new-cat-name">
            名稱
          </label>
          <input
            id="new-cat-name"
            name="name"
            required
            className={cn(
              "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none",
              fieldErrors?.name ? "border-destructive" : "border-border focus:ring-2 focus:ring-primary/20",
            )}
            placeholder="例如：蛋糕"
          />
        </div>
        <div className="w-full space-y-2 sm:w-32">
          <label className="text-sm font-medium text-muted-foreground" htmlFor="new-cat-sort">
            排序
          </label>
          <input
            id="new-cat-sort"
            name="sort_order"
            type="number"
            min={0}
            step={1}
            defaultValue={0}
            className={cn(
              "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none",
              fieldErrors?.sort_order ? "border-destructive" : "border-border focus:ring-2 focus:ring-primary/20",
            )}
          />
        </div>
        <Button type="submit" disabled={pending}>
          {pending ? "新增中…" : "新增"}
        </Button>
      </div>
      {serverError && <p className="text-sm text-destructive">{serverError}</p>}
      {state?.ok && <p className="text-sm text-emerald-700">已新增</p>}
    </form>
  );
}
