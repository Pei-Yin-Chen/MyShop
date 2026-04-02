import { ChefHat, Cookie, Heart, Wheat } from "lucide-react";
import type { BrandPhilosophySectionContent } from "@/data/home-page-defaults";

const ICONS = {
  wheat: Wheat,
  chef_hat: ChefHat,
  heart: Heart,
  cookie: Cookie,
} as const;

const ICON_TONE: Record<BrandPhilosophySectionContent["items"][number]["iconKey"], string> = {
  wheat: "text-[oklch(0.55_0.06_85)]",
  chef_hat: "text-primary",
  heart: "text-[oklch(0.5_0.08_25)]",
  cookie: "text-[oklch(0.45_0.05_55)]",
};

const BG_VARIANT: Record<BrandPhilosophySectionContent["items"][number]["bgVariant"], string> = {
  cream: "bg-[oklch(0.96_0.02_85)]",
  peach: "bg-[oklch(0.96_0.025_55)]",
  rose: "bg-[oklch(0.97_0.02_75)]",
  sage: "bg-[oklch(0.95_0.02_95)]",
};

export function BrandPhilosophy({ content }: { content: BrandPhilosophySectionContent }) {
  return (
    <section className="border-t border-border/60 bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {content.title}
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.items.map((item) => {
            const Icon = ICONS[item.iconKey];
            return (
              <div
                key={`${item.iconKey}-${item.title}`}
                className="flex flex-col items-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md"
              >
                <div
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${BG_VARIANT[item.bgVariant]}`}
                >
                  <Icon className={`h-9 w-9 ${ICON_TONE[item.iconKey]}`} />
                </div>
                <h3 className="mb-3 text-lg font-semibold text-foreground">{item.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
