"use client";

import { useActionState, useState, startTransition, type FormEvent } from "react";
import { AdminFormFooterActions } from "@/components/admin/AdminFormFooterActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import {
  updateFooterQuickLinksAction,
  type FooterQuickLinksFormState,
} from "@/app/admin/(panel)/settings/footer-quick-links-actions";
import type { FooterQuickLinksContent } from "@/lib/footer-quick-links";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

export function AdminFooterQuickLinksForm({ initial }: { initial: FooterQuickLinksContent }) {
  const [state, formAction, pending] = useActionState(
    updateFooterQuickLinksAction,
    undefined as FooterQuickLinksFormState | undefined,
  );
  useActionSuccessToast(state, "已儲存");

  const [aboutLabel, setAboutLabel] = useState(initial.aboutLabel);
  const [aboutHref, setAboutHref] = useState(initial.aboutHref);

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    startTransition(() => formAction(new FormData(e.currentTarget)));
  }

  return (
    <form onSubmit={onSubmit} className="max-w-2xl space-y-6">
      <p className="text-sm text-muted-foreground">
        僅影響頁尾「快速連結」區塊顯示的文字與網址。頁面標題與內文請在下方「說明頁內容」編輯。「所有商品」由網站固定顯示，無需在此設定。
      </p>

      <div className="rounded-xl border border-border/80 bg-muted/10 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">關於我們</p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className={labelClass} htmlFor="fq-about-label">
              連結文字
            </label>
            <input
              id="fq-about-label"
              name="aboutLabel"
              value={aboutLabel}
              onChange={(e) => setAboutLabel(e.target.value)}
              className={inputClass(!!fieldErrors?.aboutLabel)}
              autoComplete="off"
            />
            {fieldErrors?.aboutLabel ? (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.aboutLabel}</p>
            ) : null}
          </div>
          <div>
            <label className={labelClass} htmlFor="fq-about-href">
              連結網址
            </label>
            <input
              id="fq-about-href"
              name="aboutHref"
              value={aboutHref}
              onChange={(e) => setAboutHref(e.target.value)}
              className={cn(inputClass(!!fieldErrors?.aboutHref), "font-mono text-xs")}
              placeholder="/about 或 https://…"
              autoComplete="off"
            />
            {fieldErrors?.aboutHref ? (
              <p className="mt-1 text-xs text-destructive">{fieldErrors.aboutHref}</p>
            ) : null}
          </div>
        </div>
      </div>

      {state?.ok === false && state.error && !state.fieldErrors ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <AdminFormFooterActions backHref="/admin/settings">
        <Button type="submit" disabled={pending} size="lg" className="min-h-9 min-w-[9rem] rounded-full">
          {pending ? "儲存中…" : "儲存"}
        </Button>
      </AdminFormFooterActions>
    </form>
  );
}
