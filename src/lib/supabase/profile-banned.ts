import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 若會員已停用則登出並回傳 true（供登入／OAuth callback 使用）。
 */
export async function signOutIfProfileBanned(
  supabase: SupabaseClient,
  userId: string,
): Promise<boolean> {
  const { data } = await supabase
    .from("profiles")
    .select("is_banned")
    .eq("id", userId)
    .maybeSingle();

  if (data?.is_banned === true) {
    await supabase.auth.signOut();
    return true;
  }
  return false;
}
