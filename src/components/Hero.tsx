import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import {
  heroBreadFeatured,
  heroCakeFeatured,
  heroCroissantFeatured,
} from "@/data/remote-images";

export function Hero() {
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
              Pâtisserie & Boulangerie
            </p>
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-border bg-card/80 px-4 py-1.5 text-sm text-foreground shadow-sm backdrop-blur-sm">
              <span className="rounded-full bg-primary/15 px-2.5 py-0.5 text-xs font-semibold text-primary">
                本日烘焙
              </span>
              上午出爐 · 限量供應
            </div>
            <h1 className="mb-6 text-4xl font-semibold leading-[1.15] tracking-tight text-foreground sm:text-5xl lg:text-[3.25rem]">
              以時間與溫度，
              <br />
              <span className="text-primary">呈現每一口的柔軟</span>
            </h1>
            <p className="mb-10 max-w-md text-lg leading-relaxed text-muted-foreground lg:mx-0">
              蛋糕、麵包與季節甜點，堅持好原料與當日現做，
              為你的餐桌與聚會，留一點剛好的甜。
            </p>
            <div className="flex flex-col items-center justify-center gap-3 sm:flex-row lg:justify-start">
              <Button
                size="lg"
                nativeButton={false}
                className="h-12 rounded-full px-8 text-base font-medium shadow-md shadow-primary/10"
                render={<Link href="/products" />}
              >
                瀏覽品項
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                className="h-12 rounded-full border-border bg-card/50 px-8 text-base font-medium backdrop-blur-sm"
                render={<Link href="/products?category=蛋糕" />}
              >
                預訂整模蛋糕
              </Button>
            </div>
          </div>

          {/* 雙欄網格：左高主圖、右兩張等高小圖，無圖上／圖下文字 */}
          <div className="w-full max-w-xl lg:max-w-none lg:flex-1">
            <div className="mx-auto grid max-w-lg grid-cols-2 gap-3 sm:gap-4 lg:mx-0 lg:max-w-2xl lg:grid-cols-[1.12fr_1fr] lg:grid-rows-2 lg:items-stretch lg:gap-4">
              <div className="relative col-span-2 aspect-[4/3] overflow-hidden rounded-2xl border border-border bg-card shadow-[0_20px_50px_-24px_oklch(0.35_0.04_25_/_0.22)] lg:col-span-1 lg:row-span-2 lg:aspect-auto lg:min-h-[280px]">
                <Image
                  src={heroCakeFeatured}
                  alt="草莓果粒麵包與甜點桌面陳列"
                  fill
                  className="object-cover object-center"
                  priority
                  sizes="(max-width: 1024px) 100vw, 45vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:aspect-auto lg:min-h-0">
                <Image
                  src={heroBreadFeatured}
                  alt="麵包與烘焙陳列"
                  fill
                  className="object-cover object-center"
                  sizes="(max-width: 1024px) 50vw, 22vw"
                />
              </div>
              <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-card shadow-sm lg:aspect-auto lg:min-h-0">
                <Image
                  src={heroCroissantFeatured}
                  alt="可頌與酥皮"
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
