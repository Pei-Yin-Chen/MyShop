"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteCategoryAction } from "@/app/admin/(panel)/products/category-actions";
import { Button } from "@/components/ui/button";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

export function AdminDeleteCategoryButton({
  categoryId,
  categoryName,
}: {
  categoryId: string;
  /** 供 aria-label */
  categoryName?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function runDelete() {
    setConfirmOpen(false);
    setPending(true);
    const r = await deleteCategoryAction(categoryId);
    setPending(false);
    if (!r.ok) window.alert(r.error ?? "刪除失敗");
    else router.refresh();
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        title="刪除"
        aria-label={categoryName ? `刪除「${categoryName}」分類` : "刪除分類"}
        disabled={pending}
        onClick={() => setConfirmOpen(true)}
      >
        {pending ? (
          <Loader2 className="size-4 animate-spin" aria-hidden />
        ) : (
          <Trash2 className="size-4" aria-hidden />
        )}
      </Button>

      <AdminConfirmDialog
        open={confirmOpen}
        title="確定刪除此分類？"
        description="刪除後無法復原；若仍有商品使用該分類將無法刪除。"
        cancelLabel="取消"
        confirmLabel="確定刪除"
        confirmVariant="destructive"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void runDelete()}
      />
    </>
  );
}
