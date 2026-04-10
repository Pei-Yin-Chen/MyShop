"use client";

import { useId, useMemo, useState } from "react";
import Image from "next/image";
import { ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { AdminImagePreviewDialog } from "@/components/admin/AdminImagePreviewDialog";

const labelClass = "mb-1.5 block text-xs font-medium text-muted-foreground";

function normalizeUrlInput(u: string): string {
  return u.trim();
}

export function AdminImageUploadField({
  label,
  name,
  value,
  onValueChange,
  storagePrefix,
  disabled,
  error,
  helpText,
  previewImageClassName,
  /** 為 false 時不顯示頂部標題（由外層排版時使用，仍請傳 `label` 供無障礙用） */
  showLabel = true,
  /** 點擊縮圖以全螢幕預覽（與商品圖相同） */
  enablePreview = false,
  /** 預覽對話框的 `alt`（建議與 `label` 一致） */
  previewAlt,
}: {
  label: string;
  /** hidden input name */
  name: string;
  /** Use `""` when empty; avoid passing `undefined` after first render. */
  value: string | undefined;
  onValueChange: (url: string) => void;
  /** e.g. home/hero, home/gallery */
  storagePrefix: string;
  disabled?: boolean;
  error?: string;
  helpText?: string;
  /** Override preview `<Image>` className (default `object-cover`) */
  previewImageClassName?: string;
  showLabel?: boolean;
  enablePreview?: boolean;
  previewAlt?: string;
}) {
  /** Always defined so inputs stay controlled (avoid undefined → string warning). */
  const safeValue = value ?? "";
  const id = useId();
  const inputId = useMemo(() => `${id}-url`, [id]);
  const fileId = useMemo(() => `${id}-file`, [id]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  async function uploadFiles(files: FileList | null) {
    if (!files?.length) return;
    const supabase = createClient();
    setBusy(true);
    setMsg(null);
    try {
      const file = Array.from(files).find((f) => f.type.startsWith("image/"));
      if (!file) {
        setMsg("請選擇圖片檔");
        return;
      }
      const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
      const path = `${storagePrefix}/${crypto.randomUUID()}.${ext}`;
      const { error: upErr } = await supabase.storage.from("product-images").upload(path, file, {
        cacheControl: "3600",
        upsert: false,
      });
      if (upErr) {
        setMsg(upErr.message);
        return;
      }
      const {
        data: { publicUrl },
      } = supabase.storage.from("product-images").getPublicUrl(path);
      onValueChange(publicUrl);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className={cn("space-y-2", !showLabel && "space-y-0")} aria-label={!showLabel ? label : undefined}>
      {showLabel ? (
        <label className={labelClass} htmlFor={inputId}>
          {label}
        </label>
      ) : null}

      <input type="hidden" name={name} value={safeValue} />

      <div
        className={cn(
          "relative overflow-hidden rounded-xl border border-dashed border-border bg-muted/15 p-4",
          (disabled || busy) && "pointer-events-none opacity-70",
          error && "border-destructive ring-2 ring-destructive/10",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
        onDrop={(e) => {
          e.preventDefault();
          void uploadFiles(e.dataTransfer.files);
        }}
      >
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-[6rem_1fr] sm:items-start">
          <div className="relative size-24 overflow-hidden rounded-lg border border-border bg-muted">
            {safeValue ? (
              enablePreview ? (
                <>
                  <button
                    type="button"
                    className="relative block size-full cursor-zoom-in outline-none focus-visible:ring-2 focus-visible:ring-primary/40"
                    title="點擊放大預覽"
                    aria-label={`放大預覽：${label}`}
                    disabled={disabled || busy}
                    onClick={() => setPreviewOpen(true)}
                  >
                    <Image
                      src={safeValue}
                      alt=""
                      fill
                      className={previewImageClassName ?? "object-cover"}
                      sizes="96px"
                    />
                  </button>
                  <AdminImagePreviewDialog
                    open={previewOpen}
                    src={safeValue}
                    alt={previewAlt ?? label}
                    onClose={() => setPreviewOpen(false)}
                  />
                </>
              ) : (
                <Image
                  src={safeValue}
                  alt=""
                  fill
                  className={previewImageClassName ?? "object-cover"}
                  sizes="96px"
                />
              )
            ) : (
              <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
                —
              </div>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer">
                <input
                  id={fileId}
                  type="file"
                  accept="image/jpeg,image/png,image/webp,image/gif"
                  className="sr-only"
                  disabled={disabled || busy}
                  onChange={(e) => void uploadFiles(e.target.files)}
                />
                <span className="inline-flex h-9 items-center rounded-md bg-primary px-4 text-sm font-medium text-primary-foreground hover:bg-primary/90">
                  {busy ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" aria-hidden />
                      上傳中…
                    </>
                  ) : (
                    <>
                      <ImagePlus className="mr-2 size-4" aria-hidden />
                      選擇檔案
                    </>
                  )}
                </span>
              </label>
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                className="text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={disabled || busy || !safeValue}
                title="清除圖片"
                aria-label="清除圖片"
                onClick={() => onValueChange("")}
              >
                <Trash2 className="size-4" aria-hidden />
              </Button>
            </div>

            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Link2 className="size-3.5" aria-hidden />
              <span>或貼上外部圖片網址</span>
            </div>
            <input
              id={inputId}
              value={safeValue}
              onChange={(e) => onValueChange(normalizeUrlInput(e.target.value))}
              className={cn(
                "h-10 w-full rounded-lg border border-border bg-background px-3 font-mono text-xs outline-none focus:ring-2 focus:ring-primary/20",
                error && "border-destructive ring-2 ring-destructive/10",
              )}
              placeholder="https://"
              autoComplete="off"
              disabled={disabled || busy}
            />
            {helpText ? <p className="text-xs text-muted-foreground">{helpText}</p> : null}
            {msg ? <p className="text-xs text-destructive">{msg}</p> : null}
            {error ? (
              <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                {error}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}

