import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { RichTextSitePage } from "@/components/RichTextSitePage";
import { fetchCustomerServicePageBySlug } from "@/lib/supabase/fetch-customer-service";
import { fetchSiteSettings } from "@/lib/supabase/fetch-site-settings";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const [page, site] = await Promise.all([
    fetchCustomerServicePageBySlug(slug),
    fetchSiteSettings(),
  ]);
  if (!page) return { title: `找不到頁面 · ${site.siteTitle}` };
  const titleBase = page.title;
  return {
    title: `${titleBase} · ${site.siteTitle}`,
    description: page.meta_description?.trim() || undefined,
  };
}

export default async function SitePolicyPage({ params }: Props) {
  const { slug } = await params;
  const page = await fetchCustomerServicePageBySlug(slug);
  if (!page) notFound();

  return (
    <RichTextSitePage
      title={page.title}
      metaDescription={page.meta_description}
      bodyHtml={page.body_html}
    />
  );
}
