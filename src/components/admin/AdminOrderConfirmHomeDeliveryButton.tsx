"use client";

import { useActionState, useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  markHomeOrderDeliveredAction,
  type MarkHomeOrderDeliveredActionState,
} from "@/app/admin/(panel)/orders/actions";
import { Button } from "@/components/ui/button";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

/** 宅配：管理員確認已送達，訂單改為「已完成」 */
export function AdminOrderConfirmHomeDeliveryButton({ orderId }: { orderId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [state, formAction, pending] = useActionState(
    markHomeOrderDeliveredAction,
    undefined as MarkHomeOrderDeliveredActionState | undefined,
  );

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!state?.ok) return;
    setOpen(false);
    router.refresh();
  }, [state, router]);

  useActionSuccessToast(state, "已確認送達");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !pending) setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, pending]);

  const serverError = state && !state.ok ? state.error : undefined;

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
        aria-labelledby="admin-home-delivered-title"
        className="relative z-10 w-full max-w-md rounded-xl border border-border bg-card p-6 text-left shadow-lg shadow-black/10"
      >
        <h2 id="admin-home-delivered-title" className="text-lg font-semibold text-foreground">
          確認已送達
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          確認宅配包裹已由收件人收妥（或依物流狀態已送達）後，訂單將改為「已完成」，前台物流狀態顯示為「已送達」。
        </p>

        <form action={formAction} className="mt-5 flex flex-col gap-3">
          <input type="hidden" name="order_id" value={orderId} />
          {serverError ? <p className="text-sm text-destructive">{serverError}</p> : null}
          <div className="mt-1 flex flex-wrap justify-end gap-2">
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
              {pending ? "處理中…" : "確認送達"}
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
        className="shrink-0 rounded-full"
        onClick={() => setOpen(true)}
      >
        確認送達
      </Button>
      {mounted && typeof document !== "undefined" ? createPortal(modal, document.body) : null}
    </>
  );
}
