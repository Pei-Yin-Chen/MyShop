"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { CheckCircle2, ShoppingBag, ArrowRight, ChevronRight, MapPin, Calendar, CreditCard } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export default function SuccessPage() {
  const [orderInfo, setOrderInfo] = useState<{
    id: string;
    date: string;
    total: number;
    items: any[];
  } | null>(null);

  useEffect(() => {
    // 從 sessionStorage 獲取剛才完成的訂單資訊（模擬）
    const savedOrder = sessionStorage.getItem("lastOrder");
    if (savedOrder) {
      setOrderInfo(JSON.parse(savedOrder));
    }
  }, []);

  if (!orderInfo) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Navbar />
        <main className="flex-grow flex items-center justify-center py-20">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">找不到訂單資訊</h2>
            <Button render={<Link href="/products" />} nativeButton={false}>回到商店</Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      
      <main className="flex-grow">
        <div className="container max-w-3xl mx-auto px-4 py-12 lg:py-20">
          {/* 成功頭部 */}
          <div className="text-center mb-12">
            <div className="mb-6 flex justify-center">
              <div className="rounded-full bg-primary/10 p-4 animate-in zoom-in duration-500">
                <CheckCircle2 className="size-12 text-primary" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-foreground mb-3">感謝您的訂購！</h1>
            <p className="text-muted-foreground leading-relaxed">
              我們已收到您的訂單，並發送確認信至您的電子郵件。
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8">
            {/* 訂單基本資訊 */}
            <Card className="border-border/60 shadow-sm overflow-hidden">
              <CardHeader className="bg-muted/30 border-b border-border/60 py-4">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2">
                    訂單編號：<span className="text-primary">#{orderInfo.id}</span>
                  </CardTitle>
                  <span className="text-sm text-muted-foreground">{orderInfo.date}</span>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <div className="p-6 space-y-6">
                  {/* 商品清單 */}
                  <div className="space-y-4">
                    {orderInfo.items.map((item) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-border bg-muted/20">
                          <Image src={item.image} alt={item.name} fill className="object-cover" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h4 className="text-sm font-medium text-foreground truncate">{item.name}</h4>
                          <p className="text-xs text-muted-foreground">數量：{item.quantity}</p>
                        </div>
                        <p className="text-sm font-medium text-foreground tabular-nums">
                          NT$ {item.price * item.quantity}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  {/* 金額總計 */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">訂單總額</span>
                      <span className="font-medium text-foreground tabular-nums">NT$ {orderInfo.total}</span>
                    </div>
                    <div className="flex justify-between text-base font-bold pt-2">
                      <span>付款金額</span>
                      <span className="text-primary tabular-nums">NT$ {orderInfo.total}</span>
                    </div>
                  </div>
                </div>

                {/* 狀態標籤 */}
                <div className="bg-primary/5 px-6 py-4 flex items-center justify-between border-t border-primary/10">
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <CreditCard className="size-4" />
                    付款狀態：已授權 / 待入帳
                  </div>
                  <div className="flex items-center gap-2 text-sm text-primary font-medium">
                    <ShoppingBag className="size-4" />
                    訂單狀態：處理中
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 配送資訊卡片 */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-full bg-muted p-2 shrink-0">
                    <MapPin className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">配送資訊</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      依您選擇的配送方式，預計於 3-5 個工作天內送達指定地址或門市。
                    </p>
                  </div>
                </CardContent>
              </Card>
              <Card className="border-border/60 shadow-sm">
                <CardContent className="p-6 flex items-start gap-4">
                  <div className="rounded-full bg-muted p-2 shrink-0">
                    <Calendar className="size-5 text-muted-foreground" />
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm mb-1">後續追蹤</h4>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      您可以隨時登入會員中心查看訂單進度，或透過電子郵件中的連結追蹤。
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* 操作按鈕 */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="rounded-full flex-1 font-semibold" render={<Link href="/products" />} nativeButton={false}>
                繼續購物
                <ArrowRight className="ml-2 size-4" />
              </Button>
              <Button size="lg" variant="outline" className="rounded-full flex-1 font-medium" render={<Link href="/" />} nativeButton={false}>
                回到首頁
              </Button>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
