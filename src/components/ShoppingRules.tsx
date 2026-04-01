import { Clock, CreditCard, Refrigerator, Truck } from "lucide-react";

const rules = [
  {
    icon: <Truck className="h-7 w-7 text-[oklch(0.5_0.06_250)]" />,
    title: "宅配與門市取貨",
    description: "指定區域可選宅配或到店取貨；蛋糕類建議預訂時段，確保完整交付。",
  },
  {
    icon: <Clock className="h-7 w-7 text-primary" />,
    title: "預訂與出爐時間",
    description: "整模蛋糕請提前 2–3 日預訂；麵包以當日出爐時間為主，售完為止。",
  },
  {
    icon: <Refrigerator className="h-7 w-7 text-[oklch(0.48_0.05_160)]" />,
    title: "保存建議",
    description: "含鮮奶油與水果之品項請冷藏並於建議期限內食用，風味較佳。",
  },
  {
    icon: <CreditCard className="h-7 w-7 text-[oklch(0.45_0.04_300)]" />,
    title: "付款方式",
    description: "支援信用卡、LINE Pay 與門市現金；大宗訂單可另洽對公匯款。",
  },
];

export function ShoppingRules() {
  return (
    <section className="border-t border-border/60 bg-muted/30 py-24">
      <div className="container mx-auto px-4">
        <div className="mb-16 flex flex-col items-center text-center">
          <h2 className="mb-3 text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
            購物說明
          </h2>
          <div className="mb-5 h-px w-16 bg-primary/40" />
          <p className="max-w-xl text-muted-foreground">
            為了讓您收到與店內相同品質的烘焙，以下說明請在結帳前稍加留意。
          </p>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-4">
          {rules.map((rule, index) => (
            <div
              key={index}
              className="flex flex-col items-center rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm"
            >
              <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                {rule.icon}
              </div>
              <h3 className="mb-2 text-lg font-semibold text-foreground">{rule.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{rule.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
