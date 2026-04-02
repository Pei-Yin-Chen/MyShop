"use client";

import Link from "next/link";
import Image from "next/image";
import { Trash2, Minus, Plus, ArrowLeft, ShoppingBag } from "lucide-react";
import { useCart } from "@/lib/cart-context";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Footer } from "@/components/Footer";

export default function CartPage() {
  const { items, removeItem, updateQuantity, totalPrice, totalItems } = useCart();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <main className="flex-grow">
        <div className="container mx-auto px-4 py-10 lg:py-16">
          <div className="mb-8 flex items-center justify-between">
            <h1 className="text-3xl font-bold tracking-tight text-foreground">購物車</h1>
            <span className="text-sm text-muted-foreground">
              共 {totalItems} 件商品
            </span>
          </div>

          {items.length === 0 ? (
            <div className="flex flex-col items-center justify-center rounded-3xl border border-dashed border-border bg-muted/20 py-20 text-center">
              <div className="mb-4 rounded-full bg-muted p-4">
                <ShoppingBag className="size-8 text-muted-foreground" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-foreground">您的購物車是空的</h2>
              <p className="mb-8 text-muted-foreground">快去挑選一些美味的烘焙點心吧！</p>
              <Button size="lg" className="rounded-full" nativeButton={false} render={<Link href="/products" />}>
                開始購物
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-10 lg:grid-cols-[1fr_350px]">
              {/* 商品列表 */}
              <div className="space-y-6">
                <div className="hidden border-b border-border pb-4 text-sm font-medium text-muted-foreground sm:grid sm:grid-cols-[1fr_120px_120px_40px] sm:gap-4">
                  <div>商品資訊</div>
                  <div className="text-center">數量</div>
                  <div className="text-right">小計</div>
                  <div></div>
                </div>

                <ul className="divide-y divide-border/60">
                  {items.map((item) => (
                    <li key={item.id} className="py-6 sm:grid sm:grid-cols-[1fr_120px_120px_40px] sm:items-center sm:gap-4">
                      {/* 商品基本資訊 */}
                      <div className="flex gap-4">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl border border-border bg-muted/20 sm:size-24">
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex flex-col justify-center">
                          <Link href={`/products/${item.id}`} className="font-semibold text-foreground hover:text-primary transition-colors">
                            {item.name}
                          </Link>
                          <p className="mt-1 text-sm text-muted-foreground">
                            NT$ {item.price}
                          </p>
                        </div>
                      </div>

                      {/* 數量選擇器 */}
                      <div className="mt-4 flex justify-center sm:mt-0">
                        <div className="flex h-9 items-center rounded-full border border-border bg-card px-1 shadow-sm">
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            disabled={item.quantity <= 1}
                            className="rounded-full"
                            aria-label={`減少「${item.name}」數量`}
                            title="減少數量"
                          >
                            <Minus className="size-3" aria-hidden />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium tabular-nums">
                            {item.quantity}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon-xs"
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            disabled={
                              item.stockQuantity !== undefined
                                ? item.quantity >=
                                  Math.min(99, Math.max(0, item.stockQuantity))
                                : item.quantity >= 99
                            }
                            className="rounded-full"
                            aria-label={`增加「${item.name}」數量`}
                            title="增加數量"
                          >
                            <Plus className="size-3" aria-hidden />
                          </Button>
                        </div>
                      </div>

                      {/* 小計 */}
                      <div className="mt-2 text-right font-medium text-foreground sm:mt-0 tabular-nums">
                        NT$ {item.price * item.quantity}
                      </div>

                      {/* 刪除按鈕 */}
                      <div className="mt-4 flex justify-end sm:mt-0 sm:justify-center">
                        <Button
                          variant="ghost"
                          size="icon-sm"
                          onClick={() => removeItem(item.id)}
                          className="rounded-full text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          aria-label={`從購物車移除「${item.name}」`}
                          title="移除此商品"
                        >
                          <Trash2 className="size-4" aria-hidden />
                        </Button>
                      </div>
                    </li>
                  ))}
                </ul>

                <div className="pt-4">
                  <Button variant="ghost" className="rounded-full text-muted-foreground hover:text-foreground" nativeButton={false} render={<Link href="/products" />}>
                    <ArrowLeft className="mr-2 size-4" />
                    繼續購物
                  </Button>
                </div>
              </div>

              {/* 訂單摘要 */}
              <aside className="h-fit space-y-6 rounded-3xl border border-border bg-card/50 p-6 shadow-sm backdrop-blur-sm">
                <h2 className="text-xl font-semibold text-foreground">訂單摘要</h2>
                
                <div className="space-y-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">商品總計 ({totalItems} 件)</span>
                    <span className="font-medium text-foreground tabular-nums">NT$ {totalPrice}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">運費</span>
                    <span className="font-medium text-foreground">結帳時計算</span>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between text-base font-bold">
                    <span>總計</span>
                    <span className="text-primary tabular-nums">NT$ {totalPrice}</span>
                  </div>
                </div>

                <Button size="lg" className="h-11 w-full rounded-full font-semibold shadow-md shadow-primary/10" render={<Link href="/checkout" />} nativeButton={false}>
                  前往結帳
                </Button>

                <div className="rounded-xl bg-muted/30 p-4 text-xs text-muted-foreground leading-relaxed">
                  <p>• 訂單成立後將於 3-5 個工作天內出爐配送。</p>
                  <p className="mt-1">• 為了確保品質，部分品項僅限低溫宅配。</p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
