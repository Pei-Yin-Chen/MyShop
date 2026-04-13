import Link from "next/link";
import { Pencil } from "lucide-react";
import { buttonVariants } from "@/components/ui/button-variants";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminCustomerServiceFooterForm } from "@/components/admin/AdminCustomerServiceFooterForm";
import { AdminFooterQuickLinksForm } from "@/components/admin/AdminFooterQuickLinksForm";
import {
  fetchCustomerServiceFooterLinks,
  fetchCustomerServicePagesForAdmin,
} from "@/lib/supabase/fetch-customer-service";
import { fetchFooterQuickLinks } from "@/lib/supabase/fetch-footer-quick-links";
import { formatOrderDateTimeZh } from "@/lib/format-order-datetime";
import { customerServicePagePublicPath } from "@/lib/customer-service";
import { AdminDeleteSitePageButton } from "@/components/admin/AdminDeleteSitePageButton";
import { cn } from "@/lib/utils";

export default async function AdminSitePagesSettingsPage() {
  const [footerQuickLinks, links, pages] = await Promise.all([
    fetchFooterQuickLinks(),
    fetchCustomerServiceFooterLinks(),
    fetchCustomerServicePagesForAdmin(),
  ]);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink href="/admin/settings" ariaLabel="返回系統設定" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">網站說明</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              可設定頁尾快速連結、客戶服務區塊，以及各說明頁內容。
            </p>
          </div>
        </div>
        <Link
          href="/admin/settings/site-pages/new"
          className={cn(buttonVariants({ size: "lg" }), "rounded-full")}
        >
          新增說明頁
        </Link>
      </div>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">頁尾「快速連結」</CardTitle>
          <CardDescription>
            「關於我們」在頁尾「快速連結」區塊顯示的
            <span className="font-medium text-foreground">連結文字與網址</span>
            。頁面大標題與內文請在下方「說明頁內容」編輯 slug 為{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">about</code> 的那一頁。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminFooterQuickLinksForm initial={footerQuickLinks} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">頁尾「客戶服務」連結</CardTitle>
          <CardDescription>
            每一列的「連結文字」是顧客看到的字；「連結網址」填顧客點下去要開的頁面。若連到下方你建立的說明頁，請用該頁「顧客預設網址」欄（例如 FAQ 用{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">/faq</code>
            ；關於我們建議用{" "}
            <code className="rounded bg-muted px-1 font-mono text-xs">/about</code>
            ）。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <AdminCustomerServiceFooterForm initial={links} />
        </CardContent>
      </Card>

      <Card className="border-border/80 shadow-sm">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">說明頁內容</CardTitle>
          <CardDescription>
            點「編輯」可改標題與內文。編輯方式與商品介紹相同，可用粗體、標題、清單等；儲存後顧客在網站上會看到排版好的內容。
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">網址名稱</th>
                  <th className="px-4 py-3 font-medium">顧客預設網址</th>
                  <th className="px-4 py-3 font-medium">標題</th>
                  <th className="px-4 py-3 font-medium">更新時間</th>
                  <th className="px-4 py-3 text-right font-medium">操作</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pages.map((p) => (
                  <tr key={p.slug} className="hover:bg-muted/30">
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{p.slug}</td>
                    <td className="px-4 py-3 font-mono text-xs text-foreground">
                      {customerServicePagePublicPath(p.slug)}
                    </td>
                    <td className="px-4 py-3 text-foreground">{p.title}</td>
                    <td className="px-4 py-3 tabular-nums text-foreground text-xs">
                      {formatOrderDateTimeZh(p.updated_at)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Link
                          href={`/admin/settings/site-pages/${p.slug}`}
                          className={cn(
                            buttonVariants({ variant: "ghost", size: "icon-sm" }),
                            "text-muted-foreground hover:text-foreground",
                          )}
                          title="編輯"
                          aria-label={`編輯「${p.title}」`}
                        >
                          <Pencil className="size-4" aria-hidden />
                        </Link>
                        <AdminDeleteSitePageButton
                          slug={p.slug}
                          pageTitle={p.title}
                          appearance="icon"
                          afterDelete="refresh"
                        />
                      </div>
                    </td>
                  </tr>
                ))}
                {pages.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-10 text-center text-muted-foreground">
                      尚無說明頁。請按「新增說明頁」建立；若按了仍沒有資料，請洽技術人員確認網站資料庫是否已設定。
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
