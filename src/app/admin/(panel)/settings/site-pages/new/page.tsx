import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminCustomerServicePageForm } from "@/components/admin/AdminCustomerServicePageForm";

export default function AdminSitePagesNewPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink
            href="/admin/settings/site-pages"
            ariaLabel="返回網站說明列表"
            title="返回網站說明列表"
          />
          <div>
            <h2 className="text-2xl font-bold text-foreground">新增說明頁</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              儲存後，顧客可用「你的網站網址」加上「顧客預設網址」欄的路徑開啟此頁（關於我們為 /about，其餘多為 /網址名稱）。別忘了到上一頁「頁尾客戶服務連結」加一筆，顧客才找得到。
            </p>
          </div>
        </div>
      </div>
      <AdminCustomerServicePageForm
        mode="create"
        initialTitle=""
        initialMetaDescription=""
        initialBodyHtml=""
      />
    </div>
  );
}
