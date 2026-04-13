import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AdminBackToListLink } from "@/components/admin/AdminBackToListLink";
import { AdminCustomerServicePageForm } from "@/components/admin/AdminCustomerServicePageForm";
import { AdminDeleteSitePageButton } from "@/components/admin/AdminDeleteSitePageButton";
import { customerServicePagePublicPath } from "@/lib/customer-service";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export default async function AdminSitePageEditPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (UUID_RE.test(slug)) notFound();

  const supabase = await createClient();
  const { data: row, error } = await supabase
    .from("customer_service_pages")
    .select("slug, title, meta_description, body_html")
    .eq("slug", slug)
    .maybeSingle();

  if (error || !row) notFound();

  const publicPath = customerServicePagePublicPath(row.slug);

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <AdminBackToListLink
            href="/admin/settings/site-pages"
            ariaLabel="返回網站說明列表"
            title="返回網站說明列表"
          />
          <div>
            <h2 className="text-2xl font-bold text-foreground">編輯說明頁</h2>
            <p className="mt-1 text-xs text-muted-foreground">
              顧客預設網址：<code className="rounded bg-muted px-1 font-mono">{publicPath}</code>
            </p>
          </div>
        </div>
        <AdminDeleteSitePageButton slug={row.slug} pageTitle={row.title} />
      </div>
      <AdminCustomerServicePageForm
        mode="edit"
        initialSlug={row.slug}
        initialTitle={row.title}
        initialMetaDescription={row.meta_description ?? ""}
        initialBodyHtml={row.body_html ?? ""}
      />
    </div>
  );
}
