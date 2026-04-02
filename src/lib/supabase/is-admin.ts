import type { SupabaseClient } from '@supabase/supabase-js'

function rowIsAdmin(value: unknown): boolean {
  if (value === true) return true
  if (typeof value === 'string') return value.toLowerCase() === 'true' || value === 't'
  return false
}

/**
 * 先依 userId 讀 profiles（登入後與 RLS「自己的列」最直覺）。
 * 若仍非管理員，再試 RPC（略過部分 RLS 情境）；避免「RPC 先跑且誤回 false」時永遠不查表。
 */
export async function fetchUserIsAdmin(
  supabase: SupabaseClient,
  userId: string
): Promise<boolean> {
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', userId)
    .maybeSingle()

  if (rowIsAdmin(profile?.is_admin)) return true

  const { data: rpcData, error: rpcError } = await supabase.rpc(
    'current_user_is_admin'
  )

  if (!rpcError && typeof rpcData === 'boolean' && rpcData) return true

  return false
}
