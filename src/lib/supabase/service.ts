import { createClient } from "@supabase/supabase-js";

/**
 * 僅限伺服器端（例如金流 Notify），需設定 SUPABASE_SERVICE_ROLE_KEY。
 */
export function createServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }
  return createClient(url, key);
}
