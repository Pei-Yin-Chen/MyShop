import Image from "next/image";
import { shopImages } from "@/data/remote-images";

const galleryImages = [
  { src: shopImages.fruitTart, alt: "季節水果塔" },
  { src: shopImages.userBakery900, alt: "烘焙店內風景" },
  { src: shopImages.seasonSundae, alt: "草莓奶油小杯蛋糕" },
  { src: shopImages.breadLoaves, alt: "新鮮麵包" },
  { src: shopImages.macarons, alt: "甜點小點拼盤" },
  { src: shopImages.cinnamonRoll, alt: "手作肉桂捲" },
];

function GallerySlide({
  src,
  alt,
  priority = false,
}: {
  src: string;
  alt: string;
  priority?: boolean;
}) {
  return (
    <div className="relative h-56 w-72 shrink-0 overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm sm:h-64 sm:w-80">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover object-center"
        sizes="320px"
        priority={priority}
      />
    </div>
  );
}

export function ProductGallery() {
  return (
    <section className="overflow-hidden border-t border-border/60 bg-muted/40 py-24">
      <div className="container mx-auto mb-12 px-4">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            店內風景
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">
            麵粉、奶油與果香交織的空間，每一幕都是日常裡的小儀式。
          </p>
        </div>
      </div>

      <div className="relative">
        <div
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-muted/90 to-transparent sm:w-20"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-muted/90 to-transparent sm:w-20"
          aria-hidden
        />

        <div className="overflow-hidden">
          <div className="flex w-max gap-4 pr-4 animate-gallery-marquee hover:[animation-play-state:paused]">
            {[0, 1].map((dup) =>
              galleryImages.map((image, index) => (
                <GallerySlide
                  key={`${dup}-${index}`}
                  src={image.src}
                  alt={image.alt}
                  priority={dup === 0 && index < 2}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
