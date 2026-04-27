import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "登入驗證失敗",
  description: "授權碼無法完成驗證，請重試。",
};

export default function AuthCodeErrorPage() {
  return (
    <div className="flex min-h-svh items-center justify-center bg-muted/30 p-4">
      <Card className="w-full max-w-md shadow-md">
        <CardHeader>
          <CardTitle className="text-xl">無法完成登入</CardTitle>
          <CardDescription>
            Google 登入的授權已失效、不一致，或沒有正確傳回。可能是連結過期、已使用過、或
            瀏覽未完整完成。請關閉此頁後再從登入畫面重試；若重複失敗，請檢查 Supabase
            的 Redirect URL 與本機或正式站網址是否一致。
          </CardDescription>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground">
          <p>技術代碼：授權碼（code）兌換 session 未成功，由系統導向此說明頁。</p>
        </CardContent>
        <CardFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button variant="outline" asChild>
            <Link href="/">返回首頁</Link>
          </Button>
          <Button asChild>
            <Link href="/login">前往登入</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
