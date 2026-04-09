"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Archive, Check, Pencil, Star, StarOff, Trash2, X } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Button } from "@/components/ui/button";
import { AdminDeleteProductButton } from "@/components/admin/AdminDeleteProductButton";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";
import { cn } from "@/lib/utils";
import {
  bulkDeleteProductsAction,
  bulkSetProductFeaturedAction,
  bulkSetProductStatusAction,
  type BulkProductActionState,
} from "@/app/admin/(panel)/products/actions";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";

export type AdminProductsRow = {
  id: string;
  name: string;
  price: number;
  stock_quantity: number | null;
  status: string | null;
  display_order: number;
  last_edited: string;
  image_url: string | null;
  category_name: string | null;
};

const STATUS_LABEL: Record<string, string> = {
  draft: "草稿",
  active: "上架",
  archived: "下架",
  sold_out: "售完",
};

const checkboxClass =
  "size-4 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30";

export function AdminProductsTableClient({
  rows,
  emptyMessage,
}: {
  rows: AdminProductsRow[];
  emptyMessage: string;
}) {
  const [selected, setSelected] = useState<Set<string>>(() => new Set());
  const selectedIds = useMemo(() => Array.from(selected), [selected]);
  const idsValue = selectedIds.join(",");

  const allChecked = rows.length > 0 && selected.size === rows.length;
  const someChecked = selected.size > 0 && selected.size < rows.length;

  const [statusState, statusAction, statusPending] = useActionState(
    bulkSetProductStatusAction,
    undefined as BulkProductActionState | undefined,
  );
  const [featuredState, featuredAction, featuredPending] = useActionState(
    bulkSetProductFeaturedAction,
    undefined as BulkProductActionState | undefined,
  );
  const [deleteState, deleteAction, deletePending] = useActionState(
    bulkDeleteProductsAction,
    undefined as BulkProductActionState | undefined,
  );

  useActionSuccessToast(statusState, "已更新商品");
  useActionSuccessToast(featuredState, "已更新商品");
  useActionSuccessToast(deleteState, "已刪除商品");

  const anyPending = statusPending || featuredPending || deletePending;

  useEffect(() => {
    if (statusState?.ok || featuredState?.ok || deleteState?.ok) {
      setSelected(new Set());
    }
  }, [statusState, featuredState, deleteState]);

  const [confirmOpen, setConfirmOpen] = useState(false);

  return (
    <div className="overflow-x-auto">
      {selected.size > 0 ? (
        <div className="sticky top-0 z-10 border-b border-border bg-background/90 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-background/70">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-3">
              <span className="inline-flex items-center rounded-full border border-border bg-muted/30 px-3 py-1 text-sm text-foreground">
                已選取 <span className="ml-1 font-semibold tabular-nums">{selected.size}</span>
              </span>
              <Button
                type="button"
                size="icon-lg"
                variant="outline"
                className="rounded-full"
                disabled={anyPending}
                onClick={() => setSelected(new Set())}
                title="清除勾選"
                aria-label="清除勾選"
              >
                <X className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <form action={featuredAction}>
                <input type="hidden" name="ids" value={idsValue} />
                <input type="hidden" name="featured" value="true" />
                <Button
                  type="submit"
                  size="icon-lg"
                  className="rounded-full"
                  disabled={anyPending}
                  title="設為精選"
                  aria-label="設為精選"
                >
                  <Star className="size-4" aria-hidden />
                </Button>
              </form>
              <form action={featuredAction}>
                <input type="hidden" name="ids" value={idsValue} />
                <input type="hidden" name="featured" value="false" />
                <Button
                  type="submit"
                  size="icon-lg"
                  variant="outline"
                  className="rounded-full"
                  disabled={anyPending}
                  title="取消精選"
                  aria-label="取消精選"
                >
                  <StarOff className="size-4" aria-hidden />
                </Button>
              </form>

              <form action={statusAction}>
                <input type="hidden" name="ids" value={idsValue} />
                <input type="hidden" name="status" value="active" />
                <Button
                  type="submit"
                  size="icon-lg"
                  className="rounded-full"
                  disabled={anyPending}
                  title="批次上架"
                  aria-label="批次上架"
                >
                  <Check className="size-4" aria-hidden />
                </Button>
              </form>
              <form action={statusAction}>
                <input type="hidden" name="ids" value={idsValue} />
                <input type="hidden" name="status" value="archived" />
                <Button
                  type="submit"
                  size="icon-lg"
                  variant="outline"
                  className="rounded-full"
                  disabled={anyPending}
                  title="批次下架"
                  aria-label="批次下架"
                >
                  <Archive className="size-4" aria-hidden />
                </Button>
              </form>

              <Button
                type="button"
                size="icon-lg"
                variant="destructive"
                className="rounded-full"
                disabled={anyPending}
                onClick={() => setConfirmOpen(true)}
                title="批次刪除"
                aria-label="批次刪除"
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <table className="w-full text-left text-sm">
        <thead className="bg-muted/50 border-b border-border text-muted-foreground font-medium">
          <tr>
            <th className="px-3 py-3 w-10">
              <input
                type="checkbox"
                className={checkboxClass}
                checked={allChecked}
                ref={(el) => {
                  if (el) el.indeterminate = someChecked;
                }}
                onChange={(e) => {
                  const next = new Set<string>();
                  if (e.target.checked) {
                    for (const r of rows) next.add(r.id);
                  }
                  setSelected(next);
                }}
                aria-label="全選"
              />
            </th>
            <th className="px-4 py-3 w-14">圖</th>
            <th className="px-4 py-3 text-left">名稱</th>
            <th className="px-4 py-3">分類</th>
            <th className="px-4 py-3 text-left">價格</th>
            <th className="px-4 py-3 text-left">庫存</th>
            <th className="px-4 py-3 text-left">狀態</th>
            <th className="px-4 py-3 text-left">顯示順序</th>
            <th className="px-4 py-3 text-left">最後編輯</th>
            <th className="px-4 py-3 text-right">操作</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border bg-card">
          {rows.map((p) => {
            const checked = selected.has(p.id);
            return (
              <tr key={p.id} className={cn("hover:bg-muted/30 transition-colors", checked && "bg-muted/20")}>
                <td className="px-3 py-3">
                  <input
                    type="checkbox"
                    className={checkboxClass}
                    checked={checked}
                    onChange={(e) => {
                      setSelected((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) next.add(p.id);
                        else next.delete(p.id);
                        return next;
                      });
                    }}
                    aria-label={`選取 ${p.name}`}
                  />
                </td>
                <td className="px-4 py-3">
                  <div className="relative size-10 overflow-hidden rounded-md border border-border bg-muted">
                    {p.image_url ? (
                      <Image src={p.image_url} alt="" fill className="object-cover" sizes="40px" />
                    ) : (
                      <span className="flex h-full items-center justify-center text-[10px] text-muted-foreground">
                        —
                      </span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3 font-medium text-foreground max-w-[200px] truncate">
                  {p.name}
                </td>
                <td className="px-4 py-3 text-muted-foreground">{p.category_name ?? "—"}</td>
                <td className="px-4 py-3 tabular-nums">{p.price}</td>
                <td className="px-4 py-3 tabular-nums">{p.stock_quantity ?? "—"}</td>
                <td className="px-4 py-3">
                  <span
                    className={cn(
                      "inline-flex rounded-full border px-2 py-0.5 text-xs font-medium",
                      p.status === "active" &&
                        "border-emerald-200/80 bg-emerald-100 text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-100",
                      p.status === "sold_out" &&
                        "border-orange-300/85 bg-orange-100 text-orange-950 dark:border-orange-800 dark:bg-orange-950/45 dark:text-orange-100",
                      p.status === "archived" &&
                        "border-neutral-200 bg-neutral-100 text-neutral-800 dark:border-neutral-700 dark:bg-neutral-800/80 dark:text-neutral-200",
                      p.status === "draft" &&
                        "border-slate-300/90 bg-slate-100 text-slate-800 dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-200",
                    )}
                  >
                    {p.status ? STATUS_LABEL[p.status] ?? p.status : "—"}
                  </span>
                </td>
                <td className="px-4 py-3 tabular-nums">{p.display_order}</td>
                <td className="px-4 py-3 whitespace-nowrap text-muted-foreground tabular-nums text-xs">
                  {p.last_edited}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex justify-end gap-0.5">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className={cn(
                        buttonVariants({ variant: "ghost", size: "icon-sm" }),
                        "text-muted-foreground hover:text-foreground",
                      )}
                      title="編輯"
                      aria-label={`編輯「${p.name}」`}
                    >
                      <Pencil className="size-4" aria-hidden />
                    </Link>
                    <AdminDeleteProductButton productId={p.id} productName={p.name} />
                  </div>
                </td>
              </tr>
            );
          })}
          {rows.length === 0 ? (
            <tr>
              <td colSpan={10} className="px-6 py-12 text-center text-muted-foreground">
                {emptyMessage}
              </td>
            </tr>
          ) : null}
        </tbody>
      </table>

      <AdminConfirmDialog
        open={confirmOpen}
        title="確定批次刪除？"
        description="刪除後無法復原，若商品曾出現在訂單中，相關紀錄可能仍會保留歷史關聯。"
        cancelLabel="取消"
        confirmLabel="確定刪除"
        confirmVariant="destructive"
        onCancel={() => setConfirmOpen(false)}
        onConfirm={() => {
          setConfirmOpen(false);
          const fd = new FormData();
          fd.set("ids", idsValue);
          deleteAction(fd);
        }}
      />
    </div>
  );
}

