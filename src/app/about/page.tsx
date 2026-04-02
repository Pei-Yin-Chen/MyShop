import type { Metadata } from "next";
import { StaticPage } from "@/components/StaticPage";

export const metadata: Metadata = {
  title: "關於我們 · My Pâtisserie",
  description: "認識 My Pâtisserie 的品牌故事與烘焙理念（示範內容）。",
};

export default function AboutPage() {
  return (
    <StaticPage
      title="關於我們"
      description="以下為示範文案，正式上線前請替換為實際品牌故事與資訊。"
    >
      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">品牌故事</h2>
        <p className="text-muted-foreground">
          My Pâtisserie 從一間小工作室出發，專注蛋糕、麵包與季節甜點。我們相信好的甜點來自好的原料與耐心：當日烘焙、適度減糖，讓風味自然展開。
        </p>
        <p className="text-muted-foreground">
          這段文字為示範用途，可在此補上創辦背景、店名由來、或與在地的連結，讓顧客更認識你們。
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">我們的堅持</h2>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>選用可追溯來源的主要原料（示範條列）</li>
          <li>依季節調整菜單，減少過度加工</li>
          <li>透明標示過敏原與保存方式（請於正式商品頁落實）</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold text-foreground">邀請您來坐坐</h2>
        <p className="text-muted-foreground">
          門市地址、營業時間與聯絡方式可同步於頁尾「聯絡我們」區塊；若僅線上販售，可改為取貨點或客服管道說明。
        </p>
      </section>
    </StaticPage>
  );
}
