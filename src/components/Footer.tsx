import { FooterInner } from "@/components/FooterInner";
import { fetchCustomerServiceFooterLinks } from "@/lib/supabase/fetch-customer-service";
import { fetchFooterQuickLinks } from "@/lib/supabase/fetch-footer-quick-links";
import { fetchSiteSettings } from "@/lib/supabase/fetch-site-settings";

export async function Footer() {
  const [site, customerServiceLinks, footerQuickLinks] = await Promise.all([
    fetchSiteSettings(),
    fetchCustomerServiceFooterLinks(),
    fetchFooterQuickLinks(),
  ]);
  return (
    <FooterInner
      site={site}
      customerServiceLinks={customerServiceLinks}
      footerQuickLinks={footerQuickLinks}
    />
  );
}
