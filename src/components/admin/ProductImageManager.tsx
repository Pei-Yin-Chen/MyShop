"use client";

import { useEffect, useId, useMemo, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Trash2, Star, ImagePlus, Link2 } from "lucide-react";
import { AdminImagePreviewDialog } from "@/components/admin/AdminImagePreviewDialog";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  deleteProductImageAction,
  registerProductImageAction,
  reorderProductImagesAction,
  updateProductImageAction,
} from "@/app/admin/(panel)/products/actions";

export type AdminProductImageRow = {
  id: string;
  image_url: string;
  alt_text: string | null;
  sort_order: number;
};

function SortableImageRow({
  img,
  index,
  productId,
  productName,
  isMain,
  onUpdated,
  onMoveToFront,
  orderBusy,
  onPreview,
}: {
  img: AdminProductImageRow;
  index: number;
  productId: string;
  productName: string;
  isMain: boolean;
  onUpdated: () => void;
  onMoveToFront: () => void;
  orderBusy: boolean;
  onPreview: (src: string, alt: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: img.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const [urlDraft, setUrlDraft] = useState(img.image_url);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);

  const displayAlt = productName.trim() || `商品圖 ${index + 1}`;

  const applyUrl = async () => {
    setBusy(true);
    setMsg(null);
    const r = await updateProductImageAction(img.id, productId, {
      image_url: urlDraft,
      alt_text: null,
    });
    setBusy(false);
    if (!r.ok) setMsg(r.error ?? "更新失敗");
    else onUpdated();
  };

  const remove = async () => {
    if (!window.confirm("確定刪除此圖片？")) return;
    setBusy(true);
    const r = await deleteProductImageAction(img.id, productId);
    setBusy(false);
    if (!r.ok) setMsg(r.error ?? "刪除失敗");
    else onUpdated();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-start",
        isDragging && "z-10 opacity-90 shadow-lg ring-2 ring-primary/30",
      )}
    >
      <div className="flex shrink-0 gap-2">
        <button
          type="button"
          className="mt-1 cursor-grab touch-none rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-50"
          aria-label="拖曳排序"
          disabled={orderBusy}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="size-5" />
        </button>
        <button
          type="button"
          className="relative size-24 shrink-0 overflow-hidden rounded-lg border border-border bg-muted cursor-zoom-in outline-none ring-offset-2 transition-opacity hover:opacity-95 focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="放大檢視圖片"
          disabled={orderBusy}
          onClick={() => onPreview(img.image_url, displayAlt)}
        >
          <Image
            src={img.image_url}
            alt={displayAlt}
            fill
            className="object-cover"
            sizes="96px"
          />
        </button>
      </div>

      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          {isMain ? (
            <span className="rounded-full bg-primary/15 px-2 py-0.5 text-xs font-medium text-primary">
              主圖
            </span>
          ) : (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1 text-xs"
              disabled={busy || orderBusy}
              onClick={onMoveToFront}
            >
              <Star className="size-3.5" />
              設為主圖
            </Button>
          )}
          <span className="text-xs text-muted-foreground">排序 #{index + 1}</span>
        </div>

        <div className="space-y-1">
          <label className="text-xs font-medium text-muted-foreground">圖片網址</label>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <input
              value={urlDraft}
              onChange={(e) => setUrlDraft(e.target.value)}
              className="h-9 w-full min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
              placeholder="https://"
            />
            <Button type="button" size="sm" variant="secondary" disabled={busy} onClick={() => void applyUrl()}>
              套用網址
            </Button>
          </div>
        </div>

        {msg && <p className="text-xs text-destructive">{msg}</p>}

        <div className="flex justify-end">
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            disabled={busy}
            title="刪除"
            aria-label="刪除此圖片"
            onClick={() => void remove()}
          >
            <Trash2 className="size-4" aria-hidden />
          </Button>
        </div>
      </div>
    </div>
  );
}

function sortImages(rows: AdminProductImageRow[]) {
  return [...rows].sort((a, b) => a.sort_order - b.sort_order);
}

