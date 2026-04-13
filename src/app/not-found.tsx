import Link from "next/link";
import type { Metadata } from "next";

import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "找不到頁面",
};

export default async function NotFound() {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex flex-1 flex-col items-center justify-center px-4 py-16 text-center">
        <p className="text-primary font-heading text-5xl font-semibold tracking-tight tabular-nums">
          404
        </p>
        <h1 className="text-foreground mt-3 text-2xl font-semibold tracking-tight">
          找不到頁面
        </h1>
        <p className="text-muted-foreground mt-2 max-w-md text-pretty text-sm leading-relaxed">
          您要尋找的頁面不存在或已移動。請確認網址是否正確，或從首頁重新瀏覽。
        </p>
        <div className="mt-8">
          <Button
            size="lg"
            className="rounded-full"
            nativeButton={false}
            render={<Link href="/" />}
          >
            返回首頁
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
}
