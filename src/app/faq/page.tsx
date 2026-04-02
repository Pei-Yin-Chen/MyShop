import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "常見問題 · My Pâtisserie",
  description: "訂購、取貨、付款與會員相關常見問題（示範內容）。",
};

const FAQ_ITEMS: { q: string; a: string }[] = [
  {
    q: "如何訂購與付款？",
    a: "示範說明：將商品加入購物車後前往結帳，依畫面指示填寫收件與聯絡資訊並完成付款。實際支援的付款方式請以結帳頁為準。",
  },
  {
    q: "可以指定到貨日或時段嗎？",
    a: "示範說明：部分品項或檔期可能開放備註欄位；是否可指定將依物流與產能而定，客服會於必要時與您聯繫確認。",
  },
  {
    q: "有提供實體門市取貨嗎？",
    a: "示範說明：若您開放店取，可在此說明取貨時間、需攜帶的憑證與櫃台流程。僅宅配則改寫為運送範圍與包裝方式。",
  },
  {
    q: "商品如何保存？",
    a: "示範說明：蛋糕建議冷藏並於標示期限內食用；麵包可常溫或分裝冷凍。正式上線請依實際配方與法規標示調整文案。",
  },
  {
    q: "可以客製字卡或企業採購嗎？",
    a: "示範說明：企業大量訂購或婚禮小物可另洽客服信箱，我們將於工作日回覆報價與檔期（此為示意流程）。",
  },
];

export default function FaqPage() {
  return (
    <StaticPage
      title="常見問題"
      description="以下為示範問答，請依實際營運政策與金流物流設定更新。"
    >
      <div className="space-y-8">
        {FAQ_ITEMS.map((item) => (
          <section key={item.q} className="border-b border-border/60 pb-8 last:border-0 last:pb-0">
            <h2 className="text-lg font-semibold text-foreground">{item.q}</h2>
            <p className="mt-3 text-muted-foreground">{item.a}</p>
          </section>
        ))}
      </div>
    </StaticPage>
  );
}
