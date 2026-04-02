import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "隱私權政策 · My Pâtisserie",
  description: "個人資料蒐集、使用與保護說明（示範內容）。",
};

export default function PrivacyPage() {
  return (
    <StaticPage
      title="隱私權政策"
      description="最後更新：示範日期 2026-04-02。正式營運前請由專業顧問依適用法規修訂。"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">1. 適用範圍</h2>
        <p className="text-muted-foreground">
          本示範政策適用於您使用 My Pâtisserie 網站、結帳與會員相關服務時，我們如何處理您的個人資料。若您使用第三方連結離開本站，請一併閱讀各該網站之隱私條款。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">2. 蒐集資料類型</h2>
        <p className="text-muted-foreground">
          示範：我們可能因訂單履約、客服聯繫或會員服務而處理姓名、聯絡電話、電子郵件、收件地址、交易紀錄等。若使用第三方登入或金流，相關資料之處理亦受該提供者條款拘束。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">3. 使用目的</h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>履行契約：出貨、通知、售後服務（示範）</li>
          <li>網站安全與詐欺防制</li>
          <li>經您同意之行銷或問卷（可關閉或退訂）</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">4. 資料保存與分享</h2>
        <p className="text-muted-foreground">
          示範：我們於達成蒐集目的所需期間內保存資料，並得依法令或爭議處理延長。為完成物流、金流或雲端主機服務，我們可能在必要範圍內與受契約拘束之合作夥伴分享資料。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">5. 您的權利</h2>
        <p className="text-muted-foreground">
          依個人資料保護法等相關規定，您得就個人資料行使查詢、閱覽、製給複本、更正、刪除及限制處理等權利（依法令限制者除外）。請透過網站聯絡方式提出，我們將於合理期間內回覆。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">6. 修訂</h2>
        <p className="text-muted-foreground">
          我們得隨時修訂本政策；重大變更時將於網站公告或另依法律要求通知。繼續使用服務即表示您同意更新後之內容（示範條文，請依實際法遵調整）。
        </p>
      </section>
    </StaticPage>
  );
}
