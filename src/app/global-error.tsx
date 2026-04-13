"use client";

import Link from "next/link";
import { useEffect } from "react";
import { Geist } from "next/font/google";

import "./globals.css";
import { Button } from "@/components/ui/button";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <html lang="zh-Hant" className={`${geistSans.variable} h-full antialiased`}>
      <body className="bg-background text-foreground flex min-h-full flex-col">
        <div className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
          <p className="text-primary font-heading text-5xl font-semibold tracking-tight tabular-nums">
            500
          </p>
          <h1 className="mt-3 text-2xl font-semibold tracking-tight">
            發生錯誤
          </h1>
          <p className="text-muted-foreground mt-2 max-w-md text-pretty text-sm leading-relaxed">
            系統暫時無法處理您的請求。請稍後再試，或重新載入此頁面。
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button size="lg" className="rounded-full" type="button" onClick={() => reset()}>
              重新載入
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="rounded-full"
              nativeButton={false}
              render={<Link href="/" />}
            >
              返回首頁
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
