import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { HeroSectionContent } from "@/data/home-page-defaults";

export function Hero({ content }: { content: HeroSectionContent }) {
  const [main, top, bottom] = content.images;

  return (
    <section className="relative overflow-hidden bg-gradient-to-b from-[oklch(0.99_0.015_85)] via-[oklch(0.97_0.02_75)] to-[oklch(0.96_0.025_55)] py-20 lg:py-28">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.35]"
        style={{
          backgroundImage: `radial-gradient(circle at 20% 20%, oklch(0.92 0.04 25 / 0.5) 0%, transparent 45%),
            radial-gradient(circle at 80% 60%, oklch(0.93 0.03 95 / 0.6) 0%, transparent 40%)`,
        }}
      />

      <div className="container relative z-10 mx-auto px-4">
        <div className="flex flex-col items-center gap-14 text-center lg:flex-row lg:items-center lg:gap-16 lg:text-left">
          <div className="max-w-xl shrink-0 lg:w-[44%]">
            <p className="mb-5 text-xs font-medium uppercase tracking-[0.2em] text-muted-foreground">
              {content.eyebrow}
            </p>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-foreground shadow-sm backdrop-blur-sm">
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                {content.badgeLabel}
              </span>
              {content.badgeText}
            </div>
            <h1 className="mb-6 text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              {content.titleLine1}
              <br />
              <span className="text-primary">{content.titleLine2Accent}</span>
            </h1>
            <p className="mb-10 max-w-md whitespace-pre-line text-lg leading-relaxed text-muted-foreground lg:mx-0">
              {content.description}
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                nativeButton={false}
                className="h-12 rounded-full px-8 text-base font-medium shadow-md shadow-primary/10"
                render={<Link href={content.primaryCta.href} />}
              >
                {content.primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="h-12 rounded-full border-border bg-card/50 px-8 text-base font-medium backdrop-blur-sm"
                render={<Link href={content.secondaryCta.href} />}
              >
                {content.secondaryCta.label}
              </Button>
            </div>
          </div>

          <div className="w-full max-w-xl lg:max-w-none lg:flex-1">
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 sm:gap-4 lg:mx-0 lg:max-w-2xl lg:grid-cols-[1.12fr_1fr] lg:grid-rows-2 lg:items-stretch lg:gap-4">
              <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-24px_oklch(0.35_0.04_25_/_0.22)] lg:col-span-1 lg:row-span-2 lg:aspect-auto lg:min-h-[280px]">
                <Image
                  src={main.url}
                  alt={main.alt}
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:aspect-auto lg:min-h-0">
                <Image
                  src={top.url}
                  alt={top.alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 50vw, 22vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:aspect-auto lg:min-h-0">
                <Image
                  src={bottom.url}
                  alt={bottom.alt}
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 50vw, 22vw"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
