import { createClient } from "@/lib/supabase/server";
import {
  normalizeFooterQuickLinks,
  type FooterQuickLinksContent,
} from "@/lib/footer-quick-links";

export async function fetchFooterQuickLinks(): Promise<FooterQuickLinksContent> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "footer_quick_links")
    .maybeSingle();
  return normalizeFooterQuickLinks(data?.content);
}
