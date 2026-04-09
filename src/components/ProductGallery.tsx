import Image from "next/image";
import type { ProductGallerySectionContent } from "@/data/home-page-defaults";

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

export function ProductGallery({ content }: { content: ProductGallerySectionContent }) {
  if (content.enabled === false) return null;
  const galleryImages = content.items;

  return (
    <section className="overflow-hidden border-t border-border/60 bg-muted/40 py-24">
      <div className="container mx-auto mb-12 px-4">
        <div className="flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {content.title}
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">{content.subtitle}</p>
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
                  key={`${dup}-${index}-${image.imageUrl}`}
                  src={image.imageUrl}
                  alt={image.alt}
                  priority={dup === 0 && index < 2}
                />
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
