'use client'

import { useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { login, signup, signInWithGoogle } from '@/app/auth/actions'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Eye, EyeOff } from 'lucide-react'
import { cn } from '@/lib/utils'

function GoogleIcon({ className, ...props }: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("mr-2 h-4 w-4", className)}
      {...props}
    >
      <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" stroke="none"/>
      <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1 .67-2.28 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" stroke="none"/>
      <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05" stroke="none"/>
      <path d="M12 5.38c1.62 0 3.06.56 4.21 1.66l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" stroke="none"/>
    </svg>
  )
}

export default function LoginClient() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirectTo') || '/'

  const validate = (formData: FormData) => {
    const newErrors: Record<string, string> = {}
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!email.trim()) {
      newErrors.email = '請輸入電子郵件'
    } else if (!emailRegex.test(email)) {
      newErrors.email = '請輸入有效的電子郵件格式'
    }

    if (!password) {
      newErrors.password = '請輸入密碼'
    } else if (password.length < 6) {
      newErrors.password = '密碼長度至少需 6 個字元'
    }

    return newErrors
  }

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setErrors({})

    const formData = new FormData(event.currentTarget)
    const validationErrors = validate(formData)
    
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors)
      return
    }

    setLoading(true)
    const result = isLogin ? await login(formData, redirectTo) : await signup(formData)

    if (result?.error) {
      setErrors({ server: result.error })
    }
    setLoading(false)
  }

  return (
    <div className="flex w-full min-h-[calc(100dvh-4rem)] flex-col items-center justify-center bg-gradient-to-b from-muted/45 via-background to-background px-4 py-6 sm:px-6 sm:py-8">
      <Card className="w-full max-w-md border-border/60 shadow-sm">
        <CardHeader className="space-y-1 pt-6 sm:pt-8">
          <div className="mb-8 mt-2 flex justify-center">
            <span className="text-2xl font-semibold tracking-tight text-foreground">
              My<span className="text-primary">Pâtisserie</span>
            </span>
          </div>
          <CardTitle className="text-2xl font-bold text-center">
            {isLogin ? '登入帳號' : '註冊新帳號'}
          </CardTitle>
          <CardDescription className="text-center">
            {isLogin ? '輸入您的電子郵件和密碼以登入' : '填寫以下資訊以建立帳號'}
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4">
          <div className="grid grid-cols-1 gap-6">
            <Button 
              variant="outline" 
              onClick={() => signInWithGoogle()}
              className="w-full h-12 rounded-full font-bold shadow-sm cursor-pointer"
              disabled={loading}
            >
              <GoogleIcon />
              使用 Google 登入
            </Button>
          </div>
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">
                或使用電子郵件
              </span>
            </div>
          </div>
          <form onSubmit={handleSubmit} className="space-y-4">
            {searchParams.get('error') === 'banned' && (
              <p className="rounded-lg border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                此帳號已停用，如有疑問請聯絡客服。
              </p>
            )}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="email">
                電子郵件
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="m@example.com"
                className={cn(
                  "w-full h-10 rounded-lg border bg-background px-3 text-sm outline-none transition-all",
                  errors.email ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20"
                )}
              />
              {errors.email && (
                <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.email}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground block mb-1.5" htmlFor="password">
                密碼
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="請輸入密碼"
                  className={cn(
                    "w-full h-10 rounded-lg border bg-background pl-3 pr-10 text-sm outline-none transition-all",
                    errors.password ? "border-destructive ring-2 ring-destructive/10" : "border-border focus:ring-2 focus:ring-primary/20"
                  )}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors cursor-pointer"
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
                <p className="text-xs text-destructive animate-in fade-in slide-in-from-top-1 duration-200">
                  {errors.password}
                </p>
              )}
            </div>
            
            {errors.server && (
              <div className="text-sm text-red-500 font-medium text-center bg-red-50 p-2 rounded-md border border-red-100">
                {errors.server}
              </div>
            )}
            <Button
              type="submit"
              size="lg"
              className="mb-2 mt-1 h-12 w-full rounded-full font-bold shadow-md shadow-primary/10"
              disabled={loading}
            >
              {loading ? '處理中...' : (isLogin ? '登入' : '註冊')}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex flex-col pb-8 pt-8">
          <div className="text-sm text-muted-foreground text-center w-full">
            {isLogin ? "還沒有帳號？" : "已經有帳號了？"}
            <button
              type="button"
              onClick={() => {
                setIsLogin(!isLogin)
                setErrors({})
                setShowPassword(false)
              }}
              className="text-primary font-medium underline-offset-4 hover:underline cursor-pointer ml-1"
            >
              {isLogin ? "點此註冊" : "點此登入"}
            </button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

