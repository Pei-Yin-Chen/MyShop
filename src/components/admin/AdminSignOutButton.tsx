'use client'

import { LogOut } from 'lucide-react'
import { signOut } from '@/app/auth/actions'

export function AdminSignOutButton() {
  return (
    <button 
      onClick={() => signOut()}
      className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-4 py-3 text-left text-sm font-medium text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="size-5" />
      登出系統
    </button>
  )
}
