"use client";

import { useActionState } from "react";
import { updateCategoryAction, type CategoryFormState } from "@/app/admin/(panel)/products/category-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminDeleteCategoryButton } from "@/components/admin/AdminDeleteCategoryButton";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

export function CategoryEditRow({
  category,
}: {
  category: { id: string; name: string; sort_order: number };
}) {
  const [state, action, pending] = useActionState(
    updateCategoryAction.bind(null, category.id),
    undefined as CategoryFormState | undefined,
  );

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;
  const nameError = fieldErrors?.name;
  const sortError = fieldErrors?.sort_order;
  const showServerError = Boolean(serverError) && Object.keys(fieldErrors ?? {}).length === 0;

  useActionSuccessToast(state, "已儲存");

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3 align-top">
        <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-start">
          <input
            name="name"
            required
            defaultValue={category.name}
            className={cn(
              "h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none",
              nameError
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border focus:ring-2 focus:ring-primary/20",
            )}
          />
          <input
            name="sort_order"
            type="number"
            min={0}
            step={1}
            defaultValue={category.sort_order}
            className={cn(
              "h-9 w-24 shrink-0 rounded-md border bg-background px-3 text-sm tabular-nums outline-none",
              sortError
                ? "border-destructive ring-2 ring-destructive/10"
                : "border-border focus:ring-2 focus:ring-primary/20",
            )}
          />
          <Button
            type="submit"
            size="sm"
            variant="outline"
            disabled={pending}
            className="shrink-0 min-w-[4.5rem] whitespace-nowrap border-primary/30 text-primary hover:bg-primary/10 hover:text-primary sm:self-start"
          >
            {pending ? "儲存…" : "儲存"}
          </Button>
        </form>
        {nameError ? (
          <p className="mt-1 hidden text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200 sm:block">
            {nameError}
          </p>
        ) : null}
        {!nameError && sortError ? (
          <p className="mt-1 hidden text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200 sm:block">
            {sortError}
          </p>
        ) : null}
        {showServerError ? <p className="mt-1 text-xs text-destructive">{serverError}</p> : null}
      </td>
      <td className="px-4 py-3 align-top text-right">
        <AdminDeleteCategoryButton categoryId={category.id} categoryName={category.name} />
      </td>
    </tr>
  );
}
