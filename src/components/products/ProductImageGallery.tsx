"use client";

import { useState } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { AspectRatio } from "@/components/ui/aspect-ratio";

export function ProductImageGallery({ images, name }: { images: string[]; name: string }) {
  const [mainImage, setMainImage] = useState(images[0]);

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
      
      {images.length > 1 && (
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setMainImage(img)}
              className={cn(
                "relative aspect-square overflow-hidden rounded-lg border-2 transition-all hover:opacity-80",
                mainImage === img ? "border-primary ring-2 ring-primary/10" : "border-transparent"
              )}
            >
              <Image
                src={img}
                alt={`${name} 預覽圖 ${i + 1}`}
                fill
                className="object-cover"
                sizes="15vw"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
