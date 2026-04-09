"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { FooterInner } from "@/components/FooterInner";
import {
  DEFAULT_SITE_SETTINGS,
  normalizeSiteSettings,
  type SiteSettings,
} from "@/lib/site-settings";

/** 用於無法使用 async Server Component 的 client 頁面（例如結帳）。 */
export function FooterClient() {
  const [site, setSite] = useState<SiteSettings>(DEFAULT_SITE_SETTINGS);

  useEffect(() => {
    const supabase = createClient();
    void supabase
      .from("home_page_sections")
      .select("content")
      .eq("section_key", "site_settings")
      .maybeSingle()
      .then(({ data }) => setSite(normalizeSiteSettings(data?.content)));
  }, []);

  return <FooterInner site={site} />;
}
