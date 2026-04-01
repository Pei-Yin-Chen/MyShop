import { ChefHat, Cookie, Heart, Wheat } from "lucide-react";

const philosophyItems = [
  {
    icon: <Wheat className="h-9 w-9 text-[oklch(0.55_0.06_85)]" />,
    title: "嚴選食材",
    description: "麵粉、奶油與雞蛋皆來自可信賴產區，減少添加，讓風味自然展開。",
    bgColor: "bg-[oklch(0.96_0.02_85)]",
  },
  {
    icon: <ChefHat className="h-9 w-9 text-primary" />,
    title: "手工製作",
    description: "從打麵、發酵到烘烤，由師傅依當日溫溼度微調，保留手作溫度。",
    bgColor: "bg-[oklch(0.96_0.025_55)]",
  },
  {
    icon: <Heart className="h-9 w-9 text-[oklch(0.5_0.08_25)]" />,
    title: "分享時刻",
    description: "無論是早餐一片吐司或慶生蛋糕，我們希望成為你日子裡的柔軟陪伴。",
    bgColor: "bg-[oklch(0.97_0.02_75)]",
  },
  {
    icon: <Cookie className="h-9 w-9 text-[oklch(0.45_0.05_55)]" />,
    title: "當日精神",
    description: "烘焙品以當日鮮度為優先，建議依保存建議享用，風味最佳。",
    bgColor: "bg-[oklch(0.95_0.02_95)]",
  },
];

export function BrandPhilosophy() {
  return (
    <section className="border-t border-border/60 bg-background py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            品牌理念
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">
            我們相信好的烘焙不必張揚，柔軟、香氣與餘韻，會在入口時自己說話。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {philosophyItems.map((item, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm transition-shadow hover:shadow-md"
            >
              <div
                className={`mb-6 flex h-16 w-16 items-center justify-center rounded-2xl ${item.bgColor}`}
              >
                {item.icon}
              </div>
              <h3 className="mb-3 text-lg font-semibold text-foreground">{item.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
