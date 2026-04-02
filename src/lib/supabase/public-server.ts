import { createClient } from "@supabase/supabase-js";

/**
 * 僅使用 anon key，不依賴 cookies。適用於建置時（generateStaticParams）與
 * 不需登入身分的公開讀取。
 */
export function createPublicSupabaseClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
