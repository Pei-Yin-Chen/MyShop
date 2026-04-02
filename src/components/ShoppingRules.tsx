import { Clock, CreditCard, Refrigerator, Truck } from "lucide-react";
import type { ShoppingRulesSectionContent } from "@/data/home-page-defaults";

const ICONS = {
  truck: Truck,
  clock: Clock,
  refrigerator: Refrigerator,
  credit_card: CreditCard,
} as const;

const ICON_TONE: Record<ShoppingRulesSectionContent["items"][number]["iconKey"], string> = {
  truck: "text-[oklch(0.5_0.06_250)]",
  clock: "text-primary",
  refrigerator: "text-[oklch(0.48_0.05_160)]",
  credit_card: "text-[oklch(0.45_0.04_300)]",
};

export function ShoppingRules({ content }: { content: ShoppingRulesSectionContent }) {
  return (
    <section className="border-t border-border/60 bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            {content.title}
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">{content.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {content.items.map((rule) => {
            const Icon = ICONS[rule.iconKey];
            return (
              <div
                key={`${rule.iconKey}-${rule.title}`}
                className="flex flex-col items-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm"
              >
                <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                  <Icon className={`h-7 w-7 ${ICON_TONE[rule.iconKey]}`} />
                </div>
                <h3 className="mb-2 text-lg font-semibold text-foreground">{rule.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground">{rule.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
