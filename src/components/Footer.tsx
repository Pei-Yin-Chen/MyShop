import { fetchSiteSettings } from "@/lib/supabase/fetch-site-settings";
import { FooterInner } from "@/components/FooterInner";

export async function Footer() {
  const site = await fetchSiteSettings();
  return <FooterInner site={site} />;
}
