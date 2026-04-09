"use client";

import { useActionState } from "react";
import { createCategoryAction } from "@/app/admin/(panel)/products/category-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

export function CategoryCreateForm() {
  const [state, action, pending] = useActionState(createCategoryAction, undefined);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;
  const nameError = fieldErrors?.name;
  const sortError = fieldErrors?.sort_order;
  const showServerError = Boolean(serverError) && Object.keys(fieldErrors ?? {}).length === 0;

  useActionSuccessToast(state, "已新增");

  return (
    <form action={action} className="space-y-4 rounded-xl border border-border bg-card p-4">
      <h3 className="font-semibold text-foreground">新增分類</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-[1fr_8rem_auto] sm:items-start">
        <div className="min-w-0">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="new-cat-name">
            名稱
          </label>
          <input
            id="new-cat-name"
            name="name"
            required
            className={cn(
              "h-10 w-full rounded-lg border bg-background px-3 text-sm outline-none",
              nameError
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border focus:ring-2 focus:ring-primary/20",
            )}
            placeholder="例如：蛋糕"
          />
          {nameError ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {nameError}
            </p>
          ) : null}
        </div>
        <div className="w-full sm:w-auto">
          <label className="mb-1.5 block text-xs font-medium text-muted-foreground" htmlFor="new-cat-sort">
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
              sortError
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border focus:ring-2 focus:ring-primary/20",
            )}
          />
          {sortError ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {sortError}
            </p>
          ) : null}
        </div>
        <div className="sm:pt-[1.55rem]">
          <Button
            type="submit"
            disabled={pending}
            size="lg"
            className="w-full shrink-0 min-w-[7rem] whitespace-nowrap rounded-full sm:w-auto"
          >
            {pending ? "新增中…" : "新增"}
          </Button>
        </div>
      </div>
      {showServerError ? <p className="text-sm text-destructive">{serverError}</p> : null}
    </form>
  );
}
