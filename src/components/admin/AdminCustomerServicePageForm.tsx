"use client";

import { useActionState, useEffect, useState, startTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AdminFormFooterActions } from "@/components/admin/AdminFormFooterActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import {
  createCustomerServicePageAction,
  updateCustomerServicePageAction,
  type CustomerServicePageFormState,
} from "@/app/admin/(panel)/settings/site-pages-actions";
import { AdminCustomerServiceRichTextEditor } from "@/components/admin/AdminCustomerServiceRichTextEditor";
import { CUSTOMER_SERVICE_SLUG_RE, customerServicePagePublicPath } from "@/lib/customer-service";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

export function AdminCustomerServicePageForm({
  mode,
  initialSlug,
  initialTitle,
  initialMetaDescription,
  initialBodyHtml,
}: {
  mode: "create" | "edit";
  initialSlug?: string;
  initialTitle: string;
  initialMetaDescription: string;
  initialBodyHtml: string;
}) {
  const router = useRouter();
  const [slug, setSlug] = useState(initialSlug ?? "");
  const [title, setTitle] = useState(initialTitle);
  const [metaDescription, setMetaDescription] = useState(initialMetaDescription);
  const action = mode === "create" ? createCustomerServicePageAction : updateCustomerServicePageAction;
  const [state, formAction, pending] = useActionState(
    action,
    undefined as CustomerServicePageFormState | undefined,
  );
  useActionSuccessToast(state, mode === "create" ? "已新增說明頁" : "已儲存");

  useEffect(() => {
    if (!state?.ok || mode !== "create") return;
    const s = slug.trim().toLowerCase();
    if (s && CUSTOMER_SERVICE_SLUG_RE.test(s)) {
      router.push(`/admin/settings/site-pages/${s}`);
    }
  }, [state, mode, router, slug]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (mode === "create") {
      fd.set("slug", slug.trim().toLowerCase());
    }
    startTransition(() => formAction(fd));
  }

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const editPublicPath =
    mode === "edit" && initialSlug ? customerServicePagePublicPath(initialSlug) : null;

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-5">
      {mode === "edit" ? <input type="hidden" name="slug" value={initialSlug ?? ""} /> : null}

      {mode === "edit" && editPublicPath ? (
        <div className="rounded-lg border border-border/80 bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
          <span className="font-medium text-foreground">顧客預設網址：</span>
          <code className="ml-1.5 rounded bg-muted px-1.5 py-0.5 font-mono text-xs text-foreground">
            {editPublicPath}
          </code>
        </div>
      ) : null}

      {mode === "create" ? (
        <div>
          <label className={labelClass} htmlFor="cs-slug">
            網址名稱（英文）
          </label>
          <p className="mb-2 text-xs text-muted-foreground">
            一般說明頁網址為「你的網站網址
            <code className="mx-0.5 rounded bg-muted px-1 font-mono">/名稱</code>
            」（例如 /faq）。若名稱為{" "}
            <code className="rounded bg-muted px-1 font-mono">about</code>
            ，前台為「關於我們」專用路徑{" "}
            <code className="rounded bg-muted px-1 font-mono">/about</code>
            。請用小寫英文、數字或連字號（-），勿空格。
          </p>
          <input
            id="cs-slug"
            value={slug}
            onChange={(e) => setSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))}
            className={inputClass(!!fieldErrors?.slug)}
            placeholder="例如 faq"
            autoComplete="off"
          />
          {fieldErrors?.slug ? (
            <p className="mt-1 text-xs text-destructive">{fieldErrors.slug}</p>
          ) : null}
        </div>
      ) : null}

      <div>
        <label className={labelClass} htmlFor="cs-title">
          頁面大標題
        </label>
        <p className="mb-2 text-xs text-muted-foreground">顧客打開此頁時，最上方顯示的標題。</p>
        <input
          id="cs-title"
          name="title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className={inputClass(!!fieldErrors?.title)}
          autoComplete="off"
        />
        {fieldErrors?.title ? (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.title}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClass} htmlFor="cs-meta">
          標題下方簡短說明（選填）
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          顯示在大標題下面一行小字；搜尋 Google 時也可能用到這段文字。可不填。
        </p>
        <textarea
          id="cs-meta"
          name="meta_description"
          rows={2}
          value={metaDescription}
          onChange={(e) => setMetaDescription(e.target.value)}
          className={cn(inputClass(!!fieldErrors?.meta_description), "h-auto py-2.5")}
        />
        {fieldErrors?.meta_description ? (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.meta_description}</p>
        ) : null}
      </div>

      <div>
        <label className={labelClass}>內文</label>
        <p className="mb-2 text-xs text-muted-foreground">
          主要說明文字。上方工具列可設定粗體、標題、項目符號、連結等。
        </p>
        <AdminCustomerServiceRichTextEditor
          key={mode === "edit" ? initialSlug : "new"}
          initialHtml={initialBodyHtml}
          invalid={!!fieldErrors?.body_html}
        />
        {fieldErrors?.body_html ? (
          <p className="mt-1 text-xs text-destructive">{fieldErrors.body_html}</p>
        ) : null}
      </div>

      {state?.ok === false && state.error && !state.fieldErrors ? (
        <p className="text-sm text-destructive">{state.error}</p>
      ) : null}

      <AdminFormFooterActions backHref="/admin/settings/site-pages" backLabel="返回列表">
        <Button type="submit" disabled={pending} size="lg" className="min-h-9 min-w-[9rem] rounded-full">
          {pending ? "儲存中…" : mode === "create" ? "建立說明頁" : "儲存內容"}
        </Button>
      </AdminFormFooterActions>
    </form>
  );
}
