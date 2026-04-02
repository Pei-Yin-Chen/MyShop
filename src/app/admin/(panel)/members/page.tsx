import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'

type ProfileRow = {
  id: string
  full_name: string | null
  is_admin: boolean | null
  updated_at: string | null
  email?: string | null
}

export default async function MembersPage() {
  const supabase = await createClient()

  const { data: membersRaw, error } = await supabase
    .from('profiles')
    .select('*')
    .order('updated_at', { ascending: false })

  const members = membersRaw as ProfileRow[] | null

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-foreground">會員管理</h2>
      </div>

      <Card className="border-none shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-medium">
              <tr>
                <th className="px-6 py-4">會員姓名</th>
                <th className="px-6 py-4">Email / ID</th>
                <th className="px-6 py-4">權限</th>
                <th className="px-6 py-4">最後更新</th>
                <th className="px-6 py-4 text-right">操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {members?.map((member) => (
                <tr key={member.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-6 py-4 font-medium text-slate-800">
                    {member.full_name || '未設定'}
                  </td>
                  <td className="px-6 py-4 text-slate-600">
                    <div className="text-sm font-medium text-foreground">
                      {member.email?.trim() || '—'}
                    </div>
                    <div className="mt-0.5 break-all font-mono text-xs text-muted-foreground">
                      {member.id}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        'px-2 py-1 rounded-full text-[10px] font-bold uppercase',
                        member.is_admin
                          ? 'bg-amber-100 text-amber-700 border border-amber-200'
                          : 'bg-slate-100 text-slate-600 border border-slate-200'
                      )}
                    >
                      {member.is_admin ? 'Admin' : 'Member'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-slate-500">
                    {member.updated_at
                      ? new Date(member.updated_at).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      type="button"
                      className="cursor-pointer font-medium text-primary hover:underline"
                    >
                      編輯
                    </button>
                  </td>
                </tr>
              ))}
              {(!members || members.length === 0) && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-slate-400 italic">
                    {error ? `載入失敗: ${error.message}` : '目前尚無會員資料'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
