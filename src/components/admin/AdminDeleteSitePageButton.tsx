"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCustomerServicePageAction } from "@/app/admin/(panel)/settings/site-pages-actions";
import { Button } from "@/components/ui/button";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

type Props = {
  slug: string;
  /** 供確認文案與 aria-label */
  pageTitle: string;
  /** 編輯頁：帶文字按鈕；列表：僅圖示 */
  appearance?: "full" | "icon";
  /** 刪除成功後：在列表頁用 refresh；編輯頁導向列表 */
  afterDelete?: "refresh" | "navigate";
};

export function AdminDeleteSitePageButton({
  slug,
  pageTitle,
  appearance = "full",
  afterDelete = "navigate",
}: Props) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function runDelete() {
    setConfirmOpen(false);
    setPending(true);
    const r = await deleteCustomerServicePageAction(slug);
    setPending(false);
    if (!r.ok) window.alert(r.error ?? "刪除失敗");
    else if (afterDelete === "refresh") router.refresh();
    else router.push("/admin/settings/site-pages");
  }

  const trigger =
    appearance === "icon" ? (
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        title="刪除此說明頁"
        aria-label={`刪除說明頁「${pageTitle}」`}
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {pending ? <Loader2 className="size-4 animate-spin" aria-hidden /> : <Trash2 className="size-4" aria-hidden />}
      </Button>
    ) : (
      <Button
        type="button"
        variant="outline"
        size="lg"
        className="rounded-full border-destructive/40 text-destructive hover:bg-destructive/10 hover:text-destructive"
        title="刪除此說明頁"
        aria-label={`刪除說明頁「${pageTitle}」`}
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
            刪除中…
          </>
        ) : (
          <>
            <Trash2 className="mr-2 size-4" aria-hidden />
            刪除說明頁
          </>
        )}
      </Button>
    );

  return (
    <>
      {trigger}

      <AdminConfirmDialog
        open={confirmOpen}
        title="確定刪除此說明頁？"
        description={`將刪除「${pageTitle}」（網址名稱：${slug}）。前台對應網址將無法開啟；若頁尾仍有連結指到此頁，請一併到「網站說明」調整。刪除後無法復原。`}
        cancelLabel="取消"
        confirmLabel="確定刪除"
        confirmVariant="destructive"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void runDelete()}
      />
    </>
  );
}
