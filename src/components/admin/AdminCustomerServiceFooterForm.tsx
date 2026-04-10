"use client";

import { useActionState, useMemo, useState, startTransition, type FormEvent } from "react";
import { AdminFormFooterActions } from "@/components/admin/AdminFormFooterActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import {
  updateCustomerServiceFooterAction,
  type CustomerServiceFooterFormState,
} from "@/app/admin/(panel)/settings/site-pages-actions";
import type { CustomerServiceFooterLink } from "@/lib/customer-service";
import { Trash2 } from "lucide-react";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

export function AdminCustomerServiceFooterForm({ initial }: { initial: CustomerServiceFooterLink[] }) {
  const [state, formAction, pending] = useActionState(
    updateCustomerServiceFooterAction,
    undefined as CustomerServiceFooterFormState | undefined,
  );
  useActionSuccessToast(state, "已儲存");

  const [links, setLinks] = useState<CustomerServiceFooterLink[]>(() =>
    initial.length > 0 ? initial : [{ label: "", href: "" }],
  );

  const jsonPayload = useMemo(() => JSON.stringify(links), [links]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    fd.set("footer_links_json", jsonPayload);
    startTransition(() => formAction(fd));
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-4">
      <p className="text-sm text-muted-foreground">
        這些連結會出現在網站最下方「客戶服務」區塊。可連到你建立的說明頁（網址請填該頁「顧客預設網址」，例如 /faq、/about），或連到其他網站（請以 https:// 開頭）。
      </p>

      {state?.ok === false && state.error ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <div className="space-y-3">
        {links.map((row, i) => (
          <div
            key={i}
            className="grid grid-cols-1 gap-3 rounded-lg border border-border/80 bg-muted/20 p-3 sm:grid-cols-[1fr_1fr_auto]"
          >
            <div>
              <label className={labelClass} htmlFor={`cs-link-label-${i}`}>
                連結文字
              </label>
              <input
                id={`cs-link-label-${i}`}
                value={row.label}
                onChange={(e) =>
                  setLinks((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, label: e.target.value } : x)),
                  )
                }
                className={inputClass()}
                placeholder="例如：常見問題"
                autoComplete="off"
              />
            </div>
            <div>
              <label className={labelClass} htmlFor={`cs-link-href-${i}`}>
                連結網址
              </label>
              <input
                id={`cs-link-href-${i}`}
                value={row.href}
                onChange={(e) =>
                  setLinks((prev) =>
                    prev.map((x, j) => (j === i ? { ...x, href: e.target.value } : x)),
                  )
                }
                className={cn(inputClass(), "font-mono text-xs")}
                placeholder="例：/faq 或 https://…"
                autoComplete="off"
              />
            </div>
            <div className="flex items-end sm:justify-end">
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10"
                disabled={links.length <= 1}
                title="移除此列"
                aria-label="移除此列"
                onClick={() => setLinks((prev) => prev.filter((_, j) => j !== i))}
              >
                <Trash2 className="size-4" />
              </Button>
            </div>
          </div>
        ))}
      </div>

      <Button
        type="button"
        size="lg"
        className="min-h-9 min-w-[9rem] rounded-full"
        onClick={() => setLinks((prev) => [...prev, { label: "", href: "" }])}
      >
        新增
      </Button>

      <AdminFormFooterActions backHref="/admin/settings">
        <Button type="submit" disabled={pending} size="lg" className="min-h-9 min-w-[9rem] rounded-full">
          {pending ? "儲存中…" : "儲存"}
        </Button>
      </AdminFormFooterActions>
    </form>
  );
}
