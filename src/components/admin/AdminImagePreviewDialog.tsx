"use client";

import { useEffect } from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AdminImagePreviewDialog({
  open,
  src,
  alt,
  onClose,
}: {
  open: boolean;
  src: string;
  alt: string;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [open, onClose]);

  if (!open || typeof document === "undefined") return null;

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" role="presentation">
      <button
        type="button"
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        aria-label="關閉預覽"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="圖片預覽"
        className="relative z-10 flex w-full max-w-[min(95vw,1200px)] flex-col items-center"
      >
        <Button
          type="button"
          variant="secondary"
          size="icon-sm"
          className="absolute right-0 top-0 z-20 shadow-md"
          aria-label="關閉"
          onClick={onClose}
        >
          <X className="size-4" aria-hidden />
        </Button>
        <div className="relative mt-10 h-[min(85vh,860px)] w-full">
          <Image
            src={src}
            alt={alt}
            fill
            className="object-contain"
            sizes="(max-width: 1200px) 95vw, 1200px"
          />
        </div>
      </div>
    </div>,
    document.body,
  );
}
