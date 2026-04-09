"use client";

import { useActionState, useEffect, useState, startTransition, type FormEvent } from "react";
import {
  updateFeaturedIntroAction,
  type FeaturedIntroFormState,
} from "@/app/admin/(panel)/settings/actions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { FeaturedIntroContent } from "@/data/home-page-defaults";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

const inputClass = (invalid?: boolean) =>
  cn(
    "w-full rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

export function AdminFeaturedIntroForm({ initial }: { initial: FeaturedIntroContent }) {
  const [state, formAction, isPending] = useActionState(
    updateFeaturedIntroAction,
    undefined as FeaturedIntroFormState | undefined,
  );

  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [browseAllLabel, setBrowseAllLabel] = useState(initial.browseAllLabel);
  const [browseAllHref, setBrowseAllHref] = useState(initial.browseAllHref);

  useEffect(() => {
    if (!state?.ok) return;
    setTitle(state.content.title);
    setSubtitle(state.content.subtitle);
    setBrowseAllLabel(state.content.browseAllLabel);
    setBrowseAllHref(state.content.browseAllHref);
  }, [state]);

  useActionSuccessToast(state, "已儲存，首頁將顯示更新後文案。");

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => {
      formAction(fd);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl space-y-3">
      <div>
        <label className={labelClass} htmlFor="fi-title">
          區塊標題
        </label>
        <input
          id="fi-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={cn(inputClass(!!fieldErrors?.title), "h-10")}
          autoComplete="off"
        />
        {fieldErrors?.title && (
          <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.title}
          </p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="fi-subtitle">
          副標說明
        </label>
        <textarea
          id="fi-subtitle"
          name="subtitle"
          value={subtitle}
          onChange={(e) => setSubtitle(e.target.value)}
          rows={4}
          className={cn(inputClass(!!fieldErrors?.subtitle), "min-h-[6rem] py-2.5")}
        />
        {fieldErrors?.subtitle && (
          <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.subtitle}
          </p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="fi-browse-label">
          「瀏覽更多」按鈕文字
        </label>
        <input
          id="fi-browse-label"
          name="browseAllLabel"
          value={browseAllLabel}
          onChange={(e) => setBrowseAllLabel(e.target.value)}
          className={cn(inputClass(!!fieldErrors?.browseAllLabel), "h-10")}
          autoComplete="off"
        />
        {fieldErrors?.browseAllLabel && (
          <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.browseAllLabel}
          </p>
        )}
      </div>

      <div>
        <label className={labelClass} htmlFor="fi-browse-href">
          按鈕連結
        </label>
        <input
          id="fi-browse-href"
          name="browseAllHref"
          value={browseAllHref}
          onChange={(e) => setBrowseAllHref(e.target.value)}
          placeholder="/products"
          className={cn(inputClass(!!fieldErrors?.browseAllHref), "h-10 font-mono text-xs")}
          autoComplete="off"
        />
        {fieldErrors?.browseAllHref && (
          <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
            {fieldErrors.browseAllHref}
          </p>
        )}
        <p className="mt-1.5 text-xs text-muted-foreground">
          站內頁面請以 <code className="rounded bg-muted px-1 py-0.5">/</code> 開頭；外連請用完整網址。
        </p>
      </div>

      {serverError && !fieldErrors && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}
      {serverError && fieldErrors && Object.keys(fieldErrors).length === 0 && (
        <p className="text-sm text-destructive">{serverError}</p>
      )}

      <div className="flex justify-end border-t border-border/60 pt-4">
        <Button type="submit" disabled={isPending} size="lg" className="min-w-[9rem] rounded-full">
          {isPending ? "儲存中…" : "儲存設定"}
        </Button>
      </div>
    </form>
  );
}
