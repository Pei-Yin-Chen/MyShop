import { createClient } from "@/lib/supabase/server";
import {
  normalizeCustomerServiceFooter,
  type CustomerServiceFooterLink,
} from "@/lib/customer-service";

export async function fetchCustomerServiceFooterLinks(): Promise<CustomerServiceFooterLink[]> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("home_page_sections")
    .select("content")
    .eq("section_key", "customer_service_footer")
    .maybeSingle();
  return normalizeCustomerServiceFooter(data?.content);
}

export type CustomerServicePagePublic = {
  slug: string;
  title: string;
  meta_description: string | null;
  body_html: string;
  updated_at: string;
};

export async function fetchCustomerServicePageBySlug(
  slug: string,
): Promise<CustomerServicePagePublic | null> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_service_pages")
    .select("slug, title, meta_description, body_html, updated_at")
    .eq("slug", slug)
    .maybeSingle();
  if (error || !data) return null;
  return data as CustomerServicePagePublic;
}

export async function fetchCustomerServicePageSlugs(): Promise<string[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_service_pages")
    .select("slug")
    .order("slug", { ascending: true });
  if (error) return [];
  return (data ?? []).map((r) => r.slug as string);
}

export type CustomerServicePageListRow = {
  slug: string;
  title: string;
  updated_at: string;
};

export async function fetchCustomerServicePagesForAdmin(): Promise<CustomerServicePageListRow[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("customer_service_pages")
    .select("slug, title, updated_at")
    .order("slug", { ascending: true });
  if (error) return [];
  return (data ?? []) as CustomerServicePageListRow[];
}
