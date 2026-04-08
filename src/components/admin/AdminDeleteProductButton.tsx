"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { deleteProductAction } from "@/app/admin/(panel)/products/actions";
import { Button } from "@/components/ui/button";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

export function AdminDeleteProductButton({
  productId,
  productName,
}: {
  productId: string;
  /** 供 aria-label，列表列建議傳入 */
  productName?: string;
}) {
  const router = useRouter();
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pending, setPending] = useState(false);

  async function runDelete() {
    setConfirmOpen(false);
    setPending(true);
    const r = await deleteProductAction(productId);
    setPending(false);
    if (!r.ok) window.alert(r.error ?? "刪除失敗");
    else router.push("/admin/products");
  }

  return (
    <>
      <Button
        type="button"
        variant="ghost"
        size="icon-sm"
        className="text-destructive hover:bg-destructive/10 hover:text-destructive"
        title="刪除"
        aria-label={productName ? `刪除「${productName}」` : "刪除商品"}
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
        title="確定刪除此商品？"
        description="刪除後無法復原，若商品曾出現在訂單中，相關紀錄可能仍會保留歷史關聯。"
        cancelLabel="取消"
        confirmLabel="確定刪除"
        confirmVariant="destructive"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => void runDelete()}
      />
    </>
  );
}
