import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "取消與變更 · My Pâtisserie",
  description: "訂單取消、修改與退換貨政策（示範內容）。",
};

export default function ReturnsPage() {
  return (
    <StaticPage
      title="取消與變更"
      description="以下為示範條款，請由法律或營運顧問依實際情況審閱後再上架。"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">訂單取消</h2>
        <p className="text-muted-foreground">
          示範：若商品尚未進入製作或出貨流程，您可透過會員訂單或客服申請取消；已開始製作之訂製品可能無法取消，或將酌收費用。實際時點請以系統狀態與客服回覆為準。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">內容變更</h2>
        <p className="text-muted-foreground">
          示範：如需變更取貨時間、收件地址或備註，請儘早聯絡客服。接近出貨日之變更可能無法受理，以避免影響其他訂單排程。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">退換貨與瑕疵</h2>
        <p className="text-muted-foreground">
          示範：食品屬消耗性商品，除法律另有規定或商品有重大瑕疵外，拆封後可能不適用七日鑑賞期。若收到商品有損壞、與訂購內容不符，請於收件後儘速拍照並聯絡客服，我們將協助處理。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">退款說明</h2>
        <p className="text-muted-foreground">
          示範：符合取消或退款條件之款項，將於一定工作天內退回原付款方式；實際入帳時間依發卡機構或第三方支付而定。
        </p>
      </section>
    </StaticPage>
  );
}
