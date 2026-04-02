import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "運送與取貨 · My Pâtisserie",
  description: "運送範圍、時程與取貨須知（示範內容）。",
};

export default function ShippingPage() {
  return (
    <StaticPage
      title="運送與取貨"
      description="以下為示範說明，請依您合作的物流與店取流程修改。"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">運送範圍</h2>
        <p className="text-muted-foreground">
          示範：本島主要地區皆可配送；離島、偏遠路段可能另計運費或無法配送，結帳時系統會依地址提示。實際範圍請以正式上線設定為準。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">出貨與到貨時程</h2>
        <p className="text-muted-foreground">
          示範：訂單確認後約 1～3 個工作天出貨（不含例假日）；遇年節或檔期可能順延，將於購物車或結帳頁公告。冷凍／冷藏品將以適當包材與溫層出貨。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">店內取貨</h2>
        <p className="text-muted-foreground">
          示範：若選擇門市取貨，請於通知的取貨日攜帶訂單編號或身分證件末四碼供核對。逾期未取可能影響品質，我們會依政策聯繫處理（請改寫為您的真實規則）。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">收件注意事項</h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>請確保收件地址於配送時段有人收件，避免冷鏈商品久置。</li>
          <li>若外包裝明顯破損，可拒收並聯絡客服留下紀錄（示範流程）。</li>
          <li>天候或不可抗力因素可能造成延遲，敬請見諒。</li>
        </ul>
      </section>
    </StaticPage>
  );
}