export function ProductImageManager({
  productId,
  productName,
  initialImages,
}: {
  productId: string;
  productName: string;
  initialImages: AdminProductImageRow[];
}) {
  const router = useRouter();
  const baseId = useId();
  const [items, setItems] = useState<AdminProductImageRow[]>(() => sortImages(initialImages));
  const [orderBusy, setOrderBusy] = useState(false);

  useEffect(() => {
    setItems(sortImages(initialImages));
  }, [initialImages]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const ids = useMemo(() => items.map((i) => i.id), [items]);

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = ids.indexOf(active.id as string);
    const newIndex = ids.indexOf(over.id as string);
    if (oldIndex < 0 || newIndex < 0) return;
    const prev = items;
    const next = arrayMove(items, oldIndex, newIndex);
    setItems(next);
    setOrderBusy(true);
    try {
      const r = await reorderProductImagesAction(
        productId,
        next.map((i) => i.id),
      );
      if (!r.ok) {
        setItems(prev);
        window.alert(r.error ?? "排序失敗");
      } else {
        router.refresh();
      }
    } finally {
      setOrderBusy(false);
    }
  };

  const moveToFront = async (imageId: string) => {
    const idx = items.findIndex((i) => i.id === imageId);
    if (idx <= 0) return;
    const prev = items;
    const row = items[idx];
    const next = [row, ...items.filter((i) => i.id !== imageId)];
    setItems(next);
    setOrderBusy(true);
    try {
      const r = await reorderProductImagesAction(
        productId,
        next.map((i) => i.id),
      );
      if (!r.ok) {
        setItems(prev);
        window.alert(r.error ?? "設定失敗");
      } else {
        router.refresh();
      }
    } finally {
      setOrderBusy(false);
    }
  };

  const [urlNew, setUrlNew] = useState("");
  const [uploadBusy, setUploadBusy] = useState(false);
  const [addMsg, setAddMsg] = useState<string | null>(null);
  const [preview, setPreview] = useState<{ src: string; alt: string } | null>(null);

  const addByUrl = async () => {
    setAddMsg(null);
    const url = urlNew.trim();
    if (!url) {
      setAddMsg("請輸入網址");
      return;
    }
    setUploadBusy(true);
    const r = await registerProductImageAction(productId, url, null);
    setUploadBusy(false);
    if (!r.ok) setAddMsg(r.error ?? "新增失敗");
    else {
      setUrlNew("");
      router.refresh();
    }
  };

  const onDropFiles = async (files: FileList | null) => {
    if (!files?.length) return;
    const supabase = createClient();
    setUploadBusy(true);
    setAddMsg(null);
    try {
      for (const file of Array.from(files)) {
        if (!file.type.startsWith("image/")) continue;
        const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
        const path = `${productId}/${crypto.randomUUID()}.${ext}`;
        const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
          cacheControl: "3600",
          upsert: false,
        });
        if (upErr) {
          setAddMsg(upErr.message);
          break;
        }
        const {
          data: { publicUrl },
        } = supabase.storage.from("product-images").getPublicUrl(path);
        const r = await registerProductImageAction(productId, publicUrl, null);
        if (!r.ok) {
          setAddMsg(r.error ?? "寫入圖片紀錄失敗");
          break;
        }
      }
      router.refresh();
    } finally {
      setUploadBusy(false);
    }
  };

  return (
    <div className="max-w-2xl min-h-0 space-y-6">
      <div
        className={cn(
          "flex min-h-[140px] flex-col items-center justify-center rounded-xl border-2 border-dashed border-border bg-muted/20 px-4 py-8 text-center transition-colors",
          uploadBusy && "pointer-events-none opacity-70",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          void onDropFiles(e.dataTransfer.files);
        }}
      >
        <ImagePlus className="mx-auto mb-2 size-10 text-muted-foreground" />
        <p className="text-sm font-medium text-foreground">拖曳圖片到此上傳</p>
        <p className="mt-1 text-xs text-muted-foreground">或選擇檔案、貼上外部圖片網址</p>
        <label className="mt-4 cursor-pointer">
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp,image/gif"
            className="sr-only"
            multiple
            disabled={uploadBusy}
            onChange={(e) => void onDropFiles(e.target.files)}
          />
          <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
            選擇檔案
          </span>
        </label>
      </div>

      <div className="space-y-2 rounded-xl border border-border bg-card p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-foreground">
          <Link2 className="size-4 text-muted-foreground" />
          以網址新增圖片
        </div>
        <div className="flex flex-col gap-2 sm:flex-row">
          <input
            id={`${baseId}-url`}
            value={urlNew}
            onChange={(e) => setUrlNew(e.target.value)}
            className="h-10 flex-1 rounded-md border border-border bg-background px-3 text-sm outline-none focus:ring-2 focus:ring-primary/20"
            placeholder="https://"
          />
          <Button type="button" disabled={uploadBusy} onClick={() => void addByUrl()}>
            新增
          </Button>
        </div>
        {addMsg && <p className="text-xs text-destructive">{addMsg}</p>}
      </div>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={(e) => void handleDragEnd(e)}
        autoScroll={{
          canScroll(element) {
            return element !== document.scrollingElement;
          },
        }}
      >
        <SortableContext items={ids} strategy={verticalListSortingStrategy}>
          <div className={cn("space-y-3", orderBusy && "pointer-events-none opacity-70")}>
            {items.length === 0 ? (
              <p className="rounded-lg border border-dashed border-border bg-muted/20 py-8 text-center text-sm text-muted-foreground">
                尚無圖片，請上傳或貼上網址。第一張圖為列表主圖。
              </p>
            ) : (
              items.map((img, index) => (
                <SortableImageRow
                  key={img.id}
                  img={img}
                  index={index}
                  productId={productId}
                  productName={productName}
                  isMain={index === 0}
                  orderBusy={orderBusy}
                  onMoveToFront={() => void moveToFront(img.id)}
                  onUpdated={() => router.refresh()}
                  onPreview={(src, alt) => setPreview({ src, alt })}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      <p className="text-xs text-muted-foreground">
        主圖為排序第一張（拖曳或「設為主圖」會立即儲存）。套用網址、新增／刪除圖片亦為即時更新；商品基本資料仍須按「儲存變更」。圖片替代文字（alt）前台預設為目前商品名稱，無需逐張填寫。欄位{" "}
        <code className="rounded bg-muted px-1">image_url</code> 與主圖同步。
      </p>

      <AdminImagePreviewDialog
        open={preview != null}
        src={preview?.src ?? ""}
        alt={preview?.alt ?? ""}
        onClose={() => setPreview(null)}
      />
    </div>
  );
}
