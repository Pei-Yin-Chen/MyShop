"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  markOrderFulfilledAction,
  type MarkOrderFulfilledActionState,
} from "@/app/admin/(panel)/orders/actions";
import { Button } from "@/components/ui/button";
import { FormMenuSelect } from "@/components/ui/select";
import { SHIPPING_CARRIER_OPTIONS } from "@/lib/orders/shipping-carriers";
import { cn } from "@/lib/utils";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

export function AdminOrderShipButton({
  orderId,
  variant,
}: {
  orderId: string;
  variant: "ship" | "store_pickup";
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, formAction, pending] = useActionState(
    markOrderFulfilledAction,
    undefined as MarkOrderFulfilledActionState | undefined,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!state?.ok) return;
    setOpen(false);
    router.refresh();
  }, [state, router]);

  useActionSuccessToast(
    state,
    variant === "store_pickup" ? "已標記門市可取貨" : "已登記出貨",
  );

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const carrierError = fieldErrors?.carrier;
  const trackingError = fieldErrors?.tracking_number;
  const serverError =
    state && !state.ok && state.error && !carrierError && !trackingError
      ? state.error
      : undefined;

  const isStore = variant === "store_pickup";
  const triggerLabel = isStore ? "標記可取貨" : "出貨";
  const title = isStore ? "標記門市可取貨" : "登記出貨";
  const description = isStore
    ? "確認後訂單狀態將改為「已出貨」，並記錄可取貨時間（無需填寫物流單號）。"
    : "確認後將訂單狀態改為「已出貨」、物流狀態為「配送中」，並記錄出貨時間。";

  const modal = open ? (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4"
      role="presentation"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40 backdrop-blur-[1px]"
        aria-label="關閉"
        disabled={pending}
        onClick={() => !pending && setOpen(false)}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="admin-order-fulfill-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 text-left shadow-lg shadow-black/10"
      >
        <h2 id="admin-order-fulfill-title" className="text-lg font-semibold text-foreground">
          {title}
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{description}</p>

        <form action={formAction} className="mt-5 flex flex-col gap-3">
          <input type="hidden" name="order_id" value={orderId} />
          <input
            type="hidden"
            name="fulfillment_kind"
            value={isStore ? "store_pickup" : "home"}
          />

          {!isStore ? (
            <>
              <div>
                <label
                  htmlFor="admin_order_ship_carrier"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  物流公司
                </label>
                <FormMenuSelect
                  id="admin_order_ship_carrier"
                  name="carrier"
                  defaultValue=""
                  emptyOption={{ label: "請選擇" }}
                  options={SHIPPING_CARRIER_OPTIONS.map((o) => ({
                    value: o.value,
                    label: o.label,
                  }))}
                  invalid={Boolean(carrierError)}
                  required
                  positionerClassName="z-[220]"
                />
                {carrierError ? (
                  <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                    {carrierError}
                  </p>
                ) : null}
              </div>

              <div>
                <label
                  htmlFor="admin_order_ship_tracking"
                  className="mb-1.5 block text-xs font-medium text-muted-foreground"
                >
                  追蹤號碼
                </label>
                <input
                  id="admin_order_ship_tracking"
                  name="tracking_number"
                  type="text"
                  autoComplete="off"
                  placeholder="請輸入物流追蹤號碼"
                  disabled={pending}
                  className={cn(
                    "w-full rounded-lg border bg-background px-2.5 py-1.5 text-sm outline-none focus-visible:ring-2 disabled:opacity-60",
                    trackingError
                      ? "border-destructive ring-2 ring-destructive/10"
                      : "border-border focus-visible:ring-primary/20",
                  )}
                  aria-invalid={trackingError ? true : undefined}
                  aria-describedby={trackingError ? "admin_order_ship_tracking_err" : undefined}
                />
                {trackingError ? (
                  <p
                    id="admin_order_ship_tracking_err"
                    className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200"
                  >
                    {trackingError}
                  </p>
                ) : null}
              </div>
            </>
          ) : null}

          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}

          <div className="mt-2 flex flex-wrap justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="rounded-full"
              disabled={pending}
              onClick={() => setOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" size="lg" className="rounded-full" disabled={pending}>
              {pending ? "處理中…" : isStore ? "確認可取貨" : "確認出貨"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  ) : null;

  return (
    <>
      <Button
        type="button"
        size="lg"
        className="rounded-full shrink-0"
        onClick={() => setOpen(true)}
      >
        {triggerLabel}
      </Button>
      {mounted && modal ? createPortal(modal, document.body) : null}
    </>
  );
}
