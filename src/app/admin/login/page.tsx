'use client'

import { useState } from 'react'
import { loginAdmin } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { Eye, EyeOff } from 'lucide-react'

export default function AdminLoginPage() {
  const [formData, setFormData] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) return '請輸入管理員信箱'
    if (!emailRegex.test(email)) return '請輸入有效的電子郵件格式'
    return null
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    if (errors[name] || errors.server) {
      setErrors((prev) => {
        const newErrors = { ...prev }
        delete newErrors[name]
        delete newErrors.server
        return newErrors
      })
    }
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    const emailError = validateEmail(formData.email)
    const passwordError = formData.password ? null : '請輸入密碼'

    if (emailError || passwordError) {
      setErrors({
        email: emailError || '',
        password: passwordError || '',
      })
      return
    }

    setLoading(true)

    const submitData = new FormData()
    submitData.append('email', formData.email)
    submitData.append('password', formData.password)

    const result = await loginAdmin(submitData)

    if (result?.error) {
      setErrors({ server: result.error })
    }
    setLoading(false)
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 pb-12 pt-24 sm:pt-32 lg:pt-40">
      <Card className="w-full max-w-md border-border/60 shadow-sm">
        <CardHeader className="space-y-1 pt-10 sm:pt-12">
          <div className="pb-2 text-center">
            <p className="text-2xl font-semibold tracking-tight text-foreground">
              My<span className="text-primary">Pâtisserie</span>
              <span className="font-medium text-muted-foreground"> admin</span>
            </p>
          </div>
          <CardDescription className="text-center text-base">
            請使用管理員帳號登入
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-8">
          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="email">
                管理員信箱
              </label>
              <input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleInputChange}
                className={cn(
                  'h-10 w-full rounded-lg border bg-background px-3 text-sm text-foreground outline-none transition-all',
                  errors.email
                    ? 'border-destructive ring-2 ring-destructive/10'
                    : 'border-border focus:ring-2 focus:ring-primary/20'
                )}
                placeholder="admin@example.com"
              />
              {errors.email && (
                <p className="animate-in text-xs text-destructive fade-in slide-in-from-top-1 duration-200">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-muted-foreground" htmlFor="password">
                密碼
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleInputChange}
                  className={cn(
                    'h-10 w-full rounded-lg border bg-background pl-3 pr-10 text-sm text-foreground outline-none transition-all',
                    errors.password
                      ? 'border-destructive ring-2 ring-destructive/10'
                      : 'border-border focus:ring-2 focus:ring-primary/20'
                  )}
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer text-muted-foreground transition-colors hover:text-foreground"
                  aria-label={showPassword ? "隱藏密碼" : "顯示密碼"}
                  title={showPassword ? "隱藏密碼" : "顯示密碼"}
                >
                  {showPassword ? (
                    <Eye className="size-4" aria-hidden />
                  ) : (
                    <EyeOff className="size-4" aria-hidden />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="animate-in text-xs text-destructive fade-in slide-in-from-top-1 duration-200">
                  {errors.password}
                </p>
              )}
            </div>
            {errors.server && (
              <div className="rounded-md border border-destructive/20 bg-destructive/5 p-2 text-center text-sm text-destructive">
                {errors.server}
              </div>
            )}
            <Button
              type="submit"
              className="mt-1 h-12 w-full rounded-full font-bold shadow-md shadow-primary/10"
              disabled={loading}
            >
              {loading ? '驗證中...' : '登入管理系統'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
