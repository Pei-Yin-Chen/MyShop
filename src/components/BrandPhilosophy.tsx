import {
  Award,
  ChefHat,
  Cookie,
  Handshake,
  Heart,
  Leaf,
  Lightbulb,
  Shield,
  Sparkles,
  Star,
  Users,
  Wheat,
} from "lucide-react";
import type { BrandPhilosophySectionContent } from "@/data/home-page-defaults";
import { SECTION_CARD_BG_CLASS } from "@/lib/section-card-bg";

const ICONS = {
  wheat: Wheat,
  chef_hat: ChefHat,
  heart: Heart,
  cookie: Cookie,
  sparkles: Sparkles,
  shield: Shield,
  users: Users,
  handshake: Handshake,
  leaf: Leaf,
  award: Award,
  star: Star,
  lightbulb: Lightbulb,
} as const;

const ICON_TONE: Record<BrandPhilosophySectionContent["items"][number]["iconKey"], string> = {
  wheat: "text-[oklch(0.55_0.06_85)]",
  chef_hat: "text-primary",
  heart: "text-[oklch(0.5_0.08_25)]",
  cookie: "text-[oklch(0.45_0.05_55)]",
  sparkles: "text-[oklch(0.55_0.12_290)]",
  shield: "text-[oklch(0.48_0.06_250)]",
  users: "text-[oklch(0.5_0.06_230)]",
  handshake: "text-[oklch(0.52_0.07_145)]",
  leaf: "text-[oklch(0.5_0.08_145)]",
  award: "text-[oklch(0.52_0.09_75)]",
  star: "text-[oklch(0.58_0.12_85)]",
  lightbulb: "text-[oklch(0.55_0.1_95)]",
};

export function BrandPhilosophy({ content }: { content: BrandPhilosophySectionContent }) {
  if (content.enabled === false) return null;
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
                  className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${SECTION_CARD_BG_CLASS[item.bgVariant]}`}
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
