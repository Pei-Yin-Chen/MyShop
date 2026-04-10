"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FooterInner } from "@/components/FooterInner";
import {
  DEFAULT_SITE_SETTINGS,
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";
import { normalizeCustomerServiceFooter, type CustomerServiceFooterLink } from "@/lib/customer-service";
import {
  DEFAULT_FOOTER_QUICK_LINKS,
  normalizeFooterQuickLinks,
  type FooterQuickLinksContent,
} from "@/lib/footer-quick-links";

/** 用於無法使用 async Server Component 的 client 頁面（例如結帳）。 */
export function FooterClient() {
  const [site, setSite] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);
  const [customerServiceLinks, setCustomerServiceLinks] = useState<CustomerServiceFooterLink[]>(() =>
    normalizeCustomerServiceFooter(undefined),
  );
  const [footerQuickLinks, setFooterQuickLinks] = useState<FooterQuickLinksContent>(DEFAULT_FOOTER_QUICK_LINKS);

  useEffect(() => {
    const supabase = createClient();
    void Promise.all([
      supabase
        .from("home_page_sections")
        .select("content")
        .eq("section_key", "site_settings")
        .maybeSingle(),
      supabase
        .from("home_page_sections")
        .select("content")
        .eq("section_key", "customer_service_footer")
        .maybeSingle(),
      supabase
        .from("home_page_sections")
        .select("content")
        .eq("section_key", "footer_quick_links")
        .maybeSingle(),
    ]).then(([siteRes, csRes, fqRes]) => {
      setSite(normalizeSiteSettings(siteRes.data?.content));
      setCustomerServiceLinks(normalizeCustomerServiceFooter(csRes.data?.content));
      setFooterQuickLinks(normalizeFooterQuickLinks(fqRes.data?.content));
    });
  }, []);

  return (
    <FooterInner
      site={site}
      customerServiceLinks={customerServiceLinks}
      footerQuickLinks={footerQuickLinks}
    />
  );
}
