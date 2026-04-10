"use client";

import { useActionState, useEffect, useMemo, useState, startTransition, type FormEvent } from "react";
import { AdminFormFooterActions } from "@/components/admin/AdminFormFooterActions";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ProductGallerySectionContent } from "@/data/home-page-defaults";
import { useActionSuccessToast } from "@/lib/hooks/use-action-success-toast";
import { updateGalleryAction, type GalleryFormState } from "@/app/admin/(panel)/settings/actions";
import { AdminImageUploadField } from "@/components/admin/AdminImageUploadField";
import { DndContext, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from "@dnd-kit/core";
import { SortableContext, arrayMove, useSortable, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical } from "lucide-react";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";
const inputClass = (invalid?: boolean) =>
  cn(
    "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
    invalid ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20",
  );

export function AdminHomeGalleryForm({ initial }: { initial: ProductGallerySectionContent }) {
  const [state, formAction, pending] = useActionState(
    updateGalleryAction,
    undefined as GalleryFormState | undefined,
  );
  useActionSuccessToast(state, "已儲存");

  const fieldErrors = state && !state.ok ? state.fieldErrors : undefined;
  const serverError = state && !state.ok ? state.error : undefined;
  const showServerError = Boolean(serverError) && Object.keys(fieldErrors ?? {}).length === 0;

  const [enabled, setEnabled] = useState(initial.enabled !== false);
  const [title, setTitle] = useState(initial.title);
  const [subtitle, setSubtitle] = useState(initial.subtitle);
  const [items, setItems] = useState(() =>
    Array.from({ length: 6 }).map((_, i) => {
      const it = initial.items[i];
      return {
        id: `slot-${i}`,
        imageUrl: it?.imageUrl ?? "",
        sortOrder: i,
      };
    }),
  );

  useEffect(() => {
    if (!state?.ok) return;
    setEnabled(state.content.enabled !== false);
    setTitle(state.content.title);
    setSubtitle(state.content.subtitle);
    setItems(
      Array.from({ length: 6 }).map((_, i) => {
        const it = state.content.items[i];
        return {
          id: `slot-${i}`,
          imageUrl: it?.imageUrl ?? "",
          sortOrder: i,
        };
      }),
    );
  }, [state]);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    startTransition(() => formAction(fd));
  }

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  function handleDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((prev) => {
      const oldIndex = prev.findIndex((x) => x.id === active.id);
      const newIndex = prev.findIndex((x) => x.id === over.id);
      if (oldIndex < 0 || newIndex < 0) return prev;
      const moved = arrayMove(prev, oldIndex, newIndex);
      return moved.map((it, idx) => ({ ...it, sortOrder: idx }));
    });
  }

  const ids = useMemo(() => items.map((it) => it.id), [items]);

  function SortableRow({
    item,
    index,
  }: {
    item: (typeof items)[number];
    index: number;
  }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
      id: item.id,
    });
    return (
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
        }}
        className={cn(
          "rounded-xl border border-border bg-card p-4",
          isDragging && "z-10 opacity-90 shadow-lg ring-2 ring-primary/30",
        )}
      >
        <input type="hidden" name={`item${index}ImageUrl`} value={item.imageUrl} />
        <input type="hidden" name={`item${index}SortOrder`} value={String(item.sortOrder)} />
        <p className={labelClass}>圖片 {index + 1}</p>
        <div className="flex items-start gap-2">
          {/* 與虛線框內 p-4 對齊後，與左側預覽 size-24 同高 */}
          <button
            type="button"
            className="mt-4 flex h-24 w-9 shrink-0 cursor-grab touch-none items-center justify-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground active:cursor-grabbing"
            title="拖曳排序"
            aria-label={`拖曳排序：圖片 ${index + 1}`}
            {...attributes}
            {...listeners}
          >
            <GripVertical className="size-5" aria-hidden />
          </button>
          <div className="min-w-0 flex-1">
            <AdminImageUploadField
              showLabel={false}
              label={`圖片 ${index + 1}`}
              previewAlt={`圖片 ${index + 1}`}
              enablePreview
              name={`item${index}ImageUrl`}
              value={item.imageUrl}
              onValueChange={(url) =>
                setItems((prev) => prev.map((p, idx) => (idx === index ? { ...p, imageUrl: url } : p)))
              }
              storagePrefix="home/gallery"
              disabled={pending}
              error={(fieldErrors as any)?.[`item${index}ImageUrl`]}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="max-w-3xl space-y-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className={labelClass}>顯示此區塊</label>
          <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-border/80 bg-muted/20 px-3 py-3">
            <input
              type="checkbox"
              name="enabled"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
              className="mt-0.5 size-4 shrink-0 rounded border-border text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
            />
            <span className="text-sm leading-snug text-foreground">
              在首頁顯示「圖片展示區」
              <span className="mt-1 block text-xs font-normal text-muted-foreground">
                關閉後首頁將不顯示此區塊（不會刪除資料）。
              </span>
            </span>
          </label>
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="gallery-title">
            標題
          </label>
          <input
            id="gallery-title"
            name="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass(!!fieldErrors?.title)}
          />
          {fieldErrors?.title ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.title}
            </p>
          ) : null}
        </div>
        <div className="sm:col-span-2">
          <label className={labelClass} htmlFor="gallery-subtitle">
            副標
          </label>
          <textarea
            id="gallery-subtitle"
            name="subtitle"
            rows={3}
            value={subtitle}
            onChange={(e) => setSubtitle(e.target.value)}
            className={cn(inputClass(!!fieldErrors?.subtitle), "h-auto py-2.5")}
          />
          {fieldErrors?.subtitle ? (
            <p className="mt-1 text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
              {fieldErrors.subtitle}
            </p>
          ) : null}
        </div>
      </div>

      <div className="space-y-4 rounded-xl border border-border bg-muted/15 p-4">
        <h3 className="text-sm font-semibold text-foreground">圖片清單（拖曳排序，最多 6 張）</h3>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={ids} strategy={verticalListSortingStrategy}>
            <div className="grid grid-cols-1 gap-4">
              {items.map((it, i) => (
                <SortableRow key={it.id} item={it} index={i} />
              ))}
            </div>
          </SortableContext>
        </DndContext>
        <p className="text-xs text-muted-foreground">
          直接拖曳每張圖片左側把手即可調整順序；第一張會最先出現在前台輪播。
        </p>
      </div>

      {showServerError ? <p className="text-sm text-destructive">{serverError}</p> : null}

      <AdminFormFooterActions backHref="/admin/settings">
        <Button type="submit" disabled={pending} size="lg" className="min-h-9 min-w-[9rem] rounded-full">
          {pending ? "儲存中…" : "儲存設定"}
        </Button>
      </AdminFormFooterActions>
    </form>
  );
}

