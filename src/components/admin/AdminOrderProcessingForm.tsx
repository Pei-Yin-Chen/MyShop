"use client";

import { useActionState, useEffect, useState } from "react";
import {
  saveAdminOrderProcessingAction,
  type OrderProcessingActionState,
} from "@/app/admin/(panel)/orders/actions";
import { Button } from "@/components/ui/button";
import { FormMenuSelect } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  ADMIN_ORDER_NOTE_MAX_CHARS,
  ORDER_ADMIN_NOTE_HANDLING_VALUES,
  orderAdminNoteHandlingLabel,
} from "@/lib/admin/admin-order-notes";
import { ADMIN_ORDER_STATUS_FILTER_VALUES } from "@/lib/admin/admin-orders-list";
import { orderStatusLabel } from "@/lib/orders/order-status-display";

export function AdminOrderProcessingForm({
  orderId,
  currentStatus,
  adminNoteBody,
  adminNoteHandlingStatus,
}: {
  orderId: string;
  currentStatus: string;
  adminNoteBody: string | null;
  adminNoteHandlingStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    saveAdminOrderProcessingAction,
    undefined as OrderProcessingActionState | undefined,
  );
  const [successHidden, setSuccessHidden] = useState(false);

  useEffect(() => {
    if (!state?.ok) {
      setSuccessHidden(false);
      return;
    }
    setSuccessHidden(false);
    const id = window.setTimeout(() => setSuccessHidden(true), 4000);
    return () => window.clearTimeout(id);
  }, [state]);

  const showSuccess = Boolean(state?.ok && state.message && !successHidden);
  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const bodyError = fieldErrors?.body;
  const serverError =
    state && !state.ok && state.error && !bodyError ? state.error : undefined;

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="order_id" value={orderId} />

      <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:gap-8">
        <div className="min-w-0 shrink-0 lg:w-[min(100%,14rem)]">
          <label
            htmlFor="admin_order_status"
            className="mb-1 block text-xs font-medium text-muted-foreground"
          >
            訂單狀態
          </label>
          <FormMenuSelect
            id="admin_order_status"
            name="status"
            defaultValue={currentStatus}
            options={ADMIN_ORDER_STATUS_FILTER_VALUES.map((value) => ({
              value,
              label: orderStatusLabel(value),
            }))}
          />
        </div>

        <div className="min-w-0 flex-1 space-y-4 border-t border-border/60 pt-4 lg:border-l lg:border-t-0 lg:pl-8 lg:pt-0">
          <div>
            <label
              htmlFor="admin_order_note_body"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              後台備註
            </label>
            <textarea
              id="admin_order_note_body"
              name="body"
              rows={3}
              defaultValue={adminNoteBody ?? ""}
              placeholder={`內部紀錄，最多 ${ADMIN_ORDER_NOTE_MAX_CHARS} 字；可留白清除`}
              className={cn(
                "w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 disabled:opacity-60",
                bodyError
                  ? "border-destructive ring-2 ring-destructive/10"
                  : "border-border focus-visible:ring-2 focus-visible:ring-primary/20",
              )}
              disabled={pending}
              maxLength={ADMIN_ORDER_NOTE_MAX_CHARS}
              aria-invalid={bodyError ? true : undefined}
              aria-describedby={bodyError ? "admin_order_note_body_error" : undefined}
            />
            {bodyError ? (
              <p
                id="admin_order_note_body_error"
                className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
              >
                {bodyError}
              </p>
            ) : null}
          </div>
          <div className="max-w-md">
            <label
              htmlFor="admin_order_note_handling"
              className="mb-1 block text-xs font-medium text-muted-foreground"
            >
              備註處理狀態
            </label>
            <FormMenuSelect
              id="admin_order_note_handling"
              name="handling_status"
              defaultValue={adminNoteHandlingStatus}
              options={ORDER_ADMIN_NOTE_HANDLING_VALUES.map((value) => ({
                value,
                label: orderAdminNoteHandlingLabel(value),
              }))}
            />
            <p className="mt-1.5 text-xs text-muted-foreground">
              無後台備註時為「未設定」。已填備註時若選「未設定」，儲存後會改為「待處理」。
            </p>
          </div>
        </div>
      </div>

      {serverError ? <p className="text-xs text-destructive">{serverError}</p> : null}
      {showSuccess && state?.ok ? (
        <p className="text-xs text-emerald-700 dark:text-emerald-400">{state.message ?? "已儲存"}</p>
      ) : null}

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between sm:gap-4">
        <p className="text-xs text-muted-foreground">只會更新您有變更的內容，其餘維持原樣。</p>
        <Button type="submit" size="lg" className="rounded-full w-full sm:w-auto sm:shrink-0" disabled={pending}>
          {pending ? "儲存中…" : "儲存"}
        </Button>
      </div>
    </form>
  );
}
