"use client";

import { useActionState } from "react";
import { importMemberFromOrderAction, type MemberActionState } from "@/app/admin/(panel)/members/actions";
import { Button } from "@/components/ui/button";

export function AdminMemberImportForm() {
  const [state, formAction, pending] = useActionState(
    importMemberFromOrderAction,
    undefined as MemberActionState | undefined,
  );

  return (
    <form action={formAction} className="space-y-3">
      <div className="space-y-2">
        <label htmlFor="order_key" className="block text-sm font-medium text-foreground">
          訂單編號或訂單 ID
        </label>
        <input
          id="order_key"
          name="order_key"
          placeholder="例如 ORD-2024-001 或 UUID"
          className="h-9 w-full max-w-md rounded-lg border border-border bg-background px-2.5 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-60"
          disabled={pending}
          autoComplete="off"
        />
        <p className="text-xs text-muted-foreground">
          將訂單收件人 Email／姓名／電話／地址寫入會員；若 Email 已註冊則綁定訂單並標為購買會員。
        </p>
      </div>
      {state?.ok === false && state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}
      {state?.ok && state.message ? (
        <p className="text-sm text-emerald-700 dark:text-emerald-400">{state.message}</p>
      ) : null}
      <Button type="submit" disabled={pending} size="lg" className="rounded-full">
        {pending ? "處理中…" : "從訂單匯入購買會員"}
      </Button>
    </form>
  );
}
