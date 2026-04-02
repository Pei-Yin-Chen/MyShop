import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "服務條款 · My Pâtisserie",
  description: "使用本網站與購物服務之條款（示範內容）。",
};

export default function TermsPage() {
  return (
    <StaticPage
      title="服務條款"
      description="最後更新：示範日期 2026-04-02。正式使用前請由專業顧問審閱。"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">1. 同意條款</h2>
        <p className="text-muted-foreground">
          當您使用 My Pâtisserie 網站或完成註冊、下單等行為，即表示您已閱讀並同意受本服務條款拘束。若不同意，請勿使用本服務。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">2. 帳號與安全</h2>
        <p className="text-muted-foreground">
          示範：您應妥善保管帳號密碼與登入裝置，並對帳號下之一切活動負責。若發現未經授權使用，請立即通知我們。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">3. 訂單與契約成立</h2>
        <p className="text-muted-foreground">
          示範：網站商品資訊為要約之引誘。訂單送出後，於我們確認接受（例如發送訂單確認通知）時，買賣契約始成立。保留因缺貨、價格誤植或其他正當理由取消訂單之權利，並將通知您處理退款。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">4. 價格與內容</h2>
        <p className="text-muted-foreground">
          商品價格、規格與圖片為示範或行銷用途時，請於正式上線前確保與實際販售一致。我們得依營運需要調整價格與活動，不影響已成立訂單。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">5. 責任限制</h2>
        <p className="text-muted-foreground">
          示範：在法律允許之最大範圍內，對於因使用或無法使用本服務所生之間接、附帶、特別或衍生性損害，我們可能不負賠償責任；依法不得排除或限制者除外。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">6. 準據法與管轄</h2>
        <p className="text-muted-foreground">
          示範：本條款以中華民國法律為準據法。因本條款或服務所生爭議，雙方同意以臺灣臺北地方法院為第一審管轄法院（僅供示意，請依實際需求修改）。
        </p>
      </section>
    </StaticPage>
  );
}
