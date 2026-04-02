"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ProductImageGallery({ images, name }: { images: string[]; name: string }) {
  const safeImages = images.length > 0 ? images : [];
  const [mainImage, setMainImage] = useState(safeImages[0] ?? "");

  if (safeImages.length === 0 || !mainImage) {
    return (
      <div
        className="flex aspect-square items-center justify-center rounded-2xl border border-dashed border-border bg-muted/30 text-sm text-muted-foreground"
        role="img"
        aria-label={`${name}（無圖片）`}
      >
        尚無商品圖片
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
        <AspectRatio ratio={1}>
          <Image
            src={mainImage}
            alt={name}
            fill
            className="object-cover transition-all duration-500"
            priority
            sizes="(max-width: 768px) 100vw, 50vw"
          />
        </AspectRatio>
      </div>

      {safeImages.length > 1 && (
        <div
          className="grid grid-cols-4 gap-3 sm:gap-4"
          role="tablist"
          aria-label="商品縮圖"
        >
          {safeImages.map((img, index) => {
            const selected = mainImage === img;
            return (
              <button
                key={`${img}-${index}`}
                type="button"
                role="tab"
                aria-selected={selected}
                aria-label={`${name} 圖 ${index + 1}`}
                onClick={() => setMainImage(img)}
                className={cn(
                  "relative aspect-square cursor-pointer overflow-hidden rounded-lg border-2 transition-all hover:opacity-80 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                  selected ? "border-primary ring-2 ring-primary/10" : "border-transparent",
                )}
              >
                <Image
                  src={img}
                  alt=""
                  fill
                  className="object-cover"
                  sizes="15vw"
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
