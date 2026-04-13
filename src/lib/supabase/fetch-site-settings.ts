import type { SupabaseClient } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { DEFAULT_SITE_SETTINGS, normalizeSiteSettings, type SiteSettings } from "@/lib/site-settings";

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "site_settings")
    .maybeSingle();
  if (error) return DEFAULT_SITE_SETTINGS;
  return normalizeSiteSettings(data?.content);
}

/** 金流 callback 等僅有 service client 時使用 */
export async function fetchSiteSettingsWithClient(
  supabase: SupabaseClient,
): Promise<SiteSettings> {
  const { data, error } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "site_settings")
    .maybeSingle();
  if (error) return DEFAULT_SITE_SETTINGS;
  return normalizeSiteSettings(data?.content);
}

