"use client";

import { useActionState } from "react";
import { updateCategoryAction, type CategoryFormState } from "@/app/admin/(panel)/products/category-actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminDeleteCategoryButton } from "@/components/admin/AdminDeleteCategoryButton";

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

  return (
    <tr className="border-b border-border last:border-0">
      <td className="px-4 py-3">
        <form action={action} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <input
            name="name"
            required
            defaultValue={category.name}
            className={cn(
              "h-9 min-w-0 flex-1 rounded-md border bg-background px-3 text-sm outline-none",
              fieldErrors?.name ? "border-destructive" : "border-border focus:ring-2 focus:ring-primary/20",
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
              fieldErrors?.sort_order ? "border-destructive" : "border-border focus:ring-2 focus:ring-primary/20",
            )}
          />
          <Button type="submit" size="sm" variant="secondary" disabled={pending}>
            {pending ? "儲存…" : "儲存"}
          </Button>
        </form>
        {serverError && <p className="mt-1 text-xs text-destructive">{serverError}</p>}
        {state?.ok && <p className="mt-1 text-xs text-emerald-700">已儲存</p>}
      </td>
      <td className="px-4 py-3 text-right">
        <AdminDeleteCategoryButton categoryId={category.id} categoryName={category.name} />
      </td>
    </tr>
  );
}
