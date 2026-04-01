import { Star, StarHalf } from "lucide-react";
import { cn } from "@/lib/utils";

function clampRating(n: number) {
  return Math.min(5, Math.max(1, n));
}

export function ProductRating({
  rating,
  reviewCount,
  className,
}: {
  rating: number;
  reviewCount: number;
  className?: string;
}) {
  const r = clampRating(rating);

  return (
    <div className={cn("flex flex-wrap items-center gap-1.5 text-sm", className)}>
      <span className="flex items-center gap-0.5 text-primary" aria-hidden>
        {[1, 2, 3, 4, 5].map((i) => {
          const diff = r - (i - 1);
          if (diff >= 1) {
            return <Star key={i} className="size-3.5 fill-primary" strokeWidth={0} />;
          }
          if (diff >= 0.5) {
            return <StarHalf key={i} className="size-3.5 fill-primary" strokeWidth={0} />;
          }
          return (
            <Star
              key={i}
              className="size-3.5 text-muted-foreground/35"
              strokeWidth={1.5}
            />
          );
        })}
      </span>
      <span className="font-medium tabular-nums text-foreground">{r.toFixed(1)}</span>
      <span className="text-muted-foreground">（{reviewCount} 則評價）</span>
    </div>
  );
}
